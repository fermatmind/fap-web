import { NextResponse } from "next/server";
import { listCmsArticlesForLlms } from "@/lib/cms/articles";
import { listCareerGuidesFromCms } from "@/lib/cms/career-guides";
import { adaptCareerFirstWaveDiscoverabilityManifest } from "@/lib/career/adapters/adaptCareerFirstWaveDiscoverabilityManifest";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { fetchCareerFirstWaveDiscoverabilityManifest } from "@/lib/career/api/fetchCareerFirstWaveDiscoverabilityManifest";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import {
  isCareerFamilyHubDiscoverableByManifest,
  isCareerJobDetailDiscoverableByManifest,
} from "@/lib/career/launchPolicy";
import { CAREER_DATASET_FAMILY_SLUGS } from "@/lib/career/datasetDirectory";
import { listContentPages } from "@/lib/cms/content-pages";
import { buildDefaultPublicPersonalitySlug, listPersonalityProfiles } from "@/lib/cms/personality";
import { listTopics } from "@/lib/cms/topics";
import { getAllTests } from "@/lib/content";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { getSiteUrlOrThrow } from "@/lib/site";
import type { CareerFirstWaveDiscoverabilityManifestAdapter } from "@/lib/career/adapters/types";

const TOPIC_FALLBACK_SLUGS = ["mbti", "big-five", "iq-eq"];

