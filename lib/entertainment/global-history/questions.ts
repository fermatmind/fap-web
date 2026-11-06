import type { Copy } from "../types";

export const historyAxes = [
  { zh: "行动节奏", en: "Pace", low: { zh: "先准备周全", en: "Prepare thoroughly" }, high: { zh: "先行动再调整", en: "Act, then adjust" } },
  { zh: "协作方式", en: "Collaboration", low: { zh: "先独立完成", en: "Work independently first" }, high: { zh: "先把人聚在一起", en: "Bring people together first" } },
  { zh: "探索方法", en: "Inquiry", low: { zh: "从现有证据出发", en: "Start with the evidence at hand" }, high: { zh: "从新的设想出发", en: "Start with a new possibility" } },
  { zh: "关注范围", en: "Scope", low: { zh: "钻深一个主题", en: "Go deep on one subject" }, high: { zh: "连接不同领域", en: "Connect different fields" } },
  { zh: "推动改变", en: "Change", low: { zh: "改善现有做法", en: "Improve what already works" }, high: { zh: "重新设计规则", en: "Redesign the rules" } },
  { zh: "影响方式", en: "Influence", low: { zh: "用幕后工作推动", en: "Make a difference behind the scenes" }, high: { zh: "走到台前表达", en: "Speak up in public" } },
] as const;

type Axis = 0 | 1 | 2 | 3 | 4 | 5;
type Step = 0 | 1 | 2 | 3;
type Choice = readonly [Step, string, string];
type Scene = { label: Copy; prompt: Copy; axis: Axis; options: readonly [Choice, Choice, Choice, Choice] };

