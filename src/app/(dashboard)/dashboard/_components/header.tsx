"use client";

import Image from "next/image";
import { MapPin, Search, Bell, Sun } from "lucide-react";

interface HeaderProps {
  location?: string;
  lastUpdated?: string;
  onSearch?: (query: string) => void;
  notificationCount?: number;
}

export default function Header({
  location = "Karachi, Pakistan",
  lastUpdated,
  onSearch,
  notificationCount = 0,
}: HeaderProps) {
  return (
    <div className="px-4 pt-4 ">
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-950 rounded-xl via-slate-900 to-blue-950 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Location + last updated */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <MapPin className="h-4 w-4 text-sky-300" strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold text-white">{location}</p>
            {lastUpdated && (
              <p className="text-[11px] text-slate-400">Updated: {lastUpdated}</p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="hidden flex-1 max-w-md sm:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search location..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40 focus:bg-white/10 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>
        </div>

        {/* Utility icons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-semibold text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          <button
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10"
          >
            <Sun className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
    </div>
  );
}