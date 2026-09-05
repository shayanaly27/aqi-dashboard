"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { PollutantReading } from "../_components/key-pollutants";
import type { ForecastPoint } from "../_components/forecast-strip";
import { deriveStatus } from "../_components/key-pollutants";
import { API_BASE } from "../lib/api-config";

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
  const date = new Date(timestamp);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return FORECAST_DATE_FORMATTER.format(date);
}

// "+24h" / "+48h" / "+72h" - matches the project's own "hours ahead"
// framing, shown as a small subtitle under the calendar date.
function offsetLabelForDays(offsetDays: number): string {
  return `+${offsetDays * 24}h`;
}

interface ForecastContextValue {
  data: ForecastResponse | null;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  pollutants: PollutantReading[];
  forecastPoints: ForecastPoint[];
  lastFetchedAt: Date | null;
  refresh: () => void;
}

const ForecastContext = createContext<ForecastContextValue | null>(null);

/**
 * Fetches /predict ONCE when the app first mounts. Because this provider
 * lives in the (dashboard) layout (not inside individual pages), it
 * survives client-side navigation between /dashboard, /insights, /alerts,
 * etc. - so switching pages no longer triggers a refetch. Call refresh()
 * from a button to bypass the backend's cache and pull genuinely fresh
 * data on demand.
 */
export function ForecastProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const fetchData = useCallback((isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    // isRefresh=true passes ?refresh=true so the backend bypasses its
    // in-memory cache and pulls a genuinely fresh forecast, instead of
    // returning the same cached response the button would otherwise get.
    fetch(`${API_BASE}/predict${isRefresh ? "?refresh=true" : ""}`)
      .then((res) => {
        if (!res.ok) throw new Error("API returned an error");
        return res.json();
      })
      .then((json: ForecastResponse) => {
        setData(json);
        setLastFetchedAt(new Date());
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetchData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

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

  // Only the 3 forecast days - "Today" is intentionally omitted here
  // since the hero panel above already shows the current reading.
  const forecastPoints: ForecastPoint[] = data
    ? [
        { dayLabel: dayLabelForOffset(data.based_on_timestamp, 1), offsetLabel: offsetLabelForDays(1), aqi: data.forecast.day_1.predicted_aqi, category: data.forecast.day_1.category, isHazardous: data.forecast.day_1.is_hazardous },
        { dayLabel: dayLabelForOffset(data.based_on_timestamp, 2), offsetLabel: offsetLabelForDays(2), aqi: data.forecast.day_2.predicted_aqi, category: data.forecast.day_2.category, isHazardous: data.forecast.day_2.is_hazardous },
        { dayLabel: dayLabelForOffset(data.based_on_timestamp, 3), offsetLabel: offsetLabelForDays(3), aqi: data.forecast.day_3.predicted_aqi, category: data.forecast.day_3.category, isHazardous: data.forecast.day_3.is_hazardous },
      ]
    : [];

  return (
    <ForecastContext.Provider
      value={{ data, error, loading, refreshing, pollutants, forecastPoints, lastFetchedAt, refresh }}
    >
      {children}
    </ForecastContext.Provider>
  );
}

export function useForecast() {
  const ctx = useContext(ForecastContext);
  if (!ctx) throw new Error("useForecast must be used within a ForecastProvider");
  return ctx;
}