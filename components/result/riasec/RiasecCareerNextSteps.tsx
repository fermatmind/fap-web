import Link from "next/link";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export function RiasecCareerNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <div className="space-y-3" data-testid="riasec-career-next-steps">
    <p>{zh
      ? "先读本次报告的作答质量、六维分数与接近/并列提示，再把兴趣线索带到真实工作任务中核对。兴趣不等于能力、资格或录用条件。"
      : "Read this report’s response quality, six dimension scores, and close-score or tie guidance, then check those interests against real work tasks. Interests do not establish ability, qualifications, or hiring eligibility."}</p>
    <ol className="list-decimal space-y-3 pl-5">
      <li><Link className="underline underline-offset-4" href={`${localizedPath("/holland-test/pdf-download", locale)}#interpret-results`}>{zh ? "读懂结果：六维、Top 3 与接近/并列" : "Understand your result: six dimensions, Top 3, and ties"}</Link></li>
      <li><Link className="underline underline-offset-4" href={localizedPath("/career", locale)}>{zh ? "进入职业中心，选 2–3 个职业核对日常任务" : "Open the career center and compare daily tasks in 2–3 roles"}</Link></li>
      <li><Link className="underline underline-offset-4" href={localizedPath("/career/guides", locale)}>{zh ? "查看职业指南，规划一次低成本尝试" : "Use career guides to plan a small, low-cost trial"}</Link></li>
      <li><Link className="underline underline-offset-4" href={localizedPath("/career/tests", locale)}>{zh ? "选型Hub：选择适合当前问题的探索工具" : "Assessment hub: choose a tool for your current question"}</Link></li>
    </ol>
    <p>{zh ? "阅读职业档案时，核对日常任务、工作环境、技能证据和资格要求，并查看来源的地区、年份与限制。以下是资料阅读示例，由你判断是否值得探索，不根据结果替你推荐职业：" : "In a career profile, check daily tasks, work setting, skill evidence and qualifications, including each source’s region, year and limitations. These are profile-reading examples for you to consider, not careers recommended from your scores:"}</p>
    <ul className="list-disc space-y-2 pl-5">
      <li><Link className="underline underline-offset-4" href={localizedPath("/career/jobs/industrial-designers", locale)}>{zh ? "工业设计师职业档案" : "Industrial designer profile"}</Link></li>
      <li><Link className="underline underline-offset-4" href={localizedPath("/career/jobs/graphic-designers", locale)}>{zh ? "平面设计师职业档案" : "Graphic designer profile"}</Link></li>
      <li><Link className="underline underline-offset-4" href={localizedPath("/career/jobs/architects-except-landscape-and-naval", locale)}>{zh ? "建筑师职业档案" : "Architect profile"}</Link></li>
    </ul>
    <p><Link className="underline underline-offset-4" href={localizedPath("/career/compare", locale)}>{zh ? "使用现有两职业比较" : "Use the existing two-career comparison"}</Link>{zh ? "：仅支持工业设计师、平面设计师和建筑师中的两个；其他职业请阅读档案与指南。" : ": choose two from industrial designers, graphic designers and architects only. For other roles, use their profiles and the guides."}</p>
    <p><Link className="underline underline-offset-4" href={localizedPath("/holland-test/pdf-download", locale)}>{zh ? "打开本人探索工作表" : "Open my exploration worksheet"}</Link>{zh ? "：自行填写或粘贴记录，结果和笔记不会自动填入；当前工作表刷新可能丢失，请按需复制或下载。" : ": enter or paste your own notes; results and notes are not filled in automatically. Refreshing the worksheet may lose your work; copy or download it as needed."}</p>
    <p className="text-sm">{zh
      ? "在工作表中记录愿意尝试的任务、需要补齐的技能、当地资格要求及时间成本。这些链接通向公开职业资源；请自行核对具体任务与进入条件，三字代码仅用于整理探索线索。链接不会携带你的结果或答案。"
      : "Use the worksheet to record tasks to try, skill gaps, local qualification requirements, and time costs. These links open public career resources. Check specific tasks and entry requirements yourself, using your three-letter code to organize exploration. The links do not carry your result or answers."}</p>
  </div>;
}
