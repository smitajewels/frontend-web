import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../../api/endpoints";
import { Input, PrimaryButton, Screen, SectionTitle } from "../../components/ui";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    try {
      setLoading(true);
      const res = await authApi.forgotPassword(email.trim().toLowerCase());
      toast.success(res.message || "Check your email");
      if (res.data?.resetToken) {
        navigate(`/reset-password?token=${encodeURIComponent(res.data.resetToken)}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <SectionTitle
        title="Forgot password?"
        subtitle="Enter your email and we will send reset instructions"
      />
      <form onSubmit={onSubmit}>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PrimaryButton type="submit" loading={loading}>
          Send reset link
        </PrimaryButton>
      </form>
    </Screen>
  );
}
