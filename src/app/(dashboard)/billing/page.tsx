"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Plus } from "lucide-react";

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [txId, setTxId] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchPayments();
  }, [status]);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      setPayments(data);
    } catch {
      console.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), txId }),
      });
      if (res.ok) {
        setShowDeposit(false);
        setTxId("");
        setAmount("");
        fetchPayments();
      }
    } catch {
      console.error("Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between fade-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              Billing
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your balance and payments
            </p>
          </div>
          <Button onClick={() => setShowDeposit(true)}>
            <Plus className="w-4 h-4" /> Add Funds
          </Button>
        </div>

        <Card className="fade-up" style={{ transitionDelay: "100ms" }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Current Balance
              </p>
              <p className="text-4xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                {formatCurrency(Number((session?.user as any)?.balance || 0))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="fade-up" style={{ transitionDelay: "200ms" }}>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">No payment history</p>
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
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
                        <p className="text-sm text-slate-900 font-medium">
                          {formatCurrency(Number(payment.amount))}
                        </p>
                        <p className="text-xs text-slate-500">
                          {payment.txId && `TX: ${payment.txId} · `}
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {payment.adminNote && (
                      <p className="text-xs text-orange-600">{payment.adminNote}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Modal
          open={showDeposit}
          onClose={() => setShowDeposit(false)}
          title="Add Funds"
          description="Submit payment proof for admin verification"
        >
          <form onSubmit={handleDeposit} className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Payment Instructions</p>
              <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                <li>Send payment to: <span className="text-blue-500 font-mono font-medium">UPI: notix@upi</span></li>
                <li>Enter the amount you sent</li>
                <li>Enter the transaction ID</li>
                <li>Wait for admin verification</li>
              </ol>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (INR)</label>
              <Input
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID</label>
              <Input
                type="text"
                placeholder="TXN123456789"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={submitting}
            >
              Submit Payment
            </Button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
