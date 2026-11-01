import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/light-triad-test.json";
import content from "@/lib/questionnaires/result-content/light-triad-test.json";
import { lightTriadResultProfile } from "@/lib/questionnaires/result-content/light-triad-test";
import { QuestionnaireLtsReport } from "@/components/questionnaires/QuestionnaireLtsReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("LTS descriptive reviews and conversations", () => {
  it("preserves12published items, three identities and bilingual attribution while adding distinct modules", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(12); expect(quiz.profiles).toHaveLength(3);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const reading = lightTriadResultProfile(p);
      expect(reading.sections.slice(0, 9)).toEqual(p.sections); expect(reading.sections).toHaveLength(11);
      expect(reading.directionIds).toEqual(p.directionIds); expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
      for (const locale of ["en", "zh"] as const) expect(reading.sections[8].paragraphs[1][locale]).toContain("CC BY 4.0");
    }
    for (const locale of ["en", "zh"] as const) for (const index of [0, 1])
      expect(new Set(Object.values(content).map(s => s[index].paragraphs[0][locale])).size).toBe(3);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(lightTriadResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders every public %s reading without overall or facet scores", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-light-triad-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-lts-facet], [data-lts-total], [data-lts-mean]")).toBeNull();
      for (const s of lightTriadResultProfile(profile).sections) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("retains all three full %s bodies and unrounded total-first readings with NA", locale => {
    const missing = locale === "zh" ? "资料不足" : "Insufficient information";
    for (const mode of ["low", "high", "insufficient", "oneNA", "mixed", "unrounded"] as const) {
      const ratings = quiz.questions.map((_, i) => mode === "insufficient" || (mode === "oneNA" && i === 0) ? null
        : mode === "low" ? 1 : mode === "high" ? 5 : mode === "mixed" ? (i < 4 ? 1 : 5) : mode === "unrounded" ? (i === 0 ? 1 : 2) : 3);
      const result = scoreLikertQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, ratings[i] === null ? "na" : String(ratings[i])])));
      if (result.status !== "complete") throw new Error("Actual-item witness required");
      const total = ratings.every(n => n !== null) ? ratings.reduce<number>((s, n) => s + (n ?? 0), 0) : null;
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireLtsReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-light-triad-result-reading]")).toHaveLength(3); expect(root.querySelectorAll("h4")).toHaveLength(33);
      expect(root.querySelector("[data-lts-total]")?.textContent).toBe(total === null ? missing : String(total));
      expect(root.querySelector("[data-lts-overall-mean]")?.textContent).toBe(total === null ? missing : (total / 12).toFixed(2));
      for (const d of quiz.directions) {
        const part = ratings.filter((_, i) => quiz.questions[i].options[0].directionId === d.id);
        const sum = part.every(n => n !== null) ? part.reduce<number>((s, n) => s + (n ?? 0), 0) : null;
        expect(root.querySelector(`[data-lts-facet="${d.id}"] [data-lts-mean]`)?.textContent).toBe(sum === null ? missing : `${(sum / 4).toFixed(2)} / 5`);
        expect(root.querySelector(`[data-lts-facet="${d.id}"] [data-lts-sum]`)?.textContent).toBe(sum === null ? missing : String(sum));
      }
      expect(result).not.toHaveProperty("leaders");
      const ids = [...root.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const profile of quiz.profiles) for (const s of content[profile.id as keyof typeof content]) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${profile.id}-${s.id}`)?.textContent).toContain(p[locale]);
    }
  });
});
