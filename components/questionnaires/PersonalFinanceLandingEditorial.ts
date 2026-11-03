import type { Questionnaire } from "@/lib/questionnaires/types";

export const personalFinanceLandingSections: Questionnaire["guide"] = [
  {
    "id": "finance-construct",
    "title": {
      "zh": "个人理财素养测试练什么？知识、行为与财务状况的区别",
      "en": "What does this Financial Literacy Test practise? Knowledge, behaviour and circumstances"
    },
    "paragraphs": [
      {
        "zh": "金融素养的范围比会做几道计算题更广。OECD/INFE 2026工具同时关注知识、行为与态度，并把金融包容和财务福祉分别处理。[8] 本页选择其中部分基础知识任务：预算与支出7题、储蓄与风险8题、工资与福利8题，共23道原创单选；它不是该国际调查的翻译、缩编或替代版本。",
        "en": "Financial literacy extends beyond solving arithmetic. The OECD/INFE 2026 toolkit addresses knowledge, behaviour and attitudes, with separate treatment of financial inclusion and well-being.[8] This page selects foundational knowledge tasks: seven Budget and Spending, eight Saving and Risk, and eight Pay and Benefits items, twenty-three original multiple-choice questions. It is neither a translation nor a shortened or replacement edition of that international survey."
      },
      {
        "zh": "题目要求在明确的虚构条件下识别概念、计算金额和检查记录，不要求透露收入、负债、账户或家庭资产。答对题数反映本次题组的作答表现；真实生活中的资源、可用产品、照护责任和突发支出并未被测量。知道一个原则、能否实行以及最后得到什么结果，需要分别理解。",
        "en": "Identify concepts, calculate amounts and inspect records under explicit fictional conditions, with no personal income, debt, account or household asset details required. Correct counts describe this attempt on this bank. Resources, available products, caring responsibilities and unexpected expenses in real life are not measured. Knowing a principle, being able to act on it and the eventual outcome are distinct questions."
      }
    ]
  },
  {
    "id": "finance-budget-record",
    "title": {
      "zh": "预算与支出：统一期间，先记录实际发生的金额",
      "en": "Budget and spending: use one period and record actual amounts"
    },
    "paragraphs": [
      {
        "zh": "先核对收入与支出是否属于同一个月或同一周，再用收入减去题定全部支出。新例：月收入420，三项支出150、95、80，余额为420－325＝95；若还有未列明支出，这个简表就不能代表完整预算。CFPB的支出记录指南要求回看实际记录，也注意不常发生的费用。[1]",
        "en": "Check that income and expenses concern the same month or week, then subtract every stated expense. Fresh example: monthly income of 420 and expenses of 150,95 and 80 leave 420−325=95. Unlisted spending prevents this short table from representing a complete budget. CFPB guidance recommends checking actual records, including infrequent expenses.[1]"
      },
      {
        "zh": "固定与可变描述费用的计费方式，不等于必要与不必要。固定月费可以不是生活必需，必要支出也可能按使用量变化。若账户记录与预算余额不一致，应回查漏项、重复记录和期间，而不是把差额一律当作浪费。知识题只使用已给定的完整条件，不要求你给自己的消费贴标签。",
        "en": "Fixed and variable describe charging arrangements rather than essential and nonessential spending. A fixed fee can be optional, while a necessity can vary with usage. If records and the budget balance disagree, inspect omissions, duplicates and periods instead of labelling every difference waste. Knowledge items use supplied conditions without asking you to label your own spending."
      }
    ]
  },
  {
    "id": "finance-goals-discounts",
    "title": {
      "zh": "目标、年度账单与折扣：分清时间、预留和实际付款",
      "en": "Goals, annual bills and discounts: distinguish timing, reserves and payment"
    },
    "paragraphs": [
      {
        "zh": "新例：目标128，已有20，每周末存18，无利息或其他变化，需要向上取整(128－20)÷18＝6周；第五周只有110，第六周达到128。若到期费用216，在12个完整月里等额预留，每月18。预留是为未来付款安排资金，最后付账时不要在同一预算口径下再次当作新增储蓄扣一遍。",
        "en": "Fresh example: a goal of 128,20 already saved and 18 added each week-end with no interest or other changes needs ceiling((128−20)/18)=6 weeks. Week five reaches 110 and week six 128. A 216 bill funded equally over twelve full months requires 18 per month. A reserve prepares for payment; do not count the eventual payment again as new saving in the same budget model."
      },
      {
        "zh": "折扣题先算减少额，再算实付额。标价80、减价15%，减少12、实付68；“节省12”和“支付68”回答的是不同问题。这里假设没有税费、配送、附加条件或再次折扣。题目金额用于练习计算，不构成购买理由；一项降价商品是否有用、是否负担得起，仍是算式以外的问题。",
        "en": "For discounts, calculate the reduction and then the paid amount. A price of 80 reduced by 15% saves 12 and costs 68: different answers to different questions. This assumes no taxes, delivery, conditions or further discount. Fictional arithmetic is no reason to purchase; usefulness and affordability remain separate considerations."
      }
    ]
  },
  {
    "id": "finance-interest-periods",
    "title": {
      "zh": "单利与复利：本金、利息、频率和净增加额",
      "en": "Simple and compound interest: principal, interest, frequency and net change"
    },
    "paragraphs": [
      {
        "zh": "单利按原本金计算利息；复利将已计入余额的利息继续计息。[4] 新例假设本金400、年利率3%、两年、无存取和费用：单利利息400×0.03×2＝24，本息424；按年复利的本息400×1.03²＝424.36，利息24.36。两者差0.36，来自第二年对首年12利息再计3%。",
        "en": "Simple interest uses the original principal; compounding also earns interest on interest already included in the balance.[4] Fresh example:400 at 3% annually for two years, without cash flows or fees, gives simple interest 400×0.03×2=24 and balance 424. Annual compounding gives 400×1.03²=424.36, including 24.36 interest. The 0.36 difference is second-year interest on the first year’s 12."
      },
      {
        "zh": "公式中的利率和期数必须匹配，年利率不能直接当作月利率；题目写按年复利，就不能擅自改成按月。若某期利息9、费用4，净增加额为5；9是毛利息，不是扣费后的增加。真实产品还涉及具体计息、存取、费用与税务规则，本页不以题定利率描述市场报价或收益承诺。",
        "en": "The rate must match the period: an annual rate is not a monthly rate, and annual compounding cannot silently become monthly. Interest of 9 less a fee of 4 gives net growth 5, not 9. Real products involve their own accrual, cash-flow, fee and tax rules; the fictional rates are neither market quotations nor promised returns."
      }
    ]
  },
  {
    "id": "finance-risk-liquidity",
    "title": {
      "zh": "购买力、流动性与风险：三个不同的问题",
      "en": "Purchasing power, liquidity and risk: three different questions"
    },
    "paragraphs": [
      {
        "zh": "新例：固定120单位，篮子价格由24变为30，可购买量由5变为4；少买1份，相对原数量下降20%，而价格上涨25%。这描述这个虚构篮子的购买力，不是某国通胀率。流动性关心资金能否方便取得和使用；应急储备则针对计划外需要。[2][3] 本页不规定所有人都应保留同样月数或金额。",
        "en": "Fresh example:120 buys five baskets at 24 but four at 30. Quantity falls by one, or 20% of the original amount, while price rises 25%. This describes purchasing power for that fictional basket, not a country’s inflation rate. Liquidity concerns access and use; emergency reserves address unplanned needs.[2][3] This page prescribes no universal reserve amount or number of months."
      },
      {
        "zh": "分散配置可以减少集中持有带来的部分风险，但不能保证市场下跌时不亏损。[5] 高额保本收益承诺、催促立即转款等值得独立核查。[6] 题目考查警示信号识别，不凭一句广告直接裁定现实中的诈骗，也不推荐投资比例、特定产品或替你判断承受损失的能力。",
        "en": "Diversification can reduce some concentration risks without guaranteeing protection during a market decline.[5] Promises of high guaranteed returns and pressure to transfer money urgently warrant independent checking.[6] The item tests recognition of warning signs, not a finding of fraud from one advertisement, an allocation recommendation or an assessment of your capacity for losses."
      }
    ]
  },
  {
    "id": "finance-pay-benefits",
    "title": {
      "zh": "工资与福利：区分应发、实发、配比与报销",
      "en": "Pay and benefits: distinguish gross, take-home, matching and reimbursement"
    },
    "paragraphs": [
      {
        "zh": "应发工资与扣款后的实发工资应分开阅读。[2] 新例：应发800，题定全部扣款80和45，实发675；若记录写665，待核差额10，而不是据此认定原因。时薪题按已列普通工时相乘，不添加题外的加班规则。比较两个方案的现金金额前，还要统一月度或年度口径。",
        "en": "Read gross pay separately from take-home pay after deductions.[2] Fresh example:800 gross less all stated deductions of 80 and 45 yields 675. A recorded 665 leaves 10 to investigate without establishing its cause. Hourly items multiply the stated ordinary hours without inventing overtime rules. Compare cash amounts only after aligning monthly or annual periods."
      },
      {
        "zh": "配比缴款依计划具体条件而定，IRS资料也强调核对计划文件。[7] 新例假设雇主配比员工缴款的40%，上限18；员工缴50时，雇主缴min(20,18)＝18，两者合计68。培训费用280、核准报销上限190，个人剩余90。保费是保障的付款，不能仅凭已交费推出所有事件都获赔。[2] 这些数字均不是现行税法或就业福利规定。",
        "en": "Matching depends on plan terms, as IRS guidance explains.[7] Fresh example: an employer matches 40% of employee contributions up to 18. An employee contribution of 50 gives employer matching min(20,18)=18 and combined 68. Approved training costing 280 with reimbursement capped at 190 leaves 90. A premium pays for insurance; payment alone does not establish coverage for every event.[2] These figures are not current tax or employment rules."
      }
    ]
  },
  {
    "id": "finance-counts-evidence",
    "title": {
      "zh": "结果怎样计分？23题答对数与7、8、8题的分母",
      "en": "How are results scored? Twenty-three answers and denominators of seven, eight and eight"
    },
    "paragraphs": [
      {
        "zh": "每题有效选择与答案一致记1，否则记0，无负分、权重或速度奖励。23题都作出有效选择后，显示总答对数及三组分别答对数。新例：3／7、6／8、4／8合计13／23；6不是“比3强一倍”的个人能力结论，因为题目、数量和难度没有建立可比标尺。同总分也可来自完全不同的错题分布。",
        "en": "Each valid choice matching the key earns one; others earn zero, without penalties, weights or speed bonuses. All twenty-three choices are needed for the total and three group counts. Fresh example:3/7,6/8 and 4/8 total 13/23. Six does not establish twice the personal ability of three: item sets, lengths and difficulty lack a common validated scale. Equal totals can also hide different errors."
      },
      {
        "zh": "答案可复算，说明规则明确；测量学证据还需检验题本信度、效度、语言等值及目标人群。本版尚未建立这些证据，不设置全国排名、及格线或财商等级。OECD调查的抽样、翻译试测与国际比较方法另有要求。[8] 外部机构的资料支持概念来源，不将本站答对数变成其调查分数或认证。",
        "en": "Recomputable keys establish explicit rules. Psychometric evidence additionally concerns reliability, validity, language equivalence and the intended population, none established for this edition. There is no national rank, pass threshold or financial-intelligence tier. OECD surveys separately require sampling and translation piloting.[8] External educational sources support concepts without converting these counts into institutional survey scores or certification."
      }
    ]
  },
  {
    "id": "finance-review-access",
    "title": {
      "zh": "怎样使用三份完整指南？先找错误步骤，再重做新例",
      "en": "How can I use the three full guides? Find the missed step, then try a new example"
    },
    "paragraphs": [
      {
        "zh": "完成后逐题比较所选、标准答案与解析，再区分概念误认、期间混用、遗漏条件和计算错误。先写公式与单位，代入另一组虚构数字，看是否仍能解释过程。三篇各七节的公开指南作答前后均可全文阅读；零分、部分答对和全部答对都能查看全部23题解析与三篇指南。",
        "en": "After completion compare each selection, key and explanation, separating concept mistakes, mixed periods, missed conditions and calculation errors. Write a formula and units, then try different fictional values and explain the steps. All three seven-section public guides are readable before and after answering. Zero, partial and perfect attempts all receive twenty-three explanations and every guide."
      },
      {
        "zh": "开始按钮直接进入题目，无需注册、邮箱、付款或先同意保存。约10分钟是阅读估计，没有倒计时；可选择是否用计算器与参考资料。答案在当前浏览器处理，只有主动保存才保留本标签页最长24小时草稿；完成、清除或重测会删除。重复相同题目可能受记忆影响，升分本身不能证明财务状况改善。",
        "en": "Start opens the questions directly without registration, email, payment or agreement to save. Roughly ten minutes is a reading estimate, without a countdown; choose whether to use a calculator or references. Answers are processed in the current browser. Only active saving keeps a tab draft for up to twenty-four hours, clearing on completion, clearing or retaking. Remembering repeated questions can raise counts without establishing improved finances."
      }
    ]
  }
];

