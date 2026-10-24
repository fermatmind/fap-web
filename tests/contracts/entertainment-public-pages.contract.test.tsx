import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FunQuizPage, { generateMetadata } from "@/app/(localized)/[locale]/tests/play/[slug]/page";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import catalog from "@/lib/entertainment/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("complete bilingual entertainment entry rendering", () => {
  it("renders every catalog identity and its real public content, with aligned metadata and no pre-result MBTI gate", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      for (const quiz of catalog) for (const locale of ["en", "zh"] as const) {
        const props = { params: Promise.resolve({ slug: quiz.slug, locale }) };
        const metadata = await generateMetadata(props);
        const html = renderToStaticMarkup(await FunQuizPage(props));
        const dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
        expect(dom.querySelectorAll("main")).toHaveLength(1);
        const authored = (await loadFunQuiz(quiz.slug))!;
        const publicPortraits = dom.querySelector("#possible-results")!.parentElement!;
        expect([...publicPortraits.querySelectorAll("article h3")].map(node => node.textContent)).toEqual(authored.results.map(result => result.title[locale]));
        for (const result of authored.results) expect(publicPortraits.textContent).toContain(result.summary[locale]);
        expect(dom.textContent).toContain(quiz.version);
        expect(dom.querySelector("#play")?.textContent).toContain(locale === "zh" ? "开始测试" : "Start quiz");
        expect(dom.querySelector("#play a[href*='mbti']")).toBeNull();
        expect(dom.querySelectorAll("#play input")).toHaveLength(0);
        expect(dom.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/play/${quiz.slug}`);
        expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/play/${quiz.slug}`, "zh-CN": `https://fermatmind.com/zh/tests/play/${quiz.slug}` });
        expect(metadata.robots).toMatchObject({ index: true, follow: true });
      }
    } finally { vi.unstubAllEnvs(); }
  });
});
