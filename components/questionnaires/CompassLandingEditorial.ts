import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Additional entry reading; original full reports, guide and FAQ stay unchanged. */
export const compassLandingSections: QuestionnaireSection[] = [
  {
    "id": "compass-four-starts",
    "title": {
      "zh": "四向含义：推进、参与、顺序与替代办法",
      "en": "Four starting approaches: movement, participation, sequence and alternatives"
    },
    "paragraphs": [
      {
        "zh": "北向“推动一步”关注先把下一步定下来，例如提出一个待确认日期；南向“顾及参与”关注别人怎样方便加入，例如先了解时间或参与条件。两者都可能服务同一个活动，区别在本次选项里更常先做什么，不把前者定为领导者、后者定为跟随者，也不按反应快慢或生气速度给人分类。",
        "en": "North, moving a step forward, emphasizes establishing a next action, such as suggesting a date for confirmation. South, supporting participation, emphasizes conditions that make joining easier, such as asking about timing or access. Both can serve the same activity. Counts describe what you selected first, without assigning leaders and followers or classifying people by speed or anger."
      },
      {
        "zh": "东向“厘清顺序”先整理条件、材料和步骤；西向“尝试别法”先探索一个替代安排。例如列清聚餐要带什么，与换一种收集菜名的方法，是不同起点，不是理性与感性、守旧与先进或认真与散漫的对立。你可以在实际行动中先试别法，再整理顺序；四个名称没有优劣排名。",
        "en": "East, clarifying the sequence, organizes conditions, materials and steps; West, trying another way, explores an alternative arrangement. Listing what a shared meal needs differs from trying another way to collect dish ideas. These are starting points, not rational versus emotional, outdated versus progressive or careful versus careless. In practice you may explore first and organize later; no direction is superior."
      }
    ]
  },
  {
    "id": "compass-neighbour-examples",
    "title": {
      "zh": "三种计分实例：邻向、相邻并列与相对并列",
      "en": "Three scoring examples: neighbours, adjacent ties and opposite ties"
    },
    "paragraphs": [
      {
        "zh": "按北、南、东、西顺序，14、10、8、4合计36：北向最高，在它的两个垂直邻向中，东8高于西4，因此显示北东读法。南10虽然是全局第二，仍不是北的邻向。邻向指本页规则中与最高方向垂直的两向之一，不代表第二人格、支持能力或隐含的主副身份。",
        "en": "In North, South, East, West order, 14, 10, 8, 4 total thirty-six. North leads; among its perpendicular neighbours, East’s eight exceeds West’s four, producing North-East. South has the second-highest count overall but is not North’s neighbour. Neighbour means one of the two perpendicular directions in this rule, not a second personality, supporting ability or hidden primary/secondary identity."
      },
      {
        "zh": "12、6、12、6时，北与东并列最高，分别生成北东、东北两份全文；14、14、4、4时，北与南并列最高，且各自的东西邻向同分，显示北向与南向两份基础说明。相对方向不会被合并为“北南型”。9、9、9、9则保留四向基础说明；邻向未分出不意味着“纯人格”或没有其他做法。",
        "en": "With 12, 6, 12, 6, North and East share the maximum, giving both North-East and East-North. With 14, 14, 4, 4, North and South lead and both have equal East/West neighbours, so their two base guides appear. Opposites are not combined into a North-South type. Counts of 9, 9, 9, 9 retain all four base guides; an undistinguished neighbour does not mean a pure personality or absence of other approaches."
      }
    ]
  },
  {
    "id": "compass-twelve-readings",
    "title": {
      "zh": "12份读法怎样区分，为什么顺序不能交换",
      "en": "Distinguishing twelve readings and why order matters"
    },
    "paragraphs": [
      {
        "zh": "四份基础说明是北、南、东、西；八份有序说明为北东、北西、南东、南西、东北、东南、西北、西南。北东以推进为最高，东向是较多的垂直邻向；东北以厘清顺序为最高，北向是较多的垂直邻向。两份可能在最高并列时一起出现，但含义与生成条件分别保留，不互换名称。",
        "en": "There are four base readings, North, South, East and West, and eight ordered readings: North-East, North-West, South-East, South-West, East-North, East-South, West-North and West-South. North-East starts with North among the maxima and East as its greater perpendicular neighbour; East-North starts with East among the maxima and North as its greater neighbour. Both may appear in a highest tie, but their meanings and conditions remain distinct."
      },
      {
        "zh": "阅读时先看四项实际次数，再看每个最高方向对应哪份说明，最后核对报告中的例子和反例。12是公开说明的数量，不是本题本发现了12种自然人格。未成为最高的方向仍有实际计数，其全文也可以直接阅读；列表位置不把同分结果分成重要与次要。",
        "en": "Read all four actual counts first, then the guide associated with each highest direction, and finally its examples and counterexamples. Twelve is the number of public guides, not twelve natural personality types discovered by this questionnaire. Non-leading directions retain their actual counts and their guides stay readable. List position does not turn tied results into more and less important identities."
      }
    ]
  },
  {
    "id": "compass-relative-counts",
    "title": {
      "zh": "固定总和怎样影响分数：自比计分与研究证据",
      "en": "How a fixed total affects scores: ipsative counting and research evidence"
    },
    "paragraphs": [
      {
        "zh": "每题选一项就分配1次，36题共享36次，不可能四项同时都得到36。一项较少，可以只是当题更常选另一个起点；也不能用你的北14与别人的北10比较谁更有推动力。14/36是本次选择比例的算术表达，不能解释成人群百分位、人格纯度、能力水平或准确率。",
        "en": "One selection allocates one count, so thirty-six items share thirty-six counts; all four cannot each receive thirty-six. A lower count can simply reflect choosing another starting point more often. Your fourteen North choices versus someone else’s ten do not establish greater drive. Fourteen out of thirty-six describes an arithmetic share of this attempt, not a percentile, personality purity, ability level or accuracy."
      },
      {
        "zh": "Brown与Maydeu-Olivares讨论传统强迫选择计分的自比约束，以及通过适当项目反应模型处理这些问题的方法。本页只采用原始计数，没有实施论文中的IRT估计、项目校准或常模，也没有本题本的信度、效度与跨语言等价证据。引用说明为什么要谨慎读次数，不借论文宣称本站已经完成测量验证。[4]",
        "en": "Brown and Maydeu-Olivares discuss the ipsative constraints of traditional forced-choice scoring and how appropriate item-response models can address them. This page uses raw counts, not the paper’s IRT estimation, item calibration or norms. Reliability, validity and cross-language equivalence have not been established for this form. The reference explains caution about counts; it does not establish validation of this questionnaire.[4]"
      }
    ]
  },
  {
    "id": "compass-name-and-framework",
    "title": {
      "zh": "名称与来源：四向罗盘、PCTI及其他同名工具",
      "en": "Names and sources: four-direction compasses, PCTI and other tools"
    },
    "paragraphs": [
      {
        "zh": "通俗四向罗盘的背景包括Diane Turner与Thelma Greco的《The Personality Compass》，可核对其1998年版书目信息。本页是费马原创36题反思版，不是该书条目、译本或官方PCTI施测；最高与垂直邻向的组合是本站公开的整理规则，不借用原书效度、职业或关系预测结论。[5]",
        "en": "Background to popular four-direction framing includes The Personality Compass by Diane Turner and Thelma Greco, documented in a 1998 edition’s bibliographic record. This is FermatMind’s original thirty-six-item reflection, not that book’s items, translation or official PCTI administration. Combining maxima with perpendicular neighbours is this website’s explicit organizational rule, without borrowing validation, career or relationship predictions from the book.[5]"
      },
      {
        "zh": "“Personality Compass”也可能是其他大五、价值观或类型工具的名称，方向含义要以各自题本为准。英文标题的Arabic是通俗搜索名称背景，本页实际只提供中英文，不声称阿语支持、阿拉伯文化常模或族群特征。北南东西不是出生地、血型、脑区或DNA标签，也不能换算DISC、MBTI或大五结果。",
        "en": "Personality Compass can also name unrelated Big Five, values or typology tools, so meanings depend on the exact instrument. Arabic in the English title supplies popular search-name context; this page offers English and Chinese, without Arabic-language support, Arab cultural norms or ethnic character claims. Directions are not birthplace, blood type, brain-region or DNA labels and cannot be converted into DISC, MBTI or Big Five results."
      }
    ]
  },
  {
    "id": "compass-practical-discussion",
    "title": {
      "zh": "把读法变成具体沟通：一个安排与一个反例",
      "en": "Turning a reading into a conversation: an arrangement and a counterexample"
    },
    "paragraphs": [
      {
        "zh": "例如共同整理一个活动角落时，可以依次讨论：“先确认哪一步？”“怎样让人方便加入？”“材料与步骤清楚吗？”“有没有更简单的替代办法？”不必给同伴测型，也不按方向分派职责。若你较常选推进，可尝试在定步骤前多问一次条件；若较常选参与，可同时说明自己的时间与边界。",
        "en": "When arranging a shared activity corner, ask: What step needs confirming? What would make joining easier? Are materials and steps clear? Is there a simpler alternative? There is no need to type companions or assign roles by direction. If you often choose movement, try asking once more about conditions before fixing a step. If you often choose participation, state your own time and boundaries too."
      },
      {
        "zh": "再找反例核对：你可能在熟悉活动中先定日期，却在陌生流程中先问步骤；也可能喜欢换一种玩法，却在安全要求上严格按说明。结果用于提出可观察的问题，不证明你在所有事情上都一样。沟通效果仍看实际回应，方向不决定合作资格、谁该迁就谁或关系是否合适。",
        "en": "Then look for a counterexample: you may fix a date for a familiar activity yet ask about steps in an unfamiliar process, or enjoy changing a game while following safety instructions exactly. A result suggests observable questions without proving uniform behavior across situations. Judge conversations by actual responses; directions do not decide eligibility to collaborate, who must accommodate whom or whether a relationship fits."
      }
    ]
  },
  {
    "id": "compass-close-counts-and-context",
    "title": {
      "zh": "近分、参照情境与重测：怎样保持解释准确",
      "en": "Close counts, reference contexts and retakes: keeping interpretation precise"
    },
    "paragraphs": [
      {
        "zh": "相差一次保留真实次数，但不证明统计显著、稳定主次或风格强度。本页没有“接近多少就算并列”的阈值：只有最高次数确实相同才保留最高并列；邻向也只比较实际次数。可以自愿把近分指南一起读，不必为了得到某个组合反复作答或把分数凑成理想身份。",
        "en": "A one-choice gap remains visible without proving statistical significance, a stable primary/secondary distinction or style strength. No near-tie threshold is used: highest ties require equal counts, and neighbours use their actual counts too. Read nearby guides together if useful, without repeatedly answering to obtain a preferred combination or fit an ideal identity."
      },
      {
        "zh": "近期角色、时间压力、熟悉程度和参与者都可能影响选择，建议完整一次使用同一类普通安排作为参照。重测时先比较版本、间隔和改变的题目，再结合具体例子解释；一次字样或组合变化不能区分真实改变与作答波动。本页不测成长、情绪调节、治疗效果或工作表现。",
        "en": "Recent roles, time pressure, familiarity and participants may affect choices. Use a consistent kind of everyday arrangement across an attempt. On retaking, compare editions, the interval and changed items, then consider concrete examples. A changed label or combination alone cannot distinguish actual change from response variation. Growth, emotional regulation, treatment effects and work performance are not measured."
      }
    ]
  }
];

