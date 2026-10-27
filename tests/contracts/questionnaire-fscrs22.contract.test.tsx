import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { FSCRS22_PART_KEYS, isFscrs22ConfigurationValid, readFscrs22, scoreFscrs22Questionnaire, type Fscrs22Questionnaire } from "@/lib/questionnaires/fscrs22";
import { QuestionnaireFscrs22Client } from "@/components/questionnaires/QuestionnaireFscrs22Client";
import { QuestionnaireFscrs22Attribution } from "@/components/questionnaires/QuestionnaireFscrs22Attribution";
import { QuestionnaireFscrs22Report } from "@/components/questionnaires/QuestionnaireFscrs22Report";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/inner-critic-voice-test.json", "utf8")) as Fscrs22Questionnaire;
const ref = JSON.parse(readFileSync("tests/fixtures/questionnaires/fscrs22-source-reference.json", "utf8"));
const all = (value = "3") => Object.fromEntries(quiz.questions.map(question => [question.id, value]));
const sourceRows = (values: number[]) => quiz.questions.map((question, index) => ({ id: question.id, value: values[index] }));
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
afterEach(() => { cleanup(); vi.restoreAllMocks(); if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll); else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView"); });

describe("FSCRS22 2019 source edition, separate strict groups and optional web skips", () => {
  it("binds all 22 original English items, working Chinese, 9/5/8 keys and three whole bilingual explanations", () => {
    expect(isFscrs22ConfigurationValid(quiz)).toBe(true);
    expect(FSCRS22_PART_KEYS).toEqual(ref.method.key);
    for (const [index, item] of quiz.questions.entries()) {
      expect(item.prompt).toEqual(ref.questions[index].text);
      expect(item.id).toBe(ref.questions[index].id);
      expect(item.options.map(option => option.score)).toEqual([1, 2, 3, 4, 5, null]);
      expect(item.options.map(option => option.label)).toEqual(ref.responses.map((option: { label: unknown }) => option.label));
      expect(item.options.every(option => option.directionId === ref.questions[index].part)).toBe(true);
    }
    expect(createHash("sha256").update(JSON.stringify(quiz.questions)).digest("hex")).toBe(ref.questionsSHA256);
    expect(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex")).toBe(ref.profilesSHA256);
    expect(quiz.profiles).toHaveLength(3);
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(8); for (const section of profile.sections) { expect(section.paragraphs).toHaveLength(2); for (const paragraph of section.paragraphs) { expect(paragraph.en.trim()).not.toBe(""); expect(paragraph.zh).toMatch(/\p{Script=Han}/u); } } }
  });

  it("compares all 25,641 reachable three-sum combinations against a source-key oracle, one witness per combination", () => {
    let compared = 0;
    for (let a = 9; a <= 45; a++) for (let b = 5; b <= 25; b++) for (let c = 8; c <= 40; c++) {
      const values = Array<number>(22).fill(1), sums = { inadequate: a, hated: b, reassured: c };
      for (const id of ["inadequate", "hated", "reassured"] as const) {
        let remainder = sums[id] - ref.method.key[id].length;
        for (const number of ref.method.key[id]) { const delta = Math.min(4, remainder); values[number - 1] += delta; remainder -= delta; }
        assert.equal(remainder, 0);
      }
      const result = readFscrs22(sourceRows(values)); assert.ok(result);
      for (const id of ["inadequate", "hated", "reassured"] as const) {
        const count = ref.method.key[id].length;
        assert.deepEqual(result.parts[id], { numericCount: count, skippedCount: 0, requiredCount: count, sum: sums[id], mean: sums[id] / count });
      }
      compared++;
    }
    expect(compared).toBe(25641);
  });

  it("withholds only the part containing a skip, distinguishes blanks, and completes all-NA without scores", () => {
    expect(scoreFscrs22Questionnaire(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
    for (const question of ref.questions) {
      const result = scoreFscrs22Questionnaire(quiz, { ...all(), [question.id]: "na" });
      assert.equal(result.status, "complete"); if (result.status !== "complete") throw new Error("No source readout");
      for (const id of ["inadequate", "hated", "reassured"] as const) {
        const part = result.fscrs22.parts[id], size = ref.method.key[id].length;
        expect(part.sum).toBe(id === question.part ? null : size * 3);
        expect(part.mean).toBe(id === question.part ? null : 3);
        expect(part.skippedCount).toBe(id === question.part ? 1 : 0);
      }
    }
    const result = scoreFscrs22Questionnaire(quiz, all("na")); assert.equal(result.status, "complete");
    if (result.status !== "complete") throw new Error("All explicit skips must finish");
    expect(Object.keys(result)).toEqual(["status", "answered", "fscrs22"]);
    for (const part of Object.values(result.fscrs22.parts)) { expect(part.sum).toBeNull(); expect(part.mean).toBeNull(); expect(part.numericCount).toBe(0); }
    for (const locale of ["en", "zh"] as const) {
      const markup = renderToStaticMarkup(<QuestionnaireFscrs22Report quiz={quiz} result={result.fscrs22} locale={locale} />);
      const doc = new DOMParser().parseFromString(markup, "text/html");
      expect(doc.querySelectorAll("[data-fscrs22-unscored]")).toHaveLength(3);
      expect(doc.querySelectorAll("[data-fscrs22-mean], [data-fscrs22-sum]")).toHaveLength(0);
      for (const profile of quiz.profiles) for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(doc.body.textContent).toContain(paragraph[locale]);
    }
  });

  it("rejects malformed answers, source drift, regrouping, missing support and partial full guides", () => {
    for (const value of [0, 6, 3.5, NaN, Infinity, true, "0", "6", "3.0", "NA", null, undefined]) expect(scoreFscrs22Questionnaire(quiz, { ...all(), "fscrs-01": value }).status).toBe("invalid");
    expect(scoreFscrs22Questionnaire(quiz, { ...all(), unknown: "3" }).status).toBe("invalid");
    const values = Array<number>(22).fill(3), rows = sourceRows(values);
    expect(readFscrs22(rows.slice(1))).toBeNull(); expect(readFscrs22([...rows, rows[0]])).toBeNull();
    expect(readFscrs22(rows.map((row, index) => index === 1 ? rows[0] : row))).toBeNull();
    const sparse = [...rows]; delete sparse[3]; expect(readFscrs22(sparse)).toBeNull();
    expect(readFscrs22([...rows].reverse())).toEqual(readFscrs22(rows));
    const mutate = (action: (draft: Fscrs22Questionnaire) => void) => { const draft = structuredClone(quiz); action(draft); expect(isFscrs22ConfigurationValid(draft)).toBe(false); expect(scoreFscrs22Questionnaire(draft, all()).status).toBe("unavailable"); };
    mutate(draft => { draft.questions[0].options[0].score = 0; });
    mutate(draft => { draft.questions[0].options[5].score = 0; });
    mutate(draft => { draft.questions[0].options[2].label.en = "Moderately like me"; });
    mutate(draft => { draft.questions[0].options[1].label.zh = "偶尔"; });
    mutate(draft => { draft.questions[0].prompt.en += " changed"; });
    mutate(draft => { draft.questions[0].options[0].directionId = "hated"; });
    mutate(draft => { draft.questions[2].reverse = true; });
    mutate(draft => { draft.profiles[2].sections.pop(); });
    mutate(draft => { draft.fscrs22.support.urgent.en = ""; });
  });

  it("renders private controls disabled before hydration and attributes the paper-specific CC adaptation", () => {
    for (const locale of ["en", "zh"] as const) {
      const markup = renderToStaticMarkup(<QuestionnaireFscrs22Client quiz={quiz} locale={locale} />);
      const doc = new DOMParser().parseFromString(markup, "text/html");
      expect(doc.querySelector("fieldset")?.hasAttribute("disabled")).toBe(true);
      expect(doc.querySelector("form")).toBeNull(); expect(doc.querySelectorAll("[data-fscrs22-support]")).toHaveLength(1);
      expect(doc.body.textContent).toContain(quiz.fscrs22.support.urgent[locale]);
      const source = renderToStaticMarkup(<QuestionnaireFscrs22Attribution quiz={quiz} locale={locale} />);
      expect(source).toContain("https://creativecommons.org/licenses/by/4.0/"); expect(source).toContain("2019");
    }
    expect(renderToStaticMarkup(<QuestionnaireFscrs22Client quiz={{}} locale="en" />)).toContain("unavailable");
  });

  it("uses memory only, clears on locale and persisted-page changes, and survives clipboard rejection", async () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage denied"); });
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage denied"); });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("Clipboard denied")) } });
    const view = render(<QuestionnaireFscrs22Client quiz={quiz} locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Start test" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status").textContent).toContain("explicitly skip");
    for (let index = 0; index < 22; index++) {
      fireEvent.click(screen.getByRole("radio", { name: "Skip this statement" }));
      fireEvent.click(screen.getByRole("button", { name: index === 21 ? "See three parts" : "Next" }));
    }
    expect(view.container.querySelectorAll("[data-fscrs22-unscored]")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Copy public explanation links" }));
    const copied = await screen.findByRole("textbox", { name: "Public links for manual copying" });
    expect((copied as HTMLTextAreaElement).value).not.toMatch(/fscrs-\d|[?&]|mean|sum|answers/);
    expect(get).not.toHaveBeenCalled(); expect(set).not.toHaveBeenCalled();
    view.rerender(<QuestionnaireFscrs22Client quiz={quiz} locale="zh" />);
    expect(view.container.querySelector("[data-fscrs22-result]")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "开始测试" }));
    expect(screen.getAllByRole("radio").every(radio => !(radio as HTMLInputElement).checked)).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: "2" }));
    const restore = new Event("pageshow"); Object.defineProperty(restore, "persisted", { value: true }); fireEvent(window, restore);
    expect(screen.getByRole("button", { name: "开始测试" })).toBeDefined();
  });

  it("dispatches only the source-specific scorer and rejects legacy stored answers for this memory-only edition", () => {
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(scoreQuestionnaire(quiz, all())).toEqual(scoreFscrs22Questionnaire(quiz, all()));
    const saved = JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers: all() });
    expect(readQuestionnaireDraft(quiz, saved)).toBeNull();
    const broken = structuredClone(quiz); broken.questions[0].options[0].score = 0;
    expect(isQuestionnaireConfigurationValid(broken)).toBe(false);
    expect(scoreQuestionnaire(broken, all()).status).toBe("unavailable");
  });

  it("binds all eight public pages to full bilingual content, working-edition SEO, support and sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    const page = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide");
    const urls = appendFunSitemapEntries([]).map(row => row.loc);
    for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/${quiz.slug}`, args = { params: Promise.resolve({ locale, slug: quiz.slug }) };
      const metadata = await page.generateMetadata(args);
      expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]);
      expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
      expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}` });
      expect(urls).toContain(`https://fermatmind.com${path}`);
      const dom = new DOMParser().parseFromString(renderToStaticMarkup(await page.default(args)), "text/html");
      expect(dom.querySelectorAll("[data-fscrs22-client]")).toHaveLength(1);
      expect(dom.querySelectorAll("[data-fscrs22-support]")).toHaveLength(1);
      expect(dom.querySelector('input[type="checkbox"]')).toBeNull();
      const method = dom.querySelector('section[aria-labelledby="questionnaire-method"]');
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(method?.textContent).toContain(paragraph[locale]);
      for (const profile of quiz.profiles) {
        const args = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, meta = await guide.generateMetadata(args);
        expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]);
        expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}/results/${profile.id}`);
        expect(urls).toContain(`https://fermatmind.com${path}/results/${profile.id}`);
        const doc = new DOMParser().parseFromString(renderToStaticMarkup(await guide.default(args)), "text/html");
        expect(doc.querySelector("[data-fscrs22-result]")).toBeNull();
        expect(doc.querySelectorAll("[data-fscrs22-support]")).toHaveLength(1);
        expect(doc.querySelector("[data-fscrs22-attribution]")?.textContent).toContain("CC BY 4.0");
        for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(doc.body.textContent).toContain(paragraph[locale]);
      }
    }
  });

  it("fails closed through the real entry, guide, metadata and image callers when source coding drifts", async () => {
    const broken = structuredClone(quiz); broken.questions[0].options[0].score = 0;
    vi.resetModules(); vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => broken }));
    try {
      const page = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), image = await import("@/app/og/fun/[slug]/route");
      const entryArgs = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, guideArgs = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "inadequate" }) };
      expect((await page.generateMetadata(entryArgs)).robots).toEqual({ index: false, follow: false });
      expect((await guide.generateMetadata(guideArgs)).robots).toEqual({ index: false, follow: false });
      await expect(page.default(entryArgs)).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404/);
      await expect(guide.default(guideArgs)).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404/);
      expect((await image.GET(new Request(`https://fermatmind.com/og/fun/${quiz.slug}?locale=en`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
    } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
  });
});
