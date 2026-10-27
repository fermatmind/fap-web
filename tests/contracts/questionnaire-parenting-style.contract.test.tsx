import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isQuestionnaireConfigurationValid, isLikertConfigurationValid, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireParentingPracticesReport, QuestionnaireParentingPracticesNextSteps } from "@/components/questionnaires/QuestionnaireParentingPracticesReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/parenting-style.json", "utf8")) as Questionnaire;
const sourceFile = "tests/fixtures/questionnaires/parenting-style-source-reference.json";
const profilesFile = "tests/fixtures/questionnaires/parenting-style-profiles-reference.json";
const source = JSON.parse(readFileSync(sourceFile, "utf8")) as {
  items: { id: string; directionId: string; prompt: { en: string; zh: string }; reverse: boolean }[];
  anchors: { id: string; score: number | null; label: { en: string; zh: string } }[];
};
const profiles = JSON.parse(readFileSync(profilesFile, "utf8"));
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/parenting-style-numeric-reference.json", "utf8")) as {
  states: { values: number[]; sum: number; display: string }[];
  worked: { answers: number[]; sums: number[]; displays: string[] }[];
};
const hash = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
const answers = (value = "3"): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (a: QuestionnaireAnswers) => {
  const r = scoreQuestionnaire(quiz, a);
  if (r.status !== "complete" || !("facets" in r)) throw new Error("Complete parenting witness rejected");
  return r;
};

