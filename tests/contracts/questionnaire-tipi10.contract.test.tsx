import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Tipi10Report, Tipi10NextSteps } from "@/components/questionnaires/Tipi10Report";
import { isTipi10ConfigurationValid, tipiDomains } from "@/lib/questionnaires/tipi10";
import { scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/tipi-10.json", "utf8")) as Questionnaire;
const all = (value = "4"): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (answers: unknown) => {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("tipi10" in result)) throw Error("Expected five source pair means");
  return result;
};

describe("TIPI-10 original source key, separate Big Five version", () => {
  it("loads the exact English edition with working Chinese, complete guides and bound content hashes", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz);
    expect(isTipi10ConfigurationValid(quiz)).toBe(true);
    expect(quiz.questions.map(q => q.reverse)).toEqual([false, true, false, true, false, true, false, true, false, true]);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.questions)).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.directions.map(d => d.id)).toEqual(tipiDomains);
    const inspect = (x: unknown): void => {
      if (!x || typeof x !== "object") return;
      const o = x as Record<string, unknown>;
      if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u); expect(o.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(o).forEach(inspect);
    };
    inspect(quiz);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(8);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(400);
      for (const l of ["en", "zh"] as const) { expect(p.seo!.title[l].length).toBeLessThanOrEqual(60); expect(p.seo!.description[l].length).toBeLessThanOrEqual(160); }
    }
  });
  it("independently checks all49 response pairs in each domain without affecting the other four", () => {
    const pairs = [[1, 6], [7, 2], [3, 8], [9, 4], [5, 10]] as const;
    for (const [n, domain] of tipiDomains.entries()) for (let direct = 1; direct <= 7; direct++) for (let reversed = 1; reversed <= 7; reversed++) {
      const a = all(); a[`tipi-${String(pairs[n][0]).padStart(2, "0")}`] = String(direct); a[`tipi-${String(pairs[n][1]).padStart(2, "0")}`] = String(reversed);
      const r = complete(a); expect(r.tipi10[domain].mean).toBe((direct + 8 - reversed) / 2);
      expect(r.tipi10[domain].items).toHaveLength(2);
      for (const other of tipiDomains.filter(d => d !== domain)) expect(r.tipi10[other].mean).toBe(4);
      expect(Object.keys(r).sort()).toEqual(["answered", "status", "tipi10"]);
    }
    const r = complete({ ...all(), "tipi-04": "2", "tipi-09": "5" });
    expect(r.tipi10["emotional-stability"].mean).toBe(5.5);
    expect(r.tipi10["emotional-stability"].items.find(i => i.id === "tipi-09")).toEqual({ id: "tipi-09", response: 5, keyed: 5, reverse: false });
    expect(complete(all("6")).tipi10.extraversion.mean).toBe(4);
    expect(complete(all()).tipi10.extraversion.mean).toBe(4);
    expect(complete(all("6")).tipi10.extraversion.items).not.toEqual(complete(all()).tipi10.extraversion.items);
  });
  it("withholds all partial results, rejects malformed inputs and source drift, and binds expiring drafts", () => {
    for (let n = 0; n < 10; n++) expect(scoreQuestionnaire(quiz, Object.fromEntries(Object.entries(all()).slice(0, n)))).toEqual({ status: "incomplete", answered: n });
    for (const bad of [null, [], Object.create(all()), { ...all(), unknown: "4" }, { ...all(), "tipi-01": 4 }, ...["0", "8", "na", "4.0", ""].map(v => ({ ...all(), "tipi-01": v }))]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const mutate of [
      (q: Questionnaire) => { q.questions[8].reverse = true; },
      (q: Questionnaire) => { q.questions[0].prompt.en = "A rewritten item"; },
      (q: Questionnaire) => { q.questions[0].options.pop(); },
      (q: Questionnaire) => { q.questions[0].options[0].score = 7; },
      (q: Questionnaire) => { q.questions[0].options[0].directionId = "openness"; },
      (q: Questionnaire) => { q.source.formCode = "other"; },
      (q: Questionnaire) => { q.profiles[0].sections = []; },
    ]) { const broken = structuredClone(quiz); mutate(broken); expect(scoreQuestionnaire(broken, all())).toEqual({ status: "unavailable", answered: 0 }); }
    const now = 1_800_000_000_000, answers = { "tipi-01": "7" };
    const draft = (version = quiz.version, savedAt = now) => JSON.stringify({ version, savedAt, answers });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual(answers);
    expect(readQuestionnaireDraft(quiz, draft("old"), now)).toBeNull();
    expect(readQuestionnaireDraft(quiz, draft(quiz.version, now - 86400000), now)).toBeNull();
    expect(readQuestionnaireDraft(quiz, draft(quiz.version, now + 1), now)).toBeNull();
  });
  it("renders five complete readings and all original/keyed values, with a valid optional core link", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["1", "4", "7"]) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<><Tipi10Report quiz={quiz} result={complete(all(value))} locale={locale} /><Tipi10NextSteps locale={locale} /></>);
      expect(dom.querySelectorAll("[data-tipi10-mean]")).toHaveLength(5); expect(dom.querySelectorAll("[data-tipi10-item]")).toHaveLength(10); expect(dom.querySelectorAll("h4")).toHaveLength(40);
      for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
      expect(dom.querySelector("[data-tipi10-next-steps] a")?.getAttribute("href")).toBe(`/${locale}/tests/big-five-personality-test-ocean-model`);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.textContent).not.toMatch(/battery|电量|剩余能量/);
    }
  });
  it("publishes twelve bilingual native URLs with full public text, directory, canonical pairs and sitemap entries", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, args = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(args));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
        expect(dom.textContent).toContain(quiz.instructions![locale]);
        expect((await entry.generateMetadata(args)).alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const p of quiz.profiles) {
          const url = `${path}/results/${p.id}`, args = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) };
          dom.innerHTML = renderToStaticMarkup(await guide.default(args)); const metadata = await guide.generateMetadata(args);
          expect(metadata.title).toBe(p.seo!.title[locale]);
          expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${url}`);
          expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` });
          for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
          expect(dom.querySelector("[data-tipi10-mean]")).toBeNull();
          expect(maps.filter(x => x.loc === `https://fermatmind.com${url}`)).toHaveLength(1);
        }
        expect(maps.filter(x => x.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
