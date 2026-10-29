import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import data from "@/lib/questionnaires/data/mattering.json";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
describe("GMS/AMS public callers", () => {
  it("renders all six canonical bilingual pages, complete guides, source body, schema and catalog links", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide");
    const maps = appendFunSitemapEntries([]);
    for(const locale of ["en","zh"] as const){
      const path=`/${locale}/tests/explore/mattering`,args={params:Promise.resolve({locale,slug:"mattering"})};
      const metadata=await entry.generateMetadata(args),dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default(args));
      expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);expect(metadata.title).toBe(data.seoTitle[locale]);expect(dom.querySelector('h1')?.textContent).toBe(data.title[locale]);
      expect(dom.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
      for(const s of data.guide)for(const p of s.paragraphs)expect(dom.textContent).toContain(p[locale]);
      expect(renderToStaticMarkup(<MoreTests locale={locale}/>)).toContain(`href="${path}"`);
      for(const p of data.profiles){
        const gargs={params:Promise.resolve({locale,slug:"mattering",profile:p.id})},gm=await guide.generateMetadata(gargs);
        dom.innerHTML=renderToStaticMarkup(await guide.default(gargs));
        expect(gm.title).toBe(p.seo.title[locale]);expect(gm.alternates?.canonical).toBe(`https://fermatmind.com${path}/results/${p.id}`);
        expect(gm.alternates?.languages).toMatchObject({en:`https://fermatmind.com/en/tests/explore/mattering/results/${p.id}`,"zh-CN":`https://fermatmind.com/zh/tests/explore/mattering/results/${p.id}`});
        for(const s of p.sections)for(const para of s.paragraphs)expect(dom.textContent).toContain(para[locale]);
        expect(dom.querySelector('[data-mattering10-total]')).toBeNull();expect(dom.querySelector(`a[href='${path}#take-test']`)).not.toBeNull();
        if(locale==="en")expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    }
    expect(maps.filter(p=>p.loc.includes('/tests/explore/mattering'))).toHaveLength(6);
    vi.unstubAllEnvs();
  });
});
