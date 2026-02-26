import { cn } from "@/lib/utils";
import type { QuizQuestionStem, QuizVectorGraphic } from "@/lib/quiz/types";

export function IqVectorSvg({
  svg,
  className,
}: {
  svg: QuizVectorGraphic;
  className?: string;
}) {
  return (
    <svg
      viewBox={svg.viewBox}
      className={cn("h-full w-full", className)}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="IQ matrix graphic"
    >
      {svg.paths.map((path, idx) => (
        <path
          key={`iq-path-${idx}`}
          d={path.d}
          {...(path.fill ? { fill: path.fill } : {})}
          {...(path.fillRule ? { fillRule: path.fillRule as "evenodd" | "nonzero" | "inherit" } : {})}
          {...(path.stroke ? { stroke: path.stroke } : {})}
          {...(path.strokeWidth !== undefined ? { strokeWidth: path.strokeWidth } : {})}
        />
      ))}
    </svg>
  );
}

export function IqStemSvg({
  stem,
  className,
}: {
  stem: QuizQuestionStem;
  className?: string;
}) {
  if (!stem.svg) return null;

  return (
    <div
      data-testid="iq-stem-svg"
      className={cn(
        "overflow-hidden rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-3",
        className
      )}
    >
      <IqVectorSvg svg={stem.svg} />
    </div>
  );
}