function toCanonical(siteUrl: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

function dedupePaths(paths: string[]): string[] {
  return [...new Set(paths)].filter((path) => shouldIncludeInSitemap(path));
}

function shouldKeepCareerAuthorityRoute(item: {
  href: string;
  seoContract: { indexEligible: boolean | null; indexState: string | null };
}): boolean {
  return shouldIncludeInSitemap(item.href, {
    indexEligible: item.seoContract.indexEligible,
    indexState: item.seoContract.indexState,
  });
}

function extractCareerJobSlug(item: { identity?: { canonicalSlug?: string | null }; href?: string | null }): string | null {
  const identitySlug = String(item.identity?.canonicalSlug ?? "").trim().toLowerCase();
  if (identitySlug) {
    return identitySlug;
  }

  const href = String(item.href ?? "").trim();
  const match = href.match(/\/career\/jobs\/([^/?#]+)$/i);
  return match ? String(match[1]).trim().toLowerCase() || null : null;
}

function publishedPersonalityVariantSlugs(value: string): string[] {
  const defaultSlug = buildDefaultPublicPersonalitySlug(value);
  if (!defaultSlug) {
    return [];
  }

  if (defaultSlug.endsWith("-a")) {
    const baseSlug = defaultSlug.slice(0, -2);

    return [defaultSlug, `${baseSlug}-t`];
  }

  return [defaultSlug];
}

function listCareerFamilyPathsFromManifest(
  locale: "en" | "zh",
  manifest: CareerFirstWaveDiscoverabilityManifestAdapter | null
): string[] {
  if (!manifest) {
    return [];
  }

  return manifest.routes
    .filter(
      (route) =>
        route.routeKind === "career_family_hub" &&
        isCareerFamilyHubDiscoverableByManifest(manifest, route.canonicalSlug)
    )
    .map((route) => `/${locale}/career/family/${route.canonicalSlug}`);
}

async function listPersonalityPaths(): Promise<string[]> {
  try {
    const [enProfiles, zhProfiles] = await Promise.all([
      listPersonalityProfiles({ locale: "en", perPage: 100 }),
      listPersonalityProfiles({ locale: "zh", perPage: 100 }),
    ]);

    return dedupePaths([
      ...enProfiles.items
        .filter((item) => item.isIndexable)
        .flatMap((item) =>
          publishedPersonalityVariantSlugs(String(item.typeCode ?? item.slug ?? ""))
            .map((slug) => `/en/personality/${slug}`)
        ),
      ...zhProfiles.items
        .filter((item) => item.isIndexable)
        .flatMap((item) =>
          publishedPersonalityVariantSlugs(String(item.typeCode ?? item.slug ?? ""))
            .map((slug) => `/zh/personality/${slug}`)
        ),
    ]);
  } catch {
    // Personality coverage is CMS-authoritative; do not fall back to local MBTI data here.
  }

  return [];
}

async function listTopicPaths(): Promise<string[]> {
  try {
    const [enTopics, zhTopics] = await Promise.all([
      listTopics({ locale: "en", perPage: 100 }),
      listTopics({ locale: "zh", perPage: 100 }),
    ]);
    const slugs = new Set(
      [...enTopics.items, ...zhTopics.items]
        .map((item) => String(item.slug ?? "").trim().toLowerCase())
        .filter(Boolean)
    );

    if (slugs.size > 0) {
      return dedupePaths(
        [...slugs].flatMap((slug) => [`/en/topics/${slug}`, `/zh/topics/${slug}`])
      );
    }
  } catch {
    // Fall back to the stable public topic set when the topics CMS is unavailable.
  }

  return dedupePaths(TOPIC_FALLBACK_SLUGS.flatMap((slug) => [`/en/topics/${slug}`, `/zh/topics/${slug}`]));
}

export async function GET() {
  const siteUrl = getSiteUrlOrThrow();
  const [
    enCareerJobs,
    zhCareerJobs,
    enDiscoverabilityManifest,
    zhDiscoverabilityManifest,
    enCareerGuides,
    zhCareerGuides,
    enCareerRecommendations,
    zhCareerRecommendations,
    personalityEntries,
    topicEntries,
    enArticles,
    zhArticles,
    testList,
    enHelpPages,
    zhHelpPages,
  ] = await Promise.all([
    fetchCareerJobIndex({ locale: "en" })
      .then((payload) => adaptCareerJobIndex({ locale: "en", payload }))
      .catch(() => []),
    fetchCareerJobIndex({ locale: "zh" })
      .then((payload) => adaptCareerJobIndex({ locale: "zh", payload }))
      .catch(() => []),
    fetchCareerFirstWaveDiscoverabilityManifest({ locale: "en" })
      .then((payload) => adaptCareerFirstWaveDiscoverabilityManifest({ payload }))
      .catch(() => null),
    fetchCareerFirstWaveDiscoverabilityManifest({ locale: "zh" })
      .then((payload) => adaptCareerFirstWaveDiscoverabilityManifest({ payload }))
      .catch(() => null),
    listCareerGuidesFromCms("en").catch(() => []),
    listCareerGuidesFromCms("zh").catch(() => []),
    fetchCareerRecommendationIndex({ locale: "en" })
      .then((payload) => adaptCareerRecommendationIndex({ locale: "en", payload }))
      .catch(() => []),
    fetchCareerRecommendationIndex({ locale: "zh" })
      .then((payload) => adaptCareerRecommendationIndex({ locale: "zh", payload }))
      .catch(() => []),
    listPersonalityPaths(),
    listTopicPaths(),
    listCmsArticlesForLlms({ locale: "en" }).catch(() => []),
    listCmsArticlesForLlms({ locale: "zh" }).catch(() => []),
    getAllTests("en").catch(() => []),
    listContentPages("en", "help").catch(() => []),
    listContentPages("zh", "help").catch(() => []),
  ]);

  const enCareerFamilies = listCareerFamilyPathsFromManifest("en", enDiscoverabilityManifest);
  const zhCareerFamilies = listCareerFamilyPathsFromManifest("zh", zhDiscoverabilityManifest);

  const helpEntries = dedupePaths([
    ...enHelpPages.map((page) => `/en${page.path}`),
    ...zhHelpPages.map((page) => `/zh${page.path}`),
  ]);
  const testEntries = dedupePaths(
    testList.flatMap((test) => [`/en/tests/${test.slug}`, `/zh/tests/${test.slug}`])
  );

  const articleEntries = dedupePaths(
    [...enArticles, ...zhArticles]
      .filter((article) => article.isIndexable)
      .map((article) => article.href)
  );

  const guideEntries = dedupePaths([
    ...(enCareerGuides.filter((item) => item.isIndexable).length > 0 ? ["/en/career/guides"] : []),
    ...(zhCareerGuides.filter((item) => item.isIndexable).length > 0 ? ["/zh/career/guides"] : []),
    ...enCareerGuides.filter((item) => item.isIndexable).map((item) => item.href),
    ...zhCareerGuides.filter((item) => item.isIndexable).map((item) => item.href),
  ]);

  const careerEntries = dedupePaths([
    "/en/career",
    "/zh/career",
    "/en/career/jobs",
    "/zh/career/jobs",
    "/en/career/industries",
    "/zh/career/industries",
    "/en/career/recommendations",
    "/zh/career/recommendations",
    "/en/career/tests",
    "/zh/career/tests",
    "/en/career/tests/riasec",
    "/zh/career/tests/riasec",
    ...enCareerJobs
      .filter(
        (job) =>
          shouldKeepCareerAuthorityRoute(job) &&
          isCareerJobDetailDiscoverableByManifest(enDiscoverabilityManifest, extractCareerJobSlug(job))
      )
      .map((job) => job.href),
    ...zhCareerJobs
      .filter(
        (job) =>
          shouldKeepCareerAuthorityRoute(job) &&
          isCareerJobDetailDiscoverableByManifest(zhDiscoverabilityManifest, extractCareerJobSlug(job))
      )
      .map((job) => job.href),
    ...CAREER_DATASET_FAMILY_SLUGS.flatMap((slug) => [`/en/career/industries/${slug}`, `/zh/career/industries/${slug}`]),
    ...guideEntries,
    ...enCareerFamilies,
    ...zhCareerFamilies,
    ...enCareerRecommendations.filter(shouldKeepCareerAuthorityRoute).map((item) => item.href),
    ...zhCareerRecommendations.filter(shouldKeepCareerAuthorityRoute).map((item) => item.href),
  ]);

  const lines = [
    "# FermatMind llms.txt",
    `Site: ${siteUrl}`,
    "Languages: en, zh",
    "",
    "Primary Entries:",
    `- ${toCanonical(siteUrl, "/")}`,
    `- ${toCanonical(siteUrl, "/en")}`,
    `- ${toCanonical(siteUrl, "/zh")}`,
    `- ${toCanonical(siteUrl, "/en/personality")}`,
    `- ${toCanonical(siteUrl, "/zh/personality")}`,
    `- ${toCanonical(siteUrl, "/en/topics")}`,
    `- ${toCanonical(siteUrl, "/zh/topics")}`,
    `- ${toCanonical(siteUrl, "/en/help")}`,
    `- ${toCanonical(siteUrl, "/zh/help")}`,
    `- ${toCanonical(siteUrl, "/en/career")}`,
    `- ${toCanonical(siteUrl, "/zh/career")}`,
    `- ${toCanonical(siteUrl, "/en/career/jobs")}`,
    `- ${toCanonical(siteUrl, "/zh/career/jobs")}`,
    `- ${toCanonical(siteUrl, "/en/career/recommendations")}`,
    `- ${toCanonical(siteUrl, "/zh/career/recommendations")}`,
    "",
    "Indexable Personality:",
    ...personalityEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Indexable Topics:",
    ...topicEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Indexable Help:",
    ...helpEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Indexable Tests:",
    ...testEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Indexable Articles:",
    ...articleEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    "Career Entries:",
    ...careerEntries.map((path) => `- ${toCanonical(siteUrl, path)}`),
    "",
    `Sitemap: ${toCanonical(siteUrl, "/sitemap.xml")}`,
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
