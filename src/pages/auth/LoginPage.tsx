import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { AppLogo, Input, PrimaryButton, Screen } from "../../components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email is required";
    if (!password) next.password = "Password is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
      toast.success("Welcome back");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <div className="mb-8 mt-6 flex flex-col items-center text-center">
        <div className="relative flex items-center justify-center py-2">
          <div
            className="pointer-events-none absolute size-48 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.32)_0%,rgba(255,251,245,0)_68%)]"
            aria-hidden
          />
          <AppLogo
            variant="mark"
            size={168}
            className="relative drop-shadow-[0_6px_18px_rgba(184,134,11,0.28)]"
          />
        </div>
        <h1 className="mt-1 bg-gradient-to-b from-primary-light via-primary to-primary-dark bg-clip-text font-serif text-[34px] font-bold tracking-[0.18em] text-transparent uppercase sm:text-[38px]">
          Smita Jewellers
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="h-px w-8 bg-primary/40" />
          <span className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
            Digital Gold
          </span>
          <span className="h-px w-8 bg-primary/40" />
        </div>
        <p className="mt-5 text-base font-medium text-ink">Sign in to manage your gold portfolio</p>
        <p className="mt-2 max-w-sm text-[13px] leading-5 text-muted">
          Buy digital gold in seconds. Secure, transparent, and backed by live market rates.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <div className="mb-4">
          <Link to="/forgot-password" className="text-sm font-semibold text-primary">
            Forgot password?
          </Link>
        </div>

        <PrimaryButton type="submit" loading={loading}>
          Sign In
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center text-muted">
        New here?{" "}
        <Link to="/register" className="font-semibold text-primary">
          Create account
        </Link>
      </p>
    </Screen>
  );
}
