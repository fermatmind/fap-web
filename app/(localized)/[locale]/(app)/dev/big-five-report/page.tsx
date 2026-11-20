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
  const breakdown = sample.report.sections.find((section) => section.section_key === "domain_deep_dive");
  const domains = sample.big5_public_projection_v1.trait_vector.map((domain) => {
    const copy = breakdown?.blocks.find((block) =>
      block.kind === "trait_atomic" && block.analytics && "trait_code" in block.analytics && block.analytics.trait_code === domain.key
    )?.resolved_copy;
    return {
      ...domain,
      definition: copy && "definition" in copy ? copy.definition : "",
    };
  });

  return (
    <BigFiveReportPreview
      domains={domains}
      focus={focus}
      showPercentiles={engine.norm_evidence.show_precise_percentiles}
      referenceGroup={`${engine.norm_evidence.locale} ${engine.norm_evidence.age_range} 岁参考样本`}
      questionCount={sample.big5_form_v1.question_count}
    />
  );
}
