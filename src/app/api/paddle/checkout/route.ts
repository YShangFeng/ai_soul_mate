import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaddleCheckout } from "@/lib/paddle/client";

const PRICE_IDS: Record<string, string> = {
  moon: process.env.PADDLE_MOON_PRICE_ID ?? "",
  starlight: process.env.PADDLE_STARLIGHT_PRICE_ID ?? "",
};

export async function POST(request: NextRequest) {
  if (!process.env.PADDLE_API_KEY) {
    return NextResponse.json(
      { error: { code: "NOT_CONFIGURED", message: "Payment is not available yet. Check back soon!" } },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to upgrade." } },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const plan = (body.plan as string) ?? "moon";
  const priceId = PRICE_IDS[plan];

  if (!priceId) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: `Unknown plan: ${plan}` } },
      { status: 400 },
    );
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const result = await createPaddleCheckout({
      priceId,
      userId: user.id,
      userEmail: user.email ?? "",
      successUrl: `${origin}/profile?checkout=success`,
      cancelUrl: `${origin}/pricing?checkout=canceled`,
    });

    return NextResponse.json({ data: { url: result.url } });
  } catch (err) {
    console.error("Paddle checkout error:", err);
    return NextResponse.json(
      { error: { code: "CHECKOUT_FAILED", message: "Failed to create checkout session." } },
      { status: 500 },
    );
  }
}
