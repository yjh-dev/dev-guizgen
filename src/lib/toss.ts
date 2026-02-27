// Phase 4: Toss Payments 스켈레톤

export interface TossPaymentRequest {
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
  successUrl: string;
  failUrl: string;
}

export interface TossPaymentConfirm {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export async function confirmPayment(
  params: TossPaymentConfirm
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return { success: false, error: "Toss secret key not configured" };
  }

  const response = await fetch(
    "https://api.tosspayments.com/v1/payments/confirm",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    return { success: false, error: error.message };
  }

  return { success: true };
}
