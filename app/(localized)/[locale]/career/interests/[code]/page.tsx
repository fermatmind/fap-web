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
  return RELEASED_CAREER_INTEREST_CODES.filter((code) => code !== "ari" && code !== "ac").map((code) => ({ code }));
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
  const exactGroups = code === "si" ? [
    {
      id: "exact-education",
      name: zh ? "教育与培训" : "Education and training",
      jobs: topic.exact.filter(job => job.onet.startsWith("25-") || job.slug === "training-and-development-specialists"),
    },
    {
      id: "exact-health",
      name: zh ? "医疗与康复" : "Healthcare and rehabilitation",
      jobs: topic.exact.filter(job => job.onet.startsWith("29-")),
    },
    {
      id: "exact-support",
      name: zh ? "心理与社会支持" : "Mental health and social support",
      jobs: topic.exact.filter(job => job.onet.startsWith("21-")),
    },
  ] : [
    {
      id: "exact",
      name: primary
        ? (zh ? `以 ${topic.code} 为首位的职业` : `Occupations with ${topic.code} first`)
        : (zh ? `代码为 ${topic.code} 的职业` : `Occupations with the code ${topic.code}`),
      jobs: topic.exact,
    },
  ];
  const groups = [
    ...exactGroups,
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
        {code === "si" && (
          <section aria-labelledby="si-task-examples" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 id="si-task-examples" className="text-xl font-semibold">
              {zh ? "同样是理解需求，工作产出有什么不同？" : "Same goal, different outputs: how do these jobs understand needs?"}
            </h2>
            <p className="leading-7 text-slate-700">
              {zh
                ? "SI 的首位是社会型，第二位是研究型。作业治疗师观察日常活动中的困难并评估训练需要；医疗社工评估支持需求并协调出院资源；培训与发展专员收集学习需求并检查课程效果。前两类涉及专业服务，入行要求因地区与岗位而异。"
                : "SI starts with Social, followed by Investigative. Occupational therapists observe difficulties with daily activities and assess needs. Healthcare social workers assess support needs and coordinate discharge resources. Training and development specialists identify learning needs and evaluate training. Requirements for clinical and social services vary by role and location."}
            </p>
            <p className="leading-7 text-slate-700">
              {zh
                ? "试做：以一份虚构的新人培训反馈为例，写两个澄清问题，再选一项可观察的结果检查培训是否奏效。下方先列完整代码为 SI 的职业，再列包含 S、I 但代码不同的职业。"
                : "Try this: read fictional feedback about a new-hire training session. Write two clarifying questions and choose one observable outcome to check whether the session helped. The exact SI occupations appear first, followed by occupations with S and I in a different code."}
            </p>
          </section>
        )}
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
