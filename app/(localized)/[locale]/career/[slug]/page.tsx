import { notFound, permanentRedirect } from "next/navigation";
import { CAREER_DATASET_FAMILY_SLUGS, normalizeFamilySlug } from "@/lib/career/datasetDirectory";
import { adaptCareerJobBundle } from "@/lib/career/adapters/adaptCareerJobBundle";
import { fetchCareerJobBundle } from "@/lib/career/api/fetchCareerJobBundle";
import { getCareerGuideFromCmsBySlug } from "@/lib/cms/career-guides";
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

  const jobPayload = await fetchCareerJobBundle({ slug, locale });
  const job = adaptCareerJobBundle({ requestedSlug: slug, locale, payload: jobPayload });
  if (job?.renderState.canIndexPage) {
    permanentRedirect(localizedPath(`/career/jobs/${job.slug}`, locale));
  }

  const guide = await getCareerGuideFromCmsBySlug(slug, locale);
  if (guide) {
    permanentRedirect(localizedPath(`/career/guides/${guide.slug}`, locale));
  }

  const familySlug = normalizeFamilySlug(slug);
  if (CAREER_DATASET_FAMILY_SLUGS.includes(familySlug)) {
    permanentRedirect(localizedPath(`/career/industries/${familySlug}`, locale));
  }

  return notFound();
}
