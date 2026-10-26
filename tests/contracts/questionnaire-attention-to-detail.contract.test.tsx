import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { isPracticeConfigurationValid } from "@/lib/questionnaires/practice";
import { QuestionnairePracticeReport } from "@/components/questionnaires/QuestionnairePracticeReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/attention-to-detail.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/attention-to-detail-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; proofs: { id: string; proof: Record<string, unknown> }[] };
const truth = new Map<string, string>();
for (const question of source.questions) {
  const proof = source.proofs.find(p => p.id === question.id)!.proof;
  const labels = question.options.map(o => o.label.en), kind = proof.kind;
  let matches: boolean[];
  if (kind === "exact") matches = labels.map(s => s === proof.source);
  else if (kind === "field_change") {
    const a = proof.source as string[], b = proof.copy as string[]; const changed = a.map((v, i) => v !== b[i]);
    const label = changed.every(Boolean) ? "Both fields" : !changed.some(Boolean) ? "Neither field" : changed[0] ? "Room only" : "Shelf only";
    matches = labels.map(s => s === label);
  } else if (kind === "changed_fields") matches = (proof.variants as string[][]).map(row => row.filter((v, i) => v !== (proof.source as string[])[i]).length === proof.target);
  else if (["and", "and_not", "not_or"].includes(String(kind))) matches = (proof.conditions as boolean[][]).map(([a, b]) => kind === "and" ? a && b : kind === "and_not" ? a && !b : !(a || b));
  else if (kind === "sort") { const result = [...proof.values as string[]].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)) || a[0].localeCompare(b[0])).join(", "); matches = labels.map(s => s === result); }
  else if (kind === "suffix") matches = labels.map(s => s.endsWith(String(proof.source)));
  else if (kind === "sum" || kind === "net") matches = labels.map(s => Number(s) === (proof.values as number[]).reduce((a, b) => a + b, 0));
  else if (kind === "packs") { const [packs, each, loose] = proof.values as number[]; matches = labels.map(s => Number(s) === packs * each + loose); }
  else if (kind === "products") matches = labels.map(s => Number(s) === (proof.values as number[][]).reduce((n, [a, b]) => n + a * b, 0));
  else if (kind === "regex") matches = labels.map(s => new RegExp(`^(?:${proof.pattern})$`).test(s));
  else if (kind === "remove_spaces_pairs") matches = labels.map(s => { const [a, b] = s.split("/").map(v => v.replaceAll(" ", "")); return a === b; });
  else if (kind === "time24") matches = labels.map(s => /^\d{2}:\d{2}$/.test(s) && Number(s.slice(0, 2)) <= 23 && Number(s.slice(3)) <= 59);
  else if (kind === "set_unique") matches = labels.map(s => { const entries = s.split(", "); return new Set(entries).size === entries.length && entries.every(v => (proof.allowed as string[]).includes(v)); });
  else throw new Error(`Unknown source proof ${kind}`);
  if (matches.filter(Boolean).length !== 1) throw new Error(`Source has no unique derived answer: ${question.id}`);
  truth.set(question.id, question.options[matches.indexOf(true)].id);
}
const answer = (counts = [6, 6, 6, 6]) => {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((d, i) => source.questions.filter(q => q.options[0].directionId === d.id).forEach((q, j) => { answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id; }));
  return answers;
};

describe("T156 original closed-information attention-to-detail practice", () => {
  it("binds24bilingual tasks and4fullrevisionguides to independently recomputed source keys", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(24); expect(quiz.profiles).toHaveLength(4);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(source.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id))); expect(quiz.questions.some(q => q.reverse || q.options.some(o => o.score !== undefined))).toBe(false);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([6, 6, 6, 6]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    const positions = quiz.questions.map(q => q.correctOptionId); for (const id of ["A", "B", "C", "D"]) expect(positions.filter(v => v === id)).toHaveLength(6);
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(5); expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160); }
    const check = (value: unknown): void => { if (!value || typeof value !== "object") return; const obj = value as Record<string, unknown>; if ("en" in obj || "zh" in obj) { expect(String(obj.en).trim()).not.toBe(""); expect(obj.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(String(obj.zh).trim()).not.toBe(""); if (!/\p{Script=Han}/u.test(String(obj.zh))) expect(obj.zh).toBe(obj.en); } else Object.values(obj).forEach(check); }; check(quiz);
  });
  it("matches every2401reachable four-section correctness vector and all item judgements", () => {
    let checked = 0;
    for (let a = 0; a <= 6; a++) for (let b = 0; b <= 6; b++) for (let c = 0; c <= 6; c++) for (let d = 0; d <= 6; d++) {
      const values = [a, b, c, d], answers = answer(values), result = scoreQuestionnaire(quiz, answers);
      if (result.status !== "complete" || !("practice" in result)) throw new Error("Practice witness rejected");
      expect(result.practice.correct).toBe(a + b + c + d); expect(result.practice.total).toBe(24);
      for (const [i, part] of quiz.directions.entries()) expect(result.practice.sections[part.id]).toEqual({ correct: values[i], total: 6 });
      for (const item of result.practice.items) expect(item).toEqual({ questionId: item.questionId, selectedOptionId: answers[item.questionId], correctOptionId: truth.get(item.questionId), correct: answers[item.questionId] === truth.get(item.questionId) });
      for (const field of ["rank", "percentile", "profileId", "ability", "type"]) expect(result).not.toHaveProperty(field); checked++;
    } expect(checked).toBe(2401); console.info("Attention to detail:24independentproofkeys+2401reachable correctness vectors;not4^24individualpathsorpsychometricvalidation.");
  });
  it("shows all24correctanswers and explanations and4completeguides at zero,partial and perfect counts", () => {
    for (const locale of ["en", "zh"] as const) for (const values of [[0, 0, 0, 0], [2, 6, 0, 5], [6, 6, 6, 6]]) {
      const result = scoreQuestionnaire(quiz, answer(values)); if (result.status !== "complete" || !("practice" in result)) throw new Error("Report witness rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-practice-question]")).toHaveLength(24); expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(24); expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(4);
      for (const question of quiz.questions) { const item = dom.querySelector(`[data-practice-question="${question.id}"]`)!; expect(item.textContent).toContain(question.explanation![locale]); expect(item.textContent).toContain(question.options.find(o => o.id === truth.get(question.id))!.label[locale]); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("withholds partial results,rejects malformed answers/keys and expires opt-in drafts", () => {
    const partial = answer(); delete partial.DETAIL_24; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 23 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { DETAIL_01: "na" }, { DETAIL_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "not-an-option"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { DETAIL_01: "D" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ DETAIL_01: "D" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes10nativeENZHpageswith practice language,complete guides and correct publicSEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/attention-to-detail`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank");
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, rendered = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/attention-to-detail/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/attention-to-detail/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
