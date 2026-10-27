import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { isCtl41ConfigurationValid } from "@/lib/questionnaires/ctl41";
import { scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { QuestionnaireCtl41Report } from "@/components/questionnaires/QuestionnaireCtl41Report";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/capacity-to-love-test.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/capacity-to-love-test-source-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; parts: Questionnaire["directions"]; original2018reference: { items: { english: string; reverse: boolean }[] } };
const profileBytes = readFileSync("tests/fixtures/questionnaires/capacity-to-love-test-profiles-reference.json");
const methodIds = ["ctl-scoring", "ctl-complete", "ctl-edition"];
const reverse = new Set<number>([7, 13, 15, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]);
const baseline = () => Object.fromEntries(quiz.questions.map((q, i) => [q.id, String(reverse.has(i + 1) ? 4 + 1 - 2 : 2)]));
function keyed(n: number) { return Object.fromEntries(quiz.questions.map((q, i) => [q.id, String(reverse.has(i + 1) ? 4 + 1 - n : n)])); }
function complete(answers: Record<string, string>) {
  const r = scoreQuestionnaire(quiz, answers);
  if (r.status !== "complete" || !("ctl41" in r)) throw Error("Wrong T096 result kind");
  return r;
}
describe("T096 closed source projection and full public readings", () => {
  it("binds the fixed source item edition, bilingual prompts and all complete guides", () => {
    expect(isCtl41ConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toEqual(source.questions); expect(quiz.directions).toEqual(source.parts);
    expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString())); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex"));
    expect(quiz.questions).toHaveLength(41); expect(quiz.directions).toHaveLength(6); expect(quiz.profiles).toHaveLength(6);
    for (const [i, q] of quiz.questions.entries()) {
      expect(q.id).toBe(`CTL2018_${String(i + 1).padStart(2, "0")}`); expect(q.reverse).toBe(reverse.has(i + 1));
      expect(q.options.map(o => o.id)).toEqual(Array.from({ length: 4 }, (_, i) => String(i + 1))); expect(q.options.map(o => o.score)).toEqual(Array.from({ length: 4 }, (_, i) => i + 1)); expect(q.prompt.zh).toMatch(/\p{Script=Han}/u);
    }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(8); for (const s of p.sections) for (const t of s.paragraphs) { expect(t.en.trim()).not.toBe(""); expect(t.zh).toMatch(/\p{Script=Han}/u); } }
    for (const locale of ["en", "zh"] as const) { expect(new Set(quiz.profiles.map(p => p.seo!.title[locale])).size).toBe(6); expect(new Set(quiz.profiles.map(p => p.seo!.description[locale])).size).toBe(6); }
    expect(quiz.questions.map(q => q.prompt.en)).toEqual(source.original2018reference.items.map(q => q.english)); expect(quiz.questions.map(q => q.reverse)).toEqual(source.original2018reference.items.map(q => q.reverse)); expect(quiz.questions[0].options[1].label).toEqual({ en: "2", zh: "2" }); expect(quiz.questions[0].options[2].label).toEqual({ en: "3", zh: "3" });
  });
  it("recomputes all129reachable domain sums,164individual keys,128mixed answers and16PSPpairs", () => {
    const parts = [[1, 7], [8, 16], [17, 23], [24, 31], [32, 33], [34, 41]], base = baseline(); let sums = 0, keys = 0;
    function check(a: Record<string, string>) { const r = complete(a); for (let k = 0; k < 6; k++) { const [start, end] = parts[k]; let sum = 0; for (let n = start; n <= end; n++) { const raw = Number(a[`CTL2018_${String(n).padStart(2, "0")}`]); sum += (reverse.has(n) ? [4, 3, 2, 1] : [1, 2, 3, 4])[raw - 1]; } assert.deepEqual(r.ctl41[k], { id: quiz.directions[k].id, profileId: quiz.profiles[k].id, rawSum: sum, itemCount: end - start + 1, mean: sum / (end - start + 1) }); } expect(Object.keys(r).sort()).toEqual(["answered", "ctl41", "status"]); }
    for (const [start, end] of parts) { const count = end - start + 1; for (let target = count; target <= count * 4; target++) { const a = { ...base }; let rest = target - count; for (let n = start; n <= end; n++) { const add = Math.min(3, rest); rest -= add; const keyed = 1 + add; a[`CTL2018_${String(n).padStart(2, "0")}`] = String(reverse.has(n) ? 5 - keyed : keyed); } expect(rest).toBe(0); check(a); sums++; } }
    for (let n = 1; n <= 41; n++) for (let raw = 1; raw <= 4; raw++) { check({ ...base, [`CTL2018_${String(n).padStart(2, "0")}`]: String(raw) }); keys++; }
    let seed = 0x20181115; for (let t = 0; t < 128; t++) { const a: Record<string, string> = {}; for (const q of quiz.questions) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; a[q.id] = String((seed >>> 16) % 4 + 1); } check(a); }
    for (let a = 1; a <= 4; a++) for (let b = 1; b <= 4; b++) check({ ...base, CTL2018_32: String(a), CTL2018_33: String(b) }); expect(sums).toBe(129); expect(keys).toBe(164); console.info("T096129domain-sum witnesses+164singlekey+128mixed+16PSP pairs;not4^41joint execution or validation.");
  }, 30000);
  it("renders every full paragraph and exact sum/mean at minimum, maximum, middle and mixed responses", () => {
    const near = keyed(4); near[quiz.questions[0].id] = String(4 - 1);
    for (const locale of ["en", "zh"] as const) for (const answers of [keyed(1), baseline(), keyed(4), near]) {
      const r = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireCtl41Report quiz={quiz} result={r} locale={locale} />);
      expect(dom.querySelectorAll("[data-ctl41-part]")).toHaveLength(6); expect(dom.querySelectorAll("h4")).toHaveLength(48);
      for (const part of r.ctl41) { const line = dom.querySelector(`[data-ctl41-score="${part.id}"]`)?.textContent; expect(line).toContain(part.mean.toFixed(2)); expect(line).toContain(String(part.rawSum)); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
      const ids = [...dom.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("suppresses all incomplete personal scoring and preserves strict answer and draft admission", () => {
    for (let i = 0; i < quiz.questions.length; i++) { const a = baseline(); delete a[quiz.questions[i].id]; expect(scoreQuestionnaire(quiz, a)).toEqual({ status: "incomplete", answered: 41 - 1 }); }
    expect(scoreQuestionnaire(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "2" }, { [quiz.questions[0].id]: "na" }, { [quiz.questions[0].id]: 2 }, { ...baseline(), [quiz.questions[0].id]: "5" }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
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
      expect(isCtl41ConfigurationValid(bad)).toBe(false); expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 }); spy.mockResolvedValue(bad);
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
        const path = `/${locale}/tests/explore/capacity-to-love-test`, ep = { params: Promise.resolve({ locale, slug: quiz.slug }) }, dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(ep)); const metadata = await entry.generateMetadata(ep);
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(dom.textContent).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        const method = dom.querySelector('[aria-labelledby="questionnaire-method"]'); expect(method?.querySelectorAll("p")).toHaveLength(3); expect(method?.querySelectorAll("h3")).toHaveLength(0); for (const s of quiz.guide.filter(s => methodIds.includes(s.id))) for (const t of s.paragraphs) expect(method?.textContent).toContain(t[locale]); expect(dom.querySelectorAll("[data-ctl41-attribution]")).toHaveLength(1); expect(dom.querySelector("[data-ctl41-attribution]")?.textContent).toContain("CC BY 4.0"); expect(dom.querySelector("[data-ctl41-attribution]")?.closest("details")).toBeNull();
        for (const p of quiz.profiles) { const native = `${path}/results/${p.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, own = document.createElement("div"); own.innerHTML = renderToStaticMarkup(await guide.default(gp)); const gm = await guide.generateMetadata(gp);
          expect(own.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const t of s.paragraphs) expect(own.textContent).toContain(t[locale]); expect(gm.title).toBe(p.seo!.title[locale]); expect(gm.description).toBe(p.seo!.description[locale]); expect(gm.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(own.querySelector("[data-ctl41-score]")).toBeNull(); expect(own.querySelectorAll("[data-ctl41-attribution]")).toHaveLength(1); expect(own.querySelector("[data-ctl41-attribution]")?.textContent).toContain("Kapusta"); expect(own.querySelector("[data-ctl41-attribution]")?.textContent).toContain("CC BY 4.0");
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
