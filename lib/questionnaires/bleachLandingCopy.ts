import type { DisplayLocale } from "@/lib/i18n/locales";
import { bleachPresentations, type BleachId } from "./bleachPresentation";

const scenes = {
  "ichigo-kurosaki": ["朋友准备搬家，你说可以帮忙装两箱，但下午得先走。", "朋友要搬家，你可以幫忙裝兩箱，也先說好下午得離開。", "When a friend moves, you offer to pack two boxes and say when you have to leave."],
  "rukia-kuchiki": ["有人第一次用裁纸刀，你先示范一步，再请对方试一遍。", "有人第一次用裁紙刀，你先做一遍給他看，再請他試試。", "When someone learns a craft tool, you demonstrate one step and give them time to try it."],
  "sosuke-aizen": ["小组迟迟选不出海报，你先问大家到底希望观众记住什么。", "小組挑不出海報，你先問大家想讓觀眾記住什麼。", "When no poster design wins, you ask what the group wants the audience to remember."],
  "byakuya-kuchiki": ["答应整理资料前，你说好交稿时间，也指出哪些内容还能再商量。", "答應整理資料前，你先約好時間，再說哪些內容可以討論。", "Before taking on a shared document, you set a deadline and say which parts can still change."],
  "orihime-inoue": ["搭档心情不太好，你先问对方想聊聊，还是想自己静一会儿。", "夥伴心情不太好，你先問對方想聊聊，還是想自己靜一會兒。", "When a friend seems upset, you ask whether they'd like to talk or have a quiet moment."],
  "kisuke-urahara": ["大家拿不准展架怎么摆，你先用纸板做个可以随手挪动的模型。", "大家還想不到展架怎麼擺，你先用紙板做個能隨手移動的模型。", "When the display layout is unclear, you make a movable model out of cardboard."],
  "kenpachi-zaraki": ["第一次学一段舞，你只选一个动作练习，累了就暂停。", "第一次學一段舞，你先挑一個動作練，累了就休息。", "Learning a dance for the first time, you try one move and give yourself permission to stop."],
} as const satisfies Record<BleachId, readonly [string, string, string]>;

export const bleachLandingCopy = {
  samples: ["ichigo-kurosaki", "rukia-kuchiki", "orihime-inoue"],
  zh: {
    facts: "费马测试的《死神》角色测试用21道日常情境，对照一护、露琪亚和织姬等七位角色。每题为对应角色记一次，最高并列全部保留。约7分钟，完整结果及角色指南免费。",
    interpretation: [["愿意帮忙，还是先问需求", "说清自己能帮多久，再给对方机会决定想不想接受，以及更想要什么。"], ["先讲步骤，还是先换问题", "只是步序不清，可以拆开来讲；如果想去的方向不同，就先重新核对目标。"], ["守住约定，还是先试一小步", "涉及别人时先说清承诺；能自主试做时，挑一个可以修改或随时停下的版本。"]],
  },
  "zh-TW": {
    facts: "費馬測試的《BLEACH 死神》角色測驗有21道日常情境，可與一護、露琪亞、織姬等七位角色對照。每題給一人記一次，最高次數並列全數保留。約7分鐘，結果與指南免費。",
    interpretation: [["想幫忙，還是先問需求", "先說能幫到哪裡，再讓對方決定要不要接受，以及更需要什麼。"], ["說明步驟，還是重新問一次", "如果只是順序不清楚，可以一步步講；如果想做的事不一樣，先回頭確認目標。"], ["照約定做，還是先試一小步", "涉及別人時先說清楚彼此的承諾；能自己試時，先做一個能改、能停的小版本。"]],
  },
  en: {
    facts: "FermatMind’s free BLEACH character quiz compares choices in 21 everyday situations with seven characters, including Ichigo, Rukia and Orihime. Each answer adds one count to one character. Every character tied for the highest count remains in the result. It takes about seven minutes, requires no sign-up, and includes public guides so readers can compare the characters’ approaches before or after taking the quiz.",
    interpretation: [["Offer help or ask what is wanted", "Say what you can offer and when, then ask whether that help suits the other person."], ["Explain the steps or rethink the question", "Walk through the steps if the order is unclear. If the goal is in doubt, clarify it before explaining the procedure."], ["Make a commitment or try a small version", "Agree on commitments that affect someone else. If it is your own trial, pick a small version you can revise or stop."]],
  },
} as const;

export function bleachLandingProfile(id: BleachId, locale: DisplayLocale, translate: (text: string) => string) {
  const profile = bleachPresentations[id];
  const base = locale === "en" ? "en" : "zh";
  return [translate(profile.name[base]), translate(profile.conclusion[base]), translate(profile.reason[base]),
    scenes[id][locale === "en" ? 2 : locale === "zh-TW" ? 1 : 0]] as const;
}
