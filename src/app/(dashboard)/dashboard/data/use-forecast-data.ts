"use client";

import { useEffect, useState } from "react";
import type { PollutantReading } from "../_components/key-pollutants";
import type { ForecastPoint } from "../_components/forecast-strip";
import { deriveStatus } from "../_components/key-pollutants";

/* ─────────────────────────────────────────────────────────
   Shape of the JSON returned by FastAPI's /predict endpoint.
   Keep this in sync with predict.py's result dict - if you
   add/change fields there, update this interface too.
   ───────────────────────────────────────────────────────── */
interface DayForecast {
  predicted_aqi: number;
  category: string;
  is_hazardous: boolean;
}

export interface ForecastResponse {
  based_on_timestamp: string;
  current_aqi: number;
  current_category: string;
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  forecast: {
    day_1: DayForecast;
    day_2: DayForecast;
    day_3: DayForecast;
  };
}

/** Turns based_on_timestamp + an offset into a real weekday label:
 * +1 day -> "Tomorrow", +2/+3 days -> actual weekday name ("Tuesday",
 * "Wednesday", etc.) computed from the real forecast date, not
 * hardcoded - so this stays correct no matter what day it's viewed. */
function dayLabelForOffset(baseTimestamp: string, offsetDays: number): string {
  if (offsetDays === 0) return "Today";
  if (offsetDays === 1) return "Tomorrow";

  const base = new Date(baseTimestamp);
  const target = new Date(base);
  target.setDate(base.getDate() + offsetDays);

  return target.toLocaleDateString(undefined, { weekday: "long" });
}

/** Fetches /predict once on mount and derives the two view-shapes
 * (pollutants list, forecast strip points) the dashboard needs.
 * Pulling this out of page.tsx keeps the page file to layout only. */
export function useForecastData() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/predict")
      .then((res) => {
        if (!res.ok) throw new Error("API returned an error");
        return res.json();
      })
      .then((json: ForecastResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const pollutants: PollutantReading[] = data
    ? [
        { label: "PM2.5", value: data.pollutants.pm25, unit: "µg/m³", status: deriveStatus("pm25", data.pollutants.pm25) },
        { label: "PM10", value: data.pollutants.pm10, unit: "µg/m³", status: deriveStatus("pm10", data.pollutants.pm10) },
        { label: "O₃", value: data.pollutants.o3, unit: "ppb", status: deriveStatus("o3", data.pollutants.o3) },
        { label: "NO₂", value: data.pollutants.no2, unit: "ppb", status: deriveStatus("no2", data.pollutants.no2) },
        { label: "SO₂", value: data.pollutants.so2, unit: "ppb", status: deriveStatus("so2", data.pollutants.so2) },
        { label: "CO", value: data.pollutants.co, unit: "ppm", status: deriveStatus("co", data.pollutants.co) },
      ]
    : [];

  const forecastPoints: ForecastPoint[] = data
    ? [
        {
          dayLabel: dayLabelForOffset(data.based_on_timestamp, 0),
          aqi: data.current_aqi,
          category: data.current_category,
          isHazardous: false,
        },
        {
          dayLabel: dayLabelForOffset(data.based_on_timestamp, 1),
          aqi: data.forecast.day_1.predicted_aqi,
          category: data.forecast.day_1.category,
          isHazardous: data.forecast.day_1.is_hazardous,
        },
        {
          dayLabel: dayLabelForOffset(data.based_on_timestamp, 2),
          aqi: data.forecast.day_2.predicted_aqi,
          category: data.forecast.day_2.category,
          isHazardous: data.forecast.day_2.is_hazardous,
        },
        {
          dayLabel: dayLabelForOffset(data.based_on_timestamp, 3),
          aqi: data.forecast.day_3.predicted_aqi,
          category: data.forecast.day_3.category,
          isHazardous: data.forecast.day_3.is_hazardous,
        },
      ]
    : [];

  return { data, error, loading, pollutants, forecastPoints };
}