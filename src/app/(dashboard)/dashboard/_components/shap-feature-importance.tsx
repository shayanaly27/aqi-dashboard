"use client";

import { useEffect, useState } from "react";
import { displayForFeature } from "../data/feature-display";
import { API_BASE } from "../lib/api-config";

interface RawFeature {
  feature: string;
  importance: number;
}

interface FeatureImportanceResponse {
  horizon: string;
  model: string;
  top_features: RawFeature[];
}

export default function ShapFeatureImportance() {
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
        setFeatures(json.top_features.slice(0, 5));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const maxImportance = features ? Math.max(...features.map((f) => f.importance)) : 1;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h3 className="text-base font-semibold text-white">SHAP feature importance</h3>
      <p className="mb-4 text-sm text-slate-400">Top factors influencing AQI prediction</p>

      {loading && <div className="py-6 text-center text-sm text-slate-400">Loading…</div>}
      {error && <div className="py-6 text-center text-sm text-red-400">{error}</div>}

      {!loading && !error && features && (
        <div className="space-y-3">
          {features.map((f) => {
            const { label } = displayForFeature(f.feature);
            return (
              <div key={f.feature} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-white">{label}</span>
                <div className="h-2 w-full flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${(f.importance / maxImportance) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-medium text-white">
                  {f.importance.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}