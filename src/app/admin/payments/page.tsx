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
import { CreditCard } from "lucide-react";

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if ((session?.user as any)?.role !== "ADMIN") {
      router.push("/servers");
      return;
    }
    fetchPayments();
  }, [status]);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      setPayments(data);
    } catch {
      console.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: string, newStatus: string) => {
    try {
      await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          status: newStatus,
          adminNote,
        }),
      });
      setSelectedPayment(null);
      setAdminNote("");
      fetchPayments();
    } catch {
      console.error("Failed to update payment");
    }
  };

  const filtered = payments.filter(
    (p) => filter === "all" || p.status === filter.toUpperCase()
  );

  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  return (
    <Layout>
      <div className="flex gap-6">
        <AdminSidebar />
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between fade-up">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Payment Verification
              </h1>
              <p className="mt-1 text-sm text-slate-500">{pendingCount} pending payments</p>
            </div>
            <div className="flex gap-2">
              {["all", "pending", "verified", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === f
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm">No payments found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            payment.status === "VERIFIED"
                              ? "success"
                              : payment.status === "REJECTED"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {payment.status}
                        </Badge>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 font-mono">
                            {formatCurrency(Number(payment.amount))}
                          </p>
                          <p className="text-xs text-slate-500">
                            {payment.user?.email} · TX: {payment.txId || "N/A"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(payment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {payment.status === "PENDING" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setAdminNote("");
                          }}
                        >
                          Review
                        </Button>
                      )}

                      {payment.adminNote && (
                        <p className="text-xs text-orange-600 font-medium max-w-xs">
                          {payment.adminNote}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Modal
            open={!!selectedPayment}
            onClose={() => setSelectedPayment(null)}
            title="Review Payment"
            description={`Payment from ${selectedPayment?.user?.email}`}
          >
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-500">Amount</span>
                  <span className="text-sm font-semibold text-emerald-600 font-mono">
                    {formatCurrency(Number(selectedPayment?.amount || 0))}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-500">Transaction ID</span>
                  <span className="text-sm font-medium text-slate-900 font-mono">
                    {selectedPayment?.txId || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Date</span>
                  <span className="text-sm font-medium text-slate-900">
                    {selectedPayment?.createdAt &&
                      new Date(selectedPayment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Note (Optional)</label>
                <Input
                  placeholder="Add a note..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleVerify(selectedPayment.id, "REJECTED")}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleVerify(selectedPayment.id, "VERIFIED")}
                >
                  Approve
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </Layout>
  );
}
