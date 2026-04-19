import { getCmsLandingSurface } from "@/lib/cms/landing-surfaces";
import type { Locale } from "@/lib/i18n/locales";

export type CareerCenterPathway = {
  id: "jobs" | "industries" | "recommendations";
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  searchPlaceholder?: string;
};

export type CareerCenterContent = {
  seo: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    body: string;
  };
  pathways: CareerCenterPathway[];
  support: {
    title: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  };
};

function normalizeCareerCenterContent(value: unknown): CareerCenterContent {
  const content = value as CareerCenterContent;
  if (!content?.seo?.title || !content?.hero?.title || !Array.isArray(content?.pathways)) {
    throw new Error("Invalid CMS career center payload.");
  }

  return {
    ...content,
    pathways: content.pathways,
    support: {
      ...content.support,
      links: Array.isArray(content.support?.links) ? content.support.links : [],
    },
  };
}

export async function getCareerCenterContent(locale: Locale): Promise<CareerCenterContent> {
  const surface = await getCmsLandingSurface<CareerCenterContent>("career_home", locale);
  return normalizeCareerCenterContent(surface.payloadJson);
}
