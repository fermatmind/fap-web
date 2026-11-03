import type { Text } from "@/lib/questionnaires/types";
export const pss4Sections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "purpose",
    "title": {
      "en": "PSS-4: a brief measure of past-month perceived stress",
      "zh": "PSS-4：过去一个月感知压力的简短自评"
    },
    "paragraphs": [
      {
        "en": "The Perceived Stress Scale concerns how stressful life situations feel, rather than counting events or measuring a biological stress response. This four-item form asks about perceived control over important matters, confidence in handling personal problems, things going your way and difficulties accumulating. These are four questions contributing to one total, not four independently validated domain scores. [1]",
        "zh": "感知压力量表关注生活情境被体验为有多大压力，不是统计事件数量，也不测生物应激反应。四题分别询问重要事情的控制感、处理个人问题的信心、事情是否如愿，以及困难累积的体验。这是汇入一个总分的四道题，不是四个独立验证的领域分数。[1]"
      },
      {
        "en": "The page retains the author-laboratory English questions and their five frequency choices. Chinese prompts and answer labels are an independent FermatMind translation, not the listed official China edition. The complete public guide can be read before answering; neither registration nor a target result is required.",
        "zh": "本页保留作者实验室的英文四题及五级频率选项。中文题干与回答标签为费马独立译文，不是所列官方China版本。作答前即可阅读完整公开指南，无需注册，也无需追求某个目标结果。"
      }
    ]
  },
  {
    "id": "frequency",
    "title": {
      "en": "Answer frequency over the month, not intensity today",
      "zh": "回答整个月的频率，而非今天的强度"
    },
    "paragraphs": [
      {
        "en": "Use the past month as the same reference for all four questions. Choose how often the described feeling or thought occurred, from Never to Very Often. The options do not specify an exact number of days, and the page does not convert them into daily counts, percentages or symptom intensity.",
        "zh": "四题均以过去一个月为同一参照，从“从不”到“非常频繁”选择所述感受或想法出现的频率。选项没有规定准确天数，页面也不把它们换成每日次数、百分比或症状强度。"
      },
      {
        "en": "Answer the positive questions in their ordinary meaning: confidence and things going your way can occur alongside difficult experiences. Do not reverse your answer yourself to express stress; the calculation reverses questions 2 and 3 afterwards. Uncertainty can remain a reason to stop and read without a score.",
        "zh": "正向题按原意回答：有信心、事情如愿，可以与困难体验同时存在。无需为了表达压力而自行反转回答；计算会在之后反向处理第2、3题。若无法判断，可以停止作答，无分阅读。"
      }
    ]
  },
  {
    "id": "arithmetic",
    "title": {
      "en": "PSS-4 scoring: reverse questions 2 and 3, then sum",
      "zh": "PSS-4计分：第2、3题反向，再相加"
    },
    "paragraphs": [
      {
        "en": "Let x1, x2, x3 and x4 be the selected values from 0 to 4. The total is x1 + (4 − x2) + (4 − x3) + x4, from 0 to 16. For example, 3, 1, 2 and 3 contribute 3, 3, 2 and 3, totaling 11. The result displays each contribution so that the arithmetic can be checked. [2]",
        "zh": "设x1、x2、x3、x4为所选0—4数值，总分为x1＋(4−x2)＋(4−x3)＋x4，范围0—16。例如选3、1、2、3，各贡献3、3、2、3，合计11。结果逐题展示贡献，便于复算。[2]"
      },
      {
        "en": "A total requires four valid choices on this website. An unanswered item is not zero, and no average or guessed value fills a gap. This complete-response policy belongs to the website; it is not presented as an author-approved missing-data procedure. You can leave at any point without obtaining a total.",
        "zh": "本站仅在四项选择均有效时生成总分。未回答不作零分，也不以均值或猜测补齐。这是网站完整作答策略，不冒充作者认可的缺失数据处理办法。任何时候都可以退出，不生成总分。"
      }
    ]
  },
  {
    "id": "interpretation",
    "title": {
      "en": "Read the raw total without inventing severity bands",
      "zh": "阅读原始总分，不另造严重度分档"
    },
    "paragraphs": [
      {
        "en": "Within this form, a larger total reflects more perceived stress in the four answers. The author laboratory states that PSS is not diagnostic and has no score cutoffs. Dividing 0–16 into thirds would divide the numerical range, not establish clinically validated low, medium and high categories. [1]",
        "zh": "在本题本内，较大总分表示四项回答反映更多感知压力。作者实验室明确说明PSS不用于诊断，也没有分数分界。把0—16分成三段，只是划分数值范围，不会建立经过临床验证的低、中、高类别。[1]"
      },
      {
        "en": "Different response patterns can have the same total. Choosing 0 for every question and choosing 4 for every question both produce 8 after reversal, although the answers describe different experiences. Eight is the numerical midpoint, not proof of average stress, a typical person or balanced coping.",
        "zh": "不同回答组合可以同分。每题都选0与每题都选4，反向处理后均为8分，但回答描述的体验不同。8是数值范围的中点，不是平均压力、典型人群或应对平衡的证明。"
      }
    ]
  },
  {
    "id": "versions",
    "title": {
      "en": "Four items, ten items and fourteen items are different forms",
      "zh": "四题、十题与十四题，是不同题本"
    },
    "paragraphs": [
      {
        "en": "PSS-4, PSS-10 and PSS-14 have different item sets and score ranges. The reverse keys must be identified within the actual form: questions 2 and 3 here are not the four reverse-keyed positions of PSS-10. Multiplying this total, or converting it to a percentage, does not recreate a longer-form score. [2]",
        "zh": "PSS-4、PSS-10与PSS-14的题目集合和总分范围不同。反向位置应按实际题本识别：本页第2、3题，不是PSS-10的四个反向位置。把本总分乘倍数或换成百分比，不能还原较长版本的分数。[2]"
      },
      {
        "en": "FermatMind’s separate original four-question monthly reflection also uses a 0–16 range, but has different questions and reverse keys. Equal lengths and ranges do not make the forms interchangeable. Keep the form, language and recall period identifiable when comparing records.",
        "zh": "费马另一份原创四题月度回顾也使用0—16范围，但题目与反向位置不同。题量、范围相同，不代表题本可以互换。比较记录时，应辨明题本、语言与回忆时段。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Research evidence must match the form, language and population",
      "zh": "研究证据应对应题本、语言与人群"
    },
    "paragraphs": [
      {
        "en": "Published research and the author laboratory provide the background for PSS. Reliability concerns consistency; validity concerns evidence supporting a particular interpretation or use. Neither follows merely from having four questions or a reproducible formula. Evidence for a longer form, another translation or a particular sample does not automatically validate this presentation. [1]",
        "zh": "已发表研究及作者实验室提供PSS的背景。信度关注一致性，效度关注某种解释或用途的证据；都不会仅因有四道题或公式可复算而成立。较长题本、另一译文或特定样本的证据，不会自动验证本页呈现。[1]"
      },
      {
        "en": "This page supplies no Chinese norms, population percentile, diagnostic threshold, separate coping-capacity score or individual reliable-change criterion. The Chinese wording remains identified as an independent translation. Historical reference samples cannot be treated as today’s website visitors or as a universal benchmark.",
        "zh": "本页不提供中文常模、人群百分位、诊断门槛、独立应对能力分数或个人可靠变化标准。中文持续标明独立译文；历史参照样本不能当作今天的网站访客，也不是通用基准。"
      }
    ]
  },
  {
    "id": "repeat",
    "title": {
      "en": "Repeated scores need the original timeframe and real context",
      "zh": "重测须保留原时间窗，并结合实际处境"
    },
    "paragraphs": [
      {
        "en": "If you repeat the form, it still asks about the past month. Completing it every week involves overlapping recall periods, not independent seven-day measurements. Keep the same form and language; note changes in circumstances privately if useful, without submitting a personal history here.",
        "zh": "再次使用时，仍回答过去一个月。每周完成会涉及重叠回忆时段，不是独立七日测量。宜保留同一题本和语言；有需要可私下留意处境变化，无需在这里提交个人史。"
      },
      {
        "en": "A difference in totals alone cannot establish meaningful recovery, deterioration or treatment effect. Demands, support, recall and interpretation may all vary. A concern affecting daily life may be discussed with a qualified professional without waiting for another score or meeting a numerical threshold.",
        "zh": "仅凭总分差异，不能确立有实际意义的恢复、恶化或治疗效果。实际要求、支持、回忆和理解都可能改变。若顾虑影响日常生活，可与合格专业人员讨论，无需再等一次分数或达到数值门槛。"
      }
    ]
  },
  {
    "id": "privacy",
    "title": {
      "en": "One start, a private calculation and an open guide",
      "zh": "一次开始、页内计算与公开指南"
    },
    "paragraphs": [
      {
        "en": "Start opens the first question directly. Four valid choices reveal the raw total, the four contributions and the full reading. Editing clears the displayed result before recalculation; exiting or retaking clears the relevant current record. No additional agreement is required to reach the questions.",
        "zh": "点击开始直接进入第一题。四项有效回答后，显示原始总分、四项贡献与完整读法。修改时先清除已展示结果，再重新计算；退出或重做清除当前相应记录。进入题目无需额外同意。"
      },
      {
        "en": "Answers and the total stay in current-page memory and are cleared on reload, language change or leaving. Copying shares only the fixed public guide title and URL, never the answers or total. No score decides access to the guide or whether someone deserves support.",
        "zh": "回答与总分仅留当前页内存，刷新、换语或离开清除。复制只分享固定公开指南标题与网址，不含回答或总分。任何分数都不决定能否阅读指南，或一个人是否值得获得支持。"
      }
    ]
  }
];
export const pss4Faq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Does 8 out of 16 mean average stress?",
      "zh": "8/16代表平均压力吗？"
    },
    "answer": {
      "en": "No. Eight is the arithmetic midpoint. Without a suitable reference sample, it is neither a population average nor a percentile. Different answer patterns can produce it.",
      "zh": "不是。8是算术中点，没有适用参照样本，就不是人群均值或百分位；不同回答组合都可能得到它。"
    }
  },
  {
    "question": {
      "en": "Should I reverse the positive questions when answering?",
      "zh": "回答正向题时要自己反转吗？"
    },
    "answer": {
      "en": "No. Answer how often confidence and things going your way occurred. The calculation reverses questions 2 and 3 automatically.",
      "zh": "无需。按有信心、事情如愿出现的频率作答。计算会自动反向处理第2、3题。"
    }
  },
  {
    "question": {
      "en": "Are Never and an unanswered question equivalent?",
      "zh": "“从不”和没回答是一回事吗？"
    },
    "answer": {
      "en": "No. Never is a valid frequency choice. A missing choice contributes nothing because no total is produced until all four responses are valid.",
      "zh": "不是。“从不”是有效频率选择；未答则不产生贡献，因为四项全部有效之前不生成总分。"
    }
  },
  {
    "question": {
      "en": "Does the total identify what caused my stress?",
      "zh": "总分能识别压力原因吗？"
    },
    "answer": {
      "en": "No. General appraisals do not identify particular events, biological mechanisms or a diagnosis. Circumstances and available resources need separate consideration.",
      "zh": "不能。一般性感受不能识别具体事件、生物机制或诊断；实际处境与可用资源仍需另行理解。"
    }
  },
  {
    "question": {
      "en": "Are confidence and control separate ability scores?",
      "zh": "信心与控制感是独立能力分数吗？"
    },
    "answer": {
      "en": "No. The four questions contribute to one raw total. The positive wording does not establish a separate validated measure of coping skill.",
      "zh": "不是。四题汇入一个原始总分；正向措辞不确立经过验证的独立应对技能测量。"
    }
  },
  {
    "question": {
      "en": "Can a PSS-10 cutoff be rescaled to PSS-4?",
      "zh": "PSS-10的分界能按比例用于PSS-4吗？"
    },
    "answer": {
      "en": "No. The items and score ranges differ. Scaling a number cannot transfer validation, norms or cutoffs from one form to another.",
      "zh": "不能。题目与范围不同，缩放数字不能把验证结论、常模或分界移到另一题本。"
    }
  },
  {
    "question": {
      "en": "Is a lower retest total proof that an intervention worked?",
      "zh": "重测分数下降证明干预有效吗？"
    },
    "answer": {
      "en": "No. A before-and-after difference alone cannot separate an intervention from recall, circumstances or measurement variation. This page supplies no individual reliable-change threshold.",
      "zh": "不能。前后差异本身无法分离干预、回忆、处境或测量波动；本页未提供个人可靠变化阈值。"
    }
  },
  {
    "question": {
      "en": "Can I read the complete guide without giving answers?",
      "zh": "不提交回答能读完整指南吗？"
    },
    "answer": {
      "en": "Yes. The fixed guide is fully public before answering and after exit. It contains no visitor’s answers or personal total.",
      "zh": "可以。固定指南在作答前与退出后均完整公开，不含任何访客的回答或个人总分。"
    }
  }
];
