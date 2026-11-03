import type { Questionnaire } from "@/lib/questionnaires/types";

export const sqlLandingSections: Questionnaire["guide"] = [
  {
    "id": "sql-contract",
    "title": {
      "zh": "SQL测试练什么？先读数据库、输入与目标语句",
      "en": "What does this SQL Test practise? Read the engine, input and target statement"
    },
    "paragraphs": [
      {
        "zh": "本页24道原创四选一题各自列明表定义、输入行和最后要判断的SQL。四组六题分别覆盖筛选与NULL、联接与匹配、分组与聚合、窗口与约束；22题判断SELECT返回内容，另两题判断INSERT是否因约束被拒。它练习从给定资料推导结果，不要求连接数据库、上传文件或在网页输入可执行SQL。",
        "en": "Each of twenty-four original four-option tasks supplies table definitions, input rows and a final statement. Four groups of six cover filters and NULLs, joins and matches, groups and aggregates, and windows and constraints. Twenty-two ask for SELECT results and two for rejected INSERT outcomes. Infer results from the supplied material without a database connection, file upload or executable visitor SQL."
      },
      {
        "zh": "逐题按全新SQLite 3.53.4内存库核验，不能把前一道题留下的行带入下一题。答案使用竖线分列、分号分行，NULL表示数据库缺失值，不把表头计入数据行。先确认问的是行集、聚合后的一行，还是失败语句；同样一个“0”与“没有返回行”可能是不同答案。",
        "en": "Every task is checked in a fresh SQLite 3.53.4 in-memory database; carry no rows over from another item. A vertical bar separates columns, a semicolon separates rows and NULL denotes a database null, without a header row. Identify whether the question requests a row set, an aggregate row or a failed statement: zero and no returned rows can be different outcomes."
      }
    ]
  },
  {
    "id": "sql-null",
    "title": {
      "zh": "筛选与NULL：只保留条件为真的行",
      "en": "Filters and NULL: retain only rows whose condition is true"
    },
    "paragraphs": [
      {
        "zh": "WHERE保留条件为真的行，条件为假或NULL时不保留。普通等号与NULL比较不提供“这个值缺失”的判断，应区分IS NULL；BETWEEN在本题数值条件中包含上下界。[1][2] 先逐行写条件结果，再计算保留的id或数量，不要把NULL当作零或字符串“NULL”。",
        "en": "WHERE retains true conditions, excluding false and NULL. Equality with NULL does not test for a missing value; distinguish IS NULL. Numerical BETWEEN includes its endpoints here.[1][2] Trace each predicate before counting ids or rows, keeping NULL separate from zero and the text NULL."
      },
      {
        "zh": "独立新例：samples四行(id,v)为(1,NULL)、(2,0)、(3,5)、(4,5)。WHERE v IS NULL只留id1；WHERE v=NULL没有保留行；WHERE v BETWEEN 0 AND 5按id排序返回2、3、4。两条值为5的行都保留，筛选本身不自动去重。若最后改成COUNT(*)，应再把保留行数汇总成一行结果。",
        "en": "Fresh samples rows (id,v) are (1,NULL), (2,0), (3,5), (4,5). WHERE v IS NULL retains id 1; WHERE v=NULL retains none; WHERE v BETWEEN 0 AND 5 ordered by id returns 2, 3, 4. Both rows containing five remain because filtering does not itself deduplicate. A final COUNT(*) would instead summarize retained rows into one result row."
      }
    ]
  },
  {
    "id": "sql-join-grain",
    "title": {
      "zh": "联接：先数匹配行对，再看筛选与统计粒度",
      "en": "Joins: count matched row pairs before filtering and choosing a grain"
    },
    "paragraphs": [
      {
        "zh": "一个左表行匹配多个右表行时，联接会产生多行，不应先假定那是重复错误。LEFT JOIN还为未匹配左行保留补NULL的行；ON决定匹配，WHERE随后对结果筛选，因此移动条件可能改变输出。[1] “每个对象一行”“每个匹配一行”和“每组统计一行”是不同结果粒度。",
        "en": "Multiple right-side matches produce multiple joined rows rather than automatically indicating an error. LEFT JOIN also retains unmatched left rows padded with NULLs. ON determines matches before WHERE filters the joined result, so moving a predicate can change the output.[1] One row per entity, per match or per aggregate group are different grains."
      },
      {
        "zh": "独立新例：racks有10、20、30三行；pieces有(id,rack,n)=(1,10,4)、(2,10,9)、(3,20,2)。按rack=id内联接得到3行，左联接4行。把p.n>=8放WHERE只剩1行；放ON则保留3行，其中20、30补NULL。WHERE p.id IS NULL可有意找出未匹配的30，所以“右侧WHERE总会去掉所有未匹配行”并不成立。",
        "en": "Fresh racks are 10,20,30; pieces (id,rack,n) are (1,10,4), (2,10,9), (3,20,2). Joining on rack=id gives three inner-join rows and four left-join rows. WHERE p.n>=8 leaves one; putting it in ON leaves three with NULL-padded rows for 20 and 30. WHERE p.id IS NULL can deliberately retain unmatched 30, so not every right-side WHERE predicate removes unmatched rows."
      }
    ]
  },
  {
    "id": "sql-aggregate",
    "title": {
      "zh": "聚合与分组：分清行、非NULL值和组",
      "en": "Aggregates and groups: distinguish rows, non-NULL values and groups"
    },
    "paragraphs": [
      {
        "zh": "COUNT(*)数行，COUNT(v)数非NULL值；SUM(v)对非NULL输入求和。没有可加输入时，SQLite的SUM返回NULL，而COUNT(*)仍可返回0。[3] GROUP BY与HAVING进一步改变统计单位：先明确哪些行进组，再判断各组是否满足条件，不能把组条件直接当成单行筛选。",
        "en": "COUNT(*) counts rows, COUNT(v) non-NULL values, and SUM(v) sums non-NULL input. With no inputs to sum, SQLite SUM returns NULL while COUNT(*) can return zero.[3] GROUP BY and HAVING introduce group-level units: identify group members before checking group conditions."
      },
      {
        "zh": "继续使用新例samples：SELECT COUNT(*),COUNT(v),SUM(v)返回4|3|10；加WHERE v>9后返回0|0|NULL。另设ledger为(U,2)、(U,7)、(V,NULL)、(V,6)：HAVING SUM(v)>=8仅留U总额9；若改成WHERE v>=6再分组，则U为7、V为6。两种查询针对不同问题，不是可以任意替换的“优化写法”。",
        "en": "For the fresh samples table, SELECT COUNT(*),COUNT(v),SUM(v) returns 4|3|10; adding WHERE v>9 gives 0|0|NULL. Fresh ledger rows are (U,2),(U,7),(V,NULL),(V,6). HAVING SUM(v)>=8 retains U with 9. Filtering WHERE v>=6 before grouping instead gives U 7, V 6. These answer different questions rather than being interchangeable optimizations."
      }
    ]
  },
  {
    "id": "sql-window",
    "title": {
      "zh": "窗口函数：编号、并列名次与最终排序分别看",
      "en": "Window functions: separate numbering, peer ranks and display order"
    },
    "paragraphs": [
      {
        "zh": "ROW_NUMBER给窗口内各行不同序号；RANK对同组并列后留出名次间隔，DENSE_RANK不留间隔。决定哪些行并列的是窗口ORDER BY，外层ORDER BY另行控制返回顺序；给排名额外加id也可能改变并列关系。[4] 读题时把窗口排序键和最终排序键分开写。",
        "en": "ROW_NUMBER assigns distinct sequential numbers; RANK leaves gaps after peers, while DENSE_RANK does not. Window ORDER BY defines peers and an outer ORDER BY separately controls display. Adding id to a ranking order can change which rows are peers.[4] Record the two orderings separately."
      },
      {
        "zh": "独立新例ranks的(id,score)为(1,30)、(2,30)、(3,18)、(4,6)。只按score降序排名，RANK依id为1、1、3、4，DENSE_RANK为1、1、2、3。ROW_NUMBER按score降序再id编号、最后按id降序显示时，返回4|4; 3|3; 2|2; 1|1。显示顺序反转，不会重新分配窗口编号。",
        "en": "Fresh ranks rows (id,score) are (1,30),(2,30),(3,18),(4,6). Ordering ranks only by descending score gives RANK 1,1,3,4 and DENSE_RANK 1,1,2,3 in id order. ROW_NUMBER ordered by score descending then id, displayed with final id descending, returns 4|4;3|3;2|2;1|1. Reversing display does not recompute the window numbering."
      }
    ]
  },
  {
    "id": "sql-frame-cte",
    "title": {
      "zh": "窗口框架与CTE：明确当前行之前有哪些输入",
      "en": "Window frames and CTEs: identify the input available at each step"
    },
    "paragraphs": [
      {
        "zh": "累计值不仅取决于排序，也取决于框架。题本明确使用ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW时，就按逐行范围累计，不擅自换成默认框架。[4] CTE给中间查询命名；判断外层WHERE时，要先看窗口是否已经在内层对全体行计算，不能把外层条件提前代入。",
        "en": "A running value depends on both order and frame. Follow an explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW rather than replacing it with a default.[4] A CTE names an intermediate query. Before applying an outer WHERE, identify whether an inner window has already processed the full input."
      },
      {
        "zh": "继续用ranks新例，按id和上述ROWS框架累加score，依次为30、60、78、84。若先给全部四行排名，再由外层取id3，它的RANK是3；这与先筛到只有id3、再对剩余一行排名不同。复习时画出中间行集，分别标注“先算什么”“后筛什么”，不要把SQL关键字的书写顺序当作全部语义。",
        "en": "Using the fresh ranks table, SUM(score) ordered by id with that ROWS frame yields 30,60,78,84. Ranking all four before selecting id 3 outside gives rank 3; filtering to id 3 before ranking a single remaining row is different. Sketch the intermediate rows and identify what is calculated before filtering rather than treating keyword writing order as the entire semantics."
      }
    ]
  },
  {
    "id": "sql-constraint",
    "title": {
      "zh": "约束结果：UNIQUE、NOT NULL与冲突处理",
      "en": "Constraint outcomes: UNIQUE, NOT NULL and conflict handling"
    },
    "paragraphs": [
      {
        "zh": "普通INSERT重复已有非NULL唯一值，会触发本题UNIQUE约束；给明确NOT NULL列写数据库NULL也会失败。SQLite在这里对UNIQUE允许多个NULL，两种约束不能互相替代。[5] 本题未指定OR IGNORE或OR REPLACE，不能为了得到预期行数自行补冲突策略。",
        "en": "An ordinary INSERT repeating a non-NULL unique value violates the shown UNIQUE constraint, and NULL in an explicit NOT NULL column fails. SQLite permits multiple NULLs under this UNIQUE rule, so the two constraints are not substitutes.[5] Do not introduce OR IGNORE or OR REPLACE absent from the item."
      },
      {
        "zh": "独立新例：CREATE TABLE tags(v TEXT UNIQUE)后依次插入两条NULL，COUNT(*)为2；若已有文本x，再普通插入x，则UNIQUE失败；另一表声明v TEXT NOT NULL后插NULL，NOT NULL失败。失败题问的是最后一条语句，不要求推测完整应用事务、之前所有语句是否回滚或其他会话看到什么。",
        "en": "Fresh example: CREATE TABLE tags(v TEXT UNIQUE) followed by two NULL inserts gives COUNT(*) 2. With text x already present, another ordinary x insert fails UNIQUE. In a separate table declaring v TEXT NOT NULL, inserting NULL fails NOT NULL. These ask about the final statement, not an application transaction, rollback of all earlier statements or visibility to other sessions."
      }
    ]
  },
  {
    "id": "sql-review",
    "title": {
      "zh": "正确数与完整复习：24题、四项记录和28节指南",
      "en": "Correct counts and complete revision: twenty-four tasks and twenty-eight guide sections"
    },
    "paragraphs": [
      {
        "zh": "每题匹配答案键得1，其他有效选择得0；四组六题，总正确数0–24，不计时或按速度加权。两组新记录[2,5,4,3]与[5,2,3,4]同为14，却需要不同复习顺序。先看所选答案、完整输入和逐题解析，再定位漏看NULL、联接倍数、筛选阶段或窗口排序的具体位置。",
        "en": "Each keyed selection earns one, otherwise zero. Four groups of six give a 0–24 total without timing or speed weights. Fresh records [2,5,4,3] and[5,2,3,4] both total 14 but require different revision. Inspect the selection, complete input and explanation to locate a missed NULL, join multiplicity, filtering stage or window ordering."
      },
      {
        "zh": "任何正确数都能阅读全部24题解释和四篇各七节的完整指南。可先独立写出预期结果，再在可丢弃的本地内存库复算；每次只改一行或一条条件，解释结果变化。网页本身只处理选项，不执行你输入的SQL，也不需要真实业务数据。固定题本重做会受记忆影响，不能直接作为陌生任务进步的证明。",
        "en": "Every score opens all 24 explanations and four seven-section guides. Predict an output, then optionally check it in a disposable local in-memory database. Change one row or condition and explain the effect. The webpage processes choices rather than executing visitor SQL or requiring business data. Memory can improve fixed-bank retakes without establishing transfer to unfamiliar tasks."
      }
    ]
  },
  {
    "id": "sql-evidence",
    "title": {
      "zh": "SQL方言与证据范围：运行正确不等于职业认证",
      "en": "Dialect and evidence scope: reproducible output is not professional certification"
    },
    "paragraphs": [
      {
        "zh": "本版已按声明SQLite版本逐题核对22个SELECT结果与两项预期约束失败；这些运行记录可支持所给程序结果的核验。不同引擎、版本、排序规则、数据类型和配置仍可能影响语义，官方文档也需要与实际环境对照。[1][2][3][4][5] 本题没有测数据库管理、生产查询调优、权限设计或并发事务。",
        "en": "This edition checks 22 SELECT outputs and two expected constraint failures on its declared SQLite version. Those executions support verification of the supplied programs. Engine, version, collation, types and settings may matter; relate documentation to the actual environment.[1][2][3][4][5] The bank does not assess database administration, production optimization, access design or concurrent transactions."
      },
      {
        "zh": "中英文保持相同英文表名、数据值、语句和答案键，说明与解析双语，但尚无跨语言测量等值或对应人群常模研究。结果提供复习线索，不换算专业等级、百分位、招聘通过分或厂商资格。若为某场面试或考试准备，应另核其数据库方言、是否现场写查询、时限与评分方式。",
        "en": "English and Chinese preserve table names, values, statements and keys with bilingual guidance, without established measurement equivalence or population norms. Counts organize revision rather than converting to professional levels, percentiles, hiring cutoffs or vendor qualifications. For a particular interview or exam, check its dialect, live-writing format, timing and scoring."
      }
    ]
  }
];

