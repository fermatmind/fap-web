import type { Questionnaire } from "@/lib/questionnaires/types";

export const moteLandingSections: Questionnaire["guide"] = [
  {
    "id": "mote-context-identity",
    "title": {
      "en": "Mote Type Test: four comparisons of interaction choices",
      "zh": "魅力类型测试：四组互动选择的比较"
    },
    "paragraphs": [
      {
        "en": "Mote is used in Japanese entertainment quizzes about how someone attracts interest. Different providers use different axes and character labels. FermatMind’s version is an original twenty-four-item interaction-choice form: it records what feels more natural to you, without collecting another person’s impression. Its four paired comparisons therefore do not produce a charm rating, a romantic forecast or an official Japanese personality classification.",
        "zh": "日文娱乐测验中的“モテ”常围绕吸引关注的方式，不同产品采用不同轴与角色标签。费马版本是24题原创互动选择问卷，记录自己觉得更自然的做法，没有收集别人的印象。因此四组配对比较不产生魅力评分、恋爱预测或日本官方人格分类。"
      },
      {
        "en": "Read expression and presence, clarity and pacing, response timing, and sharing boundaries separately. Each guide covers both sides and a tie. These editorial pairs describe selected situations, not proven psychological opposites. In an actual exchange, you can speak enthusiastically, state a clear point, follow up later and keep personal details private at the same time.",
        "zh": "表达与在场、清晰与节奏、回应时点、分享边界应分别阅读；每篇指南覆盖两端和并列。这些编辑配对描述部分情境，不是已经证明互为对立的心理特质。现实中可以同时热情表达、说明重点、稍后跟进，并保留私人细节。"
      }
    ]
  },
  {
    "id": "mote-context-reference",
    "title": {
      "en": "Answer about your current choice, not an audience’s approval",
      "zh": "回答当下选择，不猜观众是否喜欢"
    },
    "paragraphs": [
      {
        "en": "Choose the option closer to your current natural response. There is no required recall period, ideal performance or correct social answer. The setting changes across the form: familiar groups, new colleagues, messages, feedback and personal questions. Keep the choice about the stated situation rather than answering as a performer, partner or colleague you think others want you to be.",
        "zh": "选择较贴近当下自然反应的一项，不设固定回顾期，不按理想表现或社交标准答案作答。情境涉及熟悉小组、新同事、消息、反馈与个人问题；应围绕题中场合，不扮演自己认为别人期待的活跃者、伴侣或同事。"
      },
      {
        "en": "The source form has two choices per item and no scored skip. If neither fits, you may leave the attempt unfinished; an unanswered item does not vote for the other side. All twenty-four valid answers are needed before any personal comparison is shown. The public guides remain available to read without answering, registration or payment.",
        "zh": "来源题本每题两项，没有计分跳过项。两项都不适合时，可以保留未完成，未答不会投给另一侧。24项全部有效后才显示任何个人比较；不作答也可免费阅读公开指南，无需注册或付款。"
      }
    ]
  },
  {
    "id": "mote-context-expression",
    "title": {
      "en": "Expression and calm presence: participation has more than one signal",
      "zh": "表达与平稳在场：参与不只有一种信号"
    },
    "paragraphs": [
      {
        "en": "This pair includes starting a discussion, responding to a pause, sharing excitement and joining a conversation. More visible expression concerns making a contribution noticeable; calm presence concerns listening, concise participation or room for others. A tired friend might welcome quiet company, while a planning group may need one clear suggestion. The count alone cannot tell which contribution was useful.",
        "zh": "这一组涉及开启讨论、回应停顿、分享兴奋与加入对话。明显表达关注让参与被看见，平稳在场关注倾听、简洁参与或给别人留空间。疲惫的朋友可能愿意安静相伴，计划小组也可能需要一个明确建议；次数本身不能判断哪种贡献有效。"
      },
      {
        "en": "For a fictional group decision, distinguish offering an idea from keeping everyone entertained. You could state one suggestion and stop for replies, or signal that you are listening before asking a question. Neither a larger expressive count nor a calmer count establishes extroversion, warmth or popularity. Facial expression, voice, language and fatigue also vary beyond the choices presented here.",
        "zh": "例如虚构小组决策，应区分提出想法与持续取悦大家。可以只提一个建议并停下听回应，也可先表示正在听，再问一个问题。表达侧或平稳侧次数较多，都不能确立外向性、温暖程度或人气；表情、声音、语言和疲劳也有题目之外的变化。"
      }
    ]
  },
  {
    "id": "mote-context-clarity",
    "title": {
      "en": "Directness and pacing: state the point while checking timing",
      "zh": "直接与节奏：既说明重点，也留意时机"
    },
    "paragraphs": [
      {
        "en": "The delivery pair concerns disagreement, changed arrangements, feedback, unclear requests, declining invitations and returning to a goal. It asks which part comes first. Direct clarity is not a license to insult; tactful pacing does not require withholding the actual message. A listener needs enough information to identify the change, constraint or question, with a realistic opportunity to respond.",
        "zh": "表达次序组涉及异议、安排变化、反馈、请求不清、拒绝邀约和回到目标，询问哪一部分先出现。直接清楚不授权侮辱，委婉节奏也不要求隐藏真正信息。听者需要足够信息辨认变动、限制或问题，并有现实的回应机会。"
      },
      {
        "en": "For a fictional deadline, saying that only one of two tasks can be finished can be both direct and considerate. Asking whether this is a suitable time to discuss the deadline can precede the same clear point. This bank cannot establish one best communication style across cultures, relationships or power differences; no count converts to empathy, honesty or professional competence.",
        "zh": "例如虚构截止期，说明两项任务只能完成一项，可以同时直接且顾及对方；询问现在是否方便谈截止期，也可先于同一明确重点。本题本不能确立跨文化、关系与权力差异的最佳沟通方式，次数不换算共情、诚信或职业能力。"
      }
    ]
  },
  {
    "id": "mote-context-timing",
    "title": {
      "en": "Immediate acknowledgement and later follow-up can coexist",
      "zh": "即时确认与后续跟进可以同时发生"
    },
    "paragraphs": [
      {
        "en": "One choice acknowledges the current message; the other proposes or notices a later development. A short acknowledgement does not commit you to solve a problem. Later follow-up does not mean monitoring someone or providing unlimited time. Before offering another conversation, check whether you have capacity and whether the other person wants that contact.",
        "zh": "一侧回应当下消息，另一侧约定或注意后续变化。简短确认不等于承诺解决问题，稍后跟进也不等于监控对方或无限投入时间。提出再次交流前，可以确认自己有无余力，以及对方是否愿意联系。"
      },
      {
        "en": "In a fictional collaboration, you might acknowledge receipt now and agree to review the update tomorrow. The form asks you to choose relatively between two actions even though both may occur in practice. More immediate selections do not prove greater care, and more follow-up selections do not establish reliability. Those judgments would need actual actions, agreements and the other person’s experience.",
        "zh": "例如虚构协作，可以先确认收到，再约定明天回看更新。现实中两项都可能做，题目仍要求相对选择。即时侧较多不证明更关心，跟进侧较多也不确立可靠性；这些判断需要真实行动、约定及对方体验。"
      }
    ]
  },
  {
    "id": "mote-context-sharing",
    "title": {
      "en": "Sharing boundaries: audience, detail and permission matter",
      "zh": "分享边界：看接收者、细节与同意"
    },
    "paragraphs": [
      {
        "en": "A weekend activity, a private feeling, a public opinion and a family history carry different kinds of information. Choosing a general answer can preserve privacy while supplying what cooperation needs. Sharing a hobby can provide context without disclosing another person’s story. Your own disclosure never provides permission to expose someone else or require reciprocal disclosure.",
        "zh": "周末活动、私人感受、公开观点和家庭经历涉及不同信息。概括回答可以保留隐私，同时提供合作所需内容；分享爱好也可增加语境，而不透露别人的故事。自己愿意分享，不授权披露他人，也不要求对方等量披露。"
      },
      {
        "en": "Laurenceau and colleagues’ 1998 diary studies examined disclosure, perceived partner responsiveness and experienced intimacy in individual interactions. Their findings connect disclosure with the interpersonal response, rather than treating information volume alone as closeness. These were student self-reports, not proof that disclosure causes closeness in every population. The studies do not prescribe disclosure in an unwanted setting or validate this six-item sharing pair. Keep choice and context central. [2]",
        "zh": "Laurenceau等人在1998年日记研究中考察具体互动的披露、感知到的对方回应及亲密体验，结果将披露与互动回应联系起来，而非只按信息多少理解亲近。这些是大学生自报结果，不证明披露会使所有人更亲近。研究不要求在不愿意的场合披露，也不验证本六题分享配对；选择与情境仍应放在中心。[2]"
      }
    ]
  },
  {
    "id": "mote-context-counts",
    "title": {
      "en": "Four counts without an overall type: a fresh example",
      "zh": "四组次数，不合成人格：新的算例"
    },
    "paragraphs": [
      {
        "en": "Suppose the first side is selected 5, 2, 3 and 1 times across the four groups. The results are 5:1, 2:4, 3:3 and 1:5. Only the third pair is tied; the other pairs retain both explanations with their own counts. Adding the four first-side counts would combine unrelated editorial choices, so the site does not calculate an overall score or a four-letter code.",
        "zh": "假设四组第一侧分别选了5、2、3、1次，结果为5:1、2:4、3:3、1:5。只有第三组并列，其他组也保留两侧解释和各自次数。把四组第一侧次数相加会混合不同编辑选择，因此本站不计算总分或四字母代码。"
      },
      {
        "en": "A pair can show 0:6, 1:5, 2:4, 3:3, 4:2, 5:1 or 6:0. A 4:2 count can come from fifteen different six-answer patterns; a 3:3 count from twenty. The count therefore does not preserve which situations drove the choice. A tie is not proof of perfect balance, and six selections are not a norm, probability, measured intensity or lack of capacity on the other side.",
        "zh": "一组可为0:6、1:5、2:4、3:3、4:2、5:1或6:0。4:2可来自15种六题回答排列，3:3可来自20种，因此次数不保留哪些情境造成选择。并列不证明完美平衡，六次选择也不是常模、概率、测得的强度或另一侧能力缺失。"
      }
    ]
  },
  {
    "id": "mote-context-research",
    "title": {
      "en": "Charisma research and this interaction-choice form answer different questions",
      "zh": "魅力研究与本互动选择问卷回答不同问题"
    },
    "paragraphs": [
      {
        "en": "Tskhay and colleagues’ General Charisma Inventory research distinguishes influence and affability, using a different six-item measure. This is not the same as the four pairs, three-component popular models or named romance archetypes. Related words do not establish equivalent constructs. Research on that instrument cannot be transferred as reliability or validity evidence for FermatMind’s original bank or its English translation. [1]",
        "zh": "Tskhay等人的一般魅力量表研究区分影响与亲和，使用另一套六题测量；它与本四组配对、流行三要素或具名恋爱原型并不相同。词语相近不确立构念等价，该工具的研究不能迁为费马原创题本或英文译文的信效度证据。[1]"
      },
      {
        "en": "If you want a practical follow-up, choose one ordinary interaction and note your purpose, chosen action, available reply and what actually happened. Feedback, if freely offered, is another person’s account rather than an objective charm score. This form has no validated norm or change threshold. You can keep the reflection private; Start opens question one directly, with no second agreement or required sharing.",
        "zh": "若想继续观察，可以选一次普通互动，记下目的、所选行动、回应空间与实际经过。自愿提供的反馈是对方陈述，不是客观魅力分。本卷没有已验证常模或变化界值；可仅作私人回看，点击开始直接进入第一题，无需再次同意或分享。"
      }
    ]
  }
];

