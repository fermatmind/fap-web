import type { Questionnaire } from "@/lib/questionnaires/types";
export const datingOutlookLandingSections: Questionnaire["guide"] = [
  {
    "id": "dating-outlook-purpose",
    "title": {
      "en": "Dating outlook: four beliefs about connection",
      "zh": "恋爱心态测试测什么：关于联结的四类信念"
    },
    "paragraphs": [
      {
        "en": "The sixteen original statements explore openness to connection, belief in learnable dating skills, guarded expectations and belief in largely fixed conditions. These are four separate summaries of your current agreement. They describe how you interpret possibilities and participation, rather than how much experience you have or how other people see you.",
        "zh": "十六条原创陈述分别探索对联结可能性的开放、相信交往方式可以学习、保留期待，以及认为交往条件多已固定。四部分独立概括你当前的认同程度，关注怎样理解可能性与自身参与，不统计恋爱经验，也不代表别人怎样看待你。"
      },
      {
        "en": "You can believe listening is learnable while also thinking timing matters a great deal. You can remain open to a future connection while holding back expectations in a particular interaction. Such combinations stay visible: the questionnaire does not subtract one belief from another, choose a winning outlook or divide people into four identities.",
        "zh": "你可以相信倾听能够学习，同时认为时机影响很大；也可以对未来联结保持开放，同时在某次互动中保留期待。这些组合会分别保留：问卷不把一种信念从另一种中扣除，不选出胜出的心态，也不把人分成四种身份。"
      }
    ]
  },
  {
    "id": "dating-outlook-answering",
    "title": {
      "en": "Answer about current beliefs, not an ideal dating persona",
      "zh": "怎样作答：回答当下看法，而非理想恋爱形象"
    },
    "paragraphs": [
      {
        "en": "Adults can answer regardless of gender, relationship status or dating history. Consider your own current view of each statement. There is no instruction to average the past three months, describe a partner or imagine what a socially confident person would say. An unfamiliar experience need not become a guessed opinion.",
        "zh": "成年人可以作答，不限性别、关系状态或恋爱经历。逐条考虑自己目前怎样看待这句话；本题本没有要求平均过去三个月、描述伴侣，或想象社交自信的人会怎样回答。不熟悉的经历不必转化为猜测的观点。"
      },
      {
        "en": "The five numeric choices run from strongly disagree to strongly agree. The middle choice, 3, means neither agree nor disagree. Unsure, not suitable or prefer not to answer is unscored. Neutrality is a recorded position; uncertainty or withholding an answer leaves the numeric evidence missing. All sixteen prompts need a response, which may be unscored.",
        "zh": "五个数字选项从强烈不同意到强烈同意；中间值3表示既不同意也不反对。不确定、不适用或不愿回答可选未评分。中立是已记录的立场；不确定或保留回答则留下数字资料缺失。十六题均需选择一个回应，其中可以包含未评分。"
      }
    ]
  },
  {
    "id": "dating-outlook-possibility-guarded",
    "title": {
      "en": "Openness and guarded expectations answer different questions",
      "zh": "开放与保留期待：两者回答不同问题"
    },
    "paragraphs": [
      {
        "en": "Openness concerns leaving room for future connection after a disappointing or non-mutual experience and imagining more than one possible route. Agreement does not establish optimism in every area of life, emotional readiness or an ability to find a partner. Disagreement does not prove that future connection is impossible.",
        "zh": "开放关注一次失望或兴趣不相互的经历之后，是否仍为未来联结留下可能，以及是否想到不止一种途径。认同不代表在所有生活领域乐观、已经准备好恋爱或有能力找到伴侣；不认同也不能证明未来联结不可能发生。"
      },
      {
        "en": "Guarded expectations concern keeping hopes, emotional investment or imagined futures in reserve. This differs from rejecting all possibilities. The answers do not reveal whether caution fits the setting, whether another person is trustworthy or whether you have an avoidant attachment style. Read the statements alongside the circumstances that made them feel applicable.",
        "zh": "保留期待关注暂时收住希望、情感投入或对共同未来的想象，与否定全部可能性不同。回答不能确定谨慎是否符合情境、另一人是否可信，或你是否属于回避型依恋。阅读时可以回看哪些实际处境让这些陈述显得适用。"
      }
    ]
  },
  {
    "id": "dating-outlook-practice-conditions",
    "title": {
      "en": "Learnable participation and perceived constraints can coexist",
      "zh": "可学习的参与方式与所感限制可以并存"
    },
    "paragraphs": [
      {
        "en": "The practice theme asks whether listening, communicating and reflecting on awkward interactions seem learnable. Believing that something can improve is different from demonstrating that skill or showing that a particular practice works. Useful effort concerns your own participation; it never creates entitlement to another person’s attention, affection, reply or continued contact.",
        "zh": "学习主题询问你是否认为倾听、沟通及回看尴尬互动能够学习。相信可以改善，区别于实际展示技能，也不证明某项练习有效。有用的努力关注自己的参与方式，从不产生获得另一人注意、感情、回应或继续联系的权利。"
      },
      {
        "en": "Fixed conditions concern the weight you give to appearance, first impressions, timing and circumstances relative to later choices or learning. This is a report of that belief, not a test of whether those conditions really determine outcomes. The practice and fixed-conditions means are not opposite ends of one scale and are not converted into a single growth score.",
        "zh": "固定条件关注你怎样权衡外貌、第一印象、时机与处境，相对于后续选择或学习的影响。这记录的是你对这种说法的认同，不检验这些条件是否真的决定结果。学习与固定条件的均值不是同一条轴的两端，也不换算成一个成长分数。"
      }
    ]
  },
  {
    "id": "dating-outlook-arithmetic",
    "title": {
      "en": "How the four raw means are calculated",
      "zh": "四项原始均值怎样计算：缺答、算例与覆盖"
    },
    "paragraphs": [
      {
        "en": "Each theme contains four equally weighted statements, scored directly from 1 to 5 with no reverse-keyed items. At least three numeric responses are required for its mean. For example, 1, 2, 5 and an unscored response give a sum of 8, three rated items and 8 ÷ 3 = 2.7 after rounding to one decimal. Two ratings of 5 still give insufficient information, not a mean of 5.0.",
        "zh": "每个主题有四条等权陈述，直接按1至5计分，没有反向题。每部分至少需要三条数字回应才显示均值。例如1、2、5及一条未评分，原始和为8，已评分三题，8÷3四舍五入到一位小数为2.7；只有两条5分仍显示资料不足，而非5.0。"
      },
      {
        "en": "A mean can hide different answers: 1, 3, 5 and unscored average 3.0, as do four ratings of 3, but the first set contains disagreement, neutrality and agreement with less coverage. Read the rated count and individual statements as well as the mean. The three-item threshold is this edition’s reporting rule, not an empirically established accuracy guarantee.",
        "zh": "均值可能概括不同回答：1、3、5及未评分的均值为3.0，四条3分也为3.0；前者同时包含反对、中立与认同，且覆盖更少。应一起阅读已评分题数、具体陈述及均值。三题门槛是本版的报告规则，不是经实证建立的准确性保证。"
      }
    ]
  },
  {
    "id": "dating-outlook-reading",
    "title": {
      "en": "Read all four guides without ranking yourself",
      "zh": "阅读四篇完整指南：保留差异，不给自己排名"
    },
    "paragraphs": [
      {
        "en": "Higher means indicate stronger average agreement with that theme’s particular wording. They do not indicate a truer belief, a better person or a greater chance of a relationship. The displayed bar uses a position on the 1–5 scale; its length is not a probability or population percentile. A mean of 1 remains a valid response summary even when the bar is empty.",
        "zh": "均值较高表示平均更认同该主题的具体措辞，不代表观点更真实、人更好，或建立关系的概率更高。展示条使用1至5尺度上的位置；长度不是概率或人群百分位。均值1仍是有效回答摘要，即使展示条为空。"
      },
      {
        "en": "All four full guides remain available when means are equal, mixed or unavailable. There is no overall total or primary type. If you repeat the questionnaire, compare the statements, missing responses and circumstances first. Without this edition’s test–retest and measurement-error evidence, a changed number alone cannot quantify a lasting change in outlook.",
        "zh": "均值相同、不同或无法计算时，四篇完整指南都保留开放，不产生总分或主要类型。重测时先比较具体陈述、未评分项与当时处境；缺少本版重测及测量误差证据，仅凭数字变化不能量化心态发生了多大持久改变。"
      }
    ]
  },
  {
    "id": "dating-outlook-research",
    "title": {
      "en": "Relationship-belief research and this original questionnaire",
      "zh": "关系信念研究与本站原创题本：分别看待证据"
    },
    "paragraphs": [
      {
        "en": "The University of Houston describes destiny and growth beliefs as perspectives in close-relationship research. [1] Knee and colleagues’ 2004 study examined conflict and commitment using a ten-day diary study and a laboratory couple discussion study. [2] Those designs address research questions about relationships; they do not validate these sixteen statements or predict an individual reader’s dating future.",
        "zh": "休斯敦大学将命定与成长信念列为亲近关系研究的视角。[1] Knee等人2004年的研究通过十天日记及实验室伴侣讨论，考察冲突与承诺之间的关系。[2] 这些设计回答关系研究问题，并不验证本页十六条陈述，也不预测某位读者未来的恋爱结果。"
      },
      {
        "en": "This questionnaire uses four original themes, not the published destiny/growth scales or the Romantic Beliefs Scale. Reliability, factor structure, validity, norms and English–Chinese measurement equivalence have not been established for this edition. Naming related research makes the conceptual distinction traceable; it does not transfer another instrument’s coefficients, cut-offs or professional status to this one.",
        "zh": "本问卷采用四个原创主题，不施测已发表的命定／成长量表或浪漫信念量表。本版尚未建立信度、因素结构、效度、常模及英中测量等值。列出相关研究是为了让概念区别可追溯，不把其他工具的系数、分界或专业地位转移给本站。"
      }
    ]
  },
  {
    "id": "dating-outlook-application",
    "title": {
      "en": "A private reflection with an optional next step",
      "zh": "私人反思与可选下一步：把信念变成可核对的问题"
    },
    "paragraphs": [
      {
        "en": "Choose one statement that fits and one that fits poorly. Write a private example and an alternative explanation: did a difficult interaction change your belief about every future possibility, or only that situation? If you want to practise listening, you can rehearse summarising a fictional conversation without contacting anyone. The result does not require dating, disclosure, persistence after refusal or a particular relationship decision.",
        "zh": "可以选一条符合与一条不符合的陈述，私下写出具体例子及另一种解释：一次困难互动改变的是你对全部未来可能性的看法，还是只针对那次情境？想练习倾听时，可以用虚构对话练习概括，无需联系任何人。结果不要求恋爱、披露、在被拒绝后继续尝试，或作出特定关系决定。"
      },
      {
        "en": "The complete questions and guides are free without registration. Start opens the first prompt directly. Optional progress is stored only in this browser tab for up to twenty-four hours and clears on completion, clearing or retake. Public sharing contains the title and entry link, not your answers or means. You can also read every guide without answering.",
        "zh": "完整题目与指南免费，无需注册；点击开始直接进入第一题。可选进度仅在当前浏览器标签页最多保留二十四小时，完成、清除或重测后删除。公开分享包含标题及入口，不包含答案或均值；也可以不作答，直接阅读全部指南。"
      }
    ]
  }
];
export const datingOutlookLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What does this dating outlook test measure?",
      "zh": "恋爱心态测试测什么？"
    },
    "answer": {
      "en": "Current agreement with sixteen original statements in four separate themes: openness to connection, learnable participation, guarded expectations and largely fixed conditions. It does not measure dating skill, experience, desirability or a chance of finding a partner.",
      "zh": "记录对十六条原创陈述的当前认同程度，分为联结开放、参与方式可学习、保留期待及条件多已固定四个独立主题，不测恋爱技能、经验、吸引力或找到伴侣的概率。"
    }
  },
  {
    "question": {
      "en": "Can I answer if I am single or have little dating experience?",
      "zh": "单身或恋爱经历很少，可以作答吗？"
    },
    "answer": {
      "en": "Adults of any gender or relationship status can reflect on their own current beliefs. Choose unscored when unsure or when a statement is unsuitable. Experience is not an entry requirement, and you can read all four guides without completing the questionnaire.",
      "zh": "任何性别或关系状态的成年人均可反思自己的当前信念。不确定或题目不合适时可选未评分；经历不是准入条件，也可不完成问卷而阅读四篇指南。"
    }
  },
  {
    "question": {
      "en": "Is 3 the same as an uncertain or missing response?",
      "zh": "3分与不确定、未评分相同吗？"
    },
    "answer": {
      "en": "No. Here 3 means neither agree nor disagree. Uncertain, unsuitable or declined answers are excluded from the numeric sum and denominator. Each theme needs at least three numeric ratings from its four statements.",
      "zh": "不同。本页3表示既不同意也不反对；不确定、不适用或不愿回答不进入数字和与分母。每主题四条中至少三条数字评分才显示均值。"
    }
  },
  {
    "question": {
      "en": "How can I check a displayed mean?",
      "zh": "怎样复算展示均值？"
    },
    "answer": {
      "en": "Add the numeric ratings for that theme and divide by their count, then round to one decimal. Ratings 1, 2 and 5 total 8 and give 2.7; a fourth unscored response adds nothing. Two numeric ratings do not meet the reporting rule, however high they are.",
      "zh": "将该主题数字评分相加后除以数字题数，再保留一位小数。1、2、5合计8，均值2.7；第四条未评分不计入。只有两条数字时，无论多高均不满足报告规则。"
    }
  },
  {
    "question": {
      "en": "Are learning beliefs the opposite of fixed conditions?",
      "zh": "相信可以学习与认为条件固定，是相反两端吗？"
    },
    "answer": {
      "en": "Not in this questionnaire. They are separately worded four-statement groups. You may endorse useful learning while recognising constraints. Neither is subtracted from the other, and there is no combined growth, readiness or compatibility score.",
      "zh": "在本问卷中不是。它们是分别措辞的四题组，可以同时认同有用的学习与现实限制；两组不相减，不生成综合成长、准备程度或契合分。"
    }
  },
  {
    "question": {
      "en": "Does related academic research validate this edition?",
      "zh": "相关学术研究是否验证了本版题本？"
    },
    "answer": {
      "en": "No. Destiny/growth research examines related concepts using its own instruments and samples. [1][2] This original four-theme edition has no established psychometric validation or English–Chinese measurement equivalence. Its arithmetic is reproducible; that alone is not evidence of validity.",
      "zh": "没有。命定／成长研究使用各自工具与样本考察相关概念。[1][2] 本原创四主题版本尚未建立心理测量验证或英中等值；算术可复算本身不构成效度证据。"
    }
  },
  {
    "question": {
      "en": "Can these results identify attachment or predict compatibility?",
      "zh": "结果能判断依恋类型或预测关系适配吗？"
    },
    "answer": {
      "en": "No. Guarded expectations do not establish an attachment style, and your beliefs do not reveal another person’s intentions. This questionnaire collects no partner responses and performs no dyadic comparison. A different tool’s score cannot be inferred from these means.",
      "zh": "不能。保留期待不确立依恋类型，自己的信念也不揭示另一人的意图。本问卷不收集伴侣回答、不作双方比较，不能从这些均值推算其他工具的分数。"
    }
  },
  {
    "question": {
      "en": "Should I try to obtain the most positive-looking profile?",
      "zh": "应该努力得到看起来最积极的结果吗？"
    },
    "answer": {
      "en": "There is no target profile. Describe your current view instead of rehearsing an ideal answer. If a result prompts reflection, examine a concrete example and a counterexample. No score requires pursuing someone, tolerating unwanted contact or treating refusal as a challenge.",
      "zh": "没有目标画像。描述当前看法即可，不必排练理想答案。若结果引发反思，可以核对具体例子及反例；任何分数都不要求追求某人、承受不愿接受的联系，或将拒绝当作挑战。"
    }
  }
];
export const datingOutlookLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Knee et al. (2004): implicit theories, conflict and commitment — original study",
      "zh": "Knee等（2004）：内隐关系理论、冲突与承诺——原始研究"
    },
    "url": "https://faculty.washington.edu/claytonn/publications/Knee_Patrick_Vietor_Neighbors_2004.pdf"
  }
];
