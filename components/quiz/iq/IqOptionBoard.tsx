import { useMemo, type KeyboardEvent } from "react";
import { IqVectorSvg } from "@/components/quiz/iq/IqStemSvg";
import { cn } from "@/lib/utils";
import type { QuizVectorGraphic } from "@/lib/quiz/types";

type IqOptionItem = {
  code: string;
  text: string;
  svg?: QuizVectorGraphic | null;
};

type LayoutMode = "responsive" | "desktop" | "mobile";

function normalizeOptions(options: IqOptionItem[]): IqOptionItem[] {
  return options
    .filter((option) => option.code.trim().length > 0)
    .map((option) => ({
      code: option.code.trim(),
      text: option.text.trim() || option.code.trim(),
      svg: option.svg ?? null,
    }));
}

function toOptionLetter(index: number): string {
  if (index >= 0 && index < 26) {
    return String.fromCharCode(65 + index);
  }
  return String(index + 1);
}

function getDesktopColumns(optionCount: number): number {
  if (optionCount <= 4) return optionCount;
  if (optionCount <= 6) return 3;
  if (optionCount <= 8) return 4;
  return 4;
}

export function IqOptionBoard({
  questionId,
  options,
  value,
  locale,
  noOptionsLabel,
  layoutMode = "responsive",
  onChange,
}: {
  questionId: string;
  options: IqOptionItem[];
  value?: string;
  locale: "en" | "zh";
  noOptionsLabel: string;
  layoutMode?: LayoutMode;
  onChange: (code: string) => void;
}) {
  const normalized = useMemo(() => normalizeOptions(options), [options]);
  const optionCount = normalized.length;
  const columns = getDesktopColumns(optionCount);

  const moveByArrow = (index: number, event: KeyboardEvent<HTMLElement>) => {
    if (optionCount === 0) return;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = normalized[Math.min(index + 1, optionCount - 1)];
      if (next) onChange(next.code);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev = normalized[Math.max(index - 1, 0)];
      if (prev) onChange(prev.code);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      const first = normalized[0];
      if (first) onChange(first.code);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const last = normalized[optionCount - 1];
      if (last) onChange(last.code);
    }
  };

  if (optionCount === 0) {
    return <p className="m-0 text-sm text-rose-700">{noOptionsLabel}</p>;
  }

  const showDesktop = layoutMode === "responsive" || layoutMode === "desktop";
  const showMobile = layoutMode === "responsive" || layoutMode === "mobile";

  return (
    <div className="space-y-3">
      {showDesktop ? (
        <div
          data-testid="iq-option-board-desktop"
          className={cn(layoutMode === "responsive" ? "hidden md:block" : undefined)}
          role="radiogroup"
          aria-label={`iq-options-${questionId}-desktop`}
        >
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {normalized.map((option, idx) => {
              const selected = value === option.code;
              const letter = toOptionLetter(idx);
              const optionLabel = locale === "zh" ? `选项 ${letter}` : `Option ${letter}`;
              const subLabel = option.text && option.text !== option.code ? option.text : optionLabel;

              return (
                <button
                  key={`desktop-${option.code}`}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={optionLabel}
                  onClick={() => onChange(option.code)}
                  onKeyDown={(event) => moveByArrow(idx, event)}
                  className={cn(
                    "group relative min-h-[170px] rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)]",
                    selected
                      ? "border-[var(--fm-trust-blue)] bg-[var(--fm-surface-muted)] shadow-[var(--fm-shadow-md)]"
                      : "border-[var(--fm-border)] bg-white hover:border-[var(--fm-border-strong)]"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-3 top-3 inline-flex h-7 min-w-[28px] items-center justify-center rounded-full border px-2 text-xs font-semibold",
                      selected
                        ? "border-[var(--fm-trust-blue)] bg-[var(--fm-trust-blue)] text-white"
                        : "border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] text-[var(--fm-text)]"
                    )}
                  >
                    {letter}
                  </span>

                  <div className="flex h-full flex-col gap-2 pt-8">
                    <span className="flex min-h-[108px] items-center justify-center overflow-hidden rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-2">
                      {option.svg ? (
                        <IqVectorSvg svg={option.svg} className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-sm font-medium text-[var(--fm-text-muted)]">{optionLabel}</span>
                      )}
                    </span>

                    <span className="line-clamp-1 text-xs font-medium text-[var(--fm-text-muted)]">{subLabel}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {showMobile ? (
        <div
          data-testid="iq-option-board-mobile"
          className={cn("space-y-2", layoutMode === "responsive" ? "md:hidden" : undefined)}
          role="radiogroup"
          aria-label={`iq-options-${questionId}-mobile`}
        >
          {normalized.map((option, idx) => {
            const selected = value === option.code;
            const letter = toOptionLetter(idx);
            const optionLabel = locale === "zh" ? `选项 ${letter}` : `Option ${letter}`;
            const subLabel = option.text && option.text !== option.code ? option.text : optionLabel;

            return (
              <button
                key={`mobile-${option.code}`}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={optionLabel}
                onClick={() => onChange(option.code)}
                onKeyDown={(event) => moveByArrow(idx, event)}
                className={cn(
                  "flex min-h-[92px] w-full items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)]",
                  selected
                    ? "border-[var(--fm-trust-blue)] bg-[var(--fm-surface-muted)] shadow-[var(--fm-shadow-sm)]"
                    : "border-[var(--fm-border)] bg-white"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-8 min-w-[32px] shrink-0 items-center justify-center rounded-full border px-2 text-sm font-semibold",
                    selected
                      ? "border-[var(--fm-trust-blue)] bg-[var(--fm-trust-blue)] text-white"
                      : "border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] text-[var(--fm-text)]"
                  )}
                >
                  {letter}
                </span>

                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-2">
                  {option.svg ? (
                    <IqVectorSvg svg={option.svg} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs font-medium text-[var(--fm-text-muted)]">{optionLabel}</span>
                  )}
                </span>

                <span className="line-clamp-2 text-sm font-medium text-[var(--fm-text)]">{subLabel}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
