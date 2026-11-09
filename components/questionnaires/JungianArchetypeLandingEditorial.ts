import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  innocent: { zh: "从简单可信的开始方式理解本次选择。以新活动的安排为例，比较希望、安心感与必要核对；纯真者不表示缺少经验或更高道德价值。", en: "Explore the appeal of a simple, trustworthy beginning. A new activity illustrates hope, reassurance and necessary checks. Innocent does not imply inexperience or superior moral worth." },
  sage: { zh: "想先把问题弄明白，还是亲自去发现？围绕可靠解释与概念区别，比较智者和探索者，并观察何时已有足够信息可以尝试一步。", en: "Would you rather clarify a question or discover something firsthand? Compare Sage with Explorer through reliable explanations and conceptual distinctions, including when enough information is available to try a step." },
  explorer: { zh: "亲自接触未知与保留自主空间的线索。比较探索者、智者与反叛者的不同投入理由，思考怎样把发现转成一次能完成的小体验。", en: "Examine firsthand discovery and room for autonomy. Compare Explorer, Sage and Rebel as different reasons to engage, then turn discovery into one small, finishable experience." },
  rebel: { zh: "默认期待不合适时，愿意把它重新拿出来讨论。阅读质疑、提出替代办法与共同约定的取舍，区分改变安排和单纯反对他人。", en: "When an expectation feels unsuitable, bring it back into discussion. Explore questioning, alternatives and agreements, distinguishing a proposed change from opposing someone for its own sake." },
  magician: { zh: "从已有元素中看见另一种组合。以兴趣活动里的重新连接为例，比较魔法师与创造者；这里的转化是动机比喻，不是神秘能力。", en: "Notice a different combination of existing elements. An interest activity illustrates recombination and its distinction from Creator. Transformation here is a motivational metaphor, not a supernatural ability." },
  hero: { zh: "面对有难度的部分，愿意通过练习投入。阅读挑战如何吸引参与，也留意任务难度、休息与求助；本次高计数不证明更有勇气或更能成功。", en: "Engage with a demanding part through practice. Explore the appeal of challenge alongside difficulty, rest and help. A high count does not establish greater courage or a higher chance of success." },
  lover: { zh: "愿意把注意力投入在意的人、事物与体验。比较专注联结与照顾具体需要，观察表达是否符合双方意愿；恋人原型不限于恋爱关系。", en: "Give attention to people, activities and experiences that matter. Compare attentive connection with meeting a concrete need, including whether expression suits both people. Lover is not limited to romance." },
  jester: { zh: "在合适的场合为玩趣和轻松留位置。围绕共同活动，阅读怎样邀请参与、察觉玩笑是否合适，同时给认真表达留出空间。", en: "Make room for play and lightness when appropriate. A shared activity illustrates inviting participation, checking whether humour fits and leaving space for serious expression." },
  everyperson: { zh: "关注不必特别出众也能自然参与的共同感。比较归属、真实偏好与自主选择；平凡者是原型名称，不是社会地位或能力评价。", en: "Explore belonging through ordinary participation without needing to stand out. Compare inclusion, genuine preferences and autonomy. Everyperson is a theme name, not a social-status or ability rating." },
  caregiver: { zh: "愿意把支持落到具体需要。通过先询问再协助的例子，比较照顾者与恋人，并说清时间和余量；照顾不以承担全部责任为标准。", en: "Connect support to a specific need. An example of asking before helping distinguishes Caregiver from Lover and clarifies time and capacity. Caring does not require taking every responsibility." },
  ruler: { zh: "希望资源、责任和决定衔接清楚。阅读共同安排中的组织动机，比较明确分工与为他人保留选择；不从计数推断领导能力或权力地位。", en: "Seek clear connections among resources, responsibilities and decisions. Explore organisation in a shared arrangement, balancing task clarity with others’ choices. Counts establish neither leadership skill nor power." },
  creator: { zh: "愿意把构想做成自己的表达。以小作品或草稿为例，比较创造者、魔法师与英雄的不同侧重，尝试在完成与继续修改之间作出取舍。", en: "Give an idea an expression of your own. A small work or draft distinguishes Creator from Magician and Hero, including the tradeoff between finishing and continuing to revise." },
};

export function jungianArchetypeLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function jungianArchetypeCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("默认不保存答案，仅主动开启时保留本标签页24小时草稿；完成、清除或重测删除。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("只有主动开启才保存本标签页24小时草稿，完成、退出清除或重测即删除。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("重测会开始新的作答并清除当前草稿，本站不建立个人历史；", "重测会开始新的作答，本站不建立个人历史；")
      .replace("重测开始新作答并清除当前草稿，不建立个人历史。", "重测开始新的作答，不建立个人历史。")
    : text
      .replace("Saving is off by default; an optional draft lasts 24 hours in this tab and is removed on completion, clearing or retaking.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("An optional draft lasts 24 hours in this tab and is removed on completion, exit-and-clear or retaking.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Retaking starts a new attempt and clears the current draft; no personal history is built here.", "Retaking starts a new attempt without keeping a personal history.")
      .replace("Retaking starts a new attempt and clears the current draft, without creating a personal history.", "Retaking starts a new attempt without keeping a personal history.");
}
