"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<any>(null);
  const [balance, setBalance] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if ((session?.user as any)?.role !== "ADMIN") {
      router.push("/servers");
      return;
    }
    fetchUsers();
  }, [status]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (!editUser || !balance) return;
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser.id,
          balance: parseFloat(balance),
        }),
      });
      setEditUser(null);
      setBalance("");
      fetchUsers();
    } catch {
      console.error("Failed to update balance");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex gap-6">
        <AdminSidebar />
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between" style={{ animation: "fadeInDown 0.6s ease-out" }}>
            <div>
              <h1 className="text-2xl font-bold text-dark">
                User Management
              </h1>
              <p className="mt-1 text-sm text-dark-400">
                {users.length} total users
              </p>
            </div>
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <Input
                placeholder="Search users..."
                className="w-64 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Card style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="spinner mx-auto" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-surface-dark rounded-xl hover:bg-dark-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {(user.name || user.email)[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark">
                            {user.name || "No name"}
                          </p>
                          <p className="text-xs text-dark-400">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-dark">
                            {formatCurrency(Number(user.balance))}
                          </p>
                          <p className="text-xs text-dark-400">
                            {user._count?.servers || 0} servers
                          </p>
                        </div>
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "warning" : "default"
                          }
                        >
                          {user.role}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditUser(user);
                            setBalance(user.balance.toString());
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Modal
            open={!!editUser}
            onClose={() => setEditUser(null)}
            title="Edit User"
            description={editUser?.email}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-dark-400">Balance (INR)</label>
                <Input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleUpdateBalance}
              >
                Update Balance
              </Button>
            </div>
          </Modal>
        </div>
      </div>
    </Layout>
  );
}
