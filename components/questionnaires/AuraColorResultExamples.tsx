import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { auraColors } from "@/lib/questionnaires/auraColors";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

// Synthetic sheets in published question order: a single Blue match and a Yellow/Green tie.
const sheets = ["CCBDCCDBCAABAACCABAAB", "CADCCCCDCCCDDCABBADDB"] as const;

export function AuraColorResultExamples({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh";
  return <section id="aura-examples" aria-labelledby="aura-examples-title" className="my-8 scroll-mt-24 space-y-4">
    <h2 id="aura-examples-title" className="text-2xl font-semibold">{zh ? "光环颜色结果示例" : "Aura color result examples"}</h2>
    <p className="leading-7 text-slate-700">{zh ? "两份虚构答卷，按正式测试的规则计分。每份答卷的七色次数合计 21。" : "Two fictional answer sheets scored by the quiz. The seven counts on each sheet add up to 21."}</p>
    <div className="grid items-start gap-4 sm:grid-cols-2">
      {sheets.map((sheet, index) => {
        const result = scoreArchetypeQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((question, i) => [question.id, sheet[i]])));
        if (result.status !== "complete" || result.profileIds.length !== index + 1) return null;
        const highest = Math.max(...Object.values(result.counts));
        return <article key={sheet} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-semibold">{index === 0 ? (zh ? "单一最高" : "One highest count") : (zh ? "最高并列" : "Tie for first")}</h3>
          <p className="leading-7">{index === 0
            ? (zh ? `最高项被选中 ${highest} 次，只匹配这一色。` : `One color was chosen ${highest} times and leads on its own.`)
            : (zh ? `两色各被选中 ${highest} 次，同为最高。两项都保留，顺序不分主次。` : `Both colors were chosen ${highest} times. Both are kept, with neither ranked above the other.`)}</p>
          <ul>
            {quiz.profiles.filter(profile => result.profileIds.includes(profile.id)).map(profile => <li key={profile.id}>
              <Link prefetch={false} href={questionnaireGuidePath(locale, quiz.slug, profile.id)} className="flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4">
                <span aria-hidden="true" className="size-3 shrink-0 rounded-full ring-1 ring-slate-600" style={{ backgroundColor: auraColors[profile.id] }} />
                {profile.title[locale]}
              </Link>
            </li>)}
          </ul>
          <details>
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">{zh ? "查看七色次数" : "See all seven counts"}</summary>
            <dl className="space-y-1 text-sm leading-6">{quiz.directions.map(direction => <div key={direction.id} className="flex items-baseline justify-between gap-2">
              <dt>{direction.title[locale]}</dt><dd className="shrink-0 tabular-nums">{result.counts[direction.id]} / {direction.comparisons}</dd>
            </div>)}</dl>
            <p className="mt-2 text-sm leading-6 text-slate-700">{zh ? "12 是每色出现的次数；这些数字不是相似度或能量比例。" : "Each color appears 12 times. These are choice counts, not match or energy percentages."}</p>
          </details>
        </article>;
      })}
    </div>
  </section>;
}
