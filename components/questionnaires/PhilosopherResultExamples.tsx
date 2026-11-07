import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { PhilosopherPortrait } from "./PhilosopherPortrait";

// Synthetic answers in published question order, evaluated by the current scorer.
export const philosopherExampleSheets = ["AAAAABAADACAAADACB", "BCBBDBBADDCCABCCBA", "AAAAAAAAAAAAAAAAAA"] as const;

export function PhilosopherResultExamples({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh";
  return <section id="philosopher-examples" aria-labelledby="philosopher-examples-title" className="my-8 scroll-mt-24 space-y-4">
    <h2 id="philosopher-examples-title" className="text-2xl font-semibold">{zh ? "哲学家测试结果示例：从选择到阅读" : "Philosopher quiz result examples: from choices to reading"}</h2>
    <p className="leading-7 text-slate-700">{zh ? "三份虚构答卷，使用当前18题的计分规则。结果告诉你可以从哪份原典指南开始读，不代表你就是某位哲学家。" : "Three fictional answer sheets scored using the current 18-question quiz. Results suggest where to start reading, rather than which historical person you are."}</p>
    <div className="grid items-start gap-4 sm:grid-cols-2">
      {philosopherExampleSheets.map((sheet, index) => {
        const result = scoreArchetypeQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((question, i) => [question.id, sheet[i]])));
        if (result.status !== "complete") return null;
        const highest = Math.max(...Object.values(result.counts));
        const matches = quiz.profiles.filter(profile => result.profileIds.includes(profile.id));
        return <article key={sheet} data-philosopher-example={index} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-semibold">{index === 0 ? (zh ? "一个阅读起点" : "One reading starting point") : index === 1 ? (zh ? "两项最高并列" : "Two joint highest counts") : (zh ? "九项全部并列" : "All nine tied")}</h3>
          {index === 0 && <div className="max-w-32"><PhilosopherPortrait id="socrates" locale={locale} /></div>}
          <p className="leading-7">{zh ? `本例最高为 ${highest} / 8，保留${matches.length}个阅读入口。${index === 0 ? "先读苏格拉底指南，看看怎样检视我们声称知道的事。" : "每份并列指南都可以读，排列不分主次。"}` : `The highest count is ${highest} / 8, retaining ${matches.length} reading ${matches.length === 1 ? "path" : "paths"}. ${index === 0 ? "Start with Socrates and examine what we claim to know." : "Every tied guide is available; their order does not imply priority."}`}</p>
          <ul>{matches.map(profile => <li key={profile.id}>
            <Link prefetch={false} href={questionnaireGuidePath(locale, quiz.slug, profile.id)} className="inline-block min-h-11 py-2 font-semibold underline underline-offset-4">{profile.title[locale]}</Link>
          </li>)}</ul>
          <details>
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">{zh ? "查看九项次数与示例答卷" : "See nine counts and the sample answers"}</summary>
            <dl className="space-y-1 text-sm leading-6">{quiz.directions.map(direction => <div key={direction.id} className="flex items-baseline justify-between gap-2">
              <dt>{direction.title[locale]}</dt><dd className="shrink-0 tabular-nums">{result.counts[direction.id]} / {direction.comparisons}</dd>
            </div>)}</dl>
            <p className="mt-2 break-all font-mono text-sm">{sheet}</p>
            <p className="mt-2 text-sm leading-6">{zh ? "字母按第1至18题顺序表示选项。九项次数合计18；8是每个方向的出现次数，不是相似度或学派认同百分比。" : "Letters indicate options for questions 1–18. Counts total 18; each direction appears eight times. These are not resemblance or philosophical-agreement percentages."}</p>
          </details>
        </article>;
      })}
    </div>
  </section>;
}
