import actor from '@/tests/fixtures/career-page/actors.zh-CN.json';
import empty from '@/tests/fixtures/career-page/health-educators.en.json';

export function buildCareerPageFixture(slug = 'actors', locale: 'zh' | 'en' = 'zh', name?: string) {
  const page = structuredClone(locale === 'zh' ? actor : empty) as typeof actor;
  page.subject.canonical_slug = slug;
  page.content.subject.canonical_slug = slug;
  if (name) page.subject.name = page.content.subject.name = name;
  page.seo.title.text = page.subject.name;
  return page;
}
