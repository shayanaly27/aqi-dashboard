"use client";

import Sidebar from "./_components/sidebar";
import Header from "./_components/header";
import Hero from "./_components/hero";
import KeyPollutants from "./_components/key-pollutants";
import ForecastStrip from "./_components/forecast-strip";
import AqiTrendChart from "./_components/aqi-trend-chart";
import PrimaryFactors from "./_components/primary-factors";
import PollutantBreakdown from "./_components/pollutant-breakdown";
import ShapFeatureImportance from "./_components/shap-feature-importance";
import BestModel from "./_components/best-model";
import ModelComparisonTable from "./_components/model-comparison-table";
import ModelVersionHistory from "./_components/model-version-history";
import DashboardSkeleton from "./_components/dashboard-skeleton";
import { useForecastData } from "./data/use-forecast-data";

export default function DashboardPage() {
  const { data, error, loading, pollutants, forecastPoints } = useForecastData();

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />

      <div className="lg:pl-64">
        <Header
          location="Karachi, Pakistan"
          lastUpdated={data ? new Date(data.based_on_timestamp).toLocaleString() : undefined}
          notificationCount={forecastPoints.filter((p) => p.isHazardous).length}
        />

        <main className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 lg:px-4">
          {loading && <DashboardSkeleton />}

          {error && (
            <div className="rounded-2xl border border-red-900/50 bg-red-950/30 px-6 py-6 text-sm text-red-400">
              Couldn&apos;t reach the prediction API. Make sure your FastAPI server is
              running at <code>http://127.0.0.1:8000</code>.
              <div className="mt-1 text-xs opacity-70">{error}</div>
            </div>
          )}

          {data && (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
                <Hero
                  aqi={data.current_aqi}
                  category={data.current_category}
                  lastUpdated={new Date(data.based_on_timestamp).toLocaleString()}
                />
                <KeyPollutants pollutants={pollutants} />
              </div>

              <ForecastStrip points={forecastPoints} />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <AqiTrendChart />
                <PrimaryFactors />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <PollutantBreakdown pollutants={data.pollutants} />
                <ShapFeatureImportance />
                <BestModel />
              </div>

              <ModelComparisonTable />
              <ModelVersionHistory />
            </>
          )}
        </main>
      </div>
    </div>
  );
}