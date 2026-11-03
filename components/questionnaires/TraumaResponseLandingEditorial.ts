import type { Questionnaire } from "@/lib/questionnaires/types";
export const traumaLandingSections: Questionnaire["guide"] = [
  {
    "id": "trauma-purpose",
    "title": {
      "en": "Reactions after a difficult experience: an optional observation record",
      "zh": "困难经历后的反应回顾：一份自愿的观察记录"
    },
    "paragraphs": [
      {
        "en": "This original exercise is for adults who want words for what they have noticed during the past four weeks after a difficult experience. Twenty statements are organized into unwanted reminders, keeping some distance, mood and connection, and feeling on edge. The four themes help organize reading; they are not four types of people, a validated symptom structure or a diagnosis.",
        "zh": "这项原创练习供成年人自愿整理：在困难经历之后，过去四周注意到了什么。20条陈述分为不想要的提醒、保持一些距离、情绪与联系、紧绷与警觉四主题。这些主题用于组织阅读，不是四类人、经过验证的症状结构或诊断。"
      },
      {
        "en": "Allow about five minutes for the statements, with additional time for the four complete guides. You can read every guide without answering, leave any observation unscored or exit before finishing. A completed record shows the selected category beside each statement and six category counts for each theme. There is no combined score, highest theme, risk band or recovery percentage.",
        "zh": "陈述作答预计约五分钟，四篇完整指南需另留阅读时间。可以不答题阅读全部指南，将任一观察留为未计分，或在完成前退出。完整记录逐条展示陈述与所选类别，并给每主题列出六类计数；不计算综合分数、最高主题、风险档位或康复百分比。"
      }
    ]
  },
  {
    "id": "trauma-context",
    "title": {
      "en": "A four-week recall window is a reference, not a requirement to wait",
      "zh": "四周是回想参照，不是等待求助的期限"
    },
    "paragraphs": [
      {
        "en": "Use the past four weeks as the same reference across the statements. The question is which supplied frequency category fits what you noticed, not whether you can establish why it occurred. You do not have to identify a qualifying trauma, reconstruct a memory, compare experiences with someone else or explain what happened. No event narrative is requested or collected.",
        "zh": "各条统一以过去四周为参照，选择符合自己注意情况的频率类别，而不是证明为何出现这些反应。不必判定经历是否符合某种创伤资格，不必重建记忆、比较谁的经历更严重，或解释发生了什么。页面不要求也不收集事件叙述。"
      },
      {
        "en": "If recall is unclear, there was no relevant opportunity or you prefer not to answer, use unscored. Do not deliberately seek reminders to create an answer. You may stop at any point and contact a qualified professional whenever you want support, without waiting until four weeks have passed or a category count reaches a number. The page cannot decide whether support is needed.",
        "zh": "回想不清、没有相关机会或不愿回答时，使用未计分。无需故意寻找提醒材料来形成答案。可以随时停止，也可在希望获得支持时联系合格专业人士，不必等四周过去或等某类计数达到某个数字。本页不能替你决定是否需要支持。"
      }
    ]
  },
  {
    "id": "trauma-reminders-distance",
    "title": {
      "en": "Unwanted reminders and keeping distance: read the actual observation",
      "zh": "不想要的提醒与保持距离：回到具体观察"
    },
    "paragraphs": [
      {
        "en": "The first theme describes unwanted reminders drawing attention away from ordinary activities. The second describes ways of keeping some distance in relation to reminders or situations. These are different descriptions: noticing an unwelcome reminder does not prove that you also avoided something, and choosing distance in one situation does not explain its cause or establish a fixed response style.",
        "zh": "第一主题描述不想要的提醒怎样带走日常活动中的注意；第二主题描述与提醒或情境保持一些距离的方式。两者是不同描述：注意到不想要的提醒，不证明同时回避了什么；某情境中保持距离，也不能据此解释原因或确定固定反应风格。"
      },
      {
        "en": "Use the wording and selected category together. A statement may have little relevance when the situation did not arise, and that differs from an observation you considered but did not notice. The exercise does not ask you to approach a reminder, test your tolerance or change a protective arrangement. It provides descriptive language rather than an exposure task or advice about how to handle a particular event.",
        "zh": "应把题文与所选类别一起阅读。情境未出现时，一条陈述可能缺少相关性；这与经过考虑但没有注意到该观察不同。练习不要求接近提醒材料、测试承受程度或改变保护性安排，只提供描述语言，不进行暴露任务，也不指导处理某个具体事件。"
      }
    ]
  },
  {
    "id": "trauma-mood-alertness",
    "title": {
      "en": "Mood, connection and alertness are topics, not proof of a cause",
      "zh": "情绪、联系与警觉是观察主题，不是原因证明"
    },
    "paragraphs": [
      {
        "en": "Mood-and-connection observations concern experiences of feeling and relating; feeling-on-edge observations concern tension, alertness and attention as described in the items. Everyday circumstances and physical health can also matter to someone’s experience. The record cannot distinguish possible explanations, attribute a reaction to trauma or tell whether an experience meets a clinical symptom definition.",
        "zh": "情绪与联系观察涉及感受与互动体验；紧绷与警觉观察涉及题目描述的紧张、警戒与注意。日常条件与身体健康也可能影响体验。记录不能区分可能解释、把反应归因于创伤，或判定某项体验是否达到临床症状定义。"
      },
      {
        "en": "The VA’s public material describes a range of reactions after trauma and explains that reactions do not all amount to PTSD. [2] That background does not identify the origin of your answers. Someone may want help with sleep, concentration, relationships or an unsettling experience regardless of which observations appear here. A low count, an unscored response or a topic missing from this short bank cannot rule out a concern.",
        "zh": "VA公开资料介绍创伤后可能出现的多种反应，并说明并非所有反应都构成PTSD。[2] 这些背景不能确定个人回答的来源。无论本页呈现哪些观察，都可以就睡眠、注意、关系或令人不安的体验寻求帮助。计数少、未计分，或某主题未纳入这份简短题组，都不能排除困扰。"
      }
    ]
  },
  {
    "id": "trauma-counts",
    "title": {
      "en": "How the record counts categories without turning them into points",
      "zh": "怎样按类别记录，而不把标签变成点数"
    },
    "paragraphs": [
      {
        "en": "Each theme contains five statements. Every explicit response places that statement in exactly one category: did not notice, rarely, sometimes, often, very often or unscored. The six category counts therefore sum to five within each theme. The option identifiers 0–4 are category labels in the implementation, not points to add, average or convert into a clinical scale.",
        "zh": "每主题有五条陈述。每个明确回应，将该陈述放入没有注意到、很少、有时、较常、经常或未计分中的一类，因此每主题六类计数之和恒为五。实现中的0至4选项标识是类别标签，不是可相加、平均或换算临床量表的点数。"
      },
      {
        "en": "For example, one did-not-notice response, two sometimes responses, one very-often response and one unscored response account for all five statements. This does not mean five episodes occurred, nor does it create a severity total. Two people can have the same category counts while selecting those categories for different statements; the individual statement-and-category list preserves that distinction.",
        "zh": "例如，一条没有注意到、两条有时、一条经常、一条未计分，覆盖全部五条陈述。这不表示发生了五次事件，也不产生严重程度总分。两人可能类别计数相同，但对应不同陈述；逐条陈述与类别清单保留了这个区别。"
      }
    ]
  },
  {
    "id": "trauma-missing",
    "title": {
      "en": "Unscored and did not notice carry different information",
      "zh": "未计分与没有注意到，含义不同"
    },
    "paragraphs": [
      {
        "en": "Did not notice means you selected that label for the particular observation during the recall period. Unscored preserves no relevant opportunity, uncertain recall or a choice to withhold an answer. It is not replaced with did not notice or used to infer hidden symptoms. With all five statements unscored, that theme contains no stated frequency observations, while its full public reading stays available.",
        "zh": "没有注意到，表示你为该观察在回想时段中选择了这个标签。未计分保留没有机会、回想不清或主动保留回答，不替换成没有注意到，也不用于推断隐藏症状。五条全部未计分时，该主题没有陈述频率信息，但完整公开读法仍可阅读。"
      },
      {
        "en": "More statements in a frequent category do not establish greater distress, impairment, danger or a treatment need compared with another person. Frequency labels alone do not capture all those matters, and the original bank has no validated comparison rule. A changed record can also reflect a different opportunity, recollection or interpretation. It cannot by itself measure improvement, deterioration or an intervention’s effect.",
        "zh": "更多陈述进入较频繁类别，不足以断定比另一人更痛苦、受影响更大、更危险或更需要治疗。频率标签没有涵盖全部这些信息，本原创题组也没有经过验证的比较规则。记录变化还可能反映机会、回忆或理解不同，不能单独测量改善、恶化或干预效果。"
      }
    ]
  },
  {
    "id": "trauma-evidence",
    "title": {
      "en": "Self-observation, screening and clinical assessment serve different purposes",
      "zh": "自我观察、筛查与临床评估，职责不同"
    },
    "paragraphs": [
      {
        "en": "Professional assessment may combine interviews and standardized questionnaires; a brief self-screen is not the same as a diagnostic evaluation. [1][4] The PCL-5 is a named instrument with its own wording, response anchors and scoring rules. [3] This page administers neither that instrument nor a four-F fight/flight/freeze/fawn profile. Equal-length groups of five original observations are not interchangeable with a clinical symptom-cluster structure.",
        "zh": "专业评估可以结合访谈与标准化问卷，简短自筛不同于诊断性评估。[1][4] PCL-5是具名工具，有自己的题文、选项锚点与计分规则。[3] 本页既不施测该工具，也不产生fight/flight/freeze/fawn四F画像。五条一组的等长原创观察，不能替代临床症状簇结构。"
      },
      {
        "en": "These 20 statements and four full readings are original FermatMind educational content. Reliability, validity, clinical cutoffs, norms and English–Chinese measurement equivalence have not been established for this bank. Reproducible category counts explain how responses are organized; they do not establish screening accuracy, eligibility for a diagnosis, causation or official endorsement. Research on another instrument cannot supply those missing properties.",
        "zh": "20条陈述与四篇全文均为费马原创教育内容。本题组尚未建立信度、效度、临床阈值、常模或英中文测量等值。可复算类别计数说明怎样整理回答，不建立筛查准确率、诊断资格、因果关系或官方背书。其他工具的研究不能补足这些尚缺的性质。"
      }
    ]
  },
  {
    "id": "trauma-use-privacy",
    "title": {
      "en": "Use only what is helpful, and keep control of the record",
      "zh": "按自己的需要阅读，保留对记录的控制"
    },
    "paragraphs": [
      {
        "en": "You can use a statement as a starting point for a voluntary conversation, without providing event details here. If you consult a qualified professional, you can ask what assessment involves and decide how much you wish to share. [1] The counts do not choose a therapy, decide urgency or require further testing. If you are in immediate danger or cannot stay safe, seek local emergency help rather than continuing this exercise.",
        "zh": "可以自选一条观察，作为自愿交流的起点，无需在本页提供事件细节。咨询合格专业人士时，可以先询问评估怎样进行，并决定希望分享多少信息。[1] 计数不选择疗法、不判定紧急程度，也不要求继续测试。正处于即时危险或无法保障自身安全时，应寻求当地紧急援助，而非继续本练习。"
      },
      {
        "en": "Begin enters the first observation directly, with no agreement checkbox. Answers stay only in the current page memory; there is no draft storage, answer submission or questionnaire analytics. Exit-and-clear, retaking, leaving or reloading clears the record. Copy public entry includes only the public title and address, not answers, counts or an event narrative. All four guides remain the same public text for every reader.",
        "zh": "点击开始直接进入第一条观察，没有同意复选框。回答仅留当前页面内存，不保存草稿、不提交答案、不发送问卷分析。退出清除、重做、离开或刷新会清除记录。复制公开入口仅包含公开标题与地址，不含回答、计数或事件叙述。四篇指南对所有读者都是相同的公开文本。"
      }
    ]
  }
];
export const traumaLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Who is this original reflection for?",
      "zh": "这项原创回顾适合谁？"
    },
    "answer": {
      "en": "It is an optional educational exercise for adults who wish to describe reactions they noticed after a difficult experience. It is not a child assessment, an exposure checklist or a diagnostic screen. You may read all four full guides without beginning.",
      "zh": "供成年人自愿描述困难经历后注意到的反应，属于教育性练习，不是儿童评估、暴露清单或诊断筛查。可以不开始作答，直接阅读四篇全文。"
    }
  },
  {
    "question": {
      "en": "Must I wait four weeks before seeking support?",
      "zh": "需要等四周后才能寻求支持吗？"
    },
    "answer": {
      "en": "No. Four weeks is the recall reference used by these statements, not a waiting requirement. You can seek help whenever you want support, including before answering or when the record is entirely unscored.",
      "zh": "不需要。四周是这些陈述的回想参照，不是等待要求。希望得到支持时就可求助，包括作答前或全部未计分时。"
    }
  },
  {
    "question": {
      "en": "What if I cannot remember or there was no relevant opportunity?",
      "zh": "回想不清或没有相关机会怎么办？"
    },
    "answer": {
      "en": "Use unscored. It preserves the reason not to state a frequency rather than substituting did not notice. You do not need to search for reminders, reconstruct details or force an answer to finish the form.",
      "zh": "选择未计分，保留无法陈述频率的情况，不替换成没有注意到。无需寻找提醒材料、重建细节或为完成表单勉强回答。"
    }
  },
  {
    "question": {
      "en": "Does “very often” mean a severe clinical condition?",
      "zh": "“经常”意味着严重临床状况吗？"
    },
    "answer": {
      "en": "Not by itself. It is the selected frequency category for one original observation. It does not establish distress, duration, impairment, cause or a diagnosis. Professional assessment considers more information than this category record. [1]",
      "zh": "单凭这个标签不能说明。它是一条原创观察所选的频率类别，不确立痛苦、持续时间、功能影响、原因或诊断。专业评估考虑的信息多于本类别记录。[1]"
    }
  },
  {
    "question": {
      "en": "Do identical category counts mean identical experiences?",
      "zh": "类别计数相同，意味着经历相同吗？"
    },
    "answer": {
      "en": "No. Different statements can enter the same categories. The result therefore retains every statement alongside its response. Even identical responses cannot establish identical context, impact or support needs.",
      "zh": "不意味着。不同陈述可能进入相同类别，所以结果同时保留每条陈述与回应。即使回答完全相同，也不能证明情境、影响或支持需要相同。"
    }
  },
  {
    "question": {
      "en": "Does the page identify fight, flight, freeze or fawn?",
      "zh": "本页会识别战斗、逃跑、僵住或讨好吗？"
    },
    "answer": {
      "en": "No. The four themes organize original observations about reminders, distance, mood and connection, and feeling on edge. They are not four-F response types and cannot be converted into them, PCL-5 scores or another provider’s profile.",
      "zh": "不会。四主题组织的是提醒、距离、情绪联系与紧绷警觉方面的原创观察，不是四F反应类型，不能换算成这些类型、PCL-5分数或其他提供方画像。"
    }
  },
  {
    "question": {
      "en": "Can I answer for a partner or infer what happened to someone?",
      "zh": "可以替伴侣作答，或推断别人经历过什么吗？"
    },
    "answer": {
      "en": "This first-person reflection is for the person choosing their own responses. Observable behavior does not reveal someone else’s memories, cause or diagnosis. Do not use the record to investigate another person or request private event details.",
      "zh": "这份第一人称回顾由本人选择自己的回应。外显行为不能揭示另一人的记忆、原因或诊断，不应用记录调查他人或索要私人事件细节。"
    }
  },
  {
    "question": {
      "en": "Will the copy button or a refresh preserve my private record?",
      "zh": "复制按钮或刷新会保留私人记录吗？"
    },
    "answer": {
      "en": "Copy public entry contains the public title and URL only. It does not share answers or counts. Refreshing or leaving clears the in-memory record, and there is no saved draft to restore. The four public guides remain accessible without any private record.",
      "zh": "复制公开入口仅包含公开标题与网址，不分享回答或计数。刷新或离开清除内存记录，没有可恢复草稿；四篇公开指南仍无需私人记录即可访问。"
    }
  }
];
export const traumaLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Cn2r — Screening and diagnostic assessment tools",
      "zh": "法国国家心理创伤资源与复原中心：筛查与诊断评估工具"
    },
    "url": "https://cn2r.fr/je-suis-professionnel/approfondir-mes-competences/"
  }
];
