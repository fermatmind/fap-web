import { notFound } from "next/navigation";
import { BigFiveReportPreview } from "@/components/result/big5/BigFiveReportPreview";
import { portrait } from "@/components/result/big5/bigFiveReportPreviewCopy";
import sample from "@/lib/reports/fixed-samples/zh-big5_120.json";

export const metadata = {
  title: "大五人格报告预览",
  robots: { index: false, follow: false },
};

export default async function BigFiveReportPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { locale } = await params;
  if (locale !== "zh") notFound();

  const engine = sample.big5_report_engine_v2;
  const domains = sample.big5_public_projection_v1.trait_vector;
  const labels = new Map<string, string>();
  for (const section of sample.report.sections) {
    if (section.section_key !== "facet_details") continue;
    for (const block of section.blocks) {
      const copy = block.resolved_copy;
      if ("facet_code" in copy && "label_zh" in copy && copy.facet_code && copy.label_zh) {
        labels.set(copy.facet_code, copy.label_zh);
      }
    }
  }

  return (
    <BigFiveReportPreview
      domains={domains}
      heroFacets={portrait.facetCodes.flatMap((code) => {
        const label = labels.get(code);
        const facet = engine.score_vector.facets[code];
        return label ? [{ code, label, percentile: facet.percentile }] : [];
      })}
      questionCount={sample.big5_form_v1.question_count}
    />
  );
}
