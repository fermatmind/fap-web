import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { MentalAgeClassicClient } from "./MentalAgeClassicClient";
import { mentalAgeStyles } from "@/lib/questionnaires/mentalAge";

export function MentalAgeClassicPage({quiz,locale,take=false,guide=false, traditionalCopy }:{quiz:Questionnaire;locale:Locale;take?:boolean;guide?:boolean; traditionalCopy?: (text: string) => string }) {
  const displayLocale = traditionalCopy ? "zh-TW" : locale;
  const displayText = (text: string) => traditionalCopy?.(text) ?? text;
 const zh=locale==="zh",path=`/${displayLocale}/tests/explore/mental-age`,profile=quiz.profiles[0];
 if(take)return <MentalAgeClassicClient quiz={quiz} locale={locale}/>;
 return <main className="mx-auto max-w-4xl px-5 py-10 sm:py-16" data-mental-age-classic-public data-mental-age-result-reading={guide?"true":undefined}>
  <h1 className="text-4xl font-semibold leading-tight">{guide?profile.title[locale]:quiz.title[locale]}</h1>
  <p className="mt-5 text-lg leading-8 text-slate-600">{guide?profile.summary[locale]:quiz.description[locale]}</p>
  <p className="mt-4 font-semibold text-emerald-900">{zh?displayText("30道计分陈述＋3个可跳过非计分屏 · 实际年龄选填 · 全部免费"):"30 scored statements · Optional actual age · Completely free"}</p>
  <QuestionnaireTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale}/>
  {!guide&&<p className="my-7 leading-8">{quiz.introduction[locale]}</p>}
  <section id="mental-age-sample" className="my-8 rounded-2xl bg-emerald-950 p-6 text-emerald-50"><h2 className="text-xl font-semibold">{zh?displayText("结果示例：全选中立"):"Sample result: all middle answers"}</h2><p className="my-4 text-6xl font-semibold">40{zh?displayText("岁"):" years"}</p><p>{zh?displayText("30×1＝30；10＋30＝40。风格：随心调和。若实际年龄为35，游戏数字差为＋5；以2026年为例，等效年份为1986。"):"30 × 1 = 30; 10 + 30 = 40. Style: Open blend. With actual age 35, the game-number gap is +5. Using 2026 as an example, the equivalent year is 1986."}</p></section>
  <nav aria-label={zh?displayText("本页目录"):"On this page"} className="my-6 flex flex-wrap gap-4">{profile.sections.map(s=><a key={s.id} href={`#report-${s.id}`} className="underline">{s.title[locale]}</a>)}</nav>
  {profile.sections.map(s=><section aria-labelledby={s.id==="arithmetic"?"questionnaire-method":undefined} id={`report-${s.id}`} key={s.id} className="my-8 scroll-mt-24"><h2 id={s.id==="arithmetic"?"questionnaire-method":undefined} className="text-2xl font-semibold">{s.title[locale]}</h2>{s.paragraphs.map((p,i)=><p key={i} className="mt-4 leading-8">{p[locale]}</p>)}</section>)}
  <section id="calculation" className="my-8"><h2 className="text-2xl font-semibold">{zh?displayText("全部七种风格"):"All seven styles"}</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{mentalAgeStyles.map(s=><li key={s.min} className="rounded-xl border p-4"><strong>{s.min}–{s.max} · {s.title[locale]}</strong><p className="mt-2 leading-7">{s.reading[locale]}</p></li>)}</ul></section>
  <section className="my-8"><h2 className="text-2xl font-semibold">{zh?displayText("常见问题"):"Frequently asked questions"}</h2>{quiz.faq.map((f,i)=><details key={i} className="border-b py-4"><summary className="cursor-pointer font-semibold">{f.question[locale]}</summary><p className="mt-3 leading-8">{f.answer[locale]}</p></details>)}</section>
  <div className="my-8 flex flex-wrap gap-5"><Link href={guide?`${path}#take-test`:`${path}/results/${profile.id}`} className="underline">{guide?(zh?displayText("开始免费心理年龄测试"):"Take the free Mental Age Test"):(zh?displayText("阅读完整公开结果指南"):"Read the complete public result guide")}</Link><Link href={`/${zh?displayText("en"):"zh"}/tests/explore/mental-age${guide?`/results/${profile.id}`:""}`} className="underline">{zh?displayText("English"):"Chinese (Simplified)"}</Link><Link href={`/${displayLocale}/tests`} className="underline">{zh?displayText("更多测试"):"More tests"}</Link></div>
  <JsonLd id="mental-age-classic-faq" data={{"@context":"https://schema.org","@type":"FAQPage",mainEntity:quiz.faq.map(f=>({"@type":"Question",name:f.question[locale],acceptedAnswer:{"@type":"Answer",text:f.answer[locale]}}))}}/>
 </main>;
}
