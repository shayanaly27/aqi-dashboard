"use client";

import { useEffect, useState } from "react";
import { displayForFeature } from "../data/feature-display";

const API_BASE = "http://127.0.0.1:8000";

interface RawFeature {
  feature: string;
  importance: number;
}

interface FeatureImportanceResponse {
  horizon: string;
  model: string;
  top_features: RawFeature[];
}

interface PrimaryFactorsProps {
  maxItems?: number;
}

/* Per-factor accent color, keyed by the display label from
   displayForFeature. Falls back to a neutral slate if a feature
   isn't in the map, so new/unknown features never break styling. */
const FACTOR_COLORS: Record<string, { iconBg: string; iconText: string; bar: string }> = {
  "PM2.5": {
    iconBg: "bg-indigo-500/20",
    iconText: "text-indigo-400",
    bar: "bg-gradient-to-r from-indigo-500 to-sky-400",
  },
  Humidity: {
    iconBg: "bg-fuchsia-500/20",
    iconText: "text-fuchsia-400",
    bar: "bg-fuchsia-500",
  },
  "Wind Speed": {
    iconBg: "bg-amber-500/20",
    iconText: "text-amber-400",
    bar: "bg-amber-500",
  },
  Temperature: {
    iconBg: "bg-orange-500/20",
    iconText: "text-orange-400",
    bar: "bg-orange-500",
  },
  "Pressure Level": {
    iconBg: "bg-teal-500/20",
    iconText: "text-teal-400",
    bar: "bg-teal-400",
  },
};

const DEFAULT_COLORS = {
  iconBg: "bg-slate-700/40",
  iconText: "text-slate-400",
  bar: "bg-slate-400",
};

export default function PrimaryFactors({ maxItems = 5 }: PrimaryFactorsProps) {
  const [features, setFeatures] = useState<RawFeature[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/feature-importance`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load feature importance");
        return res.json();
      })
      .then((json: FeatureImportanceResponse) => {
        setFeatures(json.top_features.slice(0, maxItems));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [maxItems]);

  const total = features ? features.reduce((sum, f) => sum + f.importance, 0) : 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h3 className="text-base font-semibold text-white">Primary factors</h3>
      <p className="mb-4 text-sm text-slate-400">What is driving today&apos;s AQI?</p>

      {loading && <div className="py-6 text-center text-sm text-slate-400">Loading…</div>}
      {error && <div className="py-6 text-center text-sm text-red-400">{error}</div>}

      {!loading && !error && features && (
        <div className="space-y-4">
          {features.map((f) => {
            const { label, icon: Icon } = displayForFeature(f.feature);
            const pct = total > 0 ? Math.round((f.importance / total) * 100) : 0;
            const colors = FACTOR_COLORS[label] ?? DEFAULT_COLORS;

            return (
              <div key={f.feature} className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${colors.iconBg}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${colors.iconText}`} />
                </div>
                <span className="w-24 shrink-0 text-sm text-slate-300">{label}</span>
                <div className="h-1.5 w-full flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${colors.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-sm font-medium text-slate-300">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}