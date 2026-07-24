import { forwardRef, useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/format";

export function AppLogo({
  size = 120,
  className,
  variant = "full",
}: {
  size?: number;
  className?: string;
  variant?: "full" | "mark";
}) {
  const isMark = variant === "mark";
  const ratio = isMark ? 0.6 : 0.95;
  return (
    <img
      src={isMark ? "/logo-mark.png" : "/logo.png"}
      alt="Smita Jewellers"
      width={size}
      height={Math.round(size * ratio)}
      className={cn("bg-transparent object-contain", className)}
      style={{ width: size, height: size * ratio }}
    />
  );
}

export function Screen({
  children,
  className,
  narrow = true,
}: {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        "animate-fade-in mx-auto w-full px-4 pb-12 pt-4",
        narrow && "max-w-[480px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition",
        onClick && "w-full cursor-pointer text-left hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
        className
      )}
    >
      {children}
    </Comp>
  );
}

export function GoldGradientCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("gradient-gold rounded-lg p-6 text-white shadow-[var(--shadow-card)]", className)}>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  loading,
  className,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "gradient-btn animate-press w-full rounded-md py-4 text-center text-base font-medium text-white transition",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "hover:brightness-105 focus-visible:outline-offset-2",
        className
      )}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Spinner className="border-white/30 border-t-white" />
          Please wait…
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "animate-press w-full rounded-md border border-border bg-surface py-4 text-base font-medium text-primary-dark transition hover:bg-surface-muted",
        className
      )}
    >
      {children}
    </button>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }
>(function Input({ label, error, className, id, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <label className="mb-4 block">
      {label ? <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span> : null}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "w-full rounded-md border border-border bg-surface px-4 py-3.5 text-base text-ink placeholder:text-faint",
          "transition focus:border-primary focus:ring-2 focus:ring-primary/20",
          error && "border-error",
          className
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-error">{error}</span> : null}
    </label>
  );
});

export function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative mb-4", className)}>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-surface py-3.5 pl-4 pr-4 text-base text-ink placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
        aria-label="Search"
      />
    </div>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-[22px] font-semibold text-ink">{title}</h1>
      {subtitle ? <p className="mt-1 text-[13px] leading-5 text-muted">{subtitle}</p> : null}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-8 py-8 text-center">
      <p className="text-base text-muted">{message}</p>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary",
        className
      )}
      aria-hidden
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-md", className)} aria-hidden />;
}

export function Badge({
  children,
  variant = "muted",
}: {
  children: ReactNode;
  variant?: "muted" | "success" | "error" | "warning" | "primary";
}) {
  const styles = {
    muted: "bg-surface-muted text-muted",
    success: "bg-eligible text-success",
    error: "bg-red-50 text-error",
    warning: "bg-orange-50 text-warning",
    primary: "bg-surface-muted text-primary-dark",
  } as const;

  return (
    <span className={cn("inline-flex rounded-sm px-3 py-1.5 text-[13px] font-semibold", styles[variant])}>
      {children}
    </span>
  );
}

export function Avatar({
  name,
  src,
  size = 48,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setBroken(false);
  }, [src]);

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-primary-dark",
        className
      )}
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal>
      <button className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <div className="animate-fade-in relative z-10 max-h-[85vh] w-full max-w-md overflow-auto rounded-t-xl bg-surface p-5 shadow-xl sm:rounded-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm px-2 py-1 text-muted hover:bg-surface-muted"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4 flex gap-2">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "flex-1 rounded-md border py-2.5 text-center text-sm font-semibold transition",
              active
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-muted hover:bg-surface-muted"
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-[13px] transition",
        active
          ? "border-primary bg-primary font-semibold text-white"
          : "border-border bg-surface text-muted hover:bg-surface-muted"
      )}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={pct}>
      <div className="gradient-btn h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Header({
  title,
  onBack,
  right,
}: {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-bg/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-[480px] items-center gap-3 md:max-w-5xl">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-sm px-2 py-1 text-primary-dark hover:bg-surface-muted"
            aria-label="Go back"
          >
            ←
          </button>
        ) : null}
        {title ? <h1 className="flex-1 text-lg font-semibold text-primary-dark">{title}</h1> : <div className="flex-1" />}
        {right}
      </div>
    </header>
  );
}