describe("Original parenting responses: two means and four complete framework guides", () => {
  it("binds twelve original bilingual items, frequency anchors and all four full guides", () => {
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    // Keep the existing likert topology intact: this form deliberately has
    // two numeric parts and four general guides, without assigning a type.
    expect(isLikertConfigurationValid(quiz)).toBe(false);
    expect(quiz.code).toBe("FM_PARENTING_RESPONSES12"); expect(quiz.questions).toHaveLength(12);
    expect(quiz.source.itemBankSha256).toBe(hash(sourceFile)); expect(quiz.source.resultContentSha256).toBe(hash(profilesFile));
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.profiles).toEqual(profiles);
    expect(quiz.directions.map(d => [d.id, d.itemCount])).toEqual([["warm-response", 6], ["clear-boundaries", 6]]);
    for (const [i, q] of quiz.questions.entries()) {
      expect(q.id).toBe(source.items[i].id); expect(q.prompt).toEqual(source.items[i].prompt); expect(q.reverse).toBe(false);
      expect(q.options.map(o => ({ id: o.id, score: o.score, label: o.label }))).toEqual(source.anchors);
      expect(q.options.every(o => o.directionId === source.items[i].directionId)).toBe(true);
    }
    expect(quiz.profiles).toHaveLength(4); expect(quiz.profiles.every(p => p.sections.length === 8)).toBe(true); expect(quiz.faq).toHaveLength(8);
    const visit = (v: unknown): void => {
      if (!v || typeof v !== "object") return;
      const x = v as Record<string, unknown>;
      if ("en" in x || "zh" in x) { expect(x.en).toBeTypeOf("string"); expect(x.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(x.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(x).forEach(visit);
    }; visit(quiz);
  });
  it("matches31250 independent marginal witnesses and every worked guide example without a type", () => {
    // The independent Python fixture records one exact rational witness for
    // each reachable sum. Enumerate every six-response vector here against
    // that oracle, rather than mistaking the 25 sums for 15,625 stored rows.
    expect(reference.states).toHaveLength(25);
    const bySum = new Map(reference.states.map(witness => [witness.sum, witness.display]));
    expect([...bySum.keys()]).toEqual(Array.from({ length: 25 }, (_, i) => i + 6));
    let checked = 0;
    for (const direction of quiz.directions) for (let state = 0; state < 15625; state++) {
      const a = answers(); const qs = quiz.questions.filter(q => q.options[0].directionId === direction.id);
      let remaining = state, sum = 0;
      for (const q of qs) {
        const value = remaining % 5 + 1;
        remaining = Math.floor(remaining / 5); sum += value; a[q.id] = String(value);
      }
      const r = complete(a), part = r.facets[direction.id];
      expect(part.sum).toBe(sum); expect(part.mean?.toFixed(1)).toBe(bySum.get(sum)); expect(part.rated).toBe(6);
      expect(Object.keys(r)).toEqual(["status", "answered", "facets"]); checked++;
    }
    expect(checked).toBe(31250);
    for (const witness of reference.worked) {
      const a = Object.fromEntries(quiz.questions.map((q, i) => [q.id, String(witness.answers[i])])); const r = complete(a);
      quiz.directions.forEach((d, i) => { expect(r.facets[d.id].sum).toBe(witness.sums[i]); expect(r.facets[d.id].mean?.toFixed(1)).toBe(witness.displays[i]); });
    }
  });
  it("keeps every joint4096 missing mask local to its own six-item part", () => {
    for (let mask = 0; mask < 4096; mask++) {
      const a = answers(); quiz.questions.forEach((q, i) => { if (mask & (1 << i)) a[q.id] = "na"; });
      const r = complete(a);
      expect(r.facets["warm-response"].mean).toBe((mask & 63) ? null : 3);
      expect(r.facets["clear-boundaries"].mean).toBe((mask & (63 << 6)) ? null : 3);
    }
    const partial = answers(); delete partial.PCARE_12; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 11 });
    for (const bad of [null, [], new Date(), { ...answers(), unknown: "3" }, { ...answers(), PCARE_01: "0" }, { PCARE_01: 3 }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].reverse = true; expect(scoreQuestionnaire(bad, answers()).status).toBe("unavailable");
  });
  it("renders both means and all32 complete body paragraphs for complete and all-NA attempts", () => {
    for (const locale of ["en", "zh"] as const) for (const missing of [false, true]) {
      const r = complete(answers(missing ? "na" : "3")); const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<><QuestionnaireParentingPracticesReport quiz={quiz} result={r} locale={locale} /><QuestionnaireParentingPracticesNextSteps result={r} locale={locale} /></>);
      expect(dom.querySelectorAll("[data-parenting-practices-part]")).toHaveLength(2); expect(dom.querySelectorAll("[data-parenting-practices-guide]")).toHaveLength(4);
      for (const profile of quiz.profiles) {
        const guide = dom.querySelector(`[data-parenting-practices-guide="${profile.id}"]`)!;
        expect(guide.querySelector("h3")?.textContent).toBe(profile.title[locale]); expect(guide.querySelectorAll("h4")).toHaveLength(8);
        for (const section of profile.sections) expect(guide.textContent).toContain(section.paragraphs[0][locale]);
      }
      expect(dom.querySelector("[data-parenting-practices-mean]")?.textContent).toContain(missing ? (locale === "zh" ? "资料不足" : "Insufficient information") : "3.0 / 5");
      expect(dom.querySelector("a[href*='tests/mbti']")).toBeNull();
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
      if (missing) expect(dom.querySelector("[data-parenting-practices-next-steps] h2")?.textContent).toContain(locale === "zh" ? "本次作答已结束" : "This attempt is finished");
    }
  });
  it("emits10 native SEO pages with exact body copy, method, links and sitemap identities", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/parenting-style`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, meta = await entry.generateMetadata(props);
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props)); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.description).toBe(quiz.description[locale]);
        expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); const method = dom.querySelector('section[aria-labelledby="questionnaire-method"]'); expect(method?.querySelectorAll("p")).toHaveLength(quiz.guide.length);
        for (const section of quiz.guide) expect(method?.textContent).toContain(section.paragraphs[0][locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`); expect(maps.some(e => e.loc === `https://fermatmind.com${path}`)).toBe(true);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, args = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, m = await guide.generateMetadata(args);
          dom.innerHTML = renderToStaticMarkup(await guide.default(args)); expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); expect(m.title).toBe(profile.seo!.title[locale]); expect(m.description).toBe(profile.seo!.description[locale]); expect(m.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(m.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/parenting-style/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/parenting-style/results/${profile.id}` });
          for (const section of profile.sections) expect(dom.textContent).toContain(section.paragraphs[0][locale]);
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-parenting-practices-mean]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
  it("fails closed at the actual entry, guide metadata and image readers when the fixed source shape is damaged", async () => {
    const faults = [
      (q: Questionnaire) => { q.questions[0].reverse = true; },
      (q: Questionnaire) => { delete q.questions[1]; },
      (q: Questionnaire) => { q.profiles[0].sections[0].paragraphs[0].en = ""; },
      (q: Questionnaire) => { q.questions[0].options[5].score = 0; },
    ];
    for (const fault of faults) {
      const damaged = structuredClone(quiz); fault(damaged);
      vi.resetModules(); vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => damaged }));
      try {
        const entry = await import("@/components/questionnaires/QuestionnairePage");
        const guide = await import("@/components/questionnaires/QuestionnaireGuide");
        const { GET } = await import("@/app/og/fun/[slug]/route");
        for (const locale of ["en", "zh"] as const) {
          const args = { params: Promise.resolve({ locale, slug: quiz.slug }) };
          const resultArgs = { params: Promise.resolve({ locale, slug: quiz.slug, profile: quiz.profiles[0].id }) };
          expect((await entry.generateMetadata(args)).robots).toMatchObject({ index: false });
          expect((await guide.generateMetadata(resultArgs)).robots).toMatchObject({ index: false });
          await expect(entry.default(args)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/);
          await expect(guide.default(resultArgs)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/);
          expect((await GET(new Request(`https://fermatmind.com/og/fun/parenting-style?locale=${locale}`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
        }
      } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
    }
  });

});
