import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PUBLIC_PATH } from "@/lib/friendship/core";
import type { Locale } from "@/lib/i18n/locales";
import questionnaires from "@/lib/questionnaires/catalog.json";

const selections = [
  {
    slug: "friendship-quiz", path: PUBLIC_PATH,
    title: { zh: "朋友默契：你有多了解我？", en: "How Well Do You Know Me?" },
    description: { zh: "先选出关于你的答案，发给朋友来猜。逐题揭晓，最后看看谁最懂你。", en: "Make a quiz about yourself, send friends your link, and see who knows you best. Every guess gets a reveal." },
    meta: { zh: "30–150题 · 双人及多人", en: "30–150 questions · Play with friends" },
    action: { zh: "创建我的挑战", en: "Make my friendship quiz" },
  },
  ...([
    {
      slug: "what-dog-breed-am-i",
      description: { zh: "金毛、边牧还是哈士奇？从相处和活动偏好，发现你的犬系性格比喻。", en: "Golden retriever, border collie or husky? Find your dog-personality match through everyday companionship and activity choices." },
      action: { zh: "看看我的犬系人格", en: "Find my dog breed match" },
    },
    {
      slug: "mythical-creature",
      description: { zh: "龙、凤凰还是独角兽？用创作与交流中的选择，遇见你的神话生物画像。", en: "Dragon, phoenix or unicorn? Explore your mythical-creature match through creative decisions and the way you connect with others." },
      action: { zh: "寻找我的神话生物", en: "Discover my mythical creature" },
    },
  ]).flatMap(selection => {
    const quiz = questionnaires.find(item => item.slug === selection.slug);
    return quiz ? [{ ...selection, path: `/tests/${quiz.collection}/${quiz.slug}`, title: quiz.title,
      meta: { zh: `${quiz.questionCount}题 · 约${quiz.minutes}分钟`, en: `${quiz.questionCount} questions · About ${quiz.minutes} minutes` } }] : [];
  }),
];

export function HomepageFunTests({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="fm-page-background pb-20 md:pb-24" aria-labelledby="homepage-fun-tests-title">
    <Container className="max-w-[82rem] px-6 md:px-8">
      <div className="border-t border-[var(--fm-border-soft)] pt-12 md:pt-16">
        <h2 id="homepage-fun-tests-title" className="m-0 text-center text-3xl font-semibold text-slate-950 md:text-4xl">{zh ? "热门娱乐测试" : "Popular fun quizzes"}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center leading-7 text-slate-600">{zh ? "和朋友玩一轮，或换个轻松的角度看看自己。完整结果免费，无需注册。" : "A friendship challenge to share, or a playful personality quiz just for you. Full results are free, with no signup."}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {selections.map(item => <Link key={item.slug} prefetch={false} href={`/${locale}${item.path}`} className="group flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-6 text-slate-950 transition-colors hover:border-[#007c9b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#007c9b] motion-reduce:transition-none">
            <p className="m-0 text-sm font-medium text-slate-500">{item.meta[locale]}</p>
            <h3 className="mt-4 text-xl font-semibold leading-snug [overflow-wrap:anywhere]">{item.title[locale]}</h3>
            <p className="mt-4 flex-1 text-base leading-7 text-slate-600">{item.description[locale]}</p>
            <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-[#007c9b]">{item.action[locale]}<span aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none">→</span></span>
          </Link>)}
        </div>
        <p className="mt-6 text-center text-sm leading-6 text-slate-500">{zh ? "编辑精选的轻松玩法，供娱乐与聊天使用。" : "An editorial selection for fun and conversation."} <Link prefetch={false} className="inline-block min-h-11 py-2 text-[#007c9b] underline underline-offset-4" href={`/${locale}/tests#more-tests`}>{zh ? "浏览全部娱乐测试" : "Browse all fun quizzes"} →</Link></p>
      </div>
    </Container>
  </section>;
}
