import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const ESTP_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先看现场、机会和可立刻撬动的动作，再决定要不要全力推进。外界常先感受到你的冲劲和反应快，真正稳定的是你对现实杠杆的敏感。",
  intro: [
  "ESTP 往往擅长在变化里迅速看清哪里能动、哪里能谈、哪里能先拿到结果。你不喜欢空转，更愿意直接进现场，把局面从犹豫拉到行动。",
  "这让你在谈判、推进、现场应变和试错型场景里很有优势，也会让你对拖沓流程、缓慢确认和长期纯理论讨论更敏感。对你来说，机会最好能马上摸到。"
],
  traits: {
    eyebrow: "人格概览",
    title: "行动感很强",
    value: "先看哪里能动",
    body: "你更信任现场反馈、速度和可直接撬动局面的动作。",
    paragraphs: [
  "你通常不会长期停在概念和假设里，而是更自然地回到现实场景：现在哪里能试、谁能谈、什么动作能先带来结果。这个特质让你在高变化环境里很有穿透力。",
  "但如果环境只允许慢速确认、反复汇报和长期不落地，你会明显掉耐心。你需要的不只是自由，而是能快速试、快速看结果的空间。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业上，你很适合那些需要现场推进、快速谈判、即时调整和结果反馈的角色。你不一定喜欢被流程包得太死，但很擅长在变化里拿到实际进展。",
  "真正适合你的岗位，通常允许你接近一线、接近资源和接近决策，而不是长期困在缓慢确认和低动作密度的环境里。"
],
      influentialTraits: [
          { label: "行动", colorKey: "blue", body: "先把局面推起来" },
          { label: "应变", colorKey: "gold", body: "现场会转向" },
          { label: "谈判", colorKey: "green", body: "敢去拿结果" },
          { label: "试错", colorKey: "purple", body: "不怕先试一版" }
        ],
      strengths: [
          { title: "现场推进强", body: "你能把犹豫中的局面迅速拉向行动。" },
          { title: "快速试错", body: "你愿意先试一版再看反馈，不会只等完美方案。" },
          { title: "谈判应变快", body: "面对变化和对手时，你通常能迅速换打法。" },
          { title: "结果感明确", body: "你很知道什么动作能先带来真实进展。" },
          { title: "行动号召强", body: "你能让现场的人更快进入执行状态。" },
          { title: "风险承受高", body: "在很多人还在观望时，你敢先上场试。" }
        ],
      weaknesses: [
          { title: "后续收口弱", body: "先冲出去很强，但长期收尾未必同样稳定。" },
          { title: "慢协作烦躁", body: "面对缓慢确认和长链路沟通时，你容易失耐心。" },
          { title: "忽略细节后果", body: "如果只盯眼前推进，后段成本可能被低估。" },
          { title: "刺激依赖高", body: "低变化和低反馈环境会快速削弱你的投入感。" },
          { title: "长期规划弱", body: "你更擅长先拿结果，而不一定先搭长线结构。" },
          { title: "压强偏大", body: "推进太快时，别人可能先感受到被冲着走。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位最能放大你的现场推进、谈判与应变能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种动作密度、决策速度和授权边界里最稳。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是再更敢一点，而是让行动优势接上长期节奏。你已经很会抓机会，下一步更关键的是决定哪些机会值得继续押注，哪些应该及时止损。",
  "当你愿意为自己建立一点复盘和后续收束机制，很多短期爆发会开始变成更稳定的结果，而不是总停在下一次刺激来临之前。"
],
      influentialTraits: [
          { label: "抓机会", colorKey: "blue", body: "先看能动哪里" },
          { label: "止损", colorKey: "gold", body: "学会及时收手" },
          { label: "复盘", colorKey: "green", body: "别只顾下一场" },
          { label: "节奏", colorKey: "purple", body: "让结果能续上" }
        ],
      strengths: [
          { title: "行动恢复快", body: "只要重新进入现场，你通常很快回到状态。" },
          { title: "反馈利用强", body: "你能迅速从结果里修正下一步动作。" },
          { title: "不怕试错", body: "很多人犹豫时，你敢先试出可行边界。" },
          { title: "压力中能动", body: "高压局面反而容易让你更集中。" },
          { title: "现实感强", body: "你能迅速判断一件事目前的真实杠杆在哪里。" },
          { title: "止损意识不差", body: "当你愿意停下看局势时，通常能及时换路。" }
        ],
      weaknesses: [
          { title: "后续跟进弱", body: "问题一旦进入维护期，你的兴奋度会明显下降。" },
          { title: "刺激偏好高", body: "高变化会点亮你，也可能让你更难长期收束。" },
          { title: "复盘排后面", body: "你更想去下一场，而不是先整理上一场。" },
          { title: "计划感不足", body: "没有明确外部节点时，你不一定会先搭长期节奏。" },
          { title: "忽略身体成本", body: "你可能在状态很满时继续加码，之后才发现透支。" },
          { title: "边界容易靠现场决定", body: "当机会很多时，你不一定会先守住自己的节奏。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些节奏、反馈和复盘方式最能让你的行动优势留得住。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些刺激依赖和后续收束不足最容易拖慢长期结果。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你更看重真实、直接、有感觉的互动。你不喜欢过度拧巴，也不喜欢把关系经营成一堆没动作的承诺。对你来说，亲密最好能活在现实里。",
  "你能给关系带来行动感和活力，但如果只顾现场强度，不顾长期承接，对方可能会觉得你很有吸引力，却不够稳定。"
],
      influentialTraits: [
          { label: "直接", colorKey: "blue", body: "喜欢当场说清" },
          { label: "行动", colorKey: "gold", body: "会用动作表达" },
          { label: "活力", colorKey: "green", body: "关系要有现场感" },
          { label: "边界", colorKey: "purple", body: "不爱被拖着走" }
        ],
      strengths: [
          { title: "现场感强", body: "你很擅长把关系带回真实、直接和有回应的状态。" },
          { title: "行动表达快", body: "很多在意你会直接用动作表现出来。" },
          { title: "不拧巴", body: "你不喜欢把简单问题绕成复杂心结。" },
          { title: "遇事敢处理", body: "关系出现现实问题时，你更愿意先动手解决。" },
          { title: "活力很足", body: "你能让一段关系保持明显的存在感和新鲜感。" },
          { title: "边界清楚", body: "你通常知道什么会让自己立刻掉耐心。" }
        ],
      weaknesses: [
          { title: "稳定承接少", body: "如果关系进入长期维护期，你不一定同样有劲。" },
          { title: "表达压强大", body: "你想快点解决问题时，对方可能先感到被推。" },
          { title: "耐心不足", body: "对反复拉扯和慢速沟通的耐心通常不高。" },
          { title: "承诺节奏快慢不稳", body: "现场很热时，你的投入可能先于长期判断。" },
          { title: "情绪讨论偏短", body: "你更愿意处理现实问题，而不是长时间谈感受。" },
          { title: "容易先去下一场", body: "关系里一些需要慢慢养成的部分，你未必有耐心。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最稳定的直接感、行动力与现场吸引力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些承接不足和表达压强最容易让关系失衡。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的行动优势接到长期结果上",
    body: "解锁后可继续查看更细的职业路径、成长节奏与关系盲点，让速度不再只停在眼前推进。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与真实动作入口。",
  },
});

export default ESTP_ZH_CONTENT;
