import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PUBLIC_PATH } from "@/lib/friendship/core";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import type { DisplayLocale } from "@/lib/i18n/locales";
import questionnaires from "@/lib/questionnaires/catalog.json";

// Ordered by production completion events for Nov 5–11, 2026 (Asia/Shanghai).
const rankedSlugs = [
  "seven-sins-virtues-test",
  "friendship-quiz",
  "chiikawa",
  "cyberpunk-edgerunners",
  "moral-alignment",
  "attachment-styles",
] as const;

type CardCopy = Record<DisplayLocale, string>;

const descriptions: Record<(typeof rankedSlugs)[number], CardCopy> = {
  "seven-sins-virtues-test": {
    zh: "看看你的七宗罪与七美德各得几分，查看雷达图和七组对照解读。",
    "zh-TW": "看看你的七宗罪與七美德各得幾分，查看雷達圖與七組對照解讀。",
    en: "See how you score on each of the seven sins and virtues, with a radar chart and seven paired guides.",
  },
  "friendship-quiz": {
    zh: "先选出关于你的答案，发给朋友来猜。逐题揭晓，看看谁最懂你。",
    "zh-TW": "先選出關於你的答案，再把連結傳給朋友猜。逐題揭曉，看看誰最懂你。",
    en: "Make a quiz about yourself, send it to your friends, and see who knows you best.",
  },
  chiikawa: {
    zh: "你更像吉伊卡哇、小八还是兔兔？在六位角色中找出最像你的那一位。",
    "zh-TW": "你更像吉伊卡哇、小八還是兔兔？在六位角色中找出最像你的那一位。",
    en: "Are you more like Chiikawa, Hachiware or Usagi? Find your closest match among six characters.",
  },
  "cyberpunk-edgerunners": {
    zh: "你更像大卫、露西还是丽贝卡？在七位动画角色中找出你的匹配结果。",
    "zh-TW": "你更像大衛、露西還是麗貝卡？在七位動畫角色中找出你的配對結果。",
    en: "Are you more like David, Lucy or Rebecca? Find your match among seven characters from the anime.",
  },
  "moral-alignment": {
    zh: "面对情境选择，你更倾向守序还是混乱？看看你在道德阵营九宫格里的位置。",
    "zh-TW": "面對情境選擇，你更傾向守序還是混亂？看看你在道德陣營九宮格裡的位置。",
    en: "How do your choices balance order and chaos, good and evil? Find your place on the nine-alignment grid.",
  },
  "attachment-styles": {
    zh: "回顾一段亲密关系中的担心和退缩，探索你的依恋风格。",
    "zh-TW": "回顧一段親密關係中的擔心和退縮，探索你的依附風格。",
    en: "Reflect on worry and distance in a close relationship and explore your attachment style.",
  },
};

const taiwanTitles: Record<(typeof rankedSlugs)[number], string> = {
  "seven-sins-virtues-test": "七宗罪與七美德測驗",
  "friendship-quiz": "朋友默契：你有多了解我？",
  chiikawa: "吉伊卡哇角色測驗",
  "cyberpunk-edgerunners": "《電馭叛客：邊緣行者》角色測驗",
  "moral-alignment": "道德陣營測驗",
  "attachment-styles": "依附風格測驗",
};

type Selection = {
  slug: (typeof rankedSlugs)[number];
  path: string;
  title: Record<"zh" | "en", string>;
  meta: CardCopy;
};

const selections = rankedSlugs.flatMap<Selection>(slug => {
  if (slug === "friendship-quiz") return [{
    slug, path: PUBLIC_PATH,
    title: { zh: "朋友默契：你有多了解我？", en: "How Well Do You Know Me?" },
    meta: { zh: "30–150题 · 双人及多人", "zh-TW": "30–150 題 · 雙人及多人", en: "30–150 questions · Play with friends" },
  }];
  const quiz = questionnaires.find(item => item.slug === slug);
  return quiz ? [{
    slug, path: `/tests/${quiz.collection}/${quiz.slug}`, title: quiz.title,
    meta: { zh: `${quiz.questionCount}题 · 约${quiz.minutes}分钟`, "zh-TW": `${quiz.questionCount} 題 · 約 ${quiz.minutes} 分鐘`, en: `${quiz.questionCount} questions · About ${quiz.minutes} minutes` },
  }] : [];
});

