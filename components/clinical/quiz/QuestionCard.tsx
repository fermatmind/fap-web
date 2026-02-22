import type { ScaleQuestionItem, ScaleQuestionOption } from "@/lib/api/v0_3";
import { OptionGroup } from "@/components/clinical/quiz/OptionGroup";

export function QuestionCard({
  question,
  index,
  total,
  options,
  selectedCode,
  emphasized = false,
  onSelect,
}: {
  question: ScaleQuestionItem;
  index: number;
  total: number;
  options: ScaleQuestionOption[];
  selectedCode?: string;
  emphasized?: boolean;
  onSelect: (questionId: string, code: string) => void;
}) {
  return (
    <article
      className={[
        "space-y-4 rounded-2xl border bg-[var(--fm-surface)] p-5 transition duration-200",
        emphasized
          ? "border-[var(--fm-border-strong)] opacity-100 shadow-[var(--fm-shadow-lg)]"
          : "border-[var(--fm-border)] opacity-30 shadow-[var(--fm-shadow-sm)]",
      ].join(" ")}
    >
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
        Question {index + 1} / {total}
      </p>
      <h2 className="m-0 text-lg font-semibold text-[var(--fm-text)]">{question.text}</h2>

      <OptionGroup
        questionId={question.question_id}
        options={options}
        selectedCode={selectedCode}
        onSelect={onSelect}
      />
    </article>
  );
}
