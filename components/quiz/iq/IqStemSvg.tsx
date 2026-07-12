import { cn } from "@/lib/utils";
import type { IqStemPayload } from "@/lib/iq/contracts";
import {
  normalizeIqImageAsset,
  normalizeIqStructuredSvg,
  type IqRenderableImage,
  type IqRenderableSvg,
} from "@/lib/iq/renderer";
import type { QuizImageGraphic, QuizQuestionStem, QuizVectorGraphic } from "@/lib/quiz/types";

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

export function IqImageGraphic({
  image,
  className,
  ariaLabel = "IQ matrix graphic",
}: {
  image: QuizImageGraphic | IqRenderableImage;
  className?: string;
  ariaLabel?: string;
}) {
  const normalizedImage = normalizeIqImageAsset(image);
  if (!normalizedImage) {
    return null;
  }

  const alt = normalizedImage.alt ?? ariaLabel;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- CMS IQ assets can use authority-provided hosts that are not known at build time.
    <img
      src={normalizedImage.src}
      alt={alt}
      {...(normalizedImage.width ? { width: normalizedImage.width } : {})}
      {...(normalizedImage.height ? { height: normalizedImage.height } : {})}
      className={cn("h-full w-full object-contain", className)}
      data-testid="iq-image-graphic"
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );
}

export function IqGraphic({
  svg,
  image,
  className,
  ariaLabel = "IQ matrix graphic",
}: {
  svg?: QuizVectorGraphic | IqRenderableSvg;
  image?: QuizImageGraphic | IqRenderableImage;
  className?: string;
  ariaLabel?: string;
}) {
  if (image) {
    return <IqImageGraphic image={image} className={className} ariaLabel={ariaLabel} />;
  }

  if (svg) {
    return <IqVectorSvg svg={svg} className={className} ariaLabel={ariaLabel} />;
  }

  return null;
}

export function IqStemSvg({
  stem,
  className,
}: {
  stem: QuizQuestionStem | IqStemPayload;
  className?: string;
}) {
  if (!stem.svg && !stem.image) return null;

  return (
    <div
      data-testid="iq-stem-svg"
      className={cn(
        "overflow-hidden rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-2 sm:p-3",
        className
      )}
    >
      <div className="mx-auto flex aspect-[3/2] w-full max-w-[620px] min-h-[220px] items-center justify-center sm:min-h-[280px]">
        <IqGraphic svg={stem.svg} image={stem.image} ariaLabel={stem.image?.alt ?? stem.prompt ?? "IQ matrix graphic"} />
      </div>
    </div>
  );
}
