"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList, Cell } from "recharts";

/* ─────────────────────────────────────────────────────────
   Reuses the same pollutant values KeyPollutants already
   renders as cards - this just plots them as a bar chart
   instead. Pass data.pollutants straight through from page.tsx.
   ───────────────────────────────────────────────────────── */
export interface PollutantBreakdownProps {
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
}

const BARS = [
  { key: "pm25", label: "PM2.5", unit: "µg/m³", color: "#f97316" },
  { key: "pm10", label: "PM10", unit: "µg/m³", color: "#facc15" },
  { key: "o3", label: "O₃", unit: "ppb", color: "#6ee7b7" },
  { key: "no2", label: "NO₂", unit: "ppb", color: "#34d399" },
  { key: "so2", label: "SO₂", unit: "ppb", color: "#22d3ee" },
  { key: "co", label: "CO", unit: "ppm", color: "#10b981" },
] as const;

export default function PollutantBreakdown({ pollutants }: PollutantBreakdownProps) {
  const data = BARS.map((bar) => ({
    ...bar,
    value: pollutants[bar.key as keyof typeof pollutants],
  }));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h3 className="text-base font-semibold text-white">Pollutant breakdown</h3>
      <p className="mb-4 text-sm text-slate-400">Current concentration</p>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <YAxis hide domain={[0, (max: number) => max * 1.3]} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                style={{ fontSize: 12, fontWeight: 600, fill: "#f1f5f9" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 grid grid-cols-6 gap-1 text-center">
        {data.map((bar) => (
          <span key={bar.key} className="text-[11px] text-slate-500">
            {bar.unit}
          </span>
        ))}
      </div>
    </div>
  );
}