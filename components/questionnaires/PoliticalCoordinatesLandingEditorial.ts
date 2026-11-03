import type { Questionnaire } from "@/lib/questionnaires/types";

export const politicalCoordinatesLandingSections: Questionnaire["guide"] = [
  {
    "id": "political-edition",
    "title": {
      "zh": "政治坐标测试测什么？36项假设公共政策取舍",
      "en": "What does this Political Coordinates Test explore? Thirty-six hypothetical policy choices"
    },
    "paragraphs": [
      {
        "zh": "本版通过36道原创政策方案比较，分别整理经济左—右与共同体—个人自由两轴，每轴18项。题目涉及供给与筹资、产权和议价，以及公民参与、共同文化实践与个人选择。完成后可查看有效题数、两端次数、原始差值和四份完整指南；坐标描述给定方案的选择，不概括一个人的全部政治立场。",
        "en": "This edition uses thirty-six original policy comparisons, eighteen each for economic left–right and communitarian–liberal axes. Topics include provision, finance, ownership and bargaining, alongside civic participation, shared cultural practices and individual choice. Completion provides valid-item counts, endpoint counts, raw differences and four full guides. The coordinates summarise choices among these proposals rather than a person’s entire politics."
      },
      {
        "zh": "把每题视为假设讨论，不假定方案正在实施、符合某地现行法律或必然产生某种效果。先阅读条件与两个方案，再选更偏好的一项；都不能代表观点、信息不足或不愿回答时可选NA。全部题目和全文免费，开始按钮直接进入第一题，无需注册或额外确认。",
        "en": "Treat each item as a hypothetical discussion, without assuming a proposal is current law, already implemented or guaranteed to work. Read the conditions and both alternatives before choosing. NA is available when neither represents your view, information is insufficient or you prefer not to answer. All items and full guides are free, and Start opens the first question directly without registration or extra confirmation."
      }
    ]
  },
  {
    "id": "political-axis-definitions",
    "title": {
      "zh": "先认轴的定义：经济安排与公民共同目的",
      "en": "Define the axes first: economic arrangements and shared civic purposes"
    },
    "paragraphs": [
      {
        "zh": "经济轴把公共供给、再分配或集体参与经济决策，与较多私人筹资、所有者自主或保留所得作比较。社会轴把共同公民目的、义务和延续，与自愿参与、中立规则及个人公民自由作比较。它不是威权程度轴，重视共同体不自动等于支持威权；个人自由优先也不自动等于经济右向。",
        "en": "The economic axis compares public provision, redistribution or collective economic influence with more private finance, owner discretion or retained earnings. The social axis compares common civic purposes, obligations and continuity with voluntary participation, neutral rules and individual civic freedom. It is not an authoritarianism scale: valuing community does not establish authoritarianism, and civic freedom does not automatically imply economic-right preferences."
      },
      {
        "zh": "斯坦福哲学百科讨论共同体对身份、判断和政治生活的意义；OpenStax分别介绍分配正义、政治理念及宪制中的个人自由。这些材料帮助理解词汇，不提供本页的计分键，也不把复杂理论简化为两类人的人格诊断。“liberal”在不同语境中的含义也不能不加区别地互换。[1][2][3]",
        "en": "The Stanford Encyclopedia discusses community’s role in identity, judgment and political life; OpenStax introduces distributive justice, political ideologies and constitutional liberties. These readings clarify vocabulary rather than provide this bank’s key or diagnose two kinds of people. Meanings of liberal in different contexts should not be treated as interchangeable. [1][2][3]"
      }
    ]
  },
  {
    "id": "political-limited-comparisons",
    "title": {
      "zh": "二选一能保留什么，又省略了什么？",
      "en": "What does a two-proposal comparison retain or leave out?"
    },
    "paragraphs": [
      {
        "zh": "选择公共筹资，可能因为重视可及性，也可能只是更不认可题中私人筹资的条件；选项本身不能还原理由。同样，支持某项传统活动，不决定对税收或工资协商的意见。本版每题等权，次数没有记录议题重要程度、认同强度或你希望增加的第三方案。",
        "en": "Choosing public finance might reflect access concerns or simply reservations about the private alternative as written; a selection cannot recover its reason. Supporting a particular traditional event likewise does not determine views on taxation or wage bargaining. Equal counts record neither personal issue importance, strength of conviction nor a third proposal you would prefer."
      },
      {
        "zh": "可以把“目标”“政策工具”“实施条件”分开看。例如，同样希望服务可及，仍可能对筹资、治理或申诉渠道有不同看法。页面不根据坐标判定某种政策必然有效，也不从一个题组推断你对未询问议题的立场。NA用于保留不能在这两项之间选择的情况，不要求为得到图点而猜答。",
        "en": "Separate a goal, its policy instrument and implementation conditions. People can share an access goal while differing over finance, governance or appeal routes. A coordinate does not demonstrate a policy’s effectiveness or establish views on unasked issues. NA preserves cases where these two alternatives cannot be chosen between; guessing is not required to obtain a plotted point."
      }
    ]
  },
  {
    "id": "political-raw-arithmetic",
    "title": {
      "zh": "坐标怎样复算？每轴18项、原始差值与步长二",
      "en": "How do you recalculate coordinates? Eighteen choices, raw differences and steps of two"
    },
    "paragraphs": [
      {
        "zh": "某轴18项全部有效后，经济x＝右向次数减左向次数，社会y＝个人自由优先次数减共同体优先次数。每轴两端次数之和为18，差值范围−18至+18，按二递增；没有归一化、隐藏权重或百分位转换。正负只是绘图方向，不是结果好坏。",
        "en": "With all eighteen choices valid on an axis, economic x is right minus left, and social y is liberal minus communitarian. Endpoint counts total eighteen, producing differences from minus eighteen to plus eighteen in steps of two. There is no normalisation, hidden weighting or percentile conversion. Signs specify drawing directions, not better or worse results."
      },
      {
        "zh": "另一个算例：经济左向13次、右向5次，x＝5−13＝−8；共同体优先4次、个人自由优先14次，y＝14−4＝+10，组合点为（−8，+10）。把一项经济左向选择改为右向后，次数为12与6，x变为−6，y不变。差值变化二来自两端次数同时变化，不表示政治观点改变了某个经验证的心理距离。",
        "en": "Another example has thirteen left and five right choices, giving x = 5 − 13 = −8. Four communitarian and fourteen liberal choices give y = 14 − 4 = +10: the point is (−8, +10). Changing one economic choice from left to right yields twelve left and six right, moving x to −6 while y stays unchanged. The two-step difference follows from changing both counts, not a validated psychological distance of political change."
      }
    ]
  },
  {
    "id": "political-zero-and-na",
    "title": {
      "zh": "零值与NA不同：边界读法、资料不足与组合点",
      "en": "Zero differs from NA: boundary readings, uncertainty and the combined point"
    },
    "paragraphs": [
      {
        "zh": "9比9是完整作答中的有效零值，不说明没有观点、人口平均或必然温和。一轴为零时保留该边界两份相邻组合指南；两轴都为零时保留四份。靠近零点的小次数差也不自动成为固定类型；两份答卷即使坐标相同，也可能在具体议题上选择不同。",
        "en": "Nine to nine is a valid zero from complete choices, not evidence of having no views, being average in a population or necessarily being moderate. One zero axis retains its two adjacent comparisons; two zero axes retain all four. Small differences near zero do not create a fixed type, and identical coordinates can contain different issue selections."
      },
      {
        "zh": "任一NA使所属轴不显示个人两端次数和差值，仍显示有效题数；另一完整轴可单独阅读。两轴都完整才画组合点或列出对应组合。全部选NA可以完成，但不生成个人坐标，四份全文仍开放。未选答案则是尚未完成，不自动变成NA、零或中间立场。",
        "en": "Any NA withholds its axis’s personal endpoint counts and difference while showing the valid count; another complete axis remains readable. Both axes must be complete for a point or corresponding comparison list. All-NA can finish without personal coordinates while all full guides stay available. An unselected item remains incomplete rather than automatically becoming NA, zero or a middle position."
      }
    ]
  },
  {
    "id": "political-measurement-evidence",
    "title": {
      "zh": "怎样判断科学性？区分概念、计分与测量证据",
      "en": "How should scientific evidence be assessed? Separate concepts, arithmetic and validation"
    },
    "paragraphs": [
      {
        "zh": "Everett于2013年提出的SECS研究采用社会与经济保守主义题项，验证分析包含291名美国受访者，使用议题感受评分而非本页的方案比较。作者明确讨论时间、地区和题项含义的限制。它说明研究需核对具体对象和样本，不能把“两轴”这个共同形式当作问卷之间的等价或验证转移。[4]",
        "en": "Everett’s 2013 SECS study analysed social and economic conservatism with 291 American respondents, using issue-feeling ratings rather than this page’s proposal comparisons. The paper discusses limits of context, time and item meaning. A shared two-axis format therefore establishes neither equivalence between instruments nor a transfer of validation. [4]"
      },
      {
        "zh": "本原创题本尚无重测信度、结构效度、人群常模或跨语言等价验证。透明计数有助复算，但不能证明两轴穷尽政治观点或在统计上独立。Pew的方法说明也强调，提问方式、给出的选项和顺序都可能影响回答；本页等权、交替排列两端选项，不代表这些影响已经被消除。[5]",
        "en": "This original bank has no established test–retest reliability, structural validity, population norms or cross-language equivalence. Transparent counting does not show that two axes exhaust political beliefs or are statistically independent. Pew’s methodology explains that wording, offered options and order can influence responses. Equal weighting and alternating endpoint order here do not demonstrate that those effects have been eliminated. [5]"
      }
    ]
  },
  {
    "id": "political-complete-readings",
    "title": {
      "zh": "四份完整指南：组合比较、算例与具体条件",
      "en": "Four full guides: combinations, examples and specific conditions"
    },
    "paragraphs": [
      {
        "zh": "四份指南分别讨论经济左向或右向，与共同体或个人自由优先的搭配；每份有八节，合计32节。内容包括两轴区别、具体政策工具、算例、零值与NA、反例、取舍条件、私人思考和来源范围。全部始终可读，不按某个结果锁住，也不把一份通用解释当成私人答卷。",
        "en": "Four guides compare economic-left or economic-right selections alongside communitarian or liberal selections. Each contains eight sections, thirty-two in total: axis distinctions, instruments, arithmetic, zero and NA, counterexamples, tradeoffs, private reflection and source scope. Every guide remains readable without a score gate, and general explanations are not presented as private answer records."
      },
      {
        "zh": "若想进一步理解一道难题，可在私人笔记里写出自己支持的目标、担心的执行条件以及一个题中未给出的方案，再与相邻指南比较。相同次数可能有不同理由，不必让别人接受你的坐标，也不需要因此选择政党或政治活动。这里的下一步是检查自己的理解，不是按分数组织政治说服。",
        "en": "To examine a difficult item, privately note the goal you support, an implementation concern and an alternative not offered in the question, then compare a neighbouring guide. Equal counts can have different reasons. Nobody needs to accept your coordinate or choose a party or political activity because of it. This exercise examines understanding rather than organising score-based political persuasion."
      }
    ]
  },
  {
    "id": "political-language-and-privacy",
    "title": {
      "zh": "中英文与重测怎样比较？保留版本和私人回答",
      "en": "How should languages and repeat attempts be compared? Keep edition and answers clear"
    },
    "paragraphs": [
      {
        "zh": "本页中英文使用同一题目身份、方向键与计数规则；文字齐全并不等于测量等价。Pew介绍的跨国问卷工作还包含专业翻译、多轮复核以及语境与意义可比性的处理。本页没有据此获得该机构背书，仍需针对自己的语言版本补充研究；其他政治测试的数值不能直接代入本图。[6]",
        "en": "Both languages use the same item identities, direction keys and count rule; complete wording does not establish measurement equivalence. Pew describes professional translation, repeated review and attention to comparable meaning and context in cross-national surveys. That does not endorse this page, whose own language editions still require study. Coordinates from another quiz cannot be inserted into this chart. [6]"
      },
      {
        "zh": "重新作答时，先核对版本、题目理解和想到的条件，再看哪些方案改变；差值变化不自动证明整套政治身份变化。答案在当前浏览器计算，主动保存才在本标签页暂存24小时，完成或重测清除。公开分享只有标题和链接，不含私人坐标或回答；页面不要求姓名、身份、政党资料或定向政治信息。",
        "en": "For a repeat attempt, check the edition, interpretation and assumed conditions before examining changed selections; a different raw difference does not establish a transformed political identity. Answers are calculated in the browser. Opted-in progress stays in this tab for twenty-four hours and clears on completion or retake. Public sharing contains only a title and link, without private coordinates or answers; no name, identity, party data or targeted political message is required."
      }
    ]
  }
];

