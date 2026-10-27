import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireCompassionReport, QuestionnaireCompassionNextSteps } from "@/components/questionnaires/QuestionnaireCompassionReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/empathy.json", "utf8")) as Questionnaire;
const ref = JSON.parse(readFileSync("tests/fixtures/questionnaires/empathy-reference.json", "utf8")) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; cases: { responses: string; expected: { sum: number; rated: number; total: number; mean: number | null } }[] };
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
const from = (values: string): QuestionnaireAnswers => Object.fromEntries([...values].map((v, i) => [quiz.questions[i].id, v === "n" ? "na" : v]));

describe("T091 complete IPIP Compassion-10 with one continuous full reading", () => {
  it("binds all ten source sentences, five reverse keys, accuracy anchors and complete bilingual editorial content", () => {
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toEqual(ref.questions); expect(quiz.profiles).toEqual(ref.profiles);
    expect(quiz.questions).toHaveLength(10); expect(quiz.minimumRatedItems).toBe(10); expect(quiz.directions).toEqual([{ id: "compassion", title: { en: "IPIP Compassion self-description", zh: "IPIP关怀倾向自我描述" }, itemCount: 10 }]);
    expect(quiz.source.itemBankSha256).toBe(hash(quiz.questions)); expect(quiz.source.resultContentSha256).toBe(hash(quiz.profiles)); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.questions.filter(q => q.reverse).map(q => q.id)).toEqual(["COMP10_02", "COMP10_04", "COMP10_06", "COMP10_08", "COMP10_10"]);
    expect(quiz.questions.filter(q => !q.reverse).map(q => q.prompt.en)).toEqual(["Feel others’ emotions.", "Inquire about others’ well-being.", "Sympathize with others’ feelings.", "Take an interest in other people’s lives.", "Like to do things for others."]);
    expect(quiz.questions.filter(q => q.reverse).map(q => q.prompt.en)).toEqual(["Am not interested in other people’s problems.", "Can’t be bothered with other’s needs.", "Am indifferent to the feelings of others.", "Take no time for others.", "Don’t have a soft side."]);
    expect(quiz.questions[0].options.map(o => o.label.en)).toEqual(["Very inaccurate", "Moderately inaccurate", "Neither inaccurate nor accurate", "Moderately accurate", "Very accurate", "Insufficient information / not applicable / prefer not to answer"]);
    expect(quiz.profiles).toHaveLength(1); expect(quiz.profiles[0].id).toBe("compassion-reading"); expect(quiz.profiles[0].sections).toHaveLength(12); expect(quiz.profiles[0].sections.flatMap(s => s.paragraphs)).toHaveLength(24);
    expect(quiz.references?.map(r => r.url)).toContain("https://ipip.ori.org/newPermission.htm");
    for (const title of [...Object.values(quiz.seoTitle), ...Object.values(quiz.profiles[0].seo!.title)]) expect(title).not.toMatch(/[|｜]\s*(?:FermatMind|费马测试)$/); expect(quiz.faq).toHaveLength(6);
    const visit = (x: unknown): void => { if (!x || typeof x !== "object") return; const o = x as Record<string, unknown>; if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(o.zh).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(visit); }; visit(quiz);
  });
  it("matches every independent Python reference witness, including all NA masks, reverse keys and worked40", () => {
    expect(ref.cases).toHaveLength(1777);
    for (const c of ref.cases) {
      const r = scoreQuestionnaire(quiz, from(c.responses)); if (r.status !== "complete" || !("facets" in r)) throw new Error("Complete witness rejected");
      expect(r.facets.compassion).toEqual(c.expected); expect(Object.keys(r)).toEqual(["status", "answered", "facets"]);
      for (const key of ["profileId", "profileIds", "percentile", "band", "emotionalResonance", "caringAction"]) expect(r).not.toHaveProperty(key);
    }
  });
  it("preserves partial, invalid and unavailable distinctions without filling unscored answers", () => {
    const answers = from("4231524342"); delete answers.COMP10_10; expect(scoreQuestionnaire(quiz, answers)).toEqual({ status: "incomplete", answered: 9 });
    for (const bad of [null, [], new Date(), { ...from("3333333333"), unknown: "3" }, { ...from("3333333333"), COMP10_01: "0" }, { COMP10_01: 3 }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.minimumRatedItems = 11; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }, (q: Questionnaire) => { q.profiles[0].directionIds = ["unknown"]; }]) { const bad = structuredClone(quiz); mutate(bad); expect(scoreQuestionnaire(bad, from("3333333333")).status).toBe("unavailable"); }
  });
  it("renders the exact total and one-decimal mean with all24paragraphs, even when personal numbers are withheld", () => {
    for (const locale of ["en", "zh"] as const) for (const [raw, total, mean] of [["4231524342", "40", "4.0 / 5"], ["5151515151", "50", "5.0 / 5"], ["1515151515", "10", "1.0 / 5"], ["1111111111", "30", "3.0 / 5"], ["nnnnnnnnnn", null, null], ["423152434n", null, null]] as const) {
      const r = scoreQuestionnaire(quiz, from(raw)); if (r.status !== "complete" || !("facets" in r)) throw new Error("Report witness rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<><QuestionnaireCompassionReport quiz={quiz} result={r} locale={locale} /><QuestionnaireCompassionNextSteps locale={locale} /></>);
      const missing = locale === "zh" ? "资料不足" : "Insufficient information";
      expect(dom.querySelector("[data-compassion-total]")?.textContent).toBe(total ?? missing); expect(dom.querySelector("[data-compassion-mean]")?.textContent).toBe(mean ?? missing);
      expect(dom.querySelectorAll("[data-compassion-insufficient]")).toHaveLength(total === null ? 1 : 0); expect(dom.querySelectorAll("h4")).toHaveLength(12);
      for (const section of quiz.profiles[0].sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const item of Array.from(dom.querySelectorAll("dl > div"))) { expect(item.querySelector("dt")).not.toBeNull(); expect(item.querySelector("dd")).not.toBeNull(); }
      expect(dom.querySelector("a[href*='tests/mbti']")).toBeNull(); expect(dom.querySelector("a[href*='compassion-reading']")).not.toBeNull();
    }
  });
  it("publishes four complete native ENZH pages with source badges, dedicated metadata and discovery", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/empathy`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, metadata = await entry.generateMetadata(props);
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props));
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(locale === "zh" ? "IPIP公有领域条目" : "Public-domain IPIP items");
        const method = dom.querySelector('section[aria-labelledby="questionnaire-method"]'); expect(method?.querySelectorAll("p")).toHaveLength(3);
        for (const section of quiz.guide.slice(0, 3)) for (const paragraph of section.paragraphs) expect(method?.textContent).toContain(paragraph[locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`); expect(maps.some(e => e.loc === `https://fermatmind.com${path}`)).toBe(true);
        const profile = quiz.profiles[0], publicPath = `${path}/results/${profile.id}`, args = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, meta = await guide.generateMetadata(args);
        dom.innerHTML = renderToStaticMarkup(await guide.default(args)); expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
        for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
        expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
        expect(meta.alternates?.languages).toMatchObject({ en: "https://fermatmind.com/en/tests/explore/empathy/results/compassion-reading", "zh-CN": "https://fermatmind.com/zh/tests/explore/empathy/results/compassion-reading" });
        expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-compassion-total]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
