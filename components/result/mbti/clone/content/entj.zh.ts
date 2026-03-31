import type { MbtiDesktopClonePilotContent } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

const ENTJ_ZH_CONTENT: MbtiDesktopClonePilotContent = {
  hero: {
    summary: "你通常先看目标、结构和执行效率，再决定要不要投入情绪与耐心。很多人会先感受到你的推进力，但真正让你持续前进的，是你对秩序、成果和方向感的高要求。",
  },
  intro: {
    paragraphs: [
      "ENTJ 往往擅长在混乱中快速建立优先级，把资源、人手和节奏重新排成一条更有效率的路径。你不满足于“差不多能跑”，更在意系统是否足够清晰、是否能持续复用。",
      "这会让你在推进上天然占优势，但也容易让你忽略一个事实：不是每个人都能跟上你的判断速度。越往长期走，真正决定上限的往往不是你能推多快，而是你能否让别人也进入同一套节奏。",
    ],
  },
  traits: {
    summaryPane: {
      eyebrow: "人格概览",
      title: "推进力很强",
      value: "结构与判断优先",
      body: "你会自然寻找更有效的做法，并迅速识别什么值得继续、什么应该立刻调整。",
    },
    body: [
      "你对低效、含糊和反复横跳的容忍度较低，因此常会主动接手混乱局面，把目标拆清、责任拉直、节奏压稳。你的控制感不只是想掌控别人，而是想确保事情真的往前走。",
      "但这也意味着你容易把“我已经看明白了”默认成“别人也应该立刻跟上”。当团队需要更慢的解释、更多的共识和更柔和的承接时，你如果不刻意放慢，就容易先赢效率、后丢协作。",
    ],
  },
  chapters: {
    career: {
      intro: [
        "在职业上，你通常适合那些需要判断、统筹、决策与资源调度的角色。只要目标足够清楚，你会很快进入状态，并天然寻找更高杠杆的做法，而不是满足于重复执行。",
        "你并不排斥压力，真正让你不耐烦的是无效压力：目标不清、责任不明、节奏反复、沟通空转。比起一个“舒服”的岗位，你更需要一个能让你持续放大影响力的战场。",
      ],
      influentialTraits: [
        { label: "决断", body: "先抓主轴", colorKey: "blue" },
        { label: "统筹", body: "把资源排直", colorKey: "gold" },
        { label: "推进", body: "拒绝空转", colorKey: "green" },
        { label: "野心", body: "偏向高杠杆", colorKey: "purple" },
      ],
      visibleBlocks: [
        {
          title: "Strengths",
          items: [
            { title: "能快速拉清目标", body: "你擅长把模糊命题拆成可推进的优先级，而不是继续在信息里打转。", tone: "positive" },
            { title: "天然有组织能力", body: "你会本能地重整资源、角色和责任，让团队更快形成可执行路径。", tone: "positive" },
            { title: "抗压下仍能判断", body: "当局面复杂且时间紧时，你通常还能保留较清晰的主次判断。", tone: "positive" },
            { title: "偏好高杠杆决策", body: "你会主动寻找影响面更大、能长期放大的关键动作。", tone: "positive" },
            { title: "能把标准立起来", body: "你不只是推进，还能重新设定什么才算真正达标。", tone: "positive" },
            { title: "适合带动系统升级", body: "在经营、战略、管理、项目统筹等场景里，你容易把局面抬到更高效的层次。", tone: "positive" },
          ],
        },
        {
          title: "Weaknesses",
          items: [
            { title: "容易默认别人跟得上", body: "你看清一条路径后，可能低估了别人理解、消化和接受的时间。", tone: "negative" },
            { title: "对低效容忍度低", body: "当团队反复犹豫或拖延时，你很容易直接接管。", tone: "negative" },
            { title: "表达可能过于锋利", body: "如果你只说结论而不照顾承接方式，合作方可能先感受到压力。", tone: "negative" },
            { title: "会把控制感当安全感", body: "事情一旦失去掌控，你可能比自己意识到的更焦躁。", tone: "negative" },
            { title: "休息阈值偏高", body: "你通常在效率明显下滑后才承认自己已经透支。", tone: "negative" },
            { title: "容易忽略过程情绪", body: "你很在意结果，但未必总能同步察觉团队在过程中已经累积的摩擦。", tone: "negative" },
          ],
        },
      ],
      lockedBlocks: [
        {
          title: "Career roles you may love",
          overlayTitle: "解锁更匹配的职业战场",
          overlayBody: "查看哪些职责真正能放大你的判断、统筹与高杠杆推进能力。",
          overlayCtaLabel: "解锁完整报告",
          blurredItems: [
            { title: "经营管理", body: "适合需要资源协调、目标推进和结构优化的职责。", isPlaceholder: true },
            { title: "战略规划", body: "适合持续判断方向并把抽象目标转成路径的岗位。", isPlaceholder: true },
            { title: "项目统筹", body: "适合拉齐目标、推进节奏与决策落地的场景。", isPlaceholder: true },
            { title: "商业拓展", body: "适合在复杂关系里推动结果并寻找增长机会。", isPlaceholder: true },
            { title: "组织负责人", body: "适合长期搭建机制并放大团队产出的角色。", isPlaceholder: true },
            { title: "产品/运营负责人", body: "适合在跨团队协作里整合优先级与执行路径。", isPlaceholder: true },
          ],
        },
        {
          title: "Work styles that suit you",
          overlayTitle: "解锁最适合你的工作方式",
          overlayBody: "看清你在哪种目标密度、授权边界和协作节奏里最容易打出成果。",
          overlayCtaLabel: "解锁完整报告",
          blurredItems: [
            { title: "目标清楚", body: "你需要明确的方向和判断空间，而不是无尽试探。", isPlaceholder: true },
            { title: "授权真实", body: "你适合对结果负责，而不是只替别人擦边补位。", isPlaceholder: true },
            { title: "决策链短", body: "过长的确认链会显著拖低你的效率感。", isPlaceholder: true },
            { title: "团队响应快", body: "你更适合执行意愿高、沟通直接的协作环境。", isPlaceholder: true },
            { title: "评价标准清晰", body: "当成败标准明白时，你更容易持续拉高结果。", isPlaceholder: true },
            { title: "允许系统升级", body: "你需要的不只是完成任务，还需要有空间改进任务系统本身。", isPlaceholder: true },
          ],
        },
      ],
    },
    growth: {
      intro: [
        "你的成长重点往往不是“更有动力”，而是学会把推进力与耐心绑在一起。你已经足够能冲，下一步更关键的是在不牺牲判断质量的前提下，让别人也能被你带起来。",
        "对你来说，真正拉开差距的不是再多扛一点，而是知道什么时候该继续压进，什么时候该放慢解释、修正方法、重新分配资源。会调速的 ENTJ，通常比只会加速的 ENTJ 走得更远。",
      ],
      influentialTraits: [
        { label: "升级", body: "不断优化系统", colorKey: "blue" },
        { label: "节奏", body: "学会调速", colorKey: "gold" },
        { label: "授权", body: "让别人跟上", colorKey: "green" },
        { label: "恢复", body: "别只靠硬扛", colorKey: "purple" },
      ],
      visibleBlocks: [
        {
          title: "Strengths",
          items: [
            { title: "有持续升级意识", body: "你不会满足于现状，而是不断寻找更优结构和更高杠杆。", tone: "positive" },
            { title: "能从结果反推系统", body: "你擅长看出问题不只是人没做好，更可能是机制本身有缺口。", tone: "positive" },
            { title: "成长动作执行快", body: "一旦你认可某种修正方向，通常会很快进入实施阶段。", tone: "positive" },
            { title: "愿意承担更大责任", body: "你不怕负责，反而会在能真正掌控结果时更有动力。", tone: "positive" },
            { title: "适合做长期结构迭代", body: "你可以把一次问题修成一套更稳的系统，而不是只补当前漏洞。", tone: "positive" },
            { title: "对高标准有承载力", body: "很多人会被压力打散，但你通常能把压力转成推进动力。", tone: "positive" },
          ],
        },
        {
          title: "Weaknesses",
          items: [
            { title: "容易只认效率答案", body: "当场面复杂时，你可能先推最有效方案，而低估关系承接成本。", tone: "negative" },
            { title: "对慢节奏不耐烦", body: "如果别人理解和推进速度偏慢，你很容易直接代替对方完成判断。", tone: "negative" },
            { title: "习惯把压力吞下", body: "你常常在外部看起来稳定，但身体和情绪未必真的跟上。", tone: "negative" },
            { title: "放松感建立得慢", body: "即便休息，你也可能一直在脑中继续排优先级和修系统。", tone: "negative" },
            { title: "会把失误放到能力层面", body: "当事情没达到预期时，你容易先认为自己还不够强。", tone: "negative" },
            { title: "修正方式偏硬", body: "如果没刻意调整，你的纠偏可能更像压强，而不是带动。", tone: "negative" },
          ],
        },
      ],
      lockedBlocks: [
        {
          title: "What energizes you",
          overlayTitle: "解锁真正能点燃你的条件",
          overlayBody: "看清哪些目标、授权和成长环境最能持续放大你的战斗力。",
          overlayCtaLabel: "解锁完整报告",
          blurredItems: [
            { title: "清楚目标", body: "明确目标会迅速点亮你的行动力。", isPlaceholder: true },
            { title: "真实授权", body: "能对结果负责而不是只执行细碎指令时，你会更投入。", isPlaceholder: true },
            { title: "成长空间", body: "当环境允许你持续升级系统时，你会保持很高动力。", isPlaceholder: true },
            { title: "高质量搭档", body: "能跟上判断速度的人会显著提高你的状态。", isPlaceholder: true },
            { title: "可见结果", body: "你需要看到投入如何转成真实推进，而不是长期空转。", isPlaceholder: true },
            { title: "挑战密度", body: "适度复杂和高标准会让你进入很强的专注状态。", isPlaceholder: true },
          ],
        },
        {
          title: "What drains you",
          overlayTitle: "解锁最容易耗损你的模式",
          overlayBody: "查看哪些低效、模糊和持续补位的局面会快速拖低你的状态。",
          overlayCtaLabel: "解锁完整报告",
          blurredItems: [
            { title: "目标反复改写", body: "方向天天变会迅速消耗你的判断耐心。", isPlaceholder: true },
            { title: "责任含混", body: "当没有人真正对结果负责时，你很容易被迫接管。", isPlaceholder: true },
            { title: "执行拖延", body: "反复提醒仍不动会快速拉高你的烦躁感。", isPlaceholder: true },
            { title: "只有救火没有建设", body: "长期只处理眼前问题会让你觉得投入没有复利。", isPlaceholder: true },
            { title: "无效汇报链", body: "层层确认但没有真实推进，会极大损耗你的效率感。", isPlaceholder: true },
            { title: "持续硬扛", body: "不承认自己也需要恢复，会让你的判断质量慢慢下滑。", isPlaceholder: true },
          ],
        },
      ],
    },
    relationships: {
      intro: [
        "在关系里，你会自然承担方向、安排和推进的一侧。你愿意投入，也愿意保护重要的人，但前提通常是对方真诚、稳定、愿意一起面对问题，而不是把情绪和决定都交给你收拾。",
        "你的直接和高标准能给关系带来清晰感，也可能带来压力感。你并不是不在乎感受，而是习惯先处理问题本身。如果对方需要的是先被理解、再谈解决方案，你就需要刻意把节奏放慢一点。",
      ],
      influentialTraits: [
        { label: "直接", body: "问题先说清", colorKey: "blue" },
        { label: "保护", body: "愿意承担", colorKey: "gold" },
        { label: "标准", body: "关系要可靠", colorKey: "green" },
        { label: "节奏", body: "学会慢一点", colorKey: "purple" },
      ],
      visibleBlocks: [
        {
          title: "Strengths",
          items: [
            { title: "能提供清晰方向", body: "当关系面临混乱和犹豫时，你通常能先把重点拉直。", tone: "positive" },
            { title: "愿意承担责任", body: "你不会在关键时刻躲开，反而会主动站到前面处理问题。", tone: "positive" },
            { title: "重视承诺与稳定", body: "你更欣赏可靠、持续、说到做到的关系，而不是情绪起伏式热闹。", tone: "positive" },
            { title: "保护欲强", body: "当你认定这段关系值得投入时，通常会非常认真地守住它。", tone: "positive" },
            { title: "不逃避难题", body: "你比多数人更愿意直接面对关系里的现实问题。", tone: "positive" },
            { title: "擅长把关系拉回正轨", body: "在摩擦出现时，你常能快速识别该修的是真问题还是表面症状。", tone: "positive" },
          ],
        },
        {
          title: "Weaknesses",
          items: [
            { title: "容易先给答案", body: "当对方需要先被理解时，你可能太快进入解决模式。", tone: "negative" },
            { title: "表达强度偏高", body: "如果你在压力下只强调结论，对方可能先感受到被压迫。", tone: "negative" },
            { title: "对反复失误耐心有限", body: "你愿意给机会，但不喜欢长期重复同一种问题。", tone: "negative" },
            { title: "容易忽略柔性回应", body: "你会把诚实放在前面，却未必总照顾到对方接收方式。", tone: "negative" },
            { title: "习惯扛住不说累", body: "你可能会继续推进关系运转，却不太主动承认自己也需要安抚。", tone: "negative" },
            { title: "对不可靠很敏感", body: "一旦判断对方长期不稳定，你会很快把投入抽回。", tone: "negative" },
          ],
        },
      ],
      lockedBlocks: [
        {
          title: "Relationship superpowers",
          overlayTitle: "解锁你在关系里的高价值优势",
          overlayBody: "看清你的清晰感、承担力和保护欲会如何成为关系的稳定器。",
          overlayCtaLabel: "解锁完整报告",
          blurredItems: [
            { title: "稳定主心骨", body: "你能在复杂局面里迅速提供判断与方向。", isPlaceholder: true },
            { title: "扛事能力", body: "你愿意承担关键责任，不轻易把压力外包给别人。", isPlaceholder: true },
            { title: "关系修复效率", body: "当问题出现时，你更愿意直面并解决。", isPlaceholder: true },
            { title: "保护重要的人", body: "你对值得投入的人通常非常有担当。", isPlaceholder: true },
            { title: "长期建设感", body: "你更偏好一起把关系经营得更稳，而不是只追求当下热度。", isPlaceholder: true },
            { title: "界限清楚", body: "你能较快识别一段关系是否仍值得继续投入。", isPlaceholder: true },
          ],
        },
        {
          title: "Relationship pitfalls",
          overlayTitle: "解锁你最常出现的关系盲点",
          overlayBody: "查看哪些沟通节奏和控制习惯最容易让你在亲密关系里造成压迫。",
          overlayCtaLabel: "解锁完整报告",
          blurredItems: [
            { title: "太快进入解决模式", body: "对方可能还在感受阶段，而你已经切到结论阶段。", isPlaceholder: true },
            { title: "把高标准带进关系", body: "你对可靠性的要求有时会让关系显得太像项目。", isPlaceholder: true },
            { title: "不愿示弱", body: "长期只做支撑者，会让你的需求越来越难被看见。", isPlaceholder: true },
            { title: "对低效沟通耐心有限", body: "当对话持续打转时，你容易直接失去耐心。", isPlaceholder: true },
            { title: "容易接管安排", body: "你可能无意中让关系失去协商感和共同参与感。", isPlaceholder: true },
            { title: "忽略修复语气", body: "问题说对了，不代表对方就能接得住。", isPlaceholder: true },
          ],
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把这份判断从“看见方向”推进到“真正形成打法”",
    body: "解锁后，你会看到更完整的职业战场、成长节奏与关系盲点，帮助你把执行力用在更对的位置。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与现有真实购买动作。",
  },
};

export default ENTJ_ZH_CONTENT;
