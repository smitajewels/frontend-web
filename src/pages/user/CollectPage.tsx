import { useEffect, useState } from "react";
import { userApi } from "../../api/endpoints";
import { Badge, Card, ProgressBar, Screen, Skeleton } from "../../components/ui";
import type { CollectionEligibility } from "../../types/api";
import { formatGrams } from "../../utils/format";

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

  const threshold = info?.collectionThresholdGrams ?? 10;
  const held = info?.totalGoldGrams ?? 0;
  const progress = threshold > 0 ? Math.min(100, (held / threshold) * 100) : 0;
  const remaining = Math.max(0, threshold - held);

  return (
    <Screen>
      <h1 className="mt-2 text-[22px] font-semibold text-ink">Gold collection</h1>
      <p className="mb-6 text-[13px] leading-5 text-muted">
        You become eligible to collect gold after holding{" "}
        <span className="font-semibold text-primary-dark">10 g</span>. Visit Smita Jewellers for
        physical handover — admin will update your balance.
      </p>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : info ? (
        <Card>
          <p className="mb-4 text-base text-ink">{info.message}</p>
          <p className="text-[13px] text-muted">Gold held: {formatGrams(held)}</p>
          <p className="mt-1 text-[13px] text-muted">Threshold: {formatGrams(threshold)}</p>
          {!info.isEligibleForPhysicalCollection ? (
            <p className="mt-1 text-[13px] text-faint">
              Need {formatGrams(remaining)} more to become eligible
            </p>
          ) : null}
          <div className="mt-4">
            <ProgressBar value={progress} />
          </div>
          <div className="mt-4">
            <Badge variant={info.isEligibleForPhysicalCollection ? "success" : "muted"}>
              {info.isEligibleForPhysicalCollection
                ? "Eligible for collection"
                : "Not yet eligible (need 10 g)"}
            </Badge>
          </div>
        </Card>
      ) : null}
    </Screen>
  );
}
