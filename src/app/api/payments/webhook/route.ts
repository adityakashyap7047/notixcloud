import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

const DECENTRO_WEBHOOK_SECRET = process.env.DECENTRO_WEBHOOK_SECRET || "";

/**
 * Verify Decentro webhook signature using HMAC-SHA256
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!DECENTRO_WEBHOOK_SECRET) {
    // If no secret is configured, skip verification (dev mode only)
    console.warn("[Decentro Webhook] No webhook secret configured — skipping signature verification");
    return true;
  }

  if (!signature) {
    console.error("[Decentro Webhook] Missing webhook signature");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", DECENTRO_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    // Buffer lengths differ — not a valid signature
    return false;
  }
}

/**
 * Decentro Webhook: Terminal Transaction Status Callback
 * 
 * Decentro calls this endpoint when a UPI payment reaches terminal state
 * (SUCCESS, FAILURE, or EXPIRED).
 * 
 * Must return "CB_S00000" to acknowledge; otherwise Decentro retries (up to 3x).
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("[Decentro Webhook] Invalid signature — rejecting request");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody);

    console.log("[Decentro Webhook] Received:", JSON.stringify(body, null, 2));

    const transactionId =
      body.decentroTxnId ||
      body.decentro_txn_id ||
      body.data?.transactionId ||
      body.transactionId;

    const transactionStatus =
      body.transactionStatus ||
      body.transaction_status ||
      body.data?.transactionStatus ||
      "";

    const bankRefNumber =
      body.bankReferenceNumber ||
      body.bank_reference_number ||
      body.data?.bankReferenceNumber ||
      "";

    if (!transactionId) {
      console.error("[Decentro Webhook] No transaction ID in payload");
      return NextResponse.json({ response: "CB_S00000" });
    }

    // Find the payment by Decentro transaction ID
    const payment = await db.payment.findFirst({
      where: { decentroTxnId: transactionId },
    });

    if (!payment) {
      console.error(
        "[Decentro Webhook] Payment not found for txn:",
        transactionId
      );
      // Still acknowledge to prevent retries
      return NextResponse.json({ response: "CB_S00000" });
    }

    // Skip if already in a terminal state
    if (["VERIFIED", "FAILED", "REJECTED", "EXPIRED"].includes(payment.status)) {
      console.log(
        "[Decentro Webhook] Payment already terminal:",
        payment.status
      );
      return NextResponse.json({ response: "CB_S00000" });
    }

    const statusUpper = transactionStatus.toUpperCase();

    if (statusUpper === "SUCCESS") {
      // ─── Payment Successful (atomic update to prevent double-credit) ───
      const updated = await db.payment.updateMany({
        where: {
          id: payment.id,
          status: "PENDING", // Only update if still PENDING
        },
        data: {
          status: "VERIFIED",
          txId: bankRefNumber || transactionId,
          verifiedAt: new Date(),
          adminNote: "Auto-verified via Decentro webhook",
        },
      });

      if (updated.count > 0) {
        // Only credit balance if we were the first to update
        await db.user.update({
          where: { id: payment.userId },
          data: {
            balance: {
              increment: Number(payment.amount),
            },
          },
        });

        console.log(
          `[Decentro Webhook] Payment ${payment.id} SUCCESS — ₹${payment.amount} credited to user ${payment.userId}`
        );
      } else {
        console.log(
          `[Decentro Webhook] Payment ${payment.id} already processed by another handler`
        );
      }
    } else if (statusUpper === "FAILURE" || statusUpper === "FAILED") {
      // ─── Payment Failed ──────────────────────────────────────
      await db.payment.updateMany({
        where: {
          id: payment.id,
          status: "PENDING",
        },
        data: {
          status: "FAILED",
          adminNote: `Payment failed: ${transactionStatus}`,
        },
      });

      console.log(`[Decentro Webhook] Payment ${payment.id} FAILED`);
    } else if (statusUpper === "EXPIRED") {
      // ─── Payment Expired ─────────────────────────────────────
      await db.payment.updateMany({
        where: {
          id: payment.id,
          status: "PENDING",
        },
        data: {
          status: "EXPIRED",
          adminNote: "Payment link expired",
        },
      });

      console.log(`[Decentro Webhook] Payment ${payment.id} EXPIRED`);
    }

    // Acknowledge the webhook
    return NextResponse.json({ response: "CB_S00000" });
  } catch (error) {
    console.error("[Decentro Webhook] Error:", error);
    // Still try to acknowledge to prevent retries
    return NextResponse.json({ response: "CB_S00000" });
  }
}

// Allow GET for webhook health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "NotiX Cloud - Decentro Webhook",
    timestamp: new Date().toISOString(),
  });
}
