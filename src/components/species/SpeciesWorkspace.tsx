"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Waves } from "lucide-react";
import type { Species, Zone } from "@/lib/types";
import { IUCN_LABEL } from "@/lib/types";
import { IUCN_META, TREND_META } from "@/lib/ui-meta";
import { getImage } from "@/lib/images";
import { cn } from "@/lib/utils";
import { SpeciesFilterBar } from "./SpeciesFilterBar";
import { SpeciesDepthBar } from "./SpeciesDepthBar";
import { Sparkline } from "@/components/ui/Sparkline";
import { Panel, PanelBody } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { InlineWorkspacePanel } from "@/components/workspace/InlineWorkspacePanel";
import { sonarAudio } from "@/lib/sonar-audio";

interface Props {
  speciesList: Species[];
  allZones: Zone[];
}

export function SpeciesWorkspace({ speciesList, allZones }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const selectedSpecies = speciesList.find((s) => s.id === selectedId) ?? null;

  const handleWidthChange = useCallback((w: number) => {
    setSidebarWidth(w);
  }, []);

  const zoneMap = new Map(allZones.map((z) => [z.id, z] as const));
  const speciesZones = selectedSpecies
    ? selectedSpecies.zoneIds
        .map((id) => zoneMap.get(id))
        .filter((z): z is NonNullable<typeof z> => Boolean(z))
    : [];

  const first = selectedSpecies ? selectedSpecies.trendSeries[0] : 0;
  const last = selectedSpecies ? selectedSpecies.trendSeries[selectedSpecies.trendSeries.length - 1] : 0;
  const delta = selectedSpecies ? Math.round(((last - first) / (first || 1)) * 100) : 0;

  const img = selectedSpecies ? getImage(selectedSpecies.imageKey) : null;
  const iucn = selectedSpecies ? IUCN_META[selectedSpecies.iucn] : null;
  const trend = selectedSpecies ? TREND_META[selectedSpecies.populationTrend] : null;

  const handleSelect = (s: Species) => {
    sonarAudio.playClickBlip();
    setSelectedId(s.id);
  };

  return (
    <div
      className="flex min-h-[calc(100vh-3.5rem)] w-auto overflow-hidden transition-[padding-right] duration-150 ease-out"
      style={{ paddingRight: sidebarWidth > 0 ? `${sidebarWidth}px` : 0 }}
    >
      {/* Left Main Section (Adjusts width dynamically as sidebar is pulled) */}
      <div className="flex-1 min-w-0 overflow-y-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full">
          <SpeciesFilterBar zones={allZones.map((z) => ({ id: z.id, name: z.name }))} />

          <h2 className="sr-only">Results</h2>
          <p className="mt-6 text-sm text-text-muted" aria-live="polite">
            <span className="tabular font-medium text-text">{speciesList.length}</span> species monitored
          </p>

          {speciesList.length > 0 ? (
            <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              {speciesList.map((s) => {
                const sImg = getImage(s.imageKey);
                const sIucn = IUCN_META[s.iucn];
                const sTrend = TREND_META[s.populationTrend];
                const active = s.id === selectedId;

                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(s)}
                      className={cn(
                        "group flex w-full flex-col overflow-hidden rounded-[var(--radius-md)] border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow",
                        active
                          ? "border-glow/60 bg-surface-2 shadow-[0_0_15px_rgba(34,211,238,0.2)] ring-1 ring-glow"
                          : "border-line bg-surface hover:border-line-bright hover:bg-surface-2",
                      )}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-abyss">
                        <Image
                          src={sImg.src}
                          alt={sImg.alt}
                          fill
                          sizes="(max-width: 640px) 100vw, 300px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span
                          className={cn(
                            "absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm",
                            sIucn.soft,
                            sIucn.border,
                            sIucn.text,
                          )}
                        >
                          {s.iucn} · {sIucn.label}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-3.5">
                        <div>
                          <h3 className="font-display text-base font-semibold leading-tight text-text group-hover:text-glow transition-colors">
                            {s.commonName}
                          </h3>
                          <p className="text-xs italic text-text-dim">{s.scientificName}</p>
                        </div>
                        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                          <div className={cn("flex items-center gap-1.5 text-xs font-medium", sTrend.text)}>
                            <span aria-hidden="true">{sTrend.arrow}</span>
                            <span className="tabular">{sTrend.label}</span>
                          </div>
                          <span className="font-mono text-[11px] text-glow group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            Inspect <ArrowUpRight size={12} />
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No species match these filters"
                hint="Try a different name, conservation status, trend or zone."
                action={
                  <ButtonLink href="/species" variant="secondary" size="sm">
                    Clear filters
                  </ButtonLink>
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Inline Workspace Side Panel (ClickUp Style Side-by-Side Flex Drawer) */}
      <InlineWorkspacePanel
        open={selectedSpecies !== null}
        onClose={() => setSelectedId(null)}
        onWidthChange={handleWidthChange}
        title={selectedSpecies?.commonName}
        idBadge={
          selectedSpecies && iucn ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                iucn.soft,
                iucn.border,
                iucn.text,
              )}
            >
              {selectedSpecies.iucn} · {iucn.label}
            </span>
          ) : null
        }
        headerActions={
          selectedSpecies ? (
            <Link
              href={`/species/${selectedSpecies.slug}`}
              className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-sm)] border border-line bg-surface px-2.5 text-xs font-medium text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
              title="Open full page view"
            >
              Full Page <ArrowUpRight size={13} />
            </Link>
          ) : null
        }
      >
        {selectedSpecies && img && iucn && trend && (
          <div className="flex flex-col gap-5 p-5">
            {/* Image Preview */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-md)] border border-line bg-abyss">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="500px"
                className="object-cover"
              />
            </div>

            <div>
              <span className="text-xs italic text-text-muted">{selectedSpecies.scientificName}</span>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">{selectedSpecies.blurb}</p>
            </div>

            {/* Visual Depth Profile Bar */}
            <Panel as="div">
              <PanelBody className="p-4">
                <SpeciesDepthBar depthRange={selectedSpecies.depthRange} />
              </PanelBody>
            </Panel>

            {/* Population Trend Sparkline */}
            <Panel as="div">
              <PanelBody className="flex flex-col gap-2.5 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold uppercase text-text-dim">
                    Population Index (12 Periods)
                  </span>
                  <span className={cn("text-xs font-semibold flex items-center gap-1", trend.text)}>
                    <span>{trend.arrow}</span>
                    <span>{trend.label}</span>
                    <span className="tabular">({delta > 0 ? "+" : ""}{delta}%)</span>
                  </span>
                </div>
                <Sparkline
                  data={selectedSpecies.trendSeries}
                  width={500}
                  height={70}
                  strokeWidth={2}
                  area
                  className="h-16 w-full"
                />
              </PanelBody>
            </Panel>

            {/* Sighting Zones */}
            <div className="flex flex-col gap-2.5">
              <span className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase text-text-dim">
                <MapPin size={14} className="text-glow" />
                Sighting Zones ({speciesZones.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {speciesZones.map((z) => (
                  <Link
                    key={z.id}
                    href={`/map?zone=${z.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-line-bright hover:text-text"
                  >
                    <MapPin size={12} className="text-text-dim" />
                    {z.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </InlineWorkspacePanel>
    </div>
  );
}
