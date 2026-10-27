import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  isHoldingBack35ConfigurationValid,
  scoreHoldingBack35Questionnaire,
  type HoldingBack35Questionnaire,
} from "@/lib/questionnaires/holdingBack35";
import { HOLDING_BACK_DOMAINS, scoreHoldingBackOriginal35 } from "@/lib/questionnaires/holdingBack35Method";
import { QuestionnaireHoldingBack35Report, QuestionnaireHoldingBack35NextSteps } from "@/components/questionnaires/QuestionnaireHoldingBack35Report";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/holding-yourself-back.json", "utf8")) as HoldingBack35Questionnaire;
const sourceFile = "tests/fixtures/questionnaires/holding-yourself-back-source-reference.json";
const profilesFile = "tests/fixtures/questionnaires/holding-yourself-back-profiles-reference.json";
const source = JSON.parse(readFileSync(sourceFile, "utf8"));
const profiles = JSON.parse(readFileSync(profilesFile, "utf8"));
const numeric = JSON.parse(readFileSync("tests/fixtures/questionnaires/holding-yourself-back-numeric-reference.json", "utf8")) as { states: { sum: number; display: string }[] };
const sha = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const answers = (value = "3") => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (input: unknown) => {
  const r = scoreHoldingBack35Questionnaire(quiz, input);
  if (r.status !== "complete") throw new Error("Complete original35 witness rejected");
  return r;
};

