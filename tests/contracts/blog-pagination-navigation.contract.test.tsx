import { fireEvent, render } from "@testing-library/react";
import type { NextRouter } from "next/router";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import { describe, expect, it, vi } from "vitest";
import { BlogArchiveView } from "@/components/articles/BlogArchiveView";
import { blogArchiveMetadata, type BlogArchiveState } from "@/lib/content/blogArchive";

vi.hoisted(() => { process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com"; });
const state: BlogArchiveState = { failed: false, stale: false, data: { items: [], landingSurface: null,
  pagination: { currentPage: 2, perPage: 20, total: 60, lastPage: 3 },
  blog: { configurationState: "published", isIndexable: false, title: "Blog", description: "Description", featuredItems: [],
    categories: [{ slug: "career-exploration", name: "Career", lineKey: "career-and-learning", description: "Description", articleCount: 60 }] } } };
vi.mock("@/lib/cms/articles", async original => ({ ...await original<typeof import("@/lib/cms/articles")>(),
  getCmsArticlesWithLastKnownGood: vi.fn(async () => ({ value: state.data, stale: false })) }));

for (const locale of ["en", "zh"] as const) {
  describe(`${locale} archive pagination navigation`, () => {
    it("resolves the server title and canonical on each page while preserving the CMS hold", async () => {
      for (const page of [1, 2, 1]) {
        const meta = await blogArchiveMetadata(locale, page === 1 ? {} : { page: String(page) });
        const title = page === 1 ? "Blog" : `Blog · ${locale === "zh" ? "第 2 页" : "Page 2"}`;
        expect(meta.title).toBe(title);
        expect(meta.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/articles${page === 1 ? "" : "?page=2"}`);
        expect(meta.robots).toMatchObject({ index: false, follow: true });
        expect(meta.alternates?.languages).toBeUndefined();
      }
    });
    it.each(["", "career-exploration"])("lets the browser load each public pagination document (%s)", category => {
      const push = vi.fn();
      const router = { pathname: `/${locale}/articles`, asPath: `/${locale}/articles`, locale,
        push, replace: vi.fn(), prefetch: vi.fn().mockResolvedValue(undefined), beforePopState: vi.fn() } as unknown as NextRouter;
      let preventedByPagination: boolean | undefined;
      // Prevent JSDOM navigation only after observing the link's own behavior.
      const { container } = render(<RouterContext.Provider value={router}>
        <div onClick={event => { preventedByPagination = event.defaultPrevented; event.preventDefault(); }}>
          <BlogArchiveView locale={locale} state={state} page={2} category={category} />
        </div>
      </RouterContext.Provider>);
      const base = `/${locale}/articles${category ? `/category/${category}` : ""}`;
      for (const [rel, href] of [["prev", base], ["next", `${base}?page=3`]]) {
        const link = container.querySelector(`nav a[rel="${rel}"]`)!;
        expect(link).toHaveAttribute("href", href);
        fireEvent.click(link);
        expect(preventedByPagination).toBe(false);
        expect(push).not.toHaveBeenCalled();
      }
    });
    it.each(["", "career-exploration"])("keeps private preview pagination in its authenticated layout (%s)", category => {
      const onNavigate = vi.fn();
      let preventedByPagination: boolean | undefined;
      const { container } = render(<div onClick={event => { preventedByPagination = event.defaultPrevented; event.preventDefault(); }}>
        <BlogArchiveView locale={locale} state={state} category={category} page={2} preview onNavigate={onNavigate} />
      </div>);
      for (const [rel, page] of [["prev", 1], ["next", 3]] as const) {
        fireEvent.click(container.querySelector(`nav a[rel="${rel}"]`)!);
        expect(preventedByPagination).toBe(true);
        expect(onNavigate).toHaveBeenLastCalledWith(category, page);
      }
      expect(onNavigate).toHaveBeenCalledTimes(2);
    });
  });
}
