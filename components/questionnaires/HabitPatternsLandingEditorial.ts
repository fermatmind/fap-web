import type { Questionnaire } from "@/lib/questionnaires/types";

export const habitPatternsLandingSections: Questionnaire["guide"] = [
  {
    "id": "habit-context-scope",
    "title": {
      "en": "What the Habit Patterns Test records",
      "zh": "习惯模式测试记录什么"
    },
    "paragraphs": [
      {
        "en": "Think of one ordinary, nonurgent everyday habit over the past 30 days. The 20 original statements cover cues and urges, automatic starts, displaced plans, continuing after inconvenience, and everyday effects. Each topic contains four statements. These are five ways of organising your recollections, not five established clinical factors or steps in a causal chain. You never need to enter the habit’s name.",
        "zh": "围绕过去30天同一个普通、非紧急的日常习惯作答。20条原创陈述分为触发与冲动、行为自动化、安排被挤占、发现不便后仍继续，以及日常影响五个主题，每组四题。这是整理回忆的五种角度，不是五项已确立的临床因素，也不是一条因果链。你无需填写习惯名称。"
      },
      {
        "en": "A familiar activity can be deliberate, automatic, enjoyable, inconvenient or several of these in different situations. The form does not decide whether it must change. Choose how each statement fits your experience; do not answer for your character, an ideal day or someone else. All five full public guides remain available whether you complete the form, skip statements or simply read.",
        "zh": "熟悉的活动在不同情境下，可以出于主动决定、自动开始、令人愉快，也可能带来不便，这些情况可以并存。表单不决定它是否必须改变。按每条陈述与实际经历的符合程度作答，不评价人格，不以理想一天或他人经历代答。无论完成、跳题或只阅读，都可查看五篇完整公开指南。"
      }
    ]
  },
  {
    "id": "habit-context-automaticity",
    "title": {
      "en": "Automaticity, frequency and routines are different questions",
      "zh": "自动化、频率与惯例，回答不同问题"
    },
    "paragraphs": [
      {
        "en": "Habit research often examines learned links between recurring contexts and responses. Gardner and colleagues separated automaticity indicators from the broader Self-Report Habit Index, developing the four-item SRBAI. Their work used content judgments, reanalysed datasets and behaviour-specific studies; it provides a reason to distinguish automatic starting from how often an action occurs. [1]",
        "zh": "习惯研究常考察反复出现的情境与反应之间习得的联系。Gardner等人从较广的自报习惯指数中区分自动化指标，发展出四题SRBAI；研究使用内容判断、既有数据再分析及具体行为研究。这为区分自动开始与行动发生频率提供了研究背景。[1]"
      },
      {
        "en": "For example, deliberately opening a reading app every evening is frequent, while opening it before noticing the decision describes a different feature. Neither observation alone establishes harm. FermatMind’s statements are its own bank, not the SRBAI, SRHI, COHS or Daily Habit Scale. A similar topic or four-item group cannot transfer another questionnaire’s reliability, norms or validity to these answers.",
        "zh": "例如，每晚主动打开阅读应用，是频繁发生；还没注意到决定就已经打开，描述的则是另一特征。单凭其中一种观察，都不能确立危害。费马使用自有题本，不是SRBAI、SRHI、COHS或Daily Habit Scale。主题相近或同为四题，不能把其他问卷的信度、常模与效度转移到本页。"
      }
    ]
  },
  {
    "id": "habit-context-five",
    "title": {
      "en": "Read five topics alongside one specific event",
      "zh": "以同一件具体事件，区分五个主题"
    },
    "paragraphs": [
      {
        "en": "Cues and urges concern what came before starting; automatic starts concern awareness and explicit decisions. Displaced plans concern changes to intended time or activities. Continuing after inconvenience concerns what happened after noticing a cost or considering an adjustment. Everyday effects concern reported changes to rest, tasks, contact and usual arrangements. The same event may contribute to several topics.",
        "zh": "触发与冲动关注开始之前的线索与想做的感觉；行为自动化关注意识和明确决定。安排被挤占关注原定时间或活动的变化；发现不便后仍继续关注注意到代价或考虑调整之后发生什么；日常影响关注休息、任务、联系和通常安排的自报变化。同一件事可能进入几个主题。"
      },
      {
        "en": "Suppose browsing a hobby collection delays a planned call. Ask what preceded browsing, when you noticed starting, what the original arrangement was and whether the call had already been rescheduled. An agreed change is a useful counterexample to an unwanted delay. These original examples help describe events; they do not establish the cause, count separate symptoms or show which mean is the “main problem”.",
        "zh": "假设浏览兴趣收藏后，一通原定电话推迟了。可分别回看浏览前发生什么、何时注意到开始、原来怎样安排，以及电话是否已经商量改期。双方同意的改期，是“不想要的延误”的有用反例。这些原创例子帮助描述事件，不确定原因，不累计独立症状，也不以最大均分判定“主要问题”。"
      }
    ]
  },
  {
    "id": "habit-context-arithmetic",
    "title": {
      "en": "How sums, means and the three-answer rule work",
      "zh": "原始和、均分与至少三题规则，怎样复算"
    },
    "paragraphs": [
      {
        "en": "Numeric choices run from 1 to 5; 3 means uncertain or depends and is still included. In each four-item group, add only numeric responses and divide by their number. At least three numeric responses are required to display a sum, mean and personal explanation. For 2, 4, 5 and one skip, the sum is 11 and the mean is 11 ÷ 3 = 3.6667. With two numeric answers, that group remains insufficient.",
        "zh": "数字选项为1—5；3表示不确定或视情况，仍参与计算。每组四题，只把数字回答相加，再除以数字回答数。至少三个数字回答，才显示该组原始和、均分和个人解释。例如2、4、5加一次跳过，原始和11，均分11÷3＝3.6667；若只有两个数字回答，该组保持信息不足。"
      },
      {
        "en": "A sum based on three answers ranges from 3 to 15; with four answers it ranges from 4 to 20. Always read the denominator and skipped count. A mean of 3.0000 can come from four 3s, or from 2, 3, 4 and a skip, with different content and coverage. Four decimal places describe rounding, not psychological precision, severity, a percentage of affected days or a population percentile.",
        "zh": "三个数字回答的原始和为3—15，四个则为4—20，需要同时阅读分母与跳过数。四个3，或2、3、4加一次跳过，都得到3.0000，却包含不同内容与覆盖。四位小数只说明取舍位数，不代表心理测量精度、严重程度、受影响天数比例或人群百分位。"
      }
    ]
  },
  {
    "id": "habit-context-skips",
    "title": {
      "en": "Skipping, uncertainty and unfinished answers remain distinct",
      "zh": "跳过、不确定与未完成，分别保留"
    },
    "paragraphs": [
      {
        "en": "Use the explicit prefer-not-to-answer option whenever you do not want to supply a numeric judgment; no reason is requested. It is neither zero nor a guessed middle answer. All 20 statements need an explicit choice to finish, but all 20 choices may be skips. With no group reaching three numeric answers, the personal result gives scope and privacy information without inferring a pattern.",
        "zh": "不愿提供数值判断时，可明确选择不想回答，无需解释原因。跳过既不是0，也不会被猜成中间选项。完成需要20题都有明确选择，但20次选择都可以是跳过。若没有任何组达到三个数字回答，个人结果只说明适用范围与隐私，不推断习惯模式。"
      },
      {
        "en": "If one group has too few numeric answers, the other eligible groups still appear. A skipped item does not reveal avoidance, resistance or an underlying concern. The five general public guides are separate from personal interpretations and can still be read in full. You do not have to retry to earn access to information or to make your record look complete.",
        "zh": "某组数字回答不足时，其他满足条件的组仍显示。跳题不揭示回避、抗拒或潜在困扰。五篇一般性公开指南与个人解释不同，仍可完整阅读。你无需重新作答以获得阅读资格，也不必为了记录看起来完整而补答。"
      }
    ]
  },
  {
    "id": "habit-context-evidence",
    "title": {
      "en": "What would establish measurement quality for this bank?",
      "zh": "怎样建立本站题本的测量证据"
    },
    "paragraphs": [
      {
        "en": "Validation concerns an exact instrument, language, sample and use. A 2025 study of German SRBAI assessed internal consistency, retest reliability and several kinds of validity in physical-activity contexts, using two young-adult convenience samples of 267 and 334. That work illustrates the evidence needed for a particular version; it does not validate arbitrary habit questions in every activity or language. [3]",
        "zh": "验证针对具体工具、语言、样本与用途。2025年的德语SRBAI研究以267人与334人的两个年轻成人便利样本，在身体活动情境考察内部一致性、重测信度和多种效度。这说明具体版本需要怎样的证据，不验证任何活动或语言中的任意习惯题目。[3]"
      },
      {
        "en": "This original five-group bank and its English working translation have not established that evidence. The minimum of three answers is a declared calculation rule, not a scientifically validated missing-data threshold. There are no supported risk cutoffs, cross-language score conversions or individual change thresholds. Transparent arithmetic is useful, but it is not a substitute for measurement research.",
        "zh": "这份原创五组题本及英文工作译文尚未建立上述证据。至少三题是明确的计算规则，不是经过科学验证的缺失数据阈值。本页没有经过支持的风险界值、跨语言分数换算或个体变化阈值。算术透明有用，但不能替代测量研究。"
      }
    ]
  },
  {
    "id": "habit-context-time",
    "title": {
      "en": "Why there is no universal 21-day habit deadline",
      "zh": "为什么不能给习惯设统一21天期限"
    },
    "paragraphs": [
      {
        "en": "Lally and colleagues followed volunteers repeating a chosen activity in a recurring context for 12 weeks and modelled changes in self-reported automaticity. The estimated time to approach an individual plateau varied substantially; this was neither a universal deadline nor an experiment showing how every unwanted habit should be changed. A modelled estimate can also extend beyond the observation period. [2]",
        "zh": "Lally等人跟踪志愿者在重复情境下进行自选活动12周，并对自报自动化变化建模。接近个人平台期的估计时间差异很大；它既不是统一期限，也不是证明所有不想要的习惯应该怎样改变的干预实验。模型估计也可能超出实际观察期。[2]"
      },
      {
        "en": "This page’s 30-day reference window is a recall instruction, not a formation time or treatment duration. A second attempt can change because the reference activity, circumstances, recalled examples or skipped items changed. Compare those details before interpreting numbers. The form cannot certify that a habit has formed, disappeared or changed by a particular amount.",
        "zh": "本页回看30天，是回忆范围，不是习惯形成时间或治疗时长。第二次结果可能因参照活动、情境、回忆例子或跳过题目变化而不同。应先核对这些细节，再解释数字。表单不能认证某个习惯已经形成、消失或改变了多少。"
      }
    ]
  },
  {
    "id": "habit-context-use",
    "title": {
      "en": "A private observation you can choose to keep",
      "zh": "可以自愿保留的一次私人观察"
    },
    "paragraphs": [
      {
        "en": "If useful, choose one low-risk event and privately note what happened immediately before it, what you intended and what actually followed. Include an alternative explanation and a counterexample. You may keep the current arrangement, try a small practical adjustment or stop observing. This is an optional descriptive exercise, not a tested intervention or a requirement to eliminate an activity.",
        "zh": "如有帮助，可选一次低风险日常事件，私下记下紧接着的前因、原本打算与实际后续，同时保留另一种解释和反例。你可以维持安排、尝试小幅实际调整，或停止观察。这是自愿的描述练习，不是经过验证的干预，也不要求消除某项活动。"
      },
      {
        "en": "Do not apply this form to substances, prescriptions, withdrawal or dangerous behaviour. Persistent real-world difficulty can merit qualified support regardless of any mean. The site asks for no habit name or narrative and retains answers only in current-page memory; reload, language change or leaving clears them. There is no personal-result sharing or activity analytics on this test.",
        "zh": "不要将表单用于物质使用、处方、戒断或危险行为。现实中的持续困难是否需要合适的专业支持，不取决于某个均分。网站不询问习惯名称或经历叙述，回答只保留在当前页面内存，刷新、换语或离开即清除。本测试不提供个人结果分享，也不接动作统计。"
      }
    ]
  }
];

