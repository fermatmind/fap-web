import { describe, expect, it } from "vitest";
import { formatTestTitleForUi } from "@/lib/ui/testTitleDisplay";

describe("test title display contract", () => {
  it("splits EN bracket titles into two lines and normalizes to 【】", () => {
    const out = formatTestTitleForUi("MBTI Personality Test (16 Personality Types)");
    expect(out).toEqual({
      line1: "MBTI Personality Test",
      line2: "【16 Personality Types】",
      plain: "MBTI Personality Test 【16 Personality Types】",
    });
  });

  it("splits ZH full-width bracket titles into two lines and normalizes to 【】", () => {
    const out = formatTestTitleForUi("MBTI 性格测试（16型人格测试）");
    expect(out).toEqual({
      line1: "MBTI 性格测试",
      line2: "【16型人格测试】",
      plain: "MBTI 性格测试【16型人格测试】",
    });
  });

  it("keeps suffix text after bracket on line2", () => {
    const out = formatTestTitleForUi("智商（IQ）测试");
    expect(out).toEqual({
      line1: "智商",
      line2: "【IQ】测试",
      plain: "智商【IQ】测试",
    });
  });

  it("normalizes square brackets and trims inner spaces", () => {
    const out = formatTestTitleForUi("Big Five Personality Test [ OCEAN Model ]");
    expect(out).toEqual({
      line1: "Big Five Personality Test",
      line2: "【OCEAN Model】",
      plain: "Big Five Personality Test 【OCEAN Model】",
    });
  });

  it("falls back to midpoint split when no brackets are present", () => {
    const out = formatTestTitleForUi("Social Adaptation Index");
    expect(out).toEqual({
      line1: "Social Adaptation",
      line2: "Index",
      plain: "Social Adaptation Index",
    });
  });
});
