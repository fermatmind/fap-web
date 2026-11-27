import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { StyleImpressionClient } from "@/components/questionnaires/StyleImpressionClient";
import { Wave3bArchetypeHonorCard } from "@/components/questionnaires/Wave3bArchetypeHonorCard";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { QuestionnaireNextSteps } from "@/components/questionnaires/QuestionnaireReports";
import { QuestionnaireWorkValuesReport } from "@/components/questionnaires/QuestionnaireWorkValuesReport";
import { archetypeCardVariant, archetypeCorePath, archetypeRunnerUp, wave3bArchetypeVariant } from "@/lib/questionnaires/archetypeResultCard";
import { getWave3bArchetypeHonorCopy, wave3bArchetypeHonorCorpus, wave3bArchetypeTitles } from "@/lib/questionnaires/wave3bArchetypeHonorCopy";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { scorePatronus } from "@/lib/questionnaires/patronus";
import { isArchivedEntertainmentPath, isSharedDiscoverabilityDeniedPath } from "@/lib/seo/discoverabilityExposurePolicy";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const themes = {
  neon: ["apocalypse-survival-type-test", "euphoria-character-quiz", "star-wars-character", "villain-era-archetype-test", "wednesday-addams-character"],
  gold: ["avatar-bender-quiz", "next-life", "patronus-quiz", "soldier-poet-king-quiz", "sake-type"],
  dusk: ["big-fish-energy-test", "decade-aesthetic-test", "delulu-test", "found-family-role-test", "ginny-and-georgia-character-quiz", "hundred-acre-wood-friend-quiz", "style-impression-preferences", "travel-personality-test"],
  slate: ["intelligence-type-test", "leadership-style", "values-assessment"],
} as const;
const bigFive = new Set(["decade-aesthetic-test", "next-life", "sake-type", "style-impression-preferences", "travel-personality-test"]);
const slugs = Object.values(themes).flat();
const locales = ["zh", "zh-TW", "en"] as const;
const mixed = /全域性|齣|剋制|計劃|舞臺|靠譜|熱乎|鬆弛|哪兒|一會兒|里|一句[^，。！？]*一句|(\p{Script=Han}{2,4})\1|[简边测过让这实关对说觉温轻选岁脑话节]/u;
const blocked = /确认约定|確認約定|维持合作|維持合作|共同承担|共同承擔|first real step|small first attempt|small possibility|grand promise|a small experiment|临床诊断|臨床診斷|科学人格|科學人格|职业胜任|職業勝任|天生就是|注定|\b(?:diagnos(?:is|ed|tic)|scientifically proven|career fit|born to be|you always|you never)\b|1080\s*[×x]\s*1440/iu;
const load = (slug: string) => JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;

function preferring(quiz: Questionnaire, direction: string) {
  const totals = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  return Object.fromEntries(quiz.questions.map(question => {
    const prioritized = (a: typeof question.options[number], b: typeof a) =>
      Number(b.directionId === direction) - Number(a.directionId === direction) || totals[a.directionId] - totals[b.directionId];
    const options = [...question.options].sort(prioritized);
    if (question.interaction === "rank") {
      options.forEach((option, index) => { totals[option.directionId] += options.length - index - 1; });
      return [question.id, JSON.stringify(options.map(option => option.id))];
    }
    totals[options[0].directionId]++;
    return [question.id, options[0].id];
  }));
}

