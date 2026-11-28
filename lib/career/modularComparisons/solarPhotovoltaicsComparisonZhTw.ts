import type { ModularComparisonSpec } from "../modularComparison";

const roleA = "太陽能系統工程師";
const roleB = "太陽光電安裝技術員";

const sources = {
  classification: {
    label: "主計總處｜職業標準分類",
    href: "https://ws.dgbas.gov.tw/public/attachment/110211718123hcmhd3o.pdf",
    note: "核對 2151 電機工程師、7411 建築物電力系統裝修人員、7412 電力機械裝修人員。",
  },
  industry: {
    label: "經濟部產業發展署｜太陽光電產業人才調查",
    href: "https://ipd.nat.gov.tw/italent/ePaperD/14/ePaper20240500007",
    note: "表一列出施工與維運等不同職務及能力。",
  },
  designJob: {
    label: "雲豹能源｜太陽光電系統設計職缺樣本",
    href: "https://www.1111.com.tw/job/98715932/",
    note: "臺北內湖，勘查、系統繪製、送審、工程管理、驗收與短期出差。",
  },
  mixedJob: {
    label: "台灣就業通｜長美能源太陽能系統工程師／工務",
    href: "https://job.taiwanjobs.gov.tw/internet/index/jobDetail.aspx?EMPLOYER_ID=952622&HIRE_ID=10899319&R2=11",
    note: "臺南南區，公開樣本包含場勘、遮蔭評估、工地協調、底薪與專案獎金。",
  },
  structuralJob: {
    label: "伊展綠能｜太陽光電工程施工職缺樣本",
    href: "https://www.1111.com.tw/job/132816346/?agent=south_freshman",
    note: "臺中神岡，案場作業包含支架、模組及機電設備，採日薪。",
  },
  electricalJob: {
    label: "博盛光電｜太陽光電電機施工職缺樣本",
    href: "https://www.1111.com.tw/job/130381487/?mid=searchlist",
    note: "嘉義及外縣市案場，日薪、配線及符合條件的外宿津貼。",
  },
  localModel: {
    label: "原生新能源｜臺灣系統商的發電模擬工作",
    href: "https://www.initialsolar.com/storage/upload/ck_files/%E5%8F%B0%E7%B6%93%E9%99%A2_%E7%99%BC%E9%9B%BB%E6%A5%AD%E5%A0%B1%E5%91%8A_202309.pdf",
    note: "首頁公司簡介說明 PVsyst 遮蔭、發電模擬與串接設計用途。",
  },
  contract: {
    label: "中山醫學大學｜公開屋頂光電合約",
    href: "https://www.csmu.edu.tw/var/file/0/1000/img/2156/783075735.pdf",
    note: "以 PEP-PV-EPC-20201201 的直流相關材料項目核 MC4 接頭及壓接工具這項個案。",
  },
  pvsyst: {
    label: "PVsyst｜原廠發電模擬報告說明",
    href: "https://www.pvsyst.com/help/project-design/results/",
    note: "報告包含輸入假設、月發電結果與損失圖。",
  },
  payMethod: {
    label: "勞動部｜114 年職類別薪資調查方法",
    href: "https://www.mol.gov.tw/1607/1632/1633/90814/?cprint=pt",
    note: "全時受僱、114 年 7 月經常性薪資、113 年全年在職薪資所得的定義。",
  },
  pay: {
    label: "勞動部｜114 年職類別薪資調查報告表 3、6、8",
    href: "https://statdb.mol.gov.tw/html/s3/svy14/1435all.pdf",
    note: "表 3 全體；表 6 電力供應業；表 8 機電、管道及其他建築設備安裝業。各看相同的兩個合併發表職類。",
  },
  wages: {
    label: "勞動基準法｜工資與延長工時",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=N0030001&sid=sIghwq",
    note: "第 2、24 條，工資定義及加班費。",
  },
  renewable: {
    label: "再生能源發展條例",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0130032",
    note: "設備認定、併網與建管架構。",
  },
  installLaw: {
    label: "再生能源發電設備設置管理辦法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=J0130041",
    note: "115 年 3 月修正版，第 7、8、13 條與附件四。",
  },
  declaration: {
    label: "能源署｜第三型設備登記申請表及設置聲明書",
    href: "https://law.moj.gov.tw/LawClass/LawGetFile.ashx?FileId=0000413990&lan=C",
    note: "PDF 第 4–6 頁說明設置聲明與簽章；第 8、10 頁供辨認完工照片及序號。",
  },
  structural: {
    label: "設置再生能源設施免請領雜項執照標準",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=J0130042",
    note: "第 7 條與附件二，依場址及工程條件核結構相關文件及出具資格。",
  },
  voltage: {
    label: "用戶用電設備裝置規則｜光電電路電壓",
    href: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=J0030018&flno=866",
    note: "第 866 條。查開路電壓與最低預期周圍溫度修正。",
  },
  equipmentForms: {
    label: "能源署｜太陽光電設備與模組序號表",
    href: "https://ea03.moeaea.gov.tw/s0302/Article/PubArticle.aspx?post_id=63&type=setup_info",
    note: "第五部分的第一型、第二型設備基本資料暨模組序號表。",
  },
  grid: {
    label: "能源署｜光電併網規範與作業入口",
    href: "https://ea03.moeaea.gov.tw/s0302/Article/PubArticle.aspx?post_id=879&type=setup_info",
    note: "台電併聯技術要點與作業文件索引。配電手冊欄位摘要見下方作品說明。",
  },
  gridPortfolio: {
    label: "台電｜配電手冊附表 3",
    href: "https://www.taipower.com.tw/media/mrdc542n/%E9%85%8D%E9%9B%BB%E7%B4%9A%E5%86%8D%E7%94%9F%E8%83%BD%E6%BA%90%E4%BD%B5%E7%B6%B2%E6%89%8B%E5%86%8A.pdf?mediaDL=true",
    note: "114 年 3 月版配電手冊。若下載暫不成，第三週作品含附表欄位備援。",
  },
  engineerExam: {
    label: "考選部｜專技高考技師考試規則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=R0040049",
    note: "查電機工程類科與應考資格。",
  },
  engineerLicense: {
    label: "技師法",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0030022",
    note: "查執業執照與執業範圍。",
  },
  designScope: {
    label: "電業設備及用戶用電設備工程設計及監造範圍認定標準",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0130020",
    note: "核對需由電機技師或相關專業技師設計、監造的適用條件。",
  },
  pvCertificate: {
    label: "技能檢定中心｜太陽光電設置乙級技能檢定規範",
    href: "https://ws.wda.gov.tw/Download.ashx?icon=..pdf&n=5aSq6Zm95YWJ6Zu76Kit572u6KaP56%2BELnBkZg%3D%3D&u=LzAwMS9VcGxvYWQvMzE1L3JlbGZpbGUvMTAyMzkvOTkwNDMvZDA5ZjFlNmEtZDE3NC00YTMxLWJmYzAtYWRjZjhlZTdmMGExLnBkZg%3D%3D",
    note: "職類 21000；規範各列說明識圖、裝設與維修的檢定範圍。",
  },
  wiringCertificate: {
    label: "技能檢定中心｜室內配線（屋內線路裝修）",
    href: "https://www.wdasec.gov.tw/News_Content.aspx?Create=1&n=F240F6BB01FE46BA&s=BC03BB241E635022&sms=DD855C7DF840A224",
    note: "職類 00700；公告附當期術科資料與新版適用時間。",
  },
  contractor: {
    label: "電器承裝業管理規則",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0030054",
    note: "查承裝業登記範圍、人員配置與資格。",
  },
  safety: {
    label: "營造安全衛生設施標準",
    href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=N0060014",
    note: "第 17、18 條，工程防墜與屋頂作業雇主責任。",
  },
  roofChecklist: {
    label: "南科管理局｜屋頂作業安全檢核表",
    href: "https://www.stsp.gov.tw/attached/EnvSecure/download/202505%E3%80%8C%E5%A4%AA%E9%99%BD%E5%85%89%E9%9B%BB%E7%99%BC%E9%9B%BB%E7%B3%BB%E7%B5%B1%E4%B9%8B%E4%BD%9C%E6%A5%AD%E5%A2%9C%E8%90%BD%E5%8D%B1%E5%AE%B3%E9%A0%90%E9%98%B2%E3%80%8D-%E9%99%84%E4%BB%B6%E4%B8%80.pdf#page=8",
    note: "PDF 第 8 頁屋頂作業前安全檢核表的查核日期與查核結果欄。",
  },
  prevention: {
    label: "勞安所｜太陽光電設置及維運危害",
    href: "https://www.ilosh.gov.tw/90734/90769/90771/170961/post",
    note: "依屋頂、地面、水域區分設置及維運風險。",
  },
  heat: {
    label: "職安署｜高氣溫作業熱危害預防指引",
    href: "https://www.osha.gov.tw/48110/48713/48735/60221/",
    note: "114 年第三版，高溫工作條件及雇主職安責任。",
  },
  weather: {
    label: "中央氣象署｜地面觀測資料",
    href: "https://climate.cwa.gov.tw/GroundObservation",
    note: "地面測站的日照時數、日射量及資料下載。",
  },
} as const;