export const historyScenes: readonly Scene[] = [
  {
    label: { zh: "开馆前 · 漏雨的展厅", en: "Before opening · The leaky gallery" }, axis: 0,
    prompt: { zh: "屋顶漏水，布展得换地方。离开馆还有两小时，你先做什么？", en: "The roof is leaking and the displays have to move. The doors open in two hours. What do you do first?" },
    options: [
      [1, "先列出最怕受潮的展品，再带人按顺序搬。", "List the most vulnerable objects, then move them in order."],
      [3, "马上移出第一批展品，边搬边决定新布局。", "Move the first set of objects immediately and work out the new layout as you go."],
      [0, "先画好新动线并核对每件展品的位置，再开始搬。", "Draw the new route and assign every object a place before moving anything."],
      [2, "先腾出安全区搬两件，拿实际效果定后面的安排。", "Clear a safe area and move two pieces to see what the rest of the move will need."],
    ],
  },
  {
    label: { zh: "开馆前 · 没有说明的地图", en: "Before opening · The map without a label" }, axis: 1,
    prompt: { zh: "一张旧地图缺了说明。馆员、设计师和当地居民都懂一点，你打算怎么把说明写出来？", en: "An old map has no label. A curator, a designer and a local resident each know a little about it. How do you write the label?" },
    options: [
      [3, "把三个人叫到地图前，现场一起定写法。", "Bring all three to the map and draft the label together."],
      [0, "自己查资料并写出完整初稿，再交给编辑。", "Do the research and write a complete draft on your own before passing it to an editor."],
      [2, "让三人分别准备一个发现，再一起把线索拼起来。", "Ask each person to bring one finding, then assemble the pieces together."],
      [1, "自己定框架，只请最熟悉地图的人核对疑点。", "Draft the outline yourself and ask the map expert to check the tricky parts."],
    ],
  },
  {
    label: { zh: "开馆前 · 信上的暗号", en: "Before opening · A sign in the margins" }, axis: 2,
    prompt: { zh: "几封信的边角都画着同样的符号，却没人知道是什么意思。你会从哪里开始？", en: "Several letters carry the same symbol in the margin, but nobody knows what it means. Where do you start?" },
    options: [
      [0, "按日期和收信人排好，找符号在哪些信里出现。", "Sort the letters by date and recipient and check where the symbol actually appears."],
      [2, "先写下两种可能的含义，再挑最容易检验的一种。", "Imagine two possible meanings, then pick the one you can test most easily."],
      [3, "把它当作画、记号和缩写分别解读，看看哪条新路最有意思。", "Try reading it as a drawing, a mark and an abbreviation. Follow the most interesting new lead."],
      [1, "找出一封最完整的信，从前后文提一个解释。", "Start with the most complete letter and suggest an explanation from its context."],
    ],
  },
  {
    label: { zh: "开馆前 · 一格空展柜", en: "Before opening · One empty case" }, axis: 3,
    prompt: { zh: "展柜里还空着一格，只够讲一个小故事。你会选什么？", en: "One space in the display case is still empty. There is room for just one small story. What goes there?" },
    options: [
      [2, "用两件不同地方的物品，讲一种相似的生活习惯。", "Pair objects from two places to tell the story of a shared habit."],
      [0, "挑一件器物，讲清它的磨损、修补和原主人。", "Choose one object and trace its wear, repairs and original owner in detail."],
      [1, "用同一作坊的几件物品，讲一门手艺的变化。", "Use pieces from one workshop to show how a craft changed over time."],
      [3, "把航海图、香料和账本放在一起，讲一条贸易路线。", "Put a sailing chart, spices and a ledger together to tell the story of a trade route."],
    ],
  },
  {
    label: { zh: "开馆前 · 太长的队伍", en: "Before opening · The long queue" }, axis: 4,
    prompt: { zh: "预演时，观众都堵在第一个展台。经费只够做一处改动，你选哪一处？", en: "During the preview, everyone crowds around the first display. The budget covers one change. What do you change?" },
    options: [
      [3, "取消固定参观顺序，把入口改成可任选的路线图。", "Drop the fixed order and make the entrance a map of routes visitors can choose."],
      [1, "保留路线，把最常被问到的问题提前贴出来。", "Keep the route and put answers to the most common questions near the entrance."],
      [2, "把第一站拆成两个入口，让两组观众并行。", "Split the first stop into two entrances so groups can begin in parallel."],
      [0, "把展台挪开半米，加一个醒目的排队标记。", "Move the display a little and add a clear sign showing where to queue."],
    ],
  },
  {
    label: { zh: "开馆前 · 第一次导览", en: "Before opening · The first tour" }, axis: 5,
    prompt: { zh: "导览员怕讲错一个细节。离首场导览还有一刻钟，你最愿意帮哪一手？", en: "The guide is worried about getting a detail wrong. The first tour starts in fifteen minutes. How would you help?" },
    options: [
      [0, "悄悄写一张提示卡，让导览员随手看。", "Write a small cue card the guide can glance at quietly."],
      [2, "在那段站到导览员身边，开口补一个关键细节。", "Stand beside the guide and step in briefly to explain the key detail."],
      [1, "先陪导览员练一遍，正式开讲时在旁边照应。", "Run through it together, then stay nearby for the real tour."],
      [3, "自己向观众讲最难的那一段，让导览员接着往下带。", "Explain the hardest part to the group yourself, then hand the tour back."],
    ],
  },
  {
    label: { zh: "开馆后 · 突然借来的展品", en: "After opening · An unexpected loan" }, axis: 0,
    prompt: { zh: "一位来客只愿借出自己的老物件一天。时间很短，你怎样安排？", en: "A visitor offers to lend a treasured object for one day only. How do you use that time?" },
    options: [
      [2, "先录下主人讲的一段故事，再边听边决定怎么展示。", "Record one story from the owner, then decide how to present it as you listen."],
      [0, "先把保管、说明和归还时间安排好，再确定展示方式。", "Plan care, labeling and return times before deciding how to display it."],
      [3, "马上安排一场短讲，请主人自己把故事带给观众。", "Set up a short talk right away and let the owner tell the story."],
      [1, "先核对来历并写好一张简短说明，再放进现有展柜。", "Check its provenance and write a short label before adding it to an existing case."],
    ],
  },
  {
    label: { zh: "开馆后 · 两种记忆", en: "After opening · Two memories" }, axis: 1,
    prompt: { zh: "两位来客对同一段地方往事记得不同。你要为展览加一张补充说明，怎么着手？", en: "Two visitors remember the same local event differently. You want to add a note to the exhibit. How do you start?" },
    options: [
      [0, "分别听完两人，再独自整理两种说法。", "Listen to both people separately, then arrange the two accounts on your own."],
      [3, "请两人和馆员围桌聊，让他们一起决定说明怎么写。", "Invite both visitors and the curator to sit down and decide how the note should read together."],
      [1, "先写出并列的两个版本，再请两人分别确认。", "Draft both accounts side by side and ask each person to check theirs."],
      [2, "请两人各写一段，你们一起商量怎样摆在展柜里。", "Ask both to write a short account, then decide together how to display them."],
    ],
  },
  {
    label: { zh: "开馆后 · 残缺的声音", en: "After opening · The missing sound" }, axis: 2,
    prompt: { zh: "展览想让观众听见一种旧乐器，但留下的只有残缺乐谱。你会怎么处理？", en: "You want visitors to hear an old instrument, but only fragments of the music survive. What would you do?" },
    options: [
      [3, "邀请乐手用片段发展一段当代即兴，并标明是新创作。", "Invite a musician to build a modern improvisation from the fragment and label it as new work."],
      [1, "按留下的音符演奏，缺的地方用停顿让观众听出来。", "Play the surviving notes and leave pauses where the music is missing."],
      [0, "先展示可辨认的音符和同年代的录音资料，再决定是否演奏。", "Show the legible notes and any recordings from the period before deciding whether to perform it."],
      [2, "试奏两种可能的补法，让观众听出选择之间的差别。", "Play two plausible completions so visitors can hear how the choices differ."],
    ],
  },
  {
    label: { zh: "开馆后 · 借来的档案箱", en: "After opening · A borrowed archive box" }, axis: 3,
    prompt: { zh: "一箱新档案里有日记、货单和家书。只能安排一次公开活动，你想讲什么？", en: "A new box contains diaries, bills of sale and family letters. There is time for one public event. What do you want to explore?" },
    options: [
      [1, "选一户人家的几封信，沿着时间讲他们的变化。", "Follow one household through a series of letters to see what changed for them."],
      [3, "用三种材料拼出同一条街的生活，让大家看到不同的人如何相遇。", "Use all three kinds of records to reconstruct life on one street and see where different people crossed paths."],
      [2, "把同一天的日记和货单对着读，比较两种记事方式。", "Read a diary and a bill of sale from the same day to compare what each records."],
      [0, "选一页日记，带大家逐行读它如何写下一天。", "Pick one diary page and read it line by line to see how one day was recorded."],
    ],
  },
  {
    label: { zh: "闭馆前 · 谁能进档案室", en: "Before closing · Who gets into the archive" }, axis: 4,
    prompt: { zh: "档案室只在工作日开放，附近学生几乎来不了。你有机会提一个改变。", en: "The archive opens on weekdays only, so nearby students rarely get to visit. You can propose one change." },
    options: [
      [1, "保留开放时间，先给学校提供可借出的资料包。", "Keep the hours and make a loan kit available to schools first."],
      [0, "把现有的预约时段整理清楚，让学校更容易约到。", "Clarify the existing appointment slots so schools can book them more easily."],
      [3, "重新安排开放制度，让周末场次成为常规服务。", "Redesign access so weekend sessions become a regular service."],
      [2, "试开一个周末档案时段，再根据报名情况调整。", "Pilot a weekend archive session and adjust it based on sign-ups."],
    ],
  },
  {
    label: { zh: "闭馆前 · 留给下一班的人", en: "Before closing · A handover for tomorrow" }, axis: 5,
    prompt: { zh: "一天结束，明天来的是一班没参与筹备的志愿者。你会怎样把经验交给他们？", en: "The day is over. Tomorrow’s volunteers missed the preparations. How would you pass on what you learned?" },
    options: [
      [2, "明早用五分钟当面讲三个容易踩的坑。", "Give them a five-minute briefing on three things that caught you out."],
      [3, "带大家走一遍展厅，当场示范遇到难题怎么处理。", "Walk the whole team through the gallery and demonstrate how to handle the hard parts."],
      [0, "把易漏的步骤整理成一页清单，留在值班桌上。", "Leave a one-page checklist of easy-to-miss steps at the duty desk."],
      [1, "和下一班领队一对一交接，让他按需要转达。", "Brief the next shift leader one to one and let them decide what to pass on."],
    ],
  },
];
