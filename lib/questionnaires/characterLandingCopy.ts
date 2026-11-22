import { hasStoryRoleLanding, type StoryRoleSlug } from "./storyRoleLandingCopy";
import type { DisplayLocale } from "@/lib/i18n/locales";

type ProfileCopy = readonly [name: string, title: string, hook: string, scene: string];
type Reading = readonly [title: string, body: string];
type Triple = readonly [Reading, Reading, Reading];
type LocalCopy = {
  facts: string;
  profiles: Record<string, ProfileCopy>;
  interpretation: Triple;
};

export const characterLandingCopy = {
  "cyberpunk-edgerunners": {
    samples: ["david", "lucy", "rebecca"],
    zh: {
      facts: "费马测试的《赛博朋克：边缘行者》角色测试用21道日常情境题，对照初代动画的七位角色。每道题给一位角色加一次，保留所有最高并列。约7分钟，完整结果免费。",
      profiles: {
        david: ["大卫", "先试一小步的人", "你愿意先动手，给还在犹豫的人看一个可行的开始。", "临时接到陌生任务，你先做一小段样稿，再和大家决定怎样分工。"],
        lucy: ["露西", "替目标留位置的人", "你会留一点空间，先听清楚自己为什么想做这件事。", "小组突然换方向，你说清哪些目标想保留，再决定自己能接哪一部分。"],
        rebecca: ["丽贝卡", "把支持说出口的人", "你看到有人被晾在一边时，会让对方知道身边还有人。", "队友的提议没人接，你先回应一句，再问对方要不要一起把它说完。"],
        maine: ["曼恩", "把人手排明白的人", "你会先看谁忙不过来，再问谁手上还有余量。", "两件工作撞到同一天，你重新分工，给每个人留一点应变时间。"],
        kiwi: ["琦薇", "查清消息再转发的人", "你愿意多停一拍，弄清群里那句话是从哪来的。", "两份通知的时间不同，你先核对发出人和日期，再给群里同步。"],
        falco: ["法尔科", "接好最后一棒的人", "你会留意计划能不能走到最后一步，也会问下一棒由谁接。", "活动快结束时，你确认归还物品的地点、时间和接手人。"],
        faraday: ["法拉第", "先把条件讲清的人", "你愿意在答应前多问一句，确认双方说的是同一件事。", "朋友说可以帮忙，你问清帮到几点、负责哪一段。"],
      },
      interpretation: [["先试还是先保留目标", "想试做一小段时，可以给试验划个范围；珍惜原目标时，可以把最想保留的一件事说清。"], ["查消息还是问条件", "把某件事是否属实，与谁明确答应了什么分开核对。"], ["直接支持还是安排交接", "有人被打断时，先问是否需要帮忙；任务收尾时，确认下一棒确实有人接。"]],
    },
    "zh-TW": {
      facts: "費馬測試的《電馭叛客：邊緣行者》角色測驗用21道日常情境題，對照動畫第一季的七位角色。每題替一人加一次，最高次數並列會全數保留。約7分鐘，完整結果免費。",
      profiles: {
        david: ["大衛", "先試一小步的人", "你願意先動手，讓還在觀望的人看見可以從哪裡開始。", "臨時遇到沒做過的任務，你先做一小段樣稿，再和大家商量分工。"],
        lucy: ["露西", "替目標留位置的人", "你會留點空間，先想清楚自己為什麼想加入。", "小組改了方向，你說清楚想保留什麼，再決定要接手哪一段。"],
        rebecca: ["蕾貝卡", "把支持說出口的人", "你看到有人被晾在一邊，會讓對方知道自己有人挺。", "夥伴的提議沒人接話，你先回應，再問對方要不要一起把話說完。"],
        maine: ["魅音", "安排人手的人", "你忙著往前推，也會看誰快忙不過來。", "兩件工作排在同一天，你重新分工，也給大家留點緩衝。"],
        kiwi: ["綺薇", "查清楚才轉傳的人", "你願意多停一下，弄清楚群組那句話是誰說的。", "兩份通知時間不同，你先確認發出人和日期，再向大家更新。"],
        falco: ["法爾可", "接好最後一棒的人", "你會看計畫能不能走到終點，也會確認下一棒由誰接。", "活動快結束時，你先確認器材幾點還、還去哪裡、誰來接手。"],
        faraday: ["法拉第", "先談清條件的人", "你答應前會多問一句，確認雙方想的是同一件事。", "朋友說可以幫忙，你先問清楚會待到幾點、能幫哪一段。"],
      },
      interpretation: [["先試，還是先顧好目標", "想先做一小段可以約好試多久；想留住原本的目標，可以直接說出最在意哪部分。"], ["查證與確認承諾", "先問消息從哪來，再問誰答應接下哪件事。兩個問題值得分開問。"], ["聲援與交接", "夥伴被打斷時先問要不要幫忙；準備收尾時再確認下一棒有人接。"]],
    },
    en: {
      facts: "FermatMind’s free Cyberpunk: Edgerunners character quiz uses 21 everyday scenarios to compare a player’s choices with seven characters from the original anime. Each response adds one count to one character, and every character tied for first appears in the result. It takes about seven minutes, needs no sign-up or plot knowledge, and links to public guides for all seven characters.",
      profiles: {
        david: ["David", "The One Who Tries a First Step", "You get a small version working so everyone has something concrete to react to.", "When a group gets a new assignment, you make a rough draft before deciding how to divide the work."],
        lucy: ["Lucy", "The One Who Makes Room for a Goal", "You take a moment to remember why you wanted to join in the first place.", "When your group changes direction, you explain what you still want to make and choose where you can help."],
        rebecca: ["Rebecca", "The One Who Says It Out Loud", "When someone is being talked over, you make sure they have an ally in the room.", "If a teammate’s suggestion gets ignored, you acknowledge it and ask whether they want help finishing the thought."],
        maine: ["Maine", "The One Who Sorts Out the Crew", "You look for the person who is stretched thin and the teammate who can take something on.", "When two deadlines land on the same day, you split the work and leave time for surprises."],
        kiwi: ["Kiwi", "The One Who Checks the Source", "You slow down just long enough to find out where a message came from.", "When two announcements list different times, you check who sent them and when before posting an update."],
        falco: ["Falco", "The One Who Sees It Through", "You look all the way to the last step and check who is taking the next handoff.", "As an event winds down, you confirm when the gear goes back and who will be there to receive it."],
        faraday: ["Faraday", "The One Who Names the Terms", "Before you agree, you make sure everyone means the same thing by the offer.", "If a friend offers to help, you ask which part they can take and how long they can stay."],
      },
      interpretation: [["A first step or a goal worth keeping", "Set a limit on what you will try. If a direction has changed, say which part of the original plan still matters to you."], ["Check a fact or clarify a commitment", "Find out whether the message is accurate, then check exactly what someone agreed to do."], ["Speak up or see the handoff through", "Ask whether a teammate wants help getting heard. At the end of the project, check that someone can actually take over."]],
    },
  },
  chiikawa: {
    samples: ["chiikawa", "hachiware", "usagi"],
    zh: {
      facts: "费马测试的吉伊卡哇角色测试用18道日常情境题，对照吉伊、小八、兔兔等六位角色。每题为对应角色记一次，保留最高并列。约6分钟，完整结果与公开指南免费。",
      profiles: {
        chiikawa: ["吉伊卡哇", "按自己速度加入的人", "你先找到让自己自在的一个小位置，慢慢就能跟上。", "工作坊可以自由加入，你先选一份容易上手的小材料试一试。"],
        hachiware: ["小八", "和大家一起把话说清的人", "你会问大家说的是不是同一件事，再一起把它讲明白。", "朋友用不同叫法指同一件东西，你找个实物给大家一起确认。"],
        usagi: ["兔兔", "随手试出新玩法的人", "你手上有一张废纸，就能试出一个意想不到的形状。", "装饰材料用完了，你先用桌上的边角料折个小样。"],
        momonga: ["小桃", "能开口说想要什么的人", "你会把喜欢的选项说出来，也能听见朋友想选别的。", "一起挑纪念物时，你指明自己最想要哪款，然后问朋友的意见。"],
        kurimanju: ["栗子馒头", "能慢下来享受的人", "你会留意一件小东西的质感，多看一眼再走。", "散步经过同一条路，你愿意停下来看看今天的树影。"],
        rakko: ["海獭", "愿意分享试过办法的人", "你愿意把自己试过的做法讲清，留给对方选。", "朋友问怎么糊纸盒，你说清哪种胶适合薄纸，再让对方决定。"],
      },
      interpretation: [["先慢一点，还是先试一下", "想加入但不确定时，可以先旁观片刻；有小点子时，试一个随时能停的版本。"], ["一起说清，还是明确愿望", "分不清时确认大家的意思；想法不同时，先说自己的选择，再问对方。"], ["细品当下，还是分享经验", "愿意停留就说说你注意到了什么。分享做法时，交代在哪种情况下对你有效。"]],
    },
    "zh-TW": {
      facts: "費馬測試的吉伊卡哇角色測驗有18道生活情境題，可與吉伊、小八、兔兔等六位角色對照。每選一項加一次，最高次數相同會全部保留。約6分鐘，完整結果與指南免費。",
      profiles: {
        chiikawa: ["吉伊卡哇", "按自己步調加入的人", "你先找到讓自己自在的一小步，再慢慢加入大家。", "手作活動可以自由加入，你先拿一份簡單的材料試試看。"],
        hachiware: ["小八", "一起把意思說明白的人", "你會先問大家說的是不是同一樣東西，再一起確認。", "朋友用不同叫法指同一樣東西，你找個實物讓大家一起看。"],
        usagi: ["兔兔", "隨手試出新玩法的人", "你拿到一張廢紙，就會想試試能不能折出沒看過的形狀。", "裝飾材料用完了，你先拿桌上的紙邊折個樣子。"],
        momonga: ["飛鼠", "會開口說出願望的人", "你願意說出自己喜歡哪個，也能聽朋友說他想選別的。", "一起挑紀念品時，你先指給朋友看你最想選的款式，再問他的想法。"],
        kurimanju: ["栗子饅頭", "慢下來享受的人", "你會留意小東西摸起來是什麼感覺，願意多停一下。", "散步經過同一條路，你停下來看看今天的樹影。"],
        rakko: ["海獺", "分享試過做法的人", "你願意把親手試過的做法講清楚，讓對方自己決定。", "朋友問怎麼黏紙盒，你先說明哪種膠適合薄紙，再讓他選。"],
      },
      interpretation: [["照自己的步調或先試看看", "還在想要不要加入時，可以先在旁邊看看；有靈感時，挑一種隨時能停的小試法。"], ["把話說清楚或說出想要什麼", "聽不懂時確認大家的意思；有不同想法時，說清楚自己的選擇，再聽對方怎麼想。"], ["留意當下或分享經驗", "想多停一下，就說說你看到了什麼。要分享做法，也可以補一句在哪種情況下有用。"]],
    },
    en: {
      facts: "FermatMind’s free Chiikawa character quiz asks players to choose a response in 18 everyday situations and compares those choices with six characters, including Chiikawa, Hachiware and Usagi. Each response counts once toward one character. The result keeps every character tied for the highest count. It takes about six minutes, needs no account, and includes a public guide for each of the six possible matches.",
      profiles: {
        chiikawa: ["Chiikawa", "Joining at Your Own Pace", "You find a small, comfortable way to join and get more involved when you’re ready.", "At a drop-in workshop, you pick a simple material to try before joining the group activity."],
        hachiware: ["Hachiware", "Putting It into Words Together", "You check whether everyone means the same thing and help the group find words for it.", "If friends use different names for the same object, you find an example so everyone can point to it."],
        usagi: ["Usagi", "Finding a New Way to Play", "Give you a piece of scrap paper and you’ll see what unexpected shape you can make.", "When the decorations run out, you fold a small example from the paper left on the table."],
        momonga: ["Momonga", "Making a Wish Visible", "You can say what you want and hear a friend choose something else.", "While picking keepsakes together, you point out your favorite and ask which one your friend likes."],
        kurimanju: ["Kurimanju", "Savouring Small Comforts", "You’re happy to give an ordinary little detail an extra moment of your attention.", "Walking the same route again, you stop to see what the shadows look like today."],
        rakko: ["Rakko", "Passing On a Useful Trick", "You can show someone what worked for you and let them decide if they want to try it.", "When a friend asks how to fix a paper box, you explain which glue worked with thin paper."],
      },
      interpretation: [["Join slowly or try it out", "Watch for a moment if you're unsure. If you have an idea, pick a small version you can try without taking over."], ["Clarify together or share a preference", "Ask what everyone means when something is unclear. If you want different things, name your pick and hear theirs."], ["Notice a detail or share a trick", "Point out a detail you'd like to spend more time with. When you offer a trick, say when it worked for you."]],
    },
  },
} as const satisfies Record<string, { samples: readonly string[] } & Record<DisplayLocale, LocalCopy>>;

export type CharacterLandingSlug = keyof typeof characterLandingCopy | "bleach" | StoryRoleSlug;

export function hasCharacterLanding(slug: string): slug is CharacterLandingSlug {
  return slug === "bleach" || hasStoryRoleLanding(slug) || Object.hasOwn(characterLandingCopy, slug);
}
