import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

// Public entry descriptions; source-bound report bodies remain unchanged.
const summaries: Record<string, { zh: string; en: string }> = {
  "lawful-good": {
    zh: "一致准则与顾及他人相交：用共同约定保护参与者，也核对既有程序是否真的减少了伤害。比较中立善良与守序中立，理解原则和具体需要之间的取舍。",
    en: "Consistent principles meet concern for others: use agreements to protect participants, then check whether a procedure actually reduces harm. Compare Neutral Good and Lawful Neutral when a code and a specific need pull apart.",
  },
  "neutral-good": {
    zh: "关注帮助是否回应了真实需要，具体办法随情境调整。阅读如何区分有效支持与未经询问的代劳，并比较守序善良、混乱善良对规则的不同侧重。",
    en: "Attend to whether help meets a stated need while adapting the method to the situation. Distinguish useful support from taking over without asking, and compare how Lawful Good and Chaotic Good approach rules.",
  },
  "chaotic-good": {
    zh: "自主判断与顾及他人相交：既有办法不合适时寻找替代路径，同时说明改变会影响谁。阅读自主行动、共同约定与征求同意之间的具体取舍。",
    en: "Autonomous judgment meets concern for others: find another route when an established method falls short, while identifying who a change affects. Explore the tradeoffs among initiative, agreements and consent.",
  },
  "lawful-neutral": {
    zh: "从一致准则理解选择，另一轴处于中间显示区。以临时更改流程为例，比较可预期的程序与个别需要；中立计数不证明冷漠，也不让规则自动成为正确答案。",
    en: "Read a preference for consistent codes alongside a central band on the other axis. A process change illustrates predictability versus individual needs. A neutral count establishes neither indifference nor that a rule is automatically right.",
  },
  "true-neutral": {
    zh: "两轴都位于中间显示区。查看相同计数如何来自不同选择，以具体事件辨别情境调整、暂缓判断与取舍；绝对中立不是道德平均分或完美平衡的证明。",
    en: "Both axes select their central bands. Explore how different choices yield the same counts, then distinguish adaptation, withholding judgment and tradeoffs through actual events. True Neutral is neither an average morality score nor proof of perfect balance.",
  },
  "chaotic-neutral": {
    zh: "以自主选择为观察入口，另一轴位于中间区。比较个人余地与他人对约定的合理预期，阅读怎样提前说明变化；“混乱”不表示失控或免于承担后果。",
    en: "Begin with autonomous choices and a central band on the other axis. Compare personal latitude with others’ reasonable expectations of an agreement, including how to explain changes early. Chaotic does not mean losing control or escaping consequences.",
  },
  "lawful-evil": {
    zh: "阅读一致准则与容许他人承担代价的选项如何相交。通过规则使用与责任归属的例子，核对谁获益、谁付出；这是本版映射，不是对真人品格的判决。",
    en: "Examine how consistent-code choices intersect with options permitting costs to others. Examples of rule use and responsibility ask who benefits and who pays. This edition’s mapping is not a verdict on a real person’s character.",
  },
  "neutral-evil": {
    zh: "秩序轴位于中间区，另一轴更常选择保留自身好处而让别人承担代价的选项。阅读信息说明、责任与同意的例子，区分这类行为条件和合理自我照顾。",
    en: "Order falls in the central band while the other tally favours retaining an advantage at someone else’s cost. Examples about disclosure, responsibility and agreement distinguish those conditions from legitimate self-care.",
  },
  "chaotic-evil": {
    zh: "自主判断与容许他人承担代价的选项相交。阅读本版计数、角色术语与实际行为之间的区别：问卷未评估SRD相关描述中的暴力，名称不能推断危险性。",
    en: "Autonomous-judgment choices intersect with options permitting costs to others. Separate this quiz’s counts, fictional terminology and actual conduct: the items do not assess the violence in the relevant SRD description, so the label cannot establish dangerousness.",
  },
};

export function moralAlignmentLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function moralAlignmentCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("默认不保存；只有主动开启才保存本标签页24小时草稿，完成、退出清除或重测即删除。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("重测会开始新的作答并清除当前草稿，不建立个人历史。", "重测会开始新的作答，不建立个人历史。")
    : text
      .replace("Saving is off by default. If enabled, a draft lasts 24 hours in this tab; completion, exit-and-clear or retaking deletes it.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Retaking starts a new attempt and clears the current draft, without building a personal history.", "Retaking starts a new attempt without keeping a personal history.");
}
