import type { ModularComparisonSpec } from "../modularComparison";

const roleA = "室内设计师";
const roleB = "景观设计师";

const sources = {
  interiorStandard: { label: "人社部《室内装饰设计师》国家职业标准（2023 年版）", href: "https://www.mohrss.gov.cn/xxgk2020/fdzdgknr/rcrs_4225/jnrc/zyyjnpj/202304/W020230414729511759530.pdf", note: "职业编码 4-08-08-07。查第 1 节职业概况、第 3 节概念、方案与深化设计的技能要求。" },
  landscapeClass: { label: "《中华人民共和国职业分类大典（2022 年版）》", href: "https://www.szns.gov.cn/nsqrzj/attachment/1/1754/1754469/13012510.pdf", note: "深圳市南山区人力资源局公告附件 5，封面标注社会公示稿。阅读 PDF 第 62–63 页的 2-02-18-03 条目，设计是这一宽口径中的一部分。" },
  interiorTender: { label: "雄安大学城疏解配套二期业主会客厅精装修设计招标公告", href: "https://ggzyfw.beijing.gov.cn/xtggxazbgg/20260624/5592277.html", note: "2026-06-24，河北雄安。第 2.2、2.4–2.6 节查面积、范围、深度与服务，第 3 节查单位及人员条件。" },
  landscapeTender: { label: "北京宋庄艺术大道片区综合治理提升设计公开招标公告", href: "https://ggzyfw.beijing.gov.cn/jyxxcggg/20260321/5468810.html", note: "2026-03-21，北京通州，交易项目编号 S110000C005105716001。采购需求二第 2.1.7–2.1.8 项及施工图设计阶段成果。" },
  landscapeLead: { label: "连云港西游灵兽动物园项目施工图设计招标公告", href: "https://jsggzy.jszwfw.gov.cn/jyxx/003001/003001001/20260316/d1004840-5b0f-464f-89c5-dee73ec2c879.html", note: "2026-03-16，江苏连云港。第 2.5–2.7、3.4–3.6 节区分设计范围、企业资质与拟派负责人。" },
  citic: { label: "中信建筑设计研究总院 2026 届春季校招岗位表", href: "https://www.career.zju.edu.cn/jyxt/sczp/zpztgl/ckZpgwXq.zf?zpxxbh=4F042E3C22D2624AE0653A68DD0E9B18", note: "用人单位简章由浙江大学就业平台发布。查景观设计、室内设计两行学历和专业。" },
  shuishi: { label: "水石设计校园招聘职位", href: "https://www.shuishi.com/contact/job/campus", note: "企业官网无发布日。查昆明栏目并列的景观设计师、室内设计师，仅用作称谓和团队去向样本。" },
  tianda: { label: "天津大学建筑设计规划研究总院人才招聘", href: "https://www.aatu.com.cn/contact/recruit/", note: "公司 2022 年春季校招档案，查提交简历与作品集要求。" },
  directory: { label: "人社部《国家职业资格目录（2021 年版）》附件", href: "https://www.gov.cn/zhengce/zhengceku/2021-12/03/5655553/files/86876724c6ee4cdcb3d0be524aee036f.pdf", note: "查专业技术人员资格清单及准入类项目，目录中有注册建筑师和建造师。" },
  designFirm: { label: "住建部《建设工程勘察设计资质管理规定》", href: "https://www.mohurd.gov.cn/gongkai/zhengce/gzk/art/2024/art_17337_763843.html", note: "第三、六条核企业取得资质后相应承揽范围及综合、行业、专业、专项的区别。" },
  hubei: { label: "湖北省住建厅风景园林工程设计专项乙级资质问答", href: "https://zjt.hubei.gov.cn/bmdt/ztzl/zcwd/202403/t20240314_5120155.shtml", note: "2024-03-14，正文答复核申请该专项乙级时园林专业人员的职称认定口径。" },
  cqTitle: { label: "重庆市工程技术风景园林专业职称申报条件", href: "https://rlsbj.cq.gov.cn/zwgk_182/zfxxgkml/zcwj_145360/jfxzgfxwj/202307/t20230714_12152952.html", note: "渝人社发〔2022〕59 号。第二、三条列专业方向、层级及适用人员。" },
  cqReview: { label: "重庆市 2026 年工程技术风景园林职称申报评审通知", href: "https://cgj.cq.gov.cn/zwxx_173/gsgg/rsgg/202608/t20260826_15983260.html", note: "第一、二节核当年初中级考试与高级申报的入口。" },
  architect: { label: "《中华人民共和国注册建筑师条例》", href: "https://xzfg.moj.gov.cn/front/law/detail?LawID=1801", note: "国家行政法规库收录 2026 年第二次修订文本。查第二条、第十一至十二条、第二十五至二十八条。" },
  architectSeal: { label: "住建部《中华人民共和国注册建筑师条例实施细则》", href: "https://www.mohurd.gov.cn/gongkai/zc/wjk/art/2023/art_17339_775497.html", note: "第二十九至三十二条区分等级范围、项目主持、主要图纸签章以及修改责任。" },
  fire: { label: "住建部《建设工程消防设计审查验收管理暂行规定》", href: "https://www.mohurd.gov.cn/gongkai/zhengce/gzk/art/2022/art_17337_763780.html", note: "住建部令第 51 号发布，第 58 号修正。查第二、八至十、十四至十六、二十六至二十八、三十三至三十六、四十四条。" },
  shRenovation: { label: "上海市既有建筑装饰装修工程建设程序若干规定", href: "https://zjw.sh.gov.cn/gfxwj/20250925/ff0c97d945a243cc9133ca6f52d6d326.html", note: "沪建规范〔2025〕12 号。第三、五、七、十条核适用范围、分类、施工图电子签章和后续验收。" },
  builder: { label: "住建部《注册建造师管理规定》", href: "https://www.mohurd.gov.cn/gongkai/zhengce/gzk/art/2024/art_17337_763849.html", note: "第五、六条和第二十至二十二条，核取证注册、聘用单位、施工管理与文件签章。" },
  builderExam: { label: "深圳市考试院 2026 年度二级建造师考试通知", href: "https://hrss.sz.gov.cn/szksy/zwgk/bmxx/content/post_12684011.html", note: "第一至二节、第四节，核广东当年报考专业、学历及施工管理经历与资格取得。" },
  builderScale: { label: "《注册建造师执业工程规模标准》装饰装修工程表", href: "https://zjw.sh.gov.cn/cmsres/2e/2e688c2404054a278a5b775fc6062754/9f683c781ca1bcbe77d81e04f87a14d4.pdf", note: "上海住建公开建市〔2007〕171 号附件，末尾装饰装修工程表核工程类别及规模分档。" },
  builderTender: { label: "江苏泰州明珠派出所营房建设工程施工招标公告", href: "https://jsggzy.jszwfw.gov.cn/jyxx/003001/003001001/20261119/d10f8eef-f0a0-454b-b746-6f26600c95ba.html", note: "2026-11-19，标段 A3212851886000055001001。第 3.1–3.3 节核施工单位资质、建筑工程专业注册建造师及项目负责人 B 证。" },
  pay: { label: "国家统计局《2025 年城镇单位就业人员年平均工资情况》", href: "https://www.stats.gov.cn/sj/zxfbhjd/202605/t20260515_1963707.html", note: "2026-05-15 发布，第三节、表 6 至表 8 及附注，核全国规上企业岗位大类及元/年口径。" },
} as const;

