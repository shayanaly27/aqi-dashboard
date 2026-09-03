"use client";

import { useState } from "react";
import { Bell, Gauge, Info, ExternalLink } from "lucide-react";
import { useForecast } from "../dashboard/data/forecast-context";
import { FaGithub } from "react-icons/fa6";


export default function SettingsPage() {
  const { lastFetchedAt, refresh, refreshing } = useForecast();
  const [hazardAlerts, setHazardAlerts] = useState(true);
  const [units, setUnits] = useState<"us" | "metric">("us");

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Preferences and information about the Karachi AQI Predictor system.
        </p>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Notifications</h3>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-slate-950/40 p-4">
          <div>
            <p className="text-sm font-medium text-slate-200">Hazardous AQI alerts</p>
            <p className="text-xs text-slate-500">Show a badge when a forecast crosses the hazardous threshold.</p>
          </div>
          <button
            onClick={() => setHazardAlerts((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${hazardAlerts ? "bg-blue-600" : "bg-slate-700"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${hazardAlerts ? "left-5" : "left-0.5"}`}
            />
          </button>
        </div>
      </div>

      {/* Display units */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Gauge className="h-4 w-4 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Display</h3>
        </div>
        <div className="rounded-xl bg-slate-950/40 p-4">
          <p className="mb-3 text-sm font-medium text-slate-200">AQI standard</p>
          <div className="flex gap-2">
            <button
              onClick={() => setUnits("us")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                units === "us" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              US AQI
            </button>
            <button
              onClick={() => setUnits("metric")}
              disabled
              title="Coming soon"
              className="cursor-not-allowed rounded-full bg-slate-800/50 px-4 py-1.5 text-sm font-medium text-slate-600"
            >
              Metric (µg/m³ only)
            </button>
          </div>
        </div>
      </div>

      {/* Data sync */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Data</h3>
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-200">Last synced</p>
            <p className="text-xs text-slate-500">
              {lastFetchedAt ? lastFetchedAt.toLocaleString() : "Not yet fetched"}
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="rounded-full border border-slate-700 px-4 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
          >
            {refreshing ? "Syncing…" : "Sync now"}
          </button>
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400" />
          <h3 className="text-base font-semibold text-white">About this project</h3>
        </div>
        <div className="space-y-3 rounded-xl bg-slate-950/40 p-4 text-sm text-slate-400">
          <p>
            Karachi AQI Predictor is a serverless, end-to-end machine learning system that
            forecasts Air Quality Index 24, 48, and 72 hours ahead, built on a Hopsworks
            Feature Store and Model Registry with automated hourly/daily pipelines.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="https://github.com/shayanaly27/aqi-predictor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-400 hover:underline"
            >
              <FaGithub className="h-3.5 w-3.5" /> Backend repo <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://github.com/shayanaly27/aqi-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-400 hover:underline"
            >
              <FaGithub className="h-3.5 w-3.5" /> Dashboard repo <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}