import type { Questionnaire } from "@/lib/questionnaires/types";
export const bpi21Sections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "BPI-21 dosha reflection: a published questionnaire, three choice records",
      "zh": "BPI-21 Dosha话题自评：发表题本与三项选择记录"
    },
    "paragraphs": [
      {
        "en": "The Brief Prakriti Inventory (BPI-21) is a self-report questionnaire developed in an Ayurvedic research context. This edition presents all 21 published English items with FermatMind’s working Chinese translation. Vata, Pitta and Kapha identify the three source option columns; they are not levels of a single rating scale. [1]",
        "zh": "简明Prakriti问卷（BPI-21）是在阿育吠陀研究背景下开发的自报问卷。本版呈现全部21项发表英文及费马工作中译。Vata、Pitta、Kapha标识来源选项的三列，不是同一评价量表上由低到高的等级。[1]"
      },
      {
        "en": "The website shows the three mapped-choice counts together when all items are scored. It also offers three complete cultural readings without answering. The added unscored option, Chinese wording, digital interface and explanatory guides are identified separately from the source instrument.",
        "zh": "每题都计分时，网站同时呈现三个映射选择计数；无需答题也可阅读三篇完整文化说明。新增未评分选项、中文措辞、数字界面和解释指南，与来源工具分别说明。"
      }
    ]
  },
  {
    "id": "terms",
    "title": {
      "en": "Prakriti, dosha and the scope of this reading",
      "zh": "Prakriti、dosha与本页读法的范围"
    },
    "paragraphs": [
      {
        "en": "In the traditional Ayurvedic vocabulary, Prakriti concerns a person’s constitution and dosha refers to Vata, Pitta and Kapha. Traditional accounts associate these with movement, transformation and structure. Such vocabulary supplies a cultural context for the questionnaire; selecting a description does not establish a biological quantity. [4]",
        "zh": "在阿育吠陀传统词语中，Prakriti涉及个人体质，dosha指Vata、Pitta和Kapha；传统解释分别关联运动、转化与结构。这些词语为问卷提供文化背景，选中一个描述不建立生物含量测量。[4]"
      },
      {
        "en": "Read each title as a guide to a source column, not an identity assigned to you. This website does not infer your birth constitution, current imbalance (vikriti), disease susceptibility or a required balance between the columns. The three cultural guides remain available together.",
        "zh": "把每个标题读作来源一列的说明，不是分配给你的身份。本网站不推断出生体质、当前失衡（vikriti）、疾病易感性或三列应达到的平衡；三篇文化指南同时开放。"
      }
    ]
  },
  {
    "id": "topics",
    "title": {
      "en": "What the 21 items ask about",
      "zh": "21项分别涉及什么"
    },
    "paragraphs": [
      {
        "en": "The bank includes familiar bodily descriptions such as skin and hair, movement and endurance, appetite, thirst, sweating, sleep and temperature preference. Other items concern memory, starting work, emotional responses, speech and competition. Bowel habits, weight change and taste preference also appear in the source wording.",
        "zh": "题本包括皮肤与头发、动作与耐力、食欲、口渴、出汗、睡眠及温度偏好等熟悉的身体描述，也涉及记忆、开始做事、情绪反应、说话与竞争；排便习惯、体重变化及口味偏好同样出现在来源措辞中。"
      },
      {
        "en": "Use experiences you already know, without examining your body, testing endurance, changing meals or withholding fluids or sleep. Some alternatives combine several phrases; choose the closest overall description only if you can judge it comfortably. An unclear, inapplicable or private item can remain unscored.",
        "zh": "使用已经熟悉的体验，不需要检查身体、测试耐力、改变餐食或限制饮水与睡眠。有些选项合并多个说法；能自在判断时才选整体较接近的一项。不清楚、不适用或涉及隐私的题目，可以未评分。"
      }
    ]
  },
  {
    "id": "arithmetic",
    "title": {
      "en": "How raw counts become choice percentages",
      "zh": "原始计数如何变为选择占比"
    },
    "paragraphs": [
      {
        "en": "Each scored response adds one to exactly one column. With 21 scored responses, the three counts sum to 21. The website calculates count ÷ 21 × 100 and rounds each share to one decimal. For example, counts of 9, 7 and 5 produce 42.9%, 33.3% and 23.8%.",
        "zh": "每个计分回答只给一列加一。21题都计分时，三项计数合计21。网站按“计数÷21×100”计算，各自保留一位小数。例如9、7、5次分别得到42.9%、33.3%、23.8%。"
      },
      {
        "en": "Seven choices in each column display 33.3% each; their rounded sum is 99.9%. That is rounding, not missing data. A larger share means more selections from that column within this bank. It is not a percentile, a bodily concentration or a probability that a health outcome will occur.",
        "zh": "三列各选7次，都显示33.3%，取整后合计99.9%；这是舍入，不是缺失资料。占比较大，只表示本题本中该列选择更多，不是人群百分位、身体浓度或健康结果发生概率。"
      }
    ]
  },
  {
    "id": "unscored",
    "title": {
      "en": "An unscored response does not become zero",
      "zh": "未评分不会变成零分"
    },
    "paragraphs": [
      {
        "en": "All 21 items need a response, and the separate unscored option counts as a response. If even one item is unscored, the attempt can finish but every personal count and percentage is withheld. Twenty scored items are not divided by twenty, and an omitted choice is not silently assigned to any column.",
        "zh": "21项都需要选择，单独的未评分也算一个回答。只要有一项未评分，本次仍可完成，但不显示任何个人计数或百分比；不会把20项改除以20，也不会把略过的选择悄悄分给某列。"
      },
      {
        "en": "Choosing Vata zero times in an entirely scored attempt differs from having insufficient information. The former is a count within 21 choices; the latter does not support displaying the three numbers. Neither outcome blocks any of the three complete guides or requires you to disclose more.",
        "zh": "全部计分时Vata选中零次，与资料不足不同：前者是21次选择中的计数，后者不支持展示三个数字。两种情况都不阻止阅读三篇全文，也不要求补充更多隐私。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "What the source research supports, and what remains untested",
      "zh": "来源研究提供什么证据，还有哪些未检验"
    },
    "paragraphs": [
      {
        "en": "The version-two paper studied English-reading adults aged 18–65 in an Indian community sample of 1,857. It examined categorical structure, reliability and relationships with other assessments. The authors also identify limits: no objective gold standard, lower precision for mixed or balanced classifications, and untested prediction of health and clinical outcomes. These are findings and limits of that study. [1]",
        "zh": "论文第二版研究印度社区中能阅读英文的18至65岁成年人，共1,857人，考察类别结构、信度及与其他评估的关系。作者也说明限制：缺少客观金标准，混合或平衡分类精度较低，健康与临床结果预测尚未检验。这些是该研究的发现与边界。[1]"
      },
      {
        "en": "The website reports raw counts and choice shares rather than implementing the paper’s classification or latent-model estimates. Its working Chinese, unscored extension and browser presentation have not completed their own validation. Reproducing English items and arithmetic does not establish equivalent results across languages, platforms or populations.",
        "zh": "网站报告原始计数与选择占比，不实施论文的分类或潜在模型估计。工作中译、未评分扩展与浏览器呈现尚未完成自己的验证；复现英文题项和算术，不建立语言、平台或人群之间的结果等值。"
      }
    ]
  },
  {
    "id": "interpretation",
    "title": {
      "en": "Read examples without turning them into a type",
      "zh": "用实例阅读，不把计数转成类型"
    },
    "paragraphs": [
      {
        "en": "A person may recognise a Vata-linked description of starting new tasks, a Pitta-linked description in another situation and a Kapha-linked account of retaining information. Choosing one alternative compresses those experiences into one response. It does not show why an experience occurred or whether every phrase in that alternative fits.",
        "zh": "一个人可能认同Vata列里开始新任务的描述，在另一个场景认同Pitta列，又认同Kapha列里保留信息的说法。每题选一项，会把这些体验压缩为一个回答，不说明体验为何发生，也不表示该选项每句话都符合。"
      },
      {
        "en": "Check a familiar example and a counterexample when reading a guide. Equal counts remain equal, without a hidden winner; unequal counts do not assign a single, dual or Sama constitution here. Results from other dosha quizzes, four-element stories, MBTI or Big Five cannot be converted into these three counts.",
        "zh": "阅读时可以核对一个熟悉例子和一个反例。同分照实保留，没有隐藏胜出者；不同分也不在这里分配单一、双dosha或Sama体质。其他dosha测验、四元素故事、MBTI或大五结果，都不能换算成本页三个计数。"
      }
    ]
  },
  {
    "id": "privacy-care",
    "title": {
      "en": "Private reflection, attribution and health decisions",
      "zh": "私下回顾、来源署名与健康决定"
    },
    "paragraphs": [
      {
        "en": "Answers remain in the current page’s memory. No draft is saved and no personal-result link is created; refreshing or navigating to the other language starts a new attempt. The source alternatives are shuffled at Start while their keys stay unchanged, and the website’s unscored choice stays last. Full public guides contain no visitor answers.",
        "zh": "回答留在当前页面内存，不保存草稿，也不生成个人结果链接；刷新或换语言会开始新一轮。点击开始时，来源三个选项打乱顺序，计分键不变，网站新增未评分始终放最后。公开完整指南不含访客回答。"
      },
      {
        "en": "This record supplies no diet, supplement or treatment prescription. NCCIH notes limits in evidence for Ayurvedic treatments and safety concerns with some preparations. Do not use a quiz to explain away new or persistent health changes, replace qualified assessment or delay care. The published English source is credited below under CC BY 4.0; translation and website additions are identified. [2][3]",
        "zh": "这份记录不提供饮食、补充剂或治疗处方。NCCIH指出阿育吠陀疗法的证据限制及部分制剂的安全问题；不要用测验解释掉新出现或持续的健康变化、替代专业评估或延迟就医。下方按CC BY 4.0保留发表英文署名，并标明译文与网站新增。[2][3]"
      }
    ]
  }
];
export const bpi21Faq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What does a dosha percentage mean here?",
      "zh": "这里的dosha百分比是什么？"
    },
    "answer": {
      "en": "It is the share of 21 scored choices mapped to one source column. Nine of 21 is 42.9%; it does not measure a bodily substance or a health probability.",
      "zh": "是21个计分选择中对应来源一列的占比，9次除以21为42.9%；不测身体物质含量或健康概率。"
    }
  },
  {
    "question": {
      "en": "Can I finish without personal numbers?",
      "zh": "可以完成但不生成个人数字吗？"
    },
    "answer": {
      "en": "Yes. Select unscored for any unclear, inapplicable or declined item and respond to all 21 items. All personal numbers are withheld, but the three complete guides remain available.",
      "zh": "可以。不清楚、不适用或不愿回答可选未评分；21项均有选择即可完成。个人数值全部不显示，三篇全文仍开放。"
    }
  },
  {
    "question": {
      "en": "Why do equal shares sum to 99.9%?",
      "zh": "为什么均等占比合计99.9%？"
    },
    "answer": {
      "en": "Seven choices per column give 33.3% each after rounding. The raw counts still sum to 21; no additional category or missing response is implied.",
      "zh": "每列7次，各自舍入为33.3%。原始计数仍合计21，不表示多了类别或缺了回答。"
    }
  },
  {
    "question": {
      "en": "Does the website assign a mixed or balanced constitution?",
      "zh": "网站会分配混合或平衡体质吗？"
    },
    "answer": {
      "en": "No. It shows the three counts together without a highest type, dual-dosha or Sama assignment. A tie remains a tie and does not establish physiological balance.",
      "zh": "不会。三项计数同时呈现，不派最高类型、双dosha或Sama体质；同分保留，也不确立生理平衡。"
    }
  },
  {
    "question": {
      "en": "Is the Chinese a validated published version?",
      "zh": "中文是经过验证的发表版本吗？"
    },
    "answer": {
      "en": "Chinese is FermatMind’s working translation. The English source, the translation and the website additions are distinguished; cross-language equivalence has not been established for this edition.",
      "zh": "中文为费马工作译文。英文来源、译文和网站新增分别标明，本版尚未建立跨语言等值。"
    }
  },
  {
    "question": {
      "en": "Should I inspect my body before answering?",
      "zh": "作答前需要检查身体吗？"
    },
    "answer": {
      "en": "No. Use familiar usual experiences only. You need not inspect, measure or test anything, change routines or disclose an uncertain bodily detail. Unscored remains an available response.",
      "zh": "不需要。仅使用熟悉的通常体验，不必检查、测量、测试、改变习惯或披露不确定的身体细节；可以选未评分。"
    }
  },
  {
    "question": {
      "en": "Can I use this record to choose food or herbs?",
      "zh": "可以用记录选择食物或草药吗？"
    },
    "answer": {
      "en": "This page provides cultural explanation, not a prescription. Choice shares do not establish the effectiveness, suitability or safety of a diet, herb, supplement or treatment.",
      "zh": "本页提供文化解释，不提供处方。选择占比不确立饮食、草药、补充剂或治疗的效果、适用性与安全性。"
    }
  },
  {
    "question": {
      "en": "Do longer or different dosha quizzes give equivalent results?",
      "zh": "其他题量的dosha测验结果等价吗？"
    },
    "answer": {
      "en": "Different item banks, response options and classification rules are different instruments. The BPI-21 count record cannot be substituted for a clinical interview, another quiz or a score on a general personality test.",
      "zh": "题本、选项与分类规则不同，就属于不同工具。BPI-21计数记录不能代替临床访谈、其他测验或一般人格测试的分数。"
    }
  }
];
