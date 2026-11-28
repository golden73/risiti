import { useState } from "react";
import { Flag, MapPin, Store, FileText, CheckCircle2 } from "lucide-react";
import { usePhone } from "@/context/PhoneContext";
import { api, ApiError } from "@/lib/api";
import { AREA_NAMES } from "@/lib/constants";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";

export default function ReportNoReceiptPage() {
  const { phone } = usePhone();
  const [area, setArea] = useState("");
  const [vendor, setVendor] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [reportId, setReportId] = useState<number | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!area) {
      setError(new ApiError("validation_error", "Please choose an area.", 422));
      return;
    }
    setLoading(true);
    try {
      const res = await api.reportNoReceipt({
        phone,
        area,
        vendor_name: vendor.trim() || null,
        note: note.trim() || null,
      });
      setReportId(res.report_id);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e
          : new ApiError("unknown", "Couldn't submit the report.", null),
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setArea("");
    setVendor("");
    setNote("");
    setReportId(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Help the system"
        title="Report a missing receipt"
        description="If a vendor can't provide a ZRA Smart Invoice receipt, let us know. Reports feed the ZRA hotspot map."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6 sm:p-7">
          {reportId !== null ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <CheckCircle2 className="h-8 w-8" />
              </span>
              <h3 className="text-xl font-semibold text-ink-900">Report received</h3>
              <p className="max-w-sm text-sm text-ink-500">
                Thank you. Your report has been logged and will appear in the ZRA
                hotspot statistics.
              </p>
              <Badge tone="brand">Report #{reportId}</Badge>
              <div className="mt-2 flex gap-3">
                <Button variant="outline" onClick={reset}>
                  Report another
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-ink-400" /> Area
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AREA_NAMES.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setArea(name)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                        area === name
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-ink-200 bg-white text-ink-600 hover:border-brand-300"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Vendor name (optional)"
                placeholder="e.g. Street vendor near the market"
                leftIcon={<Store className="h-4 w-4" />}
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-ink-400" /> Note (optional)
                  </span>
                </label>
                <textarea
                  className="input-base min-h-[96px] resize-y"
                  placeholder="Anything else we should know? e.g. vendor had no QR code"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {error && (
                <Alert variant="error" title="Couldn't submit report">
                  {error.message}
                </Alert>
              )}

              <Button
                fullWidth
                size="lg"
                loading={loading}
                onClick={onSubmit}
                leftIcon={<Flag className="h-4 w-4" />}
              >
                Submit report
              </Button>
            </div>
          )}
        </Card>

        <Card className="h-fit bg-ink-950 p-7 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-brand-300">
            <Flag className="h-6 w-6" />
          </span>
          <h3 className="mt-5 text-lg font-semibold text-white">
            Why report?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-300">
            Every report helps ZRA understand where receipt compliance is
            slipping. It&apos;s anonymous, takes seconds, and strengthens the
            whole loop.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-ink-200">
            {[
              "Flags non-compliant vendors",
              "Feeds the ZRA hotspot map",
              "No personal data required",
            ].map((line) => (
              <li key={line} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-400" />
                {line}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}