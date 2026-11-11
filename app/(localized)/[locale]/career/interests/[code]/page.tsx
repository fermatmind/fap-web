import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { CAREER_INTEREST_SOURCE } from "@/lib/career/explorationPilot";
import { getReleasedCareerInterest, RELEASED_CAREER_INTEREST_CODES } from "@/lib/career/interestRelease";
import { buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return RELEASED_CAREER_INTEREST_CODES.filter((code) => code !== "ari").map((code) => ({ code }));
}

type Props = { params: Promise<{ locale: string; code: string }> };

async function readInterest(params: Props["params"]) {
  const { locale, code } = await params;
  if (locale !== "zh" && locale !== "en") notFound();
  const topic = getReleasedCareerInterest(code, locale);
  if (!topic) notFound();
  return { locale, code, topic } as const;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, code, topic } = await readInterest(params);
  return buildPageMetadata({
    locale,
    pathname: topic.path,
    title: topic.name,
    description: topic.summary,
    alternatesByLocale: {
      zh: `/zh/career/interests/${code}`,
      en: `/en/career/interests/${code}`,
    },
  });
}

export default async function CareerInterestPage({ params }: Props) {
  const { locale, code, topic } = await readInterest(params);
  const zh = locale === "zh";
  const primary = code.length === 1;
  const groups = [
    {
      id: "exact",
      name: primary
        ? (zh ? `以 ${topic.code} 为首位的职业` : `Occupations with ${topic.code} first`)
        : (zh ? `代码为 ${topic.code} 的职业` : `Occupations with the code ${topic.code}`),
      jobs: topic.exact,
    },
    {
      id: "related",
      name: zh ? "包含相同兴趣的其他职业" : "Other occupations with shared interests",
      jobs: topic.related,
    },
  ];
  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="article" className="max-w-4xl space-y-8 py-10 sm:py-14">
        <JsonLd id={`career-interest-${code}`} data={buildWebPageJsonLd({
          path: topic.path, locale, title: topic.name, description: topic.summary,
        })} />
        <Breadcrumb items={[
          { label: zh ? "首页" : "Home", href: `/${locale}` },
          { label: zh ? "职业测试" : "Career tests", href: `/${locale}/career/tests` },
          { label: topic.code },
        ]} />
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{topic.name}</h1>
          <p className="text-lg leading-8 text-slate-700">{topic.summary}</p>
          <p className="text-sm leading-6 text-slate-700">
            {zh
              ? "这里采用美国 O*NET 31.0 的职业兴趣代码。代码描述工作活动的兴趣特征，具体任务和入行要求请查看职业档案。"
              : "These U.S. O*NET 31.0 codes describe the interests associated with work activities. See each profile for its tasks and entry requirements."}
            {" "}<a className="underline underline-offset-4" href={CAREER_INTEREST_SOURCE}>O*NET 31.0</a>
          </p>
        </header>
        {groups.filter(({ jobs }) => jobs.length > 0).map(({ id, name, jobs }) => (
          <section key={id} aria-labelledby={`interest-${id}`} className="space-y-3">
            <h2 id={`interest-${id}`} className="text-xl font-semibold">{name}</h2>
            <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
              {jobs.map(({ slug, onet, interest, copy }) => (
                <li key={slug} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold">
                    <Link className="underline underline-offset-4" href={`/${locale}/career/jobs/${slug}`}>{copy[locale].name}</Link>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{copy[locale].summary}</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {interest} · <a className="underline underline-offset-4" href={`https://www.onetonline.org/link/summary/${onet}`}>{onet}</a>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <Link className="inline-flex min-h-11 items-center font-medium underline underline-offset-4"
          href={`/${locale}/tests/holland-career-interest-test-riasec`}>
          {zh ? "做免费的霍兰德职业兴趣测评" : "Take the free Holland career interest assessment"}
        </Link>
      </Container>
    </main>
  );
}
