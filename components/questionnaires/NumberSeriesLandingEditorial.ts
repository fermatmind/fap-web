import type { Text, QuestionnaireSection } from "@/lib/questionnaires/types";
export const numberSeriesSections: QuestionnaireSection[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Number series practice: five rule families and worked answers",
      "zh": "数列推理练习：五类规则与完整推导"
    },
    "paragraphs": [
      {
        "en": "This Number Series Test contains thirty original four-option questions. Six questions cover each topic: constant differences, constant ratios, changing gaps, interleaved arithmetic branches and bounded two-term recurrences. Each prompt states the allowed rule family and asks for a missing final or interior term. Your task is to find the offered value that satisfies those conditions.",
        "zh": "数列推理测试包含30道原创四选一题。固定差值、固定比值、变化差值、交错等差支与有界二项递推各六题。每题明示允许的规则族，要求补末项或中间项，任务是找出满足这些条件的选项值。"
      },
      {
        "en": "After completion, every question shows your selection, the correct answer and the worked explanation, alongside five topic counts and five complete revision guides. All are free at any count. The public guides can also be read before starting; they are mathematics topics, not ranked result types.",
        "zh": "完成后，每题均显示所选、正确答案与完整解析，同时提供五组专题正确数和五份完整复习指南；答对多少都能免费阅读。公开指南在开始前也可查看，它们是数学专题，不是高低结果类型。"
      }
    ]
  },
  {
    "id": "answering",
    "title": {
      "en": "Untimed practice with paper or a calculator",
      "zh": "不计时练习，可用纸笔或计算器"
    },
    "paragraphs": [
      {
        "en": "Read the rule condition before doing arithmetic. Locate the blank, label positions when useful and choose one of the four answers. There is no countdown or speed adjustment; about eighteen minutes is an editorial reading-and-solving estimate, not measured completion data. Paper and a calculator are allowed, and no question asks you to round an intermediate value.",
        "zh": "先读规则条件，再计算。确认缺项位置，需要时标上项数，从四个答案中选择一项。页面没有倒计时，也不按速度调整；约18分钟是编辑估计的阅读与解题用时，不是实测数据。可用纸笔和计算器，没有题目要求中途舍入。"
      },
      {
        "en": "You may return to earlier questions and change a choice. All thirty questions require valid selections before the report appears; missing responses are not silently counted as wrong. The fixed bank does not generate a new set on retake. Once you have read the keys, later counts may include memory as well as understanding.",
        "zh": "可以返回前题改答。全部30题有效作答后才显示报告，未回答不会暗算成错误。重做使用固定题本，不生成另一套新题；看过答案后，后来正确数可能同时包含记忆与理解。"
      }
    ]
  },
  {
    "id": "difference",
    "title": {
      "en": "Constant differences and ratios: choose the right operation",
      "zh": "固定差值与比值：先分清运算"
    },
    "paragraphs": [
      {
        "en": "An arithmetic sequence has a constant difference between consecutive terms. In a fresh example, 17, 23, 29, ?, 41 with constant difference +6 has the missing value 35. Check both sides: 29 + 6 = 35 and 35 + 6 = 41. A missing interior term hides two transitions; the jump across it is not a single step. [1]",
        "zh": "等差数列的相邻项差值恒定。另例17、23、29、问号、41，固定差值为+6，缺项35；左右29+6=35、35+6=41都应成立。中间缺项遮住两次转移，跨过它的总变化不能直接当成一步。[1]"
      },
      {
        "en": "A geometric sequence uses a constant factor. In 5, −10, 20, −40, ? with factor −2, the next term is 80. The sign changes with the multiplication; using only absolute values loses part of the rule. OpenStax distinguishes constant differences from constant ratios and gives explicit and recursive forms. Its mathematics explains the models, not the measurement quality of this practice bank. [2]",
        "zh": "等比数列使用固定乘数。另例5、−10、20、−40、问号，按乘−2得到下一项80。负号随乘法一起变化，只看绝对值会漏掉规则的一部分。OpenStax区分固定差值与固定比值，并介绍通项和递推形式；这些数学内容解释模型，不为本题本的测量质量背书。[2]"
      }
    ]
  },
  {
    "id": "gaps",
    "title": {
      "en": "Changing gaps: return from the difference row to the terms",
      "zh": "变化差值：从差值行回到原项"
    },
    "paragraphs": [
      {
        "en": "For 2, 6, 13, 23, ? under a rule whose gaps increase by a fixed amount, the gap row is 4, 7, 10. Its next value is 13, so the next original term is 23 + 13 = 36. Answering 13 solves a different question. Keep separate labels for the original terms and their differences.",
        "zh": "另例2、6、13、23、问号，若差值每次增加同一个数，则差值行为4、7、10，下一差为13，下一原项为23+13=36。回答13是在答另一个问题，应将原项和差值分别标清。"
      },
      {
        "en": "This bank allows gaps that add a fixed nonzero amount or multiply by a fixed factor. Test the same candidate rule throughout the entire gap row. A blank in the middle hides two neighbouring gaps, so substituting each offered value and checking the completed row can be useful. Do not introduce an exception near the blank to rescue a rule that failed earlier.",
        "zh": "本题本允许差值加固定非零数或乘固定数，候选规则必须适用于整条差值行。中间缺项会遮住两个相邻差，可将各选项逐一填回再核完整列。不能在问号附近加临时例外，挽救前面已经不成立的规则。"
      }
    ]
  },
  {
    "id": "interleave",
    "title": {
      "en": "Interleaving: split positions, not numerical parity",
      "zh": "交错数列：按位置拆分，不看数值奇偶"
    },
    "paragraphs": [
      {
        "en": "For 3, 40, 8, 37, 13, 34, ? with independent arithmetic branches, odd positions contain 3, 8, 13, ?, adding 5. Even positions contain 40, 37, 34, subtracting 3. The blank is at position seven, so it belongs to the first branch and equals 18. Whether the values themselves are odd or even is irrelevant.",
        "zh": "另例3、40、8、37、13、34、问号，若奇偶位各成等差支，奇数位为3、8、13、问号，每次加5；偶数位为40、37、34，每次减3。问号是第七项，属于第一支，等于18；数值本身奇偶与归支无关。"
      },
      {
        "en": "The two branches may have different starting values and steps, including a zero step. After calculating, place each value back in its original position and verify both branches. This catches a correct calculation inserted into the wrong slot, particularly when the last visible term belongs to the other branch.",
        "zh": "两支可以有不同首项和公差，包括零公差。计算后应按原位置放回并核对两支，避免支内算对却填错位置，尤其要留意最后一个可见项是否属于另一支。"
      }
    ]
  },
  {
    "id": "recurrence",
    "title": {
      "en": "Bounded recurrences: one formula for every transition",
      "zh": "有界递推：所有转移使用同一公式"
    },
    "paragraphs": [
      {
        "en": "From the third term onward, these questions allow p × previous term + q × the term before it + c, with integer p and q from −2 to 3 and integer c from −3 to 3. That gives 6 × 6 × 7 = 252 possible coefficient triples. Test one triple across all relevant transitions, moving the two-term window forward each time. Recursive notation describes how terms depend on earlier terms. [3]",
        "zh": "从第三项起，本题允许p×前项+q×前两项+c，其中p、q为−2至3整数，c为−3至3整数，共6×6×7=252组系数三元组。一组系数须满足所有相关转移，每次计算后都要前移两项窗口。递推表示法说明项与前项之间的依赖关系。[3]"
      },
      {
        "en": "For a fresh rule using the previous two terms plus 2, start with 4 and 7. The next terms are 13, 22 and 37, then 61. The constant is added once per new term. Different coefficient triples can sometimes agree on the whole row; correctness here requires one sole offered missing value, not necessarily one uniquely identifiable triple.",
        "zh": "另例以前两项和加2为规则，从4、7开始，后续为13、22、37，再到61；常数是每生成一项加一次。有时不同系数三元组会在整列上给出相同结果，本题要求只有一个提供的缺项值成立，不要求必然唯一确定系数组合。"
      }
    ]
  },
  {
    "id": "ambiguity",
    "title": {
      "en": "Why a rule condition matters for a finite sequence",
      "zh": "有限数列为什么需要规则条件"
    },
    "paragraphs": [
      {
        "en": "The finite prefix 2, 5, 8 can continue as 11 under the rule a(n) = 3n − 1. Another formula, a(n) = 3n − 1 + (n − 1)(n − 2)(n − 3), has exactly the same first three values but gives 17 at n = 4. Both fit the prefix. This original counterexample explains why a short list alone cannot establish an unrestricted unique continuation.",
        "zh": "有限前缀2、5、8在a(n)=3n−1下接11；另一个公式a(n)=3n−1+(n−1)(n−2)(n−3)的前三项完全相同，但n=4时为17。两者均符合前缀。这一另构反例说明，短数字列表本身不能确定不受限制的唯一续法。"
      },
      {
        "en": "Every prompt here narrows the family before you choose. The answer checks substitute all four offered values into the displayed row and test the stated conditions using exact arithmetic. That verifies the conditional key. It does not prove that the same formula governs real prices, demand or another measured process, nor that recognizing it measures general intelligence.",
        "zh": "本页每题都先限定规则族。答案核查将四个选项分别代入完整列，以精确运算检验明示条件，核对的是有条件的答案。它不证明现实价格、需求或其他实测过程遵循同一公式，也不证明识别公式就是测得一般智力。"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "Read the counts as feedback on this fixed bank",
      "zh": "将正确数读作固定题本的反馈"
    },
    "paragraphs": [
      {
        "en": "Each correct selection adds one; any other valid selection adds zero. There is no guessing penalty, partial credit, weighting or speed adjustment. Five topic counts each range from 0 to 6, and their sum is the total out of 30. For example, 4, 3, 5, 2 and 4 sum to 18 / 30; this is not a percentile or a normed reasoning score.",
        "zh": "每题选对记1，其余有效选择记0，不倒扣、不计部分分、不加权、不按速度调整。五组各0—6，合计为30题中的正确数。例如4、3、5、2、4合计18 / 30，不是百分位或常模化推理分数。"
      },
      {
        "en": "The edition has no established reliability, validity, representative norms or cross-language calibration. A six-item topic count cannot certify a strength or weakness, and equal topic counts do not establish equal underlying abilities. Inspect the actual questions, explanations and assistance used rather than assigning a level, hiring verdict or learning potential.",
        "zh": "本版尚未建立信度、效度、代表性常模或跨语言校准。六题专题正确数不能认证强项或弱项，相同正确数也不证明潜在能力相同。应核对具体题目、解析和使用的辅助方式，不据此指定等级、招聘结论或学习潜力。"
      }
    ]
  },
  {
    "id": "review",
    "title": {
      "en": "Review an error, then try an independently constructed row",
      "zh": "复盘具体错因，再尝试自行构造数列"
    },
    "paragraphs": [
      {
        "en": "For one missed item, identify whether the error involved the rule family, signs, the target position, a gap rather than a term, the branch, the recurrence window or arithmetic. Write the proposed operation and check every relevant transition. A fresh example with different starting values can help you inspect the method without relying on a remembered answer letter; no improvement in another assessment is promised.",
        "zh": "选一道错题，分清是规则族、正负号、目标位置、差值与原项、归支、递推窗口还是算术出了问题。写出候选操作并核所有相关转移。换初值构造新例可以帮助检查方法，避免只记答案字母，但不承诺提高另一项测评成绩。"
      },
      {
        "en": "Start opens question one directly. Answers and counts are calculated in the browser, without putting them in URLs or usage-event payloads. Draft saving after starting is optional and lasts up to 24 hours in this tab; completion, retake or exit-and-clear removes it. Sharing copies the public title and link, not answers, counts, keys or draft data.",
        "zh": "点击开始直接进入第一题。答案和正确数在浏览器计算，不进入网址或使用事件载荷。开始后可自愿保存本标签页最长24小时草稿，完成、重做或退出清除时删除；分享只复制公开标题与链接，不包含答案、正确数、答案键或草稿。"
      }
    ]
  }
];
export const numberSeriesFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Is this the same as a numerical reasoning test?",
      "zh": "这与数值推理测试是同一范围吗？"
    },
    "answer": {
      "en": "This edition focuses on missing terms in sequences under stated rule families. Broader numerical reasoning can include arithmetic, percentages, ratios, tables and rates. A shared name does not establish equivalent questions, scoring or norms.",
      "zh": "本版专注给定规则族下的数列缺项，范围更广的数值推理还可包含算术、百分比、比例、表格与速率。名称相近不代表题目、计分或常模等价。"
    }
  },
  {
    "question": {
      "en": "Why is the rule family stated instead of completely hidden?",
      "zh": "为什么明示规则族，而不完全隐藏规律？"
    },
    "answer": {
      "en": "It makes correctness conditional on a stated mathematical model. A short prefix can fit different formulas with different continuations. The task is to test the offered values against the given family.",
      "zh": "这是为了让正确性建立在明示数学模型上。短前缀可以符合多种公式并产生不同续项，本题任务是按给定规则族检验选项。"
    }
  },
  {
    "question": {
      "en": "Is the next gap the next term?",
      "zh": "下一差值就是下一原项吗？"
    },
    "answer": {
      "en": "No. After finding the next gap, add it to the last original term. Keep separate rows for terms and gaps, and verify which quantity the question asks for.",
      "zh": "不是。得到下一差后，还要加回最后一个原项。原项与差值分行记录，并确认题目要求哪一个量。"
    }
  },
  {
    "question": {
      "en": "Does an interleaved branch use odd-valued numbers?",
      "zh": "交错数列按数值奇偶分支吗？"
    },
    "answer": {
      "en": "No. Use odd and even positions, not whether the values are odd or even. A branch can contain positive, negative, odd, even or repeated values.",
      "zh": "不是。按奇数位和偶数位拆分，不看数值奇偶；一支里可以有正数、负数、奇数、偶数或重复值。"
    }
  },
  {
    "question": {
      "en": "Does a recurrence always identify one coefficient triple?",
      "zh": "递推必然只对应一组系数吗？"
    },
    "answer": {
      "en": "No. Equivalent triples may agree on the displayed row. This bank checks that only one offered missing value fits at least one valid triple under the stated bounds.",
      "zh": "不一定。等价系数可能在显示数列上全部吻合，本题核对的是只有一个提供值符合给定范围内至少一组合法系数。"
    }
  },
  {
    "question": {
      "en": "Is 18 / 30 a percentile or hiring score?",
      "zh": "18 / 30是百分位或招聘分数吗？"
    },
    "answer": {
      "en": "It is eighteen correct selections in this bank. There are no reference-group norms, recruitment thresholds or standard-score conversions, and it does not predict another test.",
      "zh": "它表示本题本选对18题，没有参照人群常模、招聘阈值或标准分换算，也不预测另一项考试。"
    }
  },
  {
    "question": {
      "en": "Will retaking generate new questions?",
      "zh": "重做会生成新题吗？"
    },
    "answer": {
      "en": "No. This is a fixed thirty-item edition. A higher later count may reflect remembered keys. Explain the rule independently and use fresh self-constructed examples when reviewing.",
      "zh": "不会。本版固定30题，后来正确数提高可能包含记住答案。复习时应独立解释规则，并尝试自行构造的新例。"
    }
  },
  {
    "question": {
      "en": "Must I agree to saving before starting?",
      "zh": "开始前必须先同意保存吗？"
    },
    "answer": {
      "en": "No. Start test opens the first question directly. Saving is optional afterwards; blocked storage does not prevent completion or access to all explanations.",
      "zh": "不需要。开始测试直接打开第一题，之后可自愿保存；存储被禁用也不妨碍完成或阅读全部解析。"
    }
  }
];
export const numberSeriesSummaries: Record<string, Text> = {
  "difference": {
    "en": "Fixed differences: check signs, two sides of an interior blank and the number of transitions.",
    "zh": "固定差值：核对符号、中间缺项两侧与转移次数。"
  },
  "ratio": {
    "en": "Fixed ratios: keep signs and exact fractions while testing the same multiplier throughout.",
    "zh": "固定比值：保留符号与精确分数，逐次核同一乘数。"
  },
  "gaps": {
    "en": "Changing gaps: identify the gap rule, then return to the original terms.",
    "zh": "变化差值：先辨认差值行规则，再回到原项。"
  },
  "interleave": {
    "en": "Interleaved branches: split by position and merge back into the correct slots.",
    "zh": "交错数列：按位置拆支，并按原位置合并。"
  },
  "recurrence": {
    "en": "Bounded recurrences: move the two-term window and check every allowed transition.",
    "zh": "有界递推：前移两项窗口，核对每次合法转移。"
  }
};
