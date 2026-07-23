import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/endpoints";
import { Card, EmptyState, Screen, Skeleton } from "../../components/ui";
import type { GoldTransaction } from "../../types/api";
import { formatDate, formatGrams, formatInr } from "../../utils/format";

export default function TodayPurchasesPage() {
  const [items, setItems] = useState<GoldTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .todayPurchases("today")
      .then((r) => setItems(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen narrow={false} className="max-w-3xl">
      <h1 className="mb-4 mt-2 text-[22px] font-semibold text-ink">Today&apos;s gold</h1>
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : items.length === 0 ? (
        <EmptyState message="No purchases today" />
      ) : (
        items.map((tx) => {
          const name = tx.user?.name || "Customer";
          return (
            <Card key={tx.id} className="mb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{name}</p>
                  {tx.user?.email ? (
                    <p className="mt-0.5 text-[13px] text-muted">{tx.user.email}</p>
                  ) : null}
                  <p className="mt-1 text-[13px] text-muted">
                    {tx.karat.replace("K", "")}K · {formatGrams(tx.grams)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success">+{formatInr(tx.amountInr)}</p>
                  <p className="mt-0.5 text-[13px] text-faint">{formatDate(tx.createdAt)}</p>
                </div>
              </div>
              {tx.userId ? (
                <div className="mt-3 flex gap-3 border-t border-border pt-2">
                  <Link
                    to={`/admin/customers/${tx.userId}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Portfolio
                  </Link>
                  <Link
                    to={`/admin/collect/${tx.userId}?name=${encodeURIComponent(name)}`}
                    className="text-sm font-semibold text-primary-dark hover:underline"
                  >
                    Collect gold
                  </Link>
                </div>
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}
