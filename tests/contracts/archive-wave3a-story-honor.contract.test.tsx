import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Wave3aStoryHonorCard } from "@/components/entertainment/Wave3aStoryHonorCard";
import { loadTraditionalLegacyStory } from "@/lib/i18n/zh-TW/legacyStories";
import { resolveFunQuiz } from "@/lib/entertainment/scoring";
import { quizPath, resultPath } from "@/lib/entertainment/guides";
import { entertainmentSearchPaths } from "@/lib/entertainment/searchEntries";
import { storySharePayload, storyHonorRunnerUp, wave3aStoryScope, wave3aStoryVariant, storyHonorLabels } from "@/lib/entertainment/wave3aStory";
import { getWave3aStoryHonorCopy, wave3aStoryHonorCorpus } from "@/lib/questionnaires/wave3aStoryHonorCopy";
import { isArchivedEntertainmentPath, isSharedDiscoverabilityDeniedPath } from "@/lib/seo/discoverabilityExposurePolicy";
import type { Answers, FunQuiz } from "@/lib/entertainment/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const locales = ["zh", "zh-TW", "en"] as const;
const load = (slug: string) => JSON.parse(readFileSync(`lib/entertainment/data/${slug}.json`, "utf8")) as FunQuiz;
const mixed = /全域性|齣|剋制|計劃|舞臺|靠譜|熱乎|鬆弛|哪兒|一會兒|里|一句[^，。！？]*一句|(\p{Script=Han}{2,4})\1|[简边测过让这实关对说觉温轻选岁脑话节]/u;
const blocked = /确认约定|確認約定|维持合作|維持合作|共同承担|共同承擔|first real step|small first attempt|small possibility|grand promise|a small experiment|临床诊断|臨床診斷|固定人格|career fit|1080\s*[×x]\s*1440/iu;

function replay(quiz: FunQuiz, answers: Answers, visit: (result: ReturnType<typeof resolveFunQuiz>) => void) {
  const value = resolveFunQuiz(quiz, answers);
  if (value.complete) { visit(value); return; }
  const question = quiz.questions.find(item => item.id === value.path.at(-1))!;
  for (const option of question.options) replay(quiz, { ...answers, [question.id]: option.id }, visit);
}

