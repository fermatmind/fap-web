import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { RouteKey, ReportPreviewContent } from "./homepageContent";

type ReportPreviewSectionProps = {
  locale: Locale;
  content: ReportPreviewContent;
  routes: Pick<Record<RouteKey, string>, "help" | "articles" | "mbtiDetail">;
};

export function ReportPreviewSection({ locale, content, routes }: ReportPreviewSectionProps) {
  const withLocale = (path: string) => localizedPath(path, locale);
  const percentFromValue = (value: string) => {
    const match = value.match(/(\d+)%/);
    return match ? Number(match[1]) : 50;
  };

  return (
    <section className="fm-home-section-shell" data-testid="home-report-preview-section">
      <Container className="max-w-[1200px] grid gap-8 md:gap-10 lg:grid-cols-2 lg:items-start">
        <article className="fm-home-report-mockup">
          <p className="fm-home-preview-kicker">{content.mockup.summaryTitle}</p>
          <h2 className="m-0 mt-1 text-xl font-semibold leading-tight text-[var(--fm-text)]">{content.mockup.summaryText}</h2>

          <div className="mt-4 space-y-4">
            <div className="fm-home-report-panel">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--fm-trust-blue)]">
                {content.mockup.summaryTitle}
              </p>
              <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">
                {locale === "zh"
                  ? "先看结论，再看结构，再决定下一步。"
                  : "First check the conclusion, then structure, then decide your next action."}
              </p>
            </div>

            <div className="fm-home-report-panel">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--fm-trust-blue)]">
                {content.mockup.dimensionsTitle}
              </p>
              <div className="space-y-2.5">
                {content.mockup.dimensions.map((dimension) => (
                  <div key={dimension.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--fm-text)]">{dimension.label}</span>
                      <span className="text-[var(--fm-text-muted)]">{dimension.value}</span>
                    </div>
                    <div className="fm-home-preview-progress">
                      <span
                        className="fm-home-preview-progress-fill"
                        style={{ width: `${percentFromValue(dimension.value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fm-home-report-panel">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--fm-trust-blue)]">
                {content.mockup.actionsTitle}
              </p>
              <ul className="mt-1.5 space-y-1.5 text-sm leading-7 text-[var(--fm-text-muted)]">
                {content.mockup.actionItems.map((item) => (
                  <li key={item} className="list-disc pl-1 marker:text-[var(--fm-trust-blue)]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <div className="space-y-4">
          <h2 className="m-0 text-3xl font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.title}
          </h2>
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{content.supporting}</p>

          <div className="space-y-3">
            {content.features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-white p-3 text-sm leading-7 text-[var(--fm-text-muted)]"
              >
                <p className="m-0 text-base font-semibold leading-snug text-[var(--fm-text)]">{feature.title}</p>
                <p className="m-0 mt-1 text-sm">{feature.body}</p>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href={withLocale(content.primaryRoute === "mbtiDetail" ? routes.mbtiDetail : content.primaryRoute)}
              className={buttonVariants({ size: "lg" })}
            >
              {content.primaryCta}
            </Link>
            <Link
              href={withLocale(content.secondaryRoute === "articles" ? routes.articles : routes.help)}
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              {content.secondaryCta}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
