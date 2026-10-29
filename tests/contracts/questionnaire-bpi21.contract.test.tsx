import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { bpi21Keys, createBpi21OptionOrder, isBpi21ConfigurationValid, scoreBpi21 } from "@/lib/questionnaires/bpi21";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { Bpi21Client } from "@/components/questionnaires/Bpi21Client";
import { Bpi21Report } from "@/components/questionnaires/Bpi21Report";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/prakriti-inventory21.json", "utf8")) as Questionnaire;
const source = JSON.parse(readFileSync("tests/fixtures/questionnaires/bpi21-table2-en.json", "utf8")) as { license: string; doi: string; columns: string[]; rows: string[][] };
const digest = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const answersFor = (values: string[]): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map((q, i) => [q.id, values[i]]));
const allNA = () => answersFor(Array(21).fill("na"));

describe("Licensed BPI-21 nominal choices with a working Chinese and explicit NA extension", () => {
  it("binds every published English title, all63 source alternatives and nominal keys to Table2 under CC BY4", () => {
    expect(source.license).toBe("CC BY 4.0"); expect(source.doi).toBe("10.12688/wellcomeopenres.25166.2");
    expect(source.rows).toHaveLength(21); expect(source.columns).toEqual(bpi21Keys);
    expect(quiz.kind).toBe("bpi21"); expect(isBpi21ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(digest(quiz.questions)); expect(quiz.source.resultContentSha256).toBe(digest(quiz.profiles)); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const [i, q] of quiz.questions.entries()) {
      expect(q.id).toBe(`BPI21_${String(i + 1).padStart(3, "0")}`); expect(q.prompt.en).toBe(source.rows[i][0]);
      expect(q.reverse).toBeUndefined(); expect(q.options.map(o => o.id)).toEqual([...bpi21Keys, "na"]);
      expect(q.options.slice(0, 3).map(o => o.label.en)).toEqual(source.rows[i].slice(1));
      expect(q.options.map(o => o.directionId)).toEqual([...bpi21Keys, "unscored"]); expect(q.options.every(o => o.score === undefined)).toBe(true);
    }
    expect(quiz.instructions?.en).toContain("usual patterns"); expect(quiz.faq.map(f => f.answer.en).join(" ")).toContain("predictive validity for health and clinical outcomes remains untested");
    expect(quiz.questions).not.toEqual(JSON.parse(readFileSync("lib/questionnaires/data/what-element-am-i.json", "utf8")).questions);
  });

  it("checks all2024 reachable VPK/NA count states:253 fully scored and1771 withheld, without renormalisation or a highest type", () => {
    let states = 0, scored = 0, withheld = 0;
    for (let v = 0; v <= 21; v++) for (let p = 0; p <= 21 - v; p++) for (let k = 0; k <= 21 - v - p; k++) {
      const na = 21 - v - p - k, values = [...Array(v).fill("vata"), ...Array(p).fill("pitta"), ...Array(k).fill("kapha"), ...Array(na).fill("na")];
      const r = scoreBpi21(quiz, answersFor(values)); states++; expect(r.status).toBe("complete"); if (r.status !== "complete") throw new Error("Complete state rejected");
      expect(r.answered).toBe(21); expect(r.unscored).toBe(na);
      if (na) { withheld++; expect(r.counts).toBeNull(); expect(r.percentages).toBeNull(); }
      else { scored++; expect(r.counts).toEqual({ vata: v, pitta: p, kapha: k }); expect(r.percentages).toEqual({ vata: Math.round(v / 21 * 1000) / 10, pitta: Math.round(p / 21 * 1000) / 10, kapha: Math.round(k / 21 * 1000) / 10 }); }
      for (const key of ["profileId", "leaders", "total", "constitution", "severity"]) expect(r).not.toHaveProperty(key);
    }
    expect([states, scored, withheld]).toEqual([2024, 253, 1771]);
    const partial = allNA(); delete partial.BPI21_021; expect(scoreBpi21(quiz, partial)).toEqual({ status: "incomplete", answered: 20 });
    for (const value of [null, [], { ...allNA(), privateExtra: "vata" }, { ...allNA(), BPI21_001: "1" }]) expect(scoreBpi21(quiz, value).status).toBe("invalid");
    const broken = structuredClone(quiz); broken.questions[0].options[0].score = 1;
    expect(scoreBpi21(broken, allNA()).status).toBe("unavailable"); expect(renderToStaticMarkup(<Bpi21Client quiz={broken} locale="en" />)).toContain("edition is unavailable");
    expect(scoreQuestionnaire(quiz, allNA())).toEqual({ status: "unavailable", answered: 0 });
  });

  it("supports every one of six presentation permutations while stable keys and the final NA remain intact", () => {
    const seen = new Set<string>();
    for (const first of [0, 0.4, 0.9]) for (const second of [0, 0.9]) {
      let call = 0; const order = createBpi21OptionOrder(quiz, () => [first, second][call++ % 2]);
      expect(Object.keys(order)).toHaveLength(21);
      for (const q of quiz.questions) { expect(order[q.id].at(-1)).toBe("na"); expect([...order[q.id].slice(0, 3)].sort()).toEqual([...bpi21Keys].sort()); }
      seen.add(order.BPI21_001.join("|"));
    }
    expect(seen.size).toBe(6);
  });

  it("shows three7of21/33.3% records or no dosha numbers, retaining all24full sections in both languages", () => {
    const values = [...Array(7).fill("vata"), ...Array(7).fill("pitta"), ...Array(7).fill("kapha")];
    for (const locale of ["en", "zh"] as const) for (const answers of [answersFor(values), allNA()]) {
      const r = scoreBpi21(quiz, answers); if (r.status !== "complete") throw new Error("Complete state rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<Bpi21Report quiz={quiz} result={r} locale={locale} />);
      expect(dom.querySelectorAll("[data-bpi21-profile] h4")).toHaveLength(24);
      for (const p of quiz.profiles) for (const s of p.sections) for (const x of s.paragraphs) expect(dom.textContent).toContain(x[locale]);
      if (r.counts) { expect([...dom.querySelectorAll("[data-bpi21-count]")].map(e => e.textContent)).toEqual(Array(3).fill("7 / 21")); expect([...dom.querySelectorAll("[data-bpi21-percentage]")].map(e => e.textContent)).toEqual(Array(3).fill("33.3%")); }
      else { expect(dom.querySelectorAll("[data-bpi21-count], [data-bpi21-percentage]")).toHaveLength(0); expect(dom.querySelector("[data-bpi21-insufficient]")).not.toBeNull(); }
    }
    const code = readFileSync("components/questionnaires/Bpi21Client.tsx", "utf8"); expect(code).not.toMatch(/sessionStorage|localStorage|clipboard|recordEntertainmentActivity|useEntertainmentMetrics/);
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...quiz.profiles.map(p => `/results/${p.id}`)]) expect(isAnalyticsDisabledQuestionnaireUrl(`/${locale}/tests/explore/${quiz.slug}${suffix}`)).toBe(true);
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
  });

  it("opens all8 full bilingual public pages, source credits, canonical pairs and directory/sitemap entries", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, dom = document.createElement("div");
        dom.innerHTML = renderToStaticMarkup(await entry.default(props)); const meta = await entry.generateMetadata(props);
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.querySelectorAll("#take-test")).toHaveLength(1); expect(dom.textContent).toContain(quiz.instructions![locale]);
        expect(dom.textContent).toContain("CC BY 4.0"); expect(dom.textContent).toContain("10.12688/wellcomeopenres.25166.2"); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        const directory = document.createElement("div"); directory.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />); expect(directory.querySelector(`a[href="${path}"]`)).not.toBeNull();
        for (const profile of quiz.profiles) {
          const pp = `${path}/results/${profile.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          dom.innerHTML = renderToStaticMarkup(await guide.default(gp)); const metadata = await guide.generateMetadata(gp);
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${pp}`); expect(maps.some(e => e.loc === `https://fermatmind.com${pp}`)).toBe(true);
          for (const s of profile.sections) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
          expect(dom.querySelector("[data-bpi21-count]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
      for (const p of quiz.profiles) { expect(p.sections).toHaveLength(8); expect(p.sections.reduce((n, s) => n + s.paragraphs.map(x => x.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThanOrEqual(650); }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
