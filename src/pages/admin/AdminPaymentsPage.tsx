import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminApi } from "../../api/endpoints";
import { Card, Chip, EmptyState, Screen, SearchBar, Skeleton } from "../../components/ui";
import type { AdminPayment } from "../../types/api";
import { cn, formatDateTime, formatInr } from "../../utils/format";

export default function AdminPaymentsPage() {
  const [params] = useSearchParams();
  const filterUserId = params.get("userId") || undefined;
  const filterUserName = params.get("name") || "";

  const [items, setItems] = useState<AdminPayment[]>([]);
  const [status, setStatus] = useState<string | undefined>();
  const [search, setSearch] = useState(filterUserName);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi
      .payments(1, status, filterUserId)
      .then((r) => setItems(r.data?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [status, filterUserId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => {
      const name = p.user?.name?.toLowerCase() ?? "";
      const email = p.user?.email?.toLowerCase() ?? "";
      return name.includes(q) || email.includes(q) || p.userId.toLowerCase().includes(q);
    });
  }, [items, search]);

  return (
    <Screen narrow={false} className="max-w-3xl">
      <h1 className="mb-1 mt-2 text-[22px] font-semibold text-ink">Payment history</h1>
      <p className="mb-4 text-[13px] text-muted">
        {filterUserId
          ? `Showing payments for ${filterUserName || "selected customer"}`
          : "All customer Razorpay payments"}
      </p>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by customer name" />

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
        {filterUserId ? (
          <Link
            to="/admin/payments"
            className="rounded-full border border-border px-3.5 py-2 text-[13px] text-muted hover:bg-surface-muted"
          >
            Clear customer filter
          </Link>
        ) : null}
      </div>

      {loading ? (
        <Skeleton className="h-28 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState message="No payments found" />
      ) : (
        filtered.map((p) => {
          const customerName = p.user?.name?.trim() || "Unknown customer";
          const customerEmail = p.user?.email;
          return (
            <Card key={p.id} className="mb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-ink">{customerName}</p>
                  {customerEmail ? (
                    <p className="mt-0.5 truncate text-[13px] text-muted">{customerEmail}</p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-sm px-2 py-1 text-xs font-bold",
                    p.status === "CAPTURED" && "bg-eligible text-success",
                    p.status === "FAILED" && "bg-red-50 text-error",
                    p.status !== "CAPTURED" && p.status !== "FAILED" && "bg-orange-50 text-warning"
                  )}
                >
                  {p.status}
                </span>
              </div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold text-primary-dark">{formatInr(p.amountInr)}</p>
                  <p className="mt-1 text-[13px] text-faint">{formatDateTime(p.createdAt)}</p>
                </div>
                {p.user?.id ? (
                  <Link
                    to={`/admin/customers/${p.user.id}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Portfolio →
                  </Link>
                ) : null}
              </div>

              <div className="mt-3 border-t border-border pt-2 text-[12px] text-muted">
                <p>Order: {p.razorpayOrderId}</p>
                {p.razorpayPaymentId ? <p className="mt-0.5">Payment: {p.razorpayPaymentId}</p> : null}
              </div>
            </Card>
          );
        })
      )}
    </Screen>
  );
}
