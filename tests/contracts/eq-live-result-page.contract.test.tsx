import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { eqResultPageSchema } from "@/lib/eq/resultPage";
import { EQResultV5 } from "@/components/result/eq/EQResultV5";
import { isEqPrivateResultLocaleCompatible } from "@/lib/eq/privateResultLocale";
import { buildEqRendererContractFixture, eqReportResponseFromContractFixture } from "@/tests/fixtures/eq/v5/eq60RendererContractFixture";

import SamplePage from "@/app/(localized)/[locale]/reports/samples/[test]/page";
const { loadSample } = vi.hoisted(() => ({loadSample: vi.fn()}));
vi.mock("@/lib/eq/loadResultSample", () => ({loadEqResultSample: loadSample}));

const ids = ["aware_but_unregulated", "high_empathy_low_recovery", "sensitive_absorber", "calm_but_distant", "relationship_first_self_later", "self_clear_repair_weak", "steady_collaborator", "developing_foundation", "balanced_integrated", "low_confidence_result"];
const locales = ["zh-CN", "en", "zh-TW"] as const;
const card = {title: "Context", body: "Backend content"};
const labels = {standard:"Standard score",strengths:"Strengths",growth:"Growth",try:"Try",result_label:"Reading focus",career_note:"Context exploration",overview:"Roles",career_order:"Context order",figure_note:"Public examples",progress:"Progress",complete:"Complete",completed:"Completed",privacy:"Page only",source:"Source",patterns:"Patterns",approaches:"Methods",suggestions:"Suggestions",check_example:"Reflect",small_experiment:"Practice"};
function packet(quality = false) {
  const shared = {title:"Report",sample_notice:"Sample notice",chart_title:"Emotional profile",sections:Array.from({length:10},(_,i)=>`Section ${i}`),labels,people:Array.from({length:6},(_,i)=>({name:`Person ${i}`,initials:`P${i}`,role:"Writer",body:"Public example",takeaway:"Reflection",source:"ref"})),insights:Array.from({length:7},(_,i)=>({...card,title:`Insight ${i}`})),science:Array.from({length:4},(_,i)=>({...card,title:`Science ${i}`}))};
  const bandCodes = ["baseline","developing","competent","proficient","exceptional"];
  const normal = {...shared,summary_title:"Your responses",summary:"From your real responses",dimensions:["SA","ER","EM","RM"].map((code,i)=>({code,name:`Dimension ${code}`,en_name:code,band_code:"competent",raw:50,score:97+i,color:"#8064a8",lead:"Observation",paragraphs:["First paragraph","Second paragraph"],strengths:["A","B","C","D"],growth:["E","F","G","H"],script:"Try a pause"})),careers:Array.from({length:8},(_,i)=>({title:`Role ${i}`,match_label:"Match",match_display:80,codes:["SA","ER"],body:"Work context",question:"Question",experiment:"Practice"})),work:Array.from({length:3},(_,i)=>({...card,title:`Work ${i}`})),stress:{intro:"Pressure",pattern:card,patterns:["A","B","C","D"],methods:["A","B","C","D","E","F"]},money:{intro:"Money",cards:[card,card,card],tips:["A","B","C","D"]},relationships:Array.from({length:3},(_,i)=>({...card,title:`Relationship ${i}`})),plan_intro:"Practice",plan:Array.from({length:7},(_,i)=>({period:`Week ${i}`,time:"3 minutes",title:`Step ${i}`,body:"Practice",why:"Learn"}))};
  return {schema:"eq60.result_page.v1",source_hash:"a".repeat(64),compiled_hash:"b".repeat(64),result_id:quality?"low_confidence_result":"balanced_integrated",result_labels:Object.fromEntries(ids.map(id=>[id,{kind:id==="low_confidence_result"?"quality_state":"self_report_pattern",...Object.fromEntries(locales.map(lang=>[lang,{title:lang==="en"?id:lang==="zh-TW"?"綜合觀察型":"综合观察型",description:"Description"}]))}])),dimension_bands:bandCodes.map((code,i)=>({code,min:[55,85,93,108,116][i],max_exclusive:[85,93,108,116,146][i],labels:Object.fromEntries(locales.map(lang=>[lang,code]))})),sources:[{id:"ref",title:"Primary source",url:"https://example.org/research",scope:Object.fromEntries(locales.map(lang=>[lang,"Research context"]))}],copy:Object.fromEntries(locales.map(lang=>[lang,quality?shared:normal])),quality:quality?Object.fromEntries(locales.map(lang=>[lang,{summary_title:"Review responses",summary:"Take your time",reasons_title:"Why",reasons:["A","B","C"],steps:[card,card,card]}])):null};
}
afterEach(cleanup);
describe("Live EQ shared result template",()=>{
  it.each(["zh","zh-TW","en"] as const)("uses the production renderer without preview controls in %s",locale=>{
    const base=locale==="en"?"en":"zh-CN";
    const response=eqReportResponseFromContractFixture(buildEqRendererContractFixture(base,"standard"));
    Object.assign(response,{eq60_result_page_v1:packet()});
    render(<EQResultV5 locale={locale==="en"?"en":"zh"} displayLocale={locale} reportData={response}/>);
    expect(document.querySelector('[data-eq-redesign="true"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-eq-module]')).toHaveLength(10);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("Sample notice")).not.toBeInTheDocument();
    expect(document.querySelector('a[href*="/dev/"]')).toBeNull();
    expect(screen.getAllByText("97").length).toBeGreaterThan(0);
  });
  it("renders the quality branch without normal dimensions or careers",()=>{
    const response=eqReportResponseFromContractFixture(buildEqRendererContractFixture("en","standard"));
    Object.assign(response,{eq60_result_page_v1:packet(true)});
    render(<EQResultV5 locale="en" reportData={response}/>);
    expect(document.querySelector('[data-eq-quality="true"]')).not.toBeNull();
    expect(document.querySelector('[data-eq-module="careers"]')).toBeNull();
    expect(screen.queryByText("Dimension SA")).not.toBeInTheDocument();
  });
  it.each(["zh", "zh-TW", "en"] as const)("loads the production sample route through the shared EQ component in %s",async locale=>{
    loadSample.mockResolvedValue(eqResultPageSchema.parse(packet()));
    render(await SamplePage({params:Promise.resolve({locale,test:"eq"})}));
    expect(document.querySelectorAll('[data-eq-module]')).toHaveLength(10);
    expect(screen.getByText("Sample notice")).toBeVisible();
    expect(document.querySelector('a[href*="/dev/"]')).toBeNull();
  });
  it("rejects English leakage in any newly rendered field",()=>{
    const response=eqReportResponseFromContractFixture(buildEqRendererContractFixture("en","standard"));
    const page=packet();Object.assign(response,{eq60_result_page_v1:page});
    expect(eqResultPageSchema.safeParse(page).success).toBe(true);
    expect(isEqPrivateResultLocaleCompatible(response,"en")).toBe(true);
    page.copy.en.science[0].body="未翻译";
    expect(isEqPrivateResultLocaleCompatible(response,"en")).toBe(false);
  });
});
