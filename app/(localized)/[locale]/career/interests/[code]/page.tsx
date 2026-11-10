import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareerExplorationPilot } from "@/components/career/CareerExplorationPilot";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { CAREER_EXPLORATION_PILOT, careerExplorationPilotPath, isCareerInterestPilot } from "@/lib/career/explorationPilot";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string; code: string }> };

async function readPilot(params: Props["params"]) {
  const { locale, code } = await params;
  if ((locale !== "zh" && locale !== "en") || !isCareerInterestPilot(code)) notFound();
  return { locale, code, pilot: CAREER_EXPLORATION_PILOT[code] } as const;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, code, pilot } = await readPilot(params);
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

export default async function CareerInterestPilotPage({ params }: Props) {
  const { locale, code, pilot } = await readPilot(params);
  const { title, summary } = pilot.copy[locale];
  const path = careerExplorationPilotPath(locale, code);
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
      </Container>
    </main>
  );
}
