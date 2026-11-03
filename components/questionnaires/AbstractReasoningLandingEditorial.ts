import type { Questionnaire } from "@/lib/questionnaires/types";

export const abstractReasoningLandingSections: Questionnaire["guide"] = [
  {
    "id": "abstract-scope",
    "title": {
      "zh": "抽象推理测试练什么？四类明确的符号任务",
      "en": "What does this abstract reasoning practice cover? Four defined symbolic tasks"
    },
    "paragraphs": [
      {
        "zh": "抽象推理通常涉及识别关系、提出规则并把关系用于新材料。本页的24道原创题分为符号序列、关系类比、示例分类和有序变换，每组六题。材料采用字母串、0与1、按行描述的网格和集合，题面交代操作及记号。它是便于逐步核算的书面练习，不是缺块图形矩阵或图像旋转测验。",
        "en": "Abstract reasoning commonly involves recognizing relations, proposing rules and applying relations to new material. These twenty-four original tasks cover symbol sequences, relational analogies, classification from examples and ordered transformations, six each. Materials use letter strings, bits, grids described by rows and sets, with notation and operations specified. This is written practice that can be checked step by step, rather than missing-cell visual matrices or a mental-rotation test."
      },
      {
        "zh": "公开的图解测验也会要求根据连续图形识别规则、选择后继图形；EPSO的示例说明展示了这种形式。[3] 题型、指令、时间条件和参照样本共同决定怎样解读一次成绩，不能仅因名称都叫抽象推理就跨题本换算。本页四分项是练习内容的分组，尚不是经研究建立的四个心理分量表。",
        "en": "Public diagrammatic tests can ask readers to infer a rule across figures and select the next diagram; EPSO’s sample instructions illustrate that format.[3] Item format, instructions, timing and reference samples all matter to score interpretation. A shared abstract-reasoning label does not permit conversion between banks. Our four sections organize practice content; they are not four empirically established psychological subscales."
      }
    ]
  },
  {
    "id": "abstract-inference",
    "title": {
      "zh": "推断规则与执行规则：先看题目要求哪一步",
      "en": "Inferring a rule versus executing one: identify the task first"
    },
    "paragraphs": [
      {
        "zh": "前18题给定有限的候选操作或分类标准，要求用全部示例筛选规则，再用于新目标。最后六题直接给出规则，要求保留顺序、条件和中间状态。两者都会涉及核对关系，但工作步骤不同：前者先比较候选是否解释证据，后者先把明示程序准确执行。",
        "en": "The first eighteen items supply finite candidate operations or classification criteria: test them against every example, then apply the surviving rule to a new target. The last six give the rule directly and ask you to preserve order, conditions and intermediate states. Both involve checking relations, but the former first compares explanations against evidence while the latter first executes an explicit procedure."
      },
      {
        "zh": "有限示例本身不能排除一切想象得到的规律。本题本的“唯一正确”指题面明列候选中只有一种符合全部已知条件，并且只有一个选项符合目标。不要额外假定未说明的循环字母表、旋转方向或优先级；遇到实际任务证据不足时，也应继续询问条件，而不是照搬练习中的确定性。",
        "en": "Finite examples cannot exclude every imaginable pattern. Here, a unique answer means one explicitly offered candidate fits all stated evidence and one option fits the target. Do not assume an unstated circular alphabet, rotation direction or precedence. In a real task with insufficient evidence, seek more conditions rather than transferring the certainty of this bounded exercise."
      }
    ]
  },
  {
    "id": "abstract-relations",
    "title": {
      "zh": "序列与类比：追踪位置，避免只看首尾",
      "en": "Sequences and analogies: track positions rather than only the ends"
    },
    "paragraphs": [
      {
        "zh": "另设输入GJLM。全倒序得到MLJG，左轮移一位得到JLMG，仅交换首尾得到MJLG。三种操作都改变外观，有两种还会得到相同的首尾，但中间位置不同。先标原位置1、2、3、4，再写输出取自哪些位置，比只凭外观熟悉感选择更容易查错。",
        "en": "Consider the fresh input GJLM. Full reversal gives MLJG; one left rotation gives JLMG; swapping only the ends gives MJLG. All change appearance, and two share the same outer tokens while differing inside. Label original positions one to four and write the output position map to make mistakes easier to inspect than a choice based only on familiarity."
      },
      {
        "zh": "序列要用同一候选解释每个相邻变化；类比要把输入与输出之间的关系迁移到新输入。若第一对含重复符号，两个候选可能暂时相同，第二个示例便尤其重要。作答时先算新输出再对照选项；复习时指出一个干扰项实际用了什么不同操作，才能区分理解了关系还是记住答案字母。",
        "en": "For a sequence, test the same candidate against every adjacent transition. For an analogy, transfer the input-output relation to a new input. Repeated tokens can make two candidates coincide on one pair, making a second demonstration particularly useful. Compute before comparing options; during review, identify which different operation one distractor uses to distinguish understanding the relation from remembering a letter key."
      }
    ]
  },
  {
    "id": "abstract-classification",
    "title": {
      "zh": "示例分类：正例和反例必须同时解释",
      "en": "Classification from examples: explain positive and negative labels together"
    },
    "paragraphs": [
      {
        "zh": "另设HKKH标为组内、HKJH标为组外，候选只有“整串回文”和“首尾相同”。两串首尾均相同，后一个标准无法区分标签；整串倒序不变的标准则能接受HKKH并排除HKJH。反例不是附带信息，它可以排除仅凭正例看起来也成立的宽泛规则。",
        "en": "Suppose HKKH is labeled IN and HKJH OUT, with only two candidate criteria: a full palindrome or equal endpoints. Both strings have equal endpoints, so that criterion cannot distinguish the labels. Full reversal preserving the string accepts HKKH and rejects HKJH. A negative example is substantive evidence: it can exclude a broad rule that also appears to fit the positives."
      },
      {
        "zh": "把每个候选与每个示例逐格核对，再检查新目标。“恰有两个1”与“至少一个1”不同，“有重复”与“首两位相同、其余各异”也不同。计数、位置和“所有、至少、恰好”这些条件应分别记录；在集合题中另按成员归属判断，不把集合书写顺序误当字母串位置。",
        "en": "Check every candidate against every example before evaluating the new target. Exactly two ones differs from at least one one; a repetition differs from a leading pair with distinct remaining tokens. Record counts, positions and quantifiers separately. For sets, inspect membership instead of mistaking the written order of members for string positions."
      }
    ]
  },
  {
    "id": "abstract-order",
    "title": {
      "zh": "有序变换：每一步保留中间状态",
      "en": "Ordered transformations: preserve an intermediate state after every step"
    },
    "paragraphs": [
      {
        "zh": "另从UVWX出发，先左轮移成VWXU，再倒序得UXWV。若先倒序成XWVU，再左轮移则为WVUX。相同两种操作交换次序就可能改变答案；先写每个箭头后的完整串，再核对最终选项。条件分支若明示看原首位，就只在原输入上判断一次。",
        "en": "Starting from UVWX, left rotation gives VWXU and reversal then gives UXWV. Reversing first gives XWVU, whose left rotation is WVUX. Reordering the same two operations can change the answer. Write the complete row after each arrow before checking options. When a branch explicitly inspects the original first token, evaluate it once on the original input."
      },
      {
        "zh": "同时替换则应让每个原符号只生成一次输出。另设P换Q、Q换R、R换P，PQQR变为QRRP；新生成的Q不能再沿映射变R。另把网格UV / WX / YZ转置，新行是UWY / VXZ，连读为UWYVXZ。先区分符号替换、行列转置和串的重排，避免把不同表示方式混成一种操作。",
        "en": "For simultaneous substitution, each original token generates output once. With P→Q, Q→R and R→P, PQQR becomes QRRP; the newly generated Q is not processed again into R. Separately, transposing UV / WX / YZ gives rows UWY / VXZ, read as UWYVXZ. Distinguish substitution, grid transposition and string rearrangement rather than conflating their representations."
      }
    ]
  },
  {
    "id": "abstract-evidence",
    "title": {
      "zh": "科学性怎样判断？规则可复算与测量证据分别核查",
      "en": "What supports a scientific interpretation? Check rules and measurement evidence separately"
    },
    "paragraphs": [
      {
        "zh": "研究者分析Raven矩阵推理时，曾结合口述过程、眼动与错误模式，并用计算模型讨论关系归纳和目标管理。[4] 这提示研究认知过程需要多种观察证据；该研究的对象和模型不能直接验证本站字母串题，更不能用一次正确数推算工作记忆容量。这里仅概述其摘要中的研究路径，没有借用其题目或分数。",
        "en": "An analysis of Raven matrix reasoning combined verbal protocols, eye fixations and error patterns with computational models of relation induction and goal management.[4] This illustrates studying cognitive processes through multiple observations. Its tasks and models do not validate our letter-string bank or permit estimating working-memory capacity from a correct count. This is an account of the research approach described in its abstract, not a reuse of its items or scores."
      },
      {
        "zh": "本版规则与答案可以逐题复算，但尚未建立信度、效度、难度校准、人群常模或跨语言测量等值。英语和中文使用相同符号，仍需要阅读说明、理解记号；无图或少用词都不自动证明文化公平。若用途是正式选拔，应以实际施测工具、目标人群和具体用途的证据为准。",
        "en": "Rules and keys here are reproducible item by item, but reliability, validity, difficulty calibration, population norms and cross-language equivalence have not been established. English and Chinese share symbols while still requiring instruction reading and notation comprehension; neither fewer words nor no pictures establishes cultural fairness. Formal selection requires evidence for the instrument, population and intended use actually involved."
      }
    ]
  },
  {
    "id": "abstract-review",
    "title": {
      "zh": "怎样复盘抽象推理错题？从首个分歧到新例子",
      "en": "How can I review an error? Find the first divergence, then try new material"
    },
    "paragraphs": [
      {
        "zh": "先记录你采用的规则，找到最早与示例或解析不符的一步，区分是漏条件、认错规则、改变了操作顺序，还是抄写位置错误。四组各6题与总计24题帮助定位本次答对哪些材料，没有速度加权或猜错倒扣；同样12题正确，也可能来自完全不同的分项分布。",
        "en": "Record your chosen rule, then locate the first step that conflicts with an example or rationale. Distinguish an omitted condition, a mistaken rule, changed operation order and a transcription error. Four counts out of six and a total out of twenty-four locate successes in this attempt; there is no speed weighting or penalty for guessing. Two totals of twelve may have quite different section distributions."
      },
      {
        "zh": "之后换符号再做一例，并解释一个看似接近的错误答案。可先不看选项写中间状态，再看解析核对。已读答案后重做同24题会混入记忆和熟悉效应，不能仅以正确数上升宣称一般推理能力提高。官方SHL也把练习的主要目的说明为熟悉题目和操作，且练习未必匹配正式测验难度或提供报告。[1][2]",
        "en": "Then change the symbols, work another example and explain one plausible wrong answer. Try writing intermediate states before looking at options, then check the rationale. Retaking the same twenty-four after reading keys introduces memory and familiarity; higher counts alone do not establish improved general reasoning. SHL describes familiarization as a main purpose of its practice and notes that difficulty or report availability can differ from a live assessment.[1][2]"
      }
    ]
  },
  {
    "id": "abstract-access",
    "title": {
      "zh": "完整结果怎样使用？四份指南与24道逐题解析",
      "en": "What is included? Four full guides and twenty-four item explanations"
    },
    "paragraphs": [
      {
        "zh": "完成全部24题后，结果同时给出总正确数、四组正确数、每题所选、标准答案及理由，并提供全部四份七节复习指南。零题正确也能读全部内容；部分作答不生成完整成绩，没有未答补零或跳题估分。公开指南可提前阅读，但看过答案后应把后续作答视为已接触材料的练习。",
        "en": "After all twenty-four answers, the result includes total and section counts, each selected answer, the key and its rationale, and all four seven-section revision guides. Every guide remains readable with zero correct answers. Partial attempts do not produce a complete score; omissions are not imputed as zero or estimated through skipped items. Public guides can be read first, but subsequent attempts should then be understood as practice with previously encountered material."
      },
      {
        "zh": "开始按钮直接进入题目，无需账户、邮箱或额外同意步骤。作答默认不保存；只有主动临时保存才在当前标签页提供24小时内恢复，完成、退出清除或重测即删除。分享入口只分享测试标题与测试链接，不发送个人答案或正确数。约16分钟为编辑估计，不是限时，也不是实测平均完成时间。",
        "en": "Start opens the questions directly without an account, email or additional agreement step. Answers are not saved by default; optional temporary saving permits recovery in the current tab for twenty-four hours and is cleared on completion, explicit exit/clear or retake. The share action shares only the test title and test link, not personal answers or counts. About sixteen minutes is an editorial estimate, neither a time limit nor an observed mean completion time."
      }
    ]
  }
];

