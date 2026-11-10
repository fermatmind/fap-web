import Image from "next/image";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { bleachPresentation, bleachPortraitPath } from "@/lib/questionnaires/bleachPresentation";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function BleachExamples({ quiz, locale, copy = value => value }: { quiz: Questionnaire; locale: Locale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  const two = ["C","C","B","B","A","B","B","A","D","D","A","C","C","B","C","C","D","C","C","D","D"];
  const samples = [
    { label: zh ? copy("单项示例") : "Single-match example", options: quiz.questions.map(q => (q.options.find(o => o.directionId === "ichigo-kurosaki") ?? q.options[0]).id) },
    { label: zh ? copy("两位并列示例") : "Two-way tie example", options: two },
    { label: zh ? copy("七位并列示例") : "Seven-way tie example", options: quiz.questions.map(() => "A") },
  ];
  return <section id="bleach-examples" aria-labelledby="bleach-examples-title" className="my-8 space-y-5">
    <h2 id="bleach-examples-title" className="text-2xl font-semibold">{zh ? copy("先看结果：单项和并列怎样出现？") : "See sample results: one character or a tie?"}</h2>
    <p className="leading-7">{zh ? copy("以下都是合成答卷，不是你的结果。每个选项给对应角色加1次，21次选择合计21；每位角色的选项出现12次。") : "These are synthetic answer sheets, not your result. Each chosen option adds one to its character. All 21 choices sum to 21; each character’s options appear 12 times."}</p>
    <div className="space-y-4">{samples.map(sample => {
      const result = scoreArchetypeQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, sample.options[i]])));
      if (result.status !== "complete") return null;
      return <article key={sample.label} data-bleach-example className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold">{sample.label}</h3>
        <ul className="my-3 flex flex-wrap gap-3">{result.profileIds.map(id => <li key={id} className="flex items-center gap-2 text-sm font-semibold">
          <Image unoptimized src={bleachPortraitPath(id)} width={43} height={50} alt="" className="rounded-md" />{copy(bleachPresentation(id)!.name[locale])}
        </li>)}</ul>
        <p className="text-sm leading-7">{zh ? copy("按一护、露琪亚、蓝染、白哉、织姬、浦原、剑八顺序：") : "In order: Ichigo, Rukia, Aizen, Byakuya, Orihime, Urahara, Kenpachi: "}{quiz.directions.map(d => result.counts[d.id]).join(zh ? copy("、") : ", ")}{zh ? copy("。所有最高计数都保留。") : ". Every highest count is kept."}</p>
        <details className="mt-2 text-sm"><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("查看可复算答卷（第1–21题）") : "Reproduce this answer sheet (questions 1–21)"}</summary><p className="leading-7 [overflow-wrap:anywhere]">{sample.options.join(" · ")}</p></details>
      </article>;
    })}</div>
  </section>;
}
