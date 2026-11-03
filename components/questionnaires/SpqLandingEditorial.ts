import type { Questionnaire } from "@/lib/questionnaires/types";

export const spqLandingSections: Questionnaire["guide"] = [
  {
    "id": "spq-context-identity",
    "title": {
      "en": "What the full SPQ records: reported sensory perception",
      "zh": "完整SPQ记录什么？自报的感觉知觉"
    },
    "paragraphs": [
      {
        "en": "SPQ means Sensory Perception Quotient. This page presents the published ninety-two English statements and a new FermatMind working Chinese translation. It uses the current ARC scoring document for the full form. The questionnaire asks about experiences involving sight, hearing, touch, smell and taste; this edition reports one overall raw total and one complete reading guide, not five independently validated sensory scores. [1][2][3]",
        "zh": "SPQ是Sensory Perception Quotient的缩写。本页提供发表版92条英文陈述及费马新的中文工作译文，完整题本按ARC现行计分文件处理。题目涉及视觉、听觉、触觉、嗅觉与味觉体验；本版呈现一个原始总分和一份完整阅读指南，没有生成五项独立验证的感官分数。[1][2][3]"
      },
      {
        "en": "Keep three layers separate: the published questionnaire, its scoring edition, and this website’s presentation and Chinese wording. Evidence for one does not automatically establish the others. The full source attribution, license, changes and original reading sections remain available below and in the result. No answer, photograph or sensory recording needs to be uploaded.",
        "zh": "需要区分发表问卷、计分版本，以及本站呈现和中文措辞三个层次；某一层的证据不会自动确立其他层的性质。完整作者署名、许可、改动说明和原有阅读章节保留在下方及结果中，无需上传回答文件、照片或感官录音。"
      }
    ]
  },
  {
    "id": "spq-context-answer",
    "title": {
      "en": "Answer from existing experience; unfamiliar is not disagreement",
      "zh": "根据已有经验回答：不熟悉不等于不同意"
    },
    "paragraphs": [
      {
        "en": "Use your existing experience and knowledge when deciding how strongly you agree with each statement. This is an agreement questionnaire, not a count of events in the past week or month. Strongly agree, Agree, Disagree and Strongly disagree have numeric values 0, 1, 2 and 3 before reverse coding. There is no neutral numeric option. If you cannot judge, use the separate unscored option instead of inventing experience.",
        "zh": "判断每条陈述的同意程度时，以已有经验和认识为依据。这是同意程度问卷，不是过去一周或一个月的事件频率统计。非常同意、同意、不同意、非常不同意在反向处理前依次取0、1、2、3，没有中性数值选项；无法判断时，可选独立的不计分选项，不必虚构经历。"
      },
      {
        "en": "Some statements describe hypothetical situations, discomfort or hazards. They are descriptions to consider, not instructions to perform an experiment. Do not expose yourself to heat, pain, chemicals, unsafe sounds or driving risks to obtain an answer. Familiarity with an activity can differ; leave it unscored if necessary. About twenty minutes is a reading estimate, not a deadline.",
        "zh": "部分陈述涉及假设情境、不适或危险因素，供回想判断，不是实验操作指令。不要为了获得答案而接触高温、疼痛、化学品、危险声音或驾驶风险。对某项活动的熟悉程度可能不同，必要时可不计分。约二十分钟为阅读估计，不是限时。"
      }
    ]
  },
  {
    "id": "spq-context-versions",
    "title": {
      "en": "SPQ-92, the 35-item form and SPQ-RS are different editions",
      "zh": "92项、35项与SPQ-RS：先确认版本"
    },
    "paragraphs": [
      {
        "en": "The ARC resource lists the full ninety-two-item form and a separate thirty-five-item form. Their question numbers and score ranges cannot be interchanged. This page uses all ninety-two items, with a possible total of 0–276. A score from the shorter form cannot be converted by a simple multiplier or compared as though it came from this form. [2][3]",
        "zh": "ARC资源页分别列出完整92项与35项题本，题号和分数范围不能互换。本页使用全部92项，总分可能范围为0—276；短版分数不能简单乘倍数换算，也不能当作来自本版直接比较。[2][3]"
      },
      {
        "en": "Taylor and colleagues’ 2020 SPQ-RS uses a revised method: seventy-nine items contribute to separate hypersensitivity and hyposensitivity scales. That is not the single-total method implemented here. The same questionnaire name on two websites does not establish equivalent scoring. Check the form, response coding, reverse key and reported outputs before interpreting a difference. [5]",
        "zh": "Taylor等人的2020年SPQ-RS采用修订方法，由79项分别构成高敏感与低敏感量尺，并非这里实现的单总分方法。两个网站使用相同问卷名称，不代表计分等价。解释差异前，应核对题本、选项赋值、反向键和输出内容。[5]"
      }
    ]
  },
  {
    "id": "spq-context-key",
    "title": {
      "en": "Why items six and fifty-three follow the current reverse key",
      "zh": "第6与53项为什么按现行反向键处理？"
    },
    "paragraphs": [
      {
        "en": "Table 4 of the 2014 article marks forty-two statements in italics, while the current ARC full-form scoring document lists forty-four reverse items, including six and fifty-three. This page follows that explicit forty-four-item key. The discrepancy is documented rather than silently combining editions or inferring a new rule from the wording. [1][3]",
        "zh": "2014年论文表4用斜体标出42条陈述，而ARC现行完整版计分文件列出44项反向题，包括第6与53项。本页遵循明确列出的44项键，记录版本差异，不混合版本，也不根据题意自行推导新规则。[1][3]"
      },
      {
        "en": "For a forward item the contribution is the selected value. For a reverse item it is three minus that value: a selected 0 contributes 3, 1 contributes 2, 2 contributes 1 and 3 contributes 0. Reverse coding aligns the direction of contributions; it is not an inconsistency detector and does not make one answer morally or clinically better than another.",
        "zh": "正向题贡献所选数值；反向题贡献三减去该值，即所选0、1、2、3分别贡献3、2、1、0。反向处理使贡献方向一致，不是矛盾回答检测，也不表示某答案在道德或临床上更好。"
      }
    ]
  },
  {
    "id": "spq-context-example",
    "title": {
      "en": "A worked total of 139, and why one unscored item changes availability",
      "zh": "139分算例：为什么一项不计分就不生成总分"
    },
    "paragraphs": [
      {
        "en": "Selecting Agree for all ninety-two items produces 136: forty-eight forward items contribute 48, and forty-four reverse items contribute 88. For a fresh example, change item one from Agree to Strongly disagree, adding 2; change reverse item three from Agree to Strongly agree, adding 1. The total becomes 139. This is an arithmetic example, not a suggested response pattern or a typical-person benchmark.",
        "zh": "92项全部选同意得到136：48项正向题贡献48，44项反向题贡献88。再举新算例：第1项由同意改为非常不同意，加2；反向第3项由同意改为非常同意，加1，总分为139。这是算术说明，不是建议的作答模式或典型人群基准。"
      },
      {
        "en": "If item fifty-three is then unscored, there are ninety-one rated items and one unscored item, so no total is produced. The missing value is not replaced with zero, a midpoint or a scaled estimate. This all-ninety-two rule belongs to this website’s reporting edition; it is not an empirically established missing-data allowance. Even an all-unscored attempt can finish and display the full guide.",
        "zh": "此时若第53项不计分，有效数值为91项，不计分1项，不生成总分；不以零、中点或比例估算填补。92项齐全规则属于本站报告版本，不是实证确立的缺失容许阈值。全部不计分也能完成并查看完整指南。"
      }
    ]
  },
  {
    "id": "spq-context-evidence",
    "title": {
      "en": "Research evidence concerns a particular sample and edition",
      "zh": "研究证据属于具体样本与版本"
    },
    "paragraphs": [
      {
        "en": "The 2014 development study included 359 adults, including 196 in an autism-spectrum group and 163 controls. It reported internal consistency of 0.92 for the full questionnaire. That coefficient describes item-score consistency in that sample, not ninety-two percent accuracy, a diagnostic success rate or this website’s Chinese validity. The study also identified the need for further objective sensory testing and test–retest work. [1]",
        "zh": "2014年开发研究纳入359名成人，其中自闭症谱系组196名、对照组163名，完整版内部一致性系数为0.92。该系数描述该样本中的题目分数一致性，不是准确率92%、诊断成功率或本站中文效度；研究还指出需要进一步客观感觉测量与重测工作。[1]"
      },
      {
        "en": "Research group differences do not supply a clinical cutoff for an individual visitor. This page does not apply a population norm, diagnostic band or reliable-change threshold. The new Chinese working translation and digital presentation have not established their own measurement equivalence or local validation. Preserving a published item set and implementing its arithmetic are necessary source checks, not substitutes for those studies.",
        "zh": "研究中的组间差异不能直接提供个体访客的临床界点。本页不套用人群常模、诊断分档或可靠变化阈值。新的中文工作译文与数字呈现尚未建立自身的测量等价或本地验证；保留发表题目和实现算术是必要题源核对，不能替代这些研究。"
      }
    ]
  },
  {
    "id": "spq-context-interpretation",
    "title": {
      "en": "A lower total is not a diagnosis, a sense test or an HSP label",
      "zh": "较低总分不是诊断、感官实测或HSP标签"
    },
    "paragraphs": [
      {
        "en": "In this full-form scoring direction, a lower total indicates greater reported sensory sensitivity. It does not measure an auditory threshold, visual acuity, smell detection or pain tolerance in a controlled task. Two people can have the same total through different combinations of answers. Read the particular situations that fit and those that do not; do not infer which sensory channel is objectively strongest.",
        "zh": "按完整题本的计分方向，较低总分表示更强的自报感觉敏感性。它没有在受控任务中测量听阈、视力、嗅觉检出或疼痛耐受。不同回答组合可以得到同一总分，应阅读适用和不适用的具体情境，不据此推断哪个感官客观最强。"
      },
      {
        "en": "Sensory-processing sensitivity discussions such as HSP questionnaires, and the four-quadrant Adolescent/Adult Sensory Profile, use different constructs or models. Their labels and classifications are not outputs of this SPQ edition. A total alone cannot identify autism, ADHD or a sensory disorder, explain a symptom’s cause or decide treatment. The Pearson profile also has its own administration and interpretation requirements. [6]",
        "zh": "HSP问卷讨论的感觉加工敏感性，以及青少年／成人感觉剖面四象限，采用不同概念或模型；它们的标签与分类不是本版SPQ输出。单一总分不能识别自闭症、ADHD或感觉障碍，不能解释症状成因或决定治疗。Pearson剖面也有自身施测与解释要求。[6]"
      }
    ]
  },
  {
    "id": "spq-context-application",
    "title": {
      "en": "Use a concrete experience to discuss an adjustment",
      "zh": "用具体体验讨论一个调整"
    },
    "paragraphs": [
      {
        "en": "For an ordinary example, note whether a desk lamp’s glare makes reading uncomfortable, when it occurs, and what difference a permitted change in lamp position makes. Keep the description separate from the total: noticing a reflection and finding it uncomfortable are related but different observations. One useful adjustment need not change the questionnaire score, and another person may prefer different lighting.",
        "zh": "以普通例子说明：记录台灯反光是否使阅读不适、何时发生，以及获准调整灯位后有什么实际差别。具体描述应与总分分开：注意到反光和感到不舒服是相关但不同的观察。有用的调整不一定改变问卷分数，另一人也可能偏好不同照明。"
      },
      {
        "en": "A voluntary conversation can describe the situation, the requested adjustment and what will be checked afterward. Support need not depend on proving a label or reaching a score. Repeat scores can differ with context, recall or interpretation; this edition cannot quantify clinical improvement. You may read the full guide, keep the reflection private or finish without taking another questionnaire.",
        "zh": "自愿讨论时，可说明情境、希望的调整和之后怎样核对。获得支持不必以证明标签或达到某分数为条件。重测可能受情境、回忆或题意理解影响，本版不能量化临床改善。可以读完整指南、私下保留反思，或结束而不再做其他问卷。"
      }
    ]
  }
];

