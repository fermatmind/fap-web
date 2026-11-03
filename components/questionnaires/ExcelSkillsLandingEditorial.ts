import type { Questionnaire } from "@/lib/questionnaires/types";

export const excelSkillsLandingSections: Questionnaire["guide"] = [
  {
    "id": "excel-task-map",
    "title": {
      "zh": "Excel技能测试练什么？四组任务与阅读顺序",
      "en": "What does this Excel Skills Test practise? Four task groups and a reading order"
    },
    "paragraphs": [
      {
        "zh": "前六题核公式返回值及复制后的引用，第二组六题核条件边界、计数、求和与精确取值，第三组处理记录关联、筛选、数据类型、空格和去重，第四组区分显示、汇总、视图及保护。先读所求对象，再列输入与操作条件，最后才计算或选择命令，避免把熟悉的函数名称当成答案。",
        "en": "The first six items cover formula returns and copied references; the next six cover condition boundaries, counts, sums and exact retrieval. The third group addresses record associations, filtering, types, spaces and duplicates. The last distinguishes display, aggregation, view and protection. Identify the requested outcome, inputs and operation before calculating rather than choosing a familiar function name."
      },
      {
        "zh": "本页属于固定题组的知识与情境练习。它不运行Excel或收取文件，也没有覆盖VBA、Power Query、完整财务模型或大型工作簿审查。四份指南在作答前后公开，完成24个有效选择后再呈现本次正确数及逐题解析；不必为了阅读完整内容购买等级或证书。",
        "en": "This is knowledge and scenario practice on a fixed bank. It neither runs Excel nor receives files, and does not cover VBA, Power Query, complete financial models or large-workbook auditing. Four guides are public before and after answering. All twenty-four valid choices open the attempt’s counts and worked review, without buying a level or certificate."
      }
    ]
  },
  {
    "id": "excel-reference-reasoning",
    "title": {
      "zh": "公式与引用：先分储存类型，再追踪坐标",
      "en": "Formulas and references: separate stored types, then trace coordinates"
    },
    "paragraphs": [
      {
        "zh": "区域SUM累加数值而忽略引用格中的文本；因此“看起来像数字”和“作为数值储存”须分开。[1] 运算符也有顺序，括号可改变先后。[3] 新例：D4为数值6、D5为文本note、D6为数值11，=SUM(D4:D6)得17；=6+11*2得28，而=(6+11)*2得34。三个结果不同，原因是输入或运算结构不同。",
        "en": "SUM adds numeric values while ignoring text in referenced cells, so numeric appearance and numeric storage differ.[1] Operator precedence and parentheses also matter.[3] In a fresh example, D4 holds numeric6, D5 text note and D6 numeric11: =SUM(D4:D6) returns17. =6+11*2 returns28, while =(6+11)*2 returns34. Different inputs or expression structures explain the differences."
      },
      {
        "zh": "复制引用时分别看行、列及美元符号：若D5含=$B5+D$2，向右两列、下一行复制到F6，得到=$B6+F$2；锁定部分不随复制位移。[2] 同工作簿跨表引用以感叹号连接，含空格表名需单引号，例如='Monthly Log'!C4。[2] 这些规则针对题定复制与引用，不应无条件套到移动、插行或外部文件。",
        "en": "Trace columns, rows and dollar signs separately when copying. Copying =$B5+D$2 from D5 two columns right and one row down to F6 gives =$B6+F$2; locked coordinates do not shift with the copy.[2] Same-workbook sheet references use an exclamation mark, with single quotes around names containing spaces, such as ='Monthly Log'!C4.[2] Follow the stated operation rather than applying copy rules unconditionally to moving, insertion or external files."
      }
    ]
  },
  {
    "id": "excel-conditions-lookup",
    "title": {
      "zh": "条件与查找：返回的是记录数、数量还是对应值？",
      "en": "Conditions and lookup: records, quantities or a corresponding value?"
    },
    "paragraphs": [
      {
        "zh": "IF按条件真或假返回不同结果；>=包括等号，>不包括。[3][4] COUNTIF统计符合条件的单元格，SUMIF则按条件选择要累加的值。[6][7] 新表为Mint/3、Plum/8、Mint/6：数Mint记录得2，加Mint数量得9。先写所求单位，再区分条件区域与累加区域，不能以“算出一个合理数”代替核对任务。",
        "en": "IF returns different outcomes for true and false conditions; >= includes equality while > does not.[3][4] COUNTIF counts qualifying cells, whereas SUMIF selects values to add.[6][7] Fresh rows Mint/3, Plum/8 and Mint/6 give two Mint records but nine units. Write the requested unit first and distinguish the tested range from the summed range; a plausible number can still answer the wrong question."
      },
      {
        "zh": "VLOOKUP的FALSE指定精确匹配，返回列序号在给定区域内计算；INDEX配MATCH则先确定查找区域内的位置，再从对齐的返回区域取值。[8][9] 缺失键返回#N/A不同于存有零。IFERROR可以替换错误返回值，却不会修复键、类型或除数。[5] 先查范围、字符与类型，再决定如何呈现缺失。",
        "en": "FALSE specifies exact matching in VLOOKUP, with the return-column index counted inside the supplied range. INDEX with MATCH first locates a position and then retrieves from the aligned return range.[8][9] A missing-key #N/A differs from a stored zero. IFERROR replaces an error return without repairing a key, type or divisor.[5] Inspect ranges, characters and types before deciding how to present missing information."
      }
    ]
  },
  {
    "id": "excel-record-integrity",
    "title": {
      "zh": "数据处理：保留记录关联，明确比较列与字符",
      "en": "Data handling: retain record associations and specify columns and characters"
    },
    "paragraphs": [
      {
        "zh": "排序调整顺序，应让一条记录的各字段一起移动；筛选则暂时隐藏不合条件的行。[10][11] 例如(编号K, Gold, 5)、(编号L, Blue, 9)、(编号M, Gold, 8)，筛选Gold且数量至少6只留下M可见。若把条件改为“或”，任务已经改变。复盘时核同一行是否同时满足条件，并保留原表对照。",
        "en": "Sorting changes order while fields in a record should travel together; filtering temporarily hides nonmatching rows.[10][11] For (K, Gold,5), (L, Blue,9) and (M, Gold,8), filtering Gold AND quantity at least six leaves only M visible. OR would change the task. Check all conditions on the same record against the source."
      },
      {
        "zh": "有前导零的文本编号需要保留字符身份，仅用数值显示掩码补零不能替代文本储存。[12] TRIM清理普通ASCII空格，不会自行清除所有Unicode空白。[13] 去重还须明确比较列：(Z1,4)、(Z1,4)、(Z1,7)按两列比较保留两行，按编号比较则是另一规则；删除会修改数据，应先留副本。[14]",
        "en": "A leading-zero text identifier needs its character identity; a numeric zero-padding display mask does not replace text storage.[12] TRIM handles ordinary ASCII spaces rather than all Unicode whitespace.[13] Duplicate removal also depends on comparison columns: (Z1,4), (Z1,4) and (Z1,7) leave two rows when both columns define equality; code-only comparison is different. Removal changes data, so retain a copy first.[14]"
      }
    ]
  },
  {
    "id": "excel-display-summary",
    "title": {
      "zh": "呈现与汇总：显示、计算、视图及保护分别核对",
      "en": "Presentation and summaries: distinguish display, calculation, view and protection"
    },
    "paragraphs": [
      {
        "zh": "题定“以显示精度为准”关闭时，数值格式改变外观而非储存值；已有数值应用百分比格式时，显示乘100并附百分号。[15][16] 新例：4.786显示两位小数为4.79，但后续计算仍用4.786；已有0.032显示一位百分比为3.2%。需要舍入的计算值，应另行选择舍入公式或数据处理，不把显示约定误作修改输入。",
        "en": "With precision as displayed off, number formatting changes appearance rather than the stored value. Percentage formatting of an existing number displays it multiplied by one hundred with a percent sign.[15][16] Fresh examples:4.786 displays as4.79 at two decimals while calculations retain4.786; existing0.032 displays as3.2%. A rounded calculation value requires a separate formula or data decision."
      },
      {
        "zh": "数据透视表须同时核分组字段和汇总计算；数值求和与记录计数回答不同问题。[17] Windows一般冻结窗格固定所选格上方的行和左侧列，它改变滚动视图。[18] column与bar图分别对应竖柱与横条。[19] 工作表保护限制锁定格的编辑，不等同文件加密或访问控制。[20] 四者外观都可整齐，作用却不同。",
        "en": "For PivotTables, check both grouping fields and aggregation: numeric sums and record counts answer different questions.[17] General Freeze Panes in Windows keeps rows above and columns left of the selection visible while scrolling.[18] Column and bar charts use vertical and horizontal bars respectively.[19] Worksheet protection restricts editing locked cells rather than providing file encryption or access control.[20] Similar-looking outputs can serve different purposes."
      }
    ]
  },
  {
    "id": "excel-score-review",
    "title": {
      "zh": "24题结果怎样读？总正确数与四项复习线索",
      "en": "How should you read the twenty-four-item result? Total counts and four review cues"
    },
    "paragraphs": [
      {
        "zh": "每题与答案一致记1，否则0；四组六题分别为0—6，总数0—24，不限时、无速度加分。新算例：公式4/6、查找1/6、数据5/6、呈现3/6，合计13/24；另一份6、3、2、2也合计13，但待复习内容不同。先看分项，再查错题的条件、所选与完整解释，总数不能代替这一步。",
        "en": "Each answer matching its key counts one, otherwise zero. Four six-item groups range from zero to six and total zero to twenty-four, without a timer or speed bonus. Fresh counts4,1,5,3 total13/24;6,3,2,2 also total thirteen but suggest different review. Inspect section counts and the conditions, selection and explanation of each missed item rather than relying on the total."
      },
      {
        "zh": "零分、部分正确和全对均可读全部24题解释与四份七节完整指南。正确数描述这次固定题组的表现，不附人群排名或初级到专家分界；题目数量、覆盖和作答方式并不能自动证明招聘或认证解释有效。看过答案重做可能反映记忆，需要新任务才能进一步观察能否迁移。",
        "en": "Zero, partial and perfect counts provide all twenty-four explanations and four full seven-section guides. Counts describe this attempt on a fixed bank without population ranks or beginner-to-expert thresholds. Item count, coverage and format do not automatically validate hiring or certification interpretations. Repeating after reading keys can reflect memory; fresh tasks provide further evidence about transfer."
      }
    ]
  },
  {
    "id": "excel-practice-method",
    "title": {
      "zh": "从选对到做对：预测、操作、核对与变式",
      "en": "From recognising to performing: predict, act, inspect and vary"
    },
    "paragraphs": [
      {
        "zh": "用全新可丢弃工作簿与虚构记录，先预测一个公式、一次筛选及一项汇总，再实际检查公式栏、可见行和汇总单位。随后只改一项条件，例如把>=改成>、把返回键改为缺失键，或把求和换成计数，先说明预期差别再核输出。这里是可选复习方法，不要求上传文件、发送真实表格或接受外界评分。",
        "en": "In a fresh disposable workbook with invented records, predict a formula, filter and summary, then inspect the formula bar, visible rows and aggregate unit. Change one condition—>= to >, a present key to a missing one, or sum to count—and predict the difference before checking. This optional review method requires no file upload, real business records or outside rating."
      },
      {
        "zh": "复盘记录可以写成“目标—输入类型—公式或命令—预期—实际—差异”。只看最终数字，可能遗漏引用错误恰好相抵、筛选记录不符或显示掩盖的小数。解释清楚哪个前提支持哪个结果，比背四个选项位置更贴近实际学习；本页没有测得这种练法的学习增益，不承诺固定提高幅度。",
        "en": "A review note can record goal, input types, formula or command, prediction, outcome and discrepancy. Final numbers alone may hide coincidentally offsetting reference errors, wrong filtered records or concealed decimals. Linking assumptions to results is more useful for understanding than memorising option positions. This page has not measured learning gains from the suggested routine and promises no fixed improvement."
      }
    ]
  },
  {
    "id": "excel-version-evidence",
    "title": {
      "zh": "版本、语言和证据：怎样把本页用于自我复习",
      "en": "Versions, language and evidence: using this page for self-directed review"
    },
    "paragraphs": [
      {
        "zh": "题目以Excel 2021／Microsoft 365的选定共同行为为参照，冻结窗格明确Windows。两语保留英文函数名、逗号和A1坐标，是本练习的书写约定；本机的本地化函数名、列表分隔符和界面可能不同。真实操作先核安装版本与当前文档，不把某一道题的路径认成所有平台的统一界面。",
        "en": "Items use selected shared behaviour of Excel 2021 and Microsoft 365, with Freeze Panes explicitly on Windows. English function names, commas and A1 coordinates are this bank’s notation in both languages; your installation may use localised names, separators or interface details. Check the installed version and current documentation rather than treating one item’s path as a universal interface."
      },
      {
        "zh": "微软支持页为具体函数、引用和命令行为提供依据，不为费马题组背书，也不能自动建立本题组的信度、效度、人群常模或跨语言等价。本页提供可核答案、完整解释和复习路径；若目标是某项招聘或正式认证，应另核该项目的真实任务、条件与评价标准。本地知识选择不替代实际工作簿操作证据。",
        "en": "Microsoft Support documents particular functions, references and commands without endorsing this bank or establishing its reliability, validity, norms or cross-language equivalence. This page supplies inspectable answers, full explanations and review paths. For a particular recruitment exercise or formal credential, check that programme’s actual tasks, conditions and criteria. Knowledge selections do not replace evidence from workbook operations."
      }
    ]
  }
];

