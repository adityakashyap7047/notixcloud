"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface LiveConsoleProps {
  serverId: string;
  status: string;
}

interface ConsoleLine {
  id: number;
  type: "output" | "command" | "error" | "system";
  message: string;
  timestamp: string;
}

const ANSI_COLORS: Record<string, string> = {
  "30": "text-black",
  "31": "text-red-400",
  "32": "text-green-400",
  "33": "text-yellow-400",
  "34": "text-blue-400",
  "35": "text-fuchsia-400",
  "36": "text-cyan-400",
  "37": "text-white",
  "90": "text-zinc-500",
  "91": "text-red-300",
  "92": "text-green-300",
  "93": "text-yellow-300",
  "94": "text-blue-300",
  "95": "text-fuchsia-300",
  "96": "text-cyan-300",
  "97": "text-white",
};

function parseAnsi(text: string): React.ReactNode[] {
  const regex = /\x1b\[([0-9;]*)m/g;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let currentColor = "";
  let key = 0;

  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      const segment = text.slice(lastIdx, match.index);
      if (segment) {
        parts.push(
          <span key={key++} className={currentColor || "text-zinc-300"}>
            {segment}
          </span>
        );
      }
    }

    const codes = match[1].split(";");
    for (const code of codes) {
      if (code === "0" || code === "") {
        currentColor = "";
      } else if (ANSI_COLORS[code]) {
        currentColor = ANSI_COLORS[code];
      }
    }

    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    parts.push(
      <span key={key++} className={currentColor || "text-zinc-300"}>
        {text.slice(lastIdx)}
      </span>
    );
  }

  if (parts.length === 0) {
    parts.push(
      <span key={key++} className="text-zinc-300">
        {text}
      </span>
    );
  }

  return parts;
}

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

