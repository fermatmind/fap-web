import type { TrilingualReading } from "./types";

export const practiceReadings = {
  missing: [
    ["尚无读数", "本轮留白", "分项查看", "你可以先看分项说明，再决定要不要试一轮。"],
    ["尚無讀數", "這輪留白", "逐項查看", "你可以先看各項說明，再決定要不要試一輪。"],
    ["Score Pending", "Open Review", "Separate Rounds", "You can look through the guides before trying a section."],
  ],
  review: [
    ["起步一轮", "本轮记录", "复盘起点", "你已经留下这一轮的记录，选一道题回看就好。"],
    ["起步一輪", "這輪紀錄", "回顧起點", "你已經留下這一輪的紀錄，挑一題回頭看就好。"],
    ["First Pass", "Round Recorded", "A Starting Point", "You finished a first pass. Pick one item to look through."],
  ],
  building: [
    ["至少半数", "本轮记录", "仍有空间", "你这轮至少答对一半，回看时也有清楚的起点。"],
    ["至少過半", "這輪紀錄", "還有空間", "你這輪至少答對一半，回頭看時也有清楚的起點。"],
    ["Half or Better", "Round Recorded", "Room to Grow", "You got at least half right. There is a clear place to start reviewing."],
  ],
  strong: [
    ["高准确率", "多数答对", "亮眼一轮", "你这轮答对了大部分题，值得把这张成绩留一下。"],
    ["高正確率", "多數答對", "亮眼一輪", "你這輪答對了大部分題目，值得把這張成績留下來。"],
    ["High Accuracy", "Most Were Right", "Strong Round", "You got most of this round right. That is a score worth keeping."],
  ],
  perfect: [
    ["全部答对", "本轮满分", "准确无误", "你这轮全部答对，这张小小的满分卡可以留个纪念。"],
    ["全部答對", "這輪滿分", "準確無誤", "你這輪全部答對，可以把這張小小的滿分卡留作紀念。"],
    ["All Correct", "Perfect Round", "Full Marks", "You got every item right this round. Keep this one if you like."],
  ],
} satisfies Record<string, TrilingualReading>;

// The data-entry module scores fields rather than questions.
export const fieldsReadings = {
  ...practiceReadings,
  review: [
    ["本轮录入", "精确字段", "复盘起点", "你可以比对这一轮录入的字段，看看误差出在哪。"],
    ["這輪輸入", "精確欄位", "回顧起點", "你可以比對這一輪輸入的欄位，看看誤差出在哪。"],
    ["First Pass", "Exact Fields", "A Starting Point", "You can look at the fields you entered to see where differences came up."],
  ],
  building: [
    ["至少半数", "精确字段", "本轮记录", "你这轮至少有一半纳入计算的字段完全吻合。"],
    ["至少半數", "精確欄位", "這輪紀錄", "你這輪至少有一半納入計算的欄位完全吻合。"],
    ["Half or Better", "Exact Fields", "Round Recorded", "You matched at least half of the fields counted in this round."],
  ],
  strong: [
    ["多数吻合", "精确字段", "亮眼一轮", "你这轮大多数纳入计算的字段都完全吻合。"],
    ["多數吻合", "精確欄位", "亮眼一輪", "你這輪大多數納入計算的欄位都完全吻合。"],
    ["Mostly Matched", "Exact Fields", "Strong Round", "You matched most of the fields counted in this round."],
  ],
  perfect: [
    ["全数吻合", "精确字段", "本轮记录", "你这轮纳入计算的每一个字段都完全吻合。"],
    ["全數吻合", "精確欄位", "這輪紀錄", "你這輪納入計算的每一個欄位都完全吻合。"],
    ["All Fields Match", "Exact Fields", "Round Recorded", "You matched every field counted in this round."],
  ],
} satisfies Record<keyof typeof practiceReadings, TrilingualReading>;
