"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { LiveConsole } from "@/components/console/live-console";
import { FileManager } from "@/components/server/file-manager";
import { PlayerList } from "@/components/server/player-list";
import { ServerSidebar } from "@/components/server/server-sidebar";
import {
  Play,
  Square,
  RotateCcw,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

export default function ServerDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [server, setServer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("console");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && params.id) {
      fetchServer();
    }
  }, [status, params.id]);

  const fetchServer = async () => {
    try {
      const res = await fetch(`/api/servers/${params.id}`);
      if (!res.ok) {
        router.push("/servers");
        return;
      }
      const data = await res.json();
      setServer(data);
    } catch (error) {
      console.error("Failed to fetch server:", error);
      router.push("/servers");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      await fetch(`/api/servers/${server.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      // Poll for status update
      setTimeout(fetchServer, 1000);
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(
      `${server.node?.ip || "0.0.0.0"}:${server.port}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this server? This cannot be undone.")) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/servers/${server.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/servers");
      }
    } catch (error) {
      console.error("Failed to delete server:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading || !server) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div
              className="spinner mx-auto mb-4"
              style={{ width: 40, height: 40, borderWidth: 3 }}
            />
            <p className="text-sm text-zinc-400 font-medium">
              Loading server...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const isRunning = server.status === "RUNNING";
  const isStarting = server.status === "STARTING";
  const isOffline = server.status === "OFFLINE" || server.status === "ERROR";

  const tabs = [
    {
      id: "console",
      label: "Console",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      ),
    },
    {
      id: "files",
      label: "Files",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
          />
        </svg>
      ),
    },
    {
      id: "players",
      label: "Players",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
      ),
    },
    {
      id: "backups",
      label: "Backups",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375"
          />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-0">
        {/* Server header */}
        <div
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6"
          style={{ animation: "fadeInDown 0.6s ease-out" }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/servers")}
              className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-xl"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
                  {server.name}
                </h1>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isRunning
                        ? "bg-green-500"
                        : isStarting
                        ? "bg-yellow-500 animate-pulse"
                        : "bg-zinc-600"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isRunning
                        ? "text-green-400"
                        : isStarting
                        ? "text-yellow-400"
                        : "text-zinc-500"
                    }`}
                  >
                    {server.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-sm text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
                    />
                  </svg>
                  {server.type === "paper" || server.type === "spigot" || server.type === "purpur" || server.type === "vanilla" || server.type === "forge" || server.type === "fabric" ? "Minecraft Java" : "Minecraft Bedrock"}
                </span>
                <span>v{server.version}</span>
                <span>{server.allocatedRam}MB RAM</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Server address */}
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 bg-[#161b22] border border-[#21262d] rounded-lg px-4 py-2.5 hover:border-[#30363d] transition-colors group"
            >
              <div className="text-left">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  Server Address
                </p>
                <p className="text-sm text-zinc-200 font-mono font-medium">
                  {server.node?.ip || "0.0.0.0"}
                  <span className="text-zinc-500">:{server.port}</span>
                </p>
              </div>
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              )}
            </button>

            {/* Control buttons */}
            <div className="flex items-center gap-2">
              {isOffline ? (
                <button
                  onClick={() => handleAction("start")}
                  disabled={actionLoading === "start"}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50"
                >
                  {actionLoading === "start" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Start
                </button>
              ) : isRunning ? (
                <>
                  <button
                    onClick={() => handleAction("restart")}
                    disabled={actionLoading === "restart"}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50"
                  >
                    {actionLoading === "restart" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Restart
                  </button>
                  <button
                    onClick={() => handleAction("stop")}
                    disabled={actionLoading === "stop"}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600/80 hover:bg-red-500 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50"
                  >
                    {actionLoading === "stop" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Stop
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  <span className="text-sm text-zinc-400">{server.status}...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs bar */}
        <div
          className="bg-[#0d1117] rounded-xl border border-[#21262d] p-1 mb-6"
          style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}
        >
          <div className="flex gap-0.5 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#21262d] text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-[#161b22]"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content area: Console + Sidebar OR other tabs */}
        {activeTab === "console" ? (
          <div
            className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6"
            style={{ animation: "fadeInUp 0.6s ease-out 0.15s both" }}
          >
            <LiveConsole serverId={server.id} status={server.status} />
            <ServerSidebar server={server} />
          </div>
        ) : activeTab === "files" ? (
          <div style={{ animation: "fadeInUp 0.6s ease-out 0.15s both" }}>
            <FileManager serverId={server.id} />
          </div>
        ) : activeTab === "players" ? (
          <div style={{ animation: "fadeInUp 0.6s ease-out 0.15s both" }}>
            <PlayerList serverId={server.id} />
          </div>
        ) : activeTab === "backups" ? (
          <div
            className="bg-[#0d1117] rounded-xl border border-[#21262d] p-6"
            style={{ animation: "fadeInUp 0.6s ease-out 0.15s both" }}
          >
            <h3 className="text-lg font-bold text-white mb-4">Backups</h3>
            {server.backups?.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-zinc-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375"
                  />
                </svg>
                <p className="text-zinc-500 text-sm">No backups yet</p>
                <p className="text-zinc-600 text-xs mt-1">
                  Create a backup from the server console
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {server.backups?.map((backup: any) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-4 bg-[#161b22] rounded-xl border border-[#21262d] hover:border-[#30363d] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">
                        {backup.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(backup.createdAt).toLocaleDateString()} &middot;{" "}
                        {(backup.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded-lg transition-colors">
                        Restore
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded-lg transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "settings" ? (
          <div
            className="bg-[#0d1117] rounded-xl border border-[#21262d] p-6"
            style={{ animation: "fadeInUp 0.6s ease-out 0.15s both" }}
          >
            <h3 className="text-lg font-bold text-white mb-6">Server Settings</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="p-4 bg-[#161b22] rounded-xl border border-[#21262d]">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">
                  Server Name
                </p>
                <p className="text-sm text-zinc-200 font-medium">{server.name}</p>
              </div>
              <div className="p-4 bg-[#161b22] rounded-xl border border-[#21262d]">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">
                  Version
                </p>
                <p className="text-sm text-zinc-200 font-medium">
                  {server.version}
                </p>
              </div>
              <div className="p-4 bg-[#161b22] rounded-xl border border-[#21262d]">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">
                  Port
                </p>
                <p className="text-sm text-zinc-200 font-mono">{server.port}</p>
              </div>
              <div className="p-4 bg-[#161b22] rounded-xl border border-[#21262d]">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">
                  Allocated RAM
                </p>
                <p className="text-sm text-zinc-200 font-medium">
                  {server.allocatedRam} MB
                </p>
              </div>
              <div className="p-4 bg-[#161b22] rounded-xl border border-[#21262d]">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">
                  Allocated Disk
                </p>
                <p className="text-sm text-zinc-200 font-medium">
                  {(server.allocatedDisk / 1024).toFixed(1)} GB
                </p>
              </div>
              <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                <p className="text-sm font-medium text-red-400 mb-2">Danger Zone</p>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Delete Server"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
