import type { Questionnaire } from "@/lib/questionnaires/types";
export const numberContextSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "Numbers in everyday life: a record of remembered situations",
      "zh": "日常数字情境：记录记得的经历"
    },
    "paragraphs": [
      {
        "en": "Twenty original descriptions invite adults to recall the past four weeks. Four groups of five cover quantities and written numbers, following calculation steps, time and measures, and prices and daily records. These are overlapping editorial topics for organising experiences, not established independent psychological dimensions.",
        "zh": "20条原创描述邀请成年人回顾过去四周。四组各五条，涉及数量与书面数字、跟随计算步骤、时间与度量，以及价格与日常记录。这些是整理经历、可能重叠的编辑主题，不是已确立的独立心理维度。"
      },
      {
        "en": "The page records your selected labels and the number of descriptions assigned each label. It does not observe arithmetic, grade a performance or compare you with other adults. All four complete topic readings are public before answering and remain the same for every reader, including someone who leaves every description unscored.",
        "zh": "页面记录所选标签，以及每种标签对应的描述条数。不观察算术过程、不批阅表现，也不与其他成年人比较。四篇完整主题读法在作答前公开，所有读者看到相同内容，全部未计分也不例外。"
      }
    ]
  },
  {
    "id": "quantities",
    "title": {
      "en": "A written number, its quantity and its format are different things",
      "zh": "书面数字、数量含义与呈现形式需要分开"
    },
    "paragraphs": [
      {
        "en": "The first topic includes pausing over what an amount means, rereading digit order, comparing displayed amounts, estimating and noticing an unintended written arrangement. Recognising one of these descriptions does not show which part of a task was difficult. The page never presents standardised magnitude-comparison, number-line or timed counting tasks.",
        "zh": "第一主题涉及停下来理解数量含义、重读数字顺序、比较显示数额、估计，以及注意到书写排列非本意。认可某条描述，不能说明任务中的哪个环节困难。页面不呈现标准化数量比较、数轴或计时点数任务。"
      },
      {
        "en": "Units, decimal conventions, layout and familiarity belong to the situation being recalled. A pause over an unfamiliar display is not a measured processing deficit. You may describe the information that needed clarification without reproducing exact numbers, copying a document or deciding that one cause explains the experience.",
        "zh": "单位、小数约定、排版与熟悉程度都属于回忆场景。面对陌生展示的停顿不是测得的加工缺陷。可以说明需要澄清的信息，不必重现确切数字、抄录文档，或认定某一种原因解释了经历。"
      }
    ]
  },
  {
    "id": "steps",
    "title": {
      "en": "Following a method is not the same as answering correctly",
      "zh": "跟随计算方法与答对题目不是同一件事"
    },
    "paragraphs": [
      {
        "en": "The second group concerns losing a step, keeping notes available, uncertainty about how a result was reached, choosing the next step after an explanation and rechecking. It captures remembered experiences around a process rather than the correctness of that process. There is no original calculation for the site to mark.",
        "zh": "第二组涉及忘记算到哪一步、保留笔记、不确定结果来源、听过说明后选择下一步，以及再次核对。它记录围绕过程的回忆，不判断过程是否正确。网站没有原计算可以批阅。"
      },
      {
        "en": "Notes, calculators and another person’s explanation can be ordinary resources. Their use is not evidence of dependence, compensation for a hidden disorder or weak memory. Keep useful aids and existing checks. An optional practical question is whether the steps can remain visible; the page prescribes no unaided comparison, training or repeated-checking routine.",
        "zh": "笔记、计算器与他人说明可以是普通资源。使用它们不是依赖、补偿隐藏障碍或记忆薄弱的证据。可以保留有用辅助与已有核对。实际问题可以是步骤能否持续可见；页面不规定无辅助对照、训练或重复核对惯例。"
      }
    ]
  },
  {
    "id": "time-measures",
    "title": {
      "en": "Time, duration and units: preserve the context",
      "zh": "时间、时长与单位：保留具体背景"
    },
    "paragraphs": [
      {
        "en": "Reading a displayed time, considering an interval, comparing planned and actual duration, relating units and understanding a written distance are different activities. Their inclusion in one topic does not establish a shared cognitive cause or a validated time-perception or spatial-ability dimension.",
        "zh": "理解显示时间、考虑时间间隔、比较计划与实际时长、联系单位，以及理解书面距离，是不同活动。归入同一主题，不证明它们具有共同认知原因，也不形成经过验证的时间知觉或空间能力维度。"
      },
      {
        "en": "A task lasting longer than expected can be described without deciding why it happened. No diary, clock test, measuring exercise or journey is required to answer. This record cannot verify a route or measurement, certify safety or replace the checks and qualified instructions relevant to a real activity.",
        "zh": "任务用时超出预想，可以描述而不判定原因。回答不要求写日记、做看钟测试、测量练习或出行。记录不能核验路线或度量、认证安全，也不能替代真实活动所需的核对与合格专业指示。"
      }
    ]
  },
  {
    "id": "prices",
    "title": {
      "en": "Price information is not a financial-capacity test",
      "zh": "价格信息回顾不是财务能力测试"
    },
    "paragraphs": [
      {
        "en": "The fourth topic covers differently presented prices, change or totals, tracking included costs, percentages and help with routine numerical information. A label says something about a remembered description, not whether a purchase was correct, how much money was lost or whether you can manage finances.",
        "zh": "第四主题涉及不同呈现形式的价格、找零或合计、跟随已纳入的费用、百分比，以及处理日常数字信息时的帮助。标签记录对描述的回忆，不判断购买是否正确、损失多少金额或能否管理财务。"
      },
      {
        "en": "You can discuss wanting a condition or amount explained more clearly while leaving account details, receipts and real figures private. No transaction is requested. The result is not permission to pay, borrow, transfer money, sign a document or change a financial arrangement; it provides no product recommendation or financial advice.",
        "zh": "可以讨论希望某个条件或金额说明更清楚，同时保留账户、收据与真实数字。页面不要求交易。结果不是付款、借款、转账、签署文档或改变财务安排的许可，也不提供产品推荐或财务建议。"
      }
    ]
  },
  {
    "id": "categories",
    "title": {
      "en": "How five selections produce six counts, without points",
      "zh": "五条选择怎样形成六类计数，而不产生分数"
    },
    "paragraphs": [
      {
        "en": "Each description has six choices: did not notice, rarely, sometimes, often, very often and unscored. Numeric-looking identifiers are labels only. For example, did not notice, rarely, often, often and unscored produce counts of 1, 1, 0, 2, 0 and 1 in that order. Their sum is five descriptions, not five errors, transactions or minutes.",
        "zh": "每条描述有六种选择：没有注意到、很少、有时、较常、经常与未计分。看起来像数字的标识只是标签。例如选择没有注意到、很少、较常、较常、未计分，按此顺序计数为1、1、0、2、0、1；合计的是五条描述，不是五次错误、交易或五分钟。"
      },
      {
        "en": "Unscored covers no relevant experience, unclear recall or withholding an answer. It remains distinct from did not notice. Counts do not become a total, mean, strongest topic, severity band or probability. Different opportunities to encounter a situation prevent interpreting the four groups as a league table of difficulties.",
        "zh": "未计分包括没有相关经历、回想不清或保留回答，与没有注意到分开。计数不会变成总分、均值、最强主题、严重程度分档或概率。接触场景的机会不同，也不能把四组排列成困难程度榜。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Everyday mathematics, assessment and what the evidence supports",
      "zh": "日常数学、专业评估与证据支持的范围"
    },
    "paragraphs": [
      {
        "en": "British Dyslexia Association information describes adult mathematics difficulties in activities involving time, schedules, prices and other daily information, and provides assessment and support resources. These references help distinguish everyday concerns from an assessment process; they do not supply or validate these 20 original statements.[1][2]",
        "zh": "英国阅读障碍协会资料介绍成年人在时间、日程、价格等日常信息活动中的数学困难，并提供评估与支持资源。这些参考帮助区分日常担忧与评估过程，没有提供或验证本页20条原创描述。[1][2]"
      },
      {
        "en": "This bank has no established diagnostic validity, norms, sensitivity, specificity or English–Chinese measurement equivalence. It cannot confirm or exclude dyscalculia, identify causes or infer intelligence, effort or work suitability. Tool use and maths anxiety are not additional diagnostic indicators. The separate numerical-reasoning practice retains its own questions, correct-answer counts and explanations; its results are never combined with this record.",
        "zh": "本题组尚未建立诊断有效性、常模、敏感度、特异度或中英文测量等值。它不能确认或排除计算障碍、识别原因，也不推断智力、努力或工作适配。使用工具与数学担忧不是追加诊断指标。独立数值推理练习保留自己的题目、答对数与解释，结果不与本记录合并。"
      }
    ]
  },
  {
    "id": "use",
    "title": {
      "en": "A useful next question does not need a threshold",
      "zh": "有用的下一步问题不需要分数门槛"
    },
    "paragraphs": [
      {
        "en": "If you wish, describe one recent situation and the information you wanted clarified: a step that needed to remain visible, for example, rather than a global judgement that you cannot do maths. An appropriately qualified learning-support or assessment professional can explain what further information would be relevant. You can ask without a high count, childhood proof or a completed form.",
        "zh": "愿意时，可以描述近期一个场景，以及想澄清的信息，例如需要步骤持续可见，而不是笼统判断自己不会数学。合适的学习支持或评估专业人员可以说明需要哪些进一步资料。提问不需要高计数、童年证明或完成表单。"
      },
      {
        "en": "Selections stay in current-page memory, with no saved drafts, submission, questionnaire analytics or private result address. Exit, retake, reload and leaving clear them; copying shares only the public title and entry. Later differences can reflect different activities or recollection, not demonstrated improvement or decline. Keep healthcare, professional advice and existing support independent of this record.",
        "zh": "选择只在当前页面内存，不存草稿、不提交、不作问卷分析，也没有私人结果地址。退出、重做、刷新与离页会清除；复制仅分享公开标题与入口。以后差异可能反映活动或回忆不同，不展示已证实的改善或退步。医疗照护、专业意见与已有支持应独立于本记录。"
      }
    ]
  }
];
export const numberContextFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does rereading a number establish a number-processing difficulty?",
      "zh": "重读数字能确立数字加工困难吗？"
    },
    "answer": {
      "en": "No. The page does not observe the number, its presentation, your interpretation or a standardised task. A remembered pause cannot identify a cause or establish dyscalculia.",
      "zh": "不能。页面不观察原数字、呈现方式、理解过程或标准化任务。记得的一次停顿不能找出原因或确立计算障碍。"
    }
  },
  {
    "question": {
      "en": "Does using a calculator make my record worse?",
      "zh": "用计算器会让记录变差吗？"
    },
    "answer": {
      "en": "No. There is no better or worse score. Using a resource does not prove impairment; removing it is not required. Keep useful aids and existing checks.",
      "zh": "不会。记录没有好坏分数。使用资源不证明受损，也不要求撤掉；可以保留有用辅助与已有核对。"
    }
  },
  {
    "question": {
      "en": "What does two often selections actually mean?",
      "zh": "两条选择较常，实际表示什么？"
    },
    "answer": {
      "en": "It means two descriptions in that group were assigned that label. It does not mean two errors or that you struggle in two fifths of your daily activities. No such denominator is collected.",
      "zh": "表示该组有两条描述被选为较常。不表示犯错两次，也不表示五分之二的日常活动存在困难；页面没有收集这种分母。"
    }
  },
  {
    "question": {
      "en": "Can I leave every description unscored?",
      "zh": "可以把所有描述都留为未计分吗？"
    },
    "answer": {
      "en": "Yes. Every topic then displays five unscored descriptions. This is distinct from did not notice and establishes neither absence of difficulty nor a need for a particular service. All four complete readings remain available.",
      "zh": "可以。每个主题显示五条未计分，与没有注意到不同；既不证明没有困难，也不建立特定服务需求。四篇完整读法仍可阅读。"
    }
  },
  {
    "question": {
      "en": "Does a planning mismatch measure my sense of time?",
      "zh": "计划与实际不一致，能测时间感吗？"
    },
    "answer": {
      "en": "No. The page records recollection rather than timed performance and cannot know whether the task changed or the plan lacked information. It does not assign time-management or spatial-ability scores.",
      "zh": "不能。页面记录回忆，而非计时表现，不知道任务是否变化或计划是否缺少信息，也不给时间管理或空间能力分数。"
    }
  },
  {
    "question": {
      "en": "Does confusion about a price mean I cannot manage money?",
      "zh": "看价格困惑，代表不能管理金钱吗？"
    },
    "answer": {
      "en": "No. The record observes no transaction or decision. It cannot assess financial capacity, verify a payment or authorise someone else to make decisions. Do not enter private account information.",
      "zh": "不代表。记录不观察交易或决策，不能评估财务能力、核验付款或授权他人代为决定。无需输入私人账户信息。"
    }
  },
  {
    "question": {
      "en": "Can numerical reasoning results explain these counts?",
      "zh": "数值推理结果能解释这些计数吗？"
    },
    "answer": {
      "en": "No. Practice answers and remembered experiences have different purposes and methods. Keep the practice questions, correct counts and worked explanations separate; neither can supply a clinical conclusion from this record.",
      "zh": "不能。练习答案与回忆经历具有不同目的和方法。练习题、答对数与题解分别保留，不能据此为本记录提供临床结论。"
    }
  },
  {
    "question": {
      "en": "Are the English and Chinese records directly comparable?",
      "zh": "中英文记录可以直接比较吗？"
    },
    "answer": {
      "en": "The same labels and recording rule are available in both languages, but measurement equivalence and shared norms have not been established. Language, units, conventions and encountered tasks remain relevant context, not causes established by the page.",
      "zh": "两种语言提供相同标签与记录规则，但尚未建立测量等值与共同常模。语言、单位、约定和实际接触任务仍是相关背景，不是页面已确定的原因。"
    }
  }
];
