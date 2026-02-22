const SEGMENT_SIZE = 30;

function range(start: number, end: number): number[] {
  const output: number[] = [];
  for (let i = start; i <= end; i += 1) {
    output.push(i);
  }
  return output;
}

export function QuestionNavigator({
  total,
  currentIndex,
  questionIds,
  answeredMap,
  onJump,
}: {
  total: number;
  currentIndex: number;
  questionIds: string[];
  answeredMap: Record<string, string>;
  onJump: (index: number) => void;
}) {
  const segmentCount = Math.ceil(total / SEGMENT_SIZE);
  const currentSegment = Math.floor(currentIndex / SEGMENT_SIZE);

  const segmentStart = currentSegment * SEGMENT_SIZE + 1;
  const segmentEnd = Math.min(total, segmentStart + SEGMENT_SIZE - 1);

  const answeredCount = Object.values(answeredMap).filter(Boolean).length;

  return (
    <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        Navigator ({answeredCount}/{total})
      </p>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: segmentCount }, (_, idx) => {
          const from = idx * SEGMENT_SIZE + 1;
          const to = Math.min(total, from + SEGMENT_SIZE - 1);
          const active = idx === currentSegment;

          return (
            <button
              key={`segment-${idx}`}
              type="button"
              onClick={() => onJump(from - 1)}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-500",
              ].join(" ")}
            >
              {from}-{to}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-6 gap-2">
        {range(segmentStart, segmentEnd).map((questionNo) => {
          const key = questionIds[questionNo - 1] ?? String(questionNo);
          const answered = Boolean(answeredMap[key]);
          const active = questionNo - 1 === currentIndex;

          return (
            <button
              key={questionNo}
              type="button"
              onClick={() => onJump(questionNo - 1)}
              className={[
                "rounded-md border py-1 text-xs transition",
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : answered
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-500",
              ].join(" ")}
            >
              {questionNo}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
