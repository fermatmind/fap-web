import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { contentImagePath, findPublicPortrait, portraitDescription, portraitRuleExample, quizPath, relatedFunQuizzes, resultPath } from "@/lib/entertainment/guides";
import catalog from "@/lib/entertainment/catalog.json";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";

import QuestionnaireGuide, { generateMetadata as questionnaireMetadata } from "@/components/questionnaires/QuestionnaireGuide";
import nativeCatalog from "@/lib/questionnaires/catalog.json";

const isNative = (slug: string) => nativeCatalog.some(quiz => quiz.slug === slug && quiz.collection === "play");

type Props = { params: Promise<{ locale: string; slug: string; portrait: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: input, slug, portrait } = await params;
  if (isNative(slug)) return questionnaireMetadata({ params: Promise.resolve({ locale: input, slug, profile: portrait }) });
  const locale = resolveLocale(input), quiz = await loadFunQuiz(slug);
  const result = quiz && findPublicPortrait(quiz, portrait);
  if (!quiz || !result) return { title: "Guide unavailable", robots: { index: false, follow: false } };
  return buildPageMetadata({ locale, pathname: resultPath(locale, slug, result.id), title: `${result.title[locale]} · ${quiz.seo.topic[locale]}`, description: portraitDescription(result, locale), imagePath: contentImagePath(quiz, locale, result.id), alternatesByLocale: { en: resultPath("en", slug, result.id), zh: resultPath("zh", slug, result.id), xDefault: resultPath("en", slug, result.id) } });
}

