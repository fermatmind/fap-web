import type { Questionnaire } from "@/lib/questionnaires/types";
export const healthWorrySections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "Health worries: attention, questions and imagined possibilities",
      "zh": "健康担忧：注意、提问与想象的可能性"
    },
    "paragraphs": [
      {
        "en": "This adult reflection uses 21 original observations to organise recollections from the past four weeks. Three topics concern attention to bodily sensations, questions and care decisions, and thoughts about serious possibilities. Each topic has seven descriptions; experiences may overlap rather than belong to one exclusive category.",
        "zh": "这份成年人回顾用21条原创观察，整理过去四周的回忆。三个主题分别涉及对身体感觉的注意、提问与就医决定，以及想到严重可能性时的经历；各有七条描述。体验可以重叠，不必归入某个唯一类别。"
      },
      {
        "en": "The result retains the selected label for each description and six category counts per topic. All three complete guides are public before answering. The purpose is to give experiences a clearer description for reflection or conversation, without judging the state of your body or assigning a health-anxiety type.",
        "zh": "结果保留逐条所选标签，并分别展示各主题六类计数。三篇完整指南在作答前就公开。目的在于更清楚地描述经历，供个人回顾或交流使用，不判断身体状况，也不分配健康焦虑类型。"
      }
    ]
  },
  {
    "id": "themes",
    "title": {
      "en": "What the three reading topics describe",
      "zh": "三个阅读主题分别描述什么"
    },
    "paragraphs": [
      {
        "en": "Attention to sensations includes attention returning to a physical feeling during ordinary activities, comparing a sensation with earlier experiences or mentally replaying it. Requests and care decisions includes asking again after an explanation, looking for another answer and hesitating about a question or message.",
        "zh": "对身体感觉的注意包括日常活动中注意再次回到身体感觉、与过去比较或在脑中回放。提问、请求与就医决定则包括听过解释后再次提问、寻找另一种回答，以及对提问或消息犹豫。"
      },
      {
        "en": "Serious possibilities concerns imagining an illness-related possibility, uncertainty about whether information applies to oneself and difficulty returning attention to an activity. These descriptions do not establish that attention caused worry, that a request was unnecessary or that an imagined possibility is likely.",
        "zh": "想到严重可能性时，关注想象与疾病有关的可能性、不确定信息是否适用于自己，以及注意难以回到活动的经历。这些描述不确立注意引起了担忧、不判定请求没有必要，也不表示想象中的可能性很大。"
      }
    ]
  },
  {
    "id": "recall",
    "title": {
      "en": "Recall the last four weeks without checking now",
      "zh": "回想过去四周，无需现在检查"
    },
    "paragraphs": [
      {
        "en": "Answer from experiences you already remember. No body examination, symptom search, message opening or contact with feared information is required. Choose how often you noticed the description, rather than how serious you think a symptom might be or how you believe you ought to respond.",
        "zh": "使用已经记得的经历回答，不要求检查身体、搜索症状、打开消息或接触害怕的信息。选择自己多常注意到这条描述，而不是估计症状多严重，或回答自己认为应该怎样反应。"
      },
      {
        "en": "The four-week window is a reference for recollection, not a diagnostic duration rule or a waiting period before seeking care. If an observation does not fit your experience, is unclear in memory or feels private, choose unscored. You may leave without completing the form.",
        "zh": "四周是回忆参照，不是诊断持续时间标准，也不是寻求照护前必须等待的期限。没有相关经历、记忆不清或希望保留信息时，可以未计分；也可不完成就离开。"
      }
    ]
  },
  {
    "id": "counts",
    "title": {
      "en": "A worked example: seven descriptions, six category counts",
      "zh": "算例：七条描述与六类计数"
    },
    "paragraphs": [
      {
        "en": "The six labels are did not notice, rarely, sometimes, often, very often and unscored. Suppose seven descriptions receive these labels: did not notice, rarely, sometimes, sometimes, often, very often and unscored. In the six-category order, the counts are 1, 1, 2, 1, 1 and 1; they add to seven.",
        "zh": "六个标签为没有注意到、很少、有时、较常、经常和未计分。假设七条依次选择没有注意到、很少、有时、有时、较常、经常、未计分，那么按六类顺序计数为1、1、2、1、1、1，合计七条。"
      },
      {
        "en": "Two under sometimes means two descriptions received that label. It does not mean two searches, appointments, episodes or illnesses. Category IDs are not points: the page calculates no total, mean, highest topic, severity band, illness probability or population percentile.",
        "zh": "“有时”下的二表示两条描述选了这个标签，不表示搜索、预约、事件或疾病发生两次。类别标识不是点数：本页不计算总分、均值、最高主题、严重程度档次、患病概率或人群百分位。"
      }
    ]
  },
  {
    "id": "missing",
    "title": {
      "en": "Unscored does not mean did not notice",
      "zh": "未计分不等于没有注意到"
    },
    "paragraphs": [
      {
        "en": "Did not notice records a particular recollection. Unscored keeps no relevant experience, unclear recall or a withheld answer separate from that label. All seven descriptions in a topic can remain unscored; that record supplies no personal finding about the topic.",
        "zh": "没有注意到记录一种具体回忆；未计分将没有相关经历、回想不清或保留回答的情况与之分开。某主题七条都可未计分，这种记录不提供该主题的个人发现。"
      },
      {
        "en": "All 21 observations may be unscored and the form still finishes with all guides available. Neither missing information nor a set of did-not-notice labels confirms health or rules out a concern. The counts describe what was recorded, not what a medical examination would find.",
        "zh": "21条全部未计分也能完成，全部指南仍可阅读。资料缺失或一组没有注意到，都不确认健康或排除某种担忧。计数描述记录了什么，不描述身体检查会发现什么。"
      }
    ]
  },
  {
    "id": "requests",
    "title": {
      "en": "Asking and hesitating can appear in the same record",
      "zh": "提问与犹豫可以同时出现"
    },
    "paragraphs": [
      {
        "en": "Someone may want clarification about one matter while hesitating to open a different message. Another occasion may involve asking again after an explanation. The record preserves these descriptions separately instead of subtracting hesitation from requests or placing a person on a single care-seeking scale.",
        "zh": "一个人可能想问清某件事，同时犹豫是否打开另一条消息；另一次可能在听过解释后再次提问。记录分别保留这些描述，不用犹豫抵消请求，也不把人放在单一求医刻度上。"
      },
      {
        "en": "The same selected category can describe different circumstances. A count cannot judge whether an appointment, question or monitoring plan is necessary or excessive. If you discuss the record, use a concrete experience you choose to share; there is no requirement to justify asking for care.",
        "zh": "同一个所选类别可以对应不同情境。计数不能判断预约、提问或监测计划必要还是过多。交流记录时，可以使用自己愿意分享的具体经历；无需先证明寻求照护是合理的。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Health-anxiety information and this original reflection",
      "zh": "健康焦虑资料与这份原创回顾"
    },
    "paragraphs": [
      {
        "en": "NHS public guidance discusses recurring health worries, attention to bodily signs, requests for reassurance, information seeking and avoidance. It also describes seeking professional help when worry affects everyday life. These provide background language for the topic, not a validation study of this website’s observations. [1]",
        "zh": "NHS公开说明讨论反复的健康担忧、对身体迹象的注意、寻求确认、搜索信息和回避，也介绍担忧影响日常生活时寻求专业帮助。这些提供主题背景语言，不是对本站观察题组的验证研究。[1]"
      },
      {
        "en": "This bank is not the Short Health Anxiety Inventory (SHAI), the Whiteley Index or clinical diagnostic criteria. Shared subject matter does not establish equivalent items, scores or research evidence. The three reading topics have no established clinical cutoffs, norms or demonstrated English–Chinese measurement equivalence for this edition.",
        "zh": "这份题本不是简式健康焦虑量表（SHAI）、Whiteley Index或临床诊断标准。主题相近，不建立题目、分数或研究证据的等值；本版三个阅读主题尚无临床界值、常模或验证过的中英文测量等值。"
      }
    ]
  },
  {
    "id": "care-privacy",
    "title": {
      "en": "Physical concerns, support and a private record",
      "zh": "身体问题、支持与私人记录"
    },
    "paragraphs": [
      {
        "en": "A physical health question and worry can both deserve attention. This reflection cannot tell whether a sensation is harmless, caused by anxiety or related to a condition, or decide the need or urgency of care. You can discuss either concern with a qualified healthcare professional without completing a questionnaire or reaching a count.",
        "zh": "身体健康问题与担忧都可以值得关注。本回顾不能判断感觉无害、由焦虑引起或与疾病有关，也不决定照护需要或紧急程度。无需完成问卷或达到计数，就可以向合格医疗专业人士询问任一担忧。"
      },
      {
        "en": "Do not use the record to postpone assessment, cancel care, change medicine or alter monitoring requested by a professional. Answers remain in current-page memory and clear on exit, retake, reload or leaving. Copying the public entry includes only its title and address; the public guides contain no visitor answers.",
        "zh": "不要用记录推迟评估、取消照护、改药或调整专业人士要求的监测。回答留在当前页面内存，退出、重做、刷新或离页会清除。复制公开入口只包含标题和地址，公开指南不含访客回答。"
      }
    ]
  }
];
export const healthWorryFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does a count of two mean two health searches?",
      "zh": "计数为二表示搜索了两次吗？"
    },
    "answer": {
      "en": "No. It means two descriptions received a particular label. The form does not count searches, appointments, symptoms or illnesses.",
      "zh": "不是。它表示两条描述选了某个标签；题组不统计搜索、预约、症状或疾病次数。"
    }
  },
  {
    "question": {
      "en": "Are the three topics independent clinical dimensions?",
      "zh": "三个主题是独立临床维度吗？"
    },
    "answer": {
      "en": "No. They organise original descriptions for reading, with seven observations each. Their independence and clinical validity have not been established for this edition.",
      "zh": "不是。它们把原创描述整理为阅读主题，各七条；本版尚未建立独立性或临床效度。"
    }
  },
  {
    "question": {
      "en": "Can asking for an explanation and hesitating both be recorded?",
      "zh": "想问清楚与犹豫都能记录吗？"
    },
    "answer": {
      "en": "Yes. Keep each observation’s selected label. The page does not subtract one from the other or assign a care-seeking style.",
      "zh": "可以。保留每条观察所选标签；页面不用两者相减，也不分配求医风格。"
    }
  },
  {
    "question": {
      "en": "Does imagining a serious possibility mean it is probable?",
      "zh": "想到严重可能性表示它很可能发生吗？"
    },
    "answer": {
      "en": "No. A recollection about a thought cannot estimate whether a condition is present or likely. This page does not assess physical symptoms.",
      "zh": "不是。关于想法的回忆不能估计疾病是否存在或可能发生；本页不评估身体症状。"
    }
  },
  {
    "question": {
      "en": "What happens if all seven observations in a topic are unscored?",
      "zh": "某主题七条全未计分会怎样？"
    },
    "answer": {
      "en": "That topic provides no personal finding. Its complete public guide remains available, and no missing response is replaced with did not notice.",
      "zh": "该主题不提供个人发现；完整公开指南仍可读，不用没有注意到替代缺答。"
    }
  },
  {
    "question": {
      "en": "Does the four-week reference mean I should wait before asking for help?",
      "zh": "四周参照表示应等满四周才求助吗？"
    },
    "answer": {
      "en": "No. It is a recollection window, not a waiting period, diagnosis rule or threshold for care. You may discuss a concern without using this form.",
      "zh": "不是。它是回忆窗口，不是等待期限、诊断规则或照护阈值；可以不使用表格就谈论担忧。"
    }
  },
  {
    "question": {
      "en": "Do public health sources validate this questionnaire?",
      "zh": "引用公开健康资料就表示问卷经过验证吗？"
    },
    "answer": {
      "en": "No. Background guidance helps explain the subject. Validation requires evidence about the actual items, response method, language and intended use; it cannot be transferred from a different scale.",
      "zh": "不是。背景资料帮助解释主题；验证需要对应实际题目、回答方法、语言和用途的证据，不能从另一量表转移过来。"
    }
  },
  {
    "question": {
      "en": "Do I need an account or agreement checkbox before beginning?",
      "zh": "开始前需要账户或勾选同意吗？"
    },
    "answer": {
      "en": "No. The start button opens the first observation directly. You may leave, keep any observation unscored or read all three guides without answering.",
      "zh": "不需要。点击开始直接打开第一条观察；可以离开、将任何观察保留为未计分，或不答题直接阅读三篇指南。"
    }
  }
];
