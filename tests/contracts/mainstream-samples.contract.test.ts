import { describe, expect, it } from "vitest";
import { loadFixedSample, loadFixedMbtiSampleContent } from "@/lib/reports/fixedSamples";
import { normalizeEqV5Report } from "@/components/result/eq/utils";
import { resolveEnneagramPrivateResultAuthority } from "@/lib/enneagram/privateResultAuthority";

describe("fixed full-report samples", () => {
  it.each(["zh", "en"] as const)("preserves canonical report integrity in %s", async locale => {
    const eq = await loadFixedSample("eq", locale);
    const enneagram = await loadFixedSample("enneagram", locale);
    expect(eq && normalizeEqV5Report(eq, locale)).toBeTruthy();
    expect(enneagram && resolveEnneagramPrivateResultAuthority(enneagram, locale)).toBeTruthy();
  });
  it("converts the MBTI introduction without changing its type identity", async () => {
    const content = await loadFixedMbtiSampleContent("zh-TW");
    expect(content?.fullCode).toBe("ISFJ-T");
    expect(content?.content.hero.profileIdentity?.introduction).toContain("照顧");
  });
  it("excludes checkout and private ownership from all public samples", async () => {
    for (const locale of ["zh", "en"] as const) {
      for (const family of ["mbti", "big5", "enneagram", "eq", "iq30", "iq40", "archetypes", "cognitive", "disc"]) {
        const sample = await loadFixedSample(family, locale);
        expect(sample).toBeTruthy();
        expect(sample).not.toHaveProperty("report_purchase");
        expect(sample).not.toHaveProperty("offers");
        expect(sample).not.toHaveProperty("anon_id");
        expect(sample).not.toHaveProperty("user_id");
      }
    }
    expect(await loadFixedSample("unknown", "zh")).toBeNull();
  });
});