export const abstractReasoningLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这是图形矩阵或Raven智力测试吗？",
      "en": "Is this a visual matrix or Raven intelligence test?"
    },
    "answer": {
      "zh": "不是。它用字母串、位串、按行描述的网格及集合进行原创规则练习，不施测Raven或其他商业题库，也不把正确数换算IQ。",
      "en": "No. It uses original letter-string, bit-string, row-described grid and set exercises. It does not administer Raven or another commercial bank, or convert correct counts into IQ."
    }
  },
  {
    "question": {
      "zh": "序列、类比、分类和变换有什么区别？",
      "en": "How do sequences, analogies, classification and transformations differ?"
    },
    "answer": {
      "zh": "序列核对连续变化；类比把已示关系迁移到新输入；分类让一个候选同时解释组内和组外；变换按明示步骤执行。各组六题，分别提供复习指南。",
      "en": "Sequences check successive changes; analogies transfer a demonstrated relation; classification fits both IN and OUT examples; transformations execute stated steps. Each has six items and a full revision guide."
    }
  },
  {
    "question": {
      "zh": "为什么候选规则必须全部核对？",
      "en": "Why check every candidate against all examples?"
    },
    "answer": {
      "zh": "一对重复符号可能让两种操作暂时同解，另一个示例才把它们分开。本页唯一解限于题面明列的候选与条件，不声称排除所有可能数学规律。",
      "en": "Repeated symbols can make two operations coincide on one example, with another separating them. Uniqueness here is within the offered candidates and conditions, not every possible mathematical rule."
    }
  },
  {
    "question": {
      "zh": "同时替换和顺序替换可以混用吗？",
      "en": "Can simultaneous and sequential substitution be interchanged?"
    },
    "answer": {
      "zh": "不能。同时替换只处理原输入一次，新符号不继续替换；顺序操作则按指定次序使用中间结果。看清题面指定哪一种，再算输出。",
      "en": "No. Simultaneous substitution processes original tokens once without reprocessing output; ordered steps use intermediate states in the specified order. Check which the prompt specifies."
    }
  },
  {
    "question": {
      "zh": "12/24是平均水平或招聘通过线吗？",
      "en": "Is 12/24 an average score or employer pass mark?"
    },
    "answer": {
      "zh": "不是。它只表示答对本题本一半，没有参照人群常模、认证分界或招聘线。相同总数可以对应不同错题，应查看四分项和逐题理由。",
      "en": "No. It means half this bank was answered correctly, without population norms, certification thresholds or employer cutoffs. Equal totals can involve different errors; inspect section counts and rationales."
    }
  },
  {
    "question": {
      "zh": "中英文符号相同，是否已经文化公平？",
      "en": "Do shared symbols establish cultural fairness across languages?"
    },
    "answer": {
      "zh": "没有。说明阅读、记号熟悉程度与教育经历都可能影响表现；相同符号和翻译并不代替跨语言等值与公平性研究，本版尚未提供这些证据。",
      "en": "No. Reading instructions, notation familiarity and educational experience can affect performance. Shared symbols and translation do not replace equivalence and fairness research, which this edition does not supply."
    }
  },
  {
    "question": {
      "zh": "怎样区分会做新题与记住旧答案？",
      "en": "How can I distinguish solving new problems from remembering keys?"
    },
    "answer": {
      "zh": "可换成未见过的符号，写出每步并解释错误选项。重做同24题仍可复习，但正确数变化混有记忆，不能直接归因于通用推理能力提高。",
      "en": "Use unfamiliar symbols, show each step and explain a distractor. Repeating these twenty-four can support review, but changed counts mix in memory and cannot directly establish general reasoning improvement."
    }
  },
  {
    "question": {
      "zh": "零分是否会锁住解析或指南？",
      "en": "Are explanations or guides locked at zero correct?"
    },
    "answer": {
      "zh": "不会。完成24题后，全部24道解析与四份完整指南均可阅读，不以正确数决定权限，不需要邮箱、付款或再次同意。",
      "en": "No. Once all twenty-four are answered, all explanations and four full guides are readable without a score gate, email, payment or another agreement step."
    }
  }
];

export const abstractReasoningLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "EPSO：抽象推理公开示例说明（法语）",
      "en": "EPSO: abstract reasoning sample instructions (French)"
    },
    "url": "https://europa.eu/epso/doc/archive/apply/sample_test/pdf/abstract_fr.pdf"
  },
  {
    "title": {
      "zh": "Carpenter、Just与Shell（1990）：矩阵推理过程研究摘要",
      "en": "Carpenter, Just & Shell (1990): abstract of matrix-reasoning process research"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/2381998/"
  }
];
