import type { Questionnaire } from "@/lib/questionnaires/types";

export const trustLandingSections: Questionnaire["guide"] = [
  {
    "id": "trust-scope",
    "title": {
      "en": "What does this Trust Issues Test measure? Actions, not a verdict",
      "zh": "信任问题测试观察什么？具体行动与四个独立方面"
    },
    "paragraphs": [
      {
        "en": "This original reflection records your reported actions during the past four weeks: offering a small opening, building cooperation in stages, clarifying agreements and keeping protective distance. Each group has six statements. They are editorial groupings, not established diagnostic factors. Trust issues is an everyday search term here, not the name of a condition identified by the questionnaire. The questions concern ordinary, low-risk interactions, including collaboration and friendship; a romantic partner is not required.",
        "zh": "这份原创反思记录过去四周你报告的行动：给一点交流入口、分步调整合作、核对约定，以及保留保护性距离，每组六条。四组是编辑整理的行动主题，不是已确立的诊断因子。“信任问题”在这里是日常检索用语，不是问卷识别的病名。题目围绕普通、低风险相处，包括协作与友谊，不要求有恋爱伴侣。"
      },
      {
        "en": "All twenty-four questions and four complete guides are free without registration. Start opens question one directly. About six minutes is an estimated reading time, not a measured average or time limit. Every item needs a selection before the report appears; not experienced / cannot judge is a valid selection. It preserves missing experience rather than inventing a personal rating.",
        "zh": "全部24题和四份完整指南免费，无需注册，点击开始直接进入第一题。约六分钟是阅读用时估计，不是实测平均或限时。每条都有选择才生成报告；“未经历／无法判断”也是有效选择，它保留经历不足，不虚构个人评分。"
      }
    ]
  },
  {
    "id": "trust-opening",
    "title": {
      "en": "Offering an opening: specify what access you actually offered",
      "zh": "初次开放：说明给了什么空间"
    },
    "paragraphs": [
      {
        "en": "An opening can be small: sharing an ordinary interest, inviting nonurgent input or giving someone a bounded role. The group asks how often you did those things when an opportunity arose. It does not establish that the recipient deserved unrestricted access, nor does it require sharing secrets, account permissions or sensitive personal information. More reported openings are not evidence of greater kindness, better judgment or freedom from disappointment.",
        "zh": "一个入口可以很小：分享普通兴趣、征求不紧急的意见，或交给对方一项边界清楚的工作。本组询问有机会时这些行动出现得多频繁，不认定对方值得不受限制的权限，也不要求分享秘密、账户权限或敏感个人资料。报告更多入口，不证明更善良、判断更好或不会失望。"
      },
      {
        "en": "For a fictional example, you invite a new club member to suggest one publicly available photograph for a poster. You retain the final selection and do not share the member list. The opening concerns that contribution only. A lower frequency may reflect few new contacts or a preference for existing arrangements. The response categories do not collect enough context to distinguish those explanations; use a concrete event rather than a global label.",
        "zh": "另举虚构例子：你邀请一位新社团成员，为海报推荐一张公开可用的照片，保留最终选择，也不分享成员名单。入口只涉及这项贡献。较低频率可能来自近期很少接触新人，或更常沿用已有安排。选项不足以区分这些解释，应回到具体事件，不给自己贴总体标签。"
      }
    ]
  },
  {
    "id": "trust-staging",
    "title": {
      "en": "Building in stages: adjustment is not a compulsory progression",
      "zh": "逐步建立：调整范围，不规定关系升级"
    },
    "paragraphs": [
      {
        "en": "This group includes a small first commitment, an openly agreed review point, reducing an initial check after follow-through and restarting with a limited task. A later step may keep, enlarge or reduce the scope; choosing not to continue is also possible. These statements do not define a developmental ladder, an ideal waiting period or a requirement that someone earn greater intimacy. One successful task supplies information about that task, not every area of life.",
        "zh": "本组包括先作小承诺、公开商定回顾点、履约后减少最初的检查，以及从有限任务重新开始。后续可以保留、扩大或缩小范围，也可以不再继续。这些陈述不构成发展阶梯、理想等待时间，或要求某人通过表现换取更亲密关系。一项任务顺利，只提供有关这项任务的信息，不覆盖生活所有领域。"
      },
      {
        "en": "In the poster example, two volunteers agree to review their public-image suggestions together before deciding whether to prepare the next poster. Both know the arrangement and may decline. Planting false information to test loyalty is a different action, not an extension of this exercise. No questionnaire result obliges you to stage another encounter, resume contact or increase access.",
        "zh": "沿用海报例子，两位志愿者约定先共同看一次公开图片建议，再分别决定是否制作下一张海报；双方知道安排，也能拒绝。故意放出假消息考验忠诚，是另一种行动，不是本练习的延伸。任何结果都不要求再安排一次见面、恢复联系或增加权限。"
      }
    ]
  },
  {
    "id": "trust-clarity",
    "title": {
      "en": "Clarifying agreements: mutual scope rather than surveillance",
      "zh": "约定核对：共同范围与信息边界"
    },
    "paragraphs": [
      {
        "en": "Clarification concerns roles, permissions, audiences, examples and the parts of an arrangement that may change or be declined. It can accompany both an initial opening and a staged collaboration. Asking who may edit a shared file is not the same question as deciding how to change cooperation after a completed task. A higher frequency does not prove that agreements were effective or that the other person was unreliable.",
        "zh": "核对涉及分工、权限、受众、具体例子，以及可以改变或拒绝的部分。它可以与初次开放和分步合作同时出现。询问谁能编辑共享文件，与完成任务后决定怎样调整合作，是不同问题。较高频率不证明约定有效，也不说明对方不可靠。"
      },
      {
        "en": "A bounded question might be: “May we use this image on the club poster only, and who can change the draft?” It specifies an audience and a task. Demanding private messages, passwords or unrelated explanations is not made appropriate by calling it checking. The questionnaire records selected actions, not the adequacy of permission or a right to obtain information from someone else.",
        "zh": "一个范围清楚的问题可以是：“这张图是否只用在社团海报上，谁可以改草稿？”它说明受众与任务。索要私人聊天、密码或无关解释，不会因为叫作“核对”就变得合适。本题记录所选行动，不认证许可是否充分，也不赋予向他人索取资料的权利。"
      }
    ]
  },
  {
    "id": "trust-distance",
    "title": {
      "en": "Protective distance: read the setting and the tradeoff",
      "zh": "保护性距离：结合情境与取舍阅读"
    },
    "paragraphs": [
      {
        "en": "The distance group records actions such as retaining work yourself, keeping a concern private, withdrawing before asking or preparing a backup for someone else’s part. All six items keep direct scoring. A higher mean means more frequent reports of these particular actions; it is not a reverse-coded diagnosis of low trust. Opening one topic and protecting another can coexist without contradiction.",
        "zh": "距离组记录把任务留给自己、保留一件心事、未询问就退出，或为他人负责的部分准备备份等行动。六条均正向计分。较高均分表示这些具体行动报告得更频繁，不是反向算出的“低信任”诊断。一个主题开放、另一个主题保留，可以同时存在而不矛盾。"
      },
      {
        "en": "Keeping the poster draft yourself might preserve control but add work; letting another person suggest an image might share a task without sharing personal material. Neither choice alone reveals its cause. The bank cannot establish trauma history, attachment style, a disorder or whether contact is safe. You do not need to reduce a boundary to obtain a preferred score or demonstrate progress.",
        "zh": "自己保留海报草稿可能维持控制，也可能增加工作；让别人推荐图片则可以分担任务而不分享个人资料。任何单一选择都不能揭示原因。题本不能认定创伤经历、依恋风格、障碍或接触是否安全，不需要为了得到理想分数或证明进步而降低边界。"
      }
    ]
  },
  {
    "id": "trust-arithmetic",
    "title": {
      "en": "Recalculate the result: six direct ratings, one decimal",
      "zh": "结果怎样复算？六项正向评分与一位小数"
    },
    "paragraphs": [
      {
        "en": "The five frequency categories receive 1–5, from almost never to almost every time. They refer to opportunities you recall, not a count of incidents. All six valid ratings are required for a group’s displayed sum and mean: add the six codes, then divide by six and display one decimal. The possible sum is 6–30 and mean 1–5. There is no reversal, combined trust total, subtraction between groups, percentile or highest-group identity.",
        "zh": "五个频率类别从“几乎没有”到“几乎每次”编码1—5，针对能回忆到的机会，不是事件次数。某组六项均有效才显示原始和与均分：六个编码相加，再除以6，显示一位小数。总和范围6—30、均分1—5；不反向，不合成信任总分，不相减，不生成人群百分位或最高组身份。"
      },
      {
        "en": "A fresh example uses 5,2,4,3,1,5: sum 20 and 20 ÷ 6 = 3.333…, displayed 3.3. Replacing the first response with NA leaves five valid ratings but withholds this group’s displayed sum and mean. It is not averaged over five or filled with a middle value. Other complete groups remain available. Six ratings of 3 and three ratings of 1 plus three of 5 both give 3.0; look at the actions behind an identical mean.",
        "zh": "另例六项选择5、2、4、3、1、5，总和20，20÷6＝3.333…，显示3.3。第一项改为NA后，保留五项有效题数，本组显示的原始和与均分不足，不改除以5，也不补中间值；其他完整组仍可阅读。六项都为3，与三项1加三项5，均分都为3.0，应继续看相同均分背后的行动。"
      }
    ]
  },
  {
    "id": "trust-evidence",
    "title": {
      "en": "Trust research and this original questionnaire: different measurements",
      "zh": "信任研究与本站原创问卷：区分测量对象"
    },
    "paragraphs": [
      {
        "en": "Camanto and Campbell’s 2025 measurement studies examined romantic-partner trust in samples of 494 and 847, including newly formed and longer-term relationships. Their refined item set addressed predictability, dependability and faith. [1] Those constructs concern expectations about a partner. Here the four groups summarize your reported everyday actions. The research does not validate this bank, establish its factors or authorize converting its means into a partner-trust score.",
        "zh": "Camanto与Campbell在2025年的两项测量研究中，分别以494和847人的样本考察恋爱伴侣信任，涉及新建立和较长期关系；修订题组讨论可预测性、可依赖性与信念。[1] 这些构念关注对伴侣的预期，而本站四组汇总自己报告的日常行动。该研究不验证本题、不确立本题因子，也不支持把本题均分换算为伴侣信任分。"
      },
      {
        "en": "A separate 2001 study coded communicated attributions in discussions by 35 married couples. It linked trust with features of explanations expressed in those conversations, rather than testing these twenty-four items. [2] Relationship-specific findings therefore provide questions for interpretation, not a universal formula for what your score means. This edition has no established reliability, clinical threshold, population norm or Chinese–English measurement-equivalence evidence.",
        "zh": "另有2001年研究编码了35对已婚夫妇讨论中的归因表达，考察信任与这些对话中解释方式的关系，并未检验本站24条题目。[2] 特定关系研究可提供理解问题的视角，不能成为本次分数的通用公式。本版尚无已建立的信度、临床阈值、人口常模或中英文测量等价证据。"
      }
    ]
  },
  {
    "id": "trust-use",
    "title": {
      "en": "Read all four guides, then return to one real event",
      "zh": "读完四份指南，再回到一件真实事情"
    },
    "paragraphs": [
      {
        "en": "Each group has an eight-section guide, thirty-two sections in total, with explanations, examples, comparisons, tradeoffs and optional private reflection. All remain readable even when personal figures are unavailable. Do not rank groups as competing virtues: the actions differ and opportunities are not standardized. The page collects neither a partner’s observations nor an independent record of what happened.",
        "zh": "每组都有八节完整指南，合计32节，包括解释、例子、比较、取舍及可选私人观察；个人数字不足时，全文仍可读。不要将四组排成互相竞争的优点：行动不同，机会也未标准化。页面不收集伴侣的观察，也没有事件的独立记录。"
      },
      {
        "en": "If useful, choose an ordinary event that has already happened. Privately note the scope you offered, what was agreed, what changed and what you kept to yourself, without names or identifying details. An alternative explanation is as useful as a confirming example. Retake differences may reflect opportunities, recall or changed circumstances; they do not establish recovery or personality change. No notes, disclosure or further test are required.",
        "zh": "如有帮助，可选择一件已经发生的普通事情，私下记下自己给了什么空间、约定了什么、后来有什么改变，以及保留了什么，不写姓名或可识别细节。另一种解释与支持性例子同样有价值。重测差异可能来自机会、回忆或环境变化，不证明康复或人格改变；无需上传笔记、披露经历或继续做其他测试。"
      }
    ]
  }
];

