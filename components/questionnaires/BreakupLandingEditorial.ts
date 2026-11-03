import type { Questionnaire } from "@/lib/questionnaires/types";

export const breakupLandingSections: Questionnaire["guide"] = [
  {
    "id": "breakup-context-purpose",
    "title": {
      "en": "What a breakup reflection can actually describe",
      "zh": "分手复盘能整理什么"
    },
    "paragraphs": [
      {
        "en": "This form reviews one intimate relationship that has already ended. It asks how well twenty-four statements fit what you remember before the ending. Four topics organise that record: conversations, expectations, boundaries and trust, and outside pressures. This is a retrospective account from one person, rather than an observation of both partners or an investigation of the ending.",
        "zh": "本问卷只回顾一段已经结束的亲密关系：二十四条陈述与你记得的关系结束前经历有多符合。四个主题整理这份记录：沟通、期待、边界与信任，以及外部压力。这是一个人的事后回顾，不是对双方的直接观察，也不是对分手经过的调查。"
      },
      {
        "en": "Reviewing the relationship and assessing recovery are different tasks. A person can recall difficult conversations while feeling settled now, or recall few of these situations while still missing someone. These questions do not measure grief, readiness to date, attachment style or whether the decision to end the relationship was right. Choose another kind of assessment only when its actual question matches yours.",
        "zh": "回顾关系与评估分手后的恢复，是不同任务。一个人可以记得沟通困难，但现在已经平静；也可能很少记得这些情境，却仍想念对方。这些题不测哀伤、开始新关系的准备程度、依恋类型，也不裁定分手决定对不对。选择其他测评时，应先核对它实际回答的问题。"
      }
    ]
  },
  {
    "id": "breakup-context-topics",
    "title": {
      "en": "Four records, with different questions behind them",
      "zh": "四组记录，各自对应不同问题"
    },
    "paragraphs": [
      {
        "en": "Communication covers unfinished conversations, recurring disagreements, guessing meanings, capacity to respond, sharing and clarification. Expectations covers contact, commitment, support, personal time, responsibilities and what each person wanted from the relationship. Similar responses in these two groups do not establish a single underlying defect; an unspoken preference and an interrupted discussion are different events.",
        "zh": "沟通组涉及未完成的谈话、重复分歧、猜测意思、回应余力、近况分享与澄清；期待组涉及联系、承诺、支持、私人时间、责任安排，以及各自希望从关系中获得什么。两组回答相似，不证明存在同一种潜在缺陷；没有说出口的偏好，与一段被打断的讨论，是不同事件。"
      },
      {
        "en": "Boundaries and trust covers openness, remembered boundaries, changed agreements, responses to refusal, privacy and checking. External pressure covers work, study, finances, distance, schedules, family, caregiving and life changes. Record what actually happened separately from what you infer about an intention. Outside pressure may provide context, but never excuses threats, coercion or control.",
        "zh": "边界与信任组涉及坦诚范围、边界是否被记住、约定变更、拒绝后的回应、隐私与核对；外部压力组涉及工作、学习、经济、距离、作息、家庭、照顾任务与生活变化。把实际发生的事与对意图的推断分开记录。外部压力可以说明背景，但不能为威胁、胁迫或控制免责。"
      }
    ]
  },
  {
    "id": "breakup-context-arithmetic",
    "title": {
      "en": "A complete worked example, without a main-cause ranking",
      "zh": "完整算例：保留四组，不选主要原因"
    },
    "paragraphs": [
      {
        "en": "Suppose the communication answers are 5, 2, 4, 3, 5 and 4: the sum is 23 and the mean is 23 ÷ 6 = 3.8333. Expectations answers 2, 4, 1, 3, 2 and 5 give 17 and 2.8333. Boundaries answers 4, 5, 3, 2, 4 and 3 give 21 and 3.5000. External-pressure answers 1, 3, 2, 4, 1 and 3 give 14 and 2.3333. These are four independent summaries in the original topic order.",
        "zh": "假设沟通六项依次选5、2、4、3、5、4，原始和23，均分23÷6＝3.8333；期待组2、4、1、3、2、5，得17与2.8333；边界组4、5、3、2、4、3，得21与3.5000；外部压力组1、3、2、4、1、3，得14与2.3333。它们是按原主题顺序呈现的四份独立摘要。"
      },
      {
        "en": "The larger number is not a larger share of the breakup. Different items can have the same sum, and a remembered event can matter without raising the average much. Four decimal places preserve the source calculation; they do not demonstrate measurement precision. Do not add the four sums, rank responsibility or turn a mean into a percentage of incompatibility.",
        "zh": "较大的数字不是较大的分手原因份额；不同回答可得到相同原始和，一件重要的事也未必明显抬高均分。四位小数保留源运算方式，不证明测量精度。不要把四组相加、按数值分配责任，或把均分换成不合适的百分比。"
      }
    ]
  },
  {
    "id": "breakup-context-uncertainty",
    "title": {
      "en": "Uncertainty is not the same as an unscored answer",
      "zh": "不确定与不计分，是两种回答"
    },
    "paragraphs": [
      {
        "en": "The original middle choice, 3, means uncertain or depends on the situation. It remains a numeric answer. Six such answers therefore give 18 and 3.0000, but do not show moderate difficulty or that an event partly happened. Read the words alongside the arithmetic instead of treating the scale as a frequency count.",
        "zh": "原中点3表示不确定或视情况，仍属于数值回答。因此六项都选3，会得到18与3.0000，却不说明困难中等，也不说明某件事部分发生。应把选项文字与运算一起读，不把这套选项解释成频率计数。"
      },
      {
        "en": "The website also offers unable or prefer not to answer, which is unscored. Replacing the fourth communication answer in the example with this choice leaves five numeric responses; that group displays neither a sum nor a mean. The other three complete groups remain available. Nothing is filled with zero or 3. Even an entirely unscored attempt can finish and read all four full guides.",
        "zh": "网页另有“无法作答或不愿回答”，不计分。若把算例中沟通第四项改成此选项，该组只剩五项数值回答，不显示原始和与均分；其他三个完整组仍保留。缺答不会补0或3。即使全部不计分，也可以完成并阅读四篇完整指南。"
      }
    ]
  },
  {
    "id": "breakup-context-evidence",
    "title": {
      "en": "Breakup research provides context, not validation of this form",
      "zh": "分手研究提供背景，不替本站题本完成验证"
    },
    "paragraphs": [
      {
        "en": "Slotter, Gardner and Finkel’s 2010 research examined self-concept after breakups across three studies using different methods. Their abstract reports changes in self-concept content and clarity, with reduced clarity predicting emotional distress. This concerns identity after an ending; it does not establish these four review topics as validated subscales or tell us why an individual relationship ended. [1]",
        "zh": "Slotter、Gardner与Finkel在2010年研究中，通过三项不同方法的研究考察分手后的自我概念；其摘要报告自我概念内容与清晰度变化，以及清晰度降低对情绪困扰的预测。这讨论的是关系结束后的身份体验，没有把本站四个复盘主题验证成分量表，也不能解释某段关系为什么结束。[1]"
      },
      {
        "en": "Marshall’s 2012 survey of 464 participants examined Facebook contact, monitoring and adjustment. Associations varied by whether someone remained friends or actively checked a former partner’s information; the observational design cannot establish which process caused the other. This is not evidence that collecting more information about an ex is necessary for reflection, or that a questionnaire can prescribe contact. Neither study tested this original twenty-four-item form. [2]",
        "zh": "Marshall在2012年对464名参与者的调查考察Facebook联系、查看行为与适应；保留好友与主动查看前伴侣信息所呈现的关联并不完全相同。观察性设计不能确认哪一过程导致另一过程。这不意味着复盘必须收集前伴侣更多信息，也不意味着问卷可以规定是否联系。两项研究都没有检验本站原创二十四题。[2]"
      }
    ]
  },
  {
    "id": "breakup-context-example",
    "title": {
      "en": "Separate a remembered fact, a feeling and an inference",
      "zh": "把记得的事实、感受与推断分开"
    },
    "paragraphs": [
      {
        "en": "For an illustrative example, imagine a planned visit that never happened after a work shift changed. “We had planned Saturday; the shift changed; we did not set another date” records a sequence. “I felt unimportant” records a feeling. “They never wanted to see me” infers an intention. These statements have different evidential status even if all feel vivid. This invented example is not a case history.",
        "zh": "举一个虚构例子：一次原定见面因排班变化没有成行。“原定周六；后来排班变了；没有再定日期”记录先后经过；“我感到自己不重要”记录感受；“对方从来不想见我”则推断意图。这些说法即使都很鲜明，证据性质仍不同。本例不是个案记录。"
      },
      {
        "en": "If useful and safe, write only what you remember, mark approximate words as approximate, and leave unknowns open. You can keep a future need such as earlier notice about changed plans. This does not require asking the former partner to confirm the account, checking their messages or social media, or sending the questionnaire to them. Choosing not to write is equally acceptable.",
        "zh": "如果有用且安全，可只记得出的部分，把大意标成大意，未知处保留未知；也可留下以后希望更早说明的一项需要，例如计划变动时提前告知。这不要求让前伴侣确认经过、查看其消息或社交动态，也不要求把答卷发给对方。不写同样可以。"
      }
    ]
  },
  {
    "id": "breakup-context-safety",
    "title": {
      "en": "Safety cannot be averaged into ordinary relationship differences",
      "zh": "安全问题不能平均成普通相处差异"
    },
    "paragraphs": [
      {
        "en": "WHO describes intimate partner violence as including harm by a partner or former partner, including physical aggression, sexual coercion, psychological abuse and controlling behaviours. This public-health resource supplies a safety distinction, not a diagnostic rule for this quiz. Threats, force, stalking or control must not be reframed as a symmetrical failure to communicate. [3]",
        "zh": "WHO关于亲密伴侣暴力的说明涉及现任或前伴侣造成的伤害，包括身体攻击、性胁迫、心理虐待与控制行为。这份公共卫生资料帮助区分安全问题，不是本问卷的诊断规则。威胁、强迫、跟踪或控制，不应被改写成双方对称的沟通失败。[3]"
      },
      {
        "en": "No score proves or rules out harm. A low mean does not require staying in contact, forgiving or meeting again; a high mean does not establish an accusation. If completing or storing a private note could increase risk, stop or skip it. You may seek support based on the actual situation without finishing this test, and you do not owe anyone access to your answers.",
        "zh": "任何分数都不能证明或排除伤害。均分低不要求保持联系、原谅或再次见面，均分高也不能作为指控的证明。若作答或保存私人笔记可能增加风险，可以停止或跳过。你可以依据现实情境求助，无需先完成测试，也不需要让任何人查看答卷。"
      }
    ]
  },
  {
    "id": "breakup-context-use",
    "title": {
      "en": "Use the record without turning it into a verdict",
      "zh": "怎样使用记录，同时保留判断空间"
    },
    "paragraphs": [
      {
        "en": "The Chinese items are FermatMind’s original form; the English text is a working translation. The source has no completed reliability, validity or normative study. A reproducible sum shows how answers were combined, not that the interpretation has been validated. Reading research or another provider’s test cannot transfer its evidence to this form.",
        "zh": "中文条目来自费马原创题本，英文为工作译文；当前题本尚无完成的信度、效度或常模研究。可复算的原始和说明答案怎样合并，不等于解释已经得到验证。阅读研究或其他平台测试，不能把其证据转移到本站题本。"
      },
      {
        "en": "Start opens the first question directly. Answers are calculated in the browser; temporary saving is optional and expires after twenty-four hours in this tab. Completion, clearing or retaking removes saved progress. Public guide links carry no private answers. Return to a result by considering the particular event and uncertainty, not by treating a changed mean as proof that the past itself changed.",
        "zh": "点击开始直接进入第一题。答案在浏览器计算，临时保存由你选择，并在本标签页二十四小时后失效；完成、清除或重测会删除已存进度。公开指南链接不携带私人答案。重新理解结果时，应核对具体事件与未知处，不把均分变化当成过去事实已经改变的证明。"
      }
    ]
  }
];

