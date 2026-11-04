"use client";
import type { CSSProperties, ReactNode } from "react";
import { LikertResponseGlyph } from "@/components/quiz/immersive/V2LikertScale";
import takeStyles from "@/components/quiz/AssessmentTake.module.css";
import styles from "./QuestionnaireTake.module.css";

/** Shared presentation only: option IDs and change handlers belong to the engine. */
export function QuestionnaireTakeOptions({ questionId, prompt, options, value, onChange, scale = false, positiveLast = false }: { questionId: string; prompt: string; options: { id: string; label: ReactNode; unscored?: boolean }[]; value?: string; onChange: (id: string) => void; scale?: boolean; positiveLast?: boolean }) {
  const scored = options.filter(option => !option.unscored).length;
  const template = scale ? "scale" : options.length === 2 ? "pair" : "scenario";
  return <fieldset className={styles.options} data-take-template={template} style={{ "--take-option-count": scale ? scored || options.length : options.length } as CSSProperties}>
    <legend className="sr-only">{prompt}</legend>
    {options.map((option, index) => {
      const scoredIndex = options.slice(0, index).filter(item => !item.unscored).length;
      const tone = positiveLast ? scored - 1 - scoredIndex : scoredIndex;
      return <label key={option.id} className={scale ? takeStyles.option : takeStyles.pairOption} data-unscored={option.unscored ? "true" : undefined} data-tone={scored === 5 && !option.unscored ? tone : undefined}>
        <input type="radio" name={questionId} value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} />
        {scale && scored === 5 && !option.unscored ? <LikertResponseGlyph tone={tone} /> : !scale && <span className={styles.optionCode} aria-hidden="true">{String.fromCharCode(65 + index)}</span>}
        <span className={scale ? takeStyles.optionLabel : undefined}>{option.label}</span>
      </label>;
    })}
  </fieldset>;
}
