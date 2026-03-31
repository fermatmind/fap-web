import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const ENFJ_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会自然观察群体里的节奏、情绪和位置变化，再决定如何把人重新带回同一条线。很多人先感受到的是你的带动感，真正稳定的是你对关系结构的判断。",
  intro: [
  "ENFJ 往往擅长在复杂关系里搭共识、给反馈、调节气氛，并把模糊目标翻译成别人愿意跟进的路径。你不只是会照顾人，更会判断一群人怎样才能继续一起往前走。",
  "这让你在组织、带队、协调和长期陪跑里很有优势，也会让你更容易把别人的状态、期待和问题提前背到自己身上。对你来说，带动别人和保护自己需要同时成立。"
],
  traits: {
    eyebrow: "人格概览",
    title: "带动感很强",
    value: "共识优先",
    body: "你会自然感知群体状态，并尝试把人重新拉回更有方向感的节奏。",
    paragraphs: [
  "你不只是重视关系和气氛，而是会本能地判断一个人、一段合作或一个团队目前最需要的是什么：是被理解、被点醒、被鼓励，还是被拉回重点。",
  "但这也会让你更容易超量承担。你很擅长推动别人进步，却不一定总能及时承认自己也需要边界、停顿和被支持。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业场景里，你很适合承担那些需要搭共识、推动协作、稳定节奏和长期影响人的角色。你不仅会做事，也会留意一件事怎样才能让更多人愿意持续参与。",
  "比起只看结果，你更擅长兼顾关系质量和推进质量。这让你在教育、咨询、组织发展、团队管理、客户协同等场景里通常很有优势。"
],
      influentialTraits: [
          { label: "共识", colorKey: "blue", body: "会搭共识" },
          { label: "反馈", colorKey: "gold", body: "知道怎么提醒" },
          { label: "带动", colorKey: "green", body: "能把人带起来" },
          { label: "陪跑", colorKey: "purple", body: "擅长长期支持" }
        ],
      strengths: [
          { title: "群体感知强", body: "你能较快看出团队里谁掉队、谁失焦、谁需要被接住。" },
          { title: "共识搭建", body: "你擅长把不同人的诉求拉到同一条可执行路径上。" },
          { title: "反馈有方向", body: "你知道何时该鼓励，何时该直接点明问题。" },
          { title: "长期陪跑稳", body: "你适合做那种需要持续陪伴和推进的人际型角色。" },
          { title: "鼓舞推进", body: "你能让人不只是听懂要求，还愿意继续投入。" },
          { title: "协调多方", body: "面对多角色协作时，你能维持关系和进度两条线。" }
        ],
      weaknesses: [
          { title: "替别人扛太多", body: "你会过早补位，结果把系统问题背成自己的责任。" },
          { title: "标准压得高", body: "你对自己和别人都有较高期待，久了会累。" },
          { title: "难停下来", body: "即使已经消耗，你也可能继续把别人往前带。" },
          { title: "边界推迟", body: "为了维持关系和节奏，你会太晚说出自己的限制。" },
          { title: "对冷淡敏感", body: "如果对方长期回应冷淡，你会明显掉能量。" },
          { title: "维稳优先", body: "有时你会先保气氛，延后真正需要谈的问题。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位最能放大你的组织、带动与长期影响力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种协作密度、授权边界和反馈机制里最稳。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是再变得更有责任感，而是把责任感和边界感一起拉齐。你已经很会支持别人，下一步更关键的是别让支持自动变成长期自我透支。",
  "当你愿意把帮助别人和照顾自己看作同一件系统工程，很多内耗会显著下降。真正可持续的带动，不是永远顶在前面，而是知道什么时候该让位、该停、该重新分配。"
],
      influentialTraits: [
          { label: "承担", colorKey: "blue", body: "愿意往前站" },
          { label: "边界", colorKey: "gold", body: "要学会保留自己" },
          { label: "修复", colorKey: "green", body: "会收拾关系张力" },
          { label: "调速", colorKey: "purple", body: "别一直满档" }
        ],
      strengths: [
          { title: "责任心高", body: "你会主动把重要事情接住，不喜欢放着不管。" },
          { title: "成长意愿强", body: "只要认定方向对人有帮助，你通常愿意持续修正。" },
          { title: "经验能转方法", body: "你会把一次次协作经验整理成更成熟的做法。" },
          { title: "修复张力快", body: "人际出现摩擦时，你常能较快拉回关系。" },
          { title: "支持能力强", body: "你擅长让别人感到被看见、被推动、被照顾。" },
          { title: "长期韧性足", body: "只要方向有意义，你能维持很长的投入周期。" }
        ],
      weaknesses: [
          { title: "过量承担", body: "你容易把团队失衡先解释成自己没做够。" },
          { title: "恢复滞后", body: "你常在明显透支后才承认自己需要休整。" },
          { title: "边界说晚", body: "为了避免让别人失望，你会拖着不说限制。" },
          { title: "对评价敏感", body: "如果外部反馈长期模糊，你容易自我怀疑。" },
          { title: "关系优先过头", body: "你可能为了维持合作，延后应有的调整和止损。" },
          { title: "难把注意力拉回自己", body: "你很会关注别人，却不一定会持续关注自己。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些节奏、支持和恢复条件最能保护你的带动能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些过量承担和边界延后最容易拖慢你的成长。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你会自然留意双方的节奏、需求和情绪位置，并尝试让关系回到更稳的轨道。你重视亲密，也重视这段亲密是否在往更成熟的方向走。",
  "你能提供很多理解和推动，但如果关系长期只让你做那个照顾和修复的人，你会慢慢疲惫。对你来说，被需要并不等于被真正照顾。"
],
      influentialTraits: [
          { label: "照顾", colorKey: "blue", body: "会主动接住人" },
          { label: "带动", colorKey: "gold", body: "想让关系变好" },
          { label: "回应", colorKey: "green", body: "对节奏很敏锐" },
          { label: "边界", colorKey: "purple", body: "需要被反向照顾" }
        ],
      strengths: [
          { title: "会主动照顾", body: "你会很自然地留意对方状态并给出回应。" },
          { title: "关系推进感强", body: "你不喜欢关系停在模糊状态，而会推动它更清楚。" },
          { title: "沟通有温度", body: "你能让重要的话题既清楚又不失体面。" },
          { title: "修复意愿高", body: "你不回避摩擦，更希望把误解处理掉。" },
          { title: "长期陪伴稳", body: "对重要关系，你通常愿意持续投入和照看。" },
          { title: "能给安全感", body: "当你信任一段关系时，会主动创造稳定感。" }
        ],
      weaknesses: [
          { title: "先照顾后表达", body: "你常常先顾对方，最后才轮到自己。" },
          { title: "需求藏太深", body: "如果不被追问，你未必会主动说出真正的委屈。" },
          { title: "对冷回应敏感", body: "长期被敷衍会迅速削弱你的投入感。" },
          { title: "维持关系过度", body: "你可能为了不让局面失衡而承担过多修复工作。" },
          { title: "边界延迟", body: "很多不舒服你能感觉到，但不一定会马上划出来。" },
          { title: "把失衡内化", body: "关系出问题时，你容易先觉得是自己做得不够。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最稳定的支持方式、沟通优势与修复能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些照顾过量和边界延迟最容易让你在关系里耗尽。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的带动能力用在更对的场景",
    body: "解锁后可继续查看更细的职业协作、成长边界与关系节奏，让带动别人不再以透支自己为代价。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与所有真实动作入口。",
  },
});

export default ENFJ_ZH_CONTENT;
