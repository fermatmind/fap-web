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
          <div className="fm-home-report-mockup-head">
            <span>{content.mockup.summaryTitle}</span>
            <div className="fm-home-report-mockup-tabs">
              <button type="button">{content.features[0]?.title}</button>
              <button type="button">{content.features[1]?.title}</button>
              <button type="button">{content.features[2]?.title}</button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="fm-home-report-panel">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--fm-trust-blue)]">
                {content.mockup.summaryTitle}
              </p>
              <h3 className="m-0 mt-1 text-xl font-semibold text-[var(--fm-text)]">{content.mockup.summaryText}</h3>
              <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">
                {locale === "zh"
                  ? "我们先给出核心结论，再提供可执行解释，直接用于复盘、沟通与决策。"
                  : "We provide the core conclusion first, then a practical interpretation for review, communication, and decision making."}
              </p>
            </div>

            <div className="fm-home-report-panel">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--fm-trust-blue)]">
                {content.mockup.dimensionsTitle}
              </p>
              <div className="space-y-3">
                {content.mockup.dimensions.map((dimension) => (
                  <div key={dimension.label} className="space-y-1.5">
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
              <ul className="space-y-2 text-sm leading-7 text-[var(--fm-text-muted)]">
                {content.mockup.actionItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--fm-trust-blue)]" />
                    <span>{item}</span>
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
          <p className="m-0 text-base leading-8 text-[var(--fm-text-muted)]">{content.supporting}</p>

          <div className="space-y-3 pt-2">
            {content.features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="m-0 text-lg font-semibold text-[var(--fm-text)]">{feature.title}</h3>
                <p className="m-0 mt-1 text-sm text-[var(--fm-text-muted)]">{feature.body}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
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
