import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/egen-teto.json";
import content from "@/lib/questionnaires/result-content/egen-teto.json";
import { egenTetoResultProfile } from "@/lib/questionnaires/result-content/egen-teto";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Three first-move reviews and conversation invitations", () => {
  it("enriches existing practice and access modules while preserving the nine-section source and identity", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const prepared = egenTetoResultProfile(p);
      expect(prepared.sections).toHaveLength(9);
      expect(prepared.directionIds).toEqual(p.directionIds);
      expect(prepared.scoreReading).toEqual(p.scoreReading);
      for (const [i, section] of p.sections.entries()) {
        expect(prepared.sections[i].id).toBe(section.id);
        expect(prepared.sections[i].title).toEqual(section.title);
        expect(prepared.sections[i].paragraphs.slice(0, section.paragraphs.length)).toEqual(section.paragraphs);
      }
    }
    const prepared = prepareQuestionnaireResultReadings(quiz);
    expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(egenTetoResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders all three public %s guides without personal counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }));
      expect(root.querySelector(`[data-egen-teto-result-reading="${p.id}"]`)).not.toBeNull();
      expect(root.querySelector('[aria-label="Raw choice counts for this attempt"]')).toBeNull();
      for (const s of content[p.id as keyof typeof content]) for (const text of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("preserves all nineteen count pairs and complete %s result modules", locale => {
    const prepared = prepareQuestionnaireResultReadings(quiz);
    for (let n = 0; n <= 18; n++) {
      const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, q.options.find(o => o.directionId === (i < n ? "egen" : "teto"))!.id]));
      const result = scoreDirectionalQuestionnaire(quiz, answers);
      if (result.status !== "complete") throw new Error("Complete count witness required");
      expect(result.counts).toEqual({ egen: n, teto: 18 - n });
      expect(result.profileId).toBe(n === 9 ? "tie" : n > 9 ? "egen" : "teto");
      const profile = prepared.profiles.find(p => p.id === result.profileId)!;
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} />);
      expect(root.querySelectorAll("h3")).toHaveLength(9);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const s of content[profile.id as keyof typeof content]) for (const text of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
    }
  });
});
