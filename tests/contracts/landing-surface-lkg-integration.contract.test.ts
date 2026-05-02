import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiError } from "@/lib/api-client";
import { clearLastKnownGoodForTests } from "@/lib/cms/last-known-good";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

const payloads = vi.hoisted(() => {
  const homePayload = {
    hero: {
      eyebrow: "CMS",
      brand: "FermatMind",
      title: "Fresh home",
      subhead: "Fresh subhead",
      body: "Fresh body",
      primaryCta: "Start",
      primaryHref: "/tests",
      secondaryCta: "Learn",
      secondaryHref: "/about",
      tertiaryCta: "Career",
      tertiaryHref: "/career",
      trustRail: [],
    },
    quickStart: { kicker: "Q", title: "Quick", body: "Body", items: [] },
    families: { kicker: "F", title: "Families", body: "Body", items: [] },
    results: { kicker: "R", title: "Results", body: "Body", exampleLabel: "Example", exampleHref: "/personality", previews: [] },
    trust: { kicker: "T", title: "Trust", body: "Body", methodHref: "/help", methodLabel: "Help", items: [] },
    secondaryExplore: { kicker: "S", title: "Secondary", items: [] },
    header: { testsLabel: "Tests", testsTitle: "Tests", testsBody: "Body", browseAllLabel: "All", browseAllHref: "/tests", groups: [] },
    footer: { groups: [], supportEmailLabel: "Support", tailnote: "Tail" },
    seo: {
      title: "Fresh home SEO",
      description: "Fresh home description",
      quickStartListTitle: "Quick",
      quickStartListDescription: "Quick description",
      familyListTitle: "Families",
      familyListDescription: "Families description",
      organizationDescription: "Org",
    },
  };

  const testsPayload = {
    seo: { title: "Fresh tests", description: "Fresh tests description" },
    hero: {
      eyebrow: "Tests",
      title: "Tests hub",
      body: "Tests body",
      primaryLabel: "Start",
      primaryHref: "#start",
      secondaryLabel: "Browse",
      secondaryHref: "#browse",
      previewLabel: "Preview",
      previewTitle: "Preview title",
      previewBody: "Preview body",
      previewFlow: [],
      previewFamilies: [],
    },
    quickStart: { kicker: "Q", title: "Quick", body: "Body", items: [] },
    families: { kicker: "F", title: "Families", body: "Body", items: [] },
    howToChoose: { kicker: "H", title: "How", body: "Body", items: [] },
    trust: { title: "Trust", items: [] },
    resources: { kicker: "R", title: "Resources", body: "Body", items: [], allHref: "/articles", allLabel: "All" },
    finalCta: { title: "Final", body: "Body", primaryLabel: "Start", primaryHref: "#start", secondaryLabel: "Browse", secondaryHref: "#browse" },
  };

  const categoryPayload = {
    slug: "personality",
    seo: { title: "Personality tests", description: "Personality tests description" },
    breadcrumb: [],
    hero: { eyebrow: "Category", title: "Personality", body: "Body", points: [] },
    featured: { kicker: "F", title: "Featured", body: "Body", items: [] },
    allTests: { kicker: "A", title: "All", body: "Body", items: [] },
    differences: { kicker: "D", title: "Differences", body: "Body", items: [] },
    resources: { kicker: "R", title: "Resources", body: "Body", items: [] },
    trust: { title: "Trust", items: [] },
    finalCta: { title: "Final", body: "Body", primaryLabel: "Start", primaryHref: "/tests" },
  };

  const careerPayload = {
    seo: { title: "Career", description: "Career description" },
    hero: { eyebrow: "Career", title: "Career center", body: "Career body" },
    pathways: [],
    support: { title: "Support", links: [] },
  };

  return { homePayload, testsPayload, categoryPayload, careerPayload };
});

const landingMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/cms/landing-surfaces", () => ({
  getCmsLandingSurfaceWithLastKnownGood: landingMock,
}));

function freshSurface(payloadJson: unknown) {
  return {
    value: {
      payloadJson,
      isPublic: true,
      surfaceKey: "mock",
      locale: "en",
      title: null,
      description: null,
      schemaVersion: "test",
      status: "published",
      isIndexable: true,
      publishedAt: null,
      scheduledAt: null,
      pageBlocks: [],
    },
    source: "fresh",
    stale: false,
    updatedAt: "2026-04-19T00:00:00.000Z",
    error: null,
  };
}

