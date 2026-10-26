import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isCompassConfigurationValid, scoreCompassQuestionnaire } from "@/lib/questionnaires/compass";
import { readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireCompassReport } from "@/components/questionnaires/QuestionnaireCompassReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const slug = "arabic-personality-compass";
const quiz = JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
const bytes = readFileSync(`tests/fixtures/questionnaires/${slug}-reference.json`);
const reference = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; scoring: { profileIds: string[] } };
const names = ["north", "south", "east", "west"];
function witness(counts: number[]): QuestionnaireAnswers {
  const directions = names.flatMap((id, i) => Array<string>(counts[i]).fill(id));
  return Object.fromEntries(reference.questions.map((q, i) => [q.id, q.options.find(o => o.directionId === directions[i])!.id]));
}
const allA = () => Object.fromEntries(reference.questions.map(q => [q.id, "A"]));

describe("T058 original compass choices and explicit perpendicular-neighbour readings", () => {
  it("preserves36original scenarios, four balanced positions and twelve full bilingual guides without adopting PCTI", () => {
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.questions).toHaveLength(36);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(isCompassConfigurationValid(quiz)).toBe(true);
    expect(quiz.title).toEqual({ en: "Arabic Personality Compass Test", zh: "性格罗盘测试" });
    expect(quiz.references?.map(r => r.url)).toContain("https://www.personalitycompass.com/thebook.php");
    expect(quiz.profiles.map(p => p.id).sort()).toEqual(reference.scoring.profileIds.sort());
    expect(new Set(quiz.profiles.map(p => p.seo?.title.en)).size).toBe(12);
    for (const direction of quiz.directions) for (const position of [0, 1, 2, 3]) {
      expect(direction.comparisons).toBe(36);
      expect(quiz.questions.filter(q => q.options[position].directionId === direction.id)).toHaveLength(9);
    }
    for (const profile of quiz.profiles) {
      expect(profile.sections).toHaveLength(9); expect(new Set(profile.sections.map(s => s.id)).size).toBe(9);
      expect(profile.seo?.title.en).toContain("Compass Result"); expect(profile.seo?.title.zh).toContain("性格罗盘测试结果");
      expect(profile.sections.at(-1)?.paragraphs[0].en).toContain("PCTI");
      expect(profile.sections.reduce((n, s) => n + s.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(650);
    }
    const check = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      const v = value as Record<string, unknown>;
      if ("en" in v || "zh" in v) {
        expect(String(v.en)).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder|lorem ipsum/u);
        expect(String(v.en).length).toBeGreaterThan(0); expect(String(v.zh)).toMatch(/\p{Script=Han}/u);
      } else Object.values(v).forEach(check);
    };
    check(quiz);
    for (const file of readdirSync("lib/questionnaires/data").filter(f => f !== `${slug}.json`)) {
      const other = JSON.parse(readFileSync(`lib/questionnaires/data/${file}`, "utf8")) as Questionnaire;
      const prompts = new Set(other.questions.flatMap(q => [q.prompt.en, q.prompt.zh]));
      const options = new Set(other.questions.flatMap(q => q.options.flatMap(o => [o.label.en, o.label.zh])));
      for (const question of quiz.questions) {
        expect(prompts.has(question.prompt.en) || prompts.has(question.prompt.zh)).toBe(false);
        for (const option of question.options) expect(options.has(option.label.en) || options.has(option.label.zh)).toBe(false);
      }
    }
  });

  it("compares runtime against source witnesses for all9139count vectors,15leader sets and27report sets", () => {
    const leaderSets = new Set<string>(), reportSets = new Set<string>(), covered = new Set<string>(); let states = 0;
    for (let north = 0; north <= 36; north++) for (let south = 0; south <= 36 - north; south++) for (let east = 0; east <= 36 - north - south; east++) {
      const values = [north, south, east, 36 - north - south - east], answers = witness(values);
      const counts: Record<string, number> = Object.fromEntries(names.map(id => [id, 0]));
      for (const q of reference.questions) counts[q.options.find(o => o.id === answers[q.id])!.directionId]++;
      const top = names.filter(id => counts[id] === Math.max(...Object.values(counts)));
      const neighbours: Record<string, string | null> = {};
      const expected = top.map(id => {
        const [a, b] = id === "north" || id === "south" ? ["east", "west"] : ["north", "south"];
        neighbours[id] = counts[a] === counts[b] ? null : counts[a] > counts[b] ? a : b;
        return neighbours[id] === null ? id : `${id}-${neighbours[id]}`;
      }).sort();
      const actual = scoreCompassQuestionnaire(quiz, answers);
      if (actual.status !== "complete") throw new Error("Complete source witness rejected");
      expect(actual.counts).toEqual(counts); expect(names.map(id => counts[id])).toEqual(values);
      expect([...actual.leaders].sort()).toEqual([...top].sort()); expect(actual.neighbours).toEqual(neighbours);
      expect([...actual.compassProfileIds].sort()).toEqual(expected);
      expect(actual).not.toHaveProperty("matchPercentage");
      leaderSets.add([...top].sort().join("|")); reportSets.add(expected.join("|")); expected.forEach(id => covered.add(id)); states++;
    }
    expect(states).toBe(9139); expect(leaderSets.size).toBe(15); expect(reportSets.size).toBe(27); expect(covered.size).toBe(12);
    console.info("Original compass:9139reachable count vectors/15highest sets/27report sets source-witness comparison; not4^36individual executions or psychometric validation.");
  });

  it("preserves opposite, adjacent, three-way and flat ties without inventing a sole leader or suppressing full reports", () => {
    const cases = [
      { counts: [14, 10, 8, 4], ids: ["north-east"] },
      { counts: [12, 6, 12, 6], ids: ["north-east", "east-north"] },
      { counts: [14, 14, 4, 4], ids: ["north", "south"] },
      { counts: [12, 12, 12, 0], ids: ["north-east", "south-east", "east"] },
      { counts: [9, 9, 9, 9], ids: names },
    ];
    for (const item of cases) {
      const result = scoreCompassQuestionnaire(quiz, witness(item.counts)); if (result.status !== "complete") throw new Error("Tie rejected");
      expect(new Set(result.compassProfileIds)).toEqual(new Set(item.ids));
      const reversed = structuredClone(quiz); reversed.profiles.reverse();
      const reordered = scoreCompassQuestionnaire(reversed, witness(item.counts)); if (reordered.status !== "complete") throw new Error("Order changed validity");
      expect(new Set(reordered.compassProfileIds)).toEqual(new Set(item.ids));
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireCompassReport quiz={quiz} result={result} locale="en" />);
      expect(dom.querySelectorAll("[data-compass-match]")).toHaveLength(item.ids.length);
      expect(dom.querySelectorAll("h4")).toHaveLength(item.ids.length * 9);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
    const flat = scoreQuestionnaire(quiz, allA()); expect(flat.status).toBe("complete");
    if (!(flat.status === "complete" && "compassProfileIds" in flat)) throw new Error("Wrong dispatcher");
    expect(Object.values(flat.counts)).toEqual([9, 9, 9, 9]); expect(flat.compassProfileIds).toHaveLength(4);
  });

  it("withholds35answers, validates drafts and fails visibly on malformed answers or drifted method identity", () => {
    const partial = allA(); delete partial.COMP_36;
    expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 35 });
    for (const invalid of [null, [], new Date(), { unknown: "A" }, { COMP_01: "na" }, { COMP_01: 1 }]) expect(scoreCompassQuestionnaire(quiz, invalid).status).toBe("invalid");
    const variants = [
      (q: Questionnaire) => { q.code = "PCTI"; },
      (q: Questionnaire) => { q.questions[0].reverse = true; },
      (q: Questionnaire) => { q.questions[0].options[0].score = 1; },
      (q: Questionnaire) => { q.questions[0].options[0].directionId = "unknown"; },
      (q: Questionnaire) => { q.profiles[0].id = "unknown"; },
      (q: Questionnaire) => { q.profiles.find(p => p.id === "north-east")!.directionIds.reverse(); },
      (q: Questionnaire) => { q.source.scoringVersion = "other"; },
      (q: Questionnaire) => { q.directions[0].comparisons = 35; },
    ];
    for (const change of variants) {
      const bad = structuredClone(quiz); change(bad); expect(scoreQuestionnaire(bad, allA())).toEqual({ status: "unavailable", answered: 0 });
    }
    const draft = { version: quiz.version, savedAt: 123456, answers: { COMP_01: "B" } };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123457)).toEqual(draft.answers);
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123456 + 86400000)).toBeNull();
  });

  it("publishes26native pages with unique ENZH SEO, every full body and public navigation", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${slug}`, props = { params: Promise.resolve({ locale, slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(metadata.title).toBe(quiz.seoTitle[locale]);
        expect(html).toContain(locale === "zh" ? "原创四向罗盘反思" : "Original four-direction compass reflection");
        expect(html).toContain(quiz.guide[0].paragraphs[0][locale]); expect(html).toContain(quiz.instructions![locale]);
        expect(html).toContain(locale === "zh" ? "12份完整说明" : "Twelve full guides");
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug, profile: profile.id }) };
          const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(props));
          const meta = await guide.generateMetadata(props);
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          for (const section of profile.sections) {
            expect(dom.querySelector(`#report-${section.id} h2`)?.textContent).toBe(section.title[locale]);
            for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          }
          expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${slug}/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${slug}/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true);
          expect(dom.querySelector("[data-compass-count]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
