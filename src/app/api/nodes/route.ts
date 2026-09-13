import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, ip, port, daemonPort, maxRam, maxDisk, maxCpu, totalSlots } =
      await req.json();

    if (!name || !ip) {
      return NextResponse.json(
        { error: "Name and IP are required" },
        { status: 400 }
      );
    }

    const apiKey = `nx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

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
        status: "OFFLINE",
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
