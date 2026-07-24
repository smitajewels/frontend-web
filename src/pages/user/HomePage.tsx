import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { goldApi } from "../../api/endpoints";
import { LiveRateBanner, PortfolioCard, PosterCollage } from "../../components/GoldWidgets";
import { Screen, Skeleton } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import type { LiveGoldRates } from "../../types/api";

const banners = ["/banners/banner_1.png", "/banners/banner_2.png", "/banners/banner_3.png", "/banners/banner_4.png"];

/** Poll live rates so 18K / 22K / 24K stay in sync with backend display rates. */
const RATES_POLL_MS = 30_000;

export default function HomePage() {
  const { user, refreshUser } = useAuth();
  const [rates, setRates] = useState<LiveGoldRates | null>(null);
  const [ratesFetchedAt, setRatesFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRates = useCallback(async () => {
    try {
      const r = await goldApi.getLiveRates();
      if (r.data) {
        setRates(r.data);
        setRatesFetchedAt(new Date().toISOString());
      }
    } catch {
      /* keep last good rates */
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await refreshUser();
        await loadRates();
      } finally {
        if (alive) setLoading(false);
      }
    })();

    const timer = window.setInterval(() => {
      loadRates();
    }, RATES_POLL_MS);

    const onFocus = () => loadRates();
    const onVisible = () => {
      if (document.visibilityState === "visible") loadRates();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      alive = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshUser, loadRates]);

  if (!user) return null;

  return (
    <Screen>
      <h1 className="text-[22px] font-semibold text-ink">Hello, {user.name.split(" ")[0]}</h1>
      <p className="mb-3 text-[13px] text-muted">Invest in gold, digitally</p>

      {/* 1. Poster collage on top */}
      <PosterCollage images={banners} />

      {/* 2. Live rates — all karats, auto-refresh */}
      <div className="mt-4">
        {loading && !rates ? (
          <Skeleton className="h-28 w-full" />
        ) : rates ? (
          <LiveRateBanner
            rates={rates}
            note={rates.liveRateIncludesGstNote}
            updatedAt={ratesFetchedAt}
          />
        ) : null}
      </div>

      {/* 3. Portfolio total */}
      <div className="mt-4">
        <PortfolioCard portfolio={user.portfolio} />
      </div>

      <div className="mt-4 flex gap-2">
        {[
          { to: "/app/buy", label: "Buy Gold" },
          { to: "/app/history", label: "History" },
          { to: "/app/collect", label: "Collect" },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="animate-press flex-1 rounded-md border border-border bg-surface py-4 text-center text-sm font-medium text-primary-dark transition hover:bg-surface-muted"
          >
            {a.label}
          </Link>
        ))}
      </div>
    </Screen>
  );
}
