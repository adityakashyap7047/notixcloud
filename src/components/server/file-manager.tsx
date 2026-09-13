"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FileManagerProps {
  serverId: string;
}

interface FileItem {
  name: string;
  type: "file" | "directory";
  size: number;
  modified: string;
}

export function FileManager({ serverId }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState("/");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFiles([
      { name: "server.jar", type: "file", size: 25600000, modified: "2024-01-15" },
      { name: "server.properties", type: "file", size: 1024, modified: "2024-01-15" },
      { name: "eula.txt", type: "file", size: 512, modified: "2024-01-15" },
      { name: "world", type: "directory", size: 0, modified: "2024-01-15" },
      { name: "logs", type: "directory", size: 0, modified: "2024-01-15" },
      { name: "plugins", type: "directory", size: 0, modified: "2024-01-15" },
      { name: "mods", type: "directory", size: 0, modified: "2024-01-15" },
      { name: "config", type: "directory", size: 0, modified: "2024-01-15" },
    ]);
    setLoading(false);
  }, [serverId, currentPath]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "-";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <CardTitle>File Manager</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload
            </Button>
            <Button variant="ghost" size="sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              New File
            </Button>
            <Button variant="ghost" size="sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
              New Folder
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1 mb-4 p-3 bg-surface-dark rounded-xl text-sm font-mono">
          <button
            onClick={() => setCurrentPath("/")}
            className="text-primary hover:text-primary-dark font-medium"
          >
            root
          </button>
          {currentPath !== "/" &&
            currentPath.split("/").filter(Boolean).map((part, i) => (
              <span key={i}>
                <span className="text-dark-500">/</span>
                <span className="text-dark">{part}</span>
              </span>
            ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="spinner mx-auto" />
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 hover:bg-surface-dark rounded-xl cursor-pointer group transition-colors"
                onClick={() => {
                  if (file.type === "directory") {
                    setCurrentPath(
                      currentPath === "/"
                        ? `/${file.name}`
                        : `${currentPath}/${file.name}`
                    );
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {file.type === "directory" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dark-400">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  )}
                  <span className="text-sm font-medium text-dark">
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-dark-400">
                    {formatSize(file.size)}
                  </span>
                  <span className="text-xs text-dark-400">
                    {file.modified}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <Button variant="ghost" size="sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
