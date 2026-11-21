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
};

export function getArchiveExperience(slug: string) {
  return Object.hasOwn(archiveExperience, slug) ? archiveExperience[slug] : undefined;
}

export function getArchiveSnapshot(slug: string, id: string, locale: DisplayLocale) {
  const profiles = getArchiveExperience(slug)?.profiles;
  return profiles && Object.hasOwn(profiles, id) ? profiles[id]?.[locale] : undefined;
}
