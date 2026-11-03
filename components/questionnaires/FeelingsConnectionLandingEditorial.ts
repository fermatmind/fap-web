import type { Text } from "@/lib/questionnaires/types";

export const feelingsConnectionSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "feelings-connection-purpose",
    "title": {
      "en": "Feelings and connection after difficult times: two recent topics",
      "zh": "困难时期之后：分别理解近期感受与联系"
    },
    "paragraphs": [
      {
        "en": "Eight original descriptions invite adults to recall their own past four weeks. The first topic concerns strong, changing or muted feelings and using an available pause; the second concerns wanting contact, asking for support, requesting space and uncertainty after a disagreement. Each topic contains four statements, with every selected category retained.",
        "zh": "八条原创描述，供成年人回顾本人过去四周。第一组涉及强烈、变化或很淡的感受，以及使用可用的暂停；第二组涉及想与人接触、请求支持、提出空间需要，以及分歧后的不确定。每组四条，分别保留逐条所选类别。"
      },
      {
        "en": "You can read both full guides without answering or recounting a difficult event. No event type, duration, repeated exposure or personal history is required. These two overlapping topics organize observations; they are not validated independent psychological dimensions, a trauma-history check or a classification of a relationship.",
        "zh": "不答题、不讲述困难事件，也能阅读两篇完整指南。无需提供事件类型、时长、重复暴露或私人历史。这两个可能重叠的主题用于整理观察，不是已经验证的独立心理维度、创伤历史核查或关系分类。"
      }
    ]
  },
  {
    "id": "feelings-and-pauses",
    "title": {
      "en": "A pause and a difficult feeling can both be recorded",
      "zh": "暂停与困难感受，可以同时被记录"
    },
    "paragraphs": [
      {
        "en": "The first statements distinguish a feeling staying intense after an unwelcome reminder, feelings changing before words are available, muted emotion and using a pause before returning to an activity. These are different experiences. Muted feeling is not automatically calm, and an intense feeling does not establish an inability to regulate emotion.",
        "zh": "前四条区分不想要的提醒后感受持续强烈、尚未说清时感受已变化、情绪很淡，以及暂停后返回活动。这些是不同经历；感受很淡不自动等于平静，感受强烈也不证明缺乏调节能力。"
      },
      {
        "en": "Someone might recall both feeling unsettled and taking a pause, yet still feel unsettled afterwards. Both descriptions remain without cancelling each other. The record does not prove the pause effective or ineffective, identify dissociation or prescribe a technique. No reminder, body check or feeling-suppression exercise needs to be recreated.",
        "zh": "某人可能既记得不安，也记得使用了暂停，之后仍然不安。两种描述分别保留，不相互抵消。记录不证明暂停有效或无效，不识别解离，也不规定调节技巧。无需重现提醒、检查身体或练习压下感受。"
      }
    ]
  },
  {
    "id": "contact-and-space",
    "title": {
      "en": "Wanting contact does not remove a need for space",
      "zh": "想要联系，也可以需要空间"
    },
    "paragraphs": [
      {
        "en": "The second topic separates wanting contact while feeling uneasy, not making an ordinary support request, asking to slow or pause an exchange and uncertainty after a small disagreement. A person can want connection and more room at the same time. No amount of closeness or distance is treated as the preferred answer.",
        "zh": "第二组分别涉及想接触却不自在、没有提出普通支持请求、要求交流放慢或暂停，以及小分歧之后的不确定。想要联系与需要更多空间可以同时存在，不把某种亲近或距离程度当作理想答案。"
      },
      {
        "en": "Your feeling cannot establish another person’s intention, trustworthiness or safety, or prove that a valued relationship has changed. Feeling at ease also cannot certify safety. The page does not decide whether you should stay, leave, trust more or remove a boundary; no contact, reassurance request or confrontation is needed to test an answer.",
        "zh": "自身感受不能确定他人的意图、可信度或安全性，也不能证明重视的关系已经改变；自在同样不能认证安全。页面不决定应该留下、离开、增加信任或撤掉边界，无需通过联系、索取保证或对质来检验答案。"
      }
    ]
  },
  {
    "id": "opportunities-and-categories",
    "title": {
      "en": "Notice frequency in context, keep unscored separate",
      "zh": "结合相关机会理解频率，分别保留未计分"
    },
    "paragraphs": [
      {
        "en": "For each description, choose did not notice on relevant occasions, rarely, sometimes, often or very often noticed. If there was no relevant opportunity, recall is unclear or you prefer not to answer, choose unscored. Not having an opportunity is different from having one and not noticing the experience.",
        "zh": "每条可选有相关机会时没有注意到、很少、有时、较常或经常注意到。没有相关机会、回忆不清或不愿回答时，选未计分。没有机会，和有机会却没有注意到该经历，是不同情况。"
      },
      {
        "en": "For example, one sometimes, one often and two unscored selections give counts 0, 0, 1, 1, 0 and 2 in the displayed order. They add to four descriptions, not four incidents, days or symptoms. Category IDs are not points; counts do not yield a total, mean, dominant topic, risk band or percentage of recovery.",
        "zh": "例如，一条有时、一条较常与两条未计分，按展示顺序的六类计数为0、0、1、1、0、2，合计四条描述，而不是四次事件、四天或四种症状。类别标识不是点数；计数不生成总分、均分、主导主题、风险档或恢复百分比。"
      }
    ]
  },
  {
    "id": "present-feelings-and-history",
    "title": {
      "en": "Current feelings cannot verify past events",
      "zh": "当前感受不能核实过去事件"
    },
    "paragraphs": [
      {
        "en": "A difficult period is not automatically a clinically defined trauma, and a present feeling cannot reconstruct what happened or establish why you feel it. VA’s discussion of complex PTSD distinguishes clinical definitions from a particular type of trauma history. [1] The eight observations do not apply those diagnostic definitions or ask you to prove an event.",
        "zh": "困难时期不自动等于临床定义的创伤，当前感受也不能重建事件经过或确定感受原因。VA关于复杂性PTSD的讨论，区分了临床定义与特定类型的创伤历史。[1] 这八条观察不应用诊断定义，也不要求证明事件。"
      },
      {
        "en": "No single or repeated-event requirement is used to decide whether you may read or seek support. You do not need to search records, revisit a difficult memory or produce an account. The same guides remain available when recall is uncertain, when every item is unscored and when you choose not to complete the form.",
        "zh": "阅读或寻求支持不以单次、反复事件等要求决定资格。无需查找记录、重返困难记忆或提供叙述。回忆不清、全部未计分或选择不完成时，仍可阅读相同指南。"
      }
    ]
  },
  {
    "id": "records-and-separate-readings",
    "title": {
      "en": "Two records and separate resources keep their own methods",
      "zh": "两份记录与独立资源，各自保留方法"
    },
    "paragraphs": [
      {
        "en": "The result retains two records: four individual descriptions, selected labels and six category counts in each. Both complete public guides explain context and examples without revealing anyone’s answers. No count determines an attachment style, emotion-regulation capacity, abuse finding or whether a relationship has improved.",
        "zh": "结果保留两份记录，每份展示四条描述、所选标签与六类计数。两篇完整公开指南解释背景与例子，不展示任何人的答案。计数不确定依恋类型、情绪调节能力、虐待结论或关系是否改善。"
      },
      {
        "en": "The separate trauma-response reflection keeps twenty descriptions and four guides. The separate self-criticism questionnaire keeps twenty-two statements, three parts and its own general-setback instructions, without a fixed numerical recall window. Those methods are not changed to four weeks, and no answers or numbers are transferred into a combined PTSD or complex-PTSD result.",
        "zh": "独立提醒反应回顾保留二十条描述与四篇指南；独立自我批评问卷保留二十二条陈述、三部分及其针对一般挫折的说明，没有固定数值回忆期。不把这些方法改成四周，也不转移回答或数字来组合PTSD或复杂性PTSD结果。"
      }
    ]
  },
  {
    "id": "evidence-and-interpretation",
    "title": {
      "en": "Original observations are distinct from clinical trauma assessment",
      "zh": "原创观察与临床创伤评估，应分别理解"
    },
    "paragraphs": [
      {
        "en": "This is an original eight-description reflection, not the International Trauma Questionnaire, a clinical short form or a PTSD screen. It has no established norms, diagnostic cutoffs, reliability, validity or English–Chinese measurement equivalence. Four weeks is the reflection’s recall frame, not a diagnostic-duration finding.",
        "zh": "这是八条描述的原创回顾，不是国际创伤问卷、临床短版或PTSD筛查。题本尚未建立常模、诊断切点、信度、效度或中英文测量等值；四周是本回顾的回忆范围，不是诊断所需时长的判断。"
      },
      {
        "en": "A change on retaking can involve different opportunities, recall, circumstances or understanding. It does not measure recovery, deterioration or treatment response. Helpful actions are not reverse-scored to erase difficult moments, and fewer noticed experiences or an entirely unscored record cannot exclude a concern.",
        "zh": "重做时的变化可能涉及机会、回忆、背景或理解差异，不测恢复、恶化或治疗反应。有帮助的行动不会被反向计分来消除困难片刻；注意到的经历较少或全部未计分，也不能排除顾虑。"
      }
    ]
  },
  {
    "id": "privacy-and-support",
    "title": {
      "en": "Support and privacy do not depend on completion",
      "zh": "支持与隐私，不以完成回顾为条件"
    },
    "paragraphs": [
      {
        "en": "Selections remain in this page’s memory, without drafts, answer submission, questionnaire analytics or a private result URL. Exiting, reloading, leaving or restarting clears them. Copy public entry includes only the public title and link. No uploads, private conversation transcripts or relationship details are requested.",
        "zh": "选择仅留当前页面内存，不保存草稿、不提交答案、不作问卷分析，也不生成私人结果网址。退出、刷新、离开或重做会清除；复制公开入口只含公开标题与链接。不要求上传、私人谈话实录或关系细节。"
      },
      {
        "en": "NIMH recommends professional help when difficulties persist or interfere with daily life. [2] You may discuss distress or participation needs with a qualified professional without completing a record, reaching a count or proving a past event. Keep existing care and support independent; this page does not assess urgency, monitor you or replace individual care.",
        "zh": "NIMH建议，在困难持续或影响日常生活时寻求专业帮助。[2] 无需完成记录、达到计数或证明过去事件，即可就困扰或参与需要与合格专业人士交流。已有照护与支持独立保留；页面不评估紧急程度、不监测个人，也不替代个体化照护。"
      }
    ]
  }
];

