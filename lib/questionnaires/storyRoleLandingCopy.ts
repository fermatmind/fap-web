import type { DisplayLocale } from "@/lib/i18n/locales";

type Local = {
  facts: string;
  interpretation: readonly (readonly [string, string])[];
};
type Definition = Record<DisplayLocale, Local> & {
  samples: readonly [string, string, string];
  scenes: Record<string, readonly [en: string, zh: string, tw: string]>;
};

export const storyRoleLandingCopy = {
  "anime-character-archetype-test": {
    samples: ["lead", "challenger", "improviser"],
    scenes: {
      lead: ["At a storyboard table, you offer to sketch the first agreed panel so others can respond.", "画分镜时，你先接下大家都同意的第一格，画完让同伴接着讨论。", "畫分鏡時，你先接手大家都同意的第一格，再拿給夥伴看。"],
      challenger: ["When a scene only has one ending, you offer a second version the group can compare.", "故事只剩一种结尾时，你写出第二版，让大家并排比较。", "故事只剩一種結局時，你寫出第二版，讓大家對照看看。"],
      pathfinder: ["When a character's route becomes confusing, you sketch the connections on a scrap of paper.", "人物走过的路线有点乱，你在纸上画出几处地点之间的关系。", "人物走過的路線有點亂，你在紙上畫出幾處地點之間的關係。"],
      guide: ["When a friend asks how to light a scene, you offer one example they can use or set aside.", "朋友问怎样画光线时，你示范一种方法，让对方选用或略过。", "朋友問光線怎麼畫，你示範一種做法，讓他自己決定要不要用。"],
      improviser: ["The planned prop is missing, so you invite the group to try a folded paper substitute.", "原定的道具找不到，你邀请大家先用折纸试一个能替代的形状。", "原本的道具找不到，你問大家要不要用摺紙先試出一個形狀。"],
      keeper: ["When a shared deadline changes, you check which promise still suits everyone.", "共同交稿时间变了，你先确认大家愿意继续守哪项约定。", "共同交稿的時間變了，你先確認大家還願意遵守哪項約定。"],
    },
    en: {
      facts: "FermatMind’s free Anime Character Archetype Quiz presents 18 choices in an original illustrated story. It tracks how players begin, challenge, connect, explain, improvise or keep an agreement, and assigns each choice to one of six fictional story roles. The quiz takes about five minutes, requires no account and keeps every role tied for the highest count. All six guides can be read before playing.",
      interpretation: [["Start or offer an alternative", "Give the group something to react to, or lay out a second option they can compare with the first."], ["Map a connection or show an example", "A quick diagram helps when the whole route is unclear. A small example can help when someone asks about one step."], ["Improvise or renew an agreement", "Try a replaceable prop when materials change. If the group needs to change an agreement, check what everyone is still willing to do."]],
    },
    zh: {
      facts: "费马测试的动漫角色原型测试用18道原创故事情境，对照启程、挑战、引路等六种叙事贡献。每题为一类角色记一次，保留最高并列。约5分钟，结果和六份指南免费。",
      interpretation: [["先开始，还是提出另一个方案", "给大家一个可以继续的小开端，或写出能和现有版本对照的第二种结局。"], ["画清关系，还是示范一步", "整体路线让人迷糊时先画图。如果别人只问一个步骤，先给一个能用也能跳过的例子。"], ["临场试做，还是重新确认约定", "材料不够时可以用替代物试做。时间或协作条件变了，先问清大家还愿意守哪项约定。"]],
    },
    "zh-TW": {
      facts: "費馬測試的動漫角色原型測驗有18道原創故事情境，對照出發、挑戰、引路等六種故事分工。每題替一類角色記一次，最高次數相同會全數保留。約5分鐘，結果與指南免費。",
      interpretation: [["先做一小步，或提出另一個方案", "先做出大家能接著討論的一小步，或寫一個可以和原版對照的結尾。"], ["畫清楚關係，或示範一步", "整條路看不懂時先畫圖。對方只問其中一步時，可以先拿一個小例子。"], ["臨場試做，或重新說好", "材料不足可以找東西代替。時間或做法有變，就問問大家還願意照哪一項約定做。"]],
    },
  },
  "space-marine-chapter": {
    samples: ["ultramarines", "salamanders", "raven-guard"],
    scenes: {
      ultramarines: ["You put the model table's shared plan where every maker can see and ask about it.", "布置模型展桌时，你先把共用平面图摊开，让制作的人都能看懂和提问。", "布置模型展桌時，你先攤開共用配置圖，讓大家看得懂也能提問。"],
      "imperial-fists": ["You check how a light model fits its stand before the table opens to visitors.", "观众到场前，你先检查轻型模型和展示底座贴合得稳不稳。", "觀眾到場前，你先確認輕型模型放在展示底座上穩不穩。"],
      "iron-hands": ["You try one joint on a scrap part before changing the rest of the display.", "改动展示前，你用一块边角料先试一处卡扣，再决定要不要照样做。", "改動展示前，你先拿一塊邊料試接一處卡榫，再決定後面要不要照做。"],
      salamanders: ["You take a little time to finish a painted detail another maker would like people to notice.", "同伴想让观众看到一个手绘细节，你多花一点时间把边缘修好。", "夥伴想讓人看見手繪細節，你多花點時間把邊緣修好。"],
      "raven-guard": ["You walk around the table to see what visitors can actually read before moving any labels.", "挪标签之前，你绕桌走一圈，先看观众从各处到底能读到什么。", "搬標籤前，你繞著桌子走一圈，看看觀眾從不同位置能看到哪些字。"],
      "white-scars": ["You suggest a second route for following the fictional display story, and let people choose.", "讲解模型故事时，你画出另一条虚构路线，让观众自己选从哪段看起。", "說模型故事時，你畫出另一條虛構路線，讓觀眾自己選從哪一段開始。"],
    },
    en: {
      facts: "FermatMind’s free Space Marine Chapter Test uses 18 choices about a fictional hobby model exhibition to compare six Warhammer 40,000 chapter readings. Each answer gives one count to one chapter, and every chapter tied at the highest count remains in the result. Players can finish in about five minutes without signing up, and read all six public guides whether or not they know the setting.",
      interpretation: [["Plan the table or steady a base", "Agree how the display fits together. If the issue is just one loose stand, solve that small problem first."], ["Test a joint or refine a detail", "Try a changed connection on scrap. Put extra care into a painted detail when it is part of the maker’s story."], ["Observe or sketch another route", "Check what people can already see. When a new route would help, offer it as an option for following the fictional story."]],
    },
    zh: {
      facts: "费马测试的星际战士战团测试用18道虚构模型展情境，对照战锤40K的六个战团。每题给一团加一次，最高并列全部保留。约5分钟，免费免注册，可先阅读六篇指南。",
      interpretation: [["排好展桌，还是先稳住底座", "先弄清共用空间怎样分。如果只是一个底座松了，可以先解决眼前的问题。"], ["试接一处，还是修好细节", "先在边角料上验证一个接头。手绘细节关系到作者想讲的故事时，再给它多留一点时间。"], ["先观察，还是另画一条路线", "看看观众现在能读懂什么。如果需要一条新路线，把它作为可选的参观顺序。"]],
    },
    "zh-TW": {
      facts: "費馬測試的星際戰士戰團測驗用18道虛構模型展情境，對照戰鎚40K的六個戰團。每題替一團記一次，最高次數相同時全數保留。約5分鐘，免費免註冊，可先讀公開指南。",
      interpretation: [["排好展桌，或先弄穩底座", "先約好共用空間怎麼分。如果只是一個底座鬆了，可以先處理那一個。"], ["試接一處，或照顧手作細節", "拿邊料試一次接合。手繪細節有故事時，可以多花一點時間讓人看得清楚。"], ["先看看現場，或多畫一條路線", "先確認觀眾現在看得到什麼。需要另一條路線時，把它當成一種可選的讀法。"]],
    },
  },
  "south-park": {
    samples: ["stan-marsh", "kyle-broflovski", "wendy-testaburger"],
    scenes: {
      "stan-marsh": ["Before a craft meetup adds another activity, you ask what supplies the group actually needs.", "手作会还想再加一项活动时，你先问大家眼下缺什么材料。", "手作聚會還想多加一項活動時，你先問大家現在少了哪些材料。"],
      "kyle-broflovski": ["Two people hear a game rule differently, so you ask the group to agree on one wording.", "两个人对游戏规则理解不同，你请大家一起确认一句都听得懂的说法。", "兩人對遊戲規則的理解不一樣，你請大家先說好都聽得懂的版本。"],
      "eric-cartman": ["When everyone picks a snack, you name what you'd like and give others time to choose.", "一起选点心时，你说清自己想吃哪种，也给别人时间选。", "一起挑點心時，你會說出自己想吃哪種，也讓別人慢慢選。"],
      "kenny-mccormick": ["You notice a loose corner on the sign and quietly tape it back down.", "你发现指路牌翘起一角，顺手用胶带固定好。", "你看到指示牌翹起一角，順手拿膠帶貼好。"],
      "butters-stotch": ["You teach one easy turn of a table game to a newcomer who would like to try.", "有人想加入桌游时，你先教一轮最容易试的玩法。", "有人想加入桌遊時，你先教一輪好上手的玩法。"],
      "wendy-testaburger": ["You notice one person can’t reach the materials and ask what setup would help them join.", "有人够不到桌上的材料，你问怎么摆能让对方也舒服地参与。", "有人拿不到桌上的材料，你問怎麼擺才能讓對方也好加入。"],
      "randy-marsh": ["You pitch a big decoration idea and volunteer to test just one corner before committing.", "你想了一个很热闹的布置方案，提议只试一个角落，合适再继续。", "你想了個很熱鬧的布置，提議先試一個角落，適合再往下做。"],
    },
    en: {
      facts: "FermatMind’s free South Park Character Test asks 21 questions about ordinary group activities and compares seven characters from the show. Each choice adds one count, and the quiz keeps every character tied at the highest count. It takes about five minutes, needs no account or episode knowledge, and includes seven public guides that explain the everyday approaches behind the matches.",
      interpretation: [["Solve a practical issue or agree on a rule", "Check what the task needs today. If people heard the rules differently, take a moment to write down the shared version."], ["Name your wish or make room for someone else", "Say what you would like, then ask whether anyone needs a clearer invitation or a different setup to join."], ["Do a small useful thing or test a big idea", "Some needs can be met quietly. When you have a big idea, choose an easy first test and make stopping an option."]],
    },
    zh: {
      facts: "费马测试的《南方公园》角色测试用21道日常小组情境，对照斯坦、凯尔等七位角色。每题为一人记一次，保留最高并列。约5分钟，完整结果免费，也可先读角色指南。",
      interpretation: [["先解决小事，还是说清规则", "先看今天少什么。如果大家对规则理解不同，就一起把共用的版本写下来。"], ["说出自己的愿望，还是帮别人加入", "说清自己会选什么，也留意谁需要明确邀请，谁需要换一种参与方式。"], ["随手做一点，还是试个大点子", "有些事顺手就能帮忙。遇到更大的想法，先挑一个容易试、也能停的部分。"]],
    },
    "zh-TW": {
      facts: "費馬測試的《南方四賤客》角色測驗有21道小組生活情境，對照史丹、凱子等七位角色。每題替一人記一次，最高次數相同會全部保留。約5分鐘，結果與公開指南免費。",
      interpretation: [["先把小事處理好，或先說好規則", "先確認今天缺什麼。如果大家理解不同，可以把都同意的版本寫下來。"], ["說出自己想要什麼，或讓別人更好加入", "說清楚自己會選哪一個，也問問其他人需不需要明確邀請或調整一下。"], ["順手幫忙，或先試一點大點子", "有些事做一小步就夠。想法比較大時，可以先挑容易試、也方便停的部分。"]],
    },
  },
} as const satisfies Record<string, Definition>;

export type StoryRoleSlug = keyof typeof storyRoleLandingCopy;
export function hasStoryRoleLanding(slug: string): slug is StoryRoleSlug {
  return Object.hasOwn(storyRoleLandingCopy, slug);
}

/** The standalone form retains choices only for the open attempt. */
export function standaloneStoryLandingCopy(text: string, locale: DisplayLocale): string {
  if (locale === "en") return text.replace(
    /(?:Optional tab drafts expire|explicit saving creates)[^.]*\./g,
    "This quiz keeps choices only for the current attempt. Reloading or switching languages starts a new attempt.",
  );
  const replacement = locale === "zh-TW"
    ? "作答只保留在這一次測驗。重新整理或切換語言會從頭開始。"
    : "选择只保留在本次作答中。刷新或切换语言会从头开始。";
  return text.replace(/(?:可[选選][^。；]*[草暫]稿|只有主[动動][^。；]*建立)[^。]*。/g, replacement);
}
