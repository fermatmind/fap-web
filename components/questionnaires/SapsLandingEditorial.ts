import type { Questionnaire } from "@/lib/questionnaires/types";

export const sapsLandingSections: Questionnaire["guide"] = [
  {
    "id": "saps-context-identity",
    "title": {
      "en": "SAPS: two dimensions of perfectionism, not a single type",
      "zh": "SAPS：完美主义的两个维度，不合成为单一类型"
    },
    "paragraphs": [
      {
        "en": "The Short Almost Perfect Scale is an eight-item self-report measure developed by Rice, Richardson and Tueller. Standards concerns high personal performance expectations; Discrepancy concerns self-critical evaluations of performance relative to those expectations. Four statements contribute to each. Neither dimension directly observes a task, measures its quality or establishes what another person expects of you. [2] [3]",
        "zh": "简版近乎完美量表由Rice、Richardson与Tueller开发，是八题自报工具。标准关注较高的个人表现期待，差距关注相对于这些期待的自我批判性表现评价；每维各四条陈述。两者都不直接观察任务、不测量实际质量，也不确定他人对你的要求。[2] [3]"
      },
      {
        "en": "The SAPS is a short form derived from the Revised Almost Perfect Scale. It is not interchangeable with a longer APS-R or another multidimensional perfectionism questionnaire. A shared topic or abbreviation does not make item wording, dimensions, response scales or classification rules equivalent. Here the two original summaries remain separate, without an overall percentage or automatic healthy/unhealthy label. [2] [3]",
        "zh": "SAPS是从修订版近乎完美量表提炼的简版，不与较长APS-R或其他多维完美主义问卷互换。主题或缩写相似，不表示题文、维度、回答尺度或分类规则等价。本页保留两个独立汇总，不生成总体百分比，也不自动贴健康或不健康标签。[2] [3]"
      }
    ]
  },
  {
    "id": "saps-context-standards",
    "title": {
      "en": "Separate personal expectations from a task’s actual requirements",
      "zh": "区分个人期待与任务的实际要求"
    },
    "paragraphs": [
      {
        "en": "A demanding expectation can accompany enjoyment, flexibility or considerable pressure. The Standards responses alone do not tell which applies. For a particular task, distinguish required accuracy, a chosen improvement and an optional refinement. An important correction can remain necessary even when another decorative revision adds little value. The score cannot set that priority for you.",
        "zh": "较高期待可以伴随乐趣、灵活选择，也可以伴随相当压力；仅靠标准维回答，无法确定哪种情形。对具体任务，可以区分必要准确性、自选改进与可选修饰。某项重要纠错仍可能必要，另一次装饰修改却未必增加多少价值；分数不能替你确定优先次序。"
      },
      {
        "en": "Imagine a fictional community timetable. Correct dates and accessible text may be required, while a different illustration is optional. Ask who needs the document, when it is due and what counts as an acceptable version. Clarifying those conditions does not mean abandoning excellence. It creates a concrete decision against which you can examine your expectations rather than adopt an identity from a number.",
        "zh": "例如虚构社区时间表，日期正确、文字便于阅读可能是必要条件，换一张插图则可选。可以问谁需要这份文件、何时交付、什么版本算符合要求。澄清条件不等于放弃卓越，而是为审视期待提供具体决定，不由数字认领身份。"
      }
    ]
  },
  {
    "id": "saps-context-discrepancy",
    "title": {
      "en": "Discrepancy is an evaluation, not a subtraction of the two scores",
      "zh": "差距是评价主题，不是两个分数相减"
    },
    "paragraphs": [
      {
        "en": "Discrepancy records endorsement of statements about feeling that effort or performance falls short. It is not the arithmetic difference between Standards and an objectively measured outcome; neither is it Standards minus Discrepancy. The two means answer different questions. Subtracting them would create a new index that this page does not validate or interpret.",
        "zh": "差距记录对努力或表现似乎不够等陈述的认可，不是标准与客观实测结果的算术差，也不是标准均分减去差距均分。两个均分回答不同问题；相减会产生本页没有验证或解释的新指标。"
      },
      {
        "en": "For a fictional draft, one missing source can be described and corrected. “The reference list needs this entry” is narrower than “everything I do is inadequate.” Conversely, being satisfied does not prove the draft has no errors. Check the actual requirement, available feedback and the consequence of the omission. The questionnaire does not decide whose judgement is correct or why dissatisfaction occurred.",
        "zh": "例如虚构初稿漏掉一条来源，可以具体描述并补正；“参考文献需补这一项”比“我做什么都不够好”范围更窄。另一方面，自己满意也不证明初稿没有错误。应核对实际要求、可用反馈与遗漏后果；问卷不裁定谁的判断正确，也不确定不满为何发生。"
      }
    ]
  },
  {
    "id": "saps-context-answering",
    "title": {
      "en": "Seven agreement choices, with no added recall period",
      "zh": "七级同意程度，不额外添加回顾期"
    },
    "paragraphs": [
      {
        "en": "Answer the statements as written, about yourself, using the source’s seven agreement choices. Four is the neutral response, not an average person, a low-frequency answer or “not applicable.” The source instructions do not impose a past-week or past-month window, so this adaptation adds neither. A task example in a guide illustrates a reading rather than changing what an item asks. [2]",
        "zh": "按陈述原义为自己作答，使用源工具的七级同意选择。4是中立回答，不代表平均水平的人、低频率或不适用。源说明不限定过去一周或一月，本次适配也不增加。指南中的任务例子用于说明读法，不改变题目所问内容。[2]"
      },
      {
        "en": "All eight valid responses are required before either numerical summary is produced. An unanswered statement remains incomplete; it is not replaced with zero, four or a shorter denominator. The source sheet recommends distributing the eight items among other similarly scaled research items. This standalone presentation differs from that recommendation and should not be described as identical administration. [2]",
        "zh": "八题均有有效回答，才生成两个数字汇总。未答陈述保留未完成状态，不以0、4或较短分母替代。源页建议将八题分布于其他相似回答尺度的研究题之间；独立网页呈现与该建议不同，不能说施测条件完全相同。[2]"
      }
    ]
  },
  {
    "id": "saps-context-calculation",
    "title": {
      "en": "Calculate two four-item sums and exact means",
      "zh": "两组四题总和与精确均值怎样计算？"
    },
    "paragraphs": [
      {
        "en": "Standards uses source items 1, 3, 5 and 7; Discrepancy uses 2, 4, 6 and 8. No item is reversed. In a fresh example, Standards choices 1, 6, 3, 7 sum to 17, giving 4.25; Discrepancy choices 7, 2, 5, 1 sum to 15, giving 3.75. Each sum ranges from 4 to 28 and each mean from 1 to 7. The page displays means to two decimal places after calculation. [2]",
        "zh": "标准使用源题1、3、5、7，差距使用2、4、6、8，无反向题。新的算例中，标准选择1、6、3、7合计17，均值4.25；差距选择7、2、5、1合计15，均值3.75。各维总和4—28、均值1—7；本页先计算，再显示两位小数。[2]"
      },
      {
        "en": "An identical sum can come from different item responses, so review the actual statements as well as the average. Two decimal places reflect an arithmetic display, not that the interpretation has that degree of precision. No reference population, percentile, meaningful-change threshold or diagnostic cutoff follows from the endpoints of the response scale.",
        "zh": "相同总和可以来自不同回答，应同时回看具体陈述与均值。两位小数属于算术显示，不表示解释有同等精细程度；仅凭回答尺度端点，无法得到参照人群、百分位、有意义变化阈值或诊断界值。"
      }
    ]
  },
  {
    "id": "saps-context-original-evidence",
    "title": {
      "en": "What the original SAPS research supports",
      "zh": "SAPS原始研究支持什么？"
    },
    "paragraphs": [
      {
        "en": "Rice and colleagues’ published abstract reports initial structural work in 749 participants and cross-validation in a separate sample of 335. It describes evidence concerning the two dimensions and their relations with other measures. It also reports a three-class statistical model. These are findings about specified research samples, not a licence to classify every web visitor using a midpoint rule. [3]",
        "zh": "Rice等人的已发表摘要报告，在749名参与者中开展初始结构研究，并在另一335人样本交叉验证，讨论两个维度及其与其他测量关系的证据，也报告三类别统计模型。这是特定研究样本的结果，不表示可以用回答中点规则为每位网页访客分类。[3]"
      },
      {
        "en": "A source instrument’s research history and this website’s adaptation are distinct. The publication does not itself validate this Chinese wording, the standalone administration, every possible use or an individual outcome prediction. This entry preserves the two dimensions, original English items and attribution while making those differences visible. [1] [2] [3]",
        "zh": "源工具研究历史与本站适配属于不同事实。论文不直接验证本中文表述、独立呈现、每种用途或个人结果预测。本页保留两个维度、英文原题与署名，同时明确这些差别。[1] [2] [3]"
      }
    ]
  },
  {
    "id": "saps-context-language-evidence",
    "title": {
      "en": "Why language equivalence needs evidence of its own",
      "zh": "为什么语言等价需要独立证据？"
    },
    "paragraphs": [
      {
        "en": "A Brazilian SAPS study used translation, back-translation and a comprehension pilot before evaluating 421 participants. The authors reported support for the two-factor structure and partial invariance when comparing their Brazilian data with US data. They also noted a convenience sample and limits to generalisation. The evidence concerns those versions and samples, not this Chinese working translation. [4]",
        "zh": "一项巴西SAPS研究先进行翻译、回译与理解试测，再评价421名参与者。作者报告两因子结构支持，并在巴西与美国数据比较中得到部分不变性，也说明便利样本及推广限制。证据涉及那些版本和样本，不涉及本中文工作译文。[4]"
      },
      {
        "en": "A common numerical range is not proof that a statement carries the same meaning across languages or that raw means can be compared without qualification. Chinese here is reviewed working wording without established local norms or cross-language calibration. When reflecting again, note which version you used and what circumstances you considered rather than treating a language switch as a measured change in perfectionism.",
        "zh": "相同数字范围，不证明陈述在不同语言含义一致，也不证明原始均值可以无条件比较。本页中文是经复核的工作表述，没有已建立的本地常模或跨语言校准。再次回顾时，可以记录版本与所考虑情境，不把换语言后的差异当成完美主义的实测变化。"
      }
    ]
  },
  {
    "id": "saps-context-follow-up",
    "title": {
      "en": "Use a concrete task review without chasing a preferred score",
      "zh": "回顾具体任务，而非追求想要的分数"
    },
    "paragraphs": [
      {
        "en": "For one low-stakes task, distinguish what was required, what you chose to aim for and what happened. Name one feature that worked and one correction with a realistic stopping point. Leave parts that do not fit aside. This optional record supplies context that eight agreement responses cannot capture; it is not a tested treatment or a promise to lower either dimension.",
        "zh": "针对一项低风险任务，可以区分必要要求、自选目标与实际发生什么，指出一处有效之处和一项有现实停止条件的修正。不适合的部分可以放下。这份可选记录补充八个同意回答无法涵盖的情境，不是已验证治疗，也不保证降低某个维度。"
      },
      {
        "en": "A later mean may change through experiences, interpretation or recall. Repetition alone does not isolate a cause, and a stable mean does not prove a fixed identity. If persistent difficulties concern you, describe their duration and effect on daily life when seeking appropriate support. Both complete public guides remain free to read without revealing personal answers or requiring a further test.",
        "zh": "之后均值可能随经历、理解或回忆改变；重复作答不单独确定原因，均值稳定也不证明固定身份。若持续困难令你担忧，寻求适当支持时可以描述持续时间及对日常生活的影响。两份完整公开指南均免费，不透露个人回答，也不要求再做其他测试。"
      }
    ]
  }
];

