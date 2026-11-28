import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CircleSlash,
  Hash,
  QrCode,
  ReceiptText,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { VerifyResponse, VerifyStatus } from "@/types/api";
import { DEMO_PHONE } from "@/lib/constants";
import { useDemoReceipts } from "@/hooks/useDemoReceipts";
import { usePhone } from "@/context/PhoneContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { SimulatedBadge } from "@/components/ui/SimulatedBadge";

const STATUS_META: Record<
  VerifyStatus,
  { tone: "success" | "danger" | "warning" | "neutral"; label: string; icon: typeof BadgeCheck }
> = {
  valid: { tone: "success", label: "Valid receipt", icon: BadgeCheck },
  invalid: { tone: "danger", label: "Not found", icon: CircleSlash },
  used: { tone: "warning", label: "Already used", icon: TriangleAlert },
  below_minimum: { tone: "warning", label: "Below minimum", icon: TriangleAlert },
  cap_reached: { tone: "warning", label: "Daily cap reached", icon: TriangleAlert },
};

export function VerifyCard({
  initialReceiptId = "",
  autoVerify = false,
}: {
  initialReceiptId?: string;
  autoVerify?: boolean;
}) {
  const { phone, hasPhone, setPhone } = usePhone();
  const toast = useToast();
  const demo = useDemoReceipts();
  const [receiptId, setReceiptId] = useState(initialReceiptId);
  const [phoneDraft, setPhoneDraft] = useState(phone || DEMO_PHONE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const autoRan = useRef(false);

  const runVerify = useCallback(
    async (rid: string, ph: string) => {
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        if (ph && ph !== phone) setPhone(ph);
        const res = await api.verifyReceipt({ receipt_id: rid, phone: ph });
        setResult(res);
        if (res.status === "valid") {
          toast.success(res.message, `New balance: ${res.balance} points`);
        }
      } catch (e) {
        const err =
          e instanceof ApiError
            ? e
            : new ApiError("unknown", "Verification failed.", null);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [phone, setPhone, toast],
  );

  useEffect(() => {
    if (
      autoVerify &&
      !autoRan.current &&
      initialReceiptId &&
      (hasPhone || phoneDraft)
    ) {
      autoRan.current = true;
      void runVerify(initialReceiptId, hasPhone ? phone : phoneDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoVerify, initialReceiptId, hasPhone]);

  const onSubmit = () => {
    if (!receiptId.trim()) {
      setError(new ApiError("invalid_receipt_id", "Enter a receipt ID or scan a QR code.", 400));
      return;
    }
    void runVerify(receiptId.trim(), hasPhone ? phone : phoneDraft.trim());
  };

  const meta = result ? STATUS_META[result.status] : null;
  const ResultIcon = meta?.icon ?? BadgeCheck;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <QrCode className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink-900">
                Verify a receipt
              </h2>
              <p className="text-sm text-ink-500">
                Paste a receipt ID or the full QR link.
              </p>
            </div>
          </div>
          <SimulatedBadge />
        </div>

        <div className="mt-6 space-y-4">
          <Input
            label="Receipt ID or QR link"
            placeholder="RCP-DEMO-OK"
            leftIcon={<Hash className="h-4 w-4" />}
            value={receiptId}
            onChange={(e) => setReceiptId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            hint="Accepts a bare ID or a URL containing ?id=…"
          />

          {!hasPhone && (
            <Input
              label="Your mobile number"
              placeholder="0977000001"
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              hint="We'll remember this on your device."
            />
          )}

          {error && (
            <Alert variant="error" title={error.message}>
              {error.code === "network"
                ? "Start the backend with `uvicorn app.main:app` on port 8000."
                : null}
            </Alert>
          )}

          <Button
            fullWidth
            size="lg"
            loading={loading}
            onClick={onSubmit}
            leftIcon={<BadgeCheck className="h-5 w-5" />}
          >
            Verify receipt
          </Button>

          <div className="rounded-xl bg-ink-50 p-3 text-xs text-ink-500">
            <p className="font-semibold text-ink-600">Try a demo receipt:</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {demo.all.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setReceiptId(id)}
                  className="rounded-md border border-ink-200 bg-white px-2 py-1 font-mono text-[11px] text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div>
        {loading ? (
          <Card className="flex h-full min-h-[16rem] items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3 text-ink-400">
              <ReceiptText className="h-8 w-8 animate-pulse" />
              <p className="text-sm">Checking the ZRA register…</p>
            </div>
          </Card>
        ) : result && meta ? (
          <motion.div
            key={result.status + result.balance}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden">
              <div
                className={`flex items-center gap-3 p-6 ${
                  result.status === "valid"
                    ? "bg-brand-50"
                    : result.status === "invalid"
                      ? "bg-red-50"
                      : "bg-accent-50"
                }`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    result.status === "valid"
                      ? "bg-brand-600 text-white"
                      : result.status === "invalid"
                        ? "bg-red-600 text-white"
                        : "bg-accent-500 text-white"
                  }`}
                >
                  <ResultIcon className="h-6 w-6" />
                </span>
                <div>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  <p className="mt-1 text-sm text-ink-600">{result.message}</p>
                </div>
              </div>

              <div className="space-y-3 p-6">
                {result.vendor_name && (
                  <Row label="Vendor" value={result.vendor_name} />
                )}
                {result.amount_band && (
                  <Row label="Amount band" value={result.amount_band} />
                )}
                <Row
                  label="Points awarded"
                  value={`+${result.points_awarded}`}
                  accent={result.points_awarded > 0}
                />
                <div className="flex items-center justify-between border-t border-ink-100 pt-3">
                  <span className="text-sm text-ink-500">New balance</span>
                  <span className="inline-flex items-center gap-1.5 text-lg font-bold text-ink-900">
                    <Sparkles className="h-4 w-4 text-accent-500" />
                    {result.balance} pts
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <Card className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
              <ReceiptText className="h-7 w-7" />
            </span>
            <p className="font-medium text-ink-700">Awaiting a receipt</p>
            <p className="max-w-xs text-sm text-ink-500">
              Your verification result will appear here once you submit a
              receipt ID.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-500">{label}</span>
      <span
        className={`text-sm font-semibold ${accent ? "text-brand-600" : "text-ink-800"}`}
      >
        {value}
      </span>
    </div>
  );
}