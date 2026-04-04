import { BIG5_DOMAIN_LABELS, type Big5DomainCode } from "@/lib/big5/taxonomy";

export const BIG5_NORMS_INTERPRETATION = {
  context:
    "This comparison places your trait positions against the same reference sample used for this version of the report.",
  context_missing:
    "This comparison is reading your relative trait shape from the available result data, even when a calibrated norm sample is not fully available.",
  percentile:
    "A percentile is a relative position, not a grade: a higher percentile means this tendency stands out more strongly in the comparison group, while a lower percentile means it stands out less.",
  boundary:
    "Higher or lower does not mean better or worse. It only describes how prominent a tendency is relative to the comparison group.",
};

function formatPercentile(percentile: number | null | undefined): string {
  if (!Number.isFinite(percentile)) {
    return "a visible relative position";
  }

  const rounded = Math.round(Number(percentile));
  return `around the ${rounded}th percentile`;
}

export function buildBig5NormsStandoutLine(params: {
  leadTrait?: string | null;
  leadPercentile?: number | null;
  lowTrait?: string | null;
  lowPercentile?: number | null;
}) {
  const leadTrait = String(params.leadTrait ?? "").trim().toUpperCase() as Big5DomainCode;
  const lowTrait = String(params.lowTrait ?? "").trim().toUpperCase() as Big5DomainCode;
  const leadLabel = BIG5_DOMAIN_LABELS[leadTrait]?.en;
  const lowLabel = BIG5_DOMAIN_LABELS[lowTrait]?.en;

  if (leadLabel && lowLabel && leadTrait !== lowTrait) {
    return `Your clearest relative elevation is ${leadLabel}, which lands ${formatPercentile(params.leadPercentile)}. By contrast, ${lowLabel} is less prominent at ${formatPercentile(params.lowPercentile)}.`;
  }

  if (leadLabel) {
    return `Your clearest relative elevation is ${leadLabel}, which lands ${formatPercentile(params.leadPercentile)} in this comparison.`;
  }

  return "The most useful read here is not a single score, but which tendencies stand out more strongly than the rest in relative terms.";
}
