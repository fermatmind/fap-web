import type { Questionnaire } from "@/lib/questionnaires/types";

/** Entry-only editorial; source-bound questions, keys and full reports remain intact. */
export const logicalReasoningLandingSections: Questionnaire["guide"] = [
  {
    "id": "logical-task-map",
    "title": {
      "zh": "逻辑推理测试练什么？四类前提与结论任务",
      "en": "What does this Logical Reasoning Test practise? Four premise-to-conclusion tasks"
    },
    "paragraphs": [
      {
        "zh": "24道原创文字选择题分为量词、条件规则、多步演绎与排序约束四组，每组六题。练习从已给前提出发，区分必然成立、可能成立与无法确定的判断；完成后免费查看总正确数、四组正确数、全部逐题解析与四篇完整复习指南。约12分钟是阅读估计，本版不计时。",
        "en": "Twenty-four original text questions form four groups of six: quantifiers, conditional rules, multi-step deduction and ordering constraints. Practise distinguishing necessary conclusions, possibilities and undetermined claims from supplied premises. Completion opens the total, four section counts, every worked answer and four complete revision guides, free. Twelve minutes is an estimate; this version is untimed."
      },
      {
        "zh": "这里的“逻辑”与“演绎”指同一份题本，不是两项独立测评。演绎要求结论在前提成立时不能为假；形式逻辑用模型检验这种关系。[2] 本版不包含数列找规律、图形矩阵或真实招聘公司的自适应题库，不能只因名称相近就套用它们的分数解释。",
        "en": "“Logical” and “deductive” name this single bank, not separate assessments. Deduction concerns whether a conclusion can be false while its premises hold; formal models make that relationship testable.[2] This bank does not contain number-series induction, visual matrices or an employer’s adaptive question pool. A shared label does not establish interchangeable scores."
      }
    ]
  },
  {
    "id": "logical-necessity",
    "title": {
      "zh": "必然、可能与无法推出：先明确结论的强度",
      "en": "Necessary, possible and unsupported: identify the strength of the claim"
    },
    "paragraphs": [
      {
        "zh": "“必然成立”要求所有符合前提的情形都支持结论；找到一个前提全真、结论为假的反例，就足以否定这种必然性。[2] 新例：规定“文件已归档，则已复核”，又知道“已复核”。文件可能已归档，也可能尚未归档；两种情形都不违反规则，因此不能推出已归档。",
        "en": "A necessary conclusion holds in every model satisfying the premises. One countermodel with true premises and a false conclusion defeats necessity.[2] In a fresh example, a filed document must have been reviewed, and the document has been reviewed. It may be filed or unfiled: both satisfy the rule. Filing does not follow."
      },
      {
        "zh": "无法推出某句话，也不等于推出它的否定。在上述新例里，“已归档”和“未归档”都未被确定；不要把信息不足写成确定为假。相反，若已知未复核，规则排除了已归档，才可推出未归档。判断时分别问：它能成立吗？它必须成立吗？它的否定也能成立吗？",
        "en": "Failure to establish a claim does not establish its negation. In that example neither filed nor unfiled is settled. If the document is instead known to be unreviewed, the rule excludes filing. Ask separately whether a claim can hold, must hold, and whether its negation can also hold."
      }
    ]
  },
  {
    "id": "logical-quantifiers",
    "title": {
      "zh": "量词推理：“所有”“有些”“没有”的范围",
      "en": "Quantifiers: the scope of all, some and none"
    },
    "paragraphs": [
      {
        "zh": "全称句约束某类对象的全部成员，存在句至少保证一个对象；“所有A是B”本身不保证A类有成员。[3] 本题本把“有些”明确解释为至少一个，并不附加“但不是全部”。先标注集合包含、相交或互斥，再核实题目是否给了存在条件，避免给空集合擅自补成员。",
        "en": "Universal claims constrain every member of a category; existential claims guarantee at least one. “All A are B” alone does not establish that any A exist.[3] Here “some” explicitly means at least one, without adding “but not all.” Mark inclusion, overlap or disjointness, then check existence separately."
      },
      {
        "zh": "独立新例：没有覆膜样片可重复使用；有些方形样片覆膜。因此至少一件方形样片不可重复使用。但不能推出全部方形样片都不可重复使用：另放一件未覆膜且可重复使用的方形样片，仍符合两个前提。画图时保留这种未被规则排除的区域，而不是只画最先想到的一种情形。",
        "en": "Fresh example: no laminated sample is reusable, and some square samples are laminated. At least one square sample is therefore not reusable. It does not follow that no square sample is reusable: another square sample could be unlaminated and reusable without violating either premise. Preserve regions that the rules leave open."
      }
    ]
  },
  {
    "id": "logical-connectives",
    "title": {
      "zh": "条件规则：充分、必要、双向与否定",
      "en": "Conditional rules: sufficiency, necessity, equivalence and negation"
    },
    "paragraphs": [
      {
        "zh": "若P则Q，表示P足以保证Q、Q是P的必要条件；“P只有在Q时才成立”同样按P→Q阅读。它不许可把Q反推为P，也不表示现实因果关系。[1] 在前面的归档新例中，归档保证复核，复核却不保证归档；未复核可排除归档，未归档则仍可能已复核。",
        "en": "For P→Q, P is sufficient for Q and Q is necessary for P. “P only if Q” has that same direction. It neither licenses Q→P nor asserts a real-world cause.[1] In the filing example, filing guarantees review, but review does not guarantee filing. No review excludes filing; no filing leaves review possible."
      },
      {
        "zh": "“当且仅当”要核两个方向；“或”是否允许两者同时为真、“除非”怎样转成条件，均以题中明示含义为准。[1] 新例只说“不能同时启用甲乙”，则甲乙都停用仍被允许；若改成“至少启用一个”，两者都启用又可能被允许。只有把两条合在一起，才是恰好一个，不能在阅读时自行补另一半。",
        "en": "An if-and-only-if rule requires both directions. Follow the item’s explicit convention for inclusive or and unless.[1] A fresh rule saying that two switches cannot both be on still permits both off. A rule requiring at least one on permits both on. Combining those two constraints yields exactly one; neither half supplies the other by itself."
      }
    ]
  },
  {
    "id": "logical-multistep",
    "title": {
      "zh": "多步演绎：逐条应用，保留尚未确定的信息",
      "en": "Multi-step deduction: apply each rule and retain unresolved information"
    },
    "paragraphs": [
      {
        "zh": "多条条件、否定和数量限制同时出现时，先把已知事实和规则分开，再记录每一步依据。例如新规则“恰好两个灯亮”，共有赤、青、白三个灯，已知白灯灭，则赤青都必须亮。若把“恰好两个”改为“至多两个”，这个结论便不再成立；数量词不是可忽略的修饰。",
        "en": "Separate facts from rules before combining conditions, negations and numerical constraints. A fresh rule requires exactly two of three lamps—red, teal and white—to be on. With white off, red and teal must both be on. Replacing exactly two with at most two removes that conclusion; the numerical qualifier changes the models."
      },
      {
        "zh": "解题记录可写成“当前事实→所用规则→新增结论”，不要把待证明的结论当作前提。对未选项尝试构造反例，再检查是否漏用或误读条件。正确选项只能说明本题判断与题定答案一致；一次错误无法单独区分语言误读、注意遗漏、推理步骤或猜测，需要结合自己的草稿复盘。",
        "en": "Use a trace of current facts, applied rule and new conclusion rather than assuming the desired answer. Try countermodels for rejected options and check unused or misread conditions. A correct option matches this item’s key. A single error does not identify whether the cause was reading, attention, inference or guessing; use your own working to investigate."
      }
    ]
  },
  {
    "id": "logical-constraints",
    "title": {
      "zh": "排序约束：一个可行排列不等于唯一排列",
      "en": "Ordering constraints: one feasible arrangement is not a unique arrangement"
    },
    "paragraphs": [
      {
        "zh": "“在前”与“紧邻在前”约束不同，位置题还须确认是否每物一位、是否允许并列。新例四张牌K、M、P、R各占第1至4位，K在M前，P紧邻R前。全部可行排列是KMPR、KPRM、PRKM。因此K在第1位只是可能，P在R前则必然成立。只找到第一种排列不能结束必然性检验。",
        "en": "Before and immediately before impose different constraints; also check one item per position and whether ties are allowed. Fresh cards K, M, P and R occupy positions 1–4, with K before M and P immediately before R. The feasible orders are KMPR, KPRM and PRKM. K being first is possible, while P preceding R is necessary. Finding one arrangement does not settle necessity."
      },
      {
        "zh": "在同一新例加“M在第4位”，剩KPRM与PRKM，K仍不固定；再加“K在第1位”，才唯一得到KPRM。复习时先固定题目明确的位置，把紧邻元素作为一块，逐步排除违规排列，再检查所有剩余排列中的共同结论。顺序不是实际时长，别从“在前”补出题目没有给的间隔。",
        "en": "Adding M in position 4 leaves KPRM and PRKM, so K is still not fixed. Adding K first then leaves only KPRM. Fix explicit positions, treat adjacent elements as a block, eliminate violations and inspect what all remaining arrangements share. Relative order alone does not specify elapsed time or gaps."
      }
    ]
  },
  {
    "id": "logical-score-review",
    "title": {
      "zh": "正确数怎样使用？四组记录与完整复习",
      "en": "Using correct counts: four records and complete revision"
    },
    "paragraphs": [
      {
        "zh": "每题与标准答案一致得1分，否则0分，无倒扣或速度加权；24题总正确数为四组0–6正确数之和。新算例[2,5,4,3]和[5,2,3,4]总数同为14，复习位置却不同。先看具体错题与解析，再看每组记录；不要只凭总数猜出错在何处。",
        "en": "Each keyed answer earns one, otherwise zero, without penalties or speed weighting. The total is the sum of four 0–6 section counts. Fresh vectors [2,5,4,3] and [5,2,3,4] both total 14 but identify different items for review. Inspect worked answers before using the group counts to organize revision."
      },
      {
        "zh": "四篇指南分别覆盖量词、条件、多步演绎与排序，任何正确数都能读全部指南与24题解析。初次可独立作答，复习时给每题补一句规则或一个反例，再尝试改变条件的近似题。固定题本重做可能受记忆影响；没有独立迁移任务和相应研究，不能把重测多答对几题解释成一般推理能力增长。",
        "en": "All four guides and all 24 explanations remain available at every score. Try an independent first attempt, then annotate a rule or countermodel for each item and practise a modified problem. Repeating a fixed bank can benefit from memory. More correct answers on a retake do not establish a gain in general reasoning without independent transfer tasks and supporting research."
      }
    ]
  },
  {
    "id": "logical-evidence",
    "title": {
      "zh": "逻辑可复核与测量有效性：两类证据分别看",
      "en": "Logical verification and measurement validity: separate kinds of evidence"
    },
    "paragraphs": [
      {
        "zh": "本题本提供可复核的离散规则：条件题核布尔真值组合，排序题核有限排列；集合题使用三对象成员模型作为有限检查，并结合题目的语义推导。有限集合检查不是对任意一阶逻辑命题的完整证明。形式化模型还依赖把自然语言正确转成规则，不能省略语义核对。",
        "en": "This bank supports discrete checks: Boolean valuations for conditional items and finite permutations for ordering. Set items use three-object membership models as a bounded check alongside semantic reasoning. That finite search is not a general proof procedure for arbitrary first-order claims. Formal checks also depend on an accurate translation of the wording."
      },
      {
        "zh": "答案可复算，与测试已建立心理测量效度是不同结论。本版尚无对应人群的信度、常模、效标关系或跨语言等值证据，不输出智商、百分位、招聘通过线或认证。适合用作明确前提下的文字推理练习；实际考试准备仍须核对目标机构的语言、时限、计分与题型。[1][2][3]",
        "en": "Reproducible answers and validated psychological measurement are different claims. This version has no established population reliability, norms, criterion relationships or cross-language equivalence, and reports no IQ, percentile, hiring cutoff or certification. Use it for premise-based textual practice. Check the target institution’s own language, timing, scoring and formats when preparing for an examination.[1][2][3]"
      }
    ]
  }
];

