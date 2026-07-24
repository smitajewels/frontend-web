import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { userApi } from "../../api/endpoints";
import { Avatar, Input, PrimaryButton, Screen, Spinner } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { resolveMediaUrl } from "../../utils/format";

const MAX_PHOTO_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [panNumber, setPanNumber] = useState(user?.panNumber ?? "");
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const photoSrc = previewUrl || resolveMediaUrl(user?.profilePhotoPath);

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setPanNumber(user?.panNumber ?? "");
  }, [user?.name, user?.phone, user?.panNumber]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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

  const onPickPhoto = () => fileInputRef.current?.click();

  const onPhotoSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
      toast.error("Please choose a JPG, PNG, or WebP image");
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_PHOTO_MB} MB`);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return localPreview;
    });

    try {
      setPhotoUploading(true);
      await userApi.uploadProfilePhoto(file);
      await refreshUser();
      toast.success("Profile photo updated");
      setPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload photo");
      setPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <Screen>
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="relative">
          <Avatar name={user?.name || "User"} src={photoSrc} size={96} className="border-2 border-border shadow-sm" />
          {photoUploading ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/40">
              <Spinner className="border-white/30 border-t-white" />
            </div>
          ) : null}
          <button
            type="button"
            onClick={onPickPhoto}
            disabled={photoUploading}
            className="absolute -bottom-1 -right-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-primary-dark shadow-sm hover:bg-surface-muted disabled:opacity-60"
            aria-label="Change profile photo"
          >
            Edit
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={onPhotoSelected}
        />

        <h1 className="mt-4 text-[22px] font-semibold text-ink">Profile</h1>
        <p className="text-[13px] text-muted">{user?.email}</p>
        <button
          type="button"
          onClick={onPickPhoto}
          disabled={photoUploading}
          className="mt-2 text-sm font-semibold text-primary hover:underline disabled:opacity-60"
        >
          {photoUploading ? "Uploading…" : user?.profilePhotoPath ? "Change profile photo" : "Add profile photo"}
        </button>
        <p className="mt-1 text-[12px] text-faint">JPG, PNG or WebP · max {MAX_PHOTO_MB} MB</p>
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
