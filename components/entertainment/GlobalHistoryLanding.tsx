import { GlobalHistoryAtlasLinks } from "./GlobalHistoryAtlasLinks";
import Link from "next/link";
import { ExploreLandingSchema } from "@/components/tests/ExploreLandingSchema";
import { CharacterLandingSamples } from "@/components/tests/CharacterLandingSamples";
import { ExploreChoicePreview } from "@/components/tests/ExploreLandingSamples";
import { TestExploreTemplate } from "@/components/tests/TestExploreTemplate";
import layout from "@/components/tests/test-explore-template.module.css";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import type { DisplayLocale } from "@/lib/i18n/locales";
import type { Copy } from "@/lib/entertainment/types";
import {
  GLOBAL_HISTORY_MINUTES, globalHistoryMethod,
  globalHistoryPath, globalHistoryPortraitPath, globalHistoryResultPath,
} from "@/lib/entertainment/global-history/config";
import { historyLandingCopy } from "@/lib/entertainment/global-history/landing-copy";
import { getCoxEstimate, getHistoryResult } from "@/lib/entertainment/global-history/result-v2";
import { displayHistoryPerson } from "@/lib/entertainment/global-history/traditional-roster";
import { findHistoryPerson, historyPeople } from "@/lib/entertainment/global-history/people";
import { historyAxes, historyScenes } from "@/lib/entertainment/global-history/questions";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import { GlobalHistoryLocaleLinks } from "./GlobalHistoryLocaleLinks";

const figureIds = ["isaac-newton", "li-bai", "mansa-musa"] as const;
const count = historyPeople.length;
const scenes = historyScenes.length;
const estimateCount = historyPeople.filter(person => getCoxEstimate(person.id)).length;
const minutes = GLOBAL_HISTORY_MINUTES;
const scenesByPerson = {
  "isaac-newton": { zh: "两张表对不上，你先把原始记录摊开，找到第一处差异。", "zh-TW": "兩張表對不起來，你先攤開原始紀錄，找出第一個差異。", en: "When two tables disagree, you pull up the original records and find the first mismatch." },
  "li-bai": { zh: "朋友写不出活动开场白，你从刚才路过的月台借来一句有画面的话。", "zh-TW": "朋友卡在活動開場白，你從剛才經過的月臺借來一句有畫面的話。", en: "When a friend gets stuck on an event introduction, you borrow an image from the train platform you just passed." },
  "mansa-musa": { zh: "几个小组各有物资却接不上进度，你先约定谁交给谁、何时交。", "zh-TW": "幾組人都有物資，進度卻接不上，你先約好交接的對象和時間。", en: "When teams have supplies but keep missing each other, you settle who hands over what and when." },
} as const;

