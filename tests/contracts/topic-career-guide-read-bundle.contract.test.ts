import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCareerGuideFromCmsBySlug,
  getCareerGuideSeoFromCmsBySlug,
} from "@/lib/cms/career-guides";
import { loadPublicDetailBundle } from "@/lib/cms/publicDetailBundle";
import { getTopicBySlug, getTopicSeoBySlug } from "@/lib/cms/topics";

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

const publicReaders = [
  ["topic detail", () => getTopicBySlug("bundle-topic", "en")],
  ["topic seo", () => getTopicSeoBySlug("bundle-topic", "en")],
  ["career guide detail", () => getCareerGuideFromCmsBySlug("bundle-guide", "en")],
  ["career guide seo", () => getCareerGuideSeoFromCmsBySlug("bundle-guide", "en")],
] as const;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("topic and career-guide public detail bundles", () => {
  it("does not issue an SEO read after authoritative detail absence", async () => {
    const readDetail = vi.fn(async () => null);
    const readSeo = vi.fn(async () => ({ title: "unused" }));

    await expect(loadPublicDetailBundle({ readDetail, readSeo })).resolves.toEqual({
      detail: null,
      seo: null,
    });
    expect(readDetail).toHaveBeenCalledOnce();
    expect(readSeo).not.toHaveBeenCalled();
  });

  it("returns detail and SEO together without swallowing SEO failures", async () => {
    const detail = { slug: "stable-detail" };
    const seo = { title: "Stable detail" };

    await expect(loadPublicDetailBundle({
      readDetail: async () => detail,
      readSeo: async () => seo,
    })).resolves.toEqual({ detail, seo });

    await expect(loadPublicDetailBundle({
      readDetail: async () => detail,
      readSeo: async () => {
        throw new Error("seo unavailable");
      },
    })).rejects.toThrow("seo unavailable");
  });

  it.each(publicReaders)("preserves %s transient failures as typed retryable errors", async (_name, load) => {
    vi.stubGlobal("fetch", vi.fn(async () => errorResponse(503, "UPSTREAM_UNAVAILABLE")));

    await expect(load()).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "transient",
      retryable: true,
      authoritativeAbsence: false,
    });
  });

  it.each(publicReaders)("keeps %s authoritative absence on the not-found path", async (_name, load) => {
    vi.stubGlobal("fetch", vi.fn(async () => errorResponse(404, "NOT_FOUND")));

    await expect(load()).resolves.toBeNull();
  });

  it.each([
    [
      "app/(localized)/[locale]/topics/[slug]/page.tsx",
      "loadTopicPublicDetailBundle",
      "getTopicBySlug(slug, locale)",
      "getTopicSeoBySlug(slug, locale)",
    ],
    [
      "app/(localized)/[locale]/career/guides/[slug]/page.tsx",
      "loadCareerGuidePublicDetailBundle",
      "getCareerGuideFromCmsBySlug(slug, locale)",
      "getCareerGuideSeoFromCmsBySlug(slug, locale)",
    ],
  ])("shares one cached %s detail/SEO bundle across metadata and page rendering", (
    pagePath,
    loaderName,
    detailRead,
    seoRead
  ) => {
    const source = read(pagePath);

    expect(source).toContain(`const ${loaderName} = cache(`);
    expect(source.match(new RegExp(`${loaderName}\\(slug, locale\\)`, "g"))).toHaveLength(2);
    expect(source.match(new RegExp(detailRead.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).toHaveLength(1);
    expect(source.match(new RegExp(seoRead.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).toHaveLength(1);
    expect(source).not.toContain(".catch(() => null)");
  });
});
