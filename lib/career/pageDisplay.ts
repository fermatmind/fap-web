import type { CareerPage } from '@/lib/career/careerPage';
import { careerContentV3FaqItems } from '@/lib/career/contentV3';
import { buildCareerDossierRenderPlan } from '@/lib/career/dossierRenderPlan';
import { normalizeCareerPublishedComponents } from '@/lib/career/publishedComponentContract';
import { CAREER_DISPLAY_RIASEC_TEST_SLUG, buildCareerDisplayCtaAttribution, type CareerDisplayComponentId, type CareerDisplaySurfaceViewModel } from '@/lib/career/displaySurface';
import { CAREER_PRESENTATION_V2_VERSION, CAREER_PRESENTATION_V2_DESIGN_AUTHORITY, CAREER_PRESENTATION_V2_TEMPLATE_ID } from '@/lib/career/presentationV2';
import { supportsCareerDossierChinaSalary, supportsCareerDossierUsSalary } from '@/components/career/display/CareerDossierSalaryReference';
import { supportsCareerDossierFitCenter } from '@/components/career/display/CareerDossierFitCenter';
import { supportsCareerDossierAiImpact } from '@/components/career/display/CareerDossierAiImpact';
import { supportsCareerDossierDirectionComparison } from '@/components/career/display/CareerDossierDirectionComparison';
import { supportsCareerWorkRisk, supportsCareerProgression, supportsCareerOutlookTransitions } from '@/components/career/display/CareerDossierDecisionJourney';


const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
function fail(id: string): never { throw new Error(`CAREER_PAGE_DISPLAY_INVALID:${id}`); }
export function careerDisplayIdentity(slug: string, ontology: unknown) {
  const crosswalks = record(ontology) && Array.isArray(ontology.crosswalks) ? ontology.crosswalks : [];
  const code = (system: string, pattern: RegExp) => {
    const matches = [...new Set(crosswalks.filter(row => record(row) && row.source_system === system && ['exact','direct_match'].includes(String(row.mapping_type))).map(row => record(row) ? row.source_code : null))];
    if (matches.length === 0) return undefined;
    if (matches.length !== 1 || typeof matches[0] !== 'string' || !pattern.test(matches[0])) return fail(`identity.${system}`);
    return matches[0];
  };
  return {slug, socCode:code('us_soc', /^\d{2}-\d{4}$/), onetCode:code('onet_soc_2019', /^\d{2}-\d{4}\.\d{2}$/)};
}
export function buildCareerPageDisplaySurface(page: CareerPage, identity: { slug: string; socCode?: string; onetCode?: string }, ctaHref: string): CareerDisplaySurfaceViewModel {
  const {content, display} = page;
  const locale = content.locale;
  if (identity.slug !== content.subject.canonicalSlug || !record(display) || display.contract_version !== 'career.detail.display.v1' ||
    !record(display.components) || !Array.isArray(display.component_order) || !display.component_order.length ||
    display.component_order.some(id => typeof id !== 'string') || new Set(display.component_order).size !== display.component_order.length) fail('display');
  const components = display.components;
  const componentOrder = display.component_order as CareerDisplayComponentId[];
  if (Object.keys(components).length !== componentOrder.length) fail('components');
  const primary = components.primary_cta;
  const path = `/${locale}/career/jobs/${identity.slug}`;
  if (display.path !== path || !record(primary) || typeof primary.label !== 'string' || !primary.label.trim() || primary.href !== ctaHref.split('?')[0]) fail('cta');
  const label = primary.label;
  const faqItems = careerContentV3FaqItems(content);
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
  if (!record(display.section_titles) || content.blocks.some(block => typeof display.section_titles !== 'object' || !display.section_titles || typeof (display.section_titles as Record<string, unknown>)[block.id] !== 'string')) fail('section_titles');
  const sectionTitles = display.section_titles as Record<string,string>;
  const dossierRenderPlan = buildCareerDossierRenderPlan(content, null)!;
  if (dossierRenderPlan.source === 'content_v3') {
    // Navigation is rendered by the original breadcrumb, CTA and source footer.
    dossierRenderPlan.blocks = dossierRenderPlan.blocks.map(block => ({...block, title:sectionTitles[block.id], ...(block.id === 'navigation' ? {renderable:false, visibleInToc:false} : {})}));
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
      hero:{title:content.subject.name,lead:content.subject.summary,badges:page.hero.badges.map((text,i)=>({key:`badge-${i}`,text})),
        stats:page.hero.metrics.map(m=>({key:m.key,label:m.label,value:m.fact?.displayValue ?? missing,sourceLabel:m.fact ? content.sources.find(s=>m.fact!.sourceRefs.includes(s.id))?.publisher ?? null : null,...(m.fact ? {factRef:m.fact.factId}:{})})),
        aiExposure,cta:{label,href:ctaHref}},
    },
    contentV3:content,dossierRenderPlan,
    cta:{label,href:ctaHref,testSlug:CAREER_DISPLAY_RIASEC_TEST_SLUG,targetAction:'start_riasec_test',eventPayload:buildCareerDisplayCtaAttribution({locale,landingPath:path,subjectSlug:identity.slug})},
  };
}