export const sqlLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "SQL测试是现场写查询，还是读代码选结果？",
      "en": "Is this live query writing or selecting a supplied query’s result?"
    },
    "answer": {
      "zh": "本版是读所给表与SQL后四选一，不提供访问者SQL执行。题中设置与数据完整列出，能练结果推导，但不等同于从需求独立编写或调优查询。",
      "en": "Read the supplied tables and SQL, then choose one outcome. Visitor SQL is not executed. Complete setups support result inference without assessing independent query authoring or optimization."
    }
  },
  {
    "question": {
      "zh": "NULL、零和字符串NULL有什么区别？",
      "en": "How do NULL, zero and the text NULL differ?"
    },
    "answer": {
      "zh": "NULL是数据库缺失值，零是数值，带引号的NULL可为文本。应按题面类型与表达式判断；测试缺失用IS NULL，而不是假定= NULL会匹配缺失行。[2]",
      "en": "NULL is a database null, zero is numeric and quoted NULL may be text. Follow the item’s types and expressions; IS NULL tests nulls rather than assuming equality with NULL matches missing values.[2]"
    }
  },
  {
    "question": {
      "zh": "LEFT JOIN的WHERE条件一定会变成内联接吗？",
      "en": "Does a WHERE condition always turn LEFT JOIN into an inner join?"
    },
    "answer": {
      "zh": "不一定。拒绝补NULL行的条件可能去掉未匹配左行，但IS NULL等条件可以有意保留它们。要根据具体谓词和目标粒度判断，不能只凭条件写在右侧列上就下结论。[1]",
      "en": "No. A predicate rejecting padded NULL rows may remove unmatched left rows, while IS NULL can deliberately retain them. Inspect the actual predicate and desired grain rather than using a blanket right-column rule.[1]"
    }
  },
  {
    "question": {
      "zh": "COUNT(*)为0是否表示没有返回行？",
      "en": "Does COUNT(*) equal to zero mean no result row was returned?"
    },
    "answer": {
      "zh": "不一定。没有GROUP BY的计数聚合可对空输入返回一行，里面的计数是0；普通选择空输入则可能没有返回行。先读最后SELECT表达式及分组结构。[1][3]",
      "en": "Not necessarily. An ungrouped count can return one aggregate row containing zero for empty input, while an ordinary selection may return no rows. Inspect the SELECT expression and grouping.[1][3]"
    }
  },
  {
    "question": {
      "zh": "窗口ORDER BY可以替代最终ORDER BY吗？",
      "en": "Can window ORDER BY replace final output ORDER BY?"
    },
    "answer": {
      "zh": "不能这样默认。窗口排序用于相应函数的编号、排名或框架计算，最终返回顺序由外层排序决定。本题多行结果明确排序；应分别核对两处键及并列处理。[4]",
      "en": "Do not assume so. Window order governs numbering, ranking or frame calculation; outer order governs display. Multirow items specify their ordering, so inspect both keys and tie handling.[4]"
    }
  },
  {
    "question": {
      "zh": "为什么UNIQUE列的NULL不一定触发唯一约束？",
      "en": "Why might NULL in a UNIQUE column not violate uniqueness?"
    },
    "answer": {
      "zh": "在本题SQLite环境下，UNIQUE把NULL与其他值、包括其他NULL区别处理；限制缺失需要另看NOT NULL声明。不要把该规则自动推广到所有数据库或其他约束形式。[5]",
      "en": "Under this SQLite rule, UNIQUE treats NULL as distinct from other values, including other NULLs. Look separately for NOT NULL to prohibit it, without generalizing to every engine or constraint form.[5]"
    }
  },
  {
    "question": {
      "zh": "可以把结果换算成MySQL、PostgreSQL或认证考试分数吗？",
      "en": "Can this score convert to MySQL, PostgreSQL or certification results?"
    },
    "answer": {
      "zh": "不能。题本、环境、题型、计时与评分不同，也没有链接或等值研究。可以复习相关概念，正式准备以目标考试或岗位的实际要求为准。",
      "en": "No. Banks, environments, formats, timing and scoring differ, with no linking or equating study. Practise related concepts here and use the target assessment or role’s actual requirements for preparation."
    }
  },
  {
    "question": {
      "zh": "重测提高，是否已经证明SQL工作能力提升？",
      "en": "Does a higher retake prove improved SQL work performance?"
    },
    "answer": {
      "zh": "不能仅据固定题本正确数判断。看过答案、记忆、查资料和阅读方式都可能改变结果。可换数据或需求做独立新任务，再结合真实工作证据复盘；本版不设职业能力等级。",
      "en": "A fixed-bank count alone cannot establish that. Answer exposure, memory, references and reading approach may change results. Try independent new data or requirements and relate them to work evidence; this edition assigns no professional competence level."
    }
  }
];
