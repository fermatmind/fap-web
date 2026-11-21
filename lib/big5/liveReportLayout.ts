import type { Big5AssembledSection } from "./resultAssembler";
import type { Big5ReadingContext } from "./reportReading";
import { BIG5_DOMAIN_ORDER, BIG5_FACET_LABELS } from "./taxonomy";

type Band = "low" | "mid" | "high";
export type LiveTraitReading = {
  definition: string;
  headline: string;
  interpretation: string;
  observation: string;
  application: string;
  experiment: string;
  qualifier: string;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isBand(value: unknown): value is Band {
  return value === "low" || value === "mid" || value === "high";
}

/** Use the same selected atomic block as the rest of the report. No local scoring or band thresholds. */
export function buildBig5LiveReport(context: Big5ReadingContext, visibleSections: Big5AssembledSection[]) {
  const blocks = visibleSections.find((section) => section.key === "domain_deep_dive")?.blocks ?? [];
  const domains = BIG5_DOMAIN_ORDER.flatMap((key) => {
    const block = blocks.find((candidate) =>
      candidate.source_kind === "trait_atomic" && record(candidate.analytics).trait_code === key,
    );
    const band = record(block?.analytics).band;
    const copy = record(block?.resolved_copy);
    const reading = record(copy.reading);
    const definition = text(reading.definition) || text(copy.definition);
    const headline = text(reading.headline);
    const interpretation = text(reading.interpretation);
    const observation = text(reading.observation);
    const application = text(reading.application);
    const experiment = text(reading.experiment);
    if (!isBand(band) || !definition || !headline || !interpretation || !observation || !application || !experiment) return [];
    const score = context.domains.find((domain) => domain.code === key);
    return [{
      key, band, percentile: context.norm.precise ? score?.percentile ?? null : null,
      reading: { definition, headline, interpretation, observation, application, experiment, qualifier: text(copy.interpretation_qualifier) },
    }];
  });
  if (domains.length !== BIG5_DOMAIN_ORDER.length) return null;

  const facetBlocks = visibleSections.find((section) => section.key === "facet_details")?.blocks ?? [];
  const facets = context.facets.flatMap((facet) => {
    const taxonomy = BIG5_FACET_LABELS[facet.code];
    if (!facetBlocks.length || !taxonomy || !context.norm.precise || facet.percentile === null) return [];
    const facetCopy = facetBlocks.map((block) => record(block.resolved_copy)).find((copy) => copy.facet_code === facet.code);
    return [{ key: facet.code, label: text(facetCopy?.label_zh) || taxonomy.zh, percentile: facet.percentile }];
  });

  const referenceGroup = [
    context.norm.sample,
    context.norm.locale,
    context.norm.ageRange ? `${context.norm.ageRange} 岁` : "",
    context.norm.sampleN !== null ? `样本量 ${context.norm.sampleN.toLocaleString("zh-CN")}` : "",
  ].filter(Boolean).join(" · ");
  return { domains, facets, referenceGroup, showPercentiles: context.norm.precise };
}
