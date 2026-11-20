import type { DisplayLocale } from "@/lib/i18n/locales";
import { gta6CareerRows } from "./gta6CareerEditorial";

const gta6ReadingLocale = { en: 0, zh: 1, "zh-TW": 2 } as const;
type Text = readonly [en: string, zh: string, tw: string];
type Role = (typeof gta6CareerRows)[number]["role"];
type Contrast = readonly [role: Role, note: Text];
type Reading = {
  canon: Text;
  scene: Text;
  gains: readonly [Text, Text];
  limits: readonly [Text, Text];
  workplace: Text;
  reflection: Text;
  partner: Contrast;
  contrasts: readonly [Contrast, Contrast];
};

export const gta6ProfileReadings: Record<Role, Reading> = {
  "lucia-caminos": {
    canon: [
      "Lucia's father taught her to fight. Protecting her family landed her in Leonida Penitentiary. The official profile presents her after release, looking for a better life and determined to make smarter moves.",
      "Rockstar 的人物档案写到，Lucia 从小跟父亲学打斗，后来因保护家人入狱。获释后的她想改变一家人的处境，也打算更谨慎地选择下一步。",
      "露西婭從小跟父親學打鬥，曾因保護家人入獄。Rockstar 描寫的是她出獄後想讓一家人過得更好，也打算更仔細選下一步。",
    ],
    scene: [
      "When half the venue closes, Lucia's route in our quiz is to walk the open half and mark one workable way from the entrance to the stage. The change has to be small enough to try without committing the entire crew to it.",
      "费马的派对里，场地突然只剩一半。Lucia 对应的选择是先走一遍还能用的区域，划出一条可试行的进场路线，再让其他人根据现场反馈调整。",
      "派對場地突然只剩半邊時，露西婭的做法是親自走一次，把能用的入口和舞台接起來。路線要小到能先試走，再由夥伴看現場狀況調整。",
    ],
    gains: [
      ["A walk-through replaces a guess with something the crew can check.", "实地走一遍，让别人能核对现在到底能做什么。", "走一趟就有大家都看得見的依據。"],
      ["A small, reversible first move gives the next team something to build on.", "先做一项可撤回的小改动，交接时能明确下一步。", "先留一個能改回來的做法，下一組比較好接手。"],
    ],
    limits: [
      ["If only the first mover knows the new route, the door and stage can work from different plans.", "只有先行动的人知道新路线时，入口和舞台可能按两套安排做事。", "動線只留在你腦子裡，入口跟台上就可能各走各的。"],
      ["A workable route still needs the venue's checks before it is opened to a crowd.", "现场路线走得通之后，还要由场地方确认再开放给观众。", "現場看起來能走，正式放人之前還是要請場地方確認。"],
    ],
    workplace: ["After a venue change or project handoff, try defining one decision that can be made now, its owner and the conditions for review. Organizing the next move and testing a physical setup are two different activities worth exploring.", "项目卡住时，可以尝试写下现在能确定的一件事、谁负责，以及何时复核。组织下一步和动手检验条件，是两类可以分别体验的工作活动。", "專案卡住時，先把現在能決定的事、誰要接手、何時回頭檢查寫下來。協調下一步和親手試做，可以分開試。"],
    reflection: ["When a plan stalls, do you think it through alone first, or find clarity by talking it over?", "计划卡住时，你习惯先自己想清楚，还是在和别人讨论中理清思路？", "計畫卡住時，你通常先自己理一遍，還是要跟人聊過才比較有頭緒？"],
    partner: ["jason-duval", ["Lucia trials the route. Jason checks what was already promised and makes sure the original crew hears the change.", "Lucia 试走新路线。Jason 核对原有承诺，让原班伙伴也收到变更。", "露西婭先試走一趟，傑森確認原來答應過誰，順便把改動通知到位。"]],
    contrasts: [
      ["brian-heder", ["Brian sets a fallback route and its handoff owner before the first trial.", "Brian 优先定备用路线和切换时的交接人。", "布萊恩會先把備用動線和接手的人排清楚。"]],
      ["raul-bautista", ["Raul sees a short window to try an extra option; Lucia wants one workable starting point.", "Raul 看短窗口能否多试一版，Lucia 先找一个能落地的起点。", "勞爾在想能不能多試一招，露西婭先找現在能做的一步。"]],
    ],
  },
  "jason-duval": {
    canon: ["Jason grew up around grifters, spent time in the Army and went on to work for local drug runners in the Keys. Rockstar describes someone who wants a simpler life, even as his situation grows more complicated.", "Jason 在骗子和罪犯周围长大，从军后又在群岛替当地走私者做事。Rockstar 用他想过简单日子、事情却越来越复杂的反差来介绍他。", "傑森年輕時身邊有不少騙徒，當過兵，後來在群島替當地的毒品走私者工作。Rockstar 把他想過平靜日子和眼前的麻煩放在一起寫。"],
    scene: ["A guest can join only if the opening slot moves. Jason's quiz choice is to talk to the original act first. If the schedule has to change, he wants the people affected to know what they can still count on.", "临时嘉宾的加入可能挤掉开场。Jason 对应的选择是先问原定表演者，确认已经答应的时段怎么处理，再决定怎样调整。", "臨時來賓會擠到開場，傑森會先去找原來的表演者。就算時段得改，他也會先講清楚原本承諾的部分還能怎麼保留。"],
    gains: [
      ["The original act learns about the change before it becomes public.", "被影响的人能在公布前直接听到变更。", "要被調整的人能在對外公布前先知道。"],
      ["A named backup makes it easier for a teammate to ask for help.", "提前说清谁来补位，临时缺人时更容易求援。", "先說哪個人可以補位，夥伴才知道出狀況要找誰。"],
    ],
    limits: [
      ["Protecting every promise can delay a change the crew needs to make.", "逐一保住原承诺有时会拖住必须做的调整。", "每個承諾都想留，可能會拖到沒時間換方案。"],
      ["Taking on an extra job silently can hide a staffing problem.", "默默接下额外工作，可能让缺人这个问题继续被忽视。", "一個人多扛兩件事，其他人可能以為人手根本沒問題。"],
    ],
    workplace: ["On an operations shift, map who owns each handoff and define what should be recorded if the plan changes. Try both the physical coordination and the routine recordkeeping to see what you enjoy.", "交班时可以试着列出每项工作的责任人、备用人和变更记录。你更喜欢跑现场协调，还是整理流程和记录，可以分别观察。", "換班時把負責的人、能補位的人、臨時變更要留在哪裡列出來。也可以留意自己比較喜歡現場協調，還是把紀錄整理好。"],
    reflection: ["When a commitment changes, where do you start: agreeing on the new plan or hearing how the people affected are doing?", "原有承诺要变时，你通常先厘清新安排，还是先和受影响的人聊聊？", "答應過的事需要改，你會先把新做法弄清楚，還是先聽受影響的人怎麼想？"],
    partner: ["lucia-caminos", ["Lucia can show what is already workable; Jason can explain the change to the people whose slots moved.", "Lucia 拿出能跑通的新方案，Jason 负责约好受影响团队如何接上。", "露西婭先做一版走得通的安排，傑森去找時段被改到的人談。"]],
    contrasts: [
      ["boobie-ike", ["Boobie opens with what each side can commit; Jason opens with promises already made.", "Boobie 先问双方这次能承诺什么，Jason 先从旧承诺开始。", "布比先談這次兩邊能給什麼，傑森會先顧原來說好的。"]],
      ["raul-bautista", ["Raul tries to fit in a new opportunity; Jason checks whether the existing act can still go ahead.", "Raul 尝试争取新同台机会，Jason 先确认原来演出还能不能进行。", "勞爾會想擠出新的聯演時段，傑森先問原本那一段還能不能上。"]],
    ],
  },
  "cal-hampton": {
    canon: ["Cal is Jason's friend and also works with Brian. Rockstar describes him feeling safest at home, listening in on Coast Guard communications and browsing privately. His curiosity and suspicion are part of the portrayal.", "Cal 是 Jason 的朋友，也和 Brian 共事。Rockstar 写他觉得在家最安心，平时留意海岸警卫队的无线电和网上消息；好奇和疑心都属于人物设定。", "卡爾是傑森的朋友，也跟布萊恩共事。Rockstar 寫他待在家最自在，會聽海岸防衛隊的通訊，也愛查網路上流傳的消息。"],
    scene: ["When the chat says patrol will cancel the party, Cal's quiz choice is to find the first message and ask what that person actually knows. A screenshot of another screenshot stays unconfirmed until he can trace it back.", "群聊传出巡逻会让派对取消。Cal 对应的做法是找到最早的消息，再问发布者看到了什么。两张互相转发的截图仍只算一个来源。", "群組都在傳巡邏隊會來，卡爾先找最早那個人問清楚。他會把好幾張截圖往回追，看看是不是都從同一則訊息來。"],
    gains: [
      ["A source trail tells the crew which parts of the warning are firsthand.", "来源链能帮团队辨认哪一部分是一手消息。", "知道訊息是誰親眼看到的，就比較好判斷。"],
      ["Naming uncertainty keeps the crew from repeating a guess as a fact.", "把待证部分说出来，减少团队把猜测继续当事实传播。", "還查不到的地方先講清楚，大家就比較不會把猜測當公告。"],
    ],
    limits: [
      ["An extra check costs time if it cannot change the immediate decision.", "如果新增核查不会改变眼前决定，就可能只是在耗时间。", "再查一次如果也改不了眼下的決定，就要注意時間。"],
      ["Suspicion without a checkable lead can distract attention from the problem at hand.", "怀疑缺少可核实线索时，也会把注意力从已知问题上带走。", "沒有能追的線索，疑心太多反而會忘了手上的問題。"],
    ],
    workplace: ["Try writing an incident note with one verified fact, one open question and one deadline. Researching the signal and keeping a clean record are separate work activities.", "写一份事件记录，分开标记已证实事实、待查问题和反馈时间。研究线索与维持记录秩序是两种不同活动。", "做一張事件紀錄卡，把查到的事、還要確認的問題、幾點回報分開寫。追消息跟留紀錄，可以分開體驗。"],
    reflection: ["When reports conflict, do you first look for concrete evidence or for the bigger pattern behind them?", "几条消息冲突时，你先找可核对的事实，还是先想它们背后有没有共同模式？", "消息兜不起來時，你通常先查手上的證據，還是先想它們背後有沒有共同線索？"],
    partner: ["brian-heder", ["Cal reports what is verified and when he will check back. Brian decides what can be set up in the meantime.", "Cal 说清已核实的内容和回报时点，Brian 决定在等待期间可以先安排什么。", "卡爾幾點前會回報、哪些話查過先講清楚，布萊恩才好決定備案。"]],
    contrasts: [
      ["lucia-caminos", ["Lucia checks the usable half of the venue in person; Cal starts with the news trail.", "Lucia 先到现场确认能用的半区，Cal 从消息来源开始。", "露西婭先走一趟能用的場地，卡爾先追最早的消息。"]],
      ["real-dimez", ["The duo keeps the crowd engaged; Cal checks what the crew is ready to say publicly.", "Real Dimez 先照顾观众的注意力，Cal 先核实什么可以对外说。", "Real Dimez 先顧觀眾正在等什麼，卡爾先查這句話能不能放出去。"]],
    ],
  },
  "brian-heder": {
    canon: ["Brian is an old-school smuggler who still operates a boatyard in the Keys with Lori. His profile describes a man experienced enough to leave much of the fieldwork to others, including work Jason takes on in exchange for housing.", "Brian 是群岛老一辈的走私者，和 Lori 一起经营船场。档案提到他让别人去做一线工作，也给 Jason 提供住处，换取一些差事。", "布萊恩是群島老一輩的走私者，和 Lori 經營船場。官方檔案提到他多把前線工作交出去，傑森的住處安排也有交換條件。"],
    scene: ["With the crew waiting for answers, Brian's quiz option assigns one contact, a backup and a handoff condition. It lets each team work while everyone uses the same update.", "几个组都在等回复时，Brian 对应的选择是重排工作，把更新集中到同一人。这个人要知道备援是谁、什么情况下切换。", "每一組都在等答覆時，布萊恩會重排分工，把更新集中到同一個窗口。窗口要知道備案誰接、收到什麼訊息才換。"],
    gains: [
      ["A backup has an owner before something breaks.", "备用方案在出问题前就明确了负责人。", "備案先交給一個明確的人，不用出事才找。"],
      ["A single contact reduces duplicated or conflicting updates.", "一个更新出口减少重复沟通和互相冲突的通知。", "大家看同一個窗口，比較不會收到不同版本。"],
    ],
    limits: [
      ["A single contact can become a bottleneck without a deputy or clear authority.", "唯一联系人缺备援或权限，自己会变成瓶颈。", "只設一個窗口，沒講誰能代班，最後也可能塞住。"],
      ["Delegating work does not settle who owns an overlooked consequence.", "任务分出去之后，仍要有人承担遗漏或改变方案的后果。", "把事分出去之後，還是得說好漏掉了誰回來處理。"],
    ],
    workplace: ["Build a handoff that another shift can actually use: name the signal, the owner and the fallback in one place. Compare whether you enjoy arranging resources or maintaining the process once it is running.", "交接表可以把触发条件、负责人和备选路径放在同一处。试试自己更喜欢排资源，还是让已经建立的流程长期稳定运行。", "交接時把觸發條件、負責人和備案寫在同一張表。你可以試著排一次資源，再看看自己喜不喜歡後續維護流程。"],
    reflection: ["When several teams are moving at once, what helps you more: deciding the order early or leaving room to adjust it?", "多个团队同时行动时，你更依赖提前定顺序，还是留出现场调整空间？", "好幾組人同時開始時，你會想先排好順序，還是留點空間到現場再改？"],
    partner: ["cal-hampton", ["Cal checks which warning is confirmed. Brian protects a backup option until the crew has a reliable trigger for changing plans.", "Cal 核对哪条预警成立，Brian 保留备用方案，并定好何时启用。", "卡爾查哪個警訊是真的，布萊恩把備案留著，等到約好的訊號再切換。"]],
    contrasts: [
      ["boobie-ike", ["Brian assigns the crew already on hand; Boobie negotiates terms for outside resources.", "Brian 调度已有资源，Boobie 去对外谈条件。", "布萊恩用手邊人手排備案，布比會去跟外部談資源。"]],
      ["lucia-caminos", ["Lucia can test one adjustment now; Brian makes sure several moves can hand over cleanly.", "Lucia 可以马上试一个调整，Brian 确保几步之间交接顺畅。", "露西婭先試一個能用的動作，布萊恩會把前後幾步怎麼接排好。"]],
    ],
  },
  "raul-bautista": {
    canon: ["Rockstar introduces Raul as an experienced bank robber who combines confidence and charm with a taste for bigger risks. The official profile describes the stakes rising as his crew is asked to go further.", "Raul 在 Rockstar 的档案里是个有经验的银行劫匪，善于招募愿意冒险的人。档案也写到，他越做越敢加码，压力会落到同一支队伍身上。", "Rockstar 把勞爾寫成有經驗的銀行搶匪，會找願意冒險的人搭檔。他愈做愈敢加碼，整隊也要跟著承擔更高的風險。"],
    scene: ["Ten minutes before closing, Raul's quiz option is to ask a guest for a short encore and take on the scheduling change himself. The test is whether an extra song fits the actual cutoff and the crew's available time.", "只剩十分钟时，Raul 在派对题里会找嘉宾商量一段限时安可，自己接下重排。他需要确认多一首歌是否能在约定的散场时限内完成。", "散場前還剩十分鐘，勞爾會問來賓能不能來一小段安可，自己接重排。要試這個做法，先看會不會影響原來說好的收場時間。"],
    gains: [
      ["A narrow opportunity gets a fair look before it closes.", "短窗口关闭前，有机会评估一次值不值得做。", "難得的空檔要消失前，還有機會想清楚值不值得用。"],
      ["Naming what has to move makes the trade-off visible to the whole crew.", "交代要挪动的安排，让全队看到额外尝试的代价。", "把要挪掉哪一段講明白，夥伴才看得到多試一次的代價。"],
    ],
    limits: [
      ["A deadline is a constraint even when an opportunity looks attractive.", "机会再吸引人，散场时间仍是约束。", "機會再難得，也要先顧原本的散場約定。"],
      ["Repeated exceptions can leave the support crew absorbing the extra work.", "连续临时加码，额外工作容易落到没参与决定的同伴身上。", "一再臨時加東西，沒參與決定的後台夥伴也會跟著忙。"],
    ],
    workplace: ["Try a ten-minute decision note: state the time limit, what could be gained, the worst acceptable outcome and who can stop the trial. Comparing risks and negotiating a decision are separate activities.", "做一张十分钟决策卡，写清能得到什么、最多能承担什么、谁有权喊停。分析风险与组织决策是两类可分别观察的工作活动。", "把時限、可能的收益、願意承擔的最壞情況和哪個人可以喊停寫在同一張卡上。可以分別試試看，你喜歡做風險分析，還是整合意見做決定。"],
    reflection: ["With a short deadline, do you settle on a decision early or keep options alive until you have to choose?", "倒计时开始后，你更喜欢尽早确定一个方案，还是把选项保留到最后再选？", "時間開始倒數時，你會先選定一種做法，還是願意留幾個選項到最後？"],
    partner: ["jason-duval", ["Raul prices the extra opportunity in minutes. Jason checks whether the people already on the schedule can still keep their commitments.", "Raul 算多试一段需要几分钟，Jason 核对原定人员和散场承诺还能否守住。", "勞爾先估多一段要幾分鐘，傑森查原來說好的工作會不會因此被擠掉。"]],
    contrasts: [
      ["lucia-caminos", ["Lucia secures one achievable first move; Raul asks whether a narrow window allows an extra one.", "Lucia 先做一个可行起点，Raul 再问剩余窗口能不能多试一步。", "露西婭先讓事情能開始，勞爾會問這個空檔還能多做哪一步。"]],
      ["cal-hampton", ["Cal checks whether the opening is real before anyone commits time.", "Cal 会先查清最后的时段是否真的可用，再讨论投入。", "卡爾會先查最後那個時段是不是真的能用，再決定要不要花人力。"]],
    ],
  },
  "boobie-ike": {
    canon: ["Boobie built a Vice City business spanning real estate, a club and a recording studio. Rockstar highlights his partnership with Dre’Quan on Only Raw Records and the difference between his public warmth and his business dealings.", "Boobie 在罪恶都市经营地产、夜店和录音室。Rockstar 特别写到他与 Dre’Quan 合作经营 Only Raw Records，也写到他在社交和谈生意时表现不同。", "布比在罪惡城市有不動產、夜店和錄音室。Rockstar 特別提到他和德雷・泉一起做 Only Raw Records，也寫出他平時和氣、談生意時有另一套做法。"],
    scene: ["When the entrance backs up, Boobie's quiz choice is to talk to the bar next door about using its courtyard. Space, hours and cost have to become a deal both teams can deliver.", "入口堵住时，Boobie 在题里会找隔壁酒吧谈借后院。空地能用只是开头，还要约好时间、费用和双方负责的事。", "入口塞住，布比先去問隔壁酒吧能不能借後院。談的是用到幾點、費用怎麼算、兩邊各派誰到場。"],
    gains: [
      ["A verbal offer becomes a plan with a cost, a time and a named owner.", "把口头意向变成可核对的费用、时段和负责人。", "把『可以借』談成明確的時段、費用和接洽人。"],
      ["Keeping a record gives the two crews something to reuse next time.", "留下沟通记录，下一次合作才有可复用的条件。", "留下談過的條件，下次合作就知道從哪裡接。"],
    ],
    limits: [
      ["A cheap deal can still cost the creative team time or room to work.", "价格谈得好，制作团队仍可能失去所需的时间和空间。", "費用低也可能擠到表演時間，還要和製作的人確認。"],
      ["Terms only work if the people delivering them have agreed.", "由别人履行的条款，要让实际接手的人确认。", "條件談完，還得找真正要做的人過一遍。"],
    ],
    workplace: ["Try putting a proposed agreement into three lines: what is included, what has a cost and who can approve a change. Negotiating and keeping accounts each deserve a separate trial.", "把合作提案压成三行：包括什么、什么另计费用、谁可以确认变更。商务谈判与账目记录可以分别尝试。", "先用三行記下合作包了什麼、哪項要另外付錢、臨時加東西誰能同意。談條件和留帳，是兩種可以各試一次的工作。"],
    reflection: ["When both sides want a deal, do you open with shared goals or the concrete terms each side can deliver?", "双方都想合作时，你通常先讲共同目标，还是先把各方能兑现的条件摆出来？", "兩邊都有意合作，你會先聊大家想要的方向，還是先把能做到的條件攤開來談？"],
    partner: ["drequan-priest", ["Boobie secures terms and budget. Dre’Quan specifies the creative requirement the deal has to protect.", "Boobie 谈定条件与预算，Dre’Quan 补上合同和执行要守住的制作要求。", "布比把費用和合作談下來，德雷・泉說清楚哪些聲音和演出條件不能少。"]],
    contrasts: [
      ["brian-heder", ["Brian sets the internal handoff; Boobie works out what outside partners can supply.", "Brian 排内部交接，Boobie 谈外部伙伴能提供什么。", "布萊恩排的是手邊人手，布比去問場外能借到什麼。"]],
      ["real-dimez", ["Real Dimez works on making the audience want to join in; Boobie checks how the arrangement can be sustained.", "Real Dimez 让观众有兴趣加入，Boobie 核算这套合作能不能持续。", "Real Dimez 先讓人想參加，布比會看這個安排下次還能不能辦。"]],
    ],
  },
  "drequan-priest": {
    canon: ["Music was Dre’Quan’s goal even while he made a living on the street. Rockstar describes him booking acts for Boobie before setting his sights on the Vice City scene with Only Raw Records and the newly signed Real Dimez.", "Rockstar 写到，Dre’Quan 早在街头讨生活时就想做音乐。他曾为 Boobie 的场子安排演出，后来签下 Real Dimez，希望让厂牌走进罪恶都市的音乐圈。", "德雷・泉在街頭討生活時就想做音樂。Rockstar 寫到他幫布比的場子找表演，簽下 Real Dimez 後，把目光放到罪惡城市的音樂圈。"],
    scene: ["When a main speaker fails, Dre’Quan's quiz option is to rebuild the set for the small backup speakers and decide which part of the sound must survive. It is a production choice tied to an actual constraint.", "主音箱坏掉时，Dre’Quan 对应的选择是为备用小音箱重排演出，并确定哪些声音特点必须保留。这个取舍直接由手上的器材决定。", "主喇叭壞了，德雷・泉會想怎麼用小喇叭重排演出。先決定觀眾應該聽到哪個聲音特色，再看其他部分怎麼縮。"],
    gains: [
      ["Naming the key sound helps the crew revise without losing the identity of the set.", "先说清最重要的声音特点，改编时才有依据。", "知道哪個聲音最要緊，改編才不會把味道丟掉。"],
      ["A short listening check tells the crew more than another argument about taste.", "用短试听校对效果，制作讨论有了共同材料。", "先放一小段讓大家聽，討論就有同一份素材。"],
    ],
    limits: [
      ["One more revision can leave the performers without time to rehearse it.", "多改一版可能只够制作完成，留不出表演者试演的时间。", "再修一次會吃掉台上試演的時間。"],
      ["The strongest sound concept still has to fit the staff and equipment on hand.", "声音概念再好，也要能由现有人员与器材实现。", "再好的聲音想法，也要用手邊的人和設備做得出來。"],
    ],
    workplace: ["Write one thing the finished work must keep, a test the team can listen to or watch, and an editing cutoff. Creating the work and coordinating the resources are different jobs even when one person does both.", "写出交付必须保留的一个特点、一个能试听或试看的小样，以及停止修改的时间。做出作品与统筹制作资源是可分别探索的活动。", "先寫下一個必須保住的特色、一段能試聽或試看的樣品，再約好幾點停止修改。做作品、排製作資源，可以分開感受。"],
    reflection: ["While revising a piece, do you start with the detail you can hear or the overall feel you want people to remember?", "修改作品时，你先抓能听见的具体细节，还是先想希望大家记住的整体感觉？", "改作品時，你會先從實際聽到的細節下手，還是先想觀眾散場後會記得什麼？"],
    partner: ["real-dimez", ["Dre’Quan protects the set’s sound and cue. Real Dimez gives the audience a reason to stay with it while the stage changes.", "Dre’Quan 确认声音和上场节点，Real Dimez 在换场时给观众一个继续参与的理由。", "德雷・泉保住音色和上台的節點，Real Dimez 在換場時帶觀眾繼續玩。"]],
    contrasts: [
      ["boobie-ike", ["Boobie negotiates which equipment is available; Dre’Quan decides what it has to deliver.", "Boobie 谈能拿到哪些设备，Dre’Quan 决定还需要做出什么效果。", "布比談的是能借到哪些器材，德雷・泉管的是要用它們做出怎樣的演出。"]],
      ["raul-bautista", ["Raul wants to try a new opening; Dre’Quan checks how the alternative changes the work.", "Raul 想试新窗口，Dre’Quan 先听备选会把作品改成什么样。", "勞爾想把握能試新東西的空檔，德雷・泉先試聽作品會變成什麼樣。"]],
    ],
  },
  "real-dimez": {
    canon: ["Bae-Luxe and Roxy have been friends since high school. Rockstar introduces them as a rap duo with a strong social-media presence, an early hit with DWNPLY and a new deal with Only Raw Records.", "Bae-Luxe 和 Roxy 从高中相识，后来组成 Real Dimez。官方档案提到她们善用社交媒体、曾和 DWNPLY 合作走红，以及之后签入 Only Raw Records。", "Bae-Luxe 和 Roxy 從高中就認識，後來組成說唱團體 Real Dimez。Rockstar 提到她們靠音樂和社群聚人氣，和 DWNPLY 有過一首熱門合作，之後簽入 Only Raw Records。"],
    scene: ["When the queue stalls, the quiz gives this duo's role to one player: offer the waiting crowd a simple thing they can join. Try a short call-and-response while a partner handles sound or the line, with room for people to sit it out.", "排队卡住时，这组结果把热场分工交给一个答题者：先给愿意参与的观众一个简单动作，搭档继续处理音响或队伍，其他人可以安心等候。", "隊伍動不了，這份結果讓一個人負責熱場。先叫願意玩的人試一小段互動，搭檔繼續顧器材或入口，也留位置給只想等的人。"],
    gains: [
      ["A low-effort invitation gives the audience something to do while it waits.", "低门槛互动能给愿意加入的人一点事做。", "不用準備就能加入，等候的人也有事可以一起做。"],
      ["Splitting crowd and backstage duties keeps one person from having to watch both.", "台前互动与后台进度分开负责，降低两头都顾不过来的概率。", "前台帶氣氛和後台處理分給兩人，就不用一個人顧兩頭。"],
    ],
    limits: [
      ["Excitement cannot tell the team why the entrance is still backed up.", "现场热起来之后，入口堵塞的原因仍需要有人处理。", "氣氛帶起來也不會自動讓隊伍往前，入口還是得找人處理。"],
      ["Make filming optional and leave space for people who want to wait quietly.", "录制须自愿，也应给希望安静等候的人留出空间。", "想拍影片要讓人自己選要不要入鏡，也給只想等的人留個地方。"],
    ],
    workplace: ["Try writing a short invitation, asking someone to run it with you, then observing who participates without being prompted twice. Creative expression and helping others join are activity examples.", "可以写一条短邀请，请别人一起试，再观察谁愿意主动参加。创意表达和帮助别人加入，是两类可试的活动。", "寫一段好懂的邀請，找一個人一起試，看看有多少人不用再催就想參加。創作和讓人參與，可以各自試一次。"],
    reflection: ["When you have an idea for a group, does it take shape as you share it, or do you prefer a first draft to yourself?", "有了一个适合团队的点子，你是在分享中把它想清楚，还是喜欢先独自做出初稿？", "想到一個大家可以一起玩的點子，你會邊講邊想清楚，還是先自己寫一版再分享？"],
    partner: ["drequan-priest", ["Real Dimez gives the crowd something to join while Dre’Quan gets the next track ready.", "Real Dimez 照顾等候中的客人，Dre’Quan 准备下一段声音。", "Real Dimez 帶等候的人做一小段互動，德雷・泉把下一段聲音準備好。"]],
    contrasts: [
      ["cal-hampton", ["Cal checks what can be said about the delay; the duo gives the crowd a useful way to spend it.", "Cal 核实关于延误能说什么，双人组给观众一个打发等候时间的办法。", "卡爾查延誤原因能不能講；雙人組先讓等待有事可做。"]],
      ["boobie-ike", ["Boobie secures room for the crowd; the duo works on what people can do once they are there.", "Boobie 解决观众在哪等，双人组解决到了那里能做什么。", "布比談可以去哪裡等，雙人組想的是到那裡之後怎麼帶大家玩。"]],
    ],
  },
};

