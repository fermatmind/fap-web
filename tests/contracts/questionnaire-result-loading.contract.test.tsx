import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import disc from "@/lib/questionnaires/data/disc.json";
import flower from "@/lib/questionnaires/data/flower.json";
import { prepareQuestionnaireResultReadings, prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { QuestionnaireReport } from "@/components/questionnaires/QuestionnaireReport";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("Server-selected result content", () => {
  it("serialises only the requested test, preserving questions, source objects and scores", () => {
    for (const source of [disc, flower] as Questionnaire[]) {
      const before = JSON.stringify(source);
      const quiz = prepareQuestionnaireResultReadings(source);
      expect(quiz).not.toBe(source);
      expect(quiz.questions).toBe(source.questions); expect(quiz.source).toBe(source.source);
      expect(quiz.profiles.map(p => p.id)).toEqual(source.profiles.map(p => p.id));
      expect(quiz.profiles.every(p => p.resultReading?.quizSlug === source.slug)).toBe(true);
      expect(prepareQuestionnaireResultReadings(quiz)).toBe(quiz);
      const roundTrip = JSON.parse(JSON.stringify(quiz)) as Questionnaire;
      for (const locale of ["zh", "en"] as const) for (const p of roundTrip.profiles) {
        const html = renderToStaticMarkup(<QuestionnaireResultReading quizSlug={quiz.slug} profile={p} locale={locale} />);
        const root = document.createElement("div"); root.innerHTML = html;
        for (const section of p.sections) for (const line of section.paragraphs) expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(line[locale]);
      }
      const answers = Object.fromEntries(source.questions.map(q => [q.id, "A"]));
      const score = source.kind === "directional" ? scoreDirectionalQuestionnaire : scoreArchetypeQuestionnaire;
      expect(score(roundTrip, answers)).toEqual(score(source, answers));
      expect(JSON.stringify(source)).toBe(before);
      const serialised = JSON.stringify(roundTrip);
      expect(serialised).not.toContain('"select":');
      expect(serialised).not.toContain('For an imaginary late return of an ordinary item');
    }
  });

  it("retains unselected products and unknown identities, and binds rendering metadata to both identities", () => {
    const source = flower as Questionnaire;
    const unknownQuiz = { ...source, slug: "unknown-test" };
    expect(prepareQuestionnaireResultReadings(unknownQuiz)).toBe(unknownQuiz);
    const unknown = { ...source.profiles[0], id: "__proto__" };
    expect(prepareResultProfile(source.slug, unknown)).toBe(unknown);
    const prepared = prepareResultProfile(source.slug, source.profiles[0]);
    for (const [slug, p] of [["unknown-test", prepared], [source.slug, { ...prepared, id: "unknown-profile" }]] as const) {
      // A rejected binding keeps the caller's navigation preference, but emits no
      // product-specific wrapper or supplemental references from that binding.
      for (const navigation of [undefined, true, false]) {
        const html = renderToStaticMarkup(<QuestionnaireResultReading quizSlug={slug} profile={p} locale="en" navigation={navigation} />);
        expect(html).toBe(renderToStaticMarkup(<QuestionnaireReport profile={p} locale="en" navigation={navigation} />));
        const root = document.createElement("div"); root.innerHTML = html;
        expect(root.querySelector(`[data-${prepared.resultReading!.attribute}-result-reading]`)).toBeNull();
        expect(root.querySelectorAll("nav")).toHaveLength(navigation ? 1 : 0);
        for (const section of p.sections) for (const paragraph of section.paragraphs) expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(paragraph.en);
      }
    }
  });
});
