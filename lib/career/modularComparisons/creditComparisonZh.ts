import type { ModularComparisonSpec } from '../modularComparison';

const workingCapital = {
  label: '《流动资金贷款管理办法》',
  href: 'https://credit.mot.gov.cn/zhengcefagui/202408/t20240807_4147083.html',
  approval: '贷审分离、分级审批，由有权审批人员在授权范围内按流程独立决定',
  approvalArticle: '第二十条',
  release: '独立的放款及支付审核岗位按合同核对提款条件',
};

const personalLoan = {
  label: '《个人贷款管理办法》',
  href: 'https://credit.mot.gov.cn/zhengcefagui/202408/t20240807_4147084.html',
  note: '第十九至二十二条看风险评价、独立审批及线上自动化审批，第四十三条看展期，第四十九条看特殊业务范围。',
  autoReview: '线上自动化审批须设人工复审机制和触发条件',
};

const cashFlow = {
  label: '上交所披露 · 云中马审核问询回复修订稿',
  href: 'https://static.sse.com.cn/stock/disclosure/announcement/c/202606/603130_20260603_A7RH.pdf',
  page: '第 7-1-48 页（PDF 第 48 页）',
  metric: '经营活动产生的现金流量净额',
  prior: '2024 年 6,804.50 万元',
  current: '2025 年 36,496.36 万元',
  increase: '29,691.86 万元',
  explanation: '披露方把部分变动归因于更多用票据向供应商结算，购买商品的付现减少',
};

const cashFlowSummary = `${cashFlow.metric}为 ${cashFlow.prior}、${cashFlow.current}，增加 ${cashFlow.increase}。${cashFlow.explanation}。`;

const certificateSources = [
  {
    label: '人社部《国家职业资格目录（2021 年版）》',
    href: 'https://www.gov.cn/zhengce/zhengceku/2021-12/03/5655553/files/86876724c6ee4cdcb3d0be524aee036f.pdf',
    note: "第 11 页专业技术人员职业资格序号 55，水平评价类。",
  },
  {
    label: "中国银行业协会 · 2026 年上半年初、中级考试报名简章",
    href: 'https://www.china-cba.net/Uploads/ueditor/file/20260403/69cf6b7a0e083.pdf',
    note: "第 5 页第五节（一）列专业类别，第 8 页第七节（三）列证书要求。",
  },
] as const;

