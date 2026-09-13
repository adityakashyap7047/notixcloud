import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  startServer,
  stopServer,
  restartServer,
  removeServer,
  getContainerStats,
  getContainerLogs,
  getContainerStatus,
  sendCommand,
} from "@/lib/docker";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const server = await db.server.findUnique({
      where: { id },
      include: { node: true, backups: true },
    });

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    if (
      server.userId !== (session.user as any).id &&
      (session.user as any).role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (server.dockerContainerId) {
      const dockerStatus = await getContainerStatus(server.dockerContainerId);
      const newStatus = dockerStatus.running ? "RUNNING" : "OFFLINE";

      if (server.status !== newStatus) {
        await db.server.update({
          where: { id },
          data: { status: newStatus as any },
        });
        server.status = newStatus;
      }

      if (dockerStatus.running) {
        const stats = await getContainerStats(server.dockerContainerId);
        return NextResponse.json({ ...server, stats });
      }
    }

    return NextResponse.json(server);
  } catch (error) {
    console.error("Get server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const server = await db.server.findUnique({ where: { id } });

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    if (
      server.userId !== (session.user as any).id &&
      (session.user as any).role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "start" || action === "stop" || action === "restart") {
      if (!server.dockerContainerId) {
        return NextResponse.json(
          { error: "Server container not found" },
          { status: 400 }
        );
      }

      try {
        if (action === "start") {
          await db.server.update({
            where: { id },
            data: { status: "STARTING" as any },
          });

          await startServer(server.dockerContainerId);
          await db.server.update({
            where: { id },
            data: { status: "RUNNING" as any },
          });
        } else if (action === "stop") {
          await db.server.update({
            where: { id },
            data: { status: "STOPPING" as any },
          });

          await stopServer(server.dockerContainerId);
          await db.server.update({
            where: { id },
            data: { status: "OFFLINE" as any },
          });
        } else if (action === "restart") {
          await db.server.update({
            where: { id },
            data: { status: "STARTING" as any },
          });

          await restartServer(server.dockerContainerId);
          await db.server.update({
            where: { id },
            data: { status: "RUNNING" as any },
          });
        }
      } catch (dockerError: any) {
        console.error(`Docker ${action} failed:`, dockerError);
        await db.server.update({
          where: { id },
          data: { status: "ERROR" as any },
        });

        return NextResponse.json(
          { error: `Failed to ${action} server: ${dockerError.message}` },
          { status: 500 }
        );
      }

      const updated = await db.server.findUnique({ where: { id } });
      return NextResponse.json(updated);
    }

    if (action === "command") {
      if (!server.dockerContainerId) {
        return NextResponse.json(
          { error: "Server container not found" },
          { status: 400 }
        );
      }

      const { command } = body;
      if (!command) {
        return NextResponse.json(
          { error: "Command is required" },
          { status: 400 }
        );
      }

      const output = await sendCommand(server.dockerContainerId, command);
      return NextResponse.json({ output });
    }

    if (action === "stats") {
      if (!server.dockerContainerId) {
        return NextResponse.json({ stats: { cpu: 0, memory: 0, memoryUsage: 0, memoryLimit: 0 } });
      }

      const stats = await getContainerStats(server.dockerContainerId);
      return NextResponse.json({ stats });
    }

    if (action === "logs") {
      if (!server.dockerContainerId) {
        return NextResponse.json({ logs: [] });
      }

      const { tail } = body;
      const logs = await getContainerLogs(server.dockerContainerId, tail || 100);
      return NextResponse.json({ logs });
    }

    const updated = await db.server.update({
      where: { id },
      data: {
        name: body.name || undefined,
        allocatedRam: body.allocatedRam || undefined,
        allocatedDisk: body.allocatedDisk || undefined,
        allocatedCpu: body.allocatedCpu || undefined,
        version: body.version || undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const server = await db.server.findUnique({ where: { id } });

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    if (
      server.userId !== (session.user as any).id &&
      (session.user as any).role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (server.dockerContainerId) {
      try {
        await removeServer(server.dockerContainerId);
      } catch (dockerError: any) {
        console.error("Docker removal failed:", dockerError);
      }
    }

    await db.server.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
