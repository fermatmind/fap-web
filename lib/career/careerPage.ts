import { normalizeCareerContentV3, type CareerContentV3, type CareerContentV3Fact } from './contentV3';
import type { Locale } from '@/lib/i18n/locales';

export const CAREER_PAGE_CONTRACT = 'career.detail.page.v1';
export const CAREER_PAGE_SECTIONS = ['quick-decision', 'profile', 'direction-comparison', 'ai-impact', 'china-salary', 'us-salary', 'fit', 'risk', 'path', 'market-signals', 'sources'] as const;
export type CareerPageMetric = { key: string; label: string; availability: 'available' | 'missing'; fact: CareerContentV3Fact | null };
export type CareerPage = {
  content: CareerContentV3;
  hero: { badges: string[]; metrics: CareerPageMetric[]; ai: CareerPageMetric };
  seo: { title: string | null; description: string | null };
};
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

export function normalizeCareerPage(value: unknown, locale: Locale, slug: string): CareerPage | null {
  if (!record(value) || value.contract_version !== CAREER_PAGE_CONTRACT || !record(value.content) || !record(value.hero) || !record(value.seo)) return null;
  const content = normalizeCareerContentV3(value.content, locale, true);
  if (!content || content.subject.canonicalSlug !== slug || value.locale !== (locale === 'zh' ? 'zh-CN' : 'en') ||
      value.source_content_sha256 !== content.sourceContentSha256 || !record(value.subject) ||
      value.subject.canonical_slug !== slug || value.subject.name !== content.subject.name) return null;
  // Reject malformed available blocks instead of silently dropping reader content.
  if (!(value.content.blocks as Record<string, unknown>[]).every((block, index) => block.availability === 'missing' || content.blocks[index]?.renderable)) return null;
  const metric = (raw: unknown, key: string): CareerPageMetric | null => {
    if (!record(raw) || raw.key !== key || !text(raw.label)) return null;
    if (raw.availability === 'missing' && raw.fact_ref === null && raw.fact === null) return { key, label: raw.label, availability: 'missing', fact: null };
    if (raw.availability !== 'available' || !text(raw.fact_ref) || !record(raw.fact)) return null;
    const fact = content.facts.find(f => f.factId === raw.fact_ref);
    if (!fact || raw.fact.fact_id !== fact.factId || raw.fact.display_value !== fact.displayValue || raw.fact.measure !== fact.measure || raw.fact.period !== fact.period) return null;
    return { key, label: raw.label, availability: 'available', fact };
  };
  if (!Array.isArray(value.hero.badges) || !value.hero.badges.every(text) || !Array.isArray(value.hero.metrics) || value.hero.metrics.length !== 5) return null;
  const keys = ['us_pay', 'us_growth', 'us_employment', 'us_openings', 'china_pay'];
  const metrics = value.hero.metrics.map((m, i) => metric(m, keys[i]));
  const ai = metric(value.hero.ai, 'ai');
  if (metrics.some(m => m === null) || !ai) return null;
  const seo: CareerPage['seo'] = {title: null, description: null};
  for (const key of ['title', 'description'] as const) {
    const field = value.seo[key];
    if (!record(field)) return null;
    if (field.availability === 'available' && text(field.text)) seo[key] = field.text;
    else if (field.availability !== 'missing' || field.text !== null) return null;
  }
  return {content, hero: {badges: value.hero.badges as string[], metrics: metrics as CareerPageMetric[], ai}, seo};
}

export function careerPageFaq(page: CareerPage): Array<{question: string; answer: string}> {
  return page.content.blocks.flatMap(block => block.items.flatMap(item => {
    if (item.type !== 'faq' || item.availability !== 'available' || !Array.isArray(item.data.entries)) return [];
    return item.data.entries.flatMap(entry => record(entry) && text(entry.question) && text(entry.answer) ? [{question: entry.question, answer: entry.answer}] : []);
  }));
}
