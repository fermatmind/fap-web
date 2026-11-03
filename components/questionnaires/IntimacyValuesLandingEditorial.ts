import type { Questionnaire } from "@/lib/questionnaires/types";
export const intimacyValuesLandingSections: Questionnaire["guide"] = [
  {
    "id": "intimacy-values-purpose",
    "title": {
      "en": "Intimacy values: what conditions matter to you?",
      "zh": "亲密关系价值观：哪些相处条件对你重要？"
    },
    "paragraphs": [
      {
        "en": "This original reflection asks how much importance you place on stated conditions in adult, voluntary intimate relationships. The five topics are privacy and personal space, playfulness and variety, steadiness and predictability, trust through clear expectations, and emotional closeness. They can coexist: wanting personal space need not rule out closeness, and liking variety need not rule out dependable arrangements.",
        "zh": "本原创反思询问：在成年、自愿的亲密关系中，题目所述条件对你有多重要。五个主题为隐私与个人空间、轻松与变化、稳定与可预期、清楚预期中的信任及情感靠近。它们可以并存：重视个人空间未必排斥靠近，喜欢变化也未必排斥可靠的安排。"
      },
      {
        "en": "The question is about your priorities, not whether a partner currently meets them or how satisfied you are. A high rating for trust, for example, says that clear expectations matter to you; it cannot show that someone is trustworthy. No partner responses, private history or intimate acts are needed. The five free guides explain the topics without assigning a relationship type.",
        "zh": "这里询问个人重视程度，不是伴侣当前是否满足条件，也不是你有多满意。例如，信任主题的高评分表示清楚预期对你重要，不能证明某人值得信任。无需另一人的答案、私人经历或私密行为资料。五篇免费指南解释这些主题，不分配关系类型。"
      }
    ]
  },
  {
    "id": "intimacy-values-answer",
    "title": {
      "en": "How to rate importance, including uncertainty and declining",
      "zh": "怎样评价重要程度：区分不确定与不愿评价"
    },
    "paragraphs": [
      {
        "en": "Answer from your own present view of the conditions described. Use the five ordered anchors from not important to me to extremely important to me. The middle value, 3, means moderately important; it is not a neutral agreement response or evidence that the condition is absent from your life. Avoid answering for what a partner, family or imagined ideal couple would prefer.",
        "zh": "从自己当前的看法出发，评价题中条件。五个有序选项从对我不重要到对我极其重要；中间值3表示中等重要，不是认同度中立，也不说明生活中缺少该条件。无需替伴侣、家人或想象中的理想伴侣回答。"
      },
      {
        "en": "When unsure, without a suitable context, or unwilling to rate, use the separate unscored option. This counts as a response but supplies no number. All twenty-five prompts require a response before the summary, while you remain free to stop and read any guide without answering. The approximate five minutes is a reading-and-rating estimate, not a deadline or a request to disclose more.",
        "zh": "不确定、没有合适情境或不愿评价时，可选独立的未评分。它算一次回应，不提供数字。生成摘要前需要回应全部二十五题，但你始终可以停止，或不作答直接读指南。约五分钟只是阅读评分的估计，不是限时，也不要求进一步披露。"
      }
    ]
  },
  {
    "id": "intimacy-values-topics",
    "title": {
      "en": "Five topics, with different questions to clarify",
      "zh": "五个主题，各自澄清不同的问题"
    },
    "paragraphs": [
      {
        "en": "Privacy and personal space concerns choices about information and room for oneself. Playfulness and variety concerns an unforced sense of lightness and flexibility. Steadiness and predictability concerns understandable arrangements and ways of handling change. A useful distinction is between a condition you value and a rule imposed on someone else: your rating does not create an obligation for another person.",
        "zh": "隐私与个人空间关注信息选择和保留自己的余地；轻松与变化关注不被迫表现的轻松感与灵活性；稳定与可预期关注可理解的安排及应对变化的方式。应区分自己重视的条件与强加给别人的规则：你的评分不为他人产生义务。"
      },
      {
        "en": "Trust through clear expectations concerns stated intentions and agreements; emotional closeness concerns feeling understood and being able to approach without compulsory disclosure or constant contact. These topic labels are not attachment categories or five validated subscales. Each guide discusses examples and possible tensions within its topic rather than declaring that everyone with the same mean has the same needs.",
        "zh": "清楚预期中的信任关注说明意图与约定；情感靠近关注被理解和能够靠近，而不要求强制披露或持续联系。这些主题名称不是依恋分类，也不是五个经过验证的分量表。各指南讨论例子与主题内部可能的张力，不把相同均值的人视为有相同需要。"
      }
    ]
  },
  {
    "id": "intimacy-values-arithmetic",
    "title": {
      "en": "Calculation: four numeric ratings out of five, then a one-decimal mean",
      "zh": "计分读法：五项中至少四项数字，再显示一位小数均值"
    },
    "paragraphs": [
      {
        "en": "Each topic has five prompts. Add the numeric ratings and divide by how many were rated; unscored responses stay out of both numerator and denominator. At least four numeric ratings are required in that topic. For example, 1, 3, 4 and 5 give a sum of 13 and 13 ÷ 4 = 3.25, displayed as 3.3 / 5 with 4/5 rated. The bank uses no reverse scoring.",
        "zh": "每个主题五题，将数字评分相加，再除以有效项数；未评分同时不进入分子和分母。该主题至少四项数字评分才显示均值。例如1、3、4、5之和为13，13÷4＝3.25，显示为3.3/5，同时注明4/5项有效。本题本不使用反向计分。"
      },
      {
        "en": "Three numeric ratings, even three fives, produce insufficient information rather than a guessed mean. Four is this edition’s reporting requirement, not a scientifically established reliability threshold. A mean also hides patterns: 1, 2, 4 and 5 plus one unscored response yield 3.0, as do five ratings of 3, but their coverage and item-level importance differ.",
        "zh": "只有三项数字评分时，即使三项都选5，也显示资料不足，不猜测均值。四项是本版的报告要求，不是科学验证的信度阈值。均值也会省略差异：1、2、4、5加一项未评分得到3.0，五项都选3也得到3.0，但有效项数与各条件的重要程度不同。"
      }
    ]
  },
  {
    "id": "intimacy-values-interpret",
    "title": {
      "en": "Read five priorities without a winner, compatibility percentage or verdict",
      "zh": "怎样读五项结果：不强找赢家，不换算匹配率"
    },
    "paragraphs": [
      {
        "en": "Read the rated count before the mean, then return to the actual conditions. A larger number records more importance placed on that selected set, not better intimacy or a more desirable personality. All five means may be high or equal. The page keeps their order fixed and produces no total, percentile, ranking, winning type or compatibility score.",
        "zh": "先看有效项数，再看均值，最后回到具体条件。较大数字表示更重视这组选定条件，不表示亲密关系更好或人格更可取。五项均值可以同时较高或相同；页面按固定顺序呈现，不生成总分、百分位、排名、胜出类型或匹配分。"
      },
      {
        "en": "A lower privacy or trust mean does not explain why you answered that way, assess safety, or remove a boundary. Comparing two people’s means is not an established measure of their agreement: each may attach a different meaning to the same condition. If your responses change, first check context, understanding and which items were rated. No validated change threshold or relationship-outcome prediction is supplied here.",
        "zh": "隐私或信任均值较低，不解释作答原因、不评估安全，也不取消边界。比较两个人的均值，不是已建立的共识测量：双方可能对同一条件有不同理解。回答变化时，应先核对情境、理解与哪些题获得评分。本页没有经过验证的变化阈值，也不预测关系结局。"
      }
    ]
  },
  {
    "id": "intimacy-values-boundaries",
    "title": {
      "en": "Consent, privacy and personal choice remain outside the score",
      "zh": "同意、隐私与个人选择不由分数决定"
    },
    "paragraphs": [
      {
        "en": "Consent and respect are baseline conditions in this questionnaire, not benefits to exchange for a higher rating. A result does not permit pressure, unwanted contact, forced disclosure or demands for someone else’s answers. The relationship-education resource love is respect describes boundaries as what people are comfortable with and how they wish to be treated; boundaries can be communicated and changed by choice. [1]",
        "zh": "同意与尊重是本问卷的底线，不是换取较高评分的利益。结果不授权施压、非自愿接触、强制披露或索要别人的答卷。关系教育资源love is respect将边界说明为个人感到自在的范围及希望被对待的方式；边界可以沟通，也可由本人自主调整。[1]"
      },
      {
        "en": "For digital privacy, discuss the specific action rather than treating a score as permission: whether information may be shared, a post made or an image tagged. Public guidance on digital boundaries also distinguishes agreeing an arrangement from surrendering control of personal information. [2] You may keep this reflection private. No answer establishes that a relationship is safe or that a conversation must take place.",
        "zh": "涉及数字隐私时，应讨论具体行动，例如信息是否可转述、内容是否可发布、照片是否可标记，而不是把分数当许可。数字边界公开指南也区分共同约定与交出个人信息控制权。[2] 你可以不公开本次反思；任何答案都不证明关系安全，也不规定必须进行一次对话。"
      }
    ]
  },
  {
    "id": "intimacy-values-use",
    "title": {
      "en": "From a priority to a concrete, optional conversation",
      "zh": "从一项重视的条件，形成具体且自愿的表达"
    },
    "paragraphs": [
      {
        "en": "If a topic feels useful and discussion is welcome, select one condition rather than presenting the whole result as evidence against a partner. For example: “I value knowing roughly when we will reconnect. Could we agree how to let each other know when plans change?” This is an original conversation example, not another test item. The other person can suggest a different arrangement or decline the discussion.",
        "zh": "如果某主题有帮助，而且双方愿意讨论，可选择一项条件，不把整份结果当作指责伴侣的证据。例如：“我重视大概知道下次联系的时间。计划变化时，我们可以约定怎样通知彼此吗？”这是原创对话例子，不是追加题目；另一方可以提出不同安排，或不参与这次讨论。"
      },
      {
        "en": "Keep what matters to you, what you have observed, and what you are requesting separate. You might value steadiness while observing frequent changes; one is a priority, the other an account of events. If an arrangement is made, check whether it remains practical and voluntary instead of trying to improve a test score. Stopping after one private reflection is also a complete use of this page.",
        "zh": "将自己重视什么、观察到什么、希望提出什么请求分开。你可能重视稳定，同时观察到安排经常变化；前者是重视程度，后者是事件描述。达成安排后，可核对它是否仍然可行且自愿，不必追求提高测试分数。只完成一次私人反思，也已是本页的完整用途。"
      }
    ]
  },
  {
    "id": "intimacy-values-evidence",
    "title": {
      "en": "Original questionnaire, complete guides and clear limits of evidence",
      "zh": "原创题本、完整指南与证据范围"
    },
    "paragraphs": [
      {
        "en": "FermatMind independently authored these twenty-five importance prompts and five long guides. The bank has no established reliability, validity, norms or English–Chinese measurement equivalence. It is not a published sexual-values scale, attachment inventory, satisfaction measure or clinical assessment. The education references support the discussion of boundaries; they do not provide this bank’s items, calculation or validation.",
        "zh": "这二十五条重要程度题目与五篇长指南由费马独立编写，尚未建立信度、效度、常模或英中文测量等值。它不是已发表的性价值观量表、依恋问卷、满意度测量或临床评估。教育参考来源支持边界讨论，不提供本题本的条目、算法或验证结论。"
      },
      {
        "en": "Start opens question one directly. All questions, five separate readings and full guides are free without registration. Answers stay in this page unless you explicitly save a tab draft for up to twenty-four hours; completion, exit-and-clear or retaking deletes it. Sharing includes only the public title and entry link. Optional anonymous activity counting is separate from answering and includes no ratings.",
        "zh": "点击开始直接进入第一题。全部题目、五项独立读数及完整指南均免费，无需注册。回答保留在本页，只有主动选择才保存最多24小时的标签页草稿；完成、退出清除或重测时删除。分享只包含公开标题与入口。可选匿名活动计数独立于作答，不包含评分。"
      }
    ]
  }
];
export const intimacyValuesLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does this measure what I value or what my partner does?",
      "zh": "这里测自己重视什么，还是伴侣做得怎样？"
    },
    "answer": {
      "en": "It records how important the stated conditions are to you. It does not measure how often a partner meets them, your satisfaction with a relationship, or another person’s intentions.",
      "zh": "它记录所述条件对你的重要程度，不测伴侣多常做到、你对关系的满意度或另一人的意图。"
    }
  },
  {
    "question": {
      "en": "Is the middle response neutral?",
      "zh": "中间选项表示中立吗？"
    },
    "answer": {
      "en": "Here 3 means moderately important. If you cannot or do not wish to judge importance, choose unscored. Agreement, importance and missing information are different response tasks.",
      "zh": "这里的3表示中等重要。无法或不愿评价重要程度时，可以选未评分；认同度、重要程度和资料缺失是不同的回应任务。"
    }
  },
  {
    "question": {
      "en": "What does 3.3 / 5 mean in the worked example?",
      "zh": "算例中的3.3/5怎样得到？"
    },
    "answer": {
      "en": "Four ratings of 1,3,4,5 sum to 13. Dividing by four gives 3.25, rounded to 3.3. The fifth unscored item is excluded, not counted as zero. This is descriptive arithmetic, not a population comparison.",
      "zh": "1、3、4、5这四项之和为13，除以四得到3.25，取一位小数为3.3。第五项未评分被排除，不记零。这是描述性计算，不是人群比较。"
    }
  },
  {
    "question": {
      "en": "Can privacy and emotional closeness both be very important?",
      "zh": "隐私与情感靠近可以都很重要吗？"
    },
    "answer": {
      "en": "Yes. The topics are not opposite ends of one scale. You can value being understood while retaining personal space and control over what you disclose. No score requires sacrificing one to obtain the other.",
      "zh": "可以。它们不是同一量尺的两端。你可以重视被理解，同时保留个人空间和披露选择；没有分数要求牺牲一项才能获得另一项。"
    }
  },
  {
    "question": {
      "en": "Should we compare our numbers to decide compatibility?",
      "zh": "可以比较两人的数字决定是否合适吗？"
    },
    "answer": {
      "en": "No validated compatibility rule is provided. Similar means can hide different item patterns and meanings; different means do not decide a relationship’s future. Discuss a concrete expectation voluntarily if useful.",
      "zh": "本页没有经过验证的匹配规则。相同均值可能隐藏不同条目模式与含义，不同均值也不决定关系未来。如有帮助，可自愿讨论一项具体预期。"
    }
  },
  {
    "question": {
      "en": "Can I use the result without sharing it?",
      "zh": "不分享结果也能使用吗？"
    },
    "answer": {
      "en": "Yes. You can keep one useful question privately or stop after reading. No partner participation, answer exchange or disclosure of private history is required.",
      "zh": "可以。你可以私下保留一个有用的问题，也可以读完就结束。无需伴侣参与、交换答卷或披露私人经历。"
    }
  },
  {
    "question": {
      "en": "Do I need a current relationship to read or reflect?",
      "zh": "必须正在一段关系中才能阅读或反思吗？"
    },
    "answer": {
      "en": "Every guide is open without answering. If a prompt has no suitable context for you, leave it unscored. Do not invent a partner’s behaviour to create a rating; this page asks only about your own view of the stated conditions.",
      "zh": "所有指南均可不作答直接阅读。若某题缺少合适情境，可保留未评分，不必虚构伴侣行为来产生评分；本页只问你对所述条件的看法。"
    }
  },
  {
    "question": {
      "en": "Does clicking Start require another agreement?",
      "zh": "点击开始还需要再同意一次吗？"
    },
    "answer": {
      "en": "No. The button opens the first question. Optional tab saving and anonymous activity counting are not conditions of access. All five guides remain available without finishing.",
      "zh": "不需要，按钮直接打开第一题。可选标签页保存与匿名活动计数不是进入条件；不完成测试也能阅读五篇完整指南。"
    }
  }
];
export const intimacyValuesLandingReferences = [
  {
    "title": {
      "en": "love is respect: understanding and communicating personal boundaries",
      "zh": "love is respect：理解与沟通个人边界"
    },
    "url": "https://www.loveisrespect.org/resources/what-are-my-boundaries/"
  },
  {
    "title": {
      "en": "love is respect: digital boundaries and personal information",
      "zh": "love is respect：数字边界与个人信息"
    },
    "url": "https://www.loveisrespect.org/resources/digital-boundaries/"
  }
];
