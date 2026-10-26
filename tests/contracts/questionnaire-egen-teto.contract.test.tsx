import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isDirectionalConfigurationValid, readQuestionnaireDraft, scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/egen-teto.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/egen-teto-reference.json");
const reference = JSON.parse(bytes.toString()) as {
  questions: Questionnaire["questions"];
  sourceRead: string;
  countWitnesses: { answers: QuestionnaireAnswers; counts: Record<string, number>; profileId: string }[];
};

describe("T076 original gender-neutral Egen-Teto first-move edition", () => {
  it("keeps eighteen concrete pairs, equal positions and three full bilingual readings with a disclosed source boundary", () => {
    expect(quiz.kind).toBe("directional"); expect(isDirectionalConfigurationValid(quiz)).toBe(true);
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.questions).toHaveLength(18);
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(18);
    expect(new Set(quiz.questions.flatMap(q => q.options.map(o => o.label.en))).size).toBe(36);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(reference.sourceRead).toContain("fourcodedresultpathsnotexecuted");
    expect(quiz.directions.map(d => d.id)).toEqual(["egen", "teto"]);
    expect(quiz.profiles.map(p => p.id)).toEqual(["egen", "teto", "tie"]);
    for (const direction of quiz.directions) {
      expect(direction.comparisons).toBe(18);
      for (const position of [0, 1]) expect(quiz.questions.filter(q => q.options[position].directionId === direction.id)).toHaveLength(9);
    }
    for (const profile of quiz.profiles) {
      expect(profile.sections).toHaveLength(9); expect(new Set(profile.sections.map(s => s.id)).size).toBe(9);
      expect(profile.sections.reduce((n, s) => n + s.paragraphs.map(t => t.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(650);
      for (const locale of ["en", "zh"] as const) { expect(profile.seo!.title[locale].length).toBeLessThanOrEqual(60); expect(profile.seo!.description[locale].length).toBeLessThanOrEqual(160); }
    }
    const walk = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      const v = value as Record<string, unknown>;
      if ("en" in v || "zh" in v) { expect(typeof v.en).toBe("string"); expect(v.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u); expect(v.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(v).forEach(walk);
    }; walk(quiz);
  });

  it("matches all nineteen independently specified count pairs and preserves equal counts without hidden tie breaking", () => {
    expect(reference.countWitnesses).toHaveLength(19); const reached = new Set<string>();
    for (const witness of reference.countWitnesses) {
      const result = scoreDirectionalQuestionnaire(quiz, witness.answers);
      if (result.status !== "complete") throw Error("Complete witness rejected");
      expect(result.counts).toEqual(witness.counts); expect(result.profileId).toBe(witness.profileId);
      expect(result.counts.egen + result.counts.teto).toBe(18); reached.add(result.profileId);
      for (const key of ["percentage", "hormones", "gender", "percentile", "compatibility", "ability"]) expect(result).not.toHaveProperty(key);
    }
    expect(reached).toEqual(new Set(["egen", "teto", "tie"]));
    for (const position of [0, 1]) {
      const answers = Object.fromEntries(quiz.questions.map(q => [q.id, q.options[position].id]));
      expect(scoreDirectionalQuestionnaire(quiz, answers)).toMatchObject({ status: "complete", counts: { egen: 9, teto: 9 }, profileId: "tie", leaders: ["egen", "teto"] });
    }
    const ten = reference.countWitnesses[10]; const changed = { ...ten.answers };
    const one = quiz.questions.find(q => q.options.find(o => o.id === changed[q.id])?.directionId === "egen")!;
    changed[one.id] = one.options.find(o => o.directionId === "teto")!.id;
    expect(scoreDirectionalQuestionnaire(quiz, changed)).toMatchObject({ counts: { egen: 9, teto: 9 }, profileId: "tie" });
    console.info("19reachable complete count pairs; not2^18individual executions or instrument validation.");
  });

  it("withholds partial counts, rejects invalid/configuration inputs and expires optional tab drafts", () => {
    const partial = { ET_01: "B" };
    expect(scoreDirectionalQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 1 });
    for (const value of [null, [], new Date(), { unknown: "A" }, { ET_01: "na" }, { ET_01: 1 }]) expect(scoreDirectionalQuestionnaire(quiz, value).status).toBe("invalid");
    const broken = structuredClone(quiz); broken.directions[0].comparisons = 17;
    expect(scoreDirectionalQuestionnaire(broken, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = { version: quiz.version, savedAt: 100000, answers: partial };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 100001)).toEqual(partial);
    for (const delta of [-1, 86400000]) expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 100000 + delta)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ ...draft, version: "old" }), 100001)).toBeNull();
  });

  it("describes the actual two-direction entry and retains the four-direction DISC entry", async () => {
    const { default: entry } = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    for (const locale of ["en", "zh"] as const) for (const [slug, count] of [["egen-teto", 2], ["disc", 4]] as const) {
      const root = document.createElement("div"); root.innerHTML = renderToStaticMarkup(await entry({ params: Promise.resolve({ locale, slug }) }));
      const copy = root.querySelector('[aria-labelledby="questionnaire-results"] > p')?.textContent;
      expect(copy).toContain(locale === "zh" ? `全部${count}个单项` : `all ${count} single directions`);
    }
  });

  it("publishes all eight full native language pages with individual SEO, stable links and no personal counts", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/egen-teto`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const rendered = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props), root = document.createElement("div"); root.innerHTML = rendered;
        expect(root.textContent).toContain(quiz.instructions![locale]); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.description).toBe(quiz.description[locale]);
        expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        expect(maps.some(e => e.loc === `https://fermatmind.com${path}`)).toBe(true);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const html = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          for (const section of profile.sections) { expect(dom.querySelector(`#report-${section.id} h2`)?.textContent).toBe(section.title[locale]); for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]); }
          expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/egen-teto/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/egen-teto/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(isMissingFunRoute(publicPath)).toBe(false);
          expect(dom.querySelector('[aria-label="Raw choice counts for this attempt"]')).toBeNull();
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
