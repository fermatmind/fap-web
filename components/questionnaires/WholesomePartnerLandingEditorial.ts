import type { Questionnaire } from "@/lib/questionnaires/types";

export const wholesomePartnerLandingSections: Questionnaire["guide"] = [
  {
    "id": "whp-scope",
    "title": {
      "en": "What the Wholesome Partner Test describes",
      "zh": "健康伴侣相处测试：八组近期行为"
    },
    "paragraphs": [
      {
        "en": "Thirty-two original FermatMind statements describe your own actions in one close relationship over the past four weeks. Eight topics cover following through, autonomy, checking what response is wanted, requesting support, expressing preferences, checking perspectives, negotiating expectations and repair talk. Each topic has four items and its own complete guide. These are editorial groupings, not eight established psychological factors.",
        "zh": "费马32条原创陈述回看过去四周，你本人在一段亲密关系中的行动。守约、选择空间、确认回应需要、请求支持、表达偏好、核对立场、协商期待与分歧修复各四题，各有完整指南。这是编辑分组，并非已经确立的八个心理因素。"
      },
      {
        "en": "The result is an individual behavioral reflection, not a two-person compatibility assessment, a satisfaction scale or a certificate of emotional maturity. It does not infer what your partner feels from what you report doing. All eight six-section guides remain public, including examples, counterexamples, arithmetic and optional observations. No additional test is needed to read them.",
        "zh": "结果是一份个人行为回顾，不是双方适配评估、满意度量表或情绪成熟度认证；不能由你报告的行动推断伴侣感受。八份各六节指南全部公开，包含例子、反例、算术与自愿观察，无需完成另一测试才能阅读。"
      }
    ]
  },
  {
    "id": "whp-recall",
    "title": {
      "en": "Use one relationship and actual opportunities",
      "zh": "固定一段关系，回顾真实发生的机会"
    },
    "paragraphs": [
      {
        "en": "Choose the same relationship throughout. Rate how often the described action occurred when there was an opportunity, from Almost never to Almost every time. Answer from recent events rather than an ideal self-image or approval of the statement. The page does not count opportunities or observe conversations, so the frequency codes are not measured percentages of interactions.",
        "zh": "全程以同一段关系为背景，根据有相关机会时的行动频率，从几乎没有到几乎每次作答。回想近期事件，不回答理想形象或是否赞同陈述。页面不统计机会次数，也不观察对话，因此频率编码不是实测互动百分比。"
      },
      {
        "en": "Without a relevant relationship, occasion or reliable memory, choose Not experienced / cannot judge. No disagreement needs to be created for a repair item, and no private disclosure is required for a support item. Start opens the first question directly; an account, payment and a second agreement are unnecessary. About seven minutes is an estimate, not a deadline.",
        "zh": "没有相关关系、机会或可靠记忆时，选未经历／无法判断。无需为了修复题制造争执，也无需为了支持题披露隐私。开始直接打开第一题，不需账户、付款或再次同意；约七分钟是估计，并非期限。"
      }
    ]
  },
  {
    "id": "whp-agreements",
    "title": {
      "en": "Agreements, autonomy and future expectations",
      "zh": "已有约定、个人选择与未来期待"
    },
    "paragraphs": [
      {
        "en": "Following through concerns checking capacity before promising and updating an arrangement when it becomes impractical. Autonomy concerns allowing a personal choice or refusal without repeated pressure, while discussing shared time or belongings. Negotiating expectations concerns making an unspoken wish explicit and revising arrangements after circumstances change. Similar language about plans refers to three different questions.",
        "zh": "守约关注承诺前核对余量，以及安排不可行时及时更新；选择空间关注个人选择或拒绝能否免受反复施压，同时商量共同时间或物品；期待协商关注说清原本未表达的愿望，并在情况变化后重订安排。同样提到计划，实际是三个不同问题。"
      },
      {
        "en": "For example, one person declines an optional Sunday outing while a previously agreed pickup remains unresolved. Accepting the declined outing and clarifying the pickup can coexist. A new work shift may call for revising the pickup arrangement, rather than treating either person’s availability as unlimited. The questionnaire does not decide the fairest arrangement or require agreement to every proposal.",
        "zh": "例如一方拒绝周日的可选出游，但先前同意的接送任务尚未落实。接受不出游与澄清接送责任可以同时成立；新增班次可能需要重订接送，而非假定任何一方无限有空。问卷不替你决定最公平的方案，也不要求接受每个提议。"
      }
    ]
  },
  {
    "id": "whp-response",
    "title": {
      "en": "Responding, requesting and understanding are distinct",
      "zh": "回应、求助与理解分别看"
    },
    "paragraphs": [
      {
        "en": "Checking what response is wanted asks whether listening, ideas or practical action fits the moment. Requesting support asks whether you name a bounded action and leave room for availability. Checking perspectives asks whether you verify an interpretation instead of assuming shared feelings or dismissing a concern by comparison. None measures mind-reading, actual help received or accurate recognition of emotions.",
        "zh": "确认回应需要询问此刻适合倾听、建议还是实际行动；请求支持询问能否说清有限行动，并留出讨论余量的空间；核对立场询问是否检查自己的理解，而非假定感受相同或用比较否定关切。三组都不测读心、实际得到多少帮助或情绪识别准确度。"
      },
      {
        "en": "After a disappointing meeting, someone might want to be heard rather than given advice. You can ask what would help and state the time you can offer. If you need assistance yourself, specify one task instead of expecting it to be guessed. A practical request already made clearly may need a simple practical reply, not repeated emotional questioning.",
        "zh": "一次令人失望的会议后，对方可能希望被听见，而非得到建议。可以询问需要什么，并说明自己能提供多少时间；自己求助时，则说清一项任务，而非期待被猜中。已经清楚提出的实际请求，可能只需实际回应，不必反复追问情绪。"
      }
    ]
  },
  {
    "id": "whp-preferences-repair",
    "title": {
      "en": "Expressing a preference and repairing an impact",
      "zh": "表达偏好与修复影响"
    },
    "paragraphs": [
      {
        "en": "Expressing preferences concerns saying what you actually prefer, explaining a change of mind and avoiding blame for an unstated wish. Repair talk concerns one event, its impact, a possible next step and an explained pause. Changing a preference can be legitimate while still requiring attention to a cost already created. A gentle sentence alone does not demonstrate that a promised change occurred.",
        "zh": "表达偏好关注说出真实选择、说明改变想法，以及避免因未说出的愿望责怪他人；修复对话关注具体事件、影响、可行下一步和说明过的暂停。偏好改变可以成立，同时仍需考虑已经造成的成本；一句温和表达本身不证明承诺的改变已发生。"
      },
      {
        "en": "In a fictional shared dinner plan, saying that you now prefer an earlier time gives new information; acknowledging a late update addresses its impact. The other person can disagree or decline further discussion. An explained pause differs from withholding contact until someone gives in. Leaving an unsafe interaction is a separate matter and does not require promising to return for an exercise.",
        "zh": "在虚构的共同晚餐计划中，说出现在希望提前时间，是提供新信息；承认更新太晚影响了安排，是回应影响。对方可以不同意或不愿继续谈。说明过的暂停，与持续不联系直到对方让步不同；离开不安全互动是另一回事，无需为练习承诺再回来。"
      }
    ]
  },
  {
    "id": "whp-arithmetic",
    "title": {
      "en": "Scoring: four items, two reversals, one separate mean",
      "zh": "计分：每组四题、两条反向与独立均分"
    },
    "paragraphs": [
      {
        "en": "In every group, two direct items keep the selected 1–5 value; two reverse items contribute 6 minus that value. All four need valid frequency answers before a personal sum of 4–20 and mean of 1–5 are shown. Means display one decimal. Interleaved presentation does not change group membership. Reverse wording aligns the listed behaviors; it is not an honesty test.",
        "zh": "每组两条正向题保留1—5所选值，两条反向题贡献6减所选值；四题都有效，才显示4—20个人评分和与1—5均分，均分保留一位小数。交错呈现不改变归属；反向措辞统一所列行为的方向，不是诚实测试。"
      },
      {
        "en": "For a fresh follow-through example in item-number order, answers 5, 2, 4, 1 contribute 5, 2, 2, 5: sum 14 and mean 3.5. Answers 4, 1, 2, 5 contribute 4, 1, 4, 1: sum 10 and mean 2.5. A skipped item withholds only its own group’s personal sum and mean; it is not filled with zero or 3. No eight-group total or winning topic is produced.",
        "zh": "新的守约算例按题号顺序回答5、2、4、1，贡献5、2、2、5，总和14，均分3.5；回答4、1、2、5，贡献4、1、4、1，总和10，均分2.5。任一跳题仅使所属组不给个人评分和与均分，不补0或3；八组不产生合成总分或胜出议题。"
      }
    ]
  },
  {
    "id": "whp-evidence",
    "title": {
      "en": "Research on responsiveness: relevant background, different evidence",
      "zh": "回应性研究：相关背景与不同证据"
    },
    "paragraphs": [
      {
        "en": "Canevello and Crocker’s 2010 research followed 115 roommate pairs across a semester and 65 pairs across three weeks. It examined self-reported responsiveness, perceptions of the other person and relationship quality as related but distinct variables. The authors state that goals and responsiveness were not manipulated, limiting causal conclusions. These were roommate studies, not validation of this partner questionnaire. [4]",
        "zh": "Canevello与Crocker的2010年研究分别追踪115对室友一个学期、65对室友三周，区分本人回应、感到对方如何回应及关系质量；作者说明未操纵目标与回应性，因此因果结论受限。这是室友研究，不是对本伴侣问卷的验证。[4]"
      },
      {
        "en": "The distinction helps frame a useful question: what did I report doing, what did the other person experience, and what evidence is available for each? This page collects only your account. Its eight topics, four-week window, reverse keys and Chinese wording need their own measurement evidence. Public relationship guidance offers practical context, not norms, diagnostic cutoffs or endorsement of these original means. [1][2][3]",
        "zh": "这一区分帮助提出有用问题：我报告做了什么，对方经历了什么，各自有什么证据？本页只收集你的自述。八组议题、四周窗口、反向键与中文措辞，需要自身测量证据；公开关系指导提供实践背景，不提供本原创均分的常模、诊断切点或背书。[1][2][3]"
      }
    ]
  },
  {
    "id": "whp-application",
    "title": {
      "en": "Choose one observation without making the score a verdict",
      "zh": "选择一项观察，不用分数裁定关系"
    },
    "paragraphs": [
      {
        "en": "Where safe and mutually wanted, select one relevant event rather than the numerically lowest topic. Privately note the agreement, available choices, what you said and what remains uncertain. One small next step might be checking availability before promising or asking whether a summary is accurate. Keep it optional, allow refusal and consider actual feedback rather than trying to raise a number.",
        "zh": "在安全且双方愿意时，选择一个相关事件，而非数字最低的议题。可私下记下约定、当时可选方案、自己说了什么及尚不确定的部分；小下一步可以是承诺前核对余量，或询问概括是否准确。保持自愿，允许拒绝，根据实际反馈回看，而非设法提高数字。"
      },
      {
        "en": "Guidance on boundaries and conflict distinguishes ordinary disagreement from fear, coercion and control. [2][3] Positive reports in other groups cannot cancel harm. You need not disclose messages, confront someone or obtain a complete score before seeking appropriate support. Retesting is optional; a difference may reflect opportunity, recall or circumstances, and this edition has no established meaningful-change threshold.",
        "zh": "边界与冲突指导区分普通分歧与恐惧、强迫及控制。[2][3] 其他组的正面回答不能抵销伤害；寻求适当支持无需披露消息、对质或先得到完整分数。重测自愿，差异可能涉及机会、回忆或情境，本版没有已建立的有意义变化阈值。"
      }
    ]
  }
];

