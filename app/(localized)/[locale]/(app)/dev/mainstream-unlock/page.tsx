import Link from "next/link";
import { notFound } from "next/navigation";
import { MainstreamPaidResult } from "@/components/commerce/MainstreamPaidResult";
import type { ReportResponse, RiasecPurchase } from "@/lib/api/v0_3";
export const metadata = {title:"解锁页设计预览",robots:{index:false,follow:false}};
const forms = [["mbti93","MBTI","93"],["mbti144","MBTI","144"],["big590","BIG5_OCEAN","90"],["big5120","BIG5_OCEAN","120"],["enneagram105","ENNEAGRAM","105"],["enneagram144","ENNEAGRAM","144"],["iq30","IQ_RAVEN","30"],["iq40","IQ_INTELLIGENCE_QUOTIENT","40"],["eq60","EQ_60","60"],["archetypes48","JUNG_ARCHETYPES","48"],["cognitive64","JUNG_COGNITIVE_FUNCTIONS","64"],["disc24","DISC_BEHAVIOR","24"]];
export default async function Preview({params,searchParams}:{params:Promise<{locale:string}>,searchParams:Promise<{form?:string,lang?:string}>}) {
 if(process.env.NODE_ENV!=="development")notFound();
 const {locale:routeLocale}=await params;const query=await searchParams;
 const locale=query.lang==="zh-TW"?"zh-TW":routeLocale==="en"?"en":"zh";
 const selected=forms.find(f=>f[0]===query.form)??forms[0];
 const scale=selected[1];
 const scores=scale==="MBTI"?{EI:39,SN:65,TF:70,JP:54}:scale==="BIG5_OCEAN"?{O:72,C:58,E:44,A:66,N:38}:scale==="ENNEAGRAM"?{T1:40,T2:48,T3:54,T4:69,T5:78,T6:60,T7:39,T8:43,T9:54}:scale==="EQ_60"?{SA:68,ER:54,EM:72,RM:61}:scale==="DISC_BEHAVIOR"?{D:8,I:7,S:5,C:4}:scale==="JUNG_ARCHETYPES"?{explorer:75,lover:68,creator:62,jester:60,ruler:56,everyperson:52,hero:48,caregiver:44,innocent:40,sage:38,magician:35,rebel:32}:scale.startsWith("JUNG")?{Ni:72,Ne:64,Si:58,Se:40,Ti:68,Te:52,Fi:61,Fe:49}:{};
 const data={ok:true,meta:{scale_code:scale},result:{...(scale==="MBTI"?{type_code:"INTJ"}:{}),scores_pct:scores,summary:scale.startsWith("IQ")?{correct:18,total:Number(selected[2]),percent_correct:18/Number(selected[2])*100,duration_ms:720000}:{}}} as unknown as ReportResponse;
 const purchase={attempt_id:"local-design-preview",unlocked:false,order_no:null,payment_state:null,offers:[]} as RiasecPurchase;
 return <main><nav className="flex flex-wrap gap-3 bg-[#1e1634] p-4 text-sm text-white" aria-label="本地预览版本">{forms.map(f=><Link key={f[0]} href={`?form=${f[0]}&lang=${locale}`} aria-current={f[0]===selected[0]?"page":undefined} className="underline aria-[current=page]:text-purple-300">{f[1]} · {f[2]}</Link>)}<Link href={`?form=${selected[0]}&lang=zh-TW`}>繁體</Link><Link href={`/en/dev/mainstream-unlock?form=${selected[0]}`}>English</Link><Link href={`/zh/dev/mainstream-unlock?form=${selected[0]}`}>简体</Link></nav><MainstreamPaidResult data={data} purchase={purchase} locale={locale} preview/></main>;
}
