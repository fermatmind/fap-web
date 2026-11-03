import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Original practice-bank supplement; source-bound items and revision guides stay intact. */
export const attentionDetailLandingSections: QuestionnaireSection[] = [
  {
    "id": "detail-purpose",
    "title": {
      "zh": "细节注意力练习测什么？以明示规则核对信息",
      "en": "What does this attention-to-detail practice test? Checking information against stated rules"
    },
    "paragraphs": [
      {
        "zh": "本卷要求实际作答，不是自评“我是否细心”。24题分成四组，每组六题，分别核对记录、规则与步骤、数量、格式与允许集合。比较依据、操作条件和数字均由题面提供；结果记录你在这份固定练习中的正确与错误，便于找出需要回看的步骤。",
        "en": "This form asks you to solve tasks rather than rate how careful you are. Its 24 questions form four groups of six: records, rules and instructions, quantities, and formats and allowed sets. The comparison reference, conditions and numbers are supplied. Results record correct and incorrect answers within this fixed exercise so you can identify steps to revisit."
      },
      {
        "zh": "日常的“注意细节”可能涉及视觉搜寻、理解指令、算术、工作经验与持续专注等多种过程。这里没有连续反应任务、反应时或长时间监测，也没有人格尽责性自评。因此，四组是本卷的任务分类，尚不是已验证的四个独立心理能力维度。",
        "en": "Everyday attention to detail can involve visual search, instruction comprehension, arithmetic, experience and sustained attention. This form contains no continuous-response task, reaction-time measure, prolonged monitoring or conscientiousness self-rating. Its four groups classify tasks in this bank; they are not four validated, independent psychological abilities."
      }
    ]
  },
  {
    "id": "detail-records",
    "title": {
      "zh": "记录比对：相似不等于一致，字段不等于字符",
      "en": "Record comparison: similarity versus identity, fields versus characters"
    },
    "paragraphs": [
      {
        "zh": "先固定参照记录，再逐段核对编号、地址、顺序或时间文字。一个字符换位就可能不再完全相同；读起来熟悉也不能代替比对。若题目要求保持原顺序，含有相同项目但顺序不同的清单仍不满足要求。时间文字的核对也不需要自行换算时区。",
        "en": "Fix the reference record first, then check segments of a code, address, sequence or written time. Transposing a character can break an exact match; familiarity is no substitute for comparison. If the original order is required, a list with the same entries in a different order fails. Comparing written times does not call for an unstated time-zone conversion."
      },
      {
        "zh": "计数前先确认题目问“几个字段变化”还是“几个字符变化”。例如“房间205／架位B3”改成“房间250／架位B3”，变化的是一个字段；不能因为两位数字位置变动就回答两个字段。练习时可以先写出字段名称，再逐个标记是否一致，避免混用核对单位。",
        "en": "Before counting, distinguish changed fields from changed characters. Changing “room 205 / shelf B3” to “room 250 / shelf B3” changes one field; two digit positions do not make it two fields. One optional practice method is to name the fields and mark each as matching or different rather than switch units halfway through."
      }
    ]
  },
  {
    "id": "detail-rules",
    "title": {
      "zh": "规则与步骤：同时满足、至少其一与排除条件",
      "en": "Rules and instructions: conjunctions, alternatives and exclusions"
    },
    "paragraphs": [
      {
        "zh": "“同时满足”要求所有指定条件都成立；“至少满足其一”允许其中一个或多个成立；“且不含”还要检查排除条件。例如“蓝色且没有暂停标记”，蓝色但带暂停标记仍不合格。先圈出连接词与否定词，再逐项核对，比只寻找一个显眼关键词更贴近题目要求。",
        "en": "A conjunction requires every named condition, while an inclusive alternative permits one or more. A negative condition must also be checked. For “blue and no hold marker”, a blue record with a hold marker still fails. Marking conjunctions and negations before checking each condition follows the task more closely than finding one conspicuous keyword."
      },
      {
        "zh": "步骤题核对先后关系，排序题核对首要与次要排序键；文件后缀题则要看结尾是否精确符合要求。包含目标文字不一定具有目标后缀，带有额外备份扩展名也可能失败。这些题按题内规则作答，不把你在其他软件或工作场景中的习惯自动当成附加规则。",
        "en": "Sequence questions concern order, sorting questions primary and secondary keys, and suffix questions the exact end of a filename. Containing target text does not necessarily give a file the target suffix; an extra backup extension can change the answer. Apply the item’s rules without importing conventions from another application or workplace."
      }
    ]
  },
  {
    "id": "detail-quantities",
    "title": {
      "zh": "数量核对：先统一单位，再明确加减与重叠",
      "en": "Quantity checks: units, additions, deductions and overlapping categories"
    },
    "paragraphs": [
      {
        "zh": "数量题包括合计、收发余额、整包加散件、单价乘数量，以及排除撤回或重复记录。先写出每个数代表什么。例如两包各7张再加4张散件，共18张，不能把“2包”和“4张”直接相加。余额则分清期初、增加与减少，避免把发出数量当成新入库。",
        "en": "Quantity tasks cover totals, opening balances plus receipts and issues, packs and loose units, price-times-quantity, and deductions for withdrawn or duplicate records. Label each number first: two packs of seven plus four loose cards make eighteen cards, not six mixed units. In a balance, distinguish opening stock, additions and removals."
      },
      {
        "zh": "同一记录属于两个排除类别时，不能不看条件就减两次；题面明确两类互不重叠时，才可分别直接扣除。本卷的答案依照各题给定条件计算。检查总数时，可以先独立列式，再对照声称的合计，而不是让一个看起来合理的数字影响计算。",
        "en": "If an entry belongs to two excluded categories, subtracting it twice is not automatically justified; separate direct deductions are appropriate when the item states the categories do not overlap. Answers follow each item’s conditions. For a claimed total, write an independent calculation before comparing it, rather than let a plausible-looking number anchor the arithmetic."
      }
    ]
  },
  {
    "id": "detail-formats",
    "title": {
      "zh": "格式与允许集合：大小写、空格、位置与重复",
      "en": "Formats and allowed sets: case, spaces, position and duplicates"
    },
    "paragraphs": [
      {
        "zh": "格式题按明确给定的字母大小写、字符数、分隔符与顺序判断。只允许忽略空格，就不能同时忽略大小写或连字符。24小时制若要求HH:MM，就需要两位小时和两位分钟，并同时满足小时00—23、分钟00—59；看起来像时间并不足够。",
        "en": "Format tasks specify letter case, character counts, separators and order. Permission to ignore spaces does not also permit ignoring case or hyphens. A stated HH:MM format requires two hour digits and two minute digits, with hours from 00 to 23 and minutes from 00 to 59. Looking time-like is insufficient."
      },
      {
        "zh": "允许集合与不重复是两项检查：所有条目都在清单内，但重复出现，仍可能违反唯一性要求。精确符号序列则逐位比较，不能把“找相同”改成猜下一项规律。核对时先读任务动词，确认是在复制、验证、筛选还是推断。",
        "en": "Membership and uniqueness are separate checks: every entry may belong to an allowed list while a duplicate still violates a uniqueness rule. An exact symbol sequence calls for positional comparison, not guessing the next pattern. Identify whether the task asks you to copy, validate, filter or infer before applying a method."
      }
    ]
  },
  {
    "id": "detail-score",
    "title": {
      "zh": "24题怎样计分？总答对数、四项小计与完整题解",
      "en": "How are 24 questions scored? Total correct, four subtotals and full explanations"
    },
    "paragraphs": [
      {
        "zh": "每题只有一个标准答案，选对记1题，选错记0题；没有反向分、速度奖励、权重或部分分。四项各0—6题，总计0—24题。例如记录2、规则6、数量0、格式5，合计13／24；这说明本次具体答对13题，不能解释成超过13个人或达到某个职业等级。",
        "en": "Each item has one answer key: a correct selection counts one and an incorrect selection zero. There is no reversal, speed bonus, weighting or partial credit. Four subtotals range from zero to six and the total from zero to twenty-four. Records 2, rules 6, quantities 0 and formats 5 sum to 13/24: thirteen correct in this attempt, not thirteen people surpassed or a job level attained."
      },
      {
        "zh": "完成后，24题都显示你的选择、正确答案和解析，四份各五节的复习指南也全部保留，不按最高分只展示一份。4／6只表示该组六题中答对四题；六题内容与难度并不相同，组间相差一次尚无可据以判断能力差异的测量误差资料。",
        "en": "Completion reveals your selection, the answer key and explanation for all twenty-four items, plus all four five-section revision guides rather than only the highest-scoring group. Four out of six literally means four correct in that group. Content and difficulty differ, and there is no measurement-error evidence supporting an ability interpretation of a one-item difference."
      }
    ]
  },
  {
    "id": "detail-review-evidence",
    "title": {
      "zh": "怎样复习与重测？可复算答案与测量证据分别看",
      "en": "Reviewing and retaking: reproducible answer keys and measurement evidence"
    },
    "paragraphs": [
      {
        "zh": "可以从一道错题开始，分别记录题目要求、自己采用的规则与遗漏的条件，再构造一个会让答案改变的反例。比如把“同时满足”改为“至少满足其一”，或明确增加一项排除条件。这是检查是否理解规则的练习建议；本卷尚未证明这种复习能改善所有现实任务或工作表现。",
        "en": "Start with one error and record the requirement, the rule you used and any missed condition, then construct a counterexample that changes the answer. You might replace a conjunction with an inclusive alternative or add an explicit exclusion. This is an optional comprehension exercise, not an intervention shown by this form to improve every real task or job performance."
      },
      {
        "zh": "测验标准要求分数的特定解释与用途有相应证据。[1] 本卷可以核查标准答案与算式，目前尚未建立信度、效度、常模、招聘通过线或中英文测量等价性。中文与英文对应同一组规则和题目结构，并不自动证明不同语言成绩可直接比较。",
        "en": "Testing standards require evidence for particular score interpretations and uses.[1] This bank’s answer keys and calculations can be checked, but form-specific reliability, validity, norms, hiring cutoffs and English–Chinese measurement equivalence are unestablished. Parallel rules and item structure do not automatically make scores across languages directly comparable."
      },
      {
        "zh": "重复作答可能记住答案或熟悉策略。Calamia等的元分析讨论的是神经心理测验中的练习效应，[2] 可用于提醒解释重测时留意熟悉程度；不能把其中的效应大小、临床结论或校正方法直接用于本卷。重测时记录是否看过解析、是否使用计算器与作答环境，比把涨分直接称为注意力改善更稳妥。",
        "en": "A retake may involve remembered answers or familiar strategies. Calamia and colleagues examined practice effects in neuropsychological tests.[2] That research motivates attention to familiarity when interpreting a retake; its effect sizes, clinical conclusions and correction methods do not transfer directly to this bank. Note prior access to explanations, calculator use and conditions rather than label a higher total improved attention."
      }
    ]
  },
  {
    "id": "detail-access",
    "title": {
      "zh": "不限时的免费练习：条件、隐私与使用场景",
      "en": "Free untimed practice: conditions, privacy and uses"
    },
    "paragraphs": [
      {
        "zh": "约8分钟仅供安排时间，没有倒计时，也不计算录入速度、反应时或每分钟正确数。可使用纸笔与计算器。若要比较自己两次作答，尽量记录相同的工具和环境；24／24表示本次全部答对，0／24表示本次未选中标准答案，二者都不是对整个人的能力定级或诊断。",
        "en": "About eight minutes helps with planning; there is no countdown, entry-speed measure, reaction time or correct-per-minute score. Paper and a calculator are allowed. For a personal retake comparison, record tools and conditions. Twenty-four out of twenty-four means all answers correct this time, and zero means no selected keys; neither grades a whole person’s ability or supplies a diagnosis."
      },
      {
        "zh": "开始直接进入题目，24题、全部题解和四份复习指南免费，无需邮箱或注册。答案在浏览器计分，只有主动保存才建立本标签页24小时草稿，完成、清除或重测即删除。分享公开练习或指南链接，不包含个人答题单。本页适合自愿练习和复盘，不提供认证、招聘决定或医学注意评估。",
        "en": "Start opens questions directly. All twenty-four items, explanations and four revision guides are free without email or signup. Answers are scored in the browser; explicit saving creates a twenty-four-hour tab draft, cleared on completion, clearing or retake. Sharing a public exercise or guide link does not include a personal answer sheet. Use this page for voluntary practice and review, not certification, hiring decisions or medical attention assessment."
      }
    ]
  }
];

