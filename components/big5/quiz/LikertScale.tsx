import { useMemo } from "react";

type LikertOption = {
  code: string;
  text: string;
};

export function LikertScale({
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
  const normalized = useMemo(() => options.filter((option) => option.code.trim().length > 0), [options]);

  if (normalized.length === 0) {
    return <p className="text-sm text-rose-600">No options available.</p>;
  }

  return (
    <div className="space-y-2" role="radiogroup" aria-label={`Likert options for ${questionId}`}>
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
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                const next = normalized[Math.min(idx + 1, normalized.length - 1)];
                onChange(next.code);
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                const prev = normalized[Math.max(idx - 1, 0)];
                onChange(prev.code);
              }
            }}
            className={[
              "min-h-[48px] w-full rounded-xl border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)]",
              selected
                ? "border-[var(--fm-accent)] bg-[var(--fm-surface-muted)] text-[var(--fm-text)]"
                : "border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-text-muted)] hover:border-[var(--fm-border-strong)]",
            ].join(" ")}
          >
            {option.text}
          </button>
        );
      })}
    </div>
  );
}
