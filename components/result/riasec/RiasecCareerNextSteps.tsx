import Link from "next/link";
import { DESIGN_COMPARE_HREF, DESIGN_COMPARE_LABEL, DESIGN_COMPARE_TASKS } from "@/lib/career/designComparePilot";
import { rankRiasecCareers } from "@/lib/career/riasecProfileMatch";
import type { RiasecDimension } from "@/lib/riasec/resultAssembler";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export function RiasecCareerNextSteps({ locale, activityKeys, scores }: {
  locale: Locale;
  activityKeys?: readonly string[];
  scores?: RiasecDimension[];
}) {
  const zh = locale === "zh";
  const showDesignCompare = zh && activityKeys?.some(key => key === "r_proto_1" || key === "a_visual_1");
  const matches = scores ? rankRiasecCareers(scores, locale) : null;
  return <div className="space-y-3" data-testid="riasec-career-next-steps">
    <p>{zh
      ? "先读本次报告的作答质量、六维分数与接近/并列提示，再把兴趣线索带到真实工作任务中核对。兴趣不等于能力、资格或录用条件。"
      : "Read this report’s response quality, six dimension scores, and close-score or tie guidance, then check those interests against real work tasks. Interests do not establish ability, qualifications, or hiring eligibility."}</p>
    {matches?.jobs.length ? (
      <details className="space-y-2 print:hidden" data-testid="riasec-profile-careers">
        <summary className="cursor-pointer font-semibold">{zh ? "探索兴趣轮廓相近的职业" : "Explore careers with similar interest profiles"}</summary>
        <p>{zh
          ? "这些美国职业的 O*NET 兴趣轮廓与你的六维分数相近。选一个档案核对实际任务、工作环境和入行条件。"
          : "These U.S. occupations have O*NET interest profiles that resemble your six scores. Open a profile to check tasks, work settings, and entry requirements."}</p>
        <ul className="list-disc space-y-2 pl-5">
          {matches.jobs.map(job => <li key={job.slug}>
            <Link className="underline underline-offset-4" href={localizedPath(`/career/jobs/${job.slug}`, locale)}>{job.name}</Link>
            <p>{job.summary}</p>
          </li>)}
        </ul>
      </details>
    ) : matches?.state === "flat" ? (
      <p>{zh
        ? "你的六维分数比较接近。可以先从感兴趣的具体任务出发，在职业中心比较几个方向。"
        : "Your six scores are close together. Start with a task that interests you and compare a few directions in the career center."}</p>
    ) : null}
    <ol className="list-decimal space-y-3 pl-5">
      <li><Link className="underline underline-offset-4" href={`${localizedPath("/holland-test/pdf-download", locale)}#interpret-results`}>{zh ? "读懂结果：六维、Top 3 与接近/并列" : "Understand your result: six dimensions, Top 3, and ties"}</Link></li>
      <li><Link className="underline underline-offset-4" href={localizedPath("/career", locale)}>{zh ? "进入职业中心，选 2–3 个职业核对日常任务" : "Open the career center and compare daily tasks in 2–3 roles"}</Link></li>
      <li><Link className="underline underline-offset-4" href={localizedPath("/career/guides", locale)}>{zh ? "查看职业指南，规划一次低成本尝试" : "Use career guides to plan a small, low-cost trial"}</Link></li>
      <li><Link className="underline underline-offset-4" href={localizedPath("/career/tests", locale)}>{zh ? "选型Hub：选择适合当前问题的探索工具" : "Assessment hub: choose a tool for your current question"}</Link></li>
    </ol>
    <p>{zh ? "阅读职业档案时，核对日常任务、工作环境、技能证据和资格要求，并查看来源的地区、年份与限制。以下三个职业用于示范如何阅读资料，由你判断是否值得探索；三字代码不能判定你是否胜任某个职业。" : "In a career profile, check daily tasks, work setting, skill evidence and qualifications, including each source’s region, year and limitations. These three roles illustrate how to read profiles. Decide which are worth exploring; a three-letter code cannot establish whether you can do a job."}</p>
    {showDesignCompare ? <ul className="m-0 list-none divide-y divide-teal-100 rounded-xl border border-teal-200 bg-white px-4">
      {DESIGN_COMPARE_TASKS.map(career => <li key={career.slug} className="grid gap-1 py-3 sm:grid-cols-[minmax(7rem,1fr)_2fr] sm:gap-4">
        <p className="font-semibold text-slate-950">{career.name}</p>
        <div className="min-w-0 text-sm leading-6 text-slate-700">
          <p>{career.task}</p>
          <Link className="inline-flex min-h-11 items-center font-semibold text-teal-800 underline underline-offset-4" href={localizedPath(`/career/jobs/${career.slug}`, locale)}>{career.name}职业档案</Link>
        </div>
      </li>)}
    </ul> : null}
    <ul className="list-disc space-y-2 pl-5">
      {showDesignCompare ? null : <>
        <li><Link className="underline underline-offset-4" href={localizedPath("/career/jobs/industrial-designers", locale)}>{zh ? "工业设计师职业档案" : "Industrial designer profile"}</Link></li>
        <li><Link className="underline underline-offset-4" href={localizedPath("/career/jobs/graphic-designers", locale)}>{zh ? "平面设计师职业档案" : "Graphic designer profile"}</Link></li>
      </>}
      <li><Link className="underline underline-offset-4" href={localizedPath("/career/jobs/architects-except-landscape-and-naval", locale)}>{zh ? "建筑师职业档案" : "Architect profile"}</Link></li>
    </ul>
    {showDesignCompare ? <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-slate-950">
      <p className="mb-3 text-sm leading-6">如果你想试做原型或设计说明图，可以先比较这两个职业的日常任务，再选一个小练习。</p>
      <Link className={buttonVariants({ className: "h-auto min-h-11 whitespace-normal text-center" })} href={DESIGN_COMPARE_HREF}>{DESIGN_COMPARE_LABEL}</Link>
    </div> : null}
    <p><Link className="underline underline-offset-4" href={localizedPath("/career/compare", locale)}>{zh ? "使用现有两职业比较" : "Use the existing two-career comparison"}</Link>{zh ? "：仅支持工业设计师、平面设计师和建筑师中的两个；其他职业请阅读档案与指南。" : ": choose two from industrial designers, graphic designers and architects only. For other roles, use their profiles and the guides."}</p>
    <p><Link className="underline underline-offset-4" href={localizedPath("/holland-test/pdf-download", locale)}>{zh ? "打开本人探索工作表" : "Open my exploration worksheet"}</Link>{zh ? "：自行填写或粘贴记录，结果和笔记不会自动填入；当前工作表刷新可能丢失，请按需复制或下载。" : ": enter or paste your own notes; results and notes are not filled in automatically. Refreshing the worksheet may lose your work; copy or download it as needed."}</p>
    <p className="text-sm">{zh
      ? "在工作表中记录愿意尝试的任务、需要补齐的技能、当地资格要求及时间成本。这些链接通向公开职业资源；请自行核对具体任务与进入条件，三字代码仅用于整理探索线索。链接不会携带你的结果或答案。"
      : "Use the worksheet to record tasks to try, skill gaps, local qualification requirements, and time costs. These links open public career resources. Check specific tasks and entry requirements yourself, using your three-letter code to organize exploration. The links do not carry your result or answers."}</p>
  </div>;
}
