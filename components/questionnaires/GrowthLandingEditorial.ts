import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Entry context; source-bound questions, readings and reports remain unchanged. */
export const growthLandingSections: QuestionnaireSection[] = [
  {
    "id": "growth-construct",
    "title": {
      "zh": "成长型思维是什么？能力可改变性的信念与本页参照",
      "en": "What is growth mindset? Changeability beliefs and this page’s reference"
    },
    "paragraphs": [
      {
        "zh": "成长型思维与固定型思维讨论的是：人怎样理解某种能力是否可以发展。研究中也称增量观与实体观，属于对属性性质的信念。它与“我今天能不能完成任务”的信心、实际会多少技能、已经投入多少练习不同；这些变量可能有关联，但不能从一种回答直接推算另一种。[1]",
        "en": "Growth and fixed mindsets concern beliefs about whether an ability can develop. Research also uses incremental and entity theories: beliefs about the nature of an attribute. These differ from confidence about completing today’s task, demonstrated skill and practice already undertaken. The variables may relate, but one response cannot supply the others.[1]"
      },
      {
        "zh": "本站将参照收窄到你选定的一项普通学习技能，例如练一种绘画技法或学习表格公式。12条围绕起点、方法、具体反馈、反复困难及支持条件提问；它们合成一个连续读法，没有五种学习者或两个胜负阵营。另一项技能可能有不同经历和看法，不能把本次均分推广到所有学习领域。",
        "en": "This page narrows the reference to one ordinary learning skill you select, such as a drawing technique or spreadsheet formulas. Twelve statements concern starting points, methods, specific feedback, recurring difficulty and support. They produce one continuous reading, without learner types or competing camps. Another skill may involve different experiences and beliefs; this mean is not generalized across all learning domains."
      }
    ]
  },
  {
    "id": "growth-reverse-example",
    "title": {
      "zh": "12题怎样反向计分？从原回答到有效均分",
      "en": "How are twelve items reverse scored? From responses to a rated mean"
    },
    "paragraphs": [
      {
        "zh": "第1、3、5、7、9、11题直接使用1—5的有效评分；第2、4、6、8、10、12题按6减原回答翻转。例如第1题选4，记4；第2题选2，记6−2＝4。两题表达方向不同，反向处理使较高计分一致指向本题表述中的可改变看法，不代表你多选“同意”就得高分。",
        "en": "Items 1, 3, 5, 7, 9 and 11 retain valid ratings of one through five. Items 2, 4, 6, 8, 10 and 12 use six minus the response. For example, item one rated four contributes four; item two rated two contributes 6−2=4. Reversal aligns higher keyed ratings with changeability beliefs across differently directed wording; agreeing more often does not automatically raise the mean."
      },
      {
        "zh": "若前9题原选择为4、2、4、2、4、2、4、2、4，后3题选非数值回应，定向后九条均为4，合计36，均分36÷9＝4.0，同时显示9/12条有效。若仅前8题按同样方式评分，其余4题不评分，则有效8条、定向和32，但页面显示资料不足，不显示个人均分。九条门槛是本站完整度规则，不是经验证的信念分型线。",
        "en": "With raw responses 4, 2, 4, 2, 4, 2, 4, 2, 4 on the first nine items and non-numeric responses on the last three, all nine keyed ratings are four: sum thirty-six, mean 36÷9=4.0, with 9/12 rated. Rating only the first eight in the same way leaves eight ratings and a keyed sum of thirty-two, but no personal mean is displayed. Nine is the website’s completeness rule, not a validated mindset cutoff."
      }
    ]
  },
  {
    "id": "growth-middle-missing",
    "title": {
      "zh": "3.0、混合回答与资料不足，分别意味着什么",
      "en": "What do 3.0, mixed responses and insufficient information mean?"
    },
    "paragraphs": [
      {
        "zh": "全部选中立（3），以及全部选非常同意（5），都会得到3.0：前者十二条各记3，后者六条记5、六条反向记1，合计同为36。这些回答的含义明显不同。因此3.0不认证“最平衡”，也不表示50%成长、50%固定；平均值不能替代逐条理解，更不能据此诊断回答者矛盾或不诚实。",
        "en": "Choosing neutral (three) throughout and strongly agree (five) throughout both yield 3.0. The former contributes twelve threes; the latter six fives and six reversed ones, also summing to thirty-six. These are different response patterns. A mean of 3.0 certifies neither an ideal balance nor fifty-percent growth and fifty-percent fixed beliefs. The mean cannot replace item-level interpretation or diagnose contradiction or dishonesty."
      },
      {
        "zh": "中立是有数值的同意度选择，资料不足则不进入分子或分母，也不补成0或3。全部选非数值回应仍可以完成，完整指南照常可读，只是没有个人均分。均分保留一位小数是展示方式；有序类别相加取平均，并不能证明量表等距、个体差异显著或分数变化可靠。",
        "en": "Neutral is a numeric agreement response; insufficient information contributes to neither numerator nor denominator and is replaced by neither zero nor three. Non-numeric selections throughout still complete an attempt with the full guide and no personal mean. One decimal is a display convention: averaging ordered categories establishes neither interval measurement, significant individual differences nor reliable change."
      }
    ]
  },
  {
    "id": "growth-evidence",
    "title": {
      "zh": "成长型思维研究发现了什么？关联、干预与测量分开看",
      "en": "What does growth mindset research show? Association, intervention and measurement"
    },
    "paragraphs": [
      {
        "zh": "Yeager等（2019）在美国65所公立高中、12,490名九年级学生中开展随机实验，发现较低先前学业表现者的成绩及整体高阶数学选课出现一定收益，并考察了同伴规范等学校情境。研究检验的是特定教育干预及其环境，不是做一次网络问卷的效果，也没有验证本站12题。[2]",
        "en": "Yeager et al. (2019) randomized 12,490 ninth-grade students in sixty-five US public schools. They reported benefits for lower-achieving students’ grades and overall advanced-mathematics enrolment, examining school conditions such as peer norms. This tested a particular educational intervention in context, not the effect of taking an online questionnaire, and did not validate these twelve items.[2]"
      },
      {
        "zh": "Sisk等（2018）的两项元分析发现，信念与学业表现的总体关联、以及干预的总体效果均较弱；部分结果提示某些处境不利或学业风险群体可能受益。[3] Macnamara与Burgoyne（2023）进一步评估研究设计、报告与偏差，发现校正潜在发表偏差后、以及高质量子集中的学业效果不显著。[4] 这些不同层面的证据要求谨慎解释，不能宣传“提高心态分就保证提分”。本站亦未建立本题本的信度、效度、常模或中英文测量等价性。",
        "en": "Sisk et al. (2018) found weak overall mindset–achievement associations and intervention effects, with some evidence suggesting benefits for disadvantaged or academically at-risk groups.[3] Macnamara and Burgoyne (2023) examined study quality and reporting, finding nonsignificant achievement effects after adjustment for possible publication bias and in the highest-quality subset.[4] These evidence levels require care, not a promise that raising a mindset score raises grades. This form also lacks established reliability, validity, norms and English–Chinese measurement equivalence."
      }
    ]
  },
  {
    "id": "growth-counterexamples",
    "title": {
      "zh": "相信可以发展，不等于无限坚持：方法与支持的反例",
      "en": "Believing in development does not require endless persistence: methods and support"
    },
    "paragraphs": [
      {
        "zh": "学习表格公式时，暂时不会写嵌套公式，可以与相信在示例、练习和反馈下逐步学会同时存在。相反，眼下完成得很顺利，也可能认为以后的范围已经固定。前者区分“当前表现”与“以后可能改变”，后者说明熟练不直接等于成长看法；本问卷没有用实际任务测能力。",
        "en": "Not yet writing a nested spreadsheet formula can coexist with believing that examples, practice and feedback may help you learn it. Conversely, completing a task easily can coexist with believing your future range is already fixed. The first distinguishes current performance from possible development; the second shows that proficiency does not itself establish growth beliefs. This questionnaire contains no performance task measuring skill."
      },
      {
        "zh": "连续尝试却缺少清楚反馈时，换一种解释、请人示范、安排休息或暂时停止，都可能是合理选择。不能把疲劳、资源不足、拒绝不合适的要求或调整目标叫作固定心态。回顾时应分别核对练习内容、方法是否适配、反馈是否具体、支持能否获得及现实成本；一句“再努力”无法代替这些条件。",
        "en": "After repeated attempts without useful feedback, another explanation, a demonstration, rest or stopping temporarily may be reasonable. Fatigue, limited resources, refusing an unsuitable demand or revising a goal should not be labeled a fixed mindset. Review practice content, fit of method, specificity of feedback, available support and practical cost separately. An instruction to try harder cannot supply these conditions."
      }
    ]
  },
  {
    "id": "growth-review",
    "title": {
      "zh": "怎样使用结果？围绕一项技能设计一次可观察的回顾",
      "en": "How can I use the result? An observable review of one skill"
    },
    "paragraphs": [
      {
        "zh": "任选一个低风险、愿意继续尝试的小步骤，例如把一条错误公式改到能处理两个示例。先记录自己原先怎样解释困难，再选一项具体变化：看拆解示例、核对一个错误原因或请求一次针对性反馈。之后观察是否能解释步骤、处理一个新例子，以及哪些条件仍然欠缺。成功与未成功的例子都保留，不用均分替代实际作品。",
        "en": "Choose an optional, low-stakes step you want to try, such as repairing a formula so it handles two examples. Note how you originally explained the difficulty, then change one thing: examine a worked example, check one source of error or request specific feedback. Observe whether you can explain the steps and handle a new example, and which conditions remain missing. Retain successful and unsuccessful instances; a mean does not replace the work itself."
      },
      {
        "zh": "重测先确认相同技能、版本和有效评分条目。均分从3.0变4.0，可能涉及理解、参照、缺答或作答变化，不能单凭小数证明学习能力提升。它也不换算为毅力、自我效能、IQ、MBTI或学业预测。教师、主管与同伴可讨论具体条件和行为，不据本结果排名、分组、录用或限制机会。",
        "en": "Before retaking, check the skill, edition and which items received ratings. A shift from 3.0 to 4.0 may involve interpretation, reference, missingness or changed responses, without proving improved learning ability. It is not converted into grit, self-efficacy, IQ, MBTI or achievement forecasts. Teachers, managers and peers may discuss particular conditions and practices without ranking, grouping, hiring or restricting opportunities from this result."
      }
    ]
  }
];

