import crypto from "crypto";

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const IS_PROD = process.env.MIDTRANS_IS_PRODUCTION === "true";

const SNAP_BASE = IS_PROD
  ? "https://app.midtrans.com"
  : "https://app.sandbox.midtrans.com";
const API_BASE = IS_PROD
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

const authHeader = () =>
  "Basic " + Buffer.from(SERVER_KEY + ":").toString("base64");

export type SnapItem = { id: string; price: number; quantity: number; name: string };
export type SnapCustomer = { name: string; email: string; phone: string };

// Buat transaksi Snap → kembalikan token untuk popup pembayaran.
export async function createSnapToken(params: {
  orderId: string;
  grossAmount: number;
  items: SnapItem[];
  customer: SnapCustomer;
}) {
  const body = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.grossAmount,
    },
    item_details: params.items.map((i) => ({
      id: i.id,
      price: i.price,
      quantity: i.quantity,
      name: i.name.slice(0, 50),
    })),
    customer_details: {
      first_name: params.customer.name.slice(0, 50),
      email: params.customer.email,
      phone: params.customer.phone,
    },
    credit_card: { secure: true },
  };

  const res = await fetch(`${SNAP_BASE}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.error_messages?.join(", ") || "Gagal membuat transaksi Midtrans."
    );
  }
  return data.token as string;
}

// Cek status transaksi langsung ke Midtrans (server-to-server, tepercaya).
export async function getTransactionStatus(orderId: string) {
  const res = await fetch(`${API_BASE}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: { Accept: "application/json", Authorization: authHeader() },
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

// Verifikasi signature webhook: sha512(order_id + status_code + gross_amount + ServerKey)
export function verifySignature(p: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}) {
  const expected = crypto
    .createHash("sha512")
    .update(p.order_id + p.status_code + p.gross_amount + SERVER_KEY)
    .digest("hex");
  return expected === p.signature_key;
}

// Map status Midtrans → status order internal.
export function mapStatus(transactionStatus: string, fraudStatus?: string): string {
  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "challenge" ? "PENDING" : "PAID";
    case "settlement":
      return "PAID";
    case "pending":
      return "PENDING";
    case "deny":
    case "cancel":
    case "expire":
    case "failure":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}
