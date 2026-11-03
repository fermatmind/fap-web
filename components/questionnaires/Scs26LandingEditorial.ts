import type { Questionnaire } from "@/lib/questionnaires/types";

export const scs26LandingSections: Questionnaire["guide"] = [
  {
    "id": "scs26-identity",
    "title": {
      "en": "Self-Compassion Scale: the full twenty-six-item form",
      "zh": "自我慈悲量表：26题完整版本"
    },
    "paragraphs": [
      {
        "en": "This page uses Kristin Neff’s full Self-Compassion Scale (SCS), introduced in 2003. It concerns how you typically respond to yourself during difficulty, not how much you like every aspect of yourself. The six readings retain self-kindness, self-judgment, common humanity, isolation, mindfulness and over-identification. There is also an overall reading, calculated from the six parts. [1]",
        "zh": "本页使用Kristin Neff于2003年提出的完整自我慈悲量表（SCS），关注困难时通常怎样对待自己，而非是否喜欢自己的每个方面。自我善待、自我批评、共同人性、孤立感、正念与过度认同分别保留读数，另由六部分计算整体读数。[1]"
      },
      {
        "en": "A short-form SCS, a state questionnaire and a newly written self-compassion quiz are different instruments. Item counts alone do not make them interchangeable. This page preserves the twenty-six source English statements alongside a new working Chinese translation. All seven complete guides are freely available before answering and remain available when a personal reading is insufficient.",
        "zh": "SCS简版、状态问卷及重新编写的同主题测验是不同工具，不能仅凭题数互换。本页保留26条英文源题，并列呈现新的中文工作译文；七份完整指南在作答前免费公开，个人资料不足时也继续提供。"
      }
    ]
  },
  {
    "id": "scs26-response",
    "title": {
      "en": "Answer for your typical response during difficult times",
      "zh": "按困难时的通常回应作答"
    },
    "paragraphs": [
      {
        "en": "The source asks how often the stated response reflects your experience, with 1 meaning Almost never and 5 Almost always. The middle choices are numerical 2, 3 and 4. This edition does not add names to those anchors or impose a past-week or past-month window. Answer what typically happens, rather than what seems like the kinder or more desirable answer. [1]",
        "zh": "源题询问相关回应多常符合自身体验，1为几乎从不，5为几乎总是，中间为数字2、3、4。本版不另给中间档命名，也不增加过去一周或一月窗口。回答通常发生什么，而非哪项看起来更温柔或更理想。[1]"
      },
      {
        "en": "The separate Prefer not to answer choice is a website extension, not a sixth scale point. It withholds that part’s mean and the overall mean while preserving other complete parts. Start opens question one directly without a second agreement, account or payment. Seven minutes is an editorial estimate, and a pause or a decision not to continue is allowed.",
        "zh": "单独的暂不回答是网站扩展，不是第六档量表分；它使所属部分及整体不给均分，其他完整部分继续显示。开始直接进入第一题，无需二次同意、账户或付款。七分钟为编辑估计，可暂停或选择不继续。"
      }
    ]
  },
  {
    "id": "scs26-kindness-accountability",
    "title": {
      "en": "Self-kindness and self-judgment: care alongside accountability",
      "zh": "自我善待与自我批评：关怀可以与责任并存"
    },
    "paragraphs": [
      {
        "en": "Five self-kindness items ask about care, warmth, tolerance and patience. Five self-judgment items concern disapproval, harshness, impatience and coldness toward yourself. The question is how you relate to a difficulty, not whether a mistake should be corrected. Recognizing a concrete error and condemning the whole person supply different information.",
        "zh": "自我善待五题涉及关心、温柔、包容与耐心；自我批评五题涉及不满、苛刻、不耐烦和对自己的冷酷。问题关注如何面对困难，不是在问失误该不该修正。识别一项具体错误，与否定整个人，提供的是不同信息。"
      },
      {
        "en": "Suppose a fictional presentation contains an incorrect figure. “I need to correct the figure and notify the audience” identifies responsibility. Adding “I am incapable of anything” goes beyond that event. Care need not mean ignoring the error, and correction need not require self-contempt. The questionnaire cannot establish whether the feedback was fair or whether resources for the correction were available.",
        "zh": "例如虚构演示文稿有一处数字错误，“我需要修正并告知听众”明确责任，再加上“我什么都做不好”则超过这件事。关怀不必忽略错误，修正也不以自我轻蔑为条件。问卷无法确定反馈是否公平，或是否具备修正所需资源。"
      }
    ]
  },
  {
    "id": "scs26-humanity-context",
    "title": {
      "en": "Common humanity and isolation: connection without erasing context",
      "zh": "共同人性与孤立感：联结不抹掉处境差异"
    },
    "paragraphs": [
      {
        "en": "The four common-humanity items concern recognizing difficulty and inadequacy as human experiences. The four isolation items concern feeling cut off or alone in failure and imagining others have an easier life. They do not count friends or determine actual exclusion. Feeling connected in this sense does not establish that practical support is available.",
        "zh": "共同人性四题关注把困难与不足看作人的共同经历；孤立感四题涉及失败时感到脱节、孤独，或觉得别人生活更轻松。它们不统计朋友人数，也不确定实际排斥；这种联结感不证明现实支持一定存在。"
      },
      {
        "en": "A fictional applicant might recognize that others also experience rejection while acknowledging a particular financial or accessibility barrier. Shared vulnerability does not make barriers equal. “Others struggle too, so you should not be upset” dismisses the person’s experience. Read the two parts alongside actual circumstances rather than using a comparison to decide whose distress deserves attention.",
        "zh": "例如虚构申请者可以认识到别人也经历拒绝，同时承认自己面对特定经济或无障碍限制。共同脆弱不使障碍相同；“别人也难，你不该难过”是在打发经历。请结合实际处境读两部分，不用比较决定谁的痛苦才值得关注。"
      }
    ]
  },
  {
    "id": "scs26-awareness",
    "title": {
      "en": "Mindfulness and over-identification: feelings and conclusions",
      "zh": "正念与过度认同：感受和结论分开看"
    },
    "paragraphs": [
      {
        "en": "Four mindfulness items concern balanced awareness and perspective during difficulty. Four over-identification items ask about fixation, being consumed by inadequacy, being carried away and magnifying an event. These are particular SCS components, not a meditation examination, a test of concentration or a diagnosis of rumination.",
        "zh": "正念四题关注困难时的平衡觉察与视角；过度认同四题涉及反复纠缠、被不足感占据、被情绪带着走和放大事件。这是特定SCS组成部分，不是冥想考试、注意力测试或反刍诊断。"
      },
      {
        "en": "After the presentation error, “I feel embarrassed” names a feeling; “This proves every future presentation will fail” adds a prediction. Keeping both visible does not require suppressing embarrassment or deciding immediately that the prediction is false. In an urgent situation, a practical response may matter more than reflection. A mean cannot determine what was safe or feasible at that moment.",
        "zh": "演示失误后，“我感到难堪”是在描述感受，“这证明以后每次都会失败”增加了预测。把两者看清，不要求压住难堪，也不必立即认定预测必假。紧急情况下，实际行动可能比反思更重要，均分不能确定当时怎样做才安全可行。"
      }
    ]
  },
  {
    "id": "scs26-worked-calculation",
    "title": {
      "en": "SCS scoring: an example with unequal item counts",
      "zh": "SCS计分：题数不同的可复算例子"
    },
    "paragraphs": [
      {
        "en": "Each negative response contributes 6 minus its 1–5 value to the overall calculation. Keep the three negative parts’ raw and reversed means distinct. First divide each adjusted part sum by its own four or five items, then average the six unrounded means and display two decimals. The six parts receive equal weight; the twenty-six individual items do not all have equal weight in that overall formula.",
        "zh": "负向回答进入整体计算时，贡献为6减1—5所选值。三个负向部分的原始与反向均分要分清：先把各部分调整合计除以自身四或五题，再平均六个未舍入均值，最后显示两位小数。六部分等权，不代表26条题在整体公式中各自等权。"
      },
      {
        "en": "For a fresh example in the six-part display order, raw sums 17, 16, 13, 7, 10, 9 yield keyed means 3.40, 2.80, 3.25, 4.25, 2.50, 3.75. Their exact average is 3.325, displayed as 3.33. Averaging the twenty-six adjusted responses instead gives 86/26, or 3.31. One skipped response withholds its part and the overall value; missing is neither zero nor an assumed midpoint.",
        "zh": "新的算例按六部分显示顺序，原始和17、16、13、7、10、9，得到计分后均值3.40、2.80、3.25、4.25、2.50、3.75；精确平均为3.325，显示3.33。直接平均26项调整回答则是86/26，显示3.31。一题跳过使所属部分及整体不给数值，缺失既非零，也非假定中点。"
      }
    ]
  },
  {
    "id": "scs26-research",
    "title": {
      "en": "What factor and translation research can support",
      "zh": "因素结构与翻译研究支持到哪里"
    },
    "paragraphs": [
      {
        "en": "Neff and colleagues’ 2019 study reanalyzed twenty samples comprising 11,685 participants, including seven English and thirteen non-English samples. It compared alternative factor models and supported six component scores or an overall score under the reported analyses. This addresses an existing measurement debate; it is not an individual accuracy percentage, treatment experiment or validation of this website’s Chinese text. [4]",
        "zh": "Neff等2019年研究重新分析20个样本、11,685名参与者，包含七个英语与十三个非英语样本；比较不同因素模型，并在所报告分析下支持六部分分数或整体分。这回应既有测量争论，不是个人准确率、治疗实验或本网站中文措辞的验证。[4]"
      },
      {
        "en": "Kotsou and Leys’ 2016 French adaptation used translation and back-translation with 1,554 online-recruited participants, predominantly women. It examined factor structure and associations with wellbeing, affect and depressive symptoms. That illustrates why a language version needs its own evidence. It does not establish equivalence for a separately written Chinese translation or show that raising a visitor’s score will cause a health benefit. [5]",
        "zh": "Kotsou与Leys的2016年法语改编采用翻译及回译，在线招募1,554人，以女性为主，研究因素结构以及与幸福感、情绪和抑郁症状的关联。这说明语言版本需要自身证据，不确立另写中文译本的等价，也不证明提高某位访客分数会带来健康益处。[5]"
      }
    ]
  },
  {
    "id": "scs26-reading",
    "title": {
      "en": "Read the pattern without turning it into a grade",
      "zh": "阅读回应模式，不把数字变成等级"
    },
    "paragraphs": [
      {
        "en": "A larger negative raw mean indicates more of the named response, while a larger reversed mean indicates less. A similar overall mean can accompany different component patterns. This edition displays both labels and all seven full guides without ranking a winning part or imposing the source’s informal bands as clinical norms. Two decimal places make the arithmetic inspectable, not the psychological inference equally precise.",
        "zh": "负向原始均分越大，表示所命名回应报告越多，反向均分越大则表示报告越少。整体值相近，可以伴随不同组成模式。本版显示两种标签及全部七份指南，不排出获胜部分，也不把源资料的非正式分档当临床常模。两位小数使算术可核查，不表示心理推断具有同样精度。"
      },
      {
        "en": "If useful, choose one manageable event and privately note what happened, how you addressed yourself and one possible practical response. Acknowledging pain need not remove responsibility or require forgiveness. You can stop if the observation is unhelpful and choose support suited to your circumstances. No score, completed exercise or retest is required to deserve help.",
        "zh": "如有帮助，可选一件可承受的小事，私下记下发生了什么、怎样对自己说话，以及一项可能的实际行动。承认痛苦不必取消责任，也不要求原谅。观察无益时可以停止，选择适合处境的支持；获得帮助不以特定分数、完成练习或重测为条件。"
      }
    ]
  }
];

