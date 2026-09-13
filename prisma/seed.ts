import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@notixcloud.com" },
    update: {},
    create: {
      email: "admin@notixcloud.com",
      passwordHash: adminPassword,
      name: "Admin",
      role: "ADMIN",
      balance: 0,
    },
  });

  console.log({ admin });

  const node = await prisma.node.upsert({
    where: { id: "default-node" },
    update: {},
    create: {
      id: "default-node",
      name: "Main Node",
      ip: "127.0.0.1",
      port: 25565,
      daemonPort: 8443,
      apiKey: "CHANGE_ME_TO_SECURE_KEY",
      maxRam: 8192,
      maxDisk: 100000,
      maxCpu: 100,
      totalSlots: 50,
      status: "ONLINE",
    },
  });

  console.log({ node });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
