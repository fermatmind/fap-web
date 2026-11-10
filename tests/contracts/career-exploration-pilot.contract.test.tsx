import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import CareerInterestPilotPage, { generateMetadata } from "@/app/(localized)/[locale]/career/interests/[code]/page";
import { CareerExplorationPilot } from "@/components/career/CareerExplorationPilot";
import { CAREER_EXPLORATION_PILOT, careerExplorationPilotPath } from "@/lib/career/explorationPilot";
import { appendCareerInterestPilotSitemapEntries, buildPublicSitemapEntries } from "@/lib/seo/publicSitemap";

afterEach(cleanup);

describe("six-page career exploration pilot", () => {
  it.each([
    ["zh", "ari", true, ["27-1021.00", "27-1024.00"]],
    ["en", "ari", true, ["27-1021.00", "27-1024.00"]],
    ["zh", "ac", false, ["27-1024.00", "27-4032.00"]],
    ["en", "ac", false, ["27-1024.00", "27-4032.00"]],
  ] as const)("%s/%s keeps official evidence, locale and indexing aligned", async (locale, code, index, socCodes) => {
    const props = { params: Promise.resolve({ locale, code }) };
    const metadata = await generateMetadata(props);
    const canonical = `https://fermatmind.com${careerExplorationPilotPath(locale, code)}`;
    expect(metadata.robots).toMatchObject({ index, follow: true });
    expect(metadata.alternates?.canonical).toBe(canonical);
    expect(metadata.alternates?.languages).toMatchObject({
      en: `https://fermatmind.com/en/career/interests/${code}`,
      "zh-CN": `https://fermatmind.com/zh/career/interests/${code}`,
    });
    expect(metadata.alternates?.languages).not.toHaveProperty("zh-TW");

    const { container } = render(await CareerInterestPilotPage(props));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(CAREER_EXPLORATION_PILOT[code].copy[locale].title);
    for (const soc of socCodes) {
      expect(screen.getByRole("link", { name: `O*NET ${soc}` })).toHaveAttribute("href", `https://www.onetonline.org/link/summary/${soc}`);
    }
    for (const job of CAREER_EXPLORATION_PILOT[code].occupations) {
      expect(screen.getByRole("link", { name: job.name[locale] })).toHaveAttribute("href", `/${locale}/career/jobs/${job.slug}`);
    }
    const jsonLd = [...container.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent!));
    expect(jsonLd.map((data) => data["@type"])).toEqual(["WebPage", "BreadcrumbList"]);
    expect(jsonLd[0].url).toBe(canonical);
  });

  it.each([["zh", "en"], ["en", "zh"]] as const)("serves the %s INTJ examples without turning them into a ranked type match", (locale, otherLocale) => {
    render(<CareerExplorationPilot locale={locale} pilot="intj" />);
    const section = within(document.getElementById("design-mbti-exploration")!);
    expect(section.getByRole("link", { name: "O*NET 27-1021.00" })).toBeInTheDocument();
    expect(section.getByRole("link", { name: "O*NET 27-1024.00" })).toBeInTheDocument();
    const links = section.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(links.some((href) => href?.startsWith(`/${otherLocale}/`))).toBe(false);
    expect(links.some((href) => href?.includes("/career/compare?"))).toBe(locale === "zh");
  });

  it.each([["zh", "ric"], ["en", "RIA"], ["zh-TW", "ari"]])("rejects the unapproved route %s/%s", async (locale, code) => {
    const props = { params: Promise.resolve({ locale, code }) };
    await expect(generateMetadata(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(CareerInterestPilotPage(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("only appends the exact indexable ARI paths to the public sitemap", () => {
    const existing = { loc: "https://fermatmind.com/zh/career", lastmod: "2026-11-10T00:00:00.000Z" };
    const backendEntries = buildPublicSitemapEntries({ items: [
      existing,
      { loc: "https://fermatmind.com/zh/career/recommendations/mbti/intj" },
      { loc: "https://fermatmind.com/en/career/interests/ac" },
    ] });
    expect(appendCareerInterestPilotSitemapEntries(backendEntries)).toEqual([
      { loc: "https://fermatmind.com/en/career/interests/ari" },
      existing,
      { loc: "https://fermatmind.com/zh/career/interests/ari" },
    ]);
  });
});
