import type { Text } from "@/lib/questionnaires/types";

export const unfamiliarSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Unfamiliar experiences: describe what you recall without choosing an explanation",
      "zh": "陌生体验：描述回忆，不必先选定解释"
    },
    "paragraphs": [
      {
        "en": "Twenty original descriptions invite adults to recall their own past four weeks across five topics: sensory impressions, following thoughts, wariness and meaning, contact and participation, and everyday routines. Each topic contains four descriptions. The topics organise reading and can overlap; they are not five validated independent psychological dimensions.",
        "zh": "20条原创描述，供成年人回顾本人过去四周的五个主题：感官印象、跟随思路、戒备与含义、联系与参与，以及日常事务。每个主题四条。分组帮助组织阅读，主题可以重叠，并非五个经过验证的独立心理维度。"
      },
      {
        "en": "The page keeps what you selected without asking for a private account, names, recordings or evidence. It does not ask an observer to answer for you. You may recognise an experience while remaining unsure about its explanation, or leave a description unscored if you cannot recall whether it occurred.",
        "zh": "页面保留所选类别，不要求私人叙述、姓名、录音录像或证据，也不让旁观者代答。可以认出某种体验，同时不确定解释；若无法回想体验是否发生，也可将该条保留为未计分。"
      }
    ]
  },
  {
    "id": "impressions",
    "title": {
      "en": "An impression, its intensity and its source are separate questions",
      "zh": "印象、强烈程度与来源，是不同问题"
    },
    "paragraphs": [
      {
        "en": "The sensory descriptions concern a brief sound or sight that was hard to place, an unexpectedly intense ordinary sensation, uncertainty about whether an impression came from surroundings or thought, and an impression staying on your mind. These ask about remembered experience, not whether an event occurred outside you.",
        "zh": "感官描述涉及难以定位的短暂声音或景象、出乎意料地强烈的普通感觉、不确定印象来自周围还是想法，以及印象留在心上。它们询问记得的体验，不判断外部是否发生某个事件。"
      },
      {
        "en": "Remembering uncertainty about an impression can fit a description. Not knowing whether you had that experience can remain unscored. Neither choice identifies a hallucination or proves an interpretation right or wrong. No replay, sensory test, recording, sign-seeking or request for someone else to verify it is required.",
        "zh": "记得对印象曾感到不确定，可以符合描述；不知道是否有过该体验，可保留未计分。两种选择都不识别幻觉，也不证明某种解释对错。无需重现、感官测试、录制、寻找迹象，或请别人核实。"
      }
    ]
  },
  {
    "id": "thoughts",
    "title": {
      "en": "Following a thought is different from a clinical assessment of thinking",
      "zh": "跟随思路，与临床思维评估有所不同"
    },
    "paragraphs": [
      {
        "en": "Four descriptions distinguish losing a conversational point, arranging thoughts into words, changing topics faster than intended and returning to a point after an available pause. Losing the thread and later returning can both be remembered; one does not cancel the other or prove a permanent communication difficulty.",
        "zh": "四条分别描述谈话要点跟丢、把想法组织成语言、话题切换快于原本打算，以及利用已有停顿回到要点。跟丢思路与后来返回，可以同时被记得；两者互不抵消，也不证明永久沟通困难。"
      },
      {
        "en": "The form does not observe speech, test reasoning or determine intelligence, a thought disorder or the reason for a difficult moment. A useful pause is not a reverse-scored protective item. Reading requires no recorded conversation, performance test, forced explanation or attempt to demonstrate control over thought.",
        "zh": "表单不观察言语、不测试推理，也不确定智力、思维障碍或某个困难片刻的原因。有用的停顿不是反向计分的保护项。阅读无需录下谈话、测试表现、强迫解释，或证明能够控制想法。"
      }
    ]
  },
  {
    "id": "meaning",
    "title": {
      "en": "A feeling of personal significance does not establish another person’s intention",
      "zh": "觉得与自己有关，不确立别人的意图"
    },
    "paragraphs": [
      {
        "en": "This topic concerns feeling wary, a remark seeming personally significant while meaning remained uncertain, difficulty setting that uncertainty aside and holding back in conversation. It records how the exchange felt to you. It cannot identify another person’s motives, establish a message or decide whether an external threat exists.",
        "zh": "本主题涉及戒备、话语在含义仍未知时显得与自己有关、难以暂时放下这种未知，以及谈话中有所保留。记录的是交流带给本人的感受，不能识别对方动机、确立信息传递，或决定是否存在外部威胁。"
      },
      {
        "en": "The wording neither confirms nor dismisses a concern about an interaction. Category counts are not evidence about anyone’s trustworthiness or behaviour. You do not need to investigate, confront someone, inspect messages, seek repeated reassurance or change a boundary to complete this voluntary record.",
        "zh": "措辞既不确认，也不否定对一次互动的担忧。类别计数不是关于任何人可信程度或行为的证据。完成自愿记录，无需调查、对质、检查消息、反复索求保证或改变边界。"
      }
    ]
  },
  {
    "id": "participation-routines",
    "title": {
      "en": "Wanted participation, available support and ordinary demands differ",
      "zh": "希望参与、可用支持与日常需求，分别保留"
    },
    "paragraphs": [
      {
        "en": "The participation topic distinguishes wanting contact from beginning a conversation, joining fewer activities than intended, difficulty starting a reply and asking for company when wanted. A preference for solitude is not automatically unwanted difficulty joining in. Asking for company does not erase another description or establish protection from illness.",
        "zh": "参与主题区分想联系与开始谈话、活动参与少于打算、回复难开始，以及希望陪伴时提出请求。偏好独处，不自动等于不愿出现的参与困难。请求陪伴不会抹去另一条描述，也不证明能够预防疾病。"
      },
      {
        "en": "The routines topic concerns effort, missed steps, sleeping or waking changes affecting a plan, and wanting practical help. It does not observe decline from a previous baseline or establish why a task was harder. No contact challenge, task demonstration, sleep change or treatment change is assigned; actual support needs can be discussed without a count.",
        "zh": "事务主题关注费力、步骤遗漏、睡眠起床变化影响计划，以及希望获得实际帮助，不观察相对既往基线的下降，也不确定事务变难的原因。不安排联系挑战、任务展示、睡眠调整或治疗改变；实际支持需要，无需计数就可以讨论。"
      }
    ]
  },
  {
    "id": "categories",
    "title": {
      "en": "Six category counts describe four choices, not an illness probability",
      "zh": "六类计数描述四个选择，不代表疾病概率"
    },
    "paragraphs": [
      {
        "en": "The first five labels range from not noticing on relevant occasions to noticing very often. They retain your chosen frequency description without measuring episode numbers, minutes, severity or impact. Unscored combines no relevant occasion, unclear recall and withholding; the record cannot distinguish these reasons or convert them to did not notice.",
        "zh": "前五个标签从有相关机会时没有注意到，到经常注意到，保留本人所选的频率描述，不测发作次数、分钟数、严重度或影响。未计分合并无相关机会、回忆不清与保留回答；记录不能区分原因，也不把它们转成没有注意到。"
      },
      {
        "en": "One sometimes, one often and two unscored yield counts 0, 0, 1, 1, 0 and 2 over four descriptions. There are no points, total, mean, reversals, highest theme, cutoff or prediction. All twenty may remain unscored. Few or unscored choices cannot rule out a concern; frequent choices cannot establish psychosis or its cause.",
        "zh": "一条有时、一条较常、两条未计分，得到0、0、1、1、0、2，合计四条描述。不设点数、总分、均值、反向分、最高主题、界值或预测。20条均可未计分。少量或未计分不能排除担忧，频繁选择也不能确定精神病性状态或原因。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Original descriptions remain separate from psychosis screening and assessment",
      "zh": "原创描述，与精神病性状态筛查及评估分开"
    },
    "paragraphs": [
      {
        "en": "This page is not PQ-B, PQ-16, PRIME Screen or a clinical psychosis-risk instrument. No norms, diagnostic algorithm, prediction model or English–Chinese measurement equivalence have been established for these original descriptions. A shared topic or reference to research cannot transfer another instrument’s validation or thresholds.",
        "zh": "本页不是PQ-B、PQ-16、PRIME Screen或临床精神病风险工具。对这些原创描述，尚未建立常模、诊断算法、预测模型或中英文测量等值。主题相近或提及研究，不会转移其他工具的验证结论或界值。"
      },
      {
        "en": "NIMH describes professional assessment and multiple possible clinical explanations in broader background material.[1] That source supplies neither these original items nor their validation. The four-week recollection window is an editorial frame, not diagnostic duration. Other attention, sensory, mood and relationship forms keep their own methods; combining their numbers cannot produce a clinical finding here.",
        "zh": "NIMH在更广背景资料中介绍专业评估及多种可能的临床解释。[1]该来源不提供本原创条目或验证。四周回忆是编辑参照，不是诊断时限。其他注意、感官、心情与关系题本保留自身方法，把数字拼合也不能在这里产生临床发现。"
      }
    ]
  },
  {
    "id": "privacy-support",
    "title": {
      "en": "Public readings and support do not depend on an answer pattern",
      "zh": "公开读法与支持，不取决于回答模式"
    },
    "paragraphs": [
      {
        "en": "Five complete guides and the same support information remain public before answering, during a partial attempt and after any record. Answers stay only in current-page memory, without drafts, submission, questionnaire analytics or a personal result URL. Exit, retake, reload and leaving clear them. Copy public entry shares only the fixed public title and link.",
        "zh": "五篇完整指南与相同支持说明，在作答前、部分完成及任何记录后均公开。回答只留当前页内存，不存草稿、不提交、不发问卷分析，也无个人结果网址。退出、重做、刷新与离页清除；复制公开入口仅分享固定公开标题与链接。"
      },
      {
        "en": "If an experience is new, concerning, continuing or affecting daily life, you can discuss it with a qualified healthcare professional without completion, a count or proof of an explanation. The page cannot determine causes, medical need, urgency or safety. Existing care remains independent; no record warrants delaying assessment, investigating an interpretation or changing treatment.",
        "zh": "体验若新出现、令人担忧、持续或影响日常，无需完成、计数或证明解释，就可与合格医疗专业人士讨论。页面不能确定原因、医疗需要、紧急程度或安全。已有照护独立保留，任何记录都不是推迟评估、调查解释或改变治疗的依据。"
      }
    ]
  }
];

