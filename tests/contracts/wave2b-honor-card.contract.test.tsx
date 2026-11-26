import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Wave2bHonorCard } from "@/components/questionnaires/Wave2bHonorCard";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { archetypeCardUrl } from "@/lib/questionnaires/archetypeResultCard";
import { metricSharePayload } from "@/lib/questionnaires/honorResultMetrics";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { getWave2bHonorCopy } from "@/lib/questionnaires/wave2bHonorCopy";
import { wave2bCardData, wave2bPracticeBand, wave2bPracticeBands } from "@/lib/questionnaires/wave2bResult";
import { wave2bMultidimensional, wave2bPractices, wave2bScalars, wave2bVariant } from "@/lib/questionnaires/wave2bScope";

// The result IDs are derived from the authored banks. Independent axes deliberately have
// one unclassified overview; profile IDs there are guide IDs, not personal result IDs.
const locales = ["zh", "zh-TW", "en"] as const;
const slugs = [...wave2bMultidimensional, ...wave2bScalars, ...wave2bPractices];
const load = (slug: string) => JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
const blocked = /确认约定|確認約定|维持合作|維持合作|共同承担|共同承擔|first real step|small first attempt|small possibility|grand promise|a small experiment|臨床診斷|临床诊断|職業勝任力|职业胜任力|scientifically proven|population percentile|1080\s*[×x]\s*1440/iu;
const mixed = /全域性|齣|剋制|計劃|舞臺|靠譜|熱乎|鬆弛|哪兒|一會兒|里|一句[^，。！？]*一句|(\p{Script=Han}{2,4})\1|[简边测过让这实关对说觉温轻选岁脑话节]/u;

function readingIds(quiz: Questionnaire) {
  if (quiz.kind === "practice") return [...wave2bPracticeBands];
  if (quiz.kind === "alignment") return [...quiz.profiles.map(p => p.id), "tied"];
  if (quiz.kind === "political-coordinates") return [...quiz.profiles.map(p => p.id), "tied", "partial", "missing"];
  if (quiz.kind === "extraversion" || quiz.kind === "optimism") return [...quiz.profiles.map(p => p.id), "boundary", "missing"];
  if (quiz.kind === "likert") return [...quiz.directions.map(d => d.id), "tied", "missing"];
  if (quiz.kind === "affection") return ["overview", "missing"];
  if (["attachment", "secs", "parenting-practices"].includes(quiz.kind)) return ["overview", "missing"];
  return ["overview"];
}

