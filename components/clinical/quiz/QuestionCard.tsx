import type { ScaleQuestionItem, ScaleQuestionOption } from "@/lib/api/v0_3";
import { OptionGroup } from "@/components/clinical/quiz/OptionGroup";

export function QuestionCard({
  question,
  index,
  total,
  options,
  selectedCode,
  onSelect,
}: {
  question: ScaleQuestionItem;
  index: number;
  total: number;
  options: ScaleQuestionOption[];
  selectedCode?: string;
  onSelect: (questionId: string, code: string) => void;
}) {
  return (
    <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        Question {index + 1} / {total}
      </p>
      <h2 className="m-0 text-lg font-semibold text-slate-900">{question.text}</h2>

      <OptionGroup
        questionId={question.question_id}
        options={options}
        selectedCode={selectedCode}
        onSelect={onSelect}
      />
    </article>
  );
}
