import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/endpoints";
import { Card, EmptyState, Screen, SearchBar, Skeleton } from "../../components/ui";
import type { AdminCustomer } from "../../types/api";
import { formatGrams } from "../../utils/format";

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

  const countLabel = useMemo(() => `${customers.length} customer${customers.length === 1 ? "" : "s"}`, [customers.length]);

  return (
    <Screen narrow={false} className="max-w-3xl">
      <h1 className="mb-2 mt-2 text-[22px] font-semibold text-ink">Customers</h1>
      <p className="mb-4 text-[13px] text-muted">{countLabel}</p>
      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email" />

      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : customers.length === 0 ? (
        <EmptyState message="No customers registered yet" />
      ) : (
        customers.map((c) => (
          <Link key={c.id} to={`/admin/customers/${c.id}`}>
            <Card className="mb-2 hover:-translate-y-0.5">
              <p className="text-sm font-medium text-ink">{c.name}</p>
              <p className="text-[13px] text-muted">{c.email}</p>
              <p className="mt-1 font-semibold text-primary-dark">{formatGrams(c.totalGoldGrams)}</p>
            </Card>
          </Link>
        ))
      )}
    </Screen>
  );
}
