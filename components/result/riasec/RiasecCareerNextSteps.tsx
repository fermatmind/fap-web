import Link from "next/link";
import { DESIGN_COMPARE_HREF, DESIGN_COMPARE_LABEL, DESIGN_COMPARE_TASKS } from "@/lib/career/designComparePilot";
import { rankRiasecCareers } from "@/lib/career/riasecProfileMatch";
import type { RiasecDimension } from "@/lib/riasec/resultAssembler";
import { buttonVariants } from "@/components/ui/button";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { assessmentDisplayPath } from "@/lib/tests/traditionalAssessmentDisplay";

export function RiasecCareerNextSteps({ locale, displayLocale = locale, activityKeys, scores }: {
  locale: Locale;
  displayLocale?: DisplayLocale;
  activityKeys?: readonly string[];
  scores?: RiasecDimension[];
}) {
  const traditional = displayLocale === "zh-TW";
  const zh = locale === "zh";
  const text = (cn: string, en: string, tw: string) => traditional ? tw : zh ? cn : en;
  const path = (pathname: string) => assessmentDisplayPath(pathname, displayLocale, locale);
  const showDesignCompare = zh && activityKeys?.some(key => key === "r_proto_1" || key === "a_visual_1");
  const matches = scores ? rankRiasecCareers(scores, displayLocale) : null;
  return <div className="space-y-3" data-testid="riasec-career-next-steps">
    <p>{text(
      "先读本次报告的作答质量、六维分数与接近/并列提示，再把兴趣线索带到真实工作任务中核对。兴趣不等于能力、资格或录用条件。",
      "Read this report’s response quality, six dimension scores, and close-score or tie guidance, then check those interests against real work tasks. Interests do not establish ability, qualifications, or hiring eligibility.",
      "先閱讀這份報告的作答品質、六向度分數，以及分數相近或並列的提示，再用實際工作任務核對興趣線索。興趣與能力、資格或任用條件是不同的判斷。",
    )}</p>
    {matches?.jobs.length ? (
      <details className="space-y-2 print:hidden" data-testid="riasec-profile-careers">
        <summary className="cursor-pointer font-semibold">{text("探索兴趣轮廓相近的职业", "Explore careers with similar interest profiles", "探索興趣輪廓相近的職業")}</summary>
        <p>{text(
          "这些美国职业的 O*NET 兴趣轮廓与你的六维分数相近。选一个档案核对实际任务、工作环境和入行条件。",
          "These U.S. occupations have O*NET interest profiles that resemble your six scores. Open a profile to check tasks, work settings, and entry requirements.",
          "這些美國職業的 O*NET 興趣輪廓與你的六向度分數相近。選一個職業檔案，核對實際任務、工作環境和入行條件。",
        )}</p>
        <ul className="list-disc space-y-2 pl-5">
          {matches.jobs.map(job => <li key={job.slug}>
            <Link className="underline underline-offset-4" href={path(`/career/jobs/${job.slug}`)}>{job.name}</Link>
            <p>{job.summary}</p>
          </li>)}
        </ul>
      </details>
    ) : matches?.state === "flat" ? (
      <p>{text("你的六维分数比较接近。可以先从感兴趣的具体任务出发，在职业中心比较几个方向。", "Your six scores are close together. Start with a task that interests you and compare a few directions in the career center.", "你的六向度分數較接近。可以先從有興趣的具體任務出發，在職涯中心比較幾個方向。")}</p>
    ) : null}
    <ol className="list-decimal space-y-3 pl-5">
      <li><Link className="underline underline-offset-4" href={`${path("/holland-test/pdf-download")}#interpret-results`}>{text(
        "读懂结果：六维、Top 3 与接近/并列",
        "Understand your result: six dimensions, Top 3, and ties",
        "讀懂結果：六向度、Top 3 與分數相近或並列",
      )}</Link></li>
      <li><Link className="underline underline-offset-4" href={path("/career")}>{text("进入职业中心，选 2–3 个职业核对日常任务", "Open the career center and compare daily tasks in 2–3 roles", "前往職涯中心，選 2–3 個職業核對日常任務")}</Link></li>
      <li><Link className="underline underline-offset-4" href={path("/career/guides")}>{text("查看职业指南，规划一次低成本尝试", "Use career guides to plan a small, low-cost trial", "查看職涯指南，規劃一次低成本的嘗試")}</Link></li>
      <li><Link className="underline underline-offset-4" href={path(traditional ? "/tests/category/career" : "/career/tests")}>{text(
        "选型Hub：选择适合当前问题的探索工具",
        "Assessment hub: choose a tool for your current question",
        "職業測試：選擇適合目前問題的探索工具",
      )}</Link></li>
    </ol>
    <p>{text(
      "阅读职业档案时，核对日常任务、工作环境、技能证据和资格要求，并查看来源的地区、年份与限制。以下三个职业用于示范如何阅读资料，由你判断是否值得探索；三字代码不能判定你是否胜任某个职业。",
      "In a career profile, check daily tasks, work setting, skill evidence and qualifications, including each source’s region, year and limitations. These three roles illustrate how to read profiles. Decide which are worth exploring; a three-letter code cannot establish whether you can do a job.",
      "閱讀職業檔案時，請核對日常任務、工作環境、技能證據與資格要求，也要查看資料來源的地區、年份與限制。以下三個職業示範如何閱讀資料，由你判斷是否值得探索。三字代碼無法判定你是否勝任某個職業。",
    )}</p>
    {showDesignCompare ? <ul className="m-0 list-none divide-y divide-teal-100 rounded-xl border border-teal-200 bg-white px-4">
      {DESIGN_COMPARE_TASKS.map(career => <li key={career.slug} className="grid gap-1 py-3 sm:grid-cols-[minmax(7rem,1fr)_2fr] sm:gap-4">
        <p className="font-semibold text-slate-950">{traditional ? career.traditional.name : career.name}</p>
        <div className="min-w-0 text-sm leading-6 text-slate-700">
          <p>{traditional ? career.traditional.task : career.task}</p>
          <Link className="inline-flex min-h-11 items-center font-semibold text-teal-800 underline underline-offset-4" href={path(`/career/jobs/${career.slug}`)}>{traditional ? `${career.traditional.name}職業檔案` : `${career.name}职业档案`}</Link>
        </div>
      </li>)}
    </ul> : null}
    <ul className="list-disc space-y-2 pl-5">
      {showDesignCompare ? null : <>
        <li><Link className="underline underline-offset-4" href={path("/career/jobs/industrial-designers")}>{text("工业设计师职业档案", "Industrial designer profile", "工業設計師職業檔案")}</Link></li>
        <li><Link className="underline underline-offset-4" href={path("/career/jobs/graphic-designers")}>{text("平面设计师职业档案", "Graphic designer profile", "平面設計師職業檔案")}</Link></li>
      </>}
      <li><Link className="underline underline-offset-4" href={path("/career/jobs/architects-except-landscape-and-naval")}>{text("建筑师职业档案", "Architect profile", "建築師職業檔案")}</Link></li>
    </ul>
    {showDesignCompare ? <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-slate-950">
      <p className="mb-3 text-sm leading-6">{traditional ? "如果你想試做原型或設計說明圖，可以先比較這兩個職業的日常任務，再選一個小練習。" : "如果你想试做原型或设计说明图，可以先比较这两个职业的日常任务，再选一个小练习。"}</p>
      <Link className={buttonVariants({ className: "h-auto min-h-11 whitespace-normal text-center" })} href={traditional ? DESIGN_COMPARE_HREF.replace(/^\/zh\//, "/zh-TW/") : DESIGN_COMPARE_HREF}>{traditional ? "比較工業設計師與平面設計師" : DESIGN_COMPARE_LABEL}</Link>
    </div> : null}
    <p><Link className="underline underline-offset-4" href={path("/career/compare")}>{text(
      "使用现有两职业比较",
      "Use the existing two-career comparison",
      "使用現有的兩職業比較工具",
    )}</Link>{text(
      "：仅支持工业设计师、平面设计师和建筑师中的两个；其他职业请阅读档案与指南。",
      ": choose two from industrial designers, graphic designers and architects only. For other roles, use their profiles and the guides.",
      "（僅可從工業設計師、平面設計師和建築師中選擇兩個。其他職業請閱讀職業檔案與指南。）",
    )}</p>
    <p><Link className="underline underline-offset-4" href={path("/holland-test/pdf-download")}>{text(
      "打开本人探索工作表",
      "Open my exploration worksheet",
      "開啟個人探索工作表",
    )}</Link>{text(
      "：自行填写或粘贴记录，结果和笔记不会自动填入；当前工作表刷新可能丢失，请按需复制或下载。",
      ": enter or paste your own notes; results and notes are not filled in automatically. Refreshing the worksheet may lose your work; copy or download it as needed.",
      "（請自行填寫或貼上筆記。結果與筆記不會自動帶入，重新整理可能清除內容，請視需要複製或下載。）",
    )}</p>
    <p className="text-sm">{text(
      "在工作表中记录愿意尝试的任务、需要补齐的技能、当地资格要求及时间成本。这些链接通向公开职业资源；请自行核对具体任务与进入条件，三字代码仅用于整理探索线索。链接不会携带你的结果或答案。",
      "Use the worksheet to record tasks to try, skill gaps, local qualification requirements, and time costs. These links open public career resources. Check specific tasks and entry requirements yourself, using your three-letter code to organize exploration. The links do not carry your result or answers.",
      "在工作表記下想嘗試的任務、需要加強的技能、當地資格要求與時間成本。連結會開啟公開職涯資源，請自行核對具體任務與入行條件。三字代碼僅用來整理探索線索。連結不會附帶你的結果或答案。",
    )}</p>
  </div>;
}
