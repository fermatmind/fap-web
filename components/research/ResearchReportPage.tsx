import type { ReactNode } from "react";
import { PublicReviewStatus } from "@/components/public-content/PublicReviewStatus";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import type { Locale } from "@/lib/i18n/locales";
import type { ResearchReport } from "@/lib/research/reports";

type ResearchReportPageProps = {
  report: ResearchReport;
  locale: Locale;
};

function copy(locale: Locale, en: string, zh: string): string {
  return locale === "zh" ? zh : en;
}

function MarkdownBlock({ value }: { value: string }) {
  const rendered = renderSimpleMarkdown(value);
  return rendered ? <div className="space-y-4">{rendered}</div> : null;
}

function ResearchSection({
  title,
  children,
  testId,
}: {
  title: string;
  children: ReactNode;
  testId: string;
}) {
  return (
    <section data-testid={testId} className="border-t border-[var(--fm-border)] py-8">
      <h2 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{title}</h2>
      <div className="mt-4 text-base leading-7 text-[var(--fm-text-muted)]">{children}</div>
    </section>
  );
}

export function ResearchReportPage({ report, locale }: ResearchReportPageProps) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <header className="space-y-5">
        <p className="m-0 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--fm-accent)]">
          {report.researchType || copy(locale, "Research report", "研究报告")}
        </p>
        <h1 className="m-0 text-4xl font-semibold leading-tight text-[var(--fm-text)] md:text-5xl">
          {report.title}
        </h1>
        <p data-testid="research-executive-summary" className="m-0 text-lg leading-8 text-[var(--fm-text-muted)]">
          {report.executiveSummary}
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-[var(--fm-text-muted)]">
          {report.authorName ? <span>{copy(locale, "Author", "作者")}: {report.authorName}</span> : null}
          <PublicReviewStatus review={report.publicReview} locale={locale} testId="research-public-review" />
        </div>
      </header>

      <ResearchSection
        title={copy(locale, "Methodology", "方法说明")}
        testId="research-methodology"
      >
        <MarkdownBlock value={report.methodology} />
      </ResearchSection>

      <ResearchSection
        title={copy(locale, "Sample disclaimer", "样本免责声明")}
        testId="research-sample-disclaimer"
      >
        <MarkdownBlock value={report.sampleDisclaimer} />
      </ResearchSection>

      <ResearchSection
        title={copy(locale, "Claim boundary", "声明边界")}
        testId="research-claim-boundary"
      >
        <MarkdownBlock value={report.claimBoundary} />
      </ResearchSection>

      {report.bodyMd ? (
        <ResearchSection title={copy(locale, "Report body", "报告正文")} testId="research-body">
          <MarkdownBlock value={report.bodyMd} />
        </ResearchSection>
      ) : null}

      <ResearchSection title={copy(locale, "References", "参考资料")} testId="research-references">
        {report.references.length > 0 ? (
          <ol className="m-0 list-decimal space-y-2 pl-5">
            {report.references.map((reference, index) => (
              <li key={`${reference}-${index}`}>{reference}</li>
            ))}
          </ol>
        ) : (
          <p className="m-0">{copy(locale, "References are managed by the CMS payload.", "参考资料由 CMS 载荷管理。")}</p>
        )}
      </ResearchSection>

      <section
        data-testid="research-cta-placeholder"
        className="mt-8 border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-5"
      >
        <h2 className="m-0 text-lg font-semibold text-[var(--fm-text)]">
          {copy(locale, "Downloadable asset", "可下载资产")}
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--fm-text-muted)]">
          {report.downloadableAssetPlaceholder ||
            copy(locale, "Downloadable asset activation is controlled by CMS publish gates.", "可下载资产由 CMS 发布门禁控制。")}
        </p>
      </section>
    </main>
  );
}
