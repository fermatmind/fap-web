import type { Text } from "@/lib/questionnaires/types";

export const seasonContextSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Time of year: four topics for comparing remembered experiences",
      "zh": "一年中的时间：四个主题的经历对比"
    },
    "paragraphs": [
      {
        "en": "Sixteen original descriptions invite adults to recall parts of the past two years: mood and energy, sleep, appetite, and remembered timing. Four descriptions in each topic preserve different aspects of experience. The overlapping groups organise reading, without establishing independent psychological dimensions or a seasonal profile.",
        "zh": "16条原创描述，供成年人回顾过去两年记得的不同时段：心情与精力、睡眠、食欲，以及记得的时间关系。每个主题四条，分别保留体验的不同方面。分组可以重叠，用于组织阅读，不确立独立心理维度或季节画像。"
      },
      {
        "en": "You choose whether this time-of-year context is useful. No months, dates, location, hemisphere, weather record or personal history are entered. You can remember a difference without knowing its cause or exact timing. The two-year editorial window does not verify two annual episodes, clinical duration or a need to wait.",
        "zh": "可自行选择一年中时间的背景是否有用。不输入月份、日期、地点、半球、天气记录或个人史。可以记得差别，同时不知道原因或准确时间。两年的编辑窗口，不核实两次年度发作、临床持续时间，也不要求等待。"
      }
    ]
  },
  {
    "id": "mood-energy",
    "title": {
      "en": "Mood, energy, interest and restlessness need not change together",
      "zh": "心情、精力、兴趣与坐立不安，未必同时变化"
    },
    "paragraphs": [
      {
        "en": "The first topic concerns remembered differences in mood, energy for ordinary activities, interest in a familiar activity and restlessness across parts of the year. Matching several descriptions does not show that the changes occurred together, lasted equally long or formed one clinical episode.",
        "zh": "第一个主题关注一年中不同时段记得的心情、普通活动精力、熟悉活动兴趣，以及坐立不安的差别。多条符合，不说明变化同时发生、持续同样久，或构成同一次临床发作。"
      },
      {
        "en": "Available opportunities, demands, routines and health may also have differed. The record cannot separate these influences or determine which part of the year should feel better. It supplies no activity test, weather exposure, mood target or diary to establish a comparison; unclear details may remain unscored.",
        "zh": "可用机会、实际要求、作息和健康也可能不同。记录不能分离这些影响，也不决定一年哪段时间应该感觉更好。不安排活动测试、天气接触、心情目标或日记来建立比较；细节不清可保留未计分。"
      }
    ]
  },
  {
    "id": "sleep",
    "title": {
      "en": "Wanting sleep, settling, early waking and getting up are different recollections",
      "zh": "想多睡、安睡、早醒与起床，是不同回忆"
    },
    "paragraphs": [
      {
        "en": "The sleep descriptions separate wanting more sleep, difficulty settling, waking earlier than intended and difficulty getting up at a usual time. You may recall more than one, including experiences that seem to point in different directions. Neither is reversed or subtracted, and the page does not force them into a winter or summer type.",
        "zh": "睡眠描述分别关注更想多睡、难以安睡、早于打算醒来，以及难在平时的时刻起床。可以记得不止一种，包括看起来方向不同的经历。不反向、不相减，也不强合成冬季或夏季类型。"
      },
      {
        "en": "These are not measurements of sleep duration, biological need, adequate rest or a circadian mechanism. The page does not know available sleep opportunities or other health circumstances. No clock-time entry, device check, nightly log, light exposure or sleep change is needed to answer, and existing health advice stays independent.",
        "zh": "它们不是睡眠时长、生理需要、休息是否足够或生物节律机制的测量。页面不知道可用睡眠机会及其他健康处境。回答无需输入钟点、检查设备、逐夜记录、接触光照或改变睡眠；已有健康意见独立保留。"
      }
    ]
  },
  {
    "id": "appetite",
    "title": {
      "en": "Appetite, a particular food and the timing of wanting food differ",
      "zh": "食欲、特定食物与想吃东西的时间，分别保留"
    },
    "paragraphs": [
      {
        "en": "Four descriptions concern food seeming less appealing, wanting more food, wanting a familiar kind of food differently and a different time of wanting food. A preference for one food does not establish a change in overall appetite, intake or nutritional adequacy. Several matches need not refer to the same part of the year.",
        "zh": "四条描述关注食物吸引力减少、更想吃东西、对某种熟悉食物的想吃程度不同，以及想吃东西的时间不同。对一种食物的偏好，不确立总体食欲、摄入或营养是否足够的变化。多条符合未必指一年中同一时段。"
      },
      {
        "en": "What was available, customary, affordable or practical may also have changed. A category cannot isolate appetite from these circumstances, identify an eating disorder or decide a bodily cause. No weight, quantity or food list is entered. You need not inspect meals, compare your body, fast or change an existing eating plan.",
        "zh": "可获得、习惯、负担得起或方便的选择，也可能变化。类别不能把食欲与这些处境分开，不能识别进食障碍或判定身体原因。不输入体重、数量或食物清单，无需检查餐食、比较身体、禁食或改变已有饮食安排。"
      }
    ]
  },
  {
    "id": "timing",
    "title": {
      "en": "Recurrence, return towards usual, persistence and exceptions all remain",
      "zh": "再现、接近平时、持续与例外，都予保留"
    },
    "paragraphs": [
      {
        "en": "The final topic concerns a similar experience near a similar time, moving back towards your usual experience later, continuing beyond an associated time and a similar experience at an unexpected time. A recurring association and an exception may both fit. Exceptions are observations, not negative points, and timing receives no extra weight.",
        "zh": "最后一个主题关注相近时间的类似经历、后来接近平时、持续超过关联时间，以及意料外时间也有类似经历。记得的再现与例外可以同时符合。例外是观察，不是负分；时间主题不加额外权重。"
      },
      {
        "en": "Returning towards usual does not establish clinical remission, and persistence does not establish a chronic condition. Different descriptions may refer to different occasions. Neither a winter nor a summer association is assumed or ranked. You need not reconstruct a calendar, inspect old records or make memories form one consistent story.",
        "zh": "接近平时不确立临床缓解，持续也不确立慢性状况。不同描述可以指不同经历。不假设或排列冬季、夏季关联。无需重建日历、检查旧记录，或让记忆组成一个完全一致的故事。"
      }
    ]
  },
  {
    "id": "record",
    "title": {
      "en": "Match categories describe recollections, not the size of a seasonal change",
      "zh": "贴切类别描述回忆，不表示季节变化量"
    },
    "paragraphs": [
      {
        "en": "Choose does not match, matches slightly, partly, mostly, closely, or unscored for each description. The first five labels concern fit with what you remember, not frequency, intensity or size of change. Unscored combines no relevant experience, unclear recall and withholding; the record cannot distinguish those reasons or convert them to zero.",
        "zh": "每条可选与回忆不符、稍微符合、部分符合、大体符合、很符合，或未计分。前五类关注对记忆的贴切程度，不是频率、强度或变化量。未计分合并无相关经历、记忆不清与保留回答，记录不能区分原因，也不把它们转为零。"
      },
      {
        "en": "Two partly matches, one closely matches and one unscored produce counts 0, 0, 2, 0, 1 and 1 over four descriptions. They count neither years, seasons, episodes nor symptoms. There is no total, mean, reversal, weighting, highest topic or cutoff. All sixteen may be unscored, with the same four complete guides available.",
        "zh": "两条部分符合、一条很符合、一条未计分，得到0、0、2、0、1、1，合计四条描述，不计年份、季节、发作或症状。不设总分、均值、反向、加权、最高主题或界值。16条均可未计分，仍可阅读相同的四篇完整指南。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Seasonal-affective-disorder assessment has a different purpose and evidence base",
      "zh": "季节性情感障碍评估，有不同目的与证据要求"
    },
    "paragraphs": [
      {
        "en": "This original reflection is not the Seasonal Pattern Assessment Questionnaire (SPAQ) or a clinical screen. No norms, validated thresholds, diagnosis or English–Chinese measurement equivalence have been established. Another instrument’s research cannot validate these sixteen descriptions or turn their category counts into a seasonality score.",
        "zh": "本原创回顾不是季节模式评估问卷（SPAQ）或临床筛查，尚未建立常模、验证阈值、诊断或中英文测量等值。其他工具的研究，不能验证这16条描述，也不能把类别计数变为季节性分数。"
      },
      {
        "en": "NIMH describes seasonal affective disorder, including winter and summer presentations, and professional assessment of a broader history.[1] This background does not supply the original items here. A remembered time association alone cannot establish a daylight, weather or biological cause. Other mood, worry and energy pages keep their own recall windows and methods, without transferring answers or combining records.",
        "zh": "NIMH介绍包括冬季与夏季表现的季节性情感障碍，以及结合更广病史的专业评估。[1]这些背景不提供本页原创条目。只凭记得的时间关联，不能确立日照、天气或生理原因。其他心情、担心与精力页面保留自己的回忆窗口与方法，不转移回答或合并记录。"
      }
    ]
  },
  {
    "id": "privacy-support",
    "title": {
      "en": "Support does not require a verified calendar or another season of waiting",
      "zh": "支持不要求核实日历，或再等一个季节"
    },
    "paragraphs": [
      {
        "en": "The four complete readings and existing support explanation are public before answering and after any record. Answers stay in current-page memory without drafts, submission, questionnaire analytics or a personal result URL. Exit, retake, reload and leaving clear them. Copy public entry contains only the fixed public title and link.",
        "zh": "四篇完整读法及已有支持说明，在作答前及任何记录后均公开。回答留在当前页内存，不存草稿、不提交、不发问卷分析，也无个人结果网址。退出、重做、刷新与离页清除；复制公开入口只含固定公开标题与链接。"
      },
      {
        "en": "A concern can be discussed with a qualified healthcare or mental-health professional without completion, a count, two years of notes or another season of waiting. This page cannot assess care needs, urgency or safety. It gives no light, diet, supplement, sleep or medication instructions, and no record justifies postponing care or dismissing a continuing concern as only seasonal.",
        "zh": "有顾虑时，无需完成、达到计数、提供两年笔记或再等一个季节，就可与合格医疗或心理健康专业人员讨论。本页不能评估照护需要、紧急程度或安全，不提供光照、饮食、补充剂、睡眠或用药指示；任何记录都不是推迟照护，或把持续担忧当作只是季节性而忽视的依据。"
      }
    ]
  }
];

