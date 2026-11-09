import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "deadpan": {
    "zh": "冷面表达以平静口吻制造反差。比较口吻、字面意思与语境怎样一起形成幽默，并观察文字消息缺少表情线索时的误读。",
    "en": "Deadpan uses a calm delivery to create contrast. Explore how tone, literal meaning and context work together, and how written messages can lose facial and vocal cues."
  },
  "wordplay": {
    "zh": "文字巧思利用双关、词义与声音的转换。通过原创例子区分理解文字游戏、喜欢文字游戏与自己使用它，并留意跨语言表达的差异。",
    "en": "Wordplay turns on meanings, sounds and verbal contrasts. Distinguish understanding, enjoying and using a wordplay example, and consider what changes across languages."
  },
  "absurdist": {
    "zh": "荒诞联想把普通事物放进不合常理的想象。阅读夸张、拟人与意外组合的例子，区分玩笑中的虚构设定与真实观点。",
    "en": "Absurdist expression gives ordinary things an unexpected imaginary setting. Explore exaggeration, personification and unlikely combinations while separating a fictional joke premise from a real belief."
  },
  "shared-humor": {
    "zh": "共同趣味借助熟悉的经历、细节与共同背景。看看怎样补充必要语境，让新加入的人也能理解，而不把内部笑点当成排除他人的理由。",
    "en": "Shared humor draws on familiar experiences, details and common context. Explore how to supply enough background for a newcomer without turning an inside joke into a reason to exclude someone."
  },
  "self-deprecating": {
    "zh": "自嘲表达以自己的小失误作为笑点。比较自愿分享、真实自责与不愿被别人重复的边界，用具体事件理解表达，而不据此推断自尊或动机。",
    "en": "Self-deprecating expression makes a small personal mishap the subject of a joke. Compare voluntary sharing, actual self-criticism and limits on others repeating it, without inferring self-esteem or motives."
  },
  "banter": {
    "zh": "机锋打趣依赖来回回应与双方愿意参与。通过接话、停下和认真说明的情境，观察互相打趣怎样与单方面挖苦、持续施压区别开来。",
    "en": "Banter depends on back-and-forth replies and willing participation. Explore joining in, stopping and speaking seriously to distinguish reciprocal teasing from one-sided ridicule or continued pressure."
  }
};

export function humorLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function humorCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("HSQ、漫画风格研究与本站题本：证据怎样区分？", "HSQ、幽默表达风格研究与本站题本：证据怎样区分？")
      .replace("只有主动保存才在本标签页保留24小时草稿，完成、清除或重测即删除；", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("主动保存才有本标签页24小时草稿，完成、清除或重测即删；", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
    : text
      .replace("Only explicit saving creates a 24-hour draft in this tab, cleared on completion, clearing or retake.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Explicit saving creates a 24-hour tab draft, cleared on completion, clearing or retake.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.");
}
