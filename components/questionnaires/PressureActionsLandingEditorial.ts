import type { Questionnaire } from "@/lib/questionnaires/types";
export const pressureLandingSections: Questionnaire["guide"] = [
  {
    "id": "pressure-purpose",
    "title": {
      "en": "Actions under pressure: four ordinary observation themes",
      "zh": "压力下的行动：四个日常观察主题"
    },
    "paragraphs": [
      {
        "en": "This optional adult reflection asks what you noticed in ordinary pressured interactions during the past four weeks. Twelve original statements concern protecting a position, moving away, getting stuck and agreeing early. They organise a record of your answers; they do not identify four kinds of people or determine how you should respond next.",
        "zh": "本自愿成人回顾询问过去四周普通压力互动中注意到了什么。十二条原创陈述涉及维护立场、退开、回应卡住与先答应，用于整理回答记录，不划分四种人，也不决定下一次应该怎样回应。"
      },
      {
        "en": "No event narrative, birth information or account is required. You may read all four complete guides before answering. If recalling a situation is unhelpful, use Unscored, pause or leave; completing the form is not a prerequisite for support or for reading its explanations.",
        "zh": "无需叙述事件、提供出生信息或注册，作答前即可阅读四篇完整指南。回想情境若没有帮助，可以选未计分、暂停或离开；完成练习不是获得支持或阅读解释的前提。"
      }
    ]
  },
  {
    "id": "pressure-position-distance",
    "title": {
      "en": "Protecting a position and moving away need context",
      "zh": "维护立场与退开都需要结合情境"
    },
    "paragraphs": [
      {
        "en": "Protecting a position describes actions such as defending a view before hearing the whole question. It does not establish assertiveness, aggression, guilt or responsibility. Read the actual wording and the interaction: expressing a disagreement, rushing to defend it and frightening someone are different matters.",
        "zh": "维护立场描述尚未听完问题便开始辩解等动作，不据此确定坚定表达、攻击性、过错或责任。应回到题文与互动过程：提出不同意见、急于辩解与使他人害怕，是不同事情。"
      },
      {
        "en": "Moving away records the described forms of creating distance. A pause, a practical departure and avoidance of a conversation can look similar from outside, while having different purposes and constraints. The category record does not decide whether staying or returning is safe, necessary or desirable.",
        "zh": "退开记录题目描述的拉开距离方式。暂停、实际离场与避开谈话，外观可能相似，目的与限制却可能不同。类别记录不判断留下或返回是否安全、必要或值得，也不要求重新接触任何人。"
      }
    ]
  },
  {
    "id": "pressure-stuck-agreement",
    "title": {
      "en": "Getting stuck and agreeing early are not conclusions about consent",
      "zh": "回应卡住与先答应，不构成同意结论"
    },
    "paragraphs": [
      {
        "en": "Getting stuck concerns the reported difficulty producing a response in the specified situation. Three statements cannot establish tonic immobility, dissociation, a neurological mechanism or its cause. Deliberately taking time to think and wanting to answer but feeling stuck should be read through the exact wording, not treated as interchangeable.",
        "zh": "回应卡住关注题目情境中难以作出回应的自报经历，三条陈述不能确立强直性静止、解离、神经机制或其成因。主动花时间思考，与想回应却感到卡住，应根据具体题文区分，不视为一回事。"
      },
      {
        "en": "Agreeing early concerns a quick agreement or accommodation as described in the items. It does not establish another person’s intentions, a freely chosen preference, consent or an obligation to comply later. A recorded action cannot settle questions about safety, responsibility or a relationship.",
        "zh": "先答应关注题目描述的快速应允或迁就，不确定他人的意图、本人自由选择的偏好、同意或此后服从的义务。一项行动记录，不能裁定安全、责任或关系问题。"
      }
    ]
  },
  {
    "id": "pressure-recall",
    "title": {
      "en": "Use a recent ordinary context, with an unscored option",
      "zh": "近期普通情境与未计分选项"
    },
    "paragraphs": [
      {
        "en": "Use the past four weeks rather than searching for a difficult event or trying to reconstruct a childhood explanation. Read each statement against what you can recall. Different people, time pressure and available choices can change what happened; this brief form does not separate all possible influences.",
        "zh": "请回想过去四周，无需寻找困难事件或重建童年解释。逐条对照能够回想的经历；互动对象、时间压力与可用选择，都可能影响行动，这份简短题本不能分离所有因素。"
      },
      {
        "en": "Did not notice means you chose that category for this observation in this period. Unscored keeps no relevant opportunity, unclear recall or a withheld answer separate. Neither label certifies that nothing happened or that support is unnecessary; a missing situation must not automatically become a low-frequency answer.",
        "zh": "没有注意到，表示在这一时期对该条观察选择了这一类别；未计分则保留没有相关机会、回想不清或不愿回答。两者均不能证明什么都没发生或不需要支持，缺少情境不自动记为低频率。"
      }
    ]
  },
  {
    "id": "pressure-counts",
    "title": {
      "en": "Read six category counts for each set of three statements",
      "zh": "每组三条分别阅读六种类别计数"
    },
    "paragraphs": [
      {
        "en": "Each theme has three statements. Every explicit answer adds one to one of six category counts: Did not notice, Rarely, Sometimes, Often, Very often or Unscored. The six counts for a theme add to three. Option identifiers 0–4 are labels in the implementation, not points to sum or average.",
        "zh": "每个主题有三条陈述。每个明确回答分别进入没有注意到、很少、有时、较常、经常或未计分之一，六项计数合计三条。实现中的0至4选项标识是标签，不是可以相加或求均值的点数。"
      },
      {
        "en": "For example, Sometimes, Sometimes and Unscored gives counts 0, 0, 2, 0, 0, 1 in that order. This describes two statements assigned to Sometimes, not two episodes or a severity level. Individual statements and their selected labels remain available, because the same category counts can come from different observations.",
        "zh": "例如，有时、有时与未计分，按上述顺序得到0、0、2、0、0、1，表示两条陈述被归入有时，不是发生两次事件或某种严重程度。逐条陈述与所选类别仍保留，因为相同类别计数可能来自不同观察。"
      }
    ]
  },
  {
    "id": "pressure-four-f",
    "title": {
      "en": "The four-F vocabulary is background, not a scoring key",
      "zh": "四种反应用词是背景，不是本题本计分键"
    },
    "paragraphs": [
      {
        "en": "Pete Walker’s original four-F paper presents a clinical explanatory typology in the context of complex PTSD. This is background for distinguishing that vocabulary from our everyday action descriptions. Its discussion does not establish the causes of your answers, validate these twelve items or turn them into a diagnostic instrument. [1]",
        "zh": "Pete Walker的四种反应原文是在复杂性PTSD语境中提出的临床解释框架。本页用它区分相关词汇与日常行动描述；其讨论不确立本次回答的成因，不验证本页十二条原创题，也不使其成为诊断工具。[1]"
      },
      {
        "en": "This form does not assign fight, flight, freeze or fawn as a default or secondary type. It measures no physiological state, childhood history or hidden survival mechanism. Organising ordinary actions into four reading themes is an editorial choice, not evidence that all experiences fit four mechanisms.",
        "zh": "本页不分配fight、flight、freeze或fawn默认类型或副型，不测生理状态、童年经历或隐藏生存机制。将日常行动组织为四个阅读主题，是编辑安排，不证明所有经历都属于四种机制。"
      }
    ]
  },
  {
    "id": "pressure-assessment",
    "title": {
      "en": "Self-observation, clinical assessment and support have different roles",
      "zh": "自我观察、临床评估与支持的职责不同"
    },
    "paragraphs": [
      {
        "en": "VA material describes varied reactions after trauma and notes that not all reactions are PTSD. Separate VA assessment guidance explains interviews and standardised questionnaires within a fuller assessment. These sources cannot determine whether your ordinary interaction was traumatic or clinically significant. [2][3]",
        "zh": "VA资料介绍创伤后的多种反应，并说明并非所有反应都是PTSD；另有评估指南解释访谈及标准化问卷在更完整评估中的作用。这些资料不能判定本次普通互动是否构成创伤或具有临床意义。[2][3]"
      },
      {
        "en": "This original bilingual form has no established reliability, validity, norms, clinical thresholds or language-equivalence evidence. It has no overall score, mean, highest theme, risk band or treatment recommendation. You can ask a qualified professional about support without finishing, reaching a count or deciding which category describes you.",
        "zh": "本原创双语题本尚无已确立的信度、效度、常模、临床阈值或语言等值证据，不生成总分、均值、最高项、风险档位或治疗建议。无需完成题本、达到某种次数或确定自己属于哪类，就可以向合格专业人士了解支持。"
      }
    ]
  },
  {
    "id": "pressure-privacy",
    "title": {
      "en": "Keep the observation private and the guides freely readable",
      "zh": "保持私人观察与完整指南的自由阅读"
    },
    "paragraphs": [
      {
        "en": "Answers and the resulting record remain in this page’s memory. There is no saved draft, submission of answers or questionnaire analytics. Exit and clear, retake, reload or leaving the page clears the attempt. Copy public entry copies only the public title and URL, never your answers or counts.",
        "zh": "回答与记录只留在本页内存，不保存草稿、不提交回答，也没有问卷分析。退出并清除、重做、刷新或离开页面都会清除本次记录。复制公开入口只复制公开标题与网址，不包含回答或计数。"
      },
      {
        "en": "All twelve observations need an explicit response before a record is organised; all twelve may be Unscored. The four full guides remain the same in every answer state. You can simply read, keep a private example for yourself or finish without confronting someone, recalling a frightening event or providing a written account.",
        "zh": "十二条观察均明确回应后才整理记录，也可以十二条全部未计分。任何回答状态下，四篇完整指南都相同。可以只阅读、为自己保留一个私人实例或结束，无需对抗他人、回想可怕事件或提交文字叙述。"
      }
    ]
  }
];
export const pressureLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Are the option numbers points?",
      "zh": "选项数字是点数吗？"
    },
    "answer": {
      "en": "No. They identify frequency categories. The output counts statements within categories, without sums, means or severity bands.",
      "zh": "不是。它们识别频率类别，输出记录各类别中的陈述条数，不计算和、均值或严重程度档位。"
    }
  },
  {
    "question": {
      "en": "How are Sometimes, Sometimes and Unscored recorded?",
      "zh": "有时、有时、未计分怎样记录？"
    },
    "answer": {
      "en": "Two statements go into Sometimes and one into Unscored. This is not a count of events or evidence of a default response.",
      "zh": "两条进入有时，一条进入未计分；这不是事件次数，也不证明默认反应。"
    }
  },
  {
    "question": {
      "en": "Does getting stuck establish a freeze response?",
      "zh": "回应卡住能确立freeze反应吗？"
    },
    "answer": {
      "en": "No. A reported difficulty responding does not establish a physiological state, dissociation, trauma or its cause.",
      "zh": "不能。自报难以回应不确立生理状态、解离、创伤或成因。"
    }
  },
  {
    "question": {
      "en": "Can early agreement determine consent?",
      "zh": "先答应能确定同意吗？"
    },
    "answer": {
      "en": "No. A category record cannot determine freely given consent, another person’s intentions, responsibility or obligations.",
      "zh": "不能。类别记录不确定自由给予的同意、他人意图、责任或义务。"
    }
  },
  {
    "question": {
      "en": "Is leaving always avoidance?",
      "zh": "离开总是回避吗？"
    },
    "answer": {
      "en": "No. Context, purpose and available choices matter. The record gives no instruction to stay, return or renew contact.",
      "zh": "不是。需要结合情境、目的与可用选择；记录不要求留下、返回或恢复联系。"
    }
  },
  {
    "question": {
      "en": "Can all twelve observations be unscored?",
      "zh": "十二条可以全部未计分吗？"
    },
    "answer": {
      "en": "Yes. Each theme then has three unscored statements. All four guides remain open, with no low-risk or all-clear conclusion.",
      "zh": "可以。每个主题届时有三条未计分，四篇全文仍开放，不产生低风险或一切正常的结论。"
    }
  },
  {
    "question": {
      "en": "Does a retest show recovery or worsening?",
      "zh": "重测能说明恢复或恶化吗？"
    },
    "answer": {
      "en": "No. Check the recall window, opportunities and particular statements. This form has no measurement-error or treatment-outcome evidence for interpreting change.",
      "zh": "不能。应核对回想时间、机会与具体陈述；本题本没有用于解释变化的测量误差或治疗结局证据。"
    }
  },
  {
    "question": {
      "en": "Must I finish before asking for support?",
      "zh": "需要完成后才能寻求支持吗？"
    },
    "answer": {
      "en": "No. Support is independent of completion and category counts. Ask a qualified professional about the process and decide how much you want to share.",
      "zh": "无需。支持独立于完成状态和计数，可向合格专业人士询问流程，自行决定分享多少。"
    }
  }
];
export const pressureLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "VA National Center for PTSD — How Is PTSD Assessed?",
      "zh": "VA国家PTSD中心：怎样进行PTSD评估？"
    },
    "url": "https://www.ptsd.va.gov/understand/isitptsd/measured_how.asp"
  }
];
