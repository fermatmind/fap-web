import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { createScaleRolloutEnvSnapshot } from "@/lib/rollout/scaleRollout";
import ResultClient from "../ResultClient";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResultPrintPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const rolloutEnv = createScaleRolloutEnvSnapshot();

  return (
    <Container
      as="main"
      data-private-result-print-root="true"
      data-gotenberg-result-print-root="true"
      className="w-full bg-white py-[var(--fm-space-10)] print:max-w-none print:bg-white print:px-0 print:py-0 [&:has([data-testid=mbti-result-shell])>h1]:sr-only"
    >
      <h1 className="mb-[var(--fm-space-4)] mt-0 text-3xl font-bold text-slate-900">{dict.result.title}</h1>
      <ResultClient key={id} attemptId={id} rolloutEnv={rolloutEnv} printMode />
    </Container>
  );
}
