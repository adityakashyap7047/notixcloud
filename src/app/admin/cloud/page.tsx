"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Plus, Cloud, Trash2, Check, X, Loader2 } from "lucide-react";

interface CloudProvider {
  id: string;
  name: string;
  type: "oracle" | "hetzner" | "vultr";
  status: "active" | "inactive" | "testing";
  regions: string[];
}

const PROVIDER_CONFIGS: Record<
  string,
  { label: string; fields: { key: string; label: string; type: string; placeholder: string }[] }
> = {
  oracle: {
    label: "Oracle Cloud",
    fields: [
      { key: "tenancyOcId", label: "Tenancy OCID", type: "text", placeholder: "ocid1.tenancy.oc1..aaa..." },
      { key: "userId", label: "User OCID", type: "text", placeholder: "ocid1.user.oc1..aaa..." },
      { key: "fingerprint", label: "API Key Fingerprint", type: "text", placeholder: "aa:bb:cc:dd:ee:ff" },
      { key: "privateKey", label: "Private Key (PEM)", type: "textarea", placeholder: "-----BEGIN RSA PRIVATE KEY-----..." },
      { key: "region", label: "Region", type: "text", placeholder: "us-ashburn-1" },
      { key: "compartmentId", label: "Compartment OCID", type: "text", placeholder: "ocid1.compartment.oc1..aaa..." },
      { key: "sshPublicKey", label: "SSH Public Key", type: "textarea", placeholder: "ssh-rsa AAAAB3..." },
    ],
  },
  hetzner: {
    label: "Hetzner Cloud",
    fields: [
      { key: "apiToken", label: "API Token", type: "password", placeholder: "your-api-token" },
      { key: "location", label: "Default Location", type: "text", placeholder: "fsn1" },
      { key: "sshPublicKey", label: "SSH Public Key", type: "textarea", placeholder: "ssh-rsa AAAAB3..." },
    ],
  },
  vultr: {
    label: "Vultr",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "your-api-key" },
      { key: "region", label: "Default Region", type: "text", placeholder: "ewr" },
      { key: "sshPublicKey", label: "SSH Public Key", type: "textarea", placeholder: "ssh-rsa AAAAB3..." },
    ],
  },
};

