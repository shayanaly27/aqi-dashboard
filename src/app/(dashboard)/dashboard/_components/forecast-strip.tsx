"use client";

import { Cloud, CloudSun, Sun } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   3-Day Forecast, dark theme: "Today" + 3 predicted points,
   each showing a weather icon, a big AQI number, the category
   label, and a wavy sparkline with point markers underneath -
   colored to match the reading's severity. The first card
   (today) gets a highlighted border to set it apart.
   ───────────────────────────────────────────────────────── */

export interface ForecastPoint {
  dayLabel: string;
  aqi: number;
  category: string;
  isHazardous: boolean;
  condition?: "sun" | "cloud-sun" | "cloud";
}

interface ForecastStripProps {
  points: ForecastPoint[]; // expects exactly 4: today + 3 forecast points
}

const CATEGORY_LABEL: Record<string, string> = {
  Good: "Good",
  Moderate: "Moderate",
  "Unhealthy for Sensitive Groups": "Unhealthy (SG)",
  Unhealthy: "Unhealthy",
  "Very Unhealthy": "Very Unhealthy",
  Hazardous: "Hazardous",
};

function labelFor(category: string) {
  return CATEGORY_LABEL[category] ?? category;
}

function colorForAqi(aqi: number, category: string): string {
  if (category === "Good") return "#7BC96F";
  if (category === "Moderate") {
    const t = Math.min(Math.max((aqi - 50) / 50, 0), 1);
    const from = [251, 201, 76];
    const to = [242, 137, 28];
    const mix = from.map((c, i) => Math.round(c + t * (to[i] - c)));
    return `rgb(${mix.join(",")})`;
  }
  if (category === "Unhealthy for Sensitive Groups" || category === "Unhealthy") return "#E5484D";
  if (category === "Very Unhealthy") return "#9B51E0";
  if (category === "Hazardous") return "#6B2A3D";
  return "#94A3B8";
}

const CONDITIONS: Array<"sun" | "cloud-sun" | "cloud"> = ["sun", "cloud-sun", "cloud", "cloud-sun"];

function WeatherIcon({ condition, color }: { condition: "sun" | "cloud-sun" | "cloud"; color: string }) {
  if (condition === "sun") return <Sun className="h-6 w-6" style={{ color }} strokeWidth={2} />;
  if (condition === "cloud") return <Cloud className="h-6 w-6 text-slate-300" strokeWidth={2} />;
  return <CloudSun className="h-6 w-6 text-slate-200" strokeWidth={2} />;
}

function seedFrom(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 1000;
  return h;
}

function buildWave(seed: number, width: number, height: number) {
  const pointCount = 7;
  const baseline = height * 0.62;
  const amp = height * 0.28;
  const points = Array.from({ length: pointCount }, (_, i) => {
    const x = (width / (pointCount - 1)) * i;
    const phase = seed * 0.07;
    const y =
      baseline -
      Math.sin(i * 1.3 + phase) * amp * 0.6 -
      Math.sin(i * 0.6 + phase * 1.7) * amp * 0.4;
    return { x, y: Math.min(Math.max(y, height * 0.12), height * 0.9) };
  });
  let line = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2;
    const my = (points[i].y + points[i + 1].y) / 2;
    line += ` Q ${points[i].x},${points[i].y} ${mx},${my}`;
  }
  const last = points[points.length - 1];
  line += ` T ${last.x},${last.y}`;
  const area = `${line} L ${width},${height} L 0,${height} Z`;
  return { line, area, points };
}

function Sparkline({ seed, color }: { seed: number; color: string }) {
  const width = 200;
  const height = 56;
  const { line, area, points } = buildWave(seed, width, height);
  const gradId = `sparkline-fill-${seed}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-14 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} stroke="none" />
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
      ))}
    </svg>
  );
}

export default function ForecastStrip({ points }: ForecastStripProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="mb-4 text-lg font-bold text-white">3-Day Forecast</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {points.map((point, i) => {
          const color = colorForAqi(point.aqi, point.category);
          const condition = point.condition ?? CONDITIONS[i % CONDITIONS.length];
          const seed = seedFrom(point.dayLabel + point.aqi);
          const isToday = i === 0;

          return (
            <div
              key={point.dayLabel + i}
              className={`rounded-2xl border p-4 transition ${
                isToday
                  ? "border-blue-400/50 bg-slate-900/90 ring-1 ring-blue-400/20"
                  : "border-slate-800 bg-slate-950/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">{point.dayLabel}</p>
                <WeatherIcon condition={condition} color={color} />
              </div>
              <p className="mt-3 text-4xl font-bold tabular-nums leading-none" style={{ color }}>
                {point.aqi}
              </p>
              <p className="mt-2 text-sm font-semibold" style={{ color }}>
                {labelFor(point.category)}
              </p>
              <Sparkline seed={seed} color={color} />
            </div>
          );
        })}
      </div>
    </div>
  );
}