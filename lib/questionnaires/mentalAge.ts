import type { Questionnaire, Text } from "./types";

export const MENTAL_AGE_VERSION = "fm_mental_age_classic30_v2";
export type MentalAgeResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete"; answered: 30; mentalAge: { sum: number; playfulAge: number; points: Record<string, number> };
};
const plain = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const text = (v: unknown): v is Text => plain(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const dense = (v: unknown, n: number, test: (v: unknown, i: number) => boolean) => Array.isArray(v) && v.length === n && Array.from(v).every(test);
const sections = ["meaning", "arithmetic", "examples", "situations", "counterexamples", "comparison", "action", "method"];
export function isMentalAgeConfigurationValid(q: unknown): q is Questionnaire {
  if (!plain(q) || q.slug !== "mental-age" || q.kind !== "mental-age" || q.code !== "FM_MENTAL_AGE_CLASSIC30" || q.version !== MENTAL_AGE_VERSION
    || !plain(q.source) || q.source.kind !== "fermatmind_original_playful_mental_age" || q.source.formCode !== MENTAL_AGE_VERSION || q.source.itemBankVersion !== MENTAL_AGE_VERSION
    || q.source.scoringVersion !== "fm_classic30_sum0to60_age10plus_v2" || q.source.resultContentVersion !== "fm_classic30_styles7_reading_v2" || q.source.psychometricValidationCompleted !== false
    || ![q.title,q.seoTitle,q.description,q.introduction,q.instructions,q.resultHeading].every(text)) return false;
  const section = (s: unknown) => plain(s) && text(s.title) && dense(s.paragraphs, 1, text);
  return dense(q.directions, 1, d => plain(d) && d.id === "age-points" && d.itemCount === 30 && text(d.title))
    && dense(q.questions, 30, (item, i) => plain(item) && item.id === `MAC_${String(i + 1).padStart(2,"0")}` && text(item.prompt) && item.reverse === undefined && item.correctOptionId === undefined
      && dense(item.options, 3, (o,j) => plain(o) && o.id === ["agree","neither","disagree"][j] && text(o.label) && o.directionId === "age-points" && o.score === (j === 1 ? 1 : i % 2 ? 2-j : j)))
    && dense(q.profiles, 1, p => plain(p) && p.id === "understanding-your-playful-age" && dense(p.directionIds,1,d=>d==="age-points") && [p.title,p.headline,p.summary,p.scoreReading].every(text)
      && plain(p.seo) && text(p.seo.title) && text(p.seo.description) && dense(p.sections,8,(s,i)=>section(s) && plain(s) && s.id===sections[i]))
    && dense(q.guide,6,section) && dense(q.faq,6,f=>plain(f)&&text(f.question)&&text(f.answer));
}
export function scoreMentalAgeQuestionnaire(q: unknown, answers: unknown): MentalAgeResult {
  if (!isMentalAgeConfigurationValid(q)) return {status:"unavailable",answered:0};
  if (!plain(answers) || Object.getOwnPropertySymbols(answers).length) return {status:"invalid",answered:0};
  const ds=Object.getOwnPropertyDescriptors(answers);
  if(Object.values(ds).some(d=>!Object.hasOwn(d,"value")||!d.enumerable)) return {status:"invalid",answered:0};
  const points:Record<string,number>={}; let sum=0,answered=0;
  for(const [id,d] of Object.entries(ds)) {
    const o=typeof d.value === "string" ? q.questions.find(q=>q.id===id)?.options.find(o=>o.id===d.value) : undefined;
    if(!o || typeof o.score!=="number")return{status:"invalid",answered};
    points[id]=o.score;sum+=o.score;answered++;
  }
  if(answered!==30)return{status:"incomplete",answered};
  return{status:"complete",answered:30,mentalAge:{sum,playfulAge:10+sum,points}};
}
export const mentalAgeStyles = [
  {min:10,max:18,title:{en:"Discovery spark",zh:"发现火花"},reading:{en:"Your answers leaned strongly toward novelty and an open pace in these imagined situations.",zh:"在这些想象情境中，你的回答更偏向新鲜体验和开放节奏。"}},
  {min:19,max:27,title:{en:"Playful explorer",zh:"轻快探索"},reading:{en:"Many of your choices made room for variety and spontaneous small discoveries.",zh:"你的许多选择为变化和即兴的小发现留出了空间。"}},
  {min:28,max:36,title:{en:"Curious mixer",zh:"好奇混搭"},reading:{en:"Your choices included familiar comforts while often leaving a door open to something new.",zh:"你的选择包含熟悉的舒适感，也经常为新体验留一扇门。"}},
  {min:37,max:43,title:{en:"Open blend",zh:"随心调和"},reading:{en:"The sum sits near this game’s middle. Individual answers may still differ sharply; this is not proof of a balanced personality.",zh:"总和接近本游戏中点，但逐题选择仍可能差异很大；这不证明人格平衡。"}},
  {min:44,max:52,title:{en:"Familiar anchor",zh:"熟悉锚点"},reading:{en:"Your answers often favored recognizable settings, some preparation and comfortable choices.",zh:"你的回答常偏向熟悉环境、适度准备和舒适选择。"}},
  {min:53,max:61,title:{en:"Quiet rhythm",zh:"安静节奏"},reading:{en:"Many choices favored an unhurried pace and routines you already enjoy.",zh:"你的许多选择偏向从容节奏和已经喜欢的惯常安排。"}},
  {min:62,max:70,title:{en:"Steady ritual",zh:"稳定仪式"},reading:{en:"Your answers leaned strongly toward predictable and familiar forms in this question set.",zh:"在本题组中，你的回答更偏向有预期、熟悉的活动形式。"}},
] as const;
export const mentalAgeStyle = (age:number) => mentalAgeStyles.find(s=>age>=s.min&&age<=s.max);
export function parseActualAge(raw:string):number|null|undefined {
  if(!raw.trim())return null;
  if(!/^\d{1,3}$/.test(raw.trim()))return undefined;
  const n=Number(raw);return Number.isInteger(n)&&n>=1&&n<=125?n:undefined;
}
export function mentalAgeComparison(age:number,actual:number|null,year:number) {
  if(!Number.isInteger(age)||age<10||age>70||!Number.isInteger(year)||year<1900||year>9999||actual!==null&&(!Number.isInteger(actual)||actual<1||actual>125))return null;
  return {gap:actual===null?null:age-actual,equivalentYear:year-age};
}
export const mentalAgeExtraScreens = [
 {id:"gender",title:{en:"Optional gender information",zh:"可选性别信息"},options:[{en:"Male",zh:"男"},{en:"Female",zh:"女"},{en:"Another description",zh:"其他描述"},{en:"Keep private",zh:"保密"}]},
 {id:"experience",title:{en:"How was this session?",zh:"这次测试体验如何？"},options:[{en:"I enjoyed it",zh:"玩得开心"},{en:"Room to improve",zh:"还有改进空间"},{en:"No particular view",zh:"暂时没有看法"}]},
 {id:"astrology",title:{en:"Your view on astrology in entertainment",zh:"你怎样看待娱乐话题中的星座？"},options:[{en:"I enjoy the stories",zh:"喜欢其中的故事"},{en:"Occasionally interesting",zh:"偶尔觉得有趣"},{en:"Not my interest",zh:"不太感兴趣"}]},
] as const;
