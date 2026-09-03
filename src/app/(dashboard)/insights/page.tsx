import Image from "next/image";

const PLOTS = [
  {
    src: "/images/eda/01_aqi_distribution.png",
    title: "AQI Distribution",
    desc: "Distribution of AQI values and outlier check across the full historical dataset.",
  },
  {
    src: "/images/eda/02_aqi_trend_full_history.png",
    title: "Historical AQI Trend",
    desc: "Daily average AQI for Karachi across the full 3.5-year training window.",
  },
  {
    src: "/images/eda/03_aqi_trend_last_90_days.png",
    title: "Recent AQI Trend",
    desc: "Daily average AQI over the last 90 days.",
  },
  {
    src: "/images/eda/04_seasonality_hour_month.png",
    title: "Seasonality",
    desc: "Average AQI by hour of day and by month, showing diurnal and seasonal patterns.",
  },
  {
    src: "/images/eda/05_correlation_heatmap.png",
    title: "Feature Correlation",
    desc: "Correlation heatmap across AQI, pollutants, and weather features.",
  },
  {
    src: "/images/eda/07_archive_vs_live_distributions.png",
    title: "Archive vs. Live Distributions",
    desc: "Train/serving skew check between backfilled historical data and the live hourly pipeline.",
  },
];

export default function InsightsPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-white">Data Insights</h1>
        <p className="mt-1 text-sm text-slate-400">
          Exploratory data analysis behind the AQI forecasting model — temporal patterns,
          pollutant correlations, and data-quality checks performed before training.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {PLOTS.map((plot) => (
          <div
            key={plot.src}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <h3 className="text-base font-semibold text-white">{plot.title}</h3>
            <p className="mb-4 text-sm text-slate-400">{plot.desc}</p>
            <div className="overflow-hidden rounded-xl bg-white">
              <Image
                src={plot.src}
                alt={plot.title}
                width={1200}
                height={500}
                className="h-auto w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}