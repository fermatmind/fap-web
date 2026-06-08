import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ContentPage } from "@/lib/cms/content-pages";

const getContentPageMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/cms/content-pages", () => ({
  getContentPage: getContentPageMock,
  buildContentPagePath: (slug: string, locale: "en" | "zh") => `/${locale}/help/${slug.replace(/^help-/, "")}`,
}));

function makeHelpPage(overrides: Partial<ContentPage> = {}): ContentPage {
  return {
    slug: "help-unlock-failure",
    path: "/help/unlock-failure",
    kind: "help",
    title: "Unlock failure",
    kicker: "Help",
    summary: "What to do when unlock fails.",
    template: "help",
    animationProfile: "none",
    locale: "en",
    publishedAt: "2026-06-08",
    updatedAt: "2026-06-08",
    effectiveAt: null,
    sourceDoc: "HELP-SERVICE-CONTENT-DRAFTS-01",
    isPublic: true,
    isIndexable: false,
    headings: [],
    contentMd: "",
    contentHtml: "",
    seoTitle: null,
    metaDescription: null,
    faqItems: [],
    schemaEnabled: false,
    supportContact: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
  getContentPageMock.mockReset();
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("Help page noindex runtime", () => {
  it("uses backend ContentPage isIndexable=false for Help detail metadata robots", async () => {
    getContentPageMock.mockResolvedValueOnce(makeHelpPage({ isIndexable: false }));

    const { generateMetadata } = await import("@/app/(localized)/[locale]/help/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "unlock-failure" }),
    });

    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
      nocache: true,
      noarchive: true,
    });
  });

  it("allows Help detail metadata to index only when backend ContentPage isIndexable=true", async () => {
    getContentPageMock.mockResolvedValueOnce(makeHelpPage({ isIndexable: true }));

    const { generateMetadata } = await import("@/app/(localized)/[locale]/help/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "unlock-failure" }),
    });

    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
    });
  });
});