const pay = {
  month: "114 年 7 月",
  annualPeriod: "113 年",
  engineerGroup: "電機、電子工程師",
  installerGroup: "電力、電子、資通訊設備裝修人員（含水電工）",
  all: "75,649 元與 42,990 元",
  electricity: "64,172 元與 60,107 元",
  installation: "56,811 元與 40,768 元",
  installationAnnual: "83.2 萬元與 52.2 萬元",
} as const;

const declarationBoundary =
  "未達一百瓩、須附設備設置聲明書的第三型光電案，由太陽光電設置乙級技術士簽章。達一百瓩者的同一份聲明書由電器承裝業或電機技師簽章，設在地面或水面的設備免附這份聲明書。";

const exercise = {
  currentVersion: "B",
  priorVersion: "A",
  currentModel: "藍款",
  photoModel: "灰款",
  photoField: "照片拍攝日期",
  lowTemp: 0,
  moduleVoc: 36,
  moduleCount: 10,
  correctionFactor: 1.08,
  mockLimit: 380,
  missingSite: "查核日期與結果",
  designOwner: "設計負責人",
  siteOwner: "工地負責人和指定屋頂作業督導",
  state: "待查",
} as const;

const trialVoltage = exercise.moduleCount * exercise.moduleVoc * exercise.correctionFactor;
const trialExcess = trialVoltage - exercise.mockLimit;

const exerciseVersionCheck =
  `最新版單線圖 ${exercise.currentVersion} 為${exercise.currentModel}，照片標${exercise.photoModel}且缺拍攝日期，整筆${exercise.state}。`;

