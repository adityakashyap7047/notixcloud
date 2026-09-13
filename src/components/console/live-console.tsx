"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal, Trash2, Wifi, WifiOff } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface LiveConsoleProps {
  serverId: string;
  status: string;
}

interface ConsoleLine {
  type: string;
  message: string;
  time: string;
}

export function LiveConsole({ serverId, status }: LiveConsoleProps) {
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const [command, setCommand] = useState("");
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [containerId, setContainerId] = useState<string | null>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchServer = async () => {
      try {
        const res = await fetch(`/api/servers/${serverId}`);
        const data = await res.json();
        if (data.dockerContainerId) {
          setContainerId(data.dockerContainerId);
        }
      } catch (error) {
        console.error("Failed to fetch server:", error);
      }
    };

    fetchServer();
  }, [serverId]);

  useEffect(() => {
    if (!containerId) return;

    const newSocket = io(window.location.origin, {
      path: "/api/socketio",
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("[Console] Socket connected");
      setConnected(true);
      newSocket.emit("subscribe:console", containerId);
    });

    newSocket.on("disconnect", () => {
      console.log("[Console] Socket disconnected");
      setConnected(false);
    });

    newSocket.on("console:output", (data: { containerId: string; line: string }) => {
      if (data.containerId === containerId) {
        const time = new Date().toLocaleTimeString();
        setLines((prev) => [
          ...prev,
          { type: "info", message: data.line, time },
        ]);
      }
    });

    newSocket.on("console:error", (data: { containerId: string; error: string }) => {
      if (data.containerId === containerId) {
        const time = new Date().toLocaleTimeString();
        setLines((prev) => [
          ...prev,
          { type: "error", message: `Error: ${data.error}`, time },
        ]);
      }
    });

    newSocket.on("console:command:sent", (data: { containerId: string; command: string }) => {
      if (data.containerId === containerId) {
        const time = new Date().toLocaleTimeString();
        setLines((prev) => [
          ...prev,
          { type: "command", message: `> ${data.command}`, time },
        ]);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("unsubscribe:console", containerId);
      newSocket.disconnect();
    };
  }, [containerId]);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCommand = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!command.trim() || !socket || !containerId) return;

      socket.emit("console:command", {
        containerId,
        command: command.trim(),
      });

      setCommand("");
    },
    [command, socket, containerId]
  );

  const clearConsole = () => {
    setLines([]);
  };

  const getLineColor = (type: string) => {
    switch (type) {
      case "command":
        return "text-blue-400";
      case "error":
        return "text-red-400";
      case "warn":
        return "text-amber-400";
      case "success":
        return "text-green-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-500" />
            <CardTitle>Console</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={connected ? "success" : "danger"}>
              {connected ? (
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Disconnected
                </span>
              )}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConsole}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={consoleRef}
          className="h-96 overflow-y-auto mb-4 bg-slate-900 rounded-xl p-4 font-mono text-sm"
        >
          {lines.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500 text-sm">
                {status === "RUNNING"
                  ? connected
                    ? "Console connected. Waiting for output..."
                    : "Connecting to console..."
                  : "Start the server to see console output"}
              </p>
            </div>
          ) : (
            lines.map((line, i) => (
              <div
                key={i}
                className={`py-0.5 ${getLineColor(line.type)}`}
              >
                <span className="text-slate-600 mr-2">[{line.time}]</span>
                {line.message}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleCommand} className="flex gap-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command..."
            className="flex-1 font-mono"
            disabled={status !== "RUNNING" || !connected}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={status !== "RUNNING" || !connected}
          >
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
