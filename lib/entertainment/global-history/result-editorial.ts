import type { DisplayLocale } from "@/lib/i18n/locales";

export const resultCopy = <T>(zh: T, traditional: T, en: T): Record<DisplayLocale, T> => ({ zh, "zh-TW": traditional, en });
export type Text = Record<DisplayLocale, string>;

export type Editorial = {
  archetype_title: Text;
  one_line_hook: Text;
  superpower: Text;
  quirk_or_blindspot: Text;
  cognitive_gift_tag?: Text;
  fieldPeers?: readonly string[];
  portrait?: { source: string; license: "Public domain" | "CC0" };
  tags: Record<DisplayLocale, readonly [string, string, string]>;
  personality_benchmark: {
    inferred_mbti: string;
    title: Text;
    tendencies: readonly [number, number, number, number];
    big_five_traits: Record<DisplayLocale, readonly string[]>;
  };
  era: Text;
  years: readonly [number, number];
  source: string;
  accent: string;
};

export const batchEditorial = {
  "katherine-johnson": {
    archetype_title: resultCopy("给轨道盖章的人", "替軌道蓋章的人", "The Orbit’s Final Sign-Off"),
    one_line_hook: resultCopy("你不怕机器算得快，只怕大家把输出当成答案。", "你不怕機器算得快，只怕大家把輸出當成答案。", "A printout can tell you what the computer thinks. You still want to see the math."),
    superpower: resultCopy(
      "你擅长给复杂系统做那道最后的复核。格伦升空前，请约翰逊用桌上机械计算机重算轨道参数。碰上同样的局面，你会走一条独立的复核路径，让第一次计算有实在的交叉检验。",
      "你擅長替複雜系統做最後一道複核。葛倫升空前，請強生用桌上型機械計算機重算軌道參數。碰上同樣的局面，你會走一條獨立的複核路徑，讓第一次計算有實在的交叉檢驗。",
      "When the room has to trust a complicated system, you look for an independent check. Before John Glenn’s flight, Johnson reran the orbital figures on a mechanical calculator. Two calculation paths gave the team a result it could cross-check.",
    ),
    quirk_or_blindspot: resultCopy(
      "你很容易给任何细节配一把尺。约翰逊回忆，她小时候连上教堂的台阶和洗过的餐具也数。换成今天，能量化当然是长处。难的是在表格画满以前，听见那些还没有数字的疑问。",
      "你很容易替任何細節配一把尺。強生回憶，她小時候連教堂的階梯和洗過的餐具都會數。換成今天，能量化當然是長處。難的是在表格填滿以前，聽見那些還沒有數字的疑問。",
      "Your brain keeps a running tally. Johnson remembered counting church steps and the dishes she washed as a child. In a modern team, that appetite for measurement can crowd out questions nobody has figured out how to put in a spreadsheet.",
    ),
    cognitive_gift_tag: resultCopy("轨道推演与独立复核", "軌道推演與獨立複核", "Orbital math and cross-checking"),
    tags: resultCopy(["轨道复核", "数到最后", "发射窗口"], ["軌道複核", "數到最後", "發射窗口"], ["OrbitCheck", "CountEveryStep", "LaunchWindow"]),
    personality_benchmark: {
      inferred_mbti: "ISTJ", title: resultCopy("严谨核验者", "嚴謹查核者", "The Checker"), tendencies: [68, 78, 84, 87],
      big_five_traits: resultCopy(["高尽责性"], ["高盡責性"], ["High conscientiousness"]),
    },
    era: resultCopy("美洲 · 20世纪", "美洲 · 20世紀", "Americas · 20th century"),
    years: [1918, 2020],
    source: "https://science.nasa.gov/people/katherine-johnson/",
    accent: "#aee1ef",
  },
  "marie-curie": {
    archetype_title: resultCopy("从废矿里捞信号的人", "從廢礦裡撈訊號的人", "The Signal in the Ore"),
    one_line_hook: resultCopy("所有人都在测纯样，你先问剩下的渣子为什么更亮眼。", "大家都在測純樣，你先問剩下的渣子為什麼更引人注目。", "Everyone wants a cleaner sample. You want to know why the ore is more active."),
    superpower: resultCopy(
      "你擅长把离群读数变成下一轮实验。玛丽·居里测到沥青铀矿的放射性高于铀含量所能解释的水平。你也会先核对预期和实测，再顺着那个怎么都解释不通的差值追查下去。",
      "你擅長把異常讀數變成下一輪實驗。瑪麗・居禮測到瀝青鈾礦的放射性高於鈾含量所能解釋的程度。你也會先核對預期和實測，再順著那個怎麼都解釋不通的差值追查下去。",
      "You know when an outlier deserves a second experiment. Curie measured activity in pitchblende beyond what its uranium content explained. You’d turn that gap between expected and observed into the next question.",
    ),
    quirk_or_blindspot: resultCopy(
      "你追一条微弱线索时容易把耐力当成设备。居里为了分离少量镭，反复处理大量矿料，工作场所的条件也十分简陋。留下一套别人能安全复做的条件，同样能推进发现。",
      "你追一條微弱線索時，容易把耐力當成設備。居禮為了分離少量鐳，反覆處理大量礦料，工作場所的條件也十分簡陋。留下一套別人能安全複做的條件，同樣能推進發現。",
      "You can start treating stamina as a piece of lab equipment. Separating tiny amounts of radium meant processing large quantities of ore in rudimentary conditions. Progress also needs a setup another person can use safely.",
    ),
    cognitive_gift_tag: resultCopy("异常检出与实验追踪", "異常偵測與實驗追蹤", "Tracing experimental anomalies"),
    tags: resultCopy(["异常信号", "定量测量", "矿石分离"], ["異常訊號", "定量測量", "礦石分離"], ["Outlier", "Measurement", "OreSeparation"]),
    personality_benchmark: {
      inferred_mbti: "INTJ", title: resultCopy("实验策划者", "實驗策劃者", "The Experimentalist"), tendencies: [74, 72, 83, 84],
      big_five_traits: resultCopy(["高尽责性", "高开放性"], ["高盡責性", "高開放性"], ["High conscientiousness", "High openness"]),
    },
    era: resultCopy("欧洲 · 近代", "歐洲 · 近代", "Europe · Modern era"),
    years: [1867, 1934],
    source: "https://www.nobelprize.org/prizes/themes/marie-and-pierre-curie-and-the-discovery-of-polonium-and-radium/",
    accent: "#c4ecac",
  },
  "ada-lovelace": {
    archetype_title: resultCopy("给未造出的机器写程序", "替還沒造好的機器寫程式", "The Programmer Ahead of the Machine"),
    one_line_hook: resultCopy("你翻到机器说明书的最后一页，发现真正的玩法才刚开始。", "你翻到機器說明書的最後一頁，發現真正的玩法才剛開始。", "You read the last page of the manual and realize the interesting part hasn’t been built."),
    superpower: resultCopy(
      "你擅长把设想拆成可以一条条执行的动作。洛夫莱斯在分析机译文的附注里列出计算伯努利数的步骤。你看到一台机器，也会先想它能依什么规则处理不同种类的输入。",
      "你擅長把構想拆成能逐條執行的動作。洛夫萊斯在分析機譯文的附註裡列出計算伯努利數的步驟。你看到一臺機器，也會先想它能依什麼規則處理不同種類的輸入。",
      "You can turn a sweeping idea into a set of operations. In her notes on the Analytical Engine, Lovelace set out steps for computing Bernoulli numbers. You’d be asking what other inputs the same rules could handle.",
    ),
    quirk_or_blindspot: resultCopy(
      "你有时会把纸上跑通当成已经解决。洛夫莱斯写出步骤时，分析机还没有建成，那张流程表当时无法在原机上运行。写下一步前，先留一个条件能被实物检验的小样。",
      "你有時會把紙上跑通當成已經解決。洛夫萊斯寫出步驟時，分析機還沒有建成，那張流程表當時無法在原機上執行。寫下一步前，先留一個能用實物檢驗條件的小原型。",
      "A beautifully specified sequence can feel like a working prototype. Lovelace’s table described operations for a machine that was still unbuilt. An early test with real constraints can save you from polishing the wrong assumption.",
    ),
    cognitive_gift_tag: resultCopy("算法抽象与步骤设计", "演算法抽象與步驟設計", "Algorithmic abstraction"),
    tags: resultCopy(["纸上程序", "变量上机", "伯努利数"], ["紙上程式", "變數上機", "伯努利數"], ["PaperProgram", "Variables", "Bernoulli"]),
    personality_benchmark: {
      inferred_mbti: "INTP", title: resultCopy("抽象解题者", "抽象解題者", "The Abstract Thinker"), tendencies: [66, 90, 76, 65],
      big_five_traits: resultCopy(["高开放性", "高尽责性"], ["高開放性", "高盡責性"], ["High openness", "High conscientiousness"]),
    },
    era: resultCopy("欧洲 · 19世纪", "歐洲 · 19世紀", "Europe · 19th century"),
    years: [1815, 1852],
    source: "https://hsm.ox.ac.uk/node/2750441",
    accent: "#cac6fa",
  },
  "harriet-tubman": {
    archetype_title: resultCopy("会回头的领路人", "會回頭的帶路人", "The Guide Who Went Back"),
    one_line_hook: resultCopy("你先看谁能平安抵达，再决定这张路线图画得好不好。", "你先看誰能平安抵達，再決定這張路線圖畫得好不好。", "You judge the map by who makes it to the other end."),
    superpower: resultCopy(
      "你擅长把胆量变成能让人跟上的计划。塔布曼逃离奴役后仍多次返回，协助其他人获得自由。碰上混乱局面，你会从队伍里最需要支持的人开始想，安排大家能走完的路线。",
      "你擅長把膽量變成能讓人跟上的計畫。塔布曼逃離奴役後仍多次返回，協助其他人獲得自由。碰上混亂局面，你會從隊伍裡最需要支持的人開始想，安排大家能走完的路線。",
      "You turn resolve into a plan other people can follow. After escaping slavery, Tubman returned repeatedly to help others reach freedom. In a modern crisis, you’d begin with the person who needs the most support.",
    ),
    quirk_or_blindspot: resultCopy(
      "你很容易把最难的一段留给自己。内战期间，塔布曼承担了康巴希河行动中的领导任务。带队也要让他人掌握全局。让整个队伍知道下一步，风险有人一同承担。",
      "你很容易把最難的一段留給自己。內戰期間，塔布曼在康巴希河行動中承擔領導任務。帶隊也要讓他人掌握全局。讓整隊都知道下一步，風險才有人一起承擔。",
      "You can be quick to take the hardest leg yourself. Tubman took a leadership role in the Combahee River Raid during the Civil War. In everyday work, effective leadership also means sharing the plan so someone else can carry it forward.",
    ),
    cognitive_gift_tag: resultCopy("路线判断与团队协调", "路線判斷與團隊協調", "Route judgment and coordination"),
    tags: resultCopy(["回头领路", "队伍优先", "先看风险"], ["回頭帶路", "隊伍優先", "先看風險"], ["Guide", "TeamFirst", "RiskAware"]),
    personality_benchmark: {
      inferred_mbti: "ISTP", title: resultCopy("冷静行动派", "冷靜行動派", "The Practical Guide"), tendencies: [64, 78, 70, 71],
      big_five_traits: resultCopy(["高尽责性"], ["高盡責性"], ["High conscientiousness"]),
    },
    era: resultCopy("美洲 · 19世纪", "美洲 · 19世紀", "Americas · 19th century"),
    years: [1822, 1913],
    source: "https://www.archives.gov/research/african-americans/individuals/harriet-tubman",
    accent: "#eec78c",
  },
  "rachel-carson": {
    archetype_title: resultCopy("听见春天变安静的人", "聽見春天變安靜的人", "The Listener for a Silent Spring"),
    one_line_hook: resultCopy("大家都在看药喷下去以后少了什么虫，你还在听少了什么声音。", "大家都在看藥噴下去後少了什麼蟲，你還在聽少了什麼聲音。", "Everyone counts the pests that are gone. You listen for what else has fallen silent."),
    superpower: resultCopy(
      "你擅长跟住一个决定的连锁后果。卡森在《寂静的春天》里把农药使用和鸟类等非目标生物的遭遇摆在一起。给你一份只谈短期成效的报告，你会追问账单最后落在谁身上。",
      "你擅長看見一個決定的連鎖後果。卡森在《寂靜的春天》裡把農藥使用和鳥類等非目標生物的遭遇放在一起。給你一份只談短期成效的報告，你會追問最後由誰承擔代價。",
      "You follow decisions past their first visible result. In Silent Spring, Carson put pesticide use alongside what happened to wildlife it was never supposed to target. Give you a short-term success report and you’ll ask who bears the cost later.",
    ),
    quirk_or_blindspot: resultCopy(
      "你能把复杂证据浓缩成一个很难忘的画面。卡森的书遭农药行业猛烈反击，她主张研究使用安全和替代办法。你的警讯传开后，最好还能让读者一眼找到你提出的具体改法。",
      "你能把複雜證據濃縮成一個很難忘的畫面。卡森的書遭農藥業者猛烈反擊，她主張研究使用安全和替代辦法。你的警訊傳開後，最好還能讓讀者一眼找到你提出的具體做法。",
      "You can make evidence stick with one remarkable image. Carson’s book drew an industry backlash. She called for research into safe use and alternatives. Once your warning gets attention, make the remedy just as easy to find.",
    ),
    cognitive_gift_tag: resultCopy("生态因果与科学写作", "生態因果與科學寫作", "Ecological reasoning and writing"),
    tags: resultCopy(["春天回声", "生态连锁", "风险追踪"], ["春天回聲", "生態連鎖", "風險追蹤"], ["SilentSpring", "Ecology", "FollowTheEffects"]),
    personality_benchmark: {
      inferred_mbti: "INFJ", title: resultCopy("隐患观察者", "隱患觀察者", "The Watchful Writer"), tendencies: [76, 77, 70, 80],
      big_five_traits: resultCopy(["高开放性", "高尽责性"], ["高開放性", "高盡責性"], ["High openness", "High conscientiousness"]),
    },
    era: resultCopy("美洲 · 20世纪", "美洲 · 20世紀", "Americas · 20th century"),
    years: [1907, 1964],
    source: "https://www.fws.gov/staff-profile/rachel-carson-1907-1964-author-modern-environmental-movement",
    accent: "#c3e7ac",
  },
  "leonardo-da-vinci": {
    archetype_title: resultCopy("画册里的跨界总工", "畫冊裡的跨界總工程師", "The Sketchbook Engineer"),
    one_line_hook: resultCopy("你翻开下一页，人体、齿轮和水流已经是同一道题了。", "你翻開下一頁，人體、齒輪和水流已經是同一道題了。", "Turn the page and anatomy, gears, and water are suddenly the same problem."),
    superpower: resultCopy(
      "你擅长用画图拆开别人没法同时看见的部分。达·芬奇的手稿让力学、绘画和人体观察共用一套草图语言。你遇到陌生系统时也会先画结构，看看相似的机制能否跨到另一个领域。",
      "你擅長用畫圖拆開別人無法同時看見的部分。達文西的手稿讓力學、繪畫和人體觀察共用一套草圖語言。你遇到陌生系統時也會先畫結構，看看相似的機制能不能跨到另一個領域。",
      "You use a sketch to put moving parts on the same page. Leonardo’s notebooks move between mechanics, art and anatomy with drawings as the common language. A diagram lets you test whether a useful pattern travels across fields.",
    ),
    quirk_or_blindspot: resultCopy(
      "你的私人速记容易把下一位读者挡在门外。达·芬奇的许多笔记用从右往左的镜像字写成，手稿今天仍可辨读。等草图要交给别人时，给一版顺手可读的说明，能省下一次破译。",
      "你的私人速記容易把下一位讀者擋在門外。達文西的許多筆記用從右往左的鏡像字寫成，手稿今天仍可辨讀。等草圖要交給別人時，給一版順手可讀的說明，能省下一次破譯。",
      "Your personal shorthand can lock out the next reader. Leonardo often wrote from right to left in mirror script, as his surviving notebooks show. When it’s time to hand off the sketch, a readable explanation saves everyone else a decoding session.",
    ),
    tags: resultCopy(["镜像笔记", "画图解题", "跨界手稿"], ["鏡像筆記", "畫圖解題", "跨界手稿"], ["MirrorScript", "SketchIt", "CrossField"]),
    personality_benchmark: {
      inferred_mbti: "INTP", title: resultCopy("跨界拆解者", "跨界拆解者", "The Systems Sketcher"), tendencies: [69, 89, 76, 78],
      big_five_traits: resultCopy(["高开放性"], ["高開放性"], ["High openness"]),
    },
    era: resultCopy("欧洲 · 文艺复兴", "歐洲 · 文藝復興", "Europe · Renaissance"),
    years: [1452, 1519],
    source: "https://searcharchives.bl.uk/catalog/040-002039546",
    accent: "#e5c47b",
  },
  "galileo-galilei": {
    archetype_title: resultCopy("把木星搬上证人席", "把木星搬上證人席", "Jupiter Takes the Stand"),
    one_line_hook: resultCopy("理论争到第三轮，你干脆把望远镜递过去。", "理論爭到第三輪，你乾脆把望遠鏡遞過去。", "Three rounds into the argument, you hand them the telescope."),
    superpower: resultCopy(
      "你擅长把一场立场之争变成能反复查看的对象。伽利略连续观测木星附近光点的位置，辨认出四颗卫星。你遇到难题会留下连续记录，让讨论从谁说得响回到证据怎样变化。",
      "你擅長把一場立場之爭變成可以反覆查看的對象。伽利略連續觀測木星附近光點的位置，辨認出四顆衛星。你遇到難題會留下連續紀錄，讓討論從誰說得響回到證據如何變化。",
      "You give a stalled argument something everyone can look at. By tracking the changing positions of lights near Jupiter, Galileo identified four moons. You keep the sequence so people can follow the evidence instead of voting on the best speech.",
    ),
    quirk_or_blindspot: resultCopy(
      "你想让发现活得更久，也会主动替它找听众。伽利略设想用木星卫星计时，把表格和望远镜推介给不同政权。把说服材料写漂亮之后，最好留一份能独立核验的记录。",
      "你想讓發現活得更久，也會主動替它找聽眾。伽利略設想用木星衛星計時，把表格和望遠鏡推介給不同政權。把說服材料寫漂亮之後，最好留一份能獨立查證的紀錄。",
      "You’re willing to pitch a discovery to keep it moving. Galileo offered tables and telescopes to governments as part of his proposal to use Jupiter’s moons for timing. Leave a testable record alongside the pitch, where an independent reader can find it.",
    ),
    tags: resultCopy(["木星卫星", "拿镜来看", "天文时钟"], ["木星衛星", "拿鏡來看", "天文時鐘"], ["JupitersMoons", "LookAgain", "SkyClock"]),
    personality_benchmark: {
      inferred_mbti: "ENTP", title: resultCopy("证据辩手", "證據辯手", "The Evidence Debater"), tendencies: [68, 84, 81, 69],
      big_five_traits: resultCopy(["高开放性", "高尽责性"], ["高開放性", "高盡責性"], ["High openness", "High conscientiousness"]),
    },
    era: resultCopy("欧洲 · 17世纪", "歐洲 · 17世紀", "Europe · 17th century"),
    years: [1564, 1642],
    source: "https://www.museogalileo.it/en/galileo/instruments-en.html",
    accent: "#afcfff",
  },
  "rabindranath-tagore": {
    archetype_title: resultCopy("把教室搬到树荫下的人", "把教室搬到樹蔭下的人", "The Poet Who Took Class Outside"),
    one_line_hook: resultCopy("你看见排得整整齐齐的书桌，只想问今天能不能在树下上课。", "你看見排得整整齊齊的書桌，只想問今天能不能在樹下上課。", "You see the rows of desks and ask what the lesson would sound like under a tree."),
    superpower: resultCopy(
      "你擅长换个场景，让老问题有新答法。泰戈尔经营圣蒂尼克坦的教育实验，把艺术与观察带进学习。对你来说，一堂课卡住时，换一种接触材料的方式可能比再讲一遍更有用。",
      "你擅長換個場景，讓老問題有新答法。泰戈爾經營聖蒂尼克坦的教育實驗，把藝術與觀察帶進學習。對你來說，一堂課卡住時，換一種接觸材料的方式可能比再講一遍更有用。",
      "You know when a lesson needs a change of scene. Tagore’s educational experiment at Santiniketan brought the arts and observation into learning. You’d change how a class encounters its material before repeating the lecture.",
    ),
    quirk_or_blindspot: resultCopy(
      "你搬运一首诗时，会忍不住对它动刀。《吉檀迦利》因泰戈尔自己的英译传播开来，译文也筛选了外语读者先遇到的声音。你替别人介绍一个世界时，最好也留条路让人回去读原作。",
      "你搬運一首詩時，會忍不住對它動刀。《吉檀迦利》經泰戈爾自己的英譯傳播開來，譯文也篩選了外語讀者先遇到的聲音。你替別人介紹一個世界時，最好也留條路讓人回去讀原作。",
      "You can’t carry a poem between languages without making choices. Tagore’s English Gitanjali opened a door to his work. It also shaped what readers heard first. If you introduce a world in translation, leave readers a route back to the original.",
    ),
    cognitive_gift_tag: resultCopy("诗歌转译与跨文化教学", "詩歌轉譯與跨文化教學", "Poetic translation and teaching"),
    tags: resultCopy(["树下上课", "自己译诗", "跨文化写作"], ["樹下上課", "自己譯詩", "跨文化寫作"], ["ClassOutside", "TranslatePoetry", "AcrossCultures"]),
    personality_benchmark: {
      inferred_mbti: "ENFP", title: resultCopy("开放课堂倡议者", "開放課堂倡議者", "The Open-Air Teacher"), tendencies: [71, 84, 77, 69],
      big_five_traits: resultCopy(["高开放性"], ["高開放性"], ["High openness"]),
    },
    era: resultCopy("亚洲 · 近代", "亞洲 · 近代", "Asia · Modern era"),
    years: [1861, 1941],
    source: "https://www.nobelprize.org/prizes/literature/1913/tagore/article/",
    accent: "#f7ca83",
  },
  "wangari-maathai": {
    archetype_title: resultCopy("从一棵树起局的人", "從一棵樹開局的人", "The Organizer Who Started with a Tree"),
    one_line_hook: resultCopy("他们把问题写进厚报告，你先问隔壁谁能来领树苗。", "他們把問題寫進厚厚的報告，你先問隔壁誰能來領樹苗。", "While the report gets thicker, you ask who next door can raise a seedling."),
    superpower: resultCopy(
      "你擅长把遥远的问题拆成邻里能动手的事。马塔伊发起绿带运动，让当地妇女通过育苗和栽树应对环境问题。你在推一个大计划时，也会先找大家今天能一起做的第一步。",
      "你擅長把遙遠的問題拆成街坊能動手的事。馬塔伊發起綠帶運動，讓當地婦女透過育苗和種樹應對環境問題。你在推一個大計畫時，也會先找大家今天能一起做的第一步。",
      "You shrink a problem until neighbors can start on it. Maathai’s Green Belt Movement organized women to raise seedlings and plant trees. When a plan looks too big to move, you look for the first thing a group can do together today.",
    ),
    quirk_or_blindspot: resultCopy(
      "你会从具体工作一路追到制度问题。马塔伊在诺奖演讲中回顾，绿带运动从种树走向社区教育与公民参与。扩大行动范围很有力量，也要给新加入的人说清工作的边界和下一步。",
      "你會從具體工作一路追到制度問題。馬塔伊在諾獎演講中回顧，綠帶運動從種樹走向社區教育與公民參與。擴大行動範圍很有力量，也要跟新加入的人說清工作的界線和下一步。",
      "A practical project can lead you straight into politics. In her Nobel lecture, Maathai described how work on trees grew into civic and community education. As the project widens, tell newcomers where their work begins and what’s changed.",
    ),
    cognitive_gift_tag: resultCopy("社区动员与生态行动设计", "社區動員與生態行動設計", "Community-led ecological action"),
    tags: resultCopy(["一棵起步", "绿色社区", "公民行动"], ["一棵起步", "綠色社區", "公民行動"], ["StartWithATree", "GreenBelt", "CivicAction"]),
    personality_benchmark: {
      inferred_mbti: "ENFJ", title: resultCopy("社区召集人", "社區召集人", "The Community Organizer"), tendencies: [86, 72, 80, 74],
      big_five_traits: resultCopy(["高外倾性", "高尽责性"], ["高外傾性", "高盡責性"], ["High extraversion", "High conscientiousness"]),
    },
    era: resultCopy("非洲 · 20世纪", "非洲 · 20世紀", "Africa · 20th century"),
    years: [1940, 2011],
    source: "https://www.nobelprize.org/prizes/peace/2004/maathai/lecture/",
    accent: "#bce697",
  },
  "napoleon-bonaparte": {
    archetype_title: resultCopy("给全国规则开合并会的人", "替全國規則開整併會的人", "The Man Who Merged the Rulebooks"),
    one_line_hook: resultCopy("同一件事有三份相冲突的规定，你想把它们摆上同一张会议桌。", "同一件事有三份相衝突的規定，你想把它們放到同一張會議桌上。", "Three rulebooks answer the same question differently. You want them on one table."),
    superpower: resultCopy(
      "你擅长揪出系统里彼此冲突的约定。法国民法典编订中，波拿巴和康巴塞雷斯轮流主持国务委员会讨论，审议不同传统的法律。流程打架时，你也会找能共同决策的桌子。",
      "你擅長揪出制度裡彼此衝突的約定。法國民法典編纂時，波拿巴與康巴塞雷斯輪流主持國務委員會討論，審議不同傳統的法律。流程衝突時，你也會找能一起做決定的場合。",
      "You look for rules that collide before trying to simplify them. In drafting the French Civil Code, Bonaparte and Cambacérès chaired Council of State sessions that brought different legal traditions to the same table. You would start by finding a place where competing rules can actually be settled.",
    ),
    quirk_or_blindspot: resultCopy(
      "你很容易把整齐当作公正。法国的编订工作把三十六项法律归到同一部法典。合并成一份手册只说明规则可以放在一起，仍要逐条问它会怎样影响不同处境的人。",
      "你很容易把整齊當作公平。法國的編纂工作把三十六項法律納進同一部法典。整併成一份手冊，只表示規則可以放在一起，還得逐條問它會怎麼影響不同處境的人。",
      "A tidy rulebook can feel fair because it applies everywhere. The French codification brought thirty-six laws into one code. A successful merger still leaves a separate question: what does each rule do to people in different circumstances?",
    ),
    tags: resultCopy(["整合规则", "定稿会议", "制度拼接"], ["整合規則", "定稿會議", "制度拼接"], ["MergeRules", "CouncilSessions", "SystemDesign"]),
    personality_benchmark: {
      inferred_mbti: "ENTJ", title: resultCopy("制度整合者", "制度整合者", "The Rulebook Editor"), tendencies: [75, 66, 83, 86],
      big_five_traits: resultCopy(["高尽责性"], ["高盡責性"], ["High conscientiousness"]),
    },
    era: resultCopy("欧洲 · 19世纪初", "歐洲 · 19世紀初", "Europe · Early 19th century"),
    years: [1769, 1821],
    source: "https://www.assemblee-nationale.fr/dyn/histoire-et-patrimoine/consulat-et-premier-empire/la-codification-juridique",
    portrait: { source: "https://commons.wikimedia.org/wiki/File:Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg", license: "Public domain" },
    accent: "#ffd389",
  },
  "voltaire": {
    archetype_title: resultCopy("把旧判决读到最后一页的人", "把舊判決讀到最後一頁的人", "The Man Who Reopened the File"),
    one_line_hook: resultCopy("大家说案子早结了，你翻回去看他们跳过了哪一页。", "大家說案子早結了，你翻回去看他們跳過了哪一頁。", "They say the case is closed. You go back to the page they skipped."),
    superpower: resultCopy(
      "你能把被说成理所当然的结论重新变成一道问题。伏尔泰以卡拉斯案写《论宽容》，让一个家庭的遭遇进入关于宗教偏见的公开讨论。你也会找一件具体的事，让抽象争论重新落地。",
      "你能把被說成理所當然的結論重新變成一道問題。伏爾泰以卡拉斯案寫《論寬容》，讓一個家庭的遭遇進入關於宗教偏見的公開討論。你也會找一件具體的事，讓抽象爭論重新落地。",
      "You can turn a settled opinion back into a live question. Voltaire took the Calas case into a public argument about religious prejudice in his Treatise on Tolerance. An actual case gives an abstract debate something it has to answer to.",
    ),
    quirk_or_blindspot: resultCopy(
      "你找到一个有说服力的案例，就想拿它照见整个制度。伏尔泰把卡拉斯之死写进一部更广泛的宽容论证。你把个案放大时，最好标明哪些证据支持这宗案件，哪些还能推到别处。",
      "你找到一個有說服力的案例，就想用它照見整個制度。伏爾泰把卡拉斯之死寫進一部更廣泛的寬容論證。把個案放大時，最好標明哪些證據支持這起案件，哪些還能推到別處。",
      "A compelling case makes you want to rewrite the whole argument. Voltaire used Calas’s death to make a much wider case for tolerance. Keep track of which evidence belongs to the specific case and which parts of the argument can travel.",
    ),
    tags: resultCopy(["翻回案卷", "模糊处追问", "公开辩论"], ["翻回案卷", "模糊處追問", "公開辯論"], ["ReopenTheFile", "AskAgain", "PublicArgument"]),
    personality_benchmark: {
      inferred_mbti: "ENTP", title: resultCopy("反质问者", "反質疑者", "The Cross-Examiner"), tendencies: [73, 79, 76, 71],
      big_five_traits: resultCopy(["高开放性"], ["高開放性"], ["High openness"]),
    },
    era: resultCopy("欧洲 · 启蒙时代", "歐洲 · 啟蒙時代", "Europe · Enlightenment"),
    years: [1694, 1778],
    source: "https://catalogue.bnf.fr/ark:/12148/cb31605146b",
    portrait: { source: "https://commons.wikimedia.org/wiki/File:Nicolas_de_Largilli%C3%A8re_-_Portrait_de_Voltaire_(1694-1778)_en_1718_-_P208_-_mus%C3%A9e_Carnavalet_-_5_(cropped).jpg", license: "CC0" },
    accent: "#ffd786",
  },
  "blaise-pascal": {
    archetype_title: resultCopy("把一道争论带上山的人", "把一道爭論帶上山的人", "The Logician Who Took It Uphill"),
    one_line_hook: resultCopy("屋里争不出结果，你已经开始想该去山上量什么。", "屋裡爭不出結果，你已經開始想該去山上量什麼。", "The room can’t settle a question. You’re already thinking about what to measure uphill."),
    superpower: resultCopy(
      "你能给抽象争论找一个会变化的读数。帕斯卡提出比较山脚与山顶的水银柱高度，请佩里耶执行。碰到两套说法都讲得通时，你会找一个条件，让它们做出不同预测。",
      "你能替抽象爭論找出一個會變動的讀數。帕斯卡提出比較山腳和山頂的水銀柱高度，請佩里耶執行。碰到兩套說法都講得通時，你會找一個條件，讓兩者做出不同的預測。",
      "You can give an abstract dispute a reading that changes. Pascal proposed comparing mercury levels uphill and downhill and asked Périer to carry it out. When two explanations both sound good, you look for a condition under which they predict different results.",
    ),
    quirk_or_blindspot: resultCopy(
      "你会把检验写到自己看完就懂。多姆山实验要由佩里耶照指示测量，再把结果写信回报。写完一份漂亮的方案，你要确认现场的人能做出同样记录，意外也有地方写下。",
      "你會把檢驗寫到自己看得懂為止。多姆山實驗由佩里耶依指示測量，再寫信回報結果。寫完一份漂亮的方案，你得確認現場的人能記下同樣的資料，意外也有地方寫下來。",
      "Your instructions can feel complete because you already know the intended test. Périer had to make the measurements and report back from the Puy de Dôme. Make room for the observations you didn’t tell the person on site to expect.",
    ),
    tags: resultCopy(["山顶对照", "检验假设", "实验通信"], ["山頂對照", "檢驗假設", "實驗通信"], ["TestUphill", "CompareReadings", "ExperimentalLetters"]),
    personality_benchmark: {
      inferred_mbti: "INTP", title: resultCopy("关键实验设计者", "關鍵實驗設計者", "The Decisive-Test Designer"), tendencies: [68, 82, 81, 65],
      big_five_traits: resultCopy(["高开放性", "高尽责性"], ["高開放性", "高盡責性"], ["High openness", "High conscientiousness"]),
    },
    era: resultCopy("欧洲 · 17世纪", "歐洲 · 17世紀", "Europe · 17th century"),
    years: [1623, 1662],
    source: "https://puydesciences.uca.fr/le-media/articles/portraits/blaise-pascal-le-genie-intranquille",
    portrait: { source: "https://commons.wikimedia.org/wiki/File:Blaise_Pascal_Versailles.JPG", license: "Public domain" },
    accent: "#cce8f0",
  },
  "michelangelo": {
    archetype_title: resultCopy("把项目画到能落刀的人", "把計畫畫到能下刀的人", "The Sculptor Who Draws the Build"),
    one_line_hook: resultCopy("还没动第一块石头，你已经在图上安排每一层的视线。", "還沒動第一塊石頭，你已經在圖上安排每一層的視線。", "The stone hasn’t arrived, and you’re already testing every sightline on paper."),
    superpower: resultCopy("你会先把远大的想法画成可讨论的结构。米开朗琪罗留给尤利乌斯二世陵墓的设计把人物放进一整套建筑框架。你也会拿图去谈规模和取舍，让合作方看见要做成什么。", "你會先把遠大的想法畫成可以討論的結構。米開朗基羅為尤利烏斯二世陵墓留下的設計，把人物放進一整套建築框架。你也會拿圖去談規模和取捨，讓合作方看見要做成什麼。", "You give a huge idea a structure people can discuss. Michelangelo’s drawings for Julius II’s tomb place figures within an architectural framework. A drawing gives everyone a tangible scale to negotiate."),
    quirk_or_blindspot: resultCopy("你容易对最宏大的那版方案放不下。陵墓工程几度调整，最后安置的是规模缩小的版本。给创作保留大胆的第一稿，也尽早标出哪些部分能缩减，免得变化一来就得全盘重画。", "你容易放不下最宏大的那版方案。陵墓工程數度調整，最後安置的是規模縮小的版本。替創作保留大膽的第一稿，也提早標出哪些部分能縮減，免得一有變化就得整份重畫。", "You can get attached to a grand first design. The tomb was revised repeatedly, and a much smaller version was eventually installed. Keep the ambitious sketch and identify which parts can shrink without losing the idea."),
    tags: resultCopy(["先画结构", "石材思维", "大稿改小"], ["先畫結構", "石材思維", "大稿改小"], ["DrawTheBuild", "Stone", "ScaleItDown"]),
    personality_benchmark: { inferred_mbti: "ISFP", title: resultCopy("造型构想者","造型構想者","The Form-Maker"), tendencies: [73,82,64,73], big_five_traits: resultCopy(["高开放性"],["高開放性"],["High openness"]) },
    era: resultCopy("欧洲 · 文艺复兴", "歐洲 · 文藝復興", "Europe · Renaissance"),
    years: [1475, 1564],
    source: "https://www.metmuseum.org/art/collection/search/334655",
    accent: "#eec995",
  },
  "johannes-kepler": {
    archetype_title: resultCopy("容不下八角分的人", "容不下八角分的人", "The Man Who Wouldn’t Round Away Eight Minutes"),
    one_line_hook: resultCopy("别人准备四舍五入，你想知道偏差为什么每次都在那里。", "別人準備四捨五入，你想知道偏差為什麼每次都在那裡。", "Everyone else reaches for rounding. You want to know why the error keeps showing up."),
    superpower: resultCopy("你会把小偏差当成模型需要回答的问题。开普勒用第谷的火星观测检验轨道，重做原先的圆形假定。你碰上重复出现的残差时，也会问它是误差，还是在提示整个框架有问题。", "你會把小偏差當成模型需要回答的問題。克卜勒用第谷的火星觀測檢驗軌道，重做原先的圓形假定。你碰上重複出現的殘差時，也會問它是誤差，還是在提醒整個框架有問題。", "You ask a model to explain its small, stubborn misses. Kepler tested Mars’s orbit against Tycho’s observations and abandoned circular orbits. A repeatable error is worth checking before you dismiss it as noise."),
    quirk_or_blindspot: resultCopy("你能为一个数字追很久。《新天文学》把八角分的偏差写进改模型的理由。碰上日常项目，要先约定什么误差值得追、什么会改变结论，这样每个小偏差才不会拖住整支队伍。", "你能為一個數字追很久。《新天文學》把八角分的偏差寫進改模型的理由。碰上日常專案，要先約定什麼誤差值得追、什麼會改變結論，這樣每個小偏差才不會拖住整個團隊。", "You can spend a long time with one number. In Astronomia Nova, eight arcminutes mattered enough to revisit the model. In team work, agree in advance on which discrepancies would change the decision."),
    tags: resultCopy(["火星残差", "八角分", "轨道换形"], ["火星殘差", "八角分", "軌道換形"], ["MarsResidual", "EightArcminutes", "NewOrbit"]),
    personality_benchmark: { inferred_mbti: "INTJ", title: resultCopy("模型检验者","模型檢驗者","The Model Tester"), tendencies: [76,82,87,78], big_five_traits: resultCopy(["高尽责性","高开放性"],["高盡責性","高開放性"],["High conscientiousness","High openness"]) },
    era: resultCopy("欧洲 · 17世纪", "歐洲 · 17世紀", "Europe · 17th century"),
    years: [1571, 1630],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Kepler/quotations/",
    accent: "#c3d9fa",
  },
  "nicolaus-copernicus": {
    archetype_title: resultCopy("先把观察台挪走的人", "先把觀測臺搬走的人", "The Astronomer Who Moved the Viewpoint"),
    one_line_hook: resultCopy("模型越修越复杂，你开始怀疑是自己站的位置不对。", "模型越修越複雜，你開始懷疑是自己站的位置不對。", "The model keeps getting patched. You start wondering where the observer is standing."),
    superpower: resultCopy("你擅长重新摆放观察者的位置。《天体运行论》把地球放进运动的行星体系，从而改写天体图示。你梳理复杂流程时，也会试着换一个观察点，看原来各自解释的现象能不能连起来。", "你擅長重新擺放觀察者的位置。《天體運行論》把地球放進運動的行星體系，從而改寫天體圖示。你梳理複雜流程時，也會試著換一個觀察點，看原先分開解釋的現象能不能連起來。", "You try moving the observer before adding another rule. De revolutionibus put Earth among the moving planets. Shift the vantage point on a difficult problem and some of the separate explanations may come together."),
    quirk_or_blindspot: resultCopy("你写完模型，却未必控制读者怎样看它。首版印入奥西安德匿名写的序言，用数学假设来介绍这套观点。交出新模型前，要告诉接手的人你主张了什么，以及哪些部分还在检验。", "你寫完模型，卻未必能控制讀者怎麼理解它。首版印入奧西安德匿名寫的序言，用數學假設介紹這套觀點。交出新模型前，要讓接手的人知道你主張什麼，以及哪些部分還在檢驗。", "Once a model leaves your desk, someone else can frame it. Osiander’s anonymous preface to the first edition introduced the approach as a mathematical hypothesis. Tell readers which claims you’re making and what still needs testing."),
    tags: resultCopy(["移动原点", "换观察位", "匿名序言"], ["移動原點", "換觀察位", "匿名序言"], ["MoveTheView", "NewCenter", "ThePreface"]),
    personality_benchmark: { inferred_mbti: "INTJ", title: resultCopy("视角重构者","視角重構者","The Frame Changer"), tendencies: [77,88,82,78], big_five_traits: resultCopy(["高开放性"],["高開放性"],["High openness"]) },
    era: resultCopy("欧洲 · 16世纪", "歐洲 · 16世紀", "Europe · 16th century"),
    years: [1473, 1543],
    source: "https://tile.loc.gov/storage-services/master/gdc/gdcebookspublic/20/20/71/53/16/2020715316/2020715316.pdf",
    accent: "#c5e6ae",
  },
  "wolfgang-amadeus-mozart": {
    archetype_title: resultCopy("给灵感建索引的人", "替靈感建立索引的人", "The Composer with an Index"),
    one_line_hook: resultCopy("你的一次灵感，过了几年还能从本子里捞回来。", "你的一次靈感，過了幾年還能從本子裡撈回來。", "Years later, you can still find the tune you wrote on a busy Tuesday."),
    superpower: resultCopy("你擅长把转瞬即逝的作品变成日后找得到的材料。莫扎特曾亲手为自己的作品写目录，保留可辨识的题名和开头主题。你忙起来也会给成果留下入口，让下一次创作有所凭借。", "你擅長把轉瞬即逝的作品變成日後找得到的材料。莫札特曾親手替自己的作品寫目錄，留下可辨識的題名和開頭主題。你忙起來也會給成果留個入口，讓下一次創作有所憑藉。", "You make fleeting work findable. Mozart kept a handwritten catalogue of his compositions, identifying pieces with titles and musical beginnings. A good index lets a later project pick up an earlier idea."),
    quirk_or_blindspot: resultCopy("你怕忘，可能就会把选材时间都用来整理。莫扎特留下的这份手写目录从一七八四年起记录作品，也有明确的起点。你也可以决定哪些东西值得编目，哪些小片段听过就够了。", "你怕忘，可能就會把選材時間都用來整理。莫札特留下的這份手寫目錄從一七八四年起記錄作品，也有明確的起點。你也可以決定哪些東西值得編目，哪些小片段聽過就夠了。", "Fear of losing an idea can send you into catalogue mode. Mozart’s own surviving thematic catalogue starts in 1784 and has a defined scope. Decide which fragments need an index and which ones can pass without an entry."),
    tags: resultCopy(["主题索引", "手写目录", "可找回的旋律"], ["主題索引", "手寫目錄", "找得回的旋律"], ["ThemeIndex", "Handwritten", "FindTheTune"]),
    personality_benchmark: { inferred_mbti: "ENFP", title: resultCopy("旋律采集者","旋律採集者","The Melody Collector"), tendencies: [65,85,74,68], big_five_traits: resultCopy(["高开放性"],["高開放性"],["High openness"]) },
    era: resultCopy("欧洲 · 18世纪", "歐洲 · 18世紀", "Europe · 18th century"),
    years: [1756, 1791],
    source: "https://searcharchives.bl.uk/catalog/040-001945812",
    accent: "#f5c3d5",
  },
  "ludwig-van-beethoven": {
    archetype_title: resultCopy("把没说的话写下来的人", "把沒說的話寫下來的人", "The Composer of the Unsent Letter"),
    one_line_hook: resultCopy("有些话堵在嘴边，你会先把它们认真写完。", "有些話卡在嘴邊，你會先把它們好好寫完。", "When words won’t come out in a room, you give them a whole page."),
    superpower: resultCopy("你擅长把难以开口的经历写成能反复读懂的文字。贝多芬在海利根施塔特写给兄弟的信中说明听力衰退怎样影响他的交往。你遇到卡住的对话，也会用书写把立场和处境理出来。", "你擅長把難以開口的經歷寫成能反覆讀懂的文字。貝多芬在海利根施塔特寫給兄弟的信中說明聽力衰退如何影響他的交往。你碰到卡住的對話，也會用書寫把立場和處境理清楚。", "You can make a blocked conversation legible on paper. In his Heiligenstadt letter to his brothers, Beethoven explained how hearing loss affected his social life. Writing gives you time to put the circumstances into words."),
    quirk_or_blindspot: resultCopy("你把最难讲的那句写得很清楚，却还可能把纸留在抽屉里。那封后来被称作《海利根施塔特遗书》的信并未寄出。整理完思路，也要决定哪一句值得让那个当事人真正收到。", "你把最難講的那句寫得很清楚，卻還可能把紙留在抽屜裡。那封後來被稱為《海利根施塔特遺書》的信並未寄出。整理完思路，也要決定哪一句值得讓當事人真正收到。", "You can finish the hardest sentence and still leave it in a drawer. The letter now known as the Heiligenstadt Testament went unsent. After you sort out what you mean, decide what the other person actually needs to hear."),
    tags: resultCopy(["未寄出的信", "落笔再说", "听觉处境"], ["未寄出的信", "落筆再說", "聽覺處境"], ["UnsentLetter", "WriteItOut", "Heiligenstadt"]),
    personality_benchmark: { inferred_mbti: "INFP", title: resultCopy("私语写作者","私語寫作者","The Private Writer"), tendencies: [77,71,77,65], big_five_traits: resultCopy(["高开放性"],["高開放性"],["High openness"]) },
    era: resultCopy("欧洲 · 19世纪初", "歐洲 · 19世紀初", "Europe · Early 19th century"),
    years: [1770, 1827],
    source: "https://www.beethoven.de/en/glossar/view/6642245373526016/Heard%2Bwith%2BBeethoven%26%2339%3Bs%2Bear",
    accent: "#e8c2ab",
  },
  "benjamin-franklin": {
    archetype_title: resultCopy("把自律写进格子的人", "把自律寫進格子的人", "The Man Who Put Habits on a Grid"),
    one_line_hook: resultCopy("别人喊着要改掉所有习惯，你先给这周选了一个。", "別人喊著要改掉所有習慣，你先替這週選了一個。", "Everyone wants to change everything. You pick one habit for the week."),
    superpower: resultCopy("你擅长把理想拆成可以每天复盘的动作。富兰克林在自传里回顾自己的十三项品行计划，打算逐项训练。你面对大目标时先定一个小习惯，观察它有没有真的发生，再加下一项。", "你擅長把理想拆成每天能回顧的動作。富蘭克林在自傳裡回顧自己的十三項品行計畫，打算逐項練習。你面對大目標時先定一個小習慣，看看它有沒有真的發生，再加下一項。", "You make an ideal small enough to check at the end of the day. In his autobiography, Franklin laid out thirteen virtues and planned to practice them one at a time. A habit you can observe gives you more to work with than a sweeping promise."),
    quirk_or_blindspot: resultCopy("你可能忍不住给自己开一份日常评分表。富兰克林用小本子标记各项品行上的过失。打勾能提醒你复盘，还要写下为什么做不到，免得把一周的变化缩成一列好看或难看的记号。", "你可能忍不住替自己做一份日常評分表。富蘭克林用小本子標記各項品行上的過失。打勾能提醒你回顧，還要寫下為什麼做不到，免得把一週的變化縮成一欄好看或難看的記號。", "You can turn the day into a scorecard. Franklin marked faults against particular virtues in a little book. A checkmark is useful if it sends you back to the reason a habit failed, which is what you can change next week."),
    tags: resultCopy(["一周一项", "习惯格子", "自传复盘"], ["一週一項", "習慣格子", "自傳回顧"], ["OneHabit", "TheVirtueGrid", "CheckTheWhy"]),
    personality_benchmark: { inferred_mbti: "ENTJ", title: resultCopy("习惯实验者","習慣實驗者","The Habit Tinkerer"), tendencies: [69,73,82,87], big_five_traits: resultCopy(["高尽责性"],["高盡責性"],["High conscientiousness"]) },
    era: resultCopy("美洲 · 18世纪", "美洲 · 18世紀", "Americas · 18th century"),
    years: [1706, 1790],
    source: "https://www.loc.gov/resource/gdcmassbookdig.autobiographyofb02fran/?sp=96&st=gallery",
    accent: "#f5d29d",
  },
  "miguel-de-cervantes": {
    archetype_title: resultCopy("亲自给主角改路线的人", "親自替主角改路線的人", "The Novelist Who Changed the Route"),
    one_line_hook: resultCopy("别人替你写了续集，你让主角读完它，再改自己的行程。", "別人替你寫了續集，你讓主角讀完它，再改自己的行程。", "Someone wrote your sequel. You let your hero read it and change the itinerary."),
    superpower: resultCopy("你擅长把闯进计划的干扰变成作品素材。塞万提斯让堂吉诃德在书中遇见他人写的续篇，随后改道，避开对方给他安排的萨拉戈萨。你会把竞争叙事也写进自己的故事。", "你擅長把闖進計畫的干擾變成作品素材。塞萬提斯讓唐吉訶德在書中遇見他人寫的續篇，隨後改道，避開對方替他安排的薩拉戈薩。你會把競爭敘事也寫進自己的故事。", "You turn interference into material. Cervantes has Don Quixote encounter a rival sequel inside the novel and change course to avoid Zaragoza. If another story takes over the conversation, you can give it a part in your own."),
    quirk_or_blindspot: resultCopy("你太擅长回应异议，路线也可能被异议牵着走。堂吉诃德在读到别人给自己编的故事后，决定不去萨拉戈萨。改道之后，最好还能说出目的地为什么值得去，别只说原先那里不能去。", "你太擅長回應異議，路線也可能被異議牽著走。唐吉訶德讀到別人替自己編的故事後，決定不去薩拉戈薩。改道之後，最好還能說出目的地為什麼值得去，不能只說原先那裡不能去。", "You’re good at responding, which means a rival can still set your route. Don Quixote refuses to enter Zaragoza after seeing a different account of his own adventures. If you change course, give the new destination a reason of its own."),
    tags: resultCopy(["反写续篇", "角色改道", "书里读书"], ["反寫續篇", "角色改道", "書裡讀書"], ["RewriteTheSequel", "Detour", "BookWithinABook"]),
    personality_benchmark: { inferred_mbti: "ENTP", title: resultCopy("叙事改道者", "敘事改道者", "The Plot Re-router"), tendencies: [66,85,72,79], big_five_traits: resultCopy(["高开放性"],["高開放性"],["High openness"]) },
    era: resultCopy("欧洲 · 17世纪", "歐洲 · 17世紀", "Europe · 17th century"),
    years: [1547, 1616],
    source: "https://www.cervantesvirtual.com/obra-visor/cervantes-y-don-quijote-0/html/ffcf21ae-82b1-11df-acc7-002185ce6064_1.html",
    accent: "#ecd497",
  },
  "gottfried-wilhelm-leibniz": {
    archetype_title: resultCopy("把乘法塞进齿轮的人", "把乘法塞進齒輪的人", "The Man Who Put Arithmetic in Gears"),
    one_line_hook: resultCopy("同一笔账总有人算错，你开始想进位能不能由机器接手。", "同一筆帳總有人算錯，你開始想進位能不能交給機器。", "People keep making the same arithmetic mistake. You start looking for a mechanical way to carry the one."),
    superpower: resultCopy("你擅长把重复计算拆成机械能做的动作。莱布尼茨用阶梯滚筒把数值和重复操作联系起来，发展四则运算机器。你见到总靠人记住的流程，也会先找哪一步适合交给机构。", "你擅長把重複計算拆成機件能做的動作。萊布尼茲用階梯滾筒把數值和重複操作連起來，發展四則運算機器。你遇到總靠人記住的流程，也會先找哪一步適合交給機件。", "You break repetitive work into operations a machine can perform. Leibniz used the stepped drum to develop a device for the basic operations of arithmetic. You look for the step people keep doing by hand and ask how it could be built in."),
    quirk_or_blindspot: resultCopy("你会先展示机构能做到什么，再回头处理那些细小的失败。莱布尼茨在皇家学会展示的早期计算机尚未完成。给原型加一张失败清单，别人就知道演示到哪里、验证又到哪里。", "你會先展示機件能做什麼，再回頭處理那些細小的失敗。萊布尼茲在皇家學會展示的早期計算機尚未完成。替原型加一張失敗清單，別人就知道展示到哪裡、驗證又到哪裡。", "You can be ready to demonstrate an idea before all its limits are clear. The early calculator Leibniz showed the Royal Society was unfinished. A list of known failures helps people tell which parts of a prototype have actually been tested."),
    tags: resultCopy(["四则入机", "阶梯滚筒", "原型先看"], ["四則入機", "階梯滾筒", "原型先看"], ["ArithmeticalMachine", "SteppedDrum", "EarlyPrototype"]),
    personality_benchmark: { inferred_mbti: "ENTP", title: resultCopy("机械抽象者","機械抽象者","The Mechanism Builder"), tendencies: [64,89,82,69], big_five_traits: resultCopy(["高开放性"],["高開放性"],["High openness"]) },
    era: resultCopy("欧洲 · 17世纪", "歐洲 · 17世紀", "Europe · 17th century"),
    years: [1646, 1716],
    source: "https://www.cambridge.org/core/journals/think/article/leibniz-and-the-mechanization-of-thought/FE77EDD8FCACDB496EAD87A683690083",
    accent: "#d8d2f3",
  },
  "simon-bolivar": {
    archetype_title: resultCopy("写给岛外听众的那封信", "寫給島外讀者的那封信", "The Letter Beyond the Island"),
    one_line_hook: resultCopy("形势坏到只能离开了，你还在想怎样让陌生人理解这件事。", "局勢壞到只能離開了，你還在想怎樣讓陌生人理解這件事。", "Even in exile, you’re thinking about how to explain the stakes to someone new."),
    superpower: resultCopy("你擅长把一场复杂变动讲给局外人听。玻利瓦尔在牙买加写信说明西属美洲局势和独立前景，最初的读者是当地的一名英国人。你判断怎样写，先看对方对背景知道多少。", "你擅長把一場複雜變動講給局外人聽。玻利瓦在牙買加寫信說明西屬美洲局勢和獨立前景，最初的讀者是當地一名英國人。你判斷怎麼寫，會先看對方對背景了解多少。", "You can explain a complicated political situation to an outsider. Bolívar’s Jamaica Letter set out what was happening in Spanish America for a British reader in Jamaica. Start by asking how much of the background the reader already knows."),
    quirk_or_blindspot: resultCopy("你容易把统领全局的愿景讲得太顺。牙买加书信一度通过英语译本传播，有不止一种留存文本。当你的立场要经过翻译、转述和数次传递时，给读者留能核对的原始版本。", "你容易把統領全局的願景講得太順。牙買加書信曾以英譯本傳播，留下不只一種文本。當你的立場要經過翻譯、轉述和數次傳遞時，給讀者留一份能核對的原始版本。", "A clear vision can travel so well that people stop checking the wording. The Jamaica Letter circulated in English translation, and more than one manuscript version survives. Leave readers an original they can check when an argument crosses languages."),
    tags: resultCopy(["牙买加书信", "写给局外人", "跨语传播"], ["牙買加書信", "寫給局外人", "跨語傳播"], ["JamaicaLetter", "ExplainTheStakes", "AcrossLanguages"]),
    personality_benchmark: { inferred_mbti: "ENFJ", title: resultCopy("愿景阐述者","願景闡述者","The Public Advocate"), tendencies: [77,82,70,76], big_five_traits: resultCopy(["高开放性"],["高開放性"],["High openness"]) },
    era: resultCopy("美洲 · 19世纪", "美洲 · 19世紀", "Americas · 19th century"),
    years: [1783, 1830],
    source: "https://www.archivogeneral.gov.co/la-unesco-entrego-colombia-el-certificado-de-inscripcion-de-la-carta-de-jamaica",
    accent: "#f5ce86",
  },
  "gilbert-burnet": {
    archetype_title: resultCopy("两次把任命退回桌上的人", "兩次把任命退回桌上的人", "The Historian Who Turned Down the Post Twice"),
    one_line_hook: resultCopy("机会摆在面前，你第一句问自己能不能担起它。", "機會擺在面前，你第一句問自己能不能扛起責任。", "The offer is on the table. You ask what it would take to do the job properly."),
    superpower: resultCopy(
      "你会先估算责任，再决定接不接。伯内特十八岁被提议担任教职，以太年轻为由谢绝，翌年再次谢绝。工作上遇到头衔比职责先到的机会，你也会把要承担的事逐一问清。",
      "你會先衡量責任，再決定接不接。伯內特十八歲獲提議擔任教職，以太年輕為由婉拒，隔年又拒絕一次。工作上碰到頭銜比職責先到的機會，你也會把要扛的事一項項問清楚。",
      "You size up the responsibility before accepting a title. Burnet declined a church appointment at eighteen because he considered himself too young, then turned down another offer the next year. Ask what the work entails before deciding whether you want the title.",
    ),
    quirk_or_blindspot: resultCopy(
      "你对准备的标准可能来自别人。伯内特童年受父亲严格督学，传记记载他清晨四点就得起来读书。勤奋有用，但当你把这套作息搬进自己带的团队，先问清哪些约束真有必要。",
      "你對準備的標準可能是別人訂的。伯內特童年由父親嚴格督學，傳記記載他清早四點就得起來讀書。勤奮有用，但把這套作息帶進自己帶的團隊前，先問清楚哪些約束真的必要。",
      "Your standards for being prepared might come from someone else. Burnet’s father supervised a demanding education and made him begin studying at four in the morning. Decide which constraints serve the work before asking the rest of a team to follow them.",
    ),
    tags: resultCopy(["先问职责", "清晨研读", "史料上桌"], ["先問職責", "清晨研讀", "史料上桌"], ["ReadTheRole", "EarlyStudy", "HistoricalSources"]),
    personality_benchmark: {
      inferred_mbti: "ISTJ", title: resultCopy("责任核验者", "責任查核者", "The Duty Checker"), tendencies: [64, 70, 74, 80],
      big_five_traits: resultCopy(["高尽责性"], ["高盡責性"], ["High conscientiousness"]),
    },
    era: resultCopy("欧洲 · 17世纪", "歐洲 · 17世紀", "Europe · 17th century"),
    years: [1643, 1715],
    source: "https://gwern.net/doc/iq/high/1926-cox-theearlymentaltraitsof300geniuses.pdf#page=506",
    portrait: { source: "https://commons.wikimedia.org/wiki/File:Gilbert_Burnet_by_John_Riley.jpg", license: "Public domain" },
    accent: "#e9ce9b",
  },
} satisfies Record<string, Editorial>;