export function HomepageFunTests({ locale }: { locale: DisplayLocale }) {
  const taiwan = locale === "zh-TW";
  const sourceLocale = taiwan ? "zh" : locale;
  const zh = locale === "zh";
  const action = taiwan ? "開始免費測驗。" : zh ? "开始免费测试。" : "Start the free quiz.";
  const friendshipAction = taiwan ? "建立我的挑戰。" : zh ? "创建我的挑战。" : "Make my friendship quiz.";
  return <section className="fm-page-background pb-10 md:pb-12" aria-labelledby="homepage-fun-tests-title">
    <Container className="max-w-[82rem] px-6 md:px-8">
      <div className="border-t border-[var(--fm-border-soft)] pt-8 md:pt-10">
        <h2 id="homepage-fun-tests-title" className="m-0 text-center text-3xl font-semibold text-slate-950 md:text-4xl">{taiwan ? "熱門娛樂測驗" : zh ? "热门娱乐测试" : "Popular fun quizzes"}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center leading-7 text-slate-600">{taiwan ? "和朋友玩一輪，或換個輕鬆的角度認識自己。完整結果免費，無須註冊。" : zh ? "和朋友玩一轮，或换个轻松的角度看看自己。完整结果免费，无需注册。" : "A friendship challenge to share, or a playful personality quiz just for you. Full results are free, with no signup."}</p>
        <div className="mt-8 grid gap-x-8 gap-y-7 md:grid-cols-2 xl:grid-cols-3">
          {selections.map(item => {
            const href = displayNavigationPath(item.path, locale);
            const fallback = taiwan && href.startsWith("/zh/");
            return (
              <Link
                key={item.slug}
                prefetch={false}
                href={href}
                hrefLang={fallback ? "zh-CN" : undefined}
                className="group block min-w-0 rounded-md bg-white px-5 py-5 text-slate-950 shadow-[0_10px_28px_rgba(15,23,42,0.14)] transition hover:shadow-[0_14px_34px_rgba(15,23,42,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#007c9b] motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
              >
                <h3 className="m-0 text-lg font-semibold leading-6 tracking-normal text-[#007c9b] underline underline-offset-4 transition [overflow-wrap:anywhere] group-hover:text-slate-950">
                  {taiwan ? taiwanTitles[item.slug] : item.title[sourceLocale]}
                </h3>
                <p className="m-0 mt-5 text-base font-normal leading-7 tracking-normal text-slate-700">
                  {descriptions[item.slug][locale]}{" "}
                  <span className="text-[#007c9b] underline underline-offset-4">
                    {item.slug === "friendship-quiz" ? friendshipAction : action}
                    {fallback ? "（簡體中文）" : ""}
                  </span>
                </p>
                <p className="m-0 mt-4 text-sm font-medium text-slate-500">{item.meta[locale]}</p>
              </Link>
            );
          })}
        </div>
        <p className="mt-3 text-center text-sm leading-6 text-slate-500">{taiwan ? "編輯精選的輕鬆玩法，適合娛樂與聊天。" : zh ? "编辑精选的轻松玩法，供娱乐与聊天使用。" : "An editorial selection for fun and conversation."} <Link prefetch={false} className="inline-block min-h-11 py-2 text-[#007c9b] underline underline-offset-4" href={`/${locale}/tests#more-tests`}>{taiwan ? "瀏覽全部娛樂測驗" : zh ? "浏览全部娱乐测试" : "Browse all fun quizzes"} →</Link></p>
      </div>
    </Container>
  </section>;
}
