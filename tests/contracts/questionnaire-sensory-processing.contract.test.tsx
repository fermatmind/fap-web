import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { isSpq92ConfigurationValid } from "@/lib/questionnaires/spq92";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireSpq92Report, QuestionnaireSpq92NextSteps } from "@/components/questionnaires/QuestionnaireSpq92Report";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/sensory-processing-test.json", "utf8")) as Questionnaire;
const sourceBytes = readFileSync("tests/fixtures/questionnaires/spq92-source-reference.json"), source = JSON.parse(sourceBytes.toString()) as { reverse92: number[]; questions: { number: number; id: string; prompt: Questionnaire["questions"][number]["prompt"]; reverse: boolean }[] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/spq92-profiles-reference.json");
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/spq92-scoring-reference.json", "utf8")) as { source_sha256: string; uniform_raw: Record<string, number> };
const reversals = new Set(source.reverse92), id = (n: number) => `SPQ92_${String(n).padStart(2, "0")}`;
const uniform = (value: string): QuestionnaireAnswers => Object.fromEntries(Array.from({ length: 92 }, (_, i) => [id(i + 1), value]));
function complete(answers: QuestionnaireAnswers) {
  const r = scoreQuestionnaire(quiz, answers);
  if (r.status !== "complete" || !("spq92" in r)) throw Error("SPQ result rejected");
  return r;
}
function witness(total: number): QuestionnaireAnswers {
  let remaining = total;
  const answers: QuestionnaireAnswers = {};
  for (let n = 1; n <= 92; n++) { const scored = Math.min(remaining, 3); remaining -= scored; answers[id(n)] = String(reversals.has(n) ? 3 - scored : scored); }
  assert.equal(remaining, 0);
  return answers;
}
type ArrayPath = (string | number)[];
const arrayPaths: ArrayPath[] = [["directions"], ["profiles"], ["questions"], ...quiz.questions.map((_, i) => ["questions", i, "options"]),
  ...quiz.profiles.flatMap((p, i) => [["profiles", i, "directionIds"], ["profiles", i, "sections"], ...p.sections.map((_, j) => ["profiles", i, "sections", j, "paragraphs"])])];
const arrayAt = (q: Questionnaire, path: ArrayPath) => path.reduce<unknown>((v, key) => (v as Record<string | number, unknown>)[key], q) as unknown[];
const arrayFaults = arrayPaths.flatMap(path => arrayAt(quiz, path).flatMap((_, index) => (["hole", "undefined", "null"] as const).map(mode => ({ path, index, mode }))));
function faulted(f: typeof arrayFaults[number]) {
  const q = structuredClone(quiz), values = arrayAt(q, f.path);
  if (f.mode === "hole") delete values[f.index]; else values[f.index] = f.mode === "null" ? null : undefined;
  return q;
}
describe("T188 full published SPQ92 with explicitly selected current44 reverse key", () => {
  it("binds all92 literal bilingual items, original source and one complete FULL6 without borrowing a short form", () => {
    expect(isSpq92ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(createHash("sha256").update(sourceBytes).digest("hex")).toBe(quiz.source.itemBankSha256); expect(reference.source_sha256).toBe(quiz.source.itemBankSha256);
    expect(createHash("sha256").update(profileBytes).digest("hex")).toBe(quiz.source.resultContentSha256); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.questions).toHaveLength(92); expect(source.reverse92).toHaveLength(44); expect(source.reverse92).toEqual([...reversals].sort((a, b) => a - b)); expect(reversals.has(6) && reversals.has(53)).toBe(true);
    expect(quiz.directions.map(d => [d.id, d.itemCount])).toEqual([["spq92-total", 92]]); expect(quiz.profiles.map(p => p.sections.length)).toEqual([6]);
    for (const item of source.questions) { const q = quiz.questions[item.number - 1]; expect([q.id, q.prompt, q.reverse]).toEqual([item.id, item.prompt, item.reverse]); expect(q.id).toBe(id(item.number)); expect(q.reverse).toBe(reversals.has(item.number)); expect(q.options.map(o => [o.id, o.score, o.directionId])).toEqual([...[0, 1, 2, 3].map(v => [String(v), v, "spq92-total"]), ["na", null, "spq92-total"]]); expect(q.options.slice(0, 4).map(o => o.label.en)).toEqual(["Strongly Agree", "Agree", "Disagree", "Strongly Disagree"]); }
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.minimumRatedItems).toBeUndefined(); expect(quiz.guide).toHaveLength(5); expect(quiz.faq).toHaveLength(7); expect(quiz.references?.map(r => r.url)).toContain("https://creativecommons.org/licenses/by/2.0/");
    for (const locale of ["en", "zh"] as const) { expect(quiz.instructions![locale].length).toBeGreaterThan(0); for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(t[locale].trim()).not.toBe(""); }
  });
  it("executes all277total witnesses and368single-item probes against the independent current-key fixture", () => {
    for (let total = 0; total <= 276; total++) assert.deepEqual(complete(witness(total)).spq92, { rated: 92, skipped: 0, total });
    let probes = 0;
    for (let n = 1; n <= 92; n++) for (let raw = 0; raw <= 3; raw++) { assert.equal(complete({ ...uniform("0"), [id(n)]: String(raw) }).spq92.total, 132 + (reversals.has(n) ? -raw : raw)); probes++; }
    expect(probes).toBe(368); for (const [raw, total] of Object.entries(reference.uniform_raw)) expect(complete(uniform(raw)).spq92.total).toBe(total);
    expect(complete(witness(0)).spq92.total).toBe(0); expect(complete(witness(276)).spq92.total).toBe(276); expect(complete(uniform("1")).spq92.total).toBe(136);
  });
  it("withholds any incomplete numeric total while allowing allNA completion, partial attempts and valid expiring drafts", () => {
    for (let n = 1; n <= 92; n++) assert.deepEqual(complete({ ...uniform("1"), [id(n)]: "na" }).spq92, { rated: 91, skipped: 1, total: null });
    expect(complete(uniform("na")).spq92).toEqual({ rated: 0, skipped: 92, total: null });
    for (let length = 0; length < 92; length++) expect(scoreQuestionnaire(quiz, Object.fromEntries(Array.from({ length }, (_, i) => [id(i + 1), "na"])))).toEqual({ status: "incomplete", answered: length });
    for (const answers of [null, [], new Date(), { ...uniform("1"), BAD: "1" }, { ...uniform("1"), SPQ92_01: 1 }, { ...uniform("1"), SPQ92_01: "4" }, { ...uniform("1"), SPQ92_01: null }]) expect(scoreQuestionnaire(quiz, answers).status).toBe("invalid");
    const plain = Object.assign(Object.create(null), uniform("1")); expect(complete(plain).spq92.total).toBe(136);
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { SPQ92_01: "1", SPQ92_02: "na" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ SPQ92_01: "1", SPQ92_02: "na" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull(); expect(readQuestionnaireDraft(quiz, draft, 99)).toBeNull();
  });
  it("keeps zero,276,136,oneNA andallNA distinct while retaining every bilingual paragraph and finished next steps", () => {
    for (const locale of ["en", "zh"] as const) for (const answers of [witness(0), witness(276), uniform("1"), { ...uniform("1"), SPQ92_01: "na" }, uniform("na")]) {
      const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<><QuestionnaireSpq92Report quiz={quiz} result={result} locale={locale} /><QuestionnaireSpq92NextSteps locale={locale} /></>);
      expect(dom.querySelector("[data-spq92-total]")?.textContent).toContain(result.spq92.total === null ? (locale === "zh" ? "资料不足" : "Insufficient information") : (locale === "zh" ? `${result.spq92.total}（0到276；` : `${result.spq92.total} (0 to 276;`));
      for (const p of quiz.profiles) for (const s of p.sections) for (const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      expect(dom.querySelectorAll('[data-spq92-next-steps]')).toHaveLength(1); expect(dom.querySelectorAll('a[href*="mbti"]')).toHaveLength(0); expect(dom.querySelectorAll('a[href*="/results/"]')).toHaveLength(1); expect(dom.querySelector('[data-spq92-source]')?.textContent).toContain("CC BY 2.0"); const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("serves all4native pages with independent metadata, literal body/source credit, native directory and sitemap", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, ep = { params: Promise.resolve({ locale, slug: quiz.slug }) }, dom = document.createElement("div"), meta = await entry.generateMetadata(ep); dom.innerHTML = renderToStaticMarkup(await entry.default(ep)); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.description).toBe(quiz.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(dom.textContent).toContain(quiz.instructions![locale]); for (const s of quiz.guide) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        const p = quiz.profiles[0], native = `${path}/results/${p.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, gm = await guide.generateMetadata(gp), gd = document.createElement("div"); gd.innerHTML = renderToStaticMarkup(await guide.default(gp)); expect(gm.title).toBe(p.seo!.title[locale]); expect(gm.description).toBe(p.seo!.description[locale]); expect(gm.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(gm.alternates?.languages?.en).toBe(`https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`); expect(gm.alternates?.languages?.["zh-CN"]).toBe(`https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}`); expect(gd.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const t of s.paragraphs) expect(gd.textContent).toContain(t[locale]); expect(gd.querySelector("[data-spq92-total]")).toBeNull(); expect(gd.querySelector("[data-spq92-source]")?.textContent).toContain("CC BY 2.0"); expect(gd.querySelector("#other-questionnaire-results")).toBeNull();
        expect(maps.some(e => e.loc === `https://fermatmind.com${path}`)).toBe(true); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true);
      }
      expect(maps.filter(e => e.loc.includes("/tests/explore/sensory-processing-test")).length).toBe(4);
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
  it("rejects wrong versions, short form, scores, reverse keys and all1701dense-array faults without generic fallthrough", () => {
    expect(arrayFaults).toHaveLength(1701);
    const mutations = [(q: Questionnaire) => { q.source.scoringVersion = "short35"; }, (q: Questionnaire) => { q.code = "other"; }, (q: Questionnaire) => { q.questions[5].reverse = false; }, (q: Questionnaire) => { q.questions[52].reverse = false; }, (q: Questionnaire) => { q.questions[0].options[4].score = 0; }, (q: Questionnaire) => { q.questions[0].options[0].score = 1; }, (q: Questionnaire) => { q.minimumRatedItems = 65; }, (q: Questionnaire) => { q.source = null!; }, (q: Questionnaire) => { q.questions = null!; }];
    for (const mutate of mutations) { const q = structuredClone(quiz); mutate(q); expect(isSpq92ConfigurationValid(q)).toBe(false); expect(scoreQuestionnaire(q, uniform("1"))).toEqual({ status: "unavailable", answered: 0 }); }
    for (const f of arrayFaults) { const q = faulted(f); expect(isSpq92ConfigurationValid(q), JSON.stringify(f)).toBe(false); expect(scoreQuestionnaire(q, uniform("1"))).toEqual({ status: "unavailable", answered: 0 }); }
    const generic = structuredClone(quiz); generic.kind = "likert"; expect(isQuestionnaireConfigurationValid(generic)).toBe(false);
  }, 20000);
  it("fails closed through real entry, guide, metadata and PNG callers for every dense-array fault and wrongkey", async () => {
    let candidate = structuredClone(quiz); vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => candidate })); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), og = await import("@/app/og/fun/[slug]/route"); const ep = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, gp = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "spq92-total-reading" }) };
      for (const f of [null, ...arrayFaults]) {
        candidate = f ? faulted(f) : structuredClone(quiz); if (!f) candidate.questions[5].reverse = false;
        expect((await entry.generateMetadata(ep)).robots).toEqual({ index: false, follow: false }); expect((await guide.generateMetadata(gp)).robots).toEqual({ index: false, follow: false }); await expect(entry.default(ep)).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" }); await expect(guide.default(gp)).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" }); expect((await og.GET(new Request("https://fermatmind.com/og/fun/sensory-processing-test?locale=en"), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
      }
    } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
  }, 20000);
});
