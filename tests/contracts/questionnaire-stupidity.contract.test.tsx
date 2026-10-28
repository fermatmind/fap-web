import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid, scoreArchetypeQuestionnaire, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import outcomes from "../fixtures/questionnaires/stupidity-outcomes-reference.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/stupidity-test.json", "utf8")) as Questionnaire;
const bankBytes = readFileSync("tests/fixtures/questionnaires/stupidity-source-reference.json");
const bank = JSON.parse(bankBytes.toString()) as { questions: Questionnaire["questions"]; publicChoiceKey: Questionnaire["guide"][number] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/stupidity-profiles-reference.json");
const allFirst = (): QuestionnaireAnswers => Object.fromEntries(bank.questions.map(q => [q.id, q.options[0].id]));
const oracle = (answers: QuestionnaireAnswers) => {
  const counts = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const q of bank.questions) counts[q.options.find(o => o.id === answers[q.id])!.directionId]++;
  return { counts, winners: Object.keys(counts).filter(id => counts[id] === Math.max(...Object.values(counts))).sort() };
};
describe("original12 everyday mix-up choices and six complete guides", () => {
  it("binds the original bank, public key and full guides with balanced exposures", () => {
    expect(quiz.questions).toEqual(bank.questions); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.guide.at(-1)).toEqual(bank.publicChoiceKey); expect(bank.publicChoiceKey.paragraphs).toHaveLength(13);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bankBytes).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex"));
    expect(isArchetypeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(12);
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.references).toEqual([]);
    for (const d of quiz.directions) {
      expect(d.comparisons).toBe(8);
      for (const pos of [0, 1, 2, 3]) expect(quiz.questions.filter(q => q.options[pos].directionId === d.id)).toHaveLength(2);
    }
    for (const [i, q] of quiz.questions.entries()) for (const l of ["en", "zh"] as const) for (const [pos, o] of q.options.entries()) expect(bank.publicChoiceKey.paragraphs[i + 1][l]).toContain(`${pos + 1}: ${quiz.directions.find(d => d.id === o.directionId)!.title[l]}`);
    for (const p of quiz.profiles) {
      expect(p.sections.map(s => s.id)).toEqual(["theme", "scene", "counterexample", "compare", "try", "context", "scoring", "source"]);
      expect(p.sections.reduce((n, s) => n + s.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(450);
      for (const s of p.sections) for (const para of s.paragraphs) { expect(para.en).not.toMatch(/\p{Script=Han}|TODO|lorem ipsum/u); expect(para.zh).toMatch(/\p{Script=Han}/u); }
    }
    for (const slug of ["procrastinator-type-test", "intelligence-type-test"]) {
      const other = JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
      const prompts = new Set(other.questions.flatMap(q => Object.values(q.prompt))), labels = new Set(other.questions.flatMap(q => q.options.flatMap(o => Object.values(o.label))));
      for (const q of quiz.questions) { for (const t of Object.values(q.prompt)) expect(prompts.has(t)).toBe(false); for (const o of q.options) for (const t of Object.values(o.label)) expect(labels.has(t)).toBe(false); }
    }
  });
  it("matches independent addition for all5678reachable count states and57highest sets", () => {
    const ids = quiz.directions.map(d => d.id); let states = new Map<string, QuestionnaireAnswers>([["0|0|0|0|0|0", {}]]);
    for (const q of bank.questions) {
      const next = new Map<string, QuestionnaireAnswers>();
      for (const [key, a] of states) for (const o of q.options) { const c = key.split("|").map(Number); c[ids.indexOf(o.directionId)]++; next.set(c.join("|"), { ...a, [q.id]: o.id }); }
      states = next;
    }
    expect(states.size).toBe(5678); expect(outcomes.reachableCountStates).toBe(5678); const sets = new Set<string>();
    for (const answers of states.values()) {
      const expected = oracle(answers), result = scoreArchetypeQuestionnaire(quiz, answers); if (result.status !== "complete") throw Error("Complete witness rejected");
      expect(result.counts).toEqual(expected.counts); expect([...result.profileIds].sort()).toEqual(expected.winners); sets.add(expected.winners.join("|"));
    }
    expect(sets.size).toBe(57); expect(outcomes.witnesses).toHaveLength(57);
    for (const w of outcomes.witnesses) { const e = oracle(w.answers); expect(e.counts).toEqual(w.counts); expect(e.winners).toEqual([...w.winnerIds].sort()); expect(sets.has(e.winners.join("|"))).toBe(true); }
    expect(outcomes.impossibleHighestSets).toHaveLength(6); for (const s of outcomes.impossibleHighestSets) { expect(s).toHaveLength(5); expect(sets.has([...s].sort().join("|"))).toBe(false); }
  });
  it("retains six ties and48sections and rejects invalid or incomplete answers", () => {
    const tie = scoreArchetypeQuestionnaire(quiz, allFirst()); if (tie.status !== "complete") throw Error("Tie rejected");
    expect(scoreQuestionnaire(quiz, allFirst())).toEqual(tie); expect(Object.values(tie.counts)).toEqual(Array(6).fill(2)); expect(tie.profileIds).toHaveLength(6);
    const reversed = structuredClone(quiz); reversed.profiles.reverse(); const same = scoreArchetypeQuestionnaire(reversed, allFirst()); if (same.status !== "complete") throw Error("Reordered rejected"); expect(new Set(same.profileIds)).toEqual(new Set(tie.profileIds));
    const partial = allFirst(); delete partial[quiz.questions[11].id]; expect(scoreArchetypeQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 11 });
    for (const a of [null, [], new Date(), { unknown: "A" }, { [quiz.questions[0].id]: "na" }, { [quiz.questions[0].id]: 1 }]) expect(scoreArchetypeQuestionnaire(quiz, a).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].options[0].score = 0; expect(scoreArchetypeQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={tie} locale="en" />);
    expect(dom.querySelectorAll("[data-archetype-match]")).toHaveLength(6); expect(dom.querySelectorAll("h4")).toHaveLength(48); const ids = [...dom.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length);
  });
  it("publishes all14native bilingual pages with complete text and paired discoverability", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try {
      for (const l of ["en", "zh"] as const) {
        const path = `/${l}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale: l, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(meta.title).toBe(quiz.seoTitle[l]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(dom.textContent).toContain(l === "zh" ? "原创日常乌龙选择 · 六篇全文免费" : "Original everyday mix-up choices · Six full guides free");
        for (const s of quiz.guide) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[l]); expect(renderToStaticMarkup(<MoreTests locale={l} />)).toContain(`href="${path}"`); expect(maps.some(e => e.loc === `https://fermatmind.com${path}`)).toBe(true);
        for (const p of quiz.profiles) {
          const props = { params: Promise.resolve({ locale: l, slug: quiz.slug, profile: p.id }) }, path2 = `${path}/results/${p.id}`, html = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
          expect(dom.querySelector("h1")?.textContent).toBe(p.title[l]); expect(meta.title).toBe(p.seo!.title[l]); expect(meta.description).toBe(p.seo!.description[l]);
          for (const s of p.sections) { expect(dom.querySelector(`#report-${s.id} h2`)?.textContent).toBe(s.title[l]); for (const t of s.paragraphs) expect(dom.textContent).toContain(t[l]); }
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path2}`); expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${path2}`)).toBe(true); expect(html).not.toContain("data-archetype-count");
        }
      }
    } finally { vi.unstubAllEnvs(); }
  });
});
