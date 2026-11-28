import { MapPin, Flag, Globe2, ShieldAlert } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { HotspotBarChart } from "@/components/charts/HotspotBarChart";
import { HotspotGeoChart } from "@/components/charts/HotspotGeoChart";

const NAV = [{ label: "Hotspots", to: "/zra", icon: MapPin, end: true }];

export default function ZraDashboard() {
  const { data, loading, error } = useAsync(() => api.hotspots(), []);

  const hotspots = data ?? [];
  const totalReports = hotspots.reduce((s, h) => s + h.report_count, 0);
  const areasWithReports = hotspots.filter((h) => h.report_count > 0).length;
  const geolocated = hotspots.filter(
    (h) => h.lat !== null && h.lng !== null,
  ).length;
  const top = [...hotspots].sort((a, b) => b.report_count - a.report_count)[0];

  return (
    <DashboardLayout
      navItems={NAV}
      headerRight={<Badge tone="info">Read-only</Badge>}
      footer={
        <div className="rounded-xl bg-ink-50 p-3 text-xs leading-relaxed text-ink-500">
          <span className="font-semibold text-ink-700">ZRA view.</span> No phone
          numbers are exposed. Data is simulated for the demo.
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          eyebrow="ZRA insights"
          title="Reporting hotspots"
          description="Monitor where no-receipt reports cluster, and watch compliance trends across the country."
          action={<Badge tone="info" icon={<Globe2 className="h-3.5 w-3.5" />}>National view</Badge>}
        />

        {error && (
          <Alert variant="error" title="Couldn't load hotspots">
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
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total reports"
                value={totalReports}
                icon={<Flag className="h-5 w-5" />}
                tone="danger"
                hint="No-receipt reports"
              />
              <StatCard
                label="Areas reporting"
                value={areasWithReports}
                icon={<MapPin className="h-5 w-5" />}
                tone="brand"
                hint={`of ${hotspots.length} areas`}
              />
              <StatCard
                label="Geolocated areas"
                value={geolocated}
                icon={<Globe2 className="h-5 w-5" />}
                tone="info"
                hint="Mapped coordinates"
              />
              <StatCard
                label="Top hotspot"
                value={top?.area ?? "—"}
                icon={<ShieldAlert className="h-5 w-5" />}
                tone="accent"
                hint={top ? `${top.report_count} reports` : "No data"}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader
                  title="Reports by area"
                  subtitle="Where receipts are most often missing"
                />
                <CardBody>
                  <HotspotBarChart data={hotspots} />
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="Geographic distribution"
                  subtitle="Hotspots plotted by coordinates"
                  action={<Badge tone="neutral">Schematic</Badge>}
                />
                <CardBody>
                  <HotspotGeoChart data={hotspots} />
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader
                title="All areas"
                subtitle="Report counts, sorted by volume"
                action={<Badge tone="brand">{hotspots.length} areas</Badge>}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                      <th className="px-5 py-3 font-medium sm:px-6">Area</th>
                      <th className="px-5 py-3 font-medium">Reports</th>
                      <th className="px-5 py-3 font-medium">Coordinates</th>
                      <th className="px-5 py-3 text-right font-medium sm:px-6">
                        Share
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {[...hotspots]
                      .sort((a, b) => b.report_count - a.report_count)
                      .map((h) => {
                        const share =
                          totalReports > 0
                            ? Math.round((h.report_count / totalReports) * 100)
                            : 0;
                        return (
                          <tr key={h.area} className="hover:bg-ink-50/60">
                            <td className="px-5 py-3 font-medium text-ink-700 sm:px-6">
                              {h.area}
                            </td>
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center gap-2">
                                <span className="font-semibold text-ink-900">
                                  {h.report_count}
                                </span>
                                <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-ink-100 sm:block">
                                  <span
                                    className="block h-full rounded-full bg-brand-500"
                                    style={{ width: `${share}%` }}
                                  />
                                </span>
                              </span>
                            </td>
                            <td className="px-5 py-3 text-ink-500">
                              {h.lat !== null && h.lng !== null
                                ? `${h.lat.toFixed(3)}, ${h.lng.toFixed(3)}`
                                : "—"}
                            </td>
                            <td className="px-5 py-3 text-right font-semibold text-ink-900 sm:px-6">
                              {share}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}