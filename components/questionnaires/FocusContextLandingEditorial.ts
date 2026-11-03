import type { Questionnaire } from "@/lib/questionnaires/types";
export const focusContextSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "Attention and energy in the activities you choose",
      "zh": "所选活动中的注意、精力与情境"
    },
    "paragraphs": [
      {
        "en": "This adult reflection uses 16 original observations about the past four weeks. Four reading topics concern attention during chosen activities, restlessness, feelings and available energy, and interpreting social experiences. Each has four descriptions; the headings organise recollections rather than establish independent psychological dimensions.",
        "zh": "这份成年人回顾用16条原创观察整理过去四周的经历。四个阅读主题涉及所选活动中的注意、坐立不安、感受与可用精力，以及理解社交经历时的情况。每个主题四条描述；这些标题用于整理回忆，不确立独立的心理维度。"
      },
      {
        "en": "Your record retains the label selected for each description and six category counts per topic. All four complete guides are public before answering. The aim is to describe an experience in its context, without a concentration score, a neurotype, a capacity ranking or a conclusion about another person.",
        "zh": "记录保留每条描述所选标签，并分别展示各主题的六类计数。四篇完整指南在作答前即公开。目的在于结合情境描述经历，不生成集中能力分数、神经类型、容量排名或关于他人的结论。"
      }
    ]
  },
  {
    "id": "attention-movement",
    "title": {
      "en": "Attention and movement are descriptions, not performance tests",
      "zh": "注意与活动是经历描述，不是表现测试"
    },
    "paragraphs": [
      {
        "en": "Attention observations concern losing the thread while reading or listening, switching before an intended step is finished and difficulty returning after an interruption. The record does not time concentration, measure memory or count mistakes. It cannot tell whether the material, interruption, available support or another circumstance explains a recollection.",
        "zh": "注意主题涉及阅读或听话时没跟上、原定步骤完成前转向别的事，以及被打断后难以重新投入。记录不计专注时长、不测记忆，也不统计错误；不能判断内容、打断、可用支持或其他情境如何解释回忆。"
      },
      {
        "en": "Restlessness observations concern wanting movement, discomfort with stillness, changing position and attention drawn toward moving. The form does not measure energy expenditure or require sitting still. A category cannot judge whether a movement is unnecessary, a seating rule reasonable or an adjustment should be removed.",
        "zh": "坐立不安主题涉及想活动、不动时不舒服、调整姿势，以及注意被想活动的感觉拉开。题组不测能量消耗，也不要求静坐。类别不能判断某个动作多余、座位规则合理，或是否该移除已有调整。"
      }
    ]
  },
  {
    "id": "feelings-social",
    "title": {
      "en": "Feelings, available energy and uncertainty after an interaction",
      "zh": "感受、可用精力与交流后的不确定"
    },
    "paragraphs": [
      {
        "en": "Two descriptions concern a feeling becoming intense quickly or continuing to draw attention after an event; two concern energy differing from expectation or making an intended pace harder to maintain. Grouping them together does not establish a single emotion–energy trait, a physiological state or a causal connection between feelings and energy.",
        "zh": "两条描述涉及感受很快变强烈，或事情结束后仍吸引注意；另两条涉及精力与预期不同，或更难维持原定节奏。将它们放在一起，不建立单一的情绪—精力特质、生理状态或感受与精力之间的因果关系。"
      },
      {
        "en": "Social interpretation concerns wondering how an exchange was received, an unclear reply, concern about criticism and a tone or expression staying in mind. It records your recollection of uncertainty, not whether criticism or rejection occurred. These descriptions are not additional ADHD diagnostic criteria or a measure of rejection sensitivity, social accuracy or relationship health.",
        "zh": "社交理解主题涉及琢磨交流被怎样接收、回复不清楚、担心受到批评，以及在意某个语气或表情。它记录对不确定的回忆，不判断是否发生批评或拒绝。这些描述不是追加ADHD诊断标准，也不测拒绝敏感、社交准确性或关系健康。"
      }
    ]
  },
  {
    "id": "categories",
    "title": {
      "en": "Four descriptions and six labels: how to read the counts",
      "zh": "四条描述与六个标签：怎样阅读计数"
    },
    "paragraphs": [
      {
        "en": "The labels are did not notice, rarely, sometimes, often, very often and unscored. If a topic’s four descriptions receive did not notice, sometimes, often and unscored, its category counts are 1, 0, 1, 1, 0 and 1. These add to four descriptions, not four events or a four-point score.",
        "zh": "标签为没有注意到、很少、有时、较常、经常和未计分。假设某主题四条依次选择没有注意到、有时、较常、未计分，六类计数即为1、0、1、1、0、1，合计四条描述，不表示四次事件或四分。"
      },
      {
        "en": "A count records how many descriptions received a label. It does not count interruptions, movements, messages or minutes, and cannot be converted into a percentage of attention or energy. IDs are not points. The page calculates no total, average, highest topic, severity band, probability or population percentile.",
        "zh": "计数记录多少条描述选了某个标签，不统计打断、动作、消息或分钟，也不能换算成注意力或精力百分比。标识不是点数。页面不计算总分、平均值、最高主题、严重程度分档、概率或人群百分位。"
      }
    ]
  },
  {
    "id": "missing-context",
    "title": {
      "en": "Unscored is different from did not notice",
      "zh": "未计分与没有注意到分别保留"
    },
    "paragraphs": [
      {
        "en": "No relevant experience, unclear recall and a withheld answer can remain unscored. They are not replaced with did not notice. If all four descriptions in a topic are unscored, it provides no personal finding; all 16 may be unscored and the form still finishes with every complete guide available.",
        "zh": "没有相关经历、回想不清和保留回答都可未计分，不会被替换成没有注意到。某主题四条全未计分时，不提供个人发现；16条全部未计分也能完成，全部完整指南仍可阅读。"
      },
      {
        "en": "Four weeks is a recall window, not a diagnostic duration or waiting period for support. Opportunities to read, sit, interact or undertake activities can differ between occasions. A changed record can reflect context, recall or interpretation; without validated change thresholds, it cannot measure recovery, deterioration, treatment response or a change in capacity.",
        "zh": "四周是回忆窗口，不是诊断持续时间或寻求支持的等待期。不同时期的阅读、静坐、交流或活动机会可能不同。记录变化可以反映情境、回忆或理解；本版没有验证过的变化阈值，不能据此衡量康复、恶化、治疗反应或容量变化。"
      }
    ]
  },
  {
    "id": "separate-adexi",
    "title": {
      "en": "ADEXI14 and these 16 observations remain separate",
      "zh": "ADEXI14与这16条观察保持独立"
    },
    "paragraphs": [
      {
        "en": "The existing executive-function page retains its 14 ADEXI items, working-memory and inhibition readings, source version, response anchors, adopted raw sums and separately labelled part means. Its question is how well statements describe you, with no added fixed recent reference period. This page instead asks remembered frequency over four weeks and counts categories.",
        "zh": "已有执行功能页保留14条ADEXI题目、工作记忆与抑制读法、来源版本、回答锚点、所采用原始合计及分别标注的分项均分。它问陈述对自己的贴切程度，不另加固定近期参照时段。本页则问四周内记得的频率，并记录类别计数。"
      },
      {
        "en": "The public links below offer independent reading without transferring answers or importing a personal result. Fourteen items plus 16 observations do not form a 30-item instrument. The numbers cannot be added, averaged or compared as one scale; the ADEXI page does not become an emotion, energy or social-interpretation assessment through these links.",
        "zh": "下方公开链接提供独立阅读，不转移回答或导入个人结果。14题加16条不构成30题工具。两页数字不能相加、平均或当同一量表比较；链接也不使ADEXI页变成情绪、精力或社交理解评估。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Clinical assessment asks questions this reflection cannot answer",
      "zh": "临床评估考虑本回顾无法回答的问题"
    },
    "paragraphs": [
      {
        "en": "NIMH and NHS describe adult ADHD assessment as considering developmental history, difficulties across life settings, their effects and other possible explanations. A recent description of distraction or restlessness alone is insufficient for that assessment. This page neither collects that clinical history nor evaluates diagnostic criteria. [1][2]",
        "zh": "NIMH与NHS介绍，成年人ADHD评估会考虑发展经历、不同生活情境中的困难及其影响，以及其他可能解释。单一的近期走神或坐立不安描述不足以完成这种评估。本页既不收集那类临床经历，也不评估诊断标准。[1][2]"
      },
      {
        "en": "This original bank is not the ASRS, an ADEXI extension or a clinical diagnostic interview. Its actual questions and category method have no established psychometric validation, norms, clinical cutoffs or demonstrated English–Chinese measurement equivalence. Background references do not validate the edition or make its additional reading topics diagnostic dimensions.",
        "zh": "本站原创题组不是ASRS、ADEXI扩展版或临床诊断访谈。实际题目与类别方法尚未建立心理测量验证、常模、临床界值或中英文测量等值。背景参考资料不验证本版，也不使额外阅读主题成为诊断维度。"
      }
    ]
  },
  {
    "id": "conversation-privacy",
    "title": {
      "en": "A conversation can start with one experience you choose",
      "zh": "交流可以从自己选择的一次经历开始"
    },
    "paragraphs": [
      {
        "en": "You may describe one occasion in your own words: what you hoped to do, what drew attention away, how comfortable movement or stillness felt, or what remained uncertain after an exchange. No performance task, memory game, forced sitting, body check or message review is needed. You need not prove childhood onset, wait months or finish a record before asking a qualified professional about a concern.",
        "zh": "可以用自己的话描述一次经历：本来希望做什么、什么吸引了注意、活动或不动时是否舒服，或交流后还有什么不确定。无需做表现任务、记忆游戏、强制静坐、检查身体或回看消息。询问合格专业人士前，无需证明童年起始、等待几个月或完成记录。"
      },
      {
        "en": "This is an adult self-reflection, not a report about a child, partner or employee. It cannot decide a cause, health or safety status, another person’s intentions or fitness for work. Do not use it to postpone assessment or change medicine, care, monitoring or safety arrangements. Answers remain in current-page memory and clear on exit, retake, reload or leaving; copying the public entry includes only its title and address.",
        "zh": "这是成年人自我回顾，不是关于儿童、伴侣或雇员的报告。它不能确定原因、健康安全状况、他人意图或工作适任性。不要用它推迟评估，或改变药物、照护、监测和安全安排。回答留在当前页面内存，退出、重做、刷新或离页会清除；复制公开入口只含标题和地址。"
      }
    ]
  }
];
export const focusContextFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does one often label mean one interruption?",
      "zh": "一条较常表示被打断一次吗？"
    },
    "answer": {
      "en": "No. It means one description received that label. The form counts descriptions, not interruptions, movements, messages or minutes.",
      "zh": "不是。它表示一条描述选了这个标签；题组统计描述，不统计打断、动作、消息或分钟。"
    }
  },
  {
    "question": {
      "en": "Do feelings and available energy form one measured trait?",
      "zh": "感受与可用精力构成一个测量特质吗？"
    },
    "answer": {
      "en": "No. They remain different descriptions in one reading topic. Their placement together establishes neither one trait nor a causal connection.",
      "zh": "不构成。它们在同一阅读主题中保持不同描述；放在一起既不建立单一特质，也不建立因果联系。"
    }
  },
  {
    "question": {
      "en": "Can a category tell whether another person criticised me?",
      "zh": "类别能判断别人是否批评我吗？"
    },
    "answer": {
      "en": "No. The page does not inspect the exchange or know another person’s intentions. A recollection cannot confirm criticism, deny harmful treatment or rate your social accuracy.",
      "zh": "不能。页面不查看交流，也不知道对方意图。回忆不能确认批评、否认有害对待或评定社交准确性。"
    }
  },
  {
    "question": {
      "en": "Does restlessness mean I should make myself sit still?",
      "zh": "坐立不安表示应该强迫自己静坐吗？"
    },
    "answer": {
      "en": "No. Stillness is not a target, and no movement-control task is assigned. A record does not remove accessibility adjustments, care instructions or practical safety needs.",
      "zh": "不是。静止不是目标，也不安排控制活动的任务。记录不移除无障碍调整、照护指示或实际安全需要。"
    }
  },
  {
    "question": {
      "en": "What if all four descriptions in a topic are unscored?",
      "zh": "某主题四条全部未计分会怎样？"
    },
    "answer": {
      "en": "It supplies no personal finding. All complete guides remain public. Unscored is not replaced with did not notice or treated as proof that support is unnecessary.",
      "zh": "该主题不提供个人发现，全部完整指南仍然公开。未计分不会被没有注意到替代，也不证明无需支持。"
    }
  },
  {
    "question": {
      "en": "Can an ADEXI mean be compared with a category count here?",
      "zh": "ADEXI均分能与这里的类别计数比较吗？"
    },
    "answer": {
      "en": "No. The forms have different items, response anchors, reference periods and arithmetic. Public reading links do not combine or transfer personal results.",
      "zh": "不能。两份题组的题目、回答锚点、参照时段和计算方式不同。公开阅读链接不合并或转移个人结果。"
    }
  },
  {
    "question": {
      "en": "Can I use this record to evaluate a child or employee?",
      "zh": "能用记录评估儿童或雇员吗？"
    },
    "answer": {
      "en": "No. These are adult first-person recollections. They are not a parent report, observer scale, capacity test or employment decision tool.",
      "zh": "不能。这是成年人第一人称回忆，不是家长报告、观察者量表、容量测试或雇佣决策工具。"
    }
  },
  {
    "question": {
      "en": "Is an agreement checkbox needed before starting?",
      "zh": "开始前需要勾选同意吗？"
    },
    "answer": {
      "en": "No. The start button opens the first observation directly. You can leave, keep any observation unscored or read all four guides without answering.",
      "zh": "不需要。点击开始直接打开第一条观察；可以离开、将任一观察保留为未计分，或不答题阅读四篇指南。"
    }
  }
];
