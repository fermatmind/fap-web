import { useMemo, type KeyboardEvent } from "react";
import { IqGraphic } from "@/components/quiz/iq/IqStemSvg";
import { normalizeIqOptionForRenderer, type IqRenderableImage, type IqRenderableSvg } from "@/lib/iq/renderer";
import { cn } from "@/lib/utils";

type IqOptionItem = {
  code?: string;
  option_code?: string | number;
  id?: string;
  text?: string;
  label?: string;
  svg?: IqRenderableSvg;
  image?: IqRenderableImage;
  assets?: Record<string, unknown>;
  width?: number | string;
  height?: number | string;
  alt?: string;
  accessibility_label?: string;
  [key: string]: unknown;
};

type NormalizedIqOptionItem = NonNullable<ReturnType<typeof normalizeIqOptionForRenderer>>;

type LayoutMode = "responsive" | "desktop" | "mobile";

function normalizeOptions(options: IqOptionItem[]): NormalizedIqOptionItem[] {
  return options
    .map((option) => normalizeIqOptionForRenderer(option))
    .filter((option): option is NonNullable<ReturnType<typeof normalizeIqOptionForRenderer>> => option !== null);
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
  disabled = false,
  onChange,
  onKeyboardSelect,
}: {
  questionId: string;
  options: IqOptionItem[];
  value?: string;
  locale: "en" | "zh";
  noOptionsLabel: string;
  layoutMode?: LayoutMode;
  disabled?: boolean;
  onChange: (code: string) => void;
  onKeyboardSelect?: (code: string) => void;
}) {
  const normalized = useMemo(() => normalizeOptions(options), [options]);
  const optionCount = normalized.length;
  const columns = getDesktopColumns(optionCount);

  const moveByArrow = (index: number, event: KeyboardEvent<HTMLElement>) => {
    const targetIndex = event.key === "ArrowRight" || event.key === "ArrowDown" ? Math.min(index + 1, optionCount - 1)
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? Math.max(index - 1, 0)
        : event.key === "Home" ? 0 : event.key === "End" ? optionCount - 1 : null;
    if (targetIndex === null || optionCount === 0) return;
    event.preventDefault();
    if (disabled) return;
    // Radio navigation selects within this question; Enter/Space confirms the click.
    (onKeyboardSelect ?? onChange)(normalized[targetIndex].code);
    event.currentTarget.closest('[role="radiogroup"]')
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[targetIndex]?.focus();
  };

  if (optionCount === 0) {
    return (
      <p className="m-0 rounded-xl border border-dashed border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-4 py-3 text-sm leading-6 text-rose-700">
        {noOptionsLabel}
      </p>
    );
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

              return (
                <div key={`desktop-${option.code}`} className="relative min-h-[170px]">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-disabled={disabled}
                    aria-label={optionLabel}
                    disabled={disabled}
                    data-state={selected ? "selected" : "idle"}
                    data-layout="desktop"
                    onClick={() => onChange(option.code)}
                    onKeyDown={(event) => moveByArrow(idx, event)}
                    className={cn(
                      "group absolute inset-0 h-full w-full min-h-[170px] rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60",
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
                  </button>
                  <div className="pointer-events-none relative h-full p-3">

                    <div className="flex h-full flex-col gap-2 pt-8">
                      <span className="flex min-h-[108px] items-center justify-center overflow-hidden rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-2">
                        {option.svg || option.image ? (
                          <IqGraphic
                            svg={option.svg}
                            image={option.image}
                            className="h-full w-full object-contain"
                            ariaLabel={option.image?.alt ?? optionLabel}
                          />
                        ) : (
                          <span className="text-sm font-medium text-[var(--fm-text-muted)]">{optionLabel}</span>
                        )}
                      </span>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {showMobile ? (
        <div
          data-testid="iq-option-board-mobile"
          className={cn(
            "grid grid-cols-1 gap-2.5 min-[390px]:grid-cols-2",
            layoutMode === "responsive" ? "md:hidden" : undefined
          )}
          role="radiogroup"
          aria-label={`iq-options-${questionId}-mobile`}
        >
          {normalized.map((option, idx) => {
            const selected = value === option.code;
            const letter = toOptionLetter(idx);
            const optionLabel = locale === "zh" ? `选项 ${letter}` : `Option ${letter}`;

            return (
              <div key={`mobile-${option.code}`} className="relative min-h-[128px]">
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-disabled={disabled}
                  aria-label={optionLabel}
                  disabled={disabled}
                  data-state={selected ? "selected" : "idle"}
                  data-layout="mobile"
                  onClick={() => onChange(option.code)}
                  onKeyDown={(event) => moveByArrow(idx, event)}
                  className={cn(
                    "absolute inset-0 h-full flex min-h-[128px] w-full flex-col items-start gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60",
                    selected
                      ? "border-[var(--fm-trust-blue)] bg-[var(--fm-surface-muted)] shadow-[var(--fm-shadow-sm)]"
                      : "border-[var(--fm-border)] bg-white"
                  )}
                >
                  <span
                      className={cn(
                        "absolute left-3 top-3 inline-flex h-8 min-w-[32px] shrink-0 items-center justify-center rounded-full border px-2 text-sm font-semibold",
                        selected
                          ? "border-[var(--fm-trust-blue)] bg-[var(--fm-trust-blue)] text-white"
                          : "border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] text-[var(--fm-text)]"
                      )}
                    >
                      {letter}
                  </span>
                </button>
                <div className="pointer-events-none relative h-full p-3 pt-14">
                  <div className="flex min-w-0 w-full flex-col items-start gap-3">

                    <span className="flex aspect-[16/9] min-w-0 w-full max-w-[156px] items-center justify-center overflow-hidden rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-2">
                      {option.svg || option.image ? (
                        <IqGraphic
                          svg={option.svg}
                          image={option.image}
                          className="h-full w-full object-contain"
                          ariaLabel={option.image?.alt ?? optionLabel}
                        />
                      ) : (
                        <span className="text-xs font-medium text-[var(--fm-text-muted)]">{optionLabel}</span>
                      )}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
