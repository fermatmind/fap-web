import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { listBlogPosts } from "@/lib/content";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { LIVE_COMPLETED_COUNT } from "@/lib/marketing/completionStats";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import { EVIDENCE_LOGS, SCENARIO_VALIDATIONS } from "@/lib/marketing/socialProof";
import { cn } from "@/lib/utils";

type HomePageContent = ReturnType<typeof getHomePageContent>;
type HomeLink = HomePageContent["quickStart"]["items"][number];
type ResultPreview = HomePageContent["results"]["previews"][number];
type TrustItem = HomePageContent["trust"]["items"][number];
type HomeArticle = ReturnType<typeof listBlogPosts>[number];

function withLocale(locale: Locale, path: string): string {
  return localizedPath(path, locale);
}

function formatCompletedCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function localize<T extends { en: string; zh: string }>(value: T, locale: Locale): string {
  return locale === "zh" ? value.zh : value.en;
}

function HeroCta({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "inline-flex min-h-[46px] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
        variant === "primary"
          ? "bg-orange-600 text-white shadow-sm hover:bg-orange-700"
          : "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:shadow-md"
      )}
    >
      {children}
    </Link>
  );
}

function HeroLandingIllustration({ locale, previews }: { locale: Locale; previews: ResultPreview[] }) {
  const panelLabel = locale === "zh" ? "结果结构" : "Result";
  const noteLabel = locale === "zh" ? "可继续使用的结果页" : "Reusable result page";

  return (
    <div className="relative hidden min-h-[25rem] lg:block" aria-hidden="true">
      <div className="absolute left-0 top-12 h-72 w-72 rounded-full bg-orange-200/45 blur-3xl" />
      <div className="absolute right-2 top-2 h-64 w-64 rounded-full bg-white/70 blur-2xl" />

      <div className="absolute right-0 top-3 w-[31rem] rounded-[2rem] border border-white/80 bg-white shadow-xl shadow-orange-900/10">
        <div className="flex h-9 items-center gap-2 rounded-t-[2rem] bg-slate-900 px-5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-orange-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </div>
        <div className="p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                {panelLabel}
              </p>
              <p className="m-0 mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950">
                {noteLabel}
              </p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-600 text-lg font-semibold text-white">
              FM
            </div>
          </div>

          <div className="mt-7 space-y-4">
            {previews.slice(0, 3).map((item, index) => (
              <div key={item.title} className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-4">
                <span className="font-mono text-xs font-semibold text-slate-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="m-0 text-sm font-semibold text-slate-950">{item.title}</p>
                    <span className="h-1.5 w-16 rounded-full bg-orange-100" />
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-orange-500"
                      style={{ width: `${70 - index * 12}%` }}
                    />
                  </div>
                  <p className="m-0 mt-1.5 text-xs leading-5 text-slate-500">
                    {item.metrics.join(" / ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 grid gap-2">
        {previews.slice(0, 3).map((item, index) => (
          <span
            key={item.title}
            className={cn(
              "w-max rounded-r-2xl px-5 py-2 text-sm font-semibold shadow-sm",
              index === 0 && "bg-orange-600 text-white",
              index === 1 && "ml-8 bg-white text-slate-900",
              index === 2 && "ml-16 bg-slate-900 text-white"
            )}
          >
            {item.title}
          </span>
        ))}
      </div>
    </div>
  );
}

function HomepageHeroV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  const statLabel =
    locale === "zh"
      ? `过去 30 天完成 ${formatCompletedCount(LIVE_COMPLETED_COUNT)} 次测评`
      : `${formatCompletedCount(LIVE_COMPLETED_COUNT)} assessments completed in the last 30 days`;

  return (
    <section className="relative overflow-hidden bg-orange-50 pb-24 pt-10 text-slate-950 md:pb-32 md:pt-14">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_20%_10%,rgba(234,88,12,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,247,237,0.36)_45%,rgba(254,215,170,0.34))]"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 left-1/2 h-44 w-[120vw] -translate-x-1/2 rounded-[100%] bg-white"
      />
      <Container className="relative z-10 max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="mb-9 inline-flex rounded-full bg-white/85 px-4 py-2 text-xs font-semibold text-orange-700 shadow-sm">
          {statLabel}
        </div>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(27rem,1fr)]">
          <div className="max-w-2xl text-center lg:text-left">
            <p className="m-0 text-sm font-semibold tracking-[0.16em] text-orange-700 uppercase">
              {copy.hero.eyebrow}
            </p>
            <h1 className="m-0 mt-6 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-slate-950 md:text-6xl lg:text-[5.25rem]">
              {copy.hero.title}
            </h1>
            <p className="m-0 mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-700 md:text-xl lg:mx-0">
              {copy.hero.subhead}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <HeroCta href={withLocale(locale, copy.hero.primaryHref)}>{copy.hero.primaryCta}</HeroCta>
              <HeroCta href={withLocale(locale, copy.hero.secondaryHref)} variant="secondary">
                {copy.hero.secondaryCta}
              </HeroCta>
            </div>
            <Link
              href={withLocale(locale, copy.hero.tertiaryHref)}
              prefetch={false}
              className="mt-4 inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              {copy.hero.tertiaryCta}
              <span aria-hidden className="ml-1">→</span>
            </Link>
          </div>
          <HeroLandingIllustration locale={locale} previews={copy.results.previews} />
        </div>
      </Container>
    </section>
  );
}

function TrustCard({ item, index }: { item: TrustItem; index: number }) {
  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-lg shadow-slate-900/5">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-orange-100 bg-orange-50 text-sm font-semibold text-orange-700">
        {String(index + 1).padStart(2, "0")}
      </div>
      <h2 className="m-0 mt-5 text-lg font-semibold tracking-[-0.03em] text-slate-950">{item.title}</h2>
      <p className="m-0 mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
    </article>
  );
}

