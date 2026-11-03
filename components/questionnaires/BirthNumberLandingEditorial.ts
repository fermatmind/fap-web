import type { QuestionnaireSection } from "@/lib/questionnaires/types";
export const birthNumberSections: QuestionnaireSection[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Life Path and birthday Soul Number: two rules, visible operations",
      "zh": "生命灵数与生日灵数：两种规则，可见的运算"
    },
    "paragraphs": [
      {
        "en": "This calculator applies two specified conventions to a Gregorian date. It shows the operations and opens the corresponding original symbolic guide. The arithmetic can be checked independently of any story: a reproducible assignment establishes what a rule returns, not a measured characteristic of the person whose date was entered.",
        "zh": "本计算器对公历日期应用两种指定约定，展示运算，并打开对应的原创符号指南。算术可以独立于故事核查：能够复现分配过程，说明的是规则返回什么，不是测得了日期所属者的某种特征。"
      },
      {
        "en": "The twelve possible endpoints are 1–9, 11, 22 and 33. The two methods share one library of twelve complete readings. You can read every guide without entering a date; no account, name, birth time or birthplace is needed.",
        "zh": "可能的十二个终点为1—9、11、22、33。两种方法共用同一套十二篇完整读法。无需输入日期即可阅读所有指南，也不需要账户、姓名、出生时间或出生地。"
      }
    ]
  },
  {
    "id": "parts",
    "title": {
      "en": "Method one: reduce each part, then combine",
      "zh": "方法一：分别化简年月日，再合计"
    },
    "paragraphs": [
      {
        "en": "Reduce the month, day and four-digit year separately. At each reduction, stop at a single digit or 11, 22 or 33. Add the three resulting values and apply the same stopping rule to that total. November is therefore retained as 11 in this implementation; it is not silently changed to 2.",
        "zh": "先分别化简月份、日期和四位年份；每次遇到个位数或11、22、33即停止。再将三个结果相加，对合计应用同样的停止规则。因此本实现把11月保留为11，不会悄悄改成2。"
      },
      {
        "en": "For the fictional date 2009-11-11, year 2009 gives 2 + 0 + 0 + 9 = 11; month and day each remain 11. Combining gives 11 + 11 + 11 = 33. The displayed trace records the component results and final operation, so a retained intermediate value stays visible.",
        "zh": "虚构日期2009-11-11中，年份化简为2 + 0 + 0 + 9 = 11；月份与日期也各保留11。合计为11 + 11 + 11 = 33。运算轨迹保留各部分结果与最终操作，让中间保留值清楚可见。"
      }
    ]
  },
  {
    "id": "digits",
    "title": {
      "en": "Method two: add all eight digits before reducing",
      "zh": "方法二：先加全部八个数字，再化简"
    },
    "paragraphs": [
      {
        "en": "Write the Gregorian date as YYYYMMDD and add its eight digits. Reduce the sum by adding its digits again, stopping at a single digit or 11, 22 or 33. Padding a month or day with zero changes the formatting, not the digit sum. This is not a calculation based only on the day of the month.",
        "zh": "把公历日期写为YYYYMMDD，先合计八个数字。再对总和逐位相加，直到个位数或11、22、33处停止。月、日前补0只改变写法，不改变数字和；这也不是只计算每月几号的方法。"
      },
      {
        "en": "The same fictional 2009-11-11 gives 2 + 0 + 0 + 9 + 1 + 1 + 1 + 1 = 15, then 1 + 5 = 6. This differs from the separate-parts result of 33 because the preserved intermediate values differ, not because the calculator has observed two inner identities.",
        "zh": "同一虚构日期2009-11-11得到2 + 0 + 0 + 9 + 1 + 1 + 1 + 1 = 15，再算1 + 5 = 6。它与分部分法的33不同，是因为中间保留规则不同，不是计算器发现了两种内在身份。"
      }
    ]
  },
  {
    "id": "comparison",
    "title": {
      "en": "Different endpoints can share a digital root",
      "zh": "不同终点可以具有相同数字根"
    },
    "paragraphs": [
      {
        "en": "Another fictional example, 1980-01-01, gives year 18 → 9, then 9 + 1 + 1 = 11 under the first rule. Adding all date digits first gives 20 → 2. If 11 is further reduced, it also gives 2. Keeping 11 is a convention about where to stop.",
        "zh": "另以虚构日期1980-01-01为例，第一法将年份化为18 → 9，再得9 + 1 + 1 = 11；先加全部日期数字则得到20 → 2。继续化简11也会得到2；保留11是在哪里停止的约定。"
      },
      {
        "en": "Digit sums preserve the remainder modulo nine: replacing a number by the sum of its decimal digits does not change that remainder. For positive inputs, full reduction to one digit therefore agrees even when the selected master-number labels differ. This mathematical property does not validate the associated personality, compatibility or prediction claims.",
        "zh": "逐位求和保留模9的余数：把十进制整数换成各位数字之和，不改变该余数。因此对正数完全化简到个位时，即使所选主数标签不同，数字根仍一致。这个数学性质不验证随附的人格、配对或预测主张。"
      }
    ]
  },
  {
    "id": "stopping",
    "title": {
      "en": "Why 44 becomes 8, and why larger is not better",
      "zh": "为什么44化为8，为什么数字大不代表更好"
    },
    "paragraphs": [
      {
        "en": "In this edition, only 11, 22 and 33 are retained two-digit endpoints. For fictional 1999-09-07, adding all date digits yields 44, which continues as 4 + 4 = 8. A tool that also retains 44 uses a different endpoint set; its output cannot be compared without checking that rule.",
        "zh": "本版仅把11、22、33保留为两位终点。虚构日期1999-09-07先加全部数字得到44，继续4 + 4 = 8。把44也保留的工具采用了不同终点集合，比较结果前必须先核对这条规则。"
      },
      {
        "en": "Master number is a label used in these traditions, not an academic ability level or a higher score. Receiving 33 does not make someone more caring, advanced or important than someone receiving 6. The guides provide optional themes, not a hierarchy of people.",
        "zh": "“主数”是这些传统中的命名，不是学术能力等级或更高分。得到33不表示比得到6的人更关爱、更高级或更重要。指南提供可选主题，不建立人的高低层级。"
      }
    ]
  },
  {
    "id": "names",
    "title": {
      "en": "Check the inputs behind Life Path, Soul Number and Soul Urge",
      "zh": "看名称，也要看Life Path、Soul Number与Soul Urge实际输入"
    },
    "paragraphs": [
      {
        "en": "Names vary between publishers and languages. Here Life Path refers to the separately reduced date rule, while birthday Soul Number identifies the selected all-date-digits convention. The method selector explains each operation rather than relying on a translated label to imply agreement between traditions.",
        "zh": "发布者与语言之间的名称可能不同。本页用生命灵数指分别化简的日期规则，用生日灵数标明选定的全日期数字约定。方法选择器直接解释操作，不靠译名暗示各流派完全一致。"
      },
      {
        "en": "A name-based Soul Urge uses letters, often vowels, rather than this date-only input. Birthday Number may mean only the day component elsewhere. This calculator does not request a name, assign letter values, calculate a personal year or generate a compatibility score.",
        "zh": "按姓名计算的Soul Urge使用字母，常涉及元音，而不是本页的日期输入。其他地方的Birthday Number也可能仅指日期的日部分。本计算器不收集姓名、不分配字母值、不计算个人年，也不生成配对分。"
      }
    ]
  },
  {
    "id": "calendar",
    "title": {
      "en": "Calendar validity, leap years and the device-date boundary",
      "zh": "日历有效性、闰年与设备日期界限"
    },
    "paragraphs": [
      {
        "en": "Enter a real Gregorian year, month and day from January 1, 1900 through today on your device. The underlying supported year range ends at 2099. A future date remains invalid even if digit arithmetic could be performed on it. No lunar-calendar conversion, timezone inference or birth-record lookup occurs.",
        "zh": "请输入1900年1月1日至设备所示今天之间的真实公历年月日，底层支持年份截至2099年。即使能够执行数字运算，未来日期仍属无效。本页不转换农历、不推测时区，也不查询出生记录。"
      },
      {
        "en": "An impossible day is not rolled into the next month. For example, 2000-02-29 is a valid leap day, while 1900-02-29 is not: Gregorian century years must be divisible by 400 to be leap years. If the device calendar cannot provide a valid reference date, the calculator reports unavailability rather than guessing.",
        "zh": "不存在的日期不会自动滚入下月。例如2000-02-29是有效闰日，1900-02-29则不是：公历世纪年份必须能被400整除才属闰年。设备无法提供有效参照日期时，计算器显示不可用，不会猜一个日期继续。"
      }
    ]
  },
  {
    "id": "privacy",
    "title": {
      "en": "Keep dates and operation traces private",
      "zh": "日期与运算轨迹都应留意隐私"
    },
    "paragraphs": [
      {
        "en": "The date and trace stay in the open page’s memory. Editing a field or selecting a different rule clears the old result; clearing, reloading, leaving or changing language removes the input. There is no date draft to restore. Comparing the other rule is optional and uses the same entered date.",
        "zh": "日期与轨迹只留在打开页面的内存中。修改字段或选择其他规则会清除旧结果；清除、刷新、离开或换语言会移除输入，不提供日期草稿恢复。比较另一规则是可选操作，使用同一已输入日期。"
      },
      {
        "en": "Copy includes only the symbolic label and selected method, not the date, arithmetic or a personal-result URL. A detailed trace can reveal pieces of a birth date even if the date itself is omitted. Public guide pages need no date and do not represent anyone’s private calculation.",
        "zh": "复制仅包含符号标签和所选方法，不含日期、算式或个人结果网址。即使省略日期本身，详细轨迹也可能透露生日的一部分。公开指南无需日期，也不代表任何人的私人计算。"
      }
    ]
  },
  {
    "id": "reading",
    "title": {
      "en": "Read an original story without treating it as a finding",
      "zh": "阅读原创故事，不把故事当研究发现"
    },
    "paragraphs": [
      {
        "en": "Each complete guide contains eight sections: a motif, fictional arithmetic, a concrete scene, contextual distinctions, a counterexample, an optional small action and explanations of rules and scope. The narrative can be considered even when its number is not your calculated endpoint.",
        "zh": "每篇完整指南包含八节，覆盖主题画面、虚构算例、具体场景、情境区分、反例、可选小行动，以及规则与范围解释。即使该数字不是你的计算终点，也可以把叙事当一个问题来考虑。"
      },
      {
        "en": "The outcome of a rule is reproducible; the usefulness of a prompt depends on an actual situation. Feeling that a story fits does not establish that a date caused a trait or predicts an event. Leave aside any motif that is unhelpful, and use real evidence for health, money, relationships, study or career decisions.",
        "zh": "规则输出可以复算；提示是否有用则取决于实际处境。感觉故事贴切，不证明日期造成了某个特质或能预测事件。不合用的主题可以放下；健康、金钱、关系、学习或职业决定仍需真实证据。"
      }
    ]
  }
];
export const birthNumberFaq = [
  {
    "question": {
      "en": "Can I verify a result without believing the story?",
      "zh": "不相信故事，也能核对结果吗？"
    },
    "answer": {
      "en": "Yes. Follow the displayed date operations and stopping points. Arithmetic establishes the selected label only; the story is a separate optional editorial prompt.",
      "zh": "可以。按显示的日期运算与停止点逐步复算；算术只确定所选标签，故事是另外一份可选编辑提示。"
    }
  },
  {
    "question": {
      "en": "Why does November stay as 11 here?",
      "zh": "为什么本页把11月保留为11？"
    },
    "answer": {
      "en": "The selected separate-parts rule preserves11,22,33 during each component reduction as well as the final sum. Some publishers instead reduce November to2. Always compare the exact rule.",
      "zh": "所选分部分法在各部分化简及最终合计都保留11、22、33。有些发布者先把11月化为2，比较时应核对具体规则。"
    }
  },
  {
    "question": {
      "en": "Does 33 mean I scored higher than 6?",
      "zh": "33表示比6分更高吗？"
    },
    "answer": {
      "en": "No score or rank exists here.33 and6 are symbolic endpoints from stated stopping conventions. Neither establishes ability, worth, duty or a superior identity.",
      "zh": "这里没有分数或排名。33与6是按明示停止约定产生的符号终点，不证明能力、价值、责任或更优越的身份。"
    }
  },
  {
    "question": {
      "en": "Does this calculate lunar-calendar birthdays?",
      "zh": "这里会计算农历生日吗？"
    },
    "answer": {
      "en": "No. Input is a Gregorian calendar date. The calculator does not convert calendars or recover a birth date from a name, location or timezone.",
      "zh": "不会。输入须为公历日期，不进行历法转换，也不从姓名、地点或时区推算出生日期。"
    }
  },
  {
    "question": {
      "en": "Why is 1900-02-29 rejected but 2000-02-29 accepted?",
      "zh": "为什么1900-02-29无效，2000-02-29有效？"
    },
    "answer": {
      "en": "Under Gregorian leap-year rules, a century year must be divisible by400. Invalid dates are rejected, not shifted to another month.",
      "zh": "按公历闰年规则，世纪年份须能被400整除。无效日期会被拒绝，不自动转到其他月份。"
    }
  },
  {
    "question": {
      "en": "Can I read all twelve guides without entering a birthday?",
      "zh": "不输入生日，能读全部十二篇吗？"
    },
    "answer": {
      "en": "Yes. Every complete public guide is linked below. No account, calculation, payment or further test is required.",
      "zh": "可以。下方链接开放每篇完整公开指南，无需账户、计算、付费或继续其他测评。"
    }
  },
  {
    "question": {
      "en": "Will refreshing restore the date I entered?",
      "zh": "刷新后会恢复输入日期吗？"
    },
    "answer": {
      "en": "No. This calculator uses page memory only. Reloading, leaving or changing language removes the input and trace; it does not create a saved birthday profile.",
      "zh": "不会。计算器只使用页面内存；刷新、离开或换语会移除输入与轨迹，不建立保存生日的画像。"
    }
  },
  {
    "question": {
      "en": "Why does the copied result omit the arithmetic?",
      "zh": "为什么复制结果不附算式？"
    },
    "answer": {
      "en": "A trace can reveal parts of the input date. Copy is deliberately limited to the symbolic label and method, while the public guides remain available without personal inputs.",
      "zh": "运算轨迹可能透露输入日期的一部分。因此复制仅保留符号标签与方法；公开指南仍可在没有个人输入的情况下阅读。"
    }
  }
];
