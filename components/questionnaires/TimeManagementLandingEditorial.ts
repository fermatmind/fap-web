import type { Questionnaire } from "@/lib/questionnaires/types";

export const timeManagementLandingSections: Questionnaire["guide"] = [
  {
    "id": "tmh-instrument",
    "title": {
      "en": "What is this Time Management Test? Four groups of recent habits",
      "zh": "时间管理测试测什么？近期习惯的四个观察面"
    },
    "paragraphs": [
      {
        "en": "This original FermatMind questionnaire asks about twenty-four behaviors during the past two weeks. It keeps four readings separate: priorities and capacity, workable steps and estimates, attention and returning after interruptions, and review or renegotiation. Each part has six statements. A report of how often you performed an action is different from observing whether the action was effective, a deadline was met or a plan was accurate.",
        "zh": "这份费马原创问卷回看过去两周的24项行为，分别保留优先与容量、步骤与估时、专注与打断后返回、回看与重订四项读法，每部分六条陈述。报告多常做出某个行动，与实际观察行动是否有效、是否按时交付或计划是否准确，是不同证据。"
      },
      {
        "en": "A time-management assessment elsewhere may be a timed workplace judgment exercise, a study-skills inventory, an established research scale or a productivity-style quiz. Sharing a topic does not make their items, scoring or evidence interchangeable. This page has no right answers, ability grade, winning style or pass mark. All four six-section guides are public and remain complete whatever the personal readings show.",
        "zh": "其他“时间管理测评”可能是计时职场判断题、学习习惯清单、既有研究量表，或生产力风格测验。主题相同，不表示题目、计分与证据互换。本页没有正确答案、能力等级、获胜风格或合格线；四份各六节指南公开可读，不随个人读数缩短。"
      }
    ]
  },
  {
    "id": "tmh-opportunity",
    "title": {
      "en": "Answer for the past two weeks, when an occasion occurred",
      "zh": "回看过去两周，并考虑是否有相关机会"
    },
    "paragraphs": [
      {
        "en": "Use Never, Rarely, Sometimes, Often or Almost always for the described behavior when a relevant occasion occurred. Keep the same two-week window for all four parts. Do not turn the question into whether you approve of the behavior or how you would like to work in an ideal week. The questionnaire does not collect the number of occasions, hours worked or a time diary; a frequency rating is not a measured percentage of opportunities.",
        "zh": "请针对有相关机会时的陈述行为，在从不、很少、有时、经常、几乎总是中选择，四部分保持同一个两周回顾期。不要改答是否赞同这项做法，或理想一周里希望怎样工作。问卷没有收集机会次数、工作小时或时间日志，因此频率评分不是实测机会百分比。"
      },
      {
        "en": "No relevant occasion / prefer not to answer is separate and unscored. A quiet week without a deadline conflict does not require inventing an example or selecting Never as a substitute. Any skipped item withholds only its own part’s mean; the other complete parts still receive readings. Start opens question one directly, without a second agreement, account or payment. About six minutes is an estimate, not a timer.",
        "zh": "“没有相关机会／暂不回答”为单独未评分选项。平静的一周没有期限冲突时，无需编造例子，也不用“从不”代替缺少机会。任一跳题仅使所在部分暂不给均分，其他完整部分仍有读数。开始直接进入第一题，无需二次同意、账户或付款；约六分钟是估计，不是计时限制。"
      }
    ]
  },
  {
    "id": "tmh-priority-capacity",
    "title": {
      "en": "Priorities and capacity: make the trade-off visible",
      "zh": "优先与容量：把取舍说明白"
    },
    "paragraphs": [
      {
        "en": "The first six statements concern checking commitments against the time actually available. Priority identifies what needs attention; capacity asks what fits after fixed responsibilities, necessary rest and care. A request can be urgent without being feasible alongside every existing commitment. The reading describes reported checking and clarification, not how much authority you had to refuse, postpone or redistribute work.",
        "zh": "前六条关注把承诺与实际可用时间核对。优先顺序回答什么需要先处理；容量回答扣除固定责任、必要休息和照护后，还能容纳什么。请求可以紧急，却未必能与全部既有承诺同时兑现。读数描述报告的核对与澄清，不测你有多少权限拒绝、延期或重新分配工作。"
      },
      {
        "en": "For a fictional community workshop, one organizer is asked to prepare a new activity while already covering arrivals and accessibility arrangements. A useful question is which outcome is needed first and what resource or scope can change. Automatically accepting everything may hide a conflict; automatically rejecting the new activity may miss its importance. The questionnaire cannot decide the correct trade-off or assign blame.",
        "zh": "例如虚构社区工作坊中，一位组织者已负责签到与无障碍安排，又被要求准备新活动。可以问哪项成果先需要、哪些资源或范围能调整。全答应可能隐藏冲突，全拒绝也可能忽略新活动的重要性。问卷不能替你决定正确取舍或分配责任。"
      }
    ]
  },
  {
    "id": "tmh-planning-evidence",
    "title": {
      "en": "Steps and estimates: separate preparation from prediction",
      "zh": "步骤与估时：区分准备行为和预测准确度"
    },
    "paragraphs": [
      {
        "en": "The planning items concern finding a startable step, including setup and checking, revising estimates after comparable work, identifying prerequisites, allowing for foreseeable interruptions and deciding a usable stopping point. Reporting these practices more often does not demonstrate accurate estimates. To check accuracy, you would need actual estimates, durations and task conditions, which this questionnaire does not collect.",
        "zh": "计划题涉及能开始的步骤、准备和检查、参考类似任务修正估时、辨认前提、为可预见打断留余地，以及明确可用的收尾点。更常报告这些做法，不证明估时准确；核对准确度需要实际估计、耗时和任务条件，本问卷没有收集这些记录。"
      },
      {
        "en": "In the fictional workshop, producing a short handout may depend on receiving an approved room plan and checking the accessible version. Listing those prerequisites explains an estimate better than simply promising a faster finish. For one comparable task, an optional private note can record estimated time, actual time and what differed. Keep unusual conditions visible rather than adopting one observation as a permanent rule.",
        "zh": "在虚构工作坊中，制作简短资料可能先要取得已批准场地图，并检查无障碍版本。列出这些前提，比只承诺更快完成更能说明估时依据。可自愿为一项类似任务私下记下估计、实际耗时与差异原因；保留特殊条件，不把一次观察变成永久规则。"
      }
    ]
  },
  {
    "id": "tmh-focus-return",
    "title": {
      "en": "Attention and return: a usable next-action cue",
      "zh": "专注与返回：留下可继续行动的线索"
    },
    "paragraphs": [
      {
        "en": "This part asks about controllable distractions, return cues, task switches, smaller steps in fragmented time, availability and non-essential notifications. It does not administer a sustained-attention task or identify an attention disorder. A support role may require fast responses; a necessary interruption is different from an optional notification. Interpret the answer alongside what was actually controllable.",
        "zh": "这一部分询问可控干扰、返回提示、任务切换、零碎时间的小步骤、联络安排和非必要通知，没有施测持续注意任务，也不识别注意障碍。支持岗位可能需要快速回应，必要打断与可选通知不同；应结合真正可控的条件理解回答。"
      },
      {
        "en": "Before an expected pause during workshop preparation, someone could note “next: confirm the two room signs against the approved plan.” Returning to that cue is different from refusing all interruptions or claiming uninterrupted concentration. Try it only if appropriate and check whether it helps you locate the task. Necessary calls, care and accessibility tools should not be delayed to improve a questionnaire number.",
        "zh": "筹备工作坊时，预知要暂停，可以记一句“下一步：按已批准方案核对两处房间标识”。借线索返回，不同于拒绝所有打断或声称完全专注。合适时才尝试，并观察是否更容易找到任务位置；不应为提高问卷数字推迟必要电话、照护或无障碍辅助。"
      }
    ]
  },
  {
    "id": "tmh-review-constraints",
    "title": {
      "en": "Review and renegotiation: update the plan when conditions change",
      "zh": "回看与重订：条件改变时更新计划"
    },
    "paragraphs": [
      {
        "en": "The final six items concern updating next actions, comparing actual and estimated time, revising impossible deadlines, raising delivery risks, deciding what to continue or stop and checking carried-over work. Changing a plan can be a reasoned response to new conditions. Keeping the old date does not itself prove commitment, and a higher reading does not show that another person accepted the proposed change.",
        "zh": "最后六条涉及更新下一步、比较实际与估时、修订无法实现的期限、提出交付风险、决定继续或停止，以及核对结转事项。调整计划可以是对新条件的合理回应；保留旧日期本身不证明负责，较高读数也不表示对方接受了调整建议。"
      },
      {
        "en": "If the workshop room changes, the handout and signs may need revising together. A short review can identify what is still needed, what can wait and who needs an update. An item carried into tomorrow may now be unnecessary rather than merely unfinished. The aim is a clearer next decision, not another compulsory meeting or a requirement to disclose private work details.",
        "zh": "若工作坊更换房间，资料与标识可能需要一起修改。一次简短回看可明确什么仍需要、什么能等待、谁需要更新。挪到明天的事项，可能已经没必要，而不只是未完成。目标是让下一项决定更清楚，不是增加强制会议或要求披露私人工作细节。"
      }
    ]
  },
  {
    "id": "tmh-arithmetic",
    "title": {
      "en": "How are the four time-management readings calculated?",
      "zh": "四项时间管理读数怎样计算？"
    },
    "paragraphs": [
      {
        "en": "Each part uses six 1–5 ratings. Reverse items are 3, 6, 9, 12, 15, 18, 21 and 24: their contribution is 6 minus the selected number. Other items contribute the selected number directly. For each complete part, add the six contributions, divide by six and display one decimal. The four means are not summed, ranked or converted into a productivity percentage.",
        "zh": "每部分使用六条1—5评分。第3、6、9、12、15、18、21、24题反向，贡献为6减所选数字；其他题直接使用所选数字。完整部分的六项贡献相加，除以六，显示一位小数。四项均分不相加、不排名、不转为生产力百分比。"
      },
      {
        "en": "A new example answers 5, 2, 4, 3, 5, 1 within one part. With its third and sixth items reversed, contributions are 5, 2, 2, 3, 5, 5: sum 22 and mean 3.7 when rounded. If the last answer becomes unscored, this part has no mean; it is not divided by five. Six responses of 3 and keyed contributions 1, 1, 1, 5, 5, 5 both average 3.0, showing why a mean does not describe every situation.",
        "zh": "新例：一部分依次选5、2、4、3、5、1，其中第三、第六条反向，贡献为5、2、2、3、5、5，总和22，均分舍入显示3.7。最后一条若改为未评分，本部分不给均分，不改除以五。六项都为3，与定向贡献1、1、1、5、5、5，都平均3.0，说明均分不能描述每个情境。"
      }
    ]
  },
  {
    "id": "tmh-research-application",
    "title": {
      "en": "Research context and one optional observation",
      "zh": "研究背景与一项可选观察"
    },
    "paragraphs": [
      {
        "en": "Aeon, Faber and Panaccio’s 2021 meta-analysis included 158 studies and 53,957 participants. It reported associations with performance and wellbeing, while noting that most studies were cross-sectional and training content varied. [3] These findings provide background, not validation of this original questionnaire or proof that increasing one of its means causes better outcomes.",
        "zh": "Aeon、Faber与Panaccio的2021年元分析纳入158项研究、53,957名参与者，报告时间管理与表现及幸福感的关联，同时指出多数研究为横断面，培训内容也不同。[3] 这些发现提供背景，不验证本原创问卷，也不证明提高某项均分会导致更好结果。"
      },
      {
        "en": "The linked university resources offer practical approaches to observing time, scheduling and prioritizing in study settings. [1][2] Choose one relevant situation if useful, then consider what was within your control and whether one small adjustment clarified it. The original four groupings and two-week window have no established norms, change threshold or cross-language equivalence; use the same edition and context when comparing attempts.",
        "zh": "所链接大学资料提供学业情境中观察用时、安排日程和确定优先事项的实践思路。[1][2] 如有帮助，可以选一个相关情境，考虑什么在自己控制内，以及一项小调整是否让安排更清楚。原创四组及两周窗口没有已建立的常模、变化阈值或跨语言等价；比较作答时，应核对版本与情境。"
      }
    ]
  }
];

