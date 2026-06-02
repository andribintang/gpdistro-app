import { NextResponse } from "next/server";
import { verifySignature, mapStatus } from "@/lib/midtrans";
import { applyOrderStatus } from "@/lib/orders";

// URL ini didaftarkan di dashboard Midtrans → Settings → Configuration →
// Payment Notification URL. Untuk lokal, expose via tunnel (mis. ngrok).
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const valid = verifySignature({
      order_id: body.order_id,
      status_code: body.status_code,
      gross_amount: body.gross_amount,
      signature_key: body.signature_key,
    });
    if (!valid) {
      return NextResponse.json({ error: "Signature tidak valid." }, { status: 403 });
    }

    const mapped = mapStatus(body.transaction_status, body.fraud_status);
    await applyOrderStatus(body.order_id, mapped);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Error" }, { status: 400 });
  }
}
