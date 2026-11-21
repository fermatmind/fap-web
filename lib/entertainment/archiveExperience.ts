import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type { DisplayLocale } from "@/lib/i18n/locales";

type Localized<T> = Record<DisplayLocale, T>;
type Snapshot = readonly [line: string, firstTrait: string, secondTrait: string];

const archiveExperience: Readonly<Partial<Record<string, {
  startHint: Localized<string>;
  next: { slug: string; label: Localized<string>; detail: Localized<string> };
  profiles: Readonly<Partial<Record<string, Localized<Snapshot>>>>;
}>>> = {
  "found-family-role-test": {
    startHint: {
      en: "Keep the same gathering in mind. A small contribution you would willingly make is enough for any question.",
      zh: "做题时就想同一场朋友聚会。每题选一件你这次愿意做的小事即可。",
      "zh-TW": "作答時想著同一場朋友聚會。每題挑一件你這次樂意幫忙的小事就好。",
    },
    next: {
      slug: SCALE_CANONICAL_SLUG_MAP.EQ_60,
      label: { en: "Explore the emotional intelligence assessment", zh: "了解情商测评", "zh-TW": "了解情緒智力測驗" },
      detail: {
        en: "If you want to reflect on how you notice feelings and respond in everyday conversations, try a separate emotional intelligence assessment.",
        zh: "如果想进一步观察自己在日常对话中怎样察觉情绪、怎样回应，可以另做一份情商测评。",
        "zh-TW": "如果想多了解自己平常怎麼察覺情緒、怎麼回應別人，可以另外做情緒智力測驗。",
      },
    },
    profiles: {
      "welcome-keeper": {
        en: ["There’s room to come as you are.", "Easy entry", "Room to join"],
        zh: ["来坐一会儿也算参加。", "让人容易加入", "给人留位置"],
        "zh-TW": ["來坐一下，就算有參與。", "好開口加入", "替人留個位置"],
      },
      "practical-pal": {
        en: ["Point me to one thing I can do.", "Concrete help", "Clear scope"],
        zh: ["告诉我哪件小事能帮上忙。", "动手帮忙", "说清范围"],
        "zh-TW": ["哪件小事需要幫忙？我來。", "具體幫忙", "講清楚範圍"],
      },
      "story-keeper": {
        en: ["Let’s keep a little piece of today.", "Shared memories", "Small mementos"],
        zh: ["给今天留下一点值得回看的东西。", "共同回忆", "留下小纪念"],
        "zh-TW": ["留一點今天的片段，下次還能翻來看。", "一起記得", "留下小紀念"],
      },
      "spark-starter": {
        en: ["We can try it for five minutes.", "Small experiments", "Easy to join"],
        zh: ["先试五分钟，喜欢就继续。", "试个新点子", "参与门槛低"],
        "zh-TW": ["先玩五分鐘，有趣再繼續。", "試個新點子", "想加入就加入"],
      },
      "listening-companion": {
        en: ["Tell me the part you want to tell.", "Listen first", "Let them set the pace"],
        zh: ["从你愿意讲的那一段开始吧。", "先听再回应", "尊重对方节奏"],
        "zh-TW": ["你想聊哪一段，就從那裡說。", "先聽再回應", "照對方的步調"],
      },
      "thread-weaver": {
        en: ["How would you like us to stay in touch?", "Ask before inviting", "Flexible contact"],
        zh: ["下次用什么方式联系，你会更自在？", "先问意愿", "联系方式可选"],
        "zh-TW": ["下次怎麼約，你會比較自在？", "先問對方意願", "聯絡方式有彈性"],
      },
    },
  },
  "travel-personality-test": {
    startHint: {
      en: "Picture one short outing. If two options both sound good, choose which you would give time to first.",
      zh: "把每道题都放在同一次短途出游里想。两项都喜欢时，选先留时间给哪一项。",
      "zh-TW": "每一題都想著同一趟小旅行。兩個選項都有興趣時，挑你想先留時間給哪一個。",
    },
    next: {
      slug: SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
      label: { en: "Explore the Big Five personality assessment", zh: "了解大五人格测评", "zh-TW": "了解大五人格測驗" },
      detail: {
        en: "Curious how your interest in new experiences or preference for planning shows up away from travel? Explore those broader traits in a separate Big Five assessment.",
        zh: "如果想看看自己在旅行之外如何面对新体验或安排计划，可以另做大五人格测评，了解更广泛的个性特点。",
        "zh-TW": "想知道平常遇到新事物、安排行程以外的事情時，你會怎麼做嗎？可以另外做大五人格測驗。",
      },
    },
    profiles: {
      wanderer: {
        en: ["Leave a little time for the unexpected turn.", "Open plans", "On-the-spot discoveries"],
        zh: ["给临时想拐进去的小路留点时间。", "行程留白", "沿途发现"],
        "zh-TW": ["留一點時間，走進臨時想逛的小巷。", "行程留白", "邊走邊發現"],
      },
      planner: {
        en: ["Set the anchors, then enjoy the day.", "Set priorities", "Plan the route"],
        zh: ["先定好几件最想做的事，剩下慢慢来。", "安排优先顺序", "先理路线"],
        "zh-TW": ["先排好最想做的幾件事，到了就慢慢玩。", "排好先後順序", "先看路線"],
      },
      culture: {
        en: ["I want to know how this place came to be.", "Local stories", "Everyday culture"],
        zh: ["想多听一点这个地方过去和现在的故事。", "地方故事", "日常文化"],
        "zh-TW": ["我想知道，這個地方為什麼是現在的樣子。", "在地故事", "日常文化"],
      },
      outdoors: {
        en: ["Give me some time outside.", "Time outdoors", "Activities that fit"],
        zh: ["留一段时间，到户外走走。", "亲近户外", "按条件选活动"],
        "zh-TW": ["這趟想留點時間，到戶外走走。", "把時間留給戶外", "挑適合的活動"],
      },
      rest: {
        en: ["A quiet pause can be the best part of the trip.", "Fewer stops", "Time to rest"],
        zh: ["停下来好好歇一会儿，也值得专门安排。", "少赶几个点", "留出休息时间"],
        "zh-TW": ["能好好歇一下，就是這趟值得安排的事。", "少跑幾個點", "留時間休息"],
      },
      food: {
        en: ["Let’s leave time to taste something local.", "Local food", "Make time to taste"],
        zh: ["这趟留点时间，慢慢尝尝当地的味道。", "地方风味", "为品尝留时间"],
        "zh-TW": ["留一點時間，慢慢吃點在地的味道。", "在地風味", "為品嘗留時間"],
      },
    },
  },
  "leadership-style": {
    startHint: {
      en: "Think of one ordinary team. Choose the first move you would make, even if you would follow it with another approach.",
      zh: "想一个熟悉的普通团队。即便之后还会换做法，每题也只选你会先做的那一步。",
      "zh-TW": "想著一個熟悉的團隊。就算接下來會改用別的做法，每題也只挑你會先做的那一步。",
    },
    next: {
      slug: SCALE_CANONICAL_SLUG_MAP.RIASEC,
      label: { en: "Explore the Holland career interest assessment", zh: "了解霍兰德职业兴趣测评", "zh-TW": "了解何倫碼職涯興趣測驗" },
      detail: {
        en: "Curious whether organizing, persuading, or supporting people is work you enjoy? Try a separate Holland assessment to compare your interests across different kinds of work.",
        zh: "想知道组织、说服或支持他人是不是你愿意长期做的事？可以另做霍兰德测评，比较你对不同工作活动的兴趣。",
        "zh-TW": "想知道自己喜不喜歡規劃、說服或支持他人這類工作？可以另外做何倫碼測驗，看看你對不同工作活動的興趣。",
      },
    },
    profiles: {
      autocratic: {
        en: ["I’ll make the call and spell out the next step.", "Clear ownership", "Direct decisions"],
        zh: ["这一步我来定，再把接下来怎么做说清楚。", "明确谁负责", "直接拍板"],
        "zh-TW": ["這一步由我決定，再把接下來怎麼做講清楚。", "責任明確", "直接做決定"],
      },
      democratic: {
        en: ["Let’s hear each proposal before deciding.", "Invite input", "Compare proposals"],
        zh: ["先把几个方案听完，再一起定。", "听取意见", "共同比较"],
        "zh-TW": ["先聽聽大家的方案，再一起決定。", "讓成員參與", "一起比較方案"],
      },
      "laissez-faire": {
        en: ["You can work out the details among yourselves.", "Member-led choices", "Room to organize"],
        zh: ["具体怎么做，你们可以自己商量。", "成员自主", "留出安排空间"],
        "zh-TW": ["細節你們可以自己討論安排。", "成員自主", "讓團隊自己協調"],
      },
      transformational: {
        en: ["Let’s look again at what we’re trying to change.", "Revisit the goal", "Model a new approach"],
        zh: ["先回头看看，我们到底想改变什么。", "重看目标", "示范新做法"],
        "zh-TW": ["先想一想，我們真正想改變的是什麼。", "再看一次目標", "示範新做法"],
      },
    },
  },
  "big-fish-energy-test": {
    startHint: {
      en: "Picture each ordinary scene before choosing. Go with the small thing you feel like doing this time.",
      zh: "先想象题里的日常场景，再选你这次最想做的一件小事。",
      "zh-TW": "先想像題目裡的日常片段，再挑你這次最想做的那件小事。",
    },
    next: {
      slug: SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
      label: { en: "Explore the Big Five personality assessment", zh: "了解大五人格测评", "zh-TW": "了解大五人格測驗" },
      detail: {
        en: "If you want to explore broader habits around order, sociability or trying new things, those are topics you can consider in a separate Big Five assessment.",
        zh: "如果也想看看平常怎样安排事情、与人相处或接触新事物，可以另做大五人格测评。",
        "zh-TW": "如果也想看看自己平常怎麼安排事情、和人相處或接觸新事物，可以另外做大五人格測驗。",
      },
    },
    profiles: {
      shark: {
        en: ["Let me finish this one thing first.", "One thing at a time", "Finish the small task"],
        zh: ["先把手上这一件做完。", "一次专心一件", "先收好小尾巴"],
        "zh-TW": ["先把手上這件事做完。", "一次專心一件", "先把小事收尾"],
      },
      dolphin: {
        en: ["I’ll share one, and you can share one if you like.", "Take turns", "Keep it voluntary"],
        zh: ["我先分享一个，你想接着聊也可以。", "轮流交流", "愿意才参与"],
        "zh-TW": ["我先分享一個，你有興趣再接著聊。", "輪流交流", "想參加再加入"],
      },
      whale: {
        en: ["Can we stay with this a little longer?", "Take your time", "Leave some space"],
        zh: ["在这一刻多停留一会儿吧。", "放慢一点", "留点空间"],
        "zh-TW": ["再多留一點時間，好好看一會兒。", "放慢步調", "留一點空間"],
      },
      octopus: {
        en: ["What if we put these two things together?", "Recombine familiar things", "Try another arrangement"],
        zh: ["把这两样熟悉的东西放在一起试试？", "重新组合", "多试一种摆法"],
        "zh-TW": ["把這兩樣熟悉的東西搭在一起看看？", "重新搭配", "試試別的排法"],
      },
      pufferfish: {
        en: ["I’ll join for a bit, and then stop there.", "Set a small limit", "Choose how much to share"],
        zh: ["我可以参加一会儿，到这里就好。", "先划小范围", "自己决定分享多少"],
        "zh-TW": ["我可以參加一下，到這裡就好。", "先訂個小範圍", "自己決定分享多少"],
      },
      anglerfish: {
        en: ["I think I’ll keep this little find to myself for now.", "Keep a small find", "Share when ready"],
        zh: ["这个小发现，我想暂时留给自己。", "珍藏小发现", "想分享时再说"],
        "zh-TW": ["這個小發現，我想先留給自己。", "收好小發現", "想分享時再說"],
      },
    },
  },
  "villain-era-archetype-test": {
    startHint: {
      en: "Think of an ordinary request for a little extra time or effort. Choose the opening you would actually use.",
      zh: "想象有人请你额外花一点时间或精力。选一句或一种你真的愿意用来开场的做法。",
      "zh-TW": "想像日常裡有人請你多花一點時間或力氣。挑一句你真的會說的話，或一個你會採取的開場動作。",
    },
    next: {
      slug: SCALE_CANONICAL_SLUG_MAP.EQ_60,
      label: { en: "Explore the emotional intelligence assessment", zh: "了解情商测评", "zh-TW": "了解情緒智力測驗" },
      detail: {
        en: "If you want to reflect on what you notice and how you respond when a request feels awkward, explore that separately in the emotional intelligence assessment.",
        zh: "如果想进一步观察自己遇到为难的请求时如何察觉情绪、怎么回应，可以另做一份情商测评。",
        "zh-TW": "如果想知道自己遇到難開口的請求時，怎麼察覺情緒、怎麼回應，可以另外做情緒智力測驗。",
      },
    },
    profiles: {
      "scene-planner": {
        en: ["I can do this part. Let’s agree where it ends.", "Name the scope", "Set an end point"],
        zh: ["我能接这一段，我们先说好做到哪儿。", "说清范围", "定好结束点"],
        "zh-TW": ["我可以幫這一部分，先說好做到哪裡。", "講清楚範圍", "先訂結束點"],
      },
      "honest-antihero": {
        en: ["I nearly said yes. Looking at my time, I can’t take it on.", "Acknowledge hesitation", "State your capacity"],
        zh: ["我刚才差点答应，想了想，这次确实排不开。", "承认犹豫", "说清自己的余量"],
        "zh-TW": ["我剛才差點答應，但再看一下時間，這次真的排不下。", "承認猶豫", "說清楚能做多少"],
      },
      "warm-decliner": {
        en: ["Thanks for asking. I won’t be able to do it this time.", "Show goodwill", "Say no clearly"],
        zh: ["谢谢你想到我，这次我接不了。", "表达善意", "明确拒绝"],
        "zh-TW": ["謝謝你想到我，這次我沒辦法接。", "保留善意", "清楚拒絕"],
      },
      "rule-questioner": {
        en: ["Before I answer, how did we agree to share this out?", "Check the agreement", "Ask how tasks were assigned"],
        zh: ["我先确认一下，这件事原本是怎么分工的？", "核对约定", "先问分工"],
        "zh-TW": ["先確認一下，這件事原本怎麼分工？", "確認原本約定", "問清楚誰負責"],
      },
      "offstage-keeper": {
        en: ["I’m stepping away now. I’ll leave this conversation here.", "Pause the conversation", "Step back"],
        zh: ["我先下线了，这段先停在这儿。", "暂停讨论", "退出持续安排"],
        "zh-TW": ["我先離線，這段話題就先到這裡。", "暫停討論", "從安排中退一步"],
      },
      "line-rewriter": {
        en: ["I can make a cameo. I’m not taking a recurring role.", "Use light phrasing", "Keep the choice explicit"],
        zh: ["我可以客串一次，常驻角色就不接了。", "用轻松的话开场", "把选择说清楚"],
        "zh-TW": ["我可以客串一回，固定班底就先不加入。", "用輕鬆的話開場", "把選擇講清楚"],
      },
    },
  },
};

export function getArchiveExperience(slug: string) {
  return Object.hasOwn(archiveExperience, slug) ? archiveExperience[slug] : undefined;
}

export function getArchiveSnapshot(slug: string, id: string, locale: DisplayLocale) {
  const profiles = getArchiveExperience(slug)?.profiles;
  return profiles && Object.hasOwn(profiles, id) ? profiles[id]?.[locale] : undefined;
}
