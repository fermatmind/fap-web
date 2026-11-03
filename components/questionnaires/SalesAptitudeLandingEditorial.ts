import type { Questionnaire } from "@/lib/questionnaires/types";

export const salesAptitudeLandingSections: Questionnaire["guide"] = [
  {
    "id": "sales-task-map",
    "title": {
      "zh": "销售能力测试练什么？先区分判断、知识与性格",
      "en": "What does a Sales Aptitude Test practise? Distinguish decisions, knowledge and traits"
    },
    "paragraphs": [
      {
        "zh": "本页提供24道原创、四选一的虚构销售任务：需求澄清、方案匹配、跟进记录、销售算术各六题。前18题要求按照明示目标、资料或政策判断；后六题依据给定数量计算。作答方式是选择符合题内条件的答案，不是评价自己有多外向、善于说服或能承受拒绝。",
        "en": "This page contains 24 original four-option fictional sales tasks: six each on discovery, documented fit, follow-up and sales maths. The first 18 apply explicit goals, evidence or policies; the last six calculate supplied quantities. Choose the answer meeting the item’s conditions rather than rating your sociability, persuasiveness or response to rejection."
      },
      {
        "zh": "“销售能力”这一名称可能指不同产品。这里把可复核的阅读判断与计算作为练习对象，不产生销售人格、天赋类型或岗位录用建议。Salesforce的流程教材把产品研究、客户沟通与关系维护放在具体业务背景下；本页四组是练习内容分组，不是完整销售周期或经验证的四因子能力模型。[2]",
        "en": "Sales aptitude is used for different products. Here the practice target is checkable reading, decisions and arithmetic, without a sales personality, talent type or hiring recommendation. Salesforce’s process material situates product research, customer conversations and relationships in business context. These four groups organize practice content; they are not a complete sales cycle or a validated four-factor ability model.[2]"
      }
    ]
  },
  {
    "id": "sales-discovery",
    "title": {
      "zh": "需求澄清：把未知信息变成可以回答的问题",
      "en": "Discovery: turn an unknown into an answerable question"
    },
    "paragraphs": [
      {
        "zh": "先区分客户已说的事实、尚未确定的事项和自己补充的假设。开放式提问可邀请客户说明具体要求，复述则给对方修正理解的机会；问题仍应围绕当前缺口，而不是为了显得专业不断追问。[1] 本组考查能否保留题给约束、补齐指定信息，以及准确记录计划、预算与决策状态。",
        "en": "Separate stated facts, unresolved information and your own assumptions. Open questions can invite detail, while paraphrasing gives the customer an opportunity to correct your understanding. Keep questions relevant to the current gap rather than asking indefinitely.[1] This group checks retention of constraints, completion of specified information and accurate recording of plans, budgets and decision status."
      },
      {
        "zh": "独立新例：某虚构买家只说“交接后仍需保留修改记录”，但尚未说明谁查阅、保留多久。若本题目标是弄清这两项，合适的问题应同时询问查阅角色与保留期限；直接承诺“永久保留、全员可见”补出了两个未经确认的条件。信息收集之后，还需要另行核对产品能否满足这些要求。",
        "en": "Fresh example: a fictional buyer needs an edit history after handoff but has not named its readers or retention period. If the task asks you to clarify both, ask about reader roles and retention. Promising permanent retention visible to everyone invents two requirements. Product capability must still be checked after discovery."
      }
    ]
  },
  {
    "id": "sales-fit-evidence",
    "title": {
      "zh": "方案匹配：逐项核对必需条件与证据状态",
      "en": "Documented fit: check each requirement and its evidence status"
    },
    "paragraphs": [
      {
        "zh": "将每条必需条件与给定资料逐项对应，标明已支持、相矛盾或尚未知。“资料没有写”不自动表示支持，也不自动表示不可能；若题目要求专家核验，就保留未知并采取指定核验动作。产品演示和文档是了解功能的途径，但需要核对其适用版本与实际场景。[2]",
        "en": "Map each mandatory requirement to the supplied evidence as supported, contradicted or unknown. An omitted feature is neither confirmed nor necessarily impossible. If the case requires specialist verification, retain the unknown and use that step. Demonstrations and documentation support product learning, but their version and use context still matter.[2]"
      },
      {
        "zh": "独立新例：买家必须同时具有批量导出和审批记录。题表中Juniper两项都有，Quartz仅有导出，Vale仅有审批，则只有Juniper满足这两项交集。若新增“离线可用”而表格没有相关证据，就不能继续宣称已满足全部条件；应把新增条件列为待核实，而不是沿用旧结论。",
        "en": "Fresh example: a buyer requires batch export and an approval history. Juniper has both in the supplied table, Quartz only export and Vale only approval history. Only Juniper satisfies that intersection. Adding mandatory offline use without supporting evidence makes the full match unresolved; record the new requirement rather than carrying forward the old conclusion."
      }
    ]
  },
  {
    "id": "sales-follow-up-status",
    "title": {
      "zh": "跟进与交接：分开提议、确认、完成和待核验",
      "en": "Follow-up and handoff: separate proposed, agreed, completed and unverified"
    },
    "paragraphs": [
      {
        "zh": "跟进记录应说明客户需求、待解问题、负责人和已经约定的下一步，避免把意向写成交易事实。无回复不提供同意或拒绝的充分依据；内部准备也不表示客户已接受。具体联系渠道、日期和停止条件按题中约定处理。流程教材中的跟进建议提供背景，但本题标准始终是题面给定条件。[2]",
        "en": "A handoff should identify the need, open question, owner and agreed next action without promoting intentions into transaction facts. Silence alone establishes neither acceptance nor rejection; internal preparation does not establish customer agreement. Follow the case’s specified channel, date and stop conditions. General follow-up guidance provides context, while each item’s explicit conditions determine its key.[2]"
      },
      {
        "zh": "独立新例：你提议周四视频演示，对方只回复“请先周二发一份说明”。此时能记录的是周二发送说明的约定，周四演示仍未确认；不能把两件事一起标为已接受。复习可用“事项—状态—依据—负责人”四列重写笔记，再检查每个已确认状态是否确有对应事实。练习不会替你发送邮件或更新客户系统。",
        "en": "Fresh example: you propose a Thursday video demo; the reply asks only for a written outline on Tuesday. The outline is agreed, while the demo remains unconfirmed. Do not mark both accepted. Reconstruct a note with action, status, evidence and owner, then check whether every confirmed status has support. This practice sends no email and updates no customer system."
      }
    ]
  },
  {
    "id": "sales-price-clarification",
    "title": {
      "zh": "价格异议：先明确比较对象，再核对可比条件",
      "en": "Price objections: clarify the comparison and comparable terms"
    },
    "paragraphs": [
      {
        "zh": "“太贵”可能缺少比较基准、包含项目或预算背景。澄清异议是理解问题的步骤，不能据此假定客户只关心最低价格，也不能保证某句话能成交。开放提问与复述在此用于取得信息；回应仍需结合真实需求、资料和客户自主决定。[1]",
        "en": "Too expensive may leave the reference price, included services or budget unresolved. Clarification gathers information; it does not establish that the lowest price is the only concern or that a phrase will close a sale. Open questions and paraphrasing support understanding, followed by evidence and the customer’s own decision.[1]"
      },
      {
        "zh": "独立新例：两份虚构报价分别写CU480与CU520，后者明列一次培训，前者培训费用未知。可以确认标价相差CU40，却不能直接比较包含培训后的总成本，更不能宣称后者“必然更划算”。先补齐费用范围，再在相同条件下算差额；价格差、价值判断与购买决定是不同问题。",
        "en": "Fresh example: fictional quotes list CU480 and CU520. The latter includes one training session; training costs for the former are unknown. The listed prices differ by CU40, but a training-inclusive total cannot yet be compared. Establish the missing scope before comparing like terms. A price difference, a value judgment and a purchase decision are separate questions."
      }
    ]
  },
  {
    "id": "sales-maths-denominators",
    "title": {
      "zh": "销售算术：金额、折扣、转化率与成交率",
      "en": "Sales maths: amounts, discounts, conversion and win rates"
    },
    "paragraphs": [
      {
        "zh": "先写数量、单位、计数范围与排除项，再代入公式。线索转化率需要说明“转化”的定义，以及分子分母是否来自同一观察组；Salesforce也强调团队须先统一口径。[3] 本题分别给定报价、折扣、假设比例、佣金基数和已结束机会的范围，不能用一个熟悉公式覆盖所有题。",
        "en": "Write the quantity, unit, population and exclusions before applying a formula. Lead conversion requires a defined event and a numerator and denominator from the same cohort; Salesforce likewise emphasizes agreed definitions.[3] This bank separately supplies quote, discount, assumed-ratio, commission-base and closed-opportunity rules. One familiar formula cannot replace all of them."
      },
      {
        "zh": "独立新例：7件虚构物品各CU32，加一次CU26费用，总额7×32＋26＝CU250；CU750打八八折后为CU660，减免额CU90。另一已完成组72条线索产生18次购买，按购买／全部线索计算为25%；若机会表为赢9、输6、开放5，且明定排除开放项，则成交率为9÷15＝60%，而非9÷20。这里各项均按各自给定条件计算。",
        "en": "Fresh examples: seven fictional items at CU32 plus one CU26 fee total CU250. A 12% discount on CU750 leaves CU660, a reduction of CU90. A completed cohort of 72 leads and 18 purchases gives 25% under a purchases-per-lead definition. A table with nine won, six lost and five open gives a 60% win rate when open opportunities are explicitly excluded, rather than 9/20. Each result follows its own stated rule."
      }
    ]
  },
  {
    "id": "sales-planning-assumptions",
    "title": {
      "zh": "计划算术与结果预测：写出假设才有可解释的数字",
      "en": "Planning arithmetic and prediction: make the assumption explicit"
    },
    "paragraphs": [
      {
        "zh": "用目标除以假定转化比例，可以得到一个条件式计划数，但固定比例不是未来客户行为的保证。新例：目标14次购买、假设每次演示产生0.20次购买，公式返回70次演示；改变假设比例，计划数也会改变。这个计算本身没有估计不确定性，也没有证明比例能迁移到下一期。",
        "en": "Dividing a target by an assumed conversion ratio produces a conditional planning number, not a guarantee of future customer behavior. With a fresh target of 14 purchases and an assumption of 0.20 purchases per demo, the formula returns 70 demos. Changing that assumption changes the output. The calculation does not estimate uncertainty or establish transfer to another period."
      },
      {
        "zh": "佣金题同样按题给条件计算：新例明确CU8,500为合资格基数、固定比例4%、无其他扣项，则结果CU340。真实合同中的计提时点、回款、退款、阶梯与税项需要真实规则；练习没有提供这些信息时，不应擅自补入，也不据虚构结果决定真实报酬。",
        "en": "Commission arithmetic also follows its stated rule: a fresh eligible base of CU8,500 at a flat 4%, with no deductions, gives CU340. Actual entitlement may depend on accrual, payment, refunds, tiers and taxes under real terms. Do not invent those terms for a fictional exercise or use its output to decide real compensation."
      }
    ]
  },
  {
    "id": "sales-score-and-revision",
    "title": {
      "zh": "怎样使用结果：四组正确数与20节完整复习",
      "en": "Using results: four correct counts and twenty complete guide sections"
    },
    "paragraphs": [
      {
        "zh": "每题匹配答案键得1分，否则0分；四组各0–6分，总计0–24，无倒扣或速度加权。新算例四组[2,5,4,3]与[5,2,3,4]都合计14，但应复习的题不同。总数不能单独告诉你错在阅读条件、信息状态、计算还是猜测，应查看所选、标准答案和逐题解释。",
        "en": "Each keyed answer earns one, otherwise zero, with four 0–6 counts and a 0–24 total. There are no penalties or speed weights. Fresh vectors [2,5,4,3] and [5,2,3,4] both total 14 but lead to different revision. The total alone cannot identify reading, status, arithmetic or guessing errors; inspect selections, keys and explanations."
      },
      {
        "zh": "任何正确数都能阅读全部24题解析和四篇完整指南，每篇五节。复习可先圈出遗漏条件，再用虚构数据改一道相似题，解释原结论是否仍成立。重做固定题本会受答案记忆影响；要判断实际工作中的迁移，需要不同任务和真实行为证据。四组分数用于整理复习，不分配销售人格或胜任等级。",
        "en": "Every score opens all 24 explanations and four complete guides with five sections each. Mark a missed condition, change a similar fictional case and explain whether the conclusion survives. Repeating a fixed bank can benefit from answer memory; transfer to work requires different tasks and behavioral evidence. The section counts organize revision without assigning a sales personality or competence grade."
      }
    ]
  },
  {
    "id": "sales-evidence-scope",
    "title": {
      "zh": "题目可复核、心理测量证据与中英文范围",
      "en": "Checkable tasks, measurement evidence and bilingual scope"
    },
    "paragraphs": [
      {
        "zh": "本题本的前18题以声明条件核对答案，后六题可按给定数字复算；仍需核对题面语义是否准确表达条件。条件检查、作者审阅和算术一致性支持题目质量核对，却不能替代目标人群的信度、常模、效标关联和公平性研究。本版尚未建立这些心理测量证据，不借用其他销售测评的验证结论。",
        "en": "The first 18 items can be checked against declared criteria and the last six recalculated, while the wording must accurately express those conditions. Criteria checks, author review and arithmetic consistency support item verification; they do not replace population reliability, norms, criterion relationships or fairness research. This version has not established that evidence and does not borrow validation from other sales assessments."
      },
      {
        "zh": "中英文保留相同题目身份、答案键与结果结构，但未建立跨语言测量等值。适合想练习书面销售任务的学习者；不能据此预测业绩、设置招聘通过线或确定职业去向。参考资料说明澄清、流程与指标概念，不代表来源机构参与命题、认可本题本或验证分数。页面公开指南不含个人答卷，练习也不需要真实客户姓名、联系方式或报价。",
        "en": "English and Chinese preserve item identities, keys and report structure without established measurement equivalence. Use the bank to practise written sales tasks, not to forecast revenue, set a hiring cutoff or decide a career. References explain clarification, processes and metrics; they do not establish authorship, endorsement or score validation by those organizations. Public guides contain no individual answers and the exercise needs no real customer names, contacts or quotes."
      }
    ]
  }
];

