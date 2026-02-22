import type { ScaleQuestionOption } from "@/lib/api/v0_3";

export function OptionGroup({
  questionId,
  options,
  selectedCode,
  onSelect,
}: {
  questionId: string;
  options: ScaleQuestionOption[];
  selectedCode?: string;
  onSelect: (questionId: string, code: string) => void;
}) {
  const normalized = options.filter((option) => option.code.trim().length > 0);

  return (
    <div className="space-y-2" role="radiogroup" aria-label={`Options for ${questionId}`}>
      {normalized.map((option, idx) => {
        const selected = option.code === selectedCode;
        return (
          <button
            key={option.code}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(questionId, option.code)}
            className={[
              "flex min-h-[48px] w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)]",
              selected
                ? "border-[var(--fm-accent)] bg-[var(--fm-surface-muted)] text-[var(--fm-text)]"
                : "border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-text-muted)] hover:border-[var(--fm-border-strong)]",
            ].join(" ")}
          >
            <span
              className={[
                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                selected ? "border-[var(--fm-accent)]" : "border-[var(--fm-border)]",
              ].join(" ")}
            >
              {String.fromCharCode(65 + idx)}
            </span>
            <span>{option.text}</span>
          </button>
        );
      })}
    </div>
  );
}
