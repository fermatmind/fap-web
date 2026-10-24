"use client";

import { useId } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

/** New teaching material, independent of the scored bank. No answers are fetched. */
export function IqProcessPractice({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  const id = useId();
  return <Card data-testid="iq-process-practice">
    <CardHeader><CardTitle>{zh ? "练习推理过程" : "Practise the reasoning process"}</CardTitle></CardHeader>
    <CardContent className="space-y-4 text-sm leading-6">
      <p>{zh ? "以下是新造的教学示例，不是测评原题，不计分。练习熟练度不等于一般智力提升。无需AI也能完成。" : "These newly created teaching examples are not test items and are not scored. Practice fluency does not establish improved general intelligence. No AI is needed."}</p>
      <fieldset className="space-y-2 rounded-xl border border-[var(--fm-border)] p-4">
        <legend className="px-1 font-semibold">{zh ? "先回顾作答条件（可选）" : "Review the conditions (optional)"}</legend>
        {(zh ? ["有中断或疲劳", "图形显示不清楚", "以前做过相似题型"] : ["Interruptions or fatigue", "Images were unclear", "Experience with similar tasks"]).map((label, index) => <label key={label} className="flex min-h-11 items-center gap-3" htmlFor={`${id}-condition-${index}`}>
          <input id={`${id}-condition-${index}`} type="checkbox" className="h-5 w-5 shrink-0" />{label}
        </label>)}
      </fieldset>
      <section className="space-y-3">
        <h3 className="font-semibold">{zh ? "1. 一次只改变一个特征" : "1. Change one feature at a time"}</h3>
        <svg viewBox="0 0 300 100" className="w-full max-w-sm rounded-xl bg-slate-50 text-slate-800" role="img" aria-labelledby={`${id}-diagram`}>
          <title id={`${id}-diagram`}>{zh ? "原创示意：一个圆、两个圆、三个圆；每组增加一个，形状和大小不变" : "Original example: one, two, then three circles; add one each time while keeping shape and size unchanged"}</title>
          {[0, 1, 2].map((group) => <g key={group}>{Array.from({ length: group + 1 }, (_, index) => <circle key={index} cx={35 + group * 90 + index * 21 - group * 10} cy="48" r="8" fill="none" stroke="currentColor" strokeWidth="2" />)}</g>)}
        </svg>
        <p>{zh ? "文字版：第1组1个圆，第2组2个圆，第3组3个圆。先列数量、形状、大小，写下哪一项变化，再画出符合自己规则的第4组。" : "Text version: group 1 has one circle, group 2 two, group 3 three. List number, shape and size, identify what changes, then draw a fourth group consistent with your rule."}</p>
        <details className="rounded-xl border border-[var(--fm-border)] p-3"><summary className="min-h-11 cursor-pointer font-medium">{zh ? "查看一种讲解" : "Show one explanation"}</summary><p className="mt-2">{zh ? "如果规则是每组增加1个，下一组是4个圆。把规则写成一句话，并检查前三组都成立。有限例子可能支持其他规则；不要把第一个猜测当唯一答案。" : "Under the rule ‘add one circle each time’, the next group has four circles. State the rule in one sentence and check it against all three groups. Finite examples may support other rules; your first hypothesis is not necessarily unique."}</p></details>
      </section>
      <section className="space-y-2">
        <h3 className="font-semibold">{zh ? "2. 用反例检查规则" : "2. Check a rule with counterexamples"}</h3>
        <p>{zh ? "自造两列：甲为2、4、6，乙为3、5、7。先提出两种可能规则，再新增一行来区分它们。例如“乙比甲大1”和“两列都每次加2”是不同约束。不要借用原题或答案。" : "Create two columns: A is 2, 4, 6 and B is 3, 5, 7. Propose two possible rules, then add a row that could distinguish them. ‘B is one greater than A’ and ‘both columns increase by two’ are different constraints. Do not use test items or answers."}</p>
      </section>
      <label className="block space-y-2" htmlFor={`${id}-notes`}><span className="font-medium">{zh ? "自己的过程记录（可选）" : "Your process notes (optional)"}</span>
        <textarea id={`${id}-notes`} className="min-h-32 w-full rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-3 text-base" placeholder={zh ? "观察 → 假设 → 检查 → 反例 → 下次怎么做" : "Observation → hypothesis → check → counterexample → next attempt"} />
      </label>
      <p>{zh ? "记录仅留在本页，刷新会丢失；不会改变成绩。避免填写个人身份信息。" : "Notes stay on this page and are lost on refresh. They do not change your score. Avoid identifying details."}</p>
      <Link className="inline-flex min-h-11 items-center underline" href={localizedPath("/tests/iq-test-intelligence-quotient-assessment", locale)}>{zh ? "阅读题本与方法说明" : "Read about the form and method"}</Link>
    </CardContent>
  </Card>;
}
