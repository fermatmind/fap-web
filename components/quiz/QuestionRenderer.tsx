import type { QuizQuestion } from "@/lib/quiz/types";

export type QuestionRendererProps = {
  question: QuizQuestion;
  selectedOptionId?: string;
  onSelect: (questionId: string, optionId: string) => void;
};

export function QuestionRenderer({
  question,
  selectedOptionId,
  onSelect,
}: QuestionRendererProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="m-0 text-xl font-semibold text-slate-900">{question.title}</h2>
      <div className="flex flex-col gap-2.5">
        {question.options.map((option, index) => {
          const selected = option.id === selectedOptionId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(question.id, option.id)}
              aria-pressed={selected}
              className={[
                "flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)]",
                selected
                  ? "border-2 border-[var(--fm-accent)] bg-[var(--fm-surface-muted)]"
                  : "border-[var(--fm-border)] bg-[var(--fm-surface)] hover:border-[var(--fm-border-strong)]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  selected ? "border-2 border-[var(--fm-accent)]" : "border-[var(--fm-border)]",
                ].join(" ")}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-sm text-[var(--fm-text)]">{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
