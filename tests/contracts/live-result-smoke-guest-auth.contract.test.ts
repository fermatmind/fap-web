import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SMOKE_SCRIPTS = [
  "scripts/ops/check-live-result-smoke.mjs",
  "scripts/ops/check-big5-v2-live-result-pdf.mjs",
];

describe("live result smoke guest auth contract", () => {
  it.each(SMOKE_SCRIPTS)("%s consumes the backend-authoritative fm_token field", (path) => {
    const source = readFileSync(path, "utf8");

    expect(source).toContain("!response.payload?.fm_token");
    expect(source).toContain("!response.payload?.anon_id");
    expect(source).toContain("token: response.payload.fm_token");
    expect(source).not.toMatch(/response\.payload\??\.token\b/);
    expect(source).not.toMatch(/response\.payload\??\.auth_token\b/);
  });
});
