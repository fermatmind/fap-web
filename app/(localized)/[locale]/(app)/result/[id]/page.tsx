import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { createScaleRolloutEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { verifyResultPagePdfToken } from "@/lib/result/pdfExportToken";
import ResultClient from "./ResultClient";

const RESULT_PAGE_PDF_SURFACE = "mbti.result_page_export.v2";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResultPage({
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
  const pdfMode = query.pdf === "1" && query.surface === RESULT_PAGE_PDF_SURFACE;

  if (pdfMode) {
    const tokenIsValid = await verifyResultPagePdfToken({
      token: query.pdf_token,
      attemptId: id,
      locale,
    });
    if (!tokenIsValid) {
      notFound();
    }
  }

  return (
    <Container
      as="main"
      data-private-result-print-root="true"
      data-pdf-mode={pdfMode ? "true" : undefined}
      data-pdf-ready={pdfMode ? "false" : undefined}
      className={`w-full py-[var(--fm-space-10)] [&:has([data-testid=mbti-result-shell])>h1]:sr-only${pdfMode ? " bg-white pdf-mode print:max-w-none print:bg-white print:px-0 print:py-0" : ""}`}
    >
      <h1 className="mb-[var(--fm-space-4)] mt-0 text-3xl font-bold text-slate-900">{dict.result.title}</h1>
      <ResultClient key={id} attemptId={id} rolloutEnv={rolloutEnv} printMode={pdfMode} />
    </Container>
  );
}
