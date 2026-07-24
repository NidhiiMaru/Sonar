"use client";

import dynamic from "next/dynamic";
import type { Incident, Zone } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";

// Leaflet touches `window`, so it MUST be ssr:false or the build breaks.
// Skeleton reserves the exact box → no layout shift when the map mounts.
const Impl = dynamic(() => import("./ThreatMap.impl"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

export function ThreatMap(props: {
  incidents: Incident[];
  zones: Zone[];
  tracks?: [number, number][][];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  interactive?: boolean;
}) {
  return <Impl {...props} />;
}
