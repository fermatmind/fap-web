export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  title: string;
  options: QuizOption[];
};

export type QuestionRendererProps = {
  question: QuizQuestion;
  selectedOptionId?: string;
  onSelect: (qId: string, oId: string) => void;
};

export function QuestionRenderer({
  question,
  selectedOptionId,
  onSelect,
}: QuestionRendererProps) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h1
        style={{
          margin: 0,
          fontSize: 22,
          lineHeight: 1.3,
          color: "#0f172a",
        }}
      >
        {question.title}
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {question.options.map((option, index) => {
          const selected = option.id === selectedOptionId;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(question.id, option.id)}
              style={{
                textAlign: "left",
                borderRadius: 12,
                border: selected ? "2px solid #0f172a" : "1px solid #d1d5db",
                background: selected ? "#f8fafc" : "#ffffff",
                color: "#111827",
                padding: "12px 14px",
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
                  border: selected ? "2px solid #0f172a" : "1px solid #cbd5e1",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

