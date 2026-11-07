import { expect,it,vi } from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import Page from "@/components/questionnaires/QuestionnairePage";
import raw from "@/lib/questionnaires/data/mental-age.json";
import catalog from "@/lib/questionnaires/catalog.json";
import directory from "@/lib/entertainment/directory-copy.json";
import cards from "@/components/tests/discovery-card-editorial.json";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
it("publishes the new classic in both locales without the retired 12-item marketing or arithmetic",async()=>{
 expect(catalog.find(q=>q.slug===raw.slug)?.description).toEqual(raw.description);expect(catalog.find(q=>q.slug===raw.slug)?.questionCount).toBe(30);
 for(const locale of ["en","zh"]as const){const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(await Page({params:Promise.resolve({locale,slug:raw.slug})}));
 expect(dom.querySelectorAll('h1')).toHaveLength(1);expect(dom.querySelector('[data-mental-age-classic-public]')).not.toBeNull();expect(dom.textContent).toContain(raw.introduction[locale]);
 expect(dom.textContent).not.toMatch(/twelve|12 original|37 playful|18\s*\+\s*2|十二题|原创12|37个|18至90/i);
 for(const s of raw.profiles[0].sections)for(const p of s.paragraphs)expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
 expect(directory['mental-age'][locale]).toMatch(/30/);expect(cards['mental-age'].subtitle[locale]).toMatch(/30/);
 }
});