export default async function FunResultGuide({ params }: Props) {
  const { locale: input, slug, portrait } = await params;
  if (isNative(slug)) return QuestionnaireGuide({ params: Promise.resolve({ locale: input, slug, profile: portrait }) });
  const locale = resolveLocale(input), quiz = await loadFunQuiz(slug);
  const result = quiz && findPublicPortrait(quiz, portrait);
  if (!quiz || !result) notFound();
  const zh = locale === "zh", path = resultPath(locale, slug, result.id), entry = quizPath(locale, slug);
  const others = quiz.results.filter(other => other.id !== result.id);
  const examples = portraitRuleExample(quiz, result.id);
  return <main className="bg-slate-50 py-10 text-slate-950"><Container className="max-w-3xl">
    <JsonLd id="fun-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.seo.topic[locale], path: entry }, { name: result.title[locale], path }])} />
    <JsonLd id="fun-guide-page" data={buildWebPageJsonLd({ path, title: result.title[locale], description: portraitDescription(result, locale), locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 flex flex-wrap gap-3 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "更多测试" : "More Tests"}</Link><span aria-hidden="true">/</span><Link prefetch={false} className="underline" href={entry}>{quiz.seo.topic[locale]}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "原创画像 · 完整公开指南" : "Original portrait · Complete public guide"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight [overflow-wrap:anywhere]">{result.title[locale]}</h1>
    <p className="mt-5 leading-8 text-slate-600">{zh ? `这是「${quiz.seo.topic.zh}」的公开画像，不关联任何人的答案或成绩。你可以先了解画像，也可以回到测试作出自己的选择。` : `This is a public portrait from the ${quiz.seo.topic.en}, not a record of anyone’s answers or score. Read it on its own or return to the quiz to make your own choices.`}</p>
    <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 font-semibold text-violet-800 underline" href={`${entry}#play`}>{zh ? "免费体验本测试" : "Try this quiz for free"}</Link>
    <nav aria-label={zh ? "本页内容" : "On this page"} className="my-6 flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm">{[["meaning", zh ? "画像含义" : "Meaning"], ["strength", zh ? "优势与取舍" : "Strength & tradeoff"], ["experiment", zh ? "小行动" : "Try it"], ["comparison", zh ? "与其他画像比较" : "Compare portraits"], ["rules", zh ? "产生规则" : "Choice rules"], ["faq", zh ? "常见问题" : "FAQ"]].map(([id, label]) => <a key={id} className="min-h-11 py-2 underline" href={`#${id}`}>{label}</a>)}</nav>
    <article className="space-y-8 rounded-xl border border-slate-200 bg-white p-5 leading-8 sm:p-8">
      <section id="meaning" className="scroll-mt-24"><h2 className="mb-3 text-2xl font-semibold">{zh ? "这幅画像在说什么？" : "What does this portrait mean?"}</h2><p>{result.summary[locale]}</p></section>
      {([ ["example", zh ? "生活里的一个具体例子" : "A concrete everyday example"], ["strength", zh ? "这种选择带来的好处" : "What this choice can bring"], ["tradeoff", zh ? "也要留意的取舍" : "The tradeoff to notice"], ["experiment", zh ? "一次可选的小尝试" : "One optional small experiment"] ] as const).map(([key, label]) => <section className="scroll-mt-24" id={key} key={key}><h2 className="mb-3 text-2xl font-semibold">{label}</h2><p>{result[key][locale]}</p></section>)}
      <section id="comparison" className="scroll-mt-24"><h2 className="mb-3 text-2xl font-semibold">{zh ? "它与其他画像有什么不同？" : "How does it differ from the other portraits?"}</h2><p>{quiz.focus[locale]}</p><p className="mt-3 text-slate-600">{zh ? "下面按各画像实际描述的贡献作对照，没有哪种更优秀。这不是人与人的适配判断。" : "Compare the actual contribution described by each portrait below. None is superior; this is not a compatibility judgment between people."}</p><dl className="mt-5 space-y-5">{quiz.results.map(other => <div key={other.id}><dt className="font-semibold">{other.id === result.id ? other.title[locale] : <Link prefetch={false} className="inline-block min-h-11 py-2 text-violet-800 underline" href={resultPath(locale, slug, other.id)}>{other.title[locale]}</Link>}</dt><dd className="mt-2 text-slate-700">{other.strength[locale]}</dd></div>)}</dl></section>
      <section id="rules" className="scroll-mt-24"><h2 className="mb-3 text-2xl font-semibold">{zh ? "这项结果怎样产生？" : "How does this result arise?"}</h2><p>{quiz.mechanism === "tally" ? (zh ? "选择为写好的画像累计计数；本次最高计数的画像会呈现，同分会全部保留。下方仅展示规则里的选项例子，单个例子不保证最终结果，也不是你的个人答案。" : "Choices add declared points to authored portraits. Highest totals lead, with all ties retained. The examples below are public rule illustrations: a single choice does not guarantee the final result, and none is your personal answer.") : (zh ? "每个选择沿写好的故事分支前进，相同路线抵达相同结局。下方展开的是一条可到这里的公开示例路线，含故事情节，不是你曾走过的私人记录。" : "Each choice follows an authored branch, and the same route reaches the same ending. The expandable example contains story details from one possible route, not a private record of your own attempt.")}</p><details className="mt-4 rounded-lg bg-slate-50 p-4"><summary className="cursor-pointer font-semibold">{zh ? "查看公开规则示例" : "Read a public rule example"}</summary><ol className="mt-4 list-decimal space-y-4 pl-5">{examples.map((example, index) => <li key={index}><p>{example.question[locale]}</p><p className="mt-1 text-slate-600">{example.choice[locale]}</p></li>)}</ol></details></section>
      <section id="faq" className="scroll-mt-24 space-y-4"><h2 className="text-2xl font-semibold">{zh ? "阅读这份指南时常问" : "Questions about reading this guide"}</h2><h3 className="text-lg font-semibold">{quiz.seo.faq.question[locale]}</h3><p>{quiz.seo.faq.answer[locale]}</p><h3 className="text-lg font-semibold">{zh ? "看到另一幅画像也像自己，怎么办？" : "What if another portrait also sounds like me?"}</h3><p>{quiz.mechanism === "tally" ? (zh ? "可以对照不同情境阅读，计数只是这份题本内的选择。相同最高计数会在完成时一起显示；阅读相邻指南不会为你的作答增加计分。" : "Compare them in different contexts. Totals concern only choices in this questionnaire, and tied leaders appear together on completion. Reading another guide does not add points to your attempt.") : (zh ? "你可以欣赏不止一种结局，但一次作答只会沿自己的路线抵达一个。阅读另一份公开指南不会重写先前路径，也不证明你属于那种人。" : "You can enjoy more than one ending while one attempt follows a particular route to one ending. Reading a different public guide neither rewrites that route nor proves you are a kind of person.")}</p><h3 className="text-lg font-semibold">{zh ? "这能告诉我 MBTI 类型或适合的职业吗？" : "Does this identify my MBTI type or a suitable career?"}</h3><p>{zh ? "不能。这是原创轻娱乐内容，不能换算为人格类型、能力、心理诊断或职业适配。需要另一框架时，可从全部测试中自行了解各测评的用途与题本；不用先接受这幅画像。" : "No. This is original entertainment content, not a conversion into a personality type, ability, diagnosis or career fit. If you want another framework, explore each assessment’s purpose and versions from All Tests; accepting this portrait is not a prerequisite."}</p></section>
    </article>
    <section className="my-8" aria-labelledby="all-portraits"><h2 id="all-portraits" className="text-2xl font-semibold">{zh ? "继续阅读本测试的结果" : "Explore the other results from this quiz"}</h2><ul className="mt-4 space-y-3">{others.map(other => <li key={other.id}><Link prefetch={false} className="inline-block min-h-11 py-2 text-violet-800 underline" href={resultPath(locale, slug, other.id)}>{other.title[locale]}</Link></li>)}</ul><Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#play`}>{zh ? "返回测试，作出自己的选择" : "Return to the quiz and make your own choices"}</Link></section>
    <section className="my-8" aria-labelledby="guide-related"><h2 id="guide-related" className="text-2xl font-semibold">{zh ? "相关趣味探索" : "Related playful explorations"}</h2><ul className="mt-4 space-y-3">{relatedFunQuizzes(catalog, quiz).map(other => <li key={other.slug}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={quizPath(locale, other.slug)}>{other.title[locale]}</Link></li>)}</ul></section>
    <p className="mt-8 text-sm text-slate-600">{zh ? "内容与规则版本" : "Content and rules version"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time></p>
  </Container></main>;
}
