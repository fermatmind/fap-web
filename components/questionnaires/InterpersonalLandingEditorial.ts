import type { Questionnaire } from "@/lib/questionnaires/types";
export const interpersonalLandingSections: Questionnaire["guide"] = [
  {
    "id": "interpersonal-purpose",
    "title": {
      "en": "Interpersonal preferences: actions and wishes in six separate readings",
      "zh": "人际偏好反思：六项行动与期望分别阅读"
    },
    "paragraphs": [
      {
        "en": "This original twenty-four-item reflection records what you recall initiating and what you wished others would initiate during the past four weeks. Invitations, practical coordination and personal warmth each have an action part and a wish part. Six complete guides are freely available before and after answering.",
        "zh": "这份二十四条原创反思记录过去四周你回想自己主动做了什么，以及希望别人主动做什么。参与邀请、实际协调和个人关心各有行动与期望两个部分，六篇完整指南均可在作答前后免费阅读。"
      },
      {
        "en": "Use one ordinary, voluntary group or familiar interaction as your reference. These are contextual self-reports, not observations of everyone involved or a measurement of hidden needs. Several parts can be frequent together; the result does not select a dominant interpersonal type.",
        "zh": "请以一个普通、自愿的小组或熟悉互动为参照。这些是情境自报，不是对所有参与者的观察，也不测量隐藏需要。多个部分可以同时频繁出现，结果不选出主导人际类型。"
      }
    ]
  },
  {
    "id": "interpersonal-participation",
    "title": {
      "en": "Participation: opening an invitation and hoping to receive one",
      "zh": "参与：主动邀请与希望收到邀请"
    },
    "paragraphs": [
      {
        "en": "Initiating participation concerns inviting someone into an activity or conversation, letting them know there is room, and checking whether they want to join. It records an invitation, not whether the person accepted, felt included or enjoyed the activity. A low frequency may reflect few opportunities rather than rejection of other people.",
        "zh": "主动邀请参与关注邀请别人加入活动或交谈、告知仍可参与，以及询问对方是否愿意加入。它记录邀请，不证明对方接受了、感到被接纳或享受活动。频率较低可能是机会较少，不必然表示排斥他人。"
      },
      {
        "en": "Wanting invitations concerns wishing to be told about activities or offered a place in a shared plan. You can enjoy inviting others while rarely wanting invitations yourself, or want an invitation without initiating one. Neither pattern establishes loneliness, exclusion or social confidence; those questions require their own evidence.",
        "zh": "期望收到邀请关注希望获知活动或得到共同安排中的参与机会。你可能喜欢邀请别人，却较少希望收到邀请；也可能希望被邀请，却没有主动邀请。这些组合均不能证明孤独、被排斥或社交信心，需要另行核查实际经历。"
      }
    ]
  },
  {
    "id": "interpersonal-coordination",
    "title": {
      "en": "Coordination: proposing structure and wanting practical help",
      "zh": "协调：提出安排与期望实际协助"
    },
    "paragraphs": [
      {
        "en": "Initiating coordination includes proposing a next step, offering a division of work for consideration, coordinating after checking agreement and following up an agreed plan. The scope is practical cooperation. Frequent proposals do not establish authority, leadership ability or permission to decide for everyone.",
        "zh": "主动提出协调包括提出下一步、提供分工建议供人考虑、确认同意后承担协调，以及跟进已商定计划。这里关注实际合作；经常提议不能证明权威、领导能力或替所有人决定的权限。"
      },
      {
        "en": "Wanting coordination from others concerns wishing someone would clarify agreed responsibilities, suggest an outline or keep track of a plan. This can coexist with initiating coordination. It does not establish dependency or willingness to give up choices: asking for a timetable and accepting another person’s unrestricted control are different actions.",
        "zh": "期望别人提供协调关注希望有人澄清已同意的职责、提出安排提纲或跟进计划，可以与自己主动协调同时出现。它不证明依赖或愿意放弃选择；请人提供时间表与接受对方无限制控制是不同的事情。"
      }
    ]
  },
  {
    "id": "interpersonal-warmth",
    "title": {
      "en": "Personal warmth: offering care and welcoming a response",
      "zh": "个人关心：主动提供与期待回应"
    },
    "paragraphs": [
      {
        "en": "Initiating personal warmth concerns ordinary encouragement, checking whether a familiar person wants to talk, expressing appreciation and offering to listen. Checking willingness matters: an offer leaves room for the other person to decline. Frequency alone cannot establish empathy, the quality of listening or how the recipient felt.",
        "zh": "主动表达个人关心关注日常鼓励、询问熟悉的人是否想聊、表达感谢和提出倾听。确认意愿很重要，提供关心仍给对方拒绝的空间。单凭频率不能证明共情、倾听质量或接收者的感受。"
      },
      {
        "en": "Wanting personal warmth concerns wishing to receive encouragement, appreciation or an invitation to talk without being obliged to disclose. A frequent wish is not proof that support was absent; an infrequent wish is not proof that someone does not care. The questionnaire asks neither for intimate details nor for an explanation of your history.",
        "zh": "期望获得个人关心关注希望得到鼓励、欣赏或可自由拒绝的交谈邀请。经常期待不证明支持缺失，较少期待也不证明不在乎他人。问卷不要求提供隐私细节或解释个人经历。"
      }
    ]
  },
  {
    "id": "interpersonal-method",
    "title": {
      "en": "How the six means are calculated: four items, at least three ratings",
      "zh": "六项均分怎样计算：每组四条，至少三条数字评分"
    },
    "paragraphs": [
      {
        "en": "Each part has four equally weighted items rated from 1 (Never) to 5 (Very often), with no reverse scoring. Its displayed mean is the sum of numeric responses divided by the number rated, rounded to one decimal. Ratings 1, 3, 4 and 5 give 13 ÷ 4 = 3.3 after rounding. This describes the selected response categories, not a percentage of real-life interactions.",
        "zh": "每部分四条，采用1（从不）至5（非常经常）的等权评分，没有反向题。展示均分为数字评分之和除以有效条数，保留一位小数。例如1、3、4、5得到13÷4，四舍五入为3.3。这概括所选回答类别，不是现实互动中的发生百分比。"
      },
      {
        "en": "At least three numeric responses are required in a part. Ratings 1, 3, 4 and one unscored response give 8 ÷ 3 = 2.7; two numeric responses produce insufficient information instead. Unscored responses are not replaced by zero, Never or a midpoint. All twenty-four items require a response, but choosing the unscored option is a valid response.",
        "zh": "每部分至少需要三条数字评分。1、3、4和一条未评分得到8÷3，显示2.7；只有两条数字则显示资料不足。未评分不补零、不当作从不，也不补中点。全部二十四条都需回应，但选择未评分是有效回应。"
      }
    ]
  },
  {
    "id": "interpersonal-reading",
    "title": {
      "en": "Read action and wish together without inventing a gap score",
      "zh": "行动与期望并读，不另造差距分"
    },
    "paragraphs": [
      {
        "en": "The six readings remain independent. There is no total, subtraction of action and wish, ideal balance, compatibility index or population ranking. A displayed 4.0 for initiating participation and 2.0 for wanting invitations are two contextual summaries; their arithmetic difference is not a measured relationship problem.",
        "zh": "六项保持独立，不生成总分、不将行动与期望相减、不设置理想平衡、匹配指数或人群排名。主动邀请4.0与期望邀请2.0是两项情境概括；两数之差不是测得的关系问题。"
      },
      {
        "en": "Before interpreting a pattern, check the context, opportunities and number of rated items. A new group, an agreed organizing role or a quiet month can change what there was to do or hope for. For a later reflection, retain the same kind of context and recall period; a changed mean alone cannot distinguish lasting change from circumstances or response variation.",
        "zh": "解读前核对情境、机会与有效条数。新小组、已约定的组织角色或平静的一个月，都会改变能做什么、会期待什么。以后复盘时尽量保持相近情境与回顾时段；均分变化本身不能区分长期变化、环境影响与作答波动。"
      }
    ]
  },
  {
    "id": "interpersonal-evidence",
    "title": {
      "en": "FIRO-B background and the evidence for this original reflection",
      "zh": "FIRO-B背景与本原创反思的证据"
    },
    "paragraphs": [
      {
        "en": "FIRO distinguishes expressed and wanted aspects of Inclusion, Control and Affection; the publisher describes FIRO-B and FIRO Business as distinct instruments. This supplies conceptual background for separating what one initiates from what one wants others to initiate. It does not make this original twenty-four-item reflection an official administration, shortened edition or interchangeable score. [2]",
        "zh": "FIRO区分融入、控制与情感联结中的表达和期望，出版方也区分FIRO-B与FIRO Business工具。这为区分自己主动做什么、期望别人主动做什么提供概念背景，不代表这份二十四条原创反思是正式施测、缩短版或可互换分数。[2]"
      },
      {
        "en": "The present item bank has no established reliability, validity, norms or cross-language measurement equivalence. Transparent arithmetic explains how a result is produced; it cannot supply those studies. Evidence for a different licensed instrument does not validate these items. Use the six guides for voluntary reflection rather than diagnosis, employee selection or decisions about another person.",
        "zh": "本题本尚未建立信度、效度、常模或跨语言测量等值。透明算式解释结果如何产生，不能代替这些研究。其他授权工具的证据不验证本版条目。六篇指南适合自愿反思，不用于诊断、员工筛选或替其他人下结论。"
      }
    ]
  },
  {
    "id": "interpersonal-practice",
    "title": {
      "en": "Turn a reading into a specific, optional conversation",
      "zh": "把读数转为具体、可选择的沟通"
    },
    "paragraphs": [
      {
        "en": "Choose one recent interaction rather than announcing a type. For example: “For our next group plan, would you like me to send an invitation, or would you prefer to ask when you are interested?” For coordination, ask what would be useful and who agrees to do it. For warmth, offer listening while leaving room for silence or a later conversation.",
        "zh": "选择一次近期互动，而不是宣布一个类型。例如：“下次小组安排，你希望我发邀请，还是你感兴趣时再来问？”涉及协调时，询问什么协助有用、谁同意承担；涉及关心时，提出愿意倾听，同时允许沉默或改日再聊。"
      },
      {
        "en": "Compare your interpretation with the other person’s freely offered feedback; your wish does not establish their intention or obligation. Choose one small agreed change and review what actually happened. Answers are calculated in the browser; temporary draft recovery is optional. Public guides and share links provide general reading material, not another person’s private answers.",
        "zh": "将自己的解释与对方自愿提供的反馈核对；你的期望不证明对方意图或义务。商定一个小调整，再复盘实际发生了什么。答案在浏览器计算，临时保存进度可自愿选择。公开指南与分享链接提供通用阅读材料，不提供他人的私人答案。"
      }
    ]
  }
];
export const interpersonalLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What does this interpersonal preferences test measure?",
      "zh": "人际偏好反思测试记录什么？"
    },
    "answer": {
      "en": "It records your recalled action and wish frequencies in invitations, coordination and personal warmth: six independent parts, four original items each. It describes one four-week context rather than measuring latent interpersonal needs or assigning a personality type.",
      "zh": "它记录参与邀请、协调和个人关心中的自报行动与期望频率，分为六个独立部分，每部分四条原创题。它描述一个四周情境，不测量潜在人际需要，也不派发人格类型。"
    }
  },
  {
    "question": {
      "en": "Is wanting an invitation the same as being excluded?",
      "zh": "期望邀请等于被排斥吗？"
    },
    "answer": {
      "en": "No. Wanting an invitation records a wish, not whether an invitation was offered or refused. Check actual events and ask the people involved rather than inferring exclusion, loneliness or their motives from a mean.",
      "zh": "不是。期望邀请记录一个愿望，不说明是否收到或拒绝邀请。应核对实际事件、询问相关的人，不凭均分推断排斥、孤独或他人动机。"
    }
  },
  {
    "question": {
      "en": "Can I both organize plans and want help organizing?",
      "zh": "可以既主动协调，又期待别人协调吗？"
    },
    "answer": {
      "en": "Yes. You might propose a next step and also want someone to clarify responsibilities. These can concern different tasks in the same context. Neither part cancels the other, and the test calculates no discrepancy or dependency score.",
      "zh": "可以。你可能提出下一步，同时希望有人澄清职责，也可能对应同一情境中的不同任务。两项不互相抵消，测试不计算差距或依赖分。"
    }
  },
  {
    "question": {
      "en": "Does a high personal-warmth mean prove empathy?",
      "zh": "个人关心均分高就证明共情好吗？"
    },
    "answer": {
      "en": "No. Offering encouragement or listening is a reported action; its frequency does not establish how well it was received. Wanting warmth is a reported wish. Understand the specific interaction and the other person’s freely given feedback.",
      "zh": "不能。鼓励或倾听是自报行动，其频率不证明接收效果。期待关心是自报愿望。应结合具体互动与对方自愿给出的反馈理解。"
    }
  },
  {
    "question": {
      "en": "How are missing ratings handled?",
      "zh": "未评分怎样处理？"
    },
    "answer": {
      "en": "A part needs three of its four numeric ratings. One unscored response permits a three-item mean; two or more produce insufficient information. Unscored responses are never filled with zero or an average. Never is a numeric 1, which differs from having no relevant context.",
      "zh": "每部分四条中至少三条数字才能显示均分。一条未评分仍可计算三条均分，两条或更多则资料不足。未评分不补零或平均数；从不是数字1，与没有相关情境不同。"
    }
  },
  {
    "question": {
      "en": "Is there a best score or interpersonal compatibility result?",
      "zh": "有没有最佳分数或人际匹配结果？"
    },
    "answer": {
      "en": "No. There are six separate means and complete readings, without a total, winning type, percentile or action-minus-wish score. Another person’s responses are not collected or compared. Useful arrangements depend on the people’s actual preferences and agreement.",
      "zh": "没有。结果为六项独立均分与完整读法，没有总分、胜出类型、百分位或行动减期望分。不收集或比较另一个人的回答，合适安排取决于相关者的实际偏好与同意。"
    }
  },
  {
    "question": {
      "en": "Can the Chinese and English results be compared as validated equivalents?",
      "zh": "中英文结果能当作已验证的等值分数比较吗？"
    },
    "answer": {
      "en": "No. Both languages use the same item identifiers, response values and calculation, but that is not evidence of cross-language measurement equivalence. Read each result in its language and context; do not use it for population comparisons or infer that small differences are meaningful.",
      "zh": "不能。两种语言使用相同题目标识、选项数值和算法，但这不构成跨语言测量等值证据。应结合各自语言和情境阅读，不作人群比较，也不认定微小差别具有意义。"
    }
  },
  {
    "question": {
      "en": "Can I start without registering or agreeing to save answers?",
      "zh": "可以不注册、不同意保存就开始吗？"
    },
    "answer": {
      "en": "Yes. Start test opens the first item without a required consent or saving checkbox. All questions and complete readings are free. Draft saving is optional and limited to this tab for twenty-four hours; completing, clearing or retaking removes it. Public guides contain no personal scores.",
      "zh": "可以。点击开始测试直接进入第一题，没有必选的同意或保存复选框。全部题目与完整读法免费。保存进度为自愿操作，仅限本标签页二十四小时；完成、清除或重测会删除。公开指南不含个人分数。"
    }
  }
];
