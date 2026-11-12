'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { hasAnalyticsConsent } from '@/lib/consent/store';
import { Button, buttonVariants } from '@/components/ui/button';
import { trackCareerToolEvent, type CareerToolEvent } from '@/lib/career/toolTracking';
import type { Locale } from '@/lib/i18n/locales';
import styles from '@/components/marketing/RiasecWorksheet.module.css';

const designTasks = [
  { key: 'industrial', label: '工业设计小试做', enLabel: 'Industrial design exercise', enPrompt: 'Sketch two lids for a reusable cup. Mark how each opens and closes, and note where you would need to test the grip.', traditionalLabel: '工業設計小試作', traditionalPrompt: '給一款可重複使用的水杯畫兩種杯蓋草圖。標出開合方式，並寫下哪一處需要實際試握。', prompt: '给一款可重复使用的水杯画两种杯盖草图。标出开合方式，并写下哪一处需要实际试握。' },
  { key: 'graphic', label: '平面设计小试做', enLabel: 'Graphic design exercise', enPrompt: 'Create a three-step cleaning poster for the same cup. Arrange the icons, headings, and reading order, then ask someone to repeat the steps.', traditionalLabel: '平面設計小試作', traditionalPrompt: '給同一個水杯畫一張三步清洗說明海報。調整圖示、標題與閱讀順序，請一位讀者複述步驟。', prompt: '给同一款水杯画一张三步清洗说明海报。调整图标、标题和阅读顺序，请一位读者复述步骤。' },
] as const;
const REFLECTION_PROMPT = '哪一步你愿意再做一遍？哪项工作条件还需要核实？';
const START_MIN_CHARS = 10;

export type CareerWorksheetScenario = {
  title: string;
  brief: string;
  tasks: [{ label: string; prompt: string }, { label: string; prompt: string }];
};

