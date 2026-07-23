import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { adminApi } from "../../api/endpoints";
import { Input, PrimaryButton, Screen, SectionTitle } from "../../components/ui";

export default function AddRatePage() {
  const [k18, setK18] = useState("56250");
  const [k22, setK22] = useState("68750");
  const [k24, setK24] = useState("75000");
  const [loading, setLoading] = useState(false);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminApi.updateRates(Number(k18), Number(k22), Number(k24));
      toast.success("Gold rates updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen narrow={false} className="max-w-xl">
      <SectionTitle
        title="Add / update rates"
        subtitle="Set live rates per category (per 10 g). Users see these on the home screen."
      />
      <form onSubmit={onSave}>
        <Input label="18K rate / 10g (INR)" inputMode="decimal" value={k18} onChange={(e) => setK18(e.target.value)} />
        <Input label="22K rate / 10g (INR)" inputMode="decimal" value={k22} onChange={(e) => setK22(e.target.value)} />
        <Input label="24K rate / 10g (INR)" inputMode="decimal" value={k24} onChange={(e) => setK24(e.target.value)} />
        <PrimaryButton type="submit" loading={loading}>
          Save rates
        </PrimaryButton>
      </form>
    </Screen>
  );
}
