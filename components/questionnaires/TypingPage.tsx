import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { TypingClient } from "./TypingClient";

export function TypingPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试与练习" : "All tests and practice"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "原创打字练习 · 真实计时与完整指南免费" : "Original typing practice · Real timing and complete guides, free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <p className="mt-3 text-sm leading-7 text-slate-600">{zh ? "英/中文两种原文模式 · 每轮60秒 · 无需注册 · 允许改错" : "English and Chinese passage modes · 60 seconds per round · No signup · Corrections allowed"}</p>
    <TypingClient quiz={quiz} locale={locale} />
    <section className="my-8 space-y-4 leading-8" aria-labelledby="typing-purpose"><h2 id="typing-purpose" className="text-2xl font-semibold">{zh ? "怎样使用本轮结果？" : "How should you use this round’s result?"}</h2><p>{quiz.introduction[locale]}</p><p>{quiz.instructions![locale]}</p></section>
    {quiz.guide.map(section => <section key={section.id} className="my-8 space-y-4 leading-8" aria-labelledby={`typing-source-${section.id}`}><h2 id={`typing-source-${section.id}`} className="text-2xl font-semibold">{section.title[locale]}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph[locale]}</p>)}</section>)}
    <section className="my-8" aria-labelledby="typing-public-guides"><h2 id="typing-public-guides" className="text-2xl font-semibold">{zh ? "两份完整公开复习指南" : "Both complete public revision guides"}</h2><p className="my-4 leading-8 text-slate-600">{zh ? "英文与中文各有完整公式、算例、改错、输入法与设备说明；可开始前阅读，任何速度都不影响内容权限。它们是语言模式指南，不是分数档位或私人输入记录。" : "Each language has complete formulas, examples, correction, IME and device notes. Read them before starting; no speed unlocks or restricts content. These are mode guides, not score bands or private input records."}</p><ul className="space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-3 leading-7">{profile.summary[locale]}</p></li>)}</ul></section>
    <section className="my-8 space-y-5" aria-labelledby="typing-faq"><h2 id="typing-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((item, index) => <div key={index}><h3 className="font-semibold">{item.question[locale]}</h3><p className="mt-2 leading-8">{item.answer[locale]}</p></div>)}</section>
    {quiz.references && <section className="my-8" aria-labelledby="typing-references"><h2 id="typing-references" className="text-2xl font-semibold">{zh ? "公式背景与浏览器接口参考" : "Formula context and browser API references"}</h2><ul className="mt-4 space-y-3">{quiz.references.map(reference => <li key={reference.url}><a href={reference.url} className="underline" rel="noopener noreferrer">{reference.title[locale]}</a></li>)}</ul><p className="mt-4 text-sm leading-7 text-slate-600">{zh ? "参考页描述各自公式或浏览器行为，不验证本站题文、训练效果或招聘用途。本站按最终已提交字符和逐位置匹配计数，未采用其他网站准确率或罚分算法。原文和指南均为本版原创。" : "References describe their own formulas or browser behaviour; they do not validate this passage bank, training outcomes or hiring use. FermatMind counts final committed characters and positional matches, without adopting another site’s accuracy or penalty algorithm. Passages and guides are original to this edition."}</p></section>}
    <p className="mt-8 text-sm leading-7 text-slate-600">{zh ? "练习内容版本" : "Practice content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time><br />{zh ? "原文／计分／指南版本" : "Passage / scoring / guide versions"}: {quiz.source.itemBankVersion} / {quiz.source.scoringVersion} / {quiz.source.resultContentVersion}</p>
  </Container></main>;
}
