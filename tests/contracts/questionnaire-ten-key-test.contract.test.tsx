import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isTenKeyConfigurationValid, scoreTenKeyRound, type TenKeyRound } from "@/lib/questionnaires/tenKey";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { TenKeyClient } from "@/components/questionnaires/TenKeyClient";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/ten-key-test.json", "utf8")) as Questionnaire;
const sourceBytes = readFileSync("tests/fixtures/questionnaires/tenkey-reference.json");
const source = JSON.parse(sourceBytes.toString());
const example = (mode: number, expected: string[], entered: string[]) => {
  const round = structuredClone(quiz.tenKey!.rounds[mode]);
  round.values.splice(0, expected.length, ...expected);
  return scoreTenKeyRound(round, entered.map((text, index) => ({ text, atMs: 1000 + index * 1000 })), 60_000);
};

describe("T134 real 60-second numeric entry", () => {
  it("binds three original 240-value lists and all three complete guides to independently saved source bytes", () => {
    expect(quiz.tenKey).toEqual(source.tenKey); expect(quiz.questions).toEqual(source.questions);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(sourceBytes).digest("hex"));
    const profiles = readFileSync("tests/fixtures/questionnaires/tenkey-profiles-reference.json");
    expect(quiz.profiles).toEqual(JSON.parse(profiles.toString()));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profiles).digest("hex"));
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.tenKey!.rounds.map(round => round.id)).toEqual(["whole", "decimals", "references"]);
    for (const round of quiz.tenKey!.rounds) expect(new Set(round.values).size).toBe(240);
    expect(quiz.tenKey!.rounds[2].values.every(value => /^00[0-9]{4}$/.test(value))).toBe(true);
    expect(isTenKeyConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(quiz.profiles.map(profile => profile.sections.length)).toEqual([7, 7, 7]);
    for (const profile of quiz.profiles) {
      expect(profile.sections.reduce((n, section) => n + section.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(400);
      expect(profile.sections.every(section => section.paragraphs.every(p => p.en && /\p{Script=Han}/u.test(p.zh)))).toBe(true);
    }
    expect(readFileSync("public/fonts/noto-sans-sc/ten-key-test-700.ttf").byteLength).toBeLessThan(300000);
  });

  it("recomputes all three published worked minutes with separate entry and character denominators", () => {
    const integer = example(0, ["4821", "730", "90564"], ["4821", "703", "90564"]);
    const decimal = example(1, ["12.50", "7.05", "81.40"], ["1250", "7.50", "81.40"]);
    const reference = example(2, ["000482", "003196", "004173"], ["482", "003196", "004713"]);
    expect(integer).toMatchObject({ status: "complete", confirmedCharacters: 12, separators: 3, confirmedKph: 900, exactEntryKph: 660, correctEntries: 2, wrongEntries: 1, correctCharacters: 10, comparedCharacters: 12 });
    expect(decimal).toMatchObject({ status: "complete", confirmedKph: 960, exactEntryKph: 360, correctEntries: 1, correctCharacters: 9, comparedCharacters: 14 });
    expect(reference).toMatchObject({ status: "complete", confirmedKph: 1080, exactEntryKph: 420, correctEntries: 1, correctCharacters: 10, comparedCharacters: 18 });
    if (integer.status !== "complete" || decimal.status !== "complete" || reference.status !== "complete") throw Error("Worked minute rejected");
    expect(integer.entryErrorRate).toBeCloseTo(100 / 3); expect(integer.characterAccuracy).toBeCloseTo(1000 / 12);
    expect(decimal.entryErrorRate).toBeCloseTo(200 / 3); expect(decimal.characterAccuracy).toBeCloseTo(900 / 14);
    expect(reference.characterAccuracy).toBeCloseTo(1000 / 18);
  });

  it("keeps the 60-second boundary, missing denominators, blank entries and delayed callback window explicit", () => {
    const round = quiz.tenKey!.rounds[0];
    expect(scoreTenKeyRound(round, [], 59_999)).toEqual({ status: "incomplete" });
    expect(scoreTenKeyRound(round, [], 60_000)).toMatchObject({ status: "complete", elapsedMs: 60_000, confirmedKph: 0, exactEntryKph: 0, entryAccuracy: null, entryErrorRate: null, characterAccuracy: null });
    const blank = scoreTenKeyRound(round, [{ text: "", atMs: 59_999 }], 60_125);
    expect(blank).toMatchObject({ status: "complete", elapsedMs: 60_000, observedElapsedMs: 60_125, confirmedCharacters: 0, separators: 1, confirmedKph: 60, exactEntryKph: 0, entryErrorRate: 100, characterAccuracy: 0 });
    for (const atMs of [-1, 60_000, 60_001, Infinity, NaN]) expect(scoreTenKeyRound(round, [{ text: round.values[0], atMs }], 60_125)).toEqual({ status: "unavailable" });
    expect(scoreTenKeyRound(round, [{ text: round.values[0], atMs: 2000 }, { text: "0", atMs: 1000 }], 60_000)).toEqual({ status: "unavailable" });
    for (const text of [" 1683", "1683 ", "1,683", "１２", "x", "1".repeat(25)]) expect(scoreTenKeyRound(round, [{ text, atMs: 1 }], 60_000)).toEqual({ status: "unavailable" });
    for (const elapsed of [NaN, Infinity, -1]) expect(scoreTenKeyRound(round, [], elapsed)).toEqual({ status: "unavailable" });
    // An unfinished tail is never an entry in this API. The client preserves it separately for review.
    expect(scoreTenKeyRound(round, [{ text: round.values[0], atMs: 1000 }], 60_000)).toMatchObject({ confirmedEntries: 1, correctEntries: 1 });
  });

  it("fails closed on malformed source/configuration and cannot be scored as a choice questionnaire", () => {
    expect(scoreQuestionnaire(quiz, { TENKEY_1: "A" })).toEqual({ status: "unavailable", answered: 0 });
    for (const change of [
      (q: Questionnaire) => { delete q.tenKey; },
      (q: Questionnaire) => { q.tenKey!.rounds.pop(); },
      (q: Questionnaire) => { q.tenKey!.rounds[0].values[1] = q.tenKey!.rounds[0].values[0]; },
      (q: Questionnaire) => { q.tenKey!.rounds[2].values[0] = "482"; },
      (q: Questionnaire) => { q.questions[0].options.push({ id: "A", label: { en: "Wrong", zh: "错误" }, directionId: "whole" }); },
      (q: Questionnaire) => { q.profiles[0].sections.pop(); },
    ]) {
      const invalid = structuredClone(quiz); change(invalid);
      expect(isTenKeyConfigurationValid(invalid)).toBe(false);
      expect(renderToStaticMarkup(<TenKeyClient quiz={invalid} locale="en" />)).toContain("configuration is unavailable");
    }
    expect(scoreTenKeyRound({ ...quiz.tenKey!.rounds[0], values: ["123"] } as TenKeyRound, [], 60_000)).toEqual({ status: "unavailable" });
  });

  it("publishes real-input instructions and all six native full guides without personal scores or type claims", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/ten-key-test`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(html).toContain(quiz.instructions![locale]); expect(html).toContain(locale === "en" ? "Start 60-second practice" : "开始60秒练习");
        expect(html).not.toContain("fm_questionnaire_draft"); expect(html).not.toContain("data-ten-key-result");
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(metadata.title).toBe(quiz.seoTitle[locale]);
        const hub = renderToStaticMarkup(<MoreTests locale={locale} />); expect(hub).toContain(`href="${path}"`); expect(hub).toContain(locale === "en" ? "3 entry modes · 60 seconds per round" : "3种输入模式 · 每轮60秒");
        expect(isMissingFunRoute(`/${locale}/tests/play/ten-key-test`)).toBe(true);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, guideProps = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(guideProps)), meta = await guide.generateMetadata(guideProps), dom = document.createElement("div"); dom.innerHTML = rendered;
          for (const section of profile.sections) for (const p of section.paragraphs) expect(dom.textContent).toContain(p[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(meta.title).toBe(profile.seo!.title[locale]);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/ten-key-test/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/ten-key-test/results/${profile.id}` });
          expect(maps.some(item => item.loc === `https://fermatmind.com${publicPath}`)).toBe(true);
          expect(rendered).not.toContain("data-ten-key-result");
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
