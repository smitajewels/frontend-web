import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/endpoints";
import { Card, EmptyState, Screen, Skeleton } from "../../components/ui";
import type { AdminCustomer } from "../../types/api";
import { formatGrams, formatInr } from "../../utils/format";

export default function CollectGoldPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .customersWithGold()
      .then((r) => setCustomers(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen narrow={false} className="max-w-3xl">
      <h1 className="mt-2 text-[22px] font-semibold text-ink">Collect gold</h1>
      <p className="mb-6 text-[13px] text-muted">Collect gold / jewellery — select a customer</p>

      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : customers.length === 0 ? (
        <EmptyState message="No customers with gold holdings" />
      ) : (
        customers.map((c) => (
          <Link key={c.id} to={`/admin/collect/${c.id}?name=${encodeURIComponent(c.name)}`}>
            <Card className="mb-2 hover:-translate-y-0.5">
              <p className="text-sm font-medium text-ink">{c.name}</p>
              <p className="mt-0.5 text-[13px] text-muted">{c.email}</p>
              <p className="mt-1.5 font-semibold text-primary-dark">
                {formatGrams(c.totalGoldGrams)} · {formatInr(c.portfolioCurrentValue)}
              </p>
            </Card>
          </Link>
        ))
      )}
    </Screen>
  );
}
