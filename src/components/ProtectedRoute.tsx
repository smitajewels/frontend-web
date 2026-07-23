import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { IoDiamond, IoHome, IoPerson, IoTime } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "./ui";
import { cn } from "../utils/format";

export function ProtectedRoute({ role }: { role?: "USER" | "ADMIN" }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/app"} replace />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={user.role === "ADMIN" ? "/admin" : "/app"} replace />;
  return <Outlet />;
}

export function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/admin" : "/app"} replace />;
}

const tabs = [
  { to: "/app", label: "Home", icon: IoHome, end: true },
  { to: "/app/history", label: "History", icon: IoTime },
  { to: "/app/collect", label: "Collect", icon: IoDiamond },
  { to: "/app/profile", label: "Profile", icon: IoPerson },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-[480px] items-stretch">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition",
                isActive ? "text-primary" : "text-faint hover:text-muted"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} className={cn("transition-transform", isActive && "scale-110")} />
                <span className={cn(isActive && "font-semibold")}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
