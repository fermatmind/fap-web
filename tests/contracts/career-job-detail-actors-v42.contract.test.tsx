import {renderToStaticMarkup} from 'react-dom/server';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {buildCareerPageFixture} from './careerPage.fixture';
import {fetchCareerJobBundle} from '@/lib/career/api/fetchCareerJobBundle';
import CareerJobDetailPage, {generateMetadata} from '@/app/(localized)/[locale]/career/jobs/[slug]/page';
vi.mock('@/lib/career/api/fetchCareerJobBundle',()=>({fetchCareerJobBundle:vi.fn()}));
vi.mock('@/hooks/useAnalytics',()=>({AnalyticsPageViewTracker:()=>null}));
vi.mock('next/navigation',()=>({notFound:()=>{throw new Error('not-found')},permanentRedirect:(url:string)=>{throw new Error(`redirect:${url}`)},usePathname:()=>'/zh/career/jobs/actors'}));
const fetchMock=vi.mocked(fetchCareerJobBundle);
function bundle(slug='actors', locale:'zh'|'en'='zh') {
  return {identity:{canonical_slug:slug},career_page:buildCareerPageFixture(slug,locale),seo_contract:{canonical_path:`/${locale}/career/jobs/${slug}`,index_state:'indexable',index_eligible:true,reason_codes:['runtime_publish_projection','release_gate_pass']}};
}
async function render(slug='actors',locale='zh',search:Record<string,string>={}) {
  return renderToStaticMarkup(await CareerJobDetailPage({params:Promise.resolve({locale,slug}),searchParams:Promise.resolve(search)}));
}
beforeEach(()=>vi.clearAllMocks());
describe('single-source career route integration',()=>{
  it.each(['actors','web-developers','registered-nurses','data-scientists','health-educators'])('uses the common file renderer for %s',async slug=>{
    fetchMock.mockResolvedValue(bundle(slug));
    const html=await render(slug);
    expect(html).toContain('data-career-dossier-plan="career_page"');
    expect(html.match(/data-career-visual-group=/g)).toHaveLength(11);
    expect(html).toContain('29.05美元/小时');
  });
  it('rejects incomplete Chinese accountant mappings before rendering',async()=>{
    fetchMock.mockResolvedValue(bundle('accountants-and-auditors'));
    await expect(render('accountants-and-auditors')).rejects.toThrow('CAREER_PAGE_DISPLAY_INVALID');
  });
  it('keeps the English accountant on the common file renderer',async()=>{
    fetchMock.mockResolvedValue(bundle('accountants-and-auditors','en'));
    const html=await render('accountants-and-auditors','en');
    expect(html).toContain('data-career-dossier-plan="career_page"');
    expect(html).not.toContain('data-career-production-template="career-production-v1"');
  });
  it('keeps English identity with complete empty sections',async()=>{
    fetchMock.mockResolvedValue(bundle('actors','en'));
    const html=await render('actors','en');
    expect(html).toContain('Content pending');
    expect(html).not.toContain('这行就稳');
    const metadata=await generateMetadata({params:Promise.resolve({locale:'en',slug:'actors'})});
    expect(metadata.alternates?.canonical).toContain('/en/career/jobs/actors');
  });
  it('keeps inbound attribution on the common RIASEC CTA',async()=>{
    fetchMock.mockResolvedValue(bundle());
    const html=await render('actors','zh',{utm_source:'test-source',gclid:'test-click'});
    expect(html).toContain('subject_key=actors');
    expect(html).toContain('utm_source=test-source');
    expect(html).toContain('gclid=test-click');
    expect(html).toContain('开始职业兴趣测试');
  });
  it('ignores poisoned old display and SEO copy',async()=>{
    const payload={...bundle(),display_surface_v1:{page:{content:{hero:{title:'LEGACY_POISON'}}}},content_body_md:'LEGACY_POISON'};
    fetchMock.mockResolvedValue(payload as never);
    expect(await render()).not.toContain('LEGACY_POISON');
    expect((await generateMetadata({params:Promise.resolve({locale:'zh',slug:'actors'})})).title).toBe(payload.career_page.seo.title.text);
  });
  it.each(['missing','identity','locale','primitive'] as const)('rejects %s contract corruption without fallback',async kind=>{
    const payload=bundle();
    if(kind==='missing') delete (payload as Partial<typeof payload>).career_page;
    if(kind==='identity') payload.career_page.content.subject.canonical_slug='wrong';
    if(kind==='locale') payload.career_page.locale='en';
    if(kind==='primitive') payload.career_page.content.blocks[0].items[0].data={unexpected:'bad'} as never;
    fetchMock.mockResolvedValue(payload);
    await expect(render()).rejects.toThrow('CAREER_PAGE_CONTRACT_INVALID');
  });
  it('uses an authoritative absence for 404',async()=>{
    fetchMock.mockResolvedValue(null);
    await expect(render()).rejects.toThrow('not-found');
  });
  it('emits FAQ only when the displayed question and answer both exist',async()=>{
    const payload=bundle();
    fetchMock.mockResolvedValue(payload);
    expect(await render()).not.toContain('"@type":"FAQPage"');
    const faq=payload.career_page.content.blocks.flatMap<{type:string;data:unknown}>(b=>b.items).find(i=>i.type==='faq')!;
    const entry=(faq.data as {entries:Array<{question?:string;answer:string}>}).entries[0];
    entry.question='Explicit file question';
    entry.answer='Explicit file answer';
    const html=await render();
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('Explicit file question');
    expect(html).toContain('Explicit file answer');
  });
  it('keeps candidate metadata noindex without publication authority',async()=>{
    const payload=bundle();payload.seo_contract.index_eligible=false;payload.seo_contract.reason_codes=[];
    fetchMock.mockResolvedValue(payload);
    expect((await generateMetadata({params:Promise.resolve({locale:'zh',slug:'actors'})})).robots).toMatchObject({index:false});
  });
});
