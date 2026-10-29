import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { isWorkRole12ConfigurationValid, recordWorkRole12, workRoleDefinitions, workRoleStates } from "@/lib/questionnaires/workRole12";
import { QuestionnaireWorkRoleNextSteps, QuestionnaireWorkRoleReport } from "@/components/questionnaires/QuestionnaireWorkRoleReport";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS, isAnalyticsDisabledQuestionnaireUrl, shouldHardStopPublicAnalyticsForUrl } from "@/lib/tracking/privacy";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/work-role-reflection.json", "utf8")) as Questionnaire;
const all = (state = "na"): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(question => [question.id, state]));
const complete = (answers: unknown) => {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("workRole" in result)) throw Error("Expected unranked task-context records");
  return result;
};

describe("Original role-context inventory without proficiency tiers", () => {
  it("binds twelve unweighted bilingual prompts and three complete, distinct readings", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz);
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(isWorkRole12ConfigurationValid(quiz)).toBe(true);
    expect(quiz.questions).toHaveLength(12);
    expect(new Set(quiz.questions.map(question => question.prompt.en)).size).toBe(12);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.questions)).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const question of quiz.questions) {
      expect(question.correctOptionId).toBeUndefined(); expect(question.reverse).toBeUndefined();
      expect(question.options.map(option => option.id)).toEqual(workRoleStates);
      expect(question.options.every(option => option.score === undefined)).toBe(true);
    }
    for (const profile of quiz.profiles) {
      expect(profile.sections).toHaveLength(7);
      expect(profile.sections.flatMap(section => section.paragraphs)).toHaveLength(14);
      expect(profile.sections.flatMap(section => section.paragraphs.map(paragraph => paragraph.en)).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(900);
      for (const section of profile.sections) for (const paragraph of section.paragraphs) {
        expect(paragraph.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u);
        expect(paragraph.zh).toMatch(/\p{Script=Han}/u);
      }
      expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60);
      expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160);
    }
    expect(new Set(quiz.profiles.map(profile => profile.summary.en)).size).toBe(3);
    expect(quiz.instructions!.en).toContain("past twelve weeks");
    expect(quiz.instructions!.en).toContain("most recent");
    expect(quiz.instructions!.zh).toContain("近12周");
  });

  it("preserves category identity and every row across all256 four-task combinations in each group", () => {
    for (let group = 0; group < 3; group++) for (let code = 0; code < 256; code++) {
      const answers = all(), selected: string[] = []; let cursor = code;
      for (let task = 0; task < 4; task++) {
        const state = workRoleStates[cursor % 4]; cursor = Math.floor(cursor / 4);
        answers[quiz.questions[group * 4 + task].id] = state; selected.push(state);
      }
      const result = complete(answers);
      expect(Object.keys(result).sort()).toEqual(["answered", "status", "workRole"]);
      expect(result.workRole.map(part => part.id)).toEqual(workRoleDefinitions.map(part => part.id));
      for (let other = 0; other < 3; other++) {
        const states = other === group ? selected : Array<string>(4).fill("na");
        expect(result.workRole[other].rows.map(row => row.stateId)).toEqual(states);
        expect(result.workRole[other].counts).toEqual(Object.fromEntries(workRoleStates.map(state => [state, states.filter(item => item === state).length])));
        expect(Object.values(result.workRole[other].counts).reduce((sum, value) => sum + value, 0)).toBe(4);
      }
    }
  });

  it("distinguishes incomplete, invalid and unavailable while keeping all non-assessment records", () => {
    for (const count of [0, 1, 11]) expect(scoreQuestionnaire(quiz, Object.fromEntries(Object.entries(all()).slice(0, count)))).toEqual({ status: "incomplete", answered: count });
    for (const answers of [null, [], new Date(), { UNKNOWN: "na" }, { WRC_01: "expert" }, { WRC_01: 1 }, { WRC_01: null }]) expect(scoreQuestionnaire(quiz, answers).status).toBe("invalid");
    for (const part of complete(all()).workRole) expect(part.counts).toEqual({ guided: 0, owned: 0, supported: 0, na: 4 });
    const mutations: ((value: Questionnaire) => void)[] = [
      value => { value.source.scoringVersion = "career-tier"; },
      value => { value.questions[0].options[0].score = 1; },
      value => { value.questions[0].options[0].label.en = "Beginner"; },
      value => { value.questions[0].reverse = false; },
      value => { value.questions[1].id = value.questions[0].id; },
      value => { value.directions[0].itemCount = 5; },
      value => { value.profiles.reverse(); },
    ];
    for (const mutate of mutations) {
      const changed = structuredClone(quiz); mutate(changed);
      expect(recordWorkRole12(changed, all())).toEqual({ status: "unavailable", answered: 0 });
    }
  });

  it("keeps malformed and sparse configuration out of real entry, guide and OG consumers", async () => {
    const loader = await import("@/lib/questionnaires/loaders"), entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), og = await import("@/app/og/fun/[slug]/route");
    const spy = vi.spyOn(loader, "loadQuestionnaire");
    try {
      for (const field of ["questions", "directions", "profiles", "options", "sections", "paragraphs", "directionIds"] as const) for (const mode of ["hole", "undefined", "null"] as const) {
        const changed = structuredClone(quiz);
        const array: unknown[] = field === "options" ? changed.questions[0].options : field === "sections" ? changed.profiles[0].sections : field === "paragraphs" ? changed.profiles[0].sections[0].paragraphs : field === "directionIds" ? changed.profiles[0].directionIds : changed[field];
        if (mode === "hole") delete array[0]; else array[0] = mode === "null" ? null : undefined;
        expect(isWorkRole12ConfigurationValid(changed)).toBe(false);
        expect(recordWorkRole12(changed, {})).toEqual({ status: "unavailable", answered: 0 });
        spy.mockResolvedValue(changed);
        const ep = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, gp = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: quiz.profiles[0].id }) };
        expect((await entry.generateMetadata(ep)).robots).toEqual({ index: false, follow: false });
        expect((await guide.generateMetadata(gp)).robots).toEqual({ index: false, follow: false });
        await expect(entry.default(ep)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        await expect(guide.default(gp)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        expect((await og.GET(new Request(`https://fermatmind.com/og/fun/${quiz.slug}`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
      }
    } finally { spy.mockRestore(); }
  });

  it("shows all twelve records and three full bilingual guides for mixed or all non-assessment answers", () => {
    const mixed = Object.fromEntries(quiz.questions.map((question, index) => [question.id, workRoleStates[index % 4]]));
    for (const locale of ["en", "zh"] as const) for (const answers of [mixed, ...workRoleStates.map(state => all(state))]) {
      const result = complete(answers), dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<QuestionnaireWorkRoleReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-work-role-row]")).toHaveLength(12);
      expect(dom.querySelectorAll("[data-work-role-count]")).toHaveLength(12);
      for (const part of result.workRole) for (const state of workRoleStates) expect(dom.querySelector(`[data-work-role-count="${part.id}-${state}"]`)?.textContent).toBe(String(part.counts[state]));
      for (const profile of quiz.profiles) for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      const ids = [...dom.querySelectorAll("[id]")].map(node => node.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.querySelectorAll("h4")).toHaveLength(21);
      expect(dom.textContent).not.toMatch(/your skill level is|你的技能等级是|\d+% match/u);
    }
    const next = renderToStaticMarkup(<QuestionnaireWorkRoleNextSteps locale="en" />);
    expect(next).toContain("/en/tests#more-tests"); expect(next).not.toContain("mbti");
  });

  it("keeps optional drafts versioned, bounded and invalid-state free", () => {
    const saved = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { WRC_01: "guided", WRC_02: "na" } });
    expect(readQuestionnaireDraft(quiz, saved, 200)).toEqual({ WRC_01: "guided", WRC_02: "na" });
    expect(readQuestionnaireDraft(quiz, saved, 86400100)).toBeNull();
    expect(readQuestionnaireDraft(quiz, saved, 99)).toBeNull();
    expect(readQuestionnaireDraft(quiz, saved.replace(quiz.version, "old-version"), 200)).toBeNull();
    expect(readQuestionnaireDraft(quiz, saved.replace("guided", "expert"), 200)).toBeNull();
    expect(ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS).toContain(`/tests/explore/${quiz.slug}`);
    expect(entertainmentActivityCatalog.find(item => item.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...quiz.profiles.map(profile => `/results/${profile.id}`)]) {
      const path = `https://fermatmind.com/${locale}/tests/explore/${quiz.slug}${suffix}`;
      expect(isAnalyticsDisabledQuestionnaireUrl(path)).toBe(true);
      expect(shouldHardStopPublicAnalyticsForUrl(path)).toBe(true);
    }
    expect(isAnalyticsDisabledQuestionnaireUrl(`/en/tests/explore/${quiz.slug}-another-tool`)).toBe(false);
  });

  it("serves eight public bilingual pages with independent metadata, full bodies and public discovery", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const base = `/${locale}/tests/explore/${quiz.slug}`, ep = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const entryHtml = renderToStaticMarkup(await entry.default(ep)), metadata = await entry.generateMetadata(ep);
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]);
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${base}`);
        const dom = document.createElement("div"); dom.innerHTML = entryHtml;
        const method = dom.querySelector('[aria-labelledby="questionnaire-method"]');
        for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(method?.textContent).toContain(paragraph[locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${base}"`);
        for (const profile of quiz.profiles) {
          const path = `${base}/results/${profile.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const page = document.createElement("div"); page.innerHTML = renderToStaticMarkup(await guide.default(gp));
          expect(page.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(page.textContent).toContain(paragraph[locale]);
          const meta = await guide.generateMetadata(gp); expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
          expect(maps.some(item => item.loc === `https://fermatmind.com${path}`)).toBe(true);
          expect(page.querySelector("[data-work-role-row]")).toBeNull();
        }
      }
    } finally { vi.unstubAllEnvs(); }
  });
});
