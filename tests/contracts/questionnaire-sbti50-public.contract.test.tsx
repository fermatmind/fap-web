import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import data from "@/lib/questionnaires/data/sbti-test.json";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("SBTI50 complete bilingual public pages", () => {
  it("renders both entries and all50 full guides with exact identity, body, metadata and no personal result", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    const guide = await import("@/components/questionnaires/QuestionnaireGuide");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/sbti-test`, args = { params: Promise.resolve({ locale, slug: data.slug }) };
        const metadata = await entry.generateMetadata(args), dom = document.createElement("div");
        dom.innerHTML = renderToStaticMarkup(await entry.default(args));
        expect(metadata.title).toBe(data.seoTitle[locale]);
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(dom.querySelector("h1")?.textContent).toBe(data.title[locale]);
        expect(dom.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
        for (const section of data.guide) for (const p of section.paragraphs) expect(dom.textContent).toContain(p[locale]);
        const hub = document.createElement("div"); hub.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />);
        expect(hub.querySelector(`a[href="${path}"]`)).not.toBeNull();
        for (const profile of data.profiles) {
          const gargs = { params: Promise.resolve({ locale, slug: data.slug, profile: profile.id }) };
          const gm = await guide.generateMetadata(gargs);
          dom.innerHTML = renderToStaticMarkup(await guide.default(gargs));
          expect(gm.title).toBe(profile.seo.title[locale]);
          expect(gm.alternates?.canonical).toBe(`https://fermatmind.com${path}/results/${profile.id}`);
          expect(gm.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/sbti-test/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/sbti-test/results/${profile.id}` });
          for (const section of profile.sections) for (const p of section.paragraphs) expect(dom.textContent).toContain(p[locale]);
          expect(dom.querySelector('[data-sbti50-counts]')).toBeNull();
          expect(dom.querySelector(`a[href='${path}#take-test']`)).not.toBeNull();
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
      expect(maps.filter(row => row.loc.includes('/tests/explore/sbti-test'))).toHaveLength(52);
    } finally { vi.unstubAllEnvs(); }
  });
});
