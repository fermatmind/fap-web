import { historyDecisionAxes, historyEraAndRegion, historyReferenceCitation } from "@/lib/entertainment/global-history/reference";
import { globalHistoryAiReferrerHost } from "@/lib/entertainment/global-history/ai-referrer";
import { filterTrackingPayload } from "@/lib/tracking/events";
import { existsSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { GLOBAL_HISTORY_ATLAS_SLUGS, GLOBAL_HISTORY_QUESTION_COUNT, globalHistoryAtlasPath, globalHistoryPath, globalHistoryPortraitPath, globalHistoryResultPath } from "@/lib/entertainment/global-history/config";
import { closestHistoryPerson, historyAnswerVector, isHistoryVector } from "@/lib/entertainment/global-history/matching";
import { getHistoryGalleryPage, historyPeople } from "@/lib/entertainment/global-history/people";
import cox from "@/lib/entertainment/global-history/cox-estimates.json";
import evidence from "@/lib/entertainment/global-history/new-vector-evidence.json";
import { getCoxEstimate, getHistoryResult, historyBatchEditorial } from "@/lib/entertainment/global-history/result-v2";
import { historyAxes, historyScenes } from "@/lib/entertainment/global-history/questions";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { buildCompletePublicSitemapEntries, buildPublicSitemapFamilyMap } from "@/lib/seo/publicSitemap";
import { historyAtlasMetadata } from "@/lib/entertainment/global-history/atlas";
import { listNativeTestLlmsEntries } from "@/lib/seo/nativeTestLlmsSource";
import { shouldNoindex } from "@/lib/seo/indexingPolicy";
import { CANONICAL_SITE_URL, SITE_URL } from "@/lib/site";
import { displayHistoryPerson } from "@/lib/entertainment/global-history/traditional-roster";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";

describe("World Edition history quiz", () => {
  it("uses the specific region and keeps nonoverlapping geography in the core facts row", () => {
    expect(historyEraAndRegion("亞洲 · 盛唐", "東亞")).toBe("盛唐 · 東亞");
    expect(historyEraAndRegion("Western Europe · Renaissance", "Europe")).toBe("Western Europe · Renaissance");
    expect(historyEraAndRegion("美洲 · 近代", "北美")).toBe("近代 · 北美");
    expect(historyEraAndRegion("Europe · Renaissance", "Europe")).toBe("Europe · Renaissance");
    expect(historyEraAndRegion("歐洲 · 近代", "北美")).toBe("歐洲 · 近代 · 北美");
  });
  it("keeps only recognized AI referral hosts in start events", () => {
    expect(globalHistoryAiReferrerHost("https://www.perplexity.ai/search/example")).toBe("perplexity.ai");
    expect(globalHistoryAiReferrerHost("https://chatgpt.com/?q=example")).toBe("chatgpt.com");
    expect(globalHistoryAiReferrerHost("https://www.doubao.com/")).toBe("doubao.com");
    expect(globalHistoryAiReferrerHost("https://yuanbao.tencent.com/")).toBe("yuanbao.tencent.com");
    expect(globalHistoryAiReferrerHost("https://chatgpt.com.example.org/")).toBeUndefined();
    expect(globalHistoryAiReferrerHost("https://chatgpt.com@other.example/")).toBeUndefined();
    expect(globalHistoryAiReferrerHost("file://chatgpt.com/private")).toBeUndefined();
    expect(filterTrackingPayload("start_test", { referrer_host: "chatgpt.com" })).toMatchObject({ referrer_host: "chatgpt.com" });
  });

  it("can match every released figure through real options and provides a portrait for each", () => {
    expect(historyScenes).toHaveLength(GLOBAL_HISTORY_QUESTION_COUNT);
    expect(historyPeople).toHaveLength(488);
    expect(Object.keys(evidence)).toHaveLength(289);
    expect(new Set(historyPeople.map(person => person.id)).size).toBe(historyPeople.length);
    expect(new Set(historyPeople.map(person => person.qid)).size).toBe(historyPeople.length);
    expect(new Set(historyPeople.map(person => person.vector.join(","))).size).toBe(historyPeople.length);
    for (const person of historyPeople) {
      expect(isHistoryVector(person.vector)).toBe(true);
      expect(person.bio.zh).toMatch(/\p{Script=Han}/u);
      expect(person.bio.en.length).toBeGreaterThan(5);
      expect(existsSync(`public${globalHistoryPortraitPath(person.id)}`)).toBe(true);
      for (const locale of ["zh", "en"] as const) {
        expect(isMissingFunRoute(globalHistoryResultPath(locale, person.id))).toBe(false);
      }
      const answers = historyScenes.map(({ axis, options }, index) => {
        const wanted = index < 6 ? Math.min(person.vector[axis], 3) : Math.max(person.vector[axis] - 3, 0);
        return options.findIndex(([value]) => value === wanted);
      });
      const vector = historyAnswerVector(answers);
      expect(vector).toEqual(person.vector);
      expect(closestHistoryPerson(vector!, historyPeople)?.id).toBe(person.id);
    }
    expect(historyAnswerVector([])).toBeNull();
    expect(historyAnswerVector(Array(12).fill(4))).toBeNull();
    expect(historyAnswerVector(Array(12).fill("1"))).toBeNull();
  });

  it("binds only released Cox identities and requires six documented axes for each roster addition", () => {
    const trait = {
      zh: /^[高低](开放性|尽责性|外倾性|宜人性|神经质)$/,
      "zh-TW": /^[高低](開放性|盡責性|外傾性|宜人性|神經質)$/,
      en: /^(High|Low) (openness|conscientiousness|extraversion|agreeableness|neuroticism)$/i,
    };
    for (const person of historyPeople) {
      const result = getHistoryResult(person);
      expect(result, person.id).toBeDefined();
      expect(result!.six_dimensions.map(({ score }) => score)).toEqual(person.vector);
      for (const { axis, score, baseline } of result!.six_dimensions) {
        expect(baseline).toEqual(score < 3 ? axis.low : score > 3 ? axis.high : { zh: "视情况而定", "zh-TW": "視情況而定", en: "Depends on the situation" });
      }
    }
    expect(Object.keys(historyDecisionAxes)).toHaveLength(488);
    for (const { id } of historyPeople) {
      expect(historyDecisionAxes[id], id).toBeDefined();
      expect(historyDecisionAxes[id]!.length).toBeGreaterThan(0);
      expect(historyDecisionAxes[id]!.every(name => historyAxes.some(axis => axis.en === name))).toBe(true);
    }
    expect(historyDecisionAxes["leonardo-da-vinci"]).toEqual(["Scope"]);
    expect(historyDecisionAxes["ernest-rutherford"]).toEqual(["Inquiry"]);
    expect(historyDecisionAxes["wu-zetian"]).toEqual(["Change"]);
    expect(historyReferenceCitation("Profile", "https://fermatmind.com/profile", "Reference profile").APA).toContain("(2026)");

    const rows = Object.entries(cox.entries);
    expect(rows).toHaveLength(301);
    const bound = rows.flatMap(([, row]) => row.person_id ? [row.person_id] : []);
    expect(bound).toHaveLength(301);
    expect(new Set(bound).size).toBe(bound.length);
    expect(historyPeople.filter(person => !getCoxEstimate(person.id))).toHaveLength(187);
    for (const [reference, row] of rows) {
      expect(reference).toBe(`${row.table}:${row.sheet_row}`);
      expect(Number.isInteger(row.childhood_corrected) && Number.isInteger(row.youth_corrected)).toBe(true);
      expect(row.group).toBe(row.table === "12A" ? "A" : "B");
      expect(row.rank).toBeGreaterThan(0);
      for (const [estimate, error, grade, reliability] of [
        [row.ai, row.ai_pe, row.ai_grade, row.ai_reliability],
        [row.aii, row.aii_pe, row.aii_grade, row.aii_reliability],
      ]) {
        expect(Number.isInteger(estimate)).toBe(true);
        expect(error).toBeGreaterThan(0);
        expect(grade).toBeGreaterThanOrEqual(1);
        expect(grade).toBeLessThanOrEqual(7);
        expect(reliability).toBeGreaterThanOrEqual(0);
        expect(reliability).toBeLessThanOrEqual(1);
      }
      if (row.person_id) expect(historyPeople.some(person => person.id === row.person_id)).toBe(true);
    }
    expect(getCoxEstimate("leonardo-da-vinci")).toMatchObject({
      table: "12A", sheet_row: "6-3-5", rank: 52,
      ai: 135, ai_pe: 9, ai_grade: 6, ai_reliability: 0.2, childhood_corrected: 155,
      aii: 150, aii_pe: 9, aii_grade: 6, aii_reliability: 0.2, youth_corrected: 180,
    });
    expect(Object.values(cox.entries).filter(row => row.group === "B")).toHaveLength(19);
    expect(getCoxEstimate("voltaire")?.youth_corrected).toBe(190);
    expect(getCoxEstimate("blaise-pascal")?.youth_corrected).toBe(195);
    expect(getCoxEstimate("gilbert-burnet")).toMatchObject({ name: "Thomas Burnet", dates: "1643-1715", sheet_row: "1-5-2", youth_corrected: 165 });
    expect(getCoxEstimate("li-bai")).toBeUndefined();
    expect(Object.keys(evidence).sort()).toEqual(historyPeople.slice(199).map(person => person.id).sort());
    for (const record of Object.values(evidence)) {
      expect(Object.keys(record.axes)).toEqual(historyAxes.map(axis => axis.en));
      expect(record.source).toMatch(/^https:\/\//);
      expect(Object.values(record.axes).every(text => text.length > 12)).toBe(true);
    }
    expect(Object.keys(historyBatchEditorial)).toHaveLength(486);
    for (const [id, copy] of Object.entries(historyBatchEditorial)) {
      const person = historyPeople.find(row => row.id === id);
      expect(person).toBeDefined();
      expect(getHistoryResult(person!)?.iq_benchmark.has_cox_data).toBe(Boolean(getCoxEstimate(id)));
      for (const locale of ["zh", "zh-TW", "en"] as const) {
        expect(copy.archetype_title[locale]).toBeTruthy();
        expect(copy.one_line_hook[locale]).toBeTruthy();
        expect(copy.tags[locale]).toHaveLength(3);
        expect(copy.superpower[locale].length).toBeGreaterThanOrEqual(60);
        expect(copy.quirk_or_blindspot[locale].length).toBeGreaterThanOrEqual(60);
        if (locale !== "en") {
          expect(copy.superpower[locale].length).toBeLessThanOrEqual(80);
          expect(copy.quirk_or_blindspot[locale].length).toBeLessThanOrEqual(80);
        }
        const tags = copy.personality_benchmark.big_five_traits[locale];
        if (copy.personality_benchmark.inferred_mbti.endsWith("P")) {
          expect(tags).not.toContain({ zh: "高尽责性", "zh-TW": "高盡責性", en: "High conscientiousness" }[locale]);
        } else {
          expect(tags.length).toBeGreaterThan(0);
        }
        expect(tags.every(label => trait[locale].test(label)), `${id}/${locale}: ${tags}`).toBe(true);
        if (!getCoxEstimate(id)) {
          expect(copy.cognitive_gift_tag?.[locale], `${id}/${locale}`).toBeTruthy();
          expect(copy.personality_benchmark.title[locale]).not.toBe(copy.cognitive_gift_tag?.[locale]);
        }
      }
    }
  });

  it("pairs both story labels with the same low, neutral or high direction", () => {
    const liBai = historyPeople.find(person => person.id === "li-bai")!;
    const newton = historyPeople.find(person => person.id === "isaac-newton")!;
    const li = getHistoryResult(liBai)!;
    const newt = getHistoryResult(newton)!;
    expect(li.six_dimensions.map(({ score }) => score)).toEqual(liBai.vector);
    expect(newt.six_dimensions.map(({ score }) => score)).toEqual(newton.vector);
    expect(li.six_dimensions[1]).toMatchObject({ labels: { zh: "单兵作战狂魔" }, baseline: historyAxes[1].low });
    expect(li.six_dimensions[2]).toMatchObject({ labels: { zh: "先抛个大胆假设" }, baseline: historyAxes[2].high });
    expect(newt.six_dimensions[5]).toMatchObject({ labels: { zh: "幕后把事推成" }, baseline: historyAxes[5].low });
    const collaboration = Array.from({ length: 7 }, (_, score) => {
      const vector = [...liBai.vector];
      vector[1] = score;
      return getHistoryResult({ ...liBai, vector })!.six_dimensions[1];
    });
    expect(collaboration.map(({ labels }) => labels.zh)).toEqual([
      "单兵作战狂魔", "单兵作战狂魔", "单兵作战狂魔", "单刷组队都能打", "一开口就组局", "一开口就组局", "一开口就组局",
    ]);
    expect(collaboration.map(({ baseline }) => baseline.zh)).toEqual([
      "先独立完成", "先独立完成", "先独立完成", "视情况而定", "先把人聚在一起", "先把人聚在一起", "先把人聚在一起",
    ]);
    expect(li.personality_benchmark.big_five_traits.zh).toEqual(["高开放性", "高外倾性", "低尽责性"]);
  });

  it("breaks distance ties by exact axes and then stable ID, independent of input order", () => {
    const seed = historyPeople[0];
    const lowerId = { ...seed, id: "a", vector: [4, 4, 4, 4, 3, 3] };
    const exact = { ...seed, id: "z", vector: [5, 3, 3, 3, 3, 3] };
    const sameExact = { ...seed, id: "y", vector: [1, 3, 3, 3, 3, 3] };
    const vector = [3, 3, 3, 3, 3, 3];
    expect(closestHistoryPerson(vector, [exact, lowerId])).toBe(exact);
    expect(closestHistoryPerson(vector, [exact, sameExact, lowerId])).toBe(sameExact);
    expect(closestHistoryPerson(vector, [lowerId, sameExact, exact])).toBe(sameExact);
  });

  it("matches the final person in a 1,000-entry pool", () => {
    const people = Array.from({ length: 1000 }, (_, index) => ({
      ...historyPeople[0], id: `candidate-${index}`, vector: Array.from({ length: 6 }, (_, axis) => Math.floor(index / 7 ** axis) % 7),
    }));
    expect(closestHistoryPerson(people[999].vector, people)?.id).toBe(people[999].id);
  });

  it("paginates the full roster and indexes its trilingual public portraits, atlases and entrance", () => {
    const end = getHistoryGalleryPage("9999");
    expect(getHistoryGalleryPage(["2", "3"]).page).toBe(1);
    expect(Array.from({ length: end.total }, (_, index) => getHistoryGalleryPage(String(index + 1)).people).flat()).toEqual(historyPeople);

    const entries = buildCompletePublicSitemapEntries([]);
    const globalHistoryEntries = (items: typeof entries) => items.map(entry => entry.loc)
      .filter(loc => new URL(loc).pathname.includes("/global-history-quiz"));
    const locales = ["zh", "zh-TW", "en"] as const;
    const portraitPaths = historyPeople.flatMap(({ id }) => locales.map(locale => globalHistoryResultPath(locale, id)));
    const atlasPaths = locales.flatMap(locale => GLOBAL_HISTORY_ATLAS_SLUGS.map(atlas => globalHistoryAtlasPath(locale, atlas)));
    for (const locale of locales) for (const atlas of GLOBAL_HISTORY_ATLAS_SLUGS) {
      expect(historyAtlasMetadata(locale, atlas, {}).openGraph).toMatchObject({
        url: SITE_URL + globalHistoryAtlasPath(locale, atlas),
        images: [SITE_URL + globalHistoryPortraitPath(atlas === "personality-atlas" ? "wu-zetian" : "isaac-newton")],
      });
    }
    const expected = [...portraitPaths, ...atlasPaths, ...locales.map(globalHistoryPath)].map(path => CANONICAL_SITE_URL + path).sort();
    for (const path of atlasPaths) {
      expect(isMissingFunRoute(path), path).toBe(false);
      expect(shouldNoindex(path, null), path).toBe(false);
    }
    const historyLlmsPaths = listNativeTestLlmsEntries()
      .filter(({ path }) => path.includes("/global-history-quiz"))
      .map(({ path }) => path);
    expect(historyLlmsPaths.sort()).toEqual([...atlasPaths, ...locales.map(globalHistoryPath)].sort());
    expect(globalHistoryEntries(entries).sort()).toEqual(expected);
    expect(globalHistoryEntries(buildPublicSitemapFamilyMap(entries).tests).sort()).toEqual(expected);
    for (const path of portraitPaths) expect(shouldNoindex(path, null), path).toBe(false);
    for (const locale of locales) {
      const landing = globalHistoryPath(locale);
      expect(isMissingFunRoute(landing)).toBe(false);
      expect(isMissingFunRoute(`${landing}/take`)).toBe(false);
      expect(shouldNoindex(landing, null)).toBe(false);
      expect(shouldNoindex(`${landing}/take`, null)).toBe(true);
      expect(shouldNoindex(globalHistoryResultPath(locale, "missing-history-portrait"), null)).toBe(true);
    }
  });

  it("builds reciprocal absolute alternates and a self-canonical for every portrait", async () => {
    const { generateMetadata } = await import("@/app/(localized)/[locale]/tests/play/global-history-quiz/results/[portrait]/page");
    for (const { id } of historyPeople) {
      const english = SITE_URL + globalHistoryResultPath("en", id);
      const expected = {
        "zh-CN": SITE_URL + globalHistoryResultPath("zh", id),
        "zh-TW": SITE_URL + globalHistoryResultPath("zh-TW", id),
        en: english,
        "x-default": english,
      };
      for (const locale of ["zh", "zh-TW", "en"] as const) {
        expect(await generateMetadata({ params: Promise.resolve({ locale, portrait: id }), searchParams: Promise.resolve({ page: "2" }) }))
          .toMatchObject({ robots: { index: true, follow: true }, alternates: { canonical: SITE_URL + globalHistoryResultPath(locale, id), languages: expected } });
      }
    }
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.fermatmind.com");
    try {
      expect(await generateMetadata({ params: Promise.resolve({ locale: "zh-TW", portrait: "li-bai" }), searchParams: Promise.resolve({}) }))
        .toMatchObject({ robots: { index: false, follow: false } });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("projects the complete Taiwan roster without altering IDs, matching or original languages", () => {
    let translated = 0;
    for (const source of historyPeople) {
      const display = displayHistoryPerson(source, "zh-TW");
      expect([display.id, display.qid, display.vector]).toEqual([source.id, source.qid, source.vector]);
      expect([display.name.en, display.region.en, display.field.en, display.bio.en])
        .toEqual([source.name.en, source.region.en, source.field.en, source.bio.en]);
      expect(displayHistoryPerson(source, "zh")).toBe(source);
      if (source.name["zh-TW"]) expect(display.name.zh).toBe(source.name["zh-TW"]);
      expect(traditionalPath(globalHistoryResultPath("en", source.id))).toBe(globalHistoryResultPath("zh-TW", source.id));
      if (display.bio.zh !== source.bio.zh) translated++;
    }
    expect(translated).toBeGreaterThan(180);
    expect(traditionalPath(globalHistoryPath("en"))).toBe(globalHistoryPath("zh-TW"));
    expect(traditionalPath(`${globalHistoryPath("zh-TW")}/take`)).toBe(`${globalHistoryPath("zh-TW")}/take`);
    expect(traditionalPath(globalHistoryResultPath("zh-TW", "unknown"))).toBeNull();
  });
});
