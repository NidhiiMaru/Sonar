import Link from "next/link";
import Image from "next/image";
import type { Species } from "@/lib/types";
import { IUCN_META, TREND_META } from "@/lib/ui-meta";
import { getImage } from "@/lib/images";
import { Sparkline } from "@/components/ui/Sparkline";
import { cn } from "@/lib/utils";

/** Shared species card — used by the /species grid and the landing preview. */
export function SpeciesCard({ species, priority = false }: { species: Species; priority?: boolean }) {
  const img = getImage(species.imageKey);
  const iucn = IUCN_META[species.iucn];
  const trend = TREND_META[species.populationTrend];
  const first = species.trendSeries[0];
  const last = species.trendSeries[species.trendSeries.length - 1];
  const delta = Math.round(((last - first) / (first || 1)) * 100);

  return (
    <Link
      href={`/species/${species.slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface transition-colors hover:border-line-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-abyss">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm",
            iucn.soft,
            iucn.border,
            iucn.text,
          )}
          title={iucn.label}
        >
          {species.iucn} · {iucn.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="font-display text-base font-semibold leading-tight text-text">
            {species.commonName}
          </h3>
          <p className="text-xs italic text-text-dim">{species.scientificName}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", trend.text)}>
            <span aria-hidden="true">{trend.arrow}</span>
            <span className="tabular">
              {delta > 0 ? "+" : ""}
              {delta}%
            </span>
            <span className="text-text-dim">pop.</span>
          </div>
          <span className={trend.text}>
            <Sparkline data={species.trendSeries} width={56} height={20} />
          </span>
        </div>
        <p className="text-xs text-text-dim">
          {species.depthRange[0]}–{species.depthRange[1]} m · {species.zoneIds.length} zones
        </p>
      </div>
    </Link>
  );
}
