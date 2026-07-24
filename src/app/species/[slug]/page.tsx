import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Ruler } from "lucide-react";
import { getSpecies, getZones } from "@/adapters";
import { IUCN_LABEL } from "@/lib/types";
import { IUCN_META, TREND_META } from "@/lib/ui-meta";
import { pageMetadata } from "@/lib/metadata";
import { getImage } from "@/lib/images";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Panel, PanelBody } from "@/components/ui/Panel";
import { Sparkline } from "@/components/ui/Sparkline";
import { JsonLd } from "@/components/seo/JsonLd";
import { SpeciesDepthBar } from "@/components/species/SpeciesDepthBar";

export async function generateStaticParams() {
  const species = await getSpecies();
  return species.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const species = await getSpecies();
  const found = species.find((s) => s.slug === slug);
  if (!found) return {};
  const description = found.blurb.length > 155 ? `${found.blurb.slice(0, 152)}…` : found.blurb;
  return pageMetadata({
    title: `${found.commonName} — DeepSea Guardian`,
    description,
    path: `/species/${found.slug}`,
    ogTitle: found.commonName,
  });
}

export default async function SpeciesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [species, zones] = await Promise.all([getSpecies(), getZones()]);
  const s = species.find((sp) => sp.slug === slug);
  if (!s) notFound();

  const img = getImage(s.imageKey);
  const iucn = IUCN_META[s.iucn];
  const trend = TREND_META[s.populationTrend];
  const zoneMap = new Map(zones.map((z) => [z.id, z] as const));
  const speciesZones = s.zoneIds
    .map((id) => zoneMap.get(id))
    .filter((z): z is NonNullable<typeof z> => Boolean(z));

  const first = s.trendSeries[0];
  const last = s.trendSeries[s.trendSeries.length - 1];
  const delta = Math.round(((last - first) / (first || 1)) * 100);

  const imageLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: `${s.commonName} (${s.scientificName})`,
    description: s.blurb,
    contentUrl: `${SITE.url}${img.src}`,
    ...(img.credit ? { creditText: img.credit } : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <JsonLd data={imageLd} />

      <Link
        href="/species"
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] text-sm text-text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        All species
      </Link>

      <article className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
        {/* Image */}
        <div className="flex flex-col gap-2">
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-abyss">
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
              className="h-auto w-full object-cover"
            />
          </div>
          {img.credit && <p className="text-xs text-text-dim">{img.credit}</p>}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-3">
            <span
              className={cn(
                "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                iucn.soft,
                iucn.border,
                iucn.text,
              )}
              title={IUCN_LABEL[s.iucn]}
            >
              {s.iucn} · {iucn.label}
            </span>
            <div>
              <h1 className="font-display text-h1 font-bold text-text">{s.commonName}</h1>
              <p className="mt-1 text-lg italic text-text-muted">{s.scientificName}</p>
            </div>
          </header>

          <p className="max-w-[60ch] text-text-muted">{s.blurb}</p>

          {/* Quick facts & Depth visualizer */}
          <div className="flex flex-col gap-4">
            <Panel as="div">
              <PanelBody className="p-4">
                <SpeciesDepthBar depthRange={s.depthRange} />
              </PanelBody>
            </Panel>

            <Panel as="div">
              <PanelBody className="flex flex-col gap-1.5 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-text-dim">
                  Population trend
                </dt>
                <dd className={cn("flex items-center gap-2 text-lg font-semibold", trend.text)}>
                  <span aria-hidden="true">{trend.arrow}</span>
                  <span>{trend.label}</span>
                  <span className="tabular text-sm font-medium">
                    ({delta > 0 ? "+" : ""}
                    {delta}%)
                  </span>
                </dd>
              </PanelBody>
            </Panel>
          </div>

          {/* Trend chart */}
          <Panel as="section" aria-labelledby="trend-heading">
            <PanelBody className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-2">
                <h2 id="trend-heading" className="text-sm font-semibold text-text">
                  Population index
                </h2>
                <span className="text-xs text-text-dim">last 12 periods</span>
              </div>
              <span className={cn("block", trend.text)}>
                <Sparkline
                  data={s.trendSeries}
                  width={600}
                  height={80}
                  strokeWidth={2}
                  area
                  className="h-20 w-full"
                />
              </span>
            </PanelBody>
          </Panel>

          {/* Zones */}
          <section aria-labelledby="zones-heading" className="flex flex-col gap-3">
            <h2
              id="zones-heading"
              className="flex items-center gap-1.5 text-sm font-semibold text-text"
            >
              <MapPin size={15} aria-hidden="true" className="text-glow" />
              Sighting zones
              <span className="tabular text-text-dim">({speciesZones.length})</span>
            </h2>
            {speciesZones.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {speciesZones.map((z) => (
                  <li key={z.id}>
                    <Link
                      href={`/map?zone=${z.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-line-bright hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
                    >
                      <MapPin size={13} aria-hidden="true" className="text-text-dim" />
                      {z.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-dim">No zones recorded for this species.</p>
            )}
          </section>
        </div>
      </article>
    </div>
  );
}
