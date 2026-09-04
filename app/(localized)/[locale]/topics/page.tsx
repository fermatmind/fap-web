import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CircleHelp,
  FlaskConical,
  Lightbulb,
  MessageCircleMore,
  Scale,
} from "lucide-react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { getCmsArticlesWithLastKnownGood, type CmsArticle } from "@/lib/cms/articles";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

type ArticleJourneyKey = "self" | "action" | "relationships" | "career";

type QuestionPath = {
  key: ArticleJourneyKey;
  title: string;
  steps: string[];
  linkLabel: string;
  href: string;
  icon: typeof BrainCircuit;
  surfaceClassName: string;
  iconClassName: string;
};

type TrustLink = {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: typeof FlaskConical;
  surfaceClassName: string;
  iconClassName: string;
};

function buildQuestionPaths(locale: Locale, withLocale: (pathname: string) => string): QuestionPath[] {
  const isZh = locale === "zh";

  return [
    {
      key: "self",
      title: isZh ? "我想更清楚地认识自己" : "I want to understand myself more clearly",
      steps: isZh
        ? ["选择测评", "看懂结果", "了解优势与成长方向"]
        : ["Choose a test", "Understand the result", "Find strengths and growth directions"],
      linkLabel: isZh ? "选择适合我的测评" : "Choose an assessment",
      href: withLocale("/tests"),
      icon: BrainCircuit,
      surfaceClassName: "border-[#ded7f4] bg-[#f5f2ff] hover:bg-[#efebff]",
      iconClassName: "bg-[#e7dffc] text-[#6750b7]",
    },
    {
      key: "action",
      title: isZh ? "我有结果，但不知道怎么用" : "I have a result, but I do not know how to use it",
      steps: isZh
        ? ["识别重点", "建立假设", "转化为行动实验"]
        : ["Find the signal", "Build a hypothesis", "Turn it into an experiment"],
      linkLabel: isZh ? "查看人格画像与解释" : "Explore profiles and interpretation",
      href: withLocale("/personality"),
      icon: Lightbulb,
      surfaceClassName: "border-[#d7e8e8] bg-[#eff8f7] hover:bg-[#e8f4f2]",
      iconClassName: "bg-[#dcefed] text-[#226c69]",
    },
    {
      key: "relationships",
      title: isZh ? "我想改善关系与沟通" : "I want to improve relationships and communication",
      steps: isZh
        ? ["理解差异", "识别摩擦", "使用沟通指南"]
        : ["Understand differences", "Spot friction", "Use a communication guide"],
      linkLabel: isZh ? "阅读人格与关系主题" : "Read personality and relationship topics",
      href: withLocale("/topics/mbti"),
      icon: MessageCircleMore,
      surfaceClassName: "border-[#eedfd1] bg-[#fff7ee] hover:bg-[#fff1e2]",
      iconClassName: "bg-[#f9e6d2] text-[#9a5b22]",
    },
    {
      key: "career",
      title: isZh ? "我正在做专业或职业选择" : "I am choosing a major or career direction",
      steps: isZh
        ? ["探索兴趣", "比较岗位", "查看职业路径"]
        : ["Explore interests", "Compare roles", "Review career paths"],
      linkLabel: isZh ? "进入职业决策指南" : "Open career decision guides",
      href: withLocale("/career/guides"),
      icon: BriefcaseBusiness,
      surfaceClassName: "border-[#d8e3f3] bg-[#f0f6fd] hover:bg-[#e9f2fb]",
      iconClassName: "bg-[#dfeafa] text-[#315d96]",
    },
  ];
}

