import type { Questionnaire } from "@/lib/questionnaires/types";

export const verbalReasoningLandingSections: Questionnaire["guide"] = [
  {
    "id": "verbal-scope",
    "title": {
      "zh": "言语推理练什么？从词义到必然结论",
      "en": "What does verbal reasoning practise? From meanings to necessary conclusions"
    },
    "paragraphs": [
      {
        "zh": "本页把四类任务分别呈现，而不把所有语言活动归为同一种能力。词义题检查特定语境的解释；类比题检查关系及方向；阅读题检查概括、指代、建议与证据范围；演绎题在明确前提下检查必然结论。它们都依赖读懂题意，但作答错误可能来自不同环节，复盘时应回到具体那一步。",
        "en": "This page separates four task groups instead of treating all language activity as one ability. Context items concern a particular meaning; analogies concern relations and direction; reading concerns summaries, reference, proposals and evidential scope; deduction concerns necessity under explicit premises. Understanding instructions matters throughout, but an error may arise at a different step in each group. Review that step in the actual item."
      },
      {
        "zh": "有些商业言语推理采用短文配“真、假、无法判断”，有些还包含不同语言任务。本版是固定24题四选一，不是某家招聘题库、限时模拟考或官方考试换算。这里的“测试”指一次有答案的练习；对语言理解的兴趣可以从此开始，但本题组不能单独概括读写、口语、知识储备或现实工作表现。",
        "en": "Some commercial verbal tests pair passages with true, false and cannot-say judgments; other formats include different language tasks. This is a fixed twenty-four-item four-choice practice bank rather than a recruitment provider’s bank, timed mock exam or official-score conversion. Test here means an exercise with answer keys. It offers a starting point for language practice without encompassing literacy, speech, knowledge or real work performance."
      }
    ]
  },
  {
    "id": "verbal-word-conditions",
    "title": {
      "zh": "语境词义：临时、足够与明确，各限定了什么？",
      "en": "Words in context: what do temporary, sufficient and explicit constrain?"
    },
    "paragraphs": [
      {
        "zh": "词义需要和对象、时间、需要量一起理解。设一条新通知说“雨棚座位暂定开放六席，待检查后确认”，暂定表示当前采用、可以复核，不保证一定改动；“六席足够容纳已登记六人”只针对这六人的需要，不保证后来每个来访者都有座位。英语provisional与sufficient的选定义项支持这类区分。[4][5]",
        "en": "Read meanings with the object, time and stated need. Suppose a fresh notice provisionally opens six sheltered seats pending inspection: provisional leaves review possible without guaranteeing a change. Six seats sufficient for six registered people concern that need, not a seat for every later visitor. The selected senses of provisional and sufficient support these distinctions.[4][5]"
      },
      {
        "zh": "另一条通知直接写出入口，提供的是明示信息，不自动解释其他入口为什么不用；规则要求某人参加，也不表示参加已经发生。连续应沿题面给出的序列读；矛盾须核同一对象、时刻与条件，发现不相容仍不能判定哪句正确。英中相关词典支持对应表达的选定义项，[1][2][3][6][7][8][9][10][11][12] 本页例子与选项另行原创，不复制词典例句。",
        "en": "A directly named entrance supplies an explicit instruction, without explaining why another entrance is unused. A requirement does not mean attendance has occurred. Read succession within the supplied sequence and incompatibility with object, time and conditions fixed; incompatibility alone does not identify the correct claim. Selected English and Chinese dictionary senses support these expressions.[1][2][3][6][7][8][9][10][11][12] The page’s examples and alternatives are independently authored rather than copied dictionary examples."
      }
    ]
  },
  {
    "id": "verbal-analogy-direction",
    "title": {
      "zh": "词语类比：关联不够，还要角色与方向相同",
      "en": "Verbal analogies: association needs matching roles and direction"
    },
    "paragraphs": [
      {
        "zh": "另看“镜片：眼镜”，若指定关系是部件到整体，“琴键：钢琴”可保留这个结构；“钢琴：琴键”倒转方向，“调律师：钢琴”换成从业者与对象。它们都有关联，却不是同一关系。先把词对写成完整句，再检查选项是否保留了前后两个角色，比仅寻找熟悉的词更能说明选择依据。",
        "en": "Consider lens to spectacles under a component-to-whole instruction. Key to piano preserves that structure; piano to key reverses it, while tuner to piano changes the roles to practitioner and object. All are associated without expressing the same relation. State the pair as a full sentence and check both roles in each alternative rather than selecting familiar words alone."
      },
      {
        "zh": "本版六道类比分别指定工具与动作、幼体与成体、部分与整体、制作者与作品、存放处与内容、低到高的强度顺序。材料不是制作者，设备不是作品；较轻声到较大声可以与较慢到较快比较方向，但不能据此换算分贝和速度。题干明示关系减少开放联想的歧义，不把一个人的其他合理联想判成人格或创造力问题。",
        "en": "The six analogies specify tool–action, young–adult, part–whole, maker–product, storage–contents and low-to-high intensity. Material is not a maker and equipment is not a product. Quieter-to-louder can share an ordered increase with slower-to-faster without converting sound levels into speed. Explicit relations limit open-association ambiguity rather than judging other sensible associations as personality or creativity problems."
      }
    ]
  },
  {
    "id": "verbal-reading-scope",
    "title": {
      "zh": "阅读与依据：范围、提议和未知信息要分开",
      "en": "Reading and evidence: separate scope, proposals and unknowns"
    },
    "paragraphs": [
      {
        "zh": "设另一条虚构通知说：“周三茶点活动取消，阅览桌仍开放；新日期未定。编辑建议下次增加标签。”可靠概括应同时保留取消的活动、仍可使用的桌子和未定日期；“整个空间关闭”“明天补办”“新标签已有效”都增加了原文没有给出的内容。识别一句话是建议，不等于赞成它或证明它已经实施。",
        "en": "Imagine a new notice: a Wednesday refreshment event is cancelled, reading tables remain open, a replacement date is undecided, and an editor suggests more labels next time. A supported summary preserves all three conditions. Closing the whole space, rescheduling tomorrow or proving the labels effective adds absent information. Recognising a proposal neither endorses it nor shows that it has been implemented."
      },
      {
        "zh": "限定词和分母同样属于证据。若十名自愿答者有八人选择新封面，只能直接描述这十名答者，未回答者的偏好仍未知。若两次等待平均四分钟，4与4、1与7都符合，因而均值不能保证每次都不超过四分钟。这些构造情形用于检查推论，不是额外采集的数据；“不能确定”也不等于相反结论已被证明。",
        "en": "Qualifiers and denominators belong to the evidence. Eight preferences among ten voluntary respondents directly describe those respondents; nonrespondents remain unknown. Two waits averaging four minutes could be four and four or one and seven, so the mean cannot guarantee each wait stays within four minutes. These constructed cases check an inference rather than adding observations. Undetermined does not mean that the opposite has been proved."
      }
    ]
  },
  {
    "id": "verbal-logic-cases",
    "title": {
      "zh": "演绎推理：区分必然成立、可能成立与不能确定",
      "en": "Deduction: distinguish necessary, possible and undetermined"
    },
    "paragraphs": [
      {
        "zh": "在经典命题逻辑中，前提蕴含结论要求每个满足全部前提的赋值也满足结论。[14] 用一个新例子：每张印有三角形的票都能兑换书签，某票能兑换书签；仍可能还有别种合格票，因此不能倒推出它一定有三角形。若同一规则当真且某票不能兑换，则该票不能带三角形。这是在题定规则内推理，不保证现实兑换流程绝不出错。",
        "en": "In classical propositional logic, entailment requires every valuation satisfying all premises to satisfy the conclusion.[14] For a new example, every triangle-marked ticket redeems a bookmark and a ticket redeems one. Another qualifying ticket may exist, so triangle status is not established. If the same rule holds and a ticket cannot redeem one, it cannot carry the triangle. This reasons within stipulated rules rather than guaranteeing a flawless real redemption process."
      },
      {
        "zh": "“至少一个同时有标记且为橙色”需要保留同一个对象，不能变成全部都有标记；“恰有一个亮”同时排除全灭和全亮，强于“至多一个”。顺序题要保留先于的方向和无并列条件。检验一个结论时，可尝试造前提全真、结论为假的情形；若做得到，它便不是必然结论，若反例违背前提，则反例无效。",
        "en": "At least one token both marked and orange keeps the same witness rather than making every token marked. Exactly one light excludes both none and both, unlike at most one. Preserve direction and the no-tie condition in ordering. To challenge necessity, try a case with all premises true and the conclusion false. A valid case defeats entailment; a case violating a premise is not a counterexample."
      }
    ]
  },
  {
    "id": "verbal-counts",
    "title": {
      "zh": "24题正确数怎么读？总数相同，复习重点也可不同",
      "en": "How should twenty-four-item counts be read? Equal totals can need different review"
    },
    "paragraphs": [
      {
        "zh": "本版答对记1、答错记0，每项0—6，总数0—24；全部有效作答后统一给结果。没有速度奖惩、倒扣分或加权，也不把缺答静默算错。比如四项为2、6、0、5时总数13；6、2、5、0同样是13，但前者更值得先看阅读依据，后者可先看演绎。相同总数不能替代分项和逐题证据。",
        "en": "Each matching answer counts one and an incorrect choice zero, giving four counts from zero to six and a total from zero to twenty-four after every item has a valid choice. There is no speed bonus, penalty or weighting, and omissions are not silently scored wrong. Counts of two, six, zero and five total thirteen, as do six, two, five and zero. Their reading and deduction review priorities differ; equal totals cannot replace section and item evidence."
      },
      {
        "zh": "4/6只表示这六道选定任务中四次与答案一致，不表示阅读能力达到某一比例或超过多少人。四项并非独立测量的能力等级，不能凭最高分给人分型。无论0、13还是24题答对，都开放相同24题答案解析和四份五节指南，共20节；内容权限不随成绩变化。",
        "en": "Four out of six means four answers matching the key on those six selected tasks, not a percentage of reading ability or a population rank. Sections are not independently validated ability levels, and the highest count assigns no type. Zero, thirteen and twenty-four correct all open the same twenty-four worked answers and four five-section guides, twenty sections in total. Access does not depend on the count."
      }
    ]
  },
  {
    "id": "verbal-sources-language",
    "title": {
      "zh": "答案依据、形式检查与双语比较分别证明什么？",
      "en": "What do answer sources, formal checks and bilingual wording establish?"
    },
    "paragraphs": [
      {
        "zh": "词典用于核特定义项，类比与阅读解析回到明确关系和原创文本；形式逻辑参考说明蕴含和反例的背景。[14] 对有限真值或顺序的核查，只能核已经编码的题设推论，不自动证明自然语言表达毫无歧义。出处可追溯、程序可复算和心理测量信效度是不同证据；本题本尚未建立常模、测量信效度或招聘预测效度。",
        "en": "Dictionaries check selected senses, analogy and reading explanations return to specified relations and original passages, and formal references supply entailment and counterexample background.[14] Finite checks of truth assignments or orders address encoded premises, without automatically proving unambiguous natural-language wording. Traceable sources, reproducible programs and psychometric reliability or validity are different evidence. This bank has no established norms, measurement validation or recruitment predictive validity."
      },
      {
        "zh": "英中题目围绕相关区别分别编写，某题可使用不同的词和场景，因此不是简单逐字替换或已经校准的两套平行测验。词语熟悉度、文化经验、辅助工具和阅读语言都可能改变表现。应在本版本、本语言下复盘，不能拿两种语言的正确数排优劣，也不能由24题换算IQ、CEFR、学校成绩或商业测试分数。",
        "en": "English and Chinese independently express related distinctions and may use different words or scenes. They are neither literal substitutions nor calibrated parallel forms. Word familiarity, cultural experience, assistance and reading language can affect performance. Review within this edition and language, without ranking the two counts or converting twenty-four answers into IQ, CEFR, school grades or commercial test scores."
      }
    ]
  },
  {
    "id": "verbal-review-plan",
    "title": {
      "zh": "从一道错题开始：先定位错误，再练新材料",
      "en": "Start with one error: locate the step, then use fresh material"
    },
    "paragraphs": [
      {
        "zh": "复盘时先遮住正确选项，写一句当时的理由，再对照解析：是漏了临时或全部这样的限定，把关系方向倒转，加入短文外的因果，还是把可能当成必然？随后为同一结构写一个新通知、词对或前提集，只改变一个关键条件。检查新结论是否仍成立，比反复记住选项字母更能说明自己理解了哪一步；这不承诺训练后必然提分。",
        "en": "Cover the answer, write the reason you used, then compare the explanation. Did you miss a qualifier, reverse a relation, add a cause absent from the passage or confuse possibility with necessity? Write a fresh notice, pair or premise set with one key condition changed and check its conclusion. This gives more specific evidence about understanding than memorising option letters, without guaranteeing a later score increase."
      },
      {
        "zh": "重测仍用相同24题；看过解析后的提高可能包含答案记忆，不能单凭提高推断总体言语能力改变。答案在浏览器计分，可选草稿只留本标签页，24小时后失效，完成、退出清除或重测会删除。分享仅含公开测试链接，不附答案或正确数；练习通知可全部虚构，无需上传学习记录或他人消息。",
        "en": "Retakes reuse the same twenty-four items. Improvement after explanations may include answer memory rather than changed general verbal ability. Answers are scored in the browser; optional tab drafts expire after twenty-four hours and clear on completion, exit-and-clear or retake. Sharing contains only the public test link, not answers or counts. Use invented notices without uploading study records or someone else’s messages."
      }
    ]
  }
];

