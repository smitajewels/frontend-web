import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { goldApi } from "../../api/endpoints";
import { LiveRateBanner } from "../../components/GoldWidgets";
import { Header, Input, PrimaryButton, Screen } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import type { BuyGoldMode, GoldKarat, LiveGoldRates } from "../../types/api";
import { cn, formatInr } from "../../utils/format";
import { openRazorpayCheckout } from "../../utils/razorpay";

const KARATS: GoldKarat[] = ["K18", "K22", "K24"];
const RATES_POLL_MS = 30_000;

export default function BuyGoldPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [karat, setKarat] = useState<GoldKarat>("K24");
  const [mode, setMode] = useState<BuyGoldMode>("BY_GRAMS");
  const [grams, setGrams] = useState("0.5");
  const [amountInr, setAmountInr] = useState("5000");
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<LiveGoldRates | null>(null);
  const [ratesFetchedAt, setRatesFetchedAt] = useState<string | null>(null);

  const loadRates = useCallback(async () => {
    try {
      const r = await goldApi.getLiveRates();
      if (r.data) {
        setRates(r.data);
        setRatesFetchedAt(new Date().toISOString());
      }
    } catch {
      /* keep last */
    }
  }, []);

  useEffect(() => {
    loadRates();
    const timer = window.setInterval(loadRates, RATES_POLL_MS);
    return () => window.clearInterval(timer);
  }, [loadRates]);

  const onBuy = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await goldApi.createBuyOrder(
        karat,
        mode,
        mode === "BY_AMOUNT" ? Number(amountInr) : undefined,
        mode === "BY_GRAMS" ? Number(grams) : undefined
      );

      if (!res.data?.razorpay) throw new Error("Failed to create payment order");
      const { razorpay, breakdown } = res.data;

      if (razorpay.paymentLinkUrl && !razorpay.orderId) {
        window.location.href = razorpay.paymentLinkUrl;
        return;
      }

      await openRazorpayCheckout(
        razorpay,
        async (paymentResponse) => {
          try {
            const verified = await goldApi.verifyBuyPayment({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });
            const g = verified.data?.breakdown.grams ?? breakdown.grams;
            const amt = verified.data?.breakdown.amountInr ?? breakdown.amountInr;
            await refreshUser();
            toast.success(`Purchased ${g.toFixed(3)}g for ${formatInr(amt)}`);
            navigate("/app");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        () => setLoading(false)
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Purchase failed");
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Buy Gold" onBack={() => navigate(-1)} />
      <Screen>
        <h1 className="mt-2 text-[22px] font-semibold text-ink">Buy Gold</h1>
        <p className="mb-4 text-[13px] text-muted">Pay securely via Razorpay</p>

        {rates ? (
          <div className="mb-4">
            <LiveRateBanner rates={rates} updatedAt={ratesFetchedAt} />
          </div>
        ) : null}

        <form onSubmit={onBuy}>
          <p className="mb-2 text-sm font-medium text-muted">Select karat</p>
          <div className="mb-4 flex gap-2">
            {KARATS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKarat(k)}
                className={cn(
                  "flex-1 rounded-md border py-3 text-center font-semibold transition",
                  karat === k
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-ink hover:bg-surface-muted"
                )}
              >
                {k.replace("K", "")}K
              </button>
            ))}
          </div>

          <div className="mb-4 flex gap-2">
            {(
              [
                { label: "By Grams", value: "BY_GRAMS" as const },
                { label: "By Amount", value: "BY_AMOUNT" as const },
              ] as const
            ).map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={cn(
                  "flex-1 rounded-md border py-3 text-center transition",
                  mode === m.value
                    ? "border-primary bg-surface-muted font-semibold text-primary-dark"
                    : "border-border text-muted"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === "BY_GRAMS" ? (
            <Input label="Grams" inputMode="decimal" value={grams} onChange={(e) => setGrams(e.target.value)} />
          ) : (
            <Input
              label="Amount (INR)"
              inputMode="decimal"
              value={amountInr}
              onChange={(e) => setAmountInr(e.target.value)}
            />
          )}

          <div className="mb-6 flex flex-wrap gap-2">
            {["0.1", "0.5", "1", "5"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setMode("BY_GRAMS");
                  setGrams(g);
                }}
                className="rounded-full border border-border bg-surface-muted px-3.5 py-2 text-sm font-medium text-primary-dark"
              >
                {g}g
              </button>
            ))}
          </div>

          <PrimaryButton type="submit" loading={loading}>
            Pay with Razorpay
          </PrimaryButton>
        </form>
      </Screen>
    </>
  );
}