function buildTrustLinks(locale: Locale, withLocale: (pathname: string) => string): TrustLink[] {
  const isZh = locale === "zh";

  return [
    {
      key: "science",
      title: isZh ? "测评科学" : "Assessment science",
      description: isZh ? "了解测评背后的理论、证据和适用范围。" : "Understand the theory, evidence, and intended use behind assessments.",
      href: withLocale("/science"),
      icon: FlaskConical,
      surfaceClassName: "border-[#ded7f4] bg-[#f5f2ff] hover:bg-[#efebff]",
      iconClassName: "bg-[#e7dffc] text-[#6750b7]",
    },
    {
      key: "reliability",
      title: isZh ? "信度与效度" : "Reliability and validity",
      description: isZh ? "判断一份测评是否稳定，以及是否真的测到了它声称的内容。" : "Judge whether a test is stable and measures what it claims to measure.",
      href: withLocale("/reliability-validity"),
      icon: ChartNoAxesCombined,
      surfaceClassName: "border-[#d7e8e8] bg-[#eff8f7] hover:bg-[#e8f4f2]",
      iconClassName: "bg-[#dcefed] text-[#226c69]",
    },
    {
      key: "boundaries",
      title: isZh ? "方法边界" : "Method boundaries",
      description: isZh ? "看清结果可以支持哪些判断，又不能替代哪些决定。" : "See which judgments results can support and which decisions they cannot replace.",
      href: withLocale("/method-boundaries"),
      icon: Scale,
      surfaceClassName: "border-[#eedfd1] bg-[#fff7ee] hover:bg-[#fff1e2]",
      iconClassName: "bg-[#f9e6d2] text-[#9a5b22]",
    },
    {
      key: "misconceptions",
      title: isZh ? "常见误区" : "Common misconceptions",
      description: isZh ? "避免把人格、能力或职业兴趣误解成固定命运。" : "Avoid treating personality, ability, or career interest as fixed destiny.",
      href: withLocale("/common-misconceptions"),
      icon: CircleHelp,
      surfaceClassName: "border-[#d8e3f3] bg-[#f0f6fd] hover:bg-[#e9f2fb]",
      iconClassName: "bg-[#dfeafa] text-[#315d96]",
    },
  ];
}

function formatArticleDate(value: string | null, locale: Locale): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatArticleReadTime(minutes: number | null, locale: Locale): string | null {
  if (!minutes) return null;
  return locale === "zh" ? `${minutes} 分钟` : `${minutes} min read`;
}

function getArticleCategoryLabel(article: CmsArticle, locale: Locale): string | null {
  const label = article.category?.name.trim() || null;
  if (!label) return null;
  if (locale === "en" && /[\u3400-\u9fff]/u.test(label)) return null;
  return label;
}

function articleModelLabel(article: CmsArticle, locale: Locale): string | null {
  const tokens = [article.relatedTestSlug ?? "", ...article.tags.flatMap((tag) => [tag.slug, tag.name])]
    .join(" ")
    .toLowerCase();

  if (/\bmbti\b|\b(?:intj|intp|entj|entp|infj|infp|enfj|enfp|istj|isfj|estj|esfj|istp|isfp|estp|esfp)\b/.test(tokens)) return "MBTI";
  if (/big[- ]?five|ocean|大五/.test(tokens)) return locale === "zh" ? "大五人格" : "Big Five";
  if (/riasec|holland|霍兰德/.test(tokens)) return "RIASEC";
  if (/(^|\s)iq($|\s)|智商/.test(tokens)) return "IQ";
  if (/(^|\s)eq($|\s)|情商/.test(tokens)) return "EQ";
  return null;
}

