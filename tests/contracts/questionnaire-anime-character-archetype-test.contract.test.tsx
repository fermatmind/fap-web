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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/anime-character-archetype-test.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/animeroles-reference.json");
const reference = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"] };
const allA = (): QuestionnaireAnswers => Object.fromEntries(reference.questions.map(q => [q.id, "A"]));
const oracle = (answers: QuestionnaireAnswers) => {
  const counts: Record<string, number> = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const question of reference.questions) {
    const option = question.options.find(o => o.id === answers[question.id]);
    if (!option) throw new Error("Reference witness must be complete");
    counts[option.directionId]++;
  }
  const max = Math.max(...Object.values(counts));
  return { counts, winners: Object.keys(counts).filter(id => counts[id] === max).sort() };
};

describe("T130 original six-role anime-story quiz", () => {
  it("preserves18original situations,12balanced exposures and6complete bilingual reports with explicit framework scope", () => {
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.questions).toHaveLength(18);
    const profileBytes = readFileSync("tests/fixtures/questionnaires/animeroles-profiles-reference.json");
    expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex"));
    expect(readFileSync("public/fonts/noto-sans-sc/anime-character-archetype-test-700.ttf").byteLength).toBeLessThan(300000);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(new Set(quiz.profiles.map(p => p.seo?.title.en)).size).toBe(6);
    expect(new Set(quiz.profiles.map(p => p.seo?.description.zh)).size).toBe(6);
    expect(isArchetypeConfigurationValid(quiz)).toBe(true); expect(quiz.profiles).toHaveLength(6);
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.references?.map(r => r.url)).toContain("https://opentextbc.ca/advancedenglish/chapter/elements-of-fiction/");
    expect(quiz.title).toEqual({ zh: "你是哪个动漫角色测试", en: "Which Anime Character Are You?" });
    for (const direction of quiz.directions) {
      expect(direction.comparisons).toBe(12);
      for (const position of [0, 1, 2, 3]) expect(quiz.questions.filter(q => q.options[position].directionId === direction.id)).toHaveLength(3);
    }
    for (const profile of quiz.profiles) {
      expect(profile.sections).toHaveLength(7);
      expect(profile.seo?.title.en).toContain("Test Result");
      expect(profile.seo?.title.zh).toContain("测试");
      expect(new Set(profile.sections.map(s => s.id)).size).toBe(7);
      expect(profile.sections.at(-1)?.paragraphs[0].en).toContain("FermatMind independently authored this original anime-story quiz");
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
    for (const bank of ["disc", "response-color", "social-battery-test", "spirit-animal", "flower", "what-dog-breed-am-i", "mythical-creature", "superpower-test", "moral-alignment", "jungian-archetype", "introvert-extrovert", "temperament", "love-languages", "attachment-styles", "communication-style", "leadership-style", "humor-style-test", "travel-personality-test", "aesthetic-core-test", "music-taste-test", "people-pleaser", "difficult-person-test", "likable-person-test", "procrastinator-type-test", "learning-style", "character-strengths", "tsundere-dere-type", "hogwarts-house-quiz", "greek-god", "which-tarot-card-are-you", "what-element-am-i", "aura-color", "past-life", "moon-phase", "ginny-and-georgia-character-quiz", "hazbin-hotel-character-quiz", "my-hero-academia-character-quiz", "my-little-pony-character-quiz", "wojak", "nana-character", "south-park", "gilmore-girls", "jujutsu-kaisen-character", "harry-potter-character", "dexter", "avengers-character", "stranger-things", "wednesday-addams-character", "twilight-character", "game-of-thrones", "decade-aesthetic-test", "amazing-digital-circus", "gossip-girl", "blue-lock", "villain-era-archetype-test"]) {
      const other = JSON.parse(readFileSync(`lib/questionnaires/data/${bank}.json`, "utf8")) as Questionnaire;
      const prompts = new Set(other.questions.flatMap(q => [q.prompt.en, q.prompt.zh]));
      const options = new Set(other.questions.flatMap(q => q.options.flatMap(o => [o.label.en, o.label.zh])));
      for (const question of quiz.questions) {
        expect(prompts.has(question.prompt.en) || prompts.has(question.prompt.zh)).toBe(false);
        for (const option of question.options) expect(options.has(option.label.en) || options.has(option.label.zh)).toBe(false);
      }
    }
  });

  it("enumerates every source count vector and verifies a runtime witness for every reachable highest set", () => {
    const ids = quiz.directions.map(d => d.id);
    // Merge identical count vectors at each source item, retaining one full answer witness.
    // This enumerates all reachable score states, not all 4^18 individual answer paths.
    let states = new Map<string, { counts: number[]; choices: string }>([[ids.map(() => 0).join(","), { counts: ids.map(() => 0), choices: "" }]]);
    for (const question of reference.questions) {
      const next = new Map<string, { counts: number[]; choices: string }>();
      for (const state of states.values()) for (const option of question.options) {
        const counts = [...state.counts]; counts[ids.indexOf(option.directionId)]++;
        const key = counts.join(",");
        if (!next.has(key)) next.set(key, { counts, choices: state.choices + option.id });
      }
      states = next;
    }
    expect(states.size).toBe(31363);
    const winnerSets = new Set<string>();
    for (const state of states.values()) {
      const highest = Math.max(...state.counts);
      const winnerKey = ids.filter((_, index) => state.counts[index] === highest).sort().join("|");
      if (winnerSets.has(winnerKey)) continue;
      const answers = Object.fromEntries(reference.questions.map((question, index) => [question.id, state.choices[index]]));
      const expected = oracle(answers), actual = scoreArchetypeQuestionnaire(quiz, answers);
      if (actual.status !== "complete") throw new Error("Complete source witness rejected");
      if (ids.some((id, i) => actual.counts[id] !== state.counts[i] || actual.counts[id] !== expected.counts[id])
        || [...actual.profileIds].sort().join("|") !== expected.winners.join("|")
        || Object.values(actual.counts).reduce((n, v) => n + v, 0) !== 18
        || "percentile" in actual || "matchPercentage" in actual
        || actual.profileIds.some(id => quiz.profiles.find(p => p.id === id)?.sections.length !== 7)) {
        throw new Error(`Source-state mismatch: ${state.counts.join(",")}`);
      }
      winnerSets.add(expected.winners.join("|"));
    }
    expect(winnerSets.size).toBe(57);
    for (const id of ids) expect(winnerSets.has(id)).toBe(true);
    expect(winnerSets.has([...ids].sort().join("|"))).toBe(true);
    console.info("Anime story roles: independently enumerated31363 reachable source count vectors; runtime57 distinct highest-set witnesses verified, including all6 single matches and6-way tie. Not68,719,476,736 answer paths or psychometric validation.");
  });

  it("keeps all6 highest ties, withholds partial results and rejects malformed input or configuration", () => {
    const tie = scoreArchetypeQuestionnaire(quiz, allA());
    if (tie.status !== "complete") throw new Error("Balanced archetype witness rejected");
    expect(Object.values(tie.counts)).toEqual(Array(6).fill(3)); expect(new Set(tie.profileIds)).toEqual(new Set(quiz.profiles.map(p => p.id)));
    const reordered = structuredClone(quiz); reordered.profiles.reverse();
    const same = scoreArchetypeQuestionnaire(reordered, allA());
    if (same.status !== "complete") throw new Error("Reordered source rejected");
    expect(new Set(same.profileIds)).toEqual(new Set(tie.profileIds));
    const partial = allA(); delete partial.ANI_18;
    expect(scoreArchetypeQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 17 });
    for (const invalid of [null, [], new Date(), { unknown: "A" }, { ANI_01: "na" }, { ANI_01: 1 }]) expect(scoreArchetypeQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].options[0].score = 1;
    expect(scoreArchetypeQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = { version: quiz.version, savedAt: 123456, answers: { ANI_01: "B" } };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123457)).toEqual(draft.answers);
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123456 + 86400000)).toBeNull();
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={tie} locale="en" />);
    expect(dom.querySelectorAll("[data-archetype-match]")).toHaveLength(6); expect(dom.querySelectorAll("h4")).toHaveLength(42);
    const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
  });

  it("publishes one bilingual primary entry and all12substantive public guides with native SEO and safe navigation", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, path = `/${locale}/tests/explore/anime-character-archetype-test`;
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(metadata.title).toBe(quiz.seoTitle[locale]);
        expect(html).toContain(quiz.instructions![locale]);
        expect(html).toContain(locale === "zh" ? "原创象征测验" : "Original symbolic quiz");
        expect(quiz.resultHeading?.[locale]).toBeTruthy();
        for (const section of quiz.guide.slice(0, 3)) expect(html).toContain(section.paragraphs[0][locale]);
        const hub = renderToStaticMarkup(<MoreTests locale={locale} />); expect(hub).toContain(`href="${path}"`); expect(hub).not.toContain("/tests/play/anime-character-archetype-test");
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          for (const section of profile.sections) {
            expect(dom.querySelector(`#report-${section.id} h2`)?.textContent).toBe(section.title[locale]);
            for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          }
          expect(meta.title).toBe(profile.seo!.title[locale]);
          expect(meta.description).toBe(profile.seo!.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/anime-character-archetype-test/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/anime-character-archetype-test/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).not.toContain("data-archetype-count"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
