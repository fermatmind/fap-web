import type { Questionnaire } from "@/lib/questionnaires/types";
export const supportReflectionSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "Considering psychological support: what this reflection offers",
      "zh": "考虑心理支持：这份个人回顾提供什么"
    },
    "paragraphs": [
      {
        "en": "Eighteen original statements organise four topics: concerns you have been carrying, effects on everyday activities, support and practical conditions, and questions about professional support. The topics contain four, four, five and five statements respectively. They provide a structure for your own observations, not a validated model of treatment need.",
        "zh": "十八条原创陈述围绕四个主题整理观察：最近承受的困扰、对日常活动的影响、支持与实际条件，以及关于专业支持的疑问。四个主题分别有四、四、五、五条，用来组织本人经历，不是经过验证的治疗需要模型。"
      },
      {
        "en": "The result shows every selected label and six category counts for each topic. All four complete guides are public before answering. You can use the page to clarify what you want to discuss without accepting a diagnosis, receiving a therapy recommendation or committing to an appointment.",
        "zh": "结果展示逐条所选标签和各主题的六类计数，四篇完整指南在作答前就可阅读。可以借此整理想讨论的事情，无需接受诊断、获取治疗推荐或承诺预约。"
      }
    ]
  },
  {
    "id": "timeframes",
    "title": {
      "en": "Two time references, one set of response labels",
      "zh": "两个时间参照与同一套回答类别"
    },
    "paragraphs": [
      {
        "en": "The first eight statements refer to the past four weeks; the final ten concern current support conditions and questions. Keep the reference stated above each item. The first period helps recall an experience; it does not require waiting four weeks before asking for help.",
        "zh": "前八条陈述回顾过去四周，后十条关注当前支持条件和疑问，请按每条上方的时间参照阅读。前一个时间范围用于回想经历，不是要求等待四周才能询问帮助。"
      },
      {
        "en": "Choose whether the description fits your situation, partly fits or does not fit. These are not frequency labels: Partly describes my situation now does not mean Sometimes, a particular number of days or half of a symptom. No conversion to a frequency scale is supplied.",
        "zh": "请选择描述符合、部分符合或不符合自己的情况。这些不是频率标签：“部分符合我当前情况”不等于“有时”、固定天数或半个症状，页面不提供向频率量表的换算。"
      }
    ]
  },
  {
    "id": "topics",
    "title": {
      "en": "Concerns, daily effects, resources and questions can coexist",
      "zh": "困扰、日常影响、资源与疑问可以并存"
    },
    "paragraphs": [
      {
        "en": "A recurring concern and its effects on daily activities answer different questions. For example, thinking about a problem repeatedly and finding a usual task harder to complete are related observations, but one cannot establish the other or identify a cause. Read the individual statements alongside an actual setting.",
        "zh": "反复出现的困扰与对日常活动的影响回答不同问题。例如反复想到一件事，与发现惯常任务更难完成，可以同时出现，但不能由其中一项确定另一项或识别原因。应结合实际场景阅读逐条陈述。"
      },
      {
        "en": "Support conditions include resources as well as practical obstacles; questions about care include what you would want to know. A Fits response therefore has different meanings across statements. Having someone to talk to does not cancel a concern, and having questions does not establish unwillingness or readiness for therapy.",
        "zh": "支持条件同时涉及资源与实际障碍，关于专业支持的疑问涉及自己想了解什么。因此，“符合”在不同陈述中含义不同：有人可以倾诉不抵消困扰，存在疑问也不能说明不愿咨询或已经准备好接受治疗。"
      }
    ]
  },
  {
    "id": "category-example",
    "title": {
      "en": "Read category counts without turning them into a score",
      "zh": "怎样阅读类别计数，而不把它当分数"
    },
    "paragraphs": [
      {
        "en": "For a hypothetical four-statement topic, selecting Not now, Partly, Fits and Cannot judge produces counts of 1, 1, 1, 1, 0 and 0 in the six displayed categories. The counts add to four statements. They do not count four events, four symptoms or four points.",
        "zh": "假设一个四条陈述的主题依次选择不符合、部分符合、符合和无法判断，六个展示类别的计数为1、1、1、1、0、0，合计四条陈述，不是四次事件、四个症状或四分。"
      },
      {
        "en": "A five-statement topic has five labels to organise, so raw counts across topics are not comparable measures of importance. The output has no weighted sum, average, highest theme, percentage, readiness tier, stage of change or threshold for seeking care.",
        "zh": "五条陈述的主题需要整理五个标签，因此不同主题的原始计数不能用来比较重要程度。输出没有加权总和、均值、最高主题、百分比、准备等级、改变阶段或求助阈值。"
      }
    ]
  },
  {
    "id": "missing-categories",
    "title": {
      "en": "Cannot judge, no relevant experience and withholding are distinct",
      "zh": "无法判断、没有相关经历与不愿回答分别保留"
    },
    "paragraphs": [
      {
        "en": "Partly means the description fits to some extent. Cannot judge records uncertainty about whether it fits. No relevant experience records that the situation does not apply to your experience; Prefer not to answer protects your choice not to disclose. These categories are kept separately, without assigning them zero points.",
        "zh": "“部分符合”表示描述在一定程度上符合；“无法判断”保留是否符合的不确定性；“没有相关经历”表示缺少相应经历；“不愿回答”保留不披露的选择。各类别分别记录，不赋零分。"
      },
      {
        "en": "Every statement needs an explicit category to organise a complete record, but any or all eighteen can use these three non-judgment categories. Such a record describes the available information, not an all-clear finding. You can leave midway and still read all four guides and the support information.",
        "zh": "整理完整记录需要为每条明确选择类别，但十八条中的任意一条或全部都可以选择上述三类。这样的记录描述现有信息，不是“一切没事”的结论。中途离开也可以阅读四篇完整指南和支持说明。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Personal reflection, clinical screening and treatment decisions",
      "zh": "个人回顾、临床筛查与治疗决定的区别"
    },
    "paragraphs": [
      {
        "en": "This edition is an original reflection, not an administration or translation of K10, PHQ-4, PHQ-9, GAD-7 or a readiness-for-change scale. It has no established clinical cutoffs, norms, reliability estimates or demonstrated English–Chinese measurement equivalence. Sharing a topic with a published measure does not supply that measure’s evidence.",
        "zh": "本版本是原创回顾，不是K10、PHQ-4、PHQ-9、GAD-7或改变准备量表的施测或翻译。尚无已建立的临床界点、常模、信度估计或中英文测量等值证据；与发表工具讨论相似主题，不意味着获得其测量证据。"
      },
      {
        "en": "NIMH describes psychotherapy as a range of treatments addressing troubling emotions, thoughts and behaviours, with treatment choices considered in light of individual needs and circumstances with a professional. This is background about care, not evidence that this inventory can identify who needs which treatment. [1]",
        "zh": "美国国家心理健康研究所将心理治疗描述为处理困扰性情绪、思维与行为的多类治疗，并说明治疗选择应结合个人需要和情况与专业人士讨论。这提供专业支持的背景，不证明本题组能识别谁需要哪种治疗。[1]"
      }
    ]
  },
  {
    "id": "conversation",
    "title": {
      "en": "Questions to bring to an initial conversation",
      "zh": "初次沟通时可以询问什么"
    },
    "paragraphs": [
      {
        "en": "NIMH suggests asking about qualifications, relevant experience, approach and evidence, goals, progress review, confidentiality and its limits, and fees. You may use these as questions when exploring a service; this reflection does not verify a provider or recommend a particular approach. [1]",
        "zh": "美国国家心理健康研究所建议询问资质、相关经验、方法及其证据、目标、进展回顾、保密及其限制，以及费用。了解服务时可以参考这些问题，本回顾不核验某位服务者，也不推荐特定方法。[1]"
      },
      {
        "en": "An optional preparation note could describe one situation, what has been difficult and what you would like clarified. You decide whether to make or share it. This page asks for no written account, contact details or appointment request, and completing it is not a prerequisite for contacting support.",
        "zh": "如有帮助，可私下整理一个场景、其中的困难和想澄清的问题，是否记录或分享由自己决定。页面不索取书面经历、联系方式或预约申请，完成练习也不是联系支持的前提。"
      }
    ]
  },
  {
    "id": "privacy",
    "title": {
      "en": "Read or repeat privately without a readiness verdict",
      "zh": "私下阅读或再次回顾，不生成准备程度判定"
    },
    "paragraphs": [
      {
        "en": "Answers remain in this page’s memory. Exiting and clearing, retaking, reloading or leaving clears the private record; no answer draft is saved. Copy public entry copies only the title and public address. The public guides contain no visitor’s answers or category counts.",
        "zh": "回答仅留本页内存；退出清除、重做、刷新或离页会清除私人记录，不保存回答草稿。“复制公开入口”仅复制标题和公开地址，公开指南不包含访客回答或类别计数。"
      },
      {
        "en": "If you repeat the reflection, consider the period, circumstances and individual labels rather than treating a different record as clinical improvement or deterioration. There is no measurement-error estimate or change threshold here. Support can be discussed without completing the form, reaching a count or waiting for another result.",
        "zh": "再次回顾时，应结合时间范围、情境与逐条标签理解差异，不把记录变化当作临床改善或恶化。本版本没有测量误差估计或变化界点；无需完成题组、达到计数或等待下一次结果，也可以询问支持。"
      }
    ]
  }
];
export const supportReflectionFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is Partly a frequency such as Sometimes?",
      "zh": "“部分符合”是“有时”这样的频率吗？"
    },
    "answer": {
      "en": "No. It describes how well a statement fits your situation. It does not specify days or occurrences.",
      "zh": "不是。它描述陈述与本人情况的符合程度，不规定天数或发生次数。"
    }
  },
  {
    "question": {
      "en": "Why do the four themes have different denominators?",
      "zh": "为什么四个主题的分母不同？"
    },
    "answer": {
      "en": "The first two contain four statements each; the last two contain five each. Counts describe labels within each topic, not comparable scores.",
      "zh": "前两个主题各四条，后两个各五条；计数描述各主题内部的标签，不是可相互比较的分数。"
    }
  },
  {
    "question": {
      "en": "Does Fits always indicate a greater difficulty?",
      "zh": "“符合”是否总表示困难更多？"
    },
    "answer": {
      "en": "No. Statements include concerns, available resources, barriers and questions, so their meanings differ.",
      "zh": "不是。陈述涉及困扰、已有资源、障碍和疑问，各自含义不同。"
    }
  },
  {
    "question": {
      "en": "Can all eighteen answers be withheld?",
      "zh": "十八条都可以不愿回答吗？"
    },
    "answer": {
      "en": "Yes. Explicit withholding produces a complete categorical record without implying an absence of difficulty or need.",
      "zh": "可以。明确选择不愿回答能够形成完整类别记录，不表示没有困难或需要。"
    }
  },
  {
    "question": {
      "en": "Must I wait four weeks before asking for support?",
      "zh": "询问支持前必须等待四周吗？"
    },
    "answer": {
      "en": "No. Four weeks is a recall period for the first eight statements, not a waiting rule.",
      "zh": "不必。四周是前八条的回顾时间范围，不是等待规则。"
    }
  },
  {
    "question": {
      "en": "Does a changed record prove that therapy helped?",
      "zh": "记录变化能证明治疗有效吗？"
    },
    "answer": {
      "en": "No. This form has no validated change threshold or method for attributing a change to treatment.",
      "zh": "不能。本题组没有经验证的变化界点，也没有把变化归因于治疗的方法。"
    }
  },
  {
    "question": {
      "en": "Is this a therapist-matching service?",
      "zh": "这里会匹配心理咨询师吗？"
    },
    "answer": {
      "en": "No. It provides personal category records and public guides, without provider selection or appointment submission.",
      "zh": "不会。这里提供个人类别记录与公开指南，不选择服务者或提交预约。"
    }
  },
  {
    "question": {
      "en": "Is an agreement checkbox required before the first statement?",
      "zh": "进入第一条前要勾选同意吗？"
    },
    "answer": {
      "en": "No. Begin reflection opens the first statement directly. Instructions and the support information remain available.",
      "zh": "不需要。点击开始自我回顾直接进入第一条，作答说明与支持信息仍可阅读。"
    }
  }
];
