import Image from "next/image";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { moonPhaseDisplayCopy, moonPhasePresentation, moonPhaseImage } from "@/lib/questionnaires/moonPhasePresentation";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function MoonPhaseExamples({ quiz, locale, displayLocale = locale, traditionalCopy }: { quiz: Questionnaire; locale: Locale; displayLocale?: DisplayLocale; traditionalCopy?: (text: string) => string }) {
  const copy = moonPhaseDisplayCopy(traditionalCopy);
  const text = (zh: string, en: string, tw: string) => displayLocale === "zh-TW" ? tw : locale === "zh" ? copy(zh) : en;
  const name = (id: string) => {
    const phase = moonPhasePresentation(id)!;
    return displayLocale === "zh-TW"
      ? ({ "waxing-crescent": "眉月", "full-moon": "滿月", "waning-gibbous": "虧凸月", "waning-crescent": "殘月" } as Record<string, string>)[id] ?? phase.name.zh
      : copy(phase.name[locale]);
  };
  const samples = [
    { label: text("单项：新月", "One result: New Moon", "單項：新月"), options: quiz.questions.map(q => (q.options.find(o => o.directionId === "new-moon") ?? q.options[0]).id) },
    { label: text("两项并列：满月与渐亏月牙", "Two tied results: Full Moon and Waning Crescent", "兩項並列：滿月與殘月"), options: ["D","A","C","B","B","B","B","C","C","C","D","D","A","B","A","A","A","C","A","B","D","B","B","A"] },
    { label: text("八项并列", "Eight tied results", "八項並列"), options: quiz.questions.map(() => "A") },
  ];
  return <section id="moon-phase-examples" aria-labelledby="moon-phase-examples-title" className="my-8 space-y-5">
    <h2 id="moon-phase-examples-title" className="text-2xl font-semibold">{text("先看结果：你可能得到哪种月相？", "Preview your result: what moon phase could you get?", "先看你可能會得到哪種月相")}</h2>
    <p className="leading-7">{text("以下是合成示例，不是你的结果。每次选择给对应意象加1，24次选择合计24；每种意象的选项出现12次。保留全部最高并列，不计算相似度。", "These are synthetic examples, not your result. Each choice adds one to its metaphor, for 24 choices in total; each metaphor’s options appear 12 times. Every highest tie is kept, without a similarity percentage.", "這三份是模擬答卷。每次選擇替對應的月相加 1 次，合計 24 次。每種月相在題目中各出現 12 次，並列最高時全部留下。")}</p>
    {samples.map(sample => {
      const result = scoreArchetypeQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, sample.options[i]])));
      if (result.status !== "complete") return null;
      return <article key={sample.label} data-moon-phase-example className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold">{sample.label}</h3>
        <ul className="my-3 flex flex-wrap gap-3">{result.profileIds.map(id => <li key={id} className="flex items-center gap-2 text-sm font-semibold"><Image unoptimized src={moonPhaseImage(id)} width={44} height={44} alt="" className="rounded-lg" />{name(id)}</li>)}</ul>
        <p className="text-sm leading-7">{text("按新月、渐盈月牙、上弦月、盈凸月、满月、亏凸月、下弦月、渐亏月牙顺序：", "In order: New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, Waning Crescent: ", "依新月、眉月、上弦月、盈凸月、滿月、虧凸月、下弦月、殘月排列：")}{quiz.directions.map(d => result.counts[d.id]).join(text("、", ", ", "、"))}</p>
        <details className="mt-2 text-sm"><summary className="min-h-11 cursor-pointer py-2 font-semibold">{text("查看可复算答卷（第1–24题）", "Reproduce this answer sheet (questions 1–24)", "查看第 1 至 24 題的模擬答卷")}</summary><p className="leading-7 [overflow-wrap:anywhere]">{sample.options.join(" · ")}</p></details>
      </article>;
    })}
  </section>;
}
