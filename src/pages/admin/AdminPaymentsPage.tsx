import { useEffect, useState } from "react";
import { adminApi } from "../../api/endpoints";
import { Card, Chip, EmptyState, Screen, Skeleton } from "../../components/ui";
import type { AdminPayment } from "../../types/api";
import { cn, formatDateTime, formatInr } from "../../utils/format";

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<AdminPayment[]>([]);
  const [status, setStatus] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi
      .payments(1, status)
      .then((r) => setItems(r.data?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <Screen narrow={false} className="max-w-3xl">
      <h1 className="mb-4 mt-2 text-[22px] font-semibold text-ink">Payment history</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { label: "All", value: undefined },
          { label: "Paid", value: "CAPTURED" },
          { label: "Pending", value: "CREATED" },
          { label: "Failed", value: "FAILED" },
        ].map((f) => (
          <Chip key={f.label} active={status === f.value} onClick={() => setStatus(f.value)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : items.length === 0 ? (
        <EmptyState message="No payments found" />
      ) : (
        items.map((p) => (
          <Card key={p.id} className="mb-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-ink">{formatInr(p.amountInr)}</p>
                <p className="text-[13px] text-muted">{p.user?.name || p.userId}</p>
              </div>
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
            <p className="mt-2 text-[13px] text-faint">{formatDateTime(p.createdAt)}</p>
          </Card>
        ))
      )}
    </Screen>
  );
}
