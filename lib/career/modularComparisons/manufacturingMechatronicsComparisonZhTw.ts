import type { ModularComparisonSpec } from "../modularComparison";

const roleA = "製造工程師";
const roleB = "機電整合工程師";

const sources = {
  occupations: { label: "衛福部｜臺灣職業標準分類值集", href: "https://twcore.mohw.gov.tw/ig/twcore/ValueSet-occupation-mol-tw.html", note: "職業細類 2141、2144。分類按實際工作內容。" },
  payReport: { label: "勞動部｜114 年職類別薪資調查定義", href: "https://www.mol.gov.tw/1607/1632/1633/90814/?cprint=pt", note: "調查概況說明全時受僱、月薪與前一年全年所得口徑。另可直接下載下列兩張原表。" },
  payAll: { label: "勞動部｜表 3 全時受僱員工人數、薪資", href: "https://statdb.mol.gov.tw/html/s3/svy14/1435003.ods", note: "查品管、工管及生管工程師與機械工程師等合併列。" },
  payManufacturing: { label: "勞動部｜表 5 製造業全時受僱員工人數、薪資", href: "https://statdb.mol.gov.tw/html/s3/svy14/1435005.ods", note: "查金屬製品、電子零組件、電腦電子光學、機械設備各業別的經常性薪資欄。" },
  tsmc: { label: "臺灣美光｜製程整合工程師招募說明", href: "https://www.osa.nchu.edu.tw/osa/cdc/sys/modules/eguide/event.php?eid=2996&op=print", note: "中興大學轉載雇主徵才說明。製程整合職的製程、設備及材料評估是歷史個案。" },
  processCompetency: { label: "陽明交通大學｜半導體產業職務調查", href: "https://base.stem.lasercenter.nycu.edu.tw/file/base_report.pdf", note: "半導體人才計畫產業調查，製程／製程整合職與良率改善的工作樣本。" },
  foxconn: { label: "鴻海｜製程／工工與自動化工程徵才", href: "https://recruit.foxconn.com/isite-web/mbJobRelMgr.searchJob.do", note: "2026 新幹班臺灣職務 PP26030100015、PP26030100016；新產品試製協作見 PP26030100017。" },
  compal: { label: "仁寶｜新鮮人品質製造職缺類別", href: "https://www.compal.com/careers/students/freshman/", note: "查 SMT／PE／Repair 與品管工程師所列科系。" },
  hiwinJob: { label: "上銀科技｜機電整合開發工程師徵才", href: "https://www.hiwin.tw/recruitment/RD_job_list.aspx", note: "研發職務列表，查看臺中機電整合開發、機構設計與電控系統職。" },
  hiwinBenefits: { label: "上銀科技｜福利制度", href: "https://www.hiwin.tw/recruitment/benefit.aspx", note: "薪酬／獎金分列營運分紅、員工分紅及年終獎金。" },
  ucan: { label: "教育部 UCAN｜生產管理與自動化整合職能", href: "https://ucan.moe.edu.tw/search/search_1_4.aspx?f1=MNC&f2=62", note: "查製造流程改善和自動化整合的工作描述。" },
  integrationCompetency: { label: "勞動力發展署｜精密機械與機電整合工作", href: "https://course.taiwanjobs.gov.tw/about/introduction", note: "看精密機械產業的機器人機電整合職務與技能，再對照紙面驗證材料。" },
  skills: { label: "技能檢定中心｜115 年技術士技能檢定手冊", href: "https://ws.wda.gov.tw/Download.ashx?n=MTE15bm05oqA6KGT5aOr5oqA6IO95qqi5a6a54K65rCR5pyN5YuZ5omL5YaKLnBkZg%3D%3D&u=LzAwMS9VcGxvYWQvMzMxL3JlbGZpbGUvMTA2NTYvNDQ4MS8wMTg3NWFjNi00MjllLTQzOGUtYjQwMS04ZWM4MmRmNmZiNGQucGRm", note: "查職類 17000、18500。若暫無法下載，可先按職類名稱與乙、丙級查當期簡章。" },
  smartProduction: { label: "經濟部 iPAS｜智慧生產工程師", href: "https://ipd.nat.gov.tw/ipas/certification/SPE/exam-info", note: "查初、中級考試及生產與作業管理、智慧產線科目。" },
  vehicleIntegration: { label: "經濟部 iPAS｜電動車機電整合工程師", href: "https://ipd.nat.gov.tw/ipas/certification/EVM/exam-info", note: "查初、中級與電能、動力控制、整合實務科目。" },
  cqe: { label: "中華民國品質學會高雄市分會｜品質工程師 CQE", href: "https://www.csqkh.org.tw/tw/about/66", note: "查年資、課程與先取得鑑定合格證明的條件。" },
  engineeringExam: { label: "考選部｜專技高考技師考試規則", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=R0040049", note: "全國法規資料庫 R0040049。考試院考臺考一字第 11506000691 號修正令，查機械、電機、工業工程科別及資格附表。" },
  engineerAct: { label: "全國法規資料庫｜技師法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0030022", note: "法規識別 J0030022。查第 3、7–9、13、16 條的證書、執照、業務及簽證。" },
  occupationalSafety: { label: "全國法規資料庫｜職業安全衛生法", href: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?flno=6&pcode=N0060001", note: "第 6 條，雇主對機械、電等危害及輪班負荷的安全衛生義務。" },
  cylinder: { label: "台灣氣立｜氣缸理論推力參考", href: "https://www.chelic.com/Edu/html/appendix04.html", note: "壓力與受壓面積的關係，題目以合成 SI 單位計算。" },
  torque: { label: "教育部｜靜態力矩與力臂", href: "https://dict.revised.moe.edu.tw/dictView.jsp?ID=62225&la=0&powerMode=0", note: "參考力與力臂關係，題目只作靜態簡化算例。" },
  eightD: { label: "生產力中心｜品質問題分析", href: "https://edu.cpc.org.tw/class/content/162", note: "看問題描述、驗證假設與防錯對策。" },
  smt: { label: "台達｜表面黏著產線圖", href: "https://www.deltaww.com/zh-TW/service-support/application-center/2199", note: "看製程與檢測是不同站別。" },
  plc: { label: "台達｜可程式控制器與開發軟體", href: "https://www.deltaww.com/zh-TW/products/PLC-Programmable-Logic-Controllers", note: "查 AS 系列與 DIADesigner 階梯圖支援範圍。" },
  ethercat: { label: "台達｜EtherCAT 工業通訊產品", href: "https://www.deltaww.com/zh-TW/products/EtherCAT", note: "查多站同步控制用途。" },
  automation2026: { label: "台達｜COMPUTEX 2026 虛實整合與 AOI 展示", href: "https://www.deltaww.com/zh-TW/press/40335", note: "2026 年 6 月，查 DIATwin 協同模擬及 AI 生成缺陷影像的用途。" },
  lean: { label: "勞動力發展署中彰投分署｜精實管理與價值溪流", href: "https://tcnr.wda.gov.tw/News_Content.aspx?n=D8B1E124290C6F3E&s=B57793F06CC65767&sms=EAD443F4DC057FFB", note: "看以需求定義價值、用價值溪流圖找流程浪費。" },
  compalFlow: { label: "仁寶 113 年年報｜筆電製造流程圖", href: "https://www.compal.com/mediafiles/sh-meeting/annual-report/113%E4%BB%81%E5%AF%B6%E5%B9%B4%E5%A0%B1-1140509.pdf", note: "主要產品之產製過程，頁 139 的機板加工與本體組合。" },
  virtualMachine: { label: "台達｜虛擬機台開發平台", href: "https://www.deltaww.com/zh-TW/solutions/virtual-machine-development-platform", note: "查虛擬驗證、動作流程與產能假設。" },
} as const;

const pay = {
  period: "114 年 7 月",
  general: "60,621／63,098",
  electronics: "69,528／71,378",
  metal: "48,611／52,358",
  machinery: "51,413／53,140",
  computerOptical: "59,672／57,853",
} as const;

const trial = {
  lot: "A07",
  total: 40,
  flagged: 8,
  unflagged: 32,
  review: "人工複判未附，便條待複核",
  validation: "B",
  interface: "A",
} as const;

const firstFlagged = `${trial.lot}-01`;
const lastFlagged = `${trial.lot}-${String(trial.flagged).padStart(2, "0")}`;
const flaggedRange = `${firstFlagged} 至 ${lastFlagged}`;

const worksheet = { pressureMPa: 0.2, areaMm2: 150, loadN: 6, armM: 0.04 };
const worksheetPush = worksheet.pressureMPa * worksheet.areaMm2;
const worksheetTorque = worksheet.loadN * worksheet.armM;

const counts = `${trial.lot} 共 ${trial.total} 片，${trial.flagged} 片待複判`;
const versions = `驗證摘要 ${trial.validation} 版，介面清單 ${trial.interface} 版`;

export const manufacturingMechatronicsComparisonZhTwSpec: ModularComparisonSpec = {
  pairId: "manufacturing-engineers-vs-mechatronics-engineers",
  locale: "zh-TW",
  title: "製造工程師 vs 機電整合工程師：臺灣工作、薪資與證照比較",
  shortTitle: "製造工程師 vs 機電整合工程師",
  description: "在晶圓廠、電子代工或工具機廠，製造工程師與機電整合工程師差在哪？比較製程良率、設備電控、臺灣職群薪資、技術士與 iPAS，再用五分鐘試做選方向。",
  regionLabel: "臺灣",
  authorName: "費馬測試編輯部",
  datePublished: "2026-11-27",
  dateModified: "2026-11-27",
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: "一批電路板到了檢測站，幾片被標出來。製造工程師追這批板子在哪一站出現差異，機電整合工程師追設備有沒有把正確的狀態交給下一站。製造工程師交付的是可重複的製程，機電整合工程師交付的是可驗證的設備功能。想用數據找瓶頸、讓換班後的品質維持一致，先看製造或生產技術。喜歡把機構、感測器和控制器配成一套，先找機電整合或自動化電控。",
    roleA: { badgeTitle: roleA, riasecLabel: "霍蘭德 RIC", aliases: "相鄰職缺：生產技術、製程工程師、工業工程師、智慧製造工程師", keywords: "試產與量產導入、良率、產線平衡、異常改善" },
    roleB: { badgeTitle: roleB, riasecLabel: "霍蘭德 RIC", aliases: "相鄰職缺：機電整合開發、自動控制工程師、自動化整合工程師", keywords: "電氣迴路、PLC、伺服馬達、設備介面驗證" },
    interviewBoundaryTitle: "確認這份職缺最後要交什麼",
    interviewBoundaryQuestions: [
      "製造職：新人負責的試產或良率改善，有沒有機會定義比較基準、修訂作業指導書並追蹤量產結果？",
      "機電職：新人負責哪個模組的介面或驗證？設備規格、程式版次與缺失清單怎麼交給複核的人？",
    ],
    riasecBoundaryNote: "兩個徽章都取自本站職業興趣向量前三碼。興趣可以提示你想長期投入哪些活動，能力、聘用條件與作業授權各有不同依據。",
  },
  topology: {
    title: "從量產要求到設備交接",
    summary: "製造端把品質與節拍要求說清楚，機電端回交功能驗證與量測缺口，再由各自的負責人複核。",
    ariaLabel: "製造流程改善與設備機電整合的雙向交接流程",
    leftZoneTitle: roleA,
    leftSteps: [{ title: "抓基準", detail: "批次、良率、節拍" }, { title: "規劃改善", detail: "工序與量測紀錄" }, { title: "複核試產", detail: "修訂量產文件" }],
    centerZoneTitle: "雙向交接",
    upperBridge: { title: "製程需求", line1: "品質要求", line2: "可接受條件" },
    lowerBridge: { title: "設備回報", line1: "介面版次", line2: "驗證缺件" },
    rightZoneTitle: roleB,
    rightSteps: [{ title: "拆功能", detail: "機構、電控、感測" }, { title: "核介面", detail: "規格與版次" }, { title: "交驗證", detail: "證據、異常、待辦" }],
  },
  matrix: {
    title: "八個工作差異，從第一份交付物看起",
    summary: "主計總處有 2141「工業及生產工程師」與 2144「機械工程師」兩個參考細類。看職缺時以負責的產品、流程或設備為準，同一頭銜可能落在不同分工。",
    roleAColumn: roleA,
    roleBColumn: roleB,
    expandButtonLabel: "展開工具、入行與工作條件",
    collapseButtonLabel: "收合工具、入行與工作條件",
    rows: [
      {
        id: "deliverable", dimension: "每天交什麼", defaultVisible: true,
        roleA: "交試產紀錄、良率分層與製程變更證據。做精實生產時，先把各站工時、停等、重工和在製品拆開，再找瓶頸。改善若有效，要能把證據帶回作業指導書或品管交接。",
        roleB: "交機構與電氣介面規格、控制功能說明、版次清單和驗證紀錄。專案進到交機時，還要把未解異常、各模組的負責人和下一階段的驗證依據交出去。",
      },
      {
        id: "wafer", dimension: "晶圓廠與半導體設備", defaultVisible: true,
        roleA: "製程工程師看模組的穩定性與異常，製程整合要協調各模組，良率分析則追缺陷與量測。製造部門也有派工與產能職，選缺時先分清主要工作是技術改善、跨模組協調，還是生產管理。",
        roleB: "晶圓廠內的設備端可能消化機台異常與驗證改機；設備供應商的機電端則將傳送、定位或訊號等功能整進機台。看工作是否含介面設計和功能測試，或以維護與工單交接為主。",
      },
      {
        id: "electronics", dimension: "電子代工 EMS 與 SMT", defaultVisible: true,
        roleA: "把新產品導入（NPI）的試產結果變成可維持的量產流程。比較表面黏著（SMT）各站的節拍、直通率與重工，區分異常來自哪個站別、哪組產品，以及哪些數字要補量測。",
        roleB: "把不同廠牌的設備、感測器與上層系統接成能驗證的流程。製程端要查某批板子時，設備端交回設備識別、事件來源與版本，讓資料能對回批次。",
      },
      {
        id: "machine-tools", dimension: "金屬加工與工具機設備", defaultVisible: true,
        roleA: "同樣加工一批零件，工作可落在工序安排、治具適用性、尺寸檢驗與交期改善。要比較兩個班別的成果，得先知道用的是哪一版要求及哪一批材料。",
        roleB: "設備商的職缺可能碰自動化機構、感測器電路、氣油壓、伺服馬達調校及控制通訊。研發、整合與售服都會碰設備，分別看負責的是設計交付、功能驗證，還是到客戶端支援。",
      },
      {
        id: "approval", dimension: "成果由誰複核", defaultVisible: true,
        roleA: "製程與品保各自追溯試產、檢驗和變更。提出異常原因、驗證改善、確認批次品質是不同動作。面談時可以請對方說明品保與製造在放行流程中的分工。",
        roleB: "介面規格需要核對機構、電控與測試版本。設備功能驗收、產線接收和現場安全各有負責人，先看職缺的交件責任，再確認範圍內的複核與授權。",
      },
      {
        id: "tools", dimension: "工具與資料", defaultVisible: false,
        roleA: "用統計製程管制（SPC）看製程變動，用 8D 問題分析區分症狀、待驗假設和對策。OEE 是整體設備效能，稼動率只是其中一項，良率也要保留自己的分母。",
        roleB: "PLC 階梯圖用於表達控制邏輯，EtherCAT 是工業通訊選項之一。閱讀專案時把訊號名稱、機構模組、電氣圖與驗證紀錄串起來，才能說明同一功能在哪幾份資料留下證據。",
      },
      {
        id: "entry", dimension: "第一份工作怎麼選", defaultVisible: false,
        roleA: "製造或工業工程可先從流程、工時、良率與試產著手。晶圓的製程模組另看材料、物理、化工、電子等需求。從品管轉入時，可拿一次追溯紀錄示範如何從缺陷回推可能的工序，再交代證據缺在哪裡。",
        roleB: "機械、電機、電子、自動控制都可能切入。機械背景先補讀電氣圖和介面概念，電控背景補機構、傳動與量測。上銀科技的臺中機電整合開發職缺列表列大學以上、日班。是否值得進修，先對照目標是模組研發、設備驗證或售服。",
      },
      {
        id: "friction", dimension: "工時與工作環境", defaultVisible: false,
        roleA: "想進晶圓廠或產線改善職，估算無塵室出入、長時間站在產線旁、交班與急件的成本。若職缺列輪班，請看實際班表週期和異常處理窗口。品質和交期撞在一起時，也要能把未查完的項目留給下一班。",
        roleB: "想做設備開發，估算試機窗口、跨部門等待、差旅與客戶端驗收的時間。臺中有公開日班個案；設備商若另負責駐廠或交機，先確認到場天數、遠端支援和回程交通怎麼算。",
      },
    ],
  },
  incident: {
    title: "同一批板子的異常，兩種工程師怎麼交班？",
    summary: "以下是電子組裝線的紙面情境。製造端處理批次品質資料，機電端處理驗證文件的版本一致性。",
    triggerLabel: "情境起點：",
    triggerBody: `${counts}。${versions}。同一批資料有品質複判與設備版次兩個缺口。`,
    triggerCaveat: "批次、數量與交接角色為合成資料。這是文件審查，結論只適用於模擬便條。",
    rows: [
      { stage: "釐清品質資料", roleLabel: roleA, tone: "roleA", verifiedFacts: `${counts}，排序可追到同批檢測紀錄。`, openGaps: "缺逐片人工複判，無法解釋八筆標記代表什麼。", actionAndApproval: "製造端提交缺件與異常初報，由題設的品保窗口補結果並複核品質欄，針對八筆已標記件逐片回填，保留同批四十片分母。" },
      { stage: "釐清設備交件", roleLabel: roleB, tone: "roleB", verifiedFacts: `${versions}，來源不同。`, openGaps: "缺版本對照，也缺設備複核簽記。", actionAndApproval: "機電端交差異清單。題設的設備窗口負責補可追到兩版的對照件，再由指定複核人查紀錄是否齊全。" },
    ],
    recoveryAcceptanceTitle: "這份交班紀錄何時可以結案",
    recoveryAcceptanceCriteria: "八片已標記件的逐片複判能對回同一四十片批次，設備驗證摘要有可回查的介面版次，兩個窗口各自留下複核紀錄。任一件缺漏，便條保留待複核並寫明承接人。",
    defenseLayerNote: "實際工廠的復線、設備變更和產品放行由各自的授權及紀錄程序處理。《職業安全衛生法》也有雇主的防護義務，紙面交班僅證明文件已查到哪一步。",
  },
  payAndCerts: {
    title: "薪資怎麼比，證照用在哪裡",
    summary: "用調查認識產業差異，再用聘用條件估這份職缺的收入與時間成本。證書、錄用條件與法定簽證各自查。",
    salaryHeading: "同樣叫工程師，業別和計薪項目都會改變結果",
    salaryBody: `勞動部職類別薪資調查表 3，${pay.period}工業及服務業全時受僱的平均經常性薪資，「品管、工管及生管工程師」與「機械工程師（含造船、輪機、鑄造）」依序為新臺幣 ${pay.general} 元。表 5 沿用相同職群，電子零組件為 ${pay.electronics} 元，金屬製品為 ${pay.metal} 元，機械設備為 ${pay.machinery} 元；電腦、電子產品及光學製品則為 ${pay.computerOptical} 元，排序反過來。兩個參考職群的平均經常性月薪排序可隨業別反轉，資料不能用來報價給個別機電整合工程師。兩頁面職名沒有同城獨立薪資序列。月薪含按月固定津貼與獎金；113 年全年所得另計。\n\n製造職拆本薪、固定年終、依實際班次領的輪班津貼，以及按目標另計的良率或績效獎金。機電研發職也先拆本薪與書面保證年終；接著把員工分紅、專案獎金、專利獎金或派駐津貼依條件另列。工具機雇主公開福利可見季分紅、年度分紅與年終並列。「年薪 14 個月」若附在職或績效條件，先釐清保證額和適用期間；確有書面保 14 時，核它乘本薪還是另有固定給付併入，避免把同一筆津貼算兩次。\n\n同城、同資歷的兩份錄取條件，先把首年本薪、固定津貼及保證年終各按約定的發放次數加總。把分紅、良率獎金與輪班津貼做成另列情境，再比班表、加班、待命、差旅與通勤。例：月本薪五萬元，若十二個月加兩個月都已書面保證，未計其他給付的全年金額是七十萬元；若另兩個月按考核且沒有最低保障，保證金額是六十萬元。這筆模擬差額來自承諾條件，和職稱無關。`,
    certs: [
      {
        name: "機電整合與機械加工技術士",
        officialScope: "勞動部勞動力發展署技能檢定中心，機電整合 17000、機械加工 18500。115 年手冊均列乙級與丙級。報檢條件與開辦梯次各自查。",
        workplaceBoundary: "機電整合適合用來證明機構與電控的技術基礎；機械加工對應金屬加工與製造路線。職缺若寫工業配線乙級加分，應分開核對，職類與考核內容不同。",
        verificationTips: "把手冊的職類及級別對照到目標職缺的工作項目。證書可和公開作品搭配，用來說明你能看懂哪一份材料。",
        officialLinks: [sources.skills],
      },
      {
        name: "經濟部 iPAS 與品質學會 CQE",
        officialScope: "iPAS 智慧生產工程師、電動車機電整合工程師各有初、中級。中華民國品質學會品質工程師（CQE）另有學經歷或品管技術師資格路徑，部分應試者先取得鑑定合格證明。",
        workplaceBoundary: "備考時，製程或品質可選生產管理、品管方法；車用機電可選動力與控制整合。設備商要求的 PLC、商用工具或職務經驗仍依職缺條件。",
        verificationTips: "想投產線改善，先比智慧生產與 CQE 的科目和取證條件；想投電動車系統，再讀車用 iPAS。不要用職缺上的 CQE 三個字母直接推定是要求學會證書。",
        officialLinks: [sources.smartProduction, sources.vehicleIntegration, sources.cqe],
      },
      {
        name: "機械、電機與工業工程技師",
        officialScope: "考選部辦理專技高考。《專門職業及技術人員高等考試技師考試規則》列機械工程技師、電機工程技師、工業工程技師；《技師法》另規定證書、執業執照與執業範圍。",
        workplaceBoundary: "廠內工作包括製程提案、設備規格與內部複核。若案型另有法定技師簽證，按案型確認科別、有效執業執照及簽證責任。",
        verificationTips: "看到需簽名時先分清是內部核對還是依法簽證。若屬後者，把科別和承擔的項目寫在分工上，再查應考與執業條件。",
        officialLinks: [sources.engineeringExam, sources.engineerAct],
      },
    ],
    interviewChecklistTitle: "收到聘用條件，對照這四個細節",
    interviewChecklistQuestions: [
      { label: "改善案的第一件成果", question: "第一季能否從追良率走到提交原因驗證或改版證據？從哪類產品、哪份文件開始？" },
      { label: "設備案的驗收責任", question: "工作含設計、驗證或客戶端支援的哪一段？使用哪份紀錄完成移交？" },
      { label: "給付的最低保障", question: "本薪、固定津貼和年終各保證發幾次？到職未滿一年、調班或離職時如何計算？" },
      { label: "職等與地點", question: "哪一項成果是升等證據？試產窗口、驗收出差或跨廠支援如何記工時及費用？" },
    ],
  },
  thirtyDayPlugin: {
    badge: "四週作品",
    title: "30 天作品｜兩條路各交四份可複核資料",
    summary: "任選一軌。每份留來源、假設和未核事項，讓面試官可以沿同一份材料追問。全程讀公開材料、寫合成文件，無需進廠或使用設備。",
    tracks: [
      {
        id: "manufacturing-portfolio", title: "製程與品質改善", badge: roleA, tone: "roleA",
        weeks: [
          { weekLabel: "第一週", deliverable: "用仁寶年報的筆電製造流程做一張工序索引，分出加工、檢驗與兩條流程的交點。PDF 暫時打不開時，先用摘要：機板加工與本體組合分區，各區有加工及檢驗節點，再補圖頁位置。驗收時同一節點找得到名稱、類型與上游。" },
          { weekLabel: "第二週", deliverable: "讀勞動力發展署精實管理文章，畫包裝、等待品保、入庫三個合成步驟的價值溪流圖。為每步自訂加工與等待時間並分欄加總，圈出一段可追問的等待。離線摘要：先由需求定義價值，再用流程圖辨識等待與重工。" },
          { weekLabel: "第三週", deliverable: "按台達公開 SMT 案例的站別及指標欄，自造一張兩週四站的數據表。為直通率與稼動率各寫一個分母，留一筆缺測並指出週報要如何呈現。驗收時總數、缺測標記和比較期間可回查。" },
          { weekLabel: "第四週", deliverable: "依公開 8D 大綱，把「兩週合成紀錄中包裝標籤被重印」整理成一頁追蹤表。三欄寫可能原因、待取證件、日後如何驗證防錯。檢查下一位讀者能從欄位辨認兩個尚未驗證的原因和一項已完成的資料整理。" },
        ],
      },
      {
        id: "integration-portfolio", title: "設備功能與驗證文件", badge: roleB, tone: "roleB",
        weeks: [
          { weekLabel: "第一週", deliverable: "用勞動力發展署精密機械的機電整合職務說明做一頁功能對照，把合成輸送單元的機構、感測、控制分成三欄，每欄填需求、資料來源與驗證文件。欄位備援：機構、感測、電控三項各寫需求、來源、驗證證據和負責人。" },
          { weekLabel: "第二週", deliverable: "讀台達 EtherCAT 產品總覽，做一頁詞彙與責任表。用編號區分控制器、設備模組、感測器和上層監看，為每個物件配對一個可核的文件或缺件。只畫資料關係，省略接線、組態及設定值。" },
          { weekLabel: "第三週", deliverable: "用台達虛擬機台開發平台的公開說明做模型假設卡。寫下合成裝盒單元的兩個待驗功能，標哪些能從虛擬流程說明查到、哪些還需實物驗證紀錄。交一張三欄表，讓讀者看得到假設、模型證據和現場缺件。" },
          { weekLabel: "第四週", deliverable: "用台達虛擬機台公開說明的驗證欄位做交件索引。備援欄位是模擬功能、版本、畫面或紀錄，以及需由實物驗證的結果。用合成的機構版次、供應商回覆、模型畫面與驗證紀錄，分已收、待收和需複核三種狀態。每一項都應能查到來源、版次、承接人和下一個證據。" },
        ],
      },
    ],
  },
  checklist: {
    title: "分開看技能與工作條件",
    summary: "第一欄選一項你想做出成果的事，第二欄選一項你能長期接受的安排。兩欄各自保留，面談時用來核對職缺。",
    skillsHeading: "技能｜你想把哪種問題追下去",
    skillsOptions: [
      { id: "mfg-line", track: "roleA", label: "從節拍和重工找出瓶頸", summary: "能用工序圖和同一段產線紀錄說明差在哪裡，補上看不見的等待或換線時間。", interviewQuestions: ["新人是否能拿同口徑的兩組紀錄，對照變更前後並整理改版證據？"] },
      { id: "mfg-quality", track: "roleA", label: "把缺陷現象寫成待驗假設", summary: "能分出批次、分母與檢驗版本，知道何時資料足以往下比較。", interviewQuestions: ["誰提供複判證據，製程工程師能參與原因驗證的哪一段？"] },
      { id: "mech-interface", track: "roleB", label: "把感測、機構與控制對回一個功能", summary: "能對照介面名稱、規格與責任人，發現兩份資料談的是否是同一項功能。", interviewQuestions: ["哪份資料會把機構、電氣與控制版本串起來？"] },
      { id: "mech-verification", track: "roleB", label: "讓別人能重查一筆驗證結果", summary: "能說清測的是哪一版、證據放在哪裡、失敗或缺件會交給誰。", interviewQuestions: ["上一個機台專案如何記錄兩版差異與待補驗證？"] },
    ],
    conditionsHeading: "條件｜哪些工作安排能長期接受",
    conditionsOptions: [
      { id: "mfg-shifts", track: "roleA", label: "可配合產線換班和試產窗口", summary: "把輪班、進出無塵室、更衣與交班時間一併算進一週。", interviewQuestions: ["試產改到夜班時怎樣通知，哪些異常需要跨班交接？"] },
      { id: "mfg-tradeoff", track: "roleA", label: "接受品質、報廢與交期一起討論", summary: "要能說明哪些數字已核、什麼資料要等，亦要面對短期無法改善的結果。", interviewQuestions: ["量產缺陷增加時，製造端與品保各自會收到什麼指標與行動？"] },
      { id: "mech-travel", track: "roleB", label: "願意配合客戶驗收與出差", summary: "依實際派工看國內外天數、跨廠交通、夜間支援與補休。", interviewQuestions: ["若有駐廠，從何時起算工時，交通與住宿由誰安排？"] },
      { id: "mech-dependency", track: "roleB", label: "可以等各模組對上再收尾", summary: "一份圖面改版可能影響數個模組，時間會用在重查紀錄和協調依賴。", interviewQuestions: ["機構與電控版次不一致時，由誰排驗證窗口、誰同意結案？"] },
    ],
    defaultInterviewQuestions: ["這個職等自己負責的第一個可交付成果是什麼？", "遇到良率與設備都還有缺件時，誰負責分流到各自的窗口？"],
    crossTrackNote: "兩邊都想做，可先看智慧製造、產線自動化或設備導入，再用技能和工時兩欄分別篩選。職缺寫「整合」時，留意它整合的是多站製程、設備功能，還是生產資料。",
    offlinePrintHint: "各圈一項技能與條件，面試後記下哪項已有具體例子、哪項仍待核。",
  },
  desktopExercise: {
    sectionTitle: "五分鐘試做｜寫異常初報或移載試算",
    summary: "選製造或機電一軌，用紙筆留下可複核的紀錄。批次、設備和數值皆為虛構。題目不用連網、進工廠、通電或操作設備。",
    publicLinksHeading: "公開參考：",
    publicLinks: [sources.smt, sources.eightD, sources.cylinder, sources.torque],
    factSummaryHeading: "離線資料卡：",
    factSummary: `公開產線圖把印刷、打件、回焊及光學檢測分站。八步法的初報先說清問題，原因須取證，防呆要能驗證。

模擬批次 ${trial.lot} 有 ${trial.total} 片，光學檢測標 ${trial.flagged} 片待複判（${flaggedRange}），其餘 ${trial.unflagged} 片未標記。人工複判未附。單一狀態欄只能填待複判或已確認，交指定窗口複核。

同批文件有 ${versions}。兩份沒有版次對照，另附虛構試算表。理想氣缸推力＝${worksheet.pressureMPa} MPa × ${worksheet.areaMm2} mm²，1 MPa 等於 1 N/mm²。伺服紙面靜態負載轉矩＝${worksheet.loadN} N × 垂直力臂 ${worksheet.armM} m。兩式忽略摩擦、加速度等因素，無可供選型或開機的驗收證據。`,
    taskA: { title: "製造軌｜寫 8D 初報", instruction: "寫批次、分母、待複判數，標人工複判未附。把可能誤判放到魚骨圖的量測類，指出品保要補哪八筆。設計文件防呆和一個可測通過條件。" },
    taskB: { title: "機電軌｜填移載試算表", instruction: "寫批次、分母、待複判數，標人工複判未附。算理想推力和靜態轉矩並標單位，指定誰補版本對照及複核。只交紙面結果。" },
    rubricTitle: "展開評分與雙軌樣答",
    rubricHeading: "每軌四個核對點",
    rubricPassRule: "兩項共用與本軌兩項齊全即完成。",
    rubricItems: [
      "共用｜批次、分母、待複判數齊全，未把標記件寫成不良。",
      "共用｜人工複判未附，維持待複核。",
      `製造｜量測原因待驗，請品保補 ${flaggedRange} 的逐片人工複判。`,
      "製造｜提出單一狀態欄防呆，依逐片結果及複核判定兩種測試結果。",
      `機電｜理想推力 ${worksheetPush} N、靜態轉矩 ${worksheetTorque.toFixed(2)} N·m。`,
      "機電｜兩版尚待對照，交設備窗口複核，算值不作放行證明。",
    ],
    sampleAnswerALabel: "製造軌樣答：",
    sampleAnswerA: `${counts}。${trial.review}。量測待驗原因是光學標記與人工判讀有差異。請品保補 ${flaggedRange} 的逐片結果。單一狀態欄只有在編號可回查該片人工複判結果，且品保已覆核時，才可填已確認。測試兩筆合成資料：有編號卻查無人工結果，維持待複判；能查到該片人工結果且經品保覆核，才改為已確認。`,
    sampleAnswerBLabel: "機電軌樣答：",
    sampleAnswerB: `${counts}。${trial.review}。理想推力 ${worksheet.pressureMPa}×${worksheet.areaMm2}＝${worksheetPush} N；靜態轉矩 ${worksheet.loadN}×${worksheet.armM}＝${worksheetTorque.toFixed(2)} N·m。${versions}，交設備窗口做版次對照與複核；算值不作放行證明。`,
  },
  tools: {
    title: "確定下一步要查什麼",
    summary: "從職業候選、面試紀錄、工作興趣或工作條件選一件做。",
    cards: [
      { id: "compare", badge: "職業候選", meta: "雙職業對比", tone: "roleA", title: "換成你正在考慮的兩個職業", description: "如果還在看工業工程師或機械工程師，另開一組對照，查彼此的任務重心。", purposeHint: "已有兩個想投的方向。", ctaLabel: "前往職業對比", href: "/zh-TW/career/compare" },
      { id: "worksheet", badge: "面試準備", meta: "探索工作表", tone: "neutral", title: "記下要核對的工作證據", description: "把想看的交付物、能接受的工時和下一步寫成一頁面試準備。", purposeHint: "有方向，想留下行動紀錄。", ctaLabel: "打開我的工作表", href: "/zh-TW/career/interest-worksheet#my-worksheet" },
      { id: "holland", badge: "工作興趣", meta: "霍蘭德 60 題", tone: "accent", title: "先整理想長期接觸的活動", description: "按六個興趣面向整理你喜歡分析、實作或整理的活動，再看哪個職缺能提供。", purposeHint: "方向還沒定，先整理興趣。", ctaLabel: "開始霍蘭德職業興趣測試", href: "/zh-TW/tests/holland-career-interest-test-riasec" },
      { id: "career94", badge: "工作方式", meta: "職業測試 94 題", tone: "roleB", title: "核對你在意的工作方式", description: "用工作活動、工作方式與工作條件的題目整理對協作、時程與環境的偏好。", purposeHint: "工作吸引你，正在比較職場安排。", ctaLabel: "前往職業測試", href: "/zh-TW/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "分開讀兩個職業介紹",
    profileLinks: [
      { label: "製造工程師職業介紹", href: "/zh-TW/career/jobs/manufacturing-engineers" },
      { label: "機電整合工程師職業介紹", href: "/zh-TW/career/jobs/mechatronics-engineers" },
    ],
  },
  faqs: [
    {
      id: "manufacturing-or-process",
      question: "製造工程師、製程工程師與製程整合工程師差在哪？",
      answer: "想改的是整條產線的工序、節拍或量產導入，先看製造工程或生產技術。想守一段關鍵製程的變動、異常與標準，先看製程工程。想追晶圓產品跨模組的協調與相容性，再看製程整合。可從職缺提到的第一份報告辨認：試產與產能、單模組製程改善，或跨模組問題紀錄。",
    },
    {
      id: "equipment-title",
      question: "機電整合工程師、設備工程師與自動控制工程師怎麼選？",
      answer: "想從機構、感測和電控之間定介面，優先找機電整合；想深做控制設計和功能驗證，找自動控制或電控職；想把特定設備維持在可用狀態，可以看設備維護。設備工程師也可能負責新機台導入。看職缺例子裡哪份交付是本職責的中心：介面與驗證、控制規格，或維護與異常工單。",
    },
    {
      id: "salary-level",
      question: "同城都寫工程師，哪種聘用條件比較值得？",
      answer: "想建立可帶走的工程能力，優先選能拿到完整改善案或可驗證模組的職缺，再用同資歷的年固定額和時間成本檢查代價。製造初階若只填日報，升等前要看有沒有機會能追缺陷、比較不同試產並改作業文件。機電如果主要整理別人的圖，查下一職等是否能負責介面規格和驗證回覆。把是否列入定級、證照有無職務加給、出差待命有無給付等條件記下，另標首年才有的獎金與固定可領的金額。兩份 Offer 即使總年薪相同，扣掉額外交通、排班和照顧成本，結論也可能不同。",
    },
    {
      id: "which-certificate",
      question: "想進工廠，先考機電整合技術士、iPAS 還是 CQE？",
      answer: "設備電控與機構的工作可先核機電整合技術士，金屬加工職可先核機械加工，智慧工廠的生產規劃可看智慧生產 iPAS。若主責是品質改善或品保，再比 CQE 的資格與科目；車用動力或電控才把電動車機電整合鑑定提前。想投依法需技師簽證的職務，應先確認案型所需的技師科別及執業資格。",
    },
    {
      id: "portfolio-transition",
      question: "機械系或電機系想轉職，履歷放哪種作品？",
      answer: "機械背景想走製造，挑一個流程畫出工序、檢驗點和瓶頸，把量測期間和資料缺件列出。電機背景想走機電整合，可挑一個合成設備功能，說明感測、機構和控制資料各由誰提供，再附一張驗證與版次索引。面試官若追問，你應能指到原始材料和一個仍待驗的假設。",
    },
    {
      id: "shift-or-site",
      question: "晶圓廠和設備商，哪邊對生活時間影響較大？",
      answer: "有規律的輪班與突發的驗收外勤，對生活的影響不同。廠內職先看值班週期、試產要不要跟班、交班是否納入工時；設備商則看出差地點、驗收日在平日或假日、夜間支援是電話待命還是必須到場。有固定照顧時段的人，可以先用實際班表與差旅日曆排一週，再比較兩份安排。",
    },
    {
      id: "automation-2026",
      question: "2026 年，AI 與自動化可以分擔哪些製造或機電工作？",
      answer: "製造端能用聯網工具彙整站別資料及 OEE，也能用 AI 生成缺陷影像輔助開發光學檢測模型。機電端能用 DIATwin 比對虛擬機台的流程和節拍。這些能力可見於台達的產品與 2026 年展示。人員仍須追回缺陷標記、樣本分母與量測條件，核對模型和實物的差異。產品放行、設備驗收及現場作業由相應負責人依實際證據辦理。",
    },
  ],
  sourceGroups: [
    { id: "classification-pay", title: "臺灣職業分類與職類薪資", links: [sources.occupations, sources.payReport, sources.payAll, sources.payManufacturing] },
    { id: "manufacturing-recruitment", title: "晶圓、電子代工與工具機職務", links: [sources.tsmc, sources.processCompetency, sources.foxconn, sources.compal, sources.hiwinJob, sources.hiwinBenefits, sources.ucan, sources.integrationCompetency] },
    { id: "taiwan-qualifications", title: "技術士、能力鑑定、技師與職安", links: [sources.skills, sources.smartProduction, sources.vehicleIntegration, sources.cqe, sources.engineeringExam, sources.engineerAct, sources.occupationalSafety] },
    { id: "manufacturing-tools", title: "製造改善、設備與驗證材料", links: [sources.eightD, sources.smt, sources.cylinder, sources.torque, sources.plc, sources.ethercat, sources.automation2026] },
    { id: "tw-manufacturing-portfolio-materials", title: "製造與機電四週作品公開材料", requiresPlugin: "thirtyDay", links: [sources.lean, sources.compalFlow, sources.virtualMachine] },
  ],
};
