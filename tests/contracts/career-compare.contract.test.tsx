import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import basePage from '@/tests/fixtures/career-page/health-educators.en.json';
import { normalizeCareerPage } from '@/lib/career/careerPage';
import { CAREER_COMPARE_OPTIONS, readCareerComparePage } from '@/lib/career/compare';
import { apiClient } from '@/lib/api-client';
import { PublicReadError } from '@/lib/public-content/readError';
import { DESIGN_COMPARE_HREF, DESIGN_COMPARE_LABEL } from '@/lib/career/designComparePilot';
import { CareerRiasecExploreLink } from '@/components/career/CareerRiasecExploreLink';
import { RiasecCareerNextSteps } from '@/components/result/riasec/RiasecCareerNextSteps';
import { CareerCompare } from '@/components/career/CareerCompare';
import { EmbeddedDesignCareerCompare } from '@/components/career/EmbeddedDesignCareerCompare';
import { CareerCompareWorksheet } from '@/components/career/CareerCompareWorksheet';
import { hasAnalyticsConsent } from '@/lib/consent/store';
import { trackCareerToolEvent } from '@/lib/career/toolTracking';
import CompareRoute, { generateMetadata } from '@/app/(localized)/[locale]/career/compare/page';
import { metadata as traditionalMetadata } from '@/app/(traditional)/zh-TW/career/compare/page';

vi.mock('@/lib/api-client', () => ({ apiClient: { getPublic: vi.fn() } }));
vi.mock('@/lib/career/toolTracking', () => ({ trackCareerToolEvent: vi.fn() }));
vi.mock('@/lib/consent/store', () => ({ hasAnalyticsConsent: vi.fn(() => false) }));
vi.mock('next/navigation', () => ({ redirect: vi.fn((path: string) => { throw new Error(`redirect:${path}`); }) }));

function bundle(slug: string, locale: 'en' | 'zh' | 'zh-TW' = 'en') {
  const page = structuredClone(basePage);
  const name = locale === 'zh-TW' ? CAREER_COMPARE_OPTIONS.find(option => option.slug === slug)?.[locale] ?? slug : slug;
  const subject = { canonical_slug: slug, name, summary: null };
  page.locale = locale === 'zh' ? 'zh-CN' : locale;
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
    const locale = url.searchParams.get('locale');
    return bundle(url.pathname.split('/').at(-1)!, locale === 'zh-CN' ? 'zh' : locale === 'zh-TW' ? locale : 'en') as never;
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
  it('discards unsupported input and declares a noindex canonical', async () => {
    const params = Promise.resolve({ locale: 'en' });
    await expect(CompareRoute({ params, searchParams: Promise.resolve({ a: 'private text', b: ['bad', 'duplicate'] }) })).rejects.toThrow('redirect:/en/career/compare');
    const metadata = await generateMetadata({ params });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toContain('/en/career/compare');
  });
  it.each([
    { c1: 'industrial-designers', c2: 'industrial-designers' },
    { c1: 'industrial-designers', c2: 'architects-except-landscape-and-naval' },
    { c1: ['industrial-designers', 'industrial-designers'], c2: 'graphic-designers' },
    { c1: 'industrial-designers', c2: 'graphic-designers', note: 'private text' },
  ])('discards a malformed zh preset %# without reading career data', async searchParams => {
    const params = Promise.resolve({ locale: 'zh' });
    await expect(CompareRoute({ params, searchParams: Promise.resolve(searchParams) })).rejects.toThrow('redirect:/zh/career/compare');
    expect(apiClient.getPublic).not.toHaveBeenCalled();
  });
  it('renders the allowlisted pair from published pages on first render', async () => {
    respond();
    render(await CompareRoute({
      params: Promise.resolve({ locale: 'zh' }),
      searchParams: Promise.resolve({ c1: 'industrial-designers', c2: 'graphic-designers' }),
    }));
    expect(screen.getByTestId('career-compare-table')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '更换职业' })).not.toBeInTheDocument();
    expect(screen.getByText('Published task for industrial-designers')).toBeVisible();
    expect(screen.getByText('Published task for graphic-designers')).toBeVisible();
    expect(screen.queryByText('此槽位为空。')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '职业小试做' })).toBeInTheDocument();
  });

  it('reads the published Taiwan pair and keeps worksheet input private', async () => {
    respond();
    render(await CompareRoute({
      params: Promise.resolve({ locale: 'zh-TW' }),
      searchParams: Promise.resolve({ c1: 'industrial-designers', c2: 'graphic-designers' }),
    }));
    expect(screen.getByRole('link', { name: '工業設計師' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '職涯小試作' })).toBeInTheDocument();
    expect(screen.getByText('產品草圖與原型')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '開始霍蘭德職涯興趣測評' })).toHaveAttribute('href', '/zh-TW/tests/holland-career-interest-test-riasec');
    expect(screen.getByRole('link', { name: '使用職涯轉換指南' })).toHaveAttribute('href', '/zh-TW/career/guides/career-transition-playbook');
    expect(apiClient.getPublic).toHaveBeenCalledTimes(2);
    expect(apiClient.getPublic).toHaveBeenCalledWith(expect.stringContaining('locale=zh-TW'), expect.objectContaining({ locale: 'zh-TW' }));
    expect(traditionalMetadata.robots).toMatchObject({ index: false, follow: true });
    expect(traditionalMetadata.alternates).toEqual({ canonical: '/zh-TW/career/compare' });
    const note = '我準備保留原樣的文字';
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: note } });
    expect(screen.getByText(note, { selector: 'dd' })).toBeInTheDocument();
    expect(trackCareerToolEvent).not.toHaveBeenCalled();
    expect(apiClient.getPublic).toHaveBeenCalledTimes(2);
  });

});

