import { describe, expect, it } from "vitest";
import { formatCardTitleForUi, formatTestTitleForUi } from "@/lib/ui/testTitleDisplay";

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

describe("card title display helper contract", () => {
  it("applies zh MBTI card-only replacement from 16型人格测试 to 16型人格", () => {
    const out = formatCardTitleForUi({
      title: "MBTI 性格测试（16型人格测试）",
      slug: "mbti-personality-test-16-personality-types",
      locale: "zh",
      surface: "home_highlighted",
    });

    expect(out).toEqual({
      plain: "MBTI 性格测试【16型人格】",
      line1: "MBTI 性格测试【16型人格】",
      line2: "",
      multilineFallback: false,
    });
  });

  it("uses EN multiline fallback when title exceeds surface threshold", () => {
    const out = formatCardTitleForUi({
      title: "Clinical Depression & Anxiety Assessment (Professional Edition)",
      slug: "clinical-depression-anxiety-assessment-professional-edition",
      locale: "en",
      surface: "tests_top_chip",
    });

    expect(out).toEqual({
      plain: "Clinical Depression & Anxiety Assessment 【Professional Edition】",
      line1: "Clinical Depression & Anxiety Assessment",
      line2: "【Professional Edition】",
      multilineFallback: true,
    });
  });

  it("uses EN multiline fallback for home and tests grid cards when title exceeds 36 chars", () => {
    const home = formatCardTitleForUi({
      title: "Clinical Depression & Anxiety Assessment (Professional Edition)",
      slug: "clinical-depression-anxiety-assessment-professional-edition",
      locale: "en",
      surface: "home_highlighted",
    });
    const grid = formatCardTitleForUi({
      title: "Clinical Depression & Anxiety Assessment (Professional Edition)",
      slug: "clinical-depression-anxiety-assessment-professional-edition",
      locale: "en",
      surface: "tests_grid_card",
    });

    expect(home.multilineFallback).toBe(true);
    expect(home.line2).toBe("【Professional Edition】");
    expect(grid.multilineFallback).toBe(true);
    expect(grid.line2).toBe("【Professional Edition】");
  });

  it("keeps detail hero single-line when EN title does not exceed 68 chars", () => {
    const out = formatCardTitleForUi({
      title: "Clinical Depression & Anxiety Assessment (Professional Edition)",
      slug: "clinical-depression-anxiety-assessment-professional-edition",
      locale: "en",
      surface: "tests_detail_hero",
    });

    expect(out).toEqual({
      plain: "Clinical Depression & Anxiety Assessment 【Professional Edition】",
      line1: "Clinical Depression & Anxiety Assessment 【Professional Edition】",
      line2: "",
      multilineFallback: false,
    });
  });

  it("uses EN multiline fallback for detail hero when title exceeds 68 chars", () => {
    const out = formatCardTitleForUi({
      title: "Clinical Depression & Anxiety Assessment and Recovery Guidance Overview (Professional Edition)",
      slug: "clinical-depression-anxiety-assessment-professional-edition",
      locale: "en",
      surface: "tests_detail_hero",
    });

    expect(out.multilineFallback).toBe(true);
    expect(out.line1).toBe("Clinical Depression & Anxiety Assessment and Recovery Guidance Overview");
    expect(out.line2).toBe("【Professional Edition】");
  });

  it("does not replace 16型人格测试 for non-MBTI slugs", () => {
    const out = formatCardTitleForUi({
      title: "MBTI 性格测试（16型人格测试）",
      slug: "big-five-personality-test-ocean-model",
      locale: "zh",
      surface: "tests_grid_card",
    });

    expect(out).toEqual({
      plain: "MBTI 性格测试【16型人格测试】",
      line1: "MBTI 性格测试【16型人格测试】",
      line2: "",
      multilineFallback: false,
    });
  });
});
