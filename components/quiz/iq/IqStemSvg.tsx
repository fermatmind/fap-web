"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { fetchIqImageBlob, isAttemptBoundIqAsset } from "@/lib/iq/imageAsset";
import { getLocaleFromPathname } from "@/lib/i18n/locales";
import { useIqImageCache } from "@/components/quiz/iq/IqImageCache";
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
  const source = normalizedImage?.src;
  const protectedAsset = Boolean(source && isAttemptBoundIqAsset(source));
  const cache = useIqImageCache();
  const [loaded, setLoaded] = useState<{ source: string; url?: string; failed?: boolean } | null>(null);

  useEffect(() => {
    if (!source || !protectedAsset) return;
    if (cache) {
      let active = true;
      void cache.load(source)
        .then((url) => { if (active) setLoaded({ source, url }); })
        .catch(() => { if (active) setLoaded({ source, failed: true }); });
      return () => { active = false; };
    }
    const controller = new AbortController();
    let objectUrl: string | undefined;
    let disposed = false;
    const timeout = setTimeout(() => controller.abort(), 15000);
    void fetchIqImageBlob(source, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setLoaded({ source, url: objectUrl });
      })
      .catch(() => {
        // Cleanup aborts belong to an obsolete render; timeouts remain retryable.
        if (!disposed) setLoaded({ source, failed: true });
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      disposed = true;
      clearTimeout(timeout);
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source, protectedAsset, cache]);

  if (!normalizedImage) {
    return null;
  }

  const alt = normalizedImage.alt ?? ariaLabel;
  const cachedUrl = source ? cache?.getUrl(source) : undefined;
  const current: { url?: string; failed?: boolean } | null = loaded?.source === source && loaded?.failed
    ? loaded
    : cachedUrl ? { url: cachedUrl } : loaded?.source === source ? loaded : null;
  if (protectedAsset && !current?.url) {
    const zh = typeof window !== "undefined" && getLocaleFromPathname(window.location.pathname) === "zh";
    return current?.failed ? (
      <span role="status" className="p-3 text-sm text-rose-700">
        {zh ? "图片加载失败，请刷新重试" : "Image failed to load. Refresh to retry"}
      </span>
    ) : (
      <span role="status" aria-label={alt} className="p-3 text-sm text-[var(--fm-text-muted)]">
        {zh ? "图片加载中…" : "Loading image…"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- CMS IQ assets can use authority-provided hosts that are not known at build time.
    <img
      src={protectedAsset ? current?.url : normalizedImage.src}
      alt={alt}
      {...(normalizedImage.width ? { width: normalizedImage.width } : {})}
      {...(normalizedImage.height ? { height: normalizedImage.height } : {})}
      className={cn("h-full w-full object-contain", className)}
      data-testid="iq-image-graphic"
      loading="eager"
      decoding="async"
      draggable={false}
      onError={protectedAsset ? () => setLoaded({ source: normalizedImage.src, failed: true }) : undefined}
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
