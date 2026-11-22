"use client";

import { useState } from "react";
import type { FriendshipDisplayLocale } from "@/lib/friendship/traditional";
import { friendshipCopy, friendshipSourceLocale } from "@/lib/friendship/traditional";
import { CATEGORIES, title } from "@/lib/friendship/core";
import scores from "@/lib/friendship/score-example.json";
import { CategoryRadar } from "./CategoryRadar";
import styles from "./friendship-landing.module.css";

const sampleIds = ["friend-a", "friend-b", "friend-c"] as const;

export function FriendshipLandingSamples({ locale, copy }: {
  locale: FriendshipDisplayLocale;
  copy: readonly [label: string, explanation: string, matches: string, first: string, second: string, third: string];
}) {
  const [label, explanation, matches, ...nicknames] = copy;
  const [selected, setSelected] = useState(0);
  const localized = friendshipCopy(locale);
  const language = friendshipSourceLocale(locale);
  const entries = scores.map(({ correct, categories }, index) => ({
    id: sampleIds[index],
    nickname: nicknames[index],
    correct,
    categories,
    hidden: false,
  }));
  const sample = scores[selected];
  const fraction = `${sample.correct}/${sample.total}`;
  const score = locale === "en" ? `${fraction} ${matches}` : `${matches} ${fraction} ${locale === "zh" ? "题" : "題"}`;

  return <div className={styles.sample} aria-labelledby="friendship-sample-heading">
    <h2 id="friendship-sample-heading">{label}</h2>
    <p>{explanation}</p>
    <div role="group" aria-label={label} className={styles.sampleChoices}>
      {entries.map(({ id, nickname }, index) => <button
        type="button"
        key={id}
        data-ent-sample-choice={id}
        aria-pressed={index === selected}
        aria-controls="friendship-sample-panel"
        onClick={() => setSelected(index)}
      >{nickname}</button>)}
    </div>
    <div id="friendship-sample-panel" data-ent-sample-id={sampleIds[selected]}>
      <p className={styles.sampleScore} aria-live="polite">
        <strong>{score}</strong>
        <span>{sample.percent}% · {localized(title(sample.percent, language))}</span>
      </p>
      <CategoryRadar locale={locale} result={{ id: sampleIds[selected], categories: sample.categories, entries }} landingSample />
      <dl className={styles.categoryValues}>
        {Object.entries(sample.categories).map(([category, value]) => <div key={category}>
          <dt>{localized(CATEGORIES[category][language])}</dt>
          <dd>{value.correct}/{value.total}</dd>
        </div>)}
      </dl>
    </div>
  </div>;
}
