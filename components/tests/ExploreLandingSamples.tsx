"use client";

import { useState, type ReactNode } from "react";
import styles from "./explore-landing-samples.module.css";

export function ExploreLandingSamples({ label, names, children, tone }: { label: string; names: readonly string[]; children: ReactNode[]; tone?: "neon" | "night" | "plum" }) {
  const [active, setActive] = useState(0);
  return <section className={styles.sample} data-explore-samples data-sample-tone={tone}>
    <p className={styles.label}>{label}</p>
    <div className={styles.switcher} role="group" aria-label={label}>
      {names.map((name, index) => <button type="button" key={name} data-ent-sample-choice aria-pressed={index === active}
        onClick={() => setActive(index)}>{name}</button>)}
    </div>
    <div aria-live="polite" className={styles.panel}>{children[active]}</div>
  </section>;
}

export function ExploreChoicePreview({ label, prompt, options, notes, stimulus }: { label: string; prompt: string; options: readonly string[]; notes: readonly string[]; stimulus?: ReactNode }) {
  const [selected, setSelected] = useState<number | null>(null);
  return <div className={styles.choice} data-explore-choice>
    <p className={styles.label}>{label}</p>{stimulus}<p className={styles.prompt}>{prompt}</p>
    <div className={styles.choiceButtons} role="group" aria-label={prompt}>
      {options.map((option, index) => <button key={option} type="button" aria-pressed={selected === index}
        onClick={() => setSelected(index)}><strong>{String.fromCharCode(65 + index)}</strong>{option}</button>)}
    </div>
    <p className={styles.feedback} aria-live="polite">{selected !== null && notes[selected]}</p>
  </div>;
}
