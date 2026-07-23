import { useEffect, useState } from "react";
import { goldApi } from "../../api/endpoints";
import { TransactionTile } from "../../components/GoldWidgets";
import { Card, Chip, EmptyState, Screen, Skeleton, Tabs } from "../../components/ui";
import type { GoldTransaction, RazorpayPayment } from "../../types/api";
import { cn, formatDateTime, formatInr } from "../../utils/format";

type Tab = "transactions" | "payments";

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>("transactions");
  const [filter, setFilter] = useState<string | undefined>();
  const [items, setItems] = useState<GoldTransaction[]>([]);
  const [payments, setPayments] = useState<RazorpayPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        if (tab === "transactions") {
          const r = await goldApi.transactions(1, filter);
          if (alive) setItems(r.data?.items ?? []);
        } else {
          const r = await goldApi.payments(1, filter);
          if (alive) setPayments(r.data?.items ?? []);
        }
      } catch {
        if (alive) {
          setItems([]);
          setPayments([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tab, filter]);

  return (
    <Screen>
      <h1 className="mb-4 mt-2 text-[22px] font-semibold text-ink">History</h1>

      <Tabs
        tabs={[
          { label: "Gold", value: "transactions" },
          { label: "Payments", value: "payments" },
        ]}
        value={tab}
        onChange={(v) => {
          setFilter(undefined);
          setTab(v as Tab);
        }}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(tab === "transactions"
          ? [
              { label: "All", value: undefined },
              { label: "Purchase", value: "PURCHASE" },
              { label: "Collect", value: "COLLECT" },
            ]
          : [
              { label: "All", value: undefined },
              { label: "Paid", value: "CAPTURED" },
              { label: "Pending", value: "CREATED" },
              { label: "Failed", value: "FAILED" },
            ]
        ).map((f) => (
          <Chip key={f.label} active={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : tab === "transactions" ? (
        items.length === 0 ? (
          <EmptyState message="No transactions yet" />
        ) : (
          items.map((tx) => (
            <TransactionTile
              key={tx.id}
              type={tx.type}
              karat={tx.karat}
              grams={tx.grams}
              amountInr={tx.amountInr}
              date={tx.createdAt}
            />
          ))
        )
      ) : payments.length === 0 ? (
        <EmptyState message="No payments yet" />
      ) : (
        payments.map((p) => (
          <Card key={p.id} className="mb-2">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-ink">{formatInr(p.amountInr)}</p>
              <span
                className={cn(
                  "text-xs font-bold",
                  p.status === "CAPTURED" && "text-success",
                  p.status === "FAILED" && "text-error",
                  p.status !== "CAPTURED" && p.status !== "FAILED" && "text-warning"
                )}
              >
                {p.status}
              </span>
            </div>
            <p className="mt-1 text-[13px] text-muted">Order: {p.razorpayOrderId}</p>
            {p.razorpayPaymentId ? (
              <p className="mt-1 text-[13px] text-muted">Payment: {p.razorpayPaymentId}</p>
            ) : null}
            <p className="mt-1.5 text-[13px] text-faint">{formatDateTime(p.createdAt)}</p>
          </Card>
        ))
      )}
    </Screen>
  );
}
