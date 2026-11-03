import type { Questionnaire } from "@/lib/questionnaires/types";

export const relationshipValuesLandingSections: Questionnaire["guide"] = [
  {
    "id": "relationship-values-scope",
    "title": {
      "zh": "爱情阵营测试测什么？四类关系价值的相对选择",
      "en": "What does the Relationship Values Test explore? Four relative priorities"
    },
    "paragraphs": [
      {
        "zh": "爱情阵营测试通过24组日常关系情境，比较浪漫表达与仪式感、务实协作与共同建设、情感陪伴与相互理解、共同成长与彼此独立。它关注本次给定选项之间你更自然的选择。“阵营”是方便浏览的名称；这些方向既不是全部关系价值的清单，也不是固定恋爱身份。",
        "en": "The Relationship Values Test compares twenty-four pairs of everyday relationship choices involving rituals, practical partnership, emotional companionship and growth with autonomy. It records which offered option feels more natural in this attempt. Camp names are browsing labels: these themes neither exhaust relationship values nor define a fixed romantic identity."
      },
      {
        "zh": "请以近期较常见的经历为参照，保持同一理解作答。假设场景中选择共同任务，并不意味着现实里从不重视纪念；选择个人目标，也不意味着不在意关系。解释需要回到具体情境、可用时间和已经商定的安排，不能从一次计数补写动机。",
        "en": "Use a consistent reference to recent, typical experiences. Selecting a shared task does not establish indifference to special occasions; selecting a personal goal does not establish indifference to the relationship. Interpret choices through context, time and actual agreements rather than supplying motives from a single count."
      }
    ]
  },
  {
    "id": "relationship-ritual-meaning",
    "title": {
      "zh": "浪漫表达：共同意义与仪式的具体形式",
      "en": "Romantic expression: shared meaning and the form of a ritual"
    },
    "paragraphs": [
      {
        "zh": "这个方向涉及纪念时刻、象征表达和特别体验。应区分“想让一个时刻有意义”与“必须按某种形式庆祝”：仪式可以很简短，也可以被双方重新定义。题目中选择仪式的次数不测量浪漫能力、消费意愿，或收到同样回应的权利。",
        "en": "This theme concerns memorable occasions, symbolic expression and special experiences. Distinguish wanting a moment to matter from requiring a particular celebration. A ritual can be brief or redefined together. Its selected count measures neither romantic skill nor willingness to spend, and does not entitle anyone to a matching response."
      },
      {
        "zh": "虚构例子：有人完成一项学习计划，想保留一张手写便签，对方更想帮忙整理下一步。可以先问“你现在希望我记住这个时刻，还是一起处理后续？”分享好消息及所感知的回应与关系体验有关的研究，提供讨论背景；它没有验证本题的仪式计数，也不能证明特定庆祝方式更好。[2]",
        "en": "Fresh example: after completing a course, one person wants a handwritten note while another offers help with the next step. Ask whether marking the occasion or handling the follow-up is wanted now. Research on sharing good news and perceived responses supplies context for discussion, not validation of this ritual count or proof that a particular celebration is better.[2]"
      }
    ]
  },
  {
    "id": "relationship-cooperation-requests",
    "title": {
      "zh": "务实协作：把共同建设落实到明确约定",
      "en": "Practical partnership: turn shared aims into explicit agreements"
    },
    "paragraphs": [
      {
        "zh": "务实协作的选项涉及分工、执行、资源安排与解决具体问题。阅读时分别核对：任务是否确实共同承担、对方是否请求协助、谁能决定方法、什么时候完成。偏好实际行动与是否拥有完成任务的能力，是不同问题；次数也不决定谁应该承担更多劳动。",
        "en": "Practical-partnership options concern task division, execution, resources and concrete problems. Check whether a task is actually shared, whether help was requested, who chooses the method and when it is needed. Preferring action and having the ability to complete a task are different matters; a count does not allocate more work to either person."
      },
      {
        "zh": "例如一次共同出行前，一方提出核对路线，另一方想先讨论这趟旅行对各自的意义。可以把“需要确认的实际条件”与“希望交流的期待”分开。即使实际安排已经完成，也应核对它是否回应了明确需求；不能把效率当作爱的数量，或替代尚未达成的同意。",
        "en": "Before a fictional shared trip, one person proposes checking the route while the other wants to discuss what the trip means. Separate practical conditions from expectations to discuss. Completing arrangements still leaves the question of whether they answered an expressed request. Efficiency is not an amount of love and cannot replace an agreement still to be made."
      }
    ]
  },
  {
    "id": "relationship-companionship-response",
    "title": {
      "zh": "情感陪伴：区分倾听、理解与自行推断",
      "en": "Emotional companionship: distinguish listening, understanding and inference"
    },
    "paragraphs": [
      {
        "zh": "这一方向围绕分享、倾听和被理解的情境。选择谈话不证明能准确识别另一人的感受，也不意味着对方现在愿意倾诉。可以用具体问题核对：“希望我听一会儿、一起想办法，还是稍后再聊？”对方也可能需要题目没有列出的回应。",
        "en": "This theme concerns sharing, listening and feeling understood. Choosing conversation does not prove accurate knowledge of another person’s feelings or willingness to disclose now. Check whether listening, considering solutions or talking later would help. An unlisted response may be preferred."
      },
      {
        "zh": "关系研究中的联结感，是与他人相连和被理解的体验；它不同于在二选一里选中“陪伴”的次数。[1] 实际讨论可以分别记录对方明确说了什么、自己推断了什么、还有什么未知。这样能把自我观察转成可核对的信息，而不是把分数当作共情水平。",
        "en": "Relatedness in relationship research concerns feeling connected and understood, distinct from selecting companionship in paired choices.[1] In a discussion, separate what was explicitly said, what you inferred and what remains unknown. That turns reflection into checkable information rather than an empathy rating."
      }
    ]
  },
  {
    "id": "relationship-autonomy-growth",
    "title": {
      "zh": "成长自主：个人选择与共同目标可以同时存在",
      "en": "Growth and autonomy: personal choices can coexist with shared aims"
    },
    "paragraphs": [
      {
        "zh": "成长自主涉及个人发展、自主判断与保留空间。自我决定理论把自主理解为行动出于本人认可的意愿，而非必须独立或远离他人；相关关系研究也区分自主与疏离。[1] 这是帮助澄清概念的参照，本页四方向并非该理论的三种基本需要量表。",
        "en": "Growth and autonomy concern development, personal judgment and room for individual choices. Self-determination theory defines autonomy through volition and endorsement of action, rather than obligatory independence or distance; relationship research distinguishes these concepts.[1] This clarifies terminology. The four themes here are not a measure of that theory’s three basic needs."
      },
      {
        "zh": "例如两人都认可一个共同目标，却希望各自决定准备方式。可以讨论共同截止时间与个人方法，而不预先要求所有步骤一起做。反过来，想独立安排也不自动取消已经承担的共同责任。计数不能决定某项责任是否成立，应以真实约定和具体影响为依据。",
        "en": "Two people might endorse the same goal while wanting different preparation methods. Discuss a shared deadline and individual methods without presuming every step must be joint. Wanting independence also does not automatically cancel agreed shared responsibilities. The count cannot establish those responsibilities; use actual agreements and consequences."
      }
    ]
  },
  {
    "id": "relationship-count-examples",
    "title": {
      "zh": "计分与并列：24次选择怎样对应15种结果",
      "en": "Scoring and ties: how twenty-four choices produce fifteen result patterns"
    },
    "paragraphs": [
      {
        "zh": "四方向每两项比较4次，共6组配对、24题；每方向出现12次，且在两个选项位置各出现6次。选择某项，该方向加1，四项合计恒为24，每项范围0—12。它们是同一答卷内部的相对计数，彼此受约束，不能当作四个独立强度、百分位或关系质量评分。",
        "en": "Each pair of themes is compared four times: six pairings and twenty-four items. Every theme appears twelve times, six in each option position. A selection adds one to its theme. Four counts always total twenty-four, each ranging from zero to twelve. These constrained within-attempt counts are not four independent intensities, percentiles or relationship-quality ratings."
      },
      {
        "zh": "按仪式、协作、陪伴、自主的顺序，8／8／4／4保留仪式与协作并列；7／7／7／3保留前三项并列；6／6／6／6保留全部四项。5／7／6／6则只有协作最高。共有4个单项、6个两项、4个三项、1个四项结果，全部15篇各7节、合计105节免费公开。相邻计数不自动合并，全部相等也不代表理想平衡。",
        "en": "In rituals, cooperation, companionship and autonomy order, 8/8/4/4 preserves a two-way tie; 7/7/7/3 preserves the first three; 6/6/6/6 preserves all four. In 5/7/6/6 only cooperation leads. Four singles, six pairs, four triples and one four-way tie give fifteen public guides, seven sections each and 105 in total. Nearby counts are not automatically merged, and equal totals do not establish ideal balance."
      }
    ]
  },
  {
    "id": "relationship-research-boundaries",
    "title": {
      "zh": "科学依据怎样区分？研究概念、本站题本与关系结论",
      "en": "Distinguishing evidence: research concepts, this bank and relationship conclusions"
    },
    "paragraphs": [
      {
        "zh": "Patrick等人的三项研究考察需要满足与关系体验；Gable等人的四项研究考察积极事件分享及回应。[1][2] 它们为讨论自主、联结和互动提供研究语境，但没有使用本站24题、四方向或15种计数组合。研究中的关联不能据此变成本页的预测效度、准确率或关系改善承诺。",
        "en": "Patrick and colleagues examined need fulfillment and relationship experiences in three studies; Gable and colleagues examined positive-event sharing and responses in four.[1][2] They contextualize autonomy, connection and interaction without testing these twenty-four items, four themes or fifteen count patterns. Their associations do not establish this bank’s predictive validity, accuracy or improvement outcomes."
      },
      {
        "zh": "本站保留原创题本与透明算法，尚未完成独立信度、效度、常模或中英文测量等值研究。它也不同于依恋的焦虑／回避维度、爱的语言分类或爱的三角模型。既不能相互换算，也不能据一人的选择判断双方匹配程度；更多篇幅与可复算公式本身，不等于测量已经得到验证。",
        "en": "The original bank has transparent arithmetic but lacks independent reliability, validity, norms and English–Chinese measurement-equivalence studies. It also differs from attachment anxiety/avoidance, love-language categories and triangular love models. Scores are not convertible, and one person’s selections cannot establish two-person compatibility. Longer explanations and reproducible formulas alone do not validate measurement."
      }
    ]
  },
  {
    "id": "relationship-use-privacy",
    "title": {
      "zh": "从结果到具体讨论：完整阅读、自愿分享与隐私",
      "en": "From result to discussion: complete reading, voluntary sharing and privacy"
    },
    "paragraphs": [
      {
        "zh": "先读原始次数，再读所有最高方向的指南，选一个近期例子核对。可以问：“当时我重视什么？对方明确表达了什么？下一次可以提出哪项具体邀请？”解释不替双方决定分工、边界或是否继续关系，也不要求索取伴侣答卷。未作答也可阅读全部指南。",
        "en": "Read the counts and every leading-theme guide, then check one recent example. Ask what mattered to you, what the other person explicitly expressed and what concrete invitation could help next time. Interpretation does not decide duties, boundaries or whether to continue a relationship, and does not require a partner’s answers. All guides are readable without completing the quiz."
      },
      {
        "zh": "开始直接进入题目，无需账户、邮箱、付款或再次点击同意。默认不保存；主动保存的标签页草稿24小时后过期，完成、重测或退出清除时删除。分享功能复制结果名称与公开指南链接，不附答案或次数。公开指南可被任何持链接者阅读，应与私人作答记录区分。",
        "en": "Start enters the questions without an account, email, payment or another consent click. Saving is optional; tab drafts expire after twenty-four hours and clear on completion, retake or exit-and-clear. Sharing copies the result name and public guide link without answers or counts. Anyone with that public link can read the guide; it is distinct from a private response record."
      }
    ]
  }
];

