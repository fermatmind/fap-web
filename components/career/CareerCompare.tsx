'use client';

import { personalityCareerHref } from "@/lib/mbti/personalityCareerHref";
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Box, BriefcaseBusiness, Building2, FileText, PanelsTopLeft, Search, Sparkles } from 'lucide-react';
import { CAREER_COMPARE_OPTIONS, CAREER_COMPARE_ROWS, careerCompareItems, readCareerComparePage, readPublishedCareerTaskPage, type CompareRead } from '@/lib/career/compare';
import { DESIGN_COMPARE_TASKS, DESIGN_MBTI_EXPLORATION_NOTE, isDesignComparePair } from '@/lib/career/designComparePilot';
import { CareerCompareWorksheet, type CareerWorksheetScenario } from './CareerCompareWorksheet';
import { CareerPageItem } from '@/components/career/display/CareerPageItem';
import { CareerEvidenceLine } from '@/components/career/display/CareerEvidenceLine';
import type { CareerPage } from '@/lib/career/careerPage';
import type { DisplayLocale, Locale } from '@/lib/i18n/locales';
import { hasAnalyticsConsent } from '@/lib/consent/store';
import { trackCareerToolEvent } from '@/lib/career/toolTracking';
import styles from './CareerCompare.module.css';

type Slot = { slug: string; name?: string; read: CompareRead | { state: 'loading' | 'idle' } };
const emptySlot = (): Slot => ({ slug: '', read: { state: 'idle' } });
const careerIcons = {
  'industrial-designers': Box,
  'graphic-designers': PanelsTopLeft,
  'architects-except-landscape-and-naval': Building2,
};

function compareCopy(locale: DisplayLocale) {
  return (zh: string, en: string, traditional: string) => locale === 'zh-TW' ? traditional : locale === 'zh' ? zh : en;
}

function Items({ page, copyKeys, displayLocale }: { page: CareerPage; copyKeys: readonly string[]; displayLocale: DisplayLocale }) {
  const items = careerCompareItems(page, copyKeys);
  const copy = compareCopy(displayLocale);
  if (!items.length) return <p className={styles.missing}>{copy('未知：当前已发布正文未提供此项，请核对当地岗位要求。', 'Unknown: this field is not provided in the published profile. Check local role requirements.', '未知：目前已發布的正文未提供此項，請核對當地職缺要求。')}</p>;

  return <div className={styles.items}>
    {items.map(item => <div key={item.id} className={styles.item}>
      {item.title ? <p className={styles.itemTitle}>{item.title}</p> : null}
      <CareerPageItem item={item} content={page.content} showFaqAnswers displayLocale={displayLocale} />
      <CareerEvidenceLine content={page.content} factRefs={item.factRefs} sourceRefs={item.sourceRefs} className={styles.evidence} displayLocale={displayLocale} />
    </div>)}
  </div>;
}
function Salary({ page, metricKey, displayLocale }: { page: CareerPage; metricKey: string; displayLocale: DisplayLocale }) {
  const fact = page.hero.metrics.find(metric => metric.key === metricKey)?.fact;
  const copy = compareCopy(displayLocale);
  const zh = displayLocale !== 'en';
  if (!fact || !fact.sourceRefs.some(ref => page.content.sources.some(source => source.id === ref))) return <p className={styles.missing}>{copy('未知：没有可追溯的同口径薪资数据。', 'Unknown: no traceable salary evidence is available.', '未知：目前沒有可追溯且統計口徑一致的薪資資料。')}</p>;
  const annualPay = zh && metricKey === 'us_pay' && (fact.market === '美国' || fact.market === '美國')
    ? fact.displayValue.match(/^中位年薪\s+([\d,]+)\s*美元\s*(?:\/\s*)?/u)
    : null;
  const incomplete = zh && fact.displayValue.startsWith(copy('证据不足：', 'Insufficient evidence:', '證據不足：'));
  const payNote = annualPay ? fact.displayValue.slice(annualPay[0].length) : fact.displayValue;
  return <>
    {annualPay ? <>
      <span className={styles.payLabel}>中位年薪</span>
      <p className={styles.payAmount}>{annualPay[1]} <span>美元</span></p>
    </> : incomplete ? <p className={styles.excerpt}>{copy('暂无可核验的同口径薪资数据。', 'No comparable pay data could be verified.', '目前沒有可核實且統計口徑一致的薪資資料。')}</p> : null}
    {incomplete ? null : <p className={styles.payLabel}>{[displayLocale === 'zh-TW' && fact.market === '美国' ? '美國' : fact.market, fact.period].join(' · ')}</p>}
    {payNote ? <p className={annualPay || incomplete ? styles.evidence : styles.excerpt}>{payNote}</p> : null}
    <p className={styles.evidence}>{[fact.measure, fact.occupationScope].join(' · ')}</p>
    <CareerEvidenceLine content={page.content} factRefs={[fact.factId]} className={styles.evidence} displayLocale={displayLocale} />
  </>;
}

