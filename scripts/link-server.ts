import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const node = await prisma.node.findFirst({ where: { id: "default-node" } });

  if (!user || !node) {
    console.log("Missing user or node");
    return;
  }

  const existing = await prisma.server.findFirst({ where: { name: "Test Server" } });
  if (existing) {
    console.log("Server already exists:", existing.id);
    return;
  }

  const server = await prisma.server.create({
    data: {
      name: "Test Server",
      userId: user.id,
      nodeId: node.id,
      dockerContainerId: "dcd1ee7fa57b124cd730be7d86923d086f5416cc9d2396e6c196b0d14e8a3415",
      status: "RUNNING",
      type: "paper",
      version: "1.20.4",
      port: 25565,
      allocatedRam: 2048,
      allocatedDisk: 10240,
      allocatedCpu: 50,
    },
  });
  console.log("Server created:", server.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
