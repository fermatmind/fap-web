import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionnaireWholesomePartnerReport } from "@/components/questionnaires/QuestionnaireWholesomePartnerReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreLikertQuestionnaire, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
afterEach(() => vi.unstubAllEnvs());
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/wholesome-partner.json", "utf8")) as Questionnaire;
type Expected = { sum: number; rated: number; total: number; mean: number | null };
type SummaryTuple = [number, number, number, number | null];
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/wholesome-partner-reference.json", "utf8")) as {
  native_bank_canonical_sha256: string;
  groups: Record<string, string[]>;
  reverse_question_ids: string[];
  question_order: string[];
  reachable_group_states: { group: string; responses: string; expected: SummaryTuple }[];
  single_item_variants: { question: string; response: string; expected: SummaryTuple[] }[];
  joint_na_masks: { mask: number; expected: SummaryTuple[] }[];
  seeded_attempts: { responses: string; expected: SummaryTuple[] }[];
  joint_worked_answers: QuestionnaireAnswers;
  joint_worked_expected: Record<string, SummaryTuple>;
};
const groups: Record<string, string[]> = {"realistic-follow-through": ["WHOLESOME_01", "WHOLESOME_02", "WHOLESOME_03", "WHOLESOME_04"], "respecting-autonomy": ["WHOLESOME_05", "WHOLESOME_06", "WHOLESOME_07", "WHOLESOME_08"], "responsive-checking-in": ["WHOLESOME_09", "WHOLESOME_10", "WHOLESOME_11", "WHOLESOME_12"], "requesting-support": ["WHOLESOME_13", "WHOLESOME_14", "WHOLESOME_15", "WHOLESOME_16"], "honest-preferences": ["WHOLESOME_17", "WHOLESOME_18", "WHOLESOME_19", "WHOLESOME_20"], "understanding-perspectives": ["WHOLESOME_21", "WHOLESOME_22", "WHOLESOME_23", "WHOLESOME_24"], "negotiating-expectations": ["WHOLESOME_25", "WHOLESOME_26", "WHOLESOME_27", "WHOLESOME_28"], "clear-repair-talk": ["WHOLESOME_29", "WHOLESOME_30", "WHOLESOME_31", "WHOLESOME_32"]};
const reverse = ["WHOLESOME_03", "WHOLESOME_04", "WHOLESOME_07", "WHOLESOME_08", "WHOLESOME_11", "WHOLESOME_12", "WHOLESOME_15", "WHOLESOME_16", "WHOLESOME_19", "WHOLESOME_20", "WHOLESOME_23", "WHOLESOME_24", "WHOLESOME_27", "WHOLESOME_28", "WHOLESOME_31", "WHOLESOME_32"];
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, child]) => [key, canonical(child)]));
  return value;
}
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
const neutral = () => Object.fromEntries(Object.values(groups).flat().map(id => [id, "3"]));
function complete(answers: QuestionnaireAnswers) {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("facets" in result)) throw new Error("Expected complete descriptive facets");
  return result;
}
function fromTuple(value: SummaryTuple): Expected { return { sum:value[0],rated:value[1],total:value[2],mean:value[3] }; }
function fromTuples(rows: SummaryTuple[]): Record<string, Expected> { return Object.fromEntries(Object.keys(groups).map((group,index) => [group,fromTuple(rows[index])])); }
function baseFields(value: Expected) { return { sum: value.sum, rated: value.rated, total: value.total, mean: value.mean }; }
function compare(answers: QuestionnaireAnswers, expected: Record<string, Expected>) {
  const result = complete(answers);
  for (const [group, value] of Object.entries(expected)) assert.deepStrictEqual(result.facets[group], baseFields(value));
  expect(result).not.toHaveProperty("profileId"); expect(result).not.toHaveProperty("leaders");
  return result;
}
describe("T088 original partner-behavior reflection", () => {
  it("binds32originalbilingualitems/8topics/16reversekeys/8FULL6 to the frozen bank", () => {
    expect(quiz.code).toBe("FM_WHOLESOME_PARTNER_PRACTICES_ORIGINAL32");
    expect(quiz.source.formCode).toBe("fm_original_wholesome_partner_32_v1");
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.minimumRatedItems).toBe(4);
    expect(quiz.questions).toHaveLength(32); expect(quiz.profiles).toHaveLength(8);
    expect(reference.question_order).toEqual(quiz.questions.map(q => q.id));
    expect(reference.groups).toEqual(groups); expect(reference.reverse_question_ids).toEqual(reverse);
    expect(quiz.source.itemBankSha256).toBe(reference.native_bank_canonical_sha256);
    expect(quiz.source.itemBankSha256).toBe(hash(quiz.questions));
    expect(quiz.source.resultContentSha256).toBe(hash(quiz.profiles));
    for (const question of quiz.questions) {
      const group = Object.keys(groups).find(key => groups[key].includes(question.id));
      expect(question.reverse).toBe(reverse.includes(question.id));
      expect(question.options.map(option => option.directionId)).toEqual(Array(6).fill(group));
      expect(question.options.map(option => [option.id, option.score])).toEqual([["1",1],["2",2],["3",3],["4",4],["5",5],["na",null]]);
      expect(question.prompt.zh).toMatch(/[\u3400-\u9fff]/u); expect(question.prompt.en).not.toMatch(/[\u3400-\u9fff]/u);
    }
    for (const profile of quiz.profiles) {
      expect(profile.sections).toHaveLength(6);
      expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160);
    }
  });
  it("replays360oracle states/192singlevariants/256NAmasks/512jointvectors and8writtenexamples against an independent Fraction oracle", () => {
    expect(reference.reachable_group_states).toHaveLength(360);
    for (const row of reference.reachable_group_states) {
      const answers = neutral(); groups[row.group].forEach((id, index) => { answers[id] = row.responses[index] === "n" ? "na" : row.responses[index]; });
      assert.deepStrictEqual(complete(answers).facets[row.group], fromTuple(row.expected));
    }
    expect(reference.single_item_variants).toHaveLength(192);
    for (const row of reference.single_item_variants) { const answers = neutral(); answers[row.question] = row.response; compare(answers, fromTuples(row.expected)); }
    expect(reference.joint_na_masks).toHaveLength(256);
    for (const row of reference.joint_na_masks) {
      const answers = neutral();
      Object.values(groups).forEach((ids,i) => { if (row.mask & (1 << i)) answers[ids[0]] = "na"; });
      compare(answers, fromTuples(row.expected));
    }
    expect(reference.seeded_attempts).toHaveLength(512);
    for (const row of reference.seeded_attempts) { const answers = Object.fromEntries(reference.question_order.map((id,index) => [id,row.responses[index] === "n" ? "na" : row.responses[index]])); compare(answers, fromTuples(row.expected)); }
    const worked = compare(reference.joint_worked_answers, Object.fromEntries(Object.entries(reference.joint_worked_expected).map(([k,v]) => [k,fromTuple(v)])));
    expect(Object.values(worked.facets).map(value => value.sum)).toEqual([18,14,13,8,12,16,15,10]);
    expect(Object.values(worked.facets).map(value => value.mean)).toEqual([4.5,3.5,3.3,2,3,4,3.8,2.5]);
  });
  it("keepsinvalid/incomplete/unavailable/NA separate and expires opt-in drafts", () => {
    expect(scoreLikertQuestionnaire(quiz, { WHOLESOME_01: "1" })).toEqual({ status: "incomplete", answered: 1 });
    for (const answers of [null, [], new Date(), { unknown: "1" }, { WHOLESOME_01: "0" }, { WHOLESOME_01: 3 }, Object.create({ WHOLESOME_01: "1" })]) expect(scoreLikertQuestionnaire(quiz, answers).status).toBe("invalid");
    expect(scoreLikertQuestionnaire({ ...quiz, minimumRatedItems: 5 }, {}).status).toBe("unavailable");
    const answers = neutral(); answers.WHOLESOME_01 = "na"; const result = complete(answers);
    expect(result.facets["realistic-follow-through"]).toEqual({ sum: 9, rated: 3, total: 4, mean: null });
    for (const id of Object.keys(groups).slice(1)) expect(result.facets[id]).toEqual({ sum:12, rated:4, total:4, mean:3 });
    const draft = { version:quiz.version, savedAt:100_000, answers:{ WHOLESOME_01:"4" } };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft),100_001)).toEqual(draft.answers);
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft),100_000+86400000)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ ...draft, version:"other" }),100_001)).toBeNull();
  });
  it("renders8overviewvalues withall8FULL6 in bothlanguages includingallNA without duplicateIDs or inherited model prose", () => {
    for (const answers of [neutral(),Object.fromEntries(Object.values(groups).flat().map(id => [id,"na"]))]) for (const locale of ["en","zh"] as const) {
      const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireWholesomePartnerReport quiz={quiz} result={result} locale={locale}/>);
      expect(dom.querySelectorAll("[data-wholesome-summary]")).toHaveLength(8); expect(dom.querySelectorAll("[data-wholesome-guide]")).toHaveLength(8);
      for (const profile of quiz.profiles) {
        const guide = dom.querySelector(`[data-wholesome-guide='${profile.id}']`)!;
        for (const section of profile.sections) for (const text of section.paragraphs) expect(guide.querySelector(`#wholesome-report-${profile.id}-${section.id}`)?.textContent).toContain(text[locale]);
        const score = result.facets[profile.id], card = dom.querySelector(`[data-wholesome-summary='${profile.id}']`)!;
        expect(card.querySelector("[data-wholesome-mean]")?.textContent).toBe(score.mean === null ? (locale === "zh" ? "资料不足" : "Insufficient information") : "3.0 / 5");
      }
      const ids = [...dom.querySelectorAll("[id]")].map(node => node.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("serves18nativefullpages withspecificENZHSEO/method/hub/sitemapidentities andclosedresultIDs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://fermatmind.com");
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    expect((await loadQuestionnaire(quiz.slug))?.code).toBe(quiz.code); const maps = appendFunSitemapEntries([]);
    for (const locale of ["en","zh"] as const) {
      const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params:Promise.resolve({ locale, slug:quiz.slug }) }, dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default(props)); expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
      for (const id of ["facet-scoring","facet-reading","facet-comparison"]) expect(dom.querySelector("section[aria-labelledby='questionnaire-method']")?.textContent).toContain(quiz.guide.find(section => section.id === id)!.paragraphs[0][locale]);
      const metadata = await entry.generateMetadata(props); expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe("https://fermatmind.com"+path);
      const hub = document.createElement("div"); hub.innerHTML = renderToStaticMarkup(<MoreTests locale={locale}/>); expect(hub.querySelectorAll(`a[href='${path}']`)).toHaveLength(1); expect(maps.filter(row => row.loc === "https://fermatmind.com"+path)).toHaveLength(1);
      for (const profile of quiz.profiles) {
        const native = `/${locale}/tests/explore/${quiz.slug}/results/${profile.id}`, props = { params:Promise.resolve({ locale,slug:quiz.slug,profile:profile.id }) }, dom = document.createElement("div");
        dom.innerHTML = renderToStaticMarkup(await guide.default(props)); expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
        for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.querySelector(`#report-${section.id}`)?.textContent).toContain(text[locale]);
        const metadata = await guide.generateMetadata(props); expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe("https://fermatmind.com"+native); expect(maps.filter(row => row.loc === "https://fermatmind.com"+native)).toHaveLength(1);
      }
    }
    for (const profile of ["fixed-type","total-trust","WHOLESOME_01","unknown"]) await expect(guide.default({params:Promise.resolve({locale:"en",slug:quiz.slug,profile})})).rejects.toThrow();
  });
});
