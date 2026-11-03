import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "chiikawa": {
    "zh": "从自由参加的小展示出发，说明怎样按自己的速度加入。用具体说法、适用例子与反例，比较参与节奏和其他五种选择。",
    "en": "Explore joining a small optional display at your own pace. Wording, fitting examples and counterexamples compare participation pace with five other approaches."
  },
  "hachiware": {
    "zh": "把一个普通物件的意思一起说清，再确认理解是否相同。完整例子比较共同说明、个人愿望和经验分享。",
    "en": "Put the meaning of an ordinary object into words together, then check understanding. Full examples compare shared explanation, personal wishes and experience sharing."
  },
  "usagi": {
    "zh": "从一张废纸试出意外的小形状，看看玩法怎样展开。用具体场景区分即兴尝试、留意舒适与分享已有方法。",
    "en": "Try an unexpected shape with scrap paper and see how play unfolds. Concrete situations distinguish spontaneous trials, noticing comfort and sharing an existing method."
  },
  "momonga": {
    "zh": "从共同选择小纪念物看怎样说清自己的愿望，也给不同回应留空间。通过例子比较表达愿望与替别人作决定。",
    "en": "Explore stating a wish while leaving room for differing responses in a keepsake choice. Examples distinguish expressing a preference from deciding for someone else."
  },
  "kurimanju": {
    "zh": "放慢一点，留意普通风景和身边物件的细节。通过安静共享的例子，区分细品当下、参与节奏与创造新玩法。",
    "en": "Slow down to notice details in a view or nearby object. Quiet-sharing examples distinguish savouring the moment, participation pace and inventing new play."
  },
  "rakko": {
    "zh": "把亲自试过的一种普通材料用法说明白，交代适用条件，再由对方选择。比较经验分享、共同澄清和现场尝试。",
    "en": "Explain an ordinary material use you have tried, including its conditions, and let others choose. Compare sharing experience, clarifying together and trying something new."
  }
};

/** Entry summaries only; source-bound full reports remain unchanged. */
export function chiikawaLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en"): string {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
