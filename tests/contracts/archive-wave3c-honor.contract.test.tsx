import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Wave3cResultCard } from "@/components/questionnaires/Wave3cResultCard";
import { QuestionnaireNextSteps } from "@/components/questionnaires/QuestionnaireReports";
import { archetypeCorePath } from "@/lib/questionnaires/archetypeResultCard";
import { scoreMostLeast } from "@/lib/questionnaires/mostLeast";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import { getWave3cHonorCopy } from "@/lib/questionnaires/wave3cHonorCopy";
import { wave3cCardData } from "@/lib/questionnaires/wave3cResult";
import { wave3cScope } from "@/lib/questionnaires/wave3cScope";
import { isArchivedEntertainmentPath, isSharedDiscoverabilityDeniedPath } from "@/lib/seo/discoverabilityExposurePolicy";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const locales = ["zh", "zh-TW", "en"] as const;
const slugs = Object.keys(wave3cScope) as (keyof typeof wave3cScope)[];
const load = (slug: string) => JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
const localize = (text: Text) => text.en;
const english = /^(?=.{1,18}$)[a-z]+(?:-[a-z]+)*(?: [a-z]+(?:-[a-z]+)*){0,2}$/iu;
const blocked = /确认约定|確認約定|维持合作|維持合作|共同承担|共同承擔|有得分项|可查错项|至少七成五|Correct Items|Review Ready|75% or More|first real step|small first attempt|small possibility|grand promise|a small experiment|临床诊断|臨床診斷|招聘胜任|職業勝任|天生就是|注定|scientifically proven|career fit|you always|you never|1080\s*[x×]\s*1440/iu;
const tw = /全域性|齣|剋制|計劃|舞臺|靠譜|熱乎|鬆弛|哪兒|一會兒|里|一句[^，。！？]*一句|(\p{Script=Han}{2,4})\1|[简边测过让这实关对说觉温轻选岁脑话节]/u;
const zh = /讯息|资讯|软体|萤幕|回馈|网路|回覆|重连结|慢步调/u;

