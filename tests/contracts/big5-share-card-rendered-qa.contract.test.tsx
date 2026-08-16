import { describe, expect, it } from "vitest";
import { buildSharePageViewModel } from "@/lib/mbti/publicProjection";
import { BIG5_SOURCE_HASH, canonicalShareSummary } from "@/tests/fixtures/big5/canonicalPrivateResult";

describe("Big Five share authority QA", () => {
  it("renders a projection only when the share summary carries canonical authority", () => {
    const summary = canonicalShareSummary();
    const accepted = buildSharePageViewModel(summary);
    expect(accepted.big5Authority?.source_hash).toBe(BIG5_SOURCE_HASH);
    expect(accepted.card).not.toBeNull();

    delete summary.big5_private_result_authority;
    const rejected = buildSharePageViewModel(summary);
    expect(rejected.big5Authority).toBeNull();
    expect(rejected.card).toBeNull();
  });
});
