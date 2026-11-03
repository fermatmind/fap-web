import type { Questionnaire } from "@/lib/questionnaires/types";

export const projectManagementLandingSections: Questionnaire["guide"] = [
  {
    "id": "project-context",
    "title": {
      "zh": "项目管理测试练什么？五类任务与可核查的判断",
      "en": "What does this Project Management Test practise? Five topics and checkable decisions"
    },
    "paragraphs": [
      {
        "zh": "项目管理涉及把知识、技能、工具与技术应用于项目活动，以满足项目要求；PMI的介绍同时强调范围、交付物、风险和跨团队沟通。[1] 本页将其中部分基础任务转为30道原创情境单选，范围变更、排程容量、风险响应、沟通决策、预算数量各六题，交错呈现。它是一份有明确条件的知识练习。",
        "en": "Project management applies knowledge, skills, tools and techniques to project activities to meet requirements. PMI also highlights scope, deliverables, risks and communication across teams.[1] This page turns selected foundational tasks into thirty original multiple-choice scenarios. Scope and change, schedule and capacity, risk and response, communication and decisions, and budget and quantities each have six interleaved items. It is a knowledge exercise with explicit conditions."
      },
      {
        "zh": "每题先提供验收要求、依赖关系、权限表、记录规则或虚构数字，再要求选择满足条件的回应。你需要辨认条件、比较选项并核查计算，不需要提交真实项目资料。约18分钟是阅读估计，没有倒计时；完成后免费打开全部答案解析与五篇完整指南。",
        "en": "Each item supplies acceptance requirements, dependencies, an authority table, a recording rule or fictional quantities before asking for a matching response. Identify conditions, compare alternatives and check calculations without submitting real project data. Eighteen minutes is a reading estimate, without a countdown. Completion opens every worked answer and five complete guides free of charge."
      }
    ]
  },
  {
    "id": "project-scope",
    "title": {
      "zh": "范围与变更：先确定交付边界，再核批准状态",
      "en": "Scope and change: define delivery boundaries and check approval status"
    },
    "paragraphs": [
      {
        "zh": "范围说明要区分项目目标、交付物、纳入与排除、限制条件。微软的范围管理帮助也强调明确边界，并在变更时核对时间、资源、预算及相应取舍。[2] 本题判断依据是题干列明的约定；一项新想法有价值，不代表已获准纳入当前交付。完成估计也不等于完成批准。",
        "en": "Distinguish the goal, deliverables, inclusions, exclusions and constraints in a scope statement. Microsoft’s scope guidance likewise describes boundaries and reviewing time, resources, budget and trade-offs when considering changes.[2] These tasks use the agreement specified in each prompt. A valuable idea is not automatically authorized for the current delivery, and a completed estimate is not an approval."
      },
      {
        "zh": "新例：虚构展览要求可搜索的文字清单和一页打印说明，明确不含摄影。只有图片的清单缺少文字搜索条件；增加摄影服务则超出约定。若新增导览页，先列工作量、依赖与交付影响，交给题定决策人判断。这里检验要求覆盖与状态识别，不把“永不变更”当作项目管理原则。",
        "en": "Fresh example: a fictional exhibition requires a searchable text inventory and a one-page printed note, excluding photography. An image-only inventory misses text search; adding photography exceeds the agreement. For a proposed visitor guide, identify effort, dependencies and delivery effects for the designated decision owner. The exercise concerns requirement coverage and state, not a rule that projects must never change."
      }
    ]
  },
  {
    "id": "project-schedule",
    "title": {
      "zh": "排程与依赖：区分总工作量、经过时间与浮动",
      "en": "Schedule and dependencies: distinguish work, elapsed time and slack"
    },
    "paragraphs": [
      {
        "zh": "串行任务沿依赖链相加；分支可同时开始、资源充足且汇合必须等待全部分支时，汇合时间由最晚分支决定。新例：准备3天后，标牌制作4天与目录整理8天并行，最后核对2天，总经过时间为3＋max(4,8)＋2＝13天；把全部任务相加得到17天是另一种量。",
        "en": "Add durations along a sequential dependency chain. If branches can start together with adequate resources and their join waits for both, the latest branch controls the join. Fresh example: three days of preparation, parallel four-day sign production and eight-day inventory work, then two days of checking take 3 + max(4,8) + 2 = 13 elapsed days. Adding every task gives seventeen, a different quantity."
      },
      {
        "zh": "在这个限定网络里，四天分支可延后四天而不推迟汇合；若八天分支缩到五天，总期变为10天，并非减掉所有分支的改善量。真实排程还可能受共享人员、工作日历、交接和依赖类型影响；题目没有给这些限制时，不自行添加，也不把简化结果当作真实项目承诺。",
        "en": "In that limited network, the four-day branch can slip four days without delaying the join. Reducing the eight-day branch to five gives ten elapsed days, rather than subtracting improvements from every branch indiscriminately. Real schedules may also depend on shared staff, calendars, hand-offs and dependency types. Do not invent missing constraints in an item or turn its simplified answer into a real delivery commitment."
      }
    ]
  },
  {
    "id": "project-capacity",
    "title": {
      "zh": "容量与估时：先枚举可行组合，再解释平均值",
      "en": "Capacity and estimates: enumerate feasible combinations and interpret averages"
    },
    "paragraphs": [
      {
        "zh": "容量题若规定任务不可拆分、每项最多选一次，就应比较完整子集。新例：任务需求为2、5、9单位，容量上限12；八种总量为0、2、5、7、9、11、14、16，可行最大值是11，留下1单位。最接近上限的14仍不可行，也不能拆取9单位任务的一部分填满12。",
        "en": "When tasks are indivisible and may be selected at most once, compare whole subsets. Fresh example: demands of two, five and nine units under a capacity of twelve yield eight totals: 0, 2, 5, 7, 9, 11, 14 and 16. The largest feasible total is eleven, leaving one unused. Fourteen is infeasible, and taking part of the nine-unit task violates the model."
      },
      {
        "zh": "估时题还要分清描述过去与预测未来。三次同类记录为6、10、14小时，算术均值为10小时；这只概括给定记录，并未证明下一次必用10小时。若任务范围、资源或条件不同，要先说明可比性。容量最大利用也不自动等同于业务价值最大化；本题未给收益或优先级时，不能从数量推出这些结论。",
        "en": "Separate summaries of past observations from forecasts. Six, ten and fourteen hours average ten, which summarizes those records without proving the next task will take ten hours. Check comparability when scope, resources or conditions differ. Maximizing used capacity also need not maximize business value; quantities alone cannot establish benefits or priorities absent from the model."
      }
    ]
  },
  {
    "id": "project-risk",
    "title": {
      "zh": "风险与响应：让不确定性、触发条件和实际结果分开",
      "en": "Risk and response: separate uncertainty, triggers and observed outcomes"
    },
    "paragraphs": [
      {
        "zh": "题目按明示规则区分“可能发生”与“已观察到”。一次场地取消已发生，就应记录当前问题；由此带来的下次活动延误仍可能是不确定事件。响应记录需要把观察对象、监测人、阈值和允许行动连接起来。写下备用方案只是形成计划，尚未证明响应奏效。",
        "en": "The items distinguish possibilities from observations using stated rules. An observed venue cancellation is a current issue, while a resulting delay to a future activity may remain uncertain. Link the observation, monitor, threshold and permitted action in a response record. Writing a backup plan establishes a plan, not evidence that the response works."
      },
      {
        "zh": "新例：约定周三中午未确认的座位超过9个，由Mina向场地协调人请求备用安排。10个满足触发，9个不满足“超过”；不要因接近阈值就改写规则。后来确认第二场地可用，应更新原来的单一场地假设，再核容量与切换条件，而不是宣布所有交付风险已消失。",
        "en": "Fresh example: if more than nine seats remain unconfirmed at Wednesday noon, Mina asks the venue coordinator for a backup arrangement. Ten triggers the action; nine does not meet “more than.” Do not alter a rule because a value is close. A subsequently confirmed second venue changes the single-venue assumption; capacity and switching conditions still need checking before claiming delivery uncertainty has disappeared."
      }
    ]
  },
  {
    "id": "project-decisions",
    "title": {
      "zh": "沟通与决策：明确谁决定什么，以及哪些仍未决定",
      "en": "Communication and decisions: identify authority and unresolved choices"
    },
    "paragraphs": [
      {
        "zh": "权限应与决策领域对应。版式负责人不能仅凭头衔替预算负责人批准支出；记录“已讨论”也不能替代具体决定、决策人和日期。题干若要求明确同意，未回复就是等待决定，不能读取为默认通过。先核目前证据状态，再按约定渠道跟进。",
        "en": "Match authority to the decision domain. A layout owner’s title does not itself authorize spending, and “discussed” does not replace a choice, owner and date. If explicit agreement is required, no reply remains pending rather than approved by default. Check the evidence state before following up through the agreed route."
      },
      {
        "zh": "新例：Noor负责标牌文字，Owen负责额外支出；提案涉及两者，应分别标明所需决定，而非只找最先回复的人。给Noor的摘要可写待选文字、阅读试验观察与回复时间。若对外只允许汇总人数，就不附姓名和联系方式；本题核的是给定信息范围，不依据简短选项评价完整协商或领导能力。",
        "en": "Fresh example: Noor owns sign wording and Owen owns extra spending. A proposal involving both should identify the separate decisions rather than rely on whoever replies first. Noor’s summary might state the wording choice, reading-trial observation and response point. If external sharing allows aggregate attendance only, exclude names and contacts. These items check specified information boundaries, not the full quality of negotiation or leadership."
      }
    ]
  },
  {
    "id": "project-budget",
    "title": {
      "zh": "预算与数量：先写公式、单位与假设，再计算",
      "en": "Budget and quantities: state the formula, units and assumptions"
    },
    "paragraphs": [
      {
        "zh": "新例：六套材料每套7代币，加一次性装配费5代币，合计47；不能把一次性费逐套乘。某工作表定义支出差为实际减计划，实际53、计划48，差为＋5，表示高于该计划。这一题定差额不是挣值管理的成本偏差公式；同一个“偏差”词不能代替量和符号的定义。",
        "en": "Fresh example: six kits at seven tokens each plus a one-time assembly fee of five total forty-seven; do not multiply the fee by every kit. If a worksheet defines spend difference as actual minus planned, actual fifty-three and planned forty-eight give +5, meaning above that plan. That defined difference is not the earned-value cost-variance formula; the word “variance” does not replace defined quantities and signs."
      },
      {
        "zh": "预测也要保留条件：上限150，已花62，预计余下还需71，预测总额133、余量17；若余下工作估计不全，正确减法也不能保证最后节余。采购则同时核价格与到货限制：上限40、最晚5天，39/6天不合格，40/5天符合这两个数值条件。储备余额只说明分配剩余，不自动授予挪用权限。",
        "en": "Keep forecast assumptions visible: a limit of 150, spending of 62 and estimated remaining cost of 71 give a forecast total of 133 and headroom of seventeen. Incomplete remaining-work estimates can invalidate an underspend promise despite correct arithmetic. Check procurement constraints together: with a forty-token ceiling and five-day deadline, 39/six days fails while 40/five days meets those two conditions. A reserve balance does not grant authority to reallocate it."
      }
    ]
  },
  {
    "id": "project-results",
    "title": {
      "zh": "项目管理测试结果怎么看？把五项计数连到错题条件",
      "en": "How should I read the results? Connect five counts to missed conditions"
    },
    "paragraphs": [
      {
        "zh": "每道正确选择记1题，各组0—6题，总数0—30题；不按速度加分，不计部分分，不分配项目经理等级。零正确、部分正确和全正确都会打开30题所选、答案与解析，以及五篇共35节的完整指南。公开指南是通用复习内容，不含当前访客的私人答卷。",
        "en": "Each correct selection counts once, giving zero to six per topic and zero to thirty overall. There is no speed bonus, partial credit or project-manager tier. Zero, partial and perfect attempts all open thirty selections, keys and explanations and five complete guides with thirty-five sections. Public guides provide general revision content without the current visitor’s private responses."
      },
      {
        "zh": "例如五项4、2、5、1、3与3、3、3、3、3都合计15，但遗漏条件的分布不同。复盘时指出漏了纳入要求、汇合依赖、触发比较、权限领域还是费用单位，再回看对应解析。15/30不是能力达到50%、人群排名或认证通过概率；本固定题组没有这些换算证据。",
        "en": "For example, topic counts 4, 2, 5, 1, 3 and 3, 3, 3, 3, 3 both total fifteen but distribute errors differently. Identify a missed inclusion, dependency join, trigger comparison, authority domain or fee unit and revisit the relevant explanation. Fifteen of thirty is not fifty-percent competence, a population rank or a probability of passing certification; this fixed bank has no evidence for those conversions."
      }
    ]
  },
  {
    "id": "project-transfer",
    "title": {
      "zh": "从答题到实践：用新情境检查理解与应用",
      "en": "From answers to practice: examine understanding in a new scenario"
    },
    "paragraphs": [
      {
        "zh": "可用一个自拟的虚构小项目继续练习：写目标、两项交付、一项排除和验收条件；画出先后依赖；再加一条不确定性及触发响应、一份待决记录和简明预算。让另一人依据这些信息复算或指出缺项，比只记住答案字母更便于检查推理。真实项目资料无需输入本站。",
        "en": "Continue with a fictional project of your own: state a goal, two deliverables, an exclusion and acceptance checks; draw dependencies; then add an uncertainty with a trigger and response, a pending decision record and a small budget. Another reader can recompute or identify missing information, which makes reasoning more inspectable than memorized answer letters. Real project records need not be entered here."
      },
      {
        "zh": "PMI区分预测、适应与混合等方式，并强调按项目情境选择。[1] 本页使用具体局部规则，不宣称覆盖某套完整方法、官方考试大纲或所有行业。看过答案后重测可用于复习，却含记忆影响；也没有中英文分数等值、工作绩效预测或PMP、CAPM、PRINCE2成绩换算研究。官方背景来源支持概念，不为本题组提供认证。",
        "en": "PMI describes predictive, adaptive and hybrid approaches and choosing according to context.[1] This page uses local scenario rules rather than claiming coverage of an entire method, official examination outline or every industry. Familiar retakes can support revision but involve memory. There is no English–Chinese score equating, workplace-performance prediction or conversion to PMP, CAPM or PRINCE2 scores. Official background sources explain concepts without certifying this bank."
      }
    ]
  }
];

