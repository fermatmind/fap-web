'use client';

import { useRef, useState } from 'react';
import { hasAnalyticsConsent } from '@/lib/consent/store';
import { Button } from '@/components/ui/button';
import { trackCareerToolEvent, type CareerToolEvent } from '@/lib/career/toolTracking';
import styles from '@/components/marketing/RiasecWorksheet.module.css';

const tasks = [
  { key: 'industrial', label: '工业设计小试做', prompt: '给一款可重复使用的水杯画两种杯盖草图。标出开合方式，并写下哪一处需要实际试握。' },
  { key: 'graphic', label: '平面设计小试做', prompt: '给同一款水杯画一张三步清洗说明海报。调整图标、标题和阅读顺序，请一位读者复述步骤。' },
] as const;
const START_MIN_CHARS = 10;

export function CareerCompareWorksheet() {
  const [choice, setChoice] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const toolRunId = useRef<string | null>(null);
  const started = useRef(false);

  function track(eventName: CareerToolEvent, outputFormat?: 'print') {
    if (!hasAnalyticsConsent()) return;
    toolRunId.current ??= crypto.randomUUID();
    trackCareerToolEvent(eventName, { locale: 'zh', toolRunId: toolRunId.current, outputFormat });
  }

  function enter() {
    if (!toolRunId.current) track('career_worksheet_entered');
  }

  function start() {
    if (started.current || !hasAnalyticsConsent()) return;
    enter();
    started.current = true;
    track('career_worksheet_started');
  }

  function noteChange(nextChoice: string, nextNotes: string) {
    setStatus('');
    if (Array.from((nextChoice + nextNotes).replace(/\s/g, '')).length >= START_MIN_CHARS) start();
  }

  function print() {
    try {
      window.print();
      start();
      track('career_worksheet_output_requested', 'print');
      track('career_worksheet_print_requested', 'print');
      setStatus('请以浏览器打印或另存为 PDF 的结果为准。取消后可以继续编辑。');
    } catch {
      setStatus('当前浏览器未能打开打印窗口，请在支持打印的浏览器中重试。');
    }
  }

  return <section id="career-compare-worksheet" aria-labelledby="career-compare-worksheet-title"
    className={`${styles.shell} mt-6 scroll-mt-24 rounded-xl border border-teal-200 bg-white p-5 sm:p-6`}>
    <h2 id="career-compare-worksheet-title" className="text-xl font-semibold">职业小试做</h2>
    <p className="mt-2 text-sm leading-6 text-slate-700">用同一款水杯，体验两种职业各要交付什么。任选一项，花 15 分钟做个草稿。</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {tasks.map(task => <div key={task.key} className="rounded-lg bg-teal-50 p-4 text-sm leading-6">
        <h3 className="font-semibold">{task.label}</h3>
        <p className="mt-1">{task.prompt}</p>
      </div>)}
    </div>
    <label className="mt-4 block font-medium">
      我准备试做什么？
      <input className="mt-2 block min-h-11 w-full rounded-lg border border-slate-400 bg-white p-3 text-base"
        value={choice} maxLength={160} autoComplete="off" onFocus={enter}
        onChange={event => { setChoice(event.target.value); noteChange(event.target.value, notes); }} />
    </label>
    <label className="mt-4 block font-medium">
      我发现了什么？还要验证什么？
      <textarea className="mt-2 block w-full rounded-lg border border-slate-400 bg-white p-3 text-base"
        rows={4} value={notes} maxLength={2000} autoComplete="off" onFocus={enter}
        onChange={event => { setNotes(event.target.value); noteChange(choice, event.target.value); }} />
    </label>
    <p className="mt-3 text-sm leading-6 text-slate-600">文字只保留在此页面，刷新后会清空。可以用浏览器打印或另存为 PDF。</p>
    <Button type="button" variant="outline" className="mt-3 min-h-11" onClick={print}>打印 / 保存试做表</Button>
    <p className="mt-2 text-sm" role="status">{status}</p>
    <div className={styles.printRecord} data-worksheet-print>
      <h2>职业小试做 · 工业设计师与平面设计师</h2>
      {tasks.map(task => <div key={task.key}><h3>{task.label}</h3><p>{task.prompt}</p></div>)}
      <dl>
        <dt>我准备试做什么？</dt><dd className={styles.value}>{choice || '____________'}</dd>
        <dt>我发现了什么？还要验证什么？</dt><dd className={styles.value}>{notes || '____________'}</dd>
      </dl>
    </div>
  </section>;
}
