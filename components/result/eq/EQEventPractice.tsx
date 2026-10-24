"use client";

import { useId, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";

const STEPS = {
  zh: ["触发：实际发生了什么？", "感受：给情绪命名", "想法：我当时怎样解释？", "行为：我实际说了或做了什么？", "反馈：对方实际说了什么？还有什么未知？", "反例：哪次经历与报告描述不一致？"],
  en: ["Trigger: what actually happened?", "Feelings: name the emotion", "Thoughts: how did I interpret it?", "Actions: what did I say or do?", "Feedback: what did they actually say? What is unknown?", "Counterexample: when did the report description not fit?"],
};
const PRACTICES = {
  zh: [
    ["暂停", "先停一小会儿，命名感受，再决定是否现在回应。记录自己是否多了一个选择。"],
    ["表达需求", "试说：‘当我看到/听到……，我感到……，我希望……。你愿意……吗？’用可观察事实替代‘你总是故意……’。"],
    ["寻求反馈", "试问：‘刚才我的表达让你听到什么？哪句话可以更清楚？’记录实际反馈；不把沉默推断为同意或敌意。"],
  ],
  en: [
    ["Pause", "Pause briefly, name the feeling, then decide whether to respond now. Observe whether this gives you another response option."],
    ["Express a need", "Try: ‘When I saw/heard …, I felt …, and I need … . Would you be willing to … ?’ Use observable facts instead of ‘You always do this on purpose’."],
    ["Seek feedback", "Ask: ‘What did you hear in what I said? What could I make clearer?’ Record the actual feedback. Silence alone does not establish agreement or hostility."],
  ],
};

export function EQEventPractice({ locale }: { locale: Locale }) {
  const id = useId();
  const [practice, setPractice] = useState(0);
  const zh = locale === "zh";
  return <section data-testid="eq-event-practice" className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800 sm:p-6">
    <h2 className="text-lg font-semibold">{zh ? "用一件近期小事练习" : "Practise with one recent event"}</h2>
    <p>{zh ? "自己选择一次近期的情绪或沟通事件。可参考报告中一到两个相关维度；这是一份个人反思记录，不是新的测评分数，无需AI。" : "Choose a recent emotional or communication event. You may refer to one or two relevant report dimensions. This is personal reflection, not a new assessment score. No AI is needed."}</p>
    <div className="grid gap-4 sm:grid-cols-2">{STEPS[locale].map((label, index) => <label className="block space-y-2" key={label} htmlFor={`${id}-${index}`}>
      <span className="font-medium">{label}</span><textarea id={`${id}-${index}`} className="min-h-24 w-full rounded-lg border border-slate-300 bg-white p-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" />
    </label>)}</div>
    <fieldset className="space-y-2">
      <legend className="font-medium">{zh ? "选择这次只做的一项练习" : "Choose one practice for this event"}</legend>
      {PRACTICES[locale].map(([label], index) => <label key={label} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-300 p-3" htmlFor={`${id}-practice-${index}`}>
        <input id={`${id}-practice-${index}`} type="radio" name={`${id}-practice`} value={index} checked={practice === index} onChange={() => setPractice(index)} className="h-5 w-5 shrink-0" />{label}
      </label>)}
    </fieldset>
    <p role="status" className="rounded-lg bg-slate-50 p-4">{PRACTICES[locale][practice][1]}</p>
    <p>{zh ? "反例提醒：对方回复慢可能有多种原因，不能由你的自评分数判断对方动机。用实际行为和反馈看练习是否有帮助，不用刷高分证明进步。" : "Counterexample: a delayed reply can have many explanations. Your self-report score cannot establish another person’s motives. Judge the practice through behavior and feedback, not by obtaining a higher score."}</p>
    <p className="text-slate-600">{zh ? "这些文字只留在本页，刷新会丢失，不发送给Agent或第三方，也不写回报告。避免输入姓名等身份信息。" : "These notes stay on this page and are lost on refresh. They are not sent to the Agent or third parties and do not change the report. Avoid names or other identifying details."}</p>
  </section>;
}
