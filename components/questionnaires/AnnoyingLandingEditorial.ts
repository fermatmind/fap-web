import type { Questionnaire } from "@/lib/questionnaires/types";

export const annoyingLandingSections: Questionnaire["guide"] = [
  {
    "id": "annoying-context-identity",
    "title": {
      "en": "Annoying Person Test: five interaction areas, not a dislike verdict",
      "zh": "烦人性格测试：五类互动线索怎样理解"
    },
    "paragraphs": [
      {
        "en": "This twenty-item reflection asks about your descriptions of expression, pauses, expectations, changing plans and boundaries. These five areas organise the original FermatMind form; they are not established personality factors. There are no peer ratings or observations in the score. The search term annoying person does not turn your answers into evidence that someone dislikes you.",
        "zh": "这套20题反思询问你怎样描述自己的表达、暂停、期待、计划变化与边界。五类观察区用于整理费马原创题本，不是已确立的人格因素。计分不包含同伴评价或行为观察；“烦人性格”这一搜索名称，不会把自己的回答变成别人讨厌自己的证据。"
      },
      {
        "en": "Use the five complete guides to examine particular interactions rather than decide your social worth. A brief refusal, a need for space or a different communication habit can be appropriate in context. No total, leading cause or negative personality label is generated, and no amount of endorsement makes you responsible for another person’s every interpretation.",
        "zh": "五份完整指南帮助核对具体互动，而非裁定社交价值。简短拒绝、需要空间或沟通习惯不同，在具体背景中都可能合理。本版不生成总分、主要原因或负面人格标签；无论符合程度多少，都不代表你须为他人的每一种理解负责。"
      }
    ]
  },
  {
    "id": "annoying-context-answers",
    "title": {
      "en": "How to answer: description, uncertainty and completeness",
      "zh": "作答方式：符合程度、不确定与完整度"
    },
    "paragraphs": [
      {
        "en": "Recall interactions you can presently identify and choose how well each statement describes you. There is no fixed recall period in this form. The five options run from does not describe me at all to describes me very well; they are not event counts. Six minutes is an estimate rather than a time limit. Keep the setting you have in mind visible to yourself when reading later.",
        "zh": "回想目前能确认的互动，选择陈述与自己的符合程度。本题本不设固定回顾期；五个选项从完全不符合到非常符合，不计事件次数。六分钟只是用时估计，不限时。阅读结果时，可同时记住自己想到的具体场景。"
      },
      {
        "en": "The original midpoint 3 means uncertain or depends on the situation. It is a valid numeric choice and is not an unscored skip. This edition contains no NA option. If you do not want to answer a statement, you can stop or read the public guides without finishing. All twenty valid choices are required before any personal group scores appear; do not invent an answer just to reach a report.",
        "zh": "原中点3表示“不确定或视情况”，是有效数值，不是不计分跳过。本版没有NA选项。不想回答某项时，可以停止或不完成就阅读公开指南。所有20项有效选择齐备后才显示个人题组分；无需为了得到报告而编造回答。"
      }
    ]
  },
  {
    "id": "annoying-context-expression",
    "title": {
      "en": "Direct expression: conclusion, background, timing and delivery",
      "zh": "直接表达：结论、背景、时机与语气"
    },
    "paragraphs": [
      {
        "en": "The first four items concern leading with a conclusion, clipped tone under time pressure, timing when pointing out a problem and attention to delivery during disagreement. A combined sum does not identify which of these you endorsed. It also does not measure tact, empathy or whether an audience was actually offended. Direct expression is not itself a defect.",
        "zh": "前四题涉及先说结论、时间紧时语气简短、指出问题的时机，以及分歧中对表达方式的留意。题组合计不能指出你具体认同哪一项，也不测委婉、共情或听者是否真的被冒犯。直接表达本身不是缺陷。"
      },
      {
        "en": "For an ordinary shared task, you might distinguish an accurate conclusion from missing context: the proposed date is unavailable, and the relevant constraint is an existing booking. If you want to add that context, ask whether it would help now. A clear no need not become a long explanation, and the questionnaire cannot prove either that your delivery caused distress or that someone else was too sensitive.",
        "zh": "以普通合作任务为例，可以区分结论是否准确与背景是否缺失：提议日期不可用，相关限制是已有预约。若愿意补充，可先问现在是否需要这些背景。清楚说不无需变成长篇解释；问卷既不证明表达造成痛苦，也不证明别人过于敏感。"
      }
    ]
  },
  {
    "id": "annoying-context-pause",
    "title": {
      "en": "Pausing contact: what happened and what remains unknown",
      "zh": "暂停联系：已发生什么，哪些仍未知"
    },
    "paragraphs": [
      {
        "en": "Items five to eight concern reducing contact before explaining, leaving a tiring conversation without a return arrangement, delaying a reply while deciding how to respond and resuming without discussing the pause. They record your descriptions of those situations. They cannot establish punishment, avoidance, attachment style, the other person’s response or a duty to be constantly available.",
        "zh": "第五至八题涉及先减少联系再解释、疲惫时离开但未安排返回、尚未想好回应而延后消息，以及恢复联系却未谈暂停。这些记录是你对情境的描述，不确立惩罚、逃避、依恋类型、他人反应或随时在线的义务。"
      },
      {
        "en": "A private check can separate needing rest from a coordination question: was there an existing agreement that needed updating? If it is safe and you choose to, you can state that you are unavailable without promising a return time. Silence alone does not tell the questionnaire why it occurred. You need not reopen unsafe contact to provide a better explanation or improve a score.",
        "zh": "私人回看可以把需要休息与协作问题分开：当时是否已有需要更新的约定？在安全且自愿时，可以只说明现在不方便，而不承诺返回时间。仅凭沉默，问卷不知道其原因；无需为补充解释或改善分数而重启不安全联系。"
      }
    ]
  },
  {
    "id": "annoying-context-coordination",
    "title": {
      "en": "Expectations and plan updates answer different questions",
      "zh": "期待确认与计划更新回答不同问题"
    },
    "paragraphs": [
      {
        "en": "Items nine to twelve ask about assuming standards are known, checking initial understanding, confirming responsibilities and expressing expectations through hints. Items thirteen to sixteen concern notice of changed plans, discovering resource limits after agreeing, updating delayed progress and explaining a changed reply rhythm. An expectation is not automatically an agreement, and an update is not a guarantee that the plan will succeed.",
        "zh": "第九至十二题问假设标准已知、核对最初理解、确认分工，以及用暗示表达期待；第十三至十六题问变更通知、答应后才发现资源限制、延迟进度更新，以及回复节奏变化的说明。期待不自动等于约定，更新也不保证计划成功。"
      },
      {
        "en": "For example, one person may expect a final review while the other agreed only to provide notes. Clarifying the agreed task addresses that uncertainty. A later resource shortage is a separate matter that may call for revising scope or timing. These examples are optional discussion prompts, not findings about you, and neither party must accept a new request or promise work beyond their resources.",
        "zh": "例如，一人期待最终审阅，另一人只答应提供笔记；澄清实际约定可回应这项不确定。之后出现资源不足是另一个问题，可能需要调整范围或时间。这些是可选讨论例子，不是对你的发现；双方都无需接受新请求或承诺超出资源的工作。"
      }
    ]
  },
  {
    "id": "annoying-context-boundaries",
    "title": {
      "en": "Boundaries: clarity without compulsory justification",
      "zh": "边界：清楚表达与保留选择"
    },
    "paragraphs": [
      {
        "en": "The final four items concern brief refusal without an alternative range, hints when wanting something to stop, explaining differing boundaries and unfamiliar expressions of closeness or distance. They do not assess whether your boundary is legitimate. Different relationships can have different boundaries; no score requires uniform access, further disclosure or an acceptable alternative before you can refuse.",
        "zh": "最后四题涉及简短拒绝而未提供可接受范围、希望停下时用暗示、说明不同边界，以及不熟悉的靠近或距离表达。不评定边界是否合法合理。不同关系可以有不同边界；拒绝不以统一接近权限、更多披露或提供可接受替代为条件。"
      },
      {
        "en": "A possible ordinary response is simply that you will not take on a request. If you freely wish, you can clarify a scope you would consider, but that is an additional choice. With coercion, threats or unsafe contact, treat protection as a real-world priority rather than a communication score to repair. No guide obliges negotiation, resumed contact or seeking someone’s approval for safety.",
        "zh": "普通请求中，可以只回答自己不接这件事；自愿时可另行澄清愿意考虑的范围，但这是附加选择。涉及胁迫、威胁或不安全联系时，保护自己是现实优先事项，不是等待修复的沟通分数。任何指南都不要求协商、恢复联系或先获批准才能保障安全。"
      }
    ]
  },
  {
    "id": "annoying-context-calculation",
    "title": {
      "en": "Five four-item sums: a new worked example",
      "zh": "五组四题分别计分：新的算例"
    },
    "paragraphs": [
      {
        "en": "All items are scored forward from 1 to 5. A group’s four answers 5, 1, 4 and 5 give a raw sum of 15 and mean 15 ÷ 4 = 3.75. Answers 4, 4, 4 and 3 give the same mean through a different pattern. Raw sums range from 4 to 20 and means from 1 to 5, shown to two decimals. Neither is a percentage of people who dislike you or a norm-referenced rank.",
        "zh": "全部题目按1—5直接计分。某组四项回答5、1、4、5，原始和15，均值15÷4＝3.75；4、4、4、3经过不同模式也得到相同均值。原始和范围4—20，均值1—5，显示两位小数；都不是讨厌你的人占比或常模排名。"
      },
      {
        "en": "If any answer is missing, every personal group score is withheld until all twenty responses are valid. The four remaining groups are not a partial personal report, and no replacement value is inserted. All groups can tie at 3.00 when every answer is midpoint 3; this describes the chosen uncertainty options, not five equally serious problems or proof that nothing happened.",
        "zh": "任一题缺答时，全部个人题组分都会暂缓，直到20项选择齐备；其余四组也不构成部分个人报告，不插入替代值。全部选中点3时，五组可同为3.00；这描述所选的不确定选项，不是五个同样严重问题，也不证明什么都没发生。"
      }
    ]
  },
  {
    "id": "annoying-context-evidence",
    "title": {
      "en": "Self-report, perceived liking and information from others",
      "zh": "自报、被喜欢的估计与他人信息"
    },
    "paragraphs": [
      {
        "en": "Boothby and colleagues studied the difference between people’s estimates of being liked and their conversation partners’ own ratings. Across several settings, participants tended to underestimate liking. This group-level liking gap does not establish that any particular person likes you, explain a rejection or validate this questionnaire. Your twenty self-descriptions contain no partner ratings to make that comparison. [1]",
        "zh": "Boothby等比较人们对“自己被喜欢程度”的估计与对话伙伴自身的评价；多个情境中出现低估的总体倾向。这种群体层面的喜欢差距，不确定某人是否喜欢你、不解释某次拒绝，也不验证本问卷。本站20项自述没有伙伴评价，无法作该比较。[1]"
      },
      {
        "en": "Eyal and colleagues found no consistent accuracy benefit from instructions to imagine another person’s perspective; a final experiment found a benefit from directly discussing the other person’s opinions. This is evidence about specific prediction tasks, not a guarantee for everyday conversations. If you choose to ask about an ordinary interaction, make the question specific and leave answering optional. No research obliges contact. This original form and its English translation have no established reliability, norms or cross-language equivalence. [2]",
        "zh": "Eyal等未发现“想象他人视角”指导语持续提高判断准确性；最后一个实验中，直接讨论对方意见有助于预测。这是特定任务的证据，不保证日常对话效果。若自愿询问普通互动，可具体提问，并允许对方不答；研究不产生联系义务。本原创题本与英文译文尚无已建立的信度、常模或跨语言等价证据。[2]"
      }
    ]
  }
];

