import { getCmsLandingSurfaceWithLastKnownGood } from "@/lib/cms/landing-surfaces";
import type { CmsMediaAuthorityMetadata } from "@/lib/cms/media";
import type { Locale } from "@/lib/i18n/locales";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";

export type HomeLinkItem = {
  key?: string;
  title: string;
  description?: string;
  href: string;
  label?: string;
  meta?: string;
  media?: CmsMediaAuthorityMetadata;
};

export type HomeFamily = {
  title: string;
  description: string;
  exploreLabel: string;
  exploreHref: string;
  links: HomeLinkItem[];
};

export type HomeResultPreview = {
  title: string;
  metrics: string[];
  tone: "traits" | "career" | "state";
};

export type HomeTrustItem = {
  title: string;
  summary: string;
  paragraphs: string[];
  href?: string;
  hrefLabel?: string;
};

export type HomeFooterGroup = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

export type HomeSecondaryLink = {
  title: string;
  description: string;
  href: string;
};

export type HomePageContent = {
  hero: {
    eyebrow: string;
    brand: string;
    title: string;
    subhead: string;
    body: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
    tertiaryCta: string;
    tertiaryHref: string;
    trustRail: string[];
  };
  quickStart: {
    kicker: string;
    title: string;
    body: string;
    items: HomeLinkItem[];
  };
  families: {
    kicker: string;
    title: string;
    body: string;
    items: HomeFamily[];
  };
  results: {
    kicker: string;
    title: string;
    body: string;
    exampleLabel: string;
    exampleHref: string;
    previews: HomeResultPreview[];
  };
  trust: {
    kicker: string;
    title: string;
    body: string;
    methodHref: string;
    methodLabel: string;
    items: HomeTrustItem[];
  };
  secondaryExplore: {
    kicker: string;
    title: string;
    items: HomeSecondaryLink[];
  };
  header: {
    testsLabel: string;
    testsTitle: string;
    testsBody: string;
    browseAllLabel: string;
    browseAllHref: string;
    groups: Array<{ title: string; links: HomeLinkItem[] }>;
  };
  footer: {
    groups: HomeFooterGroup[];
    supportEmailLabel: string;
    tailnote: string;
  };
  seo: {
    title: string;
    description: string;
    quickStartListTitle: string;
    quickStartListDescription: string;
    familyListTitle: string;
    familyListDescription: string;
    organizationDescription: string;
  };
};

function normalizeHomeContent(value: unknown): HomePageContent {
  const content = value as HomePageContent;
  if (!content?.hero?.title || !content?.seo?.title || !Array.isArray(content?.families?.items)) {
    throw new Error("Invalid CMS homepage payload.");
  }

  return {
    ...content,
    quickStart: {
      ...content.quickStart,
      items: filterVisiblePublicTestEntries(Array.isArray(content.quickStart.items) ? content.quickStart.items : []),
    },
    families: {
      ...content.families,
      items: content.families.items.map((family) => ({
        ...family,
        links: filterVisiblePublicTestEntries(family.links ?? []),
      })),
    },
    header: {
      ...content.header,
      groups: (content.header.groups ?? []).map((group) => ({
        ...group,
        links: filterVisiblePublicTestEntries(group.links ?? []),
      })),
    },
    footer: {
      ...content.footer,
      groups: content.footer.groups ?? [],
    },
  };
}

export async function getHomePageContent(locale: Locale): Promise<HomePageContent> {
  const surface = await getCmsLandingSurfaceWithLastKnownGood<HomePageContent>("home", locale);
  return normalizeHomeContent(surface.value.payloadJson);
}
