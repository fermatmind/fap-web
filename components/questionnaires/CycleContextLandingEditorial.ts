import type { Text } from "@/lib/questionnaires/types";

export const cycleContextSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Menstrual-cycle context: four topics, one remembered period start",
      "zh": "月经周期情境：四个主题，同一次月经开始前后"
    },
    "paragraphs": [
      {
        "en": "Sixteen original descriptions invite adults to recall the days around one recent menstrual period they remember. Four descriptions each concern feelings, irritation, bodily and ordinary changes before that period, and remembered before-and-after timing. Each topic has its own category record and complete public guide.",
        "zh": "16条原创描述，供成年人回顾同一次最近记得的月经开始前后几天。四个主题各含四条，分别关注经期前的感受、烦躁、身体与日常变化，以及记得的前后时间关系。每个主题均有单独类别记录和完整公开指南。"
      },
      {
        "en": "The reference is your own remembered experience, not a standard for how someone should feel before menstruation. The four editorial topics may overlap; they are not four validated independent dimensions. No date, cycle history, gender, pregnancy history, parenthood or regular cycle is assumed or requested.",
        "zh": "参照是本人记得的经历，不规定经期前应当怎样感受。四个编辑主题可能重叠，不是四个经过验证的独立维度。页面不假设或要求日期、周期史、性别、妊娠史、家长身份或规则周期。"
      }
    ]
  },
  {
    "id": "feelings",
    "title": {
      "en": "Separate emotional change, lower mood, worry and feeling overwhelmed",
      "zh": "分别理解感受变化、低落、担心与难以应付"
    },
    "paragraphs": [
      {
        "en": "The first topic distinguishes feelings shifting more quickly than usual, feeling lower, noticing more worry and an ordinary setback feeling harder to manage. A quick change need not be intense, and a strong feeling need not change quickly. Matching several descriptions does not establish that they happened together.",
        "zh": "第一组区分感受比平时变化更快、心情较低、担心较多，以及普通挫折更难应付。变化快不必意味着强烈，感受强烈也不必变化快。多条描述符合，不证明它们同时发生。"
      },
      {
        "en": "Feeling a change and remembering its timing are separate information. A before-period recollection cannot identify why a feeling occurred or show that it recurred in another cycle. You do not need to defend a reaction, reproduce it or find an explanation in order to keep a recollection uncertain.",
        "zh": "感到变化与记得发生时间，是不同信息。经期前的回忆不能确定感受的原因，也不能证明另一个周期重复发生。无需为反应辩护、重现感受或找到解释，便可保留回忆未知。"
      }
    ]
  },
  {
    "id": "irritation",
    "title": {
      "en": "Irritation, tone and wanting distance are different observations",
      "zh": "烦躁、语气与想要距离，是不同观察"
    },
    "paragraphs": [
      {
        "en": "The second topic concerns irritation at a small interruption, a sharper tone, difficulty letting an annoyance pass and wanting more distance from a disagreement. An internal feeling, spoken words and a wish for distance are not the same action. The record does not reconstruct the exchange or decide whose interpretation was correct.",
        "zh": "第二组关注小打断引起的烦躁、较生硬的语气、小烦恼难以过去，以及想与分歧保持更多距离。内在感受、说出的话与距离意愿，不是同一个行动。记录不重建交流，也不判断谁的理解正确。"
      },
      {
        "en": "Timing does not excuse harmful behaviour or make a practical concern merely a symptom. These answers do not label character, gender, emotional maturity or relationship safety. No message review, apology, confrontation, contact test or staying in a difficult interaction is required.",
        "zh": "时间关系不能替有害行为开脱，也不把实际担忧降为症状。回答不评判品格、性别、情绪成熟程度或关系安全，无需回看消息、道歉、对质、测试联系或留在困难互动中。"
      }
    ]
  },
  {
    "id": "body-routine",
    "title": {
      "en": "Bodily discomfort, sleep, appetite and energy retain their context",
      "zh": "身体不适、睡眠、食欲与精力，保留各自背景"
    },
    "paragraphs": [
      {
        "en": "The third topic retains bodily discomfort during an ordinary activity, sleep feeling different, wanting food feeling different and less energy for an activity. These broad recollections do not measure a symptom, sleep quality, food intake, nutritional status or energy expenditure. What was available and what an activity required remain unknown.",
        "zh": "第三组保留普通活动中的身体不适、安睡感觉不同、想吃东西的感觉不同，以及活动精力较少。这些宽泛回忆不测量症状、睡眠质量、摄食量、营养状态或能量消耗。当时可用的条件与活动要求仍可能未知。"
      },
      {
        "en": "A remembered association cannot establish that a physical change was harmless, expected or caused by menstruation. There is no need to inspect a body sensation, use a device, change a meal, restrict food, alter sleep or test endurance. Existing health concerns and professional advice remain relevant whatever the category record shows.",
        "zh": "记忆中的关联，不能证明身体变化无害、理所当然或由月经造成。无需检查身体感觉、使用设备、改变餐食、限制饮食、调整睡眠或测试耐力。不论类别记录怎样呈现，已有健康顾虑与专业意见仍然重要。"
      }
    ]
  },
  {
    "id": "timing",
    "title": {
      "en": "Remembered easing and continuing feelings can coexist",
      "zh": "记得的缓解与持续，可以同时保留"
    },
    "paragraphs": [
      {
        "en": "The final four descriptions concern noticing a change before the period, feelings moving towards usual after it began, some feelings continuing afterwards and a different experience at another recent time. Easing in one respect and continuing difficulty in another can both be remembered. Nothing is reverse scored or subtracted to force a simple before-and-after story.",
        "zh": "最后四条关注经期前注意到变化、开始后感受接近平时、部分感受之后仍持续，以及另一段近期时间的不同经历。一方面缓解与另一方面持续困难，可以同时被记得。不作反向计分或相减，也不强行整理成简单前后故事。"
      },
      {
        "en": "Another remembered time is not a measured comparison period. These answers do not calculate a change percentage, cycle phase, ovulation date, recurring pattern or hormone effect. The Office on Women’s Health describes cycle counting from one period’s first day to the next; this page collects neither date and does not calculate cycle length. [2]",
        "zh": "另一段回忆不是测量所得的对照时段。回答不计算变化百分比、周期阶段、排卵日期、重复模式或激素作用。美国女性健康办公室以一次月经首日至下次首日说明周期计时；本页不收这两个日期，也不计算周期长度。[2]"
      }
    ]
  },
  {
    "id": "categories",
    "title": {
      "en": "Recollection-match categories are not frequency or severity scores",
      "zh": "回忆贴切类别，不是频率或严重度分数"
    },
    "paragraphs": [
      {
        "en": "For each description choose does not match my recollection, matches slightly, partly, mostly or closely, or leave it unscored. Category IDs carry no points. No relevant experience, unclear recall and withholding share the unscored option; the resulting record cannot distinguish those reasons afterwards.",
        "zh": "每条可选择与回忆不符、稍微符合、部分符合、大体符合、很符合，或未计分。类别标识不带点数。没有相关经历、回忆不清与保留回答共用未计分选项，形成记录后不能再区分这些原因。"
      },
      {
        "en": "For example, two partly matches, one closely matches and one unscored produce counts 0, 0, 2, 0, 1 and 1 in display order. They add to four descriptions, not days, symptoms or cycles. There is no total, mean, weighting, highest topic or clinical threshold. All sixteen may remain unscored without a personal explanation being invented.",
        "zh": "例如，两条部分符合、一条很符合、一条未计分，按展示顺序计数为0、0、2、0、1、1，合计四条描述，而非天数、症状或周期。没有总分、均值、加权、最高主题或临床阈值。16条均可未计分，不据此编造个人解释。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Recollection, screening and professional assessment use different information",
      "zh": "回顾、筛查与专业评估，使用的信息不同"
    },
    "paragraphs": [
      {
        "en": "The Office on Women’s Health describes PMDD assessment as involving health history, examination and a symptom calendar or diary. A one-time recollection-match record cannot perform that assessment. It does not administer the Daily Record of Severity of Problems (DRSP), the Premenstrual Symptoms Screening Tool (PSST) or another published clinical form. [1]",
        "zh": "美国女性健康办公室介绍的PMDD评估包括健康史、检查与症状日历或日记。单次回忆贴切记录不能完成这样的评估。本页不施测每日问题严重程度记录（DRSP）、经前症状筛查工具（PSST）或其他已发表临床题本。[1]"
      },
      {
        "en": "No reliability, validity, clinical norms or English–Chinese measurement equivalence has been established for these sixteen original descriptions. Matching a sentence cannot confirm or exclude PMS, PMDD or another condition. Related mood and worry pages have their own recall frames and methods; their answers are not transferred or combined here.",
        "zh": "这16条原创描述尚未建立自身信度、效度、临床常模与中英文测量等值证据。某条符合，不能确认或排除经前综合征（PMS）、经前烦躁障碍（PMDD）或其他状况。相关心情与担心页面各有回忆参照与方法，不向这里转移或合并回答。"
      }
    ]
  },
  {
    "id": "privacy-support",
    "title": {
      "en": "Complete public reading without dates, tracking or disclosure",
      "zh": "完整公开阅读，无需日期、追踪或披露"
    },
    "paragraphs": [
      {
        "en": "Answers remain only in current-page memory, without drafts, submission as answers, questionnaire analytics or a personal result URL. Exit, retake, reload and leaving clear them. Copy public entry shares only the fixed public title and link, without selected categories or cycle information. All four complete guides remain readable before any answers.",
        "zh": "回答只留当前页面内存，不存草稿、不作为答案提交、不作问卷分析，也无个人结果网址。退出、重做、刷新与离页会清除记录。“复制公开入口”只分享固定公开标题与链接，不含所选类别或周期信息。四篇完整指南均可在答题前阅读。"
      },
      {
        "en": "A concern can be raised with a qualified healthcare or mental-health professional without a count, a diary or waiting for another cycle. This page assigns no tracking schedule, medical task or treatment change. Existing care, contraception advice and support remain independent; concerns outside the selected days must not be dismissed as merely cyclical.",
        "zh": "无需达到计数、持有日记或再等一个周期，便可向合格医疗或心理健康专业人员提出顾虑。本页不安排追踪日程、医疗任务或治疗改变。已有照护、避孕意见与支持独立保留，选定日子之外的顾虑也不能被当作只是周期性而忽视。"
      }
    ]
  }
];

