import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import AriPage, { generateMetadata as ariMetadata } from "@/app/(localized)/[locale]/career/interests/ari/page";
import ReleasedInterestPage, { generateMetadata as releasedMetadata } from "@/app/(localized)/[locale]/career/interests/[code]/page";
import AcPage, { generateMetadata as acMetadata } from "@/app/(localized)/[locale]/career/interests/ac/page";
import { TraditionalCareerInterestPage, taiwanCareerInterestMetadata } from "@/components/career/TraditionalCareerInterestPage";
import { traditionalEquivalent, traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { CareerExplorationPilot } from "@/components/career/CareerExplorationPilot";
import { CAREER_EXPLORATION_PILOT, careerExplorationPilotPath } from "@/lib/career/explorationPilot";
import { appendCareerInterestPilotSitemapEntries, buildPublicSitemapEntries } from "@/lib/seo/publicSitemap";
import { getReleasedCareerInterest } from "@/lib/career/interestRelease";
import release from "@/lib/career/interestRelease.json";
import { getSiteUrlOrThrow } from "@/lib/site";

afterEach(cleanup);

describe("six-page career exploration pilot", () => {
  it.each([
    ["zh", "ari", true, ["27-1021.00", "27-1024.00"]],
    ["en", "ari", true, ["27-1021.00", "27-1024.00"]],
    ["zh", "ac", false, ["27-1024.00", "27-4032.00"]],
    ["en", "ac", false, ["27-1024.00", "27-4032.00"]],
  ] as const)("%s/%s keeps official evidence, locale and indexing aligned", async (locale, code, index, socCodes) => {
    const props = { params: Promise.resolve({ locale }) };
    const metadata = await (code === "ari" ? ariMetadata : acMetadata)(props);
    const origin = getSiteUrlOrThrow();
    const canonical = `${origin}${careerExplorationPilotPath(locale, code)}`;
    expect(metadata.robots).toMatchObject({ index, follow: true });
    expect(metadata.alternates?.canonical).toBe(canonical);
    expect(metadata.alternates?.languages).toMatchObject({
      en: `${origin}/en/career/interests/${code}`,
      "zh-CN": `${origin}/zh/career/interests/${code}`,
    });
    expect(metadata.alternates?.languages).not.toHaveProperty("zh-TW");

    const { container } = render(await (code === "ari" ? AriPage : AcPage)(props));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(CAREER_EXPLORATION_PILOT[code].copy[locale].title);
    for (const soc of socCodes) {
      expect(screen.getByRole("link", { name: `O*NET ${soc}` })).toHaveAttribute("href", `https://www.onetonline.org/link/summary/${soc}`);
    }
    for (const job of CAREER_EXPLORATION_PILOT[code].occupations) {
      expect(screen.getByRole("link", { name: job.name[locale] })).toHaveAttribute("href", `/${locale}/career/jobs/${job.slug}`);
    }
    if (code === "ari") {
      const topic = getReleasedCareerInterest(code, locale)!;
      const links = [...container.querySelectorAll<HTMLAnchorElement>(`a[href^="/${locale}/career/jobs/"]`)];
      const slugs = links.map((link) => link.getAttribute("href")!.split("/").at(-1));
      const expected = new Set([
        ...CAREER_EXPLORATION_PILOT.ari.occupations.map(({ slug }) => slug),
        ...[...topic.exact, ...topic.related].map(({ slug }) => slug),
      ]);
      expect(new Set(slugs)).toEqual(expected);
      expect(slugs).toHaveLength(expected.size);
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

  it("does not render ARI or AC outside the two pilot languages", async () => {
    const props = { params: Promise.resolve({ locale: "zh-TW" }) };
    await expect(ariMetadata(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(AcPage(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it.each(["ari", "ac"] as const)("serves the Taiwan %s guide without publishing search alternates", (code) => {
    const entry = `/zh-TW/career/interests/${code}`;
    expect(traditionalPath(`/en/career/interests/${code}`)).toBe(entry);
    expect(traditionalEquivalent(entry)).toBeNull();
    const metadata = taiwanCareerInterestMetadata(code);
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata.alternates).toEqual({ canonical: entry });

    render(<TraditionalCareerInterestPage code={code} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(`霍蘭德 ${code.toUpperCase()} 代碼`);
    expect(screen.getByRole("link", { name: "简体中文" })).toHaveAttribute("href", `/zh/career/interests/${code}`);
    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute("href", `/en/career/interests/${code}`);
    expect(screen.getByRole("link", { name: "填寫免費職涯探索紀錄" })).toHaveAttribute("href", "/zh-TW/holland-test/pdf-download#my-worksheet");
    for (const job of CAREER_EXPLORATION_PILOT[code].occupations) {
      expect(screen.getByRole("link", { name: `O*NET ${job.soc}` })).toHaveAttribute("href", `https://www.onetonline.org/link/summary/${job.soc}`);
      expect(document.querySelector(`a[href="/zh-TW/career/jobs/${job.slug}"]`)).toBeInTheDocument();
    }
  });

  it("keeps a Taiwan interest code outside the published pilot unavailable", () => {
    expect(traditionalPath("/zh-TW/career/interests/ric")).toBeNull();
  });

  it.each(["zh", "en"] as const)("serves the verified RCI candidates in %s", async (locale) => {
    const props = { params: Promise.resolve({ locale, code: "rci" }) };
    const topic = getReleasedCareerInterest("rci", locale)!;
    const metadata = await releasedMetadata(props);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe(`${getSiteUrlOrThrow()}${topic.path}`);
    render(await ReleasedInterestPage(props));
    const exact = within(document.getElementById("interest-exact")!.parentElement!);
    for (const job of topic.exact) {
      expect(exact.getByRole("link", { name: job.copy[locale].name })).toHaveAttribute("href", `/${locale}/career/jobs/${job.slug}`);
    }
  });

  it("rejects an unpublished interest code", async () => {
    await expect(ReleasedInterestPage({ params: Promise.resolve({ locale: "en", code: "si" }) }))
      .rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("appends the thirteen published topics in both languages and omits held paths", () => {
    const existing = { loc: "https://fermatmind.com/zh/career", lastmod: "2026-11-10T00:00:00.000Z" };
    const backendEntries = buildPublicSitemapEntries({ items: [
      existing,
      { loc: "https://fermatmind.com/zh/career/recommendations/mbti/intj" },
      { loc: "https://fermatmind.com/en/career/interests/ac" },
    ] });
    const topics = ["a", "ari", "c", "ce", "e", "ecs", "i", "irc", "r", "rc", "rci", "ric", "s"];
    const expected = ["en", "zh"].flatMap((locale) =>
      topics.map((code) => `https://fermatmind.com/${locale}/career/interests/${code}`)
    );
    const entries = appendCareerInterestPilotSitemapEntries(backendEntries);
    expect(entries).toContainEqual(existing);
    expect(entries.filter(({ loc }) => loc !== existing.loc).map(({ loc }) => loc)).toEqual(expected);
    const slugs = new Set(topics.flatMap((code) => {
      const topic = getReleasedCareerInterest(code, "en")!;
      expect(topic.exact.length).toBeGreaterThan(0);
      return [...topic.exact, ...topic.related].map((job) => job.slug);
    }));
    expect(slugs).toEqual(new Set(Object.keys(release.careers)));
  });
});
