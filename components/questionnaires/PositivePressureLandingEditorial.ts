import type { Questionnaire } from "@/lib/questionnaires/types";

export const positivePressureLandingSections: Questionnaire["guide"] = [
  {
    "id": "positive-pressure-identity",
    "title": {
      "en": "What toxic positivity means in this reflection",
      "zh": "有毒积极心态测试观察什么？"
    },
    "paragraphs": [
      {
        "en": "Toxic positivity is commonly used to describe pressure to replace, dismiss or invalidate difficult feelings with an insistence on positivity. Here it is a topic for examining specific habits, not a diagnosis or an identity. Eighteen original items cover pressure on your own feelings, positive pressure in conversations and reassurance beyond what is known. These are three editorial groupings, not established psychological factors. [1]",
        "zh": "有毒积极心态通常指以必须积极的要求替代、淡化或否定困难感受。这里用它讨论具体习惯，不作诊断或身份判定。18条原创题分别回看对自己感受的积极要求、对话中施加的积极压力，以及超出已知事实的积极保证；三组是编辑组织方式，不是已确立的心理学因子。[1]"
      },
      {
        "en": "Recall your own actions during the past two weeks when relevant opportunities occurred. Never and No relevant opportunity mean different things. The latter is unscored, as is preferring not to answer. The form requests no event details and does not observe conversations, establish another person’s motives or determine how a listener actually felt.",
        "zh": "按过去两周有相关机会时自己的行动作答。“从未”与“没有相关机会”不同，后者及暂不回答都不计分。表单不询问事件细节，也不观察真实对话、不确定他人动机或听者实际感受。"
      }
    ]
  },
  {
    "id": "positive-pressure-self",
    "title": {
      "en": "Gratitude and disappointment can coexist",
      "zh": "感谢与失望可以同时存在"
    },
    "paragraphs": [
      {
        "en": "The first six items concern rules you apply to your own feelings: needing to be grateful before acknowledging disappointment, treating sadness as a failure of effort, or blaming your attitude despite external constraints. The reverse-worded items allow being upset while hoping for improvement and accepting that an upside may not yet be known. Rating the latter more frequently reduces the keyed pressure score.",
        "zh": "前六题关注对自己感受提出的要求，例如必须先感恩才能承认失望、把难过视为不够努力，或在存在外部限制时仍责怪自己的态度。反向题涉及允许难过与期待改善并存，以及接受暂时不知道积极面；更常采用这些做法，会降低转换后的积极压力计分。"
      },
      {
        "en": "For a fictional rejected application, “I appreciate the opportunity and I am disappointed” acknowledges two experiences. “I must be grateful, so I should not feel disappointed” adds a rule about what is permitted. A practical next step may still be welcome. The questionnaire cannot establish why either statement occurred, how long the feeling lasted or what support is appropriate.",
        "zh": "例如虚构申请未通过，“我感谢这次机会，也很失望”承认两种体验；“我必须感恩，所以不该失望”则增加了允许何种感受的规则。之后仍可讨论实际下一步。问卷不能确定说法的原因、感受持续多久或适合何种支持。"
      }
    ]
  },
  {
    "id": "positive-pressure-conversation",
    "title": {
      "en": "Validation, agreement and permission are different",
      "zh": "理解感受、同意观点与征求意愿不同"
    },
    "paragraphs": [
      {
        "en": "The conversation items ask about responding with comparison, benefits or praise before acknowledging a difficulty, making upbeat expression a condition of the conversation, and respecting a declined positive interpretation. Acknowledging a feeling does not require agreeing with every explanation, accusation or proposed action. Asking what support is wanted leaves room for listening, practical help or a different perspective.",
        "zh": "对话题涉及在承认困难前进行比较、寻找好处或赞美，把积极表达设为继续交谈的条件，以及尊重对方拒绝积极解读。承认一种感受，不要求同意每个解释、指责或行动建议；询问需要何种支持，可以为倾听、实际帮助或另一种视角保留空间。"
      },
      {
        "en": "For example, a colleague might want help checking a missed deadline rather than encouragement. “Would you like me to listen, check options, or leave this for later?” is useful only if the answer changes what you do. You may also state your own time limit. Neither one preferred phrase nor a low mean certifies good listening, and this self-report does not measure the colleague’s experience.",
        "zh": "例如同事可能想核对错过截止时间的补救办法，而非听鼓励。“你想让我听一会儿、一起查选项，还是以后再谈？”只有在回答会改变后续行动时才有意义。也可以说明自己可投入的时间。一句合适措辞或较低均分不认证倾听能力，自报也不测量同事的体验。"
      }
    ]
  },
  {
    "id": "positive-pressure-uncertainty",
    "title": {
      "en": "Offer hope without claiming to know an outcome",
      "zh": "保留希望，不把未知说成保证"
    },
    "paragraphs": [
      {
        "en": "The final six items distinguish a hopeful wish from a factual prediction: promising an ending without enough information, replacing a concrete check with encouragement, or treating an unresolved setback as a necessary gift. Reverse-worded items separate hopes from known facts and admit uncertainty while offering wanted, manageable help. These questions do not judge optimism itself.",
        "zh": "后六题区分期待与事实预测，例如资料不足仍保证结局、用鼓励替代具体核对，或在后果未明时把挫折说成必然的礼物。反向题涉及区分希望与已知事实，以及承认不确定、同时提供对方需要且可承担的帮助；它们不评价乐观本身。"
      },
      {
        "en": "While waiting for a fictional admissions decision, “I hope it works out; we can check the reply date” keeps hope and a checkable action separate. “You will definitely be accepted” asserts an outcome that may be unknown. Ordinary warmth does not need constant fact-checking, but a consequential claim deserves attention to what is actually known. A score cannot establish dishonesty or forecast an outcome.",
        "zh": "例如等待虚构录取决定，“我希望顺利，我们可以查回复日期”把希望与可核对行动分开；“你一定会被录取”则断言可能未知的结局。普通关心无需不断查证，但涉及重要结果的说法应留意实际知道什么。分数不能认定不诚实，也不预测结局。"
      }
    ]
  },
  {
    "id": "positive-pressure-privacy",
    "title": {
      "en": "Privacy and a safe pause are not forced positivity",
      "zh": "保留隐私与安全暂停不等于强迫积极"
    },
    "paragraphs": [
      {
        "en": "Choosing not to disclose a feeling, postponing a conversation or keeping a workplace exchange brief can be reasonable. An outwardly calm expression does not reveal whether someone denied a feeling internally or chose a boundary. The original instructions explicitly distinguish privacy, a safe pause and ordinary hope from the habits under reflection.",
        "zh": "选择不透露感受、延后交谈或简短处理工作互动，都可能合理。外表平静不说明一个人是在内心否定感受，还是选择保留界限。原始作答说明明确区分隐私、安全暂停、普通希望与本页回顾的习惯。"
      },
      {
        "en": "There is no requirement to express every feeling, confront another person or remain in an uncomfortable exchange to obtain a lower number. Where a situation lacks safety or room to choose, ordinary conversation suggestions may be unsuitable. You may leave an item unscored, stop, keep a reflection private or seek a support route suited to your circumstances.",
        "zh": "没有义务为降低数字而表达所有感受、质问某人或继续不舒服的互动。在缺少安全与选择余地的情境，普通对话建议可能不适用。可以让题目不计分、停止作答、保密记录，或按自身处境选择适合的支持途径。"
      }
    ]
  },
  {
    "id": "positive-pressure-calculation",
    "title": {
      "en": "Three separate means: reversal and missing answers",
      "zh": "三组独立均分：反向转换与缺答"
    },
    "paragraphs": [
      {
        "en": "Each group has six items, including two reverse-worded items. Numeric choices run from 1 to 5; a reverse item contributes 6 minus the selected number. For the first group, raw choices 4, 2, 5, 1, 3, 4 become 4, 2, 1, 1, 3, 2. Their keyed sum is 13 and 13 ÷ 6 = 2.1667, displayed as 2.2. Directly averaging the selected numbers would give the wrong result.",
        "zh": "每组六题包含两道反向题，数值选项为1—5；反向题以6减去所选数字计入。例如第一组原选择4、2、5、1、3、4，转换为4、2、1、1、3、2，合计13，13÷6＝2.1667，显示2.2。直接平均所选数字会得到错误结果。"
      },
      {
        "en": "All six numeric answers are required for a group’s mean. If its second choice is unscored, five ratings remain and that mean is withheld; other complete groups retain theirs. Unscored is neither zero nor a middle rating. All eighteen prompts still require a selection to finish. Three means are not combined into a toxicity percentage, severity band, dominant type or population percentile.",
        "zh": "一组必须六题都有数值回答才显示均分；若其中第二项不计分，该组余五项评分，暂不显示均分，其他完整组仍保留。不计分既不是零，也不是中间评分；结束仍需18题各有选择。三组不合成为毒性百分比、严重等级、主导类型或人群百分位。"
      }
    ]
  },
  {
    "id": "positive-pressure-evidence",
    "title": {
      "en": "Research evidence: laboratory suppression and scale development",
      "zh": "研究证据：实验抑制与量表开发各说明什么？"
    },
    "paragraphs": [
      {
        "en": "Gross and Levenson’s 1997 experiment assigned 180 female participants to suppress visible expression or watch films naturally. Suppression reduced outward expression; physiological effects differed between neutral and emotional films. This was an acute laboratory manipulation, not a study of these eighteen items, everyday privacy or long-term harm from every unexpressed feeling. [2]",
        "zh": "Gross与Levenson的1997年实验将180名女性参与者分配至抑制可见表达或自然观看影片的条件。抑制减少外在表达，中性与情绪影片的生理效应有所不同。这是短时实验操作，不是本18题、日常隐私，或每种未表达感受的长期伤害研究。[2]"
      },
      {
        "en": "Measurement development is also emerging. Rahma and colleagues’ 2026 study explored a different item pool with 205 convenience-sampled participants and retained eleven items. The authors call for further validity research. Its exploratory structure and sample-specific findings cannot be transferred to this original form, these three editorial groups or the Chinese wording. The present edition has no established norms or diagnostic cutoff. [3]",
        "zh": "相关测量开发也在进行。Rahma等人的2026年研究以205名便利抽样参与者探索另一套题目，最终保留11条；作者提出仍需进一步效度研究。该探索结构及特定样本结论不能转用于本原创题本、三组编辑分组或中文表述。本版没有已建立的常模或诊断界值。[3]"
      }
    ]
  },
  {
    "id": "positive-pressure-reflection",
    "title": {
      "en": "A practical follow-up without turning the mean into a verdict",
      "zh": "用具体事件核对，不把均分变成判决"
    },
    "paragraphs": [
      {
        "en": "If useful, privately recall one manageable event: what happened, what you felt or said, what was known and what the other person actually requested. Separate an observation from an interpretation. A possible repair could acknowledge that you offered reassurance too quickly and ask what would be useful now, without demanding a response or forgiveness.",
        "zh": "如有帮助，可私下回看一次可承受的事件：发生什么、自己感到或说出什么、已知什么，以及对方实际提出何种需要。把观察与解释分开。可选的修正是承认自己过早保证结局，再询问现在怎样帮助，同时不要求对方回应或原谅。"
      },
      {
        "en": "These are reflection prompts, not a treatment tested by this questionnaire. Retesting after reading can alter recall and interpretation; a changed mean alone does not demonstrate improvement. Check concrete actions and feedback over time. All three complete guides remain readable even when every part has insufficient information. Start opens question one directly without a second agreement, signup or payment.",
        "zh": "这些是反思提示，不是经本问卷验证的治疗方法。阅读后重测可能改变回忆与理解，均分改变不能单独证明进步；应持续核对具体行动与反馈。即使三组都资料不足，三份完整指南仍可读。开始直接进入第一题，无需再次同意、注册或付款。"
      }
    ]
  }
];