export const seasonContextFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Who can use this time-of-year reflection?",
      "zh": "谁可以使用这一年中时间回顾？"
    },
    "answer": {
      "en": "Adults may voluntarily recall their own experiences from parts of the past two years. Allow about eight minutes at your own pace, free without registration. No dates, location or personal history are entered.",
      "zh": "成年人可自愿回顾本人过去两年不同时段的经历，约需八分钟，可按自己的节奏进行，免费且无需注册，不输入日期、地点或个人史。"
    }
  },
  {
    "question": {
      "en": "Does closely matching mean an extreme seasonal change?",
      "zh": "很符合，就是季节变化很大吗？"
    },
    "answer": {
      "en": "No. The label concerns how closely the description fits your recollection. It does not measure the magnitude, intensity, frequency or consequences of the change.",
      "zh": "不是。标签关注描述对回忆有多贴切，不测变化幅度、强度、频率或后果。"
    }
  },
  {
    "question": {
      "en": "Can different sleep experiences both fit?",
      "zh": "不同方向的睡眠经历能同时符合吗？"
    },
    "answer": {
      "en": "Yes. Wanting more sleep and difficulty settling can concern different times. The page keeps them separately, without subtraction, reversal or forcing a winter or summer type.",
      "zh": "可以。想多睡与难以安睡可以指不同时间。页面分别保留，不相减、不反向，也不强分冬季或夏季类型。"
    }
  },
  {
    "question": {
      "en": "Does a food preference establish an appetite or weight change?",
      "zh": "食物偏好就确立食欲或体重改变吗？"
    },
    "answer": {
      "en": "No. Wanting a familiar food, overall appetite and when food is wanted are separate experiences. The record measures neither intake nor weight and requires no food or body checks.",
      "zh": "不确立。想吃熟悉食物、总体食欲与想吃东西的时间，是不同体验。记录不测摄入或体重，也不要求检查食物或身体。"
    }
  },
  {
    "question": {
      "en": "Do exceptions reduce a seasonal score?",
      "zh": "例外会扣除季节分吗？"
    },
    "answer": {
      "en": "There is no seasonal score. Recurrence, persistence, returning towards usual and an unexpected time remain separate descriptions. No exception is reversed or subtracted, and timing receives no extra weight.",
      "zh": "没有季节分。再现、持续、接近平时与意料外时间，分别保留为描述。例外不反向、不扣除，时间也不额外加权。"
    }
  },
  {
    "question": {
      "en": "Can a recent-mood result fill in this record?",
      "zh": "近期心情结果能补本页记录吗？"
    },
    "answer": {
      "en": "No. Different pages use different recall references and methods. Their answers and numbers are not transferred, combined or used to infer a missing time-of-year pattern.",
      "zh": "不能。不同页面使用不同回忆参照与方法，不转移或合并回答、数字，也不用它们推断缺失的一年中时间模式。"
    }
  },
  {
    "question": {
      "en": "Does a changed record show treatment response?",
      "zh": "记录变化能证明治疗反应吗？"
    },
    "answer": {
      "en": "No reliable-change threshold or test–retest evidence has been established. Memory, interpretation and circumstances can differ. A changed record cannot establish recovery, worsening or an effect of treatment.",
      "zh": "尚未建立可靠变化阈值或重测证据，记忆、理解与处境也可能不同。记录变化不能确立恢复、恶化或治疗效果。"
    }
  },
  {
    "question": {
      "en": "Can every description remain unscored?",
      "zh": "全部描述都能未计分吗？"
    },
    "answer": {
      "en": "Yes. No relevant experience, unclear timing or withholding may remain unscored. This does not become no change or a health finding; the four complete guides remain available without a personal interpretation.",
      "zh": "可以。无相关经历、时间不清或保留回答可未计分，不会变成没有变化或健康结论；四篇完整指南仍可阅读，不编造个人解释。"
    }
  }
];

export const seasonContextReadingSummaries: Record<string, Text> = {
  "mood-and-energy-across-the-year-reading": {
    "en": "Read remembered contrasts in mood, energy, interest and restlessness without assuming simultaneity, a season or a cause.",
    "zh": "分别阅读心情、精力、兴趣与坐立不安的回忆对比，不假设同时发生、某个季节或原因。"
  },
  "sleep-across-the-year-reading": {
    "en": "Distinguish wanting sleep, settling, early waking and getting up without measuring sleep need or prescribing a schedule.",
    "zh": "区分想多睡、安睡、早醒与起床，不测睡眠需要，也不开作息方案。"
  },
  "appetite-across-the-year-reading": {
    "en": "Separate appeal, appetite, preferred foods and timing without measuring intake, body change or nutritional adequacy.",
    "zh": "区分吸引力、食欲、食物偏好与时间，不测摄入、身体变化或营养是否足够。"
  },
  "recalled-time-of-year-patterns-reading": {
    "en": "Keep associations, persistence and exceptions together without verifying annual episodes or weighting a seasonal score.",
    "zh": "同时保留关联、持续与例外，不核实年度发作，也不加权计算季节分。"
  }
};
