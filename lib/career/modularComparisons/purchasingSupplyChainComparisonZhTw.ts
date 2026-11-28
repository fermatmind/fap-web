import type { ModularComparisonSpec } from "../modularComparison";

const roleA = "採購經理";
const roleB = "供應鏈經理";

const sources = {
  payMethod: { label: "勞動部｜114 年調查及薪資定義", href: "https://www.mol.gov.tw/1607/1632/1633/90814/post", note: "月薪含每月固定給付，全年薪資所得另有適用對象及定義。" },
  allPay: { label: "勞動部｜表 3 全體工業及服務業原表", href: "https://statdb.mol.gov.tw/html/s3/svy14/1435003.ods", note: "核中階主管、採購員與生產及物料規劃事務人員。" },
  factoryPay: { label: "勞動部｜表 5 製造業原表", href: "https://statdb.mol.gov.tw/html/s3/svy14/1435005.ods", note: "看電子零組件製造業欄，按同一職類比對。" },
  retailPay: { label: "勞動部｜表 9 批發及零售業原表", href: "https://statdb.mol.gov.tw/html/s3/svy14/1435009.ods", note: "看零售業欄，別將存貨事務人員當成供應鏈經理。" },
  occupations: { label: "主計總處｜職業標準分類第 6 次修訂", href: "https://ws.dgbas.gov.tw/public/attachment/110211718123hcmhd3o.pdf", note: "比較供給配送與倉儲經理、採購員、存貨與生產事務人員。" },
  factoryBuyer: { label: "應用材料｜臺南 Buyer II 職缺", href: "https://jobs.appliedmaterials.com/job/tainan-city/buyer-ii-display-fab-b2/95/80300306624", note: "以供應商績效、物料取得與訂單追蹤為例。" },
  factoryPlanner: { label: "應用材料｜臺南 Planner 職缺", href: "https://jobs.appliedmaterials.com/en/job/tainan-city/planner/95/102756627184", note: "以供需對帳、庫存、MRP 與主排程為例。" },
  mixedJob: { label: "台灣就業通｜臺中機械製造採購職缺", href: "https://job.taiwanjobs.gov.tw/Internet/index/JobDetail.aspx?EMPLOYER_ID=1790&HIRE_ID=14714617&R2=11", note: "工作代碼 14714617，工作內容含按庫存訂購及物料跟催。" },
  compal: { label: "仁寶｜負責任供應鏈", href: "https://www.compal.com/esg/zh-hant/supply-chain-management/responsible-supply-chain/", note: "電子代工的供應商文件版本、風險評估與稽核。" },
  ase: { label: "日月光中壢廠｜永續供應鏈管理", href: "https://www.asecl.com.tw/ch/sustainability/sustainable-supply-chain-management.html", note: "半導體封裝測試廠的供應商稽核、輔導與追蹤。" },
  retailSupply: { label: "統一超商｜商品品質與供應管理", href: "https://www.7-11.com.tw/Company/esg/supply.aspx", note: "原料備援、需求預測、安全庫存、物流與門市。" },
  retailProcurement: { label: "統一超商｜自有商品永續採購", href: "https://www.7-11.com.tw/Company/esg/purchase.aspx", note: "看商品與原料的選商考量。" },
  aps: { label: "SMIT｜A.P.S. 基礎採購檢定", href: "https://www.smit.org.tw/ugC_APSAbout.asp" },
  smitCpsm: { label: "SMIT｜在臺 CPSM 認證資訊", href: "https://www.smit.org.tw/ugC_CPSMAbout.asp" },
  cpsm: { label: "ISM｜認證考生手冊（CPSM 資格）", href: "https://www.ismworld.org/globalassets/pub/docs/certification--handbook2.pdf" },
  apicsExams: { label: "Pearson VUE｜APICS CPIM 與 CSCP 考試", href: "https://www.pearsonvue.com/us/en/apics.html" },
  tradeTerms: { label: "ICC Academy｜Incoterms® 2020 的 FCA 與 FOB", href: "https://academy.iccwbo.org/incoterms/article/incoterms-2020-fca-or-fob/" },
  importDocs: { label: "關務署｜貨物進口報關應檢具之文件", href: "https://web.customs.gov.tw/singlehtml/1207?cntId=cus1_93448_1207" },
  brokerRules: { label: "全國法規資料庫｜報關業設置管理辦法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0350007" },
  brokerExam: { label: "考試院｜專責報關人員考試規則", href: "https://law.exam.gov.tw/LawContent.aspx?id=FL016875" },
  safetyStock: { label: "Microsoft Learn｜品項的安全庫存履行", href: "https://learn.microsoft.com/zh-tw/dynamics365/supply-chain/master-planning/safety-stock-replenishment" },
  automation: { label: "Microsoft Learn｜審閱採購單變更建議", href: "https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/procurement-agent-supplier-com-apply-email-changes" },
  automationImpact: { label: "Microsoft Learn｜檢視採購單變更影響", href: "https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/procurement-agent-impact-analysis-review-changes" },
  forms: { label: "工程會｜公開財物採購、標價及驗收表件", href: "https://www.pcc.gov.tw/content/index?eid=10146&lang=1&type=C" },
  exportDocs: { label: "關務署｜出口報關應檢送之文件", href: "https://web.customs.gov.tw/singlehtml/1207?cntId=cus1_93431_1207" },
  resistor: { label: "國巨｜十千歐姆料號規格書", href: "https://yageogroup.com/component-documentation/download/specsheet/RC0603FR-0710KL" },
  otherResistor: { label: "國巨｜一千歐姆料號規格書", href: "https://yageogroup.com/component-documentation/download/specsheet/RC0603FR-071KL" },
} as const;

