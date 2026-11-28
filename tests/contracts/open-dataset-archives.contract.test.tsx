import fs from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { HomePublicLinks } from "@/components/marketing/HomePublicLinks";
import { OPEN_DATASET_ARCHIVES, showsHomePublicLinks, withOpenDatasetSameAs } from "@/lib/site/openDatasetArchives";

const route = vi.hoisted(() => ({ pathname: "/en" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

const locales = ["zh", "en", "zh-TW"] as const;
describe("open dataset archives: exact route boundary", () => {
  it.each(locales)("puts seven datasets before the platform links on the %s homepage", locale => {
    route.pathname = `/${locale}`;
    const view = render(<HomePublicLinks locale={locale} />);
    const datasets = view.container.querySelectorAll('[data-home-link-kind="dataset"]');
    expect(datasets).toHaveLength(7);
    expect(view.container.querySelector('[data-home-public-links]')).toBeInTheDocument();
    expect(view.container.querySelectorAll("button,h2")).toHaveLength(0);
    for (const [i, item] of [...datasets].entries()) {
      const anchor = item.querySelector("a");
      expect(anchor).toHaveAttribute("href", OPEN_DATASET_ARCHIVES[i].href);
      expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
      expect(item.querySelectorAll("img,script")).toHaveLength(0);
    }
    const kinds = [...view.container.querySelectorAll("[data-home-link-kind]")].map(item => item.getAttribute("data-home-link-kind"));
    expect(kinds.slice(0, 7)).toEqual(Array(7).fill("dataset"));
    expect(kinds.slice(7)).toEqual(Array(9).fill("platform"));
    view.unmount();
  });
  it.each(locales)("does not leak archives or directory links to %s controls", locale => {
    for (const path of ["/science", "/about", "/datasets", "/tests/mbti-personality-test", "/tests/mbti-personality-test-16-personality-types", "/career/tests", "/career-compare/electrical-engineers-vs-electricians", "/tests/explore/global-history-quiz/results/isaac-newton", "/tests/explore/global-history-quiz/cox-1926", "/datasets/occupations", "/datasets/not-allowed", "/about/team"]) {
      route.pathname = `/${locale}${path}`;
      const view = render(<HomePublicLinks locale={locale} />);
      expect(view.container.querySelector("[data-home-public-links]")).toBeNull();
      expect(view.container.querySelectorAll("a")).toHaveLength(0);
      expect(screen.queryByText("Twelve Tools ↗")).toBeNull();
      expect(screen.queryByAltText("Featured on SaaSBison")).toBeNull();
      view.unmount();
    }
  });
  it.each(locales)("preserves every existing homepage platform in %s", locale => {
    route.pathname = `/${locale}`;
    const view = render(<HomePublicLinks locale={locale} />);
    for (const platform of ["Startup Fame", "Product Hunt", "SaaSHub", "VibeCafé", "Zearches", "Outbring", "CareerFlora"]) {
      const href = platform === "Startup Fame" ? "https://startupfa.me/s/fermatmind?utm_source=fermatmind.com" : null;
      expect(href ? view.container.querySelector(`a[href="${href}"]`) : screen.getByRole("link", { name: new RegExp(platform === "SaaSHub" || platform === "Product Hunt" ? platform : `${platform}`) })).toBeInTheDocument();
    }
    expect(view.container.querySelectorAll('a[href="https://twelve.tools"]')).toHaveLength(1);
    expect(view.container.querySelectorAll('a[href="https://saasbison.com"]')).toHaveLength(1);
      expect(screen.getByRole("link", { name: /Twelve Tools/ })).toHaveAttribute("rel", "noopener");
      expect(screen.getByAltText("Featured on SaaSBison")).toHaveAttribute("loading", "lazy");
      expect(screen.getByAltText("Featured on SaaSBison").closest("a")).toHaveAttribute("rel", "dofollow");
    view.unmount();
  });
  it("allows the existing root Chinese homepage alias, not other locale aliases", () => {
    expect(showsHomePublicLinks("/", "zh")).toBe(true);
    expect(showsHomePublicLinks("/", "en")).toBe(false);
    expect(showsHomePublicLinks(null, "zh")).toBe(false);
    expect(showsHomePublicLinks("/zh/science", "zh")).toBe(false);
  });
  it("admits only the new traditional dataset index, not arbitrary dataset details", () => {
    expect(traditionalPath("/zh-TW/datasets")).toBe("/zh-TW/datasets");
    expect(traditionalPath("/zh-TW/datasets/unpublished")).toBeNull();
  });
  it("merges and deduplicates sameAs without removing existing links", () => {
    const data = withOpenDatasetSameAs({ "@type": "Organization", sameAs: ["https://example.org/existing", OPEN_DATASET_ARCHIVES[0].href] });
    expect(data.sameAs).toHaveLength(8);
    expect(data.sameAs).toContain("https://example.org/existing");
    expect(JSON.parse(JSON.stringify(data))["@type"]).toBe("Organization");
    for (const path of ["app/(root)/page.tsx", "app/(localized)/[locale]/page.tsx", "app/(traditional)/zh-TW/page.tsx"]) {
      expect(fs.readFileSync(path, "utf8")).toContain("withOpenDatasetSameAs");
    }
  });
});

describe("homepage-only placement", () => {
  it("has no autoplay timer or automatic scroll logic", () => {
    const source = fs.readFileSync("components/marketing/HomePublicLinks.tsx", "utf8");
    expect(source).not.toMatch(/setInterval|setTimeout|scrollBy|scrollTo|IntersectionObserver/);
  });
  it("keeps the carousel outside the shared footer and after articles", () => {
    const source = fs.readFileSync("components/marketing/HomePageExperience.tsx", "utf8");
    expect(source.indexOf("<HomePublicLinks locale={locale}")) .toBeGreaterThan(source.indexOf("<HomepageArticlesBanner locale={locale}"));
    expect(fs.readFileSync("components/layout/SiteFooter.tsx", "utf8")).not.toContain("SiteFooterPlatforms");
    expect(fs.readFileSync("components/layout/DeferredFooterFeatures.tsx", "utf8")).not.toContain("SiteFooterPlatforms");
  });
});
