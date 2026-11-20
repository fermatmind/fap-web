import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fixedComparisonPairs, fixedComparisonPath, isFixedComparisonLocale, isFixedComparisonPreviewEnabled } from "@/lib/career/fixedComparisonPreview";

export const metadata: Metadata = { title: "Career comparisons · 職業對比", robots: { index: false, follow: true } };
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string; page?: string }> };
export default async function ComparisonIndex({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isFixedComparisonPreviewEnabled() || !isFixedComparisonLocale(locale)) notFound();
  const { q = "", page = "1" } = await searchParams;
  const rows = fixedComparisonPairs.filter(pair => pair.labels[locale] && `${pair.slugs.join(" ")} ${Object.values(pair.labels).join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  const pages = Math.max(1, Math.ceil(rows.length / 60));
  const current = Math.min(pages, Math.max(1, Number.parseInt(page, 10) || 1));
  const title = locale === "en" ? "Career comparisons" : locale === "zh-TW" ? "職業對比" : "职业对比";
  return <main className="mx-auto max-w-5xl px-4 py-10" data-comparison-index lang={locale === "zh" ? "zh-CN" : locale}>
    <h1 className="text-3xl font-semibold">{title}</h1>
    <nav data-comparison-languages className="my-5 flex gap-4" aria-label="Languages">
      {(["zh", "en", "zh-TW"] as const).map(language => <Link prefetch={false} lang={language === "zh" ? "zh-CN" : language} key={language} href={`/${language}/career-compare`} aria-current={language === locale ? "page" : undefined} className="underline">{{ zh: "简体中文", en: "English", "zh-TW": "繁體中文" }[language]}</Link>)}
    </nav>
    <p className="my-4">{rows.length} {locale === "en" ? "comparisons" : locale === "zh-TW" ? "組職業對比" : "组职业对比"}</p>
    <form className="my-6 flex flex-wrap gap-3" action={`/${locale}/career-compare`}>
      <label htmlFor="comparison-query">{locale === "en" ? "Search" : locale === "zh-TW" ? "搜尋" : "搜索"}</label>
      <input id="comparison-query" name="q" defaultValue={q} className="min-w-0 flex-1 rounded border p-2" />
      <button className="rounded border px-4 py-2" type="submit">{locale === "en" ? "Search" : locale === "zh-TW" ? "搜尋" : "查找"}</button>
    </form>
    <ul className="grid gap-3 sm:grid-cols-2">{rows.slice((current - 1) * 60, current * 60).map(pair => <li key={pair.slugs.join("-vs-")}><Link prefetch={false} className="block rounded-xl border p-4 underline underline-offset-4" href={fixedComparisonPath(locale, pair)}>{pair.labels[locale]}</Link></li>)}</ul>
    <nav className="my-8 flex gap-5" aria-label="Pagination">
      {current > 1 && <Link prefetch={false} href={`?q=${encodeURIComponent(q)}&page=${current - 1}`}>←</Link>}
      <span>{current} / {pages}</span>
      {current < pages && <Link prefetch={false} href={`?q=${encodeURIComponent(q)}&page=${current + 1}`}>→</Link>}
    </nav>
  </main>;
}
