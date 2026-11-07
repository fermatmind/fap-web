import Image from "next/image";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { moonPhasePresentation, moonPhaseImage } from "@/lib/questionnaires/moonPhasePresentation";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function MoonPhaseExamples({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh";
  const samples = [
    { label: zh ? "单项：新月" : "One result: New Moon", options: quiz.questions.map(q => (q.options.find(o => o.directionId === "new-moon") ?? q.options[0]).id) },
    { label: zh ? "两项并列：满月与渐亏月牙" : "Two tied results: Full Moon and Waning Crescent", options: ["D","A","C","B","B","B","B","C","C","C","D","D","A","B","A","A","A","C","A","B","D","B","B","A"] },
    { label: zh ? "八项并列" : "Eight tied results", options: quiz.questions.map(() => "A") },
  ];
  return <section id="moon-phase-examples" aria-labelledby="moon-phase-examples-title" className="my-8 space-y-5">
    <h2 id="moon-phase-examples-title" className="text-2xl font-semibold">{zh ? "先看结果：你可能得到哪种月相？" : "Preview your result: what moon phase could you get?"}</h2>
    <p className="leading-7">{zh ? "以下是合成示例，不是你的结果。每次选择给对应意象加1，24次选择合计24；每种意象的选项出现12次。保留全部最高并列，不计算相似度。" : "These are synthetic examples, not your result. Each choice adds one to its metaphor, for 24 choices in total; each metaphor’s options appear 12 times. Every highest tie is kept, without a similarity percentage."}</p>
    {samples.map(sample => {
      const result = scoreArchetypeQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, sample.options[i]])));
      if (result.status !== "complete") return null;
      return <article key={sample.label} data-moon-phase-example className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold">{sample.label}</h3>
        <ul className="my-3 flex flex-wrap gap-3">{result.profileIds.map(id => <li key={id} className="flex items-center gap-2 text-sm font-semibold"><Image unoptimized src={moonPhaseImage(id)} width={44} height={44} alt="" className="rounded-lg" />{moonPhasePresentation(id)!.name[locale]}</li>)}</ul>
        <p className="text-sm leading-7">{zh ? "按新月、渐盈月牙、上弦月、盈凸月、满月、亏凸月、下弦月、渐亏月牙顺序：" : "In order: New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, Waning Crescent: "}{quiz.directions.map(d => result.counts[d.id]).join(zh ? "、" : ", ")}</p>
        <details className="mt-2 text-sm"><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "查看可复算答卷（第1–24题）" : "Reproduce this answer sheet (questions 1–24)"}</summary><p className="leading-7 [overflow-wrap:anywhere]">{sample.options.join(" · ")}</p></details>
      </article>;
    })}
  </section>;
}
