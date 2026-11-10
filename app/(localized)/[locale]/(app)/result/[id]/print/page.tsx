import type { Metadata } from "next";
import { headers } from "next/headers";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { Container } from "@/components/layout/Container";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { createScaleRolloutEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { loadTraditionalAssessmentText, projectTraditionalResultDisplay } from "@/lib/tests/traditionalAssessmentDisplay";
import { RESULT_PAGE_SNAPSHOT_SURFACE } from "@/lib/result/pdfSurface";
import { verifyResultPagePdfToken } from "@/lib/result/pdfExportToken";
import ResultClient from "../ResultClient";
import { loadResultPrintBootstrap } from "./resultPrintBootstrap";
import { MbtiPrintReportContext } from "./MbtiPrintReportContext";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResultPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam, id } = await params;
  const query = (await searchParams) ?? {};
  const locale = resolveLocale(localeParam);
  const printDisplayLocale = query.display_locale === "zh-TW" ? query.display_locale : undefined;
  const displayLocaleValid = query.display_locale === undefined || (locale === "zh" && printDisplayLocale !== undefined);
  const dict = getDictSync(locale);
  const rolloutEnv = createScaleRolloutEnvSnapshot();
  const printAccessToken = firstQueryValue(query.access_token) ?? firstQueryValue(query.result_access_token);
  const requestedSurface = firstQueryValue(query.surface);
  const surfaceIsValid = requestedSurface === RESULT_PAGE_SNAPSHOT_SURFACE;
  const tokenIsValid = surfaceIsValid && displayLocaleValid
    ? await verifyResultPagePdfToken({
        token: printAccessToken,
        attemptId: id,
        locale,
        displayLocale: printDisplayLocale,
        expectedSurface: RESULT_PAGE_SNAPSHOT_SURFACE,
      })
    : false;

  if (!surfaceIsValid || !tokenIsValid) {
    return (
      <ResultPrintErrorShell
        title={dict.result.title}
        errorCode={!surfaceIsValid ? "PDF_SURFACE_MISMATCH" : "PDF_AUTH_INVALID"}
      />
    );
  }

  const printBootstrap = await loadResultPrintBootstrap({
    attemptId: id,
    locale,
    accessToken: printAccessToken,
  });
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const [report, copy] = await Promise.all([
    projectTraditionalResultDisplay(printBootstrap.report, printDisplayLocale ?? locale),
    printDisplayLocale ? loadTraditionalAssessmentText() : undefined,
  ]);
  const { mbti_pdf_content: desktopCloneContent } = await projectTraditionalResultDisplay(
    { mbti_pdf_content: printBootstrap.desktopCloneContent }, printDisplayLocale ?? locale,
  );

  const client = (
    <ResultClient
      key={id}
      attemptId={id}
      rolloutEnv={rolloutEnv}
      printMode
      printDisplayLocale={printDisplayLocale}
      printSnapshotRoute
      printSnapshotSurface={RESULT_PAGE_SNAPSHOT_SURFACE}
      printAccessToken={printAccessToken}
      initialReportAccess={printBootstrap.reportAccess}
      initialReportData={report}
      snapshotDesktopCloneContent={desktopCloneContent}
      snapshotContentStatus={printBootstrap.snapshotContentStatus}
      printBootstrapError={printBootstrap.error}
    />
  );

  return (
    <Container
      as="main"
      lang={printDisplayLocale}
      data-private-result-print-root="true"
      data-gotenberg-result-print-root="true"
      data-pdf-mode="true"
      data-pdf-layout="a4-report-dense"
      data-pdf-visual-version="mbti-result-snapshot-a4-v1"
      data-pdf-ready="false"
      data-pdf-bootstrap={printBootstrap.report ? "server" : "failed"}
      className="w-full bg-white py-[var(--fm-space-10)] pdf-mode print:max-w-none print:bg-white print:px-0 print:py-0 [&:has([data-testid=mbti-result-shell])>h1]:sr-only"
    >
      {/* Keep margin boxes outside the CSS optimizer, which drops these at-rules. */}
      <style nonce={nonce}>{'@page fermat-result-snapshot { @bottom-center { content: counter(page) " / " counter(pages); font-family: Arial, sans-serif; font-size: 8pt; color: #64748b; } }'}</style>
      <h1 className="mb-[var(--fm-space-4)] mt-0 text-3xl font-bold text-slate-900">{copy ? copy(dict.result.title) : dict.result.title}</h1>
      {report && <MbtiPrintReportContext report={report} locale={locale} displayText={copy} />}
      {printDisplayLocale ? <TraditionalQuestionnaireCopy loadingText="正在準備報告…" failureText="報告暫時無法載入，請重新整理後再試。">{client}</TraditionalQuestionnaireCopy> : client}
    </Container>
  );
}

function ResultPrintErrorShell({
  title,
  errorCode,
}: {
  title: string;
  errorCode: "PDF_SURFACE_MISMATCH" | "PDF_AUTH_INVALID";
}) {
  return (
    <Container
      as="main"
      data-private-result-print-root="true"
      data-gotenberg-result-print-root="true"
      data-pdf-mode="true"
      data-pdf-layout="a4-report-dense"
      data-pdf-visual-version="mbti-result-snapshot-a4-v1"
      data-pdf-ready="false"
      data-pdf-error={errorCode}
      data-surface-mismatch={errorCode === "PDF_SURFACE_MISMATCH" ? "true" : undefined}
      className="w-full bg-white py-[var(--fm-space-10)] pdf-mode print:max-w-none print:bg-white print:px-0 print:py-0"
    >
      <h1 className="mb-[var(--fm-space-4)] mt-0 text-3xl font-bold text-slate-900">{title}</h1>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__FERMAT_PDF_READY__ = false; window.__FERMAT_PDF_ERROR__ = ${JSON.stringify(errorCode)};`,
        }}
      />
    </Container>
  );
}

function firstQueryValue(value: string | string[] | undefined): string | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  const normalized = typeof candidate === "string" ? candidate.trim() : "";

  return normalized.length > 0 ? normalized : null;
}
