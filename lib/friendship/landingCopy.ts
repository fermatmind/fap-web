import type { FriendshipDisplayLocale } from "./traditional";

type Cards = readonly (readonly [title: string, description: string])[];

type LandingCopy = {
  hero: readonly [eyebrow: string, title: string, lead: string, trust: string, start: string];
  heroLinks: readonly [join: string, offline: string, sample: string, compare: string];
  sample: readonly [label: string, explanation: string, matches: string, first: string, second: string, third: string];
  summary: readonly [title: string, facts: string];
  deliverables: Cards;
  method: readonly [title: string, formula: string, exampleTitle: string, example: string];
  steps: Cards;
  profiles: readonly [title: string, explanation: string, guide: string];
  bandNotes: readonly string[];
  interpretation: readonly [title: string, cards: Cards];
  related: readonly [title: string, cards: readonly (readonly [title: string, description: string, link: string])[]];
  reference: readonly [title: string, boundary: string, privacy: string];
  faq: Cards;
};

export const friendshipLandingCopy = {
  en: {
    hero: ["FermatMind Friendship Quiz", "How Well Do You Know Me? Friendship Quiz", "Pick your own answers, then send one link and see how many choices your friends can guess.", "Free, no signup · 30–150 questions · One point per match", "Create my friendship quiz"],
    heroLinks: ["Joining a friend's quiz?", "Try a six-question offline round", "See a sample score", "Compare with Rikaido"],
    sample: ["Sample results", "Three fictional friends took the same 30-question quiz. Choose an entry to see which categories they guessed best.", "matches", "Friend A", "Friend B", "Friend C"],
    summary: ["What you and your friends get", "FermatMind’s Friendship Quiz lets one person answer 30 to 150 questions about their preferences and share the same invitation with friends. Invited friends use nicknames to guess the creator’s recorded choices and see each answer as they play. The free game reveals the total score, accuracy across six categories and a leaderboard for that quiz. Equal scores share a rank."],
    deliverables: [
      ["One link to send around", "Choose the length and swap questions within their categories before sharing the same frozen round with a group."],
      ["Answers revealed one at a time", "Each guess shows what the creator picked and whether it matched. Consecutive matches build a streak."],
      ["A score, radar and friendboard", "After the last question, see every guess, the six category rates, shared ranks and a share image."],
    ],
    method: ["How the game works", "Score = matching guesses. Percentage = matches ÷ total questions × 100, rounded to a whole number.", "A breakfast example", "Say the creator picked a familiar breakfast. Guess that choice to earn one point, even if you'd rather try something new. The other choice scores zero. Friends must finish every question before the final score is available."],
    steps: [
      ["Answer for yourself", "The online game uses a six-category mix with equal numbers in food, connection, fun and movement, real talk, personal style, and daily life."],
      ["Share the invitation", "Making the invite freezes the questions and answer key. Friends enter a nickname and guess the creator’s choices."],
      ["Finish and compare", "The friendboard sorts visible finished entries by matches. A tied rank is shared, so two first places are followed by third place."],
    ],
    profiles: ["What the game titles mean", "The title follows the displayed percentage for that round. A friend can get a different title on a fresh set of questions.", "Read the score and radar guide"],
    bandNotes: ["You matched nearly all of this round’s choices.", "You matched roughly three quarters or more of the choices.", "You matched at least half of the choices.", "You matched about a quarter to under half of the choices.", "You matched fewer than about a quarter of the choices."],
    interpretation: ["Who knows me best? Read the round together", [
      ["Same score, different strengths", "Friends A and B both guessed 22 of 30, yet A scored higher in food and B in connection. Compare one category at a time."],
      ["No other friend has finished yet", "The radar still shows your own category rates. The dashed comparison appears when other visible scores from this round are available."],
      ["One answer caught you off guard", "Pick a question you're both comfortable discussing. Ask what made your friend choose it, then swap roles in the next round."],
    ]],
    related: ["For the group chat or game night", [
      ["Already have an invite?", "Open the link your friend sent. The guide covers joining, sharing and managing a challenge.", "Read how to play"],
      ["Want a short round in person?", "Use 24 original this-or-that questions, printable answer sheets or a six-question warm-up. Online rounds start at 30 questions.", "Browse questions and printables"],
      ["Reading a finished round?", "See how 22 out of 30 displays as 73% and why a shared rank can leave a gap on the friendboard.", "See score examples"],
    ]],
    reference: ["Friendship quiz FAQ", "What the score can tell you and who can see it", "These BFF test scores track matches against one set of frozen choices. Memory, recent conversations and chance can all affect a score. Rankings apply to that quiz only. Use a nickname, share the invite with the people you want to play, and keep the management file private."],
    faq: [
      ["Do I answer for myself or guess the creator?", "When making a quiz, pick your own preferences. On a friend's quiz, guess the choices they already made. Your own preferences don't affect the score."],
      ["Can my whole group play the same friendship quiz?", "Yes. Share one invite with several friends. Everyone guesses the same frozen choices using a nickname. Completed visible entries appear on the friendboard, with equal scores sharing a rank."],
      ["Can I write questions or choose the quiz length?", "Choose 30, 60, 90, 120 or 150 questions. You can swap questions within a category before sharing, but you can't add custom questions to the online round."],
      ["Are the quiz and full results free?", "Creating, guessing, the full radar, answer comparisons, rankings and share images are free. There is no signup, email requirement or app to download."],
      ["Who can see the scores, and when does the quiz expire?", "Anyone with the invite can play and see visible nicknames and scores. Quizzes expire after 90 days. Creators can close or delete them sooner. Keep the separate management file private."],
      ["Can a friend play again?", "The same browser keeps its first completed entry, and another device may create a repeat entry. One quiz can hold up to 1,000 entries. A creator can make a new quiz for a fresh round."],
    ],
  },
  zh: {
    hero: ["费马测试 · 友谊挑战", "朋友默契测试：你有多了解我？", "先选出自己的答案，再把同一条链接发给朋友，看看他们能猜中多少。", "免费免注册 · 30–150 题 · 每猜中一题得 1 分", "免费创建我的挑战"],
    heroLinks: ["收到朋友的邀请？", "先玩六题线下短局", "看分数示例", "对比 Rikaido 玩法"],
    sample: ["分数示例", "三位虚构好友答了同一份 30 题挑战。切换记录，看看他们各自猜得准的是哪几类。", "猜中", "好友 A", "好友 B", "好友 C"],
    summary: ["一份挑战能看到什么", "费马朋友默契测试由一人作答并生成邀请，好友用昵称猜出题者的选择。线上每轮提供三十至一百五十题，答完可免费查看猜中数、六类正确率、逐题答案和并列榜单。"],
    deliverables: [
      ["一条链接邀请多人", "先选择题量，遇到不合适的题可以同类换题。分享后，朋友猜的是同一组冻结选择。"],
      ["每猜一题就揭晓", "看看朋友当时选了什么、自己有没有猜中。连续猜中会累计连击。"],
      ["分数、雷达和好友榜单", "答完免费查看猜中数、六类正确率、逐题对照和名次，也可以保存分享图。"],
    ],
    method: ["出题、邀请和计分", "总分 = 猜中数。百分比 = 猜中数 ÷ 总题数 × 100，显示为四舍五入的整数。", "拿早餐举个例子", "假设出题者选了「熟悉的早餐」。猜中这个选择就得 1 分，即使你自己喜欢尝试新早餐。猜另一个选项得 0 分。答完所有题才会生成总分。"],
    steps: [
      ["按自己的偏好作答", "在线版采用六类混合题组，美食、相处、玩乐与运动、真心话、个人风格和日常的题量相同。"],
      ["把邀请发给朋友", "生成邀请时题目与答案会冻结，朋友用昵称进入并猜出题者的选择。"],
      ["答完看榜单", "榜单按猜中数排序，同分共享名次。两位好友并列第一时，下一位排第三。"],
    ],
    profiles: ["分数对应的游戏称号", "称号按本轮显示的百分比给出。换一组题，朋友可能拿到另一个称号。", "查看分数、雷达图和榜单的读法"],
    bandNotes: ["这一轮的选择，你几乎都猜中了。", "你猜中了约四分之三或更多的选择。", "你猜中了至少一半的选择。", "你猜中了大约四分之一到不足一半的选择。", "你猜中的选择不到约四分之一。"],
    interpretation: ["谁更了解我？一起读读本轮分数", [
      ["总分相同，各有擅长", "好友 A 和 B 都猜中 22 道，但 A 的美食题猜中更多，B 的相处题猜中更多。可以分开读这两条轴。"],
      ["暂时只有一位好友答完", "雷达照样显示本人的各类正确率。同一份邀请有其他可见完成记录后，才会显示灰色平均线。"],
      ["有一题出乎意料", "挑一道双方都愿意聊的题，问对方当时怎么想。下一轮换朋友出题，由你来猜。"],
    ]],
    related: ["收到邀请，或想在聚会试一轮", [
      ["已经有好友的邀请？", "打开对方发来的链接。指南有加入挑战、发送邀请和管理挑战的步骤。", "查看玩法和管理说明"],
      ["想在线下玩短一点？", "问题页提供24道原创二选一题、可打印答案卡和六题短局。在线题组从 30 题起。", "查看问题与打印活动"],
      ["已经答完一轮？", "看看 22/30 为什么显示 73%，以及榜单出现并列后会跳过哪个名次。", "查看分数示例"],
    ]],
    reference: ["朋友默契测试常见问题", "怎样理解分数，谁能看到结果", "把它当作一次 BFF 测试或朋友聚会游戏。猜中数只对应当时冻结的那份答案，记忆、碰巧猜中或选项是否贴合都可能影响分数。名次只在同一挑战内有意义。使用昵称，只把邀请发给你想邀请的人，并单独保存私人管理文件。"],
    faq: [
      ["我应该选自己的偏好，还是猜出题者？", "出题时选自己的偏好；接受邀请时，猜对方当时选了什么。你自己的偏好不影响猜题得分。"],
      ["可以让一群朋友一起玩吗？", "可以把同一份邀请发给多位朋友。每人用昵称猜同一组冻结答案，可见的完成记录会进入榜单，同分并列。"],
      ["能自己写题，或者选题数吗？", "可选 30、60、90、120 或 150 题。发布前可以在同类题中换题；当前不支持自行添加问题。"],
      ["测试和完整结果都免费吗？", "出题、作答、完整六类雷达、逐题对照、榜单和分享图都免费，无需注册、邮箱或下载 App。"],
      ["谁能看见我的成绩？挑战多久到期？", "持有邀请链接的人可参与并看到可见的昵称和成绩。挑战90天到期，出题者也可以提前关闭或删除。私人管理文件请另行保管。"],
      ["同一个朋友可以重玩吗？", "同一浏览器保留首条完成记录，换设备可能产生重复记录。每个挑战最多保留1000条记录，出题者可以创建新挑战再玩一轮。"],
    ],
  },
  "zh-TW": {
    hero: ["費馬測試 · 友誼挑戰", "朋友默契測驗：你有多瞭解我？", "先選好自己的答案，再把同一個連結傳給朋友，看看大家能猜中幾題。", "免費免註冊 · 30–150 題 · 每猜中一題得 1 分", "免費建立我的挑戰"],
    heroLinks: ["收到朋友的邀請？", "先玩六題紙本短局", "看分數範例", "比較 Rikaido 的玩法"],
    sample: ["分數範例", "三位虛構好友完成了同一份 30 題挑戰。切換紀錄，看看誰在哪些類別猜得準。", "猜中", "好友 A", "好友 B", "好友 C"],
    summary: ["一份挑戰能看到什麼", "費馬朋友默契測驗由一人答題並分享邀請，好友用暱稱猜出題者的選擇。每輪可選三十到一百五十題，答完可免費查看猜中題數、六種類別的答對率、逐題對照和同分並列的排行榜。"],
    deliverables: [
      ["一個連結就能邀請多人", "先選題數，不合適的題目可以換成同類的另一題。朋友收到後會猜同一組已固定的答案。"],
      ["猜完一題就揭曉", "立刻知道出題者當時選了什麼、自己有沒有猜中。連續猜中會累積連擊。"],
      ["分數、雷達圖與好友排行", "答完可免費看猜中題數、六類答對率、逐題對照和名次，也能儲存分享圖片。"],
    ],
    method: ["怎麼出題、邀人和計分", "總分 = 猜中題數。百分比 = 猜中題數 ÷ 總題數 × 100，結果四捨五入到整數。", "拿早餐當例子", "假設出題者選了「習慣吃的早餐」。就算你自己愛試新口味，猜中對方的選擇仍得 1 分。猜另一個選項得 0 分，答完全部題目才會看到總分。"],
    steps: [
      ["依自己的偏好作答", "線上題組涵蓋美食、相處、玩樂與運動、真心話、個人風格和日常，每類的題數相同。"],
      ["把邀請傳給朋友", "建立邀請後，題目和答案就會固定。朋友輸入暱稱，開始猜出題者的選擇。"],
      ["答完看排行榜", "榜單按猜中題數排序，同分並列。兩位好友並列第一時，下一位排第三。"],
    ],
    profiles: ["分數會換成哪個遊戲稱號？", "稱號依本輪顯示的百分比而定。換一組題，朋友可能會拿到另一個稱號。", "看看怎麼讀分數、雷達圖與排行"],
    bandNotes: ["這一輪的選項，你幾乎全猜對了。", "你猜對了約四分之三或更多的選項。", "你猜對了至少一半的選項。", "你猜對了大約四分之一到不到一半的選項。", "你猜對的選項不到約四分之一。"],
    interpretation: ["誰更瞭解我？一起看看本輪結果", [
      ["同分，猜得準的地方不同", "好友 A 和 B 都猜中 22 題，但 A 在美食類答對更多，B 在相處類答對更多。可以一類一類看。"],
      ["暫時只有一位好友答完", "雷達圖會先顯示自己的答對率。同一份挑戰有其他可見的完成紀錄後，才會出現灰色平均線。"],
      ["有一題很意外", "挑一道雙方都想聊的題目，問問對方當時怎麼想。下一輪換朋友出題、你來猜。"],
    ]],
    related: ["收到邀請，或想在聚會玩一輪", [
      ["朋友已經傳來邀請？", "開啟對方傳來的連結。說明裡有參加挑戰、分享邀請和管理挑戰的步驟。", "看看玩法與管理說明"],
      ["想面對面玩短一點的版本？", "問題頁有 24 道原創二選一題、可列印的答案卡和六題暖身。線上題組從 30 題起。", "瀏覽題目與列印活動"],
      ["已經答完一輪？", "看看答對 22/30 為什麼會顯示 73%，以及並列之後會跳過哪個名次。", "查看分數範例"],
    ]],
    reference: ["朋友默契測驗常見問題", "怎麼理解分數，誰能看到結果", "可以把它當作閨蜜測驗或聚會遊戲。分數只反映這一輪猜中幾個已固定的選擇；記憶、運氣和題目是否適合都可能影響表現。排行榜只適用於同一份挑戰。請用暱稱，自己決定邀請要傳給誰，並私下保管管理檔案。"],
    faq: [
      ["要選自己喜歡的，還是猜出題的人？", "出題時依自己的偏好作答。拿到朋友的邀請時，猜的是對方當時選了什麼。你自己的偏好不影響分數。"],
      ["可以傳給一整群朋友一起玩嗎？", "可以。將同一個邀請連結傳給多位朋友，大家用暱稱猜同一組已固定的答案。可見的完成紀錄會列入排行榜，同分並列。"],
      ["可以選題數，或自己加題目嗎？", "可選 30、60、90、120 或 150 題。分享之前可以換同類題目，目前線上版無法自行新增題目。"],
      ["遊戲和完整結果都免費嗎？", "出題、作答、完整雷達圖、逐題對照、排行榜和分享圖都免費，無須註冊、填寫電子郵件或下載 App。"],
      ["誰能看到成績？邀請多久會到期？", "拿到邀請連結的人可以參加，也能看到可見的暱稱與分數。挑戰會在 90 天後到期，出題者可提前關閉或刪除。請把管理檔案另外保管。"],
      ["同一位朋友可以再玩一次嗎？", "同一個瀏覽器會保留首次完成的紀錄，換裝置可能新增一筆。每份挑戰最多保留 1,000 筆紀錄。想再玩一輪，可以重新出一份題。"],
    ],
  },
} as const satisfies Record<FriendshipDisplayLocale, LandingCopy>;
