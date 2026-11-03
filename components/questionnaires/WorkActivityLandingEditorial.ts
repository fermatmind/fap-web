import type { Questionnaire } from "@/lib/questionnaires/types";
export const workActivityLandingSections: Questionnaire["guide"] = [
  {
    "id": "work-activity-purpose",
    "title": {
      "en": "Work activity interests: sixty tasks, six separate perspectives",
      "zh": "工作活动兴趣盘点：六十项任务、六组独立视角"
    },
    "paragraphs": [
      {
        "en": "Work interests concern the activities you would like to do. A concrete task makes that question more specific than liking a job title: you might enjoy tracing an unexplained change but dislike presenting the findings. This page independently describes interest in hands-on work, investigation, creation, support, initiative and organizing. It keeps the six readings in their original order, rather than choosing a winning type.",
        "zh": "工作兴趣关注你是否喜欢从事某种活动。具体任务比职业名称更明确：你可能喜欢追查一处变化的原因，却不喜欢汇报发现。本页分别描述动手、调查、创作、支持、推动与整理六组兴趣，始终按固定顺序呈现，不选出胜出类型。"
      },
      {
        "en": "Holland’s RIASEC vocabulary is also used by the official O*NET Interest Profiler, whose own formats and evidence are documented separately. [1] This sixty-task supplement is newly authored by FermatMind. Its task wording, missing-rating rule and six descriptive guides belong to this edition; sharing a framework does not transfer another instrument’s validation or occupation links.",
        "zh": "官方O*NET兴趣问卷也使用霍兰德RIASEC六领域词汇，并独立说明其版本与证据。[1] 本补充版的六十项任务由费马新写；题文、未评分规则与六组描述指南属于本版。共享框架词汇，不使其他工具的验证结论或职业关联自动适用于这里。"
      }
    ]
  },
  {
    "id": "work-activity-answer",
    "title": {
      "en": "Rate enjoyment of the activity, with reasonable support in mind",
      "zh": "怎样作答：设想合理支持，评价活动本身的吸引力"
    },
    "paragraphs": [
      {
        "en": "Consider whether doing the described activity would interest you if reasonable training, tools and support were available. Keep the activity distinct from its pay, prestige or your current qualification. A person can be interested in an unfamiliar task without being able to perform it yet; conversely, competence gained through practice need not make the task enjoyable. There are no correct answers and no countdown.",
        "zh": "设想具备合理的培训、工具与支持，判断做题中活动是否吸引你。把活动本身与薪资、声望和现有资格分开：尚未掌握的任务也可能令人感兴趣，经过练习能够胜任的任务也未必令人喜欢。题目没有正确答案，也没有倒计时。"
      },
      {
        "en": "Use the five ordered responses from strongly dislike to strongly like. The middle response means neither like nor dislike and receives 3. If the activity is too unfamiliar to form a judgement, use the separate unscored option. You do not need to try a repair, operate equipment or gather real work records to answer. Every question needs a response, but a response can remain unscored.",
        "zh": "从很不喜欢到很喜欢的五个有序选项中选择；中间项表示既不喜欢也不讨厌，计3分。若陌生到无法形成判断，使用独立的未评分选项。作答不要求实际维修、操作设备或收集真实工作记录。每题需要回应，但回应可以保留为未评分。"
      }
    ]
  },
  {
    "id": "work-activity-six-areas",
    "title": {
      "en": "What the six task groups describe",
      "zh": "六组任务分别关注什么"
    },
    "paragraphs": [
      {
        "en": "Hands-on tasks concern working with physical objects and practical procedures; investigation concerns examining information and possible explanations. Creative tasks concern making or adapting an expression, while teaching and support concern helping someone understand or participate. Look at the actual task within each group: liking practical work does not imply liking every tool, location or physical demand.",
        "zh": "动手任务关注实体物件与实际步骤，调查任务关注信息核查与可能的解释；创作任务关注形成或调整表达，讲解与支持关注帮助他人理解或参与。应查看组内实际题文：喜欢实践活动，不代表喜欢所有工具、工作地点或体力要求。"
      },
      {
        "en": "Initiative and persuasion tasks involve presenting proposals and moving a shared activity forward; records and organizing tasks involve structuring information, checking records and coordinating details. Several groups can matter in the same project. For example, an exhibition may involve evidence checking, making captions, explaining exhibits and maintaining records. These are different activities within one setting, not six exclusive kinds of person.",
        "zh": "推动与说服涉及提出方案、推进共同活动，记录与整理涉及组织信息、核对记录和安排细节。同一项目可以包含多组活动，例如展览中的证据核查、文案制作、展品讲解与记录维护。它们是同一场景里的不同任务，不是六类互斥的人。"
      }
    ]
  },
  {
    "id": "work-activity-arithmetic",
    "title": {
      "en": "How the six means are calculated: coverage before interpretation",
      "zh": "均分怎样计算：先看有效项数，再解释读数"
    },
    "paragraphs": [
      {
        "en": "Each group contains ten tasks. Add only numeric ratings and divide by the number rated; the page displays a mean rounded to one decimal once at least eight tasks in that group have numeric ratings. For example, 5, 4, 4, 3, 3, 2, 2 and 1 sum to 24. With two unscored responses, the result is 24 ÷ 8 = 3.0, with 8/10 rated. No reverse scoring is used in this bank.",
        "zh": "每组包含十项任务，只把数字评分相加，再除以有效项数；该组至少八项有数字评分时，页面才显示保留一位小数的均分。例如5、4、4、3、3、2、2、1之和为24，另两项未评分，结果为24÷8＝3.0，同时显示8/10项有效。本题本不使用反向计分。"
      },
      {
        "en": "With seven numeric ratings, that group shows insufficient information even if all seven are strongly positive. The eight-item rule is this edition’s display requirement, not a demonstrated reliability threshold. Unscored responses are not zero and are not replaced by neutral. Ten neutral ratings also produce 3.0, but their sum is 30 and coverage is 10/10: the same displayed mean can conceal a different response pattern.",
        "zh": "只有七项数字评分时，即使七项都很喜欢，该组仍显示资料不足。八项规则是本版的显示要求，不是已经验证的信度阈值。未评分不记零，也不补成中立。十项都选中立也得到3.0，但原始和为30、有效项为10/10；相同均分可能对应不同的回答结构。"
      }
    ]
  },
  {
    "id": "work-activity-read",
    "title": {
      "en": "Read the tasks behind a mean, without creating a ranking",
      "zh": "回到均分背后的任务，不另造排序"
    },
    "paragraphs": [
      {
        "en": "Start with the rated count, then read the mean alongside the individual activities you remember. A higher mean describes greater reported liking for the rated tasks in that particular group. It does not place you above other visitors. Two groups may contain different kinds of activities and different unscored items, so this page does not rank them, resolve near scores into a type, or issue a three-letter code.",
        "zh": "先看有效项数，再把均分与自己记得的具体活动一起阅读。较高均分表示对该组已评任务报告了更多喜欢，不表示超过其他访客。不同组包含不同任务，也可能缺少不同条目，因此本页不跨组排名、不把相近读数分成类型，也不生成三字代码。"
      },
      {
        "en": "A displayed 3.0 may reflect consistently neutral responses or a mixture of strong likes and dislikes. Separate those cases by identifying which tasks attract you and which conditions put you off. A decimal difference between attempts is not automatically a meaningful change: familiarity, interpretation, context and which tasks were rated may have changed. There is no established measurement-error interval for this original bank.",
        "zh": "显示3.0可能来自持续中立，也可能来自强烈喜欢与不喜欢的混合。可以通过区分吸引自己的任务及令自己退缩的条件来理解它们。两次作答的小数差异不自动等于有意义的变化；熟悉程度、理解、情境以及哪些任务获得评分都可能改变。本原创题本尚无已建立的测量误差区间。"
      }
    ]
  },
  {
    "id": "work-activity-explore",
    "title": {
      "en": "Turn an interest into a small, observable exploration",
      "zh": "把一项兴趣转成可观察的小探索"
    },
    "paragraphs": [
      {
        "en": "Choose one appealing activity and identify its underlying action: comparing evidence, explaining a process, making a draft, proposing a plan or checking a record. Try a low-stakes analogue with fictional or public materials. For example, explain a made-up registration flow to a willing friend, then note whether you enjoyed preparing, clarifying questions or arranging the steps. This is an exploration example, not an additional test item.",
        "zh": "选择一项吸引自己的活动，提炼其动作，例如比较证据、解释流程、制作初稿、提出计划或核对记录。可用虚构或公开材料做一次低风险类比练习：向愿意参与的朋友解释一个自拟报名流程，再观察自己更喜欢准备、回答疑问还是安排步骤。这是探索例子，不是追加测试题。"
      },
      {
        "en": "Record what interested you, what felt difficult and what support you needed. Difficulty can reveal a learning need rather than lack of interest. Before a consequential course or career decision, examine real tasks, training requirements, working conditions and personal constraints, and seek advice where useful. The result helps formulate questions to investigate; this page does not calculate occupational fit or select a qualification pathway.",
        "zh": "记录哪些部分有趣、哪些部分困难、需要什么支持。困难可能提示学习需要，并不一定代表缺乏兴趣。涉及专业或职业等重要决定时，还应核对真实任务、培训要求、工作条件与个人限制，并按需要寻求咨询。结果帮助形成待调查的问题，本页不计算职业适配，也不选择资格路径。"
      }
    ]
  },
  {
    "id": "work-activity-evidence",
    "title": {
      "en": "Research evidence, instrument identity and the core RIASEC route",
      "zh": "研究证据、题本身份与核心RIASEC入口"
    },
    "paragraphs": [
      {
        "en": "The O*NET technical manual treats forms, scoring, item development, reliability, validity, occupational linkage and international applications as separate topics. [2] That separation is useful here: a well-described model, transparent arithmetic and readable reports do not by themselves establish the measurement quality of newly written items. This supplement has no established norms, reliability, validity or English–Chinese measurement equivalence.",
        "zh": "O*NET技术手册分别讨论版本、计分、题目开发、信度、效度、职业关联与国际应用。[2] 这种区分同样有助于理解本页：框架说明、透明算式和可读报告，本身不能建立新写题目的测量质量。本补充版尚未建立常模、信度、效度或英中文测量等值。"
      },
      {
        "en": "For the broader FermatMind interest profile, use the separate core RIASEC assessment linked on this page. Its sixty-item standard and 140-item enhanced forms retain their own questions and calculation. These sixty supplemental tasks are not those forms, are not official O*NET items, and cannot supply their code by relabelling the six means. No answers transfer when you follow the optional core assessment link.",
        "zh": "若要了解更广的费马兴趣轮廓，可使用本页链接的独立核心RIASEC测评；其60项标准版与140项增强版保留各自题目与算法。这里的六十项补充任务不是这些题本，也不是官方O*NET原题，不能把六组均分改名后当作核心代码。点击可选核心入口不会传送本次答案。"
      }
    ]
  },
  {
    "id": "work-activity-access",
    "title": {
      "en": "Complete free guides, direct entry and optional tab saving",
      "zh": "完整免费指南、直接作答与主动保存"
    },
    "paragraphs": [
      {
        "en": "Starting opens the first question directly; you do not need to accept a further participation statement. The approximate twelve minutes covers the instructions and sixty ratings, not reading all six long guides. Every guide is available before answering and remains identical for all response patterns, including insufficient-information results. There is no registration or report paywall for this page.",
        "zh": "点击开始直接进入第一题，无需再同意参与声明。约12分钟估计包含说明与六十项评分，不包含读完六篇长指南。所有指南均可先读，对各种回答模式保持相同，包括资料不足时；本页不要求注册或付费解锁报告。"
      },
      {
        "en": "Answers are held in the current page unless you explicitly save a draft in this tab for up to twenty-four hours. Completion, retaking or exit-and-clear removes that draft. Sharing copies only the public title and entry link, not ratings or means. Optional anonymous activity counting is off unless selected, and does not include answers; leaving it off does not restrict the questions or guides.",
        "zh": "回答保留在当前页面，只有主动保存才会在本标签页保留最多24小时草稿；完成、重测或退出清除会删除草稿。分享只复制公开标题与入口，不包含评分或均分。可选匿名活动计数未经选择保持关闭，且不包含答案；关闭它不影响题目或指南。"
      }
    ]
  }
];
export const workActivityLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Why rate tasks rather than choose a job title?",
      "zh": "为什么评价具体任务，而不是直接选职业？"
    },
    "answer": {
      "en": "A job title can contain activities you like and activities you do not. This supplement makes the activity itself the unit of reflection. Read the conditions in the prompt and separate attraction to the task from attraction to pay or status.",
      "zh": "一个职业名称可能同时包含喜欢与不喜欢的活动。本补充版以活动本身为观察单位；应读清题中的条件，并区分任务吸引力与薪资、地位的吸引力。"
    }
  },
  {
    "question": {
      "en": "Is 3 the same as not knowing the activity?",
      "zh": "选3和不了解任务是一回事吗？"
    },
    "answer": {
      "en": "No. Three is a valid neutral rating. The unfamiliar option records a response without a number. It affects rated coverage but is not included in the sum or mean.",
      "zh": "不是。3是有效的中立评分；陌生选项记录回应，但不产生数字。它影响有效项数，不进入原始和与均分。"
    }
  },
  {
    "question": {
      "en": "Why is there no mean when seven tasks are rated?",
      "zh": "为什么评了七项还没有均分？"
    },
    "answer": {
      "en": "This edition requires eight numeric ratings out of ten per group. Seven is insufficient regardless of how positive the ratings are. This is a stated reporting rule, not proof of a validated psychometric threshold.",
      "zh": "本版要求每组十项中至少八项数字评分。七项无论多积极都属资料不足。这是明确的报告规则，不是已经验证的心理测量阈值。"
    }
  },
  {
    "question": {
      "en": "Can the same mean describe different interests?",
      "zh": "相同均分可能表示不同的兴趣吗？"
    },
    "answer": {
      "en": "Yes. Eight ratings of 5,4,4,3,3,2,2,1 yield 3.0, as do ten neutral ratings. Their coverage and patterns differ. The individual tasks help interpret what the mean leaves out.",
      "zh": "可能。5、4、4、3、3、2、2、1这八项得到3.0，十项都选中立也得到3.0，但有效项数与回答模式不同。具体任务可以补充均分省略的信息。"
    }
  },
  {
    "question": {
      "en": "Are the highest three means my Holland code?",
      "zh": "最高的三个均分就是霍兰德代码吗？"
    },
    "answer": {
      "en": "This supplement does not produce or validate a top-three code. Six readings remain separate and in fixed order. Use the independent core RIASEC entry for its own broader profile; do not transfer or convert these means.",
      "zh": "本补充版不生成或验证前三代码，六组读数独立并按固定顺序呈现。可进入独立核心RIASEC了解其更广轮廓，不把这里的均分转移或换算过去。"
    }
  },
  {
    "question": {
      "en": "Can I like an activity I have never performed?",
      "zh": "从未做过的活动，也可以喜欢吗？"
    },
    "answer": {
      "en": "If you understand the activity well enough to imagine doing it with reasonable support, you can rate its appeal. If you cannot form a judgement, leave it unscored. Neither response requires actually carrying out the activity.",
      "zh": "如果理解活动内容，能够设想在合理支持下做它，可以评价其吸引力；若无法形成判断，保留未评分。两种回应都不要求实际执行活动。"
    }
  },
  {
    "question": {
      "en": "Does a higher decimal mean a better career prospect?",
      "zh": "小数更高表示职业前景更好吗？"
    },
    "answer": {
      "en": "No. It describes reported liking for the rated tasks in this set. There is no income prediction, population percentile or employment forecast. Opportunities also depend on training, skills, working conditions and access.",
      "zh": "不表示。它描述对本组已评任务报告的喜欢程度，不预测收入、就业或人群百分位。机会还涉及培训、技能、工作条件与可进入性。"
    }
  },
  {
    "question": {
      "en": "Do I need to consent to counting or save a draft to start?",
      "zh": "开始前必须同意计数或保存草稿吗？"
    },
    "answer": {
      "en": "No. Start goes directly to question one. Optional counting and tab saving are separate choices; neither is required to finish all sixty ratings or read every guide.",
      "zh": "不需要。开始按钮直接进入第一题。可选计数与标签页保存是独立选择，都不是完成六十项评分或阅读所有指南的条件。"
    }
  }
];
export const workActivityLandingReferences = [{ title: { en: "O*NET Interest Profiler Manual: overview of its separate instruments and evidence", zh: "O*NET兴趣问卷技术手册：其独立工具与证据概览" }, url: "https://www.onetcenter.org/reports/IP_Manual.html" }];
