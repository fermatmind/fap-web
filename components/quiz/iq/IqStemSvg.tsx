import { cn } from "@/lib/utils";
import type { IqStemPayload } from "@/lib/iq/contracts";
import { normalizeIqStructuredSvg, type IqRenderableSvg } from "@/lib/iq/renderer";
import type { QuizQuestionStem, QuizVectorGraphic } from "@/lib/quiz/types";

export function IqVectorSvg({
  svg,
  className,
  ariaLabel = "IQ matrix graphic",
}: {
  svg: QuizVectorGraphic | IqRenderableSvg;
  className?: string;
  ariaLabel?: string;
}) {
  const normalizedSvg = normalizeIqStructuredSvg(svg);
  if (!normalizedSvg) {
    return null;
  }

  return (
    <svg
      viewBox={normalizedSvg.viewBox}
      className={cn("h-full w-full", className)}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
      focusable="false"
    >
      {normalizedSvg.paths.map((path, idx) => (
        <path
          key={`iq-path-${idx}`}
          d={path.d}
          {...(path.fill ? { fill: path.fill } : {})}
          {...(path.fillRule ? { fillRule: path.fillRule as "evenodd" | "nonzero" | "inherit" } : {})}
          {...(path.stroke ? { stroke: path.stroke } : {})}
          {...(path.strokeWidth !== undefined ? { strokeWidth: path.strokeWidth } : {})}
          {...(path.opacity !== undefined ? { opacity: path.opacity } : {})}
        />
      ))}
    </svg>
  );
}

export function IqStemSvg({
  stem,
  className,
}: {
  stem: QuizQuestionStem | IqStemPayload;
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
      <div className="mx-auto aspect-square w-full max-w-[420px]">
        <IqVectorSvg svg={stem.svg} />
      </div>
    </div>
  );
}
