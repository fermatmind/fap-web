import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import basePage from '@/tests/fixtures/career-page/health-educators.en.json';
import { normalizeCareerPage } from '@/lib/career/careerPage';
import { CAREER_COMPARE_OPTIONS, readCareerComparePage } from '@/lib/career/compare';
import { apiClient } from '@/lib/api-client';
import { PublicReadError } from '@/lib/public-content/readError';
import { CareerCompare } from '@/components/career/CareerCompare';
import { hasAnalyticsConsent } from '@/lib/consent/store';
import { trackCareerToolEvent } from '@/lib/career/toolTracking';
import CompareRoute, { generateMetadata } from '@/app/(localized)/[locale]/career/compare/page';

vi.mock('@/lib/api-client', () => ({ apiClient: { getPublic: vi.fn() } }));
vi.mock('@/lib/career/toolTracking', () => ({ trackCareerToolEvent: vi.fn() }));
vi.mock('@/lib/consent/store', () => ({ hasAnalyticsConsent: vi.fn(() => false) }));
vi.mock('next/navigation', () => ({ redirect: vi.fn((path: string) => { throw new Error(`redirect:${path}`); }) }));

function bundle(slug: string, locale: 'en' | 'zh' = 'en') {
  const page = structuredClone(basePage);
  const subject = { canonical_slug: slug, name: slug, summary: null };
  page.locale = locale === 'zh' ? 'zh-CN' : 'en';
  page.subject = subject;
  page.content.subject = subject;
  page.content.locale = page.locale;
  page.content.content_state = 'enhanced';
  Object.assign(page.content, { blocks: [{ id: 'profile', copy_key: 'career.block.profile', content_state: 'enhanced', availability: 'available', items: [
    { id: 'tasks', copy_key: 'career.item.responsibilities-block', type: 'list', availability: 'available', data: { entries: [`Published task for ${slug}`] } },
    { id: 'context', copy_key: 'career.item.work-context-block', type: 'prose', availability: 'available', data: { paragraphs: ['Published environment'] } },
  ] }] });
  return {
    bundle_kind: 'career_job_detail', bundle_version: 'career.detail.page.v1', identity: { canonical_slug: slug },
    locale_policy: { requested_locale: page.locale },
    seo_contract: { metadata_fingerprint: page.source_content_sha256, canonical_path: `/${locale}/career/jobs/${slug}`, canonical_target: `/${locale}/career/jobs/${slug}`, index_eligible: true, index_state: 'index', reason_codes: [], robots_policy: 'index,follow' },
    career_page: page,
  };
}
function respond() {
  vi.mocked(apiClient.getPublic).mockImplementation(async path => {
    const url = new URL(path, 'https://api.fermatmind.com');
    return bundle(url.pathname.split('/').at(-1)!, url.searchParams.get('locale') === 'zh-CN' ? 'zh' : 'en') as never;
  });
}
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.mocked(hasAnalyticsConsent).mockReturnValue(false); });

describe('career comparison public reader', () => {
  it.each(['en', 'zh'] as const)('validates %s identities and version before display', async locale => {
    respond();
    expect((await readCareerComparePage(locale, CAREER_COMPARE_OPTIONS[0].slug)).state).toBe('ready');
    vi.mocked(apiClient.getPublic).mockResolvedValueOnce(bundle('graphic-designers', locale) as never);
    expect((await readCareerComparePage(locale, 'industrial-designers')).state).toBe('error');
    vi.mocked(apiClient.getPublic).mockResolvedValueOnce({ ...bundle('industrial-designers', locale), bundle_version: 'old' } as never);
    expect((await readCareerComparePage(locale, 'industrial-designers')).state).toBe('error');
    expect(apiClient.getPublic).toHaveBeenCalledWith(expect.stringContaining('projection_contract=career.detail.page.v1'), { locale, skipAuth: true, timeoutMs: 12_000, cache: 'no-store' });
    const wrongVersion = bundle('industrial-designers', locale);
    wrongVersion.career_page.contract_version = 'old';
    vi.mocked(apiClient.getPublic).mockResolvedValueOnce(wrongVersion as never);
    expect((await readCareerComparePage(locale, 'industrial-designers')).state).toBe('error');
    const wrongLocale = bundle('industrial-designers', locale === 'en' ? 'zh' : 'en');
    vi.mocked(apiClient.getPublic).mockResolvedValueOnce(wrongLocale as never);
    expect((await readCareerComparePage(locale, 'industrial-designers')).state).toBe('error');
  });
  it('distinguishes invalid ID, retired ID, missing body, empty comparison data and request failure', async () => {
    expect((await readCareerComparePage('en', '../private')).state).toBe('missing');
    expect(apiClient.getPublic).not.toHaveBeenCalled();
    vi.mocked(apiClient.getPublic).mockRejectedValueOnce(new PublicReadError({ kind: 'not_found' }));
    expect((await readCareerComparePage('en', 'industrial-designers')).state).toBe('missing');
    vi.mocked(apiClient.getPublic).mockResolvedValueOnce(null as never);
    expect((await readCareerComparePage('en', 'industrial-designers')).state).toBe('error');
    const empty = bundle('industrial-designers');
    empty.career_page.content.content_state = 'legacy';
    empty.career_page.content.blocks = [];
    vi.mocked(apiClient.getPublic).mockResolvedValueOnce(empty as never);
    expect((await readCareerComparePage('en', 'industrial-designers')).state).toBe('empty');
    const noTasks = bundle('industrial-designers');
    Object.assign(noTasks.career_page.content, { blocks: [{ id: 'profile', copy_key: 'career.block.profile', content_state: 'enhanced', availability: 'available', items: [{ id: 'body', copy_key: 'career.item.definition-block', type: 'list', availability: 'available', data: { entries: ['Other body'] } }] }] });
    vi.mocked(apiClient.getPublic).mockResolvedValueOnce(noTasks as never);
    expect((await readCareerComparePage('en', 'industrial-designers')).state).toBe('empty');
    vi.mocked(apiClient.getPublic).mockRejectedValueOnce(new Error('timeout'));
    expect((await readCareerComparePage('en', 'industrial-designers')).state).toBe('error');
  });
  it('keeps all query input out of tool state and declares a noindex canonical', async () => {
    const params = Promise.resolve({ locale: 'en' });
    await expect(CompareRoute({ params, searchParams: Promise.resolve({ a: 'private text', b: ['bad', 'duplicate'] }) })).rejects.toThrow('redirect:/en/career/compare');
    const metadata = await generateMetadata({ params });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toContain('/en/career/compare');
  });
});

