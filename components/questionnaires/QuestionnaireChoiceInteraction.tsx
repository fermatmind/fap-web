"use client";

import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { selectedChoiceIds } from "@/lib/questionnaires/orderedChoices";

export function QuestionnaireChoiceInteraction({ question, value, locale, onChange }: { question: Questionnaire["questions"][number]; value?: string; locale: Locale; onChange: (value: string) => void }) {
  const zh = locale === "zh", selected = selectedChoiceIds(question, value) ?? [], rank = question.interaction === "rank";
  function toggle(id: string) {
    if (selected.includes(id)) onChange(JSON.stringify(selected.filter(value => value !== id)));
    else if (selected.length < (question.maximumSelections ?? question.options.length)) onChange(JSON.stringify([...selected, id]));
  }
  return <fieldset className="mt-5 space-y-3" data-choice-interaction={question.interaction}>
    <legend className="text-sm leading-7">{rank ? (zh ? `按从最贴近到最不贴近的顺序点击全部${question.options.length}项；再次点击可移除后重选。` : `Tap all ${question.options.length} options from closest to least like you. Tap again to remove an option and adjust the order.`) : (zh ? `可选${question.minimumSelections ?? 1}至${question.maximumSelections ?? question.options.length}项。` : `Select ${question.minimumSelections ?? 1} to ${question.maximumSelections ?? question.options.length} options.`)}</legend>
    {question.options.map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-slate-300 p-4 has-[:checked]:border-violet-700 has-[:checked]:bg-violet-50">
      <input type="checkbox" className="size-5 shrink-0 accent-violet-700" checked={selected.includes(option.id)} onChange={() => toggle(option.id)} />
      {rank && <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold">{selected.includes(option.id) ? selected.indexOf(option.id) + 1 : "—"}</span>}
      <span className="min-w-0 leading-7 [overflow-wrap:anywhere]">{option.label[locale]}{rank && selected.includes(option.id) && <span className="sr-only">{zh ? `，第${selected.indexOf(option.id) + 1}位` : `, rank ${selected.indexOf(option.id) + 1}`}</span>}</span>
    </label>)}
    <p role="status" className="text-sm leading-7">{zh ? `已选${selected.length} / ${question.options.length}项` : `${selected.length} / ${question.options.length} selected`}</p>
    <button type="button" className="min-h-11 px-2 underline" onClick={() => onChange("")}>{zh ? "清空本题选择" : "Clear this question"}</button>
  </fieldset>;
}
