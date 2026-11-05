import type { Locale } from "@/lib/i18n/locales";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import styles from "./PortraitResultLead.module.css";

type Treatment = "field-note" | "botanical" | "companion" | "house" | "character" | "symbol" | "framework";
type Tone = "amber" | "rose" | "mint" | "violet" | "ink" | "blue";
type Emblem = "crescent" | "card" | "spectrum" | "ink";
type Edition = { kind: Treatment; tone?: Tone; layout?: "dossier" | "storybook" | "serial"; emblem?: Emblem; label: Record<Locale, string> };

const editions: Record<string, Edition> = {
  "spirit-animal": { kind: "field-note", label: { zh: "动物比喻 · 本次选择", en: "Animal metaphor · Your choices" } },
  flower: { kind: "botanical", label: { zh: "花朵意象", en: "Flower metaphor" } },
  "what-dog-breed-am-i": { kind: "companion", label: { zh: "犬种比喻 · 互动方式", en: "Dog breed metaphor · Interaction style" } },
  "hogwarts-house-quiz": { kind: "house", label: { zh: "学院主题 · 非官方同人读法", en: "House theme · Unofficial fan reading" } },
  "bojack-horseman-character-quiz": { kind: "character", tone: "amber", layout: "serial", label: { zh: "人物小传 · 叙事与表达", en: "Character portrait · Story and expression" } },
  "hazbin-hotel-character-quiz": { kind: "character", tone: "rose", layout: "storybook", label: { zh: "客栈人物志 · 参加一件事的方式", en: "Hotel guestbook · Ways to take part" } },
  chiikawa: { kind: "character", tone: "mint", layout: "storybook", label: { zh: "小小日常 · 怎样参与和表达", en: "Small everyday moments · Joining in and speaking up" } },
  "disney-princess": { kind: "character", tone: "violet", layout: "storybook", label: { zh: "故事书一页 · 期待与合作", en: "A storybook page · Hopes and cooperation" } },
  "naruto-character": { kind: "character", tone: "amber", layout: "dossier", label: { zh: "忍者人物志 · 行动与伙伴", en: "Shinobi dossier · Action and teammates" } },
  "death-note": { kind: "character", tone: "ink", layout: "dossier", label: { zh: "人物案卷 · 线索与判断", en: "Character casefile · Clues and judgment" } },
  bleach: { kind: "character", tone: "ink", label: { zh: "人物档案 · 责任与选择", en: "Character file · Duty and choices" } },
  "star-wars-character": { kind: "character", tone: "blue", label: { zh: "星际人物档案 · 手头能做什么", en: "Galactic profile · What you can do with what you have" } },
  "hello-kitty": { kind: "character", tone: "rose", label: { zh: "朋友手记 · 小小的相处方式", en: "A friendship note · Everyday ways of relating" } },
  "my-hero-academia-character-quiz": { kind: "character", tone: "amber", label: { zh: "英雄学员档案 · 学习与参加", en: "Hero student file · Learning and taking part" } },
  "my-little-pony-character-quiz": { kind: "character", tone: "violet", label: { zh: "友谊故事 · 你带来的角色", en: "A friendship story · The role you bring" } },
  "nana-character": { kind: "character", tone: "rose", label: { zh: "人物侧写 · 亲近与独立", en: "Character portrait · Closeness and independence" } },
  "south-park": { kind: "character", tone: "mint", label: { zh: "小镇人物 · 群体中的反应", en: "Small-town cast · Reactions in a group" } },
  "gilmore-girls": { kind: "character", tone: "amber", label: { zh: "小镇片段 · 对话与相处", en: "A small-town scene · Conversation and connection" } },
  "jujutsu-kaisen-character": { kind: "character", tone: "ink", label: { zh: "人物档案 · 学习与创作", en: "Character file · Learning and making" } },
  "harry-potter-character": { kind: "character", tone: "violet", label: { zh: "魔法人物志 · 读书与社团", en: "Wizarding character notes · Reading and clubs" } },
  dexter: { kind: "character", tone: "ink", label: { zh: "人物观察 · 纸上谜题", en: "Character notes · Paper puzzles" } },
  "avengers-character": { kind: "character", tone: "blue", label: { zh: "展台档案 · 怎样参与手作展", en: "Display dossier · How you joined the craft show" } },
  "stranger-things": { kind: "character", tone: "ink", label: { zh: "小镇异闻 · 围桌讲故事", en: "Small-town mysteries · Telling stories around the table" } },
  "wednesday-addams-character": { kind: "character", tone: "violet", label: { zh: "学院人物志 · 手作与展示", en: "Academy profiles · Making and displaying" } },
  "game-of-thrones": { kind: "character", tone: "amber", label: { zh: "人物纪事 · 纸上村庄", en: "Character chronicle · A paper village" } },
  "gossip-girl": { kind: "character", tone: "rose", label: { zh: "人物侧写 · 时尚小刊", en: "Character profile · Making a fashion zine" } },
  "blue-lock": { kind: "character", tone: "blue", label: { zh: "桌面战术笔记 · 怎样参与下一步", en: "Tabletop tactics notes · How you joined the next move" } },
  "barbie-character": { kind: "character", tone: "rose", label: { zh: "人物场景 · 重新定义自己的角色", en: "Character scene · Reimagining your role" } },
  "euphoria-character-quiz": { kind: "character", tone: "violet", label: { zh: "人物侧写 · 感受与表达", en: "Character portrait · Feeling and expression" } },
  "cyberpunk-edgerunners": { kind: "character", tone: "blue", label: { zh: "夜之城人物档案 · 日常取舍", en: "Night City dossier · Everyday trade-offs" } },
  "ginny-and-georgia-character-quiz": { kind: "character", tone: "rose", layout: "serial", label: { zh: "角色片段 · 一起创作与活动", en: "Character scene · Creating and taking part together" } },
  "twilight-character": { kind: "character", tone: "ink", layout: "storybook", label: { zh: "暮色故事 · 雨天聚会", en: "Twilight story · A rainy-day gathering" } },
  "amazing-digital-circus": { kind: "character", tone: "violet", layout: "serial", label: { zh: "马戏团角色卡 · 纸板舞台", en: "Circus cast card · A cardboard stage" } },
  "hundred-acre-wood-friend-quiz": { kind: "character", tone: "amber", layout: "storybook", label: { zh: "百亩森林来信 · 纸上野餐和书签", en: "A note from the Hundred Acre Wood · Paper picnics and bookmarks" } },
  "anime-character-archetype-test": { kind: "character", tone: "blue", layout: "serial", label: { zh: "动画分镜 · 故事里的角色位置", en: "Anime storyboard · Your role in the story" } },
  "villain-era-archetype-test": { kind: "character", tone: "ink", layout: "serial", label: { zh: "反派剧场 · 你选的开场方式", en: "Villain theatre · The opening you chose" } },
  "space-marine-chapter": { kind: "character", tone: "ink", layout: "dossier", label: { zh: "战团设定 · 纸模里的侧重点", en: "Chapter dossier · Priorities in paper modelling" } },
  "dungeons-dragons-class": { kind: "character", tone: "amber", layout: "dossier", label: { zh: "队伍角色卡 · 遭遇中的取向", en: "Party role card · Preferences in encounters" } },
  "tsundere-dere-type": { kind: "character", tone: "rose", layout: "serial", label: { zh: "角色表达 · 怎样显露在意", en: "Character expression · How care shows up" } },
  wojak: { kind: "character", tone: "ink", layout: "serial", label: { zh: "网络表情角色 · 当下反应", en: "Meme character · How you responded" } },
  "aesthetic-core-test": { kind: "symbol", tone: "rose", emblem: "spectrum", label: { zh: "风格笔记 · 当下的审美取向", en: "Style notes · Your aesthetic preferences today" } },
  "greek-god": { kind: "symbol", tone: "amber", label: { zh: "神话意象 · 借故事观察选择", en: "Mythic metaphor · Choices through stories" } },
  "aura-color": { kind: "symbol", tone: "violet", label: { zh: "色彩意象 · 此刻的主观体验", en: "Color metaphor · How it feels right now" } },
  "mythical-creature": { kind: "symbol", tone: "mint", label: { zh: "传说图鉴 · 行动与取舍", en: "A field guide to legends · Actions and trade-offs" } },
  "superpower-test": { kind: "symbol", tone: "blue", label: { zh: "超能力设定 · 先改变什么", en: "Superpower notes · What to change first" } },
  "which-tarot-card-are-you": { kind: "symbol", tone: "violet", emblem: "card", label: { zh: "塔罗意象 · 用故事理解当前选择", en: "Tarot metaphor · A story for your current choices" } },
  "what-element-am-i": { kind: "symbol", tone: "mint", label: { zh: "元素意象 · 你的反应方式", en: "Elemental metaphor · Your ways of responding" } },
  "past-life": { kind: "symbol", tone: "amber", label: { zh: "虚构前世 · 这次选择串成的故事", en: "Imagined past life · A story from these choices" } },
  "moon-phase": { kind: "symbol", tone: "ink", emblem: "crescent", label: { zh: "月相意象 · 当下的行动节奏", en: "Moon phase metaphor · Your pace right now" } },
  "next-life": { kind: "symbol", tone: "blue", label: { zh: "来世故事 · 想象中的下一章", en: "Next-life story · An imagined next chapter" } },
  "inkblot-personality-quiz": { kind: "symbol", tone: "ink", emblem: "ink", label: { zh: "墨迹练习 · 你先留意到的线索", en: "Inkblot exercise · Cues you noticed first" } },
  "decade-aesthetic-test": { kind: "symbol", tone: "amber", label: { zh: "年代风格卡 · 细节与氛围", en: "Decade mood card · Details and atmosphere" } },
  "color-season": { kind: "symbol", tone: "rose", emblem: "spectrum", label: { zh: "色彩搭配手记 · 这次选出的线索", en: "Color notes · The cues you selected" } },
  "chinese-zodiac": { kind: "symbol", tone: "amber", label: { zh: "生肖故事 · 借意象理解选择", en: "Zodiac story · Reading choices through imagery" } },
  "zodiac-sign-quiz": { kind: "symbol", tone: "violet", label: { zh: "星座故事 · 题目里的想象角色", en: "Zodiac story · An imagined role from the quiz" } },
  "sake-type": { kind: "symbol", tone: "mint", label: { zh: "酒水意象 · 创作与相聚的线索", en: "Drink metaphors · Cues about making and gathering" } },
  "big-fish-energy-test": { kind: "symbol", tone: "blue", label: { zh: "海洋图鉴 · 你怎样回应周围的动静", en: "Ocean field guide · How you responded to what was around you" } },
  "delulu-test": { kind: "symbol", tone: "rose", label: { zh: "脑内小剧场 · 期待的故事走向", en: "An imagined scene · Where you expected the story to go" } },
  "jungian-archetype": { kind: "framework", tone: "violet", label: { zh: "原型手记 · 重复出现的故事主题", en: "Archetype notes · Recurring story themes" } },
  temperament: { kind: "framework", tone: "blue", label: { zh: "气质观察 · 日常反应节奏", en: "Temperament notes · The pace of everyday reactions" } },
  "leadership-style": { kind: "framework", tone: "mint", label: { zh: "带队情境 · 你的处理方式", en: "Leading a team · How you approached the situations" } },
  socionics: { kind: "framework", tone: "ink", label: { zh: "四组价值观察 · 信息取向线索", en: "Quadra values · Clues about information preferences" } },
  "intelligence-type-test": { kind: "framework", tone: "mint", label: { zh: "任务偏好 · 你选择的处理方式", en: "Task preferences · Approaches you chose" } },
  ikigai: { kind: "framework", tone: "mint", label: { zh: "生之所向 · 什么让日常值得投入", en: "Ikigai reflection · What makes daily life worth engaging in" } },
  "male-archetype-test": { kind: "framework", tone: "ink", label: { zh: "角色意象 · 面对责任的取向", en: "Role metaphor · How you approached responsibility" } },
  "travel-personality-test": { kind: "framework", tone: "blue", label: { zh: "旅行札记 · 你怎样安排一段路", en: "Travel journal · How you shape a trip" } },
  "moral-dilemma-test": { kind: "framework", tone: "amber", label: { zh: "两难情境 · 你的取舍线索", en: "Dilemma notes · Clues about your trade-offs" } },
  "philosopher-personality-test": { kind: "framework", tone: "amber", label: { zh: "哲学阅读札记 · 你从哪里开始问", en: "Philosophy notes · Where you started asking questions" } },
  "inner-child-personality-test": { kind: "framework", tone: "mint", label: { zh: "童心手记 · 现在的玩心怎样出现", en: "Play notes · How playfulness shows up today" } },
  "stupidity-test": { kind: "framework", tone: "amber", label: { zh: "日常乌龙簿 · 一起回顾这类小插曲", en: "Everyday mix-ups · A look at this kind of mishap" } },
  "apocalypse-survival-type-test": { kind: "framework", tone: "ink", label: { zh: "虚构营地日志 · 小组如何行动", en: "Fictional camp log · How the group moves" } },
  "found-family-role-test": { kind: "framework", tone: "rose", label: { zh: "自选家人故事 · 你怎样照应一群人", en: "Found-family notes · How you show up for the group" } },
};

