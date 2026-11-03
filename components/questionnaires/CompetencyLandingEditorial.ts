import type { Questionnaire } from "@/lib/questionnaires/types";

export const competencyLandingSections: Questionnaire["guide"] = [
  {
    "id": "competency-context-scope",
    "title": {
      "en": "Competency reflection: six topics, one recent reference period",
      "zh": "职业胜任力反思：六个主题，同一近期参照"
    },
    "paragraphs": [
      {
        "en": "Occupational competency concerns the knowledge, skills, abilities, behaviors and other characteristics needed for successful work. OPM connects its competency descriptions with occupational analysis; O*NET describes transferable skills across jobs. These frameworks provide vocabulary, not this questionnaire or its scoring rules. FermatMind’s thirty-six original statements record recalled behavior in six editorial groups, rather than testing the complete requirements of an occupation. [1][2]",
        "zh": "职业胜任力涉及成功工作所需的知识、技能、能力、行为及其他特征。OPM把胜任力描述与职业分析连接，O*NET描述可跨工作使用的技能。这些框架提供概念词汇，没有提供本站题目或计分规则。费马36项原创陈述分为六个编辑主题，记录回忆中的行为，并未测试某职业的全部要求。[1][2]"
      },
      {
        "en": "The six public guides cover shared understanding, problem framing, agreed responsibility, output conditions, responses to change and shared delivery. Each connects a separate frequency mean with an example, contextual alternatives and an optional next step. You can read every guide before answering or after an all-unscored attempt. No strongest type, overall competency grade or job match is selected.",
        "zh": "六份公开指南分别讨论共同理解、问题界定、责任协商、成果条件、变化回应与共同交付，把独立频率均分与实例、情境差异及可选下一步连接起来。作答前或全部选择不计分后，也能读全部指南；不选出最强类型、综合胜任等级或匹配岗位。"
      }
    ]
  },
  {
    "id": "competency-context-answer",
    "title": {
      "en": "Answer from actual occasions, not an ideal employee image",
      "zh": "根据实际机会回答，而非理想员工形象"
    },
    "paragraphs": [
      {
        "en": "Use the past four weeks in work, study, volunteering or shared projects. When a relevant occasion arose, how often did you do the stated behavior? Never, Rarely, Sometimes, Often and Almost always contribute 1–5. Sometimes is a scored answer. No relevant occasion, inability to judge or a choice not to answer can instead be unscored; it is not zero and is not a failure.",
        "zh": "以过去四周的工作、学习、志愿活动或共同项目为参照：有相关机会时，多常做出题述行为？从未、很少、有时、经常、几乎每次依次记1—5；有时是有效数值。没有相关机会、无法判断或暂不回答时，可选不计分；它不是零，也不是不合格。"
      },
      {
        "en": "For instance, if no requirement changed, do not invent a change to answer the revision questions. If a change occurred but you did not check its impact, Never may describe that experience. Different roles provide different opportunities and authority. Keep the same four-week period throughout; ten minutes is an estimate, not a timer. No workplace records or private messages need to be uploaded.",
        "zh": "例如，没有要求变化，就不必虚构变化来回答修订题；若确有变化却未核对影响，从未可能符合经历。不同角色的机会与权限不同。全程保持同一四周期限，约十分钟是估计而非限时；无需上传工作记录或私密消息。"
      }
    ]
  },
  {
    "id": "competency-context-meaning-problems",
    "title": {
      "en": "Shared meaning and problem framing: specify what needs checking",
      "zh": "共同理解与问题界定：明确要核对什么"
    },
    "paragraphs": [
      {
        "en": "Items one to six revisit requests, unfamiliar terms, conflicting meanings, next steps, alternative explanations and units. A useful reflection asks what the recipient needed in order to act. In a fictional handover, “review the file” might mean checking figures or approving publication. Asking which action is intended can clarify this one request; the number of times you asked does not establish communication effectiveness.",
        "zh": "第一至六项回看请求、陌生术语、含义冲突、下一步、替代说明与单位。有用的反思是问：接收方需要知道什么才能行动？虚构交接中，“看一下文件”可能指核数字，也可能指批准发布；询问具体行动可以澄清这次请求，询问次数却不能证明沟通有效。"
      },
      {
        "en": "Items seven to twelve concern the expected-versus-observed difference, competing explanations and checks that could distinguish them. Suppose a missing output could reflect a failed process or a different folder location. First identify what observation would separate these explanations, within your access and role. An extended investigation is not always warranted; an already-understood issue may need a bounded correction. The mean does not test diagnostic accuracy.",
        "zh": "第七至十二项关注预期与实际差别、竞争解释及可区分它们的核对。假设成果缺失可能是流程失败，也可能是存到了别处，可先明确什么观察能区分两种解释，并遵守权限与职责。并非总要延长调查，已明确的问题可能只需有限修正；均分不检验判断正确性。"
      }
    ]
  },
  {
    "id": "competency-context-authority-output",
    "title": {
      "en": "Agreed action and usable outputs: permission, inputs and conditions",
      "zh": "协商行动与可用成果：权限、输入和条件"
    },
    "paragraphs": [
      {
        "en": "Items thirteen to eighteen concern a proposed purpose, agreement, decision boundaries and responsibility. Suggesting a step is different from assigning it to others. For an ordinary group display, ask what has been agreed, who can decide unresolved points and who wants to contribute. More initiative is not always appropriate, and declining a role need not imply low ambition. This group does not score leadership potential.",
        "zh": "第十三至十八项关注提案目的、协商、决定边界与责任。建议一个步骤不同于给别人分派任务。普通小组展板可以先确认已商定什么、未决事项由谁决定、谁愿意参与。更多发起行动并非总合适，婉拒角色也不表示志向低；本组不为领导潜力计分。"
      },
      {
        "en": "Items nineteen to twenty-four examine the intended user, essential features, compatible formats and units, required inputs, shared resources and operating conditions. A timetable alone cannot show whether finished pieces will fit together. For example, a poster file and available display stand need compatible dimensions. This is reflection on specifying an output, not a test of scheduling speed or technical correctness.",
        "zh": "第十九至二十四项查看使用者、必要特征、格式单位兼容、输入依赖、共用资源与运行条件。只有时间表，无法说明完成的部分能否组合；例如海报文件与现有支架需要尺寸兼容。这是成果规格反思，不测试排程速度或技术正确性。"
      }
    ]
  },
  {
    "id": "competency-context-change-delivery",
    "title": {
      "en": "Responding to change and connecting contributions",
      "zh": "回应变化与衔接贡献"
    },
    "paragraphs": [
      {
        "en": "Items twenty-five to thirty ask what changed, why a method needed revision, what concrete feedback showed, whether a small relevant trial was possible and what happened after revision. Testing a permitted sample task before adopting a tool can reveal a missing requirement. Keeping a suitable existing method can also be reasoned. Frequency cannot show learning speed, obedience or a stable adaptability capacity.",
        "zh": "第二十五至三十项询问改变了什么、为什么修订方法、具体反馈说明什么、是否能小范围试用，以及修订后怎样。采用工具前，获准的小任务试用可能发现缺少必要条件；保留合适旧方法也可以有依据。频率不能说明学习速度、服从程度或稳定适应能力。"
      },
      {
        "en": "Items thirty-one to thirty-six concern integration, another person’s constraints, task disagreements, wanted help and checkpoints. Two contributions can each be finished while contradicting the agreed purpose when combined. Discuss the mismatch and check whether help is wanted before taking over. Good coordination may produce a clearer boundary rather than extra work. This self-report does not measure popularity or predict a team’s performance.",
        "zh": "第三十一至三十六项关注整合、他人限制、任务分歧、是否需要帮助及检查点。两份贡献可能各自完成，组合后却偏离商定目的。接手前可讨论不一致，并确认对方是否需要帮助；协调成果也可以是边界更清楚，而非增加工作。本自报不测受欢迎程度或预测团队绩效。"
      }
    ]
  },
  {
    "id": "competency-context-calculation",
    "title": {
      "en": "A six-item calculation, with completeness kept visible",
      "zh": "六项算例：让完整程度保持可见"
    },
    "paragraphs": [
      {
        "en": "All thirty-six items are scored forward. For a fresh example, six choices 5, 2, 4, 1, 5 and 3 sum to 20. Dividing 20 by six and rounding to one decimal displays 3.3 / 5. The five categories are ordered frequency responses, not measured counts of every occasion. Their mean is a descriptive convention; 3.3 is neither 66 percent effective nor a population percentile.",
        "zh": "36项全部正向计分。以新算例说明：六项选择5、2、4、1、5、3，合计20；20除以六并保留一位小数显示3.3 / 5。五档是有顺序的频率回答，并非逐次记录全部机会；均值是一种描述约定，3.3既不表示有效率66%，也不是人群百分位。"
      },
      {
        "en": "If the fourth answer becomes unscored, five numeric answers sum to 19, but this group has no mean. Dividing by five would violate this edition’s all-six rule. Other complete groups retain their values and all six guides remain readable. The completeness rule is an editorial decision, not an empirically established missing-data threshold; it does not recover an answer that was not supplied.",
        "zh": "第四项若改为不计分，剩余五项合计19，本组不显示均分；除以五会违反本版六项齐全规则。其他完整组保留数值，六份指南仍全部可读。完整规则为编辑决定，并非实证确立的缺失阈值，也不恢复未提供的回答。"
      }
    ]
  },
  {
    "id": "competency-context-evidence",
    "title": {
      "en": "Self-report, demonstrated work and validation are different evidence",
      "zh": "自报、工作展示与测量验证是不同证据"
    },
    "paragraphs": [
      {
        "en": "Zell and Krizan’s 2014 synthesis found a moderate overall correspondence between ability self-evaluations and performance measures, with variation across contexts. Dunning and Helzer’s commentary further distinguishes correlation from other forms of accuracy and bias. Neither article tests these questions. Their relevance is methodological: a person’s description and an observed outcome answer related but different questions; a correlation is not an individual accuracy percentage. [3][4]",
        "zh": "Zell与Krizan的2014年综合研究发现，能力自评与表现测量总体中等相关，且随情境不同；Dunning与Helzer的评论进一步区分相关性与其他准确性、偏差指标。两篇均未检验本站题目，相关之处在方法：个人描述与观察到的成果回答相关但不同的问题，相关系数不是个体准确率。[3][4]"
      },
      {
        "en": "OPM describes work samples as performing job-like tasks, with behavior or outcomes evaluated. This form asks what you remember doing; it does not observe your work or apply role-specific performance criteria. Its original English and Chinese have no established reliability, factor structure, occupational norms, predictive validity or language equivalence. Accurate arithmetic alone cannot establish those properties. Public frameworks do not certify this bank. [1][5]",
        "zh": "OPM把工作样本描述为完成类似岗位任务，再评价行为或成果。本页询问记得做过什么，没有观察工作或采用岗位特定绩效标准。原创英中文题尚无已建立的信度、因子结构、职业常模、预测效度或语言等价证据；算术正确本身不能确立这些性质，公开框架也不认证本题本。[1][5]"
      }
    ]
  },
  {
    "id": "competency-context-use",
    "title": {
      "en": "Turn one reflection into a specific development question",
      "zh": "把一次反思转为具体的发展问题"
    },
    "paragraphs": [
      {
        "en": "Choose a behavior that matters to a current task, not simply the lowest mean. Record one occasion, what you tried, the constraints and what you actually observed afterward. Separate your intention from the recipient’s experience. If useful and appropriate, ask for one example of what helped and one unresolved issue. Feedback need not agree with your self-rating and should concern the task rather than the person’s worth.",
        "zh": "选择与当前任务有关的行为，不必选最低均分。记下一个机会、尝试的行动、限制与后来实际观察到的情况，区分自身意图和接收方体验。合适且有用时，可请对方补充一个有帮助的例子及一个未解决问题。反馈无需认同自评分，应围绕任务而非人的价值。"
      },
      {
        "en": "Agree one small, permitted adjustment and a checkable outcome, such as whether a requested action became clearer. A later attempt may involve different tasks, authority or opportunities, so a changed mean does not by itself establish improvement. There is no reliable-change threshold or training prescription here. You can keep the reflection private, use an example in a voluntary learning conversation or finish without taking another test.",
        "zh": "可商定一个获准的小调整和可核对成果，例如请求的行动是否更清楚。下次任务、权限或机会可能不同，均分变化本身不能证明改善；本页没有可靠变化阈值或训练处方。可以私下保留反思、自愿用于学习讨论，或结束而不再做其他测试。"
      }
    ]
  }
];

