import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import raw from "@/lib/questionnaires/data/bleach.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { BleachChoiceContext, bleachChoiceEvidence } from "@/components/questionnaires/BleachChoiceContext";
import { BleachCharacterDirectory } from "@/components/questionnaires/BleachCharacterDirectory";
import { bleachDirectionNote, bleachExperienceFaq, bleachVisiblePrivacyAnswer } from "@/components/questionnaires/BleachLandingEditorial";
vi.mock("next/headers", () => ({headers: async () => new Headers()}));
const quiz = raw as Questionnaire;
for (const locale of ["en", "zh"] as const) describe(`BLEACH actual context in ${locale}`, () => {
  it("ties every original scene and selected option to its real question number and edition direction", () => {
    for (const profile of quiz.profiles) {
      const answers = Object.fromEntries(quiz.questions.map(q => [q.id, (q.options.find(o => o.directionId === profile.id) ?? q.options[0]).id]));
      const evidence = bleachChoiceEvidence(quiz, profile, answers);
      expect(evidence).toHaveLength(12);
      const root = document.createElement("div");root.innerHTML = renderToStaticMarkup(<BleachChoiceContext quiz={quiz} profile={profile} answers={answers} locale={locale} expanded />);
      expect(root.querySelectorAll("li")).toHaveLength(12);
      expect(root.firstElementChild!.querySelectorAll(":scope > ol > li")).toHaveLength(2);
      for (const row of evidence) {
        const item = root.querySelector(`[data-bleach-question-number="${row.number}"]`)!;
        expect(item.textContent).toContain(row.question.prompt[locale]);
        expect(item.textContent).toContain(row.option.label[locale]);
        expect(item.textContent).toContain(bleachDirectionNote(profile.id, locale));
        for (const other of row.question.options.filter(o => o.id !== row.option.id)) expect(item.textContent).not.toContain(other.label[locale]);
      }
      expect(renderToStaticMarkup(<BleachChoiceContext quiz={quiz} profile={profile} locale={locale} expanded />)).toBe("");
      const tied = document.createElement("div");tied.innerHTML = renderToStaticMarkup(<BleachChoiceContext quiz={quiz} profile={profile} answers={answers} locale={locale} expanded={false} />);
      expect(tied.firstElementChild?.querySelector(":scope > details")).not.toBeNull();
      expect(tied.querySelector("details")?.hasAttribute("open")).toBe(false);
    }
  });
  it("links the seven fixed identities to existing same-language guides without assigning unearned results", () => {
    const root = document.createElement("div");root.innerHTML = renderToStaticMarkup(<BleachCharacterDirectory quiz={quiz} locale={locale} />);
    expect(root.querySelectorAll("li")).toHaveLength(7);
    for (const profile of quiz.profiles) {
      const link = root.querySelector(`[data-bleach-directory-character="${profile.id}"] a`)!;
      expect(link.getAttribute("href")).toBe(`/${locale}/tests/explore/bleach/results/${profile.id}`);
      expect(link.textContent).toContain(bleachDirectionNote(profile.id, locale));
    }
    expect(root.textContent).toContain(locale === "zh" ? "不表示你获得了其余角色结果" : "do not assign you additional results");
  });
  it("keeps source FAQ bytes but presents current standalone privacy behavior and one navigation FAQ", async () => {
    const page = await import("@/components/questionnaires/QuestionnairePage");
    const root = document.createElement("div");root.innerHTML = renderToStaticMarkup(await page.default({params: Promise.resolve({slug: "bleach", locale})}));
    expect(root.textContent).toContain(bleachVisiblePrivacyAnswer(locale));
    expect(root.textContent).toContain(bleachExperienceFaq[0].answer[locale]);
    expect(root.textContent).not.toContain(locale === "zh" ? "可选本标签页进度24小时失效" : "Optional tab progress expires after 24 hours");
    expect(quiz.faq[13].answer[locale]).toContain(locale === "zh" ? "可选本标签页进度24小时失效" : "Optional tab progress expires after 24 hours");
  });
});
