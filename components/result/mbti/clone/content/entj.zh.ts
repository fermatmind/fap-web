import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const ENTJ_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你通常先看目标、结构和执行效率，再决定要不要投入情绪与耐心。推动你前进的，不只是结果欲，更是对秩序和方向感的高要求。",
  intro: [
  "ENTJ 往往擅长在混乱里迅速拉清优先级，把资源、人手和节奏重新排成更有杠杆的路径。你不满足于差不多能跑，更在意系统是否足够清晰、能否持续放大结果。",
  "这会让你在推进上天然占优势，但也容易让你低估别人的消化和承接成本。越往长期走，真正决定上限的往往不是你推得多快，而是你能否让别人也进入同一套节奏。"
],
  traits: {
    eyebrow: "人格概览",
    title: "推进力很强",
    value: "目标优先",
    body: "你会自然寻找更有效的做法，并迅速识别什么值得继续、什么应该立刻调整。",
    paragraphs: [
  "你对低效、含糊和反复横跳的容忍度较低，因此常会主动接手混乱局面，把目标拆清、责任拉直、节奏压稳。你的控制感并不只是想掌控别人，而是想确保事情真的往前走。",
  "但这也意味着你容易把我已经看明白了默认成别人也应该立刻跟上。当环境需要更多解释、更多共识和更柔和的承接时，你如果不刻意放慢，就容易先赢效率、后丢协作。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业上，你通常适合那些需要判断、统筹、决策与资源调度的角色。只要目标足够清楚，你会很快进入状态，并天然寻找更高杠杆的做法。",
  "你并不排斥压力，真正让你不耐烦的是无效压力：目标不清、责任不明、节奏反复、沟通空转。比起舒服的岗位，你更需要一个能持续放大影响力的战场。"
],
      influentialTraits: [
          { label: "决断", colorKey: "blue", body: "先抓主轴" },
          { label: "统筹", colorKey: "gold", body: "把资源排直" },
          { label: "推进", colorKey: "green", body: "拒绝空转" },
          { label: "野心", colorKey: "purple", body: "偏向高杠杆" }
        ],
      strengths: [
          { title: "拉清目标", body: "你能把模糊命题拆成清楚的优先级和动作链。" },
          { title: "组织能力强", body: "你会本能地重整资源、角色与责任边界。" },
          { title: "抗压判断", body: "局面复杂且时间紧时，你通常还能保留主次感。" },
          { title: "高杠杆决策", body: "你会主动寻找影响面更大的关键动作。" },
          { title: "标准建立", body: "你不只是推进，还会重新定义什么才算达标。" },
          { title: "系统升级", body: "你擅长把散乱局面抬到更高效的层级。" }
        ],
      weaknesses: [
          { title: "默认别人跟上", body: "你低估别人理解和接受一条路径所需的时间。" },
          { title: "低效容忍低", body: "当团队反复犹豫时，你容易直接接管。" },
          { title: "表达偏锋利", body: "如果只给结论，合作方可能先感受到压强。" },
          { title: "控制感过重", body: "事情失去掌控时，你比自己意识到的更焦躁。" },
          { title: "休息阈值高", body: "你常在效率明显下滑后才承认自己已透支。" },
          { title: "忽略过程情绪", body: "你很在意结果，却未必同步感到团队已摩擦累积。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些职责真正能放大你的判断、统筹与推进能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种目标密度与授权边界下更容易打出结果。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点不是再多扛一点，而是学会把推进力与耐心绑在一起。你已经足够能冲，下一步更关键的是让别人也能被你带起来。",
  "真正拉开差距的不是一直加速，而是知道什么时候该继续压进，什么时候该放慢解释、修正方法、重新分配资源。会调速的 ENTJ，通常走得更远。"
],
      influentialTraits: [
          { label: "升级", colorKey: "blue", body: "不断优化系统" },
          { label: "节奏", colorKey: "gold", body: "知道何时调速" },
          { label: "授权", colorKey: "green", body: "让别人进入节奏" },
          { label: "恢复", colorKey: "purple", body: "别只靠硬扛" }
        ],
      strengths: [
          { title: "升级意识强", body: "你不会满足于现状，会持续寻找更优结构。" },
          { title: "结果反推系统", body: "你擅长识别问题究竟出在人还是机制。" },
          { title: "修正执行快", body: "一旦认可方向，你通常很快进入实施。" },
          { title: "责任承载高", body: "当能真正对结果负责时，你反而更有动力。" },
          { title: "长期迭代强", body: "你可以把一次问题修成更稳的系统。" },
          { title: "高标准承压", body: "很多人会被压力打散，但你常把它转成推进力。" }
        ],
      weaknesses: [
          { title: "只认效率答案", body: "你可能先推最有效方案，而低估关系承接成本。" },
          { title: "慢节奏不耐烦", body: "别人理解较慢时，你容易直接替对方完成判断。" },
          { title: "习惯把压力吞下", body: "外部看似稳定，但身体和情绪未必跟得上。" },
          { title: "放松建立慢", body: "即便休息，你也可能继续在脑中排优先级。" },
          { title: "失误上升到能力", body: "事情没达预期时，你容易先觉得自己还不够强。" },
          { title: "修正方式偏硬", body: "如果没刻意调整，你的纠偏更像压强而不是带动。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些目标、授权和成长环境最能持续放大你的战斗力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些低效、模糊和持续补位的局面最耗损你。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你会自然承担方向、安排和推进的一侧。你愿意投入，也愿意保护重要的人，但前提通常是对方稳定、真诚、愿意一起面对问题。",
  "你的直接和高标准能给关系带来清晰感，也可能带来压迫感。你并不是不在乎感受，而是习惯先处理问题本身，因此需要刻意把节奏放慢一点。"
],
      influentialTraits: [
          { label: "直接", colorKey: "blue", body: "问题先说清" },
          { label: "保护", colorKey: "gold", body: "愿意承担" },
          { label: "标准", colorKey: "green", body: "关系要可靠" },
          { label: "调速", colorKey: "purple", body: "学会慢一点" }
        ],
      strengths: [
          { title: "给清晰方向", body: "当关系面临犹豫和混乱时，你能先把重点拉直。" },
          { title: "愿意承担", body: "关键时刻你通常不会后退，而是会站出来处理。" },
          { title: "重视稳定", body: "你欣赏可靠、持续、说到做到的关系。" },
          { title: "保护欲强", body: "当你认定值得投入时，会认真守住这段关系。" },
          { title: "不逃避难题", body: "你比多数人更愿意直接面对现实问题。" },
          { title: "拉回正轨", body: "你常能识别该修的是真问题还是表面情绪。" }
        ],
      weaknesses: [
          { title: "容易先给答案", body: "当对方需要先被理解时，你可能太快进入解决模式。" },
          { title: "表达强度偏高", body: "在压力下只强调结论时，对方容易先感到压迫。" },
          { title: "耐心有限", body: "对重复失误和反复失信的容忍度通常不高。" },
          { title: "忽略柔性回应", body: "你会把诚实放前面，却未必总照顾接收方式。" },
          { title: "习惯扛住不说累", body: "你可能继续推进关系运转，却不主动承认自己也需要安抚。" },
          { title: "对不可靠敏感", body: "一旦判断对方长期不稳定，你会很快把投入抽回。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你的清晰感、承担力与保护欲怎样成为关系稳定器。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些沟通压强和控制习惯最容易让关系失衡。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的推进力放在更高杠杆的位置",
    body: "解锁后可继续查看更完整的职业战场、成长节奏与关系盲点，不再只停留在公开概览。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与现有真实购买动作。",
  },
});

export default ENTJ_ZH_CONTENT;
