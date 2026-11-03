import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Original five-operation practice supplement; accepted items, keys and reports stay intact. */
export const aptitudeLandingSections: QuestionnaireSection[] = [
  {
    "id": "aptitude-scope",
    "title": {
      "zh": "能力倾向与认知能力测试练什么？五类有标准答案的任务",
      "en": "What does this aptitude and cognitive practice cover? Five kinds of right-answer task"
    },
    "paragraphs": [
      {
        "zh": "本卷包括数值推理、阅读与证据、演绎推理、明示符号规则和查错，各六题。任务要求分别是选对基数与运算、找到文字依据、推出必然结论、执行给定变换、按原件核对记录。它们可以帮助你熟悉这些题型及其解析，但不是一套完整认知能力模型，也不含人格偏好、工作记忆或实测反应速度。",
        "en": "This bank contains six items each in numerical reasoning, reading and evidence, deduction, explicit symbol rules and error-checking. The operations are choosing a base and calculation, locating textual support, deriving a necessary conclusion, applying a supplied transformation and comparing a record with its source. They offer format familiarisation and worked review, not a complete cognitive model, personality preferences, working-memory tasks or measured response speed."
      },
      {
        "zh": "读结果时先定位题目要求，再看自己用了什么操作。例如“平均数”与“中位数”、“恰好一个”与“至少一个”、“相同数值”与“完全相同文本”是不同任务。选项看起来合理，不等于满足题定条件。五份公开指南开始前就能阅读；完成后所有正确数，包括0题和30题，都能看到全部答案与指南。",
        "en": "Read the task requirement before reviewing your operation. Mean and median, exactly one and at least one, or equal values and identical text describe different tasks. A plausible option need not satisfy the supplied conditions. Five public guides are readable before starting; every completed attempt, including zero or thirty correct, retains all worked answers and guides."
      }
    ]
  },
  {
    "id": "aptitude-numerical",
    "title": {
      "zh": "数值六题：先写基数、单位和所问数量",
      "en": "Six numerical tasks: identify the base, units and requested quantity"
    },
    "paragraphs": [
      {
        "zh": "本组覆盖百分比、比例分配、算术平均、一次性费用、增加后的新值与题定恒速。复习时应分别检查：百分数乘的是哪个整体；比例分母是否为全部份数；问的是增加量还是最终值；配送费加一次还是逐件加。恒速与没有准备时间是本题条件，不能据此估计真实人员的生产率。",
        "en": "This section covers percentages, ratio allocation, the arithmetic mean, a one-off charge, a value after increase and a stated constant rate. Check the percentage base, total ratio parts, increase versus final value, and whether a charge applies once or per item. Constant rate and no setup time are supplied puzzle conditions, not estimates of actual worker productivity."
      },
      {
        "zh": "另看一例：总数84按2:5分配，七份每份12，第二项为60；把24写出来虽然算对第一项，仍没有回答第二项。若虚构数量96增加原值的25%，增加量24，新值120。计算后回查两个部分是否合回总数、增加后的数量是否比原值大；允许用计算器，重点仍是把表达式写对。",
        "en": "For a fresh example, allocate eighty-four in a 2:5 ratio: seven parts of twelve give sixty to the second part. Twenty-four correctly calculates the first allocation but answers the wrong question. If ninety-six increases by one quarter of its starting value, the increase is twenty-four and the final value one hundred twenty. Check totals and direction after calculating; a calculator does not choose the correct expression for you."
      }
    ]
  },
  {
    "id": "aptitude-verbal",
    "title": {
      "zh": "阅读六题：区分已给事实、相反信息与没有说明",
      "en": "Six reading tasks: separate support, contradiction and missing information"
    },
    "paragraphs": [
      {
        "zh": "本组涉及版本可读时间、自愿样本、评阅顺序、未确认原因、缺失费用和核对单位的工作请求。仅凭“12人回答”不能概括所有人的偏好；提到天气可能造成延误，不等于已经确认全部延误的原因；没写费用也不能当成免费。这些差别都可以回到原文逐句核对。",
        "en": "The passages concern release times, a voluntary sample, review order, an unconfirmed cause, an omitted fee and a request to check units. Twelve responses establish no population preference; a possible weather explanation is not a confirmed cause of every delay; an omitted fee does not establish free attendance. Each distinction can be checked against the supplied text."
      },
      {
        "zh": "先圈出题目问“有依据”“没有依据”还是“无法回答”，再给每个选项找它需要的事实。另设通知写活动10点开始、需预约但没写价格：开始时间与预约要求可答，价格仍未知。未知不是零，也不一定是假。回复任务请求时，还要核对回应是否完成了对方指定的工作，而非另做一件有用的事。",
        "en": "First identify whether the question asks for support, lack of support or an unanswerable question, then locate the fact each option requires. A new notice giving a ten o’clock start and required booking but no price establishes time and booking, not price. Unknown is neither zero nor necessarily false. A reply must also address the requested work rather than a different useful task."
      }
    ]
  },
  {
    "id": "aptitude-deduction",
    "title": {
      "zh": "演绎六题：用所有允许情况检查“必须成立”",
      "en": "Six deduction tasks: test necessity against every allowed case"
    },
    "paragraphs": [
      {
        "zh": "题目提供条件蕴含、否定后件、互斥、先后顺序和组合选择规则。“P需要Q”允许有Q而没有P；若另给“Q不能与R同有”，则有P时不能有R。“恰好一个灯亮”排除了全亮与全灭，不是“至少一个”。每次判断都保留题目给出的方向、数量词和全部约束。",
        "en": "The items supply implication, a missing consequence, exclusion, ordering and selection rules. P requiring Q allows Q without P; if Q excludes R, P also excludes R. Exactly one light excludes both-on and both-off, unlike at least one. Preserve the direction, quantifier and every constraint in each conclusion."
      },
      {
        "zh": "另设规则“每张红卡都有印章”：看见印章不能推出红色，一张蓝色有印章的卡就是反例；看见没有印章，则可在该规则下排除红卡。短题可列出两个布尔属性的四种组合，划去违例情况，再检查剩下的每种情况。一个可能发生的结论，不一定是所有允许情况都必须发生的结论。",
        "en": "For a fresh rule that every red card is stamped, a stamp does not establish red: a stamped blue card is a counterexample. An unstamped card cannot be red under that rule. List the four combinations of two Boolean properties, remove violations and inspect every remaining case. A possible conclusion is not necessarily required in every allowed case."
      }
    ]
  },
  {
    "id": "aptitude-patterns",
    "title": {
      "zh": "符号六题：执行明示规则，而不是猜出题人心思",
      "en": "Six symbol tasks: execute the explicit rule rather than guess an intention"
    },
    "paragraphs": [
      {
        "zh": "本卷规则直接给出：固定增量、重复四符号块、短字母表位移、首尾交换、符号数量与两步运算。它与需要从图形中归纳未知规律的题不完全相同。字母是题定符号，不是英文词汇测验；每一步应保持题面规定的位置和顺序，不能因为另一个变换看起来熟悉就替换规则。",
        "en": "The bank supplies a fixed increment, a four-symbol repeating block, a short alphabet shift, an endpoint swap, symbol counts and a two-step operation. This differs from inferring an unknown rule from figures. Letters are supplied symbols rather than English vocabulary; preserve the stated positions and operation order instead of substituting a familiar transformation."
      },
      {
        "zh": "另设规则把U V W首尾交换，结果是W V U，中间V不动；循环右移则是W U V，是另一种操作。若机器先乘3再加2，输入5得到17，先加再乘会得到21。重复块按从1开始的位置数，数量规则只在题面允许“任意顺序”时忽略位置。把中间步骤写下来，比只对最后选项更容易查出错因。",
        "en": "For a fresh endpoint swap, U V W becomes W V U, retaining the middle V; rotating right gives W U V and is a different operation. Multiplying five by three then adding two gives seventeen; reversing the operations gives twenty-one. Count repeating-block positions from one, and ignore order only when the rule permits it. Written intermediate steps make the missed operation easier to identify."
      }
    ]
  },
  {
    "id": "aptitude-checking",
    "title": {
      "zh": "查错六题：文本一致、限定转换、顺序和字段数",
      "en": "Six checking tasks: literal text, permitted transformations, order and field counts"
    },
    "paragraphs": [
      {
        "zh": "查错先问要保留什么。虚构标签07.50与7.5数值相同，却不是相同文本；要求原样抄录时不能删零。另设“只忽略连字符”：Ka-82-Z与K-a82Z都变成Ka82Z，但KA82Z和Ka82z仍不同，不能额外忽略大小写、空格或其他符号。转换应同样作用于两边，再比较整个输出。",
        "en": "Begin by deciding what must be preserved. The fictional labels 07.50 and 7.5 have equal values but different text; exact copying cannot remove zeros. Under a fresh hyphens-only rule, Ka-82-Z and K-a82Z both become Ka82Z, while KA82Z and Ka82z still differ. Do not also ignore case, spaces or other symbols. Apply the same permitted transformation to both sides and compare the full outputs."
      },
      {
        "zh": "另设原记录rack 18 / count 25 / bin H4，抄本rack 18 / count 52 / bin H7改变两字段，不是把所有字符变化逐一计数。清单也要按位置核对：有相同元素不代表顺序一致。原件放在旁边，先按前缀、数字段、后缀或字段分组，发现一个差异后仍完成题目要求的全部比较；不把练习正确数当作注意力诊断或文书资格。",
        "en": "A new record rack 18 / count 25 / bin H4 copied as rack 18 / count 52 / bin H7 changes two fields, which differs from counting changed characters. Lists require position-by-position comparison: equal elements do not imply equal order. Keep the source visible, group corresponding parts and complete the requested comparison after finding a difference. Counts establish no attention diagnosis or clerical qualification."
      }
    ]
  },
  {
    "id": "aptitude-results",
    "title": {
      "zh": "怎样读30题结果？总数、五项正确数与具体错因",
      "en": "How should you read thirty-item results? Total, five counts and specific errors"
    },
    "paragraphs": [
      {
        "zh": "每个有效选择与答案键一致记1，否则记0；五组各0—6，合计0—30，不加权、不倒扣、不计速度。缺答不是答错：必须30题均有有效选择才产生完整结果。例如五组依次1、2、3、4、5，合计15/30；这些数只是本次题目的正确数，不是某组比另一组高多少能力，因为五组难度没有被校准为同一尺度。",
        "en": "A valid choice matching the key earns one, otherwise zero. Five groups range from zero to six and sum to zero through thirty, without weights, penalties or speed points. Missing is not wrong: thirty valid choices are required. Counts of 1, 2, 3, 4, 5 total fifteen of thirty, describing this attempt rather than differences in underlying ability; section difficulty has not been calibrated to a common scale."
      },
      {
        "zh": "国际测验委员会要求，对分数的解释和用途提供相应信度、效度证据。[1] 本页的算术、事实、有限逻辑状态与字符串核对验证的是题定答案，不足以建立一般认知能力、智商或招聘线。无论总数是多少，都保留30题解析和五份完整指南，共27个指南小节；先定位错误步骤，再选一种操作用新例子练习。",
        "en": "The International Test Commission calls for reliability and validity evidence supporting intended score interpretations and uses.[1] Arithmetic, fact, finite-logic and string checks establish keys under these rules, not general cognitive ability, IQ or hiring thresholds. Every total retains thirty explanations and five full guides comprising twenty-seven guide sections. Locate the missed step before rehearsing an operation with a fresh example."
      }
    ]
  },
  {
    "id": "aptitude-conditions",
    "title": {
      "zh": "练习条件、中英文与重做：保持可解释的记录",
      "en": "Conditions, English–Chinese versions and retakes: keep the attempt interpretable"
    },
    "paragraphs": [
      {
        "zh": "本页不计时，纸笔和计算器均允许，约15分钟只是阅读与思考的估计。要比较自己的两次练习，可记录所用语言、是否看过答案、是否用工具及中断情况。题目更多、名字含“认知”或得到高正确数，都不能自动证明测量质量。已有解析读过以后再次答对，可能是记住答案，不能单凭提高推断广泛能力改变。",
        "en": "This page is untimed and permits paper and calculators; fifteen minutes is only an estimated reading and thinking time. For personal review, note language, prior answer exposure, tools and interruptions. More questions, a cognitive label or a high count does not establish measurement quality. Correctly answering an explained item on a retake may reflect recall rather than a broader ability change."
      },
      {
        "zh": "翻译内容完整与两种语言分数等价是不同问题。国际测验委员会的改编指南要求跨语言分数连接和比较有相应实证支持。[2] 本版未建立这种等价性，也不提供常模或雇主分数换算。开始直接作答，全部题解免费；答案在浏览器计分，可选草稿24小时失效，完成、重测或退出清除即删除。分享只含公开测试链接，不含答案或正确数。",
        "en": "Complete translation and equivalent scores are different matters. ITC adaptation guidelines require empirical support for linking and comparing scores across languages.[2] This edition establishes no such equivalence, norms or employer-score conversion. Start opens questions directly and all worked answers are free. Answers are scored in the browser; optional drafts expire after twenty-four hours and clear on completion, retake or exit-and-clear. Sharing includes only the public test link, not answers or correct counts."
      }
    ]
  }
];

