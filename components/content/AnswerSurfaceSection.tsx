import Link from "next/link";
import { SeoTrackedCtaLink } from "@/components/cta/SeoTrackedCtaLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import type { EvidencePageFamily } from "@/lib/geo/evidenceContainer";
import type { Locale } from "@/lib/i18n/locales";
import {
  deriveSeoCtaPriorityFromKey,
  extractTargetTestSlugFromHref,
  type SeoCtaPriority,
  type SeoCtaSourceRouteFamily,
} from "@/lib/tracking/seoCtaAttribution";

type AnswerSurfaceSeoCtaAttribution = {
  locale: Locale;
  sourceRouteFamily: SeoCtaSourceRouteFamily;
  sourceSlug: string;
  sourcePath: string;
  contentId?: string | number | null;
  topicId?: string | number | null;
  translationGroupId?: string | number | null;
};

function sectionTitle(key: string, locale: Locale): string {
  const isZh = locale === "zh";

  switch (key) {
    case "summary":
      return isZh ? "快速摘要" : "Quick summary";
    case "faq":
      return "FAQ";
    case "compare":
      return isZh ? "对比线索" : "Comparison cues";
    case "scene":
      return isZh ? "场景摘要" : "Scene summary";
    case "next":
      return isZh ? "下一步" : "Next steps";
    default:
      return isZh ? "快速答案" : "Quick answers";
  }
}

function pathFromHref(href: string): string {
  try {
    return new URL(href, "https://fermatmind.com").pathname;
  } catch {
    return href.split("?")[0] ?? "";
  }
}

function isTrackableTestDetailHref(href: string): boolean {
  const pathname = pathFromHref(href);
  const segments = pathname.split("/").filter(Boolean);
  const testsIndex = segments.indexOf("tests");
  const testSlug = extractTargetTestSlugFromHref(pathname);
  const childSegment = testsIndex >= 0 ? segments[testsIndex + 2] : undefined;

  return Boolean(testSlug) && !["take", "result", "orders", "share", "pay"].includes(childSegment ?? "");
}

function formatAnswerSurfaceLinkLabel(href: string, label: string, locale: Locale): string {
  const pathname = pathFromHref(href);
  if (extractTargetTestSlugFromHref(pathname) === "mbti-personality-test-16-personality-types") {
    return locale === "zh" ? "MBTI免费测试" : "Free MBTI test";
  }

  return label;
}

function renderAnswerSurfaceLink({
  href,
  label,
  locale,
  className,
  ctaId,
  ctaPriority,
  seoCtaAttribution,
}: {
  href: string;
  label: string;
  locale: Locale;
  className: string;
  ctaId: string;
  ctaPriority?: SeoCtaPriority;
  seoCtaAttribution?: AnswerSurfaceSeoCtaAttribution;
}) {
  const targetTestSlug = extractTargetTestSlugFromHref(href);
  const displayLabel = formatAnswerSurfaceLinkLabel(href, label, locale);

  if (seoCtaAttribution && targetTestSlug && isTrackableTestDetailHref(href)) {
    return (
      <SeoTrackedCtaLink
        href={href}
        {...seoCtaAttribution}
        ctaId={ctaId}
        ctaPriority={ctaPriority}
        targetTestSlug={targetTestSlug}
        className={className}
      >
        {displayLabel}
      </SeoTrackedCtaLink>
    );
  }

  return (
    <Link href={href} className={className}>
      {displayLabel}
    </Link>
  );
}

export function AnswerSurfaceSection({
  surface,
  locale,
  testId,
  hideHeading = false,
  hideCompareLabel = false,
  expandSingleSummaryBlock = false,
  pageFamily,
  evidenceSourceType = "answer_surface_v1",
  seoCtaAttribution,
}: {
  surface: AnswerSurfaceViewModel | null | undefined;
  locale: Locale;
  testId?: string;
  hideHeading?: boolean;
  hideCompareLabel?: boolean;
  expandSingleSummaryBlock?: boolean;
  hideSummaryLabel?: boolean;
  pageFamily?: EvidencePageFamily;
  evidenceSourceType?: "answer_surface_v1" | "visible_page_content";
  seoCtaAttribution?: AnswerSurfaceSeoCtaAttribution;
}) {
  if (!surface) {
    return null;
  }

  const hasContent =
    surface.summaryBlocks.length > 0 ||
    surface.faqBlocks.length > 0 ||
    surface.compareBlocks.length > 0 ||
    surface.sceneSummaryBlocks.length > 0 ||
    surface.nextStepBlocks.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId}
      data-evidence-container={pageFamily ? "true" : undefined}
      data-evidence-page-family={pageFamily}
      data-evidence-source-type={pageFamily ? evidenceSourceType : undefined}
    >
      {!hideHeading ? (
        <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "快速答案" : "Quick answers"}
        </h2>
      ) : null}

      {surface.summaryBlocks.length ? (
        <div className="space-y-3" data-evidence-block={pageFamily ? "quick_answer" : undefined}>
          <div className={expandSingleSummaryBlock && surface.summaryBlocks.length === 1 ? "grid gap-3" : "grid gap-3 md:grid-cols-2"}>
            {surface.summaryBlocks.map((block) => (
              <article key={block.key} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
                {block.title ? <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p> : null}
                {block.body ? <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {surface.faqBlocks.length ? (
        <Card data-evidence-block={pageFamily ? "faq" : undefined}>
          <CardHeader>
            <CardTitle>{sectionTitle("faq", locale)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {surface.faqBlocks.map((item) => (
              <div key={item.key} className="space-y-1">
                <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{item.question}</p>
                {item.answer ? <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{item.answer}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {surface.compareBlocks.length ? (
        <div className="space-y-3" data-evidence-block={pageFamily ? "comparison" : undefined}>
          {!hideCompareLabel ? (
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {sectionTitle("compare", locale)}
            </p>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            {surface.compareBlocks.map((block) => (
              <article key={block.key} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
                {block.title ? <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p> : null}
                {block.body ? <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {surface.sceneSummaryBlocks.length ? (
        <div className="space-y-3" data-evidence-block={pageFamily ? "definition" : undefined}>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {sectionTitle("scene", locale)}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {surface.sceneSummaryBlocks.map((block, index) => (
              <article key={block.key} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
                {block.href ? (
                  renderAnswerSurfaceLink({
                    href: block.href,
                    label: block.title || block.href,
                    locale,
                    className: "m-0 text-sm font-medium text-[var(--fm-text)] hover:text-[var(--fm-accent)]",
                    ctaId: block.key || "answer_surface_scene",
                    ctaPriority: deriveSeoCtaPriorityFromKey(block.key, index),
                    seoCtaAttribution,
                  })
                ) : block.title ? (
                  <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p>
                ) : null}
                {block.body ? <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {surface.nextStepBlocks.length ? (
        <div className="space-y-3" data-evidence-block={pageFamily ? "next_step" : undefined}>
          <div className="grid gap-3 md:grid-cols-2">
            {surface.nextStepBlocks.map((block, index) => (
              <article key={block.key} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
                {block.href ? (
                  renderAnswerSurfaceLink({
                    href: block.href,
                    label: block.title || block.href,
                    locale,
                    className: "text-sm font-medium text-[var(--fm-text)] hover:text-[var(--fm-accent)]",
                    ctaId: block.key || "answer_surface_next_step",
                    ctaPriority: deriveSeoCtaPriorityFromKey(block.key, index),
                    seoCtaAttribution,
                  })
                ) : (
                  <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p>
                )}
                {block.body ? <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
