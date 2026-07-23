import type { Portfolio } from "../types/api";
import { formatDate, formatGrams, formatInr } from "../utils/format";
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
      <p className="mt-0.5 text-[13px]">{grams.toFixed(2)}g</p>
    </div>
  );
}

export function LiveRateBanner({ k24, note }: { k24: number; note?: string }) {
  return (
    <Card>
      <p className="text-[13px] text-muted">Live Gold Rate (24K / 10g)</p>
      <p className="mt-1 text-[22px] font-semibold text-primary-dark">{formatInr(k24)}</p>
      {note ? <p className="mt-1.5 text-[13px] text-faint">{note}</p> : null}
    </Card>
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