export const moteLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is this an official Japanese MOTE instrument?",
      "zh": "这是日本官方MOTE量表吗？"
    },
    "answer": {
      "en": "No. Different Mote-branded quizzes use different models. This is FermatMind’s original four-pair interaction-choice form.",
      "zh": "不是。不同Mote同名测验采用不同模型，本页是费马原创四组互动选择题本。"
    }
  },
  {
    "question": {
      "en": "Can I use both approaches in real life?",
      "zh": "现实中可以同时用两种做法吗？"
    },
    "answer": {
      "en": "Yes. The form asks for a relative choice; it does not prove the paired approaches are mutually exclusive traits.",
      "zh": "可以。题目要求相对选择，不证明配对做法是互斥特质。"
    }
  },
  {
    "question": {
      "en": "Does a 3:3 tie mean perfect balance?",
      "zh": "3:3表示完美平衡吗？"
    },
    "answer": {
      "en": "No. Twenty different six-answer patterns produce 3:3. Check which situations led to each choice; neither side needs to win.",
      "zh": "不是。20种六题回答排列都可得到3:3，应看各情境的选择，不必选赢家。"
    }
  },
  {
    "question": {
      "en": "Are four groups another MBTI code?",
      "zh": "四组就是另一种MBTI代码吗？"
    },
    "answer": {
      "en": "No. These editorial comparisons do not measure MBTI axes and are not combined into a personality code.",
      "zh": "不是。这些编辑比较不测MBTI偏好轴，也不合成人格代码。"
    }
  },
  {
    "question": {
      "en": "Does a larger sharing count require more disclosure?",
      "zh": "分享侧次数较多，就应该透露更多吗？"
    },
    "answer": {
      "en": "No. Each disclosure still depends on your choice, audience and permission. No result authorizes disclosure of another person’s information.",
      "zh": "不必。每次披露仍由本人选择，并考虑接收者与同意；结果不授权透露他人信息。"
    }
  },
  {
    "question": {
      "en": "Does immediate response exclude later follow-up?",
      "zh": "即时回应就不能后续跟进吗？"
    },
    "answer": {
      "en": "No. You may acknowledge a message now and agree to another time. The count does not establish care or reliability.",
      "zh": "不排除。可以先确认收到，再约定其他时间；次数不确立关心程度或可靠性。"
    }
  },
  {
    "question": {
      "en": "Can a 6:0 result tell me how others perceive me?",
      "zh": "6:0能说明别人怎样看我吗？"
    },
    "answer": {
      "en": "No. It records six of your own choices, not an audience’s ratings, observed competence or romantic interest.",
      "zh": "不能。它记录自己的六次选择，不是观众评价、实测能力或恋爱兴趣。"
    }
  },
  {
    "question": {
      "en": "Will Start open the questions directly?",
      "zh": "开始会直接进入题目吗？"
    },
    "answer": {
      "en": "Yes. No second agreement, signup or payment is required. All twenty-four questions and four full guides are free.",
      "zh": "会，无需再次同意、注册或付款。24题与四篇完整指南免费开放。"
    }
  }
];

export const moteLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Tskhay et al. (2018): General Charisma Inventory research",
      "zh": "Tskhay等（2018）：一般魅力量表研究"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/28737418/"
  },
  {
    "title": {
      "en": "Laurenceau et al. (1998): disclosure and perceived responsiveness",
      "zh": "Laurenceau等（1998）：披露与感知到的互动回应"
    },
    "url": "https://affective-science.org/pubs/1998/LaurenFBPl1998.pdf"
  }
];
