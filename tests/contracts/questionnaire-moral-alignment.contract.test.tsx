import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isAlignmentConfigurationValid, scoreAlignmentQuestionnaire } from "@/lib/questionnaires/alignment";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { QuestionnaireAlignmentReport } from "@/components/questionnaires/QuestionnaireAlignmentReport";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/moral-alignment.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/moral-alignment-reference.json");
const reference = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"] };
const allA = (): QuestionnaireAnswers => Object.fromEntries(reference.questions.map(q => [q.id, "A"]));
const orderBands = [["chaotic"], ["chaotic"], ["chaotic"], ["chaotic"], ["chaotic", "order-neutral"], ["order-neutral"], ["order-neutral"], ["order-neutral"], ["order-neutral", "lawful"], ["lawful"], ["lawful"], ["lawful"], ["lawful"]];
const moralBands = [["evil"], ["evil"], ["evil"], ["evil"], ["evil", "moral-neutral"], ["moral-neutral"], ["moral-neutral"], ["moral-neutral"], ["moral-neutral", "good"], ["good"], ["good"], ["good"], ["good"]];
const pairs: Record<string, [string, string]> = {
  "lawful-good": ["lawful", "good"], "neutral-good": ["order-neutral", "good"], "chaotic-good": ["chaotic", "good"],
  "lawful-neutral": ["lawful", "moral-neutral"], "true-neutral": ["order-neutral", "moral-neutral"], "chaotic-neutral": ["chaotic", "moral-neutral"],
  "lawful-evil": ["lawful", "evil"], "neutral-evil": ["order-neutral", "evil"], "chaotic-evil": ["chaotic", "evil"],
};

