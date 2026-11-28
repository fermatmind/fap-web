import type { ModularComparisonSpec } from "../modularComparison";

const roleA = "法遵經理";
const roleB = "法規事務經理";

const sources = {
  payMethod: {
    label: "勞動部｜114 年職類別薪資調查統計結果",
    href: "https://www.mol.gov.tw/1607/1632/1633/90814/",
    note: "讀附錄的全時受僱範圍，以及七月經常性薪資與前一年度薪資所得定義。全年薪資所得排除加班費等。",
  },
  payOverall: {
    label: "勞動部｜正式報告表 3：全體",
    href: "https://statdb.mol.gov.tw/html/s3/svy14/1435003.ods",
    note: "中階主管（經理），第 8 列 B 至 D 欄。",
  },
  payFinance: {
    label: "勞動部｜正式報告表 13：金融及保險業",
    href: "https://statdb.mol.gov.tw/html/s3/svy14/1435013.ods",
    note: "中階主管（經理），總計欄，第 9 列 B 至 D 欄。",
  },
  payPharma: {
    label: "勞動部｜正式報告表 5：製造業",
    href: "https://statdb.mol.gov.tw/html/s3/svy14/1435005.ods",
    note: "藥品及醫用化學製品製造業，中階主管（經理），第 9 列 AN 至 AP 欄。",
  },
  bankControl: {
    label: "金融控股公司及銀行業內部控制及稽核制度實施辦法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0380218",
    note: "G0380218，第 9、13、16 至 19、42、51、53 至 55 條。2026 年修正設有制度調整期限，部分條文另行施行。",
  },
  bankOfficer: {
    label: "銀行負責人應具備資格條件兼職限制及應遵行事項準則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0380045",
    note: "G0380045。第 5 條列銀行副總經理等的適任途徑。",
  },
  holdingOfficer: {
    label: "金融控股公司發起人負責人應具備資格條件負責人兼職限制及應遵行事項準則",
    href: "https://law.fsc.gov.tw/LawContent.aspx?id=FL006632",
    note: "第 6 條列金控副總經理等的適任途徑。",
  },
  bankExceptions: {
    label: "金管會｜115 年 8 月 10 日內控內稽辦法解釋令",
    href: "https://law.fsc.gov.tw/LawContent.aspx?id=GL004308",
    note: "GL004308 僅適用票券金融公司。按規模區分法遵長層級及兼職。",
  },
  amlLaw: {
    label: "洗錢防制法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0380131",
    note: "G0380131。第 8 條核客戶與實質受益人審查，第 10 條核紀錄，第 13 條核疑似洗錢交易申報。",
  },
  amlRule: {
    label: "金融機構防制洗錢辦法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0380252",
    note: "G0380252，第 3、5 條。核金融機構客戶辨識和持續審查。",
  },
  listedControl: {
    label: "公開發行公司建立內部控制制度處理準則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0400045",
    note: "G0400045，第 2、7 至 10 條，核適用範圍、採購付款及角色。",
  },
  ethics: {
    label: "證交所｜上市上櫃公司誠信經營守則",
    href: "https://twse-regulation.twse.com.tw/TW/law/DAT08_print.aspx?FLCODE=FL055768",
    note: "第 7、10、23 條分別參照風險、反貪腐、檢舉與保密。",
  },
  bankCase: {
    label: "金管會｜信用卡疑義帳款裁罰說明",
    href: "https://www.cip.gov.tw/zh-tw/news/data-list/EF33C0A18B5B5623/0747E487E929081EE30A90A0C0814788-info.html",
    note: "原民會轉載金管會發布內容，定位在缺失及改善要求。",
  },
  device: {
    label: "醫療器材管理法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0030106",
    note: "L0030106，第 15、22、25 至 29、33、40 至 41 條。核技術人員、製造品質、用途變更、標示及廣告。",
  },
  devicePermit: {
    label: "醫療器材許可證核發與登錄及年度申報準則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0030128",
    note: "L0030128，第 2、3、6 至 8、13 至 16、20 至 22 條及附表二、四。",
  },
  deviceTech: {
    label: "醫療器材技術人員管理辦法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0030113",
    note: "L0030113。第 5 條是輸入技術人員資格，製造及維修另核各該條。",
  },
  deviceQms: {
    label: "醫療器材品質管理系統準則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0030116",
    note: "L0030116。讀流程與文件管制、紀錄及變更。",
  },
  deviceApproach: {
    label: "食藥署｜醫療器材許可證申請方式",
    href: "https://www.fda.gov.tw/tc/siteContent.aspx?sid=11638",
    note: "看是否列管、分類分級和類似品三項；核定本形式另看新公告。",
  },
  deviceLabel: {
    label: "食藥署｜醫療器材標籤與說明書擬稿",
    href: "https://www.fda.gov.tw/tc/siteContent.aspx?sid=11657",
    note: "看欄位及電子核定本說明。",
  },
  mdsap: {
    label: "食藥署｜國外醫療器材製造廠 QSD 申請",
    href: "https://www.fda.gov.tw/Tc/siteContent.aspx?sid=11585",
    note: "注意事項第 1、2 點。日本廠簡化模式所用 MDSAP 報告有條件。",
  },
  drug: {
    label: "藥事法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0030001",
    note: "L0030001，第 29、39、44、46 至 48-1 條。製造監製、藥品仿單及變更。",
  },
  drugReview: {
    label: "藥品查驗登記審查準則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0030057",
    note: "L0030057。依產品類型核原料、品質、試驗和技術文件。",
  },
  drugTrial: {
    label: "藥品優良臨床試驗作業準則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0030056",
    note: "L0030056。區分試驗主持人、委託者及監測各自的文件與責任。",
  },
  ectd: {
    label: "食藥署｜藥品 eCTD 與驗證指引",
    href: "https://www.fda.gov.tw/TC/siteListContent.aspx?id=49888&sid=3300",
    note: "衛授食字第 1141417276 號公告。R2.1 與 V-R2.1 自 2026 年 7 月 1 日生效。",
  },
  gmp: {
    label: "食藥署｜藥品製造工廠 GMP",
    href: "https://www.fda.gov.tw/tc/faqContent.aspx?cid=&id=1037&pn=1",
    note: "查西藥 PIC/S GMP 與製造工廠評鑑。",
  },
  society: {
    label: "台灣醫藥品法規學會 TSRAP",
    href: "https://www.tsrap.org.tw/",
    note: "學術交流及法規研習。",
  },
  rac: {
    label: "RAPS 台灣分會｜RAC",
    href: "https://www.raps-in-taiwan.org.tw/rac.asp",
    note: "專業認證與研習資訊，法定資格另照臺灣制度。",
  },
  aiLaw: {
    label: "人工智慧基本法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0160093",
    note: "H0160093，第 4 條。2026 年公布的政府 AI 推動原則含人工監督與資料治理。",
  },
  bankAi: {
    label: "金管會｜金融業運用人工智慧指引",
    href: "https://www.fsc.gov.tw/websitedowndoc?file=chfsc%2F202408231741530.pdf&filedisplay=%E9%99%84%E4%BB%B6_%E9%87%91%E8%9E%8D%E6%A5%AD%E9%81%8B%E7%94%A8AI%E6%8C%87%E5%BC%95.pdf",
    note: "看治理、問責、風險分級、人工監督及生成式 AI 資訊管理。",
  },
  deviceAi: {
    label: "食藥署｜人工智慧醫療器材優良機器學習實務",
    href: "https://www.fda.gov.tw/TC/siteListContent.aspx?id=50868&sid=310",
    note: "2026 年 6 月 8 日公告。涵蓋產品設計、資料集、臨床評估與上市後監控。",
  },
  ethicsGuide: {
    label: "證交所｜誠信經營作業程序及行為指南",
    href: "https://twse-regulation.twse.com.tw/TW/law/DAT0201.aspx?FLCODE=FL061646",
    note: "四週法遵軌用利益迴避及檢舉條文。",
  },
  amlReview: {
    label: "金管會｜114 年上半年防制洗錢及打擊資恐主要查核缺失",
    href: "https://www.fsc.gov.tw/userfiles/file/114%E5%B9%B4%E5%BA%A6%E4%B8%8A%E5%8D%8A%E5%B9%B4%E9%98%B2%E5%88%B6%E6%B4%97%E9%8C%A2%E5%8F%8A%E6%89%93%E6%93%8A%E8%B3%87%E6%81%90%E4%B8%BB%E8%A6%81%E6%9F%A5%E6%A0%B8%E7%BC%BA%E5%A4%B1.pdf",
    note: "四週法遵軌用實質受益人辨識與驗證缺失。備援見作品文字。",
  },
  deviceForms: {
    label: "食藥署｜第二、三等級醫療器材查驗登記表單",
    href: "https://www.fda.gov.tw/TC/siteList.aspx?pn=1&sid=11603",
    note: "四週法規軌用形式審查查檢表與標籤／說明書表。",
  },
} as const;

