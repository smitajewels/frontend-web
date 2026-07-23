import { useEffect, useState } from "react";
import { adminApi } from "../../api/endpoints";
import { TransactionTile } from "../../components/GoldWidgets";
import { EmptyState, Screen, Skeleton } from "../../components/ui";
import type { GoldTransaction } from "../../types/api";

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
      )}
    </Screen>
  );
}
