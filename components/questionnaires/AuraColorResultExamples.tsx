import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { auraColors } from "@/lib/questionnaires/auraColors";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

// Synthetic sheets in published question order: a single Blue match and a Yellow/Green tie.
const sheets = ["CCBDCCDBCAABAACCABAAB", "CADCCCCDCCCDDCABBADDB"] as const;

export function AuraColorResultExamples({ quiz, locale, displayLocale = locale }: {
  quiz: Questionnaire; locale: Locale; displayLocale?: DisplayLocale;
}) {
  const text = (zh: string, en: string, tw: string) => displayLocale === "zh-TW" ? tw : locale === "zh" ? zh : en;
  return <section id="aura-examples" aria-labelledby="aura-examples-title" className="my-8 scroll-mt-24 space-y-4">
    <h2 id="aura-examples-title" className="text-2xl font-semibold">{text("光环颜色结果示例", "Aura color result examples", "光環顏色結果示例")}</h2>
    <p className="leading-7 text-slate-700">{text("两份虚构答卷，按正式测试的规则计分。每份答卷的七色次数合计 21。", "Two fictional answer sheets scored by the quiz. The seven counts on each sheet add up to 21.", "兩份虛構答卷依正式測驗規則計分，每份答卷的七色次數合計 21。")}</p>
    <div className="grid items-start gap-4 sm:grid-cols-2">
      {sheets.map((sheet, index) => {
        const result = scoreArchetypeQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((question, i) => [question.id, sheet[i]])));
        if (result.status !== "complete" || result.profileIds.length !== index + 1) return null;
        const highest = Math.max(...Object.values(result.counts));
        return <article key={sheet} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-semibold">{index === 0 ? (text("单一最高", "One highest count", "單一最高")) : (text("最高并列", "Tie for first", "最高並列"))}</h3>
          <p className="leading-7">{index === 0
            ? (text(`最高项被选中 ${highest} 次，只匹配这一色。`, `One color was chosen ${highest} times and leads on its own.`, `最高項被選中 ${highest} 次，只匹配這一色。`))
            : (text(`两色各被选中 ${highest} 次，同为最高。两项都保留，顺序不分主次。`, `Both colors were chosen ${highest} times. Both are kept, with neither ranked above the other.`, `兩色各被選中 ${highest} 次，同為最高。兩項都保留，順序不分主次。`))}</p>
          <ul>
            {quiz.profiles.filter(profile => result.profileIds.includes(profile.id)).map(profile => <li key={profile.id}>
              <Link prefetch={false} href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)} className="flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4">
                <span aria-hidden="true" className="size-3 shrink-0 rounded-full ring-1 ring-slate-600" style={{ backgroundColor: auraColors[profile.id] }} />
                {profile.title[locale]}
              </Link>
            </li>)}
          </ul>
          <details>
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">{text("查看七色次数", "See all seven counts", "查看七色次數")}</summary>
            <dl className="space-y-1 text-sm leading-6">{quiz.directions.map(direction => <div key={direction.id} className="flex items-baseline justify-between gap-2">
              <dt>{direction.title[locale]}</dt><dd className="shrink-0 tabular-nums">{result.counts[direction.id]} / {direction.comparisons}</dd>
            </div>)}</dl>
            <p className="mt-2 text-sm leading-6 text-slate-700">{text("12 是每色出现的次数；这些数字不是相似度或能量比例。", "Each color appears 12 times. These are choice counts, not match or energy percentages.", "每種顏色出現 12 次。這些數字是選擇次數，不能用來推算相似度或能量比例。")}</p>
          </details>
        </article>;
      })}
    </div>
  </section>;
}
