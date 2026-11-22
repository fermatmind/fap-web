import { IqResultShell } from "@/components/result/iq/IqResultShell";
import { buildIqResultExample } from "@/lib/iq/resultPreviewSamples";
import { EQResultPage } from "@/components/result/eq/EQResultPage";
import { notFound } from "next/navigation";
import { MainstreamSampleReport } from "@/components/commerce/MainstreamSampleReport";
import { loadFixedSample, loadFixedMbtiSampleContent } from "@/lib/reports/fixedSamples";
import { projectTraditionalResultDisplay } from "@/lib/tests/traditionalAssessmentDisplay";
import { findDiscPreviewProfile } from "@/components/result/disc/discPreviewProfiles";
import { DiscResultDesignPreview } from "@/components/result/disc/DiscResultDesignPreview";
export const metadata={robots:{index:false,follow:false}};
export default async function Sample({params,searchParams}:{params:Promise<{locale:string,test:string}>,searchParams?:Promise<{lang?:string,result?:string,sample?:string}>}) {
 const {locale,test}=await params;if(test === "cognitive")notFound();const query=await searchParams;
 const display=locale==="zh-TW" || query?.lang==="zh-TW"?"zh-TW":locale==="en"?"en":"zh";
 if (test === "iq30" && query?.sample === "middle") {
  const label = display === "en" ? "IQ 30-question report example · Sample data"
    : display === "zh-TW" ? "IQ 30 題結果示例 · 模擬資料" : "IQ 30 题结果示例 · 模拟数据";
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
   <h1 className="text-lg font-semibold">{label}</h1>
   <IqResultShell locale={display === "en" ? "en" : "zh"} displayLocale={display}
    reportData={buildIqResultExample("middle")} resultData={null} accessView={null} />
  </main>;
 }
 if(test === "eq") {
  const { loadEqResultSample } = await import("@/lib/eq/loadResultSample");
  return <EQResultPage page={await loadEqResultSample()} locale={display} sample/>;
 }
 const data=await loadFixedSample(test,locale==="en"?"en":"zh");if(!data)notFound();
 if (test === "disc") {
  const profile = findDiscPreviewProfile(query?.result ?? "single-d");
  if (!profile) notFound();
  return <DiscResultDesignPreview key={profile.id} profileId={profile.id} counts={profile.scores} locale={display} mode={process.env.NODE_ENV === "development" ? "preview" : "sample"} />;
 }
 return <MainstreamSampleReport mbtiContent={test === "mbti" ? await loadFixedMbtiSampleContent(display) : null} data={await projectTraditionalResultDisplay(data,display)} locale={display}/>;
}
