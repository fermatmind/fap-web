import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CareerCompare } from '@/components/career/CareerCompare';
import { resolveLocale } from '@/lib/i18n/getDict';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  return buildPageMetadata({
    locale, pathname: `/${locale}/career/compare`,
    title: locale === 'zh' ? '比较两个职业' : 'Compare two careers',
    description: locale === 'zh' ? '并排核对设计职业的真实任务、环境、技能与资格边界。' : 'Compare published design career tasks, work settings, skills and credential boundaries.',
    noindex: true, noindexFollow: true,
    alternatesByLocale: { en: '/en/career/compare', zh: '/zh/career/compare', xDefault: '/' },
  });
}
export default async function CareerComparePage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = resolveLocale((await params).locale);
  // This tool has no URL state. Discard query input before rendering or analytics.
  if (Object.keys(await searchParams).length) redirect(`/${locale}/career/compare`);
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 md:py-12">
    <div className="mx-auto max-w-6xl">
      <Link href={`/${locale}/career`} className="inline-flex min-h-11 items-center text-sm font-semibold text-teal-800 underline">{locale === 'zh' ? '返回职业库' : 'Back to career library'}</Link>
      <CareerCompare key={locale} locale={locale} />
    </div>
  </main>;
}
