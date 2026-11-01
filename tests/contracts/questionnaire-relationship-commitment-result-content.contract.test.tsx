import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/relationship-commitment.json";
import content from "@/lib/questionnaires/result-content/relationship-commitment.json";
import { relationshipCommitmentResultProfile } from "@/lib/questionnaires/result-content/relationship-commitment";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireCommitmentReport } from "@/components/questionnaires/QuestionnaireCommitmentReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const reversed = new Set(["RC_06", "RC_09", "RC_11", "RC_12", "RC_17", "RC_18", "RC_19", "RC_20"]);
const modes = ["neutral", "all-na", "one-na", "low", "high", "rounding"] as const;
function answersFor(mode: typeof modes[number]) {
  const a = Object.fromEntries(quiz.questions.map(q => [q.id, mode === "all-na" ? "na" : mode === "low" ? (reversed.has(q.id) ? "5" : "1") : mode === "high" ? (reversed.has(q.id) ? "1" : "5") : "3"]));
  if (mode === "one-na") a.RC_01 = "na";
  if (mode === "rounding") for (const [i,n] of [5,4,2,4,1,4].entries()) a[["RC_01","RC_05","RC_09","RC_13","RC_17","RC_21"][i]] = String(n);
  return a;
}
describe("Four complete original relationship commitment readings", () => {
  it("retains every source paragraph and eight modules with distinct examples", () => {
    const before = JSON.stringify(quiz), prepared = prepareQuestionnaireResultReadings(quiz);
    expect(prepared.questions).toBe(quiz.questions); expect(prepared.minimumRatedItems).toBe(6);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const reading = relationshipCommitmentResultProfile(p);
      expect(reading.sections.map(s => s.id)).toEqual(p.sections.map(s => s.id));
      expect(reading.title).toEqual(p.title); expect(reading.directionIds).toEqual(p.directionIds); expect(reading.scoreReading).toEqual(p.scoreReading);
      expect(reading.sections.flatMap(s => s.paragraphs)).toHaveLength(p.sections.flatMap(s => s.paragraphs).length + 3);
      for (const s of p.sections) expect(reading.sections.find(v => v.id === s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);
    }
    for (const locale of ["zh","en"] as const) expect(new Set(Object.values(content).map(v => v[0].paragraphs[0][locale])).size).toBe(4);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = {...quiz.profiles[0], id:"__proto__"}; expect(relationshipCommitmentResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("renders all four %s guides through independent valid, missing and reverse-keyed states", locale => {
    const prepared = prepareQuestionnaireResultReadings(quiz), missing = locale === "zh" ? "资料不足" : "Insufficient information";
    for (const mode of modes) {
      const answers = answersFor(mode), result = scoreLikertQuestionnaire(prepared,answers);
      expect(result).toEqual(scoreLikertQuestionnaire(quiz,answers)); if (result.status !== "complete") throw Error("Complete facets required");
      const root = document.createElement("div"); root.innerHTML = renderToStaticMarkup(<QuestionnaireCommitmentReport quiz={prepared} result={result} locale={locale}/>);
      expect(root.querySelectorAll("[data-relationship-commitment-result-reading]")).toHaveLength(4);
      expect(root.querySelectorAll("h4")).toHaveLength(32);
      expect(root.querySelectorAll("[data-commitment-insufficient]")).toHaveLength(mode === "all-na" ? 4 : mode === "one-na" ? 1 : 0);
      for (const p of quiz.profiles) {
        const items = quiz.questions.filter(q => q.options[0].directionId === p.id), values = items.filter(q => answers[q.id] !== "na").map(q => reversed.has(q.id) ? 6-Number(answers[q.id]) : Number(answers[q.id]));
        const mean = values.length === 6 ? `${(values.reduce((a,b)=>a+b,0)/6).toFixed(1)} / 5` : missing;
        expect(root.querySelector(`[data-commitment-summary="${p.id}"] [data-commitment-mean]`)?.textContent).toBe(mean);
        for (const section of content[p.id as keyof typeof content]) for (const text of section.paragraphs) expect(root.querySelector(`#report-${p.id}-${section.id}`)?.textContent).toContain(text[locale]);
      }
      if (mode === "rounding") expect(root.querySelector('[data-commitment-summary="continuing-intention"] [data-commitment-mean]')?.textContent).toBe("4.3 / 5");
      const ids = [...root.querySelectorAll("[id]")].map(v=>v.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll("nav a")) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      if(locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("renders four full public %s guides without personal scores", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const root = document.createElement("div"); root.innerHTML = renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));
      expect(root.querySelector(`[data-relationship-commitment-result-reading="${p.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-commitment-summary], [data-commitment-mean]")).toBeNull();
      for(const section of content[p.id as keyof typeof content]) for(const text of section.paragraphs) expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(text[locale]);
    }
  });
});
