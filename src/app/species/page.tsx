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
  title: "Species Explorer — DeepSea Guardian",
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

import { SpeciesWorkspace } from "@/components/species/SpeciesWorkspace";

export default async function SpeciesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const [species, zones] = await Promise.all([getSpecies(), getZones()]);
  const results = filterSpecies(species, sp);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd data={websiteLd} />

      <SectionHeading
        as="h1"
        eyebrow="Biodiversity"
        title="Species Explorer"
        lede="Deep-sea and reef species we monitor across guarded zones — population trend, IUCN conservation status and sighting profiles."
      />

      <div className="mt-6">
        <SpeciesWorkspace speciesList={results} allZones={zones} />
      </div>
    </div>
  );
}
