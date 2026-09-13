"use client";

import { useState, useEffect } from "react";

interface ServerSidebarProps {
  server: any;
}

interface ServerStats {
  uptime: number;
  cpu: number;
  memory: number;
  memoryMax: number;
  disk: number;
  diskMax: number;
  netIn: number;
  netOut: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

function StatCard({
  icon,
  label,
  value,
  subValue,
  color,
  percentage,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  percentage?: number;
}) {
  return (
    <div className="bg-[#161b22] rounded-xl p-4 border border-[#21262d]">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
            {label}
          </p>
          <p className="text-lg font-bold text-zinc-100 font-mono leading-tight">
            {value}
          </p>
        </div>
      </div>
      {subValue && (
        <p className="text-[11px] text-zinc-500 mb-2">{subValue}</p>
      )}
      {percentage !== undefined && (
        <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage > 90
                ? "bg-red-500"
                : percentage > 70
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ServerSidebar({ server }: ServerSidebarProps) {
  const [stats, setStats] = useState<ServerStats>({
    uptime: 0,
    cpu: 0,
    memory: 0,
    memoryMax: server.allocatedRam || 4096,
    disk: 0,
    diskMax: server.allocatedDisk || 30720,
    netIn: 0,
    netOut: 0,
  });
  const [startTime] = useState(Date.now());

  // Simulate stats (replace with real WebSocket data)
  useEffect(() => {
    if (server.status !== "RUNNING") return;

    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        uptime: Math.floor((Date.now() - startTime) / 1000),
        cpu: Math.min(95, Math.max(0.5, prev.cpu + (Math.random() - 0.5) * 8)),
        memory: Math.min(
          prev.memoryMax,
          Math.max(50, prev.memory + (Math.random() - 0.5) * 50)
        ),
        disk: Math.min(
          prev.diskMax,
          Math.max(10, prev.disk + (Math.random() - 0.3) * 10)
        ),
        netIn: prev.netIn + Math.random() * 50000,
        netOut: prev.netOut + Math.random() * 20000,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [server.status, startTime]);

  // Init some base values
  useEffect(() => {
    if (server.status === "RUNNING") {
      setStats((prev) => ({
        ...prev,
        memory: server.allocatedRam * 0.3,
        disk: server.allocatedDisk * 0.2,
      }));
    }
  }, [server.status, server.allocatedRam, server.allocatedDisk]);

  const cpuPercent = stats.cpu;
  const memPercent = (stats.memory / stats.memoryMax) * 100;
  const diskPercent = (stats.disk / stats.diskMax) * 100;

  return (
    <div className="space-y-3">
      {/* Uptime */}
      <StatCard
        icon={
          <svg
            className="w-5 h-5 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        label="Uptime"
        value={server.status === "RUNNING" ? formatUptime(stats.uptime) : "---"}
        color="bg-green-500/10"
      />

      {/* CPU */}
      <StatCard
        icon={
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        }
        label="CPU Load"
        value={`${cpuPercent.toFixed(2)}%`}
        subValue={`${(cpuPercent * 0.04).toFixed(2)} / 4.00 cores`}
        color="bg-blue-500/10"
        percentage={cpuPercent}
      />

      {/* Memory */}
      <StatCard
        icon={
          <svg
            className="w-5 h-5 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 20.25h12m-7.5-3v6m3-6v6m-10.125-3.75c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125M3.75 13.5h16.5"
            />
          </svg>
        }
        label="Memory"
        value={`${formatBytes(stats.memory * 1024 * 1024)}`}
        subValue={`${formatBytes(stats.memoryMax * 1024 * 1024)}`}
        color="bg-purple-500/10"
        percentage={memPercent}
      />

      {/* Disk */}
      <StatCard
        icon={
          <svg
            className="w-5 h-5 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375"
            />
          </svg>
        }
        label="Disk"
        value={`${formatBytes(stats.disk * 1024 * 1024)}`}
        subValue={`${formatBytes(stats.diskMax * 1024 * 1024)}`}
        color="bg-amber-500/10"
        percentage={diskPercent}
      />

      {/* Network In */}
      <StatCard
        icon={
          <svg
            className="w-5 h-5 text-cyan-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        }
        label="Inbound"
        value={formatBytes(stats.netIn)}
        color="bg-cyan-500/10"
      />

      {/* Network Out */}
      <StatCard
        icon={
          <svg
            className="w-5 h-5 text-orange-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-6L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        }
        label="Outbound"
        value={formatBytes(stats.netOut)}
        color="bg-orange-500/10"
      />
    </div>
  );
}
