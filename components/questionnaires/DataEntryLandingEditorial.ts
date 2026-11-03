import type { Questionnaire } from "@/lib/questionnaires/types";

export const dataEntryLandingSections: Questionnaire["guide"] = [
  {
    "id": "entry-scope",
    "title": {
      "zh": "数据录入测试测什么？读源值、换字段与核对",
      "en": "What does data entry practice involve? Reading, field switching and checking"
    },
    "paragraphs": [
      {
        "zh": "数据录入练习要求把显示的源内容抄到对应字段，同时保留代码、日期、小数和空格。本页有物品标签与发运表单两种模式，每种32条、每条四字段，全部原创虚构。选择模式后点击开始，直接进入60秒录入，没有额外同意、账户或付款步骤。阅读来源与移动到下一字段也占用这一分钟。",
        "en": "Copy displayed source values into their corresponding fields while preserving codes, dates, decimals and spaces. Two original fictional modes provide thirty-two four-field records each: asset labels and dispatch forms. Select a mode and start the sixty-second round directly, without another agreement, account or payment step. Reading and moving between fields also use that minute."
      },
      {
        "zh": "O*NET对数据录入工作的描述包含比对源文档、核查与改正错误等任务。[1] 本练习选取文档到表单的抄录环节，未模拟真实业务系统、扫描识别或完整岗位工作；可用于熟悉字段核对，不能把某次结果解释为职业资格。",
        "en": "O*NET describes source-document comparison, verification and correction among data-entry tasks.[1] This practice selects document-to-form transcription without reproducing a live business system, scanning workflow or complete job. Use it to explore field checking rather than establish a professional qualification."
      }
    ]
  },
  {
    "id": "entry-modes",
    "title": {
      "zh": "两种模式怎样选？源格式与界面语言",
      "en": "Choosing a mode: source formats and interface language"
    },
    "paragraphs": [
      {
        "zh": "物品标签模式抄录物品代码、名称、数量文本与货架代码；发运表单模式抄录包裹代码、日期文本、重量文本与路线。中文和英文界面显示相同源值，中文模式不把代码或英文标签翻译成另一套题。两种模式的字段长度和格式不同，不能把它们当作等难度的两份平行测验。",
        "en": "Asset records contain a code, label, quantity text and shelf code. Dispatch forms contain parcel, date, mass and route text. Chinese and English interfaces display identical source values; switching the interface does not translate codes or labels into another bank. Field lengths and formats differ between modes, which have not been equated as parallel tests."
      },
      {
        "zh": "先看四个字段的顺序，再决定要练哪一种格式。数量003须保留前导零，重量5.40须保留末尾零，日期按源格式抄写。这些是本版精确文本规则；在真实系统中是否允许数值等价或日期重排，要以该系统的规则为准。",
        "en": "Inspect the four-field order and choose the format you want to practise. Preserve leading zeros in 003, the trailing zero in 5.40 and the source date format. These are exact-text rules for this edition; numeric equivalence or date reformatting in another system depends on that system’s specification."
      }
    ]
  },
  {
    "id": "entry-denominators",
    "title": {
      "zh": "准确率的分母：一条已尝试记录包含四字段",
      "en": "The accuracy denominator: four fields per attempted record"
    },
    "paragraphs": [
      {
        "zh": "任一字段提交过修改，或明确点下一条，该记录就计入尝试，四字段都进入准确率分母。只填对第一字段、其余留空，结果是一项精确、四项纳入，准确率25%；看到下一条但没有改动、也没有再点下一条，不会仅因显示而计入它。",
        "en": "A committed field edit or an explicit Next marks a record attempted and includes all four fields in accuracy. One exact field and three blanks produce one exact out of four considered fields, or 25%. Merely displaying the following record without editing or advancing does not include it."
      },
      {
        "zh": "完全没有尝试记录时，分母为零，准确率显示不适用；明确跳过一条空记录则有四个空字段，准确率为0%。两种情况不可混为一谈。返回已尝试记录改正时，不重复增加分母，只更新该字段最终提交的文字。",
        "en": "With no attempted record, the zero denominator makes accuracy not applicable. Explicitly advancing past one blank record includes four blank fields and yields 0%. These states differ. Revising an attempted record updates final committed text without adding that record to the denominator again."
      }
    ]
  },
  {
    "id": "entry-worked-example",
    "title": {
      "zh": "字符KPH与精确字段字符KPH：算一次具体例子",
      "en": "Character KPH and exact-field character KPH: a worked example"
    },
    "paragraphs": [
      {
        "zh": "另设AB-001、Cedar Box、003、D-09四字段，长度6、9、3、4，共22字符。固定60秒内全部精确，两种字符KPH均为22×60=1320，字段准确率100%，完整记录一条。若只把Cedar Box写成cedar Box，仍有22字符，但精确字段仅含13字符，因此精确字段字符KPH=780、字段准确率75%、完整记录零条。",
        "en": "Consider AB-001, Cedar Box, 003 and D-09: six, nine, three and four characters, totaling twenty-two. An exact copy in the fixed minute gives both character rates as 22 × 60 = 1320, 100% field accuracy and one complete record. Changing only Cedar Box to cedar Box leaves twenty-two characters but thirteen in exact fields: exact-field character KPH is 780, accuracy 75% and complete records zero."
      },
      {
        "zh": "把1320乘75%会得到990，并不是780，因为四字段长度不同。再尝试第二条但只填对其六字符代码，则两条共纳入八字段、精确四字段，准确率50%；最终28字符，字符KPH1680，精确字段字符KPH1140。这些数字分别回答产量、整字段匹配和完整记录三个问题。",
        "en": "Multiplying 1320 by 75% gives 990, not 780, because fields have different lengths. If you attempt a second record but copy only its six-character code correctly, four of eight considered fields are exact: 50% accuracy. Twenty-eight final characters give character KPH 1680; nineteen exact-field characters give 1140. Output, whole-field matching and complete-record counts answer different questions."
      }
    ]
  },
  {
    "id": "entry-research",
    "title": {
      "zh": "输入研究如何区分最终文本与修改过程？",
      "en": "How does text-entry research distinguish final text from corrections?"
    },
    "paragraphs": [
      {
        "zh": "Soukoreff与MacKenzie在CHI 2003论文中区分显示原文、输入过程和最终抄录文本，并讨论已改正与未改正错误。[4] 最终文本正确，不代表录入时没有发生过修改。本页只按最终字段计数，不保存逐键过程，因此不能由结果重建退格次数、修正效率或每个错误出现的时刻。",
        "en": "Soukoreff and MacKenzie’s CHI 2003 paper distinguishes presented text, the input stream and transcribed text, discussing corrected and uncorrected errors.[4] Correct final text does not mean no corrections occurred. This practice counts final fields without retaining a keystroke stream, so it cannot reconstruct backspaces, correction efficiency or the timing of each error."
      },
      {
        "zh": "本站也没有计算该研究的最小字符串距离错误率或每字符按键数。整字段精确匹配是本练习的报告约定：一位错字会使整个字段不精确，但不代表整条记录所有字符都错。背景研究帮助理解指标差异，不证明这套64条记录的测量效度或训练效果。",
        "en": "This tool does not calculate the paper’s minimum-string-distance error rate or keystrokes per character. Whole-field equality is this exercise’s reporting convention: one wrong character makes a field inexact without making every character wrong. The research informs metric interpretation; it does not validate these sixty-four records or demonstrate training benefits."
      }
    ]
  },
  {
    "id": "entry-differences",
    "title": {
      "zh": "差异分类能解释什么？先比文本，再谈原因",
      "en": "What can difference categories explain? Compare text before causes"
    },
    "paragraphs": [
      {
        "zh": "错误字段依次检查空字段、大小写或空白、一对相邻字符颠倒、仅漏字符、仅多字符及其他差异，每个字段只归第一项符合的描述。比如AB-001变成AB-010是末尾相邻字符颠倒；CedarBox少空格则先归空白差异。分类优先顺序会影响汇总，不应与另一种软件的同名错误率直接比较。",
        "en": "An incorrect field receives the first applicable description: blank, case or whitespace, one adjacent transposition, omissions only, additions only, or other. AB-001 becoming AB-010 swaps adjacent final characters; CedarBox loses a space and is classified as whitespace first. This priority affects counts, so similarly named categories in another tool may not be comparable."
      },
      {
        "zh": "相同最终差异可能经历不同修改过程，分类不能诊断注意力、记忆、疲劳或某种疾病。复习时可选一个具体动作，例如换字段前核对标签、录完代码再核首尾零；下一轮观察该类文本差异是否减少，不承诺它能提升真实工作表现。",
        "en": "The same final difference can follow different editing histories. Categories do not diagnose attention, memory, fatigue or a disorder. For review, choose an observable action such as checking the field label before switching or checking edge zeros after a code. Inspect the next round’s differences without treating that exercise as proven job-performance improvement."
      }
    ]
  },
  {
    "id": "entry-clock-devices",
    "title": {
      "zh": "计时与设备：同一分钟，不同输入条件",
      "en": "Timing and devices: the same minute, different input conditions"
    },
    "paragraphs": [
      {
        "zh": "本轮固定60秒，读取、录入、换字段和改错都在计时内；到第32条也须等计时结束。浏览器计时接口使用单调时钟区分持续时间与可调整的系统日历时间；相关W3C文件也说明后台可能节流回调。[5] 本练习进入后台、离开或时钟明显偏差时取消本轮，不把取消轮次折算成完整一分钟成绩。",
        "en": "The fixed minute includes reading, entering, switching fields and correcting. Reaching record thirty-two still requires waiting. Browser timing distinguishes monotonic elapsed time from adjustable calendar time; the W3C draft also notes possible background callback throttling.[5] Backgrounding, leaving or a large clock divergence cancels this exercise rather than converting a cancelled attempt into a full-minute result."
      },
      {
        "zh": "手机软键盘、实体键盘、输入法与自动建议会改变条件。inputmode只给浏览器键盘提示，不负责验证内容。[2] 本页需要保留文字、连字符和小数，采用文本字段；比较自己的两轮时记录模式与设备，不能把语言界面相同理解成设备等价或跨设备排名。",
        "en": "Touchscreen keyboards, hardware keyboards, input methods and suggestions change conditions. The inputmode attribute hints at a keyboard without validating content.[2] Text fields preserve letters, hyphens and decimals here. Record mode and device when comparing attempts; an identical interface language does not establish device equivalence or a cross-device rank."
      }
    ]
  },
  {
    "id": "entry-practice-plan",
    "title": {
      "zh": "怎样复习？记录条件，分别看产量与精确度",
      "en": "How to review: record conditions and inspect separate outcomes"
    },
    "paragraphs": [
      {
        "zh": "一次练习后先看纳入记录数和字段数，再看精确字段、完整记录及两种字符速率。另设只填一条且全对，准确率100%仍只对应四个字段；处理更多记录但有遗漏，则应同时查看分母与差异类别。单独追最高百分比或字符KPH都可能隐藏另一部分结果。",
        "en": "Review considered records and fields, then exact fields, complete records and both character rates. A single fully correct record gives 100% on only four fields. Processing more records with omissions calls for attention to the denominator and difference categories. Chasing only the highest percentage or character KPH can hide another part of the outcome."
      },
      {
        "zh": "可自愿记录日期、模式、设备和汇总指标，下一轮只改变一个练习动作。固定来源重复后可能更熟悉，进步也可能含记忆作用，不能等同陌生资料或长时间工作。完成会清空原始输入，公开分享只有标题与链接；无需提交私人客户资料，也没有成绩门槛或付费解锁指南。",
        "en": "Optionally note date, mode, device and aggregate metrics, then change one practice action. Repeated fixed sources become familiar, so gains may include memory rather than transfer to unfamiliar material or sustained work. Completion clears raw input, and public sharing contains only a title and link. No client data, score threshold or paid guide unlock is required."
      }
    ]
  }
];

