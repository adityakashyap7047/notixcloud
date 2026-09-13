"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatBytes } from "@/lib/utils";
import { Plus, Globe, Copy, Check, Terminal } from "lucide-react";

export default function AdminNodesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSetup, setShowSetup] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [newNode, setNewNode] = useState({
    name: "",
    ip: "",
    maxRam: 8192,
    maxDisk: 100000,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if ((session?.user as any)?.role !== "ADMIN") {
      router.push("/servers");
      return;
    }
    fetchNodes();
  }, [status]);

  const fetchNodes = async () => {
    try {
      const res = await fetch("/api/admin/nodes");
      const data = await res.json();
      setNodes(data);
    } catch {
      console.error("Failed to fetch nodes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNode),
      });
      const data = await res.json();
      setShowCreate(false);
      setNewNode({ name: "", ip: "", maxRam: 8192, maxDisk: 100000 });
      fetchNodes();
      if (data.apiKey) {
        setShowSetup(data.id);
      }
    } catch {
      console.error("Failed to create node");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getSetupCommand = (node: any) => {
    const panelUrl = window.location.origin;
    return `# Install and run NotixCloud Node Daemon
# Requirements: Docker, curl, jq

# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Set environment variables
export PANEL_URL="${panelUrl}"
export NODE_API_KEY="${node.apiKey}"
export NODE_NAME="${node.name}"
export NODE_IP="${node.ip}"

# 3. Run the daemon
curl -sL ${panelUrl}/api/nodes/daemon | bash

# Or run manually:
wget -qO- ${panelUrl}/node-daemon.sh | bash`;
  };

  return (
    <Layout>
      <div className="flex gap-6">
        <AdminSidebar />
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between fade-up">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Node Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">{nodes.length} nodes configured</p>
            </div>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> Add Node
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 stagger-children">
            {loading ? (
              <div className="col-span-2 text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : nodes.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="py-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm mb-4">No nodes configured</p>
                    <Button onClick={() => setShowCreate(true)}>Add First Node</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              nodes.map((node) => (
                <Card key={node.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{node.name}</CardTitle>
                      <Badge
                        variant={node.status === "ONLINE" ? "success" : "danger"}
                      >
                        {node.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Address</span>
                      <span className="text-blue-500 font-mono text-xs">{node.ip}:{node.port}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">RAM</span>
                        <span className="text-slate-700 font-medium">
                          {formatBytes((node.maxRam || 0) * 1024 * 1024)}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: "0%" }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Disk</span>
                        <span className="text-slate-700 font-medium">
                          {formatBytes((node.maxDisk || 0) * 1024)}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: "0%", background: "linear-gradient(90deg, #06b6d4, #22d3ee)" }} />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Servers</span>
                      <span className="text-slate-700 font-medium">
                        {node._count?.servers || 0} / {node.totalSlots}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-2">API Key</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1 overflow-hidden overflow-ellipsis">
                          {node.apiKey}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(node.apiKey, node.id)}
                        >
                          {copied === node.id ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setShowSetup(node.id)}
                    >
                      <Terminal className="w-4 h-4" />
                      Setup Instructions
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Modal
            open={showCreate}
            onClose={() => setShowCreate(false)}
            title="Add Node"
            description="Configure a new server node"
          >
            <form onSubmit={handleCreateNode} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Node Name</label>
                <Input
                  placeholder="Free VPS Node"
                  value={newNode.name}
                  onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address</label>
                <Input
                  placeholder="192.168.1.100 or your-vps-ip"
                  value={newNode.ip}
                  onChange={(e) => setNewNode({ ...newNode, ip: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max RAM (MB)</label>
                  <Input
                    type="number"
                    value={newNode.maxRam}
                    onChange={(e) => setNewNode({ ...newNode, maxRam: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Disk (MB)</label>
                  <Input
                    type="number"
                    value={newNode.maxDisk}
                    onChange={(e) => setNewNode({ ...newNode, maxDisk: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" className="w-full">
                Add Node
              </Button>
            </form>
          </Modal>

          <Modal
            open={!!showSetup}
            onClose={() => setShowSetup(null)}
            title="Node Setup Instructions"
            description="Run these commands on your VPS"
          >
            {showSetup && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-xl overflow-x-auto">
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                    {getSetupCommand(nodes.find((n) => n.id === showSetup))}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      const node = nodes.find((n) => n.id === showSetup);
                      if (node) {
                        copyToClipboard(getSetupCommand(node), "setup");
                      }
                    }}
                  >
                    {copied === "setup" ? (
                      <><Check className="w-4 h-4" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy Commands</>
                    )}
                  </Button>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Requirements:</strong> Docker must be installed on the VPS. 
                    The daemon will auto-install Docker if not present.
                  </p>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </Layout>
  );
}
