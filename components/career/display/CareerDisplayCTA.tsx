import Link from "next/link";
import { buildCareerDisplayCtaHref, type CareerDisplaySurfaceViewModel } from "@/lib/career/displaySurface";
import type { AttributionParams } from "@/lib/tracking/attribution";

type CareerDisplayCTAProps = {
  surface: CareerDisplaySurfaceViewModel;
  ctaAttributionParams?: AttributionParams;
  ctaLandingPath?: string;
};

export function CareerDisplayCTA({
  surface,
  ctaAttributionParams,
  ctaLandingPath,
}: CareerDisplayCTAProps) {
  const href = ctaLandingPath
      ? buildCareerDisplayCtaHref({
          locale: surface.locale,
          landingPath: ctaLandingPath,
          subjectSlug: surface.subject.canonicalSlug,
          attributionParams: ctaAttributionParams,
        })
    : surface.cta.href;
  return (
    <section className="rounded-lg border border-slate-950 bg-slate-950 p-5 text-white" data-testid="career-display-cta">
      <h2 className="m-0 text-2xl font-semibold tracking-normal">{surface.locale === "zh" ? "下一步" : "Next step"}</h2>
      <p className="m-0 mt-3 text-sm leading-7 text-slate-200">
        {surface.locale === "zh"
          ? "用 RIASEC 先确认职业兴趣结构，再回到职业页做风险和行动判断。"
          : "Use RIASEC to check your career-interest structure before making a job-path decision."}
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
        data-entry-surface="career_job_detail"
        data-source-page-type="career_job_detail"
        data-target-action={surface.cta.targetAction}
        data-test-slug={surface.cta.testSlug}
      >
        {surface.cta.label}
      </Link>
    </section>
  );
}