export function portraitResultLeadKind(slug: string): Treatment | undefined {
  return Object.hasOwn(editions, slug) ? editions[slug].kind : undefined;
}

function PetalMark() {
  return <svg className={styles.petal} viewBox="0 0 80 80" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      {[0, 60, 120, 180, 240, 300].map(angle => <ellipse key={angle} cx="40" cy="26" rx="9" ry="14" transform={`rotate(${angle} 40 40)`} />)}
      <circle cx="40" cy="40" r="5" />
    </g>
  </svg>;
}

function SymbolMark({ emblem }: { emblem: Emblem }) {
  return <svg className={styles.petal} viewBox="0 0 80 80" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
    {emblem === "crescent" && <path d="M55 18a24 24 0 1 0 6 37 21 21 0 0 1-6-37Z" />}
    {emblem === "card" && <><rect x="20" y="11" width="40" height="58" rx="5" /><path d="m40 26 11 14-11 14-11-14Z" /></>}
    {emblem === "spectrum" && <><circle cx="29" cy="40" r="14" /><circle cx="51" cy="40" r="14" /><circle cx="40" cy="30" r="14" /></>}
    {emblem === "ink" && <path fill="currentColor" fillOpacity=".15" d="M40 34C27 22 28 14 21 19c-5 4-3 13-8 17-9 9 9 21 19 15 3 11 13 11 16 0 10 6 28-6 19-15-5-4-3-13-8-17-7-5-6 3-19 15Z" />}
  </svg>;
}

