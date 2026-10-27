import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { isMiniFrictionConfigurationValid } from "@/lib/questionnaires/miniFriction";
import { scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { QuestionnaireMiniFrictionReport } from "@/components/questionnaires/QuestionnaireMiniFrictionReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/annoying-person-test.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/annoying-person-test-source-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; parts: Questionnaire["directions"]; original_item_bank: { items: { prompt: string; reverse_scored: boolean }[] } };
const profileBytes = readFileSync("tests/fixtures/questionnaires/annoying-person-test-profiles-reference.json");
const methodIds = ["friction-scoring", "friction-complete", "friction-source"];
const reverse = new Set<number>([]);
const baseline = () => Object.fromEntries(quiz.questions.map((q, i) => [q.id, String(reverse.has(i + 1) ? 5 + 1 - 3 : 3)]));
function keyed(n: number) { return Object.fromEntries(quiz.questions.map((q, i) => [q.id, String(reverse.has(i + 1) ? 5 + 1 - n : n)])); }
function complete(answers: Record<string, string>) {
  const r = scoreQuestionnaire(quiz, answers);
  if (r.status !== "complete" || !("miniFriction" in r)) throw Error("Wrong T094 result kind");
  return r;
}
describe("T094 closed source projection and full public readings", () => {
  it("binds the fixed source item edition, bilingual prompts and all complete guides", () => {
    expect(isMiniFrictionConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toEqual(source.questions); expect(quiz.directions).toEqual(source.parts);
    expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString())); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex"));
    expect(quiz.questions).toHaveLength(20); expect(quiz.directions).toHaveLength(5); expect(quiz.profiles).toHaveLength(5);
    for (const [i, q] of quiz.questions.entries()) {
      expect(q.id).toBe(`DISLIKED_LK_${String(i + 1).padStart(3, "0")}`); expect(q.reverse).toBe(reverse.has(i + 1));
      expect(q.options.map(o => o.id)).toEqual(Array.from({ length: 5 }, (_, i) => String(i + 1))); expect(q.options.map(o => o.score)).toEqual(Array.from({ length: 5 }, (_, i) => i + 1)); expect(q.prompt.zh).toMatch(/\p{Script=Han}/u);
    }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(8); for (const s of p.sections) for (const t of s.paragraphs) { expect(t.en.trim()).not.toBe(""); expect(t.zh).toMatch(/\p{Script=Han}/u); } }
    for (const locale of ["en", "zh"] as const) { expect(new Set(quiz.profiles.map(p => p.seo!.title[locale])).size).toBe(5); expect(new Set(quiz.profiles.map(p => p.seo!.description[locale])).size).toBe(5); }
    expect(quiz.questions.map(q => q.prompt.zh)).toEqual(source.original_item_bank.items.map(q => q.prompt)); expect(source.original_item_bank.items.every(q => q.reverse_scored === false)).toBe(true); expect(quiz.questions[0].options[2].label.zh).toContain("不确定或视情况");
  });
  it("recomputes3125perpartvectors with source midpoint3 and no total/rank", () => {
    const base = baseline(); let witnesses = 0;
    for (let part = 0; part < 5; part++) { const sums = new Set<number>(); for (let n = 0; n < 625; n++) { const a = { ...base }; let digits = n, expected = 0; for (let j = 0; j < 4; j++) { const value = digits % 5 + 1; digits = Math.floor(digits / 5); a[`DISLIKED_LK_${String(part * 4 + j + 1).padStart(3, "0")}`] = String(value); expected += value; }
      const r = complete(a); for (let k = 0; k < 5; k++) { const sum = k === part ? expected : 12; assert.deepEqual(r.miniFriction[k], { id: quiz.directions[k].id, profileId: quiz.profiles[k].id, rawSum: sum, mean: sum / 4 }); } sums.add(expected); witnesses++; }
      expect([...sums].sort((a, b) => a - b)).toEqual(Array.from({ length: 17 }, (_, i) => i + 4)); }
    expect(witnesses).toBe(3125); expect(complete(base).miniFriction.every(p => p.mean === 3)).toBe(true); expect(Object.keys(complete(base)).sort()).toEqual(["answered", "miniFriction", "status"]); console.info("T0943125separatepartvectors;not5^20joint execution or psychometric validation.");
  }, 30000);
  it("renders every full paragraph and exact sum/mean at minimum, maximum, middle and mixed responses", () => {
    const near = keyed(5); near[quiz.questions[0].id] = String(5 - 1);
    for (const locale of ["en", "zh"] as const) for (const answers of [keyed(1), baseline(), keyed(5), near]) {
      const r = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireMiniFrictionReport quiz={quiz} result={r} locale={locale} />);
      expect(dom.querySelectorAll("[data-mini-friction-part]")).toHaveLength(5); expect(dom.querySelectorAll("h4")).toHaveLength(40);
      for (const part of r.miniFriction) { const line = dom.querySelector(`[data-mini-friction-score="${part.id}"]`)?.textContent; expect(line).toContain(part.mean.toFixed(2)); expect(line).toContain(String(part.rawSum)); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
      const ids = [...dom.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("suppresses all incomplete personal scoring and preserves strict answer and draft admission", () => {
    for (let i = 0; i < quiz.questions.length; i++) { const a = baseline(); delete a[quiz.questions[i].id]; expect(scoreQuestionnaire(quiz, a)).toEqual({ status: "incomplete", answered: 20 - 1 }); }
    expect(scoreQuestionnaire(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "2" }, { [quiz.questions[0].id]: "na" }, { [quiz.questions[0].id]: 2 }, { ...baseline(), [quiz.questions[0].id]: "6" }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.source.formCode = "other"; expect(scoreQuestionnaire(bad, baseline())).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { [quiz.questions[0].id]: "2" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ [quiz.questions[0].id]: "2" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull(); expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: "other", savedAt: 100, answers: baseline() }), 200)).toBeNull();
  });
  it("fails closed before scorer, metadata, profile lookup and image for every sparse or malformed consumed array", async () => {
    const loader = await import("@/lib/questionnaires/loaders"), entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), image = await import("@/app/og/fun/[slug]/route");
    const spy = vi.spyOn(loader, "loadQuestionnaire");
    try { for (const field of ["questions", "directions", "profiles", "options", "sections", "paragraphs", "directionIds", "guide", "guideParagraphs", "faq", "references"] as const) for (const mode of ["hole", "undefined", "null"] as const) {
      const bad = structuredClone(quiz); if (field === "references") bad.references = [{ title: { en: "Source", zh: "来源" }, url: "https://example.com/" }];
      const array: unknown[] = field === "options" ? bad.questions[0].options : field === "sections" ? bad.profiles[0].sections : field === "paragraphs" ? bad.profiles[0].sections[0].paragraphs : field === "directionIds" ? bad.profiles[0].directionIds : field === "guideParagraphs" ? bad.guide[0].paragraphs : bad[field]!;
      if (mode === "hole") delete array[0]; else array[0] = mode === "null" ? null : undefined;
      expect(isMiniFrictionConfigurationValid(bad)).toBe(false); expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 }); spy.mockResolvedValue(bad);
      const ep = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, gp = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: quiz.profiles[0].id }) };
      expect((await entry.generateMetadata(ep)).robots).toEqual({ index: false, follow: false }); expect((await guide.generateMetadata(gp)).robots).toEqual({ index: false, follow: false });
      await expect(entry.default(ep)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404"); await expect(guide.default(gp)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404"); expect((await image.GET(new Request(`https://fermatmind.com/og/fun/${quiz.slug}`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
    } } finally { spy.mockRestore(); }
  });
  it("serves every bilingual native full guide, own metadata, three visible method paragraphs and stable canonical/sitemap identities", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/annoying-person-test`, ep = { params: Promise.resolve({ locale, slug: quiz.slug }) }, dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(ep)); const metadata = await entry.generateMetadata(ep);
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(dom.textContent).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        const method = dom.querySelector('[aria-labelledby="questionnaire-method"]'); expect(method?.querySelectorAll("p")).toHaveLength(3); expect(method?.querySelectorAll("h3")).toHaveLength(0); for (const s of quiz.guide.filter(s => methodIds.includes(s.id))) for (const t of s.paragraphs) expect(method?.textContent).toContain(t[locale]);
        for (const p of quiz.profiles) { const native = `${path}/results/${p.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, own = document.createElement("div"); own.innerHTML = renderToStaticMarkup(await guide.default(gp)); const gm = await guide.generateMetadata(gp);
          expect(own.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const t of s.paragraphs) expect(own.textContent).toContain(t[locale]); expect(gm.title).toBe(p.seo!.title[locale]); expect(gm.description).toBe(p.seo!.description[locale]); expect(gm.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(own.querySelector("[data-mini-friction-score]")).toBeNull();
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
