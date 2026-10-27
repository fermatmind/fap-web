import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionnaireTrustReport } from "@/components/questionnaires/QuestionnaireTrustReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreLikertQuestionnaire, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
afterEach(() => vi.unstubAllEnvs());
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/trust-issues-test.json", "utf8")) as Questionnaire;
type Expected = { sum: number; rated: number; total: number; mean: number | null };
type SummaryTuple = [number, number, number, number | null];
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/trust-issues-reference.json", "utf8")) as {
  native_bank_canonical_sha256: string;
  groups: Record<string, string[]>;
  reverse_question_ids: string[];
  question_order: string[];
  reachable_group_states: { group: string; responses: string; expected: SummaryTuple }[];
  single_item_variants: { question: string; response: string; expected: SummaryTuple[] }[];
  seeded_attempts: { responses: string; expected: SummaryTuple[] }[];
  joint_worked_answers: QuestionnaireAnswers;
  joint_worked_expected: Record<string, Expected>;
};
const groups: Record<string, string[]> = {
  "initial-opening": ["TRUST_01", "TRUST_05", "TRUST_09", "TRUST_13", "TRUST_17", "TRUST_21"],
  "gradual-building": ["TRUST_02", "TRUST_06", "TRUST_10", "TRUST_14", "TRUST_18", "TRUST_22"],
  "agreement-clarity": ["TRUST_03", "TRUST_07", "TRUST_11", "TRUST_15", "TRUST_19", "TRUST_23"],
  "protective-distance": ["TRUST_04", "TRUST_08", "TRUST_12", "TRUST_16", "TRUST_20", "TRUST_24"],
};
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
describe("T087 original everyday trust reflection", () => {
  it("binds24originalbilingualfrequencyitems/4editorialgroups/zeroReverseKeys/4FULL8 to the frozen bank", () => {
    expect(quiz.code).toBe("FM_EVERYDAY_TRUST_ORIGINAL");
    expect(quiz.source.formCode).toBe("fm_original_everyday_trust_24_v1");
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.minimumRatedItems).toBe(6);
    expect(quiz.questions).toHaveLength(24); expect(quiz.profiles).toHaveLength(4);
    expect(reference.question_order).toEqual(Object.values(groups).flat());
    expect(reference.groups).toEqual(groups); expect(reference.reverse_question_ids).toEqual([]);
    expect(quiz.source.itemBankSha256).toBe(reference.native_bank_canonical_sha256);
    expect(quiz.source.itemBankSha256).toBe(hash(quiz.questions));
    expect(quiz.source.resultContentSha256).toBe(hash(quiz.profiles));
    for (const question of quiz.questions) {
      const group = Object.keys(groups).find(key => groups[key].includes(question.id));
      expect(question.reverse).toBe(false);
      expect(question.options.map(option => option.directionId)).toEqual(Array(6).fill(group));
      expect(question.options.map(option => [option.id, option.score])).toEqual([["1",1],["2",2],["3",3],["4",4],["5",5],["na",null]]);
      expect(question.prompt.zh).toMatch(/[\u3400-\u9fff]/u); expect(question.prompt.en).not.toMatch(/[\u3400-\u9fff]/u);
    }
    for (const profile of quiz.profiles) {
      expect(profile.sections).toHaveLength(8);
      expect(profile.sections.flatMap(section => section.paragraphs).map(text => text.en).join(" ").match(/\b[\w’'-]+\b/g)!.length).toBeGreaterThanOrEqual(800);
      expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160);
    }
  });
  it("recomputes364groupstates/144singlevariants/512seededattempts and4writtenexamples against an independent Fraction oracle", () => {
    expect(reference.reachable_group_states).toHaveLength(364);
    for (const row of reference.reachable_group_states) {
      const answers = neutral(); groups[row.group].forEach((id, index) => { answers[id] = row.responses[index] === "n" ? "na" : row.responses[index]; });
      assert.deepStrictEqual(complete(answers).facets[row.group], fromTuple(row.expected));
    }
    expect(reference.single_item_variants).toHaveLength(144);
    for (const row of reference.single_item_variants) { const answers = neutral(); answers[row.question] = row.response; compare(answers, fromTuples(row.expected)); }
    expect(reference.seeded_attempts).toHaveLength(512);
    for (const row of reference.seeded_attempts) { const answers = Object.fromEntries(reference.question_order.map((id,index) => [id,row.responses[index] === "n" ? "na" : row.responses[index]])); compare(answers, fromTuples(row.expected)); }
    const worked = compare(reference.joint_worked_answers, reference.joint_worked_expected);
    expect(Object.values(worked.facets).map(value => value.sum)).toEqual([21,20,23,16]);
    expect(Object.values(worked.facets).map(value => value.mean)).toEqual([3.5,3.3,3.8,2.7]);
  });
  it("keepsinvalid/incomplete/unavailable/NA separate and expires opt-in drafts", () => {
    expect(scoreLikertQuestionnaire(quiz, { TRUST_01: "1" })).toEqual({ status: "incomplete", answered: 1 });
    for (const answers of [null, [], new Date(), { unknown: "1" }, { TRUST_01: "0" }, { TRUST_01: 3 }, Object.create({ TRUST_01: "1" })]) expect(scoreLikertQuestionnaire(quiz, answers).status).toBe("invalid");
    expect(scoreLikertQuestionnaire({ ...quiz, minimumRatedItems: 7 }, {}).status).toBe("unavailable");
    const answers = neutral(); answers.TRUST_01 = "na"; const result = complete(answers);
    expect(result.facets["initial-opening"]).toEqual({ sum: 15, rated: 5, total: 6, mean: null });
    for (const id of Object.keys(groups).slice(1)) expect(result.facets[id]).toEqual({ sum:18, rated:6, total:6, mean:3 });
    const draft = { version:quiz.version, savedAt:100_000, answers:{ TRUST_01:"4" } };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft),100_001)).toEqual(draft.answers);
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft),100_000+86400000)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ ...draft, version:"other" }),100_001)).toBeNull();
  });
  it("renders4overviewvalues beforeall4FULL8 in bothlanguages includingallNA without duplicateIDs or inherited model prose", () => {
    for (const answers of [neutral(),Object.fromEntries(Object.values(groups).flat().map(id => [id,"na"]))]) for (const locale of ["en","zh"] as const) {
      const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireTrustReport quiz={quiz} result={result} locale={locale}/>);
      expect(dom.querySelectorAll("[data-trust-summary]")).toHaveLength(4); expect(dom.querySelectorAll("[data-trust-guide]")).toHaveLength(4);
      for (const profile of quiz.profiles) {
        const guide = dom.querySelector(`[data-trust-guide='${profile.id}']`)!;
        for (const section of profile.sections) for (const text of section.paragraphs) expect(guide.querySelector(`#trust-report-${profile.id}-${section.id}`)?.textContent).toContain(text[locale]);
        const score = result.facets[profile.id], card = dom.querySelector(`[data-trust-summary='${profile.id}']`)!;
        expect(card.querySelector("[data-trust-mean]")?.textContent).toBe(score.mean === null ? (locale === "zh" ? "资料不足" : "Insufficient information") : "3.0 / 5");
      }
      const ids = [...dom.querySelectorAll("[id]")].map(node => node.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.textContent).not.toMatch(/outside options|breakup probability|关系外选择|分手概率|battery remaining|剩余电量/);
    }
  });
  it("serves10nativefullpages withspecificENZHSEO/method/hub/sitemapidentities andclosedresultIDs", async () => {
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
    for (const profile of ["fixed-type","total-trust","TRUST_01","unknown"]) await expect(guide.default({params:Promise.resolve({locale:"en",slug:quiz.slug,profile})})).rejects.toThrow();
  });
});
