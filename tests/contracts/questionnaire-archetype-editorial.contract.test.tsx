import { describe, expect, it, vi } from "vitest";
import raw from "@/lib/questionnaires/data/jungian-archetype.json";
import catalog from "@/lib/questionnaires/catalog.json";
import { jungianArchetypeLandingSummary } from "@/components/questionnaires/JungianArchetypeLandingEditorial";
import type { Questionnaire } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("retired Jungian archetype entertainment quiz", () => {
  it("keeps the archived bilingual editorial outside the public catalog", () => {
    expect(catalog.some(item => item.slug === quiz.slug)).toBe(false);
    for (const locale of ["zh", "en"] as const) {
      const summaries = quiz.profiles.map(profile => jungianArchetypeLandingSummary(profile, locale));
      expect(new Set(summaries).size).toBe(12);
      expect(summaries.every(Boolean)).toBe(true);
    }
  });
});
