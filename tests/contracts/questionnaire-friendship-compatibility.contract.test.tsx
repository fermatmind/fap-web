import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionnaireFriendshipFitReport } from "@/components/questionnaires/QuestionnaireFriendshipFitReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreLikertQuestionnaire, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
afterEach(() => vi.unstubAllEnvs());
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/friendship-compatibility.json", "utf8")) as Questionnaire;
type Expected = { sum: number; rated: number; total: number; mean: number | null };
type SummaryTuple = [number, number, number, number | null];
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/friendship-compatibility-reference.json", "utf8")) as {
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
const groups: Record<string, string[]> = {"agreements-and-priorities": ["FRIENDFIT_01", "FRIENDFIT_02", "FRIENDFIT_03", "FRIENDFIT_04"], "room-to-speak": ["FRIENDFIT_05", "FRIENDFIT_06", "FRIENDFIT_07", "FRIENDFIT_08"], "shared-effort": ["FRIENDFIT_09", "FRIENDFIT_10", "FRIENDFIT_11", "FRIENDFIT_12"], "space-and-privacy": ["FRIENDFIT_13", "FRIENDFIT_14", "FRIENDFIT_15", "FRIENDFIT_16"], "different-strengths": ["FRIENDFIT_17", "FRIENDFIT_18", "FRIENDFIT_19", "FRIENDFIT_20"]};
const reverse: string[] = [];
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
describe("T090 original one-friendship interaction reflection", () => {
  it("binds20originalbilingualitems/5topics/no reversekeys/5FULL8 to the frozen bank", () => {
    expect(quiz.code).toBe("FM_FRIENDSHIP_FIT_ORIGINAL20");
    expect(quiz.source.formCode).toBe("fm_original_friendship_fit_20_v1");
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.minimumRatedItems).toBe(4);
    expect(quiz.questions).toHaveLength(20); expect(quiz.profiles).toHaveLength(5);
    expect(reference.question_order).toEqual(quiz.questions.map(q => q.id));
    expect(reference.groups).toEqual(groups); expect(reference.reverse_question_ids).toEqual(reverse);
    expect(quiz.source.itemBankSha256).toBe(reference.native_bank_canonical_sha256);
    expect(quiz.source.itemBankSha256).toBe(hash({ directions:quiz.directions, minimumRatedItems:quiz.minimumRatedItems, questions:quiz.questions }));
    expect(quiz.source.resultContentSha256).toBe(hash(quiz.profiles));
    for (const question of quiz.questions) {
      const group = Object.keys(groups).find(key => groups[key].includes(question.id));
      expect(question.reverse).toBe(reverse.includes(question.id));
      expect(question.options.map(option => option.directionId)).toEqual(Array(6).fill(group));
      expect(question.options.map(option => [option.id, option.score])).toEqual([["1",1],["2",2],["3",3],["4",4],["5",5],["na",null]]);
      expect(question.prompt.zh).toMatch(/[\u3400-\u9fff]/u); expect(question.prompt.en).not.toMatch(/[\u3400-\u9fff]/u);
    }
    for (const profile of quiz.profiles) {
      expect(profile.sections).toHaveLength(8);
    }
  });
  it("replays225oracle states/120singlevariants/32NAmasks/512jointvectors and5writtenexamples against an independent Fraction oracle", () => {
    expect(reference.reachable_group_states).toHaveLength(225);
    for (const row of reference.reachable_group_states) {
      const answers = neutral(); groups[row.group].forEach((id, index) => { answers[id] = row.responses[index] === "n" ? "na" : row.responses[index]; });
      assert.deepStrictEqual(complete(answers).facets[row.group], fromTuple(row.expected));
    }
    expect(reference.single_item_variants).toHaveLength(120);
    for (const row of reference.single_item_variants) { const answers = neutral(); answers[row.question] = row.response; compare(answers, fromTuples(row.expected)); }
    expect(reference.joint_na_masks).toHaveLength(32);
    for (const row of reference.joint_na_masks) {
      const answers = neutral();
      Object.values(groups).forEach((ids,i) => { if (row.mask & (1 << i)) answers[ids[0]] = "na"; });
      compare(answers, fromTuples(row.expected));
    }
    expect(reference.seeded_attempts).toHaveLength(512);
    for (const row of reference.seeded_attempts) { const answers = Object.fromEntries(reference.question_order.map((id,index) => [id,row.responses[index] === "n" ? "na" : row.responses[index]])); compare(answers, fromTuples(row.expected)); }
    const worked = compare(reference.joint_worked_answers, Object.fromEntries(Object.entries(reference.joint_worked_expected).map(([k,v]) => [k,fromTuple(v)])));
    expect(Object.values(worked.facets).map(value => value.sum)).toEqual([13,14,11,17,12]);
    expect(Object.values(worked.facets).map(value => value.mean)).toEqual([3.3,3.5,2.8,4.3,3]);
  });
  it("keepsinvalid/incomplete/unavailable/NA separate and expires opt-in drafts", () => {
    expect(scoreLikertQuestionnaire(quiz, { FRIENDFIT_01: "1" })).toEqual({ status: "incomplete", answered: 1 });
    for (const answers of [null, [], new Date(), { unknown: "1" }, { FRIENDFIT_01: "0" }, { FRIENDFIT_01: 3 }, Object.create({ FRIENDFIT_01: "1" })]) expect(scoreLikertQuestionnaire(quiz, answers).status).toBe("invalid");
    expect(scoreLikertQuestionnaire({ ...quiz, minimumRatedItems: 5 }, {}).status).toBe("unavailable");
    const answers = neutral(); answers.FRIENDFIT_01 = "na"; const result = complete(answers);
    expect(result.facets["agreements-and-priorities"]).toEqual({ sum: 9, rated: 3, total: 4, mean: null });
    for (const id of Object.keys(groups).slice(1)) expect(result.facets[id]).toEqual({ sum:12, rated:4, total:4, mean:3 });
    const draft = { version:quiz.version, savedAt:100_000, answers:{ FRIENDFIT_01:"4" } };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft),100_001)).toEqual(draft.answers);
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft),100_000+86400000)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ ...draft, version:"other" }),100_001)).toBeNull();
  });
  it("renders5overviewvalues withall5FULL8 in bothlanguages includingallNA without duplicateIDs or inherited model prose", () => {
    for (const answers of [neutral(),Object.fromEntries(Object.values(groups).flat().map(id => [id,"na"]))]) for (const locale of ["en","zh"] as const) {
      const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireFriendshipFitReport quiz={quiz} result={result} locale={locale}/>);
      expect(dom.querySelectorAll("[data-friendfit-summary]")).toHaveLength(5); expect(dom.querySelectorAll("[data-friendfit-guide]")).toHaveLength(5);
      for (const profile of quiz.profiles) {
        const guide = dom.querySelector(`[data-friendfit-guide='${profile.id}']`)!;
        for (const section of profile.sections) for (const text of section.paragraphs) expect(guide.querySelector(`#friendfit-report-${profile.id}-${section.id}`)?.textContent).toContain(text[locale]);
        const score = result.facets[profile.id], card = dom.querySelector(`[data-friendfit-summary='${profile.id}']`)!;
        expect(card.querySelector("[data-friendfit-mean]")?.textContent).toBe(score.mean === null ? (locale === "zh" ? "资料不足" : "Insufficient information") : "3.0 / 5");
      }
      const ids = [...dom.querySelectorAll("[id]")].map(node => node.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("serves12nativefullpages withspecificENZHSEO/method/hub/sitemapidentities andclosedresultIDs", async () => {
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
    for (const profile of ["fixed-type","compatibility-percent","FRIENDFIT_01","unknown"]) await expect(guide.default({params:Promise.resolve({locale:"en",slug:quiz.slug,profile})})).rejects.toThrow();
  });
});
