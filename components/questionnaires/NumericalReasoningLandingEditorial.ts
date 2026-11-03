import type { Questionnaire } from "@/lib/questionnaires/types";

export const numericalReasoningLandingSections: Questionnaire["guide"] = [
  {
    "id": "numerical-scope",
    "title": {
      "zh": "数值推理测试练什么？五类任务与30道原创题",
      "en": "What does numerical reasoning practice cover? Five areas and thirty original tasks"
    },
    "paragraphs": [
      {
        "zh": "数值推理不仅是算出一个数，还要判断该用哪些数据、采用什么运算，以及答案对应什么单位。本页分为基础运算、百分比、比例、数据判读与速率五组，每组六题。题目用文字和明确列出的数值呈现情境，不包含交互图表、图像读数或数列找规律。",
        "en": "Numerical reasoning involves selecting relevant data and operations as well as calculating an answer with the right unit. This bank has six original items each in arithmetic, percentages, ratios, data interpretation and rates. Tasks use text and explicitly supplied numbers, without interactive charts, reading values from images or number-series pattern finding."
      },
      {
        "zh": "本页可使用纸笔与计算器，没有倒计时、速度加权或答错倒扣。约18分钟只是编辑估计，不是限时或实测平均用时。完成30题后，全部答案、逐题理由和五份完整复习指南均免费开放；这些练习内容分组不代表已经建立五个经验证的能力分量表。",
        "en": "Paper and a calculator are allowed, with no countdown, speed weighting or penalty for an incorrect answer. About eighteen minutes is an editorial estimate, not a limit or observed average. All keys, rationales and five complete revision guides are free after thirty responses. The five content groups are not established, validated ability subscales."
      }
    ]
  },
  {
    "id": "numerical-process",
    "title": {
      "zh": "从问题到算式：先确定目标，再检查答案",
      "en": "From question to calculation: identify the target and check the result"
    },
    "paragraphs": [
      {
        "zh": "可先写出所求量、有关数据和单位，再列算式，最后检查数量级与题意。例如求每小时产量时，分子应是产量，分母应是题目所指的小时数；若时间包含停机，不能自行只用开机时间。题目给定的恒定速度、同时工作与虚构单位都是运算条件，不能默默换成现实中另一种假设。",
        "en": "Write the target quantity, relevant data and units before forming an expression, then check magnitude and meaning. For output per hour, the numerator is output and the denominator is the hours specified. If elapsed time includes a stoppage, do not silently use only operating time. Constant rates, simultaneous operation and fictional units are stated mathematical assumptions, not invitations to substitute real-world assumptions."
      },
      {
        "zh": "OECD的PIAAC第二周期数感框架区分识别情境中的数学、使用数学以及评估和反思结果，并强调这些过程相互联系。[3] 这为阅读数值问题提供概念背景；本站没有施测PIAAC，也没有采用其题目、量尺或国际常模。本页的具体结果仍是本次30题的正确数。",
        "en": "The OECD PIAAC Cycle 2 numeracy framework connects identifying mathematics in a situation, using it, and evaluating the outcome.[3] This supplies conceptual context, not a claim that this page administers PIAAC or uses its items, scale or international norms. Results here remain counts of correct responses to this thirty-item bank."
      }
    ]
  },
  {
    "id": "numerical-percent",
    "title": {
      "zh": "百分比的关键是基数：变化率、百分点与连续变化",
      "en": "The base matters: relative change, percentage points and successive changes"
    },
    "paragraphs": [
      {
        "zh": "另设某数量从160变为200。增加40相对于原来的160是25%，不能除以新值200而称增加20%。若占比从20%变为25%，差为5个百分点，相对增幅则是5÷20＝25%。一个回答占比差，另一个回答相对于原占比变化多少；写出分母可避免把两种问题混用。",
        "en": "If a quantity rises from 160 to 200, the increase of 40 is 25% of the original 160. Dividing by the new 200 does not make it a 20% increase. A share rising from 20% to 25% increases by five percentage points and by 25% relative to the original share. These answer different questions; writing the denominator keeps them distinct."
      },
      {
        "zh": "连续变化应更新基数：另设600先增加10%再减少10%，结果为600×1.10×0.90＝594，净减1%，不是回到600。已知部分求整体则倒推，例如84占整体35%，整体为84÷0.35＝240。百分比应用先认整体与部分，再决定乘或除；OpenStax的相关章节提供这种基数关系的教学说明。[1]",
        "en": "Successive changes use updated bases: 600 increased by 10% and then reduced by 10% becomes 600×1.10×0.90＝594, a net 1% decrease. To recover a whole, reverse the relationship: if 84 is 35%, the whole is 84÷0.35＝240. Identify whole and part before choosing multiplication or division; OpenStax provides instruction on this base relationship.[1]"
      }
    ]
  },
  {
    "id": "numerical-ratios",
    "title": {
      "zh": "比例不是直接相加：统一份数与中间量",
      "en": "Ratios require a shared scale or a common middle quantity"
    },
    "paragraphs": [
      {
        "zh": "另把119件按2∶5分配，总份数为7，每份17，因此两部分为34与85。先把部分相加核回119，再核34∶85可约为2∶5。这里2与5是相对份数，不是数量，也不能把其中一个直接当成整体的百分比。",
        "en": "To split 119 items in the ratio 2:5, there are seven shares of seventeen, giving 34 and 85. Check both that they sum to 119 and that 34:85 reduces to 2:5. The ratio terms are relative shares, neither item counts nor percentages of the whole by themselves."
      },
      {
        "zh": "链式比例要让共同量一致。若A∶B＝4∶5且B∶C＝3∶7，将前一组乘3、后一组乘5，得到A∶B∶C＝12∶15∶35，所以A∶C＝12∶35。配方或产量缩放同样先确认是否正比例；题面若未保证可相加或速率恒定，就不能自动套用。",
        "en": "For A:B＝4:5 and B:C＝3:7, multiply the first pair by three and the second by five to obtain A:B:C＝12:15:35, hence A:C＝12:35. Scaling a recipe or output also requires a proportional relationship. Do not automatically assume additivity or constant rates when a prompt has not supplied them."
      }
    ]
  },
  {
    "id": "numerical-data",
    "title": {
      "zh": "合并数据怎样算？把分母、权重和单位一起保留",
      "en": "Combining data: preserve denominators, weights and units"
    },
    "paragraphs": [
      {
        "zh": "另设12条记录的平均值为15，另外28条平均值为25。合并均值为（12×15＋28×25）÷40＝22，而不是两个均值直接平均得到20。平均值反映总量除以记录数，样本量不同就要保留各自的权重。求合计时也先看表头单位，“千件”中的2.5应解释为2500件。",
        "en": "If twelve records average fifteen and another twenty-eight average twenty-five, the combined mean is (12×15＋28×25)÷40＝22, not the unweighted average of twenty. A mean is total divided by count, so unequal group sizes retain their weights. Check header units before summing: 2.5 in thousands of items represents 2,500 items."
      },
      {
        "zh": "另设互不重叠的两组分别有50人与150人，所求事件占20%与40%。合并为（50×20%＋150×40%）÷200＝35%，不是30%。合并前需确认事件定义、期间与人群口径相同且没有重复计算。本题数据是虚构条件；算对占比并不能解释现实中差异的原因。",
        "en": "For disjoint groups of fifty and one hundred fifty with event rates of 20% and 40%, the pooled rate is (50×20%＋150×40%)÷200＝35%, not 30%. Pool only when event definitions, periods and populations align and duplication is absent. These tasks supply fictional conditions; correctly computing a rate does not explain a real-world cause."
      }
    ]
  },
  {
    "id": "numerical-rates",
    "title": {
      "zh": "速率与换算：方向、时间单位和同时工作",
      "en": "Rates and conversion: direction, time units and simultaneous work"
    },
    "paragraphs": [
      {
        "zh": "另设168千米用时2小时48分钟，48分钟是0.8小时，因此平均速度为168÷2.8＝60千米/小时。2小时48分钟不能写成2.48小时。若两个独立设备同时以每分钟6页与9页恒速工作8分钟，合计为（6＋9）×8＝120页；这里并行与恒速是必要条件。",
        "en": "Traveling 168 km in two hours forty-eight minutes gives 168÷2.8＝60 km/h, since forty-eight minutes is 0.8 hours, not 0.48. Two independent machines working simultaneously for eight minutes at constant rates of six and nine pages per minute produce (6＋9)×8＝120 pages. Simultaneity and constant rates are essential assumptions."
      },
      {
        "zh": "单位换算可用单位消去检查方向：另设1P＝2.4Q，则180Q÷（2.4Q/P）＝75P，反向核对75P×2.4Q/P＝180Q。若问一定路程的平均速度，应以总路程除以总时间，而不是不加判断地平均每段速度；每段时间不同，其权重也不同。",
        "en": "Use unit cancellation to check conversion direction. If 1P＝2.4Q, then 180Q÷(2.4Q/P)＝75P; multiplying back gives 180Q. Average speed over a journey is total distance divided by total time, not an automatic arithmetic mean of segment speeds. Unequal durations imply unequal weights."
      }
    ]
  },
  {
    "id": "numerical-rounding",
    "title": {
      "zh": "计算器与舍入：保留精度，最后按要求取值",
      "en": "Calculator use and rounding: retain precision until the requested final step"
    },
    "paragraphs": [
      {
        "zh": "另设两组占比分别为6/7与4/7。差为2/7×100＝28.571…个百分点；若此例要求保留一位小数，最终为28.6个百分点。先把各组随意截成85.7%与57.1%再相减，可能在其他数字组合中积累舍入误差。本站题目只在明确要求的最后一步舍入，其余按题面给定的准确值计算。",
        "en": "For proportions 6/7 and 4/7, the difference is 2/7×100＝28.571… percentage points. If this example requests one decimal place, the final answer is 28.6 percentage points. Arbitrarily rounding each rate first can accumulate error with other combinations. In this bank, round only at the explicitly requested final step; otherwise use the stated exact quantities."
      },
      {
        "zh": "纸笔可记录式子与单位，计算器可核对小数乘除，但不能替你选择增长率基数或数据分母。复习时保留一行可追踪的算式，定位是理解目标、抄数、单位、运算还是舍入出了差错。正式测试的工具规定各不相同，应以实际组织方说明为准，不将本站允许计算器推及其他测验。",
        "en": "Paper can retain expressions and units; a calculator can verify decimal arithmetic but cannot select a growth base or population denominator. Keep a traceable expression during review to distinguish target interpretation, transcription, units, arithmetic and rounding errors. Tool rules differ across formal assessments; permission here does not establish permission elsewhere."
      }
    ]
  },
  {
    "id": "numerical-results",
    "title": {
      "zh": "怎样阅读结果？正确数、完整解析与证据范围",
      "en": "Reading results: counts, full rationales and the evidence available"
    },
    "paragraphs": [
      {
        "zh": "完整结果给出总计0—30题正确、五组各0—6题正确，以及每题所选、答案与理由。总计15/30只表示本题本答对一半；同一总数可能来自不同分项，没有人群百分位、IQ、招聘通过线或能力等级。规则与键可逐题复算，仍不能替代信度、效度、难度校准及中英文等值研究。",
        "en": "The complete result gives zero to thirty correct overall, zero to six in each group, and every selection, key and rationale. Fifteen out of thirty means half this bank was correct. Equal totals may have different section patterns, with no population percentile, IQ conversion, employer pass mark or ability grade. Reproducible keys do not replace reliability, validity, difficulty calibration or bilingual equivalence research."
      },
      {
        "zh": "可在读完解析后换一组数字独立列式，再比较错误发生在哪一步。重做相同30题会混入答案记忆，不能仅凭分数上升断定一般能力提高。SHL的官方练习页也提醒练习难度未必等同正式测试。[2] 开始按钮直接进入题目；不要求账户、邮箱、付款或再次同意，临时保存仅在主动选择后启用。",
        "en": "After reviewing a rationale, try new numbers and construct the expression independently, comparing where errors arise. Repeating the same thirty introduces answer memory; higher counts alone do not establish improved general ability. SHL likewise notes that practice difficulty may differ from a live assessment.[2] Start opens the questions directly without an account, email, payment or another agreement step; temporary saving is optional."
      }
    ]
  }
];

