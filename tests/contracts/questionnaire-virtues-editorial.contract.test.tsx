import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { sevenSinsLandingCopy } from "@/lib/questionnaires/sevenSinsLandingCopy";
import raw from "@/lib/questionnaires/data/seven-sins-virtues-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
it("renders eight bilingual FAQ answers, folded source boundaries and all seven guides",async()=>{
 expect(catalog.find(q=>q.slug===raw.slug)?.description).toEqual(raw.description);
 for(const locale of ["en","zh"] as const){
  const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:raw.slug})}));
  expect(d.querySelectorAll("h1")).toHaveLength(1);
  expect(d.querySelector("#take-test [data-explore-start]")).not.toBeNull();
  const faq = Array.from(d.querySelector("#questionnaire-faq")!.parentElement!.querySelectorAll("details"));
  expect(faq.map(item => [item.querySelector("summary")?.textContent, item.querySelector("p")?.textContent]))
    .toEqual(sevenSinsLandingCopy[locale].faq);
  expect(faq).toHaveLength(8);
  expect(faq.map(item => item.hasAttribute("open"))).toEqual([true, true, true, false, false, false, false, false]);
  const graph = JSON.parse(d.querySelector("#seven-sins-landing-structured-data")!.textContent!)["@graph"];
  expect(graph.find((node: { "@type": string }) => node["@type"] === "FAQPage").mainEntity).toEqual(
    sevenSinsLandingCopy[locale].faq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
  );
  expect(graph.find((node: { "@type": string }) => node["@type"] === "WebApplication").name).toBe(d.querySelector("h1")?.textContent);
  expect(d.querySelectorAll("#seven-sins-pairs-heading + table tbody tr")).toHaveLength(7);
  expect(d.textContent).not.toMatch(/1080×1440|about 8 minutes|约8分钟/);
  expect(d.querySelector("details#questionnaire-reading-scope")?.hasAttribute("open")).toBe(false);
  for(const p of raw.profiles)expect(d.querySelector(`a[href="/${locale}/tests/explore/${raw.slug}/results/${p.id}"]`)).not.toBeNull();
  expect(d.querySelector('a[href="https://library.scottbarrykaufman.com/uploads/2014/04/Veselka-et-al.-2014.pdf"]')).not.toBeNull();
 }
});
