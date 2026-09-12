import styles from "../AssessmentTake.module.css";
import { useMemo, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type LikertOption = {
  code: string;
  text: string;
};

const SIZE_CLASSES = [
  "h-14 w-14 sm:h-16 sm:w-16",
  "h-12 w-12 sm:h-14 sm:w-14",
  "h-11 w-11 sm:h-12 sm:w-12",
  "h-12 w-12 sm:h-14 sm:w-14",
  "h-14 w-14 sm:h-16 sm:w-16",
] as const;

const RESPONSE_EXPRESSIONS = [
  { eyes: "M20 30Q25 21 30 30M50 30Q55 21 60 30", mouth: "M22 43C30 59 50 59 58 43" },
  { eyes: "M25 25V32M55 25V32", mouth: "M28 47Q40 56 52 47" },
  { eyes: "M19 27H30M53 24V32", mouth: "M30 48Q35 43 40 48T50 48" },
  { eyes: "M20 29H30M50 29H60", mouth: "M30 51 50 46" },
  { eyes: "M20 24 29 29 20 34M60 24 51 29 60 34", mouth: "M28 52Q40 40 52 52" },
] as const;

function normalizeOptions(options: LikertOption[]): LikertOption[] {
  return options
    .filter((option) => option.code.trim().length > 0)
    .map((option) => ({
      code: option.code.trim(),
      text: option.text.trim() || option.code.trim(),
    }));
}

export function V2LikertScale({
  questionId,
  options,
  value,
  disabled = false,
  onChange,
  appearance = "default",
  labelledBy,
  positiveEnd = "first",
}: {
  questionId: string;
  options: LikertOption[];
  value?: string;
  disabled?: boolean;
  onChange: (code: string) => void;
  appearance?: "default" | "cards";
  labelledBy?: string;
  positiveEnd?: "first" | "last";
}) {
  const normalized = useMemo(() => normalizeOptions(options), [options]);
  if (normalized.length !== 5) return null;

  const moveByArrow = (index: number, event: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = normalized[Math.min(index + 1, normalized.length - 1)];
      if (next) onChange(next.code);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev = normalized[Math.max(index - 1, 0)];
      if (prev) onChange(prev.code);
    }
  };

  if (appearance === "cards") {
    return (
      <div className={styles.options} role="radiogroup" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : `v2-likert-options-${questionId}`}>
        {normalized.map((option, index) => {
          const selected = value === option.code;
          const tone = positiveEnd === "first" ? index : normalized.length - 1 - index;
          const expression = RESPONSE_EXPRESSIONS[tone];
          return (
            <button
              key={option.code}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.text}
              disabled={disabled}
              onClick={() => onChange(option.code)}
              onKeyDown={(event) => moveByArrow(index, event)}
              className={styles.option}
              data-tone={tone}
            >
              <svg className={styles.optionGlyph} viewBox="0 0 80 76" aria-hidden="true" focusable="false">
                <g className={styles.avatarMotion} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path className={styles.expressionEyes} d={expression.eyes} />
                  <path d={expression.mouth} />
                </g>
              </svg>
              <span className={styles.optionLabel}>{option.text}</span>
              <svg className={styles.selectedMark} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="m5 10 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-[var(--fm-gap-sm)]" role="radiogroup" aria-label={`v2-likert-options-${questionId}`}>
      <div className="hidden items-center justify-between gap-[var(--fm-gap-sm)] text-xs text-[var(--fm-text-muted)] sm:flex">
        <span>{normalized[0]?.text}</span>
        <span>{normalized[normalized.length - 1]?.text}</span>
      </div>

      <div className="fm-v2-likert-grid">
        {normalized.map((option, idx) => {
          const selected = value === option.code;

          return (
            <button
              key={option.code}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.text}
              disabled={disabled}
              onClick={() => onChange(option.code)}
              onKeyDown={(event) => moveByArrow(idx, event)}
              className={cn(
                "rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)]",
                "min-h-[44px] min-w-[44px]",
                SIZE_CLASSES[idx] ?? "h-12 w-12",
                selected
                  ? "border-[var(--fm-trust-blue)] bg-[var(--fm-trust-blue)] text-white shadow-[var(--fm-shadow-md)]"
                  : "border-[var(--fm-border)] bg-white text-[var(--fm-text-muted)] hover:border-[var(--fm-trust-blue)]"
              )}
            >
              <span className="sr-only">{option.text}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-[var(--fm-gap-sm)] text-xs text-[var(--fm-text-muted)] sm:hidden">
        <span>{normalized[0]?.text}</span>
        <span>{normalized[normalized.length - 1]?.text}</span>
      </div>
    </div>
  );
}
