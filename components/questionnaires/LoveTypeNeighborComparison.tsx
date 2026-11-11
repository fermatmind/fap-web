"use client";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Reply, HandHeart, HeartHandshake, Map, Sparkles, Waves, ListChecks } from "lucide-react";
import { LOVE_TYPE16_AXES } from "@/lib/questionnaires/loveType16";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

const symbols = { l: ArrowUpRight, f: Reply, c: HandHeart, a: HeartHandshake, r: Map, p: Sparkles, o: Waves, e: ListChecks };
export function LoveTypeNeighborComparison({ quiz, id, locale }: { quiz: Questionnaire; id: string; locale: Locale }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const [axisIndex, setAxisIndex] = useState(0), zh = locale === "zh";
  const neighbor = [...id].map((side, index) => index === axisIndex ? LOVE_TYPE16_AXES[index].sides.find(s => s !== side)! : side).join("");
  const profile = quiz.profiles.find(p => p.id === neighbor)!;
  return <section data-love-neighbor={id} className="my-5 space-y-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4">
    <div className="grid grid-cols-2 gap-3" aria-label={zh ? displayText(`${id.toUpperCase()}的四轴主题形象`) : `Four preference symbols for ${id.toUpperCase()}`}>{[...id].map(side => {
      const Icon = symbols[side as keyof typeof symbols];
      return <div key={side} className="flex min-w-0 items-center gap-2 rounded-lg bg-white p-3"><Icon aria-hidden="true" className="size-7 shrink-0 text-rose-800" /><span className="text-sm leading-6">{quiz.directions.find(d => d.id === side)!.title[locale]}<span className="block font-bold">{side.toUpperCase()}</span></span></div>;
    })}</div>
    <h4 className="text-lg font-semibold">{zh ? displayText("只换一个字母，比较相邻组合") : "Change one letter to compare a neighboring code"}</h4>
    <label className="block font-medium">{zh ? displayText("选择要比较的轴") : "Choose a preference pair"}<select className="mt-2 min-h-11 w-full rounded-lg border bg-white p-2" value={axisIndex} onChange={event => setAxisIndex(Number(event.target.value))}>{LOVE_TYPE16_AXES.map((axis, i) => <option key={axis.id} value={i}>{displayText(axis.title[locale])}</option>)}</select></label>
    <p className="leading-7">{zh ? displayText(`${id.toUpperCase()} 与 ${neighbor.toUpperCase()} 只在“${LOVE_TYPE16_AXES[axisIndex].title[locale]}”这一轴不同；其他三个字母相同。切换对照不会改变本次结果。`) : `${id.toUpperCase()} and ${neighbor.toUpperCase()} differ only on “${LOVE_TYPE16_AXES[axisIndex].title[locale]}”; the other three letters are unchanged. Comparing does not change your result.`}</p>
    <Link prefetch={false} target="_blank" rel="noopener" className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, neighbor)}>{profile.title[locale]} · {zh ? displayText("打开相邻指南（新标签页）") : "Open neighboring guide (new tab)"}</Link>
  </section>;
}
