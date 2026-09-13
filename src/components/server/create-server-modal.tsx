"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";

interface CreateServerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateServerModal({
  open,
  onClose,
  onCreated,
}: CreateServerModalProps) {
  const [name, setName] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [version, setVersion] = useState("1.20.4");
  const [type, setType] = useState("paper");
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetchNodes();
    }
  }, [open]);

  const fetchNodes = async () => {
    try {
      const res = await fetch("/api/nodes");
      const data = await res.json();
      setNodes(data);
      if (data.length > 0) setNodeId(data[0].id);
    } catch {
      console.error("Failed to fetch nodes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nodeId, version, type }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create server");
        return;
      }

      onCreated();
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const versions = [
    { value: "1.20.4", label: "1.20.4" },
    { value: "1.20.2", label: "1.20.2" },
    { value: "1.19.4", label: "1.19.4" },
    { value: "1.18.2", label: "1.18.2" },
    { value: "1.16.5", label: "1.16.5" },
    { value: "1.12.2", label: "1.12.2" },
    { value: "1.8.9", label: "1.8.9" },
  ];

  const types = [
    { value: "paper", label: "Paper" },
    { value: "spigot", label: "Spigot" },
    { value: "purpur", label: "Purpur" },
    { value: "vanilla", label: "Vanilla" },
    { value: "forge", label: "Forge" },
    { value: "fabric", label: "Fabric" },
    { value: "bungeecord", label: "BungeeCord" },
    { value: "velocity", label: "Velocity" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Server"
      description="Deploy a new Minecraft server"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Server Name</label>
          <Input
            placeholder="My Server"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Node</label>
          <Select
            options={
              nodes.length > 0
                ? nodes.map((n) => ({
                    value: n.id,
                    label: `${n.name} (${n.ip})`,
                  }))
                : [{ value: "", label: "No nodes available" }]
            }
            value={nodeId}
            onChange={(e) => setNodeId(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Version</label>
            <Select
              options={versions}
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
            <Select
              options={types}
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Server Will Include</p>
          <ul className="text-xs text-slate-600 space-y-1">
            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full" /> 2048MB RAM</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full" /> 10GB Disk Space</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full" /> 50% CPU</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full" /> DDoS Protection</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full" /> Instant Setup</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={loading}
          >
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
