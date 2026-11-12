import Link from "next/link";
import type { ComponentProps } from "react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { buildCareerDisplayCtaAttribution } from "@/lib/career/displaySurface";
import { CAREER_TRACKING_EVENTS } from "@/lib/career/attribution";
import { extractAttributionParamsFromSearchParams } from "@/lib/tracking/attribution";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export function CareerJobAssessmentLink({ href, ...props }: Props) {
  const url = new URL(href, "https://fermatmind.com");
  const testSlug = "holland-career-interest-test-riasec";
  const locale = url.pathname.startsWith("/zh/") ? "zh" : "en";
  if (url.origin !== "https://fermatmind.com" || !/^\/(zh|en)\/tests\/holland-career-interest-test-riasec$/.test(url.pathname)
    || url.searchParams.get("entry_surface") !== "career_job_detail") {
    return <Link href={href} {...props} />;
  }

  return (
    <TrackedEntryCtaLink href={url.pathname} {...props} eventName={CAREER_TRACKING_EVENTS.jobDetailCtaClick}
      eventProperties={{
        ...extractAttributionParamsFromSearchParams(url.searchParams),
        ...buildCareerDisplayCtaAttribution({
          locale,
          subjectSlug: url.searchParams.get("subject_key") ?? undefined,
          landingPath: url.searchParams.get("landing_path") ?? `/${locale}/career`,
        }),
        test_slug: testSlug,
      }}
    />
  );
}
