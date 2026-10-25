import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isAffectionConfigurationValid, scoreAffectionQuestionnaire } from "@/lib/questionnaires/affection";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireAffectionReport } from "@/components/questionnaires/QuestionnaireAffectionReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/love-languages.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/love-languages-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profilePairs: Record<string, string[]> };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(source.questions.map(q => [q.id, value]));

describe("T016 independent two-role meaningfulness reflection", () => {
  it("binds50original bilingual items to ten five-item facets and five complete two-role guides", () => {
    expect(quiz.questions).toEqual(source.questions); expect(quiz.questions).toHaveLength(50);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(isAffectionConfigurationValid(quiz)).toBe(true); expect(isLikertConfigurationValid(quiz)).toBe(false);
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const d of quiz.directions) expect(quiz.questions.filter(q => q.options[0].directionId === d.id)).toHaveLength(5);
    for (const p of quiz.profiles) {
      expect(p.directionIds).toEqual(source.profilePairs[p.id]); expect(p.sections).toHaveLength(9);
      expect(p.sections.map(s => s.id)).toEqual(["meaning", "giving", "receiving", "everyday", "tradeoffs", "comparison", "counterexample", "experiment", "scope"]);
      expect(p.sections.slice(0, 8).flatMap(s => s.paragraphs.map(p => p.en)).join(" ").split(/\s+/).length).toBeGreaterThan(400);
      expect(p.seo?.title.en).toBeTruthy(); expect(p.seo?.description.zh).toBeTruthy();
    }
    const text = (v: unknown): void => {
      if (!v || typeof v !== "object") return;
      const o = v as Record<string, unknown>;
      if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u); expect(o.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(o).forEach(text);
    };
    text(quiz);
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(50);
    expect(new Set(quiz.profiles.map(p => p.seo!.title.en)).size).toBe(5);
  });
  it("matches all660 source-DP per-facet states with exact independent means and no forced winner", () => {
    let tested = 0;
    for (const direction of quiz.directions) {
      const qs = source.questions.filter(q => q.options[0].directionId === direction.id);
      let states = new Map<string, string[]>([["0,0", []]]);
      for (const question of qs) {
        const next = new Map<string, string[]>();
        for (const [key, witness] of states) {
          const [rated, sum] = key.split(",").map(Number);
          for (const o of question.options) next.set(`${rated + (typeof o.score === "number" ? 1 : 0)},${sum + (o.score ?? 0)}`, [...witness, o.id]);
        }
        states = next;
      }
      expect(states.size).toBe(66);
      for (const [key, witness] of states) {
        const [rated, sum] = key.split(",").map(Number), answers = all(); qs.forEach((q, i) => { answers[q.id] = witness[i]; });
        const result = scoreQuestionnaire(quiz, answers);
        if (result.status !== "complete" || !("affectionFacets" in result)) throw new Error("Full source witness rejected");
        expect(result.affectionFacets[direction.id]).toEqual({ sum, rated, total: 5, mean: rated >= 3 ? Math.round(sum / rated * 10) / 10 : null });
        for (const other of quiz.directions.filter(d => d.id !== direction.id)) expect(result.affectionFacets[other.id].mean).toBe(3);
        expect(result).not.toHaveProperty("leaders"); expect(result).not.toHaveProperty("total"); tested++;
      }
    }
    expect(tested).toBe(660);
    console.info("660 per-facet source-DP witnesses; not6^50 individual answers, Cartesian coverage or psychometric validation.");
  });
  it("distinguishes low ratings, absent ratings, partial/invalid attempts and invalid configurations", () => {
    for (const value of ["1", "5", "na"]) {
      const result = scoreAffectionQuestionnaire(quiz, all(value)); if (result.status !== "complete") throw new Error("Rejected complete input");
      for (const f of Object.values(result.affectionFacets)) expect(f.mean).toBe(value === "na" ? null : Number(value));
    }
    const partial = all(); delete partial[quiz.questions.at(-1)!.id];
    expect(scoreAffectionQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 49 });
    for (const bad of [null, [], "3", Object.create({ inherited: "3" }), { ...all(), unknown: "3" }, { ...all(), [quiz.questions[0].id]: "0" }, { ...all(), [quiz.questions[0].id]: 3 }]) expect(scoreAffectionQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.minimumRatedItems = 1; }, (q: Questionnaire) => { q.questions[0].reverse = true; }, (q: Questionnaire) => { q.questions[0].options[0].directionId = "receiving_words"; }, (q: Questionnaire) => { q.profiles[0].directionIds.reverse(); }, (q: Questionnaire) => { q.questions[0].id = q.questions[1].id; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }]) {
      const broken = structuredClone(quiz); mutate(broken); expect(scoreAffectionQuestionnaire(broken, all()).status).toBe("unavailable");
    }
  });
  it("restores only current complete or partial 24-hour optional drafts", () => {
    const now = 1000000000, draft = (version = quiz.version, savedAt = now) => JSON.stringify({ version, savedAt, answers: all() });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual(all());
    expect(readQuestionnaireDraft(quiz, draft("other"), now)).toBeNull(); expect(readQuestionnaireDraft(quiz, draft(quiz.version, now - 86400000), now)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: now, answers: { bad: "3" } }), now)).toBeNull();
  });
  it("renders all ten means and45unique full sections even when all parts lack ratings", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["5", "na"]) {
      const result = scoreAffectionQuestionnaire(quiz, all(value)); if (result.status !== "complete") throw new Error("Rejected input");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireAffectionReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-affection-facet]")).toHaveLength(10); expect(dom.querySelectorAll("h4")).toHaveLength(45);
      expect(dom.querySelectorAll("[data-affection-profile]")).toHaveLength(5); expect(dom.querySelectorAll("[data-affection-insufficient]")).toHaveLength(value === "na" ? 1 : 0);
      const ids = Array.from(dom.querySelectorAll("[id]"), x => x.id); expect(new Set(ids).size).toBe(ids.length);
      if (value === "na") for (const mean of dom.querySelectorAll("[data-affection-mean]")) expect(mean.textContent).not.toMatch(/0|3\.0/);
      expect(dom.querySelectorAll('th[scope="col"]')).toHaveLength(3); expect(dom.querySelectorAll('th[scope="row"]')).toHaveLength(5);
    }
  });
  it("publishes twelve native bilingual entry/guide URLs with complete bodies, individual SEO and safe navigation", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/love-languages`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        for (const section of quiz.guide.slice(0, 3)) expect(html).toContain(section.paragraphs[0][locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/love-languages/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/love-languages/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).not.toContain("data-affection-facet"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
