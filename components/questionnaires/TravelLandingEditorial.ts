import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "wanderer": {
    "zh": "随兴漫游：在必要安排之外留出现场选择。用半日出游的例子比较开放时段与持续临时协调，试着说清想保留的弹性、会合约定和改变计划的通知方式。",
    "en": "Wandering: preserve decisions on arrival alongside necessary arrangements. Compare open time with repeated on-the-spot coordination, and clarify flexibility, meeting commitments and how changes will be communicated."
  },
  "planner": {
    "zh": "行程规划：把重点、路线与时间整理成可讨论的安排。区分必须确认、想要保留与可以调整的部分，比较计划留白和排满日程，并明确谁承担查询与预订。",
    "en": "Planning: organise priorities, routes and timing into a draft people can discuss. Separate requirements, wishes and adjustable parts, compare planned open time with a full schedule, and agree research and reservation responsibilities."
  },
  "culture": {
    "zh": "文化探索：围绕地方故事、历史和文化表达多了解一步。比较看得多与理解一个主题的取舍，用具体问题准备参观，并为同行者不同的阅读兴趣和停留时间留出空间。",
    "en": "Cultural exploration: follow a local story, history or cultural expression further. Compare covering many stops with understanding one theme, prepare a specific question and make room for companions’ different interests and visiting pace."
  },
  "outdoors": {
    "zh": "户外体验：把适合自己的参与过程放进旅程。区分活动兴趣、参与条件与强度，讨论哪些环节可选、如何保留休息；不必通过冒险或超出能力来证明偏好。",
    "en": "Outdoor exploration: make suitable participation part of the trip. Distinguish interest, participation requirements and intensity, discuss optional activities and rest, and avoid treating risk or exceeding ability as proof of a preference."
  },
  "rest": {
    "zh": "休闲放松：为舒适停留和不连续转场保留时间。辨别想少移动、少做决定或减少信息输入的具体需要，把休息变成可协商的安排，而不是等其他活动结束后的剩余时间。",
    "en": "Rest: protect comfortable pauses and time without moving between stops. Clarify whether you want less movement, fewer decisions or less information, and make rest an agreed arrangement rather than leftover time after other activities."
  },
  "food": {
    "zh": "饮食体验：让品尝、食材、做法或地方背景成为旅程内容。分清最想保留的是特定体验还是从容用餐，协商饮食需要、等待与时间；不同选择不需要用消费或口味排高低。",
    "en": "Food exploration: make tasting, ingredients, preparation or local context part of the trip. Clarify whether a specific experience or an unhurried meal matters, discuss dietary needs and time, and avoid ranking tastes or spending."
  }
};

export function travelLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
