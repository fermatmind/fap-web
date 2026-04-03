import { describe, expect, it } from "vitest";
import { BIG5_DOMAIN_ORDER, BIG5_DOMAINS, BIG5_FACETS, BIG5_FACET_LABELS } from "@/lib/big5/taxonomy";

describe("big5 taxonomy registry contract", () => {
  it("keeps the canonical domain order complete and unique", () => {
    expect(BIG5_DOMAIN_ORDER).toEqual(["O", "C", "E", "A", "N"]);
    expect(new Set(BIG5_DOMAIN_ORDER).size).toBe(5);
  });

  it("keeps domain registry aligned with canonical order", () => {
    expect(BIG5_DOMAINS).toHaveLength(5);
    expect(BIG5_DOMAINS.map((domain) => domain.id)).toEqual([...BIG5_DOMAIN_ORDER]);
    expect(BIG5_DOMAINS.map((domain) => domain.order)).toEqual([1, 2, 3, 4, 5]);
    BIG5_DOMAINS.forEach((domain) => {
      expect(domain.display_name.en.trim().length).toBeGreaterThan(0);
      expect(domain.display_name.zh.trim().length).toBeGreaterThan(0);
      expect(domain.short_label.en.trim().length).toBeGreaterThan(0);
      expect(domain.short_label.zh.trim().length).toBeGreaterThan(0);
    });
  });

  it("keeps facet catalog complete, non-empty, unique, and domain-safe", () => {
    expect(BIG5_FACETS).toHaveLength(30);
    const seenCodes = new Set<string>();
    const seenOrders = new Set<number>();

    BIG5_FACETS.forEach((facet) => {
      expect(facet.facet_code).toMatch(/^[OCEAN][1-6]$/);
      expect(BIG5_DOMAIN_ORDER.includes(facet.domain)).toBe(true);
      expect(facet.display_label.en.trim().length).toBeGreaterThan(0);
      expect(facet.display_label.zh.trim().length).toBeGreaterThan(0);
      expect(seenCodes.has(facet.facet_code)).toBe(false);
      expect(seenOrders.has(facet.order)).toBe(false);
      seenCodes.add(facet.facet_code);
      seenOrders.add(facet.order);
    });
  });

  it("keeps exactly six facets per domain with stable local ordering", () => {
    BIG5_DOMAIN_ORDER.forEach((domainCode) => {
      const domainFacets = BIG5_FACETS.filter((facet) => facet.domain === domainCode);
      expect(domainFacets).toHaveLength(6);
      expect(domainFacets.map((facet) => Number(facet.facet_code.slice(1)))).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  it("keeps the label lookup table aligned with facet catalog", () => {
    const codes = BIG5_FACETS.map((facet) => facet.facet_code);
    expect(Object.keys(BIG5_FACET_LABELS).sort()).toEqual([...codes].sort());
    codes.forEach((code) => {
      expect(BIG5_FACET_LABELS[code]?.en?.trim().length).toBeGreaterThan(0);
      expect(BIG5_FACET_LABELS[code]?.zh?.trim().length).toBeGreaterThan(0);
    });
  });
});
