import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/endpoints";
import { Badge, Card, EmptyState, Screen, SearchBar, Skeleton } from "../../components/ui";
import type { AdminCustomer } from "../../types/api";
import { formatGrams, formatInr } from "../../utils/format";

export default function CollectGoldPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .customersWithGold()
      .then((r) => setCustomers(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <Screen narrow={false} className="max-w-3xl">
      <h1 className="mt-2 text-[22px] font-semibold text-ink">Collect gold</h1>
      <p className="mb-4 text-[13px] text-muted">
        Customers with holdings · open portfolio or start collection directly
      </p>
      <SearchBar value={search} onChange={setSearch} placeholder="Search customer to collect" />

      {loading ? (
        <Skeleton className="h-28 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState message="No customers with gold holdings" />
      ) : (
        filtered.map((c) => (
          <Card key={c.id} className="mb-3 !p-0 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-ink">{c.name}</p>
                  <p className="mt-0.5 text-[13px] text-muted">{c.email}</p>
                </div>
                {c.isEligibleForPhysicalCollection ? (
                  <Badge variant="success">Eligible</Badge>
                ) : (
                  <Badge variant="muted">Below threshold</Badge>
                )}
              </div>
              <p className="mt-3 font-semibold text-primary-dark">
                {formatGrams(c.totalGoldGrams)} · {formatInr(c.portfolioCurrentValue)}
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-border">
              <Link
                to={`/admin/customers/${c.id}`}
                className="px-3 py-3 text-center text-sm font-medium text-ink transition hover:bg-surface-muted"
              >
                Check portfolio
              </Link>
              <Link
                to={`/admin/collect/${c.id}?name=${encodeURIComponent(c.name)}`}
                className="border-l border-border bg-surface-muted/40 px-3 py-3 text-center text-sm font-semibold text-primary-dark transition hover:bg-surface-muted"
              >
                Collect now
              </Link>
            </div>
          </Card>
        ))
      )}
    </Screen>
  );
}
