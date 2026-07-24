import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import speciesFixture from "@/fixtures/species.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/dashboard", "/map", "/species", "/forecast", "/alerts", "/about"];
  const now = new Date();
  const base: MetadataRoute.Sitemap = routes.map((path) => ({
    url: path === "/" ? SITE.url : `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "daily",
    priority: path === "/" ? 1 : path === "/about" ? 0.5 : 0.8,
  }));

  const speciesRoutes: MetadataRoute.Sitemap = (
    speciesFixture as { slug: string }[]
  ).map((s) => ({
    url: `${SITE.url}/species/${s.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...base, ...speciesRoutes];
}