export function CareerCompareWorksheet({ traditional = false, locale = 'zh', embedded = false, scenario }: {
  traditional?: boolean; locale?: Locale; embedded?: boolean; scenario?: CareerWorksheetScenario;
}) {
  const copy = (zh: string, tw: string, en: string) => traditional ? tw : locale === 'en' ? en : zh;
  const tasks = scenario?.tasks ?? designTasks.map(task => ({
    label: copy(task.label, task.traditionalLabel, task.enLabel),
    prompt: copy(task.prompt, task.traditionalPrompt, task.enPrompt),
  }));
  const pathLocale = traditional ? 'zh-TW' : locale;
  const Heading = embedded ? 'h4' : 'h2';
  const Subheading = embedded ? 'h5' : 'h3';
  const [choice, setChoice] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const toolRunId = useRef<string | null>(null);
  const started = useRef(false);

  function track(eventName: CareerToolEvent, outputFormat?: 'print') {
    if (!hasAnalyticsConsent()) return;
    toolRunId.current ??= crypto.randomUUID();
    trackCareerToolEvent(eventName, { locale, toolRunId: toolRunId.current, outputFormat });
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
      // Returning from the dialog does not confirm that the user printed or saved.
      window.print();
      enter();
      track('career_worksheet_output_requested', 'print');
      track('career_worksheet_print_requested', 'print');
      setStatus(copy('请以浏览器打印或另存为 PDF 的结果为准。取消后可以继续编辑。', '請以瀏覽器列印或另存為 PDF 的結果為準。取消後可以繼續編輯。', 'Check your browser for the print or PDF result. You can keep editing if you cancel.'));
    } catch {
      setStatus(copy('当前浏览器未能打开打印窗口，请在支持打印的浏览器中重试。', '目前的瀏覽器無法開啟列印視窗，請使用支援列印的瀏覽器重試。', 'Your browser could not open printing. Try again in a browser that supports it.'));
    }
  }

  return <section id="career-compare-worksheet" aria-labelledby="career-compare-worksheet-title"
    className={`${styles.shell} mt-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 min-[900px]:scroll-mt-[7.5rem]`}>
    <p className="mb-1 text-sm font-semibold text-[var(--fm-accent)]">{copy('15 分钟 · 任选一项', '15 分鐘 · 任選一項', '15 minutes · Choose one task')}</p>
    <Heading id="career-compare-worksheet-title" className="text-2xl font-bold">{copy('职业小试做', '職涯小試作', 'Try a career task')}</Heading>
    <p className="mt-2 text-sm leading-6 text-slate-700">{scenario?.brief ?? copy('用同一只水杯做个草稿，体验两种职业各要交付什么。', '用同一個水杯做草稿，體驗兩種職業各要交付什麼。', 'Use the same cup to try producing two different kinds of design work.')}</p>
    <ul className="my-5 grid list-none gap-4 border-y border-slate-200 py-4 sm:grid-cols-2 sm:gap-6">
      {tasks.map(task => <li key={task.label} className="space-y-1 text-sm leading-6">
        <Subheading className="font-semibold text-[var(--fm-accent)]">{task.label}</Subheading>
        <p>{task.prompt}</p>
      </li>)}
    </ul>
    <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-800">{copy(REFLECTION_PROMPT, '哪一步你願意再做一遍？哪項工作條件還需要核實？', 'Which step would you repeat? What working condition do you still need to check?')}</p>
    <label className="mt-4 block font-medium">
      {copy('我准备试做什么？', '我準備試作什麼？', 'What will I try?')}
      <input className="mt-2 block min-h-11 w-full rounded-lg border border-slate-400 bg-white p-3 text-base"
        value={choice} maxLength={160} autoComplete="off" onFocus={enter}
        onChange={event => { setChoice(event.target.value); noteChange(event.target.value, notes); }} />
    </label>
    <label className="mt-4 block font-medium">
      {copy('我发现了什么？还要验证什么？', '我發現了什麼？還要驗證什麼？', 'What did I learn? What do I still need to verify?')}
      <textarea className="mt-2 block w-full rounded-lg border border-slate-400 bg-white p-3 text-base"
        rows={4} value={notes} maxLength={2000} autoComplete="off" onFocus={enter}
        onChange={event => { setNotes(event.target.value); noteChange(choice, event.target.value); }} />
    </label>
    <p className="mt-3 text-sm leading-6 text-slate-600">{copy('文字只保留在此页面，刷新后会清空。可以用浏览器打印或另存为 PDF。', '文字只保留在此頁面，重新整理後會清空。可以用瀏覽器列印或另存為 PDF。', 'Your notes stay on this page and clear when you refresh. Print or save a PDF to keep a copy.')}</p>
    <Button type="button" variant="outline" className="mt-3 min-h-11" onClick={print}>{copy('打印 / 保存试做表', '列印 / 儲存試作表', 'Print or save worksheet')}</Button>
    <p className="mt-2 text-sm" role="status">{status}</p>
    <section id="career-compare-assessments" aria-labelledby="career-compare-assessments-title"
      className="mt-6 scroll-mt-24 border-t border-slate-200 pt-5">
      <Subheading id="career-compare-assessments-title" className="font-semibold">{copy('做完试做，再了解自己的兴趣与偏好', '完成試作後，再了解自己的興趣與偏好', 'Explore your interests and preferences')}</Subheading>
      <p className="mt-2 text-sm leading-6 text-slate-700">{copy('用霍兰德梳理你想多做哪些工作活动，或用 MBTI 回顾自己偏好的工作方式。', '用霍蘭德整理你想多做哪些工作活動，或用 MBTI 回顧自己偏好的工作方式。', 'Use the Holland assessment to explore which activities you want more of, or use MBTI to reflect on how you prefer to work.')}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/${pathLocale}/tests/holland-career-interest-test-riasec`} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
          {copy('开始霍兰德职业兴趣测评', '開始霍蘭德職涯興趣測評', 'Take the free Holland career interest assessment')}
        </Link>
        <Link href={`/${pathLocale}/tests/mbti-personality-test-16-personality-types`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          {copy('开始 MBTI 偏好测评', '開始 MBTI 偏好測評', 'Start the MBTI preference assessment')}
        </Link>
      </div>
    </section>
    <div className={styles.printRecord} data-worksheet-print>
      <h2>{scenario?.title ?? copy('职业小试做 · 工业设计师与平面设计师', '職涯小試作 · 工業設計師與平面設計師', 'Career exercise · Industrial and graphic design')}</h2>
      {tasks.map(task => <div key={task.label}><h3>{task.label}</h3><p>{task.prompt}</p></div>)}
      <p>{copy(REFLECTION_PROMPT, '哪一步你願意再做一遍？哪項工作條件還需要核實？', 'Which step would you repeat? What working condition do you still need to check?')}</p>
      <dl>
        <dt>{copy('我准备试做什么？', '我準備試作什麼？', 'What will I try?')}</dt><dd className={styles.value}>{choice || '____________'}</dd>
        <dt>{copy('我发现了什么？还要验证什么？', '我發現了什麼？還要驗證什麼？', 'What did I learn? What do I still need to verify?')}</dt><dd className={styles.value}>{notes || '____________'}</dd>
      </dl>
    </div>
  </section>;
}