describe("wave 2B result presentation", () => {
  it("bounds scope to the 123 named locale routes and covers every reachable copy state", () => {
    expect([wave2bMultidimensional.length, wave2bScalars.length, wave2bPractices.length]).toEqual([27, 2, 12]);
    expect(new Set(slugs.flatMap(slug => locales.map(locale => questionnairePath(locale, slug)))).size).toBe(123);
    for (const slug of ["connection-ideals", "friendship-quiz", "data-entry", "mental-age"]) expect(wave2bVariant(slug)).toBeUndefined();
    expect(slugs.filter(slug => wave2bVariant(slug)?.bigFive)).toHaveLength(11);
    for (const slug of slugs) for (const id of readingIds(load(slug))) for (const locale of locales) {
      const { personalityTags, soulVerdict } = getWave2bHonorCopy(slug, id, locale);
      const key = `${slug}/${id}/${locale}`;
      expect(new Set(personalityTags).size, key).toBe(3);
      for (const tag of personalityTags) expect(tag, key).toMatch(locale === "en"
        ? /^(?=.{1,18}$)[\w%]+(?:-[\w]+)*(?: [\w%]+(?:-[\w]+)*){0,2}$/iu : /^\p{Script=Han}{2,5}$/u);
      expect(soulVerdict, key).toMatch(locale === "en" ? /\b(?:you|your)\b/iu : /你/u);
      expect(soulVerdict.length, key).toBeGreaterThanOrEqual(locale === "en" ? 45 : 18);
      expect(soulVerdict.length, key).toBeLessThanOrEqual(locale === "en" ? 95 : 34);
      const text = [...personalityTags, soulVerdict].join(" ");
      expect(text, key).not.toMatch(blocked);
      if (locale === "zh-TW") expect(text, key).not.toMatch(mixed);
    }
    expect(() => getWave2bHonorCopy("logical-reasoning", "unknown", "en")).toThrow("Missing wave 2B honor copy");
  });

  it.each(slugs)("uses the real completed scorer and one button-free card for %s", slug => {
    const quiz = load(slug);
    const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, q.options[i % Math.min(3, q.options.length)].id]));
    const result = scoreQuestionnaire(quiz, answers);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") return;
    const data = wave2bCardData(quiz, result, "en", text => text.en)!;
    expect(data.metrics.kind).toBe(wave2bVariant(slug)?.kind);
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Wave2bHonorCard quiz={quiz} data={data} locale="en" textLocale="en" translate={value => value} onRetake={() => {}} />);
    expect(root.querySelectorAll("[data-archetype-honor-card]")).toHaveLength(1);
    expect(root.querySelectorAll("[data-archetype-honor-card] button")).toHaveLength(0);
    expect(root.querySelectorAll("[data-honor-action-spacing] [data-archetype-honor-actions] button")).toHaveLength(4);
    expect(root.querySelectorAll("[data-archetype-honor-card] li")).toHaveLength(3);
    expect(archetypeCardUrl("zh-TW", slug)).toBe(`https://fermatmind.com/zh-TW/tests/explore/${slug}`);
  });

  it("retains all leaders and skips unavailable measurements", () => {
    const quiz = load("character-strengths");
    const facets = Object.fromEntries(quiz.directions.map((direction, index) => [direction.id, { rated: index ? 3 : 0, total: 3, sum: index ? 12 : 0, mean: index ? 4 : null }]));
    const data = wave2bCardData(quiz, { status: "complete", answered: quiz.questions.length, facets }, "en", text => text.en)!;
    expect(data.matches.map(match => match.id)).toEqual(quiz.directions.slice(1).map(d => d.id));
    expect(data.metrics).toMatchObject({ kind: "dimensions", tied: true });
    expect(data.readingId).toBe("tied");
    const ext = load("introvert-extrovert");
    const blank = wave2bCardData(ext, { status: "complete", answered: 10, rated: 5, mean: null, total: null, scaleProfileIds: [] }, "en", text => text.en)!;
    expect(blank.readingId).toBe("missing");
    expect(blank.metrics).toMatchObject({ scale: undefined });
    const boundary = wave2bCardData(ext, { status: "complete", answered: 10, rated: 10, mean: 3, total: 30, scaleProfileIds: ["ambivert-intro", "ambivert-extro"] }, "en", text => text.en)!;
    expect(boundary.matches).toHaveLength(2);
    expect(boundary.metrics).toMatchObject({ scale: { value: 30 }, tied: true });
  });

  it("does not turn the other affection track leader into a tied result", () => {
    const quiz = load("love-languages");
    const means: Record<string, number> = { giving_acts: 5, giving_words: 5, receiving_gifts: 4 };
    const affectionFacets = Object.fromEntries(quiz.directions.map(({ id }) => [id, { mean: means[id] ?? 2, sum: (means[id] ?? 2) * 5, total: 5, rated: 5 }]));
    const data = wave2bCardData(quiz, { status: "complete", answered: 50, affectionFacets }, "en", text => text.en)!;
    expect(data.matches.map(match => match.id)).toEqual(["giving_words", "giving_acts"]);
    expect(data.metrics).toMatchObject({ kind: "dimensions", tied: true, tieLabel: "Ties Within Each Side" });
  });

  it("keeps each locale's practice badges within the actual score band", () => {
    const cases = [
      { correct: 0, labels: [["未达半数", "完成一轮", "起步记录"], ["未達半數", "完成一輪", "起步紀錄"], ["Below Half", "Practice Complete", "Progress Check"]] },
      { correct: 10, labels: [["至少半数", "完成一轮", "还有空间"], ["至少半數", "完成一輪", "還有空間"], ["Halfway or More", "Practice Complete", "Room to Grow"]] },
      { correct: 15, labels: [["高正确率", "多数答对", "亮眼一轮"], ["高正確率", "多數答對", "亮眼一輪"], ["High Accuracy", "Most Correct", "Sharp Run"]] },
      { correct: 20, labels: [["全部答对", "没有错项", "题本满分"], ["全部答對", "沒有錯題", "題本滿分"], ["All Correct", "Zero Misses", "Full Marks"]] },
    ];
    for (const { correct, labels } of cases) {
      const band = wave2bPracticeBand(correct, 20);
      locales.forEach((locale, index) => {
        expect(getWave2bHonorCopy("logical-reasoning", band, locale).personalityTags).toEqual(labels[index]);
      });
    }
  });

  it("uses the numerator and denominator only in opted-in practice sharing", () => {
    expect(wave2bPracticeBand(0, 20)).toBe("review");
    expect(wave2bPracticeBand(10, 20)).toBe("building");
    expect(wave2bPracticeBand(15, 20)).toBe("strong");
    expect(wave2bPracticeBand(20, 20)).toBe("perfect");
    const scoreUrl = archetypeCardUrl("zh-TW", "logical-reasoning");
    expect(metricSharePayload("zh-TW", "邏輯與演繹推理", scoreUrl, "16/20", "16/20").text).toContain("答對 16/20 題");
    const privateUrl = archetypeCardUrl("zh-TW", "intimacy-values");
    expect(metricSharePayload("zh-TW", "親密價值", privateUrl, undefined, undefined, "私人讀數").text).not.toContain("私人讀數");
    expect(metricSharePayload("zh-TW", "親密價值", privateUrl).url).toBe(privateUrl);
  });
});
