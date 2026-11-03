import type { Questionnaire } from "@/lib/questionnaires/types";

export const problemSolvingLandingSections: Questionnaire["guide"] = [
  {
    "id": "critical-task",
    "title": {
      "zh": "问题解决与批判性思维：行动过程与理由核查",
      "en": "Problem solving and critical thinking: action and justification"
    },
    "paragraphs": [
      {
        "zh": "问题解决关注怎样从当前状态走向目标，批判性思维关注采用某个判断或行动的理由是否充分。批判性思维的教育定义涉及对信息、假设与结论的分析和评价，而不只是反对别人的观点。[2] 本页把两者结合为30道校园与日常情境单选：先读目标和条件，再判断哪项回应有依据。",
        "en": "Problem solving concerns moving from a current situation towards a goal; critical thinking examines whether a judgment or action has adequate justification. Educational definitions involve evaluating information, assumptions and conclusions rather than merely disagreeing.[2] This page combines these concerns in thirty school and everyday multiple-choice cases: read the goal and conditions before selecting a supported response."
      },
      {
        "zh": "三组各十题交错呈现：问题解决步骤练界定、证据、备选和落实；决策工具练限制、权重、同口径比较及解释；复盘与学习练指标、反例和结论范围。它们是本题组的复习分类，不能据此认定心理学已经验证了三个独立能力维度。",
        "en": "Three interleaved ten-item groups organize revision: problem-solving steps covers definition, evidence, alternatives and implementation; decision tools covers constraints, weights, comparable quantities and explanations; review and learning covers measures, counterexamples and scope. These are editorial groupings for this bank, not three independently validated psychological abilities."
      }
    ]
  },
  {
    "id": "critical-baseline",
    "title": {
      "zh": "界定问题：先保留事实、范围与未知",
      "en": "Define the problem: preserve facts, scope and unknowns"
    },
    "paragraphs": [
      {
        "zh": "把观察、解释和方案分别写清。某批资料出现错误，首先说明检查了什么、错在哪里、涉及多少；“有人不认真”属于原因判断，“换工具”属于干预方案，二者都不能替代现场记录。资料不足时，缺失信息本身也是需要保留的结论。",
        "en": "Separate observations, explanations and proposals. When reviewing errors, record what was checked, what went wrong and how many items were affected. Attributing carelessness is a causal explanation and changing tools is an intervention; neither replaces the observed record. Missing information remains part of the conclusion."
      },
      {
        "zh": "独立新例：复查18张借阅卡，5张缺归还日期。可以记录“已查18张中5张缺日期”，但尚不能说明全部借阅卡的缺失率、谁造成缺失或应换哪套系统。若名册总共22张，还应标明4张未检查，而不是默认它们合格。",
        "en": "Fresh example: five of eighteen inspected borrowing cards lack a return date. That supports a count within the inspected set, not the rate across every card, the person responsible or a particular system replacement. If the inventory contains twenty-two cards, four remain uninspected rather than automatically compliant."
      }
    ]
  },
  {
    "id": "critical-feasibility",
    "title": {
      "zh": "比较方案：必需限制与偏好权重分别处理",
      "en": "Compare plans: distinguish mandatory constraints from weighted preferences"
    },
    "paragraphs": [
      {
        "zh": "必须满足的条件先判断可行性，再按题定偏好比较。加权总分适用于已经给定权重与分项分数的模型；高总分不能自动抵消另一个必须条件失败。不同权重可能选出不同方案，计算正确与权重是否适合现实任务是两个问题。",
        "en": "Check mandatory constraints before optimizing a declared preference. Weighted totals apply to supplied weights and component scores; a high total does not automatically compensate for a failed requirement. Changing weights can change the selected plan. Correct arithmetic and suitable real-world priorities are separate questions."
      },
      {
        "zh": "独立新例：预算至多40、时间至多35，A为(38,32)、B为(42,26)、C为(30,36)，只有A满足两项。另在不附加这些限制的评分表中，总分为2×清晰度＋耐用度：L=(4,2)得10，M=(3,5)得11，M最高。若清晰度权重改为4，则L得18、M得17，选择反转。",
        "en": "Fresh example: with budget at most forty and time at most thirty-five, A=(38,32), B=(42,26), C=(30,36) leaves only A feasible. In a separate worksheet without those constraints, score=2×clarity+durability gives L=(4,2) ten and M=(3,5) eleven, selecting M. Changing the clarity weight to four gives L eighteen and M seventeen, reversing the choice."
      }
    ]
  },
  {
    "id": "critical-units",
    "title": {
      "zh": "数量比较：期间、分母与变化单位保持一致",
      "en": "Quantitative comparisons: align periods, denominators and change units"
    },
    "paragraphs": [
      {
        "zh": "比较报价时同时检查期间和一次性费用；比较表现时先算同定义的率，再说明差异单位。百分点是两个百分率的差，相对变化另以原率作分母。不要用其中一个数字回答另一个问题，也不要由正确算术直接推断改善原因。",
        "en": "Compare offers over the same period with the relevant one-off fees. Compare performance using consistently defined rates and name the change unit. Percentage points subtract two percentage rates; relative change uses the original rate as denominator. Neither quantity substitutes for the other or establishes why performance changed."
      },
      {
        "zh": "独立新例：每月17代币、一次设置费8，三个月为3×17＋8＝59。另一份记录先有40项错8项、后有80项错8项：错误数没变，错误率从20%变为10%，下降10个百分点，相对下降50%。两次任务构成、难度或记录方法变化仍可能影响比较。",
        "en": "Fresh example: seventeen tokens per month plus an eight-token setup fee totals 3×17+8=59 for three months. Another record has eight errors in forty items followed by eight in eighty. Error counts stay equal, rates fall from twenty to ten percent: ten percentage points or a fifty-percent relative reduction. Task mix, difficulty or recording changes may still affect interpretation."
      }
    ]
  },
  {
    "id": "critical-evidence",
    "title": {
      "zh": "证据与因果：区分先后、样本和排他解释",
      "en": "Evidence and causation: separate sequence, sampling and exclusive explanations"
    },
    "paragraphs": [
      {
        "zh": "前后变化支持观察到的差异，未必排除同时变化的其他因素；志愿回答者的多数也不是未调查总体的多数。“尚不能证明”同时保留多种可能，不等于已经证伪干预。题目中的唯一答案来自明确的证据范围，而不是要求在所有开放问题上都选最保守说法。",
        "en": "A before-and-after difference need not exclude concurrent changes. A majority among volunteers need not be a majority in an unobserved population. Failure to establish an effect leaves alternatives open rather than disproving the intervention. A keyed response follows the stated evidence boundary; it is not a rule to choose the most cautious wording in every open problem."
      },
      {
        "zh": "独立新例：10名志愿者中7人支持新菜单，只能说该10人中7人支持。若菜单更换后剩餐减少，同时份量也变小，记录尚未分清菜单与份量的作用。后续应先明确想估计什么、怎样比较和哪些条件可能混淆，不把“再收集数据”当作无需设计的万能动作。",
        "en": "Fresh example: seven of ten volunteers support a new menu, establishing that proportion among those ten. If leftovers decline after the menu changes while portions also shrink, the record has not separated menu and portion effects. A follow-up needs a clear target, comparison and potential confounders; simply collecting more data is not a complete design."
      }
    ]
  },
  {
    "id": "critical-models",
    "title": {
      "zh": "检验解释与反例：判断哪些结论在所有允许情形下成立",
      "en": "Tests and counterexamples: check conclusions across allowed cases"
    },
    "paragraphs": [
      {
        "zh": "有限模型里，能区分两个假设的测试必须对它们给出不同预测；若预测相同，看到结果仍无法区分。对“每个都符合”的主张，一个已核实反例就足够推翻全称，却不告诉你其余对象的状态。现实调查还要考虑模型外原因和观察误差。",
        "en": "Within a finite model, a distinguishing test makes different predictions under competing hypotheses; identical predictions leave the alternatives unresolved. One verified exception refutes a universal claim without determining every remaining case. Real investigations additionally face omitted causes and observation error."
      },
      {
        "zh": "独立新例：H1、H2对X分别预测红、蓝，对Y都预测绿，因此X能在此模型内区分，Y不能。另有六张卡，一张已知不合格、五张未知；五个未知有32种合格/不合格分配，全部分配中“六张全合格”都为假，但“不合格恰好一张”只在其中一种分配成立。",
        "en": "Fresh example: H1 predicts red and H2 blue for X, while both predict green for Y. X distinguishes them within this model, Y does not. For six cards with one known failure and five unknown, thirty-two pass/fail assignments remain. All refute universal compliance, but exactly one failure holds in only one assignment."
      }
    ]
  },
  {
    "id": "critical-implementation",
    "title": {
      "zh": "从计划到复盘：行动证据与结果证据分别记录",
      "en": "From plan to review: distinguish implementation from outcome evidence"
    },
    "paragraphs": [
      {
        "zh": "计划要说清做什么、谁负责、何时执行；开会同意不等于已经实施。实施记录说明动作发生，结果记录才帮助判断是否达到事先指标。完整的问题解决过程可能来回修订；本题给定的步骤顺序只在相应题目里使用。",
        "en": "A plan identifies an action, owner and time. Agreement is not implementation. An implementation record shows that an action occurred; outcome evidence addresses a previously defined criterion. Problem solving may revisit earlier steps, while a supplied sequence governs only the item that specifies it."
      },
      {
        "zh": "独立新例：规定至少4次试行、至多3次漏记；做4次且漏3次满足包含边界，做3次且零漏记仍未满足次数要求。如果只记“大家同意试行”，就连实施证据也不足。复盘可记录具体缺口及下一次核查，而非从一次失误推断固定人格。",
        "en": "Fresh example: a rule requires at least four trials and at most three omissions. Four trials with three omissions meets both inclusive limits; three trials with none still fails the trial-count requirement. A note saying everyone agreed does not establish implementation. Review the specific gap and next check rather than inferring a fixed personal trait."
      }
    ]
  },
  {
    "id": "critical-scores",
    "title": {
      "zh": "怎样读30题结果：正确数、复习分类与全部指南",
      "en": "Reading the thirty-item result: counts, revision groups and complete guides"
    },
    "paragraphs": [
      {
        "zh": "每题与答案匹配记1，其他有效选择记0；三组各0–10，总数0–30，没有速度加分或扣分。30题全部有效作答后才生成完整结果。三组题目交错，不按连续十题分组；应依实际主题查看分项，不能从屏幕顺序推算分类。",
        "en": "A keyed response scores one and another valid choice zero: three counts from zero to ten and a total from zero to thirty, without speed bonuses or penalties. Complete all thirty valid responses. Topics are interleaved rather than consecutive ten-question blocks; use their actual group assignments."
      },
      {
        "zh": "零分、部分答对和全对均开放全部所选、正确答案与30条解析，以及三篇各八节、共24节完整复习指南。相同总数可能来自不同错题，某组较高也未控制题目难度、阅读或熟悉程度。先从具体题目找出漏条件、换单位或添假设的位置。",
        "en": "Zero, partial and perfect attempts all open selections, keys and thirty explanations, plus three full eight-section guides totaling twenty-four sections. Equal totals can conceal different errors. Group comparisons do not control difficulty, reading or familiarity. Locate the specific omitted constraint, changed unit or added assumption."
      }
    ]
  },
  {
    "id": "critical-transfer",
    "title": {
      "zh": "研究背景与练习迁移：把新材料作为下一次核查",
      "en": "Research context and transfer: use fresh material for the next check"
    },
    "paragraphs": [
      {
        "zh": "OECD的问题解决研究考察非例行任务；其评估人群、交互任务和分析并不等同于本页固定单选练习。[3] 教育主题与批判性思维定义可帮助说明内容范围，却不能替本站题本提供常模、年级达标或有效性证明。题目核算正确也不等于已经证明教育效果。",
        "en": "OECD problem-solving research addresses non-routine situations; its population, interactive tasks and analyses differ from this fixed multiple-choice exercise.[3] Educational topics and critical-thinking definitions inform scope without validating this bank, establishing norms or certifying grade attainment. Correct calculations do not establish instructional effectiveness."
      },
      {
        "zh": "看过解析后重做同题，正确数提高可能包含记忆。可换一组虚构数据，说明哪些条件改变、为什么结论改变，再用未见材料检查理由是否仍成立。英中版本表达相同任务目标；没有跨语言等值研究，不比较两种语言下的细小分差，也不据此推断语言能力。",
        "en": "Retaking familiar questions after reading explanations can involve memory. Change a fictional input, explain which condition changes the conclusion, and check the reasoning on unseen material. English and Chinese express the same task goals, without a cross-language equating study; small differences do not diagnose language ability."
      }
    ]
  }
];

