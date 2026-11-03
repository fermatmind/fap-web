import type { Questionnaire } from "@/lib/questionnaires/types";
export const controlLandingSections: Questionnaire["guide"] = [
  {
    "id": "control-purpose",
    "title": {
      "en": "Everyday control: how a shared plan gets coordinated",
      "zh": "日常掌控方式：共同计划如何协调"
    },
    "paragraphs": [
      {
        "en": "This twenty-four-statement reflection concerns your own actions in one ordinary, voluntary shared-plan context during the past four weeks. It separately records explaining reasons, inviting input, deciding within an agreed responsibility, clarifying agreements, supporting a plan and reconsidering who coordinates. Every complete guide is free before and after answering.",
        "zh": "这份二十四条反思关注过去四周一个普通、自愿的共同计划中，你自己的行动。分别记录说明理由、邀请参与、在约定职责内决定、明确约定、支持计划与重新商定协调者。全部完整指南在作答前后均免费开放。"
      },
      {
        "en": "The question is what you recall doing, not how much power you possess or whether other people approved. A hobby group or shared outing can provide relevant examples without requiring a formal leadership role. You may find several actions frequent in the same project; they are not mutually exclusive personality types.",
        "zh": "问题是回想自己做了什么，不是拥有多少权力，或其他人是否认可。爱好小组或共同出行都可提供例子，不需要正式领导角色。同一项目中多种行动可能都经常出现，它们不是互斥的人格类型。"
      }
    ]
  },
  {
    "id": "control-reasons-input",
    "title": {
      "en": "Explain a reason and invite input: two observable actions",
      "zh": "说明理由与邀请参与：两种可观察行动"
    },
    "paragraphs": [
      {
        "en": "Explaining reasons concerns making a preference or proposal understandable before asking others to consider it. Frequency does not establish that the reason was persuasive, correct or accepted. For review, distinguish giving a reason from repeating a demand: the other person may understand a proposal and still disagree with it.",
        "zh": "说明理由关注在请别人考虑前，让自己的倾向或提议可被理解。频率不证明理由有说服力、正确或得到接受。复盘时区分给出理由与重复要求；对方理解提议后仍可能不同意。"
      },
      {
        "en": "Inviting shared input concerns asking for contributions to a decision or arrangement. An invitation alone does not prove that everyone could speak freely or that their input changed the outcome. Ask what options were genuinely open and how contributions were considered, rather than interpreting a high mean as a certificate of participation.",
        "zh": "邀请共同参与关注为决定或安排征询意见。发出邀请本身不证明每个人都能自由表达，也不证明意见影响了结果。进一步核查哪些选项确实开放、意见怎样被考虑，不把较高均分当作共同参与的认证。"
      }
    ]
  },
  {
    "id": "control-decisions-rules",
    "title": {
      "en": "A bounded decision is different from making the agreement explicit",
      "zh": "职责内决定与明确约定有什么不同"
    },
    "paragraphs": [
      {
        "en": "Making a bounded decision concerns choices within responsibilities already agreed in that setting. The questionnaire cannot allocate that responsibility or verify its legitimacy. For example, choosing a meeting room within an agreed budget differs from unilaterally changing everyone’s availability or spending limit; the scope comes from the real agreement, not a result label.",
        "zh": "在约定范围内决定关注已有职责内的选择。问卷不能分配该职责，也不能核实其合法性。例如在约定预算内选会议室，与单方面改变所有人的可用时间或开支上限不同；范围来自现实约定，不来自结果标签。"
      },
      {
        "en": "Making shared rules explicit concerns clarifying arrangements so people know what has been agreed. It is not the same as imposing a rule or proving fairness. A useful review names the actual agreement, who understood it, what remained uncertain and when it could be reconsidered. The frequency record cannot answer these questions on anyone else’s behalf.",
        "zh": "明确共同约定关注澄清安排，使人知道已同意什么，不等于强加规则或证明公平。有效复盘应说明实际约定、谁理解了、哪些仍不确定，以及何时可重新讨论。频率记录不能替其他人回答这些问题。"
      }
    ]
  },
  {
    "id": "control-support-handoffs",
    "title": {
      "en": "Supporting and handing over are not measures of submission",
      "zh": "支持与交接不代表顺从程度"
    },
    "paragraphs": [
      {
        "en": "Supporting an agreed plan concerns contributing to an arrangement you have accepted. It does not show dependency, inferiority or an inability to lead. Someone may help carry out a plan while retaining their own preferences and boundaries. Low frequency may reflect few opportunities or a different role, rather than refusal to cooperate.",
        "zh": "支持已同意的计划关注为接受的安排作贡献，不表示依赖、低人一等或无法带领。一个人可以协助执行，同时保留自己的偏好与边界。频率较低可能来自机会少或角色不同，不一定是不愿合作。"
      },
      {
        "en": "Reconsidering who steers concerns revisiting coordination as the situation changes. It may involve a handoff, clarification or a new agreement; it does not prove effective delegation or an appropriate balance of power. Examine whether the person receiving a task understood its scope and could discuss it, rather than treating a high count as proof that the handoff worked.",
        "zh": "按情境重新交接关注情况变化时重新讨论协调方式，可能涉及交接、澄清或新约定，不证明委派有效或权力分配适当。核查接手者是否理解范围并能讨论，不把较高计数当作交接成功的证明。"
      }
    ]
  },
  {
    "id": "control-arithmetic",
    "title": {
      "en": "Four items per area: sums, coverage and one-decimal means",
      "zh": "每组四条：原始和、有效项数与一位小数均分"
    },
    "paragraphs": [
      {
        "en": "Every numeric response uses 1–5 frequency labels; all items are direct. With 1, 2, 4, 5 in one area, the raw sum is 12 across four ratings and the displayed mean is 3.0/5. With 1, 2, 4 and one unscored response, the sum is 7 across three ratings and the displayed mean is 2.3/5. It is not 7/4, and a rounded mean should not be multiplied back to reconstruct the original sum.",
        "zh": "数字回答使用1—5频率标签，所有条目直接计分。一组选择1、2、4、5，原始和12、四条有效，显示均分3.0/5。选择1、2、4及一条未评分，原始和7、三条有效，显示均分2.3/5。不是7/4，也不能把舍入后的均分乘回去重建原始和。"
      },
      {
        "en": "At least three of the four items must be numeric. With only two, the guide remains complete but the personal mean is withheld as insufficient information. Missing opportunity is not scored 1, zero or midpoint. A 3.0 mean is not 60% control, a population percentile, a skill level or an objectively equal amount of authority.",
        "zh": "四条中至少三条为数字才计算均分。仅两条时仍开放完整指南，但以资料不足暂不显示个人均分。缺少机会不填成1、零或中点。均分3.0不表示60%的掌控、人群百分位、技能等级或客观的权力份额。"
      }
    ]
  },
  {
    "id": "control-context-evidence",
    "title": {
      "en": "One context, six original areas and the limits of comparison",
      "zh": "同一情境、六个原创领域与比较边界"
    },
    "paragraphs": [
      {
        "en": "Keep the same ordinary context across the interleaved items. Opportunities to decide, clarify or hand over can vary with role, timing and what actually happened. Six means may all be frequent or infrequent; the page does not add them, choose a winner or place you on a dominant–submissive axis. Different response combinations can also yield the same mean.",
        "zh": "交错作答时保持同一普通情境。决定、澄清或交接的机会，随角色、时机和实际发生的事情变化。六组均分可以都高或都低，本页不相加、不选赢家，也不放到支配—顺从轴上。不同回答组合也可能得到相同均分。"
      },
      {
        "en": "The six-area organisation, items and interpretations were independently authored, without established reliability, factor structure, norms or English–Chinese measurement equivalence. The means describe this attempt under the site’s calculation policy. Another person’s report, a different project or a later attempt is not automatically comparable; a change can reflect opportunity, recall or interpretation as well as changed actions.",
        "zh": "六组组织、条目与解释为独立原创，尚未建立信度、因素结构、常模或英中文测量等值。均分依本站计算政策描述本次作答。他人报告、另一项目或稍后重测并非自动可比；变化可能来自机会、回忆、理解，也可能来自行动变化。"
      }
    ]
  },
  {
    "id": "control-frameworks",
    "title": {
      "en": "Why FIRO-B, DISC and leadership labels are different tasks",
      "zh": "为什么FIRO-B、DISC与领导风格是不同任务"
    },
    "paragraphs": [
      {
        "en": "The FIRO-B publisher distinguishes expressed and wanted interpersonal needs across inclusion, control and affection. That is a different conceptual structure from six concrete shared-plan action areas. This page neither administers those professional items nor infers wanted control from supporting a plan. The publisher source below supplies this distinction only, not our items or validation.[1]",
        "zh": "FIRO-B出版方区分包容、控制、情感三个领域中表达与期望的人际需要，与六组具体共同计划行动属于不同概念结构。本页不施测其专业条目，也不从支持计划推断期望被控制。下方出版方来源仅用于说明区别，不提供本页题目或验证。[1]"
      },
      {
        "en": "DISC entries and leadership quizzes use their own styles, items and output rules. Search terms such as dictator test can also refer to political-character matching, while dominant or submissive may refer to sexual roles. This reflection addresses none of those classifications. Its everyday action means cannot be converted to a commercial scale, political identity, sexual role or entitlement to direct someone else.",
        "zh": "DISC入口与领导风格问卷有各自的类型、条目和输出规则。“独裁者测试”也可能指政治人物匹配，“支配或顺从”还可能指性角色。本反思不进行这些分类，日常行动均分不能换算成商业量表、政治身份、性角色或指挥他人的资格。"
      }
    ]
  },
  {
    "id": "control-application",
    "title": {
      "en": "Use the guide to clarify a future plan, not judge a person",
      "zh": "用指南澄清下一次计划，不评价一个人"
    },
    "paragraphs": [
      {
        "en": "Choose one existing incident and ask what was decided, who was involved, what responsibility had been agreed and what information was missing. An optional conversation might be: “I can arrange the venue within our budget; would you like to choose the time together?” Discussing the scope directly is more informative than telling someone your mean or assigning them a role.",
        "zh": "选一件已经发生的事，核查决定了什么、谁参与、约定了哪些职责、缺少什么信息。可选说法是：“我可以在预算内安排场地，时间要不要一起选？”直接讨论范围，比告诉对方均分或分配角色更有信息。"
      },
      {
        "en": "No result establishes another person’s consent, safety, legal authority or relationship status. You can simply read the guides without taking action or sharing. Answers are calculated in the browser; optional tab drafts require explicit saving, expire after twenty-four hours and clear on completion or retake. Public links and share cards carry general guides, not your answers or means.",
        "zh": "任何结果都不确立他人的同意、安全、法律权力或关系状态。可以只读指南，不行动、不分享。回答在浏览器计算；可选标签页草稿需要主动保存，二十四小时失效，完成或重测清除。公开链接与分享图只有通用指南，不含你的回答或均分。"
      }
    ]
  }
];
export const controlLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Can I answer without a leadership role?",
      "zh": "没有领导角色可以答吗？"
    },
    "answer": {
      "en": "Yes. Recall your own actions in one ordinary voluntary shared-plan context over the past four weeks, such as a hobby group or outing. A formal title is unnecessary.",
      "zh": "可以。回顾过去四周一个普通、自愿共同计划中自己的行动，例如爱好小组或出行，不需要正式职务。"
    }
  },
  {
    "question": {
      "en": "Is a high mean evidence that people agreed with me?",
      "zh": "均分高能证明别人同意吗？"
    },
    "answer": {
      "en": "No. Reporting that you explained or asked does not verify another person’s understanding, freedom to respond or agreement. Those need direct contextual evidence.",
      "zh": "不能。自报解释或征询，不核实他人的理解、自由回应空间或同意，需要直接的情境证据。"
    }
  },
  {
    "question": {
      "en": "How are three numeric responses treated?",
      "zh": "三条数字回答怎样处理？"
    },
    "answer": {
      "en": "They meet this site’s minimum. For 1, 2, 4 and one unscored item, 7÷3 is displayed as 2.3/5. Coverage remains visible; the missing item is not filled.",
      "zh": "达到本站最低条数。例如1、2、4及一条未评分，7÷3显示为2.3/5，保留有效项数，不填补缺答。"
    }
  },
  {
    "question": {
      "en": "What if only two items can be rated?",
      "zh": "只能评价两条怎么办？"
    },
    "answer": {
      "en": "The area shows insufficient information without a mean, while its full guide remains readable. Other areas with at least three numeric items retain their own means.",
      "zh": "本组显示资料不足而不显示均分，完整指南仍可读。其他至少三条有效的组保留自身均分。"
    }
  },
  {
    "question": {
      "en": "Does supporting a plan make me submissive?",
      "zh": "支持计划说明我是顺从型吗？"
    },
    "answer": {
      "en": "No. Supporting an agreed plan is an action in context, not an identity or rank. It can occur alongside explaining, deciding and handing over.",
      "zh": "不是。支持同意的计划是情境行动，不是身份或等级，可以与解释、决定、交接同时出现。"
    }
  },
  {
    "question": {
      "en": "Is 3.0/5 equivalent to 60% power?",
      "zh": "3.0/5等于60%的权力吗？"
    },
    "answer": {
      "en": "No. It is a mean of ordered frequency ratings. It does not measure an authority share, ability percentage or population position.",
      "zh": "不是。这是有序频率评分的均值，不测权力份额、能力百分比或人群位置。"
    }
  },
  {
    "question": {
      "en": "Can I start without accepting another agreement?",
      "zh": "不额外点击同意也能开始吗？"
    },
    "answer": {
      "en": "Yes. Start test opens the first statement. Saving a temporary tab draft is optional and separate from answering.",
      "zh": "可以。开始测试直接进入第一条，临时标签页草稿为独立可选功能，不是作答条件。"
    }
  },
  {
    "question": {
      "en": "Can I compare these means with a FIRO-B result?",
      "zh": "可以和FIRO-B分数比较吗？"
    },
    "answer": {
      "en": "No. The items, constructs and calculation rules are different, and this original reflection has no established cross-instrument equivalence.",
      "zh": "不能。条目、构念与计算规则不同，本原创反思未建立跨工具等值。"
    }
  }
];
export const controlLandingReferences = [
  {
    "url": "https://www.themyersbriggs.com/en-us/access-resources/articles/measuring-behaviors-of-leaders",
    "title": {
      "en": "The Myers-Briggs Company: FIRO-B expressed and wanted interpersonal needs",
      "zh": "The Myers-Briggs Company：FIRO-B表达与期望的人际需要"
    }
  }
];
