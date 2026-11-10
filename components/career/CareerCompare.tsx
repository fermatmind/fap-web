'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Box, BriefcaseBusiness, Building2, FileText, PanelsTopLeft, Search, Sparkles } from 'lucide-react';
import { CAREER_COMPARE_OPTIONS, CAREER_COMPARE_ROWS, careerCompareItems, readCareerComparePage, type CompareRead } from '@/lib/career/compare';
import { DESIGN_COMPARE_TASKS, DESIGN_MBTI_EXPLORATION_NOTE, isDesignComparePair } from '@/lib/career/designComparePilot';
import { buildCareerRecommendationFrontendUrl } from '@/lib/career/urls';
import { CareerCompareWorksheet } from './CareerCompareWorksheet';
import { CareerPageItem } from '@/components/career/display/CareerPageItem';
import { CareerEvidenceLine } from '@/components/career/display/CareerEvidenceLine';
import type { CareerPage } from '@/lib/career/careerPage';
import type { Locale } from '@/lib/i18n/locales';
import { hasAnalyticsConsent } from '@/lib/consent/store';
import { trackCareerToolEvent } from '@/lib/career/toolTracking';
import styles from './CareerCompare.module.css';

type Slot = { slug: string; read: CompareRead | { state: 'loading' | 'idle' } };
const emptySlot = (): Slot => ({ slug: '', read: { state: 'idle' } });
const careerIcons = {
  'industrial-designers': Box,
  'graphic-designers': PanelsTopLeft,
  'architects-except-landscape-and-naval': Building2,
};

function Items({ page, copyKeys }: { page: CareerPage; copyKeys: readonly string[] }) {
  const items = careerCompareItems(page, copyKeys);
  const zh = page.content.locale === 'zh';
  if (!items.length) return <p className={styles.missing}>{zh ? '未知：当前已发布正文未提供此项，请核对当地岗位要求。' : 'Unknown: this field is not provided in the published profile. Check local role requirements.'}</p>;

  return <div className={styles.items}>
    {items.map(item => <div key={item.id} className={styles.item}>
      {item.title ? <p className={styles.itemTitle}>{item.title}</p> : null}
      <CareerPageItem item={item} content={page.content} showFaqAnswers />
      <CareerEvidenceLine content={page.content} factRefs={item.factRefs} sourceRefs={item.sourceRefs} className={styles.evidence} />
    </div>)}
  </div>;
}
function Salary({ page, metricKey }: { page: CareerPage; metricKey: string }) {
  const fact = page.hero.metrics.find(metric => metric.key === metricKey)?.fact;
  const zh = page.content.locale === 'zh';
  if (!fact || !fact.sourceRefs.some(ref => page.content.sources.some(source => source.id === ref))) return <p className={styles.missing}>{zh ? '未知：没有可追溯的同口径薪资数据。' : 'Unknown: no traceable salary evidence is available.'}</p>;
  const annualPay = zh && metricKey === 'us_pay' && fact.market === '美国'
    ? fact.displayValue.match(/^中位年薪\s+([\d,]+)\s*美元\s*(?:\/\s*)?/u)
    : null;
  const incomplete = zh && fact.displayValue.startsWith('证据不足：');
  const payNote = annualPay ? fact.displayValue.slice(annualPay[0].length) : fact.displayValue;
  return <>
    {annualPay ? <>
      <span className={styles.payLabel}>中位年薪</span>
      <p className={styles.payAmount}>{annualPay[1]} <span>美元</span></p>
    </> : incomplete ? <p className={styles.excerpt}>暂无可核验的同口径薪资数据。</p> : null}
    {incomplete ? null : <p className={styles.payLabel}>{[fact.market, fact.period].join(' · ')}</p>}
    {payNote ? <p className={annualPay || incomplete ? styles.evidence : styles.excerpt}>{payNote}</p> : null}
    <p className={styles.evidence}>{[fact.measure, fact.occupationScope].join(' · ')}</p>
    <CareerEvidenceLine content={page.content} factRefs={[fact.factId]} className={styles.evidence} />
  </>;
}