export const annoyingLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is this the same as a difficult-person or likability test?",
      "zh": "这与难相处人格或讨人喜欢测试相同吗？"
    },
    "answer": {
      "en": "No. This original form has five interaction groups and twenty specific statements. Other tests use different constructs, items and scoring; their evidence cannot be transferred here.",
      "zh": "不同。本原创题本含五组互动、20条具体陈述；其他测试概念、题目与计分不同，其证据不能转移到这里。"
    }
  },
  {
    "question": {
      "en": "Should I count how often something happened?",
      "zh": "需要数行为发生了多少次吗？"
    },
    "answer": {
      "en": "Rate how well the statement describes you using the five original options. This form has no frequency anchors or fixed recall period.",
      "zh": "按原五个选项评价与自己的符合程度；题本没有频率锚点或固定回顾期。"
    }
  },
  {
    "question": {
      "en": "Does the same mean imply the same answers?",
      "zh": "相同均值表示回答完全相同吗？"
    },
    "answer": {
      "en": "No. Both 5,1,4,5 and 4,4,4,3 total 15 and give 3.75. Check individual statements and remembered circumstances as well.",
      "zh": "不是。5、1、4、5与4、4、4、3均合计15、均值3.75，还需结合具体陈述和回想情境。"
    }
  },
  {
    "question": {
      "en": "Can the five means be converted into a popularity percentage?",
      "zh": "五组均值能换算人缘百分比吗？"
    },
    "answer": {
      "en": "No. They are arithmetic summaries of your statements, without other-person ratings or a population comparison.",
      "zh": "不能。它们是自身陈述的算术摘要，没有他人评价或人群比较。"
    }
  },
  {
    "question": {
      "en": "Does a delayed reply prove punishment or rejection?",
      "zh": "回复慢就证明惩罚或拒绝吗？"
    },
    "answer": {
      "en": "No. The questionnaire does not observe reasons, agreements or the recipient’s experience. Context remains necessary.",
      "zh": "不证明。问卷不观察原因、约定或接收者体验，仍须结合背景。"
    }
  },
  {
    "question": {
      "en": "Does research prove that everyone likes me more than I think?",
      "zh": "研究证明所有人都比我想象中更喜欢我吗？"
    },
    "answer": {
      "en": "No. The liking-gap findings describe studied groups and settings. They do not determine an individual person’s feelings. [1]",
      "zh": "没有。喜欢差距描述被研究群体与情境，不确定某个具体人的感受。[1]"
    }
  },
  {
    "question": {
      "en": "Must I ask another person to confirm the result?",
      "zh": "必须找别人确认结果吗？"
    },
    "answer": {
      "en": "No. You can keep the reflection private or stop here. Any ordinary conversation is optional and cannot be demanded by a test.",
      "zh": "不必。可保持私人反思或到此结束；任何普通对话都自愿，不由测试要求。"
    }
  },
  {
    "question": {
      "en": "Does Start require another agreement?",
      "zh": "点击开始还需要再次同意吗？"
    },
    "answer": {
      "en": "No. Start opens question one directly without an extra agreement, registration or payment. Saving progress is optional.",
      "zh": "不需要。直接进入第一题，无需再次同意、注册或付款；保存进度自选。"
    }
  }
];

export const annoyingLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Boothby et al. (2018): the liking gap in conversations",
      "zh": "Boothby等（2018）：对话中的喜欢差距"
    },
    "url": "https://journals.sagepub.com/doi/abs/10.1177/0956797618783714"
  },
  {
    "title": {
      "en": "Eyal, Steffel & Epley (2018): perspective taking and getting",
      "zh": "Eyal、Steffel与Epley（2018）：想象与获取他人视角"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/29620401/"
  }
];