export const unfamiliarFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Who can use these twenty descriptions?",
      "zh": "这20条描述适合谁使用？"
    },
    "answer": {
      "en": "Adults may voluntarily recall their own past four weeks. It takes about five minutes at your own pace, free without registration. The form does not ask another person to report your inner experience.",
      "zh": "成年人可自愿回顾本人过去四周，约五分钟，可按自己的节奏进行，免费且无需注册。表单不让别人报告本人的内在体验。"
    }
  },
  {
    "question": {
      "en": "Does an uncertain impression mean that an external event occurred?",
      "zh": "印象不确定，就说明发生了外部事件吗？"
    },
    "answer": {
      "en": "No. The record concerns your recollection. It cannot verify or disprove the source of a sound, sight or impression, or decide what happened outside you.",
      "zh": "不说明。记录关注本人回忆，不能核实或否定声音、景象或印象的来源，也不能决定外部发生了什么。"
    }
  },
  {
    "question": {
      "en": "Can I remember uncertainty but still answer a description?",
      "zh": "记得当时不确定，仍可以回答吗？"
    },
    "answer": {
      "en": "Yes. Remembering uncertainty is different from not knowing whether the experience occurred. The latter can remain unscored, without searching for evidence or recreating an impression.",
      "zh": "可以。记得当时未知，与不知道是否有过该体验，有所不同。后者可保留未计分，无需寻找证据或重现印象。"
    }
  },
  {
    "question": {
      "en": "Does returning to a thought cancel losing the thread?",
      "zh": "回到要点，会抵消跟丢思路吗？"
    },
    "answer": {
      "en": "No. Both can describe different moments. Helpful and difficult descriptions remain separate; there is no reverse score, protective total or performance grade.",
      "zh": "不会。两者可以描述不同片刻。帮助性与困难描述分别保留，不设反向分、保护总分或表现等级。"
    }
  },
  {
    "question": {
      "en": "Does feeling wary establish someone’s intentions?",
      "zh": "感到戒备，就确立对方意图吗？"
    },
    "answer": {
      "en": "No. A feeling and an uncertain interpretation are not evidence of another person’s motives or trustworthiness. The page neither confirms nor dismisses an external concern.",
      "zh": "不确立。感受与未知的解释，不是对方动机或可信程度的证据。页面既不确认，也不否定外部担忧。"
    }
  },
  {
    "question": {
      "en": "Are unscored choices treated as never noticing?",
      "zh": "未计分会被当成从未注意到吗？"
    },
    "answer": {
      "en": "No. No occasion, unclear recall and withholding share the unscored category, separately from non-endorsement on relevant occasions. All-unscored is valid and gives no personal finding.",
      "zh": "不会。无机会、回忆不清与保留回答共用未计分类别，与有相关机会时没有注意到分开。全部未计分是有效记录，不产生个人发现。"
    }
  },
  {
    "question": {
      "en": "Can repeated attempts show a future illness or recovery?",
      "zh": "反复完成能看出未来疾病或恢复吗？"
    },
    "answer": {
      "en": "No prediction model, reliable-change threshold or test–retest evidence has been established. Circumstances, opportunities and recall may differ. Changed categories cannot establish a disease trajectory or treatment response.",
      "zh": "尚未建立预测模型、可靠变化阈值或重测证据，处境、机会与回忆也可能不同。类别变化不能确立疾病进程或治疗反应。"
    }
  },
  {
    "question": {
      "en": "Must I record conversations or check an explanation?",
      "zh": "必须录下谈话或核查解释吗？"
    },
    "answer": {
      "en": "No. Existing recollections are enough. The page requires no recording, reality check, search for signs, confrontation, social task or change in care. You may stop or read without answering.",
      "zh": "不用。已有回忆即可。页面不要求录制、检查现实、寻找迹象、对质、社交任务或改变照护，可以停止，也可不作答而阅读。"
    }
  }
];

