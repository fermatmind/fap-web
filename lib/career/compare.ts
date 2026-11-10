import { apiClient } from '@/lib/api-client';
import { CAREER_DETAIL_PROJECTION_CACHE_VERSION } from '@/lib/career/api/fetchCareerJobBundle';
import type { CareerJobBundleResponseRaw } from '@/lib/career/api/types';
import { isAuthoritativePublicAbsence } from '@/lib/public-content/readError';
import { CAREER_PAGE_CONTRACT, normalizeCareerPage, careerPageHasPublicBody, validateCareerPageAuthority, type CareerPage } from '@/lib/career/careerPage';
import { toApiLocale, type DisplayLocale } from '@/lib/i18n/locales';

// UI eligibility only. All facts, localized names and versions come from the public reader.
export const CAREER_COMPARE_OPTIONS = [
  { slug: 'industrial-designers', en: 'Industrial Designers', zh: '工业设计师', 'zh-TW': "工業設計師" },
  { slug: 'graphic-designers', en: 'Graphic Designers', zh: '平面设计师', 'zh-TW': "平面設計師" },
  { slug: 'architects-except-landscape-and-naval', en: 'Architect', zh: '建筑师', 'zh-TW': "建築師" },
] as const;
export function isCareerCompareSlug(slug: string): boolean {
  return CAREER_COMPARE_OPTIONS.some(option => option.slug === slug);
}
export type CompareRead = { state: 'ready'; page: CareerPage } | { state: 'missing' | 'empty' | 'error' };
export async function readCareerComparePage(locale: DisplayLocale, slug: string): Promise<CompareRead> {
  if (!isCareerCompareSlug(slug)) return { state: 'missing' };
  try {
    const query = new URLSearchParams({ locale: locale === "zh-TW" ? locale : toApiLocale(locale), projection_contract: CAREER_DETAIL_PROJECTION_CACHE_VERSION });
    // Same published reader, with browser-safe no-store semantics. The detail
    // SSR helper's authored Cache-Control/Pragma headers fail CORS preflight.
    const envelope = await apiClient.getPublic<CareerJobBundleResponseRaw>(
      `/v0.5/career/jobs/${encodeURIComponent(slug)}?${query}`,
      { locale, skipAuth: true, timeoutMs: 12_000, cache: 'no-store' },
    );
    if (!envelope) return { state: 'error' };
    const raw = (envelope.data && typeof envelope.data === 'object' ? envelope.data : envelope) as Record<string, unknown>;
    if (raw.bundle_kind !== 'career_job_detail' || raw.bundle_version !== CAREER_PAGE_CONTRACT) return { state: 'error' };
    const page = normalizeCareerPage(raw.career_page, locale, slug);
    if (!page) return { state: 'error' };
    validateCareerPageAuthority(raw, page, locale, slug);
    if (!careerPageHasPublicBody(page) || !careerCompareItems(page, ['career.item.responsibilities-block']).length) return { state: 'empty' };
    return { state: 'ready', page };
  } catch (error) {
    return { state: isAuthoritativePublicAbsence(error) ? 'missing' : 'error' };
  }
}
export const CAREER_COMPARE_ROWS = [
  { key: 'tasks', en: 'Daily tasks', zh: '日常任务', 'zh-TW': "日常任務", copyKeys: ['career.item.responsibilities-block'] },
  { key: 'context', en: 'Work environment', zh: '工作环境', 'zh-TW': "工作環境", copyKeys: ['career.item.work-context-block'] },
  { key: 'skills', en: 'Skills and work evidence', zh: '技能与作品证据', 'zh-TW': "技能與作品證據", copyKeys: ['career.item.employer-evidence'] },
  { key: 'credentials', en: 'Entry and credentials', zh: '入行与资格边界', 'zh-TW': "入行與資格邊界", copyKeys: ['career.item.credential-decision', 'career.item.credential-boundary'] },
] as const;
export function careerCompareItems(page: CareerPage, copyKeys: readonly string[]) {
  return page.content.blocks.filter(block => block.availability === 'available').flatMap(block => block.items)
    .filter(item => item.availability === 'available' && copyKeys.includes(item.copyKey));
}
