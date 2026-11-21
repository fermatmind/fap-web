import { notFound } from "next/navigation";
import { BigFiveReportPreview } from "@/components/result/big5/BigFiveReportPreview";
import { resolveBigFivePreviewFocus } from "@/components/result/big5/bigFivePreviewPortraits";
import sample from "@/lib/reports/fixed-samples/zh-big5_90.json";

export const metadata = {
  title: "大五人格报告预览",
  robots: { index: false, follow: false },
};

export default async function BigFiveReportPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ focus?: string | string[] }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { locale } = await params;
  if (locale !== "zh") notFound();

  const focus = resolveBigFivePreviewFocus((await searchParams).focus);
  const engine = sample.big5_report_engine_v2;
  const norm = engine.norm_evidence;
  const normGroup = `${norm.sample_label}（${norm.locale}，${norm.age_range} 岁、${norm.gender}，样本量 ${norm.sample_n.toLocaleString("zh-CN")}）`;

  const facetDetails = sample.report.sections.find((section) => section.section_key === "facet_details");
  const facets = sample.big5_public_projection_v1.facet_vector.flatMap((facet) => {
    const copy = facetDetails?.blocks.find(({ kind, resolved_copy }) =>
      kind === "table_row" && "facet_code" in resolved_copy && resolved_copy.facet_code === facet.key
    )?.resolved_copy;
    return copy && "label_zh" in copy && typeof copy.label_zh === "string"
      ? [{ ...facet, label: copy.label_zh }]
      : [];
  });

  return (
    <BigFiveReportPreview
      domains={sample.big5_public_projection_v1.trait_vector}
      facets={facets}
      focus={focus}
      showPercentiles={norm.comparison_allowed && norm.show_precise_percentiles}
      referenceGroup={normGroup}
      questionCount={sample.big5_form_v1.question_count}
    />
  );
}
