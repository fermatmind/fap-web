import type { Questionnaire } from "@/lib/questionnaires/types";

export const ctlLandingSections: Questionnaire["guide"] = [
  {
    "id": "ctl-context-edition",
    "title": {
      "en": "Capacity to Love Inventory: identify the edition first",
      "zh": "爱的能力量表：先确认题本版本"
    },
    "paragraphs": [
      {
        "en": "This working edition presents the forty-one English statements in the 2018 article’s Table 1, alongside a new FermatMind Chinese translation. It is not a thirty-item adaptation, a four-area original quiz or the current revised author-site form. Similar names do not establish identical questions, response options or scoring. Check the edition before comparing any results.",
        "zh": "本工作版呈现2018论文表一的41条英文，并附费马新中文译文；它不是30题改编版、四领域原创测验或当前作者站修订题本。名称相似不确立题目、选项或计分相同；比较结果前应先核版本。"
      },
      {
        "en": "Six full public guides cover interest in a partner’s life project, basic trust, gratitude, common ego ideal, permanence of sexual passion, and loss and mourning. The research labels organise particular statements. They are not six relationship requirements, six love languages or six attachment types, and the website assigns no overall level of ability to love.",
        "zh": "六篇完整公开指南分别讨论关注伴侣人生计划、基本信任、感激、共同自我理想、性激情持续，以及丧失与哀伤。研究标签整理特定陈述，不是六条关系要求、六种爱的语言或六种依恋类型；网站不分配爱的能力总等级。"
      }
    ]
  },
  {
    "id": "ctl-context-answers",
    "title": {
      "en": "Four numeric choices and one consistent relationship",
      "zh": "四个数值选项与同一段关系"
    },
    "paragraphs": [
      {
        "en": "Answer about a current or last important relationship, keeping that reference throughout. The four choices indicate applicability, not how many times an event happened. Choices 2 and 3 remain numeric intermediate options; neither is an unscored midpoint. Ten minutes is an estimate, not a time limit. No additional four-week recall rule is imposed here.",
        "zh": "以当前或上段重要关系为参照，全程保持一致。四个选择表示适用程度，不计事件次数；2和3保留数字中间选项，都不是不计分中点。十分钟是估计，不限时；本页不额外加入四周回顾规则。"
      },
      {
        "en": "The source contains no NA option. All forty-one valid selections are needed before any personal domain scores appear. If a statement is irrelevant, unwanted or difficult to answer, you can stop and read all six complete guides without a score. Missing experience must not be replaced with a low answer, and stopping provides no evidence about your willingness or capacity to love.",
        "zh": "源题本没有NA选项，41项有效选择齐备后才显示任何个人领域分。不相关、不想答或难以回答时，可以停止并无分阅读六篇完整指南。不以低值代替缺少经历；停止不提供关于爱之意愿或能力的证据。"
      }
    ]
  },
  {
    "id": "ctl-context-interest-trust",
    "title": {
      "en": "Interest and trust: statements, perceptions and privacy",
      "zh": "关注与信任：陈述、感受与隐私"
    },
    "paragraphs": [
      {
        "en": "The seven interest items combine knowing and sharing plans, responding to a partner’s experience, empathy and boredom. The nine trust items combine perceived support, expressing needs, honesty, privacy-related wording and feeling safe. A mean cannot isolate which specific experience you endorsed, verify another person’s intentions or determine whether trust is warranted.",
        "zh": "七项关注题结合了解与分享计划、回应伴侣经历、共情与无聊；九项信任题结合所感支持、表达需要、诚实、隐私相关措辞与安全感。均分不能分离具体认同哪种体验、核实他人意图或判断信任是否有根据。"
      },
      {
        "en": "For an ordinary voluntary conversation, you might ask which part of a project a partner wants to discuss. That differs from demanding every plan or inspecting messages. Likewise, describing a feeling of safety does not independently assess safety. Reversing the secrets item preserves a source key; it does not make privacy dishonest or require disclosure to someone you fear.",
        "zh": "普通自愿对话中，可以询问伴侣愿意谈计划的哪一部分；这不同于要求全部计划或检查消息。同样，描述安全感不等于独立评估安全。对保留秘密题反向计分保留的是来源键向，不把隐私定为不诚实，也不要求向令自己害怕的人披露。"
      }
    ]
  },
  {
    "id": "ctl-context-gratitude-ideal",
    "title": {
      "en": "Gratitude and a common ego ideal: care and shared intentions",
      "zh": "感激与共同自我理想：照顾和共同意向"
    },
    "paragraphs": [
      {
        "en": "Seven gratitude statements include appreciation, connection, needing a partner, offering comfort and sharing responsibilities. Eight common-ideal statements include dedication, values, compromise, joint life and connection. These sets include different feelings and inclinations. Even a statement using we remains one person’s report, without the partner’s confirmation of an agreement or assessment of fairness.",
        "zh": "七项感激陈述包含欣赏、联结、需要伴侣、安慰与分担责任；八项共同理想陈述包含投入、价值、妥协、共同生活与联结。题组结合不同感受和倾向；即使使用“我们”，仍是单人自报，没有对方确认约定或评估公平。"
      },
      {
        "en": "A specific offer of help can leave room for a different preference: would changing this task be useful to you? An offer does not guarantee that help is welcome, and appreciation creates no debt of affection. Shared intentions also leave room for disagreement; compromise need not apply to safety, consent or boundaries. A keyed mean cannot decide who should stay in a relationship.",
        "zh": "具体帮助提议可以保留不同偏好：“调整这项分工对你有用吗？”提出帮助不保证被欢迎，感激也不产生亲密回报的债务。共同意向仍保留分歧；安全、同意与边界不必成为妥协对象。计分均值不能决定谁应留在关系中。"
      }
    ]
  },
  {
    "id": "ctl-context-passion-loss",
    "title": {
      "en": "Sexual-passion and loss items need close reading",
      "zh": "性激情与丧失题需要细读题文"
    },
    "paragraphs": [
      {
        "en": "The two sexual-passion prompts are general statements about long-term boredom and desire over time. Both are reverse-keyed. Their mean is not an observation of personal sexual frequency, functioning, orientation or a partner’s desire. Low or changing desire, asexuality and choosing not to have sex are not defects established by these statements.",
        "zh": "两项性激情题是关于长期无聊与欲望随时间变化的一般陈述，均为反向题。均分不是对个人性行为频率、性功能、取向或伴侣欲望的观察；低或变化的欲望、无性恋以及选择不发生性行为，都不是由题文确立的缺陷。"
      },
      {
        "en": "The eight loss-and-mourning statements cover several experiences, including unreturned love, blame, jealousy, guilt and difficulty moving forward. Endorsing a feeling does not prove an action, and an average does not establish a grief stage or a deadline. Moving forward need not mean finding another partner. No result requires forgiveness, reconciliation, renewed contact or tolerating harm.",
        "zh": "八项丧失与哀伤题涉及未获回应的爱、责怪、嫉妒、内疚与难以前行等不同体验。认同感受不证明采取行动，均分也不确立哀伤阶段或期限。往前走不必意味着寻找新伴侣；任何结果都不要求原谅、复合、恢复联系或忍受伤害。"
      }
    ]
  },
  {
    "id": "ctl-context-calculation",
    "title": {
      "en": "Reverse keys, unequal lengths and an exact example",
      "zh": "反向键、不同题量与完整算例"
    },
    "paragraphs": [
      {
        "en": "The domains contain 7, 9, 7, 8, 2 and 8 items. Responses are 1–4; items 7, 13, 15 and 32–41 use 5 minus the response. For interest responses 4, 2, 1, 3, 4, 1 and 2, the last becomes 3, giving keyed sum 18 and mean 18 ÷ 7, displayed as 2.57. Calculation retains the unrounded mean.",
        "zh": "六领域分别7、9、7、8、2、8题。选择1—4；第7、13、15及32—41题用5减原选择。关注领域回答4、2、1、3、4、1、2时，末项变为3，计分和18，均值18÷7，显示2.57；计算保留未舍入值。"
      },
      {
        "en": "The corresponding complete sum ranges are 7–28, 9–36, 7–28, 8–32, 2–8 and 8–32. Different item counts make raw sums unsuitable for ranking domains. Converting each to a 1–4 mean does not establish equal precision or a common calibrated psychological unit. This page does not sum six means, make a percentage, infer a strongest capacity or provide a validated change threshold.",
        "zh": "相应完整和范围为7—28、9—36、7—28、8—32、2—8与8—32。题量不同，不能据原始和排名领域；换为1—4均值也不确立同等精度或共同校准心理单位。本页不相加六均值、不换百分比、不推断最强爱的能力，也不提供验证过的变化阈值。"
      }
    ]
  },
  {
    "id": "ctl-context-evidence",
    "title": {
      "en": "What the published evidence does and does not establish",
      "zh": "已发表证据支持什么、尚未支持什么"
    },
    "paragraphs": [
      {
        "en": "The 2018 development paper examined German and Polish samples, factor structure, internal consistency, associations with other measures and four-week retest stability. Its final six-factor model followed item reduction; the authors also identified the two-item sexual-passion scale for further refinement. These findings concern studied versions and samples, not a universal measure of relationship worth. [1]",
        "zh": "2018发展论文考察德语、波兰语样本、因素结构、内部一致性、与其他测量的关联，以及四周重测稳定性。最终六因素模型经过题目精简，作者亦指出两题性激情量表有待进一步改进。结论对应所研究版本与样本，不是关系价值的通用度量。[1]"
      },
      {
        "en": "Reproducing English statements does not reproduce that evidence for a new Chinese translation, different response wording or a new website interpretation. This working display has no established local norms or cross-language equivalence. An association with another questionnaire is not a diagnosis, a causal explanation of a breakup or proof that changing a score improves a relationship. Read item content, context and the limits of the particular version together.",
        "zh": "复用英文陈述，不会为新中文译文、不同选项措辞或新网站解读复现那些证据。本工作显示尚无已建立的本地常模或跨语言等价。与另一问卷关联，不是诊断、分手的因果解释或改变分数会改善关系的证明。需要一并阅读题文、背景与具体版本的限制。"
      }
    ]
  },
  {
    "id": "ctl-context-adaptation",
    "title": {
      "en": "Attribution, adaptations and a voluntary next step",
      "zh": "署名、改编与自愿选择的下一步"
    },
    "paragraphs": [
      {
        "en": "The English item source remains Kapusta and colleagues’ 2018 article under CC BY 4.0. The new Chinese working translation, web presentation and explanatory guides are identified adaptations, with no claim of author endorsement. Current author-site wording is a separate reference, not a replacement item bank. The complete attribution stays visible alongside the test. [2][3]",
        "zh": "英文题文来源保留为Kapusta等2018文章，按CC BY 4.0使用。新中文工作译文、网页呈现与解释指南明确为改编，不声称作者背书。当前作者站措辞是独立参考，不是替代题库；完整署名在测试旁保持可见。[2][3]"
      },
      {
        "en": "If useful, privately choose one statement and separate a remembered example from what remains unknown. Any conversation or sharing stays optional. Start opens question one directly without an additional agreement, account or payment. Progress saving is a separate opt-in choice; copying a public link contains no personal responses or domain means. You can also read the six guides and finish here.",
        "zh": "如有帮助，可私下选一条陈述，区分回想的例子与尚未知的部分；对话和分享均自愿。点击开始直接进入第一题，无需追加同意、账户或付款。保存进度另行自选，复制公开链接不含个人回答或领域均值；也可只读六篇指南后结束。"
      }
    ]
  }
];

