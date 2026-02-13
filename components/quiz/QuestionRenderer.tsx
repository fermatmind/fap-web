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
                "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition",
                selected
                  ? "border-2 border-slate-900 bg-slate-50"
                  : "border-slate-300 bg-white hover:border-slate-400",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  selected ? "border-2 border-slate-900" : "border-slate-300",
                ].join(" ")}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-sm text-slate-800">{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
