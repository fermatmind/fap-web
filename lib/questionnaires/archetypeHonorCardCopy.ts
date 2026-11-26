import type { DisplayLocale } from "@/lib/i18n/locales";

export type ArchetypeHonorCopy = {
  personalityTags: readonly [string, string, string];
  soulVerdict: string;
};

type HonorCopyTable = Readonly<Record<string, Readonly<Record<string, Record<DisplayLocale, ArchetypeHonorCopy>>>>>;

// Editorial copy for the honor card only, keyed by questionnaire and existing result identity.
export const archetypeHonorCardCopy: HonorCopyTable = {
  "cyberpunk-edgerunners": {
    "david": {
      "zh": { personalityTags: ["热血开路者", "敢闯敢试", "直觉果决"], soulVerdict: "你会被值得一试的方向点燃，宁愿亲手开个头，也不想一直坐在场边。" },
      "zh-TW": { personalityTags: ["熱血開路者", "敢衝敢試", "果斷直覺"], soulVerdict: "你碰到值得一試的方向就容易熱起來，寧可自己打頭陣，也不想坐在場邊。" },
      "en": { personalityTags: ["Bold Starter", "High-Voltage", "Gutsy"], soulVerdict: "You'd rather light the first spark yourself than watch from the sidelines." },
    },
    "lucy": {
      "zh": { personalityTags: ["冷静自主", "神秘感", "边界清晰"], soulVerdict: "你可以和别人并肩走一程，但心里那张地图，始终留给自己来画。" },
      "zh-TW": { personalityTags: ["冷靜自主", "神秘感", "邊界清晰"], soulVerdict: "你可以和別人並肩走一程，但心裡那張地圖，始終留給自己來畫。" },
      "en": { personalityTags: ["Self-Directed", "Quietly Guarded", "Clear-Boundaried"], soulVerdict: "You can share the road and still keep the map to your own destination." },
    },
    "rebecca": {
      "zh": { personalityTags: ["坦率热烈", "直球派", "仗义心"], soulVerdict: "你在意一个人时常把话说得很直，怕的是那份关心没能真的传到。" },
      "zh-TW": { personalityTags: ["坦率熱烈", "直球派", "仗義心"], soulVerdict: "你在意一個人時常把話說得很直，怕的是那份關心沒能真的傳到。" },
      "en": { personalityTags: ["Plainspoken", "Fierce Warmth", "Bighearted"], soulVerdict: "When you care, you make it unmistakable and close enough for someone to accept." },
    },
    "maine": {
      "zh": { personalityTags: ["稳场担当", "带队气场", "务实可靠"], soulVerdict: "你更像先把方向讲清的人，也会回头看看大家能不能一起跟上。" },
      "zh-TW": { personalityTags: ["穩場擔當", "帶隊氣場", "務實可靠"], soulVerdict: "你更像先把方向講清的人，也會回頭看看大家能不能一起跟得上。" },
      "en": { personalityTags: ["Crew Anchor", "Steady Presence", "Practical Ally"], soulVerdict: "You like a clear heading for the crew and make sure nobody loses the thread." },
    },
    "kiwi": {
      "zh": { personalityTags: ["冷静敏锐", "求证派", "谨慎寡言"], soulVerdict: "你更愿意留一句还不知道，也不急着把听来的猜测当成可靠消息。" },
      "zh-TW": { personalityTags: ["冷靜敏銳", "求證派", "謹慎寡言"], soulVerdict: "你更願意留一句還不知道，也不急著把聽來的猜測當成可靠訊息。" },
      "en": { personalityTags: ["Sharp-Eyed", "Measured", "Evidence-Minded"], soulVerdict: "You'd leave a question open before turning someone's guess into a solid fact." },
    },
    "falco": {
      "zh": { personalityTags: ["沉着可靠", "后援气场", "善于收尾"], soulVerdict: "你更在意故事散场以后，每个人还有没有一条找得到的路回家。" },
      "zh-TW": { personalityTags: ["沉著可靠", "後援氣場", "善於收尾"], soulVerdict: "你更在意故事散場以後，每個人還有沒有一條找得到的路回家。" },
      "en": { personalityTags: ["Steady Backup", "Unflappable", "Dependable"], soulVerdict: "When the scene winds down, you're still thinking about who has a way home." },
    },
    "faraday": {
      "zh": { personalityTags: ["条理清醒", "现实感", "善看筹码"], soulVerdict: "你谈合作时偏爱把条件摆到桌面上，心里大致知道各方在意什么。" },
      "zh-TW": { personalityTags: ["條理清醒", "現實感", "善看籌碼"], soulVerdict: "你談合作時偏愛把條件擺到桌面上，心裡大致知道各方在意什麼。" },
      "en": { personalityTags: ["Terms-Minded", "Strategic", "Pragmatic"], soulVerdict: "You prefer your terms in daylight, where everyone can see what matters to whom." },
    },
  },
  "bleach": {
    "ichigo-kurosaki": {
      "zh": { personalityTags: ["热心有界", "挺身派", "坦率担当"], soulVerdict: "你愿意在关键时刻搭把手，也更在意这份帮忙是自己真心答应的。" },
      "zh-TW": { personalityTags: ["熱心有界", "行動派", "坦率擔當"], soulVerdict: "你願意在關鍵時刻搭把手，也更在意這份幫忙是自己真心答應的。" },
      "en": { personalityTags: ["Protective", "Direct", "Boundaried"], soulVerdict: "You'd step in when it matters and still want the help to be yours to offer." },
    },
    "rukia-kuchiki": {
      "zh": { personalityTags: ["清爽利落", "讲理派", "细致耐心"], soulVerdict: "你偏爱把复杂的事讲得顺手，让人听完心里有数，自己也做得来。" },
      "zh-TW": { personalityTags: ["清爽利落", "講理派", "細緻耐心"], soulVerdict: "你偏愛把複雜的事講得順手，讓人聽完心裡有底，自己也做得來。" },
      "en": { personalityTags: ["Clearheaded", "Patient", "Plainspoken"], soulVerdict: "You enjoy explaining things in a way that leaves someone ready to try alone." },
    },
    "sosuke-aizen": {
      "zh": { personalityTags: ["冷静审视", "框架意识", "思路深"], soulVerdict: "你看见一套说法时喜欢往里多看一层，尤其留意它从哪儿开始。" },
      "zh-TW": { personalityTags: ["冷靜審視", "框架意識", "思路深"], soulVerdict: "你看見一套說法時喜歡往裡多看一層，尤其留意它從哪裡開始。" },
      "en": { personalityTags: ["Analytical", "Frame-Aware", "Coolheaded"], soulVerdict: "You look behind a polished explanation to see the assumption holding it up." },
    },
    "byakuya-kuchiki": {
      "zh": { personalityTags: ["自持克制", "重诺心", "分寸感"], soulVerdict: "你更看重心里认领过的承诺，话也许不多，自己答应什么却很清楚。" },
      "zh-TW": { personalityTags: ["自持克制", "重諾心", "分寸感"], soulVerdict: "你更看重心裡認領過的承諾，話也許不多，自己答應什麼卻很清楚。" },
      "en": { personalityTags: ["Composed", "Principled", "Reserved"], soulVerdict: "You're sparing with promises, and clear about which ones are really yours." },
    },
    "orihime-inoue": {
      "zh": { personalityTags: ["温柔体贴", "包容心", "尊重距离"], soulVerdict: "你关心别人时会给对方留个能摇头的空间，温柔里有一种从容。" },
      "zh-TW": { personalityTags: ["溫柔體貼", "包容心", "分寸感"], soulVerdict: "你關心一個人，也會給對方留個能說不的空間，那份溫柔很有餘裕。" },
      "en": { personalityTags: ["Gentle", "Considerate", "Respectful"], soulVerdict: "Your warmth gives people room to say yes or no without losing your kindness." },
    },
    "kisuke-urahara": {
      "zh": { personalityTags: ["机巧灵活", "试验脑", "松弛气质"], soulVerdict: "你看到棘手问题会先在脑子里搭个小样，觉得可以改才有意思。" },
      "zh-TW": { personalityTags: ["機巧靈活", "試驗腦", "鬆弛氣質"], soulVerdict: "你看到棘手問題會先在腦子裡搭個雛形，覺得可以改才有意思。" },
      "en": { personalityTags: ["Inventive", "Resourceful", "Playful Tinkerer"], soulVerdict: "You see a tricky problem and want something you can tinker with on the table." },
    },
    "kenpachi-zaraki": {
      "zh": { personalityTags: ["锋芒感", "挑战派", "直爽果敢"], soulVerdict: "你会被够劲的挑战勾起兴趣，喜欢自己挑战场，也喜欢自己喊停。" },
      "zh-TW": { personalityTags: ["鋒芒感", "挑戰派", "直爽果敢"], soulVerdict: "你會被夠帶勁的挑戰勾起興趣，喜歡自己挑戰場，也喜歡自己喊停。" },
      "en": { personalityTags: ["Bold Challenger", "Blunt", "Spirited"], soulVerdict: "You like a challenge with some bite, especially when the limits are yours." },
    },
  },
  "space-marine-chapter": {
    "ultramarines": {
      "zh": { personalityTags: ["全局感", "条理派", "团队轴心"], soulVerdict: "你在一桌零件面前会先看整体，喜欢大家都听得懂的共同计划。" },
      "zh-TW": { personalityTags: ["全局感", "條理派", "團隊軸心"], soulVerdict: "你在一桌零件面前會先看整體，喜歡大家都聽得懂的共同計畫。" },
      "en": { personalityTags: ["Organized", "Team-Minded", "Coordinated"], soulVerdict: "You see the whole display first and like a plan everyone can actually follow." },
    },
    "imperial-fists": {
      "zh": { personalityTags: ["踏实稳固", "细节控", "耐心派"], soulVerdict: "你最先留意的常是底座稳不稳，别人觉得普通，你却看得见安心。" },
      "zh-TW": { personalityTags: ["踏實穩固", "細節控", "耐心派"], soulVerdict: "你最先留意的常是底座穩不穩，別人覺得普通，你卻看得見安心。" },
      "en": { personalityTags: ["Grounded", "Steady", "Detail-Minded"], soulVerdict: "You're drawn to the sturdy base underneath the part everyone else admires." },
    },
    "iron-hands": {
      "zh": { personalityTags: ["理性工匠", "精修派", "务实心"], soulVerdict: "你对真正让东西好用一点的改变有兴趣，爱看细小调整带来的差别。" },
      "zh-TW": { personalityTags: ["理性工匠", "精修派", "務實心"], soulVerdict: "你對真正讓東西好用一點的改變有興趣，愛看細小調整帶來的差別。" },
      "en": { personalityTags: ["Precision Tinker", "Practical", "Exacting"], soulVerdict: "You get a quiet thrill from one careful tweak that makes the whole piece work." },
    },
    "salamanders": {
      "zh": { personalityTags: ["温厚用心", "手作感", "细腻耐心"], soulVerdict: "你愿意为别人可能都没留意的细节花心思，因为那就是乐趣所在。" },
      "zh-TW": { personalityTags: ["溫厚細心", "手作魂", "耐心派"], soulVerdict: "你願意在別人不一定看得到的細節上多花一點心思，因為那正是手作的樂趣。" },
      "en": { personalityTags: ["Careful Maker", "Warm", "Patient"], soulVerdict: "You'll spend time on an almost invisible detail because that's part of the joy." },
    },
    "raven-guard": {
      "zh": { personalityTags: ["静观派", "眼尖心细", "低调沉着"], soulVerdict: "你往往愿意先安静看一阵，让细微变化自己浮出来，再动手也不迟。" },
      "zh-TW": { personalityTags: ["靜觀派", "眼尖心細", "低調沉著"], soulVerdict: "你往往願意先安靜看一陣，讓細微變化自己浮出來，再動手也不遲。" },
      "en": { personalityTags: ["Quiet Observer", "Sharp-Eyed", "Measured"], soulVerdict: "You let the details come into focus before you touch what is already working." },
    },
    "white-scars": {
      "zh": { personalityTags: ["探索心", "机动派", "不拘常规"], soulVerdict: "你偏爱能绕出去看一眼的路线，发现另一种走法就足够开心。" },
      "zh-TW": { personalityTags: ["探索心", "機動派", "不拘常規"], soulVerdict: "你偏愛能繞出去看一眼的路線，發現另一種走法就足夠開心。" },
      "en": { personalityTags: ["Open-Road Spirit", "Agile", "Adventurous"], soulVerdict: "You're happiest when the map leaves space for an unexpected scenic detour." },
    },
  },
  "hazbin-hotel-character-quiz": {
    "charlie": {
      "zh": { personalityTags: ["明亮热心", "希望感", "敞门派"], soulVerdict: "你很愿意把门留开一点，让想再试的人回来时不必先解释为什么。" },
      "zh-TW": { personalityTags: ["明亮熱心", "希望感", "敞門派"], soulVerdict: "你很願意把門留開一點，讓想再試的人回來時不必先解釋為什麼。" },
      "en": { personalityTags: ["Welcoming", "Hopeful", "Warmhearted"], soulVerdict: "You like leaving the door open for someone to try again without an explanation." },
    },
    "vaggie": {
      "zh": { personalityTags: ["护伴心", "边界清楚", "沉着可靠"], soulVerdict: "你照顾在意的人时也会把话讲明白，觉得两件事完全可以一起做。" },
      "zh-TW": { personalityTags: ["護伴心", "邊界清楚", "沉著可靠"], soulVerdict: "你照顧在意的人時也會把話講明白，覺得兩件事本來就能一起做到。" },
      "en": { personalityTags: ["Protective", "Boundaried", "Levelheaded"], soulVerdict: "You're drawn to the kind of care that comes with a clear, mutual agreement." },
    },
    "alastor": {
      "zh": { personalityTags: ["讲究气氛", "戏剧感", "从容自持"], soulVerdict: "你喜欢一个场合有自己的开场和节奏，连小铺垫也能让你入戏。" },
      "zh-TW": { personalityTags: ["講究氣氛", "戲劇感", "從容自持"], soulVerdict: "你喜歡一個場合有自己的開場和節奏，連小鋪墊也能讓你入戲。" },
      "en": { personalityTags: ["Theatrical", "Composed", "Deliberate"], soulVerdict: "You notice what turns a simple occasion into a scene with a rhythm of its own." },
    },
    "angel-dust": {
      "zh": { personalityTags: ["俏皮直觉", "松弛感", "风趣多变"], soulVerdict: "你喜欢带一点俏皮的变化，让沉闷的对话忽然多出一条好走的路。" },
      "zh-TW": { personalityTags: ["俏皮直覺", "自在感", "風趣多變"], soulVerdict: "你愛在話裡摻一點俏皮，氣氛卡住時，一個小轉彎就能讓聊天繼續。" },
      "en": { personalityTags: ["Playful Tone", "Quick Wit", "Adaptable"], soulVerdict: "You like the little shift in tone that can make a stiff room feel playable." },
    },
    "husk": {
      "zh": { personalityTags: ["清醒直白", "实在派", "不摆架子"], soulVerdict: "你更信一句实在话，能给多少就说多少，留下来的信任反而更真。" },
      "zh-TW": { personalityTags: ["清醒直白", "實在派", "不擺架子"], soulVerdict: "你更信一句實在話，能給多少就說多少，留下來的信任反而更真切。" },
      "en": { personalityTags: ["Grounded", "No-Frills", "Frank"], soulVerdict: "You'd rather offer something small and real than make the room a huge promise." },
    },
    "niffty": {
      "zh": { personalityTags: ["专注劲", "细节迷", "爽快利落"], soulVerdict: "你的快乐常在不起眼的小地方，把最后一点收好就很有成就感。" },
      "zh-TW": { personalityTags: ["專注勁", "細節迷", "爽快利落"], soulVerdict: "你的快樂常在不起眼的小地方，把最後一點收好就很有成就感。" },
      "en": { personalityTags: ["Detail Spark", "Focused", "Quick-Footed"], soulVerdict: "You find real satisfaction in getting the last little detail exactly right." },
    },
  },
  "dexter": {
    "dexter-morgan": {
      "zh": { personalityTags: ["细节敏锐", "冷静观察", "求实派"], soulVerdict: "你很容易先看见那一点不对劲，愿意把细节弄清再替故事下结论。" },
      "zh-TW": { personalityTags: ["細節敏銳", "冷靜觀察", "求實派"], soulVerdict: "你很容易先看見那一點不對勁，願意把細節弄清再替故事下結論。" },
      "en": { personalityTags: ["Sharp-Eyed", "Observant", "Measured"], soulVerdict: "You notice the detail that doesn't fit and give it time before naming a theory." },
    },
    "debra-morgan": {
      "zh": { personalityTags: ["坦率直接", "追问派", "眼里有事"], soulVerdict: "你更像会把漏掉的那个问题问出口的人，哪怕它听上去再普通。" },
      "zh-TW": { personalityTags: ["直來直往", "愛追問", "觀察銳利"], soulVerdict: "你很像會直接把大家漏掉的問題問出來的人，問題再平常也一樣。" },
      "en": { personalityTags: ["Blunt", "Plainspoken", "Perceptive"], soulVerdict: "You tend to ask the plain question everyone somehow stepped around." },
    },
    "angel-batista": {
      "zh": { personalityTags: ["亲和感", "照顾周全", "温厚稳重"], soulVerdict: "你留意谁在聊着聊着就没了声音，给对方留个位子对你很自然。" },
      "zh-TW": { personalityTags: ["親和感", "照顧周全", "溫厚穩重"], soulVerdict: "你留意誰在聊著聊著就沒了聲音，給對方留個位子對你很自然。" },
      "en": { personalityTags: ["Welcoming", "People-Minded", "Warm"], soulVerdict: "You notice who has gone quiet in a room and make space for them to come back." },
    },
    "vince-masuka": {
      "zh": { personalityTags: ["好奇多动脑", "玩心", "巧思派"], soulVerdict: "你会被意想不到的小机关逗乐，还想凑过去看看它究竟怎么转。" },
      "zh-TW": { personalityTags: ["好奇多動腦", "玩心", "巧思派"], soulVerdict: "你會被意想不到的小機關逗樂，還想湊過去看看它究竟怎麼轉。" },
      "en": { personalityTags: ["Playful Curiosity", "Tinkerer", "Quick-Witted"], soulVerdict: "You enjoy the small mechanism that gets everyone asking how it actually works." },
    },
    "james-doakes": {
      "zh": { personalityTags: ["求证派", "警觉清醒", "不轻信"], soulVerdict: "你听到一个说得很满的结论，会先好奇究竟有什么能撑得住它。" },
      "zh-TW": { personalityTags: ["求證派", "警覺清醒", "不輕信"], soulVerdict: "你聽到一個說得很滿的結論，會先好奇究竟有什麼能撐得住它。" },
      "en": { personalityTags: ["Skeptical", "Alert", "Fact-Minded"], soulVerdict: "When a claim sounds airtight, you want to know what is actually holding it up." },
    },
    "maria-laguerta": {
      "zh": { personalityTags: ["范围清晰", "务实派", "协调感"], soulVerdict: "你能从一桌人的热情里挑出共同做得成的一块，让想法有地方落脚。" },
      "zh-TW": { personalityTags: ["範圍清晰", "務實派", "協調感"], soulVerdict: "你能從一桌人的熱情裡挑出共同做得成的一塊，讓想法有地方落地。" },
      "en": { personalityTags: ["Scope-Savvy", "Pragmatic", "Coordinated"], soulVerdict: "You zero in on the part a group can make together while the enthusiasm is fresh." },
    },
  },
  "jujutsu-kaisen-character": {
    "yuji-itadori": {
      "zh": { personalityTags: ["热心同行者", "直率", "好相处"], soulVerdict: "你更像肯陪人走一小段的朋友，常把关心化成眼下能一起做的事。" },
      "zh-TW": { personalityTags: ["熱心同行者", "直率", "好相處"], soulVerdict: "你更像肯陪人走一小段的朋友，常把關心化成眼下能一起做的事。" },
      "en": { personalityTags: ["Openhearted", "Hands-On", "Warm Ally"], soulVerdict: "You're the one drawn to taking a small next step alongside someone you care for." },
    },
    "megumi-fushiguro": {
      "zh": { personalityTags: ["沉静自持", "重诺心", "有分寸"], soulVerdict: "你更在意自己愿意认领哪份承诺，安静的选择也可以有很实在的重量。" },
      "zh-TW": { personalityTags: ["沉靜自持", "重諾心", "有分寸"], soulVerdict: "你更在意自己願意認領哪份承諾，安靜的選擇也可以有很實在的重量。" },
      "en": { personalityTags: ["Reserved", "Deliberate", "Principled"], soulVerdict: "You give most weight to a promise you chose, even if you made it quietly." },
    },
    "nobara-kugisaki": {
      "zh": { personalityTags: ["亮眼主见", "直爽派", "自我笃定"], soulVerdict: "你会为自己真正喜欢的选项站稳，哪怕身边的人都挑了另一边。" },
      "zh-TW": { personalityTags: ["有主見", "直球派", "自在耀眼"], soulVerdict: "你更願意選自己真心喜歡的那一邊，就算身邊沒人選同一邊也可以。" },
      "en": { personalityTags: ["Self-Possessed", "Outspoken", "Distinctive"], soulVerdict: "You want your choice to feel like yours, even when the room picks differently." },
    },
    "satoru-gojo": {
      "zh": { personalityTags: ["跳脱思路", "俏皮心", "不拘一格"], soulVerdict: "你喜欢随手给难题转个面，原本很严肃的局面立刻能看见别的解法。" },
      "zh-TW": { personalityTags: ["跳脫思路", "俏皮心", "不拘一格"], soulVerdict: "你喜歡隨手給難題轉個面，原本很嚴肅的局面立刻能看見別的解法。" },
      "en": { personalityTags: ["Playful Mind", "Unconventional", "Quick-Witted"], soulVerdict: "You like turning a serious problem sideways just to see what else shows up." },
    },
    "maki-zenin": {
      "zh": { personalityTags: ["专注果断", "磨技派", "蓄力感"], soulVerdict: "你更享受认真打磨一招的踏实感，细微的进步对你就已经够响亮。" },
      "zh-TW": { personalityTags: ["專注果斷", "磨技派", "蓄力感"], soulVerdict: "你更享受認真打磨一招的踏實感，細微的進步對你就已經夠響亮。" },
      "en": { personalityTags: ["Focused", "Deliberate", "Determined"], soulVerdict: "You like honing one move until the smallest improvement feels like a real win." },
    },
    "toge-inumaki": {
      "zh": { personalityTags: ["话少有心", "措辞敏锐", "克制感"], soulVerdict: "你知道少说几个字也能把心意放得很准，所以更在意每句话的份量。" },
      "zh-TW": { personalityTags: ["話少有心", "措辭敏銳", "克制感"], soulVerdict: "你知道少說幾個字也能把心意放得很準，所以更在意每句話的分量。" },
      "en": { personalityTags: ["Quiet Precision", "Considerate", "Measured"], soulVerdict: "You know a few careful words can carry more than a speech when they fit." },
    },
  },
  "blue-lock": {
    "isagi": {
      "zh": { personalityTags: ["善看局势", "战术脑", "灵活理性"], soulVerdict: "你看完一轮往往已经有了新布置，喜欢根据刚看见的变化重新想。" },
      "zh-TW": { personalityTags: ["善看局勢", "戰術腦", "靈活理性"], soulVerdict: "你看完一輪往往已經有了新佈置，喜歡根據剛看見的變化重新想。" },
      "en": { personalityTags: ["Tactical", "Adaptive", "Observant"], soulVerdict: "You see one turn play out and the whole map in your head starts updating." },
    },
    "bachira": {
      "zh": { personalityTags: ["玩心足", "灵感派", "轻盈感"], soulVerdict: "你更喜欢大家能自由接招的游戏，意料之外的配合会让你特别开心。" },
      "zh-TW": { personalityTags: ["玩心足", "靈感派", "輕盈感"], soulVerdict: "你更喜歡大家能自由接招的遊戲，意料之外的配合會讓你特別開心。" },
      "en": { personalityTags: ["Playful", "Free-Spirited", "Inventive"], soulVerdict: "You light up when play leaves enough room for someone to surprise you back." },
    },
    "nagi": {
      "zh": { personalityTags: ["省力美学", "冷静简明", "手感派"], soulVerdict: "你先挑最简明又能起效的一步，事情越复杂，你越欣赏干净的解法。" },
      "zh-TW": { personalityTags: ["省力美學", "冷靜俐落", "手感派"], soulVerdict: "你欣賞簡單又有效的解法，局面愈複雜，愈想走一步乾淨俐落的棋。" },
      "en": { personalityTags: ["Low-Key", "Efficient", "Clearheaded"], soulVerdict: "You like the clean, playable move that makes an overcomplicated board simpler." },
    },
    "reo": {
      "zh": { personalityTags: ["灵活多面", "应变快", "有主见"], soulVerdict: "你享受自己决定怎么出力，情势一变，换个接球位置也有意思。" },
      "zh-TW": { personalityTags: ["靈活多面", "應變快", "有主見"], soulVerdict: "你享受自己決定怎麼出力，情勢一變，換個接球位置也有意思。" },
      "en": { personalityTags: ["Versatile", "Adaptive", "Self-Directed"], soulVerdict: "You like choosing your part and can enjoy moving when the game shifts." },
    },
    "rin": {
      "zh": { personalityTags: ["精确派", "冷静求实", "标准清楚"], soulVerdict: "你偏爱大家对同一条规则有同样理解，模糊的一笔会让你多看一眼。" },
      "zh-TW": { personalityTags: ["精確派", "冷靜求實", "標準清楚"], soulVerdict: "你偏愛大家對同一條規則有同樣理解，模糊的一筆會讓你多看一眼。" },
      "en": { personalityTags: ["Exacting", "Composed", "Rule-Minded"], soulVerdict: "You like everyone playing from the same rule, right down to the fine print." },
    },
    "barou": {
      "zh": { personalityTags: ["纪律感", "自有章法", "固守节拍"], soulVerdict: "你喜欢把自己的节拍守得很清楚，就算全场变快也还有清晰的落点。" },
      "zh-TW": { personalityTags: ["紀律感", "自有章法", "固守節拍"], soulVerdict: "你喜歡把自己的節拍守得很清楚，就算全場變快也還有清晰的落點。" },
      "en": { personalityTags: ["Self-Disciplined", "Steady Rhythm", "Independent"], soulVerdict: "You feel most at ease with a rhythm of your own when the whole board speeds up." },
    },
    "chigiri": {
      "zh": { personalityTags: ["自定节奏", "轻盈果决", "自主感"], soulVerdict: "你会选让自己还想继续玩的速度，快慢都听手感，留下再变的余地。" },
      "zh-TW": { personalityTags: ["自定節奏", "輕盈果決", "自主感"], soulVerdict: "你會選讓自己還想繼續玩的速度，快慢都聽手感，留下再變的餘地。" },
      "en": { personalityTags: ["Self-Paced", "Light-Footed", "Decisive"], soulVerdict: "You like a tempo that keeps the game alive for you and leaves room to shift." },
    },
  },
  "stranger-things": {
    "eleven": {
      "zh": { personalityTags: ["直觉清醒", "自主感", "真诚直接"], soulVerdict: "你更看重那句真正出自自己心里的选择，旁人的声音再响也听得见它。" },
      "zh-TW": { personalityTags: ["直覺清醒", "自主感", "真誠直接"], soulVerdict: "你更看重那句真正出自自己心裡的選擇，旁人的聲音再響也聽得見它。" },
      "en": { personalityTags: ["Self-Directed", "Direct", "Sincere"], soulVerdict: "You hear the choice that feels genuinely yours even in a room full of opinions." },
    },
    "mike-wheeler": {
      "zh": { personalityTags: ["重友情", "同伴心", "故事感"], soulVerdict: "你看重一群人共同编进故事里的那个位置，希望伙伴都有名字。" },
      "zh-TW": { personalityTags: ["重友情", "同伴心", "故事感"], soulVerdict: "你看重一群人共同編進故事裡的那個位置，希望夥伴都有名字。" },
      "en": { personalityTags: ["Friend-Minded", "Inclusive", "Story-Hearted"], soulVerdict: "You love a shared story most when everyone in the group has a place in it." },
    },
    "dustin-henderson": {
      "zh": { personalityTags: ["联想力", "好奇脑", "机灵风趣"], soulVerdict: "你会被两个原本不相干的东西忽然连上的那一刻逗得眼睛发亮。" },
      "zh-TW": { personalityTags: ["聯想力", "好奇心", "機靈風趣"], soulVerdict: "你會為兩個八竿子打不著的點子突然連在一起，眼睛一下就亮起來。" },
      "en": { personalityTags: ["Curious", "Clever", "Quick Connector"], soulVerdict: "You perk up at the moment two completely unrelated ideas suddenly click." },
    },
    "lucas-sinclair": {
      "zh": { personalityTags: ["靠谱务实", "求证脑", "沉着派"], soulVerdict: "你有兴趣把听起来不错的想法拿到一个真实小例子里，看它怎么运转。" },
      "zh-TW": { personalityTags: ["踏實務實", "求證腦", "沉著派"], soulVerdict: "你有興趣把聽起來不錯的想法拿到一個真實小例子裡，看它怎麼運轉。" },
      "en": { personalityTags: ["Grounded", "Evidence-Minded", "Practical"], soulVerdict: "You enjoy seeing whether a promising idea still works in one ordinary example." },
    },
    "will-byers": {
      "zh": { personalityTags: ["细腻想象", "氛围感", "敏锐心"], soulVerdict: "你常会先想起一个世界的颜色和空气，等那些感觉有了可以看见的形状。" },
      "zh-TW": { personalityTags: ["細膩想像", "氛圍感", "敏銳心"], soulVerdict: "你常會先想起一個世界的顏色和空氣，等那些感覺有了可以看見的形狀。" },
      "en": { personalityTags: ["Atmospheric", "Imaginative", "Attuned"], soulVerdict: "You sense the mood of an imagined place before it has a name or a map." },
    },
    "max-mayfield": {
      "zh": { personalityTags: ["独立调性", "有边界", "不随大流"], soulVerdict: "你想走一条自己听得见脚步声的路，就算还没决定到底会走多远。" },
      "zh-TW": { personalityTags: ["獨立調性", "有邊界", "不隨大流"], soulVerdict: "你想走一條自己聽得見腳步聲的路，就算還沒決定到底會走多遠。" },
      "en": { personalityTags: ["Independent", "Self-Directed", "Steady Nerve"], soulVerdict: "You want to hear your own footsteps on a route, even before you know its end." },
    },
  },
  "my-hero-academia-character-quiz": {
    "izuku-midoriya": {
      "zh": { personalityTags: ["敏锐热心", "细致派", "亲切认真"], soulVerdict: "你常先留意对方到底哪里卡住，再把善意变成一件具体能帮的小事。" },
      "zh-TW": { personalityTags: ["敏銳熱心", "細緻派", "親切認真"], soulVerdict: "你常先留意對方到底哪裡卡住，再把善意變成一件具體能幫的小事。" },
      "en": { personalityTags: ["Observant", "Thoughtful", "Practical Ally"], soulVerdict: "You notice where someone gets stuck and see a concrete way to lend a hand." },
    },
    "katsuki-bakugo": {
      "zh": { personalityTags: ["锋芒感", "好胜心", "目标清楚"], soulVerdict: "你遇到够明确的挑战更容易来劲，最好一眼就知道自己想突破哪里。" },
      "zh-TW": { personalityTags: ["鋒芒感", "好勝心", "目標清楚"], soulVerdict: "你遇到夠明確的挑戰更容易來勁，最好一眼就知道自己想突破哪裡。" },
      "en": { personalityTags: ["Competitive", "Focused", "Gutsy"], soulVerdict: "You come alive when a challenge has an edge you can name and aim for." },
    },
    "shoto-todoroki": {
      "zh": { personalityTags: ["沉静独立", "淡定感", "内在主见"], soulVerdict: "你会留意一条路究竟是不是自己选的，心里的答案比外面安静些。" },
      "zh-TW": { personalityTags: ["沉靜獨立", "淡定感", "內在主見"], soulVerdict: "你會留意一條路究竟是不是自己選的，心裡的答案比外面安靜些。" },
      "en": { personalityTags: ["Composed", "Independent", "Reflective"], soulVerdict: "You're drawn to the route that feels chosen from within, however quietly." },
    },
    "ochaco-uraraka": {
      "zh": { personalityTags: ["暖心务实", "亲和感", "轻盈劲"], soulVerdict: "你常能看到事情轻一点的办法，让人松口气之后还愿意再往前走。" },
      "zh-TW": { personalityTags: ["暖心實在", "好親近", "輕盈感"], soulVerdict: "你容易看出怎麼把下一步變輕一點，讓人鬆口氣，也還願意繼續走。" },
      "en": { personalityTags: ["Warm", "Practical", "Light Touch"], soulVerdict: "You like making the next step feel a little lighter for everyone taking it." },
    },
    "tenya-iida": {
      "zh": { personalityTags: ["条理感", "守序心", "明快认真"], soulVerdict: "你觉得好的安排应该让大家一听就懂，连第一次加入的人也能跟上。" },
      "zh-TW": { personalityTags: ["條理感", "守序心", "明快認真"], soulVerdict: "你覺得好的安排應該讓大家一聽就懂，連第一次加入的人也能跟得上。" },
      "en": { personalityTags: ["Orderly", "Clearheaded", "Dependable"], soulVerdict: "You like a shared plan people can follow, even if they showed up halfway in." },
    },
    "eijiro-kirishima": {
      "zh": { personalityTags: ["真诚担当", "靠得住", "义气心"], soulVerdict: "你把自己真的答应过的事放在心上，那种并肩到底的感觉让你踏实。" },
      "zh-TW": { personalityTags: ["真誠擔當", "靠得住", "義氣心"], soulVerdict: "你把自己真的答應過的事放在心上，那種並肩到底的感覺讓你踏實。" },
      "en": { personalityTags: ["Steadfast", "Sincere", "Loyal Friend"], soulVerdict: "You value the steady feeling of showing up for the part you really promised." },
    },
  },
  "superpower-test": {
    "telepathy": {
      "zh": { personalityTags: ["善听心", "同理直觉", "温和好奇"], soulVerdict: "你最想弄懂的，是此刻对方真正想说什么，所以愿意多听一会儿。" },
      "zh-TW": { personalityTags: ["善聽心", "同理直覺", "溫和好奇"], soulVerdict: "你最想弄懂的，是此刻對方真正想說什麼，所以願意多聽一會兒。" },
      "en": { personalityTags: ["Attentive", "Curious Listener", "Warm"], soulVerdict: "What you most want to hear is what the other person actually means this time." },
    },
    "flight": {
      "zh": { personalityTags: ["开阔心", "视角灵活", "自在感"], soulVerdict: "你喜欢把镜头往上拉一点，从高处再看那些挤在眼前的问题。" },
      "zh-TW": { personalityTags: ["開闊心", "靈活視角", "自在感"], soulVerdict: "你喜歡把鏡頭拉遠一點，換個高度看眼前原本全擠在一起的問題。" },
      "en": { personalityTags: ["Big-Picture", "Flexible", "Open-Minded"], soulVerdict: "You like zooming out until the things crowding the foreground look different." },
    },
    "time-control": {
      "zh": { personalityTags: ["从容节拍", "弹性派", "余裕感"], soulVerdict: "你偏爱每件事的前后都有呼吸的空间，计划经得起偶尔一阵风。" },
      "zh-TW": { personalityTags: ["從容節拍", "彈性派", "餘裕感"], soulVerdict: "你偏愛每件事的前後都有呼吸的空間，計畫經得起偶爾一陣風。" },
      "en": { personalityTags: ["Unhurried", "Flexible", "Pace-Aware"], soulVerdict: "You like room to breathe around a plan, enough that a gust can pass through it." },
    },
    "invisibility": {
      "zh": { personalityTags: ["静观派", "眼尖心细", "界限清楚"], soulVerdict: "你喜欢先在安静处看明白，再决定什么时候想让别人听见你的声音。" },
      "zh-TW": { personalityTags: ["靜觀派", "眼尖心細", "界線清楚"], soulVerdict: "你喜歡先在安靜處看明白，再決定什麼時候想讓別人聽見你的聲音。" },
      "en": { personalityTags: ["Quiet Observer", "Discerning", "Boundaried"], soulVerdict: "You like watching the scene in quiet and choosing for yourself when to speak." },
    },
    "super-strength": {
      "zh": { personalityTags: ["实干暖心", "有担当", "务实有界"], soulVerdict: "你觉得力量最好用在具体的地方，也愿意坦白自己这一回能给多少。" },
      "zh-TW": { personalityTags: ["實在暖心", "有擔當", "務實有界"], soulVerdict: "你覺得力量最好用在具體的地方，也願意坦白自己這一回能給多少。" },
      "en": { personalityTags: ["Practical Ally", "Grounded", "Boundaried"], soulVerdict: "You like strength with a concrete purpose and an honest sense of its limits." },
    },
  },
  "twilight-character": {
    "bella-swan": {
      "zh": { personalityTags: ["内在主见", "深思派", "感受细腻"], soulVerdict: "你更愿意选对自己有真切意义的事，那种心里有回声的感觉很重要。" },
      "zh-TW": { personalityTags: ["內在主見", "深思派", "感受細膩"], soulVerdict: "你更願意選對自己有真切意義的事，那種心裡有回聲的感覺很重要。" },
      "en": { personalityTags: ["Reflective", "Self-Directed", "Sincere"], soulVerdict: "You're drawn to the choice that echoes somewhere private and real for you." },
    },
    "edward-cullen": {
      "zh": { personalityTags: ["审慎重诺", "沉静派", "慢热感"], soulVerdict: "你面对重要承诺常要多想一会儿，真心点头时反而更让自己踏实。" },
      "zh-TW": { personalityTags: ["審慎重諾", "沉靜派", "慢熟感"], soulVerdict: "你面對重要承諾常要多想一會兒，真心點頭時反而更讓自己踏實。" },
      "en": { personalityTags: ["Considered", "Reserved", "Deliberate"], soulVerdict: "You like time to sit with a promise so your eventual yes feels like your own." },
    },
    "jacob-black": {
      "zh": { personalityTags: ["动手感", "热心务实", "粗中有细"], soulVerdict: "你很享受让眼前小东西重新好用的瞬间，心里觉得这比空想过瘾。" },
      "zh-TW": { personalityTags: ["動手感", "熱心務實", "粗中有細"], soulVerdict: "你很享受讓眼前小東西重新好用的瞬間，心裡覺得這比空想過癮。" },
      "en": { personalityTags: ["Hands-On", "Practical", "Warm Energy"], soulVerdict: "You get more joy from making one ordinary thing work than from talking it up." },
    },
    "alice-cullen": {
      "zh": { personalityTags: ["明快暖心", "惊喜感", "细致周到"], soulVerdict: "你愿意为一起度过的小片刻多想一点，喜欢看到大家的脸忽然亮起来。" },
      "zh-TW": { personalityTags: ["明快暖心", "驚喜感", "細緻周到"], soulVerdict: "你願意為一起度過的小片刻多想一點，喜歡看到大家的臉忽然亮起來。" },
      "en": { personalityTags: ["Bright-Spirited", "Thoughtful", "Playful Host"], soulVerdict: "You like preparing a small delight and seeing a shared moment suddenly light up." },
    },
    "rosalie-cullen": {
      "zh": { personalityTags: ["主见清楚", "自持感", "不盲从"], soulVerdict: "你很在意出力是不是自己想做的，诚心的那一份对你更有重量。" },
      "zh-TW": { personalityTags: ["主見清楚", "自持感", "不盲從"], soulVerdict: "你很在意出力是不是自己想做的，誠心的那一份對你更有重量。" },
      "en": { personalityTags: ["Self-Possessed", "Independent", "Discerning"], soulVerdict: "You value a contribution most when it feels like something you truly chose." },
    },
    "emmett-cullen": {
      "zh": { personalityTags: ["爱玩心", "好相处", "轻松直率"], soulVerdict: "你喜欢大家可以笑着加入也能自在退出的场合，觉得这样玩才痛快。" },
      "zh-TW": { personalityTags: ["玩心足", "好相處", "輕鬆直率"], soulVerdict: "你最享受大家能笑著加入，也能自在說先休息一下的那種熱鬧。" },
      "en": { personalityTags: ["Easygoing", "Playful", "Good-Humored"], soulVerdict: "You like shared fun with a door people can walk through in either direction." },
    },
    "carlisle-cullen": {
      "zh": { personalityTags: ["温厚体贴", "稳稳的", "有分寸"], soulVerdict: "你在伸手帮忙以前会先问对方喜欢怎样被帮，那点体贴很容易被记住。" },
      "zh-TW": { personalityTags: ["溫厚體貼", "穩穩的", "有分寸"], soulVerdict: "你在伸手幫忙以前會先問對方喜歡怎樣被幫，那點體貼很容易被記住。" },
      "en": { personalityTags: ["Gentle", "Attentive", "Composed"], soulVerdict: "You care enough to ask what help would actually feel welcome this time." },
    },
  },
  "which-tarot-card-are-you": {
    "fool": {
      "zh": { personalityTags: ["好奇心", "轻装派", "自由气"], soulVerdict: "你比较愿意把未知当成一扇半开的门，门后什么样，可以边走边看。" },
      "zh-TW": { personalityTags: ["好奇心", "輕裝派", "自由氣"], soulVerdict: "你比較願意把未知當成一扇半開的門，門後什麼樣，可以邊走邊看。" },
      "en": { personalityTags: ["Curious", "Free-Spirited", "Openhearted"], soulVerdict: "You see the unknown as a door left ajar and want to find out what's inside." },
    },
    "magician": {
      "zh": { personalityTags: ["巧思感", "灵活派", "手作脑"], soulVerdict: "你往往能从手边几件不起眼的东西里，看出一个自己想玩的组合。" },
      "zh-TW": { personalityTags: ["巧思感", "靈活派", "手作腦"], soulVerdict: "你往往能從手邊幾件不起眼的東西裡，看出一個自己想玩的組合。" },
      "en": { personalityTags: ["Resourceful", "Inventive", "Hands-On"], soulVerdict: "Your imagination likes the ingredients already scattered across the table." },
    },
    "high-priestess": {
      "zh": { personalityTags: ["静观派", "细腻感", "容得下谜"], soulVerdict: "你愿意和没想透的事多待一会儿，那点模糊对你还有可以呼吸的空间。" },
      "zh-TW": { personalityTags: ["靜觀派", "細膩感", "容得下謎"], soulVerdict: "你願意和沒想透的事多待一會兒，那點模糊對你還有可以呼吸的空間。" },
      "en": { personalityTags: ["Reflective", "Quietly Curious", "Patient"], soulVerdict: "You're at home with a little mystery while an answer is still taking shape." },
    },
    "empress": {
      "zh": { personalityTags: ["滋养感", "温厚心", "慢生长"], soulVerdict: "你更留意什么让事物长得舒服，喜欢看一点心思慢慢长成有生命的样子。" },
      "zh-TW": { personalityTags: ["滋養感", "溫厚心", "慢生長"], soulVerdict: "你更留意什麼讓事物長得舒服，喜歡看一點心思慢慢長成有生命的樣子。" },
      "en": { personalityTags: ["Nurturing", "Patient", "Growth-Minded"], soulVerdict: "You're drawn to the quiet conditions that help something grow at its own pace." },
    },
    "emperor": {
      "zh": { personalityTags: ["条理感", "稳场派", "现实心"], soulVerdict: "你喜欢让混乱的事有个能站稳的框架，心里踏实了，旁人也容易加入。" },
      "zh-TW": { personalityTags: ["條理感", "穩場派", "現實心"], soulVerdict: "你喜歡讓混亂的事有個能站穩的框架，心裡踏實了，旁人也容易加入。" },
      "en": { personalityTags: ["Structured", "Grounded", "Organized"], soulVerdict: "You like a sturdy framework that gives a messy plan somewhere useful to stand." },
    },
    "hierophant": {
      "zh": { personalityTags: ["承传心", "温和考据", "尊重来路"], soulVerdict: "你对旧做法还有好奇，想知道它怎么传下来，也想听听别人为什么珍惜。" },
      "zh-TW": { personalityTags: ["承傳心", "溫和考據", "尊重來路"], soulVerdict: "你對舊做法還有好奇，想知道它怎麼傳下來，也想聽聽別人為什麼珍惜。" },
      "en": { personalityTags: ["Tradition-Minded", "Curious", "Considered"], soulVerdict: "You're curious how a familiar practice got here and why someone still keeps it." },
    },
    "lovers": {
      "zh": { personalityTags: ["重心意", "共鸣感", "重视选择"], soulVerdict: "你遇到共同的选择时，很在意双方真正珍惜什么，心意比场面更重要。" },
      "zh-TW": { personalityTags: ["重心意", "共鳴感", "重視選擇"], soulVerdict: "你遇到共同的選擇時，很在意雙方真正珍惜什麼，心意比場面更重要。" },
      "en": { personalityTags: ["Warm", "Values-Minded", "Reciprocal"], soulVerdict: "You care most about what both people value when a choice belongs to both of you." },
    },
    "chariot": {
      "zh": { personalityTags: ["方向感", "果断心", "蓄势待发"], soulVerdict: "你喜欢看见前方有一条自己认领的路，一有落点就愿意往前试试。" },
      "zh-TW": { personalityTags: ["方向感", "果斷心", "蓄勢待發"], soulVerdict: "你喜歡看見前方有一條自己認領的路，一有落點就願意往前試試。" },
      "en": { personalityTags: ["Purposeful", "Decisive", "Driven"], soulVerdict: "You pick up momentum when you can see a direction that actually feels like yours." },
    },
    "strength": {
      "zh": { personalityTags: ["温柔韧劲", "有分寸", "内敛力量"], soulVerdict: "你觉得温和的声音照样站得住，尤其在你清楚自己愿意给到哪里时。" },
      "zh-TW": { personalityTags: ["溫柔韌勁", "有分寸", "內斂力量"], soulVerdict: "你覺得溫和的聲音照樣站得住，尤其在你清楚自己願意給到哪裡時。" },
      "en": { personalityTags: ["Gentle Resolve", "Composed", "Boundaried"], soulVerdict: "You trust a quiet voice to hold its ground when the boundary is real." },
    },
    "hermit": {
      "zh": { personalityTags: ["独处感", "内省派", "静思心"], soulVerdict: "你有时偏爱把门轻轻带上，等自己的想法慢慢盖过外面的热闹。" },
      "zh-TW": { personalityTags: ["獨處感", "內省派", "靜思心"], soulVerdict: "你有時偏愛把門輕輕帶上，等自己的想法慢慢蓋過外面的熱鬧。" },
      "en": { personalityTags: ["Reflective", "Quietly Focused", "Solitary"], soulVerdict: "You like a stretch of quiet long enough to hear your own thoughts clearly." },
    },
    "wheel-of-fortune": {
      "zh": { personalityTags: ["应变感", "开阔心", "不恋旧局"], soulVerdict: "你对变动带来的新局面有兴趣，原来的计划松开一点，也许会更好走。" },
      "zh-TW": { personalityTags: ["應變感", "開闊心", "不戀舊局"], soulVerdict: "你對變動帶來的新局面有興趣，原來的計畫鬆開一點，也許會更好走。" },
      "en": { personalityTags: ["Adaptable", "Open-Minded", "Flexible"], soulVerdict: "You notice the new opening when circumstances move and the old plan loosens." },
    },
    "justice": {
      "zh": { personalityTags: ["公允心", "理性派", "讲依据"], soulVerdict: "你更愿意听清各方依据再作判断，因为看着公平和真的公平有时很不同。" },
      "zh-TW": { personalityTags: ["公允心", "理性派", "講依據"], soulVerdict: "你更願意聽清各方依據再作判斷，因為看著公平和真的公平有時很不同。" },
      "en": { personalityTags: ["Fair-Minded", "Evidence-Minded", "Evenhanded"], soulVerdict: "You want the reasons in view before you call an arrangement fair." },
    },
    "hanged-man": {
      "zh": { personalityTags: ["慢半拍", "换位感", "沉静心"], soulVerdict: "你会给卡住的事留一点时间，再从原本没站过的位置多看它一眼。" },
      "zh-TW": { personalityTags: ["慢半拍", "換位感", "沉靜心"], soulVerdict: "你會給卡住的事留一點時間，再從原本沒站過的位置多看它一眼。" },
      "en": { personalityTags: ["Patient", "Angle-Shifter", "Unhurried"], soulVerdict: "You can sit with an impasse long enough to see what changes from another angle." },
    },
    "death": {
      "zh": { personalityTags: ["清醒收尾", "放得开", "阶段感"], soulVerdict: "你有时宁愿好好替一段经历收尾，腾出来的地方也许正好放下一件新事。" },
      "zh-TW": { personalityTags: ["清醒收尾", "放得開", "階段感"], soulVerdict: "你有時寧願好好替一段經歷收尾，騰出來的地方也許正好放下一件新事。" },
      "en": { personalityTags: ["Clear-Eyed", "Closure-Minded", "Accepting"], soulVerdict: "You can make a thoughtful ending and still feel curious about what fits next." },
    },
    "temperance": {
      "zh": { personalityTags: ["调和感", "适度派", "细腻平衡"], soulVerdict: "你喜欢试到刚刚好，像把两样本来不同的东西放近一点，慢慢找到合拍。" },
      "zh-TW": { personalityTags: ["調和感", "適度派", "細膩平衡"], soulVerdict: "你喜歡試到剛剛好，像把兩樣本來不同的東西放近一點，慢慢找到合拍。" },
      "en": { personalityTags: ["Balanced", "Patient", "Blending Mind"], soulVerdict: "You enjoy finding the mix where two different things start to work together." },
    },
    "devil": {
      "zh": { personalityTags: ["欲望清醒", "现实感", "自持心"], soulVerdict: "你愿意看清自己究竟想要什么，也愿意把现实的限度留在同一张桌上。" },
      "zh-TW": { personalityTags: ["慾望清醒", "現實感", "自持心"], soulVerdict: "你願意看清自己究竟想要什麼，也願意把現實的限度留在同一張桌上。" },
      "en": { personalityTags: ["Desire-Aware", "Grounded", "Clearheaded"], soulVerdict: "You like to see both what you really want and what the situation can hold." },
    },
    "tower": {
      "zh": { personalityTags: ["破框感", "清醒派", "敢重想"], soulVerdict: "你发现原来的说法站不稳时，更愿意重看地基，有时还会觉得有趣。" },
      "zh-TW": { personalityTags: ["破框感", "清醒派", "敢重想"], soulVerdict: "你發現原來的說法站不穩時，更願意重看地基，有時還會覺得有趣。" },
      "en": { personalityTags: ["Assumption-Aware", "Clear-Eyed", "Bold"], soulVerdict: "You're willing to check the foundations when the old explanation wobbles." },
    },
    "star": {
      "zh": { personalityTags: ["微光感", "温和希望", "开放心"], soulVerdict: "你愿意给还没兑现的可能留一小块地方，有时候亮那么一点也够了。" },
      "zh-TW": { personalityTags: ["微光感", "溫柔希望", "開放心"], soulVerdict: "你願意替還沒成形的可能留一點空間，有時只亮一小點，心裡就夠暖了。" },
      "en": { personalityTags: ["Quiet Hope", "Openhearted", "Patient"], soulVerdict: "You leave a little space for an unlikely possibility and enjoy the faint light." },
    },
    "moon": {
      "zh": { personalityTags: ["想象浓度", "细腻感", "存疑派"], soulVerdict: "你容易看见暧昧处长出来的故事，也愿意留一点未知给它自己待着。" },
      "zh-TW": { personalityTags: ["想像濃度", "細膩感", "存疑派"], soulVerdict: "你容易看見曖昧處長出來的故事，也願意留一點未知給它自己待著。" },
      "en": { personalityTags: ["Imaginative", "Perceptive", "Questioning"], soulVerdict: "You enjoy the stories a shadow suggests while leaving some mystery unresolved." },
    },
    "sun": {
      "zh": { personalityTags: ["亮堂感", "日常乐天", "暖意心"], soulVerdict: "你的开心有时很简单，光照到桌面、闲聊刚好对上，都能记一整天。" },
      "zh-TW": { personalityTags: ["亮堂感", "日常樂天", "暖意心"], soulVerdict: "你的開心有時很簡單，光照到桌面、閒聊剛好對上，都能記一整天。" },
      "en": { personalityTags: ["Bright", "Everyday Joy", "Warmhearted"], soulVerdict: "You notice how a sunny table or a good bit of chatter can color the whole day." },
    },
    "judgement": {
      "zh": { personalityTags: ["回看感", "自省派", "开放重选"], soulVerdict: "你愿意把走过的路再看一遍，看清今天的自己还有哪些想重新选择。" },
      "zh-TW": { personalityTags: ["回看感", "自省派", "開放重選"], soulVerdict: "你願意把走過的路再看一遍，看清今天的自己還有哪些想重新選擇。" },
      "en": { personalityTags: ["Reflective", "Open to Change", "Self-Aware"], soulVerdict: "You can revisit an old choice and give today's version of yourself another say." },
    },
    "world": {
      "zh": { personalityTags: ["圆满感", "收束心", "珍惜过程"], soulVerdict: "你很在意回头看见已经走过的那段路，拼完整的感觉可以慢慢享受。" },
      "zh-TW": { personalityTags: ["圓滿感", "收束心", "珍惜過程"], soulVerdict: "你很在意回頭看見已經走過的那段路，拼完整的感覺可以慢慢享受。" },
      "en": { personalityTags: ["Completion-Minded", "Appreciative", "Grounded"], soulVerdict: "You like looking back at the pieces that came together and letting that feel enough." },
    },
  },
  "harry-potter-character": {
    "harry-potter": {
      "zh": { personalityTags: ["应变勇气", "直觉派", "肯迈步"], soulVerdict: "你比较愿意先试一条走得通的路，有时走出一点，就知道方向还在不在。" },
      "zh-TW": { personalityTags: ["應變勇氣", "直覺派", "肯邁步"], soulVerdict: "你比較願意先試一條走得通的路，有時走出一點，就知道方向還在不在。" },
      "en": { personalityTags: ["Gutsy", "Instinctive", "Practical"], soulVerdict: "You're drawn to a workable first turn, the one that gives the rest of the road shape." },
    },
    "hermione-granger": {
      "zh": { personalityTags: ["考据心", "逻辑派", "求知欲"], soulVerdict: "你会被一条模糊的引文勾起好奇，想看看原文究竟说了什么才放心。" },
      "zh-TW": { personalityTags: ["考據心", "邏輯派", "求知慾"], soulVerdict: "你會被一條模糊的引文勾起好奇，想看看原文究竟說了什麼才放心。" },
      "en": { personalityTags: ["Bookish", "Evidence-Minded", "Exacting"], soulVerdict: "You want the original page when everyone else is quoting the same fuzzy line." },
    },
    "ron-weasley": {
      "zh": { personalityTags: ["亲切松弛", "同伴感", "日常幽默"], soulVerdict: "你喜欢把平常的一顿饭或一句玩笑变成只有朋友之间才懂的事。" },
      "zh-TW": { personalityTags: ["親切鬆弛", "同伴感", "日常幽默"], soulVerdict: "你喜歡把平常的一頓飯或一句玩笑變成只有朋友之間才懂的事。" },
      "en": { personalityTags: ["Easygoing", "Warm Companion", "Good-Humored"], soulVerdict: "You love the way an ordinary meal can turn into a story only your friends get." },
    },
    "ginny-weasley": {
      "zh": { personalityTags: ["爽快自主", "明朗主见", "敢选择"], soulVerdict: "你参加一件事时，更喜欢挑那个自己听了就心里一亮的位置。" },
      "zh-TW": { personalityTags: ["爽快自主", "明朗主見", "敢選擇"], soulVerdict: "你參加一件事時，更喜歡挑那個自己聽了就心裡一亮的位置。" },
      "en": { personalityTags: ["Decisive", "Self-Directed", "Bright-Spirited"], soulVerdict: "You want to choose the part that sparks something in you, even in a group effort." },
    },
    "neville-longbottom": {
      "zh": { personalityTags: ["温柔韧劲", "稳步派", "含蓄勇气"], soulVerdict: "你更愿意从一个做得来的开头慢慢靠近勇气，踏实比响亮更合你的拍子。" },
      "zh-TW": { personalityTags: ["溫柔韌勁", "穩步派", "含蓄勇氣"], soulVerdict: "你更願意從一個做得來的開頭慢慢靠近勇氣，踏實比響亮更合你的步調。" },
      "en": { personalityTags: ["Gentle Resolve", "Steady", "Patient Courage"], soulVerdict: "Your courage feels most at home in a first try you can make at your own pace." },
    },
    "luna-lovegood": {
      "zh": { personalityTags: ["空灵感", "异想天开", "纯粹好奇"], soulVerdict: "你会认真对待突然冒出来的奇怪想法，有些很好玩，未必需要别人点头。" },
      "zh-TW": { personalityTags: ["空靈感", "天馬行空", "純粹好奇"], soulVerdict: "你喜歡認真玩味突然冒出來的怪點子，有趣就夠了，不必等別人認同。" },
      "en": { personalityTags: ["Whimsical", "Curious", "Unconventional"], soulVerdict: "You make room for the wonderfully odd idea even when nobody else knows what to do with it." },
    },
    "rubeus-hagrid": {
      "zh": { personalityTags: ["热情厚道", "好客心", "照顾周全"], soulVerdict: "你更爱用实在的小招待让人安心，腾把椅子比说一串漂亮话更自然。" },
      "zh-TW": { personalityTags: ["熱情厚道", "好客心", "照顧周全"], soulVerdict: "你更愛用實在的小招待讓人安心，騰把椅子比說一串漂亮話更自然。" },
      "en": { personalityTags: ["Bighearted", "Hospitable", "Practical"], soulVerdict: "You express a welcome in ways people can feel, like clearing a chair for them." },
    },
  },
  "hogwarts-house-quiz": {
    "gryffindor": {
      "zh": { personalityTags: ["勇气感", "热忱派", "爽快果决"], soulVerdict: "你会为值得试的事鼓起勇气，紧张还在，脚下已经往前挪了一步。" },
      "zh-TW": { personalityTags: ["勇氣感", "熱忱派", "爽快果決"], soulVerdict: "你會為值得試的事鼓起勇氣，緊張還在，腳下已經往前挪了一步。" },
      "en": { personalityTags: ["Gutsy", "Warmhearted", "Daring"], soulVerdict: "You're drawn to the moment your feet move despite the nerves still being there." },
    },
    "hufflepuff": {
      "zh": { personalityTags: ["厚道公平", "同理心", "耐心可靠"], soulVerdict: "你更乐意把一份好事做成大家都能参与的样子，每个人的投入都算数。" },
      "zh-TW": { personalityTags: ["厚道公平", "同理心", "耐心可靠"], soulVerdict: "你更喜歡大家都找得到位置的合作，每個人出的一點力，在你心裡都算數。" },
      "en": { personalityTags: ["Fair-Minded", "Patient", "Dependable"], soulVerdict: "You like shared effort best when people can take part and each person's bit counts." },
    },
    "ravenclaw": {
      "zh": { personalityTags: ["求知欲", "独到视角", "脑洞派"], soulVerdict: "你常被问题里的岔路吸引，哪怕没人催你，也想看看它会通向哪儿。" },
      "zh-TW": { personalityTags: ["求知慾", "獨到視角", "創意派"], soulVerdict: "你常被問題裡的岔路吸引，哪怕沒人催你，也想看看它會通向哪裡。" },
      "en": { personalityTags: ["Inquisitive", "Original", "Idea-Minded"], soulVerdict: "You're drawn to the question's side road just to see where it might go." },
    },
    "slytherin": {
      "zh": { personalityTags: ["谋划感", "目标清楚", "善用资源"], soulVerdict: "你更愿意把手上的时间和筹码用在自己真正在乎的方向，心里有数。" },
      "zh-TW": { personalityTags: ["謀劃感", "目標清楚", "善用資源"], soulVerdict: "你更願意把手上的時間和籌碼用在自己真正在乎的方向，心裡有底。" },
      "en": { personalityTags: ["Strategic", "Resourceful", "Purposeful"], soulVerdict: "You want your time and resources going toward a goal you actually care about." },
    },
  },
  "dungeons-dragons-class": {
    "barbarian": {
      "zh": { personalityTags: ["直爽豪气", "本能派", "热投入"], soulVerdict: "你偏爱一出手就能感到重量的冒险，热起来时连地图都像在跟着心跳。" },
      "zh-TW": { personalityTags: ["直爽豪氣", "本能派", "熱投入"], soulVerdict: "你偏愛一出手就能感到重量的冒險，熱起來時連地圖都像在跟著心跳。" },
      "en": { personalityTags: ["Instinctive", "Bold", "Hearty"], soulVerdict: "You like adventures with enough weight to feel the moment you jump in." },
    },
    "bard": {
      "zh": { personalityTags: ["舞台感", "机灵风趣", "多面派"], soulVerdict: "你喜欢把故事说活，也很享受在同伴需要时换一种好玩的帮法。" },
      "zh-TW": { personalityTags: ["舞台感", "機靈風趣", "多面派"], soulVerdict: "你喜歡把故事講得活靈活現，也愛在隊友需要時，換個有趣的方法助陣。" },
      "en": { personalityTags: ["Theatrical", "Versatile", "Witty"], soulVerdict: "You enjoy bringing a tale to life and finding a lively way to back up the party." },
    },
    "cleric": {
      "zh": { personalityTags: ["护队感", "沉稳温厚", "责任心"], soulVerdict: "你在小队故事里更容易被相互照应的时刻打动，光芒往往落在同伴身上。" },
      "zh-TW": { personalityTags: ["護隊感", "沉穩溫厚", "責任心"], soulVerdict: "你在小隊故事裡更容易被相互照應的時刻打動，光芒往往落在同伴身上。" },
      "en": { personalityTags: ["Supportive", "Steady", "Companion-Minded"], soulVerdict: "You're drawn to party moments when the spotlight falls on someone lending care." },
    },
    "druid": {
      "zh": { personalityTags: ["野性柔韧", "亲自然", "善变通"], soulVerdict: "你喜欢走进能随环境变形的故事，仿佛每一片森林都藏着别的自己。" },
      "zh-TW": { personalityTags: ["野性柔韌", "親自然", "善變通"], soulVerdict: "你喜歡走進能隨環境變形的故事，彷彿每一片森林都藏著別的自己。" },
      "en": { personalityTags: ["Nature-Minded", "Adaptable", "Fluid"], soulVerdict: "You like fantasy that changes shape with the landscape, as if each wood holds another you." },
    },
    "fighter": {
      "zh": { personalityTags: ["扎实派", "招式清楚", "稳练感"], soulVerdict: "你会为一招练熟后的干净手感着迷，越简单的动作越能看出细功。" },
      "zh-TW": { personalityTags: ["紮實派", "招式清楚", "穩練感"], soulVerdict: "你會為一招練熟後的乾淨手感著迷，越簡單的動作越能看出細功。" },
      "en": { personalityTags: ["Practiced", "Direct", "Steady Technique"], soulVerdict: "You like the clean feel of a practiced move that shows its care through simplicity." },
    },
    "monk": {
      "zh": { personalityTags: ["专注轻盈", "身法感", "敏捷派"], soulVerdict: "你喜欢靠自己的节拍穿过乱局，想象那些安静又轻快的转身。" },
      "zh-TW": { personalityTags: ["專注輕盈", "身法感", "敏捷派"], soulVerdict: "你喜歡靠自己的節拍穿過亂局，想像那些安靜又輕快的轉身。" },
      "en": { personalityTags: ["Agile", "Focused", "Light-Footed"], soulVerdict: "You like moving through a muddle on a rhythm that is quietly yours." },
    },
    "paladin": {
      "zh": { personalityTags: ["重誓心", "守护感", "正直果敢"], soulVerdict: "你更容易被自愿立下的誓言打动，尤其当它让别人也有被护住的余地。" },
      "zh-TW": { personalityTags: ["重誓心", "守護感", "正直果敢"], soulVerdict: "你更容易被自願立下的誓言打動，尤其當它讓別人也有被護住的餘地。" },
      "en": { personalityTags: ["Oath-Minded", "Protective", "Steadfast"], soulVerdict: "You're drawn to a freely chosen oath when it gives someone else room to feel safe." },
    },
    "ranger": {
      "zh": { personalityTags: ["旷野感", "路线脑", "灵动自主"], soulVerdict: "你喜欢图上留一块还没画完的地方，走进旷野时可以慢慢挑自己的路。" },
      "zh-TW": { personalityTags: ["曠野感", "路線腦", "靈動自主"], soulVerdict: "你喜歡圖上留一塊還沒畫完的地方，走進曠野時可以慢慢挑自己的路。" },
      "en": { personalityTags: ["Outdoorsy", "Resourceful", "Independent"], soulVerdict: "You like leaving a corner of the map unfinished so the wilderness stays inviting." },
    },
    "rogue": {
      "zh": { personalityTags: ["机巧派", "眼尖手细", "悄然入局"], soulVerdict: "你会被不显眼的小入口吸引，喜欢事情恰好从一条细缝里通行。" },
      "zh-TW": { personalityTags: ["機巧派", "眼尖手細", "悄然入局"], soulVerdict: "你會被不顯眼的小入口吸引，喜歡事情恰好從一條細縫裡通行。" },
      "en": { personalityTags: ["Clever", "Light-Touch", "Precise"], soulVerdict: "You notice the opening everyone missed and like slipping through it quietly." },
    },
    "sorcerer": {
      "zh": { personalityTags: ["天马行空", "直觉魔法", "随心塑形"], soulVerdict: "你偏爱从手感出发的魔法，喜欢看一个念头如何突然有了自己的形状。" },
      "zh-TW": { personalityTags: ["天馬行空", "直覺魔法", "隨心塑形"], soulVerdict: "你偏愛從手感出發的魔法，喜歡看一個念頭如何突然有了自己的形狀。" },
      "en": { personalityTags: ["Intuitive", "Expressive", "Spontaneous"], soulVerdict: "You like magic that starts with a feeling and takes shape in your own hands." },
    },
    "warlock": {
      "zh": { personalityTags: ["奇想感", "契约脑", "重视条件"], soulVerdict: "你会被契约背后的奇异故事吸引，也想看看每一纸条件究竟意味着什么。" },
      "zh-TW": { personalityTags: ["奇想感", "契約腦", "重視條件"], soulVerdict: "你會被契約背後的奇異故事吸引，也想看看每一紙條件究竟意味著什麼。" },
      "en": { personalityTags: ["Pact-Curious", "Unconventional", "Terms-Minded"], soulVerdict: "You like the strange story behind a pact enough to read what its terms imply." },
    },
    "wizard": {
      "zh": { personalityTags: ["研习派", "筹备感", "精读心"], soulVerdict: "你喜欢魔法也有能翻查的来路，出发前翻几页书就已经很有冒险感。" },
      "zh-TW": { personalityTags: ["研習派", "籌備感", "精讀心"], soulVerdict: "你喜歡魔法也有能翻查的來路，出發前翻幾頁書就已經很有冒險感。" },
      "en": { personalityTags: ["Studious", "Prepared", "Bookish"], soulVerdict: "You enjoy the spellbook before the adventure starts because preparation is part of the magic." },
    },
  },
  "game-of-thrones": {
    "jon-snow": {
      "zh": { personalityTags: ["重诺感", "沉静自持", "实在心"], soulVerdict: "你看重自己愿意认的承诺，越是周围复杂，越希望这部分明明白白。" },
      "zh-TW": { personalityTags: ["重諾感", "沉靜自持", "實在心"], soulVerdict: "你看重自己願意認的承諾，越是周圍複雜，越希望這部分明明白白。" },
      "en": { personalityTags: ["Steadfast", "Reserved", "Principled"], soulVerdict: "You value a promise you chose, especially when everything around it gets complicated." },
    },
    "tyrion-lannister": {
      "zh": { personalityTags: ["机智温和", "善找角度", "松弛感"], soulVerdict: "你喜欢在僵住的话题里换一种说法，最好还能让紧绷的人轻轻笑一下。" },
      "zh-TW": { personalityTags: ["機智溫和", "靈活觀點", "自在感"], soulVerdict: "你喜歡在聊天變僵時換個說法，最好還能讓原本緊繃的人鬆口氣。" },
      "en": { personalityTags: ["Witty", "Disarming", "Flexible"], soulVerdict: "You enjoy finding a kinder, cleverer angle when the conversation stiffens up." },
    },
    "arya-stark": {
      "zh": { personalityTags: ["自主硬气", "磨技派", "沉得住"], soulVerdict: "你愿意按自己的方式把一门技艺练熟，步子不大也有自己的痛快。" },
      "zh-TW": { personalityTags: ["自主硬氣", "磨技派", "沉得住"], soulVerdict: "你願意按自己的方式把一門技藝練熟，步子不大也有自己的痛快。" },
      "en": { personalityTags: ["Independent", "Determined", "Focused"], soulVerdict: "You like honing a skill on your own terms, step by step and without much noise." },
    },
    "sansa-stark": {
      "zh": { personalityTags: ["细腻有度", "审美派", "因地制宜"], soulVerdict: "你会留意场合怎样承接一句话，呈现方式对了，心意也更容易被听见。" },
      "zh-TW": { personalityTags: ["細膩有度", "審美派", "因地制宜"], soulVerdict: "你會留意場合怎樣承接一句話，呈現方式對了，心意也更容易被聽見。" },
      "en": { personalityTags: ["Tactful", "Discerning", "Composed"], soulVerdict: "You notice when the right way of presenting something helps its meaning land." },
    },
    "daenerys-targaryen": {
      "zh": { personalityTags: ["开阔想象", "远景感", "创意派"], soulVerdict: "你看见一幅已经画好边框的图，还会想象它再往外一点能出现什么。" },
      "zh-TW": { personalityTags: ["開闊想像", "遠景感", "創意派"], soulVerdict: "你看見一幅已經畫好邊框的圖，還會想像它再往外一點能出現什麼。" },
      "en": { personalityTags: ["Visionary", "Imaginative", "Expansive"], soulVerdict: "You see the edge of the frame and start imagining what the story could hold beyond it." },
    },
    "jaime-lannister": {
      "zh": { personalityTags: ["改主意派", "灵活求实", "清醒感"], soulVerdict: "你会给比首选更顺的办法留位置，换个主意有时比守着它更自在。" },
      "zh-TW": { personalityTags: ["改主意派", "靈活求實", "清醒感"], soulVerdict: "你會給比首選更順的辦法留位置，換個主意有時比守著它更自在。" },
      "en": { personalityTags: ["Adaptable", "Clear-Eyed", "Open to Change"], soulVerdict: "You're willing to give a better choice room when the first one stops fitting." },
    },
  },
  "greek-god": {
    "zeus": {
      "zh": { personalityTags: ["担当感", "统筹气场", "条理心"], soulVerdict: "你倾向先看大家怎么站到同一张桌边，分工能说清才有一起走的底气。" },
      "zh-TW": { personalityTags: ["擔當感", "統籌氣場", "條理心"], soulVerdict: "你傾向先看大家怎麼站到同一張桌邊，分工能說清才有一起走的底氣。" },
      "en": { personalityTags: ["Organized", "Accountable", "Coordinating"], soulVerdict: "You like the steadiness of a shared plan where everyone understands their part." },
    },
    "athena": {
      "zh": { personalityTags: ["策略脑", "周全感", "冷静推演"], soulVerdict: "你享受在不同路线之间多想几步，终于看见哪条路能走得更从容。" },
      "zh-TW": { personalityTags: ["策略腦", "思慮周到", "沉著推演"], soulVerdict: "你享受把幾條路都放在心裡走一遍，再挑那條讓自己最能從容前進的路。" },
      "en": { personalityTags: ["Strategic", "Thoughtful", "Deliberate"], soulVerdict: "You enjoy weighing a few routes until one offers a calmer way through." },
    },
    "apollo": {
      "zh": { personalityTags: ["节奏感", "表达欲", "创作心"], soulVerdict: "你常被一种刚刚好的节奏带进去，觉得即兴和表达可以相互照亮。" },
      "zh-TW": { personalityTags: ["節奏感", "表達欲", "創作心"], soulVerdict: "你常被一種剛剛好的節奏帶進去，覺得即興和表達可以相互照亮。" },
      "en": { personalityTags: ["Rhythmic", "Creative", "Expressive"], soulVerdict: "You feel at home when a rhythm gives your creative voice somewhere to go." },
    },
    "aphrodite": {
      "zh": { personalityTags: ["审美直觉", "亲和力", "细腻感"], soulVerdict: "你留意美感怎么把人拉近，有时候一抹颜色就能给交流腾出空间。" },
      "zh-TW": { personalityTags: ["審美直覺", "親和力", "細膩感"], soulVerdict: "你留意美感怎麼把人拉近，有時候一抹顏色就能給交流騰出空間。" },
      "en": { personalityTags: ["Aesthetic", "Warm", "Attuned"], soulVerdict: "You notice how a small touch of beauty can make a conversation feel closer." },
    },
    "ares": {
      "zh": { personalityTags: ["挑战感", "直爽果敢", "有分寸"], soulVerdict: "你喜欢能看清边界和规则的挑战，那份投入感对你比声势更过瘾。" },
      "zh-TW": { personalityTags: ["挑戰感", "直爽果敢", "有分寸"], soulVerdict: "你喜歡能看清邊界和規則的挑戰，那份投入感對你比聲勢更過癮。" },
      "en": { personalityTags: ["Gutsy", "Direct", "Boundaried"], soulVerdict: "You enjoy getting into a challenge whose edges you can actually see." },
    },
    "artemis": {
      "zh": { personalityTags: ["自在独行", "细察自然", "自主心"], soulVerdict: "你更享受自己选一条近自然的路，沿途能听见很多平常没听见的声响。" },
      "zh-TW": { personalityTags: ["自在獨行", "細察自然", "自主心"], soulVerdict: "你更享受自己選一條近自然的路，沿途能聽見很多平常沒聽見的聲響。" },
      "en": { personalityTags: ["Independent", "Nature-Minded", "Observant"], soulVerdict: "You like choosing your own trail and noticing what a louder walk would miss." },
    },
  },
  "past-life": {
    "scribe": {
      "zh": { personalityTags: ["记录心", "珍视细节", "沉静派"], soulVerdict: "你喜欢让当下在字里行间留个痕迹，有些事能回头读到就已经很好。" },
      "zh-TW": { personalityTags: ["記錄心", "珍視細節", "沉靜派"], soulVerdict: "你喜歡讓當下留點字跡，有些事只是能回頭再讀一遍，就已經很好。" },
      "en": { personalityTags: ["Reflective", "Record-Minded", "Detail-Oriented"], soulVerdict: "You like leaving a trace in words so a moment can be visited again." },
    },
    "potter": {
      "zh": { personalityTags: ["实用审美", "手感派", "安静用心"], soulVerdict: "你很容易被一件趁手又好看的器物吸引，希望自己的心思也用得上。" },
      "zh-TW": { personalityTags: ["實用審美", "手感派", "安靜用心"], soulVerdict: "你很容易被一件趁手又好看的器物吸引，希望自己的心思也用得上。" },
      "en": { personalityTags: ["Tactile", "Practical", "Considered"], soulVerdict: "You like the quiet pleasure of an object that feels good and fits its use." },
    },
    "printer": {
      "zh": { personalityTags: ["版式感", "耐心试印", "工整派"], soulVerdict: "你会留意一张张小样之间的差别，很享受找到那个刚好舒服的版面。" },
      "zh-TW": { personalityTags: ["版式感", "耐心試印", "工整派"], soulVerdict: "你會留意一張張雛形之間的差別，很享受找到那個剛好舒服的版面。" },
      "en": { personalityTags: ["Layout-Minded", "Patient", "Exacting"], soulVerdict: "You enjoy the quiet differences between drafts before the page finally sits right." },
    },
    "weaver": {
      "zh": { personalityTags: ["纹样直觉", "耐心细腻", "擅联想"], soulVerdict: "你喜欢看原本分开的小线索慢慢交织，到了能看见纹样时格外满足。" },
      "zh-TW": { personalityTags: ["紋樣直覺", "耐心細膩", "擅聯想"], soulVerdict: "你喜歡看原本分開的小線索慢慢交織，到了能看見紋樣時格外滿足。" },
      "en": { personalityTags: ["Pattern-Minded", "Patient", "Perceptive"], soulVerdict: "You enjoy seeing separate threads cross until an unexpected pattern shows itself." },
    },
    "drafter": {
      "zh": { personalityTags: ["构图感", "视觉细腻", "透视脑"], soulVerdict: "你对线条落在何处很有感觉，稍微改个角度，画面就像换了空气。" },
      "zh-TW": { personalityTags: ["構圖感", "視覺細膩", "透視腦"], soulVerdict: "你對線條落在何處很有感覺，稍微改個角度，畫面就像換了空氣。" },
      "en": { personalityTags: ["Composition-Minded", "Visual", "Perceptive"], soulVerdict: "You notice how a different angle or a slight line can change the air in a scene." },
    },
    "trader": {
      "zh": { personalityTags: ["交流感", "公允心", "灵活务实"], soulVerdict: "你更喜欢双方都懂也都愿意的交换，那种爽快的默契比话术有趣。" },
      "zh-TW": { personalityTags: ["交流感", "公允心", "靈活務實"], soulVerdict: "你更喜歡雙方都懂也都願意的交換，那種爽快的默契比場面話有趣。" },
      "en": { personalityTags: ["Reciprocal", "Practical", "Plainspoken"], soulVerdict: "You enjoy an exchange most when both people know what they're happy to offer." },
    },
    "chartmaker": {
      "zh": { personalityTags: ["方向感", "布局脑", "探索心"], soulVerdict: "你喜欢把散开的地标连成能想象的路径，好像一张薄纸就能装下一趟行程。" },
      "zh-TW": { personalityTags: ["方向感", "佈局腦", "探索心"], soulVerdict: "你喜歡把散開的地標連成能想像的路徑，好像一張薄紙就能裝下一趟行程。" },
      "en": { personalityTags: ["Route-Minded", "Spatial", "Curious"], soulVerdict: "You like turning scattered landmarks into a route you can picture taking." },
    },
    "naturalist": {
      "zh": { personalityTags: ["观察细密", "好奇考据", "耐心派"], soulVerdict: "你会为一个看似普通的小细节停住脚，想把它观察到的样子记下来。" },
      "zh-TW": { personalityTags: ["觀察細密", "好奇考據", "耐心派"], soulVerdict: "你會為一個看似普通的小細節停住腳，想把它觀察到的樣子記下來。" },
      "en": { personalityTags: ["Observant", "Curious", "Methodical"], soulVerdict: "You linger over small things most people pass, long enough to remember their shape." },
    },
  },
  "mythical-creature": {
    "dragon": {
      "zh": { personalityTags: ["方向感", "起势派", "鲜明果决"], soulVerdict: "你喜欢给想法一个清楚的起点，心里有了方向，火光也就跟着起来了。" },
      "zh-TW": { personalityTags: ["方向感", "果敢派", "鮮明果決"], soulVerdict: "你喜歡給想法一個清楚的起點，心裡有了方向，火光也就跟著起來了。" },
      "en": { personalityTags: ["Purposeful", "Gutsy", "Decisive"], soulVerdict: "You like the spark that follows when a scattered idea finally has a direction." },
    },
    "phoenix": {
      "zh": { personalityTags: ["重整感", "向前心", "柔韧气质"], soulVerdict: "你愿意让用过的版本落幕，因为重新开始对你可以是又一次有趣的选择。" },
      "zh-TW": { personalityTags: ["重整感", "向前心", "柔韌氣質"], soulVerdict: "你願意讓用過的版本落幕，因為重新開始對你可以是又一次有趣的選擇。" },
      "en": { personalityTags: ["Renewal-Minded", "Resilient", "Adaptable"], soulVerdict: "You're open to setting an old version down and giving the next one a new shape." },
    },
    "unicorn": {
      "zh": { personalityTags: ["奇想派", "纯粹好奇", "轻灵感"], soulVerdict: "你愿意先让一个如果在心里跑一圈，光想象它的样子就足够有趣。" },
      "zh-TW": { personalityTags: ["奇想派", "純粹好奇", "輕靈感"], soulVerdict: "你願意先讓一個如果在心裡跑一圈，光想像它的樣子就足夠有趣。" },
      "en": { personalityTags: ["Whimsical", "Open-Minded", "Imaginative"], soulVerdict: "You let a what-if gallop around in your head just to enjoy where it goes." },
    },
    "griffin": {
      "zh": { personalityTags: ["守护心", "可靠感", "讲分寸"], soulVerdict: "你看重双方愿意点头的约定，觉得可以商量的关心才让人站得稳。" },
      "zh-TW": { personalityTags: ["守護心", "可靠感", "講分寸"], soulVerdict: "你看重雙方願意點頭的約定，覺得可以商量的關心才讓人站得穩。" },
      "en": { personalityTags: ["Protective", "Dependable", "Reciprocal"], soulVerdict: "You like the steadiness of care built around something both people can agree to." },
    },
    "mermaid": {
      "zh": { personalityTags: ["共情细腻", "善倾听", "感受敏锐"], soulVerdict: "你会留意那些差点说不出口的感受，也喜欢把听懂的那部分再问清楚。" },
      "zh-TW": { personalityTags: ["感受細膩", "懂傾聽", "溫柔敏銳"], soulVerdict: "你會留意對方差點說不出口的感受，也願意輕輕回問自己有沒有聽懂。" },
      "en": { personalityTags: ["Attuned", "Expressive", "Gentle Listener"], soulVerdict: "You notice the feeling a person almost said and want to check you heard it right." },
    },
    "kraken": {
      "zh": { personalityTags: ["深思派", "独处感", "安静力量"], soulVerdict: "你喜欢留一片属于自己的深水区，等自己愿意了，再把想法带到岸上。" },
      "zh-TW": { personalityTags: ["深思派", "獨處感", "安靜力量"], soulVerdict: "你喜歡留一片屬於自己的深水區，等自己願意了，再把想法帶到岸上。" },
      "en": { personalityTags: ["Reflective", "Private", "Quietly Strong"], soulVerdict: "You keep some deep water to think in and decide when a thought comes ashore." },
    },
  },
  "spirit-animal": {
    "wolf": {
      "zh": { personalityTags: ["重诺守信", "团队主心骨", "彼此照应"], soulVerdict: "你看重说好了就并肩做到的默契，一起扛一点，大家心里都踏实。" },
      "zh-TW": { personalityTags: ["重承諾", "團隊定心丸", "互相照應"], soulVerdict: "你在乎的是說好就一起做到的默契，各自多扛一點，心裡就更踏實。" },
      "en": { personalityTags: ["Loyal Teammate", "Steady Anchor", "Dependable"], soulVerdict: "You're drawn to the trust that grows when everyone carries a little together." },
    },
    "owl": {
      "zh": { personalityTags: ["静观派", "求真心", "眼尖心细"], soulVerdict: "你更愿意先把细节看清再出声，安静的一刻常比急着猜更让你自在。" },
      "zh-TW": { personalityTags: ["沉靜觀察", "求真心", "眼尖心細"], soulVerdict: "你喜歡先把細節看清楚再開口，多給自己一點安靜，比急著猜更自在。" },
      "en": { personalityTags: ["Quiet Observer", "Discerning", "Evidence-Minded"], soulVerdict: "You like the clarity that comes from looking closely before making your move." },
    },
    "fox": {
      "zh": { personalityTags: ["机灵变通", "好奇心", "巧办法"], soulVerdict: "你发现旧办法绕不开时，反而更有兴致，想看看旁边有没有一条小路。" },
      "zh-TW": { personalityTags: ["機靈變通", "好奇心", "巧辦法"], soulVerdict: "你發現舊辦法繞不開時，反而更有興致，想看看旁邊有沒有一條小路。" },
      "en": { personalityTags: ["Quick-Witted", "Resourceful", "Flexible"], soulVerdict: "You get curious when the obvious route closes and look for a less obvious one." },
    },
    "lion": {
      "zh": { personalityTags: ["有主见", "方向清楚", "爽快果决"], soulVerdict: "你喜欢说清当下往哪走，那种大家终于知道怎么迈步的感觉很过瘾。" },
      "zh-TW": { personalityTags: ["有主見", "方向清楚", "爽快果決"], soulVerdict: "你喜歡說清當下往哪走，那種大家終於知道怎麼邁步的感覺很過癮。" },
      "en": { personalityTags: ["Decisive", "Clearheaded", "Direct"], soulVerdict: "You enjoy the moment a clear decision gives everyone somewhere to start." },
    },
    "dolphin": {
      "zh": { personalityTags: ["亲和明亮", "松弛感", "善互动"], soulVerdict: "你喜欢让交流像水面一样透气，大家都能靠近一点，也能自在游开。" },
      "zh-TW": { personalityTags: ["親和明亮", "自在感", "善互動"], soulVerdict: "你喜歡讓交流像水面一樣透氣，大家都能靠近一點，也能自在遊開。" },
      "en": { personalityTags: ["Sociable", "Easygoing", "Playful Warmth"], soulVerdict: "You like connection with room to drift closer, laugh, and ease away again." },
    },
    "deer": {
      "zh": { personalityTags: ["敏锐温柔", "感受细腻", "有边界"], soulVerdict: "你留意人心里那些微小的波动，也希望温柔有一条让自己舒服的边界。" },
      "zh-TW": { personalityTags: ["敏銳溫柔", "感受細膩", "有邊界"], soulVerdict: "你留意人心裡那些微小的波動，也希望溫柔有一條讓自己舒服的邊界。" },
      "en": { personalityTags: ["Gentle", "Attuned", "Boundaried"], soulVerdict: "You notice the small shifts in a room and still want kindness to have clear edges." },
    },
    "bear": {
      "zh": { personalityTags: ["稳当耐心", "厚实可靠", "自有节奏"], soulVerdict: "你更信慢一点也能稳稳走到头，那份守得住的节奏让自己很踏实。" },
      "zh-TW": { personalityTags: ["穩當耐心", "厚實可靠", "自有節奏"], soulVerdict: "你更信慢一點也能穩穩走到頭，那份守得住的節奏讓自己很踏實。" },
      "en": { personalityTags: ["Steady", "Patient", "Grounded"], soulVerdict: "You trust a pace you can keep and the quiet satisfaction of finishing at it." },
    },
    "eagle": {
      "zh": { personalityTags: ["全局眼光", "果断感", "开阔心"], soulVerdict: "你喜欢先飞远一点看整片地图，等方向亮出来，眼前的取舍就清楚了。" },
      "zh-TW": { personalityTags: ["全局眼光", "果斷感", "開闊心"], soulVerdict: "你喜歡先飛遠一點看整片地圖，等方向亮出來，眼前的取捨就清楚了。" },
      "en": { personalityTags: ["Big-Picture", "Discerning", "Decisive"], soulVerdict: "You like a wider view first so the tradeoffs below start to make sense." },
    },
    "otter": {
      "zh": { personalityTags: ["玩心派", "亲切自在", "轻松感"], soulVerdict: "你喜欢那种谁都可以笑着加入的小乐趣，自愿一起玩对你更有意思。" },
      "zh-TW": { personalityTags: ["玩心派", "親切自在", "輕鬆感"], soulVerdict: "你喜歡那種誰都可以笑著加入的小樂趣，自願一起玩對你更有意思。" },
      "en": { personalityTags: ["Playful", "Sociable", "Easygoing"], soulVerdict: "You enjoy small shared pleasures most when joining in is everyone's choice." },
    },
  },
  "moon-phase": {
    "new-moon": {
      "zh": { personalityTags: ["安静蓄力", "内在主见", "留白感"], soulVerdict: "你喜欢在事情开始以前先给心里留一片空地，等想做的方向自己亮起来。" },
      "zh-TW": { personalityTags: ["安靜蓄力", "內在主見", "留白感"], soulVerdict: "你喜歡在新開始前留點空白，等心裡想去的方向慢慢亮起來。" },
      "en": { personalityTags: ["Reflective", "Quiet Intention", "Unhurried"], soulVerdict: "You like giving a new beginning some quiet space to find its own intention." },
    },
    "waxing-crescent": {
      "zh": { personalityTags: ["试水派", "弹性心", "轻步感"], soulVerdict: "你享受小小开头还能改的自由，手刚碰到事情时那点新鲜尤其好玩。" },
      "zh-TW": { personalityTags: ["試水派", "彈性心", "輕步感"], soulVerdict: "你享受小小開頭還能改的自由，手剛碰到事情時那點新鮮尤其好玩。" },
      "en": { personalityTags: ["Curious", "Flexible", "Light Touch"], soulVerdict: "You like a tentative beginning whose shape is still yours to change." },
    },
    "first-quarter": {
      "zh": { personalityTags: ["取舍清晰", "果断派", "当下感"], soulVerdict: "你倾向先把此刻真正要紧的那一项挑出来，专注下来反而更轻松。" },
      "zh-TW": { personalityTags: ["取捨清晰", "果斷派", "當下感"], soulVerdict: "你傾向先把此刻真正要緊的那一項挑出來，專注下來反而更輕鬆。" },
      "en": { personalityTags: ["Decisive", "Present-Minded", "Focused"], soulVerdict: "You like choosing what matters now so the next part can have your attention." },
    },
    "waxing-gibbous": {
      "zh": { personalityTags: ["精修派", "细腻耐心", "工匠心"], soulVerdict: "你会被一处刚刚好的改动取悦，整个东西忽然更顺手，余下也不着急。" },
      "zh-TW": { personalityTags: ["精修派", "細膩耐心", "工匠心"], soulVerdict: "你會被一處剛剛好的改動取悅，整個東西忽然更順手，餘下也不著急。" },
      "en": { personalityTags: ["Refining Eye", "Patient", "Detail-Minded"], soulVerdict: "You enjoy a well-placed adjustment that makes the whole thing feel easier to use." },
    },
    "full-moon": {
      "zh": { personalityTags: ["明朗表达", "完成感", "收束心"], soulVerdict: "你喜欢为想完成的事选一个自己的亮相时刻，到了那里也能自在收尾。" },
      "zh-TW": { personalityTags: ["明朗表達", "完成感", "收束心"], soulVerdict: "你喜歡為想完成的事選一個自己的亮相時刻，到了那裡也能自在收尾。" },
      "en": { personalityTags: ["Expressive", "Completion-Minded", "Self-Directed"], soulVerdict: "You like choosing when work is ready to come into the light and feel complete." },
    },
    "waning-gibbous": {
      "zh": { personalityTags: ["温厚分享", "回望感", "有心得"], soulVerdict: "你会把走过的路里真正用得上的一点留给别人，像递出一盏小灯。" },
      "zh-TW": { personalityTags: ["溫厚分享", "回望感", "有心得"], soulVerdict: "你會把走過的路裡真正用得上的一點留給別人，像遞出一盞小燈。" },
      "en": { personalityTags: ["Generous", "Reflective", "Practical"], soulVerdict: "You like passing on one useful thing you learned, like keeping a little light lit." },
    },
    "last-quarter": {
      "zh": { personalityTags: ["清醒取舍", "轻装派", "有余裕"], soulVerdict: "你有时更喜欢把可有可无的负担放一边，日子松开一点就舒展了。" },
      "zh-TW": { personalityTags: ["清醒取捨", "輕裝派", "有餘裕"], soulVerdict: "你有時更喜歡把可有可無的負擔放一邊，日子鬆開一點就舒展了。" },
      "en": { personalityTags: ["Selective", "Clear-Eyed", "Lighthearted"], soulVerdict: "You feel the day open up when you put down a burden that was optional all along." },
    },
    "waning-crescent": {
      "zh": { personalityTags: ["静养感", "慢节奏", "温柔留白"], soulVerdict: "你偏爱给前一件事和下一件事之间留一点安静，空下来也很完整。" },
      "zh-TW": { personalityTags: ["靜養感", "慢節奏", "溫柔留白"], soulVerdict: "你偏愛給前一件事和下一件事之間留一點安靜，空下來也很完整。" },
      "en": { personalityTags: ["Restful", "Unhurried", "Gentle Pace"], soulVerdict: "You like the quiet between one thing and the next, even when nothing fills it." },
    },
  },
  "what-element-am-i": {
    "fire": {
      "zh": { personalityTags: ["明快热情", "专注感", "直觉果断"], soulVerdict: "你容易被值得一试的瞬间点亮，喜欢把热情集中在眼前这一小段。" },
      "zh-TW": { personalityTags: ["明快熱情", "專注感", "直覺果斷"], soulVerdict: "你容易被值得一試的瞬間點亮，喜歡把熱情集中在眼前這一小段。" },
      "en": { personalityTags: ["Bright", "Focused", "Quick to Spark"], soulVerdict: "You like pouring your spark into the small stretch that has your attention now." },
    },
    "water": {
      "zh": { personalityTags: ["柔韧感", "善应变", "节奏感"], soulVerdict: "你常愿意跟着情境换个流速，不同的场合可以有不同的舒服节拍。" },
      "zh-TW": { personalityTags: ["柔韌感", "靈活派", "自有節奏"], soulVerdict: "你喜歡跟著當下換個步調，不同的場合，也可以有不同的舒服速度。" },
      "en": { personalityTags: ["Fluid", "Adaptive", "Pace-Aware"], soulVerdict: "You like adjusting to the shape of a moment without losing your sense of pace." },
    },
    "earth": {
      "zh": { personalityTags: ["踏实稳重", "有耐心", "务实心"], soulVerdict: "你更能在走得通的小步骤里找到安心，踏踏实实相连就是一条路。" },
      "zh-TW": { personalityTags: ["踏實穩重", "有耐心", "務實心"], soulVerdict: "你更能在走得通的小步驟裡找到安心，踏踏實實相連就是一條路。" },
      "en": { personalityTags: ["Grounded", "Steady", "Practical"], soulVerdict: "You feel at ease when you can see how one workable step leads into the next." },
    },
    "air": {
      "zh": { personalityTags: ["联想派", "开阔心", "轻盈思路"], soulVerdict: "你会被飘进来的新联系吸引，不相干的东西靠近一点就可能有趣。" },
      "zh-TW": { personalityTags: ["聯想派", "開闊心", "輕盈思路"], soulVerdict: "你會被飄進來的新連結吸引，不相干的東西靠近一點就可能有趣。" },
      "en": { personalityTags: ["Open-Minded", "Quick Connector", "Curious"], soulVerdict: "You enjoy the breeze of one idea brushing against another that seemed unrelated." },
    },
  },
  "chiikawa": {
    "chiikawa": {
      "zh": { personalityTags: ["慢热心", "柔软感", "安静勇气"], soulVerdict: "你比较喜欢慢一点加入热闹，那些大家愿意等你的时候格外让你安心。" },
      "zh-TW": { personalityTags: ["慢熟派", "柔軟感", "安靜勇氣"], soulVerdict: "你喜歡慢一點再加入熱鬧，有人願意留個位置等你，就已經很暖。" },
      "en": { personalityTags: ["Gentle Pace", "Softhearted", "Quiet Courage"], soulVerdict: "You like joining the fun slowly and remember the people who made room for that." },
    },
    "hachiware": {
      "zh": { personalityTags: ["好聊派", "体贴心", "温柔坦白"], soulVerdict: "你喜欢两个人一起找词的感觉，话说开了，普通的小事也能被听懂。" },
      "zh-TW": { personalityTags: ["好聊派", "體貼心", "溫柔坦白"], soulVerdict: "你喜歡兩個人一起找詞的感覺，話說開了，普通的小事也能被聽懂。" },
      "en": { personalityTags: ["Warm Talker", "Considerate", "Openhearted"], soulVerdict: "You like finding words together until an ordinary little thing makes sense to both of you." },
    },
    "usagi": {
      "zh": { personalityTags: ["古怪灵动", "玩心王", "惊喜感"], soulVerdict: "你容易被一个出其不意的小玩法逗笑，还想看看大家会怎样接招。" },
      "zh-TW": { personalityTags: ["古怪靈動", "玩心王", "驚喜感"], soulVerdict: "你容易被一個出其不意的小玩法逗笑，還想看看大家會怎樣接招。" },
      "en": { personalityTags: ["Playful", "Unpredictable", "Quick-Witted"], soulVerdict: "You light up at an unexpected bit of play and want to see how others riff on it." },
    },
    "momonga": {
      "zh": { personalityTags: ["直球派", "愿望感", "鲜明可爱"], soulVerdict: "你偏爱把想要的东西大方讲出来，连一点点小任性也会带上你的味道。" },
      "zh-TW": { personalityTags: ["直球派", "願望感", "鮮明可愛"], soulVerdict: "你偏愛把想要的東西大方講出來，連一點點小任性也會帶上你的味道。" },
      "en": { personalityTags: ["Expressive", "Candid", "Playfully Bold"], soulVerdict: "You like being open about a small wish and letting it show some of your flavor." },
    },
    "kurimanju": {
      "zh": { personalityTags: ["知足派", "松弛感", "慢享型"], soulVerdict: "你会为普通小舒服留时间，杯子捧得刚好暖手，就想再多坐一会儿。" },
      "zh-TW": { personalityTags: ["知足派", "自在感", "慢享型"], soulVerdict: "你會為普通小小的舒服留時間，杯子捧得剛好暖手，就想再多坐一會兒。" },
      "en": { personalityTags: ["Unhurried", "Comfort-Loving", "Easygoing"], soulVerdict: "You like letting a little comfort last, like warming your hands on a favorite cup." },
    },
    "rakko": {
      "zh": { personalityTags: ["稳当温和", "带路感", "实用派"], soulVerdict: "你更喜欢给人一个自己试过的小办法，分享一点就足够有来有往。" },
      "zh-TW": { personalityTags: ["穩當溫和", "帶路感", "實用派"], soulVerdict: "你更喜歡給人一個自己試過的小辦法，分享一點就足夠有來有往。" },
      "en": { personalityTags: ["Helpful", "Steady", "Practical"], soulVerdict: "You enjoy sharing one thing you've actually tried and leaving the rest to them." },
    },
  },
  "tsundere-dere-type": {
    "tsundere": {
      "zh": { personalityTags: ["嘴硬心软", "傲娇味", "含蓄关心"], soulVerdict: "你有时把在意藏在一句嘴硬里，熟一点的人才容易听出那点温柔。" },
      "zh-TW": { personalityTags: ["嘴硬心軟", "傲嬌味", "含蓄體貼"], soulVerdict: "你有時把在乎藏在一句嘴硬裡，熟一點的人才聽得出那裡有多柔軟。" },
      "en": { personalityTags: ["Bashful Warmth", "Prickly Charm", "Reserved"], soulVerdict: "You may tuck your care behind a prickly line and let warmth show through slowly." },
    },
    "kuudere": {
      "zh": { personalityTags: ["冷静温柔", "淡定感", "话少心热"], soulVerdict: "你的关心常出现得很安静，一句话很平，却能让在意的人听出份量。" },
      "zh-TW": { personalityTags: ["冷靜溫柔", "淡定感", "話少心熱"], soulVerdict: "你的關心常出現得很安靜，一句話很平，卻能讓在意的人聽出分量。" },
      "en": { personalityTags: ["Coolheaded", "Quietly Warm", "Understated"], soulVerdict: "Your care may sound understated, but the words you do choose carry warmth." },
    },
    "dandere": {
      "zh": { personalityTags: ["慢热派", "细腻心", "安静真诚"], soulVerdict: "你更容易在熟悉的安静里慢慢说开，信得过的时候温柔就有了声音。" },
      "zh-TW": { personalityTags: ["慢熟派", "細膩心", "安靜真誠"], soulVerdict: "你更容易在熟悉的安靜裡慢慢說開，信得過的時候溫柔就有了聲音。" },
      "en": { personalityTags: ["Slow to Warm", "Soft-Spoken", "Sincere"], soulVerdict: "You're drawn to the kind of trust that lets a quieter warmth find its voice." },
    },
    "deredere": {
      "zh": { personalityTags: ["热乎直率", "明亮心", "亲和感"], soulVerdict: "你喜欢让善意在当下就被看见，开心见到对方时连声音都会亮一点。" },
      "zh-TW": { personalityTags: ["熱情直率", "明亮心", "親和感"], soulVerdict: "你喜歡讓善意在當下就被看見，開心見到對方時連聲音都會亮一點。" },
      "en": { personalityTags: ["Affectionate", "Bright", "Direct"], soulVerdict: "You like letting people feel your warmth right away when you're glad to see them." },
    },
  },
  "aura-color": {
    "red": {
      "zh": { personalityTags: ["鲜亮感", "直接派", "敢表达"], soulVerdict: "你更喜欢让自己的选择有一点明亮的红，心里认领的颜色不必躲在背后。" },
      "zh-TW": { personalityTags: ["鮮亮感", "直接派", "敢表達"], soulVerdict: "你更喜歡讓自己的選擇有一點明亮的紅，心裡認領的顏色不必躲在背後。" },
      "en": { personalityTags: ["Bold", "Expressive", "Color-Forward"], soulVerdict: "You like a bright, visible note of your own when a choice matters to you." },
    },
    "orange": {
      "zh": { personalityTags: ["玩心热", "创意派", "亲和力"], soulVerdict: "你喜欢热闹里还留着一点能一起创造的地方，别人的点子也可以添进来。" },
      "zh-TW": { personalityTags: ["玩心熱", "創意派", "親和力"], soulVerdict: "你喜歡熱鬧裡還留著一點能一起創造的地方，別人的點子也可以添進來。" },
      "en": { personalityTags: ["Playful", "Collaborative", "Inventive"], soulVerdict: "You like a lively room best when everyone can add something of their own." },
    },
    "yellow": {
      "zh": { personalityTags: ["好奇脑", "清楚亲切", "求知感"], soulVerdict: "你会为能问到点上的问题来劲，尤其喜欢突然把一件小事弄明白的亮。" },
      "zh-TW": { personalityTags: ["好奇腦", "清楚親切", "求知感"], soulVerdict: "你會為能問到點上的問題來勁，尤其喜歡突然把一件小事弄明白的亮。" },
      "en": { personalityTags: ["Inquisitive", "Clarity-Minded", "Bright"], soulVerdict: "You light up when one good question makes an ordinary thing finally click." },
    },
    "green": {
      "zh": { personalityTags: ["亲自然", "务实温柔", "踏实派"], soulVerdict: "你偏爱看清什么能让身边的小日子好过一点，那些平常细节也值得用心。" },
      "zh-TW": { personalityTags: ["親自然", "溫柔實在", "踏實派"], soulVerdict: "你容易發現日常哪裡能過得更舒服，身邊不起眼的小地方也值得你用心。" },
      "en": { personalityTags: ["Grounded", "Attentive", "Nature-Minded"], soulVerdict: "You notice the small conditions that make an ordinary day nicer to live in." },
    },
    "blue": {
      "zh": { personalityTags: ["清晰感", "沟通派", "沉静心"], soulVerdict: "你喜欢把心里的话说得清楚又留有余地，让听的人也能把自己的话放进来。" },
      "zh-TW": { personalityTags: ["清晰感", "溝通型", "沉靜心"], soulVerdict: "你喜歡把心裡的話說得清楚又留有餘地，讓聽的人也能把自己的話放進來。" },
      "en": { personalityTags: ["Clearspoken", "Calm", "Considerate"], soulVerdict: "You want your meaning to come through while leaving room for another voice." },
    },
    "indigo": {
      "zh": { personalityTags: ["静心细看", "内省感", "低调细腻"], soulVerdict: "你享受留一点没人打扰的时间，某些细节非得安静下来才看得见。" },
      "zh-TW": { personalityTags: ["靜心細看", "內省感", "低調細膩"], soulVerdict: "你享受留一點沒人打擾的時間，某些細節非得安靜下來才看得見。" },
      "en": { personalityTags: ["Reflective", "Observant", "Private"], soulVerdict: "You like the details that only become visible when the room gets a little quieter." },
    },
    "violet": {
      "zh": { personalityTags: ["象征心", "个人调性", "奇想派"], soulVerdict: "你常给普通东西一点只有自己懂的意思，像把私人的暗号藏进颜色里。" },
      "zh-TW": { personalityTags: ["象徵心", "個人調性", "奇想派"], soulVerdict: "你常給普通東西一點只有自己懂的意思，像把私人的暗號藏進顏色裡。" },
      "en": { personalityTags: ["Symbol-Minded", "Imaginative", "Distinctive"], soulVerdict: "You like giving ordinary things a private meaning, like hiding a signal in a color." },
    },
  },
  "my-little-pony-character-quiz": {
    "twilight-sparkle": {
      "zh": { personalityTags: ["求知心", "细致认真", "共同感"], soulVerdict: "你喜欢先带一个好问题进来，再和朋友一起找答案，亲自参与才过瘾。" },
      "zh-TW": { personalityTags: ["求知心", "細緻認真", "共同感"], soulVerdict: "你喜歡先帶一個好問題進來，再和朋友一起找答案，親自參與才過癮。" },
      "en": { personalityTags: ["Curious", "Prepared", "Participatory"], soulVerdict: "You like bringing a good question and then getting involved in the search yourself." },
    },
    "rainbow-dash": {
      "zh": { personalityTags: ["义气心", "明快果敢", "靠得住"], soulVerdict: "你更喜欢让朋友知道你会来，而不只听见一句听起来很帅的承诺。" },
      "zh-TW": { personalityTags: ["義氣心", "明快果敢", "靠得住"], soulVerdict: "你更喜歡讓朋友知道你會來，而不只聽見一句聽起來很帥的承諾。" },
      "en": { personalityTags: ["Steadfast", "Spirited", "Dependable"], soulVerdict: "You like friendship best when a bold promise comes with someone who shows up." },
    },
    "applejack": {
      "zh": { personalityTags: ["厚道实在", "重诺感", "朴素担当"], soulVerdict: "你觉得一句答应能落实到日常的小事上，才有那种让人安心的重量。" },
      "zh-TW": { personalityTags: ["厚道實在", "重諾感", "樸素擔當"], soulVerdict: "你覺得一句答應能落實到日常的小事上，才有那種讓人安心的重量。" },
      "en": { personalityTags: ["Down-to-Earth", "Reliable", "Plainspoken"], soulVerdict: "You trust the weight of a plain promise when it shows up in ordinary things." },
    },
    "rarity": {
      "zh": { personalityTags: ["审美细腻", "周全心", "巧思感"], soulVerdict: "你喜欢让一个细节刚好对上某个人的心意，觉得被懂比被惊艳更难得。" },
      "zh-TW": { personalityTags: ["審美細膩", "周全心", "巧思感"], soulVerdict: "你喜歡讓一個細節剛好對上某個人的心意，覺得被懂比被驚豔更難得。" },
      "en": { personalityTags: ["Tasteful", "Considerate", "Detail-Minded"], soulVerdict: "You like that one thoughtful detail that makes someone feel known, not just impressed." },
    },
    "pinkie-pie": {
      "zh": { personalityTags: ["玩心明亮", "善带气氛", "亲切自在"], soulVerdict: "你最喜欢的热闹谁都可以笑着走进来，不想参加的人也能自在一点。" },
      "zh-TW": { personalityTags: ["玩心明亮", "善帶氣氛", "親切自在"], soulVerdict: "你最喜歡的熱鬧誰都可以笑著走進來，不想參加的人也能自在一點。" },
      "en": { personalityTags: ["Bubbly", "Playful Host", "Welcoming"], soulVerdict: "You like a party that feels easy to join and just as easy to sit out." },
    },
    "fluttershy": {
      "zh": { personalityTags: ["温柔慢热", "细心感", "舒服节拍"], soulVerdict: "你更愿意把邀请放得轻一点，给需要慢一点的人留下自己的步子。" },
      "zh-TW": { personalityTags: ["溫柔慢熟", "細膩感", "舒服步調"], soulVerdict: "你會把邀請說得輕一點，留給需要慢慢適應的人一個舒服的步調。" },
      "en": { personalityTags: ["Soft-Spoken", "Attuned", "Patient"], soulVerdict: "You make room for someone to join at their own pace, with no rush in your voice." },
    },
  },
  "flower": {
    "rose": {
      "zh": { personalityTags: ["郑重心意", "细腻热情", "讲究感"], soulVerdict: "你喜欢让一个精心选中的小细节多说一点，有些在意值得郑重地放好。" },
      "zh-TW": { personalityTags: ["鄭重心意", "細膩熱情", "講究感"], soulVerdict: "你喜歡讓一個精心選中的小細節多說一點，有些在意值得鄭重地放好。" },
      "en": { personalityTags: ["Intentional", "Warmhearted", "Detail-Minded"], soulVerdict: "You like one carefully chosen detail to carry the care you want someone to feel." },
    },
    "sunflower": {
      "zh": { personalityTags: ["开朗感", "亲和心", "热情周到"], soulVerdict: "你偏爱那种靠近就觉得好加入的暖意，也喜欢替别人留个晒得到光的位置。" },
      "zh-TW": { personalityTags: ["開朗感", "親和心", "熱情周到"], soulVerdict: "你偏愛那種靠近就覺得好加入的暖意，也喜歡替別人留個曬得到光的位置。" },
      "en": { personalityTags: ["Sunny", "Inclusive", "Warmhearted"], soulVerdict: "You like warmth with a place open beside it, so someone else can join in easily." },
    },
    "lavender": {
      "zh": { personalityTags: ["松弛感", "安静温柔", "有留白"], soulVerdict: "你更享受不用把话说完的时刻，安静本身也可以让人觉得被好好接住。" },
      "zh-TW": { personalityTags: ["自在感", "安靜溫柔", "有留白"], soulVerdict: "你喜歡不用把每個停頓都填滿的相處，安靜一下也覺得有人接得住。" },
      "en": { personalityTags: ["Calm", "Understated", "Gentle"], soulVerdict: "You enjoy the kind of quiet where nobody has to fill a pause to feel welcome." },
    },
    "lotus": {
      "zh": { personalityTags: ["内省心", "重过程", "温柔韧劲"], soulVerdict: "你会回味经历前后不一样的地方，有些意义过了一阵才慢慢浮到水面。" },
      "zh-TW": { personalityTags: ["內省心", "重過程", "溫柔韌勁"], soulVerdict: "你會回味經歷前後不一樣的地方，有些意義過了一陣才慢慢浮到水面。" },
      "en": { personalityTags: ["Reflective", "Patient", "Meaning-Minded"], soulVerdict: "You like noticing how an experience changes shape once you've had time to sit with it." },
    },
    "orchid": {
      "zh": { personalityTags: ["品味鲜明", "审美眼", "细致讲究"], soulVerdict: "你更爱一个恰好对味的细节，光那一点就足够把你的喜好说得很清楚。" },
      "zh-TW": { personalityTags: ["品味鮮明", "審美眼", "細緻講究"], soulVerdict: "你更愛一個恰好對味的細節，光那一點就足夠把你的喜好說得很清楚。" },
      "en": { personalityTags: ["Distinctive", "Exacting", "Tasteful"], soulVerdict: "You prefer one detail with exactly the right feel over a whole room full of display." },
    },
    "daisy": {
      "zh": { personalityTags: ["轻巧心", "自在可爱", "日常乐天"], soulVerdict: "你会为了一个不太完美的小开心停下来，因为它轻轻的，反而容易长久。" },
      "zh-TW": { personalityTags: ["輕巧心", "自在可愛", "日常樂天"], soulVerdict: "你會為了一個不太完美的小開心停下來，因為它輕輕的，反而容易長久。" },
      "en": { personalityTags: ["Easygoing", "Lighthearted", "Everyday Joy"], soulVerdict: "You enjoy the small, slightly imperfect pleasures that are easy to carry through a day." },
    },
  },
  "barbie-character": {
    "barbie": {
      "zh": { personalityTags: ["新鲜视角", "好奇心", "明亮感"], soulVerdict: "你喜欢给已经看惯的东西再一次机会，熟悉里总有新的地方可以喜欢。" },
      "zh-TW": { personalityTags: ["新鮮視角", "好奇心", "明亮感"], soulVerdict: "你喜歡給已經看慣的東西再一次機會，熟悉裡總有新的地方可以喜歡。" },
      "en": { personalityTags: ["Fresh-Eyed", "Curious", "Openhearted"], soulVerdict: "You like giving the familiar another look, just in case there's something new to love." },
    },
    "ken": {
      "zh": { personalityTags: ["自主心", "兴趣派", "轻松探索"], soulVerdict: "你更享受发现一件自己真喜欢的事，那份喜欢不必拿谁的眼光来换。" },
      "zh-TW": { personalityTags: ["自主心", "興趣派", "輕鬆探索"], soulVerdict: "你更享受發現一件自己真喜歡的事，那份喜歡不必拿誰的眼光來換。" },
      "en": { personalityTags: ["Self-Directed", "Curious", "Easygoing"], soulVerdict: "You enjoy discovering an interest that feels yours without needing anyone else's approval." },
    },
    "gloria": {
      "zh": { personalityTags: ["生活感", "细腻创意", "有共鸣"], soulVerdict: "你喜欢把日常里没被讲出来的小事带进创作，认真看一眼就有了光。" },
      "zh-TW": { personalityTags: ["生活感", "細膩創意", "有共鳴"], soulVerdict: "你喜歡把日常裡沒被講出來的小事帶進創作，認真看一眼就有了光。" },
      "en": { personalityTags: ["Down-to-Earth", "Expressive", "Observant"], soulVerdict: "You like bringing an ordinary bit of life into a story and giving it the light it deserves." },
    },
    "president-barbie": {
      "zh": { personalityTags: ["统筹感", "公允心", "主场气质"], soulVerdict: "你偏爱大家都能参与商量的安排，连简单的午后也可以舒服地走在一起。" },
      "zh-TW": { personalityTags: ["統籌感", "公允心", "主場氣質"], soulVerdict: "你偏愛大家都能參與商量的安排，連簡單的午後也可以舒服地走在一起。" },
      "en": { personalityTags: ["Organized", "Inclusive", "Decisive"], soulVerdict: "You like a plan for the afternoon that everyone gets a real say in shaping." },
    },
    "weird-barbie": {
      "zh": { personalityTags: ["怪点子", "脑洞派", "不拘一格"], soulVerdict: "你特别喜欢没人看好的材料，翻个面，没准就是你最想用的那一块。" },
      "zh-TW": { personalityTags: ["怪點子", "創意腦", "不拘一格"], soulVerdict: "你很喜歡拿大家沒看上的材料翻面試試，說不定那正是你最想用的一塊。" },
      "en": { personalityTags: ["Unconventional", "Resourceful", "Whimsical"], soulVerdict: "You see a favorite idea hiding in the thing everyone else left on the table." },
    },
    "allan": {
      "zh": { personalityTags: ["包容心", "低调派", "温和自在"], soulVerdict: "你愿意给主题之外的那点小贡献留个位子，因为好玩有时候就从旁边来。" },
      "zh-TW": { personalityTags: ["包容心", "低調派", "溫和自在"], soulVerdict: "你願意給主題之外的那點小貢獻留個位子，因為好玩有時候就從旁邊來。" },
      "en": { personalityTags: ["Inclusive", "Low-Key", "Openhearted"], soulVerdict: "You like making space for one off-theme idea because the fun may arrive sideways." },
    },
  },
  "aesthetic-core-test": {
    "cottagecore": {
      "zh": { personalityTags: ["手作感", "暖调心", "田园松弛"], soulVerdict: "你偏爱温暖花纹和手作留下的痕迹，光看着就像日子愿意慢下来。" },
      "zh-TW": { personalityTags: ["手作感", "暖色調", "田園鬆弛"], soulVerdict: "你偏愛溫暖花紋和手作留下的痕跡，光看著就像日子願意慢下來。" },
      "en": { personalityTags: ["Homespun", "Cozy", "Pattern-Loving"], soulVerdict: "You like warm patterns and handmade texture that make the day feel like it can slow down." },
    },
    "dark-academia": {
      "zh": { personalityTags: ["书卷气", "古典感", "深调审美"], soulVerdict: "你容易被深色和纸张的层次吸引，喜欢一眼看过去像藏着一段故事。" },
      "zh-TW": { personalityTags: ["書卷氣", "古典感", "深調審美"], soulVerdict: "你容易被深色和紙張的層次吸引，喜歡一眼看過去像藏著一段故事。" },
      "en": { personalityTags: ["Bookish", "Moody", "Classical"], soulVerdict: "You like deep color and the feel of paper, as if a scene were holding a story in reserve." },
    },
    "clean-girl": {
      "zh": { personalityTags: ["清透感", "极简派", "留白控"], soulVerdict: "你偏爱浅色和干净的轮廓，留一块没填满的地方，眼睛也会松口气。" },
      "zh-TW": { personalityTags: ["清透感", "極簡派", "留白控"], soulVerdict: "你偏愛淺色和乾淨的輪廓，留一塊沒填滿的地方，眼睛也會鬆一口氣。" },
      "en": { personalityTags: ["Minimal", "Airy", "Clean-Lined"], soulVerdict: "You like pale tones and clean lines with enough blank space for your eye to rest." },
    },
    "coastal-grandmother": {
      "zh": { personalityTags: ["慵懒海岸", "清爽感", "松弛派"], soulVerdict: "你会为浅蓝、布纹和疏亮的条纹停一会儿，像先替自己吹了阵海风。" },
      "zh-TW": { personalityTags: ["慵懶海岸", "清爽感", "鬆弛派"], soulVerdict: "你會為淺藍、布紋和疏亮的條紋停一會兒，像先替自己吹了陣海風。" },
      "en": { personalityTags: ["Breezy", "Relaxed", "Coastal Ease"], soulVerdict: "You like pale blue and loose fabric as if a bit of sea air came in with them." },
    },
    "goblincore": {
      "zh": { personalityTags: ["苔色调", "奇趣心", "自然乱序"], soulVerdict: "你喜欢野地里不大规整的东西，越不起眼的形状有时越让你好奇。" },
      "zh-TW": { personalityTags: ["苔色調", "奇趣心", "自然不羈"], soulVerdict: "你偏愛野地裡長得不太規則的東西，形狀愈不起眼，有時你愈想停下來看。" },
      "en": { personalityTags: ["Mossy", "Playfully Odd", "Nature-Minded"], soulVerdict: "You enjoy the odd little shapes out in the moss that most people walk past." },
    },
    "cyberpunk": {
      "zh": { personalityTags: ["霓虹感", "未来眼", "暗调派"], soulVerdict: "你偏爱暗色里冲出来的一道亮线，冷冷的未来感也可以有自己的热度。" },
      "zh-TW": { personalityTags: ["霓虹感", "未來眼", "暗調派"], soulVerdict: "你偏愛暗色裡衝出來的一道亮線，冷冷的未來感也可以有自己的熱度。" },
      "en": { personalityTags: ["Futuristic", "Neon-Toned", "High-Contrast"], soulVerdict: "You like a bright artificial line cutting through dark space with heat of its own." },
    },
  },
  "what-dog-breed-am-i": {
    "golden-retriever": {
      "zh": { personalityTags: ["热心社牛", "亲和感", "柔软有界"], soulVerdict: "你喜欢让人进来就感觉有人欢迎，也在意自己有没有余力陪到最后。" },
      "zh-TW": { personalityTags: ["熱情好聊", "好親近", "溫柔有界"], soulVerdict: "你喜歡讓剛來的人感覺有人歡迎，也會留點力氣給自己。" },
      "en": { personalityTags: ["Welcoming", "Warmhearted", "Boundaried"], soulVerdict: "You enjoy helping people feel welcome and keeping enough energy for yourself too." },
    },
    "border-collie": {
      "zh": { personalityTags: ["专注劲", "磨技心", "有目标"], soulVerdict: "你一旦对什么来劲，就喜欢给它一个练得出来的小目标，好看到变化。" },
      "zh-TW": { personalityTags: ["專注勁", "磨技心", "有目標"], soulVerdict: "你一旦對什麼來勁，就喜歡給它一個練得出來的小目標，好看到變化。" },
      "en": { personalityTags: ["Focused", "Practice-Minded", "Purposeful"], soulVerdict: "You like giving a new interest a goal small enough to practice and see it change." },
    },
    "husky": {
      "zh": { personalityTags: ["野路子", "自由派", "探路心"], soulVerdict: "你更喜欢出门时行程还留一个问号，路上遇到什么就由自己的兴趣带。" },
      "zh-TW": { personalityTags: ["野路子", "自由派", "探路心"], soulVerdict: "你更喜歡出門時行程還留一個問號，路上遇到什麼就由自己的興趣帶。" },
      "en": { personalityTags: ["Free-Spirited", "Adventurous", "Independent"], soulVerdict: "You like plans with a question mark so your curiosity can decide where to turn." },
    },
    "german-shepherd": {
      "zh": { personalityTags: ["可靠担当", "有章法", "善商量"], soulVerdict: "你看重讲得清楚的约定，也愿意听到情况变了以后大家怎么重新谈。" },
      "zh-TW": { personalityTags: ["可靠擔當", "有章法", "善商量"], soulVerdict: "你看重講得清楚的約定，也願意聽到情況變了以後大家怎麼重新談。" },
      "en": { personalityTags: ["Dependable", "Structured", "Flexible"], soulVerdict: "You like a clear agreement and room for another conversation when things change." },
    },
    "pug": {
      "zh": { personalityTags: ["松弛派", "务实可爱", "有分寸"], soulVerdict: "你比较喜欢轻巧一点的日常，知道自己愿意给多少，也知道哪儿好玩。" },
      "zh-TW": { personalityTags: ["鬆弛派", "務實可愛", "有分寸"], soulVerdict: "你比較喜歡輕巧一點的日常，知道自己願意給多少，也知道哪裡好玩。" },
      "en": { personalityTags: ["Easygoing", "Grounded", "Light Touch"], soulVerdict: "You like making the day feel lighter while being honest about what you can give." },
    },
    "chihuahua": {
      "zh": { personalityTags: ["坦然直球", "有主见", "有分寸"], soulVerdict: "你更愿意直接说出自己在意什么，也乐意停一下听对方怎么想。" },
      "zh-TW": { personalityTags: ["坦然直球", "有主見", "有分寸"], soulVerdict: "你更願意直接說出自己在意什麼，也樂意停一下聽對方怎麼想。" },
      "en": { personalityTags: ["Candid", "Self-Possessed", "Considerate"], soulVerdict: "You like stating what matters to you and giving the other person room to answer." },
    },
  },
  "gilmore-girls": {
    "lorelai-gilmore": {
      "zh": { personalityTags: ["话题灵动", "风趣派", "亲切感"], soulVerdict: "你喜欢让交谈忽然有了来回，好像一句随口的话也能让整桌活起来。" },
      "zh-TW": { personalityTags: ["話題靈活", "風趣派", "好親近"], soulVerdict: "你喜歡話接話的熱鬧，隨口丟出一個梗，整桌人就跟著活起來。" },
      "en": { personalityTags: ["Witty", "Sociable", "Quick-Witted"], soulVerdict: "You like the moment a stray remark gives the whole table something to riff on." },
    },
    "rory-gilmore": {
      "zh": { personalityTags: ["书卷气", "求知心", "深读派"], soulVerdict: "你会顺着一个让你在意的问题再读一点，等原本模糊的地方慢慢清楚。" },
      "zh-TW": { personalityTags: ["書卷氣", "求知心", "深讀派"], soulVerdict: "你會順著一個讓你在意的問題再讀一點，等原本模糊的地方慢慢清楚。" },
      "en": { personalityTags: ["Bookish", "Inquisitive", "Reflective"], soulVerdict: "You like reading a little further until the part that puzzled you comes into focus." },
    },
    "emily-gilmore": {
      "zh": { personalityTags: ["场面感", "细节考究", "端稳派"], soulVerdict: "你会为一个场合挑出恰到好处的样子，仪式感藏在别人不太注意的地方。" },
      "zh-TW": { personalityTags: ["場面感", "細節考究", "端穩派"], soulVerdict: "你會為一個場合挑出恰到好處的樣子，儀式感藏在別人不太注意的地方。" },
      "en": { personalityTags: ["Composed", "Considered", "Tasteful"], soulVerdict: "You like giving an occasion a thoughtful shape, down to the details people barely notice." },
    },
    "lane-kim": {
      "zh": { personalityTags: ["自有品味", "慢热心", "真实感"], soulVerdict: "你会挑一个时机把自己的口味分享一点，那份被听到的感觉很珍贵。" },
      "zh-TW": { personalityTags: ["自有品味", "慢熟心", "真實感"], soulVerdict: "你會挑一個時機把自己的口味分享一點，那份被聽到的感覺很珍貴。" },
      "en": { personalityTags: ["Tasteful", "Self-Directed", "Understated"], soulVerdict: "You like sharing one corner of your taste when it feels right to let someone in." },
    },
    "paris-geller": {
      "zh": { personalityTags: ["目标感", "直爽认真", "有交代"], soulVerdict: "你喜欢把要做的事说得具体，然后踏踏实实给这句话一个像样的结尾。" },
      "zh-TW": { personalityTags: ["目標感", "直爽認真", "有交代"], soulVerdict: "你喜歡把要做的事說得具體，然後踏踏實實給這句話一個像樣的結尾。" },
      "en": { personalityTags: ["Direct", "Focused", "Gets Things Done"], soulVerdict: "You like a commitment you can state plainly and give a good, solid finish." },
    },
    "sookie-st-james": {
      "zh": { personalityTags: ["热心手巧", "待客心", "讲究味"], soulVerdict: "你喜欢亲手做出一件能让别人享受的东西，看对方乐在其中你也开心。" },
      "zh-TW": { personalityTags: ["熱心手巧", "待客心", "講究味"], soulVerdict: "你喜歡親手做出一件能讓別人享受的東西，看對方樂在其中你也開心。" },
      "en": { personalityTags: ["Hands-On", "Generous", "Detail-Minded"], soulVerdict: "You like making something with care and getting to see someone genuinely enjoy it." },
    },
  },
  "gossip-girl": {
    "serena": {
      "zh": { personalityTags: ["松弛亲和", "明亮感", "轻快派"], soulVerdict: "你更愿意让邀请听起来轻松一点，好点子可以走进来，不必先打扮得完美。" },
      "zh-TW": { personalityTags: ["鬆弛親和", "明亮感", "輕快派"], soulVerdict: "你更願意讓邀請聽起來輕鬆一點，好點子可以走進來，不必先打扮得完美。" },
      "en": { personalityTags: ["Easygoing", "Welcoming", "Bright"], soulVerdict: "You like an invitation that lets a good idea walk in without dressing it up first." },
    },
    "blair": {
      "zh": { personalityTags: ["秩序美感", "有章法", "讲究派"], soulVerdict: "你偏爱让一份共同的作品有看得懂的形状，细节跟主意合拍最让你满足。" },
      "zh-TW": { personalityTags: ["秩序美感", "有章法", "講究派"], soulVerdict: "你偏愛讓一份共同的作品有看得懂的形狀，細節跟主意合拍最讓你滿足。" },
      "en": { personalityTags: ["Structured", "Tasteful", "Deliberate"], soulVerdict: "You like giving a shared project a recognizable shape and details that fit it." },
    },
    "dan": {
      "zh": { personalityTags: ["叙事眼", "深思派", "用词细腻"], soulVerdict: "你会为虚构人物留一段能好好说话的地方，连一个视角的转弯都值得琢磨。" },
      "zh-TW": { personalityTags: ["敘事眼", "深思派", "用詞細膩"], soulVerdict: "你會為虛構人物留一段能好好說話的地方，連一個視角的轉彎都值得琢磨。" },
      "en": { personalityTags: ["Reflective", "Word-Minded", "Observant"], soulVerdict: "You like taking time to give a fictional voice room to sound like itself." },
    },
    "nate": {
      "zh": { personalityTags: ["善倾听", "温厚感", "公允心"], soulVerdict: "你更愿意听两个版本分别从哪儿来，暂时悬着的判断也能让对话舒服一点。" },
      "zh-TW": { personalityTags: ["懂傾聽", "溫厚感", "公平心"], soulVerdict: "你會想把兩邊的來由都聽完再下判斷，讓對話多喘一口氣也很好。" },
      "en": { personalityTags: ["Evenhanded", "Attentive", "Unhurried"], soulVerdict: "You like hearing where both versions come from before settling on a judgment." },
    },
    "chuck": {
      "zh": { personalityTags: ["现实感", "范围清楚", "果决派"], soulVerdict: "你更在意手里真有多少筹码，能把一件成得了的事做好，胜过场面漂亮。" },
      "zh-TW": { personalityTags: ["現實感", "範圍清楚", "果決派"], soulVerdict: "你更在意手裡真有多少籌碼，能把一件成得了的事做好，勝過場面漂亮。" },
      "en": { personalityTags: ["Pragmatic", "Decisive", "Scope-Savvy"], soulVerdict: "You like picking what the group can really make over what merely sounds impressive." },
    },
    "jenny": {
      "zh": { personalityTags: ["手作心", "有型派", "巧思感"], soulVerdict: "你喜欢给手里那件东西加一笔自己的味道，哪怕不过是一点小小变样。" },
      "zh-TW": { personalityTags: ["手作心", "有型派", "巧思感"], soulVerdict: "你喜歡給手裡那件東西加一筆自己的味道，哪怕不過是一點小小變樣。" },
      "en": { personalityTags: ["Hands-On", "Distinctive", "Inventive"], soulVerdict: "You enjoy adding a touch of your style even when the change is barely an inch wide." },
    },
  },
  "amazing-digital-circus": {
    "pomni": {
      "zh": { personalityTags: ["细心入局", "求清楚", "谨慎好奇"], soulVerdict: "你更喜欢先弄清楚从哪儿进去，有了一个看得懂的入口才好放心玩。" },
      "zh-TW": { personalityTags: ["細心入局", "求清楚", "謹慎好奇"], soulVerdict: "你更喜歡先弄清楚從哪裡進去，有了一個看得懂的入口才好放心玩。" },
      "en": { personalityTags: ["Cautiously Curious", "Observant", "Practical"], soulVerdict: "You like seeing a clear way into an activity before you feel ready to play." },
    },
    "jax": {
      "zh": { personalityTags: ["怪趣味", "顽皮心", "脑洞派"], soulVerdict: "你喜欢荒唐一点的玩法，最好大家都能笑着加入，也能说这回先不来。" },
      "zh-TW": { personalityTags: ["怪趣味", "頑皮心", "創意腦"], soulVerdict: "你愛玩一點荒謬的梗，大家想跟就跟，這次不想玩也一樣好玩。" },
      "en": { personalityTags: ["Mischievous", "Whimsical", "Playful"], soulVerdict: "You like absurd fun best when everyone gets to decide whether to play along." },
    },
    "ragatha": {
      "zh": { personalityTags: ["好客心", "温柔有界", "亲切周到"], soulVerdict: "你更喜欢让欢迎照顾到每个人真的想不想来，那份温柔对你很要紧。" },
      "zh-TW": { personalityTags: ["好客心", "溫柔有界", "親切周到"], soulVerdict: "你更喜歡讓歡迎照顧到每個人真的想不想來，那份溫柔對你很要緊。" },
      "en": { personalityTags: ["Welcoming", "Considerate", "Respectful"], soulVerdict: "You like a warm welcome that still has room for what each person actually wants." },
    },
    "gangle": {
      "zh": { personalityTags: ["氛围感", "色彩心", "细腻表达"], soulVerdict: "你会为一个场景挑出自己的颜色，觉得有些心情从画面里说出来更自然。" },
      "zh-TW": { personalityTags: ["氛圍感", "色彩心", "細膩表達"], soulVerdict: "你會為一個場景挑出自己的顏色，覺得有些心情從畫面裡說出來更自然。" },
      "en": { personalityTags: ["Visual", "Expressive", "Atmospheric"], soulVerdict: "You like choosing a visual tone that says what ordinary words don't quite catch." },
    },
    "kinger": {
      "zh": { personalityTags: ["细节直觉", "静观派", "好奇心"], soulVerdict: "你会被普通场景里不起眼的一点抓住目光，安静多看一眼也很有趣。" },
      "zh-TW": { personalityTags: ["細節直覺", "靜觀派", "好奇心"], soulVerdict: "你會被普通場景裡不起眼的一點抓住目光，安靜多看一眼也很有趣。" },
      "en": { personalityTags: ["Observant", "Quietly Curious", "Reflective"], soulVerdict: "You notice an unassuming detail and like giving it a little longer in the spotlight." },
    },
    "zooble": {
      "zh": { personalityTags: ["清楚边界", "个人调性", "自在派"], soulVerdict: "你更想自己决定用什么方式加入，玩得自在的时候才有意思。" },
      "zh-TW": { personalityTags: ["清楚邊界", "個人調性", "自在派"], soulVerdict: "你更想自己決定用什麼方式加入，玩得自在的時候才有意思。" },
      "en": { personalityTags: ["Self-Directed", "Boundaried", "Independent"], soulVerdict: "You like joining on terms you chose so the fun has enough space to feel like yours." },
    },
  },
  "anime-character-archetype-test": {
    "lead": {
      "zh": { personalityTags: ["开场感", "敢迈步", "有担当"], soulVerdict: "你偏爱由一个大家都点头的小开头把故事带起来，迈出去就有了气氛。" },
      "zh-TW": { personalityTags: ["開場感", "敢邁步", "有擔當"], soulVerdict: "你偏愛由一個大家都點頭的小開頭把故事帶起來，邁出去就有了氣氛。" },
      "en": { personalityTags: ["Bold Starter", "Engaged", "Grounded"], soulVerdict: "You like the moment a small agreed beginning finally gives the story somewhere to go." },
    },
    "challenger": {
      "zh": { personalityTags: ["友善锋芒", "求比较", "有主见"], soulVerdict: "你会想给另一个做法一个认真上场的机会，哪怕它刚开始看起来有点怪。" },
      "zh-TW": { personalityTags: ["友善鋒芒", "求比較", "有主見"], soulVerdict: "你會想給另一個做法一個認真上場的機會，哪怕它剛開始看起來有點怪。" },
      "en": { personalityTags: ["Curious Challenger", "Fair-Minded", "Direct"], soulVerdict: "You like giving an alternative a fair shot even when it looks odd at first." },
    },
    "pathfinder": {
      "zh": { personalityTags: ["叙事感", "联想心", "条理清楚"], soulVerdict: "你喜欢让故事里的线索在地图上慢慢接起来，连得上时看着格外舒服。" },
      "zh-TW": { personalityTags: ["敘事感", "聯想心", "條理清楚"], soulVerdict: "你喜歡讓故事裡的線索在地圖上慢慢接起來，連得上時看著格外舒服。" },
      "en": { personalityTags: ["Story-Minded", "Connecting Eye", "Organized"], soulVerdict: "You like seeing the connections in a story come together until the route feels clear." },
    },
    "guide": {
      "zh": { personalityTags: ["温厚感", "讲解派", "有分寸"], soulVerdict: "你愿意在别人想看时递来一个例子，喜欢帮到刚刚好就把空间还回去。" },
      "zh-TW": { personalityTags: ["溫厚感", "講解派", "有分寸"], soulVerdict: "你願意在別人想看時遞來一個例子，喜歡幫到剛剛好就把空間還回去。" },
      "en": { personalityTags: ["Patient", "Considerate", "Practical Guide"], soulVerdict: "You prefer offering a useful example when it's wanted and then letting someone try." },
    },
    "improviser": {
      "zh": { personalityTags: ["即兴心", "巧手派", "古怪机灵"], soulVerdict: "你爱看到一件小道具突然能派上完全不同的用场，脑子一下就活了。" },
      "zh-TW": { personalityTags: ["即興心", "巧手派", "古靈精怪"], soulVerdict: "你最愛小道具突然派上完全不同的用場，那個瞬間連腦袋也跟著亮起來。" },
      "en": { personalityTags: ["Inventive", "Playful", "Resourceful"], soulVerdict: "You light up when an ordinary prop suddenly has a second, surprising use." },
    },
    "keeper": {
      "zh": { personalityTags: ["重诺心", "稳当派", "同伴感"], soulVerdict: "你更喜欢经过商量的约定，大家可以再次点头，也知道彼此还在场。" },
      "zh-TW": { personalityTags: ["重諾心", "穩當派", "同伴感"], soulVerdict: "你更喜歡經過商量的約定，大家可以再次點頭，也知道彼此還在場。" },
      "en": { personalityTags: ["Dependable", "Reciprocal", "Steady"], soulVerdict: "You like the trust in an agreement that everyone gets to choose again." },
    },
  },
  "wojak": {
    "feels-guy": {
      "zh": { personalityTags: ["共鸣派", "细腻感", "有温度"], soulVerdict: "你看见一张图正好说中某个瞬间，会心一笑之后，也把自己留得更完整。" },
      "zh-TW": { personalityTags: ["共鳴派", "細膩感", "有溫度"], soulVerdict: "你看見一張圖正好說中某個瞬間，會心一笑之後，也把自己留得更完整。" },
      "en": { personalityTags: ["Attuned", "Reflective", "Softhearted"], soulVerdict: "You like when a meme catches one real feeling without needing to tell your whole story." },
    },
    "bloomer": {
      "zh": { personalityTags: ["安静乐天", "稳步派", "低调韧劲"], soulVerdict: "你偏爱小而踏实的好转，安静地把一天过顺，比喊口号更有劲。" },
      "zh-TW": { personalityTags: ["安靜樂天", "穩步派", "低調韌性"], soulVerdict: "你喜歡安安靜靜把一天過順，小日子真的變好一點，比喊得大聲更過癮。" },
      "en": { personalityTags: ["Quiet Optimist", "Steady Rebuilder", "Low-Drama"], soulVerdict: "You tune out the hype and quietly rebuild one good day at a time." },
    },
    "doomer": {
      "zh": { personalityTags: ["冷幽默", "清醒派", "低调锋芒"], soulVerdict: "你很会听出话里的过度热闹，偶尔一句干干的回应就把它带回地面。" },
      "zh-TW": { personalityTags: ["冷幽默", "清醒派", "低調鋒芒"], soulVerdict: "你很會聽出話裡的過度熱鬧，偶爾一句冷冷的吐槽就把它帶回地面。" },
      "en": { personalityTags: ["Dry Wit", "Clear-Eyed", "Understated"], soulVerdict: "You hear the hype rising and enjoy the one dry line that brings it back to earth." },
    },
    "boomer": {
      "zh": { personalityTags: ["怀旧心", "有讲究", "熟悉感"], soulVerdict: "你珍惜用过的老东西，喜欢的理由很具体，不只是因为它们待得久。" },
      "zh-TW": { personalityTags: ["懷舊心", "有講究", "熟悉感"], soulVerdict: "你珍惜用過的老東西，喜歡的理由很具體，不只是因為它們待得久。" },
      "en": { personalityTags: ["Nostalgic", "Discerning", "Grounded"], soulVerdict: "You keep the old favorite for the way it feels in your hand, not just its age." },
    },
    "zoomer": {
      "zh": { personalityTags: ["尝鲜心", "反应快", "轻盈派"], soulVerdict: "你喜欢先试一种新玩法，有趣就多玩一下，不用因此认领整个阵营。" },
      "zh-TW": { personalityTags: ["嚐鮮心", "反應快", "輕盈派"], soulVerdict: "你喜歡先試一種新玩法，有趣就多玩一下，不用因此認領整個陣營。" },
      "en": { personalityTags: ["Trend-Curious", "Playful", "Light Touch"], soulVerdict: "You'd try the new format for fun before calling it a whole new identity." },
    },
    "npc": {
      "zh": { personalityTags: ["规律感", "务实心", "自有主见"], soulVerdict: "你能在熟悉的节奏里找到舒服的落点，也给自己留着随时改主意的余地。" },
      "zh-TW": { personalityTags: ["規律感", "務實心", "自有主見"], soulVerdict: "你能在熟悉的節奏裡找到舒服的落點，也給自己留著隨時改主意的餘地。" },
      "en": { personalityTags: ["Routine-Minded", "Grounded", "Self-Directed"], soulVerdict: "You like a useful routine with room to change course whenever it stops fitting." },
    },
  },
  "south-park": {
    "stan-marsh": {
      "zh": { personalityTags: ["务实感", "清醒派", "朴素直觉"], soulVerdict: "你常先看一件小事究竟需要什么，觉得把普通事做明白就已经够了。" },
      "zh-TW": { personalityTags: ["務實感", "清醒派", "樸素直覺"], soulVerdict: "你常先看小事究竟需要什麼，把一件普通的事想明白，對你就已經夠了。" },
      "en": { personalityTags: ["Grounded", "Plainspoken", "Practical"], soulVerdict: "You tend to spot what a small situation actually needs under all the buildup." },
    },
    "kyle-broflovski": {
      "zh": { personalityTags: ["讲原则", "公允心", "较真派"], soulVerdict: "你会不自觉留意大家是不是在讲同一条规则，公平这件事值得问明白。" },
      "zh-TW": { personalityTags: ["講原則", "公允心", "較真派"], soulVerdict: "你會不自覺留意大家是不是在講同一條規則，公平這件事值得問明白。" },
      "en": { personalityTags: ["Fair-Minded", "Principled", "Direct"], soulVerdict: "You want to know whether everyone really heard the same rule before calling it fair." },
    },
    "eric-cartman": {
      "zh": { personalityTags: ["坦率直球", "有主见", "存在感"], soulVerdict: "你常愿意让偏好在桌面上亮相，即使有人不同意，也比藏起来痛快。" },
      "zh-TW": { personalityTags: ["坦率直球", "有主見", "存在感"], soulVerdict: "你常願意讓偏好在桌面上亮相，即使有人不同意，也比藏起來痛快。" },
      "en": { personalityTags: ["Outspoken", "Bold", "Self-Possessed"], soulVerdict: "You like making your preference clear even if the whole room sees it differently." },
    },
    "kenny-mccormick": {
      "zh": { personalityTags: ["话少实在", "低调心", "有担当"], soulVerdict: "你更中意做一件派得上用场的小事，做完了也不一定要让大家知道。" },
      "zh-TW": { personalityTags: ["話少實在", "低調心", "有擔當"], soulVerdict: "你更中意做一件派得上用場的小事，做完了也不一定要讓大家知道。" },
      "en": { personalityTags: ["Unassuming", "Practical", "Steady"], soulVerdict: "You'd rather make one useful thing happen quietly than make much noise about it." },
    },
    "butters-stotch": {
      "zh": { personalityTags: ["友善心", "玩心足", "亲和感"], soulVerdict: "你喜欢把游戏的门槛放低一点，让刚来的人也能很快笑着加入。" },
      "zh-TW": { personalityTags: ["友善心", "玩心足", "親和感"], soulVerdict: "你喜歡把遊戲的門檻放低一點，讓剛來的人也能很快笑著加入。" },
      "en": { personalityTags: ["Gentle", "Playful", "Welcoming"], soulVerdict: "You like a game with an easy doorway so a late arrival can join the fun too." },
    },
    "wendy-testaburger": {
      "zh": { personalityTags: ["公允眼", "细腻心", "包容力"], soulVerdict: "你会多看一眼那些没找到舒服位置的人，也愿意把他们的感受带进讨论。" },
      "zh-TW": { personalityTags: ["公允眼", "細膩心", "包容力"], soulVerdict: "你會多看一眼那些沒找到舒服位置的人，也願意把他們的感受帶進討論。" },
      "en": { personalityTags: ["Inclusive", "Attentive", "Fair-Minded"], soulVerdict: "You notice who still needs a comfortable way in and want their voice in the room." },
    },
    "randy-marsh": {
      "zh": { personalityTags: ["大脑洞", "舞台感", "热情有度"], soulVerdict: "你爱把脑洞开得大一些，也懂得给自己的大场面留一扇随时能关的门。" },
      "zh-TW": { personalityTags: ["大創意", "舞台感", "熱情有度"], soulVerdict: "你愛把創意開得大一些，也懂得給自己的大場面留一扇隨時能關的門。" },
      "en": { personalityTags: ["Big Imagination", "Theatrical", "Spirited"], soulVerdict: "You like a big, gleeful idea best when there's still a little door to step out." },
    },
  },
  "temperament": {
    "sanguine": {
      "zh": { personalityTags: ["亮堂感", "热情外放", "参与感"], soulVerdict: "你常被新鲜和有趣的动静叫醒，自己往里一站，热闹就变得更有意思。" },
      "zh-TW": { personalityTags: ["亮堂感", "熱情外放", "參與感"], soulVerdict: "你常被新鮮和有趣的動靜叫醒，自己往裡一站，熱鬧就變得更有意思。" },
      "en": { personalityTags: ["Enthusiastic", "Sociable", "Curious"], soulVerdict: "You light up around something new and like it even more once you're part of it." },
    },
    "choleric": {
      "zh": { personalityTags: ["方向感", "明快果断", "直率派"], soulVerdict: "你倾向把眼前值得推进的事说清楚，知道往哪儿走的时候最有精神。" },
      "zh-TW": { personalityTags: ["方向感", "明快果斷", "直率派"], soulVerdict: "你傾向把眼前值得推進的事說清楚，知道往哪裡走的時候最有精神。" },
      "en": { personalityTags: ["Decisive", "Direct", "Purposeful"], soulVerdict: "You feel most energized when you can name what's worth moving forward." },
    },
    "melancholic": {
      "zh": { personalityTags: ["细腻感", "内省派", "意味深长"], soulVerdict: "你会为细节停留一会儿，真正在意的意思往往藏在第一眼没看见的地方。" },
      "zh-TW": { personalityTags: ["細膩感", "內省派", "意味深長"], soulVerdict: "你會為細節停留一會兒，真正在意的意思往往藏在第一眼沒看見的地方。" },
      "en": { personalityTags: ["Reflective", "Detail-Minded", "Considered"], soulVerdict: "You linger over the details because the part that matters can hide on the first pass." },
    },
    "phlegmatic": {
      "zh": { personalityTags: ["安稳派", "平和感", "节奏从容"], soulVerdict: "你更容易从熟悉的节奏里找到安心，不慌不忙也可以一路走得很稳。" },
      "zh-TW": { personalityTags: ["安穩派", "平和感", "從容步調"], soulVerdict: "你在熟悉的步調裡比較安心，照自己的速度來，也可以一路走得很穩。" },
      "en": { personalityTags: ["Even-Tempered", "Steady", "Unhurried"], soulVerdict: "You like finding your footing in a familiar rhythm before picking up the pace." },
    },
  },
  "moral-dilemma-test": {
    "consequences": {
      "zh": { personalityTags: ["影响意识", "实在心", "审慎派"], soulVerdict: "你很自然会想事情落到每个人身上是什么滋味，也会给没想清的地方留空。" },
      "zh-TW": { personalityTags: ["影響意識", "實在心", "審慎派"], soulVerdict: "你很自然會想事情落到每個人身上是什麼滋味，也會給沒想清的地方留空。" },
      "en": { personalityTags: ["Impact-Minded", "Practical", "Considered"], soulVerdict: "You think about how a choice lands on everyone and leave room for what you can't foresee." },
    },
    "principles": {
      "zh": { personalityTags: ["原则感", "重承诺", "有分寸"], soulVerdict: "你会多问一句必须这么做的理由，也愿意承认两种认真想法可能撞在一起。" },
      "zh-TW": { personalityTags: ["原則感", "重承諾", "有分寸"], soulVerdict: "你會多問一句必須這麼做的理由，也願意承認兩種認真想法可能撞在一起。" },
      "en": { personalityTags: ["Principled", "Reflective", "Boundaried"], soulVerdict: "You care why an obligation holds and can see how two serious reasons might clash." },
    },
    "character": {
      "zh": { personalityTags: ["重心意", "落地感", "深思心"], soulVerdict: "你更在意一句好话放回当时的处境会长什么样，真要做时又会是什么样。" },
      "zh-TW": { personalityTags: ["重心意", "落地感", "深思心"], soulVerdict: "你更在意一句好話放回當時的處境會長什麼樣，真要做時又會是什麼樣。" },
      "en": { personalityTags: ["Values-Minded", "Grounded", "Reflective"], soulVerdict: "You like seeing what a value looks like when someone has to live it in a real moment." },
    },
    "care": {
      "zh": { personalityTags: ["温柔心", "善倾听", "有边界"], soulVerdict: "你会先留心眼前的人需要怎样被听见，关心里也给对方留下说不的余地。" },
      "zh-TW": { personalityTags: ["溫柔心", "懂傾聽", "有界線"], soulVerdict: "你會先留心眼前的人需要怎麼被聽見，關心裡也給對方留一句說不的空間。" },
      "en": { personalityTags: ["Attuned", "Considerate", "Respectful"], soulVerdict: "You like care that hears a specific need and leaves room for the person to say no." },
    },
    "fairness": {
      "zh": { personalityTags: ["公允心", "细致审慎", "重分担"], soulVerdict: "你会留意机会和负担各落到谁身上，尤其在大家以为都分得一样的时候。" },
      "zh-TW": { personalityTags: ["公允心", "細緻審慎", "重分擔"], soulVerdict: "你會留意機會和負擔各落到誰身上，尤其在大家以為都分得一樣的時候。" },
      "en": { personalityTags: ["Fair-Minded", "Discerning", "Evenhanded"], soulVerdict: "You notice who gets the chance and who carries the load when a split looks equal." },
    },
  },
  "male-archetype-test": {
    "king": {
      "zh": { personalityTags: ["统筹气场", "公允感", "稳场派"], soulVerdict: "你更喜欢让大家先把分工和范围商量明白，每个人才站得稳自己的位置。" },
      "zh-TW": { personalityTags: ["統籌氣場", "公允感", "穩場派"], soulVerdict: "你更喜歡讓大家先把分工和範圍商量明白，每個人才站得穩自己的位置。" },
      "en": { personalityTags: ["Organized", "Fair-Minded", "Coordinated"], soulVerdict: "You like shared work with clear roles and a real say for everyone taking part." },
    },
    "warrior": {
      "zh": { personalityTags: ["重诺感", "务实担当", "边界清楚"], soulVerdict: "你更像愿意把自己认领的那段路走扎实的人，到了该交棒时也能放手。" },
      "zh-TW": { personalityTags: ["重承諾", "務實擔當", "界線清楚"], soulVerdict: "你更像願意把自己答應的那段走穩的人，到了該交棒的地方也能放手。" },
      "en": { personalityTags: ["Steady", "Boundaried", "Committed"], soulVerdict: "You like carrying your chosen stretch of the road and knowing where to hand it over." },
    },
    "magician": {
      "zh": { personalityTags: ["好奇脑", "试验派", "包容未知"], soulVerdict: "你对没想明白的地方有兴趣，喜欢留下一点能随时改的试验余地。" },
      "zh-TW": { personalityTags: ["好奇腦", "試驗派", "包容未知"], soulVerdict: "你對沒想明白的地方有興趣，喜歡留下一點能隨時改的試驗餘地。" },
      "en": { personalityTags: ["Curious", "Inventive", "Open-Minded"], soulVerdict: "You like a question you can explore without locking yourself into an answer." },
    },
    "lover": {
      "zh": { personalityTags: ["感受细腻", "珍视细节", "欣赏心"], soulVerdict: "你有时会为别人没留意的小细节停一下，原来好看的东西可以很安静。" },
      "zh-TW": { personalityTags: ["感受細膩", "珍視細節", "欣賞心"], soulVerdict: "你有時會為別人沒留意的小細節停一下，原來好看的東西可以很安靜。" },
      "en": { personalityTags: ["Attentive", "Appreciative", "Perceptive"], soulVerdict: "You pause for the small detail someone else might miss and enjoy how quietly it glows." },
    },
  },
  "inkblot-personality-quiz": {
    "whole-form": {
      "zh": { personalityTags: ["整体眼光", "图形感", "布局脑"], soulVerdict: "你看画面时更容易先感到整个形状，细节像是在里面慢慢找到了位置。" },
      "zh-TW": { personalityTags: ["整體眼光", "圖形感", "佈局腦"], soulVerdict: "你看畫面時更容易先感到整個形狀，細節像是在裡面慢慢找到了位置。" },
      "en": { personalityTags: ["Big-Picture", "Spatial", "Pattern-Minded"], soulVerdict: "You see the overall shape first and let its smaller details settle into place." },
    },
    "edge-detail": {
      "zh": { personalityTags: ["细节敏锐", "静观派", "求真心"], soulVerdict: "你的注意力常被一道细边带走，一点不起眼的转弯也值得多看几秒。" },
      "zh-TW": { personalityTags: ["細節敏銳", "靜觀派", "求真心"], soulVerdict: "你的注意力常被一道細邊帶走，一點不起眼的轉彎也值得多看幾秒。" },
      "en": { personalityTags: ["Detail-Minded", "Observant", "Sharp-Eyed"], soulVerdict: "Your eye likes following one subtle edge further than a first glance might go." },
    },
    "motion-association": {
      "zh": { personalityTags: ["动感联想", "想象派", "灵动感"], soulVerdict: "你很容易在静止的形状里看出快要发生的小动作，等画面自己活起来。" },
      "zh-TW": { personalityTags: ["動感聯想", "想像派", "靈動感"], soulVerdict: "你很容易在靜止的形狀裡瞧見一個快發生的小動作，等畫面自己活起來。" },
      "en": { personalityTags: ["Motion-Minded", "Imaginative", "Perceptive"], soulVerdict: "You can sense a small motion about to happen in a shape that hasn't moved at all." },
    },
    "contrast-noticing": {
      "zh": { personalityTags: ["对比眼", "色块直觉", "清晰感"], soulVerdict: "你会先留意两种深浅怎样碰在一起，它们交界的地方往往最有意思。" },
      "zh-TW": { personalityTags: ["對比眼", "色塊直覺", "清晰感"], soulVerdict: "你會先留意兩種深淺怎樣碰在一起，它們交界的地方往往最有意思。" },
      "en": { personalityTags: ["Contrast-Minded", "Visual", "Discerning"], soulVerdict: "You notice where light and dark sit next to each other and what their meeting suggests." },
    },
    "scene-imagining": {
      "zh": { personalityTags: ["故事脑", "画面感", "奇想派"], soulVerdict: "你看见一块普通的形状，脑子里可能已经替它搭好一幕临时的小故事。" },
      "zh-TW": { personalityTags: ["故事腦", "畫面感", "奇想派"], soulVerdict: "你看見一塊普通的形狀，腦子裡可能已經替它搭好一幕臨時的小故事。" },
      "en": { personalityTags: ["Scene-Minded", "Imaginative", "Whimsical"], soulVerdict: "You see an ordinary shape and your imagination is already setting a small scene around it." },
    },
  },
  "inner-child-personality-test": {
    "wonder-explorer": {
      "zh": { personalityTags: ["纯粹好奇", "惊喜感", "童心派"], soulVerdict: "你会为日常里没想过的问题来劲，普通东西认真看看也可以玩很久。" },
      "zh-TW": { personalityTags: ["純粹好奇", "驚喜感", "童心派"], soulVerdict: "你會為日常裡沒想過的問題來勁，普通東西認真看看也可以玩很久。" },
      "en": { personalityTags: ["Wonder-Seeker", "Inquisitive", "Playful"], soulVerdict: "You like a question that makes an ordinary thing feel worth exploring all over again." },
    },
    "independent-maker": {
      "zh": { personalityTags: ["手作心", "自主派", "巧思感"], soulVerdict: "你喜欢按自己的办法动动手，过程中临时改的地方往往最好玩。" },
      "zh-TW": { personalityTags: ["手作心", "自主派", "巧思感"], soulVerdict: "你喜歡按自己的辦法動動手，過程中臨時改的地方往往最好玩。" },
      "en": { personalityTags: ["Hands-On", "Self-Directed", "Inventive"], soulVerdict: "You like playing your own way and finding fun in the parts you get to change." },
    },
    "prepared-player": {
      "zh": { personalityTags: ["谨慎好奇", "有准备", "自在节拍"], soulVerdict: "你更容易在知道玩法以后自在进去，愿不愿意玩也可以留给自己决定。" },
      "zh-TW": { personalityTags: ["謹慎好奇", "有準備", "自在節拍"], soulVerdict: "你更容易在知道玩法以後自在進去，願不願意玩也可以留給自己決定。" },
      "en": { personalityTags: ["Considered", "Prepared", "Self-Paced"], soulVerdict: "You like knowing enough about the game before choosing to join on your own terms." },
    },
    "expressive-player": {
      "zh": { personalityTags: ["灵动表达", "鲜亮感", "玩心足"], soulVerdict: "你喜欢给开心添一点颜色、动静或声音，好让那种心情也有个样子。" },
      "zh-TW": { personalityTags: ["靈動表達", "鮮亮感", "玩心足"], soulVerdict: "你喜歡給開心添一點顏色、動靜或聲音，好讓那種心情也有個樣子。" },
      "en": { personalityTags: ["Expressive", "Colorful", "Spirited"], soulVerdict: "You like giving a good feeling some color, sound, or motion so it can show itself." },
    },
    "quiet-imaginer": {
      "zh": { personalityTags: ["静谧感", "奇想心", "自在独处"], soulVerdict: "你会给自己的小世界留个角落，坐着想一会儿也能算作很好玩的时间。" },
      "zh-TW": { personalityTags: ["靜謐感", "奇想心", "自在獨處"], soulVerdict: "你會替自己的小世界留個角落，光坐著想像一下，也能玩得很開心。" },
      "en": { personalityTags: ["Quietly Creative", "Reflective", "Imaginative"], soulVerdict: "You like a little corner of your own where imagining can be the whole game." },
    },
    "welcoming-companion": {
      "zh": { personalityTags: ["亲切感", "陪伴心", "温柔有界"], soulVerdict: "你更喜欢和别人商量着一起玩，两个人都觉得自在，游戏才真的有趣。" },
      "zh-TW": { personalityTags: ["親切感", "陪伴心", "溫柔有界"], soulVerdict: "你更喜歡和別人商量著一起玩，兩個人都覺得自在，遊戲才真的有趣。" },
      "en": { personalityTags: ["Welcoming", "Companion-Minded", "Considerate"], soulVerdict: "You like playing together most when both people feel free to say how they want to join." },
    },
  },
};

export function getArchetypeHonorCopy(slug: string, profileId: string, locale: DisplayLocale): ArchetypeHonorCopy {
  const copy = archetypeHonorCardCopy[slug]?.[profileId]?.[locale];
  if (!copy) throw new Error(`Missing archetype honor copy for ${slug}/${profileId}/${locale}`);
  return copy;
}
