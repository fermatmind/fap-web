import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireDarkTriadReport } from "@/components/questionnaires/QuestionnaireDarkTriadReport";
import { QuestionnaireDarkTriadClient } from "@/components/questionnaires/QuestionnaireDarkTriadClient";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/dark-triad.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/dark-triad-reference.json");
const reference = JSON.parse(bytes.toString());
const skipped = (): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, "na"]));

describe("T074 owned original Dark Triad thematic preview", () => {
  it("preserves all eighteen owned Chinese items, accuracy options, direct keys and three six-item groups", () => {
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.questions).toHaveLength(18);
    expect(quiz.code).toBe("DARK_TRIAD"); expect(quiz.source.formCode).toBe("dark_triad_theme_likert_18");
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(reference.ownedMiniSource.fileSha256.item_bank).toBe("dfdb515ccf246905b7e6e8b641e7dcaa8211bec1d1c3efc5886533cde7ee5076");
    expect(reference.ownedMiniSource.exactChineseBankPreserved).toBe(true);
    expect(reference.ownedMiniSource.privacyMode).toBe("memory_only_no_flow_analytics_no_result_share");
    expect(quiz.minimumRatedItems).toBe(4); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(isLikertConfigurationValid(quiz)).toBe(true);
    for (const [index, question] of quiz.questions.entries()) {
      expect(question.id).toBe(`DTT_${String(index + 1).padStart(3, "0")}`);
      expect(question.reverse).toBe(false); expect(question.prompt.zh.startsWith("过去三个月，")).toBe(true);
      expect(question.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]);
      expect(question.options[2].label.zh).toBe("不确定或视情况"); expect(question.options[5].label.zh).toBe("我不想回答这题");
      expect(question.options[5].score).toBeNull();
    }
    for (const direction of quiz.directions) {
      expect(direction.itemCount).toBe(6);
      expect(quiz.questions.filter(q => q.options[0].directionId === direction.id)).toHaveLength(6);
    }
    expect(new Set(quiz.profiles.map(p => p.seo?.title.en)).size).toBe(3);
    const walk = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      const entry = value as Record<string, unknown>;
      if ("en" in entry || "zh" in entry) {
        expect(String(entry.en)).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u);
        expect(String(entry.en).length).toBeGreaterThan(0); expect(String(entry.zh)).toMatch(/\p{Script=Han}/u);
      } else Object.values(entry).forEach(walk);
    };
    walk(quiz);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(9); expect(new Set(p.sections.map(s => s.id)).size).toBe(9);
      expect(p.sections.reduce((n, s) => n + s.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(850);
      expect(p.seo?.title.en.length).toBeLessThanOrEqual(60); expect(p.seo?.description.en.length).toBeLessThanOrEqual(160);
    }
  });

  it("matches all 273 independently generated facet count-and-sum witnesses without treating NA as zero or midpoint", () => {
    let states = new Map<string, { rated: number; sum: number; values: Array<string> }>([["0|0", { rated: 0, sum: 0, values: [] }]]);
    for (let position = 0; position < 6; position++) {
      const next = new Map<string, { rated: number; sum: number; values: Array<string> }>();
      for (const state of states.values()) for (const value of ["na", "1", "2", "3", "4", "5"]) {
        const rated = state.rated + Number(value !== "na"), sum = state.sum + (value === "na" ? 0 : Number(value));
        next.set(`${rated}|${sum}`, { rated, sum, values: [...state.values, value] });
      }
      states = next;
    }
    expect(states.size).toBe(91); expect([...states.values()].filter(s => s.rated >= 4)).toHaveLength(63);
    let tested = 0;
    for (const direction of quiz.directions) for (const state of states.values()) {
      const answers = skipped(), items = quiz.questions.filter(q => q.options[0].directionId === direction.id);
      items.forEach((q, index) => { answers[q.id] = state.values[index]; });
      const result = scoreLikertQuestionnaire(quiz, answers);
      if (result.status !== "complete") throw new Error("Complete source witness rejected");
      expect(result.facets[direction.id]).toEqual({ sum: state.sum, rated: state.rated, total: 6, mean: state.rated >= 4 ? Math.round(state.sum / state.rated * 10) / 10 : null });
      for (const other of quiz.directions.filter(d => d.id !== direction.id)) expect(result.facets[other.id]).toEqual({ sum: 0, rated: 0, total: 6, mean: null });
      expect(result).not.toHaveProperty("profileId"); expect(result).not.toHaveProperty("total"); tested++;
    }
    expect(tested).toBe(273);
    console.info("273 independent facet witnesses, not all 6^18 joint answer paths or psychometric validation.");
  });

  it("shows exact sum/count means and all 27 full sections, retaining partial groups and valid all-skipped attempts", () => {
    const answers = skipped();
    const values = [["1", "2", "3", "3", "na", "na"], ["1", "1", "1", "1", "1", "5"], ["5", "5", "5", "na", "na", "na"]];
    quiz.directions.forEach((d, i) => quiz.questions.filter(q => q.options[0].directionId === d.id).forEach((q, j) => { answers[q.id] = values[i][j]; }));
    const result = scoreLikertQuestionnaire(quiz, answers); if (result.status !== "complete") throw new Error("Witness rejected");
    expect(result.facets[quiz.directions[0].id].mean).toBe(2.3);
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireDarkTriadReport quiz={quiz} result={result} locale="en" />);
    const groups = dom.querySelectorAll("[data-dtt-facet]");
    expect(groups[0].querySelector("[data-dtt-mean]")?.textContent).toBe("2.25 / 5");
    expect(groups[0].querySelector("[data-dtt-sum]")?.textContent).toContain("9 / 4");
    expect(groups[1].querySelector("[data-dtt-mean]")?.textContent).toBe("1.67 / 5");
    expect(groups[2].querySelector("[data-dtt-mean]")?.textContent).toBe("Insufficient information");
    expect(groups[2].querySelector("[data-dtt-sum]")).toBeNull(); expect(dom.querySelectorAll("h4")).toHaveLength(27);
    const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    const allNA = scoreLikertQuestionnaire(quiz, skipped()); if (allNA.status !== "complete") throw new Error("Valid skip rejected");
    const html = renderToStaticMarkup(<QuestionnaireDarkTriadReport quiz={quiz} result={allNA} locale="zh" />);
    expect(html).toContain("没有生成个人均分"); expect(html).not.toContain("data-dtt-sum");
    const partial = skipped(); delete partial.DTT_018;
    expect(scoreLikertQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 17 });
    for (const invalid of [null, [], { DTT_001: 3 }, { DTT_001: "6" }, { DTT_001: "PREFER_NOT_TO_ANSWER" }, { unknown: "1" }]) expect(scoreLikertQuestionnaire(quiz, invalid).status).toBe("invalid");
  });

  it("keeps the sensitive attempt in an isolated memory-only client with no analytics, draft, sharing or attributed CTA", () => {
    const source = readFileSync("components/questionnaires/QuestionnaireDarkTriadClient.tsx", "utf8");
    expect(source).not.toMatch(/sessionStorage|localStorage|indexedDB|trackEvent|navigator\.clipboard|appendSeoCta|questionnaire_result_mbti/);
    const html = renderToStaticMarkup(<QuestionnaireDarkTriadClient quiz={quiz} locale="en" />);
    expect(html).toContain("Refreshing, changing language or leaving loses the attempt");
    expect(html).not.toContain("type=\"checkbox\""); expect(html).not.toContain("Resume this tab");
    expect(html).not.toContain("Copy result"); expect(html).not.toContain("Explore MBTI and its versions");
    expect(readFileSync("components/questionnaires/QuestionnairePage.tsx", "utf8")).toContain('QuestionnaireDarkTriadClient key={`${slug}:${locale}`}');
  });

  it("exposes all eight bilingual native URLs with dedicated metadata, full text, sitemap membership and safe public identities", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/dark-triad`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(html).toContain(quiz.instructions![locale]); expect(html).toContain(locale === "zh" ? "原创三组主题观察" : "Original three-theme reflection");
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        expect(html).not.toContain("type=\"checkbox\"");
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          for (const section of profile.sections) {
            expect(dom.querySelector(`#report-${section.id} h2`)?.textContent).toBe(section.title[locale]);
            for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          }
          expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/dark-triad/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/dark-triad/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true);
          expect(rendered).not.toContain("data-dtt-mean"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
