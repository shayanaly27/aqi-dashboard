"use client";

import { AlertTriangle, ShieldCheck, ShieldAlert, Info } from "lucide-react";
import { useForecast } from "../dashboard/data/forecast-context";
import DashboardSkeleton from "../dashboard/_components/dashboard-skeleton";

const CATEGORY_INFO: Record<
  string,
  { range: string; color: string; bg: string; border: string; guidance: string }
> = {
  Good: {
    range: "0–50",
    color: "text-emerald-400",
    bg: "bg-emerald-900/20",
    border: "border-emerald-800/50",
    guidance: "Air quality is satisfactory. No health precautions needed.",
  },
  Moderate: {
    range: "51–100",
    color: "text-amber-400",
    bg: "bg-amber-900/20",
    border: "border-amber-800/50",
    guidance: "Acceptable air quality. Unusually sensitive individuals should consider limiting prolonged outdoor exertion.",
  },
  "Unhealthy for Sensitive Groups": {
    range: "101–150",
    color: "text-orange-400",
    bg: "bg-orange-900/20",
    border: "border-orange-800/50",
    guidance: "Sensitive groups (children, elderly, those with respiratory conditions) should reduce prolonged outdoor exertion.",
  },
  Unhealthy: {
    range: "151–200",
    color: "text-red-400",
    bg: "bg-red-900/20",
    border: "border-red-800/50",
    guidance: "Everyone may begin to experience health effects. Limit prolonged outdoor exertion.",
  },
  "Very Unhealthy": {
    range: "201–300",
    color: "text-purple-400",
    bg: "bg-purple-900/20",
    border: "border-purple-800/50",
    guidance: "Health alert: everyone may experience more serious health effects. Avoid outdoor exertion.",
  },
  Hazardous: {
    range: "301+",
    color: "text-rose-400",
    bg: "bg-rose-900/20",
    border: "border-rose-800/50",
    guidance: "Health emergency. Everyone should avoid all outdoor exertion and stay indoors.",
  },
};

function infoFor(category: string) {
  return CATEGORY_INFO[category] ?? CATEGORY_INFO["Moderate"];
}

export default function AlertsPage() {
  const { data, error, loading, refreshing } = useForecast();
  const showSkeleton = loading || refreshing;

  if (showSkeleton) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/30 px-6 py-6 text-sm text-red-400">
        Couldn&apos;t reach the prediction API.
      </div>
    );
  }

  const days = [
    { label: "Today", aqi: data.current_aqi, category: data.current_category, hazardous: false },
    { label: "Tomorrow (+24h)", aqi: data.forecast.day_1.predicted_aqi, category: data.forecast.day_1.category, hazardous: data.forecast.day_1.is_hazardous },
    { label: "+48h", aqi: data.forecast.day_2.predicted_aqi, category: data.forecast.day_2.category, hazardous: data.forecast.day_2.is_hazardous },
    { label: "+72h", aqi: data.forecast.day_3.predicted_aqi, category: data.forecast.day_3.category, hazardous: data.forecast.day_3.is_hazardous },
  ];

  const anyHazardous = days.some((d) => d.hazardous);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        <p className="mt-1 text-sm text-slate-400">
          Hazardous air quality warnings based on the current forecast.
        </p>
      </div>

      {/* Overall status banner */}
      <div
        className={`flex items-center gap-4 rounded-2xl border p-5 ${
          anyHazardous
            ? "border-rose-800/60 bg-rose-950/30"
            : "border-emerald-800/60 bg-emerald-950/20"
        }`}
      >
        {anyHazardous ? (
          <ShieldAlert className="h-8 w-8 shrink-0 text-rose-400" />
        ) : (
          <ShieldCheck className="h-8 w-8 shrink-0 text-emerald-400" />
        )}
        <div>
          <p className={`text-lg font-semibold ${anyHazardous ? "text-rose-300" : "text-emerald-300"}`}>
            {anyHazardous
              ? "Hazardous air quality expected in the next 3 days"
              : "No hazardous air quality expected in the next 3 days"}
          </p>
          <p className="mt-0.5 text-sm text-slate-400">
            {anyHazardous
              ? "One or more forecasted days cross the hazardous AQI threshold (>150). See details below."
              : "Current and forecasted AQI levels remain below the hazardous threshold."}
          </p>
        </div>
      </div>

      {/* Per-day alert cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h3 className="mb-4 text-base font-semibold text-white">Forecast alert status</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {days.map((day) => {
            const info = infoFor(day.category);
            return (
              <div
                key={day.label}
                className={`rounded-xl border p-4 ${info.border} ${info.bg}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">{day.label}</span>
                  {day.hazardous && <AlertTriangle className="h-4 w-4 text-rose-400" />}
                </div>
                <p className={`mt-2 text-3xl font-bold tabular-nums ${info.color}`}>
                  {day.aqi.toFixed(0)}
                </p>
                <p className={`mt-1 text-sm font-medium ${info.color}`}>{day.category}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AQI category reference table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-400" />
          <h3 className="text-base font-semibold text-white">US AQI reference guide</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(CATEGORY_INFO).map(([category, info]) => (
            <div
              key={category}
              className={`flex flex-col gap-1 rounded-xl border p-4 sm:flex-row sm:items-center sm:gap-4 ${info.border} ${info.bg}`}
            >
              <div className="flex shrink-0 items-center gap-2 sm:w-56">
                <span className={`font-semibold ${info.color}`}>{category}</span>
                <span className="text-xs text-slate-500">({info.range})</span>
              </div>
              <p className="text-sm text-slate-400">{info.guidance}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}