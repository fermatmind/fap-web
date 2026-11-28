import type { ModularComparisonSpec } from '../modularComparison';

const analyst = '计算机系统分析师';
const developer = '网页开发人员';
const analystSlug = 'computer-systems-analysts';
const developerSlug = 'web-developers';
const energyAnalystPosting = {
  label: '国家能源集团数科公司｜需求分析师',
  href: 'https://zhaopin.chnenergy.com.cn/annc/showgw?id=5a798bfe-a97c-0be4-e063-98b4d40a088a',
  note: '北京，2026-09-02 发布。看用户调研、需求说明书、可行性与变更跟踪。',
};
const wedoDeveloperPosting = {
  label: 'WEDO｜上海 Web前端开发工程师',
  href: 'https://www.wedochina.cn/wedo-careers.html',
  note: '上海岗位栏目，页面未标发帖日期。看多端页面、设计稿和技术栈。',
};
const huiceDeveloperPosting = {
  label: '慧策招聘启事｜Web前端-校招/实习（J15121）',
  href: 'https://scdc.jnu.edu.cn/campus/view/id/1038460',
  note: '雇主发布于暨南大学就业平台，2026-11-23，北京昌平，第 04 项。',
};
const procurementEvidence = {
  link: { label: '广西税务门户网站系统升级优化｜公开采购需求第 1、3 页', href: 'https://guangxi.chinatax.gov.cn/xxgk/zfxxgk_22500/fdzdgknr/zfcg_22570/zbgg_22622/202306/P020230630321417416273.pdf#page=1', note: '2023 年广西项目。第 1 页读检索及适老目标，第 3 页读门户平台与业务部门的项目边界。' },
  searchScope: '强化统一搜索，为税务政策文件和办事服务资源提供多条件筛选。',
  projectBoundary: '项目图拆分了业务部门侧与网站集约化平台侧的交付范围。',
};
const tableDocs = { label: 'Ant Design Table 中文文档｜筛选、分页与状态', href: 'https://ant.design/components/table-cn/?locale=zh-cn#api', note: '读 Table 的 onChange、loading、locale 和 Column 的 filteredValue。' };
const wageNotice = { label: '国家统计局｜2025 年城镇单位就业人员年平均工资情况', href: 'https://www.stats.gov.cn/sj/zxfbhjd/202605/t20260515_1963707.html', note: '第三节表 6–8 及附注。「专业技术人员」为岗位大类，统计量为年平均工资。' };
const credentialCatalog = { label: '国家职业资格目录（2021 年版）｜第 36 项', href: 'https://www.gov.cn/zhengce/zhengceku/2021-12/03/5655553/files/86876724c6ee4cdcb3d0be524aee036f.pdf#page=8', note: '计算机技术与软件专业技术资格归入水平评价类。' };
const credentialCatalogReadable = { label: '国家职业资格目录第 36 项｜政府站转载', href: 'https://www.zhifu.gov.cn/cms_files/jcms1/web146/site/attach/0/2527131e168d42c59f35a5870b960c03.pdf?fileName=2527131e168d42c59f35a5870b960c03.pdf#page=8', note: '目录第 8 页可读备份。' };
const credentialRules = { label: '工信部｜计算机技术与软件专业技术资格（水平）考试暂行规定', href: 'https://www.miit.gov.cn/jgsj/rjj/rcgz/art/2020/art_9697b8faa3894e4ba1b27b641970bc62.html', note: '暂行规定第九、十条分别涉及证书效力和单位聘任。' };
const examNotice = { label: '深圳市考试院｜2026 年计算机软件资格考试设置', href: 'https://hrss.sz.gov.cn/szksy/zwgk/bmxx/content/post_12693780.html', note: '考试设置表把系统分析师列在高级资格。' };
const systemsAnalystCredential = {
  name: '软考高级｜系统分析师',
  classification: '系统分析师是软考高级资格，属于专业技术人员水平评价。',
  recognition: '证书全国有效。单位可按规定和工作需要择优聘任相应专业技术职务。',
};
const exerciseFixture = {
  records: '固定按 A＝发票／桂林、B＝发票／南宁、C＝申报／桂林 排序，共 3 条，每页 1 条，共 3 页。第 1 页仅 A，第 2 页仅 B，第 3 页仅 C。',
  initialPage: '第 3 页',
  initialVisible: '仅 C',
  matchingFilters: '发票＋桂林',
  matchingResult: '回到第 1 页，结果集仅 A（1 条、1 页），当前页仅显示 A',
  emptyFilters: '申报＋南宁',
  emptyResult: '回到第 1 页，结果集为空，显示「当前条件下无结果」',
  clearedResult: '恢复默认全集 A、B、C（3 条、3 页），回到第 1 页，当前页仅显示 A',
  resetRule: '更改或清空筛选条件时回到第 1 页',
};

