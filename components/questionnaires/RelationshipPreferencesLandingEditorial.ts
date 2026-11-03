import type { Questionnaire } from "@/lib/questionnaires/types";

export const relationshipPreferencesLandingSections: Questionnaire["guide"] = [
  {
    "id": "arrangements-two-axes",
    "title": {
      "zh": "恋爱安排偏好测什么？两组日常选择分别看",
      "en": "What does this test explore? Two separate comparisons of everyday arrangements"
    },
    "paragraphs": [
      {
        "zh": "这份原创24题问卷关注两件具体的事：日常联系、共同参与和个人空间怎样安排；计划、关系阶段与新体验怎样确定或调整。每组各12题。完成后分别阅读联系／空间和确定／弹性的原始次数及对应指南，不合成一个人格标签，也不从一组结果推断另一组。",
        "en": "This original twenty-four-item questionnaire concerns two concrete questions: arranging contact, shared participation and personal space; and settling or adjusting plans, relationship definitions and new experiences. Each comparison has twelve items. Read the contact/space and certainty/flexibility counts with their corresponding guides separately, without merging them into a personality label or inferring one comparison from the other."
      },
      {
        "zh": "例如，你可以喜欢及时分享日常，同时希望假期的活动临近再决定；也可以保留独处时间，同时提前明确往返时段。两种安排可以同时存在。分别计数是本题本的规则，不是已经证明两个心理维度统计独立；本页也不生成四字母代码、16型画像或九种综合恋爱人格。",
        "en": "For example, you might enjoy sharing daily news promptly while deciding holiday activities near departure; or keep time alone while settling travel times early. These arrangements can coexist. Separate counting is a rule of this bank, not evidence that two psychological dimensions are statistically independent. The page produces no four-letter code, sixteen-profile system or nine combined romantic personalities."
      }
    ]
  },
  {
    "id": "arrangements-contact-space",
    "title": {
      "zh": "联系与个人空间：说清时间、信息和决定",
      "en": "Contact and personal space: distinguish time, information and decisions"
    },
    "paragraphs": [
      {
        "zh": "联系侧涵盖分享见闻、共同活动、把伴侣纳入讨论和同步变化；空间侧涵盖先消化信息、保留兴趣、独立思考和各自行动。某人想在忙碌日固定交流十分钟，另一天却想先安静休息，并不矛盾。次数说明在这些配对中较常选择哪侧，不能规定联系频率或回复时限。",
        "en": "Contact options include sharing news, joint activities, involving a partner in discussion and exchanging updates. Space options include processing information first, retaining interests, thinking independently and doing things separately. Wanting a short regular conversation on one busy day and quiet rest before talking on another is not contradictory. Counts describe selections against these alternatives without prescribing contact frequency or reply deadlines."
      },
      {
        "zh": "研究中的“自主”也不简单等于独处。自我决定理论强调行动出于本人认可的意愿，自主与联结可以同时得到满足。[1] 本页“独立与个人空间”是安排选项的名称，并非该理论的自主需要量表。无论哪侧次数更多，都要另问这项安排是否自愿、是否可行，以及对方希望怎样参与。",
        "en": "Autonomy in research does not simply mean being alone. Self-determination theory emphasizes volition and endorsement of action, allowing autonomy and connection to coexist.[1] This page’s autonomy/personal-space label names arrangement options rather than measuring that theory’s autonomy need. Whichever side leads, ask separately whether an arrangement is voluntary and feasible and how the other person wants to participate."
      }
    ]
  },
  {
    "id": "arrangements-certainty-flexibility",
    "title": {
      "zh": "确定与弹性：先定哪些部分，哪些允许调整？",
      "en": "Certainty and flexibility: what should be settled and what can change?"
    },
    "paragraphs": [
      {
        "zh": "确定侧涉及提前规划、明确阶段、延续有效惯例和稳定投入；弹性侧涉及随状态协调、通过经历逐步确认，以及尝试新的相聚方式。同一次出行可以先定预算和返回时间，再按天气选择活动。例子展示怎样拆分安排，不是从某种结果推出你一定会这样做。",
        "en": "Certainty options involve advance plans, explicit relationship definitions, continuing useful routines and steady contributions. Flexibility options involve coordinating with circumstances, confirming through experience and trying different ways of spending time together. A trip could have a settled budget and return time while activities depend on weather. This illustrates separating parts of an arrangement, rather than predicting behavior from a result."
      },
      {
        "zh": "本题组把计划、定义、惯例和体验放在同一比较中，但这些内容并非完全相同。想提前订票不证明急于确认关系，喜欢新活动也不表示愿意改变已有承诺。先回看具体题意，再讨论“什么可变、谁需要知道、何时再定”，比把整个人称为稳定型或随性型更精确。",
        "en": "The bank places plans, definitions, routines and experiences within one comparison, although these contents are not identical. Booking tickets early does not establish urgency to define a relationship, and enjoying new activities does not imply willingness to change an existing commitment. Check the specific item, then discuss what can change, who needs to know and when to decide, instead of assigning a stable or spontaneous identity."
      }
    ]
  },
  {
    "id": "arrangements-count-examples",
    "title": {
      "zh": "24道二选一怎样计分？同维度内的原始次数",
      "en": "How are twenty-four paired choices scored? Raw counts within each comparison"
    },
    "paragraphs": [
      {
        "zh": "每题选中的一侧加1次，不加权；每维12题，两侧次数总和恒为12，单侧范围0—12。四个方向都在A、B位置各出现6次。只有全部24题有效才解释两维，即使已完成其中12题，也不会先生成单维个人结果。未答题不补成零，没有NA或中立选项。",
        "en": "A selection adds one count to its chosen side, without weighting. Each dimension has twelve items, so its two counts always sum to twelve and each ranges from zero to twelve. Each of the four poles appears six times in each option position. All twenty-four valid choices are required before either dimension is interpreted; finishing twelve alone does not release a partial personal result. Unanswered items are not imputed as zero, and there is no NA or neutral option."
      },
      {
        "zh": "按联系／空间、确定／弹性的顺序，8:4与5:7表示本次分别更多选联系和弹性；6:6与9:3则保留第一维并列、第二维确定侧更多。7:5不是“爱意七成”或“超过七成人群”，也不能与另一维的9跨维排强弱。计数只比较同一组提供的两侧，不测双方的满意度或匹配程度。",
        "en": "In contact/space and certainty/flexibility order, 8:4 and 5:7 mean contact and flexibility were selected more often, respectively. With 6:6 and 9:3, the first tie remains and certainty leads on the second. A 7:5 count means neither seventy-percent affection nor outranking seventy percent of people; it cannot be ranked against nine on the other dimension. Counts compare the offered sides within each pair, without measuring satisfaction or compatibility."
      }
    ]
  },
  {
    "id": "arrangements-ties-change",
    "title": {
      "zh": "6:6并列与重测变化：总次数不能还原全部情境",
      "en": "A 6:6 tie and changed results: totals cannot reconstruct every situation"
    },
    "paragraphs": [
      {
        "zh": "每维只有三种读法：第一侧较多、第二侧较多、两侧各6次。两维共同出现的三乘三种读法组合，是分别阅读的两项结果，不是额外九篇人格报告。并列时不按字母、题号、选项位置或随机方式挑选赢家；也不把7:5自动合并为6:6。全部六篇指南都可免费阅读。",
        "en": "Each dimension has three readings: more first-pole choices, more second-pole choices, or six each. The three-by-three combinations across dimensions are pairs of separate readings, not nine additional personality reports. Ties are not broken by letters, item order, option position or randomness; 7:5 is not automatically merged into 6:6. All six guides are free to read."
      },
      {
        "zh": "同为6:6的两份答卷可能选择了不同的题目，不能据此推断没有偏好、心理平衡或兼具两种能力。改变一题会从原侧减1、另一侧加1，6:6可能变成7:5；名称变化不等于人格改变。本版没有建立重测误差、可靠变化阈值或跨语言等值，比较时应先核对版本、参照情境与具体选择。",
        "en": "Two 6:6 attempts may contain different choices; equal counts establish neither absent preferences, psychological balance nor two abilities. Changing one answer subtracts one from its former pole and adds one to the other, allowing 6:6 to become 7:5. A changed label does not establish personality change. This edition has no established retest error, reliable-change threshold or cross-language equivalence; first compare version, reference context and particular choices."
      }
    ]
  },
  {
    "id": "arrangements-research",
    "title": {
      "zh": "研究能支持什么？需要满足、新体验与本题本分开",
      "en": "What does research support? Separate need fulfillment, novelty and this bank"
    },
    "paragraphs": [
      {
        "zh": "Patrick等人（2007）的三项研究考察需要满足与关系体验，包括双方作答与分歧后的日记记录；作者指出研究为相关设计，不能据此确定因果。[1] 研究中的自主、胜任和联结，并非本页联系／空间、确定／弹性的两组计数。相关理论帮助澄清概念，不提供本题本的效度、准确率或关系预测依据。",
        "en": "Patrick and colleagues’ three studies examined need fulfillment and relationship experiences, including partner reports and postdisagreement diaries; the authors identify their correlational designs as preventing causal inference.[1] Autonomy, competence and relatedness in that work are not this page’s contact/space and certainty/flexibility counts. The theory clarifies concepts without validating this bank, establishing accuracy or enabling relationship predictions."
      },
      {
        "zh": "Aron等人（2000）用两项调查和三项实验研究共同新颖、唤醒性活动及即时关系体验；实验任务约7分钟，作者指出美国样本、实验室情境和长期应用的限制。[2] 这不能推出“弹性侧越多，关系越好”。新活动也可以提前规划，偏好题不是活动干预。本原创题本尚未完成自身信度、效度或常模研究，不借用外部研究样本作为本站常模。",
        "en": "Aron and colleagues used two surveys and three experiments to examine shared novel, arousing activities and experienced relationship quality. Experimental tasks lasted about seven minutes; the authors discuss U.S.-sample, laboratory and longer-term application limits.[2] This does not imply that more flexibility choices mean a better relationship. New activities can be planned, and a preference questionnaire is not an activity intervention. This original bank lacks its own reliability, validity and norm studies; external samples are not used as website norms."
      }
    ]
  },
  {
    "id": "arrangements-discussion",
    "title": {
      "zh": "把结果变成具体提议：一个场景、两个未知条件",
      "en": "Turn a result into a concrete proposal: one situation and two unknowns"
    },
    "paragraphs": [
      {
        "zh": "设想两位虚构伴侣下周工作班次不同。一人想保持联系，另一人想下班后先安静一会儿。可以写下“希望哪天交流多久”“哪些时段已经有安排”，再问对方哪些部分可行。先核对意愿和时间，结果不授予查看聊天记录、要求立即回复或单方面改变约定的权利。",
        "en": "Imagine two fictional partners working different shifts next week. One wants contact; the other wants quiet time after work. Write down a proposed day and duration for conversation, along with already committed periods, then ask which parts would work. Check willingness and timing first. A result grants no right to inspect messages, demand immediate replies or change an agreement unilaterally."
      },
      {
        "zh": "如果愿意继续，可把一项安排分成“已同意”“可调整”“尚未知”，约一个适合情境的回看时点。它只是可修改的讨论草稿，不是经验证的训练方案或必须执行的天数。双方也可以不分享结果、不同意提议或在这里结束；任何人的真实意愿都比对其分数的猜测更直接。",
        "en": "If useful, sort one arrangement into agreed, adjustable and unknown, with a context-appropriate review point. This is a revisable discussion draft rather than a validated training program or prescribed number of days. Either person may keep results private, decline the proposal or stop here. A person’s expressed wishes are more direct information than a guess about their scores."
      }
    ]
  },
  {
    "id": "arrangements-guides-privacy",
    "title": {
      "zh": "六篇完整指南、42节说明与自愿保存",
      "en": "Six complete guides, forty-two sections and optional saving"
    },
    "paragraphs": [
      {
        "zh": "四篇单侧指南与两篇并列指南各含7节，共42节，涵盖含义、情境例子、取舍、具体问题、可选说法、虚构反例和计数边界。个人作答完成后会呈现两篇对应全文；不作答也可阅读全部六篇公开指南。指南解释一种计数结构，不展示某位访客的答卷，也不以分数限制阅读。",
        "en": "Four pole guides and two tie guides contain seven sections each, forty-two in total: meanings, situations, tradeoffs, concrete questions, optional wording, fictional counterexamples and count limits. A completed attempt presents the two matching full explanations; all six public guides are also readable without answering. A guide explains a count pattern without exposing a visitor’s responses or restricting reading by score."
      },
      {
        "zh": "点击开始直接进入题目，不增加强制同意、注册、邮箱或付款步骤。回答在浏览器计分；默认不保存，主动保存的标签页草稿24小时后过期，完成、重测或退出清除时删除。复制只含公开指南名称与链接，不含答案或次数。网站仍可能按隐私和Cookie设置记录不含答卷的使用事件。",
        "en": "Start enters the questions without another mandatory consent, registration, email or payment step. Answers are scored in the browser. Saving is optional: tab drafts expire after twenty-four hours and clear on completion, retake or exit-and-clear. Copying includes only a public guide’s name and link, without responses or counts. The site may still record answer-free usage events under its privacy and Cookie settings."
      }
    ]
  }
];

