import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { goldApi } from "../../api/endpoints";
import { PrimaryButton } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { formatInr } from "../../utils/format";

type Outcome = "loading" | "success" | "failure" | "login" | "idle" | "pending";

const PENDING_INVOICE_KEY = "payu_pending_invoice";

export function stashPendingPayuInvoice(invoiceNumber: string) {
  try {
    sessionStorage.setItem(PENDING_INVOICE_KEY, invoiceNumber);
  } catch {
    /* ignore */
  }
}

function readPendingPayuInvoice() {
  try {
    return sessionStorage.getItem(PENDING_INVOICE_KEY)?.trim() || "";
  } catch {
    return "";
  }
}

function clearPendingPayuInvoice() {
  try {
    sessionStorage.removeItem(PENDING_INVOICE_KEY);
  } catch {
    /* ignore */
  }
}

function firstParam(params: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = params.get(key);
    if (value && value.trim()) return value.trim();
  }
  return "";
}

export default function PaymentResultPage({ kind }: { kind: "success" | "failure" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [params] = useSearchParams();
  const [outcome, setOutcome] = useState<Outcome>("loading");
  const [message, setMessage] = useState("Loading payment result…");
  const ran = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (ran.current) return;
    ran.current = true;

    const settled = firstParam(params, ["settled"]).toLowerCase();
    const invoiceNumber =
      firstParam(params, [
        "payuInvoiceNumber",
        "invoiceNumber",
        "invoice_number",
        "txnid",
        "udf1",
      ]) || readPendingPayuInvoice();
    const txnId =
      firstParam(params, ["payuTransactionId", "mihpayid", "payuId", "txnId"]) || undefined;
    const status =
      firstParam(params, ["payuStatus", "status", "txnStatus", "paymentStatus", "result"]) ||
      undefined;

    // Backend already settled DB on the PayU redirect bridge.
    if (settled === "credited") {
      clearPendingPayuInvoice();
      setOutcome("success");
      setMessage("Payment successful. Gold has been credited to your portfolio.");
      if (user) {
        void refreshUser().then(() => toast.success("Gold credited"));
      } else {
        toast.success("Payment successful");
      }
      return;
    }

    if (settled === "failed" || kind === "failure") {
      clearPendingPayuInvoice();
      setOutcome("failure");
      setMessage(
        firstParam(params, ["message", "error"]) ||
          "Payment failed or was cancelled. No gold was added."
      );
      return;
    }

    if (!invoiceNumber && !status && !txnId && !settled) {
      setOutcome("idle");
      setMessage(
        "This page confirms a PayU payment after checkout. Complete a purchase and PayU will return you here."
      );
      return;
    }

    // Backend said pending, or settled missing — try verify if logged in.
    if (!user) {
      setOutcome("login");
      setMessage(
        settled === "pending"
          ? "Payment is processing. Sign in to confirm and credit gold."
          : "Sign in to confirm this payment and credit gold to your account."
      );
      return;
    }

    if (!invoiceNumber) {
      setOutcome(settled === "pending" ? "pending" : "failure");
      setMessage(
        settled === "pending"
          ? "Payment is still processing at PayU. Check History in a moment."
          : "Missing payment reference from PayU."
      );
      return;
    }

    setMessage("Confirming your payment with the server…");

    void (async () => {
      try {
        const verified = await goldApi.verifyBuyPayment({
          provider: "PAYU",
          payuInvoiceNumber: invoiceNumber,
          payuTransactionId: txnId,
          payuStatus: status === "success" || status === "paid" ? "success" : status,
        });
        clearPendingPayuInvoice();
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
        const msg = err instanceof Error ? err.message : "Payment verification failed";
        if (/not completed|pending|not captured/i.test(msg)) {
          setOutcome("pending");
          setMessage("Payment is still processing. Gold will appear once PayU confirms — check History shortly.");
        } else {
          setOutcome("failure");
          setMessage(msg);
          toast.error(msg);
        }
      }
    })();
  }, [authLoading, kind, params, refreshUser, user]);

  const title =
    outcome === "loading"
      ? "Processing payment"
      : outcome === "success"
        ? "Payment successful"
        : outcome === "login"
          ? "Sign in required"
          : outcome === "idle"
            ? "Payment confirmation"
            : outcome === "pending"
              ? "Payment pending"
              : "Payment failed";

  const titleColor =
    outcome === "success"
      ? "text-success"
      : outcome === "failure"
        ? "text-error"
        : outcome === "pending"
          ? "text-warning"
          : "text-ink";

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="border-b border-border/60 bg-bg/95 px-4 py-3">
        <div className="mx-auto flex max-w-[480px] items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(user ? "/app" : "/login")}
            className="rounded-sm px-2 py-1 text-primary-dark hover:bg-surface-muted"
            aria-label="Back"
          >
            ←
          </button>
          <h1 className="flex-1 text-lg font-semibold text-primary-dark">Payment</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[480px] px-4 py-8">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
            Smita Jewellers
          </p>
          <h2 className={`mt-2 text-[22px] font-semibold ${titleColor}`}>{title}</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">{message}</p>

          <div className="mt-8 flex flex-col gap-3">
            {outcome === "login" ? (
              <PrimaryButton
                type="button"
                onClick={() =>
                  navigate("/login", {
                    state: { from: { pathname: location.pathname, search: location.search } },
                  })
                }
              >
                Sign in to confirm
              </PrimaryButton>
            ) : outcome === "idle" ? (
              <PrimaryButton type="button" onClick={() => navigate(user ? "/app/buy" : "/login")}>
                {user ? "Buy gold" : "Sign in"}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                type="button"
                onClick={() => navigate(user ? "/app" : "/login")}
                loading={outcome === "loading"}
              >
                {outcome === "loading" ? "Please wait" : user ? "Go to Home" : "Sign in"}
              </PrimaryButton>
            )}

            {outcome !== "loading" && user ? (
              <Link to="/app/history" className="text-center text-sm font-medium text-primary-dark">
                View history
              </Link>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
