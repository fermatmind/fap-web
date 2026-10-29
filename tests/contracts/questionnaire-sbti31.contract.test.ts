import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import data from "@/lib/questionnaires/data/sbti-test.json";
import reference from "../fixtures/questionnaires/sbti31-original-reference.json";
import { isSbti31ConfigurationValid, scoreSbti31, sbti31Questions, sbti31Profiles, SBTI31_SOURCE_SHA256 } from "@/lib/questionnaires/sbti31";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";

describe("SBTI original31 source and scoring", () => {
  it("keeps the original engine bytes and all31 original Chinese prompts/options/order/impacts", () => {
    expect(createHash("sha256").update(readFileSync("lib/questionnaires/sbti31Engine.cjs")).digest("hex")).toBe(reference.sourceHashes["historical_engine.js"]);
    expect(SBTI31_SOURCE_SHA256).toBe(reference.sourceHashes["historical_engine.js"]);
    expect(data.questions.map(q => ({ id: q.id, prompt: q.prompt.zh, options: q.options.map(o => ({ id: o.id, label: o.label.zh, impacts: o.originalImpacts })) }))).toEqual(reference.questions.map(q => ({ id: q.id, prompt: q.prompt.zh, options: q.options.map(o => ({ id: o.id, label: o.label.zh, impacts: o.impacts })) })));
    expect(sbti31Questions).toHaveLength(31); expect(data.source.formCode).toBe(reference.form); expect(data.source.scoringVersion).toBe(reference.scoringVersion);
    expect(data.questions[10].prompt.zh).toBe(reference.questions[10].prompt.zh);
  });
  it("matches the original Mini scorer for all25 frozen result witnesses, including every scalar and15-dimensional vector", () => {
    const codes = new Set<string>();
    for (const row of reference.cases) {
      const result = scoreSbti31(row.answers); expect(result.status).toBe("complete");
      if (result.status !== "complete") throw Error("Incomplete source witness");
      const { status, answered, profileId, ...actual } = result;
      expect(status).toBe("complete"); expect(answered).toBe(31);
      expect(profileId).toBe(reference.profiles.find(p => p.code === row.expected.profileCode)?.id);
      expect(actual).toEqual(row.expected); expect(scoreSbti31(row.answers)).toEqual(result); codes.add(result.profileCode);
    }
    expect(codes.size).toBe(25);
  });
  it("preserves every original profile code/name/overview and complete15-dimensional bilingual explanations", () => {
    expect(sbti31Profiles.map(p => p.code)).toEqual(reference.profiles.map(p => p.code));
    for (const [i, p] of data.profiles.entries()) {
      expect(p.id).toBe(reference.profiles[i].id); expect(p.headline.zh).toBe(reference.profiles[i].displayNameZh);
      expect(p.sections[0].paragraphs.map(p => p.zh)).toEqual([reference.profiles[i].heroTagline, reference.profiles[i].summaryNote, reference.profiles[i].overview]);
      expect(p.sections[1].paragraphs).toHaveLength(15); expect(p.sections).toHaveLength(6);
      for (const s of p.sections) for (const paragraph of s.paragraphs) { expect(paragraph.en.trim()).not.toBe(""); expect(paragraph.zh.trim()).not.toBe(""); }
    }
  });
  it("rejects invalid keys/options/accessors/symbols and requires all original31 without imputation", () => {
    const answers = reference.cases[0].answers;
    expect(scoreSbti31({})).toEqual({ status: "incomplete", answered: 0 });
    for (const q of reference.questions) { const partial: Record<string, string> = { ...answers }; delete partial[q.id]; expect(scoreSbti31(partial).status).toBe("incomplete"); }
    for (const value of [null, [], 1, { ...answers, q1: "INVALID" }, { ...answers, unknown: "A" }, { ...answers, [Symbol("x")]: "A" }, Object.defineProperty({}, "q1", { get() { throw Error("Must not run"); }, enumerable: true })]) expect(scoreSbti31(value).status).toBe("invalid");
  });
  it("closes configuration drift and removes the fifty-choice implementation rather than exposing a second version", () => {
    expect(isSbti31ConfigurationValid(data)).toBe(true);
    const changed = structuredClone(data); changed.questions[0].prompt.zh += "改"; expect(isSbti31ConfigurationValid(changed)).toBe(false);
    const missing = structuredClone(data); missing.profiles.pop(); expect(isSbti31ConfigurationValid(missing)).toBe(false);
    expect(scoreQuestionnaire(data as Questionnaire, reference.cases[0].answers).status).toBe("unavailable");
    for (const path of ["lib/questionnaires/sbti50.ts", "components/questionnaires/QuestionnaireSbti50Client.tsx", "components/questionnaires/Sbti50Page.tsx", "tests/fixtures/questionnaires/sbti50-count-reference.json"]) expect(existsSync(path)).toBe(false);
    expect(JSON.stringify(data)).not.toMatch(/SBTI50_|sbti50|fifty.choice|50组|50 pairs/i);
  });
});
