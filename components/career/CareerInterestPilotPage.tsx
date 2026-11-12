import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareerExplorationPilot } from "@/components/career/CareerExplorationPilot";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { CAREER_EXPLORATION_PILOT, careerExplorationPilotPath, type CareerInterestPilot } from "@/lib/career/explorationPilot";
import { getReleasedCareerInterest } from "@/lib/career/interestRelease";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Params = Promise<{ locale: string }>;

async function readPilot(params: Params, code: CareerInterestPilot) {
  const { locale } = await params;
  if (locale !== "zh" && locale !== "en") notFound();
  return { locale, pilot: CAREER_EXPLORATION_PILOT[code] } as const;
}

export async function careerInterestPilotMetadata(params: Params, code: CareerInterestPilot): Promise<Metadata> {
  const { locale, pilot } = await readPilot(params, code);
  return buildPageMetadata({
    locale,
    pathname: careerExplorationPilotPath(locale, code),
    title: pilot.copy[locale].title,
    description: pilot.copy[locale].summary,
    noindex: !pilot.indexable,
    noindexFollow: true,
    alternatesByLocale: { zh: careerExplorationPilotPath("zh", code), en: careerExplorationPilotPath("en", code) },
  });
}

export async function CareerInterestPilotPage({ params, code }: { params: Params; code: CareerInterestPilot }) {
  const { locale, pilot } = await readPilot(params, code);
  const { title, summary } = pilot.copy[locale];
  const path = careerExplorationPilotPath(locale, code);
  const releasedTopic = code === "ari" ? getReleasedCareerInterest(code, locale) : null;
  const pilotSlugs = new Set<string>(pilot.occupations.map(({ slug }) => slug));
  const additionalJobs = releasedTopic
    ? [...releasedTopic.exact, ...releasedTopic.related].filter(({ slug }) => !pilotSlugs.has(slug))
    : [];
  const parents = [
    { name: locale === "zh" ? "首页" : "Home", path: `/${locale}` },
    { name: locale === "zh" ? "职业测试" : "Career tests", path: `/${locale}/career/tests` },
  ];
  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="article" className="max-w-4xl space-y-6 py-10 sm:py-14">
        <JsonLd id={`career-interest-${code}`} data={buildWebPageJsonLd({ path, locale, title, description: summary })} />
        <JsonLd id={`career-interest-${code}-breadcrumb`} data={buildBreadcrumbJsonLd([...parents, { name: title, path }])} />
        <Breadcrumb items={[...parents.map(({ name, path: href }) => ({ label: name, href })), { label: code.toUpperCase() }]} />
        <header className="space-y-3">
          <h1 className="m-0 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          <p className="m-0 text-lg leading-8 text-slate-700">{summary}</p>
        </header>
        <CareerExplorationPilot pilot={code} locale={locale} />
        {additionalJobs.length > 0 && (
          <section aria-labelledby="ari-additional-occupations" className="space-y-3">
            <h2 id="ari-additional-occupations" className="text-xl font-semibold">
              {locale === "zh" ? "更多兴趣相近的职业" : "More occupations with shared interests"}
            </h2>
            <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
              {additionalJobs.map(({ slug, onet, interest, copy }) => (
                <li key={slug} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold">
                    <Link className="underline underline-offset-4" href={`/${locale}/career/jobs/${slug}`}>{copy[locale].name}</Link>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{copy[locale].summary}</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {interest} · <a className="underline underline-offset-4" href={`https://www.onetonline.org/link/summary/${onet}`}>O*NET {onet}</a>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </main>
  );
}
