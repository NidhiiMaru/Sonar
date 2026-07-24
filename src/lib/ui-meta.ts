import type { IncidentType, IucnStatus, Severity } from "./types";

/**
 * UI metadata — colour *classes* and shapes kept out of the pure domain types.
 * Class strings are written out in full (never interpolated) so Tailwind's
 * scanner keeps them. Severity always pairs a colour with a distinct SHAPE and
 * a text label, so meaning survives greyscale.
 */

export type SeverityShape = "circle" | "triangle" | "square";

export interface SeverityMeta {
  label: string;
  shape: SeverityShape;
  text: string;
  bg: string;
  border: string;
  dot: string; // fill colour class for svg
  soft: string; // translucent bg for row/pill
}

export const SEVERITY_META: Record<Severity, SeverityMeta> = {
  low: {
    label: "Low",
    shape: "circle",
    text: "text-bio",
    bg: "bg-bio",
    border: "border-bio/40",
    dot: "fill-bio",
    soft: "bg-bio/10",
  },
  medium: {
    label: "Medium",
    shape: "triangle",
    text: "text-warn",
    bg: "bg-warn",
    border: "border-warn/40",
    dot: "fill-warn",
    soft: "bg-warn/10",
  },
  high: {
    label: "High",
    shape: "square",
    text: "text-alert",
    bg: "bg-alert",
    border: "border-alert/40",
    dot: "fill-alert",
    soft: "bg-alert/10",
  },
};

/** Map a 0..100 risk score to a severity band (shared by zones & forecast). */
export function riskToSeverity(risk: number): Severity {
  if (risk >= 67) return "high";
  if (risk >= 34) return "medium";
  return "low";
}

export const INCIDENT_TYPE_META: Record<
  IncidentType,
  { label: string; icon: string; short: string }
> = {
  plastic: { label: "Plastic debris", icon: "Trash2", short: "Plastic" },
  ghost_net: { label: "Ghost net", icon: "Waypoints", short: "Ghost net" },
  bleaching: { label: "Coral bleaching", icon: "ThermometerSun", short: "Bleaching" },
  dumping: { label: "Illegal dumping", icon: "Ban", short: "Dumping" },
  species_alert: { label: "Species alert", icon: "Fish", short: "Species" },
};

export const IUCN_META: Record<
  IucnStatus,
  { label: string; text: string; soft: string; border: string }
> = {
  LC: { label: "Least Concern", text: "text-bio", soft: "bg-bio/10", border: "border-bio/40" },
  NT: { label: "Near Threatened", text: "text-bio", soft: "bg-bio/10", border: "border-bio/40" },
  VU: { label: "Vulnerable", text: "text-warn", soft: "bg-warn/10", border: "border-warn/40" },
  EN: { label: "Endangered", text: "text-alert", soft: "bg-alert/10", border: "border-alert/40" },
  CR: { label: "Critically Endangered", text: "text-alert", soft: "bg-alert/10", border: "border-alert/40" },
  DD: { label: "Data Deficient", text: "text-text-dim", soft: "bg-surface-2", border: "border-line" },
};

export const TREND_META = {
  increasing: { label: "Increasing", text: "text-bio", arrow: "↑" },
  stable: { label: "Stable", text: "text-text-muted", arrow: "→" },
  decreasing: { label: "Decreasing", text: "text-alert", arrow: "↓" },
} as const;
