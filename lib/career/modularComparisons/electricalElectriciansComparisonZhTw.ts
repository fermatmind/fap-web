import type { ModularComparisonSpec } from "../modularComparison";

const roleA = "電機工程師";
const roleB = "電工";

const sources = {
  jobClass: {
    label: "主計總處｜行業及職業判定歸類參考表",
    href: "https://www.stat.gov.tw/public/Attachment/8919114838A8SD8TAF.pdf",
    note: "職業細類 2151、2152、7411、7412，按主要工作內容分類。",
  },
  payMethod: {
    label: "勞動部｜114 年職類別薪資調查統計結果",
    href: "https://www.mol.gov.tw/1607/1632/1633/90814/",
    note: "看附錄母體、經常性薪資、全年薪資所得三項定義。",
  },
  payTable: {
    label: "勞動部｜全時受僱員工人數、薪資原表",
    href: "https://statdb.mol.gov.tw/html/s3/svy14/1435003.ods",
    note: "正式報告表 3，114 年 7 月經常性薪資，電機、電子工程師及電力、電子、資通訊設備裝修人員（含水電工）兩列。",
  },
  sectorPay: {
    label: "勞動部｜營建工程業受僱員工人數、薪資原表",
    href: "https://statdb.mol.gov.tw/html/s3/svy14/1435008.ods",
    note: "表 8，可用機電、管道及其他建築設備安裝業同欄比較兩組。",
  },
  payPortal: {
    label: "主計總處｜薪情平臺",
    href: "https://earnings.dgbas.gov.tw/query_payroll.aspx",
    note: "查產業薪資時，核期間、統計對象與薪資項目。",
  },
  licenseExam: {
    label: "考選部｜專技高考技師考試規則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=R0040049",
    note: "考試類科和應考資格表的電機工程技師欄。",
  },
  professional: {
    label: "技師法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0030022",
    note: "第 7、8、13、16、21、24 條，分查執業、工作範圍、簽證與公會。",
  },
  electricityAct: {
    label: "電業法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0030011",
    note: "第 59 至 61 條，承裝、用電維護及設計監造範圍與例外。",
  },
  designScope: {
    label: "電業設備及用戶用電設備工程設計及監造範圍認定標準",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0130020",
    note: "第 2 至 6 條，按設施、工程類型、容量與其他適用規定確認。",
  },
  publicWorks: {
    label: "公共工程專業技師簽證規則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070069",
    note: "第 2 至 6 條及附表，核公共工程範圍和委託設計監造內容。",
  },
  skills: {
    label: "115 年度全國技術士技能檢定簡章",
    href: "https://skill.tcte.edu.tw/download.php",
    note: "開啟當期簡章，按職類 00700 室內配線、01300 工業配線核對。",
  },
  contractor: {
    label: "電器承裝業管理規則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0030054",
    note: "2025 年 10 月 29 日修正。第 3 至 10 條核公司登記、人員及不得兼任。",
  },
  operation: {
    label: "能源署｜用戶用電設備裝置規則",
    href: "https://law.moea.gov.tw/LawContent.aspx?id=FL011045",
    note: "看現行版本與沿革，原名《屋內線路裝置規則》。",
  },
  facilityStaff: {
    label: "用電場所及專任電氣技術人員管理規則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0130071",
    note: "用電維護及專任電氣技術人員屬用電場所管理。",
  },
  workplaceSafety: {
    label: "職業安全衛生法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0060001",
    note: "第 6 條，雇主對電等危害採取必要安全衛生措施。",
  },
  safetyRules: {
    label: "職業安全衛生設施規則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0060009",
    note: "第 254、276 條，核停電作業與電氣設備感電防止相關責任。",
  },
  lowVoltageForm: {
    label: "台電低壓竣工報告單",
    href: "https://www.taipower.com.tw/media/f0qnynpx/2022080116581090762.pdf?mediaDL=true#page=1",
    note: "看正面申報與背面檢驗欄分工。",
  },
  inspection: {
    label: "台電｜新增設用戶用電設備檢驗要點修正函及附件",
    href: "https://aim.org.tw/upload/news/file/1791162285.pdf",
    note: "公會轉載之台電原函 PDF，2026 年 10 月 1 日修正，附件四表 A 可查低壓報竣及檢驗欄位。",
  },
  inspectionRegulation: {
    label: "全國法規資料庫｜用戶用電設備檢驗辦法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0130086",
    note: "第 3、4、8、10、22 條，分查設計審查、報竣、檢驗接電與生效日。",
  },
  drawings: {
    label: "台電配電場所圖審資料",
    href: "https://www.taipower.com.tw/media/cj3diyyw/%E9%85%8D%E9%9B%BB%E5%A0%B4%E6%89%80%E5%9C%96%E5%AF%A9%E6%89%80%E9%9C%80%E6%AA%A2%E9%99%84%E8%B3%87%E6%96%99.pdf?mediaDL=true#page=1",
    note: "看兩類圖審文件與表末註記。官網 PDF 若無回應，可從台電網站搜尋「配電場所圖審所需檢附資料」。",
  },
  applyPower: {
    label: "台電新增設用電申請須知",
    href: "https://www.taipower.com.tw/media/mvfcfmtf/2021090713285160095.pdf?mediaDL=true",
    note: "第二節用戶應配合事項，區分責任分界、承裝與設計監造。",
  },
  pv: {
    label: "台電配電級再生能源併網手冊",
    href: "https://www.taipower.com.tw/media/mrdc542n/%E9%85%8D%E9%9B%BB%E7%B4%9A%E5%86%8D%E7%94%9F%E8%83%BD%E6%BA%90%E4%BD%B5%E7%B6%B2%E6%89%8B%E5%86%8A.pdf?mediaDL=true",
    note: "2025 年 3 月版，第 1 章併聯審查、界面協商與試運轉。",
  },
  engineeringJob: {
    label: "台灣就業通｜機電工程師徵才",
    href: "https://job.taiwanjobs.gov.tw/Internet/index/JobDetail.aspx?EMPLOYER_ID=1730&HIRE_ID=14825285&R2=11",
    note: "臺北徵才樣本，職缺 14825285。迴路、負載審圖及機電與裝修介面。",
  },
  electricalPlantJob: {
    label: "台灣就業通｜大亞電機維護工程師",
    href: "https://job.taiwanjobs.gov.tw/Internet/index/JobDetail.aspx?EMPLOYER_ID=116345&HIRE_ID=14802841&R2=11",
    note: "臺南關廟，職缺 14802841。PLC、HMI 與依學經歷及證照核薪。",
  },
  apprenticeJob: {
    label: "吉翔水電｜新建住宅水電學徒與半技徵才",
    href: "https://www.1111.com.tw/job/132461717/",
    note: "2026 年 11 月臺中烏日雇主刊登樣本，列照明、住宅水電與帶訓。",
  },
  scadaJob: {
    label: "台灣就業通｜儀電廠務工程師工作內容",
    href: "https://job.taiwanjobs.gov.tw/internet/jobwanted/company_desc2.aspx?EMPLOYER_ID=2452469",
    note: "核儀電廠務工程師欄，PLC、SCADA、配電盤、UPS 與工程驗收。",
  },
  cleanRoomJob: {
    label: "台灣就業通｜晶圓廠廠務招聘",
    href: "https://job.taiwanjobs.gov.tw/Internet/jobwanted/company_desc2.aspx?BRANCH_ID=&EMPLOYER_ID=54162",
    note: "廠務系統工程師職缺，電力、無塵室等依專業分派。",
  },
  shiftJob: {
    label: "台灣就業通｜廠務輪班工程師招聘",
    href: "https://job.taiwanjobs.gov.tw/internet/index/JobDetail.aspx?EMPLOYER_ID=149813&HIRE_ID=14817869&R2=11",
    note: "職缺 14817869，四班二輪及公用設施的運轉與維護。",
  },
  fieldJob: {
    label: "臺中就業服務｜宇辰系統科技徵才",
    href: "https://1catchjob.taichung.gov.tw/detail.aspx?act=5668",
    note: "活動 5668，變頻器及 PLC 維修、待命與工程監工職務。",
  },
  retailJob: {
    label: "台灣就業通｜商業機電維護徵才",
    href: "https://job.taiwanjobs.gov.tw/Internet/index/JobDetail.aspx?EMPLOYER_ID=130766&HIRE_ID=14785391&R2=11",
    note: "臺北徵才樣本 14785391，含水電、空調、消防等機電維護。",
  },
  apprenticeJobAlternate: {
    label: "台灣就業通｜永旭水電電工班學徒",
    href: "https://job.taiwanjobs.gov.tw/Internet/index/jobDetail.aspx?EMPLOYER_ID=2578641&HIRE_ID=13768411&R2=",
    note: "新北個案 13768411，職缺名為電工班學徒，網站歸為水電配線技術員。",
  },
  facilityWaterElectricalJob: {
    label: "台灣就業通｜瑞賢實業廠務水電工程專員",
    href: "https://job.taiwanjobs.gov.tw/internet/index/JobDetail.aspx?EMPLOYER_ID=178635&HIRE_ID=14735491&R2=11",
    note: "臺南個案 14735491，工程專員職稱但實際交付偏水電裝設維護，職稱與工作成果須分開核對。",
  },
  skillsStandard: {
    label: "勞動力發展署｜水電工程人員職能基準",
    href: "https://icap.wda.gov.tw/File/datum/107018001v4.pdf",
    note: "看讀圖、施工、檢查記錄等工作任務與行為指標。",
  },
  wiringReference: {
    label: "技能檢定中心｜室內配線乙、丙級術科應檢人參考資料公告",
    href: "https://www.wdasec.gov.tw/News_Content.aspx?n=F240F6BB01FE46BA&s=BC03BB241E635022&sms=DD855C7DF840A224",
    note: "查職類 00700 及乙、丙級「應檢人參考資料」入口。115 年 8 月 15 日修正版本自 116 年 1 月 1 日起適用。",
  },
  wiringCompetencies: {
    label: "技能檢定中心｜室內配線技能檢定規範",
    href: "https://ws.wda.gov.tw/Download.ashx?n=MDA3MDDlrqTlhafphY3nt5otMTA4LnBkZg%3D%3D&u=LzAwMS9VcGxvYWQvMzE1L1JlbEZpbGUvMTAyMzkvOTkwOTMvMjAxOTA1MzAxMzU4MTUwLnBkZg%3D%3D",
    note: "參考下載若連不上，改讀丙級「電工符號之辨識與電氣工程圖之瞭解」和乙級「工程識圖及繪圖」，搭配公開圖例製作紙面作品。",
  },
  publicOneLine: {
    label: "意象科技 Power Designer｜圖 22：公開低壓配電單線圖及負載表",
    href: "https://www.lifebook.com.tw/Services/tabid/3099/EntryId/838/.aspx",
    note: "意象科技 Power Designer 的公開展示圖。只核圖名、盤號和負載欄名稱，示意圖的數字不作專案設定。",
  },
  coordinationReview: {
    label: "台電｜特高壓用戶申請用電作業流程",
    href: "https://www.taipower.com.tw/media/in0d0qne/1130731%E7%89%B9%E9%AB%98%E5%A3%93%E7%94%A8%E6%88%B6%E7%94%B3%E8%AB%8B%E7%94%A8%E9%9B%BB%E4%BD%9C%E6%A5%AD%E6%B5%81%E7%A8%8B.pdf?mediaDL=true#page=4",
    note: "現版第 4 頁註二第 3、4 點。只辨識特高壓專案的送審文件、台電複核角色與更正紀錄。",
  },
  autoCad: {
    label: "Autodesk｜AutoCAD Electrical 電氣工具集",
    href: "https://www.autodesk.com/tw/products/autocad/included-toolsets/autocad-electrical",
    note: "核圖面元件資料、報表與材料表。",
  },
  revit: {
    label: "Autodesk｜Revit 盤表",
    href: "https://help.autodesk.com/cloudhelp/2026/ENU/Revit-DocumentPresent/files/GUID-3D2D0E77-ED17-4FBF-AAE4-CB9185A3F779.htm",
    note: "核盤、迴路與負載的表列功能。",
  },
  etap: {
    label: "ETAP｜保護裝置協調",
    href: "https://etap.com/packages/protective-device-coordination",
    note: "保護裝置選擇性、協調與模型分析。",
  },
} as const;

