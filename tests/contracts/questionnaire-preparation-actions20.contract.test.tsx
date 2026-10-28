import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { isPreparationActions20ConfigurationValid, scorePreparationActions20Questionnaire, preparationActions20GuideLinks, type PreparationActions20Questionnaire } from "@/lib/questionnaires/preparationActions20";
import { PREPARATION_ACTION_FORMS, scorePreparationActions20, type PreparationActionForm } from "@/lib/questionnaires/preparationActions20Method";
import { QuestionnairePreparationActions20Report, QuestionnairePreparationActions20NextSteps } from "@/components/questionnaires/QuestionnairePreparationActions20Report";
const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const states = read("tests/fixtures/questionnaires/preparation-actions20-numeric-reference.json").sumStates as { sum: number; display: string }[];
for (const slug of Object.keys(PREPARATION_ACTION_FORMS) as PreparationActionForm[]) {
  const quiz = read(`lib/questionnaires/data/${slug}.json`) as PreparationActions20Questionnaire;
  const answers = (value = "3") => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
  const complete = (a: unknown) => { const r = scorePreparationActions20Questionnaire(quiz, a); if (r.status !== "complete") throw Error("Expected complete actions20"); return r; };
  describe(`${slug}: original preparation actions, no aggregate readiness verdict`, () => {
    it("binds original bilingual questions and all five full six-section guides to source hashes", () => {
      expect(isPreparationActions20ConfigurationValid(quiz)).toBe(true);
      expect(quiz.questions).toEqual(read(`tests/fixtures/questionnaires/${slug}-questions-reference.json`));
      expect(quiz.profiles).toEqual(read(`tests/fixtures/questionnaires/${slug}-profiles-reference.json`));
      expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
      expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.guide).toHaveLength(6); expect(quiz.faq).toHaveLength(6);
      for (const profile of quiz.profiles) { expect(profile.sections.map(s => s.id)).toEqual(["meaning", "distinctions", "scenario", "try", "conditions", "reading"]); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160); }
      const visit = (value: unknown): void => { if (!value || typeof value !== "object") return; const x = value as Record<string, unknown>; if ("en" in x || "zh" in x) { expect(x.en).toBeTypeOf("string"); expect(x.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u); expect(x.zh).toMatch(/\p{Script=Han}/u); } else Object.values(x).forEach(visit); }; visit(quiz);
      expect(JSON.stringify(quiz)).not.toMatch(/jobcannon\.io|\/Users\/|hiring probability|success rate/i);
    });
    it("checks every 625 four-action numeric/NA vector in each of five groups against independent Decimal states", () => {
      const bySum = new Map(states.map(s => [s.sum, s.display])); expect([...bySum.keys()]).toEqual(Array.from({ length: 13 }, (_, i) => i));
      let checked = 0;
      for (let group = 0; group < 5; group++) for (let vector = 0; vector < 625; vector++) {
        const a = answers("2"); let n = vector, sum = 0, notRated = 0; const counts = [0, 0, 0, 0, 0];
        for (let k = 0; k < 4; k++) { const v = n % 5; n = Math.floor(n / 5); a[quiz.questions[group * 4 + k].id] = v === 4 ? "na" : String(v); counts[v]++; if (v === 4) notRated++; else sum += v; }
        const r = complete(a); const d = r.preparationActions20.domains[group];
        expect(d.sum).toBe(notRated ? null : sum); expect(d.mean?.toFixed(1) ?? null).toBe(notRated ? null : bySum.get(sum)); expect(d.ratedItems).toBe(4 - notRated);
        expect(Object.values(d.counts)).toEqual(counts); expect(d.rows.map(row => String(row.answer))).toEqual(quiz.questions.slice(group * 4, group * 4 + 4).map(q => a[q.id]));
        r.preparationActions20.domains.forEach((other, i) => { if (i !== group) expect(other.mean).toBe(2); });
        expect(Object.keys(r.preparationActions20)).toEqual(["form", "answered", "domains"]); checked++;
      }
      expect(checked).toBe(3125);
    });
    it("preserves every joint group NA pattern, zero, allNA and distinct gaps behind equal means", () => {
      for (let mask = 0; mask < 32; mask++) { const a = answers(); quiz.directions.forEach((_, i) => { if (mask & (1 << i)) a[quiz.questions[i * 4].id] = "na"; }); complete(a).preparationActions20.domains.forEach((d, i) => expect(d.mean).toBe(mask & (1 << i) ? null : 3)); }
      expect(complete(answers("0")).preparationActions20.domains.every(d => d.mean === 0 && d.sum === 0)).toBe(true);
      expect(complete(answers("na")).preparationActions20.domains.every(d => d.mean === null && d.sum === null && d.counts.notRated === 4)).toBe(true);
      const a = answers(), b = answers(); [3, 3, 0, 0].forEach((v, i) => a[quiz.questions[i].id] = String(v)); [2, 2, 1, 1].forEach((v, i) => b[quiz.questions[i].id] = String(v));
      const da = complete(a).preparationActions20.domains[0], db = complete(b).preparationActions20.domains[0]; expect(da.mean).toBe(1.5); expect(db.mean).toBe(1.5); expect(da.counts).not.toEqual(db.counts);
    });
    it("rejects coercion, inherited/accessor/symbol/extra inputs and distinguishes missing answers from NA", () => {
      for (let n = 0; n < 20; n++) expect(scorePreparationActions20Questionnaire(quiz, Object.fromEntries(quiz.questions.slice(0, n).map(q => [q.id, "0"])))) .toEqual({ status: "incomplete", answered: n });
      for (const q of quiz.questions) for (const bad of [null, undefined, 0, 3, -1, 4, true, false, "", "4", "3.0", "NA", " 3 ", NaN, [], {}]) expect(scorePreparationActions20Questionnaire(quiz, { ...answers(), [q.id]: bad }).status).toBe("invalid");
      for (const bad of [null, undefined, [], new Date(), Object.create(answers()), { ...answers(), extra: "3" }]) expect(scorePreparationActions20Questionnaire(quiz, bad).status).toBe("invalid");
      const getter = answers(); Object.defineProperty(getter, quiz.questions[0].id, { get() { throw Error("must not run getter"); } }); expect(scorePreparationActions20Questionnaire(quiz, getter).status).toBe("invalid");
      const symbolic = answers(); Object.defineProperty(symbolic, Symbol("extra"), { value: "3" }); expect(scorePreparationActions20Questionnaire(quiz, symbolic).status).toBe("invalid");
      expect(complete(Object.assign(Object.create(null), answers())).preparationActions20.domains.every(d => d.mean === 3)).toBe(true);
      expect(scorePreparationActions20("other", {})).toBeNull(); expect(scorePreparationActions20(slug, answers())).toBeNull();
      const numeric = Object.fromEntries(quiz.questions.map(q => [q.id, 3]));
      for (const bad of ["3", "na ", 0.5, -1, 4, NaN, true, null]) expect(scorePreparationActions20(slug, { ...numeric, [quiz.questions[0].id]: bad })).toBeNull();
    });
    it("fails closed on changed identity, scoring topology and missing bilingual full content", () => {
      const edits: ((q: PreparationActions20Questionnaire) => void)[] = [q => { q.slug = "other"; }, q => { q.code = "official"; }, q => { q.version = "other"; }, q => { q.minimumRatedItems = 3; }, q => { q.source.scoringVersion = "other"; }, q => { q.source.itemBankSha256 = "other"; }, q => { q.questions[0].reverse = true; }, q => { q.questions[0].options[0].score = 1; }, q => { q.questions[0].options[4].score = 0; }, q => { q.questions[0].options[0].directionId = "other"; }, q => { q.directions.reverse(); }, q => { q.questions[0].prompt.zh = ""; }, q => { q.profiles[0].sections.pop(); }, q => { q.profiles[0].sections[0].paragraphs[0].en = ""; }, q => { delete q.questions[0]; }, q => { delete q.questions[0].options[0]; }, q => { delete q.profiles[0]; }];
      for (const edit of edits) { const q = structuredClone(quiz); edit(q); expect(isPreparationActions20ConfigurationValid(q)).toBe(false); expect(scorePreparationActions20Questionnaire(q, answers()).status).toBe("unavailable"); }
    });
    it("renders every full guide and all twenty selections in both languages, including allNA; copy contains public links only", () => {
      for (const locale of ["en", "zh"] as const) for (const missing of [false, true]) {
        const r = complete(answers(missing ? "na" : "3")); const dom = document.createElement("div");
        dom.innerHTML = renderToStaticMarkup(<><QuestionnairePreparationActions20Report quiz={quiz} result={r} locale={locale} /><QuestionnairePreparationActions20NextSteps quiz={quiz} locale={locale} /></>);
        expect(dom.querySelectorAll("[data-preparation-actions-part]")).toHaveLength(5); expect(dom.querySelectorAll("[data-preparation-action-row]")).toHaveLength(20); expect(dom.querySelectorAll("[data-preparation-actions-guide]")).toHaveLength(5);
        for (const p of quiz.profiles) { const guide = dom.querySelector(`[data-preparation-actions-guide="${p.id}"]`)!; expect(guide.querySelectorAll("h4")).toHaveLength(6); for (const s of p.sections) for (const paragraph of s.paragraphs) expect(guide.textContent).toContain(paragraph[locale]); }
        for (const value of dom.querySelectorAll("[data-preparation-actions-mean]")) expect(value.textContent).toContain(missing ? (locale === "zh" ? "不显示数值" : "Value withheld") : "3.0 / 3");
        expect(dom.querySelector("a[href*='tests/mbti']")).toBeNull(); const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
        const copy = preparationActions20GuideLinks(quiz, locale)!; expect(copy).toBe(quiz.profiles.map(p => `${p.title[locale]}\nhttps://fermatmind.com/${locale}/tests/explore/${slug}/results/${p.id}`).join("\n\n")); expect(copy).not.toMatch(/[?=&]|mean|3\.0|FRA_|RWA_/);
      }
    });
    it("refuses mismatched or corrupted calculated reports instead of displaying values", () => {
      for (const mutate of [(r: ReturnType<typeof complete>) => { r.preparationActions20.domains[0].mean = 9; }, (r: ReturnType<typeof complete>) => { r.preparationActions20.form = slug === "remote-work" ? "freelance-ready" : "remote-work"; }]) {
        const r = complete(answers()); mutate(r); const html = renderToStaticMarkup(<QuestionnairePreparationActions20Report quiz={quiz} result={r} locale="en" />); expect(html).toContain('role="alert"'); expect(html).not.toContain("data-preparation-actions-part");
      }
    });
  });
}
