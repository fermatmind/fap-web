import Link from 'next/link';
import { ArrowDown, ArrowRight, Compass } from 'lucide-react';
import { EmbeddedCareerCompare, type EmbeddedComparison } from '@/components/career/EmbeddedDesignCareerCompare';
import { CareerEvidenceLine } from '@/components/career/display/CareerEvidenceLine';
import { buttonVariants } from '@/components/ui/button';
import type { CareerScene, PersonalityCareerCard } from '@/lib/career/personalityCareerExploration';
import type { DisplayLocale } from '@/lib/i18n/locales';

export function PersonalityCareerExploration({ locale, type, title, intro, cards, scene }: {
  locale: DisplayLocale; type: string; title: string; intro: string; cards: PersonalityCareerCard[]; scene?: CareerScene;
}) {
  const zh = locale === 'zh';
  const tw = locale === 'zh-TW';
  const pick = (en: string, cn: string, traditional: string) => tw ? traditional : zh ? cn : en;
  const id = `${type.toLowerCase()}-career-exploration`;
  const [first, second] = scene?.examples ?? [];
  const firstCard = cards.find(card => card.slug === first?.slug);
  const secondCard = cards.find(card => card.slug === second?.slug);
  const [firstPrompt, secondPrompt] = scene?.comparison.prompts ?? [];
  const comparison: EmbeddedComparison | undefined = scene && firstCard && secondCard && firstPrompt?.[locale] && secondPrompt?.[locale] ? {
    id: `${id}-compare`,
    pair: [
      { slug: firstCard.slug, name: firstCard.page.content.subject.name },
      { slug: secondCard.slug, name: secondCard.page.content.subject.name },
    ],
    worksheet: {
      title: scene.comparison.title[locale] ?? title,
      brief: scene.comparison.brief[locale] ?? intro,
      tasks: [
        { label: firstCard.page.content.subject.name, prompt: firstPrompt[locale] },
        { label: secondCard.page.content.subject.name, prompt: secondPrompt[locale] },
      ],
    },
  } : undefined;
  return (
    <section id={id} aria-labelledby={`${id}-title`}
      className="mt-8 min-w-0 space-y-5 border-t border-slate-200 pt-7">
      <div className="rounded-2xl border border-[#c8dae9] bg-[#eaf4fb] p-5 sm:p-6">
        <p className="m-0 flex items-center gap-2 text-sm font-semibold text-[#164760]">
          <Compass aria-hidden="true" size={18} /> {pick('Career exploration', '职业探索', '職涯探索')} · {type}
        </p>
        <h3 id={`${id}-title`} className="mt-2 text-2xl font-bold leading-tight text-slate-950">{title}</h3>
        <p className="mt-3 text-base leading-7 text-slate-800">{intro}</p>
        {comparison ? <a href={`#${comparison.id}`} className="mt-2 inline-flex min-h-11 items-center gap-2 font-semibold text-[#134d70] underline underline-offset-4">
          {pick('Jump to the career comparison and exercise', '直接看职业对比与试做', '跳至職涯比較與試做')} <ArrowDown aria-hidden="true" size={16} />
        </a> : null}
      </div>
      {cards.length > 0 ? (
        <>
          <p className="text-sm leading-6 text-slate-700">
            {pick('These profiles illustrate different tasks. Holland codes describe the U.S. occupations in O*NET. Check the region, year, and scope of each pay figure.', '下列职业是工作任务示例。霍兰德代码来自 O*NET 美国职业档案；薪资请看对应地区、年份及统计范围。', '以下職業用來對照工作任務。何倫碼來自 O*NET 美國職業資料；薪資請看地區、年份和統計範圍。')}
          </p>
          <ul aria-label={title} className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(card => (
              <li key={card.slug} data-career-exploration-card className="min-w-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <h4 className="m-0 text-lg font-bold leading-snug">
                  <Link data-career-card-name href={card.href} className="text-[#134d70] underline underline-offset-4">{card.page.content.subject.name}</Link>
                </h4>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#17405a]">
                  <a data-career-card-onet href={`https://www.onetonline.org/link/summary/${card.onet}`}
                    className="rounded-md bg-[#eaf4fb] px-2 py-1 underline underline-offset-2">{card.occupationalCategory}</a>
                  <span className="rounded-md bg-[#eaf4fb] px-2 py-1">{pick('Holland', '霍兰德', '何倫碼')} {card.interests}</span>
                </div>
                <p data-career-card-description className="text-sm leading-6 text-slate-700">{card.page.content.subject.summary}</p>
                <p className="border-l-2 border-[#e5ab70] pl-3 text-sm font-semibold leading-6 text-slate-900">{card.question[locale]}</p>
                <div>
                  <h5 className="m-0 text-sm font-bold">{pick('3 daily tasks', '3 项日常任务', '3 項日常工作')}</h5>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                    {card.tasks.map(task => <li data-career-card-task key={task}>{task}</li>)}
                  </ul>
                  <CareerEvidenceLine content={card.page.content} sourceRefs={card.taskSourceRefs} />
                </div>
                <dl className="space-y-3 border-t border-slate-200 pt-3 text-sm leading-6 [overflow-wrap:anywhere]">
                  {(['us_pay', 'us_growth', 'china_pay'] as const).filter(key => key !== 'us_growth' || (type === 'INTJ' && (card === firstCard || card === secondCard))).map(key => {
                    const fact = card.page.hero.metrics.find(metric => metric.key === key)?.fact;
                    const hasSource = fact?.sourceRefs.some(ref => card.page.content.sources.some(source => source.id === ref && source.url));
                    const isMissing = !fact || !hasSource || /^(证据不足|insufficient evidence)[:：]/iu.test(fact.displayValue);
                    return (
                      <div key={key}>
                        <dt className="font-bold">{key === 'us_pay' ? pick('U.S. pay reference', '美国薪资参考', '美國薪資參考')
                          : key === 'us_growth' ? pick('U.S. projected employment change', '美国就业变化预测', '美國就業變動預測')
                            : pick('Mainland China pay reference', '中国大陆薪资参考', '中國大陸薪資參考')}</dt>
                        {!isMissing ? <dd>
                          <p className="font-semibold text-slate-900">{fact.displayValue}</p>
                          <p className="text-xs leading-5 text-slate-700">{[fact.market, fact.period, fact.measure, fact.occupationScope].join(' · ')}</p>
                          <CareerEvidenceLine content={card.page.content} sourceRefs={fact.sourceRefs} className="text-xs leading-5 text-slate-700" />
                        </dd> : <dd className="text-slate-600">
                          {key === 'us_growth' ? pick('No verified projection for this occupation.', '暂无可核实的本职业预测。', '目前沒有可查證的本職業預測。')
                            : pick('No verified pay figure for this occupation.', '暂无可核实的本职业薪资。', '目前沒有可查證的本職業薪資。')}
                          {fact && hasSource ? <CareerEvidenceLine content={card.page.content} sourceRefs={fact.sourceRefs} className="text-xs leading-5" /> : null}
                        </dd>}
                      </div>
                    );
                  })}
                </dl>
              </li>
            ))}
          </ul>
        </>
      ) : <p role="status" className="text-sm text-slate-700">{pick('Career profiles are temporarily unavailable. Try again later.', '职业档案暂不可读，请稍后重试。', '暫時無法讀取職業資料，請稍後再試。')}</p>}
      {comparison ? (tw
        ? <section id={comparison.id} className="scroll-mt-24 space-y-3 rounded-xl border p-5">
          <h4 className="font-bold">{comparison.worksheet.title}</h4>
          <p>{comparison.worksheet.brief}</p>
          <ol className="list-decimal space-y-2 pl-5">
            {comparison.worksheet.tasks.map(task => <li key={task.label}><strong>{task.label}：</strong>{task.prompt}</li>)}
          </ol>
        </section>
        : <EmbeddedCareerCompare locale={locale} comparison={comparison} />) : null}
      <div className="rounded-xl bg-[#f8f2e9] p-4 sm:p-5">
        <p className="mb-3 text-sm leading-6 text-slate-800">{pick('Still deciding what you want to do more often at work? Start with your career interests.', '还没想好自己想多做哪些工作活动？可以先从职业兴趣开始。', '還不確定自己想多做哪類工作？可以先探索職業興趣。')}</p>
        <Link href={`/${locale}/tests/holland-career-interest-test-riasec`}
          className={buttonVariants({ className: 'h-auto min-h-11 max-w-full whitespace-normal py-2' })}>
          {pick('Take the free Holland career interest assessment', '免费做霍兰德职业兴趣测评', '免費做何倫職業興趣測驗')} <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </section>
  );
}
