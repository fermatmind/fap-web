import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { CareerMatchClient } from "./CareerMatchClient";

export function CareerMatchPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="career-match-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="career-match-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试 · 更多测试" : "All tests · More Tests"}</Link></nav>
    <p className="text-sm font-semibold text-violet-700">{zh ? "原创兴趣主题比较 · 读取已发布职业资料" : "Original interest-theme comparison · Published career sources"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <p className="mt-3 text-sm text-slate-600">{zh ? "1—6项兴趣主题 · 2—3个真实职业 · 按自己的节奏 · 无需注册" : "1–6 interest themes · 2–3 real occupations · Self-paced · No signup"}</p>
    <p className="mt-5 leading-8">{quiz.introduction[locale]}</p>
    <CareerMatchClient quiz={quiz} locale={locale} />
    <section className="my-10 space-y-8" aria-labelledby="career-match-method"><h2 id="career-match-method" className="text-2xl font-semibold">{zh ? "比较规则与六项主题" : "Comparison rules and six themes"}</h2>{quiz.guide.map(s => <section key={s.id}><h3 className="text-xl font-semibold">{s.title[locale]}</h3>{s.paragraphs.map((p, i) => <p className="mt-3 leading-8" key={i}>{p[locale]}</p>)}</section>)}</section>
    <section className="my-10 space-y-6" aria-labelledby="career-match-faq"><h2 id="career-match-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <div key={i}><h3 className="text-lg font-semibold">{f.question[locale]}</h3><p className="mt-2 leading-8">{f.answer[locale]}</p></div>)}</section>
    <aside className="my-8 space-y-3 border-t pt-6 text-sm leading-7 text-slate-600"><p>{zh ? "本工具的输入步骤与集合比较规则由费马原创；六项宽泛职业兴趣主题可参照下方说明。职业代码与具体解释只从本次读取的已发布职业页取得。这里不使用O*NET题库或其测评计分，亦未验证新的职业适配模型。" : "FermatMind created this input flow and literal set comparison. The broad six-theme vocabulary is explained in the reference below. Occupational codes and their descriptions come only from the published profiles read for this comparison. This tool does not administer or score the O*NET Interest Profiler and has not validated a new job-fit model."}</p>{quiz.references?.map(r => <p key={r.url}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></p>)}</aside>
    <section className="my-8 border-t pt-6"><h2 className="text-xl font-semibold">{zh ? "按需要继续，或在这里结束" : "Continue if useful, or finish here"}</h2><p className="my-3 leading-8">{zh ? "想系统回看兴趣时，可以另外选择已有的RIASEC测试；比较结果不要求先完成它。真实岗位的条件、资格和当地机会仍需单独核对。" : "For a structured review of your interests, you can separately choose the existing RIASEC test. It is not required to see this comparison. Actual role conditions, qualifications and local opportunities still need their own checks."}</p><Link className="inline-block min-h-11 py-2 underline" prefetch={false} href={`/${locale}/tests/holland-career-interest-test-riasec`}>{zh ? "可选：RIASEC职业兴趣测试" : "Optional: RIASEC career interest test"}</Link><br /><Link className="inline-block min-h-11 py-2 underline" prefetch={false} href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link></section>
  </Container></main>;
}
