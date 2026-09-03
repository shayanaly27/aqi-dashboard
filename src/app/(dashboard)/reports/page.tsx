"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Printer } from "lucide-react";
import { useForecast } from "../dashboard/data/forecast-context";
import DashboardSkeleton from "../dashboard/_components/dashboard-skeleton";
import { API_BASE } from "../dashboard/lib/api-config";

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

function csvEscape(value: string | number | boolean): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export default function ReportsPage() {
  const { data, error, loading, refreshing } = useForecast();
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/model-metrics`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setMetrics)
      .catch(() => setMetrics(null));
  }, []);

  const showSkeleton = loading || refreshing;
  if (showSkeleton) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/30 px-6 py-6 text-sm text-red-400">
        Couldn&apos;t reach the prediction API.
      </div>
    );
  }

  const generatedAt = new Date().toLocaleString();

  function handleExportCsv() {
    if (!data) return;
    const rows: (string | number | boolean)[][] = [
      ["AQI Prediction Report"],
      ["Generated", generatedAt],
      ["Based on data from", data.based_on_timestamp],
      [],
      ["Metric", "Value"],
      ["Current AQI", data.current_aqi],
      ["Current Category", data.current_category],
      [],
      ["Pollutant", "Value"],
      ["PM2.5 (µg/m³)", data.pollutants.pm25],
      ["PM10 (µg/m³)", data.pollutants.pm10],
      ["O3 (ppb)", data.pollutants.o3],
      ["NO2 (ppb)", data.pollutants.no2],
      ["SO2 (ppb)", data.pollutants.so2],
      ["CO (ppm)", data.pollutants.co],
      [],
      ["Horizon", "Predicted AQI", "Category", "Hazardous"],
      ["+24h", data.forecast.day_1.predicted_aqi, data.forecast.day_1.category, data.forecast.day_1.is_hazardous],
      ["+48h", data.forecast.day_2.predicted_aqi, data.forecast.day_2.category, data.forecast.day_2.is_hazardous],
      ["+72h", data.forecast.day_3.predicted_aqi, data.forecast.day_3.category, data.forecast.day_3.is_hazardous],
    ];

    if (metrics) {
      rows.push([], ["Horizon", "Model", "RMSE", "MAE", "R2"]);
      for (const [key, horizon] of Object.entries(metrics) as [string, HorizonMetrics][]) {
        for (const m of horizon.models) {
          rows.push([horizon.label, m.name, m.rmse, m.mae, m.r2]);
        }
      }
    }

    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aqi-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const bestDay1 = metrics?.day_1.models.find((m) => m.name === metrics.day_1.best_model);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-sm text-slate-400">
            A printable, exportable summary of the current forecast and model performance.
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="mb-5 flex items-center gap-2 border-b border-slate-800 pb-4">
          <FileText className="h-5 w-5 text-blue-400" />
          <div>
            <p className="text-sm font-semibold text-white">Karachi AQI Forecast Report</p>
            <p className="text-xs text-slate-500">Generated {generatedAt} — based on data from {new Date(data.based_on_timestamp).toLocaleString()}</p>
          </div>
        </div>

        <h3 className="mb-2 text-sm font-semibold text-slate-300">Current Conditions</h3>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-950/40 p-3">
            <p className="text-xs text-slate-500">Current AQI</p>
            <p className="text-xl font-bold text-white">{data.current_aqi.toFixed(0)}</p>
            <p className="text-xs text-amber-400">{data.current_category}</p>
          </div>
          {[
            { label: "PM2.5", value: data.pollutants.pm25, unit: "µg/m³" },
            { label: "PM10", value: data.pollutants.pm10, unit: "µg/m³" },
            { label: "CO", value: data.pollutants.co, unit: "ppm" },
          ].map((p) => (
            <div key={p.label} className="rounded-xl bg-slate-950/40 p-3">
              <p className="text-xs text-slate-500">{p.label}</p>
              <p className="text-xl font-bold text-white">{p.value}</p>
              <p className="text-xs text-slate-500">{p.unit}</p>
            </div>
          ))}
        </div>

        <h3 className="mb-2 text-sm font-semibold text-slate-300">3-Day Forecast</h3>
        <table className="mb-6 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500">
              <th className="py-2">Horizon</th>
              <th className="py-2">Predicted AQI</th>
              <th className="py-2">Category</th>
              <th className="py-2">Hazardous</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "+24 hours", d: data.forecast.day_1 },
              { label: "+48 hours", d: data.forecast.day_2 },
              { label: "+72 hours", d: data.forecast.day_3 },
            ].map((row) => (
              <tr key={row.label} className="border-b border-slate-800/60 text-slate-300">
                <td className="py-2">{row.label}</td>
                <td className="py-2 font-semibold text-white">{row.d.predicted_aqi.toFixed(1)}</td>
                <td className="py-2">{row.d.category}</td>
                <td className="py-2">{row.d.is_hazardous ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="mb-2 text-sm font-semibold text-slate-300">Best Model (24h horizon)</h3>
        {bestDay1 ? (
          <div className="grid grid-cols-3 gap-3 sm:w-1/2">
            <div className="rounded-xl bg-slate-950/40 p-3">
              <p className="text-xs text-slate-500">Model</p>
              <p className="text-sm font-semibold text-purple-400">{bestDay1.name}</p>
            </div>
            <div className="rounded-xl bg-slate-950/40 p-3">
              <p className="text-xs text-slate-500">RMSE</p>
              <p className="text-sm font-semibold text-white">{bestDay1.rmse.toFixed(1)}</p>
            </div>
            <div className="rounded-xl bg-slate-950/40 p-3">
              <p className="text-xs text-slate-500">R² score</p>
              <p className="text-sm font-semibold text-white">{bestDay1.r2.toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Model metrics unavailable.</p>
        )}
      </div>
    </>
  );
}