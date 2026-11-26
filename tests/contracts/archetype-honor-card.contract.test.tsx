import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArchetypeHonorCard } from "@/components/questionnaires/ArchetypeHonorCard";
import { hasTraditionalArchetype } from "@/lib/i18n/traditionalArchetypePaths";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { QuestionnaireNextSteps } from "@/components/questionnaires/QuestionnaireReports";
import { archetypeCardUrl, archetypeCardVariant, archetypeRunnerUp, type CompleteArchetype } from "@/lib/questionnaires/archetypeResultCard";
import { archetypeHonorCardCopy, getArchetypeHonorCopy } from "@/lib/questionnaires/archetypeHonorCardCopy";
import { archetypeResultCopy, archetypeSharePayload } from "@/lib/questionnaires/archetypeResultShare";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";

const display = vi.hoisted(() => ({ traditional: false }));
vi.mock("@/components/questionnaires/TraditionalQuestionnaireCopy", async importOriginal => ({
  ...(await importOriginal<typeof import("@/components/questionnaires/TraditionalQuestionnaireCopy")>()),
  useQuestionnaireDisplayCopy: () => ({ displayText: (value: string) => value, traditional: display.traditional }),
}));

const load = (slug: string) => JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
const locales = ["zh", "zh-TW", "en"] as const;
const makeResult = (quiz: Questionnaire, values: number[]): CompleteArchetype => ({
  status: "complete", answered: quiz.questions.length,
  counts: Object.fromEntries(quiz.profiles.map((profile, i) => [profile.directionIds[0], values[i] ?? 0])),
  profileIds: quiz.profiles.filter((_, i) => values[i] === Math.max(...values)).map(profile => profile.id),
});
const dom = (markup: string) => {
  const result = document.createElement("div");
  result.innerHTML = markup;
  return result;
};