export const sapsLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is SAPS the same as a longer APS-R or Frost questionnaire?",
      "zh": "SAPS与较长APS-R或Frost问卷一样吗？"
    },
    "answer": {
      "en": "No. They differ in items, dimensions and scoring. This page uses the eight-item SAPS with separate Standards and Discrepancy summaries.",
      "zh": "不同，题目、维度与计分有别；本页使用八题SAPS，分别汇总标准与差距。"
    }
  },
  {
    "question": {
      "en": "Does Discrepancy equal Standards minus performance?",
      "zh": "差距等于标准减去表现吗？"
    },
    "answer": {
      "en": "No. Discrepancy is a separate set of four self-evaluative statements. No objective performance score or subtraction index is calculated.",
      "zh": "不是。差距来自另一组四条自我评价陈述，不计算客观表现分或相减指标。"
    }
  },
  {
    "question": {
      "en": "Does a high Standards response prove achievement?",
      "zh": "标准回答高就证明成就高吗？"
    },
    "answer": {
      "en": "No. It concerns personal expectations. Actual work quality, efficiency and distress require their own evidence and context.",
      "zh": "不能，它关注个人期待；实际质量、效率与困扰都需要各自证据与情境。"
    }
  },
  {
    "question": {
      "en": "Does the neutral response describe the average person?",
      "zh": "中立回答代表平均水平的人吗？"
    },
    "answer": {
      "en": "No. Four means neutral agreement on the seven-point response scale. It is not a norm, percentile or substitute for a missing answer.",
      "zh": "不代表。4是七级尺度的中立同意程度，不是常模、百分位或缺答替代值。"
    }
  },
  {
    "question": {
      "en": "Are any items reversed or left out of the denominator?",
      "zh": "有反向题或会从分母删除的题吗？"
    },
    "answer": {
      "en": "No reversed items. Each dimension uses all four source responses; all eight valid choices are required before the two summaries are produced.",
      "zh": "无反向题，每维使用全部四个源回答；八题均有效才生成两个汇总。"
    }
  },
  {
    "question": {
      "en": "Why are the means shown to two decimal places?",
      "zh": "为什么均值显示两位小数？"
    },
    "answer": {
      "en": "Four integer responses can produce quarter-point means, such as 17 ÷ 4 = 4.25. The arithmetic display does not establish clinical precision or a meaningful-change cutoff.",
      "zh": "四个整数回答可得到四分之一单位均值，例如17÷4＝4.25；算术显示不确立临床精度或有意义变化界值。"
    }
  },
  {
    "question": {
      "en": "Can I use the two means for hiring or academic decisions?",
      "zh": "能用两个均值作招聘或学业决定吗？"
    },
    "answer": {
      "en": "This public self-report does not establish competence or suitability. Read the two themes with actual circumstances rather than use them as a selection rule.",
      "zh": "这份公开自报不能确定胜任或适合程度；应结合实际处境理解两个主题，不将其设为筛选规则。"
    }
  },
  {
    "question": {
      "en": "Does Start require another agreement or purchase?",
      "zh": "开始后要再次同意或购买吗？"
    },
    "answer": {
      "en": "No. Start opens question one directly. Eight items and both full guides are free without signup; temporary progress saving remains optional.",
      "zh": "不需要，直接进入第一题；八题与两份完整指南免费，无需注册，临时保存仍为自愿。"
    }
  }
];

export const sapsLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Coelho et al. (2021): SAPS psychometric evidence in Brazil, accepted manuscript",
      "zh": "Coelho等（2021）：SAPS巴西心理测量研究，接受稿"
    },
    "url": "https://purehost.bath.ac.uk/ws/portalfiles/portal/200798988/Accepted_Version_SAPS_in_Brazil_TCP.pdf"
  }
];
