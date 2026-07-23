import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../../api/endpoints";
import { Input, PrimaryButton, Screen, SectionTitle } from "../../components/ui";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) {
      toast.error("Token and password are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      await authApi.resetPassword(token, newPassword, confirmPassword);
      toast.success("Password updated successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <SectionTitle title="Reset password" />
      <form onSubmit={onSubmit}>
        <Input label="Reset token" value={token} onChange={(e) => setToken(e.target.value)} />
        <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <PrimaryButton type="submit" loading={loading}>
          Update password
        </PrimaryButton>
      </form>
    </Screen>
  );
}