export function CareerCompare({ locale, initialSlots }: { locale: Locale; initialSlots?: [Slot, Slot] }) {
  const zh = locale === 'zh';
  const preset = initialSlots !== undefined;
  const [slots, setSlots] = useState<[Slot, Slot]>(() => initialSlots ?? [emptySlot(), emptySlot()]);
  const requestIds = useRef([0, 0]);
  const selectors = useRef<Array<HTMLSelectElement | null>>([]);
  const [notice, setNotice] = useState('');
  const tracking = useRef<{ id: string; entered: boolean; succeeded: boolean } | null>(null);
  const pages = slots.map(slot => slot.read.state === 'ready' ? slot.read.page : null);
  const succeeded = pages.every(Boolean) && slots[0].slug !== slots[1].slug;
  const [editing, setEditing] = useState(!succeeded);

  const showPilotWorksheet = zh && succeeded && isDesignComparePair(slots[0].slug, slots[1].slug);

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
      setNotice(zh ? '请选择两个不同的职业。' : 'Choose two different careers.');
      return;
    }
    const requestId = ++requestIds.current[index];
    setNotice('');
    setSlots(current => current.map((slot, i) => i === index ? { slug, read: { state: slug ? 'loading' : 'idle' } } : slot) as [Slot, Slot]);
    if (!slug) return;
    const read = await readCareerComparePage(locale, slug);
    if (requestIds.current[index] !== requestId) return;
    setSlots(current => current.map((slot, i) => i === index ? { slug, read } : slot) as [Slot, Slot]);
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
    { id: 'compare-row-overview', label: zh ? '工作内容' : 'Overview' },
    { id: 'compare-row-tasks', label: zh ? '工作任务' : 'Tasks' },
    { id: 'compare-row-us_pay', label: zh ? '薪资参考' : 'Salary references' },
    ...(showPilotWorksheet ? [{ id: 'career-compare-worksheet', label: '15 分钟小试做' }] : []),
    ...CAREER_COMPARE_ROWS.slice(1).map(row => ({ id: `compare-row-${row.key}`, label: row[locale] })),
    { id: 'compare-row-sources', label: zh ? '来源与档案' : 'Sources and profiles' },
  ];
  const selectedNames = slots.map((slot, index) => pages[index]?.content.subject.name
    ?? CAREER_COMPARE_OPTIONS.find(option => option.slug === slot.slug)?.[locale]);

  return <section className={styles.root} data-testid="career-compare">
    <header className={styles.intro}>
      <div className={styles.heroArt} aria-hidden="true">
        <div className={styles.artLeft}><FileText strokeWidth={1.25} /><Search strokeWidth={1.5} /></div>
        <div className={styles.artRight}><PanelsTopLeft strokeWidth={1.25} /><Sparkles strokeWidth={1.5} /></div>
      </div>
      <div className={styles.heroContent}>
        <h1>{zh ? '比较两个职业' : 'Compare two careers'}</h1>
        <p>{preset || succeeded
          ? (zh ? '并排了解工作任务、薪资和入行要求。' : 'See daily tasks, pay, and entry requirements side by side.')
          : (zh ? '从三个设计职业中选两个，对照它们的日常任务与入行要求。' : 'Choose two of the three design careers to compare their daily work and entry requirements.')}</p>
        {preset ? <div className={styles.heroPair}>
          <span>{selectedNames[0]}</span>
          <b aria-hidden="true">VS</b>
          <span>{selectedNames[1]}</span>
        </div> : null}
        {!preset && succeeded ? <button className={styles.edit} type="button" aria-expanded={editing} aria-controls="career-compare-controls"
          onClick={() => setEditing(value => !value)}>
          {editing ? (zh ? '收起选择' : 'Hide selectors') : (zh ? '更换职业' : 'Change careers')}
        </button> : null}
      </div>
    </header>
    {!preset || !succeeded ? <div id="career-compare-controls" className={styles.controls} hidden={succeeded && !editing}>
      {slots.map((slot, index) => <div className={styles.slot} key={index}>
        {!preset ? <div className={styles.slotActions}>
          <label htmlFor={`career-slot-${index}`} className={styles.selectLabel}>{zh ? `职业 ${index + 1}` : `Career ${index + 1}`}</label>
          <select id={`career-slot-${index}`} ref={element => { selectors.current[index] = element; }} className={styles.select} value={slot.slug} onChange={event => void choose(index, event.target.value)}>
            <option value="">{zh ? '选择职业' : 'Select a career'}</option>
            {CAREER_COMPARE_OPTIONS.map(option => <option key={option.slug} value={option.slug} disabled={slots[1 - index].slug === option.slug}>{option[locale]}</option>)}
          </select>
          {slot.slug ? <button className={styles.button} type="button" onClick={() => { void choose(index, ''); selectors.current[index]?.focus(); }}>{zh ? `移除职业 ${index + 1}` : `Remove career ${index + 1}`}</button> : null}
        </div> : <p className={styles.itemTitle}>{selectedNames[index]}</p>}
        <div className={styles.slotStatus} role="status" aria-live="polite" aria-atomic="true">
          {slot.read.state === 'loading' ? <p className="mt-3">{zh ? '正在读取已发布职业档案…' : 'Loading the published career profile…'}</p> : null}
          {slot.read.state === 'ready' ? <p className="sr-only">{slot.read.page.content.subject.name} · {zh ? '已加载' : 'Loaded'}</p> : null}
          {['missing', 'empty', 'error'].includes(slot.read.state) ? <p className="mt-3">{slot.read.state === 'missing' ? (zh ? '职业已失效或不在本次可选范围。' : 'This career is unavailable or outside the pilot.') : slot.read.state === 'empty' ? (zh ? '职业正文尚未发布，暂不能比较。' : 'The career body is not published, so it cannot be compared.') : (zh ? '暂时无法读取职业档案，请重试。' : 'The profile could not be loaded. Please retry.')}</p> : null}
        </div>
        {['missing', 'empty', 'error'].includes(slot.read.state) ? <button type="button" className={styles.button} onClick={() => { void choose(index, slot.slug); selectors.current[index]?.focus(); }}>{zh ? '重试读取' : 'Retry loading'}</button> : null}
      </div>)}
    </div> : null}
    <p role="status" aria-live="polite" className={notice ? styles.status : 'sr-only'}>{notice || (succeeded ? (zh ? '两个职业已就绪。' : 'Both careers are ready.') : '')}</p>
    {succeeded ? <div className={styles.comparisonLayout}>
      <h2 id="career-compare-table-title" className={styles.resultsTitle}>
        {zh ? '比较结果' : 'Comparison results'}
      </h2>
      <nav className={styles.sectionNav} aria-label={zh ? '职业对比目录' : 'Comparison contents'}>
        <ul className={styles.navLinks}>
          {sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>)}
        </ul>
      </nav>
      {zh && pages.some(page => DESIGN_COMPARE_TASKS.some(career => career.slug === page?.content.subject.canonicalSlug)) ? (
        <p className={styles.evidence}>{DESIGN_MBTI_EXPLORATION_NOTE}</p>
      ) : null}
      <div className={styles.result}>
      <table className={styles.table} role="table" aria-labelledby="career-compare-table-title" data-testid="career-compare-table">
        <colgroup><col className={styles.dimension} /><col /><col /></colgroup>
        <thead role="rowgroup">
          <tr role="row">
            <th className={styles.dimensionTitle} scope="col" role="columnheader"><span className="sr-only">{zh ? '核对项目' : 'Compare'}</span></th>
            {pages.map(page => {
              if (!page) return null;
              const { canonicalSlug, name } = page.content.subject;
              const Icon = careerIcons[canonicalSlug as keyof typeof careerIcons] ?? BriefcaseBusiness;
              const design = zh ? DESIGN_COMPARE_TASKS.find(career => career.slug === canonicalSlug) : null;
              return <th key={canonicalSlug} id={`compare-${canonicalSlug}`} scope="col" role="columnheader">
                <span className={styles.careerIcon}><Icon aria-hidden="true" strokeWidth={1.6} /></span>
                <Link className={styles.careerName} href={`/${locale}/career/jobs/${canonicalSlug}`}>{name}</Link>
                {design ? <>
                  <span className={styles.roleOutput}>{design.output}</span>
                  <div className={styles.careerBadges}>
                    <a className={styles.interestBadge} href={design.interest.source} aria-label={`O*NET 霍兰德 ${design.interest.code}，${design.interest.dimensions}`}>
                      <span>霍兰德 <strong>{design.interest.code}</strong></span>
                      <span className={styles.interestDimensions}>{design.interest.dimensions}</span>
                    </a>
                  </div>
                  <div className={styles.mbtiExploration}>
                    <span>MBTI 探索示例</span>
                    <ul aria-label={`${name}的 MBTI 探索示例`}>
                      {design.mbtiTypes.map(type => (
                        <li key={type}><Link href={`${buildCareerRecommendationFrontendUrl(locale, type)}#design-mbti-exploration`}>{type}</Link></li>
                      ))}
                    </ul>
                  </div>
                </> : null}
              </th>;
            })}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {comparisonRow('overview', zh ? '工作内容' : 'What they do', page => {
            const { canonicalSlug, summary } = page.content.subject;
            const task = zh ? DESIGN_COMPARE_TASKS.find(career => career.slug === canonicalSlug)?.task : null;
            return <p className={styles.excerpt}>{task ?? summary ?? (zh ? '暂无工作简介。' : 'No summary is available.')}</p>;
          }, true)}
          {comparisonRow('tasks', zh ? '工作任务' : 'Daily tasks', page => <Items page={page} copyKeys={CAREER_COMPARE_ROWS[0].copyKeys} />)}
          {comparisonRow('us_pay', zh ? '美国薪资参考' : 'U.S. salary reference', page => <Salary page={page} metricKey="us_pay" />, true)}
          {comparisonRow('china_pay', zh ? '中国大陆薪资参考' : 'Mainland China salary reference', page => <Salary page={page} metricKey="china_pay" />, true)}
          {CAREER_COMPARE_ROWS.slice(1).map(row => comparisonRow(row.key, row[locale], page => <Items page={page} copyKeys={row.copyKeys} />))}
          {comparisonRow('sources', zh ? '来源与完整档案' : 'Sources and full profile', page => <>
            <Link className={styles.profileLink} href={`/${locale}/career/jobs/${page.content.subject.canonicalSlug}`}>{zh ? '核对完整职业档案' : 'Read the full career profile'}</Link>
            <div className={styles.items}>{page.content.sources.map(source => <div key={source.id} className={styles.item}>
              {source.publisher && source.name !== source.publisher ? <p className={styles.itemTitle}>{source.name}</p> : null}
              <CareerEvidenceLine content={page.content} sourceRefs={[source.id]} className={styles.evidence} />
              {source.evidenceType && source.scope ? <p className={styles.evidence}>{source.scope}</p> : null}
              {source.limitation ? <p className={styles.evidence}>{source.limitation}</p> : null}
            </div>)}</div>
          </>)}
        </tbody>
      </table>
      </div>
      {showPilotWorksheet ? <div className={styles.trial}>
        <p><strong>同一只水杯，两种设计任务</strong><span>画杯盖草图，或做一张清洗说明海报。</span></p>
        <a href="#career-compare-worksheet">开始 15 分钟小试做 <span aria-hidden="true">↓</span></a>
      </div> : null}
      {showPilotWorksheet ? <CareerCompareWorksheet /> : null}
      <aside className="mt-8 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-700">
        <h2 className="mb-2 text-lg font-bold text-slate-900">{zh ? '接下来，找一条真实招聘核对' : 'Next, check a real job posting'}</h2>
        <p>{zh ? '选一个你在意的差异，用当地招聘信息核对任务、作品要求或资格。比较薪资时，请先核对地区、年份和统计口径。' : 'Pick a difference you care about and check local postings for tasks, portfolio requirements or credentials. Before comparing pay, check the region, year and measure.'}</p>
        <div className="mt-2 flex flex-wrap gap-x-5">
          <Link href={`/${locale}/holland-test/pdf-download#my-worksheet`} className="inline-flex min-h-11 items-center font-semibold text-[var(--fm-accent)] underline underline-offset-4">{zh ? '填写我的职业探索记录' : 'Fill in my career exploration record'}</Link>
          <Link href={`/${locale}/career/guides/career-transition-playbook`} className="inline-flex min-h-11 items-center font-semibold text-[var(--fm-accent)] underline underline-offset-4">{zh ? '使用职业转行指南' : 'Use the career transition playbook'}</Link>
        </div>
      </aside>
    </div> : null}
  </section>;
}
