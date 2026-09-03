"use client";

import Sidebar from "./dashboard/_components/sidebar";
import Header from "./dashboard/_components/header";
import { ForecastProvider, useForecast } from "./dashboard/data/forecast-context";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { lastFetchedAt, refresh, refreshing } = useForecast();

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="lg:pl-64">
        <Header
          location="Karachi, Pakistan"
          lastUpdated={lastFetchedAt ? lastFetchedAt.toLocaleString() : undefined}
          onRefresh={refresh}
          refreshing={refreshing}
        />
        <main className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 lg:px-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ForecastProvider>
      <LayoutInner>{children}</LayoutInner>
    </ForecastProvider>
  );
}