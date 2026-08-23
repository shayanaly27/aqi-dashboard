"use client";

import Image from "next/image";
import { Info } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Hero card: full-bleed background photo (Mazar-e-Quaid at
   dusk) with dark gradient overlays on both sides so text
   stays legible over any part of the image. Current AQI +
   category on the left, glowing gauge on the right.
   ───────────────────────────────────────────────────────── */

interface HeroProps {
  aqi: number;
  category: string;
  lastUpdated: string;
}

const CATEGORY_TEXT: Record<string, string> = {
  Good: "text-emerald-400",
  Moderate: "text-amber-400",
  "Unhealthy for Sensitive Groups": "text-orange-400",
  Unhealthy: "text-red-400",
  "Very Unhealthy": "text-purple-400",
  Hazardous: "text-rose-400",
};

const CATEGORY_PILL: Record<string, string> = {
  Good: "bg-emerald-900/50 text-emerald-300",
  Moderate: "bg-amber-900/50 text-amber-300",
  "Unhealthy for Sensitive Groups": "bg-orange-900/50 text-orange-300",
  Unhealthy: "bg-red-900/50 text-red-300",
  "Very Unhealthy": "bg-purple-900/50 text-purple-300",
  Hazardous: "bg-rose-900/50 text-rose-300",
};

function categoryColor(category: string) {
  return CATEGORY_TEXT[category] ?? "text-slate-300";
}

function categoryPill(category: string) {
  return CATEGORY_PILL[category] ?? "bg-slate-800 text-slate-300";
}

function summaryLine(category: string): string {
  switch (category) {
    case "Good":
      return "Air quality is good today — a great day to be outside.";
    case "Moderate":
      return "Air quality is acceptable. Sensitive groups should consider limiting prolonged outdoor exertion.";
    case "Unhealthy for Sensitive Groups":
      return "Sensitive groups should reduce prolonged or heavy outdoor exertion today.";
    case "Unhealthy":
      return "Air quality is unhealthy — consider limiting outdoor activity today.";
    case "Very Unhealthy":
      return "Air quality is very unhealthy — avoid prolonged outdoor exposure.";
    case "Hazardous":
      return "Air quality is hazardous — stay indoors and keep windows closed.";
    default:
      return "";
  }
}

/* Glowing semicircular gauge, 0-300+ AQI scale, minor dashed
   ticks between the labeled major ticks, amber needle with a
   soft glow to match the dark, cinematic reference design. */
function Gauge({ aqi }: { aqi: number }) {
  const GAUGE_MAX = 300;
  const clamped = Math.min(Math.max(aqi, 0), GAUGE_MAX);

  const bands = [
    { color: "#22c55e", from: 0, to: 50 },
    { color: "#eab308", from: 50, to: 100 },
    { color: "#f97316", from: 100, to: 150 },
    { color: "#ef4444", from: 150, to: 200 },
    { color: "#a855f7", from: 200, to: 300 },
  ];

  const majorTicks = [0, 50, 100, 200, 300];
  const minorTicks = Array.from({ length: 13 }, (_, i) => (i * 300) / 12);

  const polarToCartesian = (value: number, radius: number) => {
    const a = (-180 + (value / GAUGE_MAX) * 180) * (Math.PI / 180);
    return { x: 120 + radius * Math.cos(a), y: 120 + radius * Math.sin(a) };
  };

  const arcPath = (from: number, to: number, radius: number) => {
    const start = polarToCartesian(from, radius);
    const end = polarToCartesian(to, radius);
    const largeArc = to - from > 150 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const needleTip = polarToCartesian(clamped, 78);
  const needleBase = polarToCartesian(clamped, -10);

  return (
    <svg viewBox="0 0 240 140" className="w-full max-w-[260px]">
      <defs>
        <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="needleGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#gaugeGlow)">
        {bands.map((b) => (
          <path
            key={b.color}
            d={arcPath(b.from, b.to, 92)}
            fill="none"
            stroke={b.color}
            strokeWidth="15"
            strokeLinecap="butt"
          />
        ))}
      </g>

      {/* minor dashed ticks */}
      {minorTicks.map((v) => {
        const inner = polarToCartesian(v, 104);
        const outer = polarToCartesian(v, 110);
        return (
          <line
            key={v}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="#64748b"
            strokeWidth="1.5"
          />
        );
      })}

      {/* major labeled ticks */}
      {majorTicks.map((v) => {
        const pos = polarToCartesian(v, 122);
        return (
          <text
            key={v}
            x={pos.x}
            y={pos.y + 4}
            textAnchor="middle"
            className="fill-slate-300"
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            {v === 300 ? "300+" : v}
          </text>
        );
      })}

      <g filter="url(#needleGlow)">
        <line
          x1={needleBase.x}
          y1={needleBase.y}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="#fbbf24"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      <circle cx="120" cy="120" r="5" fill="#fbbf24" />
    </svg>
  );
}

export default function Hero({ aqi, category, lastUpdated }: HeroProps) {
  return (
    <div className="relative isolate min-h-80 overflow-hidden rounded-3xl border border-white/10 sm:min-h-85">
      {/* full-bleed background photo */}
      <Image
        src="/images/placeholder/quiad-middle-placeholder.png"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="object-cover"
      />

      {/* dark gradient overlays for legibility on both sides */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/20 to-slate-950/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />

      <div className="relative z-10 flex h-full flex-col justify-between gap-8 p-6 sm:flex-row sm:items-center sm:p-8">
        {/* Left: identity + reading */}
        <div className="max-w-xs">
          <p className="text-sm font-medium text-slate-300">Current AQI</p>

          <p className={`mt-2 text-7xl font-bold leading-none tabular-nums ${categoryColor(category)}`}>
            {aqi}
          </p>
          <p className={`mt-2 text-2xl font-semibold ${categoryColor(category)}`}>
            {category}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {summaryLine(category)}
          </p>

          <div className="mt-5 flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
              US AQI
            </span>
            <span className="text-xs text-slate-400">Updated {lastUpdated}</span>
          </div>
        </div>

        {/* Right: gauge + echoed number + category pill */}
        <div className="flex flex-col items-center gap-1">
          <Gauge aqi={aqi} />
          <p className="-mt-8 text-4xl font-bold text-white tabular-nums">{aqi}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <span>US AQI</span>
            <Info className="h-3.5 w-3.5" strokeWidth={1.8} />
          </div>
          <span className={`mt-3 rounded-full px-4 py-1.5 text-sm font-semibold ${categoryPill(category)}`}>
            {category}
          </span>
        </div>
      </div>
    </div>
  );
}