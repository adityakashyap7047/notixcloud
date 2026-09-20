import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTransactionStatus } from "@/lib/decentro";

/**
 * Poll payment status from Decentro
 * Used as a fallback when webhooks are delayed
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required" },
        { status: 400 }
      );
    }

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Ensure user can only check their own payments
    if (payment.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If already in terminal state, return immediately
    if (["VERIFIED", "FAILED", "REJECTED", "EXPIRED"].includes(payment.status)) {
      return NextResponse.json({
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
      });
    }

    // Only poll Decentro for UPI payments
    if (payment.paymentMethod !== "UPI_DECENTRO" || !payment.decentroTxnId) {
      return NextResponse.json({
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
      });
    }

    // Check if payment link has expired
    if (payment.expiresAt && new Date() > payment.expiresAt) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "EXPIRED",
          adminNote: "Payment link expired",
        },
      });

      return NextResponse.json({
        paymentId: payment.id,
        status: "EXPIRED",
        amount: payment.amount,
      });
    }

    // Poll Decentro for status
    try {
      const result = await getTransactionStatus(payment.decentroTxnId);
      const decentroStatus = result.data.transactionStatus?.toUpperCase();

      if (decentroStatus === "SUCCESS") {
        // Atomic update: only update if still PENDING (prevents double-credit)
        const updated = await db.payment.updateMany({
          where: {
            id: payment.id,
            status: "PENDING",
          },
          data: {
            status: "VERIFIED",
            txId: result.data.bankReferenceNumber || result.data.transactionId,
            verifiedAt: new Date(),
            adminNote: "Auto-verified via status poll",
          },
        });

        if (updated.count > 0) {
          await db.user.update({
            where: { id: payment.userId },
            data: {
              balance: {
                increment: Number(payment.amount),
              },
            },
          });
        }

        return NextResponse.json({
          paymentId: payment.id,
          status: "VERIFIED",
          amount: payment.amount,
        });
      } else if (decentroStatus === "FAILURE" || decentroStatus === "FAILED") {
        await db.payment.updateMany({
          where: {
            id: payment.id,
            status: "PENDING",
          },
          data: {
            status: "FAILED",
            adminNote: `Payment failed: ${result.data.transactionStatusDescription}`,
          },
        });

        return NextResponse.json({
          paymentId: payment.id,
          status: "FAILED",
          amount: payment.amount,
        });
      }

      // Still pending
      return NextResponse.json({
        paymentId: payment.id,
        status: "PENDING",
        amount: payment.amount,
      });
    } catch (error: any) {
      console.error("[Status Poll] Decentro error:", error.message);
      // Return current DB status if Decentro call fails
      return NextResponse.json({
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
      });
    }
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