export default function AdminCloudPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<CloudProvider[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showProvision, setShowProvision] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("oracle");
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [nodeName, setNodeName] = useState("");
  const [nodeRam, setNodeRam] = useState(8192);
  const [nodeCpu, setNodeCpu] = useState(4);
  const [nodeDisk, setNodeDisk] = useState(50000);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [provisioning, setProvisioning] = useState(false);
  const [provisionResult, setProvisionResult] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if ((session?.user as any)?.role !== "ADMIN") {
      router.push("/servers");
      return;
    }
    loadProviders();
  }, [status]);

  const loadProviders = () => {
    const stored = localStorage.getItem("notixcloud_providers");
    if (stored) {
      setProviders(JSON.parse(stored));
    }
  };

  const saveProviders = (provs: CloudProvider[]) => {
    localStorage.setItem("notixcloud_providers", JSON.stringify(provs));
    setProviders(provs);
  };

  const handleTest = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/cloud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          provider: selectedProvider,
          credentials,
        }),
      });
      const data = await res.json();
      setTestResult(data.success ? "success" : "error");
    } catch {
      setTestResult("error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = () => {
    const newProvider: CloudProvider = {
      id: Date.now().toString(),
      name: PROVIDER_CONFIGS[selectedProvider].label,
      type: selectedProvider as any,
      status: "active",
      regions: [],
    };

    const stored = localStorage.getItem("notixcloud_providers_credentials");
    const allCredentials = stored ? JSON.parse(stored) : {};
    allCredentials[newProvider.id] = { ...credentials, provider: selectedProvider };
    localStorage.setItem(
      "notixcloud_providers_credentials",
      JSON.stringify(allCredentials)
    );

    saveProviders([...providers, newProvider]);
    setShowAdd(false);
    setCredentials({});
    setTestResult(null);
  };

  const handleRemoveProvider = (id: string) => {
    saveProviders(providers.filter((p) => p.id !== id));
    const stored = localStorage.getItem("notixcloud_providers_credentials");
    if (stored) {
      const allCredentials = JSON.parse(stored);
      delete allCredentials[id];
      localStorage.setItem(
        "notixcloud_providers_credentials",
        JSON.stringify(allCredentials)
      );
    }
  };

  const handleProvision = async () => {
    if (!selectedProvider) return;

    setProvisioning(true);
    setProvisionResult(null);

    try {
      const stored = localStorage.getItem("notixcloud_providers_credentials");
      const allCredentials = stored ? JSON.parse(stored) : {};
      const providerCreds = allCredentials[selectedProvider] || {};

      const res = await fetch("/api/admin/cloud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "provision",
          name: nodeName,
          provider: providerCreds.provider || selectedProvider,
          credentials: providerCreds,
          ram: nodeRam,
          cpu: nodeCpu,
          disk: nodeDisk,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setProvisionResult(data);
      } else {
        setProvisionResult({ error: data.error });
      }
    } catch (error: any) {
      setProvisionResult({ error: error.message });
    } finally {
      setProvisioning(false);
    }
  };

  return (
    <Layout>
      <div className="flex gap-6">
        <AdminSidebar />
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between fade-up">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Cloud Providers
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Auto-provision VPS nodes from cloud providers
              </p>
            </div>
            <div className="flex gap-2">
              {providers.length > 0 && (
                <Button onClick={() => setShowProvision(true)}>
                  <Plus className="w-4 h-4" /> Provision Node
                </Button>
              )}
              <Button onClick={() => setShowAdd(true)}>
                <Cloud className="w-4 h-4" /> Add Provider
              </Button>
            </div>
          </div>

          {providers.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Cloud className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No cloud providers configured
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                    Add a cloud provider to auto-provision VPS nodes for your
                    Minecraft servers. Supports Oracle Cloud (free), Hetzner, and
                    Vultr.
                  </p>
                  <Button onClick={() => setShowAdd(true)}>
                    <Cloud className="w-4 h-4" /> Add First Provider
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-blue-500" />
                        {provider.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="success">Active</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProvider(provider.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Type</span>
                        <span className="font-medium capitalize">
                          {provider.type}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Status</span>
                        <span className="font-medium text-green-600">
                          Connected
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add Provider Modal */}
          <Modal
            open={showAdd}
            onClose={() => {
              setShowAdd(false);
              setTestResult(null);
              setCredentials({});
            }}
            title="Add Cloud Provider"
            description="Connect a cloud provider for auto-provisioning"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Provider
                </label>
                <Select
                  options={[
                    { value: "oracle", label: "Oracle Cloud (Free Tier)" },
                    { value: "hetzner", label: "Hetzner Cloud" },
                    { value: "vultr", label: "Vultr" },
                  ]}
                  value={selectedProvider}
                  onChange={(e) => {
                    setSelectedProvider(e.target.value);
                    setCredentials({});
                    setTestResult(null);
                  }}
                />
              </div>

              {PROVIDER_CONFIGS[selectedProvider]?.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder={field.placeholder}
                      value={credentials[field.key] || ""}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          [field.key]: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={credentials[field.key] || ""}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          [field.key]: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleTest}
                  loading={loading}
                >
                  {testResult === "success" ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="w-4 h-4" /> Connected
                    </span>
                  ) : testResult === "error" ? (
                    <span className="flex items-center gap-1 text-red-600">
                      <X className="w-4 h-4" /> Failed
                    </span>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleAddProvider}
                  disabled={!testResult || testResult === "error"}
                >
                  Add Provider
                </Button>
              </div>

              {selectedProvider === "oracle" && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>How to get Oracle Cloud API keys:</strong>
                    <br />
                    1. Go to cloud.oracle.com → Profile → API Keys
                    <br />
                    2. Click &quot;Add API Key&quot;
                    <br />
                    3. Download the private key file
                    <br />
                    4. Copy the tenancy OCID, user OCID, fingerprint, and
                    compartment OCID
                  </p>
                </div>
              )}
            </div>
          </Modal>

          {/* Provision Node Modal */}
          <Modal
            open={showProvision}
            onClose={() => {
              setShowProvision(false);
              setProvisionResult(null);
            }}
            title="Provision New Node"
            description="Create a new VPS node automatically"
          >
            <div className="space-y-4">
              {provisionResult ? (
                <div className="space-y-4">
                  {provisionResult.error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600 font-medium">
                        Provisioning Failed
                      </p>
                      <p className="text-xs text-red-500 mt-1">
                        {provisionResult.error}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-2">
                      <p className="text-sm text-green-600 font-medium">
                        Node Provisioned Successfully!
                      </p>
                      <div className="text-xs text-green-700 space-y-1">
                        <p>
                          <strong>Instance ID:</strong>{" "}
                          {provisionResult.instanceId}
                        </p>
                        <p>
                          <strong>IP:</strong> {provisionResult.ip}
                        </p>
                        <p>
                          <strong>Status:</strong> {provisionResult.status}
                        </p>
                        <p className="pt-2 border-t border-green-200">
                          <strong>Node API Key (save this):</strong>
                          <br />
                          <code className="bg-green-100 px-2 py-1 rounded">
                            {provisionResult.nodeApiKey}
                          </code>
                        </p>
                      </div>
                      <p className="text-xs text-green-600 pt-2">
                        The node daemon will auto-install on first boot. It will
                        connect to your panel within 2-3 minutes.
                      </p>
                    </div>
                  )}
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setShowProvision(false);
                      setProvisionResult(null);
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Provider
                    </label>
                    <Select
                      options={providers.map((p) => ({
                        value: p.id,
                        label: p.name,
                      }))}
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Node Name
                    </label>
                    <Input
                      placeholder="free-vps-node"
                      value={nodeName}
                      onChange={(e) => setNodeName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        RAM (MB)
                      </label>
                      <Input
                        type="number"
                        value={nodeRam}
                        onChange={(e) => setNodeRam(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        CPU
                      </label>
                      <Input
                        type="number"
                        value={nodeCpu}
                        onChange={(e) => setNodeCpu(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Disk (MB)
                      </label>
                      <Input
                        type="number"
                        value={nodeDisk}
                        onChange={(e) => setNodeDisk(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs text-amber-700">
                      <strong>Note:</strong> Oracle Cloud free tier allows up to
                      4 ARM instances (4 OCPUs, 24GB RAM each). This will
                      create one instance and auto-install Docker.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleProvision}
                    loading={provisioning}
                    disabled={!nodeName || providers.length === 0}
                  >
                    {provisioning ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Provisioning... This may take 2-3 minutes
                      </span>
                    ) : (
                      "Provision Node"
                    )}
                  </Button>
                </>
              )}
            </div>
          </Modal>
        </div>
      </div>
    </Layout>
  );
}
