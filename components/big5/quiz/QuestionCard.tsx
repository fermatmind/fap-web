import { LikertScale } from "@/components/big5/quiz/LikertScale";

type QuestionOption = {
  code: string;
  text: string;
};

type Question = {
  question_id: string;
  text: string;
  options: QuestionOption[];
};

export function QuestionCard({
  question,
  index,
  total,
  selectedCode,
  emphasized = false,
  onSelect,
}: {
  question: Question;
  index: number;
  total: number;
  selectedCode?: string;
  emphasized?: boolean;
  onSelect: (questionId: string, code: string) => void;
}) {
  return (
    <article
      className={[
        "rounded-2xl border bg-[var(--fm-surface)] p-5 transition duration-200",
        emphasized
          ? "border-[var(--fm-border-strong)] opacity-100 shadow-[var(--fm-shadow-lg)]"
          : "border-[var(--fm-border)] opacity-30 shadow-[var(--fm-shadow-sm)]",
      ].join(" ")}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
        Question {index + 1} / {total}
      </p>
      <h2 className="mb-4 text-lg font-semibold text-[var(--fm-text)]">{question.text}</h2>

      <LikertScale
        questionId={question.question_id}
        options={question.options}
        value={selectedCode}
        onChange={(code) => onSelect(question.question_id, code)}
      />
    </article>
  );
}