describe("Wave 3B archived archetype honor cards", () => {
  it("matches each approved palette and bridge and covers every reachable outcome in 63 locale paths", () => {
    expect(Object.keys(wave3bArchetypeHonorCorpus).sort()).toEqual([...slugs].sort());
    expect(Object.keys(wave3bArchetypeTitles).sort()).toEqual([...slugs].sort());
    const catalog = JSON.parse(readFileSync("lib/questionnaires/catalog.json", "utf-8")) as { slug: string }[];
    expect(catalog.map(entry => entry.slug).filter(wave3bArchetypeVariant).sort()).toEqual([...slugs].sort());
    expect(Object.values(themes).reduce((count, group) => count + group.length, 0) * locales.length).toBe(63);
    const verdicts = new Set<string>();
    for (const [theme, group] of Object.entries(themes)) for (const slug of group) {
      const quiz = load(slug);
      const ids = quiz.profiles.map(profile => profile.id);
      expect(Object.keys(wave3bArchetypeHonorCorpus[slug]).sort()).toEqual([...ids].sort());
      const target = theme === "slate" ? "RIASEC" : bigFive.has(slug) ? "BIG5_OCEAN" : "MBTI";
      for (const locale of locales) expect(archetypeCardVariant(slug, locale)).toEqual({ theme, target });
      for (const profile of quiz.profiles) {
        const outcome = quiz.kind === "patronus20" ? scorePatronus(quiz, quiz.patronus!.witnesses[profile.id]) : scoreArchetypeQuestionnaire(quiz, preferring(quiz, profile.directionIds[0]));
        expect(outcome, slug + "/" + profile.id).toMatchObject({ status: "complete", profileIds: [profile.id] });
        expect(Object.keys(wave3bArchetypeHonorCorpus[slug][profile.id]).sort()).toEqual([...locales].sort());
        for (const locale of locales) {
          const key = `${slug}/${profile.id}/${locale}`;
          const { personalityTags, soulVerdict } = getWave3bArchetypeHonorCopy(slug, profile.id, locale);
          expect(new Set(personalityTags).size, key).toBe(3);
          for (const tag of personalityTags) expect(tag, key).toMatch(locale === "en" ? /^(?=.{1,18}$)[a-z]+(?:-[a-z]+)*(?: [a-z]+(?:-[a-z]+)*){0,2}$/iu : /^\p{Script=Han}{2,5}$/u);
          expect(soulVerdict, key).toMatch(locale === "en" ? /^(?=.{45,95}$).*\b(?:you|your)\b/iu : /^(?=.{18,39}$).*你/u);
          expect(soulVerdict, key).not.toMatch(/…|\.\.\./u);
          const text = [wave3bArchetypeTitles[slug][locale], ...personalityTags, soulVerdict].join(" ");
          expect(text, key).not.toMatch(blocked);
          if (locale === "zh-TW") expect(text, key).not.toMatch(mixed);
          if (locale === "zh") expect(text, key).not.toMatch(/讯息|资讯|软体|萤幕|回馈|网路|回覆|重连结|慢步调/u);
          expect(verdicts.has(locale + soulVerdict), key).toBe(false);
          verdicts.add(locale + soulVerdict);
        }
      }
    }
    expect(verdicts.size).toBe(477);
    expect(() => getWave3bArchetypeHonorCopy("patronus-quiz", "missing", "en")).toThrow();
  });

  it("preserves exact Patronus distance ranking and omits any equally ranked runner-up", () => {
    const quiz = load("patronus-quiz");
    const result = scorePatronus(quiz, quiz.patronus!.witnesses.doe);
    if (result.status !== "complete") throw Error("Expected the original completed witness");
    const next = Object.entries(result.distanceUnits).sort((a, b) => a[1] - b[1]);
    expect(next[1][1]).toBeLessThan(next[2][1]);
    expect(archetypeRunnerUp(quiz, result)?.id).toBe(next[1][0]);
    expect(archetypeRunnerUp(quiz, { ...result, distanceUnits: { ...result.distanceUnits, [next[2][0]]: next[1][1] } })).toBeUndefined();
    expect(archetypeRunnerUp(quiz, { ...result, profileIds: ["doe", next[1][0]] })).toBeUndefined();
    const html = renderToStaticMarkup(<Wave3bArchetypeHonorCard quiz={quiz} result={result} profiles={quiz.profiles.filter(profile => profile.id === "doe")} locale="en" copy={x => x} />);
    expect(html).toContain("/images/quiz-portraits/patronus-quiz/doe.svg");
    expect(html).toContain("Also a touch of");
  });

  it.each(["avatar-bender-quiz", "soldier-poet-king-quiz", "values-assessment", "travel-personality-test"])("mounts a single card, keeps tied details and links one assessment for %s", slug => {
    const quiz = load(slug);
    const contexts = [quiz.profiles[0].id, quiz.profiles[1].id];
    const result = { status: "complete" as const, answered: quiz.questions.length, counts: Object.fromEntries(quiz.directions.map(d => [d.id, contexts.includes(d.id) ? 5 : 1])), profileIds: contexts };
    const answers = preferring(quiz, quiz.directions[0].id);
    const locale = "en";
    const report = slug === "values-assessment" ? <QuestionnaireWorkValuesReport quiz={quiz} result={result} locale={locale} answers={answers} /> : <QuestionnaireArchetypeReport quiz={quiz} result={result} locale={locale} answers={answers} />;
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<>{report}<QuestionnaireNextSteps quiz={quiz} result={result} answers={answers} locale={locale} /></>);
    expect(root.querySelectorAll("[data-archetype-honor-card][data-archetype-state=tied]")).toHaveLength(1);
    expect(root.querySelector("[data-archetype-art] > div > span")?.textContent).toBe("||");
    expect(root.querySelector("[data-archetype-honor-card] button")).toBeNull();
    expect(root.querySelectorAll("[data-archetype-honor-actions]")).toHaveLength(1);
    expect(root.querySelectorAll("[data-archetype-core-assessment] a")).toHaveLength(1);
    expect(root.querySelector("[data-archetype-core-assessment] a")?.getAttribute("href")).toBe(archetypeCorePath(locale, wave3bArchetypeVariant(slug)!.target));
    expect(root.querySelector("[data-archive-next-step]")).toBeNull();
    for (const id of contexts) expect(root.querySelector(`[href="${questionnaireGuidePath(locale, slug, id)}"]`)).not.toBeNull();
  });

  it("runs the stand-alone style engine with a public-only share and one separate Big Five link", async () => {
    const quiz = load("style-impression-preferences");
    const answers = preferring(quiz, quiz.directions[0].id);
    const clipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    try {
      const { container } = render(<StyleImpressionClient quiz={quiz} locale="en" />);
      fireEvent.click(container.querySelector("button[data-explore-start]")!);
      for (const question of quiz.questions) {
        fireEvent.click(container.querySelector(`input[value="${answers[question.id]}"]`)!);
        fireEvent.click(container.querySelector("button[data-questionnaire-next]")!);
      }
      expect(container.querySelectorAll("[data-archetype-honor-card]")).toHaveLength(1);
      expect(container.querySelectorAll("[data-sip-count]")).toHaveLength(8);
      expect(container.querySelector("[data-archetype-core-assessment=BIG5_OCEAN] a")?.getAttribute("href")).toBe(archetypeCorePath("en", "BIG5_OCEAN"));
      const controls = container.querySelector("[data-archetype-honor-actions]")!;
      fireEvent.click(controls.querySelectorAll("button")[2]);
      await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${quiz.title.en}\nhttps://fermatmind.com/en/tests/explore/${quiz.slug}`));
    } finally {
      cleanup();
      if (clipboard) Object.defineProperty(navigator, "clipboard", clipboard);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("keeps every landing and public guide archived in all locales", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      const landing = await import("@/components/questionnaires/QuestionnairePage");
      const guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const tw = await import("@/app/(traditional)/zh-TW/[...path]/page");
      for (const slug of slugs) for (const locale of locales) {
        for (const id of [undefined, ...load(slug).profiles.map(profile => profile.id)]) {
          const params = { locale, slug, profile: id!, portrait: id! };
          const canonical = id ? questionnaireGuidePath(locale, slug, id) : questionnairePath(locale, slug);
          const metadata = locale === "zh-TW"
            ? await tw.generateMetadata({ params: Promise.resolve({ path: canonical.split("/").slice(2) }) })
            : await (id ? guide : landing).generateMetadata({ params: Promise.resolve(params) });
          expect(metadata.robots, canonical).toMatchObject({ index: false, follow: true });
          expect(new URL(String(metadata.alternates?.canonical), "https://fermatmind.com").href, canonical).toBe("https://fermatmind.com" + canonical);
          expect(metadata.alternates?.languages, canonical).toBeUndefined();
          expect(isArchivedEntertainmentPath(canonical), canonical).toBe(true);
          expect(isSharedDiscoverabilityDeniedPath(canonical), canonical).toBe(true);
          expect(shouldIncludeInSitemap(canonical), canonical).toBe(false);
        }
      }
    } finally {
      vi.unstubAllEnvs();
    }
  }, 120000);
});
