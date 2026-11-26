import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Wave2aHonorCard } from "@/components/questionnaires/Wave2aHonorCard";
import { getArchetypeHonorCopy } from "@/lib/questionnaires/archetypeHonorCardCopy";
import { archetypeCardUrl, archetypeCorePath } from "@/lib/questionnaires/archetypeResultCard";
import { archetypeSharePayload } from "@/lib/questionnaires/archetypeResultShare";
import { gta6Profiles } from "@/lib/questionnaires/gta6CharacterQuiz";
import { mentalAgeStyles } from "@/lib/questionnaires/mentalAge";
import { getWave2aHonorCopy, wave2aHonorCopy } from "@/lib/questionnaires/wave2aHonorCopy";
import { ageHonorCopy, directionalResultLabels, wave2aTitles, wave2aVariant } from "@/lib/questionnaires/wave2aResult";
import type { Questionnaire } from "@/lib/questionnaires/types";

const locales = ["zh", "zh-TW", "en"] as const;
const load = (slug: string) => JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
const directionalSlugs = ["adult-age-preferences", "response-color", "love-personality", "relationship-values", "likable-person-test"] as const;
const html = (markup: string) => {
  const root = document.createElement("div");
  root.innerHTML = markup;
  return root;
};

describe("wave 2A completed-result honor cards", () => {
  it("binds the ten identities, 28 locale paths and one same-language assessment", () => {
    const slugs = Object.keys(wave2aTitles);
    expect(slugs).toHaveLength(10);
    expect(slugs.flatMap(slug => locales.filter(locale => wave2aVariant(slug, locale)))).toHaveLength(28);
    expect(wave2aVariant("chiikawa", "zh")).toBeUndefined();
    expect(wave2aVariant("chiikawa", "en")).toBeUndefined();
    for (const slug of slugs) for (const locale of locales) {
      const variant = wave2aVariant(slug, locale);
      if (variant) {
        expect(archetypeCorePath(locale, variant.target)).toMatch(new RegExp(`^/${locale}/tests/[^?#]+$`));
        expect(archetypeCardUrl(locale, slug)).toBe(`https://fermatmind.com/${locale}/tests/explore/${slug}`);
      }
    }
  });

  it("covers every profile or band with independent bounded three-language copy", () => {
    const slugs = Object.keys(wave2aTitles).filter(slug => slug !== "chiikawa");
    expect(Object.keys(wave2aHonorCopy).sort()).toEqual(slugs.sort());
    const blocked = /确认约定|確認約定|维持合作|維持合作|共同承担|共同承擔|first real step|small first attempt|small possibility|grand promise|a small experiment|臨床診斷|临床诊断|天生就是|職業勝任|职业胜任|scientifically proven|\bdiagnos(?:is|tic|ed)\b|1080\s*[×x*]\s*1440/iu;
    const mixed = /全域性|齣|剋制|計劃|舞臺|靠譜|熱乎|鬆弛|哪兒|一會兒|里|一句[^，。！？]*一句|(\p{Script=Han}{2,4})\1|[简边测过让这实关对说觉温轻选岁脑话节]/u;
    const seen = new Set<string>();
    for (const slug of slugs) {
      const ids = slug === "gta-6-character-quiz" ? gta6Profiles.map(p => p.id) : slug === "mental-age" ? mentalAgeStyles.map(p => String(p.min)) : load(slug).profiles.map(p => p.id);
      expect(Object.keys(wave2aHonorCopy[slug]).sort()).toEqual([...ids].sort());
      for (const id of ids) for (const locale of locales) {
        const key = `${slug}/${id}/${locale}`;
        const { personalityTags, soulVerdict } = getWave2aHonorCopy(slug, id, locale);
        expect(new Set(personalityTags).size, key).toBe(3);
        expect(personalityTags.every(tag => (locale === "en" ? /^(?=.{1,18}$)[a-z]+(?:-[a-z]+)*(?: [a-z]+(?:-[a-z]+)*){0,2}$/iu : /^\p{Script=Han}{2,5}$/u).test(tag)), key).toBeTruthy();
        expect(soulVerdict, key).toMatch(locale === "en" ? /\b(?:you|your)\b/iu : /你/u);
        expect(Array.from(soulVerdict).length, key).toBeGreaterThanOrEqual(locale === "en" ? 45 : 18);
        expect(Array.from(soulVerdict).length, key).toBeLessThanOrEqual(locale === "en" ? 95 : 34);
        expect([...personalityTags, soulVerdict].join(" "), key).not.toMatch(blocked);
        if (locale === "zh-TW") expect([...personalityTags, soulVerdict].join(" "), key).not.toMatch(mixed);
        expect(seen.has(`${locale}:${soulVerdict}`), key).toBe(false);
        seen.add(`${locale}:${soulVerdict}`);
      }
    }
    expect(seen.size).toBe(369);
    for (const p of load("chiikawa").profiles) {
      const copy = getArchetypeHonorCopy("chiikawa", p.id, "zh-TW");
      expect(copy.soulVerdict).toContain("你");
      expect(copy.personalityTags).toHaveLength(3);
    }
    expect(() => getWave2aHonorCopy("mental-age", "17", "en")).toThrow("Missing wave 2A honor copy");
  });

  it.each(directionalSlugs)("keeps raw leaders and attaches the existing joint result for %s", slug => {
    const quiz = load(slug);
    const [a, b, ...rest] = quiz.directions;
    const leaders = [a.id, b.id];
    const existing = quiz.profiles.find(p => p.directionIds.length === 2 && leaders.every(id => p.directionIds.includes(id)))!;
    const result = { status: "complete", answered: quiz.questions.length, profileId: existing.id, leaders, counts: Object.fromEntries([[a.id, 8], [b.id, 8], ...rest.map(d => [d.id, 1])]) } as const;
    const props = directionalResultLabels(quiz, result, "zh-TW", value => value);
    expect(props.matches.map(p => p.id)).toEqual(leaders);
    expect(props.runnerUp).toBeUndefined();
    const root = html(renderToStaticMarkup(<Wave2aHonorCard slug={slug} locale="zh-TW" readingId={existing.id} {...props} />));
    expect(root.querySelector("[data-archetype-state=tied]")?.textContent).toContain("同分並列");
    expect(root.querySelector("[data-archetype-verdict]")?.textContent).toBe(getWave2aHonorCopy(slug, existing.id, "zh-TW").soulVerdict);
    expect(root.querySelectorAll("[data-archetype-honor-card] button")).toHaveLength(0);
    expect(root.querySelectorAll("[data-honor-action-spacing] [data-archetype-honor-actions]")).toHaveLength(1);
  });

  it("keeps the actual-age number and exact signed gap out of transferable share text", () => {
    const contrast = ageHonorCopy("zh", 26, -5);
    expect(contrast.contrast).toBe("比实际年龄小 5 岁");
    const canonical = archetypeCardUrl("zh", "mental-age");
    const payload = archetypeSharePayload("zh", "心理年龄", [contrast.name], undefined, undefined, canonical, contrast.share);
    expect(payload.url).toBe("https://fermatmind.com/zh/tests/explore/mental-age");
    expect(payload.text).toContain(contrast.share);
    expect(payload.text).not.toMatch(/31|5 岁|实际年龄/);
    expect(ageHonorCopy("zh-TW", 26, null).contrast).toBeUndefined();
    expect(ageHonorCopy("en", 26, 0).contrast).toBe("Same as your actual age");
  });
});