export const systemsWebComparisonZhSpec: ModularComparisonSpec = {
  pairId: `${analystSlug}-vs-${developerSlug}`,
  locale: 'zh',
  title: `${analyst} vs ${developer}：职责、入行与试做对比`,
  shortTitle: `${analyst} vs ${developer}`,
  description: '对比计算机系统分析师与网页开发人员的典型交付、工作条件、薪资口径和软考用途。用广西税务门户的公开采购材料试做筛选规则卡和网页状态表。',
  regionLabel: '中国大陆',
  authorName: '费马测试编辑部',
  datePublished: '2026-11-24',
  dateModified: '2026-11-24',
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: '同样是给网站加一个“按主题和地区筛选文件”的功能，计算机系统分析师负责把业务方一句模糊的“要更好找”拆成严密的字段规则和验收标准，网页开发人员负责用代码把它做成手机和电脑上点不坏、不乱跳的真实页面。想管业务规则、接口口径与验收，先看系统分析；想写页面交互、联调接口与做浏览器回归，先看网页开发。',
    roleA: { badgeTitle: analyst, riasecLabel: "霍兰德 ICR", aliases: '本地招聘样本称「需求分析师」。核对岗位是否负责系统规则、边界与变更。', keywords: '业务访谈、需求规格、接口字段、用户验收' },
    roleB: { badgeTitle: developer, riasecLabel: "霍兰德 CIA", aliases: '本地招聘样本称「Web前端开发工程师」或「Web前端」。核对是否兼做后端或移动端。', keywords: "HTML、CSS、JavaScript／TypeScript、React／Vue、浏览器验证" },
    interviewBoundaryTitle: '面试时用最近一次筛选功能反问',
    interviewBoundaryQuestions: [
      '谁把业务方的「更好找」改写成字段组合、空结果和验收用例？最终谁确认口径？',
      '谁改组件与接口参数、补浏览器回归？接口字段改名时，谁确认前后端版本可以一起交付？',
    ],
    riasecBoundaryNote: "徽章取两岗霍兰德六维兴趣中排序最高的三项。用它挑一种想亲手试做的活动。胜任力看作品和岗位要求，资格和录用各有核验条件。",
  },
  topology: {
    title: '给政策文件加筛选时，谁定规则，谁把它做进网页？',
    summary: '采购原件把业务部门和门户平台分开，这张图用政策文件搜索演示交接。开发把接口缺口和页面复现带回需求评审，分析把确认后的规则和用例交给开发。',
    ariaLabel: '政策文件筛选交接图。左侧为需求访谈、规则和验收，右侧为页面建模、联调和回归。网页开发向分析反馈缺口，分析向开发交付已确认规则。',
    leftZoneTitle: analyst,
    leftSteps: [
      { title: '核业务对象', detail: '区分政策文件和办事服务' },
      { title: '写筛选规则', detail: '明确字段来源、组合、清空' },
      { title: '组织业务验收', detail: '用样例核对命中与空结果' },
    ],
    centerZoneTitle: '筛选规则、接口字段与用例',
    upperBridge: { title: '开发 → 分析：验证发现', line1: '交页面复现步骤与接口参数', line2: '指出规则缺口，请业务方裁定' },
    lowerBridge: { title: '分析 → 开发：已确认规则', line1: '交字段映射与筛选组合规则', line2: '附预期结果及验收用例' },
    rightZoneTitle: developer,
    rightSteps: [
      { title: '画页面状态', detail: '定义加载、结果、空态、失败' },
      { title: '实现并联调', detail: '让筛选条件、页码与请求一致' },
      { title: '交浏览器复验', detail: '核对窄屏和键盘操作' },
    ],
  },
  matrix: {
    title: '从交付物看两岗的日常',
    summary: '比较招聘说明里的成果和向谁交付。分析侧的本地样本来自能源数字化，前端侧样本覆盖上海项目交付和北京零售软件。这些岗位可用来核任务，工时及职责占比要问具体团队。',
    roleAColumn: analyst,
    roleBColumn: developer,
    expandButtonLabel: '展开协作与入门核查',
    collapseButtonLabel: '收起补充对照',
    rows: [
      { id: 'decision-output', dimension: '主要交付物', roleA: '经评审的需求说明书、字段映射、验收用例和变更记录。明确「地区」字段从哪里来、两个筛选条件怎样组合。', roleB: '可运行的搜索页、筛选组件、接口联调记录和浏览器回归证据。让页面实际显示当前筛选条件对应的结果。', defaultVisible: true },
      { id: 'working-methods', dimension: '工作方法与工具', roleA: "用访谈纪要、流程图、字段字典和用例表定位规则分歧。把接口协议里的参数、可空字段和返回示例逐项对照。做原型时，把用户操作、触发条件和状态切换画出来，再请业务确认哪些情况需要例外处理。", roleB: "用 HTML 表达表单与结果结构，CSS 做窄屏布局，JavaScript 或 TypeScript 维护交互。按项目选 React 或 Vue。读 Ant Design Table 的受控筛选、分页和状态反馈，先确定组件和页面各自管理哪些状态。", defaultVisible: true },
      { id: 'acceptance', dimension: '最难验清的边界', roleA: '区分「符合规则但没命中」与「系统尚不支持该筛选」；用具名的验收人和例子固化业务判断。', roleB: '区分「接口返回空数组」与「请求失败」；切换条件时重算页码，补一次失败后重试的回归。', defaultVisible: true },
      { id: 'work-conditions', dimension: '半年后可能最消耗你的事', roleA: '如果你厌烦反复澄清同一个词、跟催业务定口径，先问项目并行数、评审排期和变更由谁拍板。', roleB: '如果你厌烦重现只在特定屏幕或网络状态出现的问题，先问浏览器支持清单、回归分工与发布后响应安排。', defaultVisible: true },
      { id: 'entry-evidence', dimension: '用什么作品进面试', roleA: '带一份业务输入、规则、验收和改动记录串得起来的案例。目标 JD 写行业经验时，问具体要理解哪类流程或数据。', roleB: '带能本地打开的页面和复验步骤。让面试官看到正常结果、零命中、重试、清空筛选及一次代码改动的证据。', defaultVisible: false },
      { id: 'handoff-ownership', dimension: '合岗及责任归属', roleA: "起草规则和组织验收时，列明谁确认数据范围、谁签验收记录。有客户验收或投标材料时，从合同或项目分工表核对签署人及授权。", roleB: "交代码和测试记录时，问谁确认接口兼容、谁审合并、谁批准发布。若同时兼写接口，拿一次字段变更核对两端如何安排发布顺序和回退。", defaultVisible: false },
      {
        "id": "implementation-depth",
        "dimension": "代码与技栈深度",
        "roleA": "涉及数据口径时，在有权限的样本库用 SQL 核对字段取值、空值或重复记录。规则复杂时，用接口请求与响应示例及原型状态机验证边界。面试问是否还要写集成脚本或合并生产代码。",
        "roleB": "先用 HTML 和 CSS 实现页面结构与布局，再按团队框架交付组件，处理异步请求和浏览器差异。可用 TypeScript 表达接口字段，用开发者工具核请求参数和响应，再做一次快速切换条件的回归，核对晚到的旧响应不会覆盖当前结果。",
        "defaultVisible": true
      },
      {
        "id": "employers-and-growth",
        "dimension": "雇主样本与发展方向",
        "roleA": "北京国能数科的需求分析岗位覆盖用户调研、可研和变更跟踪。政企数字化、大型甲方信息化或其交付方，要分清内部业务方、供应商和验收方。广西采购原件给出平台侧与业务部门侧的实例。想往系统方案走，问是否有机会从单功能规格扩到跨系统字段映射和迁移验收。",
        "roleB": "上海 WEDO 的客户项目和北京慧策的零售软件招聘都出现前端岗位。想深耕工程，可看团队是否有组件库、浏览器质量维护或性能工作。偏业务交付，可问能否全程负责一个页面模块。",
        "defaultVisible": false
      },
    ],
  },
  incident: {
    title: '模拟交接：移动端改完筛选，页面却显示无结果',
    summary: `场景取材于广西税务门户公开采购需求。${procurementEvidence.searchScope}${procurementEvidence.projectBoundary}`,
    triggerLabel: '模拟验收发现',
    triggerBody: `初始在${exerciseFixture.initialPage}，当前页${exerciseFixture.initialVisible}。测试人员改选「${exerciseFixture.matchingFilters}」，页面却仍查询${exerciseFixture.initialPage}，出现假空态。正确行为是${exerciseFixture.matchingResult}。`,
    triggerCaveat: '初始页码、双筛选字段、用例与角色授权均为模拟。采购原件定位见文末。',
    rows: [
      { stage: '核规则与异常含义', roleLabel: analyst, tone: 'roleA', verifiedFacts: `「${exerciseFixture.matchingFilters}」应${exerciseFixture.matchingResult}。留在${exerciseFixture.initialPage}会制造假空态。`, openGaps: '确认主题与地区如何组合，以及清空条件后应保留什么范围。', actionAndApproval: '把组合、清空、零命中写进规则卡与验收表。业务负责人确认业务口径，接口维护者核实字段映射。' },
      { stage: '修页面并交复验', roleLabel: developer, tone: 'roleB', verifiedFacts: '已选条件与发出的页码可以分别从界面和联调记录核对。', openGaps: '核对空响应、失败响应、重试和清空筛选四种状态的呈现与操作。', actionAndApproval: '提交页码重置及状态反馈的修改。指定测试人员复验，发布负责人批准，授权发布人员执行发布。' },
    ],
    recoveryAcceptanceTitle: '通过复验再放行',
    recoveryAcceptanceCriteria: `在受控测试环境从${exerciseFixture.initialPage}（当前页${exerciseFixture.initialVisible}）改条件。命中时${exerciseFixture.matchingResult}；零命中时${exerciseFixture.emptyResult}；失败显示重试；清空后${exerciseFixture.clearedResult}。指定测试人员记录窄屏与键盘步骤，业务负责人确认规则和结果。`,
    defenseLayerNote: '前端负责请求状态和信息反馈，接口维护者核实数据及字段协议。出现业务口径分歧时，把具体条件与记录交回业务负责人决定。',
  },
  payAndCerts: {
    title: '比较薪酬时先对齐 Offer，再问软考用在哪里',
    summary: "把两份同城、同职级、同用工类型的书面方案放在一起。国家职业资格目录把软考列为水平评价类，三项软考资格均属水平评价。网页开发的用人条件另看目标岗位的证书条款和作品要求。单位聘任、招聘筛选和项目人员条款分别核。",
    salaryHeading: '薪酬怎么算、定级核查什么，以及 Offer 对比口径',
    salaryBody: '公开统计不能给两岗做全国同口径排序。先从书面报价分清固定工资、保证薪月和浮动项。投前端岗，问复杂状态、性能与浏览器兼容责任怎样影响定级，夜间发布如何补偿；核对岗位是否只做静态页面。投系统分析岗，问跨系统方案职责和验收责任怎样影响定级，项目奖和专业技术职务聘任是否确实适用；核对能否参与数据口径与接口定义。对比同城同级报价时，统一用工主体、签约方式、保证薪月、社保基数和绩效发放条件。',
    certs: [{
      name: systemsAnalystCredential.name, officialScope: `${systemsAnalystCredential.classification}${systemsAnalystCredential.recognition}`,
      workplaceBoundary: "如果单位按高级专业技术职务聘任，或项目人员条款点名该资格，先向人事或项目负责人核证。负责起草规则、参加评审或持有证书本身均不授予项目签审权。",
      verificationTips: "问人事该证在哪一步使用，高级资格能否对应本岗聘任，以及还缺哪些材料。项目若点名某项资格，查承担角色、等级和能否以其他材料替代。",
      officialLinks: [credentialCatalogReadable, credentialRules, examNotice],
    }, {
      name: '软考中级｜软件设计师／系统集成项目管理工程师',
      officialScope: '深圳市考试院 2026 年设置表把两项均列为中级。按软考暂行规定，证书在全国范围有效，单位可按规定和工作需要择优聘任相应专业技术职务。',
      workplaceBoundary: '想证明软件设计理解，先核校招或转岗要求是否接受软件设计师；涉及多系统集成、供应商对接和验收跟踪，先核单位是否使用系统集成项目管理工程师资格。两项均不自动授予项目签审或发布权限。',
      verificationTips: '请用人方指出证书出现在招聘筛选、职务聘任还是项目人员条款，分别核全称、级别、任职角色及可替代材料。',
      officialLinks: [examNotice, credentialRules],
    }, {
      name: '网页开发岗位｜准入与作品核验',
      officialScope: '国家职业资格目录把计算机技术与软件专业技术资格列为水平评价类。本次核到的软考规则及网页开发招聘样本没有给出行业统一持证准入要求。单位与项目如另列资格，按对应条文核实。',
      workplaceBoundary: '以页面交付为主且招聘未列特定证书时，先交可本地运行的作品、相关代码和回归记录。WEDO 样本列多端页面、技术栈与开发协作，慧策样本给 Web 前端岗位入口。它们仅说明对应岗位的工作与招聘线索。',
      verificationTips: '问面试是复验可运行作品、做现场实作，还是核项目人员证书。作品可带一段提交差异和复验步骤，说明异常状态怎样被发现和修正。',
      officialLinks: [credentialCatalogReadable, credentialRules, wedoDeveloperPosting, huiceDeveloperPosting],
    }],
    interviewChecklistTitle: '让招聘方把条件说具体',
    interviewChecklistQuestions: [
      { label: '固定薪酬', question: '按书面方案，固定薪资有几个月？试用期比例、合同主体和社保公积金基数分别是什么？' },
      { label: '浮动薪酬', question: '绩效目标、最低发放条件以及夜间发布或现场支持的补偿怎么算？' },
      { label: '证书用途', question: '这个证在投递、聘任或项目人员提报中的哪一步核？可看哪条实际要求？' },
    ],
  },
  thirtyDayPlugin: {
    badge: '四周作品',
    title: '30 天做一套能复验的需求包或本地网页',
    summary: '选一轨，每周留下一个可独立检查的产物。两轨共用广西采购范围和合成数据，全程本地完成。',
    tracks: [
      {
        id: 'systems-analysis', title: '系统分析轨', badge: '交付需求包', tone: 'roleA',
        weeks: [
          { weekLabel: '第 1 周', deliverable: '交一页范围与来源图。读采购附件第 1、3 页，标出至少两条原文目标、两个系统边界及两项待确认规则；每个原文目标可回到原页。' },
          { weekLabel: '第 2 周', deliverable: `交字段字典和验收矩阵。沿用桌面试做的排序与容量，从${exerciseFixture.initialPage}（当前页${exerciseFixture.initialVisible}）推演命中、零命中、清空和失败。清空须${exerciseFixture.clearedResult}。注明字段含义及责任方。` },
          { weekLabel: '第 3 周', deliverable: '交一次需求变更单及前后版本差异。模拟新增「多选地区」，注明组合规则、受影响字段和用例、待确认人及上线前置条件；评审可定位旧版、新版和两处对应修改。' },
          { weekLabel: '第 4 周', deliverable: '交评审包。把原证、规则卡、验收表、变更单列成同一份索引。让另一人按编号找出一条用例的来源、预期结果和批准人；独自练习时隔一天盲查并记录耗时与遗漏。' },
        ],
      },
      {
        id: 'web-delivery', title: '网页开发轨', badge: '交付本地网页', tone: 'roleB',
        weeks: [
          { weekLabel: '第 1 周', deliverable: '交可本地打开的 HTML/CSS 搜索页。用合成记录列筛选区、结果区和清空入口；窄屏能读出结果，键盘能依次到达两个条件、搜索和清空控件。' },
          { weekLabel: '第 2 周', deliverable: `交本地 JavaScript 交互与模拟数据。沿用桌面试做的排序与容量，模拟加载、空集合和失败，无须后端。命中须${exerciseFixture.matchingResult}；零命中须${exerciseFixture.emptyResult}；清空须${exerciseFixture.clearedResult}。` },
          { weekLabel: '第 3 周', deliverable: `交回归记录和修复前后差异。从${exerciseFixture.initialPage}（当前页${exerciseFixture.initialVisible}）改选「${exerciseFixture.matchingFilters}」，先保留旧页码复现假空态，修复后核对${exerciseFixture.matchingResult}。定位重置代码，并记录失败重试与零结果的实测结果。` },
          { weekLabel: '第 4 周', deliverable: '交离线页面包、README 与结果截图。断网后从本地文件打开，按说明复验命中、空结果、失败后重试和清空四条路径；打开开发者工具确认页面未对外请求。' },
        ],
      },
    ],
  },
  checklist: {
    title: '按技能和可接受条件各自核对招聘说明',
    summary: '技能用已有作品举证，工作条件用能接受的具体安排确认。两栏的问题都可以带去面试。',
    skillsHeading: '我能用作品展示的技能',
    skillsOptions: [
      { id: 'write-requirements', track: 'roleA', label: '我能把业务诉求写成字段规则和验收样例', summary: '可展示一条业务输入如何变成字段规则，再变成可复核的验收用例。', interviewQuestions: ['能否看一次需求评审的脱敏样例？规则和验收由谁定稿？'] },
      { id: 'trace-changes', track: 'roleA', label: '我能追踪变更对接口及验收的影响', summary: "把规则编号连到接口字段和测试编号。以改地区字段为例，展示怎样查出旧数据、未传参数和兼容旧页面这三处影响，标注谁需确认。", interviewQuestions: ['当字段来源改动时，谁更新需求和接口说明，谁决定是否延后上线？'] },
      { id: 'implement-state', track: 'roleB', label: '我能实现并复验查询、分页和失败重试', summary: "准备可复验的交互与请求日志。让面试官对照修改前后的查询参数、页码和可见结果，检查一次失败重试是否保留筛选条件。", interviewQuestions: ['当前前端谁维护空结果、失败重试与窄屏回归？入职第一个功能会验哪些路径？'] },
      { id: 'verify-markup', track: 'roleB', label: '我能检查窄屏布局和键盘操作', summary: '可展示窄屏截图、键盘操作顺序和修复前后对照。', interviewQuestions: ['团队明确支持哪些浏览器、屏幕和可访问性用例？'] },
    ],
    conditionsHeading: '我能接受并已准备核查的条件',
    conditionsOptions: [
      { id: 'business-review', track: 'roleA', label: '我能接受反复访谈和跨部门评审', summary: '可接受为规则冲突召集对齐，仍需确认业务拍板和等待成本。', interviewQuestions: ['这个岗位同时跟几个项目？业务负责人能否在同一次评审确认争议规则？'] },
      { id: 'uat-scheduling', track: 'roleA', label: '我能接受上线前配合业务验收', summary: '可接受有安排的用户验收和现场支持，具体频次仍须核实。', interviewQuestions: ['用户验收集中在哪些时段？现场支持是否涉及驻场或出差？'] },
      { id: 'browser-regression', track: 'roleB', label: '我能接受持续做浏览器和多终端回归', summary: '可接受定位特定环境才出现的界面问题，仍需确认支持范围。', interviewQuestions: ['哪些设备和浏览器必须过回归？前端与测试各负责哪部分？'] },
      { id: 'release-support', track: 'roleB', label: '我能接受提前约定的发布支持', summary: '可接受在明确窗口配合发布，值守频次和补偿需要核实。', interviewQuestions: ['最近三次页面发布分别何时进行？发布后由谁接手回归和用户反馈？'] },
    ],
    defaultInterviewQuestions: ['请用上次搜索或表单改版说明，这个岗位的主要产物、验收人和发布支持安排分别是什么？'],
    crossTrackNote: '你勾选了两岗相关条目。带上各自的作品，再向招聘方核实两个方向的产物、责任人和工时安排。',
    offlinePrintHint: '可打印清单，面试后把已确认的回答记在对应问题旁。',
  },
  desktopExercise: {
    sectionTitle: '5 分钟桌面试做：一张规则卡，一张页面状态表',
    summary: '任选一轨，凭下方公开原件目标与 3 条合成记录用纸笔完成（5 分钟可写完，完整原件见文末）。',
    publicLinksHeading: '公开参考原件',
    factSummaryHeading: '离线输入夹具',
    factSummarySegments: [
      { text: '原件目标：', tone: 'strong' }, { text: `${procurementEvidence.searchScope}` },
      { text: ' 模拟夹具：', tone: 'strong' },
      { text: `${exerciseFixture.records} 初始${exerciseFixture.initialPage}（${exerciseFixture.initialVisible}）；双条件须同时满足；${exerciseFixture.resetRule}。` },
    ],
    publicLinks: [procurementEvidence.link, tableDocs],
    taskA: { title: analyst, instruction: `交一页规则卡：写主题／地区组合与清空规则，推演「${exerciseFixture.matchingFilters}」「${exerciseFixture.emptyFilters}」的结果集、页码和可见项，标出何时显示请求失败；再写 1 条待业务裁定问题与 1 条含初始页码的验收用例。` },
    taskB: { title: developer, instruction: `交页面状态表：记录从${exerciseFixture.initialPage}（${exerciseFixture.initialVisible}）切到「${exerciseFixture.matchingFilters}」的输入／状态／反馈，写清加载、命中、零命中、失败重试与清空呈现，标出离线可验步骤。` },
    rubricTitle: '自检标准与样答',
    rubricHeading: '逐轨自检',
    rubricPassRule: '命中共用 1 项 + 本轨 2 项即可过关',
    rubricItems: [
      '共用｜区分原件目标与模拟字段，记录可独立复核。',
      `分析 1｜「${exerciseFixture.matchingFilters}」回第 1 页仅 A（1/1 页），「${exerciseFixture.emptyFilters}」回第 1 页空态（显示当前条件下无结果）。`,
      '分析 2｜给出 1 条待业务确认问题，且验收用例含输入、初始页码与预期输出。',
      `开发 1｜从${exerciseFixture.initialPage}（${exerciseFixture.initialVisible}）切「${exerciseFixture.matchingFilters}」先重置页码，成功后回第 1 页仅 A（1/1 页）。`,
      '开发 2｜区分零命中与请求失败（失败保留筛选并可重试），清空后恢复 A/B/C（3/3 页）回第 1 页仅 A。',
    ],
    sampleAnswerALabel: '分析轨样答',
    sampleAnswerA: `原件仅定多条件检索目标，三条记录与翻页为模拟。主题与地区双匹配：选「${exerciseFixture.matchingFilters}」回第 1 页仅 A（1/1 页）；选「${exerciseFixture.emptyFilters}」回第 1 页空态显示「当前条件下无结果」；请求超时或报错显示失败，成功返回空数组才显示无结果；清空恢复 A/B/C（3/3 页）回第 1 页仅 A。待业务裁定：无地区标签记录在未选地区时是否默认展示？验收：从${exerciseFixture.initialPage}（${exerciseFixture.initialVisible}）选「${exerciseFixture.matchingFilters}」，应回第 1 页仅 A（1/1 页）。`,
    sampleAnswerBLabel: '开发轨样答',
    sampleAnswerB: `原件仅定多条件检索目标，三条记录与翻页为模拟。从${exerciseFixture.initialPage}（${exerciseFixture.initialVisible}）选「${exerciseFixture.matchingFilters}」先重置页码并示加载，成功后回第 1 页仅 A（1/1 页）；改选「${exerciseFixture.emptyFilters}」回第 1 页空态显示「当前条件下无结果」；接口失败保留条件并示「重试」；清空恢复 A/B/C（3/3 页）回第 1 页仅 A。无真实接口时用三条模拟记录逐态核控件值、页码与反馈。`,
  },
  tools: {
    title: '选一个与你现在的问题对应的工具',
    summary: '已经在比较具体岗位，从对比工具或工作表继续。还在探索偏好，根据自己想弄清的是活动兴趣还是工作条件来选。',
    cards: [
      { id: 'manual-career-compare', badge: '已有两个岗位', meta: '并排核对', tone: 'neutral', title: '比较两个职业', description: '打开两槽，手动选择计算机系统分析师和网页开发人员，再看任务与技能。', purposeHint: '对照具体招聘说明，明确还缺哪项证据。', ctaLabel: '打开职业对比', href: '/zh/career/compare' },
      { id: 'record-next-step', badge: '已有试做结果', meta: '行动记录', tone: 'accent', title: '职业探索工作表', description: '记下试做产物、待核条件和下一次访谈计划，离开前复制或下载。', purposeHint: '把看到的条件和做过的事带到下一次面试。', ctaLabel: '打开工作表', href: '/zh/career/interest-worksheet#my-worksheet' },
      { id: 'holland-interest', badge: '只看活动兴趣', meta: '60 题', tone: 'roleA', title: '霍兰德职业兴趣测试', description: '看看自己愿意投入哪类工作活动，查看六维兴趣和三字代码。', purposeHint: '想先选一类任务试做时使用。', ctaLabel: '查看霍兰德测试', href: '/zh/tests/holland-career-interest-test-riasec' },
      { id: 'career-conditions', badge: '要一起核现实条件', meta: '94 题', tone: 'roleB', title: '职业测试', description: '梳理兴趣、工作方式、工时等工作条件与当前处境。', purposeHint: '当协作方式和现实限制会左右选岗时使用。', ctaLabel: '查看职业测试', href: '/zh/tests/career-planning-and-work-style-test' },
    ],
    profileLinksLabel: '单岗档案',
    profileLinks: [{ label: analyst, href: `/zh/career/jobs/${analystSlug}` }, { label: developer, href: `/zh/career/jobs/${developerSlug}` }],
  },
  faqs: [
    { id: 'read-job-title', question: '招聘写「需求分析师」或「Web前端」，怎么判断是哪一类工作？', answer: 'JD 以访谈、需求说明、字段规则和验收为主，先按分析岗看。以组件代码、接口联调和浏览器回归为主，先按网页开发岗看。两类都写时，问入职后第一个功能交什么、两份交付各由谁确认。' },
    { id: 'coding-on-each-track', question: '系统分析师也要写代码吗？转网页开发能用什么证明自己？', answer: '如果分析岗要验证接口或做原型，技术理解和动手验证会直接用上。如果目标网页岗负责页面交付，先做出能本地复验的交互，再讲清页码、失败和窄屏问题怎样解决。面试时以目标 JD 和团队最近一次真实交付核具体工作量。' },
    { id: 'salary-comparability', question: '两岗哪一个工资更高？', answer: '公开统计不能给两岗做同口径排序。面试前端岗时，问复杂状态、性能和发布责任怎样定级，以及能否参与工程交付。面试分析岗时，问跨系统方案与验收职责怎样定级，以及能否参与数据口径和接口定义。两份报价按同一年度核对保证薪月、书面奖金条件、社保基数和夜间发布补偿，并确认由谁签约和发薪。' },
    { id: 'ai-coding-and-analysis', question: '如果团队使用 AI 编程或原型工具，两岗的哪些任务会变？', answer: '目前缺少两岗可比的岗位替代实证，无法给出替代比例。从分工边界看，AI 编程与原型工具可用于辅助生成静态页面骨架、常规样板组件和需求初稿，降低重复编写门槛；但在系统分析侧，把多方冲突的业务诉求收敛成无歧义的字段口径、异常边界并推动业务负责人签字验收，工具替不了人拍板；在网页开发侧，复杂异步状态竞态（如快切筛选防旧响应覆盖）、真实多端浏览器排障、前后端契约联调及上线回退担责，仍必须由工程师兜底。面试时可问团队日常如何使用 AI 辅助工具，以及最终代码评审与需求签字责任归谁。' },
    { id: 'credential-use', question: '软考系统分析师证书什么时候值得优先考？', answer: `目标单位已把软考资格列入专业技术职务聘任或项目人员条件时，先核实际条款再安排备考。投网页开发且 JD 重点考核页面交付时，先带可复验作品。${systemsAnalystCredential.classification}${systemsAnalystCredential.recognition}` },
    { id: 'four-week-proof', question: '四周作品只来得及做一轨，怎么选？', answer: '投需求或系统分析岗，选能追溯规则、变更和验收的需求包。投网页开发岗，选能离线演示并提供回归记录的页面包。按目标岗位的首项任务确定范围。', requiresPlugin: 'thirtyDay' },
    {
      "id": "product-manager-difference",
      "question": "计算机系统分析师和产品经理怎么区分？",
      "answer": "若岗位考核产品方向、用户结果和优先级，先按产品经理看。若主要交系统规则、数据口径和验收规格，先按系统分析岗看。两边都可能写需求和原型。拿一个搜索改版问，谁决定先做哪类用户的需求、上线后看哪个指标，谁定义每个字段如何映射和验收。"
    },
    {
      "id": "systems-analysis-without-frontend",
      "question": "不写前端能做计算机系统分析吗？",
      "answer": "面向需求规格、接口规则和业务验收的岗位，可以用规则卡、字段映射和验收表证明能力。若 JD 要独立交付前端组件、修复浏览器缺陷，就要按兼写页面的岗位准备。面试前确认本岗要提交的是可点的交互原型、测试环境的验证记录，还是能合并上线的页面代码。"
    },
  ],
  sourceGroups: [
    { id: 'domestic-job-postings', title: '大陆招聘样本', links: [energyAnalystPosting, wedoDeveloperPosting, huiceDeveloperPosting, {"label":"百度｜增长产品经理-海外业务（J107036）","href":"https://talent.baidu.com/jobs/detail/SOCIAL/36d92c4a-2323-4b65-b35c-d6ec80bdb471","note":"北京，2026-11-03。并读产品目标、需求原型、实验和结果指标。"}] },
    { id: 'search-delivery-materials', title: '采购需求与页面工程文档', links: [procurementEvidence.link, tableDocs] },
    { id: 'pay-and-qualification', title: '工资统计及资格原件', links: [wageNotice, credentialCatalog, credentialRules, examNotice, credentialCatalogReadable, {"label":"南京市政府转载｜准入类与水平评价类区别","href":"https://www.nanjing.gov.cn/hdjl/hygq/202611/t20261109_6035580.html","note":"人社部答问，2026-11-09 转载。"}] },
    { id: 'portfolio-version-diff', title: '四周作品的版本差异参考', requiresPlugin: 'thirtyDay', links: [{ label: 'Git 官方中文手册｜git diff', href: 'https://git-scm.com/docs/git-diff/zh_HANS-CN', note: '比较两版需求文本或代码，再把差异行和受影响用例对应起来。' }] },
    {
      "id": "role-and-tool-reference",
      "title": "职业任务与技术参考",
      "links": [
        {
          "label": "O*NET｜计算机系统分析师",
          "href": "https://www.onetonline.org/link/summary/15-1211.00",
          "note": "任务与工具含数据建模、系统规程和 SQL 类工具。美国职业口径。"
        },
        {
          "label": "O*NET｜网页开发人员",
          "href": "https://www.onetonline.org/link/summary/15-1254.00",
          "note": "任务与工具含 Web 测试和 TypeScript。美国职业口径。"
        },
        {
          "label": "OpenAPI 3.1.1｜参数及响应",
          "href": "https://spec.openapis.org/oas/v3.1.1.html#parameter-object",
          "note": "对照查询参数和返回结构。"
        },
        {
          "label": "TypeScript 手册｜可选属性",
          "href": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#optional-properties",
          "note": "建模缺失的响应字段。"
        },
        {
          "label": "Chrome DevTools｜网络面板",
          "href": "https://developer.chrome.com/docs/devtools/network/reference/#payload",
          "note": "查看请求参数和响应。"
        }
      ]
    },
  ],
};
