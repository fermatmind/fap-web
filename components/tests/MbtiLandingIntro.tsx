"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
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
  choices: Choice[];
  disabled: boolean;
};

export function MbtiLandingIntro({ locale, title, choices, disabled }: Props) {
  const zh = locale === "zh";
  const [selectedKey, setSelectedKey] = useState(choices[0]?.key);
  const selected = choices.find((choice) => choice.key === selectedKey) ?? choices[0];
  return <section id="what-it-is" className={styles.hero}>
    <div className={styles.heroInner}>
      <div className={styles.heroCopy}>
        <h1>{title}</h1>
        <div className={styles.typeArtwork} aria-label={zh ? "四组 MBTI 偏好示意，不代表你的测试结果" : "Four MBTI preference pairs, not your test results"}>
          {[['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']].map(([a, b], index) => <div className={styles.letterPair} key={a}><span className={styles.pairIndex}>0{index + 1}</span><span className={styles.frontLetter}>{a}</span><span className={styles.backLetter}>{b}</span></div>)}
        </div>
      </div>
      <div id="choose-version" className={styles.startPanel} data-testid="mbti-landing-entry-cta-group">
        <h2>{zh ? "准备好认识自己了吗？" : "Ready to meet yourself?"}</h2>
        {disabled || !selected ? <p role="status" className={styles.unavailable}>{zh ? "测试暂不可用，请稍后再试。" : "This test is temporarily unavailable. Please try again later."}</p> : <div data-testid="mbti-ads-primary-whitelist">
          <fieldset className={styles.versions} aria-label={zh ? "测试版本" : "Test version"}>
            {choices.map((choice) => <label className={styles.version} key={choice.key}>
              <input type="radio" name="mbti-version" value={choice.key} checked={choice.key === selected.key} onChange={() => setSelectedKey(choice.key)} />
              <span><strong>{choice.label}</strong><small>{choice.summary}</small></span>
              <span className={styles.radioMark} aria-hidden>{choice.key === selected.key ? <Check size={14} /> : null}</span>
            </label>)}
          </fieldset>
          <TrackedEntryCtaLink className={styles.startButton} href={selected.href} eventProperties={selected.eventProperties ?? {}} data-testid={selected.testId}>
            {selected.ctaLabel}<ArrowRight size={19} aria-hidden />
          </TrackedEntryCtaLink>
        </div>}
      </div>
    </div>
  </section>;
}
