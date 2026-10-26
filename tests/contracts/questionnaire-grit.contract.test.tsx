import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireGritReport } from "@/components/questionnaires/QuestionnaireGritReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/grit-test.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/grit-test-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"] };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(source.questions.map(q => [q.id, value === "na" ? value : q.reverse ? String(6 - Number(value)) : value]));

describe("T065 original target-bound long-goal frequency reflection", () => {
  it("binds16original bilingual items and4reversals to two8item parts and two full9section guides", () => {
    expect(quiz.questions).toEqual(source.questions); expect(quiz.questions).toHaveLength(16); expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.directions.map(d => d.id)).toEqual(["goal-continuity", "effort-return"]); expect(quiz.minimumRatedItems).toBe(6);
    expect(quiz.questions.filter(q => q.reverse).map(q => q.id)).toEqual(["LONGGOAL_09", "LONGGOAL_10", "LONGGOAL_11", "LONGGOAL_12"]);
    for (const d of quiz.directions) expect(quiz.questions.filter(q => q.options[0].directionId === d.id)).toHaveLength(8);
    for (const p of quiz.profiles) {
      expect(p.directionIds).toEqual([p.id]); expect(p.sections).toHaveLength(9);
      expect(p.sections.slice(0, 7).flatMap(s => s.paragraphs.map(p => p.en)).join(" ").split(/\s+/).length).toBeGreaterThan(550);
      for (const locale of ["en", "zh"] as const) { expect(p.seo?.title[locale]).toBeTruthy(); expect(p.seo?.description[locale]).toBeTruthy(); }
    }
    const text = (v: unknown): void => {
      if (!v || typeof v !== "object") return;
      const o = v as Record<string, unknown>;
      if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u); expect(o.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(o).forEach(text);
    }; text(quiz);
    for (const bank of readdirSync("lib/questionnaires/data").filter(f => f.endsWith(".json") && f !== "grit-test.json")) {
      const other = JSON.parse(readFileSync(`lib/questionnaires/data/${bank}`, "utf8")) as Questionnaire;
      const prompts = new Set(other.questions.flatMap(q => [q.prompt.en, q.prompt.zh]));
      for (const question of quiz.questions) expect(prompts.has(question.prompt.en) || prompts.has(question.prompt.zh)).toBe(false);
    }
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(16); expect(new Set(quiz.profiles.map(p => p.seo!.title.en)).size).toBe(2);
  });
  it("matches306independent source-DP partstates, minimum6of8,4reversekeys and exact displayed sum/count means", () => {
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
        } states = next;
      }
      expect(states.size).toBe(153);
      for (const [key, witness] of states) {
        const [rated, sum] = key.split(",").map(Number), answers = all(); qs.forEach((q, i) => { answers[q.id] = witness[i]; });
        const result = scoreQuestionnaire(quiz, answers);
        if (result.status !== "complete" || !("facets" in result)) throw new Error("Source witness rejected");
        expect(result.facets[direction.id]).toEqual({ sum, rated, total: 8, mean: rated >= 6 ? Math.round(sum / rated * 10) / 10 : null });
        for (const other of quiz.directions.filter(d => d.id !== direction.id)) expect(result.facets[other.id].mean).toBe(3);
        expect(result).not.toHaveProperty("leaders"); expect(result).not.toHaveProperty("total"); tested++;
      }
    }
    expect(tested).toBe(306);
    const answers = all(), qs = source.questions.filter(q => q.options[0].directionId === "goal-continuity");
    ["1", "1", "2", "2", "2", "2", "na", "na"].forEach((v, i) => { answers[qs[i].id] = v === "na" ? v : qs[i].reverse ? String(6 - Number(v)) : v; });
    const result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected exact witness");
    expect(result.facets["goal-continuity"]).toMatchObject({ rated: 6, sum: 10, mean: 1.7 });
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireGritReport quiz={quiz} result={result} locale="en" />);
    expect(dom.querySelector('[data-grit-facet="goal-continuity"] [data-grit-mean]')?.textContent).toBe("1.67 / 5");
    expect(dom.querySelector('[data-grit-facet="effort-return"] [data-grit-mean]')?.textContent).toBe("3.00 / 5");
    console.info("306individual-part source-DP witnesses,153rated/sum states per part; not6^16jointanswers,Cartesiancoverage or psychometricvalidation.");
  });
  it("keeps NA separate, rejects malformed/incomplete/configuration gaps and restores only current24h drafts", () => {
    for (const value of ["1", "5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected input");
      for (const facet of Object.values(result.facets)) expect(facet.mean).toBe(value === "na" ? null : Number(value));
    }
    const partial = all(); delete partial[quiz.questions.at(-1)!.id]; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 15 });
    for (const bad of [null, [], "3", Object.create({ inherited: "3" }), { ...all(), unknown: "3" }, { ...all(), [quiz.questions[0].id]: "0" }, { ...all(), [quiz.questions[0].id]: 3 }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.minimumRatedItems = 9; }, (q: Questionnaire) => { q.questions[0].options[0].directionId = "unknown"; }, (q: Questionnaire) => { q.profiles[0].directionIds = ["effort-return"]; }, (q: Questionnaire) => { q.questions[0].id = q.questions[1].id; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }]) {
      const broken = structuredClone(quiz); mutate(broken); expect(scoreQuestionnaire(broken, all()).status).toBe("unavailable");
    }
    const now = 1000000000, draft = (version = quiz.version, savedAt = now) => JSON.stringify({ version, savedAt, answers: all() });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual(all()); expect(readQuestionnaireDraft(quiz, draft("other"), now)).toBeNull(); expect(readQuestionnaireDraft(quiz, draft(quiz.version, now - 86400000), now)).toBeNull();
  });
  it("retains both full9section guides, semantic labelledmeans and explicit NA without generic battery copy", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected input");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireGritReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-grit-facet]")).toHaveLength(2); expect(dom.querySelectorAll("h4")).toHaveLength(18); expect(dom.querySelectorAll("[data-grit-profile]")).toHaveLength(2);
      expect(dom.querySelectorAll("[data-grit-insufficient]")).toHaveLength(value === "na" ? 1 : 0);
      const ids = Array.from(dom.querySelectorAll("[id]"), x => x.id); expect(new Set(ids).size).toBe(ids.length);
      for (const group of dom.querySelectorAll("dl > div")) { expect(group.querySelector("dt")).not.toBeNull(); expect(group.querySelector("dd")).not.toBeNull(); }
      expect(dom.textContent).not.toMatch(/battery|quiet recovery|coordination load|社交电量|安静恢复|learning effectiveness|format preferences|学习效果|PPS item/);
      if (value === "na") for (const mean of dom.querySelectorAll("[data-grit-mean]")) expect(mean.textContent).not.toMatch(/0|3\.0/);
    }
  });
  it("publishes six native bilingual entry/guideURLs with complete bodies and individual SEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/grit-test`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
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
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/grit-test/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/grit-test/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).not.toContain("data-grit-facet"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
