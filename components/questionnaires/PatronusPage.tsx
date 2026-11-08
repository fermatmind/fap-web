import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { FantasyRoster } from "./FantasyRoster";
import { PatronusClient } from "./PatronusClient";

export function PatronusPage({ quiz, locale, take = false }: { quiz: Questionnaire; locale: Locale; take?: boolean }) {
  if (take) return <PatronusClient quiz={quiz} locale={locale} />;
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-900">{zh ? "原创守护意象 · 独立粉丝娱乐创作" : "Original guardian images · Independent fan creation"}</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.introduction[locale]}</p>
      <div className="my-5 flex flex-wrap gap-3 text-sm font-semibold"><span>{zh ? "20屏混合玩法" : "20 mixed screens"}</span><span>{zh ? "40种可达画像" : "40 reachable portraits"}</span><span>{zh ? "全部结果与图片免费" : "All results and images free"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <FantasyRoster quiz={quiz} locale={locale} />
    {quiz.guide.map(s => <section key={s.id} className="my-8 space-y-4 leading-8"><h2 className="text-2xl font-semibold">{s.title[locale]}</h2>{s.paragraphs.map((p, i) => <p key={i}>{p[locale]}</p>)}</section>)}
    <section className="my-10 space-y-5"><h2 className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2 leading-8">{f.answer[locale]}</p></div>)}</section>
    <Link className="inline-flex min-h-11 items-center underline" href={`/${locale}/tests`}>{zh ? "返回全部测试" : "All tests"}</Link>
  </Container></main>;
}
