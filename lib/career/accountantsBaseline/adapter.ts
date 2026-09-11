import zh from './zh-CN.json';
import en from './en.json';
import type { CareerPage } from '@/lib/career/careerPage';
import { careerContentV3ColumnCopy, careerContentV3FaqItems, type CareerContentV3Item } from '@/lib/career/contentV3';
import { buildCareerDossierRenderPlan } from '@/lib/career/dossierRenderPlan';
import { normalizeCareerPublishedComponents } from '@/lib/career/publishedComponentContract';
import { CAREER_DISPLAY_ACCOUNTANTS_SLUG, CAREER_DISPLAY_RIASEC_TEST_SLUG, buildCareerDisplayCtaAttribution, type CareerDisplayComponentId, type CareerDisplaySurfaceViewModel } from '@/lib/career/displaySurface';
import { CAREER_PRESENTATION_V2_VERSION, CAREER_PRESENTATION_V2_DESIGN_AUTHORITY, CAREER_PRESENTATION_V2_TEMPLATE_ID } from '@/lib/career/presentationV2';
import { supportsCareerDossierChinaSalary, supportsCareerDossierUsSalary } from '@/components/career/display/CareerDossierSalaryReference';
import { supportsCareerDossierFitCenter } from '@/components/career/display/CareerDossierFitCenter';
import { supportsCareerDossierAiImpact } from '@/components/career/display/CareerDossierAiImpact';
import { supportsCareerDossierDirectionComparison } from '@/components/career/display/CareerDossierDirectionComparison';
import { supportsCareerWorkRisk, supportsCareerProgression, supportsCareerOutlookTransitions } from '@/components/career/display/CareerDossierDecisionJourney';

// Accountants only. JSON contains the original component structure/UI copy and
// explicit content IDs, never historical body/facts. Bindings follow the sorted
// CareerContentV3Projector traversal used by 59d711c46, with public control values
// removed by migrate_page_fields.php. Runtime order/text is never used to infer a field.
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
function fail(id: string): never { throw new Error(`ACCOUNTANTS_UI_COMPATIBILITY_INVALID:${id}`); }
export function accountantsIdentity(slug: string, ontology: unknown) {
  const crosswalks = record(ontology) && Array.isArray(ontology.crosswalks) ? ontology.crosswalks : [];
  const code = (system: string, pattern: RegExp) => {
    const matches = [...new Set(crosswalks.filter(row => record(row) && row.source_system === system && ['exact','direct_match'].includes(String(row.mapping_type))).map(row => record(row) ? row.source_code : null))];
    if (matches.length === 0) return undefined;
    if (matches.length !== 1 || typeof matches[0] !== 'string' || !pattern.test(matches[0])) return fail(`identity.${system}`);
    return matches[0];
  };
  return {slug, socCode:code('us_soc', /^\d{2}-\d{4}$/), onetCode:code('onet_soc_2019', /^\d{2}-\d{4}\.\d{2}$/)};
}
const COMPONENT_BLOCK: Record<string,string> = {
  fermat_decision_card:'quick-decision', fit_decision_checklist:'quick-decision',
  definition_block:'profile', responsibilities_block:'profile', work_context_block:'profile', career_quick_answers_block:'profile', onet_structured_fields_block:'profile',
  adjacent_career_comparison_table:'direction-comparison',ai_impact_table:'ai-impact',career_snapshot_primary_locale:'china-salary',career_snapshot_secondary_locale:'us-salary',
  riasec_fit_block:'fit',personality_fit_block:'fit',career_risk_cards:'risk',career_path_block:'path',market_signal_card:'market-signals',faq_block:'sources',source_card:'sources',boundary_notice:'sources',
};
const ENTRY_ITEMS: Record<string, string> = {
  'accountant-entry-role-comparison': 'career.item.entry-role-comparison',
  'accountant-entry-employer-evidence': 'career.item.employer-evidence',
  'accountant-entry-work-sample': 'career.item.entry-work-sample-data',
  'accountant-entry-portfolio': 'career.item.entry-portfolio',
  'accountant-entry-interview-probation': 'career.item.interview-probation',
  'accountant-entry-seven-day-trial': 'career.item.seven-day-trial',
  'accountant-entry-seven-day-decision': 'career.item.seven-day-decision',
  'accountant-credential-decision': 'career.item.credential-decision',
  'accountant-credential-boundary': 'career.item.credential-boundary',
};

