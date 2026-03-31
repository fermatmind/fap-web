import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const ISTJ_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先确认规则、责任和执行顺序，再决定如何投入。外界常看到你的稳，真正稳定的是你对标准、可靠性和闭环的持续要求。",
  intro: [
  "ISTJ 更习惯先把事情放回规则、边界和现实约束里判断，而不是靠情绪或临时冲动推动。你会自然留意细节是否到位、责任是否明晰、流程是否真正能落地。",
  "这让你在执行、复盘、风控和长期维护里很有优势，也会让你对含糊承诺、反复改口和低标准运转更敏感。对你来说，稳不是保守，而是可信。"
],
  traits: {
    eyebrow: "人格概览",
    title: "稳而可验",
    value: "先看责任",
    body: "你更信任可验证的流程、清楚的边界和能闭环的承诺。",
    paragraphs: [
  "你不会天然被热闹和新鲜感带走，而会先看事情是不是说得清、做得到、能复盘。这个判断习惯让你在长期协作里常常成为最稳定的支点之一。",
  "但如果外部长期要求你在模糊前提下频繁变更方向，你的耐心会迅速下降。你需要的不是更多刺激，而是清楚、可信、可维护。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业场景里，你很适合承担那些需要流程稳定、责任明确、细节可靠和长期维护的职责。你未必最爱变动，但常常是那个能让系统真正运转起来的人。",
  "对你来说，好工作不一定要光鲜，但一定要可信。只要目标和规则清楚，你往往能把很多别人觉得普通的任务做出稳定质量。"
],
      influentialTraits: [
          { label: "流程", colorKey: "blue", body: "重视执行顺序" },
          { label: "责任", colorKey: "gold", body: "边界要明确" },
          { label: "细节", colorKey: "green", body: "会补齐漏洞" },
          { label: "闭环", colorKey: "purple", body: "事情要收住" }
        ],
      strengths: [
          { title: "流程稳定", body: "你能把一项工作做成可重复、可检验的流程。" },
          { title: "标准执行", body: "面对明确要求时，你通常能稳定交付。" },
          { title: "细节记忆强", body: "你会留意被别人忽略的小错误和断点。" },
          { title: "责任闭环", body: "只要归到你头上，你会倾向把事情收到底。" },
          { title: "风险控制稳", body: "你擅长提前看到执行中容易漏掉的环节。" },
          { title: "复盘扎实", body: "你会从结果回看流程哪里需要修整。" }
        ],
      weaknesses: [
          { title: "变动耐受低", body: "方向频繁改写时，你会明显失去稳定感。" },
          { title: "模糊环境不适", body: "边界不清和责任不明会快速拉高你的负担。" },
          { title: "表达温度少", body: "你说明规则时，别人可能先感到你太直接。" },
          { title: "容易自己扛", body: "你不喜欢别人掉链子，于是会先补上缺口。" },
          { title: "创新启动慢", body: "没看到明确收益之前，你不一定想先试。" },
          { title: "低标准敏感", body: "对反复失误和粗糙执行的容忍度通常不高。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位最能放大你的执行稳定度、风险控制和闭环能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种流程密度、授权边界和反馈方式里最稳。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是再更用力，而是允许自己在维持可靠性的同时保留弹性。你已经很会守住标准，下一步更关键的是别把所有变化都理解成风险。",
  "当你愿意把标准拆成核心项和可调整项，很多推进会更顺。成长不一定意味着放掉原则，而是学会判断哪些原则值得死守，哪些可以换方式实现。"
],
      influentialTraits: [
          { label: "稳定", colorKey: "blue", body: "重视可预测性" },
          { label: "复盘", colorKey: "gold", body: "会回看流程" },
          { label: "弹性", colorKey: "green", body: "学会留余地" },
          { label: "恢复", colorKey: "purple", body: "不要只靠硬撑" }
        ],
      strengths: [
          { title: "自律稳", body: "一旦确定规则，你通常能长期维持。" },
          { title: "复盘认真", body: "你会把问题追到真正可修的环节。" },
          { title: "责任感强", body: "面对长期任务时，你很少轻易失约。" },
          { title: "节奏可控", body: "你通常知道怎样让自己保持稳定产出。" },
          { title: "经验能沉淀", body: "你会把做过的事慢慢变成更稳的方法。" },
          { title: "对长期积累有耐心", body: "只要方向可信，你愿意一点点做实。" }
        ],
      weaknesses: [
          { title: "放松难建立", body: "即使停下来，你也可能继续在脑中检查细节。" },
          { title: "变化先当风险", body: "新方法出现时，你可能先看见不稳定因素。" },
          { title: "对自己要求硬", body: "你容易把可修的问题先解释成自己没做到。" },
          { title: "恢复被延后", body: "你常常先把责任做完，再考虑自己累不累。" },
          { title: "情绪表达少", body: "不舒服时你未必会立刻说出来。" },
          { title: "容错空间小", body: "当现实没按计划运行时，你容易先收紧自己。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些节奏和恢复方式最能让你的稳定优势继续放大。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些僵硬、过度负责和延迟恢复最容易拖慢你。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你更看重可靠、说到做到和长期一致，而不是高频起伏。你不一定把在意都挂在嘴上，但会用实际行动判断和表达这段关系值不值得继续。",
  "你能给关系带来很强的稳定感，但如果对方长期含糊、反复或不守边界，你的信任会掉得很快。对你来说，亲密感离不开可依赖。"
],
      influentialTraits: [
          { label: "可靠", colorKey: "blue", body: "重视兑现" },
          { label: "边界", colorKey: "gold", body: "关系要清楚" },
          { label: "责任", colorKey: "green", body: "愿意长期负责" },
          { label: "克制", colorKey: "purple", body: "不爱夸张表达" }
        ],
      strengths: [
          { title: "稳定感强", body: "你会用持续行动而不是一时热度表达在意。" },
          { title: "承诺兑现", body: "只要答应了，你通常会认真做到。" },
          { title: "边界明确", body: "你知道什么是应尽义务，什么不是默认责任。" },
          { title: "生活秩序稳", body: "你能给关系带来可依赖的日常和节奏。" },
          { title: "问题不拖延", body: "很多实际问题你会倾向尽快处理。" },
          { title: "长期投入稳", body: "认定这段关系后，你通常会持续负责。" }
        ],
      weaknesses: [
          { title: "温度表达短", body: "你的在意很多时候要靠行动解读，不一定靠语言。" },
          { title: "对含糊耐心低", body: "关系边界长期模糊时，你会明显失去安全感。" },
          { title: "容错偏少", body: "对反复失信和低质量承诺的耐心通常不高。" },
          { title: "不爱重复安抚", body: "如果同一个问题总要重复确认，你会疲惫。" },
          { title: "失望后偏沉默", body: "你未必当场爆发，但会慢慢收回投入。" },
          { title: "关系变得太像责任", body: "在压力下，你可能更关注运转而少了柔软回应。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最稳定的承诺模式、支持方式与可靠优势。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些表达克制和容错偏低最容易让关系失衡。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的稳定执行力用在更对的地方",
    body: "解锁后可继续查看更细的职业路径、成长边界与关系模式，让可靠不再只是埋头承担。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与真实动作入口。",
  },
});

export default ISTJ_ZH_CONTENT;
