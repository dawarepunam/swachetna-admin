import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification parameters" }, { status: 400 });
    }

    const hmac = crypto.createHmac("sha256", key_secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest("hex");

    const isMatch = generated_signature === razorpay_signature;

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid payment signature verification" }, { status: 400 });
    }

    return NextResponse.json({ verified: true, paymentId: razorpay_payment_id });
  } catch (error: any) {
    console.error("Signature verification error:", error);
    return NextResponse.json({ error: error?.message || "Verification failed" }, { status: 500 });
  }
}