describe('two-slot task flow', () => {
  it.each(['en', 'zh'] as const)('selects, replaces, removes and restores focus in %s without tracking before consent', async locale => {
    respond(); render(<CareerCompare locale={locale} />);
    const selects = screen.getAllByRole('combobox');
    const transitionLinkName = locale === 'zh' ? '使用职业转行指南' : 'Use the career transition playbook';
    const worksheetLinkName = locale === 'zh' ? '填写我的职业探索记录' : 'Fill in my career exploration record';
    expect(screen.queryByRole('link', { name: transitionLinkName })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: worksheetLinkName })).not.toBeInTheDocument();
    fireEvent.change(selects[0], { target: { value: 'industrial-designers' } });
    fireEvent.change(selects[1], { target: { value: 'graphic-designers' } });
    await screen.findByTestId('career-compare-table');
    expect(screen.getByRole('link', { name: transitionLinkName })).toHaveAttribute('href', `/${locale}/career/guides/career-transition-playbook`);
    expect(screen.getByRole('link', { name: worksheetLinkName })).toHaveAttribute('href', `/${locale}/holland-test/pdf-download#my-worksheet`);
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
    expect(screen.queryByRole('link', { name: transitionLinkName })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: worksheetLinkName })).not.toBeInTheDocument();
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
    expect(screen.queryByRole('link', { name: 'Use the career transition playbook' })).not.toBeInTheDocument();
    fireEvent.click(retry);
    expect(selects[1]).toHaveFocus();
    await screen.findByTestId('career-compare-table');
    expect(screen.getByRole('link', { name: 'Use the career transition playbook' })).toHaveAttribute('href', '/en/career/guides/career-transition-playbook');
    expect(normalizeCareerPage(bundle('industrial-designers').career_page, 'en', 'industrial-designers')).not.toBeNull();
  });
});

