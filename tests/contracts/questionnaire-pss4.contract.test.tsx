import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import data from "@/lib/questionnaires/data/perceived-stress-scale-4.json";
import original from "@/lib/questionnaires/data/stress-check-in-test.json";
import { isPss4ConfigurationValid, scorePss4Questionnaire } from "@/lib/questionnaires/pss4";
import { scoreStressReflection4Questionnaire } from "@/lib/questionnaires/stressReflection4";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { QuestionnaireStressCheckInClient } from "@/components/questionnaires/QuestionnaireStressCheckInClient";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const answers = (values: number[]) => Object.fromEntries(data.questions.map((q, i) => [q.id, String(values[i])]));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("published English PSS-4 with an identified site Chinese translation", () => {
  it("binds four items, translation identity and actual registered arithmetic without replacing the original form", async () => {
    expect(isPss4ConfigurationValid(data)).toBe(true);
    expect(data.questions.map(q => q.reverse)).toEqual([false, true, true, false]);
    expect(data.source.chineseTranslation).toBe("fermatmind_independent_translation_not_official_china");
    expect(data.source.officialChineseForChinaTextObtained).toBe(false);
    expect(createHash("sha256").update(JSON.stringify(data.questions)).digest("hex")).toBe(data.source.itemBankSha256);
    expect(createHash("sha256").update(JSON.stringify(data.profiles)).digest("hex")).toBe(data.source.resultContentSha256);
    const quiz = await loadQuestionnaire(data.slug);
    expect(quiz).toEqual(data);
    expect(scoreQuestionnaire(quiz!, answers([3, 1, 2, 3]))).toMatchObject({ status: "complete", total: 11 });
    expect(readQuestionnaireDraft(quiz!, JSON.stringify({ version: data.version, savedAt: Date.now(), answers: answers([3, 1, 2, 3]) }))).toBeNull();
    expect(scoreStressReflection4Questionnaire(original, Object.fromEntries(original.questions.map((q, i) => [q.id, String([3, 1, 2, 3][i])])))).toMatchObject({ status: "complete", total: 9 });
    expect(original.questions.map(q => q.reverse)).toEqual([false, true, false, true]);
  });

  it("checks all 625 complete patterns against the published reverse-2/3 formula, including every total", () => {
    const totals = new Set<number>();
    for (let a = 0; a <= 4; a++) for (let b = 0; b <= 4; b++) for (let c = 0; c <= 4; c++) for (let d = 0; d <= 4; d++) {
      const r = scorePss4Questionnaire(data, answers([a, b, c, d]));
      expect(r.status).toBe("complete");
      if (r.status !== "complete") throw Error(r.status);
      expect(r.total).toBe(a + 4 - b + 4 - c + d);
      expect(r.contributions.map(x => x.value)).toEqual([a, 4 - b, 4 - c, d]);
      expect(Object.keys(r)).toEqual(["status", "answered", "total", "contributions"]);
      totals.add(r.total);
    }
    expect([...totals].sort((a, b) => a - b)).toEqual(Array.from({ length: 17 }, (_, i) => i));
  });

  it("never treats missing, unknown, non-data or out-of-range answers as zero", () => {
    for (let n = 0; n < 4; n++) expect(scorePss4Questionnaire(data, Object.fromEntries(data.questions.slice(0, n).map(q => [q.id, "0"])))).toEqual({ status: "incomplete", answered: n });
    const getter = vi.fn(() => "0");
    for (const bad of [null, [], { unknown: "0" }, { "pss4-01": "5" }, { "pss4-01": 2 },
      Object.defineProperty({}, "pss4-01", { get: getter, enumerable: true }),
      Object.defineProperty({}, "pss4-01", { value: "0", enumerable: false }), { [Symbol("hidden")]: "0" }]) {
      expect(scorePss4Questionnaire(data, bad).status).toBe("invalid");
    }
    expect(getter).not.toHaveBeenCalled();
    const wrongKeys = structuredClone(data); wrongKeys.questions[2].reverse = false;
    expect(scorePss4Questionnaire(wrongKeys, answers([0, 0, 0, 0])).status).toBe("unavailable");
    const wrongIdentity = structuredClone(data); wrongIdentity.source.officialChineseForChinaTextObtained = true;
    expect(isPss4ConfigurationValid(wrongIdentity)).toBe(false);
  });

  it.each(["en", "zh"] as const)("uses the real memory-only reader and shares only the fixed guide: %s", async locale => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw Error("Storage unavailable"); });
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw Error("Storage unavailable"); });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const view = render(<QuestionnaireStressCheckInClient quiz={data} locale={locale} />);
    fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "开始测试" : "Start test" }));
    fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "下一题" : "Next" }));
    expect(view.container.querySelector("[data-stress-check-in-result]")).toBeNull();
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getAllByRole("radio")[[3, 1, 2, 3][i]]);
      fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? (i === 3 ? "查看本次总分" : "下一题") : (i === 3 ? "See this check-in total" : "Next") }));
    }
    expect(view.container.querySelector("[data-stress-check-in-total]")?.textContent).toContain("11 / 16");
    expect(view.container.querySelectorAll("[data-stress-check-in-contribution]")).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "复制公开解释链接" : "Copy public explanation link" }));
    expect(writeText).toHaveBeenCalledWith(`${data.profiles[0].title[locale]}\nhttps://fermatmind.com/${locale}/tests/explore/${data.slug}/results/reading-pss4-total`);
    expect(get).not.toHaveBeenCalled(); expect(set).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
    const restored = new Event("pageshow"); Object.defineProperty(restored, "persisted", { value: true }); fireEvent(window, restored);
    expect(view.container.querySelector("[data-stress-check-in-result]")).toBeNull();
  });

  it("emits the paired entries and fixed full guides with canonical sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    const guide = await import("@/components/questionnaires/QuestionnaireGuide");
    const sitemap = appendFunSitemapEntries([]);
    for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/${data.slug}`;
      const props = { params: Promise.resolve({ locale, slug: data.slug }) };
      const meta = await entry.generateMetadata(props);
      const html = renderToStaticMarkup(await entry.default(props));
      expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
      expect(html).toContain(data.title[locale]);
      expect(html).not.toMatch(/proposed|候选要求|拟复用/);
      expect(sitemap.filter(row => row.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
      expect(isAnalyticsDisabledQuestionnaireUrl(path)).toBe(true);
      const resultPath = `${path}/results/reading-pss4-total`;
      expect(isAnalyticsDisabledQuestionnaireUrl(resultPath)).toBe(true);
      expect(sitemap.filter(row => row.loc === `https://fermatmind.com${resultPath}`)).toHaveLength(1);
      const guideHtml = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: data.slug, profile: "reading-pss4-total" }) }));
      for (const section of data.profiles[0].sections) for (const paragraph of section.paragraphs) expect(guideHtml).toContain(paragraph[locale]);
    }
  });
  it("rejects damaged PSS source at entry, guide metadata/body and image callers in both languages", async () => {
    for (const fault of ["reverse", "translation_identity", "missing_item"]) {
      const damaged = structuredClone(data);
      if (fault === "reverse") damaged.questions[2].reverse = false;
      if (fault === "translation_identity") damaged.source.officialChineseForChinaTextObtained = true;
      if (fault === "missing_item") damaged.questions.splice(1, 1);
      vi.resetModules();
      vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => damaged }));
      try {
        const entry = await import("@/components/questionnaires/QuestionnairePage");
        const guide = await import("@/components/questionnaires/QuestionnaireGuide");
        const { GET } = await import("@/app/og/fun/[slug]/route");
        for (const locale of ["en", "zh"] as const) {
          const props = { params: Promise.resolve({ locale, slug: data.slug }) };
          const guideProps = { params: Promise.resolve({ locale, slug: data.slug, profile: "reading-pss4-total" }) };
          expect((await entry.generateMetadata(props)).robots).toMatchObject({ index: false });
          expect((await guide.generateMetadata(guideProps)).robots).toMatchObject({ index: false });
          await expect(entry.default(props)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/);
          await expect(guide.default(guideProps)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/);
          expect((await GET(new Request(`https://fermatmind.com/og/fun/${data.slug}?locale=${locale}`), { params: Promise.resolve({ slug: data.slug }) })).status).toBe(404);
        }
      } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
    }
  });

});
