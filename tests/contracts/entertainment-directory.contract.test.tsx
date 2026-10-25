import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MoreTests } from "@/components/entertainment/MoreTests";
import catalog from "@/lib/entertainment/catalog.json";
import { directoryQuizzes, isDirectoryQuiz } from "@/lib/entertainment/directory";
import { isMissingFunRoute } from "@/lib/entertainment/routing";

describe("assessment directory correction", () => {
  it("lists only the existing questionnaire editions in both languages and retains historical routes", () => {
    expect(directoryQuizzes.map(q => q.slug).sort()).toEqual(["relationship-values", "response-color"]);
    for (const locale of ["en", "zh"] as const) {
      const html = renderToStaticMarkup(<MoreTests locale={locale} />);
      for (const card of catalog) {
        const link = `href="/${locale}/tests/play/${card.slug}"`;
        if (isDirectoryQuiz(card.slug)) expect(html).toContain(link);
        else expect(html).not.toContain(link);
        expect(isMissingFunRoute(`/${locale}/tests/play/${card.slug}`)).toBe(false);
        for (const result of card.resultSlugs) expect(isMissingFunRoute(`/${locale}/tests/play/${card.slug}/results/${result}`)).toBe(false);
      }
      expect(html).toContain(locale === "zh" ? "24 题" : "24 questions");
      expect(html).not.toMatch(/101|100\+/);
    }
  });
});