export const spqLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is the SPQ the same as an HSP or DOES questionnaire?",
      "zh": "SPQ与HSP或DOES问卷相同吗？"
    },
    "answer": {
      "en": "No. This full SPQ records reported sensory perception. Shared words such as sensitivity do not establish the same construct, response coding or interpretation. HSP labels are not produced here.",
      "zh": "不同。本完整SPQ记录自报感觉知觉；同用敏感性一词，不意味着概念、选项赋值与解释相同。本页不产生HSP标签。"
    }
  },
  {
    "question": {
      "en": "Does this page report five sensory subscale scores?",
      "zh": "本页生成五个感官分量表分数吗？"
    },
    "answer": {
      "en": "No. Statements involve five sensory modalities, but this edition reports only the strict full-form overall total and its complete guide. It does not invent modality classifications.",
      "zh": "不生成。陈述涉及五类感官，本版只呈现完整题本的严格总分及完整指南，不另造感官分类。"
    }
  },
  {
    "question": {
      "en": "Is this the revised SPQ-RS with two sensitivity scales?",
      "zh": "这里采用双敏感量尺的SPQ-RS吗？"
    },
    "answer": {
      "en": "No. SPQ-RS has a different scoring method. Its separate hyper- and hyposensitivity outputs cannot be read from this edition’s single 0–276 total. [5]",
      "zh": "不是。SPQ-RS采用不同计分方法，其独立的高敏感与低敏感输出，不能从本版0—276单总分中读出。[5]"
    }
  },
  {
    "question": {
      "en": "Why does choosing Agree throughout give 136 rather than 92?",
      "zh": "为什么全部同意是136，而非92？"
    },
    "answer": {
      "en": "Forty-eight forward items each contribute 1, while forty-four reverse items each contribute 2. Their contributions sum to 136. This is a worked example, not a normative reference. [3]",
      "zh": "48项正向题各贡献1，44项反向题各贡献2，合计136。这是算例，不是常模参照。[3]"
    }
  },
  {
    "question": {
      "en": "Should I try an unfamiliar situation before answering?",
      "zh": "不熟悉的情境要先尝试再回答吗？"
    },
    "answer": {
      "en": "No. Answer from existing knowledge and experience, or use unscored. Do not test pain, heat, chemicals, unsafe sounds or driving conditions to answer an item.",
      "zh": "不需要。根据已有认识和经验回答，或选不计分；不要为作答而测试疼痛、高温、化学品、危险声音或驾驶条件。"
    }
  },
  {
    "question": {
      "en": "Does internal consistency of 0.92 mean 92 percent accurate?",
      "zh": "内部一致性0.92表示准确率92%吗？"
    },
    "answer": {
      "en": "No. It describes item-score consistency in a research sample. It is not a visitor’s accuracy, a diagnostic rate or validation of the new Chinese translation. [1]",
      "zh": "不是。它描述研究样本中题目分数的一致性，不是访客准确率、诊断率或新中文译文的验证。[1]"
    }
  },
  {
    "question": {
      "en": "Can the same total come from different sensory experiences?",
      "zh": "相同总分可能来自不同感觉体验吗？"
    },
    "answer": {
      "en": "Yes. Many combinations of answers can yield the same total. Use concrete experiences alongside the guide; the total does not identify a single personal sensory pattern.",
      "zh": "可能。多种回答组合能得到同一总分，应结合具体体验阅读指南；总分不能识别唯一的个人感官模式。"
    }
  },
  {
    "question": {
      "en": "Does Start open the first item directly?",
      "zh": "点击开始会直接到第一题吗？"
    },
    "answer": {
      "en": "Yes. There is no second agreement, account or payment step. Saving is optional. All questions and the complete guide are free.",
      "zh": "会。没有再次同意、账户或付款步骤；保存进度自选，全部题目与完整指南免费。"
    }
  }
];

export const spqLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Taylor et al. (2020): revised SPQ scoring and its two scales",
      "zh": "Taylor等（2020）：SPQ修订计分与两项量尺"
    },
    "url": "https://link.springer.com/article/10.1186/s13229-019-0289-x"
  },
  {
    "title": {
      "en": "Pearson: Adolescent/Adult Sensory Profile and administration",
      "zh": "Pearson：青少年／成人感觉剖面与施测要求"
    },
    "url": "https://www.pearsonclinical.co.uk/en-gb/Store/Professional-Assessments/Motor-Sensory/Adolescent-Adult-Sensory-Profile/p/P100009054"
  }
];