const localized = {
  zh: {
    readingTitle: "从三个原型读懂你的匹配", assessment: "继续探索人格偏好", boundaryLabel: "来源、版本与解释边界",
    extraFaq: [["测试结果怎样匹配？", "六个做事方向合在一起，找出与本次选择距离最近的人物。"], ["Cox 估值和传记 MBTI 是什么？", "它们是历史人物的背景资料。Cox 根据早年传记回推，传记 MBTI 是编辑解读。"], ["测验免费吗？", "免费免注册，完整结果和 PNG 人物卡都可以直接获取。"]], extraCompare: ["大五人格测试", "连续人格特质", "人格自评", "五项特质及各面向"],
    headline: "互动故事 · 全球卷", start: "开始测试", stylesLink: "先看人物示例",
    trust: `${scenes}题 · 约${minutes - 1}-${minutes}分钟 · 无付费墙 · 免注册`,
    benefitsTitle: "答完会看到什么？",
    benefits: [["一位历史人物","阅读人物经历，以及你的选择在哪些地方与这份人物画像相近。"],["六种做事偏好","看看自己更倾向先准备还是边做边调整、独立处理还是先召集团队。"],["一张可保存的插画人物卡","答完后可保存 PNG 人物卡，和朋友交换各自的结果。"]],
    insight: "开馆前，你会先做什么？", scene: "日常场景", friction: "",
    readingBody: "先看哪些选择和人物故事有共鸣，再看看哪些地方不一样。同一个人在不同场合可能有不同做法，换几道题的选择也可能换一个结果。",
    exploreTitle: "还想探索什么？",
    explore: [["继续玩长安卷","换到盛唐长安，做另一组情境选择。","开始长安卷"],["了解日常人格偏好","对照沟通、学习和做决定时的常见偏好。","查看 MBTI 测试"],["浏览互动故事","按主题找下一个想体验的故事。","返回互动故事"]],
    compareTitle: "哪项测评适合现在的你？", columns: ["测评","主题","作答方式","结果"],
    compare: [["全球历史人物·全球卷","展馆里的做事方式","12 次情境选择","一位历史人物与六个做事偏好"],["历史人物·长安卷","盛唐背景下的抉择","故事情境","长安人物匹配"],["MBTI 测试","日常人格偏好","人格自评","四组偏好"]],
    faqTitle: "全球历史人物测试常见问题",
    faq: [["需要懂历史吗？","题目已经交代情境，按自己平时的反应选即可。"],["全球卷有哪些人物？",`共 ${count} 位，来自不同时代、地区和领域。页面上的示例可直接阅读。`],["可以分享结果吗？","交卷后可以保存插画人物卡，也可以分享独立人物指南。"]],
    method: "选择怎样匹配到人物？", formula: "12 次选择 → 六个做事方向 → 匹配整体最接近的人物画像", guide: "打开一份人物指南",
  },
  "zh-TW": {
    readingTitle: "從三種原型讀懂你的配對", assessment: "進一步探索人格偏好", boundaryLabel: "來源、版本與解讀範圍",
    extraFaq: [["測驗結果怎麼配對？", "把六個做事面向放在一起，找出最接近這次選擇的人物。"], ["Cox 估值和傳記 MBTI 是什麼？", "兩者都是歷史人物的背景資料。Cox 依早年傳記回推，傳記 MBTI 則是編輯詮釋。"], ["測驗免費嗎？", "免費、免註冊，做完可直接看完整結果並儲存 PNG 圖卡。"]], extraCompare: ["大五人格測驗", "連續人格特質", "人格自評", "五項特質與各面向"],
    headline: "互動故事 · 全球篇", start: "開始測驗", stylesLink: "先看人物範例",
    trust: `${scenes} 題 · 約 ${minutes - 1}–${minutes} 分鐘 · 無付費牆 · 免註冊`,
    benefitsTitle: "做完會看到哪些結果？",
    benefits: [["一位歷史人物","閱讀人物經歷，看看你的選擇和這份人物側寫有哪些相似之處。"],["六種做事偏好","想想你習慣先備妥再動手，還是邊做邊調整；遇到事情會先自己處理，還是揪大家一起想辦法。"],["可儲存的社群分享圖卡","做完可儲存 PNG 人物圖卡，和朋友交換彼此的結果。"]],
    insight: "展館開門前，你會先做什麼？", scene: "日常情境", friction: "",
    readingBody: "先看看哪些選擇和人物故事有共鳴，再看看哪些地方不同。同一個人遇到不同場合也會換做法，改幾個答案就可能配對到另一位人物。",
    exploreTitle: "接下來想探索什麼？",
    explore: [["玩玩長安篇","換到盛唐長安，試試另一組故事情境。","前往長安篇（簡體中文）"],["認識日常人格偏好","回想你在溝通、學習和做決定時的習慣。","看看 MBTI 測驗"],["瀏覽互動故事","找一個有興趣的主題繼續玩。","返回互動故事"]],
    compareTitle: "哪項測驗適合現在的你？", columns: ["測驗","主題","作答方式","結果"],
    compare: [["全球歷史人物·全球篇","展館裡的做事方式","12 道情境題","一位歷史人物與六個做事偏好"],["歷史人物·長安篇","盛唐背景下的抉擇","故事情境","長安人物配對"],["MBTI 測驗","日常人格偏好","人格自評","四組偏好"]],
    faqTitle: "全球歷史人物測驗常見問題",
    faq: [["需要懂歷史嗎？","題目已交代情境，照自己平常的反應選就可以。"],["全球篇有哪些人物？",`共有 ${count} 位人物，涵蓋不同時代、地區與領域。頁面上的人物範例可以直接閱讀。`],["結果可以分享嗎？","做完後可儲存插畫人物圖卡，也能分享公開人物指南。"]],
    method: "答案怎麼配對到人物？", formula: "12 道情境題 → 六個做事面向 → 配對到整體最接近的人物側寫", guide: "開啟一份人物指南",
  },
  en: {
    readingTitle: "Three ways to read your match", assessment: "Explore your personality preferences", boundaryLabel: "Sources, versions and interpretation",
    extraFaq: [["How does the quiz select a match?", "It compares your six scenario preferences with the profiles and returns the closest overall match."], ["What are the Cox estimate and biographical MBTI?", "They are background on the figure. Cox estimated from early biographies, and the MBTI label is an editorial interpretation."], ["Is the quiz free?", "Yes. The full match and PNG portrait are available without payment or an account."]], extraCompare: ["Big Five personality test", "Continuous personality traits", "Personality self-report", "Five traits and their facets"],
    headline: "Interactive story · World Edition", start: "Start quiz", stylesLink: "See sample matches",
    trust: `${scenes} scenarios · About ${minutes - 1}–${minutes} minutes · Free, no paywall or sign-up`,
    benefitsTitle: "What will your result show?",
    benefits: [["One historical figure","Read about their life and see which of your choices echo their story."],["Six ways you approach a task","See when you prepare or improvise, and when you work solo or bring other people in."],["An illustrated card to keep","Save your portrait as a PNG and compare matches with friends."]],
    insight: "What would you do before the doors open?", scene: "In everyday life", friction: "",
    readingBody: "Look for a choice you recognize in the figure’s story, then for a place where you would take a different approach. A few different answers can lead to another match.",
    exploreTitle: "What would you like to explore next?",
    explore: [["Try the Chang’an Edition","Make a fresh set of choices in Tang-era Chang’an.","Play the Chang’an Edition"],["Explore everyday personality preferences","Reflect on how you communicate, learn, and make decisions.","See the MBTI test"],["Browse interactive stories","Find another story that you would like to try.","Back to interactive stories"]],
    compareTitle: "Which quiz fits your interest?", columns: ["Quiz","Setting or focus","Format","Result"],
    compare: [["Historical Figures: World Edition","Choices at a history exhibition","12 scenarios","A historical figure and six preferences"],["Historical Figures: Chang’an Edition","Choices in Tang-era Chang’an","Interactive story","A Chang’an figure match"],["MBTI test","Everyday personality preferences","Personality self-report","Four preference pairs"]],
    faqTitle: "Historical Figures Quiz: frequently asked questions",
    faq: [["Do I need to know history?","Each question sets the scene. Pick what you would naturally do."],["Who can I match with?",`The World Edition includes ${count} figures across periods, regions, and fields. You can read the sample guides before taking the quiz.`],["Can I share the result?","You can save the illustrated card after finishing the quiz or share the public figure guide."]],
    method: "How does the quiz pick a match?", formula: "12 choices → six preferences → closest overall figure profile", guide: "Open a public figure guide",
  },
} as const;

