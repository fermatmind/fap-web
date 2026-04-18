import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career/tests" : "/en/career/tests",
    title: locale === "zh" ? "职业测试" : "Career Tests",
    description:
      locale === "zh"
        ? "先做职业兴趣测试，得到一个职业方向起点。"
        : "Start with a career interest test and get a direction to explore.",
    alternatesByLocale: {
      en: "/en/career/tests",
      zh: "/zh/career/tests",
      xDefault: "/",
    },
  });
}

export default async function CareerTestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);

  return (
    <Container as="main" className="space-y-8 py-12 md:py-20">
      <section className="mx-auto max-w-4xl space-y-4 text-center" data-testid="career-tests-hero">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Career interest test</p>
        <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
          {locale === "zh" ? "先做职业兴趣测试" : "Start with a career interest test"}
        </h1>
        <h2 className="mx-auto m-0 max-w-2xl text-base font-normal leading-7 text-slate-500">
          {locale === "zh"
            ? "适合还没有明确方向，想先得到一个起点的人。"
            : "For people who do not have a clear direction yet and want a starting point first."}
        </h2>
      </section>

      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" data-testid="career-tests-single-entry">
        <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          {locale === "zh" ? "当前稳定入口" : "Current stable entry"}
        </p>
        <h3 className="m-0 mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          {locale === "zh" ? "霍兰德职业兴趣测试（RIASEC）" : "Holland Career Interest Test (RIASEC)"}
        </h3>
        <p className="m-0 mt-3 text-sm leading-6 text-slate-500">
          {locale === "zh"
            ? "36 题，约 6-8 分钟，先得到六维兴趣结构与主次兴趣代码，再进入职业方向判断。"
            : "36 questions in 6-8 minutes. Start with the six-dimension interest profile and top interest codes, then decide where to explore."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={withLocale("/career/tests/riasec")} className={buttonVariants({ variant: "default" })}>
            {locale === "zh" ? "开始测试" : "Start test"}
          </Link>
        </div>
      </section>
    </Container>
  );
}
