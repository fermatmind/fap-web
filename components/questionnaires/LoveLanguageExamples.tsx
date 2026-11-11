"use client";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";

import type { Locale } from "@/lib/i18n/locales";

const examples = [
  { id: "words", name: { zh: "肯定的言语", en: "Words of affirmation" }, giving: { zh: "我会具体说出感谢的原因。", en: "I name the specific thing I appreciate." }, receiving: { zh: "我希望听见对方具体欣赏什么。", en: "I value hearing what someone appreciates specifically." } },
  { id: "acts", name: { zh: "服务的行动", en: "Acts of service" }, giving: { zh: "我会先问哪件小事能帮上忙。", en: "I ask which small task would help." }, receiving: { zh: "我希望对方先确认我需要哪种帮助。", en: "I value help that checks what I actually need." } },
  { id: "gifts", name: { zh: "用心的礼物", en: "Thoughtful gifts" }, giving: { zh: "我会选一件与对方兴趣有关的小东西。", en: "I choose a small item linked to their interests." }, receiving: { zh: "我珍惜对方记得我的兴趣，不看价格。", en: "I value being remembered, rather than the price." } },
  { id: "time", name: { zh: "专注的时间", en: "Quality time" }, giving: { zh: "我会约一段双方愿意专注相处的时间。", en: "I offer time we both want to spend together." }, receiving: { zh: "我希望有一段不被打断的共同时间。", en: "I value shared time with fewer interruptions." } },
  { id: "touch", name: { zh: "自愿的接触", en: "Welcome physical touch" }, giving: { zh: "我会先确认对方是否愿意有身体接触。", en: "I check whether physical affection is welcome." }, receiving: { zh: "我在愿意且舒服时，可能重视拥抱等接触。", en: "When welcome and comfortable, a hug may matter to me." } },
];
export function LoveLanguageExamples({ locale }: { locale: Locale }) {
  const { displayText } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <div data-love-language-examples className="my-5 space-y-3">
    <h3 className="text-xl font-semibold">{zh ? displayText("并排看一个表达与接收的例子") : "Compare giving and receiving in an everyday example"}</h3>
    <p className="leading-7">{zh ? displayText("五种方式可以同时重要。两侧不是付出差值；选一个愿意讨论的小例子，也可以不联系任何人。") : "All five ways can matter. The sides are not an effort gap to subtract. Choose an example to discuss if you wish; no contact is required."}</p>
    {examples.map(example => <details key={example.id} className="rounded-lg border border-rose-200 p-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold">{displayText(example.name[locale])}</summary><dl className="grid gap-4 py-3 sm:grid-cols-2"><div><dt className="font-semibold">{zh ? displayText("表达") : "Giving"}</dt><dd className="mt-1 leading-7">{displayText(example.giving[locale])}</dd></div><div><dt className="font-semibold">{zh ? displayText("接收") : "Receiving"}</dt><dd className="mt-1 leading-7">{displayText(example.receiving[locale])}</dd></div></dl></details>)}
  </div>;
}