describe("shared archetype result card", () => {
  it("covers precisely the 41 registered titles and 122 locale paths, with the distinct Chiikawa take excluded", () => {
    const catalog = JSON.parse(readFileSync("lib/questionnaires/catalog.json", "utf8")) as { slug: string }[];
    const slugs = catalog.map(c => c.slug).filter(slug => archetypeCardVariant(slug, "en"));
    expect(slugs).toHaveLength(41);
    expect(slugs.flatMap(slug => locales.filter(locale => archetypeCardVariant(slug, locale)))).toHaveLength(122);
    expect(archetypeCardVariant("chiikawa", "zh-TW")).toBeUndefined();
    expect(slugs.filter(hasTraditionalArchetype)).toHaveLength(40);
    expect(archetypeCardVariant("philosopher-personality-test", "en")).toBeUndefined();
    expect(slugs.reduce<Record<string, number>>((counts, slug) => {
      const target = archetypeCardVariant(slug, "en")!.target;
      counts[target] = (counts[target] ?? 0) + 1;
      return counts;
    }, {})).toEqual({ MBTI: 25, BIG5_OCEAN: 13, EQ_60: 1, RIASEC: 2 });
  });

  it("covers every registered result with three localized tags and an original bounded second-person verdict", () => {
    const catalog = JSON.parse(readFileSync("lib/questionnaires/catalog.json", "utf8")) as { slug: string }[];
    const slugs = catalog.map(c => c.slug).filter(slug => archetypeCardVariant(slug, "en"));
    expect(Object.keys(archetypeHonorCardCopy).sort()).toEqual([...slugs].sort());
    const actionCopy = /确认约定|確認約定|维持合作|維持合作|共同承担|共同承擔|first real step|small first attempt|small possibility|grand promise|a small experiment/i;
    const overclaim = /1080\s*[×x*]\s*1440|临床诊断|臨床診斷|科学人格|科學人格|职业胜任|職業勝任|真實人格|真实人格|人格定型|注定|天生就是|\b(?:clinically|diagnos(?:is|ed|tic)|scientifically proven|career fit|born to be|destined to|you always|you never)\b/i;
    const zhTwMixed = /[测简验边这说还样觉认话场过实温静轻风灵让气带脑别发为处顾鲜爱声许从动来无间样]/u;
    const seen = new Set<string>();
    for (const slug of slugs) {
      const quiz = load(slug);
      expect(Object.keys(archetypeHonorCardCopy[slug]).sort()).toEqual(quiz.profiles.map(profile => profile.id).sort());
      for (const profile of quiz.profiles) {
        expect(Object.keys(archetypeHonorCardCopy[slug][profile.id]).sort()).toEqual([...locales].sort());
        for (const locale of locales) {
          const key = `${slug}/${profile.id}/${locale}`;
          const { personalityTags, soulVerdict } = getArchetypeHonorCopy(slug, profile.id, locale);
          expect(new Set(personalityTags).size, key).toBe(3);
          for (const tag of personalityTags) {
            expect(tag, key).toMatch(locale === "en" ? /^(?=.{1,18}$)[A-Za-z]+(?:-[A-Za-z]+)*(?: [A-Za-z]+(?:-[A-Za-z]+)*){0,2}$/ : /^\p{Script=Han}{2,5}$/u);
            expect(tag, key).not.toMatch(actionCopy);
          }
          expect(soulVerdict, key).toMatch(locale === "en" ? /\b(?:you|your)\b/i : /你/u);
          expect(Array.from(soulVerdict).length, key).toBeGreaterThanOrEqual(locale === "en" ? 45 : 18);
          expect(Array.from(soulVerdict).length, key).toBeLessThanOrEqual(locale === "en" ? 95 : 34);
          expect([...personalityTags, soulVerdict].join(" "), key).not.toMatch(overclaim);
          expect(soulVerdict, key).not.toMatch(/…|\.\.\./u);
          if (locale === "zh-TW") {
            const traditional = [...personalityTags, soulVerdict].join(" ");
            expect(traditional, key).not.toMatch(zhTwMixed);
            expect(traditional, key).not.toMatch(/全域性|一齣手|里|一句[^，。！？]*一句/u);
          }
          const unique = `${locale}:${soulVerdict}`;
          expect(seen.has(unique), key).toBe(false);
          seen.add(unique);
        }
      }
    }
    expect(seen.size).toBe(807);
    expect(() => getArchetypeHonorCopy("wojak", "unknown-result", "en")).toThrow("Missing archetype honor copy");
  });

  it.each(locales)("renders the exact authored reading and second-person attribution for %s", locale => {
    const quiz = load("spirit-animal");
    const result = makeResult(quiz, [5, 4]);
    const profiles = quiz.profiles.filter(profile => result.profileIds.includes(profile.id));
    const reading = getArchetypeHonorCopy(quiz.slug, profiles[0].id, locale);
    const root = dom(renderToStaticMarkup(<ArchetypeHonorCard quiz={quiz} result={result} profiles={profiles} locale={locale} copy={value => value} />));
    const card = root.querySelector("[data-archetype-honor-card]")!;
    expect(card.textContent).toContain(archetypeResultCopy[locale].closest);
    expect(card.textContent).toContain(archetypeResultCopy[locale].runner);
    expect(card.querySelector("[data-archetype-verdict]")?.textContent).toBe(reading.soulVerdict);
    expect([...card.querySelectorAll("li")].map(item => item.textContent)).toEqual(reading.personalityTags);
  });

  it("uses source counts only for a distinct, non-zero runner-up and preserves ties", () => {
    const quiz = load("cyberpunk-edgerunners");
    expect(archetypeRunnerUp(quiz, makeResult(quiz, [5,4,3]))?.id).toBe(quiz.profiles[1].id);
    expect(archetypeRunnerUp(quiz, makeResult(quiz, [5,4,4]))).toBeUndefined();
    expect(archetypeRunnerUp(quiz, makeResult(quiz, [5,5,4]))).toBeUndefined();
    expect(archetypeRunnerUp(quiz, makeResult(quiz, [5]))).toBeUndefined();
  });

  it.each(["spirit-animal", "hazbin-hotel-character-quiz", "hogwarts-house-quiz", "bleach", "space-marine-chapter", "moon-phase"])("has one share area and keeps all tied guide links for %s", slug => {
    display.traditional = false;
    const quiz = load(slug);
    const result = makeResult(quiz, [5,5,5]);
    const root = dom(renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={result} locale="en" />));
    const card = root.querySelector("[data-archetype-honor-card]")!;
    expect(card.querySelector("button")).toBeNull();
    expect(card.getAttribute("data-archetype-state")).toBe("tied");
    expect(card.textContent).toContain("+1");
    expect(card.textContent).toContain(archetypeResultCopy.en.tieLine);
    expect(card.querySelector("[data-archetype-verdict]")).toBeNull();
    expect(root.querySelectorAll("[data-archetype-honor-actions]")).toHaveLength(1);
    expect(root.querySelector("[data-eight-quiz-personal-card], [data-space-marine-personal-card], [data-space-marine-share-card]")).toBeNull();
    for (const id of result.profileIds) expect(root.querySelector(`[href="/en/tests/explore/${slug}/results/${id}"]`)).not.toBeNull();
  });

  it.each(locales)("composes single, runner-up and tie share text without visitor data in %s", locale => {
    const url = archetypeCardUrl(locale, "wojak");
    expect(url).toBe(`https://fermatmind.com/${locale}/tests/explore/wojak`);
    const verdict = getArchetypeHonorCopy("wojak", "bloomer", locale).soulVerdict;
    const single = archetypeSharePayload(locale, "Wojak", ["Bloomer"], undefined, verdict, url);
    expect(single.text).toContain(verdict);
    const runner = archetypeSharePayload(locale, "Wojak", ["Bloomer"], "Doomer", undefined, url);
    expect(runner.text).toContain("Doomer");
    const tied = archetypeSharePayload(locale, "Wojak", ["Bloomer", "Doomer"], "Ignored", undefined, url);
    expect(tied.text).toContain("Bloomer · Doomer");
    expect(tied.text).not.toContain("Ignored");
    expect(tied.url).toBe(url);
  });

  it.each([true, false])("uses the native share sheet only on a coarse pointer (%s)", async coarse => {
    const quiz = load("wojak");
    const result = makeResult(quiz, [5, 3]);
    const profiles = quiz.profiles.filter(profile => result.profileIds.includes(profile.id));
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    const properties = {
      share: Object.getOwnPropertyDescriptor(navigator, "share"),
      clipboard: Object.getOwnPropertyDescriptor(navigator, "clipboard"),
    };
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: coarse })));
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const url = "https://fermatmind.com/en/tests/explore/wojak";
    try {
      render(<ArchetypeHonorCard quiz={quiz} locale="en" result={result} profiles={profiles} copy={value => value} />);
      const button = screen.getByRole("button", { name: "Share Result" });
      fireEvent.click(button);
      if (coarse) {
        await waitFor(() => expect(share).toHaveBeenCalledWith({ title: expect.any(String), text: expect.any(String), url }));
        expect(writeText).not.toHaveBeenCalled();
        share.mockRejectedValueOnce(new Error("Share unavailable"));
        fireEvent.click(button);
      } else {
        expect(share).not.toHaveBeenCalled();
      }
      await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining(url)));
      expect((await screen.findByRole("status")).textContent).toContain("Caption copied");
    } finally {
      cleanup();
      vi.unstubAllGlobals();
      for (const [key, descriptor] of Object.entries(properties)) {
        if (descriptor) Object.defineProperty(navigator, key, descriptor);
        else Reflect.deleteProperty(navigator, key);
      }
    }
  });

  it.each(["abstract-reasoning", "aptitude-test", "computer-literacy", "english-proficiency", "german-proficiency", "logical-reasoning", "number-series", "numerical-reasoning", "problem-solving-critical-thinking", "situational-judgement", "word-skills"])("keeps the Traditional Chinese RIASEC route for %s", slug => {
    display.traditional = true;
    const quiz = load(slug);
    const answers = Object.fromEntries(quiz.questions.map(question => [question.id, question.options[0].id]));
    const result = scoreQuestionnaire(quiz, answers);
    expect(result.status).toBe("complete");
    const root = dom(renderToStaticMarkup(<QuestionnaireNextSteps quiz={quiz} answers={answers} result={result} locale="zh" />));
    expect(root.querySelectorAll('a[href="/zh-TW/tests/holland-career-interest-test-riasec"]')).toHaveLength(1);
    expect(root.querySelector('a[href="/zh/tests/holland-career-interest-test-riasec"]')).toBeNull();
    display.traditional = false;
  });
});
