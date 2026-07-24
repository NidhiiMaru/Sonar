"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import type { Zone } from "@/lib/types";
import { INCIDENT_TYPE_META } from "@/lib/ui-meta";
import { cn } from "@/lib/utils";

const SEVERITIES = [
  { v: "high", label: "High" },
  { v: "medium", label: "Medium" },
  { v: "low", label: "Low" },
];
const WINDOWS = [
  { v: "1", label: "24h" },
  { v: "7", label: "7 days" },
  { v: "14", label: "14 days" },
  { v: "all", label: "All" },
];

const selectClass =
  "h-9 rounded-[var(--radius-sm)] border border-line bg-surface-2 px-2.5 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow";

export function MapFilterBar({ zones }: { zones: Zone[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (!value || value === "all") next.delete(key);
      else next.set(key, value);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const severity = params.get("severity") ?? "all";
  const type = params.get("type") ?? "all";
  const zone = params.get("zone") ?? "all";
  const win = params.get("window") ?? "all";
  const anyActive = severity !== "all" || type !== "all" || zone !== "all" || win !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-line bg-surface p-2.5">
      <span className="flex items-center gap-1.5 pl-1 pr-1 text-xs font-medium uppercase tracking-wide text-text-dim">
        <Filter size={13} /> Filter
      </span>

      {/* severity segmented (colour + label, never colour alone) */}
      <div className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-line bg-surface-2 p-0.5">
        {SEVERITIES.map((s) => (
          <button
            key={s.v}
            onClick={() => setParam("severity", severity === s.v ? "all" : s.v)}
            aria-pressed={severity === s.v}
            className={cn(
              "rounded-[4px] px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow",
              severity === s.v ? "bg-surface-3 text-text" : "text-text-muted hover:text-text",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <select
        aria-label="Incident type"
        className={selectClass}
        value={type}
        onChange={(e) => setParam("type", e.target.value)}
      >
        <option value="all">All types</option>
        {Object.entries(INCIDENT_TYPE_META).map(([v, m]) => (
          <option key={v} value={v}>
            {m.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Zone"
        className={selectClass}
        value={zone}
        onChange={(e) => setParam("zone", e.target.value)}
      >
        <option value="all">All zones</option>
        {zones.map((z) => (
          <option key={z.id} value={z.id}>
            {z.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Time window"
        className={selectClass}
        value={win}
        onChange={(e) => setParam("window", e.target.value)}
      >
        {WINDOWS.map((w) => (
          <option key={w.v} value={w.v}>
            {w.label}
          </option>
        ))}
      </select>

      {anyActive && (
        <button
          onClick={() => router.replace(pathname, { scroll: false })}
          className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
        >
          <X size={13} /> Clear
        </button>
      )}
    </div>
  );
}
