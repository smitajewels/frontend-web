import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/endpoints";
import { PortfolioCard } from "../../components/GoldWidgets";
import { Card, Header, PageLoader, Screen } from "../../components/ui";
import type { AppUser } from "../../types/api";

export default function UserDetailPage() {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    adminApi.userDetail(userId).then((r) => setUser(r.data)).catch(() => {});
  }, [userId]);

  if (!user) {
    return (
      <>
        <Header title="User Detail" onBack={() => navigate(-1)} />
        <PageLoader />
      </>
    );
  }

  return (
    <>
      <Header title="User Detail" onBack={() => navigate(-1)} />
      <Screen narrow={false} className="max-w-xl">
        <h1 className="mb-4 mt-2 text-[22px] font-semibold text-ink">User details</h1>
        <Card className="mb-4">
          <p className="text-lg font-semibold text-ink">{user.name}</p>
          <p className="mt-1 text-[13px] text-muted">{user.email}</p>
          {user.phone ? <p className="mt-1 text-[13px] text-muted">{user.phone}</p> : null}
          {user.panNumber ? <p className="mt-1 text-[13px] text-muted">PAN: {user.panNumber}</p> : null}
        </Card>
        <PortfolioCard portfolio={user.portfolio} />
      </Screen>
    </>
  );
}
