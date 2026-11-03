import { describe, expect, it } from "vitest";
import native from "@/lib/questionnaires/catalog.json";
import legacy from "@/lib/entertainment/catalog.json";
import projection from "@/lib/entertainment/clientCatalog.json";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";

describe("client catalog projection", () => {
  it("preserves every identity, analytics field and activity title from the full catalogs", () => {
    expect(projection).toEqual({
      native: native.map(({ slug, title, collection, code, formCode, resultSlugs }) => ({ slug, title, collection, code, formCode, resultSlugs })),
      legacy: legacy.map(({ slug, title }) => ({ slug, title })),
    });
  });
  it("preserves every bilingual questionnaire entry and result URL", () => {
    for (const locale of ["en", "zh"] as const) for (const item of native) {
      const path = `/${locale}/tests/${item.collection}/${item.slug}`;
      expect(questionnairePath(locale, item.slug)).toBe(path);
      for (const id of item.resultSlugs) expect(questionnaireGuidePath(locale, item.slug, id)).toBe(`${path}/results/${id}`);
    }
    expect(questionnairePath("en", "unregistered-slug")).toBe("/en/tests/explore/unregistered-slug");
  });
});
