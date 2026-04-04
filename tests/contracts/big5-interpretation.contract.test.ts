import { describe, expect, it } from "vitest";
import { BIG5_FACETS, BIG5_DOMAIN_ORDER } from "@/lib/big5/taxonomy";
import {
  BIG5_ACTION_SNIPPETS,
  BIG5_DOMAIN_INTERPRETATION,
  BIG5_FACET_GLOSSARY,
  BIG5_NORMS_INTERPRETATION,
  buildBig5NormsStandoutLine,
  selectBig5ActionPlan,
  selectBig5ActionSnippets,
} from "@/lib/big5/interpretation";

const DIRTY_MARKERS = ["placeholder", "todo", "tbd", "xxx", "待补", "占位"];

function expectCleanText(value: string, context: string) {
  const normalized = value.trim();
  expect(normalized.length, `${context} should not be empty`).toBeGreaterThan(0);
  DIRTY_MARKERS.forEach((marker) => {
    expect(normalized.toLowerCase().includes(marker), `${context} should not contain ${marker}`).toBe(false);
  });
}

describe("big5 interpretation registry contract", () => {
  it("keeps domain interpretation complete across all canonical domains and bands", () => {
    expect(Object.keys(BIG5_DOMAIN_INTERPRETATION).sort()).toEqual([...BIG5_DOMAIN_ORDER].sort());

    BIG5_DOMAIN_ORDER.forEach((domain) => {
      const entry = BIG5_DOMAIN_INTERPRETATION[domain];
      expect(entry.domain_id).toBe(domain);
      expectCleanText(entry.definition, `${domain}.definition`);
      expectCleanText(entry.bands.high, `${domain}.bands.high`);
      expectCleanText(entry.bands.mid, `${domain}.bands.mid`);
      expectCleanText(entry.bands.low, `${domain}.bands.low`);
      expectCleanText(entry.upside, `${domain}.upside`);
      expectCleanText(entry.tradeoff, `${domain}.tradeoff`);
      expectCleanText(entry.impression, `${domain}.impression`);
      expectCleanText(entry.scene_line, `${domain}.scene_line`);
    });
  });

  it("keeps facet glossary aligned with taxonomy and non-empty", () => {
    expect(BIG5_FACET_GLOSSARY).toHaveLength(BIG5_FACETS.length);
    expect(new Set(BIG5_FACET_GLOSSARY.map((entry) => entry.facet_code)).size).toBe(BIG5_FACETS.length);
    expect(BIG5_FACET_GLOSSARY.map((entry) => entry.facet_code).sort()).toEqual(
      BIG5_FACETS.map((entry) => entry.facet_code).sort()
    );

    BIG5_FACET_GLOSSARY.forEach((entry) => {
      expectCleanText(entry.label, `${entry.facet_code}.label`);
      expectCleanText(entry.gloss, `${entry.facet_code}.gloss`);
      expectCleanText(entry.why_it_matters, `${entry.facet_code}.why_it_matters`);
      expectCleanText(entry.high_cue, `${entry.facet_code}.high_cue`);
      expectCleanText(entry.low_cue, `${entry.facet_code}.low_cue`);
      expectCleanText(entry.daily_signal, `${entry.facet_code}.daily_signal`);
      expectCleanText(entry.hint, `${entry.facet_code}.hint`);
      expect(BIG5_DOMAIN_ORDER.includes(entry.domain)).toBe(true);
    });
  });

  it("keeps grouped action snippets complete for each domain and band", () => {
    expect(Object.keys(BIG5_ACTION_SNIPPETS).sort()).toEqual([...BIG5_DOMAIN_ORDER].sort());
    BIG5_DOMAIN_ORDER.forEach((domain) => {
      const snippetsByBand = BIG5_ACTION_SNIPPETS[domain];
      (["high", "mid", "low"] as const).forEach((band) => {
        const pack = snippetsByBand[band];
        expect(pack.leverage?.length ?? 0).toBeGreaterThanOrEqual(2);
        expect(pack.watch_out?.length ?? 0).toBeGreaterThanOrEqual(2);
        expect(pack.experiment?.length ?? 0).toBeGreaterThanOrEqual(2);
        pack.leverage?.forEach((item, index) => expectCleanText(item, `${domain}.${band}.leverage.${index}`));
        pack.watch_out?.forEach((item, index) => expectCleanText(item, `${domain}.${band}.watch_out.${index}`));
        pack.experiment?.forEach((item, index) => expectCleanText(item, `${domain}.${band}.experiment.${index}`));
      });
    });
  });

  it("keeps norms interpretation readable and bounded", () => {
    expectCleanText(BIG5_NORMS_INTERPRETATION.context, "norms.context");
    expectCleanText(BIG5_NORMS_INTERPRETATION.context_missing, "norms.context_missing");
    expectCleanText(BIG5_NORMS_INTERPRETATION.percentile, "norms.percentile");
    expectCleanText(BIG5_NORMS_INTERPRETATION.boundary, "norms.boundary");

    const standout = buildBig5NormsStandoutLine({
      leadTrait: "O",
      leadPercentile: 88,
      lowTrait: "N",
      lowPercentile: 28,
    });
    expect(standout).toContain("Openness");
    expect(standout).toContain("28th percentile");
  });

  it("selects grouped actions from dominant traits without injecting unrelated fallback traits", () => {
    const selected = selectBig5ActionPlan({
      dominantTraits: [{ key: "N" }, { key: "C" }],
      traitBands: { N: "high", C: "mid" },
      seedActions: ["Block one decompression ritual after the week's hardest task."],
    });

    expect(selected.leverage.length).toBeGreaterThan(0);
    expect(selected.watch_out.length).toBeGreaterThan(0);
    expect(selected.experiment.length).toBeGreaterThan(0);
    expect(selected.experiment[0]).toContain("decompression ritual");

    const flattened = selectBig5ActionSnippets({
      dominantTraits: [{ key: "N" }, { key: "C" }],
      traitBands: { N: "high", C: "mid" },
      seedActions: [],
      limit: 6,
    });
    expect(flattened.some((item) => item.includes("stress"))).toBe(true);
    expect(flattened.some((item) => item.includes("reset ritual"))).toBe(true);
    expect(flattened.some((item) => item.includes("curiosity feeds action"))).toBe(false);

    const noSignal = selectBig5ActionPlan({
      dominantTraits: [],
      traitBands: {},
      seedActions: [],
    });
    expect(noSignal).toEqual({ leverage: [], watch_out: [], experiment: [] });
  });
});
