import type { Text } from "@/lib/questionnaires/types";

export const moodActivitySections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "mood-activity-purpose",
    "title": {
      "en": "Changes in mood and activity: recall one period, keep four topics separate",
      "zh": "心情与活动变化：回顾同一时段，分别理解四个主题"
    },
    "paragraphs": [
      {
        "en": "Sixteen original observations invite adults to recall one period within the past year when mood or activity felt different from their usual experience. Four topics cover mood and confidence, sleep and activity, thoughts and conversation, and plans and decisions. Each contains four statements; every selection remains visible alongside four complete public guides.",
        "zh": "十六条原创观察，供成年人回顾过去一年内一段心情或活动与平时不同的时间。四个主题分别为心情与自信、睡眠与活动、想法与交谈、计划与决定；每组四条，记录保留逐条选择，并提供四篇完整公开指南。"
      },
      {
        "en": "The period is optional and stays in your own recollection: no dates, medical history or personal story are entered. If no period comes to mind, every statement can remain unscored. The topics organize reading; they are not four validated independent dimensions, a clinical episode checklist or a scale of how much you have changed.",
        "zh": "时段是自愿的回忆参照，不输入日期、病史或个人故事。没有想到某段时间时，全部陈述都可保留为未计分。这些主题用于组织阅读，不是四个已经验证的独立维度、临床发作清单或变化幅度量表。"
      }
    ]
  },
  {
    "id": "period-and-baseline",
    "title": {
      "en": "A difference from your usual experience is not an episode finding",
      "zh": "与平时不同，不等于识别到一次发作"
    },
    "paragraphs": [
      {
        "en": "Use the same remembered period across the statements rather than combining separate times to make a complete pattern. Comparing with your own usual experience differs from comparing with other people. The website cannot verify a baseline, decide how long the change lasted or establish that different experiences happened together.",
        "zh": "各条参照同一回忆时段，不必拼接不同时间来凑成完整模式。与自己平时比较，和与别人比较不同；网站不能核实个人基线、判断变化持续多久，或证明不同经历同时出现。"
      },
      {
        "en": "NIMH describes clinical assessment as considering the severity, duration and frequency of experiences over a person’s lifetime, family history and other possible explanations. [1] This record does not gather that assessment. Selecting one period within a year neither supplies those missing details nor turns a remembered difference into bipolar disorder, mania or hypomania.",
        "zh": "NIMH说明，临床评估会考虑一生中相关经历的严重程度、持续时间与频率、家族史及其他可能解释。[1] 本记录不收集这些完整评估信息。选择过去一年内某段时间，既不能补足上述信息，也不能把记得的差异变成双相障碍、躁狂或轻躁狂的结论。"
      }
    ]
  },
  {
    "id": "mood-and-confidence-context",
    "title": {
      "en": "Separate feelings of confidence from demonstrated ability",
      "zh": "区分当时的自信感与已经证实的能力"
    },
    "paragraphs": [
      {
        "en": "The first topic asks about unusually upbeat mood, greater irritation at ordinary interruptions, unusual certainty about handling things beyond usual limits and seeing one’s abilities as more exceptional. A match describes a remembered feeling. It does not prove that an expectation was unrealistic, establish a clinical cause for irritation or judge character.",
        "zh": "第一组涉及不同寻常的高昂心情、普通打断引起更多烦躁、特别确信能应对平时范围之外的事情，以及觉得自己的能力更不一般。“符合”描述记得的感受，不证明期待不现实，不建立烦躁的临床原因，也不评价品格。"
      },
      {
        "en": "For example, recalling that a plan felt unusually easy is different information from whether the plan was feasible. Both cheerful and irritable moments may be recalled without having occurred at the same moment. There is no confidence challenge, argument or task to demonstrate either account, and no ideal amount of confidence to achieve.",
        "zh": "例如，记得某个计划当时显得格外容易，和计划实际是否可行，是两份信息。高兴与烦躁都可能被回顾，却未必同时发生。无需通过自信挑战、争辩或任务证明感受，也没有需要达到的理想自信程度。"
      }
    ]
  },
  {
    "id": "sleep-and-activity-context",
    "title": {
      "en": "Remembered sleep need is different from adequate rest",
      "zh": "当时对睡眠需要的感觉，不等于休息足够"
    },
    "paragraphs": [
      {
        "en": "The sleep-and-activity topic distinguishes sleeping less while not feeling a need for more at the time, feeling more energy, starting more activities and moving between activities when you would usually pause. These are separate recollections. More starts do not establish more completed work, and moving between tasks does not establish unusual energy.",
        "zh": "睡眠与活动主题分别涉及睡得较少而当时未觉得需要更多睡眠、活动精力较多、开始更多活动，以及平时会停顿时不断换活动。它们是不同回忆：开始更多不证明完成更多工作，换任务也不证明精力不同寻常。"
      },
      {
        "en": "A closely-matches label cannot certify biological sleep need, adequate rest, productivity or safe functioning. Do not stay awake, alter a rest opportunity, exercise or recreate an active period to find an answer. This reflection does not give a sleep, medicine or activity plan, and existing professional advice remains independent of it.",
        "zh": "“很符合”不能认证生理睡眠需要、休息充分、生产效率或活动安全。无需熬夜、改变休息机会、运动或重现活跃时段来寻找答案。本回顾不提供睡眠、药物或活动方案，已有专业意见独立保留。"
      }
    ]
  },
  {
    "id": "thoughts-and-decisions-context",
    "title": {
      "en": "Thought pace, conversation and decisions describe different experiences",
      "zh": "想法速度、交谈和决定，各有自己的语境"
    },
    "paragraphs": [
      {
        "en": "Faster-seeming thoughts, several ideas crowding together, talking more and difficulty leaving a pause are distinct descriptions. A private experience of crowded ideas can occur without a conversation to recall. The page has no speech recording or timed task; it cannot assess thinking speed, intelligence, communication skill or another participant’s intentions.",
        "zh": "想法似乎更快、几个念头挤在一起、说话更多及难以留出停顿，是不同描述。独处时的想法拥挤，可能没有对应谈话可回想。页面没有录音或限时任务，不能测思考速度、智力、沟通技巧或他人意图。"
      },
      {
        "en": "The final topic concerns quicker commitments, less consideration before a practical choice, more abrupt plan changes and difficulty setting a new plan aside. Decision speed, consideration and consequences are separate information. A match does not establish poor judgment; a nonmatch does not approve a decision. No purchase, commitment, message review or test of restraint is needed.",
        "zh": "最后一组涉及更快承诺、实际选择前考虑较少、改计划更突然，以及难以暂放新计划。决定速度、考虑过程与后果属于不同信息。“符合”不证明判断差，“不符”也不为决定提供许可。无需购买、作承诺、回看消息或测试克制力。"
      }
    ]
  },
  {
    "id": "match-categories",
    "title": {
      "en": "Six match categories retain descriptions without assigning points",
      "zh": "六种贴切类别保留描述，不赋点数"
    },
    "paragraphs": [
      {
        "en": "Choose does not match, matches slightly, partly, mostly or closely, or leave the observation unscored for no relevant experience, unclear recall or withholding. The labels concern how the statement fits a recollection, not frequency, amount of change or clinical severity. Numeric-looking category IDs do not become points.",
        "zh": "可以选择与回忆不符、稍微符合、部分符合、大体符合、很符合；无相关经历、回忆不清或保留回答时选未计分。标签表示陈述对回忆的贴切程度，不是频率、变化幅度或临床严重度；看起来像数字的类别标识，也不成为点数。"
      },
      {
        "en": "For example, two partly matches, one closely matches and one unscored produce counts 0, 0, 2, 0, 1 and 1 in the displayed order. They add to four statements, not four days, activities or symptoms. Unscored remains separate from does not match. No total, average, leading topic, percentile or risk threshold is calculated.",
        "zh": "例如，两条部分符合、一条很符合与一条未计分，按展示顺序的六类计数为0、0、2、0、1、1，合计四条陈述，而不是四天、四项活动或四种症状。未计分与不符分开；不计算总分、均分、主导主题、百分位或风险阈值。"
      }
    ]
  },
  {
    "id": "evidence-and-reading",
    "title": {
      "en": "What the four records and public guides can explain",
      "zh": "四份记录与公开指南能够解释什么"
    },
    "paragraphs": [
      {
        "en": "Each record retains four original observations, their selected labels and category counts. All four guides are available before answering and after any record, including an entirely unscored one. Read the individual statement and its context first. A public guide explains a topic with examples; it is not a personalised diagnosis or a report of someone else’s answers.",
        "zh": "每份记录保留四条原创观察、所选标签与类别计数。四篇指南在作答前及任何记录后都可读，包括全部未计分的记录。先读逐条陈述及其情境；公开指南通过例子解释主题，不是个体诊断，也不包含他人的答案。"
      },
      {
        "en": "This original form is not MDQ, HCL-32, YMRS or a diagnostic interview. It has no established clinical norms, thresholds or English–Chinese measurement equivalence. Separate site pages about Energy Flow, Attention and Energy, repetitive thinking and executive function keep their own questions and methods. Similar wording does not permit answer transfer, score conversion or a combined clinical model.",
        "zh": "本原创题本不是MDQ、HCL-32、YMRS或诊断访谈，尚未建立临床常模、阈值或中英文测量等值。本站能量流动、注意力与能量、重复思维及执行功能等独立页面保留各自题目和方法。词语相似，不代表可以转移回答、换算分数或组成联合临床模型。"
      }
    ]
  },
  {
    "id": "privacy-and-support",
    "title": {
      "en": "Keep recollection private and support independent of a record",
      "zh": "回忆可以留在私下，支持不依赖记录"
    },
    "paragraphs": [
      {
        "en": "Selections remain in this page’s memory, without saved drafts, answer submission or a personal result URL. Exiting, restarting, reloading or leaving clears them. Copy public entry shares only the public title and link. The website does not observe your mood, watch for an episode or provide an emergency response.",
        "zh": "选择仅留当前页面内存，不保存草稿、不提交答案，也不生成个人结果网址。退出、重做、刷新或离开会清除；复制公开入口只含公开标题与链接。网站不观察心情、不监测发作，也不能提供紧急响应。"
      },
      {
        "en": "You can ask a qualified healthcare or mental-health professional about a concern without finishing, reaching a count or proving a duration. You decide what to share. A sparse or unscored record is not proof of health or safe decisions. Keep existing care and safety support independent; the record should not postpone assessment, change medicine or remove support.",
        "zh": "无需完成回顾、达到某个计数或证明特定时长，即可就顾虑向合格医疗或心理健康专业人员咨询，分享多少由本人决定。少量或未计分的记录，不证明健康或决定安全。已有照护与安全支持独立保留，不用记录推迟评估、改药或取消支持。"
      }
    ]
  }
];

