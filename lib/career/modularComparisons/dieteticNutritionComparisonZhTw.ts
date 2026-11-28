import type { ModularComparisonSpec } from "../modularComparison";

const roleA = "膳食技術員";
const roleB = "營養師";

const sources = {
  practiceTeaching: { label: "臺中榮總｜營養室實習教學計畫", href: "https://www.vghtc.gov.tw/News_Content/6940/13137", note: "實習計畫的臨床營養照護及診斷紀錄教學。離線卡含本題需要的欄位。" },
  packageLabel: { label: "食藥署｜包裝食品營養標示規定", href: "https://foodlabel.fda.gov.tw/FdaFrontEndApp/Law/Edit?SystemId=ffecbbc0-eac3-4bb1-a91e-5ace76bbe31b" },
  homeCare: { label: "桃園市｜居家長照專業服務", href: "https://care.tycg.gov.tw/cp.aspx?n=384" },
  occupation: { label: "主計總處職業標準分類修訂對照", href: "https://ws.dgbas.gov.tw/001/Upload/463/attachment/11196/90027/05271411571.pdf", note: "第六次修訂細類 2293 與 3214。" },
  survey: { label: "勞動部職類別薪資調查摘要", href: "https://statdb.mol.gov.tw/html/s3/svy14/114summary.pdf", note: "調查對象、平均經常性薪資與全年在職所得定義。" },
  allPay: { label: "PSDN 表 3｜工業及服務業全體", href: "https://statdb.mol.gov.tw/html/s3/svy14/1435003.ods", note: "營養師列，工作表第 70 列。" },
  foodPay: { label: "PSDN 表 11｜住宿及餐飲業", href: "https://statdb.mol.gov.tw/html/s3/svy14/1435011.ods", note: "營養師列，第 18 列，正文取其他餐飲業欄。" },
  medicalPay: { label: "PSDN 表 18｜醫療保健及社會工作服務業", href: "https://statdb.mol.gov.tw/html/s3/svy14/1435018.ods", note: "營養師列，第 21 列，正文取醫療保健業欄。" },
  dietitianAct: { label: "《營養師法》", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=L0040006", note: "第 5、7、12 至 14、29 條分列名稱、執業、紀錄及適用界線。" },
  practice: { label: "營養師執業登記及繼續教育辦法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0040060", note: "執業申請、換發及繼續教育。" },
  exam: { label: "考試院｜專技高考營養師考試規則", href: "https://law.exam.gov.tw/LawContent.aspx?id=FL016887", note: "第 5、6 條及附表列明應考資格、實習及分科。" },
  physician: { label: "《醫師法》", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=L0020001", note: "第 11、12 條，醫師診察、開方及病歷責任。" },
  school: { label: "《學校衛生法》", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=H0020050", note: "學校營養、供膳與餐飲衛生規範。" },
  schoolFood: { label: "學校餐廳廚房員生消費合作社衛生管理辦法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0020051", note: "第 4 至 9 條人員資格、衛生管理及登載義務。" },
  foodAct: { label: "《食品安全衛生管理法》", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0040001", note: "第 8、12 條，食品衛生、適用業者及人員配置。" },
  hygiene: { label: "食品良好衛生規範準則", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0040122", note: "餐飲業製備及供應衛生章。" },
  haccp: { label: "食品安全管制系統準則", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0040116", note: "危害分析重要管制點與作業紀錄。" },
  foodScope: { label: "食藥署｜食品安全管制系統常用問答", href: "https://www.fda.gov.tw/tc/includes/GetFile.ashx?id=f638247707804126968&iid=12560&type=3", note: "Q31 餐盒食品工廠適用範圍。" },
  skills: { label: "技能檢定中心｜食品衛生及營養相關職類", href: "https://www.wdasec.gov.tw/News_Content.aspx?n=25D08F3407C71E8F&s=2656BF2CC841870E&sms=1BE761BDBCE7C913", note: "中餐烹調及食品檢驗分析分列職類。" },
  careKitchen: { label: "臺中市立仁愛之家｜行政助理（廚工）", href: "https://www.taichung.gov.tw/3421504/post", note: "2026-11 公開徵才樣本，點收、配膳、輪班與技術士條件。" },
  hospitalKitchen: { label: "高雄榮總｜契約廚務佐理員", href: "https://www.vghks.gov.tw/News_Content.aspx?n=C03011BF96C680C4&s=61298026B88EC8CE&sms=5EF61FB0D0F5B657", note: "2026-11 公開徵才樣本，庫房帳務、膳食供應及工作獎金。" },
  hospitalJob: { label: "林口長庚｜團膳營養師徵才樣本", href: "https://www.cgmh.org.tw/tw/Systems/RecruitContent/3/202602100008", note: "2026-02 公告，團膳、社區、臨床服務及輪班，月薪含津貼及績效。此案已截止。" },
  communityJob: { label: "彰化縣衛生局｜社區營養師徵才樣本", href: "https://www.chshb.gov.tw/node/219119818", note: "115 年長者健康計畫，工作項目、資格與考核調薪條件。" },
  referral: { label: "屏東榮總｜住院營養諮詢", href: "https://org.ptvgh.gov.tw/diet/cp.aspx?n=FFA3D5C692B4849A", note: "住院篩檢及照會如何轉交營養師。" },
  meals: { label: "屏東榮總｜住院病人供膳服務", href: "https://org.ptvgh.gov.tw/diet/cp.aspx?n=E580D744116C6A4A", note: "病膳類型、供膳流程與品質管理的具名醫院樣本。" },
  intakeForm: { label: "學校午餐食材驗收工具書", href: "https://mlunch.nat.gov.tw/manasystem/files/law/%E5%AD%B8%E6%A0%A1%E5%8D%88%E9%A4%90%E4%B8%89%E7%AB%A0%E4%B8%80Q%E7%95%9C%E7%A6%BD%E7%94%A2%E5%93%81%E9%A9%97%E6%94%B6%E5%AF%A6%E5%8B%99%E5%B7%A5%E5%85%B7%E6%9B%B8%282022%E7%89%88%29%28pdf%29%20%282%29.pdf", note: "查驗收紀錄範例；下載較慢可用下方離線卡。" },
  training: { label: "國教署｜校園食材登錄平臺 2.0 教育訓練", href: "https://mlunch.nat.gov.tw/manasystem/files/news/%E6%95%99%E8%82%B2%E8%A8%93%E7%B7%B4.pdf", note: "驗收資料匯入、菜單管理與供餐缺漏報表。" },
  reporting: { label: "教育部｜校園食材登載與供餐核對", href: "https://cpd.moe.gov.tw/articleInfo?id=36629", note: "2026 年供餐函，實際供膳、登載與不供餐日核對。" },
  foodData: { label: "食藥署｜食品營養成分資料集", href: "https://data.gov.tw/dataset/8543", note: "樣品、內容物描述及營養成分欄。" },
  schoolData: { label: "教育部｜校園午餐公開資料", href: "https://data.gov.tw/dataset/98339", note: "公開菜色與校園供餐資料。" },
  pastExam: { label: "考選部｜115 年團體膳食設計與管理考題", href: "https://wwwq.moex.gov.tw/exam/wHandExamQandA_File.ashx?c=102&code=115030&q=1&s=0202&t=Q", note: "以份數及乾鮮料成本練習團膳成本表。" },
  plate: { label: "國健署｜我的餐盤公開教材", href: "https://www.hpa.gov.tw/Pages/TopicList.aspx?nodeid=4687", note: "社區團體一般飲食衛教圖卡。" },
  schoolStaff: { label: "國教署｜充實學校午餐人力要點", href: "https://edu.law.moe.gov.tw/LawContent.aspx?id=GL001808&media=print", note: "受補助學校營養師及廚工職掌。" },
};

const surveyPay = {
  all: { month: "43,428", year: "62.6" },
  medical: { month: "44,145", year: "65.3" },
  food: { month: "39,388", year: "52.8" },
};
const monthlyIndustryGap = "4,757";

const exerciseFixture = {
  batch: "午餐甲",
  list: "有效配膳單",
  count: "二十四",
  kitchenNote: "備餐便條",
  packed: "二十二",
  difference: "兩",
  missing: "替補待核",
};
const exerciseCounts =
  `${exerciseFixture.batch}${exerciseFixture.list}${exerciseFixture.count}份、${exerciseFixture.kitchenNote}${exerciseFixture.packed}份，差${exerciseFixture.difference}份，${exerciseFixture.missing}。`;

export const dieteticNutritionComparisonZhTwSpec: ModularComparisonSpec = {
  pairId: "dietetic-technicians-vs-dietitians-and-nutritionists",
  locale: "zh-TW",
  title: "膳食技術員 vs 營養師：臺灣工作內容、薪資與證照比較",
  shortTitle: "膳食技術員 vs 營養師",
  description: "在臺灣想做團膳、醫院病膳或社區營養？比較廚務佐理員等供膳支援工作與營養師的交件、薪資、專技高考和執業條件，再做五分鐘紙面交接。",
  regionLabel: "臺灣",
  authorName: "費馬測試編輯部",
  datePublished: "2026-11-27",
  dateModified: "2026-11-27",
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: "午餐快送出去了，廚房發現軟質餐少了兩份。供膳人員先查少在哪一站，營養師確認替補方案是否符合已核定的餐別。膳食技術員把餐別、份數和差異交給下一班，營養師負責營養評估、飲食設計與專業紀錄。想把大批餐點準確送出，先看團膳及醫院廚務。想做臨床營養、校園菜單設計或社區營養服務，先查考試和執業門檻，再挑工作場域。",
    roleA: {
      badgeTitle: roleA,
      riasecLabel: "霍蘭德 SCR",
      aliases: "臺灣找職缺可用：廚務佐理員、行政助理（廚工）、配膳、團膳廚務。膳食技術員在這裡指供膳支援職能。",
      keywords: "食材驗收、庫房、配膳單、份數、供應異常",
    },
    roleB: {
      badgeTitle: roleB,
      riasecLabel: "霍蘭德 SIE",
      aliases: "臺灣找職缺可用：臨床營養師、團膳營養師、學校營養師、社區營養師。",
      keywords: "營養評估、臨床營養照會、飲食設計、供膳督導",
    },
    interviewBoundaryTitle: "職缺看起來都在營養部，先問這兩件事",
    interviewBoundaryQuestions: [
      "供膳支援｜有異常餐數時，我交點收紀錄、批次追溯或配膳差異給誰？新人何時開始接這段工作？",
      "營養師｜第一季是接營養照會、團膳菜單或社區衛教？每一類交件分別由誰複核？",
    ],
    riasecBoundaryNote: "徽章取本站興趣向量前三碼，幫你辨認想多做的活動；就業、資格與執業範圍各有實際條件。",
  },
  topology: {
    title: "從餐務需求到交班紀錄",
    summary: "供膳端把核定條件轉成配膳與查核，營養師從評估、設計做到供應監督。餐務資料、版本與異常回覆在兩端交接。",
    ariaLabel: "供膳端點收、核對與回報，營養師評估、設計、監督並交接紀錄",
    leftZoneTitle: "供膳支援",
    leftSteps: [
      { title: "點收備料", detail: "品名、批次、數量" },
      { title: "核對配膳", detail: "餐別、份數、版本" },
      { title: "回報差異", detail: "短少、缺件、交班" },
    ],
    centerZoneTitle: "兩邊交接",
    upperBridge: { title: "當日餐務", line1: "餐別與配膳版次", line2: "有效供應條件" },
    lowerBridge: { title: "異常回條", line1: "實際份數與來源", line2: "待核事項與回覆" },
    rightZoneTitle: "營養師",
    rightSteps: [
      { title: "整理需求", detail: "照會、對象、目的" },
      { title: "設計飲食", detail: "菜單或照護紀錄" },
      { title: "監督追蹤", detail: "回查供應與結果" },
    ],
  },
  matrix: {
    title: "團膳、醫院、長照的八種工作差異",
    summary: "職業標準分類的細類 2293 是營養師。臺灣供膳支援的職缺有不同名稱，直接看交付和資格最清楚。林口長庚的招募樣本也顯示，團膳營養師的職務可以兼顧臨床、社區及教研。",
    roleAColumn: roleA,
    roleBColumn: roleB,
    expandButtonLabel: "展開工具、入行與工作條件",
    collapseButtonLabel: "收合工具、入行與工作條件",
    rows: [
      {
        id: "deliverables", dimension: "每天交什麼", defaultVisible: true,
        roleA: "交食材驗收、庫房帳務、備餐與配膳差異。相同品名有不同包裝規格時，先核單位和批次，避免把缺件誤寫成零。計價工作可按分工整理用量、進貨單和單價，讓主管能查到成本變動來自哪一項。",
        roleB: "交營養評估與追蹤、團體膳食菜單或飲食衛教。團膳職會用標準食譜、菜單營養分析與份量標準連接廚房；臨床職則從照會原因、資料來源和追蹤項目組成營養照護紀錄。",
      },
      {
        id: "bulk-meals", dimension: "校園與中央廚房", defaultVisible: true,
        roleA: "接進貨單、點收並記錄品名、供應商、進貨量和紙本或系統欄位。到供餐尖峰，工作可包含秤量、分裝、餐數核對和交班。遇到品項或批次不同，留證據給指定窗口處理。",
        roleB: "在學校營養師職務中，依適用的學校午餐營養基準設計菜單，督導團膳供應與健康飲食教育。菜單設計要兼顧餐數、食材規格、預算與廚房產能；營養供應和餐飲衛生督導各按適用角色和資格辦理。",
      },
      {
        id: "hospital", dimension: "醫療院所", defaultVisible: true,
        roleA: "院內廚務可碰到普通餐、軟質餐與治療飲食的配膳區。按已確認的餐別、份數和最新版本核對；看到配膳單與備餐便條不一致，留下差異供餐務主管及營養師查證。",
        roleB: "臨床營養師依院內照會評估資料，進行醫療營養治療（MNT）中的膳食設計與追蹤，也可在門診提供飲食衛教。管灌營養涉及跨專業照護；營養師提供營養評估與照護建議，醫療診斷、開方及全靜脈營養（TPN）醫囑依醫師與院內醫療流程處理。",
      },
      {
        id: "community", dimension: "長照與社區", defaultVisible: true,
        roleA: "長照廚務可依機構分工點收、準備、配膳、記交班。現場可記錄觀察與回報疑問。備餐負荷跟著出餐時間走，也可能需要在不同餐次、區域或工作段輪調。",
        roleB: "社區職可負責長者營養宣導及團體衛教，居家營養照護則依服務與轉介安排做營養評估、和照顧者溝通並追蹤。兩種工作都可能離開辦公桌，目標職缺若涵蓋到宅，把服務範圍、往返時間和紀錄時間一起估。",
      },
      {
        id: "authority", dimension: "誰決定、誰留紀錄", defaultVisible: true,
        roleA: "廚務、配膳、一般資料整理和異常回報按工作分派執行。查清哪些欄位由自己填、哪些差異需交供膳主管或營養師，並保留原始記錄和下一版依據。",
        roleB: "《營養師法》規範個別營養評估、個別飲食設計與諮詢，以及特定群體和臨床治療飲食的專業設計及監督。營養師親自執行業務並製作紀錄；在醫療機構執業還需將紀錄摘要併入病歷。",
      },
      {
        id: "tools", dimension: "工具和原始資料", defaultVisible: false,
        roleA: "用批次、單位、驗收表和庫房紀錄追到食材。食品企業的支援職可整理每份量、熱量與營養素來源，交負責標示的團隊依食藥署規定核對，成品標示仍由業者負責。校園可使用校園食材登錄平臺 2.0。屬公告適用對象的業者依食品安全管制系統（HACCP）管理危害；餐飲業也有食品良好衛生規範可核。",
        roleB: "菜單營養分析核食材資料與用量；在臨床端，ADIME 可按評估、營養診斷、介入、監測與評值整理照護紀錄。來源、測量時點、餐別與追蹤方式都要能回查。",
      },
      {
        id: "entry", dimension: "入行與轉職", defaultVisible: false,
        roleA: "從供膳、庫房或廚務工作切入，可先證明懂食材驗收、單位換算和交班。有職缺採認中餐或西餐烹調技術士。若長期目標是取得營養師資格，提早查報考科系及實習認定，供膳年資本身無法補足這兩項。",
        roleB: "先完成考選部專技高考規則列名的專科以上營養相關系科或學程，並通過認定實習；合格後依序處理國考、營養師證書及執業登記。投臨床、校園或社區職缺，再核該單位看重的是病歷、菜單還是團體衛教。",
      },
      {
        id: "friction", dimension: "半年後會消耗你的事", defaultVisible: false,
        roleA: "集中出餐讓走動、久站、搬放物料與清潔工作一起到來。若早到、空班或反覆分裝會消耗你，核一整週班表並看新人是否能輪到點收、庫房或差異追蹤。",
        roleB: "衛教後未必會立刻收到回饋，具體結果可能受照顧人力、準備時間和溝通影響。臨床職有病歷與跨團隊協調，團膳職要平衡成本與出餐，社區職有活動排程及外出。先選自己願意持續追完哪種工作。",
      },
    ],
  },
  incident: {
    title: "少了兩份軟質餐，兩邊交接哪張單？",
    summary: "模擬院內午餐。使用配膳單、備餐便條和差異回條，練同一件事如何由餐務端查筆數、由營養師確認既有餐別條件。",
    triggerLabel: "配膳單和備餐便條的份數不一致：",
    triggerBody: `${exerciseCounts}送餐前仍缺可追查的替補紀錄，餐務人員先把原版與差異一起交件。`,
    triggerCaveat: "此例只示範紀錄與交接。院內有關營養照護與餐種變更的專業確認，由執業營養師及相關醫療團隊按各自權責處理。",
    rows: [
      {
        stage: "留下可查差異", roleLabel: "供膳支援", tone: "roleA",
        verifiedFacts: `${exerciseFixture.list}與${exerciseFixture.kitchenNote}各有可回查的原始數量，屬同一餐次。`,
        openGaps: "少備、重複點收或版本失配仍待核。替補狀態空白。",
        actionAndApproval: "把兩份資料的版次、餐別、份數和缺件寫進差異回條，交供膳值班主管重查點收，再由主管轉給營養師核對餐別限制。",
      },
      {
        stage: "核餐別與承接人", roleLabel: "執業營養師", tone: "roleB",
        verifiedFacts: "營養師可比對已確認的供膳要求和餐務端的差異紀錄。",
        openGaps: "替補可能涉及原有餐別、核定資訊或跨專業確認，光憑餐數無法判斷。",
        actionAndApproval: "營養師回覆可核對的餐別和仍待補的資料。若牽涉醫囑，由醫療團隊按各自權責確認，再回傳可執行的有效資訊。",
      },
      {
        stage: "按有效資料重核", roleLabel: "供膳值班主管與團隊", tone: "roleA",
        verifiedFacts: "追得到原本配膳單、清點差異，以及營養師回覆。",
        openGaps: "接班人仍需確認哪一版有效、哪一筆仍待核。",
        actionAndApproval: "由本例指定的供膳值班主管對備餐和派餐清單做最後一致性核對，交班時保留回覆、版次與未結事項。",
      },
    ],
    recoveryAcceptanceTitle: "怎樣算這一班交接完成？",
    recoveryAcceptanceCriteria: "接班人能從差異回條追到兩張來源單、差異原因、營養師確認及最新配膳單。已核對的餐別與數量同步到備餐和派餐兩處。沒有回覆或憑證的事項保留待核與承接人。",
    defenseLayerNote: "餐務核對著重份數、來源與交接；專業照護紀錄依營養師與醫療團隊權責處理。",
  },
  payAndCerts: {
    title: "薪資怎麼比？哪張證照會改變工作範圍？",
    summary: "用勞動部原表先看營養師在不同業別的薪資，再用實際聘用條件比保證給付、班表和升等機會。供膳支援以相同職責的雇主樣本估算。",
    salaryHeading: "先看同職類的業別差，再比同城錄取條件",
    salaryBody: `勞動部職類別薪資調查（PSDN）針對受查全時受僱者，排除政府機關及小學以上各級公私立學校。原表把 114 年 7 月平均經常性薪資與 113 年全年在職者平均薪資所得分開。表 3 營養師全體工業及服務業為每月新臺幣 ${surveyPay.all.month} 元／全年 ${surveyPay.all.year} 萬元；表 18 醫療保健業為 ${surveyPay.medical.month} 元／${surveyPay.medical.year} 萬元；表 11 其他餐飲業為 ${surveyPay.food.month} 元／${surveyPay.food.year} 萬元。同一營養師職類，醫療保健業與其他餐飲業每月平均經常性薪資相差新臺幣 ${monthlyIndustryGap} 元，但這是業別群組平均差。月薪含本薪與按月固定給付；全年另含年終與績效等，排除加班費等指定項目。供膳支援的同城同年資薪差缺可靠對應數字。

聘用條件可以拆成底薪、固定年終或保證月數、證照與班次加給、加班費，以及依考核發的績效或獎金。醫院證書可能是聘任資格，加給還要核有無列為固定給付。公開招募有將本薪與津貼、績效合報的團膳營養師，也有把工作獎金放進待遇並按試用條件折發的廚務支援。社區計畫職再看聘期、續聘與升等條件。日薪或時薪職先以書面可保證工時換算；空班、接送與跨點分開看。

同城同資歷兩份錄取條件，先把月本薪與固定津貼按各自保證發放次數加總；年終若只按本薪計，保證月數只套本薪。另列試用期差額、浮動績效、延長工時與交通。看職級是否採認可核的責任，供膳支援從單站配膳走到驗收、庫房或班次交接；營養師從跟診、菜單或衛教材料走到負責可追蹤成果。若兩份報酬差不多，用包含必要空檔和通勤的每週時間，再比能累積的工作成果。`,
    certs: [
      {
        name: "考選部專技高考營養師與衛福部營養師證書",
        officialScope: "考試規則列明專科以上營養、食品營養、保健營養、臨床營養等符合條件的系科學程，以及實習期滿成績及格。通過考試後依《營養師法》（L0040006）向衛生福利部請領營養師證書。",
        workplaceBoundary: "領有營養師證書才可使用營養師名稱。執業另向所在地直轄市、縣市主管機關登記並領執業執照，加入所在地營養師公會，按規定接受繼續教育與更新執業執照。",
        verificationTips: "先比對畢業科系與實習認定。拿到考試及格證明後，查衛福部發證與執業地主管機關的登記程序。",
        officialLinks: [sources.exam, sources.dietitianAct, sources.practice],
      },
      {
        name: "中餐烹調技術士與食品檢驗分析技術士",
        officialScope: "勞動部勞動力發展署技能檢定中心分列中餐烹調、食品檢驗分析。烹調職缺可列丙級以上技術士，乙級及其他職類依工作內容與當年度檢定安排選擇。",
        workplaceBoundary: "想做大量備餐及廚務，烹調證照直接對應相關技能；想進食品檢驗與品管，食品檢驗分析有不同用途。兩者皆屬技能證明，營養師專業業務依《營養師法》。",
        verificationTips: "擇一份廚務徵才和一份檢驗職徵才，把必要證書與可加分條件分別畫線，再決定要準備哪個職類。",
        officialLinks: [sources.skills, sources.careKitchen],
      },
      {
        name: "校園餐飲衛生督導與食品業者 HACCP",
        officialScope: "《學校衛生法》及學校餐廳廚房衛生管理辦法區分用人。外製、外購盒餐或團膳的廠商督導須領營養師執業執照，或為大專校院餐飲、食品、營養、生活應用、醫事、公共衛生等相關科系所畢業並修餐飲衛生相關課程至少二學分。",
        workplaceBoundary: "食品業者按公告類別與規模適用 HACCP。驗收、紀錄與查核等工作按現場職責分派，法定配置、食品安全流程和營養師的執業資格各自核對。",
        verificationTips: "先查工作場地是學校自設廚房還是外製供餐，再核職缺要求的是餐飲衛生督導還是營養專業設計。",
        officialLinks: [sources.school, sources.schoolFood, sources.foodAct, sources.haccp, sources.foodScope],
      },
    ],
    interviewChecklistTitle: "四項值得帶進面試的書面核對",
    interviewChecklistQuestions: [
      { label: "支援職的交件", question: "能否用一張合成或去識別的表單，說明從點收到配膳有哪些站，新人先負責哪一站？" },
      { label: "專業職的主責", question: "這份營養師職缺的主要成果是病歷紀錄、標準食譜和菜單，還是社區服務紀錄？哪一項會納入升等考核？" },
      { label: "試用與獎金", question: "本薪、固定津貼與績效各寫在哪？試用期期滿的調整會依什麼可觀察的條件？" },
      { label: "工作時間", question: "看一週班表，早班、午餐尖峰、空班及跨點，各有多少時間要留給工作？" },
    ],
  },
  thirtyDayPlugin: {
    badge: "四週作品",
    title: "30 天雙軌作品清單",
    summary: "選一軌做四件可翻查的作品。來源見文末四週材料。每件寫下原始資料、版本、可核結果和還缺的依據；紙上練習以公開資料與合成案例為限。",
    tracks: [
      {
        id: "dietetic-tw-portfolio-operations", title: "團膳與供膳支援", badge: "供膳支援", tone: "roleA",
        weeks: [
          { weekLabel: "第一週", deliverable: "做一張兩家供應商、三個品項的模擬驗收卡。對照午餐驗收工具書的品名、供應商、進貨量與備註，讓讀者能找到每一批的憑證。若工具書下載慢，就用上述四欄，加一欄填承接人；三筆至少有一個單位差異，另列重核結果。" },
          { weekLabel: "第二週", deliverable: "做一張 30 份與 50 份的模擬成本表。參考考選部團膳考題的份數、鮮料、乾料與食品成本率，自己設定價格；若題目暫時開不了，就用鮮料總價、乾料總價、份數和每份食材成本四欄。兩列都能從採購單位換算到每份成本，並另列一次性耗材。" },
          { weekLabel: "第三週", deliverable: "用教育部校園午餐公開資料挑出一所學校的兩個供餐日，做菜色和來源欄位比對。找一筆空白寫成待查；若缺原始收貨資料，就標示無法從菜單知道實物是否已驗收。驗收時，另一個人能用學校、日期和菜名重找兩筆。" },
          { weekLabel: "第四週", deliverable: "做中央廚房交班板。讀食品良好衛生規範準則的餐飲章，替模擬的收貨、備餐、派餐畫三個欄位，分別填一個應保留的文件、責任人及未收到文件的接手方式。驗收時，換班者能從任一異常追到原處；全程只畫流程，沒有實作。" },
        ],
      },
      {
        id: "dietetic-tw-portfolio-nutrition", title: "臨床紀錄與社區營養", badge: "營養師方向", tone: "roleB",
        weeks: [
          { weekLabel: "第一週", deliverable: "用食藥署食品營養成分資料集找兩種不同型態的同類食材，整理樣品名稱、內容物描述及每 100 公克資料。交一頁資料品質筆記，至少指出一個如生熟或可食部的可比限制。離線可先列樣品名、內容、單位、可比性四欄，數值留待來源讀回。" },
          { weekLabel: "第二週", deliverable: "用屏東榮總公開住院營養諮詢流程畫轉介圖。離線摘要為醫護發現風險或提出照會，營養師接手會診。標出一個會診入口、一個責任移交與一個追蹤點。另做四列模擬紀錄索引，分清原始資料、待核、承接人與回覆；沒有病人資料或醫療建議。" },
          { weekLabel: "第三週", deliverable: "用國健署我的餐盤做一張長者據點的健康飲食識讀卡。把六類食物用可辨識的名稱與在地菜色例示，附兩道查讀問題和答案。只評估讀者能否從圖卡找到訊息，不替個人估算份量或設計飲食。" },
          { weekLabel: "第四週", deliverable: "以《營養師法》營養師執業紀錄條文及國教署午餐人力要點，做一張校園團膳工作交件清單。三欄為菜單及標準食譜、供膳監督、健康飲食教育。每欄寫一個可複核成果與資料保管責任，指出哪一項資料不足時先退回補充。" },
        ],
      },
    ],
  },
  checklist: {
    title: "把想做的成果和能接受的班表分開選",
    summary: "技能欄看你想累積什麼，條件欄看哪種生活節奏可持續。兩欄各挑一項最能影響投遞的事，再用試做或徵才說明查證。",
    skillsHeading: "技能｜我願意反覆練出的成果",
    skillsOptions: [
      { id: "match-intake", track: "roleA", label: "從不同單位追到同一批食材", summary: "由供應商、批次、進貨單位與實際數量還原點收差異。", interviewQuestions: ["可以說明從驗收到庫房如何留批次及重量紀錄嗎？"] },
      { id: "reconcile-meals", track: "roleA", label: "在出餐截止前整理清楚的差異單", summary: "讓接班者看得懂餐別、份數、版次與接手人。", interviewQuestions: ["班前與班後哪些配膳資料會由新人核對？"] },
      { id: "review-referrals", track: "roleB", label: "整理一份能追查來源的營養紀錄", summary: "讀照會原因，將觀察、確認資料與仍待補的內容分開。", interviewQuestions: ["新人的照會回覆、紀錄與追蹤，分別以什麼標準複核？"] },
      { id: "translate-plans", track: "roleB", label: "把營養基準轉成團膳規劃或衛教", summary: "讓廚房做得出菜色，或讓團體看懂一項可理解的健康飲食資訊。", interviewQuestions: ["第一季會接觸菜單營養分析、社區衛教還是病房照會？"] },
    ],
    conditionsHeading: "條件｜我能接受的時間、空間與責任",
    conditionsOptions: [
      { id: "kitchen-shifts", track: "roleA", label: "能接受早班、熱廚房與集中出餐", summary: "將久站、搬運、清潔、空班和回家交通算進完整一週。", interviewQuestions: ["班表中哪些時段集中搬運或分裝，是否有輪站與搬運協助？"] },
      { id: "batch-interruptions", track: "roleA", label: "能在反覆的流程中處理突發缺件", summary: "餐點延遲、短少與數量差異會壓縮交班窗口。", interviewQuestions: ["遇到缺件時，哪一位主管接手，何時記錄交班？"] },
      { id: "clinical-responsibility", track: "roleB", label: "能在忙碌環境持續追蹤與說明", summary: "團隊可能同時需要記錄、衛教與供膳核對，必須把責任與時點寫清楚。", interviewQuestions: ["個案追蹤、紀錄時間和跨團隊討論各如何安排？"] },
      { id: "community-travel", track: "roleB", label: "可接受在社區、機構或院區之間移動", summary: "將活動排程、交通、簡報準備及紀錄時間一併納入。", interviewQuestions: ["一週固定據點和外出地點怎麼分，移動時間如何安排？"] },
    ],
    defaultInterviewQuestions: [
      "可以用模擬文件說明新人第一個成果、複核人與完成標準嗎？",
      "插單或臨時改班時，誰接收差異回報，正常的一週又如何安排？",
    ],
    crossTrackNote: "若兩欄都吸引你，可選團膳現場與團膳營養師比較，再把同一份菜單的點收、設計與督導分開。想知道自己偏臨床或社區，再追照會、衛教及追蹤各占哪些工作時段。",
    offlinePrintHint: "列印後在兩欄各圈一項，寫下你想在公開職缺或訪談查證的證據。",
  },
  desktopExercise: {
    sectionTitle: "五分鐘試做｜一張供膳差異單，兩種交接",
    summary: "任選供膳或營養紀錄一軌，五分鐘內寫三行。這是院內午餐的紙面模擬，所有代號與數字皆為合成資料。公開表格只供辨認欄位。全程用紙筆，無真實病人、備餐、系統登錄或醫療處方。",
    publicLinksHeading: "公開材料：",
    publicLinks: [
      sources.intakeForm,
      sources.practiceTeaching,
      { label: "營養師業務與紀錄規定", href: sources.dietitianAct.href, note: "查專業紀錄及病歷摘要責任。" },
    ],
    factSummaryHeading: "離線資料卡：",
    factSummarySegments: [
      { text: "官方材料摘要。午餐驗收範例留品名、供應商、進貨數量和備註。營養師法要求執業紀錄，醫療機構的紀錄摘要併入病歷。另用醫院教學計畫辨認營養紀錄欄位。", tone: "strong" },
      { text: `模擬批次${exerciseFixture.batch}。${exerciseFixture.list}列軟質餐${exerciseFixture.count}份；${exerciseFixture.kitchenNote}記已點收${exerciseFixture.packed}份。替補欄與營養師確認欄均空白。營養師複核後，備餐便條與派餐清單同步更新。` },
      { text: `同一張交接單尚無更新版。差異是${exerciseFixture.difference}份；空白表示待確認。另有不連結餐數的合成教具：候選 PES 提出「進食不足」，原因猜測為食慾低，合成檢驗代碼 T2 數值 12，未附單位、來源或採樣時間。別把這筆數字當成診斷閾值。` },
    ],
    taskA: {
      title: "供膳軌｜回報少了什麼",
      instruction: "寫兩個來源及份數、差額和替補待查。交值班主管重查，交執業營養師複核後再同步文件。",
    },
    taskB: {
      title: "營養軌｜整理紀錄缺口",
      instruction: "以 ADIME 分欄。A 列份數、來源及差額；D 寫一行 PES 草註或退回理由，說明 T2 數值可否當證據；I 留待營養師，M／E 列回查對象及紀錄。",
    },
    rubricTitle: "展開核對條件與兩份樣答",
    rubricHeading: "每軌四個核對點",
    rubricPassRule: "共用兩項加所選軌兩項。四項齊備就完成這軌。",
    rubricItems: [
      `共用｜兩個數量、各自來源及${exerciseFixture.difference}份差異正確。`,
      "共用｜替補欄待確認，交執業營養師複核。",
      "供膳｜值班主管重查清點紀錄。",
      "供膳｜更新備餐便條與派餐清單。",
      "營養｜寫 PES 草註或退回理由，說明數值證據缺口，介入待核。",
      "營養｜列檢驗報告及餐務的回查窗口與紀錄。",
    ],
    sampleAnswerALabel: "供膳樣答：",
    sampleAnswerA: `${exerciseCounts}請供膳值班主管重查清點紀錄，再把可核證據交執業營養師複核。依核對結果同步更新備餐便條與派餐清單。`,
    sampleAnswerBLabel: "營養樣答：",
    sampleAnswerB: `A：${exerciseCounts}D：疑似進食不足，食慾低未核。T2 的 12 缺單位、來源及採樣時間，退回這一筆 PES。I：留待執業營養師。M／E：請營養師向教具檢驗窗口核原報告、單位及採樣時間，值班主管查清點和派餐紀錄；交執業營養師複核。`,
  },
  tools: {
    title: "照現在要做的決定，選一個工具",
    summary: "你可以先查兩個職業、留下可驗證的行動，或整理自己的興趣和工作條件。",
    cards: [
      { id: "compare", badge: "手上有兩個方向", meta: "雙職業對比", tone: "roleA", title: "換成你想投的兩個職業", description: "例如把團膳方向與食品品管放在一起，核對餐務交件、檢驗及紀錄的重心。", purposeHint: "已有兩個選項，想縮小範圍。", ctaLabel: "開啟職業對比", href: "/zh-TW/career/compare" },
      { id: "worksheet", badge: "記下一個行動", meta: "探索工作表", tone: "neutral", title: "留下投遞前要查的工作證據", description: "記下想見到的交件、可接受的班表，和第一個查證動作。", purposeHint: "已鎖定方向，想留下具體行動。", ctaLabel: "開啟我的工作表", href: "/zh-TW/career/interest-worksheet#my-worksheet" },
      { id: "holland", badge: "工作興趣", meta: "霍蘭德 60 題", tone: "accent", title: "看哪些工作活動吸引你", description: "用六個興趣面向與三字碼，整理自己想多做的工作。", purposeHint: "方向未定，先看興趣。", ctaLabel: "開始霍蘭德職業興趣測試", href: "/zh-TW/tests/holland-career-interest-test-riasec" },
      { id: "career94", badge: "工作方式", meta: "職業測試 94 題", tone: "roleB", title: "核對你在乎的工作方式和條件", description: "從工作活動、方式及條件整理你對輪班、持續追蹤和跨團隊協作的偏好。", purposeHint: "職務有吸引力，想核對自己的工作偏好。", ctaLabel: "前往職業測試", href: "/zh-TW/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "查看兩個職業的詳細資料",
    profileLinks: [
      { label: "膳食技術員職業介紹", href: "/zh-TW/career/jobs/dietetic-technicians" },
      { label: "營養師職業介紹", href: "/zh-TW/career/jobs/dietitians-and-nutritionists" },
    ],
  },
  faqs: [
    {
      id: "dietetic-tw-title",
      question: "在臺灣，想找膳食技術員的工作要搜什麼？",
      answer: "想接驗收、庫房與配膳，可先找廚務佐理員、團膳廚務、行政助理（廚工）或配膳相關職缺。按工作項目核對職稱，查看主要要交餐數、庫房帳或食材驗收單。看到營養師、團膳營養師或社區營養師，則先看營養師證書、執業條件及工作產出。臺灣 2293 對應營養師；3214 是醫學及牙科輔具技術員，查膳食工作宜保留自己的職稱清單。",
    },
    {
      id: "dietetic-tw-license",
      question: "餐飲背景，可以先做團膳再考營養師嗎？",
      answer: "可以先用供膳工作確認自己是否喜歡大量出餐、食材與紀錄，再從考選部的列名系科及實習認定查國考資格。符合資格的學歷與實習須分別證明，烹調技術士和團膳經歷服務的是餐務職能。國考合格後還要取得衛福部營養師證書，執業時向所在地主管機關登記並領執業執照。",
    },
    {
      id: "dietetic-tw-clinical",
      question: "醫院營養師和供膳人員，在管灌和靜脈營養怎樣分工？",
      answer: "營養師可做營養評估、飲食設計、照會回覆與追蹤；醫療診斷、開方及靜脈營養醫囑由醫師及院內醫療流程處理。供膳支援執行獲分派的配膳與查對，有差異就把餐別、版本與實際份數交接出去。醫療機構的營養師專業紀錄摘要須併入病歷。",
    },
    {
      id: "dietetic-tw-pay",
      question: "團膳與醫院的職缺，寫相同月薪就算待遇一樣嗎？",
      answer: "先算試用期，再算試用後的保證金額。有一份把工作獎金算進招募月薪，就從薪資拆項查它是否依考核與盈餘發放。若是期約社區職，將期滿到下次聘用的空檔、服務交通和行政時間放入比較。想看升等，支援職可確認是否能從單站分裝擴到庫房、驗收和差異追蹤；營養師可查獨立負責照會、帶案或菜單審查會不會寫進職等。相近資歷再用兩份書面條件核工時、休假及各項保證發放次數。",
    },
    {
      id: "dietetic-tw-school",
      question: "學校午餐的餐飲衛生督導一定是營養師嗎？",
      answer: "不用每個情境都由營養師擔任。學校外製或外購團膳，廠商須聘用有營養師執業執照者，或具指定相關科系所學歷及至少二學分餐飲衛生課程者。學校指定的督導除這兩類外，還可用大專畢業或同等學力加烹調技能檢定監評資格，或大專畢業加至少三十二小時合格餐飲衛生講習及證明。餐飲衛生督導、菜單營養設計及食品安全管制系統各有要求，先看職缺主要是執行供膳、擔任督導或做營養專業服務。",
    },
    {
      id: "dietetic-tw-community",
      question: "喜歡長者服務，團膳、社區和居家營養怎麼選？",
      answer: "想改善一餐從備料到送達的準確性，先試長照廚務或團膳。喜歡把營養知識說清楚、規劃活動及收回饋，可看社區營養師。想和照顧者處理影響營養的個別情況，可看符合服務資格的居家營養照護；把跨點交通、紀錄和照顧者溝通一起納入工作量。",
    },
    {
      id: "dietetic-tw-automation-2026",
      question: "2026 年，供膳系統與 AI 能幫這兩種工作做什麼？",
      answer: "校園食材登錄平臺 2.0 能匯入驗收資料、列出供餐缺漏，實物、餐別和登載資料仍須由人核對。醫院已有可按院內規則自動送營養照會的實例，營養師接手後才做專業判斷。AI 或試算表可輔助整理草稿或提示缺欄；要回原單據核單位、原始紀錄與版本，營養計畫及臨床紀錄由執業營養師依權責確認。",
    },
    {
      id: "tw-dietetic-nutrition-thirty-day-faq",
      question: "四週作品先交哪一件，最能分辨自己想做哪端？",
      answer: "想試供膳，先交一張別人能重做的食材驗收卡；想試營養師方向，先交一頁能說明生熟和單位差異的營養成分資料核對。能由同一來源重做，再接成本、轉介或團體衛教作品。",
      requiresPlugin: "thirtyDay",
    },
  ],
  sourceGroups: [
    { id: "tw-dietetic-role-extensions", title: "臺灣臨床教學、食品標示和居家服務", links: [sources.practiceTeaching, sources.packageLabel, sources.homeCare] },
    { id: "classification-pay", title: "臺灣職類與薪資原表", links: [sources.occupation, sources.survey, sources.allPay, sources.foodPay, sources.medicalPay] },
    { id: "professional-scope", title: "臺灣營養師考試、執業與醫事分工", links: [sources.dietitianAct, sources.practice, sources.exam, sources.physician] },
    { id: "food-service-scope", title: "校園團膳、食品衛生與檢定", links: [sources.school, sources.schoolFood, sources.schoolStaff, sources.foodAct, sources.hygiene, sources.haccp, sources.foodScope, sources.skills, sources.intakeForm] },
    { id: "employer-samples", title: "臺灣供膳與營養師公開用人樣本", links: [sources.careKitchen, sources.hospitalKitchen, sources.hospitalJob, sources.communityJob, sources.meals] },
    { id: "document-tools", title: "照會、登載與供餐核對", links: [sources.referral, sources.training, sources.reporting] },
    { id: "tw-dietetic-nutrition-thirty-day-sources", title: "四週作品公開材料", requiresPlugin: "thirtyDay", links: [sources.foodData, sources.schoolData, sources.pastExam, sources.plate] },
  ],
};
