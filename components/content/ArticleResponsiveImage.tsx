import type { CSSProperties, ReactNode } from "react";

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
      aria-hidden="true"
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
  variants,
  mode = "card",
  className,
  imageClassName,
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
  const activeImageStyle: CSSProperties | undefined = activeSrc
    ? { backgroundImage: `url(${JSON.stringify(activeSrc)})` }
    : undefined;

  return (
    <ArticleImageShell className={className} showFallback={false}>
      {activeSrc ? (
        <span
          aria-hidden="true"
          data-cms-image-rendered="background"
          style={activeImageStyle}
          className={cn(
            "relative z-10 block h-full w-full bg-cover bg-center bg-no-repeat transition-opacity duration-200",
            imageClassName
          )}
        />
      ) : null}
    </ArticleImageShell>
  );
}
