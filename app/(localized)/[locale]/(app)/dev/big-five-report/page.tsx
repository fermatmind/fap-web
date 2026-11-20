import { notFound } from "next/navigation";
import { BigFiveReportPreview } from "@/components/result/big5/BigFiveReportPreview";
import { facetNormReference } from "@/components/result/big5/bigFiveReportPreviewCopy";
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
  const descriptions = new Map<string, { label: string; meaning: string }>();
  for (const section of sample.report.sections) {
    if (section.section_key !== "facet_details") continue;
    for (const block of section.blocks) {
      const copy = block.resolved_copy;
      if ("facet_code" in copy && "label_zh" in copy && copy.facet_code && copy.label_zh) {
        descriptions.set(copy.facet_code, { label: copy.label_zh, meaning: copy.gloss ?? "" });
      }
    }
  }

  return (
    <BigFiveReportPreview
      domains={domains}
      facets={Object.entries(engine.score_vector.facets).flatMap(([code, facet]) => {
        const description = descriptions.get(code);
        return description ? [{ code, ...description, ...facet }] : [];
      })}
      reference={{
        name: engine.norm_evidence.sample_label,
        domainCount: engine.norm_evidence.sample_n,
        facetCount: sample.norms.origin === "compiled" &&
          sample.norms.group_id === facetNormReference.group &&
          engine.norm_evidence.norm_version === facetNormReference.version ? facetNormReference.count : null,
        ageRange: engine.norm_evidence.age_range,
        version: engine.norm_evidence.norm_version,
        locale: engine.norm_evidence.locale,
        gender: engine.norm_evidence.gender,
        updatedAt: engine.norm_evidence.updated_at.slice(0, 10),
        scoringVersion: sample.meta.scoring_spec_version,
      }}
      questionCount={sample.big5_form_v1.question_count}
    />
  );
}
