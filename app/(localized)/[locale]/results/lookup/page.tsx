import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ResultEmailLookupForm } from "@/components/support/ResultEmailLookupForm";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return {
    title: locale === "zh" ? "结果找回" : "Result Lookup",
    description:
      locale === "zh"
        ? "通过邮箱找回已保存的结果。"
        : "Find saved result pages by email.",
    robots: NOINDEX_ROBOTS,
    alternates: {
      canonical: localizedPath("/results/lookup", locale),
    },
  };
}

export default async function ResultLookupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";

  return (
    <Container as="main" className="max-w-2xl py-10">
      <div className="space-y-2 pb-4">
        <h1 className="m-0 text-2xl font-bold text-slate-900">
          {isZh ? "找回结果" : "Find saved results"}
        </h1>
        <p className="m-0 text-sm text-slate-600">
          {isZh ? "输入邮箱查看该邮箱下保存的结果。" : "Enter an email to view saved results for that email."}
        </p>
      </div>
      <ResultEmailLookupForm locale={locale} />
    </Container>
  );
}