const architectBoundary = "对工程设计资质标准中建筑工程建设项目设计规模划分表规定的工程项目，建筑工程设计的主要文件由主持设计的注册建筑师签字、加盖执业印章。";
const landscapeBoundary = "人社部国家职业资格目录没有单列「注册景观建筑师」这一全国法定个人执业资格。";
const landscapeLeadBoundary = "在公开招标案例中，可见要求投标单位具备风景园林工程设计专项或综合资质，并要求拟派项目负责人具备风景园林相关专业高级工程师及以上职称（案例见文末出处），具体条件须逐项核目标公告。";
const builderBoundary = "注册建造师按专业、等级、执业工程规模和聘用单位范围承担相应施工管理，对适用的施工管理文件签章。";
const fireBoundary = "按住建部令第 58 号修正后的《建设工程消防设计审查验收管理暂行规定》，特殊建设工程实行消防设计审查和消防验收；其余依国家工程建设消防技术标准仍需消防设计的建设工程，走相应消防设计及竣工验收备案、抽查。";

const exercise = {
  interior: {
    locator: "精装设计公开原件",
    scope: "精装范围含门斗吊顶、照明及精装区消防装饰，排除设备房与毛坯区。",
    first: "门斗吊顶与灯具、消防末端叠图",
    second: "消防周边饰面与留空节点",
  },
  landscape: {
    locator: "室外景观公开原件",
    scope: "室外范围含室内外接合、雨水口细部与给排水、结构专业接口。",
    first: "门槛至前场铺装竖向剖面",
    second: "汇水路径及雨水口接驳示意",
  },
  mock: "模拟基线「入口 E1｜对接清单 R0｜待复核」：收到两条无版次口头消息（室内拟降门斗吊顶、室外拟抬前场铺装，无实测图或审查记录）。共同待补：门槛完成面标高、共用标高基准及各自图号版次。",
  note: "入口 E1｜对接清单 R0｜待复核",
  roles: "边界：两专业校核、建筑对齐基准、项目设计负责人确认、文控发版。",
} as const;

