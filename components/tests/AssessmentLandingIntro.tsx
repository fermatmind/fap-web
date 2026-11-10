import type { AssessmentArtwork } from "@/lib/tests/assessmentLandingUi";
import { ArrowRight } from "lucide-react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { AssessmentHeroArtwork } from "./AssessmentHeroArtwork";
import styles from "./mbti-preview.module.css";

export type AssessmentLandingChoice = {
  key: string;
  label: string;
  href: string | null;
  testId: string;
  eventProperties?: Record<string, string>;
  summary?: string;
};

export function AssessmentLandingIntro({ locale, title, heroArtwork, description, choices, disabled, showChoiceSummaries = false }: {
  locale: "zh" | "en" | "zh-TW";
  title: string;
  heroArtwork?: AssessmentArtwork;
  description?: string;
  choices: AssessmentLandingChoice[];
  disabled: boolean;
  showChoiceSummaries?: boolean;
}) {
  const availableChoices = choices.filter((choice) => choice.href);
  return (
    <section id="what-it-is" className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        <div id="choose-version" className={styles.heroActions}>
          {disabled || availableChoices.length === 0 ? (
            <p role="status" className={styles.unavailable}>{locale === "zh-TW" ? "測試暫時無法使用，請稍後再試。" : locale === "zh" ? "测试暂不可用，请稍后再试。" : "This test is temporarily unavailable. Please try again later."}</p>
          ) : (
            <div className={styles.versionActions}>
              {availableChoices.map((choice, index) => (
                <div className={styles.versionAction} key={choice.key} style={heroArtwork === "eq" ? { minWidth: "min(100%, 340px)" } : undefined}>
                  <TrackedEntryCtaLink href={choice.href!} prefetch={false} data-testid={choice.testId} eventProperties={choice.eventProperties ?? {}} className={`${styles.startButton} ${index > 0 ? styles.secondaryButton : ""}`}>
                    {locale !== "en" ? choice.label.replace(/^(?:Big Five|Enneagram|RIASEC|EQ)\s*/i, "").replace(/(\d+)Q/gi, locale === "zh-TW" ? "$1 題" : "$1 题") : choice.label}
                    <ArrowRight size={19} aria-hidden />
                  </TrackedEntryCtaLink>
                  {showChoiceSummaries && choice.summary ? <p className={styles.versionSummary}>{choice.summary}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {heroArtwork ? <AssessmentHeroArtwork theme={heroArtwork} /> : null}
    </section>
  );
}
