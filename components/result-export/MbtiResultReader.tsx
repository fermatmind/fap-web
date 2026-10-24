import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPersonalityComparisonSlug } from "@/lib/mbti/personalityComparison";
import type { ResultExportProjection } from "@/lib/result-export/contract";

export function MbtiResultReader({ projection, locale }: { projection: ResultExportProjection; locale: Locale }) {
  const zh = locale === "zh";
  const summary = projection.sections.find(section => section.id === "summary");
  const type = summary?.fields[0]?.value;
  const unknown = zh ? "未知（未提供）" : "Unknown (not provided)";
  const axes = projection.sections.filter(section => section.id !== "summary" && section.id !== "AT");
  const atComparison = typeof type === "string" ? buildPersonalityComparisonSlug(type.slice(0, 4)) : null;
  const at = projection.sections.find(section => section.id === "AT");
  function axis(section: typeof axes[number]) {
    return <details key={section.id} className="rounded-xl border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer font-semibold">{section.title} · {section.fields[0]?.value ?? unknown} · {section.fields[1]?.value ?? unknown}{section.fields[1]?.value !== null ? "%" : ""}</summary>
      <dl className="mt-3 space-y-2">{section.fields.map(field => <div key={field.label}><dt className="font-medium">{field.label}</dt><dd>{field.value ?? unknown}{field.value !== null && field.unit ? ` ${field.unit}` : ""}</dd></div>)}</dl>
    </details>;
  }
  return <section className="min-w-0 [overflow-wrap:anywhere] space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 sm:p-6 print:hidden" data-testid="mbti-result-reader">
    <h1 className="text-2xl font-semibold">{zh ? "本次结果概览" : "Your result at a glance"} · {type}</h1>
    <p>{projection.assessment.questionCount === null ? unknown : `${projection.assessment.questionCount} ${zh ? "题" : "items"}`} · {projection.assessment.formCode ?? unknown} · {projection.assessment.locale ?? unknown}</p>
    {summary?.fields[1]?.value ? <p>{summary.fields[1].value}</p> : null}
    {projection.quality.length ? <div className="rounded-xl bg-amber-50 p-3 text-sm">{projection.quality.map(field => <p key={field.label}>{field.label}: {field.value ?? unknown}</p>)}<p>{zh ? "质量标记是本次报告的提示；结合具体经历核对，不把等级当准确率。" : "Quality flags are notes from this report. Check against experience; a grade is not accuracy."}</p></div> : null}
    <nav aria-label={zh ? "报告阅读目录" : "Report reading contents"} className="flex flex-wrap gap-3">
      <a className="underline" href="#mbti-preference-overview">{zh ? "四组偏好" : "Four preference pairs"}</a><a className="underline" href="#mbti-additional-at">{zh ? "独立 A/T" : "Separate A/T"}</a><a className="underline" href="#mbti-application">{zh ? "现实应用" : "Real-life application"}</a><a className="underline" href="#mbti-export-method">{zh ? "方法与版本" : "Method and versions"}</a>
    </nav>
    <p>{zh ? "下方百分比描述本次回答的方向得分，不是能力、准确率、置信度或人群百分位。接近中点或平分时，两侧方式都值得结合经历核对。" : "Percentages describe the direction of this response, not ability, accuracy, confidence or population percentile. Near the midpoint or tied, check both sides against your experience."}</p>
    <div id="mbti-preference-overview" className="grid gap-3 sm:grid-cols-2">{axes.map(axis)}</div>
    <div id="mbti-additional-at" className="space-y-2"><h2 className="text-lg font-semibold">{zh ? "独立附加 A/T" : "Separate additional A/T"}</h2><p>{zh ? "A/T 是附加信息，与经典四组偏好分开。缺失不代表零分，也不据类型后缀倒推分数。" : "A/T is additional information, separate from the four preference pairs. Missing does not mean zero; scores are not inferred from a type suffix."}</p>{at ? axis(at) : null}{atComparison ? <Link className="inline-block py-2 underline" href={localizedPath(`/personality/${atComparison}`, locale)}>{zh ? "阅读已有 A/T 比较，核对相似与反例" : "Read the existing A/T comparison and check counterexamples"}</Link> : null}</div>
    <section id="mbti-application" className="space-y-3"><h2 className="text-lg font-semibold">{zh ? "用一次真实经历核对" : "Check against one real experience"}</h2><p>{zh ? "回想一次工作沟通或任务安排：哪种方式帮助了你？什么情境下相反的方式更合适？选一个调整，例如先确认对方需要结论还是背景，下次记录反馈。" : "Recall a work conversation or how you organized a task. Which approach helped? When would the opposite approach fit better? Try one change, such as asking whether the other person needs a conclusion or background first, then note their feedback."}</p>
      {typeof type === "string" ? <Link className="inline-block py-2 underline" href={localizedPath(`/personality/${type.toLowerCase()}`, locale)}>{zh ? "查看已有类型解释与比较入口" : "Read the existing type explanation and comparison links"}</Link> : null}
    </section>
    <details id="mbti-export-method"><summary className="cursor-pointer py-2 font-semibold">{zh ? "方法、来源与版本" : "Method, source and versions"}</summary><p>FermatMind · https://fermatmind.com</p>{projection.limitations.map(note => <p key={note} className="mt-2">{note}</p>)}<dl>{projection.versions.map(field => <div key={field.label} className="mt-2"><dt>{field.label}</dt><dd className="break-words">{field.value ?? unknown}</dd></div>)}</dl><p className="mt-2">{zh ? "参照与质量未提供时保持未知，不据此认定结果质量良好。完整分层正文与原目录保留在下方报告。" : "Missing reference or quality information stays unknown, not assumed good. The original layered report and contents remain below."}</p></details>
  </section>;
}
