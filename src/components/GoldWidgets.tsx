import { useEffect, useState } from "react";
import type { LiveGoldRates, Portfolio } from "../types/api";
import { cn, formatDate, formatGrams, formatInr } from "../utils/format";
import { Card, GoldGradientCard } from "./ui";

export function PortfolioCard({ portfolio }: { portfolio: Portfolio }) {
  return (
    <GoldGradientCard>
      <p className="text-sm text-white/90">Your Gold Portfolio</p>
      <p className="mt-1 text-[32px] font-bold leading-none">{formatGrams(portfolio.totalGoldGrams)}</p>
      <p className="mt-1 text-lg text-white/95">{formatInr(portfolio.portfolioCurrentValue)}</p>
      <div className="mt-4 flex gap-2">
        <KaratChip label="18K" grams={portfolio.gramsK18} />
        <KaratChip label="22K" grams={portfolio.gramsK22} />
        <KaratChip label="24K" grams={portfolio.gramsK24} />
      </div>
    </GoldGradientCard>
  );
}

function KaratChip({ label, grams }: { label: string; grams: number }) {
  return (
    <div className="flex-1 rounded-sm bg-white/20 p-2 text-center">
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-0.5 text-[13px]">{grams.toFixed(3)}g</p>
    </div>
  );
}

/** Live display rates for 18K / 22K / 24K (per 10g). */
export function LiveRateBanner({
  rates,
  note,
  updatedAt,
}: {
  rates: Pick<LiveGoldRates, "k18RatePer10g" | "k22RatePer10g" | "k24RatePer10g">;
  note?: string;
  updatedAt?: string | null;
}) {
  const items = [
    { label: "18K", value: rates.k18RatePer10g },
    { label: "22K", value: rates.k22RatePer10g },
    { label: "24K", value: rates.k24RatePer10g },
  ];

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-muted">Live gold rates / 10g</p>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success">
          <span className="size-1.5 animate-pulse rounded-full bg-success" aria-hidden />
          Live
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-border bg-surface-muted/60 px-2 py-3 text-center"
          >
            <p className="text-xs font-semibold text-muted">{item.label}</p>
            <p className="mt-1 text-sm font-bold leading-tight text-primary-dark tabular-nums sm:text-base">
              {formatInr(item.value)}
            </p>
          </div>
        ))}
      </div>
      {note ? <p className="mt-3 text-[12px] leading-4 text-faint">{note}</p> : null}
      {updatedAt ? (
        <p className="mt-1.5 text-[11px] text-faint">
          Updated {new Date(updatedAt).toLocaleTimeString("en-IN")}
        </p>
      ) : null}
    </Card>
  );
}

/** One-by-one animated poster carousel. */
export function PosterCollage({
  images,
  intervalMs = 3500,
}: {
  images: string[];
  intervalMs?: number;
}) {
  const source = images.length > 0 ? images : ["/banners/banner_1.png"];
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || source.length <= 1) return;
    const timer = window.setInterval(() => {
      setDirection("next");
      setIndex((i) => (i + 1) % source.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, source.length, intervalMs]);

  const goTo = (next: number) => {
    setDirection(next > index || (index === source.length - 1 && next === 0) ? "next" : "prev");
    setIndex(next);
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="relative aspect-[16/9] w-full bg-surface-muted">
        {source.map((src, i) => {
          const active = i === index;
          return (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`Promotion ${i + 1}`}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out",
                active
                  ? "z-10 translate-x-0 opacity-100 scale-100"
                  : direction === "next"
                    ? "z-0 -translate-x-6 opacity-0 scale-[1.02]"
                    : "z-0 translate-x-6 opacity-0 scale-[1.02]"
              )}
              loading={i === 0 ? "eager" : "lazy"}
              aria-hidden={!active}
            />
          );
        })}
      </div>

      {source.length > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
          {source.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show poster ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-5 bg-white shadow-sm" : "w-1.5 bg-white/55 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function TransactionTile({
  type,
  karat,
  grams,
  amountInr,
  date,
}: {
  type: string;
  karat: string;
  grams: number;
  amountInr: number;
  date: string;
}) {
  const isPurchase = type === "PURCHASE";
  return (
    <Card className="mb-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">{isPurchase ? "Buy Gold" : "Collect Gold"}</p>
          <p className="mt-0.5 text-[13px] text-muted">
            {karat.replace("K", "")}K · {formatGrams(grams)}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${isPurchase ? "text-success" : "text-primary"}`}>
            {isPurchase ? "+" : "-"}
            {formatInr(amountInr)}
          </p>
          <p className="mt-0.5 text-[13px] text-faint">{formatDate(date)}</p>
        </div>
      </div>
    </Card>
  );
}
