import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Hotspot } from "@/types/api";

export function HotspotBarChart({ data }: { data: Hotspot[] }) {
  const chartData = [...data]
    .sort((a, b) => b.report_count - a.report_count)
    .slice(0, 8);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="area"
            tick={{ fontSize: 12, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
            width={92}
          />
          <Tooltip
            cursor={{ fill: "rgba(16,185,129,0.06)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 13,
              boxShadow: "0 8px 24px -12px rgba(15,23,42,0.2)",
            }}
            formatter={(value: any) => [`${value} reports`, "No-receipt reports"]}
          />
          <Bar dataKey="report_count" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {chartData.map((entry) => (
              <Cell
                key={entry.area}
                fill={entry.report_count > 0 ? "#10b981" : "#e2e8f0"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}