export async function GlobalHistoryLanding({ locale }: { locale: DisplayLocale }) {
  const traditional = locale === "zh-TW";
  const base = traditional ? "zh" : locale;
  const convert = traditional ? await loadTraditionalAssessmentText() : (text: string) => text;
  const value = (copy: Copy) => convert(copy[base]);
  const copy = localized[locale];
  const edit = historyLandingCopy[locale];
  const path = globalHistoryPath(locale);
  const mbtiPath = displayNavigationPath("/tests/mbti-personality-test-16-personality-types", locale);
  const bigFivePath = displayNavigationPath("/tests/big-five-personality-test-ocean-model", locale);
  const faq = [...copy.faq, ...copy.extraFaq];
  const profiles = figureIds.flatMap(id => {
    const original = findHistoryPerson(id);
    if (!original) return [];
    const person = displayHistoryPerson(original, locale);
    const result = getHistoryResult(original);
    if (!result) return [];
    const name = person.name[base];
    const benchmark = result.iq_benchmark;
    const badges = [
      benchmark.has_cox_data ? `${edit.cox} ${benchmark.estimate.youth_corrected}` : `${edit.gift} · ${benchmark.cognitive_gift_tag[locale]}`,
      `${edit.mbti} · ${result.personality_benchmark.inferred_mbti}`,
    ];
    return [{
      id, range: name, scene: scenesByPerson[id][locale], title: result.archetype_title[locale], lead: result.one_line_hook[locale], badges,
      image: { src: globalHistoryPortraitPath(id), alt: name },
      link: { href: globalHistoryResultPath(locale, id), label: edit.browse },
      followUp: { href: mbtiPath, label: copy.assessment },
    }];
  });
  const links = [
    displayNavigationPath("/tests/explore/changan-history-quiz", locale),
    mbtiPath,
    `/${locale}/tests#interactive-stories`,
  ];
  const title = edit.title(count);
  const [mainTitle, headlineQuestion] = title.split(locale === "zh" ? "（全球卷）：" : "（全球篇）：");
  return <>
    <ExploreLandingSchema id="global-history-landing-schema" title={title} description={edit.facts(count, estimateCount)} path={path} locale={locale} faq={faq} />
    <TestExploreTemplate characterSlot rootAttributes={{ "data-profile-theme": "history" }} copy={{ ...copy, faq, compare: [...copy.compare, copy.extraCompare], title, description: edit.description(count),
      facts: edit.facts(count, estimateCount), stylesTitle: edit.stylesTitle }}
      heading={headlineQuestion && <><span>{mainTitle}{locale === "zh" ? "（全球卷）" : "（全球篇）"}</span>{" "}<span>{headlineQuestion}</span></>}
      start={`${path}/take`} guideHref={profiles[0].link.href}
      profilesId="history-figures" profiles={profiles} exploreLinks={links} compareLinks={[null, ...links.slice(0, 2), bigFivePath]}
      sample={<CharacterLandingSamples label={edit.sample} profiles={profiles} />}
      insight={<><div><h2>{copy.insight}</h2><p>{copy.readingBody}</p>
        <p><a href="#history-directory-list">{edit.directory(count)} ↓</a></p>
      </div><ExploreChoicePreview label={edit.try} prompt={value(historyScenes[0].prompt)}
        options={historyScenes[0].options.map(option => convert(option[base === "en" ? 2 : 1]))} notes={edit.notes} /></>}
      methodSupplement={<section className={layout.section} aria-labelledby="history-axes">
          <h2 id="history-axes">{edit.axes}</h2>
          <div className={layout.detailGrid}>{historyAxes.map((axis, index) => <article key={axis.en}>
            <h3>{value(axis)}</h3><p className={layout.axisEnds}><span>{edit.ends[index][0]}</span><span aria-hidden>↔</span><span>{edit.ends[index][1]}</span></p><p>{edit.axisNotes[index]}</p>
          </article>)}</div>
        </section>}
      afterProfiles={<>
        <section className={layout.section}>
          <h2>{copy.readingTitle}</h2>
          <div className={layout.detailGrid}>{edit.readingPaths.map(([title, body]) => <article key={title} data-ent-interpretation>
            <h3>{title}</h3><p>{body}</p>
          </article>)}</div>
        </section>
        <section id="history-directory" className={layout.section}>
          <GlobalHistoryAtlasLinks locale={locale} />
          <details className="rounded-lg border border-emerald-900/20 p-4"><summary className="cursor-pointer font-semibold">{edit.directory(count)}</summary>
            <ul id="history-directory-list" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {historyPeople.map(person => <li key={person.id}>
                <Link href={globalHistoryResultPath(locale, person.id)} prefetch={false}>{displayHistoryPerson(person, locale).name[base]}</Link>
              </li>)}
            </ul>
          </details>
        </section>
      </>}
      rules={<><p>{value(globalHistoryMethod)}</p><details data-ent-boundary><summary>{copy.boundaryLabel}</summary><p>{edit.boundary}</p></details>{traditional && <GlobalHistoryLocaleLinks />}</>} />
  </>;
}
