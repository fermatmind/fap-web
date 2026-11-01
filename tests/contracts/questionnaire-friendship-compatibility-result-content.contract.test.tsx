import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/friendship-compatibility.json";
import content from "@/lib/questionnaires/result-content/friendship-compatibility.json";
import { friendshipCompatibilityResultProfile } from "@/lib/questionnaires/result-content/friendship-compatibility";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireFriendshipFitReport } from "@/components/questionnaires/QuestionnaireFriendshipFitReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const reversed = new Set<string>();
const modes = ["neutral", "all-na", "one-na", "low", "high", "rounding"] as const;
function answersFor(mode: typeof modes[number]) {
  const a = Object.fromEntries(quiz.questions.map(q => [q.id, mode === "all-na" ? "na" : mode === "low" ? "1" : mode === "high" ? "5" : "3"]));
  if (mode === "one-na") a.FRIENDFIT_01 = "na";
  if (mode === "rounding") for (const [i,n] of [4,3,4,2].entries()) a[["FRIENDFIT_01","FRIENDFIT_02","FRIENDFIT_03","FRIENDFIT_04"][i]] = String(n);
  return a;
}
describe("Five complete original friendship interaction readings", () => {
  it("retains every source paragraph and eight modules with distinct examples", () => {
    const before = JSON.stringify(quiz), prepared = prepareQuestionnaireResultReadings(quiz);
    expect(prepared.questions).toBe(quiz.questions); expect(prepared.minimumRatedItems).toBe(4);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const reading = friendshipCompatibilityResultProfile(p);
      expect(reading.sections.map(s => s.id)).toEqual(p.sections.map(s => s.id));
      expect(reading.title).toEqual(p.title); expect(reading.directionIds).toEqual(p.directionIds); expect(reading.scoreReading).toEqual(p.scoreReading);
      expect(reading.sections.flatMap(s => s.paragraphs)).toHaveLength(p.sections.flatMap(s => s.paragraphs).length + 3);
      for (const s of p.sections) expect(reading.sections.find(v => v.id === s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);
    }
    for (const locale of ["zh","en"] as const) expect(new Set(Object.values(content).map(v => v[0].paragraphs[0][locale])).size).toBe(5);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = {...quiz.profiles[0], id:"__proto__"}; expect(friendshipCompatibilityResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("renders all five %s guides through independent valid, missing and directly scored states", locale => {
    const prepared = prepareQuestionnaireResultReadings(quiz), missing = locale === "zh" ? "资料不足" : "Insufficient information";
    for (const mode of modes) {
      const answers = answersFor(mode), result = scoreLikertQuestionnaire(prepared,answers);
      expect(result).toEqual(scoreLikertQuestionnaire(quiz,answers)); if (result.status !== "complete") throw Error("Complete facets required");
      const root = document.createElement("div"); root.innerHTML = renderToStaticMarkup(<QuestionnaireFriendshipFitReport quiz={prepared} result={result} locale={locale}/>);
      expect(root.querySelectorAll("[data-friendship-compatibility-result-reading]")).toHaveLength(5);
      expect(root.querySelectorAll("h4")).toHaveLength(40);
      expect(root.querySelectorAll("[data-friendfit-insufficient]")).toHaveLength(mode === "all-na" ? 5 : mode === "one-na" ? 1 : 0);
      for (const p of quiz.profiles) {
        const items = quiz.questions.filter(q => q.options[0].directionId === p.id), values = items.filter(q => answers[q.id] !== "na").map(q => reversed.has(q.id) ? 6-Number(answers[q.id]) : Number(answers[q.id]));
        const mean = values.length === 4 ? `${(values.reduce((a,b)=>a+b,0)/4).toFixed(1)} / 5` : missing;
        expect(root.querySelector(`[data-friendfit-summary="${p.id}"] [data-friendfit-mean]`)?.textContent).toBe(mean);
        for (const section of content[p.id as keyof typeof content]) for (const text of section.paragraphs) expect(root.querySelector(`#friendfit-report-${p.id}-${section.id}`)?.textContent).toContain(text[locale]);
      }
      if (mode === "rounding") expect(root.querySelector('[data-friendfit-summary="agreements-and-priorities"] [data-friendfit-mean]')?.textContent).toBe("3.3 / 5");
      const ids = [...root.querySelectorAll("[id]")].map(v=>v.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll("nav a")) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      if(locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("renders five full public %s guides without personal scores", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const root = document.createElement("div"); root.innerHTML = renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));
      expect(root.querySelector(`[data-friendship-compatibility-result-reading="${p.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-friendfit-summary], [data-friendfit-mean]")).toBeNull();
      for(const section of content[p.id as keyof typeof content]) for(const text of section.paragraphs) expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(text[locale]);
    }
  });
});