const surveyPay = {
  month: "114 年 7 月",
  engineerGroup: "電機、電子工程師",
  engineerPay: "新臺幣 75,649 元",
  repairGroup: "電力、電子、資通訊設備裝修人員（含水電工）",
  repairPay: "新臺幣 42,990 元",
  installationIndustry: "機電、管道及其他建築設備安裝業",
  installationEngineerPay: "56,811 元",
  installationRepairPay: "40,768 元",
} as const;

const powerDesignResponsibility =
  "電業設備或用戶用電設備的設計監造，在主管機關所定工程範圍內由依法登記執業的電機或相關專業技師辦理，範圍外由電機技師或合格電器承裝業辦理。工程若僅供政府機關或公營事業機構自用，可由該機關或機構內依法取得相應技師證書者辦理。";

const exerciseFixture = {
  equipmentId: "DP-01",
  approved: { version: "A", source: "核定圖冊", label: "商場配電盤", status: "核定基準" },
  pending: { version: "B", source: "承裝端送審稿", label: "租戶配電盤", status: "待複核" },
  missing: "原始自檢附件",
  inspectionOwner: "台電檢驗者",
} as const;

const exerciseVersions =
  `${exerciseFixture.equipmentId}：${exerciseFixture.approved.version} 來自${exerciseFixture.approved.source}，標示「${exerciseFixture.approved.label}」，為${exerciseFixture.approved.status}；${exerciseFixture.pending.version} 來自${exerciseFixture.pending.source}，標示「${exerciseFixture.pending.label}」，仍${exerciseFixture.pending.status}。`;

