import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Entry context; the published item bank and source-bound readings remain unchanged. */
export const locusLandingSections: QuestionnaireSection[] = [
  {
    "id": "locus-edition-identity",
    "title": {
      "zh": "控制点量表有哪些版本？先认清本页的20题整体键",
      "en": "Which locus of control scale is this? Identifying the twenty-item Total key"
    },
    "paragraphs": [
      {
        "zh": "“控制点测试”是构念名称，并不代表所有网站都使用同一问卷。Rotter I-E采用29题强迫选择格式；本页则使用IPIP公开的Locus of Control: Total二十条、五点符合度回应。题目、回应格式及分数方向不同，不能按分数大小直接比较，也不能把本总分换算成Rotter原量表。[1][7]",
        "en": "Locus of control names a construct, not a single questionnaire used by every website. Rotter I-E has twenty-nine forced-choice items; this page uses the twenty-item IPIP Locus of Control: Total key with five accuracy ratings. Items, response formats and score direction differ. Totals are not directly comparable or convertible into the original Rotter score.[1][7]"
      },
      {
        "zh": "IPIP另列内部控制、有权势他人、机遇三个各十条的键，以及五条理性控制点键。二十条整体键是单独列出的计分对象，不是本次分别施测三组后再相减。本页只有一个整体结果与一份九节全文；没有生成三个分量表，不能从一个总分反推出哪一侧面“最高”。[1][2]",
        "en": "IPIP separately lists ten-item Internality, Powerful Others and Chance keys and a five-item Rational key. The twenty-item Total key is separately specified; this attempt does not administer those three banks and subtract their scores. It provides one overall result and one nine-section reading, without three subscale scores or a highest facet inferred from the total.[1][2]"
      }
    ]
  },
  {
    "id": "locus-sum-example",
    "title": {
      "zh": "怎样算出20—100总分？反向计分与41分算例",
      "en": "How is the 20–100 raw total calculated? Reversals and a worked score of forty-one"
    },
    "paragraphs": [
      {
        "zh": "本站交错呈现十道正向与十道反向题。奇数题保留1—5评分，偶数题2、4、6、8、10、12、14、16、18、20按6减原评分翻转。例如第1题选2记2，第2题选4记6−4＝2。二十个计分值直接相加，范围20—100，较高指向本键较内部控制相关的自述。[1][4]",
        "en": "Ten direct and ten reverse-keyed items alternate here. Odd items retain ratings one through five; even items 2, 4, 6, 8, 10, 12, 14, 16, 18 and 20 use six minus the raw rating. Item one rated two contributes two; item two rated four contributes6−4=2. Add the twenty keyed values for a total of20–100, with higher values oriented toward internal-control-related self-description in this key.[1][4]"
      },
      {
        "zh": "把第1题选3，其余奇数题选2、所有偶数题选4，计分后得到一个3和十九个2，总分3＋19×2＝41；描述性均分直接用41÷20＝2.05，不把一位小数2.1乘20倒推为42。两位小数是展示方式，不意味着能精确区分两个人，也不是41%掌控、能力或成功率。",
        "en": "Rate item one three, the other odd items two and all even items four. The keyed values are one three and nineteen twos, giving3+19×2=41. The descriptive mean is41÷20=2.05; reconstructing it from a rounded2.1 would incorrectly give42. Two decimal places are a display convention, not precise discrimination between people or forty-one-percent control, ability or success."
      }
    ]
  },
  {
    "id": "locus-missing-midpoint",
    "title": {
      "zh": "缺一条、全中立与60分：为什么要看回答模式",
      "en": "One missing rating, neutral responses and sixty: why response patterns matter"
    },
    "paragraphs": [
      {
        "zh": "20题都需要选择一种回应，但非数值回应并不进入个人分数。若十九条有效定向评分均为4，另有一条资料不足，虽有76的部分和，页面仍不生成个人总分或均分，不按76÷19补出结果。这个完整度规则用于避免以不完整题组冒充完整总分，不是对缺答原因的判断；全文仍可阅读。",
        "en": "Each item needs a response selection, but non-numeric responses do not enter a personal score. If nineteen valid keyed ratings are four and one is insufficient, the partial sum is seventy-six; no personal total or mean is displayed, and76÷19 is not used to fill in a result. This completeness rule avoids presenting an incomplete bank as a full total. It does not judge the reason for missingness, and the complete reading remains available."
      },
      {
        "zh": "全部选择中立（3）、全部选择非常符合（5）或全部选择非常不符合（1），总分均为60。后两者经十道反向题处理，分别成为十个5加十个1，顺序不同但和相同。因此60不是人口平均、最佳平衡或50%内部型；同分不能替代逐条阅读，也不能单凭这种模式认定作答不诚实。",
        "en": "Neutral ratings of three throughout, Very accurate ratings of five throughout and Very inaccurate ratings of one throughout all total sixty. Reversal turns the latter patterns into ten fives and ten ones in different positions. Sixty is therefore neither a population average, an ideal balance nor fifty-percent internal type. Equal totals cannot replace item-level interpretation or establish dishonest responding from that pattern alone."
      }
    ]
  },
  {
    "id": "locus-evidence-context",
    "title": {
      "zh": "原研究、中文试译与常模：各自支持什么结论",
      "en": "Original evidence, trial translation and norms: what each supports"
    },
    "paragraphs": [
      {
        "zh": "IPIP单构念表将二十条整体键与原研究量表并列，列出原ESCS样本中的一致性与相关证据。这些统计值的对象是特定样本、题本与施测方式；它们不是“本站准确率”，不能自动验证中文译文、网页呈现、资料不足选项或某位访客的个人解释。本页保留这些差异，不借原量表名声代替本版研究。[2]",
        "en": "The IPIP single-construct table places the twenty-item Total representation beside the original measure and reports consistency and correlation evidence from the ESCS. Those statistics concern particular participants, instruments and administrations. They are not this website’s accuracy rate or automatic validation of the Chinese translation, web presentation, insufficient-information option or an individual interpretation. The original scale’s reputation does not replace research on this edition.[2]"
      },
      {
        "zh": "IPIP个人分数说明建议结合适当样本的分布解释，并提醒不要把连续维度硬分成人格类别。本站未建立本地常模、百分位、理想范围或中英文测量等价性，因此呈现原始总分与连续解释。IPIP的公有领域许可允许材料使用；许可解决使用权限，不能单独证明测量质量。[3][5]",
        "en": "IPIP’s interpretation guidance discusses appropriate sample distributions and cautions against turning continua into personality categories. Local norms, percentiles, ideal ranges and English–Chinese measurement equivalence are not established here, so the page presents a raw total and continuous reading. IPIP public-domain permission allows use of the materials; permission resolves usage rights rather than proving measurement quality.[3][5]"
      }
    ]
  },
  {
    "id": "locus-context-counterexamples",
    "title": {
      "zh": "控制信念、真实影响与责任：日常情境的区别",
      "en": "Control beliefs, actual influence and responsibility: everyday distinctions"
    },
    "paragraphs": [
      {
        "zh": "共同准备活动时，你可以核对清单、发出提醒或提出备用方案，但天气、场地规则和其他人的决定仍需另行了解。认为这些因素重要，不等于你不会行动；相信自己能推动安排，也不证明每个结果都由自己造成。控制相关自述、实际可选动作和最终责任属于不同问题，不能由一个总分合并回答。",
        "en": "When preparing a shared event, you might check a list, send a reminder or propose a backup. Weather, venue rules and others’ decisions still require separate attention. Recognizing those factors does not imply inaction; believing you can advance arrangements does not establish responsibility for every outcome. Self-description, available actions and ultimate responsibility are separate questions that one total cannot answer."
      },
      {
        "zh": "本题本也包含自在、成功预期、解决问题和自我评价方面的句子，并非每条都只问“原因在谁”。相关用语的评分方向依公开键保留，不能把“我做得到”的自述视为客观能力测验，也不能从低总分诊断无助、抑郁或低自尊。某个回应可能反映特定处境，具体原因需要更多信息。",
        "en": "This bank also contains statements about comfort, expected success, solutions and self-evaluation; not every item narrowly asks where a cause lies. Their directions follow the published key. A self-description of capability is not a performance test, and a lower total diagnoses neither helplessness, depression nor low self-esteem. A response may reflect particular circumstances whose explanation needs further information."
      }
    ]
  },
  {
    "id": "locus-practical-review",
    "title": {
      "zh": "怎样使用结果？从一个普通场景回看行动与条件",
      "en": "How can I use the result? Reviewing actions and conditions in one ordinary situation"
    },
    "paragraphs": [
      {
        "zh": "如果愿意，选一个低风险的近期安排，例如与同伴协商一次分工。分开列出：自己可以尝试的动作、需要向他人核对的信息，以及眼下无法决定的条件。对一项行动说明预期，再记录实际发生什么，也留下一次不符合预期的例子。这是可选回顾，不要求你改变总分、承担更多任务或把同伴归入某种类型。",
        "en": "If useful, choose a recent low-stakes arrangement, such as agreeing how to divide a task. Separately note an action you could try, information to check with someone and conditions you cannot presently decide. State an expectation for one action, observe what happens and retain an instance that does not fit. This optional review requires neither a score change, extra responsibilities nor a personality label for a colleague."
      },
      {
        "zh": "重测时先核对同一版本、语言、实际回答和参照情境。总分增加一分不等于获得更多权力、变得更负责或改善健康；本页没有可靠改变阈值。与乐观、成长信念或自我效能话题相邻，也不能换算其他测评；工作、医疗、法律及关系决定需要对应信息，而非依本总分决定。",
        "en": "On a retake, check the edition, language, particular responses and reference circumstances. A one-point rise does not establish more power, greater responsibility or better health; no reliable-change threshold is supplied. Related topics such as optimism, growth beliefs or self-efficacy have no score conversion here. Work, healthcare, legal and relationship decisions require relevant information beyond this total."
      }
    ]
  }
];

