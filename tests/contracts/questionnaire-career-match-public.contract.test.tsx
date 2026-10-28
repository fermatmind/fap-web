import type { ReactElement } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const scene = vi.hoisted(() => ({ value: null as unknown }));
vi.mock("next/og", () => ({ ImageResponse: class extends Response { constructor(value: unknown) { super("captured-image-tree"); scene.value = value; } } }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/career-match.json", "utf8"));

describe("Career Match public input tool, without duplicate RIASEC result pages", () => {
  it("serves two native localized entries with all guidance, current metadata and input-specific directory labels", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const route = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const maps = appendFunSitemapEntries([]);
    for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/career-match`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await route.default(props));
      expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
      expect(dom.querySelectorAll("main")).toHaveLength(1); expect(dom.querySelector("button")).toBeDisabled();
      expect(dom.querySelector("select")).toBeNull();
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      for (const faq of quiz.faq) { expect(dom.textContent).toContain(faq.question[locale]); expect(dom.textContent).toContain(faq.answer[locale]); }
      const metadata = await route.generateMetadata(props);
      expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
      expect(maps.filter(x => x.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
      expect(maps.some(x => x.loc.startsWith(`https://fermatmind.com${path}/results/`))).toBe(false);
      const directory = document.createElement("div"); directory.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />);
      const card = directory.querySelector(`a[href='${path}']`)?.closest("article");
      expect(card?.textContent).toContain(locale === "en" ? "Interest themes + 2–3 roles" : "兴趣主题＋2—3个职业");
      expect(card?.textContent).not.toMatch(/0 questions|0 题|0题/);
    }
  });
  it("captures the actual OG label and footer tree for both locales, never a questionnaire/report promise", async () => {
    const { GET } = await import("@/app/og/fun/[slug]/route");
    for (const locale of ["en", "zh"] as const) {
      expect((await GET(new Request(`https://fermatmind.com/og/fun/career-match?locale=${locale}`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(200);
      const text = renderToStaticMarkup(scene.value as ReactElement);
      expect(text).toContain(quiz.title[locale]); expect(text).toContain(locale === "en" ? "Interest themes and real roles" : "兴趣主题与真实职业比较");
      expect(text).toContain(locale === "en" ? "Free career-theme comparison" : "职业主题比较免费");
      expect(text).not.toMatch(/Original symbolic quiz|Full report free|0 questions/);
    }
    expect((await GET(new Request("https://fermatmind.com/og/fun/career-match?portrait=best-job"), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
  });
});
