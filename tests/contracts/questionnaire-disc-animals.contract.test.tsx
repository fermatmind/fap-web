import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/disc.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("T066 transparently reuses T001 DISC; animal names add no measurement", () => {
  it("preserves every original question, score identity and all fifteen complete public readings", () => {
    // Frozen from accepted 789ec0ee0 before this content supplement. Source hashes
    // identify the original Mini source, rather than the new naming explanation.
    const original = { slug: quiz.slug, code: quiz.code, title: quiz.title, version: quiz.version, source: quiz.source, directions: quiz.directions, questions: quiz.questions, profiles: quiz.profiles.map(p => ({ ...p, sections: p.sections.filter(s => s.id !== "thai-four-animals-labels") })) };
    expect(createHash("sha256").update(JSON.stringify(original)).digest("hex")).toBe("e3e36cd150c03dead511083a15b5f5b3ba5ecda77ca4f5833a754c68e6b0d8c5");
    expect(catalog.filter(q => q.slug === "disc")).toHaveLength(1); expect(catalog.some(q => q.slug === "thai-four-animals")).toBe(false);
    expect(quiz.questions).toHaveLength(24); expect(quiz.profiles).toHaveLength(15); expect(quiz.description.en.length).toBeLessThanOrEqual(160);
    expect(quiz.references?.map(r => r.url)).toEqual(["https://jobcannon.io/tests/thai-four-animals", "https://inskru.com/idea/-Mo92H9lGEhATD1OwjvT/"]);
    const classroom: Record<string, string[]> = { DOMINANCE: ["Bull", "牛"], INFLUENCE: ["Eagle", "鹰"], STEADINESS: ["Mouse", "鼠"], CONSCIENTIOUSNESS: ["Bear", "熊"] };
    const job: Record<string, string[]> = { ...classroom, STEADINESS: ["Bear", "熊"], CONSCIENTIOUSNESS: ["Mouse", "鼠"] };
    for (const p of quiz.profiles) {
      const section = p.sections.at(-1)!; expect(section.id).toBe("thai-four-animals-labels"); expect(section.paragraphs).toHaveLength(3);
      for (const [locale, n] of [["en", 0], ["zh", 1]] as const) {
        const names = (m: typeof classroom) => p.directionIds.map(id => m[id][n]).join(locale === "en" ? " / " : "、");
        expect(section.paragraphs[0][locale]).toContain(names(classroom)); expect(section.paragraphs[0][locale]).toContain(names(job));
        expect(section.paragraphs[2][locale]).toContain(locale === "en" ? "not JobCannon’s 12-item bank" : "不是JobCannon12题");
      }
      expect(section.paragraphs[1].en).toContain("A tie does not become a primary animal plus a secondary animal");
    }
    expect(quiz.guide.at(-1)!.paragraphs.at(-1)!.en).toContain("Compliance"); expect(quiz.guide.at(-1)!.paragraphs.at(-1)!.en).toContain("Conscientiousness");
  });
  it("renders the version-aware comparison on the two entries and all thirty unchanged canonical guides", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"); const map = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const args = { params: Promise.resolve({ locale, slug: "disc" }) }, dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(args)); const meta = await entry.generateMetadata(args);
        expect(meta.title).toBe(quiz.seoTitle[locale]); expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
        expect(dom.textContent).toContain(locale === "en" ? "Thai Four Animals" : "泰国四种动物");
        for (const ref of quiz.references!) expect(dom.querySelector(`a[href="${ref.url}"]`)).not.toBeNull();
        for (const p of quiz.profiles) {
          const path = `/${locale}/tests/explore/disc/results/${p.id}`, args = { params: Promise.resolve({ locale, slug: "disc", profile: p.id }) }; dom.innerHTML = renderToStaticMarkup(await guide.default(args));
          for (const text of p.sections.at(-1)!.paragraphs) expect(dom.querySelector("#report-thai-four-animals-labels")?.textContent).toContain(text[locale]);
          expect((await guide.generateMetadata(args)).alternates?.canonical).toBe("https://fermatmind.com" + path); expect(map.filter(x => x.loc === "https://fermatmind.com" + path)).toHaveLength(1);
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
      expect(map.filter(x => /\/tests\/explore\/disc(?:\/|$)/.test(x.loc))).toHaveLength(32); expect(map.some(x => x.loc.includes("thai-four-animals"))).toBe(false);
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
