import type { Questionnaire } from "@/lib/questionnaires/types";
export const connectionLandingSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "What this soulmate quiz actually explores",
      "zh": "灵魂伴侣测试在本页探索什么"
    },
    "paragraphs": [
      {
        "en": "This original entertainment questionnaire asks which details you would enjoy in fictional, mutually welcome adult connections. Twelve four-way choices compare six themes: Shared Spark, Steady Presence, Easy Companionship, Shared Discovery, Gentle Support and Mutual Encouragement. The output is a record of choices among these descriptions, rather than an assessment of an existing couple.",
        "zh": "本原创娱乐问卷询问：在双方自愿的成年连接想象中，你更喜欢哪些细节。十二次四选一比较一起点亮日常、稳定地在场、自在的同伴感、一起探索新事物、温和地承接与相互鼓励前行六个主题。输出记录这些描述之间的选择，不评估一对现实伴侣。"
      },
      {
        "en": "Here, soulmate is a familiar topic name for exploring connection ideals. You do not enter a name, birth date, photograph or another person’s answers. No theme identifies a destined person, confirms mutual attraction or establishes whether a relationship should begin or continue.",
        "zh": "这里的“灵魂伴侣”是探索连接偏好的主题名称。无需输入姓名、生日、照片或他人的回答。任何主题都不识别命定对象、不确认相互吸引，也不判断一段关系应当开始或继续。"
      }
    ]
  },
  {
    "id": "themes",
    "title": {
      "en": "Six themes, with distinctions worth reading",
      "zh": "六种主题各关注什么"
    },
    "paragraphs": [
      {
        "en": "Shared Spark concerns enlivening an ordinary moment together; Shared Discovery concerns exploring something unfamiliar together. They can overlap, but an enjoyable familiar joke is not the same detail as trying a new route or activity. Easy Companionship concerns unforced time together rather than the novelty of the activity.",
        "zh": "一起点亮日常关注共同让普通时刻生动起来；一起探索新事物关注共同接触不熟悉的事物。两者可以重叠，但熟悉笑话带来的愉快，与尝试新路线或活动并非同一细节。自在的同伴感关注相处不费力的体验，而非活动是否新奇。"
      },
      {
        "en": "Steady Presence concerns dependable availability in the imagined scene. Gentle Support concerns how a response receives a feeling or difficulty. Mutual Encouragement concerns making room for each person’s chosen steps. These are editorial themes, not six validated dimensions, attachment styles or levels of relationship quality.",
        "zh": "稳定地在场关注想象情境中可预期的陪伴；温和地承接关注如何回应感受或困难；相互鼓励前行关注为彼此自选的行动留出空间。这是编辑定义的主题，不是六个经验证的测量维度、依恋类型或关系质量等级。"
      }
    ]
  },
  {
    "id": "comparison",
    "title": {
      "en": "How to answer a four-way fictional comparison",
      "zh": "怎样完成四选一情境比较"
    },
    "paragraphs": [
      {
        "en": "Read the whole scene and select the offered detail you would most enjoy now. Compare the available alternatives rather than searching for the socially best answer or guessing what a real partner would choose. You need not currently be dating to imagine a welcome connection.",
        "zh": "读完整个情境，选出当下最想体验的那一项。比较题目实际提供的选项，不寻找最得体的答案，也不猜测现实伴侣会怎么选。即使目前没有恋爱关系，也可以想象双方愿意的连接。"
      },
      {
        "en": "Only four of the six themes appear in any item. A theme missing from that item has not been rejected, and choosing one pleasant detail does not mean disliking the other three. If no description feels useful, you may leave the attempt and read all six full guides without completing it.",
        "zh": "每题只出现六个主题中的四个。未出现的主题没有被否定；选中一个喜欢的细节，也不代表讨厌其余三个。若描述都没有帮助，可以退出，直接阅读六篇完整指南，无需完成作答。"
      }
    ]
  },
  {
    "id": "counts",
    "title": {
      "en": "Twelve choices, six tallies and equal exposure",
      "zh": "十二次选择、六项计数与均衡呈现"
    },
    "paragraphs": [
      {
        "en": "Each selected option adds one count to its theme. Across twelve items, every theme appears eight times and twice in each of the four option positions. Each tally therefore ranges from 0 to 8; the six tallies sum to 12. Equal exposure describes the bank’s arrangement, not evidence that its themes measure psychological traits reliably.",
        "zh": "每选中一项，为对应主题增加一次。十二题中，每主题出现八次，在四个选项位置各出现两次，因此单项计数范围为0至8，六项相加为12。均衡呈现说明题组编排，不证明主题能够可靠测量心理特质。"
      },
      {
        "en": "For example, counts of 4, 3, 2, 1, 1 and 1 total twelve and produce one highest theme. A count of 4 / 8 means that description was chosen on four of its eight appearances. It is not a 50% soulmate match, a population percentile or a probability of meeting someone.",
        "zh": "例如4、3、2、1、1、1相加为十二，产生一个最高主题。4 / 8表示该主题出现的八题中有四次被选中，不是50%的灵魂伴侣匹配度、人群百分位或遇见某人的概率。"
      }
    ]
  },
  {
    "id": "ties",
    "title": {
      "en": "Read every highest theme without inventing a winner",
      "zh": "最高并列如何阅读"
    },
    "paragraphs": [
      {
        "en": "Every theme sharing the highest tally receives its full guide. With 3, 3, 2, 2, 1 and 1, the two themes with three choices remain tied. With 2, 2, 2, 2, 2 and 2, all six full guides remain open. Letter order, question order and option position do not choose a hidden winner.",
        "zh": "凡计数相同且达到最高的主题，均显示完整指南。3、3、2、2、1、1保留两个三次的主题并列；2、2、2、2、2、2保留六个主题的全部全文，不用字母、题号或选项位置挑出隐藏赢家。"
      },
      {
        "en": "Different but nearby counts are not automatically merged. This edition has no validated close-score threshold or uncertainty interval. Read an adjacent guide if useful, but do not treat a one-choice difference as a meaningful psychological distance or a stable personal identity.",
        "zh": "相近但不同的计数不自动合并。本版本没有经验证的近分阈值或不确定性区间。可以继续阅读相邻指南，但不把一次选择的差距解释为有意义的心理距离或稳定身份。"
      }
    ]
  },
  {
    "id": "research-context",
    "title": {
      "en": "Relationship beliefs research and this questionnaire",
      "zh": "关系信念研究与本问卷的区别"
    },
    "paragraphs": [
      {
        "en": "Franiuk, Cohen and Pomerantz examined beliefs about finding a right partner and working on a relationship, including associations with satisfaction and longevity. That research concerns beliefs and their relationship context. It does not demonstrate that a destined partner exists or validate these six fictional preference themes. [1]",
        "zh": "Franiuk、Cohen与Pomerantz研究寻找合适伴侣、经营关系等信念，以及它们与关系满意度和持续情况的关联。该研究讨论信念及其关系情境，不证明命定伴侣存在，也不验证本页六个想象偏好主题。[1]"
      },
      {
        "en": "This edition has no established norms, reliability estimates, factor-structure evidence or predictive validation. Its counts can be checked against your answers, but reproducible arithmetic is different from evidence for a psychological interpretation. The six themes are not scores from the published study.",
        "zh": "本版本尚无常模、信度估计、因素结构证据或预测效度验证。计数可根据回答复算，但可复算的算术，与支持心理解释的研究证据是不同的；六项主题也不是上述发表研究的量表分数。"
      }
    ]
  },
  {
    "id": "use-example",
    "title": {
      "en": "Turn an appealing theme into a concrete observation",
      "zh": "把有共鸣的主题带回具体细节"
    },
    "paragraphs": [
      {
        "en": "Suppose Shared Discovery appeals to you. You might privately note whether you prefer exploring a small new activity together, rather than conclude that you need an adventurous partner. Compare a familiar activity you also enjoy. This keeps the observation connected to examples rather than a rule for selecting people.",
        "zh": "假如一起探索新事物让你有共鸣，可以私下留意是否喜欢共同尝试一项小活动，而不是断定自己必须寻找冒险型伴侣；再对照一种同样喜欢的熟悉活动。这样观察仍然联系具体例子，不变成挑选他人的规则。"
      },
      {
        "en": "A preferred imagined response does not show that another person wants to provide it, or that you always want it yourself. If you choose to discuss an example, ask about actual wishes and available time rather than assign a theme to someone. No private note or relationship decision is required to use this page.",
        "zh": "喜欢某个想象中的回应，不说明他人愿意提供，也不说明自己始终需要它。若愿意讨论实例，可以了解真实意愿与可用时间，不替别人分配主题。使用本页不要求提交私人笔记或作关系决定。"
      }
    ]
  },
  {
    "id": "reading-access",
    "title": {
      "en": "Full guides and private answering",
      "zh": "完整指南与作答隐私"
    },
    "paragraphs": [
      {
        "en": "Each theme has an eight-section public guide with examples, contrasts and optional observations. All six are readable before taking the quiz; a highest result highlights relevant guides without locking the others. Public guide pages contain general explanations, not your answers or a partner’s profile.",
        "zh": "每主题有八节公开指南，包含例子、对照与可选观察。六篇在测试前均可阅读；最高结果只突出对应指南，不锁住其余全文。公开指南提供通用解释，不包含你的答案或伴侣档案。"
      },
      {
        "en": "Start test opens the first comparison directly, without an agreement checkbox. Answers stay in current page memory, with no saved draft, personal-result sharing or quiz-flow statistics. Refreshing or changing language loses the attempt. You can exit and clear, retake from empty answers or finish after reading.",
        "zh": "点击开始测试直接进入第一次比较，无需勾选同意。回答仅留当前页面内存，不保存草稿、不分享个人结果，也不发送测试流程统计。刷新或换语言后本次作答会丢失，可以退出清除、从空白重新测试，或阅读后结束。"
      }
    ]
  }
];
export const connectionLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Can this test tell me who my soulmate is?",
      "zh": "能告诉我灵魂伴侣是谁吗？"
    },
    "answer": {
      "en": "No. It compares preferences for fictional connection details and has no identity-matching method.",
      "zh": "不能。它比较虚构连接细节中的偏好，没有身份匹配方法。"
    }
  },
  {
    "question": {
      "en": "Is 4 / 8 a compatibility percentage?",
      "zh": "4 / 8是匹配百分比吗？"
    },
    "answer": {
      "en": "It is four choices from eight appearances, not a partner comparison or probability.",
      "zh": "它是八次出现中被选中四次，不是伴侣比较或概率。"
    }
  },
  {
    "question": {
      "en": "Do I need a current partner?",
      "zh": "必须有现实伴侣才能做吗？"
    },
    "answer": {
      "en": "No. The scenes are imagined and do not require a partner’s information or answers.",
      "zh": "不需要。情境是想象的，不要求提供伴侣资料或回答。"
    }
  },
  {
    "question": {
      "en": "Are the six themes attachment styles?",
      "zh": "六主题是依恋类型吗？"
    },
    "answer": {
      "en": "No. They are original editorial themes and are not interchangeable with attachment measures or published relationship-belief scales.",
      "zh": "不是。它们是原创编辑主题，不能与依恋测量或已发表的关系信念量表换算。"
    }
  },
  {
    "question": {
      "en": "Does a low tally mean I reject that experience?",
      "zh": "次数低就代表排斥这种体验吗？"
    },
    "answer": {
      "en": "No. Choices are relative to the alternatives offered; absent themes are not rejected.",
      "zh": "不是。选择相对于当题提供的选项，未出现的主题也没有被否定。"
    }
  },
  {
    "question": {
      "en": "Can six themes tie?",
      "zh": "六个主题可以全部并列吗？"
    },
    "answer": {
      "en": "Yes. Two choices for each theme total twelve, so all six full guides are shown.",
      "zh": "可以。每主题两次合计十二次，会显示六篇完整指南。"
    }
  },
  {
    "question": {
      "en": "Will retaking reveal a truer type?",
      "zh": "重测会揭示更真实的类型吗？"
    },
    "answer": {
      "en": "A changed choice can change a tally. There is no validated stable type or precision estimate in this edition.",
      "zh": "选择变化会改变次数，本版本没有经验证的稳定类型或精度估计。"
    }
  },
  {
    "question": {
      "en": "Must I agree before seeing the questions?",
      "zh": "进入题目前需要勾选同意吗？"
    },
    "answer": {
      "en": "No. Start test opens comparison one directly; instructions and privacy information remain readable.",
      "zh": "不需要。点击开始测试直接进入第一次比较，作答说明与隐私信息仍可阅读。"
    }
  }
];