export const dataEntryLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这个测试与普通打字速度测试有什么区别？",
      "en": "How does this differ from a prose typing test?"
    },
    "answer": {
      "zh": "本页把四个源字段抄到对应输入框，需要读源值与换字段；结果按整字段匹配、记录和字符分别报告。它没有把整段文章按词速评分。",
      "en": "You copy four source fields into corresponding inputs, including reading and field switching. Results separate whole-field equality, records and characters rather than score a prose passage in words per minute."
    }
  },
  {
    "question": {
      "zh": "数量003与3相同，为什么不能算字段正确？",
      "en": "Why does 3 not match a source quantity of 003?"
    },
    "answer": {
      "zh": "本练习核对文本而非数值等价，前导零属于源表示。真实系统是否接受数值转换取决于其规则，不能从本页推断所有数据库要求。",
      "en": "This exercise checks text rather than numeric equivalence, so the zeros belong to the source representation. Other systems may apply different conversion rules."
    }
  },
  {
    "question": {
      "zh": "准确率100%就说明录入速度快吗？",
      "en": "Does 100% accuracy establish fast entry?"
    },
    "answer": {
      "zh": "不说明。四个精确字段与四十个精确字段都可能是100%；必须同时看纳入量和字符速率。没有人群常模或快慢等级。",
      "en": "No. Four exact fields and forty exact fields can both yield 100%. Inspect volume and character rates too; there are no population norms or speed bands."
    }
  },
  {
    "question": {
      "zh": "最终字段有一位错误，能给部分准确率分吗？",
      "en": "Does an almost correct field receive partial accuracy credit?"
    },
    "answer": {
      "zh": "整字段准确率不给部分分；它只问该字段是否精确。字符KPH另计最终文字产量，精确字段字符KPH只计整字段全对部分。",
      "en": "Whole-field accuracy is binary. Character KPH separately counts final text output, while exact-field character KPH counts text only in entirely matching fields."
    }
  },
  {
    "question": {
      "zh": "为什么速度乘准确率不是精确字段字符KPH？",
      "en": "Why is speed times accuracy not exact-field character KPH?"
    },
    "answer": {
      "zh": "准确率按字段计，而字符速率按长度计；长短字段权重不同。应直接累加整字段精确匹配的字符，再按固定一分钟折算。",
      "en": "Accuracy weights fields equally while character rates weight their lengths. Sum characters from entirely exact fields directly before extrapolating the fixed minute."
    }
  },
  {
    "question": {
      "zh": "32条做完可以提前结束吗？",
      "en": "Can the round finish early after all thirty-two records?"
    },
    "answer": {
      "zh": "不可以提前生成完整结果。本轮仍使用60秒，可继续返回核对。源记录有限，全部完成时可能出现产量上限，不代表持续小时表现。",
      "en": "No full result is generated early. The sixty-second interval continues and you can revisit records. The finite bank can cap output without establishing sustained hourly performance."
    }
  },
  {
    "question": {
      "zh": "修正后看不到错误，是否代表没打错过？",
      "en": "Does a correct final field mean no mistake ever occurred?"
    },
    "answer": {
      "zh": "不能确定。本页只保留最终提交字段用于计数，不重建按键历史。修正耗时仍在分钟内，但删去文字不累计到字符产量。",
      "en": "No. Counting uses final committed fields without reconstructing key history. Correction time remains in the minute, but deleted text is not accumulated as output."
    }
  },
  {
    "question": {
      "zh": "中英文界面的成绩可以当作两种语言能力吗？",
      "en": "Do the two interfaces measure ability in two languages?"
    },
    "answer": {
      "zh": "不可以。两种界面显示同一套源值，变化的是说明语言，不是语言理解题本。结果描述该模式本轮录入，不评价中文或英文水平。",
      "en": "No. The interfaces display identical source values with translated instructions, not different language-comprehension banks. Results describe the mode and attempt rather than Chinese or English proficiency."
    }
  }
];

export const dataEntryLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Soukoreff与MacKenzie（2003）：文本录入错误指标研究",
      "en": "Soukoreff & MacKenzie (2003): text-entry error metrics"
    },
    "url": "https://www.yorku.ca/mack/chi03.html"
  },
  {
    "title": {
      "zh": "W3C：High Resolution Time工作草案，时钟与持续时间",
      "en": "W3C: High Resolution Time working draft, clocks and durations"
    },
    "url": "https://www.w3.org/TR/hr-time-3/"
  }
];
