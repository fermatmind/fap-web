import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { buildDefaultMbtiSceneBlocks } from "@/lib/mbti/sceneBlocks";
import {
  buildMbtiEntryTrackingPayload,
  type MbtiEntrySourcePageType,
} from "@/lib/mbti/entryTracking";
import type { Locale } from "@/lib/i18n/locales";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

type SceneBlock = {
  key: string;
  title: string;
  body: string;
  href: string | null;
};

type MbtiSceneEntrySectionProps = {
  locale: Locale;
  sourcePageType: MbtiEntrySourcePageType;
  blocks?: SceneBlock[] | null;
  testId?: string;
};

export function MbtiSceneEntrySection({
  locale,
  sourcePageType,
  blocks,
  testId = "mbti-scene-entry-section",
}: MbtiSceneEntrySectionProps) {
  const fallbackBlocks = buildDefaultMbtiSceneBlocks(locale);
  const fallbackByKey = new Map(fallbackBlocks.map((block) => [block.key, block]));
  const sourceBlocks = Array.isArray(blocks) && blocks.length > 0 ? blocks : fallbackBlocks;
  const resolvedBlocks = sourceBlocks
    .map((block) => {
      const key = String(block.key ?? "").trim();
      const fallback = fallbackByKey.get(key);
      const title = String(block.title ?? "").trim() || fallback?.title || "";
      const body = String(block.body ?? "").trim() || fallback?.body || "";
      const href = normalizeInternalHref(block.href) || normalizeInternalHref(fallback?.href) || "";
      if (!title || !body || !href) {
        return null;
      }
      return {
        key: key || fallback?.key || href,
        title,
        body,
        href,
      };
    })
    .filter((block): block is { key: string; title: string; body: string; href: string } => block !== null);

  if (resolvedBlocks.length === 0) {
    return null;
  }

  return (
    <section
      className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {resolvedBlocks.map((block) => (
          <article key={block.key} className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p>
            <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p>
            <TrackedEntryCtaLink
              href={block.href}
              data-testid={`mbti-scene-entry-${block.key}`}
              className="inline-flex text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
              eventProperties={buildMbtiEntryTrackingPayload({
                locale,
                entrySurface: "mbti_scene_block",
                sourcePageType,
                targetAction: `open_scene_${block.key}`,
              })}
            >
              {locale === "zh" ? "查看入口" : "Open entry"}
            </TrackedEntryCtaLink>
          </article>
        ))}
      </div>
    </section>
  );
}
