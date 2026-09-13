import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendCommand, getContainerLogs } from "@/lib/docker";

export async function POST(
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

    if (!server.dockerContainerId) {
      return NextResponse.json(
        { error: "Server container not found" },
        { status: 400 }
      );
    }

    const { command } = await req.json();

    if (!command) {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 }
      );
    }

    const output = await sendCommand(server.dockerContainerId, command);

    return NextResponse.json({ output });
  } catch (error) {
    console.error("Send command error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    if (!server.dockerContainerId) {
      return NextResponse.json({ logs: [] });
    }

    const url = new URL(req.url);
    const tail = parseInt(url.searchParams.get("tail") || "100");

    const logs = await getContainerLogs(server.dockerContainerId, tail);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Get console logs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
