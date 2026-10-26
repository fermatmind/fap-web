import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid, readQuestionnaireDraft, scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { getInkblotStimulus } from "@/lib/questionnaires/inkblotStimuli";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/inkblot-personality-quiz.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/inkblot-personality-quiz-reference.json");
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

describe("T057 original visual inkblot reading", () => {
  it("preserves10original visual prompts,8balanced exposures and5complete bilingual reports with explicit framework scope", () => {
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.questions).toHaveLength(10);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(new Set(quiz.profiles.map(p => p.seo?.title.en)).size).toBe(5);
    expect(new Set(quiz.profiles.map(p => p.seo?.description.zh)).size).toBe(5);
    expect(isArchetypeConfigurationValid(quiz)).toBe(true); expect(quiz.profiles).toHaveLength(5);
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.references?.map(r => r.url)).toContain("https://r-pas.org/Products/ProductDetails/10");
    expect(quiz.title).toEqual({ zh: "墨迹人格测验", en: "Rorschach-Style Inkblot Test" });
    for (const direction of quiz.directions) {
      expect(direction.comparisons).toBe(8);
      for (const position of [0, 1, 2, 3]) expect(quiz.questions.filter(q => q.options[position].directionId === direction.id)).toHaveLength(2);
    }
    for (const profile of quiz.profiles) {
      expect(profile.sections).toHaveLength(9);
      expect(profile.seo?.title.en).toContain("Result:");
      expect(profile.seo?.title.zh).toContain("测试");
      expect(new Set(profile.sections.map(s => s.id)).size).toBe(9);
      expect(profile.sections.at(-1)?.paragraphs[0].en).toContain("professional methods");
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
    for (const bank of ["disc", "response-color", "social-battery-test", "spirit-animal", "flower", "what-dog-breed-am-i", "mythical-creature", "superpower-test", "moral-alignment", "jungian-archetype", "introvert-extrovert", "temperament", "love-languages", "attachment-styles", "communication-style", "leadership-style", "humor-style-test", "travel-personality-test", "aesthetic-core-test", "music-taste-test", "people-pleaser", "difficult-person-test", "likable-person-test", "procrastinator-type-test", "learning-style", "character-strengths", "tsundere-dere-type", "hogwarts-house-quiz", "greek-god", "which-tarot-card-are-you", "what-element-am-i", "aura-color", "past-life", "moon-phase", "bojack-horseman-character-quiz", "chiikawa", "disney-princess", "naruto-character", "death-note", "bleach", "star-wars-character", "hello-kitty", "dungeons-dragons-class", "type-ab", "sdt-motivation", "socionics", "optimism-pessimism", "values", "light-triad-test", "inner-child-personality-test", "philosopher-personality-test"]) {
      const other = JSON.parse(readFileSync(`lib/questionnaires/data/${bank}.json`, "utf8")) as Questionnaire;
      const prompts = new Set(other.questions.flatMap(q => [q.prompt.en, q.prompt.zh]));
      const options = new Set(other.questions.flatMap(q => q.options.flatMap(o => [o.label.en, o.label.zh])));
      for (const question of quiz.questions) {
        expect(prompts.has(question.prompt.en) || prompts.has(question.prompt.zh)).toBe(false);
        for (const option of question.options) expect(options.has(option.label.en) || options.has(option.label.zh)).toBe(false);
      }
    }
  });

  it("binds every original image byte and neutral bilingual description to a closed question identity", () => {
    const source = JSON.parse(bytes.toString()) as { stimuli: { questionId: string; src: string; sha256: string; description: { en: string; zh: string } }[] };
    expect(source.stimuli).toHaveLength(10);
    const hashes = new Set<string>();
    for (const [index, stimulus] of source.stimuli.entries()) {
      expect(stimulus.questionId).toBe(quiz.questions[index].id);
      expect(getInkblotStimulus(stimulus.questionId)).toEqual(stimulus);
      expect(stimulus.src).toBe(`/images/questionnaires/inkblot-original/fm-inkblot-${String(index + 1).padStart(2, "0")}.svg`);
      const imageBytes = readFileSync(`public${stimulus.src}`);
      expect(createHash("sha256").update(imageBytes).digest("hex")).toBe(stimulus.sha256);
      hashes.add(stimulus.sha256);
      const svg = new DOMParser().parseFromString(imageBytes.toString(), "image/svg+xml");
      expect(svg.querySelector("parsererror")).toBeNull();
      expect(svg.documentElement.getAttribute("viewBox")).toBe("0 0 720 480");
      expect(svg.querySelector("script, foreignObject, image, style")).toBeNull();
      for (const use of svg.querySelectorAll("use")) {
        const href = use.getAttribute("href")!; expect(href).toMatch(/^#half-[0-9]{2}$/);
        expect(svg.getElementById(href.slice(1))).not.toBeNull();
      }
      for (const node of svg.querySelectorAll("*")) for (const attribute of node.attributes) {
        if (attribute.name === "xmlns") continue;
        expect(attribute.name).not.toMatch(/^on/i); expect(attribute.value).not.toMatch(/https?:|url\(/i);
      }
      expect(stimulus.description.en).not.toMatch(/\p{Script=Han}/u);
      expect(stimulus.description.zh).toMatch(/\p{Script=Han}/u);
    }
    expect(hashes.size).toBe(10);
    for (const key of [undefined, "unknown", "../fm-inkblot-01.svg", "INK_11", "__proto__"]) expect(getInkblotStimulus(key)).toBeUndefined();
  });

  it("matches independent source addition across all976reachable five-count states and every26highest-match set", () => {
    let states = new Map<string, { counts: Record<string, number>; answers: QuestionnaireAnswers }>([["0|0|0|0|0", { counts: Object.fromEntries(quiz.directions.map(d => [d.id, 0])), answers: {} }]]);
    for (const question of reference.questions) {
      const next = new Map<string, { counts: Record<string, number>; answers: QuestionnaireAnswers }>();
      for (const state of states.values()) for (const option of question.options) {
        const counts = { ...state.counts, [option.directionId]: state.counts[option.directionId] + 1 };
        next.set(quiz.directions.map(d => counts[d.id]).join("|"), { counts, answers: { ...state.answers, [question.id]: option.id } });
      }
      states = next;
    }
    expect(states.size).toBe(976);
    const matchSets = new Set<string>();
    for (const { counts, answers } of states.values()) {
      const expected = oracle(answers), actual = scoreArchetypeQuestionnaire(quiz, answers);
      if (actual.status !== "complete") throw new Error("Complete source witness rejected");
      expect(actual.counts).toEqual(counts); expect(actual.counts).toEqual(expected.counts);
      expect([...actual.profileIds].sort()).toEqual(expected.winners);
      expect(Object.values(actual.counts).reduce((sum, count) => sum + count, 0)).toBe(10);
      expect(actual).not.toHaveProperty("secondary"); expect(actual).not.toHaveProperty("matchPercentage");
      matchSets.add([...actual.profileIds].sort().join("|"));
    }
    expect(matchSets.size).toBe(26);
    console.info("Original inkblot reading: all976reachable five-count states and26highest-match sets; not4^10individual answer executions or psychometric validation.");
  });

  it("keeps all five highest ties, withholds partial results and rejects malformed input or configuration", () => {
    const tie = scoreArchetypeQuestionnaire(quiz, allA());
    if (tie.status !== "complete") throw new Error("Balanced archetype witness rejected");
    expect(Object.values(tie.counts)).toEqual(Array(5).fill(2)); expect(new Set(tie.profileIds)).toEqual(new Set(quiz.profiles.map(p => p.id)));
    const reordered = structuredClone(quiz); reordered.profiles.reverse();
    const same = scoreArchetypeQuestionnaire(reordered, allA());
    if (same.status !== "complete") throw new Error("Reordered source rejected");
    expect(new Set(same.profileIds)).toEqual(new Set(tie.profileIds));
    const partial = allA(); delete partial.INK_10;
    expect(scoreArchetypeQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 9 });
    for (const invalid of [null, [], new Date(), { unknown: "A" }, { INK_01: "na" }, { INK_01: 1 }]) expect(scoreArchetypeQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].options[0].score = 1;
    expect(scoreArchetypeQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = { version: quiz.version, savedAt: 123456, answers: { INK_01: "B" } };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123457)).toEqual(draft.answers);
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123456 + 86400000)).toBeNull();
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={tie} locale="en" />);
    expect(dom.querySelectorAll("[data-archetype-match]")).toHaveLength(5); expect(dom.querySelectorAll("h4")).toHaveLength(45);
    const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
  });

  it("publishes one bilingual primary entry and all10substantive public guides with native SEO and safe navigation", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, path = `/${locale}/tests/explore/inkblot-personality-quiz`;
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(metadata.title).toBe(quiz.seoTitle[locale]);
        expect(html).toContain(quiz.instructions![locale]);
        expect(html).toContain(locale === "zh" ? "原创墨迹视觉趣味" : "Original inkblot visual quiz");
        expect(quiz.resultHeading?.[locale]).toBeTruthy();
        for (const section of quiz.guide.slice(0, 3)) expect(html).toContain(section.paragraphs[0][locale]);
        const hub = renderToStaticMarkup(<MoreTests locale={locale} />); expect(hub).toContain(`href="${path}"`); expect(hub).not.toContain("/tests/play/inkblot-personality-quiz");
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
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/inkblot-personality-quiz/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/inkblot-personality-quiz/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).not.toContain("data-archetype-count"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