export const growthLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "成长型思维等于自信、乐观或毅力吗？",
      "en": "Is growth mindset the same as confidence, optimism or grit?"
    },
    "answer": {
      "zh": "不是。本页询问所选技能是否可发展；自信关注当前能否完成，乐观涉及预期，毅力涉及长期投入。话题可能相关，但本结果不生成其他分数。",
      "en": "No. This page asks whether the chosen skill can develop. Confidence concerns present capability, optimism expectations, and grit sustained pursuit. Related topics do not produce interchangeable scores."
    }
  },
  {
    "question": {
      "zh": "第2题选2，为什么会记4？",
      "en": "Why does item two rated two contribute four?"
    },
    "answer": {
      "zh": "第2题是较固定方向的表述，使用6−2＝4反向计分。偶数题2、4、6、8、10、12均如此，非数值回应不翻转成分数。",
      "en": "Item two is worded toward a more fixed belief and uses6−2=4. The same reversal applies to items2,4,6,8,10,12. Non-numeric responses are not converted into scores."
    }
  },
  {
    "question": {
      "zh": "9条定向评分都为4，均分是多少？",
      "en": "What is the mean when nine keyed ratings are all four?"
    },
    "answer": {
      "zh": "定向和36除以有效条数9，得到4.0，显示9/12有效；其余三条非数值选择排除。只有8条有效时不显示个人均分，仍可读完整指南。",
      "en": "Thirty-six divided by nine gives4.0 with9/12rated; three non-numeric selections are excluded. With only eight ratings, no personal mean is shown, but the complete guide remains available."
    }
  },
  {
    "question": {
      "zh": "全部选3和全部选5，为何同为3.0？",
      "en": "Why do all threes and all fives both produce3.0?"
    },
    "answer": {
      "zh": "六道反向题让全部选5变为六个5加六个1，合计36；全部选3也是36。均分相同不能证明逐条看法相同，亦不自动说明回答无效。",
      "en": "Six reversed items turn all fives into six fives and six ones, summing to thirty-six, as do twelve threes. Equal means establish neither equal item-level beliefs nor automatically invalid responses."
    }
  },
  {
    "question": {
      "zh": "资料不足是不是中立？",
      "en": "Is insufficient information neutral?"
    },
    "answer": {
      "zh": "不是。中立记3；非数值回应不参与和或均分。12题都选非数值也能结束并读完整指南，不补成0、3或某种类型。",
      "en": "No. Neutral scores three; a non-numeric selection enters neither sum nor mean. Choosing non-numeric responses on all twelve still finishes with a full guide, without filling in zero, three or a type."
    }
  },
  {
    "question": {
      "zh": "研究证明每个人改心态都会提分吗？",
      "en": "Does research prove that changing mindset raises everyone’s grades?"
    },
    "answer": {
      "zh": "没有这种普遍结论。教育干预结果涉及样本、实施与学校环境，综述亦讨论弱效果和偏差。一次自评不是干预，研究不能替本站题本建立效度。[2][3][4]",
      "en": "No universal conclusion follows. Educational intervention findings depend on participants, delivery and school context; reviews also address small effects and bias. A self-assessment is not an intervention, and that research does not validate this form.[2][3][4]"
    }
  },
  {
    "question": {
      "zh": "休息、求助或换目标算固定型吗？",
      "en": "Do resting, seeking help or changing a goal make me fixed-minded?"
    },
    "answer": {
      "zh": "不能这样贴标签。应结合成本、反馈、方法与支持理解具体决定；本页不以持续硬撑或服从来评心态，也不从停止一次推断人格。",
      "en": "No such label follows. Interpret decisions through cost, feedback, methods and support. This page does not equate persistence at all costs or compliance with mindset, or infer personality from stopping once."
    }
  },
  {
    "question": {
      "zh": "换一个技能、或重测高了1分能直接比较吗？",
      "en": "Can I directly compare another skill or a one-point retake increase?"
    },
    "answer": {
      "zh": "先核对技能参照、版本、有效条目及具体回答。不同领域与缺答模式会影响读法；本页没有可靠改变阈值，不据差值宣称学习进步或能力提升。",
      "en": "Check the skill reference, edition, rated items and particular responses first. Domains and missingness affect interpretation. No reliable-change threshold is provided, so a difference does not establish learning or ability gains."
    }
  },
  {
    "question": {
      "zh": "开始前要输入技能或再次同意吗？",
      "en": "Must I enter the skill or agree again before starting?"
    },
    "answer": {
      "zh": "不用。技能只在心里选定，不收集名称。开始直接进入12题，无需额外同意、账号或邮箱；临时保存须主动选择，恢复时继续用原技能参照。",
      "en": "No. Select the skill privately in mind; its name is not collected. Start opens twelve items directly, without another agreement, account or email. Temporary saving is opt-in; resume with the original skill reference."
    }
  }
];
