import type { Text } from "@/lib/questionnaires/types";

export const uncertaintyEaseSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Ease with uncertainty: six experiences, one description record",
      "zh": "面对未知的自在感：六种体验，一份描述记录"
    },
    "paragraphs": [
      {
        "en": "Six original statements invite adults to recall ordinary, low-stakes experiences over the past four weeks: entering an unfamiliar setting, speaking without knowing the reception, an unsettled plan, tension before an unfamiliar task, uncertainty about a calm appearance and leaving an ordinary outcome unresolved. Each sentence retains its own selected category.",
        "zh": "六条原创陈述，供成年人回顾过去四周后果轻微的普通经历：进入陌生场合、不知回应仍开口、安排未定、陌生任务前紧张、不确定平静外表是否符合内心，以及允许普通结果暂时未定。每句保留自己所选的类别。"
      },
      {
        "en": "The shared topic does not make these six experiences interchangeable or establish a validated psychological dimension. A comfortable discussion and a tense task may both describe the same month. Read the sentences together with their different situations, rather than choosing a personal label from a combined count.",
        "zh": "同属一个主题，不代表六种体验可以互换，也不确立经过验证的心理维度。同一个月可以既有自在讨论，也有紧张任务。应结合不同场景逐句阅读，而不是从合并计数中选择人身标签。"
      }
    ]
  },
  {
    "id": "felt-ease",
    "title": {
      "en": "Feeling comfortable is different from performance or another person’s response",
      "zh": "觉得自在，不等于表现或别人的回应"
    },
    "paragraphs": [
      {
        "en": "Entering a low-stakes setting may feel familiar in one respect and unfamiliar in another. Feeling at ease describes the remembered experience, not how skilfully you handled the setting or whether an observer thought you confident. Practical demands, opportunity and support are not measured by the sentence.",
        "zh": "进入一个后果轻微的场合时，某方面可能熟悉，另一方面仍陌生。自在描述记得的感受，不代表处理场合的熟练程度，也不代表旁观者认为你自信。实际要求、机会与支持不由这句话测量。"
      },
      {
        "en": "The discussion statement concerns comfort while the reception of a view was unknown. It does not establish agreement, social success, charisma or speaking skill. You need not replay an exchange, inspect messages or ask anyone how they judged your confidence to choose a category.",
        "zh": "讨论陈述关注不知道观点会怎样被接受时的自在感，不证明别人赞同、社交成功、魅力或表达技能。选择类别无需重演交流、检查消息，或请别人评价你的自信。"
      }
    ]
  },
  {
    "id": "plans",
    "title": {
      "en": "Composure with an unsettled plan does not decide what to do",
      "zh": "安排未定时的平稳，不替你决定行动"
    },
    "paragraphs": [
      {
        "en": "Two statements concern feeling composed with an ordinary plan unsettled and not needing to settle an ordinary outcome immediately. These describe the relationship between a remembered feeling and an unresolved matter. They do not show whether an action was taken, a plan was adequate or waiting was useful.",
        "zh": "两句关注普通安排尚未确定时感到平稳，以及不要求立即确定普通结果。它们描述记得的感受与未定事项之间的关系，不证明采取了行动、计划充分或等待有用。"
      },
      {
        "en": "Room to leave something open does not mean indifference, procrastination or permission to ignore a deadline. These low-stakes recollections cannot determine a medical, financial, legal, work or relationship decision. Actual information needs and responsibilities remain separate from how calm the uncertainty felt.",
        "zh": "允许事情暂时未定，不意味着漠不关心、拖延或可以忽视期限。这些低后果回忆不能决定医疗、财务、法律、工作或关系行动。实际信息需要与责任，和面对未知时感到多平静，分别保留。"
      }
    ]
  },
  {
    "id": "tension",
    "title": {
      "en": "Tension and uncertainty about inner experience are not reverse keys",
      "zh": "紧张与对内心的未知，不是反向计分键"
    },
    "paragraphs": [
      {
        "en": "The unfamiliar-task statement explicitly allows practical consequences to be small while tension is present. Small stakes do not establish that a feeling was trivial or unreasonable. A tense task can coexist with a comfortable discussion; neither answer cancels the other.",
        "zh": "陌生任务陈述明确允许实际后果不大、紧张却仍存在。后果轻微，不证明感受微不足道或不合理。紧张任务可以与自在讨论并存，两个回答互不抵消。"
      },
      {
        "en": "The calm-appearance statement asks whether you remember uncertainty about how outside and inside matched. Remembering that uncertainty can fit the statement; being unable to judge whether it happened can remain cannot judge. Neither response establishes hidden anxiety, deception, emotional suppression or a disorder.",
        "zh": "平静外表陈述询问，是否记得曾不确定外在与内在体验是否一致。记得这种不确定本身，可以符合题述；无法判断是否发生，可保留无法判断。两种选择都不确立隐藏焦虑、欺骗、情绪压抑或某种障碍。"
      }
    ]
  },
  {
    "id": "categories",
    "title": {
      "en": "Keep six labels separate, including three kinds of missing information",
      "zh": "六类分别保留，包括三种未知或保留信息"
    },
    "paragraphs": [
      {
        "en": "Choose does not describe, partly describes or describes the past four weeks; cannot judge, no relevant experience and prefer not to answer remain three separate categories. They do not represent the same experience, and none is converted to a neutral point or a comfortable response. All six statements may be withheld.",
        "zh": "可选择不符合、部分符合或符合过去四周；无法判断、没有相关经历与不愿回答，是三个独立类别。它们不代表同样经历，也不转成中立点数或自在回答。六条均可保留不答。"
      },
      {
        "en": "For example, one choice in each category produces counts 1, 1, 1, 1, 1 and 1, adding to six statements. They are not days, situations, frequency or severity. There is no total, mean, weighting, reversal, cutoff or highest trait. A record made entirely of unknown, inapplicable or withheld responses supplies no personal finding.",
        "zh": "例如，六个类别各选一条，得到1、1、1、1、1、1，合计六条陈述，而非天数、场景次数、频率或严重度。不设总分、均值、加权、反向分、界线或最高特质。全为未知、无经历或不答的记录，不产生个人发现。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "A felt-experience reflection is not an intolerance or boldness scale",
      "zh": "感受回顾，不是不确定性不耐受或大胆性量表"
    },
    "paragraphs": [
      {
        "en": "Published intolerance-of-uncertainty questionnaires ask different questions and use their own scoring methods. This original activity does not administer the IUS-12 or IUS-27, and fewer worry endorsements elsewhere cannot be reversed into ease here. Its four-week reference organizes recollection; it is not a diagnostic duration or a stable-trait estimate.",
        "zh": "已发表的不确定性不耐受问卷，使用不同问题与各自计分方法。本原创活动不施测IUS-12或IUS-27，其他页面较少认同担心，也不能反向换成这里的自在。四周参照用于整理回忆，不是诊断时长或稳定特质估计。"
      },
      {
        "en": "The linked SD4 author page describes a separate 28-item instrument assessing four named personality traits, not these six statements. Its item set, evidence and scoring do not validate this record. This original form has no established reliability, validity, norms or English–Chinese measurement equivalence, and does not measure psychopathy, boldness or clinical impulsivity. [1]",
        "zh": "链接的SD4作者原页介绍另一份28题工具，评估四个具名人格特质，而不是这六句。其题目、证据与计分不验证本记录。本原创题本尚未建立自身信度、效度、常模或中英文测量等值证据，也不测精神病态、大胆性或临床冲动。[1]"
      }
    ]
  },
  {
    "id": "context",
    "title": {
      "en": "Inner ease, behaviour under pressure and interpersonal conduct stay separate",
      "zh": "内在自在、压力下做法与人际行为，分别理解"
    },
    "paragraphs": [
      {
        "en": "Work-practice reflections concern actions such as clarifying information or pausing when possible. Ordinary-decision descriptions concern considering an action. Felt ease does not supply either behaviour, and their records are not combined. The three complete readings below retain their own questions, methods and interpretation.",
        "zh": "工作做法回顾关注澄清信息或有条件暂停等行动；普通决定描述关注是否考虑行动。内在自在不能代替这两种行为，也不合并记录。下方三篇完整读法各自保留问题、方法与解释。"
      },
      {
        "en": "Feeling calm does not establish carelessness towards another person, and tension does not prove empathy. Callousness and manipulation readings concern particular self-reported behaviours. Combining them with this page does not identify moral character, dangerousness, trustworthiness or a calculating–reactive type.",
        "zh": "平静不确立对别人漠不关心，紧张也不证明共情。冷漠与操控读法关注特定自报行为。与本页拼合，也不能识别道德品格、危险性、可信程度或算计—反应类型。"
      }
    ]
  },
  {
    "id": "privacy-support",
    "title": {
      "en": "Read without a confidence challenge, disclosure or saved answers",
      "zh": "无需挑战自信、披露或保存回答，即可阅读"
    },
    "paragraphs": [
      {
        "en": "Answers remain in current-page memory only. There are no saved drafts, answer submissions, questionnaire analytics or a personal result URL. Exit, retake, reload and leaving clear the record. Copy public entry includes only the fixed public title and link, without personal categories. The complete guide and support remain available without answering.",
        "zh": "回答只留当前页面内存，不存草稿、不提交答卷、不发问卷分析，也无个人结果网址。退出、重做、刷新与离页会清除记录。“复制公开入口”只含固定公开标题与链接，不含个人类别。不作答也可阅读完整指南与支持说明。"
      },
      {
        "en": "Existing broad recollections are enough. No public-speaking task, fear challenge, deliberate uncertainty, withheld reassurance, risky experiment, diary or contact with another person is required. A concerning experience may be discussed with a qualified professional without a label or count; this voluntary reflection neither sets a treatment plan nor changes existing care.",
        "zh": "已有宽泛回忆即可，无需公开发言任务、恐惧挑战、刻意制造未知、拒绝安心回应、风险试验、日记或联系别人。对体验有顾虑时，无需标签或计数，便可与合格专业人士讨论；本自愿回顾不制定治疗计划或改变已有照护。"
      }
    ]
  }
];

