import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { userApi } from "../../api/endpoints";
import { Avatar, Input, PrimaryButton, Screen } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [panNumber, setPanNumber] = useState(user?.panNumber ?? "");
  const [loading, setLoading] = useState(false);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userApi.updateProfile({ name, phone, panNumber });
      await refreshUser();
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <div className="mb-6 flex items-center gap-3">
        <Avatar name={user?.name || "User"} src={user?.profilePhotoPath} size={56} />
        <div>
          <h1 className="text-[22px] font-semibold text-ink">Profile</h1>
          <p className="text-[13px] text-muted">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={onSave}>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="PAN number" value={panNumber} onChange={(e) => setPanNumber(e.target.value)} />
        <PrimaryButton type="submit" loading={loading}>
          Save profile
        </PrimaryButton>
      </form>

      <Link
        to="/app/change-password"
        className="mt-2 block border-b border-border py-4 text-base text-ink hover:text-primary-dark"
      >
        Change password
      </Link>
      <button
        type="button"
        onClick={() => logout()}
        className="block w-full border-b border-border py-4 text-left text-base text-error"
      >
        Sign out
      </button>
    </Screen>
  );
}
