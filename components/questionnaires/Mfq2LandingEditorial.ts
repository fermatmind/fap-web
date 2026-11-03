import type { Questionnaire } from "@/lib/questionnaires/types";

export const mfq2LandingSections: Questionnaire["guide"] = [
  {
    "id": "mfq2-identity",
    "title": {
      "en": "Which Moral Foundations Test is this? The thirty-six-item MFQ-2",
      "zh": "这是哪一种道德基础测试？36题MFQ-2与六个基础"
    },
    "paragraphs": [
      {
        "en": "This page presents the authors’ thirty-six-item English Moral Foundations Questionnaire-2 and a separately identified FermatMind working Chinese translation. The six foundations are Care, Equality, Proportionality, Loyalty, Authority and Purity, with six items each. The selected document, attribution and adaptation notices are linked below. A page called a moral foundations test may instead use the older five-foundation MFQ or an independently written six-scale test containing Liberty. Matching names or a matching number of bars do not establish an identical instrument.",
        "zh": "本页呈现作者36题英文道德基础问卷第二版（MFQ-2），以及单独标明的费马工作中译。关怀、平等、比例公平、忠诚、权威、纯洁各六题，所选文档、署名与改编说明见下方链接。同叫“道德基础测试”的页面，也可能使用早期五基础MFQ，或另写一套包含自由维度的六组题。名称相似、图表数量相同，不证明是同一测量工具。"
      },
      {
        "en": "Rate how well each statement describes you or your opinions, using the source’s five response anchors. There is no fixed four-week recall period and no correct answer. About seven minutes is an estimate, not a limit or measured average. Start opens question one directly, without another agreement, account or payment. All questions and six complete eight-section guides are free; the public explanations do not contain your answers.",
        "zh": "请按源题五档选项，判断陈述在多大程度上描述自己或自己的观点，没有固定的“四周”回顾期，也没有正确答案。约七分钟是用时估计，不是限时或实测平均。点击开始直接进入第一题，无需再次同意、账户或付款。全部题目与六份各八节的完整指南均免费，公开说明不包含个人答案。"
      }
    ]
  },
  {
    "id": "mfq2-care-opinion",
    "title": {
      "en": "Care: endorsing a concern is different from observing conduct",
      "zh": "关怀：认同一种关切，与观察实际行为不同"
    },
    "paragraphs": [
      {
        "en": "The Care items concern compassion, suffering, emotional pain, comforting others and unmet needs. A higher mean says the offered statements fit your self-description more closely. It does not record whether you noticed a need accurately, whether help was wanted or whether the help was effective. The same endorsement can accompany different practical responses. Conversely, a reservation about a sweeping statement does not establish cruelty or a lack of empathy.",
        "zh": "关怀题围绕同情、受苦、情感痛苦、安慰与未被满足的需求。较高均分表示给定陈述更贴近自我描述，没有记录是否准确发现需求、对方是否愿意接受帮助，以及帮助是否有效。同一种认同可能对应不同实际回应；对宽泛陈述有所保留，也不证明残忍或缺乏同理心。"
      },
      {
        "en": "Consider a fictional exhibition volunteer who notices another volunteer is distressed. Wanting to offer comfort, asking what is useful and having time to help are three different matters. This questionnaire concerns the stated opinions, not a recorded test of those actions. To interpret a response, note which meaning you had in mind and one qualification. You do not need to demonstrate kindness, disclose a real person’s situation or create an incident to justify a score.",
        "zh": "设想一位虚构展览志愿者注意到同伴难过。希望安慰、询问什么有用，以及有时间帮助，是三件不同的事。本问卷询问所给观点，没有实际观察这些行动。解释回答时，可记下想到的含义与一个限定，无需证明自己善良、披露真实个人的处境，或制造事件来解释分数。"
      }
    ]
  },
  {
    "id": "mfq2-two-fairness",
    "title": {
      "en": "Equality and Proportionality: two questions about distribution",
      "zh": "平等与比例公平：分配中的两个问题"
    },
    "paragraphs": [
      {
        "en": "In this selected bank, Equality gives substantial attention to equal income, resources and sharing a joint reward. Proportionality concerns effort, contribution, recognition and reactions to cheating. These are more specific than every everyday meaning of fairness. Equal legal standing, equal opportunity, support according to need and equal final rewards are not interchangeable claims. Nor are effort, visible output and merit automatically the same. Read the actual proposition before answering the foundation’s attractive general name.",
        "zh": "本题的平等组较多涉及相同收入、资源与共同回报的平分；比例公平涉及努力、贡献、认可及对作弊的反应。它们比日常所有“公平”含义更具体。法律地位平等、机会平等、按需要支持和最终报酬相同不是可互换主张；努力、可见产出与功绩也不自动相同。应先读具体命题，再回应基础名称。"
      },
      {
        "en": "For a new fictional example, an exhibition team discusses equal access to entry materials and rewards for extra setup work. A reader might favor equal access while supporting contribution-based rewards, or question how the contribution was recorded. The six-item means do not collect those reasons. Equality and Proportionality are calculated separately, not as complementary percentages or opposite ends of one slider. Endorsing both does not trigger an inconsistency label.",
        "zh": "另举虚构例子：展览团队同时讨论入场资料是否平等可得，以及额外布展工作的回报。读者可能支持平等可得，也支持按贡献奖励，或质疑贡献如何记录。六题均分没有收集这些理由。平等与比例公平分别计算，不是相加为100%的互补比例，也不是同一滑杆两端；两组都认同不会触发“不一致”标签。"
      }
    ]
  },
  {
    "id": "mfq2-group-order",
    "title": {
      "en": "Loyalty and Authority: retain the group and role in the question",
      "zh": "忠诚与权威：保留题目中的群体与角色"
    },
    "paragraphs": [
      {
        "en": "Loyalty items mention country, community and a sports team. Authority items mention traditions, parents, elders, respect and leadership. A community is not automatically a nation or family, and team commitment is not identical to deference toward a leader. The working Chinese version retains the selected English referents. The mean cannot decide whose authority is legitimate, whether a group’s decision is right or who deserves to belong.",
        "zh": "忠诚题涉及国家、共同体与运动队；权威题涉及传统、父母、长辈、尊重与领导。共同体不自动等于国家或家庭，团队承诺也不同于服从领导。工作中译保留所选英文对象。均分不能决定谁的权威正当、群体决定是否正确，或谁有资格归属其中。"
      },
      {
        "en": "In the fictional exhibition team, one person may question a coordinator’s plan because they think it conflicts with the group’s stated purpose; another may follow a procedure because it helps the work. These examples illustrate different reasons, not a scoring key for the two people. Do not derive Authority from Loyalty, infer obedience from compliance alone or treat a lower mean as betrayal. The questionnaire is not a citizenship or employee-selection test.",
        "zh": "在虚构展览团队中，有人可能因为认为安排违背共同目标而质疑协调者；另一人可能因为流程有助工作而遵循。这些例子展示不同理由，不是给两人计分的答案键。不能从忠诚推算权威、只凭照做推断服从观，也不将较低均分解释为背叛。本问卷不检验公民资格或员工录用条件。"
      }
    ]
  },
  {
    "id": "mfq2-purity-scope",
    "title": {
      "en": "Purity: distinguish a reaction, a moral judgment and evidence",
      "zh": "纯洁：区分感受、道德判断与证据"
    },
    "paragraphs": [
      {
        "en": "The selected Purity statements span sacredness of the body, chastity, language, an unusual but harmless sexual preference, medicine origins and virginity before marriage. These subjects should not be collapsed into hygiene or health. The qualifiers harmless and chemically identical matter to the propositions. An answer records how well an opinion describes you; the presence of a statement is not endorsement of it by this website or an instruction to act on it.",
        "zh": "所选纯洁题涉及身体神圣性、贞洁、语言、不常见但无害的性偏好、药物来源及婚前童贞。这些对象不能合并解释成卫生或健康。“无害”与“化学成分相同”都是命题的重要限定。回答记录观点与自己的贴切程度；页面呈现某条陈述，不表示本站认可它，或要求据此采取行动。"
      },
      {
        "en": "A person can report unease while deciding that the feeling is not a reason to condemn someone else. The scale does not record that later reasoning, verify harm or evaluate anyone’s private life. Similarly, a response to the medicine statement is not evidence about treatment safety or effectiveness. Higher and lower means are neither cleaner and dirtier nor more and less worthy. Keep a personal reaction separate from a claim about another person.",
        "zh": "一个人可以报告不自在，同时认为这种感受不足以谴责别人。量尺没有记录之后的推理、验证伤害，或评价私人生活。同样，对药物命题的回答不提供治疗安全性或有效性证据。较高与较低均分不是更干净与更脏，也不是价值更高与更低，应将私人反应与对他人的主张分开。"
      }
    ]
  },
  {
    "id": "mfq2-recalculation",
    "title": {
      "en": "Recalculate six means: no reverse keys, two-decimal display",
      "zh": "复算六项均分：无反向题，两位小数显示"
    },
    "paragraphs": [
      {
        "en": "All thirty-six items keep direct codes from 1 to 5; negative subject matter does not create a reverse key. Every sixth item belongs to the same foundation: Care starts at 1, Equality at 2, Proportionality at 3, Loyalty at 4, Authority at 5 and Purity at 6. A complete foundation’s sum ranges from 6 to 30. Divide its unrounded sum by six and display two decimals. The report computes this from the sum, without rounding to one decimal first.",
        "zh": "36条都保留1—5正向编码，题目提到负面内容不产生反向键。每隔六题属于同一基础：关怀从1开始、平等从2、比例公平从3、忠诚从4、权威从5、纯洁从6。完整组总和6—30，用未舍入总和除6，再显示两位小数；报告从原始和计算，不先舍入成一位小数。"
      },
      {
        "en": "A fresh six-item example selects 5,1,4,2,3,5: sum 20 and mean 3.33. Changing the first response to 4 gives 19 ÷6 =3.166666…, displayed 3.17. Replacing it with NA instead withholds that foundation’s displayed sum and mean; it is not divided by five or imputed as 3. Six ratings of 3 and three ratings of 1 plus three of 5 both average 3.00. Decimal places aid arithmetic checking, not a claim that a moral concern is measured to hundredths.",
        "zh": "另例六项依次选5、1、4、2、3、5，总和20，均分3.33。第一项改4，总和19，19÷6＝3.166666…，显示3.17；若改NA，则本基础显示的原始和与均分不足，不改除以5，也不补3。六条均为3，或三项1加三项5，都得到3.00。小数方便核对算术，不声称将道德关切测到百分之一的精度。"
      }
    ]
  },
  {
    "id": "mfq2-research-context",
    "title": {
      "en": "What the research supports, and what still needs testing",
      "zh": "研究支持什么，哪些仍需检验"
    },
    "paragraphs": [
      {
        "en": "Atari and colleagues’2023 development research included three studies with 3,360,3,902 and 1,410 participants, covering 25 populations across the project. It examined the revised six-foundation structure and cross-cultural relationships among moral concerns. [3] That evidence concerns specified samples, items and analyses, rather than universal individual norms. It does not automatically validate this new working translation, the added NA option or a clinical interpretation.",
        "zh": "Atari等2023年的开发研究包含三项研究，样本分别为3,360、3,902和1,410人，整个项目覆盖25个人群，考察修订后的六基础结构及跨文化的道德关切关系。[3] 证据对应特定样本、条目与分析，不是通用个人常模，也不自动验证本工作新译、增设NA或临床解释。"
      },
      {
        "en": "Wild and colleagues’2025 re-analysis used existing cross-sectional convenience-sample data from 1,049 pre-service teachers at one Ghanaian university. It found support for six first-order factors but weak support for the proposed individualizing/binding higher-order structure. [5] This is a re-analysis, not a new independent cohort or evidence about all Ghanaian people. This page reports the six foundation means without creating higher-order totals or ranking cultures.",
        "zh": "Wild等2025年的再分析使用加纳一所大学1,049名职前教师的既有横断面便利样本数据，对六个一阶因子得到支持，但对个体化／联结化高阶结构支持较弱。[5] 这是既有数据再分析，不是新的独立队列，也不代表全部加纳人。本页分别报告六基础均分，不另造高阶总分或文化排名。"
      }
    ]
  },
  {
    "id": "mfq2-language-reading",
    "title": {
      "en": "Read all forty-eight sections with the edition in view",
      "zh": "结合版本，阅读全部48节指南"
    },
    "paragraphs": [
      {
        "en": "All six eight-section guides remain available whether personal figures are present or withheld. Each distinguishes scope, higher, lower, mixed or missing readings, a worked example, a counterexample, practical comparison and source/method. No highest-foundation identity or goodness total is generated. A group mean can hide markedly different answers; compare the offered statements rather than using someone else’s presumed foundation to explain their motives.",
        "zh": "六份各八节的指南，无论个人数字完整或不足都可读。每份区分范围、较高、较低、混合或缺失、算例、反例、具体比较与来源方法，不生成最高基础身份或善良总分。均分可能掩盖差异很大的回答，应比较给定陈述，不拿他人假想的基础解释动机。"
      },
      {
        "en": "The English edition follows the selected author document, including its known item 27 wording difference from the preprint. Chinese is a working translation with the selected referents preserved, not a claim of official or measurement-equivalent status. The visible attribution retains authors, source, licence and modification notices. [1][2][4] When retaking, record the language and version before comparing answers; a numerical change alone is not established moral development.",
        "zh": "英文遵循选定作者文档，包括第27题与预印本的已知措辞差异；中文是保留所选对象的工作译本，不声称官方身份或测量等价。可见署名保留作者、来源、许可与修改说明。[1][2][4] 重测时先记录语言与版本，再比较回答；单纯数字变化不是已确立的道德发展。"
      }
    ]
  }
];

