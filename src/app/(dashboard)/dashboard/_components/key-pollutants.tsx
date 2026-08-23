"use client";

import { Atom, Wind, Droplets, LucideIcon } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Key Pollutants panel, dark theme: each row gets a colored
   icon circle (fixed per-pollutant accent, not tied to status)
   plus the value on the left, and the status shown as plain
   colored text on the right - no pill background, matching
   the reference design exactly.
   ───────────────────────────────────────────────────────── */

export type PollutantStatus = "Good" | "Normal" | "Moderate" | "Unhealthy";

export interface PollutantReading {
  label: string;
  value: number;
  unit: string;
  status: PollutantStatus;
}

interface KeyPollutantsProps {
  pollutants: PollutantReading[];
  onViewAll?: () => void;
}

const STATUS_TEXT: Record<PollutantStatus, string> = {
  Good: "text-emerald-400",
  Normal: "text-sky-400",
  Moderate: "text-amber-400",
  Unhealthy: "text-red-400",
};

/** Fixed per-pollutant accent (icon + circle color) - purely visual
 * identity for each pollutant, independent of its current status. */
const POLLUTANT_ACCENT: Record<string, { icon: LucideIcon; bg: string; text: string }> = {
  "PM2.5": { icon: Atom, bg: "bg-cyan-400/15", text: "text-cyan-300" },
  PM10: { icon: Atom, bg: "bg-purple-400/15", text: "text-purple-300" },
  "O₃": { icon: Wind, bg: "bg-amber-400/15", text: "text-amber-300" },
  "NO₂": { icon: Wind, bg: "bg-pink-400/15", text: "text-pink-300" },
  "SO₂": { icon: Droplets, bg: "bg-emerald-400/15", text: "text-emerald-300" },
  CO: { icon: Wind, bg: "bg-red-400/15", text: "text-red-300" },
};

function accentFor(label: string) {
  return POLLUTANT_ACCENT[label] ?? { icon: Wind, bg: "bg-slate-700/40", text: "text-slate-300" };
}

/**
 * Rough, simplified breakpoints for color-coding pollutant readings on
 * the dashboard. These are NOT official EPA breakpoint tables - just
 * reasonable approximations for visual status. Refine against the
 * actual EPA AQI breakpoint tables if precise accuracy matters.
 */
export function deriveStatus(pollutant: string, value: number): PollutantStatus {
  const thresholds: Record<string, [number, number, number]> = {
    pm25: [12, 35.4, 55.4],
    pm10: [54, 154, 254],
    o3: [54, 70, 85],
    no2: [53, 100, 360],
    so2: [35, 75, 185],
    co: [4.4, 9.4, 12.4],
  };

  const t = thresholds[pollutant.toLowerCase()];
  if (!t) return "Normal";

  const [good, normal, moderate] = t;
  if (value <= good) return "Good";
  if (value <= normal) return "Normal";
  if (value <= moderate) return "Moderate";
  return "Unhealthy";
}

export default function KeyPollutants({ pollutants, onViewAll }: KeyPollutantsProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Key Pollutants</h2>
        <button
          onClick={onViewAll}
          className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300 transition hover:bg-blue-500/25"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pollutants.map((p) => {
          const { icon: Icon, bg, text } = accentFor(p.label);
          return (
            <div
              key={p.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                  <Icon className={`h-4 w-4 ${text}`} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{p.label}</p>
                  <p className="text-base font-bold text-white">
                    {p.value}
                    <span className="ml-1 text-xs font-normal text-slate-400">{p.unit}</span>
                  </p>
                </div>
              </div>

              <span className={`shrink-0 text-sm font-medium ${STATUS_TEXT[p.status]}`}>
                {p.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}