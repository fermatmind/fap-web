import type { Questionnaire } from "@/lib/questionnaires/types";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { apiLocaleForDisplay, normalizeDisplayLocale } from "@/lib/i18n/locales";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import source from "@/lib/questionnaires/data/chiikawa.json";
import additions from "@/lib/questionnaires/result-content/chiikawa.json";
import generated from "@/lib/i18n/zh-TW/chiikawa.generated.json";
import { traditionalQuiz, traditionalUi } from "@/lib/i18n/zh-TW/chiikawa";
import { traditionalEquivalent, traditionalPath, TRADITIONAL_PUBLIC_PATHS } from "@/lib/i18n/traditionalRoutes";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ChiikawaReading } from "@/components/i18n/zh-TW/ChiikawaReading";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";

const entry = "/zh-TW/tests/explore/chiikawa";
describe("Taiwan Chiikawa release", () => {
  it("binds current authority hashes, complete resource coverage and unchanged identity/scoring structure", () => {
    for (const [path, hash] of Object.entries(generated.sourceHashes)) expect(createHash("sha256").update(readFileSync(path)).digest("hex")).toBe(hash);
    function original(value: unknown): unknown {
      if (Array.isArray(value)) return value.map(original);
      if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([key]) => key !== "zh-TW").map(([key, child]) => [key, original(child)]));
      return value;
    }
    expect(original(traditionalQuiz)).toEqual({ ...source, profiles: source.profiles.map(profile => ({ ...profile, sections: [...profile.sections, ...additions[profile.id as keyof typeof additions]] })) });
    expect(traditionalUi.start["zh-TW"]).toBe("開始測試");
    expect(traditionalQuiz.questions).toHaveLength(18);
    expect(traditionalQuiz.profiles).toHaveLength(6);
    for (const profile of traditionalQuiz.profiles) {
      const html = renderToStaticMarkup(<ChiikawaReading profile={profile} level={1} />);
      for (const section of profile.sections) expect(html).toContain(section.title["zh-TW"]);
    }
  });
  it("reuses the scorer with identical single and all-tie outcomes, incomplete and invalid states", () => {
    for (const mode of ["tie", "single"]) {
      const answers = Object.fromEntries(source.questions.map(question => [question.id, (mode === "tie" ? question.options[0] : question.options.find(option => option.directionId === "chiikawa") ?? question.options[0]).id]));
      expect(scoreArchetypeQuestionnaire(traditionalQuiz, answers)).toEqual(scoreArchetypeQuestionnaire(source as Questionnaire, answers));
      const result = scoreArchetypeQuestionnaire(traditionalQuiz, answers);
      expect(result.status).toBe("complete");
      if (result.status === "complete") expect(result.profileIds).toHaveLength(mode === "tie" ? 6 : 1);
    }
    expect(scoreArchetypeQuestionnaire(traditionalQuiz, {}).status).toBe("incomplete");
    expect(scoreArchetypeQuestionnaire(traditionalQuiz, { unknown: "x" }).status).toBe("invalid");
  });
  it("honors explicit Taiwan URLs independently of geo/cookies and closes unsupported/private paths", async () => {
    const request = new NextRequest(`https://fermatmind.com${entry}`, { headers: { "cf-ipcountry": "CN", "accept-language": "en", cookie: "fm_locale=zh" } });
    const response = await proxy(request);
    expect(response.headers.get("location")).toBeNull();
    expect(response.status).toBe(200);
    const take = await proxy(new NextRequest(`https://fermatmind.com${entry}/take`));
    expect(take.headers.get("x-robots-tag")).toContain("noindex");
    expect(take.headers.get("cache-control")).toContain("no-store");
    const account = await proxy(new NextRequest("https://fermatmind.com/zh-TW/account"));
    expect(account.status).toBe(200);
    expect(account.headers.get("x-robots-tag")).toContain("noindex");
    expect(account.headers.get("cache-control")).toContain("no-store");
    for (const path of ["/zh-TW/result/private", "/zh-TW/orders/private", "/zh-TW/account/private", "/zh-TW/tests/mbti", `${entry}/results/unknown`]) {
      const denied = await proxy(new NextRequest(`https://fermatmind.com${path}`));
      expect(denied.status).toBe(404);
      expect(denied.headers.get("x-robots-tag")).toContain("noindex");
    }
  });
  it("keeps display, CMS/form locale and commercial region separate", () => {
    expect(normalizeDisplayLocale("zh-tw")).toBe("zh-TW");
    expect(normalizeDisplayLocale("zh-Hant")).toBeNull();
    expect(apiLocaleForDisplay("zh-TW")).toBeNull();
    expect(apiLocaleForDisplay("zh")).toBe("zh-CN");
    expect(apiLocaleForDisplay("en")).toBe("en");
  });
  it("exposes only real public equivalents and excludes all private paths from the inventory", () => {
    expect(traditionalPath("/zh/articles/test")).toBeNull();
    expect(traditionalPath("/zh-TW/tests/mbti")).toBeNull();
    expect(traditionalEquivalent(`${entry}/take`)).toBeNull();
    for (const suffix of ["result/private", "orders/private", "share/private", "account", "tests/explore/chiikawa/take"]) expect(shouldIncludeInSitemap(`/zh-TW/${suffix}`)).toBe(false);
    const paths = appendFunSitemapEntries([]).filter(entry => entry.loc.includes("/zh-TW")).map(entry => new URL(entry.loc).pathname).sort();
    expect(paths).toEqual(TRADITIONAL_PUBLIC_PATHS.map(path => `/zh-TW${path}`).sort());
    expect(paths.some(path => path.includes("take"))).toBe(false);
    const metadata = buildPageMetadata({ locale: "zh", pathname: "/zh/tests/explore/chiikawa", title: "test", description: "test", alternatesByLocale: { en: "/en/tests/explore/chiikawa", zh: "/zh/tests/explore/chiikawa" } });
    expect(new URL(String(metadata.alternates?.languages?.["zh-TW"])).pathname).toBe(entry);
    expect(traditionalEquivalent("/zh/tests/explore/cyberpunk-edgerunners")).toBeNull();
  });
});
