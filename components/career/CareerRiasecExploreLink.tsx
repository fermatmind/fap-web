import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";

export function CareerRiasecExploreLink({ locale, careerName, href }: {
  locale: Locale;
  careerName: string;
  href: string;
}) {
  return (
    <aside className="mx-auto max-w-6xl px-[var(--fm-container-gutter)] py-8" data-testid="career-riasec-explore-link">
      <h2 className="m-0 text-xl font-semibold text-slate-950">
        {locale === "zh" ? `继续探索${careerName}相关的工作兴趣` : `Explore your interest in ${careerName} work`}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {locale === "zh" ? "先整理你喜欢的工作活动，再结合本页的任务、入行条件和现实体验判断。兴趣不等于能力或职业资格。" : "Explore the work activities you enjoy, then check this career's tasks, entry requirements and your own experience. Interests do not establish ability or qualifications."}
      </p>
      <Link href={href} className="inline-flex min-h-11 items-center font-medium text-[var(--fm-accent)] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        data-entry-surface="career_job_detail" data-source-page-type="career_job_detail" data-target-action="start_riasec_test" data-test-slug="holland-career-interest-test-riasec">
        {locale === "zh" ? `霍兰德职业兴趣测试：探索${careerName}相关活动` : `Holland Code career interest test: explore ${careerName} activities`}
      </Link>
    </aside>
  );
}
