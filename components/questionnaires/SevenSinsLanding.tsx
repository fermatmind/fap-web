import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreLandingSamples } from "@/components/tests/ExploreLandingSamples";
import { sevenSinsAxisComparison, sevenSinsLandingCopy, sevenSinsResultPatterns } from "@/lib/questionnaires/sevenSinsLandingCopy";
import { TestExploreTemplate } from "@/components/tests/TestExploreTemplate";
import layout from "@/components/tests/test-explore-template.module.css";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { traditionalSevenSins, traditionalSevenSinsEditorial } from "@/lib/i18n/zh-TW/sevenSins";
import { sevenSinsDisplay } from "@/lib/i18n/zh-TW/sevenSinsUi";
import { miniVirtuesDefinitions, scoreMiniVirtuesQuestionnaire } from "@/lib/questionnaires/miniVirtues";
import { questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { SevenSinsPreviewRadar } from "./QuestionnaireSevenSinsOverview";
import { SevenSinsStickyStart } from "./SevenSinsStickyStart";
import styles from "./SevenSinsOverview.module.css";
import { virtuesLandingReferences } from "./VirtuesLandingEditorial";

const text = {
  zh: {
    stylesLink: "先看七组解读",
    benefitsTitle: "答完会看到什么？",
    benefits: [["十四项独立分数","每项依据两道专属题。对应的倾向和美德可以同时得高分。"],["一张红金双轨雷达图","分别浏览两组分布。同分时保留全部并列项。"],["七组情境指南","从抢功、拖延到吵架，各有一组生活场景。"]],

    guideLink: "阅读完整指南", references: "来源与范围",
    exploreTitle: "还想了解什么？", explore: [["更广泛的人格倾向","从五个连续维度回看日常倾向。","查看大五人格"],["情绪与沟通","继续了解情绪觉察、调节和沟通。","查看情商测试"],["更多趣味题本","按主题挑一个想和朋友一起尝试的测评。","浏览测试目录"]],
    compareTitle: "哪项测评适合现在的你？", columns: ["测评工具", "可以探索什么", "题量与用时", "适合什么需求"],
    compare: [["七宗罪与七美德测试", "近四周的 14 项生活倾向与红金雷达图", "28 题 · 快答约 4–5 分钟", "想看看生活里的光暗反差"], ["大五人格测试", "五项连续人格特质", "90 / 120 题 · 约 10–18 分钟", "想了解日常人格倾向"], ["MBTI 性格测试", "四组人格偏好", "93 / 144 题 · 约 12–20 分钟", "想讨论沟通、协作与决策偏好"], ["费马职业测试", "职业兴趣与工作偏好", "94 题 · 约 12–15 分钟", "正在选专业、求职或考虑转行"]],
    faqTitle: "七宗罪与七美德测试常见问题", method: "28 题如何计算十四项得分？", guide: "先看一组完整指南",
  },
  "zh-TW": {
    stylesLink: "先看七組解讀",
    benefitsTitle: "做完會看到哪些結果？",
    benefits: [["十四項分開計分","每一項各有兩道題。對應的傾向和美德可以同時拿到高分。"],["一張紅金雙軌雷達圖","分開查看兩組分布。最高分相同時，會保留所有並列項目。"],["七組情境指南","從搶功、拖延到吵架，每組都有一個熟悉的生活場景。"]],

    guideLink: "閱讀完整指南", references: "來源與適用範圍",
    exploreTitle: "接下來想了解什麼？", explore: [["認識更廣泛的人格特質","從五個連續面向整理日常傾向。","看看大五人格"],["情緒與溝通","進一步了解情緒覺察、調節和溝通。","看看情緒智力測驗"],["再玩一項趣味測驗","找一個想跟朋友一起做的主題。","瀏覽測驗目錄"]],
    compareTitle: "三項測驗各在探索什麼？", columns: ["測驗工具", "可以探索什麼", "題數與時間", "適合什麼需求"],
    compare: [["七宗罪與七美德測驗", "最近四週的 14 項生活傾向與紅金雷達圖", "28 題 · 快答約 4–5 分鐘", "想看看日常的光暗反差"], ["大五人格測驗", "五個連續的人格面向", "90／120 題 · 約 10–18 分鐘", "想了解自己平常的人格傾向"], ["MBTI 性格測驗", "四組性格偏好", "93／144 題 · 約 12–20 分鐘", "想聊聊溝通、合作與決策習慣"], ["費馬職涯測驗", "職涯興趣與工作偏好", "94 題 · 約 12–15 分鐘", "正在選科系、找工作或考慮轉職"]],
    faqTitle: "常見問題", method: "28 題如何算出十四項分數？", guide: "先看一組完整指南",
  },
  en: {
    stylesLink: "Explore the seven pairs",
    benefitsTitle: "What will your result show?",
    benefits: [["Fourteen separate scores","Each score uses two dedicated questions. Both sides of a pair can score high."],["One two-track radar chart","Read the two sets of scores separately. All ties for the highest score are kept."],["Seven reflection guides","See how each pair can show up when someone takes the credit, puts work off, or starts an argument."]],

    guideLink: "Read the full guide", references: "Sources and scope",
    exploreTitle: "What would you like to explore next?", explore: [["Broader personality traits","Look at everyday tendencies across five continuous traits.","Explore the Big Five"],["Emotions and communication","Explore emotional awareness, regulation, and communication.","See the EQ test"],["More quizzes","Find another topic to try with a friend.","Browse all tests"]],
    compareTitle: "Which test fits your question?", columns: ["Test", "What it explores", "Questions and time", "When it helps"],
    compare: [["Seven Sins and Seven Virtues", "14 everyday tendencies and a two-track radar chart", "28 questions · About 4–5 minutes at a quick pace", "Compare how you respond in daily life"], ["Big Five", "Five continuous personality traits", "90 or 120 questions · About 10–18 minutes", "Understand broad personality tendencies"], ["MBTI test", "Four personality preference pairs", "93 or 144 questions · About 12–20 minutes", "Reflect on communication, teamwork, and decisions"], ["Fermat Career Assessment", "Career interests and work preferences", "94 questions · About 12–15 minutes", "Explore study options or a career change"]],
    faqTitle: "Seven Sins and Virtues Test: frequently asked questions", method: "How 28 questions produce fourteen scores", guide: "Read a complete example guide",
  },
} as const;

const followUps = ["/tests/big-five-personality-test-ocean-model", "/tests/eq-test-emotional-intelligence-assessment", "/tests"];
const mbti = "/tests/mbti-personality-test-16-personality-types";
const career = "/career/assessment";
const nextTests = [followUps[0], career, followUps[1], mbti, followUps[0], followUps[1], career];
const nextNames = {
  zh: ["大五人格测试","94 题费马职业测试","情商测试","MBTI 测试"],
  "zh-TW": ["大五人格測驗","94 題費馬職涯測驗","情緒智力測驗","MBTI 測驗"],
  en: ["Big Five test","94-question career assessment","EQ test","MBTI test"],
};
const followUpIndex = [0, 1, 2, 3, 0, 2, 1];
const sampleTracks = [0, 6, 5];
const otherScores = ["2","3","3","4","3","3","3","4","2","4","3","3","3","4","3","3","3","4","4","3","2","4","2","3","3","4","2","3"];
type SevenSinsLandingSource = Pick<Questionnaire, "slug" | "guide" | "references">
  & { questions: ReadonlyArray<Pick<Questionnaire["questions"][number], "id" | "prompt">> };

export function SevenSinsLanding({ quiz, locale }: { quiz: SevenSinsLandingSource; locale: DisplayLocale }) {
  const copy = text[locale];
  const edit = sevenSinsLandingCopy[locale];
  const reading = sevenSinsResultPatterns[locale];
  const traditional = locale === "zh-TW";
  const source = traditional ? traditionalSevenSins : quiz;
  const value = (item: Text & { "zh-TW"?: string }) => traditional ? item["zh-TW"] ?? sevenSinsDisplay(item.zh, locale) : item[locale];
  const path = questionnairePath(locale, quiz.slug);
  const start = traditional ? `${path}/take` : `${path}/take?start=1`;
  const startLabel = { zh: "免费开始测试", "zh-TW": "開始免費測驗", en: "Start the free test" }[locale];
  const samples = sampleTracks.map(track => {
    const answers = Object.fromEntries(source.questions.map((question, index) => [question.id,
      Math.floor(index / 4) === track ? ["5", "4", "4", "5"][index % 4] : otherScores[(index + track) % otherScores.length],
    ]));
    return scoreMiniVirtuesQuestionnaire(source, answers);
  });
  const refs = [...(source.references ?? []), ...(traditional ? traditionalSevenSinsEditorial.virtuesLandingReferences : virtuesLandingReferences)];
  const profiles = miniVirtuesDefinitions.map((pair, index) => {
    const [title, lead, scene, friction] = edit.profiles[index];
    const name = `${value(pair.sin)}${locale === "en" ? " and " : traditional ? "與" : "与"}${value(pair.virtue)}`;
    return { range: name, title, lead, scene, friction, link: { href: `${path}/results/${pair.profileId}`, label: `${copy.guideLink} · ${name}` },
      followUp: { href: displayNavigationPath(nextTests[index], locale), label: nextNames[locale][followUpIndex[index]] } };
  });
  const destinations = followUps.map(link => displayNavigationPath(link, locale));
  const directoryLabel = { zh: "全部测试", "zh-TW": "所有測驗", en: "All tests" }[locale];
  const canonical = new URL(path, SITE_URL).href;
  const comparison = sevenSinsAxisComparison[locale];
  const { itemListElement } = buildBreadcrumbJsonLd([
    { name: "FermatMind", path: `/${locale}` }, { name: directoryLabel, path: `/${locale}/tests` }, { name: edit.title, path },
  ]);
  return <>
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: edit.title, description: edit.description, locale })} />
    <JsonLd id="seven-sins-landing-structured-data" data={{ "@context": "https://schema.org", "@graph": [
      { "@type": "WebApplication", "@id": `${canonical}#app`, url: canonical, name: edit.title, description: edit.facts,
        inLanguage: locale === "zh" ? "zh-CN" : locale, applicationCategory: "EntertainmentApplication",
        isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: { zh: "CNY", "zh-TW": "TWD", en: "USD" }[locale] } },
      { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: edit.faq.map(([name, answer]) => ({
        "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text: answer },
      })) },
      { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumbs`, itemListElement },
    ] }} />
    <TestExploreTemplate copy={{ ...copy, ...edit, start: startLabel, scene: edit.trigger, friction: edit.bright }}
      start={start} guideHref={profiles[0].link.href}
      profilesId="questionnaire-results" profiles={profiles} exploreLinks={destinations} compareLinks={[null, destinations[0], displayNavigationPath(mbti, locale), displayNavigationPath(career, locale)]}
      sample={<ExploreLandingSamples label={edit.sample} names={edit.names}>
        {samples.map((result, index) => <div key={edit.names[index]}>
          <p className="font-semibold">{edit.pairs[index]} · {edit.names[index]}</p>
          <p className="my-2">{edit.hooks[index]}</p>
          {result.status === "complete" && result.model === "dual" && <>
            <SevenSinsPreviewRadar result={result} locale={locale} />
            <dl className={styles.previewMetrics}>
              {(["sin", "virtue"] as const).map((side, i) => {
                const highest = Math.max(...result.miniVirtues.map(row => row[side]));
                const names = miniVirtuesDefinitions.filter((_, axis) => result.miniVirtues[axis][side] === highest).map(pair => value(pair[side]));
                return <div key={side}><dt>{reading.labels[i]}</dt><dd>{names.join(locale === "en" ? ", " : "、")} {Math.round(highest)}</dd></div>;
              })}
              <div><dt>{reading.labels[2]}</dt><dd>{reading.states[index]}</dd></div>
            </dl>
          </>}
        </div>)}
      </ExploreLandingSamples>}
      insight={<><div><h2>{edit.explain}</h2><p>{edit.insight}</p><p className="font-semibold">{edit.formula}</p><h3 className="mt-4">{comparison[0]}</h3><p>{comparison[1]}</p></div>
        <div className="grid gap-3">{edit.example.map(([label, calculation], index) => <article key={label} className="rounded-lg border border-emerald-900/20 bg-white p-4">
          <h3>{label}</h3><p>{value(source.questions[index].prompt)}</p><p>{calculation}</p>
        </article>)}</div></>}
      afterProfiles={<section className={layout.section} aria-labelledby="seven-sins-result-patterns">
        <h2 id="seven-sins-result-patterns">{reading.title}</h2><p className={layout.facts}>{reading.intro}</p>
        <div className={layout.threeColumns}>{reading.cards.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>}
      rules={<><p>{edit.boundary}</p><details id="questionnaire-reading-scope" className="mt-5 scroll-mt-24">
        <summary className="cursor-pointer font-semibold">{edit.details}</summary>
        {source.guide.map(section => <div key={section.id}><h3>{value(section.title)}</h3>
          {section.paragraphs.map(paragraph => <p key={paragraph.en}>{value(paragraph)}</p>)}
        </div>)}
        <h3>{copy.references}</h3><ol className="list-decimal ps-6">{refs.map((ref,index) => <li key={`${ref.url}-${index}`}><a href={ref.url}>{value(ref.title)}</a></li>)}</ol>
      </details></>} />
    <SevenSinsStickyStart title={edit.title} href={start} label={startLabel} />
  </>;
}
