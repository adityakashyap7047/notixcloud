"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, MemoryStick, HardDrive, Activity } from "lucide-react";

interface ServerStatsProps {
  server: any;
}

export function ServerStats({ server }: ServerStatsProps) {
  const stats = {
    cpu: 23,
    ram: 45,
    disk: 32,
    tps: 20.0,
    uptime: "3d 14h 23m",
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Cpu className="w-4 h-4 text-blue-500" />
            </div>
            <CardTitle className="text-sm">CPU Usage</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
            {stats.cpu}%
          </p>
          <div className="progress-bar mt-4">
            <div
              className="progress-fill"
              style={{ width: `${stats.cpu}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <MemoryStick className="w-4 h-4 text-green-500" />
            </div>
            <CardTitle className="text-sm">RAM Usage</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
            {stats.ram}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {Math.round((server.allocatedRam * stats.ram) / 100)}MB / {server.allocatedRam}MB
          </p>
          <div className="progress-bar mt-4">
            <div
              className="progress-fill"
              style={{ width: `${stats.ram}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-purple-500" />
            </div>
            <CardTitle className="text-sm">Disk Usage</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
            {stats.disk}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {Math.round((server.allocatedDisk * stats.disk) / 100)}MB / {server.allocatedDisk}MB
          </p>
          <div className="progress-bar mt-4">
            <div
              className="progress-fill"
              style={{ width: `${stats.disk}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-orange-500" />
            </div>
            <CardTitle className="text-sm">Server Info</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">TPS</span>
              <Badge variant={stats.tps >= 18 ? "success" : stats.tps >= 15 ? "warning" : "danger"}>
                {stats.tps.toFixed(1)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Uptime</span>
              <span className="text-xs font-medium text-slate-900">
                {stats.uptime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Version</span>
              <span className="text-xs font-medium text-slate-900">
                {server.version}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Port</span>
              <span className="text-xs font-medium text-blue-500">
                {server.port}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