export const wholesomePartnerLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does this test require both partners?",
      "zh": "需要双方一起作答吗？"
    },
    "answer": {
      "en": "No. It reflects one person’s reported actions. It does not collect or match a second person’s answers and cannot calculate compatibility.",
      "zh": "不需要。本页回顾一个人的自报行动，不收集或匹配另一人的答案，也不计算适配度。"
    }
  },
  {
    "question": {
      "en": "What if no disagreement happened in four weeks?",
      "zh": "四周没有争执，修复题怎样答？"
    },
    "answer": {
      "en": "Use Not experienced / cannot judge where appropriate. No disagreement is required. Missing opportunity is not evidence of either perfect repair or failure.",
      "zh": "适用时选未经历／无法判断，无需制造分歧；没有机会既不证明修复完美，也不代表失败。"
    }
  },
  {
    "question": {
      "en": "Does a reverse item detect dishonest answers?",
      "zh": "反向题能识别不诚实回答吗？"
    },
    "answer": {
      "en": "No. Six minus the selected value aligns the descriptive direction of sixteen items. It does not independently verify events or sincerity.",
      "zh": "不能。十六条题使用6减所选值，以统一描述方向，不独立核实事件或真诚程度。"
    }
  },
  {
    "question": {
      "en": "Does 3.5 out of 5 mean 70 percent healthy?",
      "zh": "3.5／5表示70%的健康吗？"
    },
    "answer": {
      "en": "No. It is a mean of four keyed ordinal codes, not an observed success rate, population percentile or health probability.",
      "zh": "不是。它是四条定向等级编码的均分，不是实测成功率、人口百分位或健康概率。"
    }
  },
  {
    "question": {
      "en": "Why is one group missing while the others remain?",
      "zh": "为什么只有一组资料不足？"
    },
    "answer": {
      "en": "Each group requires all four frequency answers. One NA withholds only its group’s personal sum and mean. All eight full general guides still remain available.",
      "zh": "每组要求四条频率回答；一条NA仅使所属组不给个人和与均分，八份完整通用指南仍可阅读。"
    }
  },
  {
    "question": {
      "en": "Are these eight validated relationship factors?",
      "zh": "这是经过验证的八个关系因素吗？"
    },
    "answer": {
      "en": "No. These are original editorial topics. Related research and public guidance do not establish their factor structure, reliability or Chinese-language equivalence. [4]",
      "zh": "不是。这是原创编辑议题，相关研究与公开指导不确立其因素结构、信度或中文测量等价。[4]"
    }
  },
  {
    "question": {
      "en": "Should I share my means to prove I am considerate?",
      "zh": "可以用均分证明自己很体贴吗？"
    },
    "answer": {
      "en": "A self-report cannot establish the other person’s experience. Sharing is optional; a value should not pressure someone to agree, forgive or disclose private information.",
      "zh": "自报不能确立对方经历；分享自愿，不能用数字施压对方认同、原谅或披露隐私。"
    }
  },
  {
    "question": {
      "en": "Is there another agreement after Start?",
      "zh": "开始之后还要再次同意吗？"
    },
    "answer": {
      "en": "No. Start opens question one directly. All thirty-two items and eight complete guides are free; temporary progress saving is separate and voluntary.",
      "zh": "不需要。开始直接进入第一题，32条题与八份完整指南免费；临时保存进度另行自愿选择。"
    }
  }
];

export const wholesomePartnerLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Canevello & Crocker (2010): responsiveness in roommate relationships",
      "zh": "Canevello与Crocker（2010）：室友关系中的回应性研究"
    },
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC2891543/"
  }
];