export const habitPatternsLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is doing something often the same as doing it automatically?",
      "zh": "经常做一件事，就是自动化吗？"
    },
    "answer": {
      "en": "No. Repetition and automatic starting are different observations. A planned daily activity may remain deliberate; an unnoticed start need not occur often. This form records how statements fit, not an observed count of either.",
      "zh": "不是。重复发生与自动开始是不同观察。每天安排好的活动仍可能出于主动决定，未注意到的启动也未必常见。表单记录陈述符合程度，不直接观测这两类行为的次数。"
    }
  },
  {
    "question": {
      "en": "Does a larger mean identify the habit I must change?",
      "zh": "均分较大，就能确定必须改变的习惯吗？"
    },
    "answer": {
      "en": "No habit name or comparison between habits is collected. A mean summarises the numeric answers in one topic. Read the event, the particular statement and whether the situation is unwanted; there is no problem ranking or mandatory action.",
      "zh": "本站不收习惯名称，也不比较不同习惯。均分只概括某主题内的数字回答。需要回看事件、具体陈述以及现实情境是否令人困扰；这里没有问题排名或必须采取的行动。"
    }
  },
  {
    "question": {
      "en": "Why can three answers show a result but two cannot?",
      "zh": "为什么三个数字回答能显示，两个不能？"
    },
    "answer": {
      "en": "That is this version’s explicit minimum-coverage rule. It is not an empirically established threshold. Three or four numeric responses allow a mean; fewer withhold that part’s sum, mean and personal interpretation. Skips are never filled in.",
      "zh": "这是当前版本明确的最低覆盖规则，不是实证确立的阈值。三个或四个数字回答可计算均分，更少则不显示该组原始和、均分与个人解释。跳过不会被补成答案。"
    }
  },
  {
    "question": {
      "en": "Can equal means describe different answers?",
      "zh": "相同均分可以来自不同回答吗？"
    },
    "answer": {
      "en": "Yes. Four 3s give 12 ÷ 4 = 3.0000; 2, 3, 4 and a skip give 9 ÷ 3 = 3.0000. The first contains uncertainty on every statement, while the second contains different judgments and one unscored item.",
      "zh": "可以。四个3得到12÷4＝3.0000；2、3、4加一次跳过得到9÷3＝3.0000。前者每题都不确定，后者包含不同判断和一题不计分，不能只看相同数值。"
    }
  },
  {
    "question": {
      "en": "Are the five topics stages or separate diagnoses?",
      "zh": "五个主题是发展阶段或不同诊断吗？"
    },
    "answer": {
      "en": "Neither. They organise questions about beginnings, decisions, arrangements and reported effects. One event can appear in several groups. The bank has not established five independent factors or a sequence in which one causes another.",
      "zh": "都不是。它们整理开始、决定、安排与自报影响等问题，同一事件可以出现在几组。本题本尚未确立五个统计独立的因素，也未确立前后相互导致的发展顺序。"
    }
  },
  {
    "question": {
      "en": "Does 30 days mean a habit should be fixed within a month?",
      "zh": "回看30天，意味着应该一个月内改变习惯吗？"
    },
    "answer": {
      "en": "No. It is a reference window for answers. Habit formation research does not establish one deadline for every person and behaviour, and this reflection form supplies no change programme or completion target. [2]",
      "zh": "不是。这是回答的参照范围。习惯形成研究没有为所有人和行为建立统一期限，本反思表单也不提供改变计划或达成目标。[2]"
    }
  },
  {
    "question": {
      "en": "Do English and Chinese means have proven equivalence?",
      "zh": "英文与中文均分已证明可以直接比较吗？"
    },
    "answer": {
      "en": "No. English is a working translation of the original Chinese statements. Shared scoring arithmetic does not establish measurement equivalence across languages. Read in the language you understand and avoid ranking people or languages by these means.",
      "zh": "没有。英文是原创中文陈述的工作译文。共同算术规则不建立跨语言测量等值性。使用自己理解的语言阅读，不以均分给不同人或语言排序。"
    }
  },
  {
    "question": {
      "en": "Is this a self-control, productivity or habit-strength test?",
      "zh": "这是自控力、生产力或习惯强度测试吗？"
    },
    "answer": {
      "en": "It is a five-topic descriptive record about one everyday habit, not a calibrated measure of those constructs. It has no overall score, percentiles, diagnosis or recommended risk band. The five full guides can be read without generating a personal record.",
      "zh": "它是围绕一个日常习惯的五主题描述记录，不是这些构念的校准测量。没有总分、百分位、诊断或风险档次；无需生成个人记录即可阅读五篇完整指南。"
    }
  }
];

export const habitPatternsLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Gardner et al. (2012): automaticity and the SRBAI",
      "zh": "Gardner等（2012）：自动化与SRBAI研究"
    },
    "url": "https://link.springer.com/article/10.1186/1479-5868-9-102"
  },
  {
    "title": {
      "en": "Lally et al. (2010): modelling habit formation over time",
      "zh": "Lally等（2010）：习惯形成的时间模型"
    },
    "url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.674"
  },
  {
    "title": {
      "en": "Ljubic et al. (online 2025): German SRBAI in physical activity",
      "zh": "Ljubic等（2025在线发表）：身体活动中的德语SRBAI"
    },
    "url": "https://link.springer.com/article/10.1007/s12662-025-01050-z"
  }
];
