"use client";

import { useEffect, useState } from "react";

interface DayForecast {
  predicted_aqi: number;
  category: string;
  is_hazardous: boolean;
}

interface ForecastResponse {
  based_on_timestamp: string;
  current_aqi: number;
  current_category: string;
  forecast: {
    day_1: DayForecast;
    day_2: DayForecast;
    day_3: DayForecast;
  };
}

const categoryColor = (category: string) => {
  switch (category) {
    case "Good":
      return { bg: "#0f2e1f", text: "#4ade80", ring: "#166534" };
    case "Moderate":
      return { bg: "#2e2a0f", text: "#facc15", ring: "#854d0e" };
    case "Unhealthy for Sensitive Groups":
      return { bg: "#3a2410", text: "#fb923c", ring: "#9a3412" };
    case "Unhealthy":
      return { bg: "#3a1010", text: "#f87171", ring: "#991b1b" };
    case "Very Unhealthy":
      return { bg: "#2a1030", text: "#c084fc", ring: "#6b21a8" };
    case "Hazardous":
      return { bg: "#2a0a10", text: "#fca5a5", ring: "#7f1d1d" };
    default:
      return { bg: "#1f2937", text: "#9ca3af", ring: "#374151" };
  }
};

export default function Home() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/predict")
      .then((res) => {
        if (!res.ok) throw new Error("API returned an error");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm tracking-widest text-neutral-500 uppercase mb-2">
          Karachi · Air Quality
        </p>
        <h1 className="text-4xl font-semibold mb-10">3-Day AQI Forecast</h1>

        {loading && (
          <p className="text-neutral-400">Loading latest forecast...</p>
        )}

        {error && (
          <div className="border border-red-900 bg-red-950/40 text-red-300 rounded-lg p-4">
            Couldn&apos;t reach the prediction API. Make sure your FastAPI
            server is running at http://127.0.0.1:8000. ({error})
          </div>
        )}

        {data && (
          <>
            {/* Current AQI */}
            <div
              className="rounded-2xl p-8 mb-10 border"
              style={{
                backgroundColor: categoryColor(data.current_category).bg,
                borderColor: categoryColor(data.current_category).ring,
              }}
            >
              <p className="text-sm text-neutral-400 mb-1">Current AQI</p>
              <div className="flex items-baseline gap-4">
                <span className="text-6xl font-bold">
                  {data.current_aqi}
                </span>
                <span
                  className="text-xl font-medium"
                  style={{ color: categoryColor(data.current_category).text }}
                >
                  {data.current_category}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-3">
                Based on data from {new Date(data.based_on_timestamp).toLocaleString()}
              </p>
            </div>

            {/* Hazardous alert banner */}
            {(data.forecast.day_1.is_hazardous ||
              data.forecast.day_2.is_hazardous ||
              data.forecast.day_3.is_hazardous) && (
              <div className="border border-red-800 bg-red-950/60 text-red-200 rounded-lg p-4 mb-10">
                ⚠️ Hazardous air quality expected in the next 3 days. Consider
                limiting outdoor activity.
              </div>
            )}

            {/* 3-day forecast grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Day 1", data: data.forecast.day_1 },
                { label: "Day 2", data: data.forecast.day_2 },
                { label: "Day 3", data: data.forecast.day_3 },
              ].map(({ label, data: day }) => {
                const colors = categoryColor(day.category);
                return (
                  <div
                    key={label}
                    className="rounded-xl p-6 border"
                    style={{ backgroundColor: colors.bg, borderColor: colors.ring }}
                  >
                    <p className="text-sm text-neutral-400 mb-2">{label}</p>
                    <p className="text-3xl font-bold mb-1">
                      {day.predicted_aqi}
                    </p>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>
                      {day.category}
                    </p>
                    {day.is_hazardous && (
                      <p className="text-xs text-red-400 mt-2">⚠️ Hazardous</p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}