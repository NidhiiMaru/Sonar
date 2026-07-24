"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { IUCN_LABEL, type IucnStatus } from "@/lib/types";
import { TREND_META } from "@/lib/ui-meta";
import { cn } from "@/lib/utils";

/**
 * URL-synced filter bar for the species explorer. The query string is the single
 * source of truth — every control writes to it (replace, scroll:false) and reads
 * its current value back from useSearchParams. The server page re-renders from the
 * awaited searchParams. Search is debounced; a Clear affordance resets everything.
 */

const IUCN_OPTIONS: IucnStatus[] = ["LC", "NT", "VU", "EN", "CR", "DD"];
const TREND_OPTIONS = ["increasing", "stable", "decreasing"] as const;

const selectClass =
  "h-9 w-full appearance-none rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 pr-8 text-sm text-text " +
  "transition-colors hover:border-line-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow";

export function SpeciesFilterBar({ zones }: { zones: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const iucn = searchParams.get("iucn") ?? "";
  const trend = searchParams.get("trend") ?? "";
  const zone = searchParams.get("zone") ?? "";
  const hasActive = Boolean(q || iucn || trend || zone);

  // Local, immediate state for the text input; committed to the URL on a debounce.
  const [term, setTerm] = useState(q);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync when the URL changes elsewhere (e.g. Clear / back button).
  useEffect(() => {
    setTerm(q);
  }, [q]);

  const commit = useCallback(
    (next: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const onSearch = (value: string) => {
    setTerm(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit({ q: value.trim() }), 250);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const clearAll = () => {
    if (timer.current) clearTimeout(timer.current);
    setTerm("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
          />
          <input
            type="search"
            inputMode="search"
            value={term}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by name…"
            aria-label="Search species by common or scientific name"
            className="h-9 w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 pl-9 pr-3 text-sm text-text placeholder:text-text-dim transition-colors hover:border-line-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
          />
        </div>

        {/* Selects */}
        <div className="grid grid-cols-1 gap-3 sm:flex sm:items-center">
          <label className="relative flex items-center">
            <span className="sr-only">Filter by IUCN status</span>
            <select
              value={iucn}
              onChange={(e) => commit({ iucn: e.target.value })}
              className={cn(selectClass, "sm:w-44")}
            >
              <option value="">All IUCN status</option>
              {IUCN_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s} · {IUCN_LABEL[s]}
                </option>
              ))}
            </select>
            <SlidersHorizontal
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim"
            />
          </label>

          <label className="relative flex items-center">
            <span className="sr-only">Filter by population trend</span>
            <select
              value={trend}
              onChange={(e) => commit({ trend: e.target.value })}
              className={cn(selectClass, "sm:w-40")}
            >
              <option value="">All trends</option>
              {TREND_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {TREND_META[t].label}
                </option>
              ))}
            </select>
            <SlidersHorizontal
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim"
            />
          </label>

          <label className="relative flex items-center">
            <span className="sr-only">Filter by zone</span>
            <select
              value={zone}
              onChange={(e) => commit({ zone: e.target.value })}
              className={cn(selectClass, "sm:w-40")}
            >
              <option value="">All zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
            <SlidersHorizontal
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim"
            />
          </label>
        </div>
      </div>

      {/* Active-filter state + clear */}
      {hasActive && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-dim">Filters:</span>
          {q && <FilterChip label={`“${q}”`} onClear={() => commit({ q: "" })} />}
          {iucn && (
            <FilterChip label={IUCN_LABEL[iucn as IucnStatus]} onClear={() => commit({ iucn: "" })} />
          )}
          {trend && trend in TREND_META && (
            <FilterChip
              label={TREND_META[trend as keyof typeof TREND_META].label}
              onClear={() => commit({ trend: "" })}
            />
          )}
          {zone && (
            <FilterChip
              label={zones.find((z) => z.id === zone)?.name ?? zone}
              onClear={() => commit({ zone: "" })}
            />
          )}
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium text-glow transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
          >
            <X size={13} aria-hidden="true" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 py-1 pl-2.5 pr-1.5 text-xs text-text-muted">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove ${label} filter`}
        className="rounded-full p-0.5 text-text-dim transition-colors hover:bg-surface-3 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
      >
        <X size={12} aria-hidden="true" />
      </button>
    </span>
  );
}
