import type { Questionnaire } from "@/lib/questionnaires/types";

export const tenKeyLandingSections: Questionnaire["guide"] = [
  {
    "id": "ten-key-task",
    "title": {
      "zh": "10-Key测试练什么？从数字抄录到逐条核对",
      "en": "What does a 10-key test practise? Transcription and row-by-row checking"
    },
    "paragraphs": [
      {
        "zh": "本页任务是把屏幕上的一个数值或编号原样输入，再确认进入下一条。它同时涉及看清源值、保持数字顺序、执行输入和决定何时确认。这里不要求心算、财务判断或记忆整张表；来源也不是客户记录，而是固定构造的练习文本。一次回合提供的是特定列表、设备与条件下的录入记录。",
        "en": "Copy one displayed value or code exactly, then confirm to advance. This involves reading the source, preserving digit order, entering text and deciding when to confirm. It does not require arithmetic, financial judgment or memorising a table. Sources are constructed practice strings rather than customer records. A round records entry under a particular list, device and set of conditions."
      },
      {
        "zh": "整数、小数与编号分开练习，可以定位不同的核对重点。整数需要保持位数和顺序；小数须保留小数点及末尾零；编号须保留开头的零。三个列表长度和格式不同，同样条目数未必对应同样字符量，因此应先看模式和实际输入量，再比较结果。",
        "en": "Separate modes make checking requirements explicit. Whole numbers preserve length and order; decimals preserve the point and trailing zeros; references preserve leading zeros. String lengths and formats differ across lists, so equal row counts need not represent equal character volumes. Compare the mode and actual input volume before comparing results."
      }
    ]
  },
  {
    "id": "ten-key-kph",
    "title": {
      "zh": "KPH怎样计算？两种分子，同一个60秒窗口",
      "en": "How is KPH calculated? Two numerators, one 60-second window"
    },
    "paragraphs": [
      {
        "zh": "KPH表示每小时按键等价量，本页把60秒内已确认文本的字符数加上每条一次确认分隔，乘以60，得到“确认等价KPH”。数字和小数点均各计一个字符，错误字符及多输入的字符也进入这个分子。它不是按下过的全部物理按键：退格、删除前的字符和未确认尾串不进入这个量。",
        "en": "KPH means keystroke equivalents per hour here. Confirmed-equivalent KPH adds the characters in confirmed text to one confirmation separator per row, then multiplies that 60-second total by 60. Digits and decimal points each count once; wrong and extra submitted characters remain in this numerator. It is not a log of every physical keypress: Backspace, deleted text and an unconfirmed tail are excluded."
      },
      {
        "zh": "“完全正确条目KPH”只累计整条文本完全一致的条目，每条计源文本长度加一次确认，再乘以60。新算例：源值246、5710、803，输入246、5790、803，共10字符及3次确认，确认等价KPH为780；两条完全正确共8个等价量，完全正确条目KPH为480。它不能由780乘条目准确率简单得到，因为错误条目长度不同。",
        "en": "Exact-entry KPH includes only rows whose complete strings match, counting source length plus one confirmation per correct row, then multiplying by 60. In a fresh example, sources 246, 5710 and 803 receive 246, 5790 and 803. Ten characters plus three confirmations yield 780 confirmed-equivalent KPH; the two exact rows contribute eight equivalents, yielding 480 exact-entry KPH. Multiplying 780 by entry accuracy does not reproduce this measure because row lengths differ."
      }
    ]
  },
  {
    "id": "ten-key-errors",
    "title": {
      "zh": "准确率与错误率：条目和字符回答不同问题",
      "en": "Accuracy and errors: rows and characters answer different questions"
    },
    "paragraphs": [
      {
        "zh": "条目错误率为错误条目数除以已确认条目数；条目准确率则以完全正确条目数为分子。上例有一条错误，所以错误率为33.3%，条目准确率为66.7%。逐位准确率另以相同位置的相同字符计匹配，每条分母取源值与输入值长度的较大者；上例9个位置匹配、共比较10个位置，为90.0%。",
        "en": "Entry error rate divides wrong rows by confirmed rows; entry accuracy uses exact rows as its numerator. The example has one wrong row, giving 33.3% entry errors and 66.7% entry accuracy. Positional character accuracy instead counts matching characters at identical positions, with each row’s denominator equal to the longer string length. Nine matches across ten compared positions give 90.0%."
      },
      {
        "zh": "逐位比较不使用编辑距离，也不自动把错位字符重新对齐。少一个前导零可能使后面的字符一起错位；数字值相等也不表示文本相等。没有确认任何条目时，准确率分母不存在，页面显示不可用；按Enter确认空白则已经提交一条错误记录，并产生一次确认等价量。这两种情况不能混为一谈。",
        "en": "Positional comparison does not use edit distance or realign shifted characters. Dropping a leading zero may shift later characters; equal numeric values do not imply equal strings. With no confirmed rows, accuracy has no denominator and is shown as unavailable. Confirming an empty entry with Enter submits a wrong row and contributes one confirmation equivalent. These are distinct outcomes."
      }
    ]
  },
  {
    "id": "ten-key-formats",
    "title": {
      "zh": "小数点、末尾零与前导零为什么要原样保留？",
      "en": "Why preserve decimal points, trailing zeros and leading zeros?"
    },
    "paragraphs": [
      {
        "zh": "小数模式采用两位小数的源文本。若显示12.50，输入12.5虽然可以表示相同数值，却少了一个源字符；输入1250还丢失小数点。编号模式把000482视为六字符标识，而非待简化的数字482。练习核对的是文本转录的精确性，不替你推断货币、计量单位或编号业务规则。",
        "en": "Decimal sources use two places. If the display reads 12.50, entering 12.5 may represent the same number but omits a source character; 1250 also loses the decimal point. Reference mode treats 000482 as a six-character identifier rather than the number 482 to simplify. The exercise checks literal transcription, without inferring currencies, measurement units or business rules for identifiers."
      },
      {
        "zh": "输入框只接受数字和英文句点，长度上限24字符；粘贴与拖入文本被阻止。确认前可用退格更正，确认后进入下一条，已交条目不再编辑。使用输入法时应先结束组合再确认。这些规则使结果对应逐条录入任务，不意味着页面已经检测或认证了盲打技术。",
        "en": "The field accepts digits and a period, up to twenty-four characters. Pasting and dropping text are blocked. Correct with Backspace before confirming; confirmation advances to the next row and submitted rows cannot be edited. Finish input-method composition before confirming. These rules define the transcription task rather than detect or certify touch-typing technique."
      }
    ]
  },
  {
    "id": "ten-key-clock",
    "title": {
      "zh": "60秒从何时开始？截止、切页与休眠处理",
      "en": "When do sixty seconds start? Deadlines, hidden pages and sleep"
    },
    "paragraphs": [
      {
        "zh": "计时从点击“开始60秒练习”开始，随即聚焦输入框，不等待第一次按键。只有截止前已确认的条目计分；截止时的未确认尾串单独展示并排除计分。计时回调即使延迟，也不会把评分窗口延长。选择模式、阅读说明和预先查看公开指南均不消耗回合时间。",
        "en": "The clock starts when Start 60-second practice is clicked and the input immediately receives focus; it does not wait for the first keypress. Only rows confirmed before the deadline count. An unconfirmed tail is displayed separately and excluded. A delayed timer callback does not extend the scoring window. Choosing a mode, reading instructions and opening public guides happen before the timed round."
      },
      {
        "zh": "本页结合浏览器单调时间与系统时间检查经过时长；单调时间不随系统时钟校准而倒退，但休眠期间的行为会随浏览器和系统不同。[2] 页面隐藏或检测到超过1.5秒的两钟偏差时会取消并清空本轮；刷新也不恢复计时。请保持当前页面可见，把本轮视为连续练习，而非可暂停的考试。",
        "en": "The implementation compares a browser monotonic clock with system time. Monotonic time does not go backward with system-clock adjustments, but sleep behaviour differs across browsers and operating systems.[2] Hiding the page or detecting over 1.5 seconds of clock divergence cancels and clears the round; reload does not resume it. Keep the page visible and treat the round as uninterrupted practice rather than a pausable exam."
      }
    ]
  },
  {
    "id": "ten-key-device",
    "title": {
      "zh": "小键盘与主键盘：设备记录能说明什么？",
      "en": "Numeric keypad and number row: what can device records establish?"
    },
    "paragraphs": [
      {
        "zh": "数字小键盘适合集中练数字位置，主键盘数字行也可完成本页任务。若硬件有数字锁定键，开始前确认能输入数字，并让手腕和坐姿保持舒适；不必为了成绩使用不熟悉的键盘。触屏、辅助技术、键位映射和输入法可能改变操作方式，应在比较回合时记下这些条件。",
        "en": "A numeric keypad offers a compact digit layout, while the number row can also complete this task. If the hardware has Num Lock, check that it enters digits before starting and use a comfortable posture. There is no need to use unfamiliar hardware for a score. Touchscreens, accessibility tools, remapping and input methods can change operation; record these conditions when comparing rounds."
      },
      {
        "zh": "页面按浏览器报告的键码记录数字输入事件来自小键盘、数字行或其他来源；该事件计数也可能包含后来删除的输入，因此不等于计分字符数。KeyboardEvent.code描述键位而非最终字符，虚拟和辅助设备也可能模拟对应代码。[1] 这份记录可以提示输入来源，不能证明物理设备、指法或未经辅助的速度。",
        "en": "The page groups digit-input events by browser-reported keypad, number-row or other codes. This event count may include text later deleted, so it differs from scored characters. KeyboardEvent.code describes a key position rather than the final character, and virtual or assistive devices may simulate codes.[1] The record can indicate reported input sources without proving physical hardware, fingering or unaided speed."
      }
    ]
  },
  {
    "id": "ten-key-comparison",
    "title": {
      "zh": "怎样比较练习结果？先统一条件，再看错误",
      "en": "How should practice rounds be compared? Conditions before errors"
    },
    "paragraphs": [
      {
        "zh": "保留模式、键盘、浏览器、是否熟悉列表以及当时是否被打断，再比较确认量、完全正确量和具体错行。固定列表重复练习可能带来熟悉效应，单次提高无法区分熟悉、波动和技能变化。可先选一个可观察目标，例如在不丢前导零的前提下完成录入，再核对下一次是否减少同类错误。",
        "en": "Record the mode, keyboard, browser, familiarity with the list and interruptions before comparing confirmed volume, exact volume and individual errors. Repetition of a fixed list may create familiarity; one improvement cannot separate familiarity, variation and skill change. Choose an observable goal, such as preserving leading zeros, then check whether that specific error decreases in a later round."
      },
      {
        "zh": "不同网站可能按全部按键、正确字符、完整条目或不同错误扣减计算KPH，也可能从首键而非开始按钮计时。因此跨站同一个KPH数值不保证任务等价。本页提供可复算原始量，不设置招聘通过线、行业百分位或速度等级；若岗位有要求，应以该岗位明确的测试规则、设备和工作任务核对。",
        "en": "Other sites may base KPH on all keypresses, correct characters, complete rows or different error penalties, and may start timing at the first key rather than a button. Equal KPH across sites therefore need not represent equivalent tasks. This page provides reproducible raw quantities without hiring thresholds, industry percentiles or speed bands. Compare a job requirement against that job’s stated rules, equipment and tasks."
      }
    ]
  },
  {
    "id": "ten-key-review-method",
    "title": {
      "zh": "结果怎样用于复盘？从差异定位到下一轮目标",
      "en": "How can results guide review? From differences to a next-round goal"
    },
    "paragraphs": [
      {
        "zh": "先检查结果中的源值和输入值：是漏位、换序、多输、小数点还是前导零出现差异？这些是你可以从文本自行核对的现象，不是系统已经确定的错误原因。随后把相关模式的完整指南与自己的错行对照，选择一种确认前核对方法，例如先看位数，再看点和零，最后看数字顺序。",
        "en": "Inspect each source and entered string for omissions, transpositions, additions, decimal points and leading zeros. These are differences you can verify in the text, rather than causes already diagnosed by the system. Compare the relevant full guide with your rows and choose a pre-confirmation check, such as length first, points and zeros next, and digit order last."
      },
      {
        "zh": "三份指南均包含完整算例、指标单位、编辑规则和设备说明，不因成绩高低而锁定。个人输入仅在当前页面内存中计分，不写入网址或答案分析事件；刷新或清空重测后不保留这份录入记录。网站的通用访问统计和Cookie设置另行管理，不能据此把页面访问等同于上传了作答。",
        "en": "All three guides include worked examples, units, editing rules and device notes, without score-based locks. Personal entries are scored in current-page memory and are not added to URLs or answer analytics events; reload or clearing for a retake removes the record. General site-visit analytics and Cookie settings are managed separately: a page visit does not itself mean that answers were uploaded."
      }
    ]
  }
];

