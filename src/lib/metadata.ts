import type { Metadata } from "next";
import { SITE } from "./site";

/**
 * Per-route metadata helper — unique title + description, canonical URL, and a
 * per-route OG image (dynamic /og route). Mandatory on every page (SEO = 6 marks
 * and a rulebook requirement).
 */
export function pageMetadata({
  title,
  description,
  path,
  ogTitle,
}: {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
}): Metadata {
  const url = path === "/" ? SITE.url : `${SITE.url}${path}`;
  const og = `/og?title=${encodeURIComponent(ogTitle ?? title)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      type: "website",
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  };
}
