import type { ModularComparisonSpec } from "../modularComparison";

const roleA = "職能治療師";
const roleB = "物理治療師";

const sources = {
  otLaw: { label: "全國法規資料庫｜職能治療師法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0020039", note: "第 7、9、11–15、19–20、26–27 條。查執業、醫師文件、紀錄、設所及收費。" },
  ptLaw: { label: "全國法規資料庫｜物理治療師法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0020044", note: "第 7、9、11–15、19–20、26–27 條。查執業、醫師文件、紀錄、設所及收費。" },
  otAmendment: { label: "總統府公報｜職能治療師法修正", href: "https://www.president.gov.tw/Page/294/49347", note: "112 年 12 月 27 日，第 7697 號。本文核對第 12 條修正。" },
  ptAmendment: { label: "總統府公報｜物理治療師法修正", href: "https://www.president.gov.tw/File/Doc/4d0726f6-b2f3-4cad-9b8f-e3ba37c2ba84", note: "112 年 2 月 8 日，第 7645 號，第 9、12、19 條修正。" },
  exams: { label: "考試院｜專技高考醫事人員考試規則", href: "https://law.exam.gov.tw/LawContent.aspx?id=FL016888", note: "兩類科分列，附表一查應考資格，附表五、六查實習，附表七查考科。" },
  examEntry: { label: "考試院｜應考資格表", href: "https://law.exam.gov.tw/Download.ashx?FileID=63944&id=FL016888&type=LAW", note: "附表一兩類科列。國內及國外學歷採認門檻分讀。" },
  ptInternship: { label: "考試院｜物理治療師實習認定基準", href: "https://law.exam.gov.tw/Download.ashx?FileID=86145&id=FL016888&type=LAW", note: "附表五。總週數、教學醫院、各領域和實習補修。" },
  otInternship: { label: "考試院｜職能治療師實習認定基準", href: "https://law.exam.gov.tw/Download.ashx?FileID=63949&id=FL016888&type=LAW", note: "附表六。近年畢業者查第二階段及教學醫院時數。" },
  examSubjects: { label: "考試院｜專技高考醫事人員應試科目", href: "https://law.exam.gov.tw/Download.ashx?FileID=63950&id=FL016888&type=LAW", note: "附表七首頁分列兩類科，可搭配四週作品做準備清單。" },
  otClassification: { label: "主計總處｜職業標準分類｜職能治療師", href: "https://www.stat.gov.tw/StandardOccupationalClassificationContent.aspx?Level=4&PID=MjI5NQ%3D%3D&RID=6&n=3145&sms=11196", note: "第 6 次修訂，職業細類 2295。" },
  ptClassification: { label: "主計總處｜職業標準分類｜物理治療師", href: "https://www.stat.gov.tw/StandardOccupationalClassificationContent.aspx?Level=4&PID=MjI5Mg%3D%3D&RID=6&n=3145&sms=11196", note: "第 6 次修訂，職業細類 2292。" },
  payMethod: { label: "勞動部｜114 年職類別薪資調查統計結果", href: "https://www.mol.gov.tw/1607/1632/1633/90814/", note: "方法與定義。全時受僱員工口徑，排除自營和部分工時。" },
  payAll: { label: "勞動部｜薪資調查表 3", href: "https://statdb.mol.gov.tw/html/s3/svy14/1435003.ods", note: "全體工業及服務業。查兩師各自職類列的月薪與全年薪資所得。" },
  paySector: { label: "勞動部｜薪資調查表 18", href: "https://statdb.mol.gov.tw/html/s3/svy14/1435018.ods", note: "醫療保健及社會工作服務業。對照總計和醫療保健業子欄，社會工作服務業子欄兩師未列數值。" },
  feeSchedule: { label: "健保署｜全民健康保險醫療服務給付項目及支付標準", href: "https://info.nhi.gov.tw/INAE5000/INAE5001S0", note: "由支付標準查詢入口依項目與生效月份查核。" },
  rehabCodes: { label: "健保署｜復健醫療服務項目", href: "https://med.nhi.gov.tw/ihqe0000/pro008.html", note: "腦中風品質指標的復健分類附表，分列物理治療與職能治療。" },
  localFees: { label: "彰化縣衛生局｜醫療院所收費標準", href: "https://www.chshb.gov.tw/topic/102", note: "分列兩類治療所收費基準自治條例；本表只適用彰化縣。" },
  selfPayOT: { label: "臺大醫院｜自費動態副木製作流程", href: "https://www.ntuh.gov.tw/PMR-OT/Fpage.action?fid=5962", note: "院方流程列醫師開立醫令及自費同意書，屬單一院方範例。" },
  otHospital: { label: "臺大醫院｜生理職能治療服務", href: "https://www.ntuh.gov.tw/PMR-OT/Fpage.action?fid=3875&muid=4056", note: "從住院床邊、門診到副木、生活輔具及出院準備。" },
  ptHospital: { label: "臺大醫院｜物理治療中心", href: "https://www.ntuh.gov.tw/PTC/Fpage.action?fid=1215&muid=1", note: "院內跨科照會與術後、動作、心肺及跌倒風險服務。" },
  earlyCenter: { label: "臺大兒童醫院｜兒童發展評估及療育中心", href: "https://www.ntuh.gov.tw/ntuch/Fpage.action?fid=3001&muid=3139", note: "聯合評估的團隊成員、會議與後續安排。" },
  earlyOT: { label: "臺大醫院｜兒童職能治療服務", href: "https://www.ntuh.gov.tw/PMR-OT/Fpage.action?fid=3876&muid=4057", note: "從家庭情境看參與、自理、遊戲及學習。" },
  earlyPT: { label: "臺大醫院｜早期療育物理治療", href: "https://www.ntuh.gov.tw/PMR-PT/Fpage.action?fid=3820", note: "轉介、動作發展評估、家長參與與跨專業合作。" },
  carePay: { label: "全國法規資料庫｜長照服務申請及給付辦法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0070059", note: "核照顧計畫、部分負擔及特約單位申報，附表四有照顧組合。" },
  ca07: { label: "衛福部｜長照給付辦法附表四", href: "https://law.moj.gov.tw/LawClass/LawGetFile.ashx?FileId=0000398331&lan=C", note: "PDF 第 26 頁 CA07，評估、目標、指導與紀錄，列支付單位。" },
  careStaff: { label: "全國法規資料庫｜長照人員訓練認證及登錄", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0070045", note: "115 年 3 月 17 日修正。核長照專業人員、訓練、認證與登錄。" },
  careForm: { label: "基隆市政府｜長照專業服務紀錄參考格式", href: "https://www.kmh.klcg.gov.tw/wSite/public/Attachment/01205/f1673588560012.pdf", note: "第七頁服務紀錄表。紙面只讀項目、時間、對象、紀錄及雙方簽章欄，離線可照下方欄位卡。" },
  genAI: { label: "衛福部｜醫療機構應用生成式人工智慧指引", href: "https://www.mohw.gov.tw/dl-100614-c7d35394-0a6b-448e-9d90-295294596d98.html", note: "115 年 5 月 29 日函頒。第 10–11 頁查原資料追溯、使用者覆核及病歷簽章。" },
  ptRecruitment: { label: "基隆長庚｜復健科物理治療師徵才", href: "https://www.cgmh.org.tw/index.aspx/Systems/RecruitContent/3/202609070037", note: "2026 年 9 月樣本，刊列首月月薪、績效、夜勤津貼及加班費。" },
  electronicRecords: { label: "全國法規資料庫｜醫療機構電子病歷製作及管理辦法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0020121", note: "查醫事人員製作、覆核、電子簽章及資料權限。" },
  earlyRecruitment: { label: "林口長庚｜兒童發展聯合評估中心徵才", href: "https://www.cgmh.org.tw/department/Systems/RecruitContent/5/202609170008", note: "2026 年 9 月計畫職缺，兩師分聘，有臨床、教學與行政工作。" },
  careNetwork: { label: "南投縣衛生局｜長照專業服務與特約單位", href: "https://www.ntshb.gov.tw/form/Details?Parser=2,7,216,64,140,,218", note: "查專業服務 C 碼、居家物理治療所及服務地區。以查詢時頁面為準。" },
  otFacility: { label: "全國法規資料庫｜職能治療所設置標準", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0020058", note: "查服務、設施、所端流程及僅提供居家服務之類型。" },
  ptFacility: { label: "全國法規資料庫｜物理治療所設置標準", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0020036", note: "查服務、設施和僅提供居家物理治療之類型。" },
};

const pay = {
  monthlyPeriod: "114 年（2025）7 月",
  annualPeriod: "113 年（2024）",
  all: { otMonthly: "47,733", ptMonthly: "46,928", otAnnual: "65.7", ptAnnual: "66.1" },
  health: { otMonthly: "47,761", ptMonthly: "46,846", otAnnual: "65.6", ptAnnual: "66.0" },
};

const physicianBasis = "以治療疾病為目的，兩師都須依醫師開具的診斷、照會或醫囑執行。非以疾病治療為目的者，兩部法律均有例外。";
const exercise = {
  code: "CA07",
  visit: "第二次",
  audience: "家屬",
  report: "拿不到上層杯子",
  observation: "餐桌椅旁站起時有人扶",
  missing: "日期、起訖時間和雙方簽章仍空白",
  signatures: "案家與專業人員各核自己的簽章欄",
};
const exerciseRecord = `${exercise.code} ${exercise.visit}，對象${exercise.audience}。杯子是家屬回報，椅旁是現場觀察；${exercise.missing}，紀錄待核。${exercise.signatures}，請當次專業人員查原始紀錄補對日期與時間。`;

export const rehabilitationComparisonZhTwSpec: ModularComparisonSpec = {
  pairId: "occupational-therapists-vs-physical-therapists",
  locale: "zh-TW",
  title: "職能治療師 vs 物理治療師：臺灣工作內容、薪資與執業資格",
  shortTitle: "職能治療師 vs 物理治療師",
  description: "職能治療師（OT）和物理治療師（PT）差在哪？比較臺灣復健科、早期療育、自費治療所和長照居家復能的工作，查專技高考、醫囑、薪資，再做五分鐘紙面試做。",
  regionLabel: "臺灣",
  authorName: "費馬測試編輯部",
  datePublished: "2026-11-25",
  dateModified: "2026-11-25",
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: "有人想出院後自己到餐桌吃飯。物理治療師看他怎麼站起、轉身、走到桌邊，職能治療師看坐到桌前後，能不能拿餐具、吃完一餐和收拾。兩人都會看動作與環境，差在各自要交代什麼結果。喜歡拆解步態、動作控制和活動耐受度，先看物理治療；想把手部功能、注意力、輔具和家中安排放進一件生活任務，先看職能治療。",
    roleA: {
      badgeTitle: roleA,
      riasecLabel: "興趣向量前三碼 SIR",
      aliases: "職缺關鍵字：職能治療師、OT、兒童職能治療、居家職能治療",
      keywords: "交付成果：活動分析、手功能、日常生活活動、生活輔具與副木",
    },
    roleB: {
      badgeTitle: roleB,
      riasecLabel: "興趣向量前三碼 SIR",
      aliases: "職缺關鍵字：物理治療師、PT、小兒物理治療、居家物理治療",
      keywords: "交付成果：步態、移位、平衡、運動治療與動作複測紀錄",
    },
    interviewBoundaryTitle: "同在復健科，面試時先看要交哪份紀錄",
    interviewBoundaryQuestions: [
      "職能治療：新人能跟到首評、活動觀察與出院交接嗎？",
      "物理治療：床邊、門診與小兒工作怎麼分？誰複核初評與複測？",
    ],
    riasecBoundaryNote: "兩職向量前三碼皆為 SIR。本站職業目錄簡碼另列職能 SI、物理 SIR。興趣用於探索，執業與錄取另有條件。",
  },
  topology: {
    title: "同一個生活目標，兩份專業紀錄",
    summary: "職能軌追用餐活動，物理軌追移動條件，兩邊把觀察交給照護團隊。",
    ariaLabel: "職能及物理治療並行評估、交接並回看同一個生活活動的流程",
    leftZoneTitle: roleA,
    leftSteps: [
      { title: "選生活任務", detail: "用餐、取物、自理" },
      { title: "找步驟卡點", detail: "手功能、環境、提示" },
      { title: "回看參與", detail: "完成度與協助程度" },
    ],
    centerZoneTitle: "共用目標",
    upperBridge: { title: "對齊情境", line1: "餐桌與座椅", line2: "家屬在場" },
    lowerBridge: { title: "交接觀察", line1: "紀錄時間", line2: "未核事項" },
    rightZoneTitle: roleB,
    rightSteps: [
      { title: "看移動起點", detail: "站起、轉身、步態" },
      { title: "確認動作品質", detail: "平衡與活動耐受" },
      { title: "回看移動", detail: "同條件複測比較" },
    ],
  },
  matrix: {
    title: "從醫院到居家，八項工作差在哪",
    summary: "主計總處分列兩職。應徵時比較場域、服務對象、工作成果與工時。",
    roleAColumn: roleA,
    roleBColumn: roleB,
    expandButtonLabel: "展開工具、入行訓練與工作代價",
    collapseButtonLabel: "收合工具、訓練與工作代價",
    rows: [
      {
        id: "deliverables", dimension: "下班前交什麼", defaultVisible: true,
        roleA: "記下生活哪一步卡住。譬如盥洗時能不能拿穩用具、按順序做完，要提醒幾次。把實際表現、活動調整和待核條件留給接手者。",
        roleB: "記下起身、轉位與行走需多少協助、用了哪種輔具，供後續同條件複測。「走得比較好」不足以讓接班者定位變化。",
      },
      {
        id: "hospital", dimension: "醫院復健科", defaultVisible: true,
        roleA: "生理職能治療在病房或門診看上肢功能、知覺認知與自理，也可評估輔具、製作副木並做出院準備。另有精神醫療與兒童方向。",
        roleB: "門診和床邊可出現在同一職缺。骨科、神經、心肺與小兒各有不同活動限制，可能要追蹤術後活動、動作控制或移動功能。",
      },
      {
        id: "clinics", dimension: "自費治療所", defaultVisible: true,
        roleA: "職能治療所可做兒童自理與遊戲參與，也可做成人手功能、輔具或生活環境。把預約、備料、紀錄與家屬溝通一併列入工時。",
        roleB: "物理治療所可提供評估、擬定目標、操作或運動治療。應徵時把回診追蹤及病歷工時，和單項收費或按次獎金分開看。",
      },
      {
        id: "home", dimension: "長照居家復能", defaultVisible: true,
        roleA: "到家中觀察日常生活活動（ADLs），如穿衣、用餐，或較複雜的生活活動（IADLs），如備餐。記下案家優先的活動、環境和需協助的步驟。",
        roleB: "把起身、移位與走到目的地放回家中的實際條件。座椅高度、動線改變就要重看。復能還有照顧者指導與紀錄，訪視須另算交通工時。",
      },
      {
        id: "early-intervention", dimension: "早期療育與兒童復健", defaultVisible: true,
        roleA: "職能軌留意遊戲、用手操作、穿衣和學習活動。比對同一件事在治療室、家中或教室的表現，再讓家長知道哪些情境有變化。",
        roleB: "小兒物理軌和家長觀察姿勢、移動及大動作。記下當時環境與協助條件，由聯合評估團隊合併各專業紀錄討論後續。",
      },
      {
        id: "tools", dimension: "一線工具與紀錄", defaultVisible: false,
        roleA: "以活動分析拆出物件、步驟與協助方式，可用日常活動器材、功能性輔具或副木。紀錄區分家屬轉述與當場觀察。",
        roleB: "可用活動度和肌力評估、步態觀察、助行器及運動治療器材。電、熱等物理因子也是業務項目；把測試與工具條件留在紀錄。",
      },
      {
        id: "training", dimension: "學歷、實習與轉行", defaultVisible: false,
        roleA: "以符合應考條件的科系及實習進入專技高考。教育、設計或照顧背景可用於活動觀察與溝通，轉行仍須完成相關學歷和實習。",
        roleB: "完成對應科系及實習，再報考專技高考。運動教學經驗可用於理解與解釋動作；選校時把教學醫院實習、通勤及可工作時間排入學期。",
      },
      {
        id: "workload", dimension: "半年後的工作代價", defaultVisible: false,
        roleA: "設計活動之外，還要處理計畫修訂、家屬期待及紀錄。想要穩定作息，先核固定站點、跨點支援及早療時段。",
        roleB: "床邊可遇長時間站立、示範和協助移位。對體力或跨點交通有顧慮，先看病房占比、轉位設備、人力支援和分區。",
      },
    ],
  },
  incident: {
    title: "同一人要回家吃飯，誰把什麼交給誰",
    summary: "情境模擬。出院目標是「在家用餐」。物理治療師記移動，職能治療師記用餐，出院團隊統整居家待查事項。",
    triggerLabel: "眼前做到的，回家能不能接上：",
    triggerBody: "團隊只掌握病房桌椅。兩份紀錄先標明場地、完成步驟和協助程度，居家表現留待確認。",
    triggerCaveat: `${physicianBasis}若文件有疑點，治療師先向開具的醫師確認。若當事人不適繼續，應停止並依各法聯絡醫師或建議再診。`,
    rows: [
      {
        stage: "先觀察怎麼到桌邊", roleLabel: roleB, tone: "roleB",
        verifiedFacts: "把起身、轉向與到桌邊分開記，附場地、使用的輔具和協助程度。",
        openGaps: "家中動線、椅面和可協助的人仍待確認。",
        actionAndApproval: "把移動條件交職能治療師及出院團隊。醫師文件有疑點，回詢開具者。",
      },
      {
        stage: "再核到桌後的活動", roleLabel: roleA, tone: "roleA",
        verifiedFacts: "把找餐具、取物與使用餐具分開記，區分現場看到的表現和家屬回報。",
        openGaps: "家中餐具的位置和照顧者能提供的協助仍待確認。",
        actionAndApproval: "記下用餐卡點與居家待查項目，交出院團隊。",
      },
      {
        stage: "出院交接與後續確認", roleLabel: "出院團隊與醫師", tone: "roleB",
        verifiedFacts: "兩份紀錄都指向在家用餐，已確認的表現來自病房。",
        openGaps: "長照核定服務與特約單位接案待查。",
        actionAndApproval: "臨床疑點由醫師確認；居家長照由照管及社區整合型服務中心依程序銜接。",
      },
    ],
    recoveryAcceptanceTitle: "看到什麼，才算交接完成",
    recoveryAcceptanceCriteria: "兩份紀錄對到同一目標，留下時間、情境與協助條件。未確認的醫師文件標待回覆，居家待查事項有接手人。治療能否繼續須回醫師確認與專業判斷。",
    defenseLayerNote: "保留各師的紀錄與團隊轉介的接手人。",
  },
  payAndCerts: {
    title: "月薪、全年所得與治療所開業資格怎麼比",
    summary: "先讀全時受僱統計，再按醫院、自費治療所或居家工作核聘用條件。",
    salaryHeading: "職能治療師月薪平均較高，物理治療師前一年度全年所得較高",
    salaryBody: `勞動部職類別薪資調查（PSDN）表 3 的全體工業及服務業，職能治療師與物理治療師在 ${pay.monthlyPeriod}的平均經常性薪資分別為新臺幣 ${pay.all.otMonthly} 元與 ${pay.all.ptMonthly} 元，${pay.annualPeriod}平均全年薪資所得為 ${pay.all.otAnnual} 萬元與 ${pay.all.ptAnnual} 萬元。表 18 的總計兩職與表 3 相同；只看「醫療保健業」子欄，兩職月薪依序為 ${pay.health.otMonthly} 元與 ${pay.health.ptMonthly} 元，全年所得為 ${pay.health.otAnnual} 萬元與 ${pay.health.ptAnnual} 萬元。兩項統計分屬不同期間，月薪含經常性給付，全年所得另含獎金等非經常性給付。母體為全時受僱員工，自營與部分工時另看；社會工作服務業子欄未列兩職數值，兩表也未給同城同年資差額。

醫院聘用可分固定薪資、醫勤或績效獎金、加班和年終。自費治療所按地方核定標準收費並開明細，聘用上若有按次分潤，要看實收、退費與爽約如何入帳，項目單價和受僱者薪資分開算。長照特約服務依照顧計畫及實際提供內容申報；若職缺以訪次計酬，需再拆交通補貼、到宅文件及排程空檔。健保按服務項目與申報條件給付，長照有另套支付單位；兩者均應與勞動報酬分開。

同城同資歷可先做一張表，第一欄填書面保證的本薪發放月數、固定津貼及保證獎金，第二欄列達標才有的給付與契約期滿日，第三欄列服務時段、交通、紀錄及取消造成的工時。自營者可另以實收扣租金、設備、行政與耗材，再留稅費和空檔預備金。若兩份名目收入接近，用同一段期間的保證金額除以總投入工時，並比較第一年能交的臨床成果和職等條件。`,
    certs: [
      {
        name: "專技高考醫事人員考試｜職能治療師",
        officialScope: "考選部的職能治療師類科。應考資格查職能治療學等相關科系、學歷採認及合格實習。",
        workplaceBoundary: "由考試院發給考試及格證書後，向衛福部請領職能治療師證書，再向執業所在地主管機關申請執業登記、領執業執照，並加入所在地公會。",
        verificationTips: "選系前核應考、學歷採認及校方實習安排。",
        officialLinks: [{ label: "職能治療師考試與應考資格", href: sources.exams.href }, { label: "職能治療師實習認定", href: sources.otInternship.href }, { label: "執業與證書", href: sources.otLaw.href }],
      },
      {
        name: "專技高考醫事人員考試｜物理治療師",
        officialScope: "考選部的物理治療師類科。依附表核物理治療學、復健醫學系物理治療組等相應科系及實習；實習包含肌肉骨骼、神經，以及呼吸循環／小兒等項目。",
        workplaceBoundary: "通過後依次取得考試及格證書、向衛福部請領物理治療師證書、在所在地辦執業登記領執業執照，並加入所在地公會。",
        verificationTips: "把院所指定的臨床經驗和法定資格分開核。",
        officialLinks: [{ label: "物理治療師考試與應考資格", href: sources.exams.href }, { label: "物理治療師實習認定", href: sources.ptInternship.href }, { label: "執業與證書", href: sources.ptLaw.href }],
      },
      {
        name: "兩類治療所的開業執照與長照服務",
        officialScope: "職能治療所由職能治療師申設，須在中央主管機關指定的醫療機構執行業務兩年以上。物理治療所由物理治療師申設，須在中央主管機關指定的機構執行業務兩年以上。年資依各法核算，設所須向所在地主管機關申請核准登記並領開業執照。",
        workplaceBoundary: "申請人擔任治療所負責人並負督導責任。個人受僱執業與機構開業各有條件；若做長照專業服務，另看人員訓練、認證、登錄和單位特約的服務範圍。",
        verificationTips: "有開業打算時，留存執業登記及年資證明，核指定機構與設置條件。",
        officialLinks: [{ label: "職能治療所設置標準", href: sources.otFacility.href }, { label: "物理治療所設置標準", href: sources.ptFacility.href }, { label: "長照人員訓練認證及登錄", href: sources.careStaff.href }],
      },
    ],
    interviewChecklistTitle: "求職時把收入、定級與臨床成長一起核對",
    interviewChecklistQuestions: [
      { label: "穩定收入", question: "以固定薪額和發放月數算出年收入，並把需達標、留任或等結算才發的獎金另列。" },
      { label: "職等責任", question: "核定級是否採計照護情境、跨專業交接、臨床教學和合格年資，確認何時複評。" },
      { label: "接案安排", question: "對照每週行程，把預約空檔、晚間或週末、移動、取消和寫紀錄的時間一起算。" },
      { label: "新人工作範圍", question: "先找一個可跟完的完整療程或服務，核實何時能參與初評、活動或動作複測與結案。" },
    ],
  },
  thirtyDayPlugin: {
    badge: "四週紙面作品",
    title: "30 天做四件能讓前輩複核的作品",
    summary: "選一軌，每週交一頁，註明來源與接手角色。用臺灣公開材料及下列欄位提示，只讀寫合成資訊。考試附表若暫時打不開，可先按各週列的領域建欄。",
    tracks: [
      {
        id: "occupational-therapy", title: "職能治療軌", badge: roleA, tone: "roleA",
        weeks: [
          { weekLabel: "第一週", deliverable: "交一份就學準備表。讀考試院應試科目和職能實習認定。將活動分析、生理、心理與小兒各自放進考科或實習欄，註明版本。圈出一種要向校方查證的實習場域。" },
          { weekLabel: "第二週", deliverable: "交一張兒童日常活動拆解圖。讀臺大兒童職能介紹。拆解合成任務「收拾書包」，以辨識、操作及收納分欄，每欄寫可觀察的行為和一項待問家長的條件。圈出更換教室後需重看的欄。" },
          { weekLabel: "第三週", deliverable: "交一份自費治療所條件核對表。讀《職能治療師法》、設置標準和彰化縣之公開收費入口，分欄寫出個人執業、所端開業及費用核定各要看哪份文件，無法查到的收費項目留待核。" },
          { weekLabel: "第四週", deliverable: "交一頁居家「活動成果」比較表。用長照專業服務紀錄參考格式第五到第六頁，從評估與結案挑三個欄位，自擬兩筆無姓名的備餐情境，一筆有家屬轉述、一筆有現場觀察。逐筆標來源、協助程度和待回核欄位，再圈出能支持結案的紀錄。" },
        ],
      },
      {
        id: "physical-therapy", title: "物理治療軌", badge: roleB, tone: "roleB",
        weeks: [
          { weekLabel: "第一週", deliverable: "交一張物理治療學科與場域圖。查考試院應試科目和實習認定，將肌動學、生物力學、神經、骨科、心肺與小兒標到對應欄位。分開考科與實習規範，圈選兩個實習場域。離線可先註記附表適用於民國 103 年 6 月 1 日以後畢業者。" },
          { weekLabel: "第二週", deliverable: "交一份小兒移動觀察字典。讀臺大物理治療早療介紹，選合成情境「由教室門口到座位」，用文字建立出發位置、地面、協助程度及停止位置四欄。寫兩筆條件不同的合成標籤，圈出比較前要對齊的兩欄。只寫欄位。" },
          { weekLabel: "第三週", deliverable: "交一張雙欄讀表卡。健保欄依中風品質指標附註，抄物理與職能治療的醫令碼分組，註明用途。長照欄讀 114 年 6 月 19 日修正的附表四，填 CA07 一個支付單位含幾次措施、是否含評估。每欄註來源與適用範圍。" },
          { weekLabel: "第四週", deliverable: "交一張出院移動交接索引。依臺大物理治療中心的術後早期活動與跨科照會說明，為合成的「從病房到居家」用醫師文件、治療師觀察及居家環境建索引。只有病房觀察有紀錄；每筆註明來源和接手者，其餘標待核。" },
        ],
      },
    ],
  },
  checklist: {
    title: "你想練的能力，和能接受的工作條件",
    summary: "勾一件想練的事，再勾一項可長期接受的安排，分開比對職缺。",
    skillsHeading: "技能｜你想練的工作",
    skillsOptions: [
      { id: "activity-analysis", track: "roleA", label: "把生活任務拆成可觀察的步驟", summary: "找出物件、環境和協助方式改變時，當事人在哪一段開始卡住。", interviewQuestions: ["初評會怎麼選要跟的生活任務？哪份紀錄能讓新人看懂活動分析？"] },
      { id: "family-handoff", track: "roleA", label: "把觀察說成家屬聽得懂的回報", summary: "用具體描述協助家屬分辨看到、聽到和仍待查的生活表現。", interviewQuestions: ["請前輩介紹一次家長溝通的分工，以及家屬回報如何進紀錄。"] },
      { id: "movement-context", track: "roleB", label: "把步態或移位的差異說清楚", summary: "記場地、輔具與協助條件，再看前後資料能否比較。", interviewQuestions: ["新人寫完初評後，誰複核測試條件？什麼時候能跟到後續複測？"] },
      { id: "shared-record", label: "把臨床觀察交給下一位接手者", summary: "標出觀察情境和未核事項，讓同事知道哪些可以接續查。", interviewQuestions: ["能否用合成範例示範門診、住院和居家轉介用的紀錄？"] },
    ],
    conditionsHeading: "條件｜你能長期維持的安排",
    conditionsOptions: [
      { id: "caregivers", track: "roleA", label: "願意與家屬反覆對齊不同期待", summary: "早療與長照都要追家庭情境。把溝通、備料和收尾時間算進日程。", interviewQuestions: ["家屬回饋或聯評會議由誰記錄？這段時間是否列進班表？"] },
      { id: "movement-work", track: "roleB", label: "可承受床邊與門診的體力需求", summary: "先看站立、示範、移位工作和設備支援，再決定可承受的班量。", interviewQuestions: ["各場域有幾名同事支援？指派到病房前有哪些訓練和交接？"] },
      { id: "home-travel", label: "能接受居家訪視的移動和變動", summary: "居家工作中，跨點交通、案家取消和紀錄構成額外的時間成本。", interviewQuestions: ["看一週實際服務分區，移動與取消如何計薪，紀錄安排在哪段時間？"] },
      { id: "record-time", label: "願意在接案之外保留紀錄時間", summary: "臨床、行政、教學和申報都要排進時間。", interviewQuestions: ["班表是否把一段紀錄或複核時間保留下來？跨院支援怎麼算？"] },
    ],
    defaultInterviewQuestions: [
      "前半年能完整跟過哪種服務，從初評一路做到回看與結案？",
      "現場觀察、家屬回報和醫師文件不同時，誰接手查明？",
    ],
    crossTrackNote: "兩種工作都想看，可從醫院復健科與兒童聯評找職缺。優先看班表時，先用固定據點或日班篩選。",
    offlinePrintHint: "紙本可各圈一項：想跟的工作成果、能接受的環境，帶去比對職缺。",
  },
  desktopExercise: {
    sectionTitle: "五分鐘紙面試做｜居家訪視紀錄交給誰",
    summary: "任選一軌，用三行交接合成訪視紀錄。全程可離線，姓名等識別欄留白，只做紙面讀寫。",
    publicLinksHeading: "公開表單：",
    publicLinks: [sources.careForm],
    factSummaryHeading: "可離線重做的欄位卡：",
    factSummary: `官方參考表把服務項目、訪視次數與日期起訖、指導對象、訓練紀錄、案家與專業人員簽章分欄。日期或簽章空白代表文件待核，訪視有無仍待確認。

合成版本一｜${exercise.code}，${exercise.visit}，指導對象是${exercise.audience}。${exercise.missing}。家屬回報「${exercise.report}」。當次專業人員觀察「${exercise.observation}」。其他條件均未記錄。`,
    taskA: {
      title: "職能軌｜留下可回看的取物紀錄",
      instruction: "先寫項目、次數和對象，再標出兩筆的來源。說出哪幾欄待原專業人員和案家回核。最後針對「拿杯子」寫出一項要核的環境資訊和一個可回看的活動表現。",
    },
    taskB: {
      title: "物理軌｜留下可回看的起身紀錄",
      instruction: "先寫項目、次數和對象，再標出兩筆的來源。說出哪幾欄待原專業人員和案家回核。最後針對「從餐桌椅起身」寫出一項要核的動作條件和一個可回看的協助線索。",
    },
    rubricTitle: "展開核對點與樣答",
    rubricHeading: "每軌四個核對點",
    rubricPassRule: "兩個共用點和所選軌的兩點均找得到，就完成。把未核的活動或動作條件寫成待回查。",
    rubricItems: [
      "共用｜寫對服務項目、次數、對象。杯子是家屬回報，椅旁是現場觀察。",
      "共用｜日期、起訖及雙簽均記待核。原專業人員核原資料，雙方各核自己的簽章。",
      "職能｜找一項杯子位置等環境線索，標記待核。",
      "職能｜列一個可回看的取物表現，例如有無提醒即能找到杯子。",
      "物理｜找一項座椅條件等動作線索，標記待核。",
      "物理｜列一個可回看的協助線索，例如誰在起身的哪一段提供協助。",
    ],
    sampleAnswerALabel: "職能軌樣答：",
    sampleAnswerA: `${exerciseRecord}找當次訪視者確認杯子所在的櫃層；活動表現欄先列是否需要口頭提醒才找得到杯子，標待觀察。`,
    sampleAnswerBLabel: "物理軌樣答：",
    sampleAnswerB: `${exerciseRecord}請當次訪視者補核椅面條件；協助欄列誰在起身哪一段提供協助，標待回查。`,
  },
  tools: {
    title: "選一個下一步，帶著問題找職缺",
    summary: "按目前最想確認的問題選一個入口。",
    cards: [
      { id: "compare", badge: "已有候選", meta: "雙職業對比", tone: "roleA", title: "把想投的兩個職業放一起看", description: "並排兩個候選職業的任務和入行條件。", purposeHint: "已有兩個方向，要縮小選擇。", ctaLabel: "前往職業對比", href: "/zh-TW/career/compare" },
      { id: "worksheet", badge: "留下一個行動", meta: "探索工作表", tone: "neutral", title: "記下準備查的臨床成果", description: "記下想跟的服務、可接受的條件和待查資訊。", purposeHint: "已有一份職缺或方向，準備查證。", ctaLabel: "打開我的工作表", href: "/zh-TW/career/interest-worksheet#my-worksheet" },
      { id: "holland", badge: "還在找方向", meta: "霍蘭德 60 題", tone: "accent", title: "找出想多做的日常活動", description: "從六個興趣面向和三字碼整理偏好，再對照工作情境。", purposeHint: "還想探索哪些活動吸引自己。", ctaLabel: "開始霍蘭德職業興趣測試", href: "/zh-TW/tests/holland-career-interest-test-riasec" },
      { id: "career94", badge: "核對適應條件", meta: "職業測試 94 題", tone: "roleB", title: "對照自己偏好的工作方式", description: "用工作活動、方式和條件題目整理自己的偏好。", purposeHint: "喜歡工作內容，還想比工作環境。", ctaLabel: "前往職業測試", href: "/zh-TW/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "分開讀兩份職業檔案",
    profileLinks: [
      { label: "職能治療師職業檔案", href: "/zh-TW/career/jobs/occupational-therapists" },
      { label: "物理治療師職業檔案", href: "/zh-TW/career/jobs/physical-therapists" },
    ],
  },
  faqs: [
    {
      id: "rehabilitation-roles",
      question: "都在做復健，職能治療師和物理治療師到底差在哪？",
      answer: "物理治療師追人如何移動和使用身體功能，職能治療師追一件有意義的生活活動如何完成。例如要自己盥洗，物理軌可記下到了洗手台前的站立與移位，職能軌可記下找用品、操作和順序需要多少提示。實際分工有重疊，應徵時以職缺列出的評估對象、服務產出和交班責任辨認。",
    },
    {
      id: "professional-entry",
      question: "已經讀了別的科系，可以直接考職能或物理治療師嗎？",
      answer: "先查考選部是否採認你的科系與實習。兩個類科都要核對應科、系、組的畢業資格及合格實習，留學背景另核教育部採認。國考及格後，還要請領相應的專門職業證書，再在執業所在地辦理登記。若已有另一職的證照，轉職仍要完成目標類科的資格程序。",
    },
    {
      id: "physician-referral",
      question: "自費治療所工作，疾病治療還需要醫師開具依據嗎？",
      answer: `${physicianBasis}自費是付款方式，治療所收費由地方主管機關核定。臺大醫院的自費動態副木流程就有醫令及自費同意書；想在治療所工作，分開核所端留存的醫師文件、服務紀錄與核定收費。`,
    },
    {
      id: "early-intervention",
      question: "想做兒童早療，選職能治療還是物理治療？",
      answer: "如果想看孩子如何遊戲、操作物件、穿衣和參與教室活動，先讀兒童職能；若想追孩子如何維持姿勢、改變位置及發展移動能力，先讀小兒物理。兩邊都有家長合作。聯合評估的職務也可含會議、教學及紀錄，投遞時核計畫期限。",
    },
    {
      id: "long-term-care",
      question: "長照居家復能和在醫院復健科上班差在哪？",
      answer: "居家復能從案家原本的空間和優先生活目標出發，有照顧者指導、紀錄和結案；醫院復健則可在病房或門診按臨床需要銜接治療。長照給付要核照顧計畫、相應的人員資格與單位特約。若喜歡在不同情境找生活障礙，居家值得看；若需要固定據點及同事就在身旁，先比醫院職缺的病房與門診分配。",
    },
    {
      id: "pay-structure",
      question: "應徵職能或物理治療師，哪份薪水較值得選？",
      answer: "先比較同城同資歷、同工時的保證收入，再檢視可累積的責任。醫院聘書若列醫勤、績效或年終，找出保證與達標兩種規則；自費治療所看分潤何時入帳及爽約歸誰；居家職務把付費訪次和整趟路程的投入都算上。定級可看是否採計合格年資、獨立評估、跨科合作或臨床教學。若工作長期只排器材、帶單一活動或填表，就對照新人能否跟過初評、治療或服務紀錄與複測。拿各自的保證年薪扣掉必要自付通勤，再按記錄、交通與服務總工時換算，浮動項留在另一欄。",
    },
    {
      id: "automation-2026",
      question: "2026 年，電子病歷或 AI 能幫兩種治療師做什麼？",
      answer: "院所若部署相應功能，電子表單可協助帶入日期和服務欄位、提示漏填；獲機構核准的生成式 AI 可把允許使用的文字先整理成待覆核的草稿。對照原始觀察時，職能治療師仍要分清家屬說法與現場活動表現，物理治療師要核實動作、協助和複測條件。衛福部指引要求醫事人員製作病歷時按規範審核與簽章。臨床疑點由醫師確認，資料依機構權限處理。",
    },
  ],
  sourceGroups: [
    { id: "statistics", title: "臺灣職類、薪資原表與調查方法", links: [sources.otClassification, sources.ptClassification, sources.payMethod, sources.payAll, sources.paySector] },
    { id: "qualifications", title: "醫事考試、執業與治療所設置", links: [sources.otLaw, sources.ptLaw, sources.otAmendment, sources.ptAmendment, sources.exams, sources.examEntry, sources.otInternship, sources.ptInternship, sources.otFacility, sources.ptFacility] },
    { id: "care-settings", title: "醫院、兒童早療與徵才樣本", links: [sources.otHospital, sources.ptHospital, sources.earlyCenter, sources.earlyOT, sources.earlyPT, sources.ptRecruitment, sources.earlyRecruitment] },
    { id: "payment-and-home-care", title: "健保、自費與長照居家復能原證", links: [sources.feeSchedule, sources.rehabCodes, sources.localFees, sources.selfPayOT, sources.carePay, sources.ca07, sources.careStaff, sources.careForm, sources.careNetwork] },
    { id: "portfolio-materials", title: "四週作品延伸材料", requiresPlugin: "thirtyDay", links: [sources.examSubjects] },
    { id: "software", title: "生成式 AI 與醫事人員紀錄責任", links: [sources.genAI, sources.electronicRecords] },
  ],
};
