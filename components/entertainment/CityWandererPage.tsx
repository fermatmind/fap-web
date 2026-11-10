import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { FunQuiz } from "@/lib/entertainment/types";
import { resultPath } from "@/lib/entertainment/guides";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { traditionalBespokeEditorial } from "@/lib/i18n/zh-TW/bespokeStories";
import { StoryTakeEntry } from "./StoryTakeEntry";
import { cityWandererSections, cityWandererFaq } from "./CityWandererEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#city-wanderer-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function CityWandererPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "city-wanderer") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/city-wanderer`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: cityWandererSections, faq: cityWandererFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创城市漫游情境 · 完整画像免费", "Original city-wanderer scenes · Full portraits free", "原創城市漫遊情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "In each imagined neighborhood scene, choose the spatial connection, public rhythm or historical thread that draws your attention. Complete six choices for all three counts and every highest tie. No outing, GPS, agreement checkbox or saved progress is required.", zh: traditional ? "每個虛構街區場景，選擇更吸引你的空間連線、公共節奏或歷史線索。六題完成後檢視三項次數與全部最高並列。無需外出、GPS、入口同意勾選或儲存進度。" : "每个虚构街区场景，选择更吸引你的空间连接、公共节奏或历史线索。六题完成后查看三项次数与全部最高并列。无需外出、GPS、入口同意勾选或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="city-wanderer-methods"><h2 id="city-wanderer-methods">{text("三种城市观察视角、方法背景与结果读法", "Three urban observation lenses, method background and result readings", "三種城市觀察視角、方法背景與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`city-wanderer-${s.id}`}><h3 id={`city-wanderer-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种城市漫游画像：完整公开指南", "Three city-wanderer portraits: complete public guides", "三種城市漫遊人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("城市漫游方式测试常见问题", "City Wanderer Quiz: frequently asked questions", "城市漫遊方式測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="city-wanderer-references"><h2 id="city-wanderer-references" className="text-xl font-semibold">{text("城市研究与观察方法背景", "Urban research and observation background", "城市研究與觀察方法背景")}</h2><ol className="mt-4 space-y-2"><li id="city-wanderer-reference-1"><a className="underline" rel="noopener noreferrer" href="https://mitpress.mit.edu/9780262620017/the-image-of-the-city/">{text("1. MIT Press：林奇《城市意象》出版与研究介绍", "1. MIT Press: Lynch, The Image of the City — publisher overview", "1. MIT Press：林奇《城市意象》出版與研究介紹")}</a></li><li id="city-wanderer-reference-2"><a className="underline" rel="noopener noreferrer" href="https://github.com/gehl-institute/pldp">{text("2. Gehl Institute等：公共生活数据协议与调查工具", "2. Gehl Institute and partners: Public Life Data Protocol and survey tools", "2. Gehl Institute等：公共生活資料協議與調查工具")}</a></li><li id="city-wanderer-reference-3"><a className="underline" rel="noopener noreferrer" href="https://historicengland.org.uk/images-books/publications/understanding-place-historic-area-assessments/">{text("3. Historic England（2017）：历史区域评估指南", "3. Historic England (2017): Understanding Place, Historic Area Assessments", "3. Historic England（2017）：歷史區域評估指南")}</a></li></ol></section>
  </Container></Surface>;
}
