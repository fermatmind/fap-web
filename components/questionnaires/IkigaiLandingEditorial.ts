import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Entry context; source-bound original scenarios and complete guides stay unchanged. */
export const ikigaiLandingSections: QuestionnaireSection[] = [
  {
    "id": "ikigai-culture-map",
    "title": {
      "zh": "Ikigai是什么意思？日常意义、现代图示与本站情境题",
      "en": "What does ikigai mean? Everyday meaning, a modern diagram and these scenarios"
    },
    "paragraphs": [
      {
        "zh": "日本政府文化特写将ikigai描述为给生活带来价值与喜悦的事物，例子包括家人、朋友、工作和爱好；文章也把四圆图作为整理想法的一种图示来讨论。[2] 这类文化介绍有助于理解词义，不等于四圆图是一套传统测量公式，也不能证明本页结果反映健康、寿命或人生价值。",
        "en": "A JapanGov cultural feature describes ikigai through sources of value and joy, including family, friends, work and hobbies, and discusses the four-circle diagram as a way to organise thoughts.[2] Cultural context helps explain the word, without establishing a traditional measurement formula or evidence that this page’s result measures health, lifespan or life value."
      },
      {
        "zh": "Marc Winn的2014年文章及后加注说明，他将ikigai一词放进已有的目的图，原图来自Andrés Zuzunaga。[3] 本卷借四种常见交叠组织原创问题，没有复制图像，也不把图中央当成完成测评后能认证的终点。“生之目的”是本页主题名称，不要求你找到唯一、宏大或终身不变的使命。",
        "en": "Marc Winn’s 2014 essay and later note describe adding the word ikigai to an existing purpose diagram by Andrés Zuzunaga.[3] Our original questions use four familiar overlaps without copying the image or certifying arrival at its centre. The title does not require a single grand mission or a purpose fixed for life."
      }
    ]
  },
  {
    "id": "ikigai-four-lenses",
    "title": {
      "zh": "四种视角分别问什么？喜欢、练习、需要与报酬",
      "en": "What do the four lenses ask? Enjoyment, practice, needs and payment"
    },
    "paragraphs": [
      {
        "zh": "热情视角把喜欢的活动与愿意练习的环节放在一起：例如喜欢做社区小刊物，先挑一页练习文字或排版。使命视角把喜欢与别人明确表达的需要并排：例如有人想读一份简明活动说明，而你也愿意制作。前者不认证已经擅长，后者不认证更高尚或已经产生了影响；可以喜欢一项活动，也仍不了解它对别人有没有用。",
        "en": "Passion places enjoyment beside something you would like to practise: for example, enjoying a community booklet and choosing one page to practise writing or layout. Mission places enjoyment beside an expressed need, such as someone requesting a clear activity guide you would enjoy making. The first certifies no existing proficiency; the second no virtue or proven impact. Enjoyment can coexist with uncertainty about usefulness."
      },
      {
        "zh": "职业视角关注练习、样例、交付范围与报酬条件怎样相连；天职视角关注明确需要与支付、支持和服务范围怎样相连。同样是小刊物，前者可以先了解编辑样例和约定交付，后者可以先确认读者需要与谁提供支持。两个名称是图示中的常见交叠，不是适合职位、命定岗位或收入可行性的结论。",
        "en": "Profession concerns practice, samples, delivery scope and payment conditions. Vocation concerns expressed needs alongside payment, support and service scope. For the same booklet, one lens might begin with an editing sample and delivery agreement; the other with readers’ needs and who could provide support. These are familiar diagram labels, not findings about job suitability, a destined role or viable income."
      },
      {
        "zh": "常见四圆图中的“擅长”在本卷只转成练习与待了解条件，没有测试你的真实技能。四项也不是四个圆的独立分数：先问需要与报酬，不意味着你不喜欢这件事；少选热情视角，不意味着没有兴趣或能力。每题是在现有选项里选第一步，而不是给全部生活条件作全面评价。",
        "en": "The diagram’s usual “good at” wording becomes practice and questions to investigate here, without testing real skills. Four counts are not independent scores for four circles. Asking about need and payment first does not establish lack of enjoyment; fewer Passion choices establish no lack of interest or ability. Each item selects a first question among alternatives rather than evaluating every condition of your life."
      }
    ]
  },
  {
    "id": "ikigai-count-denominators",
    "title": {
      "zh": "16次选择怎样计数？相同曝光与实际选择分开看",
      "en": "How are sixteen choices counted? Separate equal exposure from actual choices"
    },
    "paragraphs": [
      {
        "zh": "每题四项分别对应四种视角，只给选中的视角加1，未选不加也不扣，没有反向题。每种视角都出现16次，在A、B、C、D位置各出现4次。完成后四项计数总和16，每项0—16；曝光均衡只说明出现安排相同，不证明题目等难、统计独立或问卷已完成心理测量验证。",
        "en": "Each item offers all four lenses and adds one count only to the chosen lens, without subtracting from unchosen ones or reverse scoring. Each lens appears sixteen times and four times at positions A, B, C and D. Counts sum to sixteen, each between zero and sixteen. Equal exposure describes the arrangement, not equal difficulty, statistical independence or psychometric validation."
      },
      {
        "zh": "例如四项依次为6、6、2、2，热情与使命同时最高，显示两份完整指南；另两项计数仍保留。选中6次不是有37.5%的热情、人生目的或职业匹配；把6除以16，只是本批选择中的份额。四项总和固定，一个视角多一次必有其他视角少一次，不能据此当作四种独立能力比较。",
        "en": "Counts of 6, 6, 2, 2 give Passion and Mission the shared maximum and both full guides, while retaining the other counts. Six choices do not mean 37.5 percent passion, life purpose or career fit. Dividing six by sixteen describes a share of these choices only. With a fixed sum, an extra choice for one lens necessarily comes from another; the four are not independent abilities."
      }
    ]
  },
  {
    "id": "ikigai-ties-neighbours",
    "title": {
      "zh": "并列、近分与0次：完整指南怎样读？",
      "en": "Ties, close counts and zero: how should the guides be read?"
    },
    "paragraphs": [
      {
        "zh": "全选A时四项各4次，四份九节指南全部呈现。相同计数只说明选中次数相同，也可以来自固定选项位置；不说明四圈都满足、生活平衡，或已经找到理想中心。系统不按字母、题号或名单顺序破同分，也不设次高类型；公开指南始终可先读，不需要反复做题来解锁。",
        "en": "Choosing A throughout gives four counts of four and all four nine-section guides. Equal counts can arise from a fixed response position; they establish neither satisfied circles, balanced living nor an ideal centre. The system breaks no tie by letter, item number or list order and assigns no secondary type. Public guides can be read first without repeated attempts to unlock them."
      },
      {
        "zh": "最高6、另一项5时保留实际计数，不把它们强并列，也没有证明1次差异具心理意义。可以把两个问题带回同一具体活动，核对哪个现在更有用。0次只说明这16题里没有先选该视角，可能是其他选项更合意；它不证明你忽视别人的需要、没有能力，或应该补齐哪两个圆。",
        "en": "With a maximum of six and another count of five, keep the counts without merging them or treating a one-choice gap as psychologically meaningful. Consider both questions against one activity to see which is useful now. Zero means not chosen first in these sixteen items, perhaps because other options fit better. It establishes no neglected needs, absent skill or prescription to fill two missing circles."
      }
    ]
  },
  {
    "id": "ikigai-evidence",
    "title": {
      "zh": "Ikigai-9研究测了什么？为什么不能验证这16题",
      "en": "What does Ikigai-9 research measure, and why does it not validate these sixteen items?"
    },
    "paragraphs": [
      {
        "zh": "今井、长田与西村（2012）研究的是9条、五点作答的生きがい意识量表，在428名60岁以上社区居民中分析信度、与SF-36v2的关联及因子结构；这是具有人群与方法范围的证据。[4] 它不是四圆图的四组情境选择，也不是本页热情、使命、职业与天职四项计数。研究量表的统计结果不能直接借给同名的其他问卷。",
        "en": "Imai, Osada and Nishimura’s 2012 study examined a nine-item, five-point ikigai scale in 428 community residents aged 60 or older, analysing reliability, relationships with SF-36v2 and factor structure.[4] That evidence concerns its population and method, not four-circle scenario choices or our four counts. Statistical findings for one instrument cannot be transferred to another questionnaire with a similar name."
      },
      {
        "zh": "本站是16道原创假想题，结果解释先想了解什么；没有独立测量四圆，也没有测验实际技能、收入、市场或他人反馈。本题本尚未建立自身信度、效度、常模或中英文测量等价性。可复算的加法与完整的双语解释保证的是规则可见，不是对个人使命、职业成功或幸福程度的学术认证。",
        "en": "These sixteen original hypothetical items explain what you would explore first. They independently assess neither the circles nor actual skills, income, a market or others’ feedback. Form-specific reliability, validity, norms and English–Chinese measurement equivalence remain unestablished. Reproducible addition and complete bilingual guides make the rules visible, without certifying personal purpose, career success or well-being."
      }
    ]
  },
  {
    "id": "ikigai-small-exploration",
    "title": {
      "zh": "把视角转成小探索：先区分想法、事实与待核对条件",
      "en": "Turn a lens into a small exploration: ideas, facts and conditions to check"
    },
    "paragraphs": [
      {
        "zh": "以社区小刊物为例，不必真的开展项目：在自己私下的记录里，将“我愿意尝试画一页”与“我已经能交付整本”分开，把“有人可能想读”与“谁明确提出什么需要”分开。再选一项低风险的了解方式，例如看一个公开排版教程，或在他人愿意交流时问清资料读者。无需把记录、姓名或私人需要提交给网站。",
        "en": "Consider a community booklet without having to start a project. In private notes, separate wanting to try drawing a page from being able to deliver a whole booklet, and possible reader interest from an explicitly expressed need. Choose a low-stakes way to learn more, such as a public layout tutorial or, if someone wishes to discuss it, clarifying the intended readers. No notes, names or private needs are submitted here."
      },
      {
        "zh": "报酬相关问题同样可以保留未知：是否愿意付费、由谁支持、范围与时间怎样约定，都不是一个选项能证实的事实。也可以决定只作为爱好、不提供服务，或先不继续。这个例子是可选的问题整理，不是创业建议、已验证的干预方案或必须采取的行动；实际选择应结合资源、意愿和具体条件。",
        "en": "Payment questions can remain unknown: willingness to pay, who could support an activity, and scope or timing cannot be established by an option choice. You may keep it as a hobby, offer no service or go no further. This is an optional way to organise questions, not business advice, a validated intervention or a required action. Decisions depend on resources, willingness and circumstances."
      }
    ]
  },
  {
    "id": "ikigai-change-context",
    "title": {
      "zh": "没有唯一使命也能继续探索：情境变化与重测",
      "en": "Exploring without one fixed mission: context and retakes"
    },
    "paragraphs": [
      {
        "zh": "关系、照顾一小片植物、阅读、创作或一次有意义的相聚，都可能值得关注，不需要每件事同时满足赚钱、擅长、喜欢与被需要。[2] 本页不为生活方式排价值等级，也不要求照顾他人到超出自己的余量。天职等词在这里用于辨认图示视角，不能成为别人要求你承担某种角色的理由。",
        "en": "Relationships, tending a small plant, reading, making something or a meaningful gathering can deserve attention without each combining income, skill, enjoyment and demand.[2] This page ranks no way of living and requires no contribution beyond your resources. A label such as Vocation identifies a diagram lens; it gives others no authority to assign you a role."
      },
      {
        "zh": "重测时可回看具体题目的改变以及当时想到的活动、信息和条件。计数差异可能来自情境和选择顺序，不能证明使命转变、人格成长或探索有效。本卷不能推算MBTI、RIASEC、价值观量表或实际职业适配，也没有规定多久重测一次才会更准确；读过有用的问题后可以在这里结束。",
        "en": "On a retake, review changed items and the activities, information and conditions you had in mind. Count differences may reflect context or choice order rather than a changed purpose, personality growth or effective exploration. This quiz converts into neither MBTI, RIASEC, a values scale nor actual career fit, and specifies no accuracy-improving retest schedule. You can finish after finding a useful question."
      }
    ]
  }
];