export const locusLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "原始总分41为什么显示均分2.05？",
      "en": "Why does a raw total of forty-one show a mean of2.05?"
    },
    "answer": {
      "zh": "总分直接来自二十个定向计分值，均分用41÷20＝2.05。不能先舍入成2.1，再乘20倒推总分；小数位不是心理测量精度承诺。",
      "en": "The total comes from twenty keyed values;41÷20=2.05. Do not round to2.1 and multiply by twenty to reconstruct it. Decimal places promise no psychometric precision."
    }
  },
  {
    "question": {
      "zh": "十九条有效均为4，另一条不适用，能显示4.00吗？",
      "en": "Can nineteen keyed fours and one NA produce a displayed mean of4.00?"
    },
    "answer": {
      "zh": "不能。本页要求二十条全部有效才显示个人总分与均分，不用部分和76除19估算完整结果。缺答保留资料不足，全文仍可读。",
      "en": "No. Twenty valid ratings are required for a personal total and mean;76÷19 is not used to estimate a complete result. Missingness remains explicit, with the full guide still readable."
    }
  },
  {
    "question": {
      "zh": "全部选非常符合或非常不符合，为何都是60？",
      "en": "Why do all Very accurate and all Very inaccurate responses both total sixty?"
    },
    "answer": {
      "zh": "各有十道反向题，都会变成十个5加十个1。它们与全部选3虽然同分，具体模式不同，60不认证理想平衡或人群平均。",
      "en": "Ten reverse-keyed items produce ten fives and ten ones in either case. These patterns and all threes share a total, but differ item by item. Sixty certifies neither an ideal balance nor a population average."
    }
  },
  {
    "question": {
      "zh": "是否能分出内部、有权势他人和机遇三项？",
      "en": "Does this produce Internality, Powerful Others and Chance scores?"
    },
    "answer": {
      "zh": "本次只有IPIP二十条整体键。官网另列三份十条键；本页未独立施测，不能从一个总分反推三项，也不借想象的分量表相减造出结果。[1][2]",
      "en": "This attempt uses only the twenty-item Total key. IPIP separately lists three ten-item keys; they were not independently administered. One total cannot recover their scores or justify subtraction of imagined subscales.[1][2]"
    }
  },
  {
    "question": {
      "zh": "把条件归于外部因素，就一定不主动吗？",
      "en": "Does recognizing outside influences necessarily mean lack of initiative?"
    },
    "answer": {
      "zh": "不能这样推断。可以一边主动沟通，一边承认天气、规则或他人的决定。实际行动与影响条件应分别核对，总分不替个人判责任。",
      "en": "No. You can communicate proactively while recognizing weather, rules and others’ decisions. Check actions and conditions separately; a total does not assign responsibility."
    }
  },
  {
    "question": {
      "zh": "IPIP的研究信度是本站准确率吗？",
      "en": "Is IPIP research reliability this website’s accuracy rate?"
    },
    "answer": {
      "zh": "不是。原样本统计不能自动验证本页中文、施测方式、NA规则或个人解释。本地常模与跨语言等价尚未建立，许可也不等于验证。[2][3][5]",
      "en": "No. Original-sample statistics do not automatically validate this Chinese translation, administration, NA convention or individual interpretation. Local norms and language equivalence are not established; permission is not validation.[2][3][5]"
    }
  },
  {
    "question": {
      "zh": "能把总分换算为乐观、自尊或成长型思维吗？",
      "en": "Can the total be converted into optimism, self-esteem or growth mindset?"
    },
    "answer": {
      "zh": "不能。即使有公开条目交叠，各自题本和构念仍不同；本页不独立给出这些分数，也不由控制相关自述诊断心理状态。",
      "en": "No. Overlapping public items do not make constructs and banks identical. Those scores are not independently produced here, and control-related self-description does not diagnose a psychological state."
    }
  },
  {
    "question": {
      "zh": "开始是否要再次同意，或提交私密经历？",
      "en": "Must I agree again or submit private experiences before starting?"
    },
    "answer": {
      "zh": "不用。点击开始直接进入20题，无需额外同意、账号或邮箱，也不填写私密经历。可逐题选非数值回应，全文仍免费；临时保存需主动选择。",
      "en": "No. Start opens twenty items directly without another agreement, account or email, and no private story is entered. Non-numeric responses remain available with the full guide free; temporary saving is opt-in."
    }
  }
];
