import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireEgogramReport } from "@/components/questionnaires/QuestionnaireEgogramReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const slug = "egogram";
const quiz = JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
const bytes = readFileSync(`tests/fixtures/questionnaires/${slug}-reference.json`);
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; sourceUrl: string };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(source.questions.map(q => [q.id, value]));

describe("T070 original five functional-stance frequency reflections", () => {
  it("preserves twenty original bilingual actions, five separate groups and all five full guides", () => {
    expect(quiz.questions).toEqual(source.questions); expect(quiz.questions).toHaveLength(20); expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(source.sourceUrl).toBe("https://journals.sagepub.com/doi/10.1177/036215377900900103"); expect(quiz.minimumRatedItems).toBe(4);
    expect(quiz.directions.map(d => d.id)).toEqual(["critical-parent", "nurturing-parent", "adult", "free-child", "adapted-child"]);
    expect(quiz.questions.filter(q => q.reverse)).toHaveLength(0); expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(20);
    expect(quiz.questions[0].options.map(o => o.label.en)).toEqual(["Never", "Rarely", "Sometimes", "Often", "Almost always", "No relevant opportunity / cannot judge / prefer not to answer"]);
    for (const direction of quiz.directions) {
      expect(direction.itemCount).toBe(4); expect(quiz.questions.filter(q => q.options[0].directionId === direction.id)).toHaveLength(4);
      const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!; expect(profile.id).toBe(direction.id); expect(profile.sections).toHaveLength(9);
      expect(profile.sections.reduce((n, s) => n + s.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(850);
      expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160);
    }
    expect(quiz.profiles).toHaveLength(5);
    const visit = (value: unknown): void => { if (!value || typeof value !== "object") return; const v = value as Record<string, unknown>; if ("en" in v || "zh" in v) { expect(v.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(v.zh).toMatch(/\p{Script=Han}/u); } else Object.values(v).forEach(visit); }; visit(quiz);
  });

  it("matches225 independent facet rated/sum witnesses without a whole-form total, dominance or energy shares", () => {
    let checked = 0, complete = 0;
    for (const direction of quiz.directions) {
      const questions = source.questions.filter(q => q.options[0].directionId === direction.id); let states = new Map<string, string[]>([["0,0", []]]);
      for (const question of questions) {
        const next = new Map<string, string[]>();
        for (const [key, witness] of states) { const [rated, sum] = key.split(",").map(Number); for (const option of question.options) { const value = option.score!; next.set(`${rated + (value === null ? 0 : 1)},${sum + (value ?? 0)}`, [...witness, option.id]); } }
        states = next;
      }
      expect(states.size).toBe(45);
      for (const [key, witness] of states) {
        const [rated, sum] = key.split(",").map(Number), answers = all("na"); for (const [i, q] of questions.entries()) answers[q.id] = witness[i];
        const result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("facets" in result)) throw new Error("Facet witness rejected");
        expect(result.facets[direction.id]).toEqual({ sum, rated, total: 4, mean: rated === 4 ? Math.round(sum / 4 * 10) / 10 : null });
        for (const other of quiz.directions.filter(d => d.id !== direction.id)) expect(result.facets[other.id]).toEqual({ sum: 0, rated: 0, total: 4, mean: null });
        for (const field of ["profileId", "profileIds", "leaders", "total", "percentile", "energy", "dominantState"]) expect(result).not.toHaveProperty(field);
        checked++; if (rated === 4) complete++;
      }
    }
    expect(checked).toBe(225); expect(complete).toBe(85); console.info("225independent facet witnesses, not6^20joint response paths or psychometric validation.");
  });

  it("keeps every group independent with a missing rating, rejecting unfinished or invalid answers and stale drafts", () => {
    const answers = all("4"); answers.EGO_CP_04 = "na"; const result = scoreQuestionnaire(quiz, answers);
    if (result.status !== "complete" || !("facets" in result)) throw new Error("Missing-facet witness rejected");
    expect(result.facets["critical-parent"]).toEqual({ sum: 12, rated: 3, total: 4, mean: null });
    for (const d of quiz.directions.slice(1)) expect(result.facets[d.id]).toEqual({ sum: 16, rated: 4, total: 4, mean: 4 });
    const partial = all(); delete partial.EGO_AC_04; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 19 });
    for (const invalid of [null, [], new Date(), { ...all(), unknown: "3" }, { ...all(), EGO_CP_01: "0" }, { EGO_CP_01: 3 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    for (const change of [(q: Questionnaire) => { q.minimumRatedItems = 5; }, (q: Questionnaire) => { q.profiles[0].directionIds = ["unknown"]; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }]) { const bad = structuredClone(quiz); change(bad); expect(scoreQuestionnaire(bad, all()).status).toBe("unavailable"); }
    const draft = { version: quiz.version, savedAt: 123456, answers: all() }; expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123457)).toEqual(draft.answers); expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123456 + 86400000)).toBeNull();
  });

  it("renders five accessible raw scores and exact means with every full guide, retaining NA without an invented zero bar", () => {
    for (const locale of ["en", "zh"] as const) for (const mode of ["exact9", "na", "missing-part"]) {
      const answers = all(mode === "na" ? "na" : mode === "missing-part" ? "4" : "2"); if (mode === "exact9") answers.EGO_CP_01 = "3"; if (mode === "missing-part") answers.EGO_CP_04 = "na";
      const result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("facets" in result)) throw new Error("Report witness rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireEgogramReport quiz={quiz} result={result} locale={locale} />);
      const legend = dom.querySelector("[data-ego-legend]"); expect(legend).not.toBeNull(); for (const option of quiz.questions[0].options.slice(0, 5)) expect(legend?.textContent).toContain(`${option.id}${locale === "zh" ? "" : " "}${option.label[locale]}`);
      expect(dom.querySelectorAll("[data-ego-facet]")).toHaveLength(5); expect(dom.querySelectorAll("[data-ego-profile]")).toHaveLength(5); expect(dom.querySelectorAll("h4")).toHaveLength(45);
      expect(dom.querySelectorAll("[data-ego-insufficient]")).toHaveLength(mode === "na" ? 5 : mode === "missing-part" ? 1 : 0); expect(dom.querySelectorAll("[data-ego-bar]")).toHaveLength(mode === "na" ? 0 : mode === "missing-part" ? 4 : 5);
      for (const direction of quiz.directions) {
        const facet = result.facets[direction.id], section = dom.querySelector(`[data-ego-facet="${direction.id}"]`)!, valid = facet.rated === 4, missing = locale === "zh" ? "资料不足" : "Insufficient information";
        expect(section.querySelector("[data-ego-total]")?.textContent).toBe(valid ? String(facet.sum) : missing); expect(section.querySelector("[data-ego-mean]")?.textContent).toBe(valid ? `${(facet.sum / 4).toFixed(2)} / 5` : missing);
        const count = section.querySelector("[data-ego-rated]"); expect(count?.tagName).toBe("DD"); expect(count?.parentElement?.querySelector("dt")?.textContent).toBe(locale === "zh" ? "本次有效条目" : "Ratings supplied"); expect(count?.textContent).toContain(`${facet.rated} / 4`);
        if (mode === "exact9" && direction.id === "critical-parent") { expect(section.querySelector("[data-ego-total]")?.textContent).toBe("9"); expect(section.querySelector("[data-ego-mean]")?.textContent).toBe("2.25 / 5"); }
      }
      for (const group of Array.from(dom.querySelectorAll("dl > div"))) { expect(group.querySelector("dt")).not.toBeNull(); expect(group.querySelector("dd")).not.toBeNull(); }
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length); expect(dom.querySelector("[data-facet-score], [data-social-total]")).toBeNull();
      for (const profile of quiz.profiles) for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    }
  });

  it("publishes twelve complete native ENZH pages with dedicated metadata, source scope and public discovery", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/${slug}`, props = { params: Promise.resolve({ locale, slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(locale === "zh" ? "原创五组互动观察" : "Original reflection on five interaction stances"); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, guideProps = { params: Promise.resolve({ locale, slug, profile: profile.id }) }, dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(guideProps)); const metadata = await guide.generateMetadata(guideProps);
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${slug}/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${slug}/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-ego-total]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
