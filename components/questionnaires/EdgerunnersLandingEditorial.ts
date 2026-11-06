import type { Questionnaire } from "@/lib/questionnaires/types";
export const edgerunnersLandingSections: Questionnaire["guide"] = [
  {
    "id": "edge-reading-scope",
    "title": {
      "en": "Which Cyberpunk: Edgerunners character do your choices bring to mind?",
      "zh": "你的选择让人想到哪位《边缘行者》角色？"
    },
    "paragraphs": [
      {
        "en": "This unofficial character quiz compares ordinary imagined choices with seven selected characters from the original Cyberpunk: Edgerunners anime: David, Lucy, Rebecca, Maine, Kiwi, Falco and Faraday. The situations concern small group projects, personal plans, information and handoffs. You can answer without remembering episodes, recognizing pictures or knowing the game.",
        "zh": "这份非官方角色测验将普通设想选择与初代《赛博朋克：边缘行者》动画中的七位人物对照：大卫、露西、丽贝卡、曼恩、琦薇、法尔科和法拉第。情境围绕小组活动、个人计划、信息与交接展开，不要求记住集数、识别图片或了解游戏。"
      },
      {
        "en": "Each character supplies a limited editorial association, not a complete personality model. A result explains the options you chose and offers examples and contrasts to read alongside them. It does not transfer a fictional character’s background, violent actions, relationships or ending to your life, and it does not evaluate how devoted a fan you are.",
        "zh": "每个人物提供的是有限的编辑性联想，不是完整人格模型。结果解释你选过的回应，并提供可以结合阅读的实例与对照；它不把虚构人物的背景、暴力行为、关系或结局移植到你的人生，也不评价你是否是忠实粉丝。"
      }
    ]
  },
  {
    "id": "edge-reading-seven",
    "title": {
      "en": "Seven character angles, rather than seven fixed identities",
      "zh": "七个角色角度，而不是七种固定身份"
    },
    "paragraphs": [
      {
        "en": "David’s angle is a manageable first attempt; Lucy’s is a self-chosen goal and how much to explain; Rebecca’s is support expressed directly. Maine’s angle concerns coordinating people and capacity, while Kiwi’s concerns checking information before passing it on. These associations organize the offered options rather than summarize every scene in the anime.",
        "zh": "大卫的角度是可以掌握的一次尝试；露西关注自主目标与愿意解释到哪里；丽贝卡关注直接表达支持。曼恩关注人员与余量的协调，琦薇关注传递消息前的核对。这些联想用于组织本题选项，不概括人物在动画中的所有场景。"
      },
      {
        "en": "Falco’s angle is keeping a route, handoff or ending usable; Faraday’s is making terms and commitments explicit. Neither association rates loyalty or morality. Read all seven profiles if useful: an option you did not select may still describe something you do in another setting, or something you would choose when circumstances change.",
        "zh": "法尔科关注让路径、交接或结束真正可用；法拉第关注说清条件与承诺。两者都不评忠诚或道德。需要时可以阅读全部七篇；本次未选的回应，也可能符合你在其他场景中的做法，或条件变化后愿意采用的选择。"
      }
    ]
  },
  {
    "id": "edge-reading-counts",
    "title": {
      "en": "Twenty-one choices: how the seven counts are produced",
      "zh": "二十一次选择：七项次数怎样产生"
    },
    "paragraphs": [
      {
        "en": "Each question presents four responses, and you select one. That response adds one count to its mapped character. Across all twenty-one questions each character appears twelve times, three times in each option position; each pair of characters appears together six times. There are no reverse-scored items, weights or random character draws.",
        "zh": "每题给出四种回应，你选其中一种，为对应角色增加一次。二十一题中每位角色出现十二次，在四个选项位置各出现三次；每对角色共同出现六次。没有反向计分、权重或随机抽取角色。"
      },
      {
        "en": "After all questions are answered, the seven counts add to twenty-one, and each character’s count lies between zero and twelve. These are counts of selections in this specific bank. Equal exposure makes the design inspectable, but it does not by itself demonstrate reliability, validity or an exact degree of resemblance to a fictional person.",
        "zh": "全卷答完后，七项次数合计二十一，每位角色的次数范围为零至十二。这些数字记录的是这份特定题本中的选择。相等的出现机会让设计可以核对，但本身不证明信度、效度或与虚构人物的精确相似程度。"
      }
    ]
  },
  {
    "id": "edge-reading-ties",
    "title": {
      "en": "Read exact ties and close counts differently",
      "zh": "精确并列与相近次数分别怎样读"
    },
    "paragraphs": [
      {
        "en": "The result retains every character sharing the highest count. For example, counts of five, five, four, three, two, one and one total twenty-one and would keep both characters with five. Counts of three for each of the seven characters also total twenty-one and retain all seven guides. These are worked arithmetic examples, not an estimate of how common either outcome is.",
        "zh": "结果保留所有达到相同最高次数的人物。例如五、五、四、三、二、一、一合计二十一，会保留两个五次角色；七位各三次也合计二十一，会保留全部七篇说明。这是运算示例，不估计任一结果在人群中有多常见。"
      },
      {
        "en": "A highest count of five and a next count of four is a one-count difference, not a tie. The page does not automatically merge nearby counts or interpret that gap as a meaningful psychological distance. Read the nearby profile if it helps explain a particular choice; there is no need to retake until one favorite character wins.",
        "zh": "最高五次、其次四次是一次数差，不是并列。页面不会自动合并相近次数，也不把差距解释为有意义的心理距离。可以阅读相邻人物，帮助理解具体选择，无需反复作答直到喜欢的角色胜出。"
      }
    ]
  },
  {
    "id": "edge-reading-contrast",
    "title": {
      "en": "Compare the reason behind an option, not just a character name",
      "zh": "比较选项背后的理由，而不只比较角色名"
    },
    "paragraphs": [
      {
        "en": "In a changed group plan, a David-like option may emphasize trying one workable part, while a Lucy-like option may protect the personal reason for joining. Neither means being more courageous or less sociable. The useful question is what the response protects in that situation, and whether a different circumstance would change your answer.",
        "zh": "在小组计划变化时，大卫联想的回应可能先试一个可行部分，露西联想的回应可能先保留参与的个人理由。两者不表示谁更勇敢或更不合群；更有用的问题是该回应在此情境保护了什么，以及换种条件是否会改变回答。"
      },
      {
        "en": "Maine and Falco can both evoke coordination, but one angle emphasizes people and capacity while the other follows a route through its handoff. Kiwi and Faraday can both evoke clarification, but available information differs from the terms people agree to. These are comparisons within FermatMind’s editorial design, not official classifications of the cast.",
        "zh": "曼恩与法尔科都可能让人想到协调，但一个侧重人员与余量，另一个沿路径关注交接。琦薇与法拉第都可能涉及澄清，但已有信息与双方答应的条件是不同问题。这些是费马编辑设计内部的对照，不是官方角色分类。"
      }
    ]
  },
  {
    "id": "edge-reading-evidence",
    "title": {
      "en": "Official story information and measurement evidence serve different roles",
      "zh": "官方作品信息与测量证据各自说明什么"
    },
    "paragraphs": [
      {
        "en": "The official series introductions and TRIGGER cast information help identify the work and characters. They do not validate this questionnaire’s item mappings or certify its result interpretations. The seven associations and ordinary situations were written for this fan comparison, with the complete guides available to read before taking it.",
        "zh": "官方作品介绍与TRIGGER角色资料帮助核对作品和人物身份，并不验证本问卷的题目映射，也不认证结果解释。七种联想与普通设想情境是为这份同人比较写作的，答题前即可阅读完整指南。"
      },
      {
        "en": "A transparent counting formula is evidence about how an output is generated. A scientific claim about a measured trait would additionally require a defined construct, suitable samples and studies of the specific instrument and use. This entertainment edition has not completed that validation, so its character counts are not MBTI types, Big Five scores or clinical indicators.",
        "zh": "透明计数公式说明输出如何生成。若要对测得的特质提出科学主张，还需要明确构念、合适样本，以及针对具体工具和用途的研究。本娱乐版尚未完成这类验证，因此角色次数不转换为MBTI类型、大五人格分数或临床指标。"
      }
    ]
  },
  {
    "id": "edge-reading-edition",
    "title": {
      "en": "Original-anime scope, names and spoiler expectations",
      "zh": "初代动画范围、译名与剧透预期"
    },
    "paragraphs": [
      {
        "en": "This edition deliberately selects seven characters rather than claiming to cover the entire cast or every Cyberpunk story. It does not mix in game protagonists or characters from a different series entry. A missing character has no hidden result, and familiarity with another quiz’s cast does not establish which results this bank can produce.",
        "zh": "本版明确选择七位人物，不声称覆盖全部角色或每部赛博朋克作品，也不混入游戏主角或其他作品篇章的人物。未列出的人物没有隐藏结果；熟悉另一测验的角色集合，也不能据此推断本题本能够产生哪些结果。"
      },
      {
        "en": "English names remain alongside Chinese names to help recognition across translations. The guides focus on limited role associations and ordinary examples rather than retelling the plot. They mention basic character roles, so readers who want no information about the cast at all may prefer to return later; answering itself never requires plot knowledge.",
        "zh": "中文名旁保留英文名，便于对照不同译名。指南侧重有限角色联想与普通实例，不复述剧情，但仍会提到基本角色身份；希望完全不接触人物信息的读者可以稍后再来。作答本身始终不要求剧情知识。"
      }
    ]
  },
  {
    "id": "edge-reading-use",
    "title": {
      "en": "Read the complete guides and keep sharing optional",
      "zh": "阅读完整指南，自主决定是否分享"
    },
    "paragraphs": [
      {
        "en": "A full guide includes the selected character angle, an everyday situation, contrasts with the other six characters and ways to interpret the count. Start with the examples that fit your actual choices and notice examples that do not. You can keep the result as a discussion prompt without treating it as a judgment of your motives, skill or worth.",
        "zh": "完整指南包含所选人物角度、日常情境、与另外六位的对照及计数读法。可以先看符合实际选择的实例，也留意不符合的实例；把结果作为讨论入口即可，无需把它当成对动机、技能或价值的判断。"
      },
      {
        "en": "Answers are calculated in the browser. Reloading the quiz or switching languages starts a new attempt. Optional copying shares character names and public guide links, not answers or counts. Reading other guides is optional and does not alter your score.",
        "zh": "答案在浏览器计算。刷新答题页或切换语言后需重新作答。自选复制只分享人物名字与公开指南链接，不含答卷或次数。是否阅读其他指南由你决定，不改变计分。"
      }
    ]
  }
];
export const edgerunnersLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Do I need to watch the anime or play Cyberpunk 2077 first?",
      "zh": "需要先看动画或玩《赛博朋克2077》吗？"
    },
    "answer": {
      "en": "No. All twenty-one questions use ordinary imagined situations. There are no episode facts, images to recognize or game mechanics to remember.",
      "zh": "不需要。二十一题都使用普通设想情境，不考集数事实、图片识别或游戏机制。"
    }
  },
  {
    "question": {
      "en": "Is this the official Night City character quiz?",
      "zh": "这是官方夜之城角色测验吗？"
    },
    "answer": {
      "en": "No. This is FermatMind’s independently written fan questionnaire. Official series sources identify the work and cast; they do not endorse or validate this edition.",
      "zh": "不是。这是费马独立写作的同人问卷。官方资料用于核对作品与角色，不代表对本版的认可或验证。"
    }
  },
  {
    "question": {
      "en": "Does twelve out of twelve mean a perfect character match?",
      "zh": "十二次全选就意味着与角色完全相同吗？"
    },
    "answer": {
      "en": "It means you selected that character’s mapped response on every question where it appeared. It is not a similarity percentage or evidence that your life and personality match the character.",
      "zh": "它表示在该人物出现的每道题中都选了映射给他的回应，不是相似度百分比，也不证明人生和人格与人物一致。"
    }
  },
  {
    "question": {
      "en": "Why can all seven characters be highest together?",
      "zh": "为什么七位角色可能全部并列最高？"
    },
    "answer": {
      "en": "Twenty-one selections can distribute as three per character. All seven then share the highest count, so all seven complete guides are retained. No random or alphabetical tie winner is chosen.",
      "zh": "二十一次选择可以分为每位三次；七位因此达到相同最高次数，全部完整指南都会保留，不随机或按字母挑选一位。"
    }
  },
  {
    "question": {
      "en": "Does a Faraday result judge my morality?",
      "zh": "法拉第结果是在判断我的道德吗？"
    },
    "answer": {
      "en": "No. This edition maps his angle to explicit terms and commitments. The result does not assign his story actions or infer your motives or moral character.",
      "zh": "不是。本版给他的角度是明确条件与承诺，结果不把他的剧情行为赋给你，也不推断你的动机或道德品质。"
    }
  },
  {
    "question": {
      "en": "Can the character result reveal my MBTI or attachment style?",
      "zh": "角色结果能揭示MBTI或依恋风格吗？"
    },
    "answer": {
      "en": "No conversion is provided. A fan character association and a psychological construct are different things, and this questionnaire has not established such a measurement relationship.",
      "zh": "本页不提供换算。同人人物联想与心理构念是不同对象，本问卷未建立这种测量关系。"
    }
  },
  {
    "question": {
      "en": "Does a different result after retaking show that I changed?",
      "zh": "重测结果不同就说明我变了吗？"
    },
    "answer": {
      "en": "Not by itself. Current circumstances, how you interpret a situation and a few changed choices can change the highest count. Compare the actual choices and counts before drawing broader conclusions.",
      "zh": "单凭结果不能这样判断。当时情境、对题意的理解和几次不同选择都可能改变最高次数，应先比较具体回答与计数。"
    }
  },
  {
    "question": {
      "en": "Can I read every character result without answering?",
      "zh": "不答题也能看全部人物结果吗？"
    },
    "answer": {
      "en": "Yes. The seven public guides are available before starting. They are general explanations, not another person’s private answers; reading them does not change the counting rule.",
      "zh": "可以。七篇公开指南开测前即可阅读，属于一般说明，不是别人的私人答卷；阅读不改变计数规则。"
    }
  }
];