export const numericalReasoningLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "数值推理和数列推理是同一份题吗？",
      "en": "Is this the same as number-series reasoning?"
    },
    "answer": {
      "zh": "不是。本页30题涵盖运算、百分比、比例、数据与速率；不要求从数列猜下一项，也不包含从图像读数的任务。",
      "en": "No. These thirty tasks cover arithmetic, percentages, ratios, data and rates, without predicting number-series terms or reading values from images."
    }
  },
  {
    "question": {
      "zh": "增长率为什么要除以原来的数？",
      "en": "Why divide a growth amount by the original value?"
    },
    "answer": {
      "zh": "增长率比较变化量相对于起点的大小。先算新值减原值，再除以原值；若题目问新值中增加部分的占比，则是另一个分母和问题。",
      "en": "A growth rate compares the change with its starting base: subtract the original from the new value, then divide by the original. The increase as a share of the new total is a different question with a different denominator."
    }
  },
  {
    "question": {
      "zh": "百分点和相对百分比怎样区分？",
      "en": "How do percentage points differ from relative percentages?"
    },
    "answer": {
      "zh": "两个百分数直接相减得到百分点；相对变化还要除以原来的占比。20%到25%是增加5个百分点，相对增加25%。",
      "en": "Subtracting percentages gives percentage points. Relative change divides that difference by the original share. From 20% to 25% is five percentage points and a 25% relative increase."
    }
  },
  {
    "question": {
      "zh": "两个平均数或占比能直接平均吗？",
      "en": "Can two means or rates simply be averaged?"
    },
    "answer": {
      "zh": "只有对应权重相等且口径可比时才适合直接平均。样本量不同时，先还原各组总量或事件数，再除以合并后的总数，并核对重复与单位。",
      "en": "Only with equal relevant weights and comparable definitions. For unequal group sizes, recover totals or event counts, divide by the pooled count and check duplication and units."
    }
  },
  {
    "question": {
      "zh": "时间越短或心算越快，本站分数越高吗？",
      "en": "Does finishing faster or doing mental arithmetic earn more points?"
    },
    "answer": {
      "zh": "不会。本页不计时，不给速度加分；纸笔与计算器均可使用。每题只按选项是否正确记1或0，18分钟不是通过要求。",
      "en": "No. There is no timer or speed bonus, and paper and a calculator are allowed. Each item earns one or zero according to correctness; eighteen minutes is not a passing requirement."
    }
  },
  {
    "question": {
      "zh": "什么时候应该保留小数或舍入？",
      "en": "When should I retain decimals or round?"
    },
    "answer": {
      "zh": "保留题面给定值与中间精度，只在题目明确指定的最终步骤舍入；同时写清百分比、百分点及其他单位，不把未要求的近似值当准确答案。",
      "en": "Preserve supplied values and intermediate precision, rounding only at the final step explicitly requested. Retain percent, percentage-point and other units, and do not treat an unrequested approximation as exact."
    }
  },
  {
    "question": {
      "zh": "正确数可以诊断计算障碍或换算国际等级吗？",
      "en": "Can a correct count diagnose dyscalculia or yield an international level?"
    },
    "answer": {
      "zh": "不能。该原创练习没有诊断阈值、国际常模或能力等级换算。若要理解长期学习困难，需要结合学习史与适当专业评估，而不是据这30题下结论。",
      "en": "No. This original practice has no diagnostic thresholds, international norms or level conversion. Understanding persistent learning difficulties requires learning history and appropriate professional assessment rather than conclusions from these thirty tasks."
    }
  },
  {
    "question": {
      "zh": "零题正确还能阅读全部解析吗？",
      "en": "Are all explanations accessible with zero correct?"
    },
    "answer": {
      "zh": "可以。完成全部30题后，30道答案解析和五份各七节完整指南均免费开放；不按分数锁内容，也不要求邮箱、付款或再次同意。",
      "en": "Yes. After all thirty responses, all thirty explanations and five seven-section guides are free regardless of score, without email, payment or another agreement step."
    }
  }
];

export const numericalReasoningLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "OECD：PIAAC第二周期数感框架，认知过程部分",
      "en": "OECD: PIAAC Cycle 2 numeracy framework, cognitive processes"
    },
    "url": "https://www.oecd.org/en/publications/the-assessment-frameworks-for-cycle-2-of-the-programme-for-the-international-assessment-of-adult-competencies_4bc2342d-en/full-report/component-6.html"
  }
];