describe('design comparison pilot', () => {
  it.each([
    ['zh', ['r_proto_1'], true], ['zh', ['a_visual_1'], true],
    ['zh', ['c_process_1'], false], ['zh', [], false], ['en', ['a_visual_1'], false],
  ] as const)('gates the %s result CTA on shown design activities %j', (locale, activityKeys, enabled) => {
    render(<RiasecCareerNextSteps locale={locale} activityKeys={activityKeys} />);
    const link = screen.queryByRole('link', { name: DESIGN_COMPARE_LABEL });
    if (enabled) expect(link).toHaveAttribute('href', DESIGN_COMPARE_HREF);
    else expect(link).not.toBeInTheDocument();
  });

  it.each([
    ['zh', 'industrial-designers', true], ['zh', 'graphic-designers', true],
    ['zh', 'architects-except-landscape-and-naval', false], ['en', 'graphic-designers', false],
  ] as const)('gates the career CTA for %s/%s', (locale, slug, enabled) => {
    render(<CareerRiasecExploreLink locale={locale} subjectSlug={slug} careerName={slug} href="/tests" />);
    const link = screen.queryByRole('link', { name: DESIGN_COMPARE_LABEL });
    if (enabled) expect(link).toHaveAttribute('href', DESIGN_COMPARE_HREF);
    else expect(link).not.toBeInTheDocument();
  });

  it.each([
    [false, '打印 / 保存试做表', '我准备试做什么？'],
    [true, '列印 / 儲存試作表', '我準備試作什麼？'],
  ] as const)('keeps closing the print dialog separate from starting the worksheet (traditional: %s)', (traditional, printLabel, choiceLabel) => {
    vi.mocked(hasAnalyticsConsent).mockReturnValue(true);
    const print = vi.spyOn(window, 'print').mockImplementation(() => window.dispatchEvent(new Event('afterprint')));
    try {
      render(<CareerCompareWorksheet traditional={traditional} />);
      const button = screen.getByRole('button', { name: printLabel });
      const choice = screen.getByLabelText(choiceLabel);
      fireEvent.click(button);
      fireEvent.change(choice, { target: { value: ' 水杯 ' } });
      fireEvent.click(button);
      expect(print).toHaveBeenCalledTimes(2);
      expect(choice).toHaveValue(' 水杯 ');
      expect(vi.mocked(trackCareerToolEvent).mock.calls.map(call => call[0])).toEqual([
        'career_worksheet_entered',
        'career_worksheet_output_requested', 'career_worksheet_print_requested',
        'career_worksheet_output_requested', 'career_worksheet_print_requested',
      ]);
      fireEvent.change(choice, { target: { value: '画出两种杯盖并试握比较' } });
      expect(trackCareerToolEvent).toHaveBeenLastCalledWith('career_worksheet_started', expect.any(Object));
    } finally { print.mockRestore(); }
  });

  it('loads the English preset on demand and counts the exercise only after input', async () => {
    respond();
    vi.mocked(hasAnalyticsConsent).mockReturnValue(true);
    const print = vi.spyOn(window, 'print').mockImplementation(() => window.dispatchEvent(new Event('afterprint')));
    try {
      render(<EmbeddedDesignCareerCompare locale="en" />);
      expect(apiClient.getPublic).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Open comparison and 15-minute exercise' }));
      await screen.findByTestId('career-compare-table');
      expect(apiClient.getPublic).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Print or save worksheet' }));
      expect(trackCareerToolEvent).toHaveBeenCalledWith('career_worksheet_print_requested', expect.objectContaining({ locale: 'en' }));
      expect(trackCareerToolEvent).not.toHaveBeenCalledWith('career_worksheet_started', expect.any(Object));
      const notes = screen.getByLabelText('What did I learn? What do I still need to verify?');
      fireEvent.change(notes, { target: { value: 'Compare the lid and the visual guide.' } });
      expect(trackCareerToolEvent).toHaveBeenLastCalledWith('career_worksheet_started', expect.objectContaining({ locale: 'en' }));
    } finally { print.mockRestore(); }
  });

  it('starts once after ten non-whitespace characters and records only print intent', async () => {
    respond();
    render(await CompareRoute({
      params: Promise.resolve({ locale: 'zh' }),
      searchParams: Promise.resolve({ c1: 'graphic-designers', c2: 'industrial-designers' }),
    }));
    vi.mocked(hasAnalyticsConsent).mockReturnValue(true);
    const print = vi.spyOn(window, 'print').mockImplementation(() => window.dispatchEvent(new Event('afterprint')));
    try {
      const choice = screen.getByLabelText('我准备试做什么？');
      const notes = screen.getByLabelText('我发现了什么？还要验证什么？');
      fireEvent.focus(choice);
      fireEvent.change(choice, { target: { value: '   水杯  ' } });
      expect(trackCareerToolEvent).toHaveBeenCalledTimes(1);
      const privateText = '试做内容只留在这个页面';
      fireEvent.change(notes, { target: { value: privateText } });
      fireEvent.click(screen.getByRole('button', { name: '打印 / 保存试做表' }));
      expect(print).toHaveBeenCalledOnce();
      expect(notes).toHaveValue(privateText);
      expect(vi.mocked(trackCareerToolEvent).mock.calls.map(call => call[0])).toEqual([
        'career_worksheet_entered', 'career_worksheet_started', 'career_worksheet_output_requested', 'career_worksheet_print_requested',
      ]);
      expect(JSON.stringify(vi.mocked(trackCareerToolEvent).mock.calls)).not.toContain(privateText);
    } finally { print.mockRestore(); }
  });
});
