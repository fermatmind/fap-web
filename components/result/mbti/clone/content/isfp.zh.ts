import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const ISFP_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先感受一件事是否顺、是否真、是否值得，再决定如何靠近。外界常先感受到你的安静和柔和，真正稳定的是你对真实感和细微差别的判断。",
  intro: [
  "ISFP 更习惯从感受、体验和具体的人出发判断，而不是先套入一套高压标准。你会自然留意哪些东西让人舒服、哪些边界被忽视、哪些安排看似合理却已经开始消耗。",
  "这让你在审美、体验、细节打磨和低压合作里很有优势，也会让你对粗暴推进、强管控和持续高曝光更敏感。对你来说，顺不只是舒服，更是正确。"
],
  traits: {
    eyebrow: "人格概览",
    title: "感受很细",
    value: "先看是否顺",
    body: "你更信任真实体验、细微差别和当下感受给出的信息。",
    paragraphs: [
  "你通常不会先用一套抽象标准判断所有事情，而会先看人与场景本身是不是自然、是不是被尊重、是不是还有空间保留真实自己。这个判断让你在很多体验型和创作型场景里很敏锐。",
  "但如果环境长期要求你快、硬、强曝光，或者不断压着感受去做不认同的事，你会明显掉能量。你需要的不只是自由，而是允许自己按真实节奏生活。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业场景里，你更适合那些允许你做细节、做体验、做真实表达，并且不过度高压暴露的角色。你不一定喜欢强竞争，但很擅长把很多具体的感受和判断做成可见结果。",
  "真正适合你的工作，通常允许你按节奏深入、按感觉打磨，而不是被迫长期在高噪音里持续自我推销。对你来说，环境是否舒服会直接影响产出质量。"
],
      influentialTraits: [
          { label: "审美", colorKey: "blue", body: "会分辨细微差别" },
          { label: "体验", colorKey: "gold", body: "看重真实感受" },
          { label: "打磨", colorKey: "green", body: "会慢慢做好" },
          { label: "柔韧", colorKey: "purple", body: "不靠硬推" }
        ],
      strengths: [
          { title: "审美判断细", body: "你能较快分辨什么是真的顺、真的合适。" },
          { title: "体验感敏锐", body: "你擅长从人的真实感受出发调整做法。" },
          { title: "细节打磨稳", body: "你会把很多微小但关键的部分慢慢做好。" },
          { title: "关系温和", body: "你不靠压强，也能让合作保持顺畅。" },
          { title: "表达真实", body: "在认同的内容上，你常能做出很有个人质感的表达。" },
          { title: "适应现场快", body: "环境变化时，你通常能靠感觉迅速调节。" }
        ],
      weaknesses: [
          { title: "硬冲突回避", body: "高压对撞出现时，你更可能先后退。" },
          { title: "节奏受心境影响", body: "如果环境持续不顺，你的行动感会明显下降。" },
          { title: "边界延迟", body: "很多不舒服你会先忍着，直到太满才停。" },
          { title: "不爱高曝光", body: "长期需要强势表达和持续自我推销会很累。" },
          { title: "结构化偏弱", body: "如果任务需要长期硬性收束，你可能掉耐心。" },
          { title: "需求说得晚", body: "你通常要到很后面才会明确说出自己不想要什么。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位更适合你的体验判断、细节打磨与真实表达。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种节奏、环境和曝光强度下最稳。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是再逼自己更像别人，而是把感受力和边界感一起保留下来。你已经很会分辨什么适合自己，下一步更关键的是更早把这个判断说出来。",
  "当你愿意把真实感受转成更清楚的选择和行动，而不是只在心里慢慢承受，很多消耗会开始减少。成长不一定意味着变硬，而是让柔软也有边界。"
],
      influentialTraits: [
          { label: "感受", colorKey: "blue", body: "先听见自己" },
          { label: "边界", colorKey: "gold", body: "更早表达限制" },
          { label: "节奏", colorKey: "green", body: "按自己的拍子" },
          { label: "恢复", colorKey: "purple", body: "需要安静空间" }
        ],
      strengths: [
          { title: "自我感知细", body: "你常能很早感觉到什么在消耗自己。" },
          { title: "恢复靠真实", body: "做回自己、回到舒服环境时，你恢复很快。" },
          { title: "经验会沉淀", body: "你会慢慢从体验里长出更稳定的判断。" },
          { title: "修正很自然", body: "方法不顺时，你通常会安静地调整。" },
          { title: "长期柔韧", body: "在认同的方向上，你的耐心比外界以为的更高。" },
          { title: "适合慢打磨", body: "你擅长把很多细小进步累积成明显变化。" }
        ],
      weaknesses: [
          { title: "边界说晚", body: "你常感觉到了不舒服，却不急着说出口。" },
          { title: "情绪影响节奏", body: "如果环境长期失真，你的执行感会明显下滑。" },
          { title: "回避硬冲突", body: "很多该正面谈的界限，你会想先绕过去。" },
          { title: "长期规划弱", body: "没有明确节奏时，你更偏好先顺着感觉走。" },
          { title: "过度适应环境", body: "为了不惹事，你可能先改自己而不是先设边界。" },
          { title: "需求表达含蓄", body: "别人未必总能及时看懂你真正想保留什么。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些节奏、空间和支持方式最能保护你的真实感和恢复力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些边界延迟和过度适应最容易拖慢你。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你更看重自然、舒服、不过度压迫。你不一定喜欢把爱说得很满，但会通过陪伴、留意和细微动作表达这段关系的重要性。",
  "你能给关系带来温柔和松弛，但如果对方长期太强势、太粗糙、太不顾感受，你会很快在心里后退。对你来说，被尊重比被说服更重要。"
],
      influentialTraits: [
          { label: "温柔", colorKey: "blue", body: "不靠压强靠陪伴" },
          { label: "真实", colorKey: "gold", body: "关系要自然" },
          { label: "感受", colorKey: "green", body: "对细节很敏锐" },
          { label: "边界", colorKey: "purple", body: "不想被强迫" }
        ],
      strengths: [
          { title: "陪伴有温度", body: "你很擅长用具体行动给人舒服和安心。" },
          { title: "关系自然感强", body: "你不喜欢表演，通常会让相处更真实。" },
          { title: "细节体贴", body: "你会注意很多别人没说出口的小需要。" },
          { title: "低控制感", body: "你不会把关系经营成高压安排。" },
          { title: "表达有质感", body: "你的在意通常细腻而不夸张。" },
          { title: "尊重个体节奏", body: "你愿意让彼此保留自己的空间和喜好。" }
        ],
      weaknesses: [
          { title: "冲突表达晚", body: "很多不舒服你会先自己消化，不立刻说。" },
          { title: "对强压敏感", body: "被逼着给反应或做决定时，你会很快后撤。" },
          { title: "边界容易拖", body: "你有边界，但不一定会及时把它讲清楚。" },
          { title: "失望静悄悄", body: "当被伤到时，你更可能安静退开而不是当场摊牌。" },
          { title: "需要感被忽视", body: "如果对方太粗线条，你会慢慢觉得自己不被看见。" },
          { title: "关系维护偏被动", body: "你更擅长回应，而不一定总想主动定义关系。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最稳定的温柔支持、自然连接与边界优势。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些冲突回避和边界延迟最容易让关系失衡。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的感受判断变成更稳定的选择",
    body: "解锁后可继续查看更细的职业方向、成长节奏与关系边界，让真实感不再只停留在心里。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与真实动作入口。",
  },
});

export default ISFP_ZH_CONTENT;
