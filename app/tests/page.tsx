import type { Metadata } from "next";
import { headers } from "next/headers";
import { TestCard } from "@/components/business/TestCard";
import { Container } from "@/components/layout/Container";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { getAllTests } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));
  const canonical = localizedPath("/tests", locale);

  return {
    title: locale === "zh" ? "测试" : "Tests",
    description: locale === "zh" ? "浏览所有可用测试。" : "Browse all available tests.",
    alternates: {
      canonical,
      languages: {
        en: "/tests",
        zh: "/zh/tests",
        "x-default": "/tests",
      },
    },
  };
}

export default async function TestsPage() {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));
  const tests = getAllTests();

  return (
    <Container as="main" className="py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{locale === "zh" ? "测试" : "Tests"}</h1>
        <p className="text-slate-600">
          {locale === "zh"
            ? "选择一个测试查看详情并开始测评。"
            : "Pick a test to view details and start assessment."}
        </p>
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
