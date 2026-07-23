import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/endpoints";
import { PortfolioCard } from "../../components/GoldWidgets";
import { Badge, Card, Header, PageLoader, PrimaryButton, Screen } from "../../components/ui";
import type { AppUser, GoldKarat, Portfolio } from "../../types/api";
import { formatGrams, formatInr } from "../../utils/format";

function karatGrams(portfolio: Portfolio, karat: GoldKarat) {
  if (karat === "K18") return portfolio.gramsK18;
  if (karat === "K22") return portfolio.gramsK22;
  return portfolio.gramsK24;
}

export default function UserDetailPage() {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    adminApi.userDetail(userId).then((r) => setUser(r.data)).catch(() => {});
  }, [userId]);

  const holdings = useMemo(() => {
    if (!user) return [];
    return (
      [
        { karat: "K18" as const, label: "18K", grams: user.portfolio.gramsK18 },
        { karat: "K22" as const, label: "22K", grams: user.portfolio.gramsK22 },
        { karat: "K24" as const, label: "24K", grams: user.portfolio.gramsK24 },
      ] as const
    ).filter((h) => h.grams > 0);
  }, [user]);

  if (!user) {
    return (
      <>
        <Header title="User Detail" onBack={() => navigate(-1)} />
        <PageLoader />
      </>
    );
  }

  const hasGold = user.portfolio.totalGoldGrams > 0;
  const collectBase = `/admin/collect/${user.id}?name=${encodeURIComponent(user.name)}`;

  return (
    <>
      <Header title="User Detail" onBack={() => navigate(-1)} />
      <Screen narrow={false} className="max-w-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold text-ink">{user.name}</h1>
            <p className="mt-1 text-[13px] text-muted">{user.email}</p>
            {user.phone ? <p className="mt-1 text-[13px] text-muted">{user.phone}</p> : null}
            {user.panNumber ? <p className="mt-1 text-[13px] text-muted">PAN: {user.panNumber}</p> : null}
          </div>
          <Badge variant={hasGold ? "success" : "muted"}>
            {hasGold ? "Has gold" : "No holdings"}
          </Badge>
        </div>

        <div className="mb-4">
          <PortfolioCard portfolio={user.portfolio} />
        </div>

        <Card className="mb-4">
          <p className="mb-1 text-sm font-semibold text-ink">Portfolio actions</p>
          <p className="mb-4 text-[13px] text-muted">
            Review holdings, then collect gold for this customer in one tap.
          </p>

          {hasGold ? (
            <div className="space-y-2">
              {holdings.map((h) => (
                <Link
                  key={h.karat}
                  to={`${collectBase}&karat=${h.karat}&grams=${h.grams}`}
                  className="flex items-center justify-between rounded-md border border-border bg-surface-muted/60 px-3 py-3 transition hover:border-primary hover:bg-surface-muted"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">Collect {h.label}</p>
                    <p className="text-[13px] text-muted">Available {formatGrams(h.grams)}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-dark">Collect →</span>
                </Link>
              ))}

              <PrimaryButton
                type="button"
                className="mt-2"
                onClick={() => navigate(`${collectBase}&collectAll=1`)}
              >
                Collect entire portfolio ({formatGrams(user.portfolio.totalGoldGrams)})
              </PrimaryButton>
            </div>
          ) : (
            <p className="text-sm text-muted">This customer has no gold to collect yet.</p>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/admin/payments?userId=${user.id}&name=${encodeURIComponent(user.name)}`}
            className="rounded-md border border-border bg-surface px-3 py-3 text-center text-sm font-medium text-primary-dark transition hover:bg-surface-muted"
          >
            View payments
          </Link>
          <Link
            to={collectBase}
            className="rounded-md border border-border bg-surface px-3 py-3 text-center text-sm font-medium text-primary-dark transition hover:bg-surface-muted"
          >
            Open collect form
          </Link>
        </div>

        <Card className="mt-4">
          <p className="text-[13px] text-muted">Invested value</p>
          <p className="text-lg font-semibold text-primary-dark">
            {formatInr(user.portfolio.totalInvestedInr)}
          </p>
          <p className="mt-2 text-[13px] text-muted">Current portfolio value</p>
          <p className="text-lg font-semibold text-ink">
            {formatInr(user.portfolio.portfolioCurrentValue)}
          </p>
          {(["K18", "K22", "K24"] as GoldKarat[]).map((k) => (
            <p key={k} className="mt-1 text-[13px] text-muted">
              {k.replace("K", "")}K held: {formatGrams(karatGrams(user.portfolio, k))}
            </p>
          ))}
        </Card>
      </Screen>
    </>
  );
}
