import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

type RedirectRule = {
  source: string;
  destination: string;
  permanent?: boolean;
  statusCode?: number;
};

async function loadRedirects(): Promise<RedirectRule[]> {
  const configUrl = pathToFileURL(path.join(ROOT, "next.config.mjs")).href;
  const { default: nextConfig } = (await import(`${configUrl}?redirects=${Date.now()}`)) as {
    default: { redirects: () => Promise<RedirectRule[]> };
  };

  return nextConfig.redirects();
}

describe("legacy redirect hygiene contract", () => {
  it("routes industry compatibility aliases directly to the same-locale canonical directory", async () => {
    const redirects = await loadRedirects();
    for (const [alias, canonical] of [
      ["design", "arts-and-design"],
      ["technology", "computer-and-information-technology"],
    ]) {
      const rules = redirects.filter((rule) => rule.source === `/:locale(en|zh)/career/industries/${alias}`);
      expect(rules).toEqual([{
        source: `/:locale(en|zh)/career/industries/${alias}`,
        destination: `/:locale/career/industries/${canonical}`,
        permanent: true,
      }]);
    }
  });

  it("routes refund and help legacy paths directly to live support destinations", async () => {
    const redirects = await loadRedirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "/support", destination: "/zh/support", permanent: true }),
        expect.objectContaining({ source: "/refund", destination: "/en/support", permanent: true }),
        expect.objectContaining({ source: "/en/refund", destination: "/en/support", permanent: true }),
        expect.objectContaining({ source: "/zh/refund", destination: "/zh/support", permanent: true }),
        expect.objectContaining({ source: "/help/about", destination: "/en/support", permanent: true }),
        expect.objectContaining({ source: "/help/team", destination: "/en/support", permanent: true }),
        expect.objectContaining({ source: "/help/used-and-mentioned", destination: "/en/support", permanent: true }),
      ])
    );

    for (const slug of ["about", "team", "used-and-mentioned"]) {
      expect(redirects.some((rule) => rule.source === `/zh/help/${slug}`)).toBe(false);
    }
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

  it("migrates only the seven verified historical test URLs directly with 301 before the root locale redirect", async () => {
    const redirects = await loadRedirects();
    const rootFallbackIndex = redirects.findIndex((rule) => rule.source === "/tests/:path*");
    for (const [source, slug] of [
      ["/en/tests/mbti-personality-test-16-personality-types-MBTI", "mbti-personality-test-16-personality-types"],
      ["/tests/mbti-personality-test-16-personality-types-MBTI", "mbti-personality-test-16-personality-types"],
      ["/tests/big-five-personality-test-ocean-model-大五人格", "big-five-personality-test-ocean-model"],
      ["/tests/enneagram-personality-test-nine-types-九型人格", "enneagram-personality-test-nine-types"],
      ["/tests/eq-test-emotional-intelligence-assessment-情商测试", "eq-test-emotional-intelligence-assessment"],
      ["/tests/holland-career-interest-test-riasec-霍兰德职业兴趣测试", "holland-career-interest-test-riasec"],
      ["/tests/iq-test-intelligence-quotient-assessment-智商测试", "iq-test-intelligence-quotient-assessment"],
    ]) {
      const encodedSource = encodeURI(source);
      expect(redirects.filter((rule) => rule.source === encodedSource)).toEqual([{
        source: encodedSource,
        destination: `/en/tests/${slug}`,
        statusCode: 301,
      }]);
      expect(redirects.findIndex((rule) => rule.source === encodedSource)).toBeLessThan(rootFallbackIndex);
    }
    expect(redirects.some((rule) => rule.source.includes("tests/") && rule.source.includes("大五人格"))).toBe(false);
    expect(redirects.some((rule) => rule.source === "/tests/:slug-:suffix")).toBe(false);
  });

  it("keeps the five historical RIASEC articles absent without an evidenced equivalent publication", async () => {
    const redirects = await loadRedirects();
    for (const slug of [
      "what-is-holland-code-career-interest-test",
      "what-is-riasec-holland-card-career-interest-test",
      "what-is-riasec-holland-code-career-interest-filter",
      "what-is-riasec-holland-code-career-interest-target",
      "what-riasec-holland-code-career-interest-test",
    ]) {
      expect(redirects.some((rule) => rule.source === `/en/articles/${slug}`)).toBe(false);
    }
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
