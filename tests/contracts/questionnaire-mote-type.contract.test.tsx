import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { isInteractionPairsConfigurationValid } from "@/lib/questionnaires/interactionPairs";
import { scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { QuestionnaireInteractionPairsReport } from "@/components/questionnaires/QuestionnaireInteractionPairsReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/mote-type.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/mote-type-source-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; parts: { id: string; poleIds: string[]; profileId: string }[] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/mote-type-profiles-reference.json");
function answer(counts = [6, 6, 6, 6]) {
  return Object.fromEntries(quiz.questions.map((q, index) => [q.id, q.options.find(o => o.directionId === source.parts[Math.floor(index / 6)].poleIds[index % 6 < counts[Math.floor(index / 6)] ? 0 : 1])!.id]));
}
describe("T099 original Mini interaction-choice reuse", () => {
  it("binds24bilingual paired choices and four complete guides to the reviewed source", () => {
    expect(isInteractionPairsConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toEqual(source.questions);
    expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex"));
    expect(quiz.code).toBe("PERSONALITY_ATTRACTION"); expect(quiz.source.formCode).toBe("personality_attraction_paired_choice_24");
    expect(quiz.source.itemBankVersion).toBe("0.2.0-preview"); expect(quiz.source.scoringVersion).toBe("0.2.0-preview");
    expect(quiz.questions).toHaveLength(24); expect(quiz.directions).toHaveLength(8); expect(quiz.profiles).toHaveLength(4);
    for (const p of quiz.profiles) expect(p.sections).toHaveLength(6);
  });
  it("recomputes256partbinaryvectors and all2401joint count witnesses without a total or combined type", () => {
    let vectors = 0;
    for (let part = 0; part < 4; part++) {
      const histogram = [0, 0, 0, 0, 0, 0, 0];
      for (let mask = 0; mask < 64; mask++) {
        const answers = answer(), group = source.parts[part]; let left = 0;
        for (let i = 0; i < 6; i++) { const q = quiz.questions[part * 6 + i], pole = group.poleIds[(mask & (1 << i)) ? 1 : 0]; answers[q.id] = q.options.find(o => o.directionId === pole)!.id; if (pole === group.poleIds[0]) left++; }
        const r = scoreQuestionnaire(quiz, answers); if (r.status !== "complete" || !("interactionPairs" in r)) throw Error("Valid pair rejected");
        assert.deepEqual(r.interactionPairs[part].counts, { [group.poleIds[0]]: left, [group.poleIds[1]]: 6 - left }); histogram[left]++; vectors++;
      }
      expect(histogram).toEqual([1, 6, 15, 20, 15, 6, 1]);
    }
    let witnesses = 0;
    for (let a = 0; a <= 6; a++) for (let b = 0; b <= 6; b++) for (let c = 0; c <= 6; c++) for (let d = 0; d <= 6; d++) {
      const counts = [a, b, c, d], result = scoreQuestionnaire(quiz, answer(counts));
      assert.deepEqual(result, { status: "complete", answered: 24, interactionPairs: source.parts.map((p, i) => ({ id: p.id, counts: { [p.poleIds[0]]: counts[i], [p.poleIds[1]]: 6 - counts[i] }, leaders: (counts[i] === 3 ? [...p.poleIds] : [p.poleIds[counts[i] > 3 ? 0 : 1]]).sort(), profileId: p.profileId })) }); witnesses++;
    }
    expect(vectors).toBe(256); expect(witnesses).toBe(2401);
  });
  it("renders every paragraph of all four guides at every count and tie in both languages", () => {
    for (const locale of ["en", "zh"] as const) for (let count = 0; count <= 6; count++) {
      const r = scoreQuestionnaire(quiz, answer([count, count, count, count])); if (r.status !== "complete" || !("interactionPairs" in r)) throw Error("Valid report rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireInteractionPairsReport quiz={quiz} result={r} locale={locale} />);
      expect(dom.querySelectorAll("[data-interaction-pair]")).toHaveLength(4); expect(dom.querySelectorAll("[data-interaction-count]")).toHaveLength(8);
      expect(dom.querySelectorAll('[data-interaction-tie="true"]')).toHaveLength(count === 3 ? 4 : 0);
      for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), el => el.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("suppresses every incomplete interpretation and rejects malformed inputs or changed pole mappings", () => {
    for (let part = 0; part < 4; part++) for (let mask = 1; mask < 64; mask++) {
      const answers = answer(); let missing = 0; for (let i = 0; i < 6; i++) if (mask & (1 << i)) { delete answers[quiz.questions[part * 6 + i].id]; missing++; }
      expect(scoreQuestionnaire(quiz, answers)).toEqual({ status: "incomplete", answered: 24 - missing });
    }
    expect(scoreQuestionnaire(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { ATTRACTION_PC_001: "na" }, { ATTRACTION_PC_001: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].options.reverse(); expect(scoreQuestionnaire(bad, answer())).toEqual({ status: "unavailable", answered: 0 });
    const wrongForm = structuredClone(quiz); wrongForm.source.formCode = "other"; expect(scoreQuestionnaire(wrongForm, {})).toEqual({ status: "unavailable", answered: 0 });
  });
  it("rejects sparse, undefined and null configuration slots in scorer and real public consumers", async () => {
    const loader = await import("@/lib/questionnaires/loaders");
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const image = await import("@/app/og/fun/[slug]/route");
    const spy = vi.spyOn(loader, "loadQuestionnaire");
    try {
      for (const field of ["questions", "directions", "profiles", "options", "sections", "paragraphs", "directionIds"] as const) for (const mode of ["hole", "undefined", "null"] as const) {
        const bad = structuredClone(quiz);
        const array: unknown[] = field === "options" ? bad.questions[0].options : field === "sections" ? bad.profiles[0].sections : field === "paragraphs" ? bad.profiles[0].sections[0].paragraphs : field === "directionIds" ? bad.profiles[0].directionIds : bad[field];
        if (mode === "hole") delete array[0]; else array[0] = mode === "null" ? null : undefined;
        expect(isInteractionPairsConfigurationValid(bad)).toBe(false); expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
        spy.mockResolvedValue(bad);
        const ep = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, gp = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: quiz.profiles[0].id }) };
        expect((await entry.generateMetadata(ep)).robots).toEqual({ index: false, follow: false });
        expect((await guide.generateMetadata(gp)).robots).toEqual({ index: false, follow: false });
        await expect(entry.default(ep)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        await expect(guide.default(gp)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        expect((await image.GET(new Request(`https://fermatmind.com/og/fun/${quiz.slug}`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
      }
    } finally { spy.mockRestore(); }
  });
  it("restores only valid versioned drafts and expires them after24hours", () => {
    const saved = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { ATTRACTION_PC_001: "B" } });
    expect(readQuestionnaireDraft(quiz, saved, 200)).toEqual({ ATTRACTION_PC_001: "B" }); expect(readQuestionnaireDraft(quiz, saved, 86400100)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: "other", savedAt: 100, answers: { ATTRACTION_PC_001: "B" } }), 200)).toBeNull();
  });
  it("publishes ten native pages with independent metadata, complete public body, canonical pairs and sitemap entries", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/mote-type`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
      expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); const entryDom = document.createElement("div"); entryDom.innerHTML = html; const method = entryDom.querySelector('[aria-labelledby="questionnaire-method"]'); expect(method?.querySelectorAll("p")).toHaveLength(3); for (const section of quiz.guide.filter(s => ["original", "counting", "complete"].includes(s.id))) for (const paragraph of section.paragraphs) expect(method?.textContent).toContain(paragraph[locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      for (const p of quiz.profiles) {
        const native = `${path}/results/${p.id}`, ownProps = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(ownProps)); const ownMetadata = await guide.generateMetadata(ownProps);
        expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
        expect(ownMetadata.title).toBe(p.seo!.title[locale]); expect(ownMetadata.description).toBe(p.seo!.description[locale]); expect(ownMetadata.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(dom.querySelector("[data-interaction-count]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
