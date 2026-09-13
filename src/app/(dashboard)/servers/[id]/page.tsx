"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServerControls } from "@/components/server/server-controls";
import { LiveConsole } from "@/components/console/live-console";
import { FileManager } from "@/components/server/file-manager";
import { PlayerList } from "@/components/server/player-list";
import { ServerStats } from "@/components/server/server-stats";

export default function ServerDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [server, setServer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("console");

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

  if (loading || !server) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="spinner mx-auto mb-4" style={{ width: 40, height: 40, borderWidth: 3 }} />
            <p className="text-sm text-dark-400 font-medium">Loading server...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: "console", label: "Console", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg> },
    { id: "files", label: "Files", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg> },
    { id: "players", label: "Players", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
    { id: "stats", label: "Stats", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
    { id: "backups", label: "Backups", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg> },
    { id: "settings", label: "Settings", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between" style={{ animation: "fadeInDown 0.6s ease-out" }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/servers")}
              className="text-dark-400 hover:text-dark transition-colors p-2 hover:bg-surface-dark rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-dark">
                  {server.name}
                </h1>
                <Badge
                  variant={
                    server.status === "RUNNING"
                      ? "success"
                      : server.status === "STARTING"
                      ? "warning"
                      : server.status === "ERROR"
                      ? "danger"
                      : "default"
                  }
                >
                  <span
                    className={`status-dot mr-1.5 ${
                      server.status === "RUNNING"
                        ? "status-online"
                        : server.status === "STARTING"
                        ? "status-starting"
                        : "status-offline"
                    }`}
                  />
                  {server.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-dark-400">
                {server.node?.ip}:{server.port} &bull; {server.version} &bull; {server.allocatedRam}MB RAM
              </p>
            </div>
          </div>
          <ServerControls server={server} onUpdate={fetchServer} />
        </div>

        <div className="bg-surface rounded-xl border border-dark-700 p-1" style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary-50 text-primary-700"
                    : "text-dark-400 hover:text-dark hover:bg-surface-dark"
                }`}
              >
                {tab.icon}
                <span className="hidden md:block">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === "console" && (
          <LiveConsole serverId={server.id} status={server.status} />
        )}
        {activeTab === "files" && (
          <FileManager serverId={server.id} />
        )}
        {activeTab === "players" && (
          <PlayerList serverId={server.id} />
        )}
        {activeTab === "stats" && (
          <ServerStats server={server} />
        )}
        {activeTab === "backups" && (
          <Card>
            <CardHeader>
              <CardTitle>Backups</CardTitle>
            </CardHeader>
            <CardContent>
              {server.backups?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-dark-400 text-sm">No backups yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {server.backups?.map((backup: any) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 bg-surface-dark rounded-xl hover:bg-dark-800 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-dark">{backup.name}</p>
                        <p className="text-xs text-dark-400">
                          {new Date(backup.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Restore</Button>
                        <Button variant="ghost" size="sm">Download</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {activeTab === "settings" && (
          <Card>
            <CardHeader>
              <CardTitle>Server Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-surface-dark rounded-xl">
                  <p className="text-sm font-medium text-dark-400 mb-1">Server Name</p>
                  <p className="text-dark font-medium">{server.name}</p>
                </div>
                <div className="p-4 bg-surface-dark rounded-xl">
                  <p className="text-sm font-medium text-dark-400 mb-1">Version</p>
                  <p className="text-dark font-medium">{server.version}</p>
                </div>
                <div className="p-4 bg-surface-dark rounded-xl">
                  <p className="text-sm font-medium text-dark-400 mb-1">Port</p>
                  <p className="text-dark font-medium">{server.port}</p>
                </div>
                <div className="p-4 bg-danger/5 rounded-xl border border-danger/20">
                  <p className="text-sm font-medium text-danger mb-2">Danger Zone</p>
                  <Button variant="danger" size="sm">
                    Delete Server
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