export const salesAptitudeLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "没有销售经验也能做吗？",
      "en": "Can I take this without sales experience?"
    },
    "answer": {
      "zh": "可以。题目提供虚构资料、目标与计算条件，重点是阅读、判断和复算。遇到不熟悉的业务词，可在完成后结合解析复习；本版没有销售年资门槛，也不把得分作为职业准入判断。",
      "en": "Yes. The fictional evidence, goals and numerical rules are supplied. Focus on reading, decisions and calculation, then review unfamiliar terms in the explanations. There is no experience requirement or career-entry verdict."
    }
  },
  {
    "question": {
      "zh": "这是销售性格测试还是知识情境练习？",
      "en": "Is this a sales personality test or a task-based exercise?"
    },
    "answer": {
      "zh": "这里是24道有答案键的练习，前18道按明示条件判断，后六道计算。不通过自评生成说服力、韧性、外向性或销售天赋档案，也不与MBTI或职业兴趣分数换算。",
      "en": "This is a 24-item keyed exercise: 18 explicit-criteria decisions and six calculations. It does not generate self-report persuasion, resilience, extraversion or talent profiles, or convert to MBTI or vocational-interest scores."
    }
  },
  {
    "question": {
      "zh": "为什么有些销售情境能设置唯一答案？",
      "en": "How can a sales scenario have one keyed answer?"
    },
    "answer": {
      "zh": "题目限定目标和条件，例如同时满足两项必需功能，或遵守指定渠道与日期。答案按这些条件核对；它不表示现实客户对话只有一种正确说法，也不保证采用某句话就能成交。",
      "en": "The item supplies a bounded goal, such as meeting two mandatory features or honoring an agreed channel and day. The key follows those conditions, without claiming one universally correct real-world phrase or a guaranteed sale."
    }
  },
  {
    "question": {
      "zh": "资料没有说明的功能应怎样处理？",
      "en": "How should I handle an undocumented capability?"
    },
    "answer": {
      "zh": "先保留未知。未被文档确认与已证实不可用不同；若题面要求向专家核验，就选择保留未知并核验的行动。只有新增证据支持后，才能更新结论。[2]",
      "en": "Retain the unknown. Unconfirmed differs from demonstrated absence. Where the case requires specialist verification, follow that step and update the conclusion only when evidence supports it.[2]"
    }
  },
  {
    "question": {
      "zh": "为什么转换率和成交率可能使用不同分母？",
      "en": "Why might conversion and win rates use different denominators?"
    },
    "answer": {
      "zh": "因为计数事件和观察范围不同。本题线索转化率按题定全部线索计算；成交率题明确只计已赢与已输机会，排除开放项。先核口径再算，不能把一个定义默认用于所有指标。[3]",
      "en": "They can count different events and populations. The lead-conversion item uses its stated lead cohort; the win-rate item explicitly uses won plus lost and excludes open opportunities. Establish the definition before calculating.[3]"
    }
  },
  {
    "question": {
      "zh": "可以用计算器吗？预计12分钟是限时吗？",
      "en": "May I use a calculator, and is twelve minutes a time limit?"
    },
    "answer": {
      "zh": "本版不计时、不奖励速度。约12分钟只是预计投入；若想观察独立计算，可先自行完成，之后用计算器复核。比较重做时，记录是否用过工具及是否见过答案。",
      "en": "The exercise is untimed with no speed bonus; twelve minutes is an estimate. For unaided practice, calculate independently and use a calculator afterwards. Record tools and previous answer exposure when comparing attempts."
    }
  },
  {
    "question": {
      "zh": "满分是否说明适合做销售或能通过面试？",
      "en": "Does a perfect score establish sales fit or interview success?"
    },
    "answer": {
      "zh": "不说明。满分表示这24题选择与答案键一致，未检验真实沟通、客户关系、行业知识或长期业绩。实际求职需核对岗位任务与目标机构的测评要求，不能据本题分数保证录用。",
      "en": "No. It means all 24 selections match this bank’s keys, without assessing live conversations, customer relationships, industry knowledge or long-term performance. Check the actual role and assessment requirements; this score guarantees no offer."
    }
  },
  {
    "question": {
      "zh": "中英文练习成绩可以直接互换吗？",
      "en": "Are English and Chinese practice scores interchangeable?"
    },
    "answer": {
      "zh": "两版使用相同题目与计分规则，但语言阅读负担、理解与答案记忆可能不同，尚无跨语言等值研究。用于个人复习时请同时记录语言、工具和是否首次作答。",
      "en": "The items and scoring rules match, but reading demands, interpretation and answer memory may differ. No cross-language equating study is established. Record language, tools and first-attempt status for personal revision."
    }
  }
];
