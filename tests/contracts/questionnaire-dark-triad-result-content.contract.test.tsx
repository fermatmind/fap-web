import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/dark-triad.json";
import content from "@/lib/questionnaires/result-content/dark-triad.json";
import { darkTriadResultProfile } from "@/lib/questionnaires/result-content/dark-triad";
import { QuestionnaireDarkTriadReport } from "@/components/questionnaires/QuestionnaireDarkTriadReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Three private thematic reviews and public hypothetical conversations", () => {
  it("preserves 18 owned items and three identities while adding distinct bilingual modules", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(18); expect(quiz.profiles).toHaveLength(3);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const reading = darkTriadResultProfile(p);
      expect(reading.sections.slice(0, 9)).toEqual(p.sections.map(section => !["scoring", "privacy"].includes(section.id) ? section : { ...section, paragraphs: section.paragraphs.map(p => ({ ...p, zh: p.zh.replace("三份九节说明", "三份完整说明").replace("三份九节全文", "三份完整说明"), en: p.en.replace("nine-section", "full") })) })); expect(reading.sections).toHaveLength(11);
      expect(reading.directionIds).toEqual(p.directionIds); expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
    }
    for (const locale of ["en", "zh"] as const) for (const index of [0, 1])
      expect(new Set(Object.values(content).map(s => s[index].paragraphs[0][locale])).size).toBe(3);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(darkTriadResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders every public %s reading without personal facet means", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-dark-triad-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-dtt-facet], [data-dtt-mean]")).toBeNull();
      for (const s of darkTriadResultProfile(profile).sections) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("retains all three full %s bodies and separate means across the completeness boundary", locale => {
    const missing = locale === "zh" ? "资料不足" : "Insufficient information";
    for (const mode of ["low", "high", "uncertain", "insufficient", "boundary", "mixed", "exact"] as const) {
      const ratings = quiz.questions.map(q => {
        const partIndex = quiz.questions.filter(x => x.options[0].directionId === q.options[0].directionId).findIndex(x => x.id === q.id);
        const directionIndex = quiz.directions.findIndex(d => d.id === q.options[0].directionId);
        if (mode === "insufficient" || (mode === "boundary" && partIndex >= directionIndex + 3) || (mode === "exact" && directionIndex === 0 && partIndex >= 4)) return null;
        return mode === "low" ? 1 : mode === "high" ? 5 : mode === "mixed" ? directionIndex + 1 : mode === "exact" ? (directionIndex === 0 ? [1, 2, 3, 3][partIndex] : partIndex === 5 ? 5 : 1) : 3;
      });
      const result = scoreLikertQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, ratings[i] === null ? "na" : String(ratings[i])])));
      if (result.status !== "complete") throw new Error("Actual-item witness required");
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireDarkTriadReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-dark-triad-result-reading]")).toHaveLength(3); expect(root.querySelectorAll("h4")).toHaveLength(33);
      for (const d of quiz.directions) {
        const part = ratings.filter((_, i) => quiz.questions[i].options[0].directionId === d.id).filter((n): n is number => n !== null);
        const sum = part.reduce((s, n) => s + n, 0), mean = part.length >= 4 ? sum / part.length : null;
        const facet = root.querySelector(`[data-dtt-facet="${d.id}"]`)!;
        expect(facet.querySelector("[data-dtt-mean]")?.textContent).toBe(mean === null ? missing : `${mean.toFixed(2)} / 5`);
        expect(facet.querySelector("[data-dtt-rated]")?.textContent).toContain(`${part.length} / 6`);
        expect(facet.querySelectorAll("[data-dtt-sum]")).toHaveLength(mean === null ? 0 : 1);
        if (mean !== null) expect(facet.querySelector("[data-dtt-sum]")?.textContent).toContain(`${sum} / ${part.length}`);
      }
      expect(root.querySelectorAll("[data-dtt-insufficient]")).toHaveLength(mode === "insufficient" ? 1 : 0);
      expect(root.querySelector('button, input, [data-questionnaire-share]')).toBeNull();
      expect(result).not.toHaveProperty("total");
      expect(result).not.toHaveProperty("leaders");
      const ids = [...root.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const profile of quiz.profiles) for (const s of content[profile.id as keyof typeof content]) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${profile.id}-${s.id}`)?.textContent).toContain(p[locale]);
    }
  });
});
