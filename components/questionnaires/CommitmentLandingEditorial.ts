import type { Questionnaire } from "@/lib/questionnaires/types";

export const commitmentLandingSections: Questionnaire["guide"] = [
  {
    "id": "commitment-edition",
    "title": {
      "zh": "亲密关系承诺度测试测什么？四部分分别回答",
      "en": "What does this Relationship Commitment Test explore? Four separate questions"
    },
    "paragraphs": [
      {
        "zh": "本版用24条原创自述回看最近一个月的一段当前成年伴侣关系，分别整理继续意愿、近期满意度、关系外选择与关系关联投入，每部分六条。它描述自己现在怎样看待这段关系，不代表伴侣的回答；完成后同时显示四项读数和四份完整指南。",
        "en": "This edition uses twenty-four original statements about one current adult partnership over the past month. Six statements each address continuing intention, recent satisfaction, outside options and relationship-linked investment. It describes your own present view, not your partner’s answers. Completion displays four separate readings and all four full guides."
      },
      {
        "zh": "“承诺测试”可能问愿不愿继续，也可能问对亲近或长期安排的焦虑；关系满意度测试则主要问相处体验。这些对象不能因为名称相似就相互替代。本页把意愿与其他三部分分开，不从满意度推算承诺，不把最高均分当成关系类型。",
        "en": "A commitment test may ask about wanting to continue or about anxiety around closeness and long-term arrangements. A satisfaction questionnaire mainly asks about relationship experience. Similar names do not make these interchangeable. Here, intention is recorded separately from the other three parts; satisfaction does not generate a commitment estimate, and the highest mean is not a relationship type."
      }
    ]
  },
  {
    "id": "commitment-theory",
    "title": {
      "zh": "投资模型：承诺与三项基础的研究区别",
      "en": "The investment model: distinguish commitment from its three bases"
    },
    "paragraphs": [
      {
        "zh": "Rusbult、Martz与Agnew于1998年报告三项研究，检验投资模型量表中的承诺、满意度、替代选择与投入规模，并考察与其他关系指标及后续关系状态的联系。原研究的对象是其具体工具和样本，不是所有以投资模型为背景的网络问卷。[1]",
        "en": "Rusbult, Martz and Agnew reported three studies in 1998 examining commitment, satisfaction, alternatives and investment size in the Investment Model Scale, including associations with other relationship measures and later relationship status. Those findings concern the studied instrument and samples, not every online questionnaire informed by the model. [1]"
      },
      {
        "zh": "2011年作者综述将满意度、替代选择与投入讨论为承诺的三项基础，并讨论关系维持与持续行为。本版借此区分问题领域，题目、1至5选项、近一个月范围与缺答规则均为本站版本；没有把理论关系改写成个人去留公式，也没有继承原工具的验证。[2]",
        "en": "The authors’ 2011 review discusses satisfaction, alternatives and investment as three bases of commitment, alongside maintenance and persistence. This edition uses those distinctions to organise reflection. Its statements, one-to-five responses, one-month frame and missing-response rule are specific to this bank. A theoretical association is not converted into an individual stay-or-leave formula or inherited validation. [2]"
      }
    ]
  },
  {
    "id": "commitment-four-readings",
    "title": {
      "zh": "继续、满意、其他选择与投入为什么可以不同步？",
      "en": "Why can intention, satisfaction, options and investment differ?"
    },
    "paragraphs": [
      {
        "zh": "继续意愿问自己现在是否愿意维持伴侣身份；近期满意度问最近的陪伴、活动与需要回应；关系外选择问独处、朋友、家人或其他生活安排的主观吸引力；关系关联投入问珍视的经历、精力与共同安排中哪些与关系延续相连。四组都只按本组条目阅读。",
        "en": "Continuing intention asks whether you currently want to remain partners. Satisfaction addresses recent companionship, activities and responses to needs. Outside options concern the perceived appeal of time alone, friends, family or other arrangements. Investment addresses valued experiences, effort and shared arrangements linked to the relationship continuing. Read each part through its own statements."
      },
      {
        "zh": "例如，一位虚构读者愿意继续，却希望临时改约后能补上共同时间；其意愿和满意度可以不同。另一位读者珍视共同经历，但需要重新想清是否愿意继续。能想象适合自己的独立生活，也可以与自愿选择当前伴侣并存；这些情况不是需要由一个总分消除的矛盾。",
        "en": "For example, a fictional reader wants to continue but wishes cancelled plans were rearranged; intention and satisfaction can differ. Another values shared experiences while reconsidering whether to continue. Imagining a suitable independent life can also coexist with freely choosing a present partner. A combined score is not needed to erase these distinctions."
      }
    ]
  },
  {
    "id": "commitment-reverse-math",
    "title": {
      "zh": "24条怎样计分？八道反向题与一位小数",
      "en": "How are twenty-four statements scored? Eight reverse keys and one decimal"
    },
    "paragraphs": [
      {
        "zh": "每条以1至5表示目前符合程度，不是发生频率。八道反向题为第6、9、11、12、17、18、19、20题，计分值=6减原评分；其余题保留原值。每部分六条计分值相加，范围6至30，再除以6显示一位小数。反向处理统一本组读数方向，不把较高变成四部分都更好。",
        "en": "Each response codes current fit from one to five, rather than frequency. Items 6, 9, 11, 12, 17, 18, 19 and 20 are reverse-keyed: their scored value is six minus the response. Other ratings retain their value. Each six-item sum ranges from six to thirty and is divided by six, displayed to one decimal. Reversal aligns a part’s reading; it does not make higher better across all four."
      },
      {
        "zh": "另一个算例：继续意愿六条依出现顺序回答4、2、5、3、2、4；第三、第五条反向后为4、2、1、3、4、4，总数18，显示3.0。六条都答3也显示3.0，但表达的犹豫可能不同。3.0不是人口平均，4.0不是80%会继续；小数位也不证明心理距离等距或变化已显著。",
        "en": "Another example: intention responses of 4, 2, 5, 3, 2 and 4 become 4, 2, 1, 3, 4 and 4 after reversing the third and fifth items in that part. The sum is eighteen, displayed as 3.0. Six threes also display 3.0 while potentially expressing different uncertainties. Three is not a population average, four is not an eighty-percent probability of continuing, and decimals establish neither equal psychological distances nor significant change."
      }
    ]
  },
  {
    "id": "commitment-missing",
    "title": {
      "zh": "NA与没有当前伴侣：保留未知，不补分",
      "en": "NA and no current partner: preserve uncertainty without imputation"
    },
    "paragraphs": [
      {
        "zh": "24条都需要选择一项，NA是未经历或无法判断的独立选项。任一条NA使所属部分的个人总数与均分保留资料不足，其他六条完整的部分仍可显示。NA不计零、不取中间分、不按剩余五条平均；全部选NA可以完成，但四部分均无个人读数，四份全文仍可读。",
        "en": "All twenty-four items need a selection; NA separately means not experienced or cannot judge. Any NA withholds its part’s personal sum and mean, while other fully rated parts can appear. NA is neither zero nor a midpoint and is not replaced by a five-item average. All-NA can complete with four unscored parts and all four guides available."
      },
      {
        "zh": "没有当前成年伴侣关系时，可以直接阅读四份公开指南，不用为得到数字想象伴侣、把过去多段关系混在一起或让朋友替自己判断。当前有关系，也不必因对方希望某种结果而猜答；缺少信息与较少认可某条表述是两种不同状态。",
        "en": "Without a current adult partnership, read the four public guides directly rather than imagine a partner, combine several former relationships or have a friend rate you. Even in a current partnership, you need not guess to produce a result someone else wants. Missing information and lower endorsement of a statement are different states."
      }
    ]
  },
  {
    "id": "commitment-evidence",
    "title": {
      "zh": "研究证据怎样用？先核题本、样本与研究设计",
      "en": "How should evidence be used? Check the instrument, sample and design"
    },
    "paragraphs": [
      {
        "zh": "同一理论可以用不同题目和研究设计检验。例如，2000年一项西班牙研究比较90名已婚与98名离婚受访者，离婚组回顾先前关系；它采用自己的测量方式。这样的组间与回顾资料，不能当作当前访客未来是否分手的个人概率表。[3]",
        "en": "The same theory can be studied with different items and designs. For example, a Spanish study published in 2000 compared ninety married and ninety-eight divorced respondents, with retrospective reports from the divorced group and its own measures. Such group comparisons and recalled reports are not a probability table for an individual visitor’s future breakup. [3]"
      },
      {
        "zh": "本版尚无对应题本的信度、效度、人群常模、分界线或中英文等价验证。公开算法能帮助复算回答，却不等于已经验证承诺、满意度或关系结局；四组分别显示也不证明它们在统计上独立。阅读任何研究，需区分群体关联、后续预测与对单个人的决策建议。",
        "en": "This edition has no established reliability, validity, population norms, cutoffs or demonstrated Chinese–English equivalence. Public arithmetic makes responses checkable without validating the constructs or outcomes. Displaying four parts separately does not establish statistical independence. Distinguish group associations, prediction in a studied follow-up and advice for a particular person."
      }
    ]
  },
  {
    "id": "commitment-full-guides",
    "title": {
      "zh": "四份完整结果怎样读？先具体条目，再比较情境",
      "en": "How do you read four full guides? Start with statements and context"
    },
    "paragraphs": [
      {
        "zh": "四份指南分别包含问题含义、计分与缺答、较高较低及混合情况、算例、反例、四部分比较、私人练习和版本限制，共32节。它们是持续可读的公开解释，不因某项资料不足而锁住，也不是只展示最高项。先看自己想到的条目，再用一个符合和一个不符合的近期事例核对。",
        "en": "Each of four guides includes meaning, scoring and missing responses, higher/lower or mixed readings, a worked example, counterexamples, comparison, a private exercise and edition limits: thirty-two sections in total. These public explanations remain readable with insufficient information and do not display only a highest part. Revisit statements using one fitting and one non-fitting recent example."
      },
      {
        "zh": "不要用另一人的均分校准自己的答案，也不要把不同工具的3.0直接对照。本页的符合度、反向键、六题要求和一位小数共同决定读数。若之后重答，先核对同一关系、相近回想范围与同一版本，再看哪些具体回答改变；数字变化不能证明某次对话造成改善。",
        "en": "Do not calibrate answers against someone else’s mean or directly equate a 3.0 from another tool. These response anchors, reverse keys, six-item requirement and display rounding define this reading. For a later attempt, check the relationship, recall period and edition before examining changed answers. A numerical change does not prove a conversation caused improvement."
      }
    ]
  },
  {
    "id": "commitment-private-use",
    "title": {
      "zh": "把读数转成自己的问题：自愿沟通与私人记录",
      "en": "Turn readings into your own questions: voluntary conversation and private notes"
    },
    "paragraphs": [
      {
        "zh": "若愿意，可以在自己的纸上分别写“我想继续什么”“近期哪些安排不合适”“哪些支持已经可用”“哪些共同事务需要协调”，每栏放一件具体事。未确认的支持与已经能使用的资源分开。已有投入不会产生必须留下的义务；本页不要求增加投入、减少朋友联系或以评分换取承诺。",
        "en": "If useful, privately note one example each of what you want to continue, an unsuitable recent arrangement, support already available and shared matters needing coordination. Separate unconfirmed possibilities from accessible resources. Investment creates no obligation to stay; this page does not ask you to increase ties, reduce friendships or exchange ratings for promises."
      },
      {
        "zh": "讨论前可先问是否方便，允许对方有不同理解或不立即回答；本页不验证双方同意，也不证明关系安全。答案在浏览器内计算，只有主动保存才在本标签页保留24小时草稿，完成或重测清除；分享只带公开标题与入口，不含回答、四项均分或伴侣信息。",
        "en": "Before discussing a topic, you can check whether it is a suitable time and allow a different view or no immediate reply. The page verifies neither mutual consent nor relationship safety. Answers are calculated in the browser; only opted-in drafts remain in this tab for twenty-four hours, clearing on completion or retake. Sharing contains only a public title and link, without answers, means or partner information."
      }
    ]
  }
];