export const tenKeyLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "10-Key测试与普通打字测试有什么区别？",
      "en": "How does a 10-key test differ from a typing test?"
    },
    "answer": {
      "zh": "本页抄录数字、小数或编号，以字符和确认分隔的每小时等价量计KPH；普通文本打字还涉及词句、标点和语言。本页不把KPH换算成语言写作能力或通用WPM。",
      "en": "This page transcribes numbers, decimals or codes and reports hourly character-plus-confirmation equivalents as KPH. Text typing also involves words, punctuation and language. KPH here is not converted into language-production ability or general WPM."
    }
  },
  {
    "question": {
      "zh": "为什么两种KPH差别很大？",
      "en": "Why can the two KPH values differ substantially?"
    },
    "answer": {
      "zh": "确认等价KPH包含所有已确认文本及分隔，完全正确条目KPH只包含整条一致的记录。错一位会让整条退出后者，但其中仍有字符进入前者；长短条目也使差异不能用一个统一扣分系数表达。",
      "en": "Confirmed-equivalent KPH includes all submitted text and separators, while exact-entry KPH includes only fully matching rows. One wrong character removes the whole row from the latter, while its submitted characters remain in the former. Varying row lengths also prevent a universal deduction factor."
    }
  },
  {
    "question": {
      "zh": "空白确认和一条也没交，成绩相同吗？",
      "en": "Is confirming a blank the same as submitting nothing?"
    },
    "answer": {
      "zh": "不同。空白确认提交一条错误条目，计一次确认分隔；零条提交没有条目准确率分母，相关百分比显示不可用。两种情况的完全正确条目KPH均为零，但含义不同。",
      "en": "No. A blank confirmation submits a wrong row and counts one separator. With no submitted rows, entry accuracy has no denominator and is unavailable. Both have zero exact-entry KPH, but represent different actions."
    }
  },
  {
    "question": {
      "zh": "计时从点击开始还是第一次输入开始？",
      "en": "Does timing begin at Start or at the first input?"
    },
    "answer": {
      "zh": "点击开始即计时并聚焦输入框。请先完成模式选择和说明阅读；开始后不用再点击同意、注册或完成其他测评。",
      "en": "Clicking Start begins timing and focuses the field. Choose the mode and read instructions beforehand; no agreement click, signup or prior assessment is required after starting."
    }
  },
  {
    "question": {
      "zh": "240条全部录完，回合会提前结束吗？",
      "en": "Does entering all 240 sources end the round early?"
    },
    "answer": {
      "zh": "不会。每种模式有240条源值；录完后等待60秒截止，评分仍采用同一窗口。源值用完不代表进入下一模式，也不会自动补充随机数字。",
      "en": "No. Each mode supplies 240 sources. After they are all confirmed, the round waits for the sixty-second deadline and retains the same scoring window. It does not switch modes or add random sources."
    }
  },
  {
    "question": {
      "zh": "为什么数字键事件数与确认字符数不一致？",
      "en": "Why do digit-event counts differ from confirmed characters?"
    },
    "answer": {
      "zh": "数字键事件可能包含后来删除的输入，而确认字符只来自提交文本。小数点和确认分隔也不属于数字键事件；浏览器键码只支持有限的来源说明，不能把事件数当成成绩分子。[1]",
      "en": "Digit events can include input later deleted, while confirmed characters come from submitted text. Decimal points and confirmation separators are not digit events either. Browser codes offer limited source information, so the event count is not the score numerator.[1]"
    }
  },
  {
    "question": {
      "zh": "为什么完成相同条目数，KPH还不同？",
      "en": "Why can equal row counts yield different KPH?"
    },
    "answer": {
      "zh": "条目字符长度不同，确认等价KPH还包含错误和多输文本；完全正确条目KPH则只计整条正确的源长度。应一起核对模式、长度和错行，而非仅看完成条目数。",
      "en": "Rows differ in character length; confirmed-equivalent KPH also includes wrong and extra submitted text, whereas exact-entry KPH includes source length only for fully correct rows. Check mode, lengths and wrong rows alongside the completed-row count."
    }
  },
  {
    "question": {
      "zh": "为什么小数值相等还会判错？",
      "en": "Why can numerically equal decimals count as wrong?"
    },
    "answer": {
      "zh": "任务要求源文本完全相同。12.50与12.5字符长度不同，000482与482也不相同；页面不先转成数值再比较。",
      "en": "The task requires identical source text. The strings 12.50 and 12.5 have different lengths, as do 000482 and 482. Values are not converted to numbers before comparison."
    }
  },
  {
    "question": {
      "zh": "60秒的KPH代表我能连续工作一小时吗？",
      "en": "Does a sixty-second KPH predict an hour of continuous work?"
    },
    "answer": {
      "zh": "不代表。乘以60只把这一分钟的产出表达为每小时单位，没有实际观测一小时中的休息、疲劳、任务切换或复杂记录处理。结果应按本轮时长和任务理解。",
      "en": "No. Multiplying by sixty expresses this minute’s output in hourly units. It does not observe an hour of breaks, fatigue, task switching or complex record handling. Interpret the value within this round’s duration and task."
    }
  }
];