export const positivePressureLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is ordinary optimism toxic?",
      "zh": "普通乐观就是有毒积极吗？"
    },
    "answer": {
      "en": "No. Hope can coexist with acknowledging difficulty. This reflection concerns pressure, dismissal and unsupported guarantees, not optimism itself.",
      "zh": "不是，希望可与承认困难并存；本页回顾积极压力、淡化感受和缺乏依据的保证，不评价乐观本身。"
    }
  },
  {
    "question": {
      "en": "Does validating a feeling mean agreeing with a claim?",
      "zh": "理解感受就必须同意对方的说法吗？"
    },
    "answer": {
      "en": "No. You can acknowledge disappointment while checking an explanation or declining a proposed action. These are separate decisions.",
      "zh": "不必。可以承认失望，同时核对解释或拒绝某项行动；这是不同决定。"
    }
  },
  {
    "question": {
      "en": "Must I disclose every difficult feeling?",
      "zh": "必须表达每一种困难感受吗？"
    },
    "answer": {
      "en": "No. Privacy, timing and a safe pause remain legitimate choices. An outward expression alone does not establish what someone feels or why they chose it.",
      "zh": "不必，隐私、时机与安全暂停仍是合理选择；外在表达不能单独确定感受或选择原因。"
    }
  },
  {
    "question": {
      "en": "Can encouragement and practical help coexist?",
      "zh": "鼓励与实际帮助可以同时提供吗？"
    },
    "answer": {
      "en": "Yes. Check what is wanted and what you can offer. Keep hopes separate from known facts rather than promise an outcome you cannot know.",
      "zh": "可以，先核对对方需要什么、自己能做什么；区分希望与已知事实，避免保证自己无法知道的结局。"
    }
  },
  {
    "question": {
      "en": "Why are six items reversed?",
      "zh": "为什么六道题需要反向计分？"
    },
    "answer": {
      "en": "They describe allowing feelings, respecting a declined reframing, checking support preferences and admitting uncertainty. Each numeric choice contributes 6 minus its value; an unscored answer remains unscored.",
      "zh": "它们描述允许感受、尊重拒绝积极解读、确认支持意愿和承认未知；数值选择以6减原值计入，不计分选择仍不计分。"
    }
  },
  {
    "question": {
      "en": "Is an unscored choice the same as Never?",
      "zh": "不计分与从未一样吗？"
    },
    "answer": {
      "en": "No. Never is a numeric response about relevant opportunities. No relevant opportunity or preferring not to answer withholds only that incomplete part’s mean.",
      "zh": "不同。从未是针对相关机会的数值回答；没有机会或暂不回答仅使未完整的那组暂不显示均分。"
    }
  },
  {
    "question": {
      "en": "Can a changed mean after retesting prove progress?",
      "zh": "重测均分改变能证明进步吗？"
    },
    "answer": {
      "en": "Not alone. Recall, opportunities and interpretation can change. This edition has no established individual meaningful-change threshold.",
      "zh": "不能单独证明，回忆、机会与理解都可能变化；本版没有已建立的个人有意义变化阈值。"
    }
  },
  {
    "question": {
      "en": "Does Start require another agreement?",
      "zh": "开始后还要再次同意吗？"
    },
    "answer": {
      "en": "No. It opens the first question directly. All eighteen items and three full guides are free without signup or payment; temporary saving is optional.",
      "zh": "不需要，直接打开第一题。18题与三份全文指南免费，无需注册或付款，临时保存仍为自愿。"
    }
  }
];

export const positivePressureLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Rahma et al. (2026): exploratory development of a different Toxic Positivity Scale",
      "zh": "Rahma等（2026）：另一套有毒积极量表的探索开发"
    },
    "url": "https://bajangjournal.com/index.php/IJSS/article/download/12293/9886"
  }
];
