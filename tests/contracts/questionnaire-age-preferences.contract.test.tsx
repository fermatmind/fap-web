import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionnaireReport } from "@/components/questionnaires/QuestionnaireReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { isDirectionalConfigurationValid, readQuestionnaireDraft, scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
afterEach(() => vi.unstubAllEnvs());
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/adult-age-preferences.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/age-preference-reference.json");
type OriginalProfile = Record<string, unknown> & { profile_code: string; top_direction_codes: string[] };
type Reference = {
  source_scorer_sha256: string;
  source_item_bank: { test_id: string; form_code: string; item_bank_version: string; items: { question_id: string; prompt: string; options: { code: string; direction_code: string; text: string }[] }[] };
  source_scoring_spec: { scoring_version: string; status: string; directions: { direction_code: string; display_name: string }[] };
  source_result_content: { profiles: OriginalProfile[] };
  source_profile_translations_en: { profile_code: string; fields_en: Record<string, string | string[]> }[];
  source_count_vectors: { counts: number[]; option_codes: string; leaders: string[]; profile_code: string }[];
  profile_mapping: { source_profile_code: string; native_id: string }[];
  questions: Questionnaire["questions"];
  profiles: Questionnaire["profiles"];
};
const ref = JSON.parse(bytes.toString()) as Reference;
const source = createRequire(import.meta.url)("../fixtures/questionnaires/multidirection-scorer.cjs") as {
  create(config: object): { scoreSubmission(submission: object, bank: object, spec: object): {
    score_availability: string; directions: Record<string, { wins: number }>; ranking: { top_direction_codes: string[] };
  } };
};
const ids = quiz.directions.map(d => d.id);
const originalScorer = source.create({ testId: "AGE_PREFERENCE", directionCodes: ids, questionCount: 18, pairOccurrences: 6, scheduledComparisons: 12, status: ref.source_scoring_spec.status });
const profileText = (p: QuestionnaireProfile, locale: "en" | "zh") => [p.title[locale], p.headline[locale], p.summary[locale], p.scoreReading[locale], ...p.sections.flatMap(s => [s.title[locale], ...s.paragraphs.map(v => v[locale])])].join("\n");

