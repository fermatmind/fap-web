import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isNakshatra27ConfigurationValid, NAKSHATRA_IDS, NAKSHATRA_INPUT_CONTRACT, classifyNakshatraLongitude, nakshatraPublicLinks } from "@/lib/questionnaires/nakshatra27";
import { calculateNakshatra } from "@/lib/questionnaires/nakshatra27Calculation";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { Nakshatra27Client } from "@/components/questionnaires/Nakshatra27Client";
import { Nakshatra27Report } from "@/components/questionnaires/Nakshatra27Report";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/nakshatra-spica-reference.json", "utf8")) as Questionnaire;
const digest = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const domOf = (html: string) => { const dom = document.createElement("div"); dom.innerHTML = html; return dom; };
describe("Known-time Nakshatra reference tool and27original full cultural readings", () => {
  it("binds the explicit input and reference contract,27complete bilingual guides and no question bank", () => {
    expect(isNakshatra27ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(digest(NAKSHATRA_INPUT_CONTRACT)).toBe(quiz.source.itemBankSha256); expect(digest(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.questions).toEqual([]); expect(quiz.directions).toEqual([]); expect(quiz.profiles.map(p => p.id)).toEqual(NAKSHATRA_IDS);
    expect(scoreQuestionnaire(quiz, {})).toEqual({ status: "unavailable", answered: 0 });
    const scenes = new Set<string>();
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(8);
      for (const s of p.sections.slice(1, 6)) scenes.add(s.paragraphs[0].en);
      const texts = p.sections.flatMap(s => s.paragraphs);
      expect(texts.map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(650);
      expect(texts.map(t => t.zh).join("").length).toBeGreaterThan(900);
      expect(texts.every(t => t.en.trim() && t.zh.trim())).toBe(true);
    }
    expect(scenes.size).toBe(135); expect(quiz.source.psychometricValidationCompleted).toBe(false);
  });
  it("fails closed on changed source identity, omitted guides, a fake item bank or incomplete bilingual content", () => {
    for (const alter of [
      (q: Questionnaire) => { q.source.scoringVersion = "lahiri"; },
      (q: Questionnaire) => { q.source.itemBankSha256 = "0".repeat(64); },
      (q: Questionnaire) => { q.source.resultContentSha256 = "0".repeat(64); },
      (q: Questionnaire) => { q.profiles.pop(); },
      (q: Questionnaire) => { q.questions = [{ id: "invented", prompt: { en: "Pick a trait", zh: "选特质" }, options: [] }]; },
      (q: Questionnaire) => { q.profiles[0].sections[0].paragraphs[0].zh = ""; },
      (q: Questionnaire) => { q.profiles[1].id = q.profiles[0].id; },
      (q: Questionnaire) => { q.guide.pop(); },
    ]) { const q = structuredClone(quiz); alter(q); expect(isNakshatra27ConfigurationValid(q)).toBe(false); }
    for (const q of [null, [], {}, new Date()]) expect(isNakshatra27ConfigurationValid(q)).toBe(false);
  });
  it("renders every matched full reading at all27edges without duplicate IDs or a forced certain birth star", () => {
    const result = calculateNakshatra({ date: "2000-01-01", time: "12:00", zone: "UTC", knownTime: true, placeConfirmed: true }, Date.parse("2026-10-30T00:00Z"));
    if (result.status !== "complete") throw new Error("Fixture calculation failed");
    for (const locale of ["en", "zh"] as const) for (let i = 0; i < 27; i++) {
      const reading = { ...result.reading, ...classifyNakshatraLongitude(i * (360 / 27))! }, dom = domOf(renderToStaticMarkup(<Nakshatra27Report quiz={quiz} reading={reading} locale={locale} />));
      expect(dom.querySelectorAll("[data-nakshatra-profile]")).toHaveLength(2); expect(dom.querySelectorAll("h4")).toHaveLength(16);
      for (const p of quiz.profiles.filter(p => reading.profileIds.includes(p.id as typeof reading.id))) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
      const ids = [...dom.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.querySelector("[data-nakshatra-boundary]")?.textContent).toContain(locale === "en" ? "not a calibrated confidence interval" : "不是经过校准的置信区间");
    }
  });
  it("locks every input before hydration, copies28fixed public URLs and suppresses both locale analytics paths", () => {
    for (const locale of ["en", "zh"] as const) {
      const dom = domOf(renderToStaticMarkup(<Nakshatra27Client quiz={quiz} locale={locale} />));
      expect(dom.querySelector("[data-nakshatra-client] fieldset[disabled]")).not.toBeNull();
      for (const input of dom.querySelectorAll("input, select, button")) expect(input.matches(":disabled")).toBe(true);
      expect(dom.querySelector("[data-nakshatra-report]")).toBeNull();
      const urls = nakshatraPublicLinks(quiz, locale).split("\n"); expect(urls).toHaveLength(28);
      expect(new Set(urls).size).toBe(28); for (const u of urls) { expect(new URL(u).origin).toBe("https://fermatmind.com"); expect(new URL(u).search).toBe(""); expect(isAnalyticsDisabledQuestionnaireUrl(u)).toBe(true); }
      expect(nakshatraPublicLinks(quiz, locale)).not.toMatch(/2000-01-01|12:00|Asia\/Kolkata|24\.\d+/);
    }
    expect(entertainmentActivityCatalog.find(q => q.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
    expect(renderToStaticMarkup(<Nakshatra27Client quiz={null} locale="en" />)).toContain("unavailable");
  });
  it("opens all56complete bilingual pages with matching metadata,WebPage schema,directory mode and sitemap entries", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const dom = domOf(renderToStaticMarkup(await entry.default(props))), meta = await entry.generateMetadata(props);
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(maps.filter(e => e.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
        expect(dom.querySelectorAll("#nakshatra-all-guides + p + ul a")).toHaveLength(27);
        for (const s of quiz.guide) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
        const directory = domOf(renderToStaticMarkup(<MoreTests locale={locale} />)), article = directory.querySelector(`a[href="${path}"]`)?.closest("article");
        expect(article?.textContent).toContain(locale === "en" ? "Known birth time & zone" : "已知出生时间与时区"); expect(article?.textContent).not.toContain("0 questions");
        for (const p of quiz.profiles) {
          const gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, pp = `${path}/results/${p.id}`;
          const page = domOf(renderToStaticMarkup(await guide.default(gp))), metadata = await guide.generateMetadata(gp);
          expect(page.querySelector("h1")?.textContent).toBe(p.title[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${pp}`);
          expect(maps.filter(e => e.loc === `https://fermatmind.com${pp}`)).toHaveLength(1);
          for (const s of p.sections) for (const t of s.paragraphs) expect(page.textContent).toContain(t[locale]);
          expect(page.querySelector("input,[data-nakshatra-report]")).toBeNull();
          const schemas = [...page.querySelectorAll('script[type="application/ld+json"]')].map(x => JSON.parse(x.textContent!));
          expect(schemas.some(s => s["@type"] === "WebPage")).toBe(true); expect(schemas.some(s => s["@type"] === "Article")).toBe(false);
          if (locale === "en") expect(page.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
