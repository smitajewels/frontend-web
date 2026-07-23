import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/endpoints";
import { Badge, Card, EmptyState, Screen, SearchBar, Skeleton } from "../../components/ui";
import type { AdminCustomer } from "../../types/api";
import { formatGrams, formatInr } from "../../utils/format";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      adminApi
        .customers(search)
        .then((r) => setCustomers(r.data ?? []))
        .catch(() => setCustomers([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const countLabel = useMemo(
    () => `${customers.length} customer${customers.length === 1 ? "" : "s"}`,
    [customers.length]
  );

  return (
    <Screen narrow={false} className="max-w-3xl">
      <h1 className="mb-1 mt-2 text-[22px] font-semibold text-ink">Customers</h1>
      <p className="mb-4 text-[13px] text-muted">
        {countLabel} · open a profile to view portfolio and collect gold
      </p>
      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email" />

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState message="No customers registered yet" />
      ) : (
        customers.map((c) => {
          const hasGold = c.totalGoldGrams > 0;
          return (
            <Card key={c.id} className="mb-3 !p-0 overflow-hidden">
              <Link to={`/admin/customers/${c.id}`} className="block p-4 transition hover:bg-surface-muted/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-ink">{c.name}</p>
                    <p className="mt-0.5 text-[13px] text-muted">{c.email}</p>
                    {c.phone ? <p className="mt-0.5 text-[13px] text-faint">{c.phone}</p> : null}
                  </div>
                  <Badge variant={hasGold ? "success" : "muted"}>
                    {hasGold ? "Has gold" : "Empty"}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <span className="font-semibold text-primary-dark">{formatGrams(c.totalGoldGrams)}</span>
                  <span className="text-muted">{formatInr(c.portfolioCurrentValue)}</span>
                  {c.isEligibleForPhysicalCollection ? (
                    <span className="font-medium text-success">Eligible to collect</span>
                  ) : null}
                </div>
              </Link>
              <div className="grid grid-cols-2 border-t border-border">
                <Link
                  to={`/admin/customers/${c.id}`}
                  className="px-3 py-3 text-center text-sm font-medium text-ink transition hover:bg-surface-muted"
                >
                  View portfolio
                </Link>
                <Link
                  to={
                    hasGold
                      ? `/admin/collect/${c.id}?name=${encodeURIComponent(c.name)}`
                      : `/admin/customers/${c.id}`
                  }
                  className="border-l border-border px-3 py-3 text-center text-sm font-semibold text-primary-dark transition hover:bg-surface-muted"
                >
                  {hasGold ? "Collect gold" : "No gold yet"}
                </Link>
              </div>
            </Card>
          );
        })
      )}
    </Screen>
  );
}
