import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
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
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
          { label: locale === "zh" ? "职业测试" : "Career tests" },
        ]}
      />

      <section className="mx-auto max-w-4xl space-y-4 text-center" data-testid="career-tests-hero">
        <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
          {locale === "zh" ? "先做职业兴趣测试" : "Start with a career interest test"}
        </h1>
      </section>

      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" data-testid="career-tests-single-entry">
        <h3 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
          {locale === "zh" ? "霍兰德职业兴趣测试（RIASEC）" : "Holland Career Interest Test (RIASEC)"}
        </h3>
        <p className="m-0 mt-3 text-sm leading-6 text-slate-500">
          {locale === "zh"
            ? "60 / 140 题，约 8 / 18 分钟，先得到六维兴趣结构与主次兴趣代码，再进入职业方向判断。"
            : "60 / 140 questions in about 8 / 18 minutes. Start with the six-dimension interest profile and top interest codes, then decide where to explore."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={withLocale("/tests/holland-career-interest-test-riasec")} className={buttonVariants({ variant: "default" })}>
            {locale === "zh" ? "开始测试" : "Start test"}
          </Link>
        </div>
      </section>
    </Container>
  );
}
