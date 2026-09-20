import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  generatePaymentLink,
  isDecentroConfigured,
} from "@/lib/decentro";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await db.payment.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, txId, method } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (amount < 5) {
      return NextResponse.json(
        { error: "Minimum amount is ₹5" },
        { status: 400 }
      );
    }

    if (amount > 100000) {
      return NextResponse.json(
        { error: "Maximum amount is ₹1,00,000" },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    // ─── UPI Payment via Decentro ────────────────────────────────
    if (method === "UPI" && isDecentroConfigured()) {
      try {
        // Create a pending payment record first
        const payment = await db.payment.create({
          data: {
            userId,
            amount: parseFloat(amount),
            status: "PENDING",
            paymentMethod: "UPI_DECENTRO",
          },
        });

        // Generate UPI payment link via Decentro
        const result = await generatePaymentLink({
          amount: parseFloat(amount),
          purposeMessage: `NotiX Cloud Deposit #${payment.id.slice(-6)}`,
          referenceId: payment.id,
          expiryMinutes: 30,
        });

        // Update payment with Decentro response data
        const updatedPayment = await db.payment.update({
          where: { id: payment.id },
          data: {
            decentroTxnId: result.data.transactionId,
            paymentLink: result.data.generatedLink || result.data.upiUri || "",
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
        });

        return NextResponse.json({
          ...updatedPayment,
          qrCode: result.data.encodedDynamicQrCode,
          upiUri: result.data.upiUri,
          pspUri: result.data.pspUri,
          generatedLink: result.data.generatedLink,
        });
      } catch (error: any) {
        console.error("Decentro payment error:", error);
        return NextResponse.json(
          { error: error.message || "Failed to generate UPI payment link" },
          { status: 502 }
        );
      }
    }

    // ─── Manual Payment (legacy flow) ────────────────────────────
    if (!txId) {
      return NextResponse.json(
        { error: "Transaction ID is required for manual payments" },
        { status: 400 }
      );
    }

    const payment = await db.payment.create({
      data: {
        userId,
        amount: parseFloat(amount),
        txId,
        status: "PENDING",
        paymentMethod: "MANUAL",
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