export const scs26LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is SCS-26 the same as a twelve-item self-compassion quiz?",
      "zh": "SCS26题与十二题自我慈悲测验一样吗？"
    },
    "answer": {
      "en": "No. Full, short, state and independently written forms have different items and evidence. This page uses the full twenty-six source items and its linked scoring key.",
      "zh": "不一样。完整、简版、状态及独立编写版本的题目与证据不同；本页使用完整26条源题与所链接计分键。"
    }
  },
  {
    "question": {
      "en": "Should I answer for the past month?",
      "zh": "应该回想过去一个月吗？"
    },
    "answer": {
      "en": "The source asks how you typically respond during difficult times, without a numerical recall window. This page does not add a monthly requirement.",
      "zh": "源题询问困难时通常怎样回应，没有数字化回顾窗口；本页不增加一个月要求。"
    }
  },
  {
    "question": {
      "en": "What do response choices 2, 3 and 4 mean?",
      "zh": "选项2、3、4分别叫什么？"
    },
    "answer": {
      "en": "They are intermediate numerical choices between the named endpoints, without extra labels in this edition. They are not measured percentages of occasions.",
      "zh": "它们是具名两端之间的数字选项，本版不另加名称，也不是实测机会百分比。"
    }
  },
  {
    "question": {
      "en": "Why can raw criticism be high while the reversed mean is low?",
      "zh": "为什么原始批评分高，反向值却低？"
    },
    "answer": {
      "en": "The negative raw and keyed means run in opposite directions: keyed equals six minus the unrounded raw mean. The keyed value enters the overall calculation.",
      "zh": "负向原始与计分后均值方向相反，计分后为6减未舍入原始均值，后者进入整体计算。"
    }
  },
  {
    "question": {
      "en": "Does 3.33 mean 66.6 percent compassionate?",
      "zh": "3.33表示66.6%的慈悲吗？"
    },
    "answer": {
      "en": "No. It is a rounded mean on the scale’s coding. Dividing by five does not produce a probability, population percentile or observed success rate.",
      "zh": "不是。它是量表编码下的舍入均分，除以五不会产生概率、人口百分位或实测成功率。"
    }
  },
  {
    "question": {
      "en": "Does permission to translate mean the Chinese scale is validated?",
      "zh": "允许翻译就表示中文版有效吗？"
    },
    "answer": {
      "en": "No. Permission and measurement evidence are separate. This is a working Chinese translation without its own established factor, reliability or language-equivalence evidence.",
      "zh": "不表示。许可与测量证据不同；这是工作中译，尚无自身已建立的因素结构、信度或语言等价证据。"
    }
  },
  {
    "question": {
      "en": "Can one retest show a meaningful psychological change?",
      "zh": "重测一次能确定有意义的心理变化吗？"
    },
    "answer": {
      "en": "Not from a number alone. Check version, circumstances and the individual responses. This website has no established individual meaningful-change threshold for its translation and presentation.",
      "zh": "不能仅凭数字确定；应核对版本、情境和具体回答。本网站译文与呈现没有已建立的个人有意义变化阈值。"
    }
  },
  {
    "question": {
      "en": "Is another agreement needed after Start?",
      "zh": "点击开始后需要再次同意吗？"
    },
    "answer": {
      "en": "No. Start opens question one directly. All twenty-six items and seven complete guides are free. Temporary saving is a separate voluntary choice.",
      "zh": "不需要。开始直接进入第一题，26条与七份完整指南免费；临时保存是另行自愿选择。"
    }
  }
];

export const scs26LandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Neff et al. (2019): factor structure in twenty samples",
      "zh": "Neff等（2019）：二十个样本的因素结构研究"
    },
    "url": "https://self-compassion.org/wp-content/uploads/2019/09/Neff2019.pdf"
  },
  {
    "title": {
      "en": "Kotsou & Leys (2016): French SCS adaptation study",
      "zh": "Kotsou与Leys（2016）：法语SCS改编研究"
    },
    "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0152880"
  }
];
