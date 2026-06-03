// Paddle checkout helper — one-time payments via Paddle Billing API
const PADDLE_SANDBOX = "https://sandbox-api.paddle.com";
const PADDLE_LIVE = "https://api.paddle.com";

function getPaddleConfig() {
  const apiKey = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const isLive = process.env.NEXT_PUBLIC_PADDLE_ENV === "live";
  return {
    apiKey,
    baseUrl: isLive ? PADDLE_LIVE : PADDLE_SANDBOX,
    isConfigured: !!apiKey,
  };
}

export interface CreateCheckoutParams {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutResult {
  url: string;
}

/**
 * Create a Paddle checkout for a one-time purchase.
 * Returns the checkout URL to redirect the user to.
 */
export async function createPaddleCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult> {
  const config = getPaddleConfig();
  if (!config.isConfigured) throw new Error("PADDLE_API_KEY not configured");

  const body: Record<string, unknown> = {
    items: [{ price_id: params.priceId, quantity: 1 }],
    customer: { email: params.userEmail },
    custom_data: { user_id: params.userId },
    status_url: params.successUrl,
    passthrough: JSON.stringify({ user_id: params.userId }),
  };

  // Paddle checkout endpoint
  const res = await fetch(`${config.baseUrl}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Paddle checkout failed: ${res.status} ${err}`);
  }

  const json = await res.json() as { data?: { checkout?: { id?: string; checkout_url?: string } } };
  const checkoutUrl = json.data?.checkout?.checkout_url;

  if (!checkoutUrl) {
    throw new Error(`Paddle checkout URL not found in response: ${JSON.stringify(json)}`);
  }

  return { url: checkoutUrl };
}