export const timeManagementLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is this a timed workplace judgment test?",
      "zh": "这是计时职场判断题吗？"
    },
    "answer": {
      "en": "No. These are twenty-four original frequency self-reports, not scenarios with correct actions or a work simulation. About six minutes is an estimate; no performance time is scored.",
      "zh": "不是。这是24条原创频率自报，不是有正确行动的情境题或工作模拟。约六分钟是估计，不计表现速度。"
    }
  },
  {
    "question": {
      "en": "Should I answer for an ideal week or the past two weeks?",
      "zh": "按理想的一周，还是过去两周作答？"
    },
    "answer": {
      "en": "Use the past two weeks and relevant occasions. The question concerns what you did, not whether you approve of the practice. Different workloads and opportunities can affect answers.",
      "zh": "使用过去两周发生的相关机会。题目询问做过什么，不是是否赞同这种做法；负担与机会不同，都可能影响回答。"
    }
  },
  {
    "question": {
      "en": "Does a day without interruptions count as Never?",
      "zh": "没有被打断的一天应该选从不吗？"
    },
    "answer": {
      "en": "Not automatically. If no relevant occasion occurred in the two-week window, the separate unscored option is available. Never describes a behavior on relevant occasions, not an invented missed opportunity.",
      "zh": "不自动这样算。两周内没有相关机会时，可选单独未评分项；“从不”描述有相关机会时的行为，不是虚构一次没做到。"
    }
  },
  {
    "question": {
      "en": "Which time-management items reverse direction?",
      "zh": "哪些时间管理题反向？"
    },
    "answer": {
      "en": "Items 3, 6, 9, 12, 15, 18, 21 and 24 use 6 minus the selected 1–5 value. That aligns the reported behavior direction; it does not create an honesty check.",
      "zh": "第3、6、9、12、15、18、21、24题使用6减1—5所选值，统一报告行为的方向，不构成诚实检查。"
    }
  },
  {
    "question": {
      "en": "Does 3.7 out of 5 mean 74 percent productive?",
      "zh": "3.7／5表示74%的生产力吗？"
    },
    "answer": {
      "en": "No. It is a rounded mean of six keyed ordinal response codes. Dividing by five does not turn it into observed productivity, accuracy or a population percentile.",
      "zh": "不是。它是六条定向等级编码的舍入均分，除以五不会变成实测生产力、准确率或人口百分位。"
    }
  },
  {
    "question": {
      "en": "Must the lowest part be fixed first?",
      "zh": "必须先改善最低的一项吗？"
    },
    "answer": {
      "en": "No. The parts are different topics, without a ranking rule or universal ideal. Relevance, opportunity, control and the cost of changing a practice matter more than selecting a numerical loser.",
      "zh": "不必。各部分是不同议题，没有排名规则或通用理想值。议题是否相关、机会、可控性与改变成本，比选出数字最低者更重要。"
    }
  },
  {
    "question": {
      "en": "Does the research prove these original scores are valid?",
      "zh": "所引研究能证明原创分数有效吗？"
    },
    "answer": {
      "en": "No. A meta-analysis of other measures and university practice guidance do not validate these items or their Chinese wording. This edition needs its own measurement evidence. [3]",
      "zh": "不能。其他测量工具的元分析与大学实践指导，不验证本题目或中文措辞；本版需要自身测量证据。[3]"
    }
  },
  {
    "question": {
      "en": "Do I need another agreement after Start?",
      "zh": "点击开始后需要再同意吗？"
    },
    "answer": {
      "en": "No. Start opens the first question directly. All questions and four full guides are free without an account; temporary saving is a separate voluntary choice.",
      "zh": "不需要。开始直接打开第一题，全部题目与四份完整指南免费，无需账户；临时保存是另行自愿选择。"
    }
  }
];

export const timeManagementLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Aeon, Faber & Panaccio (2021): Does time management work? Meta-analysis",
      "zh": "Aeon等（2021）：时间管理是否有效？元分析"
    },
    "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0245066"
  }
];
