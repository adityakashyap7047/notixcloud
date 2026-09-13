import { createServer } from "http";
import { parse } from "url";
import { Readable } from "stream";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import Docker from "dockerode";
import jwt from "jsonwebtoken";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const docker = process.env.DOCKER_HOST
  ? new Docker({ socketPath: process.env.DOCKER_HOST })
  : null;

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [process.env.NEXTAUTH_URL || `http://localhost:${port}`];

const BLOCKED_COMMANDS = [
  "rm -rf /",
  "mkfs",
  ":(){:|:&};:",
  "dd if=/dev/zero",
  "dd if=/dev/random",
  "> /dev/sda",
  "chmod -R 777 /",
  "wget http",
  "curl http",
  "nc -",
  "bash -i",
  "sh -i",
  "python -c",
  "perl -e",
  "ruby -e",
  "node -e",
];

function isCommandBlocked(command: string): boolean {
  const lower = command.toLowerCase().trim();
  return BLOCKED_COMMANDS.some((blocked) => lower.includes(blocked));
}

function verifySocketAuth(socket: any): boolean {
  const token =
    socket.handshake?.auth?.token ||
    socket.handshake?.query?.token;

  if (!token || !NEXTAUTH_SECRET) return false;

  try {
    jwt.verify(token, NEXTAUTH_SECRET);
    return true;
  } catch {
    return false;
  }
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url!, true);
    await handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(server, {
    path: "/api/socketio",
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    if (verifySocketAuth(socket)) {
      next();
    } else {
      next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    console.log("[Socket.IO] Authenticated client connected:", socket.id);

    socket.on("subscribe:console", async (containerId: string) => {
      if (!containerId || typeof containerId !== "string") return;

      console.log(`[Socket.IO] Subscribing to console: ${containerId}`);
      const room = `console:${containerId}`;
      socket.join(room);

      try {
        const container = docker.getContainer(containerId);
        const logs = await container.logs({
          stdout: true,
          stderr: true,
          tail: 100,
          timestamps: true,
        });

        const lines = logs.toString().split("\n").filter(Boolean);
        lines.forEach((line) => {
          socket.emit("console:output", { containerId, line });
        });

        const logStream = await container.logs({
          stdout: true,
          stderr: true,
          follow: true,
          since: Math.floor(Date.now() / 1000),
        }) as unknown as Readable;

        logStream.on("data", (chunk: Buffer) => {
          const output = chunk.toString();
          const lines = output.split("\n").filter(Boolean);
          lines.forEach((line) => {
            io.to(room).emit("console:output", { containerId, line });
          });
        });

        logStream.on("error", (err: Error) => {
          console.error("[Socket.IO] Log stream error:", err);
          io.to(room).emit("console:error", {
            containerId,
            error: err.message,
          });
        });

        socket.on("disconnect", () => {
          logStream.destroy();
        });
      } catch (error: any) {
        console.error("[Socket.IO] Failed to subscribe to console:", error);
        socket.emit("console:error", {
          containerId,
          error: error.message,
        });
      }
    });

    socket.on("unsubscribe:console", (containerId: string) => {
      if (typeof containerId === "string") {
        socket.leave(`console:${containerId}`);
      }
    });

    socket.on("console:command", async (data: {
      containerId: string;
      command: string;
    }) => {
      if (
        !data?.containerId ||
        !data?.command ||
        typeof data.containerId !== "string" ||
        typeof data.command !== "string"
      ) {
        return;
      }

      if (isCommandBlocked(data.command)) {
        socket.emit("console:error", {
          containerId: data.containerId,
          error: "Command blocked by security policy",
        });
        return;
      }

      try {
        const container = docker.getContainer(data.containerId);
        const exec = await container.exec({
          Cmd: ["/bin/sh", "-c", data.command],
          AttachStdout: true,
          AttachStderr: true,
        });

        const stream = await exec.start({ Detach: false });
        const room = `console:${data.containerId}`;

        stream.on("data", (chunk: Buffer) => {
          const output = chunk.toString();
          const lines = output.split("\n").filter(Boolean);
          lines.forEach((line) => {
            io.to(room).emit("console:output", {
              containerId: data.containerId,
              line,
            });
          });
        });

        stream.on("end", () => {
          io.to(room).emit("console:command:sent", {
            containerId: data.containerId,
            command: data.command,
          });
        });
      } catch (error: any) {
        io.to(`console:${data.containerId}`).emit("console:error", {
          containerId: data.containerId,
          error: error.message,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("[Socket.IO] Client disconnected:", socket.id);
    });
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on /api/socketio`);
  });
});
