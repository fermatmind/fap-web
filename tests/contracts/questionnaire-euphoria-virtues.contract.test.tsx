import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isMiniVirtuesConfigurationValid, scoreMiniVirtuesQuestionnaire, miniVirtuesDefinitions } from "@/lib/questionnaires/miniVirtues";
import { isEuphoriaConfigurationValid, euphoriaDefinitions } from "@/lib/questionnaires/euphoria";
import { scoreQuestionnaire, readQuestionnaireDraft, isQuestionnaireConfigurationValid, scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireMiniVirtuesReport } from "@/components/questionnaires/QuestionnaireMiniVirtuesReport";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { QuestionnaireEuphoriaNextSteps } from "@/components/questionnaires/QuestionnaireEuphoriaNextSteps";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const read = (name: string) => JSON.parse(readFileSync(name, "utf8"));
const virtues = read("lib/questionnaires/data/seven-sins-virtues-test.json") as Questionnaire;
const euphoria = read("lib/questionnaires/data/euphoria-character-quiz.json") as Questionnaire;
const virtuesSource = read("tests/fixtures/questionnaires/seven-sins-virtues-source-reference.json");
const euphoriaSource = read("tests/fixtures/questionnaires/euphoria-source-reference.json");
const numeric = read("tests/fixtures/questionnaires/seven-sins-virtues-numeric-reference.json") as { vectors: { part: number; tuple: number[]; sum: number; mean: number }[] };
const outcomes = read("tests/fixtures/questionnaires/euphoria-outcomes-reference.json") as { witnesses: { winnerIds: string[]; counts: Record<string, number>; answers: QuestionnaireAnswers }[]; impossibleWinnerSets: string[][] };
const all3 = () => Object.fromEntries(virtues.questions.map(q => [q.id, "3"]));
const hash = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const dom = (html: string) => { const element = document.createElement("div"); element.innerHTML = html; return element; };