export const mfq2LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is Liberty one of these six MFQ-2 foundations?",
      "zh": "本版六个MFQ-2基础包括自由吗？"
    },
    "answer": {
      "en": "No. This selected MFQ-2 separates Equality and Proportionality alongside Care, Loyalty, Authority and Purity. Other six-scale tests may contain Liberty but use a different bank; their scores are not interchangeable.",
      "zh": "不包括。本版将平等与比例公平分开，另有关怀、忠诚、权威、纯洁。其他六维测试可能含自由，但题本不同，分数不互换。"
    }
  },
  {
    "question": {
      "en": "Are these agreement or recent-behavior frequency ratings?",
      "zh": "这是同意程度，还是近期行为频率？"
    },
    "answer": {
      "en": "Use the five source describes-me anchors for yourself or your opinions. This is not a count of recent actions and has no fixed recent recall period. Preserve that instruction when comparing versions.",
      "zh": "请使用源题五档“描述自己或观点的贴切程度”，不是近期行动次数，也没有固定近期回顾期。比较不同版本时，应保留说明的区别。"
    }
  },
  {
    "question": {
      "en": "Can Equality and Proportionality both be high?",
      "zh": "平等与比例公平能同时较高吗？"
    },
    "answer": {
      "en": "Yes. They use different statements and separate means, not complementary percentages. Which conditions or distribution problems you had in mind is not collected by the five response categories.",
      "zh": "可以。两组使用不同陈述、分别求均分，不是互补百分比。你想到哪些条件或分配问题，五档选项并未收集。"
    }
  },
  {
    "question": {
      "en": "Why are cheating or unease items not reversed?",
      "zh": "提到作弊或不自在的题为什么不反向？"
    },
    "answer": {
      "en": "Direction follows the source key, not whether the sentence sounds negative. All thirty-six selected items are direct. The punishment-of-cheating item contributes to Proportionality and the unease item to Purity without reversal.",
      "zh": "方向由源键决定，不由句子是否提到负面内容决定。所选36条均正向，惩罚作弊题计入比例公平，不自在题计入纯洁，都不反向。"
    }
  },
  {
    "question": {
      "en": "Does a mean of 3.33 mean 66.6 percent morality?",
      "zh": "3.33表示66.6%的道德程度吗？"
    },
    "answer": {
      "en": "No. It is a rounded mean of six 1–5 response codes. Dividing by five does not create a moral percentage or a population percentile, and these means do not need to add to 100.",
      "zh": "不是。它是六项1—5编码平均后的舍入值，除以5不会得到道德百分比或人群百分位，六项均分也不要求相加为100。"
    }
  },
  {
    "question": {
      "en": "How is a mean such as 3.17 calculated?",
      "zh": "为什么完整报告保留两位小数？"
    },
    "answer": {
      "en": "The dedicated report divides the original sum by six, then displays two decimals. For example 19/6 becomes 3.17, not a rounded 3.2 reformatted as 3.20. This supports recalculation, not stronger psychological precision.",
      "zh": "专用报告用原始和除6，再显示两位小数，例如19/6显示3.17，不是先变3.2再写3.20。这样便于复算，不代表更强的心理测量精度。"
    }
  },
  {
    "question": {
      "en": "Must I register or acknowledge another notice after Start?",
      "zh": "开始后还要注册或再次勾选同意吗？"
    },
    "answer": {
      "en": "No. Start opens the first question directly. Full questions and all six guides are free; optional temporary saving is separate from answering. Attribution and edition information remain visible without becoming an extra gate.",
      "zh": "不需要，点击开始直接进入第一题。全部题目及六份指南免费，临时保存另行自愿选择；署名与版本信息可见，但不成为额外门槛。"
    }
  },
  {
    "question": {
      "en": "Does international research establish this Chinese edition’s equivalence?",
      "zh": "国际研究能证明这个中译版等价吗？"
    },
    "answer": {
      "en": "No. Published samples and validation analyses do not establish equivalence for a new translation or added response policy. The working Chinese label and complete-six NA rule remain explicit; no assumed Chinese population average is supplied. [3]",
      "zh": "不能。发表的样本与效度分析不建立新译文或新增选项政策的等价。本页明确保留工作中译标签与完整六题NA规则，不提供假定的中国人口平均。[3]"
    }
  }
];

export const mfq2LandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Wild, Fobi and Möhring (2025): MFQ-2 re-analysis in Ghanaian pre-service teachers",
      "zh": "Wild等（2025）：加纳职前教师MFQ-2数据再分析"
    },
    "url": "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1665536/full"
  }
];
