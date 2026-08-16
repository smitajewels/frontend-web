import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { goldApi } from "../../api/endpoints";
import { Header, PrimaryButton, Screen } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { formatInr } from "../../utils/format";

type Outcome = "loading" | "success" | "failure";

function firstParam(params: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = params.get(key);
    if (value && value.trim()) return value.trim();
  }
  return "";
}

export default function PaymentResultPage({ kind }: { kind: "success" | "failure" }) {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [params] = useSearchParams();
  const [outcome, setOutcome] = useState<Outcome>("loading");
  const [message, setMessage] = useState("Confirming your payment…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // PayU may redirect with invoiceNumber, txnid, udf1 (we store invoice in udf1), etc.
    const invoiceNumber = firstParam(params, [
      "payuInvoiceNumber",
      "invoiceNumber",
      "invoice_number",
      "txnid",
      "udf1",
    ]);
    const txnId =
      firstParam(params, ["payuTransactionId", "mihpayid", "payuId", "txnId"]) || undefined;
    const status =
      firstParam(params, ["payuStatus", "status", "txnStatus", "paymentStatus"]) || undefined;
    const statusLc = (status || "").toLowerCase();
    const failedStatus =
      kind === "failure" ||
      ["failure", "failed", "cancelled", "canceled", "error", "bounced"].includes(statusLc);

    if (failedStatus) {
      setOutcome("failure");
      setMessage(
        firstParam(params, ["message", "error", "error_Message", "field9"]) ||
          "Payment was cancelled or failed."
      );
      return;
    }

    if (!invoiceNumber) {
      setOutcome("failure");
      setMessage("Missing payment reference. Please check History or contact support.");
      return;
    }

    void (async () => {
      try {
        const verified = await goldApi.verifyBuyPayment({
          provider: "PAYU",
          payuInvoiceNumber: invoiceNumber,
          payuTransactionId: txnId,
          payuStatus: status,
        });
        const g = verified.data?.breakdown.grams;
        const amt = verified.data?.breakdown.amountInr;
        await refreshUser();
        setOutcome("success");
        setMessage(
          g != null && amt != null
            ? `Purchased ${g.toFixed(3)}g for ${formatInr(amt)}`
            : "Payment successful. Gold credited to your portfolio."
        );
        toast.success("Payment verified");
      } catch (err) {
        setOutcome("failure");
        setMessage(err instanceof Error ? err.message : "Payment verification failed");
        toast.error(err instanceof Error ? err.message : "Payment verification failed");
      }
    })();
  }, [kind, params, refreshUser]);

  return (
    <>
      <Header title="Payment" onBack={() => navigate("/app")} />
      <Screen>
        <h1 className="mt-2 text-[22px] font-semibold text-ink">
          {outcome === "loading" ? "Processing…" : outcome === "success" ? "Payment successful" : "Payment failed"}
        </h1>
        <p className="mt-3 text-[14px] text-muted">{message}</p>
        <div className="mt-8 flex flex-col gap-3">
          <PrimaryButton type="button" onClick={() => navigate("/app")} loading={outcome === "loading"}>
            {outcome === "loading" ? "Please wait" : "Go to Home"}
          </PrimaryButton>
          {outcome !== "loading" ? (
            <Link to="/app/history" className="text-center text-sm font-medium text-primary-dark">
              View history
            </Link>
          ) : null}
        </div>
      </Screen>
    </>
  );
}
