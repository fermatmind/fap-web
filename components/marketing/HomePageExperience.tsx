import Link from "next/link";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { CmsMediaAuthorityShell } from "@/components/marketing/CmsMediaAuthorityShell";
import { Container } from "@/components/layout/Container";
import { HomepageSocialProofCarousel } from "@/components/marketing/HomepageSocialProofCarousel";
import type { CmsArticle } from "@/lib/cms/articles";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { HomePageContent } from "@/lib/marketing/homepageContent";
import { EVIDENCE_LOGS, SCENARIO_VALIDATIONS } from "@/lib/marketing/socialProof";
import { IQ_PUBLIC_SLUG } from "@/lib/iq/constants";
import { cn } from "@/lib/utils";

type HomeLink = HomePageContent["quickStart"]["items"][number];
type TrustItem = HomePageContent["trust"]["items"][number];
type HomeArticle = CmsArticle;

const ARTICLE_AUTHOR_NAME = "Fermat Institute";
function withLocale(locale: Locale, path: string): string {
  return localizedPath(path, locale);
}

function localize<T extends { en: string; zh: string }>(value: T, locale: Locale): string {
  return locale === "zh" ? value.zh : value.en;
}

function HomepageHeroV1({ copy }: { copy: HomePageContent }) {
  return (
    <section className="relative flex min-h-[34rem] overflow-hidden bg-orange-50 px-0 py-24 text-slate-950 sm:py-28 md:min-h-[46.75rem] md:py-32 lg:py-36">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,253,246,0.72)_48%,rgba(255,237,213,0.18))]"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 left-1/2 h-44 w-[120vw] -translate-x-1/2 rounded-[100%] bg-white"
      />
      <Container className="relative z-10 flex w-full max-w-5xl items-center justify-center px-6 md:px-8">
        <div className="mx-auto w-full text-center">
          <h1 className="m-0 text-balance break-words text-[2.85rem] font-black leading-[1.04] tracking-normal text-slate-950 sm:text-[3.6rem] md:text-[4.75rem] md:leading-[1] lg:text-[5.25rem]">
            {copy.hero.title}
          </h1>
          <p className="m-0 mx-auto mt-9 max-w-[42rem] text-[1.08rem] font-normal leading-[1.72] tracking-normal text-slate-500 sm:text-lg md:max-w-none md:whitespace-nowrap md:text-[1.35rem] md:leading-relaxed lg:text-2xl">
            {copy.hero.subhead}
          </p>
        </div>
      </Container>
    </section>
  );
}

