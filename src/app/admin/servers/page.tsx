"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminServersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if ((session?.user as any)?.role !== "ADMIN") {
      router.push("/servers");
      return;
    }
    fetchServers();
  }, [status]);

  const fetchServers = async () => {
    try {
      const res = await fetch("/api/admin/servers");
      const data = await res.json();
      setServers(data);
    } catch {
      console.error("Failed to fetch servers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex gap-6">
        <AdminSidebar />
        <div className="flex-1 space-y-6">
          <div style={{ animation: "fadeInDown 0.6s ease-out" }}>
            <h1 className="text-2xl font-bold text-dark">
              Server Management
            </h1>
            <p className="mt-1 text-sm text-dark-400">
              All servers across all users
            </p>
          </div>

          <Card style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="spinner mx-auto" />
                </div>
              ) : servers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-dark-400 text-sm">No servers found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {servers.map((server) => (
                    <div
                      key={server.id}
                      className="flex items-center justify-between p-4 bg-surface-dark rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`status-dot ${
                            server.status === "RUNNING" ? "status-online" :
                            server.status === "STARTING" ? "status-starting" : "status-offline"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-dark">{server.name}</p>
                          <p className="text-xs text-dark-400">
                            {server.node?.ip}:{server.port} &bull; v{server.version}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-dark-400">
                            {server.user?.email}
                          </p>
                          <p className="text-xs font-medium text-dark">
                            {server.allocatedRam}MB RAM
                          </p>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/servers/${server.id}`)
                          }
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
