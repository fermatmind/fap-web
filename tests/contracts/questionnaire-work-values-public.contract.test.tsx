import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
// Capture the route's label tree here; browser acceptance checks real PNGs separately.
vi.mock("next/og", () => ({ ImageResponse: class extends Response {
  constructor(tree: Parameters<typeof renderToStaticMarkup>[0]) { super(renderToStaticMarkup(tree)); }
} }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/values-assessment.json", "utf8")) as Questionnaire;

describe("Original30 work-priority reflection real public/native/SEO callers", () => {
  it("labels the work-priority entry accurately while retaining the public-guide label", async () => {
    const { GET } = await import("@/app/og/fun/[slug]/route");
    for (const locale of ["en", "zh"] as const) {
      const entry = await GET(new Request(`https://fermatmind.com/og/fun/values-assessment?locale=${locale}`), { params: Promise.resolve({ slug: quiz.slug }) });
      const text = await entry.text(); expect(text).toContain(locale === "en" ? "Original work-priority choices" : "原创工作取舍");
      expect(text).not.toContain(locale === "en" ? "Original symbolic quiz" : "原创象征测验");
      const guide = await GET(new Request(`https://fermatmind.com/og/fun/values-assessment?locale=${locale}&portrait=achievement`), { params: Promise.resolve({ slug: quiz.slug }) });
      expect(await guide.text()).toContain(locale === "en" ? "Public result guide" : "公开结果说明");
    }
  });
  it("renders both entries and all20 full guide pages with exact bilingual metadata and sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const maps = appendFunSitemapEntries([]); let pages = 0;
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/values-assessment`, args = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const meta = await entry.generateMetadata(args), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(args));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.description).toBe(quiz.description[locale]);
        expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(dom.textContent).toContain(quiz.instructions![locale]);
        for (const s of quiz.guide) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        expect(maps.filter(e => e.loc === `https://fermatmind.com${path}`)).toHaveLength(1); pages++;
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const m = await guide.generateMetadata(props); dom.innerHTML = renderToStaticMarkup(await guide.default(props));
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); expect(m.title).toBe(profile.seo!.title[locale]); expect(m.description).toBe(profile.seo!.description[locale]);
          expect(m.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(m.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/values-assessment/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/values-assessment/results/${profile.id}`, "x-default": `https://fermatmind.com/en/tests/explore/values-assessment/results/${profile.id}` });
          for (const s of profile.sections) for (const p of s.paragraphs) expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
          expect(dom.querySelector("[data-values-assessment-answer]")).toBeNull(); expect(dom.querySelector(`a[href='${path}#take-test']`)).not.toBeNull();
          expect(maps.filter(e => e.loc === `https://fermatmind.com${publicPath}`)).toHaveLength(1); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u); pages++;
        }
      }
      expect(pages).toBe(22); expect(maps.filter(e => e.loc.includes("/tests/explore/values-assessment"))).toHaveLength(22);
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
  it("rejects unknown public result identities instead of projecting an arbitrary private type", async () => {
    const guide = await import("@/components/questionnaires/QuestionnaireGuide"), { GET } = await import("@/app/og/fun/[slug]/route");
    for (const locale of ["en", "zh"] as const) {
      const args = { params: Promise.resolve({ locale, slug: quiz.slug, profile: "career-fit" }) };
      expect((await guide.generateMetadata(args)).robots).toMatchObject({ index: false }); await expect(guide.default(args)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/);
      expect((await GET(new Request(`https://fermatmind.com/og/fun/values-assessment?locale=${locale}&portrait=career-fit`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
    }
    expect((await GET(new Request("https://fermatmind.com/og/fun/values-assessment?locale=fr"), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
  });
});