export const attentionDetailLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "题目是找不同，还是评价我是否细心？",
      "en": "Is this difference checking or a rating of my carefulness?"
    },
    "answer": {
      "zh": "是实际核对题：记录、条件步骤、数量与格式各六题。每题一个标准答案，没有“我很细心”之类的人格自评。",
      "en": "These are actual checking tasks: six each for records, conditions and steps, quantities, and formats. Each has one answer key, without personality ratings such as “I am careful”."
    }
  },
  {
    "question": {
      "zh": "需要在8分钟内完成吗？",
      "en": "Must I finish in eight minutes?"
    },
    "answer": {
      "zh": "不需要。8分钟只是预计阅读用时，没有计时限制、速度加分或每分钟得分。",
      "en": "No. Eight minutes is an estimated reading time. There is no time limit, speed bonus or per-minute score."
    }
  },
  {
    "question": {
      "zh": "可以使用计算器或纸笔吗？",
      "en": "May I use a calculator or paper?"
    },
    "answer": {
      "zh": "可以。本卷不测心算速度；复盘或重测时可以记下使用了哪些工具，方便理解作答条件。",
      "en": "Yes. Mental-arithmetic speed is not measured. Record tools used when reviewing or retaking to understand your conditions."
    }
  },
  {
    "question": {
      "zh": "题目说忽略空格，可以同时忽略大小写吗？",
      "en": "If spaces may be ignored, may I also ignore case?"
    },
    "answer": {
      "zh": "不能自行扩大规则。只允许忽略空格时，大小写、连字符与其他字符仍按题目要求核对。",
      "en": "Do not expand the rule. If only spaces may be ignored, case, hyphens and other characters still follow the item’s requirements."
    }
  },
  {
    "question": {
      "zh": "为什么一个字段变化不能按两个字符变化来计数？",
      "en": "Why can one changed field not be counted as two changed characters?"
    },
    "answer": {
      "zh": "题目问的计数单位不同。一个编号中多个字符变化，仍可能只有“编号”这一个字段发生变化。",
      "en": "The counting unit differs. Several changed characters inside a code can still represent only one changed field: the code itself."
    }
  },
  {
    "question": {
      "zh": "四项2、6、0、5分别是什么意思？",
      "en": "What do four subtotals of 2, 6, 0 and 5 mean?"
    },
    "answer": {
      "zh": "按记录、规则、数量、格式顺序，分别答对2、6、0、5题，合计13／24。四份复习指南仍全部显示，不产生能力等级或百分位。",
      "en": "In records, rules, quantities and formats order, they mean 2, 6, 0 and 5 correct, totalling 13/24. All four guides remain available without an ability grade or percentile."
    }
  },
  {
    "question": {
      "zh": "满分会获得能力认证吗？",
      "en": "Does a perfect score earn an ability certificate?"
    },
    "answer": {
      "zh": "不会。24／24只说明这份题本本次全部答对，不生成认证、招聘通过线或职业资格。",
      "en": "No. A 24/24 result means every item in this bank was correct this time. It grants no certificate, hiring cutoff or occupational qualification."
    }
  },
  {
    "question": {
      "zh": "做完后只显示最高分的复习指南吗？",
      "en": "Does completion reveal only the highest-scoring guide?"
    },
    "answer": {
      "zh": "不是。全部24题的所选、标准答案和解析，以及四份各五节的完整指南都免费显示。",
      "en": "No. Your selections, keys and explanations for all 24 items and all four complete five-section guides are free."
    }
  },
  {
    "question": {
      "zh": "中文和英文分数可以直接比较吗？",
      "en": "Can Chinese and English scores be directly compared?"
    },
    "answer": {
      "zh": "两版对应同一组任务与规则，但尚未建立跨语言测量等价证据，不能仅凭翻译对应就推断成绩可比。",
      "en": "They correspond to the same tasks and rules, but cross-language measurement equivalence is unestablished. Translation correspondence alone does not establish score comparability."
    }
  },
  {
    "question": {
      "zh": "点击开始后还要同意、填邮箱或付费吗？",
      "en": "Must I agree again, enter an email or pay after starting?"
    },
    "answer": {
      "zh": "不需要。开始直接打开题目，24题与全部解析免费，无需额外同意、邮箱、注册或先做其他测评。",
      "en": "No. Start opens questions directly. All 24 items and explanations are free without another agreement, email, signup or prerequisite assessment."
    }
  }
];