function TrustIcon({ index }: { index: number }) {
  const iconClassName = "mx-auto h-[58px] w-[58px] text-[#008fb3]";
  const commonProps = {
    viewBox: "0 0 80 80",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: iconClassName,
    "aria-hidden": true,
  };

  if (index === 1) {
    return (
      <svg {...commonProps}>
        <path d="M40 8 64 17v18c0 17.5-10.5 29.5-24 36-13.5-6.5-24-18.5-24-36V17l24-9Z" />
        <path d="M30 37v-6c0-6 4-10 10-10s10 4 10 10v6" />
        <rect x="28" y="36" width="24" height="20" rx="3" />
        <path d="M40 44v6" />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg {...commonProps}>
        <circle cx="40" cy="25" r="9" />
        <path d="M25 64v-8c0-9 6-16 15-16s15 7 15 16v8" />
        <circle cx="20" cy="32" r="7" />
        <path d="M8 63v-6c0-7 5-12 12-12 4 0 7 1.5 9 4" />
        <circle cx="60" cy="32" r="7" />
        <path d="M72 63v-6c0-7-5-12-12-12-4 0-7 1.5-9 4" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect x="15" y="24" width="50" height="36" rx="2.5" />
      <path d="M30 24v-7h20v7" />
      <path d="M15 37h18" />
      <path d="M47 37h18" />
      <path d="M37 37h6" />
      <path d="M40 34c-3 0-5 2.4-5 5.2 0 2.2 1.3 4 3.1 4.8v8h3.8v-8c1.8-.8 3.1-2.6 3.1-4.8 0-2.8-2-5.2-5-5.2Z" />
      <path d="M20 60h40" />
    </svg>
  );
}

function TrustCard({ item, index }: { item: TrustItem; index: number }) {
  return (
    <article className="min-h-[260.78px] rounded-lg bg-white px-4 pb-4 pt-10 text-center shadow-[0_5px_20px_rgba(0,0,0,0.1)]">
      <TrustIcon index={index} />
      <h2 className="m-0 mt-3 text-[1.02rem] font-bold leading-snug tracking-normal text-[#20252d]">{item.title}</h2>
      <p className="m-0 mx-auto mt-2 max-w-[17.5rem] text-[0.9rem] font-normal leading-[1.48] tracking-normal text-[#5f6670]">
        {item.summary}
      </p>
    </article>
  );
}

function HomepageTrustStripV1({ copy }: { copy: HomePageContent }) {
  return (
    <section className="relative z-20 bg-white pb-8 pt-10 md:pb-10 md:pt-0" aria-label={copy.trust.title}>
      <Container className="max-w-[1140px] px-6 min-[1400px]:max-w-[1320px]">
        <div className="grid gap-6 md:grid-cols-3">
          {copy.trust.items.map((item, index) => (
            <TrustCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function HomepageSocialProofBanner({ locale }: { locale: Locale }) {
  const labels = {
    title: locale === "zh" ? "使用场景与引用" : "Users and use cases",
  };
  const logs = EVIDENCE_LOGS.map((item) => ({
    id: item.id,
    quote: localize(item.quote, locale),
    author: item.author,
    role: localize(item.role, locale),
  }));

  return (
    <section className="bg-white py-20 md:py-24" aria-labelledby="homepage-social-proof-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="text-center">
          <h2
            id="homepage-social-proof-title"
            className="m-0 text-3xl font-semibold tracking-[-0.045em] text-slate-950 md:text-4xl"
          >
            {labels.title}
          </h2>
        </div>

        <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-x-7 gap-y-4 text-center">
          {SCENARIO_VALIDATIONS.slice(0, 5).map((item) => (
            <span
              key={item.id}
              className="text-lg font-semibold tracking-[-0.035em] text-slate-300 md:text-2xl"
            >
              {localize(item.label, locale)}
            </span>
          ))}
        </div>

        <HomepageSocialProofCarousel items={logs} />
      </Container>
    </section>
  );
}

function TestFeatureCard({ locale, item, index }: { locale: Locale; item: HomeLink; index: number }) {
  const href = withLocale(locale, item.href);
  const isPrimary = index === 0;

  return (
    <article className="group">
      <div
        className={cn(
          "flex h-full min-h-[12rem] flex-col rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
          isPrimary && "ring-2 ring-orange-300"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="m-0 text-xl font-semibold tracking-[-0.035em] text-teal-800 underline decoration-teal-200 underline-offset-4">
            {item.title}
          </h3>
          <span className="shrink-0 rounded-full border border-teal-100 px-3 py-1 text-xs font-medium text-teal-800">
            {item.meta}
          </span>
        </div>
        <p className="m-0 mt-5 text-base leading-7 text-slate-600">{item.description}</p>
        <CmsMediaAuthorityShell
          media={item.media ?? null}
          locale={locale}
          surface="home_quick_start"
          visible={item.href.includes(IQ_PUBLIC_SLUG) || item.key === IQ_PUBLIC_SLUG}
        />
        <Link
          href={href}
          prefetch={false}
          className="mt-auto inline-flex items-center pt-5 text-sm font-semibold text-teal-800 transition group-hover:text-orange-700"
        >
          {item.label}
          <span aria-hidden className="ml-1">→</span>
        </Link>
      </div>
    </article>
  );
}

function HomepageHighlightedTestsBanner({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  return (
    <section className="relative overflow-hidden bg-teal-800 py-20 text-white md:py-24" aria-labelledby="homepage-core-tests-title">
      <div
        aria-hidden
        className="absolute -top-24 left-1/2 h-40 w-[95vw] -translate-x-1/2 rounded-[100%] bg-white"
      />
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="homepage-core-tests-title"
            className="m-0 text-3xl font-semibold tracking-[-0.045em] text-white md:text-4xl"
          >
            {copy.quickStart.title}
          </h2>
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
          {copy.quickStart.items.slice(0, 6).map((item, index) => (
            <TestFeatureCard key={item.title} locale={locale} item={item} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

const ABOUT_CARD_LINKS = [
  { key: "result", href: "/personality" },
  { key: "method", href: "/help" },
  { key: "career", href: "/career" },
] as const;

function HomepageAboutBanner({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  const labels =
    locale === "zh"
      ? {
          title: "关于 费马测试",
          body: "我们通过高分辨率测量、真实职业记录与能力训练，帮助用户形成更清晰的自我认知、更现实的职业判断和更持续的成长能力。",
          readMore: "继续了解",
          cards: ["结果可复用", "方法边界透明", "连接职业方向"],
        }
      : {
          title: "About FermatMind",
          body: "We turn assessments into reusable result structures instead of one-off labels.",
          readMore: "Read more",
          cards: ["Reusable result", "Transparent boundaries", "Career direction"],
        };
  const descriptions = [
    copy.results.body,
    copy.trust.items[1]?.summary,
    locale === "zh"
      ? "把类型、兴趣与能力线索整理成可比较的职业方向，帮助你判断下一步先探索什么。"
      : "Turn type, interest, and ability signals into comparable career directions for your next exploration step.",
  ];

  return (
    <section className="bg-white py-20 md:py-24" aria-labelledby="homepage-about-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-none bg-orange-500 px-6 py-16 text-center text-white md:px-12 md:py-20">
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(124,45,18,0.22),rgba(234,88,12,0.82),rgba(124,45,18,0.18)),radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.28),transparent_24%),radial-gradient(circle_at_86%_28%,rgba(255,255,255,0.2),transparent_23%)]"
          />
          <div className="relative mx-auto max-w-3xl">
            <h2 id="homepage-about-title" className="m-0 text-3xl font-semibold tracking-[-0.045em] md:text-4xl">
              {labels.title}
            </h2>
            <p className="m-0 mt-5 text-lg leading-8 text-white/90">{labels.body}</p>
          </div>
        </div>
        <div className="relative z-10 -mt-12 grid gap-6 px-4 md:grid-cols-3 md:px-14">
          {ABOUT_CARD_LINKS.map((item, index) => (
            <article key={item.key} className="flex h-full flex-col rounded-xl bg-white p-8 text-center shadow-xl shadow-slate-900/10">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-teal-600 text-2xl font-semibold text-teal-700">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="m-0 mt-6 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                  {labels.cards[index]}
                </h3>
                <p className="m-0 mt-3 text-base leading-7 text-slate-600">{descriptions[index]}</p>
              </div>
              <Link
                href={withLocale(locale, item.href)}
                prefetch={false}
                className="mx-auto mt-auto inline-flex pt-6 text-sm font-semibold text-teal-700 underline underline-offset-4 hover:text-orange-700"
              >
                {labels.readMore}
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ArticleVisual({ index, title }: { index: number; title: string }) {
  const palettes = [
    "from-orange-100 via-slate-100 to-teal-100",
    "from-sky-100 via-orange-50 to-slate-100",
    "from-teal-100 via-sky-50 to-orange-100",
    "from-rose-100 via-orange-50 to-slate-100",
    "from-blue-100 via-teal-50 to-orange-100",
    "from-slate-100 via-orange-50 to-sky-100",
  ];

  return (
    <div className={cn("relative h-40 overflow-hidden bg-gradient-to-br", palettes[index % palettes.length])}>
      <div aria-hidden className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-white/55" />
      <div aria-hidden className="absolute right-6 top-5 h-20 w-20 rounded-full border border-white/70" />
      <div aria-hidden className="absolute bottom-0 right-0 h-20 w-40 rounded-tl-full bg-white/45" />
      <p className="absolute bottom-5 left-5 right-5 m-0 text-sm font-semibold leading-5 text-slate-700">
        {title}
      </p>
    </div>
  );
}

function getArticleVisualTitle(article: HomeArticle, locale: Locale): string {
  return (
    article.tags[0]?.name ||
    article.category?.name ||
    (locale === "zh" ? "文章" : "Article")
  );
}

function ArticleCoverVisual({ article, index, locale }: { article: HomeArticle; index: number; locale: Locale }) {
  if (!article.coverImageUrl) {
    return <ArticleVisual index={index} title={getArticleVisualTitle(article, locale)} />;
  }

  return (
    <ArticleResponsiveImage
      src={article.coverImageUrl}
      alt={article.coverImageAlt ?? article.title}
      width={article.coverImageWidth}
      height={article.coverImageHeight}
      variants={article.coverImageVariants}
      mode="card"
      className="h-40"
    />
  );
}

function getArticleDisplayDate(article: HomeArticle, locale: Locale): string {
  const value = article.publishedAt ?? article.updatedAt ?? article.createdAt;
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  if (locale === "zh") {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function HomepageArticlesBanner({ locale, articles }: { locale: Locale; articles: HomeArticle[] }) {
  const visibleArticles = articles.slice(0, 6);

  if (visibleArticles.length === 0) {
    return null;
  }

  const labels =
    locale === "zh"
      ? { title: "推荐阅读", all: "查看全部文章", author: "作者：" }
      : { title: "Recommended reading", all: "View all articles", author: "By " };

  return (
    <section className="bg-white py-20 md:py-24" aria-labelledby="homepage-articles-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="text-center">
          <h2
            id="homepage-articles-title"
            className="m-0 text-4xl font-semibold tracking-[-0.055em] text-slate-950 md:text-5xl"
          >
            {labels.title}
          </h2>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {visibleArticles.map((article, index) => (
            <article key={`${article.slug}-${article.locale}`} className="group">
              <Link href={withLocale(locale, `/articles/${article.slug}`)} prefetch={false} className="block">
                <ArticleCoverVisual article={article} index={index} locale={locale} />
                <h3 className="m-0 mt-5 text-3xl font-normal leading-tight tracking-[-0.055em] text-slate-900 transition group-hover:text-teal-800">
                  {article.title}
                </h3>
              </Link>
              <p className="m-0 mt-5 text-sm leading-6 text-slate-500">
                {labels.author}
                <span className="text-slate-700">{ARTICLE_AUTHOR_NAME}</span>
              </p>
              <p className="m-0 mt-1 text-sm text-slate-400">{getArticleDisplayDate(article, locale)}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={withLocale(locale, "/articles")}
            prefetch={false}
            className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-700 hover:text-teal-800"
          >
            {labels.all}
          </Link>
        </div>
      </Container>
    </section>
  );
}

export function HomePageExperience({ locale, copy, articles = [] }: { locale: Locale; copy: HomePageContent; articles?: HomeArticle[] }) {
  return (
    <div className="bg-white text-slate-950">
      <HomepageHeroV1 copy={copy} />
      <HomepageTrustStripV1 copy={copy} />
      <HomepageSocialProofBanner locale={locale} />
      <HomepageHighlightedTestsBanner locale={locale} copy={copy} />
      <HomepageAboutBanner locale={locale} copy={copy} />
      <HomepageArticlesBanner locale={locale} articles={articles} />
    </div>
  );
}
