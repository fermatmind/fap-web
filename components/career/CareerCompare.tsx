'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { CAREER_COMPARE_OPTIONS, CAREER_COMPARE_ROWS, careerCompareItems, readCareerComparePage, type CompareRead } from '@/lib/career/compare';
import { CareerPageItem } from '@/components/career/display/CareerPageItem';
import { CareerEvidenceLine } from '@/components/career/display/CareerEvidenceLine';
import type { CareerPage } from '@/lib/career/careerPage';
import type { Locale } from '@/lib/i18n/locales';
import { hasAnalyticsConsent } from '@/lib/consent/store';
import { trackCareerToolEvent } from '@/lib/career/toolTracking';
import styles from './CareerCompare.module.css';

type Slot = { slug: string; read: CompareRead | { state: 'loading' | 'idle' } };
const emptySlot = (): Slot => ({ slug: '', read: { state: 'idle' } });

function Items({ page, copyKeys }: { page: CareerPage; copyKeys: readonly string[] }) {
  const items = careerCompareItems(page, copyKeys);
  const zh = page.content.locale === 'zh';
  if (!items.length) return <p>{zh ? '未知：当前已发布正文未提供此项，请核对当地岗位要求。' : 'Unknown: this field is not provided in the published profile. Check local role requirements.'}</p>;
  const render = (index: number) => <div key={items[index].id} className="my-3 min-w-0">
    {items[index].title ? <p className="font-semibold">{items[index].title}</p> : null}
    <CareerPageItem item={items[index]} content={page.content} />
    <CareerEvidenceLine content={page.content} factRefs={items[index].factRefs} sourceRefs={items[index].sourceRefs} />
  </div>;
  return <>{render(0)}{items.length > 1 ? <details><summary>{zh ? `展开其余 ${items.length - 1} 项原文` : `Read ${items.length - 1} more published items`}</summary>{items.slice(1).map((_, i) => render(i + 1))}</details> : null}</>;
}
function Salary({ page, metricKey }: { page: CareerPage; metricKey: string }) {
  const fact = page.hero.metrics.find(metric => metric.key === metricKey)?.fact;
  const zh = page.content.locale === 'zh';
  if (!fact || !fact.sourceRefs.some(ref => page.content.sources.some(source => source.id === ref))) return <p>{zh ? '未知：没有可追溯的同口径薪资数据。' : 'Unknown: no traceable salary evidence is available.'}</p>;
  return <><p className="font-semibold">{fact.displayValue}</p><p className="text-sm">{[fact.market, fact.period, fact.measure, fact.occupationScope].join(' · ')}</p><CareerEvidenceLine content={page.content} factRefs={[fact.factId]} /></>;
}

