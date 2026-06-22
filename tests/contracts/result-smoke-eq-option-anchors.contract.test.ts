import fs from "node:fs";
import path from "node:path";

describe("result smoke EQ option anchor coverage", () => {
  it("keeps the live result smoke script aligned with EQ meta.option_anchors fallback", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "scripts/ops/check-live-result-smoke.mjs"),
      "utf8"
    );

    expect(source).toContain('label: "EQ"');
    expect(source).toContain("const anchorOptions = Array.isArray(meta?.option_anchors) ? meta.option_anchors : [];");
    expect(source).toContain("const candidates = [...questionOptions, ...sharedOptions, ...anchorOptions];");
    expect(source).toContain("meta: response.payload?.meta,");
  });
});
