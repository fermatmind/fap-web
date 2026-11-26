import type { DisplayLocale } from "@/lib/i18n/locales";
import type { ArchetypeHonorCopy } from "../archetypeHonorCardCopy";
import { wave2bPracticeBands } from "../wave2bResult";

type Band = (typeof wave2bPracticeBands)[number];
type LocalLine = readonly [string, string, string];
type PracticeLines = readonly [LocalLine, LocalLine, LocalLine, LocalLine];

const badges = {
  review: [["未达半数", "完成一轮", "起步记录"], ["未達半數", "完成一輪", "起步紀錄"], ["Below Half", "Practice Complete", "Progress Check"]],
  building: [["至少半数", "完成一轮", "还有空间"], ["至少半數", "完成一輪", "還有空間"], ["Halfway or More", "Practice Complete", "Room to Grow"]],
  strong: [["高正确率", "多数答对", "亮眼一轮"], ["高正確率", "多數答對", "亮眼一輪"], ["High Accuracy", "Most Correct", "Sharp Run"]],
  perfect: [["全部答对", "没有错项", "题本满分"], ["全部答對", "沒有錯題", "題本滿分"], ["All Correct", "Zero Misses", "Full Marks"]],
} as const;

const verdicts = {
  "logical-reasoning": [
    ["你完成了整套推理题，可以从一条漏掉的条件开始，看看它怎样改变结论。", "你做完了整套推理題，可以從一條漏掉的條件開始，看看它怎麼改變結論。", "You finished the bank. Pick a missed condition and trace how it changes the conclusion."],
    ["你答对了至少一半，可以挑一道错题看看它在哪一步换了推理方向。", "你至少答對一半，可以挑一題看看，推理是在哪一步換了方向。", "You got at least half right. Try tracing one missed inference back to where it turned."],
    ["你答对了大部分推理题，剩下的几题值得回头找找那个没被带上的条件。", "你答對了大部分推理題，剩下的幾題值得回頭找找看，有沒有漏帶條件。", "You got most of these right. The remaining items are a good place to look for a dropped rule."],
    ["你这轮推理题全部答对，可以挑一道题把每条条件怎样接上讲给别人听。", "你這次的推理題全部答對，可以挑一題，把每個條件怎麼接起來講給別人聽。", "You got every item right. Pick one deduction and see if you can explain every link."],
  ],
  "english-proficiency": [
    ["你做完了这组英语题，可以先回看一道题的上下文，找找选项差在哪里。", "你做完了這組英文題，可以先回頭看一題的上下文，找找選項差在哪裡。", "You finished the English set. Revisit one passage and see which words narrow the choice."],
    ["你已经答对至少一半，余下的题可以试试从句子前后各找一个线索。", "你已經至少答對一半，其他題目可以試著從句子前後各找一個線索。", "You got at least half right. Try finding a clue on either side of a phrase you missed."],
    ["你答对了大部分英语题，复盘时可以比较原文和干扰项差了哪个词。", "你答對了大部分英文題，複習時可以比一比，原文和干擾選項差在哪個字。", "You got most right. Compare the passage with a distractor and find the word that differs."],
    ["你这轮英语题全对，可以试着给一个干扰项写一句解释，看看它为何不通。", "你這次英文題全對，可以替一個干擾選項寫句解釋，說說它為什麼不合文意。", "You got every English item right. Try explaining why one convincing distractor fails."],
  ],
  "number-series": [
    ["你走完了整套数列题，可以从相邻两项的差开始重新观察一道题。", "你做完了整套數列題，可以從相鄰兩項的差開始，重新觀察一道題。", "You finished the sequences. Start with neighboring differences and revisit one pattern."],
    ["你这一轮答对至少一半，可以拿两道题对照，是固定差还是差也在变。", "你這次至少答對一半，可以拿兩題比較，是固定差，還是差值也在變。", "You got at least half right. Compare a constant gap with one that changes each step."],
    ["你答对大部分数列题，剩下的题不妨把奇数位和偶数位拆开来看。", "你答對大部分數列題，剩下的題目可以試著把奇數位和偶數位分開看。", "You got most right. See what changes when you split odd and even positions in a sequence."],
    ["你这次数列题全对，可以挑一个规律写成规则，再用它算下一项。", "你這次數列題全對，可以挑一個規律寫成規則，再用它算下一項。", "You got every sequence right. Write one rule explicitly and see what comes after the last term."],
  ],
  "situational-judgement": [
    ["你完成了这组情境题，回看一道题时，可以先区分信息不够和权限不够。", "你完成了這組情境題，回看一題時，可以先區分資訊不夠和權限不夠。", "You finished the scenarios. Revisit one and separate missing facts from missing permission."],
    ["你答对了至少一半，值得对照看看哪种交接说清了谁负责下一步。", "你至少答對一半，值得對照看看，哪種交接把誰負責下一步說清楚了。", "You got at least half right. Compare which handoff makes it clear who takes the next step."],
    ["你答对了大部分情境题，可以复盘一个看似体贴但承诺过头的选项。", "你答對大部分情境題，可以回看一個看似體貼、卻把承諾說太滿的選項。", "You got most scenarios right. Revisit one helpful-sounding reply that promises too much."],
    ["你这组情境题全对，可以找一道题说说，清楚交接比赶快答应多了什么。", "你這組情境題全對，可以挑一題說說，交接清楚比趕快答應多做了什麼。", "You got them all right. Explain one scenario where a clear handoff beats a quick yes."],
  ],
  "problem-solving-critical-thinking": [
    ["你做完了这组题，回头挑一题，分开看问题是什么和手上有什么证据。", "你做完了這組題，回頭挑一題，把問題是什麼和手上有什麼證據分開看。", "You finished the bank. Pick a problem and separate the question from the available evidence."],
    ["你答对至少一半，可以回看一题，试试把眼前的判断和下一步核实分开。", "你至少答對一半，可以回看一題，試著把眼前的判斷和下一步查證分開。", "You got at least half right. On one item, separate your first judgment from your next check."],
    ["你答对了大部分题，复盘时可以追一下哪条新信息真的会改变决定。", "你答對了大部分題目，複習時可以找找，哪一條新資訊真的會改變決定。", "You got most right. Look for the new information that would actually change a decision."],
    ["你这一轮全对，挑一个决策工具写成两步，也可以拿去对照新的问题。", "你這次全對，挑一個決策工具寫成兩步，也可以拿去對照新的問題。", "You got everything right. Turn one decision tool into two steps you could try on a new problem."],
  ],
  "german-proficiency": [
    ["你做完了这组德语题，可以先挑一题看看冠词的变化由哪一部分决定。", "你做完了這組德文題，可以先挑一題看看，冠詞的變化由哪一部分決定。", "You finished the German set. Pick one item and see what determines the article form."],
    ["你已经答对至少一半，复盘时不妨把主句和从句的动词位置圈出来。", "你已經至少答對一半，複習時可以把主句和從句的動詞位置圈出來。", "You got at least half right. Compare verb placement in a main clause and a subordinate clause."],
    ["你答对了大部分德语题，可以回看让你犹豫的词尾，弄清它跟谁对应。", "你答對了大部分德文題，可以回看讓你猶豫的字尾，弄清楚它跟哪個詞對應。", "You got most German items right. Revisit one ending and trace what it needs to agree with."],
    ["你这轮德语题全对，可以选一个句型换个名词，看看哪些形式也要跟着变。", "你這次德文題全對，可以挑一個句型換個名詞，看看哪些形式也要跟著變。", "You got them all right. Swap a noun in one sentence and see which forms need to change."],
  ],
  "word-skills": [
    ["你做完了 Word 题，可以回看样式和手动格式在哪一步有区别。", "你做完了 Word 題，可以回看樣式和手動格式在哪一步有差異。", "You finished the Word set. Revisit a question about styles versus manual formatting."],
    ["你答对至少一半，可以挑一个分页情境，看看需要分页还是换一个节。", "你至少答對一半，可以挑一個分頁情境，看看需要分頁還是分節。", "You got at least half right. Revisit when a page break is enough and when you need a section."],
    ["你答对了大部分 Word 题，剩下的可以试着在空白文件里复现一下。", "你答對了大部分 Word 題，其他題目可以試著在空白文件裡操作看看。", "You got most Word items right. Try reproducing one of the remaining tasks in a blank file."],
    ["你这一轮 Word 题全对，可以用一份空白文档试试把样式用到好几处。", "你這次 Word 題全對，可以在空白文件把同一個樣式套到不同地方。", "You got every Word item right. Try applying one style in several places in a blank document."],
  ],
  "abstract-reasoning": [
    ["你完成了这组图形题，可以先回看一次转动，分开数方向和位置的变化。", "你完成了這組圖形題，可以先回看一次轉動，分開數方向和位置的變化。", "You finished the pattern set. Revisit one turn and separate direction changes from position."],
    ["你答对至少一半，试着用同一条规则核对另一格，别只看第一组像不像。", "你至少答對一半，可以用同一條規則核對另一格，別只看第一組像不像。", "You got at least half right. Test the rule on a second cell to confirm the first pair."],
    ["你答对了大部分图形题，剩下的题可以复查哪一步是旋转、哪一步是翻转。", "你答對了大部分圖形題，其他題目可以查看哪一步是旋轉、哪一步是翻轉。", "You got most right. Recheck which step turns a figure and which one reflects it."],
    ["你这组图形题全对，可以画个新例子，看看同一条规则还能怎样变出下一格。", "你這組圖形題全對，可以畫個新例子，看看同一條規則還能怎麼變出下一格。", "You got every pattern right. Draw a fresh example and see how the same rule carries across."],
  ],
  "aptitude-test": [
    ["你走完了这组混合练习，先挑一道错题看看卡在读题、选规则还是执行。", "你做完了這組混合練習，先挑一題看看卡在讀題、選規則還是實際計算。", "You finished the mixed set. Find out if one miss came from reading, setup, or execution."],
    ["你答对至少一半，回看时可以把文字、数值和校对题分开比较。", "你至少答對一半，複習時可以把文字題、數字題和校對題分開比較。", "You got at least half right. Compare your reading, numerical, and checking items separately."],
    ["你答对了大部分题，剩下的几道可以逐一重放，当初最早在哪一步岔开。", "你答對了大部分題目，剩下的幾題可以從頭做，看看最早在哪一步岔開。", "You got most right. Replay a missed item and find the first step where your answer diverged."],
    ["你这一套全对，可以挑两种不同题型，说说各自最值得保留的核对步骤。", "你這一套全對，可以挑兩種不同題型，說說各自最值得保留的核對步驟。", "You got the full set right. Pick two item types and name the check that matters most for each."],
  ],
  "computer-literacy": [
    ["你完成了这组电脑题，回看一道文件题，可以先找找下载后的实际位置。", "你完成了這組電腦題，回看一題檔案題，可以先找找下載後的實際位置。", "You finished the computer set. Revisit a file question and trace where that download goes."],
    ["你答对至少一半，可以拿两道题对照，看看什么时候要先检查附件和地址。", "你至少答對一半，可以拿兩題比較，看看什麼時候要先檢查附件和地址。", "You got at least half right. Compare when it helps to check an attachment or an address first."],
    ["你答对了大部分电脑题，不妨用一个空白文件还原剩下题目的操作。", "你答對了大部分電腦題，可以用空白檔案試試重做剩下題目的操作。", "You got most computer items right. Try one of the remaining steps in a blank file."],
    ["你这轮电脑题全对，可以挑一个操作讲清楚，也把容易弄错的地方说出来。", "你這次電腦題全對，可以挑一個操作講清楚，也把容易弄錯的地方說出來。", "You got every item right. Explain one workflow and point out the step that’s easy to miss."],
  ],
  "numerical-reasoning": [
    ["你做完了这组数值题，回看一题时，可以先把每个数字的单位写出来。", "你做完了這組數字題，回看一題時，可以先把每個數字的單位寫出來。", "You finished the numerical set. Write down the units before revisiting one calculation."],
    ["你答对至少一半，可以挑一道百分比题，重算前先找清楚比较的基数。", "你至少答對一半，可以挑一題百分比，重算前先找清楚拿哪個數當基準。", "You got at least half right. Identify the base of a percentage before calculating."],
    ["你答对了大部分数值题，复盘时可以查查哪里换了单位或比较基准。", "你答對了大部分數字題，複習時可以查查，哪一步換了單位或比較基準。", "You got most right. Look for a changed unit or comparison base in the remaining questions."],
    ["你这轮数值题全对，可以试着用另一种算法核对一道比例题。", "你這次數字題全對，可以試著用另一種算法核對一道比例題。", "You got all the numerical items right. Check a ratio with a second method and compare."],
  ],
  "communication-adaptability": [
    ["你做完了这组沟通题，可以先回看一题，找出谁接收消息和需要知道什么。", "你做完了這組溝通題，可以回看一題，想想誰要接收訊息、需要知道什麼。", "You finished the communication set. Revisit one message and identify who needs to know what."],
    ["你答对至少一半，回看时可以比较哪种方式既能传到，又方便事后查找。", "你至少答對一半，回看時可以比一比，哪種方式既能傳到，也方便之後查找。", "You got at least half right. Compare which channel reaches people and leaves a usable record."],
    ["你答对了大部分沟通题，可以回看一题，找出怎样确认对方听懂了哪一步。", "你答對了大部分溝通題，可以回看一題，想想怎麼確認對方聽懂了哪一步。", "You got most right. Revisit one item and look for the clearest check of shared understanding."],
    ["你这组沟通题全对，可以把同一条消息写给两种对象，看看要换哪些信息。", "你這組溝通題全對，可以把同一則訊息寫給兩種對象，再比較差異。", "You got them all right. Try rewriting the same message for two audiences and see what changes."],
  ],
} as const satisfies Record<string, PracticeLines>;

export const practiceCopy = verdicts;

export function getWave2bPracticeCopy(slug: keyof typeof verdicts, band: Band, locale: DisplayLocale): ArchetypeHonorCopy {
  const i = locale === "en" ? 2 : locale === "zh-TW" ? 1 : 0;
  const personalityTags = [...badges[band][i]] as ArchetypeHonorCopy["personalityTags"];
  return { personalityTags, soulVerdict: verdicts[slug][wave2bPracticeBands.indexOf(band)][i] };
}
