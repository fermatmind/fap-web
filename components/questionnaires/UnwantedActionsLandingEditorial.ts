import type { Questionnaire } from "@/lib/questionnaires/types";
export const unwantedActionsSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "Unwanted thoughts and repeated actions: five ways to describe an experience",
      "zh": "不想要的想法与重复动作：从五个主题描述经历"
    },
    "paragraphs": [
      {
        "en": "This adult reflection uses 20 original observations about the past four weeks. Five topics organise recollections of cleaning-related concern, checking again, order and repetition, unwanted thoughts with mental responses, and keeping or discarding belongings. Each topic has four descriptions; an experience may fit more than one topic.",
        "zh": "这份成年人回顾以20条原创观察整理过去四周的经历。五个主题分别涉及清洁担忧、再次查看、秩序与重复、不想要的想法与心中回应，以及保留或舍弃物品。各主题四条描述；同一经历可以涉及多个主题。"
      },
      {
        "en": "The result retains your selected label for every observation and six category counts for each topic. All five complete guides are public before answering. The aim is to make a chosen experience easier to describe, without judging your intentions, assigning a disorder or deciding what to do with a belonging.",
        "zh": "记录保留每条观察所选标签，并分别展示各主题的六类计数。五篇完整指南在答题前即公开。目的在于帮助描述自己愿意回顾的经历，不判断意图、不分配障碍，也不决定如何处理财物。"
      }
    ]
  },
  {
    "id": "themes",
    "title": {
      "en": "Cleaning, checking and a feeling that something is not quite right",
      "zh": "清洁、查看与感觉不太对"
    },
    "paragraphs": [
      {
        "en": "Cleaning-related concern includes a worry returning after intended cleaning, wanting to repeat an action and an interruption to another activity. Checking again includes returning to a detail, uncertainty after a check, delay before moving on and asking for confirmation again. The observations do not know the safety procedure, work task or care instruction behind an action.",
        "zh": "清洁担忧涉及完成原定清洁后仍担心、想重复动作，以及其他活动被打断。再次查看涉及回看细节、查看后又不确定、迟迟没有继续，或再次寻求确认。观察并不知道动作背后的安全程序、工作任务或照护指示。"
      },
      {
        "en": "Order and repetition includes attention returning to a mismatch, adjusting an arrangement and repeating an ordinary action because it did not feel settled. Similar words can describe different practical circumstances. A frequency label cannot establish that a routine is unnecessary, a precaution excessive or a preference for order a symptom.",
        "zh": "秩序与重复涉及注意不断回到不一致之处、调整排列，以及因感觉未能放下而重复普通动作。相似词语可以描述不同实际情境。频率标签不能证明惯例多余、预防过度或喜欢秩序就是症状。"
      }
    ]
  },
  {
    "id": "thoughts-belongings",
    "title": {
      "en": "Mental responses and decisions about belongings are distinct topics",
      "zh": "心中回应与财物决定是不同主题"
    },
    "paragraphs": [
      {
        "en": "The thoughts topic concerns an unwanted thought or image returning, distress about its meaning, repeating words or another thought mentally, and wanting certainty about what the thought means. A response may occur silently and be hard for someone else to see. The form asks for no thought content and cannot infer it from a selected category.",
        "zh": "想法主题涉及不想要的想法或画面反复出现、因其含义难受、在心里重复词句或另一想法，以及想确定它的意义。回应可以在心中发生，旁人未必看得到。题组不收集想法内容，也不能从所选类别推断内容。"
      },
      {
        "en": "The belongings topic concerns a difficult keep-or-let-go decision, postponement, uncertain future use and storage affecting the intended use of space. It does not count objects or inspect a home. NHS describes hoarding disorder separately from OCD; including this reading topic does not make it a fifth OCD subtype or establish either diagnosis. [3]",
        "zh": "财物主题涉及难以决定保留还是放下、推迟决定、不确定将来用途，以及存放方式影响空间原定用途。它不数物品，也不检查住房。NHS将囤积障碍作为有别于强迫症的状况介绍；纳入这一阅读主题，不使它成为第五种强迫症亚型，也不确立任一诊断。[3]"
      }
    ]
  },
  {
    "id": "categories",
    "title": {
      "en": "Six categories, four descriptions: an exact reading example",
      "zh": "六类记录、四条描述：一个明确算例"
    },
    "paragraphs": [
      {
        "en": "Each observation offers did not notice, rarely, sometimes, often, very often or unscored. If four descriptions receive rarely, sometimes, sometimes and unscored, the six category counts are 0, 1, 2, 0, 0 and 1. Their sum is four, the number of descriptions in that topic.",
        "zh": "每条可选没有注意到、很少、有时、较常、经常或未计分。假设四条依次选择很少、有时、有时、未计分，六类计数即为0、1、2、0、0、1，合计四条，即该主题的描述条数。"
      },
      {
        "en": "Two under sometimes means two descriptions received that label. It does not mean two checks, thoughts, cleaning actions, objects or minutes. IDs are labels rather than points. The page produces no total, average, highest topic, clinical cutoff, severity band or comparison with other people.",
        "zh": "“有时”下的二表示两条描述选了这个标签，不表示查看、想法、清洁动作、物品或分钟各有两个。标识是标签，不是点数。页面不生成总分、平均值、最高主题、临床界值、严重程度分档或与他人的比较。"
      }
    ]
  },
  {
    "id": "missing-time",
    "title": {
      "en": "Unscored answers and the four-week reference",
      "zh": "未计分与四周回忆窗口"
    },
    "paragraphs": [
      {
        "en": "Unscored keeps no relevant experience, uncertain recall and a withheld answer separate from did not notice. All four descriptions in a topic may remain unscored, supplying no personal finding. All 20 may be unscored and the form still finishes with every full guide available. Missing information is not replaced with absence.",
        "zh": "未计分把没有相关经历、回想不清和保留回答的情况，与没有注意到区分开。某主题四条可以全部未计分，这不提供个人发现。20条全部未计分也可完成，并阅读全部完整指南；缺失信息不会被替换成没有发生。"
      },
      {
        "en": "The past four weeks is a recall window, not a diagnostic duration, a required amount of distress or a waiting period for support. A later record may differ because recall, interpretation or circumstances changed. There is no validated change threshold for this edition, so a different pattern cannot measure recovery, deterioration or treatment response.",
        "zh": "过去四周是回忆窗口，不是诊断持续时间、规定的难受程度或寻求支持的等待期。之后记录不同，可能与回忆、理解或情境变化有关。本版没有验证过的变化阈值，因此组合不同不能衡量康复、恶化或治疗反应。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "What clinical information explains, and what this edition records",
      "zh": "临床资料解释什么，本版实际记录什么"
    },
    "paragraphs": [
      {
        "en": "NIMH distinguishes ordinary rechecking or habits from clinically assessed obsessions and compulsions, and describes considering other health explanations during assessment. NHS notes that compulsions may include mental acts as well as visible behaviour. These distinctions help explain why a recollection label alone is insufficient for a diagnosis. [1][2]",
        "zh": "NIMH区分日常再次查看或习惯与经临床评估的强迫观念和行为，并介绍评估时考虑其他健康解释。NHS说明，强迫行为也可能包含心理动作，不限于可见行为。这些区别有助于理解为何单一回忆标签不足以作诊断。[1][2]"
      },
      {
        "en": "This original bank is not Y-BOCS, OCI, a published hoarding scale or clinical diagnostic criteria. Its actual questions and category method have no established psychometric validation, norms, clinical cutoffs or demonstrated English–Chinese measurement equivalence. Shared subject matter does not transfer a published instrument’s scores, research or authority to this edition.",
        "zh": "本站原创题组不是Y-BOCS、OCI、发表的囤积量表或临床诊断标准。实际题目与类别方法尚未建立心理测量验证、常模、临床界值或中英文测量等值。主题相近，不能将发表量表的分数、研究或权威直接转移至本版。"
      }
    ]
  },
  {
    "id": "conversation",
    "title": {
      "en": "Describe a difficulty without making the record a certainty test",
      "zh": "描述困难，不把记录变成确定性测试"
    },
    "paragraphs": [
      {
        "en": "A conversation can start with a difficulty you choose to mention: uncertainty returns after checking; arranging makes it hard to move on; or a thought’s meaning has felt distressing. You may ask a qualified professional how an assessment works and what information would be useful before deciding what to share. This website needs no private event, thought content, photographs or possession list.",
        "zh": "交流可以从自己愿意提及的困难开始：查看后又不确定，排列让自己难以继续，或因某个想法的含义感到难受。可以先问合格专业人士评估如何进行、哪些信息有用，再决定分享什么。网站不需要私人事件、想法内容、照片或财物清单。"
      },
      {
        "en": "Answer from recollection only. No checking, cleaning, deliberate thought-provocation, exposure, response prevention, suppression, neutralising, ritual-stopping, hygiene change or discarding task is assigned. Repeating the form cannot certify safety, settle a thought’s meaning or grant permission to discard something. Reading and seeking support require no completed record or minimum count.",
        "zh": "只凭回忆作答。不安排查看、清洁、故意引出想法、暴露、反应阻止、压制、抵消、停止仪式、改变卫生或丢弃任务。反复完成不能认证安全、确定想法含义或授权丢弃物品。阅读和寻求支持不要求完成记录或达到最低计数。"
      }
    ]
  },
  {
    "id": "care-privacy",
    "title": {
      "en": "Intent, practical safety and a private record",
      "zh": "意图、实际安全与私人记录"
    },
    "paragraphs": [
      {
        "en": "An unwanted thought does not by itself establish intent or action. That distinction does not allow this page to assess actual intent, a plan, immediate danger or ability to stay safe. Neither a small count nor an unscored record dismisses an existing concern. The page cannot judge contamination, equipment safety, housing conditions or the need or urgency of care.",
        "zh": "不想要的想法本身不建立意图或行动。这一区别不使页面能够评估实际意图、计划、即时危险或能否保障安全。计数少或未计分都不排除已有担忧。页面不能判断污染、设备安全、住房状况或照护需要及紧急程度。"
      },
      {
        "en": "Do not use a record to postpone assessment or change safety requirements, medicine, care, monitoring or property decisions. Answers stay in current-page memory without drafts, submission or questionnaire analytics; exit, retake, reload or leaving clears them. Copy public entry includes only the public title and address. The five complete guides contain no visitor answers.",
        "zh": "不要用记录推迟评估，或改变安全要求、药物、照护、监测和财物决定。回答留在当前页面内存，不存草稿、不提交，也没有问卷分析；退出、重做、刷新或离页会清除。复制公开入口只含公开标题和地址；五篇完整指南不含访客回答。"
      }
    ]
  }
];
export const unwantedActionsFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does a category count of two mean two repeated actions?",
      "zh": "类别计数为二表示重复动作两次吗？"
    },
    "answer": {
      "en": "No. It means two descriptions received that label. The record does not count actions, thoughts, objects or minutes.",
      "zh": "不是。它表示两条描述选了这个标签；记录不统计动作、想法、物品或分钟。"
    }
  },
  {
    "question": {
      "en": "Can a mental response be recorded if nobody else sees it?",
      "zh": "旁人看不到的心中回应也能记录吗？"
    },
    "answer": {
      "en": "Yes. The thoughts topic includes recalling words or another thought repeated mentally. You need not disclose the content. A label cannot establish a clinical compulsion.",
      "zh": "可以。想法主题包含回忆在心里重复词句或另一想法；无需披露内容。标签不能确立临床意义上的强迫行为。"
    }
  },
  {
    "question": {
      "en": "Does liking order establish a disorder?",
      "zh": "喜欢秩序就能确立障碍吗？"
    },
    "answer": {
      "en": "No. A preference, task requirement and difficult urge can use similar language. Four descriptions cannot establish their cause or make a diagnosis.",
      "zh": "不能。偏好、任务要求和令人困难的冲动，可能使用相似语言。四条描述不能确定原因或作诊断。"
    }
  },
  {
    "question": {
      "en": "Does the belongings topic tell me what to discard?",
      "zh": "财物主题会告诉我该丢什么吗？"
    },
    "answer": {
      "en": "No. It does not inspect a space, value possessions or authorise a clear-out. Practical safety, ownership and care decisions need context outside this form.",
      "zh": "不会。它不检查空间、不评定物品价值，也不授权清理。实际安全、所有权及照护决定需要题组之外的背景。"
    }
  },
  {
    "question": {
      "en": "What if all four observations in a topic are unscored?",
      "zh": "某主题四条全未计分会怎样？"
    },
    "answer": {
      "en": "That topic supplies no personal finding. Its complete guide remains available. Unscored is not replaced with did not notice and is not a safety guarantee.",
      "zh": "该主题不提供个人发现，完整指南仍可阅读。未计分不会被没有注意到替代，也不构成安全保证。"
    }
  },
  {
    "question": {
      "en": "Can these records be converted to Y-BOCS or OCI scores?",
      "zh": "记录可以换算成Y-BOCS或OCI分数吗？"
    },
    "answer": {
      "en": "No. The original items and categorical method are different. No supported conversion, clinical cutoff or measurement equivalence has been established for this edition.",
      "zh": "不能。原创题目与类别方法不同；本版尚无得到证据支持的换算、临床界值或测量等值。"
    }
  },
  {
    "question": {
      "en": "Should I retake until the record feels certain or correct?",
      "zh": "需要重做到记录感觉确定或正确吗？"
    },
    "answer": {
      "en": "No. There is no target pattern or score to achieve. Repeated records cannot certify safety or settle a concern, and support is available without finishing.",
      "zh": "不需要。没有必须达到的组合或分数。反复记录不能认证安全或确定担忧，未完成也可询问支持。"
    }
  },
  {
    "question": {
      "en": "Is an agreement checkbox required before the first observation?",
      "zh": "第一条观察前需要勾选同意吗？"
    },
    "answer": {
      "en": "No. The start button opens the first observation directly. You can leave, keep any description unscored or read all five public guides without answering.",
      "zh": "不需要。点击开始直接打开第一条观察；可以离开、将任一描述保留为未计分，或不答题阅读五篇公开指南。"
    }
  }
];
