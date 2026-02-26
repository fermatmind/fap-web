import { useMemo, type KeyboardEvent } from "react";
import { IqVectorSvg } from "@/components/quiz/iq/IqStemSvg";
import { cn } from "@/lib/utils";
import type { QuizVectorGraphic } from "@/lib/quiz/types";

type OptionItem = {
  code: string;
  text: string;
  svg?: QuizVectorGraphic | null;
};

const BUBBLE_SIZE_CLASSES = ["h-16 w-16", "h-14 w-14", "h-12 w-12", "h-14 w-14", "h-16 w-16"] as const;
const BUBBLE_TONE_CLASSES = [
  "border-rose-300 bg-rose-50 text-rose-700",
  "border-orange-300 bg-orange-50 text-orange-700",
  "border-slate-300 bg-slate-100 text-slate-700",
  "border-teal-300 bg-teal-50 text-teal-700",
  "border-emerald-300 bg-emerald-50 text-emerald-700",
] as const;

function normalizeOptions(options: OptionItem[]): OptionItem[] {
  return options
    .filter((option) => option.code.trim().length > 0)
    .map((option) => ({
      code: option.code.trim(),
      text: option.text.trim() || option.code.trim(),
      svg: option.svg ?? null,
    }));
}

function isBubbleMode(options: OptionItem[]): boolean {
  if (options.length !== 5) return false;
  if (options.some((option) => option.svg)) return false;
  return options.every((option) => option.text.length <= 20);
}

export function AdaptiveOptionGroup({
  questionId,
  options,
  value,
  noOptionsLabel,
  onChange,
}: {
  questionId: string;
  options: OptionItem[];
  value?: string;
  noOptionsLabel: string;
  onChange: (code: string) => void;
}) {
  const normalized = useMemo(() => normalizeOptions(options), [options]);
  const bubbleMode = isBubbleMode(normalized);

  const moveByArrow = (index: number, event: KeyboardEvent<HTMLElement>) => {
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

  if (normalized.length === 0) {
    return <p className="m-0 text-sm text-rose-700">{noOptionsLabel}</p>;
  }

  if (bubbleMode) {
    return (
      <div className="space-y-4" role="radiogroup" aria-label={`options-${questionId}`}>
        <div className="flex items-end justify-center gap-2 sm:gap-3">
          {normalized.map((option, idx) => {
            const selected = value === option.code;
            return (
              <button
                key={option.code}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={option.text}
                onClick={() => onChange(option.code)}
                onKeyDown={(event) => moveByArrow(idx, event)}
                className={cn(
                  "rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)]",
                  BUBBLE_SIZE_CLASSES[idx] ?? "h-12 w-12",
                  selected
                    ? "border-[var(--fm-trust-blue)] bg-[var(--fm-trust-blue)] text-white shadow-[var(--fm-shadow-md)]"
                    : BUBBLE_TONE_CLASSES[idx] ?? "border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-text)]"
                )}
              >
                <span className="sr-only">{option.text}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between gap-3 text-xs text-[var(--fm-text-muted)]">
          <span className="max-w-[45%]">{normalized[0]?.text}</span>
          <span className="max-w-[45%] text-right">{normalized[normalized.length - 1]?.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--fm-gap-sm)]" role="radiogroup" aria-label={`options-${questionId}`}>
      {normalized.map((option, idx) => {
        const selected = value === option.code;
        return (
          <button
            key={option.code}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.text}
            onClick={() => onChange(option.code)}
            onKeyDown={(event) => moveByArrow(idx, event)}
            className={cn(
              "flex min-h-[56px] w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)]",
              selected
                ? "border-[var(--fm-trust-blue)] bg-[var(--fm-trust-blue)] text-white shadow-[var(--fm-shadow-md)]"
                : "border-[var(--fm-border)] bg-white text-[var(--fm-text)] hover:border-[var(--fm-border-strong)]"
            )}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              {option.svg ? (
                <span
                  className={cn(
                    "inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white p-1",
                    selected ? "border-white/80" : "border-[var(--fm-border)]"
                  )}
                >
                  <IqVectorSvg svg={option.svg} className="h-full w-full" />
                </span>
              ) : null}
              <span>{option.text}</span>
            </span>
            <span
              className={cn(
                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                selected ? "border-white/80 text-white" : "border-[var(--fm-border-strong)] text-[var(--fm-text-muted)]"
              )}
            >
              {String.fromCharCode(65 + idx)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
