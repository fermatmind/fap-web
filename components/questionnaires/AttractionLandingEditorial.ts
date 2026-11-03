import type { Questionnaire } from "@/lib/questionnaires/types";
export const attractionLandingSections: Questionnaire["guide"] = [
  {
    "id": "attraction-purpose",
    "title": {
      "en": "Attraction experiences: five observations, without an identity assignment",
      "zh": "吸引体验观察：五项分别记录，不分配身份"
    },
    "paragraphs": [
      {
        "en": "These fifteen original statements describe romantic attraction recurring, an emotional bond preceding romantic attraction, and sexual attraction showing continuity, contextual variation or a varied range of appealing qualities. The first two groups concern romantic experience; the other three concern sexual attraction. Each group has three statements and its own reading.",
        "zh": "十五条原创陈述分别描述浪漫吸引再次出现、情感联结先于浪漫吸引，以及性吸引的延续、情境变化和吸引特质的多样范围。前两组涉及浪漫体验，后三组涉及性吸引；每组三条，分别阅读。"
      },
      {
        "en": "The result records agreement with these particular descriptions during the past twelve months. It does not count attractions, identify the people involved or choose an orientation. Five means are not five identities, and the largest number does not become your main pattern. All five full guides can be read without answering or generating a personal mean.",
        "zh": "结果记录对过去十二个月这些具体描述的认同，不统计吸引次数、不识别涉及的人，也不选择取向。五项均值不是五种身份，最大的数字也不成为主要模式。不作答或不生成个人均值，都可阅读全部五篇完整指南。"
      }
    ]
  },
  {
    "id": "attraction-reference",
    "title": {
      "en": "How to answer: experiences from the same twelve months",
      "zh": "怎样作答：同一十二个月中的体验"
    },
    "paragraphs": [
      {
        "en": "Answer only for yourself as an adult and keep the same past twelve months in mind. Rate whether the whole statement fits what you experienced, rather than whether you can explain the feeling fluently or think you should have experienced it. No names, genders, body descriptions, locations or private acts are requested.",
        "zh": "仅由成年人为自己作答，全程回想同一个过去十二个月。评价完整陈述是否符合实际体验，不评价能否流畅解释感受，也不按认为自己应该有何体验回答。无需提供姓名、性别、身体描述、地点或私人行为。"
      },
      {
        "en": "The numeric options range from strongly disagree to strongly agree. Three is Neutral, not unsure. Use unscored when no suitable experience exists, the distinction is unclear or you prefer not to answer. All fifteen items need a response choice, but unscored is a valid choice. There is no requirement to make every part produce a number.",
        "zh": "数字选项从非常不同意到非常同意。3是中立，不是不确定。没有合适经历、区分不清或不愿回答时可选未评分。十五题均需选择，但未评分是有效选择，不要求每项都生成数字。"
      }
    ]
  },
  {
    "id": "attraction-romantic",
    "title": {
      "en": "Romantic recurrence and bond order ask different questions",
      "zh": "浪漫吸引的再次出现与联结先后，是不同问题"
    },
    "paragraphs": [
      {
        "en": "Recurrence statements concern a feeling toward a person returning or appearing at different points in the year. A year without romantic attraction can support disagreement with these descriptions. Uncertainty about whether a feeling was romantic is different and can remain unscored. Dating, enjoying romantic fiction or wanting companionship does not by itself answer these statements.",
        "zh": "再次出现题关注对具体人的感受返回，或在这一年不同时间出现。没有浪漫吸引的一年，可以支持对这些描述的不同意；不确定某感受是否浪漫则不同，可以保留未评分。约会、喜欢浪漫作品或想要陪伴，本身不回答这些陈述。"
      },
      {
        "en": "Bond-order statements need a romantic-attraction onset to place before or after emotional closeness. If no such onset occurred, leave them unscored rather than choose a low number. A remembered bond-first sequence does not show that closeness caused the attraction, is always required or will eventually make another person feel attracted. Friendship creates no obligation to develop romance.",
        "zh": "联结先后题需要有浪漫吸引的起点，才能比较它与情感亲近的顺序。没有起点时应未评分，而不是选低分。回忆中的联结先行，不说明亲近导致吸引、始终是必要条件，或最终会使别人产生吸引。友谊不带来发展浪漫关系的义务。"
      }
    ]
  },
  {
    "id": "attraction-sexual",
    "title": {
      "en": "Sexual continuity, context and breadth can coexist",
      "zh": "性吸引的延续、情境变化与多样范围可以并存"
    },
    "paragraphs": [
      {
        "en": "Continuity asks about familiar qualities of appeal across points in time and separate experiences. Context variation asks whether appeal differed across settings or emotional contexts. Breadth asks whether different qualities or an unfamiliar pattern were involved. A varied range can remain familiar over time while particular settings change what feels appealing. These groups are not reverse scores or competing identities.",
        "zh": "延续题关注不同时点及经历中熟悉的吸引特质。情境变化题关注场合或情感情境间吸引力是否不同。多样范围题关注是否涉及不同特质或惯常模式以外的体验。多样范围可随时间保持熟悉，而特定场合又改变吸引力。这些组不是反向分或竞争的身份。"
      },
      {
        "en": "Each comparison needs suitable experiences. No sexual attraction, no earlier/later comparison or an unclear distinction should not be turned into proof of a narrow or stable pattern. Attraction also differs from appreciation of appearance, bodily arousal, chosen activity or willingness to participate. [2] The questionnaire does not ask you to seek an experience to fill a missing comparison.",
        "zh": "每种比较都需要合适经历。没有性吸引、没有前后比较或区分不清，不应被改记成范围窄或模式稳定的证明。吸引也不同于欣赏外表、身体唤起、选择的行为或参与意愿。[2] 问卷不要求寻找新经历来补足缺少的比较。"
      }
    ]
  },
  {
    "id": "attraction-arithmetic",
    "title": {
      "en": "Scoring: three complete ratings for each agreement mean",
      "zh": "怎样计分：每项三条完整评分才有认同均值"
    },
    "paragraphs": [
      {
        "en": "All items are directly scored from 1 to 5, without reverse keys. For each group, add the three numeric responses, divide by three and display one decimal. For example, 1, 4 and 5 sum to 10 and display 10/3 = 3.3. Two ratings of 5 plus unscored do not produce a mean: the sum is 10 but coverage is only two of three.",
        "zh": "全部条目直接按1至5计分，没有反向键。每组将三条数字相加、除以三，显示一位小数。例如1、4、5相加为10，10/3显示3.3。两条5加未评分不生成均值：数字和虽为10，但只有三题中的两条有效。"
      },
      {
        "en": "Missing ratings become neither 0 nor 3 and are not estimated from other groups. Requiring all three is this edition’s reporting rule, not an established reliability threshold. Ratings 1, 3, 5 and three ratings of 3 both average 3.0 but describe different answers. A mean summarizes agreement categories, not the number, frequency, probability or intensity of attraction events.",
        "zh": "缺失不补0或3，也不由其他组估算。要求三条完整是本版报告规则，不是已建立的信度门槛。1、3、5与三条3都平均为3.0，但回答不同。均值概括认同类别，不是吸引事件的数量、频率、概率或强度。"
      }
    ]
  },
  {
    "id": "attraction-evidence",
    "title": {
      "en": "Conceptual sources and the limits of an original questionnaire",
      "zh": "概念来源与原创问卷的证据范围"
    },
    "paragraphs": [
      {
        "en": "AUREA discusses romantic attraction separately from sexual orientation and describes diverse ways people understand their experiences. [1] AVEN distinguishes attraction, identity, behavior and arousal, while leaving identity language to the person concerned. [2] These community resources help clarify terms; they did not supply or validate these fifteen prompts, their five groups or the website’s scoring rule.",
        "zh": "AUREA将浪漫吸引与性取向分开讨论，描述人们理解自身体验的多种方式。[1] AVEN区分吸引、身份、行为与唤起，身份语言仍由本人选择。[2] 这些社群资料帮助澄清术语，并未提供或验证本十五题、五组或网站计分规则。"
      },
      {
        "en": "This original form has no established reliability, construct validity, population norms, predictive validity or English–Chinese measurement equivalence. Complete answers and reproducible arithmetic establish that a summary can be calculated, not that it locates you on an identity spectrum. A twelve-month reference also excludes earlier experiences and cannot predict what the following year will be like.",
        "zh": "本原创题本尚未建立信度、构念效度、人群常模、预测效度或英中测量等值。回答完整与计分可复算，只表明可以计算摘要，不表明能定位身份光谱。十二个月参照也不包含更早经历，不能预测下一年将如何。"
      }
    ]
  },
  {
    "id": "attraction-comparison",
    "title": {
      "en": "Different instruments and changing experiences do not supply a conversion",
      "zh": "不同工具与体验变化，不提供换算依据"
    },
    "paragraphs": [
      {
        "en": "The Kinsey Institute explains that its historical ratings came from interviews and that there is no official Kinsey Scale quiz. [3] This reflection does not administer that scale or the Klein grid. It does not ask about the gendered direction of attraction, so a breadth mean cannot identify heterosexuality, bisexuality, pansexuality or any other orientation.",
        "zh": "金赛研究所说明，历史评分来自访谈，并不存在官方金赛量表测验。[3] 本观察不施测该量尺或Klein网格，也不询问吸引对象的性别方向，因此多样范围均值不能识别异性恋、双性恋、泛性恋或其他取向。"
      },
      {
        "en": "FermatMind’s separate Mini twenty-item reflection concerns noticing, describing, labels and privacy. Clarity about a feeling is different from its occurrence or pattern, and the two sets of results do not convert. On retest, compare the time reference and particular statements before interpreting a change. No reliable-change threshold, permanence estimate or causal account is supplied here.",
        "zh": "费马另一个Mini二十题观察涉及辨认、描述、标签与隐私。对感受理解清楚，不同于感受的出现或模式，两套结果不换算。重做时应先核对时间参照及具体陈述，再理解变化。本页不提供可靠变化门槛、持久性估计或原因解释。"
      }
    ]
  },
  {
    "id": "attraction-privacy",
    "title": {
      "en": "Private reflection, without a requirement to disclose or act",
      "zh": "私人反思：不要求披露或采取行动"
    },
    "paragraphs": [
      {
        "en": "If useful, privately choose one statement and distinguish what was present, absent or unclear in a suitable experience. You do not need to prove an identity, ask another person to judge your feelings, change a relationship or test attraction through dating or sexual activity. You may leave a comparison unscored and stop after reading.",
        "zh": "如有帮助，可私下选一条陈述，在合适经历中区分哪些存在、哪些没有、哪些不清楚。无需证明身份、请别人判断感受、改变关系，或通过约会或性行为检验吸引。可以保留比较未评分，读完即止。"
      },
      {
        "en": "Start opens the first item directly without an extra agreement screen. All fifteen questions and five eight-section guides are free, without registration. Answers remain only in current page memory: no draft saving, personal-result URLs, personal-result sharing or quiz-flow statistics. Refreshing, changing language or leaving discards the attempt. Public guide links contain no personal answers or means.",
        "zh": "点击开始直接进入第一题，没有额外同意页面。十五题及五篇各八节的指南免费，无需注册。答案仅留当前页面内存，不保存草稿、不生成个人结果网址、不分享个人结果、不发送测试流程统计。刷新、换语言或离开会丢弃作答；公开指南链接不含个人答案或均值。"
      }
    ]
  }
];
export const attractionLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What do the five results describe?",
      "zh": "五项结果描述什么？"
    },
    "answer": {
      "en": "Agreement with fifteen original experience statements about the past twelve months: two romantic groups and three sexual-attraction comparisons. They are five independent readings, not five identities or one attraction level.",
      "zh": "对过去十二个月十五条原创体验陈述的认同，包含两组浪漫体验与三组性吸引比较。它们是五项独立读法，不是五种身份或一个吸引等级。"
    }
  },
  {
    "question": {
      "en": "Why is no attraction different from no comparison?",
      "zh": "没有吸引与没有比较依据为什么不同？"
    },
    "answer": {
      "en": "No romantic attraction can support disagreement with recurrence. Bond order requires attraction to have begun; sexual-pattern comparisons need suitable experiences. When that basis is absent, choose unscored rather than infer a low, narrow or stable pattern.",
      "zh": "没有浪漫吸引，可以支持对再次出现的不同意；联结先后需要吸引曾开始，性吸引模式比较也需要合适经历。没有依据时选未评分，不推断模式低、窄或稳定。"
    }
  },
  {
    "question": {
      "en": "Does a bond-first result prove demiromantic identity?",
      "zh": "联结先行结果能证明半浪漫身份吗？"
    },
    "answer": {
      "en": "No. Reporting that closeness preceded attraction does not establish a necessary condition across your life, a cause or an identity. No number requires you to use or abandon any label.",
      "zh": "不能。报告亲近先于吸引，不确立一生中的必要条件、原因或身份。任何数字都不要求使用或放弃某个标签。"
    }
  },
  {
    "question": {
      "en": "Can continuity and variation both be endorsed?",
      "zh": "能同时认同延续与变化吗？"
    },
    "answer": {
      "en": "Yes. Familiar qualities may recur over time while their appeal changes by setting; a broad range can also remain consistently broad. These groups are not opposite ends of one scale.",
      "zh": "可以。熟悉特质可随时间再次出现，其吸引力又随场合改变；广泛的范围也可持续广泛。这些组不是同一量尺两端。"
    }
  },
  {
    "question": {
      "en": "Does breadth mean attraction to more genders or more partners?",
      "zh": "多样范围表示被更多性别或更多伴侣吸引吗？"
    },
    "answer": {
      "en": "No. The prompts concern varied qualities and experiences outside a previous pattern. They do not collect genders, partner counts or relationship behavior, and cannot infer those details from a mean.",
      "zh": "不是。题目关注不同特质及惯常模式以外的体验，不收集性别、伴侣数量或关系行为，也不能从均值推断这些细节。"
    }
  },
  {
    "question": {
      "en": "How can I recompute a displayed mean?",
      "zh": "怎样复算显示的均值？"
    },
    "answer": {
      "en": "Three numeric ratings are required. 1, 4, 5 give 10/3 = 3.3 to one decimal. Two ratings of 5 and unscored give insufficient information, not 5.0. Unscored is excluded and never changed to 0 or 3.",
      "zh": "需要三条数字。1、4、5得到10/3=3.3，保留一位小数。两条5加未评分显示资料不足，不是5.0。未评分不计入，也不改成0或3。"
    }
  },
  {
    "question": {
      "en": "Can this identify an orientation or replace a published instrument?",
      "zh": "它能识别取向或替代发表工具吗？"
    },
    "answer": {
      "en": "No. This is an original, nonclassifying reflection, not Kinsey or Klein. [3] Its concepts, items and scoring have no established equivalence with other instruments or identity categories.",
      "zh": "不能。这是原创、不分类的反思，不是金赛或Klein。[3] 其概念、条目与计分，尚未与其他工具或身份类别建立等值关系。"
    }
  },
  {
    "question": {
      "en": "Must I describe experiences or take another test?",
      "zh": "必须描述经历或继续其他测试吗？"
    },
    "answer": {
      "en": "No. No private examples are requested, all five guides are open, and another test is optional. You can finish with every item unscored, leave without saving anything or simply read the public explanations.",
      "zh": "不需要。无需提供私人实例，五篇指南已开放，其他测试可自由选择。可以全选未评分完成、离开而不保存任何内容，或只阅读公开解释。"
    }
  }
];
export const attractionLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Kinsey Institute: historical scale and the absence of an official quiz",
      "zh": "金赛研究所：历史量尺与不存在官方测验的说明"
    },
    "url": "https://www.kinseyinstitute.org/research/publications/kinsey-scale.html"
  }
];
