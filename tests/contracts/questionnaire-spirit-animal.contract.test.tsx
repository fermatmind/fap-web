import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid, readQuestionnaireDraft, scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/spirit-animal.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/spirit-animal-reference.json");
const reference = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"] };
const allA = (): QuestionnaireAnswers => Object.fromEntries(reference.questions.map(q => [q.id, "A"]));
const oracle = (answers: QuestionnaireAnswers) => {
  const counts: Record<string, number> = { wolf: 0, owl: 0, fox: 0, lion: 0, dolphin: 0, deer: 0, bear: 0, eagle: 0 };
  for (const question of reference.questions) {
    const option = question.options.find(o => o.id === answers[question.id]);
    if (!option) throw new Error("Reference witness must be complete");
    counts[option.directionId]++;
  }
  const max = Math.max(...Object.values(counts));
  return { counts, winners: Object.keys(counts).filter(id => counts[id] === max).sort() };
};

describe("T004 original Spirit Animal / overlapping T030 inner animal task", () => {
  it("preserves16original scenarios, equal8exposures, balanced visible positions and eight complete bilingual metaphors", () => {
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.questions).toHaveLength(16);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(isArchetypeConfigurationValid(quiz)).toBe(true); expect(quiz.profiles).toHaveLength(8);
    expect(quiz.title).toEqual({ zh: "精神动物测试", en: "Spirit Animal Test" });
    for (const direction of quiz.directions) {
      expect(direction.comparisons).toBe(8);
      for (const position of [0, 1, 2, 3]) expect(quiz.questions.filter(q => q.options[position].directionId === direction.id)).toHaveLength(2);
    }
    for (const profile of quiz.profiles) {
      expect(profile.sections).toHaveLength(9);
      expect(new Set(profile.sections.map(s => s.id)).size).toBe(9);
      expect(profile.sections.reduce((n, s) => n + s.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(300);
    }
    const check = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      const v = value as Record<string, unknown>;
      if ("en" in v || "zh" in v) {
        expect(String(v.en)).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u);
        expect(String(v.en).length).toBeGreaterThan(0); expect(String(v.zh)).toMatch(/\p{Script=Han}/u);
      } else Object.values(v).forEach(check);
    };
    check(quiz);
  });

  it("matches independent source addition for every item-option mutation,512varied complete answers and each reachable animal", () => {
    const witnesses: QuestionnaireAnswers[] = [allA()];
    for (const question of reference.questions) for (const option of question.options) witnesses.push({ ...allA(), [question.id]: option.id });
    let state = 3751;
    for (let n = 0; n < 512; n++) witnesses.push(Object.fromEntries(reference.questions.map(q => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return [q.id, q.options[(state >>> 16) % 4].id];
    })));
    for (const direction of quiz.directions) {
      const answer = Object.fromEntries(reference.questions.map(q => [q.id, (q.options.find(o => o.directionId === direction.id) ?? q.options.find(o => o.directionId !== direction.id)!).id]));
      const result = scoreArchetypeQuestionnaire(quiz, answer);
      if (result.status !== "complete") throw new Error("Animal witness rejected");
      expect(result.counts[direction.id]).toBe(8); expect(result.profileIds).toEqual([direction.id]);
      witnesses.push(answer);
    }
    for (const answer of witnesses) {
      const expected = oracle(answer), actual = scoreArchetypeQuestionnaire(quiz, answer);
      if (actual.status !== "complete") throw new Error("Complete source witness rejected");
      expect(actual.counts).toEqual(expected.counts); expect([...actual.profileIds].sort()).toEqual(expected.winners);
      expect(Object.values(actual.counts).reduce((n, v) => n + v, 0)).toBe(16);
      expect(actual).not.toHaveProperty("percentile"); expect(actual).not.toHaveProperty("matchPercentage");
    }
    expect(witnesses).toHaveLength(585);
    console.info("Spirit Animal:585source-based complete witnesses (64single-option mutations,512varied answers,8unique animal leaders and1eight-way tie). Not an enumeration of4^16answer patterns or psychometric validation.");
  });

  it("keeps all eight highest ties, withholds partial results and rejects malformed input or configuration", () => {
    const tie = scoreArchetypeQuestionnaire(quiz, allA());
    if (tie.status !== "complete") throw new Error("Balanced witness rejected");
    expect(Object.values(tie.counts)).toEqual(Array(8).fill(2)); expect(new Set(tie.profileIds)).toEqual(new Set(quiz.profiles.map(p => p.id)));
    const reordered = structuredClone(quiz); reordered.profiles.reverse();
    const same = scoreArchetypeQuestionnaire(reordered, allA());
    if (same.status !== "complete") throw new Error("Reordered source rejected");
    expect(new Set(same.profileIds)).toEqual(new Set(tie.profileIds));
    const partial = allA(); delete partial.SPIRIT_16;
    expect(scoreArchetypeQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 15 });
    for (const invalid of [null, [], new Date(), { unknown: "A" }, { SPIRIT_01: "na" }, { SPIRIT_01: 1 }]) expect(scoreArchetypeQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].options[0].score = 1;
    expect(scoreArchetypeQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = { version: quiz.version, savedAt: 123456, answers: { SPIRIT_01: "B" } };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123457)).toEqual(draft.answers);
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123456 + 86400000)).toBeNull();
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={tie} locale="en" />);
    expect(dom.querySelectorAll("[data-archetype-match]")).toHaveLength(8); expect(dom.querySelectorAll("h4")).toHaveLength(72);
    const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
  });

  it("publishes one bilingual primary entry and every16substantive public guides with native SEO and safe navigation", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, path = `/${locale}/tests/explore/spirit-animal`;
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(metadata.title).toBe(quiz.seoTitle[locale]);
        expect(html).toContain(locale === "en" ? "inner animal personality test" : "内在动物人格测试");
        const hub = renderToStaticMarkup(<MoreTests locale={locale} />); expect(hub).toContain(`href="${path}"`); expect(hub).not.toContain("/tests/explore/inner-animal-personality-test");
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          for (const section of profile.sections) {
            expect(dom.querySelector(`#report-${section.id} h2`)?.textContent).toBe(section.title[locale]);
            for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          }
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/spirit-animal/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/spirit-animal/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).not.toContain("data-archetype-count"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
