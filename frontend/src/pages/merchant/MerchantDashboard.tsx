import { useState } from "react";
import {
  ReceiptText,
  TrendingUp,
  Landmark,
  CalendarDays,
  Store,
  Info,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { DEMO_TPINS, DEMO_TPIN } from "@/lib/constants";
import { formatMoney, formatMoneyCompact, weekdayShort } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { SalesChart } from "@/components/charts/SalesChart";

const NAV = [{ label: "Overview", to: "/merchant", icon: Store, end: true }];

export default function MerchantDashboard() {
  const [tpin, setTpin] = useState(DEMO_TPIN);
  const { data, loading, error } = useAsync(
    () => api.merchantSummary(tpin),
    [tpin],
  );

  const totalCount = data?.last_7_days.reduce((s, d) => s + d.count, 0) ?? 0;
  const totalWeek = data?.last_7_days.reduce((s, d) => s + d.total, 0) ?? 0;
  const bestDay = data?.last_7_days.reduce(
    (best, d) => (d.total > best.total ? d : best),
    { date: "", count: 0, total: 0 },
  );

  return (
    <DashboardLayout
      navItems={NAV}
      headerRight={
        <select
          value={tpin}
          onChange={(e) => setTpin(e.target.value)}
          className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 shadow-soft focus:border-brand-500 focus:outline-none"
          aria-label="Select merchant TPIN"
        >
          {DEMO_TPINS.map((tp) => (
            <option key={tp} value={tp}>
              {tp}
            </option>
          ))}
        </select>
      }
      footer={
        <div className="rounded-xl bg-ink-50 p-3 text-xs leading-relaxed text-ink-500">
          <span className="font-semibold text-ink-700">Read-only.</span> Tax
          figures are estimates pending finance confirmation.
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          eyebrow="Merchant portal"
          title={data?.vendor_name ?? "Merchant dashboard"}
          description="A read-only view of your verified sales and estimated tax summary."
          action={<Badge tone="neutral">TPIN · {tpin}</Badge>}
        />

        {error && (
          <Alert
            variant="error"
            title={error.status === 404 ? "Merchant not found" : "Couldn't load summary"}
          >
            {error.message}
          </Alert>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Verified receipts"
                value={data.verified_count}
                icon={<ReceiptText className="h-5 w-5" />}
                tone="brand"
                hint="All time"
              />
              <StatCard
                label="Total verified sales"
                value={formatMoney(data.verified_total)}
                icon={<TrendingUp className="h-5 w-5" />}
                tone="info"
                hint="All time"
              />
              <StatCard
                label="Estimated tax due"
                value={formatMoney(data.estimated_tax_due)}
                icon={<Landmark className="h-5 w-5" />}
                tone="accent"
                hint="Estimate only"
              />
              <StatCard
                label="Last 7 days"
                value={formatMoneyCompact(totalWeek)}
                icon={<CalendarDays className="h-5 w-5" />}
                tone="neutral"
                hint={`${totalCount} receipts this week`}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <Card>
                <CardHeader
                  title="Seven-day sales"
                  subtitle="Verified sales totals over the last week"
                  action={<Badge tone="brand">Last 7 days</Badge>}
                />
                <CardBody>
                  <SalesChart data={data.last_7_days} />
                </CardBody>
              </Card>

              <Card className="h-fit">
                <CardHeader title="Highlights" />
                <CardBody className="space-y-4">
                  <div>
                    <p className="text-sm text-ink-500">Best day</p>
                    <p className="mt-0.5 font-semibold text-ink-900">
                      {bestDay && bestDay.total > 0
                        ? `${weekdayShort(bestDay.date)} · ${formatMoney(bestDay.total)}`
                        : "No sales yet"}
                    </p>
                  </div>
                  <div className="h-px bg-ink-100" />
                  <div>
                    <p className="text-sm text-ink-500">Average per receipt</p>
                    <p className="mt-0.5 font-semibold text-ink-900">
                      {data.verified_count > 0
                        ? formatMoney(data.verified_total / data.verified_count)
                        : "—"}
                    </p>
                  </div>
                  <div className="h-px bg-ink-100" />
                  <div className="flex items-start gap-2 rounded-xl bg-accent-50 p-3 text-xs text-accent-800">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{data.tax_rate_note}</span>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader
                title="Daily breakdown"
                subtitle="Verified receipts and totals per day"
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                      <th className="px-5 py-3 font-medium sm:px-6">Date</th>
                      <th className="px-5 py-3 font-medium">Receipts</th>
                      <th className="px-5 py-3 text-right font-medium sm:px-6">
                        Verified sales
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {data.last_7_days.map((day) => (
                      <tr key={day.date} className="hover:bg-ink-50/60">
                        <td className="px-5 py-3 font-medium text-ink-700 sm:px-6">
                          {day.date}
                          <span className="ml-2 text-ink-400">
                            ({weekdayShort(day.date)})
                          </span>
                        </td>
                        <td className="px-5 py-3 text-ink-600">{day.count}</td>
                        <td className="px-5 py-3 text-right font-semibold text-ink-900 sm:px-6">
                          {formatMoney(day.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}