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
import { RIASEC_RESULT_EXAMPLES } from "@/components/tests/RiasecResultExamples";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";
import backendSamples from "@/app/(localized)/[locale]/(app)/dev/riasec-reading/backend-samples.json";
import { metadata as resultMetadata } from "@/app/(localized)/[locale]/(app)/result/[id]/page";

vi.mock("next/link", () => ({ default: ({ href, children, ...props }: { href: string; children: ReactNode }) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));
vi.mock("@/app/(localized)/[locale]/(app)/result/[id]/ResultClient", () => ({ default: () => null }));

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
    const reading = document.querySelector('[data-testid="career-tests-comparison-reading"]')!;
    expect([...reading.querySelectorAll("a")].map(a => a.getAttribute("href"))).toEqual([
      `/${locale}/articles/${locale === "zh" ? "mbti-vs-holland-career-choice" : "mbti-vs-holland-code-career-choice"}`,
      `/${locale}/articles/big-five-vs-riasec-personality-traits-and-career-interests`,
    ]);
    const comparison = document.querySelector('[data-testid="career-tests-holland-mbti-comparison"]')!;
    expect(comparison.querySelectorAll("thead th")).toHaveLength(4);
    expect(comparison.textContent).toContain(locale === "zh" ? "不能换成兴趣代码" : "cannot become interest codes");
    expect(document.querySelector('[aria-labelledby="career-tests-comparison"]')!.textContent).toContain(locale === "zh" ? "不必全部做完" : "do not need all three tests");
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

  it("labels all three synthetic examples and preserves six-dimension score and tie semantics", async () => {
    const document = documentFrom(renderToStaticMarkup(await HollandPdfPage({ params: params() })));
    const examples = document.querySelector('[data-testid="riasec-result-examples"]')!;
    expect(examples.textContent).toContain(locale === "zh" ? "不是真实用户报告" : "not real user reports");
    expect(examples.textContent).toContain(locale === "zh" ? "不是百分位、能力分或职业成功率" : "not percentiles, ability scores, or career success rates");
    expect(examples.textContent).toContain(locale === "zh" ? "60 题与 140 题不可直接比较分差" : "Do not compare numeric score differences across");
    expect(examples.textContent).toContain(locale === "zh" ? "判定阈值" : "not thresholds");
    for (const example of RIASEC_RESULT_EXAMPLES) {
      const card = examples.querySelector(`[data-example="${example.key}"]`)!;
      expect([...card.querySelectorAll("dt")].map(el => el.textContent?.charAt(0))).toEqual(["R", "I", "A", "S", "E", "C"]);
      expect([...card.querySelectorAll("dd")].map(el => Number(el.textContent))).toEqual([...example.scores]);
      expect(card.textContent).toContain(example.codes.join(" / "));
      expect(example.scores[1]).toBeGreaterThan(example.scores[2]);
      expect(example.scores[2]).toBeGreaterThanOrEqual(example.scores[3]);
      for (const code of example.codes) expect([...code].sort()).toEqual(["A", "I", "S"]);
    }
    expect(RIASEC_RESULT_EXAMPLES[1].scores[2] - RIASEC_RESULT_EXAMPLES[1].scores[3]).toBe(2);
    expect(RIASEC_RESULT_EXAMPLES[2].scores[2]).toBe(RIASEC_RESULT_EXAMPLES[2].scores[3]);
    expect(examples.querySelector('a[href*="/result/"]')).toBeNull();
  });

  it.each([60, 140] as const)("links a real %i-question report to local reading and career exploration without leaking result data", async (form) => {
    const key = `${locale === "zh" ? "zh-CN" : "en"}-${form}` as keyof typeof backendSamples;
    const vm = assembleRiasecResultViewModel({ scale_code: "RIASEC", type_code: "IAS", riasec_public_projection_v2: backendSamples[key] } as unknown as ReportResponse, locale);
    const before = structuredClone(vm);
    const document = documentFrom(renderToStaticMarkup(<RiasecResultShell locale={locale} viewModel={vm} attemptId="private-attempt" />));
    expect(vm).toEqual(before);
    expect(document.querySelector('[data-testid="riasec-result-summary"]')?.textContent).toContain(vm.resultSummary!.rankingDisplay);
    const steps = document.querySelector('[data-testid="riasec-career-next-steps"]')!;
    const hrefs = [...steps.querySelectorAll("a")].map(a => a.getAttribute("href"));
    expect(hrefs).toEqual([`/${locale}/holland-test/pdf-download#interpret-results`, `/${locale}/career`, `/${locale}/career/guides`]);
    expect(document.querySelector('a[href="#riasec-career-next"]')).not.toBeNull();
    const guide = documentFrom(renderToStaticMarkup(await HollandPdfPage({ params: params() })));
    const reading = guide.getElementById("interpret-results")!;
    expect(reading.querySelector(`a[href="/${locale}/career"]`)).not.toBeNull();
    expect(reading.querySelector(`a[href="/${locale}/career/guides"]`)).not.toBeNull();
    expect(reading.textContent).toContain(locale === "zh" ? "无搜索结果" : "empty search");
    expect(reading.textContent).toContain(locale === "zh" ? "不以示例补齐个人分数" : "do not fill missing scores");
    expect(resultMetadata.robots).toMatchObject({ index: false, follow: false });
  });
});
