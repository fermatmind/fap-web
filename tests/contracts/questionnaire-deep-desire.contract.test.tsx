import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireMotivationThemesReport, QuestionnaireMotivationThemesNextSteps } from "@/components/questionnaires/QuestionnaireMotivationThemesReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/deep-desire.json", "utf8")) as Questionnaire;
const sourceFile = "tests/fixtures/questionnaires/deep-desire-source-reference.json";
const profilesFile = "tests/fixtures/questionnaires/deep-desire-profiles-reference.json";
const source = JSON.parse(readFileSync(sourceFile, "utf8")) as { items: { id: string; factor: string; prompt: { en: string; zh: string }; reverse: boolean }[]; anchors: { id: string; score: number; label: { en: string; zh: string } }[] };
const profiles = JSON.parse(readFileSync(profilesFile, "utf8"));
const refs = JSON.parse(readFileSync("tests/fixtures/questionnaires/deep-desire-numeric-reference.json", "utf8")) as { results: { factor: string; values: number[]; sum: number; mean: number }[] };
const fileHash = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const answers = (value = "3"): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (a: QuestionnaireAnswers) => { const r = scoreQuestionnaire(quiz, a); if (r.status !== "complete" || !("facets" in r)) throw new Error("Complete source witness rejected"); return r; };

describe("Original mini-program DEEP_DESIRE full migration", () => {
  it("binds all24 original Chinese items, explicit English translation, source anchors and six complete guides", () => {
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.code).toBe("DEEP_DESIRE"); expect(quiz.minimumRatedItems).toBe(4);
    expect(quiz.questions).toHaveLength(24); expect(quiz.directions.map(d => d.id)).toEqual(["autonomy", "connection", "mastery", "security", "recognition", "exploration"]);
    expect(quiz.source.itemBankSha256).toBe(fileHash(sourceFile)); expect(quiz.source.resultContentSha256).toBe(fileHash(profilesFile)); expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.profiles).toEqual(profiles);
    for (const [i, q] of quiz.questions.entries()) {
      expect(q.id).toBe(source.items[i].id); expect(q.prompt).toEqual(source.items[i].prompt); expect(q.reverse).toBe(false);
      expect(q.options.slice(0, 5).map(o => ({ id: o.id, score: o.score, label: o.label }))).toEqual(source.anchors);
      expect(q.options.every(o => o.directionId === source.items[i].factor.toLowerCase())).toBe(true); expect(q.options.at(-1)?.score).toBeNull();
    }
    expect(quiz.questions[0].options[2].label).toEqual({ en: "Uncertain or depends on the situation", zh: "不确定或视情况" });
    expect(quiz.profiles).toHaveLength(6); expect(quiz.profiles.every(p => p.sections.length === 8 && p.seo?.title.en && p.seo.description.zh)).toBe(true); expect(quiz.faq).toHaveLength(6);
    const visit = (v: unknown): void => { if (!v || typeof v !== "object") return; const o = v as Record<string, unknown>; if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(o.zh).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(visit); }; visit(quiz);
  });
  it("matches3750 original-scorer vectors using raw sums and exact quarter-step means without a winner", () => {
    expect(refs.results).toHaveLength(3750);
    for (const witness of refs.results) {
      const a = answers(), id = witness.factor.toLowerCase(), questions = quiz.questions.filter(q => q.options[0].directionId === id);
      for (const [i, q] of questions.entries()) a[q.id] = String(witness.values[i]);
      const r = complete(a), f = r.facets[id]; expect(f.sum).toBe(witness.sum); expect(f.rated).toBe(4); expect(f.sum / 4).toBe(witness.mean);
      expect(Object.keys(r)).toEqual(["status", "answered", "facets"]);
    }
  });
  it("withholds only incomplete themes for every per-theme NA mask and preserves invalid/incomplete/unavailable states", () => {
    for (const d of quiz.directions) for (let mask = 0; mask < 16; mask++) {
      const a = answers(); quiz.questions.filter(q => q.options[0].directionId === d.id).forEach((q, i) => { if (mask & (1 << i)) a[q.id] = "na"; });
      const r = complete(a); expect(r.facets[d.id].mean === null).toBe(mask !== 0);
      for (const other of quiz.directions.filter(x => x.id !== d.id)) expect(r.facets[other.id]).toEqual({ sum: 12, rated: 4, total: 4, mean: 3 });
    }
    const all = complete(answers("na")); expect(Object.values(all.facets).every(f => f.mean === null && f.rated === 0)).toBe(true);
    const partial = answers(); delete partial[quiz.questions[23].id]; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 23 });
    for (const bad of [null, [], new Date(), { ...answers(), unknown: "3" }, { ...answers(), [quiz.questions[0].id]: "0" }, { [quiz.questions[0].id]: 3 }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.minimumRatedItems = 5; expect(scoreQuestionnaire(bad, answers()).status).toBe("unavailable");
  });
  it("renders exact1.25 rather than the shared rounded1.3 with all48 bilingual guide paragraphs and safe all-NA next steps", () => {
    for (const locale of ["en", "zh"] as const) for (const missing of [false, true]) {
      const a = answers(missing ? "na" : "1"); if (!missing) a[quiz.questions[3].id] = "2"; const r = complete(a);
      if (!missing) expect(r.facets.autonomy.mean).toBe(1.3);
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<><QuestionnaireMotivationThemesReport quiz={quiz} result={r} locale={locale} /><QuestionnaireMotivationThemesNextSteps result={r} locale={locale} /></>);
      expect(dom.querySelectorAll("[data-deep-desire-part]")).toHaveLength(6); expect(dom.querySelectorAll("h4")).toHaveLength(48);
      for (const profile of quiz.profiles) for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      const first = dom.querySelector('[data-deep-desire-part="autonomy"] [data-deep-desire-mean]')?.textContent;
      expect(first).toContain(missing ? (locale === "zh" ? "资料不足" : "Insufficient information") : "1.25 / 5"); expect(dom.querySelectorAll("[data-deep-desire-sum]")).toHaveLength(missing ? 0 : 6);
      expect(dom.querySelector("a[href*='tests/mbti']")).toBeNull(); const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
      if (missing) expect(dom.querySelector("[data-deep-desire-next-steps] h2")?.textContent).toBe(locale === "zh" ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next.");
    }
  });
  it("renders all14 native pages with actual three-paragraph method, dedicated SEO, canonical/hreflang and sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/deep-desire`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, meta = await entry.generateMetadata(props);
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props)); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.description).toBe(quiz.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        const method = dom.querySelector('section[aria-labelledby="questionnaire-method"]'); expect(method?.querySelectorAll("p")).toHaveLength(3);
        for (const section of quiz.guide.slice(0, 3)) for (const paragraph of section.paragraphs) expect(method?.textContent).toContain(paragraph[locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`); expect(maps.some(e => e.loc === `https://fermatmind.com${path}`)).toBe(true);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, args = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, m = await guide.generateMetadata(args);
          dom.innerHTML = renderToStaticMarkup(await guide.default(args)); expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); expect(m.title).toBe(profile.seo!.title[locale]); expect(m.description).toBe(profile.seo!.description[locale]); expect(m.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(m.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/deep-desire/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/deep-desire/results/${profile.id}` });
          for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-deep-desire-mean]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
