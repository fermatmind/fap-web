import type { Questionnaire } from "@/lib/questionnaires/types";

export const jealousyLandingSections: Questionnaire["guide"] = [
  {
    "id": "jealousy-context-identity",
    "title": {
      "en": "Jealousy Scale: thoughts, discomfort and actions kept separate",
      "zh": "嫉妒量表：分开看思维、不适与行动"
    },
    "paragraphs": [
      {
        "en": "Romantic jealousy can involve thoughts about a possible threat to a valued relationship, discomfort and actions taken in response. Research distinguishes these aspects, but that does not make every jealousy questionnaire the same instrument. FermatMind wrote these eighteen prompts as an original reflection, not the original Multidimensional Jealousy Scale or a validated short form. [1] [2]",
        "zh": "恋爱中的嫉妒可能涉及对重要关系面临威胁的想法、不适，以及相关行动。研究区分这些方面，但不意味着所有嫉妒问卷是同一工具。费马以此原创18条反思提示，不是原版多维嫉妒量表或验证短版。[1] [2]"
      },
      {
        "en": "The three summaries describe your own recollections. They do not observe a partner, establish infidelity or decide whether a specific concern is justified. An intense feeling does not prove an interpretation; a low mean does not dismiss a concrete incident. Keep any relevant facts and agreements separate from what this self-report can record.",
        "zh": "三组概括描述自己的回忆，不观察伴侣、不确定不忠，也不裁定具体担心是否有依据。强烈感受不证明解释，较低均分也不驳回具体事件；应将相关事实和约定，与自报问卷能记录的内容分开。"
      }
    ]
  },
  {
    "id": "jealousy-context-reference",
    "title": {
      "en": "One relationship and one four-week reference period",
      "zh": "保持同一段关系与同一四周参照"
    },
    "paragraphs": [
      {
        "en": "Choose a current romantic relationship or your most recent significant one. Keep that relationship throughout and recall the past four weeks, or its final four weeks if it ended. This is an editorial window for this form, not a diagnostic duration. Combining different partners or widely separated episodes would mix contexts that a single summary cannot distinguish.",
        "zh": "选一段当前恋爱关系，或最近一段重要关系，全程保持同一段；回看过去四周，结束的关系则回看最后四周。这是本卷的编辑窗口，不是诊断所需时长。混用不同伴侣或相隔很久的事件，会把一次汇总无法区分的情境放在一起。"
      },
      {
        "en": "Answer only from what you recall. You do not need to contact anyone, check accounts, inspect private messages or repeat a behaviour to obtain an answer. No relevant experience, uncertainty and choosing not to answer can all be left unscored. Eighteen recognised selections, including unscored choices, complete the attempt without compulsory disclosure.",
        "zh": "只按已有回忆回答，不必联系任何人、检查账户、查看私信，或重复某种行为来取得答案。没有相关经历、无法判断或选择暂不回答，都可不计分。18项有效选择包含不计分即可完成，不要求披露。"
      }
    ]
  },
  {
    "id": "jealousy-context-thoughts",
    "title": {
      "en": "Returning thoughts: an interpretation is different from an event",
      "zh": "反复思维：解释与事件不同"
    },
    "paragraphs": [
      {
        "en": "The thought items concern returning to possible replacement, imagined comparisons, replayed interactions, a mentioned person, unresolved uncertainty and imagined relationship change. Frequency means how often that thought occurred when a relevant opportunity arose. It does not mean that the thought was accurate, endorsed or deliberately chosen.",
        "zh": "思维题涉及反复担心被替代、想象比较、回放互动、揣摩被提到的人、难以搁置未知，以及想象关系变化。频率指有相关机会时这些想法出现多少，不表示想法准确、被本人认可或是刻意选择。"
      },
      {
        "en": "For a fictional unanswered message, record the observable delay separately from an interpretation about replacement. The context may remain unknown. If a discussion is wanted, one bounded question about ordinary communication arrangements can be considered; the other person retains the choice to respond. A questionnaire cannot promise certainty or settle competing accounts of an event.",
        "zh": "例如虚构的消息未回复，应把可观察到的延迟，与关于被替代的解释分开记录，背景仍可能未知。若愿意讨论，可考虑一个关于日常联系安排的有限问题；对方仍可选择是否回应。问卷不能保证获得确定感，也不能裁决不同事件陈述。"
      }
    ]
  },
  {
    "id": "jealousy-context-intensity",
    "title": {
      "en": "Discomfort intensity is not the frequency of the situation",
      "zh": "不适强度不是情境发生频率"
    },
    "paragraphs": [
      {
        "en": "The middle six items use intensity anchors: no discomfort through very strong discomfort. They ask about relevant recalled situations involving attention, replacement, another person’s interaction, unknown context, an unsettled explanation or comparison. A single strong experience and several mild experiences can differ in both frequency and intensity; the intensity mean does not recover their duration or count.",
        "zh": "中间六题采用强度端点，从没有不适到很强不适，围绕注意、替代、对方与他人的互动、背景未知、解释未消除担心及比较等相关回想情境。一次很强体验与多次轻微体验，频率和强度都可能不同；强度均分不能还原持续时长或事件次数。"
      },
      {
        "en": "Choose no discomfort only if you recalled a relevant situation and experienced none. With no relevant situation, use unscored instead. A thought-frequency mean of 3.0 and an intensity mean of 3.0 have different meanings. Neither identifies which part is the main cause, who cares more or how much love exists in the relationship.",
        "zh": "只有回想到相关情境且没有不适，才选没有不适；缺少相关情境时应选不计分。思维频率3.0与不适强度3.0含义不同，都不确定哪个部分是主要原因、谁更在乎，或关系里有多少爱。"
      }
    ]
  },
  {
    "id": "jealousy-context-actions",
    "title": {
      "en": "Actions need their own context, agreement and consequences",
      "zh": "行动应另看情境、同意与后果"
    },
    "paragraphs": [
      {
        "en": "The action items concern repeated questions, returning to a worry, comparing public information, changing plans, joining an interaction and seeking reassurance more than intended. They record recalled frequency, not another person’s experience or an observed test of control. The same frequency category does not make different actions equal in consequence.",
        "zh": "行动题涉及重复追问、再谈同一担心、比较公开信息、改变计划、加入互动，以及比预想更多地寻求安心。它记录回忆频率，不记录另一人的体验，也不实测控制程度。使用同一频率档，不让不同动作具有相同后果。"
      },
      {
        "en": "A result does not authorize password requests, private-message inspection, loyalty tests or restrictions on friendships. Conversely, a smaller mean cannot prove that a particular boundary was respected. Consider the actual agreement and whether a request could freely be declined. A concrete safety concern deserves attention independently of any questionnaire number.",
        "zh": "结果不授权索取密码、检查私信、测试忠诚或限制交友；较低均分也不证明某次边界得到尊重。应看实际约定，以及请求是否能被自由拒绝。具体安全担忧需要独立关注，不依赖问卷数字。"
      }
    ]
  },
  {
    "id": "jealousy-context-math",
    "title": {
      "en": "Three means with different anchors: a fresh worked example",
      "zh": "不同端点的三个均分：新的完整算例"
    },
    "paragraphs": [
      {
        "en": "For a new thought-frequency example, answers 5, 1, 2, 4, 3 and 1 sum to 16. Dividing by six gives 2.666…, displayed as 2.7. All six numeric values are forward-scored. The sum is not sixteen incidents, and the mean is not a percentage of time or a probability that the relationship is threatened.",
        "zh": "新的思维频率算例中，5、1、2、4、3、1合计16，除以六为2.666……，显示2.7。六项数值全部正向计入；合计不表示16起事件，均分也不是时间百分比或关系受威胁的概率。"
      },
      {
        "en": "If the second thought item is unscored, five numeric responses remain and this group has no personal mean. The other two complete groups retain theirs; all three guides remain open even if every answer is unscored. No missing value becomes zero, never or no discomfort. The complete-six policy is an editorial completeness rule; equal-looking means across different anchors are not ranked or added.",
        "zh": "若第二条思维题不计分，该组余五项数值，不提供个人均分；其他两个完整组保留，即使全部不计分也能读三篇指南。缺答不变成零、从未或没有不适。完整六项是编辑完整度规则，不同端点上看似相等的均分不排名、不相加。"
      }
    ]
  },
  {
    "id": "jealousy-context-versions",
    "title": {
      "en": "MJS versions, response anchors and research evidence",
      "zh": "MJS版本、回答端点与研究证据"
    },
    "paragraphs": [
      {
        "en": "The 2022 Italian MJS study discusses an original twenty-four-item structure and a fifteen-item version, with different item content, response direction and scoring from this eighteen-item reflection. It also describes frequency and emotional-response anchors separately. A shared three-part topic therefore does not transfer the published form’s validation, reverse scoring or reference values to this site. [2]",
        "zh": "2022年意大利MJS研究讨论原24题结构及15题版本，题目、回答方向与计分均与本18题反思不同，也分别说明频率和情绪反应端点。因此同样讨论三个方面，不会将发表题本的验证、反向处理或参考值移到本站。[2]"
      },
      {
        "en": "A 2026 systematic review included thirty-two studies covering twenty-one instruments. Their theoretical targets, contexts and evidence differed, and the review highlighted sampling and cultural limitations. That diversity is a reason to check the exact version and intended use, not to call all jealousy tests clinically interchangeable. This original bilingual edition has no established norms or psychometric validation. [3]",
        "zh": "2026年系统综述纳入32项研究、涉及21种工具，它们的理论目标、情境及证据各不相同；综述指出样本与文化适用性的限制。这提示应核对准确版本与用途，而不能把所有嫉妒测验当成可互换临床工具。本原创双语版本尚无已建立常模或心理测量学验证。[3]"
      }
    ]
  },
  {
    "id": "jealousy-context-use",
    "title": {
      "en": "Use a specific observation without making a partner verdict",
      "zh": "用于具体观察，不给伴侣下结论"
    },
    "paragraphs": [
      {
        "en": "If useful, privately distinguish one remembered event, the thought that returned, the discomfort you recall and any action taken. You do not have to complete every part of that note or send it to anyone. A later mean may change with opportunities, recollection or interpretation; without validated change thresholds, it cannot show how much a person or relationship has improved.",
        "zh": "若有帮助，可私下分开记录一件回忆事件、反复出现的想法、记得的不适与已采取的动作。不必把笔记每部分填满，也不必发给任何人。后续均分可能随机会、回忆或理解改变；没有验证变化界值，就不能说明个人或关系改善多少。"
      },
      {
        "en": "When distress, conflict or difficulty in daily life matters to you, you can seek appropriate support without waiting for a high score. This reflection does not diagnose a condition, prescribe treatment or require continued contact. Start opens the first question directly; saving progress remains optional and sharing uses only a public guide link, without your answers or means.",
        "zh": "如果痛苦、冲突或日常困难对你重要，可以不等高分就寻求适当支持。本反思不诊断、不提供治疗处方，也不要求继续联系。开始直接进入第一题，保存进度仍由本人选择；分享只使用公开指南链接，不带答案或均分。"
      }
    ]
  }
];

