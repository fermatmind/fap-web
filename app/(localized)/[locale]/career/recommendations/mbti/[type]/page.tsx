import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedContent } from "@/components/content/RelatedContent";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCareerJobBySlug,
  getMbtiRecommendation,
  listMbtiRecommendationTypes,
  listRelatedArticlesForType,
  listRelatedCareerItemsForType,
} from "@/lib/content";
import { renderVeliteMdx } from "@/lib/content/renderVeliteMdx";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import {
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
  buildItemListJsonLd,
  buildWebPageJsonLd,
  type FAQItem,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return listMbtiRecommendationTypes().flatMap((type) => [{ locale: "en", type }, { locale: "zh", type }]);
}

function buildCanonicalPath(locale: "en" | "zh", type: string): string {
  return locale === "zh" ? `/zh/career/recommendations/mbti/${type}` : `/en/career/recommendations/mbti/${type}`;
}

function buildAnswerFirst({
  locale,
  type,
  workEnv,
  recommendedTitles,
}: {
  locale: "en" | "zh";
  type: string;
  workEnv: string;
  recommendedTitles: string[];
}): string {
  const sampleRoles = recommendedTitles.slice(0, 3).join(locale === "zh" ? "、" : ", ");

  if (locale === "zh") {
    return `${type} 通常更适合${workEnv}，也更容易在${sampleRoles || "目标清晰、可独立推进的岗位"}里稳定发挥。这一页先回答“${type} 更适合哪些方向”，再提醒你用真实技能、兴趣和阶段去校验，不把人格结论当成唯一决策依据。`;
  }

  return `${type} profiles usually do best in ${workEnv.toLowerCase()} and in roles such as ${sampleRoles || "focused, high-autonomy jobs"}. This page gives a first-pass answer on where ${type} often fits, then asks you to validate that signal against your actual skills, interests, and career stage before choosing a path.`;
}

function buildCareerFaqItems({
  locale,
  type,
  workEnv,
  recommendedTitles,
  avoidTitles,
  strengths,
  risks,
}: {
  locale: "en" | "zh";
  type: string;
  workEnv: string;
  recommendedTitles: string[];
  avoidTitles: string[];
  strengths: string[];
  risks: string[];
}): FAQItem[] {
  if (locale === "zh") {
    return [
      {
        question: `${type} 更适合哪些职业方向？`,
        answer: `${type} 往往更适合 ${recommendedTitles.slice(0, 5).join("、")} 这类需要自主推进、标准明确或长期优化的方向。`,
      },
      {
        question: `${type} 需要怎样的工作环境？`,
        answer: `${type} 更容易在 ${workEnv} 的环境里稳定发挥，同时把 ${strengths.slice(0, 2).join("、")} 这些优势转成可见结果。`,
      },
      {
        question: `使用这份 ${type} 职业建议前要注意什么？`,
        answer: `${type} 职业建议不能替代真实经历与能力评估。尤其要额外校验 ${risks.slice(0, 2).join("、")}，并对 ${avoidTitles.slice(0, 3).join("、") || "高冲突或高重复岗位"} 这类方向保持谨慎。`,
      },
    ];
  }

  return [
    {
      question: `Which roles tend to fit ${type} best?`,
      answer: `${type} profiles often align with ${recommendedTitles.slice(0, 5).join(", ")} because those roles reward autonomy, structured judgment, or long-cycle improvement.`,
    },
    {
      question: `What work environment helps ${type} perform well?`,
      answer: `${type} usually performs better in ${workEnv.toLowerCase()} while converting strengths such as ${strengths.slice(0, 2).join(" and ")} into consistent output.`,
    },
    {
      question: `What should you validate before acting on this ${type} recommendation?`,
      answer: `Do not treat a personality profile as the only career filter. Validate your actual experience, current skill level, and risks like ${risks.slice(0, 2).join(" and ")}, and use extra caution around ${avoidTitles.slice(0, 3).join(", ") || "high-friction roles"}.`,
    },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, type: rawType } = await params;
  const locale = resolveLocale(localeParam);
  const type = rawType.toUpperCase();
  const profile = getMbtiRecommendation(type, locale);

  if (!profile) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  return buildPageMetadata({
    locale,
    pathname: buildCanonicalPath(locale, type),
    title: profile.title,
    description: profile.summary,
    alternatesByLocale: {
      en: buildCanonicalPath("en", type),
      zh: buildCanonicalPath("zh", type),
      xDefault: "/",
    },
  });
}

export default async function CareerMbtiRecommendationPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale: localeParam, type: rawType } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const type = rawType.toUpperCase();

  const profile = getMbtiRecommendation(type, locale);
  if (!profile) return notFound();

  const recommendedJobs = profile.recommended_jobs
    .map((slug) => getCareerJobBySlug(slug, locale))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const avoidJobs = (profile.avoid_jobs ?? [])
    .map((slug) => getCareerJobBySlug(slug, locale))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const relatedArticles = listRelatedArticlesForType(type, locale);
  const relatedCareerPaths = listRelatedCareerItemsForType(type, locale);
  const recommendedTitles = recommendedJobs.map((job) => job.title);
  const avoidTitles = avoidJobs.map((job) => job.title);
  const answerFirst = buildAnswerFirst({
    locale,
    type,
    workEnv: profile.work_env,
    recommendedTitles,
  });
  const faqItems = buildCareerFaqItems({
    locale,
    type,
    workEnv: profile.work_env,
    recommendedTitles,
    avoidTitles,
    strengths: profile.strengths,
    risks: profile.risks,
  });
  const canonicalPath = buildCanonicalPath(locale, type);
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: profile.title,
    description: profile.summary,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "职业" : "Career", path: localizedPath("/career", locale) },
    {
      name: locale === "zh" ? "职业推荐" : "Career recommendations",
      path: localizedPath("/career/recommendations", locale),
    },
    { name: type, path: canonicalPath },
  ]);
  const itemListJsonLd = buildItemListJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? `${type} 推荐职业列表` : `${type} recommended roles`,
    description: answerFirst,
    locale,
    items: recommendedJobs.map((job) => ({
      name: job.title,
      path: localizedPath(`/career/jobs/${job.slug}`, locale),
      description: job.summary,
    })),
  });
  const recommendationRows = [
    ...recommendedJobs.slice(0, 6).map((job, index) => ({
      kind: locale === "zh" ? "推荐" : "Recommended",
      title: job.title,
      href: localizedPath(`/career/jobs/${job.slug}`, locale),
      reason: job.summary || profile.strengths[index % Math.max(profile.strengths.length, 1)] || profile.summary,
      validate: profile.work_env,
    })),
    ...avoidJobs.slice(0, 3).map((job, index) => ({
      kind: locale === "zh" ? "谨慎" : "Use caution",
      title: job.title,
      href: localizedPath(`/career/jobs/${job.slug}`, locale),
      reason: profile.risks[index % Math.max(profile.risks.length, 1)] || profile.summary,
      validate: locale === "zh" ? "确认岗位节奏、反馈与协作压力是否可控。" : "Validate the pace, feedback loop, and collaboration load before committing.",
    })),
  ];

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id={`career-mbti-webpage-${type}`} data={webPageJsonLd} />
      <JsonLd id={`career-mbti-breadcrumb-${type}`} data={breadcrumbJsonLd} />
      <JsonLd id={`career-mbti-itemlist-${type}`} data={itemListJsonLd} />
      <JsonLd id={`career-mbti-faq-${type}`} data={buildFAQPageJsonLd(faqItems)} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
          {
            label: locale === "zh" ? "职业推荐" : "Career recommendations",
            href: localizedPath("/career/recommendations", locale),
          },
          { label: type },
        ]}
      />

      <section
        id="answer-first"
        className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      >
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">MBTI</p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{profile.title}</h1>
        <p className="m-0 text-base leading-7 text-[var(--fm-text)]">{answerFirst}</p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? "工作环境" : "Best-fit environment"}
            </p>
            <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">{profile.work_env}</p>
          </div>
          <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? "优先方向" : "Priority roles"}
            </p>
            <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">
              {recommendedTitles.slice(0, 3).join(locale === "zh" ? "、" : ", ") || profile.summary}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? "决策提醒" : "Decision check"}
            </p>
            <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">
              {profile.risks[0] ||
                (locale === "zh"
                  ? "先校验能力和兴趣，再用人格信号做优先级排序。"
                  : "Validate skill and interest before treating personality as a priority signal.")}
            </p>
          </div>
        </div>
      </section>

      <section id="recommended-roles" className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <div className="space-y-1">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "推荐方向矩阵" : "Recommended direction matrix"}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "用可抓取的表格表达推荐岗位、谨慎岗位、出现原因与校验点。"
              : "A crawlable table that shows recommended roles, caution roles, why they appear, and what to validate."}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--fm-border)] text-[var(--fm-text)]">
                <th className="px-3 py-2">{locale === "zh" ? "分类" : "Category"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "岗位" : "Role"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "为何出现" : "Why it appears"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "校验点" : "Validation check"}</th>
              </tr>
            </thead>
            <tbody>
              {recommendationRows.map((row) => (
                <tr key={`${row.kind}-${row.title}`} className="border-b border-[var(--fm-border)] align-top text-[var(--fm-text-muted)]">
                  <td className="px-3 py-3 font-medium text-[var(--fm-text)]">{row.kind}</td>
                  <td className="px-3 py-3">
                    <Link href={row.href} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                      {row.title}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{row.reason}</td>
                  <td className="px-3 py-3">{row.validate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "优势信号" : "Strength signals"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
            <ul className="m-0 list-disc space-y-2 pl-5">
              {profile.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "风险提示" : "Risk signals"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
            <ul className="m-0 list-disc space-y-2 pl-5">
              {profile.risks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <section id="faq" className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "常见问题" : "Frequently asked questions"}
        </h2>
        <dl className="m-0 space-y-4">
          {faqItems.map((item) => (
            <div key={item.question} className="space-y-1">
              <dt className="font-medium text-[var(--fm-text)]">{item.question}</dt>
              <dd className="m-0 text-[var(--fm-text-muted)]">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <article className="prose max-w-none prose-slate">{renderVeliteMdx(profile.body)}</article>

      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "继续查看相关公域页面" : "Continue with related public pages"}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link href={withLocale(`/personality/${type.toLowerCase()}`)} className="fm-help-chip-link">
            {locale === "zh" ? `${type} 人格主页` : `${type} personality page`}
          </Link>
          <Link href={withLocale("/topics/mbti")} className="fm-help-chip-link">
            {locale === "zh" ? "MBTI 主题页" : "MBTI topic page"}
          </Link>
          <Link href={withLocale("/help/faq")} className="fm-help-chip-link">
            {locale === "zh" ? "帮助与 FAQ" : "Help and FAQ"}
          </Link>
        </div>
      </section>

      <div className="space-y-6">
        <RelatedContent title={locale === "zh" ? "相关文章" : "Related articles"} items={relatedArticles} />
        <RelatedContent title={locale === "zh" ? "相关职业路径" : "Related career paths"} items={relatedCareerPaths} />
      </div>
    </Container>
  );
}
