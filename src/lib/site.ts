/** Single source of truth for site-wide constants (SEO, links, sources). */

export const SITE = {
  name: "Sonar",
  shortName: "Sonar",
  tagline: "AI monitoring for deep-ocean pollution & biodiversity",
  description:
    "Five blind sensor feeds, one ranked action queue. Track plastic, ghost nets, bleaching and endangered species across the deep ocean in real time.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sonar.vercel.app",
  repo: "https://github.com/NidhiiMaru/Sonar",
  team: "Sonar Team",
  locale: "en",
} as const;

export const DATA_SOURCES = [
  { name: "Argo floats", use: "Buoy SST, pH & turbidity profiles", href: "https://argo.ucsd.edu/" },
  { name: "GBIF", use: "Species occurrence & sighting records", href: "https://www.gbif.org/" },
  { name: "Copernicus Marine", use: "SST anomaly & risk forecast grids", href: "https://marine.copernicus.eu/" },
  { name: "Global Fishing Watch", use: "Vessel traffic & response fleet", href: "https://globalfishingwatch.org/" },
  { name: "NOAA Ocean Exploration", use: "Deep-sea imagery & ROV frames", href: "https://oceanexplorer.noaa.gov/" },
] as const;
