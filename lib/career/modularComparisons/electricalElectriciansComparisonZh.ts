import type { ModularComparisonSpec } from "../modularComparison";

const roleA = "电气工程师";
const roleB = "电工";
const facts = {
  drawing: {
    label: "乌海职业技术学院换热站改造公开采购图纸",
    href: "https://www.ccgp-neimenggu.gov.cn/gpx-bid-file/150301/gpx-tender/2022/7/20/402881cc8211fcfe01821a54364b158d.pdf?accessCode=7fdd8e4f5769035d597aeb034585616a#page=1",
    note: "PDF 第 1 页看右侧图签和下方配电系统图。原件不便打开时，用本页同源摘录。",
  },
  registration: {
    label: "住房城乡建设部《勘察设计注册工程师管理规定》",
    href: "https://www.mohurd.gov.cn/gongkai/zc/wjk/art/2023/art_17339_775516.html",
    note: "第 3、6、18 至 21 条，核资格、注册、单位资质、执业和修改签章文件。",
  },
  signing: {
    label: "住房城乡建设部建市规〔2026〕1号",
    href: "https://www.mohurd.gov.cn/gongkai/zc/xzgfxwjk/art/2026/art_2063777831.html",
    note: "第一项和附件区分适用工程、专业负责人及签章文件。2026 年 6 月 1 日起实施。",
  },
  title: {
    label: "人社部、工信部工程技术人才职称制度改革指导意见",
    href: "https://www.miit.gov.cn/jgsj/rjj/wjfb/art/2020/art_09bb59c2df974722a8ee3441976f37d2.html",
    note: "第二部分第（一）项和附件第六项，核工程系列职称层级。",
  },
  permit: {
    label: "应急管理部第 19 号令",
    href: "https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202512/t20251219_589179.shtml",
    note: "第 2 至 4、9、20、23、26 至 29、49 条。核适用对象、培训考核、发证和换证。",
  },
  catalogNotice: {
    label: "三部门《特种作业目录》印发通知",
    href: "https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202605/t20260526_604988.shtml",
    note: "应急〔2026〕45号，2026 年 6 月 1 日起实施。",
  },
  catalog: {
    label: "2026 年《特种作业目录》原件",
    href: "https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202605/W020260526532904903760.pdf",
    note: "正文应急管理类 1.1、1.2、建筑施工类 12.1，末尾事项说明第一与第三项核有效高压证覆盖低压。",
  },
  construction: {
    label: "住房城乡建设部第 60 号令",
    href: "https://www.mohurd.gov.cn/gongkai/zhengce/gzk/art/2025/art_f3913c15c84e4bbc8d4fb21af3370fb8.html",
    note: "第 2、3、5 条规定适用工程、上岗和考核发证主体。",
  },
  reciprocity: {
    label: "四部门关于推进职业技能证书互通互认的通知",
    href: "https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=104536",
    note: "人社厅发〔2026〕1号第一项第（一）款，核应急管理与建筑电工两向衔接。",
  },
  training: {
    label: "应急管理部《低压电工作业人员安全技术培训大纲和考核标准》",
    href: "https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202507/W020250718424673091125.pdf",
    note: "应急〔2025〕59号附件 1，第 5.2.2.2 节列仪表及测量类别。",
  },
  skill: {
    label: "中国就业网《电工国家职业技能标准》",
    href: "https://chinajob.mohrss.gov.cn/h5/c/2019-01-03/232794.shtml",
    note: "职业编码 6-31-01-03，第 1.4 节列职业技能等级。",
  },
  skillProgression: {
    label: "人社部职业技能等级制度意见（试行）",
    href: "https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=93934",
    note: "人社部发〔2022〕14号，第二部分第（五）项、第三部分第（九）项。",
  },
  lowVoltageDesign: {
    label: "国标电子书库《低压配电设计规范》GB 50054-2011",
    href: "https://ebook.chinabuilding.com.cn/zbooklib/book/detail/show?SiteID=1&bookID=61048&isEnterprise=Y",
    note: "条目状态为现行（2012-06-01 实施），核标准有效状态与目录。",
  },
  lowVoltageDesignText: {
    label: "中国建研院建筑防火所｜GB 50054-2011《低压配电设计规范》第 1.0.2 条",
    href: "https://gf.cabr-fire.com/m/article-8342.htm",
    note: "核第 1.0.2 条正文：交流工频 1,000 V 及以下设计适用范围。",
  },
  buildingCode: {
    label: "住房城乡建设部发布 GB 55024-2022 的公告",
    href: "https://www.mohurd.gov.cn/gongkai/zc/wjk/art/2024/art_17339_765632.html",
    note: "2022 年第 50 号公告，核通用规范的强制效力、冲突处理和废止清单。",
  },
  plantStatus: {
    label: "全国标准信息公共服务平台 GB 26860-2011",
    href: "https://std.samr.gov.cn/gb/search/gbDetailed?id=71F772D7E0C7D3A7E05397BE0A0AB82A",
    note: "现行强制性国标。复审修订结论与现行标准状态分列。",
  },
  plantScope: {
    label: "国家机关事务管理局所载 GB 26860-2011 正文",
    href: "https://www.ggj.gov.cn/ztzl/tjjgswbzhgz/bzwj/201906/P020190611381551420709.pdf",
    note: "第 1 章区分发电、输变配电企业和用电单位的适用范围。",
  },
  pay: {
    label: "国家统计局《2025年城镇单位就业人员年平均工资情况》",
    href: "https://www.stats.gov.cn/sj/zxfb/202605/t20260515_1963707.html",
    note: "第三部分和表 6 至 8 为规模以上企业分岗位类别年平均工资。",
  },
  engineeringJob: {
    label: "重庆市国资委公开招聘 · 电气设计技术岗",
    href: "https://gzw.cq.gov.cn/gqzp/202602/t20260213_15441608.html",
    note: "2026 年 2 月，重庆。第（五）项，电气原理图、BOM、PLC、现场联调和制图工具。",
  },
  maintenanceJob: {
    label: "济南起步区 2026 年春风行动招聘公告",
    href: "https://jnxxq.jinan.gov.cn/col/col71555/art/2026/art_6b2282db6c9746bd8262ccc1206344e0.html",
    note: "2026 年 3 月 13 日，济南。三株福尔制药第四岗维修电工，核车间设备与公用设施。",
  },
  vocational: {
    label: "济南职业学院电气自动化技术专业培养方案",
    href: "https://qsy.jinan.gov.cn/colqsy8827/art/2024/art_qsy8827_qsy62162.html",
    note: "2023 级培养方案。第 1 节专业代码和后文课程、实践教学，属于院校样本。",
  },
  bachelor: {
    label: "教育部《普通高等学校本科专业目录（2026年）》",
    href: "https://www.moe.gov.cn/srcsite/A08/moe_1034/s3882/202604/W020260427440749576927.pdf",
    note: "工学门类 0806 电气类，080601 电气工程及其自动化。",
  },
  onetA: {
    label: "O*NET 电气工程师 17-2071.00",
    href: "https://www.onetonline.org/link/details/17-2071.00",
    note: "任务与兴趣资料为美国职业参照。",
  },
  onetB: {
    label: "O*NET 电工 47-2111.00",
    href: "https://www.onetonline.org/link/details/47-2111.00",
    note: "任务与兴趣资料为美国职业参照。",
  },
} as const;

