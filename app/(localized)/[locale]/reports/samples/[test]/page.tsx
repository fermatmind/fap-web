import { loadEqResultSample } from "@/lib/eq/loadResultSample";
import { EQResultPage } from "@/components/result/eq/EQResultPage";
import { notFound } from "next/navigation";
import { MainstreamSampleReport } from "@/components/commerce/MainstreamSampleReport";
import { loadFixedSample, loadFixedMbtiSampleContent } from "@/lib/reports/fixedSamples";
import { projectTraditionalResultDisplay } from "@/lib/tests/traditionalAssessmentDisplay";
export const metadata={robots:{index:false,follow:false}};
export default async function Sample({params,searchParams}:{params:Promise<{locale:string,test:string}>,searchParams?:Promise<{lang?:string}>}) {
 const {locale,test}=await params;if(test === "cognitive")notFound();const query=await searchParams;
 const display=locale==="zh-TW" || query?.lang==="zh-TW"?"zh-TW":locale==="en"?"en":"zh";
 if(test === "eq") return <EQResultPage page={await loadEqResultSample()} locale={display} sample/>;
 const data=await loadFixedSample(test,locale==="en"?"en":"zh");if(!data)notFound();
 return <MainstreamSampleReport mbtiContent={test === "mbti" ? await loadFixedMbtiSampleContent(display) : null} data={await projectTraditionalResultDisplay(data,display)} locale={display}/>;
}