export const projectManagementLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "范围变更估计已经完成，可以直接开始新增工作吗？",
      "en": "Can work begin as soon as a change estimate is ready?"
    },
    "answer": {
      "zh": "先核题定批准权限与状态。估计准备好，只说明有可供决定的信息；仍须由对应决策人按约定处理。范围管理需要考虑预算、排程、资源和交付取舍。[2]",
      "en": "Check the designated authority and status. A ready estimate supplies decision information; it does not itself authorize work. Scope management involves cost, schedule, resources and delivery trade-offs.[2]"
    }
  },
  {
    "question": {
      "zh": "并行任务为什么不能把所有天数相加？",
      "en": "Why not add every duration for parallel tasks?"
    },
    "answer": {
      "zh": "相加得到任务时长总和；经过时间要按依赖网络计算。若两分支同步启动、资源充足、末项等待两者，就取最晚分支再加前后任务；共享资源等条件改变时需重算。",
      "en": "The sum describes task durations, whereas elapsed time follows the dependency network. With simultaneous starts, adequate resources and a join waiting for both branches, use the latest branch plus preceding and following tasks. Recalculate if shared-resource constraints change."
    }
  },
  {
    "question": {
      "zh": "任务不可拆分，容量剩余是不是算错？",
      "en": "Is unused capacity an error when tasks are indivisible?"
    },
    "answer": {
      "zh": "不一定。应枚举满足限制的完整组合；若没有正好填满的组合，最大可行总量就会低于上限。不能用拆分或重复选任务来违反题定条件。",
      "en": "Not necessarily. Compare whole combinations satisfying the constraints. Without an exact fill, the largest feasible total is below the limit. Splitting or repeating tasks may violate the supplied model."
    }
  },
  {
    "question": {
      "zh": "触发条件写“超过9”，观察到9应不应该触发？",
      "en": "Does an observation of nine meet a trigger stated as more than nine?"
    },
    "answer": {
      "zh": "不满足这一数值条件。“超过”与“至少”不同；还要核观察时点、监测对象及响应责任人，而不是仅比较一个脱离条件的数字。",
      "en": "It does not meet that numerical condition. More than differs from at least. Also check the observation time, monitored quantity and response owner rather than comparing an isolated number."
    }
  },
  {
    "question": {
      "zh": "确认备选供应方后，可以把风险标记为彻底解决吗？",
      "en": "Does confirming a backup supplier eliminate the risk?"
    },
    "answer": {
      "zh": "新事实改变原假设，但不证明备选交付、切换成本或所有后果。应更新记录，并依据新条件核剩余不确定性；记录完整与响应有效是两件事。",
      "en": "The new fact changes the original assumption without proving delivery, switching cost or every consequence. Update the record and assess remaining uncertainty. A complete record and an effective response are different things."
    }
  },
  {
    "question": {
      "zh": "没有回复的审批消息，能记成默认同意吗？",
      "en": "Can an unanswered approval message count as agreement?"
    },
    "answer": {
      "zh": "若题干要求明确回复，应保留未决状态。按指定权限、渠道与时间跟进，不从沉默推断同意、拒绝或个人态度。",
      "en": "If explicit agreement is required, retain the pending state. Follow the designated authority, channel and timing without inferring approval, rejection or personal attitude from silence."
    }
  },
  {
    "question": {
      "zh": "实际支出减计划支出，就是挣值成本偏差吗？",
      "en": "Is actual spend minus planned spend earned-value cost variance?"
    },
    "answer": {
      "zh": "不是。本题部分记录明确使用实际减计划这个局部差额。应按题给数量和符号计算，不将它替换成其他方法中使用不同数量的公式。",
      "en": "No. Some records here explicitly use the local difference actual minus planned. Calculate using the supplied quantities and sign convention rather than relabelling it as another method’s formula."
    }
  },
  {
    "question": {
      "zh": "同为15/30，五项结果是否完全相同？",
      "en": "Do two attempts scoring fifteen of thirty have identical topic results?"
    },
    "answer": {
      "zh": "不一定。不同分布可得相同总数。应查看五组各六题的正确数、实际漏掉的条件和逐题解析；总数本身不说明项目经验、职业等级或证书准备度。",
      "en": "No. Different topic distributions can produce the same total. Inspect each six-item count, missed conditions and worked explanations. The total alone does not establish project experience, a professional tier or certification readiness."
    }
  }
];
