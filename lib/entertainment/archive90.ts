import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type { DisplayLocale } from "@/lib/i18n/locales";

type Copy = Readonly<Record<DisplayLocale, string>>;
type Topic = { slug: string; label: Copy; detail: Copy; hint: Copy };

const eq = {
  slug: SCALE_CANONICAL_SLUG_MAP.EQ_60,
  label: { en: "Explore the emotional intelligence assessment", zh: "了解情商测评", "zh-TW": "了解情緒智力測驗" },
} as const;
const bigFive = {
  slug: SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
  label: { en: "Explore the Big Five personality assessment", zh: "了解大五人格测评", "zh-TW": "了解大五人格測驗" },
} as const;

const topics = {
  interaction: {
    ...eq,
    hint: {
      en: "Answer with one ordinary interaction in mind. Choose what you would actually do or say.",
      zh: "可以想起一次平常的相处，按自己当时可能会说或会做的事作答。",
      "zh-TW": "可以想著一次平常的互動，依自己當時可能會說的話、會做的事來答。",
    },
    detail: {
      en: "If you want to explore what you notice in conversations and how you respond to other people’s emotions, the emotional intelligence assessment offers a separate set of questions.",
      zh: "如果想进一步观察自己在对话里会注意什么、如何回应别人的情绪，可以另做情商测评。",
      "zh-TW": "如果想看看自己平常會留意哪些情緒線索、怎麼回應別人，可以另外做情緒智力測驗。",
    },
  },
  emotions: {
    ...eq,
    hint: {
      en: "Use the time frame in each question and think of an ordinary example you can recall comfortably.",
      zh: "按题目给出的时间范围作答，想一件你愿意回想的日常小事就好。",
      "zh-TW": "依題目指定的時間範圍來答，想一件你願意回想的日常小事就好。",
    },
    detail: {
      en: "If it would be useful, explore how you recognize and handle emotions in everyday situations through a separate emotional intelligence assessment.",
      zh: "如果你想多看看自己平时如何察觉、处理情绪，可以另做一份情商测评。",
      "zh-TW": "想多了解自己平常怎麼察覺、處理情緒時，可以另外做情緒智力測驗。",
    },
  },
  stories: {
    ...bigFive,
    hint: {
      en: "Put yourself in the scene and pick the response that feels natural to you.",
      zh: "把自己放进题目里的场景，选一个你觉得自然的做法。",
      "zh-TW": "把自己放進題目裡的情境，挑一個你覺得自然的做法。",
    },
    detail: {
      en: "If the story made you curious about your day-to-day habits with people or new situations, the Big Five offers a separate way to explore broader traits.",
      zh: "如果这些故事让你想到自己平常怎样与人相处、如何面对新情境，可以用大五人格测评另行了解这些特点。",
      "zh-TW": "如果故事讓你想起自己平常怎麼跟人相處、遇到新狀況會怎麼做，可以另外做大五人格測驗。",
    },
  },
  curiosity: {
    ...bigFive,
    hint: {
      en: "Choose what appeals to you in this question. It is fine if your preference changes in another setting.",
      zh: "按这道题里什么更吸引你来选，换个场合有不同偏好也很正常。",
      "zh-TW": "選這一題裡最吸引你的就好。換個場合有不同喜好也很自然。",
    },
    detail: {
      en: "The Big Five asks about broader patterns, including how you respond to unfamiliar ideas and experiences.",
      zh: "想看看自己平常怎么面对新想法和新体验，可以到大五人格测评里独立探索。",
      "zh-TW": "想知道自己平常怎麼看待新點子、新體驗，可以另外做大五人格測驗。",
    },
  },
  habits: {
    ...bigFive,
    hint: {
      en: "Think of what usually happens for you in the setting described on the page.",
      zh: "以题目描述的场景为准，按你平时通常会怎么做来答。",
      "zh-TW": "以題目描述的情境為準，照你平常大多會怎麼做來答。",
    },
    detail: {
      en: "A separate Big Five assessment can help you reflect on broader patterns in how you organize tasks, react to changes, or follow through.",
      zh: "想进一步了解自己平常怎样安排事情、应对变化或把任务做完，可以另做大五人格测评。",
      "zh-TW": "如果想知道自己平常怎麼安排事情、面對變動，或把事情做完，可以另外做大五人格測驗。",
    },
  },
  work: {
    slug: SCALE_CANONICAL_SLUG_MAP.RIASEC,
    label: { en: "Explore Holland career interests", zh: "了解霍兰德职业兴趣测评", "zh-TW": "了解何倫碼職涯興趣測驗" },
    hint: {
      en: "Work through the examples using the instructions on this page. You can review the guide after finishing.",
      zh: "按本页说明完成每道情境题。做完后可以回看对应指南。",
      "zh-TW": "依照這頁的說明完成各題。做完以後，可以再回頭看相關指南。",
    },
    detail: {
      en: "If you want to find out whether you would enjoy making this kind of activity part of your work, the Holland assessment explores different work interests independently.",
      zh: "如果想知道自己愿不愿意把这类活动当作日常工作，可以另做霍兰德测评，比较不同工作活动带给你的兴趣。",
      "zh-TW": "想知道自己願不願意把這類活動當作日常工作，可以另外做何倫碼測驗，比較對不同工作活動的興趣。",
    },
  },
  reasoning: {
    slug: SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN,
    label: { en: "Explore visual pattern reasoning", zh: "了解图形矩阵推理测评", "zh-TW": "了解圖形矩陣推理測驗" },
    hint: {
      en: "Use the instructions for each question and compare the information it gives you before choosing.",
      zh: "先看清每道题给出的条件，比较后再选。",
      "zh-TW": "先看清每題給的條件，比較之後再選。",
    },
    detail: {
      en: "If you would like to try reasoning in a visual format, the matrix assessment uses its own set of pattern problems.",
      zh: "如果想试试用图形来找关系和规律，可以另做图形矩阵推理。它使用独立的图形题。",
      "zh-TW": "想試試從圖形找關係、找規律，可以另外做圖形矩陣推理，題目會另外提供。",
    },
  },
} satisfies Record<string, Topic>;