export function gta6ProfileReading(id: string, locale: DisplayLocale) {
  const career = gta6CareerRows.find(row => row.role === id);
  if (!career) return;
  return { career, reading: gta6ProfileReadings[career.role], index: gta6ReadingLocale[locale] };
}

export const gta6OccupationNotes: Record<(typeof gta6CareerRows)[number]["jobs"][number][0], Text> = {
  "general-and-operations-managers": ["Coordinate staffing and daily operations across teams. Check the industry experience and scope of responsibility in each opening.", "协调人员与跨部门的日常运营。读招聘时重点看行业经验和管理范围。", "協調跨單位人手和日常營運。看職缺時留意產業經驗及實際管理範圍。"],
  "project-management-specialists": ["Coordinate scope, schedules and resources. Look at which planning and stakeholder skills the employer wants.", "协调范围、时间表和资源。核对岗位实际要求的计划与沟通技能。", "排專案範圍、時程和資源；實際要懂哪些規劃工具，依職缺確認。"],
  "logisticians": ["Coordinate flows across inventory, suppliers and transport. Review the systems the employer uses for scheduling and tracking.", "衔接库存、供应商与运输。了解岗位用什么系统做排程和追踪。", "把庫存、供應商和運輸接起來；可以先查工作用哪一套排程與追蹤系統。"],
  "occupational-health-and-safety-specialists": ["Review workplace conditions and help prevent hazards. Check which safety training and qualifications apply locally.", "评估工作环境并协助预防危害。查清当地适用的安全培训和资质。", "檢視工作環境、協助預防危害；職安訓練與資格以所在地規定為準。"],
  "information-security-analysts": ["Review alerts and help protect systems and data. Look at the role's networking, documentation and incident-response duties.", "核查告警，协助保护系统与数据。查看岗位对网络、记录和事件响应的要求。", "看警示紀錄並協助保護系統。先了解職缺要處理網路、寫紀錄，還是要輪值做事件應變。"],
  "intelligence-analysts": ["Compare sources and document uncertainty for decision-makers. Review the employer’s research and evidence-handling requirements.", "交叉核对来源，向决策者说明不确定性。核对雇主对研究与证据处理的要求。", "比對來源，寫清哪些事還沒有把握。各單位對資料使用和研究能力的要求不同。"],
  "supply-chain-managers": ["Coordinate purchasing, warehousing and transport. Check the level of budget, supplier and inventory responsibility.", "统筹采购、仓储与运输。了解岗位必须承担多大的预算和库存责任。", "協調採購、倉儲和運輸；先問清要管多少預算、供應商與庫存。"],
  "management-analysts": ["Examine workflows and compare ways to improve them. Look for the expected analysis methods and industry knowledge.", "调查流程、比较改进办法。了解岗位要求的分析方法和行业知识。", "看流程哪裡卡住，提幾種可比的調整。先查需要用哪些分析方法，以及要懂多少產業情況。"],
  "emergency-management-directors": ["Coordinate readiness plans and organizational response. Review local experience and training requirements before pursuing the role.", "协调应急准备与机构响应。先核对当地对经验和培训的要求。", "協調整備計畫和各單位的應變工作；經驗、訓練和進用條件要依地區查。"],
  "financial-risk-specialists": ["Analyze exposures and document potential losses. Check quantitative skills, regulations and industry requirements for the role.", "分析风险敞口与潜在损失。查清岗位对应的量化技能、行业与监管要求。", "分析風險部位和可能損失。可以先確認職缺看重哪些數量分析能力，以及要熟悉哪些規範。"],
  "property-real-estate-and-community-association-managers": ["Coordinate property operations, vendors and occupant needs. Verify applicable local property-management rules.", "协调物业运营、服务商与使用者需求。查清当地适用的物业管理规定。", "協調物業運作、廠商和住戶需求；相關管理規定要按所在地確認。"],
  "sales-managers": ["Set sales priorities, coach staff and review performance. Check the industry, team size and reporting responsibilities.", "制定销售重点、辅导团队并复盘结果。了解行业、团队规模和汇报责任。", "定業務重點、帶同事和看成果。可以先問要帶幾人、怎麼報表、主要面對哪類客戶。"],
  "sound-engineering-technicians": ["Set up, monitor or edit sound. Check whether the position prioritizes live equipment, recording or post-production skills.", "搭建、监听或编辑音频。区分岗位更看现场设备、录音还是后期能力。", "接器材、監聽或編輯聲音；先看看職缺偏現場音響、錄音，還是後製。"],
  "producers-and-directors": ["Coordinate creative decisions, teams and production resources. Review the production experience and work samples asked for.", "协调创作决策、人员与制作资源。核对岗位看重的制作经历与作品样本。", "把創作決定、人手和製作資源排在一起。想入行，可以先看會要求什麼經驗和作品。"],
  "search-marketing-strategists": ["Study search intent and landing-page outcomes. Check which research and measurement tools the employer expects.", "研究搜索意图并复盘落地页效果。查看岗位要求使用的研究与测量工具。", "研究大家怎麼搜尋、點進去後做了什麼。可以先看工作需要哪些研究和成效工具。"],
  "public-relations-specialists": ["Plan messages and coordinate audience or media communication. Look at the role's writing and stakeholder needs.", "整理对外信息，协调媒体或公众沟通。查看岗位所需的写作和对接经验。", "整理要對外說的話，和媒體或觀眾溝通。先查平常要寫什麼、會和哪些人合作。"],
};

