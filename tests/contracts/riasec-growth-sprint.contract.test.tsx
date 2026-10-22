import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import worksheet from "@/lib/marketing/riasecWorksheet.json";
import { buildCareerDisplayCtaHref } from "@/lib/career/displaySurface";
import { CareerRiasecExploreLink } from "@/components/career/CareerRiasecExploreLink";
import CareerTestsPage, { generateMetadata as hubMetadata } from "@/app/(localized)/[locale]/career/tests/page";
import HollandPdfPage, { generateMetadata as pdfMetadata } from "@/app/(localized)/[locale]/holland-test/pdf-download/page";

vi.mock("next/link", () => ({ default: ({ href, children, ...props }: { href: string; children: ReactNode }) => <a href={href} {...props}>{children}</a> }));

beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); });
afterEach(() => { vi.unstubAllEnvs(); });

function documentFrom(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe.each<Locale>(["zh", "en"])("RIASEC growth sprint: %s", locale => {
  const params = () => Promise.resolve({ locale });

  it("renders both selection tables, working assessment targets and the resource link", async () => {
    const document = documentFrom(renderToStaticMarkup(await CareerTestsPage({ params: params() })));
    expect(document.querySelectorAll("h1")).toHaveLength(1);
    const selection = document.querySelector('[data-testid="career-tests-selection-map"]')!;
    expect(selection.querySelectorAll("tbody tr")).toHaveLength(3);
    expect([...selection.querySelectorAll("a")].map(a => a.getAttribute("href"))).toEqual([
      `/${locale}/tests/holland-career-interest-test-riasec`,
      `/${locale}/tests/mbti-personality-test-16-personality-types`,
      `/${locale}/tests/big-five-personality-test-ocean-model`,
    ]);
    expect(document.querySelectorAll('[data-testid="career-tests-holland-mbti-comparison"] tbody tr')).toHaveLength(4);
    expect(document.querySelector(`a[href="/${locale}/holland-test/pdf-download"]`)).not.toBeNull();
    const meta = await hubMetadata({ params: params() });
    expect(meta.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/career/tests`);
    expect(meta.description).toMatch(locale === "zh" ? /职业兴趣测试/ : /career interest test/);
  });

  it("renders the entire worksheet as HTML and links to an actual static PDF", async () => {
    const document = documentFrom(renderToStaticMarkup(await HollandPdfPage({ params: params() })));
    const preview = document.querySelector('[data-testid="riasec-pdf-preview"]')!;
    for (const page of worksheet[locale].pages) for (const section of page.sections) {
      expect(preview.textContent).toContain(section.body);
      for (const prompt of section.prompts) expect(preview.textContent).toContain(prompt);
    }
    const download = document.querySelector('[data-testid="riasec-pdf-download"]')!;
    expect(download.hasAttribute("download")).toBe(true);
    const file = fs.readFileSync(path.join(process.cwd(), "public", download.getAttribute("href")!));
    expect(file.subarray(0, 5).toString()).toBe("%PDF-");
    const meta = await pdfMetadata({ params: params() });
    expect(meta.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/holland-test/pdf-download`);
    expect(meta.alternates?.languages).toMatchObject({
      en: "https://fermatmind.com/en/holland-test/pdf-download",
      "zh-CN": "https://fermatmind.com/zh/holland-test/pdf-download",
    });
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent!));
    expect(schemas.map(schema => schema["@type"])).toEqual(["WebPage", "BreadcrumbList"]);
  });

  it("uses an escaped career name and preserves existing attribution on the canonical test path", () => {
    const href = buildCareerDisplayCtaHref({ locale, subjectSlug: "materials-scientists", landingPath: localizedPath("/career/jobs/materials-scientists", locale) });
    const document = documentFrom(renderToStaticMarkup(<CareerRiasecExploreLink locale={locale} careerName={'Materials <script>alert(1)</script>'} href={href} />));
    expect(document.querySelector("script")).toBeNull();
    const link = document.querySelector("a")!;
    const url = new URL(link.getAttribute("href")!, "https://fermatmind.com");
    expect(url.pathname).toBe(`/${locale}/tests/holland-career-interest-test-riasec`);
    expect(url.searchParams.get("subject_key")).toBe("materials-scientists");
    expect(link.textContent).toContain("Materials <script>alert(1)</script>");
  });
});
