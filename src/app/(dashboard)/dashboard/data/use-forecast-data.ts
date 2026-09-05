"use client";

import { useEffect, useState } from "react";
import type { PollutantReading } from "../_components/key-pollutants";
import type { ForecastPoint } from "../_components/forecast-strip";
import { deriveStatus } from "../_components/key-pollutants";
import { API_BASE } from "../lib/api-config";

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

const FORECAST_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function dayLabelForOffset(timestamp: string, offsetDays: number): string {
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(timestamp);
  const date = new Date(hasTimezone ? timestamp : `${timestamp}Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return FORECAST_DATE_FORMATTER.format(date);
}

/** Fetches /predict once on mount and derives the two view-shapes
 * (pollutants list, forecast strip points) the dashboard needs.
 * Pulling this out of page.tsx keeps the page file to layout only. */
export function useForecastData() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/predict`)
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
          dayLabel: dayLabelForOffset(data.based_on_timestamp, 1),
          offsetLabel: "24 Hours",
          aqi: data.forecast.day_1.predicted_aqi,
          category: data.forecast.day_1.category,
          isHazardous: data.forecast.day_1.is_hazardous,
        },
        {
          dayLabel: dayLabelForOffset(data.based_on_timestamp, 2),
          offsetLabel: "48 Hours",
          aqi: data.forecast.day_2.predicted_aqi,
          category: data.forecast.day_2.category,
          isHazardous: data.forecast.day_2.is_hazardous,
        },
        {
          dayLabel: dayLabelForOffset(data.based_on_timestamp, 3),
          offsetLabel: "72 Hours",
          aqi: data.forecast.day_3.predicted_aqi,
          category: data.forecast.day_3.category,
          isHazardous: data.forecast.day_3.is_hazardous,
        },
      ]
    : [];

  return { data, error, loading, pollutants, forecastPoints };
}