export const electricalElectriciansComparisonZhTwSpec: ModularComparisonSpec = {
  pairId: "electrical-engineers-vs-electricians",
  locale: "zh-TW",
  title: "電機工程師 vs 電工：臺灣工作內容、薪資與證照比較",
  shortTitle: "電機工程師 vs 電工",
  description: "在臺灣電機工程師和電工怎麼選？從廠務電機工程師、水電工程師、水電技術員到水電師傅，比較日常交付、薪資、技師簽證與技術士資格，再用台電表單做五分鐘紙面試做。",
  regionLabel: "臺灣",
  authorName: "費馬測試編輯部",
  datePublished: "2026-11-24",
  dateModified: "2026-11-24",
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: "商場要多開一家店，電機工程師先算整層樓的用電夠不夠，電工要能依核定圖把現場裝好，留下哪裡裝了什麼的紀錄。喜歡算需求、畫圖和解釋取捨，先看電機設計或廠務工程。喜歡對圖找現場差異、交可驗收的成果，先看水電技術員或水電師傅。想進半導體廠，可找廠務電機工程師或電力維護職務。「水電工程師」可能偏圖說協調，也可能偏帶班，先看要交圖說還是交施工紀錄。",
    roleA: {
      badgeTitle: roleA,
      riasecLabel: "霍蘭德 RIC",
      aliases: "搜尋職缺：電氣工程師、機電工程師、廠務電機工程師、水電工程師（先核交付）",
      keywords: "先核工作成果：負載計算、電力單線圖、保護協調、設計或變更審查",
    },
    roleB: {
      badgeTitle: roleB,
      riasecLabel: "霍蘭德 RCI",
      aliases: "搜尋職缺：水電師傅、水電技術員、水電工程學徒、半技工",
      keywords: "先核工作成果：配電盤施工、現場查修、自檢紀錄、竣工圖差異回報",
    },
    interviewBoundaryTitle: "同叫機電，面試先看會交出哪一份文件",
    interviewBoundaryQuestions: [
      "設計職：新人會從哪一張單線圖、負載表開始負責？哪位前輩逐項複核，有法定簽證的案子由誰簽？",
      "現場職：前三個月會看哪種案場的核定圖、做哪一類受指導工作？離場前交給誰的紀錄才算做完？",
    ],
    riasecBoundaryNote: "徽章是本站職業資料的興趣向量前三碼，供探索工作活動。錄用、執業資格與可授權的現場工作各有實際條件。",
  },
  topology: {
    title: "用電需求怎麼變成可驗收的配電",
    summary: "工程師把供電條件寫進圖說，施工人員把現場發現帶回去。商場增設、廠務改造與光電併聯的審查各依案型。",
    ariaLabel: "電機設計、圖說交接、施工自檢與竣工差異回報流程",
    leftZoneTitle: "電機工程師",
    leftSteps: [
      { title: "確認需求", detail: "用電負載、設備需求" },
      { title: "完成圖說", detail: "單線圖與保護協調" },
      { title: "複核修訂", detail: "確認設計變更與證據" },
    ],
    centerZoneTitle: "兩邊交接",
    upperBridge: { title: "圖說釋疑", line1: "圖號、版次", line2: "施工界面" },
    lowerBridge: { title: "差異回報", line1: "設備標示", line2: "缺件清單" },
    rightZoneTitle: "電工與現場團隊",
    rightSteps: [
      { title: "對照圖面", detail: "現場位置、設備標示" },
      { title: "施工自檢", detail: "按分工交組裝紀錄" },
      { title: "整理竣工", detail: "圖與紀錄一併交接" },
    ],
  },
  matrix: {
    title: "一天會做什麼？對照八種工作差異",
    summary: "臺灣職業標準分類把電機工程師與電子工程師分為兩個細類，也分列建築物電力系統裝修與電力機械裝修。投遞時按系統與交付物比對，水電也可包含給排水。",
    roleAColumn: roleA,
    roleBColumn: roleB,
    expandButtonLabel: "展開工具、入行與工作條件",
    collapseButtonLabel: "收合細項",
    rows: [
      {
        id: "deliverable", dimension: "每天交什麼", defaultVisible: true,
        roleA: "設計職核設備資料、比較不同負載與保護方案；把選型理由、假設及變更留在單線圖、負載表、設備規格和審圖紀錄。廠務職也會交維護計畫或異常分析。",
        roleB: "現場職從核定圖與施工大樣辨識設備和界面，按分工完成裝設或修繕，交設備標示、自檢紀錄與竣工圖差異。維護職交故障、修復與交班紀錄。",
      },
      {
        id: "construction", dimension: "建築機電與公共工程", defaultVisible: true,
        roleA: `機電顧問與營造團隊交圖說、算量與複核。水電工程師的職缺若主要帶班或處理工班介面，就和以計算書、送審圖說為主的設計職分開看。臺南有雇主以「廠務水電工程專員」刊登裝設與維修職缺，正好可用來比對。六層以上建築物用電設備列入主管機關所定範圍。${powerDesignResponsibility}`,
        roleB: "登記承裝業的現場團隊先核工作範圍，再做設備安裝、現場點檢及缺失改善。報竣工由施工承裝業或監造者依案準備，台電檢驗送電另有明確窗口。",
      },
      {
        id: "semiconductor", dimension: "半導體廠務與自動化", defaultVisible: true,
        roleA: "廠務電機工程師核高低壓系統的可靠度、備援與新設備接入；儀電廠務也可碰 PLC、HMI 或 SCADA。先問職缺主要看盤表與改善案，還是主要守現場。",
        roleB: "公開的科技廠房學徒／半技工職缺曾列分電盤與照明工作。廠內維護另可碰馬達控制中心、設備巡檢、無塵室進出及輪班，交班要記設備狀態和未結事項。",
      },
      {
        id: "service-pv", dimension: "住宅、商場與太陽光電", defaultVisible: true,
        roleA: "住宅與商場改造可碰用電需求評估及各工種協調。光電工程師會看案場併網界面、圖說、設備條件與送審資料，並整理變更對原設計的影響。",
        roleB: "物業水電技術員可分擔照明、配電與其他機電設施巡檢。光電維運要交設備標示差異、異常與修復紀錄。遇到新增施工，先核公司登記的承裝範圍，再查個人資格及案場指派。",
      },
      {
        id: "authority", dimension: "誰把關、誰簽名", defaultVisible: true,
        roleA: "內部按指派跑設計審查，法定簽證需核科別、執業執照及範圍。簽證技師對本人或監督完成的工作負責，涉及現場作業要親自實地查核。",
        roleB: "依雇主與案場授權完成工作。承裝業、現場人員與用戶端專任電氣技術人員各有資格要求。台電的供電判定由台電辦理。",
      },
      {
        id: "tools", dimension: "工具與判斷", defaultVisible: false,
        roleA: "AutoCAD Electrical 可整理電氣圖面資料，Revit BIM 盤表把迴路與負載連到模型，ETAP 可比較保護協調。模型輸入、暫定值和圖面版次仍要逐一追到原資料。",
        roleB: "核圖時看施工大樣、設備標籤、現場自檢表、工單或交班紀錄。能把圖面與設備的同一識別對起來，下一位接手的人才知道看哪裡、哪些資料尚待查。",
      },
      {
        id: "entry", dimension: "入行與轉向", defaultVisible: false,
        roleA: "電機、機電等背景可先從電路、電力與控制基礎切入。想補轉職作品，交一張含可追溯負載及變更紀錄的圖，比只交漂亮模型更能解釋你的判斷。",
        roleB: "可從有正式帶訓的助理或學徒工作了解現場。按目標職選室內配線或工業配線，再核報檢等級與受僱施作要求。往帶班走時要能說明工序介面與缺失回報。",
      },
      {
        id: "friction", dimension: "半年後最容易卡在哪", defaultVisible: false,
        roleA: "預算、施工空間及用電需求可能撞在一起。若連續改版、面對客戶和包商追問或出差到場讓你耗竭，先確認自己接受的是設計協調還是廠務值班。",
        roleB: "工地、商場夜間窗口和科技廠班別的體力與生活代價不同。若對搬運、狹小空間或睡眠調整敏感，先看正式工時表、帶訓和班內工作分配。",
      },
    ],
  },
  incident: {
    title: "商場增設用電，竣工圖差異要交給誰？",
    summary: "情境模擬：租戶準備開店，承裝班組回報設備標示與核定圖面有出入。工程師判斷版次，電工留下可追查的差異。",
    triggerLabel: "同一面盤，記錄出現兩個版本：",
    triggerBody: "送審單線圖已被列為有效基準；承裝側的現場照片只證明標示有差異，尚缺和竣工版對得上的證據。團隊先把未核項記進清單，保留原基準及回報來源。",
    triggerCaveat: "依職安法及設施規則，雇主須管控電氣危害。停電、檢電、適用的接地及上鎖掛牌措施，由合格人員依案場授權負責。",
    rows: [
      {
        stage: "先定位差異", roleLabel: "承裝班組／電工", tone: "roleB",
        verifiedFacts: "能對到原施工範圍與設備標示，交出現場資料和拍攝時間。",
        openGaps: "標示異動是否牽涉設備型式或保護條件，現場回報尚無法確定。",
        actionAndApproval: "在差異表記原圖版次、設備位號和現場證據，交承裝業工地負責人及監造窗口確認後續文件。",
      },
      {
        stage: "再釐清設計影響", roleLabel: "電機工程師／監造", tone: "roleA",
        verifiedFacts: "有設計單位內部複核版及現場差異紀錄，可逐一比對版次。",
        openGaps: "先比對原審圖說和現場差異，核對是否改了設備型式、設計依據或應簽證的部分，再列出待複核的頁面。",
        actionAndApproval: "工程師列修訂建議與影響，交本案指定設計或監造負責人複核。依法須簽證的項目由具相應執業資格的技師簽。",
      },
      {
        stage: "報竣工與檢驗", roleLabel: "承裝業／監造及台電", tone: "roleB",
        verifiedFacts: "申報側整理圖面、差異及自檢紀錄，台電依適用規定審查與檢驗。",
        openGaps: "台電檢驗欄與核定結果仍未完成時，狀態只能記待核。",
        actionAndApproval: "施工承裝業或監造者依案申報。台電派員檢驗並依其程序核定送電；有改修要求則登錄未結事項與複檢結果。",
      },
    ],
    recoveryAcceptanceTitle: "什麼時候才算交完？",
    recoveryAcceptanceCriteria: "可追到最新版圖、每項差異的處理與責任人、自檢證據和按案需要的簽證或審查。台電檢驗送電結果另依其正式紀錄。業主或契約要求的工程驗收另行完成，未結事項須能追到負責窗口。",
    defenseLayerNote: "把設計複核或法定簽證、承裝業或監造端的自檢與報竣、台電檢驗分開記。",
  },
  payAndCerts: {
    title: "怎麼看薪資？證照在哪些工作真的用得到？",
    summary: "公司可用「電機工程師」招維護人員，也可用「水電工程師」招帶班技工。先看工作責任，再查薪資項目及證照用途。",
    salaryHeading: "拿同一張臺灣薪資表看市場，再拿同城同級條件比工作",
    salaryBody: `做機電安裝業的工程職，別直接拿全臺工程師平均值算起薪。勞動部職類別薪資調查（PSDN）表 3 顯示，${surveyPay.month}全體工業及服務業全時受僱員工的平均經常性薪資，${surveyPay.engineerGroup}為${surveyPay.engineerPay}，${surveyPay.repairGroup}為${surveyPay.repairPay}。表 8 只看營建工程業裡的「${surveyPay.installationIndustry}」同兩職類，依序為每月新臺幣 ${surveyPay.installationEngineerPay}與 ${surveyPay.installationRepairPay}。兩表以同月全時受僱人員觀察固定月給，包含本薪、固定津貼及按月固定獎金。職類是合併發表組，無法精確算出同城、同年資的電機工程師和水電師傅相差多少。

科技廠務要拆底薪、定額輪班津貼、績效獎金與分紅，招募文件寫「保 14」時，核清額外兩個月是否只按本薪計算，以及有沒有到職日或在職條件。機電顧問和營造工程職比月薪時，要另列專案獎金、駐場或交通給付，避免把一次性收入當固定月薪。水電工作若採日薪、點工或按件計酬，分開看保證工日、夜間叫修、待命和加班怎麼算。獨立承攬用案價扣材料、人力及外包估毛利，再預留保固、空檔及收款風險；毛利和受僱薪資得分開比。

拿到同城、相近年資的兩份錄取條件，先將月本薪與每項固定津貼各自乘上書面保證發放次數，再加總成年度金額。若聘書只保證多發兩個本薪月，就只多計兩個月本薪。分紅、加班、待命與可能的工日變動另列。把通勤、跨點、夜班和可休假日換成同一工時口徑。設計職核定級是否看獨立編製負載表、處理變更或依法簽證；水電職核是否從讀圖、自檢往帶班發展。如果聘書有證照加給，確認哪張證、是否須實際登記或擔任指定職務，以及每月保證金額。`,
    certs: [
      {
        name: "電機工程技師",
        officialScope: "考選部專技高考電機工程類科。法定案件按技師法及相關規則核科別、執業方式、有效執業執照與公會。是否須設計、監造或簽證，還要看案型適用規定。",
        workplaceBoundary: `受僱工程師可依分工準備圖說。${powerDesignResponsibility}`,
        verificationTips: "核應考與執業條件，再看職缺能否參與底稿及現場查核。",
        officialLinks: [
          { label: "專技高考技師規則", href: sources.licenseExam.href },
          { label: "技師法", href: sources.professional.href },
          { label: "電業法與設計監造分工", href: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=J0030011&flno=61" },
          { label: "設計監造範圍", href: sources.designScope.href },
        ],
      },
      {
        name: "室內配線與工業配線技術士",
        officialScope: "室內配線（屋內線路裝修）與工業配線是不同職類，分別設甲、乙、丙級。查當年度級別及梯次。115 年度全國檢定未辦工業配線甲級。",
        workplaceBoundary: "一邊對應用戶屋內線路技能，另一邊側重工業設備與控制。兩類可依規則成為承裝業的合格人員資格之一；需同時查等級、受僱條件及工作授權。",
        verificationTips: "目標是建築水電，優先讀室內配線；目標是設備控制或盤廠，先對照工業配線與設備商的實際要求，再決定花時間考哪張。",
        officialLinks: [{ label: "全國技術士技能檢定簡章", href: sources.skills.href }],
      },
      {
        name: "電器承裝業四級登記",
        officialScope: "甲專級管特定電業配電外線工程；甲級管除甲專項目外的電業供電及用戶用電設備；乙級限相應低壓範圍；丙級限低壓單相受電的用戶設備。",
        workplaceBoundary: "甲級至少僱一名電機技師、乙級以上室內配線／工業配線技術士或合格甲種電匠，再僱至少三名電機技師、丙級以上室內配線／工業配線技術士或合格甲、乙種電匠。乙級同樣先僱一名符合前一組資格者，再僱至少一名符合後一組資格者。丙級至少僱一人，例如電機技師、丙級以上室內配線／工業配線技術士或合格甲、乙種電匠。同組還可列計各該條明列的其他職類，登記時檢附相應證明。第 9 條的裝設維修例外不直接計入登記人數。",
        verificationTips: "把公司登記等級、職務會碰的工程和個人資格逐項比對。專任電氣技術人員另屬特定用電場所管理，不能當成承裝登記級別使用。",
        officialLinks: [
          { label: "電器承裝業管理規則全文", href: sources.contractor.href },
          { label: "第 7 條｜乙級承裝業登記", href: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=J0030054&flno=7" },
          { label: "用電場所及專任人員規則", href: sources.facilityStaff.href },
        ],
      },
    ],
    interviewChecklistTitle: "拿到聘用條件後，核這四個會影響決定的細節",
    interviewChecklistQuestions: [
      { label: "設計職的第一個成果", question: "第一季會跟著做自己的負載表或設計變更單嗎？誰看得見你的工作，誰負責複核與簽署？" },
      { label: "施工與維護的學習範圍", question: "什麼階段開始讀圖、整理自檢與差異紀錄？進一步施作前會核哪些資格及現場授權？" },
      { label: "考證後的實際用法", question: "證照用於招募、合格用人或簽證？相關津貼、聘任或職等有寫進聘用條件嗎？" },
      { label: "不同工時計算方式", question: "保證收入裡計了哪些固定給付？夜班、叫修、駐場、外縣市交通與待命分別怎麼計，有沒有最低保障？" },
    ],
  },
  thirtyDayPlugin: {
    badge: "四週作品",
    title: "30 天累積四件能複核的機電作品",
    summary: "從下面選一軌。按文末「四週作品公開材料」和台電表單找到圖件，再用紙筆做四件作品。每件標記來源、版次或頁碼、待核項目與接手角色。全程只做紙面文件識讀，零通電、零操作、不到現場。",
    tracks: [
      {
        id: "design", title: "設計與廠務工程", badge: "電機工程師", tone: "roleA",
        weeks: [
          { weekLabel: "第一週", deliverable: "交一頁圖審資料索引。用台電《配電場所圖審所需檢附資料》把屋內配電場所和屋內線路分欄，標出配置平面圖、剖面圖和單線系統圖及負載表各歸哪一欄，並註記哪項須先確認地下室條件。PDF 若暫時打不開，用這份摘要起草：屋內配電場所列樓層平面圖與剖面圖，配電場所在地下層還要核地面出入口防水閘門圖；屋內線路列單線系統圖與負載表。" },
          { weekLabel: "第二週", deliverable: "交單線圖與負載表讀圖卡。看意象科技 Power Designer 公開圖 22，把盤號和兩個負載名稱與圖表位置對起來，標明每一項在哪一處可回查。不清楚的欄位標待核，數值不抄作工程設定。" },
          { weekLabel: "第三週", deliverable: "交保護協調證據清單。以台電《特高壓用戶申請用電作業流程》現版的設計資料審查說明作參考。PDF 若暫時打不開，可用備援欄位：單線系統圖、保護協調資料、台電的審查註記或更正紀錄。這份流程依設備類型區分審查單位，由配電處彙整其收件案，逕送區營業處的案件由區處辦理。拿只有公開展示圖的獨立練習包，分別標「可見」或「待補」，寫資料版次和複核角色。低壓展示圖只用來練分類，不沿用特高壓的送審要求。" },
          { weekLabel: "第四週", deliverable: "交變更複核包。用台電圖審清單（或第一週的資料摘要）及模擬修訂單「單線圖更新設備標示，負載表、複核欄仍是舊版」，做一頁版次清冊和待辦。驗收時能指出哪兩處要回查、誰負責複核、目前是否具備核發證據。" },
        ],
      },
      {
        id: "field", title: "裝設與維運交接", badge: "電工", tone: "roleB",
        weeks: [
          { weekLabel: "第一週", deliverable: "交術科紙面讀圖卡。從技能檢定中心職類 00700 公開應檢資料各選一份乙級與丙級圖面，記級別、版次與圖名，圈出兩個能回查的圖例或標示。下載不通時，改用 00700 技能檢定規範各級第一項和意象科技 Power Designer 公開圖 22，註明替代來源。只識讀圖面。" },
          { weekLabel: "第二週", deliverable: "交低壓竣工表欄位對照。看台電檢驗要點附件四表 A 的正反面，逐項標出申報資料、電表裝置及檢驗紀錄所在頁面和填寫角色，並把檢驗結果留白。表件暫時打不開時，可用五分鐘試做的官方表單摘要起草。" },
          { weekLabel: "第三週", deliverable: "交現場差異與交班紀錄。參照台電竣工表或五分鐘試做的表單摘要所列分工，處理三筆模擬狀態「設備標示已回報、佐證照片未收到、監造未回覆」。逐筆記來源、狀態及下一手，讓接班者知道哪些還不能結案。" },
          { weekLabel: "第四週", deliverable: "交模擬報竣文件包。查台電原函附件四的竣工報告清單及表 A 正反面。模擬條件：低壓用戶，無自備變電所、非裝置契約、未增設充電設備，本案也未由電機技師辦理。手上只有已確認版次的竣工圖，表 A 與自檢佐證尚待補。索引逐件記檔名、版次、提供者與狀態，區分「缺件」「本案免附」及「由台電填寫」。原函一時打不開，可用這份摘要起草：低壓竣工報告單與完整竣工圖須列入，表 C 和表 D 依案型核，表 A 背面的電表裝置及檢驗紀錄留台電。只做紙面索引，不遞件。" },
        ],
      },
    ],
  },
  checklist: {
    title: "你願意磨哪種技能？哪些工作條件接受得了？",
    summary: "技能欄勾你想學或已有材料可證明的工作，條件欄勾你能長期接受的安排。兩欄分開看，挑最能影響投遞決定的問題去驗證。",
    skillsHeading: "技能｜你想做出的成果",
    skillsOptions: [
      { id: "design-basis", track: "roleA", label: "用同一組負載解釋兩個方案", summary: "比較設備限制、假設來源和改版後受影響的頁面。", interviewQuestions: ["團隊如何複核負載表？哪份變更紀錄會回答選型理由？"] },
      { id: "revisions", track: "roleA", label: "把圖面版本和設備規格對起來", summary: "看迴路、盤表、保護協調和圖面變更怎樣交接。", interviewQuestions: ["設計的版次由哪套系統控管？誰確認現場用的是核定版本？"] },
      { id: "trace-marking", track: "roleB", label: "找得到圖和現場設備的同一辨識鍵", summary: "用位號、圖號與紀錄讓下一位少跑一次。", interviewQuestions: ["施工圖有差異時，怎麼記到竣工圖？缺件由誰追？"] },
      { id: "handover-evidence", track: "roleB", label: "寫得出下一班可接手的交班單", summary: "清楚區分已核、未核與交給誰處理。", interviewQuestions: ["可以看一份去識別的交班材料嗎？包含哪兩項必填欄位？"] },
    ],
    conditionsHeading: "條件｜你願意交換哪些時間和體力",
    conditionsOptions: [
      { id: "revision-pressure", track: "roleA", label: "接受截稿前反覆協調改圖", summary: "時間用在解釋設計取捨、配合工種和追會議結論。", interviewQuestions: ["圖面如需改版，誰統整跨工種意見、何時凍結？"] },
      { id: "on-call", label: "可配合夜間窗口、輪班或待命", summary: "設備維運與施工窗口可能影響週末、睡眠和交通。", interviewQuestions: ["一個排班週期怎麼分？叫修是駐點還是接通知到場？"] },
      { id: "sites", track: "roleB", label: "能接受按案場移動和現場體力負荷", summary: "住商維護、科技廠、工地與屋頂光電有不同進出和工作環境。", interviewQuestions: ["有多少案場需跨點？新人是否有搬運協助、教育訓練和陪同？"] },
      { id: "consistency", label: "想在同一套系統把故障樣態研究透", summary: "留在固定廠區可深追一套設備，跨點工作能看到多種系統。", interviewQuestions: ["工作範圍以固定系統為主，還是跨據點服務？誰負責改善結案？"] },
    ],
    defaultInterviewQuestions: [
      "最快何時能從觀摩走到一項可交付的工作？前輩怎麼複核？",
      "工時與工作地點最常因什麼改變，誰協調臨時工項與待命？",
    ],
    crossTrackNote: "兩邊的技能都吸引你，可以查廠務電力或設備整合職缺。若工作條件出現明顯摩擦，再按日班、固定據點或專案型條件縮小範圍。",
    offlinePrintHint: "列印後把各欄最想確認的一項圈起來，投遞前帶著兩項核對。",
  },
  desktopExercise: {
    sectionTitle: "五分鐘試做｜你要回報圖版，還是交接缺件？",
    summary: "任選設計或現場一軌，用下面的紙面卡寫三行。題目借用台電公開表件的文件與責任欄位，商場和版次為模擬。全程只讀資料與寫紙面文字，無通電、無登高、不到現場，也不用電工工具。",
    publicLinksHeading: "兩份公開原件：",
    publicLinks: [sources.drawings, sources.lowVoltageForm],
    factSummaryHeading: "可離線重做的欄位卡：",
    factSummarySegments: [
      { text: "官方表單摘要。圖審資料列單線系統圖；低壓竣工表的正面是申報資料，背面電表裝置及檢驗紀錄由台電檢驗者填，施工側相關資料由承裝業或監造者處理。", tone: "strong" },
      { text: `模擬卡一和卡二是同一設備的兩個版本。${exerciseVersions}B 版缺複核紀錄。` },
      { text: `模擬卡三是交接紀錄。${exerciseFixture.equipmentId} 已列在自檢表，${exerciseFixture.missing}缺件，台電檢驗欄仍空白。` },
    ],
    taskA: {
      title: "設計軌｜寫三行複核便條",
      instruction: "寫同一位號的兩版來源、標示和狀態。指出標示差異與複核缺件，寫出複核窗口和要補的對照證據，並註明台電檢驗欄的狀態與填寫人。",
    },
    taskB: {
      title: "現場軌｜寫三行交班便條",
      instruction: "寫同一位號的兩版來源、標示和狀態。指出自檢缺哪份附件、交誰補齊，並註明台電檢驗欄的狀態與填寫人。",
    },
    rubricTitle: "展開核對條件及雙軌樣答",
    rubricHeading: "每軌四個核對點",
    rubricPassRule: "兩個共用點加所選軌兩點。四點都能從便條找得到，就完成這軌。",
    rubricItems: [
      "共用｜兩版各寫對位號、來源、標示與核定狀態。",
      "共用｜台電檢驗欄仍待查，交由台電檢驗者填。",
      "設計｜指出兩版標示不同，B 缺複核紀錄。",
      "設計｜點名設計或監造複核，列出需補的對照證據。",
      "現場｜指出同一位號的原始自檢附件缺件。",
      "現場｜交承裝負責人或監造窗口補齊，缺件狀態寫清楚。",
    ],
    sampleAnswerALabel: "設計軌樣答：",
    sampleAnswerA: `${exerciseVersions}兩版標示不同，B 缺複核紀錄，請設計負責人與監造補複核及現場標示對照件。台電檢驗欄記待查，由${exerciseFixture.inspectionOwner}填。`,
    sampleAnswerBLabel: "現場軌樣答：",
    sampleAnswerB: `${exerciseVersions}${exerciseFixture.missing}缺件，交承裝負責人補齊，轉監造核對。台電檢驗欄記待查，由${exerciseFixture.inspectionOwner}填。`,
  },
  tools: {
    title: "選一個下一步，把觀察變成投遞條件",
    summary: "按目前的決定選用職業對比、工作表、興趣或工作方式工具。",
    cards: [
      { id: "compare", badge: "兩個方向", meta: "雙職業對比", tone: "roleA", title: "換成眼前想投的兩個職業", description: "例如比較電機工程師和機電技術方向，找到各自的任務重心和應補條件。", purposeHint: "已有兩個候選，想查差異。", ctaLabel: "前往職業對比", href: "/zh-TW/career/compare" },
      { id: "worksheet", badge: "記一個行動", meta: "探索工作表", tone: "neutral", title: "記下面試要問的工作證據", description: "把一項想看的交付物、一項可接受的工作條件和下一個行動整理成可帶走的工作表。", purposeHint: "有方向，想留下紀錄。", ctaLabel: "打開我的工作表", href: "/zh-TW/career/interest-worksheet#my-worksheet" },
      { id: "holland", badge: "工作興趣", meta: "霍蘭德 60 題", tone: "accent", title: "先看哪些日常活動吸引你", description: "用六個興趣面向與三字碼整理你願意多做的活動，再用真實工作內容驗證。", purposeHint: "方向還沒定，想整理興趣。", ctaLabel: "開始霍蘭德職業興趣測試", href: "/zh-TW/tests/holland-career-interest-test-riasec" },
      { id: "career94", badge: "工作方式", meta: "職業測試 94 題", tone: "roleB", title: "檢查自己在乎的工作條件", description: "用工作活動、工作方式和工作條件的問題，整理你在輪班、責任和協作上的偏好。", purposeHint: "工作有吸引力，想核對環境。", ctaLabel: "前往職業測試", href: "/zh-TW/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "分開讀兩個職業檔案",
    profileLinks: [
      { label: "電機工程師職業檔案", href: "/zh-TW/career/jobs/electrical-engineers" },
      { label: "電工職業檔案", href: "/zh-TW/career/jobs/electricians" },
    ],
  },
  faqs: [
    {
      id: "is-electrician-engineer",
      question: "水電工程師、電機工程師和電工怎麼從職缺辨認？",
      answer: "看要交的文件及對誰負責。職缺要求核負載、整理單線圖、評估配置或提變更建議，偏設計或工程協調。要求看施工圖、安裝修繕、自檢或交班，偏現場裝設維護。廠務和統包職有重疊，最能辨認的是新人第一季主要成果與複核人。",
    },
    {
      id: "engineer-signoff",
      question: "在臺灣，做電機工程師一定要先考電機工程技師嗎？",
      answer: `一般受僱職可依雇主條件應徵。${powerDesignResponsibility}公共工程另核案型與簽證項目。`,
    },
    {
      id: "apprentice-and-license",
      question: "從水電學徒開始，室內配線丙級能直接接案嗎？",
      answer: "可以把室內配線丙級當建築水電的學習和求職起點；接需要承裝資格的工程時，須有依法登記且級別相符的承裝業，實際裝設或維修也有合格人員要求。沒有經驗可先找有正式帶訓的職缺，確認可做的工項。若想做盤廠與設備控制，再核工業配線職類。",
    },
    {
      id: "pay-structure",
      question: "電工日薪和電機工程師月薪，哪一份工作比較值得選？",
      answer: "先比有保證的報酬，再比浮動收入和時間。工程職先算本薪和各項固定津貼各自保證發幾次，再加總全年金額。「保 14」若只按本薪計，固定津貼仍按各自的書面發放次數。分紅和績效依條件另列；日薪職以保證計薪日乘日薪，夜班、件數、待命及加班按書面規則另算。接案案價先扣直接成本，毛利還要支付管理、保固與空檔。想看半年後的定級，設計職若只依指示描圖，碰不到負載假設、版本審查或差異回覆，就按繪圖支援職評估。現場職看能否由打雜走到自檢、交件或帶班。證照只有在聘用把證書或責任列進職等和加給時才支持具體差額。拿同城、同資歷的聘用條件，最後按實際工時、休假、跨點和通勤重算。",
    },
    {
      id: "fab-work-style",
      question: "想進半導體廠，該投廠務電力工程師還是水電維護？",
      answer: "想追高低壓配電的可靠度、新機台接入或公用電力改善，就先看廠務電力工程師。想做定期點檢、異常回報和現場交班，可比較設備維護、駐廠技術員或承裝商。看到 PLC 或 SCADA 要讀下一行，是看趨勢和警報、整理備份，還是需要提出修改並走審查；可執行的工作和留守安排也要落在書面分工。",
    },
    {
      id: "solar-boundary",
      question: "做太陽光電，電機工程師和電工會在哪裡分工？",
      answer: "如果職務要核併網界面、設備圖說、設計變更與送審文件，偏光電設計或專案工程；要依圖整理設備、追查異常、保留維護證據，偏裝設或維運。案場會依適用條件辦理併聯試運轉，台電按案審查併聯界面與相關文件。到職前以案型、承裝級別和工作授權核實責任。",
    },
    {
      id: "automation-2026",
      question: "2026 年，電氣軟體或 AI 可以幫工程師和電工做哪些工作？",
      answer: "工具可以先整理可規則化的圖面資料、算量或材料表，人工負責核對圖面版次、實物和法定權責。AutoCAD Electrical 可依圖面元件資料整理材料表，Revit BIM 可列盤、迴路和負載，ETAP 可依模型比較保護裝置協調。草稿或 AI 摘要仍須回原始圖說和設備資料複核。現場是否與圖相符、自檢紀錄是否可信、依法簽證與檢驗是否完成，仍由相應人員判斷並留紀錄。",
    },
  ],
  sourceGroups: [
    { id: "statistics", title: "臺灣職類與薪資口徑", links: [sources.jobClass, sources.payMethod, sources.payTable, sources.sectorPay, sources.payPortal] },
    { id: "qualifications", title: "臺灣設計、監造與承裝資格", links: [sources.licenseExam, sources.professional, sources.electricityAct, sources.designScope, sources.publicWorks, sources.skills, sources.contractor, sources.facilityStaff] },
    { id: "taipower", title: "用電裝置、職安、台電送審與併網", links: [sources.operation, sources.workplaceSafety, sources.safetyRules, sources.applyPower, sources.drawings, sources.inspectionRegulation, sources.inspection, sources.lowVoltageForm, sources.pv] },
    { id: "recruitment", title: "臺灣職能與徵才樣本", links: [sources.engineeringJob, sources.electricalPlantJob, sources.apprenticeJob, sources.scadaJob, sources.cleanRoomJob, sources.shiftJob, sources.fieldJob, sources.retailJob, sources.apprenticeJobAlternate, sources.facilityWaterElectricalJob, sources.skillsStandard] },
    { id: "portfolio-materials", title: "四週作品公開材料", requiresPlugin: "thirtyDay", links: [sources.wiringReference, sources.wiringCompetencies, sources.publicOneLine, sources.coordinationReview] },
    { id: "software", title: "電力設計軟體原廠說明", links: [sources.autoCad, sources.revit, sources.etap] },
  ],
};
