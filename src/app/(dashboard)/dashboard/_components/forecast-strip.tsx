"use client";

import { useState } from "react";
import { Cloud, CloudSun, Sun } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   3-Day Forecast, dark theme: 3 predicted days (Today is
   intentionally excluded - the hero panel already shows it).
   Each card shows a weather icon, big AQI number, category,
   a one-line description, Min/Max for the day, and an hourly
   curve underneath with time-of-day tick labels.

   NOTE ON Min/Max AND THE HOURLY CURVE: the backend predicts
   one AQI value per day (24h/48h/72h horizons), not an hourly
   breakdown. The curve below is a *shaped estimate*, not a
   per-hour model output: it distributes the day's predicted
   AQI across a typical diurnal pattern (low overnight, rising
   through the afternoon, peaking evening - the same pattern
   documented in the project report's EDA, Section 4.3) so Min/
   Max and the sparkline look like a real day's shape rather
   than a flat line. If per-hour forecasts are added to the API
   later, swap DIURNAL_ANCHORS-based generation for real data.
   ───────────────────────────────────────────────────────── */

export interface ForecastPoint {
  dayLabel: string;
  offsetLabel: string;
  aqi: number;
  category: string;
  isHazardous: boolean;
  condition?: "sun" | "cloud-sun" | "cloud";
}

interface ForecastStripProps {
  points: ForecastPoint[]; // expects exactly 3: the forecast days (no "Today")
}

const CATEGORY_LABEL: Record<string, string> = {
  Good: "Good",
  Moderate: "Moderate",
  "Unhealthy for Sensitive Groups": "Unhealthy (SG)",
  Unhealthy: "Unhealthy",
  "Very Unhealthy": "Very Unhealthy",
  Hazardous: "Hazardous",
};

const CATEGORY_DESCRIPTION: Record<string, string> = {
  Good: "Air quality is good and poses little or no risk.",
  Moderate: "Air quality is acceptable for most people.",
  "Unhealthy for Sensitive Groups": "Sensitive groups may experience health effects.",
  Unhealthy: "Everyone may begin to experience health effects.",
  "Very Unhealthy": "Health alert: everyone may experience more serious effects.",
  Hazardous: "Health warning of emergency conditions for everyone.",
};

function labelFor(category: string) {
  return CATEGORY_LABEL[category] ?? category;
}

function descriptionFor(category: string) {
  return CATEGORY_DESCRIPTION[category] ?? "Air quality data for this period.";
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

const CONDITIONS: Array<"sun" | "cloud-sun" | "cloud"> = ["cloud-sun", "cloud", "cloud-sun", "sun"];

function WeatherIcon({ condition, color }: { condition: "sun" | "cloud-sun" | "cloud"; color: string }) {
  if (condition === "sun") return <Sun className="h-5 w-5" style={{ color }} strokeWidth={2} />;
  if (condition === "cloud") return <Cloud className="h-5 w-5 text-slate-300" strokeWidth={2} />;
  return <CloudSun className="h-5 w-5 text-slate-200" strokeWidth={2} />;
}

// Typical Karachi diurnal AQI shape (relative multiplier around the day's
// mean), anchored at the same 6-hour marks shown on the chart's axis.
// Source: project report Section 4.3 - AQI dips overnight, rises through
// the afternoon, peaks ~17:00-20:00.
const DIURNAL_ANCHORS: Array<[hour: number, multiplier: number]> = [
  [0, 0.93],
  [6, 0.88],
  [12, 1.0],
  [18, 1.14],
  [24, 0.93],
];

function diurnalMultiplier(hour: number): number {
  for (let i = 0; i < DIURNAL_ANCHORS.length - 1; i++) {
    const [h0, m0] = DIURNAL_ANCHORS[i];
    const [h1, m1] = DIURNAL_ANCHORS[i + 1];
    if (hour >= h0 && hour <= h1) {
      const t = (hour - h0) / (h1 - h0);
      return m0 + t * (m1 - m0);
    }
  }
  return 1;
}

function buildDiurnalCurve(dayAqi: number, pointCount = 13) {
  const hours = Array.from({ length: pointCount }, (_, i) => (24 / (pointCount - 1)) * i);
  const values = hours.map((h) => Math.round(dayAqi * diurnalMultiplier(h)));
  return { hours, values };
}

const AXIS_TICKS = ["12 AM", "6 AM", "12 PM", "6 PM", "12 AM"];

function HourlyChart({ values, color }: { values: number[]; color: string }) {
  const width = 200;
  const height = 56;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);

  const points = values.map((v, i) => {
    const x = (width / (values.length - 1)) * i;
    // invert so higher AQI draws higher on the chart, with a small margin
    const y = height * 0.9 - ((v - min) / span) * (height * 0.7);
    return { x, y };
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
  const gradId = `hourly-fill-${Math.round(min)}-${Math.round(max)}`;

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradId})`} stroke="none" />
        <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        {points
          .filter((_, i) => i % 2 === 0)
          .map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2} fill={color} />
          ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-slate-500">
        {AXIS_TICKS.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}

type MetricTab = "aqi" | "pollutants";

export default function ForecastStrip({ points }: ForecastStripProps) {
  const [tab, setTab] = useState<MetricTab>("aqi");

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">3-Day Forecast</h2>

        <div className="inline-flex rounded-full border border-slate-700 bg-slate-950/60 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setTab("aqi")}
            className={`rounded-full px-4 py-1.5 transition ${
              tab === "aqi" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            AQI
          </button>
          <button
            type="button"
            onClick={() => setTab("pollutants")}
            className={`rounded-full px-4 py-1.5 transition ${
              tab === "pollutants" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Pollutants
          </button>
        </div>
      </div>

      {tab === "pollutants" ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-8 text-center text-sm text-slate-400">
          Per-pollutant forecasts aren&apos;t available yet — the model currently predicts overall AQI per day, not
          individual pollutants for future days.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((point, i) => {
            const color = colorForAqi(point.aqi, point.category);
            const condition = point.condition ?? CONDITIONS[i % CONDITIONS.length];
            const { values } = buildDiurnalCurve(point.aqi);
            const min = Math.min(...values);
            const max = Math.max(...values);

            return (
              <div
                key={point.dayLabel + i}
                className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{point.dayLabel}</p>
                    <p className="text-xs font-medium text-slate-400">{point.offsetLabel}</p>
                  </div>
                  <WeatherIcon condition={condition} color={color} />
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-4xl font-bold tabular-nums leading-none" style={{ color }}>
                      {point.aqi}
                    </p>
                    <p className="mt-2 text-sm font-semibold" style={{ color }}>
                      {labelFor(point.category)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <p className="text-blue-400">
                      Min <span className="ml-1 font-bold text-white">{min}</span>
                    </p>
                    <p className="mt-1 text-red-400">
                      Max <span className="ml-1 font-bold text-white">{max}</span>
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-400">{descriptionFor(point.category)}</p>

                <HourlyChart values={values} color={color} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}