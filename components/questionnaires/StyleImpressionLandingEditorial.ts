import type { Questionnaire } from "@/lib/questionnaires/types";
export const styleLandingSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "What a whole-look preference test records",
      "zh": "整体造型偏好测试记录什么"
    },
    "paragraphs": [
      {
        "en": "This original form compares imagined outfits: colour relationships, outlines, surface textures and the placement of details. Choose what you would like to try today. The object of comparison is a composed look, so an answer does not describe your face, body, age, gender or personality.",
        "zh": "本原创题本比较想象中的整套穿搭：颜色关系、轮廓、表面质感与细节位置。请选择今天愿意尝试的构思。比较对象是造型组合，因此回答不描述面部、身体、年龄、性别或人格。"
      },
      {
        "en": "Sixteen comparisons each offer four written alternatives. You need no photograph, measurements or new clothes. All eight guides are already public; finishing the form adds a record of your selections, rather than unlocking advice that was hidden behind a result.",
        "zh": "十六次比较每次提供四项文字构思，无需照片、测量或购买新衣。八篇完整指南均已公开；完成题本增加的是本次选择记录，而非解锁事先隐藏的建议。"
      }
    ]
  },
  {
    "id": "elements",
    "title": {
      "en": "Separate the features inside a whole look",
      "zh": "区分整套造型中的设计要素"
    },
    "paragraphs": [
      {
        "en": "USU clothing-design education distinguishes line, shape, texture and colour. Its design-principles material discusses balance, proportion, emphasis and rhythm. These provide vocabulary for describing a composition; they do not validate this questionnaire or establish a universally flattering style. [2][3]",
        "zh": "犹他州立大学的服装设计教育区分线条、形状、质感与颜色，并在设计原则中讨论均衡、比例、重点与节奏。这些概念提供描述组合的词汇，不构成本题本的验证，也不确立普遍适合所有人的风格。[2][3]"
      },
      {
        "en": "For example, a pale palette can appear with either a crisp outline or a flowing detail. A dark fastening can occur on either a coordinated set or a relaxed outfit. If one option appeals, identify the particular feature: choosing the package does not show that you preferred every ingredient separately.",
        "zh": "例如，浅色配色既可搭配利落轮廓，也可搭配流动细节；深色扣饰既可出现在协调套装，也可出现在松弛穿搭。选中某项后，可以指出吸引自己的具体要素；选中整个组合，并不能证明分别喜欢其中每个成分。"
      }
    ]
  },
  {
    "id": "themes",
    "title": {
      "en": "Eight editorial themes, with meaningful contrasts",
      "zh": "八个原创主题及其具体区别"
    },
    "paragraphs": [
      {
        "en": "Soft Play centres gentle playful accents; Light Ease uses a lighter, uncluttered composition. Clean Edge explores clearer angular definition, whereas Flowing Detail explores softer transitions and trailing accents. These are descriptions of offered ideas, not mutually exclusive human types.",
        "zh": "柔软玩心侧重温柔而有趣的点缀，轻快自在侧重轻盈简明的组合；简洁锐线探索清晰、有棱角的界定，柔和点缀探索柔和过渡与延伸细节。这些是题目构思的描述，不是互斥的人群类型。"
      },
      {
        "en": "Quiet Polish and Formal Poise can both involve coordination: the former emphasises restrained finishing, the latter a more deliberately composed ceremonial arrangement. Colour Play draws attention through colour relationships; Relaxed Edge combines ease with rougher or darker accents. Read the exact choices and each full guide rather than inferring rules from a name.",
        "zh": "安静细致与端整仪式都可能涉及协调：前者侧重克制的细节，后者侧重刻意组织的仪式感。跳色玩趣借颜色关系形成重点，松弛锐意将放松轮廓与粗粝或深色点缀组合。应结合具体选项和全文理解，不只凭名称推导穿搭规则。"
      }
    ]
  },
  {
    "id": "counts",
    "title": {
      "en": "How sixteen selections become eight counts",
      "zh": "十六次选择怎样形成八项计数"
    },
    "paragraphs": [
      {
        "en": "Each selection adds one count to its named theme. The eight counts sum to 16. Each theme appears eight times, twice in each of the four option positions; its possible count is therefore 0–8. Equal exposure limits a simple presentation imbalance, but is not evidence of reliability, validity or complete coverage of fashion preferences.",
        "zh": "每次选择为对应主题增加一次，八项次数之和为16。每个主题出现八次，在四个选项位置各出现两次，因此单项范围为0至8。均衡出现减少一种简单的呈现不均，却不等于信度、效度或完整覆盖穿搭偏好的证据。"
      },
      {
        "en": "A result of 3 / 8 means the theme was selected in three of its eight appearances. It is not a 37.5% style identity, match accuracy or population percentile. Choosing one of four offers supplies no rating for themes absent from that comparison, and does not measure how strongly you like the winner.",
        "zh": "3 / 8表示该主题在八次出现中被选中三次，不是37.5%的风格身份、匹配准确率或人群百分位。四选一并未评价当次未出现的主题，也没有测量对选中项的喜爱强度。"
      }
    ]
  },
  {
    "id": "ties",
    "title": {
      "en": "Read every highest tie without inventing a blend",
      "zh": "完整阅读最高并列，不虚构混合比例"
    },
    "paragraphs": [
      {
        "en": "Every theme at the highest count is retained in full. With counts 4, 4, 2, 2, 1, 1, 1, 1, the two themes at four are jointly highest; the remaining counts remain visible. There is no letter-order tie-break, random winner, hidden secondary essence or conversion into a percentage blend.",
        "zh": "若次数为4、4、2、2、1、1、1、1，两个四次主题共同最高，其余次数仍然展示。所有达到最高次数的主题均完整保留，不以字母顺序破同分，不随机选胜者，不产生隐藏副风格或混合百分比。"
      },
      {
        "en": "An eight-way tie is also possible: every theme has two selections, totalling 16. Read all eight guides as comparison material. A tied result does not diagnose indecision, and one extra selection changing the highest set does not prove a stable change in your identity or taste.",
        "zh": "八项并列也可能出现：每个主题两次，合计16次，可将八篇指南一起作为比较材料。并列不说明优柔寡断；多选一次导致最高组合变化，也不能证明身份或审美发生了稳定改变。"
      }
    ]
  },
  {
    "id": "systems",
    "title": {
      "en": "Preference, face analysis and style essence use different methods",
      "zh": "偏好、面部分析与风格精髓的方法不同"
    },
    "paragraphs": [
      {
        "en": "The Japan Face Type Diagnosis Association describes a separate method using facial features, balance and measurements to classify eight types. This form does not perform those observations. Its eight original styling themes cannot be translated into that association’s categories merely because both sets contain eight names. [1]",
        "zh": "日本顔タイプ診断协会介绍的是另一套方法：观察面部特征、平衡关系并进行测量，最终分为八类。本页不进行这些观察；本页八个原创造型主题，不能因数量同为八项就换算成该协会分类。[1]"
      },
      {
        "en": "Likewise, styling systems that interpret natural features or essence blends answer a different question from today’s preferred written outfit. Our form has no validated psychometric scale, norms or cross-system conversion. A reproducible count establishes what the program did, not whether a look suits your appearance or reveals an inner trait.",
        "zh": "同样，解释自然外观或风格精髓混合的造型体系，与今天更喜欢哪种文字穿搭回答不同问题。本题本尚无心理测量验证、常模或跨体系换算。计数可以复算，说明程序怎样整理选择，并不能证明某种造型适合外貌或揭示内在特质。"
      }
    ]
  },
  {
    "id": "practice",
    "title": {
      "en": "Turn a guide into one reversible outfit experiment",
      "zh": "把指南转为一次可调整的穿搭尝试"
    },
    "paragraphs": [
      {
        "en": "Start with an outfit you already use and name one variable: a colour accent, a fastening, a repeated shape or the amount of detail. Keep the other pieces reasonably similar and compare the alternatives in the same setting. This is a practical personal comparison, not a controlled study or a prescribed treatment.",
        "zh": "从已有穿搭出发，只指定一个变量，例如颜色点缀、扣饰、重复形状或细节多少。尽量保持其他单品相近，在同一情境比较不同版本。这是个人实际比较，不是受控研究或规定方案。"
      },
      {
        "en": "Ask what you enjoyed and whether the combination worked for movement, temperature, tactile comfort, budget and the occasion. A liked illustration or description does not settle these requirements. You can borrow one detail, combine guides, decline every suggestion or finish without buying, photographing or sharing anything.",
        "zh": "分别观察自己喜欢什么，以及活动、温度、触感舒适、预算与场合是否合适。喜欢一幅图或一段描述，并不能解决这些实际条件。可以只借用一个细节、组合多篇指南、拒绝全部建议，或不购买、不拍照、不分享而结束。"
      }
    ]
  },
  {
    "id": "privacy",
    "title": {
      "en": "A private attempt and freely accessible guides",
      "zh": "私人作答与自由阅读的完整指南"
    },
    "paragraphs": [
      {
        "en": "The form keeps answers in the current page’s memory, with no saved draft, personal-result sharing or quiz-flow statistics. Refreshing or moving to another language begins a fresh attempt. The public guide links contain theme names, not your selected answers or counts.",
        "zh": "题本回答仅保留在当前页面内存，不保存草稿、不分享个人结果，也不发送测试流程统计。刷新或切换语言后需要重新开始。公开指南链接包含主题名称，不包含个人选项或次数。"
      },
      {
        "en": "All sixteen choices are needed for the count record. When no offered description is useful, leaving is a valid alternative to forcing an answer; the eight full guides remain readable. The independent Outfit Line Preferences form uses five agreement means about garment lines, so its numbers do not replace or combine with these eight relative counts.",
        "zh": "十六次比较全部完成后才生成计数；若给出的描述没有用，可以离开，而不必勉强选择，八篇全文仍可直接阅读。独立的服装线条偏好题本记录五项线条认同均值，其数字不能代替或合并为本页八项相对次数。"
      }
    ]
  }
];
export const styleLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does this test use photographs?",
      "zh": "需要照片吗？"
    },
    "answer": {
      "en": "No. It compares written whole-look ideas. The decorative artwork is not an analysis of your face or body.",
      "zh": "不需要。本页比较文字描述的整体造型，装饰插画不分析面部或身体。"
    }
  },
  {
    "question": {
      "en": "Are these eight scientific personality types?",
      "zh": "这是八种科学人格类型吗？"
    },
    "answer": {
      "en": "No. They are original editorial styling themes. This form has no established norms, psychometric validity or appearance-matching accuracy.",
      "zh": "不是。它们是原创造型主题，本题本尚无常模、心理测量效度或外貌匹配准确率证据。"
    }
  },
  {
    "question": {
      "en": "What does 3 / 8 mean?",
      "zh": "3 / 8是什么意思？"
    },
    "answer": {
      "en": "You selected that theme three times in its eight appearances. It is a count with an exposure denominator, not your percentage of an essence.",
      "zh": "表示该主题在八次出现中被选中三次，是附带出现次数的计数，不是某种精髓占个人的百分比。"
    }
  },
  {
    "question": {
      "en": "Why can all eight themes tie?",
      "zh": "为什么八项都可能并列？"
    },
    "answer": {
      "en": "Sixteen selections can give each theme two counts. Every highest theme is retained; eight tied guides are available without a forced winner.",
      "zh": "十六次选择可以使每个主题各得两次，所有最高项均保留，不强行选一个胜者，八篇并列全文均可阅读。"
    }
  },
  {
    "question": {
      "en": "Does a low count prohibit a style?",
      "zh": "次数低就不能穿这种风格吗？"
    },
    "answer": {
      "en": "No. A low count means fewer selections among these offered alternatives. It is not a restriction, dislike score or judgement of suitability.",
      "zh": "不会。低次数只表示在这组给定选项中较少选择，不是限制、讨厌程度或适合与否的判断。"
    }
  },
  {
    "question": {
      "en": "Should I choose what I own or what I want to try?",
      "zh": "选已有衣服还是想尝试的？"
    },
    "answer": {
      "en": "Use today’s imagined preference, as the instructions specify. You do not need to own the clothing. Consider actual feasibility separately afterward.",
      "zh": "按说明选择今天想象中愿意尝试的构思，不要求已拥有相应衣服；实际可行性可随后另行判断。"
    }
  },
  {
    "question": {
      "en": "Can I mix themes without calculating a blend?",
      "zh": "可以混搭而不计算比例吗？"
    },
    "answer": {
      "en": "Yes. Try one detail from a guide and evaluate it in an actual outfit. Counts do not establish mixing proportions or a compulsory wardrobe.",
      "zh": "可以。从指南中挑一个细节放入实际穿搭观察，次数不规定混搭比例或必备衣橱。"
    }
  },
  {
    "question": {
      "en": "Must I finish to read my options?",
      "zh": "必须完成才能读指南吗？"
    },
    "answer": {
      "en": "No. All eight full public guides are available before answering; there is no registration or sharing condition.",
      "zh": "不必。八篇完整公开指南在作答前即可阅读，无需注册或分享。"
    }
  }
];
export const styleLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "USU Extension — Elements of Design for Clothing and Textiles",
      "zh": "犹他州立大学：服装与纺织设计要素"
    },
    "url": "https://extension.usu.edu/research/elements-of-design"
  },
  {
    "title": {
      "en": "USU Extension — Design Principles for Clothing and Textiles",
      "zh": "犹他州立大学：服装与纺织设计原则"
    },
    "url": "https://extension.usu.edu/research/principles-of-design"
  }
];
