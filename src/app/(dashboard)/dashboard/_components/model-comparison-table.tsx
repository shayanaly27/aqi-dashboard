"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

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

interface ModelRow {
  model: string;
  best: boolean;
  h24: ModelMetric;
  h48: ModelMetric;
  h72: ModelMetric;
}

function buildRows(data: ModelMetricsResponse): ModelRow[] {
  const rows: ModelRow[] = data.day_1.models.map((m24) => {
    const m48 = data.day_2.models.find((m) => m.name === m24.name)!;
    const m72 = data.day_3.models.find((m) => m.name === m24.name)!;
    return {
      model: m24.name,
      best: m24.name === data.day_1.best_model,
      h24: m24,
      h48: m48,
      h72: m72,
    };
  });

  // lowest 24h RMSE first, so the best model naturally leads the table
  return rows.sort((a, b) => a.h24.rmse - b.h24.rmse);
}

function MetricCells({ metrics, best }: { metrics: ModelMetric; best: boolean }) {
  return (
    <>
      <td className={`px-4 py-3 text-sm ${best ? "font-semibold text-white" : "text-slate-300"}`}>
        {metrics.rmse.toFixed(1)}
      </td>
      <td className={`px-4 py-3 text-sm ${best ? "font-semibold text-white" : "text-slate-300"}`}>
        {metrics.mae.toFixed(1)}
      </td>
      <td
        className={`px-4 py-3 text-sm font-medium ${
          best ? "text-emerald-400" : "text-slate-300"
        }`}
      >
        {metrics.r2.toFixed(2)}
      </td>
    </>
  );
}

export default function ModelComparisonTable() {
  const [rows, setRows] = useState<ModelRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/model-metrics`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load model metrics");
        return res.json();
      })
      .then((json: ModelMetricsResponse) => {
        setRows(buildRows(json));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h3 className="mb-4 text-base font-semibold text-white">
        Model performance comparison
      </h3>

      {loading && <div className="py-6 text-center text-sm text-slate-400">Loading…</div>}
      {error && <div className="py-6 text-center text-sm text-red-400">{error}</div>}

      {!loading && !error && rows && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th rowSpan={2} className="px-4 pb-2 text-xs font-medium text-slate-400 align-bottom">
                  Model
                </th>
                <th colSpan={3} className="px-4 pb-1 text-center text-xs font-medium text-slate-400 border-b border-slate-800">
                  24h forecast
                </th>
                <th colSpan={3} className="px-4 pb-1 text-center text-xs font-medium text-slate-400 border-b border-slate-800">
                  48h forecast
                </th>
                <th colSpan={3} className="px-4 pb-1 text-center text-xs font-medium text-slate-400 border-b border-slate-800">
                  72h forecast
                </th>
              </tr>
              <tr>
                {["RMSE", "MAE", "R²", "RMSE", "MAE", "R²", "RMSE", "MAE", "R²"].map((label, i) => (
                  <th key={i} className="px-4 pb-2 pt-1 text-xs font-medium text-slate-500">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.model}
                  className={`border-t border-slate-800 ${row.best ? "bg-violet-500/10" : ""}`}
                >
                  <td
                    className={`px-4 py-3 text-sm ${
                      row.best ? "font-semibold text-violet-400" : "text-slate-300"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {row.best && (
                        <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                      )}
                      {row.model}
                    </span>
                  </td>
                  <MetricCells metrics={row.h24} best={row.best} />
                  <MetricCells metrics={row.h48} best={row.best} />
                  <MetricCells metrics={row.h72} best={row.best} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}