describe("landing surface last-known-good integration", () => {
  beforeEach(() => {
    vi.resetModules();
    landingMock.mockReset();
  });

  afterEach(() => {
    clearLastKnownGoodForTests();
    vi.unstubAllGlobals();
  });

  it("routes high-traffic marketing content adapters through the LKG landing surface wrapper", () => {
    expect(read("lib/marketing/homepageContent.ts")).toContain("getCmsLandingSurfaceWithLastKnownGood");
    expect(read("lib/marketing/testsHubContent.ts")).toContain("getCmsLandingSurfaceWithLastKnownGood");
    expect(read("lib/marketing/careerCenterContent.ts")).toContain("getCmsLandingSurfaceWithLastKnownGood");
  });

  it("reads homepage, tests hub, tests category, and career center payloads from the wrapper value", async () => {
    landingMock.mockImplementation(async (surfaceKey: string) => {
      if (surfaceKey === "home") return freshSurface(payloads.homePayload);
      if (surfaceKey === "tests") return freshSurface(payloads.testsPayload);
      if (surfaceKey === "tests_category_personality") return freshSurface(payloads.categoryPayload);
      if (surfaceKey === "career_home") return freshSurface(payloads.careerPayload);
      throw new Error(`unexpected surface ${surfaceKey}`);
    });

    const [{ getHomePageContent }, { getTestsHubContent, getTestsCategoryContent }, { getCareerCenterContent }] =
      await Promise.all([
        import("@/lib/marketing/homepageContent"),
        import("@/lib/marketing/testsHubContent"),
        import("@/lib/marketing/careerCenterContent"),
      ]);

    await expect(getHomePageContent("en")).resolves.toMatchObject({ hero: { title: "Fresh home" } });
    await expect(getTestsHubContent("en")).resolves.toMatchObject({ seo: { title: "Fresh tests" } });
    await expect(getTestsCategoryContent("en", "personality")).resolves.toMatchObject({
      slug: "personality",
      seo: { title: "Personality tests" },
    });
    await expect(getCareerCenterContent("en")).resolves.toMatchObject({ hero: { title: "Career center" } });
  });

  it("does not serve stale landing surfaces for permanent backend publication errors", async () => {
    vi.doUnmock("@/lib/cms/landing-surfaces");
    vi.resetModules();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ ok: true, surface: apiSurface(payloads.homePayload) }))
      .mockResolvedValueOnce(jsonResponse({ message: "not found" }, 404));
    vi.stubGlobal("fetch", fetchMock);

    const { getCmsLandingSurfaceWithLastKnownGood } = await import("@/lib/cms/landing-surfaces");

    await expect(getCmsLandingSurfaceWithLastKnownGood("home", "en")).resolves.toMatchObject({
      source: "fresh",
      value: {
        status: "published",
        isPublic: true,
      },
    });

    await expect(getCmsLandingSurfaceWithLastKnownGood("home", "en")).rejects.toMatchObject({
      status: 404,
    } satisfies Partial<ApiError>);
  });

  it("keeps stale landing surfaces only for transient backend failures", async () => {
    vi.doUnmock("@/lib/cms/landing-surfaces");
    vi.resetModules();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ ok: true, surface: apiSurface(payloads.homePayload) }))
      .mockResolvedValueOnce(jsonResponse({ message: "temporary failure" }, 503));
    vi.stubGlobal("fetch", fetchMock);

    const { getCmsLandingSurfaceWithLastKnownGood } = await import("@/lib/cms/landing-surfaces");

    await expect(getCmsLandingSurfaceWithLastKnownGood("home", "en")).resolves.toMatchObject({
      source: "fresh",
    });
    await expect(getCmsLandingSurfaceWithLastKnownGood("home", "en")).resolves.toMatchObject({
      source: "last-known-good",
      stale: true,
      value: {
        payloadJson: payloads.homePayload,
      },
    });
  });
});

function apiSurface(payloadJson: unknown) {
  return {
    surface_key: "home",
    locale: "en",
    title: "Home",
    description: "Home description",
    schema_version: "test",
    payload_json: payloadJson,
    status: "published",
    is_public: true,
    is_indexable: true,
    published_at: "2026-04-19T00:00:00.000Z",
    scheduled_at: null,
    page_blocks: [],
  };
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
