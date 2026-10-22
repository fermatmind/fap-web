import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { CAREER_TRACKING_EVENTS, type CareerAttributionPayloadInput } from "@/lib/career/attribution";
import type { Locale } from "@/lib/i18n/locales";

export function CareerRiasecExploreLink({ locale, careerName, href, subjectSlug }: {
  locale: Locale;
  careerName: string;
  href: string;
  subjectSlug: string;
}) {
  const zh = locale === "zh";
  const payload = (targetAction: string): CareerAttributionPayloadInput => ({
    locale,
    entrySurface: "career_job_detail",
    sourcePageType: "career_job_detail",
    targetAction,
    landingPath: `/${locale}/career/jobs/${subjectSlug}`,
    routeFamily: "job_detail",
    subjectKind: "job_slug",
    subjectKey: subjectSlug,
  });
  const linkClass = "inline-flex min-h-11 items-center font-medium text-[var(--fm-accent)] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";
  const steps = [
    {
      title: zh ? "还不清楚自己的兴趣" : "Still exploring your interests",
      body: zh
        ? "先分清兴趣、性格和能力各能回答什么，再选择需要的测评。兴趣不等于能力或职业资格，也可以不做测试继续探索。"
        : "See what interests, personality and ability can each tell you before choosing a test. Interests do not establish ability or qualifications. You can also continue without testing.",
      label: zh ? "选择职业测评" : "Choose a career assessment",
      path: `/${locale}/career/tests`,
      action: "choose_career_assessment",
    },
    {
      title: zh ? "已有几个候选职业" : "Have a few careers in mind",
      body: zh
        ? "把本页与另外 1—2 个职业放在一起，记录实际任务、入行要求和工作条件的差异；还不知道的信息先留作待核问题。"
        : "Compare this page with one or two other careers. Note differences in tasks, entry requirements and working conditions, and keep unknowns as questions to investigate.",
      label: zh ? "去职业库查找其他候选" : "Find other options in the career library",
      path: `/${locale}/career/jobs`,
      action: "browse_career_options",
    },
    {
      title: zh ? "准备验证这个方向" : "Ready to try this direction",
      body: zh
        ? "从本页选一项真实任务，安排一次小练习或从业者访谈。用职业规划指南写下时间、产出和反馈问题，再决定是否继续。"
        : "Choose a real task from this page for a small practice project or a conversation with someone in the field. Use the planning guides to set a date, an output and feedback questions before deciding whether to continue.",
      label: zh ? "制定下一步行动" : "Plan your next action",
      path: `/${locale}/career/guides`,
      action: "plan_career_action",
    },
  ];

  return (
    <aside className="mx-auto max-w-6xl px-[var(--fm-container-gutter)] py-8" aria-labelledby="career-next-steps-title" data-testid="career-riasec-explore-link">
      <h2 id="career-next-steps-title" className="m-0 text-xl font-semibold text-slate-950">
        {zh ? `了解${careerName}之后，下一步做什么？` : `After exploring ${careerName}, what comes next?`}
      </h2>
      <ul className="m-0 mt-4 list-none divide-y divide-slate-200 p-0">
        {steps.map((step, index) => (
          <li key={step.action} className="min-w-0 py-4">
            <h3 className="m-0 text-base font-semibold text-slate-950">{step.title}</h3>
            <p className="mb-0 mt-2 text-sm leading-7 text-slate-600">{step.body}</p>
            <div className="flex flex-wrap items-center gap-x-6">
              <TrackedCareerLink href={step.path} className={linkClass} eventName={CAREER_TRACKING_EVENTS.jobDetailCtaClick} eventPayload={payload(step.action)} data-target-action={step.action}>
                {step.label}
              </TrackedCareerLink>
              {index === 0 ? (
                <TrackedCareerLink href={href} className={linkClass} eventName={CAREER_TRACKING_EVENTS.jobDetailCtaClick} eventPayload={payload("start_riasec_test")}
                  data-entry-surface="career_job_detail" data-source-page-type="career_job_detail" data-target-action="start_riasec_test" data-test-slug="holland-career-interest-test-riasec">
                  {zh ? `霍兰德职业兴趣测试：探索${careerName}相关活动` : `Holland Code career interest test: explore ${careerName} activities`}
                </TrackedCareerLink>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
