import { buildEqProfile, type TraitProfilePreview } from "@/components/commerce/TraitProfileUnlockPreview";
import { interestPreviewStory } from "@/components/commerce/interestPreviewStory";
import { buildDiscDesignPreview } from "@/components/commerce/DiscUnlockPreview";
import { loadFixedSample } from "@/lib/reports/fixedSamples";
import { buildIqResultPresentation } from "@/lib/iq/presentation";
import { ResultPreviewShare } from "@/components/commerce/ResultPreviewShare";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import unlockStyles from "@/components/career/unlock-report-experience.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadRiasec60DesignReport } from "@/components/result/riasec/riasec60PreviewData";
import { UnlockReportExperience } from "@/components/career/UnlockReportExperience";
import { Career94FreeReport } from "../../../career/assessment/Career94FreeReport";
import { MainstreamPaidResult } from "@/components/commerce/MainstreamPaidResult";
import type { ReportResponse, RiasecPurchase } from "@/lib/api/v0_3";
export const metadata = {title:"解锁页设计预览",robots:{index:false,follow:false}};
const forms = [["mbti93","MBTI","93"],["mbti144","MBTI","144"],["big590","BIG5_OCEAN","90"],["enneagram105","ENNEAGRAM","105"],["iq30","IQ_RAVEN","30"],["iq40","IQ_INTELLIGENCE_QUOTIENT","40"],["eq60","EQ_60","60"],["archetypes48","JUNG_ARCHETYPES","48"],["disc24","DISC_BEHAVIOR","24"],["holland60","RIASEC","60"],["career94","CAREER","94"]];
const artwork: Record<string, string> = {
  ENNEAGRAM: "/images/enneagram-report-reflection.webp",
  IQ_RAVEN: "/images/test-covers/logical-reasoning.webp",
  IQ_INTELLIGENCE_QUOTIENT: "/images/test-covers/logical-reasoning.webp",
  JUNG_ARCHETYPES: "/images/jung/archetypes/explorer.webp",
};

