"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { API_BASE } from "../lib/api-config";

interface ModelMetric {
  name: string;
  rmse: number;
  mae: number;
  r2: number;
}

interface HorizonMetrics {
  label: string;
  models: ModelMetric[];
  best_model: string;
}

interface ModelMetricsResponse {
  day_1: HorizonMetrics;
  day_2: HorizonMetrics;
  day_3: HorizonMetrics;
}

export default function BestModel() {
  const [best, setBest] = useState<ModelMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/model-metrics`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load model metrics");
        return res.json();
      })
      .then((json: ModelMetricsResponse) => {
        const horizon = json.day_1;
        const bestModel = horizon.models.find((m) => m.name === horizon.best_model);
        setBest(bestModel ?? horizon.models[0]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="mb-3 flex items-center gap-1.5">
        <Trophy className="h-4 w-4 text-amber-400" />
        <h3 className="text-base font-semibold text-white">Best model</h3>
        <span className="text-sm text-slate-400">(Today)</span>
      </div>

      {loading && <div className="py-4 text-center text-sm text-slate-400">Loading…</div>}
      {error && <div className="py-4 text-center text-sm text-red-400">{error}</div>}

      {!loading && !error && best && (
        <>
          <p className="mb-4 text-lg font-semibold text-purple-400">{best.name}</p>

          <div className="space-y-2 border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">RMSE</span>
              <span className="font-medium text-white">{best.rmse.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">MAE</span>
              <span className="font-medium text-white">{best.mae.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">R² score</span>
              <span className="font-medium text-white">{best.r2.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        className="mt-5 w-full rounded-full border border-slate-700 py-2 text-sm font-medium text-purple-400 hover:bg-slate-800"
      >
        View model comparison
      </button>
    </div>
  );
}