export const problemSolvingLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "问题解决和批判性思维有什么区别？",
      "en": "How do problem solving and critical thinking differ?"
    },
    "answer": {
      "zh": "前者关注达成目标的过程，后者核查判断与行动的证据、假设和理由。本题练习将两者结合，三组分类用于复习，不是三个已验证能力分量表。[2]",
      "en": "Problem solving concerns reaching a goal; critical thinking examines evidence, assumptions and reasons. This exercise combines them in three revision groups, not validated ability subscales.[2]"
    }
  },
  {
    "question": {
      "zh": "三组题目是连续排列的吗？",
      "en": "Are the three topic groups consecutive?"
    },
    "answer": {
      "zh": "不是。三组各十题交错呈现，分项按题目实际主题计数，不能把前十题当作第一组。",
      "en": "No. Three ten-item groups are interleaved. Section counts use the assigned topic, not consecutive blocks."
    }
  },
  {
    "question": {
      "zh": "错误数相同，为什么错误率可能不同？",
      "en": "Why can equal error counts give different error rates?"
    },
    "answer": {
      "zh": "分母可能不同。8/40是20%，8/80是10%；差10个百分点，相对减少50%。必须同时记录任务数、指标定义和条件。",
      "en": "Denominators may differ: eight of forty is twenty percent, eight of eighty ten percent. The gap is ten percentage points, a fifty-percent relative reduction. Retain counts, definitions and conditions."
    }
  },
  {
    "question": {
      "zh": "加权总分高就能忽略必需限制吗？",
      "en": "Can a higher weighted total override a mandatory limit?"
    },
    "answer": {
      "zh": "不能自动这样处理。先检查题目明确的必需条件，再按可行方案中的偏好或给定权重比较。",
      "en": "Not automatically. Check stated requirements before comparing preferences or supplied weighted totals among feasible options."
    }
  },
  {
    "question": {
      "zh": "一个反例能说明其余对象都不合格吗？",
      "en": "Does one counterexample show that every other case fails?"
    },
    "answer": {
      "zh": "不能。它可以否定“全部合格”，其余状态仍需逐项证据。不要从全称为假跳到全称反面为真。",
      "en": "No. It refutes universal compliance while leaving the remaining cases unresolved. Negating all does not establish none."
    }
  },
  {
    "question": {
      "zh": "为什么这里不提供百分位或学生能力等级？",
      "en": "Why are there no percentiles or student ability bands?"
    },
    "answer": {
      "zh": "本题组没有对应常模、校准和教育用途验证。正确数描述本次30题作答，不支持学生排名、年级诊断、课程达标或录用判断。",
      "en": "This bank lacks the relevant norms, calibration and educational-use validation. Counts describe this attempt, without student ranking, grade diagnosis, curriculum certification or hiring conclusions."
    }
  },
  {
    "question": {
      "zh": "怎样把解析用到新的问题上？",
      "en": "How can I use an explanation on a new problem?"
    },
    "answer": {
      "zh": "先写出原题依据，再改变一个条件，检查原结论是否仍成立；接着独立解未见新题。背答案字母不能替代迁移证据。",
      "en": "Identify the original justification, vary a condition and check whether the conclusion survives. Then solve unseen material independently. Remembered option letters do not establish transfer."
    }
  },
  {
    "question": {
      "zh": "可以比较中文与英文的分数吗？",
      "en": "Can Chinese and English scores be compared?"
    },
    "answer": {
      "zh": "两版呈现相同任务目标，但没有跨语言等值或常模研究。阅读、术语熟悉度和先前作答都可能影响结果，宜按具体题目复盘。",
      "en": "The versions express the same task goals but lack cross-language equating or norms. Reading, terminology and prior exposure may affect responses; review the actual items."
    }
  }
];

export const problemSolvingLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Foundation for Critical Thinking：概念、理由与反思",
      "en": "Foundation for Critical Thinking: definitions and reflective reasoning"
    },
    "url": "https://www.criticalthinking.org/pages/defining-critical-thinking/766"
  },
  {
    "title": {
      "zh": "OECD（2014）：PISA问题解决研究概述",
      "en": "OECD (2014): overview of PISA problem-solving research"
    },
    "url": "https://www.oecd.org/en/publications/pisa-2012-results-skills-for-life-volume-v_9789264208070-en.html"
  }
];
