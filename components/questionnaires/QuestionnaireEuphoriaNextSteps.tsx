import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function QuestionnaireEuphoriaNextSteps({ locale, displayLocale = locale, mbtiHref, showAssessmentLink = true }: { showAssessmentLink?: boolean; locale: Locale; displayLocale?: DisplayLocale; mbtiHref: string }) {
  const zh = locale === "zh";
  const traditional = displayLocale === "zh-TW";
  return <section className="mt-10 border-t pt-7" data-euphoria-next-steps>
    <h3 className="text-xl font-semibold">{traditional ? "比較角色路線，再自己決定下一步" : zh ? "比较角色路线，再自己选择下一步" : "Compare character routes, then choose what comes next"}</h3>
    <p className="my-4 leading-8">{traditional
      ? "可以重讀八份完整指南，想想你在現實中遇過的類似情境。角色次數不能用來判斷人格類型、關係走向或心理健康。也可以在這裡結束，分享由你決定。"
      : zh
        ? "可以回看八份完整指南，比较题目选项和自己遇到的类似情境。角色次数不用于判断人格类型、关系走向或心理健康。也可以在这里结束，分享由你决定。"
        : "Compare the eight full guides with situations you have actually encountered. Character counts do not determine personality types, relationship outcomes or mental health. You can finish here and share only if you want to."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${displayLocale}/tests/explore/euphoria-character-quiz#questionnaire-results`}>{traditional ? "比較八份完整角色指南" : zh ? "比较八份完整角色指南" : "Compare all eight full character guides"}</Link><br />
    {showAssessmentLink && <><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={mbtiHref}>{zh ? "可选：另做MBTI偏好探索" : "Optional: explore MBTI preferences separately"}</Link><br /></>}
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${displayLocale}/tests#more-tests`}>{traditional ? "回到所有測驗" : zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
