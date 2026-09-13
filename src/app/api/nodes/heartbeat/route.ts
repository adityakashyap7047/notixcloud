import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);
    const node = await db.node.findFirst({ where: { apiKey } });

    if (!node) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const { servers } = await req.json();

    await db.node.update({
      where: { id: node.id },
      data: {
        status: "ONLINE",
        updatedAt: new Date(),
      },
    });

    if (servers && Array.isArray(servers)) {
      for (const serverData of servers) {
        const existingServer = await db.server.findFirst({
          where: {
            nodeId: node.id,
            name: serverData.name,
          },
        });

        if (existingServer) {
          await db.server.update({
            where: { id: existingServer.id },
            data: {
              status: serverData.status || existingServer.status,
              dockerContainerId: serverData.containerId || existingServer.dockerContainerId,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, nodeId: node.id });
  } catch (error) {
    console.error("Node heartbeat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);
    const node = await db.node.findFirst({ where: { apiKey } });

    if (!node) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const servers = await db.server.findMany({
      where: { nodeId: node.id },
    });

    return NextResponse.json({
      node: {
        id: node.id,
        name: node.name,
        maxRam: node.maxRam,
        maxDisk: node.maxDisk,
        maxCpu: node.maxCpu,
        totalSlots: node.totalSlots,
      },
      servers,
    });
  } catch (error) {
    console.error("Node get servers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
