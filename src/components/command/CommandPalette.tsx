"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, CornerDownLeft, MapPin, Fish, LayoutDashboard, Waves, TrendingUp, Bell, Info, ArrowRight } from "lucide-react";
import speciesFixture from "@/fixtures/species.json";
import zonesFixture from "@/fixtures/zones.json";
import { cn } from "@/lib/utils";

interface Item {
  group: "Navigate" | "Species" | "Zones";
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  keywords: string;
}

const NAV: Item[] = [
  { group: "Navigate", label: "Console", sublabel: "Operating picture", href: "/dashboard", icon: LayoutDashboard, keywords: "dashboard console kpi" },
  { group: "Navigate", label: "Live threat map", sublabel: "Incidents by severity & zone", href: "/map", icon: MapPin, keywords: "map threats incidents" },
  { group: "Navigate", label: "Species explorer", sublabel: "Biodiversity", href: "/species", icon: Fish, keywords: "species biodiversity iucn" },
  { group: "Navigate", label: "Risk forecast", sublabel: "7 / 30-day prediction", href: "/forecast", icon: TrendingUp, keywords: "forecast prediction risk" },
  { group: "Navigate", label: "Alerts & dispatch", sublabel: "Triage queue", href: "/alerts", icon: Bell, keywords: "alerts dispatch triage" },
  { group: "Navigate", label: "Method & data", sublabel: "What's real, what's simulated", href: "/about", icon: Info, keywords: "about method data honesty" },
];

const SPECIES: Item[] = (speciesFixture as { commonName: string; scientificName: string; slug: string; iucn: string }[]).map((s) => ({
  group: "Species",
  label: s.commonName,
  sublabel: `${s.scientificName} · ${s.iucn}`,
  href: `/species/${s.slug}`,
  icon: Fish,
  keywords: `${s.commonName} ${s.scientificName} ${s.iucn}`.toLowerCase(),
}));

const ZONES: Item[] = (zonesFixture as { id: string; name: string; riskScore: number }[]).map((z) => ({
  group: "Zones",
  label: z.name,
  sublabel: `${z.id} · risk ${z.riskScore}`,
  href: `/forecast?zone=${z.id}`,
  icon: Waves,
  keywords: `${z.name} ${z.id} zone risk`.toLowerCase(),
}));

const ALL = [...NAV, ...SPECIES, ...ZONES];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return ALL;
    return ALL.filter((i) => i.label.toLowerCase().includes(term) || i.keywords.includes(term));
  }, [q]);

  useEffect(() => setActive(0), [q]);

  function go(item: Item) {
    setOpen(false);
    setQ("");
    router.push(item.href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let idx = -1;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-[var(--radius-sm)] border border-line bg-surface-2 px-2.5 py-1.5 text-xs text-text-dim hover:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow sm:inline-flex"
        aria-label="Open command palette"
      >
        <Search size={13} />
        <span>Search</span>
        <kbd className="ml-1 rounded border border-line bg-abyss px-1 font-sans text-[10px] text-text-dim">⌘K</kbd>
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-abyss/70 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed left-1/2 top-[12vh] z-[60] w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden rounded-[var(--radius-lg)] border border-line-bright bg-surface shadow-[0_24px_48px_-12px_rgb(0_0_0/0.7)]"
            aria-label="Command palette"
          >
            <Dialog.Title className="sr-only">Search DeepSea Guardian</Dialog.Title>
            <div className="flex items-center gap-2 border-b border-line px-4">
              <Search size={16} className="text-text-dim" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Jump to a route, species or zone…"
                className="h-12 flex-1 bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
                aria-label="Search"
              />
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-text-dim">No matches for “{q}”.</p>
              )}
              {(["Navigate", "Species", "Zones"] as const).map((group) => {
                const items = results.filter((r) => r.group === group);
                if (!items.length) return null;
                return (
                  <div key={group} className="mb-1">
                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-dim">{group}</p>
                    {items.map((item) => {
                      idx++;
                      const isActive = idx === active;
                      const Icon = item.icon;
                      const myIdx = idx;
                      return (
                        <button
                          key={item.href}
                          data-active={isActive}
                          onMouseEnter={() => setActive(myIdx)}
                          onClick={() => go(item)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-2.5 py-2 text-left",
                            isActive ? "bg-surface-3" : "hover:bg-surface-2",
                          )}
                        >
                          <Icon size={15} className={isActive ? "text-glow" : "text-text-dim"} />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm text-text">{item.label}</span>
                            {item.sublabel && <span className="truncate text-xs text-text-dim">{item.sublabel}</span>}
                          </span>
                          {isActive ? (
                            <CornerDownLeft size={13} className="text-text-dim" />
                          ) : (
                            <ArrowRight size={13} className="text-text-dim opacity-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