export function PortraitResultLead({ kind, quiz, profile, result, locale, titleId }: {
  kind: Treatment;
  quiz: Questionnaire;
  profile: QuestionnaireProfile;
  result: Extract<ArchetypeResult, { status: "complete" }>;
  locale: Locale;
  titleId: string;
}) {
  const direction = quiz.directions.find(item => profile.directionIds.includes(item.id));
  const count = direction ? result.counts[direction.id] : undefined;
  const zh = locale === "zh";
  const edition = editions[quiz.slug];
  const showsHeadline = kind !== "house" && profile.headline[locale] !== profile.title[locale] && profile.headline[locale] !== profile.summary[locale];

  return <header className={styles.lead} data-portrait-lead={kind} data-portrait-key={profile.id} data-portrait-tone={edition.tone} data-portrait-layout={edition.layout} data-portrait-emblem={edition.emblem}>
    <div className={styles.intro}>
      <p className={styles.eyebrow}>{edition.label[locale]}</p>
      <h3 id={titleId} className={styles.title}>{profile.title[locale]}</h3>
      {showsHeadline && <p className={styles.headline}>{profile.headline[locale]}</p>}
      <p className={styles.summary}>{profile.summary[locale]}</p>
    </div>
    {kind === "botanical" ? <PetalMark /> : edition.emblem ? <SymbolMark emblem={edition.emblem} /> : kind !== "symbol" && typeof count === "number" && direction?.comparisons ? <dl className={styles.selection}>
      <div><dt>{zh ? "本次选中" : "Chosen this time"}</dt><dd>{count}<span> / {direction.comparisons}</span></dd></div>
      <div><dt>{zh ? "分母" : "Denominator"}</dt><dd>{zh ? "该选项出现次数" : "Times this option appeared"}</dd></div>
    </dl> : null}
  </header>;
}
