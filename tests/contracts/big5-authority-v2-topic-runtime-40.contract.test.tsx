import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeTopicProfileDetail, type CmsTopicProfile } from "@/lib/cms/topics";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function publishedTopic(locale: "en" | "zh-CN"): CmsTopicProfile {
  return normalizeTopicProfileDetail(
    {
      id: locale === "en" ? 401 : 402,
      org_id: 0,
      topic_code: "big-five",
      slug: "big-five",
      locale,
      title: locale === "en" ? "Backend Big Five Topic" : "后端大五人格主题",
      subtitle: locale === "en" ? "Backend subtitle" : "后端副标题",
      excerpt: locale === "en" ? "Backend excerpt" : "后端摘要",
      status: "published",
      is_public: true,
      is_indexable: false,
    },
    [
      {
        section_key: "overview",
        title: locale === "en" ? "Backend overview" : "后端概览",
        render_variant: "rich_text",
        body_md: locale === "en" ? "Backend section body." : "后端正文内容。",
        sort_order: 10,
        is_enabled: true,
      },
    ],
    {},
    null,
  );
}

async function importTopicPage(options: {
  topic?: CmsTopicProfile | null;
  detailError?: Error;
}) {
  const connection = vi.fn(async () => undefined);
  const getTopicBySlug = vi.fn(async () => {
    if (options.detailError) {
      throw options.detailError;
    }

    return options.topic ?? null;
  });
  const getTopicSeoBySlug = vi.fn(async () => null);
  const notFound = vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  });

  vi.doMock("next/server", () => ({ connection }));
  vi.doMock("next/navigation", async () => {
    const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
    return { ...actual, notFound };
  });
  vi.doMock("@/lib/cms/topics", async () => {
    const actual = await vi.importActual<typeof import("@/lib/cms/topics")>("@/lib/cms/topics");
    return {
      ...actual,
      getTopicBySlug,
      getTopicSeoBySlug,
    };
  });

  const page = await import("@/app/(localized)/[locale]/topics/[slug]/page");
  return { page, connection, getTopicBySlug, getTopicSeoBySlug, notFound };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("BIG5-AUTHORITY-V2-TOPIC-RUNTIME-40", () => {
  it("opts Topic detail out of static/ISR HTML while retaining the bounded backend data cache", () => {
    const source = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(source).toContain('import { connection } from "next/server";');
    expect(source.match(/await connection\(\);/g)).toHaveLength(2);
    expect(source).not.toContain('dynamic = "force-static"');
    expect(source).toContain("export const revalidate = 300;");
    expect(source).toContain("loadTopicPublicDetailBundle(slug, locale)");
  });

  it.each([
    ["en", "Backend Big Five Topic", "Backend section body."],
    ["zh", "后端大五人格主题", "后端正文内容。"],
  ] as const)("renders the published %s backend payload instead of the loading shell", async (locale, title, body) => {
    const topic = publishedTopic(locale === "zh" ? "zh-CN" : "en");
    const { page, connection, getTopicBySlug, getTopicSeoBySlug } = await importTopicPage({ topic });
    const element = await page.default({
      params: Promise.resolve({ locale, slug: "big-five" }),
    });
    const html = renderToStaticMarkup(element as ReactNode);

    expect(connection).toHaveBeenCalledOnce();
    expect(getTopicBySlug).toHaveBeenCalledWith("big-five", locale);
    expect(getTopicSeoBySlug).toHaveBeenCalledWith("big-five", locale);
    expect(html).toContain(title);
    expect(html).toContain(body);
    expect(html).not.toContain("data-public-content-loading");
  });

  it("fails closed through not-found when backend authority has no public Topic", async () => {
    const { page, connection, getTopicSeoBySlug, notFound } = await importTopicPage({ topic: null });

    await expect(page.default({
      params: Promise.resolve({ locale: "en", slug: "big-five" }),
    })).rejects.toThrow("NEXT_NOT_FOUND");

    expect(connection).toHaveBeenCalledOnce();
    expect(getTopicSeoBySlug).not.toHaveBeenCalled();
    expect(notFound).toHaveBeenCalledOnce();
  });

  it("preserves transient backend exceptions for the Topic error boundary", async () => {
    const backendError = new Error("TOPIC_BACKEND_TIMEOUT");
    const { page, connection, getTopicSeoBySlug, notFound } = await importTopicPage({ detailError: backendError });

    await expect(page.default({
      params: Promise.resolve({ locale: "zh", slug: "big-five" }),
    })).rejects.toBe(backendError);

    expect(connection).toHaveBeenCalledOnce();
    expect(getTopicSeoBySlug).not.toHaveBeenCalled();
    expect(notFound).not.toHaveBeenCalled();
    expect(read("app/(localized)/[locale]/topics/error.tsx")).toContain('surface="topics"');
  });

  it("keeps zh/en Topic content backend-authoritative without a local Big Five editorial fallback", () => {
    const pageSource = read("app/(localized)/[locale]/topics/[slug]/page.tsx");
    const adapterSource = read("lib/cms/topics.ts");

    expect(pageSource).toContain('from "@/lib/cms/topics"');
    expect(pageSource).not.toMatch(/Big Five[^\n]*(?:guide|overview|trait|OCEAN)/i);
    expect(pageSource).not.toContain("大五人格指南");
    expect(adapterSource).toContain("/v0.5/topics/");
    expect(adapterSource).toContain("isAuthoritativePublicAbsence");
  });
});
