import type { Questionnaire } from "@/lib/questionnaires/types";
export const sleepExperiencesSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "Sleep experiences: five topics to read separately",
      "zh": "睡眠经历：五个分别阅读的主题"
    },
    "paragraphs": [
      {
        "en": "This adult reflection uses 20 original observations to organise what you noticed over the past two weeks. Five topics cover settling to sleep, waking during rest, waking before planned, daytime experiences and thoughts about sleep. Each topic contains four descriptions; the categories can overlap in everyday life.",
        "zh": "这份成年人回顾用20条原创观察，整理过去两周注意到的经历。五个主题分别涉及准备入睡、睡眠中醒来、比计划早醒、白天经历及围绕睡眠的想法；每个主题四条，生活中的体验可以重叠。"
      },
      {
        "en": "The result retains your selected labels and six category counts per topic. Read all five complete guides before answering or after any response pattern. The page organises recollections rather than assessing whether you slept enough, identifying a disorder or choosing a treatment.",
        "zh": "结果保留逐条所选标签，并分别展示各主题六类计数。作答前、任何回答组合后，都能阅读五篇完整指南。本页整理回忆，不判定睡得是否足够、不识别睡眠障碍，也不选择治疗。"
      }
    ]
  },
  {
    "id": "five-topics",
    "title": {
      "en": "From settling down to the next waking period",
      "zh": "从准备入睡，到接下来的清醒时段"
    },
    "paragraphs": [
      {
        "en": "Settling to sleep includes remaining awake when you wanted to drift off or feeling more alert again. Waking during rest concerns remembered interruptions and returning to sleep. Waking before planned concerns an earlier end to rest than you intended, rather than a particular clock time.",
        "zh": "准备入睡时包括想睡去却仍醒着、或有了睡意又变清醒；睡眠中醒来关注记得的中断与重新入睡；比计划早醒关注休息比原本打算更早结束，不由某个钟点定义。"
      },
      {
        "en": "Daytime experiences include struggling to keep your eyes open, effort, attention and irritability. Thoughts about sleep include worry, checking the time and frustration. These are distinct descriptions, not evidence that worry caused an interruption or that disrupted rest explains every daytime difficulty.",
        "zh": "白天经历包括费力睁眼、活动费力、注意与烦躁；围绕睡眠的想法包括担忧、查看时间和沮丧。这些是分别记录的描述，不证明担忧造成中断，也不证明每种白天困难都由断续休息解释。"
      }
    ]
  },
  {
    "id": "recall",
    "title": {
      "en": "Main sleep need not take place at night",
      "zh": "主要睡眠不限于夜间"
    },
    "paragraphs": [
      {
        "en": "Use your main sleep whenever it occurs, including daytime rest when your routine places it there. The term waking day means your period of ordinary activity. This reflection asks about the last two weeks, not an ideal schedule, a lifetime pattern or only the worst occasion.",
        "zh": "无论主要睡眠发生在什么时段，都以它为参照，包括因日常安排而在白天进行的睡眠。清醒活动时段指自己通常活动的时间。本回顾问过去两周，不要求按理想作息、终身模式或最差一次经历回答。"
      },
      {
        "en": "You do not need to check clocks, reconstruct minutes or upload a tracker. Use the experience you remember; if you cannot recall or do not want to answer, leave that observation unscored. A short recall window does not classify a difficulty as short-term or chronic.",
        "zh": "不必查看时钟、重建分钟数或上传追踪设备。使用记得的体验；无法回想或不愿回答时，可以未计分。一个较短的回顾窗口，不把困难分类为短期或慢性。"
      }
    ]
  },
  {
    "id": "categories",
    "title": {
      "en": "How six category counts describe four observations",
      "zh": "六类计数怎样记录四条观察"
    },
    "paragraphs": [
      {
        "en": "For each description, choose did not notice, rarely, sometimes, often, very often or unscored. Suppose one topic receives did not notice, sometimes, often and unscored. Its six counts, in that order, are 1, 0, 1, 1, 0 and 1; they add to four descriptions.",
        "zh": "每条可选没有注意到、很少、有时、较常、经常或未计分。假设某主题四条依次选择没有注意到、有时、较常和未计分，那么六类按上述顺序的计数为1、0、1、1、0、1，合计四条描述。"
      },
      {
        "en": "A count of two under often means that two descriptions received that label. It does not mean two awakenings, two nights or two hours. Category IDs are not points; the website does not add them into a severity total, average themes or select a highest sleep problem.",
        "zh": "“较常”下计数为二，表示两条描述选了这个标签，不表示醒了两次、两个夜晚或两小时。类别标识不是点数；网站不把它们相加成严重程度总分、不平均主题，也不选最高睡眠问题。"
      }
    ]
  },
  {
    "id": "unscored",
    "title": {
      "en": "Unscored and did not notice carry different information",
      "zh": "未计分与没有注意到提供不同信息"
    },
    "paragraphs": [
      {
        "en": "Did not notice records your recollection of a description. Unscored preserves no relevant experience, unclear recall or a withheld answer without turning it into that label. Responding unscored is a valid way to complete an observation, not a request to guess.",
        "zh": "没有注意到记录你对描述的回忆；未计分保留没有相关经历、回想不清或保留回答的情况，不把它改为没有注意到。选择未计分可以有效完成一条观察，不要求猜测。"
      },
      {
        "en": "If all four descriptions in a topic are unscored, the record supplies no personal finding about that topic. All 20 may be unscored and the form still finishes with five full guides. Neither missing information nor a collection of did-not-notice labels certifies healthy sleep or safety for an activity.",
        "zh": "某主题四条都未计分时，记录不提供该主题的个人发现。20条全部未计分也可完成，五篇全文仍开放。资料缺失或一组没有注意到，都不认证睡眠健康，也不对活动安全放行。"
      }
    ]
  },
  {
    "id": "assessment",
    "title": {
      "en": "Why a reflection differs from a clinical sleep evaluation",
      "zh": "个人回顾与临床睡眠评估的区别"
    },
    "paragraphs": [
      {
        "en": "NHLBI describes an assessment that considers sleep history, schedules, daytime effects, health and medicines, with additional investigations where indicated. These details help a clinician consider possible explanations. A label-only recollection cannot replace that assessment or determine which test someone needs. [2]",
        "zh": "NHLBI介绍的评估会考虑睡眠经历、作息、白天影响、健康与用药，必要时进一步检查。这些信息帮助临床人员考虑可能解释；只记录标签的回顾，不能替代这样的评估，也不能决定某个人需要哪种检查。[2]"
      },
      {
        "en": "This original bank is not the Insomnia Severity Index (ISI), Pittsburgh Sleep Quality Index (PSQI), a sleep diary or a device measure. Similar topics do not make instruments interchangeable. The five reading categories have no established clinical thresholds, norms or demonstrated English–Chinese measurement equivalence for this edition.",
        "zh": "这份原创题本不是失眠严重程度指数（ISI）、匹兹堡睡眠质量指数（PSQI）、睡眠日记或设备测量。主题相似不使工具能够互换；本版五个阅读分类尚无临床阈值、常模或验证过的中英文测量等值。"
      }
    ]
  },
  {
    "id": "examples",
    "title": {
      "en": "Keep a concrete example without inferring a cause",
      "zh": "保留具体实例，避免从先后推断原因"
    },
    "paragraphs": [
      {
        "en": "You may remember waking, wanting more sleep and then finding an ordinary task harder. This describes a sequence you noticed; it does not establish that one event caused the next. Another time, an interruption may have occurred without the same daytime experience. Keep both examples available when reading.",
        "zh": "你可能记得醒来、还想继续睡，随后做普通任务更费力。这描述自己注意到的先后，不确立前一件事导致后一件事。另一次也可能有中断，却没有同样的白天经历；阅读时可以同时保留这些例子。"
      },
      {
        "en": "If you choose to discuss a concern, a specific experience and how it affected you can be more useful than calling one theme your type. You can mention a worry without estimating its cause or bringing a completed form. The record does not prescribe a new bedtime, medicine change or sleep-restriction exercise.",
        "zh": "如果愿意谈论困扰，说明一个具体经历及其影响，比把某主题称为自己的类型更有用。可以直接谈担忧，无需先估计原因或带着已完成表格。记录不规定新的就寝时间、改药或限制睡眠练习。"
      }
    ]
  },
  {
    "id": "support-privacy",
    "title": {
      "en": "Support does not depend on a count or completed record",
      "zh": "支持不取决于计数或是否完成"
    },
    "paragraphs": [
      {
        "en": "NHS sleep guidance includes difficulty falling or staying asleep and daytime tiredness or concentration difficulties; it also advises against driving when sleepy. A self-reflection does not clear you to drive or continue an unsafe task. Seek an appropriate safe alternative rather than answering more questions to obtain reassurance. [1]",
        "zh": "NHS睡眠说明涉及难以入睡或维持睡眠，以及白天疲倦、注意困难，也提醒困倦时不要驾车。个人回顾不能批准驾车或继续不安全任务；应寻找合适安全替代，而非为了获得放心继续答题。[1]"
      },
      {
        "en": "You may seek qualified support without reaching a threshold or finishing the form. Answers stay in current-page memory and clear on exit, retake, reload or leaving; copying the public entry contains only its title and address. The five public guides contain no visitor answers, and none require registration.",
        "zh": "无需达到阈值或完成表格，也可以寻求合格专业支持。回答留在当前页面内存，退出、重做、刷新或离页会清除；复制公开入口只含标题和地址。五篇公开指南不含访客回答，也不要求注册。"
      }
    ]
  }
];
export const sleepExperiencesFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does often mean a particular number of nights?",
      "zh": "“较常”代表固定几晚吗？"
    },
    "answer": {
      "en": "No. It is a recollection label, not a count of nights or events. The result counts descriptions assigned to each label and does not reconstruct a nightly record.",
      "zh": "不是。它是回忆标签，不统计夜晚或事件。结果统计选入各标签的描述，不重建逐夜记录。"
    }
  },
  {
    "question": {
      "en": "Can the record calculate sleep efficiency?",
      "zh": "记录能计算睡眠效率吗？"
    },
    "answer": {
      "en": "No. The form does not collect the required sleep and time-in-bed measurements. Category counts cannot be converted into minutes, hours or an efficiency percentage.",
      "zh": "不能。题组不收集所需睡眠与卧床时间测量，类别计数不能换算成分钟、小时或效率百分比。"
    }
  },
  {
    "question": {
      "en": "How should I answer if my main sleep is during the day?",
      "zh": "主要在白天睡觉应怎样回答？"
    },
    "answer": {
      "en": "Use that main sleep as your reference and your usual waking activity period for the daytime descriptions. The reflection does not require a night-time schedule.",
      "zh": "以那段主要睡眠为参照，白天描述则对应自己通常清醒活动的时段；回顾不要求夜间作息。"
    }
  },
  {
    "question": {
      "en": "Do five topics mean five independent clinical dimensions?",
      "zh": "五个主题是五个独立临床维度吗？"
    },
    "answer": {
      "en": "No. They organise original descriptions for reading, with four observations each. Their independence, clinical validity and cross-language equivalence have not been established for this edition.",
      "zh": "不是。它们把原创描述整理为阅读主题，各四条；本版尚未建立独立性、临床效度或跨语言等值。"
    }
  },
  {
    "question": {
      "en": "What if one theme has four unscored responses?",
      "zh": "某主题四条全未计分怎么办？"
    },
    "answer": {
      "en": "It provides no personal finding about that theme. Other selected labels stay recorded, and every complete guide remains available without filling the gap.",
      "zh": "该主题不提供个人发现，其他所选标签仍保留；无需补齐缺口就能读全部完整指南。"
    }
  },
  {
    "question": {
      "en": "Does a two-week window establish chronic insomnia?",
      "zh": "两周回顾能确定慢性失眠吗？"
    },
    "answer": {
      "en": "No. It organises recent recall rather than applying diagnostic duration or frequency criteria. A qualified assessment considers a broader history and context.",
      "zh": "不能。它组织近期回忆，不应用诊断所需持续时间或频率标准；合格评估会考虑更广的经历与背景。"
    }
  },
  {
    "question": {
      "en": "Can a result reveal why I feel tired?",
      "zh": "结果能揭示疲倦原因吗？"
    },
    "answer": {
      "en": "No. Selecting tiredness or attention-related descriptions does not establish the cause, rule out other conditions or measure fitness for a task. You can discuss the experience itself with a qualified professional.",
      "zh": "不能。选中疲倦或注意相关描述，不确立原因、不排除其他状况，也不测任务适任性；可以直接向合格专业人士谈经历。"
    }
  },
  {
    "question": {
      "en": "Do I need a tracker or account to read the guides?",
      "zh": "阅读指南需要追踪设备或账户吗？"
    },
    "answer": {
      "en": "No. All five complete guides and support information are public. No device upload, account or private answers are required, and copying the public entry does not share a result.",
      "zh": "不需要。五篇完整指南和支持说明公开，无需设备上传、账户或私人回答；复制公开入口不分享个人结果。"
    }
  }
];
