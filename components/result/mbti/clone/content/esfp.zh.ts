import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const ESFP_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先感受现场是不是活、关系是不是顺、这件事能不能让人真正进入状态，再决定要不要全力投入。外界常先感受到你的热度，真正稳定的是你对体验和回应的敏感。",
  intro: [
  "ESFP 往往擅长让人进入场景、进入关系、进入真实体验。你会自然留意现场有没有回应、气氛是不是卡住、哪些动作会让人更愿意参与，而不是只是把流程走完。",
  "这让你在活动、协作、体验设计、关系激活和现场推进里很有优势，也会让你对沉闷、单调和过度被管控更敏感。对你来说，活着的东西才有推进感。"
],
  traits: {
    eyebrow: "人格概览",
    title: "现场感很强",
    value: "先看有没有回应",
    body: "你更信任真实互动、现场能量和具体体验带来的判断。",
    paragraphs: [
  "你通常不会先被一套抽象规划点亮，而是更容易被真实的人、现场的回声和有生命力的体验带动。这个特质让你在很多需要互动和带入感的场景里非常自然。",
  "但如果环境长期沉闷、反馈太弱或要求你一直待在低变化的框架里，你会明显掉状态。你需要的不只是热闹，而是活的连接。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业上，你适合那些需要现场感染力、关系拉近、体验组织和快速回应的角色。你不一定偏好长时间困在静态流程里，但很擅长让很多本来不想动的人重新进入状态。",
  "真正适合你的岗位，通常允许你和人、场景、反馈保持近距离，而不是长期被关在低回应、低变化和高重复的环境里。"
],
      influentialTraits: [
          { label: "带入", colorKey: "blue", body: "会让人进场" },
          { label: "回应", colorKey: "gold", body: "对现场很敏锐" },
          { label: "关系", colorKey: "green", body: "能快速拉近" },
          { label: "体验", colorKey: "purple", body: "重视真实感受" }
        ],
      strengths: [
          { title: "现场感染力强", body: "你能让人从观望很快进入参与状态。" },
          { title: "关系拉近快", body: "你通常能较快打破陌生和隔阂。" },
          { title: "体验组织感好", body: "你擅长让一件事不只是做完，而是真的有感受。" },
          { title: "回应很灵活", body: "现场一变，你通常能马上跟上节奏调整。" },
          { title: "表达自然", body: "你会用很直接的方式让别人感到被欢迎和被带动。" },
          { title: "把事情做热", body: "你能让原本平的局面重新有活力。" }
        ],
      weaknesses: [
          { title: "长期收束弱", body: "热的时候很强，但后续收口未必同样稳定。" },
          { title: "对单调低耐受", body: "长期重复和低变化会快速消耗你的投入感。" },
          { title: "边界易松", body: "在热烈互动里，你可能先给出太多时间和精力。" },
          { title: "情绪影响节奏", body: "如果现场回应持续变冷，你的状态会下滑。" },
          { title: "不爱沉闷讨论", body: "长时间抽象讨论会让你明显失去耐心。" },
          { title: "延迟回报耐心少", body: "看不到立刻回声时，你更难维持高投入。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位最能放大你的现场感染力、体验组织和关系激活能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种反馈密度、变化节奏和曝光强度下最稳。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是再变得更有热情，而是让热情接上节奏和边界。你已经很会把现场带活，下一步更关键的是让这种活力不只存在于最热的那一段。",
  "当你愿意给自己建立一点回访、筛选和恢复机制，很多优势会从即时光亮，慢慢变成更可持续的能力。"
],
      influentialTraits: [
          { label: "热度", colorKey: "blue", body: "会点亮现场" },
          { label: "边界", colorKey: "gold", body: "别把自己用满" },
          { label: "回访", colorKey: "green", body: "把关系接下去" },
          { label: "恢复", colorKey: "purple", body: "给自己留空档" }
        ],
      strengths: [
          { title: "恢复靠连接", body: "高质量互动和真实反馈常常能快速点亮你。" },
          { title: "学习靠现场", body: "你通常会在实际体验里很快找到感觉。" },
          { title: "适应变化快", body: "节奏一变，你常能迅速找到新的位置。" },
          { title: "鼓动能力强", body: "你会自然把自己和周围的人都带动起来。" },
          { title: "愿意再试", body: "只要还有空间，你通常愿意再来一轮。" },
          { title: "直觉调整快", body: "很多东西不顺时，你会立刻换一种更自然的做法。" }
        ],
      weaknesses: [
          { title: "节奏易过满", body: "热度上来时，你可能先把自己排得太满。" },
          { title: "回访容易掉", body: "新的现场和新的关系常会抢走旧安排的注意力。" },
          { title: "长期打磨难", body: "没有互动和回声的维护期很难让你一直投入。" },
          { title: "边界说晚", body: "为了不打断气氛，你可能拖到很后面才停。" },
          { title: "恢复排后面", body: "你常先把现场照亮，再处理自己有没有累。" },
          { title: "延迟回报难撑", body: "看不到及时回应时，你更容易怀疑这件事值不值得。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些节奏、反馈和恢复方式最能让你的现场优势留得住。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些过满、低回声和边界延后最容易耗掉你。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你更看重当下有没有回应、相处有没有活力、彼此是否愿意真的投入到同一个现场里。你不太喜欢把亲密变成一堆规训，更在意关系是不是活着。",
  "你能给关系带来很多温度、陪伴和存在感，但如果长期只有热度没有回访、只有靠近没有边界，关系也可能在最亮的时候最容易失衡。"
],
      influentialTraits: [
          { label: "陪伴", colorKey: "blue", body: "在场感很强" },
          { label: "热度", colorKey: "gold", body: "会把关系带热" },
          { label: "回应", colorKey: "green", body: "喜欢有回声" },
          { label: "边界", colorKey: "purple", body: "需要后天练习" }
        ],
      strengths: [
          { title: "在场感强", body: "你很容易让对方感到被真正看见和被带入。" },
          { title: "陪伴有热度", body: "你擅长让关系保持明显的温度和存在感。" },
          { title: "回应很直接", body: "很多喜欢和欣赏你会很自然地表达出来。" },
          { title: "现场照顾好", body: "你常能让相处变得更轻松、更有参与感。" },
          { title: "关系活化强", body: "当关系变平时，你很会重新把它点亮。" },
          { title: "表达不做作", body: "你的亲近感通常来得自然，不需要太多装饰。" }
        ],
      weaknesses: [
          { title: "持续感偏弱", body: "热度很强时很投入，冷下来时未必同样稳。" },
          { title: "边界易松", body: "关系很热时，你可能先给太多时间和精力。" },
          { title: "深层问题拖后", body: "你更想保持现场感，而不是立刻谈沉重议题。" },
          { title: "对冷回应敏感", body: "如果长期没有回声，你会迅速失去投入感。" },
          { title: "不爱沉闷修复", body: "需要慢慢复盘关系时，你不一定有耐心待住。" },
          { title: "容易理想化当下", body: "现场很好时，你可能先忽略长期承接问题。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最稳定的陪伴方式、热度优势与现场感。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些持续性和边界问题最容易让关系在热的时候失衡。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的感染力收束成更可持续的路径",
    body: "解锁后可继续查看更细的职业方向、成长节奏与关系盲点，让热度真正变成长期结果。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与真实动作入口。",
  },
});

export default ESFP_ZH_CONTENT;