// Fixed entries from the first 90-test archive release.
const cohort: Readonly<Partial<Record<string, keyof typeof topics>>> = {
  "ai-literacy": "work",
  "apocalypse-survival-type-test": "stories",
  "avatar-bender-quiz": "stories",
  "breakup-reflection-test": "interaction",
  "capacity-to-love-test": "interaction",
  "care-feelings-reflection": "emotions",
  "competency-test": "work",
  "conflict-boundary-behaviors-test": "interaction",
  "connection-belonging-check-in": "interaction",
  "coping-rhythm-test": "emotions",
  "culture-fit": "work",
  "customer-service-aptitude": "work",
  "dark-tetrad-sd4": "interaction",
  "dark-triad": "interaction",
  "dating-outlook": "interaction",
  "decade-aesthetic-test": "curiosity",
  "delulu-test": "curiosity",
  "digital-ethics-citizenship": "work",
  "distributed-work-choices": "work",
  "egogram": "interaction",
  "emotions-connections-reflection": "interaction",
  "empathy": "interaction",
  "energy-flow": "habits",
  "eq-dashboard": "interaction",
  "eras-of-you-test": "curiosity",
  "euphoria-character-quiz": "stories",
  "everyday-control-style": "interaction",
  "excel-skills": "work",
  "feedback-self-worth-reflection": "emotions",
  "freelance-ready": "work",
  "ginny-and-georgia-character-quiz": "stories",
  "grit-test": "habits",
  "growth-mindset-fixed-mindset": "habits",
  "habit-patterns-test": "habits",
  "holding-yourself-back": "habits",
  "hundred-acre-wood-friend-quiz": "stories",
  "imposter-syndrome": "emotions",
  "inner-critic-voice-test": "emotions",
  "intelligence-type-test": "reasoning",
  "interpersonal-preferences": "interaction",
  "java-test": "work",
  "javascript-test": "work",
  "jealousy-scale": "interaction",
  "learning-style": "habits",
  "light-triad-test": "interaction",
  "locus-of-control": "habits",
  "mechanical-reasoning": "reasoning",
  "mote-type": "interaction",
  "multiple-intelligences": "reasoning",
  "outfit-line-preferences": "curiosity",
  "perfectionism": "habits",
  "pressure-response-actions": "habits",
  "procrastinator-type-test": "habits",
  "project-management": "work",
  "python-test": "work",
  "relationship-habits": "interaction",
  "relationship-worry-habits": "interaction",
  "remote-work": "work",
  "sdt-motivation": "habits",
  "self-compassion": "emotions",
  "self-esteem": "emotions",
  "skills-audit": "work",
  "social-attitudes-reflection": "interaction",
  "social-context-reflection": "interaction",
  "social-intelligence-test": "interaction",
  "soldier-poet-king-quiz": "stories",
  "spatial-reasoning": "reasoning",
  "sql-test": "work",
  "star-wars-character": "stories",
  "sternberg-love": "interaction",
  "stress-response-patterns-test": "emotions",
  "style-impression-preferences": "curiosity",
  "tech-savvy": "work",
  "time-management": "habits",
  "tipi-10": "habits",
  "toxic-positivity-test": "interaction",
  "toxic-trait": "interaction",
  "trust-issues-test": "interaction",
  "type-ab": "habits",
  "uncertainty-ease-reflection": "habits",
  "values-assessment": "work",
  "verbal-reasoning": "reasoning",
  "watson-glaser-practice-test": "reasoning",
  "wednesday-addams-character": "stories",
  "work-activity-interests": "work",
  "work-ethics": "habits",
  "work-role-reflection": "work",
  "work-traits-reflection": "work",
  "workplace-technology": "work",
  "written-coordination-practice": "work",
};

export function archive90Topic(slug: string): Topic | undefined {
  const key = Object.hasOwn(cohort, slug) ? cohort[slug] : undefined;
  return key ? topics[key] : undefined;
}
