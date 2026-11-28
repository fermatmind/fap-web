import type { ModularComparisonSpec } from "../modularComparison";

const sources = {
  classification: { label: "主計總處｜職業標準分類第六次修訂", href: "https://ws.dgbas.gov.tw/001/Upload/463/attachment/11196/90027/141413555071.pdf", note: "印頁 67–68，區分 2161、2162、2163 與 2171。" },
  survey: { label: "勞動部｜114 年職類別薪資調查統計結果", href: "https://www.mol.gov.tw/1607/1632/1633/90814/", note: "月經常性薪資、全年薪資所得與適用對象見註 1–3。" },
  allPay: { label: "勞動部｜全體工業及服務業表 3（ODS）", href: "https://statdb.mol.gov.tw/html/s3/svy14/1435003.ods", note: "景觀與都市交通為合併職類，室內設計另列。" },
  industryPay: { label: "勞動部｜專業、科學及技術服務業表 15（ODS）", href: "https://statdb.mol.gov.tw/html/s3/svy14/1435015.ods", note: "總計、建築與工程服務等行業、專門設計業分欄。" },
  interiorRules: { label: "建築物室內裝修管理辦法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070148", note: "第 9–10、15–20、22–30、32–34 條，涵蓋登記、圖說、審查和竣工。" },
  buildingAct: { label: "建築法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070109", note: "第 13、34、39、77-2 條，查設計監造、建照及裝修範圍。" },
  architectsAct: { label: "建築師法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070112", note: "第 6、8–9、16–19、28 條，查開業與設計監造責任。" },
  landscapeCert: { label: "中華民國景觀學會｜景觀師專業認證辦法", href: "https://www.landscape.org.tw/news/announces/351", note: "查考試資格、證書效期、平行換照與換證。" },
  accessibility: { label: "國土署無障礙設施設計規範", href: "https://www.nlma.gov.tw/uploads/files/e9abb44ff171074d23a7d1d5ee35b4a4.pdf", note: "無障礙通路章的室內外銜接與高差示意。" },
  buildingRules: { label: "建築技術規則建築設計施工編", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070115", note: "查內部裝修材料表及基地綠化、保水章節。" },
  retention: { label: "國土署建築基地保水設計技術規範", href: "https://www.nlma.gov.tw/uploads/files/0f741327224b557bd4f672ad1d610c46.pdf", note: "查透水鋪面的表層與基層。" },
  waterAct: { label: "水利法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0110001", note: "第 83-7 至 83-13 條，查書件、受理和技師簽證。" },
  runoff: { label: "出流管制計畫書與規劃書審核監督及免辦認定辦法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0110108", note: "第 2、2-1、3–5 條，核開發樣態、面積、免辦與核定。" },
  urban: { label: "都市計畫法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070001", note: "主要、細部計畫和分區管制。" },
  territory: { label: "國土計畫法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070230", note: "土地使用管制及分區圖公告轉換。" },
  eewh: { label: "建研所｜2023 年版綠建築評估手冊基本型", href: "https://www.abri.gov.tw/News_Content_Table.aspx?n=862&s=275191&sms=9511", note: "出版品簡介說明評定用途。" },
  eewhUpdate: { label: "建研所｜2026 年版綠建築評估指標更新", href: "https://www.abri.gov.tw/News_Content.aspx?n=745&s=340100&sms=9451", note: "綠化量整併至生物多樣性。" },
  eewhPhase: { label: "建研所｜2026 年版手冊實施期程", href: "https://www.abri.gov.tw/cp.aspx?n=23688", note: "推動成果（二）載實施日及自願提前適用。" },
  interiorJob: { label: "台灣就業通｜富品工程室內設計師職缺", href: "https://job.taiwanjobs.gov.tw/Internet/jobwanted/company_desc2.aspx?BRANCH_ID=&EMPLOYER_ID=2699879", note: "2026 年 10 月新北住宅翻修、圖說、估價與現場協調樣本。" },
  interiorCommercial: { label: "台灣就業通｜時工分設計住宅、商空與系統櫃職缺", href: "https://job.taiwanjobs.gov.tw/Internet/jobwanted/company_desc2.aspx?EMPLOYER_ID=2496781", note: "2026 年 10 月桃園，按職責分室內設計、系統櫃設計助理、繪圖與現場工作。" },
  landscapeJob: { label: "景觀學會代刊｜林同棪工程顧問景觀工程師／主管", href: "https://landscape.org.tw/news/announces/1040", note: "2026 年 8 月臺北公園及道路景觀、數量計算和施工釋疑樣本。" },
  landscapeEntry: { label: "景觀學會代刊｜台灣高野景觀規劃徵才", href: "https://landscape.org.tw/news/announces/994", note: "2026 年 3 月宜蘭，應屆生及提案、工地查核、維護學習樣本。" },
  localReview: { label: "臺北市｜室內裝修案件審查人員自我檢視表", href: "https://www-ws.gov.taipei/001/Upload/845/relfile/-1/845/b4c1b450-1254-4745-bd94-2be6ff4e7800.pdf", note: "113.03 版，臺北市圖說簽章、材料與通路文件範例。" },
  exam: { label: "技能檢定中心｜建築物室內設計乙級術科公告", href: "https://www.wdasec.gov.tw/News_Content.aspx?Create=1&n=F240F6BB01FE46BA&s=729F04774193A345&sms=DD855C7DF840A224&state=F5D336F102ACBC68", note: "公告正文列大樣、天花板平面及單向立面評閱重點。" },
  zoningMap: { label: "臺北市開放資料｜都市計畫使用分區圖", href: "https://data.taipei/dataset/detail?id=3bab0a01-7936-4218-8cb5-f74dfcb43dda" },
  trees: { label: "臺北市開放資料｜行道樹及公園樹木分布圖", href: "https://data.taipei/dataset/detail?id=7a49d00c-a5ff-4a6b-be9e-aaa6dc1ff7e8" },
  runoffForms: { label: "行政院公報｜出流管制計畫書與規劃書格式", href: "https://gazette.nat.gov.tw/egFront/eguploadpubWrapper?file=%2FEG_FileManager%2Feguploadpub%2Feg032082%2Fch04%2Ftype3%2Fgov31%2Fnum13%2FEg.htm&metaid=165467", note: "115 年 5 月 8 日公告；兩公頃是該公告的書件格式分流。" },
  ucan: { label: "教育部 UCAN｜建築規劃設計職能與職業描述", href: "https://ucan.moe.edu.tw/search/search_1_4.aspx?f1=ACC&f2=1" },
  autocad: { label: "Autodesk｜AutoCAD 2026 資料萃取", href: "https://help.autodesk.com/cloudhelp/2026/CHT/AutoCAD-Core/files/GUID-B0D32260-45E3-4643-B574-7F6C31579B68.htm" },
  qgis: { label: "QGIS｜向量套疊與交集", href: "https://docs.qgis.org/3.44/en/docs/user_manual/processing_algs/qgis/vectoroverlay.html" },
} as const;

const pay = {
  overall: {
    interior: "7,961 人、月薪 50,555 元、年薪 71.0 萬元",
    landscape: "1,044 人、月薪 51,464 元、年薪 69.8 萬元",
  },
  professional: {
    interior: "2,529 人、月薪 49,975 元、年薪 68.6 萬元",
    landscape: "638 人、月薪 48,623 元、年薪 63.4 萬元",
  },
} as const;

const signature = "室內裝修圖說由開業建築師或專業設計技術人員署名負責。分間牆變更若經審查機構認定涉及公共安全，須由開業建築師簽證。";

const exercise = {
  point: "東側入口 E1",
  baseline: "甲版現況底圖已複核，室內、室外均標為零點",
  draft: "乙版改圖待查，室內沿用零點，室外留白",
  gap: "缺同一基準的室外標高實測紀錄",
  interiorGap: "牆材表缺型號與部位相符的耐燃等級證明",
  outdoorGap: "鋪面表有透水磚型號，缺同位置的基層剖面",
} as const;

const versionSummary = `${exercise.point}，${exercise.baseline}；${exercise.draft}。`;

export const interiorLandscapeComparisonZhTwSpec: ModularComparisonSpec = {
  pairId: "interior-designers-vs-landscape-architects",
  locale: "zh-TW",
  title: "室內設計師 vs 景觀建築師：臺灣薪資、證照與工作差異",
  shortTitle: "室內設計師 vs 景觀建築師",
  description: "在臺灣選室內設計師還是景觀設計師？比較住宅與商空、景觀規劃與公園設計的交付物、薪資、室內設計乙級與景觀師認證，再用五分鐘試做找出自己想負責的工作。",
  regionLabel: "臺灣",
  authorName: "費馬測試編輯部",
  datePublished: "2026-11-27",
  dateModified: "2026-11-27",
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: "同一間圖書館，室內設計師想的是推著嬰兒車進門後，怎麼順手找到服務台；景觀設計師想的是雨天從人行道走到門口，沿路會不會積水、哪一段有樹蔭。前者把人的動線、材料與設備落到室內施工圖。後者拿地形、排水、鋪面和植栽規劃戶外空間。臺灣職缺可用「景觀設計師」或「景觀工程師」找這一側，再用成果辨識偏綠地設計還是基地與都市規劃。",
    roleA: { badgeTitle: "室內設計師", riasecLabel: "霍蘭德 ARC", aliases: "室內設計師、設計助理", keywords: "住宅翻修、商業空間、材料與施工圖說" },
    roleB: { badgeTitle: "景觀建築師／景觀設計師", riasecLabel: "霍蘭德 RIA", aliases: "景觀設計師、景觀工程師、景觀規劃設計", keywords: "公園綠地、場地配置、基地保水與植栽" },
    interviewBoundaryTitle: "從第一份交付物辨認職缺",
    interviewBoundaryQuestions: [
      "室內職是做格局與施工圖，還是從門市接洽、系統櫃配置與報價開始？第一份能獨立負責的圖是哪一張？",
      "景觀職是做基地調查、配置和植栽圖，還是做土地使用或可行性報告？哪份成果會跟到細部設計？",
    ],
    riasecBoundaryNote: "何倫碼顯示本站職業資料的前三項興趣線索。可用來找願意投入的活動，法定資格、技能和錄用仍各有條件。",
  },
  topology: {
    title: "一扇門把兩套圖說接起來",
    summary: "室內把生活需求轉成可估價、可施工的圖說；景觀把基地條件轉成可使用、可維護的戶外空間。兩邊在入口共用一條通路與一套高程基準，進度往後走時也要共用改版紀錄。",
    ariaLabel: "室內設計由需求、配置到施工圖，景觀設計由盤點基地、配置到植栽及鋪面圖，雙方交接入口高程與圖說版次。",
    leftZoneTitle: "室內設計",
    leftSteps: [
      { title: "讀懂需求", detail: "使用情境與現況" },
      { title: "調整配置", detail: "動線與材料" },
      { title: "整理圖說", detail: "施工圖與估價" },
    ],
    centerZoneTitle: "入口界面",
    upperBridge: { title: "通路銜接", line1: "室內外同一定位", line2: "共用高程基準" },
    lowerBridge: { title: "圖說交接", line1: "更新平剖面版本", line2: "保留審查責任" },
    rightZoneTitle: "景觀設計",
    rightSteps: [
      { title: "盤點基地", detail: "地形水流與現有樹木" },
      { title: "配置空間", detail: "通路鋪面與植栽" },
      { title: "交接維護", detail: "剖面數量與養護" },
    ],
  },
  matrix: {
    title: "兩種設計職，八個日常差異",
    summary: "室內作品要解釋房間怎麼用，景觀作品要解釋場地怎麼走、怎麼排水和養護。",
    roleAColumn: "室內設計師",
    roleBColumn: "景觀建築師／景觀設計師",
    expandButtonLabel: "展開審查、入行與工作條件",
    collapseButtonLabel: "收合審查、入行與工作條件",
    rows: [
      { id: "scope", dimension: "問題從哪裡來", roleA: "住宅翻修先核使用需求和既有格局。商業空間往前多想一步，顧客怎麼走、員工怎麼補貨，動線能否在原有柱位與設備條件下同時成立。", roleB: "社區中庭、公園、校園或街道先看誰在走、地勢往哪降、要保留哪些樹。前期先看現行分區與基地限制，釐清配置和土地使用程序。", defaultVisible: true },
      { id: "daily", dimension: "每天在做什麼", roleA: "丈量、談需求、畫配置、比樣品、回工班問題。以店面為例，展示牆移位後要回頭看插座、照明、設備維修空間和報價是否一起改。", roleB: "踏勘、讀地形和既有樹木資料，做路徑與開放空間方案，再畫鋪面與植栽。顧問職也可包含可行性報告、數量計算及跨專業釋疑。", defaultVisible: true },
      { id: "tools", dimension: "用哪些工具", roleA: "AutoCAD 處理需互相對照的平面、立面、剖面與細部，SketchUp 做比例和空間感溝通。提案模型改完還要追施工圖與材料表，避免圖好看但工班各讀各的。", roleB: "用 QGIS 比對土地使用與既有樹木圖層，用 CAD 畫基地配置、水平與垂直界面。SketchUp 幫團隊先看步道和坡地關係，測量資料和高程基準仍需交代來源。", defaultVisible: true },
      { id: "deliverables", dimension: "交件以什麼為準", roleA: "提案要讓業主同意空間和預算；後續圖說把尺寸、材質、設備界面和工種交接寫全。面材換型號時，從圖面定位追到材料證明和估價的相同品項。", roleB: "方案交基地平面、剖面、鋪面與植栽配置，施工協調再接數量和材料表。打算保留的樹要能從調查紀錄找到，在管理移交時說清養護或補植責任。", defaultVisible: true },
      { id: "tradeoffs", dimension: "方案卡關在哪", roleA: "家具、燈具和隔間會搶空間。老屋拆除後若發現現況與圖不符，先把測量差異、影響的工項與改價範圍整理給負責人，讓業主知道取捨。", roleB: "樹需要生長空間，通路要連續，排水也要能接下游。加大廣場時可對照增加的鋪面、減少的遮蔭和要補驗的保水資料，再讓團隊選方案。", defaultVisible: true },
      { id: "review", dimension: "程序與簽署", roleA: "先確認是否屬應辦室內裝修的案件及是否涉及變更使用、消防安全設備。室內專業設計技術人員可署名的圖說，與應由開業建築師簽證的公共安全事項分開。", roleB: "核對國土計畫與都市計畫的現行適用法令。建築物設計、出流管制技師簽證和土地開發核定，各有對應角色；提供景觀圖資可以是投標或送審的一環。", defaultVisible: false },
      { id: "entry", dimension: "入門與進階", roleA: "可以從設計助理或施工圖、系統家具配置切入；進設計專案前練習把丈量、配置、材料與估價說成同一套成果。想承擔法定設計署名，再走專業設計技術人員登記。", roleB: "可先從景觀顧問的調查、製圖和數量表切入，或走偏公園、校園的設計團隊；想轉土地規劃，可再補分區判讀、基地分析與報告。學會認證有經驗門檻。", defaultVisible: false },
      { id: "conditions", dimension: "要接受哪些工作代價", roleA: "住宅專案要反覆對業主選擇、預算與工班；店面案也可能卡交屋或開幕日。把丈量、場勘、改圖及工期內聯繫分開問，才能估每週實際時間。", roleB: "同一案可跨勘查、設計、預算與完工移交；戶外測量、出差及公共案報告各有時間成本。投遞前先看分工，以免把整天做圖或要全程跑工地當成理所當然。", defaultVisible: false },
    ],
  },
  incident: {
    title: "入口移半公尺，室內和景觀要各重核什麼？",
    summary: "情境模擬。社區圖書館要整修一樓和前庭，兩組圖說如何對齊門位及高程？",
    triggerLabel: "觸發：",
    triggerBody: "承辦希望把服務台移到門口，室內新平面同時把出入口往東移。前庭已有植栽和排水配置，景觀平面仍引用原門位，兩組圖面各看各的都畫得下。",
    triggerCaveat: "模擬工程由業主暫緩發圖，兩組先用同一測量底圖核對。",
    rows: [
      { stage: "定位", roleLabel: "室內設計", tone: "roleA", verifiedFacts: "原核對平面有入口、服務台與室內走道；新版已改門位與設備配置。", openGaps: "新門位與室外鋪面剖面不符，待確認門內外高程、進門轉向及材料標註。", actionAndApproval: "製圖者拉出一張入口對照剖面，指明既有與擬改圖；由室內設計負責人核對圖說，本案依法需要簽證時，再交適格人員。" },
      { stage: "對圖", roleLabel: "景觀設計", tone: "roleB", verifiedFacts: "景觀底圖有既有樹位、步道、鋪面排水方向及舊入口位置。", openGaps: "新動線影響哪一段鋪面、樹木保留或排水界面，室內外尚未把同一高程基準寫入剖面。", actionAndApproval: "景觀設計負責人先整合測量和鋪面資料，再把出入口位置、標高基準與改動範圍交室內與承辦建築師複核。依法需技師辦理的書件另交相應技師。" },
      { stage: "送審與發圖", roleLabel: "業主與各專業窗口", tone: "roleA", verifiedFacts: "可追到原核准版與團隊改版紀錄。", openGaps: "新增或改動的工項要不要重審，以及相應圖說的簽署權責。", actionAndApproval: "業主確認方案、預算與發圖。應重新審核的裝修改版由申請人辦理，主管建築機關或審查機構審查，施工單位使用通過審查的適用版次。" },
    ],
    recoveryAcceptanceTitle: "改版可交付時，兩套圖要對得起來",
    recoveryAcceptanceCriteria: "從室內平面與前庭配置指到同一個門位，剖面採同一基準並列高程，材料與鋪面缺件都有對照附件或明確處理紀錄。應辦審查者確認核准圖說，施工單位拿到同一版。裝修完工再以核准與竣工圖說申請竣工查驗，依案件辦理相關查驗及合格證明。",
    defenseLayerNote: "業主同意的是方案，專業人員負責其署名或簽證，法定審查、許可由主管建築機關核發，審查及查驗由主管機關或審查機構辦理。",
  },
  payAndCerts: {
    title: "臺灣薪資怎麼比，兩條路各有哪些證照？",
    summary: "整體薪資供定位。實際聘用談職等、給付與要擔的簽署責任。",
    salaryHeading: "從官方雙表到同城聘用條件",
    salaryBody: `勞動部職類別薪資調查表 3 以臺灣工業及服務業全時受僱員工為範圍，室內設計師為 ${pay.overall.interior}，景觀設計師、都市及交通規劃師合併職類為 ${pay.overall.landscape}。表 15 限專業、科學及技術服務業，室內設計師為 ${pay.professional.interior}，景觀合併職類為 ${pay.professional.landscape}。往下一層看，室內設計師有專門設計業的發布值，景觀合併組數值列在建築與工程服務等行業，兩者缺同一細行業可並排的發布值。金額均為新臺幣。人數與平均經常性月薪為 114 年 7 月資料，平均全年薪資所得適用 113 年全年在職者。全調查回收 9,977 家事業單位，不含雇主、自營與部分工時者。全體表的景觀合併組月薪較高，室內設計師全年薪資較高；切到專業服務業，月薪改為室內設計師較高。兩表看得出群組與產業差異，無法推算單一景觀職稱和室內設計師在同城同資歷的差額，也無法推回獎金。

受僱月薪先拆本薪及固定津貼，專案、績效與年終按聘書條件另計。室內商空或住宅職若另有簽約獎金，分清計入的是簽約額、已收款或毛利，追加減與退單也會改基數。景觀顧問職可用月薪談固定收入，若兼出差、工地檢查或帶案，另看津貼、加班、專案結案及職務加給的書面規則。比現場工作時，把日薪乘保證計薪日、再核加班。接案先扣材料、人力、外包，另留管理、保固及收款空檔。

同城同資歷先算保證全年收入：本薪與每筆固定津貼各乘保證發放次數，再加書面保證獎金。若約定保證十四個月，先看多兩次以本薪或固定總額計。把條件式獎金移到第二欄，再列工時、跨點交通、工地日與補休，逐項比較。想看下一級，室內職可看能否獨立提案、估價及處理變更，景觀職可看能否負責基地分析、數量和跨工種圖說；有證照加給或要負署名責任時，再對應實際職等及登記責任。`,
    certs: [
      { name: "建築物室內設計乙級以上技術士與專業設計技術人員", officialScope: "領有建築師證書可作資格途徑。走技術士途徑，須持建築物室內設計乙級以上技術士證，並在申請前五年內完成內政部主辦或委託的室內設計指定訓練至少二十一小時、取得結業證書，再申領專業技術人員登記證。", workplaceBoundary: signature, verificationTips: "依職責核個人登記效期和業者可承接的業務。", officialLinks: [sources.interiorRules, sources.exam] },
      { name: "室內裝修專業施工技術人員", officialScope: "建築師、土木或結構工程技師證書是法定途徑之一。技術士途徑接受建築物室內裝修工程管理、建築工程管理、裝潢木工或家具木工乙級以上，並有申請前五年內的指定工程管理訓練至少二十一小時，木工兩類各另有加訓規定，最後申領登記證。", workplaceBoundary: "施工與設計分途登記。屬簡化申報的案件，竣工查驗合格檢查表另有營造業專任工程人員或室內裝修業專業施工技術人員簽章規定。", verificationTips: "核人員登記類別、效期及受委託的施工範圍。", officialLinks: [sources.interiorRules] },
      { name: "中華民國景觀學會景觀師認證與依法開業的建築師", officialScope: "景觀學會認證考試途徑要求會員、五年以上相關工作經驗且持續從事景觀專業，學術科通過後由學會發證。開業建築師另依建築師法辦理開業登記、設立事務所並加入公會。", workplaceBoundary: "學會認證可呈現景觀專業經歷。若案型涉及依法應由建築師負責的建築物設計監造，須按建築法及其例外配置適格人員；出流管制的法定簽證另外查水利法。", verificationTips: "用契約和法規比對該角色的資格與簽署責任。", officialLinks: [sources.landscapeCert, sources.buildingAct, sources.architectsAct, sources.waterAct] },
    ],
    interviewChecklistTitle: "從職等與作品核對聘用範圍",
    interviewChecklistQuestions: [
      { label: "專案自主", question: "這一級能否直接跟業主談方案和預算，或把基地分析一路做到說明與細部圖？" },
      { label: "分工", question: "哪一項圖說或數量近半年能由新人做完，誰複核？計價或送審責任在哪個職等開始？" },
      { label: "固定給付", question: "哪些加給寫進聘書？條件式獎金用簽約、入帳、案場或完工哪個節點認列？" },
    ],
  },
  thirtyDayPlugin: {
    badge: "四週雙軌作品",
    title: "一個月做出看得出選擇理由的作品",
    summary: "選一軌，用下方四週公開材料準備面試作品。若 PDF 暫時打不開，室內先列平面、天花板、材料和簽章，景觀先列分區、樹況、保水證據和出流書件。",
    tracks: [
      { id: "interior-portfolio", title: "室內設計｜住宅到小店面", badge: "圖說與材料", tone: "roleA", weeks: [
        { weekLabel: "第一週", deliverable: "沿用臺北市審查表的空間名稱與出入口欄，畫兩版模擬店面。標出接待、排隊和補貨的衝突，附選案理由。" },
        { weekLabel: "第二週", deliverable: "照術科公告的檢核提示交天花板平面與單向立面。對上牆線和管道間，指出一處燈具或櫃體可能衝突。" },
        { weekLabel: "第三週", deliverable: "按臺北市圖審表做材料索引。至少三項各列使用部位、圖號和證明狀態，欠資料就寫出缺件。" },
        { weekLabel: "第四週", deliverable: "按裝修辦法整理一頁版次交接。自訂業主變更，交新舊圖、估價差異、複核者與應附證明。" },
      ] },
      { id: "landscape-portfolio", title: "景觀設計｜公園到基地規劃", badge: "圖資與場地", tone: "roleB", weeks: [
        { weekLabel: "第一週", deliverable: "取臺北市都市計畫使用分區圖的一個公園街廓。註明資料期、座標及主要／細部計畫，圖例區分公園、鄰地與道路。" },
        { weekLabel: "第二週", deliverable: "取同區三筆公園樹木資料，交一張樹種、樹高、調查日和座標清單及位置圖。標出要再查樹況的範圍。" },
        { weekLabel: "第三週", deliverable: "依基地保水規範比較兩案，列通行、保留樹與鋪面三項取捨。交示意剖面索引，註明待測量或水利專業補件。" },
        { weekLabel: "第四週", deliverable: "讀出流管制公開格式，為底圖、配置、面積來源和待補水文資料做索引，並寫出規劃書與計畫書各在哪階段使用。" },
      ] },
    ],
  },
  checklist: {
    title: "技能想學，還要看工作條件能不能配合",
    summary: "分開勾你想磨的技能和可接受的案場條件，各帶一項去看職缺。",
    skillsHeading: "技能｜我想做什麼",
    skillsOptions: [
      { id: "interior-layout", track: "roleA", label: "用一張平面說明兩種配置的取捨", summary: "講得出動線、收納和設備牴觸在哪，知道要從哪幾張圖一起改。", interviewQuestions: ["新人可以接觸丈量底圖、平面提案和施工詳圖中的哪幾項？"] },
      { id: "interior-spec", track: "roleA", label: "把同一材料在圖說、證明和估價對起來", summary: "對型號、使用部位、數量和改價原因，有欠件時能交接。", interviewQuestions: ["前一次換材料時，誰把價格、圖面與規格證明整合？"] },
      { id: "landscape-layers", track: "roleB", label: "把分區、地形和既有樹一起讀", summary: "知道圖層的日期、座標基準和誤差，能標出待查處。", interviewQuestions: ["案子從基地調查到配置，團隊讓新人先負責哪一份資料？"] },
      { id: "landscape-sections", track: "roleB", label: "用剖面說出通路和排水界面", summary: "把地面標高與樹木保留寫成下一位看得懂的設計圖說資訊。", interviewQuestions: ["團隊怎麼把景觀變更交給建築、土木與維護窗口？"] },
    ],
    conditionsHeading: "條件｜我能接受哪種工作安排",
    conditionsOptions: [
      { id: "owner-conversations", track: "roleA", label: "接受和業主反覆協調預算與改圖", summary: "住家需求與店面開幕期限牴觸時，仍要讓業主理解取捨。", interviewQuestions: ["案場協調、假日看樣和臨時改圖由誰承接，如何計工時？"] },
      { id: "outdoor-site", track: "roleB", label: "可配合戶外踏勘、短期出差與多輪審查", summary: "山坡、道路、公園與校園的案場及會議條件各有差異。", interviewQuestions: ["這個職等一個月有多少天做現勘？另有多少時間寫報告和修改審查意見？"] },
      { id: "handover", label: "願意追到施工釋疑或後續維護", summary: "要面對初稿、核准和現況三者的差異，也得把責任交給下一位。", interviewQuestions: ["案子交付後由哪個團隊回覆施工疑問或接手維護？"] },
    ],
    defaultInterviewQuestions: ["可否看一頁經移除個資的交付樣式，了解版次和修改紀錄？", "到了第六個月，怎麼判定我能開始獨立交付一項成果？"],
    crossTrackNote: "兩側都想學，可看建築師事務所的室內外協作案。時間有限，先按案場區域和現場分工篩選。",
    offlinePrintHint: "圈選一項技能與一項工作條件，各寫下一份想確認的工作成果。",
  },
  desktopExercise: {
    sectionTitle: "五分鐘試做｜同一扇門，哪份圖說該補件？",
    summary: "選一軌。一分鐘讀卡、兩分鐘寫三行、兩分鐘自查。欄位取材自臺灣公開規範，門位與版次是模擬。只在紙上作答，不做現場操作。",
    publicLinksHeading: "三份臺灣公開原件：",
    publicLinks: [sources.accessibility, sources.buildingRules, sources.retention],
    factSummaryHeading: "離線欄位卡：",
    factSummarySegments: [
      { text: "規範讀法｜通路剖面看高差；裝修材料依法按用途與部位查耐燃；透水鋪面看表層及基層。", tone: "strong" },
      { text: `兩版圖｜${versionSummary}${exercise.gap}。` },
      { text: `附件清單｜${exercise.interiorGap}；${exercise.outdoorGap}。` },
    ],
    taskA: { title: "室內軌｜給設計負責人的便條", instruction: "寫入口與兩版高程、狀態。標記共用缺件與補件窗口，再寫牆材要補什麼並交誰核對。" },
    taskB: { title: "景觀軌｜給基地設計負責人的便條", instruction: "寫入口與兩版高程、狀態。標記共用缺件與補件窗口，再寫鋪面要補什麼並交誰核對。" },
    rubricTitle: "展開兩軌樣答與評分",
    rubricHeading: "每軌核對四項",
    rubricPassRule: "兩個共用項加所選軌兩項，四項都對才通關。",
    rubricItems: [
      "共用｜寫對入口、兩版來源、狀態與室內外高程。",
      "共用｜室外實測由測量窗口依同一基準補，乙版待查。",
      "室內｜判出缺對應型號及部位的耐燃等級證明。",
      "室內｜交給室內設計負責人核對材料證明與圖說。",
      "景觀｜判出缺同位置基層剖面，磚型號只表明表層。",
      "景觀｜交給景觀設計負責人核對鋪面表與基層剖面。",
    ],
    sampleAnswerALabel: "室內軌樣答：",
    sampleAnswerA: `${versionSummary}
${exercise.gap}，請測量窗口依同一基準補件，乙版留待查。
${exercise.interiorGap}，請室內設計負責人核對證明與圖說。`,
    sampleAnswerBLabel: "景觀軌樣答：",
    sampleAnswerB: `${versionSummary}
${exercise.gap}，請測量窗口依同一基準補件，乙版留待查。
${exercise.outdoorGap}，透水磚型號只說明表層，請景觀設計負責人核對鋪面表與基層剖面。`,
  },
  tools: {
    title: "接著做一件事，縮小投遞範圍",
    summary: "依手上的問題，選一個工具開始。",
    cards: [
      { id: "compare", badge: "兩個方向", meta: "雙職業對比", tone: "roleA", title: "改成你想投的兩個職位", description: "例如拿室內設計跟建築製圖比較，找出想做提案、詳圖或施工協調的哪一段。", purposeHint: "手上已有兩個職業選項。", ctaLabel: "前往職業對比", href: "/zh-TW/career/compare" },
      { id: "worksheet", badge: "記一個行動", meta: "探索工作表", tone: "neutral", title: "記下希望自己交得出來的成果", description: "把想做的圖說、能接受的案場條件和下一個查證動作排在一頁。", purposeHint: "已有方向，想帶走一份紀錄。", ctaLabel: "打開我的工作表", href: "/zh-TW/career/interest-worksheet#my-worksheet" },
      { id: "holland", badge: "工作興趣", meta: "霍蘭德 60 題", tone: "accent", title: "先找值得試做的工作活動", description: "看六項工作興趣和三字代碼。選出想多做的活動，再回這頁對照實際任務。", purposeHint: "想整理興趣，還沒鎖定方向。", ctaLabel: "開始霍蘭德職業興趣測試", href: "/zh-TW/tests/holland-career-interest-test-riasec" },
      { id: "career94", badge: "工作方式", meta: "職業測試 94 題", tone: "roleB", title: "核對工作活動、方式與條件", description: "梳理在協作、現場與工作節奏上的偏好，再對照手上的職缺。", purposeHint: "對工作有興趣，想確認環境。", ctaLabel: "前往職業測試", href: "/zh-TW/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "分開看兩個職業介紹",
    profileLinks: [
      { label: "室內設計師職業介紹", href: "/zh-TW/career/jobs/interior-designers" },
      { label: "景觀建築師職業介紹", href: "/zh-TW/career/jobs/landscape-architects" },
    ],
  },
  faqs: [
    { id: "which-track", question: "想做住宅、商空或公園，職缺該用什麼關鍵字？", answer: "想做住宅與店面，找室內設計師、設計助理或商業空間設計。想做公園步道、植栽和雨水規劃，找景觀設計師或景觀工程師。偏土地使用分析或公共設施報告，還可用都市規劃找職缺。" },
    { id: "interior-license-use", question: "有室內設計乙級就能簽室內裝修圖嗎？", answer: `走技術士途徑須完成指定訓練並取得專業設計技術人員登記。拿到建築物室內設計乙級技術士證只是這條路的一步，業者的室內裝修業登記也要與承接業務相符。${signature}` },
    { id: "landscape-license", question: "景觀師證書能否簽建照？沒有證書能入門嗎？", answer: "中華民國景觀學會發的是景觀師專業認證；建築物依法應由建築師設計、監造時，要核建築法所定資格與例外。入門可投景觀助理、景觀設計和顧問製圖相關職，作品可先交底圖、配置和待查事項。學會認證的考試途徑有工作年資門檻。" },
    { id: "pay-grade", question: "工作滿半年，怎麼判斷還在做繪圖支援，還是已走向獨立設計定級？", answer: "從有沒有負責一項完整成果來看。室內設計若能留下需求、材料替代、估價差異和回覆，已比按紅筆描圖多一段設計判斷。景觀若能解說基準、配置如何避開保留樹，並回應排水或養護方的疑義，才能拿成果去談職等。把自己負責的圖、變更紀錄和複核意見湊成一套，再和職務說明的責任逐條對照。若接到的工作只有描圖或排版，優先確認能否換到有獨立小任務的案組。" },
    { id: "eewh-runoff", question: "基地保水、綠化、EEWH 和出流管制要一起做嗎？", answer: "先按案件分開判讀。建築基地綠化與保水先看建築技術規則；申請綠建築標章另查案用版次的 EEWH，2026 年新版保留基地保水，並將舊版綠化量整入生物多樣性，公布自 2030 年 7 月起實施，之前可自願採用新版。水利法的出流管制另核開發樣態、面積與逕流。列舉開發達一公頃要核。基地全在都市計畫區的新建建築物達 0.2 公頃應提計畫書。未達 1 公頃者，若規劃的雨水措施符合出流量或貯滯容量要求，且義務人在建照核發前備妥證明供地方主管機關備查，得免提計畫書。措施完工後，地方主管機關得會同檢查。涉及特定土地使用變更也要確認是否先提規劃書。出流管制計畫書及規劃書的簽證，由水利工程技師、水土保持技師或土木工程技師等相關專業技師辦理。" },
    { id: "career-switch", question: "室內設計轉景觀，作品集要補哪一頁？", answer: "先補一頁基地圖及一份標高來源說明。平面、比例與材料溝通可帶過去，還要交代分區、現有樹木、坡向和維護。反過來轉室內，可用同一塊店面畫兩個配置，把家具、照明、原有設備與估價的變更排在同一頁。" },
    { id: "automation-2026", question: "2026 年，室內與景觀設計有哪些工作可交給軟體或 AI？", answer: "可先把可規則化的資料整理交給軟體，把判斷和簽署留給相應人員。室內可用 AutoCAD 依圖塊屬性整理門件或材料清單，景觀可用 QGIS 套疊分區與基地範圍，篩出與基地相交的分區並保留屬性。AI 可協助整理會議草稿，需回原始圖說、測量與材料證明查對。圖說、材質證明、現地資料和適用法規要由人複核，正式簽署由依法有權責的人員負責。" },
  ],
  sourceGroups: [
    { id: "statistics", title: "臺灣職業分類與薪資統計", links: [sources.classification, sources.survey, sources.allPay, sources.industryPay] },
    { id: "credentials", title: "裝修、建築師與景觀師資格", links: [sources.interiorRules, sources.buildingAct, sources.architectsAct, sources.landscapeCert, sources.exam] },
    { id: "review", title: "室內與基地圖說、驗收及土地使用", links: [sources.accessibility, sources.buildingRules, sources.retention, sources.localReview, sources.waterAct, sources.runoff, sources.urban, sources.territory] },
    { id: "green-building", title: "EEWH 綠建築評估與版本", links: [sources.eewh, sources.eewhUpdate, sources.eewhPhase] },
    { id: "work", title: "臺灣職能與雇主樣本", links: [sources.interiorJob, sources.interiorCommercial, sources.landscapeJob, sources.landscapeEntry, sources.ucan] },
    { id: "software", title: "繪圖與圖資軟體文件", links: [sources.autocad, sources.qgis] },
    { id: "portfolio-materials", title: "四週作品用公開圖資與格式", requiresPlugin: "thirtyDay", links: [sources.zoningMap, sources.trees, sources.runoffForms] },
  ],
};