export const uncertaintyEaseFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Who is this six-statement reflection for?",
      "zh": "这份六句回顾适合谁？"
    },
    "answer": {
      "en": "Adults can recall their own ordinary low-stakes experiences over the past four weeks. It takes about three minutes at your own pace, free without registration. It is not a task for judging another person.",
      "zh": "成年人可回顾本人过去四周后果轻微的普通经历，约需三分钟，可按自己的节奏进行，免费且无需注册，不用于评判别人。"
    }
  },
  {
    "question": {
      "en": "Can calm and tense statements both fit?",
      "zh": "平静与紧张的陈述能同时符合吗？"
    },
    "answer": {
      "en": "Yes. Different situations and different aspects of experience may fit. Each sentence retains its category; no reverse key subtracts tension from ease or classifies you on a fearless–fearful axis.",
      "zh": "可以。不同场景、不同体验方面可以符合。每句保留类别，不用反向键从自在中扣除紧张，也不分配无畏—害怕位置。"
    }
  },
  {
    "question": {
      "en": "Does cannot judge mean partly describes?",
      "zh": "无法判断就是部分符合吗？"
    },
    "answer": {
      "en": "No. Partly describes is a substantive choice about a recollection. Cannot judge preserves uncertainty, no experience preserves lack of a relevant occasion and withholding preserves privacy. All remain separate.",
      "zh": "不是。部分符合，是对已有回忆的实质选择；无法判断保留未知，无经历保留没有相关场合，不答保留隐私，三者分别显示。"
    }
  },
  {
    "question": {
      "en": "Can I withhold all six responses?",
      "zh": "六条都能保留不答吗？"
    },
    "answer": {
      "en": "Yes. All-withheld is a valid record with six withheld labels, not a trait result or reassurance about behaviour. The complete public guide is available before and after answering.",
      "zh": "可以。全部不答可形成六条保留回答的有效记录，不是特质结论，也不为行为作保证。完整公开指南在作答前后均可阅读。"
    }
  },
  {
    "question": {
      "en": "Can a repeated attempt demonstrate improvement?",
      "zh": "再次完成能证明改善吗？"
    },
    "answer": {
      "en": "No change threshold or test–retest evidence is established. Recall and circumstances may differ. A different category pattern cannot establish increased confidence, treatment response or greater readiness for a consequential task.",
      "zh": "尚未建立变化阈值或重测证据，回忆与情境也可能不同。类别模式变化，不能证明更自信、治疗有效或更适合执行有重要后果的任务。"
    }
  },
  {
    "question": {
      "en": "Is leaving an outcome unresolved a recommendation?",
      "zh": "允许结果未定，是行动建议吗？"
    },
    "answer": {
      "en": "No. The statement describes a remembered feeling. It does not decide whether waiting, acting, asking for information or meeting a deadline is appropriate. Those decisions depend on the actual situation.",
      "zh": "不是。陈述描述记得的感受，不替人决定等待、行动、询问信息或处理期限是否合适；这些决定取决于实际情境。"
    }
  },
  {
    "question": {
      "en": "Is this the IUS-12 or an anxiety screen?",
      "zh": "这是IUS-12或焦虑筛查吗？"
    },
    "answer": {
      "en": "No. These six original statements use separate description categories without a score. They neither reproduce an intolerance-of-uncertainty scale nor confirm or exclude anxiety or another condition.",
      "zh": "不是。六条原创陈述使用独立描述类别，不生成分数，不复制不确定性不耐受量表，也不确认或排除焦虑及其他状况。"
    }
  },
  {
    "question": {
      "en": "Does looking calm prove that I feel calm?",
      "zh": "看起来平静，就证明内心平静吗？"
    },
    "answer": {
      "en": "No. One sentence specifically preserves uncertainty about whether appearance matches inner experience. It cannot establish someone’s internal state from an outward impression or identify deception.",
      "zh": "不证明。有一句专门保留外在与内心是否一致的未知，不能从外表印象确定内在状态或识别欺骗。"
    }
  }
];

export const uncertaintyEaseReadingSummaries: Record<string, Text> = {
  "ease-with-uncertainty-reading": {
    "en": "Read ease, tension, uncertain inner experience and unresolved outcomes without reversing categories or inferring boldness, safety or a personal type.",
    "zh": "分别阅读自在、紧张、内心未知与结果未定，不反向类别，也不推断大胆性、安全或人身类型。"
  }
};
