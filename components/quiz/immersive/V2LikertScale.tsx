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
  onChange,
}: {
  questionId: string;
  options: LikertOption[];
  value?: string;
  onChange: (code: string) => void;
}) {
  const normalized = useMemo(() => normalizeOptions(options), [options]);
  if (normalized.length !== 5) return null;

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