export const moodActivityFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Who can use this reflection, and how long does it take?",
      "zh": "适合谁回顾，约需多久？"
    },
    "answer": {
      "en": "Adults can answer about their own recollection, using one optional period within the past year. Sixteen statements take about eight minutes at your own pace. There is no timer, account requirement or fee for any of the four complete guides.",
      "zh": "供成年人回顾本人经历，以过去一年中同一段可选时段为参照。十六条约需八分钟，可按自己的节奏进行。不限时，无需账户，四篇完整指南全部免费。"
    }
  },
  {
    "question": {
      "en": "Is the reference period a recent-month rating?",
      "zh": "这是最近一个月的评分吗？"
    },
    "answer": {
      "en": "No. Use one optional period within the past year when mood or activity felt different from usual. There is no requirement to enter dates or select a certain duration. The period is a recollection reference, not a clinical episode.",
      "zh": "不是。参照过去一年中一段心情或活动与平时不同的可选时段，无需输入日期或选择某个固定时长。它是回忆参照，不是临床发作。"
    }
  },
  {
    "question": {
      "en": "Does feeling unusually good or confident mean something is wrong?",
      "zh": "不同寻常地高兴或自信，是否说明有问题？"
    },
    "answer": {
      "en": "A category match alone cannot establish that. The form records how a description fits your recollection, without verifying context, consequences or a clinical cause. It neither labels positive feelings an illness nor rules out a concern because the period felt productive.",
      "zh": "仅凭类别符合不能判断。题本记录描述与回忆的贴切程度，不核实背景、后果或临床原因；既不把积极感受标成疾病，也不因当时觉得高效而排除顾虑。"
    }
  },
  {
    "question": {
      "en": "Does feeling that I needed less sleep prove that less was enough?",
      "zh": "当时觉得不需要多睡，是否证明睡得够？"
    },
    "answer": {
      "en": "No. The statement preserves a remembered feeling, not a measurement of biological sleep need or safe functioning. You do not need to alter sleep or recreate the period to answer. Existing sleep or health advice stays independent of the record.",
      "zh": "不能。陈述保留当时记得的感受，不测生理睡眠需要，也不认证活动安全。不必改变睡眠或重现时段来作答；已有睡眠或健康意见独立保留。"
    }
  },
  {
    "question": {
      "en": "Can I combine separate memories if they fit different statements?",
      "zh": "不同陈述想到不同时段，可以合并吗？"
    },
    "answer": {
      "en": "The intended reference is the same optional period. Combining separate times cannot establish a shared episode or cause. If the reference is unclear, any statement can remain unscored; no more complete story has to be produced.",
      "zh": "预设参照是同一段可选时段。拼接不同时间不能建立共同发作或原因。参照不清时，任何陈述都可未计分，无需编排更完整的叙述。"
    }
  },
  {
    "question": {
      "en": "Can the four topic counts be added or ranked?",
      "zh": "四个主题的计数可以相加或排名吗？"
    },
    "answer": {
      "en": "No. Each has four descriptions and six category counts. They are not points, independent diagnostic dimensions or measures of impact. There is no combined result, dominant topic, bipolar percentage or high-risk band.",
      "zh": "不能。每组为四条描述及六类计数，不是点数、独立诊断维度或影响量。不产生合并结果、主导主题、双相百分比或高风险分档。"
    }
  },
  {
    "question": {
      "en": "Does a changed retake show improvement or deterioration?",
      "zh": "重做后变化，是否表示改善或恶化？"
    },
    "answer": {
      "en": "Not from this record. Recall, context and interpretation can change. No treatment-response or test–retest interpretation is established, and repeating the form to reach a preferred category is not a substitute for care.",
      "zh": "本记录不能这样判断。回忆、背景和理解可能变化，题本尚未建立治疗反应或重测解释；反复作答以达到理想类别，也不能替代照护。"
    }
  },
  {
    "question": {
      "en": "Do I need to show messages, purchases or a personal history?",
      "zh": "需要展示消息、购买记录或个人历史吗？"
    },
    "answer": {
      "en": "No. There are no upload or free-text fields. Use existing recollection only; no message review, purchase, commitment, sleep change or task is required. You can read all guides privately without completing the form.",
      "zh": "不需要。没有上传或自由填写栏，只用已有回忆；不要求回看消息、购买、作承诺、改变睡眠或完成任务。可以不作答，私下阅读全部指南。"
    }
  }
];

export const moodActivityReadingSummaries: Record<string, Text> = {
  "mood-and-confidence-reading": {
    "en": "Read upbeat mood, irritation and unusual certainty as recalled experiences; distinguish confidence from demonstrated ability and context.",
    "zh": "把高昂心情、烦躁与不同寻常的确信放回回忆，区分自信感、实际能力与具体背景。"
  },
  "sleep-and-activity-reading": {
    "en": "Separate remembered sleep need, energy, activity starts and pauses without turning any count into proof of adequate rest or productivity.",
    "zh": "分别理解当时的睡眠需要感、精力、活动开始与停顿，不用计数证明休息充分或效率高。"
  },
  "thoughts-and-conversation-reading": {
    "en": "Distinguish faster-seeming or crowded thoughts from conversation pace, without measuring intelligence or asking for a private transcript.",
    "zh": "区分想法似乎更快、念头拥挤与交谈节奏，不测智力，也不要求提供私人实录。"
  },
  "plans-and-decisions-reading": {
    "en": "Consider decision speed, deliberation and consequences separately, without certifying safety, capacity or a clinical cause.",
    "zh": "分别理解决定速度、考虑过程与后果，不认证安全、决策能力或临床原因。"
  }
};
