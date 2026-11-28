import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Gift,
  QrCode,
  Sparkles,
  Flag,
  History as HistoryIcon,
  TrendingUp,
} from "lucide-react";
import { usePhone } from "@/context/PhoneContext";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import {
  DAILY_POINTS_CAP,
  POINTS_PER_RECEIPT,
} from "@/lib/constants";
import { describeReason, formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";

const QUICK_ACTIONS = [
  { to: "/app/verify", icon: BadgeCheck, label: "Verify receipt", tone: "brand" as const },
  { to: "/app/scan", icon: QrCode, label: "Scan QR", tone: "info" as const },
  { to: "/app/marketplace", icon: Gift, label: "Redeem", tone: "accent" as const },
  { to: "/app/report", icon: Flag, label: "Report vendor", tone: "danger" as const },
];

export default function CustomerDashboard() {
  const { phone } = usePhone();
  const { data, loading, error } = useAsync(
    () => api.getBalance(phone),
    [phone],
  );

  const points = data?.points ?? 0;
  const todayEarned = (data?.history ?? [])
    .filter((h) => h.change > 0 && h.reason.startsWith("verify:"))
    .reduce((sum, h) => sum + h.change, 0);
  const capPercent = Math.min(100, (todayEarned / DAILY_POINTS_CAP) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer dashboard"
        title="Welcome back"
        description="Verify receipts, grow your points and redeem rewards — all in one place."
        action={
          <Link to="/app/verify">
            <Button leftIcon={<BadgeCheck className="h-4 w-4" />}>
              Verify a receipt
            </Button>
          </Link>
        }
      />

      {error && (
        <Alert variant="error" title="Couldn't load your balance">
          {error.message}
        </Alert>
      )}

      {/* Hero balance */}
      <div className="grid gap-4 sm:grid-cols-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-lift sm:col-span-1">
              <div className="absolute inset-0 bg-grid opacity-30" />
              <div className="relative">
                <p className="text-sm font-medium text-brand-100">
                  Rewards balance
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {points}
                  </span>
                  <span className="mb-1 text-brand-100">points</span>
                </div>
                <Link
                  to="/app/marketplace"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white"
                >
                  Redeem now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <StatCard
              label="Earned today"
              value={`${todayEarned} pts`}
              icon={<TrendingUp className="h-5 w-5" />}
              tone="accent"
              hint={`${POINTS_PER_RECEIPT} pts per valid receipt`}
            />
            <StatCard
              label="Daily cap progress"
              value={`${Math.round(capPercent)}%`}
              icon={<Sparkles className="h-5 w-5" />}
              tone="info"
              hint={`${todayEarned} / ${DAILY_POINTS_CAP} pts today`}
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.to} to={action.to}>
              <Card
                hover
                className="flex h-full items-center gap-3 p-4 sm:flex-col sm:items-start sm:gap-3 sm:p-5"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    action.tone === "brand"
                      ? "bg-brand-50 text-brand-600"
                      : action.tone === "info"
                        ? "bg-sky-50 text-sky-600"
                        : action.tone === "accent"
                          ? "bg-accent-50 text-accent-600"
                          : "bg-red-50 text-red-600"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-ink-800">
                  {action.label}
                </span>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader
          title="Recent activity"
          subtitle="Your latest points ledger entries"
          action={
            <Link
              to="/app/history"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        {loading ? (
          <CardBody>
            <div className="space-y-3">
              <div className="skeleton h-12 rounded-lg" />
              <div className="skeleton h-12 rounded-lg" />
              <div className="skeleton h-12 rounded-lg" />
            </div>
          </CardBody>
        ) : data && data.history.length > 0 ? (
          <ul className="divide-y divide-ink-100">
            {data.history.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      item.change > 0
                        ? "bg-brand-50 text-brand-600"
                        : "bg-accent-50 text-accent-600"
                    }`}
                  >
                    {item.change > 0 ? (
                      <BadgeCheck className="h-4 w-4" />
                    ) : (
                      <Gift className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">
                      {describeReason(item.reason)}
                    </p>
                    <p className="text-xs text-ink-400">
                      {formatDateTime(item.created_at)}
                    </p>
                  </div>
                </div>
                <Badge tone={item.change > 0 ? "success" : "accent"}>
                  {item.change > 0 ? "+" : ""}
                  {item.change}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<HistoryIcon className="h-6 w-6" />}
            title="No activity yet"
            description="Verify your first receipt to start earning points."
            action={
              <Link to="/app/verify">
                <Button size="sm">Verify a receipt</Button>
              </Link>
            }
          />
        )}
      </Card>
    </div>
  );
}