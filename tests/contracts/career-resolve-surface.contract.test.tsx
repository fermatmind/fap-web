import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unmock("next/navigation");
});

describe("career resolve surface contract", () => {
  it("keeps resolve metadata noindex and canonicalized to /career/resolve", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));

    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/resolve/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "analytics" }),
    });

    expect(String(metadata.alternates?.canonical ?? "")).toBe("https://fermatmind.com/en/career/resolve");
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
  });

  it("redirects to job detail when resolver returns occupation", async () => {
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("next/navigation", () => ({
      usePathname: vi.fn(() => "/en/career/resolve"),
      redirect: vi.fn((destination: string) => {
        throw new Error(`redirect:${destination}`);
      }),
    }));
    vi.doMock("@/lib/career/api/fetchCareerAliasResolution", () => ({
      fetchCareerAliasResolution: vi.fn(async () => ({
        bundle_kind: "career_alias_resolution",
        resolution: {
          resolved_kind: "occupation",
          occupation: {
            canonical_slug: "data-scientists",
            canonical_title_en: "Data Scientists",
            seo_contract: {
              index_state: "indexable",
              index_eligible: true,
            },
            trust_summary: {
              reviewer_status: "approved",
            },
          },
        },
      })),
    }));

    const { default: CareerResolvePage } = await import("@/app/(localized)/[locale]/career/resolve/page");
    await expect(
      CareerResolvePage({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({ q: "data scientist" }),
      })
    ).rejects.toThrow("redirect:/en/career/jobs/data-scientists");
  });

  it("redirects to family hub when resolver returns family", async () => {
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("next/navigation", () => ({
      usePathname: vi.fn(() => "/en/career/resolve"),
      redirect: vi.fn((destination: string) => {
        throw new Error(`redirect:${destination}`);
      }),
    }));
    vi.doMock("@/lib/career/api/fetchCareerAliasResolution", () => ({
      fetchCareerAliasResolution: vi.fn(async () => ({
        bundle_kind: "career_alias_resolution",
        resolution: {
          resolved_kind: "family",
          family: {
            canonical_slug: "data-science",
            title_en: "Data Science",
          },
        },
      })),
    }));

    const { default: CareerResolvePage } = await import("@/app/(localized)/[locale]/career/resolve/page");
    await expect(
      CareerResolvePage({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({ q: "data science" }),
      })
    ).rejects.toThrow("redirect:/en/career/family/data-science");
  });

  it("renders ambiguous candidates on resolve surface", async () => {
    vi.doMock("next/link", () => ({
      default: ({
        href,
        children,
        prefetch: _prefetch,
        ...props
      }: {
        href: string;
        children: ReactNode;
        prefetch?: boolean;
      }) => {
        void _prefetch;

        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      },
    }));
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
    vi.doMock("next/navigation", () => ({
      usePathname: vi.fn(() => "/en/career/resolve"),
      redirect: vi.fn((destination: string) => {
        throw new Error(`unexpected-redirect:${destination}`);
      }),
    }));
    vi.doMock("@/lib/career/api/fetchCareerAliasResolution", () => ({
      fetchCareerAliasResolution: vi.fn(async () => ({
        bundle_kind: "career_alias_resolution",
        query: {
          raw: "analytics",
          normalized: "analytics",
          locale: "en-us",
        },
        resolution: {
          resolved_kind: "ambiguous",
          candidates: [
            {
              candidate_kind: "occupation",
              canonical_slug: "data-scientists",
              canonical_title_en: "Data Scientists",
              seo_contract: {
                index_state: "indexable",
                index_eligible: true,
              },
              trust_summary: {
                reviewer_status: "approved",
              },
            },
            {
              candidate_kind: "family",
              canonical_slug: "data-science",
              title_en: "Data Science",
            },
          ],
        },
      })),
    }));

    const { default: CareerResolvePage } = await import("@/app/(localized)/[locale]/career/resolve/page");
    const page = await CareerResolvePage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "analytics" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-alias-resolution-candidates");
    expect(html).toContain("career-alias-resolution-group-occupation");
    expect(html).toContain("career-alias-resolution-group-family");
    expect(html).toContain("career-alias-resolution-candidate-link");
    expect(html).toContain("/en/career/jobs/data-scientists");
    expect(html).toContain("/en/career/family/data-science");
    expect(html).not.toContain("career-job-search-card");
  });

  it("does not expose blocked occupation aliases on redirect or ambiguous candidate surfaces", async () => {
    vi.doMock("next/link", () => ({
      default: ({
        href,
        children,
        prefetch: _prefetch,
        ...props
      }: {
        href: string;
        children: ReactNode;
        prefetch?: boolean;
      }) => {
        void _prefetch;

        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      },
    }));
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
    vi.doMock("next/navigation", () => ({
      usePathname: vi.fn(() => "/en/career/resolve"),
      redirect: vi.fn((destination: string) => {
        throw new Error(`unexpected-redirect:${destination}`);
      }),
    }));
    vi.doMock("@/lib/career/api/fetchCareerAliasResolution", () => ({
      fetchCareerAliasResolution: vi.fn(async ({ q }: { q: string }) => ({
        bundle_kind: "career_alias_resolution",
        query: {
          raw: q,
          normalized: q,
          locale: "en-us",
        },
        resolution:
          q === "direct"
            ? {
                resolved_kind: "occupation",
                occupation: {
                  canonical_slug: "draft-occupation",
                  canonical_title_en: "Draft Occupation",
                  seo_contract: {
                    index_state: "blocked",
                    index_eligible: false,
                  },
                  trust_summary: {
                    reviewer_status: "review_needed",
                  },
                },
              }
            : {
                resolved_kind: "ambiguous",
                candidates: [
                  {
                    candidate_kind: "occupation",
                    canonical_slug: "draft-occupation",
                    canonical_title_en: "Draft Occupation",
                    seo_contract: {
                      index_state: "blocked",
                      index_eligible: false,
                    },
                    trust_summary: {
                      reviewer_status: "review_needed",
                    },
                  },
                  {
                    candidate_kind: "occupation",
                    canonical_slug: "data-scientists",
                    canonical_title_en: "Data Scientists",
                    seo_contract: {
                      index_state: "indexable",
                      index_eligible: true,
                    },
                    trust_summary: {
                      reviewer_status: "approved",
                    },
                  },
                ],
              },
      })),
    }));

    const { default: CareerResolvePage } = await import("@/app/(localized)/[locale]/career/resolve/page");
    const blockedDirectPage = await CareerResolvePage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "direct" }),
    });
    const blockedDirectHtml = renderToStaticMarkup(blockedDirectPage as ReactNode);

    expect(blockedDirectHtml).toContain("career-resolve-no-result");
    expect(blockedDirectHtml).not.toContain("Draft Occupation");
    expect(blockedDirectHtml).not.toContain("/en/career/jobs/draft-occupation");

    const ambiguousPage = await CareerResolvePage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "ambiguous" }),
    });
    const ambiguousHtml = renderToStaticMarkup(ambiguousPage as ReactNode);

    expect(ambiguousHtml).toContain("career-alias-resolution-candidate-link");
    expect(ambiguousHtml).toContain("/en/career/jobs/data-scientists");
    expect(ambiguousHtml).not.toContain("Draft Occupation");
    expect(ambiguousHtml).not.toContain("/en/career/jobs/draft-occupation");
  });

  it("renders resolve no-result state and idle state contracts", async () => {
    vi.doMock("next/link", () => ({
      default: ({
        href,
        children,
        prefetch: _prefetch,
        ...props
      }: {
        href: string;
        children: ReactNode;
        prefetch?: boolean;
      }) => {
        void _prefetch;

        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      },
    }));
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
    vi.doMock("next/navigation", () => ({
      usePathname: vi.fn(() => "/en/career/resolve"),
      redirect: vi.fn((destination: string) => {
        throw new Error(`unexpected-redirect:${destination}`);
      }),
    }));
    vi.doMock("@/lib/career/api/fetchCareerAliasResolution", () => ({
      fetchCareerAliasResolution: vi.fn(async ({ q }: { q: string }) => ({
        bundle_kind: "career_alias_resolution",
        resolution: {
          resolved_kind: q === "none" ? "none" : "ambiguous",
          candidates: [],
        },
      })),
    }));

    const { default: CareerResolvePage } = await import("@/app/(localized)/[locale]/career/resolve/page");
    const noResultPage = await CareerResolvePage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "none" }),
    });
    const noResultHtml = renderToStaticMarkup(noResultPage as ReactNode);
    expect(noResultHtml).toContain("career-resolve-no-result");
    expect(noResultHtml).not.toContain("career-resolve-idle-state");

    const idlePage = await CareerResolvePage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({}),
    });
    const idleHtml = renderToStaticMarkup(idlePage as ReactNode);
    expect(idleHtml).toContain("career-resolve-idle-state");
  });
});