export const aptitudeLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "五个分项分别练什么？",
      "en": "What do the five sections practise?"
    },
    "answer": {
      "zh": "数值选基数与运算，阅读找明示依据，演绎检验必然结论，符号执行给定变换，查错核对文本、顺序与字段；各六题。",
      "en": "Six items each practise numerical bases and operations, textual evidence, necessary deductions, supplied symbol transformations and text/order/field comparison."
    }
  },
  {
    "question": {
      "zh": "五项1、2、3、4、5怎样合计？",
      "en": "How do section counts of 1, 2, 3, 4, 5 add up?"
    },
    "answer": {
      "zh": "合计15/30，每项仍单独显示正确数/6。五组未校准为相同难度，不能直接把高低条形当能力强弱排名。",
      "en": "They total fifteen of thirty, with each count still shown out of six. The sections are not difficulty-equated, so taller bars establish no ability ranking."
    }
  },
  {
    "question": {
      "zh": "0分也能看30题解析吗？",
      "en": "Can I see all thirty explanations with zero correct?"
    },
    "answer": {
      "zh": "能。完成30题后，无论0题、部分答对还是全对，都显示所选、正确答案、完整解析与全部五份指南，共27个指南小节。",
      "en": "Yes. Any completed attempt, including zero, partial or perfect counts, retains choices, keys, explanations and all five guides with twenty-seven guide sections."
    }
  },
  {
    "question": {
      "zh": "为什么42.60与42.600有时不能当相同答案？",
      "en": "Why might 42.60 and 42.600 not count as the same answer?"
    },
    "answer": {
      "zh": "数值相同不等于文本相同。本卷对应题要求保留两位小数的印刷文本，所以额外的小数位不满足原样抄录；其他题按各自明示规则判断。",
      "en": "Equal numerical values need not be identical text. The relevant item requires the printed amount with two decimal places, so an added place fails exact copying. Other items follow their own explicit rules."
    }
  },
  {
    "question": {
      "zh": "允许删连字符，就能忽略大小写吗？",
      "en": "Does permission to remove hyphens also allow ignoring case?"
    },
    "answer": {
      "zh": "不能。只删除该题明示的连字符，两边同样处理后仍须逐字一致；大小写、顺序和其他符号不能擅自改变。",
      "en": "No. Remove only the explicitly permitted hyphens from both sides, then compare literally. Do not additionally change case, order or other symbols."
    }
  },
  {
    "question": {
      "zh": "新版30题能和旧版24题直接比总分吗？",
      "en": "Can the thirty-item edition be compared directly with the old twenty-four-item total?"
    },
    "answer": {
      "zh": "不能直接比较。新版增加六道查错题，分母与覆盖不同；旧草稿按版本失效，不补成30题作答。重做也要考虑看过答案和工具条件。",
      "en": "No direct comparison is established. Six checking items change the denominator and coverage; old drafts expire by version rather than being filled into thirty-item attempts. Review answer exposure and tools on retakes too."
    }
  },
  {
    "question": {
      "zh": "点击开始后要再同意或填邮箱吗？",
      "en": "Must I agree again or enter an email after starting?"
    },
    "answer": {
      "zh": "不需要。开始直接进入30题，全部解析与指南免费，无需额外同意、邮箱、账号或另一测试。",
      "en": "No. Start opens thirty items directly. All explanations and guides are free without another agreement, email, account or another test."
    }
  }
];