describe("original adult age-context choices and all seven complete readings", () => {
  it("preserves all18 original paired items, 3 balanced directions and every source/translation profile field", () => {
    expect(quiz.code).toBe("AGE_PREFERENCE");
    expect(quiz.source.formCode).toBe("age_preference_forced_choice_18");
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(isDirectionalConfigurationValid(quiz)).toBe(true);
    expect(quiz.questions).toEqual(ref.questions); expect(quiz.questions).toHaveLength(18);
    expect(quiz.profiles).toEqual(ref.profiles); expect(quiz.profiles).toHaveLength(7);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(ref.source_scorer_sha256).toBe(createHash("sha256").update(readFileSync("tests/fixtures/questionnaires/multidirection-scorer.cjs")).digest("hex"));
    const exposure = Object.fromEntries(ids.map(id => [id, { total: 0, A: 0, B: 0 }]));
    const pairs = new Map<string, number>();
    for (const [i, q] of quiz.questions.entries()) {
      const original = ref.source_item_bank.items[i];
      expect(q.id).toBe(original.question_id); expect(q.prompt.zh).toBe(original.prompt);
      for (const [j, option] of q.options.entries()) {
        expect(option.id).toBe(original.options[j].code); expect(option.directionId).toBe(original.options[j].direction_code);
        expect(option.label.zh).toBe(original.options[j].text); expect(option.score).toBeUndefined();
        exposure[option.directionId].total++; exposure[option.directionId][option.id as "A" | "B"]++;
      }
      const pair = q.options.map(o => o.directionId).sort().join("|"); pairs.set(pair, (pairs.get(pair) ?? 0) + 1);
    }
    expect([...pairs.values()]).toEqual([6, 6, 6]);
    for (const [i, d] of quiz.directions.entries()) {
      expect(d.title.zh).toBe(ref.source_scoring_spec.directions[i].display_name);
      expect(exposure[d.id]).toEqual({ total: 12, A: 6, B: 6 }); expect(d.comparisons).toBe(12);
    }
    for (const [i, p] of quiz.profiles.entries()) {
      const original = ref.source_result_content.profiles[i]; expect(p.directionIds).toEqual(original.top_direction_codes);
      expect(ref.profile_mapping[i]).toMatchObject({ source_profile_code: original.profile_code, native_id: p.id });
      for (const [key, value] of Object.entries(original)) {
        if (["profile_code", "top_direction_codes", "content_status"].includes(key)) continue;
        for (const text of Array.isArray(value) ? value : [value]) expect(profileText(p, "zh"), `${p.id}:${key}`).toContain(text as string);
      }
      for (const [key, value] of Object.entries(ref.source_profile_translations_en[i].fields_en)) {
        for (const text of Array.isArray(value) ? value : [value]) expect(profileText(p, "en"), `${p.id}:${key}`).toContain(text);
      }
      expect(p.sections).toHaveLength(7); expect(p.sections.find(s => s.id === "fictional-example")?.paragraphs).toHaveLength(3);
      expect(p.seo!.title.en.length).toBeLessThanOrEqual(60); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);
    }
  });

  it("matches the actual original scorer on all127 reachable count vectors and every single/pair/triple result", () => {
    const reached = new Set<string>(); const vectors = new Set<string>(); expect(ref.source_count_vectors).toHaveLength(127);
    for (const w of ref.source_count_vectors) {
      const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, w.option_codes[i]]));
      const result = originalScorer.scoreSubmission({ submission_id: "fixed-public-source-witness", test_id: "AGE_PREFERENCE", item_bank_version: ref.source_item_bank.item_bank_version, scoring_version: ref.source_scoring_spec.scoring_version, answers }, ref.source_item_bank, ref.source_scoring_spec);
      assert.equal(result.score_availability, "complete"); assert.deepStrictEqual(ids.map(id => result.directions[id].wins), w.counts);
      const leaders = ids.filter(id => result.ranking.top_direction_codes.includes(id));
      const profile = ref.profile_mapping.find(p => p.source_profile_code === w.profile_code)!;
      assert.deepStrictEqual(scoreDirectionalQuestionnaire(quiz, answers), { status: "complete", answered: 18, counts: Object.fromEntries(ids.map((id, i) => [id, w.counts[i]])), leaders, profileId: profile.native_id });
      assert.equal(w.counts.reduce((a, b) => a + b, 0), 18); vectors.add(w.counts.join(",")); reached.add(profile.native_id);
    }
    expect(vectors.size).toBe(127); expect([...reached].sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    console.info("Adult age contexts:127 original-scorer count vectors/all7topsets; not2^18 full attempt execution or psychometric validation.");
  });

  it("keeps incomplete/invalid/unavailable separate, and versioned optional drafts expire without partial interpretation", () => {
    const first = quiz.questions[0], partial = { [first.id]: "A" };
    expect(scoreDirectionalQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 1 });
    for (const value of [null, [], new Date(), { unknown: "A" }, { [first.id]: "na" }, { [first.id]: 0 }, Object.create(partial)]) expect(scoreDirectionalQuestionnaire(quiz, value).status).toBe("invalid");
    const broken = structuredClone(quiz); broken.directions[0].comparisons = 13;
    expect(scoreDirectionalQuestionnaire(broken, {})).toEqual({ status: "unavailable", answered: 0 });
    const saved = { version: quiz.version, savedAt: 100_000, answers: partial };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(saved), 100_001)).toEqual(partial);
    expect(readQuestionnaireDraft(quiz, JSON.stringify(saved), 100_000 + 24 * 60 * 60 * 1000)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ ...saved, version: "old-unpublished" }), 100_001)).toBeNull();
  });

  it("renders all7 complete reports in both languages without duplicate IDs or omitted source paragraphs", () => {
    for (const profile of quiz.profiles) for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireReport profile={profile} locale={locale}/>);
      expect(dom.querySelectorAll("section")).toHaveLength(7);
      for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.querySelector(`#report-${section.id}`)?.textContent).toContain(text[locale]);
      const ids = [...dom.querySelectorAll("[id]")].map(v => v.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("serves both native entries and all14 full guides with specific SEO, exact directory/sitemap identities and closed source IDs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    expect((await loadQuestionnaire(quiz.slug))?.code).toBe(quiz.code);
    const maps = appendFunSitemapEntries([]);
    for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props));
      expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.instructions![locale]);
      for (const id of ["raw-wins-explanation", "ties-explanation", "low-direction-explanation"]) {
        const text = quiz.guide.find(s => s.id === id)!.paragraphs[0][locale];
        expect([...dom.querySelectorAll("#questionnaire-method ~ p, section[aria-labelledby='questionnaire-method'] p")].some(p => p.textContent === text)).toBe(true);
      }
      const meta = await entry.generateMetadata(props); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.description).toBe(quiz.description[locale]);
      const directory = document.createElement("div"); directory.innerHTML = renderToStaticMarkup(<MoreTests locale={locale}/>);
      expect(directory.querySelectorAll(`a[href='${path}']`)).toHaveLength(1); expect(maps.filter(v => v.loc === "https://fermatmind.com" + path)).toHaveLength(1);
      expect(new Set(quiz.profiles.map(p => p.seo!.title[locale])).size).toBe(7);
      for (const p of quiz.profiles) {
        const path = `/${locale}/tests/explore/${quiz.slug}/results/${p.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(props));
        expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]);
        for (const section of p.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
        const meta = await guide.generateMetadata(props); expect(meta.title).toBe(p.seo!.title[locale]); expect(meta.description).toBe(p.seo!.description[locale]);
        expect(meta.alternates?.canonical).toBe("https://fermatmind.com" + path); expect(maps.filter(v => v.loc === "https://fermatmind.com" + path)).toHaveLength(1);
      }
    }
    for (const id of ["SINGLE_OLDER", "OLDER_PARTNER_CONTEXT", "unknown"]) await expect(guide.default({ params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: id }) })).rejects.toThrow();
  });
});
