import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireSocialReport } from "@/components/questionnaires/QuestionnaireSocialReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const slug = "social-intelligence-test";
const quiz = JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
const parent = JSON.parse(readFileSync("lib/questionnaires/data/character-strengths.json", "utf8")) as Questionnaire;
const bytes = readFileSync(`tests/fixtures/questionnaires/${slug}-reference.json`);
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; sourceUrl: string; scoring: { independentCountIncrement: number } };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(source.questions.map(q => [q.id, value === "na" ? value : q.reverse ? String(6 - Number(value)) : value]));

describe("T069 public-domain IPIP-VIA-R four-item social-understanding focus", () => {
  it("retains the exact public-domain key and parent item identity without inventing another independent construct", () => {
    expect(quiz.questions).toEqual(source.questions); expect(quiz.questions).toEqual(parent.questions.filter(q => q.options[0].directionId === "social-intelligence"));
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(4); expect(quiz.minimumRatedItems).toBe(4);
    expect(source.sourceUrl).toBe("https://ipip.ori.org/IPIP-VIA-R_Key.html"); expect(source.scoring.independentCountIncrement).toBe(0);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.questions.map(q => q.id)).toEqual(["IPIPVIA_SOC_1", "IPIPVIA_SOC_3", "IPIPVIA_SOC_2", "IPIPVIA_SOC_4"]);
    expect(quiz.questions.map(q => q.prompt.en)).toEqual(["Am good at sensing what others are feeling.", "Don't know how to handle myself in a new social situation.", "Know what to say to make people feel good.", "Have trouble guessing how others will react."]);
    expect(quiz.questions.map(q => q.reverse)).toEqual([false, true, false, true]);
    expect(quiz.questions[0].options.map(o => o.label.en)).toEqual(["Very inaccurate", "Moderately inaccurate", "Neither inaccurate nor accurate", "Moderately accurate", "Very accurate", "Prefer not to answer / cannot judge"]);
    expect(quiz.directions).toEqual([{ id: "social-intelligence", title: { zh: "社交理解自述", en: "Social-understanding self-report" }, itemCount: 4 }]);
    expect(quiz.profiles).toHaveLength(1); expect(quiz.profiles[0].directionIds).toEqual(["social-intelligence"]);
    expect(quiz.profiles[0].sections.map(s => s.id)).toEqual(["edition", "scoring", "higher-reading", "lower-reading", "mixed-missing", "examples", "comparison", "evidence", "review-privacy"]);
    expect(quiz.profiles[0].sections.reduce((n, s) => n + s.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(850);
    const visit = (value: unknown): void => { if (!value || typeof value !== "object") return; const v = value as Record<string, unknown>; if ("en" in v || "zh" in v) { expect(v.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(v.zh).toMatch(/\p{Script=Han}/u); } else Object.values(v).forEach(visit); }; visit(quiz);
  });

  it("exhausts all1296 answer selections and matches the parent four-item arithmetic without claiming whole-form equivalence", () => {
    const choices = ["1", "2", "3", "4", "5", "na"], totals = new Set<number>(); let full = 0;
    const parentBase = Object.fromEntries(parent.questions.map(q => [q.id, "3"]));
    for (let encoded = 0; encoded < 1296; encoded++) {
      let rest = encoded, rated = 0, sum = 0; const answers: QuestionnaireAnswers = {};
      for (const q of source.questions) { const value = choices[rest % 6]; rest = Math.floor(rest / 6); answers[q.id] = value; if (value !== "na") { rated++; sum += q.reverse ? 6 - Number(value) : Number(value); } }
      const result = scoreQuestionnaire(quiz, answers), parentResult = scoreQuestionnaire(parent, { ...parentBase, ...answers });
      if (result.status !== "complete" || !("facets" in result) || parentResult.status !== "complete" || !("facets" in parentResult)) throw new Error("Admissible grid selection rejected");
      expect(result.facets["social-intelligence"]).toEqual({ sum, rated, total: 4, mean: rated === 4 ? Math.round(sum / 4 * 10) / 10 : null });
      expect(result.facets["social-intelligence"]).toEqual(parentResult.facets["social-intelligence"]);
      if (rated === 4) { full++; totals.add(sum); }
      for (const field of ["profileId", "profileIds", "leaders", "percentile", "socialIQ", "total"]) expect(result).not.toHaveProperty(field);
    }
    expect(full).toBe(625); expect([...totals].sort((a, b) => a - b)).toEqual(Array.from({ length: 17 }, (_, i) => i + 4));
    console.info("All6^4=1296 admissible answer selections inclNA checked; parent facet arithmetic only, not separate-administration or Chinese psychometric equivalence.");
  });

  it("preserves any missing rating, distinguishes an unfinished answer and rejects invalid configuration or stale drafts", () => {
    for (const value of ["1", "3", "5"]) { const result = scoreQuestionnaire(quiz, Object.fromEntries(source.questions.map(q => [q.id, value]))); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected midpoint witness"); expect(result.facets["social-intelligence"].sum).toBe(12); }
    const missing = all("4"); missing.IPIPVIA_SOC_4 = "na"; const result = scoreQuestionnaire(quiz, missing); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected missing rating"); expect(result.facets["social-intelligence"]).toEqual({ sum: 12, rated: 3, total: 4, mean: null });
    const partial = all(); delete partial.IPIPVIA_SOC_4; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 3 });
    for (const invalid of [null, [], new Date(), { ...all(), unknown: "3" }, { ...all(), IPIPVIA_SOC_1: "0" }, { IPIPVIA_SOC_1: 3 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    for (const change of [(q: Questionnaire) => { q.minimumRatedItems = 5; }, (q: Questionnaire) => { q.profiles[0].directionIds = ["unknown"]; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }]) { const bad = structuredClone(quiz); change(bad); expect(scoreQuestionnaire(bad, all()).status).toBe("unavailable"); }
    const draft = { version: quiz.version, savedAt: 123456, answers: all() }; expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123457)).toEqual(draft.answers); expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123456 + 86400000)).toBeNull();
  });

  it("shows raw totals first and exact two-decimal means, retaining all nine sections with NA", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["1", "5", "na", "exact9"]) {
      const answers = all(value === "exact9" ? "2" : value); if (value === "exact9") answers.IPIPVIA_SOC_1 = "3";
      const result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected report witness");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireSocialReport quiz={quiz} result={result} locale={locale} />);
      const missing = locale === "zh" ? "资料不足" : "Insufficient information";
      expect(dom.querySelectorAll("[data-social-facet]")).toHaveLength(1); expect(dom.querySelectorAll("[data-social-profile]")).toHaveLength(1); expect(dom.querySelectorAll("h4")).toHaveLength(9);
      expect(dom.querySelectorAll("[data-social-insufficient]")).toHaveLength(value === "na" ? 1 : 0);
      expect(dom.querySelector("[data-social-total]")?.textContent).toBe(value === "na" ? missing : value === "exact9" ? "9" : String(Number(value) * 4));
      expect(dom.querySelector("[data-social-mean]")?.textContent).toBe(value === "na" ? missing : value === "exact9" ? "2.25 / 5" : `${value}.00 / 5`);
      const count = dom.querySelector("[data-social-rated]"); expect(count?.tagName).toBe("DD"); expect(count?.parentElement?.querySelector("dt")?.textContent).toBe(locale === "zh" ? "本次有效条目" : "Ratings supplied"); expect(count?.textContent).toContain(`${value === "na" ? 0 : 4} / 4`);
      for (const group of Array.from(dom.querySelectorAll("dl > div"))) { expect(group.querySelector("dt")).not.toBeNull(); expect(group.querySelector("dd")).not.toBeNull(); }
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length); expect(dom.querySelector("[data-locus-facet], [data-facet-score]")).toBeNull();
      for (const section of quiz.profiles[0].sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    }
  });

  it("publishes four native bilingual pages with dedicated metadata, public-domain provenance and discovery", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/${slug}`, props = { params: Promise.resolve({ locale, slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(locale === "zh" ? "IPIP-VIA-R四条自述" : "Four IPIP-VIA-R self-reports"); expect(html).toContain(locale === "zh" ? "完整连续读法" : "Read the full continuum"); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      const profile = quiz.profiles[0], publicPath = `${path}/results/${profile.id}`, guideProps = { params: Promise.resolve({ locale, slug, profile: profile.id }) }, dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(guideProps)); const metadata = await guide.generateMetadata(guideProps);
      expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${slug}/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${slug}/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-social-total]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
