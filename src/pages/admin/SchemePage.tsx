import { useEffect, useState } from "react";
import { adminApi } from "../../api/endpoints";
import { Card, Screen, Skeleton } from "../../components/ui";
import type { SchemeInfo } from "../../types/api";

export default function SchemePage() {
  const [scheme, setScheme] = useState<SchemeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .currentScheme()
      .then((r) => setScheme(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen narrow={false} className="max-w-xl">
      <h1 className="mb-4 mt-2 text-[22px] font-semibold text-ink">Current scheme</h1>
      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : scheme ? (
        <Card>
          <p className="text-lg font-semibold text-primary-dark">{scheme.scheme}</p>
          <p className="mt-2 text-[13px] text-muted">{scheme.schemeAssetPath}</p>
          <p className="mt-4 text-[13px] leading-[18px] text-faint">
            Scheme document is available in the app assets (smita_scheme.pdf).
          </p>
        </Card>
      ) : null}
    </Screen>
  );
}
