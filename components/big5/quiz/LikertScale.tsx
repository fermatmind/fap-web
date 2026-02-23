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
      <div className="hidden md:block">
        <div
          className="grid items-stretch gap-2"
          style={{ gridTemplateColumns: `repeat(${normalized.length}, minmax(56px,1fr))` }}
        >
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
                  "min-h-[52px] rounded-xl border px-2 py-2 text-center text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)]",
                  selected
                    ? "border-[var(--fm-trust-blue)] bg-[var(--fm-surface-muted)] text-[var(--fm-text)]"
                    : "border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-text-muted)] hover:border-[var(--fm-border-strong)]",
                ].join(" ")}
              >
                <div className="text-lg leading-none">◯</div>
                <div className="mt-1 line-clamp-2">{option.text}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 md:hidden">
        <div className="flex justify-between text-[11px] text-[var(--fm-text-muted)]">
          <span>{normalized[0]?.text}</span>
          <span>{normalized[normalized.length - 1]?.text}</span>
        </div>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${normalized.length}, minmax(0,1fr))` }}
        >
          {normalized.map((option, idx) => {
            const selected = value === option.code;
            return (
              <button
                key={`mobile-${option.code}`}
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
                  "min-h-[52px] rounded-xl border px-2 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)]",
                  selected
                    ? "border-[var(--fm-trust-blue)] bg-[var(--fm-surface-muted)] text-[var(--fm-text)]"
                    : "border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-text-muted)]",
                ].join(" ")}
              >
                <span className="text-lg leading-none">◯</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
