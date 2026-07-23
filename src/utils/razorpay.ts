import type { RazorpayCheckout } from "../types/api";

export async function openRazorpayCheckout(
  checkout: RazorpayCheckout,
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void,
  onDismiss?: () => void
) {
  if (!window.Razorpay) {
    throw new Error("Razorpay checkout is not available");
  }

  const rzp = new window.Razorpay({
    key: checkout.keyId,
    amount: checkout.amount,
    currency: checkout.currency,
    name: checkout.name,
    description: checkout.description,
    order_id: checkout.orderId,
    prefill: checkout.prefill,
    theme: { color: "#B8860B" },
    handler: onSuccess,
    modal: { ondismiss: onDismiss },
  });

  rzp.open();
}
