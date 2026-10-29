import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { SocialAttitudesReport } from "@/components/questionnaires/SocialAttitudesReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/social-attitudes-reflection.json", "utf8")) as Questionnaire;
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (answers: unknown) => {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("facets" in result)) throw new Error("Expected four separate statement-set readings");
  return result;
};

describe("Original social attitudes: four topics without an identity, prejudice or overall score", () => {
  it("registers the original bilingual statements and four complete, individually described guides", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz);
    expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.directions.map(d => d.id)).toEqual(["reviewing-rules", "gender-roles", "gay-lesbian-inclusion", "racial-context"]);
    expect(quiz.questions).toHaveLength(24);
    expect(quiz.minimumRatedItems).toBe(4);
    expect(quiz.questions.every(q => q.reverse === false)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.questions)).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const d of quiz.directions) expect(quiz.questions.filter(q => q.options[0].directionId === d.id)).toHaveLength(6);
    for (const p of quiz.profiles) {
      expect(p.directionIds).toEqual([p.id]);
      expect(p.sections).toHaveLength(6);
      expect(p.sections.every(s => s.paragraphs.length > 0)).toBe(true);
      expect(p.seo!.title.en.length).toBeLessThanOrEqual(60);
      expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);
    }
    const inspect = (v: unknown): void => {
      if (!v || typeof v !== "object") return;
      const x = v as Record<string, unknown>;
      if ("en" in x || "zh" in x) {
        expect(String(x.en).trim()).not.toBe("");
        expect(x.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u);
        expect(x.zh).toMatch(/\p{Script=Han}/u);
      } else Object.values(x).forEach(inspect);
    };
    inspect(quiz);
    const old = JSON.parse(readFileSync("lib/questionnaires/data/8-values-political.json", "utf8")) as Questionnaire;
    expect(quiz.questions.some(q => old.questions.some(p => p.prompt.en === q.prompt.en))).toBe(false);
  });
  it("keeps neutral numeric ratings distinct from uncertainty and preserves four independent coverage boundaries", () => {
    for (const d of quiz.directions) {
      const qs = quiz.questions.filter(q => q.options[0].directionId === d.id);
      for (let rated = 0; rated <= 6; rated++) {
        const answers = all("na");
        let sum = 0;
        for (let i = 0; i < rated; i++) { const value = i % 4 + 2; answers[qs[i].id] = String(value); sum += value; }
        const result = complete(answers);
        expect(result.facets[d.id]).toEqual({ sum, rated, total: 6, mean: rated >= 4 ? Math.round(sum / rated * 10) / 10 : null });
        for (const other of quiz.directions.filter(x => x.id !== d.id)) expect(result.facets[other.id]).toEqual({ sum: 0, rated: 0, total: 6, mean: null });
        expect(Object.keys(result).sort()).toEqual(["answered", "facets", "status"]);
      }
    }
    for (const value of ["1", "3", "5", "na"]) for (const f of Object.values(complete(all(value)).facets)) expect(f.mean).toBe(value === "na" ? null : Number(value));
    const mixed = all("na");
    for (const [i, d] of quiz.directions.entries()) for (const q of quiz.questions.filter(q => q.options[0].directionId === d.id)) mixed[q.id] = String(i + 1);
    expect(Object.values(complete(mixed).facets).map(f => f.mean)).toEqual([1, 2, 3, 4]);
  });
  it("withholds partial results, rejects malformed data and expires optional version-bound drafts", () => {
    const answers = all(); delete answers.SAR_24;
    expect(scoreQuestionnaire(quiz, answers)).toEqual({ status: "incomplete", answered: 23 });
    for (const bad of [null, [], Object.create(all()), { ...all(), unknown: "3" }, { ...all(), SAR_01: 3 }, { ...all(), SAR_01: "0" }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    const broken = structuredClone(quiz); broken.questions[0].options[0].directionId = "unknown";
    expect(scoreQuestionnaire(broken, all()).status).toBe("unavailable");
    const now = 1_800_000_000_000;
    const draft = (version = quiz.version, savedAt = now) => JSON.stringify({ version, savedAt, answers });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual(answers);
    expect(readQuestionnaireDraft(quiz, draft("unknown"), now)).toBeNull();
    expect(readQuestionnaireDraft(quiz, draft(quiz.version, now - 86400000), now)).toBeNull();
  });
  it("renders every full guide for disagreement, neutrality, agreement and insufficient information", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["1", "3", "5", "na"]) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<SocialAttitudesReport quiz={quiz} result={complete(all(value))} locale={locale} />);
      expect(dom.querySelectorAll("[data-social-attitudes-part]")).toHaveLength(4);
      expect(dom.querySelectorAll("h4")).toHaveLength(24);
      expect(dom.textContent).not.toMatch(/battery|电量|剩余能量/);
      for (const p of quiz.profiles) for (const s of p.sections) for (const paragraph of s.paragraphs) expect(dom.querySelector(`[data-social-attitudes-part="${p.id}"]`)?.textContent).toContain(paragraph[locale]);
      for (const el of dom.querySelectorAll("[data-social-attitudes-mean]")) expect(el.textContent).toContain(value === "na" ? (locale === "zh" ? "资料不足" : "Insufficient information") : `${value}.0 / 5`);
      const ids = Array.from(dom.querySelectorAll("[id]"), el => el.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("publishes ten bilingual native URLs with full public text, directory, canonical pairs and sitemap entries", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, args = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(args));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
        expect(dom.textContent).toContain(quiz.instructions![locale]);
        expect((await entry.generateMetadata(args)).alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const p of quiz.profiles) {
          const url = `${path}/results/${p.id}`, args = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) };
          dom.innerHTML = renderToStaticMarkup(await guide.default(args)); const metadata = await guide.generateMetadata(args);
          expect(metadata.title).toBe(p.seo!.title[locale]);
          expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${url}`);
          expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` });
          for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
          expect(dom.querySelector("[data-social-attitudes-mean]")).toBeNull();
          expect(maps.filter(x => x.loc === `https://fermatmind.com${url}`)).toHaveLength(1);
        }
        expect(maps.filter(x => x.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
