import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { isWrittenCoordinationConfigurationValid, isWrittenCoordinationGridValid, readWrittenCoordinationClock, scoreWrittenCoordinationModule, writtenCoordinationDistance, type WrittenCoordinationQuiz } from "@/lib/questionnaires/writtenCoordination";
import { scoreDataEntryRound } from "@/lib/questionnaires/dataEntry";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { isAnalyticsDisabledQuestionnaireUrl, shouldHardStopPublicAnalyticsForUrl } from "@/lib/tracking/privacy";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/written-coordination-practice.json", "utf8")) as WrittenCoordinationQuiz;
const questions = (id: string) => quiz.questions.filter(q => q.options[0].directionId === id);
const complete = (id: string, answers: Record<string, string>, mode = "study", reason = "finished", elapsedMs = 0, studyElapsedMs = 0) => {
  const result = scoreWrittenCoordinationModule(quiz, id, { answers, mode, reason, elapsedMs, studyElapsedMs });
  if (result.status !== "complete") throw new Error("Expected a separate module record");
  return result.result;
};

describe("Original written coordination: six separate practices, no overall or qualification", () => {
  it("binds32 fictional entry cards,30 original questions and6complete bilingual guides", () => {
    expect(isWrittenCoordinationConfigurationValid(quiz)).toBe(true);
    expect(quiz.coordination.entry.records).toHaveLength(32); expect(quiz.questions).toHaveLength(30); expect(quiz.profiles).toHaveLength(6);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(JSON.stringify({ coordination: quiz.coordination, questions: quiz.questions })).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.sections.flatMap(s => s.paragraphs.map(p => p.en)).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(700);
      expect(p.sections.every(s => s.paragraphs.every(p => /\p{Script=Han}/u.test(p.zh) && !/\p{Script=Han}/u.test(p.en)))).toBe(true);
      expect(p.seo!.title.en.length).toBeLessThanOrEqual(60); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);
    }
    const correctLabels = (id: string) => questions(id).map(q => q.options.find(o => o.id === q.correctOptionId)!.label.en);
    expect(correctLabels("cross-reference")).toEqual(["GROUP-14", "GROUP-15", "GROUP-20", "GROUP-25", "GROUP-30", "GROUP-31"]);
    expect(correctLabels("memory")).toEqual(["ALDER HALL", "10:35", "BLUE CASE", "ROOM C7", "QX-417", "WAITING FOR CHECK"]);
    expect(correctLabels("priority")).toEqual(["B", "C", "D", "B", "A", "C"]);
    expect(correctLabels("map")).toEqual(["4", "3", "3", "NORTH", "B1", "D3"]);
    for (const label of correctLabels("summary")) expect(label).toMatch(/check requested, completion not stated\.$/);
  });
  it("rejects broken maps and independently verifies shortest paths against all-pairs distances", () => {
    const grid = quiz.coordination.grid, ids = Object.keys(grid.edges), distances = new Map<string, number>();
    for (const a of ids) for (const b of ids) distances.set(`${a},${b}`, a === b ? 0 : grid.edges[a].includes(b) ? 1 : 1000);
    for (const k of ids) for (const a of ids) for (const b of ids) distances.set(`${a},${b}`, Math.min(distances.get(`${a},${b}`)!, distances.get(`${a},${k}`)! + distances.get(`${k},${b}`)!));
    for (const a of ids) for (const b of ids) expect(writtenCoordinationDistance(grid, a, b)).toBe(distances.get(`${a},${b}`));
    expect(writtenCoordinationDistance(grid, "B2", "B3")).toBe(3); expect(writtenCoordinationDistance(grid, "C4", "D4")).toBe(3);
    expect(writtenCoordinationDistance(grid, "A1", "B1")).toBe(1); expect(writtenCoordinationDistance(grid, "unknown", "A1")).toBeNull();
    const changed = structuredClone(grid); changed.edges.B2.push("B3"); expect(isWrittenCoordinationGridValid(changed)).toBe(false);
    const oneWay = structuredClone(grid); oneWay.edges.A1.pop(); expect(isWrittenCoordinationGridValid(oneWay)).toBe(false);
    const hole = structuredClone(grid); delete hole.blockedEdges[0]; expect(isWrittenCoordinationGridValid(hole)).toBe(false);
  });
  it("keeps correct, wrong and unanswered distinct in each six-item module without a total", () => {
    for (const section of quiz.coordination.sections) {
      const qs = questions(section.id), answers = { [qs[0].id]: qs[0].correctOptionId!, [qs[1].id]: qs[1].options.find(o => o.id !== qs[1].correctOptionId)!.id, [qs[2].id]: "skip" };
      const r = complete(section.id, answers);
      expect(r).toMatchObject({ correct: 1, wrong: 1, unanswered: 4, total: 6, mode: "study" });
      expect(Object.keys(r).sort()).toEqual(["correct", "elapsedMs", "id", "items", "mode", "reason", "studyElapsedMs", "total", "unanswered", "wrong"]);
      expect(r.items.every(item => Object.keys(item).sort().join(",") === "id,outcome")).toBe(true);
      expect(complete(section.id, {})).toMatchObject({ correct: 0, wrong: 0, unanswered: 6 });
      const all = Object.fromEntries(qs.map(q => [q.id, q.correctOptionId!])); expect(complete(section.id, all).correct).toBe(6);
      expect(scoreWrittenCoordinationModule(quiz, section.id, { answers: { foreign: "A" }, mode: "study", reason: "finished", elapsedMs: 0, studyElapsedMs: 0 }).status).toBe("invalid");
    }
  });
  it("requires full timed exposure for memory and coherent closure intervals, with deadline checked first", () => {
    const attempt = { answers: {}, mode: "timed", reason: "finished", elapsedMs: 100, studyElapsedMs: 14999 };
    expect(scoreWrittenCoordinationModule(quiz, "memory", attempt).status).toBe("invalid");
    expect(scoreWrittenCoordinationModule(quiz, "memory", { ...attempt, studyElapsedMs: 15000 }).status).toBe("complete");
    expect(scoreWrittenCoordinationModule(quiz, "memory", { ...attempt, studyElapsedMs: 15000, elapsedMs: 120000 }).status).toBe("invalid");
    expect(scoreWrittenCoordinationModule(quiz, "memory", { ...attempt, studyElapsedMs: 15000, elapsedMs: 120000, reason: "expired" }).status).toBe("complete");
    expect(scoreWrittenCoordinationModule(quiz, "priority", { ...attempt, studyElapsedMs: 15000 }).status).toBe("invalid");
    expect(scoreWrittenCoordinationModule(quiz, "priority", { ...attempt, mode: "study", studyElapsedMs: 0 }).status).toBe("invalid");
    const start = { wall: 1000, monotonic: 100 };
    expect(readWrittenCoordinationClock(start, { wall: 16000, monotonic: 15100 }, 15)).toMatchObject({ status: "expired", remainingSeconds: 0 });
    expect(readWrittenCoordinationClock(start, { wall: 15999, monotonic: 15099 }, 15)).toMatchObject({ status: "running", remainingSeconds: 1 });
    expect(readWrittenCoordinationClock(start, { wall: 16000, monotonic: 12000 }, 15)).toEqual({ status: "invalid" });
  });
  it("uses exact final-field entry units, real60-second admission and unavailable accuracy for no attempts", () => {
    const round = quiz.coordination.entry, row = round.records[0], values = [...row.values]; values[0] = values[0].slice(1);
    const r = scoreDataEntryRound(round, [{ recordId: row.id, values }], 60000);
    expect(r.status).toBe("complete"); if (r.status !== "complete") return;
    expect(r).toMatchObject({ attemptedRecords: 1, consideredFields: 4, exactFields: 3, exactRecords: 0, fieldAccuracy: 75 });
    expect(r.characterKph).toBe(r.enteredCharacters * 60); expect(r.exactFieldCharacterKph).toBe(r.exactFieldCharacters * 60);
    expect(scoreDataEntryRound(round, [], 60000)).toMatchObject({ status: "complete", fieldAccuracy: null, attemptedRecords: 0 });
    expect(scoreDataEntryRound(round, [], 59999)).toEqual({ status: "incomplete" });
  });
  it("fails closed on sparse or incomplete configuration instead of serving partial content", () => {
    for (const mutate of [
      (q: WrittenCoordinationQuiz) => { delete q.questions[0]; },
      (q: WrittenCoordinationQuiz) => { delete q.coordination.entry.records[0]; },
      (q: WrittenCoordinationQuiz) => { q.questions[0].correctOptionId = "unknown"; },
      (q: WrittenCoordinationQuiz) => { q.questions[0].options[0].directionId = "memory"; },
      (q: WrittenCoordinationQuiz) => { q.profiles[0].sections[0].paragraphs.pop(); },
      (q: WrittenCoordinationQuiz) => { q.coordination.sections[0].timeCapMs = 1; },
      (q: WrittenCoordinationQuiz) => { q.source.scoringVersion = "unknown"; },
    ]) {
      const q = structuredClone(quiz); mutate(q); expect(isWrittenCoordinationConfigurationValid(q)).toBe(false);
      expect(scoreWrittenCoordinationModule(q, "map", {})).toEqual({ status: "unavailable" });
    }
  });
  it("uses a dedicated memory-only caller and keeps every public path outside ordinary analytics", () => {
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(scoreQuestionnaire(quiz, {})).toEqual({ status: "unavailable", answered: 0 });
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: {} }), 200)).toBeNull();
    for (const path of ["components/questionnaires/WrittenCoordinationClient.tsx", "components/questionnaires/WrittenCoordinationEntry.tsx"]) {
      const source = readFileSync(path, "utf8");
      expect(source).not.toMatch(/sessionStorage|localStorage|fetch\(|useEntertainmentMetrics|recordEntertainmentActivity/);
    }
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...quiz.profiles.map(p => `/results/${p.id}`)]) {
      const url = `https://fermatmind.com/${locale}/tests/explore/${quiz.slug}${suffix}`;
      expect(isAnalyticsDisabledQuestionnaireUrl(url)).toBe(true); expect(shouldHardStopPublicAnalyticsForUrl(url)).toBe(true);
    }
    expect(isAnalyticsDisabledQuestionnaireUrl(`/en/tests/explore/${quiz.slug}-another-tool`)).toBe(false);
    expect(entertainmentActivityCatalog.find(q => q.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
  });
  it("publishes14 bilingual pages with complete public readings, declared conditions and canonical discovery", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      const loader = await import("@/lib/questionnaires/loaders"); expect(await loader.loadQuestionnaire(quiz.slug)).toEqual(quiz);
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
      const maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.instructions![locale]);
        expect(dom.querySelectorAll("[data-written-full-guide]")).toHaveLength(6); expect(dom.querySelectorAll("[data-written-unattempted]")).toHaveLength(6);
        expect(dom.querySelectorAll("[data-written-edge]")).toHaveLength(38); expect(dom.querySelectorAll("[data-written-node]")).toHaveLength(25);
        expect((await entry.generateMetadata(props)).alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        expect(maps.filter(item => item.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
        for (const p of quiz.profiles) {
          const inline = dom.querySelector(`[data-written-full-guide="${p.id}"]`)!;
          expect(inline.querySelectorAll("h3")).toHaveLength(7);
          for (const s of p.sections) for (const text of s.paragraphs) expect(inline.textContent).toContain(text[locale]);
          const url = `${path}/results/${p.id}`, args = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) };
          const html = renderToStaticMarkup(await guide.default(args)), page = document.createElement("div"); page.innerHTML = html;
          expect(page.querySelector("h1")?.textContent).toBe(p.title[locale]); expect(page.querySelector("[data-written-client]")).toBeNull();
          for (const s of p.sections) for (const text of s.paragraphs) expect(page.textContent).toContain(text[locale]);
          const metadata = await guide.generateMetadata(args); expect(metadata.title).toBe(p.seo!.title[locale]);
          expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${url}`);
          expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` });
          expect(maps.filter(item => item.loc === `https://fermatmind.com${url}`)).toHaveLength(1);
        }
        const ids = Array.from(dom.querySelectorAll("[id]"), node => node.id); expect(new Set(ids).size).toBe(ids.length);
      }
    } finally { vi.unstubAllEnvs(); }
  });
  it("keeps malformed source, body and graph out of the actual entry, guide and OG routes", async () => {
    const loader = await import("@/lib/questionnaires/loaders"), entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), og = await import("@/app/og/fun/[slug]/route");
    const spy = vi.spyOn(loader, "loadQuestionnaire");
    try {
      for (const mutate of [
        (q: WrittenCoordinationQuiz) => { delete q.questions[0]; },
        (q: WrittenCoordinationQuiz) => { delete q.coordination.entry.records[0]; },
        (q: WrittenCoordinationQuiz) => { q.profiles[0].sections[0].paragraphs.pop(); },
        (q: WrittenCoordinationQuiz) => { q.coordination.grid.edges.B2.push("B3"); },
        (q: WrittenCoordinationQuiz) => { q.references![0].url = "https://untrusted.invalid"; },
      ]) {
        const q = structuredClone(quiz); mutate(q); spy.mockResolvedValue(q);
        const ep = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, gp = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "entry" }) };
        expect((await entry.generateMetadata(ep)).robots).toEqual({ index: false, follow: false }); expect((await guide.generateMetadata(gp)).robots).toEqual({ index: false, follow: false });
        await expect(entry.default(ep)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404"); await expect(guide.default(gp)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        expect((await og.GET(new Request(`https://fermatmind.com/og/fun/${quiz.slug}`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
      }
    } finally { spy.mockRestore(); }
  });
});
