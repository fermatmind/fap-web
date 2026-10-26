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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/computer-literacy.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/computer-literacy-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; proofs: { id: string; proof: Record<string, unknown> }[] };
const truth = new Map<string, string>();
const reviewed: Record<string, string> = {
 COMPUTER_02: "Copy notes.txt from A, then paste into B", COMPUTER_03: "The name changed; the rename did not convert the image into PDF", COMPUTER_04: "The folder search box", COMPUTER_05: "Date modified", COMPUTER_06: "budget.xlsx", COMPUTER_07: "Ctrl + F", COMPUTER_08: "It does not guarantee an offline copy of the page", COMPUTER_09: "It remains on the computer unless separately deleted", COMPUTER_10: "Show in folder", COMPUTER_11: "The saved download and bookmark can remain after the session ends", COMPUTER_12: "Open link in new tab", COMPUTER_14: "Hide their Bcc names from the other recipients of this message", COMPUTER_15: "Check the reply attachments and attach map.pdf if it is absent", COMPUTER_16: "Review the quoted message and included attachments, removing anything not intended for that recipient", COMPUTER_17: "It has not been sent under this app’s stated label rule", COMPUTER_18: "Cedar draft v4 — please review by Thursday", COMPUTER_21: "Apply the built-in Heading 2 style to the subsection title"
};
for (const question of source.questions) {
 const p = source.proofs.find(item => item.id === question.id)!.proof;
 let expected: string;
 if (p.kind === "exact_path") expected = String(p.required);
 else if (p.kind === "recipient_set") {
  expect(p.bcc).toEqual([]); const others = (p.to as string[]).concat(p.cc as string[]).filter(v => v !== p.self);
  expected = [p.sender,...others.slice(0,-1)].join(", ") + " and " + others.at(-1);
 } else if (p.kind === "sum_range") {
  const start = String(p.start), end = String(p.end), cells = p.cells as Record<string,number>;
  expected = String(Array.from({length:Number(end.slice(1))-Number(start.slice(1))+1},(_,i) => cells[start[0]+(Number(start.slice(1))+i)]).reduce((a,b) => a+b,0));
 } else if (p.kind === "copy_formula") expected = String(p.formula).replace(/(\$?)([A-Z])(\$?)(\d+)/g, (_match,ac:string,col:string,ar:string,row:string) => ac + String.fromCharCode(col.charCodeAt(0)+(ac ? 0 : Number(p.colDelta))) + ar + (Number(row)+(ar ? 0 : Number(p.rowDelta))));
 else if (p.kind === "percentage_display") { expect(p.existingNumericValue).toBe(true); expected = (Number(p.value)*100).toFixed(Number(p.decimalPlaces))+"%"; }
 else if (p.kind === "filter_rows") {
  const rows = p.rows as {id:string;status:string}[];
  expect(rows.filter(r => r.status === p.criterion).map(r => r.id)).toEqual(["P","R"]); expect(rows.filter(r => r.status !== p.criterion).map(r => r.id)).toEqual(["Q"]);
  expected = "P and R are shown; Q is hidden by the filter, not deleted";
 } else if (p.kind === "sort_records") expected = [...p.rows as {id:string;quantity:number}[]].sort((a,b) => a.quantity-b.quantity).map(r => `${r.id}–${r.quantity}`).join(", ");
 else expected = reviewed[question.id];
 const valid = question.options.filter(o => o.label.en === expected); if (valid.length !== 1) throw new Error(`Nonunique reviewed feature/task key ${question.id}`); truth.set(question.id,valid[0].id);
}
const answer = (counts = [6, 6, 6, 6]) => {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((d, i) => source.questions.filter(q => q.options[0].directionId === d.id).forEach((q, j) => { answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id; }));
  return answers;
};

describe("T165 original bilingual computer literacy practice", () => {
  it("binds24original native ENZH tasks and4fullrevisionguides to reviewed official features and explicit path/recipient/numeric/reference/record consequences", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(24); expect(quiz.profiles).toHaveLength(4);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(source.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id))); expect(quiz.questions.some(q => q.reverse || q.options.some(o => o.score !== undefined))).toBe(false);
    expect(source.proofs).toHaveLength(24);
    for (const item of quiz.questions) { expect(item.prompt.en.trim()).not.toBe(""); expect(item.prompt.zh.trim()).not.toBe(""); for (const option of item.options) { expect(option.label.en.trim()).not.toBe(""); expect(option.label.zh.trim()).not.toBe(""); } }

    expect(quiz.faq.some(item => item.question.en.includes("certify job readiness") && item.answer.en.startsWith("No."))).toBe(true);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([6, 6, 6, 6]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    const positions = quiz.questions.map(q => q.correctOptionId); for (const id of ["A", "B", "C", "D"]) expect(positions.filter(v => v === id)).toHaveLength(6);
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(5); expect(profile.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(230); expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160); }
    const check = (value: unknown): void => { if (!value || typeof value !== "object") return; const obj = value as Record<string, unknown>; if ("en" in obj || "zh" in obj) { expect(String(obj.en).trim()).not.toBe(""); expect(obj.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(String(obj.zh).trim()).not.toBe(""); if (!/\p{Script=Han}/u.test(String(obj.zh))) expect(String(obj.zh).replaceAll("、", ", ")).toBe(obj.en); } else Object.values(obj).forEach(check); }; check(quiz);
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
    } expect(checked).toBe(2401); console.info("ComputerPractice:24reviewedkeys+2401reachablecorrectnessvectors;not4^24answerpathsorpsychometricvalidation.");
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
    const partial = answer(); delete partial.COMPUTER_24; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 23 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { COMPUTER_01: "na" }, { COMPUTER_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "not-an-option"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { COMPUTER_01: "D" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ COMPUTER_01: "D" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes10nativeENZHpageswith practice language,complete guides and correct publicSEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/computer-literacy`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank");
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, rendered = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/computer-literacy/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/computer-literacy/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
