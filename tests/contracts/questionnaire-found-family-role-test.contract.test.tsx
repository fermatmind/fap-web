import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid, readQuestionnaireDraft, scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/found-family-role-test.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/found-family-role-test-reference.json");
const reference = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; sourceRead: string };
const allA = (): QuestionnaireAnswers => Object.fromEntries(reference.questions.map(q => [q.id, "A"]));

describe("T082 original voluntary friend-group contribution edition", () => {
  it("keeps18 original situations and72 options, equal12 exposures/3positions and six full bilingual guides", () => {
    expect(quiz.kind).toBe("archetype"); expect(isArchetypeConfigurationValid(quiz)).toBe(true);
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.questions).toHaveLength(18);
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(18); expect(quiz.questions.flatMap(q => q.options)).toHaveLength(72);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(quiz.source.resultContentSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(reference.sourceRead).toContain("All10questions/40options");
    expect(quiz.directions.map(d => d.id)).toEqual(["welcome-keeper", "practical-pal", "story-keeper", "spark-starter", "listening-companion", "thread-weaver"]);
    for (const direction of quiz.directions) {
      expect(direction.comparisons).toBe(12); expect(quiz.questions.filter(q => q.options.some(o => o.directionId === direction.id))).toHaveLength(12);
      for (let i = 0; i < 4; i++) expect(quiz.questions.filter(q => q.options[i].directionId === direction.id)).toHaveLength(3);
    }
    expect(quiz.profiles).toHaveLength(6);
    for (const profile of quiz.profiles) {
      expect(profile.directionIds).toEqual([profile.id]); expect(profile.sections).toHaveLength(9);
      expect(new Set(profile.sections.map(s => s.id)).size).toBe(9);
      expect(profile.sections.reduce((n, section) => n + section.paragraphs.map(t => t.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(650);
      for (const locale of ["en", "zh"] as const) { expect(profile.seo!.title[locale].length).toBeLessThanOrEqual(60); expect(profile.seo!.description[locale].length).toBeLessThanOrEqual(160); }
    }
    const visit = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      const v = value as Record<string, unknown>;
      if ("en" in v || "zh" in v) { expect(typeof v.en).toBe("string"); expect(typeof v.zh).toBe("string"); expect(v.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u); expect(v.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(v).forEach(visit);
    }; visit(quiz);
  });

  it("independently enumerates31363 source vectors and runs57highest-set witnesses, not4^18attempts", () => {
    let states = new Map<string, string>([["0|0|0|0|0|0", ""]]);
    for (const question of reference.questions) {
      const next = new Map<string, string>();
      for (const [key, answer] of states) for (const option of question.options) {
        const counts = key.split("|").map(Number); counts[quiz.directions.findIndex(d => d.id === option.directionId)]++;
        const joined = counts.join("|"); if (!next.has(joined)) next.set(joined, answer + option.id);
      }
      states = next;
    }
    expect(states.size).toBe(31363);
    const witnesses = new Map<string, { counts: number[]; answer: string }>();
    for (const [key, answer] of states) {
      const counts = key.split("|").map(Number), maximum = Math.max(...counts);
      const highest = quiz.directions.filter((_, i) => counts[i] === maximum).map(d => d.id).sort().join("|");
      if (!witnesses.has(highest)) witnesses.set(highest, { counts, answer });
    }
    expect(witnesses.size).toBe(57);
    for (const [expected, { counts, answer }] of witnesses) {
      const answers = Object.fromEntries(reference.questions.map((q, i) => [q.id, answer[i]]));
      const actual = scoreArchetypeQuestionnaire(quiz, answers); if (actual.status !== "complete") throw Error("Complete source witness rejected");
      expect(quiz.directions.map(d => actual.counts[d.id])).toEqual(counts);
      expect([...actual.profileIds].sort().join("|")).toBe(expected);
      expect(Object.values(actual.counts).reduce((a, b) => a + b, 0)).toBe(18);
      for (const field of ["secondary", "matchPercentage", "survivalProbability", "ability", "percentile", "diagnosis"]) expect(actual).not.toHaveProperty(field);
    }
    console.info("31363independent source count vectors/57runtime highest-set witnesses, not4^18attempts or psychometric validation.");
  });

  it("preserves every six-way tie, all54sections, partial withholding, invalid input and optional draft expiry", () => {
    const tie = scoreArchetypeQuestionnaire(quiz, allA()); if (tie.status !== "complete") throw Error("Missing tie");
    expect(Object.values(tie.counts)).toEqual(Array(6).fill(3)); expect(new Set(tie.profileIds)).toEqual(new Set(quiz.profiles.map(p => p.id)));
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={tie} locale={locale} />);
      expect(dom.querySelectorAll("[data-archetype-match]")).toHaveLength(6); expect(dom.querySelectorAll("h4")).toHaveLength(54);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
    const partial = allA(); delete partial.FFR_18; expect(scoreArchetypeQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 17 });
    for (const bad of [null, [], new Date(), { unknown: "A" }, { FFR_01: "na" }, { FFR_01: 1 }]) expect(scoreArchetypeQuestionnaire(quiz, bad).status).toBe("invalid");
    const malformed = structuredClone(quiz); malformed.questions[0].options[0].score = 1; expect(scoreArchetypeQuestionnaire(malformed, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = { version: quiz.version, savedAt: 123456, answers: { FFR_01: "B" } };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123457)).toEqual(draft.answers); expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123456 + 86400000)).toBeNull();
  });

  it("publishes14native language URLs with dedicated metadata, full text, safe identifiers and bounded voluntary friend-group framing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, path = `/${locale}/tests/explore/found-family-role-test`;
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(html).toContain(quiz.instructions![locale]); for (const section of quiz.guide.slice(0, 3)) expect(html).toContain(section.paragraphs[0][locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        expect(maps.some(e => e.loc === `https://fermatmind.com${path}`)).toBe(true); expect(isMissingFunRoute(path)).toBe(false);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          for (const section of profile.sections) { expect(dom.querySelector(`#report-${section.id} h2`)?.textContent).toBe(section.title[locale]); for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]); }
          expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/found-family-role-test/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/found-family-role-test/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(rendered).not.toContain("data-archetype-count"); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