export const interiorLandscapeComparisonZhSpec: ModularComparisonSpec = {
  pairId: "interior-designers-vs-landscape-architects",
  locale: "zh",
  title: "室内设计师 vs 景观设计师：工作内容、证照与作品集怎么选",
  shortTitle: "室内设计师 vs 景观设计师",
  description: "在中国大陆比较室内设计师和景观设计师的图纸交付、现场配合、职称与签章边界、薪酬口径，并用两个公开项目材料纸面试做。",
  regionLabel: "中国大陆",
  authorName: "费马测试编辑部",
  datePublished: "2026-11-24",
  dateModified: "2026-11-24",
  defaultPlugins: { ai: false, thirtyDay: false },
  hero: {
    directAnswer: "拿公共建筑入口改造举例：门槛里面，室内设计师管空间怎么用、灯光吊顶与家具建材怎么落地（家装类岗位还需直接面对终端业主沟通与施工协调）；门槛外面，景观设计师管场地人流、地形高差、雨水去向与植物配置（紧密联动市政、文旅或地产项目的审批节奏）。两边共用同一门槛标高，交接时要核同一标高基准。实际分工看合同和项目接口清单。",
    roleA: { badgeTitle: roleA, riasecLabel: "霍兰德 AR", aliases: "校招称谓有室内设计、室内设计师", keywords: "平面、吊顶与照明、材料表、室内节点" },
    roleB: { badgeTitle: roleB, riasecLabel: "霍兰德 RIA", aliases: "校招称谓有景观设计、景观设计师", keywords: "场地总图、竖向与排水、铺装和种植" },
    interviewBoundaryTitle: "同一家公司同时招两岗，先问这两件事",
    interviewBoundaryQuestions: [
      "能否拿一个去标识的项目说说，新人第一张独立交的是室内平面或吊顶图，还是场地总图、竖向或种植图？交给哪个专业继续用？",
      "入口门槛标高调整时，谁维护共用标高，谁校核吊顶机电和室外排水，谁签审、谁发新版？我负责哪一步？",
    ],
    riasecBoundaryNote: "AR 和 RIA 是费马职业档案发布的霍兰德兴趣短码，用于提示你想尝试哪些活动。技能、用人条件和项目所需的资质或执业资格须各自核实。",
  },
  topology: {
    title: "从大厅走向街角，谁负责门槛两侧的图纸？",
    summary: "室内把门扇、地面收口、顶内设备和使用空间对齐。景观把门外路径、铺装完成面、排水出口和种植范围对齐。两边共用建筑确认的入口坐标和标高，再各自把做法画进本专业图纸。",
    ariaLabel: "室内设计以吊顶和门槛节点交接，景观设计以竖向和雨水接口交接",
    leftZoneTitle: "室内空间与装修",
    leftSteps: [
      { title: "核入口条件", detail: "读取建筑门位、完成面和室内净高依据。" },
      { title: "落到装修图", detail: "标明门扇、饰面、吊顶与末端接口。" },
    ],
    centerZoneTitle: "同一个门槛节点",
    upperBridge: { title: "室内侧提交", line1: "门槛、地材收口", line2: "吊顶与末端图纸版次" },
    lowerBridge: { title: "室外侧提交", line1: "铺装标高和雨水去向", line2: "路径接续及接驳版次" },
    rightZoneTitle: "景观场地与植物",
    rightSteps: [
      { title: "核室外条件", detail: "把建筑出入口叠在红线、测绘与室外管线底图上。" },
      { title: "落到场地图", detail: "交坡向、雨水口及入口周边节点。" },
    ],
  },
  matrix: {
    title: "两岗日常交付、工作环境和成长路径",
    summary: "按方案、施工图深化和现场服务查岗位，也要区分发包方设计管理。最能识别职位的是第一份独立交付、审核的人和项目现场的参与方式。",
    roleAColumn: "室内设计师",
    roleBColumn: "景观设计师",
    rows: [
      { id: "output", dimension: "平时交什么", defaultVisible: true, roleA: "交付平面布局、天花综合图（把吊顶标高、灯具、风口与消防喷淋叠在同一张图）、材料表与收口节点详图，确保施工和采购能照图落地。", roleB: "交付场地总图、竖向排水图（标清哪里抬高、哪里汇水接雨水口）、硬质铺装、软质植物配置与构造节点图；方案效果图只是前期表达环节之一，并非全部交付。" },
      { id: "tools", dimension: "工具用在哪里", defaultVisible: true, roleA: "核心用 CAD 画平立剖与节点，用 SketchUp／3ds Max／渲染器推尺度与光影；商业公装部分会用 BIM 做机电碰撞检查。警惕只教软件的速成班滤镜——真正值钱的是建材工艺、消防与收口经验。", roleB: "核心用 CAD 叠红线、测绘地形与室外管线底图，用三维模型和剖面校核高差、视线与坡向。软件只是画笔，真正壁垒在于懂竖向土方、给排水接口和植物生态习性。" },
      { id: "risk", dimension: "容易返工在哪里", defaultVisible: true, roleA: "效果图里漂亮的连续吊顶，到了深化阶段会因风口、喷淋和检修口打架而改图；选材超预算或停产时，还要把样板、防火性能与施工图版次全部重对。", roleB: "场地里随手改一处花池或台阶，就可能打破整个汇水坡向、撞上地下管网或影响苗木成活；加上多轮汇报改稿，可能出现“方案中标、落地大改”的返工。" },
      { id: "authority", dimension: "谁签审，谁执行", defaultVisible: true, roleA: architectBoundary + " 装修岗位可承担编制、配合与问题跟踪。涉及适用的消防专项、图审、施工许可和施工文件时，分别看文件类别、单位资质与责任人。", roleB: "方案汇报、种植施工图、设计变更和施工签收是不同交付。报投标团队时先看承接单位资质和拟派人员条件。实施中若碰挡墙结构、给排水或构筑物的适用签审范围，把现场问题交给对应专业负责人处理，并追踪到正式图纸版本。" },
      { id: "employer", dimension: "招聘去哪里找", defaultVisible: true, roleA: "主要去向分三路：传统家装公司（部分岗位侧重销售谈单与落地跟进）、商业／酒店／办公工装设计事务所与综合设计院、以及品牌／甲方设计管理部（公开校招样本见文末出处）。", roleB: "主要去向为综合设计院、景观设计事务所及文旅／市政配套单位。地产配套、城市更新、公园绿地与生态修复的岗位需求受项目投资周期影响，求职时宜按细分赛道核对当前在招岗位与项目来源。" },
      { id: "conditions", dimension: "工地、改图与真实劝退点", defaultVisible: false, roleA: "部分家装岗带有“销售谈单+装修管家”属性，需陪业主选材、跑工地与跟进售后；部分商业工装项目需在商场闭店后夜间进场并配合开业节点赶图。投递前务必问清有没有签单业绩考核与夜班进场频次。", roleB: "不必直面零散家庭业主，但需面对设计院出图期的连续赶文本、多轮汇报返工，以及跨城踏勘、现场选苗和较长的项目审批链条。投递前问清上一轮现场驻场天数和出图加班节奏。" },
      { id: "growth", dimension: "半年后可积累什么", defaultVisible: false, roleA: "从一个可以讲清的局部做起，例如一处店铺门厅或办公空间的平面、吊顶及收口。争取跟到选样和一轮正式校审，留下你改了哪一张图、谁校对以及图纸后来如何被使用。若长期只补效果图、接询单或没机会读正式图，想走施工图方向就要问转组条件。", roleB: "从一个入口广场或园路节点做起，把人流、铺装、植物与竖向画在同一底图。再争取跟一次测绘交底、排水接口复核和施工答疑。若半年任务集中在拼排版与渲染，且看不到标高、管线和种植图的修订，想做场地空间落地就询问项目阶段与带教。" },
      { id: "portfolio", dimension: "作品集怎么证明个人贡献", defaultVisible: false, roleA: "用一页平面说明一个使用问题，用一页吊顶或立面说明冲突，再放一个节点及修改理由。标注哪些是自己负责、哪些采用现成建筑和设备资料。遇到保密项目，可以用自建模拟图说明决策，注明资料性质。", roleB: "一页说明场地现状与问题，一页总图显示路径和功能，再选一处竖向剖面或种植节点展示取舍。可以并排放两个方案，说明为什么舍弃会阻碍人行、排水或长期养护的做法，并说明现场数据哪些已知、哪些还缺。" },
    ],
  },
  incident: {
    title: "首层入口一起返改，谁帮谁把图纸改得能复核？",
    summary: "编辑模拟。文化服务中心把门厅翻新与入口广场更新放进同一交付节点。室内组收到新灯具布置，景观组收到铺装调整意见，建筑组掌握门位及共用标高。旧版入口图还在双方的对接文件中。",
    triggerLabel: "门斗吊顶下调，门外铺装抬高",
    triggerBody: "室内拟为新吊顶做收边，门扇开启、灯具和喷淋末端还没叠图。景观侧拟改变门外完成面，旧竖向里雨水口位置和坡向仍按原方案。项目群里只有示意截图，未带图纸版次。",
    triggerCaveat: "这次先让变更清单可查，模拟分工用来说明谁整理、谁校核、谁确认发图。图审、消防申报、签章和施工依实际法定程序办理。",
    rows: [
      { stage: "室内对接", roleLabel: roleA, tone: "roleA", verifiedFacts: "可从旧图定位门斗、吊顶和灯具，建筑版图能定位门槛节点。群内方案欠缺正式尺寸与版号。", openGaps: "缺当前门槛完成面和顶内净空依据，缺机电末端及消防设施图纸的现行版，不能凭渲染图判断净空与设备条件。", actionAndApproval: "室内设计师列门斗平面、吊顶叠图、门槛收口和待复核项，送室内设计负责人校核。将消防设施与相关变更标给机电消防专业负责人复核。由建筑专业负责人核对共用标高，项目设计负责人按模拟约定确认能否进入内部校审。" },
      { stage: "室外对接", roleLabel: roleB, tone: "roleB", verifiedFacts: "旧图可找到门外铺装范围和雨水口参照，景观建议会影响入口室内外交接。", openGaps: "缺与室内相同标高基准下的场地高点、低点及排水接驳底图；室外路径的连续性和雨水去向待专业核对。", actionAndApproval: "景观设计师交入口竖向剖面和排水接口清单，把雨水接驳交给给排水专业复核，把涉及结构的节点交结构专业。景观负责人校核本专业图，与建筑负责人共同复核界面，按项目设计负责人的确认由文控发行。" },
    ],
    recoveryAcceptanceTitle: "怎样认定两边可以重交校审",
    recoveryAcceptanceCriteria: "在同一标高基准上，两边使用同一门槛完成面，能在入口剖面标出室内到室外的高程连续关系。室内图能定位门扇、吊顶及需复核的设备末端，室外图能从铺装坡向追到低点、雨水口和接驳依据。相关专业留下有版号的核对记录，仍开放的问题逐项列责任人和下一份证据。项目设计负责人确认后，由获授权文控发出同批次新版。",
    defenseLayerNote: "特殊建设工程确需修改经审查合格的消防设计文件，住建部规定由建设单位重新申请消防设计审查。涉及已由注册建筑师签章的适用设计文件，修改还需依条例及其实施细则核原注册建筑师或符合条件的书面委托。内部交接单和工地口头同意各有自己的作用，法定状态由相应文书确认。",
  },
  payAndCerts: {
    title: "薪酬按实际 Offer 比，证照按文件和岗位查",
    summary: "室内设计师与景观设计师都可从方案或深化岗位累积专业成果。职业技能标准、工程职称、企业资质、个人注册和实际项目授权分别回答不同问题。",
    salaryHeading: "薪酬怎么算、定级核查什么，以及 Offer 对比口径",
    salaryBody: "国家统计局 2025 年“专业技术人员”均值无法拆出两岗全国排序，但不同业态的薪酬结构与核查维度区分清晰（具体固浮比以书面 Offer 为准）：室内设计按业态分化——家装侧先问底薪、签单与主材提成分别怎么计，再核清客源分配和提成是否在签约、收款或售后结束时结算；投商业工装或景观设计院，也可问固定月薪之外是否有出图产值或项目奖金、是否与回款挂钩，并核对主创方案职责、风景园林高级职称及大型项目负责资历是否纳入定级与奖金评定。拿 Offer 对比时，家装务必问清离职后未结提成怎么算，工装和景观务必问清产值奖按出图还是按甲方回款发放，以及夜间进场／跨城差旅补贴口径。",
    certs: [
      { name: "风景园林专业职称、设计单位资质与招标负责人条件", officialScope: landscapeBoundary + " 重庆以工程技术风景园林方向评价专业人员，分园林工程与风景园林规划设计，2026 年当地初、中级以考试取得，高级按相应申报条件办理。", workplaceBoundary: landscapeLeadBoundary + " 湖北住建厅答复也将园林专业中级职称人员作为申请专项乙级资质时的配员条件。一般景观方案或助理岗，应先核招聘样本要求与实际图纸职责。", verificationTips: "如果未来想作为项目负责人，拿目标公告和自己的职称专业、等级、业绩与在职证明逐行核。向人事问目标地当年申报条件、人员是否拟配到企业资质、哪些交付或任职能积累业绩。", officialLinks: [sources.directory, sources.cqTitle, sources.cqReview, sources.designFirm, sources.hubei, sources.landscapeLead] },
      { name: "注册建筑师与适用建筑设计文件签章", officialScope: "注册建筑师的报考、取得资格、注册与受聘执业各有条件。一级、二级的工程规模以及聘用单位的业务范围影响本人可做的设计。", workplaceBoundary: architectBoundary + " 上海现行地方规定中，符合范围且涉及结构局部变动或加固、消防设计变动、外立面变动的既有非居住装修，要求设计单位及作为注册执业人员的设计负责人对施工图设计文件电子签章。项目是否落入该类程序要看当地规定与事实，技能等级证书可说明技能评价，签章仍查执业依据。", verificationTips: "报考前带专业、学历与设计工作经历核条例和当地当年公告。应聘时请主管区分作品集审查、单位内部校审、适用注册签章和向主管部门提交的动作，并说明你的岗位负责哪一步。", officialLinks: [sources.architect, sources.architectSeal, sources.shRenovation, sources.interiorStandard, sources.fire] },
      { name: "二级建造师（建筑工程）与装饰装修施工管理", officialScope: "二级建造师报考核当地学历、专业和施工管理经历。以深圳 2026 年通知为例，建筑工程是六个报考专业之一，考三科路径要求工程类或工程经济类中专以上学历及满两年建设工程项目施工管理经历。装饰装修列在执业工程规模标准中，用于核实际工程类别与规模。取得资格后注册，方可以注册建造师名义执业。", workplaceBoundary: builderBoundary + " 江苏一份公共建筑装修施工公告要求拟派负责人具备建筑工程专业二级及以上注册建造师资格及有效 B 证，同时另列施工企业资质和安全生产许可证。普通室内设计求职以岗位设计交付为先，计划转施工项目管理才按实际项目核此证和任职要求。", verificationTips: "问自身经历能否计入当地施工管理报考要求，注册单位和项目专业是否匹配。拿公告、项目规模和拟签文件核施工负责人要求、B 证及正式任命，另查设计端负责人的签章条件。", officialLinks: [sources.builder, sources.builderExam, sources.builderScale, sources.builderTender] },
    ],
    interviewChecklistTitle: "面试时请用一份项目举例",
    interviewChecklistQuestions: [
      { label: "钱怎样发", question: "固定部分全年发多少个月？绩效按签单、回款、方案通过还是出图节点算？外勤与驻场补贴独立列吗？" },
      { label: "岗位做哪一段", question: "我主要交概念方案、深化图、专业协调记录还是施工管理文件？最近团队拒收哪一种交付，后来补了什么？" },
      { label: "责任怎样写", question: "哪些图需要校审或注册人员签章？公司在哪类项目把职称、资质及业绩放进拟派负责人条件？" },
    ],
  },
  checklist: {
    title: "分别选愿意练的技能和能接受的工作条件",
    summary: "技能栏用来决定第一份试做，条件栏用来挑雇主和项目。两栏分别记录。即使两栏指向不同岗位，也可以继续找交付符合兴趣、条件适合当下安排的团队。",
    skillsHeading: "我愿意反复练的工作",
    skillsOptions: [
      { id: "interior-clearance", track: "roleA", label: "把室内净空和灯具位置画清楚", summary: "用平面和剖面对照门扇、吊顶、灯具位置，给待复核点编号。", interviewQuestions: ["第一次交吊顶图时，谁给我暖通和消防底图，谁核净高和对缝？"] },
      { id: "interior-finish", track: "roleA", label: "让选样、材料表与节点图对得上", summary: "遇到预算改变，能把一处材料的规格、收口、业务要求以及替代条件说清。", interviewQuestions: ["谁核饰面的技术性能和样板，批准变更后谁更新清单与图纸？"] },
      { id: "landscape-grading", track: "roleB", label: "从现状标高追到雨水口", summary: "用剖面解释室内外标高和场地坡向，记录排水接口待核资料。", interviewQuestions: ["新人要画竖向图吗？测绘资料和雨水接驳多专业谁来协调？"] },
      { id: "landscape-planting", track: "roleB", label: "把种植意图变成可核的植物配置", summary: "愿意按生长条件、通行、养护和供应约束改植物表和节点。", interviewQuestions: ["发生苗木替换时，谁检查种植位置、规格和养护条件，谁定新版？"] },
    ],
    conditionsHeading: "我可以接受、也想问清的安排",
    conditionsOptions: [
      { id: "interior-samples", track: "roleA", label: "接受选样和交付节点的集中改图", summary: "想清能否应付样板确认、材料到货和开业或交房前的协调。", interviewQuestions: ["最近一个交付月改过哪几轮样板，签认和加班如何安排？"] },
      { id: "interior-sales", track: "roleA", label: "确认客户沟通是否带签单指标", summary: "区分室内专业设计、家装顾问和项目协调的时间分配与收入。", interviewQuestions: ["入职前三个月由谁找客户？签单与深化各怎样考核，哪项时间投入最大？"] },
      { id: "landscape-field", track: "roleB", label: "接受项目节点需要到室外或跨城", summary: "核踏勘、施工答疑、选苗与驻场的实际安排，再对照自己的出行条件。", interviewQuestions: ["以最近一项为例，驻场几天，设计与施工驻场是否分别安排？"] },
      { id: "landscape-lifecycle", track: "roleB", label: "能接受多条件变化带来的返改", summary: "核给排水、测绘、地下设施和苗木安排变化后谁负责更新，谁记录遗留项。", interviewQuestions: ["近期哪次排水或苗木变化退回过施工图？重交前怎么确认底图已对齐？"] },
    ],
    defaultInterviewQuestions: ["请用一个已经结束的入口项目，说说新人交什么、谁退回过、当时补了哪张图或哪条现场资料。"],
    crossTrackNote: "喜欢画室内节点，同时希望做公共空间，可以找室内展陈或公共建筑装修团队。喜欢研究竖向和植物，但要减少跨城出差，就先筛项目半径和现场分工。两栏的选择各回答一个问题。",
    offlinePrintHint: "纸上分别记一个愿意复做的任务、一个必须核实的工作条件与一个要问的人。带到面试后补上对方给的真实例子。",
  },
  desktopExercise: {
    sectionTitle: "5 分钟试做：入口改图交接单",
    summary: "凭卡任选一轨。两轨都要抄基线，分清原件与未批口头变更，补室内外待核、标高基准与图号版次，列 4 方发版边界。",
    publicLinksHeading: "原件",
    publicLinks: [
      { label: "雄安精装招标", href: sources.interiorTender.href, note: "2.2、2.4–2.6 节。" },
      { label: "宋庄景观招标", href: sources.landscapeTender.href, note: "需求 2.1.7–2.1.8。" },
    ],
    factSummaryHeading: "离线卡",
    factSummarySegments: [
      { text: "室内：", tone: "strong" },
      { text: `${exercise.interior.scope} ` },
      { text: "景观：", tone: "strong" },
      { text: `${exercise.landscape.scope} ` },
      { text: `${exercise.mock}${exercise.roles}` },
    ],
    taskA: {
      title: "室内轨：吊顶与收口",
      instruction: `列 2 图（${exercise.interior.first}与${exercise.interior.second}）、排除设备房与毛坯区、索机电消防末端图，并完成共同项。`,
    },
    taskB: {
      title: "景观轨：竖向与雨水口",
      instruction: `列 2 图（${exercise.landscape.first}与${exercise.landscape.second}），标雨水口接驳待核与给排水接口，并完成共同项。`,
    },
    rubricTitle: "4 项自检",
    rubricPassRule: "命中 2 共用 + 本轨 1 项过关。",
    rubricItems: [
      `室内轨｜列${exercise.interior.first}与${exercise.interior.second}，标排除设备房与毛坯区，索机电消防末端图。`,
      `景观轨｜列${exercise.landscape.first}与${exercise.landscape.second}，标雨水口接驳待核与给排水接口。`,
      `共同 1｜抄准「${exercise.note}」，分原件与无版次口头，列门槛标高、共用基准及各自图号版次。`,
      "共同 2｜并列室内外待核，口头不作批准图；写两专业校核、建筑对齐基准、项目设计负责人确认与文控发版。",
    ],
    sampleAnswerALabel: "室内样答",
    sampleAnswerA: `${exercise.note}（据${exercise.interior.locator}，改图模拟）。含吊顶、照明与精装消防装饰，排除设备房与毛坯区。交${exercise.interior.first}与${exercise.interior.second}，索机电消防末端图；向建筑索门槛标高、共用基准及图号版次。待核：室内缺末端图、室外缺排水底图。口头无版次不作批准图，维持待复核；两专业校核、建筑对齐基准、项目设计负责人确认后文控发版。`,
    sampleAnswerBLabel: "景观样答",
    sampleAnswerB: `${exercise.note}（据${exercise.landscape.locator}，改图模拟）。含室内外交接、雨水口及给排水接口。交${exercise.landscape.first}与${exercise.landscape.second}，标雨水口接驳待核并索给排水底图；向建筑索门槛标高、共用基准及图号版次。待核：室内缺末端图、室外缺排水底图。口头无版次不作批准图，维持待复核；两专业校核、建筑对齐基准、项目设计负责人确认后文控发版。`,
  },
  tools: {
    title: "按眼下要做的事选一个入口",
    summary: "手头有招聘说明时先并排核对岗位，做过试做就记录行动；还在摸索兴趣或核对加班／工地耐受度，分别有对应入口。",
    cards: [
      { id: "compare-careers", badge: "比较职业", meta: "简中", tone: "neutral", title: "把两个职业并排比较", description: "在两槽手动选室内设计师和景观建筑师，再对照手头岗位说明中的项目类型、首份交付和责任人。", purposeHint: "适合已有两个职业候选的人。", ctaLabel: "打开双槽对比", href: "/zh/career/compare" },
      { id: "exploration-worksheet", badge: "记录行动", meta: "简中", tone: "roleA", title: "把试做结论和下一次访谈写下来", description: "记录自己愿意重画的一张图、要核的现场条件、要问谁。按需复制或导出留存。", purposeHint: "适合已经试做或看完招聘说明的人。", ctaLabel: "打开我的工作表", href: "/zh/career/interest-worksheet#my-worksheet" },
      { id: "holland-interest", badge: "探索兴趣", meta: "60 题", tone: "roleB", title: "霍兰德职业兴趣测试", description: "查看你的兴趣六维与三字代码，辅助判断自己偏爱微观艺术美感、宏观规划逻辑还是动手实操（兴趣不等于胜任力或资质）。", purposeHint: "适合仍在设计、建筑与相邻艺术／工程方向间探索兴趣的人。", ctaLabel: "测职业兴趣", href: "/zh/tests/holland-career-interest-test-riasec" },
      { id: "career-assessment", badge: "核工作条件", meta: "94 题", tone: "accent", title: "梳理对工作活动与环境的偏好", description: "用职业测试核清自己对直面散户业主、工地巡场、熬夜出图与跨城踏勘的接受度。", purposeHint: "适合喜欢设计但担心熬夜改图或销售压力的人。", ctaLabel: "打开职业测试", href: "/zh/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "继续读单岗职业档案",
    profileLinks: [
      { label: "室内设计师职业档案", href: "/zh/career/jobs/interior-designers" },
      { label: "景观建筑师职业档案", href: "/zh/career/jobs/landscape-architects" },
    ],
  },
  faqs: [
    { id: "role-difference", question: "室内设计师与景观设计师最根本的区别是什么？", answer: "想反复推敲房间用途、灯光、材料和吊顶节点，优先看室内；想反复推敲场地高差、路径、植物和雨水出口，优先看景观。两岗都能参与公共空间，也都可能遇到工地问题。拿公共建筑入口为例，门斗吊顶和机电末端对照更接近室内交付，门外铺装接标高与坡向、雨水口交接更接近景观交付。问清岗位第一张独立交付图，便能识别偏效果表现、方案设计还是工程深化。" },
    { id: "major-change", question: "环境设计专业或从室内转景观，该先做哪种作品集？", answer: "投室内方案岗就先交一份能讲清动线、材料和空间尺寸的局部方案；投景观岗则先交总图、竖向剖面和一个铺装或种植节点。跨岗时可沿用制图、三维表达和汇报经验，再补上目标岗的底图、专业接口和典型返改。中信设计 2026 届校招的两行学历层级不同，天大设计总院的历史校招对两类岗位均列作品集要求。投递前逐条核目标公告专业、学历和作品范围。" },
    { id: "landscape-license", question: "大陆做景观设计一定要有注册景观建筑师证吗？", answer: "投景观方案、深化或助理岗位时按招聘要求准备；想担任某个招标项目的负责人时，按公告核职称、业绩和在职条件。" + landscapeBoundary + " 费马单岗档案沿用「景观建筑师」这个职业译名，这里的大陆求职称谓采用招聘中可核的「景观设计师」。" + landscapeLeadBoundary },
    { id: "interior-sign", question: "室内设计师可以在施工图上签字盖章吗？", answer: "作为编制人员可以按单位分工留本人记录；若是须注册人员签章的建筑设计文件，由符合条件的执业者承担。" + architectBoundary + " 例如上海对本市规定范围内特定类别的既有非居住装修，要求设计单位与作为注册执业人员的设计负责人电子签章。入职前问清文件名称、单位资质、校审链和具备执业范围的签章人。" },
    { id: "fire-review", question: "家庭装修、商场装修都要做同一种消防审验吗？", answer: "不是。普通住宅室内装饰装修活动属于住建部消防审验规定的除外情形；商场、会所等非居住项目须按使用功能、工程范围和当地实施细则核对项目分类。" + fireBoundary + " 特殊建设工程由建设单位向消防设计审查验收主管部门申请，设计单位按职责编制文件；确需修改已审合格的消防设计文件时，须由建设单位重新申请审查，不能用项目群内部意见代替（具体条款见文末出处）。" },
    { id: "builder-certificate", question: "我想做室内设计，要先考建筑工程二建吗？", answer: "目标是室内方案和深化时先拿可读的图纸与作品去应聘；想转装修施工项目负责人时再按目标项目核建筑工程专业二建、注册和适用的 B 证等要求。" + builderBoundary + " 报名时若遇「装饰专业」的简称，核当地考试指引和真实注册专业。以深圳 2026 年通知为例，建筑工程在六专业中，装饰装修对应的是工程规模表里的工程类别。" },
    { id: "salary", question: "两岗哪个工资高，哪边加班和跑现场更多？", answer: "公开统计缺少两岗同口径收入排序，比较待遇与工作负荷时宜按细分业态、结算方式与项目周期逐项核实（具体固浮比以书面 Offer 为准）：面试家装时，问清底薪之外是否有签单或主材提成，谁分配客源、谁跟工地和售后；面试工装或景观设计院时，问固定月薪之外有无阶段产值奖，出图或回款是否影响结算，也要问清赶交付节点是否加班、是否跨城踏勘或选苗。投递时留意避开纯画图、无产值透明度的团队，也别轻信“速成软件高薪就业”宣传；谈 Offer 时务必核清固定薪月、提成／产值按出图还是按回款结算，以及夜间进场和差旅补贴。" },
    { id: "ai-rendering-boundary", question: "2026 年 AI 生成效果图这么快，室内和景观设计师会被替代吗？", answer: "目前缺少两岗可比的岗位替代实证，无法给出替代比例，但从作业边界看，工具辅助与人类担责的分工非常清晰：AI 出图与快速渲染可辅助前期概念氛围推演和多方案比选；而室内侧的机电消防叠图、现场量房改拆、预算控价与业主沟通落地，以及景观侧的场地竖向排水、地下管线避让、苗木生态适配与多专业施工图会审，仍需要设计师核尺寸、协同多专业并按授权担责。入行或转行时，可将重心放在深化落地与跨专业协调能力上。" },
  ],
  sourceGroups: [
    { id: "role-evidence", title: "职业任务、项目交付与招聘原件", links: [sources.interiorStandard, sources.landscapeClass, sources.interiorTender, sources.landscapeTender, sources.citic, sources.shuishi, sources.tianda] },
    { id: "design-authorization", title: "设计单位资质、风景园林职称和建筑设计签章", links: [sources.directory, sources.designFirm, sources.hubei, sources.cqTitle, sources.cqReview, sources.landscapeLead, sources.architect, sources.architectSeal] },
    { id: "project-process", title: "消防审验、既有装修与施工管理", links: [sources.fire, sources.shRenovation, sources.builder, sources.builderExam, sources.builderScale, sources.builderTender] },
    { id: "pay", title: "国家统计局工作收入统计", links: [sources.pay] },
  ],
};
