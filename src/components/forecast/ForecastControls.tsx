"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Horizon } from "./forecast-utils";

interface ZoneOption {
  id: string;
  name: string;
  riskScore: number;
}

/**
 * URL-driven forecast controls: a zone <select> and a 7 / 30-day segmented
 * toggle. Both write to the query string (?zone=&horizon=) with a scroll-free
 * replace so the server component re-renders without losing the reader's place.
 */
export function ForecastControls({
  zones,
  horizon,
  activeZone,
}: {
  zones: ZoneOption[];
  horizon: Horizon;
  activeZone: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function push(next: { zone?: string; horizon?: Horizon }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.zone !== undefined) params.set("zone", next.zone);
    if (next.horizon !== undefined) params.set("horizon", String(next.horizon));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="forecast-zone"
          className="text-xs font-medium uppercase tracking-wide text-text-muted"
        >
          Zone
        </label>
        <select
          id="forecast-zone"
          value={activeZone}
          onChange={(e) => push({ zone: e.target.value })}
          className={cn(
            "h-10 min-w-[13rem] rounded-[var(--radius-sm)] border border-line-bright bg-surface-2 px-3 text-sm text-text",
            "transition-colors hover:bg-surface-3",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-trench",
          )}
        >
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name} ({z.id}) — risk {z.riskScore}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span
          id="forecast-horizon-label"
          className="text-xs font-medium uppercase tracking-wide text-text-muted"
        >
          Horizon
        </span>
        <div
          role="group"
          aria-labelledby="forecast-horizon-label"
          className="inline-flex h-10 items-center rounded-[var(--radius-sm)] border border-line-bright bg-surface-2 p-1"
        >
          {([7, 30] as const).map((h) => {
            const active = horizon === h;
            return (
              <button
                key={h}
                type="button"
                aria-pressed={active}
                onClick={() => push({ horizon: h })}
                className={cn(
                  "tabular h-full rounded-[var(--radius-sm)] px-4 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-trench",
                  active
                    ? "bg-glow text-abyss"
                    : "text-text-muted hover:bg-surface-3 hover:text-text",
                )}
              >
                {h}-day
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
