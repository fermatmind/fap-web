"use client";

import type { AssessmentArtwork } from "@/lib/tests/assessmentLandingUi";
import { ArrowRight } from "lucide-react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { AssessmentHeroArtwork } from "./AssessmentHeroArtwork";
import styles from "./mbti-preview.module.css";

type Choice = {
  key: string;
  label: string;
  summary: string;
  href: string;
  ctaLabel: string;
  testId: string;
  eventProperties?: Record<string, string>;
};

type Props = {
  locale: "zh" | "en" | "zh-TW";
  title: string;
  heroArtwork?: AssessmentArtwork;
  choices: Choice[];
  disabled: boolean;
  description?: string;
  showScoredReportLink?: boolean;
};

export function MbtiLandingIntro({ locale, title, heroArtwork, choices, disabled, description, showScoredReportLink }: Props) {
  const zh = locale !== "en";
  return (
    <section id="what-it-is" className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        <div id="choose-version" className={styles.heroActions} data-testid="mbti-landing-entry-cta-group">
          {disabled || choices.length === 0 ? (
            <p role="status" className={styles.unavailable}>{locale === "zh-TW" ? "測試暫時無法使用，請稍後再試。" : zh ? "测试暂不可用，请稍后再试。" : "This test is temporarily unavailable. Please try again later."}</p>
          ) : (
            <div className={styles.versionActions} data-testid="mbti-ads-primary-whitelist">
              {choices.map((choice, index) => (
                <div className={styles.versionAction} key={choice.key}>
                  <TrackedEntryCtaLink
                    className={`${styles.startButton} ${index > 0 ? styles.secondaryButton : ""}`}
                    href={choice.href}
                    eventProperties={choice.eventProperties ?? {}}
                    data-testid={choice.testId}
                  >
                    {zh ? choice.label.replace(/MBTI\s*/i, "").replace(/(\d+)Q/i, locale === "zh-TW" ? "$1 題" : "$1 题") : choice.label}
                    <ArrowRight size={19} aria-hidden />
                  </TrackedEntryCtaLink>
                  <p className={styles.versionSummary}>{choice.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {showScoredReportLink ? (
          <a className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4" href="#scored-report-example">
            {zh ? "先看实际计分的报告示例" : "See a scored result example"}
          </a>
        ) : null}
      </div>
      {heroArtwork ? <AssessmentHeroArtwork theme={heroArtwork} /> : null}
    </section>
  );
}
