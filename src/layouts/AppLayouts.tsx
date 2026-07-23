import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BottomNav } from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/format";

export function UserLayout() {
  return (
    <div className="min-h-dvh bg-bg pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/rates", label: "Add Rate" },
  { to: "/admin/collect", label: "Collect Gold" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/purchases", label: "Today Purchases" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/scheme", label: "Current Scheme" },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-bg md:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-surface p-4 transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <p className="mb-6 text-lg font-semibold text-primary-dark">Smita Admin</p>
        <nav className="flex flex-col gap-1">
          {adminLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium transition",
                  isActive ? "bg-surface-muted text-primary" : "text-muted hover:bg-surface-muted"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {open ? (
        <button className="fixed inset-0 z-30 bg-ink/30 md:hidden" aria-label="Close menu" onClick={() => setOpen(false)} />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/95 px-4 py-3 backdrop-blur">
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-primary-dark md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <p className="hidden text-sm font-medium text-muted md:block">Admin console</p>
          <button
            type="button"
            className="text-sm font-semibold text-error"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