export const creditComparisonZhSpec: ModularComparisonSpec = {
  pairId: 'credit-analysts-vs-loan-officers',
  locale: 'zh',
  title: "信用分析师 vs 信贷专员：授信审查与贷款前台分工对比",
  shortTitle: "信用分析师 vs 信贷专员",
  description: "比较中国大陆银行信用分析师和信贷专员的职责、审批权限、薪资口径与证照。用公开现金流材料试写一份授信审查意见和一张受理补件单。",
  regionLabel: '中国大陆银行岗位',
  authorName: '费马测试编辑部',
  datePublished: '2026-11-24',
  dateModified: '2026-11-24',
  defaultPlugins: { ai: false, thirtyDay: false },

  hero: {
    directAnswer: "同一笔企业买原料的银行贷款，信贷专员（客户经理）站在前线见企业主、收合同、核用途并交调查稿；信用分析师（授信审查）坐在中台拆财报、算现金流、挑出还款漏洞并出风险意见。对公流动资金贷款实行贷审分离，最终由有权人员在授权范围内独立审批。投递时先看自己要交哪份报告，再看部门和头衔。",
    roleA: {
      badgeTitle: '信用分析师',
      riasecLabel: "霍兰德 CEI",
      aliases: '招聘样本名称：授信审查岗、尽责审查岗',
      keywords: '财报勾稽、现金流、内部评级、审查报告',
    },
    roleB: {
      badgeTitle: '信贷专员',
      riasecLabel: "霍兰德 CES",
      aliases: '招聘样本名称：公司客户经理、普惠客户经理',
      keywords: '贷款受理、材料核验、贷前调查、调查报告',
    },
    interviewBoundaryTitle: '投递前问清你要交哪份报告',
    interviewBoundaryQuestions: [
      "在一笔采购流贷里，我首次独立交付的是贷前调查报告、授信审查意见，还是批复后的条件核验？哪一岗退回，我重新提交给谁？",
      "这类业务由分行审批还是报总行？调查报告、审查意见、最终批复和提款条件核验分别由谁负责？请按我应聘的产品和职级说一个实例。"
    ],
    riasecBoundaryNote: "费马职业兴趣资料中，两岗前两项都是常规型 C、企业型 E，第三项分别是研究型 I、社会型 S。可以分别试做财报复核和补件沟通，观察更愿意持续做什么。兴趣代码用于选择探索活动，胜任力看任务表现，录用和审批权限各看实际要求。",
  },

  topology: {
    title: "从采购流贷的调查报告到审批决定",
    summary: "以对公流动资金贷款为例，前台交可核对的调查稿，审查交带证据的风险意见，获批后另核提款条件。",
    ariaLabel: '信贷专员受理调查，信用分析师核查风险，意见提交有权人员独立审批，批复后由独立岗位核对提款条件。',
    leftZoneTitle: '信用分析师 · 授信审查',
    leftSteps: [
      { title: '重读调查材料', detail: "对照调查稿和申请原件，核报表主体、期间、异常变动与缺失证据。" },
      { title: '判断还款来源', detail: "把预计回款、采购付现和既有融资到期放到同一条时间线上。" },
      { title: '写审查意见', detail: "标明证据来源、尚待核实的风险和意见，交有权审批环节。" },
    ],
    centerZoneTitle: '两份报告怎样交接',
    upperBridge: { title: '调查稿送审', line1: '附贷款用途、材料版本和调查记录', line2: '标出尚待核验的项目' },
    lowerBridge: { title: '审查疑点回来', line1: '前台补原件并解释差异', line2: '审查更新风险意见后按权限提交' },
    rightZoneTitle: '信贷专员 · 受理与调查',
    rightSteps: [
      { title: '对接贷款需求', detail: "核清原料采购计划、用款节点、付款方式及客户提出的还款来源。" },
      { title: '核实进件材料', detail: "按调查要求查收财务和交易材料，记录收到的版本、适用期间及异常。" },
      { title: '交付调查报告', detail: "把核证过程、凭证出处和待补事项整理成书面调查结果送审。" },
    ],
  },

  matrix: {
    title: '日常职责、交付物与工作条件对照',
    summary: "以对公流动资金贷款为主。招聘样本用来识别职能，件量、上收权限和兼岗情况向目标单位核对。",
    roleAColumn: '信用分析师 · 授信审查',
    roleBColumn: '信贷专员 · 贷款前台',
    rows: [
      { id: 'work-product', dimension: "主要交付物", roleA: "交授信审查报告或意见。调查稿称回款改善时，注明查的是哪一列现金流、结论依赖哪个期间、哪些流入仍需验证。渤海武汉分行尽责审查样本要求审核调查报告和项目材料，并提交尽责审查报告。", roleB: "交材料清单和贷前调查报告。把口头用途落到合同、付款节点和用款金额，注明出处并标出缺件。渤海苏州分行的公司客户经理样本把授信材料整理、报告撰写和贷前调查列在同一职位。", defaultVisible: true },
      { id: 'working-material', dimension: "用什么材料", roleA: "把财报、应收应付与存货变动、融资余额和到期信息对齐。复核报表覆盖的主体、周转天数的口径和贷款期限是否匹配资金循环。有担保时，分别列出担保支持和还款来源。", roleB: "围绕贷款用途核材料：采购合同对应交易对象和金额，付款约定对应何时需要资金，对账材料和访谈记录用于解释款项与业务的关系。交件时区分原件可查事实和预计回款。", defaultVisible: true },
      { id: 'cash-flow', dimension: "经营现金流上升时", roleA: "先拆现金流量表的流入与流出，再读披露解释。把预计回款与到期支出按月份对齐，查票据到期是否与采购付款高峰重合，评估资金缺口。", roleB: "核客户引用财报的主体和期间，再把销售回款依据、采购合同及付款计划、票据到期明细分别列为补件。材料中若有付款方式变动，补记出处和时间。", defaultVisible: true },
      { id: 'authority', dimension: "谁提交、谁审批、谁核验放款", roleA: "审查岗形成风险意见，签署和升级职责问目标机构。适用流贷办法的业务实行贷审分离、分级审批，有权人员独立决定。贷款发放和支付审核另由独立责任部门或岗位负责。", roleB: "在调查职责内提交已核、待核事项和调查结论，按流程补件与跟进。客户追问何时能提款时，查询批复、合同条件及放款审核进度，再说明可核实的节点。", defaultVisible: true },
      { id: 'work-conditions', dimension: "工作节奏与劝退摩擦", roleA: "想看清案头审查的压力，就问实际分件量、等待补件是否计入时限、急件由谁复核，以及错漏如何记录和复盘。", roleB: "面试时问客源是否自拓、一个月要跑哪些客户、季末是否另设目标，以及补件或贷后问题分别由谁跟进。再确认首季培养期和绩效起算时间。", defaultVisible: true },
      { id: 'employer', dimension: "招聘入口与初次独立交付", roleA: "查分行风险管理、授信审查和尽责审查岗位。确认对公、普惠、个贷或金融市场业务范围，问职责是初审、复审还是评级，新人第一份独立意见由谁核。", roleB: "查公司或普惠客户经理等岗位。按产品核获客、方案、调查和贷后职责。若职位写客户经理兼授信分析，问核原件、写调查稿和送审分别要做到哪一步。", defaultVisible: false },
      { id: 'personal-scope', dimension: "换成个人贷款", roleA: "适用《个人贷款管理办法》的业务，风险评价看信用、收入、支出和偿债，生产经营用途还要分析经营和风险。面试可问收入波动由谁复核，复核人拿到哪些材料。", roleB: "先问消费还是生产经营、纯线上还是有面谈环节，再核目标产品的受理要求。若产品采用自动审批，问触发人工复审后由谁接件、谁通知客户补证。", defaultVisible: false },
      {
        "id": "institutional-split",
        "dimension": "机构分工怎么识别",
        "roleA": "公开招聘展示了几种层级：渤海武汉分行尽责审查岗位提交报告，总行授信审批部的专职审批人在权限内出具独立审批意见。该行一级分行风险总监招聘另列辖内有权限事项审批、需上报总行事项复审及放款审查管理。面试问你所在层级实际管哪些产品和额度。",
        "roleB": "渤海苏州分行的招聘样本，把前台工作放在公司业务营销团队，职位涵盖客户关系、调查和额度监测。投递到分行、支行或集中受理团队，问客户归谁维护、调查报告在哪里形成、送到分行还是集中团队、批复后谁提醒客户准备提款材料。",
        "defaultVisible": false
      },
    ],
  },

  incident: {
    title: "采购付款将至，经营现金流增加能说明什么？",
    summary: "模拟一笔原材料采购流贷。调查摘要把年度经营现金流净额增加写成销售回款改善。原件说明中还有票据结算让采购付现减少的影响。",
    triggerLabel: '审查退回点',
    triggerBody: "现有两期财报摘要缺付款计划、存量票据到期明细和预计回款依据，审查无法比较还款期内的各笔预计收支。",
    triggerCaveat: '以下为岗位交接演练，借用公开披露的分析线索。模拟申请与披露企业无关。',
    rows: [
      { stage: '受理并补证', roleLabel: '信贷专员', tone: 'roleB', verifiedFacts: "题设用途为原材料采购，调查摘要引用了两个年度的经营现金流净额。", openGaps: "采购付款安排、票据到期明细、还款期内的预计销售回款和依据。", actionAndApproval: "向客户说明补件进度，逐项列需核主体、期间及金额。收到凭证后更新调查报告，连同待核事项送审。" },
      { stage: '给出审查意见', roleLabel: '信用分析师', tone: 'roleA', verifiedFacts: "公开披露把部分现金流变动归于供应商票据结算增加及购买商品付现减少。", openGaps: "现有材料无法判断预计经营回款能否覆盖采购付款和到期票据，尤其在两项支出集中时。", actionAndApproval: "按月并列预计回款和集中到期的支出，标明证据缺口。补证后复算、更新审查意见，再提交有权审批环节。" },
      { stage: '独立决定与执行', roleLabel: '有权审批人员 → 放款及支付审核岗', tone: 'roleB', verifiedFacts: `按${workingCapital.label}核审批与放款分工，法规定位见文末。`, openGaps: '审查意见是否更新、审批决定及相应条件是否已经形成。', actionAndApproval: `${workingCapital.approval}。获批后，${workingCapital.release}，条件满足才进入发放。` },
    ],
    recoveryAcceptanceTitle: '补到什么程度可以重新送审',
    recoveryAcceptanceCriteria: "用采购凭证核用途、金额和付款节点，用票据明细核到期月和金额，给各笔预计回款标上证据和不确定性。审查对照新旧稿，记录哪些判断改变、哪笔仍缺证，有结论后再按授权送审。若缺实质证据，保留待核事项和责任人。",
    defenseLayerNote: "留四份记录：调查稿列凭证出处，审查意见列结论依据，审批记录保存有权人员决定，放款及支付审核记录注明提款条件核验结果。",
  },

  payAndCerts: {
    title: "薪资年包怎么比，三种证照怎么选",
    summary: "用同口径报价判断收入差异，按目标岗位的工作和招聘条件选证照。报名查发证方，持证要求查招聘岗位，审批权限查行内制度。",
    salaryHeading: '薪酬怎么算、定级核查什么，以及 Offer 对比口径',
    salaryBody: "国家统计局金融业大类不能给这两岗排序。看前台岗位，问是否有客户拓展、实际用信或存款考核，浮动项按目标还是实绩计发，以及新人能否独立参与调查，避免岗位只做揽客和补件。看授信审查岗，问是否考核审查质量、能否独立形成风险意见、复杂授信工作是否影响职级。绩效递延或追索扣回先核条款适用岗位、触发条件和申诉流程。两份报价统一比较保证年薪、试用期折算、目标绩效和实际发放周期。",
    certs: [
      {
        name: '银行业专业人员职业资格',
        officialScope: "国家职业资格目录列为水平评价类。中国银行业协会 2026 年上半年初、中级报名简章在专业实务下列有公司信贷、个人贷款及风险管理等类别。",
        workplaceBoundary: "持证可按实际级别和类别写入履历。用人单位说明岗位要求，流动资金贷款的审批权限由监管条款和行内授权决定。",
        verificationTips: "做企业业务先看公司信贷，做个人业务先看个人贷款。问招聘方认可哪一级和类别，投递、转正或独立接件是否有持证时间要求，再查当期简章。",
        officialLinks: certificateSources,
      },
      {
        "name": "注册会计师（中国 CPA）",
        "officialScope": "2026 年简章规定，中国公民报专业阶段须具有完全民事行为能力，并有高等专科以上学校毕业学历，或会计或相关专业中级以上技术职称。综合阶段的条件单列：完全民事行为能力，以及专业阶段考试合格证。两阶段均另查简章的不予报名情形。",
        "workplaceBoundary": "按财政部现行办法，取得全科合格等相应资格条件，并在中国境内从事审计业务满两年，可按适用规定向省级注册会计师协会申请执业注册。审计经历按规定认定，并核事务所专职执业等其他注册条件。行内贷款审批依业务授权。",
        "verificationTips": "目标是对公审查，可先做财报勾稽，再问招聘方是否认可相关科目成绩。拟从事审计执业的，查省级注协要求和 2027 年 1 月 1 日施行的修订法律。",
        "officialLinks": [
          {
            "label": "中注协 · 2026 年注册会计师全国统一考试报名简章",
            "href": "https://www.cicpa.org.cn/xxfb/tzgg/202603/W020260311354851382981.pdf",
            "note": "印刷第 1 页第一节，专业阶段、综合阶段及不予报名情形。"
          },
          {
            "label": "财政部令第 115 号 · 注册会计师全国统一考试办法",
            "href": "https://tfs.mof.gov.cn/caizhengbuling/202402/t20240207_3928476.htm",
            "note": "查修订后的第四、六、十三条与考试阶段。"
          },
          {
            "label": "财政部 · 注册会计师注册办法",
            "href": "https://jdjc.mof.gov.cn/fgzd/202204/t20220427_3806585.htm",
            "note": "第三至四条，执业证书、注册主体与境内审计经验。"
          },
          {
            "label": "教育部转载主席令第七十八号",
            "href": "https://www.moe.gov.cn/jyb_xwfb/s6052/moe_838/202606/t20260629_1441949.html",
            "note": "2026 年公布的修法自 2027 年 1 月 1 日起施行。"
          }
        ]
      },
      {
        "name": "CFA 特许金融分析师",
        "officialScope": "一级报名可走学士或同等学位、本科在读、职业经历和／或高等教育三条路径。在读路径的一级考试窗口最多可在毕业月份前 23 个月。第三条须在报名时已于至少连续三年间累计 4,000 小时，工作与教育的日期区间不得重叠，高等教育按每年 1,000 小时折算。专业工作可以和投资无关。",
        "workplaceBoundary": "取得 CFA charter 要通过三级考试、完成各级规定的实践技能模块，满足至少 4,000 小时且跨度至少 36 个月的合格经验，并提交职业推荐、获准成为 CFA Institute 正式会员（regular member）。合格经验须直接涉及投资决策或产出能支持决策的成果，按实际工作内容认定。",
        "verificationTips": "想拓到债券信用研究或投资风险时，以目标交付物对照经验要求。行内信贷方向先查招聘是否提到 CFA。报名再核证件、英语考试和地区规则，履历按实际通过的级别写。",
        "officialLinks": [
          {
            "label": "CFA Institute · CFA Program 报名政策",
            "href": "https://www.cfainstitute.org/programs/cfa-program/policies",
            "note": "Enrollment requirements 下的教育或工作经验路径及报考条件。"
          },
          {
            "label": "CFA Institute · 如何取得 CFA charter",
            "href": "https://www.cfainstitute.org/programs/cfa-program/charter",
            "note": "步骤 1–3 分别说明三级考试与实践技能模块、工作经验、普通会员及推荐。"
          },
          {
            "label": "CFA Institute · 会员申请的工作经验要求",
            "href": "https://www.cfainstitute.org/membership/types/application-resources",
            "note": "Work experience requirements 下的年限、相关性与工作形式。"
          }
        ]
      },
    ],
    interviewChecklistTitle: '面试和录用时问三件具体事',
    interviewChecklistQuestions: [
      { label: '前台绩效', question: '新增客户、实际用信和存续期管理分别怎么考核？奖金按哪个口径、何时兑现？' },
      { label: '审查绩效', question: '审查质量和件量各占什么位置？等业务团队补件的时间怎么算？' },
      { label: '证书与授权', question: '这份岗位要求哪一类证书、什么时点取得？谁给岗位审批授权，哪些业务要往上报？' },
    ],
  },

  checklist: {
    title: '用技能和工作条件分别筛岗位',
    summary: "技能栏选愿意重做的任务，条件栏选要向雇主核实的安排。每栏带一至两条问题，问到交付物和接手人。",
    skillsHeading: '想再试一次的技能',
    skillsOptions: [
      {
        "id": "reconcile-cash",
        "track": "roleA",
        "label": "复核现金流和到期债务",
        "summary": "给数字标单位、期间和出处，再对齐预计回款和到期支出。",
        "interviewQuestions": [
          "第一份审查意见要把哪些数字追到原表？"
        ]
      },
      {
        "id": "intake-docs",
        "track": "roleB",
        "label": "把用途和付款节点问清",
        "summary": "把周转用途拆成交易对象、金额和时间，逐项列凭证。",
        "interviewQuestions": [
          "新人能否跟做完整的贷前调查？口述和原件冲突时交给谁？"
        ]
      },
      {
        "id": "write-review",
        "track": "roleA",
        "label": "把风险结论写成可复核意见",
        "summary": "为一条有争议的判断写出处、前提和复核项。",
        "interviewQuestions": [
          "能否用无客户资料的例子讲讲缺证时怎样退改？"
        ]
      },
      {
        "id": "explain-missing-items",
        "track": "roleB",
        "label": "把退件原因翻成客户听得懂的补件要求",
        "summary": "说明每项缺什么、可交什么材料及对应期间。",
        "interviewQuestions": [
          "客户不能提供原件时，谁解释缺件并决定后续流程？"
        ]
      },
    ],
    conditionsHeading: '想先问清的工作条件',
    conditionsOptions: [
      {
        "id": "review-queue",
        "track": "roleA",
        "label": "集中处理材料、反复修改意见",
        "summary": "核专注读材料、等待补件与急件并行的节奏。",
        "interviewQuestions": [
          "以最近一个月为例，怎样分派急件和实地核实？"
        ]
      },
      {
        "id": "client-coverage",
        "track": "roleB",
        "label": "对外拜访并承担业务指标",
        "summary": "核客源、外勤范围及面客和写材料的分配。",
        "interviewQuestions": [
          "新人客户池怎么分？拜访范围多大，绩效何时开始考核？"
        ]
      },
      {
        "id": "review-escalation",
        "track": "roleA",
        "label": "对判断负责，并处理审查分歧",
        "summary": "核意见冲突时的复核、记录与业务上收。",
        "interviewQuestions": [
          "超分行权限的业务，我交哪份意见，谁复审？"
        ]
      },
      {
        "id": "client-after-drawdown",
        "track": "roleB",
        "label": "获批后继续跟踪客户和用信",
        "summary": "核获批后的额度、资金用途或风险预警跟踪。",
        "interviewQuestions": [
          "用信后哪些提醒仍由前台接？用途有疑点时谁复查？"
        ]
      },
    ],
    defaultInterviewQuestions: [
      "请用一个不含客户身份的例子说明，你们最近一笔同类业务中新人负责哪份材料、谁接手、怎样才算交付。"
    ],
    crossTrackNote: "喜欢分析也想持续面客，问对公客户经理是否独立写调查稿。喜欢审查也想去企业现场，问哪类件需要审查员实地核实。把实际安排记进择岗记录。",
    offlinePrintHint: '可打印这份清单，在两栏分别记下你确认的事实和下一次要问的问题。',
  },

  desktopExercise: {
    sectionTitle: '5 分钟纸面试做：同一页现金流，两份交接稿',
    summary: `读上交所回复${cashFlow.page}的经营现金流表及说明并对照监管条款；采购贷款为模拟题设，全程纸面，不查征信、不进系统。`,
    publicLinksHeading: '试做原件',
    publicLinks: [
      { label: '上交所问询回复 PDF', href: cashFlow.href, note: `${cashFlow.page}，问题 2／三现金流表。` },
      { label: workingCapital.label, href: workingCapital.href, note: '第 16 条调查、17–20 条评价审批。' },
    ],
    factSummaryHeading: '公开底稿摘录',
    factSummary: cashFlowSummary,
    taskA: { title: '信用分析师 · 现金流审查意见', instruction: '抄两期经营现金流净额、年度、单位与页码并算增量；分列披露方解释与须用原始依据核验的回款及到期支出，写明缺证处理与第二十条独立审批边界。' },
    taskB: { title: '信贷专员 · 受理补件单', instruction: '写拟采购用途与已有公开材料、至少 2 项待核凭证及其期间与用途、补齐后送审及第二十条独立审批边界。' },
    rubricTitle: '自检标准',
    rubricPassRule: '任选一轨核本轨项 + 共用项；双轨同做核全部 4 项。',
    rubricItems: [
      `审查 1｜引准${cashFlow.page}两期净额、增量、年度单位与披露说明。`,
      '审查 2｜明示须用原始依据复核实际回款与到期支出（至少写 1 项具体核验）。',
      '补件｜写清模拟用途及至少 2 类对应凭证与期间，明示补齐后送审。',
      `共用｜保留未决事项，依${workingCapital.approvalArticle}独立审批，练习止于送审与补件单。`,
    ],
    sampleAnswerALabel: '审查意见样答',
    sampleAnswerA: `${cashFlow.page}显示${cashFlowSummary}暂待补证。须按原始依据核实回款与到期支出：按月对照销售合同及银行回款流水、采购付款计划与存量票据到期明细表，核同期资金缺口。收齐原件后更新审查意见，交有权审批人员按${workingCapital.label}${workingCapital.approvalArticle}独立审批。`,
    sampleAnswerBLabel: '受理补件单样答',
    sampleAnswerB: `拟用于原材料采购。已有回复${cashFlow.page}供读表，模拟采购与付款待核。补本次采购及还款期内采购合同与付款计划（核用途、金额与付款月），补存量未到期票据覆盖期内到期明细（核集中到期日）。收齐上述凭证并标期间与来源后交授信审查，后续按${workingCapital.approvalArticle}由有权人员独立审批。`,
  },

  tools: {
    title: '按你接下来要做的事选工具',
    summary: '可以直接看岗位、探索工作条件，或把待核问题记下来。',
    cards: [
      { id: 'compare-jobs', badge: '岗位对比', meta: '手动选两岗', tone: 'neutral', title: '并排核对两个职业档案', description: '在对比工具里选择信用分析师和信贷专员，对照任务与背景。', purposeHint: '适合已有候选岗位，想把招聘条款逐项对上。', ctaLabel: '打开职业对比工具', href: '/zh/career/compare' },
      { id: 'holland-interest', badge: '兴趣探索', meta: '60 题', tone: 'roleA', title: '霍兰德职业兴趣测试', description: '查看你的兴趣六维与三字代码，辅助判断自己更享受深度财务研判还是对外商务沟通（兴趣不等于胜任力或审批授权）。', purposeHint: '适合仍在银行前中后台与金融方向间摸索兴趣的人。', ctaLabel: '测职业兴趣', href: '/zh/tests/holland-career-interest-test-riasec' },
      { id: 'career-assessment', badge: '工作偏好', meta: '94 题职业测试', tone: 'accent', title: '梳理你愿意长期接受的工作条件', description: '从工作活动、方式和条件入手，给面客指标、审件节奏与跨部门交接排探索顺序。', purposeHint: '适合方向已有眉目，但想核清自己能否扛住外拓指标或审件压力的人。', ctaLabel: '打开职业测试', href: '/zh/tests/career-planning-and-work-style-test' },
      { id: 'action-record', badge: '行动记录', meta: '工作表', tone: 'roleB', title: '整理并导出下一次面试要问的问题', description: '记录一条岗位线索和一个行动，可下载文本或 Markdown，也可在浏览器打印（仅本地内存填写，不落库）。', purposeHint: '适合已做过纸面练习、准备投递或面试。', ctaLabel: '打开职业探索工作表', href: '/zh/career/interest-worksheet#my-worksheet' },
    ],
    profileLinksLabel: '只查一岗',
    profileLinks: [
      { label: '信用分析师职业档案', href: '/zh/career/jobs/credit-analysts' },
      { label: '信贷专员职业档案', href: '/zh/career/jobs/loan-officers' },
    ],
  },

  faqs: [
    {
      "id": "first-application",
      "question": "投银行招聘，怎么从职位说明认出这两类工作？",
      "answer": "负责客户需求、申请材料和贷前调查，先看前台。负责审核调查报告、形成风险意见，再报有权人员，先看审查。若同一 JD 有两类任务，问新人第一份独立产出是哪份报告、由谁接手。"
    },
    {
      "id": "loan-extension",
      "question": "借款人想延长还款期，两岗谁来处理？",
      "answer": "还在申请时，前台记录期限需求，审查比较新还款安排，再交有权人员。已签约待放款时，核合同、批复和变更路径。已放款申请展期时，前台收原因与还款依据，风险岗评估后交机构授权人员。适用法规规定的是贷款人的评估义务，具体经办人按机构流程核（法规定位见文末出处）。"
    },
    {
      "id": "online-approval",
      "question": "如果银行采用风控模型和线上自动审批，哪些环节仍需人工？",
      "answer": "在标准化零售与小微业务中，流水提取、规则初筛与基础财报勾稽等可规则化环节适合由线上自动化风控模型处理，纯录单与机械核件的岗位护城河较薄；但两岗的核心人工判断边界依然清晰：按《个人贷款管理办法》，线上自动化审批必须设置人工复审机制和触发条件；需实地调查的流动资金贷款，由承担该职责的人员核实经营现场；对符合规定的小微贷款，机构可简化或免去现场调查。审查和审批仍按业务规定与机构授权进行。面试时可问风控模型已覆盖哪几步、异常件由谁人工接管。"
    },
    {
      "id": "certificate-use",
      "question": "考银行业职业资格证，可以直接审批贷款吗？",
      "answer": "不能。银行业职业资格属于水平评价类证书，本身不赋予贷款审批权；能否签批取决于岗位是否获得行内分级授权及对应产品范围。招聘是否要求持证需另查岗位简章，面试时直接问清哪份意见需签字、何时上收、批复后由谁核验提款条件。"
    },
    {
      "id": "offer-pay",
      "question": "信用分析师和信贷专员谁的收入高？",
      "answer": "没有同城同级数据时，先拆书面报价。面试前台信贷岗，问保证底薪、是否按新增客户或实际用信考核，以及日常是调查客户还是只催补件。面试授信审查岗，问固定薪资和奖金是否分列、复杂授信职责怎样定级、能否独立写风险意见。两岗都问清目标绩效与实际发放的差别、试用期折算，以及递延和扣回是否适用于本岗位。"
    },
    {
      "id": "choose-credential",
      "question": "银行业职业资格、CPA、CFA，准备信贷求职先选哪一个？",
      "answer": "投银行公司或个人贷款，先查银行业相应类别和录用条件。补财报分析可看中国 CPA 的会计等科目。方向扩展到投资信用研究，再看 CFA 课程与投资相关经验要求。招聘有硬条件就核级别和时间，其余情形先试做目标交付物，确定最需要补哪一项。"
    },
    {
      "id": "move-to-review",
      "question": "做了 1–2 年贷款前台，想转授信审查，要证明什么？",
      "answer": "独立写过调查稿，先证明自己做过风险分析。以获客或流转为主，先补一份可复核的审查练习。用公开材料讲清哪个口径触发疑问、如何查原件复算、结论怎样改。再问有无内部转岗和年资门槛。渤海武汉分行 2026 年 4 月的尽责审查招聘要求五年以上授信专业岗位经验，并要求近两年仍从事授信专业岗位。公告另列可适当放宽的情形。"
    },
  ],

  sourceGroups: [
    {
      id: 'loan-rules', title: '中国大陆贷款规则',
      links: [
        { label: workingCapital.label, href: workingCapital.href, note: '2024 年第 2 号令，第十四至二十条、第二十七至二十八条及第四十条。' },
        personalLoan,
      ],
    },
    {
      id: 'bank-postings', title: '银行原始招聘样本',
      links: [
        { label: '恒丰银行济南分行 · 授信审查岗', href: 'https://career.hfbank.com.cn/upload/attach/%E9%99%84%E4%BB%B61%EF%BC%9A%E6%81%92%E4%B8%B0%E9%93%B6%E8%A1%8C%E6%B5%8E%E5%8D%97%E5%88%86%E8%A1%8C%E7%A4%BE%E4%BC%9A%E6%8B%9B%E8%81%98%E5%B2%97%E4%BD%8D%E6%83%85%E5%86%B5%E8%A1%A8-2025%E5%B9%B46%E6%9C%8810%E6%97%A5.pdf', note: '2025-06-10，山东济南，序号 1，重点看审查报告及报送审批职责。' },
        { label: '渤海银行武汉分行 · 尽责审查岗', href: 'https://www.cbhb.com.cn/cbhbank/2026-04/02/article_2026040216112556734.shtml', note: '2026-04-02，湖北武汉，职位描述第 1–3、6 项。' },
        { label: '渤海银行苏州分行 · 公司业务客户经理', href: 'https://www.cbhb.com.cn/cbhbank/2024-02/26/article_2024022616014289672.shtml', note: '2024-02-26，江苏苏州，职位描述的客户关系、授信材料、调查和贷后职责。' },
        { label: '恒丰银行济南分行 · 公司及普惠客户经理', href: 'https://career.hfbank.com.cn/upload/attach/%E9%99%84%E4%BB%B61%EF%BC%9A%E6%81%92%E4%B8%B0%E9%93%B6%E8%A1%8C%E6%B5%8E%E5%8D%97%E5%88%86%E8%A1%8C%E7%A4%BE%E4%BC%9A%E6%8B%9B%E8%81%98%E5%B2%97%E4%BD%8D%E6%83%85%E5%86%B5%E8%A1%A8-2025%E5%B9%B49%E6%9C%8830%E6%97%A5.pdf', note: '2025-09-30，山东，第 2 页序号 7 的公司与普惠子项。' },
      ],
    },
    {
      id: 'compensation-credential', title: '工资口径及职业资格',
      links: [
        { label: '国家统计局 · 2025 年城镇单位就业人员年平均工资', href: 'https://www.stats.gov.cn/sj/zxfbhjd/202605/t20260515_1963707.html', note: '表 2、表 5、表 7 和附注，按统计对象及工资定义读取。' },
        ...certificateSources,
      ],
    },
    {
      id: 'public-disclosure', title: '练习原始披露',
      links: [{ label: cashFlow.label, href: cashFlow.href, note: `${cashFlow.page}，两期经营现金流净额及变动说明。` }],
    },
    {
      "id": "plan-b-evidence",
      "title": "职业兴趣参照与银行授权层级样本",
      "links": [
        {
          "label": "美国 O*NET 职业兴趣分类",
          "href": "https://www.onetonline.org/explore/interests/Enterprising/Conventional/",
          "note": "美国职业的兴趣分类对照。费马页面代码以职业兴趣资料的两条职业向量为准。"
        },
        {
          "label": "渤海银行 · 总行授信审批部招聘",
          "href": "https://www.cbhb.com.cn/cbhbank/2026-06/29/article_2026062911211193936.shtml",
          "note": "2026-06-29，新兴产业审批团队专职审批人（新能源方向）职位描述第 1 项。"
        },
        {
          "label": "渤海银行 · 管理人员市场化选聘",
          "href": "https://www.cbhb.com.cn/cbhbank/2025-09/04/article_2025090408562688450.shtml",
          "note": "2025-09-04，一级分行副行长（风险总监）职责第 2、4 项。"
        }
      ]
    },
  ],
};