const drawing = {
  locator: "PDF 第 1 页｜电施01/02｜第一版｜2021-07",
  area: "下方配电系统图",
  cabinet: "1AA",
  voltage: "0.4 kV",
  branch: "1AA-12",
  neighbor: "1AA-13",
  use: "备用",
  capacityRows: ["额定容量（kW）", "计算容量（kW）"],
} as const;
const drawingIdentity = `${drawing.locator}｜${drawing.cabinet} 柜｜${drawing.voltage}`;
const targetBranch = `${drawing.branch}（${drawing.use}）`;
const capacityRowLabels = `“${drawing.capacityRows[0]}”和“${drawing.capacityRows[1]}”`;
const capacityEvidence = `${drawing.branch} 的${capacityRowLabels}两栏均为空白`;
const readingBoundary = "备用是图面用途，现况与可用余量待核，当前结论为退回补证";
const designGap = "现行批准版图纸、新设备输入资料及负荷与保护复核证据";
const fieldGap = "现行批准版图纸、由获授权方确认的现场标签及台账或交接记录";
const signingScope = "自 2026 年 6 月 1 日起，工程设计资质标准规定的有关中型及以上工程建设项目，相应电气专业负责人须由对应专业的注册电气工程师担任，并在目录适用设计文件的专业负责人责任栏签字和加盖执业印章。";
const permitScope = "应急管理类目录以交流 1 kV、直流 1.5 kV 划界，等于界值归低压。有效高压电工作业证覆盖低压电工作业，低压证的范围为低压。";
const constructionScope = "建筑施工特种作业中的建筑电工，适用房屋市政工程施工现场用电工程中电源中性点直接接地的 220/380 V 三相四线制低压配电系统，涵盖安装、检查、维修和拆除（具体目录项见文末出处）。";
const constructionPath = "应急管理高、低压操作证申请建筑电工证，以及建筑电工证申请应急管理低压操作证，持有效证可按对应规定免培训、直接参加相应考核或考试，合格后再取证。";
const skillPath = "符合应急管理部现行规定的合法有效对应职业技能等级证书，可免相应安全技术培训；考核合格并取得相应操作证后方可从事该目录作业（条款见文末出处）。";

