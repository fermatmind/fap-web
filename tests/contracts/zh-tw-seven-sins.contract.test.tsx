import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import source from "@/lib/questionnaires/data/seven-sins-virtues-test.json";
import { virtuesResultProfile } from "@/lib/questionnaires/result-content/seven-sins-virtues-test";
import { traditionalSevenSins as quiz, traditionalSevenSinsEditorial } from "@/lib/i18n/zh-TW/sevenSins";
import generated from "@/lib/i18n/zh-TW/seven-sins.generated.json";
import ui from "@/lib/i18n/zh-TW/seven-sins-ui.generated.json";
import { scoreMiniVirtuesQuestionnaire } from "@/lib/questionnaires/miniVirtues";
import { sevenSinsCardRows } from "@/lib/questionnaires/sevenSinsCard";
import { QuestionnaireSevenSinsOverview, QuestionnaireSevenSinsSample } from "@/components/questionnaires/QuestionnaireSevenSinsOverview";
import { SevenSinsTraditionalPage, sevenSinsTraditionalMetadata } from "@/components/i18n/zh-TW/SevenSinsPage";
import { traditionalEquivalent } from "@/lib/i18n/traditionalRoutes";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { proxy } from "@/proxy";
import { SITE_URL } from "@/lib/site";

const entry = "/zh-TW/tests/explore/seven-sins-virtues-test";
function original(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(original);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([key]) => key !== "zh-TW").map(([key, child]) => [key, original(child)]));
  return value;
}
describe("complete Taiwan seven-sins display release", () => {
  it("binds source bytes, preserves every original field and appends guide paragraphs by section identity", () => {
    for (const artifact of [generated, ui]) for (const [path, hash] of Object.entries(artifact.sourceHashes)) expect(createHash("sha256").update(readFileSync(path)).digest("hex")).toBe(hash);
    expect(original(quiz)).toEqual({ ...source, profiles: source.profiles.map(virtuesResultProfile) });
    expect(quiz.questions).toHaveLength(28);
    expect(quiz.profiles).toHaveLength(7);
    for (const profile of quiz.profiles) {
      expect(profile.sections).toHaveLength(8);
      expect(new Set(profile.sections.map(section => section.id)).size).toBe(8);
      for (const section of profile.sections) expect(section.paragraphs.every(paragraph => paragraph["zh-TW"].length > 0)).toBe(true);
    }
    expect(traditionalSevenSinsEditorial.virtuesLandingSections.length).toBeGreaterThan(0);
  });
  it("keeps midpoint, both-high, mixed fractional scores and missing answers identical to authority", () => {
    for (const selected of ["1", "3", "5", "mixed"]) {
      const answers = Object.fromEntries(source.questions.map((question, index) => [question.id, selected === "mixed" ? String(index % 5 + 1) : selected]));
      expect(scoreMiniVirtuesQuestionnaire(quiz, answers)).toEqual(scoreMiniVirtuesQuestionnaire(source, answers));
    }
    const partial = Object.fromEntries(source.questions.slice(1).map(question => [question.id, "3"]));
    expect(scoreMiniVirtuesQuestionnaire(quiz, partial).status).toBe("incomplete");
    expect(scoreMiniVirtuesQuestionnaire(quiz, { bad: "3" }).status).toBe("invalid");
  });
  it("renders the sample, fourteen axes and all tied leaders in Traditional Chinese", () => {
    const score = scoreMiniVirtuesQuestionnaire(quiz, Object.fromEntries(source.questions.map(question => [question.id, "4"])));
    if (score.status !== "complete" || score.model !== "dual") throw new Error("Unexpected scoring result");
    const html = renderToStaticMarkup(<><QuestionnaireSevenSinsOverview result={score} locale="zh-TW" headingRef={null} /><QuestionnaireSevenSinsSample result={score} locale="zh-TW" /></>);
    expect((html.match(/data-seven-sins-axis=/g) ?? [])).toHaveLength(28);
    expect(html).toContain("結果示例");
    expect(html).toContain("各得 75 分");
    expect(html).toContain("謙卑");
    expect(html).not.toContain("结果示例");
    expect(sevenSinsCardRows(score)?.every(row => row.leadingSin && row.leadingVirtue)).toBe(true);
  });
  it("adds exactly eight public URLs with reciprocal language metadata and a private take route", async () => {
    const paths = [entry, ...quiz.profiles.map(profile => `${entry}/results/${profile.id}`)];
    const listed = appendFunSitemapEntries([]).filter(item => new URL(item.loc).pathname.startsWith(entry)).map(item => new URL(item.loc).pathname).sort();
    expect(listed).toEqual(paths.sort());
    for (const path of paths) {
      const metadata = sevenSinsTraditionalMetadata(path);
      expect(metadata.alternates?.canonical).toBe(`${SITE_URL}${path}`);
      expect(metadata.alternates?.languages?.en).toBe(`${SITE_URL}${path.replace("/zh-TW", "/en")}`);
      for (const locale of ["en", "zh"] as const) {
        const localPath = path.replace("/zh-TW", `/${locale}`);
        expect(traditionalEquivalent(localPath)).toBe(path);
        expect(buildPageMetadata({ locale, pathname: localPath, title: "test", description: "test", alternatesByLocale: { en: path.replace("/zh-TW", "/en"), zh: path.replace("/zh-TW", "/zh") } }).alternates?.languages?.["zh-TW"]).toBe(`${SITE_URL}${path}`);
      }
    }
    const take = await proxy(new NextRequest(`https://fermatmind.com${entry}/take`));
    expect(take.headers.get("x-robots-tag")).toContain("noindex");
    expect(take.headers.get("cache-control")).toContain("no-store");
    const unknown = await proxy(new NextRequest(`https://fermatmind.com${entry}/results/unknown`));
    expect(unknown.status).toBe(404);
  });
  it("keeps all existing landing research and complete public readings available", () => {
    const entryHtml = renderToStaticMarkup(<SevenSinsTraditionalPage path={entry} />);
    for (const profile of quiz.profiles) expect(entryHtml).toContain(`${entry}/results/${profile.id}`);
    for (const section of traditionalSevenSinsEditorial.virtuesLandingSections) expect(entryHtml).toContain(section.title["zh-TW"]);
    const reading = renderToStaticMarkup(<SevenSinsTraditionalPage path={`${entry}/results/anger-reading`} />);
    expect(reading).toContain("比較全部七組");
    expect(reading).not.toContain("data-seven-sins-axis");
  });
});
