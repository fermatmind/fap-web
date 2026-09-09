import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { CareerPageTemplate } from '@/components/career/display/CareerPageTemplate';
import { JsonLd } from '@/components/seo/JsonLd';
import { AnalyticsPageViewTracker } from '@/hooks/useAnalytics';
import { adaptCareerJobBundle } from '@/lib/career/adapters/adaptCareerJobBundle';
import type { CareerJobBundleAdapter } from '@/lib/career/adapters/types';
import { fetchCareerJobBundle } from '@/lib/career/api/fetchCareerJobBundle';
import { normalizeCareerPage, careerPageFaq } from '@/lib/career/careerPage';
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from '@/lib/career/attribution';
import { buildCareerDisplayCtaHref } from '@/lib/career/displaySurface';
import { buildCareerJobFrontendUrl, normalizeCareerBundleCanonicalPath } from '@/lib/career/urls';
import { resolveLocale } from '@/lib/i18n/getDict';
import type { Locale } from '@/lib/i18n/locales';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildFAQPageJsonLd } from '@/lib/seo/generateSchema';
import { extractAttributionParamsFromRecord } from '@/lib/tracking/attribution';

export const dynamic = 'force-dynamic';
type Params = { locale: string; slug: string };
const load = cache(async (locale: Locale, slug: string) => {
  const payload = await fetchCareerJobBundle({locale, slug, includeSeoAuthority: true});
  const job = adaptCareerJobBundle({locale, requestedSlug: slug, payload});
  if (!job || !payload) return null;
  if (job.slug !== slug) permanentRedirect(buildCareerJobFrontendUrl(locale, job.slug));
  const raw = payload as unknown as Record<string, unknown>;
  const page = normalizeCareerPage(raw.career_page, locale, job.slug);
  if (!page) throw new Error('CAREER_PAGE_CONTRACT_INVALID');
  return {job, page};
});
function isIndexableState(indexState: string | null | undefined): boolean {
  const normalized = String(indexState ?? "").trim().toLowerCase();
  return normalized === "index" || normalized === "indexable" || normalized === "indexed";
}

