import type { Big5PublicProjection, ReportResponse } from "@/lib/api/v0_3";
import { BIG5_DOMAIN_ORDER, BIG5_FACETS, type Big5DomainCode } from "@/lib/big5/taxonomy";

export type Big5ReadingScore = { code: string; band: string | null; mean: number | null; percentile: number | null };
export type Big5ReadingContext = {
  domains: Big5ReadingScore[];
  facets: Big5ReadingScore[];
  norm: { status: string; sample: string; sampleN: number | null; version: string; locale: string; region: string; ageRange: string; explanation: string; precise: boolean };
  quality: { level: string; notice: string };
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function finite(value: unknown): number | null { return typeof value === "number" && Number.isFinite(value) ? value : null; }

// No scores are calculated here. Means and percentiles retain their backend units.
export function buildBig5ReadingContext({ projection, normEvidence, quality, engine, includeFacets = false, includeDomains = true }: {
  projection: Big5PublicProjection | null;
  normEvidence?: Record<string, unknown> | null;
  quality?: Record<string, unknown> | null;
  engine?: ReportResponse["big5_report_engine_v2"];
  includeFacets?: boolean;
  includeDomains?: boolean;
}): Big5ReadingContext {
  const norm = normEvidence ?? {};
  const precise = norm.comparison_allowed === true && norm.show_precise_percentiles === true;
  const scores = (codes: readonly string[], vector: unknown, engineVector: unknown) => {
    const projected = new Map((Array.isArray(vector) ? vector : []).map((value) => {
      const row = record(value);
      return [text(row.key), row] as const;
    }));
    const engineRows = record(engineVector);
    return codes.map((code) => {
      const row = projected.get(code);
      const canonical = record(engineRows[code]);
      return { code, band: includeDomains || includeFacets ? text(canonical.band ?? row?.band ?? row?.bucket) || null : null, mean: finite(row?.mean), percentile: precise && finite(canonical.percentile ?? row?.percentile) !== null && Number(canonical.percentile ?? row?.percentile) >= 0 && Number(canonical.percentile ?? row?.percentile) <= 100 ? finite(canonical.percentile ?? row?.percentile) : null };
    });
  };
  return {
    domains: scores(BIG5_DOMAIN_ORDER, includeDomains ? projection?.trait_vector : [], includeDomains ? engine?.score_vector?.domains : {}),
    facets: scores(BIG5_FACETS.map((facet) => facet.facet_code), includeFacets ? projection?.facet_vector : [], includeFacets ? engine?.score_vector?.facets : {}),
    norm: {
      status: text(norm.status_label) || text(norm.status), sample: text(norm.sample_label),
      sampleN: finite(norm.sample_n), version: text(norm.norm_version), locale: text(norm.locale), region: text(norm.region),
      ageRange: text(norm.age_range), explanation: text(norm.unavailable_explanation) || text(norm.percentile_explanation), precise,
    },
    quality: { level: text(quality?.grade) || text(quality?.level), notice: text(quality?.notice_body) },
  };
}

export const BIG5_READING_SCENARIOS: Record<string, { domains: Big5DomainCode[]; zh: string; en: string; experimentZh: string; experimentEn: string }> = {
  work: { domains: ["C", "O"], zh: "学习与工作", en: "Learning and work", experimentZh: "选一个反复推迟的小任务；在两次相近机会中尝试先做五分钟，记录是否开始、干扰与代价。", experimentEn: "Choose a small task you often postpone. Try a five-minute start on two comparable occasions; record whether you started, interruptions and costs." },
  relationships: { domains: ["A", "E"], zh: "关系与沟通", en: "Relationships and communication", experimentZh: "在一次低风险讨论前写下一句自己的需要，再问对方是否理解；记录回应和你是否仍能表达边界。", experimentEn: "Before one low-stakes discussion, write one sentence about your need, then ask whether it was understood. Record the response and whether you could still express a boundary." },
  recovery: { domains: ["N", "E"], zh: "压力与恢复", en: "Stress and recovery", experimentZh: "在一次可控的忙碌后试五分钟安静休息，记录前后感受、负担和其他变化；不据一次改善认定因果。", experimentEn: "After a manageable busy period, try five quiet minutes. Record feelings, effort and other changes before and after; one improvement does not establish causation." },
};
