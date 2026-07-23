import { useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { adminApi } from "../../api/endpoints";
import { Header, Input, PrimaryButton, Screen } from "../../components/ui";
import type { GoldKarat } from "../../types/api";
import { cn } from "../../utils/format";

const KARATS: GoldKarat[] = ["K18", "K22", "K24"];

export default function CollectGoldUserPage() {
  const { userId = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const userName = params.get("name") || "customer";
  const [karat, setKarat] = useState<GoldKarat>("K24");
  const [grams, setGrams] = useState("0.5");
  const [collectAll, setCollectAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const onCollect = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminApi.collectGold(userId, {
        karat,
        grams: Number(grams),
        collectAllPortfolio: collectAll,
        notes: collectAll ? "Collect entire portfolio" : "Physical handover",
      });
      toast.success("Collection recorded successfully");
      navigate("/admin/collect");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Collect" onBack={() => navigate(-1)} />
      <Screen narrow={false} className="max-w-xl">
        <h1 className="mt-2 text-[22px] font-semibold text-ink">Collect for {userName}</h1>
        <p className="mb-6 text-[13px] leading-5 text-muted">
          Deduct grams from customer portfolios after physical handover
        </p>

        <form onSubmit={onCollect}>
          <div className="mb-4 flex gap-2">
            {KARATS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKarat(k)}
                className={cn(
                  "flex-1 rounded-md border py-3 font-semibold",
                  karat === k ? "border-primary bg-primary text-white" : "border-border bg-surface text-ink"
                )}
              >
                {k.replace("K", "")}K
              </button>
            ))}
          </div>

          <label className="mb-4 flex items-center justify-between gap-3">
            <span className="text-base text-ink">Collect entire portfolio?</span>
            <input
              type="checkbox"
              checked={collectAll}
              onChange={(e) => setCollectAll(e.target.checked)}
              className="size-5 accent-primary-light"
            />
          </label>

          {!collectAll ? (
            <Input
              label="Grams to collect"
              inputMode="decimal"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
          ) : null}

          <PrimaryButton type="submit" loading={loading}>
            Collect gold
          </PrimaryButton>
        </form>
      </Screen>
    </>
  );
}
