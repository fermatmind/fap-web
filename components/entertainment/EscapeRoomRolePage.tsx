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
import { escapeRoomRoleSections, escapeRoomRoleFaq } from "./EscapeRoomRoleEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#escape-room-role-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function EscapeRoomRolePage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "escape-room-role") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/escape-room-role`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: escapeRoomRoleSections, faq: escapeRoomRoleFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创纸上密室情境 · 完整画像免费", "Original paper-puzzle scenes · Full portraits free", "原創紙上密室情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each paper escape-room scene, choose the contribution you would prefer: connect the available clues, test one explanation or review attempts and shared game time. Answer all six for the three counts and every highest tie. No actual code, team, entry agreement, MBTI result or saved progress is required.", zh: traditional ? "每個紙上密室情境，選擇更願提供的貢獻：連線已有線索、試一個解釋，或回看嘗試與共同遊戲時間。六題全部完成後檢視三項次數與最高並列。無需真實密碼、組隊、入口同意、MBTI結果或儲存進度。" : "每个纸上密室情境，选择更愿提供的贡献：连接已有线索、试一个解释，或回看尝试与共同游戏时间。六题全部完成后查看三项次数与最高并列。无需真实密码、组队、入口同意、MBTI结果或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="escape-room-role-methods"><h2 id="escape-room-role-methods">{text("三种游戏贡献、透明计数与结果读法", "Three play contributions, transparent counts and result readings", "三種遊戲貢獻、透明計數與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`escape-room-role-${s.id}`}><h3 id={`escape-room-role-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种密室小队画像：完整公开指南", "Three escape-room-role portraits: complete public guides", "三種密室小隊人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("密室游戏团队角色测试常见问题", "Escape Room Team Role Quiz: frequently asked questions", "密室遊戲團隊角色測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="escape-room-role-references"><h2 id="escape-room-role-references" className="text-xl font-semibold">{text("密室形式研究与教育游戏主持参考", "Escape-room format research and educational facilitation references", "密室形式研究與教育遊戲主持參考")}</h2><ol className="mt-4 space-y-2"><li id="escape-room-role-reference-1"><a className="underline" rel="noopener noreferrer" href="https://scottnicholson.com/pubs/erfacwhite.pdf">{text("1. Nicholson（2015）：密室设施调查白皮书", "1. Nicholson (2015): survey of escape-room facilities, white paper", "1. Nicholson（2015）：密室設施調查白皮書")}</a></li><li id="escape-room-role-reference-2"><a className="underline" rel="noopener noreferrer" href="https://my.unicef.fr/wp-content/uploads/2020/11/Escape-Game-Unicef-GUIDE-MAITRE-DU-JEU-BD.pdf">{text("2. UNICEF法国：《安娜的笔记》主持指南", "2. UNICEF France: Le carnet d’Anna game-master guide", "2. UNICEF法國：《安娜的筆記》主持指南")}</a></li><li id="escape-room-role-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.reseau-canope.fr/fileadmin/user_upload/Projets/Escape_games_VR/guide-du-maitre-de-jeu.pdf">{text("3. Réseau Canopé：主持与游戏后复盘指南", "3. Réseau Canopé: facilitation and post-game debrief guide", "3. Réseau Canopé：主持與遊戲後復盤指南")}</a></li></ol></section>
  </Container></Surface>;
}
