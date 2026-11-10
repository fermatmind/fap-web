import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { DESIGN_COMPARE_HREF, DESIGN_COMPARE_LABEL } from "@/lib/career/designComparePilot";
import {
  CAREER_EXPLORATION_PILOT,
  CAREER_INTEREST_DATA,
  CAREER_INTEREST_SOURCE,
  careerExplorationPilotPath,
  type CareerExplorationPilot as Pilot,
} from "@/lib/career/explorationPilot";
import type { Locale } from "@/lib/i18n/locales";

export function CareerExplorationPilot({ pilot, locale }: { pilot: Pilot; locale: Locale }) {
  const zh = locale === "zh";
  const { copy, occupations } = CAREER_EXPLORATION_PILOT[pilot];
  const otherInterest = pilot === "ari" ? "ac" : "ari";
  const showCompare = zh && pilot !== "ac";
  const id = pilot === "intj" ? "design-mbti-exploration" : "career-interest-evidence";

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 space-y-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 id={`${id}-title`} className="m-0 text-xl font-semibold text-slate-950">
        {zh ? "看两种工作的真实任务" : "Compare the work people actually do"}
      </h2>
      <p className="m-0 leading-7 text-slate-700">{copy[locale].evidence}</p>
      <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
        {occupations.map((job) => (
          <li key={job.slug} className="min-w-0 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="m-0 font-semibold">
              <Link className="text-[var(--fm-accent)] underline underline-offset-4" href={`/${locale}/career/jobs/${job.slug}`}>{job.name[locale]}</Link>
            </h3>
            <p className="m-0 text-sm leading-6 text-slate-700">{job.task[locale]}</p>
            <p className="m-0 text-sm leading-6 text-slate-600">
              <a className="underline underline-offset-4" href={`https://www.onetonline.org/link/summary/${job.soc}`}>O*NET {job.soc}</a>
              {pilot !== "intj" && ` · ${job.interest} · ${zh ? "美国职业" : "U.S. occupation"}`}
            </p>
          </li>
        ))}
      </ul>
      {pilot !== "intj" && (
        <p className="m-0 text-sm leading-6 text-slate-600">
          {zh ? "兴趣分类来源" : "Interest classification source"}{" "}
          <a className="underline underline-offset-4" href={CAREER_INTEREST_SOURCE}>O*NET 31.0 · Career Interest Types</a>
          {" · "}
          <a className="underline underline-offset-4" href={CAREER_INTEREST_DATA}>{zh ? "原始表" : "Source table"}</a>
          {" · "}
          {zh ? "职业的兴趣代码用于描述活动，不等于你的能力或录用机会。" : "Occupational interest codes describe work activities. They do not establish your ability or hiring prospects."}
        </p>
      )}
      <div className="space-y-3 border-t border-slate-200 pt-4">
        <h3 className="m-0 font-semibold">{zh ? "15 分钟小试做" : "A 15-minute task to try"}</h3>
        <p className="m-0 leading-7 text-slate-700">{copy[locale].exercise}</p>
        <div className="flex flex-wrap gap-3">
          {showCompare && (
            <Link href={DESIGN_COMPARE_HREF} className={buttonVariants({ variant: "outline", className: "h-auto min-h-11 whitespace-normal text-center" })}>
              {DESIGN_COMPARE_LABEL}
            </Link>
          )}
          <Link href={`/${locale}/holland-test/pdf-download#my-worksheet`} className={buttonVariants({ variant: "outline", className: "h-auto min-h-11 whitespace-normal text-center" })}>
            {zh ? "填写免费职业探索记录" : "Use the free exploration worksheet"}
          </Link>
        </div>
      </div>
      <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 p-0 pt-4 text-sm text-[var(--fm-accent)]">
        <li><Link className="underline underline-offset-4" href={`/${locale}/tests/holland-career-interest-test-riasec`}>
          {zh ? "免费探索我的职业兴趣" : "Explore my career interests for free"}
        </Link></li>
        <li><Link className="underline underline-offset-4" href={careerExplorationPilotPath(locale, otherInterest)}>
          {zh ? `了解 ${otherInterest.toUpperCase()} 兴趣代码` : `Explore the ${otherInterest.toUpperCase()} interest code`}
        </Link></li>
        {pilot === "intj" && <li><Link className="underline underline-offset-4" href={`/${locale}/personality/intj`}>
          {zh ? "回到 INTJ 人格解读" : "Return to the INTJ profile"}
        </Link></li>}
      </ul>
    </section>
  );
}
