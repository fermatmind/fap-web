import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("career claim gate render contract", () => {
  it("blocks salary, outlook, fit, and answer surfaces when explicit claim permissions are missing", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("next/navigation", async () => {
      const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
      return {
        ...actual,
        notFound: vi.fn(() => {
          throw new Error("not-found");
        }),
        usePathname: vi.fn(() => "/en/career/jobs/product-manager"),
      };
    });
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", async () => {
      const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
      return {
        ...actual,
        localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
      };
    });
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => ({
        identity: {
          canonical_slug: "product-manager",
        },
        titles: {
          canonical_en: "Product Manager",
        },
        truth_layer: {
          median_pay_usd_annual: 150000,
          outlook_pct_2024_2034: 12,
        },
        score_bundle: {
          fit_score: { value: 81, integrity_state: "full", degradation_factor: 1 },
          confidence_score: { value: 70, integrity_state: "provisional", degradation_factor: 0.9 },
        },
        seo_contract: {
          canonical_path: "/career/jobs/product-manager",
          index_state: "blocked",
          index_eligible: false,
        },
        structured_data: {
          occupation: {
            "@context": "https://schema.org",
            "@type": "Occupation",
            name: "Product Manager",
            url: "/career/jobs/product-manager",
            mainEntityOfPage: "/career/jobs/product-manager",
          },
          breadcrumb_list: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Career",
                item: "/career",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Product Manager",
                item: "/career/jobs/product-manager",
              },
            ],
          },
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobExplainability", () => ({
      fetchCareerJobExplainability: vi.fn(async () => null),
    }));

    const { default: CareerJobDetailPage } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const page = await CareerJobDetailPage({
      params: Promise.resolve({ locale: "en", slug: "product-manager" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-job-protocol-status");
    expect(html).toContain("career-job-trust-strip");
    expect(html).toContain("Career claim gate");
    expect(html).toContain('"@type":"Occupation"');
    expect(html.match(/"@type":"BreadcrumbList"/g)).toHaveLength(1);
    expect(html).toContain("http://localhost:3000/en/career/jobs/product-manager");
    expect(html).toContain("http://localhost:3000/en/career");
    expect(html).not.toContain("$150,000");
    expect(html).not.toContain("Ten-year outlook");
    expect(html).not.toContain("Backend score dimensions");
  });
});