export default async function Preview({params,searchParams}:{params:Promise<{locale:string}>,searchParams:Promise<{form?:string,lang?:string}>}) {
 if(process.env.NODE_ENV!=="development")notFound();
 const {locale:routeLocale}=await params;const query=await searchParams;
 const locale=query.lang==="zh-TW"?"zh-TW":routeLocale==="en"?"en":"zh";
 const selected = forms.find(form => form[0] === (query.form ?? forms[0][0]));
 if (!selected) notFound();
 const scale=selected[1];
 const holland = scale === "RIASEC" ? await loadRiasec60DesignReport(locale) : null;
 const names: Record<string, string> = { MBTI: "MBTI", BIG5_OCEAN: "大五人格", ENNEAGRAM: "九型人格", IQ_RAVEN: "智商测试", IQ_INTELLIGENCE_QUOTIENT: "智商测试", EQ_60: "情商测试", JUNG_ARCHETYPES: "荣格原型", DISC_BEHAVIOR: "DISC", RIASEC: "霍兰德职业兴趣", CAREER: "职业测试" };
 const scores=scale==="MBTI"?{EI:39,SN:65,TF:70,JP:54}:scale==="BIG5_OCEAN"?{O:72,C:58,E:44,A:66,N:38}:scale==="JUNG_ARCHETYPES"?{explorer:75,lover:68,creator:62,jester:60,ruler:56,everyperson:52,hero:48,caregiver:44,innocent:40,sage:38,magician:35,rebel:32}:{};
 const data={ok:true,meta:{scale_code:scale},result:{...(scale==="MBTI"?{type_code:"INTJ"}:{}),scores_pct:scores,summary:scale.startsWith("IQ")?{correct:18,total:Number(selected[2]),percent_correct:18/Number(selected[2])*100,duration_ms:720000}:{}}} as unknown as ReportResponse;
 const purchase={attempt_id:"local-design-preview",unlocked:false,order_no:null,payment_state:null,offers:[]} as RiasecPurchase;
 const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
 const sampleKeys: Record<string, string> = {
   MBTI: "mbti", BIG5_OCEAN: "big5", ENNEAGRAM: "enneagram", IQ_RAVEN: "iq30", IQ_INTELLIGENCE_QUOTIENT: "iq40",
   EQ_60: "eq", JUNG_ARCHETYPES: "archetypes", DISC_BEHAVIOR: "disc",
 };
 const samplePath = scale === "RIASEC" ? `/${locale}/tests/holland-career-interest-test-riasec/sample`
   : scale === "CAREER" ? `/${locale === "en" ? "en" : "zh"}/career/assessment/sample`
   : `/${locale}/reports/samples/${sampleKeys[scale]}`;
 const englishNames: Record<string, string> = { BIG5_OCEAN:"Big Five", ENNEAGRAM:"Enneagram", IQ_RAVEN:"Reasoning test", IQ_INTELLIGENCE_QUOTIENT:"Reasoning test", EQ_60:"Emotional intelligence", JUNG_ARCHETYPES:"Jungian archetypes", DISC_BEHAVIOR:"DISC", RIASEC:"Holland career interests", CAREER:"Career assessment" };
 const traditionalNames: Record<string, string> = { IQ_RAVEN:"智商測驗", IQ_INTELLIGENCE_QUOTIENT:"智商測驗", EQ_60:"情商測驗", JUNG_ARCHETYPES:"榮格原型", RIASEC:"霍蘭德職涯興趣", CAREER:"職涯測驗" };
 const bigFive = scale === "BIG5_OCEAN";
 const currentAssessmentPath = bigFive ? "/tests/big-five-personality-test-ocean-model"
   : scale === "ENNEAGRAM" ? "/tests/enneagram-personality-test-nine-types" : undefined;
 const related = displayNavigationPath(currentAssessmentPath ?? "/tests", locale);
 const disc = scale === "DISC_BEHAVIOR"
   ? buildDiscDesignPreview((await loadFixedSample("disc", locale === "en" ? "en" : "zh"))?.report?.disc, locale)
   : undefined;
 const reasoningSample = scale.startsWith("IQ_") ? await loadFixedSample(sampleKeys[scale], locale === "en" ? "en" : "zh") : null;
 const dimensions = reasoningSample?.report?.dimensions as Record<string, {
   dimension_code: string; dimension_name: string; item_count: number; correct_count: number;
 }> | undefined;
 const reasoningRows = Object.values(dimensions ?? {}).filter(row => Number.isInteger(row.item_count) && row.item_count > 0);
 const reasoningTotal = reasoningRows.reduce((sum, row) => sum + row.item_count, 0);
 const iqPreviewReport = reasoningSample && reasoningTotal ? { ...reasoningSample, expected_item_count: reasoningTotal } : null;
 const iqPresentation = iqPreviewReport ? buildIqResultPresentation({
   locale: locale === "en" ? "en" : "zh",
   reportData: iqPreviewReport,
   resultData: null,
   locked: iqPreviewReport.locked !== false,
 }) : null;
 const reasoning = reasoningTotal ? {
   total: reasoningTotal,
   referenceScore: iqPresentation?.scoreKind === "beta_reference" ? iqPresentation.standardScore : null,
   correct: reasoningRows.reduce((sum, row) => sum + row.correct_count, 0),
   categories: reasoningRows.map(row => ({
     code: row.dimension_code,
     label: locale === "zh-TW" ? ({ VSI: "視覺空間洞察", VSPR: "視覺空間模式推理", NPR: "數字規律推理" } as Record<string, string>)[row.dimension_code] ?? row.dimension_name : row.dimension_name,
     items: row.item_count,
     correct: row.correct_count,
   })),
 } : undefined;
 const profileSample = scale === "ENNEAGRAM" || scale === "EQ_60"
   ? await loadFixedSample(sampleKeys[scale], locale === "en" ? "en" : "zh")
   : null;
 const enneagram = profileSample?.enneagram_report_v2 as {
   candidates?: { type_id: string; type_name: string; rank: number }[];
   distribution?: { type: string; label: string; score_norm: number; center: string }[];
 } | undefined;
 const primary = enneagram?.candidates?.find(row => row.rank === 1);
 const ranked = enneagram?.candidates?.find(row => row.rank === 2);
 const eqRows = profileSample?.report?.dimension_summary as { code: string; standard_score: number }[] | undefined;
 const traitProfile: TraitProfilePreview | undefined = primary && enneagram?.distribution?.length === 9 ? {
   kind: "enneagram",
   title: primary.type_name,
   label: t(`${primary.type_id} 号 · 得分最高的候选`, `${primary.type_id} 號 · 得分最高的候選`, `Type ${primary.type_id} · Leading candidate`),
   description: ranked ? t(
     `本次作答中，${primary.type_id} 号与 ${ranked.type_id} 号接近。可以对照两种动机，看看哪个更贴近实际经历。`,
     `本次作答中，${primary.type_id} 號與 ${ranked.type_id} 號接近。可以對照兩種動機，看看哪個更貼近實際經歷。`,
     `Types ${primary.type_id} and ${ranked.type_id} scored close together. Compare their motivations with your experiences.`,
   ) : "",
   lead: primary.type_id,
   art: "/images/enneagram-report-reflection.webp",
   rows: enneagram.distribution.map(row => {
     const scoreLabel = t(`${row.type} 号`, `${row.type} 號`, `Type ${row.type}`);
     const named = enneagram.candidates?.find(candidate => candidate.type_id === row.type)?.type_name;
     return { code: row.type, center: row.center, score: row.score_norm, label: named ? `${scoreLabel} · ${named}` : scoreLabel };
   }),
 } : eqRows ? buildEqProfile(eqRows, locale) : undefined;
 const story = holland ? interestPreviewStory(holland.model, locale) : traitProfile ? {
   title: traitProfile.title, art: traitProfile.art, tags: [traitProfile.label],
 } : undefined;
 const scoreCardAxes = bigFive
   ? Object.entries(scores).flatMap(([axis, score]) => typeof score === "number" ? [{ axis, score }] : [])
   : undefined;
 const previewResult = holland ? (
   <UnlockReportExperience
     model={holland.model}
     locale={locale}
     assessment="riasec60"
     designPreview
     readings={holland.readings}
     chainReading={holland.chainReading}
     sampleHref={`/${locale}/tests/holland-career-interest-test-riasec/sample`}
   />
 ) : scale === "CAREER" ? (
   <Career94FreeReport locale={locale === "en" ? "en" : "zh"} sample overview designPreview />
 ) : (
   <MainstreamPaidResult data={data} purchase={purchase} locale={locale} preview previewArtwork={artwork[scale]} reasoningPreview={reasoning} discPreview={disc} traitProfile={traitProfile} />
 );

 const sharePreview = <ResultPreviewShare
   key={selected[0] + locale}
   locale={locale}
   samplePath={samplePath}
   name={locale === "en" ? englishNames[scale] ?? names[scale] : locale === "zh-TW" ? traditionalNames[scale] ?? names[scale] : names[scale]}
   scores={scoreCardAxes}
   reasoning={reasoning}
   disc={disc}
   story={story}
   highlight={bigFive ? t("开放性 · 本次最高维度", "開放性 · 本次最高維度", "Openness · Highest dimension") : scale === "MBTI" ? "INTJ" : `${selected[2]}${t(" 题", " 題", " questions")}`}
 />;

 return (
   <main className="overflow-x-clip">
     <nav className="flex flex-wrap gap-3 bg-[#1e1634] p-4 text-sm text-white" aria-label="本地预览版本">
       {forms.map(([form, code, count]) => (
         <Link key={form} href={`?form=${form}&lang=${locale}`}
           aria-current={form === selected[0] ? "page" : undefined}
           className="underline aria-[current=page]:text-purple-300">
           {names[code]} · {count}题
         </Link>
       ))}
       {scale !== "CAREER" && <Link href={`?form=${selected[0]}&lang=zh-TW`}>繁體</Link>}
       <Link href={`/en/dev/mainstream-unlock?form=${selected[0]}`}>English</Link>
       <Link href={`/zh/dev/mainstream-unlock?form=${selected[0]}`}>简体</Link>
     </nav>
     {scale === "MBTI" ? <>
       {previewResult}
       <div className={unlockStyles.dashboardPreview}><div className={unlockStyles.previewExplore}>{sharePreview}</div></div>
     </> : (
       <div className={unlockStyles.dashboardPreview}>
         {previewResult}
         <div className={unlockStyles.previewExplore}>
           <nav aria-label={t("下一步", "下一步", "Next steps")} className={unlockStyles.previewNavCards}>
             <Link href={related}><strong>{currentAssessmentPath
               ? t("查看测评介绍", "查看測驗介紹", "About this assessment")
               : t("挑选下一项测试", "挑選下一項測驗", "Choose your next assessment")}</strong>
               <span>{currentAssessmentPath
                 ? selected[2] + t(" 题 · 题本说明 →", " 題 · 題本說明 →", " questions · Form details →")
                 : t("查看测评目录 →", "查看測驗目錄 →", "Browse the test directory →")}</span>
             </Link>
             <Link href={displayNavigationPath("/career/guides", locale)}><strong>{t("阅读职业指南", "閱讀職涯指南", "Read career guides")}</strong><span>{t("了解真实任务与入行准备 →", "了解真實任務與入行準備 →", "Explore real tasks and routes into work →")}</span></Link>
           </nav>
           {scale !== "CAREER" && sharePreview}
           <section id="continue-exploring">
             <h2>{t("继续探索", "繼續探索", "Keep exploring")}</h2>
             <div className={unlockStyles.previewNavCards}>
               <Link href={displayNavigationPath("/tests", locale)}>{t("浏览全部测试", "瀏覽全部測驗", "Browse all assessments")} →</Link>
               <Link href={displayNavigationPath(bigFive ? "/history/big5" : "/account", locale)}>{t("我的结果", "我的結果", "My results")} →</Link>
             </div>
           </section>
         </div>
       </div>
     )}
   </main>
 );
}
