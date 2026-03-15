import { notFound, permanentRedirect } from "next/navigation";
import { getCareerGuideFromCmsBySlug } from "@/lib/cms/career-guides";
import { getCareerJobFromCmsBySlug } from "@/lib/cms/career-jobs";
import { getCareerIndustryBySlug } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

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

  const guide = await getCareerGuideFromCmsBySlug(slug, locale);
  if (guide) {
    permanentRedirect(localizedPath(`/career/guides/${guide.slug}`, locale));
  }

  if (getCareerIndustryBySlug(slug, locale)) {
    permanentRedirect(localizedPath(`/career/industries/${slug}`, locale));
  }

  return notFound();
}
