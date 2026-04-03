import { describe, expect, it } from "vitest";
import { BIG5_FACETS, BIG5_DOMAIN_ORDER } from "@/lib/big5/taxonomy";
import {
  BIG5_ACTION_SNIPPETS,
  BIG5_DOMAIN_INTERPRETATION,
  BIG5_FACET_GLOSSARY,
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
      expectCleanText(entry.tradeoff, `${domain}.tradeoff`);
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
      expectCleanText(entry.hint, `${entry.facet_code}.hint`);
      expect(BIG5_DOMAIN_ORDER.includes(entry.domain)).toBe(true);
    });
  });

  it("keeps action snippets complete for each domain and band", () => {
    expect(Object.keys(BIG5_ACTION_SNIPPETS).sort()).toEqual([...BIG5_DOMAIN_ORDER].sort());
    BIG5_DOMAIN_ORDER.forEach((domain) => {
      const snippetsByBand = BIG5_ACTION_SNIPPETS[domain];
      expect(snippetsByBand.high.length).toBeGreaterThanOrEqual(2);
      expect(snippetsByBand.mid.length).toBeGreaterThanOrEqual(2);
      expect(snippetsByBand.low.length).toBeGreaterThanOrEqual(2);

      snippetsByBand.high.forEach((item, index) => expectCleanText(item, `${domain}.high.${index}`));
      snippetsByBand.mid.forEach((item, index) => expectCleanText(item, `${domain}.mid.${index}`));
      snippetsByBand.low.forEach((item, index) => expectCleanText(item, `${domain}.low.${index}`));
    });
  });

  it("selects snippets from dominant traits without injecting unrelated fallback traits", () => {
    const selected = selectBig5ActionSnippets({
      dominantTraits: [{ key: "N" }, { key: "C" }],
      traitBands: { N: "high", C: "mid" },
      seedActions: [],
      limit: 6,
    });
    expect(selected.length).toBeGreaterThan(0);
    expect(selected.some((item) => item.includes("weekly decompression routine"))).toBe(true);
    expect(selected.some((item) => item.includes("stable execution routine"))).toBe(true);

    const noSignal = selectBig5ActionSnippets({
      dominantTraits: [],
      traitBands: {},
      seedActions: [],
      limit: 4,
    });
    expect(noSignal).toEqual([]);
  });
});
