import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireCommunicationReport } from "@/components/questionnaires/QuestionnaireCommunicationReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/communication-style.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/communication-style-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"] };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(source.questions.map(q => [q.id, value]));

describe("T018 original communication response frequency reflection", () => {
  it("binds24original bilingual frequency items to four six-item patterns and four full9section guides", () => {
    expect(quiz.questions).toEqual(source.questions); expect(quiz.questions).toHaveLength(24); expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.directions.map(d => d.id)).toEqual(["assertive", "passive", "aggressive", "passive-aggressive"]);
    expect(quiz.questions.every(q => q.reverse === false)).toBe(true); expect(quiz.minimumRatedItems).toBe(4);
    for (const d of quiz.directions) expect(quiz.questions.filter(q => q.options[0].directionId === d.id)).toHaveLength(6);
    for (const p of quiz.profiles) {
      expect(p.directionIds).toEqual([p.id]); expect(p.sections).toHaveLength(9);
      expect(p.sections.slice(0, 8).flatMap(s => s.paragraphs.map(p => p.en)).join(" ").split(/\s+/).length).toBeGreaterThan(450);
      expect(p.seo?.title.en).toBeTruthy(); expect(p.seo?.description.zh).toBeTruthy();
    }
    const text = (v: unknown): void => {
      if (!v || typeof v !== "object") return;
      const o = v as Record<string, unknown>;
      if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u); expect(o.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(o).forEach(text);
    };
    text(quiz); expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(24); expect(new Set(quiz.profiles.map(p => p.seo!.title.en)).size).toBe(4);
  });
  it("matches364source-DP individual-pattern states, preserving independent means and minimum4of6", () => {
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
      expect(states.size).toBe(91);
      for (const [key, witness] of states) {
        const [rated, sum] = key.split(",").map(Number), answers = all(); qs.forEach((q, i) => { answers[q.id] = witness[i]; });
        const result = scoreQuestionnaire(quiz, answers);
        if (result.status !== "complete" || !("facets" in result)) throw new Error("Full source witness rejected");
        expect(result.facets[direction.id]).toEqual({ sum, rated, total: 6, mean: rated >= 4 ? Math.round(sum / rated * 10) / 10 : null });
        for (const other of quiz.directions.filter(d => d.id !== direction.id)) expect(result.facets[other.id].mean).toBe(3);
        expect(result).not.toHaveProperty("leaders"); expect(result).not.toHaveProperty("total"); tested++;
      }
    }
    expect(tested).toBe(364);
    console.info("364individual-pattern source-DP witnesses covering91rated/sum states each; not6^24individual answers, Cartesian coverage or psychometric validation.");
  });
  it("distinguishes never from NA, rejects incomplete/malformed input and invalid configurations, and restores current drafts", () => {
    for (const value of ["1", "5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected input");
      for (const facet of Object.values(result.facets)) expect(facet.mean).toBe(value === "na" ? null : Number(value));
    }
    const partial = all(); delete partial[quiz.questions.at(-1)!.id]; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 23 });
    for (const bad of [null, [], "3", Object.create({ inherited: "3" }), { ...all(), unknown: "3" }, { ...all(), [quiz.questions[0].id]: "0" }, { ...all(), [quiz.questions[0].id]: 3 }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.minimumRatedItems = 7; }, (q: Questionnaire) => { q.questions[0].options[0].directionId = "unknown"; }, (q: Questionnaire) => { q.profiles[0].directionIds = ["passive"]; }, (q: Questionnaire) => { q.questions[0].id = q.questions[1].id; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }]) {
      const broken = structuredClone(quiz); mutate(broken); expect(scoreQuestionnaire(broken, all()).status).toBe("unavailable");
    }
    const now = 1000000000, draft = (version = quiz.version, savedAt = now) => JSON.stringify({ version, savedAt, answers: all() });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual(all()); expect(readQuestionnaireDraft(quiz, draft("other"), now)).toBeNull(); expect(readQuestionnaireDraft(quiz, draft(quiz.version, now - 86400000), now)).toBeNull();
  });
  it("uses its own4pattern report, all36unique full sections, explicit NA and no social-battery interpretation", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected input");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireCommunicationReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-communication-facet]")).toHaveLength(4); expect(dom.querySelectorAll("h4")).toHaveLength(36); expect(dom.querySelectorAll("[data-communication-profile]")).toHaveLength(4);
      expect(dom.querySelectorAll("[data-communication-insufficient]")).toHaveLength(value === "na" ? 1 : 0);
      const ids = Array.from(dom.querySelectorAll("[id]"), x => x.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.textContent).not.toMatch(/battery|quiet recovery|coordination load|社交电量|安静恢复/i);
      if (value === "na") for (const mean of dom.querySelectorAll("[data-communication-mean]")) expect(mean.textContent).not.toMatch(/0|3\.0/);
    }
  });
  it("publishes ten native bilingual entry/guideURLs with complete bodies and individual SEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/communication-style`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        for (const section of quiz.guide.slice(0, 3)) expect(html).toContain(section.paragraphs[0][locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/communication-style/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/communication-style/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).not.toContain("data-communication-facet"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
