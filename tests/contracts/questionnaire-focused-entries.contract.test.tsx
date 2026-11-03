import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("Focused DISC and cognitive routes preserve the published landing", () => {
  it.each(["disc", "cognitive-functions-test"])("preserves both locales' complete body, links and metadata for %s", async slug => {
    const legacy = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const focused = slug === "disc" ? await import("@/app/(localized)/[locale]/tests/explore/disc/page") : await import("@/app/(localized)/[locale]/tests/explore/cognitive-functions-test/page");
    for (const locale of ["en", "zh"]) {
      const params = Promise.resolve({ locale, slug });
      const original = document.createElement("div"), candidate = document.createElement("div");
      original.innerHTML = renderToStaticMarkup(await legacy.default({ params }));
      candidate.innerHTML = renderToStaticMarkup(await focused.default({ params }));
      const text = (root: HTMLElement) => [...root.querySelectorAll("h1,h2,h3,p,li")].map(node => node.textContent);
      expect(text(candidate)).toEqual(text(original));
      const links = (root: HTMLElement) => [...root.querySelectorAll("a")].map(node => [node.getAttribute("href"), node.textContent]);
      expect(links(candidate)).toEqual(links(original));
      expect(await focused.generateMetadata({ params })).toEqual(await legacy.generateMetadata({ params }));
      expect(candidate.querySelectorAll("main")).toHaveLength(1);
    }
  });
});
