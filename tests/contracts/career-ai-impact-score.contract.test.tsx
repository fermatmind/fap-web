import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { publishedCareerPage } from '@/tests/fixtures/career-page/publishedCareerPage';
import { normalizeCareerPage } from '@/lib/career/careerPage';
import { buildCareerPageDisplaySurface } from '@/lib/career/pageDisplay';
import { CareerDisplaySurface } from '@/components/career/display/CareerDisplaySurface';
import { CareerPageTemplate } from '@/components/career/display/CareerPageTemplate';
import { normalizeCareerPresentationV2 } from '@/lib/career/presentationV2';
import { buildCareerPresentationV2Fixture } from './careerDisplaySurface.fixture';

for (const locale of ['zh', 'en'] as const) {
  const raw = await publishedCareerPage(locale);
  function candidate(displayValue = '67%') {
    const page = normalizeCareerPage(structuredClone(raw), locale, 'accountants-and-auditors')!;
    const fact = {...page.content.facts[0], factId: 'fermatmind-ai-impact-estimate', displayValue, sourceRefs: ['source-fermatmind-ai-rubric'], derivation: 'Editorial estimate; not a probability.'};
    page.content.facts = page.content.facts.filter(item => !item.sourceRefs.includes('source-fermatmind-ai-rubric'));
    page.content.facts.push(fact);
    page.content.sources = page.content.sources.filter(source => source.id !== 'source-fermatmind-ai-rubric');
    page.content.sources.push({...page.content.sources[0], id: 'source-fermatmind-ai-rubric', name: 'FermatMind scoring method', publisher: 'FermatMind', details: ['Three representative tasks; weights 1, 1, 1.', 'Task: review; 75; ai-work[0]'], limitation: 'Not a job-loss probability.'});
    page.hero.ai = {...page.hero.ai, availability: 'available', fact, label: locale === 'zh' ? 'AI影响度' : 'AI Impact Score'};
    return page;
  }
  it.each(['0%', '67%', '100%'])(`${locale}: renders %s with a single reachable assessment panel in both render paths`, score => {
    const page = candidate(score);
    const surface = buildCareerPageDisplaySurface(page, {slug: page.content.subject.canonicalSlug}, raw.display.components.primary_cta.href);
    expect(surface.presentationV2?.hero.aiExposure?.scale).toBe(100);
    for (const tree of [<CareerDisplaySurface key="production" surface={surface} />, <CareerPageTemplate key="fallback" page={page} ctaHref={raw.display.components.primary_cta.href} />]) {
      const element = document.createElement('div');
      element.innerHTML = renderToStaticMarkup(tree);
      const link = element.querySelector('a[href="#career-ai-assessment-method"]');
      expect(link?.textContent).toBe('ⓘ');
      expect(link?.getAttribute('aria-label')).toBe(locale === 'zh' ? 'AI 评估方法与来源' : 'AI assessment method and sources');
      expect(element.querySelectorAll('#career-ai-assessment-method')).toHaveLength(1);
      expect([...element.querySelectorAll('header strong')].some(node => node.textContent === score)).toBe(true);
      expect(element.querySelector('#career-ai-assessment-method')?.textContent).toContain('Not a job-loss probability.');
      expect(element.querySelector('#career-ai-assessment-method')?.textContent).not.toContain('ai-work[0]');
    }
  });
  it(`${locale}: preserves legacy scores and rejects malformed percentages or missing evidence`, () => {
    const page = candidate('7/10');
    const build = () => buildCareerPageDisplaySurface(page, {slug: page.content.subject.canonicalSlug}, raw.display.components.primary_cta.href);
    expect(build().presentationV2?.hero.aiExposure?.scale).toBe(10);
    const element = document.createElement('div');
    element.innerHTML = renderToStaticMarkup(<CareerDisplaySurface surface={build()} />);
    expect(element.querySelector('[data-testid="career-production-ai-gauge"] a')).toBeNull();
    for (const value of ['101%', '-1%', '1.5%', '067%', '67', '67％']) {
      page.hero.ai.fact!.displayValue = value;
      expect(build).toThrow('CAREER_PAGE_DISPLAY_INVALID:hero.ai');
    }
    page.hero.ai.fact!.displayValue = '67%';
    page.hero.ai.fact!.sourceRefs = ['missing'];
    expect(build).toThrow('CAREER_PAGE_DISPLAY_INVALID:hero.ai');
  });
}

it('validates percentage presentation values while retaining the 10-point contract', () => {
  const fixture = buildCareerPresentationV2Fixture({locale: 'en', title: 'Actors', href: '/en/tests/holland-career-interest-test-riasec', contentState: 'enhanced'});
  const exposure = {value: 67, scale: 100, display_value: '67%', label: 'AI Impact Score', note: null, source_label: 'FermatMind'};
  Object.assign(fixture.hero, {ai_exposure: exposure});
  expect(normalizeCareerPresentationV2(fixture, 'en', fixture.groups.flatMap(group => group.component_ids))?.hero.aiExposure?.scale).toBe(100);
  exposure.display_value = '67/10';
  expect(normalizeCareerPresentationV2(fixture, 'en', fixture.groups.flatMap(group => group.component_ids))).toBeNull();
  Object.assign(exposure, {value: 7, scale: 10, display_value: '7/10'});
  expect(normalizeCareerPresentationV2(fixture, 'en', fixture.groups.flatMap(group => group.component_ids))?.hero.aiExposure?.scale).toBe(10);
});