export const relationshipValuesLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "爱情阵营测试与恋爱人格测试有什么区别？",
      "en": "How does this differ from the Love Personality Test?"
    },
    "answer": {
      "zh": "本页比较仪式、协作、陪伴与成长自主的关系价值选择；恋爱人格测试整理表达、回应、空间与修复的互动入口。题意和方向不同，不能互换分数，也不因名称相近而属于同一类型系统。",
      "en": "This page compares rituals, cooperation, companionship and growth/autonomy priorities. Love Personality concerns expression, response, space and repair as interaction entries. Different item meanings and themes prevent score conversion or a shared type system."
    }
  },
  {
    "question": {
      "zh": "仪式计数较低，是否意味着不重视关系？",
      "en": "Does a lower ritual count mean the relationship matters less?"
    },
    "answer": {
      "zh": "不能这样推断。它只说明在所列配对中较少选中仪式方向，可能更多选择实际协作或其他方向。关系投入、真实行动和当时资源要另行观察，题本没有测量爱的数量。",
      "en": "No. It means fewer ritual options were selected against these alternatives. Practical cooperation or another theme may have been selected more. Investment, actual actions and resources require separate observation; the bank does not measure an amount of love."
    }
  },
  {
    "question": {
      "zh": "为什么合作与自主都可能较高？",
      "en": "How can cooperation and autonomy both be relatively high?"
    },
    "answer": {
      "zh": "题目分别比较不同情境，某些题更重共同执行，另一些更重个人判断。两者可以同时取得较高次数；这不证明已经平衡两者，也不决定真实生活中该怎样分配。",
      "en": "Different items address different situations: joint execution may matter in one, personal judgment in another. Both can receive relatively high counts without establishing a balance or prescribing an allocation in real life."
    }
  },
  {
    "question": {
      "zh": "两人的结果相同，能算匹配率吗？",
      "en": "Can matching results be turned into a compatibility percentage?"
    },
    "answer": {
      "zh": "不能。本页仅记录单人选择，没有双人模型、匹配公式或预测研究。相同标签还可能来自不同答案；如果双方愿意，可围绕一个具体安排讨论各自理由，而不计算配对结论。",
      "en": "No. This is an individual response record without a dyadic model, matching formula or prediction study. Identical labels can come from different answers. If both wish, discuss reasons for a concrete arrangement rather than calculate a matching verdict."
    }
  },
  {
    "question": {
      "zh": "四项各6次，是否应该重测直到出现最高项？",
      "en": "Should I retake until an equal four-way result has a leader?"
    },
    "answer": {
      "zh": "不需要。各6次是有效的完整结果，四篇方向和并列指南都可阅读。为得到某个标签反复作答，会改变作答目的；先比较具体题目中的情境，比强求唯一最高项更有信息。",
      "en": "No. Six per theme is a valid complete result with all theme guides and the tie guide available. Repeated attempts to obtain a label change the purpose of answering. Compare concrete situations before seeking a unique leader."
    }
  },
  {
    "question": {
      "zh": "没有伴侣，或者某些情境不适用，可以使用吗？",
      "en": "Can I use this without a partner or when a situation does not fit?"
    },
    "answer": {
      "zh": "可以先阅读说明与公开指南；若作答，可一致参照自己能理解的近期经历。不要编造伴侣资料。两项都不贴近时可以停止，未完成不会生成解释；本题本尚无针对不同关系经历的等值验证。",
      "en": "You may read the explanations and public guides first. If answering, use a consistent reference to recent experiences you can understand, without inventing partner details. Stop if neither option fits; incomplete attempts do not generate an interpretation. Equivalence across relationship histories has not been established."
    }
  },
  {
    "question": {
      "zh": "为什么一两次选择变化就可能改变结果名称？",
      "en": "Why can one or two changed choices alter the result label?"
    },
    "answer": {
      "zh": "改变一题会从原方向减1、向新方向加1；接近最高值时可能产生或解除并列。名称变化不等于整个人发生变化，应核对版本、情境与具体选择。本版没有最小有意义变化或重测误差界限。",
      "en": "Changing one item subtracts one from its old theme and adds one to the new one. Near the maximum this can create or remove a tie. A changed label does not establish a changed person: check version, context and responses. This edition has no smallest meaningful change or retest-error threshold."
    }
  }
];

export const relationshipValuesLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Patrick等（2007）：需要满足与关系体验",
      "en": "Patrick et al. (2007): need fulfillment and relationship functioning"
    },
    "url": "https://selfdeterminationtheory.org/wp-content/uploads/2014/04/2007_PatrickKneeCanevelloLonsbary_PSPB.pdf"
  },
  {
    "title": {
      "zh": "Gable等（2004）：积极事件分享与回应",
      "en": "Gable et al. (2004): sharing positive events and responses"
    },
    "url": "https://www.sas.rochester.edu/psy/people/faculty/reis_harry/assets/pdf/GableReisImpettAsher_2004.pdf"
  }
];
