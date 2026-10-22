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
    </ol>
    <p className="text-sm">{zh
      ? "在工作表中记录愿意尝试的任务、需要补齐的技能、当地资格要求及时间成本。这些链接通向公开职业资源；请自行核对具体任务与进入条件，三字代码仅用于整理探索线索。链接不会携带你的结果或答案。"
      : "Use the worksheet to record tasks to try, skill gaps, local qualification requirements, and time costs. These links open public career resources. Check specific tasks and entry requirements yourself, using your three-letter code to organize exploration. The links do not carry your result or answers."}</p>
  </div>;
}
