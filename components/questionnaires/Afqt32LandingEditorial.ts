import type { Questionnaire } from "@/lib/questionnaires/types";

export const afqt32LandingSections: Questionnaire["guide"] = [
  {
    "id": "afqt-purpose",
    "title": {
      "en": "ASVAB-style practice: four English and mathematics areas",
      "zh": "ASVAB英文练习：四个语言与数学领域"
    },
    "paragraphs": [
      {
        "en": "Work through thirty-two independently authored questions: eight each in Arithmetic Reasoning, Word Knowledge, Paragraph Comprehension and Mathematics Knowledge. These are the four ASVAB subtests used in official AFQT reporting, but this page is a short fixed learning activity rather than the official assessment. Every answer explanation and all four study guides are free.",
        "zh": "练习三十二道独立编写的题目：算术推理、词汇知识、段落理解、数学知识各八题。这四项参与正式AFQT报告，但本页是固定短题本学习活动，不是正式评估。全部答案解析及四篇学习指南免费提供。"
      },
      {
        "en": "The activity focuses on reading conditions, choosing a method and checking evidence for an answer. It does not cover every ASVAB subject, reproduce secure test questions or estimate military eligibility. Both interfaces use the same English questions and answer choices; Chinese instructions and explanations support review without changing the vocabulary or reading task.",
        "zh": "活动关注阅读条件、选择方法与核查答案依据，不覆盖全部ASVAB学科，不复现保密试题，也不估算军职资格。两种界面使用同样的英文题目与选项，中文操作说明及解析帮助复盘，不改变词汇或阅读任务。"
      }
    ]
  },
  {
    "id": "afqt-verbal",
    "title": {
      "en": "Word Knowledge and Paragraph Comprehension: two kinds of evidence",
      "zh": "词汇知识与段落理解：两种不同的依据"
    },
    "paragraphs": [
      {
        "en": "Word Knowledge asks for the meaning of a word in its supplied sentence. Read the surrounding action, contrast and description before choosing the closest meaning. Knowing a familiar translation is useful, but a word may have several senses; check whether the proposed meaning fits this particular sentence and whether another option is more precise.",
        "zh": "词汇知识要求依据所给句子判断词义。先看周围的动作、对比与描述，再选最接近的意思。熟悉常见译法有帮助，但词语可能有多个义项；仍要核查候选义是否适合本句，以及是否有更准确的选项。"
      },
      {
        "en": "Paragraph Comprehension asks what a short passage supports. Distinguish a stated fact, a limited inference, a main purpose and something the passage leaves unknown. A plausible real-world explanation can still be unsupported by the supplied text. During review, identify the sentence or combination of sentences that supports the answer and why an attractive distractor goes beyond it.",
        "zh": "段落理解关注短文支持什么。区分明示事实、有限推断、主要目的与短文未说明的事情。现实中合理的解释，也可能没有得到题文支持。复盘时找到支持答案的句子或句子组合，并说明有吸引力的干扰项为何越过了原文依据。"
      }
    ]
  },
  {
    "id": "afqt-mathematics",
    "title": {
      "en": "Arithmetic Reasoning and Mathematics Knowledge: model before calculating",
      "zh": "算术推理与数学知识：先建模，再计算"
    },
    "paragraphs": [
      {
        "en": "Arithmetic Reasoning translates a described situation into operations. Identify the requested quantity, units and assumptions; then decide which numbers belong in the calculation. Discounts, ratios, constant rates and shared costs require different relationships. For a new example, seven packets of twelve sheets with nine removed leaves 7×12−9=75 sheets: the units and order of operations explain the result.",
        "zh": "算术推理把文字情境转成运算。识别所求量、单位与假设，再判断哪些数字参与计算。折扣、比例、恒定速率及共同费用对应不同关系。换一个例子：七包纸每包十二张，拿走九张，剩7×12−9=75张；单位与运算顺序共同解释结果。"
      },
      {
        "en": "Mathematics Knowledge uses mathematical relationships directly, including algebra, exponents, geometry, averages and probability in this bank. State the applicable rule, carry out the steps and check the result by substitution or another method. Correctly recalling an option is different from explaining why it satisfies an equation or geometric condition.",
        "zh": "数学知识直接运用数学关系，本题本涉及代数、指数、几何、平均数与概率。说出适用规则，完成步骤，再用代入或另一方法检查结果。记住正确选项，与能解释其为何满足方程或几何条件不同。"
      }
    ]
  },
  {
    "id": "afqt-modes",
    "title": {
      "en": "Timed practice and untimed study use the same fixed bank",
      "zh": "计时练习与不计时学习：同一固定题本"
    },
    "paragraphs": [
      {
        "en": "Choose a mode before starting. Timed practice allows AR 4:00, WK 2:40, PC 4:00 and MK 4:00, totalling 14:40 of active section time. These are site-selected learning caps. About eighteen minutes includes instructions and is an estimate, not an official exam duration. Untimed study removes deadlines while retaining the same questions, answer keys and explanations.",
        "zh": "开始前选择模式。计时练习为AR4:00、WK2:40、PC4:00、MK4:00，活动部分合计14:40，是本站选择的练习上限。约十八分钟包含说明，是预估用时，不是正式考试时长。不计时学习移除截止时间，题目、答案键及解析保持相同。"
      },
      {
        "en": "The first Start test button opens question one directly. After a section ends or expires, the next section waits for you to start its clock; it is not an agreement gate. Back and edits are available only within an open section. Background tabs do not pause the timer. If device clocks disagree beyond the accepted tolerance, the attempt clears rather than issuing a timed result.",
        "zh": "首个开始测试按钮直接打开第一题。一部分结束或超时后，下一部分等待你主动启动计时，这不是同意门槛。仅开放部分可返回修改；切后台不会暂停。若设备时钟出现超出允许范围的不一致，本次清除，不生成计时结果。"
      }
    ]
  },
  {
    "id": "afqt-counts",
    "title": {
      "en": "Read correct, wrong and unanswered counts separately",
      "zh": "正确、错误与未答分别怎样阅读"
    },
    "paragraphs": [
      {
        "en": "Each item has one fixed correct option. Matching it adds one correct answer; selecting another option adds one wrong answer. An explicit Leave unanswered choice or an untouched item at closure remains unanswered. For example, five correct, two wrong and one unanswered account for all eight questions in a section. The blank is not a selected wrong option.",
        "zh": "每题一个固定正确选项。匹配记一题正确，选其他记一题错误；明确留空或结束时未触及的题目保留为未答。例如五题正确、两题错误、一题未答，共八题；空白不是已经选择的错误选项。"
      },
      {
        "en": "Across four sections, the three counts sum to thirty-two. No guessing correction, adaptive item weighting or skill band is applied. You may finish a part early and retain its blanks, including finishing all four with no selected answers. The complete review still shows each question, your selection if any, the key, explanation and full topic guide.",
        "zh": "四部分的三类计数相加为三十二。不做猜测校正、自适应题目加权或技能分档。可以提前结束并保留空白，包括四部分全部不选答案后结束。完整复盘仍显示各题、所选或留空、答案键、解析与完整主题指南。"
      }
    ]
  },
  {
    "id": "afqt-scores",
    "title": {
      "en": "Why a practice correct count is not an AFQT percentile",
      "zh": "为什么练习正确数不是AFQT百分位"
    },
    "paragraphs": [
      {
        "en": "Official ASVAB guidance describes standard scores for subtests and AFQT percentiles derived from four subtests relative to a reference population. A percentile describes standing within that reference group, not the percentage of questions answered correctly. Twenty-four correct answers here mean twenty-four of these thirty-two fixed items, not AFQT75 or a seventy-fifth-percentile result.",
        "zh": "官方ASVAB资料说明分测验使用标准分，AFQT百分位由四项分测验相对参照人群计算。百分位描述在参照群体中的位置，不是答对题目的百分比。在这里答对二十四题，只表示这三十二道固定题中的二十四题，不等于AFQT75或第七十五百分位。"
      },
      {
        "en": "This bank has no established norming sample, calibration, reliability study, predictive validity or equivalence to official forms. Eight questions per topic cannot establish comprehensive mastery or a guaranteed score gain. Official enlistment and occupational decisions depend on the relevant official processes, not this page’s raw counts or an online conversion table.",
        "zh": "本题本尚未建立常模样本、校准、信度研究、预测效度或正式题本等值。每组八题不能确立全面掌握，也不能保证提分。正式入伍与岗位决定依据相应正式流程，不依据本页原始计数或网上换算表。"
      }
    ]
  },
  {
    "id": "afqt-review",
    "title": {
      "en": "Use a mistake to choose the next learning task",
      "zh": "从一处错误选择下一项学习任务"
    },
    "paragraphs": [
      {
        "en": "For each missed or unanswered item, distinguish unfamiliar vocabulary, misread conditions, a missing concept, an execution error and lack of time. Write the reason in your own private notes if useful. Reconstruct the solution without looking at the options, then try a fresh problem that changes the numbers, wording or passage while requiring the same underlying method.",
        "zh": "对每道错题或未答题，区分生词、误读条件、概念不熟、执行出错与时间不足。需要时自行私人记录原因。先不看选项重建解法，再换数字、措辞或短文，用同一基础方法解决新问题。"
      },
      {
        "en": "Repeated exposure to this fixed bank can improve answer recall without demonstrating transfer. Compare the reasoning, not only the later count. Study mode is suitable for checking steps; timed mode lets you observe decisions under this page’s particular caps. Neither is a proctored simulation of CAT-ASVAB, paper testing or PiCAT, whose administration and strategies differ.",
        "zh": "反复接触固定题本，可能提升答案记忆，却不证明迁移。比较推理过程，不只看后来的正确数。不计时适合核查步骤，计时适合观察本站特定上限下的取舍；两者都不是CAT-ASVAB、纸笔或PiCAT的监考模拟，这些形式的施测与策略各有区别。"
      }
    ]
  },
  {
    "id": "afqt-access",
    "title": {
      "en": "English tasks, bilingual review and private attempts",
      "zh": "英文任务、双语复盘与私人作答"
    },
    "paragraphs": [
      {
        "en": "Switching interface language changes instructions and explanations, not the English task. It also clears the current attempt, so finish reviewing first if you need its record. Public guides can be opened before practice and contain the same general material for everyone. No account, email, tracking permission or second test is required to access the complete learning content.",
        "zh": "切换界面语言改变操作与解析，不改变英文任务；同时会清除当前作答，需要本次记录时先完成复盘。公开指南答前可读，对所有人提供相同通用内容。完整学习内容不要求账户、邮箱、统计许可或第二项测试。"
      },
      {
        "en": "Answers and timing stay in page memory; refresh, leaving or cached-page restoration clears the attempt. Sharing copies four public guide links without responses, counts, mode or timing. For official preparation and administration information use the applicant sources below. Their publication informs this page’s boundaries, not an endorsement of this independently authored practice.",
        "zh": "答案与用时留在页面内存，刷新、离开或缓存恢复清除。分享只复制四篇公开指南链接，不含回答、数量、模式或用时。正式备考与施测信息请查下方申请人来源；这些出版资料帮助界定页面范围，不代表对本独立练习的背书。"
      }
    ]
  }
];

