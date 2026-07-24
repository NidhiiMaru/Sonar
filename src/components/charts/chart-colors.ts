import type { IncidentType } from "@/lib/types";

/** Categorical series colours (data-viz ramp).
 *  Never the severity scale — each series also carries a text legend label. */
export const TYPE_COLOR: Record<IncidentType, string> = {
  plastic: "#60A5FA",
  ghost_net: "#FB7185",
  bleaching: "#FBBF24",
  dumping: "#A78BFA",
  species_alert: "#34D399",
};

export const AXIS = "#6E86A3";
export const GRID = "#22344F";
export const TOOLTIP_BG = "#1B2A45";
