import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { isPtq15ConfigurationValid } from "@/lib/questionnaires/ptq15";
import { readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnairePtq15Report, QuestionnairePtq15NextSteps } from "@/components/questionnaires/QuestionnairePtq15Report";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/overthinking-screener.json", "utf8")) as Questionnaire;
const sourceBytes = readFileSync("tests/fixtures/questionnaires/overthinking-ptq15-source-reference.json");
const source = JSON.parse(sourceBytes.toString()) as { questions: Questionnaire["questions"]; rights_and_provenance: { article_license_url: string; original_pdf: string; public_attribution_required: { en: string; zh: string } } };
const profileBytes = readFileSync("tests/fixtures/questionnaires/overthinking-ptq15-profiles-reference.json");
const ids = ["core", "unproductive", "mental-capacity"] as const;
const groups = [[1, 2, 3, 6, 7, 8, 11, 12, 13], [4, 9, 14], [5, 10, 15]];
const id = (n: number) => `PTQ_${String(n).padStart(2, "0")}`;
const baseline: QuestionnaireAnswers = Object.fromEntries(Array.from({ length: 15 }, (_, i) => [id(i + 1), "0"]));
function complete(answers: QuestionnaireAnswers) {
  const r = scoreQuestionnaire(quiz, answers);
  if (r.status !== "complete" || !("ptq15" in r)) throw Error("PTQ15 dispatcher result rejected");
  return r;
}
function witness(group: number[], total: number, answers: QuestionnaireAnswers) {
  let remaining = total;
  for (const n of [...group].reverse()) { const v = Math.min(remaining, 4); answers[id(n)] = String(v); remaining -= v; }
  assert.equal(remaining, 0);
}
type ConfigurationPath = (string | number)[];
const configurationPaths: ConfigurationPath[] = [
  ...quiz.directions.map((_, i) => ["directions", i]),
  ...quiz.questions.map((_, i) => ["questions", i]),
  ...quiz.questions.flatMap((q, i) => q.options.map((_, j) => ["questions", i, "options", j])),
  ...quiz.profiles.map((_, i) => ["profiles", i]),
  ...quiz.profiles.flatMap((p, i) => p.sections.map((_, j) => ["profiles", i, "sections", j])),
  ...quiz.profiles.flatMap((p, i) => p.sections.flatMap((section, j) => section.paragraphs.map((_, k) => ["profiles", i, "sections", j, "paragraphs", k]))),
  ...quiz.profiles.flatMap((p, i) => p.directionIds.map((_, j) => ["profiles", i, "directionIds", j]))
];
function damageConfiguration(path: ConfigurationPath, mutation: "hole" | "undefined" | "null") {
  const q = structuredClone(quiz);
  const parent = path.slice(0, -1).reduce<unknown>((value, key) => (value as Record<string | number, unknown>)[key], q) as Record<string | number, unknown>;
  const last = path.at(-1)!;
  if (mutation === "hole") delete parent[last];
  else parent[last] = mutation === "undefined" ? undefined : null;
  return q;
}
const firstFamilyPaths: ConfigurationPath[] = [
  ["directions", 0], ["questions", 0], ["questions", 0, "options", 0], ["profiles", 0],
  ["profiles", 0, "sections", 0], ["profiles", 0, "sections", 0, "paragraphs", 0], ["profiles", 0, "directionIds", 0]
];
describe("T195 original PTQ15: original key, continuous sums and disclosed working translation", () => {
  it("binds all15 original-order bilingual items and anchors, four FULL6 bodies and exact source digests", () => {
    expect(isPtq15ConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toEqual(source.questions);
    expect(createHash("sha256").update(sourceBytes).digest("hex")).toBe(quiz.source.itemBankSha256);
    expect(createHash("sha256").update(profileBytes).digest("hex")).toBe(quiz.source.resultContentSha256);
    expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.directions.map(d => [d.id, d.itemCount])).toEqual([["core", 9], ["unproductive", 3], ["mental-capacity", 3]]);
    expect(quiz.profiles.map(p => p.id)).toEqual(["total-reading", "core-reading", "unproductive-reading", "mental-capacity-reading"]);
    expect(quiz.profiles.map(p => p.sections.length)).toEqual([6, 6, 6, 6]);
    quiz.questions.forEach((q, i) => {
      expect(q.id).toBe(id(i + 1)); expect(q.reverse).toBeUndefined(); expect(q.options.map(o => o.score)).toEqual([0, 1, 2, 3, 4, null]);
      expect(q.options.slice(0, 5).map(o => o.label.en)).toEqual(["Never", "Rarely", "Sometimes", "Often", "Almost always"]);
      expect(q.options.every(o => o.directionId === ids[groups.findIndex(g => g.includes(i + 1))])).toBe(true);
    });
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.instructions!.en).toContain("typically think about negative experiences or problems");
    expect(source.rights_and_provenance.article_license_url).toBe("https://creativecommons.org/licenses/by/3.0/");
    expect(quiz.references?.map(r => r.url)).toContain(source.rights_and_provenance.original_pdf);
    expect(quiz.guide.find(s => s.id === "source")?.paragraphs[0]).toEqual(source.rights_and_provenance.public_attribution_required);
    const arithmetic = quiz.guide.find(s => s.id === "scoring")!.paragraphs[0];
    expect(arithmetic.en).toContain("2, 1, 3, 2, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 3");
    for (const locale of ["en", "zh"] as const) expect(arithmetic[locale]).toContain("18 + 6 + 5 = 29");
    expect(quiz.faq[0].question.zh).toBe("这里用的是哪份过度思考问卷？");
    expect(JSON.stringify([quiz.introduction, quiz.faq[0]])).not.toMatch(/JobCannon|24-item|24项/);
  });
  it("executes all6253 joint subscale-sum witnesses and75individual options without zero-falsey or mean conversion", () => {
    let count = 0;
    for (let core = 0; core <= 36; core++) for (let unproductive = 0; unproductive <= 12; unproductive++) for (let attention = 0; attention <= 12; attention++) {
      const answers = { ...baseline }; [core, unproductive, attention].forEach((sum, i) => witness(groups[i], sum, answers));
      const r = complete(answers).ptq15;
      [core, unproductive, attention].forEach((sum, i) => assert.deepEqual(r.parts[ids[i]], { rated: groups[i].length, total: groups[i].length, maximum: groups[i].length * 4, sum }));
      assert.equal(r.overallSum, core + unproductive + attention); count++;
    }
    expect(count).toBe(6253);
    for (let n = 1; n <= 15; n++) for (let value = 0; value < 5; value++) {
      const r = complete({ ...baseline, [id(n)]: String(value) }).ptq15;
      expect(r.overallSum).toBe(value); expect(r.parts[ids[groups.findIndex(g => g.includes(n))]].sum).toBe(value);
    }
    const worked = [2, 1, 3, 2, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 3], r = complete(Object.fromEntries(worked.map((v, i) => [id(i + 1), String(v)]))).ptq15;
    expect(ids.map(key => r.parts[key].sum)).toEqual([18, 6, 5]); expect(r.overallSum).toBe(29);
  });
  it("checks all32768 joint unscored masks, partial/invalid attempts, malformed configuration and draft expiry", () => {
    for (let mask = 0; mask < 32768; mask++) {
      const answers = Object.fromEntries(Array.from({ length: 15 }, (_, i) => [id(i + 1), mask & (1 << i) ? "na" : "2"]));
      const r = complete(answers).ptq15, rated = groups.map(g => g.filter(n => !(mask & (1 << (n - 1)))).length);
      assert.equal(r.rated, rated.reduce((n, v) => n + v, 0)); assert.equal(r.overallSum, mask === 0 ? 30 : null);
      ids.forEach((key, i) => assert.deepEqual(r.parts[key], { rated: rated[i], total: groups[i].length, maximum: groups[i].length * 4, sum: rated[i] === groups[i].length ? rated[i] * 2 : null }));
    }
    for (const n of [0, 1, 14]) expect(scoreQuestionnaire(quiz, Object.fromEntries(Object.entries(baseline).slice(0, n))).status).toBe("incomplete");
    for (const a of [null, [], new Date(), { ...baseline, BAD: "0" }, { ...baseline, PTQ_01: 0 }, { ...baseline, PTQ_01: "5" }]) expect(scoreQuestionnaire(quiz, a).status).toBe("invalid");
    const faults = [(q: Questionnaire) => { q.source = null!; }, (q: Questionnaire) => { q.questions = null!; }, (q: Questionnaire) => { q.questions[0] = null!; }, (q: Questionnaire) => { q.questions[0].options = null!; }, (q: Questionnaire) => { q.questions[0].reverse = true; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }, (q: Questionnaire) => { q.directions[0].itemCount = 8; }, (q: Questionnaire) => { q.profiles[0].directionIds.pop(); }, (q: Questionnaire) => { q.source.scoringVersion = "sumofpartmeans"; }];
    for (const fault of faults) { const q = structuredClone(quiz); fault(q); expect(isPtq15ConfigurationValid(q)).toBe(false); expect(scoreQuestionnaire(q, baseline).status).toBe("unavailable"); }
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { PTQ_01: "0", PTQ_02: "na" } });
    expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ PTQ_01: "0", PTQ_02: "na" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull(); expect(readQuestionnaireDraft(quiz, draft, 99)).toBeNull();
  });
  it("rejects holes, explicit undefined and null at all166 positions across seven configuration array families", () => {
    expect(configurationPaths).toHaveLength(166); let checked = 0;
    for (const path of configurationPaths) for (const mutation of ["hole", "undefined", "null"] as const) {
      const bad = damageConfiguration(path, mutation);
      expect(() => isPtq15ConfigurationValid(bad)).not.toThrow(); expect(isPtq15ConfigurationValid(bad)).toBe(false);
      for (const answers of [{}, baseline]) { expect(() => scoreQuestionnaire(bad, answers)).not.toThrow(); expect(scoreQuestionnaire(bad, answers)).toEqual({ status: "unavailable", answered: 0 }); }
      checked++;
    }
    expect(checked).toBe(498);
  });
  it("renders every full reading for zero/maximum/mixed/oneNA/allNA, with unique IDs and no score-based next-step recommendation", () => {
    const patterns = [baseline, Object.fromEntries(Object.keys(baseline).map(k => [k, "4"])), Object.fromEntries(Object.keys(baseline).map((k, i) => [k, String(i % 5)])), { ...baseline, PTQ_01: "na" }, Object.fromEntries(Object.keys(baseline).map(k => [k, "na"]))];
    for (const locale of ["en", "zh"] as const) for (const answers of patterns) {
      const result = complete(answers), dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<QuestionnairePtq15Report quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-ptq15-part]")).toHaveLength(4);
      expect(dom.querySelector('[data-ptq15-score="total-reading"]')?.textContent).toContain(result.ptq15.overallSum === null ? (locale === "zh" ? "资料不足" : "Insufficient information") : (locale === "zh" ? `原始和：${result.ptq15.overallSum}` : `Raw sum: ${result.ptq15.overallSum}`));
      for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
      const allIds = [...dom.querySelectorAll("[id]")].map(e => e.id); expect(new Set(allIds).size).toBe(allIds.length); expect(dom.querySelectorAll('a[href*="/results/"]')).toHaveLength(4);
    }
    for (const locale of ["en", "zh"] as const) { const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePtq15NextSteps locale={locale} />); expect(dom.querySelectorAll('a[href*="/tests/"]')).toHaveLength(0); }
  });
  it("serves all10 native pages with independent metadata, every entry/guide paragraph and explicit source credit", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, ep = { params: Promise.resolve({ locale, slug: quiz.slug }) }, dom = document.createElement("div"), meta = await entry.generateMetadata(ep);
        dom.innerHTML = renderToStaticMarkup(await entry.default(ep)); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.description).toBe(quiz.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(dom.textContent).toContain(quiz.instructions![locale]); const method = dom.querySelector('section[aria-labelledby="questionnaire-method"]')!; expect(method).not.toBeNull(); expect(method.querySelectorAll(":scope > p")).toHaveLength(7); expect(method.querySelectorAll(":scope > h3")).toHaveLength(6); for (const s of quiz.guide) { expect(method.textContent).toContain(s.title[locale]); for (const p of s.paragraphs) expect(method.textContent).toContain(p[locale]); }
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const p of quiz.profiles) {
          const native = `${path}/results/${p.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, gm = await guide.generateMetadata(gp), body = document.createElement("div"); body.innerHTML = renderToStaticMarkup(await guide.default(gp));
          expect(gm.title).toBe(p.seo!.title[locale]); expect(gm.description).toBe(p.seo!.description[locale]); expect(gm.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(gm.alternates?.languages?.en).toBe(`https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`);
          expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(body.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const t of s.paragraphs) expect(body.textContent).toContain(t[locale]); expect(body.querySelector("[data-ptq15-result]")).toBeNull(); const credit = body.querySelector("[data-ptq15-source]")!; expect(credit).not.toBeNull(); for (const t of quiz.guide.find(section => section.id === "source")!.paragraphs) expect(credit.textContent).toContain(t[locale]);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
  it("fails closed in entry, guide, metadata and PNG callers for a reverse key and all21 sparse/undefined/null family witnesses", async () => {
    const reverse = structuredClone(quiz); reverse.questions[0].reverse = true;
    const variants = [reverse, ...firstFamilyPaths.flatMap(path => (["hole", "undefined", "null"] as const).map(mutation => damageConfiguration(path, mutation)))];
    expect(variants).toHaveLength(22);
    for (const bad of variants) {
      vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => bad })); vi.resetModules();
      try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), og = await import("@/app/og/fun/[slug]/route");
      const ep = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, gp = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "total-reading" }) };
      expect((await entry.generateMetadata(ep)).robots).toEqual({ index: false, follow: false }); expect((await guide.generateMetadata(gp)).robots).toEqual({ index: false, follow: false }); await expect(entry.default(ep)).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" }); await expect(guide.default(gp)).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" }); expect((await og.GET(new Request(`https://fermatmind.com/og/fun/${quiz.slug}?locale=en`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
      } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
    }
  }, 30000);
});