export function LiveConsole({ serverId, status }: LiveConsoleProps) {
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const [command, setCommand] = useState("");
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [containerId, setContainerId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const consoleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lineIdRef = useRef(0);

  // Fetch container ID
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

  // Socket connection
  useEffect(() => {
    if (!containerId) return;

    const newSocket = io(window.location.origin, {
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      auth: { token: document.cookie.match(/next-auth.session-token=([^;]+)/)?.[1] || "" },
    });

    newSocket.on("connect", () => {
      setConnected(true);
      newSocket.emit("subscribe:console", containerId);
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    newSocket.on(
      "console:output",
      (data: { containerId: string; line: string }) => {
        if (data.containerId === containerId) {
          const clean = stripAnsi(data.line);
          const isCommand = clean.startsWith("container@pterodactyl~");
          const ts = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setLines((prev) => [
            ...prev,
            {
              id: lineIdRef.current++,
              type: isCommand ? "command" : "output",
              message: data.line,
              timestamp: ts,
            },
          ]);
        }
      }
    );

    newSocket.on(
      "console:error",
      (data: { containerId: string; error: string }) => {
        if (data.containerId === containerId) {
          const ts = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setLines((prev) => [
            ...prev,
            {
              id: lineIdRef.current++,
              type: "error",
              message: `[ERROR] ${data.error}`,
              timestamp: ts,
            },
          ]);
        }
      }
    );

    newSocket.on(
      "console:command:sent",
      (data: { containerId: string; command: string }) => {
        if (data.containerId === containerId) {
          const ts = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setLines((prev) => [
            ...prev,
            {
              id: lineIdRef.current++,
              type: "command",
              message: data.command,
              timestamp: ts,
            },
          ]);
        }
      }
    );

    setSocket(newSocket);

    return () => {
      newSocket.emit("unsubscribe:console", containerId);
      newSocket.disconnect();
    };
  }, [containerId]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [lines, autoScroll]);

  // Detect scroll position
  const handleScroll = useCallback(() => {
    if (!consoleRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = consoleRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  }, []);

  // Send command
  const handleCommand = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!command.trim() || !socket || !containerId) return;

      socket.emit("console:command", {
        containerId,
        command: command.trim(),
      });

      setCommandHistory((prev) => [...prev, command.trim()]);
      setHistoryIndex(-1);
      setCommand("");
    },
    [command, socket, containerId]
  );

  // Command history navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const newIndex =
          historyIndex < commandHistory.length - 1
            ? historyIndex + 1
            : historyIndex;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex] || "");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
        setHistoryIndex(newIndex);
        setCommand(
          newIndex >= 0
            ? commandHistory[commandHistory.length - 1 - newIndex]
            : ""
        );
      }
    },
    [historyIndex, commandHistory]
  );

  // Copy all output
  const copyOutput = useCallback(() => {
    const text = lines.map((l) => stripAnsi(l.message)).join("\n");
    navigator.clipboard.writeText(text);
  }, [lines]);

  // Clear console
  const clearConsole = useCallback(() => {
    setLines([]);
    lineIdRef.current = 0;
  }, []);

  // Focus input on click
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const isDisabled = status === "OFFLINE" || status === "STOPPING";

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
      {/* Console terminal */}
      <div
        ref={consoleRef}
        onScroll={handleScroll}
        onClick={focusInput}
        className="flex-1 overflow-y-auto bg-[#0d1117] rounded-t-xl border border-[#21262d] border-b-0 p-4 font-mono text-[13px] leading-[1.6] cursor-text select-text"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#30363d #0d1117",
        }}
      >
        {lines.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-zinc-600 mb-2">
                <svg
                  className="w-10 h-10 mx-auto mb-3 opacity-40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <p className="text-zinc-500 text-sm">
                {isDisabled
                  ? "Start the server to see console output"
                  : connected
                  ? "Console connected. Waiting for output..."
                  : "Connecting to console..."}
              </p>
              {!connected && !isDisabled && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-xs text-zinc-600">Connecting...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          lines.map((line) => (
            <div
              key={line.id}
              className={`py-[1px] ${
                line.type === "error"
                  ? "text-red-400"
                  : line.type === "command"
                  ? "text-green-400"
                  : line.type === "system"
                  ? "text-cyan-400"
                  : ""
              }`}
            >
              <span className="text-zinc-600 select-none mr-2 inline-block w-[70px] text-right">
                {line.timestamp}
              </span>
              {line.type === "output" ? (
                <span className="inline">{parseAnsi(line.message)}</span>
              ) : line.type === "command" ? (
                <span className="text-green-400">
                  <span className="text-green-500/70">container@pterodactyl~$ </span>
                  {line.message}
                </span>
              ) : (
                <span
                  className={
                    line.type === "error" ? "text-red-400" : "text-cyan-400"
                  }
                >
                  {line.message}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Command input */}
      <div className="bg-[#0d1117] border border-[#21262d] border-t-0 rounded-b-xl px-4 py-3">
        <form onSubmit={handleCommand} className="flex items-center gap-3">
          <span className="text-green-500 font-mono text-sm select-none">
            &gt;&gt;
          </span>
          <input
            ref={inputRef}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isDisabled
                ? "Server is offline"
                : !connected
                ? "Connecting..."
                : "Type a command..."
            }
            className="flex-1 bg-transparent text-zinc-200 font-mono text-sm outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed"
            disabled={isDisabled || !connected}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={!command.trim() || isDisabled || !connected}
            className="text-zinc-500 hover:text-green-400 disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </button>
        </form>
      </div>

      {/* Console toolbar */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-[11px] text-zinc-500">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <span className="text-zinc-700">|</span>
          <span className="text-[11px] text-zinc-600">
            {lines.length} lines
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded text-[11px] transition-colors ${
              autoScroll
                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            }`}
            title={autoScroll ? "Auto-scroll on" : "Auto-scroll off"}
          >
            Auto-scroll
          </button>

          {/* Word wrap toggle */}
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`px-2 py-1 rounded text-[11px] transition-colors ${
              wordWrap
                ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            }`}
            title={wordWrap ? "Word wrap on" : "Word wrap off"}
          >
            Wrap
          </button>

          {/* Copy */}
          <button
            onClick={copyOutput}
            className="px-2 py-1 rounded text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            title="Copy output"
          >
            Copy
          </button>

          {/* Clear */}
          <button
            onClick={clearConsole}
            className="px-2 py-1 rounded text-[11px] text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
            title="Clear console"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
