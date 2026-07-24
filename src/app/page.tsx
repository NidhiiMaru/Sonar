import Image from "next/image";
import { Radar, ScanSearch, ListOrdered, Send, ArrowRight } from "lucide-react";

import { getIncidents, getZones, getSpecies } from "@/adapters";
import { pageMetadata } from "@/lib/metadata";
import { dashboardKpis } from "@/lib/derive";
import { sortByRank } from "@/lib/ranking";
import { getImage } from "@/lib/images";

import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { KpiTile } from "@/components/ui/KpiTile";
import { LiveDot } from "@/components/ui/LiveDot";
import { Panel } from "@/components/ui/Panel";
import { IncidentQueueRow } from "@/components/incident/IncidentQueueRow";
import { SpeciesCard } from "@/components/species/SpeciesCard";
import { JsonLd, organizationLd, websiteLd } from "@/components/seo/JsonLd";

import { Reveal } from "@/components/ui/Reveal";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { riskToSeverity } from "@/lib/ui-meta";
import { LazyGlobe } from "@/components/three/LazyGlobe";
import { MarineSnow } from "@/components/landing/MarineSnow";
import { StatCounter } from "@/components/landing/StatCounter";

export const metadata = pageMetadata({
  title: "Sonar — AI monitoring for deep-ocean pollution & biodiversity",
  description:
    "Five blind sensor feeds, one ranked action queue. Track plastic, ghost nets, bleaching and endangered species across the deep ocean in real time.",
  path: "/",
});

const STEPS = [
  {
    icon: Radar,
    name: "Sense",
    copy: "Five feeds pour in — AUV/ROV video, sonar, satellite, IoT buoys and citizen reports.",
  },
  {
    icon: ScanSearch,
    name: "Detect",
    copy: "A simulated AI layer flags pollution, bleaching and species risk, each with a confidence score.",
  },
  {
    icon: ListOrdered,
    name: "Rank",
    copy: "Severity × confidence × ecological value orders every detection into one queue.",
  },
  {
    icon: Send,
    name: "Respond",
    copy: "Dispatch the nearest vessel and export an auditable evidence pack.",
  },
] as const;

const STAKES = [
  {
    value: 11,
    prefix: "≈",
    suffix: " Mt",
    label: "of plastic entering the ocean every year.",
    caption: "≈11 Mt/yr entering the ocean — Borrelle et al., Science 2020",
  },
  {
    value: 640,
    prefix: "≈",
    suffix: " kt",
    label: "of ghost fishing gear lost every year.",
    caption: "≈640,000 t of gear lost yearly — FAO / Global Ghost Gear Initiative",
  },
  {
    value: 14,
    prefix: "",
    suffix: "%",
    label: "of the world's coral already lost.",
    caption: "≈14% of coral lost 2009–2018 — GCRMN Status of Coral Reefs 2020",
  },
] as const;

