"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  CloudSun,
  Map,
  Droplets,
  BarChart3,
  BrainCircuit,
  Bell,
  FileText,
  Settings,
  Menu,
  X,
  ChevronDown,
  Leaf,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid, disabled: false },
  { label: "Analytics", href: "/insights", icon: BarChart3, disabled: false },
  { label: "Report", href: "/reports", icon: Bell, disabled: false },
  { label: "Alerts", href: "/alerts", icon: Bell, disabled: false },
  { label: "Settings", href: "/settings", icon: Settings, disabled: false },
];

interface SidebarProps {
  userName?: string;
  userRole?: string;
}

function SidebarContent({
  userName = "Shayan Ali",
  userRole = "Analyst",
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-slate-950 px-4 py-5">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600">
          <CloudSun className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            Karachi AQI predictor
          </p>
          <p className="truncate text-xs text-slate-400">
            AI-powered air quality forecast
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon, disabled }) => {
          const active = href !== "#" && pathname?.startsWith(href);

          if (disabled) {
            return (
              <div
                key={href + label}
                title="Coming soon"
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </div>
            );
          }

          return (
            <Link
              key={href + label}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-blue-600 font-medium text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-xl bg-emerald-900/30 p-4">
        <div className="mb-1 flex items-center gap-2">
          <Leaf className="h-4 w-4 text-emerald-400" />
          <p className="text-sm font-medium text-emerald-300">
            Air quality tip
          </p>
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          Avoid outdoor activities in the morning. Air quality improves in the
          afternoon.
        </p>
      </div>

      <button
        type="button"
        className="mt-4 flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-800"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-medium text-slate-200">
          {userName
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-200">
            {userName}
          </p>
          <p className="truncate text-xs text-slate-500">{userRole}</p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
      </button>
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-950 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold text-white">
          Karachi AQI predictor
        </p>
      </div>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64 lg:border-r lg:border-slate-800">
        <SidebarContent {...props} />
      </aside>

      <div
        className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 w-72 max-w-[80vw] transform transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="relative h-full">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-300 hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent {...props} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      </div>
    </>
  );
}
