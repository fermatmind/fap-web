import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function linkBlock(source: string, hrefMarker: string): string {
  const hrefIndex = source.indexOf(hrefMarker);
  expect(hrefIndex).toBeGreaterThanOrEqual(0);
  const linkStart = source.lastIndexOf("<Link", hrefIndex);
  const linkEnd = source.indexOf("</Link>", hrefIndex);
  expect(linkStart).toBeGreaterThanOrEqual(0);
  expect(linkEnd).toBeGreaterThan(hrefIndex);
  return source.slice(linkStart, linkEnd + "</Link>".length);
}

describe("personality public link prefetch budget", () => {
  const bigFive = read("components/personality/BigFiveHubContentScaffold.tsx");
  const enneagram = read("components/personality/EnneagramHubContentScaffold.tsx");
  const renderer = read("components/personality/PublicContentAssetRenderer.tsx");

  it("opts repeated Big Five dimension and continue-browsing grids out of automatic prefetch", () => {
    expect(bigFive.match(/prefetch=\{false\}/g)).toHaveLength(5);
    expect(linkBlock(bigFive, "href={href}")).toContain("prefetch={false}");
    expect(linkBlock(bigFive, "big-five/${dim.slug}")).toContain("prefetch={false}");
    expect(linkBlock(bigFive, "big-five/${item.dim}")).toContain("prefetch={false}");
    expect(linkBlock(bigFive, "key={href}")).toContain("prefetch={false}");
  });

  it("opts repeated Enneagram type and continue-browsing grids out of automatic prefetch", () => {
    expect(enneagram.match(/prefetch=\{false\}/g)).toHaveLength(3);
    expect(linkBlock(enneagram, "type-${t.n}")).toContain("prefetch={false}");
    expect(linkBlock(enneagram, "type-${item.n}")).toContain("prefetch={false}");
    expect(linkBlock(enneagram, "key={href}")).toContain("prefetch={false}");
  });

  it("opts CMS-authored related-link grids out while retaining the primary test action", () => {
    expect(renderer.match(/prefetch=\{false\}/g)).toHaveLength(1);
    expect(linkBlock(renderer, "href={item.href}")).toContain("prefetch={false}");
    expect(linkBlock(renderer, "href={testCta.href}")).not.toContain("prefetch={false}");
  });

  it("retains default prefetch for the two hub primary actions", () => {
    expect(linkBlock(bigFive, "tests/big-five-personality-test-ocean-model")).not.toContain("prefetch={false}");
    expect(linkBlock(enneagram, "href={`/${locale}/personality/enneagram/type-1`}")).not.toContain(
      "prefetch={false}"
    );
  });
});
