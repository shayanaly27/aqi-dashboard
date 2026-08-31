"use client";

import { useEffect, useState } from "react";
import { History, CheckCircle2 } from "lucide-react";
import { API_BASE } from "../lib/api-config";

interface VersionEntry {
  version: number;
  metrics: { rmse?: number; mae?: number; r2?: number } | null;
  description: string;
  created: string;
}

interface HorizonHistory {
  model_name: string;
  versions: VersionEntry[];
  current_best: VersionEntry;
}

interface ModelHistoryResponse {
  target_day1: HorizonHistory;
  target_day2: HorizonHistory;
  target_day3: HorizonHistory;
}

const HORIZON_LABELS: Record<string, string> = {
  target_day1: "Day 1 (24h)",
  target_day2: "Day 2 (48h)",
  target_day3: "Day 3 (72h)",
};

export default function ModelVersionHistory() {
  const [data, setData] = useState<ModelHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/model-versions`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load model version history");
        return res.json();
      })
      .then((json: ModelHistoryResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Object.entries() loses key-specific typing on a plain interface, so
  // we explicitly type the tuple here rather than relying on inference.
  const horizonEntries: [string, HorizonHistory][] = data
    ? (Object.entries(data) as [string, HorizonHistory][])
    : [];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="mb-4 flex items-center gap-1.5">
        <History className="h-4 w-4 text-blue-400" />
        <h3 className="text-base font-semibold text-white">Model version history</h3>
      </div>

      {loading && <div className="py-6 text-center text-sm text-slate-400">Loading…</div>}
      {error && <div className="py-6 text-center text-sm text-red-400">{error}</div>}

      {!loading && !error && data && (
        <div className="space-y-5">
          {horizonEntries.map(([targetKey, horizon]) => (
            <div key={targetKey}>
              <p className="mb-2 text-xs font-medium text-slate-400">
                {HORIZON_LABELS[targetKey] ?? targetKey}
              </p>
              <div className="flex flex-wrap gap-2">
                {horizon.versions.map((v: VersionEntry) => {
                  const isBest = v.version === horizon.current_best.version;
                  return (
                    <div
                      key={v.version}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${
                        isBest
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-slate-700 bg-slate-950/40 text-slate-400"
                      }`}
                    >
                      {isBest && <CheckCircle2 className="h-3 w-3" />}
                      <span className="font-medium">v{v.version}</span>
                      {v.metrics?.rmse != null && (
                        <span className="text-slate-500">RMSE {v.metrics.rmse.toFixed(1)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}