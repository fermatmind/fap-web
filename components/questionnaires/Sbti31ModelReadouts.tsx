import type { Locale } from "@/lib/i18n/locales";
import type { Sbti31Questionnaire, Sbti31Result } from "@/lib/questionnaires/sbti31";
import styles from "./Sbti31Result.module.css";

const groups = [
  { id: "S", zh: "自我", en: "Self" },
  { id: "E", zh: "情感", en: "Emotion" },
  { id: "A", zh: "态度", en: "Attitude" },
  { id: "Ac", zh: "行动", en: "Action" },
  { id: "So", zh: "社交", en: "Social" },
] as const;
const bands = {
  zh: { L: "偏低", M: "中段", H: "偏高" },
  en: { L: "Lower band", M: "Middle band", H: "Higher band" },
};

export function Sbti31ModelReadouts({ quiz, profile, result, locale }: {
  quiz: Sbti31Questionnaire;
  profile: Sbti31Questionnaire["profiles"][number];
  result: Extract<Sbti31Result, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  const cards = result.dimensionCards.map((card, index) => ({
    ...card,
    title: quiz.directions[index].title[locale],
    portraitReading: profile.sections[1].paragraphs[index][locale],
  }));

  return <>
    <dl className={styles.metrics}>
      <div><dt>{zh ? "原模型匹配展示值" : "Original match display"}</dt><dd data-sbti31-match>{result.matchPercent}%</dd></div>
      <div><dt>{zh ? "模型维度命中数" : "Model band matches"}</dt><dd>{15 - result.mismatchCount} / 15</dd></div>
      <div><dt>{zh ? "原版预设稀有度" : "Original preset rarity"}</dt><dd>{result.presetRarity}</dd></div>
    </dl>
    <p className="my-4 text-sm leading-7">{zh ? "预设稀有度不是人群比例，匹配展示值不是准确率。原文的夸张属于趣味叙述。" : "Preset rarity is not a population proportion, and the match display is not accuracy. Exaggeration in the original portrait is part of its humour."}</p>
    <section className={styles.dimensions}>
      <h3 className="text-2xl font-semibold">{zh ? "本次十五维模型读数" : "Your fifteen model readouts"}</h3>
      <p className={styles.dimensionIntro}>{zh ? "每项先显示你的本次读数，再附上这幅画像的原版解释。五组分别阅读。" : "Each item shows your readout first, followed by the original interpretation for this portrait. Read each group on its own."}</p>
      <div className={styles.groups}>
        {groups.map(group => <section key={group.id} className={styles.group} data-sbti31-group={group.id}>
          <h4>{group[locale]}</h4>
          <div className={styles.groupItems}>
            {cards.filter(card => card.group === group.id).map(card => <div key={card.key} className={styles.dimension} data-sbti31-dimension={card.key}>
              <p className={styles.dimensionHeader}>
                <strong>{card.title}</strong>
                <span className={styles.dimensionValue}><span data-sbti31-score>{card.score}</span> / 100 <span className={styles.band}>{bands[locale][card.band]}</span></span>
              </p>
              <div className={styles.track} aria-hidden="true"><span style={{ width: `${card.score}%` }} /></div>
              <p>{card.portraitReading}</p>
            </div>)}
          </div>
        </section>)}
      </div>
    </section>
  </>;
}
