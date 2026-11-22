import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { characterLandingCopy, type CharacterLandingSlug } from "@/lib/questionnaires/characterLandingCopy";
import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import { CharacterLandingSamples } from "@/components/tests/CharacterLandingSamples";
import { ExploreChoicePreview } from "@/components/tests/ExploreLandingSamples";
import { ExploreLandingSchema } from "@/components/tests/ExploreLandingSchema";
import { TestExploreTemplate } from "@/components/tests/TestExploreTemplate";
import layout from "@/components/tests/test-explore-template.module.css";
import { hasStoryRoleLanding, standaloneStoryLandingCopy, storyRoleLandingCopy } from "@/lib/questionnaires/storyRoleLandingCopy";
import { animeStoryRolesLandingFaq, animeStoryRolesLandingSections } from "./AnimeStoryRolesLandingEditorial";
import { spaceMarineChaptersLandingFaq, spaceMarineChaptersLandingSections } from "./SpaceMarineChaptersLandingEditorial";
import { southParkLandingFaq, southParkLandingSections } from "./SouthParkLandingEditorial";
import { bleachLandingCopy, bleachLandingProfile } from "@/lib/questionnaires/bleachLandingCopy";
import { chapterPortraitPath, chapterScope } from "@/lib/questionnaires/spaceMarineChapters";
import { bleachPortraitPath, type BleachId } from "@/lib/questionnaires/bleachPresentation";
import { BleachExamples } from "./BleachExamples";
import { bleachCurrentEntryCopy, bleachExperienceFaq, bleachLandingSummary, bleachVisiblePrivacyAnswer } from "./BleachLandingEditorial";
import { DiscCitations } from "./DiscLandingEditorial";
import { ChiikawaResultExamples } from "./ChiikawaResultExamples";
import { edgerunnersLandingFaq, edgerunnersLandingSections } from "./EdgerunnersLandingEditorial";
import { EdgerunnersResultExamples } from "./EdgerunnersResultExamples";
import { chiikawaLandingSummary } from "./ChiikawaLandingEditorial";

const en = {
  headline: "Unofficial character quiz", start: "Start test", stylesLink: "See the character results", samples: "Preview three fictional matches",
  trust: (n: number, m: number) => `${n} questions · about ${m} minutes · free, no sign-up`,
  benefitsTitle: "What will your result show?",
  benefits: [["All choice counts", "See how many of your responses pointed to each character."], ["Every top match", "Read all character matches that share your highest count."], ["Full public guides", "Read real-life examples and compare approaches before or after the quiz."]],
  sampleQuestion: "Try the first question", vote: (name: string) => `This choice gives one count to ${name}. It does not carry over into the quiz.`,
  method: "How the quiz counts your choices", formula: "One answer = one count for one character. Every highest count is shown.",
  guides: "Character results and public guides", guide: "Read the full character guide", scene: "What this can look like", friction: "",
  reading: "Three ways to read the characters side by side",
  exploreTitle: "Explore an everyday preference",
  explore: [
    ["How you respond to others", "Explore how you recognize and respond to emotions in everyday situations.", "Explore the EQ assessment"],
    ["How you make decisions", "Explore your preferences for taking in information and making decisions.", "Explore the MBTI assessment"],
    ["How your habits vary", "Explore personality traits on a continuum and compare their facets.", "Explore the Big Five assessment"],
  ],
  compareTitle: "Which assessment fits what you want to explore?",
  columns: ["Assessment", "Focus", "Format", "Result"],
  current: ["Everyday choices through fictional characters", "Scenario choices", "Character counts and all top matches"],
  compare: [
    ["EQ assessment", "Responses to emotions", "Self-report or situations", "A profile for the form you choose"],
    ["MBTI assessment", "Everyday personality preferences", "Self-report", "Four preference pairs"],
    ["Big Five assessment", "Continuous personality traits", "Self-report", "Five traits and their facets"],
  ],
  faqTitle: "Frequently asked questions",
  boundary: "Background, sources and more about the quiz",
} as const;

