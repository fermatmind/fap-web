import Link from "next/link";
import type { CareerDisplaySection, CareerDisplaySurfaceViewModel } from "@/lib/career/displaySurface";
import { localizedPath } from "@/lib/i18n/locales";

type CareerDecisionActionBlockProps = {
  surface: CareerDisplaySurfaceViewModel;
  nextSteps: CareerDisplaySection | null;
  riasecFit: CareerDisplaySection | null;
  personalityFit: CareerDisplaySection | null;
  primaryCtaHref: string;
};

type RealityItem = {
  title: string;
  body?: string;
};

function buildRealityItems(nextSteps: CareerDisplaySection | null): RealityItem[] {
  const stepItems = (nextSteps?.steps ?? []).map((step) => ({
    title: step.title,
    body: step.items[0],
  }));

  if (stepItems.length > 0) {
    return stepItems.slice(0, 4);
  }

  return (nextSteps?.checks ?? []).slice(0, 4).map((check) => {
    if (typeof check === "string") {
      return { title: check };
    }

    return {
      title: check.title,
      body: check.note ?? check.question,
    };
  });
}

function firstProfileValue(section: CareerDisplaySection | null): string | null {
  return section?.profile?.find((item) => item.trim().length > 0) ?? null;
}

function firstTraitValue(section: CareerDisplaySection | null): string | null {
  return section?.traits?.find((item) => item.trim().length > 0) ?? null;
}

export function CareerDecisionActionBlock({
  surface,
  nextSteps,
  riasecFit,
  personalityFit,
  primaryCtaHref,
}: CareerDecisionActionBlockProps) {
  const locale = surface.locale;
  const isZh = locale === "zh";
  const realityItems = buildRealityItems(nextSteps);
  const interestProfile = firstProfileValue(riasecFit);
  const personalitySignal = firstTraitValue(personalityFit);

  return (
    <section
      className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-7"
      data-testid="career-decision-action-block"
    >
      <div className="max-w-3xl">
        <h2 className="m-0 text-2xl font-semibold tracking-normal text-slate-950 md:text-3xl">
          {isZh ? "下一步：用费马测试验证匹配度" : "Next: verify fit with FermatMind tests"}
        </h2>
        <p className="m-0 mt-3 text-sm leading-7 text-slate-600 md:text-base">
          {isZh
            ? "职业介绍只能告诉你这份工作是什么，测评结果可以帮助你判断自己是否适合长期承受它的工作结构。"
            : "A career page can explain what the role is; assessment results help you check whether the work structure fits you over time."}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="flex min-h-64 flex-col rounded-lg border border-slate-950 bg-slate-950 p-5 text-white">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
            {isZh ? "第一步" : "Step 1"}
          </p>
          <h3 className="m-0 mt-3 text-xl font-semibold tracking-normal">
            {isZh ? "先测职业兴趣" : "Start with career interests"}
          </h3>
          <p className="m-0 mt-3 flex-1 text-sm leading-7 text-slate-200">
            {isZh
              ? `用霍兰德 / RIASEC 看你的兴趣结构${interestProfile ? `是否接近${interestProfile}` : "是否接近这类职业需要的工作偏好"}。`
              : `Use Holland / RIASEC to check whether your interest pattern${interestProfile ? ` aligns with ${interestProfile}` : " fits this type of work"}.`}
          </p>
          <Link
            href={primaryCtaHref}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
            data-entry-surface="career_job_detail"
            data-source-page-type="career_job_detail"
            data-target-action={surface.cta.targetAction}
            data-test-slug={surface.cta.testSlug}
          >
            {surface.cta.label}
          </Link>
        </article>

        <article className="flex min-h-64 flex-col rounded-lg border border-slate-200 bg-slate-50 p-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {isZh ? "第二步" : "Step 2"}
          </p>
          <h3 className="m-0 mt-3 text-xl font-semibold tracking-normal text-slate-950">
            {isZh ? "再看工作风格" : "Then check work style"}
          </h3>
          <p className="m-0 mt-3 flex-1 text-sm leading-7 text-slate-600">
            {isZh
              ? `如果你已有 MBTI 或大五人格结果，可以补充判断${personalitySignal ? `自己是否适合${personalitySignal}` : "自己的沟通方式、压力反应和长期协作偏好"}。`
              : `If you already have MBTI or Big Five results, use them to compare ${personalitySignal ?? "communication style, stress patterns, and collaboration preferences"}.`}
          </p>
          <Link
            href={localizedPath("/career/recommendations", locale)}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
          >
            {isZh ? "查看人格与职业匹配" : "View personality-career fit"}
          </Link>
        </article>

        <article id="career-reality-checklist" className="flex min-h-64 flex-col rounded-lg border border-slate-200 bg-slate-50 p-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {isZh ? "第三步" : "Step 3"}
          </p>
          <h3 className="m-0 mt-3 text-xl font-semibold tracking-normal text-slate-950">
            {isZh ? "最后做现实验证" : "Finish with real-world validation"}
          </h3>
          <ul className="m-0 mt-3 flex-1 space-y-3 p-0">
            {realityItems.map((item) => (
              <li key={`${item.title}:${item.body ?? ""}`} className="list-none text-sm leading-6 text-slate-600">
                <span className="font-semibold text-slate-950">{item.title}</span>
                {item.body ? <span> - {item.body}</span> : null}
              </li>
            ))}
          </ul>
          <a
            href="#career-reality-checklist"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
          >
            {isZh ? "查看准备清单" : "Review preparation checklist"}
          </a>
        </article>
      </div>
    </section>
  );
}
