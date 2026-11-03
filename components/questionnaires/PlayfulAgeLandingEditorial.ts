import type { Questionnaire } from "@/lib/questionnaires/types";
export const playfulAgeLandingSections: Questionnaire["guide"] = [
  {
    "id": "playful-age-scope",
    "title": {
      "en": "Mental Age Test: a playful number from everyday preferences",
      "zh": "心理年龄测试：从日常偏好生成娱乐数字"
    },
    "paragraphs": [
      {
        "en": "This original twelve-question game asks what sounds appealing in low-stakes situations: a free hour, music, an activity, a casual project, reading, a walk, a display, a puzzle, a catch-up, a notebook, an exhibition and an evening. The options move between trying something new and keeping a familiar form. Choose what you would enjoy now, not what sounds more adult.",
        "zh": "这份原创十二题游戏询问轻松情境中什么更有吸引力：空闲一小时、音乐、活动、小项目、阅读、散步、陈列、谜题、相聚、笔记本、展览和晚间安排。选项在尝新与保持熟悉形式之间展开，选此刻想享受的做法，而非听起来更成人的选项。"
      },
      {
        "en": "The output is an entertainment convention. It does not estimate your chronological age, intellectual development, emotional maturity or brain function. No birth date, real age or age comparison is needed. All possible numbers use the same complete guide because changing the number does not establish a different kind of person.",
        "zh": "输出是娱乐约定，不估计实际年龄、智力发展、情绪成熟度或脑功能。无需生日、真实年龄或年龄差比较。所有可能数字使用同一篇完整指南，因为数字变化并不确立另一类人。"
      }
    ]
  },
  {
    "id": "playful-age-situations",
    "title": {
      "en": "Read the conditions of each situation",
      "zh": "先看清每个情境的条件"
    },
    "paragraphs": [
      {
        "en": "Several questions hold practical constraints steady: equal time and cost, free and accessible activities, equally safe walking routes or obligations already covered. These conditions help focus the choice on the offered preference. They do not show that such choices are equally accessible in your real life.",
        "zh": "多道题把现实约束暂时固定，例如时间花费相同、活动免费可达、散步路线同样安全，或实际责任已经安排妥当。这些条件帮助把选择集中在所给偏好，不表示现实生活中所有选项都同样可达。"
      },
      {
        "en": "A preference for a familiar walk could reflect wanting a known route in this imagined scene. It cannot establish caution, fatigue, disability, finances or an older mind. If the premise does not fit, you can stop without a personal number and read the full guide. There is no requirement to invent an experience.",
        "zh": "在想象情境里喜欢熟悉路线，只能说明此刻愿意选已知路径，不能据此确定谨慎、疲劳、残障、经济条件或心智更老。若前提不合适，可以无个人数字退出并阅读完整指南，不要求编造经历。"
      }
    ]
  },
  {
    "id": "playful-age-formula",
    "title": {
      "en": "The complete formula: 18 plus twice the point sum",
      "zh": "完整公式：18加点数之和的两倍"
    },
    "paragraphs": [
      {
        "en": "Each option carries 0, 1, 2 or 3 points, from a fully new or open choice toward keeping a familiar form. Add all twelve values as S, then calculate 18 + 2 × S. S can be any integer from 0 to 36, giving all 37 even numbers from 18 to 90. There are no hidden weights, bonuses or age-specific adjustments.",
        "zh": "每题选项计0、1、2或3点，从完全尝新或开放选择到保持熟悉形式。十二项相加为S，再计算18＋2×S。S可为0至36的任一整数，对应18至90的37个偶数。没有隐藏权重、奖励点或按年龄调整。"
      },
      {
        "en": "The starting value 18 and two-unit step are arbitrary editorial choices, not findings about human development. One extra point always adds two to the displayed number; that arithmetic sensitivity is not two years of psychological change. An odd number such as 55 cannot be produced by this edition.",
        "zh": "起点18与步长2是任意编辑选择，不是人类发展的研究结论。多一点就让显示数字加2，这种算术变化不等于两年的心理变化。本版不能产生55等奇数。"
      }
    ]
  },
  {
    "id": "playful-age-examples",
    "title": {
      "en": "Worked examples: 18, 54 and 90 without age stereotypes",
      "zh": "算例：18、54和90，不附会年龄刻板印象"
    },
    "paragraphs": [
      {
        "en": "Twelve zero-point choices give S = 0 and 18. Twelve three-point choices give S = 36 and 90. Three repetitions of 0, 1, 2, 3 give S = 18 and 54. These describe where the chosen options sit in this game’s novelty–familiarity convention, not the habits of real people aged 18, 54 or 90.",
        "zh": "十二个0点得S＝0、结果18；十二个3点得S＝36、结果90；0、1、2、3重复三次，得S＝18、结果54。这些只描述所选选项在本游戏新鲜—熟悉约定中的位置，不代表18岁、54岁或90岁真人的习惯。"
      },
      {
        "en": "Six zeros and six threes also total 18 and produce 54, although the individual choices differ from the repeated sequence. The number loses that detail. Use the item-by-item points to revisit what appealed in each scene; a result near the middle is not proof of balance, adaptability or a more accurate age.",
        "zh": "六个0与六个3也合计18、结果54，但逐项选择与重复序列不同，单个数字丢失了这些细节。可以通过逐题点数回看各情境喜欢什么；接近中间不证明平衡、适应力或年龄更准确。"
      }
    ]
  },
  {
    "id": "playful-age-concepts",
    "title": {
      "en": "Playful age and subjective age answer different questions",
      "zh": "娱乐年龄与主观年龄回答不同问题"
    },
    "paragraphs": [
      {
        "en": "Research on subjective age may ask people directly how old they feel, rather than derive an age from leisure preferences. Rubin and Berntsen’s study used comparative and felt-age questions in a Danish adult sample. [1] Its research variable is different from this game’s formula-generated number.",
        "zh": "主观年龄研究可以直接询问人感觉自己多少岁，而非从休闲偏好推导年龄。Rubin与Berntsen的研究在丹麦成人样本中使用年龄比较与感受年龄问题。[1] 这种研究变量与本游戏按公式生成的数字不同。"
      },
      {
        "en": "This page asks neither your felt age nor a set of standardized developmental tasks. It does not measure cognitive age or biological aging. A shared term in a search query does not make tools interchangeable, and external findings about subjective age cannot validate this twelve-question game or support health predictions from its number.",
        "zh": "本页既不询问你感觉自己多少岁，也不施测一组标准化发展任务；不测认知年龄或生物衰老。搜索词相同不代表工具可互换，主观年龄的外部研究不能验证这十二题游戏，也不能支持从娱乐数字预测健康。"
      }
    ]
  },
  {
    "id": "playful-age-comparison",
    "title": {
      "en": "Compare choices, not generations or maturity",
      "zh": "比较具体选择，不比较世代或成熟程度"
    },
    "paragraphs": [
      {
        "en": "You and a friend can enjoy different music or notebook plans without one being more developed. One person may choose novelty for a puzzle and familiarity for a catch-up. Do not turn the total into an old-soul identity, a childishness score or a basis for deciding how someone should behave.",
        "zh": "你和朋友可以喜欢不同音乐或笔记本用法，不意味着谁发展更好。同一人可以在谜题上喜欢尝新，在相聚上喜欢熟悉。不要把总数变成老灵魂身份、幼稚分数，或决定别人应怎样行动的依据。"
      },
      {
        "en": "Comparisons across websites are especially limited: other quizzes use different questions, point ranges, age bounds and labels. Even identical displayed ages do not have a shared scale. This edition supplies no population percentile, developmental norm or rule for matching friends or partners.",
        "zh": "跨网站比较尤其有限：其他问卷的题目、点数、年龄范围和标签不同，即使显示相同年龄也不共享尺度。本版没有人群百分位、发展常模，或用于朋友与伴侣配对的规则。"
      }
    ]
  },
  {
    "id": "playful-age-optional",
    "title": {
      "en": "An optional observation about a real preference",
      "zh": "可选：观察一项真实偏好"
    },
    "paragraphs": [
      {
        "en": "If useful, pick a low-stakes choice you already have, such as whether to reread a short text or try a new one. Notice what attracts you today and whether it differs in another situation. You need not change the choice to make the displayed age younger or older.",
        "zh": "若有用，可以选一项已经面临的轻松选择，例如重读一篇短文还是试一篇新的，留意今天什么更吸引你，以及换个情境是否不同。不必为了让显示年龄更年轻或更年长而改变选择。"
      },
      {
        "en": "This is a voluntary observation, not a training exercise with a promised effect. No purchase, risky activity or disclosure is needed. A later answer may change with interest, context or interpretation; without measurement evidence the page cannot quantify personal growth from that change.",
        "zh": "这是自愿观察，不是承诺效果的训练；无需购物、冒险活动或公开经历。之后的回答可能随兴趣、情境或理解变化，没有测量证据时，页面不能从这种变化量化个人成长。"
      }
    ]
  },
  {
    "id": "playful-age-privacy",
    "title": {
      "en": "Complete access and transparent limits",
      "zh": "完整阅读与透明的使用范围"
    },
    "paragraphs": [
      {
        "en": "Every question needs one valid choice before the result appears. There is no scored skip option or partial age; if no option fits, leave and read the public guide. Your result lists all twelve choices and points so the calculation can be checked. Reproducible arithmetic establishes how the number was generated, not whether it measures age.",
        "zh": "每题需一个有效选择，才显示结果；没有计分跳过选项或部分年龄，不合适时可退出并读公开指南。结果列出全部十二项选择及点数，便于复算。可复算说明数字怎样产生，不证明它测量了年龄。"
      },
      {
        "en": "Answers are calculated in the browser. Optional tab-session drafts expire after 24 hours and clear on completion, retake or exit-and-clear. The copy action shares a general guide label and public link without your answers, point sum or playful age. No psychometric validation, age calibration or cross-language equivalence has been established for this original edition.",
        "zh": "答案在浏览器计算。可选标签页会话草稿24小时后失效，完成、重测或退出清除即删除。复制仅分享通用指南名称与公开链接，不含回答、点数之和或娱乐年龄。本原创版本尚未建立心理测量验证、年龄校准或跨语言等值。"
      }
    ]
  }
];
export const playfulAgeLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Why do all possible ages use one guide?",
      "zh": "为什么所有年龄都用同一篇指南？"
    },
    "answer": {
      "en": "The number is a continuous editorial transformation of one point sum, not evidence for age-based personality categories. The same full guide explains the entire range.",
      "zh": "数字是单个点数和的连续编辑变换，不是按年龄划分人格的证据；同一篇完整指南解释整个范围。"
    }
  },
  {
    "question": {
      "en": "Can this edition give an odd age?",
      "zh": "本版能给出奇数年龄吗？"
    },
    "answer": {
      "en": "No. An integer point sum is doubled and added to 18, so only even outputs from 18 to 90 are possible.",
      "zh": "不能。整数点数和乘2后加18，因此只产生18至90的偶数。"
    }
  },
  {
    "question": {
      "en": "Does changing one answer mean I aged two years?",
      "zh": "改一题是否表示我老了两岁？"
    },
    "answer": {
      "en": "No. A one-point difference changes the displayed number by two because of the formula. It is not elapsed time or measured psychological change.",
      "zh": "不表示。相差一点会因公式让数字变化2，不是时间流逝或经过测量的心理变化。"
    }
  },
  {
    "question": {
      "en": "Can two people get 54 from different answers?",
      "zh": "两个人能否用不同回答得到54？"
    },
    "answer": {
      "en": "Yes. Any twelve choices totaling 18 points give 54. Read the individual selections; the same sum can hide different preferences.",
      "zh": "可以。十二项合计18点就得到54，相同总和可以来自不同偏好，应阅读逐项选择。"
    }
  },
  {
    "question": {
      "en": "Is this the same as asking how old I feel?",
      "zh": "这等同于询问我感觉自己多少岁吗？"
    },
    "answer": {
      "en": "No. Felt-age research can use a direct self-report. This game derives a number from twelve preferences and is not calibrated to felt age. [1]",
      "zh": "不等同。感受年龄研究可以直接询问本人；本游戏从十二项偏好推导数字，未与感受年龄标定。[1]"
    }
  },
  {
    "question": {
      "en": "Can I compare the result with another website?",
      "zh": "可以与另一网站的结果直接比较吗？"
    },
    "answer": {
      "en": "Different question banks, formulas and labels lack a shared scale. Equal numbers do not imply equal results, and differences do not establish that one is more accurate.",
      "zh": "不同题本、公式和标签缺少共同尺度；数字相等不表示结果等价，数字不同也不证明哪个更准确。"
    }
  },
  {
    "question": {
      "en": "Do familiar choices mean lower curiosity or energy?",
      "zh": "选择熟悉是否表示好奇心或精力更低？"
    },
    "answer": {
      "en": "No. The game does not measure those traits or explain why a choice appealed. Familiarity in one imagined situation is not a general ability or health judgment.",
      "zh": "不表示。游戏不测量这些特质，也不解释选择原因，一个想象情境中的熟悉偏好不构成总体能力或健康判断。"
    }
  },
  {
    "question": {
      "en": "Can I stop without a number and still read the full explanation?",
      "zh": "可以不生成数字，仍读完整解释吗？"
    },
    "answer": {
      "en": "Yes. The full eight-section public guide is available before answering. An incomplete attempt is not converted to a zero score or an assumed age.",
      "zh": "可以。完整八节公开指南在答题前就能读，未完成作答不会变成零分或猜测年龄。"
    }
  }
];
export const playfulAgeLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Rubin & Berntsen: subjective-age research and direct felt-age questions",
      "zh": "Rubin与Berntsen：主观年龄研究与直接感受年龄问题"
    },
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3969748/"
  }
];
