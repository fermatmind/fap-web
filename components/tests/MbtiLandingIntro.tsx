"use client";

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
  locale: "zh" | "en";
  title: string;
  heroImage?: string;
  choices: Choice[];
  disabled: boolean;
};

export function MbtiLandingIntro({ locale, title, heroImage, choices, disabled }: Props) {
  const zh = locale === "zh";
  return (
    <section id="what-it-is" className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <h1>{title}</h1>
        </div>
        <div id="choose-version" className={styles.heroActions} data-testid="mbti-landing-entry-cta-group">
          {disabled || choices.length === 0 ? (
            <p role="status" className={styles.unavailable}>{zh ? "测试暂不可用，请稍后再试。" : "This test is temporarily unavailable. Please try again later."}</p>
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
                    {zh ? choice.label.replace(/MBTI\s*/i, "").replace(/(\d+)Q/i, "$1 题") : choice.label}
                    <ArrowRight size={19} aria-hidden />
                  </TrackedEntryCtaLink>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {heroImage ? <AssessmentHeroArtwork src={heroImage} /> : null}
    </section>
  );
}
