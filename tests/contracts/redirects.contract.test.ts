import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

type RedirectRule = {
  source: string;
  destination: string;
  permanent: boolean;
};

async function loadRedirects(): Promise<RedirectRule[]> {
  const configUrl = pathToFileURL(path.join(ROOT, "next.config.mjs")).href;
  const { default: nextConfig } = (await import(`${configUrl}?redirects=${Date.now()}`)) as {
    default: { redirects: () => Promise<RedirectRule[]> };
  };

  return nextConfig.redirects();
}

describe("legacy redirect hygiene contract", () => {
  it("routes refund and help legacy paths directly to live support destinations", async () => {
    const redirects = await loadRedirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "/refund", destination: "/en/support", permanent: true }),
        expect.objectContaining({ source: "/en/refund", destination: "/en/support", permanent: true }),
        expect.objectContaining({ source: "/zh/refund", destination: "/zh/support", permanent: true }),
        expect.objectContaining({ source: "/help/about", destination: "/en/support", permanent: true }),
        expect.objectContaining({ source: "/zh/help/about", destination: "/zh/support", permanent: true }),
        expect.objectContaining({ source: "/help/team", destination: "/en/support", permanent: true }),
        expect.objectContaining({ source: "/zh/help/team", destination: "/zh/support", permanent: true }),
        expect.objectContaining({ source: "/help/used-and-mentioned", destination: "/en/support", permanent: true }),
        expect.objectContaining({ source: "/zh/help/used-and-mentioned", destination: "/zh/support", permanent: true }),
      ])
    );
  });

  it("keeps root quiz slug aliases on public test detail pages instead of noindex take pages", async () => {
    const redirects = await loadRedirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "/quiz", destination: "/en/tests", permanent: true }),
        expect.objectContaining({ source: "/quiz/:slug", destination: "/en/tests/:slug", permanent: true }),
        expect.objectContaining({ source: "/test", destination: "/en/tests", permanent: true }),
        expect.objectContaining({ source: "/test/:path*", destination: "/en/tests/:path*", permanent: true }),
      ])
    );
    expect(redirects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "/quiz/:slug", destination: "/en/quiz/:slug" }),
      ])
    );
  });
});
