import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QuestionnaireChakraReport } from "@/components/questionnaires/QuestionnaireChakraReport";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/chakra.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/chakra-reference.json");
const reference = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"] };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(reference.questions.map(q => [q.id, value]));

describe("T175 original seven-theme chakra symbolic self-reflection", () => {
  it("preserves28original bilingual actions,7reversals,separate groups and7complete dedicated guides", () => {
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(28);
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.profiles).toEqual(reference.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.minimumRatedItems).toBe(3);
    expect(quiz.directions.map(d => d.id)).toEqual(["root", "sacral", "solar-plexus", "heart", "throat", "third-eye", "crown"]);
    expect(quiz.questions.filter(q => q.reverse)).toHaveLength(7); expect(quiz.profiles).toHaveLength(7);
    for (const direction of quiz.directions) {
      const items = quiz.questions.filter(q => q.options[0].directionId === direction.id);
      expect(items).toHaveLength(4); expect(items.map(q => q.reverse)).toEqual([false, false, false, true]);
      const profile = quiz.profiles.find(p => p.id === direction.id)!; expect(profile.directionIds).toEqual([direction.id]);
      expect(profile.sections).toHaveLength(6); expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60);
      expect(new Set(profile.sections.map(s => s.id)).size).toBe(6);
    }
    const visit = (value: unknown): void => {
      if (!value || typeof value !== "object") return; const obj = value as Record<string, unknown>;
      if ("en" in obj || "zh" in obj) {
        expect(obj.en).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u);
        expect(String(obj.en).trim()).not.toBe(""); expect(obj.zh).toMatch(/\p{Script=Han}/u);
      } else Object.values(obj).forEach(visit);
    }; visit(quiz);
    for (const file of readdirSync("lib/questionnaires/data").filter(file => file.endsWith(".json") && file !== "chakra.json")) {
      const other = JSON.parse(readFileSync(`lib/questionnaires/data/${file}`, "utf8")) as Questionnaire;
      const prompts = new Set(other.questions.flatMap(q => Object.values(q.prompt)));
      for (const question of quiz.questions) for (const text of Object.values(question.prompt)) expect(prompts.has(text), file).toBe(false);
    }
  });

  it("matches315 independent rated/sum states including everyreverse/missingboundary without an energytotal", () => {
    let checked = 0;
    for (const direction of quiz.directions) {
      const items = reference.questions.filter(q => q.options[0].directionId === direction.id);
      let states = new Map<string, string[]>([["0,0", []]]);
      for (const question of items) {
        const next = new Map<string, string[]>();
        for (const [key, witness] of states) {
          const [rated, sum] = key.split(",").map(Number);
          for (const option of question.options) {
            const raw = option.id === "na" ? null : Number(option.id);
            const keyed = raw === null ? 0 : question.reverse ? 6 - raw : raw;
            next.set(`${rated + (raw === null ? 0 : 1)},${sum + keyed}`, [...witness, option.id]);
          }
        } states = next;
      }
      expect(states.size).toBe(45);
      for (const [key, witness] of states) {
        const [rated, sum] = key.split(",").map(Number), answers = all("na");
        for (const [i, question] of items.entries()) answers[question.id] = witness[i];
        const result = scoreQuestionnaire(quiz, answers);
        if (result.status !== "complete" || !("facets" in result)) throw new Error("Source facet witness rejected");
        expect(result.facets[direction.id]).toEqual({ rated, sum, total: 4, mean: rated >= 3 ? Math.round(sum / rated * 10) / 10 : null });
        for (const other of quiz.directions.filter(d => d.id !== direction.id)) expect(result.facets[other.id]).toEqual({ rated: 0, sum: 0, total: 4, mean: null });
        for (const field of ["total", "rank", "dominant", "energy", "balance", "percentile", "profileId"]) expect(result).not.toHaveProperty(field);
        checked++;
      }
    }
    expect(checked).toBe(315);
    console.info("Chakra:315 independent group rated/sum witnesses; not6^28joint attempts or psychometric validation.");
  });

  it("shows every full guide and explicit insufficient states in both languages, with a reproducible worked example", () => {
    for (const locale of ["en", "zh"] as const) for (const mode of ["all", "na", "partial", "example"]) {
      const answers = all(mode === "na" ? "na" : "3");
      if (mode === "partial") { answers.CHAKRA_ROOT_01 = "na"; answers.CHAKRA_ROOT_02 = "na"; }
      if (mode === "example") ["2", "4", "5", "2"].forEach((v, i) => answers[`CHAKRA_ROOT_0${i + 1}`] = v);
      const result = scoreQuestionnaire(quiz, answers);
      if (result.status !== "complete" || !("facets" in result)) throw new Error("Complete source witness rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireChakraReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-chakra-group]")).toHaveLength(7); expect(dom.querySelectorAll("[data-chakra-guide]")).toHaveLength(7); expect(dom.querySelectorAll("h4")).toHaveLength(42);
      expect(dom.querySelectorAll("[data-chakra-insufficient]")).toHaveLength(mode === "na" ? 7 : mode === "partial" ? 1 : 0);
      for (const profile of quiz.profiles) for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      const root = dom.querySelector('[data-chakra-group="root"]')!;
      if (mode === "example") { expect(root.querySelector("[data-chakra-sum]")?.textContent).toBe("15"); expect(root.querySelector("[data-chakra-mean]")?.textContent).toBe("3.8 / 5"); }
      if (mode === "partial") { expect(root.querySelector("[data-chakra-rated]")?.textContent).toBe("2 / 4"); expect(root.querySelector("[data-chakra-mean]")?.textContent).toBe(locale === "en" ? "Insufficient information" : "资料不足"); }
      for (const group of dom.querySelectorAll("dl > div")) { expect(group.querySelector("dt")).not.toBeNull(); expect(group.querySelector("dd")).not.toBeNull(); }
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.querySelector("[data-facet-score], [data-social-total], [data-archetype-count]")).toBeNull();
      expect(dom.textContent).toContain(locale === "en" ? "not an energy reading" : "不是能量测量");
    }
  });

  it("rejects invalid and missing answers, preserves valid partialdrafts and failsclosed on malformedconfiguration", () => {
    const partial = all(); delete partial.CHAKRA_ROOT_01;
    expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 27 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "3" }, { CHAKRA_ROOT_01: "0" }, { CHAKRA_ROOT_01: "6" }, { CHAKRA_ROOT_01: 3 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].options[0].score = 3;
    expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const raw = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { CHAKRA_ROOT_01: "5" } });
    expect(readQuestionnaireDraft(quiz, raw, 200)).toEqual({ CHAKRA_ROOT_01: "5" }); expect(readQuestionnaireDraft(quiz, raw, 86400100)).toBeNull();
  });

  it("publishes16complete native language pages with stable metadata,source scope,hub and sitemap links", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/chakra`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
      expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]);
      expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, guideProps = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, rendered = renderToStaticMarkup(await guide.default(guideProps)), meta = await guide.generateMetadata(guideProps), dom = document.createElement("div"); dom.innerHTML = rendered;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
        expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/chakra/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/chakra/results/${profile.id}` });
        expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-chakra-mean]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