export const relationshipPreferencesLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "偏好个人空间，就是回避依恋吗？",
      "en": "Does preferring personal space mean avoidant attachment?"
    },
    "answer": {
      "zh": "不能这样判断。本页比较独处、分享与共同安排等选择，没有测量依恋的焦虑或回避。恢复精力、兴趣安排、生活负担和对象都可能影响答案；空间偏好不能转换为依恋标签。",
      "en": "No. This page compares arrangements involving solitude, sharing and joint activity without measuring attachment anxiety or avoidance. Recovery, interests, workload and the person involved may shape choices; space preferences cannot be converted into attachment labels."
    }
  },
  {
    "question": {
      "zh": "更多选择确定，是否更认真、更可靠？",
      "en": "Do more certainty choices mean greater seriousness or reliability?"
    },
    "answer": {
      "zh": "次数更多只说明本题组更常选提前确定、延续惯例等选项。可靠性需要核对实际行动、资源和约定履行，不能由计划偏好证明；弹性侧更多也不表示不专一或不负责。",
      "en": "A higher count means more selections involving advance decisions or continuity in this bank. Reliability requires evidence about actions, resources and fulfilled agreements; a planning preference cannot establish it. More flexibility choices establish neither unfaithfulness nor irresponsibility."
    }
  },
  {
    "question": {
      "zh": "两维都6:6，会不会没有结果？",
      "en": "Is there a result when both dimensions are 6:6?"
    },
    "answer": {
      "zh": "有。两组都保留并列，并分别显示对应完整并列指南。它不代表作答失败，也不要求重测直到出现领先侧；先回看哪些具体情境选了哪边，比强求一个标签更有信息。",
      "en": "Yes. Both ties remain, with their respective full tie guides. This is not a failed attempt and requires no retake to obtain a leader. Reviewing which situations favored each side is more informative than forcing a label."
    }
  },
  {
    "question": {
      "zh": "为什么7:5不能叫明显偏好或高分？",
      "en": "Why is 7:5 not labeled a strong preference or high score?"
    },
    "answer": {
      "zh": "它是12次配对中的相对次数。本版未建立强度阈值、常模或可靠差异研究，不能凭领先两次就宣布稳定特质。改变一题可使7:5变成6:6，宜结合具体题意阅读。",
      "en": "It is a relative count across twelve pairs. This edition has no established intensity cutoff, norms or reliable-difference evidence permitting a stable-trait claim from a two-count lead. One changed answer can produce 6:6; read the actual item content."
    }
  },
  {
    "question": {
      "zh": "两人都做完，能算匹配率吗？",
      "en": "Can two completed attempts produce a compatibility percentage?"
    },
    "answer": {
      "zh": "不能。本页只有单人题本，没有双人计分或预测模型。相同次数还可能来自不同选项；若双方自愿，可以讨论一项实际安排，但不把差值换算成匹配率或关系质量。",
      "en": "No. This is an individual bank without dyadic scoring or a prediction model. Identical counts may come from different choices. If both wish, discuss one real arrangement without converting a difference into compatibility or relationship quality."
    }
  },
  {
    "question": {
      "zh": "没有伴侣或某些情境不适合，怎样使用？",
      "en": "How can I use this without a partner or when situations do not fit?"
    },
    "answer": {
      "zh": "可以先读公开指南。若作答，保持同一参照，不编造他人的信息；两项都不合适时可结束。本题本没有NA，部分作答不会解释个人结果，也未建立不同关系经历之间的测量等值。",
      "en": "You may read the public guides first. If answering, maintain a consistent reference without inventing another person’s information. Stop when neither option fits. There is no NA, partial attempts are not interpreted, and equivalence across relationship histories has not been established."
    }
  },
  {
    "question": {
      "zh": "它与恋爱人格、爱情阵营测试可以互换吗？",
      "en": "Is it interchangeable with Love Personality or Relationship Values?"
    },
    "answer": {
      "zh": "不可以。本页比较联系空间及确定弹性的安排；恋爱人格比较表达、回应、空间与修复的互动入口；爱情阵营比较仪式、协作、陪伴与成长自主。名称或词语相似不表示同一题本、计分或结果系统。",
      "en": "No. This page compares contact/space and certainty/flexibility arrangements. Love Personality compares expression, response, space and repair as interaction entries; Relationship Values compares rituals, cooperation, companionship and growth/autonomy. Similar names or words do not establish identical items, scoring or result systems."
    }
  }
];

export const relationshipPreferencesLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Patrick等（2007）：需要满足与关系体验研究",
      "en": "Patrick et al. (2007): need fulfillment and relationship functioning"
    },
    "url": "https://selfdeterminationtheory.org/wp-content/uploads/2014/04/2007_PatrickKneeCanevelloLonsbary_PSPB.pdf"
  },
  {
    "title": {
      "zh": "Aron等（2000）：共同新颖活动与关系体验原始研究",
      "en": "Aron et al. (2000): shared novel activities and relationship quality"
    },
    "url": "https://files.blogs.baruch.cuny.edu/wp-content/blogs.dir/7309/files/2019/11/Aron_Norman_Aron_McKenna_Heyman_2000.pdf"
  }
];