export const excelSkillsLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "开始前需要同意、注册或先做其他测试吗？",
      "en": "Must I agree, register or take another test first?"
    },
    "answer": {
      "zh": "不需要。开始直接进入题目；草稿保存与匿名使用统计均可选，不要求账户、邮箱、付款或上传工作簿。",
      "en": "No. Start opens the questions directly. Draft saving and anonymous usage counting are optional, without an account, email, payment or workbook upload."
    }
  },
  {
    "question": {
      "zh": "SUM为什么会漏加看起来像数字的文本？",
      "en": "Why can SUM omit text that looks numeric?"
    },
    "answer": {
      "zh": "区域引用中的文本不作为数值累加；先核储存类型，再决定是否及怎样转换。改变外观不自动完成类型转换。[1]",
      "en": "Text in a referenced range is not added as numeric data. Check the stored type before deciding whether and how to convert it; appearance alone does not perform conversion.[1]"
    }
  },
  {
    "question": {
      "zh": "美元符号锁定列还是行？",
      "en": "Does a dollar sign lock the column or the row?"
    },
    "answer": {
      "zh": "$B6锁列B，F$2锁行2，$B$6同时锁两者。按复制的行列位移分别推导；移动和插入属于不同操作。[2]",
      "en": "$B6 fixes columnB; F$2 fixes row2; $B$6 fixes both. Apply copy displacement separately to rows and columns; moving and insertion are different operations.[2]"
    }
  },
  {
    "question": {
      "zh": "找不到的键可以直接当零吗？",
      "en": "Should a missing lookup key simply become zero?"
    },
    "answer": {
      "zh": "不宜默认这样处理。精确查找的缺失、有效零和空文本是不同信息。IFERROR可替换错误返回值，但应先核范围、类型及字符，并明确缺失的业务含义。[5][8]",
      "en": "Do not assume so. An exact lookup miss, a valid zero and empty text carry different information. IFERROR can replace an error return, but inspect range, types and characters and define what missing means first.[5][8]"
    }
  },
  {
    "question": {
      "zh": "TRIM能删除网页复制来的所有空白吗？",
      "en": "Does TRIM remove all whitespace copied from the web?"
    },
    "answer": {
      "zh": "不能。它针对普通ASCII空格；不换行空格等字符需要另外识别和处理，不能只凭清理后看起来整齐认定字符相同。[13]",
      "en": "No. It handles ordinary ASCII spaces. Identify and handle characters such as nonbreaking spaces separately; tidy appearance does not prove identical characters.[13]"
    }
  },
  {
    "question": {
      "zh": "数据透视表里Sum和Count有什么区别？",
      "en": "How do Sum and Count differ in a PivotTable?"
    },
    "answer": {
      "zh": "Sum累加数量，Count计算记录项数。即使按同一类别分组，结果单位也不同，应核源类型、值字段和汇总方法。[17]",
      "en": "Sum adds quantities; Count counts entries. Even with identical grouping, their units differ. Check source types, the value field and aggregation.[17]"
    }
  },
  {
    "question": {
      "zh": "冻结窗格能保护公式不被修改吗？",
      "en": "Does Freeze Panes prevent formula editing?"
    },
    "answer": {
      "zh": "不能。它固定滚动时可见的行列；工作表保护才涉及锁定格的编辑限制，但后者也不是文件加密或访问控制。[18][20]",
      "en": "No. It keeps rows and columns visible while scrolling. Worksheet protection concerns editing locked cells, but is itself distinct from file encryption and access control.[18][20]"
    }
  },
  {
    "question": {
      "zh": "同样13/24，下一步应练一样的内容吗？",
      "en": "Should two 13/24 attempts practise the same things next?"
    },
    "answer": {
      "zh": "未必。先比较四组正确数与具体错题，再用不同单元格和虚构记录重建漏掉的区别。相同总数不代表相同知识结构或实际操作表现。",
      "en": "Not necessarily. Compare section counts and specific errors, then recreate missed distinctions with different cells and invented records. Equal totals establish neither identical knowledge nor identical practical performance."
    }
  }
];
