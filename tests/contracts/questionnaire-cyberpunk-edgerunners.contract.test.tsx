import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid, readQuestionnaireDraft, scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/cyberpunk-edgerunners.json", "utf8")) as Questionnaire;
const ids = ["david", "lucy", "rebecca", "maine", "kiwi", "falco", "faraday"];
const H = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const answersFor = (target?: string): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, (q.options.find(o => o.directionId === target) ?? q.options[0]).id]));

describe("T048 original first-series Cyberpunk: Edgerunners character comparison", () => {
  it("binds21original bilingual situations, seven selected real identities and balanced exposures to the declared edition", () => {
    expect(quiz.title.en).toBe("Cyberpunk: Edgerunners Test"); expect(quiz.slug).toBe("cyberpunk-edgerunners");
    expect(quiz.questions).toHaveLength(21); expect(quiz.directions.map(d => d.id)).toEqual(ids); expect(quiz.profiles.map(p => p.id)).toEqual(ids);
    expect(quiz.source.itemBankSha256).toBe("471e017793d97166c4dbb2c8d87fc8c3c0dda6153fc347b367e9231e56f770b3");
    expect(H(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(H(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.source.formCode).toBe("fm_edgerunners_original_21_v1"); expect(quiz.source.kind).toBe("original_unofficial_fan_quiz"); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(isArchetypeConfigurationValid(quiz)).toBe(true);
    for (const id of ids) {
      expect(quiz.directions.find(d => d.id === id)?.comparisons).toBe(12);
      for (let position = 0; position < 4; position++) expect(quiz.questions.filter(q => q.options[position].directionId === id)).toHaveLength(3);
      for (const other of ids.filter(x => x !== id)) expect(quiz.questions.filter(q => q.options.some(o => o.directionId === id) && q.options.some(o => o.directionId === other))).toHaveLength(6);
    }
    for (const q of quiz.questions) { expect(q.reverse).toBeUndefined(); expect(q.options.every(o => o.score === undefined)).toBe(true); }
    const text = (x: unknown): void => {
      if (!x || typeof x !== "object") return;
      const v = x as Record<string, unknown>;
      if (Object.keys(v).sort().join("|") === "en|zh") {
        expect(v.en).toEqual(expect.any(String)); expect(String(v.en)).not.toMatch(/\p{Script=Han}|TODO|lorem ipsum|placeholder/u);
        expect(String(v.zh)).toMatch(/\p{Script=Han}/u);
      } else Object.values(v).forEach(text);
    }; text(quiz);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(650);
      expect(p.seo?.title.en).toContain("Test Result"); expect(p.seo?.title.zh).toContain("测试结果");
    }
    expect(new Set(quiz.profiles.map(p => p.seo?.description.en)).size).toBe(7);
    expect(new Set(quiz.profiles.map(p => p.seo?.description.zh)).size).toBe(7);
    expect(readFileSync("public/fonts/noto-sans-sc/cyberpunk-edgerunners-700.ttf").byteLength).toBeLessThan(300000);
  });

  it("reaches every sole character and the seven-way tie without a random draw or fixed-order tie winner", () => {
    for (const id of ids) {
      const result = scoreArchetypeQuestionnaire(quiz, answersFor(id));
      if (result.status !== "complete") throw Error("Complete witness rejected");
      // The target is selected on all12 appearances; only9 remaining answers can go elsewhere.
      expect(result.counts[id]).toBe(12); expect(result.profileIds).toEqual([id]);
      expect(Object.values(result.counts).reduce((a, b) => a + b, 0)).toBe(21);
      for (const other of ids.filter(x => x !== id)) expect(result.counts[other]).toBeLessThanOrEqual(9);
    }
    const result = scoreArchetypeQuestionnaire(quiz, answersFor());
    if (result.status !== "complete") throw Error("Tie witness rejected");
    expect(Object.values(result.counts)).toEqual(Array(7).fill(3)); expect(new Set(result.profileIds)).toEqual(new Set(ids));
    const reordered = structuredClone(quiz); reordered.profiles.reverse();
    const other = scoreArchetypeQuestionnaire(reordered, answersFor());
    if (other.status !== "complete") throw Error("Reordered witness rejected");
    expect(new Set(other.profileIds)).toEqual(new Set(ids)); expect(other.counts).toEqual(result.counts);
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={result} locale="en" />);
    expect(dom.querySelectorAll("[data-archetype-match]")).toHaveLength(7); expect(dom.querySelectorAll("h4")).toHaveLength(49);
    for (const p of quiz.profiles) for (const section of p.sections) for (const t of section.paragraphs) expect(dom.textContent).toContain(t.en);
    const domIDs = [...dom.querySelectorAll("[id]")].map(n => n.id); expect(domIDs.length).toBe(new Set(domIDs).size);
  });

  it("withholds incomplete answers, rejects malformed mapping and scopes opted-in drafts to this version", () => {
    const partial = answersFor(); delete partial.EDGE_21;
    expect(scoreArchetypeQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 20 });
    for (const invalid of [null, [], { EDGE_01: "na" }, { EDGE_01: 1 }, { EDGE_22: "A" }]) expect(scoreArchetypeQuestionnaire(quiz, invalid).status).toBe("invalid");
    for (const change of [(q: Questionnaire) => { q.questions[0].options[0].score = 1; }, (q: Questionnaire) => { q.directions[0].comparisons = 13; }, (q: Questionnaire) => { q.profiles[0].directionIds = ["kiwi"]; }]) {
      const bad = structuredClone(quiz); change(bad); expect(scoreArchetypeQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    }
    const draft = { version: quiz.version, savedAt: 123456, answers: { EDGE_01: "B" } };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123457)).toEqual(draft.answers);
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123456 + 86400000)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ ...draft, version: "other" }), 123457)).toBeNull();
  });

  it("serves two complete entries and fourteen full public character guides with localized metadata and native discovery", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const base = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)); const meta = await entry.generateMetadata(props);
        expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${base}`);
        const dom = document.createElement("div"); dom.innerHTML = html;
        for (const s of quiz.guide) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
        for (const f of quiz.faq) expect(dom.textContent).toContain(f.answer[locale]);
        // The Chinese-name FAQ needs the primary Chinese naming source, not only the English cast page.
        expect(quiz.references?.map(r => r.url)).toContain("https://www.cyberpunk.net/zh-cn/edgerunners");
        for (const reference of quiz.references ?? []) expect(dom.querySelector(`a[href="${reference.url}"]`)?.textContent).toBe(reference.title[locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${base}"`);
        expect(maps.filter(x => x.loc === `https://fermatmind.com${base}`)).toHaveLength(1);
        for (const p of quiz.profiles) {
          const props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, path = `${base}/results/${p.id}`;
          const html = renderToStaticMarkup(await guide.default(props)); const meta = await guide.generateMetadata(props);
          const dom = document.createElement("div"); dom.innerHTML = html;
          expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]);
          for (const section of p.sections) for (const t of section.paragraphs) expect(dom.textContent).toContain(t[locale]);
          expect(meta.title).toBe(p.seo?.title[locale]); expect(meta.description).toBe(p.seo?.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` });
          expect(maps.filter(x => x.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
          expect(dom.querySelector("[data-archetype-count]")).toBeNull();
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
