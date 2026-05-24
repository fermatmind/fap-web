import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createScaleRolloutEnvSnapshot, resolveScaleRollout } from "@/lib/rollout/scaleRollout";

const ROOT = process.cwd();

function readSource(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

describe("scale rollout identity bucketing contract", () => {
  it("uses stable request identity seeds for percentage rollout buckets", () => {
    const envSnapshot = createScaleRolloutEnvSnapshot({
      ENABLE_MBTI: "true",
      ROLLOUT_PERCENT_MBTI: "50",
    });

    const blockedIdentity = resolveScaleRollout({
      scaleCode: "MBTI",
      identitySeed: "anon-a",
      envSnapshot,
    });
    const allowedIdentity = resolveScaleRollout({
      scaleCode: "MBTI",
      identitySeed: "anon-b",
      envSnapshot,
    });
    const fallbackIdentity = resolveScaleRollout({
      scaleCode: "MBTI",
      envSnapshot,
    });

    expect(blockedIdentity.bucket).toBe(97);
    expect(blockedIdentity.percentEnabled).toBe(false);
    expect(blockedIdentity.reasons).toContain("percent_filtered");
    expect(allowedIdentity.bucket).toBe(40);
    expect(allowedIdentity.percentEnabled).toBe(true);
    expect(fallbackIdentity.bucket).toBe(26);
  });

  it("passes the proxy-provided anonymous request identity into landing and take rollout gates", () => {
    const landingSource = readSource("app/(localized)/[locale]/tests/[slug]/page.tsx");
    const takeSource = readSource("app/(localized)/[locale]/tests/[slug]/take/page.tsx");

    expect(landingSource).toContain("x-anon-id");
    expect(takeSource).toContain("x-anon-id");
    expect(landingSource).toMatch(/resolveScaleRollout\(\{[\s\S]*?identitySeed: await readRolloutIdentitySeed\(\),[\s\S]*?\}\)/);
    expect(takeSource).toMatch(/resolveScaleRollout\(\{[\s\S]*?identitySeed: await readRolloutIdentitySeed\(\),[\s\S]*?\}\)/);
  });
});
