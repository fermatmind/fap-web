import type { Metadata } from "next";
import ClinicalReportClient from "@/components/clinical/report/ClinicalReportClient";
import { Container } from "@/components/layout/Container";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { createScaleRolloutEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AttemptReportPage({
  params,
}: {
  params: Promise<{ locale: string; attemptId: string }>;
}) {
  const { locale: localeParam, attemptId } = await params;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const rolloutEnv = createScaleRolloutEnvSnapshot();

  return (
    <Container as="main" className="w-full max-w-4xl py-10">
      <h1 className="mb-4 mt-0 text-3xl font-bold text-slate-900">{dict.result.title}</h1>
      <ClinicalReportClient key={attemptId} attemptId={attemptId} rolloutEnv={rolloutEnv} />
    </Container>
  );
}
