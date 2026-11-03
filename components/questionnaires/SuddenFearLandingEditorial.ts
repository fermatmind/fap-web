import type { Questionnaire } from "@/lib/questionnaires/types";
export const suddenFearSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "Sudden fear: experiences, anticipation and everyday plans",
      "zh": "突然强烈恐惧：经历、预期与日常安排"
    },
    "paragraphs": [
      {
        "en": "This adult reflection uses 20 original observations to organise recollections from the past four weeks. Four topics cover sudden waves of fear, sensations and thoughts during fear, worry about another wave, and changes to plans or participation. Each topic contains five descriptions; the topics are reading headings rather than established clinical dimensions.",
        "zh": "这份成年人回顾用20条原创观察整理过去四周的回忆。四个主题分别涉及突然出现的强烈恐惧、恐惧时的感觉与想法、担心再次出现，以及计划或参与的变化。每个主题包含五条描述；它们是阅读主题，尚非经过验证的临床维度。"
      },
      {
        "en": "The record keeps each selected label and six category counts for each topic. All four complete guides are available before answering. You can use the language to describe an experience you choose to discuss, without deciding what caused a physical sensation or turning a recollection into a medical conclusion.",
        "zh": "记录保留逐条所选标签，并分别展示各主题的六类计数。四篇完整指南在作答前就可阅读。可以借这些语言描述自己愿意谈论的经历，无需判断身体感觉的原因，也不用把回忆转成医学结论。"
      }
    ]
  },
  {
    "id": "themes",
    "title": {
      "en": "Four topics that can coexist without forming a sequence",
      "zh": "四个主题可以并存，不构成必经顺序"
    },
    "paragraphs": [
      {
        "en": "Sudden waves concerns an abrupt rise of fear or discomfort during an ordinary moment or activity. Sensations and thoughts concerns what drew attention during fear, including a frightening heart or breathing sensation, feeling unsteady, or thoughts about losing control or immediate harm. Selecting a description does not confirm a panic attack or explain a symptom.",
        "zh": "突然出现的强烈恐惧涉及普通时刻或活动中，恐惧或不适突然上升。恐惧时的感觉与想法涉及当时吸引注意的体验，包括令人害怕的心跳或呼吸感觉、站立不稳感，以及失去控制或立即受害的想法。选择某条描述不确认惊恐发作，也不解释症状。"
      },
      {
        "en": "Worry about returning concerns anticipation, remembering earlier fear or considering what might happen during a future activity. Changes to plans concerns hesitation, leaving early, wanting company or not participating. These descriptions need not occur together or in that order. Wanting company alone does not establish avoidance, dependence or agoraphobia.",
        "zh": "担心再次出现涉及预期、想起过去的恐惧，或考虑未来活动中可能发生什么。计划与参与的变化涉及犹豫、提前离开、希望有人陪同或没有参加。这些描述不必同时出现，也没有固定先后；希望有人陪同本身不确立回避、依赖或广场恐惧症。"
      }
    ]
  },
  {
    "id": "categories",
    "title": {
      "en": "Reading six categories: a five-description example",
      "zh": "六类记录怎样阅读：以五条描述为例"
    },
    "paragraphs": [
      {
        "en": "The six labels are did not notice, rarely, sometimes, often, very often and unscored. Suppose a topic’s five descriptions receive did not notice, sometimes, sometimes, often and unscored. In that category order, its counts are 1, 0, 2, 1, 0 and 1, adding to five.",
        "zh": "六个标签为没有注意到、很少、有时、较常、经常和未计分。假设某主题五条依次选择没有注意到、有时、有时、较常、未计分，那么按六类顺序计数为1、0、2、1、0、1，合计五条。"
      },
      {
        "en": "Two under sometimes means two descriptions received that label. It does not mean two attacks, two days or two minutes of fear. Category IDs are not points. The page calculates no total, mean, leading topic, severity level, diagnostic probability or population percentile; category counts cannot establish those quantities.",
        "zh": "“有时”下的二表示两条描述选了这个标签，不表示发作两次、恐惧持续两天或两分钟。类别标识不是点数。页面不计算总分、均值、主导主题、严重程度、诊断概率或人群百分位；类别计数也不能推导这些量。"
      }
    ]
  },
  {
    "id": "missing",
    "title": {
      "en": "Unscored preserves what the record cannot say",
      "zh": "未计分保留记录无法回答的部分"
    },
    "paragraphs": [
      {
        "en": "Did not notice is a specific recollection. Unscored keeps no relevant experience, unclear recall and a withheld answer separate from that recollection. A topic with all five observations unscored provides no personal finding. Its complete guide remains available without supplying a substitute label.",
        "zh": "没有注意到是一种具体回忆。未计分把没有相关经历、回想不清和保留回答的情况与这种回忆区分开。某主题五条都未计分时，不提供个人发现；完整指南仍可阅读，不填入替代标签。"
      },
      {
        "en": "All 20 observations may be unscored and the form can still finish. An entirely unscored record does not show absence of difficulty; a set of did-not-notice answers does not certify physical or mental health. Neither record determines whether an assessment or support would be useful.",
        "zh": "20条全部未计分也能完成。全未计分不表示没有困难；一组没有注意到也不认证身心健康。两种记录都不决定是否需要评估或支持。"
      }
    ]
  },
  {
    "id": "time-context",
    "title": {
      "en": "A four-week reference is not a clinical duration rule",
      "zh": "四周参照不是临床持续时间规则"
    },
    "paragraphs": [
      {
        "en": "Use the same past-four-week reference for each observation, from recollection only. Anticipation during that period may concern a frightening experience from earlier in life. Someone can therefore record worry about another wave without noticing a new sudden wave in these four weeks; this is not an inconsistent answer to be corrected.",
        "zh": "各条均以过去四周为参照，只凭回忆回答。这段时间的预期可以与更早的恐惧经历有关。因此，一个人可以记录担心再次出现，同时没有注意到这四周内出现新的突然恐惧；无需把这种回答当作矛盾纠正。"
      },
      {
        "en": "This window organises recall; it is not a diagnostic criterion, a required symptom duration or a waiting period for care. Repeating the form can change selected labels because circumstances or recall changed. The edition has no established measurement-error or change threshold, so a different record does not demonstrate recovery, deterioration or treatment response.",
        "zh": "这个窗口用于整理回忆，不是诊断标准、症状必须持续的时间或就医等待期。再次作答时，情境或回忆变化都可能改变标签。本版尚无测量误差或变化阈值证据，因此记录不同不证明康复、恶化或治疗反应。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Panic-related information and this original reflection",
      "zh": "惊恐相关资料与本站原创回顾"
    },
    "paragraphs": [
      {
        "en": "NIMH distinguishes a panic attack from panic disorder and explains that an assessment considers recurrence, ongoing concerns, behavioural changes and effects on life. A healthcare professional may also assess physical causes. NHS guidance likewise notes that similar symptoms can occur in other conditions. These explain why a symptom label alone cannot settle an assessment. [1][2]",
        "zh": "NIMH区分惊恐发作与惊恐障碍，说明评估会考虑反复出现、持续担忧、行为变化和生活影响；医疗专业人士也可能评估身体原因。NHS同样提醒，相似症状可以见于其他状况。这些说明为何单个症状标签不足以完成评估。[1][2]"
      },
      {
        "en": "This original bank is not the Panic Disorder Severity Scale (PDSS), its self-report version or a diagnostic checklist. Its actual questions, categorical method and language versions have not established psychometric validation, clinical cutoffs, norms or English–Chinese measurement equivalence. Public references explain the subject; their evidence does not transfer to this edition.",
        "zh": "本站原创题本不是惊恐障碍严重程度量表（PDSS）、其自评版或诊断清单。本版实际题目、类别记录方法及语言版本尚未建立心理测量验证、临床界值、常模或中英文测量等值。公开参考资料解释主题，其研究证据不能直接移用于本版。"
      }
    ]
  },
  {
    "id": "conversation",
    "title": {
      "en": "A concrete account for a conversation, without testing yourself",
      "zh": "用具体经历交流，无需测试自己的反应"
    },
    "paragraphs": [
      {
        "en": "If you choose to discuss the record, describe an occasion in your own words: what was happening, what you remember feeling or thinking, what changed in your plans and what you would like help understanding. You may distinguish what you recall clearly from what is uncertain, and leave out details you do not wish to share.",
        "zh": "如果愿意交流，可以用自己的话描述一次经历：当时在做什么、记得哪些感觉或想法、计划发生了什么变化，以及希望对方帮助理解什么。可以区分记得清楚和不确定的部分，也可以不分享某些细节。"
      },
      {
        "en": "There is no requirement to reproduce fear, check your body, control breathing, revisit a feared setting or keep a repeated symptom log to answer this form. The record is not an exposure exercise, a treatment plan or proof that an activity is safe. You can discuss a concern without finishing the observations or reaching a particular count.",
        "zh": "作答无需再现恐惧、检查身体、控制呼吸、重返害怕的场景或反复记录症状。这份记录不是暴露练习、治疗计划或活动安全证明。无需完成观察或达到某种计数，就可以谈论担忧。"
      }
    ]
  },
  {
    "id": "care-privacy",
    "title": {
      "en": "Care decisions and a record that stays on this page",
      "zh": "照护决定与仅留在本页的记录"
    },
    "paragraphs": [
      {
        "en": "Fear and a physical health concern can both deserve attention. This reflection cannot determine that a sensation is harmless, only anxiety or a false alarm, exclude a medical cause, or decide the urgency of care. Do not use a category, missing answer or public guide to postpone assessment, change medicine, cancel care or alter professional monitoring.",
        "zh": "恐惧与身体健康问题都可以值得关注。本回顾不能断定感觉无害、只是焦虑或虚假警报，不能排除身体原因，也不判断照护紧急程度。不要用某个类别、缺答或公开指南推迟评估、改药、取消照护或调整专业监测。"
      },
      {
        "en": "Answers remain in current-page memory, without drafts, submission or questionnaire analytics. Exit, retake, reload or leaving clears the record; completing the form clears individual answers and retains the category record only until you leave or clear it. Copy public entry copies only the public title and address. Public guides contain no visitor answers.",
        "zh": "回答只留在当前页面内存，不存草稿、不提交，也没有问卷分析。退出、重做、刷新或离页会清除记录；完成后清除逐题回答，类别记录仅保留到离页或主动清除。复制公开入口只复制公开标题和地址，公开指南不含访客回答。"
      }
    ]
  }
];
export const suddenFearFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does a count of two mean two panic attacks?",
      "zh": "计数为二表示惊恐发作两次吗？"
    },
    "answer": {
      "en": "No. It means two descriptions received one response label. This form records neither the number nor duration of attacks and does not identify an attack.",
      "zh": "不是。它表示两条描述选了同一个回答标签。本题组既不统计发作次数或持续时间，也不识别发作。"
    }
  },
  {
    "question": {
      "en": "Can worry about another wave appear without a recent sudden wave?",
      "zh": "近期没有突然恐惧，也可能记录担心再次出现吗？"
    },
    "answer": {
      "en": "Yes. Worry in the past four weeks may concern an earlier experience. Keep each selected label rather than changing an answer to make the topics match.",
      "zh": "可以。过去四周的担心可能与更早经历有关。保留各条所选标签，无需为了让主题一致而修改回答。"
    }
  },
  {
    "question": {
      "en": "Do the four topics describe stages of panic disorder?",
      "zh": "四个主题描述惊恐障碍的阶段吗？"
    },
    "answer": {
      "en": "No. They organise five descriptions each for reading. They are not stages, diagnostic dimensions or a demonstrated causal sequence.",
      "zh": "不是。各主题整理五条描述，供阅读使用；它们不是阶段、诊断维度或已被证明的因果顺序。"
    }
  },
  {
    "question": {
      "en": "Does wanting company mean agoraphobia?",
      "zh": "希望有人陪同表示广场恐惧症吗？"
    },
    "answer": {
      "en": "No. A selected description cannot establish a disorder or explain why you wanted company. Assessment needs the person’s broader circumstances and professional judgment.",
      "zh": "不是。某条描述不能确立障碍，也不能解释希望有人陪同的原因。评估需要更广的个人情境和专业判断。"
    }
  },
  {
    "question": {
      "en": "What if all five descriptions in a topic are unscored?",
      "zh": "某主题五条全部未计分会怎样？"
    },
    "answer": {
      "en": "That topic provides no personal finding. All four complete guides remain public. An unscored label is not replaced with did not notice.",
      "zh": "该主题不提供个人发现。四篇完整指南仍然公开；未计分不会被没有注意到替代。"
    }
  },
  {
    "question": {
      "en": "Should I wait four weeks or for another episode before seeking help?",
      "zh": "是否应等满四周或再次出现后才求助？"
    },
    "answer": {
      "en": "No. Four weeks is a recall window, not a waiting period or care threshold. Neither completion nor a particular category count is required to discuss a concern.",
      "zh": "不需要。四周是回忆窗口，不是等待期或照护阈值。谈论担忧无需完成题组，也无需达到某种类别计数。"
    }
  },
  {
    "question": {
      "en": "Can these records be converted to PDSS or a severity band?",
      "zh": "这些记录可以换算成PDSS或严重程度档次吗？"
    },
    "answer": {
      "en": "No. The original descriptions and categorical method are different. There is no supported conversion, cutoff or comparison with a clinical scale.",
      "zh": "不能。原创描述和类别记录方法不同；本版没有得到证据支持的换算、界值或临床量表比较。"
    }
  },
  {
    "question": {
      "en": "Do I need an agreement checkbox before the first observation?",
      "zh": "第一条观察前需要勾选同意吗？"
    },
    "answer": {
      "en": "No. The start button opens the first observation directly. You may leave, keep any description unscored or read the full public guides without answering.",
      "zh": "不需要。点击开始直接打开第一条观察；可以离开、将任何描述保留为未计分，或不答题阅读完整公开指南。"
    }
  }
];