describe('two-slot task flow', () => {
  it.each(['en', 'zh'] as const)('selects, replaces, removes and restores focus in %s without tracking before consent', async locale => {
    respond(); render(<CareerCompare locale={locale} />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'industrial-designers' } });
    fireEvent.change(selects[1], { target: { value: 'graphic-designers' } });
    await screen.findByTestId('career-compare-table');
    expect(screen.getByText('Published task for industrial-designers')).toBeInTheDocument();
    expect(screen.getAllByText(locale === 'zh' ? /未知：/ : /Unknown:/).length).toBeGreaterThan(0);
    expect(trackCareerToolEvent).not.toHaveBeenCalled();
    const disabled = selects[1].querySelector('option[value="industrial-designers"]') as HTMLOptionElement;
    expect(disabled.disabled).toBe(true);
    fireEvent.change(selects[1], { target: { value: 'industrial-designers' } });
    expect(selects[1]).toHaveValue('graphic-designers');
    vi.mocked(hasAnalyticsConsent).mockReturnValue(true);
    fireEvent(window, new CustomEvent('fm:analytics-consent-updated'));
    expect(vi.mocked(trackCareerToolEvent).mock.calls.map(call => call[0])).toEqual(['career_compare_entered', 'career_compare_succeeded']);
    expect(vi.mocked(trackCareerToolEvent).mock.calls[0][1]).toEqual(vi.mocked(trackCareerToolEvent).mock.calls[1][1]);
    fireEvent.change(selects[1], { target: { value: 'architects-except-landscape-and-naval' } });
    await screen.findByText('Published task for architects-except-landscape-and-naval');
    expect(trackCareerToolEvent).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: locale === 'zh' ? '移除职业 1' : 'Remove career 1' }));
    expect(selects[0]).toHaveFocus();
    expect(screen.queryByTestId('career-compare-table')).not.toBeInTheDocument();
  });
  it('supports keyboard selection and exposes an accessible comparison table', async () => {
    respond(); const user = userEvent.setup();
    const { container } = render(<CareerCompare locale="en" />);
    await user.tab();
    expect(screen.getAllByRole('combobox')[0]).toHaveFocus();
    await user.selectOptions(screen.getAllByRole('combobox')[0], 'industrial-designers');
    await user.selectOptions(screen.getAllByRole('combobox')[1], 'graphic-designers');
    await screen.findByTestId('career-compare-table');
    const result = await axe(container);
    expect(result.violations).toEqual([]);
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });
  it('shows loading, retry recovery and ignores an obsolete request after replacement', async () => {
    let resolve!: (value: never) => void;
    respond();
    vi.mocked(apiClient.getPublic).mockImplementationOnce(() => new Promise(r => { resolve = r; }));
    render(<CareerCompare locale="en" />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'industrial-designers' } });
    expect(screen.getByText('Loading the published career profile…')).toBeInTheDocument();
    fireEvent.change(selects[0], { target: { value: 'graphic-designers' } });
    await screen.findByText('graphic-designers · Loaded');
    resolve(bundle('industrial-designers') as never);
    await waitFor(() => expect(selects[0]).toHaveValue('graphic-designers'));
    vi.mocked(apiClient.getPublic).mockRejectedValueOnce(new Error('offline'));
    fireEvent.change(selects[1], { target: { value: 'industrial-designers' } });
    const retry = await screen.findByRole('button', { name: 'Retry loading' });
    fireEvent.click(retry);
    expect(selects[1]).toHaveFocus();
    await screen.findByTestId('career-compare-table');
    expect(normalizeCareerPage(bundle('industrial-designers').career_page, 'en', 'industrial-designers')).not.toBeNull();
  });
});
