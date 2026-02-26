import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { IqVectorSvg } from "@/components/quiz/iq/IqStemSvg";
import { cn } from "@/lib/utils";
import type { QuizVectorGraphic } from "@/lib/quiz/types";

type MatrixOption = {
  code: string;
  text: string;
  svg?: QuizVectorGraphic | null;
};

function normalizeOptions(options: MatrixOption[]): MatrixOption[] {
  return options
    .filter((option) => option.code.trim().length > 0)
    .map((option) => ({
      code: option.code.trim(),
      text: option.text.trim() || option.code.trim(),
      svg: option.svg ?? null,
    }));
}

export function MatrixQuestionTable({
  questionId,
  questionText,
  options,
  value,
  locale,
  mobilePromptSlot,
  mobilePromptStickyTopClassName = "top-[4.75rem]",
  mobilePromptMaxHeightVh = 45,
  mobileOptionsMaxHeightVh = 52,
  mobileOptionsSafeArea = true,
  onChange,
}: {
  questionId: string;
  questionText: string;
  options: MatrixOption[];
  value?: string;
  locale: "en" | "zh";
  mobilePromptSlot?: ReactNode;
  mobilePromptStickyTopClassName?: string;
  mobilePromptMaxHeightVh?: number;
  mobileOptionsMaxHeightVh?: number;
  mobileOptionsSafeArea?: boolean;
  onChange: (code: string) => void;
}) {
  const mobilePromptMediaRef = useRef<HTMLDivElement | null>(null);
  const normalized = normalizeOptions(options);
  const optionCount = normalized.length;
  const safePromptMaxHeightVh = Number.isFinite(mobilePromptMaxHeightVh)
    ? Math.min(Math.max(mobilePromptMaxHeightVh, 35), 55)
    : 45;
  const safeOptionsMaxHeightVh = Number.isFinite(mobileOptionsMaxHeightVh)
    ? Math.min(Math.max(mobileOptionsMaxHeightVh, 35), 65)
    : 52;

  useEffect(() => {
    const host = mobilePromptMediaRef.current;
    if (!host) return;

    const svg = host.querySelector("svg");
    if (!svg) return;

    if (!svg.getAttribute("preserveAspectRatio")) {
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }

    if (!svg.getAttribute("viewBox")) {
      const width = Number(svg.getAttribute("width"));
      const height = Number(svg.getAttribute("height"));
      if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      }
    }

    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.maxHeight = "100%";
  }, [mobilePromptSlot, questionId]);

  if (optionCount === 0) {
    return <p className="m-0 text-sm text-rose-700">No options available.</p>;
  }

  const moveSelection = (nextIndex: number) => {
    const clamped = Math.min(Math.max(nextIndex, 0), optionCount - 1);
    onChange(normalized[clamped].code);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(currentIndex + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(currentIndex - 1);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--fm-border-strong)] bg-white p-4 shadow-[var(--fm-shadow-sm)]">
      <div className="hidden space-y-1 md:block">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
          {locale === "zh" ? "当前题目" : "Current focus"}
        </p>
        <h2 className="m-0 text-xl font-semibold leading-8 text-[var(--fm-text)]">{questionText}</h2>
      </div>

      <div className="hidden md:block">
        <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-3">
          <div
            className="grid items-center gap-2 text-center"
            style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${optionCount}, minmax(56px,1fr))` }}
          >
            <div className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
              {locale === "zh" ? "根据直觉选择" : "Choose by first instinct"}
            </div>
            {normalized.map((option) => (
              <div key={`desktop-label-${option.code}`} className="text-[11px] font-medium text-[var(--fm-text-muted)]">
                {option.svg ? (
                  <span className="mx-auto inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-md border border-[var(--fm-border)] bg-white p-1">
                    <IqVectorSvg svg={option.svg} className="h-full w-full" />
                  </span>
                ) : (
                  option.text
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-3 grid items-center gap-2"
          style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${optionCount}, minmax(56px,1fr))` }}
        >
          <div className="text-sm text-[var(--fm-text-muted)]">#{questionId}</div>
          {normalized.map((option, idx) => {
            const selected = value === option.code;
            return (
              <label
                key={`desktop-option-${option.code}`}
                className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg border transition ${
                  selected
                    ? "border-[var(--fm-trust-blue)] bg-[var(--fm-surface-muted)]"
                    : "border-[var(--fm-border)] bg-white hover:border-[var(--fm-border-strong)]"
                }`}
              >
                <input
                  type="radio"
                  name={`matrix-${questionId}`}
                  value={option.code}
                  checked={selected}
                  aria-label={option.text}
                  onChange={() => onChange(option.code)}
                  onKeyDown={(event) => handleKeyDown(event, idx)}
                  className="h-5 w-5 cursor-pointer accent-[var(--fm-trust-blue)]"
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        <div
          data-testid="matrix-mobile-prompt"
          className={cn(
            "sticky z-20 space-y-2 overflow-hidden rounded-xl border border-[var(--fm-border)] bg-white/95 p-3 shadow-[var(--fm-shadow-sm)] backdrop-blur",
            mobilePromptStickyTopClassName
          )}
          style={{ maxHeight: `${safePromptMaxHeightVh}vh` }}
        >
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
            {locale === "zh" ? "当前题目" : "Current focus"}
          </p>
          <h2 className="m-0 text-lg font-semibold leading-7 text-[var(--fm-text)]">{questionText}</h2>
          {mobilePromptSlot ? (
            <div
              ref={mobilePromptMediaRef}
              className="w-full overflow-hidden rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] [&_img]:h-full [&_img]:max-h-full [&_img]:w-full [&_img]:object-contain [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full"
              style={{ maxHeight: `calc(${safePromptMaxHeightVh}vh - 8.5rem)` }}
            >
              {mobilePromptSlot}
            </div>
          ) : null}
          <div className="flex justify-between text-[11px] text-[var(--fm-text-muted)]">
            <span>{normalized[0]?.text}</span>
            <span>{normalized[optionCount - 1]?.text}</span>
          </div>
        </div>

        <div
          data-testid="matrix-mobile-options"
          className="overflow-y-auto pr-1"
          role="radiogroup"
          aria-label={`matrix-${questionId}`}
          style={{
            maxHeight: `${safeOptionsMaxHeightVh}vh`,
            paddingBottom: mobileOptionsSafeArea ? "calc(env(safe-area-inset-bottom) + 12px)" : undefined,
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            {normalized.map((option, idx) => {
              const selected = value === option.code;
              return (
                <label
                  key={`mobile-option-${option.code}`}
                  className={`flex min-h-[72px] cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 transition ${
                    selected
                      ? "border-[var(--fm-trust-blue)] bg-[var(--fm-surface-muted)]"
                      : "border-[var(--fm-border)] bg-white"
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs font-medium text-[var(--fm-text)]">
                    {option.svg ? (
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--fm-border)] bg-white p-1">
                        <IqVectorSvg svg={option.svg} className="h-full w-full" />
                      </span>
                    ) : null}
                    <span>{option.text}</span>
                  </span>
                  <input
                    type="radio"
                    role="radio"
                    aria-checked={selected}
                    name={`matrix-mobile-${questionId}`}
                    value={option.code}
                    checked={selected}
                    onChange={() => onChange(option.code)}
                    onKeyDown={(event) => handleKeyDown(event, idx)}
                    className="h-5 w-5 cursor-pointer accent-[var(--fm-trust-blue)]"
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
