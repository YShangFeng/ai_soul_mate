"use client";

import { useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddlePromise: Promise<Paddle | undefined> | null = null;

function getPaddle() {
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as "sandbox" | "production") ?? "sandbox",
      checkout: {
        settings: { displayMode: "overlay", theme: "dark" },
      },
      eventCallback: async (event) => {
        if (event.name === "checkout.completed") {
          // Read userId and tier from customData (not closure, safe for reuse)
          const customData = event.data?.custom_data as { user_id?: string; tier?: string } | undefined;
          const userId = customData?.user_id;
          const tier = customData?.tier;
          if (userId && tier) {
            const txId = event.data?.transaction_id ?? "";
            await fetch("/api/paddle/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, transactionId: txId, tier }),
            });
            window.location.href = "/settings?checkout=success";
          }
        }
      },
    });
  }
  return paddlePromise;
}

const PRICES: Record<string, string> = {
  moon: process.env.NEXT_PUBLIC_PADDLE_MOON_PRICE_ID ?? "",
  starlight: process.env.NEXT_PUBLIC_PADDLE_STARLIGHT_PRICE_ID ?? "",
};

interface PaddleCheckoutProps {
  tier: "moon" | "starlight";
  className?: string;
  children: React.ReactNode;
  userId?: string;
}

export default function PaddleCheckoutButton({ tier, className, children, userId }: PaddleCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const priceId = PRICES[tier];

  const handleClick = async () => {
    if (!priceId) return;
    setLoading(true);
    try {
      const paddle = await getPaddle();
      if (paddle) {
        paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          customData: userId ? { user_id: userId, tier } : undefined,
        });
      }
    } catch (err) {
      console.error("Paddle checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={loading || !priceId} className={className}>
      {loading ? "Loading..." : children}
    </button>
  );
}