const exercise = {
  part: "RC0603FR-0710KL",
  otherPart: "RC0603FR-071KL",
  resistance: "10 kΩ",
  otherResistance: "1 kΩ",
  package: "0603",
  tolerance: "±1%",
  usable: 200,
  demand: 900,
  reserve: 100,
  earlyDeadline: "週四中午",
  quoteA: { delivered: 800, minimum: 800, date: "週三", cost: 0.72 },
  quoteB: { delivered: 1000, minimum: 1000, date: "下週一", cost: 0.48 },
} as const;

const gap = exercise.demand + exercise.reserve - exercise.usable;
const bridgeDecision = `只認 ${exercise.part}（${exercise.resistance}），先擋住錯料 ${exercise.otherPart}（${exercise.otherResistance}）。${exercise.earlyDeadline}前還差 ${gap} 顆可用料，兩邊以倉庫入庫及品保放行時間交接。`;

export const purchasingSupplyChainComparisonZhTwSpec: ModularComparisonSpec = {
  pairId: "purchasing-managers-vs-supply-chain-managers",
  locale: "zh-TW",
  title: "採購經理 vs 供應鏈經理｜臺灣工作內容、薪資與證照比較",
  shortTitle: "採購經理 vs 供應鏈經理",
  description: "臺灣採購經理和供應鏈經理差在哪？比較電子料採購、生管物控、全球運籌與零售補貨的日常、薪資及認證，再用真實零件型錄做五分鐘試做。",
  regionLabel: "臺灣",
  authorName: "費馬測試編輯部",
  datePublished: "2026-11-25",
  dateModified: "2026-11-25",
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: "一批電子料延誤。採購經理先問哪家供應商交得出、要加多少錢、能否分批；供應鏈經理先算庫存撐幾天、哪張工單先做、哪筆交期得重談。喜歡對外談條件、把選商理由留在案卷，從採購看起。喜歡把訂單、產能、庫存和出貨排成同一張表，從供應鏈看起。到了零售通路，同樣的分界就是挑供應商與談商品條件，以及決定各店何時補多少貨。",
    roleA: {
      badgeTitle: roleA,
      riasecLabel: "霍蘭德 ECS（興趣向量前三碼）",
      aliases: "找職缺可查：電子料採購、策略採購、Sourcer、Buyer、商品採購",
      keywords: "拿得出詢價表、成本拆解、供應商評鑑與議價紀錄",
    },
    roleB: {
      badgeTitle: roleB,
      riasecLabel: "霍蘭德 ECR（興趣向量前三碼）",
      aliases: "找職缺可查：資材管理、生管／物控 PC／MC、Planner、全球運籌",
      keywords: "拿得出缺料表、可行排程、庫存與交期方案",
    },
    interviewBoundaryTitle: "職稱重疊時，先看手上要交什麼",
    interviewBoundaryQuestions: [
      "採購職缺若寫「確保交期」，要的是對外確認並調整採購單，還是每天重排工單？",
      "供應鏈職缺若寫「供應商管理」，要的是追進度及回填計畫，還是主談價格、合約並管選商？",
    ],
    riasecBoundaryNote: "徽章取費馬職業資料的興趣向量前三項。職業資料另有兩職皆為 EC 的發布簡碼。興趣可用來挑想試的工作，任用資格及能力要另看。",
  },
  topology: {
    title: "一張需求單，兩邊要確認的事",
    summary: "採購端交得出供應商確認的數量、交貨點與日期，供應鏈端才排得出實際可用的到料日。",
    ariaLabel: "採購的規格、比價、交貨承諾和供應鏈的供需、排程、驗收入庫雙向交接",
    leftZoneTitle: roleA,
    leftSteps: [
      { title: "查規格", detail: "料號、版次、合格來源" },
      { title: "比條件", detail: "單價、最低量、運費" },
      { title: "談出承諾", detail: "數量、交貨點、日期" },
    ],
    centerZoneTitle: "交接",
    upperBridge: { title: "採購給排程", line1: "已確認分批數量", line2: "交貨點與到料假設" },
    lowerBridge: { title: "排程給採購", line1: "最晚可用日期", line2: "最低缺口與優先序" },
    rightZoneTitle: roleB,
    rightSteps: [
      { title: "算供需", detail: "訂單、在手量、在途" },
      { title: "排優先序", detail: "缺料、產能、客戶單" },
      { title: "核交付", detail: "清關、放行、入庫" },
    ],
  },
  matrix: {
    title: "採購、生管、運籌與通路各在忙什麼",
    summary: "先看公司把責任放在哪一端。主計總處職業分類有「供給、配送及倉儲經理人員」，另列採購員、存貨事務人員和生產事務人員；職缺可沿實際工作分讀。",
    roleAColumn: roleA,
    roleBColumn: roleB,
    expandButtonLabel: "展開工具、入行與工作壓力",
    collapseButtonLabel: "收合細項",
    rows: [
      {
        id: "deliverables", dimension: "主要交付", defaultVisible: true,
        roleA: "把需求變成採買選項。交 RFQ（詢價單）、條件可比的報價表、選商依據、議價紀錄與採購單。管理職也看採購策略、預算及人員分工。",
        roleB: "把訂單變成可執行的供應計畫。交缺料與到料表、產能或補貨方案、庫存與交期風險，以及哪些訂單會受影響。",
      },
      {
        id: "electronics", dimension: "電子代工與半導體", defaultVisible: true,
        roleA: "Sourcer 較偏開發來源、評估產能、比價及書面條件；Buyer 較偏採購單、催料與差異處理。直接料依 BOM（物料清單）核料號、版次、合格來源和替代料狀態，再連到供應商稽核。",
        roleB: "PC（生管）從訂單、產能與工單確認能排哪一批；MC（物控）從 BOM、在手量、在途量與到料日抓缺口。做跨廠計畫時還要處理產能調撥、客戶優先序及出貨安排。",
      },
      {
        id: "global", dimension: "全球運籌與跨境交期", defaultVisible: true,
        roleA: "詢價把 Incoterms® 2020 與具名交貨點一起寫清楚。採 FCA 時，賣方辦理出口通關，並在約定地點依交付條件交給買方指定的承運人或指定人，風險於交付時移轉。報價表分列交貨承諾與預估到廠可用日。",
        roleB: "從供應商承諾的交貨日往後算運輸、進口通關、入庫及品保放行，才能估出廠內可用日。S&OP（產銷協同規劃）把業務需求、供應能力與庫存取捨放在同一版本，規劃端再依可用日回算對客交期。",
      },
      {
        id: "retail", dimension: "傳產與零售通路", defaultVisible: true,
        roleA: "傳產原物料看加工規格、交期、替代來源、批量與驗收；零售商品採購另看供應商條件、產品品質與退換約定。統一超商公開資料有自有商品的原料與選商政策。",
        roleB: "傳產以工單、前後製程與現有庫存分配共用物料；通路把促銷需求、門市補貨、配送量和效期一起看。統一超商公開案例有需求預測、原料安全庫存和門市配送管理。",
      },
      {
        id: "authority", dimension: "誰決定與誰驗收", defaultVisible: true,
        roleA: "採購整理比價與條件，依核決額度送簽。遇到替代料、供應商品質缺失或合約變更，交工程、品保或授權主管核定，再做採購變更。",
        roleB: "供應鏈整理不同排程下的缺口、延遲與成本。當資源不夠，就提交哪批先做和哪筆訂單延後的方案；跨客戶、跨廠或加急費按分工找簽核窗口。",
      },
      {
        id: "tools", dimension: "工具與判斷", defaultVisible: false,
        roleA: "從 ERP 採購單、試算表、供應商評鑑及報價版本往回查。拆 MOQ（最低訂購量）、包裝單位、單價、運費及付款條件，才能看出低價是否真的省錢。",
        roleB: "從 ERP／MRP（物料需求規劃）讀需求、已確認到料、前置時間和安全庫存；看交期排程時追帳實差、檢驗待放行、產能上限及插單影響。",
      },
      {
        id: "entry", dimension: "入行與轉向", defaultVisible: false,
        roleA: "商管、物流或工程背景都可從工作內容選入口。電子料採購作品交一張同規格報價比較與送簽理由；傳產可用規格、付款與交期重做一份詢價單。",
        roleB: "工工、企管、物流或廠內生產經驗可切入生管、物控或需求規劃。入門作品做一張能追公式的缺料表；若要走供應鏈主管，接著練跨廠取捨和更新客戶承諾。",
      },
      {
        id: "friction", dimension: "半年後最容易卡住的地方", defaultVisible: false,
        roleA: "議價會被拒，供應商稽核也可能需要往返廠區。若每次都因不想追書面承諾而放著、難以說明為何選較貴的方案，先試小料件或採購助理。",
        roleB: "插單、關務延誤或月底出貨會逼你重排。同時得面對業務、工廠與庫房，可能還有跨時區聯繫。若重算、通報與協調讓你難以維持交接紀律，先從單線生管或單一庫點試起。",
      },
    ],
    hybridRoleNote: {
      prefix: "職責可以合在一個職缺。例如",
      linkLabel: "台灣就業通的臺中機械製造採購職缺",
      href: sources.mixedJob.href,
      suffix: "同時列議價、物料跟催與按庫存訂購。投遞時看主要交付是供應商與採購單，還是生產與庫存。",
    },
  },
  incident: {
    title: "代工廠缺料，誰可以改單、誰要重排？",
    summary: "情境模擬。組裝線週四開工，合格零件原先承諾週二交貨，供應商臨時改回覆。第一件事是把交貨點、數量與到廠可用時間分清楚。",
    triggerLabel: "交貨日期往後移：",
    triggerBody: "供應商說一部分可以提前交到貨代，其餘下週出貨。同一時間，業務接到客戶提早交貨的要求，倉庫也發現一批備料還在待驗區。",
    triggerCaveat: "此處用合成案例示範。交給貨代、進廠與品保放行分開記。尚未核准的替代料不算可供生產的庫存。",
    rows: [
      {
        stage: "先算缺口與最晚時點", roleLabel: "供應鏈與生管物控", tone: "roleB",
        verifiedFacts: "工單用量、現場已放行庫存、在途資料能對到同一料號與日期。",
        openGaps: "待驗多少能及時放行、急單是否能拆批給客戶。",
        actionAndApproval: "交最小缺口及最晚可用時點。將重排工單及延後承諾兩案的影響交生產和業務負責人決定。",
      },
      {
        stage: "確認能採取的對外方案", roleLabel: "採購與工程品保", tone: "roleA",
        verifiedFacts: "合格供應商有書面分批數量，報價已註明交貨點。供應商提出的替代料仍待確認。",
        openGaps: "加急運費、輸入文件齊否、替代料能否通過工程驗證。",
        actionAndApproval: "列分批、加急與替代選項。額外費用送授權主管，替代料交工程和品保查核。核定後才調整採購單。",
      },
      {
        stage: "更新排程與追放行", roleLabel: "供應鏈與倉庫", tone: "roleB",
        verifiedFacts: "更新後的採購單與貨代資料看得出各批到貨時間和數量。",
        openGaps: "通關、到廠後檢驗與實際入庫仍可能偏離原估。",
        actionAndApproval: "把已確認批次放進 ERP 與排程，通知生產及業務。若進度低於門檻，改用核過的分批方案並交代下次更新時間。",
      },
    ],
    recoveryAcceptanceTitle: "何時才算可以恢復原排程？",
    recoveryAcceptanceCriteria: "倉庫入庫、數量與正確料號對得上採購單；品保放行可追到批次；生管重算後，現有可用量能覆蓋承諾工單。未補齊者保留缺口、責任人和下次確認時間，再由業務用更新過的日期回覆客戶。",
    defenseLayerNote: "將採購承諾、關務與貨運紀錄、倉庫收貨、品保放行和客戶承諾分開留底，方便追查落差。",
  },
  payAndCerts: {
    title: "臺灣薪資怎麼比？認證適合哪條路？",
    summary: "先看官方統計的職類，再看聘書是請你管料件、管排程，還是管跨廠供應。職等與核決範圍影響你能拿哪一個條件來談。",
    salaryHeading: "從原表的月薪與年薪，到手上兩份聘書",
    salaryBody: `勞動部職類別薪資調查（PSDN）表 3 的全體工業及服務業，114 年 7 月全時受僱員工平均經常性月薪／113 年全年平均薪資所得，中階主管（經理）為新臺幣 98,774 元／162.5 萬元，採購員 47,231 元／69.5 萬元，生產及物料規劃事務人員 41,408 元／60.2 萬元。表 5 電子零組件製造業同三組為 133,680 元／308.4 萬元、58,027 元／115.9 萬元、46,816 元／85.3 萬元。表 9 則顯示零售業採購員為 48,557 元／65.5 萬元，存貨事務人員為 36,699 元／47.3 萬元。月薪含每月固定給付，全年所得按該年全年在職者統計，含績效等項目。「中階主管（經理）」合併多種管理職，兩個經理職稱沒有各自的薪資數字。採購員、生產及物料規劃事務人員是入行參考，表 9 的採購員與存貨事務人員也分屬不同職類。

科技廠開的本薪、固定職務或外語津貼、績效獎金與員工分紅先拆開。聘書若寫保證十四個月，先查多出兩個月按本薪或其他基準計、未滿一年如何折算、何時要在職。傳產與零售職缺另看是否有固定主管津貼、促銷或庫存目標獎金、跨點交通補貼及待命條件。書面固定項目進保證年薪，變動項目另列達標、發放及離職條件。

例如同在臺南、相近年資的兩份假設聘書，採購職本薪 70,000 元、保 14 個本薪月、固定津貼 3,000 元發 12 次，保證年現金 101.6 萬元。供應鏈職本薪 78,000 元、保 12 個本薪月、固定津貼 6,000 元發 12 次，則是 100.8 萬元。再把分紅或績效、加班及跨點通勤另列。定級時採購端核簽約額度、負責的採買類別及帶人規模；供應鏈端核規劃幾廠、可否調撥與誰能承諾出貨。`,
    certs: [
      {
        name: "A.P.S. 與 CPSM｜採購與供應管理",
        officialScope: "A.P.S. 基礎採購檢定由中華採購與供應管理協會（SMIT）核發合格證書。CPSM 由美國 Institute for Supply Management（ISM）發證，採三科測驗及適用專業經歷。SMIT 在臺提供 CPSM 認證資訊。",
        workplaceBoundary: "A.P.S. 可用來建立詢比議價與採購流程基礎；有供應管理經歷，再用 CPSM 整理品類策略、風險與領導工作。兩項都是職能認證。",
        verificationTips: "先決定要補基礎採購語言或供應管理深度。申請 CPSM 時查 ISM 如何認列學歷、專業經歷及考試。",
        officialLinks: [sources.aps, sources.cpsm, sources.smitCpsm],
      },
      {
        name: "APICS CPIM 與 CSCP｜規劃與供應鏈",
        officialScope: "Association for Supply Chain Management（ASCM）以 APICS 名義發證。CPIM 側重計畫與庫存管理；CSCP 從需求、採購、營運到物流和跨組織協作。",
        workplaceBoundary: "工作要看 MRP、補貨、排程時先讀 CPIM 範圍；要做跨國供需、網絡與風險時先讀 CSCP。兩項的認證範圍可用來挑作品主題。",
        verificationTips: "把課綱對到實際職缺要交的報表，也可核公司是否資助維持資格。獨立帶案與簽核仍依實際職務授權。",
        officialLinks: [sources.apicsExams],
      },
      {
        name: "專責報關人員｜報關業的法定角色",
        officialScope: "擔任專責報關人員須通過專門職業及技術人員普通考試的專責報關人員考試。早年通過海關專責報關人員資格測驗、領有合格證書者也可繼續執業。執業時由任職的報關業持及格或合格證書，向所在地海關辦理登記並申請核發報關證。",
        workplaceBoundary: "採購與生管可以準備發票、裝箱單、交貨點資料及安排運輸。報關業受委託申報時，由專責報關人員審核並簽證報單。A.P.S.、CPSM、CPIM、CSCP 用於職能進修。",
        verificationTips: "看職缺要求的是準備貿易文件，還是以專責報關人員身分審核與簽證。若屬後者，核對應考資格以及報關業辦理登記與申領報關證的流程。",
        officialLinks: [sources.brokerRules, sources.brokerExam],
      },
    ],
    interviewChecklistTitle: "用四個條件把職等問清楚",
    interviewChecklistQuestions: [
      { label: "保證給付", question: "書面保證幾個月？每個月底薪、固定津貼與額外月數各以什麼金額計？" },
      { label: "變動給付", question: "變動獎金核算期間、達標基準與發放條件是什麼？到職／離職如何按比例？" },
      { label: "可核定的事", question: "採購的合約和費用核決額度；供應鏈的調撥與對客承諾權，各由誰核定？" },
      { label: "工作代價", question: "有跨廠、夜間接海外電話或假日待命嗎？交通、補休及加班如何計？" },
    ],
  },
  thirtyDayPlugin: {
    badge: "30 天作品清單",
    title: "先做一套可在面試時攤開的文件",
    summary: "使用臺灣免費公開材料，所有價格、需求與庫存由自己註記為假設。兩軌各可獨立完成，留下能讓他人重算及查來源的版本。",
    tracks: [
      {
        id: "purchasing", title: "採購軌", badge: "供應商與條件", tone: "roleA",
        weeks: [
          { weekLabel: "第一週", deliverable: "參考工程會財物表件，把品名、規格、數量、付款與驗收做成一頁包材 RFQ。交空白可用表與一筆填好的示例，讀者能找到驗收欄。" },
          { weekLabel: "第二週", deliverable: "讀仁寶公開的供應商評估、分級與稽核，為虛構的加工廠做六項稽核表。每項附證據、缺失分級與改善責任人。" },
          { weekLabel: "第三週", deliverable: "用統一超商原料採購公開政策列替代供應商門檻。以兩個虛構原料商做評選表，一欄放到岸與運配成本，一欄放品質或來源證明。" },
          { weekLabel: "第四週", deliverable: "用關務署出口文件反推報價書的交貨點、分批和文件交付責任。交一頁選商送簽稿，附未結事項和超額費用的簽核人。" },
        ],
      },
      {
        id: "supply", title: "供應鏈軌", badge: "供需與排程", tone: "roleB",
        weeks: [
          { weekLabel: "第一週", deliverable: "由統一超商安全庫存案例起步，做三家虛構門市的兩週需求及效期表。每店須能重算期末量、未滿足量與將過期數量。" },
          { weekLabel: "第二週", deliverable: "拿關務署的進口文件做在途表。用兩種文件延遲情境列交貨、到港、放行、入庫和到店五個日期，標出誰更新哪欄。" },
          { weekLabel: "第三週", deliverable: "用統一超商的雙來源備援作法，建立兩週供應中斷的調撥模型。交調撥前後預估缺貨店數、配送限制和備援啟動門檻。" },
          { weekLabel: "第四週", deliverable: "彙整促銷與平日兩套產銷方案。交一頁 S&OP 會議資料，保留服務目標、庫存、剩貨與額外配送成本，圈出需營運主管決定的取捨。" },
        ],
      },
    ],
  },
  checklist: {
    title: "先勾出你願意做半年、也願意繼續做的工作",
    summary: "依手上做得出來的證據勾選，再讀對應的面試問題。跨兩欄時，選要先磨練的交付物。",
    skillsHeading: "我願意練熟的事",
    skillsOptions: [
      { id: "source", track: "roleA", label: "追清一張報價", summary: "我願意把規格、運費、MOQ、到貨與付款條件核到同一版本。", interviewQuestions: ["哪一類料要自己開發來源？新進人員第一份比價表由誰複核？"] },
      { id: "supplier", track: "roleA", label: "面對供應商與議價", summary: "我能解釋哪個條件值得讓步，也願意用文件追稽核改善。", interviewQuestions: ["供應商出現重大缺失時，採購可否暫停下單，解除由誰核定？"] },
      { id: "planning", track: "roleB", label: "把帳對到真實到料", summary: "我喜歡算缺料、查帳實差，再按日期和優先序修正排程。", interviewQuestions: ["哪一版 MRP 或試算表是共用基準？待驗料如何標記？"] },
      { id: "tradeoffs", track: "roleB", label: "說明當天要延哪張單", summary: "我願意把排程調整的成本與客戶影響直接說清楚。", interviewQuestions: ["兩個客戶都要求插單時，最後的決定人和回覆人是誰？"] },
    ],
    conditionsHeading: "我能承受的工作條件",
    conditionsOptions: [
      { id: "visits", track: "roleA", label: "訪廠與反覆談判", summary: "先確定能否接受外訪、交期跟催及報價版本反覆更新。", interviewQuestions: ["供應商審查要到場還是查文件？訪廠地點與交通補貼如何算？"] },
      { id: "schedule", track: "roleB", label: "插單與跨時區協作", summary: "先確定能否接受月底出貨、重排與海外交接。", interviewQuestions: ["近一次急單重排由誰接手？夜間或假日有無值班表與補休？"] },
    ],
    defaultInterviewQuestions: ["請用上一個缺料案說明新人交哪份文件、由誰簽核。", "前三個月用哪些工作成果判斷我可以獨立負責？"],
    crossTrackNote: "同時喜歡外部談判與內部排程，可以從有分工說明的資材團隊起步，再看哪個交付讓你更想深入。",
    offlinePrintHint: "也可印下這份清單，帶兩項最想試的工作去看職缺。",
  },
  desktopExercise: {
    sectionTitle: "五分鐘紙面試做：同封裝的兩顆料，哪批能救排程？",
    summary: "拿紙畫三欄，分成規格、可用量和待確認事項。前兩分鐘讀資料卡，後三分鐘選一個角色寫交接。下方已給齊離線資訊，全程可在紙上完成。",
    publicLinksHeading: "公開材料：",
    factSummaryHeading: "離線資料卡：",
    publicLinks: [sources.resistor, sources.otherResistor],
    factSummary: `公開型錄中，國巨兩款厚膜電阻都是 ${exercise.package} 封裝、公差 ${exercise.tolerance}。BOM 指定 ${exercise.part}，阻值 ${exercise.resistance}；另一款 ${exercise.otherPart} 是 ${exercise.otherResistance}。包裝規格說它怎麼裝，最低訂購量則要回到該家供應商的書面報價。

以下是合成條件。開工要用 ${exercise.demand} 顆，另保留 ${exercise.reserve} 顆安全庫存，已有 ${exercise.usable} 顆合格可用。開工與確認放行的截點同為${exercise.earlyDeadline}。甲報正確料號，${exercise.quoteA.date}可送廠 ${exercise.quoteA.delivered} 顆，最低買 ${exercise.quoteA.minimum} 顆，每顆新臺幣 ${exercise.quoteA.cost} 元；乙同料號、${exercise.quoteB.date}至廠 ${exercise.quoteB.delivered} 顆，最低買 ${exercise.quoteB.minimum} 顆，每顆 ${exercise.quoteB.cost} 元。另有一筆錯料報價寫了同封裝的一千歐姆版。甲乙的報價日期都指送抵廠區，收貨與檢驗放行時間待查。`,
    taskA: {
      title: "採購交一張比價與送簽便條",
      instruction: "寫料號、阻值與缺口，算兩家最低採買金額。畫出交貨後還缺的證據，留下一句請主管核支出及品保核放行的話。",
    },
    taskB: {
      title: "供應鏈交一張優先排程便條",
      instruction: "寫料號、阻值與缺口，按安全庫存推算只用現有料能開多少。把條件式排程、改排門檻與回報對象寫成三行。",
    },
    rubricTitle: "展開評分與兩份完整樣答",
    rubricHeading: "四項各一分",
    rubricPassRule: "共通兩項加所選職務那一項都對，才通過該軌。",
    rubricItems: [
      "共通：辨識正確料號和阻值，擋住同封裝錯料。",
      "共通：把安全庫存加回需求算出缺口，分開記送廠與可用時間。",
      "採購：算出最低金額，交有到料條件的選案、支出核定與放行窗口。",
      "供應鏈：說明現有料可排多少，寫下回頭改排的截點與通知對象。",
    ],
    sampleAnswerALabel: "採購樣答：",
    sampleAnswerA: `${bridgeDecision} 甲最低花 ${exercise.quoteA.minimum * exercise.quoteA.cost} 元，乙花 ${exercise.quoteB.minimum * exercise.quoteB.cost} 元。乙的最低採買金額較低，但要等到下週一。提甲送簽，請供應商書面確認送哪個收貨點，請倉庫與品保對齊截點前的收貨、檢驗及放行。採購主管核費用後才改採購單；拿不到承諾就把缺口與時程交回生管重排。`,
    sampleAnswerBLabel: "供應鏈樣答：",
    sampleAnswerB: `${bridgeDecision} 手上先留安全庫存，只可分給優先工單 ${exercise.usable - exercise.reserve} 顆。若甲貨在截點前全數放行，可排原工單並保留安全庫存。截點仍待驗就標明未能如期生產的量，將縮批或延後方案交生產主管，通知業務更新客戶日期，採購另追後續到料。`,
  },
  tools: {
    title: "按你現在卡住的地方選一個工具",
    summary: "兩個方向都值得保留時，先整理比較條件。對職涯活動感到模糊時，可先認識興趣或工作偏好。",
    cards: [
      { id: "compare", badge: "已經有候選", meta: "兩個職業", tone: "roleA", title: "職業對比工具", description: "把這兩職或另一組職業放在同一頁看。", purposeHint: "適合已知道下一組要比較的職稱。", ctaLabel: "選兩個職業", href: "/zh-TW/career/compare" },
      { id: "worksheet", badge: "準備行動", meta: "工作表", tone: "roleB", title: "職業興趣探索工作表", description: "記下要試的任務、已找到的職缺與下一個驗證行動。", purposeHint: "適合要把比較結果帶去看職缺或面試。", ctaLabel: "開始填工作表", href: "/zh-TW/career/interest-worksheet#my-worksheet" },
      { id: "holland", badge: "探索興趣", meta: "60 題", tone: "neutral", title: "霍蘭德職業興趣測試", description: "看六類工作活動的興趣與三碼摘要。", purposeHint: "適合還分不清自己喜歡談條件、整理資料，還是協調現場。", ctaLabel: "做霍蘭德 60 題", href: "/zh-TW/tests/holland-career-interest-test-riasec" },
      { id: "career94", badge: "探索工作方式", meta: "94 題", tone: "accent", title: "職業測試", description: "從工作活動、工作方式與工作條件釐清偏好。", purposeHint: "適合想一起考慮跨部門合作、規則和工作節奏。", ctaLabel: "做職業測試 94 題", href: "/zh-TW/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "查看單一職業檔案",
    profileLinks: [
      { label: roleA, href: "/zh-TW/career/jobs/purchasing-managers" },
      { label: roleB, href: "/zh-TW/career/jobs/supply-chain-managers" },
    ],
  },
  faqs: [
    {
      id: "sourcing-buyer",
      question: "電子料採購的 Sourcer 和 Buyer 要怎麼選？",
      answer: "想開發廠商並談長期條件，先找 Sourcer；想從採購單、催料、付款與交貨差異入手，先看 Buyer。看見兩類工作同時出現，挑一張要交的文件追問責任，像誰做成本拆解，誰能對供應商確認改單。",
    },
    {
      id: "pc-mc",
      question: "生管 PC、物控 MC 和供應鏈經理如何銜接？",
      answer: "想決定哪台機器、哪張工單先上線，先看生管。從現有庫存、未交採購單和 BOM 避免短料，先看物控。想往經理職走，再加一份跨廠或跨產品線的取捨紀錄，寫清誰承接延誤與何時調整對客日期。",
    },
    {
      id: "promotion",
      question: "已在傳產做採購，想轉通路供應鏈會卡在哪？",
      answer: "若你已有使用訂單與庫存做補貨調整的紀錄，可以先投庫存規劃或補貨。若手上的經驗主要是下單與議價，先做有促銷需求、效期及配送限制的一週作品，把多備與缺貨的代價放到同一張表，會更容易說明你如何調配庫存。",
    },
    {
      id: "offer-level",
      question: "同樣叫經理，怎樣判斷是否同職等？",
      answer: "看職務能決定什麼，也看成果由誰負責。採購查是否主責指定品類、選商與供應商改善。談升等可拿一個議價案，列同規格的成本基準、實際節省與供應品質。供應鏈查能否核定調撥或重排產能，拿方案實施前後等長期間的準時交付率、缺貨天數和庫存變化說明成果。職稱掛經理，日常卻只跟催採購單或彙整排程，就按實際權責和工作量比價。拿到聘書先做三欄。保證現金用本薪與固定津貼各乘書面保證發放次數後加總。績效分紅記達標條件，待命與跨廠記時數、交通費與補休。",
    },
    {
      id: "trade",
      question: "報價有 FCA 地點，能把那天當到料日嗎？",
      answer: "排工單要用貨物到廠、入庫並完成品保放行後的可用日。採 FCA 時，賣方辦理出口通關，並依具名地點及實際交付確認風險移轉。拿到供應商承諾的交貨日後，另列運輸與臺灣進口通關時間，確認商業發票齊備，並按貨物情況備妥裝箱單，再估算距離開工還有多少餘裕。",
    },
    {
      id: "automation-2026",
      question: "2026 年，採購單變更和缺料判斷能交給工具嗎？",
      answer: "可以用工具整理供應商改期訊息，再讓人核對並決定是否改單。Microsoft Dynamics 365 採購代理的公開預覽文件描述從郵件辨識日期、數量變更，並呈現對需求的影響。採購端仍要核原郵件、批次、合約與核決範圍；供應鏈端核實到料、庫存與產能後，才由有權人確認排程或對客承諾。功能啟用依環境與設定。",
    },
    {
      id: "cert-choice",
      question: "先做作品還是先考認證？",
      answer: "準備投初階採購或物控時，先交一張可重算的報價表或缺料表。需要系統補課時，A.P.S. 可補採購基礎，CPIM 可補計畫及庫存。已有品類或跨廠經驗，再把 CPSM 或 CSCP 的範圍對到想承接的管理工作。",
    },
  ],
  sourceGroups: [
    { id: "occupations-pay", title: "臺灣職業分類與薪資資料", links: [sources.occupations, sources.payMethod, sources.allPay, sources.factoryPay, sources.retailPay] },
    { id: "work-and-industry", title: "臺灣雇主職缺與公開作業", links: [sources.factoryBuyer, sources.factoryPlanner, sources.mixedJob, sources.compal, sources.ase, sources.retailSupply, sources.retailProcurement] },
    { id: "credentials-trade", title: "認證、貿易條件與關務", links: [sources.aps, sources.smitCpsm, sources.cpsm, sources.apicsExams, sources.tradeTerms, sources.importDocs, sources.brokerRules, sources.brokerExam] },
    { id: "exercise", title: "試做的電子料原始型錄", links: [sources.resistor, sources.otherResistor] },
    { id: "software", title: "安全庫存與採購變更工具文件", links: [sources.safetyStock, sources.automation, sources.automationImpact] },
    { id: "portfolio", title: "30 天作品使用的臺灣公開表件", requiresPlugin: "thirtyDay", links: [sources.forms, sources.exportDocs] },
  ],
};
