import type { ModularComparisonSpec } from "../modularComparison";

const NGINX_CVE_2024_24989_FACT = {
  cveId: "CVE-2024-24989",
  affectedVersion: "NGINX 1.25.3",
  precondition: "编译启用实验性 HTTP/3 模块（ngx_http_v3_module）且 listen 指令配置 quic 参数",
  failureMechanism: "QUIC 空指针解引用（CWE-476），可触发 Worker 进程异常崩溃（Signal 11 / SIGSEGV）",
  firstFixedVersion: "1.25.4",
  productionAdvice: "生产环境建议升级至当前官方受支持的已修复版本",
  mitigationOption: "在确认业务可安全降级回 HTTP/2 的前提下，临时移除 listen 指令中的 quic 参数",
  primaryLogClue: "error.log 中记录的 worker process <PID> exited on signal 11 及上游/网关异常断连（列为排查线索）",
  accessLogRole: "access.log 保留用于正常业务回归验证及辅助关联请求时序",
  threeRecordStates: ["资产受影响", "观察到崩溃", "触发原因待证"] as const,
} as const;

export const infosecComparisonZhSpec: ModularComparisonSpec = {
  pairId: "information-security-analysts-vs-information-security-engineers",
  locale: "zh",
  title: "信息安全分析师 vs 信息安全工程师：职责区别、入行门槛与怎么选",
  description:
    "比较信息安全分析师与信息安全工程师的职责边界、国内招聘别名、模拟交接验收、官方薪酬与考证口径、工作条件核对及基于 NGINX CVE-2024-24989 的桌面验证练习。",
  regionLabel: "中国大陆职场口径",
  authorName: "费马测试编辑部",
  datePublished: "2026-11-23",
  dateModified: "2026-11-23",
  defaultPlugins: {
    ai: true,
    thirtyDay: true,
  },
  hero: {
    directAnswer:
      "信息安全分析师负责在告警或事件发生时核查日志真伪、还原时间线并提交处置升级建议；信息安全工程师负责在风险暴露前或复盘后设计防护控制、落地配置变更并验证不误伤正常业务。部分团队会将两类职责合并招聘，选岗时核清入职首季由你签收哪份交付物，比只看岗位头衔更可靠。",
    roleA: {
      badgeTitle: "分析轨 · 国内招聘别名示例",
      riasecLabel: "任务偏好示例：I + C",
      aliases: "安全运营（SOC） · 安全监控与研判 · 应急响应（IR） · 威胁分析",
      keywords: "核心关键词：告警分诊、多源日志溯源、IOC 核查、事件定级与交班。",
    },
    roleB: {
      badgeTitle: "工程轨 · 国内招聘别名示例",
      riasecLabel: "任务偏好示例：R + I + E",
      aliases: "安全建设 · 云安全 · 应用安全（AppSec） · 安全开发 · DevSecOps",
      keywords: "核心关键词：策略与权限加固、CI/CD 安全门禁、灰度回归与一键回退。",
    },
    interviewBoundaryTitle: "可直接带去面试的 2 句分界反问：",
    interviewBoundaryQuestions: [
      "① “新人入职前 3 个月，每周占比最高的交付物是事件研判单，还是策略/代码变更单？”",
      "② “如果告警排查发现需要改规则或收紧权限，谁有生产变更审批权，谁负责正常业务回归？”",
    ],
    riasecBoundaryNote:
      "科学边界：霍兰德 RIASEC 代码（I 研究 / C 常规核查 / R 现实实操 / E 推进协调）仅作任务偏好示例，不能推断个人胜任力、执业资格或录用结论。",
  },
  topology: {
    title: "职责全景：两岗在企业安全防御链路中如何衔接？",
    summary:
      "分析师守运行时的“监测、溯源与升级建议”，工程师建系统层的“边界防护、研发左移与灰度回退”，两者通过“检测规则优化”与“事故复盘回流”形成闭环。",
    ariaLabel: "企业安全纵深防御职责拓扑图（上下平行无交叉双向回路）",
    leftZoneTitle: "运行监测与响应域 · 分析师主场",
    leftSteps: [
      { title: "1. 告警接入与降噪分诊", detail: "SOC / SIEM（日志集中分析）/ 态势感知" },
      { title: "2. 多源关联与行为映射", detail: "EDR（终端监控）/ 出口日志 / ATT&CK 归类" },
      { title: "3. 定级留痕与升级建议", detail: "拆分已证实与缺口 / 交应急负责人拍板" },
    ],
    centerZoneTitle: "双向衔接带 · 检测工程 / SecOps",
    upperBridge: {
      title: "上行回路：规则与监控接入",
      line1: "新防护策略日志回流 SIEM",
      line2: "联合调优检测规则与 SOAR 剧本",
    },
    lowerBridge: {
      title: "下行回路：复盘缺口驱动改造",
      line1: "分析岗移交攻击链路与日志盲区",
      line2: "工程岗拆解为权限与边界整改单",
    },
    rightZoneTitle: "体系建设与加固域 · 工程师主场",
    rightSteps: [
      { title: "1. 边界、数据库与出口防线", detail: "WAF / RDS 最小权限 / 代理与安全组分控" },
      { title: "2. 研发左移与服务端鉴权", detail: "SAST · DAST · SCA / K8s / 最小权限控制" },
      { title: "3. 灰度验证与一键回退", detail: "正常业务回归 / 审批留痕 / 异常撤回" },
    ],
  },
  matrix: {
    title: "核心 9 维对照表：先看最决定选岗的 4 行，再展开细节",
    summary:
      "先核对“核心交付物、作息与值班、代码深度、权限与入行门槛”4 项硬指标，就能排除大部分因头衔误解导致的投递偏差。",
    roleAColumn: "信息安全分析师（运行时研判与响应）",
    roleBColumn: "信息安全工程师（系统层建设与加固）",
    expandButtonLabel: "展开其余 5 维细节（工具 / 团队 / 职业摩擦 / 考证 / 演进）",
    collapseButtonLabel: "收起后 5 维（仅看核心 4 行）",
    rows: [
      {
        id: "deliverables",
        dimension: "1. 核心交付物",
        roleA: "事件研判单、多源时间线、IOC（失陷指标）清单、升级建议与交班复盘记录",
        roleB: "防护架构方案、WAF/数据库/出口变更单、正常业务回归凭证与回退预案",
        defaultVisible: true,
      },
      {
        id: "schedule",
        dimension: "2. 作息与值班",
        roleA: "告警驱动：部分 SOC 与驻场岗执行 7×24 倒班或节假日轮值；标明白班的岗位亦需向招聘方核实是否含 on-call 或重保值守",
        roleB: "项目与发布窗口驱动：以版本上线和变更排期为主；是否固定白班、以及夜间变更窗口与重保值守频次须向招聘方核实",
        defaultVisible: true,
      },
      {
        id: "coding",
        dimension: "3. 代码与工具深度",
        roleA: "以 SQL、正则检索日志为基础；用 Python / Shell 写批量拉证与降噪脚本，进阶涉及 Sigma/KQL 等检测规则",
        roleB: "需读懂业务配置、代码 PR 与依赖清单；云安全或 AppSec 方向涉及 Python/Go 自动化脚本及 CI/CD 安全门禁配置",
        defaultVisible: true,
      },
      {
        id: "entry",
        dimension: "4. 权限与入行门槛",
        roleA: "面试先核清三件事：生产环境的查询权限范围有多大、发现风险后谁审批隔离、谁负责执行；入门重网络协议（TCP/IP、HTTP）、Linux 与日志研判逻辑",
        roleB: "按变更审批流程执行策略与架构改动；有运维、网络、云平台或开发经验者更易复用既有工程基础",
        defaultVisible: true,
      },
      {
        id: "tools",
        dimension: "5. 一线高频工具",
        roleA: "SIEM（如 Splunk / ELK）、EDR（终端监控）、Wireshark 抓包、MITRE ATT&CK 行为映射（仅作行为归类，非攻击者归因）",
        roleB: "WAF（Web 防火墙）、RDS 独立权限管控、出口代理与安全组、K8s 安全、SAST（静态代码扫描）/ DAST（动态测试）/ SCA（开源依赖扫描）",
        defaultVisible: false,
      },
      {
        id: "employers",
        dimension: "6. 典型雇主与团队",
        roleA: "银行、运营商、互联网甲方 SOC 团队，或托管安全服务商（MSSP）",
        roleB: "互联网甲方安全部、云厂商、车企/金融科技、安全产品研发商与系统集成商",
        defaultVisible: false,
      },
      {
        id: "friction",
        dimension: "7. 典型职业摩擦",
        roleA: "高误报率带来的研判疲劳、日志缺字段需跨组追查、轮班节奏对作息的影响",
        roleB: "推动业务团队排期整改的沟通成本、策略误拦引发的业务质疑、合规留痕负担",
        defaultVisible: false,
      },
      {
        id: "certs",
        dimension: "8. 考证实际用途",
        roleA: "入门核查日志排查实操；若目标交付或投标项目点名 CISP，入职前先核认证类别与公司报销条件",
        roleB: "国企或事业单位专业技术职务聘任可核软考中级；授权渗透评估可核 OSCP/OSCP+；资深架构管理满年限后可核 CISSP",
        defaultVisible: false,
      },
      {
        id: "growth",
        dimension: "9. 3–5 年演进路径",
        roleA: "一线研判 → 二线应急响应（IR）/ 检测规则工程 / 威胁情报 / 安全运营带班",
        roleB: "防护实施 → 云安全 / 应用安全（AppSec）/ 安全架构师 / DevSecOps 负责人",
        defaultVisible: false,
      },
    ],
    hybridRoleNote: {
      prefix: "混合岗存在性示例：公开招聘中存在同时要求 SIEM/安全运营、应急响应与攻防加固交叉职责的岗位，例如 ",
      linkLabel: "V2EX 公开招聘贴 #1200917（2026-03-25 发布，日本总部海外游戏公司远程招聘转帖）",
      href: "https://www.v2ex.com/t/1200917",
      suffix: "。该样本仅证明市场存在混合 JD，不代表中国大陆行业整体岗位比例。",
    },
  },
  aiPlugin: {
    badge: "选配外挂模块 A（证据绑定）· 微软三份独立研究 + NSA 2026-05-20 MCP 指南 + OWASP",
    title: "AI 工作流边界：哪些任务可出草稿，哪些必须人工核验与担责？",
    summary:
      "AI 工具接管的是信息整合与初稿生成，而非最终担责。以下逐项区分三份不同对象的研究（真实 SOC 观察相关性、Entra/Intune 管理随机试验、以及比较事件摘要/脚本分析/事件报告/引导式响应的安全专业人员随机试验），并单独陈述 NSA（2026-05-20）与 OWASP 的安全控制建议。",
    diagramCaption:
      "图：两岗 AI 辅助工作流三层责任边界（反例均为编辑模拟示例，非实证发现；移动端优先阅读下方完整表格）",
    diagramAriaLabel: "两岗 AI 辅助工作流三层责任边界：出草稿、人工逐项核验、授权签字担责",
    tableRoleAColumn: "信息安全分析师场景",
    tableRoleBColumn: "信息安全工程师场景",
    tiers: [
      {
        tier: "第 1 层 · AI 可生成初稿",
        tone: "blue",
        roleALabel: "分析岗：",
        roleBLabel: "工程岗：",
        roleAScenario: "单源日志摘要、重复误报聚类、值班简报初稿",
        roleBScenario: "常规 WAF/正则草案、基础漏扫汇总、等保对照初稿",
        svgRoleALine: "单源日志摘要、重复误报聚类、值班简报初稿",
        svgRoleBLine: "常规 WAF/正则草案、基础漏扫汇总、文档初稿",
        svgCounterHeading: "编辑模拟反例（非实证发现）：",
        svgCounterLines: [
          "AI 摘要把“正常业务重试”归为良性噪声，",
          "或生成的 WAF 正则过宽导致正常登录请求",
          "被误拦；须人工复核原证后方可执行。",
        ],
        editorialCounterExample:
          "【编辑模拟反例】将正常业务重试误归类为良性噪声，或生成的 WAF 正则过宽导致正常登录被误拦。",
        redline: "禁止将 AI 摘要替代原始日志直接关单，或跳过正常业务回归直接上线规则。",
      },
      {
        tier: "第 2 层 · 需人工逐项核验",
        tone: "amber",
        roleALabel: "分析岗：",
        roleBLabel: "工程岗：",
        roleAScenario: "跨 SIEM/EDR 多源关联假设核查、混淆脚本还原验证、核查 Agent 异常工具调用审计链",
        roleBScenario: "SAST/SCA 扫描结果人工降噪、按 NSA MCP 指南验证工具参数过滤、容器沙箱与服务端隔离",
        svgRoleALine: "多源关联假设核查、混淆脚本复核、Agent 审计",
        svgRoleBLine: "SAST/SCA 降噪、MCP 参数过滤与沙箱隔离",
        svgCounterHeading: "编辑模拟反例（非实证发现）：",
        svgCounterLines: [
          "跨系统日志时区偏移叠加混淆载荷时，自动",
          "排查建议漏掉关键主机上下文，仍需人工逐",
          "条回溯原始日志与服务端鉴权配置。",
        ],
        editorialCounterExample:
          "【编辑模拟反例】跨系统日志时间偏移叠加混淆载荷时，自动生成的排查步骤遗漏关键主机上下文，仍须人工回溯原证。",
        redline: "OWASP 明确提示词注入无法仅靠单层提示词根治，须由服务端强制执行最小权限与输入/输出校验。",
      },
      {
        tier: "第 3 层 · 需授权签字担责",
        tone: "green",
        roleALabel: "分析岗：",
        roleBLabel: "工程岗：",
        roleAScenario: "信息残缺下的事件定级、按预案提交隔离建议与恢复验收条件",
        roleBScenario: "业务性能与防护策略权衡、生产灰度放行、异常回退签字与服务端鉴权边界设计",
        svgRoleALine: "信息残缺下的升级定级与隔离建议签发",
        svgRoleBLine: "生产变更审批、灰度回退拍板与服务端鉴权",
        svgCounterHeading: "编辑模拟反例（非实证发现）：",
        svgCounterLines: [
          "将生产封禁或高危工具调用交由模型免审执",
          "行，遇间接提示词注入时触发越权删改或核",
          "心交易中断；高影响操作须人工闭环审批。",
        ],
        editorialCounterExample:
          "【编辑模拟反例】将生产封禁或高危工具调用交由模型免审执行，遇间接提示词注入时触发越权删改或业务中断。",
        redline: "高影响或不可逆生产动作必须保留人工审批闭环（Human-in-the-Loop），具体审批与执行归属按组织预案落实。",
      },
    ],
    evidenceHeading: "逐项区分证据来源与研究对象（不将不同研究混为同一结论）：",
    evidenceRecords: [
      {
        id: "ms-soc-obs",
        studyType: "真实 SOC 观察性研究（仅相关性）",
        subject: "企业真实 SOC 运营事件",
        findingBoundary:
          "只报告工具采用与事件平均解决时间（MTTR）变化之间的统计关联，论文明确提示存在未观测混杂因素，不可当作岗位替代因果证据。",
        linkLabel: "Bono, Grana & Xu (2024), arXiv:2411.03116",
        href: "https://arxiv.org/abs/2411.03116",
      },
      {
        id: "ms-it-rct",
        studyType: "IT 管理员随机对照试验（RCT）",
        subject: "IT 管理员执行 Microsoft Entra / Intune 管理任务",
        findingBoundary:
          "评估的是身份与终端管理任务表现，研究对象为 IT 运维管理员而非一线 SOC 安全运营分析师。",
        linkLabel: "Bono & Xu (2024), arXiv:2411.01067",
        href: "https://arxiv.org/abs/2411.01067",
      },
      {
        id: "ms-econ-rct",
        studyType: "安全专业人员随机对照试验（2024-01）",
        subject: "147 名安全专业人员与 149 名安全新手（Defender XDR 模拟场景）",
        findingBoundary:
          "具体比较事件摘要（Incident summarization）、脚本分析（Script analysis）、事件报告（Incident report）与引导式响应（Guided response）四项任务：保持准确度/质量恒定时，安全专业人员组在事件摘要快 46.2%、事件报告快 20.5%，但在引导式响应任务上慢 26.3%（作者亦指出该项基线最短且实验期工具加载常超 20 秒）。",
        linkLabel: "Microsoft Security Copilot RCT Whitepaper (Edelman et al., 2024 PDF)",
        href: "https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/final/en-us/microsoft-brand/documents/microsoft_security_copilot_economic_report_v4_accessible.pdf",
      },
      {
        id: "nsa-mcp",
        studyType: "官方安全设计规范（2026-05-20）",
        subject: "Model Context Protocol (MCP) 驱动的 AI 自动化架构",
        findingBoundary:
          "与 OWASP LLM Prompt Injection / AI Agent 防护指南共同构成安全控制建议：明确服务端独立授权、工具参数校验、最小权限隔离、全链路审计日志及高影响动作的人工审批（HITL）。",
        linkLabel: "NSA 2026-05-20 MCP 安全设计官方发布页",
        href: "https://www.nsa.gov/Press-Room/Press-Releases-Statements/Press-Release-View/Article/4496698/nsa-releases-security-design-considerations-for-ai-driven-automation-leveraging/",
      },
    ],
    governanceBoundaryNote:
      "控制落地归属说明：NSA（2026-05-20）与 OWASP 给出的是授权、参数校验、最小权限与人工审批等架构和流程建议；在真实企业中，具体由哪个角色负责核验、审批和执行，以各组织的应急预案与岗位授权为准。",
    interviewQuestionsTitle: "面试初级岗位直接核验两句：",
    interviewQuestions: [
      "① “团队目前是否已用 AI 或 SOAR 做一级告警降噪？新人人工复核 AI 摘要的抽检标准是什么？”",
      "② “入职 6 个月内，新人是否有权限参与检测规则调优、工具权限审计或进入二线应急？”",
    ],
    scenarioExerciseTitle: "面试情境练习题：如果被问“你会如何用 AI 辅助日常安全工作？”",
    scenarioExerciseBody:
      "建议按三层框架作答：① 说明你仅把 AI 用于哪些“出草稿”环节（单源日志摘要或规则草案）；② 说明你的“人工复核机制”（回查原始日志字段、检查提示词注入与正常业务回归用例）；③ 明确“不可让渡的授权边界”（生产封禁、权限调整与策略发布须按组织预案由指定审批人与获授权执行人落地）。",
  },
  incident: {
    title: "模拟交接案例：凌晨 02:03 核心库异常读量与陌生外连",
    summary:
      "以下为用于展示两岗责任边界的模拟交接案例（非真实企业公开复盘事故）；核心原则是先拆清“已证实事实、待核缺口与审批权归属”，给出可执行解除隔离验收条件，并严格区分 WAF、数据库权限与出口控制防线。",
    triggerLabel: "模拟触发场景：",
    triggerBody:
      "凌晨 02:03，数据库审计捕获某离线报表只读账号对核心订单表的查询量显著高于历史夜间基线；02:06，同一业务集群内的一台应用主机（app-node-04）向境外未知 IP 发起外连。",
    triggerCaveat: "注意：仅凭同集群告警与陌生外连，不足以直接定性已发生数据外泄。",
    rows: [
      {
        stage: "02:03–02:30",
        roleLabel: "信息安全分析师",
        tone: "roleA",
        verifiedFacts:
          "在 SIEM 对齐时区与采集延迟；结合「主机名（app-node-04）+ 精确时间戳 + 进程号（PID）」在 EDR 锁定发起外连的具体进程；核实凌晨财务结算任务正在读库。",
        openGaps:
          "报表只读账号的读量突增是否属于临时业务跑批？外连载荷是否包含业务数据？涉事账号凭证是否已在其他节点泄露？",
        actionAndApproval:
          "分析师无权擅自封禁共享结算账号；按应急预案向预案指定人员提交单节点受控隔离建议与解除隔离验收条件，经审批后由获授权人员执行隔离并留痕，同时保全内存与日志。",
      },
      {
        stage: "次日 09:30–16:00",
        roleLabel: "信息安全工程师",
        tone: "roleB",
        verifiedFacts:
          "复盘拆清三层控制归属：WAF 仅护 Web 入口；报表查询归数据库（RDS）独立账号与表级最小权限；应用外连按层级分控——域名级白名单策略由出口代理（Egress Proxy）执行，安全组按平台支持的目的 IP/CIDR 或安全组，以及协议和端口，限制允许的出站访问（不笼统塞进云 IAM）。",
        openGaps:
          "收紧 RDS 表级权限与出口白名单后，是否会影响月底财务对账脚本或第三方回调？涉事凭证轮换后的所有下游依赖是否已完成切换？",
        actionAndApproval:
          "协同 DBA 与研发完成涉事账号凭证轮换与泄露排查；提交含正常报表回归用例、低峰灰度窗口与一键回退条件的变更单，经授权变更负责人审批后分批发布，并将精准检测规则回写 SIEM。",
      },
    ],
    recoveryAcceptanceTitle: "可执行解除隔离验收条件（模拟标准）：",
    recoveryAcceptanceCriteria:
      "必须同时满足三项方可解除隔离：① 正常财务结算与离线报表回归用例全部通过；② 涉事旧凭证已撤销且所有下游应用/脚本完成新凭证切换验证；③ 可疑外连在约定观察窗（如连续 24 小时）内未再复现。以上记录齐全后，由应急值班负责人与业务方共同签字确认解除隔离。",
    defenseLayerNote:
      "依据 NIST SP 800-61r3 事件响应流程与云网络控制原理：响应阶段须分离研判、审批与执行权；出口代理负责域名策略，安全组按平台支持的目的 IP/CIDR 或安全组以及协议和端口限制允许的出站访问。",
  },
  payAndCerts: {
    title: "中国大陆薪酬核对口径、官方考证对照表与 3 条面试必问句",
    summary:
      "中国大陆暂无严格对应两岗招聘头衔的全国官方单职薪资分位；比较 Offer 须拆开固定年薪与班次/差旅补偿，考证须严格区分“国家水平资格、单位聘任、地方政策与项目投标条件”。",
    salaryHeading: "薪酬怎么比才不吃亏（官方统计口径说明）",
    salaryBody:
      "国家统计局《2025 年城镇单位就业人员年平均工资情况》仅覆盖行业及规上企业岗位大类均值，人社部《企业薪酬调查信息（2024 年）》按其职业分类公布参考分位，两者均不能直接换算为“安全分析师 vs 安全工程师”的全国单岗排序。比较同城同资历的录用方案时，请把税前固定年薪单独列出，再并列拆开夜班/轮值津贴、节假日加班补偿、护网重保补贴、年均出差/驻场天数与绩效兑现条件，核算真实时薪。",
    certs: [
      {
        name: "软考“信息安全工程师”（中级）",
        officialScope: "人社部与工信部组织的国家级计算机专业技术资格（水平）考试，对应中级资格。",
        workplaceBoundary:
          "三项分列核对：① 资格本身全国有效；② 是否聘任中级职务由目标单位按内部制度决定；③ 积分落户或人才补贴以各省市当期人社公告为准。",
        verificationTips: "报名费由各地考务公布；计划进入国企或事业单位者可先核聘任条件，纯技术岗面试仍重点考察实操。",
      },
      {
        name: "CISP（含 CISE / CISO）",
        officialScope: "中国信息安全测评中心开展的注册信息安全专业人员资质认定；须经授权机构培训，满足学历与工作年限并按期维持注册。",
        workplaceBoundary:
          "乙方安全服务商、系统集成商在项目投标或政企交付中可能明确要求；注意：CISP-CISO 是安全管理认证类别，不等同于企业首席信息安全官（CISO）头衔。",
        verificationTips: "培训与注册费用以当期授权机构公开报价及官方维持标准为准；入职前先向招聘方核实是否属于投标必需及是否支持报销。",
      },
      {
        name: "OSCP 与 OSCP+",
        officialScope:
          "OffSec 实操攻防认证（对应 PEN-200 课程）。有效期与续期分列：传统 OSCP 无到期日；OSCP+ 为 3 年有效期，续期规则以 OffSec 官方维护手册为准，支持通过合规 CPE（继续教育学分）与年度维护（Annual Maintenance）或再认证维持有效状态，并非必须重考。",
        workplaceBoundary: "授权渗透测试、红队评估及外企/出海安全技术岗的高识别度实操能力证明。",
        verificationTips: "备考强度与费用较高，明确走攻防评估路线前先核目标团队是否采纳及当期续期要求。",
        officialLinks: [
          {
            label: "OffSec CPE 与年度维护官方手册（OSCP+ 续期规则）",
            href: "https://help.offsec.com/hc/en-us/articles/35366391096596-OffSec-CPE-Program-and-Annual-Maintenance-Handbook",
          },
          {
            label: "PEN-200 课程入口",
            href: "https://www.offsec.com/courses/pen-200/",
          },
        ],
      },
      {
        name: "CISSP",
        officialScope:
          "ISC2 国际信息系统安全认证；要求在 8 个知识域中至少 2 个域累计具备 5 年全职相关工作经验（符合 ISC2 条件的兼职工作可按规则折算，带薪或无薪实习均可按官方规则提交证明认定；满足指定学历或认可证书条件者最多可抵免 1 年）。",
        workplaceBoundary: "面向中高级安全架构、风险治理、安全管理及外企资深岗位。",
        verificationTips: "经验不足者通过考试后可申请 Associate of ISC2 身份，在校生与初级新人不必过早投入。",
      },
    ],
    interviewChecklistTitle: "全页核心收藏：面试时直接拿去核验的 3 句反问",
    interviewChecklistQuestions: [
      {
        label: "核作息与隐形值守",
        question: "“JD 写白班，请问最近一个季度内团队有没有 on-call 电话待命、节假日轮值或护网重保值守？倒休和补贴怎么写进录用说明？”",
      },
      {
        label: "核证书真实用途",
        question: "“岗位写的 XX 证书优先，是个人录用硬门槛、乙方项目投标挂名，还是入职后由公司按制度支持报销考取？”",
      },
      {
        label: "核成长与变更权",
        question: "“如果安全整改遇到业务排期冲突，团队有没有独立测试环境和明确拍板机制？新人入职半年内能签收哪类进阶交付？”",
      },
    ],
  },
  thirtyDayPlugin: {
    badge: "选配外挂模块 B · 双轨 30 天入门作品清单（每周只交 1 件可验收作品）",
    title: "30 天双轨入门路线：零基础 vs 有 IT 基础，每周交什么作品？",
    summary:
      "不要泛泛囤课——按你当前的背景选定一条轨道，坚持“每周只交 1 件面试官看得懂、能复核的纸面或本地实验室作品”。",
    tracks: [
      {
        id: "track-a",
        title: "轨道 A：零基础 / 非科班切入（偏分析轨）",
        badge: "每周 1 件作品",
        tone: "roleA",
        weeks: [
          {
            weekLabel: "第 1 周",
            deliverable: "整理 1 张《HTTP 状态码 + TCP 握手 + Linux /var/log 关键日志定位速查表》。",
          },
          {
            weekLabel: "第 2 周",
            deliverable: "用公开脱敏日志练习 grep/awk/jq 或 SQL 筛选，输出 1 份《异常请求特征提取命令集》。",
          },
          {
            weekLabel: "第 3 周",
            deliverable: "对照公开漏洞通告（如下文 NGINX 桌面练习），交 1 份严格区分“已证实 / 待核缺口”的《事件研判单》。",
          },
          {
            weekLabel: "第 4 周",
            deliverable: "写 1 条针对重复告警的《降噪检测规则草案 + 误报排查清单》，并请同伴仅凭文档复述定级结论。",
          },
        ],
      },
      {
        id: "track-b",
        title: "轨道 B：有运维 / 网络 / 开发基础（偏工程轨）",
        badge: "每周 1 件作品",
        tone: "roleB",
        weeks: [
          {
            weekLabel: "第 1 周",
            deliverable: "在本地 Docker 环境拆解 1 份《WAF 入口 + RDS 独立只读账号 + 出口代理与安全组三层边界拓扑图》。",
          },
          {
            weekLabel: "第 2 周",
            deliverable: "在公开演示仓库的 CI 流程中分别接入 1 项 SCA（开源依赖扫描）与 SAST（静态代码扫描），交 1 份《误报过滤配置说明》。",
          },
          {
            weekLabel: "第 3 周",
            deliverable: "针对高危组件升级或权限收紧，交 1 份含正常业务回归用例与一键回退条件的《安全变更方案》。",
          },
          {
            weekLabel: "第 4 周",
            deliverable: "围绕内部服务接口，交 1 份《服务端最小权限、输入校验与审计日志设计清单》。",
            deliverableWhenAiEnabled:
              "参考 NSA 2026-05-20 MCP 指南与 OWASP Agent 安全指南，围绕内部工具调用接口交 1 份《服务端最小权限、参数校验与审计日志设计清单》。",
          },
        ],
      },
    ],
  },
  checklist: {
    title: "工作条件与 JD 核对清单（支持网页勾选与打印离线打勾）",
    summary:
      "严格拆分“已具备技能底子”与“可接受工作条件”，不将两类维度混算为单一倾向分；勾选后直接生成三栏独立输出与面试待核清单。",
    skillsHeading: "第一部分：核对当前技能底子（可多选，仅记录已有基础）",
    skillsOptions: [
      {
        id: "skill-analyst",
        track: "roleA",
        label: "熟悉 TCP/IP、HTTP 协议与 Linux 日志目录，能用 SQL/正则筛选日志（分析轨起步技能）",
        summary: "已具备协议、Linux 与日志筛选基础（分析轨起步技能）",
        interviewQuestions: [
          "“团队目前使用哪套 SIEM/EDR 平台？新人上手日志字段和关联查询是否有现成文档或带教？”",
        ],
      },
      {
        id: "skill-engineer",
        track: "roleB",
        label: "有运维、网络配置或开发经验，能读懂业务代码 PR、云权限或容器配置（工程轨起步技能）",
        summary: "已具备运维/网络/开发与配置变更基础（工程轨起步技能）",
        interviewQuestions: [
          "“目标安全工程岗中，云权限/边界配置、AppSec 代码评审与安全开发大致怎么分工？”",
        ],
      },
      {
        id: "skill-entry",
        label: "目前两类技能底子都尚浅，需要从基础实验和桌面练习开始补齐",
        summary: "两类实操基础尚浅，待通过本地实验与桌面验证补齐",
        interviewQuestions: [
          "“团队对校招或转行新人的前 90 天培养节奏是什么？入职首月是否配有独立演练环境？”",
        ],
      },
    ],
    conditionsHeading: "第二部分：核对可接受的工作条件与压力偏好（可多选，与技能分开看）",
    conditionsOptions: [
      {
        id: "cond-analyst",
        track: "roleA",
        label: "接受告警驱动与限时排查节奏，且短期内可接受明确排班、on-call 或重保值守",
        summary: "可接受告警驱动、限时研判与明确排班/值守",
        interviewQuestions: [
          "“请用最近一季度的真实排班表说明白班/夜班/节假日轮值频次，以及倒休与补贴结算规则。”",
        ],
      },
      {
        id: "cond-engineer",
        track: "roleB",
        label: "偏好通过脚本与配置变更根治重复问题，愿意承担跨部门排期沟通、灰度验证与回退责任",
        summary: "倾向通过工程改造根治问题，愿承担跨部门沟通与灰度回退责任",
        interviewQuestions: [
          "“当安全加固与业务上线冲突时谁拍板？策略误拦后的紧急回退 SLA 和责任边界怎么划分？”",
        ],
      },
      {
        id: "cond-hybrid",
        label: "目标岗位为分析与工程交叉的混合岗（如 SecOps / 安全运营开发），愿同时核实两类占比",
        summary: "目标为混合岗，需重点核实告警处置与工程建设占比",
        interviewQuestions: [
          "“这个混合岗在日常工作里，告警分诊、规则调优和防护建设三块各占多大时间比例？”",
        ],
      },
    ],
    defaultInterviewQuestions: [
      "“新人入职前 3 个月，每周占比最高的交付物是事件研判单，还是策略/代码变更单？”",
      "“如果告警排查发现需要改规则或收紧权限，谁有生产变更审批权，谁负责正常业务回归？”",
    ],
    crossTrackNote:
      "跨维度提醒：你的「已有技能」与「可接受工作条件」分属不同轨道（例如具备分析排查基础但更倾向工程改造条件）——这属于实际的跨轨转岗组合而非“暂不确定”，面试时应主动核实团队是否支持从现有基础过渡，并确认首季培训与变更授权范围。",
    offlinePrintHint: "打印或离线使用时，直接勾选上方方框并对照“面试 3 句反问”逐项向招聘方核实即可。",
  },
  desktopExercise: {
    sectionTitle: `纯桌面验证练习：基于 NGINX ${NGINX_CVE_2024_24989_FACT.cveId}（含 5 项核分参考答案）`,
    summary:
      "全程仅用公开网页与纸笔（约 30–60 分钟，零线上操作、零真实账号），通过同一份官方安全公告体验“查日志排障”与“控风险变更”的手感差异。",
    factSummarySegments: [
      { text: NGINX_CVE_2024_24989_FACT.cveId, tone: "code" },
      { text: " 仅影响 " },
      { text: NGINX_CVE_2024_24989_FACT.affectedVersion, tone: "strong" },
      { text: ` 中${NGINX_CVE_2024_24989_FACT.precondition}的实例，触发 ` },
      { text: NGINX_CVE_2024_24989_FACT.failureMechanism, tone: "strong" },
      { text: "； 首个修复版本为 " },
      { text: NGINX_CVE_2024_24989_FACT.firstFixedVersion, tone: "code" },
      { text: `（${NGINX_CVE_2024_24989_FACT.productionAdvice}，或${NGINX_CVE_2024_24989_FACT.mitigationOption}）。排查时以 ` },
      { text: "error.log", tone: "code" },
      { text: " 中的崩溃记录与网关异常断连为排查线索，同时保留 " },
      { text: "access.log", tone: "code" },
      { text: " 用于正常业务回归验证与辅助时序关联。" },
    ],
    publicLinks: [
      { label: "NGINX 官方安全公告列表", href: "https://nginx.org/en/security_advisories.html" },
      {
        label: "NGINX 2024-02-14 厂商原公告（明确区分 24989 与 24990 版本区间）",
        href: "https://mailman.nginx.org/pipermail/nginx-announce/2024/NW6MNW34VZ6HDIHH5YFBIJYZJN7FGNAV.html",
      },
      { label: "NGINX 核心模块与 error_log 文档", href: "https://nginx.org/en/docs/ngx_core_module.html" },
      { label: "NGINX HTTP 日志模块（access_log）文档", href: "https://nginx.org/en/docs/http/ngx_http_log_module.html" },
    ],
    taskA: {
      title: "任务 A（体验信息安全分析师）",
      instruction: `写 1 页排查单：列明需向平台运维核对的 3 项资产前提（版本是否命中 ${NGINX_CVE_2024_24989_FACT.affectedVersion}、模块与 quic 配置），写出首要排查线索（${NGINX_CVE_2024_24989_FACT.primaryLogClue}），说明 access.log 的辅助用途，并严格分开记录「${NGINX_CVE_2024_24989_FACT.threeRecordStates[0]}」「${NGINX_CVE_2024_24989_FACT.threeRecordStates[1]}」「${NGINX_CVE_2024_24989_FACT.threeRecordStates[2]}」。`,
    },
    taskB: {
      title: "任务 B（体验信息安全工程师）",
      instruction: `写 1 页变更单：对比“升级至当前受支持的已修复版本（首个修复版本为 ${NGINX_CVE_2024_24989_FACT.firstFixedVersion}）”与“${NGINX_CVE_2024_24989_FACT.mitigationOption}”两条路径的业务影响，写出 2 条基于 access.log 与健康检查的正常业务回归用例、灰度观察指标，以及异常回退负责人与触发条件。`,
    },
    rubricTitle: "5 项自检核分标准与参考样答（先写完草稿再逐项核对）",
    rubricPassRule: "每项 1 分，≥4 分且第 ①②④ 项必过：",
    rubricItems: [
      `① 准确标出 ${NGINX_CVE_2024_24989_FACT.cveId} 仅影响 ${NGINX_CVE_2024_24989_FACT.affectedVersion}（核对厂商 2024-02-14 原公告，切勿与同批次其他漏洞的版本区间混淆）及 ${NGINX_CVE_2024_24989_FACT.precondition} 前提；`,
      `② 将 error.log 中的 worker process exited on signal 11 与网关/上游异常断连列为首要排查线索，同时保留 access.log 用于业务回归与辅助时序关联；`,
      `③ 即使版本命中且观察到崩溃，也严格分列「${NGINX_CVE_2024_24989_FACT.threeRecordStates[0]}」「${NGINX_CVE_2024_24989_FACT.threeRecordStates[1]}」「${NGINX_CVE_2024_24989_FACT.threeRecordStates[2]}」，不直接认定已遭利用；`,
      `④ 明确区分首个修复版本（${NGINX_CVE_2024_24989_FACT.firstFixedVersion}）与生产升级建议（升级至当前官方受支持的已修复版本）或临时关闭 quic 缓解路径，并写出正常业务回归用例与回退触发条件；`,
      "⑤ 标明资产核对人、变更审批负责人与异常回退执行人。",
    ],
    sampleAnswerALabel: "参考样答（任务 A · 分析研判）：",
    sampleAnswerA: `仅看到网关偶发断连或 502，不能证明触发 ${NGINX_CVE_2024_24989_FACT.cveId}。需先请平台运维核对三项前提：① 线上版本是否精确命中 ${NGINX_CVE_2024_24989_FACT.affectedVersion}（按厂商 2024-02-14 原公告核对，不与同批次其他漏洞的版本区间混用）；② 是否编译启用 ngx_http_v3_module 且 listen 开启 quic；③ 检查 error.log（必要时结合系统 dmesg）是否出现 worker process <PID> exited on signal 11 及上游异常断连，并用 access.log 辅助核对同时间窗的正常请求状态。在版本与日志未闭环前状态保留待核；即使同时命中 ${NGINX_CVE_2024_24989_FACT.affectedVersion} 与崩溃线索，也仅分项记录「${NGINX_CVE_2024_24989_FACT.threeRecordStates[0]}」「${NGINX_CVE_2024_24989_FACT.threeRecordStates[1]}」「${NGINX_CVE_2024_24989_FACT.threeRecordStates[2]}」，不可直接按已遭利用上报。`,
    sampleAnswerBLabel: "参考样答（任务 B · 工程变更）：",
    sampleAnswerB: `若资产确认命中 ${NGINX_CVE_2024_24989_FACT.affectedVersion} 且启用 quic，优先提交“灰度升级至当前官方受支持的已修复版本（该漏洞首个修复版本为 ${NGINX_CVE_2024_24989_FACT.firstFixedVersion}）”变更单；若短期无升级窗口且业务确认可安全回退 HTTP/2，则提交“临时移除 listen 中 quic 参数”缓解变更。正常业务回归用例需覆盖健康检查 200 及核心页面/媒体在 access.log 中的常规请求成功率，灰度期间重点监测 error.log Worker 崩溃数、连接重置率与时延基线；一旦出现变更引入的访问异常，由指定变更负责人立即停止扩围并按已审批预案执行回退。`,
  },
  tools: {
    title: "下一步工具分流：按你当前最缺的一条线索单选使用",
    summary:
      "公开主线测评支持免费开测与基础结果查看（深度报告以现行服务端权益为准）；不同工具用途不同，按当前缺口单选一项即可，无需连续重复测评：",
    cards: [
      {
        id: "holland",
        badge: "兴趣六维探索",
        meta: "60 题 · 约 8 分钟",
        tone: "roleA",
        title: "霍兰德职业兴趣测试（RIASEC）",
        description: "查看你的兴趣六维与三字代码，辅助识别长期任务偏好（兴趣不等于胜任力或录用资格）。",
        purposeHint: "适用场景：不确定自己更享受持续排查还是系统设计。",
        ctaLabel: "免费开测并看基础结果 →",
        href: "/zh/tests/holland-career-interest-test-riasec",
      },
      {
        id: "career94",
        badge: "活动·方式·条件",
        meta: "94 题 · 工作条件核查",
        tone: "roleB",
        title: "职业测试（94 题）",
        description: "侧重核查工作活动、协作方式与工作条件，把结果直接转成面试核验问题。",
        purposeHint: "适用场景：兴趣方向已有眉目，需重点核对班次与协作条件。",
        ctaLabel: "免费开测并看基础结果 →",
        href: "/zh/tests/career-planning-and-work-style-test",
      },
      {
        id: "compare-c1",
        badge: "任意两岗并排",
        meta: "实时内存对比",
        tone: "neutral",
        title: "C1 自由职业对比",
        description: "把网安与系统运维、网络支持或后端开发并排对照，快速理清相邻转岗路径。",
        purposeHint: "适用场景：正在权衡网安与其他 IT 岗位的转岗成本。",
        ctaLabel: "打开 C1 自由对比 →",
        href: "/zh/career/compare",
      },
      {
        id: "worksheet-c2",
        badge: "免注册·不落库",
        meta: "支持 TXT / Markdown / 打印",
        tone: "accent",
        title: "C2 免费职业探索工作表",
        description: "把目标岗位、待核实的排班/考证问题与下一步行动填进表格导出带走（仅本地填写，不落库保存）。",
        purposeHint: "适用场景：已准备投递或面试，需要带走一页核验表。",
        ctaLabel: "免费填写并导出 →",
        href: "/zh/career/interest-worksheet",
      },
    ],
    profileLinksLabel: "延伸单岗档案：",
    profileLinks: [
      { label: "信息安全分析师", href: "/zh/career/jobs/information-security-analysts" },
      { label: "信息安全工程师", href: "/zh/career/jobs/information-security-engineers" },
      { label: "计算机网络支持专员", href: "/zh/career/jobs/computer-network-support-specialists" },
    ],
  },
  faqs: [
    {
      id: "faq-secops-title",
      question: "国内招聘写的“安全运营工程师”等于 SOC 分析师吗？",
      answer:
        "不一定相等。部分企业的“安全运营工程师”核心工作是 SOC 告警监控、分诊与应急响应（偏分析轨）；另一类团队（如甲方安全部或云厂商）会要求该岗位同时承担 SIEM 检测规则开发、SOAR 剧本与防护策略调优（属分析+工程混合岗）。投递前请对照 JD 中“告警处置”与“策略开发”哪一项占主要篇幅，并在面试核实首季交付物。",
    },
    {
      id: "faq-dayshift-oncall",
      question: "JD 写着“正常白班”，入职后是否还要 on-call 或护网重保值守？",
      answer:
        "仅看“白班”字样不足以排除非工作时间值守：部分标明白班的安全岗仍可能包含周期性 on-call 电话待命、高危漏洞夜间变更窗口或重保轮值。面试时不要笼统问“加不加班”，建议请直属主管用最近一个季度的排班或变更记录举例，并确认倒休与补贴是否写入录用说明。",
    },
    {
      id: "faq-dev-ops-switch",
      question: "原来是开发或运维，转网络安全先投分析师还是工程师？",
      answer:
        "建议优先对口复用既有工程底子：后端或前端开发背景转应用安全（AppSec）、安全研发或 SDL（CI/CD 扫描与代码审计）更容易衔接过往项目经验；系统或网络运维背景转云安全、基础架构安全或安全运维（SecOps）迁移阻力更小；如果你明确偏好日志排查与攻防取证、且接受一线响应节奏，再投递安全分析或应急响应岗。",
    },
    {
      id: "faq-cert-purpose",
      question: "证书在招聘中是个人录用硬条件，还是乙方项目投标资质？",
      answer:
        "两类用途在行业中同时存在，须在面试前问清。软考中级用于符合单位制度的专业技术职务聘任或按地方当期政策核对积分条件；CISP 在乙方安全服务商与集成商中可能涉及项目投标或资质维护，入职前应核实是否属于岗位必需及公司是否提供报销；OSCP/OSCP+ 偏实操能力证明。看到“优先”字样先核用途，再决定是否投入时间与费用。",
    },
    {
      id: "faq-ai-boundary",
      requiresPlugin: "ai",
      question: "AI 工具进入安全团队后，现有研究测了什么？安全控制边界又是什么？",
      answer:
        "需逐项区分不同研究的测验对象，并将效率研究与安全控制规范分开看：arXiv:2411.03116 是真实 SOC 的观察性研究，只报告工具采用与平均解决时间（MTTR）的统计关联；arXiv:2411.01067 是 IT 管理员执行 Entra/Intune 管理任务的随机对照试验；微软安全专业人员随机试验（Edelman 等，2024）才具体比较事件摘要、脚本分析、事件报告与引导式响应四项任务（保持准确度/质量恒定时，专业组在事件摘要和事件报告上提速，在引导式响应上慢 26.3%）。安全控制方面，NSA（2026-05-20）MCP 安全设计指南与 OWASP 单独提出服务端独立授权、参数校验、最小权限与人工审批等建议；在企业落地中，具体由谁核验、审批和执行，以组织安全预案与岗位授权为准。",
    },
    {
      id: "faq-emergency-waf",
      question: "紧急事件发生时，分析师能直接改 WAF 或封禁生产账号吗？",
      answer:
        "在权限分离的团队中，一线分析师提交研判结论与处置建议，由预案指定人员审批，获授权人员执行并留痕，以防误封核心交易链路；角色兼任时，须按组织预案落实授权与复核，并同步记录研判依据、正常业务回归结果与回退条件。",
    },
    {
      id: "faq-mlps",
      question: "两个岗位在等保 2.0 项目里分别承担什么工作？",
      answer:
        "依据修正后的《中华人民共和国网络安全法》第二十三条，网络运营者依法履行网络安全等级保护义务。在企业内部协作中，分析岗可负责安全日志审计汇总、告警处置留痕与应急演练记录，工程岗可负责访问控制整改、数据库与出口最小权限加固、日志留存部署及验收举证，具体签字与验收权以单位授权为准。",
    },
  ],
  sourceGroups: [
    {
      id: "src-pay",
      title: "1. 中国大陆薪酬统计口径",
      links: [
        {
          label: "国家统计局《2025年城镇单位就业人员年平均工资情况》",
          href: "https://www.stats.gov.cn/sj/zxfb/202605/t20260515_1963707.html",
          note: "行业及规上企业岗位大类均值",
        },
        {
          label: "人社部《企业薪酬调查信息（2024年）》",
          href: "https://www.mohrss.gov.cn/SYrlzyhshbzb/laodongguanxi_/fwyd/202506/t20250627_544623.html",
          note: "职业分类参考分位，非单岗定价",
        },
      ],
    },
    {
      id: "src-law-cert",
      title: "2. 法规、考证、混合岗样本与兴趣测量边界",
      links: [
        {
          label: "网信办《中华人民共和国网络安全法》（2025 修正）",
          href: "https://www.cac.gov.cn/2025-12/29/c_1768735112911946.htm",
        },
        {
          label: "工信部软考暂行规定",
          href: "https://www.miit.gov.cn/jgsj/rjj/rcgz/art/2020/art_9697b8faa3894e4ba1b27b641970bc62.html",
        },
        {
          label: "工信部新增信息安全工程师中级资格通知",
          href: "https://www.miit.gov.cn/jgsj/rjj/rcgz/art/2020/art_3e4b908ac3424f518e923ed268124004.html",
        },
        {
          label: "全国计算机技术与软件专业技术资格（水平）考试网",
          href: "https://www.ruankao.org.cn/",
        },
        {
          label: "中国信息安全测评中心（CISP 人员注册）",
          href: "https://www.itsec.gov.cn/ryzc/",
        },
        {
          label: "OffSec CPE 与年度维护官方手册（OSCP+ 续期规则）",
          href: "https://help.offsec.com/hc/en-us/articles/35366391096596-OffSec-CPE-Program-and-Annual-Maintenance-Handbook",
        },
        {
          label: "OffSec PEN-200 课程入口",
          href: "https://www.offsec.com/courses/pen-200/",
        },
        {
          label: "ISC2 CISSP 经验要求（含兼职折算、带薪/无薪实习认定及 Associate of ISC2）",
          href: "https://www.isc2.org/certifications/cissp/cissp-experience-requirements",
        },
        {
          label: "V2EX 公开招聘贴 #1200917（2026-03-25 存在性样本）",
          href: "https://www.v2ex.com/t/1200917",
        },
        {
          label: "O*NET Interest Profiler 手册（兴趣代码方法边界）",
          href: "https://www.onetcenter.org/reports/IP_Manual.html",
        },
      ],
    },
    {
      id: "src-tech",
      title: "3. 事件响应、网络安全控制与 NGINX CVE 原证",
      links: [
        {
          label: "NIST SP 800-61r3 事件响应指南",
          href: "https://csrc.nist.gov/pubs/sp/800/61/r3/final",
        },
        {
          label: "AWS 安全组规则说明（目的 IP/CIDR、安全组、协议与端口控制）",
          href: "https://docs.aws.amazon.com/vpc/latest/userguide/security-group-rules.html",
        },
        {
          label: "NGINX 安全公告列表（CVE-2024-24989）",
          href: "https://nginx.org/en/security_advisories.html",
        },
        {
          label: "NGINX 2024-02-14 厂商原公告（24989 仅影响 1.25.3）",
          href: "https://mailman.nginx.org/pipermail/nginx-announce/2024/NW6MNW34VZ6HDIHH5YFBIJYZJN7FGNAV.html",
        },
        {
          label: "NGINX error_log 核心文档",
          href: "https://nginx.org/en/docs/ngx_core_module.html",
        },
        {
          label: "NGINX access_log 模块文档",
          href: "https://nginx.org/en/docs/http/ngx_http_log_module.html",
        },
      ],
    },
    {
      id: "src-ai",
      title: "4. AI 工作流实证研究与安全规范（仅启用 AI 选配模块时展示）",
      requiresPlugin: "ai",
      links: [
        {
          label: "Microsoft Research 真实 SOC 观察性研究（arXiv:2411.03116）",
          href: "https://arxiv.org/abs/2411.03116",
        },
        {
          label: "Microsoft IT 管理员随机试验（arXiv:2411.01067）",
          href: "https://arxiv.org/abs/2411.01067",
        },
        {
          label: "Microsoft Security Copilot RCT 白皮书（Edelman 等，2024 PDF）",
          href: "https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/final/en-us/microsoft-brand/documents/microsoft_security_copilot_economic_report_v4_accessible.pdf",
        },
        {
          label: "NSA MCP 安全设计官方发布页（2026-05-20）",
          href: "https://www.nsa.gov/Press-Room/Press-Releases-Statements/Press-Release-View/Article/4496698/nsa-releases-security-design-considerations-for-ai-driven-automation-leveraging/",
        },
        {
          label: "OWASP LLM Prompt Injection 防护指南",
          href: "https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html",
        },
        {
          label: "OWASP AI Agent 安全指南",
          href: "https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html",
        },
      ],
    },
  ],
};
