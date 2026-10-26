import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireLtsReport } from "@/components/questionnaires/QuestionnaireLtsReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/light-triad-test.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/light-triad-test-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; attribution: { en: string; zh: string } };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(source.questions.map(q => [q.id, value === "na" ? value : q.reverse ? String(6 - Number(value)) : value]));

describe("T054 published LTS12 Table3 agreement reflection", () => {
  it("binds12published English items and Chinese trial to three four-item facets and three full9section guides", () => {
    expect(quiz.questions.map(q => q.prompt.en)).toEqual(["I tend to see the best in people.", "I tend to trust that other people will deal fairly with me.", "I think people are mostly good.", "I’m quick to forgive people who have hurt me.", "I tend to admire others.", "I tend to applaud the successes of other people.", "I tend to treat others as valuable.", "I enjoy listening to people from all walks of life.", "I prefer honesty over charm.", "I don’t feel comfortable overtly manipulating people to do something I want.", "I would like to be authentic even if it may damage my reputation.", "When I talk to people, I am rarely thinking about what I want from them."]);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.questions).toHaveLength(12); expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.directions.map(d => d.id)).toEqual(["faith-in-humanity", "humanism", "kantianism"]);
    expect(quiz.questions.filter(q => q.reverse)).toHaveLength(0); expect(quiz.minimumRatedItems).toBe(4);
    for (const d of quiz.directions) expect(quiz.questions.filter(q => q.options[0].directionId === d.id)).toHaveLength(4);
    for (const p of quiz.profiles) {
      expect(p.directionIds).toEqual([p.id]); expect(p.sections).toHaveLength(9);
      expect(p.sections.slice(0, 8).flatMap(s => s.paragraphs.map(p => p.en)).join(" ").split(/\s+/).length).toBeGreaterThan(400);
      expect(p.seo?.title.en).toBeTruthy(); expect(p.seo?.description.zh).toBeTruthy();
    }
    for (const locale of ["en", "zh"] as const) {
      expect(source.attribution[locale]).toContain("CC BY 4.0"); expect(source.attribution[locale]).toContain("10.3389/fpsyg.2019.00467");
      expect(quiz.guide.flatMap(s => s.paragraphs).map(p => p[locale])).toContain(source.attribution[locale]);
      for (const p of quiz.profiles) expect(p.sections.flatMap(s => s.paragraphs).map(p => p[locale])).toContain(source.attribution[locale]);
    }
    const text = (v: unknown): void => {
      if (!v || typeof v !== "object") return;
      const o = v as Record<string, unknown>;
      if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u); expect(o.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(o).forEach(text);
    };
    text(quiz);
    for (const bank of ["disc", "response-color", "social-battery-test", "spirit-animal", "flower", "what-dog-breed-am-i", "mythical-creature", "superpower-test", "moral-alignment", "jungian-archetype", "introvert-extrovert", "temperament", "love-languages", "attachment-styles", "communication-style", "leadership-style", "humor-style-test", "travel-personality-test", "aesthetic-core-test", "music-taste-test", "people-pleaser", "difficult-person-test", "likable-person-test", "procrastinator-type-test", "learning-style", "character-strengths", "tsundere-dere-type", "hogwarts-house-quiz", "greek-god", "which-tarot-card-are-you", "what-element-am-i", "aura-color", "past-life", "moon-phase", "bojack-horseman-character-quiz", "chiikawa", "disney-princess", "naruto-character", "death-note", "bleach", "star-wars-character", "hello-kitty", "dungeons-dragons-class", "type-ab", "sdt-motivation", "socionics", "optimism-pessimism", "values"]) {
      const other = JSON.parse(readFileSync(`lib/questionnaires/data/${bank}.json`, "utf8")) as Questionnaire;
      const prompts = new Set(other.questions.flatMap(q => [q.prompt.en, q.prompt.zh]));
      for (const question of quiz.questions) expect(prompts.has(question.prompt.en) || prompts.has(question.prompt.zh)).toBe(false);
    }
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(12); expect(new Set(quiz.profiles.map(p => p.seo!.title.en)).size).toBe(3);
  });
  it("matches135source-DP facet states requiring all4ratings with zero reverse keys", () => {
    let tested = 0;
    for (const direction of quiz.directions) {
      const qs = source.questions.filter(q => q.options[0].directionId === direction.id);
      let states = new Map<string, string[]>([["0,0", []]]);
      for (const question of qs) {
        const next = new Map<string, string[]>();
        for (const [key, witness] of states) {
          const [rated, sum] = key.split(",").map(Number);
          for (const o of question.options) {
            const value = o.score === null ? null : question.reverse ? 6 - o.score! : o.score!;
            next.set(`${rated + (typeof value === "number" ? 1 : 0)},${sum + (value ?? 0)}`, [...witness, o.id]);
          }
        }
        states = next;
      }
      expect(states.size).toBe(45);
      for (const [key, witness] of states) {
        const [rated, sum] = key.split(",").map(Number), answers = all(); qs.forEach((q, i) => { answers[q.id] = witness[i]; });
        const result = scoreQuestionnaire(quiz, answers);
        if (result.status !== "complete" || !("facets" in result)) throw new Error("Full source witness rejected");
        expect(result.facets[direction.id]).toEqual({ sum, rated, total: 4, mean: rated >= 4 ? Math.round(sum / rated * 10) / 10 : null });
        for (const other of quiz.directions.filter(d => d.id !== direction.id)) expect(result.facets[other.id].mean).toBe(3);
        expect(result).not.toHaveProperty("leaders"); expect(result).not.toHaveProperty("total"); tested++;
      }
    }
    expect(tested).toBe(135);
    console.info("135individual-facet source-DP witnesses covering45rated/sum states each with0reverseitems; not6^12individual answers, Cartesian coverage or psychometric validation.");
  });
  it("distinguishes strongly-disagree from NA, rejects incomplete/malformed input and invalid configurations, and restores current drafts", () => {
    for (const value of ["1", "5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected input");
      for (const facet of Object.values(result.facets)) expect(facet.mean).toBe(value === "na" ? null : Number(value));
    }
    const partial = all(); delete partial[quiz.questions.at(-1)!.id]; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 11 });
    for (const bad of [null, [], "3", Object.create({ inherited: "3" }), { ...all(), unknown: "3" }, { ...all(), [quiz.questions[0].id]: "0" }, { ...all(), [quiz.questions[0].id]: 3 }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.minimumRatedItems = 5; }, (q: Questionnaire) => { q.questions[0].options[0].directionId = "unknown"; }, (q: Questionnaire) => { q.profiles[0].directionIds = ["humanism"]; }, (q: Questionnaire) => { q.questions[0].id = q.questions[1].id; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }]) {
      const broken = structuredClone(quiz); mutate(broken); expect(scoreQuestionnaire(broken, all()).status).toBe("unavailable");
    }
    const now = 1000000000, draft = (version = quiz.version, savedAt = now) => JSON.stringify({ version, savedAt, answers: all() });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual(all()); expect(readQuestionnaireDraft(quiz, draft("other"), now)).toBeNull(); expect(readQuestionnaireDraft(quiz, draft(quiz.version, now - 86400000), now)).toBeNull();
  });
  it("uses its own3facet report, all27unique full sections, explicit NA and no social-battery interpretation", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected input");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireLtsReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-lts-facet]")).toHaveLength(3); expect(dom.querySelectorAll("h4")).toHaveLength(27); expect(dom.querySelectorAll("[data-lts-profile]")).toHaveLength(3);
      expect(dom.querySelectorAll("[data-lts-insufficient]")).toHaveLength(value === "na" ? 1 : 0);
      const ids = Array.from(dom.querySelectorAll("[id]"), x => x.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.textContent).not.toMatch(/battery|quiet recovery|coordination load|社交电量|安静恢复|learning effectiveness|format preferences|学习效果|PPS item/);
      if (value === "na") for (const mean of dom.querySelectorAll("[data-lts-mean]")) expect(mean.textContent).not.toMatch(/0|3\.0/);
    }
  });
  it("checks325global rated/sum witnesses and49fullyrated totals without rounded-facet averaging or NA filling", () => {
    let states = new Map<string, string[]>([["0,0", []]]);
    for (const question of source.questions) {
      const next = new Map<string, string[]>();
      for (const [key, witness] of states) {
        const [rated, sum] = key.split(",").map(Number);
        for (const o of question.options) next.set(`${rated + (o.score === null ? 0 : 1)},${sum + (o.score ?? 0)}`, [...witness, o.id]);
      }
      states = next;
    }
    expect(states.size).toBe(325); let fullyRated = 0;
    for (const [key, witness] of states) {
      const [rated, sum] = key.split(",").map(Number), answers = Object.fromEntries(source.questions.map((q, i) => [q.id, witness[i]]));
      const result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected total witness");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireLtsReport quiz={quiz} result={result} locale="en" />);
      expect(dom.querySelector("[data-lts-total]")?.textContent).toBe(rated === 12 ? String(sum) : "Insufficient information");
      expect(dom.querySelector("[data-lts-overall-mean]")?.textContent).toBe(rated === 12 ? (sum / 12).toFixed(2) : "Insufficient information");
      if (rated === 12) fullyRated++;
    }
    expect(fullyRated).toBe(49);
    const answers = all("2"); answers[source.questions[0].id] = "1";
    let result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected rounding witness");
    let dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireLtsReport quiz={quiz} result={result} locale="en" />);
    expect(dom.querySelector("[data-lts-total]")?.textContent).toBe("23"); expect(dom.querySelector("[data-lts-overall-mean]")?.textContent).toBe("1.92");
    expect(dom.querySelector('[data-lts-facet="faith-in-humanity"] [data-lts-mean]')?.textContent).toBe("1.75 / 5");
    answers[source.questions[0].id] = "na"; result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected partial witness");
    dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireLtsReport quiz={quiz} result={result} locale="en" />);
    expect(dom.querySelector("[data-lts-total]")?.textContent).toBe("Insufficient information");
    expect(dom.querySelector('[data-lts-facet="faith-in-humanity"] [data-lts-mean]')?.textContent).toBe("Insufficient information");
    expect(dom.querySelector('[data-lts-facet="humanism"] [data-lts-mean]')?.textContent).toBe("2.00 / 5"); expect(dom.querySelectorAll("h4")).toHaveLength(27);
    console.info("325global rated/sum states including49fullyrated totals, not6^12joint answers or psychometric validation.");
  }, 30000);
  it("publishes eight native bilingual entry/guideURLs with complete bodies and individual SEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/light-triad-test`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        const entryDom = document.createElement("div"); entryDom.innerHTML = html;
        for (const section of quiz.guide.slice(0, 3)) expect(entryDom.textContent).toContain(section.paragraphs[0][locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/light-triad-test/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/light-triad-test/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).not.toContain("data-lts-facet"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