export const ctlLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is this the same as a thirty-item capacity-to-love quiz?",
      "zh": "这与30题爱的能力测验一样吗？"
    },
    "answer": {
      "en": "No. This edition preserves the 2018 Table 1’s forty-one statements, domain membership and reverse keys. Different editions cannot be assumed interchangeable.",
      "zh": "不同。本版保留2018表一41条陈述、领域归属与反向键，不能假定不同版本可互换。"
    }
  },
  {
    "question": {
      "en": "Does the test ask about how often an action occurred?",
      "zh": "这里询问行为频率吗？"
    },
    "answer": {
      "en": "Use the four original numeric applicability choices. This is not the four-week frequency format used in some other reflections.",
      "zh": "使用原四个数值适用程度选项；不是某些其他反思采用的四周频率形式。"
    }
  },
  {
    "question": {
      "en": "Are choices 2 and 3 unscored or neutral?",
      "zh": "2和3是不计分或中立项吗？"
    },
    "answer": {
      "en": "No. Both are numeric intermediate answers and enter the calculation. There is no NA option in this source form.",
      "zh": "不是。两者都是参与计算的数字中间选项，源题本没有NA选项。"
    }
  },
  {
    "question": {
      "en": "Why can a two-item sum be lower than a nine-item sum?",
      "zh": "为什么两题和可能低于九题和？"
    },
    "answer": {
      "en": "The possible sum ranges differ with item count. Comparing them does not identify stronger or weaker domains; means also lack a common calibrated psychological unit.",
      "zh": "可能和范围随题量不同；比较它们不能识别更强或更弱领域，均值也没有共同校准心理单位。"
    }
  },
  {
    "question": {
      "en": "Does a reversed answer mean my feeling is wrong?",
      "zh": "反向计分表示感受有错吗？"
    },
    "answer": {
      "en": "No. It applies the source’s mathematical key, 5 minus the chosen value. It does not settle questions of privacy, consent, desire or grief.",
      "zh": "不表示。它按来源数学键向计算5减原值，不裁定隐私、同意、欲望或哀伤。"
    }
  },
  {
    "question": {
      "en": "Can the result tell how much my partner loves me?",
      "zh": "结果能知道伴侣多爱我吗？"
    },
    "answer": {
      "en": "No. This attempt contains your self-report, without the partner’s independent answers or observed behaviour.",
      "zh": "不能。本次只有自己的自报，没有对方独立回答或行为观察。"
    }
  },
  {
    "question": {
      "en": "Does a change between attempts prove therapeutic improvement?",
      "zh": "两次分数变化证明治疗改善吗？"
    },
    "answer": {
      "en": "No change threshold has been established for this working display. Different reference relationships, contexts or understanding can also affect answers.",
      "zh": "本工作显示未建立变化阈值；参照关系、背景或题意理解不同，也可能影响回答。"
    }
  },
  {
    "question": {
      "en": "Do I have to agree again after Start?",
      "zh": "点击开始后还必须再次同意吗？"
    },
    "answer": {
      "en": "No. Start opens question one directly. No signup or payment is required; saving progress remains optional.",
      "zh": "不必。直接进入第一题，无需注册或付款，保存进度仍自选。"
    }
  }
];

export const ctlLandingReferences: NonNullable<Questionnaire["references"]> = [];
