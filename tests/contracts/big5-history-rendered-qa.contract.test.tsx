import { describe, expect, it } from "vitest";
import { normalizeBig5HistoryRows } from "@/lib/big5/secondarySurfaceNormalizer";
import { BIG5_SOURCE_HASH, canonicalHistoryItem } from "@/tests/fixtures/big5/canonicalPrivateResult";

describe("Big Five history authority QA", () => {
  it("propagates canonical authority and drops unbound rows", () => {
    const valid = canonicalHistoryItem();
    const invalid = { ...canonicalHistoryItem("invalid"), big5_private_result_authority: undefined };
    const rows = normalizeBig5HistoryRows([valid, invalid], "zh");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.authority.source_hash).toBe(BIG5_SOURCE_HASH);
  });
});