const zh = {
  headline: "同人角色测试", start: "开始测试", stylesLink: "先看角色结果", samples: "切换三个人物示例",
  trust: (n: number, m: number) => `${n} 题 · 约 ${m} 分钟 · 免费免注册`,
  benefitsTitle: "答完会看到什么？",
  benefits: [["全部选择次数", "看看本次有几次选择指向每位角色。"], ["所有最高匹配", "最高次数并列时，每个角色的解释都可以读到。"], ["完整公开指南", "可以先看角色的生活例子，也可以答完再比较相近做法。"]],
  sampleQuestion: "试做第一题", vote: (name: string) => `这个选项为${name}记一次。试做不计入正式答卷。`,
  method: "角色结果怎样算？", formula: "每题选一项，给对应角色记一次。保留所有最高次数的角色。",
  guides: "角色结果与完整指南", guide: "查看完整角色指南", scene: "在生活里会是什么样", friction: "",
  reading: "三组容易混淆的选择",
  exploreTitle: "继续看看日常偏好",
  explore: [
    ["怎样回应别人的情绪", "从日常场景继续探索识别和回应情绪的方式。", "查看情商测试"],
    ["怎样收集信息和做决定", "进一步了解日常沟通与判断中的偏好。", "查看 MBTI 测试"],
    ["习惯会怎样变化", "通过连续维度看常见人格倾向和具体面向。", "查看大五人格测试"],
  ],
  compareTitle: "哪项测评适合现在的你？",
  columns: ["测评", "关注什么", "作答方式", "结果"],
  current: ["借角色看日常做法", "情境选择题", "角色次数与所有最高匹配"],
  compare: [["情商测试", "怎样应对情绪", "自评或情境题", "对应版本的结果"], ["MBTI 测试", "日常人格偏好", "人格自评", "四组偏好"], ["大五人格测试", "连续人格特质", "人格自评", "五项特质及各面向"]],
  faqTitle: "常见问题",
  boundary: "作品来源、解释边界与更多问题",
} as const;

const tw = {
  headline: "同人角色測驗", start: "開始測驗", stylesLink: "先看角色配對", samples: "切換三張角色範例",
  trust: (n: number, m: number) => `${n} 題 · 約 ${m} 分鐘 · 免費免註冊`,
  benefitsTitle: "做完會看到哪些結果？",
  benefits: [["所有選擇次數", "看看有幾次選擇對應到每位角色。"], ["所有最高配對", "最高次數相同時，每位角色的解析都能讀到。"], ["完整公開指南", "可先看角色的生活例子，也能做完再回來比較做法。"]],
  sampleQuestion: "試做第一題", vote: (name: string) => `這個選項替 ${name} 記一次。試做的答案不會帶進正式測驗。`,
  method: "角色配對怎麼算？", formula: "每題選一項，給對應角色記一次。最高次數一樣時，全部保留。",
  guides: "角色配對與完整指南", guide: "閱讀完整角色指南", scene: "日常裡可能怎麼做", friction: "",
  reading: "三組容易看成同一件事的做法",
  exploreTitle: "接著看看自己的日常偏好",
  explore: [
    ["怎麼回應別人的情緒", "從生活情境看看自己怎麼辨認、回應情緒。", "看看情緒智力測驗"],
    ["怎麼整理資訊和下決定", "回想自己平常溝通、判斷或和人合作的習慣。", "看看 MBTI 測驗"],
    ["平常的習慣怎麼變", "用連續分數看五項人格特質和各面向。", "看看大五人格測驗"],
  ],
  compareTitle: "哪項測驗適合現在的你？",
  columns: ["測驗", "想了解的事", "作答方式", "你會看到"],
  current: ["用角色對照平常的做法", "生活情境選擇", "角色次數與所有最高配對"],
  compare: [["情緒智力測驗", "怎麼處理情緒", "自評或情境題", "該版本的結果"], ["MBTI 測驗", "日常人格偏好", "人格自評", "四組偏好"], ["大五人格測驗", "連續人格特質", "人格自評", "五項特質與各面向"]],
  faqTitle: "常見問題",
  boundary: "作品出處、解讀範圍與其他疑問",
} as const;

const ui = { en, zh, "zh-TW": tw };
const storySupplement = {
  "anime-character-archetype-test": { faq: animeStoryRolesLandingFaq, guide: animeStoryRolesLandingSections, highlights: [5, 0, 3, 10, 4, 2] },
  "space-marine-chapter": { faq: spaceMarineChaptersLandingFaq, guide: spaceMarineChaptersLandingSections, highlights: [5, 0, 3, 10, 4, 2] },
  "south-park": { faq: southParkLandingFaq, guide: southParkLandingSections, highlights: [0, 3, 4, 11, 2, 1] },
};
const related = [
  "/tests/eq-test-emotional-intelligence-assessment",
  "/tests/mbti-personality-test-16-personality-types",
  "/tests/big-five-personality-test-ocean-model",
] as const;

type LandingProps = {
  quiz: Questionnaire;
  slug: CharacterLandingSlug;
  locale: DisplayLocale;
  copyTraditional?: (value: string) => string;
};