export const cycleContextFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Who is this personal reflection for?",
      "zh": "这份个人回顾适合谁？"
    },
    "answer": {
      "en": "Adults may recall their own experience around one recent remembered period start. Sixteen descriptions take about eight minutes at your own pace. No registration, date entry or regular cycle is required.",
      "zh": "供成年人回顾本人同一次最近记得的月经开始前后经历。16条描述约需八分钟，可按自己的节奏进行，无需注册、输入日期或具有规则周期。"
    }
  },
  {
    "question": {
      "en": "Is this a period or ovulation calculator?",
      "zh": "这是经期或排卵计算器吗？"
    },
    "answer": {
      "en": "No. It asks for no dates, cycle lengths or ovulation information. It cannot predict the next period, identify a fertile window or guide contraception. The timing words organize a recollection only.",
      "zh": "不是。页面不收日期、周期长度或排卵信息，不能预测下次月经、识别易孕窗口或指导避孕。时间用语只用于整理回忆。"
    }
  },
  {
    "question": {
      "en": "Does a close match mean a severe symptom?",
      "zh": "很符合就表示症状严重吗？"
    },
    "answer": {
      "en": "No. Match labels describe how well wording fits a recollection. They do not measure intensity, frequency, functional impairment or how many days something happened. A category count cannot grade a medical concern.",
      "zh": "不表示。贴切标签描述措辞与回忆多符合，不测强度、频率、功能受影响程度或发生天数。类别计数不能给医疗顾虑分级。"
    }
  },
  {
    "question": {
      "en": "Can I keep all sixteen descriptions unscored?",
      "zh": "16条都能保留未计分吗？"
    },
    "answer": {
      "en": "Yes. No relevant recollection, unclear timing and privacy can all use the same unscored option. It stays separate from does not match. The record does not distinguish those missing-information reasons, and all four guides remain available.",
      "zh": "可以。无相关回忆、时间不清与私人回答均可选择同一个未计分选项，它与不符分开。记录不能区分这些缺失原因，四篇指南仍可阅读。"
    }
  },
  {
    "question": {
      "en": "Does continuing difficulty cancel remembered easing?",
      "zh": "持续困难会抵消记得的缓解吗？"
    },
    "answer": {
      "en": "No. Some feelings may ease while others continue. Each description retains its own label without reversal or subtraction. This does not confirm or exclude a diagnosis, and continuing concerns remain relevant.",
      "zh": "不会。部分感受可以缓解，其他感受仍持续。每条保留自己的标签，不反向或相减，也不由此确认或排除诊断。持续存在的顾虑仍然重要。"
    }
  },
  {
    "question": {
      "en": "Can I answer for a partner or family member?",
      "zh": "能替伴侣或家人作答吗？"
    },
    "answer": {
      "en": "This original form is for adult self-recollection. Another person’s impressions cannot supply private feelings or uncertain timing. Public guides can be read without completing the form or assigning anyone a cycle label.",
      "zh": "本原创题本用于成年人回顾自己。别人的印象不能代替私人感受或不确定的时间。无需完成题本或给任何人分配周期标签，即可阅读公开指南。"
    }
  },
  {
    "question": {
      "en": "Can another attempt measure improvement?",
      "zh": "再次完成能测量改善吗？"
    },
    "answer": {
      "en": "No change threshold or test–retest evidence has been established. Recall, context or the selected period may differ. A different set of categories does not establish improvement, deterioration, a hormone effect or treatment response.",
      "zh": "尚未建立变化阈值或重测证据。回忆、背景或选定经期都可能不同。类别改变不能证明改善、恶化、激素作用或治疗反应。"
    }
  },
  {
    "question": {
      "en": "Must I check an app or start a diary to answer?",
      "zh": "作答必须查应用或开始日记吗？"
    },
    "answer": {
      "en": "No. Use existing broad recollections or leave descriptions unscored. No body check, message review, tracking, sleep or food change is required by this page. Any existing professional monitoring plan remains separate from this voluntary activity.",
      "zh": "不必。可使用已有宽泛回忆，或将描述留为未计分。本页不要求检查身体、回看消息、追踪或改变睡眠饮食。已有专业监测计划与这项自愿活动分别保留。"
    }
  }
];

export const cycleContextReadingSummaries: Record<string, Text> = {
  "feelings-before-a-period-reading": {
    "en": "Separate shifting feelings, low mood, worry and feeling overwhelmed from assumptions about timing or cause.",
    "zh": "分别理解感受转换、低落、担心与难以应付，不凭此假定时间或原因。"
  },
  "irritation-before-a-period-reading": {
    "en": "Distinguish irritation, tone and wanting distance without judging character or explaining an interaction by cycle timing.",
    "zh": "区分烦躁、语气与距离意愿，不评判品格或用周期时间解释互动。"
  },
  "body-and-routine-before-a-period-reading": {
    "en": "Keep bodily discomfort, sleep, appetite and energy in context without measurements or a hormonal explanation.",
    "zh": "结合背景理解身体不适、睡眠、食欲与精力，不作测量或激素解释。"
  },
  "recalled-cycle-timing-reading": {
    "en": "Retain easing, continuing feelings and uncertain timing without reverse scoring or claiming a verified recurring pattern.",
    "zh": "保留缓解、持续感受与时间未知，不反向计分或声称已核实重复模式。"
  }
};
