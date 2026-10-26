import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireLocusReport } from "@/components/questionnaires/QuestionnaireLocusReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const slug = "locus-of-control";
const quiz = JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
const bytes = readFileSync(`tests/fixtures/questionnaires/${slug}-reference.json`);
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; sourceUrl: string };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(source.questions.map(q => [q.id, value === "na" ? value : q.reverse ? String(6 - Number(value)) : value]));

describe("T061 public-domain IPIP twenty-item total locus of control", () => {
  it("binds the full20 English total key, ten reversals, trial Chinese and one complete continuum guide", () => {
    expect(quiz.questions).toEqual(source.questions); expect(quiz.questions).toHaveLength(20); expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(source.sourceUrl).toBe("https://www.ipip.ori.org/newSingleConstructsKey.htm");
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.minimumRatedItems).toBe(20); expect(quiz.directions).toHaveLength(1); expect(quiz.directions[0].itemCount).toBe(20);
    expect(quiz.questions.filter(q => q.reverse).map(q => q.id)).toEqual(Array.from({ length: 10 }, (_, i) => `LOC_${String((i + 1) * 2).padStart(2, "0")}`));
    expect(quiz.questions.filter(q => !q.reverse).map(q => q.prompt.en)).toEqual(["Feel comfortable with myself.", "Believe that my success depends on ability rather than luck.", "Just know that I will be a success.", "Come up with good solutions.", "Love life.", "Act comfortably with others.", "Feel up to any task.", "Like to take responsibility for making decisions.", "Take the initiative.", "Make a decision and move on."]);
    expect(quiz.questions.filter(q => q.reverse).map(q => q.prompt.en)).toEqual(["Believe that unfortunate events occur because of bad luck.", "Believe that the world is controlled by a few powerful people.", "Feel that my life lacks direction.", "See difficulties everywhere.", "Habitually blow my chances.", "Believe some people are born lucky.", "Dislike taking responsibility for making decisions.", "Am less capable than most people.", "Dislike myself.", "Feel that I'm unable to deal with things."]);
    expect(quiz.questions[0].options.map(o => o.label.en)).toEqual(["Very inaccurate", "Moderately inaccurate", "Neither inaccurate nor accurate", "Moderately accurate", "Very accurate", "Insufficient information / not applicable / prefer not to answer"]);
    expect(quiz.profiles).toHaveLength(1); expect(quiz.profiles[0].directionIds).toEqual(["total-control-beliefs"]); expect(quiz.profiles[0].sections.map(s => s.id)).toEqual(["edition", "scoring", "higher-reading", "lower-reading", "mixed-missing", "examples", "comparison", "evidence", "review-privacy"]);
    expect(quiz.profiles[0].sections.reduce((n, s) => n + s.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(750);
    const optimism = JSON.parse(readFileSync("lib/questionnaires/data/optimism-pessimism.json", "utf8")) as Questionnaire;
    const reused = new Set(optimism.questions.map(q => q.prompt.en)); expect(quiz.questions.filter(q => reused.has(q.prompt.en))).toHaveLength(5);
    const visit = (value: unknown): void => { if (!value || typeof value !== "object") return; const v = value as Record<string, unknown>; if ("en" in v || "zh" in v) { expect(v.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(v.zh).toMatch(/\p{Script=Han}/u); } else Object.values(v).forEach(visit); }; visit(quiz);
  });

  it("matches861 independent source rated/sum states and all81 complete totals without derived types or subscales", () => {
    let states = new Map<string, string[]>([["0,0", []]]);
    for (const question of source.questions) {
      const next = new Map<string, string[]>();
      for (const [key, witness] of states) {
        const [rated, sum] = key.split(",").map(Number);
        for (const option of question.options) { const keyed = option.score === null ? null : question.reverse ? 6 - option.score! : option.score!; next.set(`${rated + (keyed === null ? 0 : 1)},${sum + (keyed ?? 0)}`, [...witness, option.id]); }
      }
      states = next;
    }
    expect(states.size).toBe(861); let full = 0;
    for (const [key, witness] of states) {
      const [rated, sum] = key.split(",").map(Number), answers = Object.fromEntries(source.questions.map((q, i) => [q.id, witness[i]]));
      const result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("facets" in result)) throw new Error("Complete source witness rejected");
      expect(result.facets["total-control-beliefs"]).toEqual({ sum, rated, total: 20, mean: rated === 20 ? Math.round(sum / 20 * 10) / 10 : null });
      if (rated === 20) { full++; expect(sum).toBeGreaterThanOrEqual(20); expect(sum).toBeLessThanOrEqual(100); }
      for (const field of ["profileId", "profileIds", "leaders", "total", "percentile", "internality", "chance", "powerfulOthers"]) expect(result).not.toHaveProperty(field);
    }
    expect(full).toBe(81); console.info("861reachable rated/sum source witnesses and81 complete raw totals; not6^20individual executions, norms or psychometric validation.");
  });

  it("distinguishes raw endpoints, neutral/repeated-rating midpoint and any missing rating, rejecting partial or invalid data", () => {
    for (const value of ["1", "3", "5", "na"]) { const r = scoreQuestionnaire(quiz, all(value)); if (r.status !== "complete" || !("facets" in r)) throw new Error("Rejected endpoint"); expect(r.facets["total-control-beliefs"]).toMatchObject({ mean: value === "na" ? null : Number(value), sum: value === "na" ? 0 : Number(value) * 20 }); }
    for (const value of ["1", "5"]) { const r = scoreQuestionnaire(quiz, Object.fromEntries(source.questions.map(q => [q.id, value]))); if (r.status !== "complete" || !("facets" in r)) throw new Error("Rejected repeated rating"); expect(r.facets["total-control-beliefs"].sum).toBe(60); }
    const missing = all("4"); missing.LOC_20 = "na"; const result = scoreQuestionnaire(quiz, missing); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected NA"); expect(result.facets["total-control-beliefs"]).toEqual({ rated: 19, total: 20, sum: 76, mean: null });
    const partial = all(); delete partial.LOC_20; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 19 });
    for (const invalid of [null, [], new Date(), { ...all(), unknown: "3" }, { ...all(), LOC_01: "0" }, { LOC_01: 3 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    for (const change of [(q: Questionnaire) => { q.minimumRatedItems = 21; }, (q: Questionnaire) => { q.profiles[0].directionIds = ["unknown"]; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }]) { const bad = structuredClone(quiz); change(bad); expect(scoreQuestionnaire(bad, all()).status).toBe("unavailable"); }
    const draft = { version: quiz.version, savedAt: 123456, answers: all() }; expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123457)).toEqual(draft.answers); expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123456 + 86400000)).toBeNull();
  });

  it("renders raw sums and unrounded-derived means accurately with the full guide for endpoints or NA", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["1", "5", "na", "exact41"]) {
      const answers = all(value === "exact41" ? "2" : value); if (value === "exact41") answers.LOC_01 = "3";
      const result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected report witness");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireLocusReport quiz={quiz} result={result} locale={locale} />);
      const missing = locale === "zh" ? "资料不足" : "Insufficient information";
      expect(dom.querySelectorAll("[data-locus-facet]")).toHaveLength(1); expect(dom.querySelectorAll("[data-locus-profile]")).toHaveLength(1); expect(dom.querySelectorAll("h4")).toHaveLength(9);
      expect(dom.querySelectorAll("[data-locus-insufficient]")).toHaveLength(value === "na" ? 1 : 0);
      const count = dom.querySelector("[data-locus-rated]"); expect(count?.tagName).toBe("DD"); expect(count?.parentElement?.querySelector("dt")?.textContent).toBe(locale === "zh" ? "本次有效条目" : "Ratings supplied"); expect(count?.textContent).toContain(`${value === "na" ? 0 : 20} / 20`);
      for (const group of Array.from(dom.querySelectorAll("dl > div"))) { expect(group.querySelector("dt")).not.toBeNull(); expect(group.querySelector("dd")).not.toBeNull(); }
      expect(dom.querySelector("[data-locus-total]")?.textContent).toBe(value === "na" ? missing : value === "exact41" ? "41" : String(Number(value) * 20));
      expect(dom.querySelector("[data-locus-mean]")?.textContent).toBe(value === "na" ? missing : value === "exact41" ? "2.05 / 5" : `${value}.00 / 5`);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length); expect(dom.querySelector("[data-growth-facet], [data-facet-score], [data-sdt-needs-facet]")).toBeNull();
      for (const section of quiz.profiles[0].sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    }
  });

  it("publishes four complete native ENZH pages with IPIP provenance, dedicated metadata and discovery", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/${slug}`, props = { params: Promise.resolve({ locale, slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(locale === "zh" ? "IPIP公有领域条目" : "Public-domain IPIP items"); expect(html).toContain(locale === "zh" ? "完整连续读法" : "Read the full continuum"); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      const profile = quiz.profiles[0], publicPath = `${path}/results/${profile.id}`, guideProps = { params: Promise.resolve({ locale, slug, profile: profile.id }) }, dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(guideProps)); const metadata = await guide.generateMetadata(guideProps);
      expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${slug}/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${slug}/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-locus-total]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
