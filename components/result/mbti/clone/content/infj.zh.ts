import type { MbtiDesktopClonePilotContent } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

const INFJ_ZH_CONTENT: MbtiDesktopClonePilotContent = {
  hero: {
    summary: "你习惯先感受气氛、关系和潜在走向，再决定自己要不要出手。很多人看到的是你的温和与克制，真正驱动你的却往往是一套很清晰的内在判断。",
  },
  intro: {
    paragraphs: [
      "INFJ 往往不是靠存在感赢得影响力，而是靠观察、归纳和精准回应在关键时刻把话说到点上。你对人和情境的敏感，让你比多数人更早意识到一段关系、一份工作或一个团队正在往哪里滑去。",
      "这也意味着你很容易同时背负期待与情绪成本。你并不抗拒责任，但会天然排斥那些消耗意义感、逼你持续妥协边界的环境。真正适合你的路径，不只是“能做”，而是“值得长期做”。",
    ],
  },
  traits: {
    summaryPane: {
      eyebrow: "人格概览",
      title: "安静但不被动",
      value: "内在判断先行",
      body: "你的表达通常建立在充分感受和思考之后，因此一旦开口，往往已经形成了较完整的立场与方向感。",
    },
    body: [
      "你既重视他人的处境，也会在心里保留一条很清楚的价值底线。这种组合让你看起来柔和，但并不意味着你缺乏判断，相反，你只是不会轻易把判断外露。",
      "当环境允许你按自己的节奏深入、整理和回应时，你的稳定度会显著上升；当周围持续逼迫你快速表态、频繁切换或接受粗糙决策时，你会明显消耗。",
    ],
  },
  chapters: {
    career: {
      intro: [
        "在职业场景里，你最有价值的部分通常不是“抢在最前面”，而是能在混乱信息里看出长期后果，并把人、目标和节奏重新对齐。你适合承担那些需要洞察、整合与持续陪跑的职责。",
        "你不一定喜欢高噪音竞争，但很适合在高复杂度问题中做深度判断。只要环境尊重你的专注和方法，你往往能把模糊的需求变成一条更清晰、更可执行的路线。",
      ],
      influentialTraits: [
        { label: "洞察", body: "先看深层动因", colorKey: "blue" },
        { label: "共情", body: "理解人的处境", colorKey: "gold" },
        { label: "整合", body: "把碎片连成线", colorKey: "green" },
        { label: "克制", body: "不过度外放", colorKey: "purple" },
      ],
      visibleBlocks: [
        {
          title: "Strengths",
          items: [
            { title: "看见隐性问题", body: "你能较早察觉团队里没有说出口的阻力，并提前调整沟通和推进方式。", tone: "positive" },
            { title: "擅长一对一影响", body: "你不靠强压推进，而是通过理解与回应让对方愿意真正配合。", tone: "positive" },
            { title: "把抽象议题讲清楚", body: "你能把复杂议题翻译成更有人感、更容易执行的表达。", tone: "positive" },
            { title: "重视长期一致性", body: "你做决策时会同时考虑价值感、关系质量与长期后果。", tone: "positive" },
            { title: "适合高信任角色", body: "在咨询、研究、策略、人才发展等场景里，你容易建立持续信任。", tone: "positive" },
            { title: "能稳定托住复杂情绪", body: "当项目涉及高度不确定和人际张力时，你往往比别人更能稳住场面。", tone: "positive" },
          ],
        },
        {
          title: "Weaknesses",
          items: [
            { title: "不爱高频自我营销", body: "如果环境持续要求即时曝光和反复证明自己，你会明显疲惫。", tone: "negative" },
            { title: "容易替系统兜底", body: "你看见别人卡住时常会主动补位，久了容易把别人的失序背在自己身上。", tone: "negative" },
            { title: "决策前准备过深", body: "当外部节奏很快时，你可能因为想把判断做完整而错过最佳表达窗口。", tone: "negative" },
            { title: "讨厌价值失真", body: "如果组织长期只看短期结果而忽视方法和人，你的投入感会快速下降。", tone: "negative" },
            { title: "对冲突容忍度有限", body: "你能处理冲突，但不喜欢被拉进无意义的权力较劲。", tone: "negative" },
            { title: "边界被侵蚀时恢复慢", body: "一旦工作持续侵入你的内在空间，你通常需要更长时间才能重新回到稳定状态。", tone: "negative" },
          ],
        },
      ],
      lockedBlocks: [
        {
          title: "Career roles you may love",
          overlayTitle: "解锁更适合你的岗位簇",
          overlayBody: "查看哪些职责真正能发挥你的洞察、陪伴与长期整合能力。",
          overlayCtaLabel: "解锁完整报告",
          blurredItems: [
            { title: "策略研究", body: "适合需要深度理解动因与长期判断的岗位。", isPlaceholder: true },
            { title: "人才发展", body: "适合将理解、辅导和系统设计结合起来的职责。", isPlaceholder: true },
            { title: "品牌叙事", body: "适合把复杂价值翻译成可感知表达的角色。", isPlaceholder: true },
            { title: "用户研究", body: "适合长期观察人和情境，再提炼行动洞察的路径。", isPlaceholder: true },
            { title: "组织咨询", body: "适合在复杂关系中帮助团队重建共识与节奏。", isPlaceholder: true },
            { title: "内容策略", body: "适合用系统化表达承载长期影响力的场景。", isPlaceholder: true },
          ],
        },
        {
          title: "Work styles that suit you",
          overlayTitle: "解锁更合适的工作环境",
          overlayBody: "看清你在哪种节奏、汇报关系和协作方式里最容易稳定发挥。",
          overlayCtaLabel: "解锁完整报告",
          blurredItems: [
            { title: "明确边界", body: "你需要知道职责范围，而不是长期在模糊期待中补位。", isPlaceholder: true },
            { title: "深度时间", body: "连续的专注窗口比频繁同步更能让你进入高质量输出。", isPlaceholder: true },
            { title: "有意义反馈", body: "你更在意反馈是否具体、真诚、能帮助改进。", isPlaceholder: true },
            { title: "高信任协作", body: "当团队愿意尊重判断过程时，你会更愿意投入。", isPlaceholder: true },
            { title: "低噪音竞争", body: "不必靠持续抢占话语权来换取存在感的环境更适合你。", isPlaceholder: true },
            { title: "长期目标感", body: "你更容易为能积累价值的路径持续发力。", isPlaceholder: true },
          ],
        },
      ],
    },
    growth: {
      intro: [
        "你的成长往往不是“多做一点”，而是学会把感受力和边界感同时留下。你已经很会理解别人，下一步更关键的是不要每次都把理解自动转译成自己的责任。",
        "真正能让你持续升级的，不是更严格地要求自己，而是把理想、节奏和能量管理重新放到一条线上。你越能允许自己分阶段推进，越不容易因为理想过高而中途失速。",
      ],
      influentialTraits: [
        { label: "反思", body: "先理解再调整", colorKey: "blue" },
        { label: "理想", body: "追求一致与意义", colorKey: "gold" },
        { label: "边界", body: "学会保留自己", colorKey: "green" },
        { label: "耐心", body: "按节奏成长", colorKey: "purple" },
      ],
      visibleBlocks: [
        {
          title: "Strengths",
          items: [
            { title: "自我观察能力强", body: "你能较快发现自己为什么被某种情境触发，而不是只停留在结果层面。", tone: "positive" },
            { title: "愿意长期修正", body: "一旦认定方向有价值，你通常愿意持续打磨，而不是浅尝即止。", tone: "positive" },
            { title: "能把经验提炼成方法", body: "你不仅会反思，还会慢慢形成一套更适合自己的判断标准。", tone: "positive" },
            { title: "重视内在一致", body: "你会主动校正那些与自己价值观冲突的生活方式和关系安排。", tone: "positive" },
            { title: "恢复后成长快", body: "只要得到足够安静和支持，你往往能很快重新整合状态。", tone: "positive" },
            { title: "适合做深层升级", body: "你擅长的不是表面优化，而是长期层面的思维与习惯重建。", tone: "positive" },
          ],
        },
        {
          title: "Weaknesses",
          items: [
            { title: "容易把标准抬太高", body: "当理想和现实差距过大时，你可能先责备自己，而不是先调整路径。", tone: "negative" },
            { title: "情绪负担会延迟释放", body: "你常常能先撑住，但代价是事后才意识到自己已经透支。", tone: "negative" },
            { title: "不擅长及时求助", body: "即使知道自己需要支持，你也可能因为不想打扰别人而继续独自消化。", tone: "negative" },
            { title: "会对自己过度解释", body: "当状态起伏时，你容易想把每个波动都解释清楚，反而更累。", tone: "negative" },
            { title: "边界模糊时掉能量", body: "一旦生活与工作持续侵入同一个心理空间，你会明显变得迟钝。", tone: "negative" },
            { title: "太晚停止", body: "你常在彻底没电后才承认自己需要休整。", tone: "negative" },
          ],
        },
      ],
      lockedBlocks: [
        {
          title: "What energizes you",
          overlayTitle: "解锁真正给你补能的条件",
          overlayBody: "看清哪些环境、节奏和关系会让你恢复判断力与行动感。",
          overlayCtaLabel: "解锁完整报告",
          blurredItems: [
            { title: "安静空间", body: "独处和低噪音能帮你重新收拢注意力。", isPlaceholder: true },
            { title: "有意义的对话", body: "深而真的交流比泛泛社交更能让你恢复。", isPlaceholder: true },
            { title: "可持续节奏", body: "你需要能长期维持的推进方式，而不是短期冲刺后透支。", isPlaceholder: true },
            { title: "价值对齐", body: "当做的事与你相信的事一致时，你更容易充满能量。", isPlaceholder: true },
            { title: "清晰边界", body: "允许自己停下和抽离，会让你的恢复效率更高。", isPlaceholder: true },
            { title: "阶段性完成感", body: "可见的小进展比空泛目标更能持续点亮你。", isPlaceholder: true },
          ],
        },
        {
          title: "What drains you",
          overlayTitle: "解锁最容易耗损你的模式",
          overlayBody: "查看哪些日常模式会悄悄拉低你的专注、情绪稳定和行动意愿。",
          overlayCtaLabel: "解锁完整报告",
          blurredItems: [
            { title: "长期高压协作", body: "持续被催促与打断，会显著消耗你的判断质量。", isPlaceholder: true },
            { title: "边界含混", body: "当所有需求都默认流向你时，你很快会疲惫。", isPlaceholder: true },
            { title: "价值失真", body: "当结果只剩数字而没有意义时，你会掉投入感。", isPlaceholder: true },
            { title: "表面社交", body: "高频但浅层的互动会让你很快失去耐心。", isPlaceholder: true },
            { title: "没有整理时间", body: "如果总来不及回看和整合，你会越来越分散。", isPlaceholder: true },
            { title: "过度自责", body: "把所有没做好的地方都解释成自己的问题，会持续拖低状态。", isPlaceholder: true },
          ],
        },
      ],
    },
    relationships: {
      intro: [
        "在关系里，你往往是那个会提前感知气氛变化、留意对方情绪细节的人。你重视的不是热闹，而是理解是否真实、回应是否细腻，以及两个人能否在关键处站到同一边。",
        "你愿意投入很深，但不喜欢把这种投入说成“我已经做了很多”。因此当关系失衡时，外界未必第一时间看得见你的委屈。学会更早表达需求，对你来说比继续硬撑更重要。",
      ],
      influentialTraits: [
        { label: "真诚", body: "关系要有真实感", colorKey: "blue" },
        { label: "耐心", body: "愿意慢慢理解", colorKey: "gold" },
        { label: "深度", body: "偏好高质量连接", colorKey: "green" },
        { label: "边界", body: "需要被尊重", colorKey: "purple" },
      ],
      visibleBlocks: [
        {
          title: "Strengths",
          items: [
            { title: "能提供高质量倾听", body: "你不只是听见字面内容，也会留意对方没说出口的部分。", tone: "positive" },
            { title: "重视关系修复", body: "你不逃避困难议题，更希望把误解拆开来认真处理。", tone: "positive" },
            { title: "对承诺敏感", body: "你会珍惜真正说到做到的人，也愿意为重要关系持续投入。", tone: "positive" },
            { title: "擅长建立安全感", body: "当你信任一个人时，通常能创造很稳定的情绪承接空间。", tone: "positive" },
            { title: "关系直觉强", body: "你能很快察觉互动里是亲近、疏离还是防御在上升。", tone: "positive" },
            { title: "愿意共同成长", body: "你在意的不只是当下舒服，还在意这段关系能否长期变好。", tone: "positive" },
          ],
        },
        {
          title: "Weaknesses",
          items: [
            { title: "需求表达偏晚", body: "你常常先理解、先体谅，直到真的撑不住才说出自己的委屈。", tone: "negative" },
            { title: "对敷衍反应强烈", body: "如果对方只回应表面而不愿真正沟通，你会迅速抽离。", tone: "negative" },
            { title: "容易独自消化失望", body: "你未必立刻冲突，但会在心里默默拉开距离。", tone: "negative" },
            { title: "把共情变成自我牺牲", body: "当你习惯优先照顾对方时，关系会慢慢失衡。", tone: "negative" },
            { title: "对不一致较敏感", body: "言行不一、承诺反复会很快动摇你的信任。", tone: "negative" },
            { title: "被误解时会退回沉默", body: "如果多次解释仍被忽视，你更可能选择安静退出。", tone: "negative" },
          ],
        },
      ],
      lockedBlocks: [
        {
          title: "Relationship superpowers",
          overlayTitle: "解锁你在关系中的稳定优势",
          overlayBody: "看清你最能给关系带来的支持感、理解力与修复能力。",
          overlayCtaLabel: "解锁完整报告",
          blurredItems: [
            { title: "细腻回应", body: "你会留意对方情绪变化，而不是只对事实做反应。", isPlaceholder: true },
            { title: "深度陪伴", body: "你更擅长长期陪跑而不是短期热情。", isPlaceholder: true },
            { title: "稳定承接", body: "你能为重要的人提供较强的安全感和被理解感。", isPlaceholder: true },
            { title: "修复意愿", body: "当关系值得时，你愿意认真处理困难时刻。", isPlaceholder: true },
            { title: "真诚表达", body: "一旦开口，你通常会非常认真地说出关键点。", isPlaceholder: true },
            { title: "长期投入", body: "你重视能一起成长的关系，而不是只追求即时满足。", isPlaceholder: true },
          ],
        },
        {
          title: "Relationship pitfalls",
          overlayTitle: "解锁你最常掉进去的关系陷阱",
          overlayBody: "查看哪些互动模式最容易让你受伤、沉默或慢慢抽离。",
          overlayCtaLabel: "解锁完整报告",
          blurredItems: [
            { title: "过度体谅", body: "你可能太早理解对方，却太晚照顾自己。", isPlaceholder: true },
            { title: "回避即时冲突", body: "短期不说并不会让问题消失，只会让失望累积。", isPlaceholder: true },
            { title: "对冷淡过度解读", body: "关系里的小失真很容易被你放大成更深的警讯。", isPlaceholder: true },
            { title: "默默后撤", body: "当你感觉不被重视时，常常会先收回投入而不是先提出需求。", isPlaceholder: true },
            { title: "边界延迟", body: "你有边界，但有时会拖到损耗很重才真正设下它。", isPlaceholder: true },
            { title: "对失望记忆长", body: "一旦重要承诺破裂，你的信任恢复通常不会很快。", isPlaceholder: true },
          ],
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把这份结果从“看懂自己”推进到“真正用起来”",
    body: "解锁后，你会看到更细的职业适配、成长节奏与关系模式，不再只停留在公开概览层。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与所有真实动作入口。",
  },
};

export default INFJ_ZH_CONTENT;
