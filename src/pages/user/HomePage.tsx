import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { goldApi } from "../../api/endpoints";
import { LiveRateBanner, PortfolioCard } from "../../components/GoldWidgets";
import { Screen, Skeleton } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import type { LiveGoldRates } from "../../types/api";

const banners = ["/banners/banner_1.png", "/banners/banner_2.png", "/banners/banner_3.png", "/banners/banner_4.png"];

export default function HomePage() {
  const { user, refreshUser } = useAuth();
  const [rates, setRates] = useState<LiveGoldRates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await refreshUser();
        const r = await goldApi.getLiveRates();
        if (alive) setRates(r.data);
      } catch {
        /* ignore */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [refreshUser]);

  if (!user) return null;

  return (
    <Screen>
      <h1 className="text-[22px] font-semibold text-ink">Hello, {user.name.split(" ")[0]}</h1>
      <p className="mb-2 text-[13px] text-muted">Invest in gold, digitally</p>

      <div className="my-4">
        <PortfolioCard portfolio={user.portfolio} />
      </div>

      {loading && !rates ? (
        <Skeleton className="mb-4 h-24 w-full" />
      ) : rates ? (
        <LiveRateBanner k24={rates.k24RatePer10g} note={rates.liveRateIncludesGstNote} />
      ) : null}

      <div className="my-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {banners.map((src) => (
          <img
            key={src}
            src={src}
            alt="Promotion"
            className="h-[120px] w-[280px] shrink-0 rounded-md object-cover"
          />
        ))}
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
