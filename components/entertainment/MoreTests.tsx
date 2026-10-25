import { Container } from "@/components/layout/Container";
import { directoryQuizzes } from "@/lib/entertainment/directory";
import questionnaires from "@/lib/questionnaires/catalog.json";
import type { Locale } from "@/lib/i18n/locales";

export const FUN_CATEGORIES: Record<string, { en: string; zh: string }> = {
  framework: { en: "Personality frameworks & behavior", zh: "人格框架与行为" },
  nature: { en: "Animals & nature", zh: "动物与自然" },
  fantasy: { en: "Fantasy & stories", zh: "幻想与故事" },
  social: { en: "Friends & teams", zh: "社交与团队" },
  everyday: { en: "Everyday choices", zh: "日常选择" },
  relationships: { en: "Connection & relationships", zh: "相处与关系" },
  metaphor: { en: "Responses & preferences", zh: "行为与偏好" },
};

const catalog = [
  ...questionnaires.map(quiz => ({ ...quiz, minQuestionCount: quiz.questionCount, pathname: `/tests/${quiz.collection}/${quiz.slug}` })),
  ...directoryQuizzes.filter(quiz => !questionnaires.some(native => native.slug === quiz.slug)).map(quiz => ({ ...quiz, pathname: `/tests/play/${quiz.slug}` })),
];

export function MoreTests({ locale }: { locale: Locale }) {
  return <section id="more-tests" aria-labelledby="more-tests-title" className="bg-slate-50 py-12">
    <Container>
      <h2 id="more-tests-title" className="text-3xl font-semibold text-slate-950">{locale === "zh" ? "更多测试" : "More Tests"}</h2>
      <p className="mt-3 max-w-3xl text-slate-600">{locale === "zh" ? "更多自我探索问卷，完整题目与当前版本结果免费，无需注册。每项标明题数和用时，可比较这次选择中的侧重。" : "More questionnaires for self-exploration. All questions and the current edition’s results are free, with no signup. Each entry shows its question count and estimated time."}</p>
      <nav aria-label={locale === "zh" ? "娱乐测试分类" : "Fun quiz categories"} className="my-6 flex flex-wrap gap-3">
        {Object.keys(FUN_CATEGORIES).filter(key => catalog.some(q => q.category === key)).map(key => <a className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm underline underline-offset-4" href={`#fun-${key}`} key={key}>{FUN_CATEGORIES[key][locale]}</a>)}
      </nav>
      {Object.entries(FUN_CATEGORIES).filter(([key]) => catalog.some(q => q.category === key)).map(([key, label]) => <section key={key} id={`fun-${key}`} className="mt-8 scroll-mt-24" aria-labelledby={`fun-heading-${key}`}>
        <h3 id={`fun-heading-${key}`} className="mb-4 text-xl font-semibold">{label[locale]}</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {catalog.filter(q => q.category === key).map(q => <article key={q.slug} className="flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-5">
            <h4 className="text-lg font-semibold leading-snug [overflow-wrap:anywhere]"><a className="underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700" href={`/${locale}${q.pathname}`}>{q.title[locale]}</a></h4>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{q.description[locale]}</p>
            <p className="mt-4 text-sm font-medium">{locale === "zh" ? `${q.minQuestionCount === q.questionCount ? q.questionCount : `${q.minQuestionCount}–${q.questionCount}`} 题 · 约 ${q.minutes} 分钟 · 全部免费` : `${q.minQuestionCount === q.questionCount ? q.questionCount : `${q.minQuestionCount}–${q.questionCount}`} questions · about ${q.minutes} min · fully free`}</p>
          </article>)}
        </div>
      </section>)}
    </Container>
  </section>;
}
