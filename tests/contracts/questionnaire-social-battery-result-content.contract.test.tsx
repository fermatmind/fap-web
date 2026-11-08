import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/social-battery-test.json";
import communicationSource from "@/lib/questionnaires/data/communication-style.json";
import content from "@/lib/questionnaires/result-content/social-battery.json";
import { socialBatteryResultProfile } from "@/lib/questionnaires/result-content/social-battery";
import { QuestionnaireFacetReport } from "@/components/questionnaires/QuestionnaireFacetReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Social Battery independent facet reading additions", () => {
  it("keeps all source modules and identities, adds individually authored content to the four existing parts", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const reading = socialBatteryResultProfile(profile);
      expect(reading.id).toBe(profile.id); expect(reading.directionIds).toEqual(profile.directionIds);
      expect(reading.sections.slice(0, 9)).toEqual(profile.sections);
      expect(reading.sections).toHaveLength(12);
      expect(new Set(reading.sections.map(s => s.id)).size).toBe(12);
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" };
    expect(socialBatteryResultProfile(unknown)).toBe(unknown);
  });

  it.each(["zh", "en"] as const)("renders authored public guides without private scores in %s", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector("[data-social-battery-result-reading]")).not.toBeNull();
      expect(root.querySelector("[data-facet-score]")).toBeNull();
      for (const section of content[profile.id as keyof typeof content]) {
        const target = root.querySelector(`#report-${section.id}`)!;
        expect(target).not.toBeNull();
        for (const paragraph of section.paragraphs) expect(target.textContent).toContain(paragraph[locale]);
      }
      const ids = new Set([...root.querySelectorAll("[id]")].map(el => el.id));
      for (const link of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids.has(link.getAttribute("href")!.slice(1))).toBe(true);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });

  it.each(["zh", "en"] as const)("preserves mixed available and insufficient-information states in all four %s readings", locale => {
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, q.options[0].directionId === "interaction-load" ? "4" : "na"]));
    const result = scoreLikertQuestionnaire(quiz, answers);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Complete mixed-data witness required");
    expect(result.facets["interaction-load"].mean).not.toBeNull();
    for (const id of ["coordination-load", "quiet-recovery", "easy-company"]) expect(result.facets[id].mean).toBeNull();
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<QuestionnaireFacetReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
    expect(root.querySelectorAll("[data-social-battery-result-reading]")).toHaveLength(4);
    expect(root.querySelectorAll("[data-facet-score]")).toHaveLength(4);
    const guides = root.querySelectorAll<HTMLAnchorElement>('a[href*="/results/"]');
    expect(guides).toHaveLength(4);
    for (const link of guides) {
      expect(link.target).toBe("_blank");
      expect(link.rel.split(/\s+/)).toContain("noopener");
      expect(link.textContent).toContain(locale === "zh" ? "新标签页" : "new tab");
      expect(link.getAttribute("href")).toMatch(new RegExp(`^/${locale}/tests/explore/social-battery-test/results/[^/?]+$`));
    }
    const ids = [...root.querySelectorAll("[id]")].map(el => el.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const link of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(link.getAttribute("href")!.slice(1));
    for (const profile of quiz.profiles) {
      const report = root.querySelector(`[data-social-battery-result-reading="${profile.id}"]`)!;
      for (const section of content[profile.id as keyof typeof content]) for (const p of section.paragraphs) expect(report.textContent).toContain(p[locale]);
      const score = root.querySelector(`[data-facet-score="${profile.id}"]`)!;
      expect(score.textContent).toContain(profile.id === "interaction-load" ? (locale === "zh" ? "计分后均分" : "Scored mean") : (locale === "zh" ? "资料不足" : "Insufficient information"));
    }
  });

  it("preserves existing communication-style guide navigation", () => {
    const other = communicationSource as Questionnaire;
    const answers = Object.fromEntries(other.questions.map(q => [q.id, q.options[0].id]));
    const result = scoreLikertQuestionnaire(other, answers);
    if (result.status !== "complete") throw new Error("Complete compatibility witness required");
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<QuestionnaireFacetReport quiz={other} result={result} locale="en" />);
    const guides = root.querySelectorAll('a[href*="/results/"]');
    expect(guides.length).toBeGreaterThan(0);
    for (const link of guides) expect(link.getAttribute("target")).toBeNull();
  });
});
