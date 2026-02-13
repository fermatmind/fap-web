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
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ margin: 0 }}>{question.title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {question.options.map((option, index) => {
          const selected = option.id === selectedOptionId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(question.id, option.id)}
              aria-pressed={selected}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 12,
                border: selected ? "2px solid #111" : "1px solid #d0d0d0",
                background: selected ? "#f6f6f6" : "#fff",
                cursor: "pointer",
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  border: selected ? "2px solid #111" : "1px solid #c0c0c0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                }}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
