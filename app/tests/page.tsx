import type { Metadata } from "next";
import { headers } from "next/headers";
import { TestCard } from "@/components/business/TestCard";
import { Container } from "@/components/layout/Container";
import { getAllTests } from "@/lib/content";
import { getDictSync } from "@/lib/i18n/getDict";
import { resolveRequestLocale } from "@/lib/i18n/resolveRequestLocale";
import { canonicalUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const locale = resolveRequestLocale(requestHeaders);
  const isZh = locale === "zh";

  return {
    title: isZh ? "测评列表" : "Tests",
    description: isZh ? "浏览所有可用测评。" : "Browse all available tests.",
    alternates: {
      canonical: canonicalUrl(isZh ? "/zh/tests" : "/tests"),
      languages: {
        en: canonicalUrl("/tests"),
        zh: canonicalUrl("/zh/tests"),
        "x-default": canonicalUrl("/tests"),
      },
    },
  };
}

export default async function TestsPage() {
  const requestHeaders = await headers();
  const locale = resolveRequestLocale(requestHeaders);
  const dict = getDictSync(locale);
  const tests = getAllTests();

  return (
    <Container as="main" className="py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{dict.tests.title}</h1>
        <p className="text-slate-600">{dict.tests.subtitle}</p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tests.map((test) => (
          <TestCard
            key={test.slug}
            slug={test.slug}
            title={test.title}
            description={test.description}
            coverImage={test.cover_image}
            questions={test.questions_count}
            timeMinutes={test.time_minutes}
            scaleCode={test.scale_code}
            locale={locale}
          />
        ))}
      </div>
    </Container>
  );
}
