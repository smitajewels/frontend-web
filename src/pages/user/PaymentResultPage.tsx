import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { goldApi } from "../../api/endpoints";
import { PrimaryButton } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { formatInr } from "../../utils/format";

type Outcome = "loading" | "success" | "failure" | "login" | "idle" | "pending";

const PENDING_TXN_KEY = "payu_pending_txnid";
const VERIFY_ATTEMPTS = 12;
const VERIFY_DELAY_MS = 2000;

export function stashPendingPayuTxn(txnid: string) {
  try {
    sessionStorage.setItem(PENDING_TXN_KEY, txnid);
  } catch {
    /* ignore */
  }
}

/** @deprecated */
export function stashPendingPayuInvoice(invoiceNumber: string) {
  stashPendingPayuTxn(invoiceNumber);
}

function readPendingPayuTxn() {
  try {
    return sessionStorage.getItem(PENDING_TXN_KEY)?.trim() || "";
  } catch {
    return "";
  }
}

function clearPendingPayuTxn() {
  try {
    sessionStorage.removeItem(PENDING_TXN_KEY);
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPendingVerifyError(message: string) {
  return /not completed|pending|not captured|still processing|try again/i.test(message);
}

export default function PaymentResultPage({ kind }: { kind: "success" | "failure" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [params] = useSearchParams();
  const search = params.toString();
  const [outcome, setOutcome] = useState<Outcome>("loading");
  const [message, setMessage] = useState("Confirming your payment…");
  const finishedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (finishedRef.current) return;

    let cancelled = false;
    const query = new URLSearchParams(search);

    const settled = firstParam(query, ["settled"]).toLowerCase();
    const txnid =
      firstParam(query, ["txnid"]) || readPendingPayuTxn();
    const mihpayid = firstParam(query, ["mihpayid", "payuTransactionId"]) || undefined;
    const status =
      firstParam(query, ["status", "payuStatus", "result"]) || undefined;
    const amount = firstParam(query, ["amount"]) || undefined;
    const mode = firstParam(query, ["mode"]) || undefined;

    const markSuccess = async (detail?: string) => {
      if (cancelled) return;
      finishedRef.current = true;
      clearPendingPayuTxn();
      setOutcome("success");
      setMessage(detail || "Payment successful. Gold has been credited to your portfolio.");
      try {
        if (user) await refreshUser();
      } catch {
        /* ignore */
      }
      toast.success("Payment successful");
    };

    const markFailure = (detail?: string) => {
      if (cancelled) return;
      finishedRef.current = true;
      clearPendingPayuTxn();
      setOutcome("failure");
      setMessage(detail || "Payment failed or was cancelled. No gold was added.");
    };

    const verifyWithRetries = async () => {
      if (!txnid) {
        setOutcome("pending");
        setMessage("Payment is still processing at PayU. Check History in a moment.");
        return;
      }

      setOutcome("loading");
      setMessage("Confirming your payment with PayU…");

      let lastError = "Payment verification failed";

      for (let attempt = 1; attempt <= VERIFY_ATTEMPTS; attempt++) {
        if (cancelled) return;

        try {
          const verified = await goldApi.verifyBuyPayment({
            txnid,
            mihpayid,
            status:
              status === "success" || status === "paid" || kind === "success" ? "success" : status,
            amount,
            mode,
          });

          const g = verified.data?.breakdown.grams;
          const amt = verified.data?.breakdown.amountInr;
          await markSuccess(
            g != null && amt != null
              ? `Purchased ${g.toFixed(3)}g for ${formatInr(amt)}`
              : undefined
          );
          return;
        } catch (err) {
          lastError = err instanceof Error ? err.message : "Payment verification failed";

          if (/unauthorized|401/i.test(lastError)) {
            setOutcome("login");
            setMessage("Sign in to confirm this payment and credit gold to your account.");
            return;
          }

          if (/failed or cancelled|failed or canceled|payment failed/i.test(lastError)) {
            markFailure(lastError);
            return;
          }

          if (attempt < VERIFY_ATTEMPTS && isPendingVerifyError(lastError)) {
            setMessage(`Confirming payment… (${attempt}/${VERIFY_ATTEMPTS})`);
            await sleep(VERIFY_DELAY_MS);
            continue;
          }

          break;
        }
      }

      if (cancelled) return;

      if (isPendingVerifyError(lastError)) {
        setOutcome("pending");
        setMessage(
          "Payment is still processing at PayU. Gold will appear once confirmed — check History shortly."
        );
      } else {
        markFailure(lastError);
        toast.error(lastError);
      }
    };

    void (async () => {
      if (settled === "credited") {
        await markSuccess();
        return;
      }

      if (settled === "failed" || kind === "failure") {
        markFailure(
          firstParam(query, ["message", "error"]) ||
            "Payment failed or was cancelled. No gold was added."
        );
        return;
      }

      if (!txnid && !status && !mihpayid && !settled) {
        finishedRef.current = true;
        setOutcome("idle");
        setMessage(
          "This page confirms a PayU payment after checkout. Complete a purchase and PayU will return you here."
        );
        return;
      }

      if (!user) {
        setOutcome("login");
        setMessage(
          settled === "pending"
            ? "Payment is processing. Sign in to confirm and credit gold."
            : "Sign in to confirm this payment and credit gold to your account."
        );
        return;
      }

      await verifyWithRetries();
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, kind, search, refreshUser, user?.id]);

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
