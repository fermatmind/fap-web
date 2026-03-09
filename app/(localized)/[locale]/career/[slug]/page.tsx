import { notFound, permanentRedirect } from "next/navigation";
import { getCareerJobFromCmsBySlug } from "@/lib/cms/career-jobs";
import {
  getCareerGuideBySlug,
  getCareerIndustryBySlug,
  listCareerGuideSlugs,
  listCareerIndustrySlugs,
  listCareerJobSlugs,
} from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export function generateStaticParams() {
  const slugs = new Set([
    ...listCareerJobSlugs(),
    ...listCareerGuideSlugs(),
    ...listCareerIndustrySlugs(),
  ]);

  return [...slugs].flatMap((slug) => [{ locale: "en", slug }, { locale: "zh", slug }]);
}

export default async function CareerAliasPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);

  const job = await getCareerJobFromCmsBySlug({ slug, locale });
  if (job) {
    permanentRedirect(localizedPath(`/career/jobs/${job.slug}`, locale));
  }

  if (getCareerGuideBySlug(slug, locale)) {
    permanentRedirect(localizedPath(`/career/guides/${slug}`, locale));
  }

  if (getCareerIndustryBySlug(slug, locale)) {
    permanentRedirect(localizedPath(`/career/industries/${slug}`, locale));
  }

  return notFound();
}
