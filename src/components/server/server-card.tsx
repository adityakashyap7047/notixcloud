"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getServerStatusDot } from "@/lib/utils";

interface ServerCardProps {
  server: any;
  onUpdate?: () => void;
}

export function ServerCard({ server, onUpdate }: ServerCardProps) {
  const handleQuickAction = async (action: string) => {
    try {
      await fetch(`/api/servers/${server.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      onUpdate?.();
    } catch (error) {
      console.error(`Failed to ${action} server:`, error);
    }
  };

  return (
    <div className="card-professional p-5 group hover:border-blue-200 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`status-dot ${getServerStatusDot(server.status)}`} />
          <h3 className="text-sm font-semibold text-slate-900 truncate font-[family-name:var(--font-heading)]">
            {server.name}
          </h3>
        </div>
        <Badge
          variant={
            server.status === "RUNNING"
              ? "success"
              : server.status === "STARTING"
              ? "warning"
              : "default"
          }
        >
          {server.status}
        </Badge>
      </div>

      <div className="space-y-2.5 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Version</span>
          <span className="text-slate-900 font-medium">{server.version}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Address</span>
          <span className="text-blue-500 font-medium font-mono">
            {server.node?.ip}:{server.port}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">RAM</span>
          <span className="text-slate-900 font-medium">
            {server.allocatedRam}MB
          </span>
        </div>
      </div>

      <div className="progress-bar mb-4">
        <div
          className="progress-fill"
          style={{ width: `${server.status === "RUNNING" ? 45 : 0}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/servers/${server.id}`} className="flex-1">
          <Button variant="ghost" className="w-full" size="sm">
            Manage
          </Button>
        </Link>
        {server.status === "RUNNING" ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleQuickAction("stop")}
          >
            Stop
          </Button>
        ) : server.status === "OFFLINE" ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleQuickAction("start")}
          >
            Start
          </Button>
        ) : null}
      </div>
    </div>
  );
}
