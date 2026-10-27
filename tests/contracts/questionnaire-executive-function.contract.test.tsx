import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { isAdexi14ConfigurationValid, formatAdexi14Mean } from "@/lib/questionnaires/adexi14";
import { readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireAdexi14Report } from "@/components/questionnaires/QuestionnaireAdexi14Report";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/executive-function.json", "utf8")) as Questionnaire;
const sourceBytes = readFileSync("tests/fixtures/questionnaires/adexi14-source-reference.json"), source = JSON.parse(sourceBytes.toString()) as { questions: Questionnaire["questions"] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/adexi14-profiles-reference.json");
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/adexi14-scoring-reference.json", "utf8")) as { source_sha256: string; overall14_distribution: Record<string, string>; part_mean_display: Record<string, Record<string, string>> };
const domains = ["working-memory", "inhibition"] as const, groups = [[1, 2, 5, 7, 8, 9, 11, 12, 13], [3, 4, 6, 10, 14]];
const id = (n: number) => `ADEXI_${String(n).padStart(2, "0")}`;
const baseline: QuestionnaireAnswers = Object.fromEntries(Array.from({ length: 14 }, (_, i) => [id(i + 1), "3"]));
function complete(answers: QuestionnaireAnswers) {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("adexi14" in result)) throw Error("ADEXI result rejected");
  return result;
}
function witness(group: number[], total: number, answers: QuestionnaireAnswers) {
  let extra = total - group.length;
  for (const n of group) { const v = Math.min(extra, 4); answers[id(n)] = String(v + 1); extra -= v; }
  expect(extra).toBe(0);
}
type ArrayPath = (string | number)[];
function validatedArrayPaths(): ArrayPath[] {
  return [["directions"], ["profiles"], ["questions"],
    ...quiz.questions.map((_, i) => ["questions", i, "options"]),
    ...quiz.profiles.flatMap((p, i) => [["profiles", i, "directionIds"], ["profiles", i, "sections"],
      ...p.sections.map((_, j) => ["profiles", i, "sections", j, "paragraphs"])])];
}
function arrayAt(q: Questionnaire, path: ArrayPath): unknown[] {
  return path.reduce<unknown>((v, key) => (v as Record<string | number, unknown>)[key], q) as unknown[];
}
const faults = validatedArrayPaths().flatMap(path => arrayAt(quiz, path).flatMap((_, index) =>
  (["hole", "undefined", "null"] as const).map(mode => ({ path, index, mode }))));
