import type { Text } from "@/lib/questionnaires/types";
export const socialBatterySections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Social battery: distinguish demands from feeling restored",
      "zh": "社交电量：分开看负担与恢复感"
    },
    "paragraphs": [
      {
        "en": "This original 20-question reflection separates four kinds of reported experience: effort after interaction, effort around coordination, feeling restored by quiet time alone and feeling restored by easy company. Each part has five descriptions. The four means organise this questionnaire’s answers; they do not establish four independently validated psychological dimensions.",
        "zh": "这份20题原创自我观察，分开呈现四类自报体验：交流之后的费力、协调安排的负担、安静独处的恢复感，以及轻松陪伴的恢复感。每部分五条描述。四项均分用于整理本题本的回答，不确立四个独立验证的心理维度。"
      },
      {
        "en": "Social battery is a metaphor, not a measured store of bodily energy. Enjoying people and wanting a pause can coexist, as can feeling restored by both quiet and familiar company. The result preserves all four readings instead of assigning a remaining charge, a single battery type or an introvert/extrovert verdict.",
        "zh": "“社交电量”是比喻，不是测得的身体能量储备。喜欢相处与想暂停可以同时存在，安静与熟悉陪伴也都可能带来恢复感。结果保留四部分读法，不分配剩余电量、单一电池类型或内外向结论。"
      }
    ]
  },
  {
    "id": "context",
    "title": {
      "en": "Use recent situations, with room for non-experience",
      "zh": "以近期实际情境为参照，保留未经历"
    },
    "paragraphs": [
      {
        "en": "Recall the past two weeks, rather than your ideal social life or a lifetime identity. Choose the frequency with which each description fitted situations you actually experienced. Almost never is a frequency answer; Not experienced / cannot judge means that this item supplies no rated observation.",
        "zh": "回想过去两周，而非理想中的社交生活或一生的身份。选择描述在实际经历过的情境中有多常符合。“几乎没有”是频率回答；“未经历／无法判断”表示该题不提供有效评分观察。"
      },
      {
        "en": "A quiet fortnight, a demanding week and a change of role may expose you to different situations. Keep the number of rated items in view alongside each mean. A lack of opportunities is not evidence of low demands, failed recovery or a need for more social contact. No gathering, conversation or solitude exercise is required to answer.",
        "zh": "安静的两周、忙碌的一周或角色变化，可能带来不同情境机会。阅读均分时，也看有效题数。缺少机会不证明负担低、恢复失败，或需要更多社交。无需为了作答安排聚会、谈话或独处练习。"
      }
    ]
  },
  {
    "id": "demands",
    "title": {
      "en": "Interaction effort and organising effort answer different questions",
      "zh": "交流费力与组织费力，回答不同问题"
    },
    "paragraphs": [
      {
        "en": "Interaction load concerns continuing to listen or talk after contact and wanting a transition before the next activity. Coordination load concerns arranging times and places, switching between groups, following up messages and expressing a break without elaborate explanations. One can feel demanding while the other feels manageable.",
        "zh": "交流负担关注相处后继续听说是否费力，以及进入下一项活动前是否想留过渡。协调负担关注约时间地点、切换群体、跟进消息，以及能否不费力解释就提出休息。一部分可能费力，另一部分仍比较从容。"
      },
      {
        "en": "For example, dinner may be enjoyable while its repeated rescheduling feels burdensome; conversely, arrangements may be simple while several successive conversations take effort. The page cannot determine whether noise, sleep, responsibility or something else caused the experience. It does not rate sociability, empathy or organising competence.",
        "zh": "例如，聚餐可以愉快，反复改期却很费心；反过来，安排可以简单，接连几段交谈仍很费力。页面不能确定原因是噪声、睡眠、责任还是其他因素，也不评价合群程度、同理心或组织能力。"
      }
    ]
  },
  {
    "id": "recovery",
    "title": {
      "en": "Quiet and easy company are separate possibilities",
      "zh": "安静独处与轻松陪伴，是两种独立可能"
    },
    "paragraphs": [
      {
        "en": "Quiet-recovery items ask whether a pause with fewer conversational or reply demands left you more ready to reconnect. Easy-company items ask about familiar, undemanding contact where you need not entertain, explain or stay lively. Neither asks how many friends you have, how many minutes you need alone or how well someone treats you.",
        "zh": "独处恢复感题目关注减少交谈或回复要求的暂停，是否让你更愿意重新联系。陪伴恢复感关注熟悉、低要求的相处，不必负责娱乐、解释或一直活跃。两者都不问朋友数量、所需独处分钟数，或别人对你好不好。"
      },
      {
        "en": "You might want silence after a busy group and welcome a brief familiar check-in later. Both recovery means may therefore be larger, or neither form may have felt helpful in the situations recalled. Do not subtract one from the other, prescribe isolation or judge a relationship from the difference.",
        "zh": "忙碌群体活动后，你可能先想安静，稍后又愿意接受熟人的简短问候。因此两项恢复均分都可以较高，也可能回忆中的两种形式都未带来帮助。不要相减，不据此要求隔离，也不以差值评价一段关系。"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "Four means: reverse wording, valid counts and a worked example",
      "zh": "四项均分：反向表述、有效题数与完整算例"
    },
    "paragraphs": [
      {
        "en": "Frequency choices use values 1–5. Items 9, 10, 11, 12, 17, 18, 19 and 20 are reversed as 6 minus the selected value. Within each five-item part, add the scored values and divide by its number of rated items, rounding to one decimal. All 20 items need a response before any personal means appear; an explicit non-experienced choice is a response, not a score.",
        "zh": "频率选择使用1—5数值；第9、10、11、12、17、18、19、20题按6减所选值反向处理。每个五题部分，将计分后数值相加，除以有效题数，保留一位小数。20题全部回应后才显示个人均分；明确选择未经历，是回应，不是分数。"
      },
      {
        "en": "For interaction-load items 1, 5, 9, 13 and 17, suppose the choices are 2, 4, 1, not experienced and not experienced. The contributions are 2, 4 and 5: sum 11 across three rated items gives 3.7. With fewer than three rated items, the part instead shows insufficient information. Three is this edition’s completeness rule, not a validated clinical threshold.",
        "zh": "以交流负担的第1、5、9、13、17题为例，若依次选2、4、1、未经历、未经历，则计分贡献为2、4、5：有效三题合计11，均分3.7。若有效题不足三道，该部分显示资料不足。三题是本版完整性规则，不是经过验证的临床门槛。"
      }
    ]
  },
  {
    "id": "comparison",
    "title": {
      "en": "Similar means can conceal different experiences and coverage",
      "zh": "相近均分，可能来自不同体验与覆盖"
    },
    "paragraphs": [
      {
        "en": "The same mean can come from different answer patterns or different subsets of rated items. Look at the actual statements and coverage rather than treating 3.0 as a population norm. Frequency labels are ordered categories; the numerical mean is an editorial summary, not proof that every step represents an equal change in fatigue.",
        "zh": "相同均分可以来自不同回答组合，或不同的有效题子集。应看具体陈述和覆盖，不把3.0当成人群常模。频率标签是有顺序的类别；数值均分是编辑汇总，不能证明每一级都代表等量疲惫变化。"
      },
      {
        "en": "A 0.2 gap is not a reliable-change threshold, a meaningful-difference test or evidence that one person manages contact better. Equal means remain equal. Burden and recovery cannot be combined into a net balance, and the page chooses no winner among the four parts.",
        "zh": "相差0.2，不是可靠变化阈值、实质差异检验，或某个人更会安排相处的证据。相同均分原样保留。负担与恢复不能合成净余额，页面也不在四部分中选出胜者。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "What sociability-and-fatigue research can support",
      "zh": "交流行为与疲惫研究，能支持什么"
    },
    "paragraphs": [
      {
        "en": "Experience-sampling studies have examined sociable behaviour and tiredness at different times in everyday life. The cited 2017 study reported positive mood alongside sociable behaviour and fatigue later; the 2020 replication also reported an association with later tiredness. These observations make timing worth discussing, without proving a physical battery, a universal cause or a fixed recovery interval. [1][2]",
        "zh": "经验取样研究观察过日常生活中不同时点的交流行为与疲惫。所引2017年研究报告交流行为伴随当时的积极心情，也与稍后的疲惫相关；2020年的重复研究同样报告稍后疲惫的关联。这些观察提示讨论时间关系有意义，但不证明身体电池、通用原因或固定恢复间隔。[1][2]"
      },
      {
        "en": "These studies did not validate FermatMind’s 20 items, four-part structure, reverse keys or three-item coverage rule. No reliability estimates, norms, change criteria or diagnostic accuracy have been established for this form. Their observed time lags are research observations, not instructions to rest for that duration or a prediction for your next event.",
        "zh": "这些研究没有验证费马20题、四部分结构、反向位置或三题覆盖规则。本题本尚未建立信度估计、常模、变化标准或诊断准确性。研究观察到的时间间隔，不是按该时长休息的指示，也不预测你下一次活动的感受。"
      }
    ]
  },
  {
    "id": "use",
    "title": {
      "en": "Use one concrete observation to communicate a preference",
      "zh": "用一个具体观察，表达相处偏好"
    },
    "paragraphs": [
      {
        "en": "Choose a situation that already happened and ask what felt demanding or helpful: the duration, the organising role, the need to reply or the freedom to be quiet. A sentence such as “I would like to meet, and I would prefer to finish at eight” describes a preference without blaming someone or claiming a fixed type. Suggestions in the guides are optional examples, not recovery prescriptions.",
        "zh": "可从已经发生的一次情境出发，辨认费力或有帮助的是时长、组织角色、回复要求，还是可以安静的空间。“我想见面，也希望这次到八点结束”，就能表达偏好，无需责怪别人或认定固定类型。指南中的建议是可选例子，不是恢复处方。"
      },
      {
        "en": "Start opens the first question directly. The calculation runs in your browser. Saving is optional and applies only to a 24-hour tab draft, which is removed on completion, exit-and-clear or retake; it is separate from starting. The full public guides require no answers, and copying shares public links without answers or personal means.",
        "zh": "点击开始直接进入第一题，计算在浏览器进行。保存为自愿选择，仅针对24小时标签页草稿，完成、退出清除或重做时删除，与开始作答分开。完整公开指南无需回答；复制分享公开链接，不含答案或个人均分。"
      }
    ]
  }
];
export const socialBatteryFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Can I enjoy company and still report high interaction load?",
      "zh": "喜欢相处，也能报告较高交流负担吗？"
    },
    "answer": {
      "en": "Yes. Enjoyment and the effort of continuing are different experiences. Review the occasion rather than deciding that one answer invalidates the other.",
      "zh": "可以。愉快与继续投入的费力，是不同体验。应回看具体场景，不因其中一种回答而否定另一种。"
    }
  },
  {
    "question": {
      "en": "Are quiet recovery and easy company opposite ends of one scale?",
      "zh": "独处恢复与陪伴恢复，是同一轴的两端吗？"
    },
    "answer": {
      "en": "No. Both may be helpful, neither may have helped, or the situations may differ. They are separate summaries without subtraction or a combined charge level.",
      "zh": "不是。两者都可能有帮助，也可能都未带来帮助，或对应不同情境。它们分别汇总，不相减，也不合成电量。"
    }
  },
  {
    "question": {
      "en": "Why does choosing 1 not always contribute 1?",
      "zh": "为什么选1不一定计1？"
    },
    "answer": {
      "en": "Eight statements run in the opposite direction. Their contributions use 6 minus the selected frequency. Answer their wording directly; the page handles reversal.",
      "zh": "八条陈述表述方向相反，贡献按6减所选频率处理。按原句直接作答即可，页面负责反向计算。"
    }
  },
  {
    "question": {
      "en": "Does an all-unexperienced response mean an empty battery?",
      "zh": "全部未经历，代表电量耗尽吗？"
    },
    "answer": {
      "en": "No. It is a complete response record with no rated observations. All four parts show insufficient information, while the complete general guides remain open.",
      "zh": "不是。这是已全部回应、但没有有效评分观察的记录。四部分均显示资料不足，完整通用指南仍可阅读。"
    }
  },
  {
    "question": {
      "en": "Can I compare a three-item mean with a five-item mean?",
      "zh": "三题均分与五题均分能直接比较吗？"
    },
    "answer": {
      "en": "Check which statements were rated first. Equal ranges do not remove differences in coverage, opportunity or context. A numerical gap alone establishes no personal difference.",
      "zh": "先核对哪些陈述有有效评分。范围相同，不能消除覆盖、机会或情境差异；仅凭数值差不能确立个人差异。"
    }
  },
  {
    "question": {
      "en": "Does this distinguish social anxiety, burnout or a health condition?",
      "zh": "本页能区分社交焦虑、耗竭或健康状况吗？"
    },
    "answer": {
      "en": "No. Reported effort or relief cannot establish or exclude a condition. Concerns that persist or affect daily life can be discussed with a qualified professional independently of these means.",
      "zh": "不能。自报费力或轻松，不能确立或排除健康状况。若顾虑持续或影响日常生活，可独立于这些均分，与合格专业人员讨论。"
    }
  },
  {
    "question": {
      "en": "Does a cited two-to-three-hour association tell me how long to rest?",
      "zh": "研究中的两三小时关联，告诉我该休息多久吗？"
    },
    "answer": {
      "en": "No. An observed lag between behaviour and tiredness is not a rest dose, an individual timetable or validation of this questionnaire.",
      "zh": "不告诉。行为与疲惫之间观察到的时间间隔，不是休息剂量、个人时间表，也不验证本问卷。"
    }
  },
  {
    "question": {
      "en": "Must I enable saving before I can answer?",
      "zh": "作答前必须开启保存吗？"
    },
    "answer": {
      "en": "No. Start opens the first question without an agreement or saving requirement. Optional tab saving can be chosen later; without it, a refresh loses the current answers.",
      "zh": "不必。开始直接进入第一题，无需同意或开启保存。之后可自愿选择标签页保存；不开启时，刷新会丢失当前回答。"
    }
  }
];
export const socialBatterySummaries: Record<string, Text> = {
  "interaction-load": {
    "en": "Read effort after contact and the wish for a transition, separately from enjoyment, social skill or remaining bodily energy.",
    "zh": "阅读交流后费力与过渡需要，分开理解愉快、社交技能与身体剩余能量。"
  },
  "coordination-load": {
    "en": "Distinguish planning, switching groups and follow-up demands from the experience of the conversation itself.",
    "zh": "区分计划、群体切换与跟进要求，以及交谈本身的体验。"
  },
  "quiet-recovery": {
    "en": "Explore whether quieter solo situations felt restoring, without prescribing isolation or a required recovery time.",
    "zh": "观察较安静独处是否带来恢复感，不要求隔离，也不规定恢复时长。"
  },
  "easy-company": {
    "en": "Read undemanding familiar company as a possible source of relief, without judging popularity or relationship quality.",
    "zh": "阅读低要求的熟悉陪伴是否带来轻松，不评价人缘或关系质量。"
  }
};
