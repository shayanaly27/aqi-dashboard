"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { API_BASE } from "../lib/api-config";

export interface TrendPoint {
  label: string;
  aqi: number;
}

interface HistoryApiResponse {
  days: number;
  history: { date: string; aqi: number }[];
}

function formatDailyLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

async function fetchHistory(days: number): Promise<TrendPoint[]> {
  const res = await fetch(`${API_BASE}/history?days=${days}`);
  if (!res.ok) throw new Error("Failed to load AQI history");
  const json: HistoryApiResponse = await res.json();
  return json.history.map((p) => ({
    label: formatDailyLabel(p.date),
    aqi: p.aqi,
  }));
}

/* Custom tooltip: dark pill showing the date on top and the bold
   AQI reading underneath, matching the reference design. */
function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-center shadow-lg">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="text-lg font-bold text-white">{payload[0].value}</p>
    </div>
  );
}

export default function AqiTrendChart() {
  const [data, setData] = useState<TrendPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchHistory(14)
      .then((points) => {
        setData(points);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">AQI trend (14 days)</h3>
      </div>

      {loading && (
        <div className="flex h-56 items-center justify-center text-sm text-slate-400">
          Loading trend…
        </div>
      )}
      {error && (
        <div className="flex h-56 items-center justify-center text-sm text-red-400">{error}</div>
      )}

      {!loading && !error && data && (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#1e293b" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#334155", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="#a78bfa"
                strokeWidth={2}
                fill="url(#aqiFill)"
                dot={{ r: 3, fill: "#a78bfa", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#a78bfa", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}