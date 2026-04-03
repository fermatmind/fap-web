import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { big5ReportResponseSchema } from "@/lib/big5/contracts/schemas";
import {
  BIG5_V1_ACCESS_LEVELS,
  BIG5_V1_EMPTY_STATE_POLICIES,
  BIG5_V1_LOCKED_PREVIEW_POLICIES,
  BIG5_V1_SAFE_BLOCK_KINDS,
  BIG5_V1_SECTION_BLUEPRINTS,
  BIG5_V1_SECTION_KEYS,
} from "@/lib/big5/sectionBlueprint";

const FIXTURE_PATH = "tests/fixtures/big5/report_ready.projection.json";

const REQUIRED_SOURCE_FIELD_ALLOWLIST = new Set([
  "report.summary",
  "report.sections",
  "trait_vector",
  "facet_vector",
  "trait_bands",
  "dominant_traits",
  "comparative_v1",
  "norms",
  "quality",
  "ordered_section_keys",
  "top_facets_summary_v1",
  "explainability_summary",
  "action_plan_summary",
  "modules_allowed",
  "modules_preview",
  "controlled_narrative_v1",
  "cultural_calibration_v1",
]);

function readFixture<T>(relPath: string): T {
  const raw = fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
  return JSON.parse(raw) as T;
}

describe("big5 section blueprint skeleton contract", () => {
  it("keeps all 8 blueprints present with unique section_key and page_slot", () => {
    expect(BIG5_V1_SECTION_BLUEPRINTS).toHaveLength(8);
    expect(BIG5_V1_SECTION_BLUEPRINTS.map((item) => item.section_key).sort()).toEqual([...BIG5_V1_SECTION_KEYS].sort());
    expect(new Set(BIG5_V1_SECTION_BLUEPRINTS.map((item) => item.section_key)).size).toBe(8);
    expect(new Set(BIG5_V1_SECTION_BLUEPRINTS.map((item) => item.page_slot)).size).toBe(8);
  });

  it("keeps order stable from page_1 to page_8", () => {
    const orders = BIG5_V1_SECTION_BLUEPRINTS.map((item) => item.order);
    const slots = BIG5_V1_SECTION_BLUEPRINTS.map((item) => item.page_slot);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(slots).toEqual(["page_1", "page_2", "page_3", "page_4", "page_5", "page_6", "page_7", "page_8"]);
  });

  it("keeps source_fields non-empty and inside the known PR1 field set", () => {
    BIG5_V1_SECTION_BLUEPRINTS.forEach((item) => {
      expect(item.source_fields.length).toBeGreaterThan(0);
      item.source_fields.forEach((fieldName) => {
        expect(REQUIRED_SOURCE_FIELD_ALLOWLIST.has(fieldName)).toBe(true);
      });
    });
  });

  it("restricts block kinds, policies, and access levels to allowed enums", () => {
    BIG5_V1_SECTION_BLUEPRINTS.forEach((item) => {
      expect(item.block_kinds_allowed.length).toBeGreaterThan(0);
      item.block_kinds_allowed.forEach((kind) => {
        expect(BIG5_V1_SAFE_BLOCK_KINDS.includes(kind)).toBe(true);
      });
      expect(BIG5_V1_EMPTY_STATE_POLICIES.includes(item.empty_state_policy)).toBe(true);
      expect(BIG5_V1_LOCKED_PREVIEW_POLICIES.includes(item.locked_preview_policy)).toBe(true);
      expect(BIG5_V1_ACCESS_LEVELS.includes(item.access_level)).toBe(true);
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(item.subtitle.trim().length).toBeGreaterThan(0);
    });
  });

  it("uses representative fixture that passes the existing big5 report schema", () => {
    const payload = readFixture<unknown>(FIXTURE_PATH);
    expect(() => big5ReportResponseSchema.parse(payload)).not.toThrow();
  });
});
