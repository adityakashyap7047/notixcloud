import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const nodes = await db.node.findMany({
      include: {
        _count: { select: { servers: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(nodes);
  } catch (error) {
    console.error("Get nodes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, ip, port, daemonPort, apiKey, maxRam, maxDisk, maxCpu, totalSlots } =
      await req.json();

    if (!name || !ip || !apiKey) {
      return NextResponse.json(
        { error: "Name, IP, and API key are required" },
        { status: 400 }
      );
    }

    const node = await db.node.create({
      data: {
        name,
        ip,
        port: port || 25565,
        daemonPort: daemonPort || 8443,
        apiKey,
        maxRam: maxRam || 8192,
        maxDisk: maxDisk || 100000,
        maxCpu: maxCpu || 100,
        totalSlots: totalSlots || 50,
        status: "ONLINE",
      },
    });

    return NextResponse.json(node);
  } catch (error) {
    console.error("Create node error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nodeId, status, maxRam, maxDisk, maxCpu, totalSlots } =
      await req.json();

    if (!nodeId) {
      return NextResponse.json(
        { error: "Node ID is required" },
        { status: 400 }
      );
    }

    const node = await db.node.update({
      where: { id: nodeId },
      data: {
        status: status || undefined,
        maxRam: maxRam || undefined,
        maxDisk: maxDisk || undefined,
        maxCpu: maxCpu || undefined,
        totalSlots: totalSlots || undefined,
      },
    });

    return NextResponse.json(node);
  } catch (error) {
    console.error("Update node error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
