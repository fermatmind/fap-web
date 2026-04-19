import type { CmsArticleImageVariant, CmsArticleImageVariants } from "@/lib/cms/articles";
import { cn } from "@/lib/utils";

type ArticleResponsiveImageProps = {
  src: string | null;
  alt: string;
  width?: number | null;
  height?: number | null;
  variants?: CmsArticleImageVariants | null;
  mode?: "card" | "hero";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

function sourceFromVariant(variant: CmsArticleImageVariant | null | undefined, fallbackMedia: string) {
  if (!variant?.url) {
    return null;
  }

  return {
    srcSet: variant.url,
    media: variant.media ?? fallbackMedia,
    type: variant.mimeType ?? undefined,
    width: variant.width ?? undefined,
    height: variant.height ?? undefined,
  };
}

export function ArticleResponsiveImage({
  src,
  alt,
  width,
  height,
  variants,
  mode = "card",
  className,
  imageClassName,
  priority = false,
}: ArticleResponsiveImageProps) {
  const hero = variants?.hero ?? null;
  const card = variants?.card ?? null;
  const thumbnail = variants?.thumbnail ?? null;
  const preload = variants?.preload ?? null;
  const fallbackSrc = preload?.url ?? (mode === "hero" ? hero?.url ?? card?.url : card?.url ?? hero?.url) ?? thumbnail?.url ?? src;

  if (!fallbackSrc) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "block overflow-hidden bg-[var(--fm-surface-muted)]",
          "before:block before:h-full before:w-full before:bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_45%),repeating-linear-gradient(135deg,rgba(11,60,71,0.08)_0,rgba(11,60,71,0.08)_1px,transparent_1px,transparent_14px)]",
          className
        )}
      />
    );
  }

  const fallbackWidth = width ?? (mode === "hero" ? hero?.width ?? card?.width : card?.width ?? hero?.width) ?? 1200;
  const fallbackHeight = height ?? (mode === "hero" ? hero?.height ?? card?.height : card?.height ?? hero?.height) ?? 800;
  const sources =
    mode === "hero"
      ? [
          sourceFromVariant(hero, "(min-width: 1140px)"),
          sourceFromVariant(card, "(min-width: 768px)"),
          sourceFromVariant(thumbnail, "(max-width: 767px)"),
        ]
      : [
          sourceFromVariant(card, "(min-width: 768px)"),
          sourceFromVariant(thumbnail, "(max-width: 767px)"),
        ];

  return (
    <picture className={cn("block overflow-hidden bg-[var(--fm-surface-muted)]", className)}>
      {sources.map((source) =>
        source ? (
          <source
            key={`${source.media}:${source.srcSet}`}
            media={source.media}
            srcSet={source.srcSet}
            type={source.type}
            width={source.width}
            height={source.height}
          />
        ) : null
      )}
      <img
        src={fallbackSrc}
        alt={alt}
        width={fallbackWidth}
        height={fallbackHeight}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn("h-full w-full object-cover", imageClassName)}
      />
    </picture>
  );
}
