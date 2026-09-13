import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createServer as createDockerServer,
  getContainerStatus,
} from "@/lib/docker";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const servers = await db.server.findMany({
      where: { userId: (session.user as any).id },
      include: { node: true },
      orderBy: { createdAt: "desc" },
    });

    for (const server of servers) {
      if (server.dockerContainerId) {
        const dockerStatus = await getContainerStatus(server.dockerContainerId);
        const newStatus = dockerStatus.running ? "RUNNING" : "OFFLINE";

        if (server.status !== newStatus) {
          await db.server.update({
            where: { id: server.id },
            data: { status: newStatus as any },
          });
          server.status = newStatus;
        }
      }
    }

    return NextResponse.json(servers);
  } catch (error) {
    console.error("Get servers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, nodeId, version, type } = await req.json();

    if (!name || !nodeId) {
      return NextResponse.json(
        { error: "Name and node are required" },
        { status: 400 }
      );
    }

    const node = await db.node.findUnique({ where: { id: nodeId } });
    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    const usedPorts = await db.server.findMany({
      where: { nodeId },
      select: { port: true },
    });
    const maxPort =
      usedPorts.length > 0
        ? Math.max(...usedPorts.map((p) => p.port))
        : node.port - 1;
    const newPort = maxPort + 1;

    const imageMap: Record<string, string> = {
      paper: "itzg/minecraft-server:paper",
      spigot: "itzg/minecraft-server:spigot",
      purpur: "itzg/minecraft-server:purpur",
      vanilla: "itzg/minecraft-server:vanilla",
      forge: "itzg/minecraft-server:forge",
      fabric: "itzg/minecraft-server:fabric",
      bungeecord: "itzg/minecraft-server:bungeecord",
      velocity: "itzg/minecraft-server:velocity",
    };

    const image = imageMap[type || "paper"] || imageMap.paper;

    let dockerContainerId: string | null = null;

    try {
      dockerContainerId = await createDockerServer({
        name,
        image,
        port: newPort,
        ram: 2048,
        cpu: 50,
        env: [
          `EULA=TRUE`,
          `VERSION=${version || "1.20.4"}`,
          `TYPE=${(type || "paper").toUpperCase()}`,
          `MEMORY=2G`,
        ],
        volumes: [
          `/opt/minecraft/data/${name}:/data`,
        ],
      });
    } catch (dockerError: any) {
      console.error("Docker creation failed:", dockerError);
      return NextResponse.json(
        { error: `Failed to create server container: ${dockerError.message}` },
        { status: 500 }
      );
    }

    const server = await db.server.create({
      data: {
        name,
        userId: (session.user as any).id,
        nodeId,
        port: newPort,
        dockerContainerId,
        version: version || "1.20.4",
        type: type || "paper",
        allocatedRam: 2048,
        allocatedDisk: 10240,
        allocatedCpu: 50,
        status: dockerContainerId ? "RUNNING" : "OFFLINE",
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("Create server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
