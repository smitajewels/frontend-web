import { useEffect, useState } from "react";
import { userApi } from "../../api/endpoints";
import { Badge, Card, ProgressBar, Screen, Skeleton } from "../../components/ui";
import type { CollectionEligibility } from "../../types/api";

export default function CollectPage() {
  const [info, setInfo] = useState<CollectionEligibility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi
      .collectionEligibility()
      .then((r) => setInfo(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const progress =
    info && info.collectionThresholdGrams > 0
      ? Math.min(100, (info.totalGoldGrams / info.collectionThresholdGrams) * 100)
      : 0;

  return (
    <Screen>
      <h1 className="mt-2 text-[22px] font-semibold text-ink">Gold collection</h1>
      <p className="mb-6 text-[13px] leading-5 text-muted">
        Visit Smita Jewellers to collect your gold. Admin will update your balance after handover.
      </p>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : info ? (
        <Card>
          <p className="mb-4 text-base text-ink">{info.message}</p>
          <p className="text-[13px] text-muted">Gold held: {info.totalGoldGrams.toFixed(4)} g</p>
          <p className="mt-1 text-[13px] text-muted">Threshold: {info.collectionThresholdGrams} g</p>
          <div className="mt-4">
            <ProgressBar value={progress} />
          </div>
          <div className="mt-4">
            <Badge variant={info.isEligibleForPhysicalCollection ? "success" : "muted"}>
              {info.isEligibleForPhysicalCollection ? "Eligible for collection" : "Not yet eligible"}
            </Badge>
          </div>
        </Card>
      ) : null}
    </Screen>
  );
}
