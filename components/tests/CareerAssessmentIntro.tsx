import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import type { DisplayLocale } from "@/lib/i18n/locales";
import type { AssessmentLandingChoice } from "./AssessmentLandingIntro";
import base from "./mbti-preview.module.css";
import styles from "./career-assessment-intro.module.css";

export function CareerAssessmentIntro({ locale, title, description, choice }: {
  locale: DisplayLocale; title: string; description: string; choice: AssessmentLandingChoice;
}) {
  const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  const headingParts = locale === "en" ? null : title.split("：");
  const headline = headingParts?.[1]?.split("，");
  const readingLocale = locale === "zh-TW" ? "zh" : locale;
  return <section className={`${base.hero} ${styles.hero}`} aria-labelledby="career-assessment-title">
    <div className={styles.inner}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{t("费马职业测试 · 94 题", "費馬職涯測驗 · 94 題", "FERMATMIND CAREER ASSESSMENT · 94 QUESTIONS")}</p>
        <h1 id="career-assessment-title">{headingParts?.length === 2 ? <>{headingParts[0]}：<span className={styles.headlineLine}>{headline?.[0]}，<wbr /><span className={styles.headlinePhrase}>{headline?.[1]}</span></span></> : title}</h1>
        <p className={styles.description}>{description}</p>
        <ul className={styles.benefits}>
          {[
            t("职业兴趣：发现更吸引你的工作活动", "職涯興趣：發現更吸引你的工作活動", "Interests: discover which work activities draw you in"),
            t("工作方式：理清独立、协作与任务切换的偏好", "工作方式：釐清獨立作業、協作與任務切換的偏好", "Work style: clarify your preferences for focus and collaboration"),
            t("工作条件：明确工时、学习支持等择业重点", "工作條件：釐清工時、學習支持等擇業重點", "Working conditions: identify what to ask about hours and support"),
          ].map(text => <li key={text}><Check size={18} aria-hidden />{text}</li>)}
        </ul>
        <div className={styles.actions}>
          <TrackedEntryCtaLink href={choice.href!} prefetch={false} data-testid={choice.testId} eventProperties={{}} className={styles.cta}>
            {choice.label}<ArrowRight size={19} aria-hidden />
          </TrackedEntryCtaLink>
          <Link href={`/${readingLocale}/career/assessment/sample`} prefetch={false} className={styles.sample}>{t("先看看报告示例", "查看報告範例（簡體中文）", "Explore a sample report")} ↗</Link>
        </div>
        <p className={styles.note}>{t("约 12–15 分钟 · 无需注册 · 兴趣概览免费", "約 12–15 分鐘 · 無須註冊 · 興趣概覽免費", "About 12–15 minutes · No signup · Free interest overview")}</p>
        <p className={styles.pricing}>{t("完整深度报告可选付费，付款前可查看内容与价格。", "完整深度報告可選購，付款前可查看內容與價格。", "The deep report is an optional purchase. Review its contents and price before paying.")}</p>
        {locale === "zh-TW" && <p className={styles.pricing}>目前作答使用簡體中文題本。</p>}
      </div>
      <div className={styles.visual}>
        <div className={styles.orbit} aria-hidden />
        <Image src="/images/riasec/ai-career-interests.webp" alt="" width={960} height={640} sizes="(max-width: 780px) 90vw, 50vw" priority />
        <p>{t("了解自己，是探索工作的起点。", "了解自己，是探索工作的起點。", "A clearer picture of you. A better starting point for exploring work.")}</p>
      </div>
    </div>
  </section>;
}
