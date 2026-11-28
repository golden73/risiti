import { useState, type ReactNode } from "react";
import { Smartphone, ArrowRight } from "lucide-react";
import { usePhone } from "@/context/PhoneContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidPhoneShape } from "@/lib/format";
import { DEMO_PHONE } from "@/lib/constants";

/**
 * Blocks customer content until a phone number is set. The phone acts as the
 * lightweight identity for this no-auth demo.
 */
export function PhoneGate({
  children,
  title = "Set your phone number to continue",
  description = "Your number links your verified receipts to your rewards balance. No password needed for this demo.",
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  const { hasPhone, setPhone } = usePhone();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | undefined>();

  if (hasPhone) return <>{children}</>;

  const onSubmit = () => {
    if (!isValidPhoneShape(draft)) {
      setError("Enter a valid Zambian mobile number, e.g. 0977000001");
      return;
    }
    setError(undefined);
    setPhone(draft);
  };

  return (
    <div className="mx-auto max-w-md py-6">
      <Card className="p-7">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Smartphone className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-ink-900">{title}</h2>
        <p className="mt-2 text-sm text-ink-500">{description}</p>

        <div className="mt-6 space-y-3">
          <Input
            label="Mobile number"
            placeholder="0977000001"
            value={draft}
            error={error}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(undefined);
            }}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            hint="Formats accepted: 09xxxxxxxx, 260xxxxxxxxx, +260xxxxxxxxx"
          />
          <Button fullWidth onClick={onSubmit} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Continue
          </Button>
          <button
            type="button"
            onClick={() => setDraft(DEMO_PHONE)}
            className="w-full text-center text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Use demo number ({DEMO_PHONE})
          </button>
        </div>
      </Card>
    </div>
  );
}