function arrayFault(fault: typeof faults[number]): Questionnaire {
  const bad = structuredClone(quiz), values = arrayAt(bad, fault.path);
  if (fault.mode === "hole") delete values[fault.index]; else values[fault.index] = fault.mode === "null" ? null : undefined;
  return bad;
}
describe("T189 official ADEXI14: source raw sums and separately labelled part means", () => {
  it("binds fourteen official bilingual statements, all anchors, source groups and three complete readings", () => {
    expect(isAdexi14ConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toEqual(source.questions); expect(quiz.questions.map(q => q.id)).toEqual(Array.from({ length: 14 }, (_, i) => id(i + 1)));
    expect(createHash("sha256").update(sourceBytes).digest("hex")).toBe(quiz.source.itemBankSha256); expect(reference.source_sha256).toBe(quiz.source.itemBankSha256);
    expect(createHash("sha256").update(profileBytes).digest("hex")).toBe(quiz.source.resultContentSha256); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.directions.map(d => [d.id, d.itemCount])).toEqual([["working-memory", 9], ["inhibition", 5]]); expect(quiz.questions.every(q => q.reverse === false)).toBe(true); expect(quiz.profiles.map(p => p.sections.length)).toEqual([6, 6, 6]);
    for (let i = 0; i < 14; i++) { const q = quiz.questions[i], domain = groups[0].includes(i + 1) ? "working-memory" : "inhibition"; expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]); expect(q.options.every(o => o.directionId === domain)).toBe(true); for (const locale of ["en", "zh"] as const) for (const o of q.options) expect(o.label[locale].trim()).not.toBe(""); }
    expect(quiz.questions[5].prompt.en).toContain("refraining for smiling"); expect(quiz.questions[9].prompt.zh).toContain("睇电视"); expect(quiz.introduction.zh).toContain("Angela Siu"); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.references?.map(r => r.url)).toContain("https://www.chexi.se/translations"); expect(readFileSync("public/fonts/noto-sans-sc/executive-function-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("executes all777joint-sum witnesses and70individual-option probes without averaging part means", () => {
    let pairs = 0;
    for (let wm = 9; wm <= 45; wm++) for (let inhibition = 5; inhibition <= 25; inhibition++) {
      const answers = { ...baseline }; witness(groups[0], wm, answers); witness(groups[1], inhibition, answers); const r = complete(answers).adexi14;
      assert.deepEqual(r.parts["working-memory"], { rated: 9, total: 9, sum: wm, mean: wm / 9 }); assert.deepEqual(r.parts.inhibition, { rated: 5, total: 5, sum: inhibition, mean: inhibition / 5 }); assert.equal(r.overallSum, wm + inhibition);
      expect(formatAdexi14Mean(wm, 9)).toBe(reference.part_mean_display["working-memory"][wm]); expect(formatAdexi14Mean(inhibition, 5)).toBe(reference.part_mean_display.inhibition[inhibition]); pairs++;
    } expect(pairs).toBe(777);
    let probes = 0; for (let n = 1; n <= 14; n++) for (let value = 1; value <= 5; value++) { const r = complete({ ...baseline, [id(n)]: String(value) }).adexi14, group = groups[0].includes(n) ? "working-memory" : "inhibition"; expect(r.overallSum).toBe(39 + value); expect(r.parts[group].sum).toBe((group === "working-memory" ? 24 : 12) + value); probes++; } expect(probes).toBe(70);
    const example = Object.fromEntries(quiz.questions.map((q, i) => [q.id, groups[0].includes(i + 1) ? "2" : "4"])); expect(complete(example).adexi14.overallSum).toBe(38); expect(complete(example).adexi14.parts["working-memory"].sum).toBe(18); expect(complete(example).adexi14.parts.inhibition.sum).toBe(20);
    let dp: Record<string, number> = { "0": 1 }; for (let i = 0; i < 14; i++) { const next: Record<string, number> = {}; for (const [sum, count] of Object.entries(dp)) for (let v = 1; v <= 5; v++) next[Number(sum) + v] = (next[Number(sum) + v] ?? 0) + count; dp = next; }
    expect(Object.fromEntries(Object.entries(dp).map(([sum, count]) => [sum, String(count)]))).toEqual(reference.overall14_distribution); expect(Object.values(dp).reduce((a, b) => a + b, 0)).toBe(6103515625);
  });
  it("checks all16384jointskipmasks, partial attempts, invalid identities and draft expiry", () => {
    for (let mask = 0; mask < 16384; mask++) {
      const answers: QuestionnaireAnswers = {}; const rated = [0, 0]; for (let n = 1; n <= 14; n++) { const skip = !!(mask & (1 << (n - 1))); answers[id(n)] = skip ? "na" : "3"; if (!skip) rated[groups[0].includes(n) ? 0 : 1]++; }
      const r = complete(answers).adexi14; assert.equal(r.rated, rated[0] + rated[1]); assert.equal(r.overallSum, rated[0] + rated[1] === 14 ? 42 : null);
      for (let i = 0; i < 2; i++) assert.deepEqual(r.parts[domains[i]], { rated: rated[i], total: groups[i].length, sum: rated[i] === groups[i].length ? groups[i].length * 3 : null, mean: rated[i] === groups[i].length ? 3 : null });
    }
    const partial = { ...baseline }; delete partial.ADEXI_14; expect(scoreQuestionnaire(quiz, partial).status).toBe("incomplete"); for (const a of [null, [], new Date(), { ...baseline, BAD: "1" }, { ...baseline, ADEXI_01: 1 }, { ...baseline, ADEXI_01: "6" }]) expect(scoreQuestionnaire(quiz, a).status).toBe("invalid");
    const faults = [(q: Questionnaire) => { q.source = null!; }, (q: Questionnaire) => { q.questions = null!; }, (q: Questionnaire) => { q.questions[0] = null!; }, (q: Questionnaire) => { q.questions[0].options = null!; }, (q: Questionnaire) => { q.questions[0].reverse = true; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }, (q: Questionnaire) => { q.directions[0].itemCount = 5; }, (q: Questionnaire) => { q.profiles[0].directionIds.pop(); }, (q: Questionnaire) => { q.source.scoringVersion = "equalmeans"; }]; for (const fault of faults) { const bad = structuredClone(quiz); fault(bad); expect(isAdexi14ConfigurationValid(bad)).toBe(false); expect(scoreQuestionnaire(bad, baseline).status).toBe("unavailable"); }
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { ADEXI_01: "4", ADEXI_02: "na" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ ADEXI_01: "4", ADEXI_02: "na" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull(); expect(readQuestionnaireDraft(quiz, draft, 99)).toBeNull();
  });
  it("renders all three FULL6 readings at minimum,maximum,mixed,oneNA andallNA with explicit sum/mean labels", () => {
    const patterns = [Object.fromEntries(Object.keys(baseline).map(k => [k, "1"])), Object.fromEntries(Object.keys(baseline).map(k => [k, "5"])), baseline, { ...baseline, ADEXI_01: "na" }, Object.fromEntries(Object.keys(baseline).map(k => [k, "na"]))];
    for (const locale of ["en", "zh"] as const) for (const answers of patterns) { const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireAdexi14Report quiz={quiz} result={result} locale={locale} />); expect(dom.querySelector("[data-adexi14-overall]")?.textContent).toContain(result.adexi14.overallSum === null ? (locale === "zh" ? "资料不足" : "Insufficient information") : (locale === "zh" ? `${result.adexi14.overallSum}（14到70；` : `${result.adexi14.overallSum} (14 to 70;`)); expect(dom.querySelectorAll("[data-adexi14-part]")).toHaveLength(2); for (const domain of domains) { const part = result.adexi14.parts[domain], text = dom.querySelector(`[data-adexi14-part="${domain}"] [data-adexi14-part-score]`)?.textContent; if (part.sum === null) expect(text).toContain(locale === "zh" ? "资料不足" : "Insufficient information"); else { expect(text).toContain(locale === "zh" ? `原始合计：${part.sum}（` : `Raw sum: ${part.sum} (`); expect(text).toContain(locale === "zh" ? `分项均分：${formatAdexi14Mean(part.sum, part.total)}` : `Part mean: ${formatAdexi14Mean(part.sum, part.total)}`); } }
      for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]); const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length); expect(dom.querySelectorAll("h4")).toHaveLength(20); expect(dom.querySelectorAll('a[href*="/results/"]')).toHaveLength(3);
    }
  });
  it("serves all eight native pages with actual independent metadata descriptions, full bodies, hubs and sitemap entries", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try { const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) { const path = `/${locale}/tests/explore/${quiz.slug}`, ep = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(ep)), meta = await entry.generateMetadata(ep); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.description).toBe(quiz.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const p of quiz.profiles) { const native = `${path}/results/${p.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, gm = await guide.generateMetadata(gp), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(gp)); expect(gm.title).toBe(p.seo!.title[locale]); expect(gm.description).toBe(p.seo!.description[locale]); expect(gm.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(gm.alternates?.languages?.en).toBe(`https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]); expect(dom.querySelector("[data-adexi14-overall]")).toBeNull(); }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
  it("rejects every sparse, undefined and null element across all validated array families", () => {
    expect(new Set(faults.map(f => JSON.stringify([f.path, f.index]))).size * 3).toBe(faults.length);
    for (const fault of faults) {
      const bad = arrayFault(fault);
      expect(isAdexi14ConfigurationValid(bad), JSON.stringify(fault)).toBe(false);
      expect(scoreQuestionnaire(bad, baseline)).toEqual({ status: "unavailable", answered: 0 });
    }
  });
  it("fails closed through actual entry, guide, metadata and PNG callers for every array fault and wrong reversal", async () => {
    let candidate = structuredClone(quiz);
    vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => candidate })); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), og = await import("@/app/og/fun/[slug]/route");
      const ep = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, gp = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "overall-sum-reading" }) };
      for (const fault of [null, ...faults]) {
        candidate = fault ? arrayFault(fault) : structuredClone(quiz); if (!fault) candidate.questions[0].reverse = true;
        expect((await entry.generateMetadata(ep)).robots).toEqual({ index: false, follow: false });
        expect((await guide.generateMetadata(gp)).robots).toEqual({ index: false, follow: false });
        await expect(entry.default(ep)).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
        await expect(guide.default(gp)).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
        expect((await og.GET(new Request("https://fermatmind.com/og/fun/executive-function?locale=en"), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
      }
    } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
  });
});
