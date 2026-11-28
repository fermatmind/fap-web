import type { ModularComparisonSpec } from "../modularComparison";

const roleA = "化学工程师";
const roleB = "化学家";

const tenderTitle = "江苏宿迁生态化工科技产业园化工中试基地建设项目设计招标公告（资格后审）";
const tenderOwner = "宿迁宏创中试化工有限公司";
const tenderPlatform = "江苏省公共资源交易网";
const tenderOrigin = "宿迁市公共资源电子交易平台";
const tenderNumber = "E3213010313109423001001";
const inspectionPublisher = "湖南省市场监督管理局";
const inspectionTitle = "关于2025年第5期重点工业产品质量省级监督抽查情况的通告";
const inspectionAttachment = "湖南省重点工业产品质量省级监督抽查不合格产品及企业名单（2025年第5期）";

const sources = {
  law: { label: "《中华人民共和国危险化学品安全法》", href: "https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=104478", note: "第五、四十四、四十六至四十八条及施行日期，核单位职责、研发与使用范围。" },
  processSafety: { label: "应急管理部 AQ/T 3034—2022《化工过程安全管理导则》", href: "https://www.mem.gov.cn/fw/flfgbz/bz/bzwb/202212/P020221213629120014097.pdf", note: "第 1 节、4.7.2.3 及附录 A 表 A.4，核范围、HAZOP 与工艺资料类型。" },
  construction: { label: "应急管理部《危险化学品生产建设项目安全风险防控指南（试行）》", href: "https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202206/W020230110632652505669.pdf", note: "应急〔2022〕52号附件，查看安全条件与安全设施设计等阶段的审查资料。" },
  tender: { label: tenderTitle, href: "https://jsggzy.jszwfw.gov.cn/jyxx/003001/003001001/20260512/a311c14f-7c7e-403e-a5cd-bc3c726b22ad.html", note: `2026-05-12，${tenderPlatform}刊载，来源${tenderOrigin}，招标人${tenderOwner}。查第 1.7 节和第 4.3.1 节。` },
  exam: { label: "上海市 2026 年勘察设计注册工程师执业资格考试通知", href: "https://rsj.sh.gov.cn/tkwap_17826/20260805/t0035_1442914.html", note: "报考条件、报考事项及附件，含化工工程师考试。" },
  qualification: { label: "北京人社公开的注册化工工程师暂行规定及考试办法", href: "https://rsj.beijing.gov.cn/xxgk/2024zcwj/202406/t20240617_3717378.html", note: "载人发〔2003〕26号配套原件。暂行规定第二至四条、第二十至二十七条与第三十二条，实施办法第三至五条。" },
  registration: { label: "福建省住建厅勘察设计注册工程师注册办事问答", href: "https://zjt.fj.gov.cn/hygl/fjsjszyzgzczx/cjwtjd/zccjwt/201803/t20180320_5336649.htm", note: "办理事项含化工专业，列电子注册证书及申报路径。" },
  titlesEngineering: { label: "人社部、工信部工程技术人才职称制度改革意见", href: "https://wap.miit.gov.cn/jgsj/rjj/wjfb/art/2020/art_09bb59c2df974722a8ee3441976f37d2.html", note: "人社部发〔2019〕16号，见制度体系、评价标准和附件。" },
  titlesResearch: { label: "人社部、科技部自然科学研究人员职称制度改革意见", href: "https://www.mohrss.gov.cn/zyjsrygls/ZYJSRYGLSzhengcewenjian/201905/t20190510_317508.html", note: "人社部发〔2019〕40号，见分类评价和职称评价基本标准。" },
  cmaScope: { label: "市场监管总局 CMA 资质认定事项清单与能力项目库公告", href: "https://www.cnca.gov.cn/zwxx/gg/2026/art/2026/art_ea8b715814fb4cb5a72e571ee20e5fe4.html", note: "总局 2026 年第 14 号公告，核机构申请范围与 CMA 标志使用。" },
  cmaAssessment: { label: "市场监管总局《检验检测机构资质认定评审准则》", href: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/rkjcs/art/2023/art_b97b0b1addbf4e8aaca43cb26f13883b.html", note: "第九、十一、十二条，核人员、设备、方法验证、记录与质量控制。" },
  reportRules: { label: "市场监管总局《检验检测机构监督管理办法》", href: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2025/art_bff8f35d8f114acca7643bddd77e9505.html", note: "总局令 101 号修订版，第二条、第八至十三条核机构、人员与签发。" },
  cnas: { label: "CNAS-CL01-G001:2024《检测和校准实验室能力认可准则的应用要求》", href: "https://www.cnas.org.cn/cms_files/filemanager/328304128/attach/202412/B52A4930D248E664DE12F03CF3596F96.pdf#page=3", note: "第 6.2.2 条自印刷页 2 起，授权签字人注释位于印刷页 3。" },
  chemicalAnalysis: { label: "CNAS-CL01-A002:2020 化学检测领域应用说明", href: "https://www.cnas.org.cn/cms_files/filemanager/328304128/attach/202412/F007DEDD6A15262A4A32005BDE998EEB.pdf", note: "第 7.2 节，核化学检测方法验证与确认的工作范围。" },
  jobs: { label: "中国石油大学（华东）转载中石油 2026 秋招岗位表", href: "https://cce.upc.edu.cn/2026/0930/c2643a501691/page.htm", note: "2026-09-30，第 12、13 家单位的上海材料研发与南通通州湾新材料工艺原始招聘行。" },
  industry: { label: "宜昌公共资源交易平台化工工程设计招标文件", href: "https://ggzy.sc.yichang.gov.cn/jyxx/003001/003001002/20250930/2b97103e-47d6-4669-8dd2-b2c20b79106d.html", note: "2025-09-30，核“工艺设计包括但不限于”段所列物料与能源衡算、图纸和设备表。" },
  postdoc: { label: "中国科学院化学研究所 2026 年博士后招聘启事", href: "https://ic.cas.cn/notice/202601/t20260112_8101596.html", note: "北京，2026-01-12。核招收条件与岗位表中物理化学、分析化学和高分子等方向。" },
  platform: { label: "中国科学院化学研究所分析测试中心招聘启事", href: "https://ic.cas.cn/re/202609/t20260908_8279453.html", note: "北京，2026-09-08。岗位职责和条件说明透射电镜技术支撑及本科及以上学历要求。" },
  wage: { label: "国家统计局《2025年城镇单位就业人员年平均工资情况》", href: "https://www.stats.gov.cn/sj/zxfbhjd/202605/t20260515_1963707.html", note: "2026-05-15 发布，第三节、表 6 至表 8 与附注的全国规上企业统计口径。" },
  inspection: { label: inspectionAttachment, href: "https://amr.hunan.gov.cn/amr/zwx/xxgkmlx/tzggx/202601/33900718/files/fac39e4f49f0411498fb5bb535b3b86a.pdf#page=69", note: `${inspectionPublisher}《${inspectionTitle}》附件 1，印刷页 69 第 503 行。` },
} as const;

const tenderScope = "第 1.7 节";
const tenderLead = "第 4.3.1 节";
const tenderSequence = "方案设计、初步设计、施工图设计";
const tenderCredentials = "一级注册建筑师或注册化工工程师执业资格证书";
const inspectionLocator = "附件 1 印刷页 69 第 503 行";
const inspectionReport = "G2025-02-J480883";
const inspectionItem = "PE100 给水管材";
const inspectionFindings = "灰分、炭黑含量";
const registrationScope = "注册化工工程师对应化工工程设计、技术咨询及相应业务。考试、取得资格、在单位办理注册和对适用文件签章是不同步骤。";
const reportScope = "适用监管办法的正式检验检测报告由授权签字人在其技术能力范围内签发，并加盖机构公章或检验检测专用章。";
const scaleUpScope = "《危险化学品安全法》第四十四条要求研发单位管理研制过程安全，禁止把未经小试、中试、工业化试验的危险化学品新工艺、新技术直接用于工业化生产。";

export const chemicalChemistsComparisonZhSpec: ModularComparisonSpec = {
  pairId: "chemical-engineers-vs-chemists",
  locale: "zh",
  title: "化学工程师 vs 化学家：工艺放大、实验分析与入行对比",
  shortTitle: "化学工程师 vs 化学家",
  description: "按中国大陆岗位样本比较化学工程师与化学家的日常交付、工艺放大、实验分析、注册与签发权限，并用两份公开文件纸面试做。",
  regionLabel: "中国大陆",
  authorName: "费马测试编辑部",
  datePublished: "2026-11-24",
  dateModified: "2026-11-24",
  defaultPlugins: { ai: false, thirtyDay: false },
  hero: {
    directAnswer: "实验室烧杯里合成出几克新材料只是第一步：化学家（科研／材料研发／分析）负责搞清分子机理、配方表征和分析方法；化学工程师负责把这几克安全、省钱、合规地“放大”成工厂里成千上万吨的连续反应釜产线。想跑通中试放大与工艺设计，先看化学工程师；想深挖材料机理与仪器表征分析，先看化学家。",
    roleA: { badgeTitle: roleA, riasecLabel: "霍兰德 RIC", aliases: "招聘样本：化工工艺技术", keywords: "放大、物料衡算、流程图、设计及变更记录" },
    roleB: { badgeTitle: roleB, riasecLabel: "霍兰德 IRC", aliases: "招聘样本：有机及高分子材料研发工程师", keywords: "材料表征、方法验证、原始数据、技术结论" },
    interviewBoundaryTitle: "岗位都写研发时，追问这两件事",
    interviewBoundaryQuestions: [
      "新材料项目到中试前，我先交带版次的工艺设计底稿，还是带样品编号的研究和分析记录？请举一项上一届新人交过的成果。",
      "材料指标出现偏差时，谁复核方法与原始数据，谁更新工艺文件，谁有权签发报告或批准本单位继续推进？",
    ],
    riasecBoundaryNote: "费马职业档案的前三兴趣维度为化学工程师 RIC、化学家 IRC。兴趣只描述偏好，岗位技能、就业条件与依法适用的资格需另核。",
  },
  topology: {
    title: "一款材料准备从小试走向中试，两边各交什么？",
    summary: "材料数据要能追到批次、方法和结果边界，工程文件要能追到设计依据、版次和待评审项。",
    ariaLabel: "化工放大与材料分析通过批次证据包交换要求与验证缺口",
    leftZoneTitle: "化工工艺设计",
    leftSteps: [
      { title: "核对设计基线", detail: "识别适用的设计范围和资料版本。" },
      { title: "形成工程交接", detail: "登记文件差异、待补资料及审查责任。" },
    ],
    centerZoneTitle: "中试评审资料",
    upperBridge: { title: "工艺侧提出", line1: "批次与指标核对范围", line2: "待澄清的设计假设" },
    lowerBridge: { title: "分析侧交回", line1: "方法版本与原始证据", line2: "结果适用范围和缺口" },
    rightZoneTitle: "材料研发和分析",
    rightSteps: [
      { title: "核对分析证据", detail: "串起批次、方法、原始记录与结果。" },
      { title: "交付可复核结论", detail: "说明结论覆盖范围与待确认事项。" },
    ],
  },
  matrix: {
    title: "看交付物、审查责任和日常工作",
    summary: "工艺设计、工厂生产技术、材料研究和第三方检测均有自己的工作边界。下表从工程与实验两种任务出发，具体职位以项目和招聘团队的分工为准。",
    roleAColumn: "化学工程师 · 工艺设计和技术",
    roleBColumn: "化学家 · 化学研究和分析",
    rows: [
      { id: "output", dimension: "交付什么", defaultVisible: true, roleA: "设计方向交工艺流程图、工程计算依据、设备资料和跨专业接口清单。生产技术方向可以从既有工艺文件做变更说明，整理偏差所涉记录与责任人。", roleB: "研究方向交实验记录、材料表征数据和能被同行复核的解释。分析岗位可交方法验证记录、原始信号索引和结果草稿。能从一条结论回到方法版本、样品标识和原始记录，比列出用过的仪器更能说明能力。" },
      { id: "methods", dimension: "用哪些工具和方法", defaultVisible: true, roleA: "围绕物料衡算、工艺流程图（PFD）和管道及仪表流程图（P&ID）工作。工艺工程师需要能说清计算假设、图纸接口与文件变更的关系。例如，PFD 帮你看明白流程和主要物流，P&ID 用来定位设备、管道和仪表之间的连接。面试时核岗位是否要亲自建流程模拟模型，还是负责设计文件、资料复核和现场协调。", roleB: "分析方向核方法对目标样品基体与浓度范围是否适用，复核正确度和精密度等方法验证证据。材料表征平台也有透射电镜等工具，化学所分析中心的公开岗位还涉及设备维护和测试技术支撑。应聘前问日常负责方法开发、仪器平台服务，还是按现行方法交报告草稿。" },
      { id: "handoff", dimension: "遇到指标异常先看什么", defaultVisible: true, roleA: "从样品所对应的批次出发，检查工程文件版次、历史变更条目和批次来源记录能否对上。把可能受影响的设计依据列给工艺负责人评审，保留未经证实的原因。", roleB: "核样品代表性、数据能否追溯、方法本身的适用范围以及质量控制记录。把结果分成可复核的发现、证据不足的观察和下一份应补文件。若两个批次的方法版本不同，先把可比性写进交接说明。" },
      { id: "authority", dimension: "谁签字或放行", defaultVisible: true, roleA: registrationScope + " 担任设计项目负责人、参与 HAZOP、批准内部变更和授权实际执行各有岗位分工。应聘时要求看文件台账中的编制、校核、审核和负责岗位。", roleB: reportScope + " 研究结论、内部质量判定及对外检验报告是不同交付。分析人员先问自己能否复核结果，以及单位由谁核定和更新个人授权范围。" },
      { id: "employers", dimension: "去哪里找岗位", defaultVisible: true, roleA: "主要去向包括石化工程公司、设计院、大型化工／新材料制造厂，以及新能源电池材料与半导体电子化学品产线。同一企业招聘样本中，生产技术技能岗接受本科，工艺技术岗要求硕士，但部分化工园区位于城市远郊或专属工业区，投递前务必核清工作地点与通勤。", roleB: "主要去向包括高校、科研院所、药企／材料企业研发中心和第三方 CMA／CNAS 检测机构。高校院所及部分核心研发岗会在招聘公告中列出硕士或博士学位要求，化学专业本科生若不想直面高学历竞争，可重点核对分析测试平台或工艺转化类岗位要求。" },
      { id: "working-conditions", dimension: "工作节奏怎样核对", defaultVisible: false, roleA: "设计项目有版本审查和跨专业返改，工厂或中试支持可能涉及现场和轮班。如果岗位说明提到现场支持，问上轮是谁驻场、由谁接班、设计新人参与到了哪一步，再按目标团队的答复安排通勤和投递。", roleB: "原始记录补齐、仪器排队、方法转移和样品交付期限都可能影响节奏。公共平台重服务排期，课题研究还要面对结论反复修订。请招聘方讲一周有多少时间用于仪器和记录，异常由哪个岗位追，假日或晚上是否有明确的值班安排。" },
      { id: "growth", dimension: "怎样看成长与试用期", defaultVisible: false, roleA: "从负责一份图纸或校对表开始，争取跟一次跨专业审查，了解本专业退回项怎么关闭。想靠近项目设计责任，问能否积累可由单位证明的工程设计经历。想留在现场技术，问半年内能否看到一次有复核记录的工艺问题闭环。", roleB: "从能复核一条数据开始，争取承担方法适用性说明、研究小课题或技术报告。有意进入研究系列，问单位的代表性成果和聘用标准。若你想做方法但试用期只有流水式送样，没有人讲原始数据和质量控制，投递前核清轮岗和带教安排。" },
      { id: "border", dimension: "跨界岗位怎么选", defaultVisible: false, roleA: "工艺研发、技术转移和中试工程可横跨研发与工厂。请主管指一份退回过的工程交付，问问题来自设计输入、资料版次、跨专业接口还是现场证据，并确认谁补、谁验、谁签。", roleB: "同名材料研发岗可能偏表征、方法或者产品开发。问成果主要按材料机理、方法表现、客户指标，还是产业化节点验收。" },
    ],
  },
  incident: {
    title: "同一批材料出现指标偏差，谁把证据交给谁？",
    summary: "模拟一家材料企业评审给水用聚乙烯项目的中试资料。研发给出新批材料数据，工艺组正在核工程文件，质量组发现记录中两个批次的检测方法版次标记不一致。下列审批分工属于题设，实际项目按适用程序和岗位授权确认。",
    triggerLabel: "触发问题",
    triggerBody: "两个批次的汇总结果看起来有差异，新批次的原始记录索引却未连到方法版次。项目评审会希望判断差异能否作为工程变更依据。",
    triggerCaveat: "这个例子只处理证据和文件状态。方法比较、工程变更和项目推进分别留存决定，纸面结论不触发设备、样品或生产动作。",
    rows: [
      { stage: "实验与分析复核", roleLabel: roleB, tone: "roleB", verifiedFacts: "两份摘要可以定位到各自的批次号，目前只看到结果和待核的方法版次。", openGaps: "缺与新批次对应的原始记录索引、可用方法版本和相关质量控制记录，无法确认可比性或把差异归因给材料。", actionAndApproval: "分析人员整理数据沿革和证据缺口，交实验室技术复核人核定方法与结果。涉及正式对外报告时，转交具备相应范围的授权签字人处理。" },
      { stage: "工程影响与审查", roleLabel: roleA, tone: "roleA", verifiedFacts: "现行设计依据和新版送审材料之间可以做版次差异比对。", openGaps: "缺可引用的批次分析结论，也缺新版设计文件与当前基线相互对应的审查记录。", actionAndApproval: "工艺工程师列出受影响文件和待澄清事项，提交项目指定技术负责人。模拟设定由该负责人组织审查并决定是否继续提交文件，获授权的文控人员执行版本发行；现场行动另由本单位按实际权限管理。" },
    ],
    recoveryAcceptanceTitle: "何时可以重新提交这份材料",
    recoveryAcceptanceCriteria: "能由同事从结论找到同一批次的原始记录、适用的方法版次和分析复核结论，质量组已标清是否可比较；工程侧同步列出采用的依据、受影响文件版本和对应审查决定，未关闭事项仍明确标注。两边指定的复核责任人均能用索引复走一遍，再由模拟项目的技术负责人确认可进入文件评审。",
    defenseLayerNote: scaleUpScope + " AQ/T 3034—2022 在化工生产和危险化学品储存企业的相关建设项目范围内写明基础设计阶段的危险与可操作性分析（HAZOP）要求。会议意见、工程文件校审和项目阶段批准分别核实。涉危化的科研、学校及检测机构也需依该法核实本单位的安全职责与人员培训。",
  },
  payAndCerts: {
    title: "看薪酬时核收入构成，看证照时核实际职责",
    summary: "预计走设计院项目责任路线，就先看注册与项目文件。预计走科研岗位，就先看成果要求和职称系列。预计做对外检测，就先看机构对应范围、人员培训与签发授权。",
    salaryHeading: "薪酬怎么算、定级核查什么，以及 Offer 对比口径",
    salaryBody: "国家统计局 2025 年“专业技术人员”均值无法拆出两岗全国排序，比较两岗待遇时宜按学历层级、所属行业与岗位职责核查薪酬结构（具体固浮比以书面 Offer 为准）：化学工程师可向目标单位确认固定月薪，以及是否另计项目产值奖、产线绩效或驻场与轮班补贴，面试时可重点确认大型装置设计经历与注册化工工程师执业资格是否纳入定级与奖金评定；化学家可向高校或院所确认固定基本薪酬、聘期和有无课题绩效，向药企、材料或检测机构确认方法开发职责如何计入职级，同时留意避开纯流水线重复测样、缺少方法开发空间的基层化验岗。比较同城同级 Offer 时，务必统一固定薪月、项目绩效兑现条件、园区／轮班补贴与合同聘期。",
    certs: [
      { name: "注册化工工程师", officialScope: registrationScope + " 现行报考通知列化工专业。基础、专业两级的普通报考路径分别核学历或学位、专业类别与化工工程设计实践年限。", workplaceBoundary: `暂行规定要求适用的主要技术文件由注册化工工程师签字盖章，具体文件种类和项目要求要核适用依据。部分化工中试基地或大型工程设计招标中，会将拟派项目负责人的注册化工工程师（或相应注册执业资格）列为硬门槛（公开案例见文末出处）。厂内生产技术、实验研究和一般分析招聘先看实际职责。`, verificationTips: "报考前带毕业证专业名称和设计经历向拟报考地考试管理机构核对；入职前请设计单位说明可积累的项目经历、是否拟任负责人、文件清单和注册单位。", officialLinks: [sources.exam, sources.qualification, sources.registration, sources.tender] },
      { name: "工程系列与自然科学研究系列职称", officialScope: "工程技术系列有助理工程师、工程师等层级，自然科学研究系列有研究实习员、助理研究员、副研究员、研究员等层级。后者区分基础研究与应用研究、技术开发等评价路径。", workplaceBoundary: "工程项目成果和学术或应用研究成果可分别作为相应系列评价材料。取得职称后的岗位聘用、岗位待遇、具体文件的签章或报告签发，还要分别看单位聘用和适用授权。", verificationTips: "向人事索取本单位聘岗、申报系列、评审周期与代表性成果口径。校招若只列专业学历，优先问本岗能否形成申报所需的承担项目或研究记录。", officialLinks: [sources.titlesEngineering, sources.titlesResearch] },
      { name: "CMA 资质认定、CNAS 实验室认可与签发授权", officialScope: "CMA 对应检验检测机构在规定范围内的资质认定。CNAS 实验室认可评价实验室在获认可范围内的能力。列入机构范围后，仍须核个人被认可或授权的具体字段。", workplaceBoundary: reportScope + " CMA 评审准则要求授权签字人具备相关中级及以上职称或者同等能力，并符合技术能力要求。按 CNAS 第 6.2.2 条的注释，带认可标识或联合标识的报告或证书，由经 CNAS 认可的授权签字人在授权范围内签发。两种机构范围与实际检项应分别核查。", verificationTips: "先看证书附表是否覆盖相关地址、报告对象、方法或能力项目，再问岗位做记录、数据复核还是代表机构签发。针对 CMA，另核报告项目是否在机构获准范围，该项目的报告能否使用资质认定标志。向质量负责人核授权清单和培训安排。", officialLinks: [sources.cmaScope, sources.cmaAssessment, sources.reportRules, sources.cnas] },
    ],
    interviewChecklistTitle: "决定接受 Offer 前，请招聘方给具体例子",
    interviewChecklistQuestions: [
      { label: "税前年收入", question: "固定工资实发几个月？出差与轮班另计吗？项目或课题绩效以什么记录结算，试用期是否同样适用？" },
      { label: "职责与资历", question: "新人上次交的是计算与图纸、方法和报告草稿，还是项目进度汇总？可以积累什么可证明的工程设计或研究经历？" },
      { label: "签审与授权", question: "什么文件需要注册人员签章？如果对外签发报告，机构的能力范围和人选的授权范围由谁确认？" },
    ],
  },
  checklist: {
    title: "选出愿意练的技能和能接受的工作条件",
    summary: "技能栏可以帮助你决定先做哪种作品。工作条件栏用来判断是否要筛选某种班次、地点或合同。",
    skillsHeading: "我愿意练的文件与证据",
    skillsOptions: [
      { id: "design-version", track: "roleA", label: "核计算依据与工艺文件的版次", summary: "从变更说明找到对应设计文件，记录影响的专业和复核人。", interviewQuestions: ["谁带新人走第一次图纸校审？我负责补齐哪张涉及工艺和设备的接口表？"] },
      { id: "risk-review", track: "roleA", label: "把过程安全评审意见追到文件", summary: "识别审查意见归属、证据和关闭状态，能让接手人复走。", interviewQuestions: ["上一次 HAZOP 意见由谁整理、谁对应到设计版次、谁复核已闭合？"] },
      { id: "method-trace", track: "roleB", label: "从结果追回批次与方法", summary: "能辨别手里的是抽查摘要、原始数据还是经签发报告。", interviewQuestions: ["新人交的结果记录怎样复核？一条存在疑义的谱图由谁接手，需补什么材料？"] },
      { id: "research-argument", track: "roleB", label: "用材料表征支持可检验的解释", summary: "标出观察、解释和证据空白，愿意为不同解释补记录。", interviewQuestions: ["上次结果与原假设不一致，课题组如何调整结论、保留证据与确认后续任务？"] },
    ],
    conditionsHeading: "我能接受的现场和实验室安排",
    conditionsOptions: [
      { id: "pilot-site", track: "roleA", label: "接受中试节点可能需要去现场", summary: "分清驻场、短期出差以及现场工艺支持的实际频率。", interviewQuestions: ["最近一轮中试新人在哪个城市待了多久？夜间由谁值班，什么时候需要工程师到场？"] },
      { id: "design-review", track: "roleA", label: "接受跨专业退回和节点交付", summary: "对齐工艺、仪表和项目文件时要反复核版本。", interviewQuestions: ["图纸被下游退回时，工艺、仪表与质量分别负责哪一部分？节点冲突由谁定优先级？"] },
      { id: "instrument-schedule", track: "roleB", label: "接受仪器排期和数据复核", summary: "按目标组实际工作量比较实验、文档和平台服务。", interviewQuestions: ["仪器档期紧时，报告交付如何调整？这岗是否承担仪器开放预约、维护或出结果值班？"] },
      { id: "research-contract", track: "roleB", label: "接受研究周期和成果考核", summary: "问项目聘期、续约规则以及成果或公共服务记录如何考核。", interviewQuestions: ["前一年主要考核论文、项目节点、技术报告还是平台服务？谁确认成果和署名？"] },
    ],
    defaultInterviewQuestions: ["请用一个已结束的项目，说清新人交哪份文件、谁退回过、退回以后补的哪份证据。"],
    crossTrackNote: "如果你想做材料分析又愿意在中试节点去现场，先找材料研发或分析平台中带技术转移职责的岗位，逐一核方法职责与驻场安排。技能选择和工作条件各自保留，不合成适合度。",
    offlinePrintHint: "可以打印这两栏，在每道面试问题旁写下雇主举的具体例子。",
  },
  desktopExercise: {
    sectionTitle: "5 分钟试做：中试审核 vs 抽查追溯",
    summary: "任选一轨凭卡纸笔完成（出处见文末），零仪器样品。",
    publicLinksHeading: "原件",
    publicLinks: [
      { label: "宿迁中试设计招标", href: sources.tender.href, note: "第 1.7、4.3.1 节。" },
      { label: "湖南市监抽查名单", href: sources.inspection.href, note: "页 69 第 503 行。" },
    ],
    factSummaryHeading: "离线卡",
    factSummarySegments: [
      { text: `工程｜${tenderPlatform}《${tenderTitle}》（招标人 ${tenderOwner}，${tenderNumber}）：${tenderScope}列${tenderSequence}；${tenderLead}列${tenderCredentials}。`, tone: "strong" },
      { text: ` 分析｜${inspectionPublisher}《${inspectionTitle}》${inspectionLocator}（《${inspectionAttachment}》）：${inspectionReport}，${inspectionItem}，不合格项${inspectionFindings}。`, tone: "strong" },
    ],
    taskA: { title: "工程轨 · 工艺审核单", instruction: `引原件主体定位，列三类设计与 ${tenderLead}“或”条件；划出“有证即获批”误判，写 2 类待补证据、接手人及签章／审批／现场边界。` },
    taskB: { title: "分析轨 · 抽查追溯单", instruction: `引原件主体定位，抄 ${inspectionReport}、${inspectionItem} 与${inspectionFindings}；划出“不合格即工艺问题”误判，写 2 类待补证据、接手人及签发／评审／现场边界。` },
    rubricTitle: "4 项自检",
    rubricPassRule: "命中 2 共用 + 本轨 1 项过关。",
    rubricItems: [
      "共用 1｜引准主体、标题与定位（工程含平台／招标人／编号；分析含通告／附件／报告号／样品／不合格项）。",
      "共用 2｜写 2 类待补证据与接手人，区分签章／签发、评审批准与现场执行。",
      `工程轨｜列全${tenderSequence}与${tenderLead}“或”条件，分资格与获批，索同版文件与审查意见。`,
      `分析轨｜限${inspectionItem}公示项（${inspectionFindings}），索完整报告与质控记录，工艺归因待核。`,
    ],
    sampleAnswerALabel: "工程样答",
    sampleAnswerA: `据${tenderPlatform}《${tenderTitle}》（${tenderOwner}，${tenderNumber}）：${tenderScope}列${tenderSequence}，${tenderLead}列${tenderCredentials}。有证不等于初步设计获批，请文控补同版文件与审查意见交技术负责人复核。适用文件由注册化工工程师签章，初步设计由审查主体审批，现场行动另由有权人批准、授权人执行。`,
    sampleAnswerBLabel: "分析样答",
    sampleAnswerB: `据${inspectionPublisher}《${inspectionTitle}》${inspectionLocator}（《${inspectionAttachment}》）：${inspectionReport}、${inspectionItem}、${inspectionFindings}。仅证公示结果，工艺归因待核。请质量联系人补完整报告与质控记录交实验室复核，质量负责人定评审提请。对外报告由授权签字人签发，变更与现场另由有权主体审批、授权人执行。`,
  },
  tools: {
    title: "按眼下要解决的问题选一个入口",
    summary: "已经圈定两岗就先看职业档案，要准备面试就记证据和下一步，仍在摸索兴趣或工作条件则按需选测评。",
    cards: [
      { id: "career-compare", badge: "对照两岗", meta: "已有目标", tone: "neutral", title: "职业对比工具", description: "手动选择化学工程师与化学家，把职业资料和手里的招聘描述放在一起。", purposeHint: "适合手上已有两个岗位，需要核对交付物时使用。", ctaLabel: "手选两岗对比", href: "/zh/career/compare" },
      { id: "worksheet", badge: "记录行动", meta: "准备面试", tone: "roleA", title: "职业探索工作表", description: "填入试做遇到的缺口、下一次要追问的责任人与证据。离开前可复制、下载或打印。", purposeHint: "适合想带着具体问题投递或面试的人。", ctaLabel: "打开工作表", href: "/zh/career/interest-worksheet#my-worksheet" },
      { id: "holland-interest", badge: "探索兴趣", meta: "60 题", tone: "roleB", title: "霍兰德职业兴趣测试", description: "查看你的兴趣六维与三字代码，辅助判断自己更享受工程实操放大还是底层实验研究（兴趣不等于胜任力或注册条件）。", purposeHint: "适合在工科工艺、理科研发与跨专业方向间摇摆的人。", ctaLabel: "测职业兴趣", href: "/zh/tests/holland-career-interest-test-riasec" },
      { id: "career-assessment", badge: "核工作条件", meta: "94 题", tone: "accent", title: "职业测试", description: "梳理对化工园区地点、轮班中试、实验室节奏与工作条件的偏好。", purposeHint: "适合在研发环境、仪器工作和现场协作之间还没明确取舍的人。", ctaLabel: "查看职业测试", href: "/zh/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "查看单岗资料",
    profileLinks: [{ label: roleA, href: "/zh/career/jobs/chemical-engineers" }, { label: roleB, href: "/zh/career/jobs/chemists" }],
  },
  faqs: [
    { id: "split", question: "化学工程师和化学家的最大区别是什么？", answer: "考核设计文件、放大和工程项目交付时，按化学工程师的工艺方向看；考核材料证据、分析方法和研究结论时，按化学家的研究或分析方向看。材料企业的研发岗位可能横跨这两类任务，先问岗位归属、每周主要交付和试用期具体验收人。" },
    { id: "registered", question: "做化工工艺一定要考注册化工工程师吗？", answer: `走工程设计执业、受聘为特定项目负责人时，查招聘条件、注册和签章依据；投厂内工艺和生产技术时，先核岗位是否同时承担设计执业职责。${registrationScope} 本科专业类别和实践年限会影响报考，基础考试合格与专业考试取证也属于不同阶段。` },
    { id: "degree", question: "化学家必须读博士吗？应用化学可以投工艺吗？", answer: "目标是高校院所博士后时，按公告核博士学位要求；投企业分析、检测平台或工艺技术，可按具体岗位规定核学历与专业。化学所分析测试中心 2026 年项目岗列本科及以上，中石油秋招岗位表里蓝海新材料在南通通州湾发布的化工工艺技术和化工生产技术技能岗位都列应用化学，对应学历要求不同。岗位能投与后续能否报考注册化工工程师，请分别核对。" },
    { id: "pilot", question: "实验结果好，能直接跳到量产吗？", answer: `涉及危险化学品新工艺、新技术的研制开发，按法律核小试、中试和工业化试验证据；材料研发做内部阶段核对时，先确认数据能否支持下一阶段的审查。${scaleUpScope}` },
    { id: "cma", question: "实验室有 CMA 或 CNAS，我入职就能签检测报告吗？", answer: `准备方法、数据或报告草稿的新人先核技术培训及复核路径；目标岗位承担正式签发，则先核机构范围与个人授权。${reportScope} CMA 资质认定与 CNAS 实验室认可都有机构范围，涉及 CNAS 认可标识或联合标识的报告或证书，核该人是否经 CNAS 认可，以及人选的授权范围。` },
    { id: "salary", question: "化学工程师和化学家哪个更赚钱？", answer: "公开统计没有两岗同口径收入排序，比较待遇时宜重点核对赛道周期、学历层级与岗位职责的定级口径（具体固浮比以书面 Offer 为准）：同一企业招聘样本中，生产技术技能岗接受本科，工艺技术岗要求硕士，面试时可分别核实中小化工厂、大型石化、新能源锂电或半导体电子化学品企业的产值／绩效规则，以及大型装置设计经历与注册化工工程师执业资格是否计入薪档；投高校院所时问固定薪酬之外是否另列课题绩效，按目标公告核硕博门槛，投递创新药、特种新材料研发或分析测试管理岗时可核对成果考核与职级通道。同时留意避开纯机械测样、无方法积累的基层化验岗，拿到同城 Offer 后按固定年薪、项目奖、园区／轮班补贴和聘期统一折算。" },
    { id: "ai-and-lab-automation", question: "如果团队使用材料预测软件和自动化实验工具，两岗的哪些任务会变？", answer: "目前缺少两岗可比的岗位替代实证，无法给出替代比例，但从职责分工看，工具辅助与人类担责的边界很清晰：文献检索、物性预测、常规流程模拟初算与谱图初筛可借助计算化学与自动化软件提效；但在化学工程侧，负责人员仍要核验危险化学品新工艺、新技术的试验证据，并按项目适用要求组织设计阶段的 HAZOP 分析。现场异常处置及依法需要的签章由相应人员负责；在化学研究与检测侧，复杂基体干扰排除、实验异常复现以及 CMA／CNAS 授权签字人的独立技术判断也无法外包给算法。选岗时可重点核对是否包含方法开发或工程评审职责，避开纯重复机械加样或抄表岗位。" },
    { id: "switch", question: "从化学研究转化工工艺，简历第一件事补什么？", answer: "投工艺岗先补一份能把研发结果接到设计输入和变更记录的纸面作品；投分析岗先补一份能把方法、批次、结果和质量控制追溯起来的证据卡。展示原件定位、资料缺口、复核路径和自己的实际参与范围。" },
  ],
  sourceGroups: [
    { id: "process-safety", title: "危化品法律、过程安全和建设项目资料", links: [sources.law, sources.processSafety, sources.construction, sources.tender, sources.industry] },
    { id: "credentials", title: "化工注册与两条职称系列", links: [sources.exam, sources.qualification, sources.registration, sources.titlesEngineering, sources.titlesResearch] },
    { id: "lab-authority", title: "检验检测机构范围、实验室能力和报告签发", links: [sources.cmaScope, sources.cmaAssessment, sources.reportRules, sources.cnas, sources.chemicalAnalysis, sources.inspection] },
    { id: "jobs-and-pay", title: "用人单位样本与工资统计", links: [sources.jobs, sources.postdoc, sources.platform, sources.wage] },
  ],
};