export const afqt32LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does Start test lead straight to a question?",
      "zh": "开始测试会直接进入题目吗？"
    },
    "answer": {
      "en": "Yes. Choose timed or untimed practice, then start question one without an agreement screen. Optional action analytics remain off unless separately enabled.",
      "zh": "会。选择计时或不计时后，直接开始第一题，没有同意确认页。可选动作统计须单独开启，默认关闭。"
    }
  },
  {
    "question": {
      "en": "Why do I start each later section separately?",
      "zh": "为什么后续各部分分别开始？"
    },
    "answer": {
      "en": "Each section has its own clock. The next part waits so reading the transition does not consume its time. This does not request permission to process your answers.",
      "zh": "各部分有独立计时，下一部分等待开始，避免过渡说明占用题目时间；这不要求授权处理答案。"
    }
  },
  {
    "question": {
      "en": "Do twenty-four correct answers mean AFQT75?",
      "zh": "答对二十四题就是AFQT75吗？"
    },
    "answer": {
      "en": "No. They mean twenty-four correct among this bank’s thirty-two items. Official percentiles depend on standard scores and reference-population procedures, not that fraction.",
      "zh": "不是。它表示本题本三十二题中答对二十四题。正式百分位取决于标准分与参照人群程序，不是这个比例。"
    }
  },
  {
    "question": {
      "en": "Is a blank counted as a wrong choice?",
      "zh": "留空算选择错误吗？"
    },
    "answer": {
      "en": "No. Correct, wrong and unanswered are separate. Explicit skips and untouched questions remain unanswered when a section closes.",
      "zh": "不算。正确、错误、未答分开；明确留空与未触及的题目在本部分结束时保留为未答。"
    }
  },
  {
    "question": {
      "en": "Can I pause a timer by switching tabs?",
      "zh": "切换标签页能暂停吗？"
    },
    "answer": {
      "en": "No. Active section time continues in the background. Use untimed study when you do not want a deadline. Device-clock inconsistency clears the timed attempt.",
      "zh": "不能。活动部分在后台继续计时。不希望截止时间时选不计时；设备时钟不一致会清除计时作答。"
    }
  },
  {
    "question": {
      "en": "Why keep English questions in the Chinese interface?",
      "zh": "中文界面为什么保留英文题？"
    },
    "answer": {
      "en": "Translating the tested vocabulary and passages would change the task. Chinese instructions, explanations and full guides support review of the unchanged English questions.",
      "zh": "翻译被考查的词汇与短文会改变任务。中文操作、解析与完整指南帮助复盘保持不变的英文题。"
    }
  },
  {
    "question": {
      "en": "Does a higher second attempt prove improved aptitude?",
      "zh": "第二次更高就证明能力提高吗？"
    },
    "answer": {
      "en": "No. This is a fixed bank, so recalling answers can change the count. Check independent reasoning on new examples; no validated change threshold or aptitude estimate is supplied.",
      "zh": "不能。固定题本可能因记住答案而改变正确数。需要在新例题上核查独立推理，本页未提供经验证的变化阈值或能力估计。"
    }
  },
  {
    "question": {
      "en": "Does this include every ASVAB subject?",
      "zh": "这里包含全部ASVAB学科吗？"
    },
    "answer": {
      "en": "No. It covers AR, WK, PC and MK only. Science, electronics, auto/shop, mechanical and assembling-object content are outside these thirty-two questions.",
      "zh": "没有。这里只包含AR、WK、PC、MK。科学、电子、汽车与工坊、机械及物体拼合不在这三十二题内。"
    }
  }
];
