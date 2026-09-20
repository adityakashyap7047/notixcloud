/**
 * Decentro API Client
 * Handles authentication, UPI payment link generation, and transaction status polling.
 */

const DECENTRO_BASE_URL = process.env.DECENTRO_BASE_URL || "https://in.staging.decentro.tech";
const DECENTRO_CLIENT_ID = process.env.DECENTRO_CLIENT_ID || "";
const DECENTRO_CLIENT_SECRET = process.env.DECENTRO_CLIENT_SECRET || "";
const DECENTRO_MODULE_SECRET = process.env.DECENTRO_MODULE_SECRET || "";
const DECENTRO_PROVIDER_SECRET = process.env.DECENTRO_PROVIDER_SECRET || "";
const DECENTRO_CONSUMER_URN = process.env.DECENTRO_CONSUMER_URN || "";

// JWT token cache
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Generate or retrieve cached JWT token from Decentro
 */
async function getAuthToken(): Promise<string> {
  // Return cached token if still valid (14 min buffer on 15 min expiry)
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await fetch(`${DECENTRO_BASE_URL}/v2/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: DECENTRO_CLIENT_ID,
      client_secret: DECENTRO_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Decentro auth failed:", errorText);
    throw new Error(`Decentro auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token || data.data?.token;
  // Cache for 14 minutes (token valid for 15 min)
  tokenExpiresAt = Date.now() + 14 * 60 * 1000;

  if (!cachedToken) {
    throw new Error("No token received from Decentro");
  }

  return cachedToken;
}

/**
 * Get common headers for Decentro API calls
 */
async function getHeaders(): Promise<Record<string, string>> {
  // Try JWT auth first, fallback to direct credentials
  try {
    const token = await getAuthToken();
    return {
      "Content-Type": "application/json",
      client_id: DECENTRO_CLIENT_ID,
      client_secret: DECENTRO_CLIENT_SECRET,
      module_secret: DECENTRO_MODULE_SECRET,
      provider_secret: DECENTRO_PROVIDER_SECRET,
      Authorization: `Bearer ${token}`,
    };
  } catch {
    // Fallback: use client_id/client_secret directly (some Decentro endpoints allow this)
    return {
      "Content-Type": "application/json",
      client_id: DECENTRO_CLIENT_ID,
      client_secret: DECENTRO_CLIENT_SECRET,
      module_secret: DECENTRO_MODULE_SECRET,
      provider_secret: DECENTRO_PROVIDER_SECRET,
    };
  }
}

export interface GeneratePaymentLinkParams {
  amount: number;
  purposeMessage: string;
  expiryMinutes?: number;
  referenceId: string;
  redirectUrl?: string;
}

export interface DecentroPaymentLinkResponse {
  status: string;
  responseCode: string;
  message: string;
  data: {
    transactionId: string;
    transactionStatusDescription: string;
    encodedDynamicQrCode?: string;
    upiUri?: string;
    pspUri?: {
      commonUri?: string;
      gpayUri?: string;
      phonepeUri?: string;
      paytmUri?: string;
    };
    generatedLink?: string;
  };
}

export interface DecentroTransactionStatusResponse {
  status: string;
  responseCode: string;
  message: string;
  data: {
    transactionId: string;
    transactionStatus: string;
    transactionStatusDescription: string;
    bankReferenceNumber?: string;
    npciTransactionId?: string;
  };
}

/**
 * Generate a UPI payment link via Decentro
 */
export async function generatePaymentLink(
  params: GeneratePaymentLinkParams
): Promise<DecentroPaymentLinkResponse> {
  const headers = await getHeaders();

  const body: Record<string, unknown> = {
    reference_id: params.referenceId,
    payee_account: DECENTRO_CONSUMER_URN,
    amount: params.amount,
    purpose_message: params.purposeMessage.substring(0, 50),
    expiry_time: params.expiryMinutes || 30,
    generate_qr: 1,
    generate_uri: 1,
    generate_psp_uri: true,
  };

  if (params.redirectUrl) {
    body.redirect_url = params.redirectUrl;
  }

  console.log("[Decentro] Generating payment link:", {
    amount: params.amount,
    referenceId: params.referenceId,
  });

  const response = await fetch(`${DECENTRO_BASE_URL}/v2/payments/upi/link`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[Decentro] Payment link error:", data);
    throw new Error(
      data.message || `Decentro API error: ${response.status}`
    );
  }

  console.log("[Decentro] Payment link generated:", data?.data?.transactionId);

  return {
    status: data.status,
    responseCode: data.responseCode,
    message: data.message,
    data: {
      transactionId: data.data?.transactionId || data.decentroTxnId,
      transactionStatusDescription: data.data?.transactionStatusDescription || "",
      encodedDynamicQrCode: data.data?.encodedDynamicQrCode,
      upiUri: data.data?.upiUri,
      pspUri: data.data?.pspUri,
      generatedLink: data.data?.generatedLink,
    },
  };
}

/**
 * Check payment/transaction status via Decentro
 */
export async function getTransactionStatus(
  decentroTxnId: string
): Promise<DecentroTransactionStatusResponse> {
  const headers = await getHeaders();

  const response = await fetch(
    `${DECENTRO_BASE_URL}/v2/payments/transaction/${decentroTxnId}/status`,
    {
      method: "GET",
      headers,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("[Decentro] Status check error:", data);
    throw new Error(
      data.message || `Decentro status check failed: ${response.status}`
    );
  }

  return {
    status: data.status,
    responseCode: data.responseCode,
    message: data.message,
    data: {
      transactionId: data.data?.transactionId || decentroTxnId,
      transactionStatus: data.data?.transactionStatus || "PENDING",
      transactionStatusDescription: data.data?.transactionStatusDescription || "",
      bankReferenceNumber: data.data?.bankReferenceNumber,
      npciTransactionId: data.data?.npciTransactionId,
    },
  };
}

/**
 * Check if Decentro is configured
 */
export function isDecentroConfigured(): boolean {
  return !!(
    DECENTRO_CLIENT_ID &&
    DECENTRO_CLIENT_SECRET &&
    DECENTRO_MODULE_SECRET
  );
}
