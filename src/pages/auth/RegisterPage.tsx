import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { Input, PrimaryButton, Screen, SectionTitle } from "../../components/ui";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [panCardPhoto, setPanCardPhoto] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    if (!panNumber.trim()) next.panNumber = "PAN number is required";
    if (!password) next.password = "Password is required";
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match";
    if (!panCardPhoto) next.panCardPhoto = "PAN card photo is required";
    if (!termsAccepted) next.terms = "Please accept the terms";
    setErrors(next);
    if (Object.keys(next).length || !panCardPhoto) return;

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone || undefined,
        panNumber: panNumber.trim().toUpperCase(),
        password,
        confirmPassword,
        termsAccepted,
        panCardPhoto,
        profilePhoto,
      });
      toast.success("Account created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <SectionTitle title="Create your account" subtitle="Invest in gold, digitally" />

      <form onSubmit={onSubmit} noValidate>
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" error={errors.name} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" error={errors.email} />
        <Input label="Phone (optional)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input
          label="PAN number"
          value={panNumber}
          onChange={(e) => setPanNumber(e.target.value)}
          placeholder="ABCDE1234F"
          error={errors.panNumber}
        />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-muted">PAN card photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPanCardPhoto(e.target.files?.[0] ?? null)}
            className="w-full rounded-md border border-border bg-surface px-3 py-3 text-sm"
          />
          {errors.panCardPhoto ? <span className="mt-1 block text-sm text-error">{errors.panCardPhoto}</span> : null}
        </label>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-muted">Profile photo (optional)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePhoto(e.target.files?.[0] ?? null)}
            className="w-full rounded-md border border-border bg-surface px-3 py-3 text-sm"
          />
        </label>

        <label className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="text-sm text-muted">I accept the terms and conditions</span>
        </label>
        {errors.terms ? <p className="-mt-4 mb-4 text-sm text-error">{errors.terms}</p> : null}

        <PrimaryButton type="submit" loading={loading}>
          Sign Up
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
    </Screen>
  );
}
