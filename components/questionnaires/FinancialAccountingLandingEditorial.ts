import type { Questionnaire } from "@/lib/questionnaires/types";

/** Entry-only editorial; source-bound bank, explanations and reports remain intact. */
export const financialAccountingLandingSections: Questionnaire["guide"] = [
  {
    "id": "accounting-task-map",
    "title": {
      "zh": "财务会计测试练什么？从交易记录到报表阅读",
      "en": "What does this Financial Accounting Test practise? From transactions to statements"
    },
    "paragraphs": [
      {
        "zh": "本版24道原创选择题分为六组，每组四题：借贷分录、利润表、资产负债表、权责与现金时间、折旧、营运资本。它把“发生了什么交易”“归入哪个期间”“问的是金额还是比率”拆开练习，完成后可看全部答案、逐题解析与六篇完整指南。所有金额均为虚构单位，CU不指定一种真实货币。",
        "en": "Twenty-four original multiple-choice items form six groups of four: entries, income statements, balance sheets, accrual timing, depreciation and working capital. Practise identifying the event, the relevant period and whether the requested output is an amount or a ratio. Completion opens every answer, explanation and all six full guides. CU denotes fictional currency units, not a specified real currency."
      },
      {
        "zh": "财务会计通过记录和分类交易形成财务信息；某一期间的收入费用与某一日期的资产负债回答不同问题。[2][6] 本题组选择基础、可复算的简化任务，不覆盖完整报表编制、审计取证、复杂合同、税务或真实会计软件操作。想复习基础的学生和非财会读者可从这些任务入手，再依据课程或当地准则补充学习。",
        "en": "Financial accounting organizes transactions into financial information. Period income and expenses answer a different question from balances at a particular date.[2][6] This bank selects bounded, reproducible fundamentals rather than a complete reporting, auditing, contract-analysis, taxation or software task. Students and readers outside accounting can use the exercises to identify topics for further study under their course or applicable reporting framework."
      }
    ]
  },
  {
    "id": "accounting-journal-logic",
    "title": {
      "zh": "借贷分录：先识别交易性质，再核科目与方向",
      "en": "Journal entries: identify the event before choosing accounts and sides"
    },
    "paragraphs": [
      {
        "zh": "借贷表示分录两侧，不能直接译成“增加／减少”或“好／坏”；方向还取决于科目性质。核对交易及记录是会计循环的基础环节。[1] 新例：工作室收到须偿还的无息借款2,300单位，借现金、贷借款负债各2,300；若条件改为业主投入同额资本，现金仍增加，贷方则是投入资本。两种收款对现金的影响相同，经济性质不同。",
        "en": "Debit and credit name entry sides, not universal increase/decrease or good/bad labels; the account category also matters. Identifying events and recording them are basic accounting-cycle tasks.[1] In a fresh example, a studio receives a repayable, interest-free CU2,300 loan: debit Cash and credit Loan payable by CU2,300 each. An otherwise identical owner contribution instead credits contributed capital. The cash effect is the same, but the transaction is different."
      },
      {
        "zh": "另一新例：结清此前已正确入账的应付款460单位，且无折扣、利息或手续费，应减少应付与现金，不能把原采购再记一次。复核时依次写交易事实、受影响科目、增减方向和金额，再检查借贷相等。相等只能通过数额检查，仍须核科目是否恰当、是否重复入账，以及是否属于正确期间。",
        "en": "For another fresh example, settling a correctly recorded CU460 payable without discount, interest or fees reduces both the payable and cash; it does not record the original purchase again. Review the event, affected accounts, changes and amounts before checking equal debits and credits. Equality checks the amounts, while account selection, duplication and period still need separate consideration."
      }
    ]
  },
  {
    "id": "accounting-income-layers",
    "title": {
      "zh": "利润表：毛利、净利润与业主投入分别计算",
      "en": "Income statements: separate gross profit, net income and owner contributions"
    },
    "paragraphs": [
      {
        "zh": "本版按题定格式计算毛利与净利润。收入、费用和业主交易应分别识别，不能把所有流入现金都算作收入。[2][3] 独立新例给净销售收入12,700、销货成本7,400、其余全部费用合计2,900单位，无其他损益：毛利为5,300，净利润为2,400。毛利还没有扣除其余费用，净利润也不直接表示本期现金净增加。",
        "en": "Use each item’s stated format for gross profit and net income. Distinguish income and expenses from owner transactions rather than treating all cash receipts as revenue.[2][3] A fresh statement specifies net sales of CU12,700, cost of goods sold of CU7,400 and all other expenses totaling CU2,900, with no other income items. Gross profit is CU5,300 and net income CU2,400. Gross profit precedes the remaining expenses; net income is not simply the period’s increase in cash."
      },
      {
        "zh": "在这份新简表中另加业主投入4,000单位，不改变上述净利润；若唯一遗漏是一笔属于本期的费用350单位，则修正净利润为2,050。前者改变资金来源，后者改变当期损益。复习时在每项旁写“收入／费用／业主交易”和所属期间，列清全部扣项，避免漏折旧、重复扣成本或把别期项目塞进本期。",
        "en": "Adding a CU4,000 owner contribution to that fresh model leaves net income unchanged. If the only omission is a CU350 expense belonging to the period, corrected net income becomes CU2,050. The contribution changes financing; the omitted expense changes period income. Label each item by category and period, then list deductions once to catch omitted depreciation, duplicate costs or an amount assigned to the wrong period."
      }
    ]
  },
  {
    "id": "accounting-position-evidence",
    "title": {
      "zh": "资产负债表：总额、构成与差额的证据范围",
      "en": "Balance sheets: totals, composition and what an imbalance establishes"
    },
    "paragraphs": [
      {
        "zh": "资产＝负债＋权益；按同一日期给定余额，权益是资产减负债。[3] 新例资产28,500、负债11,200单位，权益为17,300。若再用现金3,100换取按同额入账的设备，且此刻无费用、折旧或其他调整，资产总额仍为28,500，但现金减少、设备增加。“总额不变”并不表示资产构成或现金余额不变。",
        "en": "Assets equal liabilities plus equity; with balances at the same date, equity is assets less liabilities.[3] Fresh amounts of CU28,500 assets and CU11,200 liabilities imply CU17,300 equity. Exchanging CU3,100 cash for equipment recorded at the same amount, with no immediate expense, depreciation or other adjustment, leaves total assets at CU28,500. Composition and cash have changed even though the total has not."
      },
      {
        "zh": "另设草稿资产15,000、负债6,800、权益7,500单位，等式差额为700。仅凭这三个数，只能发现尚未平衡，不能断言漏了哪项、谁出错或存在舞弊。题目列设备成本与累计折旧时，按指定口径扣减一次；账面权益与资产金额也不能直接当公司市值、设备转售价或业主可立即提取的现金。",
        "en": "A separate draft with CU15,000 assets, CU6,800 liabilities and CU7,500 equity has a CU700 imbalance. Those three numbers show a mismatch, without identifying an omitted account, a responsible person or fraud. Where equipment cost and accumulated depreciation are supplied, deduct the latter once under the stated model. Recorded balances are not automatically market valuations or cash available for immediate withdrawal."
      }
    ]
  },
  {
    "id": "accounting-period-timeline",
    "title": {
      "zh": "权责与现金时间：把履约、耗用和收付款分列",
      "en": "Accrual timing: separate performance, consumption and cash movements"
    },
    "paragraphs": [
      {
        "zh": "权责基础下，题定收入确认与费用归属不必和现金收付同日；预付、预收及应计项目需要按相关条件和期间处理。[3][4] 新简化模型预收3,150单位，对应七次等价课程，每完成一次确认450；完成两次后，已赚收入900、未交付余额2,250。该算例已固定确认规则，不能推广成所有真实服务合同的处理结论。",
        "en": "Under an accrual model, recognizing income or assigning expenses need not coincide with cash receipt or payment. Prepayments, advances and accruals depend on the stated facts and period.[3][4] A fresh simplified arrangement receives CU3,150 for seven equal sessions, earning CU450 per completed session. After two sessions, CU900 is earned and CU2,250 remains unearned. The example fixes its recognition rule; it is not a conclusion about every real service contract."
      },
      {
        "zh": "新例再给六个月均匀覆盖的预付保险1,800单位，已完整使用两个月，本模型费用为600、剩余预付1,200。以前已正确确认收入形成的应收款，后来收现且无新交易时，是应收转为现金，不再次增加收入。画三条时间线：服务或耗用、现金、报告期间；先写明确认规则，再计算，别只盯付款日期。",
        "en": "A separate CU1,800 insurance prepayment covers six equal months. After two full months, the model assigns CU600 expense and CU1,200 remaining prepaid balance. Collecting a receivable from previously recognized revenue, with no new event, converts the receivable to cash rather than earning revenue again. Draw separate lines for performance or consumption, cash and the reporting period; state the recognition rule before calculating."
      }
    ]
  },
  {
    "id": "accounting-depreciation-columns",
    "title": {
      "zh": "直线折旧：年费用、累计折旧与账面价值",
      "en": "Straight-line depreciation: annual expense, accumulated depreciation and carrying amount"
    },
    "paragraphs": [
      {
        "zh": "直线折旧把成本扣残值后的应折旧金额，按题定使用年限分配；这是成本分配，不是逐年估计市场价格。[5] 新例成本13,900、残值1,900、使用六个完整年度，假设估计不变且无减值或处置：年折旧2,000，三年累计6,000，三年后账面价值7,900。先辨所问是哪一列，再选数。",
        "en": "Straight-line depreciation allocates depreciable cost—cost less residual value—over the specified useful life. It allocates cost rather than revaluing market prices each year.[5] A fresh example fixes cost at CU13,900, residual value at CU1,900 and six complete years, with unchanged estimates and no impairment or disposal. Annual depreciation is CU2,000; after three years, accumulated depreciation is CU6,000 and carrying amount CU7,900. Identify the requested column first."
      },
      {
        "zh": "同一新模型计满六年后，累计折旧12,000、账面价值1,900，而非必然为零。仅对既有资产记录本期折旧，不产生一次新的现金支付；购买、维修与处置需另外看事实。复习表可并列“当年折旧／累计折旧／期末账面价值”，核本简化模型成本＝累计折旧＋账面价值，并把真实收付款另列。",
        "en": "At the end of the same six-year model, accumulated depreciation is CU12,000 and carrying amount CU1,900, not necessarily zero. Recording depreciation on an existing asset does not itself make a new cash payment; acquisition, repairs and disposal are separate events. Use annual expense, accumulated depreciation and closing carrying amount columns, checking cost against accumulated depreciation plus carrying amount under these assumptions. Record cash events separately."
      }
    ]
  },
  {
    "id": "accounting-working-capital-change",
    "title": {
      "zh": "营运资本与流动比率：差额不变，比率仍可能变化",
      "en": "Working capital and current ratio: an unchanged difference can accompany a changed ratio"
    },
    "paragraphs": [
      {
        "zh": "营运资本＝流动资产−流动负债，以金额表示；流动比率＝流动资产÷流动负债，分母为正时表示倍数。[3][6] 新例流动资产25,500、流动负债15,000单位，营运资本10,500、流动比率1.7倍。把流动应收1,700无费用收回，现金增、应收减同额，流动资产总额不变，两个指标均不变；变的是资产构成。",
        "en": "Working capital is current assets minus current liabilities, an amount. The current ratio divides current assets by current liabilities, yielding a multiple when the denominator is positive.[3][6] Fresh current assets of CU25,500 and current liabilities of CU15,000 give CU10,500 working capital and a 1.7 current ratio. Collecting a current CU1,700 receivable without fees exchanges receivables for cash: composition changes, but total current assets and both indicators remain unchanged."
      },
      {
        "zh": "从上述原始余额另设独立情景：用流动现金3,000结清同额流动应付，无其他交易。流动资产变22,500、流动负债12,000，营运资本仍10,500，流动比率却变为1.875倍。每次先分别更新分子、分母，再做减法和除法。正营运资本或较高比率不能单独证明款项及时收回、存货容易变现或所有债务都能如期偿付。",
        "en": "In a separate scenario starting from those original balances, pay a current CU3,000 payable using current cash, with no other event. Current assets become CU22,500 and liabilities CU12,000. Working capital stays CU10,500, while the current ratio becomes 1.875. Update both balances before subtracting or dividing. Positive working capital or a higher ratio alone does not establish prompt collections, saleable inventory or timely settlement of every obligation."
      }
    ]
  },
  {
    "id": "accounting-counts-review",
    "title": {
      "zh": "怎样阅读财务会计测试结果：先看六项，再做新例",
      "en": "Reading Financial Accounting Test results: inspect six counts, then try new examples"
    },
    "paragraphs": [
      {
        "zh": "全部24题有效作答后，每题选中标准答案记1，否则记0；总正确数0—24，各组0—4。完成前不补猜缺答、不提前形成完整分数。六组若为1、4、2、3、0、4，总数14；另一人4、1、3、0、4、2也得14，但需要复习的主题不同。四题的小组计数不提供精细的能力估计、常模百分位或合格线。",
        "en": "After all twenty-four items have valid answers, a keyed match earns one and another choice zero: total 0–24, each group 0–4. Missing responses are not imputed into a complete score. Counts of 1,4,2,3,0,4 total fourteen; 4,1,3,0,4,2 also total fourteen, with different revision needs. Four items per group do not yield a precise competence estimate, population percentile or pass threshold."
      },
      {
        "zh": "完成后保留每题所选、正确答案与解释，并开放六篇指南的全部30节。建议把错题标成科目分类、期间、公式、金额或所问指标，再自造一个只改变单个条件的新例。不改真实账簿，也不上传公司资料；看过答案后同题提高可能来自记忆，应以能否解释新例的每一步补充观察，而非宣称职业能力已经提升。",
        "en": "Completion shows each selection, key and explanation, plus all thirty sections across six guides. Classify an error by account category, period, formula, amount or requested indicator, then invent an example changing one condition. Use fictional records instead of altering live books or uploading company data. Improvement on a repeated, disclosed bank can reflect memory; explaining a fresh example offers a further learning observation, not proof of increased professional competence."
      }
    ]
  },
  {
    "id": "accounting-evidence-access",
    "title": {
      "zh": "题目依据与使用方式：可复算练习，不借用资格背书",
      "en": "Evidence and access: reproducible practice without borrowed certification"
    },
    "paragraphs": [
      {
        "zh": "本页所列OpenStax章节提供会计术语、记录过程、报表、调整及折旧等背景。[1][2][3][4][5][6] 题目与本页新例由费马自行编写，不复制教材练习；公式复算核的是给定事实下的数值与答案对应。它不能替代独立会计师对题意、双语表达及准则适用的审阅，也不构成本题组的测量效度、招聘预测或职业资格证据。",
        "en": "The listed OpenStax chapters provide background on terminology, recording, statements, adjustments and depreciation.[1][2][3][4][5][6] FermatMind authors the items and fresh examples rather than reproducing textbook exercises. Recalculation checks numerical consequences and keyed choices under supplied premises. It is not independent accountant review of wording, bilingual equivalence or applicable standards, nor evidence of measurement validity, hiring prediction or professional certification."
      },
      {
        "zh": "点击开始测试即可进入第一题，不需注册、邮箱、付款或先做其他测试。约12分钟是阅读估计而非倒计时；题目、全部解析与六篇指南免费。中英文使用同一组题号、选项、正确键及计分规则；语言切换不建立跨语言等值证据。按需自愿保存临时进度，具体恢复与清除行为见作答说明；分享公开指南不分享个人答案。",
        "en": "Start opens the first question without an account, email, payment or another test. Twelve minutes is a reading estimate, not a countdown; items, explanations and six guides are free. English and Chinese use the same item identifiers, options, keys and scoring rules, which does not itself establish cross-language measurement equivalence. Temporary progress saving is optional; consult the answering instructions for restoration and clearing. Public guide links do not share personal answers."
      }
    ]
  }
];

