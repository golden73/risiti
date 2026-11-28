import { Link } from "react-router-dom";
import { ArrowRight, Gift, Sparkles, Target, Wallet } from "lucide-react";
import { usePhone } from "@/context/PhoneContext";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { describeReason, formatDateTime, formatPoints } from "@/lib/format";

export default function RewardsBalancePage() {
  const { phone } = usePhone();
  const { data, loading, error } = useAsync(
    () => api.getBalance(phone),
    [phone],
  );

  const points = data?.points ?? 0;
  const nextGoal = points < 50 ? 50 : points < 80 ? 80 : Math.ceil((points + 1) / 50) * 50;
  const goalPercent = Math.min(100, (points / nextGoal) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My rewards"
        title="Rewards balance"
        description="Track your points and see how close you are to your next reward."
        action={
          <Link to="/app/marketplace">
            <Button leftIcon={<Gift className="h-4 w-4" />}>Redeem points</Button>
          </Link>
        }
      />

      {error && (
        <Alert variant="error" title="Couldn't load your balance">
          {error.message}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Balance card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-7 text-white shadow-lift">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <div className="flex items-center gap-2 text-brand-100">
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-medium">Available points</span>
            </div>
            {loading ? (
              <div className="mt-3 h-14 w-40 rounded-lg bg-white/20" />
            ) : (
              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-extrabold tracking-tight">
                  {formatPoints(points)}
                </span>
                <span className="mb-2 text-brand-100">pts</span>
              </div>
            )}

            <div className="mt-7">
              <div className="flex items-center justify-between text-sm text-brand-50">
                <span className="inline-flex items-center gap-1.5">
                  <Target className="h-4 w-4" /> Next reward at {nextGoal} pts
                </span>
                <span>{Math.round(goalPercent)}%</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-accent-400 transition-all duration-700"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
            </div>

            <Link
              to="/app/marketplace"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white"
            >
              Browse marketplace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Ledger */}
        <Card>
          <CardHeader title="Points history" subtitle="Your latest ledger activity" />
          {loading ? (
            <CardBody className="space-y-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </CardBody>
          ) : data && data.history.length > 0 ? (
            <ul className="max-h-[26rem] divide-y divide-ink-100 overflow-y-auto">
              {data.history.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">
                      {describeReason(item.reason)}
                    </p>
                    <p className="text-xs text-ink-400">
                      {formatDateTime(item.created_at)}
                    </p>
                  </div>
                  <Badge tone={item.change > 0 ? "success" : "accent"}>
                    {item.change > 0 ? "+" : ""}
                    {item.change} pts
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Sparkles className="h-6 w-6" />}
              title="No points yet"
              description="Verify a receipt to earn your first points."
              action={
                <Link to="/app/verify">
                  <Button size="sm">Verify a receipt</Button>
                </Link>
              }
            />
          )}
        </Card>
      </div>
    </div>
  );
}