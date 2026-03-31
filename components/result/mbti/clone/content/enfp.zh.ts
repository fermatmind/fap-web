import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const ENFP_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先感受哪里有活性、哪里有可能，再决定是否投入。外界往往先注意到你的热度和连接力，真正稳定的是你对人和机会的直觉。",
  intro: [
  "ENFP 往往擅长在混乱和陌生中迅速找到人、找到话题、找到新的连接方式。你会自然感知什么值得继续探索，什么能被重新组合成更有生命力的路径。",
  "这让你在启动、连接、创意和激活场景里很有优势，也会让你对单调重复、过度规训和高压收束更敏感。对你来说，推进最好带着呼吸感。"
],
  traits: {
    eyebrow: "人格概览",
    title: "探索感很强",
    value: "机会优先",
    body: "你会自然朝着有活性、有可能性、有连接感的方向移动。",
    paragraphs: [
  "你更容易被新的可能性、人和视角点亮，而不是被明确但沉闷的路线稳住。这个特质让你很擅长打开局面、把人拉进来，也让你更容易在固定结构里迅速掉能量。",
  "一旦环境允许你探索、连接和试错，你的创造力和感染力会很强；但如果一切都必须过早收口、过度被管控，你的状态会明显变弱。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业上，你适合那些需要探索机会、连接资源、调动现场和把抽象想法变成可感知体验的角色。你不一定偏好完全固定的路径，但很擅长把停滞的局面重新点亮。",
  "真正适合你的岗位，通常允许你接触人、接触变化、接触新问题，而不是把你长期锁在低变化和低反馈的环境里。对你来说，有回声比有框架更重要。"
],
      influentialTraits: [
          { label: "连接", colorKey: "blue", body: "会把人连起来" },
          { label: "点亮", colorKey: "gold", body: "能激活现场" },
          { label: "探索", colorKey: "green", body: "看见新机会" },
          { label: "转译", colorKey: "purple", body: "会讲成别人懂" }
        ],
      strengths: [
          { title: "机会感知快", body: "你能较快看到局面里还能打开哪些新入口。" },
          { title: "感染力强", body: "你很容易让人愿意先跟着你动起来。" },
          { title: "跨圈连接", body: "你擅长把不同的人和信息重新连到一起。" },
          { title: "创意转译", body: "你能把抽象想法讲成别人愿意参与的东西。" },
          { title: "启动速度快", body: "面对新机会时，你通常很敢先推开第一步。" },
          { title: "看到人潜力", body: "你常会比别人更早看见一个人的亮点和可塑性。" }
        ],
      weaknesses: [
          { title: "收束不足", body: "当新可能不断出现时，你可能不想太快定下来。" },
          { title: "流程耐心低", body: "长期重复、低变化流程会迅速消耗你的投入。" },
          { title: "边界易波动", body: "兴奋时你可能答应太多，之后才发现节奏过满。" },
          { title: "回访执行弱", body: "启动很强，但跟进和回访未必同样稳定。" },
          { title: "高开低走", body: "如果环境回声太少，你的能量会很快下降。" },
          { title: "判断受新鲜感影响", body: "新机会的吸引力有时会盖过长期成本。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位最能放大你的连接力、创意转译与机会感知。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种变化密度和反馈节奏里最能稳定发挥。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是再多打开几个方向，而是学会保留热度的同时建立收束机制。你已经很会把事情点亮，下一步更关键的是让亮起来的东西继续走下去。",
  "当你愿意给自己设定更清楚的节奏、回访节点和取舍标准，很多优势会从一次次惊艳，变成真正可复用的能力。"
],
      influentialTraits: [
          { label: "热度", colorKey: "blue", body: "会点亮局面" },
          { label: "取舍", colorKey: "gold", body: "学会关掉选项" },
          { label: "回访", colorKey: "green", body: "把热度接下去" },
          { label: "节奏", colorKey: "purple", body: "避免过满" }
        ],
      strengths: [
          { title: "学习快", body: "你面对新问题时通常会迅速进入状态。" },
          { title: "反馈吸收强", body: "现场回应和即时反馈很容易变成你的动力。" },
          { title: "适应变化快", body: "环境一变，你通常能迅速找新的切入点。" },
          { title: "恢复靠连接", body: "高质量互动和新鲜输入常常就是你的补能方式。" },
          { title: "点子生成快", body: "你能持续为同一问题提供不同角度的做法。" },
          { title: "愿意再试", body: "即使上一轮没成，你也愿意很快重启一版。" }
        ],
      weaknesses: [
          { title: "节奏易过满", body: "当很多机会同时出现时，你容易把自己排得太满。" },
          { title: "回访容易断", body: "新鲜问题的吸引力常会抢走旧任务的注意力。" },
          { title: "长期打磨难", body: "没有变化感的维护工作很难维持你的投入。" },
          { title: "情绪影响节奏", body: "如果环境持续沉闷，你的行动感会明显下降。" },
          { title: "取舍偏晚", body: "很多方向都看起来值得时，你不想太快放弃任何一个。" },
          { title: "边界随兴", body: "你有时会先顺着热度答应，后面再处理后果。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些节奏、反馈和取舍机制最能帮你把热度留住。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些过满和高开低走的模式最容易拖慢长期积累。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你通常会先被活性、真诚和一起探索的感觉吸引。你不喜欢关系太早变成流程，更在意两个人能不能一起长出新的连接和新的理解。",
  "你能为关系带来很多热度和新鲜感，但如果缺少回访和边界，关系也可能在热的时候很亮，静下来时却不够稳。对你来说，持续感是一门后天能力。"
],
      influentialTraits: [
          { label: "热情", colorKey: "blue", body: "先把关系点亮" },
          { label: "真诚", colorKey: "gold", body: "喜欢有真实感" },
          { label: "探索", colorKey: "green", body: "愿意一起试新东西" },
          { label: "回访", colorKey: "purple", body: "需要练习持续感" }
        ],
      strengths: [
          { title: "关系有热度", body: "你很容易让互动变得鲜活、有回应。" },
          { title: "连接感强", body: "你能快速感受到彼此之间有没有真正的火花。" },
          { title: "表达自然", body: "你的喜欢、欣赏和鼓励通常表达得很直接。" },
          { title: "愿意一起探索", body: "你喜欢两个人一起打开新的体验和话题。" },
          { title: "看见对方潜力", body: "你常会很早看见对方还没完全展开的那一面。" },
          { title: "修复意愿高", body: "只要你还在乎，你通常愿意重新把关系点亮。" }
        ],
      weaknesses: [
          { title: "持续感不足", body: "热的时候很投入，静下来时未必同样稳定。" },
          { title: "边界偏松", body: "兴奋和共鸣上来时，你可能先给出太多时间和情绪。" },
          { title: "需求变化快", body: "如果关系长时间没有新鲜感，你会更容易分神。" },
          { title: "回避沉闷讨论", body: "涉及长期责任和重复细节时，你可能先想绕开。" },
          { title: "失望时跳开", body: "当对方持续没回应你的热度，你可能迅速抽离。" },
          { title: "容易理想化", body: "早期若感到高度连接，你可能先把期待拉得太高。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最能带来的热度、连接感与鼓舞能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些持续性、边界和理想化问题最容易让关系失衡。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的探索力收束成可复用路径",
    body: "解锁后可继续查看更细的职业方向、成长节奏与关系持续性，让热度真正变成长期结果。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与所有真实动作入口。",
  },
});

export default ENFP_ZH_CONTENT;
