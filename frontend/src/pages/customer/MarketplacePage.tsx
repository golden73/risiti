import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gift,
  Smartphone,
  Wifi,
  Check,
  Lock,
  Sparkles,
  ArrowRight,
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
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SimulatedBadge } from "@/components/ui/SimulatedBadge";
import { formatPoints } from "@/lib/format";

function itemIcon(type: string) {
  if (type === "airtime") return Smartphone;
  if (type === "data") return Wifi;
  return Gift;
}

export default function MarketplacePage() {
  const { phone } = usePhone();
  const toast = useToast();
  const catalogue = useAsync(() => api.getCatalogue(), []);
  const balance = useAsync(() => api.getBalance(phone), [phone]);

  const points = balance.data?.points ?? 0;
  const [selected, setSelected] = useState<CatalogueItem | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<ApiError | null>(null);
  const [success, setSuccess] = useState<{ item: string; balance: number } | null>(
    null,
  );

  const openRedeem = (item: CatalogueItem) => {
    setSelected(item);
    setRedeemError(null);
    setSuccess(null);
  };

  const confirmRedeem = async () => {
    if (!selected) return;
    setRedeeming(true);
    setRedeemError(null);
    try {
      const res = await api.redeem({ phone, item_code: selected.code });
      if (res.status === "ok") {
        setSuccess({ item: selected.name, balance: res.new_balance });
        toast.success("Reward redeemed!", `${selected.name} · New balance ${res.new_balance} pts`);
        balance.refetch();
      } else {
        setRedeemError(
          new ApiError(
            res.status,
            res.status === "insufficient_points"
              ? "You don't have enough points for this reward yet."
              : "That reward is no longer available.",
            400,
          ),
        );
      }
    } catch (e) {
      setRedeemError(
        e instanceof ApiError ? e : new ApiError("unknown", "Redemption failed.", null),
      );
    } finally {
      setRedeeming(false);
    }
  };

  const items = catalogue.data ?? [];
  const loading = catalogue.loading || balance.loading;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketplace"
        title="Redeem your points"
        description="Turn your points into Zamtel airtime and data bundles."
        action={<SimulatedBadge label="Zamtel rewards simulated" />}
      />

      {/* Balance banner */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-brand-200/60 bg-brand-50 px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-brand-800">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">Your balance</span>
          <span className="text-lg font-bold">{formatPoints(points)} pts</span>
        </div>
        <Link
          to="/app/verify"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Earn more points <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {catalogue.error && (
        <Alert variant="error" title="Couldn't load the catalogue">
          {catalogue.error.message}
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Gift className="h-6 w-6" />}
            title="No rewards available"
            description="Check back soon for new rewards."
          />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = itemIcon(item.type);
            const affordable = points >= item.cost_points;
            return (
              <motion.div
                key={item.code}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card hover className="flex h-full flex-col p-6">
                  <div className="flex items-start justify-between">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        item.type === "airtime"
                          ? "bg-brand-50 text-brand-600"
                          : "bg-sky-50 text-sky-600"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <Badge tone={item.type === "airtime" ? "brand" : "info"}>
                      {item.type}
                    </Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink-900">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-500">
                    {formatPoints(item.cost_points)} points
                  </p>

                  <div className="mt-auto pt-6">
                    <Button
                      fullWidth
                      variant={affordable ? "primary" : "outline"}
                      disabled={!affordable}
                      onClick={() => openRedeem(item)}
                      leftIcon={
                        affordable ? (
                          <Gift className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )
                      }
                    >
                      {affordable
                        ? "Redeem"
                        : `Need ${formatPoints(item.cost_points - points)} more`}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => !redeeming && setSelected(null)}
        title="Confirm redemption"
        footer={
          success ? (
            <Button fullWidth onClick={() => setSelected(null)}>
              Done
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setSelected(null)}
                disabled={redeeming}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                loading={redeeming}
                onClick={confirmRedeem}
                leftIcon={<Gift className="h-4 w-4" />}
              >
                Confirm
              </Button>
            </div>
          )
        }
      >
        {success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Check className="h-8 w-8" />
            </span>
            <h3 className="text-lg font-semibold text-ink-900">Redeemed!</h3>
            <p className="text-sm text-ink-500">
              {success.item} is on its way (simulated).
            </p>
            <Badge tone="brand" icon={<Sparkles className="h-3.5 w-3.5" />}>
              New balance: {success.balance} pts
            </Badge>
          </div>
        ) : (
          <div className="space-y-4">
            {selected && (
              <div className="flex items-center justify-between rounded-xl bg-ink-50 p-4">
                <div>
                  <p className="font-semibold text-ink-900">{selected.name}</p>
                  <p className="text-sm text-ink-500">
                    {formatPoints(selected.cost_points)} points
                  </p>
                </div>
                <Badge tone="neutral">{selected.type}</Badge>
              </div>
            )}
            {redeemError && (
              <Alert variant="error" title="Redemption failed">
                {redeemError.message}
              </Alert>
            )}
            <p className="text-sm text-ink-500">
              Redeeming will deduct points from your balance. This is a
              simulated Zamtel reward for the demo.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}