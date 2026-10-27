import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { scoreQuestionnaire, isQuestionnaireConfigurationValid, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { scoreSkillsEvidenceQuestionnaire, isSkillsEvidenceConfigurationValid } from "@/lib/questionnaires/skillsEvidence";
import { QuestionnaireSkillsEvidenceReport, QuestionnaireSkillsEvidenceNextSteps } from "@/components/questionnaires/QuestionnaireSkillsEvidenceReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/skills-audit.json", "utf8")) as Questionnaire;
const sourceBytes = readFileSync("tests/fixtures/questionnaires/skills-audit-source-reference.json");
const source = JSON.parse(sourceBytes.toString()) as { questions: Questionnaire["questions"]; parts: (Questionnaire["directions"][number] & { item_numbers: number[] })[] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/skills-audit-profiles-reference.json");
const states = ["recent", "older", "explore", "na"] as const, parts = ["methods", "tools", "communication", "domain"];
const baseline = (state = "na"): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, state]));
const key = (n: number) => `SKI_${String(n).padStart(2, "0")}`;
function complete(answers: QuestionnaireAnswers) {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("skillsEvidence" in result)) throw Error("Wrong skills inventory result kind");
  return result;
}
describe("T102 original task-example inventory without ability scores", () => {
  it("binds twenty bilingual tasks, four states and four complete original readings", () => {
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true); expect(isSkillsEvidenceConfigurationValid(quiz)).toBe(true);
    expect(quiz.kind).toBe("skills-evidence"); expect(quiz.minimumRatedItems).toBeUndefined(); expect(quiz.questions).toHaveLength(20); expect(quiz.profiles).toHaveLength(4);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString())); expect(quiz.directions).toEqual(source.parts.map(({ id, title, itemCount }) => ({ id, title, itemCount })));
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(sourceBytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex")); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const [i, q] of quiz.questions.entries()) { expect(q.id).toBe(key(i + 1)); expect(q.reverse).toBeUndefined(); expect(q.correctOptionId).toBeUndefined(); expect(q.options.map(o => o.id)).toEqual(states); for (const o of q.options) { expect(o.score).toBeUndefined(); expect(o.directionId).toBe(parts[Math.floor(i / 5)]); expect(o.label.en.trim()).not.toBe(""); expect(o.label.zh).toMatch(/\p{Script=Han}/u); } }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(6); expect(new Set(p.sections.map(s => s.id)).size).toBe(6); expect(p.seo?.title.en.trim()).not.toBe(""); expect(p.seo?.title.zh.trim()).not.toBe(""); }
    for (const lang of ["en", "zh"] as const) { expect(new Set(quiz.profiles.map(p => p.headline[lang])).size).toBe(4); expect(new Set(quiz.profiles.map(p => p.summary[lang])).size).toBe(4); expect(new Set(quiz.profiles.map(p => p.seo!.description[lang])).size).toBe(4); }
    expect(quiz.instructions!.en).toContain("past 12 months"); expect(quiz.instructions!.en).toContain("helpful, mixed or unhelpful"); expect(quiz.introduction.en).toContain("does not assess whether the task was done well");
  });
  it("preserves all row states and four counts in 4096 separate part witnesses, covering 56 count states per part", () => {
    let witnesses = 0;
    for (let part = 0; part < 4; part++) {
      const seen = new Set<string>();
      for (let code = 0; code < 1024; code++) {
        let cursor = code; const selected: string[] = [], answers = baseline();
        for (let j = 0; j < 5; j++) { const state = states[cursor % 4]; cursor = Math.floor(cursor / 4); answers[key(part * 5 + j + 1)] = state; selected.push(state); }
        const counts = Object.fromEntries(states.map(s => [s, selected.filter(x => x === s).length]));
        const result = complete(answers); expect(Object.keys(result).sort()).toEqual(["answered", "skillsEvidence", "status"]);
        for (let other = 0; other < 4; other++) { const own = other === part ? selected : Array(5).fill("na"); assert.deepEqual(result.skillsEvidence[other], { id: parts[other], profileId: `${parts[other]}-reading`, counts: other === part ? counts : { recent: 0, older: 0, explore: 0, na: 5 }, rows: own.map((stateId, j) => ({ questionId: key(other * 5 + j + 1), stateId })) }); }
        seen.add(Object.values(counts).join(",")); witnesses++;
      }
      expect(seen.size).toBe(56);
    }
    expect(witnesses).toBe(4096); console.info("T102 4x4^5 separate part witnesses; not4^20 actual joint execution or ability validation.");
  }, 30000);
  it("keeps missing, invalid and unavailable distinct and accepts every all-not-recorded row", () => {
    for (const n of [0, 1, 19]) expect(scoreQuestionnaire(quiz, Object.fromEntries(Object.entries(baseline()).slice(0, n)))).toEqual({ status: "incomplete", answered: n });
    for (const bad of [null, [], new Date(), { UNKNOWN: "na" }, { SKI_01: "1" }, { SKI_01: 1 }, { SKI_01: null }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    const result = complete(baseline()); expect(result.skillsEvidence.every(p => p.counts.na === 5 && p.rows.length === 5)).toBe(true);
    const mutations: ((q: Questionnaire) => void)[] = [q => { q.code = "OTHER"; }, q => { q.source.scoringVersion = "other"; }, q => { q.questions[0].options[0].score = 1; }, q => { q.questions[0].reverse = false; }, q => { q.questions[0].options[0].id = "level1"; }, q => { q.profiles[0].sections.pop(); }, q => { q.directions[0].itemCount = 4; }];
    for (const mutate of mutations) { const q = structuredClone(quiz); mutate(q); expect(isSkillsEvidenceConfigurationValid(q)).toBe(false); expect(scoreSkillsEvidenceQuestionnaire(q, baseline())).toEqual({ status: "unavailable", answered: 0 }); }
  });
  it("renders twenty selected task states and every full guide in both languages without levels or winner labels", () => {
    const worked = ["recent", "recent", "older", "explore", "na", "recent", "older", "older", "na", "na", "recent", "recent", "recent", "explore", "na", "older", "explore", "explore", "na", "recent"];
    const mixed = Object.fromEntries(worked.map((v, i) => [key(i + 1), v])); expect(complete(mixed).skillsEvidence.map(p => Object.values(p.counts))).toEqual([[2, 1, 1, 1], [1, 2, 0, 2], [3, 0, 1, 1], [1, 1, 2, 1]]);
    for (const locale of ["en", "zh"] as const) for (const answers of [baseline(), baseline("recent"), baseline("older"), baseline("explore"), mixed]) {
      const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireSkillsEvidenceReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-skills-evidence-row]")).toHaveLength(20); expect(dom.querySelectorAll("[data-skills-evidence-count]")).toHaveLength(16);
      for (const part of result.skillsEvidence) for (const state of states) expect(dom.querySelector(`[data-skills-evidence-count="${part.id}-${state}"]`)?.textContent).toBe(String(part.counts[state]));
      for (const q of quiz.questions) expect(dom.querySelector(`[data-skills-evidence-row="${q.id}"]`)?.textContent).toContain(q.prompt[locale]);
      for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
      expect(dom.querySelectorAll("h4")).toHaveLength(24); const ids = [...dom.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length); expect(dom.textContent).not.toMatch(/your skill level is|你的技能等级是|\d+% match|\d+%匹配/u);
      const next = renderToStaticMarkup(<QuestionnaireSkillsEvidenceNextSteps locale={locale} />); expect(next).toContain(`/${locale}/tests#more-tests`); expect(next).not.toContain("mbti");
    }
  });
  it("rejects sparse, undefined and null configuration slots in scorer and real public consumers", async () => {
    const loader = await import("@/lib/questionnaires/loaders");
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const image = await import("@/app/og/fun/[slug]/route");
    const spy = vi.spyOn(loader, "loadQuestionnaire");
    try {
      for (const field of ["questions", "directions", "profiles", "options", "sections", "paragraphs", "directionIds"] as const) for (const mode of ["hole", "undefined", "null"] as const) {
        const bad = structuredClone(quiz);
        const array: unknown[] = field === "options" ? bad.questions[0].options : field === "sections" ? bad.profiles[0].sections : field === "paragraphs" ? bad.profiles[0].sections[0].paragraphs : field === "directionIds" ? bad.profiles[0].directionIds : bad[field];
        if (mode === "hole") delete array[0]; else array[0] = mode === "null" ? null : undefined;
        expect(isSkillsEvidenceConfigurationValid(bad)).toBe(false); expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
        spy.mockResolvedValue(bad);
        const ep = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, gp = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: quiz.profiles[0].id }) };
        expect((await entry.generateMetadata(ep)).robots).toEqual({ index: false, follow: false });
        expect((await guide.generateMetadata(gp)).robots).toEqual({ index: false, follow: false });
        await expect(entry.default(ep)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        await expect(guide.default(gp)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        expect((await image.GET(new Request(`https://fermatmind.com/og/fun/${quiz.slug}`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
      }
    } finally { spy.mockRestore(); }
  });
  it("keeps opt-in draft reading bounded and versioned", () => {
    const raw = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { SKI_01: "recent", SKI_02: "na" } }); expect(readQuestionnaireDraft(quiz, raw, 200)).toEqual({ SKI_01: "recent", SKI_02: "na" }); expect(readQuestionnaireDraft(quiz, raw, 86400100)).toBeNull(); expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: "wrong", savedAt: 100, answers: {} }), 200)).toBeNull();
  });
  it("serves ten full bilingual native pages with independent metadata, sitemap entries and no personal state rows", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/skills-audit`, ep = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(ep)), metadata = await entry.generateMetadata(ep); expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); const entryDom = document.createElement("div"); entryDom.innerHTML = html; const method = entryDom.querySelector('[aria-labelledby="questionnaire-method"]'); expect(method?.querySelectorAll("p")).toHaveLength(3); for (const section of quiz.guide.filter(s => ["scope", "states", "counts"].includes(s.id))) for (const paragraph of section.paragraphs) expect(method?.textContent).toContain(paragraph[locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) { const native = `${path}/results/${profile.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(gp)); expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const s of profile.sections) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]); const gm = await guide.generateMetadata(gp); expect(gm.title).toBe(profile.seo!.title[locale]); expect(gm.description).toBe(profile.seo!.description[locale]); expect(gm.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(dom.querySelector("[data-skills-evidence-row]")).toBeNull(); }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