export const competencyLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is this an OPM or O*NET competency instrument?",
      "zh": "这是OPM或O*NET胜任力工具吗？"
    },
    "answer": {
      "en": "No. These resources supply conceptual background. FermatMind independently wrote the questions, language versions and guides; their frameworks do not validate this bank. [1][2]",
      "zh": "不是。这些资源仅提供概念背景，题目、语言版本与指南由费马独立编写；框架不验证本站题本。[1][2]"
    }
  },
  {
    "question": {
      "en": "Is this a situational judgment test or a work sample?",
      "zh": "这是情境判断测试或工作样本吗？"
    },
    "answer": {
      "en": "No. You report recalled behavior. There is no best-action answer key and no observed job-like task performance. [5]",
      "zh": "不是。这里报告回忆中的行为，没有最佳行动答案键，也没有观察岗位类似任务的完成表现。[5]"
    }
  },
  {
    "question": {
      "en": "Must I be employed or manage a team?",
      "zh": "必须在职或管理团队吗？"
    },
    "answer": {
      "en": "No. Relevant study, volunteering or shared projects can be the reference. Use unscored where no relevant occasion arose; do not invent authority or experience.",
      "zh": "不必。相关学习、志愿活动或共同项目也可作为参照。没有相关机会时选不计分，不虚构权限或经历。"
    }
  },
  {
    "question": {
      "en": "Can a larger mean reflect more unclear requests or changes?",
      "zh": "均分较大可能只是请求不清或变化更多吗？"
    },
    "answer": {
      "en": "Yes. The frequency of checking or revising can depend on the situation. This form does not count opportunities or separate their effects from personal behavior.",
      "zh": "可能。核对与修订频率会受情境影响；本页未逐次统计机会，也未将机会影响与个人行为分离。"
    }
  },
  {
    "question": {
      "en": "Does 3.3 / 5 mean 66 percent competent?",
      "zh": "3.3 / 5表示胜任程度66%吗？"
    },
    "answer": {
      "en": "No. It is the rounded mean of six frequency categories, not an effectiveness rate, proficiency percentage or comparison with a workforce.",
      "zh": "不是。它是六项频率类别的舍入均值，不是有效率、熟练百分比或与劳动人群的比较。"
    }
  },
  {
    "question": {
      "en": "Should I train whichever group has the lowest mean?",
      "zh": "应当训练均分最低的一组吗？"
    },
    "answer": {
      "en": "Not automatically. First ask whether the behavior matters to your actual task and whether the occasion, authority and resources were available. A low value alone is not a development diagnosis.",
      "zh": "不自动如此。先看行为是否与真实任务有关，以及当时是否有机会、权限和资源。低值本身不是发展诊断。"
    }
  },
  {
    "question": {
      "en": "Does a higher score next month prove progress?",
      "zh": "下个月分数升高就证明进步吗？"
    },
    "answer": {
      "en": "No. Tasks, opportunities and recall may differ. Compare a specific action and observed outcome; this bank has no established reliable-change threshold.",
      "zh": "不能证明。任务、机会和回忆可能不同，可对照具体行动与实际成果；题本没有已建立的可靠变化阈值。"
    }
  },
  {
    "question": {
      "en": "Does Start lead directly to the first question?",
      "zh": "点击开始会直接到第一题吗？"
    },
    "answer": {
      "en": "Yes. There is no second agreement, registration or payment step. Saving is optional, and every complete guide is free.",
      "zh": "会。没有再次同意、注册或付款步骤；保存进度自选，全部完整指南免费。"
    }
  }
];

export const competencyLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Zell and Krizan (2014): ability self-evaluation and performance",
      "zh": "Zell与Krizan（2014）：能力自评与表现"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/26173249/"
  },
  {
    "title": {
      "en": "Dunning and Helzer (2014): accuracy beyond correlation",
      "zh": "Dunning与Helzer（2014）：相关系数之外的准确性"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/26173250/"
  },
  {
    "title": {
      "en": "OPM: work samples and simulations",
      "zh": "OPM：工作样本与模拟"
    },
    "url": "https://www.opm.gov/policy-data-oversight/assessment-and-selection/other-assessment-methods/work-samples-and-simulations/"
  }
];
