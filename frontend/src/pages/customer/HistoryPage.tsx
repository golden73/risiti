import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, History as HistoryIcon } from "lucide-react";
import { usePhone } from "@/context/PhoneContext";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { describeReason, formatDateTime } from "@/lib/format";

type Filter = "all" | "earned" | "redeemed";

export default function HistoryPage() {
  const { phone } = usePhone();
  const { data, loading, error } = useAsync(
    () => api.getBalance(phone),
    [phone],
  );
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const history = data?.history ?? [];
    if (filter === "earned") return history.filter((h) => h.change > 0);
    if (filter === "redeemed") return history.filter((h) => h.change < 0);
    return history;
  }, [data, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Activity"
        title="Transaction history"
        description="A full ledger of the points you've earned and redeemed."
      />

      {error && (
        <Alert variant="error" title="Couldn't load your history">
          {error.message}
        </Alert>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          active={filter}
          onChange={(k) => setFilter(k as Filter)}
          items={[
            { key: "all", label: "All" },
            { key: "earned", label: "Earned" },
            { key: "redeemed", label: "Redeemed" },
          ]}
        />
        <div className="text-sm text-ink-500">
          Balance:{" "}
          <span className="font-semibold text-ink-900">
            {data?.points ?? 0} pts
          </span>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Ledger entries"
          subtitle={`${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`}
        />
        {loading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : filtered.length > 0 ? (
          <ul className="divide-y divide-ink-100">
            {filtered.map((item) => {
              const positive = item.change > 0;
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        positive
                          ? "bg-brand-50 text-brand-600"
                          : "bg-accent-50 text-accent-600"
                      }`}
                    >
                      {positive ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800">
                        {describeReason(item.reason)}
                      </p>
                      <p className="text-xs text-ink-400">
                        {formatDateTime(item.created_at)} · id #{item.id}
                      </p>
                    </div>
                  </div>
                  <Badge tone={positive ? "success" : "accent"}>
                    {positive ? "+" : ""}
                    {item.change} pts
                  </Badge>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={<HistoryIcon className="h-6 w-6" />}
            title={filter === "all" ? "No transactions yet" : `No ${filter} transactions`}
            description="Verify a receipt to start building your history."
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