export const commitmentLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "承诺度、满意度与依恋风格是一回事吗？",
      "en": "Are commitment, satisfaction and attachment style the same?"
    },
    "answer": {
      "zh": "不是。本页分别问当前继续意愿、近期体验、关系外选择和关联投入；它没有用依恋焦虑或回避给你分型，也不从某项均分换算其他测试。",
      "en": "No. This page separates present intention, recent experience, outside options and linked investment. It does not assign an attachment-anxiety or avoidance type or convert means into another test."
    }
  },
  {
    "question": {
      "zh": "为什么有些题选得越高，计分反而较低？",
      "en": "Why can a higher response produce a lower scored value?"
    },
    "answer": {
      "zh": "八题以相反方向表述，使用6减原评分，使同一组较高数值保持同一含义。请照实回答完整句子；反向题不是测谎题，也不证明答案有错。",
      "en": "Eight oppositely keyed statements use six minus the response to keep a part’s reading consistent. Answer the whole sentence as written. Reverse keys are not lie detectors or evidence of incorrect answers."
    }
  },
  {
    "question": {
      "zh": "3.0是不是普通水平，4.0是不是80%？",
      "en": "Is 3.0 average, or 4.0 eighty percent?"
    },
    "answer": {
      "zh": "都不是。它是本组六条计分值的均数，显示一位小数，没有人群常模、百分位或概率换算；相同均分也可能有不同条目回答。",
      "en": "Neither. It is the mean of six keyed values, shown to one decimal, without population norms, percentile ranks or probability conversion. Equal means can contain different item responses."
    }
  },
  {
    "question": {
      "zh": "很想继续，但最近不满意，是矛盾吗？",
      "en": "Is wanting to continue while dissatisfied a contradiction?"
    },
    "answer": {
      "zh": "不是。自己的当前意愿与最近的相处体验回答不同问题。可分别说明希望继续什么、希望调整什么，不用其中一个数字取消另一个。",
      "en": "No. Present intention and recent relationship experience answer different questions. Describe what you want to continue and what you want to change without cancelling one with the other."
    }
  },
  {
    "question": {
      "zh": "共同投入很多，就说明必须继续吗？",
      "en": "Does substantial shared investment mean I must continue?"
    },
    "answer": {
      "zh": "不说明。读数只整理与关系相连的资源自述，不是道德义务、损失估价或去留建议。需要协调的事务与自己的意愿要分别看。",
      "en": "No. The reading organises statements about linked resources, without creating a moral obligation, loss valuation or stay-or-leave recommendation. Coordination and intention are separate questions."
    }
  },
  {
    "question": {
      "zh": "必须让伴侣一起做，结果才有效吗？",
      "en": "Must my partner take it too?"
    },
    "answer": {
      "zh": "不需要。本版记录自己的观点，不要求对方作答或分享。两个人的回答不同，也不能相减算成适配率或判断谁更爱谁。",
      "en": "No. This edition records your perspective without requiring another person’s attempt or disclosure. Different responses cannot be subtracted into compatibility or used to judge who loves more."
    }
  },
  {
    "question": {
      "zh": "全部选NA会发生什么？",
      "en": "What happens if I select NA throughout?"
    },
    "answer": {
      "zh": "可以完成，四部分均保留资料不足，仍能阅读四份完整指南。未选答案则属于尚未完成；系统不会自动把空白当NA或低分。",
      "en": "The attempt can complete with four insufficient-information readings and every full guide available. Unselected items remain incomplete; blanks are not automatically treated as NA or low ratings."
    }
  },
  {
    "question": {
      "zh": "开始测试还要注册或额外同意吗？",
      "en": "Does starting require registration or extra confirmation?"
    },
    "answer": {
      "zh": "不用。点击开始直接进入第一题，24题与四份全文免费；保存进度是可选项，不是作答条件。公开指南也可在作答前阅读。",
      "en": "No. Start opens the first question directly. All twenty-four items and four full guides are free; draft saving is optional, not a condition of answering. Public guides are also readable before an attempt."
    }
  }
];

export const commitmentLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Martínez-Íñigo（2000）：西班牙已婚与离婚样本中的投资模型检验",
      "en": "Martínez-Íñigo (2000): investment-model study of married and divorced Spanish respondents"
    },
    "url": "https://www.psicothema.com/pii?pii=254"
  }
];