export const logicalReasoningLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "逻辑推理与演绎推理在这里是两套测试吗？",
      "en": "Are logical and deductive reasoning separate tests here?"
    },
    "answer": {
      "zh": "不是。两个名称指本站同一份24题文字练习，四组各六题；不会另外生成第二个分数或另一套能力结论。",
      "en": "No. Both names refer to the same 24-item text bank, with six items per group. They do not generate a second score or separate ability conclusion."
    }
  },
  {
    "question": {
      "zh": "为什么符合常识的答案仍可能不是正确选项？",
      "en": "Why might a plausible real-world answer be unkeyed?"
    },
    "answer": {
      "zh": "本版要求接受题内虚构前提，并只据明示规则判断。现实经验、常见做法或故事细节不能替代前提；先分清题目问必然结论、可能情况还是指定位置。",
      "en": "Accept the fictional premises and reason from the stated rules. Familiar real-world practices or imagined details cannot substitute for premises. Identify whether the item requests necessity, possibility or a position."
    }
  },
  {
    "question": {
      "zh": "“有些”是否意味着另一些一定不符合？",
      "en": "Does some guarantee that others do not qualify?"
    },
    "answer": {
      "zh": "不保证。本题本把“有些”定义为至少一个，可以一个、多个甚至全部。若要推出“并非全部”，必须另有前提；也不能仅凭全称句断言存在成员。[3]",
      "en": "No. Here some means at least one and may include all. Not all requires additional support; a universal claim alone also does not guarantee a member.[3]"
    }
  },
  {
    "question": {
      "zh": "“只有……才……”和“如果……那么……”怎样区分？",
      "en": "How do only if and if differ?"
    },
    "answer": {
      "zh": "P只有在Q时才成立，表示P→Q；若P则Q也表示同一方向。知道Q不保证P，知道非Q可排除P。只有题目明确给双向条件时，才可反向使用。[1]",
      "en": "P only if Q means P→Q, as does if P then Q. Q alone does not guarantee P; not Q excludes P. Use the reverse direction only when the premises provide it.[1]"
    }
  },
  {
    "question": {
      "zh": "无法推出是否就是错误？",
      "en": "Does not following mean false?"
    },
    "answer": {
      "zh": "不一定。若前提同时允许一句话为真和为假，它是未被确定；若所有符合前提的情形都使它为假，才能判定其否定必然成立。反例检验能帮助区分。[2]",
      "en": "Not necessarily. If the premises allow the claim to be true or false, it is undetermined. Its negation is necessary only when every compatible model makes the claim false. Countermodel checks distinguish these cases.[2]"
    }
  },
  {
    "question": {
      "zh": "为什么排序题不能只画一个符合规则的排列？",
      "en": "Why is one feasible order insufficient?"
    },
    "answer": {
      "zh": "一个可行排列只能证明该排列可能。要回答必然问题，必须检查其他可行排列；若另一个排列保留全部规则却改变结论，就不能称原结论必然。",
      "en": "One feasible order establishes possibility. A necessary conclusion must survive every feasible order. Another order obeying all rules but changing the conclusion defeats that necessity."
    }
  },
  {
    "question": {
      "zh": "这个分数能换算成SHL、Aon或公务员考试成绩吗？",
      "en": "Can this score convert to SHL, Aon or civil-service results?"
    },
    "answer": {
      "zh": "不能。本版题目、语言、时限、计分和参照人群不同，没有与这些考试建立链接或等值关系。可复习相关推理操作，正式备考仍以目标机构样题与说明为准。",
      "en": "No. This bank differs in items, language, timing, scoring and reference population, with no established linking or equating study. Practise related operations here and use the target institution’s official materials for its format."
    }
  },
  {
    "question": {
      "zh": "中英文相同题目是否表示两种语言的分数完全等值？",
      "en": "Do matching English and Chinese items establish equivalent scores?"
    },
    "answer": {
      "zh": "不表示。两版保留相同规则、答案键和报告结构，但阅读负担、词义理解与作答情境仍可能不同，尚未有跨语言等值研究。比较自己的练习时应记录语言与是否见过原题。",
      "en": "No. The versions preserve rules, keys and report structure, but reading demands, interpretation and context may differ. Cross-language equivalence has not been established. Record the language and previous exposure when comparing attempts."
    }
  }
];
