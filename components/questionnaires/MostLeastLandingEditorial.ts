import type { Questionnaire } from "@/lib/questionnaires/types";
export const mostLeastLandingSections: Questionnaire["guide"] = [
  {
    "id": "ml-reading-purpose",
    "title": {
      "en": "Caliper-style Most/Least practice: understand the interaction first",
      "zh": "Caliper风格最符合／最不符合练习：先熟悉选择方式"
    },
    "paragraphs": [
      {
        "en": "This independent practice presents sixteen blocks of four original statements. In each block, select one statement that is Most like you and a different statement that is Least like you in ordinary recent work or study. You make thirty-two selections in total, then receive eight complete topic records and reading guides.",
        "zh": "本独立练习提供十六组原创四陈述题块。每组结合近期普通工作或学习，选一条最符合自己的陈述，再选另一条最不符合自己的陈述；全卷共有三十二次选择，完成后呈现八主题完整记录与阅读指南。"
      },
      {
        "en": "The practical aim is to become familiar with making a relative choice when several statements may sound reasonable. The eight topics were written for this exercise. They are not official Caliper scales, an employer’s preferred profile or a predictor of selection outcomes. No invitation, employer name or personal work history is needed to use this page.",
        "zh": "练习目的在于熟悉相对选择：同组多条陈述可能都合理，但仍需要作出取舍。八主题是为本练习写作的，不是Caliper官方量表、雇主理想画像或录用结果预测。使用本页无需测评邀请、雇主名称或个人工作经历。"
      }
    ]
  },
  {
    "id": "ml-reading-response",
    "title": {
      "en": "What Most and Least mean inside one block",
      "zh": "同组中的最符合与最不符合是什么意思"
    },
    "paragraphs": [
      {
        "en": "Most means the statement you judge relatively more characteristic among the four shown. Least means a different statement you judge relatively less characteristic in that same comparison. Least is not an admission that the behavior is bad, and Most does not certify that you always perform it well. The two statements left unselected receive neither count.",
        "zh": "最符合表示在当前四条中，你判断相对更符合自己的陈述；最不符合表示在同组比较中相对更不符合自己的另一条。最不符合不表示承认某行为不好，最符合也不认证你总能做好它。剩余两条未选陈述不获得任何一类计数。"
      },
      {
        "en": "When several statements fit, use a recent ordinary setting to compare what you tend to do first or more readily. When none fits, compare their relative relevance only if that is meaningful to you. You can change either choice, go back to earlier blocks, clear a block or leave without generating a complete record.",
        "zh": "几条都符合时，可以回到最近一个普通场景，比较自己更常先做什么、什么做起来更自然。都不符合时，只在比较对你有意义的前提下考虑相对关联；可以修改任一选择、返回前组、清空本组，或不生成完整记录直接结束。"
      }
    ]
  },
  {
    "id": "ml-reading-topics",
    "title": {
      "en": "Eight topics describe actions, not eight types of employee",
      "zh": "八主题描述动作，不划分八种员工类型"
    },
    "paragraphs": [
      {
        "en": "The first four topics are sharing context, trying a small alternative, finishing a bounded step and organizing details. They concern making a request understandable, considering another route, completing a defined piece of work and making information easier to use. A count describes selection of the statements attached to each topic.",
        "zh": "前四主题是交代来龙去脉、小步尝试替代方案、完成一个明确步骤与整理细节，分别关注让请求容易理解、考虑另一条路径、完成有边界的一部分工作，以及让信息更便于使用。次数描述的是你对所属陈述的选择。"
      },
      {
        "en": "The other four are clarifying constraints, checking shared understanding, following up on an agreement and pausing before responding. The names help you examine specific choices without treating them as leadership, intelligence, emotional stability or conscientiousness scores. All eight remain visible in the same order rather than competing for a winning label.",
        "zh": "另四主题是澄清限制条件、核对共同理解、跟进已有约定与回应前留一点停顿。名称帮助核对具体选择，不据此生成领导力、智力、情绪稳定或尽责性分数。八项始终按相同顺序完整显示，不竞争一个获胜标签。"
      }
    ]
  },
  {
    "id": "ml-reading-arithmetic",
    "title": {
      "en": "Most, Least and difference: a complete worked example",
      "zh": "最符合、最不符合与差值：完整算例"
    },
    "paragraphs": [
      {
        "en": "For each topic, Most is the number of its statements selected as Most, Least is the number selected as Least, and difference is Most minus Least. Each topic appears eight times, twice in each of the four positions. A topic can therefore have zero to eight Most selections, zero to eight Least selections and a difference from minus eight to plus eight. Most plus Least cannot exceed eight, because one appearance cannot receive both selections.",
        "zh": "每主题的最符合次数，是其陈述被选为最符合的数量；最不符合次数同理；差值等于最符合减最不符合。每主题出现八次，在四个位置各两次。因此两类次数各为零至八，差值范围为负八至正八。同一次出现不能同时获得两类选择，因此最符合与最不符合次数之和不超过八。"
      },
      {
        "en": "For example, four Most selections and one Least selection give a difference of three, with three appearances unselected. Two Most and two Least give zero, but zero Most and zero Least also give zero. These records describe different choices despite the same difference, which is why both counts remain visible.",
        "zh": "例如最符合四次、最不符合一次，差值为三，另有三次出现未选；最符合二次、最不符合二次，差值为零，但两类都零次的差值也为零。相同差值可能来自不同选择，所以两类次数始终分别展示。"
      }
    ]
  },
  {
    "id": "ml-reading-dependence",
    "title": {
      "en": "Why these counts depend on one another",
      "zh": "为什么这些次数相互依赖"
    },
    "paragraphs": [
      {
        "en": "Every completed block contributes exactly one Most and one Least selection. Across sixteen completed blocks, the eight Most counts sum to sixteen, the eight Least counts sum to sixteen, and their differences sum to zero. A larger count for one topic uses a choice that cannot also go to another topic in that block.",
        "zh": "每个完整题块恰好贡献一次最符合与一次最不符合；十六组完成后，八项最符合合计十六、最不符合合计十六、差值合计为零。某主题多得到一次选择，该次选择就不能同时给同组另一主题。"
      },
      {
        "en": "This is a within-person, fixed-menu comparison. It does not place you above or below another person, and a low difference is not a missing skill. Compare the statements and circumstances behind a record rather than assuming that the eight differences are independent measures of how much of each quality you possess.",
        "zh": "这是同一个人在固定菜单内的相对比较，不把你放在另一人之上或之下，较低差值也不表示缺少技能。应比较记录背后的陈述与情境，而不是假设八个差值分别独立测出了你拥有多少某种品质。"
      }
    ]
  },
  {
    "id": "ml-reading-evidence",
    "title": {
      "en": "A forced-choice format is not a validated scoring model",
      "zh": "强制选择题式与经过验证的计分模型不是一回事"
    },
    "paragraphs": [
      {
        "en": "Research on forced-choice questionnaires distinguishes traditional ipsative scoring from models designed to estimate individual differences. Brown and Maydeu-Olivares discuss an item-response approach to these measurement problems. That research concerns model assumptions and estimation; it does not make a simple Most-minus-Least calculation a calibrated scale.",
        "zh": "强制选择问卷研究区分传统自比性计分与估计个体差异的模型。Brown与Maydeu-Olivares讨论了处理这些测量问题的项目反应模型；研究涉及模型假设与估计，并不使简单的最符合减最不符合自动成为校准量表。"
      },
      {
        "en": "This practice uses transparent raw counts only. It has no fitted item parameters, reference sample, percentile conversion or employer job model. Balanced exposure is a property of the exercise’s layout, not proof of reliability, validity or resistance to coached answers. Its results are a record to reflect on, not a substitute for a published assessment.",
        "zh": "本练习只使用透明原始次数，没有拟合题目参数、参照样本、百分位换算或雇主岗位模型。均衡出现是练习编排的属性，不证明信度、效度或抵抗答题辅导的效果。结果可供回看选择，不替代正式测评。"
      }
    ]
  },
  {
    "id": "ml-reading-official",
    "title": {
      "en": "What this exercise covers compared with a formal invitation",
      "zh": "本练习与正式测评邀请的范围分别是什么"
    },
    "paragraphs": [
      {
        "en": "Talogy’s official design information describes forced-choice, agreement-rating and abstract-reasoning formats for the Caliper Profile, with norm-group processing. This page practises one interaction using independently authored content. It does not reproduce the official statements, trait inventory, reasoning section, scoring or reports.",
        "zh": "Talogy官方设计资料介绍Caliper Profile的强制选择、同意程度评分与抽象推理题式，以及常模组处理。本页用独立原创内容练习一种交互，不复制官方陈述、特质目录、推理部分、计分或报告。"
      },
      {
        "en": "If an organization has invited you to an assessment, use its actual instructions for access, permitted assistance, timing and any accommodation requests. The practice page cannot reveal what the organization will ask or how it will evaluate an applicant. Familiarity with selecting two different responses should not be confused with a guaranteed performance or hiring benefit.",
        "zh": "如果收到某机构的测评邀请，应按真实说明确认访问方式、允许的帮助、用时安排与便利措施申请。本练习不能揭示该机构将问什么或怎样评估申请者；熟悉选择两条不同回应，不代表保证提高测评表现或录用机会。"
      }
    ]
  },
  {
    "id": "ml-reading-reflection",
    "title": {
      "en": "Read all eight guides and use examples to interpret your choices",
      "zh": "结合实例阅读全部八篇指南"
    },
    "paragraphs": [
      {
        "en": "The guides explain the topic, an ordinary example, what Most and Least selections may reflect, trade-offs and a possible next observation. Look for actual occasions that support or contradict a description. For example, pausing before a reply may mean checking a detail in one setting and waiting for another person’s input in another; the count does not identify a single cause.",
        "zh": "指南解释主题、普通实例、两类选择可能反映什么、取舍与可选的下一步观察。可以寻找支持或不支持描述的实际场景。例如回应前停顿，在一种情境可能为了核对细节，在另一种情境可能为了等他人的信息；次数不识别单一原因。"
      },
      {
        "en": "Answers stay in this open page’s memory and are removed on clearing, leaving, reloading or changing language. There is no saved draft. Copying shares only the public practice link. You may read the public guides without completing the exercise, and any later work-habits or Big Five exploration is optional and uses its own questions.",
        "zh": "答案只留在当前打开页面的内存，清除、离开、刷新或换语言会移除，没有保存草稿。复制只分享公开练习链接。不完成练习也能读公开指南；之后若探索工作习惯或大五，也属自愿，并使用各自独立题目。"
      }
    ]
  }
];
export const mostLeastLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is Least a wrong answer?",
      "zh": "最不符合是错误答案吗？"
    },
    "answer": {
      "en": "No. It is the relatively less characteristic statement among the four in that block. The practice does not mark any statement as a correct or incorrect personality answer.",
      "zh": "不是。它表示该组四条中相对更不符合自己的陈述，本练习不把人格回应判为对错。"
    }
  },
  {
    "question": {
      "en": "Why are the other two statements not scored?",
      "zh": "为什么另外两条不计数？"
    },
    "answer": {
      "en": "Each block asks for one Most and one different Least. The remaining statements are unselected, not neutral ratings or evidence that you lack the associated behavior.",
      "zh": "每组只选一条最符合和另一条最不符合。剩余陈述是未选，不是中立评分，也不证明你缺少相关行为。"
    }
  },
  {
    "question": {
      "en": "Can both counts for one topic be zero?",
      "zh": "一个主题两类次数都可能为零吗？"
    },
    "answer": {
      "en": "Yes. Its statements can be left unselected when other statements are chosen. A zero difference also arises when Most and Least are equal above zero, so read both counts.",
      "zh": "可以。它的陈述出现时可以都选其他陈述。差值为零也可能来自非零而相等的两类次数，因此应分别阅读次数。"
    }
  },
  {
    "question": {
      "en": "Why do all differences sum to zero?",
      "zh": "为什么全部差值合计为零？"
    },
    "answer": {
      "en": "Every completed block adds one Most and one Least count. Sixteen of each are recorded overall, so subtracting the totals gives zero. This is an arithmetic property of the format, not an average-person score.",
      "zh": "每组完成后增加一次最符合与一次最不符合，全卷各十六次，相减自然为零。这是题式的运算属性，不是普通人的平均分。"
    }
  },
  {
    "question": {
      "en": "Does a difference of eight mean I am better than other people?",
      "zh": "差值为八意味着我比别人更好吗？"
    },
    "answer": {
      "en": "No. It means Most was selected on all eight appearances and Least on none. It supplies no population comparison, ability estimate or official Caliper conversion.",
      "zh": "不是。它表示该主题八次出现均选最符合、从未选最不符合，不提供人群比较、能力估计或官方Caliper换算。"
    }
  },
  {
    "question": {
      "en": "Can I use a previous personality result to fill this in?",
      "zh": "可以按照以前的人格结果来填吗？"
    },
    "answer": {
      "en": "The exercise asks you to compare the actual statements in a recent ordinary context. It has no conversion from MBTI, Big Five or another assessment, and no preferred profile to reproduce.",
      "zh": "本练习让你结合近期普通情境比较实际陈述，没有MBTI、大五或其他测评换算，也没有需要复现的理想画像。"
    }
  },
  {
    "question": {
      "en": "Is the eight-topic record a complete ranking of all four statements?",
      "zh": "八主题记录包含每组四条的完整排序吗？"
    },
    "answer": {
      "en": "No. It records only one Most and one Least in each block. The two unselected statements are not ordered, and their relative positions cannot be recovered from the counts.",
      "zh": "不包含。每组只记录一条最符合与一条最不符合，另外两条没有排序，无法从次数还原它们的相对位置。"
    }
  },
  {
    "question": {
      "en": "Will the page ask for an employer invitation or agreement before starting?",
      "zh": "开始前要提供雇主邀请或勾选同意吗？"
    },
    "answer": {
      "en": "No employer invitation is needed. Start practice opens block one directly. The separate anonymous activity-count permission is optional, off by default and does not unlock questions or guides.",
      "zh": "不需要雇主邀请。“开始练习”直接打开第一组；另设的匿名动作统计许可是可选项，默认关闭，不用于解锁题目或指南。"
    }
  }
];
export const mostLeastLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Brown & Maydeu-Olivares (2011): item-response modeling of forced-choice questionnaires",
      "zh": "Brown与Maydeu-Olivares（2011）：强制选择问卷的项目反应模型"
    },
    "url": "https://kar.kent.ac.uk/29626/"
  }
];