export const ikigaiLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "四个结果，是四个圆各自的分数吗？",
      "en": "Are the four results separate scores for four circles?"
    },
    "answer": {
      "zh": "不是。它们是四组交叠视角下“先探索哪组问题”的次数；没有分别测喜欢、能力、需要与收入，也不能从少选一项推断哪圈缺失。",
      "en": "No. They count which questions you would explore first under four overlap lenses. Enjoyment, skill, need and income are not measured separately, and fewer choices do not identify a missing circle."
    }
  },
  {
    "question": {
      "zh": "热情、使命、职业、天职，各有什么不同？",
      "en": "How do Passion, Mission, Profession and Vocation differ?"
    },
    "answer": {
      "zh": "分别并排考虑喜欢与练习、喜欢与需要、练习与报酬、需要与报酬。名称帮助识别提问起点，不判定能力、道德、命定工作或已实现的贡献。",
      "en": "They pair enjoyment with practice, enjoyment with needs, practice with payment, and needs with payment. Labels identify a starting question rather than ability, virtue, destined work or proven contribution."
    }
  },
  {
    "question": {
      "zh": "6、6、2、2为什么有两份结果？",
      "en": "Why do counts of 6, 6, 2, 2 give two matched guides?"
    },
    "answer": {
      "zh": "前两项共享最高6次，系统逐份保留完整指南，不挑一个赢家或改成新类型；全部计数仍可查看，总和为16。",
      "en": "The first two share the maximum of six, so both full guides remain, without choosing one winner or inventing a combined type. All counts remain visible and sum to sixteen."
    }
  },
  {
    "question": {
      "zh": "选中6次，可以说有37.5%的使命或匹配吗？",
      "en": "Do six choices mean 37.5 percent mission or matching?"
    },
    "answer": {
      "zh": "不能。6除16只表示这批选择的份额，不是能力、相似度、意义或人群百分位；本卷没有对应的概率或常模解释。",
      "en": "No. Six divided by sixteen is a share of these choices, not ability, similarity, meaning or a population percentile. This quiz provides no corresponding probability or normative interpretation."
    }
  },
  {
    "question": {
      "zh": "0次是否说明我忽视了某种人生需要？",
      "en": "Does zero mean I am neglecting a need in my life?"
    },
    "answer": {
      "zh": "不能这样推断。它只记录这16题没有先选该视角，其他问题可能暂时更合意；没有测量你生活中实际投入了什么或缺少什么。",
      "en": "No such inference follows. It records not choosing that lens first in sixteen items, perhaps because other questions fit better then. Actual investment and unmet conditions are not measured."
    }
  },
  {
    "question": {
      "zh": "这和Ikigai-9一样吗？",
      "en": "Is this the same as Ikigai-9?"
    },
    "answer": {
      "zh": "不是。2012年的Ikigai-9研究考察九条五点评分的生きがい意识量表；本页是16道原创探索四选一。题本、对象与结果不同，不能借用其验证数据。[4]",
      "en": "No. The 2012 Ikigai-9 study examined a nine-item, five-point ikigai scale. This page has sixteen original exploration choices. Its items, purpose and results differ, so that study’s validation cannot be borrowed.[4]"
    }
  },
  {
    "question": {
      "zh": "爱好没有收入，是不是就没有ikigai？",
      "en": "Does an unpaid hobby mean I have no ikigai?"
    },
    "answer": {
      "zh": "不是。日本文化介绍中的例子也包括朋友、爱好与日常活动。[2] 本页不要求把所有意义集中到有薪工作里，也不据报酬视角次数评价生活价值。",
      "en": "No. The cultural feature includes friends, hobbies and everyday activities.[2] This page requires no consolidation of meaning into paid work and uses no payment-lens count to judge life value."
    }
  },
  {
    "question": {
      "zh": "最高项只差1次，要当成不同类型吗？",
      "en": "Does a one-choice lead establish a different type?"
    },
    "answer": {
      "zh": "本版只保留实际计数及最高项，不设置经验证的显著差异或近分阈值。可阅读相邻视角，把问题联系具体活动，不把小差异变成固定身份。",
      "en": "This edition retains actual counts and maxima without a validated meaningful-difference or close-score threshold. Read nearby lenses against an activity rather than turning a small gap into a fixed identity."
    }
  },
  {
    "question": {
      "zh": "结果能证明我更健康、更幸福或更长寿吗？",
      "en": "Can the result establish better health, happiness or longevity?"
    },
    "answer": {
      "zh": "不能。本卷未测这些结果。文化背景或其他量表研究不等于本题本具有相应预测效度，计数也不能决定你的生活是否有价值。",
      "en": "No. Those outcomes are not measured here. Cultural background and studies of other instruments establish no predictive validity for this form; counts cannot decide whether your life has value."
    }
  },
  {
    "question": {
      "zh": "需要做另一个测试、再次同意或付费才能看全文吗？",
      "en": "Must I take another test, agree again or pay to read full guides?"
    },
    "answer": {
      "zh": "不需要。开始直接进入16题，四份指南全部免费，所有最高并列完整保留。无需收入或活动名称；也可以先读指南，不必作答。",
      "en": "No. Start opens sixteen items directly. All four full guides are free and every highest tie is retained. No income or activity name is required; you can also read first without answering."
    }
  }
];