describe("wave 3A archived stories", () => {
  it("binds the exact cohort, authored endings and trilingual copy to the unchanged resolver", () => {
    const slugs = Object.keys(wave3aStoryScope);
    expect(slugs).toHaveLength(99);
    expect(slugs.filter(slug => wave3aStoryScope[slug].mechanism === "branch")).toHaveLength(11);
    expect(Object.keys(wave3aStoryHonorCorpus).sort()).toEqual([...slugs].sort());
    for (const slug of ["global-history-quiz", "after-bereavement-reflection", "after-childbirth-context-reflection",
      "trauma-response-reflection", "child-focus-activity-observations", "sudden-fear-reflection", "weton-story-preferences", "rice-purity-test"]) {
      expect(wave3aStoryVariant(slug)).toBeUndefined();
    }
    const verdicts = new Set<string>();
    for (const slug of slugs) {
      const quiz = load(slug);
      expect(wave3aStoryScope[slug].mechanism).toBe(quiz.mechanism);
      const witnessed = new Set<string>();
      replay(quiz, {}, result => result.resultIds.forEach(id => witnessed.add(id)));
      expect([...witnessed].sort(), slug).toEqual(quiz.results.map(entry => entry.id).sort());
      expect(Object.keys(wave3aStoryHonorCorpus[slug]).sort()).toEqual([...witnessed].sort());
      for (const id of witnessed) for (const locale of locales) {
        const { personalityTags, soulVerdict, shortTitle } = getWave3aStoryHonorCopy(slug, id, locale);
        const key = `${slug}/${id}/${locale}`;
        expect(new Set(personalityTags).size, key).toBe(3);
        expect(personalityTags.every(tag => (locale === "en"
          ? /^(?=.{1,18}$)[a-z]+(?:-[a-z]+)*(?: [a-z]+(?:-[a-z]+)*){0,2}$/iu : /^\p{Script=Han}{2,5}$/u).test(tag)), key).toBe(true);
        expect(soulVerdict, key).toMatch(locale === "en" ? /\b(?:you|your)\b/i : /你/u);
        expect(soulVerdict.length, key).toBeGreaterThanOrEqual(locale === "en" ? 45 : 18);
        expect(soulVerdict.length, key).toBeLessThanOrEqual(locale === "en" ? 95 : 34);
        expect([shortTitle, ...personalityTags, soulVerdict].join(" "), key).not.toMatch(blocked);
        if (locale === "zh") expect([shortTitle, ...personalityTags, soulVerdict].join(" "), key).not.toMatch(/讯息|重连结|慢步调/u);
        if (locale === "zh-TW") expect([shortTitle, ...personalityTags, soulVerdict].join(" "), key).not.toMatch(mixed);
        expect(quiz.results.find(entry => entry.id === id)!.summary[locale === "en" ? "en" : "zh"], key).not.toContain(soulVerdict);
        expect(verdicts.has(`${locale}:${soulVerdict}`), key).toBe(false);
        verdicts.add(`${locale}:${soulVerdict}`);
      }
      for (const locale of locales) {
        for (const path of [quizPath(locale, slug), ...quiz.results.map(ending => resultPath(locale, slug, ending.id))]) {
          expect(isArchivedEntertainmentPath(path), path).toBe(true);
          expect(isSharedDiscoverabilityDeniedPath(path), path).toBe(true);
          expect(entertainmentSearchPaths.has(path.replace(/^\/(zh-TW|zh|en)/u, "")), path).toBe(false);
        }
      }
    }
    expect(verdicts.size).toBe(906);
    expect(getWave3aStoryHonorCopy("group-chat-role", "signal", "zh").soulVerdict).toContain("群消息");
    expect(() => getWave3aStoryHonorCopy("group-chat-role", "missing", "zh-TW")).toThrow();
  });

  it("keeps ties and shows only a real positive unique lower score", () => {
    const quiz = load("group-chat-role");
    let single: ReturnType<typeof resolveFunQuiz> | undefined;
    let tied: ReturnType<typeof resolveFunQuiz> | undefined;
    replay(quiz, {}, result => {
      if (!single && storyHonorRunnerUp(quiz, result)) single = result;
      if (!tied && result.resultIds.length > 1) tied = result;
    });
    expect(single).toBeDefined();
    expect(tied).toBeDefined();
    const render = (result: ReturnType<typeof resolveFunQuiz>) => renderToStaticMarkup(<Wave3aStoryHonorCard quiz={quiz} locale="en" textLocale="en" result={result} translate={value => value} onRetake={() => {}} />);
    expect(render(single!)).toContain(storyHonorRunnerUp(quiz, single!)!.title.en);
    expect(render(tied!)).toContain(storyHonorLabels.en.tied);
    for (const locale of locales) {
      const html = renderToStaticMarkup(<Wave3aStoryHonorCard quiz={quiz} locale={locale} textLocale={locale === "en" ? "en" : "zh"} result={tied!} translate={value => value} onRetake={() => {}} />);
      expect(html).toContain(">||</span>");
    }
    expect(storyHonorRunnerUp(quiz, tied!)).toBeUndefined();
    const branch = load("house-of-doors");
    replay(branch, {}, result => {
      expect(storyHonorRunnerUp(branch, result)).toBeUndefined();
      expect(result.resultIds).toHaveLength(1);
      expect(Object.values(result.scores).every(score => score === 0)).toBe(true);
    });
    const url = "https://fermatmind.com/en/tests/explore/house-of-doors";
    const share = storySharePayload("en", "House of Doors", ["The Room of Possible Pieces"], "branch", url);
    expect(share.text).toContain("found my way");
    expect(share.url).toBe(url);
    expect(share.text).not.toMatch(/scores|runner-up|points/iu);
  });

  it("keeps real traditional replays and archived metadata for entries and parameter-compatible guides", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      const generic = await import("@/app/(localized)/[locale]/tests/play/[slug]/page");
      const genericGuide = await import("@/app/(localized)/[locale]/tests/play/[slug]/results/[portrait]/page");
      const traditional = await import("@/app/(traditional)/zh-TW/tests/play/[slug]/page");
      const traditionalGuide = await import("@/app/(traditional)/zh-TW/tests/play/[slug]/results/[portrait]/page");
      for (const slug of ["group-chat-role", "house-of-doors", "changan-history-quiz"]) {
        const quiz = load(slug);
        const tw = (await loadTraditionalLegacyStory(slug))?.quiz;
        if (tw) replay(quiz, {}, result => expect(result.resultIds.every(id => tw.results.some(ending => ending.id === id))).toBe(true));
        for (const locale of locales) {
          const params = Promise.resolve({ slug, locale, portrait: quiz.results[0].id });
          const landing = await (locale === "zh-TW" ? traditional : generic).generateMetadata({ params });
          const guide = await (locale === "zh-TW" ? traditionalGuide : genericGuide).generateMetadata({ params });
          for (const [meta, path] of [[landing, quizPath(locale, slug)], [guide, resultPath(locale, slug, quiz.results[0].id)]] as const) {
            expect(meta.robots).toMatchObject({ index: false, follow: true });
            expect(new URL(String(meta.alternates?.canonical), "https://fermatmind.com").href).toBe(`https://fermatmind.com${path}`);
            expect(meta.alternates?.languages).toBeUndefined();
          }
        }
      }
    } finally { vi.unstubAllEnvs(); }
  });
});
