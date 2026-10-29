import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import data from "../../lib/questionnaires/data/distributed-work-choices.json";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { isDistributedWork24ConfigurationValid, recordDistributedWork24 } from "../../lib/questionnaires/distributedWork24";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "../../lib/questionnaires/scoring";
import { loadQuestionnaire } from "../../lib/questionnaires/loaders";
import { DistributedWorkReport, DistributedWorkNextSteps } from "../../components/questionnaires/DistributedWorkReport";
import { isAnalyticsDisabledQuestionnaireUrl, shouldHardStopPublicAnalyticsForUrl } from "../../lib/tracking/privacy";
import { entertainmentActivityCatalog } from "../../lib/entertainment/activityCatalog";
import { SITE_URL } from "../../lib/site";
import { appendFunSitemapEntries } from "../../lib/entertainment/sitemap";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const quiz = data as Questionnaire;
const answers = (value: string) => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (a: unknown) => {
  const r = recordDistributedWork24(quiz, a);
  expect(r.status).toBe("complete");
  if (r.status !== "complete") throw Error("Expected complete original record");
  return r.distributedWork;
};

describe("Original distributed work choices: balanced appearances, no score or integrity inference", () => {
  it("binds all24originalpairs and four full bilingual readings to their declared versions", () => {
    expect(isDistributedWork24ConfigurationValid(quiz)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.questions)).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    for (const d of quiz.directions) {
      for (const side of ["A", "B"]) expect(quiz.questions.filter(q => q.options.some(o => o.id === side && o.directionId === d.id))).toHaveLength(6);
      expect(quiz.questions.filter(q => q.options.some(o => o.directionId === d.id))).toHaveLength(12);
    }
    const pairingCounts = new Map<string, number>();
    for (const q of quiz.questions) {
      const key = q.options.slice(0, 2).map(o => o.directionId).sort().join("/");
      pairingCounts.set(key, (pairingCounts.get(key) ?? 0) + 1);
    }
    expect(pairingCounts.size).toBe(6); expect([...pairingCounts.values()]).toEqual(Array(6).fill(4));
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7);
      expect(p.sections.flatMap(s => s.paragraphs)).toHaveLength(14);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").match(/[A-Za-z]+(?:[’'-][A-Za-z]+)*/g)!.length).toBeGreaterThanOrEqual(900);
      expect(p.sections.flatMap(s => s.paragraphs).every(t => /[\u4e00-\u9fff]/.test(t.zh))).toBe(true);
    }
  });

  it("keeps entirely unscored attempts distinct from choosing the other action", () => {
    expect(complete(answers("skip")).map(({ selected, otherSelected, unscored, appearances }) => [selected, otherSelected, unscored, appearances]))
      .toEqual(Array(4).fill([0, 0, 12, 12]));
    for (const side of ["A", "B"]) expect(complete(answers(side)).map(({ selected, otherSelected, unscored }) => [selected, otherSelected, unscored]))
      .toEqual(Array(4).fill([6, 6, 0]));
  });

  it("counts a consistent theme choice without assigning a winner or lowering the other themes", () => {
    const a = Object.fromEntries(quiz.questions.map(q => [q.id, q.options.find(o => o.directionId === "handover")?.id ?? "B"]));
    expect(complete(a).map(({ selected, otherSelected, unscored }) => [selected, otherSelected, unscored]))
      .toEqual([[12, 0, 0], [4, 8, 0], [4, 8, 0], [4, 8, 0]]);
    const result = recordDistributedWork24(quiz, a);
    expect(Object.keys(result)).toEqual(["status", "answered", "distributedWork"]);
    for (const row of complete(a)) expect(Object.keys(row).sort()).toEqual(["appearances", "id", "otherSelected", "profileId", "selected", "unscored"].sort());
  });

  it("retains omitted opportunities in a mixed attempt without rescaling them into a score", () => {
    const a = answers("A"); for (const q of quiz.questions.slice(0, 6)) a[q.id] = "skip";
    expect(complete(a).map(({ selected, otherSelected, unscored, appearances }) => [selected, otherSelected, unscored, appearances]))
      .toEqual([[3, 6, 3, 12], [4, 5, 3, 12], [5, 4, 3, 12], [6, 3, 3, 12]]);
  });

  it("requires24explicit valid responses including skip and rejects unknown answer material", () => {
    const partial = answers("skip"); delete partial.DWC_24;
    expect(recordDistributedWork24(quiz, partial)).toEqual({ status: "incomplete", answered: 23 });
    for (const a of [null, [], { ...answers("A"), EXTRA: "A" }, { ...answers("A"), DWC_01: 0 }, { ...answers("A"), DWC_01: "unknown" }])
      expect(recordDistributedWork24(quiz, a).status).toBe("invalid");
  });

  it("fails closed on identity, topology, scoring and sparse or incomplete configuration", () => {
    const mutations: ((q: Questionnaire) => void)[] = [
      q => { q.source.formCode = "other"; }, q => { q.source.itemBankSha256 = "0".repeat(64); },
      q => { q.source.resultContentSha256 = "0".repeat(64); }, q => { q.minimumRatedItems = 1; },
      q => { q.questions[0].reverse = false; }, q => { q.questions[0].options[0].score = 1; },
      q => { q.questions[0].options[0].directionId = "blockers"; },
      q => { q.questions[0].options[2].label.en = "Lie detector"; },
      q => { q.questions[1].id = q.questions[0].id; }, q => { delete q.questions[0]; },
      q => { delete q.questions[0].options[0]; }, q => { delete q.directions[0]; },
      q => { delete q.profiles[0]; }, q => { delete q.profiles[0].sections[0]; },
      q => { delete q.profiles[0].sections[0].paragraphs[0]; },
      q => { q.references![0].url = "https://example.invalid/unsafe"; },
    ];
    for (const mutate of mutations) {
      const q = structuredClone(quiz); mutate(q);
      expect(isDistributedWork24ConfigurationValid(q)).toBe(false);
      expect(recordDistributedWork24(q, answers("A"))).toEqual({ status: "unavailable", answered: 0 });
    }
  });

  it("publishes all ten native bilingual pages and complete public bodies before answering", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz);
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(scoreQuestionnaire(quiz, answers("skip"))).toEqual(recordDistributedWork24(quiz, answers("skip")));
    const entry = await import("../../app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("../../app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const sitemap = appendFunSitemapEntries([]).map(e => e.loc);
    for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/${quiz.slug}`, params = { params: Promise.resolve({ locale, slug: quiz.slug }) };
      expect((await entry.generateMetadata(params)).alternates?.canonical).toBe(`${SITE_URL}${path}`);
      expect(sitemap).toContain(`https://fermatmind.com${path}`);
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(params));
      expect(dom.querySelectorAll("[data-distributed-full-guide]")).toHaveLength(4);
      expect(dom.querySelectorAll("[data-distributed-full-guide] h3")).toHaveLength(28);
      expect(dom.querySelectorAll("[data-distributed-work-result]")).toHaveLength(0);
      for (const p of quiz.profiles) {
        const gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) };
        const url = `https://fermatmind.com${path}/results/${p.id}`;
        expect((await guide.generateMetadata(gp)).alternates?.canonical).toBe(`${SITE_URL}${path}/results/${p.id}`); expect(sitemap).toContain(url);
        const html = document.createElement("div"); html.innerHTML = renderToStaticMarkup(await guide.default(gp));
        for (const s of p.sections) for (const t of s.paragraphs) {
          expect(dom.querySelector(`[data-distributed-full-guide="${p.id}"]`)?.textContent).toContain(t[locale]);
          expect(html.textContent).toContain(t[locale]);
        }
      }
      const ids = [...dom.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("shows all four raw records for mixed or entirely unscored choices without an assigned outcome", () => {
    for (const locale of ["en", "zh"] as const) for (const a of [answers("A"), answers("skip")]) {
      const result = recordDistributedWork24(quiz, a); if (result.status !== "complete") throw Error("Expected complete");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<DistributedWorkReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-distributed-work-part]")).toHaveLength(4);
      expect(dom.querySelectorAll("[data-distributed-count]")).toHaveLength(12);
      expect(dom.querySelectorAll("[data-distributed-entirely-unscored]")).toHaveLength(a.DWC_01 === "skip" ? 4 : 0);
      for (const p of result.distributedWork) {
        expect(dom.querySelector(`[data-distributed-count="${p.id}-selected"]`)?.textContent).toBe(`${p.selected} / 12`);
        expect(dom.querySelector(`[data-distributed-count="${p.id}-other"]`)?.textContent).toBe(`${p.otherSelected} / 12`);
        expect(dom.querySelector(`[data-distributed-count="${p.id}-unscored"]`)?.textContent).toBe(`${p.unscored} / 12`);
      }
    }
    const next = renderToStaticMarkup(<DistributedWorkNextSteps locale="en" />);
    expect(next).toContain("/en/tests#more-tests"); expect(next).not.toContain("mbti");
  });

  it("keeps malformed sources out of real entry, guide and OG consumers", async () => {
    const loader = await import("../../lib/questionnaires/loaders"), entry = await import("../../app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("../../app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), og = await import("../../app/og/fun/[slug]/route");
    const spy = vi.spyOn(loader, "loadQuestionnaire");
    try {
      for (const mutate of [
        (q: Questionnaire) => { delete q.questions[0].options[0]; },
        (q: Questionnaire) => { delete q.profiles[0].sections[0].paragraphs[0]; },
        (q: Questionnaire) => { q.source.formCode = "unknown"; },
      ]) {
        const q = structuredClone(quiz); mutate(q); spy.mockResolvedValue(q);
        const ep = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, gp = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: quiz.profiles[0].id }) };
        expect((await entry.generateMetadata(ep)).robots).toEqual({ index: false, follow: false });
        expect((await guide.generateMetadata(gp)).robots).toEqual({ index: false, follow: false });
        await expect(entry.default(ep)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        await expect(guide.default(gp)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        expect((await og.GET(new Request(`https://fermatmind.com/og/fun/${quiz.slug}`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
      }
    } finally { spy.mockRestore(); }
  });

  it("uses default-memory progress, explicit opt-in anonymous activity and disabled ordinary analytics", () => {
    for (const locale of ["en", "zh"]) for (const suffix of ["", "/results/handover-reading"]) {
      const url = `https://fermatmind.com/${locale}/tests/explore/${quiz.slug}${suffix}`;
      expect(isAnalyticsDisabledQuestionnaireUrl(url)).toBe(true); expect(shouldHardStopPublicAnalyticsForUrl(url)).toBe(true);
    }
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
    const saved = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { DWC_01: "A", DWC_02: "skip" } });
    expect(readQuestionnaireDraft(quiz, saved, 100)).toEqual({ DWC_01: "A", DWC_02: "skip" });
    expect(readQuestionnaireDraft(quiz, saved, 100 + 86400001)).toBeNull();
  });
});
