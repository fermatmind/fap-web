import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireCharacterStrengthsReport } from "@/components/questionnaires/QuestionnaireCharacterStrengthsReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/character-strengths.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/character-strengths-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"] };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(source.questions.map(q => [q.id, value === "na" ? value : q.reverse ? String(6 - Number(value)) : value]));

describe("T029 public-domain IPIP-VIA-R96 reflection", () => {
  it("binds96official English items with independent Chinese translation,48reverse and24fullguides", () => {
    expect(quiz.questions).toEqual(source.questions); expect(quiz.questions).toHaveLength(96); expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.source.kind).toContain("Public-domain IPIP-VIA-R96officialEnglishkey");
    for (const d of quiz.directions) expect(quiz.questions.filter(q => q.options[0].directionId === d.id && q.reverse)).toHaveLength(2);
    expect(quiz.directions.map(d => d.id)).toEqual(source.questions.slice(0,24).map(q => q.options[0].directionId));
    expect(quiz.questions.filter(q => q.reverse)).toHaveLength(48); expect(quiz.minimumRatedItems).toBe(4);
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
    for (const bank of ["learning-style", "procrastinator-type-test", "difficult-person-test", "likable-person-test", "people-pleaser", "music-taste-test", "humor-style-test", "communication-style", "social-battery-test", "attachment-styles", "love-languages", "leadership-style"]) {
      const other = JSON.parse(readFileSync(`lib/questionnaires/data/${bank}.json`, "utf8")) as Questionnaire;
      const prompts = new Set(other.questions.flatMap(q => [q.prompt.en, q.prompt.zh]));
      for (const question of quiz.questions) expect(prompts.has(question.prompt.en) || prompts.has(question.prompt.zh)).toBe(false);
    }
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(96); expect(new Set(quiz.profiles.map(p => p.seo!.title.en)).size).toBe(24);
  });
  it("matches1080source-part DP states with48reverse, all-four requirement and separate sums/means", () => {
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
        expect(result.facets[direction.id]).toEqual({ sum, rated, total: 4, mean: rated === 4 ? Math.round(sum / rated * 10) / 10 : null });
        for (const other of quiz.directions.filter(d => d.id !== direction.id)) expect(result.facets[other.id].mean).toBe(3);
        expect(result).not.toHaveProperty("leaders"); expect(result).not.toHaveProperty("total"); tested++;
      }
    }
    expect(tested).toBe(1080);
    console.info("1080individual-part source-DP witnesses covering45rated/sum states each with48reverseitems; not6^96individual answers, Cartesian coverage or psychometric validation.");
  });
  it("distinguishes never from NA, rejects incomplete/malformed input and invalid configurations, and restores current drafts", () => {
    for (const value of ["1", "5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected input");
      for (const facet of Object.values(result.facets)) expect(facet.mean).toBe(value === "na" ? null : Number(value));
    }
    const straight = scoreQuestionnaire(quiz, Object.fromEntries(quiz.questions.map(q => [q.id,"5"])));
    if (straight.status !== "complete" || !("facets" in straight)) throw new Error("Rejected straight-line input");
    for (const facet of Object.values(straight.facets)) expect(facet).toMatchObject({sum:12,rated:4,mean:3});
    const oneNA = all("5"); oneNA[quiz.questions[0].id]="na";
    const missing = scoreQuestionnaire(quiz,oneNA); if(missing.status!=="complete" || !("facets" in missing)) throw new Error("Rejected NA");
    expect(missing.facets[quiz.questions[0].options[0].directionId]).toMatchObject({rated:3,mean:null});
    const partial = all(); delete partial[quiz.questions.at(-1)!.id]; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 95 });
    for (const bad of [null, [], "3", Object.create({ inherited: "3" }), { ...all(), unknown: "3" }, { ...all(), [quiz.questions[0].id]: "0" }, { ...all(), [quiz.questions[0].id]: 3 }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.minimumRatedItems = 5; }, (q: Questionnaire) => { q.questions[0].options[0].directionId = "unknown"; }, (q: Questionnaire) => { q.profiles[0].directionIds = ["love"]; }, (q: Questionnaire) => { q.questions[0].id = q.questions[1].id; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }]) {
      const broken = structuredClone(quiz); mutate(broken); expect(scoreQuestionnaire(broken, all()).status).toBe("unavailable");
    }
    const now = 1000000000, draft = (version = quiz.version, savedAt = now) => JSON.stringify({ version, savedAt, answers: all() });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual(all()); expect(readQuestionnaireDraft(quiz, draft("other"), now)).toBeNull(); expect(readQuestionnaireDraft(quiz, draft(quiz.version, now - 86400000), now)).toBeNull();
  });
  it("uses its own24part report, all216full sections, explicit NA and no social-battery interpretation", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected input");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireCharacterStrengthsReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-character-facet]")).toHaveLength(24); expect(dom.querySelectorAll("h4")).toHaveLength(216); expect(dom.querySelectorAll("[data-character-profile]")).toHaveLength(24);
      expect(dom.querySelectorAll("[data-character-insufficient]")).toHaveLength(value === "na" ? 1 : 0);
      expect(dom.querySelectorAll("[data-character-sum]")).toHaveLength(value === "na" ? 0 : 24);
      expect(dom.querySelector("[data-character-source] a")?.getAttribute("href")).toBe("https://ipip.ori.org/IPIP-VIA-R_Key.html");
      const next = new URL(dom.querySelector("[data-character-career-next] a")!.getAttribute("href")!, "https://fermatmind.com");
      expect(next.pathname).toBe(`/${locale}/tests/holland-career-interest-test-riasec`); expect(next.searchParams.get("target_action")).toBe("questionnaire_result_riasec");
      expect(next.search).not.toMatch(/IPIPVIA_|answers|score|belief/);
      const ids = Array.from(dom.querySelectorAll("[id]"), x => x.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.textContent).not.toMatch(/battery|quiet recovery|coordination load|社交电量|安静恢复|sound preferences|PPS item|Almost always|最近四周|1从不|5几乎总是/);
      if (value === "na") for (const mean of dom.querySelectorAll("[data-character-mean]")) expect(mean.textContent).not.toMatch(/0|3\.0/);
    }
  });
  it("publishes fifty native bilingual entry/guideURLs with complete bodies and individual SEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/character-strengths`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        for (const section of quiz.guide.slice(0, 3)) expect(html).toContain(section.paragraphs[0][locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("[data-character-source] a")?.getAttribute("href")).toBe("https://ipip.ori.org/IPIP-VIA-R_Key.html");
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/character-strengths/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/character-strengths/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).not.toContain("data-character-facet"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