function HomepageTrustStripV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  return (
    <section className="relative z-20 -mt-16 bg-transparent pb-8 md:-mt-20 md:pb-10" aria-label={copy.trust.title}>
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          {copy.trust.items.map((item, index) => (
            <TrustCard key={item.title} item={item} index={index} />
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Link
            href={withLocale(locale, copy.trust.methodHref)}
            prefetch={false}
            className="inline-flex items-center text-sm font-semibold text-slate-500 transition hover:text-slate-950"
          >
            {copy.trust.methodLabel}
            <span aria-hidden className="ml-1">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}

function HomepageSocialProofBanner({ locale }: { locale: Locale }) {
  const labels = {
    title: locale === "zh" ? "使用场景与引用" : "Users and use cases",
    kicker: locale === "zh" ? "不做夸张背书，只展示真实使用语境。" : "No inflated endorsements, just real usage contexts.",
  };
  const logs = EVIDENCE_LOGS.slice(0, 3);

  return (
    <section className="bg-white py-20 md:py-24" aria-labelledby="homepage-social-proof-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="text-center">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {labels.kicker}
          </p>
          <h2
            id="homepage-social-proof-title"
            className="m-0 mt-4 text-3xl font-semibold tracking-[-0.045em] text-slate-950 md:text-4xl"
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

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {logs.map((item, index) => (
            <figure
              key={item.id}
              className={cn(
                "rounded-3xl border border-slate-100 bg-white p-7 text-center shadow-sm transition",
                index === 1 ? "shadow-xl shadow-slate-900/10 md:-translate-y-4" : "opacity-75"
              )}
            >
              <blockquote className="m-0 text-base font-semibold leading-8 tracking-[-0.02em] text-slate-800">
                “{localize(item.quote, locale)}”
              </blockquote>
              <figcaption className="mt-6 text-sm leading-6 text-slate-500">
                <span className="block font-semibold text-slate-800">{item.author}</span>
                <span>{localize(item.role, locale)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
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
          <span className="font-mono text-xs font-semibold text-orange-500">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <p className="m-0 mt-5 text-base leading-7 text-slate-600">{item.description}</p>
        <Link
          href={href}
          prefetch={false}
          className="mt-auto inline-flex items-center pt-5 text-sm font-semibold text-teal-800 transition group-hover:text-orange-700"
        >
          {item.label}
          <span aria-hidden className="ml-1">→</span>
        </Link>
      </div>
      <p className="m-0 mt-5 text-base leading-7 text-teal-50/85">
        {item.meta}
      </p>
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
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100/75">
            {copy.quickStart.kicker}
          </p>
          <h2
            id="homepage-core-tests-title"
            className="m-0 mt-3 text-3xl font-semibold tracking-[-0.045em] text-white md:text-4xl"
          >
            {copy.quickStart.title}
          </h2>
          <p className="m-0 mt-4 text-base leading-7 text-teal-50/80">{copy.quickStart.body}</p>
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
          {copy.quickStart.items.slice(0, 6).map((item, index) => (
            <TestFeatureCard key={item.title} locale={locale} item={item} index={index} />
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          {copy.secondaryExplore.items.map((item) => (
            <Link
              key={item.title}
              href={withLocale(locale, item.href)}
              prefetch={false}
              className="rounded-full border border-teal-200/30 px-4 py-2 text-sm font-semibold text-teal-50 transition hover:border-white hover:text-white"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

const ABOUT_CARD_LINKS = [
  { key: "result", href: "/personality" },
  { key: "method", href: "/help/about" },
  { key: "career", href: "/career" },
] as const;

function HomepageAboutBanner({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  const labels =
    locale === "zh"
      ? {
          title: "关于 FermatMind",
          body: "我们把测评做成可继续使用的结果结构，而不是一次性的标签娱乐。",
          readMore: "继续了解",
          cards: ["结果可复用", "方法边界透明", "接回下一步"],
        }
      : {
          title: "About FermatMind",
          body: "We turn assessments into reusable result structures instead of one-off labels.",
          readMore: "Read more",
          cards: ["Reusable result", "Transparent boundaries", "Next-step oriented"],
        };
  const descriptions = [copy.results.body, copy.trust.items[1]?.summary, copy.families.items[1]?.description];

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
            <article key={item.key} className="rounded-xl bg-white p-8 text-center shadow-xl shadow-slate-900/10">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-teal-600 text-2xl font-semibold text-teal-700">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="m-0 mt-6 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                {labels.cards[index]}
              </h3>
              <p className="m-0 mt-3 text-base leading-7 text-slate-600">{descriptions[index]}</p>
              <Link
                href={withLocale(locale, item.href)}
                prefetch={false}
                className="mt-6 inline-flex text-sm font-semibold text-teal-700 underline underline-offset-4 hover:text-orange-700"
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

function HomepageArticlesBanner({ locale, articles }: { locale: Locale; articles: HomeArticle[] }) {
  const labels =
    locale === "zh"
      ? { kicker: "推荐阅读", title: "延伸阅读", all: "查看全部文章" }
      : { kicker: "Recommended reading", title: "Latest articles", all: "View all articles" };

  return (
    <section className="bg-white py-20 md:py-24" aria-labelledby="homepage-articles-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="text-center">
          <p className="m-0 text-sm font-semibold tracking-[0.16em] text-teal-700">{labels.kicker}</p>
          <h2
            id="homepage-articles-title"
            className="m-0 mt-3 text-4xl font-semibold tracking-[-0.055em] text-slate-950 md:text-5xl"
          >
            {labels.title}
          </h2>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 6).map((article, index) => (
            <article key={`${article.slug}-${article.locale}`} className="group">
              <Link href={withLocale(locale, `/articles/${article.slug}`)} prefetch={false} className="block">
                <ArticleVisual index={index} title={article.tags?.[0] ?? article.voice} />
                <h3 className="m-0 mt-5 text-3xl font-normal leading-tight tracking-[-0.055em] text-slate-900 transition group-hover:text-teal-800">
                  {article.title}
                </h3>
              </Link>
              <p className="m-0 mt-5 text-sm leading-6 text-slate-500">
                {locale === "zh" ? "作者：" : "By "}
                <span className="text-slate-700">{article.author}</span>
              </p>
              <p className="m-0 mt-1 text-sm text-slate-400">{article.updatedAt}</p>
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

export function HomePageExperience({ locale }: { locale: Locale }) {
  const copy = getHomePageContent(locale);
  const articles = listBlogPosts(locale);

  return (
    <div className="bg-white text-slate-950">
      <HomepageHeroV1 locale={locale} copy={copy} />
      <HomepageTrustStripV1 locale={locale} copy={copy} />
      <HomepageSocialProofBanner locale={locale} />
      <HomepageHighlightedTestsBanner locale={locale} copy={copy} />
      <HomepageAboutBanner locale={locale} copy={copy} />
      <HomepageArticlesBanner locale={locale} articles={articles} />
    </div>
  );
}
