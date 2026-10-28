import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/love-type-16.json", "utf8")) as Questionnaire;

describe("T015 original32 four-axis reflection real public/native/SEO callers", () => {
  it("renders both entries and all32 full guide pages with exact bilingual metadata and sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const maps = appendFunSitemapEntries([]); let pages = 0;
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/love-type-16`, args = { params: Promise.resolve({ locale, slug: quiz.slug }) };
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
          expect(m.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/love-type-16/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/love-type-16/results/${profile.id}`, "x-default": `https://fermatmind.com/en/tests/explore/love-type-16/results/${profile.id}` });
          for (const s of profile.sections) for (const p of s.paragraphs) expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
          expect(dom.querySelector("[data-love-axis]")).toBeNull(); expect(dom.querySelector(`a[href='${path}#take-test']`)).not.toBeNull();
          expect(maps.filter(e => e.loc === `https://fermatmind.com${publicPath}`)).toHaveLength(1); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u); pages++;
        }
      }
      expect(pages).toBe(34); expect(maps.filter(e => e.loc.includes("/tests/explore/love-type-16"))).toHaveLength(34);
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
  it("rejects unknown public result identities instead of projecting an arbitrary private type", async () => {
    const guide = await import("@/components/questionnaires/QuestionnaireGuide"), { GET } = await import("@/app/og/fun/[slug]/route");
    for (const locale of ["en", "zh"] as const) {
      const args = { params: Promise.resolve({ locale, slug: quiz.slug, profile: "high" }) };
      expect((await guide.generateMetadata(args)).robots).toMatchObject({ index: false }); await expect(guide.default(args)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/);
      expect((await GET(new Request(`https://fermatmind.com/og/fun/love-type-16?locale=${locale}&portrait=high`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
    }
    expect((await GET(new Request("https://fermatmind.com/og/fun/love-type-16?locale=fr"), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
  });
  it("withholds public entry, guide metadata and images when an incomplete result inventory reaches a caller", async () => {
    const malformed = structuredClone(quiz); malformed.profiles.pop();
    vi.resetModules(); vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => malformed }));
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), { GET } = await import("@/app/og/fun/[slug]/route");
      const props = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "lcro" }) };
      expect((await entry.generateMetadata(props)).robots).toMatchObject({ index: false });
      expect((await guide.generateMetadata(props)).robots).toMatchObject({ index: false });
      await expect(entry.default(props)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/);
      await expect(guide.default(props)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/);
      expect((await GET(new Request("https://fermatmind.com/og/fun/love-type-16?locale=en"), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
    } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
  });

});
