import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CareerCompare, type CareerCompareOption } from '@/components/career/CareerCompare';
import { adaptCareerJobIndex } from '@/lib/career/adapters/adaptCareerJobIndex';
import { fetchCareerJobIndex } from '@/lib/career/api/fetchCareerJobIndex';
import { loadTraditionalDirectoryLanguage } from '@/lib/career/traditionalDirectory';
import { readCareerComparePage } from '@/lib/career/compare';
import { isDesignComparePair } from '@/lib/career/designComparePilot';
import { resolveLocale } from '@/lib/i18n/getDict';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  return buildPageMetadata({
    locale, pathname: `/${locale}/career/compare`,
    title: locale === 'zh' ? '比较两个职业' : 'Compare two careers',
    description: locale === 'zh' ? '并排核对两个职业的真实任务、环境、技能与资格边界。' : 'Compare published career tasks, work settings, skills and credential boundaries.',
    noindex: true, noindexFollow: true,
    alternatesByLocale: { en: '/en/career/compare', zh: '/zh/career/compare', xDefault: '/' },
  });
}
export default async function CareerComparePage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const displayLocale = localeParam === 'zh-TW' ? 'zh-TW' : locale;
  const Surface = displayLocale === 'zh-TW' ? 'div' : 'main';
  const query = await searchParams;
  const { c1, c2 } = query;
  const pilot = locale === 'zh' && Object.keys(query).length === 2 &&
    typeof c1 === 'string' && typeof c2 === 'string' && isDesignComparePair(c1, c2);
  if (!pilot && Object.keys(query).length) redirect(`/${displayLocale}/career/compare`);
  const [payload, traditionalLanguage, initialReads] = await Promise.all([
    fetchCareerJobIndex({ locale }).catch(() => null),
    displayLocale === 'zh-TW' ? loadTraditionalDirectoryLanguage() : null,
    pilot ? Promise.all([
      readCareerComparePage(displayLocale, c1), readCareerComparePage(displayLocale, c2),
    ]) : undefined,
  ]);
  const options: CareerCompareOption[] = adaptCareerJobIndex({ locale: 'zh', payload }).map(({ identity, titles }) => ({
    slug: identity.canonicalSlug,
    en: titles.canonicalEn ?? identity.canonicalSlug,
    zh: titles.title,
    'zh-TW': traditionalLanguage?.display(titles.title) ?? titles.title,
  }));
  options.sort((a, b) => a[displayLocale].localeCompare(b[displayLocale], displayLocale));
  return <Surface className="min-h-screen bg-[var(--fm-bg-career-warm)] pb-10 print:min-h-0 print:bg-white">
    <CareerCompare key={pilot ? `${c1}:${c2}` : locale} locale={locale} displayLocale={displayLocale} options={options.length ? options : undefined} initialSlots={pilot && initialReads ? [
      { slug: c1, read: initialReads[0] }, { slug: c2, read: initialReads[1] },
    ] : undefined} />
  </Surface>;
}
