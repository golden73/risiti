import { useState } from "react";
import { Smartphone, LogOut, Pencil } from "lucide-react";
import { usePhone } from "@/context/PhoneContext";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidPhoneShape } from "@/lib/format";

export function PhoneChip() {
  const { phone, hasPhone, setPhone, clearPhone } = usePhone();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(phone);
  const [error, setError] = useState<string | undefined>();

  const onSave = () => {
    if (!isValidPhoneShape(draft)) {
      setError("Enter a valid Zambian mobile number, e.g. 0977000001");
      return;
    }
    setError(undefined);
    setPhone(draft);
    setOpen(false);
  };

  if (!hasPhone) {
    return (
      <Button size="sm" variant="outline" leftIcon={<Smartphone className="h-4 w-4" />} onClick={() => setOpen(true)}>
        Set phone
      </Button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDraft(phone);
          setError(undefined);
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-ink-700 shadow-soft transition hover:border-brand-300"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Smartphone className="h-3.5 w-3.5" />
        </span>
        <span className="tabular-nums">{phone}</span>
        <Pencil className="h-3.5 w-3.5 text-ink-400" />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Your phone number"
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                clearPhone();
                setOpen(false);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              Remove
            </button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={onSave}>
                Save
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Mobile number"
            placeholder="0977000001"
            value={draft}
            error={error}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(undefined);
            }}
            hint="Used to look up your points. No OTP or login required in this demo."
          />
        </div>
      </Modal>
    </>
  );
}