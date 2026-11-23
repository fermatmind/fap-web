import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import AriPage, { generateMetadata as ariMetadata } from "@/app/(localized)/[locale]/career/interests/ari/page";
import ReleasedInterestPage, { generateMetadata as releasedMetadata } from "@/app/(localized)/[locale]/career/interests/[code]/page";
import AcPage, { generateMetadata as acMetadata } from "@/app/(localized)/[locale]/career/interests/ac/page";
import { TraditionalCareerInterestPage, taiwanCareerInterestMetadata } from "@/components/career/TraditionalCareerInterestPage";
import { traditionalEquivalent, traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { CareerExplorationPilot } from "@/components/career/CareerExplorationPilot";
import { CAREER_EXPLORATION_PILOT, careerExplorationPilotPath } from "@/lib/career/explorationPilot";
import { appendCareerInterestPilotSitemapEntries, buildPublicSitemapEntries } from "@/lib/seo/publicSitemap";
import { getInterestDirectory } from "@/lib/career/interestDirectory";
import { getReleasedCareerInterest } from "@/lib/career/interestRelease";
import release from "@/lib/career/interestRelease.json";
import { getSiteUrlOrThrow } from "@/lib/site";

const waveTwoCodes = [
  ["ces", 7, 21], ["scr", 6, 7], ["cei", 5, 11], ["cer", 5, 14],
  ["cir", 5, 57], ["ecr", 5, 14], ["sic", 5, 4], ["cre", 4, 15],
  ["iec", 4, 12], ["rac", 4, 3], ["rce", 4, 15], ["rcs", 4, 9],
  ["sir", 4, 6], ["cri", 3, 59], ["eci", 3, 13], ["sce", 3, 25], ["sec", 3, 25],
] as const;

afterEach(cleanup);

describe("six-page career exploration pilot", () => {
  it.each([
    ["zh", "ari", true, ["27-1021.00", "27-1024.00"]],
    ["en", "ari", true, ["27-1021.00", "27-1024.00"]],
    ["zh", "ac", true, ["27-1024.00", "27-4032.00"]],
    ["en", "ac", true, ["27-1024.00", "27-4032.00"]],
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
    expect(metadata.alternates?.languages).toHaveProperty("zh-TW", `${origin}/zh-TW/career/interests/${code}`);

    const { container } = render(await (code === "ari" ? AriPage : AcPage)(props));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(CAREER_EXPLORATION_PILOT[code].copy[locale].title);
    for (const soc of socCodes) {
      expect(screen.getByRole("link", { name: `O*NET ${soc}` })).toHaveAttribute("href", `https://www.onetonline.org/link/summary/${soc}`);
    }
    for (const job of CAREER_EXPLORATION_PILOT[code].occupations) {
      expect(screen.getByRole("link", { name: job.name[locale] })).toHaveAttribute("href", `/${locale}/career/jobs/${job.slug}`);
    }
    {
      const topic = getReleasedCareerInterest(code, locale)!;
      const links = [...container.querySelectorAll<HTMLAnchorElement>(`a[href^="/${locale}/career/jobs/"]`)];
      const slugs = links.map((link) => link.getAttribute("href")!.split("/").at(-1));
      const expected = new Set([
        ...CAREER_EXPLORATION_PILOT[code].occupations.map(({ slug }) => slug),
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

  it.each(["ari", "ac"] as const)("serves the Taiwan %s guide with reciprocal search alternates", (code) => {
    const entry = `/zh-TW/career/interests/${code}`;
    expect(traditionalPath(`/en/career/interests/${code}`)).toBe(entry);
    expect(traditionalEquivalent(entry)).toBeNull();
    const metadata = taiwanCareerInterestMetadata(code);
    expect(metadata.robots).toMatchObject({ index: true });
    expect(metadata.alternates).toMatchObject({ canonical: "https://fermatmind.com" + entry, languages: { "zh-TW": "https://fermatmind.com" + entry } });

    render(<TraditionalCareerInterestPage code={code} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(`霍蘭德 ${code.toUpperCase()} 代碼`);
    expect(screen.getByRole("link", { name: "简体中文" })).toHaveAttribute("href", `/zh/career/interests/${code}`);
    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute("href", `/en/career/interests/${code}`);
    expect(screen.getByRole("link", { name: "填寫免費職涯探索紀錄" })).toHaveAttribute("href", "/zh-TW/career/interest-worksheet#my-worksheet");
    for (const job of CAREER_EXPLORATION_PILOT[code].occupations) {
      expect(screen.getByRole("link", { name: `O*NET ${job.soc}` })).toHaveAttribute("href", `https://www.onetonline.org/link/summary/${job.soc}`);
      expect(document.querySelector(`a[href="/zh-TW/career/jobs/${job.slug}"]`)).toBeInTheDocument();
    }
  });

  it("serves released Taiwan interest codes and rejects unknown codes", async () => {
    const props = { params: Promise.resolve({ locale: "zh-TW", code: "ric" }) };
    expect(traditionalPath("/zh-TW/career/interests/ric")).toBe("/zh-TW/career/interests/ric");
    expect(await releasedMetadata(props)).toMatchObject({ robots: { index: true } });
    render(await ReleasedInterestPage(props));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("霍蘭德 RIC");
    await expect(releasedMetadata({ params: Promise.resolve({ locale: "zh-TW", code: "xyz" }) }))
      .rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it.each(["zh", "en"] as const)("publishes the SI examples and full groups in %s", async (locale) => {
    const props = { params: Promise.resolve({ locale, code: "si" }) };
    const topic = getReleasedCareerInterest("si", locale)!;
    const metadata = await releasedMetadata(props);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe(`${getSiteUrlOrThrow()}${topic.path}`);
    expect(metadata.alternates?.languages).toMatchObject({
      "zh-CN": `${getSiteUrlOrThrow()}/zh/career/interests/si`,
      en: `${getSiteUrlOrThrow()}/en/career/interests/si`,
    });
    const { container } = render(await ReleasedInterestPage(props));
    expect(document.getElementById("si-task-examples")).toBeInTheDocument();
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>(`a[href^="/${locale}/career/jobs/"]`));
    expect(links).toHaveLength(81);
    expect(new Set(links.map(link => link.getAttribute("href")))).toEqual(new Set(
      [...topic.exact, ...topic.related].map(job => `/${locale}/career/jobs/${job.slug}`),
    ));
    expect(topic.exact).toHaveLength(24);
  });

  it.each([
    ["zh", "ric", 19, 43, 15, 0, 81],
    ["en", "ric", 19, 43, 15, 0, 81],
    ["zh", "icr", 6, 56, 4, 2, 0],
    ["en", "icr", 6, 56, 4, 2, 0],
    ["zh", "rci", 16, 46, 0, 0, 81],
    ["en", "rci", 16, 46, 0, 0, 81],
    ["zh", "irc", 13, 49, 9, 3, 81],
    ["en", "irc", 13, 49, 9, 3, 81],
    ["zh", "ecs", 11, 17, 5, 1, 31],
    ["en", "ecs", 11, 17, 5, 1, 31],
  ] as const)("filters the %s/%s exact and related career cards", async (locale, code, exactCount, relatedCount, zone4, zone5, otherCount) => {
    const props = { params: Promise.resolve({ locale, code }) };
    const { container } = render(await ReleasedInterestPage(props));
    const exact = within(container.querySelector("#interest-directory-exact")!.parentElement!);
    const related = within(container.querySelector("#interest-directory-related")!.closest("section")!);
    const careerLinks = (area: ReturnType<typeof within>) => area.queryAllByRole("link")
      .filter((link: HTMLElement) => link.getAttribute("href")?.startsWith(`/${locale}/career/jobs/`));
    expect(careerLinks(exact)).toHaveLength(exactCount);
    expect(careerLinks(related)).toHaveLength(relatedCount);
    expect(related.getAllByRole("heading", { level: 3 })).toHaveLength(5);
    expect(exact.getAllByRole("link", { name: /O\*NET .*#/u })).toHaveLength(exactCount);
    const slugs = [...container.querySelectorAll(`a[href^="/${locale}/career/jobs/"]`)].map((link) => link.getAttribute("href"));
    expect(slugs).toHaveLength(exactCount + relatedCount + otherCount);
    const topic = getReleasedCareerInterest(code, locale)!;
    const view = getInterestDirectory(code, locale, topic);
    const jobPrefix = `/${locale}/career/jobs/`;
    expect(new Set(slugs)).toEqual(new Set([...topic.exact, ...topic.related].map(({ slug }) => jobPrefix + slug)));
    const extra = container.querySelector("details");
    const extraLinks = extra ? [...extra.querySelectorAll(`a[href^="${jobPrefix}"]`)] : [];
    expect(extraLinks).toHaveLength(otherCount);
    expect(new Set(extraLinks.map((link) => link.getAttribute("href")))).toEqual(new Set(view.other.map(({ slug }) => jobPrefix + slug)));
    expect(new Set(careerLinks(exact).map((link: HTMLElement) => link.getAttribute("href")))).toEqual(
      new Set(view.exact.map(({ slug }) => jobPrefix + slug)),
    );
    expect(related.getAllByRole("link", { name: /O\*NET .*#/u })).toHaveLength(relatedCount);
    const metadata = await releasedMetadata(props);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe(`${getSiteUrlOrThrow()}${topic.path}`);
    if (code !== "icr") {
      expect(metadata.alternates?.languages).toHaveProperty("zh-TW", `${getSiteUrlOrThrow()}/zh-TW/career/interests/${code}`);
    }
    expect(container.querySelector('a[href*="/career-compare/"]')).toBeNull();
    if (locale === "zh") expect(container).not.toHaveTextContent(/美元|US\$|\$[\d,]+/u);
    if (code === "ric") {
      expect(container.querySelector(`header a[href="/${locale}/articles/ric-holland-code-career-exploration"]`)).toBeInTheDocument();
    } else {
      expect(container.querySelector('header a[href*="/articles/"]')).toBeNull();
    }

    const filter = screen.getByRole("combobox", { name: locale === "zh" ? "入行准备度" : "Job preparation" });
    fireEvent.change(filter, { target: { value: "4" } });
    expect(careerLinks(exact)).toHaveLength(zone4);
    expect(careerLinks(related).length).toBeGreaterThan(0);
    expect(careerLinks(related).length).toBeLessThan(relatedCount);
    fireEvent.change(filter, { target: { value: "5" } });
    if (zone5) expect(careerLinks(exact)).toHaveLength(zone5);
    else expect(exact.queryAllByRole("link")).toHaveLength(0);
    fireEvent.change(filter, { target: { value: "" } });
    expect(careerLinks(exact)).toHaveLength(exactCount);
    expect(careerLinks(related)).toHaveLength(relatedCount);
  });

  it.each(["rci", "irc", "ecs"] as const)("keeps the existing Traditional directory for %s", async (code) => {
    const props = { params: Promise.resolve({ locale: "zh-TW", code }) };
    const { container } = render(await ReleasedInterestPage(props));
    const topic = getReleasedCareerInterest(code, "zh")!;
    expect(container.querySelector("#career-job-zone")).toBeNull();
    expect(container.querySelectorAll('a[href^="/zh-TW/career/jobs/"]')).toHaveLength(topic.exact.length + topic.related.length);
  });

  it("publishes reciprocal ICR metadata only for the two selected locales", async () => {
    const origin = getSiteUrlOrThrow();
    for (const locale of ["zh", "en"]) {
      const metadata = await releasedMetadata({ params: Promise.resolve({ locale, code: "icr" }) });
      expect(metadata.robots).toMatchObject({ index: true, follow: true });
      expect(metadata.alternates?.canonical).toBe(`${origin}/${locale}/career/interests/icr`);
      expect(metadata.alternates?.languages).toMatchObject({
        "zh-CN": `${origin}/zh/career/interests/icr`,
        en: `${origin}/en/career/interests/icr`,
      });
      expect(metadata.alternates?.languages).not.toHaveProperty("zh-TW");
    }
    expect(traditionalPath("/zh-TW/career/interests/icr")).toBeNull();
    await expect(releasedMetadata({ params: Promise.resolve({ locale: "zh-TW", code: "icr" }) }))
      .rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it.each(waveTwoCodes)("publishes %s with the frozen exact and related cohorts in two locales", async (code, exactCount, relatedCount) => {
    const origin = getSiteUrlOrThrow();
    const upper = code.toUpperCase();
    expect(traditionalPath(`/zh-TW/career/interests/${code}`)).toBeNull();
    for (const locale of ["zh", "en"] as const) {
      const topic = getReleasedCareerInterest(code, locale)!;
      const view = getInterestDirectory(code, locale, topic);
      const related = view.relatedGroups.flatMap(({ jobs }) => jobs);
      const cards = [...view.exact, ...related];
      expect(view.exact).toHaveLength(exactCount);
      expect(related).toHaveLength(relatedCount);
      expect(view.other).toEqual([]);
      expect(new Set(cards.map(({ slug }) => slug)).size).toBe(cards.length);
      expect(view.exact.every(({ interest }) => interest === upper)).toBe(true);
      expect(related.every(({ interest }) => interest !== upper && [...interest].sort().join("") === [...upper].sort().join(""))).toBe(true);
      expect(cards.every(({ task, officialTaskId, jobZone }) =>
        task.length > 0 && !/美元|US\$|\$[\d,]+/u.test(task) && officialTaskId > 0 && [2, 3, 4, 5].includes(jobZone),
      )).toBe(true);
      const metadata = await releasedMetadata({ params: Promise.resolve({ locale, code }) });
      expect(metadata.robots).toMatchObject({ index: true, follow: true });
      expect(metadata.alternates?.canonical).toBe(`${origin}/${locale}/career/interests/${code}`);
      expect(metadata.alternates?.languages).toMatchObject({
        "zh-CN": `${origin}/zh/career/interests/${code}`,
        en: `${origin}/en/career/interests/${code}`,
      });
      expect(metadata.alternates?.languages).not.toHaveProperty("zh-TW");
    }
  });

  it.each([["zh", "ces"], ["en", "sir"]] as const)("reuses the directory controls on %s/%s", async (locale, code) => {
    const view = getInterestDirectory(code, locale, getReleasedCareerInterest(code, locale)!);
    const { container } = render(await ReleasedInterestPage({ params: Promise.resolve({ locale, code }) }));
    const exact = within(container.querySelector("#interest-directory-exact")!.parentElement!);
    const links = () => exact.queryAllByRole("link")
      .filter((link: HTMLElement) => link.getAttribute("href")?.startsWith(`/${locale}/career/jobs/`));
    expect(links()).toHaveLength(view.exact.length);
    const filter = screen.getByRole("combobox", { name: locale === "zh" ? "入行准备度" : "Job preparation" });
    const zone = view.exact[0].jobZone;
    fireEvent.change(filter, { target: { value: String(zone) } });
    expect(links()).toHaveLength(view.exact.filter(({ jobZone }) => jobZone === zone).length);
    fireEvent.change(filter, { target: { value: "" } });
    expect(links()).toHaveLength(view.exact.length);
    expect(container.querySelector('a[href*="/career-compare/"], header a[href*="/articles/"]')).toBeNull();
    if (locale === "zh") expect(container).not.toHaveTextContent(/美元|US\$|\$[\d,]+/u);
  });

  it("rejects an unpublished interest code", async () => {
    await expect(ReleasedInterestPage({ params: Promise.resolve({ locale: "en", code: "ir" }) }))
      .rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("appends the released topics, publishing the added directories only in English and Simplified Chinese", () => {
    const existing = { loc: "https://fermatmind.com/zh/career", lastmod: "2026-11-10T00:00:00.000Z" };
    const backendEntries = buildPublicSitemapEntries({ items: [
      existing,
      { loc: "https://fermatmind.com/zh/career/recommendations/mbti/intj" },
      { loc: "https://fermatmind.com/en/career/interests/ac" },
    ] });
    const topics = ["a", "ac", "ari", "c", "ce", "e", "ecs", "i", "irc", "r", "rc", "rci", "ric", "s", "si"];
    const expected = ["en", "zh-TW", "zh"].flatMap((locale) =>
      [...topics, ...(locale === "zh-TW" ? [] : ["icr", ...waveTwoCodes.map(([code]) => code)])].sort().map((code) => `https://fermatmind.com/${locale}/career/interests/${code}`)
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
