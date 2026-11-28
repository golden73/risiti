import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  Smartphone,
  Wifi,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { usePhone } from "@/context/PhoneContext";
import { useAsync } from "@/hooks/useAsync";
import { api, ApiError } from "@/lib/api";
import type { CatalogueItem } from "@/types/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { SimulatedBadge } from "@/components/ui/SimulatedBadge";
import { formatPoints } from "@/lib/format";

function iconFor(type: string) {
  return type === "airtime" ? Smartphone : type === "data" ? Wifi : Gift;
}

export default function RedeemPage() {
  const { phone } = usePhone();
  const toast = useToast();
  const catalogue = useAsync(() => api.getCatalogue(), []);
  const balance = useAsync(() => api.getBalance(phone), [phone]);

  const points = balance.data?.points ?? 0;
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [done, setDone] = useState<{ item: string; balance: number } | null>(null);

  const items = catalogue.data ?? [];
  const selectedItem: CatalogueItem | undefined = items.find(
    (i) => i.code === selected,
  );
  const canRedeem = selectedItem && points >= selectedItem.cost_points;

  const onRedeem = async () => {
    if (!selectedItem) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.redeem({ phone, item_code: selectedItem.code });
      if (res.status === "ok") {
        setDone({ item: selectedItem.name, balance: res.new_balance });
        toast.success("Reward redeemed!", `${selectedItem.name} (simulated)`);
        balance.refetch();
      } else {
        setError(
          new ApiError(
            res.status,
            res.status === "insufficient_points"
              ? "Not enough points for this reward."
              : "Unknown reward item.",
            400,
          ),
        );
      }
    } catch (e) {
      setError(
        e instanceof ApiError ? e : new ApiError("unknown", "Redemption failed.", null),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Redemption"
        title="Redeem points"
        description="Choose a reward and confirm. Your new balance updates instantly."
        action={<SimulatedBadge label="Simulated Zamtel" />}
      />

      {done ? (
        <Card className="mx-auto max-w-md p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Check className="h-10 w-10" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-ink-900">Reward redeemed</h2>
          <p className="mt-2 text-sm text-ink-500">
            {done.item} has been added to your account (simulated).
          </p>
          <Badge tone="brand" icon={<Sparkles className="h-3.5 w-3.5" />} className="mt-4">
            New balance: {done.balance} pts
          </Badge>
          <div className="mt-7 flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDone(null);
                setSelected(null);
              }}
            >
              Redeem another
            </Button>
            <Link to="/app/rewards">
              <Button fullWidth>View my balance</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {catalogue.loading || balance.loading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : (
              items.map((item) => {
                const Icon = iconFor(item.type);
                const isSelected = selected === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setSelected(item.code)}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20"
                        : "border-ink-200 bg-white hover:border-brand-300"
                    }`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        item.type === "airtime"
                          ? "bg-brand-100 text-brand-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900">{item.name}</p>
                      <p className="text-sm text-ink-500">
                        {formatPoints(item.cost_points)} points
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="h-6 w-6 rounded-full border-2 border-ink-200" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <Card className="h-fit p-6 lg:sticky lg:top-24">
            <h3 className="text-base font-semibold text-ink-900">Order summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">Current balance</span>
                <span className="font-semibold text-ink-800">{points} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Reward</span>
                <span className="font-semibold text-ink-800">
                  {selectedItem ? selectedItem.name : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Cost</span>
                <span className="font-semibold text-ink-800">
                  {selectedItem ? `${selectedItem.cost_points} pts` : "—"}
                </span>
              </div>
              <div className="flex justify-between border-t border-ink-100 pt-3">
                <span className="text-ink-500">Balance after</span>
                <span className="font-bold text-brand-700">
                  {selectedItem
                    ? `${Math.max(0, points - selectedItem.cost_points)} pts`
                    : "—"}
                </span>
              </div>
            </div>

            {error && (
              <Alert variant="error" className="mt-4" title="Redemption failed">
                {error.message}
              </Alert>
            )}

            <Button
              fullWidth
              size="lg"
              className="mt-5"
              disabled={!canRedeem}
              loading={loading}
              onClick={onRedeem}
              leftIcon={<Gift className="h-4 w-4" />}
            >
              {selectedItem && !canRedeem ? "Not enough points" : "Confirm redemption"}
            </Button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Simulated reward — no real
              value is transferred.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}