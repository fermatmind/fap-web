import type { KeyboardEvent } from "react";

type MatrixOption = {
  code: string;
  text: string;
};

function normalizeOptions(options: MatrixOption[]): MatrixOption[] {
  return options
    .filter((option) => option.code.trim().length > 0)
    .map((option) => ({ code: option.code.trim(), text: option.text.trim() || option.code.trim() }));
}

export function MatrixQuestionTable({
  questionId,
  questionText,
  options,
  value,
  locale,
  onChange,
}: {
  questionId: string;
  questionText: string;
  options: MatrixOption[];
  value?: string;
  locale: "en" | "zh";
  onChange: (code: string) => void;
}) {
  const normalized = normalizeOptions(options);
  const optionCount = normalized.length;

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
      <div className="space-y-1">
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
                {option.text}
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

      <div className="space-y-2 md:hidden" role="radiogroup" aria-label={`matrix-${questionId}`}>
        <div className="flex justify-between text-[11px] text-[var(--fm-text-muted)]">
          <span>{normalized[0]?.text}</span>
          <span>{normalized[optionCount - 1]?.text}</span>
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${optionCount}, minmax(0,1fr))` }}>
          {normalized.map((option, idx) => {
            const selected = value === option.code;
            return (
              <label
                key={`mobile-option-${option.code}`}
                className={`flex min-h-[52px] cursor-pointer items-center justify-center rounded-lg border transition ${
                  selected
                    ? "border-[var(--fm-trust-blue)] bg-[var(--fm-surface-muted)]"
                    : "border-[var(--fm-border)] bg-white"
                }`}
              >
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
  );
}
