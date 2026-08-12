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
        expect.objectContaining({ source: "/support", destination: "/zh/support", permanent: true }),
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

  it("keeps GSC legacy redirects exact without cross-locale editorial substitution", async () => {
    const redirects = await loadRedirects();

    const retiredCrossLocaleEditorialSources = [
      "/en/articles/big-five-growth-guide",
      "/en/articles/mbti-basics",
      "/en/articles/iq-test-growth-guide",
      "/en/career/guides/from-mbti-to-job-fit",
      "/en/career/guides/cross-industry-move-strategy",
      "/en/career/guides/networking-that-actually-works",
    ];
    expect(
      redirects.filter((redirect) => retiredCrossLocaleEditorialSources.includes(redirect.source))
    ).toEqual([]);

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/en/career/tests/riasec",
          destination: "/en/tests/holland-career-interest-test-riasec",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/zh/career/tests/riasec",
          destination: "/zh/tests/holland-career-interest-test-riasec",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/zh/career/jobs/lawyer",
          destination: "/zh/career/jobs/lawyers",
          permanent: true,
        }),
      ])
    );
  });

  it("does not redirect bot probe paths from GSC 404 samples", async () => {
    const redirects = await loadRedirects();

    expect(redirects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "/index.php" }),
        expect.objectContaining({ source: "/auth.php" }),
        expect.objectContaining({ source: "/free-test.php" }),
        expect.objectContaining({ source: "/resources.php" }),
        expect.objectContaining({ source: "/terms.php" }),
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

  it("redirects the indexed zh Enneagram test alias to its canonical detail in one hop", async () => {
    const redirects = await loadRedirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/zh/tests/enneagram-personality-test",
          destination: "/zh/tests/enneagram-personality-test-nine-types",
          permanent: true,
        }),
      ])
    );
    expect(
      redirects.filter((redirect) => redirect.source === "/zh/tests/enneagram-personality-test")
    ).toHaveLength(1);
  });
});
