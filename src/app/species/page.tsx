import { getSpecies, getZones } from "@/adapters";
import type { IucnStatus, PopulationTrend, Species } from "@/lib/types";
import { pageMetadata } from "@/lib/metadata";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { SpeciesCard } from "@/components/species/SpeciesCard";
import { SpeciesFilterBar } from "@/components/species/SpeciesFilterBar";
import { JsonLd, websiteLd } from "@/components/seo/JsonLd";

export const metadata = pageMetadata({
  title: "Species Explorer — Sonar",
  description:
    "Track deep-sea and reef species: population trend, IUCN status and sighting zones, from open marine biodiversity data.",
  path: "/species",
});

const IUCN_VALUES: IucnStatus[] = ["LC", "NT", "VU", "EN", "CR", "DD"];
const TREND_VALUES: PopulationTrend[] = ["increasing", "stable", "decreasing"];

type SearchParams = {
  q?: string;
  iucn?: string;
  trend?: string;
  zone?: string;
};

function filterSpecies(
  species: Species[],
  { q, iucn, trend, zone }: SearchParams,
): Species[] {
  const needle = q?.trim().toLowerCase() ?? "";
  const iucnFilter = iucn && IUCN_VALUES.includes(iucn as IucnStatus) ? (iucn as IucnStatus) : "";
  const trendFilter =
    trend && TREND_VALUES.includes(trend as PopulationTrend) ? (trend as PopulationTrend) : "";

  return species.filter((s) => {
    if (needle) {
      const haystack = `${s.commonName} ${s.scientificName}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (iucnFilter && s.iucn !== iucnFilter) return false;
    if (trendFilter && s.populationTrend !== trendFilter) return false;
    if (zone && !s.zoneIds.includes(zone)) return false;
    return true;
  });
}

export default async function SpeciesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const [species, zones] = await Promise.all([getSpecies(), getZones()]);
  const results = filterSpecies(species, sp);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <JsonLd data={websiteLd} />

      <SectionHeading
        as="h1"
        eyebrow="Biodiversity"
        title="Species Explorer"
        lede="Deep-sea and reef species we monitor across the guarded zones — population trend, IUCN conservation status and where each one is sighted, drawn from open marine biodiversity data."
      />

      <div className="mt-8">
        <SpeciesFilterBar zones={zones.map((z) => ({ id: z.id, name: z.name }))} />
      </div>

      <h2 className="sr-only">Results</h2>
      <p className="mt-6 text-sm text-text-muted" aria-live="polite">
        <span className="tabular font-medium text-text">{results.length}</span>{" "}
        {results.length === 1 ? "species" : "species"}
        {results.length !== species.length && (
          <span className="text-text-dim">
            {" "}
            of <span className="tabular">{species.length}</span>
          </span>
        )}
      </p>

      {results.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((s, i) => (
            <li key={s.id}>
              <SpeciesCard species={s} priority={i < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <EmptyState
            title="No species match these filters"
            hint="Try a different name, conservation status, trend or zone — or clear the filters to see the full list."
            action={
              <ButtonLink href="/species" variant="secondary" size="sm">
                Clear filters
              </ButtonLink>
            }
          />
        </div>
      )}
    </div>
  );
}
