"use client";

/* ─────────────────────────────────────────────────────────
   Skeleton loader that mirrors the real dashboard layout
   (Hero + KeyPollutants, ForecastStrip, Trend + Factors,
   Pollutants + SHAP + BestModel, ModelComparisonTable) so the
   page doesn't collapse into an empty void while data loads.
   Blocks use a left-to-right shimmer sweep instead of a flat
   pulse for a more "alive" loading feel.
   ───────────────────────────────────────────────────────── */

function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-lg bg-slate-800 ${className}`} />;
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      {/* thin progress indicator + status line */}
      <div className="flex items-center gap-2 px-1 text-sm text-slate-400">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-700 border-t-purple-400" />
        Fetching live station data…
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="progress-sweep h-full w-1/3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
      </div>

      {/* Hero + Key Pollutants */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-h-80 rounded-3xl border border-white/10 bg-slate-900/50 p-8 sm:min-h-85">
          <div className="flex h-full flex-col justify-between gap-8 sm:flex-row sm:items-center">
            <div className="w-full max-w-xs space-y-3">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-16 w-32" />
              <Shimmer className="h-6 w-40" />
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-3/4" />
            </div>
            <Shimmer className="h-40 w-40 shrink-0 rounded-full" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <Shimmer className="mb-4 h-4 w-32" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Shimmer className="h-9 w-9 shrink-0 rounded-full" />
                <Shimmer className="h-4 flex-1" />
                <Shimmer className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forecast strip */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <Shimmer className="mb-4 h-4 w-28" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Trend chart + Primary factors */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <Shimmer className="mb-4 h-4 w-36" />
          <Shimmer className="h-56 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <Shimmer className="mb-1 h-4 w-32" />
          <Shimmer className="mb-4 h-3 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Shimmer className="h-4 w-24 shrink-0" />
                <Shimmer className="h-2 flex-1 rounded-full" />
                <Shimmer className="h-4 w-9 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pollutant breakdown + SHAP + Best model */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <Shimmer className="mb-1 h-4 w-40" />
          <Shimmer className="mb-5 h-3 w-32" />
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Shimmer className="h-4 w-6" />
                <Shimmer className="h-10 w-3.5 rounded-full" />
                <Shimmer className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <Shimmer className="mb-1 h-4 w-40" />
          <Shimmer className="mb-4 h-3 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Shimmer className="h-3.5 w-16 shrink-0" />
                <Shimmer className="h-2 flex-1 rounded-full" />
                <Shimmer className="h-3.5 w-8 shrink-0" />
              </div>
            ))}
          </div>
          <Shimmer className="mt-5 h-9 w-full rounded-full" />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <Shimmer className="mb-3 h-4 w-24" />
          <Shimmer className="mb-4 h-6 w-32" />
          <div className="space-y-2 border-t border-slate-800 pt-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Shimmer className="h-3.5 w-14" />
                <Shimmer className="h-3.5 w-10" />
              </div>
            ))}
          </div>
          <Shimmer className="mt-5 h-9 w-full rounded-full" />
        </div>
      </div>

      {/* Model comparison table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <Shimmer className="mb-4 h-4 w-56" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>

      <style jsx global>{`
        .skeleton-shimmer {
          position: relative;
          overflow: hidden;
        }
        .skeleton-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(148, 163, 184, 0.12) 50%,
            transparent 100%
          );
          animation: shimmer-sweep 1.6s ease-in-out infinite;
        }
        @keyframes shimmer-sweep {
          100% {
            transform: translateX(100%);
          }
        }
        .progress-sweep {
          animation: progress-slide 1.4s ease-in-out infinite;
        }
        @keyframes progress-slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}