describe("Wave 3C archived metric honor cards", () => {
  it("pins 52 scoped tests to their true shell and validates each localized reading state", () => {
    expect(slugs).toHaveLength(52);
    expect(Object.values(wave3cScope).reduce<Record<string, number>>((counts, { shell }) => {
      counts[shell] = (counts[shell] ?? 0) + 1;
      return counts;
    }, {})).toEqual({ dimensions: 23, scalar: 7, practice: 22 });
    let localizedStates = 0;
    const exerciseKinds = new Set(["practice", "critical30", "technical30", "afqt32", "reasoning18", "written-coordination"]);
    for (const slug of slugs) {
      const quiz = load(slug);
      const variant = wave3cScope[slug];
      expect(quiz.slug).toBe(slug);
      expect(variant.shell === "practice").toBe(exerciseKinds.has(quiz.kind));
      if (variant.shell === "scalar") expect(quiz.kind === "preparation-actions20" || quiz.directions.length === 1).toBe(true);
      for (const locale of locales) {
        const check = (id: Parameters<typeof getWave3cHonorCopy>[1], fields = false) => {
          localizedStates++;
          const { personalityTags, soulVerdict } = getWave3cHonorCopy(slug, id, locale, fields);
          const key = `${slug}/${id}/${locale}`;
          expect(new Set(personalityTags).size, key).toBe(3);
          for (const tag of personalityTags) expect(tag, key).toMatch(locale === "en" ? english : /^\p{Script=Han}{2,5}$/u);
          expect(soulVerdict, key).toMatch(locale === "en" ? /^(?=.{45,88}$).*\b(?:you|your)\b/iu : /^(?=.{18,38}$).*你/u);
          const copy = [...personalityTags, soulVerdict].join(" ");
          expect(copy, key).not.toMatch(blocked);
          if (locale === "zh-TW") expect(copy, key).not.toMatch(tw);
          if (locale === "zh") expect(copy, key).not.toMatch(zh);
        };
        if (variant.shell === "practice") {
          for (const id of ["review", "building", "strong", "perfect"] as const) {
            check(id);
            if (slug === "written-coordination-practice") check(id, true);
          }
          if (slug === "written-coordination-practice") check("missing", true);
        } else {
          check("overview");
          if (["likert", "mini-habit", "preparation-actions20"].includes(quiz.kind)) check("missing");
          if (["learning-style", "procrastinator-type-test", "mote-type", "arabic-personality-compass"].includes(slug)) check("tied");
        }
      }
    }
    expect(localizedStates).toBe(456);
  });

  it.each(slugs.filter(slug => wave3cScope[slug].shell !== "practice"))("mounts real readouts for %s using the original scorer", slug => {
    const quiz = load(slug);
    const answers = Object.fromEntries(quiz.questions.map(question => [question.id, question.options[0].id]));
    const result = quiz.kind === "most-least" ? scoreMostLeast(quiz,
      Object.fromEntries(quiz.questions.map(question => [question.id, { most: question.options[0].id, least: question.options[1].id }])))
      : scoreQuestionnaire(quiz, answers);
    if (result.status !== "complete") throw new Error(`${slug}: expected complete fixture, got ${result.status}`);
    const data = wave3cCardData(quiz, result, "en", localize);
    expect(data?.metrics.kind).toBe(wave3cScope[slug].shell);
    expect(data?.matches.every(match => match.name.length > 0)).toBe(true);
    const view = render(<>
      <Wave3cResultCard quiz={quiz} result={result} locale="en" onRetake={() => {}} />
      {quiz.kind !== "most-least" && <QuestionnaireNextSteps quiz={quiz} result={result as ReturnType<typeof scoreQuestionnaire>} answers={answers} locale="en" />}
    </>);
    expect(view.container.querySelectorAll("[data-archetype-honor-card]")).toHaveLength(1);
    expect(view.container.querySelector("[data-archetype-honor-card] button")).toBeNull();
    expect(view.container.querySelectorAll("[data-archetype-honor-actions] button")).toHaveLength(4);
    if (quiz.kind !== "most-least") {
      expect(view.container.querySelectorAll("[data-archetype-core-assessment] a")).toHaveLength(1);
      expect(view.container.querySelector("[data-archetype-core-assessment] a")?.getAttribute("href")).toBe(archetypeCorePath("en", wave3cScope[slug].target));
    }
    cleanup();
    if (["likert", "mini-habit", "preparation-actions20"].includes(quiz.kind)) {
      const missing = scoreQuestionnaire(quiz, Object.fromEntries(quiz.questions.map(q => [q.id, q.options.find(o => o.id === "na")!.id])));
      if (missing.status !== "complete") throw new Error("Expected a completed unscored attempt");
      expect(wave3cCardData(quiz, missing, "en", localize)?.readingId).toBe("missing");
    }
  });

  it.each(slugs.filter(slug => wave3cScope[slug].shell === "practice"))("covers reachable practice bands for %s", slug => {
    const quiz = load(slug);
    const total = quiz.kind === "written-coordination" ? 6 : quiz.questions.length;
    const samples = { review: 0, building: Math.ceil(total / 2), strong: Math.ceil(total * .75), perfect: total };
    for (const [id, correct] of Object.entries(samples)) {
      const data = wave3cCardData(quiz, { practice: { correct, total } }, "en", localize);
      expect(data).toMatchObject({ readingId: id, metrics: { kind: "practice", scale: { value: correct / total * 100 } } });
    }
  });

  it("uses a real practice result, leaves missing readouts blank and keeps private scores out of sharing", async () => {
    const bank = load("python-test");
    const quiz = load("personal-finance-literacy");
    const answers = Object.fromEntries(bank.questions.map(q => [q.id, q.correctOptionId]));
    const result = scoreQuestionnaire(bank, answers);
    if (result.status !== "complete" || !("practice" in result)) throw Error("Expected completed practice");
    expect(wave3cCardData(bank, result, "en", localize)?.readingId).toBe("perfect");
    expect(wave3cCardData(bank, { practice: { correct: 15, total: 20 } }, "en", localize)).toMatchObject({
      readingId: "strong", metrics: { scale: { display: "15 / 20 · 75%" } },
    });
    expect(wave3cCardData(load("written-coordination-practice"), { practice: { correct: 0, total: 0 }, fields: true }, "en", localize))
      .toMatchObject({ readingId: "missing", metrics: { scale: undefined } });
    const writeText = vi.fn().mockResolvedValue(undefined);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    try {
      const { container } = render(<Wave3cResultCard quiz={quiz} result={{ practice: { correct: 15, total: 20 } }} locale="en" onRetake={() => {}} />);
      expect(container.querySelector("[data-honor-reading]")?.textContent).toBe("15 / 20 · 75%");
      fireEvent.click(container.querySelectorAll("[data-archetype-honor-actions] button")[2]);
      await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${quiz.title.en}\nhttps://fermatmind.com/en/tests/explore/${quiz.slug}`));
    } finally {
      cleanup();
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("preserves preparation domains and genuine ties without manufacturing an aggregate", () => {
    const preparation = load("remote-work");
    const result = scoreQuestionnaire(preparation, Object.fromEntries(preparation.questions.map((q, i) => [q.id, i === 0 ? "na" : "3"])));
    if (result.status !== "complete" || !("preparationActions20" in result)) throw Error("Expected completed preparation");
    expect(wave3cCardData(preparation, result, "en", localize)).toMatchObject({
      readingId: "missing", metrics: { kind: "scalar", scale: undefined },
    });
    const quiz = load("learning-style");
    const tied = scoreQuestionnaire(quiz, Object.fromEntries(quiz.questions.map(q => [q.id, q.options.find(option => option.score === 3)!.id])));
    if (tied.status !== "complete") throw Error("Expected a completed equal-mean fixture");
    const { container } = render(<Wave3cResultCard quiz={quiz} result={tied} locale="en" onRetake={() => {}} />);
    expect(container.querySelector("[data-honor-tie-mark]")?.textContent).toBe("||");
    expect(container.querySelector("[data-honor-full-ties]")?.textContent).toContain("4");
    cleanup();
  });

  it("keeps all 156 entries and every guide outside both discoverability feeds", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      const landing = await import("@/components/questionnaires/QuestionnairePage");
      const guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const traditional = await import("@/app/(traditional)/zh-TW/[...path]/page");
      for (const slug of slugs) for (const locale of locales) {
        for (const id of [undefined, ...load(slug).profiles.map(profile => profile.id)]) {
          const params = { locale, slug, profile: id!, portrait: id! };
          const canonical = id ? questionnaireGuidePath(locale, slug, id) : questionnairePath(locale, slug);
          const metadata = locale === "zh-TW"
            ? await traditional.generateMetadata({ params: Promise.resolve({ path: canonical.split("/").slice(2) }) })
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
