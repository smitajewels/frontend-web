import { useEffect, useState } from "react";
import { adminApi } from "../../api/endpoints";
import { LiveRateBanner } from "../../components/GoldWidgets";
import { Card, Screen, Skeleton } from "../../components/ui";
import type { AdminDashboard } from "../../types/api";
import { formatGrams, formatInr } from "../../utils/format";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .dashboard()
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen narrow={false} className="max-w-5xl">
      <h1 className="mt-2 text-[22px] font-semibold text-ink">Admin dashboard</h1>
      <p className="mb-6 text-[13px] text-muted">
        Track customers and today&apos;s gold purchases at a glance
      </p>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Today's purchases" value={String(data.adminPurchaseCount)} />
            <StatCard label="Customers" value={String(data.totalCustomers)} />
            <StatCard label="With gold" value={String(data.customersWithGold)} />
            <StatCard label="Today grams" value={formatGrams(data.todayPurchaseGrams)} />
          </div>
          <Card className="my-4">
            <p className="text-[13px] text-muted">Today&apos;s amount</p>
            <p className="mt-1 text-lg font-semibold text-primary-dark">
              {formatInr(data.todayPurchaseAmountInr)}
            </p>
          </Card>
          <LiveRateBanner k24={data.currentRates.k24RatePer10g} />
        </>
      ) : null}
    </Screen>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-primary-dark">{value}</p>
    </Card>
  );
}
