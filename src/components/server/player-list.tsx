"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

interface PlayerListProps {
  serverId?: string;
}

export function PlayerList({ serverId }: PlayerListProps) {
  const players: any[] = [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <CardTitle>Players</CardTitle>
          </div>
          <Badge variant="info">
            {players.length} / 50 Online
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm">No players online</p>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.uuid}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://mc-heads.net/avatar/${player.uuid}/32`}
                    alt={player.name}
                    className="h-8 w-8 rounded-lg"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{player.name}</p>
                    <p className="text-xs text-slate-500">
                      UUID: {player.uuid}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={player.op ? "warning" : "default"}>
                    {player.op ? "OP" : "Player"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-4">
            Whitelist
          </h3>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Player name..."
              className="flex-1"
            />
            <Button variant="primary" size="sm">
              Add
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-4">
            Banned Players
          </h3>
          <p className="text-sm text-slate-500">No banned players</p>
        </div>
      </CardContent>
    </Card>
  );
}
