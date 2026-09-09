import Link from 'next/link';
import { Breadcrumb } from '@/components/breadcrumb/Breadcrumb';
import { CAREER_PAGE_SECTIONS, type CareerPage, type CareerPageMetric } from '@/lib/career/careerPage';
import { careerContentV3BlockCopy, type CareerContentV3Item } from '@/lib/career/contentV3';
import { CareerEvidenceLine } from './CareerEvidenceLine';
import { CareerPageItem, CareerPagePlaceholder } from './CareerPageItem';
import visual from './CareerProductionVisual.module.css';

export function CareerPageTemplate({page, ctaHref}: {page: CareerPage; ctaHref: string}) {
  const {content, hero} = page;
  const zh = content.locale === 'zh';
  const cta = zh ? '开始职业兴趣测试' : 'Start career interest test';
  const title = (id: string) => careerContentV3BlockCopy(`career.block.${id}`, content.locale)?.title ?? (zh ? '补充资料' : 'Additional information');
  const renderItem = (item: CareerContentV3Item, index: number, numbered: boolean) => <div key={item.id} data-career-content-item={item.id} className={numbered ? `${visual.quickDecisionItem} ${visual.quickDecisionItemFit}` : 'my-6 min-w-0'}>
    {numbered ? <span aria-hidden="true" className={visual.quickDecisionNumber}>{String(index + 1).padStart(2, '0')}</span> : null}
    <div className={visual.quickDecisionItemBody}>
      {item.title ? <h3 className="m-0 mb-3 text-lg font-bold text-[#008F88]">{item.title}</h3> : null}
      <CareerPageItem item={item} content={content} />
      <CareerEvidenceLine content={content} factRefs={item.factRefs} sourceRefs={item.sourceRefs} />
    </div>
  </div>;
  const metric = (m: CareerPageMetric) => <div key={m.key} className={`rounded-xl ${visual.heroStat}`} data-career-metric={m.key}>
    <strong className={`block ${visual.heroStatValue}`}>{m.fact?.displayValue ?? '—'}</strong>
    <span className={`block text-white/85 ${visual.heroStatLabel}`}>{m.label}</span>
    {m.fact ? <><span className={`block text-white/65 ${visual.heroStatSource}`}>{[m.fact.market, m.fact.period, m.fact.measure].join('｜')}</span><CareerEvidenceLine content={content} factRefs={[m.fact.factId]} inverse /></> : <span data-nosnippet="true" className={visual.heroStatSource}>{zh ? '数据待补充' : 'Data pending'}</span>}
  </div>;
  const auxiliary = content.blocks.filter(b => !(CAREER_PAGE_SECTIONS as readonly string[]).includes(b.id));
  return <article className={`mx-auto w-full max-w-[1440px] px-5 font-sans leading-7 text-[#1A2233] sm:px-6 md:px-8 xl:px-10 ${visual.article}`} data-testid="career-display-surface" data-career-dossier-plan="career_page" data-career-content-sha={content.sourceContentSha256}>
    <Breadcrumb items={[{label: zh ? '首页' : 'Home', href: `/${content.locale}`}, {label: zh ? '职业' : 'Career', href: `/${content.locale}/career`}, {label: content.subject.name}]} />
    <div className={`mt-5 grid items-start gap-5 lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-6 ${visual.layout}`}>
      <aside className={`flex min-w-0 flex-col gap-4 lg:sticky lg:top-[84px] ${visual.rail} ${visual.accountantsRail}`} aria-label={zh ? '页面目录' : 'Page contents'}>
        <div className={visual.toc} data-testid="career-dossier-toc">
          <div className={visual.tocHeading}><span className={visual.tocKicker}>{zh ? '职业档案' : 'Career dossier'}</span></div>
          <nav className={visual.tocNav} aria-label={zh ? '目录' : 'Contents'}>{CAREER_PAGE_SECTIONS.map((id, i) => <a className={visual.tocLink} href={`#career-content-${id}`} key={id}><span aria-hidden="true" className={visual.tocIndex}>{String(i + 1).padStart(2,'0')}</span><span>{title(id)}</span></a>)}</nav>
        </div>
        <div className={visual.assessmentRail}><Link href={ctaHref} className={visual.assessmentRailCta}>{cta}<span aria-hidden="true">→</span></Link></div>
      </aside>
      <div className={`min-w-0 ${visual.componentStack}`}>
        <header className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C3E8C] to-[#3a4fa6] text-white shadow-[0_8px_30px_rgba(44,62,140,.18)] ${visual.hero}`}>
          <div className="max-w-[640px] pr-0 lg:pr-10">
            <h1 className="m-0 text-[26px] font-extrabold leading-[1.25] sm:text-[32px]">{content.subject.name}</h1>
            {hero.badges.length ? <div className={`flex flex-wrap ${visual.heroBadges}`}>{hero.badges.map((badge,i)=><span key={i} className={`rounded-full border border-white/25 bg-white/[.16] text-[12.5px] ${visual.heroBadge}`}>{badge}</span>)}</div> : null}
            {content.subject.summary ? <p className="m-0 mt-3 text-[15.5px] leading-7 text-white/95">{content.subject.summary}</p> : <CareerPagePlaceholder locale={content.locale} />}
          </div>
          <div className={visual.heroGaugePublished} data-career-metric="ai"><div><strong className="block text-center">{hero.ai.fact?.displayValue ?? '—'}</strong><span className="block pt-1 text-center text-xs">{hero.ai.label}</span>{!hero.ai.fact ? <span data-nosnippet="true" className="block text-center text-xs">{zh ? '数据待补充' : 'Data pending'}</span> : <CareerEvidenceLine content={content} factRefs={[hero.ai.fact.factId]} inverse />}</div></div>
          <div className={`grid ${visual.heroStats}`}>{hero.metrics.map(metric)}</div>
        </header>
        {CAREER_PAGE_SECTIONS.map(id => {
          const blocks = content.blocks.filter(b => b.id === id);
          if (id === 'sources') blocks.push(...auxiliary);
          return <section key={id} id={`career-content-${id}`} data-career-visual-group={id} className={`${visual.visualGroup} ${visual.compoundGroup} ${id === 'quick-decision' ? visual.accountantsQuickDecisionGroup : ''}`} aria-labelledby={`career-title-${id}`}>
            <header className={visual.quickDecisionHeader}><h2 id={`career-title-${id}`} className={visual.quickDecisionTitle}>{title(id)}</h2></header>
            {!blocks.length ? <CareerPagePlaceholder locale={content.locale} /> : blocks.map(block => <div key={block.id} data-career-content-block={block.id}>
              {block.availability === 'missing' || !block.items.length ? <CareerPagePlaceholder locale={content.locale} /> : block.items.map((item, i) => renderItem(item, i, id === 'quick-decision'))}
            </div>)}
          </section>;
        })}
        <Link href={ctaHref} className={visual.assessmentRailCta}>{cta}<span aria-hidden="true">→</span></Link>
      </div>
    </div>
  </article>;
}