export const feelingsConnectionFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Who is this for and how long does it take?",
      "zh": "适合谁回顾，约需多久？"
    },
    "answer": {
      "en": "Adults can voluntarily recall their own past four weeks through eight original descriptions. Allow about three minutes at your own pace. Both guides are free without registration or answers.",
      "zh": "供成年人自愿回顾本人过去四周，八条原创描述约需三分钟，可按个人节奏进行。无需注册或作答，两篇指南全部免费。"
    }
  },
  {
    "question": {
      "en": "Can intense feelings and using a pause appear in the same record?",
      "zh": "强烈感受与使用暂停，能出现在同一记录里吗？"
    },
    "answer": {
      "en": "Yes. They describe different moments or aspects and remain separate. Taking a pause does not cancel an intense feeling or prove recovery; muted emotion is not automatically calm. There is no reverse-scoring rule.",
      "zh": "可以。它们描述不同片刻或方面，分别保留。使用暂停不抵消强烈感受，也不证明恢复；情绪很淡不自动等于平静。没有反向计分规则。"
    }
  },
  {
    "question": {
      "en": "Does wanting space mean I do not want connection?",
      "zh": "需要空间，是否说明不想与人联系？"
    },
    "answer": {
      "en": "Not necessarily. Wanting contact and asking to slow an exchange can coexist. The record does not decide how close a relationship should be or require you to contact someone, seek reassurance or remove a boundary.",
      "zh": "未必。想接触与提出交流放慢可以并存。记录不决定关系应多亲近，也不要求联系他人、索取保证或撤掉边界。"
    }
  },
  {
    "question": {
      "en": "What is the difference between did not notice and unscored?",
      "zh": "“没有注意到”和“未计分”有什么区别？"
    },
    "answer": {
      "en": "Did not notice applies when a relevant opportunity existed. Unscored covers no opportunity, unclear recall or withholding. It is retained separately rather than supplied as zero. All eight descriptions may be unscored.",
      "zh": "没有注意到，是指存在相关机会时未注意到。未计分包含没有机会、回忆不清或保留回答，分别保留，不补成零分。八条都可以未计分。"
    }
  },
  {
    "question": {
      "en": "Do the counts show how many difficult events happened?",
      "zh": "计数能显示发生过多少困难事件吗？"
    },
    "answer": {
      "en": "No. They count which categories were selected for four descriptions per topic. They do not count events, symptoms, days or time, and cannot verify a past history or determine a cause.",
      "zh": "不能。它们统计各主题四条描述中选择了哪些类别，不计事件、症状、天数或时间，也不能核实过去历史或确定原因。"
    }
  },
  {
    "question": {
      "en": "Can the record tell whether another person is safe or trustworthy?",
      "zh": "记录能判断别人是否安全或值得信任吗？"
    },
    "answer": {
      "en": "No. It asks about your experience, not another person’s intentions or conduct. Neither unease nor ease certifies safety or relationship quality. Practical boundaries and support do not require a questionnaire verdict.",
      "zh": "不能。它询问自身体验，不评估他人意图或行为。不自在或自在都不能认证安全或关系质量；实际边界与支持无需等待问卷裁决。"
    }
  },
  {
    "question": {
      "en": "Are these two topics the clinical domains of complex PTSD?",
      "zh": "这两个主题就是复杂性PTSD的临床维度吗？"
    },
    "answer": {
      "en": "No. They are original editorial groupings, not validated clinical dimensions or an abbreviated ITQ. Similar words about feelings or connection do not establish diagnostic equivalence, and adding other questionnaires does not create a clinical total.",
      "zh": "不是。它们是原创编辑分组，不是经验证的临床维度或ITQ简版。感受、联系等相似词语不建立诊断等价，增加其他问卷也不能组成临床总分。"
    }
  },
  {
    "question": {
      "en": "Must I try an exercise or retake to read the guides?",
      "zh": "需要先做练习或重测，才能阅读指南吗？"
    },
    "answer": {
      "en": "No. Read both complete guides without answering, recreating a reminder or changing how you interact. Retaking is optional and cannot measure treatment response. You may stop without losing access to the public explanations.",
      "zh": "不需要。无需答题、重现提醒或改变相处方式，即可读两篇全文。重做自愿，也不能测治疗反应；停止不影响阅读公开解释。"
    }
  }
];

export const feelingsConnectionReadingSummaries: Record<string, Text> = {
  "feelings-and-settling-reading": {
    "en": "Distinguish strong, changing and muted feelings from using a pause; retain both helpful actions and difficulty without cancellation or a causal claim.",
    "zh": "区分强烈、变化和很淡的感受与暂停行动，分别保留有帮助的行动和困难，不相互抵消或作因果判断。"
  },
  "closeness-and-boundaries-reading": {
    "en": "Read wanting contact, holding back support, asking for space and uncertainty after disagreement without judging another person or the relationship.",
    "zh": "理解想接触、未提出支持、请求空间及分歧后的不确定，不据此评判他人或关系。"
  }
};
