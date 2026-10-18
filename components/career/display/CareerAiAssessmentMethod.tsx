import type { CareerContentV3 } from '@/lib/career/contentV3';

export const CAREER_AI_ASSESSMENT_METHOD_ID = 'career-ai-assessment-method';

function assessmentSource(content: CareerContentV3 | null | undefined) {
  const source = content?.sources.find(item => item.id === 'source-fermatmind-ai-rubric');
  return source && content?.facts.some(fact => fact.sourceRefs.includes(source.id) && /^(100|[1-9]?[0-9])%$/.test(fact.displayValue)) ? source : null;
}

export function CareerAiScoreInfoLink({content}: {content?: CareerContentV3 | null}) {
  if (!assessmentSource(content)) return null;
  const label = content?.locale === 'zh' ? 'AI 评估方法与来源' : 'AI assessment method and sources';
  return <a href={`#${CAREER_AI_ASSESSMENT_METHOD_ID}`} aria-label={label} title={label} className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full align-middle text-sm text-inherit underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"><span aria-hidden="true">ⓘ</span></a>;
}

export function CareerAiAssessmentMethod({content}: {content?: CareerContentV3 | null}) {
  const source = assessmentSource(content);
  if (!source) return null;
  const zh = content?.locale === 'zh';
  return <section id={CAREER_AI_ASSESSMENT_METHOD_ID} tabIndex={-1} aria-labelledby={`${CAREER_AI_ASSESSMENT_METHOD_ID}-title`} className="my-6 scroll-mt-24 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
    <h3 id={`${CAREER_AI_ASSESSMENT_METHOD_ID}-title`} className="m-0 text-lg font-bold text-[#008F88]">{zh ? 'AI 评估方法与来源' : 'AI assessment method and sources'}</h3>
    <p className="mt-3 font-medium">{source.name}</p>
    <p>{[source.publisher, source.period].filter(Boolean).join(' · ')}</p>
    <ul className="my-3 list-disc space-y-2 pl-5">{source.details.map((detail, index) => <li key={index}>{detail.replace(/;\s*[a-z0-9][a-z0-9_.-]*\[[0-9,]+\]$/, '')}</li>)}</ul>
    {source.limitation ? <p className="mt-3 font-medium">{source.limitation}</p> : null}
  </section>;
}