describe("T009 original two-axis Moral Alignment Test", () => {
  it("preserves24original paired items, separate axes, nine full bilingual reports and required source attribution", () => {
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.questions).toHaveLength(24);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(isAlignmentConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(quiz.title).toEqual({ zh: "道德阵营测试", en: "Moral Alignment Test" });
    for (const d of quiz.directions) for (const position of [0, 1]) expect(quiz.questions.filter(q => q.options[position].directionId === d.id)).toHaveLength(6);
    for (const p of quiz.profiles) {
      expect(p.directionIds).toEqual(pairs[p.id]); expect(p.sections).toHaveLength(9);
      expect(new Set(p.sections.map(s => s.id)).size).toBe(9);
      expect(p.sections.slice(0, 8).map(s => s.paragraphs.map(p => p.en).join(" ")).join(" ").split(/\s+/).length).toBeGreaterThan(300);
      expect(p.sections.find(s => s.id === "scope")!.paragraphs[1].en).toContain("System Reference Document 5.2.1");
      expect(p.sections.find(s => s.id === "scope")!.paragraphs[1].en).toContain("https://creativecommons.org/licenses/by/4.0/legalcode");
    }
    expect(quiz.references?.every(r => r.url.startsWith("https://"))).toBe(true);
    const check = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      const v = value as Record<string, unknown>;
      if ("en" in v || "zh" in v) {
        expect(String(v.en)).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u);
        expect(String(v.en).length).toBeGreaterThan(0); expect(String(v.zh)).toMatch(/\p{Script=Han}/u);
      } else Object.values(v).forEach(check);
    };
    check(quiz);
    const existing = ["disc", "response-color", "social-battery-test", "spirit-animal", "flower", "what-dog-breed-am-i", "mythical-creature", "superpower-test"];
    const prompts = new Set(existing.flatMap(name => (JSON.parse(readFileSync(`lib/questionnaires/data/${name}.json`, "utf8")) as Questionnaire).questions.flatMap(q => [q.prompt.en, q.prompt.zh])));
    for (const q of quiz.questions) expect(prompts.has(q.prompt.en) || prompts.has(q.prompt.zh)).toBe(false);
  });

  it("matches all169 reachable two-axis count pairs against independent source witnesses and explicit display bands", () => {
    let states = new Map<string, { order: number; good: number; answers: QuestionnaireAnswers }>([["0,0", { order: 0, good: 0, answers: {} }]]);
    for (const q of reference.questions) {
      const next = new Map<string, { order: number; good: number; answers: QuestionnaireAnswers }>();
      for (const state of states.values()) for (const option of q.options) {
        const order = state.order + Number(option.directionId === "lawful"), good = state.good + Number(option.directionId === "good");
        if (!next.has(`${order},${good}`)) next.set(`${order},${good}`, { order, good, answers: { ...state.answers, [q.id]: option.id } });
      }
      states = next;
    }
    expect(states.size).toBe(169);
    const reachable = new Set<string>();
    for (const state of states.values()) {
      const actual = scoreAlignmentQuestionnaire(quiz, state.answers);
      if (actual.status !== "complete") throw new Error("Complete source witness rejected");
      const expected = Object.entries(pairs).filter(([, [a, b]]) => orderBands[state.order].includes(a) && moralBands[state.good].includes(b)).map(([id]) => id).sort();
      expect(actual.counts).toEqual({ lawful: state.order, chaotic: 12 - state.order, good: state.good, evil: 12 - state.good });
      expect([...actual.alignmentIds].sort()).toEqual(expected);
      expect(actual).not.toHaveProperty("total"); expect(actual).not.toHaveProperty("percentile");
      for (const id of actual.alignmentIds) reachable.add(id);
      if ([4, 8].includes(state.order) && [4, 8].includes(state.good)) expect(actual.alignmentIds).toHaveLength(4);
      if (state.order === 4 && state.good === 4) {
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireAlignmentReport quiz={quiz} result={actual} locale="en" />);
        expect(dom.querySelectorAll("[data-alignment-match]")).toHaveLength(4); expect(dom.querySelectorAll("h4")).toHaveLength(36);
        expect(dom.querySelectorAll("table a")).toHaveLength(9);
        const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
      }
    }
    expect(reachable.size).toBe(9);
    console.info("Moral Alignment: all169 reachable count pairs verified from source witnesses, including every4/8boundary and all9results. Not16,777,216 individual answer runs or psychometric validation.");
  });

  it("preserves neutral and boundary results without order-based selection, withholds partial results and rejects invalid states", () => {
    const neutral = scoreQuestionnaire(quiz, allA());
    expect(neutral).toMatchObject({ status: "complete", counts: { lawful: 6, chaotic: 6, good: 6, evil: 6 }, alignmentIds: ["true-neutral"] });
    const reordered = structuredClone(quiz); reordered.profiles.reverse();
    expect(scoreQuestionnaire(reordered, allA())).toEqual(neutral);
    const partial = allA(); delete partial.ALIGN_24;
    expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 23 });
    for (const invalid of [null, [], new Date(), { unknown: "A" }, { ALIGN_01: "C" }, { ALIGN_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    for (const mutate of [
      (q: Questionnaire) => { q.questions[0].options[0].score = 1; },
      (q: Questionnaire) => { q.questions[0].options[1].directionId = "good"; },
      (q: Questionnaire) => { q.profiles[0].directionIds = q.profiles[1].directionIds; },
      (q: Questionnaire) => { q.questions.pop(); },
      (q: Questionnaire) => { q.directions[0].comparisons = 24; },
      (q: Questionnaire) => { q.source.scoringVersion = "future"; },
    ]) {
      const bad = structuredClone(quiz); mutate(bad); expect(scoreQuestionnaire(bad, allA())).toEqual({ status: "unavailable", answered: 0 });
    }
    const draft = { version: quiz.version, savedAt: 123456, answers: { ALIGN_01: "B" } };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123457)).toEqual(draft.answers);
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123456 + 86400000)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ ...draft, answers: { ALIGN_01: "C" } }), 123457)).toBeNull();
  });

  it("publishes one bilingual primary entry and all18full public guides with native SEO and source scope", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, path = `/${locale}/tests/explore/moral-alignment`;
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(metadata.title).toBe(quiz.seoTitle[locale]);
        const entryDom = document.createElement("div"); entryDom.innerHTML = html;
        expect(entryDom.textContent).toContain(quiz.guide.find(s => s.id === "display-bands")!.paragraphs[0][locale]);
        expect(entryDom.textContent).toContain(quiz.guide.find(s => s.id === "attribution")!.paragraphs[0][locale]);
        const hub = renderToStaticMarkup(<MoreTests locale={locale} />); expect(hub).toContain(`href="${path}"`); expect(hub).not.toContain("/tests/play/moral-alignment");
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          for (const section of profile.sections) {
            expect(dom.querySelector(`#report-${section.id} h2`)?.textContent).toBe(section.title[locale]);
            for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          }
          expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/moral-alignment/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/moral-alignment/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).not.toContain("data-alignment-count"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
