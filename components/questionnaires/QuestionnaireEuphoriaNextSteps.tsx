import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireEuphoriaNextSteps({ locale, mbtiHref }: { locale: Locale; mbtiHref: string }) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7" data-euphoria-next-steps>
    <h3 className="text-xl font-semibold">{zh ? "比较角色路线，再自己选择下一步" : "Compare character routes, then choose what comes next"}</h3>
    <p className="my-4 leading-8">{zh
      ? "先回看八份完整指南，比较具体选项和自己的真实情境；不必接受角色标签。若想另用偏好框架探索，可独立完整作答MBTI；本次角色次数不换算成MBTI、关系预测或心理健康结论。也可以在这里结束，无需分享。"
      : "Reread the eight full guides and compare concrete options with your actual situation; you do not have to accept a character label. For a separate preference framework, MBTI needs its own full attempt. These character counts never convert into MBTI, relationship predictions or mental-health conclusions. You can finish here without sharing."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/euphoria-character-quiz#questionnaire-results`}>{zh ? "比较八份完整角色指南" : "Compare all eight full character guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={mbtiHref}>{zh ? "可选：另做MBTI偏好探索" : "Optional: explore MBTI preferences separately"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