export const unfamiliarReadingSummaries: Record<string, Text> = {
  "sensory-impressions-reading": {
    "en": "Separate a remembered impression, its intensity and uncertainty about its source without deciding what occurred outside you.",
    "zh": "区分记得的印象、强烈程度与来源未知，不判断外部发生什么。"
  },
  "following-thoughts-reading": {
    "en": "Read losing a thread and returning after a pause together without grading speech, reasoning or control.",
    "zh": "并读跟丢思路与停顿后返回，不为言语、推理或控制能力评分。"
  },
  "wariness-and-meaning-reading": {
    "en": "Keep perceived significance and uncertainty separate from claims about another person’s intentions or trustworthiness.",
    "zh": "将感到的特别含义与未知，和对他人意图或可信程度的主张分开。"
  },
  "contact-and-participation-reading": {
    "en": "Distinguish wanted contact, actual participation and requested company without assigning a social norm or protective score.",
    "zh": "区分想联系、实际参与与请求陪伴，不分配社交标准或保护分数。"
  },
  "everyday-routines-reading": {
    "en": "Describe effort, missed steps, changed routines and wanted help without inferring decline, cause or a clinical course.",
    "zh": "描述费力、步骤遗漏、安排变化与希望的帮助，不推断功能下降、原因或临床进程。"
  }
};
