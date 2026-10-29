import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { WorkTraitsContext, WorkTraitsReport } from "@/components/questionnaires/WorkTraitsReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS, isAnalyticsDisabledQuestionnaireUrl, shouldHardStopPublicAnalyticsForUrl } from "@/lib/tracking/privacy";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/work-traits-reflection.json", "utf8")) as Questionnaire;
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (answers: unknown) => {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("facets" in result)) throw new Error("Expected seven separate work-theme summaries");
  return result;
};

describe("Original seven work themes: context, missingness and no trait winner", () => {
  it("registers forty-two original bilingual behaviors, seven full guides and explicit version boundaries", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz);
    expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.code).toBe("FM_WORK_THEMES42");
    expect(quiz.version).toBe("fm_work_themes42_v1");
    expect(quiz.directions.map(d => d.id)).toEqual(["composure", "initiative", "follow-through", "social-contact", "consideration", "dependability", "curiosity"]);
    expect(quiz.questions).toHaveLength(42); expect(quiz.minimumRatedItems).toBe(5);
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(42);
    for (const [i, q] of quiz.questions.entries()) {
      expect(q.id).toBe(`WTR_${String(i + 1).padStart(2, "0")}`); expect(q.reverse).toBe(false);
      expect(q.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]);
      expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]);
      expect(q.options[0].directionId).toBe(quiz.directions[i % 7].id);
      expect(q.prompt.en).not.toMatch(/^I (?:am|like|prefer|enjoy)|Build cabinets|Develop a new medicine|Manage a retail store/i);
    }
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.questions)).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const d of quiz.directions) expect(quiz.questions.filter(q => q.options[0].directionId === d.id)).toHaveLength(6);
    for (const p of quiz.profiles) {
      expect(p.directionIds).toHaveLength(1); expect(p.sections).toHaveLength(7);
      expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.sections.flatMap(s => s.paragraphs.map(p => p.en)).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(700);
      expect(p.seo!.title.en.length).toBeLessThanOrEqual(60); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);
    }
    const inspect = (v: unknown): void => {
      if (!v || typeof v !== "object") return;
      const x = v as Record<string, unknown>;
      if ("en" in x || "zh" in x) {
        expect(String(x.en).trim()).not.toBe(""); expect(x.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u);
        expect(x.zh).toMatch(/\p{Script=Han}/u);
      } else Object.values(x).forEach(inspect);
    }; inspect(quiz);
  });
  it("keeps every group independent at each0..6coverage boundary, with Sometimes distinct from missing", () => {
    for (const d of quiz.directions) {
      const qs = quiz.questions.filter(q => q.options[0].directionId === d.id);
      for (let rated = 0; rated <= 6; rated++) {
        const answers = all("na"); let sum = 0;
        for (let i = 0; i < rated; i++) { const value = i % 5 + 1; answers[qs[i].id] = String(value); sum += value; }
        const result = complete(answers);
        expect(result.facets[d.id]).toEqual({ sum, rated, total: 6, mean: rated >= 5 ? Math.round(sum / rated * 10) / 10 : null });
        for (const other of quiz.directions.filter(x => x.id !== d.id)) expect(result.facets[other.id]).toEqual({ sum: 0, rated: 0, total: 6, mean: null });
        expect(Object.keys(result).sort()).toEqual(["answered", "facets", "status"]);
      }
    }
    const example = all("na");
    for (const d of quiz.directions) quiz.questions.filter(q => q.options[0].directionId === d.id).slice(0, 5).forEach((q, i) => { example[q.id] = String([1, 2, 3, 4, 5][i]); });
    for (const f of Object.values(complete(example).facets)) expect(f).toEqual({ sum: 15, rated: 5, total: 6, mean: 3 });
    for (const value of ["1", "3", "5", "na"]) for (const f of Object.values(complete(all(value)).facets)) expect(f.mean).toBe(value === "na" ? null : Number(value));
    const split = all(); split.WTR_01 = "1"; split.WTR_08 = "5";
    expect(complete(split).facets.composure.mean).toBe(complete(all()).facets.composure.mean);
  });
  it("withholds partial results, rejects unknown choices and expires optional version-bound drafts", () => {
    const answers = all();
    for (let n = 0; n < 42; n++) expect(scoreQuestionnaire(quiz, Object.fromEntries(Object.entries(answers).slice(0, n)))).toEqual({ status: "incomplete", answered: n });
    for (const bad of [null, [], Object.create(answers), { ...answers, unknown: "3" }, { ...answers, WTR_01: 3 }, { ...answers, WTR_01: "0" }, { ...answers, WTR_01: "skip" }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    const broken = structuredClone(quiz); broken.questions[0].options[0].directionId = "unknown";
    expect(scoreQuestionnaire(broken, all()).status).toBe("unavailable");
    const now = 1_800_000_000_000;
    const draft = (version = quiz.version, savedAt = now) => JSON.stringify({ version, savedAt, answers: { WTR_01: "na" } });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual({ WTR_01: "na" });
    expect(readQuestionnaireDraft(quiz, draft("unknown"), now)).toBeNull();
    expect(readQuestionnaireDraft(quiz, draft(quiz.version, now - 86400000), now)).toBeNull();
  });
  it("renders all seven full guides at every response level without a combined result, ranking or unavailable-as-zero mean", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["1", "3", "5", "na"]) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<WorkTraitsReport quiz={quiz} result={complete(all(value))} locale={locale} />);
      expect(Array.from(dom.querySelectorAll("[data-work-traits-part]"), x => x.getAttribute("data-work-traits-part"))).toEqual(["composure", "initiative", "follow-through", "social-contact", "consideration", "dependability", "curiosity"]);
      expect(dom.querySelectorAll("h4")).toHaveLength(49);
      for (const p of quiz.profiles) for (const s of p.sections) for (const paragraph of s.paragraphs) expect(dom.querySelector(`[data-work-traits-part="${p.directionIds[0]}"]`)?.textContent).toContain(paragraph[locale]);
      for (const el of dom.querySelectorAll("[data-work-traits-mean]")) expect(el.textContent).toContain(value === "na" ? (locale === "zh" ? "资料不足" : "Insufficient information") : `${value}.0 / 5`);
      const ids = Array.from(dom.querySelectorAll("[id]"), el => el.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.querySelector("[data-work-traits-context]")).not.toBeNull();
      if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it("keeps ordinary analytics off and anonymous activity behind explicit opt-in", () => {
    expect(ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS).toContain(`/tests/explore/${quiz.slug}`);
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...quiz.profiles.map(p => `/results/${p.id}`)]) {
      const path = `https://fermatmind.com/${locale}/tests/explore/${quiz.slug}${suffix}`;
      expect(isAnalyticsDisabledQuestionnaireUrl(path)).toBe(true);
      expect(shouldHardStopPublicAnalyticsForUrl(path)).toBe(true);
    }
    expect(isAnalyticsDisabledQuestionnaireUrl(`/en/tests/explore/${quiz.slug}-another-tool`)).toBe(false);
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<WorkTraitsContext locale="en" />);
    expect(dom.textContent).toContain("not the Hogan Personality Inventory");
  });
  it("publishes sixteen bilingual URLs with full bodies, edition context, directory and canonical sitemap pairs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, args = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(args));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.instructions![locale]);
        expect(dom.querySelector("[data-work-traits-context]")).not.toBeNull();
        expect((await entry.generateMetadata(args)).alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const p of quiz.profiles) {
          const url = `${path}/results/${p.id}`, args = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) };
          dom.innerHTML = renderToStaticMarkup(await guide.default(args)); const metadata = await guide.generateMetadata(args);
          expect(metadata.title).toBe(p.seo!.title[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${url}`);
          expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` });
          for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
          expect(dom.querySelector("[data-work-traits-context]")).not.toBeNull(); expect(dom.querySelector("[data-work-traits-mean]")).toBeNull();
          expect(maps.filter(x => x.loc === `https://fermatmind.com${url}`)).toHaveLength(1);
        }
        expect(maps.filter(x => x.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