export const solarPhotovoltaicsComparisonZhTwSpec: ModularComparisonSpec = {
  pairId: "solar-energy-systems-engineers-vs-solar-photovoltaic-installers",
  locale: "zh-TW",
  title: "太陽能系統工程師 vs 太陽光電安裝技術員：臺灣工作、薪資與證照",
  shortTitle: "太陽能系統工程師 vs 太陽光電安裝技術員",
  description: "比較臺灣太陽光電設計與安裝的工作、薪資與資格。從 PVsyst 發電模擬、台電併聯審查到屋頂施工、直流配線與竣工交接，附五分鐘純紙面試做。",
  regionLabel: "臺灣",
  authorName: "費馬測試編輯部",
  datePublished: "2026-11-27",
  dateModified: "2026-11-27",
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: "同一座廠房要加裝太陽能板。變流器換型號，設計端得重查哪張圖和哪份模擬受影響；工班得查收到哪一版圖、實物到哪裡，並留下能交接的紀錄。太陽能系統工程師把案場限制寫成能複核的圖說與選型依據；太陽光電安裝技術員把核定圖說落到支架、模組和配線上，留下能查驗的施工證據。若你想研究遮蔭、發電量和電網介面，先看系統設計。若你想按圖把設備裝好、對現場差異並交出紀錄，先看安裝職。",
    roleA: {
      badgeTitle: roleA,
      riasecLabel: "霍蘭德 RIC",
      aliases: "職缺搜尋可用太陽光電系統設計工程師、太陽光電系統規劃設計工程師",
      keywords: "勘查與案場規劃、PVsyst 發電模擬、變流器選型、電力單線圖、台電併聯審查",
    },
    roleB: {
      badgeTitle: roleB,
      riasecLabel: "霍蘭德 RC",
      aliases: "職缺搜尋可用太陽光電系統安裝人員、太陽光電工程施工人員、太陽光電電機施工人員",
      keywords: "鋼構支架、模組鋪設、直流配線、MC4 壓接、屋頂墜落防止、施工紀錄",
    },
    interviewBoundaryTitle: "第一季會交圖說，還是交現場紀錄？",
    interviewBoundaryQuestions: [
      "系統設計職會讓新人做場勘摘要、發電模擬底稿或單線圖其中哪一項？誰帶著複核？",
      "現場職會先分到支架、模組或機電哪一組？從識圖、自檢到接下一個工項，各由誰確認？",
    ],
    riasecBoundaryNote: "興趣代碼供探索工作活動。考照、現場授權和錄用另外核對。",
  },
  topology: {
    title: "同一座電站的圖說與完工證據",
    summary: "設計端交出可讀的假設、圖說和技術資料。施工端依收到的圖施作、留下實物紀錄並回報差異。兩邊在圖說修訂、到料和竣工文件上交會。",
    ariaLabel: "左側系統設計由讀場址、比較方案到交圖說；右側安裝查工區、查設備、交紀錄；中間是圖說與差異回報。",
    leftZoneTitle: "系統設計",
    leftSteps: [
      { title: "看場址", detail: "遮蔭、屋況、併聯點" },
      { title: "比方案", detail: "模擬與設備選型" },
      { title: "交圖說", detail: "單線圖與修訂依據" },
    ],
    centerZoneTitle: "圖說交接",
    upperBridge: { title: "設計交付", line1: "圖說、設備表", line2: "適用版次" },
    lowerBridge: { title: "現場回報", line1: "異動、照片", line2: "竣工紀錄" },
    rightZoneTitle: "光電安裝",
    rightSteps: [
      { title: "對現場", detail: "工區、圖說、設備" },
      { title: "做工項", detail: "支架、模組、配線" },
      { title: "交紀錄", detail: "序號、照片、缺失" },
    ],
  },
  matrix: {
    title: "八件會改變你選哪一份工作的事",
    summary: "這裡比光電案場的系統設計及安裝。太陽能電池製程、面板品管、維運清洗與業務開發各有自己的工作重心。主計總處的職類可供找同類，投遞與比較待遇時仍應看職務實際產出。",
    roleAColumn: roleA,
    roleBColumn: roleB,
    expandButtonLabel: "展開資格、成長方向與分類",
    collapseButtonLabel: "收合資格、成長方向與分類",
    rows: [
      {
        id: "deliverables",
        dimension: "第一份成果",
        defaultVisible: true,
        roleA: "把需求變成能審的方案。從場勘、遮蔭假設、模組配置與變流器選型，整理單線圖、設備表、發電模擬、版次與待核項。屋頂案留結構條件給專業人員核，地面案把場址用地和邊界資料納入交接。",
        roleB: "照圖和班組分工交付工項。屋頂或地面鋼構支架、模組鋪設、直流配線可能分包。施工完成後交部位相片、序號、標示與自檢證據，遇改料或圖說不一致即回報，讓驗收能追到對應位置和版本。",
      },
      {
        id: "tools",
        dimension: "工具與讀圖",
        defaultVisible: true,
        roleA: "用工程繪圖軟體管理單線圖與配置圖，用 PVsyst 比較遮蔭、月發電估計及損失。設計評估要對得上場址、氣象與型號，面對採購替代品時，要看變更影響哪一份圖與哪一項假設。",
        roleB: "讀配置圖與施工圖，核設備型號、模組序號、配電箱標示和工具相容性。支架班與機電班使用的工具不同，含 MC4 的工項會涉及接頭型式及對應壓接工具。現場電氣工項由合格授權人員執行。",
      },
      {
        id: "employer-model",
        dimension: "雇主與案型",
        defaultVisible: true,
        roleA: "可看光電系統商、綠能工程統包、電廠開發商及工程顧問。廠房屋頂、自用光電、地面型電站各要協調不同場址與電網條件。長期維運的單位還可能出現偏發電表現分析的工程職。",
        roleB: "可看光電系統商的施工班、支架與模組工班、電器承裝業或分包團隊。同一工程可能拆成鋼構、安裝及機電。新建案交工後，可再看有合適訓練與受聘條件的巡檢或維運工作。",
      },
      {
        id: "work-conditions",
        dimension: "工作環境與代價",
        defaultVisible: true,
        roleA: "設計會在電腦前讀圖、算發電估計及改版，也可能為勘查、複驗或工程協調出差。設計摩擦在於送審補件、圖說反覆修改和進度牽動，前期定好的條件也會被結構或供貨變化打回重看。",
        roleB: "屋頂或空曠場址面對日曬、熱、雨和搬運；有高處墜落風險的區域須由雇主安排防墜與督導。工地進度與天候會改變當天工作，外縣市案場的集合點、交通時間和住宿會影響你能否做久。",
      },
      {
        id: "signoff",
        dimension: "誰簽、誰核",
        defaultVisible: true,
        roleA: "工程師整理圖說、模擬與變更理由。依法須辦電氣設計監造或簽證時，由有相應執業資格的人負責。結構另查建築師、土木技師或結構技師資格，併聯審查由台電依案件處理。",
        roleB: "施工班組照圖及派工完成、有異常就回報。可負責自檢紀錄與資料移交，依法須簽的聲明另核案型及簽章人。完工資料、業主驗收與台電併網各有自己的結果與出具人。",
      },
      {
        id: "entry",
        dimension: "入行門檻",
        defaultVisible: false,
        roleA: "先把基礎電學、圖面閱讀、遮蔭與發電估計帶入一份底稿。設計職缺可能看電機、能源或工程背景與繪圖能力，有現場經驗轉職時也要展示怎麼從現況做成可追查的圖說。",
        roleB: "可找有師傅或工地負責人帶領的安裝職或學徒缺。機械安裝、配線與竣工檢查須按任務核訓練及資格。從水電轉入可把識圖、配線與自檢經歷說清楚，再補光電和屋頂作業邊界。",
      },
      {
        id: "progression",
        dimension: "從入門到能獨立交付",
        defaultVisible: false,
        roleA: "從協助勘查、整理圖說與設備資料，到負責一個方案的設計依據或修訂，再看設計複核、跨專業協調或技師執業。能交出改版前後的設備差異，比只展示漂亮圖面更能說明你做過什麼。",
        roleB: "從識圖及按指派完成一個工項，到能交出有位置、版次和照片的自檢，再往機電工項、帶班或維運走。每次轉換都確認訓練、工作範圍及指派，讓下一個人查得到你的紀錄。",
      },
      {
        id: "classification",
        dimension: "職類與招募名稱",
        defaultVisible: false,
        roleA: "偏電力系統規劃可參照主計總處 2151 電機工程師。企業的太陽能系統工程師也可能偏工務、維運或電廠開發，把預期交付物和現場責任一起讀。",
        roleB: "勞動力發展署把光電設備安裝職能放在 7412 電力機械裝修人員，7411 建築物電力系統裝修人員對應建築電力工作。支架、模組及電氣安裝各有任務，職缺名稱未必套同一統計職類。",
      },
    ],
    hybridRoleNote: {
      prefix: "一個職缺可以兼場勘與工務。看",
      linkLabel: "台灣就業通的系統工程師／工務樣本",
      href: sources.mixedJob.href,
      suffix: "，其中同時列遮蔭評估、配置協作、施工進度與品質。",
    },
  },
  incident: {
    title: "模擬交接：變流器換型號，圖、料、完工紀錄怎麼接",
    summary: "虛構的廠房光電案收到替代變流器的通知。採購表已換型號，工班有上一版施工圖，設計端尚在核對發電模擬與送審資料。先處理受影響的工作範圍，建立能讓雙方辨認的唯一本次版次。",
    triggerLabel: "接到的變更：",
    triggerBody: "一批變流器型號與工班圖說對不起來，原單線圖、設備表及申請文件仍指同一個舊型號。屋頂有其他已排程工項，先把這批未核的設備與文件列為待釐清。",
    triggerCaveat: "這是文件交接示例。現場安全、專業審查、施工指派及台電併聯結果，由實際案場具資格的權責人分別處理。",
    rows: [
      {
        stage: "界定差異",
        roleLabel: "安裝班組／工地負責人",
        tone: "roleB",
        verifiedFacts: "施工圖、採購資料和到料標示能各自取得。回報單記錄到料型號、設備位置、圖說版次及照片日期。",
        openGaps: "目前還不知道替代品是否經設計複核，現場只可說明看到的差異。",
        actionAndApproval: "班組提交差異證據。工地負責人保留該批設備待查的書面狀態，區分受影響工項與其他排程。",
      },
      {
        stage: "釐清影響",
        roleLabel: "系統工程師／設計負責人",
        tone: "roleA",
        verifiedFacts: "比對原圖、設備資料及版本，列出受影響的模擬、設計與申報文件。",
        openGaps: "併聯條件、保護證明和依法須簽證的文件是否受影響，等專業人員確認。",
        actionAndApproval: "設計負責人複核並出具書面修訂，需執業簽證的內容依資格交相應技師。需確認台電的項目由案場窗口追蹤。",
      },
      {
        stage: "對版交回",
        roleLabel: "承裝班組／監造窗口",
        tone: "roleB",
        verifiedFacts: "圖說、設備表、現場標示及差異處理各有識別欄，能逐筆核對。",
        openGaps: "自檢、監造或對外審查未取得的項目維持待查，依承辦窗口補件。",
        actionAndApproval: "合格且受指派的人員處理工程項目。工地負責人與監造窗口核簽章及紀錄，再由相應窗口辦理竣工、驗收和台電事項。",
      },
    ],
    recoveryAcceptanceTitle: "什麼時候可以把文件交下一關？",
    recoveryAcceptanceCriteria: "最新版圖、型號及現場證據逐一相符，差異單有複核人、結論和日期，需要的專業簽證已入冊。未結的台電審查、外部檢驗或完工項目另列責任窗口與狀態；文件可交接時，仍以各該正式結果確認後續階段。",
    defenseLayerNote: "把工程師的設計複核、承裝端的施工自檢、依法須簽的文件和台電的審查結果分開記。",
  },
  payAndCerts: {
    title: "薪資怎麼比？三張證照在哪裡用得上？",
    summary: "薪資表用合併職類比較，能看出業別如何改變參考基準；兩個光電職稱的同城同級差額，得從書面錄取條件算。證照則要分清受僱、執業簽證與設備聲明。",
    salaryHeading: "先對同月、同職類，再拆保證給付",
    salaryBody: `勞動部職類別薪資調查（PSDN）表 3 的${pay.month}全體工業及服務業全時受僱員工，平均每月經常性薪資「${pay.engineerGroup}」與「${pay.installerGroup}」依序為新臺幣 ${pay.all}。表 6 只看電力供應業，同兩組是 ${pay.electricity}；表 8 只看營建工程業裡的機電、管道及其他建築設備安裝業，是 ${pay.installation}。經常性薪資含本薪及按月固定給付，排除加班費。表 8 同業別的${pay.annualPeriod}全年均在職者平均薪資所得另列，兩組依序為新臺幣 ${pay.installationAnnual}。月薪與年薪屬不同期間和母體，兩組統計也都比本頁的光電職名廣。

設計職的底薪、固定年終與專案或績效獎金分三筆看。書面條件有保證年終時，查按本薪或其他基數、按比例條件與發放月份；專案獎金另查起算點、完工或驗收條件與發放時程。安裝有按月受僱，也有日薪。日薪的工日、因天候停工時的計薪、加班、外宿與交通給付要分欄，高處或高溫給付須看明文條件。獨立接案的收款要扣人力、材料、交通及保固預留，另估空檔，與受僱給付分開。

在同一縣市、接近年資比較時，把各自本薪和固定津貼分別乘上書面保證的給付次數，加總成年度保障；日薪用書面保證工日，工日沒保證就列不同情境。獎金、出差、加班及外宿依實際條件另外列一欄。再各扣自行負擔的通勤或外宿支出，附上預計工時和移動時間，才看得出一年差額買走了多少時間。定級另外查工程職能不能接觸模擬假設與改版，安裝職能不能從搬運進到識圖、自檢與工項責任。`,
    certs: [
      {
        name: "電機工程技師",
        officialScope: "考選部辦理專技高考電機工程類科。技師執業另依《技師法》查執業執照、方式及核准範圍。再生能源設備達一百瓩且符合設計監造範圍認定標準時，依法由登記執業的電機技師或相關專業技師辦理設計、監造，並附監造技師簽證的竣工試驗報告。",
        workplaceBoundary: "設計職可先做場勘、選型及圖說底稿。若案場走符合條件的免請領雜項執照程序，該結構相關簽證表由依法登記開業或執業的建築師、土木技師或結構技師出具。",
        verificationTips: "先把職缺寫的「設計」「監造」「簽證」對到實際要交的文件，再查哪一種資格簽哪一件、誰複核新人底稿。",
        officialLinks: [sources.engineerExam, sources.engineerLicense, sources.designScope, sources.structural],
      },
      {
        name: "太陽光電設置乙級技術士（21000）",
        officialScope: "勞動部勞動力發展署技能檢定中心的乙級職類，檢定工程識圖、太陽光電發電系統與線路的安裝及維修能力。核當期乙級報檢資格及測試資料。",
        workplaceBoundary: declarationBoundary,
        verificationTips: "接到第三型案先查場址、容量與要附的聲明。應徵時分清公司列為加分、安排受訓，或實際要求用這張證簽特定文件。",
        officialLinks: [sources.pvCertificate, sources.declaration],
      },
      {
        name: "室內配線（屋內線路裝修）技術士（00700）",
        officialScope: "勞動部勞動力發展署技能檢定中心的另一職類。依職類及級別查室內配線技能。電器承裝業要另核營業登記範圍、所僱合格人員及配置。",
        workplaceBoundary: "這張證適合用來說明建築物屋內線路技能。若要在光電班做電氣工項，逐項看僱用單位的承裝業登記、自己持證級別與實際工作指派。光電設置聲明的簽章資格另查。",
        verificationTips: "先對目標班別是模組、屋內配線還是光電機電，再選檢定。查職缺若列持證加給，是否要擔任特定職務，以及給付是否列在聘書。",
        officialLinks: [sources.wiringCertificate, sources.contractor],
      },
    ],
    interviewChecklistTitle: "拿到兩份工作條件後核四件事",
    interviewChecklistQuestions: [
      { label: "設計成果", question: "這個職等能獨立處理哪一種圖說或模擬底稿？複核完的成果會如何記進考核？" },
      { label: "現場成果", question: "從搬料進到識圖、自檢或負責一個工項，需要哪項受訓與驗收證據？" },
      { label: "有條件給付", question: "哪一款獎金或津貼是固定發放？驗收延後、轉案或跨縣市工作時會怎麼計？" },
      { label: "移動與工時", question: "每天從哪裡集合？跨案場的交通、住宿、待工與延長工時有沒有各自的處理方式？" },
    ],
  },
  thirtyDayPlugin: {
    badge: "四週作品",
    title: "30 天做四件臺灣光電紙面作品",
    summary: "選一軌，每週交一頁可以複核的作品。標上來源日期、版次或頁次。公開 PDF 若暫時打不開，依每週指定的欄位摘要先起稿。全程只整理公開與合成資料，真實設備選型、簽署、現場檢查與操作由具資格的人員負責。",
    tracks: [
      {
        id: "tw-solar-design",
        title: "系統設計",
        badge: roleA,
        tone: "roleA",
        weeks: [
          { weekLabel: "第一週", deliverable: "用中央氣象署地面觀測完成兩測站比較表。交付同一月份的兩個測站、期間、日照時數與日射量欄位、各自單位和缺測註記。最後標出哪項資料還缺場址現況佐證。兩欄的物理意義需各用一句話說清楚。" },
          { weekLabel: "第二週", deliverable: "用能源署公開設備基本資料暨模組序號表畫一張資料關聯圖。這是第一型、第二型教材。用原表型號與序號欄，自加表單版次及模擬填表人與回填時點。以兩個自造代碼測試是否能反查圖說，不選真實設備。" },
          { weekLabel: "第三週", deliverable: "用台電配電級併網手冊附表製作圖說索引。PDF 備援欄位為設置場所、預計併聯方式、裝置容量及責任分界點電壓。對每欄寫應向誰取得資料，分出場勘、圖面與台電窗口。每欄有來源、負責人及待核狀態才算完成。" },
          { weekLabel: "第四週", deliverable: "讀第三型設備登記申請表，做一頁里程碑及責任對照。交出設計依據、完工證據、設備登記三列，逐列註記出具者及證明。PDF 備援欄位為平面配置、設備型號與序號、完工照片、聲明簽章及設備登記；各列只填文件來源。" },
        ],
      },
      {
        id: "tw-solar-installation",
        title: "案場安裝",
        badge: roleB,
        tone: "roleB",
        weeks: [
          { weekLabel: "第一週", deliverable: "用產業發展署光電人才調查的營建施工職能及技能檢定中心乙級規範做工項界線卡。將支架、模組、機電及施工報告分成四列，每列填預期交件人、複核人及一項要核的證據。PDF 備援項目為支架、模組、變流器與施工報告。全欄有對象及交付物即完成。" },
          { weekLabel: "第二週", deliverable: "依能源署設備登記附件的完工相片與序號表做三筆模擬交件索引。PDF 備援欄位為相片代碼、場址識別、設備型號、序號及資料來源。自造三個代碼，其中一筆故意缺照片；交件時須一眼找出缺哪項、誰負責補。" },
          { weekLabel: "第三週", deliverable: "用勞安所公開說明交一張屋頂與地面工作條件對照。各列人工搬運、天候、出入管制與責任聯絡，來源可核、缺資料有待查記號。最後各寫一句哪一種環境你能接受。只描述危害與需要誰確認，保留所有安全配置給專業人員。" },
          { weekLabel: "第四週", deliverable: "以《再生能源發電設備設置管理辦法》的第三型設備檢驗維護紀錄要求做虛構班組交接索引。依設置者的紀錄要求，用日期、適用標準、結果及自訂的證據來源和追查窗口五欄，分別寫成已有文件、資料待查、待專業複核三筆。檢查結果只用自造值。" },
        ],
      },
    ],
  },
  checklist: {
    title: "選兩個你願意練的技能，再選工作條件",
    summary: "技能與工作條件可朝不同方向。先選目前最想驗證的一項技能和一項工作條件，再帶著相應問題去讀下一份職缺。",
    skillsHeading: "我想練哪項技能",
    skillsOptions: [
      { id: "tw-solar-model", track: "roleA", label: "解釋模擬輸入與發電估計", summary: "願意追查遮蔭、天氣資料與設備型號，也願意解釋報告適用於哪一版方案。", interviewQuestions: ["設計新人第一份發電模擬底稿會根據哪些案場資料？"] },
      { id: "tw-solar-drawing", track: "roleA", label: "維護單線圖與設計變更", summary: "能把圖說、設備選型與待查項目跟上版本，知道哪個結構或電氣問題要請哪一個專業窗口。", interviewQuestions: ["更換變流器時，誰複核圖說和申報資料的更新範圍？"] },
      { id: "tw-solar-site", track: "roleB", label: "識圖看部位，記清施工證據", summary: "對照支架、模組與設備標示，留下有位置、型號與日期的自檢資料。", interviewQuestions: ["光電安裝新人會先看哪張圖，哪一項紀錄由自己整理？"] },
      { id: "tw-solar-handoff", track: "roleB", label: "把現場差異報得讓人找得到", summary: "能寫清哪個工區、哪個位號以及圖說與實物差在哪，讓工地負責人可以釐清。", interviewQuestions: ["如果到料型號跟圖說不同，我們用哪一份單子回報並追查？"] },
    ],
    conditionsHeading: "我能接受哪種工作條件",
    conditionsOptions: [
      { id: "tw-solar-iteration", track: "roleA", label: "可接受久坐改圖與往返補件", summary: "喜歡把一個方案做準，也能面對電網條件、場址與供料變化後重查依據。", interviewQuestions: ["一個設計變更是由誰決定、誰追圖，最多會往返哪些外部窗口？"] },
      { id: "tw-solar-office-trip", track: "roleA", label: "願意為場勘和查驗短期出差", summary: "能在桌上整理資料，也願意依工作分工確認現場條件。", interviewQuestions: ["出差半徑和案場工時怎麼算？設計與監造各負責哪部分？"] },
      { id: "tw-solar-sun", track: "roleB", label: "能接受戶外體力負荷", summary: "先想清楚搬運、日曬與高處工作對自己是否可持續，並把職安支援列成挑工作條件。", interviewQuestions: ["班組怎麼安排熱危害與屋頂作業督導？遇到停工怎麼改派或計薪？"] },
      { id: "tw-solar-travel", track: "roleB", label: "可以配合跨縣市案場", summary: "集合、交通、外宿與回家頻率會改變一份工作的實際負擔。", interviewQuestions: ["班組從哪裡集合，跨區交通和住宿由誰負擔，有沒有寫進條件？"] },
    ],
    defaultInterviewQuestions: ["什麼成果是這個職位自己交的？", "第一季有誰複核，哪一項工作須有額外訓練或授權？"],
    crossTrackNote: "可能喜歡畫圖又想在現場走動，也可能喜歡施工但在乎固定地點。兩欄各讀自己的結果，用來選職缺與面試題。",
    offlinePrintHint: "列印前記下一項想看的工作證據、一項可接受的條件，以及一個準備問的問題。",
  },
  desktopExercise: {
    sectionTitle: "五分鐘紙面試做：同一份太陽光電改版單",
    summary: "任選一軌，在五分鐘內寫待查單。兩軌皆記最新版單線圖的版次與款別、照片款別與日期是否缺漏，再標待查。只讀公開文件與下方虛構紀錄，零登高、零通電。全題只判斷文件能否結案，實際評估與核可均由具資格及授權的人員處理。",
    publicLinksHeading: "公開文件：",
    publicLinks: [
      { label: sources.voltage.label, href: sources.voltage.href, note: "看直流電路電壓計算的說明。連結若暫時打不開，照下方摘要作答。" },
      { label: sources.roofChecklist.label, href: sources.roofChecklist.href, note: "看第 8 頁屋頂作業前安全檢核表的日期與結果欄。連結若暫時打不開，照下方摘要作答。" },
    ],
    factSummaryHeading: "離線資料卡：",
    factSummary: `公開資料摘要。光電直流電路電壓須檢視低溫修正。屋頂作業前檢核表記錄查核日期及結果。題內係數和限值均為虛構，僅供紙面試算。

虛構紀錄。最新版單線圖 ${exercise.currentVersion} 把變流器改為「${exercise.currentModel}」，舊版 ${exercise.priorVersion} 是「${exercise.photoModel}」。同張 B 版模擬單線圖的串列含 ${exercise.moduleCount} 片模組，每片開路電壓 ${exercise.moduleVoc} 伏特，卡片給定 ${exercise.lowTemp}°C 的修正係數 ${exercise.correctionFactor}，模擬上限 ${exercise.mockLimit} 伏特。紙面算式為片數乘單片電壓，再乘係數。現場交來的照片標註「${exercise.photoModel}」，拍攝日期空白。屋頂作業檢核表只有送件記號，${exercise.missingSite}未填。這些是本題全部資料。`,
    taskA: {
      title: "設計軌｜寫一筆設計待查",
      instruction: "交一筆改版差異、冷天電壓算值及是否碰到模擬上限，寫明交給誰複核，標註待查。",
    },
    taskB: {
      title: "安裝軌｜寫一筆現場待查",
      instruction: "交一筆屋頂作業前防護紀錄的缺件列，寫下日期與結果未填，標註待查、補查窗口與不得據此放行。",
    },
    rubricTitle: "對照樣答",
    rubricHeading: "每軌檢查四項",
    rubricPassRule: "兩項共用加兩項本軌都命中，才算完成紙面待查單。",
    rubricItems: [
      "共用｜對到最新版單線圖與現場照片，明寫版本及款別差異。",
      `共用｜留在${exercise.state}，並指出${exercise.photoField}缺件。`,
      `設計｜算得 ${trialVoltage.toFixed(1)} 伏特，超過模擬上限 ${trialExcess.toFixed(1)} 伏特。`,
      `設計｜清楚交給${exercise.designOwner}補查後覆核。`,
      `安裝｜找出屋頂${exercise.missingSite}兩欄空白。`,
      `安裝｜交${exercise.siteOwner}追查，未取得書面複核前不放行。`,
    ],
    sampleAnswerALabel: "設計軌樣答：",
    sampleAnswerA: `${exerciseVersionCheck}試算 ${exercise.moduleCount}×${exercise.moduleVoc}×${exercise.correctionFactor}＝${trialVoltage.toFixed(1)} 伏特，比模擬上限高 ${trialExcess.toFixed(1)} 伏特。交${exercise.designOwner}複核輸入與版次，保留待查。`,
    sampleAnswerBLabel: "安裝軌樣答：",
    sampleAnswerB: `${exerciseVersionCheck}屋頂作業前防護紀錄的${exercise.missingSite}空白。把缺欄與照片交${exercise.siteOwner}補查；書面複核前不放行。`,
  },
  tools: {
    title: "按現在要做的決定，選一個工具",
    summary: "你可以先確認想投的工作、可接受的條件，也可以記下一個要追查的問題。",
    cards: [
      { id: "holland", badge: "工作興趣", meta: "霍蘭德 60 題", tone: "accent", title: "先確認哪種日常工作吸引你", description: "用興趣六維整理自己想多做的工作活動。再回頭看想花時間在電力圖說、現場安裝，還是其他領域。", purposeHint: "還沒定方向時適用。", ctaLabel: "開始霍蘭德職業興趣測試", href: "/zh-TW/tests/holland-career-interest-test-riasec" },
      { id: "career94", badge: "工作方式", meta: "職業測試 94 題", tone: "roleB", title: "整理可以接受的工作方式", description: "從工作活動、工作方式和工作條件整理偏好，例如跨區移動、工作環境與協作責任。", purposeHint: "對光電有興趣，還在釐清條件時適用。", ctaLabel: "前往職業測試", href: "/zh-TW/tests/career-planning-and-work-style-test" },
      { id: "compare", badge: "兩份候選", meta: "職業對比", tone: "roleA", title: "把另一個目標職務放進來比", description: "例如選電機工程師或電工，再核對主要成果、進入條件與日常代價。", purposeHint: "手上已有兩個職務名稱時適用。", ctaLabel: "前往職業對比", href: "/zh-TW/career/compare" },
      { id: "worksheet", badge: "記錄行動", meta: "探索工作表", tone: "neutral", title: "把要核對的錄取條件帶到面試", description: "記一項要看的交付物、一項工作條件和下一次跟進的窗口，用工作表複製或列印。", purposeHint: "已有候選，想留下比較紀錄時適用。", ctaLabel: "開啟我的工作表", href: "/zh-TW/career/interest-worksheet#my-worksheet" },
    ],
    profileLinksLabel: "分開看兩個職業介紹",
    profileLinks: [
      { label: "太陽能系統工程師職業介紹", href: "/zh-TW/career/jobs/solar-energy-systems-engineers" },
      { label: "太陽光電安裝技術員職業介紹", href: "/zh-TW/career/jobs/solar-photovoltaic-installers" },
    ],
  },
  faqs: [
    {
      id: "tw-solar-job-title",
      question: "職缺都寫「太陽能工程師」，怎麼看是設計、工務還是安裝？",
      answer: "要求交發電估計、配置圖或單線圖，偏系統設計。要求協調進度、物料與品質，偏工務。要求完成架台、鋪板或配線並回報現場，偏安裝。也有一份工作兼場勘與施工管理。找職缺請看第一季的交件對象，工程組出的圖說與工班的完工紀錄會指向不同的職涯累積。",
    },
    {
      id: "tw-solar-pay",
      question: "太陽能系統工程師和光電安裝，誰的薪資比較值得接？",
      answer: "先比較同城同資歷的年度保證收入與必要成本，再看想往哪一種責任升級。譬如設計職的專案獎金要等驗收，應把哪些款確定可領、何時領和可能延到次年各記一欄。現場職按日計薪時，要把雨天待工和自付外宿放進同一份月行事曆；同樣的日薪遇到工日不同，年度差額就不同。設計定級可核公司是否認列自己能說明的選型理由及改版處理，現場定級可核公司是否認列識圖、自檢與帶班。初階工作如果一年下來只抄圖、搬料或填進度，找不到誰會讓你接到核心交付，先把學習機會的差異算進去。",
    },
    {
      id: "tw-solar-cert",
      question: "先考電機工程技師、太陽光電設置乙級，還是室內配線？",
      answer: `想走依法出具電機設計、監造或簽證文件，查電機工程技師考試與執業。想把讀圖、安裝及維護能力用於光電現場，查太陽光電設置乙級。${declarationBoundary} 如果目標是建物內的線路，另查室內配線職類及承裝業用人規定。`,
    },
    {
      id: "tw-solar-grid",
      question: "台電併聯通過、設備登記與工程驗收有什麼差別？",
      answer: "併聯看設備與電網的介面，台電按案處理；設備登記由能源主管機關按認定與設置資料審查；工程驗收依工程契約和案場管控流程辦理。以台電手冊為參考時，可先看申請表的裝置容量、併聯方式及責任分界點三欄。交一份完工照片時，也要知道它支持的是現場成果、哪個登記附件，以及哪項外部審查仍待確認。",
    },
    {
      id: "tw-solar-switch",
      question: "有水電或機電背景，打算轉進光電，先投哪一側？",
      answer: "已有配線、識圖與現場自檢經驗，可先看光電電機安裝或施工協調；已有電機設計、設備選型和圖說版本管理經驗，可先看系統設計。兩條路都能用過去結果說清楚自己交過什麼。從施工轉進設計時補氣象與發電模擬，從設計轉到工班則補受訓、現場授權與交件實務。",
    },
    {
      id: "tw-solar-roof",
      question: "所有安裝都要爬屋頂嗎？工作負擔差在哪裡？",
      answer: "屋頂型的重點是出入、屋面、墜落風險與雇主安排的督導；地面型也有室外高溫、搬運及長距離移動等條件。場址不同，支架和模組工作的體力耗損也不同。應徵時先辨識會派哪一種班組、多少時間在戶外、集合與外宿怎麼安排。趕工日也要依案場的安全責任與派工處理。",
    },
    {
      id: "tw-solar-automation",
      question: "2026 年的 PVsyst 和自動化工具能做到哪一步？",
      answer: "PVsyst 可依輸入模型出月發電估計、損失圖和參數報告。表單或試算表也可幫忙找到空白欄、重複序號或型號不一致。遮蔭與氣象條件是否適用、換型號後的圖說是否可用，仍由工程人員用原資料複核。屋況、現場自檢、簽證和台電審查要由相應人員查驗。工具可以整理疑點，正式文件要保留證據和負責人。",
    },
    {
      id: "tw-solar-thirty-day-faq",
      question: "四週作品哪一件最適合帶去面試？",
      answer: "投設計，帶有測站期間、單位、缺測與下一步的觀測比較表；投安裝，帶能對到相片、設備與缺件責任的模擬索引。挑一頁能說清楚你是怎麼從原資料得出判斷的作品。",
      requiresPlugin: "thirtyDay",
    },
  ],
  sourceGroups: [
    {
      id: "tw-solar-work-evidence",
      title: "臺灣職類、職能與雇主樣本",
      links: [sources.classification, sources.industry, sources.designJob, sources.mixedJob, sources.structuralJob, sources.electricalJob, sources.localModel, sources.contract, sources.pvsyst],
    },
    {
      id: "tw-solar-pay-evidence",
      title: "薪資表及給付定義",
      links: [sources.payMethod, sources.pay, sources.wages],
    },
    {
      id: "tw-solar-responsibility-evidence",
      title: "臺灣設置、併聯、技師與承裝資格",
      links: [sources.renewable, sources.installLaw, sources.declaration, sources.structural, sources.voltage, sources.grid, sources.engineerExam, sources.engineerLicense, sources.designScope, sources.pvCertificate, sources.wiringCertificate, sources.contractor],
    },
    {
      id: "tw-solar-site-evidence",
      title: "光電案場與屋頂職安",
      links: [sources.safety, sources.roofChecklist, sources.prevention, sources.heat],
    },
    {
      id: "tw-solar-thirty-day-sources",
      title: "四週作品公開材料",
      requiresPlugin: "thirtyDay",
      links: [sources.weather, sources.equipmentForms, sources.gridPortfolio],
    },
  ],
};