export const jealousyLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Which relationship and period should I use?",
      "zh": "应选哪段关系、哪个时段？"
    },
    "answer": {
      "en": "Keep one current or most recent significant romantic relationship throughout. Recall the past four weeks, or its final four weeks if it ended.",
      "zh": "全程保持同一段当前或最近的重要恋爱关系；回看过去四周，已结束则最后四周。"
    }
  },
  {
    "question": {
      "en": "Can I answer about friendship envy or career comparison?",
      "zh": "能按友谊嫉妒或职场比较作答吗？"
    },
    "answer": {
      "en": "These prompts concern a romantic relationship. General envy about another person’s advantages is a different question; do not silently change the reference.",
      "zh": "题目围绕恋爱关系，他人优势引起的一般羡妒是不同问题，不应悄悄更换参照。"
    }
  },
  {
    "question": {
      "en": "Can discomfort be rare but strong?",
      "zh": "不适可以很少发生却很强吗？"
    },
    "answer": {
      "en": "Yes. These intensity ratings do not count occasions. Thoughts and actions use separate frequency anchors, so the means cannot be ranked.",
      "zh": "可以。强度评分不数次数；思维和行动另用频率端点，因此三个均分不能排名。"
    }
  },
  {
    "question": {
      "en": "Is no relevant experience the same as no discomfort?",
      "zh": "没有相关经历等于没有不适吗？"
    },
    "answer": {
      "en": "No. No discomfort requires a recalled relevant situation. Without one, use unscored; it does not become the lowest score.",
      "zh": "不同。没有不适需要回想到相关情境；缺少情境时选不计分，不变为最低评分。"
    }
  },
  {
    "question": {
      "en": "Does a thought mean I believe it or will act on it?",
      "zh": "出现想法就表示相信它或会行动吗？"
    },
    "answer": {
      "en": "No. A thought can return without endorsement or action. This self-report cannot establish a causal sequence or another person’s intentions.",
      "zh": "不是。想法可反复出现而不被认可或付诸行动；自报不能建立因果顺序或他人意图。"
    }
  },
  {
    "question": {
      "en": "Can I inspect messages to answer more accurately?",
      "zh": "能查看私信以答得更准确吗？"
    },
    "answer": {
      "en": "No checking is needed or authorized. Answer from existing recollection, or choose unscored if you cannot judge.",
      "zh": "不需要，也不授权核查；按已有回忆答，无法判断时可不计分。"
    }
  },
  {
    "question": {
      "en": "Does a lower mean dismiss an actual incident?",
      "zh": "较低均分能驳回具体事件吗？"
    },
    "answer": {
      "en": "No. The summary cannot confirm or dismiss an event, excuse an action or establish safety. Consider actual facts and agreements separately.",
      "zh": "不能。概括不证实或驳回事件，不为行动免责，也不确定安全；另看实际事实与约定。"
    }
  },
  {
    "question": {
      "en": "Does Start open question one without another agreement?",
      "zh": "点击开始是否无需再次同意就进入第一题？"
    },
    "answer": {
      "en": "Yes. No signup or payment is required. All eighteen prompts and three complete guides remain free, including an all-unscored attempt.",
      "zh": "是，无需注册或付款；18条提示与三篇完整指南免费，全部不计分也可读。"
    }
  }
];

export const jealousyLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Papa et al. (2026): systematic review of jealousy measurement instruments",
      "zh": "Papa等（2026）：嫉妒测量工具系统综述"
    },
    "url": "https://link.springer.com/article/10.1007/s12144-025-08635-9"
  }
];