export default async function Home() {
  const [incidents, zones, species] = await Promise.all([
    getIncidents(),
    getZones(),
    getSpecies(),
  ]);

  const kpis = dashboardKpis(incidents, zones, species).slice(0, 3);
  const topIncidents = sortByRank(incidents, zones).slice(0, 3);
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? id;
  const previewSpecies = species.slice(0, 4);
  const topZones = [...zones].sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);

  const hero = getImage("hero-main");

  return (
    <>
      {/* 1 · HERO */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        {/* Hero backdrop as a CSS background, not an <img>: background images are
            not LCP-eligible, so the LCP element is the H1 TEXT (paints at ~FCP)
            exactly as the spec requires. Preloaded so it still appears promptly. */}
        <link rel="preload" as="image" href={hero.src} />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hero.src})` }}
        />

        {/* Dark gradient overlays for legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-abyss/70 via-trench/75 to-abyss"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-abyss/85 via-abyss/40 to-transparent"
        />

        {/* Marine-snow particles (client, reduced-motion aware) */}
        <MarineSnow />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex max-w-3xl flex-col gap-6">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <LiveDot label="Live" />
              <span>
                <span className="tabular font-medium text-text">1,284</span> sensors reporting
              </span>
            </div>

            <h1 className="font-display text-display font-bold text-balance text-text">
              The deep ocean is dying in the dark.
            </h1>

            <p className="max-w-xl text-lg text-text-muted">
              Sonar turns five blind sensor feeds into one ranked, auditable
              action queue.
            </p>

            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/dashboard" variant="primary">
                Open the console
              </ButtonLink>
              <ButtonLink href="/map" variant="secondary">
                See live threats
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · THE STAKES */}
      <section className="border-t border-line bg-trench">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <SectionHeading
              eyebrow="The stakes"
              title="A crisis that outpaces the eyes watching it."
              lede="The scale is measured in megatonnes and lost ecosystems — most of it happening where no one is looking."
            />
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {STAKES.map((s, i) => (
              <Reveal key={s.caption} delay={i * 0.08}>
                <StatCounter
                  value={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  label={s.label}
                  caption={s.caption}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · HOW IT WORKS */}
      <section className="border-t border-line bg-abyss">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="Sense. Detect. Rank. Respond."
              lede="One pipeline from raw sensor noise to a dispatched vessel — every step accountable."
            />
          </Reveal>
          <ol className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal
                  as="li"
                  key={step.name}
                  delay={i * 0.07}
                  className="flex flex-col gap-4 rounded-[var(--radius-md)] border border-line bg-surface p-6 transition-colors hover:border-line-bright"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-bright bg-surface-2 text-glow">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="tabular text-sm font-semibold text-text-dim">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-h3 font-semibold text-text">{step.name}</h3>
                  <p className="text-sm text-text-muted">{step.copy}</p>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 4 · LIVE PROOF STRIP */}
      <section className="border-t border-line bg-trench">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <SectionHeading
              eyebrow="The product, not a poster"
              title="Real data, ranked right now."
              lede="Live figures and the three highest-priority detections in the console this moment."
            />
          </Reveal>

          <Reveal delay={0.08} className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {kpis.map((kpi) => (
                <KpiTile
                  key={kpi.label}
                  label={kpi.label}
                  value={kpi.value}
                  unit={kpi.unit}
                  delta={kpi.delta}
                  deltaGood={kpi.deltaGood}
                  spark={kpi.spark}
                />
              ))}
            </div>

            <Panel className="flex flex-col gap-1.5 p-3">
              <div className="mb-1 flex items-center justify-between px-1.5">
                <h3 className="text-sm font-semibold text-text">Top of the queue</h3>
                <span className="text-xs text-text-dim">ranked by priority</span>
              </div>
              {topIncidents.map((inc, i) => (
                <IncidentQueueRow
                  key={inc.id}
                  incident={inc}
                  zoneName={zoneName(inc.zoneId)}
                  rank={i + 1}
                />
              ))}
            </Panel>
          </Reveal>

          <div className="mt-8">
            <ButtonLink href="/dashboard" variant="secondary">
              Open the full console
              <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* 5 · SPECIES PREVIEW */}
      <section className="border-t border-line bg-abyss">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <SectionHeading
              eyebrow="Biodiversity"
              title="The species in the crosshairs"
              lede="Endangered life mapped to the zones under threat — each card opens its full risk profile."
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {previewSpecies.map((sp, i) => (
              <Reveal key={sp.id} delay={i * 0.06}>
                <SpeciesCard species={sp} priority={i === 0} />
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <ButtonLink href="/species" variant="secondary">
              Explore all species
              <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* 5.5 · THE GLOBE (lazy 3D) */}
      <section className="border-t border-line bg-trench">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <SectionHeading
              eyebrow="The watch"
              title="Eight zones, one turning globe."
              lede="Every guarded region, plotted by live risk score. Drag to spin it — colour and size mark severity."
            />
          </Reveal>
          <Reveal delay={0.08} className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <LazyGlobe />
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-4">
                {(["high", "medium", "low"] as const).map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <SeverityBadge level={s} />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">
                  Highest risk right now
                </span>
                <ul className="flex flex-col divide-y divide-line">
                  {topZones.map((z) => (
                    <li key={z.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="flex flex-col">
                        <span className="text-sm font-medium text-text">{z.name}</span>
                        <span className="tabular text-xs text-text-dim">{z.id}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="tabular text-sm text-text-muted">{z.riskScore}</span>
                        <SeverityBadge level={riskToSeverity(z.riskScore)} showLabel={false} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6 · CLOSING CTA */}
      <section className="border-t border-line bg-trench">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <Panel className="relative overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src={getImage("hero-rov").src}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover opacity-30"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-surface/60"
              />
            </div>
            <div className="relative flex flex-col items-start gap-6 px-6 py-14 sm:px-12 sm:py-20">
              <h2 className="max-w-2xl font-display text-h1 font-bold text-balance text-text">
                Most entries show the ocean&apos;s data. This one ranks its decisions.
              </h2>
              <ButtonLink href="/dashboard" variant="primary">
                Open the console
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
            </div>
          </Panel>
        </div>
      </section>

      <JsonLd data={organizationLd} />
      <JsonLd data={websiteLd} />
    </>
  );
}
