import { resultCopy, type Text } from "./result-editorial";

type Decision = {
  year: number;
  title: Text;
  fact: Text;
  interpretation: Text;
  source: { url: string; label: string; locator: string };
};

type GeoEditorial = {
  summary: Text;
  decision: Decision;
  question: Text;
  answer: Text;
};

export const globalHistoryGeoEditorial: Readonly<Partial<Record<string, GeoEditorial>>> = {
  "francois-guizot": {
    summary: resultCopy(
      "法国教育大臣基佐推动由各市镇维持小学。费马据其跨地方建立制度的做法作 ENTJ 传记解读。Cox 童年、青年回推估值分别为 155、165。",
      "法國教育部長基佐推動由各市鎮維持小學。費馬依其跨地方建立制度的做法作 ENTJ 傳記解讀。Cox 童年、青年回推估值分別為 155、165。",
      "French education minister François Guizot helped establish a system in which communes maintained primary schools. FermatMind reads that effort to organize education across local boundaries as part of an editorial ENTJ interpretation. Cox’s retrospective childhood and youth estimates were 155 and 165 respectively. Article 9 of the 1833 education law shows how that arrangement worked: neighboring communes could meet the requirement together and share the responsibility.",
    ),
    decision: {
      year: 1833,
      title: resultCopy("给每个市镇一项办学责任", "讓每個市鎮負起辦學責任", "Make primary schooling a local obligation"),
      fact: resultCopy(
        "基佐推动的初等教育法第九条要求每个市镇至少维持一所初等小学。市镇可以独立承担，也可以联合附近市镇办学。",
        "基佐推動的初等教育法第九條要求每個市鎮至少維持一所初等小學。市鎮可以獨立承擔，也可以和鄰近市鎮合作辦學。",
        "Article 9 of the primary education law championed by Guizot required each commune to maintain at least one elementary primary school, either on its own or together with nearby communes.",
      ),
      interpretation: resultCopy(
        "费马关注的协作线索是把全国目标变成地方责任，同时允许邻近市镇分担资源。一项法律只能说明这次制度安排，无法测出他的性格类型。",
        "費馬關注的協作線索，是把全國目標轉為地方責任，同時讓鄰近市鎮共同分擔資源。一項法律能說明這次制度安排，無法測出他的性格類型。",
        "The collaboration cue here is how a national requirement let small jurisdictions share the cost and work. One law can illustrate that choice, but cannot establish a personality type.",
      ),
      source: {
        url: "https://www.education.gouv.fr/sites/default/files/document/T%C3%A9l%C3%A9charger%20la%20loi%20sur%20l%26%23039%3Binstruction%20primaire%20-%20Loi%20Guizot-234819.pdf",
        label: "Ministère de l’Éducation nationale",
        locator: "Loi du 28 juin 1833, titre III, article 9",
      },
    },
    question: resultCopy("一个市镇必须自己建小学吗？", "每個市鎮都得自行開辦小學嗎？", "Did every commune have to run a school by itself?"),
    answer: resultCopy(
      "不必。第九条允许数个相邻市镇一起维持学校。它规定了公共责任，也给地方留下了合作的空间。",
      "不必。第九條允許相鄰的市鎮共同維持學校。條文規定公共責任，也保留地方合作的空間。",
      "No. Article 9 let neighboring communes meet the requirement jointly. It set a public obligation while leaving room for local cooperation.",
    ),
  },
  "katherine-johnson": {
    summary: resultCopy(
      "美国数学家凯瑟琳·约翰逊在葛伦绕地飞行前独立复核轨道数字。费马以这次核验作 ISTJ 传记解读。Cox 1926 原表未收录她。",
      "美國數學家凱薩琳·強森在葛倫繞地飛行前獨立複核軌道數字。費馬以這次查核作 ISTJ 傳記解讀。Cox 1926 原表並未收錄她。",
      "The American mathematician Katherine Johnson independently checked orbital calculations before John Glenn’s flight. FermatMind uses that verification step in its editorial ISTJ reading of Johnson’s work. She does not appear in Cox’s 1926 tables. NASA records the episode under the 1962 Friendship 7 mission and includes Johnson’s own recollection of checking the trajectory that the electronic computer had originally calculated.",
    ),
    decision: {
      year: 1962,
      title: resultCopy("用独立计算复核电子计算机", "用獨立計算複核電腦結果", "Recheck the computer’s trajectory independently"),
      fact: resultCopy(
        "友谊 7 号升空前，约翰·葛伦要求约翰逊亲自复核电子计算机算出的飞行轨迹。按约翰逊的回忆，她重新核算后确认原结果正确。",
        "友誼 7 號升空前，約翰·葛倫請強森親自複核電腦算出的飛行軌跡。依強森的回憶，她重新核算後確認原結果正確。",
        "Before Friendship 7 launched, Glenn asked Johnson to verify the trajectory computed electronically. In Johnson’s account, her independent check confirmed the original calculations.",
      ),
      interpretation: resultCopy(
        "费马把独立验算读作六维里的求证线索。这个例子能说明她在此次任务如何确认结果，不能测定她在其他情境的偏好。",
        "費馬把獨立驗算視為六維中的求證線索。這項工作能說明她如何確認此次任務的結果，無法測出她在其他情境下的偏好。",
        "FermatMind treats independent verification as an inquiry cue. It explains how she checked this result and leaves her preferences in other situations open.",
      ),
      source: { url: "https://science.nasa.gov/people/katherine-johnson/", label: "NASA Science", locator: "Friendship 7 and Johnson’s account of the trajectory check" },
    },
    question: resultCopy("她重算的是哪项数据？", "她重新核算的是哪一項資料？", "What did Johnson actually recheck?"),
    answer: resultCopy(
      "她检查的是电子计算机算出的飞行轨迹数据。NASA 将这次复核记在葛伦 1962 年的友谊 7 号任务下。",
      "她檢查的是電腦算出的飛行軌跡。NASA 把這次複核記在葛倫 1962 年的友誼 7 號任務中。",
      "She verified the trajectory from the electronic computer. NASA places this check before Glenn’s 1962 Friendship 7 flight.",
    ),
  },
  "benjamin-franklin": {
    summary: resultCopy(
      "美国政治家富兰克林在制宪会议最后一天劝代表签字。费马以这次公开协调作 ENTJ 传记解读。Cox 对其童年和青年回推估值均为 160。",
      "美國政治家富蘭克林在制憲會議最後一天勸代表簽字。費馬以這次公開協調作 ENTJ 傳記解讀。Cox 對其童年和青年回推估值均為 160。",
      "On the last day of the US Constitutional Convention, Benjamin Franklin urged delegates to sign. FermatMind interprets this effort to win public agreement as part of an editorial ENTJ reading. Cox put both retrospective estimates at 160. The United States National Archives records that James Wilson delivered Franklin’s speech for him, including his willingness to endorse a draft about which he still had reservations.",
    ),
    decision: {
      year: 1787,
      title: resultCopy("带着保留意见支持共同文本", "帶著保留意見支持共同文本", "Back a common text despite misgivings"),
      fact: resultCopy(
        "9 月 17 日最后一次会议上，詹姆斯·威尔逊代为宣读富兰克林的讲话。富兰克林承认对部分内容有疑虑，仍建议代表签署形成的共同文本。",
        "9 月 17 日最後一次會議上，詹姆斯·威爾遜代為宣讀富蘭克林的講稿。富蘭克林承認對部分內容仍有疑慮，仍建議代表簽署這份共同文本。",
        "At the final session on September 17, James Wilson read Franklin’s speech on his behalf. Franklin acknowledged reservations about parts of the draft and urged delegates to sign the document they had produced.",
      ),
      interpretation: resultCopy(
        "费马从这段讲话看到的是用公开表态推动集体决定的影响力线索。它说明富兰克林在这场会议上的做法，不能单独确定一个 MBTI 类型。",
        "費馬從這段講稿看見他用公開表態推動共同決定。這能說明富蘭克林在該次會議的做法，無法單憑一事判定 MBTI 類型。",
        "The influence cue is an appeal for a shared decision, made openly even with reservations. That describes Franklin’s approach at this meeting without establishing an MBTI type.",
      ),
      source: { url: "https://www.archives.gov/founding-docs/more-perfect-union", label: "US National Archives", locator: "September 17 closing session and Franklin’s speech" },
    },
    question: resultCopy("富兰克林赞同草案的每一条吗？", "富蘭克林同意草案中的每一條嗎？", "Did Franklin agree with every provision?"),
    answer: resultCopy(
      "没有。他在讲话里承认保留意见，仍主张代表签字。当天这篇讲话由詹姆斯·威尔逊宣读。",
      "沒有。他在講稿中承認仍有保留，卻還是主張代表簽字。當天由詹姆斯·威爾遜代讀。",
      "He acknowledged reservations and still called on delegates to sign. James Wilson delivered the speech for him.",
    ),
  },

  "george-sand": {
    summary: resultCopy(
      "法国小说家乔治·桑在 1848 年为共和政府的公报写稿。费马从她把文学笔力带进公共议题的选择作 INFP 传记解读。Cox 两项回推估值均为 160。",
      "法國小說家喬治·桑在 1848 年為共和政府的公報撰稿。費馬從她把文學筆力帶進公共議題的選擇作 INFP 傳記解讀。Cox 兩項回推估值均為 160。",
      "French novelist George Sand contributed to the republican government’s bulletin in 1848. FermatMind’s editorial INFP reading looks at her choice to bring a writer’s voice into public debate. Cox assigned her two retrospective estimates of 160. The French National Assembly catalogues several of the bulletins among her political writings, alongside letters and addresses that make it possible to trace her participation.",
    ),
    decision: {
      year: 1848,
      title: resultCopy("给新共和国的公报撰稿", "為新共和國的公報撰稿", "Write for the republic’s public bulletin"),
      fact: resultCopy(
        "二月革命后，乔治·桑为《共和国公报》撰稿。法国国民议会整理的文献列出多期公报，同时保留了她写给中央委员会成员的文字。",
        "二月革命後，喬治·桑為《共和國公報》撰稿。法國國民議會整理的文獻列出多期公報，也保存了她寫給中央委員會成員的文字。",
        "After the February Revolution, Sand wrote for the Bulletin de la République. The French National Assembly’s collection lists multiple bulletins alongside her writing addressed to members of the central committee.",
      ),
      interpretation: resultCopy(
        "这个选择显示她把写作从小说拓展到公共表达，是费马六维中做事范围的一个线索。文献足以核实她参与写作，无法证实一个 MBTI 型号。",
        "這個選擇顯示她把寫作從小說拓展到公共表達，是費馬六維中做事範圍的一項線索。文獻足以核實她參與撰稿，無法證實 MBTI 類型。",
        "Moving between fiction and public writing informs FermatMind’s scope dimension. Attribution of the bulletins establishes her contribution, while the type remains an editorial reading.",
      ),
      source: { url: "https://www.assemblee-nationale.fr/evenements/G-Sand/g-sand.asp", label: "Assemblée nationale", locator: "Les Textes de la lecture-spectacle, Politiques et Polémiques" },
    },
    question: resultCopy("哪里能找到她参与的公报？", "哪裡能找到她參與的公報？", "Where can readers find the bulletins?"),
    answer: resultCopy(
      "法国国民议会的专题把《共和国公报》第 8 期和第 12 期列入乔治·桑的政治文章选目。",
      "法國國民議會的專題將《共和國公報》第 8 期和第 12 期列入喬治·桑的政治文章選目。",
      "The French National Assembly lists issues 8 and 12 in its selection of Sand’s political writings.",
    ),
  },
  "william-makepeace-thackeray": {
    summary: resultCopy(
      "英国小说家萨克雷为《名利场》自绘插图，并以「没有英雄」标明写作选择。费马据此作 INTP 传记解读。Cox 两项回推估值为 145、150。",
      "英國小說家薩克萊為《名利場》自繪插圖，並以「沒有英雄」標明寫作選擇。費馬據此作 INTP 傳記解讀。Cox 兩項回推估值為 145、150。",
      "British novelist William Makepeace Thackeray illustrated Vanity Fair himself and deliberately subtitled it A Novel Without a Hero. FermatMind’s editorial INTP reading considers his willingness to question a narrative convention. Cox’s two retrospective estimates were 145 and 150. The Metropolitan Museum of Art’s record anchors that creative choice in the book itself. Its title and illustration credits let readers check what Thackeray chose to put into print.",
    ),
    decision: {
      year: 1848,
      title: resultCopy("在书名页上取消英雄的位置", "在書名頁上取消英雄的位置", "Put ‘without a hero’ on the title page"),
      fact: resultCopy(
        "萨克雷给《名利场》加上「没有英雄的小说」这个副标题，也亲自绘制插图。大都会艺术博物馆的藏本记录把文字和插图都归于他。",
        "薩克萊給《名利場》加上「沒有英雄的小說」這個副標題，也親自繪製插圖。大都會藝術博物館的藏本記錄將文字和插圖都歸於他。",
        "Thackeray subtitled Vanity Fair A Novel Without a Hero and illustrated it himself. The Metropolitan Museum of Art’s catalog credits him with both the text and the illustrations.",
      ),
      interpretation: resultCopy(
        "费马把改变主角预期的做法视为六维中的变化线索。这是一次可核查的叙事选择，传记类型仍是编辑判断。",
        "費馬把改變主角預期的做法視為六維中的變化線索。這是一次可查證的敘事選擇，傳記類型仍是編輯判斷。",
        "Changing a reader’s expectations of the protagonist is the change cue in this reading. The title documents a narrative choice and does not measure personality.",
      ),
      source: { url: "https://www.metmuseum.org/art/collection/search/357842", label: "The Metropolitan Museum of Art", locator: "Vanity Fair catalog record and illustration credits" },
    },
    question: resultCopy("插图是谁画的？", "插圖是誰畫的？", "Who illustrated the book?"),
    answer: resultCopy(
      "大都会艺术博物馆的藏本注明文字和插图均出自萨克雷。",
      "大都會藝術博物館的藏本註明文字與插圖都出自薩克萊。",
      "The Metropolitan Museum of Art credits Thackeray with both writing and illustrating the book.",
    ),
  },
  "nguyen-trai": {
    summary: resultCopy(
      "越南文臣阮廌为黎利拟写《平吴大诰》，以公共文告陈述大越立场。费马从这次跨层次论证作 INTJ 传记解读。Cox 原表未收录他。",
      "越南文臣阮廌為黎利擬寫《平吳大誥》，以公共文告陳述大越立場。費馬從這次跨層次論證作 INTJ 傳記解讀。Cox 原表未收錄他。",
      "The Vietnamese statesman Nguyễn Trãi drafted a public proclamation for Lê Lợi that set out Đại Việt’s position. FermatMind’s editorial INTJ reading considers the scope of that political argument. He does not appear in Cox’s 1926 tables. A National Palace Museum study explains why the wording matters: the proclamation called the polity Đại Việt and asserted parity with its northern neighbor.",
    ),
    decision: {
      year: 1428,
      title: resultCopy("在大诰中为大越陈述立场", "在大誥中為大越陳述立場", "State Đại Việt’s position in a public proclamation"),
      fact: resultCopy(
        "阮廌所拟《平吴大诰》以大越自称。台北故宫的文物解读指出，这一措辞把大越与北方的中国置于对等地位。",
        "阮廌所擬《平吳大誥》以大越自稱。國立故宮博物院的文物解讀指出，這一措辭把大越與北方的中國置於對等地位。",
        "In the proclamation drafted by Nguyễn Trãi, the polity calls itself Đại Việt. Taiwan’s National Palace Museum reads the wording as a claim to parity with its northern neighbor.",
      ),
      interpretation: resultCopy(
        "费马关注的是阮廌如何把政治主张放在一篇对内外都有意义的文告里。它为六维中的范围维度提供阅读线索，无法独立证明 MBTI。",
        "費馬關注的是阮廌如何把政治主張放在一篇對內外都有意義的文告裡。這為六維中的範圍維度提供線索，無法獨立證明 MBTI。",
        "FermatMind reads the proclamation’s move across domestic and external audiences as a clue to scope. It supports a discussion of this text, not a definitive personality classification.",
      ),
      source: { url: "https://www.npm.edu.tw/NewChineseArtDownload.ashx?bid=4621", label: "國立故宮博物院", locator: "故宮文物月刊第 475 期，第 17 頁，《平吳大誥》" },
    },
    question: resultCopy("文告如何称呼越南一方？", "文告如何稱呼越南一方？", "Which name does the proclamation use for Vietnam?"),
    answer: resultCopy(
      "故宫释读指出，节录文字以「大越之国」自称，并用「各帝一方」表达对等立场。",
      "故宮釋讀指出，節錄文字以「大越之國」自稱，並用「各帝一方」表達對等立場。",
      "The National Palace Museum highlights ‘the country of Đại Việt’ and reads the phrasing as an assertion of parity.",
    ),
  },

  "omar-khayyam": {
    summary: resultCopy(
      "波斯数学家海亚姆用圆锥曲线的交点处理三次方程。费马从他把代数问题改写成几何构造的做法作 INTP 传记解读。Cox 1926 原表未收录他。",
      "波斯數學家海亞姆用圓錐曲線的交點處理三次方程。費馬從他將代數問題轉為幾何構造的做法作 INTP 傳記解讀。Cox 1926 原表未收錄他。",
      "The Persian mathematician Omar Khayyam used intersections of conic sections to solve cubic equations. FermatMind’s editorial INTP reading considers his decision to move between algebra and geometry. Cox’s 1926 tables do not include him. One worked example illustrates why the switch matters: a point shared by a circle and a rectangular hyperbola yields a positive solution to a particular cubic.",
    ),
    decision: {
      year: 1070,
      title: resultCopy("把代数题变成找交点的问题", "把代數題轉成找交點的問題", "Turn an algebra problem into an intersection"),
      fact: resultCopy(
        "海亚姆约在 1070 年迁往撒马尔罕，在当地写出代数论著。他讨论如何用相交的圆锥曲线求三次方程解。圣安德鲁斯大学的资料还举出用圆与等轴双曲线得到一个正根的例子。",
        "海亞姆約在 1070 年遷往撒馬爾罕，在當地寫出代數論著。他討論如何用相交的圓錐曲線求三次方程解。聖安德魯斯大學的資料也舉出用圓與等軸雙曲線得到一個正根的例子。",
        "Khayyam moved to Samarkand around 1070 and wrote his algebra treatise there. He discussed solutions to different classes of cubics through intersecting conics. MacTutor also describes a case in which a circle and rectangular hyperbola give a positive root.",
      ),
      interpretation: resultCopy(
        "费马把改变问题的表示方式看作六维中做事范围的线索。海亚姆怎样求根可由数学史料讨论，性格类型仍属后人的编辑解读。",
        "費馬把改變問題的表示方式視為六維中做事範圍的線索。海亞姆如何求根可由數學史料討論，性格類型仍屬後人的編輯解讀。",
        "Moving between representations is the scope cue here. The sources document the mathematical work. The personality label is FermatMind’s editorial reading.",
      ),
      source: { url: "https://mathshistory.st-andrews.ac.uk/Biographies/Khayyam/", label: "University of St Andrews · MacTutor", locator: "Samarkand period and the discussion of cubic equations" },
    },
    question: resultCopy("具体用了哪两种曲线？", "具體用了哪兩種曲線？", "Which curves did he use?"),
    answer: resultCopy(
      "不同类型用的曲线不同。圣安德鲁斯大学列出一个例子：用圆与等轴双曲线的交点求得一个正根。",
      "不同類型用的曲線不同。聖安德魯斯大學列出一個例子：用圓與等軸雙曲線的交點求得一個正根。",
      "He used different curves for different classes. In one example described by MacTutor, a circle intersects a rectangular hyperbola and gives a positive root.",
    ),
  },
};
