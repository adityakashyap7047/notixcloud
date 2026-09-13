"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServerCard } from "@/components/server/server-card";
import { CreateServerModal } from "@/components/server/create-server-modal";

export default function ServersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchServers();
    }
  }, [status]);

  const fetchServers = async () => {
    try {
      const res = await fetch("/api/servers");
      const data = await res.json();
      setServers(data);
    } catch (error) {
      console.error("Failed to fetch servers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="spinner mx-auto mb-4" style={{ width: 40, height: 40, borderWidth: 3 }} />
            <p className="text-sm text-dark-400 font-medium">
              Loading servers...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between" style={{ animation: "fadeInDown 0.6s ease-out" }}>
            <div>
              <h1 className="text-2xl font-bold text-dark">
                My Servers
              </h1>
              <p className="mt-1 text-sm text-dark-400">
                Manage your Minecraft servers
              </p>
            </div>
            <Button onClick={() => setShowCreate(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Server
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-dark">
                    {servers.length}
                  </p>
                  <p className="text-xs text-dark-400 font-medium mt-1">
                    Total Servers
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-success">
                    {servers.filter((s) => s.status === "RUNNING").length}
                  </p>
                  <p className="text-xs text-dark-400 font-medium mt-1">
                    Online
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {(session?.user as any)?.role === "ADMIN" ? "∞" : `${
                      servers.reduce((acc, s) => acc + s.allocatedRam, 0)
                    }MB`}
                  </p>
                  <p className="text-xs text-dark-400 font-medium mt-1">
                    Total RAM
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {servers.length === 0 ? (
            <Card style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}>
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-dark-800 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-dark-400">
                      <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-dark mb-2">
                    No servers yet
                  </h3>
                  <p className="text-sm text-dark-400 mb-6 max-w-sm mx-auto">
                    Create your first server to get started. It only takes a few seconds.
                  </p>
                  <Button onClick={() => setShowCreate(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Create Server
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servers.map((server, i) => (
                <div key={server.id} style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
                  <ServerCard server={server} onUpdate={fetchServers} />
                </div>
              ))}
            </div>
          )}
        </div>

        <CreateServerModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchServers();
          }}
        />
      </Layout>
  );
}