export function CareerCompare({ locale, displayLocale = locale, initialSlots, embedded = false, scenario }: {
  locale: Locale; displayLocale?: DisplayLocale; initialSlots?: [Slot, Slot]; embedded?: boolean; scenario?: CareerWorksheetScenario;
}) {
  const zh = locale === 'zh';
  const traditional = displayLocale === 'zh-TW';
  const copy = compareCopy(displayLocale);
  const preset = initialSlots !== undefined;
  const [slots, setSlots] = useState<[Slot, Slot]>(() => initialSlots ?? [emptySlot(), emptySlot()]);
  const requestIds = useRef([0, 0]);
  const selectors = useRef<Array<HTMLSelectElement | null>>([]);
  const [notice, setNotice] = useState('');
  const tracking = useRef<{ id: string; entered: boolean; succeeded: boolean } | null>(null);
  const pages = slots.map(slot => slot.read.state === 'ready' ? slot.read.page : null);
  const succeeded = pages.every(Boolean) && slots[0].slug !== slots[1].slug;
  const [editing, setEditing] = useState(!succeeded);

  const showWorksheet = succeeded && (scenario || ((zh || embedded) && isDesignComparePair(slots[0].slug, slots[1].slug)));

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id !== 'career-compare-worksheet' && !id.startsWith('compare-row-')) return;
    // The initial fragment can be resolved before the streamed comparison arrives.
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!tracking.current) tracking.current = { id: crypto.randomUUID(), entered: false, succeeded: false };
    const emit = () => {
      const run = tracking.current;
      if (!run || !hasAnalyticsConsent()) return;
      if (!run.entered) {
        trackCareerToolEvent('career_compare_entered', { locale, toolRunId: run.id });
        run.entered = true;
      }
      if (succeeded && !run.succeeded) {
        trackCareerToolEvent('career_compare_succeeded', { locale, toolRunId: run.id });
        run.succeeded = true;
      }
    };
    emit();
    window.addEventListener('fm:analytics-consent-updated', emit);
    return () => window.removeEventListener('fm:analytics-consent-updated', emit);
  }, [locale, succeeded]);

  async function choose(index: number, slug: string) {
    if (slug && slots[1 - index].slug === slug) {
      setNotice(copy('请选择两个不同的职业。', 'Choose two different careers.', '請選擇兩個不同的職業。'));
      return;
    }
    const requestId = ++requestIds.current[index];
    setNotice('');
    setSlots(current => current.map((slot, i) => i === index ? { slug, name: slot.name, read: { state: slug ? 'loading' : 'idle' } } : slot) as [Slot, Slot]);
    if (!slug) return;
    const read = await (scenario ? readPublishedCareerTaskPage : readCareerComparePage)(displayLocale, slug);
    if (requestIds.current[index] !== requestId) return;
    setSlots(current => current.map((slot, i) => i === index ? { slug, name: slot.name, read } : slot) as [Slot, Slot]);
  }
  const cell = (page: CareerPage, body: ReactNode) => <><span className={styles.cellName} aria-hidden="true">{page.content.subject.name}</span>{body}</>;
  function comparisonRow(key: string, label: string, render: (page: CareerPage) => ReactNode, compact = false) {
    const heading = `compare-row-${key}`;
    return <tr key={key} role="row" className={compact ? styles.compactRow : undefined}>
      <th id={heading} scope="row" role="rowheader">{label}</th>
      {pages.map(page => page ? <td role="cell" key={page.content.subject.canonicalSlug}
        headers={`${heading} compare-${page.content.subject.canonicalSlug}`}>{cell(page, render(page))}</td> : null)}
    </tr>;
  }
  const sections = [
    { id: 'compare-row-overview', label: copy('工作内容', 'Overview', '工作內容') },
    { id: 'compare-row-tasks', label: copy('工作任务', 'Tasks', '工作任務') },
    { id: 'compare-row-us_pay', label: copy('薪资参考', 'Salary references', '薪資參考') },
    ...(showWorksheet ? [{ id: 'career-compare-worksheet', label: copy('15 分钟小试做', '15-minute exercise', '15 分鐘小試作') }] : []),
    ...CAREER_COMPARE_ROWS.slice(1).map(row => ({ id: `compare-row-${row.key}`, label: row[displayLocale] })),
    { id: 'compare-row-sources', label: copy('来源与档案', 'Sources and profiles', '來源與資料') },
  ];
  const selectedNames = slots.map((slot, index) => pages[index]?.content.subject.name
    ?? slot.name ?? CAREER_COMPARE_OPTIONS.find(option => option.slug === slot.slug)?.[displayLocale]);

  const IntroHeading = embedded ? 'h4' : 'h1';
  const ResultsHeading = embedded ? 'h4' : 'h2';

  return <section className={styles.root} data-testid="career-compare">
    <header className={styles.intro}>
      <div className={styles.heroArt} aria-hidden="true">
        <div className={styles.artLeft}><FileText strokeWidth={1.25} /><Search strokeWidth={1.5} /></div>
        <div className={styles.artRight}><PanelsTopLeft strokeWidth={1.25} /><Sparkles strokeWidth={1.5} /></div>
      </div>
      <div className={styles.heroContent}>
        <IntroHeading className={styles.introTitle}>{copy('比较两个职业', 'Compare two careers', '比較兩個職業')}</IntroHeading>
        <p>{preset || succeeded
          ? (copy('并排了解工作任务、薪资和入行要求。', 'See daily tasks, pay, and entry requirements side by side.', '並排查看工作任務、薪資和入行要求。'))
          : (copy('从三个设计职业中选两个，对照它们的日常任务与入行要求。', 'Choose two of the three design careers to compare their daily work and entry requirements.', '從三個設計職業中選兩個，對照日常任務與入行要求。'))}</p>
        {preset ? <div className={styles.heroPair}>
          <span>{selectedNames[0]}</span>
          <b aria-hidden="true">VS</b>
          <span>{selectedNames[1]}</span>
        </div> : null}
        {!preset && succeeded ? <button className={styles.edit} type="button" aria-expanded={editing} aria-controls="career-compare-controls"
          onClick={() => setEditing(value => !value)}>
          {editing ? (copy('收起选择', 'Hide selectors', '收合選擇')) : (copy('更换职业', 'Change careers', '更換職業'))}
        </button> : null}
      </div>
    </header>
    {!preset || !succeeded ? <div id="career-compare-controls" className={styles.controls} hidden={succeeded && !editing}>
      {slots.map((slot, index) => <div className={styles.slot} key={index}>
        {!preset ? <div className={styles.slotActions}>
          <label htmlFor={`career-slot-${index}`} className={styles.selectLabel}>{copy('职业', 'Career', '職業') + ' ' + (index + 1)}</label>
          <select id={`career-slot-${index}`} ref={element => { selectors.current[index] = element; }} className={styles.select} value={slot.slug} onChange={event => void choose(index, event.target.value)}>
            <option value="">{copy('选择职业', 'Select a career', '選擇職業')}</option>
            {CAREER_COMPARE_OPTIONS.map(option => <option key={option.slug} value={option.slug} disabled={slots[1 - index].slug === option.slug}>{option[displayLocale]}</option>)}
          </select>
          {slot.slug ? <button className={styles.button} type="button" onClick={() => { void choose(index, ''); selectors.current[index]?.focus(); }}>{copy('移除职业', 'Remove career', '移除職業') + ' ' + (index + 1)}</button> : null}
        </div> : <p className={styles.itemTitle}>{selectedNames[index]}</p>}
        <div className={styles.slotStatus} role="status" aria-live="polite" aria-atomic="true">
          {slot.read.state === 'loading' ? <p className="mt-3">{copy('正在读取已发布职业档案…', 'Loading the published career profile…', '正在讀取已發布的職業資料…')}</p> : null}
          {slot.read.state === 'ready' ? <p className="sr-only">{slot.read.page.content.subject.name} · {copy('已加载', 'Loaded', '已載入')}</p> : null}
          {['missing', 'empty', 'error'].includes(slot.read.state) ? <p className="mt-3">{slot.read.state === 'missing' ? (copy('职业已失效或不在本次可选范围。', 'This career is unavailable or outside the pilot.', '這項職業已無法使用，或不在本次可選範圍內。')) : slot.read.state === 'empty' ? (copy('职业正文尚未发布，暂不能比较。', 'The career body is not published, so it cannot be compared.', '職業正文尚未發布，目前無法比較。')) : (copy('暂时无法读取职业档案，请重试。', 'The profile could not be loaded. Please retry.', '暫時無法讀取職業資料，請重試。'))}</p> : null}
        </div>
        {['missing', 'empty', 'error'].includes(slot.read.state) ? <button type="button" className={styles.button} onClick={() => { void choose(index, slot.slug); selectors.current[index]?.focus(); }}>{copy('重试读取', 'Retry loading', '重試讀取')}</button> : null}
      </div>)}
    </div> : null}
    <p role="status" aria-live="polite" className={notice ? styles.status : 'sr-only'}>{notice || (succeeded ? (copy('两个职业已就绪。', 'Both careers are ready.', '兩個職業的資料已就緒。')) : '')}</p>
    {succeeded ? <div className={styles.comparisonLayout}>
      <ResultsHeading id="career-compare-table-title" className={styles.resultsTitle}>
        {copy('比较结果', 'Comparison results', '比較結果')}
      </ResultsHeading>
      <nav className={styles.sectionNav} aria-label={copy('职业对比目录', 'Comparison contents', '職業比較目錄')}>
        <ul className={styles.navLinks}>
          {sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>)}
        </ul>
      </nav>
      {zh && !embedded && pages.some(page => DESIGN_COMPARE_TASKS.some(career => career.slug === page?.content.subject.canonicalSlug)) ? (
        <p className={styles.evidence}>{traditional ? '類型由編輯選作工作方式的探索示例。選擇職業時，請一併考量實際任務與入行條件。' : DESIGN_MBTI_EXPLORATION_NOTE}</p>
      ) : null}
      <div className={styles.result}>
      <table className={styles.table} role="table" aria-labelledby="career-compare-table-title" data-testid="career-compare-table">
        <colgroup><col className={styles.dimension} /><col /><col /></colgroup>
        <thead role="rowgroup">
          <tr role="row">
            <th className={styles.dimensionTitle} scope="col" role="columnheader"><span className="sr-only">{copy('核对项目', 'Compare', '核對項目')}</span></th>
            {pages.map(page => {
              if (!page) return null;
              const { canonicalSlug, name } = page.content.subject;
              const Icon = careerIcons[canonicalSlug as keyof typeof careerIcons] ?? BriefcaseBusiness;
              const design = zh ? DESIGN_COMPARE_TASKS.find(career => career.slug === canonicalSlug) : null;
              return <th key={canonicalSlug} id={`compare-${canonicalSlug}`} scope="col" role="columnheader">
                <span className={styles.careerIcon}><Icon aria-hidden="true" strokeWidth={1.6} /></span>
                <Link className={styles.careerName} href={`/${displayLocale}/career/jobs/${canonicalSlug}`}>{name}</Link>
                {design ? <>
                  <span className={styles.roleOutput}>{traditional ? design.traditional.output : design.output}</span>
                  <div className={styles.careerBadges}>
                    <a className={styles.interestBadge} href={design.interest.source} aria-label={`O*NET ${traditional ? '霍蘭德' : '霍兰德'} ${design.interest.code}，${traditional ? design.traditional.dimensions : design.interest.dimensions}`}>
                      <span>{traditional ? '霍蘭德' : '霍兰德'} <strong>{design.interest.code}</strong></span>
                      <span className={styles.interestDimensions}>{traditional ? design.traditional.dimensions : design.interest.dimensions}</span>
                    </a>
                  </div>
                  {!embedded ? <div className={styles.mbtiExploration}>
                    <span>MBTI 探索示例</span>
                    <ul aria-label={`${name}的 MBTI 探索示例`}>
                      {design.mbtiTypes.map(type => (
                        <li key={type}><Link href={personalityCareerHref(displayLocale, type)}>{type}</Link></li>
                      ))}
                    </ul>
                  </div> : null}
                </> : null}
              </th>;
            })}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {comparisonRow('overview', copy('工作内容', 'What they do', '工作內容'), page => {
            const { canonicalSlug, summary } = page.content.subject;
            const design = zh ? DESIGN_COMPARE_TASKS.find(career => career.slug === canonicalSlug) : null;
            const task = traditional ? design?.traditional.task : design?.task;
            return <p className={styles.excerpt}>{task ?? summary ?? (copy('暂无工作简介。', 'No summary is available.', '目前沒有工作簡介。'))}</p>;
          }, true)}
          {comparisonRow('tasks', copy('工作任务', 'Daily tasks', '工作任務'), page => <Items page={page} displayLocale={displayLocale} copyKeys={CAREER_COMPARE_ROWS[0].copyKeys} />)}
          {comparisonRow('us_pay', copy('美国薪资参考', 'U.S. salary reference', '美國薪資參考'), page => <Salary page={page} displayLocale={displayLocale} metricKey="us_pay" />, true)}
          {comparisonRow('china_pay', copy('中国大陆薪资参考', 'Mainland China salary reference', '中國大陸薪資參考'), page => <Salary page={page} displayLocale={displayLocale} metricKey="china_pay" />, true)}
          {CAREER_COMPARE_ROWS.slice(1).map(row => comparisonRow(row.key, row[displayLocale], page => <Items page={page} displayLocale={displayLocale} copyKeys={row.copyKeys} />))}
          {comparisonRow('sources', copy('来源与完整档案', 'Sources and full profile', '來源與完整資料'), page => <>
            <Link className={styles.profileLink} href={`/${displayLocale}/career/jobs/${page.content.subject.canonicalSlug}`}>{copy('核对完整职业档案', 'Read the full career profile', '核對完整職業資料')}</Link>
            <div className={styles.items}>{page.content.sources.map(source => <div key={source.id} className={styles.item}>
              {source.publisher && source.name !== source.publisher ? <p className={styles.itemTitle}>{source.name}</p> : null}
              <CareerEvidenceLine content={page.content} sourceRefs={[source.id]} className={styles.evidence} displayLocale={displayLocale} />
              {source.evidenceType && source.scope ? <p className={styles.evidence}>{source.scope}</p> : null}
              {source.limitation ? <p className={styles.evidence}>{source.limitation}</p> : null}
            </div>)}</div>
          </>)}
        </tbody>
      </table>
      </div>
      {showWorksheet ? <div className={styles.trial}>
        <p><strong>{scenario?.title ?? copy('同一只水杯，两种设计任务', 'One cup, two design tasks', '同一個水杯，兩種設計任務')}</strong><span>{scenario?.brief ?? copy('画杯盖草图，或做一张清洗说明海报。', 'Sketch a lid or create a cleaning guide.', '畫杯蓋草圖，或做一張清洗說明海報。')}</span></p>
        <a href="#career-compare-worksheet">{copy('开始 15 分钟小试做', 'Start the 15-minute exercise', '開始 15 分鐘小試作')} <span aria-hidden="true">↓</span></a>
      </div> : null}
      {showWorksheet ? <CareerCompareWorksheet traditional={traditional} locale={locale} embedded={embedded} scenario={scenario} /> : null}
      {!embedded ? <aside className="mt-8 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-700">
        <h2 className="mb-2 text-lg font-bold text-slate-900">{copy('接下来，找一条真实招聘核对', 'Next, check a real job posting', '接下來，找一則實際職缺來核對')}</h2>
        <p>{copy('选一个你在意的差异，用当地招聘信息核对任务、作品要求或资格。比较薪资时，请先核对地区、年份和统计口径。', 'Pick a difference you care about and check local postings for tasks, portfolio requirements or credentials. Before comparing pay, check the region, year and measure.', '選一項你在意的差異，用當地職缺資訊核對工作任務、作品要求或資格。比較薪資時，請先核對地區、年份與統計口徑。')}</p>
        <div className="mt-2 flex flex-wrap gap-x-5">
          <Link href={`/${displayLocale}/holland-test/pdf-download#my-worksheet`} className="inline-flex min-h-11 items-center font-semibold text-[var(--fm-accent)] underline underline-offset-4">{copy('填写我的职业探索记录', 'Fill in my career exploration record', '填寫我的職涯探索記錄')}</Link>
          <Link href={`/${displayLocale}/career/guides/career-transition-playbook`} className="inline-flex min-h-11 items-center font-semibold text-[var(--fm-accent)] underline underline-offset-4">{copy('使用职业转行指南', 'Use the career transition playbook', '使用職涯轉換指南')}</Link>
        </div>
      </aside> : null}
    </div> : null}
  </section>;
}