export const trustLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is this the published Rempel partner-trust scale?",
      "zh": "这是发表的Rempel伴侣信任量表吗？"
    },
    "answer": {
      "en": "No. This bank has twenty-four original frequency statements about your actions. The cited research examines different items and constructs; its evidence cannot be assigned to this edition. [1]",
      "zh": "不是。本站是24条询问自身行动频率的原创陈述。所引研究的条目与构念不同，其证据不能直接归于本版。[1]"
    }
  },
  {
    "question": {
      "en": "Do I answer about my partner or about myself?",
      "zh": "替伴侣答，还是回顾自己？"
    },
    "answer": {
      "en": "Answer about your own actions in ordinary, low-risk interactions during the past four weeks. The page does not rate a partner, verify fidelity or predict betrayal.",
      "zh": "回顾过去四周普通、低风险相处中自己的行动。页面不给伴侣评分，不验证忠诚，也不预测背叛。"
    }
  },
  {
    "question": {
      "en": "Are more frequent checks or greater distance a problem?",
      "zh": "核对更多、距离更大就是有问题吗？"
    },
    "answer": {
      "en": "The means record reported frequencies, not a diagnosis or quality judgment. Context, the scope of an agreement and the opportunity to act matter; higher is not automatically better or worse.",
      "zh": "均分记录自报频率，不是诊断或质量评判。情境、约定范围及行动机会都重要，较高不自动意味着更好或更差。"
    }
  },
  {
    "question": {
      "en": "Why not turn the result into a trust percentage?",
      "zh": "为什么不换算“信任百分比”？"
    },
    "answer": {
      "en": "The codes are response categories, not probabilities. Dividing a mean by five would not produce a validated trust percentage, a percentile or the likelihood of a relationship outcome.",
      "zh": "编码是回答类别，不是概率。均分除以5不会得到经过验证的信任百分比、人群百分位或关系结果的可能性。"
    }
  },
  {
    "question": {
      "en": "Are any questions reverse-scored?",
      "zh": "有没有反向计分题？"
    },
    "answer": {
      "en": "No. All twenty-four frequency statements keep their direct 1–5 codes. Protective distance is read separately, not subtracted from opening or used to reverse a total score.",
      "zh": "没有，24条频率陈述都保留1—5正向编码。保护性距离独立阅读，不从开放中扣除，也不用于反向生成总分。"
    }
  },
  {
    "question": {
      "en": "Why does one NA withhold a whole group’s figures?",
      "zh": "为什么一个NA就让整组数字不足？"
    },
    "answer": {
      "en": "This edition requires six valid ratings per group. NA is neither almost never nor sometimes. A shortened denominator would change the content represented; other complete groups and all full guides stay visible.",
      "zh": "本版要求每组六项有效评分。NA既不是“几乎没有”，也不是“有时”；缩小分母会改变所代表的内容。其他完整组及全部指南仍显示。"
    }
  },
  {
    "question": {
      "en": "Must I agree again or register after pressing Start?",
      "zh": "点击开始还需再次同意或注册吗？"
    },
    "answer": {
      "en": "No. Start enters question one directly. All questions and full explanations are free; saving a temporary draft is a separate voluntary choice.",
      "zh": "不需要，点击开始直接进入第一题。全部题目和完整解释免费，临时保存草稿是另一个自愿选择。"
    }
  },
  {
    "question": {
      "en": "Does a changed mean prove trust has improved?",
      "zh": "均分变了能证明信任改善吗？"
    },
    "answer": {
      "en": "No. Compare the recall period, opportunities and individual responses first. This original bank has no established measurement-error or change threshold that would justify calling a difference improvement.",
      "zh": "不能。应先比较回顾时段、行动机会与具体回答。本原创题本尚无已建立的测量误差或变化阈值，不能据分差认定改善。"
    }
  }
];

export const trustLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Rempel, Ross and Holmes (2001): trust and communicated attributions in 35 married couples",
      "zh": "Rempel等（2001）：35对夫妇的信任与归因表达研究"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/11474726/"
  }
];