export const personalFinanceLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这是财商等级或OECD金融素养调查吗？",
      "en": "Is this a financial-intelligence level or an OECD survey?"
    },
    "answer": {
      "zh": "不是。它是23题原创知识练习，三个主题的答对数不转换为财商、常模分或国际调查结果。OECD对金融素养的范围及调查方法另有定义。[8]",
      "en": "No. This is an original twenty-three-item knowledge exercise. Topic counts do not convert to financial-intelligence tiers, norm scores or international survey results. OECD defines a broader construct and separate survey methods.[8]"
    }
  },
  {
    "question": {
      "zh": "三个主题题数不同，怎样比较？",
      "en": "How should I read topics with different numbers of items?"
    },
    "answer": {
      "zh": "同时阅读答对数与分母：预算7题，另外两组各8题。即使换算为本题组比例，也没有校准难度，不能据此判定个人能力的倍数或排名。",
      "en": "Read counts with denominators: seven Budget items and eight in each other topic. Even a proportion within the bank does not calibrate difficulty or establish ability ratios or rankings."
    }
  },
  {
    "question": {
      "zh": "利息与账户余额为什么不是同一金额？",
      "en": "Why do interest and account balance differ?"
    },
    "answer": {
      "zh": "利息是增加部分，本息余额还包括本金。先看题目问哪一种，再核利率期间、复利频率、存取和费用；不把题设当作市场报价。",
      "en": "Interest is the growth component; the balance also includes principal. Check which quantity is requested, then periods, compounding, cash flows and fees. Fictional assumptions are not market offers."
    }
  },
  {
    "question": {
      "zh": "每年预留和到期付款会算两次支出吗？",
      "en": "Should setting aside funds and paying the bill both count as new spending?"
    },
    "answer": {
      "zh": "先统一记账口径。预留用于安排未来付款，同一笔资金的内部转移与最终付款不应在同一口径下重复扣减。题目采用明确期间和全部已列条件。",
      "en": "Use a consistent accounting basis. Reserving funds prepares for a later payment; an internal transfer and the final payment should not both be deducted as new spending in the same model. Items specify their periods and conditions."
    }
  },
  {
    "question": {
      "zh": "雇主配比金额等于员工工资增加吗？",
      "en": "Is an employer match the same as a pay rise?"
    },
    "answer": {
      "zh": "不是同一个量。先按题定比例和上限计算雇主缴款，再区分员工投入、账户合计与实发工资；实际计划还需核对具体条款。[7]",
      "en": "They are different quantities. Calculate employer matching from the stated rate and cap, then distinguish employee contributions, account totals and take-home pay. Actual plans require their own terms.[7]"
    }
  },
  {
    "question": {
      "zh": "发现工资记录差额，可以直接确定是谁出错吗？",
      "en": "Does a pay-record discrepancy establish who made an error?"
    },
    "answer": {
      "zh": "不能。它只提示按题设重算金额与记录不一致。核对期间、扣款和原始记录后才能判断原因，不从一项算术差额推断现实中的责任或违法。",
      "en": "No. It establishes a mismatch between the stated arithmetic and the record. Check periods, deductions and original records before identifying causes; a numerical difference alone establishes no responsibility or illegality."
    }
  },
  {
    "question": {
      "zh": "高分是否能证明投资、借贷或求职决策合适？",
      "en": "Does a high count establish that an investment, loan or job decision is suitable?"
    },
    "answer": {
      "zh": "不能。题目未收集你的目标、资源、风险承受情况或合同条件。答对数适合定位本题组的复习内容，不产生个性化产品推荐、职业排序或收益预测。",
      "en": "No. The bank does not collect your goals, resources, capacity for losses or contract terms. Counts help locate material for revision, without personal product recommendations, job rankings or return predictions."
    }
  },
  {
    "question": {
      "zh": "重测答对更多，就证明学习效果了吗？",
      "en": "Do more correct answers on retaking establish a learning effect?"
    },
    "answer": {
      "zh": "单次升分不足以证明。答案记忆、使用资料和练习条件都可能变化。记录错误步骤能帮助复习，但本题未验证训练效果或可靠变化阈值。",
      "en": "A single increase is insufficient. Remembered keys, references and practice conditions may differ. Recording missed steps can guide revision, but this bank has no validated training effect or reliable-change threshold."
    }
  }
];

export const personalFinanceLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "OECD/INFE（2026）：金融素养、包容及福祉测量工具，定义与方法",
      "en": "OECD/INFE (2026): financial literacy, inclusion and well-being toolkit, definitions and methods"
    },
    "url": "https://www.oecd.org/content/dam/oecd/en/publications/reports/2026/01/oecd-infe-toolkit-for-measuring-financial-literacy-inclusion-and-well-being-2026_6e8d9566/92f2d439-en.pdf"
  }
];
