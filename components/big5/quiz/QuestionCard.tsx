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
  onSelect,
}: {
  question: Question;
  index: number;
  total: number;
  selectedCode?: string;
  onSelect: (questionId: string, code: string) => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        Question {index + 1} / {total}
      </p>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{question.text}</h2>

      <LikertScale
        questionId={question.question_id}
        options={question.options}
        value={selectedCode}
        onChange={(code) => onSelect(question.question_id, code)}
      />
    </article>
  );
}
