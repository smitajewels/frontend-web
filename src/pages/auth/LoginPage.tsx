import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { AppLogo, Card, Input, PrimaryButton } from "../../components/ui";

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
    <div className="flex min-h-dvh items-center justify-center bg-[radial-gradient(ellipse_at_top,_rgba(232,200,114,0.18),_transparent_55%),var(--color-bg)] px-4 py-8">
      <Card className="animate-fade-in w-full max-w-[380px] !p-5 shadow-[0_8px_28px_rgba(44,36,22,0.08)] sm:!p-6">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center">
            <div
              className="pointer-events-none absolute size-28 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.28)_0%,transparent_70%)]"
              aria-hidden
            />
            <AppLogo
              variant="mark"
              size={96}
              className="relative drop-shadow-[0_4px_12px_rgba(184,134,11,0.22)]"
            />
          </div>
          <h1 className="mt-1 bg-gradient-to-b from-primary-light via-primary to-primary-dark bg-clip-text font-serif text-[22px] font-bold tracking-[0.14em] text-transparent uppercase">
            Smita Jewellers
          </h1>
          <p className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
            Digital Gold
          </p>
          <p className="mt-3 text-sm font-medium text-ink">Sign in to your account</p>
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
            className="!py-3"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            className="!py-3"
          />

          <div className="mb-3 -mt-1 text-right">
            <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <PrimaryButton type="submit" loading={loading} className="!py-3.5">
            Sign In
          </PrimaryButton>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          New here?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create account
          </Link>
        </p>
      </Card>
    </div>
  );
}