export const breakupLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does this test describe my present recovery?",
      "zh": "这项测试描述我现在恢复得怎样吗？"
    },
    "answer": {
      "en": "No. It reviews remembered experiences before one relationship ended. Current grief, daily functioning and readiness for another relationship are different questions.",
      "zh": "不是。它回顾一段关系结束前所记得的经历；现在的哀伤、日常功能与开始新关系的准备程度，是不同问题。"
    }
  },
  {
    "question": {
      "en": "Can the largest mean identify the main reason?",
      "zh": "最高均分能找出主要分手原因吗？"
    },
    "answer": {
      "en": "No. The four groups contain different statements, without a validated common causal metric. Their fixed order is for reading, not ranking explanations.",
      "zh": "不能。四组包含不同陈述，尚无经过验证的共同因果尺度；固定顺序用于阅读，不用于排序原因。"
    }
  },
  {
    "question": {
      "en": "Is a mean of 3.0000 moderate difficulty?",
      "zh": "均分3.0000表示困难中等吗？"
    },
    "answer": {
      "en": "Not necessarily. The original option 3 means uncertain or depends on the situation, and different answer patterns can yield the same mean.",
      "zh": "不一定。原选项3表示不确定或视情况，而且不同回答组合可以产生相同均分。"
    }
  },
  {
    "question": {
      "en": "Why show four decimal places?",
      "zh": "为什么显示四位小数？"
    },
    "answer": {
      "en": "This preserves the original six-item calculation and rounding. It does not establish that the questionnaire measures experience to that precision.",
      "zh": "这是保留原六题计算与舍入方式，不说明问卷能够以这种精度测量经历。"
    }
  },
  {
    "question": {
      "en": "Can good memories cancel a boundary violation?",
      "zh": "好的回忆能抵消一次越界吗？"
    },
    "answer": {
      "en": "No. There is no net relationship score. A harmful event can matter independently of the other answers, and no mean establishes safety.",
      "zh": "不能。这里不计算关系净分；一次伤害事件可以独立重要，任何均分都不能确认安全。"
    }
  },
  {
    "question": {
      "en": "Must both former partners answer?",
      "zh": "需要前伴侣也作答吗？"
    },
    "answer": {
      "en": "No. This is a private, one-person reflection. It does not compare partners, settle a disputed account or require sharing an answer sheet.",
      "zh": "不需要。这是单人私人回顾，不比较双方，不裁决争议经过，也不要求分享答卷。"
    }
  },
  {
    "question": {
      "en": "Can I review several relationships together?",
      "zh": "可以把几段关系混在一起回顾吗？"
    },
    "answer": {
      "en": "Use one relationship that has ended as the reference throughout this attempt. Mixing different periods or people makes the four summaries harder to interpret.",
      "zh": "本次请始终以同一段已经结束的关系为参照。混用不同关系或时期，会使四组摘要更难理解。"
    }
  },
  {
    "question": {
      "en": "Does Start require another agreement or payment?",
      "zh": "点击开始后还需要再次同意或付费吗？"
    },
    "answer": {
      "en": "No. Start opens question one directly, without another agreement, registration or payment. Every complete guide is free, including when a group remains unscored.",
      "zh": "不需要。开始直接进入第一题，无需再次同意、注册或付款；即使某组暂缺，完整指南仍免费开放。"
    }
  }
];

export const breakupLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Slotter, Gardner and Finkel (2010): breakup and self-concept, original abstract",
      "zh": "Slotter等（2010）：分手与自我概念原始研究摘要"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/20008964/"
  },
  {
    "title": {
      "en": "Marshall (2012): online monitoring and post-breakup adjustment",
      "zh": "Marshall（2012）：网络查看行为与分手后适应研究"
    },
    "url": "https://journals.sagepub.com/doi/10.1089/cyber.2012.0125"
  },
  {
    "title": {
      "en": "WHO: intimate partner violence, including former partners",
      "zh": "WHO：包括前伴侣在内的亲密伴侣暴力说明"
    },
    "url": "https://www.who.int/news-room/fact-sheets/detail/violence-against-women"
  }
];
