import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnairePath, questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { RicePurityClient } from "./RicePurityClient";

export function RicePurityPage({ quiz, locale, take = false }: { quiz: Questionnaire; locale: Locale; take?: boolean }) {
  if (take) return <RicePurityClient quiz={quiz} locale={locale} />;
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-stone-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-800">FM EXPERIENCE 100 · v1</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
      <p className="mt-4 leading-7">{quiz.introduction[locale]}</p>
      <p className="mt-4 rounded-xl border border-teal-800/20 bg-teal-50 p-4 leading-7">{quiz.instructions![locale]}</p>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-10 rounded-2xl bg-teal-950 p-7 text-white" aria-label={zh ? "计分示例" : "Scoring example"}>
      <p className="text-sm uppercase tracking-widest">{zh ? "示例，不是你的结果" : "Example, not your result"}</p>
      <p className="my-4 text-5xl font-semibold">100 − 3 = 97</p>
      <p className="leading-7">{zh ? "勾选3项 → 97分；不勾选可以表示未经历或跳过。没有完成率或人群排名。" : "Three checked items → 97. Unchecked may mean not experienced or skipped. There is no completion percentage or population ranking."}</p>
    </section>
    {quiz.guide.map(section => <section key={section.id} className="my-8 space-y-4 leading-8"><h2 className="text-2xl font-semibold">{section.title[locale]}</h2>{section.paragraphs.map((p, i) => <p key={i}>{p[locale]}</p>)}</section>)}
    <Link href={questionnaireGuidePath(locale, quiz.slug, "score-reading")} className="font-semibold underline">{zh ? "打开完整分数读法指南" : "Open the complete score-reading guide"}</Link>
    <section className="my-10 space-y-5"><h2 className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2 leading-8">{f.answer[locale]}</p></div>)}</section>
  </Container></main>;
}
