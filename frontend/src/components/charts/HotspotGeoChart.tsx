import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { Hotspot } from "@/types/api";

interface GeoPoint {
  area: string;
  lat: number;
  lng: number;
  report_count: number;
}

/**
 * Lightweight geographic visualisation. Plots report hotspots by their
 * longitude/latitude (only areas with known coordinates are shown).
 * This is a schematic scatter, not a full map tile layer.
 */
export function HotspotGeoChart({ data }: { data: Hotspot[] }) {
  const points: GeoPoint[] = data
    .filter(
      (h): h is Hotspot & { lat: number; lng: number } =>
        h.lat !== null && h.lng !== null,
    )
    .map((h) => ({
      area: h.area,
      lat: h.lat,
      lng: h.lng,
      report_count: h.report_count,
    }));

  if (points.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-ink-500">
        No geolocated hotspots available.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            dataKey="lng"
            name="Longitude"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <YAxis
            type="number"
            dataKey="lat"
            name="Latitude"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={44}
            domain={["dataMin - 1", "dataMax + 1"]}
          />
          <ZAxis
            type="number"
            dataKey="report_count"
            range={[80, 400]}
            name="Reports"
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 13,
            }}
            formatter={(value: any, name: any) =>
              name === "Reports" ? [`${value}`, name] : [value, name]
            }
          />
          <Scatter name="Hotspots" data={points} fill="#10b981" fillOpacity={0.7} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}