export function gta6ReadingFaq(locale: DisplayLocale, name: string, role: string) {
  const index = gta6ReadingLocale[locale];
  const example = gta6ProfileReading(role, locale)?.reading.reflection[index];
  const scope = [
    "The result describes choices in this fictional scene. To explore personality preferences or career interests, answer the corresponding assessment separately.",
    "角色结果描述你在虚构情境里的选择。想了解人格偏好或职业兴趣，需要另做对应测评。",
    "結果只反映這個故事裡的選擇。想了解人格偏好或職業興趣，要另外做相應的測驗。",
  ][index];
  return [
    {
      question: [`Does matching ${name} tell me my MBTI type or Holland Code?`, `测出 ${name} 能知道我的 MBTI 或霍兰德代码吗？`, `配對到 ${name} 能知道我的 MBTI 或霍蘭德代碼嗎？`][index],
      answer: example ? `${scope} ${example}` : scope,
    },
    {
      question: [`How can a friend team up with ${name}?`, `如何用 ${name} 的结果邀请朋友组队？`, `怎麼用 ${name} 的結果揪朋友組隊？`][index],
      answer: [
        "Send this public character guide. A friend can use its team-up button and finish the 12 questions to see both roles and a discussion prompt. The public link contains the character identity only.",
        "把这份公开角色指南发给朋友。朋友从组队按钮进入并完成 12 题，就能看到两人的分工和讨论题。公开链接只标识角色。",
        "把這份公開角色指南傳給朋友。對方按組隊按鈕、答完 12 題，就會看到兩人的分工和一個討論題。公開連結只會帶角色名稱。",
      ][index],
    },
  ];
}