function robotsAllowIndex(robotsPolicy: string | null | undefined): boolean | null {
  const normalized = String(robotsPolicy ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (normalized.includes("noindex")) {
    return false;
  }

  return normalized.includes("index") ? true : null;
}

function hasPublishedIndexAuthority(job: CareerJobBundleAdapter): boolean {
  if (job.seoSurface) {
    return (
      job.seoSurface.robotsPolicyExplicit === true &&
      robotsAllowIndex(job.seoSurface.robotsPolicy) === true &&
      job.seoSurface.indexEligible === true &&
      isIndexableState(job.seoSurface.indexState)
    );
  }

  return job.seoContract.indexEligible === true && isIndexableState(job.seoContract.indexState);
}

function hasLocalCareerIndexTrust(job: CareerJobBundleAdapter): boolean {
  const trustReviewed =
    job.trustManifest?.legacyReview.reviewed === true ||
    job.trustManifest?.legacyReview.reviewerStatus === "reviewed" ||
    job.trustManifest?.legacyReview.reviewerStatus === "approved";

  return (
    job.renderState.canRenderAnswerSurface ||
    job.renderState.canRenderOutlookSurface ||
    job.renderState.canRenderFitSurface ||
    (trustReviewed && job.claimPermissions.allow_strong_claim === true)
  );
}

function hasRuntimeProjectionIndexAuthority(job: CareerJobBundleAdapter): boolean {
  const reasonCodes = new Set(job.seoContract.reasonCodes.map((item) => item.trim().toLowerCase()));
  const hasRuntimePublicationAuthority =
    reasonCodes.has("validated_display_asset_backed_release") ||
    reasonCodes.has("release_gate_pass") ||
    reasonCodes.has("runtime_published_navigation_shell");

  return (
    hasPublishedIndexAuthority(job) &&
    reasonCodes.has("runtime_publish_projection") &&
    hasRuntimePublicationAuthority
  );
}

function hasTrustedPublishedIndexAuthority(job: CareerJobBundleAdapter): boolean {
  return (
    hasPublishedIndexAuthority(job) &&
    (job.renderState.canIndexPage || hasLocalCareerIndexTrust(job) || hasRuntimeProjectionIndexAuthority(job))
  );
}


export async function generateMetadata({params}: {params: Promise<Params>}): Promise<Metadata> {
  const {locale: input, slug} = await params;
  const locale = resolveLocale(input);
  const result = await load(locale, slug);
  if (!result) return {title: 'Not Found', robots: {index: false, follow: false}};
  const {job, page} = result;
  const title = page.seo.title ?? page.content.subject.name;
  const description = page.seo.description ?? '';
  // Keep backend URL/index authority, replace every editorial field from the file.
  const seoSurface = job.seoSurface ? {...job.seoSurface, title, description,
    og: {...job.seoSurface.og, title, description},
    twitter: {...job.seoSurface.twitter, title, description}} : null;
  const allowsIndex = hasTrustedPublishedIndexAuthority(job);
  return buildPageMetadata({
    locale,
    pathname: seoSurface?.canonicalPath ?? normalizeCareerBundleCanonicalPath(locale, job.seoContract.canonicalPath, buildCareerJobFrontendUrl(locale, job.slug)),
    title, description, seoSurface,
    explicitIndexGate: {indexEligible: (seoSurface?.indexEligible ?? job.seoContract.indexEligible) === true && allowsIndex, indexState: seoSurface?.indexState || job.seoContract.indexState},
    noindex: !allowsIndex,
    alternatesByLocale: {en: buildCareerJobFrontendUrl('en', job.slug), zh: buildCareerJobFrontendUrl('zh', job.slug), xDefault: '/'},
  });
}

export default async function CareerJobDetailPage({params, searchParams}: {params: Promise<Params>; searchParams?: Promise<Record<string,string|string[]|undefined>>}) {
  const {locale: input, slug} = await params;
  const locale = resolveLocale(input);
  const result = await load(locale, slug);
  if (!result) return notFound();
  const {job, page} = result;
  const landingPath = buildCareerJobFrontendUrl(locale, job.slug);
  const attributionParams = extractAttributionParamsFromRecord(await searchParams ?? {});
  const ctaHref = buildCareerDisplayCtaHref({locale, subjectSlug: job.slug, landingPath, attributionParams});
  const faq = careerPageFaq(page);
  return <main className="min-h-screen bg-slate-50">
    <AnalyticsPageViewTracker eventName={CAREER_TRACKING_EVENTS.jobDetailView} properties={buildCareerAttributionPayload({locale, entrySurface: 'career_job_detail', sourcePageType: 'career_job_detail', targetAction: 'view_surface', landingPath, routeFamily: 'job_detail', subjectKind: 'job_slug', subjectKey: job.slug})} />
    <JsonLd id={`career-job-breadcrumb-${job.slug}`} data={{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:locale === 'zh' ? '职业' : 'Career',item:`https://fermatmind.com/${locale}/career`},{'@type':'ListItem',position:2,name:page.content.subject.name,item:`https://fermatmind.com${landingPath}`}]}} />
    {job.renderState.canRenderStructuredData && job.seoSurface?.structuredDataKeys.includes('Occupation') ? <JsonLd id={`career-job-occupation-${job.slug}`} data={{'@context': 'https://schema.org', '@type': 'Occupation', name: page.content.subject.name, ...(page.content.subject.summary ? {description: page.content.subject.summary} : {}), url: job.seoSurface.canonicalUrl}} /> : null}
    {faq.length ? <JsonLd id={`career-job-display-faq-${job.slug}`} data={buildFAQPageJsonLd(faq)} /> : null}
    <CareerPageTemplate page={page} ctaHref={ctaHref} />
  </main>;
}