export const verbalReasoningLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这和真、假、无法判断的言语测试相同吗？",
      "en": "Is this the same as a true, false and cannot-say verbal test?"
    },
    "answer": {
      "zh": "不完全相同。本版24题为四选一，四组各六题，包含词义、类比、阅读与演绎；某些题练无法确定的结论，但不复制商业题库或限时招聘流程。",
      "en": "No. This bank has twenty-four four-choice items in four six-item groups covering meanings, analogies, reading and deduction. Some practise undetermined conclusions without copying a commercial bank or timed recruitment process."
    }
  },
  {
    "question": {
      "zh": "不在文中出现的说法，为什么不能直接判错？",
      "en": "Why is an unmentioned claim not automatically false?"
    },
    "answer": {
      "zh": "未提及只说明信息不足。要判定必假，需要文字或规则排除它；若能构造结论真和假的允许情形，就是未确定。不能把个人常识补为题设。",
      "en": "An omission supplies insufficient information, not a contradiction. Falsity requires the text or rules to rule it out. Permitted cases making it true and false show it is undetermined; personal expectations add no premise."
    }
  },
  {
    "question": {
      "zh": "词语类比只找意思相近的词吗？",
      "en": "Do analogies just ask for similar meanings?"
    },
    "answer": {
      "zh": "不只是。需保持题定关系与方向，分清部件、整体、制作者、材料和设备。两词有关联，仍可能与目标关系不符。",
      "en": "No. Preserve the specified relation and direction, distinguishing component, whole, maker, material and equipment. Association alone can fail to match the target relation."
    }
  },
  {
    "question": {
      "zh": "临时安排是否意味着之后一定改变？",
      "en": "Does a provisional arrangement have to change later?"
    },
    "answer": {
      "zh": "不意味着。它当前先采用并保留复核空间，之后可能调整也可能保留；临时和必然变更是不同主张。[4][10]",
      "en": "No. It is used for now and remains open to review, which may retain or revise it. Temporary use and inevitable change are different claims.[4][10]"
    }
  },
  {
    "question": {
      "zh": "一个平均数为什么不能说明每次都达标？",
      "en": "Why cannot a mean show that every observation met a limit?"
    },
    "answer": {
      "zh": "相同平均数可由不同明细得到。例如两次等待4与4、1与7都平均4分钟，只有前者每次不超过4分钟。需要个别明细才能判定。",
      "en": "Different observations can have the same mean. Waits of four and four or one and seven both average four minutes; only the first pair stays within four each time. Individual data are needed."
    }
  },
  {
    "question": {
      "zh": "13/24可以算招聘通过或某个能力等级吗？",
      "en": "Does thirteen out of twenty-four mean a hiring pass or ability level?"
    },
    "answer": {
      "zh": "不能。本题本未建立常模、招聘通过线或经验证能力档位；13只是在这24题答对13题。应结合分项和具体解析选复习内容。",
      "en": "No. This bank establishes no norms, hiring cutoff or validated ability tiers. Thirteen means thirteen matching answers on these items; use sections and explanations to choose review material."
    }
  },
  {
    "question": {
      "zh": "这里测试英语听力、口语、拼写或CEFR吗？",
      "en": "Does this assess listening, speaking, spelling or CEFR?"
    },
    "answer": {
      "zh": "不覆盖这些完整领域。本版以书面四选一练词义、关系与推论，没有听说任务或等级校准。英语界面也不能据此当英语综合水平认证。",
      "en": "No. Written four-choice items practise meanings, relationships and inference without spoken tasks or level calibration. The English interface does not make this comprehensive English certification."
    }
  },
  {
    "question": {
      "zh": "开始前要同意、注册或提交邮箱吗？",
      "en": "Must I agree, register or submit an email before starting?"
    },
    "answer": {
      "zh": "不需要。开始直接进入题目；全部答案、解析和四份完整指南免费，不要求账号、付款或先做其他测评。保存草稿为可选功能。",
      "en": "No. Start opens questions directly. All answers, explanations and four complete guides are free without an account, payment or prior assessment. Draft saving is optional."
    }
  }
];