describe("Holding Yourself Back: original35seven independent practical topic summaries", () => {
  it("binds all35 bilingual scenarios, anchors, seven full6 guides and unique editorial titles", () => {
    expect(isHoldingBack35ConfigurationValid(quiz)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(sha(sourceFile));
    expect(quiz.source.resultContentSha256).toBe(sha(profilesFile));
    expect(sha("lib/questionnaires/holdingBack35Method.ts")).toBe(source.numericMethodSha256);
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.questions).toHaveLength(35); expect(quiz.profiles).toEqual(profiles);
    expect(quiz.profiles).toHaveLength(7); expect(quiz.faq).toHaveLength(6);
    for (const [i, q] of quiz.questions.entries()) {
      expect(q.id).toBe(source.items[i].id); expect(q.prompt).toEqual(source.items[i].prompt); expect(q.reverse).toBe(false);
      expect(q.options.map(o => ({ id: o.id, score: o.score, label: o.label }))).toEqual(source.anchors);
      expect(q.options.every(o => o.directionId === source.items[i].directionId)).toBe(true);
    }
    expect(new Set(quiz.profiles.map(p => p.headline.en)).size).toBe(7);
    expect(new Set(quiz.profiles.map(p => p.headline.zh)).size).toBe(7);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(6); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);
      expect(p.seo!.description.en).not.toBe(p.summary.en);
    }
    expect(quiz.references?.map(r => r.url)).toEqual(["https://pubmed.ncbi.nlm.nih.gov/33764117/"]);
    expect(JSON.stringify(quiz)).not.toMatch(/researchgate\.net|idrlabs\.com|UPPS|\/Users\//);
    const visit = (v: unknown): void => {
      if (!v || typeof v !== "object") return;
      const x = v as Record<string, unknown>;
      if ("en" in x || "zh" in x) { expect(x.en).toBeTypeOf("string"); expect(x.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(x.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(x).forEach(visit);
    }; visit(quiz);
  });
  it("maps real string optionIDs to frozen numeric method for all21875 per-domain numeric vectors", () => {
    expect(numeric.states).toHaveLength(21);
    const bySum = new Map(numeric.states.map(s => [s.sum, s.display]));
    expect([...bySum.keys()]).toEqual(Array.from({ length: 21 }, (_, i) => i + 5));
    let checked = 0;
    for (let j = 0; j < 7; j++) for (let state = 0; state < 3125; state++) {
      let n = state, sum = 0; const a = answers("1");
      for (const id of HOLDING_BACK_DOMAINS[j].itemIds) { const v = n % 5 + 1; n = Math.floor(n / 5); a[id] = String(v); sum += v; }
      const r = complete(a); const part = r.holdingBack35.domains[j];
      expect(part.mean?.toFixed(1)).toBe(bySum.get(sum)); expect(part.numericCount).toBe(5);
      expect(r.holdingBack35.domains.map(p => p.domainId)).toEqual(HOLDING_BACK_DOMAINS.map(d => d.id));
      expect(Object.keys(r)).toEqual(["status", "answered", "holdingBack35"]);
      expect(Object.keys(r.holdingBack35)).toEqual(["method", "domains"]); checked++;
    }
    expect(checked).toBe(21875);
  });
  it("keeps every224 per-domain missing mask local and every128 joint-domain pattern independent", () => {
    for (let j = 0; j < 7; j++) for (let mask = 0; mask < 32; mask++) {
      const a = answers(); const count = 5 - mask.toString(2).replaceAll("0", "").length;
      HOLDING_BACK_DOMAINS[j].itemIds.forEach((id, k) => { if (mask & (1 << k)) a[id] = "na"; });
      const r = complete(a);
      r.holdingBack35.domains.forEach((p, k) => { expect(p.numericCount).toBe(k === j ? count : 5); expect(p.mean).toBe(k === j && mask ? null : 3); });
    }
    for (let mask = 0; mask < 128; mask++) {
      const a = answers(); HOLDING_BACK_DOMAINS.forEach((d, j) => { if (mask & (1 << j)) a[d.itemIds[0]] = "na"; });
      complete(a).holdingBack35.domains.forEach((p, j) => expect(p.mean).toBe(mask & (1 << j) ? null : 3));
    }
    expect(complete(answers("na")).holdingBack35.domains.every(p => p.mean === null && p.numericCount === 0)).toBe(true);
  });
  it("distinguishes unfinished, explicitNA and illegal inputs without coercion or inherited answers", () => {
    for (let n = 0; n < 35; n++) expect(scoreHoldingBack35Questionnaire(quiz, Object.fromEntries(quiz.questions.slice(0, n).map(q => [q.id, "3"]))))
      .toEqual({ status: "incomplete", answered: n });
    for (const q of quiz.questions) for (const bad of [null, undefined, 1, 3, 5, true, false, "", "0", "6", "3.0", "NA", " 3 ", NaN, [], {}])
      expect(scoreHoldingBack35Questionnaire(quiz, { ...answers(), [q.id]: bad }).status).toBe("invalid");
    for (const bad of [null, undefined, [], new Date(), Object.create(answers()), { ...answers(), unrelated: "3" }])
      expect(scoreHoldingBack35Questionnaire(quiz, bad).status).toBe("invalid");
    const getter = answers(); Object.defineProperty(getter, quiz.questions[0].id, { get() { throw Error("do not invoke"); }, enumerable: true });
    expect(scoreHoldingBack35Questionnaire(quiz, getter).status).toBe("invalid");
    const symbolic = answers(); Object.defineProperty(symbolic, Symbol("extra"), { value: "3" }); expect(scoreHoldingBack35Questionnaire(quiz, symbolic).status).toBe("invalid");
    expect(complete(Object.assign(Object.create(null), answers())).holdingBack35.domains.every(p => p.mean === 3)).toBe(true);
    expect(scoreHoldingBackOriginal35(answers())).toBeNull();
  });
  it("fails closed on altered scale identity, direction, reversal, options or missing full content", () => {
    const mutations: ((q: HoldingBack35Questionnaire) => void)[] = [
      q => { q.slug = "other"; }, q => { q.code = "IPRS"; }, q => { q.source.scoringVersion = "other"; },
      q => { q.minimumRatedItems = 4; }, q => { q.questions[0].reverse = true; }, q => { q.questions[0].options[0].score = 0; },
      q => { q.questions[0].options[0].id = "0"; }, q => { q.questions[0].options[5].score = 1; },
      q => { q.questions[0].options[0].directionId = "self-doubt"; }, q => { q.questions[0].prompt.en = ""; },
      q => { q.directions[0].itemCount = 4; }, q => { q.profiles[0].sections.pop(); },
      q => { delete q.questions[0]; }, q => { delete q.questions[0].options[0]; }, q => { delete q.profiles[0]; },
    ];
    for (const mutate of mutations) { const q = structuredClone(quiz); mutate(q); expect(isHoldingBack35ConfigurationValid(q)).toBe(false); expect(scoreHoldingBack35Questionnaire(q, answers())).toEqual({ status: "unavailable", answered: 0 }); }
  });
  it("renders allseven complete guides, fixed-order means and optional nextsteps in both languages even allNA", () => {
    for (const locale of ["en", "zh"] as const) for (const missing of [false, true]) {
      const r = complete(answers(missing ? "na" : "3")); const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<><QuestionnaireHoldingBack35Report quiz={quiz} result={r} locale={locale} /><QuestionnaireHoldingBack35NextSteps locale={locale} /></>);
      expect(dom.querySelectorAll("[data-holding-back35-part]")).toHaveLength(7);
      expect(Array.from(dom.querySelectorAll("[data-holding-back35-part]"), e => e.getAttribute("data-holding-back35-part"))).toEqual(HOLDING_BACK_DOMAINS.map(d => d.id));
      expect(dom.querySelectorAll("[data-holding-back35-guide]")).toHaveLength(7);
      for (const profile of quiz.profiles) {
        const guide = dom.querySelector(`[data-holding-back35-guide="${profile.id}"]`)!;
        expect(guide.querySelector("h3")?.textContent).toBe(profile.title[locale]); expect(guide.querySelectorAll("h4")).toHaveLength(6);
        for (const s of profile.sections) for (const p of s.paragraphs) expect(guide.textContent).toContain(p[locale]);
        expect(guide.querySelector("a")?.getAttribute("href")).toBe(`/${locale}/tests/explore/holding-yourself-back/results/${profile.id}`);
      }
      for (const mean of dom.querySelectorAll("[data-holding-back35-mean]")) expect(mean.textContent).toContain(missing ? (locale === "zh" ? "资料不足" : "Insufficient information") : "3.0 / 5");
      expect(dom.querySelector("[data-holding-back35-next-steps] h3")?.textContent).toContain(locale === "zh" ? "本次作答已结束" : "This attempt is finished");
      expect(dom.querySelector("a[href*='tests/mbti']")).toBeNull();
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
