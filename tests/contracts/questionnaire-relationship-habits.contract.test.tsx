import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RelationshipHabitsReport, RelationshipHabitsNextSteps } from "@/components/questionnaires/RelationshipHabitsReport";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { shouldHardStopPublicAnalyticsForUrl } from "@/lib/tracking/privacy";
import { shouldSuppressServerAnalyticsBootstrap, isNoindexAnalyticsSuppressedPath } from "@/lib/tracking/browserAnalyticsSuppression";
import { shouldAllowFirstPartyAnalyticsRuntime } from "@/lib/tracking/internalTraffic";
import { trackClientEvent, trackNetworkObservableFunnelEvent } from "@/lib/tracking/client";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/relationship-habits.json", "utf8")) as Questionnaire;
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (answers: unknown) => {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("facets" in result)) throw Error("Expected four independent frequency means");
  return result;
};

describe("Original relationship habits: own-side frequency without a type or partner judgement", () => {
  it("binds16 complete bilingual prompts, frequency anchors and four full guides to the declared method", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz); expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.questions).toHaveLength(16); expect(quiz.minimumRatedItems).toBe(3);
    expect(quiz.directions.map(d => d.id)).toEqual(["space-and-pauses", "fairness-tally", "talk-delay", "overextension"]);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.questions)).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const d of quiz.directions) expect(quiz.questions.filter(q => q.options[0].directionId === d.id)).toHaveLength(4);
    for (const q of quiz.questions) {
      expect(q.reverse).toBe(false); expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]);
      expect(q.options[2].label.en).toBe("Sometimes"); expect(q.options[5].id).toBe("na");
    }
    const inspect = (v: unknown): void => {
      if (!v || typeof v !== "object") return; const x = v as Record<string, unknown>;
      if ("en" in x || "zh" in x) { expect(x.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u); expect(x.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(x).forEach(inspect);
    };
    inspect(quiz);
    for (const p of quiz.profiles) {
      expect(p.directionIds).toEqual([p.id]); expect(p.sections).toHaveLength(8);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(400);
      for (const l of ["en", "zh"] as const) { expect(p.seo!.title[l].length).toBeLessThanOrEqual(60); expect(p.seo!.description[l].length).toBeLessThanOrEqual(160); }
    }
  });
  it("checks each0..4 coverage boundary, missing versus sometimes and independent means", () => {
    for (const d of quiz.directions) {
      const qs = quiz.questions.filter(q => q.options[0].directionId === d.id);
      for (let rated = 0; rated <= 4; rated++) {
        const a = all("na"); let sum = 0;
        for (let i = 0; i < rated; i++) { const value = i % 4 + 2; a[qs[i].id] = String(value); sum += value; }
        const r = complete(a); expect(r.facets[d.id]).toEqual({ sum, rated, total: 4, mean: rated >= 3 ? Math.round(sum / rated * 10) / 10 : null });
        for (const other of quiz.directions.filter(x => x.id !== d.id)) expect(r.facets[other.id]).toEqual({ sum: 0, rated: 0, total: 4, mean: null });
        expect(Object.keys(r).sort()).toEqual(["answered", "facets", "status"]);
      }
    }
    for (const value of ["1", "3", "5", "na"]) for (const part of Object.values(complete(all(value)).facets)) expect(part.mean).toBe(value === "na" ? null : Number(value));
    const a = all("na"); for (const [n, d] of quiz.directions.entries()) for (const q of quiz.questions.filter(q => q.options[0].directionId === d.id)) a[q.id] = String(n + 1);
    expect(Object.values(complete(a).facets).map(p => p.mean)).toEqual([1, 2, 3, 4]);
    const arithmetic = all("na"); for (const [n, q] of quiz.questions.filter(q => q.options[0].directionId === "space-and-pauses").slice(0, 3).entries()) arithmetic[q.id] = String([2, 3, 5][n]);
    expect(complete(arithmetic).facets["space-and-pauses"]).toEqual({ sum: 10, rated: 3, total: 4, mean: 3.3 });
  });
  it("withholds partial results, rejects invalid values and protects expiring version-bound optional drafts", () => {
    const a = all(); delete a.RH_16; expect(scoreQuestionnaire(quiz, a)).toEqual({ status: "incomplete", answered: 15 });
    for (const bad of [null, [], Object.create(all()), { ...all(), unknown: "3" }, { ...all(), RH_01: 3 }, { ...all(), RH_01: "0" }, { ...all(), RH_01: "6" }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    const broken = structuredClone(quiz); broken.questions[0].options[0].directionId = "unknown"; expect(scoreQuestionnaire(broken, all()).status).toBe("unavailable");
    const now = 1_800_000_000_000, draft = (version = quiz.version, savedAt = now) => JSON.stringify({ version, savedAt, answers: a });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual(a); expect(readQuestionnaireDraft(quiz, draft("old"), now)).toBeNull();
    expect(readQuestionnaireDraft(quiz, draft(quiz.version, now - 86400000), now)).toBeNull(); expect(readQuestionnaireDraft(quiz, draft(quiz.version, now + 1), now)).toBeNull();
  });
  it("renders all four full readings even for every-unscored answers, with an optional distinct conflict-process link", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["1", "3", "5", "na"]) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<><RelationshipHabitsReport quiz={quiz} result={complete(all(value))} locale={locale} /><RelationshipHabitsNextSteps locale={locale} /></>);
      expect(dom.querySelectorAll("[data-relationship-habits-part]")).toHaveLength(4); expect(dom.querySelectorAll("h4")).toHaveLength(32);
      for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.querySelector(`[data-relationship-habits-part="${p.id}"]`)?.textContent).toContain(t[locale]);
      for (const mean of dom.querySelectorAll("[data-relationship-habits-mean]")) expect(mean.textContent).toContain(value === "na" ? (locale === "zh" ? "资料不足" : "Insufficient information") : `${value}.0 / 5`);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.querySelectorAll('[role="meter"]')).toHaveLength(value === "na" ? 0 : 4);
      for (const meter of dom.querySelectorAll('[role="meter"]')) {
        expect(meter.getAttribute("aria-valuemin")).toBe("1"); expect(meter.getAttribute("aria-valuemax")).toBe("5");
        expect(meter.getAttribute("aria-valuenow")).toBe(value); expect(meter.getAttribute("aria-valuetext")).toContain(`${value}.0`);
      }
      expect(dom.textContent).not.toMatch(/battery|电量|剩余能量/); expect(dom.querySelector("[data-relationship-habits-next-steps] a")?.getAttribute("href")).toBe(`/${locale}/tests/explore/love-fight-style`);
    }
  });
  it("suppresses ordinary analytics on entries and public guides without changing their indexability", async () => {
    const paths = ["en", "zh"].flatMap(l => [`/${l}/tests/explore/${quiz.slug}`, ...quiz.profiles.map(p => `/${l}/tests/explore/${quiz.slug}/results/${p.id}`)]);
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
    const fetch = vi.fn().mockResolvedValue({ ok: true }), gtag = vi.fn(); vi.stubGlobal("fetch", fetch); vi.stubGlobal("gtag", gtag);
    window.localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "granted" }));
    try {
      for (const path of paths) {
        expect(shouldHardStopPublicAnalyticsForUrl(path)).toBe(true); expect(shouldSuppressServerAnalyticsBootstrap({ pathname: path })).toBe(true); expect(isNoindexAnalyticsSuppressedPath(path)).toBe(false);
        expect(shouldAllowFirstPartyAnalyticsRuntime({ analyticsEnabled: true, deploymentEnvironment: "production", hostname: "fermatmind.com", pathname: path }).allowed).toBe(false);
        const input = { path, eventName: "complete_test", anonymousId: "synthetic", payload: { scale_id: quiz.code, form_id: quiz.version } };
        await trackClientEvent(input); await trackNetworkObservableFunnelEvent(input);
      }
      expect(fetch).not.toHaveBeenCalled(); expect(gtag).not.toHaveBeenCalled();
      expect(shouldHardStopPublicAnalyticsForUrl("/en/tests/explore/relationship-habits-other")).toBe(false);
    } finally { vi.unstubAllGlobals(); window.localStorage.clear(); }
  });
  it("publishes ten bilingual native URLs with full public text, directory, canonical pairs and sitemap entries", async () => {
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
          expect(dom.querySelector("[data-relationship-habits-mean]")).toBeNull();
          expect(maps.filter(x => x.loc === `https://fermatmind.com${url}`)).toHaveLength(1);
        }
        expect(maps.filter(x => x.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
