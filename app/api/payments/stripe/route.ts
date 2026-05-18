import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const { amount } = await request.json();
  if (!stripe) {
    return NextResponse.json({ error: "Card payment is not available right now." }, { status: 503 });
  }
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount) * 100),
    currency: "bdt",
    automatic_payment_methods: { enabled: true }
  });
  return NextResponse.json({ clientSecret: intent.client_secret });
}