export function CareerCompare({ locale }: { locale: Locale }) {
  const zh = locale === 'zh';
  const [slots, setSlots] = useState<[Slot, Slot]>([emptySlot(), emptySlot()]);
  const requestIds = useRef([0, 0]);
  const selectors = useRef<Array<HTMLSelectElement | null>>([]);
  const [notice, setNotice] = useState('');
  const tracking = useRef<{ id: string; entered: boolean; succeeded: boolean } | null>(null);
  const pages = slots.map(slot => slot.read.state === 'ready' ? slot.read.page : null);
  const succeeded = pages.every(Boolean) && slots[0].slug !== slots[1].slug;

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
  const cell = (page: CareerPage, body: ReactNode) => <><span className={styles.mobileName} aria-hidden="true">{page.content.subject.name}</span>{body}</>;

  return <section className={styles.root} data-testid="career-compare">
    <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{zh ? '比较两个职业' : 'Compare two careers'}</h1>
    <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">{zh ? '在产品设计、视觉传播和建筑设计之间，哪种日常任务值得你进一步验证？把两个已发布档案放在一起，核对差异与尚待确认的条件。' : 'Product design, visual communication or building design: which daily work would you investigate next? Put two published profiles side by side to check differences and unresolved conditions.'}</p>
    <p className="mt-3 text-sm leading-6 text-slate-600">{zh ? '首批仅支持下列三个设计职业，不代表全职业库均可比较。无需账户；选择只保留在当前页面，刷新后清空。差异不代表优劣，也不生成适配排名。' : 'This pilot covers only the three design careers below, not the entire library. No account is needed. Selections stay on this page and clear on reload. Differences do not imply quality or a fit ranking.'}</p>
    <div className={styles.controls}>
      {slots.map((slot, index) => <div className={styles.slot} key={index}>
        <label htmlFor={`career-slot-${index}`} className="font-semibold">{zh ? `职业 ${index + 1}` : `Career ${index + 1}`}</label>
        <select id={`career-slot-${index}`} ref={element => { selectors.current[index] = element; }} className={styles.select} value={slot.slug} onChange={event => void choose(index, event.target.value)}>
          <option value="">{zh ? '选择职业' : 'Select a career'}</option>
          {CAREER_COMPARE_OPTIONS.map(option => <option key={option.slug} value={option.slug} disabled={slots[1 - index].slug === option.slug}>{option[locale]}</option>)}
        </select>
        <p className="text-sm text-slate-600">{zh ? '选择其他职业即可替换。' : 'Select another career to replace this one.'}</p>
        {slot.slug ? <button className={styles.button} type="button" onClick={() => { void choose(index, ''); selectors.current[index]?.focus(); }}>{zh ? `移除职业 ${index + 1}` : `Remove career ${index + 1}`}</button> : null}
        <div role="status" aria-live="polite" aria-atomic="true">
          {slot.read.state === 'idle' ? <p className="mt-3">{zh ? '此槽位为空。' : 'This slot is empty.'}</p> : null}
          {slot.read.state === 'loading' ? <p className="mt-3">{zh ? '正在读取已发布职业档案…' : 'Loading the published career profile…'}</p> : null}
          {slot.read.state === 'ready' ? <p className="mt-3">{slot.read.page.content.subject.name} · {zh ? '已加载' : 'Loaded'}</p> : null}
          {['missing', 'empty', 'error'].includes(slot.read.state) ? <p className="mt-3">{slot.read.state === 'missing' ? (zh ? '职业已失效或不在本次可选范围。' : 'This career is unavailable or outside the pilot.') : slot.read.state === 'empty' ? (zh ? '职业正文尚未发布，暂不能比较。' : 'The career body is not published, so it cannot be compared.') : (zh ? '档案读取或版本校验失败，请重试或替换职业。' : 'The profile could not be loaded or validated. Retry or choose another career.')}</p> : null}
        </div>
        {['missing', 'empty', 'error'].includes(slot.read.state) ? <button type="button" className={styles.button} onClick={() => { void choose(index, slot.slug); selectors.current[index]?.focus(); }}>{zh ? '重试读取' : 'Retry loading'}</button> : null}
      </div>)}
    </div>
    <p role="status" aria-live="polite" className="my-4 font-medium">{notice || (succeeded ? (zh ? '两个职业已就绪。逐项核对下方差异和未知。' : 'Both careers are ready. Check the differences and unknowns below.') : (zh ? '请选择两个不同的职业以查看比较。' : 'Select two different careers to view the comparison.'))}</p>
    {succeeded ? <>
      <table className={styles.table} role="table" data-testid="career-compare-table">
        <caption>{zh ? '已发布档案对照 · 保留各自口径' : 'Published profiles · each retains its own evidence scope'}</caption>
        <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">{zh ? '核对项目' : 'Compare'}</th>{pages.map(page => <th key={page!.content.subject.canonicalSlug} id={`compare-${page!.content.subject.canonicalSlug}`} scope="col" role="columnheader">{page!.content.subject.name}</th>)}</tr></thead>
        <tbody role="rowgroup">
          {CAREER_COMPARE_ROWS.map(row => <tr key={row.key} role="row"><th id={`compare-row-${row.key}`} scope="row" role="rowheader">{row[locale]}</th>{pages.map(page => <td role="cell" key={page!.content.subject.canonicalSlug} headers={`compare-row-${row.key} compare-${page!.content.subject.canonicalSlug}`}>{cell(page!, <Items page={page!} copyKeys={row.copyKeys} />)}</td>)}</tr>)}
          {['us_pay', 'china_pay'].map(key => <tr key={key} role="row"><th id={`compare-row-${key}`} scope="row" role="rowheader">{key === 'us_pay' ? (zh ? '美国薪资参考' : 'U.S. salary reference') : (zh ? '中国大陆薪资参考' : 'Mainland China salary reference')}</th>{pages.map(page => <td role="cell" key={page!.content.subject.canonicalSlug} headers={`compare-row-${key} compare-${page!.content.subject.canonicalSlug}`}>{cell(page!, <Salary page={page!} metricKey={key} />)}</td>)}</tr>)}
          <tr role="row"><th id="compare-row-sources" scope="row" role="rowheader">{zh ? '来源与完整档案' : 'Sources and full profile'}</th>{pages.map(page => <td role="cell" key={page!.content.subject.canonicalSlug} headers={`compare-row-sources compare-${page!.content.subject.canonicalSlug}`}>{cell(page!, <><Link className="inline-flex min-h-11 items-center font-semibold text-teal-800 underline" href={`/${locale}/career/jobs/${page!.content.subject.canonicalSlug}`}>{zh ? '核对完整职业档案' : 'Read the full career profile'}</Link><details><summary>{zh ? '原始来源、地区、年份与限制' : 'Original sources, regions, dates and limitations'}</summary><CareerEvidenceLine content={page!.content} sourceRefs={page!.content.sources.map(source => source.id)} />{page!.content.sources.map(source => <p key={source.id} className="my-3 text-sm">{[source.name, source.market, source.period, source.scope, source.limitation].filter(Boolean).join(' · ')}</p>)}</details></>)}</td>)}</tr>
        </tbody>
      </table>
      <aside className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7">
        <h2 className="text-lg font-semibold">{zh ? '下一步：找到一项差异，保留一个待核问题' : 'Next: identify one difference and one open question'}</h2>
        <p>{zh ? '根据上表说清两种职业的一项任务差异，再选一个当地真实岗位核对工作环境、作品要求或执业资格。资格边界因地区与岗位而异；职业平均薪资不代表你的收入，跨地区、年份或统计口径不能直接排序。' : 'Use the table to explain one task difference, then check a real local vacancy for its work setting, portfolio requirements or practice credentials. Credential rules vary by place and role. Occupational pay is not your expected income; different regions, years or measures cannot be ranked directly.'}</p>
        <p>{zh ? '本工具不保存你的判断或私人文字。尚未提供的信息保持未知。' : 'This tool does not store your conclusions or private notes. Missing evidence remains unknown.'}</p>
      </aside>
    </> : null}
  </section>;
}