export function restoreAccountantsSurface(page: CareerPage, identity: { slug: string; socCode?: string; onetCode?: string }, ctaHref: string): CareerDisplaySurfaceViewModel {
  const { content } = page;
  if (identity.slug !== CAREER_DISPLAY_ACCOUNTANTS_SLUG || content.subject.canonicalSlug !== identity.slug) fail('identity');
  const locale = content.locale;
  if (content.blocks.some(block => block.copyKey !== `career.block.${block.id}`)) fail('blocks');
  const items = new Map<string, CareerContentV3Item>();
  for (const block of content.blocks) for (const item of block.items) {
    if (items.has(item.id) || item.availability !== 'available') fail(item.id);
    items.set(item.id, item);
  }
  const consumed = new Set<string>();
  const consumedLinks = new Map<string,Set<string>>();
  const blockOf = (item: CareerContentV3Item) => content.blocks.find(block => block.items.includes(item));
  const read = (id: string, type: string) => {
    const item = items.get(id);
    if (!item || item.type !== type) return fail(id);
    // Component identity must agree with its registered copy key, independently of order.
    if (!id.startsWith(item.copyKey.replace('career.item.', '') + '-') || blockOf(item)?.id !== COMPONENT_BLOCK[item.copyKey.replace('career.item.','').replaceAll('-','_')]) fail(id);
    consumed.add(id);
    return item;
  };
  const resolve = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(resolve);
    if (!record(node)) return node;
    if (typeof node.$item === 'string') {
      const item = read(node.$item, String(node.type));
      const values = item.data[node.type === 'prose' ? 'paragraphs' : 'entries'];
      if (!Array.isArray(values) || !values.every(v => typeof v === 'string')) return fail(item.id);
      if (node.type === 'prose') {
        if (values.length !== 1) return fail(item.id);
        return values[0];
      }
      return [...values];
    }
    if (typeof node.$link === 'string') {
      const item = read(node.$link, 'links');
      const entries = item.data.entries;
      if (!Array.isArray(entries)) return fail(item.id);
      const entry = entries.find(e => record(e) && e.id === node.entry);
      if (!record(entry) || typeof entry[String(node.field)] !== 'string') return fail(item.id);
      if (node.field === 'url') { const entries = consumedLinks.get(item.id) ?? new Set<string>(); entries.add(String(node.entry)); consumedLinks.set(item.id,entries); }
      return entry[String(node.field)];
    }
    return Object.fromEntries(Object.entries(node).map(([k,v]) => [k,resolve(v)]));
  };
  const components = resolve(locale === 'zh' ? zh : en) as Record<string, unknown>;
  const chinaSalary = components.career_snapshot_primary_locale as {salary: Record<string, unknown>};
  const chinaFacts = [...new Set(['1', '3', '5', '7'].flatMap(id => items.get(`career-snapshot-primary-locale-${id}`)!.factRefs))];
  if (chinaFacts.length) chinaSalary.salary.fact_refs = chinaFacts;
  // Publication periods are facts, not September 5 UI copy. English currently
  // has no fact register; keep its period containers explicitly unavailable.
  const salary = components.career_snapshot_secondary_locale as Record<string, unknown>;
  salary.outlook_period = content.facts.find(f => f.factId === 'bls-us-accountants-employment-growth-2025-2035')?.period ?? (locale === 'zh' ? '暂无数据' : 'No data available');
  salary.industry_period = content.facts.find(f => f.factId === 'bls-us-accountants-industry-finance-2025')?.period ?? (locale === 'zh' ? '暂无数据' : 'No data available');
  const salaryBindings = (locale === 'zh' ? zh : en).career_snapshot_secondary_locale;
  for (const [field, valueKey] of [['bls_table', '数值'], ['industry_rows', 'median']] as const) {
    const bindings = salaryBindings[field] as unknown as Array<Record<string, {$item:string}>>;
    (salary[field] as Array<Record<string, unknown>>).forEach((row, index) => {
      const refs = items.get(bindings[index][valueKey].$item)!.factRefs;
      if (refs.length === 1) row.fact_ref = refs[0];
    });
  }
  for (const [id, entries] of consumedLinks) if ((items.get(id)!.data.entries as unknown[]).length !== entries.size) fail(id);
  const faqItems = careerContentV3FaqItems(content);
  const faq = items.get('faq-block-1');
  if (!faq || blockOf(faq)?.id !== 'sources' || faq.copyKey !== 'career.item.faq-block' || faq.type !== 'faq' || !Array.isArray(faq.data.entries) || faqItems.length !== faq.data.entries.length) fail('faq');
  consumed.add(faq.id);
  components.faq_block = { items: faqItems.map(({question,answer}) => ({question,answer})) };
  for (const [id, copyKey] of Object.entries(ENTRY_ITEMS)) {
    const item = items.get(id);
    if (item) {
      if (item.copyKey !== copyKey || !content.blocks.find(b => b.id === 'path')?.items.includes(item)) fail(id);
      if (item.type === 'table' && (item.data.column_keys as string[]).some(key => !careerContentV3ColumnCopy(key, locale))) fail(id);
      consumed.add(id);
    }
  }
  // These already have dedicated original locations: breadcrumbs/CTA and sources.
  for (const [id, type] of [['navigation-links','links'],['published-sources','sources']]) {
    const item = items.get(id);
    if (!item || item.type !== type) fail(id);
    consumed.add(id);
  }
  for (const id of items.keys()) if (!consumed.has(id)) fail(id);
  const path = `/${locale}/career/jobs/${identity.slug}`;
  const expectedNavigation = [
    ['navigation-1', 'primary_cta', `/${locale}/tests/${CAREER_DISPLAY_RIASEC_TEST_SLUG}`],
    ['navigation-2', 'secondary_cta', '/en/tests/mbti-personality-test-16-personality-types'],
    ['navigation-3', 'secondary_cta', '/en/tests/big-five-personality-test-ocean-model'],
    ['navigation-4', 'secondary_cta', '/zh/tests/mbti-personality-test-16-personality-types'],
    ['navigation-5', 'secondary_cta', '/zh/tests/big-five-personality-test-ocean-model'],
    ['navigation-6', 'path', path],
  ];
  const navigation = items.get('navigation-links')!;
  const links = navigation.data.entries;
  if (blockOf(navigation)?.id !== 'navigation' || !Array.isArray(links) || links.length !== expectedNavigation.length ||
    expectedNavigation.some(([id, entity, url]) => !links.some(e => record(e) && e.id === id && e.entity === entity && e.url === url))) fail('navigation-links');
  const label = locale === 'zh' ? '测我的职业兴趣是否适合会计与审计' : 'Explore my career interests';
  components.hero = { title: content.subject.name, h1: content.subject.name, quick_answer: content.subject.summary ?? '' };
  components.primary_cta = { label, href: ctaHref.split('?')[0],entry_surface:'career_job_detail',source_page_type:'career_job_detail',subject_key:identity.slug,subject_kind:'career_job',target_action:'start_riasec_test',test_slug:CAREER_DISPLAY_RIASEC_TEST_SLUG };
  components.breadcrumb = {label:content.subject.name,slug:identity.slug};
  const componentOrder = ['breadcrumb','hero','primary_cta',...Object.keys(components).filter(k => !['breadcrumb','hero','primary_cta'].includes(k))] as CareerDisplayComponentId[];
  const publishedComponents = normalizeCareerPublishedComponents(components, componentOrder, true);
  if (!publishedComponents) fail('components');
  for (const id of componentOrder) if (publishedComponents[id] === undefined) fail(id);
  // Reuse the original renderer's shape checks. A mapped payload must not
  // silently fall through to its generic presentation when a rich block fails.
  if (!supportsCareerDossierChinaSalary(publishedComponents.career_snapshot_primary_locale!) ||
    !supportsCareerDossierUsSalary(publishedComponents.career_snapshot_secondary_locale!) ||
    !supportsCareerDossierFitCenter(publishedComponents.personality_fit_block) ||
    !supportsCareerWorkRisk(publishedComponents.career_risk_cards) ||
    !supportsCareerProgression(publishedComponents.career_path_block) ||
    !supportsCareerOutlookTransitions(publishedComponents.market_signal_card)) fail('original-components');
  // The September 5 English payload has the original simpler profile,
  // comparison and AI components; it does not contain the Chinese flow schema.
  if (locale === 'zh' && (!supportsCareerDossierAiImpact(publishedComponents.ai_impact_table!) ||
    !supportsCareerDossierDirectionComparison(publishedComponents.adjacent_career_comparison_table!))) fail('original-components.zh');
  let aiExposure: NonNullable<CareerDisplaySurfaceViewModel['presentationV2']>['hero']['aiExposure'] = null;
  if (page.hero.ai.availability === 'available') {
    const fact = page.hero.ai.fact;
    const score = fact?.displayValue.match(/^(10|[0-9])\/10$/);
    const source = content.sources.find(s => fact?.sourceRefs.includes(s.id));
    if (!fact || !score || !source) fail('hero.ai');
    aiExposure = {value:Number(score[1]),scale:10,displayValue:fact.displayValue,label:page.hero.ai.label,note:fact.derivation,sourceLabel:source.publisher ?? source.name};
  }
  const missing = locale === 'zh' ? '暂无数据' : 'No data available';
  const dossierRenderPlan = buildCareerDossierRenderPlan(content, null)!;
  if (dossierRenderPlan.source === 'content_v3') {
    // Navigation is rendered by the original breadcrumb, CTA and source footer.
    dossierRenderPlan.blocks = dossierRenderPlan.blocks.map(block => block.id === 'navigation'
      ? {...block, renderable:false, visibleInToc:false} : block);
  }
  return {
    surfaceVersion: 'display.surface.v1', assetType: 'career_job_public_display', assetRole: 'formal_pilot_master', status: 'ready_for_pilot', locale,
    subject: { canonicalSlug: identity.slug, path, title: content.subject.name, ...(identity.socCode ? {socCode:identity.socCode}:{}), ...(identity.onetCode ? {onetCode:identity.onetCode}:{}) },
    componentOrder, publishedComponents, sections: [], hero: {h1:content.subject.name, quickAnswer:content.subject.summary ?? '',primaryCta:{label,href:ctaHref}}, faqItems,
    sources: content.sources.map(s => ({key:s.id,label:s.name,url:s.url ?? undefined,usage:s.details})),
    relatedNextPages:null, boundaryNotice: [], reviewValidity:null,
    claimPermissions: { integrityState:'restricted',allowStrongClaim:false,allowAiStrategy:false,allowSalaryComparison:false,allowMarketSignal:false,allowLocalProxyWage:false,blockedClaims:[],warnings:[],evidenceBasis:{salary:'missing',aiExposure:'missing',marketSignal:'missing',crosswalk:'missing'} },
    presentationV1:null,presentationV1Available:false,
    presentationV2: {
      contractVersion:CAREER_PRESENTATION_V2_VERSION, designAuthority:CAREER_PRESENTATION_V2_DESIGN_AUTHORITY, templateId:CAREER_PRESENTATION_V2_TEMPLATE_ID,locale:locale==='zh'?'zh-CN':'en',groups:[],
      hero:{title:content.subject.name,lead:content.subject.summary,badges:(page.hero.badges.length ? page.hero.badges : [missing]).map((text,i)=>({key:`badge-${i}`,text})),
        stats:page.hero.metrics.map(m=>({key:m.key,label:m.label,value:m.fact?.displayValue ?? missing,sourceLabel:m.fact ? content.sources.find(s=>m.fact!.sourceRefs.includes(s.id))?.publisher ?? null : null,...(m.fact ? {factRef:m.fact.factId}:{})})),
        aiExposure,cta:{label,href:ctaHref}},
    },
    contentV3:content,dossierRenderPlan,
    cta:{label,href:ctaHref,testSlug:CAREER_DISPLAY_RIASEC_TEST_SLUG,targetAction:'start_riasec_test',eventPayload:buildCareerDisplayCtaAttribution({locale,landingPath:path,subjectSlug:identity.slug})},
  };
}
