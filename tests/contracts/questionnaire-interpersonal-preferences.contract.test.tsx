import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { InterpersonalPreferencesReport } from "@/components/questionnaires/InterpersonalPreferencesReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/interpersonal-preferences.json", "utf8")) as Questionnaire;
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (answers: unknown) => {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("facets" in result)) throw new Error("Expected a complete six-part reflection");
  return result;
};

describe("Original interpersonal preferences: separate actions and wishes, six paired readings", () => {
  it("registers 24 original bilingual frequency statements, six complete guides and no inherited scale claim", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz);
    expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.directions.map(d => d.id)).toEqual(["invite", "be-included", "coordinate", "receive-coordination", "offer-warmth", "receive-warmth"]);
    expect(quiz.questions).toHaveLength(24);
    expect(quiz.profiles).toHaveLength(6);
    expect(quiz.minimumRatedItems).toBe(3);
    expect(quiz.questions.every(q => q.reverse === false)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.questions)).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const d of quiz.directions) expect(quiz.questions.filter(q => q.options[0].directionId === d.id)).toHaveLength(4);
    for (const p of quiz.profiles) {
      expect(p.directionIds).toEqual([p.id]);
      expect(p.sections).toHaveLength(6);
      expect(p.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThan(400);
      expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);
    }
    const inspect = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      const x = value as Record<string, unknown>;
      if ("en" in x || "zh" in x) {
        expect(x.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u);
        expect(x.zh).toMatch(/\p{Script=Han}/u);
      } else Object.values(x).forEach(inspect);
    };
    inspect(quiz);
    const oldPrompts = new Set(JSON.parse(readFileSync("lib/questionnaires/data/everyday-control-style.json", "utf8")).questions.map((q: Questionnaire["questions"][number]) => q.prompt.en));
    expect(quiz.questions.some(q => oldPrompts.has(q.prompt.en))).toBe(false);
  });
  it("independently enumerates all 6^4 responses per area with numeric minimum3 and explicit missing data", () => {
    let witnesses = 0;
    for (const d of quiz.directions) {
      const qs = quiz.questions.filter(q => q.options[0].directionId === d.id);
      for (let vector = 0; vector < 1296; vector++) {
        let rest = vector, sum = 0, rated = 0;
        const answers = all("na");
        for (const q of qs) {
          const digit = rest % 6;
          rest = Math.floor(rest / 6);
          answers[q.id] = digit === 5 ? "na" : String(digit + 1);
          if (digit < 5) { sum += digit + 1; rated++; }
        }
        const result = complete(answers);
        expect(result.facets[d.id]).toEqual({ sum, rated, total: 4, mean: rated >= 3 ? Math.round(sum / rated * 10) / 10 : null });
        for (const other of quiz.directions.filter(x => x.id !== d.id)) expect(result.facets[other.id]).toEqual({ sum: 0, rated: 0, total: 4, mean: null });
        expect(result).not.toHaveProperty("leaders");
        expect(result).not.toHaveProperty("total");
        witnesses++;
      }
    }
    expect(witnesses).toBe(7776);
    for (const value of ["1", "5", "na"]) for (const f of Object.values(complete(all(value)).facets)) expect(f.mean).toBe(value === "na" ? null : Number(value));
    for (const [offered, wanted] of [["invite", "be-included"], ["coordinate", "receive-coordination"], ["offer-warmth", "receive-warmth"]]) {
      const answers = all("na");
      for (const q of quiz.questions) {
        if (q.options[0].directionId === offered) answers[q.id] = "1";
        if (q.options[0].directionId === wanted) answers[q.id] = "5";
      }
      const result = complete(answers);
      expect(result.facets[offered].mean).toBe(1);
      expect(result.facets[wanted].mean).toBe(5);
      expect(Object.keys(result).sort()).toEqual(["answered", "facets", "status"]);
      expect(result.answered).toBe(24);
    }
  });
  it("withholds partial interpretations, rejects malformed answers and binds optional drafts to version and expiry", () => {
    const answers = all();
    delete answers.IPR_24;
    expect(scoreQuestionnaire(quiz, answers)).toEqual({ status: "incomplete", answered: 23 });
    for (const bad of [null, [], Object.create(all()), { ...all(), unknown: "3" }, { ...all(), IPR_01: 3 }, { ...all(), IPR_01: "0" }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    const broken = structuredClone(quiz);
    broken.questions[0].options[0].directionId = "unrecognised";
    expect(scoreQuestionnaire(broken, all()).status).toBe("unavailable");
    const now = 1_800_000_000_000;
    const draft = (version = quiz.version, savedAt = now) => JSON.stringify({ version, savedAt, answers });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual(answers);
    expect(readQuestionnaireDraft(quiz, draft("foreign"), now)).toBeNull();
    expect(readQuestionnaireDraft(quiz, draft(quiz.version, now - 86400000), now)).toBeNull();
  });
  it("renders all six full bodies even when unrated and never inserts battery, identity or ranking interpretations", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["1", "5", "na"]) {
      const html = renderToStaticMarkup(<InterpersonalPreferencesReport quiz={quiz} result={complete(all(value))} locale={locale} />);
      const dom = document.createElement("div"); dom.innerHTML = html;
      expect(dom.querySelectorAll("[data-interpersonal-part]")).toHaveLength(6);
      expect(dom.querySelectorAll("h4")).toHaveLength(36);
      expect(dom.textContent).not.toMatch(/battery|电量|剩余能量/);
      for (const p of quiz.profiles) for (const s of p.sections) for (const paragraph of s.paragraphs) expect(dom.querySelector(`[data-interpersonal-part="${p.id}"]`)?.textContent).toContain(paragraph[locale]);
      for (const e of dom.querySelectorAll("[data-interpersonal-mean]")) expect(e.textContent).toContain(value === "na" ? (locale === "zh" ? "资料不足" : "Insufficient information") : `${value}.0 / 5`);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("publishes 14 bilingual native URLs with complete general bodies, individual SEO, directory and sitemap links", async () => {
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
          const url = `${path}/results/${p.id}`, a = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) };
          dom.innerHTML = renderToStaticMarkup(await guide.default(a));
          const metadata = await guide.generateMetadata(a);
          expect(metadata.title).toBe(p.seo!.title[locale]);
          expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${url}`);
          expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` });
          for (const s of p.sections) for (const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          expect(dom.querySelector("[data-interpersonal-mean]")).toBeNull();
          expect(maps.filter(r => r.loc === `https://fermatmind.com${url}`)).toHaveLength(1);
        }
      }
      expect(maps.filter(r => r.loc.includes(`/tests/explore/${quiz.slug}`))).toHaveLength(14);
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