export const electricalElectriciansComparisonZhSpec: ModularComparisonSpec = {
  pairId: "electrical-engineers-vs-electricians",
  locale: "zh",
  title: "电气工程师 vs 电工：岗位区别、证照和入行怎么选",
  shortTitle: "电气工程师 vs 电工",
  description: "从中国大陆的配电改造看电气工程师与电工的图纸、现场记录、工作条件和入行门槛，分清注册签章、高低压操作证与技能等级证，并用公开采购图纸做一次纸面交接。",
  regionLabel: "中国大陆",
  authorName: "费马测试编辑部",
  datePublished: "2026-11-24",
  dateModified: "2026-11-24",
  defaultPlugins: { ai: false, thirtyDay: false },
  hero: {
    directAnswer: "工厂要新上一台大功率设备：电气工程师负责算清“从哪条配电回路取电、选多粗的线和多大的开关”，交出可复核的图纸和计算书；电工负责按图穿管接线、停电验电、排查现场跳闸故障，把方案变成真能安全送电的实物。工业调试岗可能兼做两边的部分工作，投递前先问清新人第一份交付是图纸计算书还是现场安装检修记录。",
    roleA: { badgeTitle: roleA, riasecLabel: "霍兰德 RIC", aliases: "招聘可见：电气设计技术岗", keywords: "系统图、选型计算、控制原理图、BOM 与设计校审" },
    roleB: { badgeTitle: roleB, riasecLabel: "霍兰德 RC", aliases: "招聘可见：维修电工；建筑施工另有建筑电工", keywords: "现场识图、设备维护、测量记录、班组交接" },
    interviewBoundaryTitle: "先问这两个问题",
    interviewBoundaryQuestions: [
      "新增设备时，新人负责从设备参数发起回路与保护复核，还是按有效图纸交安装和现场差异记录？请拿同类项目的一份脱敏交付物举例。",
      "发现设备铭牌、柜号和图面版本对不上，谁能退回任务、谁批准修订图、谁在证照和单位许可范围内执行现场工作？我会署名在哪一栏？",
    ],
    riasecBoundaryNote: "RIC 和 RC 取自费马岗位兴趣简码。两岗的 R 都可提示对实物、设备和动手任务的兴趣。I 对应研究分析，C 对应有条理的活动。选岗还需用实际任务、技能和工作条件验证。学历、获准作业范围、工程签章和录用另有各自条件。",
  },
  topology: {
    title: "换热站要加一台设备，谁能决定用哪条回路？",
    summary: "工程师根据设备和系统资料提出供电方案，现场电工根据有效文件交回可核实的现场信息。柜上标签与系统图不符时，先沿柜号、支路、图号定位差异。",
    ariaLabel: "从电气方案到现场记录，再回到设计复核的交接示意",
    leftZoneTitle: "工程师 · 方案与验证",
    leftSteps: [
      { title: "确认设计输入", detail: "核设备负荷、接口与系统现状。" },
      { title: "把约束写进文件", detail: "回路、选型依据和验收条件可追溯。" },
    ],
    centerZoneTitle: "同一配电柜和支路",
    upperBridge: { title: "设计侧交出", line1: "批准版图纸与适用范围", line2: "本次交接的验收依据" },
    lowerBridge: { title: "现场侧回传", line1: "柜号、回路和标签差异", line2: "现场记录及其资料来源" },
    rightZoneTitle: "电工 · 现场与记录",
    rightSteps: [
      { title: "对照目标设备", detail: "找对应图号、柜号与工作范围。" },
      { title: "交回现场证据", detail: "记录所见、未核实项和交接人。" },
    ],
  },
  matrix: {
    title: "工程设计与现场电工的八项区别",
    summary: "以下以供配电设计、工业电气设计和现场安装维护为对照（公开招聘与院校样本见文末出处）。各厂、项目和班组的排班、授权与任务占比，请向目标雇主问清。",
    roleAColumn: "电气工程师 · 设计与验证",
    roleBColumn: "电工 · 现场与维护",
    expandButtonLabel: "展开工作环境、入行和标准",
    collapseButtonLabel: "收起补充对照",
    rows: [
      {
        id: "work-object",
        dimension: "每天面对什么",
        roleA: "在配电项目，把设备输入、系统容量及安装条件转化为回路和设备规格。在工业设备岗，按工艺要求出控制原理图、物料清单（BOM）和联调验收项。",
        roleB: "面对已经指定的配电柜、线路、生产设备、公用设施或故障工单。应聘制造或物业维修岗时，问清生产设备与公用设施在本班组怎样分工。",
        defaultVisible: true,
      },
      {
        id: "deliverable",
        dimension: "什么交付算做完",
        roleA: "配电项目交系统图、回路表、选型或计算说明和待验条件。能说明一项设计修改牵动哪些文件、计算输入从何处来、谁校对。工业设备验收时，核测试记录与控制图和 BOM 的版次。",
        roleB: "向下一班、负责人或验收人员交已完成的工作范围、设备和回路身份、记录与待办。现场发现标签与图纸不同，要能标明实际位置和引用版次，方便复核者辨认是现场标识有误、图纸过期，还是已有变更尚未归档。",
        defaultVisible: true,
      },
      {
        id: "tools",
        dimension: "工具用来解决什么",
        roleA: "用 CAD、EPLAN 或 CAD Electrical 把电路与器件清单对齐，配合 PLC 联调、计算书和测试记录检查方案约束。面试问第一份图来自公司标准图框、项目存档还是设备供应商。",
        roleB: "按岗位用图纸、工单和设备标签定位对象，合规作业中的检测记录可能涉及万用表、钳形表或绝缘检测仪表。面试问谁按现场要求选择和管理仪表、你负责哪些记录、复核者怎样找回同一台设备。求职作品可展示脱敏记录和读图判断。",
        defaultVisible: true,
      },
      {
        id: "ownership",
        dimension: "谁复核与签字",
        roleA: `${signingScope} 一般制造设备团队可由岗位指定的设计、校审与验证人员分工。拿到岗位说明时，分开问内部图纸签审和工程执业签章。`,
        roleB: "先核实际操作项目对应的证和有效状态，再核单位的工作安排与授权。电工可按分工记录所见与完成情况，设计变更由对应责任人处理。签字代表记录还是验收，向用人单位确认。",
        defaultVisible: true,
      },
      {
        id: "tradeoffs",
        dimension: "哪种工作摩擦更难熬",
        roleA: "输入资料晚到、设备改型或投标与现场版本不同，会带来复算、重画和再评审。若你想做方案，问前半年是否会收到带原始输入的计算任务，是否有同事逐条讲清退图原因。项目调试也可能要求出差。",
        roleB: "生产停机窗口、急修与班组接力会压缩核对记录的时间。若你希望在带教中学排故，问谁陪新人处理第一批工单、夜间谁接单、移交流程怎么保留当班无法确认的问题。让雇主拿实际班表说明节奏。",
        defaultVisible: true,
      },
      {
        id: "employers",
        dimension: "雇主与岗位去向",
        roleA: "主要去向包括建设工程设计院、工业装备制造企业的电气控制研发部以及大型工厂的工程部门。面试区分建筑强电供配电、弱电系统或工业控制，问清要交系统图、控制程序还是板级原理图。",
        roleB: "先按工作对象搜索建筑电工、设备维修电工和变配电运行等岗位，再看对应证照。楼宇维护要问是否涉及房屋市政工程施工或日常设施维护，工厂要问主要顾生产设备还是公用工程，变配电岗位要问现场设施范围与班组安排。",
        defaultVisible: false,
      },
      {
        id: "entry-growth",
        dimension: "入行与后续分岔",
        roleA: "学历和专业先按目标雇主核。本科电气工程及其自动化等专业可把电路、电机、电力系统或控制课设做成可复核作品。后续可深耕配电或控制设计、项目技术协调，或冲刺注册电气工程师专业负责人。",
        roleB: "职业教育可看电气自动化技术等专业方向及实践教学安排（院校培养样本见文末出处）。就业先核目标场景证照、考训时间与班组带教；入行后可向复杂设备排故、技能等级评聘或班组管理发展。",
        defaultVisible: false,
      },
      {
        id: "standards",
        dimension: "两个国标分别管什么",
        roleA: "GB 50054-2011《低压配电设计规范》现行，适用于新建、改建、扩建工程中交流工频 1,000 V 及以下低压配电设计；建筑项目还需核强制性通用规范 GB 55024-2022，有冲突时以通用规范为准（条文见文末出处）。",
        roleB: "GB 26860-2011《电力安全工作规程 发电厂和变电站电气部分》为现行强制性国标，按设施电压等级划界（发电企业 66 kV、输变配电企业 35 kV、用电单位 220 kV，均含本数），适用达标单位在运电气设备及相关场所，其余单位可参考使用。",
        defaultVisible: false,
      },
    ],
  },
  incident: {
    title: "模拟交接：图上是备用，交接单却写着已占用",
    summary: `这次只模拟文件流转。公开换热站图纸把 ${drawing.branch} 标为“${drawing.use}”，该回路的${capacityRowLabels}两栏均为空白。模拟交接便条却写着后来已占用。先把两条不同来源的记录写进同一张差异单。`,
    triggerLabel: "触发退回的记录差异",
    triggerBody: "设备组希望在这条回路上挂一台新换热设备。交来的资料只有旧采购图、未署名便条和未定型设备名称。便条没有拍摄日期、柜号关联或交接签收，设备组尚未提供选型资料。",
    triggerCaveat: "模拟安排由配电设计负责人复核方案，运维负责人确认现场记录来源，项目指定审批人确认文件释放，文控发送新版本。实际项目的资格和审批还需由责任单位确定。",
    rows: [
      {
        stage: "提交设计待核项",
        roleLabel: roleA,
        tone: "roleA",
        verifiedFacts: `登记图面用途和两处容量空栏，分列未核实的交接便条（图号与版次见文末出处）。`,
        openGaps: "索取设备输入资料、现行系统图和负荷与保护复核依据。等现场身份和现用状态有可信记录后，判断复用该回路、调整方案还是另选回路。",
        actionAndApproval: "设计人员形成差异与待核清单，提交设计负责人复核。若需要改图，按适用工程的签审职责办理，文档先保持待批准状态。",
      },
      {
        stage: "提交现场证据",
        roleLabel: roleB,
        tone: "roleB",
        verifiedFacts: "登记便条和待核柜号、回路，便于运维查历史改造和运行台账。",
        openGaps: "待运维负责人确认获授权记录人、可接受的现场资料、记录日期和来源。若台账与照片仍不一致，分别保留原记录和不一致项。",
        actionAndApproval: "获授权的现场方提交带来源的身份与状态资料，运维负责人复核并交设计。现场电工按分工提供证据，审批流由项目任命人员处理。",
      },
      {
        stage: "核对新旧记录再移交",
        roleLabel: "项目指定审批人",
        tone: "roleA",
        verifiedFacts: "对照原图、经运维负责人确认的记录、现行图纸及设计复核单，逐一找得到柜号、支路、用途、文件版次。保留旧版编号以便追溯。",
        openGaps: "缺设备资料、身份确认或设计复核时，保留差异单和补件人。",
        actionAndApproval: "两侧负责人复核各自材料，指定审批人确认文件可移交，文控发出批准版，现场方确认收到。",
      },
    ],
    recoveryAcceptanceTitle: "什么时候可以恢复文件移交？",
    recoveryAcceptanceCriteria: "同一对象的柜号、回路和现行图号已匹配。历史图的用途和现场核实结论各有可追溯凭据，设备输入与负荷、保护复核有责任人确认，签审和发放记录完整。若新资料仍无法判断占用状态，差异单继续退回并明确下一位补证人。",
    defenseLayerNote: "这里的验收对象是文件交接。现场工程的许可、停复电、试验和投运是另行受控的活动，题设只做阅读和记录。",
  },
  payAndCerts: {
    title: "薪酬怎么并排比，三类证照分别管什么",
    summary: "先按目标任务判断自己需要的是设计执业资格、目录作业上岗证还是技能等级评价，再比同城同阶段的实际 Offer。岗位头衔可写在招聘单上，工程系列职称用于专业技术水平评价，注册执业另有资格、注册和单位要求。",
    salaryHeading: "薪酬怎么算、定级核查什么，以及 Offer 对比口径",
    salaryBody: "国家统计局 2025 年规上企业分岗位大类数据无法拆出电气工程师与电工的全国中位数，但两者的薪酬结构与职级核查维度区分清晰（具体固浮比以书面 Offer 为准）：电工岗位的薪酬按合同与班制可拆为“底薪 + 加班费／夜班津贴 + 特种作业或技能等级补贴”等项，入职前可核清实际工时、班制与企业技能等级评聘或班组管理晋升路径；电气工程师按企业制度可拆为“固定月薪／年薪 + 项目奖／出差调试补贴”，入职前可核清复杂工程负责经历、装备／电网／新能源平台职责与注册电气工程师执业签章如何计入定级与奖金评定。投递时留意避开把高加班换来的总额当轻松月薪，也避开只抄图不碰计算校审的纯制图岗。拿到同城同阶段 Offer 后，把固定年薪、夜班／驻场补偿、工时与培训周期放到同一年度折算。",
    certs: [
      {
        name: "注册电气工程师 · 供配电／发输变电",
        officialScope: `${signingScope} 资格证之后需按规定注册。建设工程勘察设计执业须核受聘单位及其相应资质。`,
        workplaceBoundary: "区分参与制图、内部校审、担任项目的专业负责人三层工作。注册执业签章随专业、项目和具体文件核对。设备制造厂的电气工程师岗位可能交控制图和厂内试验记录，先看它的实际工作是否进入通知覆盖的工程设计。",
        verificationTips: "问招聘方四项内容：项目类别与资质标准中的规模，注册专业，拟任角色，须本人签章的文件。如果想报考，到拟报名地看当年基础和专业考试的学历及累计电气工程设计经历要求。",
        officialLinks: [facts.signing, facts.registration],
      },
      {
        name: "特种作业操作证 · 高压、低压与建筑电工",
        officialScope: `应急管理部第 19 号令与现行目录自 2026 年 6 月 1 日施行。生产经营单位人员直接从事目录作业，先满足对应考训和取证要求。${permitScope}`,
        workplaceBoundary: `${constructionScope} 这项作业按住建体系核资格。省级住建主管部门负责认定，可依法委托设区市住建主管部门实施考核相关工作。${constructionPath}`,
        verificationTips: "对着实际任务问高低压电压类别、作业范围、用人单位所属场景和证照查询途径。职位写持电工证时，请对方给出完整证名、操作项目和发证体系；应急管理特种作业操作证有效期为 6 年，届满仍需从业须按规换证（条款见文末出处）。",
        officialLinks: [facts.permit, facts.catalog, facts.construction, facts.reciprocity],
      },
      {
        name: "电工职业技能等级证书",
        officialScope: `电工国家职业技能标准 6-31-01-03 列五级至一级，分别对应初级工、中级工、高级工、技师和高级技师。${skillPath}`,
        workplaceBoundary: "技能等级可作为企业评聘技能岗位或晋升的材料，岗位价值看单位认可的等级和能力证据。报名时先查评价机构、工种、申报条件及企业能否认可该项评价。",
        verificationTips: "请雇主区分招聘写的是技能等级还是对应操作证。若准备走免相应安全技术培训的路径，请考核发证机关确认手中证书的有效性与申请作业是否相应。",
        officialLinks: [facts.skill, facts.permit],
      },
    ],
    interviewChecklistTitle: "拿到 Offer 前把这些条件说具体",
    interviewChecklistQuestions: [
      { label: "固定收入和补偿", question: "试用期和转正各有多少固定税前收入？夜班、待命、停线检修和驻场分别怎样排班、计时和计算津贴？" },
      { label: "证照与带教", question: "第一批任务对应哪一类证？哪几项可以先观察或整理资料，哪几项取证和单位授权后才安排？谁复核新人记录？" },
      { label: "签字与交接", question: "能否给我看一份脱敏的图纸或工单签审栏？我签的是设计、复核、实物作业记录还是文件接收？哪些文件会由他人签发？" },
    ],
  },
  checklist: {
    title: "分开核对你愿意练的技能和能接受的工作条件",
    summary: "每栏先选最接近真实决定的一两项，把提问带去面试。分别记下交付物与实际班表、项目和带教条件。",
    skillsHeading: "我愿意练哪种交付物",
    skillsOptions: [
      { id: "design-requirements", track: "roleA", label: "从设备输入追到系统图", summary: "为一个回路做设计输入索引，标出设备需求、限定条件与资料版次。", interviewQuestions: ["新人第一次做选型会拿到哪些设备资料？谁带我核计算假设，改版后怎样留依据？"] },
      { id: "design-acceptance", track: "roleA", label: "给设计约束配一条验收依据", summary: "把一条要求、用于验证的记录和复核人写清。", interviewQuestions: ["请举一个图纸已完成但验收被退回的例子。最后补了哪条证据，谁复核？"] },
      { id: "field-identification", track: "roleB", label: "执行任务前先核实设备身份", summary: "练习将图号、柜号、回路和来源逐项对应，发现不一致时能写出补证需求。", interviewQuestions: ["工单上的编号与柜上编号不匹配时，哪个同事调历史台账？新人怎样提交差异和跟进？"] },
      { id: "field-turnover", track: "roleB", label: "让下一班看懂未完成事项", summary: "把维保记录里的已核项、待核项及负责人交代清楚。", interviewQuestions: ["交班时怎样处理当班仍无法确认的故障？请举一项最后转设计或设备供应商的工单。"] },
    ],
    conditionsHeading: "我能接受哪些现场与排期",
    conditionsOptions: [
      { id: "design-review", track: "roleA", label: "接受多专业催资料和复核退图", summary: "设计任务取决于建筑、设备、工艺等输入。比较近一次延期由谁通知、怎样改交付时点。", interviewQuestions: ["上次设备资料到晚了，谁调整优先级？新人需要对接几方，退图能得到什么校审反馈？"] },
      { id: "design-travel", track: "roleA", label: "接受项目节点的现场工作", summary: "设计岗也可能跟勘查或联调，出差与驻场按具体岗位核。", interviewQuestions: ["最近一个项目现场跟了几天？到场当天是确认接口、解答图纸，还是要承担另有证照要求的操作？"] },
      { id: "field-shifts", track: "roleB", label: "接受实际班次与应急安排", summary: "核值班周期、夜班替班方式和停机检修窗口，分清常规排班和召回。", interviewQuestions: ["能看一份近期匿名排班吗？临时停线的故障谁到场，非工作时间怎样补偿？"] },
      { id: "field-location", track: "roleB", label: "接受相应现场、体力和移动要求", summary: "厂内、工地和电站的现场差别很大。问具体环境、驻点、体力负担及带教。", interviewQuestions: ["上一班任务涉及哪几个区域？要站立、走动或搬运多久？新手独立值班按什么标准确认？"] },
    ],
    defaultInterviewQuestions: ["请用最近一个已完成项目或一次班组交接说明这个岗位第一季度的交付。谁给资料、谁接手、什么情况下允许退回？"],
    crossTrackNote: "如果你愿意做系统图，却更喜欢固定班次，先找厂内工程与设计支持岗位核实常态排班。如果你喜欢现场定位，也愿意做设计证据，问调试岗是否有明确的设计验证任务和资料权限。让主管具体说明两份交付各占哪个工作阶段。",
    offlinePrintHint: "打印后可以在两栏分别留下勾选和面试答复，便于对照两个雇主的说法。",
  },
  desktopExercise: {
    sectionTitle: "5 分钟试做：同一张配电图，两份交接",
    summary: "任选一轨凭摘录 5 分钟纸面完成（原件见下方），零通电、零现场操作。",
    publicLinksHeading: "原件 PDF",
    publicLinks: [{ label: "乌海换热站改造配电图 PDF", href: facts.drawing.href, note: "第 1 页下方系统图 1AA 柜与 1AA-12/13。" }],
    factSummaryHeading: "离线摘录与模拟输入",
    factSummarySegments: [
      { text: drawingIdentity, tone: "code" },
      { text: `。${drawing.area}中 ${targetBranch} 与相邻 ${drawing.neighbor}（${drawing.use}）并列，${capacityEvidence}。目标为 ${drawing.branch}。模拟便条（无署名／日期／来源）称：“12 路已被占用。”角色：设计负责人、运维负责人、文控。` },
    ],
    taskA: {
      title: "工程师轨 · 设计复核请求",
      instruction: `写图面身份、${targetBranch} 及相邻分支、${capacityRowLabels}空白，分列图面用途与未核便条；列${designGap}与提供人，交设计负责人复核并在对齐前保持待批准。`,
    },
    taskB: {
      title: "电工轨 · 班组差异交接单",
      instruction: `写相同身份字段、相邻分支与容量栏空白，分列图面用途与便条（指明缺署名／日期／来源）；列${fieldGap}，交运维负责人确认来源并转设计，结论退回补证。`,
    },
    rubricTitle: "自检与样答",
    rubricHeading: "每轨检查三项（共用 2 + 本轨 1）",
    rubricPassRule: "任选一轨命中 3 项即完成。",
    rubricItems: [
      `共用 1｜写准 ${drawingIdentity}、${targetBranch} 与相邻 ${drawing.neighbor}，记 ${capacityEvidence} 并分列用途与未署名便条。`,
      `共用 2｜结论为“${readingBoundary}”，全程仅纸面读图。`,
      `工程师轨｜列${designGap}及补件方，交设计负责人，齐备前待批准。`,
      `电工轨｜指明便条缺署名／日期／来源，列${fieldGap}，交运维负责人确认并转设计。`,
    ],
    sampleAnswerALabel: "工程师轨样答",
    sampleAnswerA: `${drawingIdentity}，目标 ${targetBranch}（相邻 ${drawing.neighbor} 另列），${capacityEvidence}。图面为备用，便条称已占用且未核，结论：${readingBoundary}。仅纸面读图：向文控索现行批准版，请设备方补输入、设计组补负荷与保护复核，交设计负责人，齐备前待批准。`,
    sampleAnswerBLabel: "电工轨样答",
    sampleAnswerB: `${drawingIdentity}，登记 ${targetBranch}（相邻 ${drawing.neighbor} 另列），${capacityEvidence}。图面为备用，便条称已占用但缺署名、日期与来源，结论：${readingBoundary}。仅纸面读图：向文控核批准版，向运维负责人申请获授权现场标签与台账，差异单交运维负责人确认并转设计，状态待核。`,
  },
  tools: {
    title: "选一项工具解决现在的求职问题",
    summary: "已有目标岗位就对照档案，有试做结果就记下后续问题，仍在选方向时可梳理工作偏好。",
    cards: [
      { id: "career-compare", badge: "已圈定两岗", meta: "对照职责", tone: "neutral", title: "并排查看两份职业档案", description: "在对比工具中手动选电气工程师和电工，按对照结果回查招聘单上的交付和职责。", purposeHint: "适合手上已有两个岗位或两个方向，要核区别的人。", ctaLabel: "手选两岗对照", href: "/zh/career/compare" },
      { id: "worksheet", badge: "已找到要补的信息", meta: "行动记录", tone: "roleA", title: "记下证照、带教和交接的面试问题", description: "把你完成的纸面材料、最想确认的现场条件和下一步写进表里，按需复制、下载或打印。", purposeHint: "适合已经试做，或准备和带教、招聘经理聊清分工的人。", ctaLabel: "打开职业探索工作表", href: "/zh/career/interest-worksheet#my-worksheet" },
      { id: "holland-interest", badge: "先摸清兴趣", meta: "60 题", tone: "roleB", title: "霍兰德职业兴趣测试", description: "查看你的兴趣六维与三字代码，辅助判断自己更享受系统研究设计还是动手实操（兴趣不等于胜任力或持证资格）。", purposeHint: "适合还在工程设计与一线技能岗之间摸索兴趣的人。", ctaLabel: "测职业兴趣", href: "/zh/tests/holland-career-interest-test-riasec" },
      { id: "career-assessment", badge: "核工作条件", meta: "94 题", tone: "accent", title: "梳理能接受的工作活动和条件", description: "用职业测试整理对出差、夜班、体力负荷与协作方式的偏好，带着结果核对真实班次与项目。", purposeHint: "适合两条都感兴趣，但想核清夜班与出差耐受度的人。", ctaLabel: "打开职业测试", href: "/zh/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "继续看两份单岗职业档案",
    profileLinks: [
      { label: roleA, href: "/zh/career/jobs/electrical-engineers" },
      { label: roleB, href: "/zh/career/jobs/electricians" },
    ],
  },
  faqs: [
    {
      id: "engineering-with-operator-card",
      question: "有低压电工证，可以应聘电气工程师吗？",
      answer: `可以投允许你凭设计能力和经历应聘的岗位，涉及规定项目的签章则要另满足注册执业条件。低压电工证覆盖相应现场作业，它可说明你的上岗范围。应聘时拿一份能说清设计输入和复核依据的作品，问清职位是否要求独立校审。${signingScope}`,
    },
    {
      id: "engineer-with-field-work",
      question: "本科读电气或做工程师，什么时候需要电工操作证？",
      answer: "只承担图纸和设计分析时，按设计职责核资格。直接从事目录内的调试、安装或检修时，按对应操作项目核证。按应急管理部现行培训考核规定，中职（含技工学校）及以上学历毕业生申请与所学专业相应的操作证，持学历证明并经考核发证机关同意，可免相应安全技术培训，但考核和取证仍须办理（条款见文末出处）。面试时区分现场解释图纸、协助验证与亲自作业三类任务。",
    },
    {
      id: "high-low-construction",
      question: "高压证能做低压吗，低压证能去做建筑电工吗？",
      answer: `持有效应急管理高压证可从事低压电工作业。持低压证想做目录内的建筑电工作业，先向住建部门申请相应资格。${constructionScope}${constructionPath}用实际场景核报考项目。`,
    },
    {
      id: "skills-or-permit",
      question: "已有技能等级证，入行时先补哪一张证？",
      answer: `应聘要亲自从事目录作业的岗位，先核对应操作证。准备参加企业技能晋升或评聘时，查单位认可的工种和等级。${skillPath}新八级工制度在五级序列基础上向下补设学徒工，符合条件的工种可向上设特级技师、首席技师岗位，并按评聘办理。问单位实际设有哪些岗位，免培训事项则问考核发证机关。`,
    },
    {
      id: "pay-comparison",
      question: "电气工程师和电工谁工资高？",
      answer: "公开统计缺少两岗全国同口径排序，两者的薪酬结构与成长核查维度侧重不同（具体固浮比以书面 Offer 为准）：受雇电工的薪酬方案按合同与班制可拆为底薪、加班／夜班津贴及技能等级补贴等项，面试时可重点核对工时、班次补偿以及企业技能等级评聘或班组管理晋升路径；电气工程师按企业制度可拆为固定年薪加项目奖／驻场调试补贴，面试时可重点核对复杂项目负责经历、装备／电网体系与注册电气工程师执业签章如何计入定级与奖金评定。投递时留意避开把高加班总额当轻松月薪或只抄图不碰校审的岗位；拿 Offer 对比时，务必把夜班时长、停线加班频次、驻场补贴与固定发薪月数折算到同一年比较。",
    },
    {
      id: "ai-and-automation-boundary",
      question: "如果团队用 CAD 自动出报表或用仪表预警，两岗还要人工做哪一步？",
      answer: "目前缺少两岗可比的岗位替代实证，无法给出替代比例。从分工边界看：设计侧可用 EPLAN 从项目数据按模板生成报表，仍须由相应人员复核负荷与保护、协调专业接口，依法需要签章时由符合条件的注册执业人员承担；现场侧的智能监测仪表可辅助预警，但非结构化工业现场的停电验电、故障定位拆装、高／低压合规作业仍高度依赖持证电工亲手完成。求职时真正要警惕的是停留在纯抄图或只会换灯泡不碰控制回路的低附加值工作。",
    },
    {
      id: "career-switch",
      question: "维修电工想转电气工程师，先补学历还是作品？",
      answer: "目标设计岗明确卡专业和学历时先核准入，满足要求后优先补能复核的设计作品。转调试或工程支持可以先用脱敏的故障记录和交接单证明识图与定位，再看要补的控制、测试或方案验证。转配电设计则练习从设备输入追到系统图、选型理由与验收依据。注册方向另外核报考与工程设计经历。",
    },
    {
      id: "physical-or-schedule",
      question: "哪条路更累，想少出差或少夜班怎么选？",
      answer: "顾虑夜班就优先看班表与待命量，顾虑出差就优先看项目驻场记录。工程师的出图与复核压力会集中在项目节点，工业调试岗位也可能在现场。电工的体力、巡检区域与夜班安排随现场和班组变化。比较同一雇主两个岗位时，请主管谈最近一次停机或验收，问工作持续多久、谁必须到场、能否换班。",
    },
  ],
  sourceGroups: [
    { id: "design-authority", title: "注册执业、工程职称与设计规范", links: [facts.signing, facts.registration, facts.title, facts.lowVoltageDesign, facts.lowVoltageDesignText, facts.buildingCode] },
    { id: "field-authority", title: "电工作业准入、证书衔接与现场标准", links: [facts.permit, facts.catalogNotice, facts.catalog, facts.construction, facts.reciprocity, facts.training, facts.skill, facts.skillProgression, facts.plantStatus, facts.plantScope] },
    { id: "drawing-source", title: "纸面试做的配电图原件", links: [facts.drawing] },
    { id: "career-context", title: "工作样本、教育与薪酬口径", links: [facts.engineeringJob, facts.maintenanceJob, facts.vocational, facts.bachelor, facts.pay, facts.onetA, facts.onetB] },
  ],
};