export const politicalCoordinatesLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "本页与Political Compass、8values或SECS能互相换算吗？",
      "en": "Can results be converted to Political Compass, 8values or SECS?"
    },
    "answer": {
      "zh": "不能。它们的轴定义、题项、选项、加权和显示方法可能不同。本版是36项原创方案比较与原始差值，不使用其他测试的题库或常模。",
      "en": "No. Axis definitions, items, response options, weights and displays can differ. This edition uses thirty-six original proposal comparisons and raw differences, without importing another bank or norms."
    }
  },
  {
    "question": {
      "zh": "共同体优先就是威权主义吗？",
      "en": "Does communitarian mean authoritarian?"
    },
    "answer": {
      "zh": "不是本页的定义。它比较共同公民目的、义务和延续与自愿参与、个人公民自由，不据此测量服从、强制程度或政体属性。",
      "en": "Not as defined here. It compares shared civic purposes, obligations and continuity with voluntary participation and individual civic freedom, without measuring obedience, coercion or regime attributes."
    }
  },
  {
    "question": {
      "zh": "为什么一次改答让坐标变化二？",
      "en": "Why does one changed choice move a coordinate by two?"
    },
    "answer": {
      "zh": "同轴从一端改到另一端时，原侧减一次、新侧加一次，正向次数减负向次数因此变化二。它不是隐藏权重，也不是两倍重要。",
      "en": "Moving a choice between endpoints subtracts one from the original count and adds one to the other, changing positive minus negative by two. It is neither a hidden weight nor doubled importance."
    }
  },
  {
    "question": {
      "zh": "零坐标会给我“中立型”吗？",
      "en": "Does zero assign a neutral type?"
    },
    "answer": {
      "zh": "不会。每轴9比9表示两侧次数相等；一轴零保留两份相邻比较，双零保留四份。零不证明温和、冷漠或人口平均。",
      "en": "No. Nine to nine means equal endpoint counts. One zero retains two adjacent comparisons, and two zero axes retain all four. Zero proves neither moderation, indifference nor a population average."
    }
  },
  {
    "question": {
      "zh": "18题中只有一题NA，还能算那条轴吗？",
      "en": "Can an axis be scored with only one NA among eighteen items?"
    },
    "answer": {
      "zh": "本版不能。该轴保留有效题数但不显示个人两端次数与差值；另一完整轴仍可读，两轴完整前不画组合点。",
      "en": "Not in this edition. Its valid count remains visible but personal endpoint counts and difference are withheld. Another complete axis remains readable; a point waits for both axes to be complete."
    }
  },
  {
    "question": {
      "zh": "这是政治知识考试或现行法律说明吗？",
      "en": "Is this a political-knowledge exam or a statement of current law?"
    },
    "answer": {
      "zh": "不是。每题是有限的假设方案取舍，没有正确答案，不考知识，也不保证方案合法、正在实施或会产生题目未说明的效果。",
      "en": "No. Items compare limited hypothetical proposals without correct answers, testing knowledge or establishing that a proposal is lawful, in operation or guaranteed to produce an unstated outcome."
    }
  },
  {
    "question": {
      "zh": "同一坐标的人是不是观点完全相同？",
      "en": "Do people with identical coordinates hold identical views?"
    },
    "answer": {
      "zh": "不能这样推断。相同两端次数可能来自不同具体选项，次数也未记录议题重要性和理由。需回到逐题内容，不用图上距离推算人际相似度。",
      "en": "No. Equal endpoint counts can come from different item selections, and counts do not retain issue importance or reasons. Return to the items rather than infer interpersonal similarity from chart distance."
    }
  },
  {
    "question": {
      "zh": "开始前需要额外同意，结果会公开吗？",
      "en": "Is extra confirmation required, and will my point be public?"
    },
    "answer": {
      "zh": "点击开始直接进入第一题。保存进度自愿，完成或重测清除；公开链接只包含测试或指南，不包含私人坐标、答案或定向信息。",
      "en": "Start opens the first question directly. Progress saving is optional and clears on completion or retake. Public links contain a test or guide, without private coordinates, answers or targeted messages."
    }
  }
];

export const politicalCoordinatesLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Everett（2013）：社会与经济保守主义量表原研究，仅作测量方法对照",
      "en": "Everett (2013): original SECS study; measurement-method comparison only"
    },
    "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0082131"
  },
  {
    "title": {
      "zh": "Pew Research Center：问卷题目、选项与顺序的设计",
      "en": "Pew Research Center: writing survey questions, options and ordering"
    },
    "url": "https://www.pewresearch.org/writing-survey-questions/"
  },
  {
    "title": {
      "zh": "Pew Research Center：跨语言问卷设计与翻译",
      "en": "Pew Research Center: questionnaire design and translation"
    },
    "url": "https://www.pewresearch.org/questionnaire-design-and-translation/"
  }
];