export const financialAccountingLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "财务会计测试包含哪些题型和主题？",
      "en": "What topics and task types does the Financial Accounting Test contain?"
    },
    "answer": {
      "zh": "24道单选题分六组，每组四题，练分录、利润表、资产负债表、权责时间、直线折旧和营运资本。所有事实与数值均由题目给定，不要求上传账簿。完成后可看24条解析及六篇完整指南。",
      "en": "Twenty-four single-answer items cover entries, income statements, balance sheets, accrual timing, straight-line depreciation and working capital, four per group. Items supply the facts and amounts without requesting a ledger. Completion provides twenty-four explanations and six full guides."
    }
  },
  {
    "question": {
      "zh": "借款到账为什么不直接增加利润？",
      "en": "Why does receiving a loan not directly increase profit?"
    },
    "answer": {
      "zh": "无手续费或利息的借入本身，使现金和偿还义务同额增加。本题模型把借款列为负债，而非赚得收入。后续利息、还款或其他事件应按各自条件另行处理，不能只凭银行到账判断利润。[3]",
      "en": "Receipt of the loan itself, without interest or fees, increases cash and a repayment obligation equally. The model records a liability rather than earned revenue. Later interest, repayment and other events require their own facts; a bank receipt alone does not determine profit.[3]"
    }
  },
  {
    "question": {
      "zh": "毛利、净利润和现金余额有什么区别？",
      "en": "How do gross profit, net income and cash differ?"
    },
    "answer": {
      "zh": "本版毛利按题定净销售收入减销货成本；净利润进一步扣除题目列明的其他费用。现金余额反映现金存量，收付款与收入费用可能不在同一期间，因此不能把三者互换。[2][4]",
      "en": "In this bank, gross profit is stated net sales less cost of goods sold; net income further deducts the other supplied expenses. Cash balance is a stock of cash. Receipts and payments need not fall in the same period as income and expenses, so these outputs are not interchangeable.[2][4]"
    }
  },
  {
    "question": {
      "zh": "资产负债表平衡，是否说明所有分录正确？",
      "en": "Does a balanced balance sheet prove every entry is correct?"
    },
    "answer": {
      "zh": "不说明。错科目、重复记录或错期间可能仍保持等式平衡；不平则提示有差额，也不能单凭差额定位原因。先核题定金额，再列需要进一步核对的记录，避免把算术一致当作审计结论。",
      "en": "No. Wrong accounts, duplication or the wrong period can coexist with a balanced equation. An imbalance identifies a difference without establishing its cause. Check supplied amounts and identify records needed for further review instead of treating numerical consistency as an audit conclusion."
    }
  },
  {
    "question": {
      "zh": "折旧为什么不等于资产市价下跌或当期付现？",
      "en": "Why is depreciation different from a market-price fall or cash payment?"
    },
    "answer": {
      "zh": "本版直线折旧按固定成本、残值和使用年限分配应折旧金额，不估市场价。对已购资产记本期折旧本身不产生新的付款；购置款、维修、减值或处置是需另给事实的事项。[5]",
      "en": "The bank allocates depreciable cost using fixed cost, residual value and useful life rather than estimating market price. Recording depreciation on an existing asset does not itself make a new payment. Acquisition, repairs, impairment and disposal require additional facts.[5]"
    }
  },
  {
    "question": {
      "zh": "用现金偿还流动应付，营运资本和流动比率都会不变吗？",
      "en": "Do both working capital and current ratio stay unchanged when cash settles a current payable?"
    },
    "answer": {
      "zh": "按题定同额流动现金与流动应付减少，营运资本差额不变，但流动比率不一定不变。新例25,500／15,000付3,000后为22,500／12,000，差额仍10,500，比率从1.7变1.875。必须分别计算两项。",
      "en": "Equal decreases in current cash and a current payable leave the working-capital difference unchanged, but need not preserve the current ratio. In the fresh example, 25,500/15,000 becomes 22,500/12,000 after paying 3,000: the difference remains 10,500 while the ratio changes from 1.7 to 1.875. Calculate each separately."
    }
  },
  {
    "question": {
      "zh": "同样答对14题，复习建议为什么可能不同？",
      "en": "Why can two fourteen-correct results call for different revision?"
    },
    "answer": {
      "zh": "总数把六类题相加，会隐藏各组分布。例如1、4、2、3、0、4与4、1、3、0、4、2总数都14，但错题主题不同。先看每组0—4及具体解析，再选择新练习；本版不按总数派初级、中级或高级会计师等级。",
      "en": "The total sums six topics and hides their distribution. Both 1,4,2,3,0,4 and 4,1,3,0,4,2 total fourteen, with different missed topics. Read each 0–4 count and its explanations before choosing a fresh exercise. The bank assigns no junior, intermediate or senior accountant tier."
    }
  },
  {
    "question": {
      "zh": "英文版和中文版是否使用相同答案？",
      "en": "Do English and Chinese use the same answer keys?"
    },
    "answer": {
      "zh": "两种语言共享24个题号、选项ID、正确键、六组计分与六篇指南。英文用CU表示虚构货币单位，中文用单位；切换语言不更换金融制度或考试标准。相同规则不意味着已完成双语理解或测量等值研究。",
      "en": "Both languages share twenty-four item identifiers, option IDs, keys, six scoring groups and six guides. CU in English and units in Chinese denote fictional money. Switching language does not switch reporting regimes or examination standards, and shared rules do not establish researched comprehension or measurement equivalence."
    }
  }
];
