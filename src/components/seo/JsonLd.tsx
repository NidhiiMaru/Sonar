import { SITE } from "@/lib/site";

/** Emits a JSON-LD script. Server component — safe, no client JS. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here (our own data, no user input)
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  sameAs: [SITE.repo],
};

export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.url}/species?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const datasetLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Sonar — deep-ocean incident & risk console",
  description:
    "Simulated deep-ocean incidents, zone risk scores and species monitoring, shaped to match open marine datasets (Argo, GBIF, Copernicus Marine, Global Fishing Watch).",
  url: `${SITE.url}/dashboard`,
  creator: { "@type": "Organization", name: SITE.name },
  license: "https://opensource.org/licenses/MIT",
  keywords: ["ocean", "biodiversity", "pollution", "ghost nets", "coral bleaching"],
};
