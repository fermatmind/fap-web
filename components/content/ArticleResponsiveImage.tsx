import type { ReactNode } from "react";

import type { CmsArticleImageVariant, CmsArticleImageVariants } from "@/lib/cms/articles";
import { cmsManagedMediaUrl } from "@/lib/cms/media";
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

const cmsPlaceholderTokens = ["__CMS_MEDIA_LIBRARY_PLACEHOLDER__", "__CMS_"];

function isCmsPlaceholderUrl(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  return cmsPlaceholderTokens.some((token) => value.includes(token));
}

function normalizeSafeArticleMediaUrl(value: string | null | undefined) {
  if (!value || isCmsPlaceholderUrl(value)) {
    return null;
  }

  const normalized = cmsManagedMediaUrl(value);
  if (!normalized || isCmsPlaceholderUrl(normalized)) {
    return null;
  }

  return normalized;
}

function mediaUrlFromVariant(variant: CmsArticleImageVariant | null | undefined) {
  if (!variant) {
    return null;
  }

  return normalizeSafeArticleMediaUrl(variant.url);
}

function uniqueMediaUrls(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const value of values) {
    if (!value || seen.has(value)) {
      continue;
    }

    seen.add(value);
    urls.push(value);
  }

  return urls;
}

function responsiveSrcSet(variants: CmsArticleImageVariants | null | undefined) {
  if (!variants) {
    return undefined;
  }

  const entries = [variants.thumbnail, variants.card, variants.hero]
    .map((variant) => {
      const url = mediaUrlFromVariant(variant);
      const width = Number(variant?.width ?? 0);

      return url && width > 0 ? { url, width } : null;
    })
    .filter((entry): entry is { url: string; width: number } => entry !== null)
    .sort((left, right) => left.width - right.width);
  const seenWidths = new Set<number>();
  const srcSet = entries
    .filter((entry) => {
      if (seenWidths.has(entry.width)) {
        return false;
      }

      seenWidths.add(entry.width);
      return true;
    })
    .map((entry) => `${entry.url} ${entry.width}w`)
    .join(", ");

  return srcSet || undefined;
}

const fallbackVisualClassName =
  "absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(8,99,116,0.24),transparent_30%),radial-gradient(circle_at_78%_72%,rgba(177,222,47,0.2),transparent_34%),linear-gradient(135deg,#eef7f4_0%,#f8fbfa_52%,#dcebe7_100%)]";

function ArticleImageShell({
  className,
  children,
  showFallback,
}: {
  className?: string;
  children?: ReactNode;
  showFallback: boolean;
}) {
  return (
    <span
      aria-hidden={showFallback ? "true" : undefined}
      data-cms-image-fallback={showFallback ? "true" : undefined}
      data-cms-image-state={showFallback ? "fallback" : "candidate"}
      className={cn("relative block overflow-hidden bg-[var(--fm-surface-muted)]", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          fallbackVisualClassName,
          "opacity-100 transition-opacity duration-200"
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-[linear-gradient(90deg,rgba(8,99,116,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(8,99,116,0.08)_1px,transparent_1px)] bg-[size:28px_28px] transition-opacity duration-200",
          showFallback ? "opacity-100" : "opacity-20"
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(8,99,116,0.22)] bg-white/60 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-opacity duration-200",
          showFallback ? "opacity-100" : "opacity-0"
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-1/2 top-1/2 h-px w-28 -translate-x-1/2 bg-[rgba(8,99,116,0.2)] transition-opacity duration-200",
          showFallback ? "opacity-100" : "opacity-0"
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-1/2 top-1/2 h-28 w-px -translate-y-1/2 bg-[rgba(8,99,116,0.16)] transition-opacity duration-200",
          showFallback ? "opacity-100" : "opacity-0"
        )}
      />
      {children}
    </span>
  );
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
  const imageCandidates = uniqueMediaUrls(
    mode === "hero"
      ? [
          mediaUrlFromVariant(hero),
          mediaUrlFromVariant(card),
          mediaUrlFromVariant(thumbnail),
          normalizeSafeArticleMediaUrl(src),
          mediaUrlFromVariant(preload),
        ]
      : [
          mediaUrlFromVariant(card),
          mediaUrlFromVariant(hero),
          mediaUrlFromVariant(thumbnail),
          normalizeSafeArticleMediaUrl(src),
          mediaUrlFromVariant(preload),
        ]
  );

  if (imageCandidates.length === 0) {
    return <ArticleImageShell className={className} showFallback />;
  }

  const activeSrc = imageCandidates[0];
  const activeVariant = mode === "hero"
    ? [hero, card, thumbnail].find((variant) => mediaUrlFromVariant(variant) === activeSrc)
    : [card, hero, thumbnail].find((variant) => mediaUrlFromVariant(variant) === activeSrc);
  const imageWidth = activeVariant?.width ?? width ?? undefined;
  const imageHeight = activeVariant?.height ?? height ?? undefined;
  const srcSet = responsiveSrcSet(variants);
  const sizes = mode === "hero"
    ? "100vw"
    : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

  return (
    <ArticleImageShell className={className} showFallback={false}>
      {activeSrc ? (
        <picture className="relative z-10 block h-full w-full" data-cms-image-rendered="picture">
          <img
            src={activeSrc}
            srcSet={srcSet}
            sizes={srcSet ? sizes : undefined}
            alt={alt}
            width={imageWidth}
            height={imageHeight}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            data-cms-image-rendered="image"
            className={cn(
              "block h-full w-full object-cover object-center transition-opacity duration-200",
              imageClassName
            )}
          />
        </picture>
      ) : null}
    </ArticleImageShell>
  );
}
