import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getCmsArticle, getCmsArticleSeo } from "@/lib/cms/articles";
import { getInterpretationGuide, getSupportArticle } from "@/lib/cms/supportTrust";
import { getResearchReport } from "@/lib/research/reports";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function errorResponse(status: number, errorCode: string): Response {
  return new Response(JSON.stringify({ error_code: errorCode, message: "backend detail" }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const detailLoaders = [
  ["article", () => getCmsArticle("public-read-stability", "en")],
  ["article seo", () => getCmsArticleSeo("public-read-stability", "en")],
  ["research", () => getResearchReport("public-read-stability", "en")],
  ["support article", () => getSupportArticle("public-read-stability", "en")],
  ["interpretation guide", () => getInterpretationGuide("public-read-stability", "en")],
] as const;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("editorial public read stability", () => {
  it.each(detailLoaders)("preserves %s transient failures as typed public read errors", async (_name, load) => {
    vi.stubGlobal("fetch", vi.fn(async () => errorResponse(503, "UPSTREAM_UNAVAILABLE")));

    await expect(load()).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "transient",
      retryable: true,
      authoritativeAbsence: false,
    });
  });

  it.each(detailLoaders)("keeps %s authoritative 404 as absence", async (_name, load) => {
    vi.stubGlobal("fetch", vi.fn(async () => errorResponse(404, "NOT_FOUND")));

    await expect(load()).resolves.toBeNull();
  });

  it("keeps explicit unpublished authority as absence", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => errorResponse(404, "CONTENT_UNPUBLISHED")));

    await expect(getCmsArticle("held-article", "en")).resolves.toBeNull();
  });

  it("does not turn a validation or contract failure into not found", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => errorResponse(422, "VALIDATION_ERROR")));

    await expect(getResearchReport("public-read-stability", "en")).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "contract",
      authoritativeAbsence: false,
    });
  });

  it.each([
    "app/(localized)/[locale]/articles/[slug]/page.tsx",
    "app/(localized)/[locale]/research/[slug]/page.tsx",
    "app/(localized)/[locale]/support/articles/[slug]/page.tsx",
    "app/(localized)/[locale]/support/guides/[slug]/page.tsx",
  ])("lets %s transient detail failures reach the route error boundary", (pagePath) => {
    const source = read(pagePath);

    expect(source).not.toContain(".catch(() => null)");
    expect(source).toContain("notFound()");
  });

  it.each([
    "lib/cms/articles.ts",
    "lib/research/reports.ts",
    "lib/cms/supportTrust.ts",
  ])("uses classified public reads in %s", (adapterPath) => {
    const source = read(adapterPath);

    expect(source).toContain("getPublic");
    expect(source).toContain("isAuthoritativePublicAbsence");
    expect(source).not.toContain("instanceof ApiError");
  });
});
