import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isOptimismConfigurationValid, scoreOptimismQuestionnaire } from "@/lib/questionnaires/optimism";
import { readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireOptimismReport } from "@/components/questionnaires/QuestionnaireOptimismReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/optimism-pessimism.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/optimism-pessimism-reference.json");
const reference = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; upstreamItems: { english: string; reverse: boolean; sample50Position: number }[]; upstream: { url: string }[] };
const all = (value: string): QuestionnaireAnswers => Object.fromEntries(reference.questions.map(q => [q.id, value]));
const ids = ["lower", "lower-middle", "middle", "upper-middle", "higher"];
// Independent interval oracle: all closed ranges include both neighbours at 18/26/34/42.
const expectedIds = (sum: number) => ids.filter((_, i) => sum >= [10, 18, 26, 34, 42][i] && sum <= [18, 26, 34, 42, 50][i]);

describe("T052 public-domain IPIP single-construct Optimism reflection", () => {
  it("binds the exact English item keys, independent translation and five complete native result assets", () => {
    expect(isOptimismConfigurationValid(quiz)).toBe(true);
    expect(quiz.questions).toEqual(reference.questions);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(reference.upstreamItems).toHaveLength(10);
    for (const item of reference.upstreamItems) {
      const sourceItem = quiz.questions.find(q => q.prompt.en === item.english)!;
      expect(sourceItem).toBeTruthy(); expect(sourceItem.reverse).toBe(item.reverse);
      
    }
    expect(reference.upstreamItems.filter(i => i.reverse)).toHaveLength(6);
    expect(quiz.references!.map(r => r.url)).toContain("https://ipip.ori.org/newPermission.htm");
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(new Set(quiz.profiles.map(p => p.id))).toEqual(new Set(ids));
    for (const profile of quiz.profiles) {
      expect(profile.sections.map(s => s.id)).toEqual(["meaning", "worked-example", "ordinary-context", "wording", "comparison", "counterexamples", "observation", "scoring", "scope"]);
      expect(profile.sections.slice(0, 8).flatMap(s => s.paragraphs.map(p => p.en)).join(" ").split(/\s+/).length).toBeGreaterThan(350);
      expect(profile.seo?.title.en).toBeTruthy(); expect(profile.seo?.description.zh).toBeTruthy();
      expect(profile.sections.at(-1)?.paragraphs[0].en).toContain("without language-equivalence or psychometric validation");
    }
    const check = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      const v = value as Record<string, unknown>;
      if ("en" in v || "zh" in v) {
        expect(String(v.en)).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u);
        expect(String(v.en).trim().length).toBeGreaterThan(0); expect(String(v.zh)).toMatch(/\p{Script=Han}/u);
      } else Object.values(v).forEach(check);
    };
    check(quiz);
  });

  it("checks every reachable rated-count/raw-sum state against independent source keys, including all41valid totals and4boundaries", () => {
    let states = new Map<string, { rated: number; sum: number; answers: QuestionnaireAnswers }>([["0:0", { rated: 0, sum: 0, answers: {} }]]);
    for (const item of reference.upstreamItems) {
      const sourceQuestionId = reference.questions.find(q => q.prompt.en === item.english)!.id;
      const next = new Map<string, { rated: number; sum: number; answers: QuestionnaireAnswers }>();
      for (const state of states.values()) for (const value of ["1", "2", "3", "4", "5", "na"]) {
        const rated = state.rated + Number(value !== "na"), sum = state.sum + (value === "na" ? 0 : item.reverse ? 6 - Number(value) : Number(value));
        next.set(`${rated}:${sum}`, { rated, sum, answers: { ...state.answers, [sourceQuestionId]: value } });
      }
      states = next;
    }
    expect(states.size).toBe(231);
    const matchSets = new Set<string>(), totals = new Set<number>();
    for (const { rated, sum, answers } of states.values()) {
      const actual = scoreQuestionnaire(quiz, answers);
      if (actual.status !== "complete" || !("outlookProfileIds" in actual)) throw new Error("Complete source witness rejected");
      expect(actual.answered).toBe(10); expect(actual.rated).toBe(rated);
      expect(actual.total).toBe(rated === 10 ? sum : null); expect(actual.mean).toBe(rated === 10 ? sum / 10 : null);
      expect(actual.outlookProfileIds).toEqual(rated === 10 ? expectedIds(sum) : []);
      if (rated === 10) { totals.add(sum); matchSets.add(actual.outlookProfileIds.join("|")); }
      expect(actual).not.toHaveProperty("percentile"); expect(actual).not.toHaveProperty("mbti");
    }
    expect(totals.size).toBe(41); expect(matchSets.size).toBe(9);
    console.info("IPIP Optimism: all231reachable rated-count/raw-sum states,41valid totals,9match sets; not6^10individual answer executions or psychometric validation.");
  });

  it("withholds partial and missing-data interpretations, rejects malformed forms and restores valid drafts", () => {
    const partial = all("3"); delete partial.IPIP_OPT_10;
    expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 9 });
    expect(scoreQuestionnaire(quiz, all("na"))).toEqual({ status: "complete", answered: 10, rated: 0, total: null, mean: null, outlookProfileIds: [] });
    for (const invalid of [null, [], new Date(), { unknown: "3" }, { IPIP_OPT_01: "6" }, { IPIP_OPT_01: 3 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    for (const mutate of [
      (q: Questionnaire) => { q.questions[1].reverse = false; },
      (q: Questionnaire) => { q.questions[0].id = "IPIP_OPT_00"; },
      (q: Questionnaire) => { q.questions[0].options[5].score = 0; },
      (q: Questionnaire) => { q.minimumRatedItems = 9; },
      (q: Questionnaire) => { q.profiles[0].id = "fake"; },
      (q: Questionnaire) => { q.source.scoringVersion = "future"; },
    ]) { const bad = structuredClone(quiz); mutate(bad); expect(scoreQuestionnaire(bad, {}).status).toBe("unavailable"); }
    for (const answers of [partial, all("na"), all("3")]) {
      const draft = { version: quiz.version, savedAt: 123456, answers };
      expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123457)).toEqual(answers);
      expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123456 + 86400000)).toBeNull();
    }
    for (const [value, total] of [["1", 34], ["3", 30], ["5", 26]] as const) {
      const actual = scoreOptimismQuestionnaire(quiz, all(value));
      expect(actual.status === "complete" && actual.total).toBe(total);
    }
  });

  it("renders both complete boundary reports without duplicate IDs and renders no score or classification for missing data", () => {
    for (const locale of ["en", "zh"] as const) {
      const result = scoreOptimismQuestionnaire(quiz, all("1")); if (result.status !== "complete") throw new Error("Invalid witness");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireOptimismReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-optimism-match]")).toHaveLength(2); expect(dom.querySelectorAll("h4")).toHaveLength(18);
      const htmlIds = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(htmlIds).size).toBe(htmlIds.length);
      const missing = scoreOptimismQuestionnaire(quiz, all("na")); if (missing.status !== "complete") throw new Error("Invalid missing witness");
      dom.innerHTML = renderToStaticMarkup(<QuestionnaireOptimismReport quiz={quiz} result={missing} locale={locale} />);
      expect(dom.querySelectorAll("[data-optimism-score], [data-optimism-match]")).toHaveLength(0);
      expect(dom.querySelectorAll("a")).toHaveLength(5); expect(dom.querySelector("[data-optimism-insufficient]")).toBeTruthy();
    }
  });

  it("publishes one primary entry and all10full native public guides with individual metadata, canonical/hreflang and sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, path = `/${locale}/tests/explore/${quiz.slug}`;
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(metadata.title).toBe(quiz.seoTitle[locale]);
        expect(html).toContain(locale === "zh" ? "IPIP公有领域条目自评" : "Public-domain IPIP item reflection");
        const entryDom = document.createElement("div"); entryDom.innerHTML = html;
        for (const section of quiz.guide.slice(0, 3)) expect(entryDom.textContent).toContain(section.paragraphs[0][locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          expect(dom.textContent).toContain(locale === "zh" ? "五份阅读区域及18、26、34、42" : "Five regions and both adjacent guides at 18, 26, 34 and 42");
          for (const section of profile.sections) {
            expect(dom.querySelector(`#report-${section.id} h2`)?.textContent).toBe(section.title[locale]);
            for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          }
          expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).not.toContain("data-optimism-score"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
