"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Play, Square, RotateCcw, Loader2, Trash2 } from "lucide-react";

interface ServerControlsProps {
  server: any;
  onUpdate: () => void;
}

export function ServerControls({ server, onUpdate }: ServerControlsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAction = async (action: string) => {
    setLoading(action);
    try {
      await fetch(`/api/servers/${server.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      onUpdate();
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/servers/${server.id}`, {
        method: "DELETE",
      });
      window.location.href = "/servers";
    } catch (error) {
      console.error("Failed to delete server:", error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {server.status === "OFFLINE" || server.status === "ERROR" ? (
          <Button
            variant="primary"
            size="sm"
            loading={loading === "start"}
            onClick={() => handleAction("start")}
          >
            <Play className="w-3.5 h-3.5" />
            Start
          </Button>
        ) : server.status === "RUNNING" ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              loading={loading === "restart"}
              onClick={() => handleAction("restart")}
              className="!bg-slate-100 !text-slate-700 !border-slate-200 hover:!bg-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restart
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={loading === "stop"}
              onClick={() => handleAction("stop")}
            >
              <Square className="w-3.5 h-3.5" />
              Stop
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span className="text-xs text-slate-500">
              {server.status}...
            </span>
          </div>
        )}
      </div>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Delete Server"
        description="This action cannot be undone"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{server.name}</strong>?
            All data will be permanently lost.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
