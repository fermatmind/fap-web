import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";
import type { StrengthWeaknessBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

// Local editorial candidate for ISFJ-A. This does not replace published CMS content.
const candidate: Record<"career" | "growth" | "relationships", {
  strengths: StrengthWeaknessBlock;
  weaknesses: StrengthWeaknessBlock;
}> = {
  career: {
    strengths: { title: "你的强项", items: [
      { title: "细心周全", description: "你习惯留意容易漏掉的细节，让交接和后续工作少一些疏漏。" },
      { title: "认真履约", description: "答应的任务，你愿意持续跟进，不轻易把收尾留给别人。" },
      { title: "务实助人", description: "同事遇到困难时，你更愿意提供具体帮助，让事情继续往前走。" },
      { title: "善用经验", description: "你重视已经验证过的做法，愿意把有用的经验带进下一次任务。" },
      { title: "耐心跟进", description: "需要反复说明或核对的工作，你愿意留出时间，把关键环节理清。" },
      { title: "顾及协作", description: "安排工作时，你会考虑同事需要哪些信息，让彼此配合更顺畅。" },
    ] },
    weaknesses: { title: "你的短板", items: [
      { title: "不爱展示成果", description: "你可能更习惯把事情做好，却很少主动说明自己的贡献与付出。" },
      { title: "容易额外承担", description: "看到有人需要帮忙，你可能先接下来，之后才发现自己的任务已被挤占。" },
      { title: "适应变化较慢", description: "熟悉的流程突然调整时，你可能需要更多背景和准备，才能重新找到节奏。" },
      { title: "不愿直接拒绝", description: "为了维持合作气氛，你可能答应超出精力范围的请求。" },
      { title: "细节占用太久", description: "你可能反复完善已经够用的部分，留给更重要事项的时间反而变少。" },
      { title: "异议表达较晚", description: "安排不合适时，你可能先配合再消化不满，让别人以为你没有意见。" },
    ] },
  },
  growth: {
    strengths: { title: "你的强项", items: [
      { title: "循序渐进", description: "你愿意从能做到的小事开始，用持续练习慢慢积累变化。" },
      { title: "认真投入", description: "认定一件事值得做后，你愿意为它留出时间，而不只停在一时兴起。" },
      { title: "重视经验", description: "你会回看哪些做法确实有帮助，再把它们用到下一次尝试中。" },
      { title: "落实想法", description: "比起只想象改变，你更愿意找到一个具体步骤，让计划进入日常。" },
      { title: "经营日常", description: "你重视熟悉的生活节奏，愿意通过小习惯维持重要的事。" },
      { title: "留心他人", description: "你愿意了解身边人的处境，也能从共同经历中发现新的看问题方式。" },
    ] },
    weaknesses: { title: "你的短板", items: [
      { title: "自己总排最后", description: "把别人的需要照顾好之后，你可能已经没有精力安排自己的兴趣。" },
      { title: "情绪留在心里", description: "即使感到委屈或疲惫，你也可能继续处理事务，很少说出真实感受。" },
      { title: "难以放松标准", description: "觉得自己还能再做一点时，你可能很难认可已经完成的部分。" },
      { title: "只选熟悉路径", description: "新尝试尚未证明有用时，你可能先退回稳妥的旧办法，错过探索机会。" },
      { title: "求助时机较晚", description: "你可能想先自己解决，直到负担明显加重，才让别人知道你需要支持。" },
      { title: "休息仍在忙碌", description: "空下来时，你可能又开始照料别人或补做杂事，没有真正留出恢复的时间。" },
    ] },
  },
  relationships: {
    strengths: { title: "你的强项", items: [
      { title: "记得小事", description: "对方随口提过的喜好和需要，你愿意记在心里，在日常相处中回应。" },
      { title: "用行动关心", description: "你喜欢用一件具体的小事表达在乎，让支持落在对方的真实生活里。" },
      { title: "珍惜约定", description: "对共同定下的安排，你愿意认真对待，让相处有可以期待的节奏。" },
      { title: "耐心陪伴", description: "亲近的人遇到难处时，你愿意留出时间听他们说，而不急着结束话题。" },
      { title: "顾及感受", description: "你在意自己的话会怎样被听见，愿意用较温和的方式讨论分歧。" },
      { title: "经营共同生活", description: "你愿意维护双方珍惜的小习惯，让关系在一次次相处中积累熟悉感。" },
    ] },
    weaknesses: { title: "你的短板", items: [
      { title: "期待没有说清", description: "你可能希望对方主动看见你的需要，却没有告诉他们怎样回应才有帮助。" },
      { title: "回避直接冲突", description: "为了维持平静，你可能暂时不谈不满，让同一个问题反复出现。" },
      { title: "关心变成包办", description: "你可能替对方安排太多，既累到自己，也减少了对方选择和参与的机会。" },
      { title: "难以更新习惯", description: "一直有效的相处方式，你可能默认不必再问，忽略了彼此已经变化的需要。" },
      { title: "把付出当默契", description: "你可能用继续多做一点代替沟通，期待对方从行动中猜出你的心意。" },
      { title: "边界说得太晚", description: "你可能先答应再勉强维持，直到很疲惫时才说明自己不能继续承担。" },
    ] },
  },
};

export function previewStrengths(data: PersonalityDesktopCloneContentPayload): PersonalityDesktopCloneContentPayload {
  if (data.fullCode !== "ISFJ-A") return data;
  return { ...data, content: { ...data.content, chapters: {
    ...data.content.chapters,
    career: { ...data.content.chapters.career, ...candidate.career },
    growth: { ...data.content.chapters.growth, ...candidate.growth },
    relationships: { ...data.content.chapters.relationships, ...candidate.relationships },
  } } };
}