export const compassLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "北、南、东、西在本题本中分别指什么？",
      "en": "What do North, South, East and West mean in this form?"
    },
    "answer": {
      "zh": "北向推动一步，南向顾及参与，东向厘清顺序，西向尝试别法。它们描述原创选项中的起手方式，不按情绪、能力、好坏或地理给人分类。",
      "en": "North moves a step forward, South supports participation, East clarifies sequence and West tries another way. They describe starting approaches among original options, not emotion, ability, merit or geography."
    }
  },
  {
    "question": {
      "zh": "北14、南10、东8、西4，为什么不是北南？",
      "en": "Why do North 14, South 10, East 8 and West 4 not produce North-South?"
    },
    "answer": {
      "zh": "北最高，只比较它的垂直邻向东与西，东8高于西4，所以读北东。南虽为全局第二，却不是北的垂直邻向。",
      "en": "North leads and compares its perpendicular neighbours East and West. East’s eight exceeds West’s four, producing North-East. South is second overall but not a perpendicular neighbour of North."
    }
  },
  {
    "question": {
      "zh": "北东与东北有什么不同？",
      "en": "How do North-East and East-North differ?"
    },
    "answer": {
      "zh": "前者北向处于最高、东高于西；后者东向处于最高、北高于南。顺序代表不同生成条件；北东最高并列时两份也可能同时显示。",
      "en": "North-East has North among the maxima and East above West. East-North has East among the maxima and North above South. Order names different conditions; an adjacent highest tie may display both."
    }
  },
  {
    "question": {
      "zh": "12、6、12、6会出现几份报告？",
      "en": "How many reports follow counts of 12, 6, 12, 6?"
    },
    "answer": {
      "zh": "按北南东西顺序，北、东同为最高，分别生成北东与东北两份全文，不按名单或选项位置挑一个。",
      "en": "In North, South, East, West order, North and East share the maximum, producing both North-East and East-North in full. Neither list order nor option position selects a sole result."
    }
  },
  {
    "question": {
      "zh": "北南同为14、东西各4会怎样？",
      "en": "What if North and South each have 14 and East and West each have 4?"
    },
    "answer": {
      "zh": "北南是相对方向，两个最高都保留；各自的东西邻向同分，所以显示北向、南向两份基础说明，不造北南组合或纯人格。",
      "en": "Both opposite maxima remain. Each has equal East/West neighbours, so the North and South base guides appear, without inventing a North-South combination or pure personality."
    }
  },
  {
    "question": {
      "zh": "一直选同一位置，会没有结果吗？",
      "en": "Does repeating one option position produce no result?"
    },
    "answer": {
      "zh": "仍有结果。每向在四个位置各出现9次，36题固定选同一位置会四向各9，四份基础说明全部显示。均衡选项位置不等于完成心理测量验证。",
      "en": "A result still appears. Each direction occurs nine times in each position, so repeating one position gives nine each and displays four base guides. Balanced option positions are not psychometric validation."
    }
  },
  {
    "question": {
      "zh": "别人北向次数更多，是不是比我更有领导力？",
      "en": "Does someone with more North choices have greater leadership ability?"
    },
    "answer": {
      "zh": "不能这样比较。四向共享固定36次，次数是本人的相对选择；没有独立领导能力测量、常模或职业预测。",
      "en": "No. Four directions share thirty-six counts, recording each person’s relative choices, without an independent leadership measure, norms or career prediction."
    }
  },
  {
    "question": {
      "zh": "所有强迫选择测试都不能比较人群吗？",
      "en": "Are all forced-choice tests incapable of comparisons between people?"
    },
    "answer": {
      "zh": "不能一概而论。适当IRT模型可处理某些传统自比计分问题；本站没有施测或校准该模型，只给原始次数，不能借其他工具的研究进行人群比较。[4]",
      "en": "Not categorically. Appropriate IRT models can address some traditional ipsative-scoring problems. This page does not administer or calibrate such a model and provides raw counts, without borrowing other tools’ research to compare people.[4]"
    }
  },
  {
    "question": {
      "zh": "开始后要再次同意、注册或解锁结果吗？",
      "en": "Must I agree again, register or unlock results after Start?"
    },
    "answer": {
      "zh": "不需要。开始直接进入36题，约10分钟但不限时；四项计数、所有最高与12份全文免费。保存为主动选择，可选分享不含私人答案或次数。",
      "en": "No. Start opens thirty-six untimed questions, estimated at ten minutes. Four counts, every maximum and twelve full guides are free. Saving is opt-in; optional sharing contains no private answers or counts."
    }
  }
];
