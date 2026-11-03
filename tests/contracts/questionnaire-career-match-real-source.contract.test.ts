import {describe,it,expect} from 'vitest';
import {readCareerInterestDirectory,readCareerInterestRole,compareCareerInterestThemes,CAREER_INTEREST_THEMES} from '@/lib/career/adapters/adaptCareerInterestComparison';
import {CAREER_DETAIL_PROJECTION_CACHE_VERSION} from '@/lib/career/api/fetchCareerJobBundle';
describe.skipIf(process.env.CAREER_MATCH_LIVE_SOURCE_QA!=='1')('candidate adapter with live authoritative public data, no fixture or CORS override',()=>{
 it.each(['en','zh'] as const)('%s: real directory and two Current role projections',async locale=>{
  const queryLocale=locale==='zh'?'zh-CN':'en';
  const response=await fetch(`https://api.fermatmind.com/api/v0.5/career/jobs?locale=${queryLocale}`);expect(response.status).toBe(200);
  const directory=readCareerInterestDirectory(await response.json(),locale);expect(directory).not.toBeNull();expect(directory).toHaveLength(1046);
  for(const option of directory!.slice(0,2)){
   const query=new URLSearchParams({locale:queryLocale,projection_contract:CAREER_DETAIL_PROJECTION_CACHE_VERSION});
   const r=await fetch(`https://api.fermatmind.com/api/v0.5/career/jobs/${encodeURIComponent(option.slug)}?${query}`);expect(r.status).toBe(200);const raw=await r.json();
   const value=raw.data??raw;const role=readCareerInterestRole(value,locale,option.slug);expect(role).not.toBeNull();
   const original=value.career_page.display.components.riasec_fit_block;
   expect(role!.code).toBe(original.riasec);expect(role!.codeLabel).toBe(original.riasec_short);expect(role!.interest).toBe(original.interest);expect(role!.fitInterest).toBe(original.fit_interest);
   expect(compareCareerInterestThemes([...CAREER_INTEREST_THEMES],role!.code)?.shared).toEqual(CAREER_INTEREST_THEMES.filter(x=>original.riasec.includes(x)));
   expect(role!.sourceHash).toMatch(/^[a-f0-9]{64}$/);
  }
 },45000);
});
