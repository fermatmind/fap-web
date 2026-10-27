import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { isScs26ConfigurationValid, formatScs26Mean } from "@/lib/questionnaires/scs26";
import { readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireScs26Report } from "@/components/questionnaires/QuestionnaireScs26Report";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/self-compassion.json", "utf8")) as Questionnaire;
const sourceBytes = readFileSync("tests/fixtures/questionnaires/scs26-source-reference.json");
const source = JSON.parse(sourceBytes.toString()) as { questions: Questionnaire["questions"] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/scs26-profiles-reference.json");
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/scs26-scoring-reference.json", "utf8")) as { source_sha256: string; weighted_DP_distribution: Record<string, string> };
const domains = ["self-kindness", "self-judgment", "common-humanity", "isolation", "mindfulness", "over-identification"] as const;
const groups = [[5, 12, 19, 23, 26], [1, 8, 11, 16, 21], [3, 7, 10, 15], [4, 13, 18, 25], [9, 14, 17, 22], [2, 6, 20, 24]];
const negative = new Set([1, 2, 4, 6, 8, 11, 13, 16, 18, 20, 21, 24, 25]);
const id = (n: number) => `SCS_${String(n).padStart(2, "0")}`;
const baseline: QuestionnaireAnswers = Object.fromEntries(Array.from({ length: 26 }, (_, i) => [id(i + 1), "3"]));
const keyedAnswers = (values: number[]): QuestionnaireAnswers => Object.fromEntries(values.map((v, i) => [id(i + 1), String(negative.has(i + 1) ? 6 - v : v)]));
function complete(answers: QuestionnaireAnswers) {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("scs26" in result)) throw Error("SCS26 result rejected");
  return result;
}
describe("T192 full SCS26: six equally weighted unrounded means", () => {
  it("binds all source items, endpoint-only anchors, six key groups and seven full bilingual guides", () => {
    expect(isScs26ConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toEqual(source.questions);
    expect(createHash("sha256").update(sourceBytes).digest("hex")).toBe(quiz.source.itemBankSha256); expect(reference.source_sha256).toBe(quiz.source.itemBankSha256);
    expect(createHash("sha256").update(profileBytes).digest("hex")).toBe(quiz.source.resultContentSha256); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.questions.filter(q => q.reverse)).toHaveLength(13); expect(quiz.profiles).toHaveLength(7); expect(quiz.profiles.map(p => p.sections.length)).toEqual([7, 6, 6, 6, 6, 6, 6]);
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.introduction.en).toContain("permission"); expect(quiz.introduction.zh).toContain("工作译本");
    for (const q of quiz.questions) { expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]); for (const o of q.options) for (const locale of ["en", "zh"] as const) expect(o.label[locale].trim()).not.toBe(""); expect(q.options.slice(1, 4).map(o => o.label.en)).toEqual(["2", "3", "4"]); }
    expect(quiz.references?.map(r => r.url)).toContain("https://self-compassion.org/wp-content/uploads/2021/03/SCS-information.pdf");
    expect(readFileSync("public/fonts/noto-sans-sc/self-compassion-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("checks 8750 per-part vectors and witnesses all 469 reachable exact overall numerators", () => {
    let witnesses = 0;
    for (let gi = 0; gi < groups.length; gi++) {
      const nums = groups[gi], n = nums.length;
      for (let code = 0; code < 5 ** n; code++) {
        let cursor = code, raw = 0, keyed = 0; const answers = { ...baseline };
        for (const number of nums) { const v = cursor % 5 + 1; cursor = Math.floor(cursor / 5); answers[id(number)] = String(v); raw += v; keyed += negative.has(number) ? 6 - v : v; }
        const r = complete(answers).scs26;
        assert.deepEqual(r.parts[domains[gi]], { rawSum: raw, keyedSum: keyed, rated: n, total: n, rawMean: raw / n, keyedMean: keyed / n });
        assert.equal(r.overallNumerator, 300 + (20 / n) * keyed); witnesses++;
      }
    }
    expect(witnesses).toBe(8750);
    let dp = new Map<number, { count: bigint; witness: number[] }>([[0, { count: BigInt(1), witness: [] }]]);
    for (let i = 1; i <= 26; i++) {
      const factor = 20 / groups.find(g => g.includes(i))!.length, next = new Map<number, { count: bigint; witness: number[] }>();
      for (const [sum, item] of dp) for (let v = 1; v <= 5; v++) { const key = sum + factor * v, known = next.get(key); next.set(key, { count: (known?.count ?? BigInt(0)) + item.count, witness: known?.witness ?? [...item.witness, v] }); }
      dp = next;
    }
    expect(dp.size).toBe(469); expect([...dp.values()].reduce((sum, x) => sum + x.count, BigInt(0))).toBe(BigInt(5) ** BigInt(26));
    for (const [n, item] of dp) { expect(item.count.toString()).toBe(reference.weighted_DP_distribution[n]); const r = complete(keyedAnswers(item.witness)).scs26; expect(r.overallNumerator).toBe(n); expect(r.overallMean).toBe(n / 120); }
    const values = Array<number>(26).fill(1); for (const number of groups[0]) values[number - 1] = 5;
    expect(formatScs26Mean(complete(keyedAnswers(values)).scs26.overallNumerator!, 120)).toBe("1.67");
    values.fill(1); values[2] = 2; expect(formatScs26Mean(complete(keyedAnswers(values)).scs26.overallNumerator!, 120)).toBe("1.04"); expect(formatScs26Mean(321, 120)).toBe("2.68");
    console.info("SCS26:8750per-partactualvectors/469overallwitnesses;integerDP5^26represented,notfulljointexecution.");
  });
  it("checks 128 per-part NA masks, all-NA, malformed sources, invalid answers and opt-in draft expiry", () => {
    let masks = 0;
    for (let gi = 0; gi < groups.length; gi++) for (let mask = 0; mask < 2 ** groups[gi].length; mask++) {
      const answers = { ...baseline }; let skipped = 0;
      groups[gi].forEach((number, j) => { if (mask & (1 << j)) { answers[id(number)] = "na"; skipped++; } });
      const r = complete(answers).scs26; expect(r.skipped).toBe(skipped); expect(r.overallMean).toBe(skipped ? null : 3);
      for (let j = 0; j < domains.length; j++) expect(r.parts[domains[j]].rawMean).toBe(j === gi && skipped ? null : 3); masks++;
    }
    expect(masks).toBe(128); const all = complete(Object.fromEntries(Object.keys(baseline).map(k => [k, "na"]))).scs26; expect(all.overallMean).toBeNull(); expect(Object.values(all.parts).every(p => p.rawMean === null && p.keyedMean === null)).toBe(true);
    const partial = { ...baseline }; delete partial.SCS_26; expect(scoreQuestionnaire(quiz, partial).status).toBe("incomplete");
    for (const a of [null, [], new Date(), { ...baseline, BAD: "1" }, { ...baseline, SCS_01: 1 }, { ...baseline, SCS_01: "6" }, { ...baseline, SCS_01: null }]) expect(scoreQuestionnaire(quiz, a).status).toBe("invalid");
    const mutations = [(q: Questionnaire) => { q.source = null!; }, (q: Questionnaire) => { q.questions = null!; }, (q: Questionnaire) => { q.questions[0] = null!; }, (q: Questionnaire) => { q.questions[0].options = null!; }, (q: Questionnaire) => { q.questions[0].reverse = false; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }, (q: Questionnaire) => { q.directions[0].itemCount = 4; }, (q: Questionnaire) => { q.profiles[0].directionIds.pop(); }, (q: Questionnaire) => { q.source.scoringVersion = "mean26"; }];
    for (const mutate of mutations) { const bad = structuredClone(quiz); mutate(bad); expect(isScs26ConfigurationValid(bad)).toBe(false); expect(scoreQuestionnaire(bad, baseline).status).toBe("unavailable"); }
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { SCS_01: "4", SCS_02: "na" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ SCS_01: "4", SCS_02: "na" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull(); expect(readQuestionnaireDraft(quiz, draft, 99)).toBeNull();
  });
  it("renders all seven complete readings at minimum, maximum, mixed, partial-NA and all-NA with distinct raw directions", () => {
    for (const locale of ["en", "zh"] as const) for (const answers of [keyedAnswers(Array(26).fill(1)), keyedAnswers(Array(26).fill(5)), baseline, { ...baseline, SCS_01: "na" }, Object.fromEntries(Object.keys(baseline).map(k => [k, "na"]))]) {
      const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireScs26Report quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelector("[data-scs26-overall]")?.textContent).toContain(result.scs26.overallNumerator === null ? (locale === "zh" ? "资料不足" : "Insufficient information") : formatScs26Mean(result.scs26.overallNumerator, 120));
      expect(dom.querySelectorAll("[data-scs26-part]")).toHaveLength(6); for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
      expect(dom.querySelector('[data-scs26-part="self-judgment"]')?.textContent).toContain(locale === "zh" ? "自我批评" : "Self-judgment"); const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.querySelectorAll('a[href*="/results/"]')).toHaveLength(7); expect(dom.querySelectorAll("h4")).toHaveLength(49);
    }
  });
  it("serves all sixteen bilingual pages, independent SEO, full bodies, hubs and sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
        expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const p of quiz.profiles) {
          const native = `${path}/results/${p.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, ghtml = renderToStaticMarkup(await guide.default(gp)), gm = await guide.generateMetadata(gp), dom = document.createElement("div"); dom.innerHTML = ghtml;
          expect(gm.title).toBe(p.seo!.title[locale]); expect(gm.description).toBe(p.seo!.description[locale]); expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); expect(gm.alternates?.canonical).toBe(`https://fermatmind.com${native}`);
          expect(gm.alternates?.languages?.en).toBe(`https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true);
          for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]); expect(dom.querySelector("[data-scs26-overall]")).toBeNull();
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
  it("fails closed through actual entry, guide, metadata and image callers for a wrong reverse key", async () => {
    const bad = structuredClone(quiz); bad.questions[0].reverse = false; vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => bad })); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), image = await import("@/app/og/fun/[slug]/route");
      const ep = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, gp = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "overall-mean" }) };
      expect((await entry.generateMetadata(ep)).robots).toEqual({ index: false, follow: false }); expect((await guide.generateMetadata(gp)).robots).toEqual({ index: false, follow: false }); await expect(entry.default(ep)).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" }); await expect(guide.default(gp)).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" }); expect((await image.GET(new Request("https://fermatmind.com/og/fun/self-compassion?locale=en"), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
    } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
  });
});