export function CharacterQuizLanding({ quiz, slug, locale, copyTraditional = text => text }: LandingProps) {
  const story = hasStoryRoleLanding(slug) ? storyRoleLandingCopy[slug] : undefined;
  const supplement = hasStoryRoleLanding(slug) ? storySupplement[slug] : undefined;
  const config = slug === "bleach" ? bleachLandingCopy : hasStoryRoleLanding(slug) ? storyRoleLandingCopy[slug] : characterLandingCopy[slug];
  const edit = config[locale];
  const text = ui[locale];
  const base = locale === "en" ? "en" : "zh";
  const read = (value: Text) => (value as Text & { "zh-TW"?: string })[locale] ?? copyTraditional(value[base]);
  const path = questionnairePath(locale, slug);
  const edge = slug === "cyberpunk-edgerunners";
  const bleach = slug === "bleach";
  const title = read(quiz.title);
  const links = related.map(link => displayNavigationPath(link, locale));
  const chapter = slug === "space-marine-chapter";
  const readMethod = (value: Text) => {
    const text = read(value);
    if (bleach) return bleachCurrentEntryCopy(text, base);
    return story && !chapter ? standaloneStoryLandingCopy(text, locale) : text;
  };
  const profiles = quiz.profiles.map(profile => {
    const sceneCopy = (story?.scenes as Record<string, readonly [string, string, string]> | undefined)?.[profile.id];
    const storyLead = locale === "en" ? `You may lean toward this approach: ${read(profile.headline)}.`
      : `你可能更常選擇這樣做：${read(profile.headline)}。`;
    const [range, profileTitle, lead, scene] = sceneCopy
      ? [read(profile.title), read(profile.headline), locale === "zh" ? `你可能更常这样做：${read(profile.headline)}。` : storyLead,
        sceneCopy[locale === "en" ? 0 : locale === "zh" ? 1 : 2]]
      : "profiles" in edit
      ? (edit.profiles as Record<string, readonly [string, string, string, string]>)[profile.id]
      : bleachLandingProfile(profile.id as BleachId, locale, copyTraditional);
    const src = bleach ? bleachPortraitPath(profile.id)
      : chapter ? chapterPortraitPath(profile.id)! : `/images/quiz-portraits/${slug}/${profile.id}.webp`;
    const index = profile.id === "rebecca" || profile.id === "hachiware" ? 0 : profile.id === "lucy" || profile.id === "momonga" ? 1 : 2;
    return {
      id: profile.id, range, title: profileTitle, lead, scene,
      image: { src, alt: range },
      guideSummary: bleach ? copyTraditional(bleachLandingSummary(profile, base)) : slug === "chiikawa" && locale !== "zh-TW" ? chiikawaLandingSummary(profile, base) : read(profile.summary),
      link: { href: questionnaireGuidePath(locale, slug, profile.id), label: text.guide },
      followUp: { href: links[index], label: text.explore[index][2] },
    };
  });
  const samples = config.samples.map(id => profiles.find(profile => profile.id === id)!);
  const guide = [...quiz.guide, ...(supplement?.guide ?? (edge ? edgerunnersLandingSections : []))];
  const allFaq = [...quiz.faq, ...(supplement?.faq ?? (edge ? edgerunnersLandingFaq : bleach ? bleachExperienceFaq : []))].map(({ question, answer }) => [
    read(question), bleach && question.en === "Are answers uploaded, saved or shared?" ? copyTraditional(bleachVisiblePrivacyAnswer(base)) : read(answer),
  ] as const);
  const faqIndices = edge ? [0, 2, 3, 1, 5, 4] : bleach ? [0, 1, 3, 4, 12, 13] : supplement?.highlights ?? [0, 1, 2, 4, 5, 12];
  const faq = faqIndices.map(index => allFaq[index]);
  const moreFaq = allFaq.filter((_, index) => !faqIndices.includes(index));
  const question = quiz.questions[0];
  const exampleQuiz = locale === "zh-TW" && slug === "chiikawa" ? {
    ...quiz,
    profiles: quiz.profiles.map(profile => ({ ...profile, title: { ...profile.title, zh: read(profile.title) } })),
    directions: quiz.directions.map(direction => ({ ...direction, title: { ...direction.title, zh: read(direction.title) } })),
  } : quiz;

  const resultsLink = edge ? { en: "See the seven possible character results", zh: "先看七种角色结果", "zh-TW": "先看七種角色配對" }[locale] : text.stylesLink;
  const examplesLink = edge ? { en: "See sample results", zh: "先看结果示例", "zh-TW": "先看結果範例" }[locale]
    : bleach ? { en: "See single and tied result examples", zh: "先看单项与并列结果示例", "zh-TW": "先看單項及並列範例" }[locale]
    : { en: "See sample character results", zh: "先看角色结果示例", "zh-TW": "先看角色結果範例" }[locale];
  const headline = slug === "anime-character-archetype-test" ? { en: "An original story-role quiz", zh: "原创故事角色测试", "zh-TW": "原創故事角色測驗" }[locale] : text.headline;
  const endStartLabel = { en: "Take the character quiz", zh: "开始角色测试", "zh-TW": "開始角色測驗" }[locale];
  const referenceScope = { en: "Official series sources establish character context. This independently written fan quiz has no clinical or psychometric interpretation.",
    zh: "官方作品资料用于介绍角色背景。情境与选项由费马独立创作，结果仅供娱乐。",
    "zh-TW": "官方作品資料用於說明人物背景。情境與選項由費馬獨立撰寫，結果供娛樂與閱讀。"}[locale];
  return <>
    <ExploreLandingSchema id={`${slug}-landing-schema`} title={title} description={edit.facts} path={path} locale={locale} faq={faq} />
    <TestExploreTemplate characterSlot
      rootAttributes={{ "data-profile-theme": edge || chapter ? "edgerunners" : bleach ? "bleach" : "chiikawa" }}
      copy={{ ...text, headline, title, description: read(quiz.description), trust: text.trust(quiz.questions.length, quiz.minutes), facts: edit.facts,
        stylesLink: resultsLink, stylesTitle: text.guides, compare: [[title, ...text.current], ...text.compare], faq }}
      start={`${path}/take${locale === "zh-TW" ? "" : "?start=1"}`} guideHref={samples[0].link.href}
      profilesId="questionnaire-results" profiles={profiles} exploreLinks={links} compareLinks={[null, ...links]}
      endStartLabel={endStartLabel}
      sample={<CharacterLandingSamples tone={edge || bleach || chapter ? "night" : "plum"} label={text.samples} profiles={samples} />}
      heroLinks={(!story || locale === "zh-TW") && <nav aria-label={locale === "en" ? "Quiz examples and languages" : locale === "zh" ? "示例与语言" : "範例與語言"} className="mt-3 flex flex-wrap gap-4 text-sm">
        {!story && <a href={edge ? "#edgerunners-examples" : bleach ? "#bleach-examples" : "#chiikawa-examples"}>{examplesLink}</a>}
        {locale === "zh-TW" && <>
          <span aria-current="page">繁體中文</span>
          <Link href={questionnairePath("zh", slug)} lang="zh-CN">简体中文</Link>
          <Link href={questionnairePath("en", slug)} lang="en">English</Link>
        </>}
      </nav>}
      insight={<><div><h2>{text.method}</h2><p data-ent-formula>{text.formula}</p><p>{readMethod(quiz.instructions ?? quiz.introduction)}</p></div>
        <ExploreChoicePreview label={text.sampleQuestion} prompt={read(question.prompt)} options={question.options.map(option => read(option.label))}
          notes={question.options.map(option => text.vote(profiles.find(profile => profile.id === option.directionId)!.range))} /></>}
      afterProfiles={<section className={layout.section}>
        <h2>{text.reading}</h2>
        <div className={layout.detailGrid}>{edit.interpretation.map(([label, body]) => <article key={label} data-ent-interpretation><h3>{label}</h3><p>{body}</p></article>)}</div>
        {edge ? <EdgerunnersResultExamples quiz={quiz} locale={base} displayLocale={locale} copy={copyTraditional} />
          : bleach ? <BleachExamples quiz={quiz} locale={base} copy={copyTraditional} />
          : !story && <ChiikawaResultExamples quiz={exampleQuiz} locale={locale} />}
      </section>}
      rules={<details data-ent-boundary><summary>{text.boundary}</summary>
        {slug !== "anime-character-archetype-test" && <p>{referenceScope}</p>}
        {chapter && <p>{chapterScope[locale]}</p>}
        {guide.map(section => <section key={section.id}><h3>{read(section.title)}</h3>{section.paragraphs.map((paragraph, index) => <p key={index}><DiscCitations text={readMethod(paragraph)} locale={base} referencePrefix={slug} /></p>)}</section>)}
        <ul>{quiz.references?.map((reference, index) => !reference.hiddenOnLanding && <li key={reference.url} id={`${slug}-reference-${index + 1}`}>
          <a href={reference.url}>{read(reference.title)}</a>
        </li>)}</ul>
        {moreFaq.map(([label, answer]) => <section key={label}><h3>{label}</h3><p>{answer}</p></section>)}
      </details>} />
  </>;
}
