import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../../api/endpoints";
import { Header, Input, PrimaryButton, Screen, SectionTitle } from "../../components/ui";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      await authApi.changePassword(currentPassword, newPassword, confirmPassword);
      toast.success("Password updated successfully");
      navigate(-1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Change Password" onBack={() => navigate(-1)} />
      <Screen>
        <SectionTitle
          title="Change password"
          subtitle="Enter your current password and choose a new one"
        />
        <form onSubmit={onSubmit}>
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
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
    </>
  );
}
