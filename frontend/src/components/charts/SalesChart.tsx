import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DaySummary } from "@/types/api";
import { formatMoney, weekdayShort } from "@/lib/format";

interface ChartDatum {
  label: string;
  total: number;
  count: number;
  date: string;
}

export function SalesChart({ data }: { data: DaySummary[] }) {
  const chartData: ChartDatum[] = data.map((d) => ({
    label: weekdayShort(d.date),
    total: d.total,
    count: d.count,
    date: d.date,
  }));

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v) => `K${v}`}
          />
          <Tooltip
            cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 13,
              boxShadow: "0 8px 24px -12px rgba(15,23,42,0.2)",
            }}
            formatter={(value: any) => [formatMoney(Number(value)), "Verified sales"]}
            labelFormatter={(label: any, payload: any) =>
              payload && payload[0]
                ? `${label} · ${payload[0].payload.date}`
                : label
            }
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#059669"
            strokeWidth={2.5}
            fill="url(#salesFill)"
            dot={{ r: 3, fill: "#059669", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#047857", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}