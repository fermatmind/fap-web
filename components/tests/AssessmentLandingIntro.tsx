import { ArrowRight } from "lucide-react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { MbtiHeroScene } from "./MbtiHeroScene";
import styles from "./mbti-preview.module.css";

export type AssessmentLandingChoice = {
  key: string;
  label: string;
  href: string | null;
  testId: string;
  eventProperties?: Record<string, string>;
};

export function AssessmentLandingIntro({ locale, title, choices, disabled }: {
  locale: "zh" | "en";
  title: string;
  choices: AssessmentLandingChoice[];
  disabled: boolean;
}) {
  const availableChoices = choices.filter((choice) => choice.href);
  return (
    <section id="what-it-is" className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}><h1>{title}</h1></div>
        <div id="choose-version" className={styles.heroActions}>
          {disabled || availableChoices.length === 0 ? (
            <p role="status" className={styles.unavailable}>{locale === "zh" ? "测试暂不可用，请稍后再试。" : "This test is temporarily unavailable. Please try again later."}</p>
          ) : (
            <div className={styles.versionActions}>
              {availableChoices.map((choice, index) => (
                <div className={styles.versionAction} key={choice.key}>
                  <TrackedEntryCtaLink href={choice.href!} data-testid={choice.testId} eventProperties={choice.eventProperties ?? {}} className={`${styles.startButton} ${index > 0 ? styles.secondaryButton : ""}`}>
                    {locale === "zh" ? choice.label.replace(/^(?:Big Five|Enneagram|RIASEC|EQ)\s*/i, "").replace(/(\d+)Q/gi, "$1 题") : choice.label}
                    <ArrowRight size={19} aria-hidden />
                  </TrackedEntryCtaLink>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MbtiHeroScene />
    </section>
  );
}
