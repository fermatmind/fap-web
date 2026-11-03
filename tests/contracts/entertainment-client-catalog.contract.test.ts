import { describe, expect, it } from "vitest";
import native from "@/lib/questionnaires/catalog.json";
import legacy from "@/lib/entertainment/catalog.json";
import projection from "@/lib/entertainment/clientCatalog.json";
import titles from "@/lib/entertainment/activityTitles.json";
import { entertainmentActivityDefinitions } from "@/lib/entertainment/activityDefinitions";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";

describe("client catalog projection", () => {
  it("preserves every identity, analytics field and activity title from the full catalogs", () => {
    expect(projection).toEqual({
      native: native.map(({ slug, collection, code, formCode, resultSlugs }) => ({ slug, collection, code, formCode, resultSlugs })),
      legacy: legacy.map(({ slug }) => ({ slug })),
    });
    expect(titles).toEqual({
      native: native.map(({ slug, title }) => ({ slug, title })),
      legacy: legacy.map(({ slug, title }) => ({ slug, title })),
    });
    expect(entertainmentActivityDefinitions).toEqual(entertainmentActivityCatalog.map(({ slug, path, privacy, roles }) => ({ slug, path, privacy, roles })));
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
