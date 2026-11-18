import { expect, test } from "@playwright/test";

for (const locale of ["zh", "en"]) {
  for (const [legacy, current, profile] of [
    ["jungian-archetype", "jung-archetypes", "hero"],
    ["cognitive-functions-test", "jung-cognitive-functions", "ni"],
  ]) {
    test(`@release ${locale} retires ${legacy} and forwards entry to ${current}`, async ({ request }) => {
      for (const suffix of ["", "/take"]) {
        const oldPath = `/${locale}/tests/explore/${legacy}${suffix}`;
        const response = await request.get(oldPath, { maxRedirects: 0 });
        expect(response.status()).toBe(308);
        expect(response.headers().location).toBe(suffix ? `/${locale}/tests/${current}${suffix}` : `/${locale}/tests/jung-test`);
      }
      expect((await request.get(`/${locale}/tests/explore/${legacy}/results/${profile}`)).status()).toBe(404);
      expect((await request.get(`/zh-TW/tests/explore/${legacy}/results/${profile}`)).status()).toBe(404);
    });
  }
}
