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
  { slug: "friendship-quiz", category: "social", title: { en: "How Well Do You Know Me?", zh: "朋友默契：你有多了解我？" }, description: { en: "Make a two-choice quiz about yourself. Invite friends to guess, compare categories and share a score card. No sign-up.", zh: "自己出题，朋友来猜。六类二选一，查看类别对照、并列榜单与分数卡，无需注册。" }, minQuestionCount: 30, questionCount: 150, minutes: "5–25", pathname: "/tests/play/friendship-quiz" },
  ...questionnaires.map(quiz => ({ ...quiz, minQuestionCount: quiz.questionCount, pathname: `/tests/${quiz.collection}/${quiz.slug}` })),
  ...directoryQuizzes.filter(quiz => !questionnaires.some(native => native.slug === quiz.slug)).map(quiz => ({ ...quiz, pathname: `/tests/play/${quiz.slug}` })),
];

export function MoreTests({ locale }: { locale: Locale }) {
  return <section id="more-tests" aria-labelledby="more-tests-title" className="bg-slate-50 py-12">
    <Container>
      <h2 id="more-tests-title" className="text-3xl font-semibold text-slate-950">{locale === "zh" ? "更多测试" : "More Tests"}</h2>
      <p className="mt-3 max-w-3xl text-slate-600">{locale === "zh" ? "更多自我探索测试与工具，完整题目、运算与当前版本结果免费，无需注册。问卷标明题数和用时，工具标明输入或计算方式。" : "More tests and tools for self-exploration. All questions, calculations and current results are free, with no signup. Questionnaires show question counts and time; tools describe their input or calculation modes."}</p>
      <nav aria-label={locale === "zh" ? "娱乐测试分类" : "Fun quiz categories"} className="my-6 flex flex-wrap gap-3">
        {Object.keys(FUN_CATEGORIES).filter(key => catalog.some(q => q.category === key)).map(key => <a className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm underline underline-offset-4" href={`#fun-${key}`} key={key}>{FUN_CATEGORIES[key][locale]}</a>)}
      </nav>
      {Object.entries(FUN_CATEGORIES).filter(([key]) => catalog.some(q => q.category === key)).map(([key, label]) => <section key={key} id={`fun-${key}`} className="mt-8 scroll-mt-24" aria-labelledby={`fun-heading-${key}`}>
        <h3 id={`fun-heading-${key}`} className="mb-4 text-xl font-semibold">{label[locale]}</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {catalog.filter(q => q.category === key).map(q => <article key={q.slug} className="flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-5">
            <h4 className="text-lg font-semibold leading-snug [overflow-wrap:anywhere]"><a className="underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700" href={`/${locale}${q.pathname}`}>{q.title[locale]}</a></h4>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{q.description[locale]}</p>
            <p className="mt-4 text-sm font-medium">{q.slug === "career-match" ? (locale === "zh" ? "兴趣主题＋2—3个职业 · 免费比较" : "Interest themes + 2–3 roles · Free comparison") : q.slug === "natal-chart" ? (locale === "zh" ? "已知时间与地点 · 十天体星盘 · 全部免费" : "Known time and place · Ten-body chart · fully free") : q.slug === "nine-star-ki" ? (locale === "zh" ? "年份与立春界点 · 九篇完整文化指南 · 全部免费" : "Year & Spring boundary · Nine complete cultural guides · fully free") : q.slug === "life-path-number" ? (locale === "zh" ? "两种日期规则 · 十二篇完整指南 · 全部免费" : "Two date rules · Twelve complete guides · fully free") : q.slug === "data-entry" ? (locale === "zh" ? "2种虚构记录模式 · 每轮60秒 · 全部免费" : "2 fictional record modes · 60 seconds per round · fully free") : q.slug === "typing-speed" ? (locale === "zh" ? "英/中文两种输入模式 · 每轮60秒 · 全部免费" : "English & Chinese modes · 60 seconds per round · fully free") : q.slug === "ten-key-test" ? (locale === "zh" ? "3种输入模式 · 每轮60秒 · 全部免费" : "3 entry modes · 60 seconds per round · fully free") : locale === "zh" ? `${q.minQuestionCount === q.questionCount ? q.questionCount : `${q.minQuestionCount}–${q.questionCount}`} 题 · 约 ${q.minutes} 分钟 · 全部免费` : `${q.minQuestionCount === q.questionCount ? q.questionCount : `${q.minQuestionCount}–${q.questionCount}`} questions · about ${q.minutes} min · fully free`}</p>
          </article>)}
        </div>
      </section>)}
    </Container>
  </section>;
}
