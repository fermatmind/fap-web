import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireHabitsReport } from "@/components/questionnaires/QuestionnaireHabitsReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/toxic-trait.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/toxic-trait-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; miniReuse: { items: { webQuestionId: string; miniQuestionId: string; zhExact: string }[] } };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(source.questions.map(q => [q.id, value === "na" ? value : q.reverse ? String(6 - Number(value)) : value]));

describe("T064 original five-part interpersonal habits accuracy reflection", () => {
  it("binds20 bilingual accuracy items to five four-item parts, owned4itemprovenance and five full9section guides", () => {
    expect(quiz.questions).toEqual(source.questions); expect(quiz.questions).toHaveLength(20); expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.directions.map(d => d.id)).toEqual(["unchecked-retelling", "comparison-turns", "indirect-objections", "explanation-first", "past-dispute-carryover"]);
    expect(source.miniReuse.items).toHaveLength(4);
    expect(source.miniReuse.items.map(i => i.miniQuestionId)).toEqual(["SHADOW_LK_013", "SHADOW_LK_014", "SHADOW_LK_015", "SHADOW_LK_016"]);
    for (const item of source.miniReuse.items) expect(quiz.questions.find(q => q.id === item.webQuestionId)?.prompt.zh).toBe(item.zhExact);
    expect(quiz.questions[0].options[2].label).toEqual({ zh: "不确定或视情况", en: "Uncertain or depends on the situation" });
    expect(quiz.questions.filter(q => q.reverse)).toHaveLength(0); expect(quiz.minimumRatedItems).toBe(4);
    for (const d of quiz.directions) expect(quiz.questions.filter(q => q.options[0].directionId === d.id)).toHaveLength(4);
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
    for (const bank of readdirSync("lib/questionnaires/data").filter(f => f.endsWith(".json") && f !== "toxic-trait.json").map(f => f.slice(0, -5))) {
      const other = JSON.parse(readFileSync(`lib/questionnaires/data/${bank}.json`, "utf8")) as Questionnaire;
      const prompts = new Set(other.questions.flatMap(q => [q.prompt.en, q.prompt.zh]));
      for (const question of quiz.questions) expect(prompts.has(question.prompt.en) || prompts.has(question.prompt.zh)).toBe(false);
    }
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(20); expect(new Set(quiz.profiles.map(p => p.seo!.title.en)).size).toBe(5);
  });
  it("matches225independent source-DP partstates,17fullyratedsums and exactquartermeans without a total", () => {
    let tested = 0;
    for (const direction of quiz.directions) {
      const qs = source.questions.filter(q => q.options[0].directionId === direction.id);
      let states = new Map<string, string[]>([["0,0", []]]);
      for (const question of qs) {
        const next = new Map<string, string[]>();
        for (const [key, witness] of states) {
          const [rated, sum] = key.split(",").map(Number);
          for (const o of question.options) {
            const value = o.score === null ? null : question.reverse ? 6 - o.score! : o.score!;
            next.set(`${rated + (typeof value === "number" ? 1 : 0)},${sum + (value ?? 0)}`, [...witness, o.id]);
          }
        }
        states = next;
      }
      expect(states.size).toBe(45);
      for (const [key, witness] of states) {
        const [rated, sum] = key.split(",").map(Number), answers = all(); qs.forEach((q, i) => { answers[q.id] = witness[i]; });
        const result = scoreQuestionnaire(quiz, answers);
        if (result.status !== "complete" || !("facets" in result)) throw new Error("Full source witness rejected");
        expect(result.facets[direction.id]).toEqual({ sum, rated, total: 4, mean: rated >= 4 ? Math.round(sum / rated * 10) / 10 : null });
        for (const other of quiz.directions.filter(d => d.id !== direction.id)) expect(result.facets[other.id].mean).toBe(3);
        expect(result).not.toHaveProperty("leaders"); expect(result).not.toHaveProperty("total"); tested++;
      }
    }
    expect(tested).toBe(225);
    const answers = all(), part = source.questions.filter(q => q.options[0].directionId === "unchecked-retelling");
    ["1", "2", "3", "3"].forEach((v, i) => { answers[part[i].id] = v; });
    const scored = scoreQuestionnaire(quiz, answers); if (scored.status !== "complete" || !("facets" in scored)) throw new Error("Rejected exact witness");
    expect(scored.facets["unchecked-retelling"].sum).toBe(9); expect(scored.facets["unchecked-retelling"].mean).toBe(2.3);
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireHabitsReport quiz={quiz} result={scored} locale="en" />);
    expect(dom.querySelector('[data-habits-facet="unchecked-retelling"] [data-habits-mean]')?.textContent).toBe("2.25 / 5");
    expect(dom.querySelector('[data-habits-facet="comparison-turns"] [data-habits-mean]')?.textContent).toBe("3.00 / 5");
    for (const group of dom.querySelectorAll("dl > div")) { expect(group.querySelector("dt")).not.toBeNull(); expect(group.querySelector("dd")).not.toBeNull(); }

    console.info("225individual-part source-DP witnesses covering45rated/sum states each with0reverseitems; not6^20jointresponses, Cartesian coverage or psychometric validation.");
  });
  it("distinguishes inaccurate and uncertain from NA, rejects incomplete/malformed input and invalid configurations, and restores current drafts", () => {
    for (const value of ["1", "5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected input");
      for (const facet of Object.values(result.facets)) expect(facet.mean).toBe(value === "na" ? null : Number(value));
    }
    const partial = all(); delete partial[quiz.questions.at(-1)!.id]; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 19 });
    for (const bad of [null, [], "3", Object.create({ inherited: "3" }), { ...all(), unknown: "3" }, { ...all(), [quiz.questions[0].id]: "0" }, { ...all(), [quiz.questions[0].id]: 3 }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.minimumRatedItems = 5; }, (q: Questionnaire) => { q.questions[0].options[0].directionId = "unknown"; }, (q: Questionnaire) => { q.profiles[0].directionIds = ["comparison-turns"]; }, (q: Questionnaire) => { q.questions[0].id = q.questions[1].id; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }]) {
      const broken = structuredClone(quiz); mutate(broken); expect(scoreQuestionnaire(broken, all()).status).toBe("unavailable");
    }
    const now = 1000000000, draft = (version = quiz.version, savedAt = now) => JSON.stringify({ version, savedAt, answers: all() });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual(all()); expect(readQuestionnaireDraft(quiz, draft("other"), now)).toBeNull(); expect(readQuestionnaireDraft(quiz, draft(quiz.version, now - 86400000), now)).toBeNull();
  });
  it("uses its own5part report, all45unique full sections, explicit NA and no social-battery interpretation", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected input");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireHabitsReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-habits-facet]")).toHaveLength(5); expect(dom.querySelectorAll("h4")).toHaveLength(45); expect(dom.querySelectorAll("[data-habits-profile]")).toHaveLength(5);
      expect(dom.querySelectorAll("[data-habits-insufficient]")).toHaveLength(value === "na" ? 1 : 0);
      const ids = Array.from(dom.querySelectorAll("[id]"), x => x.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.textContent).not.toMatch(/battery|quiet recovery|coordination load|社交电量|安静恢复|learning effectiveness|format preferences|学习效果|PPS item/);
      if (value === "na") for (const mean of dom.querySelectorAll("[data-habits-mean]")) expect(mean.textContent).not.toMatch(/0|3\.0/);
    }
  });
  it("publishes twelve native bilingual entry/guideURLs with complete bodies and individual SEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/toxic-trait`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        const entryDom = document.createElement("div"); entryDom.innerHTML = html;
        for (const section of quiz.guide.slice(0, 3)) expect(entryDom.textContent).toContain(section.paragraphs[0][locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/toxic-trait/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/toxic-trait/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).not.toContain("data-habits-facet"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
