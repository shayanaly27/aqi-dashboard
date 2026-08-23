import { Droplets, Wind, Thermometer, Gauge, Atom, Clock, Calendar, CalendarDays, TrendingUp, LucideIcon } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Maps raw feature column names (as they appear in
   feature_importance.json, straight from SHAP) to a friendly
   display label + icon. Covers every column used in training
   (see get_feature_columns() in train_model.py) so nothing
   shows up as a raw snake_case key on the dashboard.
   ───────────────────────────────────────────────────────── */

export interface FeatureDisplay {
  label: string;
  icon: LucideIcon;
}

export const FEATURE_DISPLAY: Record<string, FeatureDisplay> = {
  pm25: { label: "PM2.5", icon: Atom },
  pm10: { label: "PM10", icon: Atom },
  o3: { label: "Ozone (O₃)", icon: Wind },
  no2: { label: "Nitrogen Dioxide (NO₂)", icon: Wind },
  so2: { label: "Sulfur Dioxide (SO₂)", icon: Wind },
  co: { label: "Carbon Monoxide (CO)", icon: Wind },

  aqi: { label: "Current AQI Level", icon: Gauge },
  humidity: { label: "Humidity", icon: Droplets },
  wind_speed: { label: "Wind Speed", icon: Wind },
  temperature: { label: "Temperature", icon: Thermometer },
  pressure: { label: "Pressure", icon: Gauge },
  pressure_lag_24h: { label: "Pressure (24h Ago)", icon: Gauge },
  pressure_change_24h: { label: "Pressure Trend", icon: TrendingUp },

  month: { label: "Seasonal Trend (Month)", icon: Calendar },
  hour: { label: "Time of Day", icon: Clock },
  day: { label: "Day of Month", icon: Calendar },
  day_of_week: { label: "Day of Week", icon: CalendarDays },

  aqi_lag_1h: { label: "AQI (1h Ago)", icon: Gauge },
  aqi_lag_3h: { label: "AQI (3h Ago)", icon: Gauge },
  aqi_lag_24h: { label: "AQI (24h Ago)", icon: Gauge },
  aqi_roll_mean_6h: { label: "6h Avg AQI", icon: Gauge },
  aqi_roll_mean_24h: { label: "24h Avg AQI", icon: Gauge },
  aqi_roll_mean_48h: { label: "48h Avg AQI", icon: Gauge },
  aqi_roll_mean_72h: { label: "72h Avg AQI", icon: Gauge },
  aqi_change_rate_1h: { label: "AQI Change Rate", icon: TrendingUp },
};

/** Falls back to a title-cased version of the raw key + a generic
 * gauge icon for any feature not explicitly mapped above, so a
 * future feature-engineering change never breaks this display. */
export function displayForFeature(feature: string): FeatureDisplay {
  if (FEATURE_DISPLAY[feature]) return FEATURE_DISPLAY[feature];
  const label = feature
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { label, icon: Gauge };
}