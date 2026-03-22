import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import type { Locale } from "@/lib/i18n/locales";

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

export function AnswerSurfaceSection({
  surface,
  locale,
  testId,
}: {
  surface: AnswerSurfaceViewModel | null | undefined;
  locale: Locale;
  testId?: string;
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
    >
      <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
        {locale === "zh" ? "快速答案" : "Quick answers"}
      </h2>

      {surface.summaryBlocks.length ? (
        <div className="space-y-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {sectionTitle("summary", locale)}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
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
        <Card>
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
        <div className="space-y-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {sectionTitle("compare", locale)}
          </p>
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
        <div className="space-y-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {sectionTitle("scene", locale)}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {surface.sceneSummaryBlocks.map((block) => (
              <article key={block.key} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
                {block.title ? <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p> : null}
                {block.body ? <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {surface.nextStepBlocks.length ? (
        <div className="space-y-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {sectionTitle("next", locale)}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {surface.nextStepBlocks.map((block) => (
              <article key={block.key} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
                {block.href ? (
                  <Link href={block.href} className="text-sm font-medium text-[var(--fm-text)] hover:text-[var(--fm-accent)]">
                    {block.title || block.href}
                  </Link>
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
