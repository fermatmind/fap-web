import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "ichigo-kurosaki": {
    "zh": "整理普通图片前，说明自己愿意帮的部分与可用时间。比较帮助范围、自选约定和对方意愿，让投入可以重新商量。",
    "en": "Before arranging ordinary pictures, state the part you want to help with and available time. Compare help limits, chosen commitments and others’ choices, with room to renegotiate."
  },
  "rukia-kuchiki": {
    "zh": "向愿意听的朋友分步介绍笔记做法。比较说明步骤、检查分类和试做样本，并根据对方反馈调整解释。",
    "en": "Explain a note-taking approach step by step to a willing friend. Compare procedures, grouping frames and prototypes, adjusting to actual feedback."
  },
  "sosuke-aizen": {
    "zh": "重新看看普通图片最初的分类依据。比较重看框架、解释现有步骤和小样试做，保留能支持或修正分类的例子。",
    "en": "Reconsider the initial grouping of ordinary pictures. Compare reframing, explaining existing steps and prototyping, keeping examples that support or revise the grouping."
  },
  "byakuya-kuchiki": {
    "zh": "为自愿小活动说清接受的约定与结束条件。比较承诺、具体帮助范围和参与选择，约定也可以重新协商。",
    "en": "Clarify accepted commitments and endpoints in a voluntary activity. Compare commitments, help limits and participation, with room to renegotiate."
  },
  "orihime-inoue": {
    "zh": "介绍一种普通做法前，先问对方想听哪里。比较给人选择、解释步骤和说明自己的范围，让双方都有暂停空间。",
    "en": "Before introducing an ordinary approach, ask what the other person wants to hear. Compare choice, explanation and your own limits, leaving both people room to pause."
  },
  "kisuke-urahara": {
    "zh": "把普通小册子的想法先做成一页可改样本。比较试做、重看分类和有界挑战，用实际反馈决定下一步。",
    "en": "Make a one-page revisable prototype for an ordinary booklet. Compare trials, grouping frames and bounded challenges, using feedback to decide the next step."
  },
  "kenpachi-zaraki": {
    "zh": "为一个普通兴趣自选能随时停的小挑战。比较挑战程度、小样试做和帮助范围，难度与目标都可以调整。",
    "en": "Choose a stoppable small challenge for an ordinary interest. Compare challenge level, prototypes and help limits, with room to adjust difficulty and aims."
  }
};

/** Entry summaries only; source-bound full reports remain unchanged. */
export function bleachLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en"): string {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
