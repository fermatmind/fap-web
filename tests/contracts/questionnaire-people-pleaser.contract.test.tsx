import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnairePpsReport } from "@/components/questionnaires/QuestionnairePpsReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/people-pleaser.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/people-pleaser-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"] };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(source.questions.map(q => [q.id, value]));

describe("T024 licensed PPS items with identified website adaptations", () => {
  it("binds10licensed bilingual PPS items to three uneven parts and three full9section guides", () => {
    expect(quiz.questions).toEqual(source.questions); expect(quiz.questions).toHaveLength(10); expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.directions.map(d => d.id)).toEqual(["needs", "responsibility", "expectations"]);
    expect(quiz.questions.every(q => q.reverse === false)).toBe(true); expect(quiz.minimumRatedItems).toBe(3);
    for (const d of quiz.directions) expect(quiz.questions.filter(q => q.options[0].directionId === d.id)).toHaveLength(d.itemCount!);
    for (const p of quiz.profiles) {
      expect(p.directionIds).toEqual([p.id]); expect(p.sections).toHaveLength(9);
      expect(p.sections.slice(0, 8).flatMap(s => s.paragraphs.map(p => p.en)).join(" ").split(/\s+/).length).toBeGreaterThan(400);
      expect(p.seo?.title.en).toBeTruthy(); expect(p.seo?.description.zh).toBeTruthy();
    }
    const text = (v: unknown): void => {
      if (!v || typeof v !== "object") return;
      const o = v as Record<string, unknown>;
      if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u); expect(o.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(o).forEach(text);
    };
    text(quiz);
    for (const bank of ["music-taste-test", "humor-style-test", "communication-style", "social-battery-test", "attachment-styles", "love-languages", "leadership-style"]) {
      const other = JSON.parse(readFileSync(`lib/questionnaires/data/${bank}.json`, "utf8")) as Questionnaire;
      const prompts = new Set(other.questions.flatMap(q => [q.prompt.en, q.prompt.zh]));
      for (const question of quiz.questions) expect(prompts.has(question.prompt.en) || prompts.has(question.prompt.zh)).toBe(false);
    }
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(10); expect(new Set(quiz.profiles.map(p => p.seo!.title.en)).size).toBe(3);
  });
  it("matches101source-DP individual-part states, preserving independent means and minimum3with4-3-3parts", () => {
    let tested = 0;
    for (const direction of quiz.directions) {
      const qs = source.questions.filter(q => q.options[0].directionId === direction.id);
      let states = new Map<string, string[]>([["0,0", []]]);
      for (const question of qs) {
        const next = new Map<string, string[]>();
        for (const [key, witness] of states) {
          const [rated, sum] = key.split(",").map(Number);
          for (const o of question.options) next.set(`${rated + (typeof o.score === "number" ? 1 : 0)},${sum + (o.score ?? 0)}`, [...witness, o.id]);
        }
        states = next;
      }
      expect(states.size).toBe(qs.length === 4 ? 45 : 28);
      for (const [key, witness] of states) {
        const [rated, sum] = key.split(",").map(Number), answers = all(); qs.forEach((q, i) => { answers[q.id] = witness[i]; });
        const result = scoreQuestionnaire(quiz, answers);
        if (result.status !== "complete" || !("facets" in result)) throw new Error("Full source witness rejected");
        expect(result.facets[direction.id]).toEqual({ sum, rated, total: qs.length, mean: rated >= 3 ? Math.round(sum / rated * 10) / 10 : null });
        for (const other of quiz.directions.filter(d => d.id !== direction.id)) expect(result.facets[other.id].mean).toBe(3);
        expect(result).not.toHaveProperty("leaders"); expect(result).not.toHaveProperty("total"); tested++;
      }
    }
    expect(tested).toBe(101);
    console.info("101individual-part source-DP witnesses covering45needsand28eachotherstates; not6^10individual answers, Cartesian coverage or psychometric validation.");
  });
  it("distinguishes low agreement from midpoint and NA, rejects incomplete/malformed input and invalid configurations, and restores current drafts", () => {
    for (const value of ["1", "3", "5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected input");
      for (const facet of Object.values(result.facets)) expect(facet.mean).toBe(value === "na" ? null : Number(value));
    }
    const partial = all(); delete partial[quiz.questions.at(-1)!.id]; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 9 });
    for (const bad of [null, [], "3", Object.create({ inherited: "3" }), { ...all(), unknown: "3" }, { ...all(), [quiz.questions[0].id]: "0" }, { ...all(), [quiz.questions[0].id]: 3 }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.minimumRatedItems = 5; }, (q: Questionnaire) => { q.questions[0].options[0].directionId = "unknown"; }, (q: Questionnaire) => { q.profiles[0].directionIds = ["expectations"]; }, (q: Questionnaire) => { q.questions[0].id = q.questions[1].id; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }]) {
      const broken = structuredClone(quiz); mutate(broken); expect(scoreQuestionnaire(broken, all()).status).toBe("unavailable");
    }
    const now = 1000000000, draft = (version = quiz.version, savedAt = now) => JSON.stringify({ version, savedAt, answers: all() });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual(all()); expect(readQuestionnaireDraft(quiz, draft("other"), now)).toBeNull(); expect(readQuestionnaireDraft(quiz, draft(quiz.version, now - 86400000), now)).toBeNull();
  });
  it("uses its own3part PPS report, all27unique full sections, explicit NA and no social-battery interpretation", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected input");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePpsReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-pps-facet]")).toHaveLength(3); expect(dom.querySelectorAll("h4")).toHaveLength(27); expect(dom.querySelectorAll("[data-pps-profile]")).toHaveLength(3);
      expect(dom.querySelectorAll("[data-pps-insufficient]")).toHaveLength(value === "na" ? 1 : 0);
      const ids = Array.from(dom.querySelectorAll("[id]"), x => x.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.textContent).not.toMatch(/battery|quiet recovery|coordination load|社交电量|安静恢复|expression frequency|Almost always|几乎总是|sound preferences/i);
      if (value === "na") for (const mean of dom.querySelectorAll("[data-pps-mean]")) expect(mean.textContent).not.toMatch(/0|3\.0/);
    }
  });
  it("publishes eight native bilingual entry/guideURLs with complete bodies and individual SEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/people-pleaser`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(html).toContain("data-pps-attribution"); expect(html).not.toContain("Original self-reflection questionnaire");
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(quiz.guide.some(s => s.id === "source-credit")).toBe(true);
        for (const section of quiz.guide) expect(html).toContain(section.paragraphs[0][locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/people-pleaser/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/people-pleaser/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).toContain("data-pps-attribution");
          for (const href of ["https://link.springer.com/article/10.1007/s12144-026-09519-2", "https://link.springer.com/article/10.1007/s12144-026-09519-2/tables/1", "https://creativecommons.org/licenses/by/4.0/"]) expect(dom.querySelector(`a[href="${href}"]`)).not.toBeNull();
          expect(rendered).not.toContain("data-pps-facet"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