describe("C formal continuation: VIRTUES source and original T110", () => {
  it("binds complete bilingual banks and every full profile to the reviewed source bytes", () => {
    for (const [quiz, prefix, valid, sections] of [[virtues, "seven-sins-virtues", isMiniVirtuesConfigurationValid, 8], [euphoria, "euphoria", isEuphoriaConfigurationValid, 6]] as const) {
      expect(valid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
      expect(quiz.source.itemBankSha256).toBe(hash(`tests/fixtures/questionnaires/${prefix}-source-reference.json`));
      expect(quiz.source.resultContentSha256).toBe(hash(`tests/fixtures/questionnaires/${prefix}-profiles-reference.json`));
      const fixture = read(`tests/fixtures/questionnaires/${prefix}-profiles-reference.json`);
      expect(quiz.profiles).toEqual(Array.isArray(fixture) ? fixture : fixture.profiles);
      expect(new Set(quiz.profiles.map(p => p.seo!.title.en)).size).toBe(quiz.profiles.length);
      expect(new Set(quiz.profiles.map(p => p.seo!.description.zh)).size).toBe(quiz.profiles.length);
      for (const profile of quiz.profiles) expect(profile.sections).toHaveLength(sections);
      const visit = (value: unknown): void => {
        if (!value || typeof value !== "object") return;
        const o = value as Record<string, unknown>;
        if ("en" in o || "zh" in o) {
          expect(o.en).toEqual(expect.any(String)); expect(String(o.en).trim()).not.toBe("");
          expect(String(o.en)).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u);
          expect(String(o.zh)).toMatch(/\p{Script=Han}/u);
        } else Object.values(o).forEach(visit);
      }; visit(quiz);
    }
  });

  it("preserves all28 original Chinese prompts, all-forward agreement anchors and seven groups", () => {
    expect(virtues.questions).toEqual(virtuesSource.questions);
    expect(virtues.directions).toEqual(virtuesSource.directions);
    expect(virtuesSource.sourceFlags).toMatchObject({ network_mode: "local_only", psychometric_validation_completed: false, human_expert_review_completed: false });
    virtuesSource.originalItemBank.items.forEach((item: { question_id: string; prompt: string; factor_code: string; reverse_scored: boolean; response_scale: { labels: Record<string, string> } }, i: number) => {
      const q = virtues.questions[i]; expect(q.id).toBe(item.question_id); expect(q.prompt.zh).toBe(item.prompt);
      expect(q.reverse).toBe(false); expect(item.reverse_scored).toBe(false);
      q.options.forEach((o, p) => { expect(o.score).toBe(p + 1); expect(o.directionId).toBe(item.factor_code); expect(o.label.zh).toBe(item.response_scale.labels[String(p + 1)]); });
    });
  });

  it("matches all4375 actual-source four-item vectors, keeping other groups and numeric midpoint", () => {
    expect(numeric.vectors).toHaveLength(4375);
    const keys = new Set<string>();
    for (const vector of numeric.vectors) {
      keys.add(`${vector.part}:${vector.tuple.join(",")}`);
      const answers = all3(); vector.tuple.forEach((v, i) => { answers[virtues.questions[vector.part * 4 + i].id] = String(v); });
      const result = scoreQuestionnaire(virtues, answers);
      if (result.status !== "complete" || !("miniVirtues" in result)) throw Error("Complete source vector rejected");
      const part = result.miniVirtues[vector.part];
      if (part.rawSum !== vector.sum || part.mean !== vector.mean || part.mean !== vector.tuple.reduce((a,b) => a+b,0)/4) throw Error(`Source mismatch ${vector.part}:${vector.tuple}`);
      result.miniVirtues.forEach((p, i) => { if (i !== vector.part && (p.rawSum !== 12 || p.mean !== 3)) throw Error("Cross-group leakage"); });
      expect(result).not.toHaveProperty("total"); expect(result).not.toHaveProperty("profileId");
    }
    expect(keys.size).toBe(4375);
    const equal = scoreMiniVirtuesQuestionnaire(virtues, all3());
    if (equal.status !== "complete") throw Error("Numeric midpoint rejected");
    expect(equal.equalFactorGroups).toEqual([miniVirtuesDefinitions.map(d => d.id)]);
    for (const locale of ["en", "zh"] as const) {
      const rendered = dom(renderToStaticMarkup(<QuestionnaireMiniVirtuesReport quiz={virtues} result={equal} locale={locale} />));
      expect(rendered.querySelectorAll("[data-mini-virtues-part]")).toHaveLength(7);
      expect(rendered.querySelectorAll("h4")).toHaveLength(56);
      expect(rendered.querySelectorAll("[data-mini-virtues-equal]")).toHaveLength(1);
      expect(rendered.querySelectorAll("progress")).toHaveLength(0);
      const ids = Array.from(rendered.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const score of rendered.querySelectorAll("[data-mini-virtues-score]")) expect(score.textContent).toContain("3.00");
    }
  });

  it("suppresses every personal virtue interpretation for any missing or invalid response", () => {
    for (const question of virtues.questions) {
      const answers = all3(); delete answers[question.id]; expect(scoreMiniVirtuesQuestionnaire(virtues, answers)).toEqual({ status: "incomplete", answered: 27 });
      for (const invalid of ["na", "", "0", "6", 3, null]) {
        const result = scoreMiniVirtuesQuestionnaire(virtues, { ...all3(), [question.id]: invalid });
        expect(result.status).toBe("invalid"); expect(result).not.toHaveProperty("miniVirtues");
      }
    }
    expect(scoreMiniVirtuesQuestionnaire(virtues, { ...all3(), unknown: "3" }).status).toBe("invalid");
  });

  it("preserves the T110 original mapping, balanced exposure and position counts", () => {
    expect(euphoria.questions).toEqual(euphoriaSource.questions);
    expect(euphoria.directions.map(d => d.id)).toEqual(euphoriaDefinitions.map(d => d.id));
    expect(euphoria.questions).toHaveLength(20);
    for (const d of euphoria.directions) {
      expect(euphoria.questions.flatMap(q => q.options).filter(o => o.directionId === d.id)).toHaveLength(10);
      for (let i=0;i<4;i++) expect([2,3]).toContain(euphoria.questions.filter(q => q.options[i].directionId === d.id).length);
    }
    const otherPrompts = new Set<string>(), otherOptions = new Set<string>();
    for (const name of ["bojack-horseman-character-quiz", "harry-potter-character", "hogwarts-house-quiz", "naruto-character", "death-note", "star-wars-character"]) {
      const q = read(`lib/questionnaires/data/${name}.json`) as Questionnaire;
      q.questions.forEach(q => { otherPrompts.add(q.prompt.en); otherPrompts.add(q.prompt.zh); q.options.forEach(o => { otherOptions.add(o.label.en); otherOptions.add(o.label.zh); }); });
    }
    euphoria.questions.forEach(q => { expect(otherPrompts.has(q.prompt.en) || otherPrompts.has(q.prompt.zh)).toBe(false); q.options.forEach(o => expect(otherOptions.has(o.label.en) || otherOptions.has(o.label.zh)).toBe(false)); });
  });

  it("returns every feasible highest set:8singles and238ties across2–6routes, with independently generated complete witnesses", () => {
    expect(outcomes.witnesses).toHaveLength(246); expect(outcomes.impossibleWinnerSets).toHaveLength(9);
    const sets = new Set<string>();
    for (const witness of outcomes.witnesses) {
      const sourceCounts = Object.fromEntries(euphoriaSource.roles.map((r: { id: string }) => [r.id, 0])) as Record<string,number>;
      for (const q of euphoriaSource.questions as Questionnaire["questions"]) sourceCounts[q.options.find(o => o.id === witness.answers[q.id])!.directionId]++;
      expect(sourceCounts).toEqual(witness.counts);
      const expected = euphoriaDefinitions.filter(d => sourceCounts[d.id] === Math.max(...Object.values(sourceCounts))).map(d => d.profileId);
      const actual = scoreQuestionnaire(euphoria, witness.answers);
      if (actual.status !== "complete" || !("profileIds" in actual)) throw Error("Reachable witness rejected");
      expect(actual.counts).toEqual(sourceCounts); expect(actual.profileIds).toEqual(expected);
      expect(actual).toEqual(scoreArchetypeQuestionnaire(euphoria, witness.answers));
      expect(actual.profileIds).toEqual(euphoriaDefinitions.filter(d => witness.winnerIds.includes(d.id)).map(d => d.profileId));
      expect(actual).not.toHaveProperty("matchPercentage"); expect(actual).not.toHaveProperty("secondary"); sets.add(actual.profileIds.join(","));
    }
    expect(sets.size).toBe(246);
    for (const impossible of outcomes.impossibleWinnerSets) {
      expect([7,8]).toContain(impossible.length);
      expect(Array.from({ length: 10 }, (_,i) => i+1).some(h => impossible.length*h <=20 && impossible.length*h + (8-impossible.length)*(h-1) >=20)).toBe(false);
    }
    const witness = outcomes.witnesses.find(w => w.winnerIds.length === 6)!;
    const result = scoreQuestionnaire(euphoria, witness.answers);
    if (result.status !== "complete" || !("profileIds" in result)) throw Error("Tie rejected");
    const rendered = dom(renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={euphoria} result={result} locale="en" />));
    expect(rendered.querySelectorAll("[data-archetype-count]")).toHaveLength(8); expect(rendered.querySelectorAll("[data-archetype-match]")).toHaveLength(6); expect(rendered.querySelectorAll("h4")).toHaveLength(36);
    const next = dom(renderToStaticMarkup(<QuestionnaireEuphoriaNextSteps locale="en" mbtiHref="/en/tests/mbti-personality-test-16-personality-types?target_action=questionnaire_result_mbti" />));
    expect(Array.from(next.querySelectorAll("a"), a => a.getAttribute("href"))).toEqual(["/en/tests/explore/euphoria-character-quiz#questionnaire-results", "/en/tests/mbti-personality-test-16-personality-types?target_action=questionnaire_result_mbti", "/en/tests#more-tests"]);
  });

  for (const [quiz, valid] of [[virtues, isMiniVirtuesConfigurationValid], [euphoria, isEuphoriaConfigurationValid]] as const) {
    it(`${quiz.slug}: rejects sparse consumed arrays, invalid versions and bad answer containers`, () => {
      const changes: ((q: Questionnaire) => void)[] = [q => { q.kind = "directional"; }, q => { q.source.formCode += "bad"; }, q => { q.source.itemBankVersion += "bad"; }, q => { q.source.scoringVersion += "bad"; }, q => { q.source.resultContentVersion += "bad"; }, q => { q.questions.length--; }, q => { q.questions[0].options.length--; }, q => { delete q.questions[0]; }, q => { delete q.questions[0].options[0]; }, q => { delete q.profiles[0]; }, q => { delete q.directions[0]; }, q => { delete q.profiles[0].sections[0]; }, q => { delete q.profiles[0].sections[0].paragraphs[0]; }, q => { delete q.guide[0]; }, q => { q.guide[0].id = "unknown"; }, q => { delete q.faq[0]; }, q => { delete q.references![0]; }, q => { q.questions[0].options[0].label.en = ""; }];
      for (const change of changes) { const bad = structuredClone(quiz); change(bad); expect(valid(bad)).toBe(false); expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 }); }
      for (const invalid of [null, [], new Date(), Object.create({ inherited: "a" }), { unknown: "a" }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
      expect(valid(null)).toBe(false); expect(valid({})).toBe(false);
      const a = { [quiz.questions[0].id]: quiz.questions[0].options[0].id }, draft = { version: quiz.version, savedAt: 123456, answers: a };
      expect(readQuestionnaireDraft(quiz, JSON.stringify(draft),123457)).toEqual(a);
      expect(readQuestionnaireDraft(quiz, JSON.stringify(draft),123456+86400000)).toBeNull();
      expect(readQuestionnaireDraft(quiz, JSON.stringify(draft),123455)).toBeNull();
      expect(readQuestionnaireDraft(quiz, JSON.stringify({ ...draft, version: "old" }),123457)).toBeNull();
      expect(readQuestionnaireDraft(quiz, JSON.stringify({ ...draft, answers: { bad: "3" } }),123457)).toBeNull();
      expect(scoreQuestionnaire(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
    });
  }

  it("publishes exactly34bilingual native entry/guide pages with complete bodies, canonical pairs and sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]); let pages = 0;
    try {
      for (const quiz of [virtues,euphoria]) for (const locale of ["en","zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const rendered = dom(renderToStaticMarkup(await entry.default(props))), meta = await entry.generateMetadata(props);
        expect(rendered.querySelectorAll("h1")).toHaveLength(1); expect(rendered.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
        expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(rendered.textContent).toContain(quiz.instructions![locale]);
        for (const method of quiz.guide.slice(0,3)) expect(rendered.textContent).toContain(method.paragraphs[0][locale]);
        if (quiz===virtues) for (const section of quiz.guide.slice(3)) for (const p of section.paragraphs) expect(rendered.textContent).toContain(p[locale]);
        expect(rendered.querySelectorAll("#questionnaire-method h3")).toHaveLength(0);
        expect(maps.some(e => e.loc===`https://fermatmind.com${path}`)).toBe(true);expect(isMissingFunRoute(path)).toBe(false);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);pages++;
        for (const profile of quiz.profiles) {
          const ppath=`${path}/results/${profile.id}`, props={params:Promise.resolve({locale,slug:quiz.slug,profile:profile.id})};
          const html=dom(renderToStaticMarkup(await guide.default(props))), metadata=await guide.generateMetadata(props);
          expect(html.querySelector("h1")?.textContent).toBe(profile.title[locale]);expect(metadata.title).toBe(profile.seo!.title[locale]);expect(metadata.description).toBe(profile.seo!.description[locale]);
          expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${ppath}`);
          expect(metadata.alternates?.languages).toMatchObject({en:`https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${profile.id}`,"zh-CN":`https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${profile.id}`});
          for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(html.textContent).toContain(paragraph[locale]);
          expect(html.querySelectorAll("h2[id],section[id] > h2").length).toBeGreaterThanOrEqual(profile.sections.length);
          expect(html.querySelectorAll("[data-mini-virtues-score],[data-archetype-count]")).toHaveLength(0);
          expect(maps.some(e => e.loc===`https://fermatmind.com${ppath}`)).toBe(true);expect(isMissingFunRoute(ppath)).toBe(false);if(locale==="en")expect(html.textContent).not.toMatch(/\p{Script=Han}/u);pages++;
        }
      }
      expect(pages).toBe(34);
    } finally {vi.unstubAllEnvs();vi.resetModules();}
  });
});