function articleSlugFromHref(href: string): string | null {
  const match = href.match(/\/articles\/([^/?#]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function selectCmsCuratedArticles(articles: CmsArticle[], landingItems: Array<{ key: string; href: string }>): CmsArticle[] {
  const bySlug = new Map(articles.map((article) => [article.slug, article]));

  return landingItems
    .map((item) => {
      const hrefSlug = articleSlugFromHref(item.href);
      return bySlug.get(item.key) ?? (hrefSlug ? bySlug.get(hrefSlug) : undefined);
    })
    .filter((article): article is CmsArticle => Boolean(article))
    .slice(0, 4);
}

function articleSearchText(article: CmsArticle): string {
  return [
    article.slug,
    article.title,
    article.excerpt,
    article.category?.slug ?? "",
    article.category?.name ?? "",
    article.relatedTestSlug ?? "",
    ...article.tags.flatMap((tag) => [tag.slug, tag.name]),
  ]
    .join(" ")
    .toLowerCase();
}

function scoreArticleForJourney(article: CmsArticle, journey: ArticleJourneyKey): number {
  const text = articleSearchText(article);
  const category = `${article.category?.slug ?? ""} ${article.category?.name ?? ""}`.toLowerCase();

  if (journey === "self") {
    if (/narrative[-_ ]portrait|结果怎么看|个人画像|认识自己|自我理解|read(?:ing)? (?:your )?results?|personality portrait/.test(text)) return 12;
    return /人格|personality|mbti|big[- ]?five|enneagram/.test(text) ? 2 : 0;
  }

  if (journey === "action") {
    if (/growth[-_ ]guide|成长|行动实验|行为实验|复盘|结果怎么用|growth|behaviou?r experiment|action experiment/.test(text)) return 12;
    return /结果|result|guide|指南/.test(text) ? 2 : 0;
  }

  if (journey === "relationships") {
    if (/关系|爱情|亲密|relationship|love|intimacy/.test(category)) return 12;
    return /关系|沟通|爱情|亲密|冲突|relationship|communication|love|intimacy|conflict/.test(text) ? 6 : 0;
  }

  if (/职业|高考|专业|career|major/.test(category)) return 12;
  return /职业|专业|岗位|工作|高考|career|major|job|riasec|holland/.test(text) ? 6 : 0;
}

function selectJourneyArticles(articles: CmsArticle[], landingItems: Array<{ key: string; href: string }>): CmsArticle[] {
  const cmsCurated = selectCmsCuratedArticles(articles, landingItems);
  const cmsCuratedSlugs = new Set(cmsCurated.map((article) => article.slug));
  const selected: CmsArticle[] = [];
  const usedSlugs = new Set<string>();
  const journeys: ArticleJourneyKey[] = ["self", "action", "relationships", "career"];

  for (const journey of journeys) {
    const candidate = articles
      .filter((article) => !usedSlugs.has(article.slug))
      .map((article, index) => ({
        article,
        index,
        score: scoreArticleForJourney(article, journey) + (cmsCuratedSlugs.has(article.slug) ? 2 : 0),
      }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.article;

    if (candidate) {
      selected.push(candidate);
      usedSlugs.add(candidate.slug);
    }
  }

  for (const article of [...cmsCurated, ...articles]) {
    if (selected.length >= 4) break;
    if (usedSlugs.has(article.slug)) continue;
    selected.push(article);
    usedSlugs.add(article.slug);
  }

  return selected.slice(0, 4);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";

  return buildPageMetadata({
    locale,
    pathname: isZh ? "/zh/topics" : "/en/topics",
    title: isZh ? "从真实问题开始" : "Start with a real question",
    description: isZh
      ? "选择你现在面对的情况，将测评、结果解释和行动指南串成一条清晰路径。"
      : "Choose the situation you face now and connect assessments, result interpretation, and action guidance.",
    alternatesByLocale: { en: "/en/topics", zh: "/zh/topics", xDefault: "/" },
  });
}

export default async function TopicsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const canonicalPath = isZh ? "/zh/topics" : "/en/topics";
  const heroTitle = isZh ? "从一个真实问题开始" : "Start with a real question";
  const articleResult = await getCmsArticlesWithLastKnownGood({
    locale,
    page: 1,
    perPage: 100,
    allowLocalFallback: false,
    usePublicCache: true,
  });
  const articleLandingItems = articleResult.value.landingSurface?.discoverabilityItems ?? [];
  const curatedArticles = selectJourneyArticles(articleResult.value.items, articleLandingItems);
  const questionPaths = buildQuestionPaths(locale, withLocale);
  const trustLinks = buildTrustLinks(locale, withLocale);

  const collectionPageJsonLd = buildCollectionPageJsonLd({
    path: canonicalPath,
    title: heroTitle,
    description: isZh
      ? "从真实问题进入测评、结果解释和行动指南。"
      : "Move from a real question into assessments, result interpretation, and action guidance.",
    locale,
  });
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: heroTitle,
    description: isZh
      ? "从真实问题进入测评、结果解释和行动指南。"
      : "Move from a real question into assessments, result interpretation, and action guidance.",
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: isZh ? "首页" : "Home", path: isZh ? "/zh" : "/en" },
    { name: isZh ? "主题" : "Topics", path: canonicalPath },
  ]);
  const journeyItemListJsonLd = buildItemListJsonLd({
    path: canonicalPath,
    idSuffix: "question-paths",
    title: isZh ? "从真实问题出发" : "Start from a real question",
    description: isZh ? "从现实问题进入测评、解释和行动路径。" : "Move from a real question into assessment, interpretation, and action.",
    locale,
    items: questionPaths.map((item) => ({ name: item.title, path: item.href })),
  });
  const curatedItemListJsonLd = curatedArticles.length
    ? buildItemListJsonLd({
        path: canonicalPath,
        idSuffix: "recommended-starts",
        title: isZh ? "精选阅读" : "Featured reading",
        description: isZh ? "与常见使用问题相关的公开文章。" : "Public articles related to common assessment questions.",
        locale,
        items: curatedArticles.map((article) => ({ name: article.title, description: article.excerpt, path: withLocale(`/articles/${article.slug}`) })),
      })
    : null;

  return (
    <Container as="main" className="max-w-[1240px] pb-24">
      <AnalyticsPageViewTracker eventName="landing_view" properties={{ page_type: "topics_index", locale }} />
      <JsonLd id="topics-webpage" data={webPageJsonLd} />
      <JsonLd id="topics-collection" data={collectionPageJsonLd} />
      <JsonLd id="topics-breadcrumb" data={breadcrumbJsonLd} />
      <JsonLd id="topics-question-paths" data={journeyItemListJsonLd} />
      {curatedItemListJsonLd ? <JsonLd id="topics-recommended-articles" data={curatedItemListJsonLd} /> : null}

      <div className="pt-6 md:pt-8">
        <Breadcrumb items={[{ label: isZh ? "首页" : "Home", href: withLocale("/") }, { label: isZh ? "主题" : "Topics" }]} />
      </div>

      <h1 className="sr-only">{isZh ? "主题" : "Topics"}</h1>

      <section
        id="topics-question-paths-section"
        className="scroll-mt-24 pt-6 md:pt-8"
        aria-label={isZh ? "选择你正在面对的问题" : "Choose the question you are facing"}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {questionPaths.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.key} className="min-w-0">
                <TrackedEntryCtaLink
                  href={item.href}
                  eventName="continue_exploration"
                  eventProperties={{ action_category: "choose_question_path", entry_surface: `topics_question_${item.key}`, source_page_type: "topics_index", locale }}
                  className={`group flex h-full min-h-[208px] flex-col rounded-[28px] border p-7 transition-[background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(38,42,68,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] focus-visible:ring-offset-4 motion-reduce:transform-none ${item.surfaceClassName}`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <h3 className="m-0 max-w-xl font-serif text-[1.65rem] font-semibold leading-tight tracking-[-0.015em] text-[#171c2d]">{item.title}</h3>
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:rotate-2 motion-reduce:transform-none ${item.iconClassName}`}><Icon aria-hidden="true" className="h-5 w-5" /></span>
                  </div>
                  <ol className="m-0 mt-8 flex list-none flex-wrap items-center gap-y-2 text-xs font-semibold text-[#394053]">
                    {item.steps.map((step, index) => (
                      <li key={step} className="flex items-center">
                        <span className="rounded-full bg-white/80 px-3 py-2">{step}</span>
                        {index < item.steps.length - 1 ? <ArrowRight aria-hidden="true" className="mx-2 h-3.5 w-3.5 text-[#8a90a0]" /> : null}
                      </li>
                    ))}
                  </ol>
                  <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-[#263a60]">
                    {item.linkLabel}
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
                  </span>
                </TrackedEntryCtaLink>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="pt-12 md:pt-16"
        aria-label={isZh ? "测评科学与使用边界" : "Assessment science and use boundaries"}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {trustLinks.map((item) => {
            const Icon = item.icon;
            return (
              <TrackedEntryCtaLink
                key={item.key}
                href={item.href}
                eventName="continue_exploration"
                eventProperties={{ action_category: "read_method_content", entry_surface: `topics_trust_${item.key}`, source_page_type: "topics_index", locale }}
                className={`group flex min-h-[176px] flex-col rounded-[28px] border p-7 transition-[background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(38,42,68,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] focus-visible:ring-offset-4 motion-reduce:transform-none ${item.surfaceClassName}`}
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="inline-flex items-center gap-2 font-serif text-[1.45rem] font-semibold leading-tight tracking-[-0.015em] text-[#171c2d]">
                    {item.title}
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
                  </span>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:rotate-2 motion-reduce:transform-none ${item.iconClassName}`}>
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                </div>
                <span className="mt-auto block max-w-xl pt-6 text-sm leading-6 text-[#667277]">{item.description}</span>
              </TrackedEntryCtaLink>
            );
          })}
        </div>
      </section>

      {curatedArticles.length ? (
          <section className="pb-12 pt-12 md:pb-16 md:pt-16" aria-labelledby="topics-recommended-title">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 id="topics-recommended-title" className="m-0 font-serif text-[1.75rem] font-semibold tracking-tight text-[var(--fm-text)] md:text-[2.125rem]">{isZh ? "精选阅读" : "Featured reading"}</h2>
              </div>
              <Link href={withLocale("/articles")} className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#263a60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] focus-visible:ring-offset-4">
                {isZh ? "查看全部文章" : "View all articles"}
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
              </Link>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {curatedArticles.map((article) => {
                const categoryLabel = getArticleCategoryLabel(article, locale);
                const modelLabel = articleModelLabel(article, locale);
                const publishedAt = formatArticleDate(article.publishedAt ?? article.updatedAt, locale);
                const readTime = formatArticleReadTime(article.readingMinutes, locale);

                return (
                  <article key={`${article.locale}:${article.slug}`} className="group min-w-0">
                    <TrackedEntryCtaLink
                      href={withLocale(`/articles/${article.slug}`)}
                      eventName="continue_exploration"
                      eventProperties={{ action_category: "read_related_content", entry_surface: "topics_recommended_content", source_page_type: "topics_index", content_slug: article.slug, locale }}
                      className="flex h-full min-h-[390px] flex-col overflow-hidden rounded-[24px] border border-[#e1e4e9] bg-white transition-[border-color,transform,box-shadow] hover:-translate-y-1 hover:border-[#c8c3df] hover:shadow-[0_18px_42px_rgba(38,42,68,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] focus-visible:ring-offset-4 motion-reduce:transform-none"
                    >
                      <ArticleResponsiveImage
                        src={article.coverImageUrl}
                        alt={article.coverImageAlt ?? article.title}
                        width={article.coverImageWidth}
                        height={article.coverImageHeight}
                        variants={article.coverImageVariants}
                        className="aspect-[16/10] border-b border-[#e1e4e9]"
                        imageClassName="transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transform-none"
                      />
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
                          {categoryLabel ? <span className="text-[var(--fm-text-muted)]">{categoryLabel}</span> : null}
                          {categoryLabel && modelLabel ? <span aria-hidden="true" className="text-[#a0a4ae]">/</span> : null}
                          {modelLabel ? <span className="text-[#6554bd]">{modelLabel}</span> : null}
                        </div>
                        <h3 className="m-0 mt-3 line-clamp-3 min-h-[5.25rem] font-serif text-xl font-semibold leading-snug text-[var(--fm-text)] transition-colors group-hover:text-[#6554bd]">{article.title}</h3>
                        <p className="m-0 mt-3 text-xs text-[var(--fm-text-muted)]">{[publishedAt, readTime].filter(Boolean).join(" / ")}</p>
                        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[#263a60]">
                          {isZh ? "阅读全文" : "Read article"}
                          <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
                        </span>
                      </div>
                    </TrackedEntryCtaLink>
                  </article>
                );
              })}
            </div>
          </section>
      ) : null}
    </Container>
  );
}