const pay = {
  month: "114 年 7 月",
  year: "113 年全年",
  overall: { month: "98,774", year: "162.5" },
  finance: { month: "148,562", year: "298.9" },
  pharma: { month: "95,456", year: "140.3" },
} as const;

const exercise = {
  id: "MD-A17",
  approved: "核定說明書甲版",
  draft: "待覆核乙版",
  approvedUse: "居家自我量測",
  draftUse: "可供臨床診斷",
  missingApproval: "乙版核准依據尚未見到",
} as const;

const exerciseVersions =
  `${exercise.id}：${exercise.approved}寫「${exercise.approvedUse}」，${exercise.draft}寫「${exercise.draftUse}」，${exercise.missingApproval}。`;

export const complianceRegulatoryComparisonZhTwSpec: ModularComparisonSpec = {
  pairId: "compliance-managers-vs-regulatory-affairs-managers",
  locale: "zh-TW",
  title: "法遵經理 vs 法規事務經理：臺灣工作內容、薪資與任用條件",
  shortTitle: "法遵經理 vs 法規事務經理",
  description: "比較臺灣金控、銀行及上市櫃公司的法遵經理與藥廠、醫材商的法規事務經理（RA）。從內控、洗錢防制到 TFDA 查驗登記，核對薪資口徑、任用條件，並做五分鐘紙面練習。",
  regionLabel: "臺灣",
  authorName: "費馬測試編輯部",
  datePublished: "2026-11-27",
  dateModified: "2026-11-27",
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: "活動下週就要上線，誰可以核准合作廠商改文宣？盒上的用途又能不能跟著改？法遵經理要讓公司做事有規則、留得下證據；法規事務經理要讓產品的用途、標示和許可證對得起來。想查清規則在公司哪一步失效，先看金融法遵或上市櫃企業內控與誠信經營。想追一件藥品或醫材怎麼從研發、查驗登記走到上市後變更，先看法規事務（RA）。",
    roleA: {
      badgeTitle: roleA,
      riasecLabel: "霍蘭德 CES",
      aliases: "職缺搜尋詞：法令遵循、金融法遵、法遵主管、洗錢防制、誠信經營",
      keywords: "工作成果：法遵風險評估、政策與訓練、缺失改善追蹤、調查紀錄",
    },
    roleB: {
      badgeTitle: roleB,
      riasecLabel: "霍蘭德 ECI",
      aliases: "職缺搜尋詞：法規經理、法規事務、RA、法規查登、醫材法規",
      keywords: "工作成果：查驗登記策略、技術文件索引、藥品仿單及醫材說明書版次核對",
    },
    interviewBoundaryTitle: "兩個職稱都會讀法規，先找自己想交的成果",
    interviewBoundaryQuestions: [
      "法遵職第一季會接哪個營運流程？請用一份去識別的缺失紀錄說明誰做改善、誰獨立驗證。",
      "RA 職第一季會接新案、許可證維護還是查驗登記補件？請用一個已公開的產品類別說明會接到哪種技術文件。",
    ],
    riasecBoundaryNote: "徽章是本站職業興趣向量前三碼。它用來探索喜歡的工作活動；任用資格、職務授權與工作能力須各自核對。",
  },
  topology: {
    title: "同一項業務怎麼通過兩種檢查",
    summary: "用公司流程查核誰做、誰複核；用產品證據查核哪些說法有依據。兩邊在變更上線前交回各自的審查結果。",
    ariaLabel: "法遵查核營運流程，法規事務查核產品主張，交接修訂與留存證據",
    leftZoneTitle: roleA,
    leftSteps: [
      { title: "看流程", detail: "圈風險與責任人" },
      { title: "查紀錄", detail: "找控制缺口" },
      { title: "追改善", detail: "留下覆核結果" },
    ],
    centerZoneTitle: "變更交接",
    upperBridge: { title: "給範圍", line1: "對外說法", line2: "使用場景" },
    lowerBridge: { title: "交證據", line1: "核定版次", line2: "未結事項" },
    rightZoneTitle: roleB,
    rightSteps: [
      { title: "識產品", detail: "分類與許可範圍" },
      { title: "核佐證", detail: "用途與說明書" },
      { title: "控版次", detail: "決定沿用或待審" },
    ],
  },
  matrix: {
    title: "從八個差異看每天會做什麼",
    summary: "同樣寫「法遵」或「法規」，先讀職缺負責的是公司內部規則、藥品，還是醫療器材。專員到經理的差別也要看能否主責案件及複核別人的成果。",
    roleAColumn: roleA,
    roleBColumn: roleB,
    expandButtonLabel: "展開工具、入行與長期工作條件",
    collapseButtonLabel: "收合工具、入行與工作條件",
    rows: [
      { id: "deliverables", dimension: "交什麼成果", defaultVisible: true, roleA: "把業務上的風險寫進法令遵循評估，記錄缺失由誰修、用什麼證據確認。也會改政策、準備教育訓練或整理受理與調查紀錄。", roleB: "把產品在臺灣的上市路徑、許可證項目和佐證整理成查驗登記資料。交適用要求對照、標籤與說明書比對、補正答覆草稿或展延排程。" },
      { id: "finance-devices", dimension: "金控／銀行與醫材", defaultVisible: true, roleA: "銀行業推出新商品、服務或申辦新種業務前，由法令遵循主管出具並簽署法遵意見。業務核准另循權責。洗錢防制（AML）可查客戶審查、實質受益人和交易監控紀錄。", roleB: "醫材 RA 先釐清 TFDA 分類分級、查驗登記或公告品項登錄，再核規格、用途與許可證資料。變更設計或文宣時，追哪些內容靠測試證據、哪些須循變更程序。" },
      { id: "listed-pharma", dimension: "上市櫃企業與生技新藥", defaultVisible: true, roleA: "制度面包括採購付款、關係人交易與授權。誠信經營可處理反貪腐、利益衝突及檢舉流程；重大疑義按保密、分工與升級規則處理。", roleB: "新藥 RA 對照藥事法與藥品查驗登記審查準則，協調臨床試驗、品質及製造團隊整理證據。比對中文仿單、標籤及藥品許可證變更，追出廠資料與查驗登記資料的版本。" },
      { id: "daily-review", dimension: "日常卡關", defaultVisible: true, roleA: "一筆例外可能牽涉好幾個部門。法遵要釐清政策要求、承辦說法和系統紀錄的落差，請承辦補上改善證據，由未參與經辦的指定人員覆核。", roleB: "產品名稱相同，型號、規格或用途仍可能不同。RA 要同步追研發、品保、臨床及原廠補件，將證據定位到正確產品和版次。" },
      { id: "ownership", dimension: "誰能核准", defaultVisible: true, roleA: "法遵提出意見並追業務改善，具名任用的法令遵循長依辦法報告，內部稽核負責獨立查核。檢舉或外部通報另循機構程序與法定分工。", roleB: "RA 整合產品證據並提出送審或變更建議。正式申請由具資格業者及受權人員處理，主管機關決定許可。品保放行及醫事人員的專業責任另依職務分工。" },
      { id: "tools", dimension: "工作工具", defaultVisible: false, roleA: "用法規差異表、政策版本紀錄與改善追蹤表連起規則、業務、證據與期限；AML 另看客戶審查及異常交易的處理紀錄。", roleB: "用 eCTD 及驗證規格檢查藥品文件結構，用 TFDA 許可證資料和版次表比對醫材。工廠資料另核藥廠 PIC/S GMP 或醫材品質管理系統。" },
      { id: "entry", dimension: "怎麼進入並成長", defaultVisible: false, roleA: "法律、財金、銀行作業或稽核背景，可先挑一個業務流程練法規對照、風險辨識與改善驗證，再依聘任角色核年資或訓練。", roleB: "藥學、化學、生技、醫工或品保背景，可先選藥品或醫材，從查登專員的版本確認、文件索引或補件切入，逐步承接產品變更與上市路徑。" },
      { id: "friction", dimension: "半年後的摩擦", defaultVisible: false, roleA: "如果跨部門反覆催改善讓你耗竭，先分辨職務給的是查證及升級的空間，還是只承接期限提醒、收單與催簽。", roleB: "如果不喜歡逐項對規格和英文技術資料，缺件補正與上市時程壓力會累積。先看自己能否接觸測試證據、研發取捨或主管機關問題的回覆。" },
    ],
  },
  incident: {
    title: "銀行與醫材商辦衛教活動，臨時有人加了一句產品用途",
    summary: "情境模擬。兩邊用同一份待印文宣找問題。法遵盯流程失控的地方，RA 回查產品聲稱；印製窗口要收到同一份核准版本。",
    triggerLabel: "廠商新稿出現一項原稿沒有的用途：",
    triggerBody: "活動承辦說供應商同意，業務端就可先印。現有紀錄只有供應商來信與待印稿。合成情境下先留兩版，將活動授權與產品用途各自交給負責窗口。",
    triggerCaveat: "若文宣構成醫材廣告，許可證所有人或登錄者須依規定另取得刊播核准。",
    rows: [
      { stage: "攔下未覆核版本", roleLabel: "活動承辦與法遵", tone: "roleA", verifiedFacts: "可辨認原稿、廠商修訂稿及各自的時間和來源。", openGaps: "誰同意改稿、活動流程是否要求第二人覆核，仍缺紀錄。", actionAndApproval: "法遵列待查控制與證據。模擬案由指定業務主管決定暫緩印製，承辦通知印務窗口，法遵追蹤回覆。" },
      { stage: "核對產品用途", roleLabel: "醫材法規與產品團隊", tone: "roleB", verifiedFacts: "文件可辨識同一產品及型號，文宣新增一句用途。", openGaps: "把原稿與新稿逐句對到有效許可及核定說明書，確認新增文字的依據。", actionAndApproval: "RA 列差異並交醫材商授權窗口與品保複核。若屬須申請的登記事項變更，由有資格的業者依程序辦理並等待主管機關核准。" },
      { stage: "核准後才交印", roleLabel: "業務主管與印務窗口", tone: "roleA", verifiedFacts: "兩邊的查核意見、持有的產品文件及待補項已有索引。", openGaps: "須確認要印的版本、審查結論及未結項全都對得上。", actionAndApproval: "指定業務主管看齊覆核紀錄再核准，印務窗口按當次核准稿執行。舊稿標示停止使用；法遵追蹤事件按分工交獨立覆核。" },
    ],
    recoveryAcceptanceTitle: "重新交印前的三項證據",
    recoveryAcceptanceCriteria: "最新文宣可對到有效的產品依據，承辦、覆核、核准皆有時間與簽認，新舊版流向可查。未補齊時維持暫緩。若案件須經行政核准，另核主管機關核定紀錄。",
    defenseLayerNote: "公司內部的控制覆核、醫材商的產品資料確認、主管機關的行政核定，各在自己的欄位留下證據。",
  },
  payAndCerts: {
    title: "臺灣薪資怎麼比？任用和產品許可怎麼分？",
    summary: "先找與聘用責任最接近的行業群組，再用書面金額算自己的年收入。主計總處的 1219「其他企業服務及行政經理人員」與 1223「研究發展經理人員」可作分類參考，原表未把這兩個職稱分別固定歸入這兩碼。",
    salaryHeading: "全時中階主管的市場參照與同城聘用條件",
    salaryBody: `勞動部職類別薪資調查（PSDN）正式報告的表 3、表 13、表 5 都可查「中階主管（經理）」。${pay.month}全時受僱者平均經常性薪資，全體每月新臺幣 ${pay.overall.month} 元，金融及保險業為 ${pay.finance.month} 元，藥品及醫用化學製品製造業為 ${pay.pharma.month} 元。當月含本薪與按月固定津貼、獎金。${pay.year}均在職者的平均全年薪資所得，三欄依序為 ${pay.overall.year}、${pay.finance.year}、${pay.pharma.year} 萬元，含績效、年終等且採不同統計期間。藥品製造欄只作藥廠背景；醫材、外商及個別部門需要另外找可比資料。兩個職稱的同城、同資歷薪差，在這些公開表內仍無法單獨辨認。

金控法遵的聘用條件可拆月本薪、固定給付、績效獎金與遞延條件。藥廠或醫材 RA 也從月本薪開始，再列書面固定年終、定額津貼及依績效或公司條件給付的獎金、分紅。若寫保證年終，核算是按本薪或另有基數、計算月數與到職條件。跨市場協作若涉及時差會議或出差，另計時間成本及實際可報支項目。

比同城、同資歷且責任相近的聘用條件，把每項固定給付各乘書面保證次數，再加總年額。分紅、績效及一次性款項另列，按通勤、出差、加班及可休假日比較。法遵定級可核是否主責重大缺失、控制設計及獨立覆核的協調；RA 可核是否主責申請策略、補正與產品變更。當職缺只有轉信催件或搬資料時，先把它當支援職評估，再看有沒有明確的主責交付與升級條件。`,
    certs: [
      {
        name: "金控與銀行的法令遵循長、專責單位及指定人員",
        officialScope: "依現行辦法的一般規則，該辦法所稱金融控股公司及銀行業由副總經理以上或職責相當者擔任法令遵循長，向董（理）事會等法定對象報告。適任途徑舉例：銀行副總經理可依銀行負責人準則，以銀行年資滿三年、曾任總行經理以上或同等職務且績效優良認列。金控副總經理可依金控負責人準則，以金融機構或金控年資滿五年、曾任總公司或總行副經理或同等職務滿三年且績效優良認列。兩條途徑還須符合各自的品德、領導及經營能力要求。",
        workplaceBoundary: "法遵專責單位主管及所屬人員與指定主管有法定適任條件。國內可依曾任金融機構法遵人員或主管合計滿五年，或修畢主管機關認定機構三十小時以上課程並考試及格、取得結業證書；受規範者另有每年十五小時在職訓練要求。國外當地聘任主管及 AML 專責人員另循相應規定。",
        verificationTips: "國內一般規則下，法遵長可兼任防制洗錢及打擊資恐或防制詐欺專責單位主管，禁止兼任法務主管或其他內部職務。信用合作社、票券金融公司及外國銀行在臺分行須另查各自適用規定。機構尚未符合新制所列配置與權責者，須於 2027 年 12 月 31 日前調整完成。",
        officialLinks: [sources.bankControl, sources.holdingOfficer, sources.bankOfficer, sources.bankExceptions],
      },
      {
        name: "醫療器材商許可、產品許可及輸入醫療器材技術人員",
        officialScope: "依《醫療器材管理法》核醫療器材商資格與產品查驗登記或公告品項登錄。依《醫療器材技術人員管理辦法》，輸入醫療器材技術人員須專科以上畢業、在醫療器材製造業或販賣業具一年以上實務，經驗須涵蓋醫療器材製造，或查驗登記的資料準備、程序管理與送件，且最近五年接受至少二十小時規定訓練。製造、維修另查對應類別。",
        workplaceBoundary: "受僱 RA 可依公司分工整理資料。若同時擔任法定技術人員，另核相應聘用資格；許可證是產品文件，申請人、受授權者與核發機關各有責任。",
        verificationTips: "先在職缺上確認是否兼任輸入技術人員，再核對公司許可、產品類別及實際指派。",
        officialLinks: [sources.device, sources.deviceTech, sources.devicePermit],
      },
      {
        name: "藥品監製、PIC/S GMP、MDSAP 與 RAC",
        officialScope: "西藥製造業者依法設專任藥師駐廠監製。PIC/S GMP 對應藥廠製造品質，MDSAP 醫療器材單一稽核計畫在特定國外廠簡化模式下可提供審查佐證，例如符合條件的日本廠。",
        workplaceBoundary: "RAC 是 RAPS 的自願專業認證，臺灣醫材許可證由主管機關依產品案件核發。台灣醫藥品法規學會（TSRAP）及 RAPS 台灣分會是交流或進修入口。",
        verificationTips: "若聘用把證照寫進條件，請核對發證機構、有效性，以及職務是藥師監製、法定技術人員，還是產品法規事務。",
        officialLinks: [sources.drug, sources.gmp, sources.mdsap, sources.rac, sources.society],
      },
    ],
    interviewChecklistTitle: "用書面聘用條件核對四個差異",
    interviewChecklistQuestions: [
      { label: "固定給付", question: "本薪、固定年終與定額津貼分別以何基數、發放幾次、是否有到職門檻？" },
      { label: "浮動給付", question: "哪一項按個人或公司績效，付款會受遞延或在職條件影響嗎？" },
      { label: "主責與職級", question: "交付是自行提出改善、補正及變更建議，還是協助登記進度？定級時採哪個成果？" },
      { label: "跨時區與合併任用", question: "需負責哪個時區的緊急回覆，是否同時為法定指派人員？書面如何約定責任與工時？" },
    ],
  },
  checklist: {
    title: "你想練的技能，和你能長期接受的工作條件",
    summary: "分開勾選技能與條件。願意當法規窗口，還要看自己是否能接受職務的審查責任及回覆節奏。",
    skillsHeading: "技能｜找出想主責的成果",
    skillsOptions: [
      { id: "control-gap", track: "roleA", label: "把法令變成可抽查的流程", summary: "定義風險、控制、負責人及確認改善的紀錄。", interviewQuestions: ["前一個結案缺失是按什麼證據驗收的？"] },
      { id: "investigation-record", track: "roleA", label: "寫能交接的調查紀錄", summary: "把當事人陳述、可見證據、待查資訊及升級對象分開。", interviewQuestions: ["檢舉或客訴資料的查閱與升級如何分工？"] },
      { id: "submission-map", track: "roleB", label: "讓審查者找得到產品佐證", summary: "把產品、規格、聲稱和試驗或標示來源對到同一版本。", interviewQuestions: ["新案進到審查前，怎樣追到所用證據的版次？"] },
      { id: "label-control", track: "roleB", label: "做一張可複核的版次差異表", summary: "圈出用途、警語與標籤文字的變更，保留無法確認的欄位。", interviewQuestions: ["文宣與核定資料不一致會交給哪一位處理？"] },
    ],
    conditionsHeading: "條件｜衡量日常工作節奏",
    conditionsOptions: [
      { id: "escalation", track: "roleA", label: "接受追查跨部門缺失與升級", summary: "即使業務急著結案，仍要敢寫明缺少的證據。", interviewQuestions: ["業務不同意改善期限時，有哪條升級路徑？"] },
      { id: "submission-clock", track: "roleB", label: "接受上市里程碑與補件拉扯", summary: "原廠、試驗與品保資料到齊的時間可能不同。", interviewQuestions: ["補件期限與上市時程相撞時，誰能調整計畫？"] },
    ],
    defaultInterviewQuestions: ["第一個能獨立主責的成果是什麼？", "哪位同事複核，遇到證據不足時怎麼升級？"],
    crossTrackNote: "兩邊都想試，可先分別讀一份法遵改善紀錄格式與一份產品文件索引，再比較自己喜歡追公司流程還是產品證據。",
    offlinePrintHint: "紙上各圈一項技能和一項可接受條件，投遞時用具體交付確認。",
  },
  desktopExercise: {
    sectionTitle: "五分鐘試做｜攔下一份來源說不清的文宣",
    summary: "選法遵或醫材法規一軌，用紙筆寫三行。產品與活動均為合成。零正式送件、零對外發布，也不用真實客戶或產品資料。",
    publicLinksHeading: "兩份公開資料：",
    publicLinks: [sources.bankCase, sources.deviceLabel],
    factSummaryHeading: "可離線重做的資料卡：",
    factSummary: `官方資料摘要。銀行案例指出經辦兼管進度與帳務、留存不足，並要求稽核單位追蹤改善。食藥署資料說明如何查核定版次，再對照品名、型號及用途。

${exerciseVersions}銀行與醫材商合辦活動。承辦要求印乙版，登記進度與勾結案的是同一人，沒有第二人覆核紀錄。`,
    taskA: {
      title: "法遵軌｜寫改善追蹤便條",
      instruction: "第一行寫型號及甲乙版的用途和狀態。第二行寫印製如何處置、這次缺哪個控制。第三行寫活動承辦交什麼證據、誰獨立覆核及怎樣判斷可以結案。",
    },
    taskB: {
      title: "醫材法規軌｜寫說明書比對便條",
      instruction: "寫型號、兩版用途與狀態。說明如何處置印製、圈出擴大用途的字眼。寫下誰核說明書、改登記用途前須等哪一項核准。",
    },
    rubricTitle: "展開核對條件及雙軌樣答",
    rubricHeading: "每軌四項",
    rubricPassRule: "共同兩項加所選軌兩項，四項都能找到才完成。",
    rubricItems: [
      "共用｜型號、甲版與乙版分別記對，乙版核准依據仍缺。",
      "共用｜先暫緩印製、保留兩版可供查核。",
      "法遵｜圈出一人經辦又勾結案的問題。",
      "法遵｜指定活動承辦補證，另由獨立窗口覆核後才結案。",
      "法規｜指出新增臨床診斷字眼擴大用途。",
      "法規｜核對甲版。乙版暫緩，擴增登記用途須經主管機關核准，按核定版改稿。",
    ],
    sampleAnswerALabel: "法遵軌樣答：",
    sampleAnswerA: `${exerciseVersions}暫緩印製，保留兩版。同一人登記又勾結案，活動承辦補異動來源和催辦紀錄，交獨立覆核人驗證並留紀錄後才結案。`,
    sampleAnswerBLabel: "醫材法規軌樣答：",
    sampleAnswerB: `${exerciseVersions}暫緩印製，保留兩版。「${exercise.draftUse}」擴大用途，請醫材法規窗口核對甲版。乙版維持暫緩；新增登記用途須等主管機關核准，再按核定版改稿。若屬醫材廣告，另核刊播核准。`,
  },
  thirtyDayPlugin: {
    badge: "四週作品",
    title: "30 天練出四件可複核的作品",
    summary: "任選一軌，使用下列臺灣公開規則與文末的四週作品資料，製作一組求職可講解的紙面作品。人名、案件與產品自行合成，作品標明引用位置、版本和待確認事項。全程零正式送件。",
    tracks: [
      {
        id: "compliance", title: "法遵與內控", badge: roleA, tone: "roleA",
        weeks: [
          { weekLabel: "第一週", deliverable: "交一頁採購付款權責圖。用《公開發行公司建立內部控制制度處理準則》的採購與付款循環，放入請購、驗收與付款三站；每站標一個經辦人、一項核准條件和一份留存證據。" },
          { weekLabel: "第二週", deliverable: "交一張利益迴避與檢舉路由表。讀證交所《誠信經營作業程序及行為指南》，設計一般利益揭露與涉及高階主管兩種合成事件。逐列標受理窗口、保密、迴避及何時升級。" },
          { weekLabel: "第三週", deliverable: "交實質受益人缺失的改善追蹤簿。用金管會公開的防制洗錢查核缺失，寫出被查出的缺口、責任人、期限、驗證證據各一欄。PDF 暫時打不開時，先以辨識實質受益人、以可靠來源驗證、保留可覆查紀錄三項起草。只用合成客戶資料。" },
          { weekLabel: "第四週", deliverable: "交一頁內控自評與稽核移交說明。從金控及銀行內控內稽辦法的三道模型和改善追蹤規定，設計一個已改善和一個未改善案例，註明何時由業務修正、何時由法遵追蹤、由誰獨立覆查。" },
        ],
      },
      {
        id: "regulatory", title: "藥品與醫材法規", badge: roleB, tone: "roleB",
        weeks: [
          { weekLabel: "第一週", deliverable: "交醫材路徑判讀卡。用食藥署許可證申請方式的前三個檢核點，找列管、分類分級及類似品條件，為合成產品各寫一項已知與一項缺件。把何時需再查正式分類標明。" },
          { weekLabel: "第二週", deliverable: "交形式審查文件索引。參照食藥署第二、三等級醫材查檢表頁，按申請者資格、產品標示、技術支持三欄登記文件、版次、責任方和狀態。附件暫時開不了，可用食藥署許可證申請方式列出的申請書、商業許可、標示擬稿與技術文件起草。" },
          { weekLabel: "第三週", deliverable: "交一頁藥品 eCTD 結構核對。對照食藥署 R2.1 與 V-R2.1 公告，為同一合成新藥列封套、文件目錄、版次和一個缺漏案例。PDF 備援是臺灣封套、文件索引、格式驗證三項，查核不等於產品審查。" },
          { weekLabel: "第四週", deliverable: "交一份製造證據對照給品質團隊。用食藥署 PIC/S GMP 問答與國外醫療器材製造廠 QSD 說明，各列一個程序、要查的文件和一個不能跨程序沿用的項目，再標明誰持有文件、哪一項還缺證據。" },
        ],
      },
    ],
  },
  tools: {
    title: "選一個下一步",
    summary: "按你目前要解決的問題，使用一項職業工具。",
    cards: [
      { id: "compare", badge: "比較候選", meta: "雙職業對比", tone: "roleA", title: "比較手上兩個職業方向", description: "把現有選項換進雙職業對比，核對交付、技能與工作環境。", purposeHint: "已有兩個方向，想看差異。", ctaLabel: "前往職業對比", href: "/zh-TW/career/compare" },
      { id: "worksheet", badge: "留下條件", meta: "探索工作表", tone: "neutral", title: "記下想驗證的責任與作品", description: "記錄一件想做的成果、一項接受的條件和下一步查證動作。", purposeHint: "有方向，想留下求職依據。", ctaLabel: "打開我的工作表", href: "/zh-TW/career/interest-worksheet#my-worksheet" },
      { id: "holland", badge: "工作興趣", meta: "霍蘭德 60 題", tone: "accent", title: "梳理哪些任務吸引你", description: "看六個興趣面向與三字興趣碼，找自己想多做的活動。", purposeHint: "方向還未確定，想探索興趣。", ctaLabel: "開始霍蘭德職業興趣測試", href: "/zh-TW/tests/holland-career-interest-test-riasec" },
      { id: "career94", badge: "工作方式", meta: "職業測試 94 題", tone: "roleB", title: "整理偏好的工作節奏和責任", description: "從工作活動、工作方式與工作條件，辨認你希望有多少協作和獨立判斷。", purposeHint: "工作內容有吸引力，想核對工作方式。", ctaLabel: "前往職業測試", href: "/zh-TW/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "分別閱讀兩個職業介紹",
    profileLinks: [
      { label: "法遵經理職業介紹", href: "/zh-TW/career/jobs/compliance-managers" },
      { label: "法規事務經理職業介紹", href: "/zh-TW/career/jobs/regulatory-affairs-managers" },
    ],
  },
  faqs: [
    { id: "tw-compliance-regulatory-difference", question: "法遵、內部稽核與醫材 RA，從職缺怎麼辨認？", answer: "先看工作對象和交付。法遵把外部規則轉成公司可執行的控制並追改善，內部稽核獨立驗證控制是否有效。醫材 RA 對產品用途、許可證與標示做對照。履歷寫得出一件控制改善或產品變更的完整證據，比只有法規專有名詞更容易說明你的角色。" },
    { id: "tw-compliance-regulatory-appointment", question: "應徵銀行法遵或藥廠 RA，一定要有律師或藥師資格嗎？", answer: "先核任用角色。銀行指定法遵人員有法規所列年資或訓練等途徑，銀行法遵長另依負責人資格準則。藥廠 RA 可由公司依職務需求聘用，西藥製造的專任藥師駐廠監製另有要求；醫材職若兼任法定輸入技術人員，另核該角色的學歷、年資與訓練。" },
    { id: "tw-compliance-regulatory-seniority", question: "兩份同城經理聘用條件，月薪較高就一定領得多嗎？", answer: "看書面保證年額。假設同城、同資歷的兩份聘用條件，甲為月本薪 9.5 萬元、保證 13 個本薪月，另有每月固定津貼 2,000 元，年額是 125.9 萬元；乙為月本薪 10 萬元、保證 12 個月，年額是 120 萬元。把績效獎金按發放條件另列，遞延獎金記實際可領年度，簽約金只列首年並核返還條件。談定級與下次調薪時，可用法遵主責重大缺失及重新設計控制的紀錄，或 RA 主責申請策略及跨產品變更的紀錄，確認增加的責任如何列入評等。例中差額只反映這兩份假設條件。" },
    { id: "tw-compliance-regulatory-aml", question: "做過上市櫃公司的反貪腐及檢舉，可以轉金融 AML 嗎？", answer: "可以把利益衝突、保密和改善追蹤經驗帶到金融風控及法遵。AML 額外需要客戶審查、實質受益人、持續審查與交易紀錄的背景。先用公開查核缺失練一條可覆核的證據鏈，再按目標職是否為防制洗錢專責單位核指定訓練與任用條件。" },
    { id: "tw-compliance-regulatory-labels", question: "藥品仿單和醫材說明書都要管嗎？2026 年電子核定本改了什麼？", answer: "先按產品分流。藥品依藥事法核中文仿單和標籤，醫材依醫療器材管理法核標籤、說明書或包裝。食藥署自 2026 年 10 月 1 日試行以電子版取代核准的第二、三等級醫材查驗登記或變更案件的新紙本核定本。做改版時從許可證系統核最新版本。產品能否改用電子說明書須另核公告品項。" },
    { id: "tw-compliance-regulatory-cross-track", question: "從醫材品質管理轉 RA，第一項可交付工作是什麼？", answer: "先挑一項已核准產品，練習把型號、用途、主要規格與測試或核定資料連成證據表。品質經驗有助辨認設計變更和紀錄斷點。接到新案時再補產品分類、查驗登記條件、補正跟進與聲稱管理，才有從品保協作到 RA 主責的作品。" },
    { id: "tw-compliance-regulatory-automation-2026", question: "2026 年，AI 或電子驗證工具能替這兩職做什麼？", answer: "可先列政策版次差異或標出文件待核處。金融團隊可讓核准工具起草法規對照表，法遵人員仍要回原文核適用性、客戶資料使用及異常升級。藥品 eCTD R2.1 與驗證指引自 2026 年 7 月起生效，工具可核結構與格式，RA 仍要核資料能否支持產品聲稱。食藥署同年公布的優良機器學習實務針對 AI 醫材本身的設計、臨床評估與上市後監控。AI 草稿、結構驗證、內部簽認和主管機關核定是四種不同結果。" },
  ],
  sourceGroups: [
    { id: "tw-cr-pay", title: "勞動部薪資調查與原表", links: [sources.payMethod, sources.payOverall, sources.payFinance, sources.payPharma] },
    { id: "tw-cr-financial", title: "金控、銀行、上市櫃企業的法遵與內控", links: [sources.bankControl, sources.bankOfficer, sources.holdingOfficer, sources.bankExceptions, sources.amlLaw, sources.amlRule, sources.listedControl, sources.ethics, sources.bankCase] },
    { id: "tw-cr-device", title: "醫材查驗登記、技術人員、標示及品質", links: [sources.device, sources.devicePermit, sources.deviceTech, sources.deviceQms, sources.deviceApproach, sources.deviceLabel, sources.mdsap] },
    { id: "tw-cr-drug", title: "藥品查驗登記、臨床與製造規範", links: [sources.drug, sources.drugReview, sources.drugTrial, sources.ectd, sources.gmp] },
    { id: "tw-cr-professional", title: "臺灣法規專業交流與 RAC 認證", links: [sources.society, sources.rac] },
    { id: "tw-cr-automation", title: "金融業 AI 治理與醫材自動化原證", links: [sources.aiLaw, sources.bankAi, sources.deviceAi] },
    { id: "tw-compliance-regulatory-thirty-day-materials", title: "四週作品公開材料", requiresPlugin: "thirtyDay", links: [sources.ethicsGuide, sources.amlReview, sources.deviceForms] },
  ],
};
