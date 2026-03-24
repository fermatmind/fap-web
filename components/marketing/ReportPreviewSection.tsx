import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { ReportPreviewContent, RouteKey } from "./homepageContent";

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
    <section className="fm-home-report-preview py-[clamp(56px,8vw,112px)]" data-testid="home-report-preview-section">
      <Container className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[var(--fm-shadow-md)]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="m-0 text-sm font-semibold text-[var(--fm-trust-blue-strong)]">{content.mockup.summaryTitle}</p>
              <p className="mt-1 text-sm text-[var(--fm-text-muted)]">{content.mockup.summaryText}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="m-0 text-sm font-semibold text-[var(--fm-trust-blue-strong)]">
                {content.mockup.dimensionsTitle}
              </p>
              <div className="mt-2 space-y-2">
                {content.mockup.dimensions.map((dimension) => (
                  <div key={dimension.label}>
                    <p className="mb-1 text-xs text-[var(--fm-text-muted)]">{dimension.label}</p>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[var(--fm-trust-blue)]"
                        style={{ width: `${percentFromValue(dimension.value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="m-0 text-sm font-semibold text-[var(--fm-trust-blue-strong)]">{content.mockup.actionsTitle}</p>
              <ul className="mt-1 space-y-2 text-sm text-[var(--fm-text-muted)]">
                {content.mockup.actionItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="m-0 font-serif text-3xl font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.title}
          </h2>
          <p className="m-0 text-base leading-8 text-[var(--fm-text-muted)]">{content.supporting}</p>

          <div className="space-y-3 pt-2">
            {content.features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{feature.title}</h3>
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
