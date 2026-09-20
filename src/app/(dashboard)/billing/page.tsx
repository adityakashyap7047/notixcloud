"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import {
  Wallet,
  Plus,
  QrCode,
  Smartphone,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  ArrowLeft,
  Zap,
  FileText,
} from "lucide-react";

type PaymentTab = "upi" | "manual";
type PaymentState = "form" | "paying" | "success" | "failed" | "expired";

interface UpiPaymentData {
  id: string;
  qrCode?: string;
  upiUri?: string;
  generatedLink?: string;
  pspUri?: {
    commonUri?: string;
    gpayUri?: string;
    phonepeUri?: string;
    paytmUri?: string;
  };
  expiresAt?: string;
  amount: number;
}

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [activeTab, setActiveTab] = useState<PaymentTab>("upi");
  const [paymentState, setPaymentState] = useState<PaymentState>("form");

  // Form state
  const [amount, setAmount] = useState("");
  const [txId, setTxId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // UPI payment state
  const [upiPayment, setUpiPayment] = useState<UpiPaymentData | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [copied, setCopied] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchPayments();
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

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

  // ─── UPI Payment Flow ─────────────────────────────────────────
  const handleUpiPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), method: "UPI" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate payment link");
        setSubmitting(false);
        return;
      }

      setUpiPayment({
        id: data.id,
        qrCode: data.qrCode,
        upiUri: data.upiUri,
        generatedLink: data.generatedLink,
        pspUri: data.pspUri,
        expiresAt: data.expiresAt,
        amount: data.amount,
      });

      setPaymentState("paying");
      startPolling(data.id);
      startCountdown(data.expiresAt);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Manual Payment Flow (legacy) ─────────────────────────────
  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          txId,
          method: "MANUAL",
        }),
      });

      if (res.ok) {
        resetModal();
        fetchPayments();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit payment");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Status Polling ────────────────────────────────────────────
  const startPolling = useCallback((paymentId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payments/status?paymentId=${paymentId}`
        );
        const data = await res.json();

        if (data.status === "VERIFIED") {
          setPaymentState("success");
          stopPolling();
          fetchPayments();
        } else if (data.status === "FAILED") {
          setPaymentState("failed");
          stopPolling();
          fetchPayments();
        } else if (data.status === "EXPIRED") {
          setPaymentState("expired");
          stopPolling();
          fetchPayments();
        }
      } catch {
        // Silently retry
      }
    }, 5000);
  }, []);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const startCountdown = (expiresAt?: string) => {
    if (!expiresAt) return;

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
      setCountdown(remaining);
      if (remaining <= 0) {
        setPaymentState("expired");
        stopPolling();
      }
    };

    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetModal = () => {
    setShowDeposit(false);
    setPaymentState("form");
    setUpiPayment(null);
    setAmount("");
    setTxId("");
    setError("");
    setCountdown(0);
    stopPolling();
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

  // ─── Payment State Renderers ───────────────────────────────────
  const renderPayingState = () => (
    <div className="space-y-5">
      {/* Back button */}
      <button
        onClick={() => {
          setPaymentState("form");
          stopPolling();
        }}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Amount display */}
      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          Amount to Pay
        </p>
        <p className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
          {formatCurrency(upiPayment?.amount || 0)}
        </p>
      </div>

      {/* QR Code */}
      {upiPayment?.qrCode && (
        <div className="flex flex-col items-center">
          <div className="relative p-4 bg-white rounded-2xl shadow-lg border border-slate-100">
            <img
              src={`data:image/png;base64,${upiPayment.qrCode}`}
              alt="UPI QR Code"
              className="w-48 h-48 rounded-lg"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
              SCAN TO PAY
            </div>
          </div>
        </div>
      )}

      {/* UPI App Buttons */}
      <div className="space-y-2">
        {upiPayment?.upiUri && (
          <a
            href={upiPayment.upiUri}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
          >
            <Smartphone className="w-4 h-4" />
            Open UPI App
          </a>
        )}

        {upiPayment?.pspUri?.gpayUri && (
          <a
            href={upiPayment.pspUri.gpayUri}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all"
          >
            Pay with Google Pay
          </a>
        )}

        {upiPayment?.pspUri?.phonepeUri && (
          <a
            href={upiPayment.pspUri.phonepeUri}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all"
          >
            Pay with PhonePe
          </a>
        )}

        {upiPayment?.generatedLink && (
          <button
            onClick={() =>
              copyToClipboard(upiPayment.generatedLink || "")
            }
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-medium text-xs hover:bg-slate-100 transition-all"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Payment Link
              </>
            )}
          </button>
        )}
      </div>

      {/* Timer + Status */}
      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-medium text-amber-700">
            Link expires in
          </span>
        </div>
        <span className="text-sm font-bold text-amber-800 font-mono">
          {formatTime(countdown)}
        </span>
      </div>

      {/* Waiting indicator */}
      <div className="flex items-center justify-center gap-2 py-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <p className="text-xs text-slate-500">
          Waiting for payment confirmation...
        </p>
      </div>
    </div>
  );

  const renderSuccessState = () => (
    <div className="text-center space-y-4 py-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
          Payment Successful!
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {formatCurrency(upiPayment?.amount || 0)} has been added to your
          balance
        </p>
      </div>
      <Button onClick={resetModal} className="w-full">
        Done
      </Button>
    </div>
  );

  const renderFailedState = () => (
    <div className="text-center space-y-4 py-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <XCircle className="w-8 h-8 text-red-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
          Payment Failed
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          The transaction could not be completed. Please try again.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={resetModal}
          className="flex-1"
        >
          Close
        </Button>
        <Button
          onClick={() => setPaymentState("form")}
          className="flex-1"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  const renderExpiredState = () => (
    <div className="text-center space-y-4 py-4">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8 text-amber-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
          Payment Link Expired
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          The payment link has expired. Please generate a new one.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={resetModal}
          className="flex-1"
        >
          Close
        </Button>
        <Button
          onClick={() => setPaymentState("form")}
          className="flex-1"
        >
          New Payment
        </Button>
      </div>
    </div>
  );

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
                            : payment.status === "REJECTED" ||
                              payment.status === "FAILED"
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
                          {payment.paymentMethod === "UPI_DECENTRO" && (
                            <span className="inline-flex items-center gap-1 text-blue-600 mr-1">
                              <Zap className="w-3 h-3" />
                              UPI
                            </span>
                          )}
                          {payment.txId && `TX: ${payment.txId} · `}
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {payment.adminNote && (
                      <p className="text-xs text-orange-600">
                        {payment.adminNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Add Funds Modal ──────────────────────────────────── */}
        <Modal
          open={showDeposit}
          onClose={resetModal}
          title={
            paymentState === "form"
              ? "Add Funds"
              : paymentState === "paying"
              ? "Complete Payment"
              : paymentState === "success"
              ? "Payment Complete"
              : paymentState === "failed"
              ? "Payment Failed"
              : "Link Expired"
          }
          description={
            paymentState === "form"
              ? "Choose your preferred payment method"
              : undefined
          }
        >
          {paymentState === "form" && (
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveTab("upi")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "upi"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  UPI Payment
                </button>
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "manual"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Manual
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              {/* ─── UPI Tab ──────────────────────────────────── */}
              {activeTab === "upi" && (
                <form onSubmit={handleUpiPayment} className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Instant UPI Payment
                      </p>
                    </div>
                    <p className="text-xs text-blue-600/70">
                      Pay instantly using any UPI app — GPay, PhonePe, Paytm,
                      etc. Your balance is credited automatically.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Amount (INR)
                    </label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="5"
                    />
                    <p className="text-[11px] text-slate-400">
                      Minimum ₹5 · Maximum ₹1,00,000
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={submitting}
                  >
                    <QrCode className="w-4 h-4" />
                    Generate UPI Payment Link
                  </Button>
                </form>
              )}

              {/* ─── Manual Tab ───────────────────────────────── */}
              {activeTab === "manual" && (
                <form onSubmit={handleManualPayment} className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                      Payment Instructions
                    </p>
                    <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                      <li>
                        Send payment to:{" "}
                        <span className="text-blue-500 font-mono font-medium">
                          UPI: notix@upi
                        </span>
                      </li>
                      <li>Enter the amount you sent</li>
                      <li>Enter the transaction ID</li>
                      <li>Wait for admin verification</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Amount (INR)
                    </label>
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
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Transaction ID
                    </label>
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
              )}
            </div>
          )}

          {paymentState === "paying" && renderPayingState()}
          {paymentState === "success" && renderSuccessState()}
          {paymentState === "failed" && renderFailedState()}
          {paymentState === "expired" && renderExpiredState()}
        </Modal>
      </div>
    </Layout>
  );
}
