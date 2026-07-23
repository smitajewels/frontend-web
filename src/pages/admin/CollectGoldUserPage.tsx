import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { adminApi } from "../../api/endpoints";
import { PortfolioCard } from "../../components/GoldWidgets";
import { Header, Input, PageLoader, PrimaryButton, Screen } from "../../components/ui";
import type { AppUser, GoldKarat, Portfolio } from "../../types/api";
import { cn, formatGrams } from "../../utils/format";

const KARATS: GoldKarat[] = ["K18", "K22", "K24"];

function gramsFor(portfolio: Portfolio, karat: GoldKarat) {
  if (karat === "K18") return portfolio.gramsK18;
  if (karat === "K22") return portfolio.gramsK22;
  return portfolio.gramsK24;
}

export default function CollectGoldUserPage() {
  const { userId = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<AppUser | null>(null);
  const [karat, setKarat] = useState<GoldKarat>((params.get("karat") as GoldKarat) || "K24");
  const [grams, setGrams] = useState(params.get("grams") || "0.5");
  const [collectAll, setCollectAll] = useState(params.get("collectAll") === "1");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    adminApi
      .userDetail(userId)
      .then((r) => {
        if (!r.data) return;
        setUser(r.data);
        const qKarat = params.get("karat") as GoldKarat | null;
        const qGrams = params.get("grams");
        const qAll = params.get("collectAll") === "1";
        if (qAll) {
          setCollectAll(true);
        } else if (qKarat && KARATS.includes(qKarat)) {
          setKarat(qKarat);
          if (qGrams) setGrams(qGrams);
          else setGrams(String(gramsFor(r.data.portfolio, qKarat) || 0.5));
        }
      })
      .catch(() => toast.error("Could not load customer portfolio"))
      .finally(() => setFetching(false));
  }, [userId, params]);

  const available = useMemo(() => {
    if (!user) return 0;
    return gramsFor(user.portfolio, karat);
  }, [user, karat]);

  const userName = user?.name || params.get("name") || "customer";

  const selectKarat = (k: GoldKarat) => {
    setKarat(k);
    setCollectAll(false);
    if (user) {
      const held = gramsFor(user.portfolio, k);
      if (held > 0) setGrams(String(Number(held.toFixed(4))));
    }
  };

  const useFullKarat = () => {
    if (!user) return;
    setCollectAll(false);
    setGrams(String(Number(available.toFixed(4))));
  };

  const onCollect = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!collectAll) {
      const amount = Number(grams);
      if (!amount || amount <= 0) {
        toast.error("Enter grams to collect");
        return;
      }
      if (amount > available + 1e-9) {
        toast.error(`Only ${formatGrams(available)} available in ${karat.replace("K", "")}K`);
        return;
      }
    }

    try {
      setLoading(true);
      await adminApi.collectGold(userId, {
        karat,
        grams: collectAll ? 0 : Number(grams),
        collectAllPortfolio: collectAll,
        notes: collectAll ? "Collect entire portfolio" : "Physical handover at store",
      });
      toast.success("Collection recorded successfully");
      navigate(`/admin/customers/${userId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <>
        <Header title="Collect" onBack={() => navigate(-1)} />
        <PageLoader />
      </>
    );
  }

  return (
    <>
      <Header title="Collect" onBack={() => navigate(-1)} />
      <Screen narrow={false} className="max-w-xl">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-[22px] font-semibold text-ink">Collect for {userName}</h1>
            <p className="mt-1 text-[13px] leading-5 text-muted">
              Use live portfolio balances. Tap a karat to auto-fill available grams.
            </p>
          </div>
          <Link
            to={`/admin/customers/${userId}`}
            className="shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            View profile
          </Link>
        </div>

        {user ? (
          <div className="mb-4">
            <PortfolioCard portfolio={user.portfolio} />
          </div>
        ) : null}

        <form onSubmit={onCollect}>
          <p className="mb-2 text-sm font-medium text-muted">Select karat</p>
          <div className="mb-4 flex gap-2">
            {KARATS.map((k) => {
              const held = user ? gramsFor(user.portfolio, k) : 0;
              const active = karat === k && !collectAll;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => selectKarat(k)}
                  disabled={held <= 0}
                  className={cn(
                    "flex-1 rounded-md border py-3 transition",
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-ink hover:bg-surface-muted",
                    held <= 0 && "cursor-not-allowed opacity-40"
                  )}
                >
                  <p className="font-semibold">{k.replace("K", "")}K</p>
                  <p className={cn("mt-0.5 text-[11px]", active ? "text-white/90" : "text-muted")}>
                    {formatGrams(held)}
                  </p>
                </button>
              );
            })}
          </div>

          <label className="mb-4 flex items-center justify-between gap-3 rounded-md border border-border bg-surface-muted/50 px-3 py-3">
            <span className="text-sm text-ink">
              Collect entire portfolio
              {user ? (
                <span className="mt-0.5 block text-[13px] text-muted">
                  {formatGrams(user.portfolio.totalGoldGrams)} total
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              checked={collectAll}
              onChange={(e) => setCollectAll(e.target.checked)}
              className="size-5 accent-primary-light"
            />
          </label>

          {!collectAll ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-muted">
                  Available in {karat.replace("K", "")}K:{" "}
                  <span className="font-semibold text-primary-dark">{formatGrams(available)}</span>
                </p>
                <button
                  type="button"
                  onClick={useFullKarat}
                  disabled={available <= 0}
                  className="text-sm font-semibold text-primary hover:underline disabled:opacity-40"
                >
                  Use full {karat.replace("K", "")}K
                </button>
              </div>
              <Input
                label="Grams to collect"
                inputMode="decimal"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
              />
            </>
          ) : null}

          <PrimaryButton type="submit" loading={loading} disabled={!user || (!collectAll && available <= 0)}>
            {collectAll
              ? "Collect entire portfolio"
              : `Collect ${grams || "0"}g · ${karat.replace("K", "")}K`}
          </PrimaryButton>
        </form>
      </Screen>
    </>
  );
}
