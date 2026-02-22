import type { ScaleQuestionOption } from "@/lib/api/v0_3";

export function OptionGroup({
  questionId,
  options,
  selectedCode,
  onSelect,
}: {
  questionId: string;
  options: ScaleQuestionOption[];
  selectedCode?: string;
  onSelect: (questionId: string, code: string) => void;
}) {
  const normalized = options.filter((option) => option.code.trim().length > 0);

  return (
    <div className="space-y-2" role="radiogroup" aria-label={`Options for ${questionId}`}>
      {normalized.map((option, idx) => {
        const selected = option.code === selectedCode;
        return (
          <button
            key={option.code}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(questionId, option.code)}
            className={[
              "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition",
              selected
                ? "border-slate-900 bg-slate-100 text-slate-900"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-500",
            ].join(" ")}
          >
            <span
              className={[
                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                selected ? "border-slate-900" : "border-slate-300",
              ].join(" ")}
            >
              {String.fromCharCode(65 + idx)}
            </span>
            <span>{option.text}</span>
          </button>
        );
      })}
    </div>
  );
}
