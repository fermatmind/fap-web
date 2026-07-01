import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { createScaleRolloutEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { RESULT_PAGE_SNAPSHOT_SURFACE } from "@/lib/result/pdfSurface";
import { verifyResultPagePdfToken } from "@/lib/result/pdfExportToken";
import ResultClient from "../ResultClient";
import { loadResultPrintBootstrap } from "./resultPrintBootstrap";

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
  const dict = getDictSync(locale);
  const rolloutEnv = createScaleRolloutEnvSnapshot();
  const printAccessToken = firstQueryValue(query.access_token) ?? firstQueryValue(query.result_access_token);
  const requestedSurface = firstQueryValue(query.surface);
  const surfaceIsValid = requestedSurface === RESULT_PAGE_SNAPSHOT_SURFACE;
  const tokenIsValid = surfaceIsValid
    ? await verifyResultPagePdfToken({
        token: printAccessToken,
        attemptId: id,
        locale,
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

  return (
    <Container
      as="main"
      data-private-result-print-root="true"
      data-gotenberg-result-print-root="true"
      data-pdf-mode="true"
      data-pdf-layout="a4-report-dense"
      data-pdf-visual-version="mbti-result-snapshot-a4-v1"
      data-pdf-ready="false"
      data-pdf-bootstrap={printBootstrap.report ? "server" : "failed"}
      className="w-full bg-white py-[var(--fm-space-10)] pdf-mode print:max-w-none print:bg-white print:px-0 print:py-0 [&:has([data-testid=mbti-result-shell])>h1]:sr-only"
    >
      <h1 className="mb-[var(--fm-space-4)] mt-0 text-3xl font-bold text-slate-900">{dict.result.title}</h1>
      <ResultClient
        key={id}
        attemptId={id}
        rolloutEnv={rolloutEnv}
        printMode
        printSnapshotRoute
        printSnapshotSurface={RESULT_PAGE_SNAPSHOT_SURFACE}
        printAccessToken={printAccessToken}
        initialReportAccess={printBootstrap.reportAccess}
        initialReportData={printBootstrap.report}
        snapshotDesktopCloneContent={printBootstrap.desktopCloneContent}
        snapshotContentStatus={printBootstrap.snapshotContentStatus}
        printBootstrapError={printBootstrap.error}
      />
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
