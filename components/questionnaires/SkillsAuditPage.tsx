import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isSkillsEvidenceConfigurationValid } from "@/lib/questionnaires/skillsEvidence";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireClient } from "./QuestionnaireClient";
import { skillsAuditSections, skillsAuditFaq, skillsAuditSummaries } from "./SkillsAuditLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#skills-audit-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function SkillsAuditPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  if (quiz.slug !== "skills-audit" || !isSkillsEvidenceConfigurationValid(quiz) || !quiz.references) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "20项 · 约6分钟 · 无需注册" : "20 tasks · About 6 minutes · No registration"}</span><span>{zh ? "四类任务 · 四种记录状态 · 全文免费" : "Four task areas · Four record states · Full guides free"}</span></div>
      <QuestionnaireClient quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="skills-audit-purpose"><h2 id="skills-audit-purpose" className="text-2xl font-semibold">{skillsAuditSections[0].title[locale]}</h2>{skillsAuditSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "任务状态怎样记录与清点" : "How task states are recorded and counted"}</h2>{quiz.guide.filter(s => ["scope", "states", "counts"].includes(s.id)).flatMap(s => s.paragraphs).map((p,i) => <p key={i}>{p[locale]}</p>)}</section>
    <section className="explore-reading-library" aria-labelledby="skills-audit-methods"><h2 id="skills-audit-methods">{zh ? "技能盘点：任务主题、实例状态与证据读法" : "Skills audit: task themes, record states and evidence"}</h2><div className="explore-reading-sections">{[...skillsAuditSections.slice(1), ...quiz.guide.filter(s => !["scope", "states", "counts"].includes(s.id)).map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`skills-audit-method-${s.id}`}><h3 id={`skills-audit-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="skills-audit-library"><h2 id="skills-audit-library" className="text-2xl font-semibold">{zh ? "四类任务实例：完整公开指南" : "Four task-example groups: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "四篇指南均可直接阅读全文，包括任务范围、计数算例、虚构实例、证据限制与自选行动。公开指南不含访客私人状态或计数。" : "Read every complete guide for task scope, count examples, fictional events, evidence limits and optional actions. Public guides contain no visitor states or counts."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{skillsAuditSummaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="skills-audit-faq"><h2 id="skills-audit-faq" className="text-2xl font-semibold">{zh ? "技能审计与任务实例盘点常见问题" : "Skills audit and task-example inventory frequently asked questions"}</h2>{[...quiz.faq, ...skillsAuditFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="skills-audit-references"><h2 id="skills-audit-references" className="text-xl font-semibold">{zh ? "技能概念与经验记录资料" : "Skill concepts and experience-recording references"}</h2><ol className="mt-4 space-y-2">{quiz.references.map((ref, i) => <li key={ref.url} id={`skills-audit-reference-${i + 1}`}><a className="underline" href={ref.url} rel="noopener noreferrer">{i + 1}. {ref.title[locale]}</a></li>)}</ol></section>
  </Container></main>;
}
