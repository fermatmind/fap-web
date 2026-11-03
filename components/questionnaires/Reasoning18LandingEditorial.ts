import type { Questionnaire } from "@/lib/questionnaires/types";
export const reasoning18LandingSections: Questionnaire["guide"] = [
  {
    "id": "reasoning18-purpose",
    "title": {
      "en": "SHL-style and Korn Ferry-style practice: three reasoning methods",
      "zh": "SHL／Korn Ferry风格练习：三个推理方法"
    },
    "paragraphs": [
      {
        "en": "This independent learning edition contains eighteen original English questions: six passage decisions, six numerical problems and six logical or pattern tasks. It offers a fixed sequence, section-timed practice or untimed study, all answer explanations and three complete public learning guides. Chinese and English interfaces use the same English questions and options, with bilingual guidance.",
        "zh": "本独立学习版包括十八道原创英文题：六道阅读判断、六道数量问题，以及六道逻辑或规律题。提供固定顺序、分段计时或不计时学习、全部答案解析和三篇完整公开指南。中英文界面使用相同英文题干与选项，说明与解析为双语。"
      },
      {
        "en": "SHL and Korn Ferry name different assessment providers, not one universal examination. Here their names identify a preparation interest, not a licensed question bank or a reconstruction of a particular invitation. Use this page to rehearse evidence checking, calculation and rule testing; confirm the actual assessment name and format separately.",
        "zh": "SHL与Korn Ferry是不同测评提供方，不是一个统一考试。本页名称说明备考兴趣，不提供授权题库，也不重建某封测评邀请。可在这里练习核对证据、计算和检验规则；实际测评名称与形式仍需另行确认。"
      }
    ]
  },
  {
    "id": "reasoning18-verbal",
    "title": {
      "en": "Passage reasoning: supported, contradicted or not determined",
      "zh": "阅读推理：有据支持、与原文矛盾或无法确定"
    },
    "paragraphs": [
      {
        "en": "The first three passage items ask for True, False or Cannot say using only the supplied text. A claim that sounds plausible is not necessarily supported. Separate a direct contradiction from missing information, and pay attention to words such as only, all and before: reversing a condition can change the conclusion.",
        "zh": "前三道阅读题要求仅依所给短文选择True、False或Cannot say。听起来合理不代表有原文支持。应区分直接矛盾与信息缺失，并注意only、all、before等条件词；倒置条件会改变结论。"
      },
      {
        "en": "The other three passage items ask for the one supported conclusion or action among four choices. That is a different response instruction, not a fourth option added to True–False–Cannot say. For review, identify the exact sentence that warrants an answer and the extra assumption required by a tempting alternative; outside knowledge cannot fill the passage’s gaps.",
        "zh": "后三道阅读题要求在四个选项中选择唯一有依据的结论或行动。这是另一种答题指令，不是给True–False–Cannot say添加第四个选项。复盘时找出支持答案的具体句子，以及诱人错项额外依赖的假设；不能用常识填补原文空白。"
      }
    ]
  },
  {
    "id": "reasoning18-numerical",
    "title": {
      "en": "Numerical reasoning: choose the base, unit and operation",
      "zh": "数量推理：先确定基数、单位与运算"
    },
    "paragraphs": [
      {
        "en": "The six numerical questions cover percentage change, a mean across batches, successive changes, a stated currency conversion and fee, a share of a combined total, and distance from speed and time. Each task supplies its own fictional quantities and assumptions. Start by writing what the question asks and which denominator or unit the answer requires.",
        "zh": "六道数量题覆盖百分比变化、批次平均数、连续变化、明示汇率与费用、合计中的占比，以及速度和时间求距离。每题给出自己的虚构数量与假设。先写清所求是什么，以及答案需要哪个分母和单位。"
      },
      {
        "en": "For a fresh example, a count rising from 80 to 100 increases by (100 − 80) ÷ 80 = 25%, while 100 is 55.6% of their combined 180 after rounding. These answer different questions. A 10% decrease followed by a 10% increase multiplies by 0.9 × 1.1 = 0.99, not 1.00. Record the setup before using a calculator.",
        "zh": "另举新例：数量从80增至100，增幅为（100−80）÷80＝25%；100占两者合计180的约55.6%。两者回答不同问题。先降10%再升10%应乘0.9×1.1＝0.99，而非1.00。使用计算器前也应先写好运算关系。"
      }
    ]
  },
  {
    "id": "reasoning18-logical",
    "title": {
      "en": "Logical and pattern reasoning: test the stated rule family",
      "zh": "逻辑与规律推理：检验题目限定的规则族"
    },
    "paragraphs": [
      {
        "en": "This section includes changing differences, interleaved sequences, independent letter and number changes, a limited operation choice, ordering constraints and repeating cycles. The stems specify the allowable rule family. Test one candidate against every displayed transition or constraint instead of choosing an option because it fits the final pair alone.",
        "zh": "本段包含变化差值、交错数列、字母与数字独立变化、限定运算选择、排序条件与重复周期。题干规定允许的规则族。应对照所有已显示的转移或约束检验候选规则，不能仅因它适合最后一对就选定。"
      },
      {
        "en": "As a separate example, if letters repeat A, B and numbers repeat 1, 2, 3 independently, the full pair repeats after six positions. Tracking each cycle separately is more reliable than inventing an irregular combined rule. A finite sequence outside a specified rule family can admit many continuations; these tasks teach checking constraints, not discovering an inevitable hidden law.",
        "zh": "另举例：字母独立重复A、B，数字独立重复1、2、3，整对符号经过六个位置才重复。分别追踪周期，比编造不规则组合规则更便于核查。若不限定规则族，有限数列可能有许多延续；这些题练的是检验条件，不是发现必然隐藏定律。"
      }
    ]
  },
  {
    "id": "reasoning18-timing",
    "title": {
      "en": "Two practice modes: three explicit starts and twelve active minutes",
      "zh": "两种练习方式：三次明确开始与十二分钟活动计时"
    },
    "paragraphs": [
      {
        "en": "Timed mode allows 3:00 for passage reasoning, 5:00 for numerical reasoning and 4:00 for logical reasoning. These are site-selected caps for six questions per part. The first Start test opens the first question and begins its clock directly; the second and third parts each wait for their own Start this part action. Background tabs do not pause an active part.",
        "zh": "计时模式为阅读3:00、数量5:00、逻辑4:00，均为本站给每段六题选定的上限。首次点击开始测试直接进入第一题并开始计时；第二、三段分别等待点击开始本部分。已开始的部分切至后台也不暂停。"
      },
      {
        "en": "In untimed study the same bank has no deadline. Within an open part you may go back and change a choice or finish early with blanks; a closed part cannot be reopened. At expiry it locks and keeps blanks unanswered. Detected device-clock inconsistency clears the attempt rather than issuing a timed result. The approximate sixteen-minute estimate includes reading instructions, not a further four-minute deadline.",
        "zh": "不计时学习使用同一题本，没有截止时间。当前部分内可返回改选，也可带空白提前结束；关闭的部分不能重开。到时会锁定，空白仍记未答。检测到设备时钟不一致会清除本次，不生成计时结果。约十六分钟含阅读说明，不另设四分钟截止。"
      }
    ]
  },
  {
    "id": "reasoning18-readout",
    "title": {
      "en": "Read correct, wrong and unanswered as three raw records",
      "zh": "把正确、错误与未答作为三种原始记录阅读"
    },
    "paragraphs": [
      {
        "en": "Every offered correct choice adds one correct; another offered choice adds one wrong; a blank or explicit skip adds one unanswered. The three counts sum to six in each part and eighteen overall. For example, one part may show 3 correct, 1 wrong and 2 unanswered. This is a record of these six attempts, not a calibrated ability score or a pass decision.",
        "zh": "每个正确选项计一次正确，其他给定选项计一次错误，空白或明确跳过计一次未答。每段三数合六，总体合十八。例如某段为3正确、1错误、2未答，记录的是这六题作答，不是经校准的能力分或通过判定。"
      },
      {
        "en": "No speed bonus, guessing correction, weighted ability composite, percentile or employer cutoff is calculated. The parts have not been equated, and some passage items offer three choices while others offer four. A smaller correct count cannot by itself identify your weakest ability. Timing, familiarity, English comprehension and task difficulty all matter to interpreting the exercise.",
        "zh": "不计算速度奖励、猜测修正、加权能力综合分、百分位或雇主门槛。各段未做难度等值，阅读题中三选一与四选一并存。仅凭较少正确数不能认定最弱能力；计时、熟悉程度、英文理解与题目难度均需纳入解释。"
      }
    ]
  },
  {
    "id": "reasoning18-review",
    "title": {
      "en": "Review the first error, then build a fresh example",
      "zh": "从第一处错误复盘，再构造新例"
    },
    "paragraphs": [
      {
        "en": "After all three parts close, every question shows the selected answer or blank, the correct answer and a full bilingual explanation. All three complete guides are also readable before answering. Review the first unsupported inference, wrong denominator, unit mismatch or broken rule in your workings rather than only memorizing the answer letter.",
        "zh": "三段全部结束后，每题展示所选或空白、正确答案与完整双语解析。三篇完整指南在作答前也可阅读。应复盘过程中第一处无据推论、分母错误、单位不一致或规则违背，而不只背答案字母。"
      },
      {
        "en": "Change the numbers or wording to make a genuinely new example and check it independently. Repeating this fixed bank can improve recognition of its answers; a higher repeat count does not isolate transferable learning. Record whether you used timed or study mode and what help you used if you want to compare your own practice conditions.",
        "zh": "改变数字或表述构造真正的新例，并独立核对。重做固定题本可能提高对答案的识别，正确数上升不能单独证明迁移学习。若想比较自己的练习条件，可以自行记下计时或学习模式，以及使用了哪些帮助。"
      }
    ]
  },
  {
    "id": "reasoning18-provider",
    "title": {
      "en": "Prepare for your actual invitation: format, access and permitted help",
      "zh": "针对实际邀请准备：形式、无障碍与允许帮助"
    },
    "paragraphs": [
      {
        "en": "Current SHL candidate resources distinguish interactive and standard multiple-choice practice, while Korn Ferry’s candidate page provides verbal, numerical, logical and checking preparation. This edition covers only its stated three areas and uses ordinary choices, not drag-and-drop or adaptive item selection. Its linked 2018 and 2021 documents remain dated background, not proof of one universal current format.",
        "zh": "当前SHL候选人资源区分交互式与标准选择题练习，Korn Ferry候选人页面提供言语、数量、逻辑与信息核对准备。本版只覆盖已说明的三个领域，使用普通选择题，没有拖放或自适应选题。所引2018与2021年文档仍是具日期的背景，不能证明当前统一题式。"
      },
      {
        "en": "Before a real assessment, check the invitation and provider instructions for the exact test, device, time limits, calculator or paper policy, accessibility adjustments and support contact. Do not assume the rules of this local exercise apply. Responses here remain in current-page memory and public sharing contains no answers or counts. No result predicts selection, verifies job suitability or certifies performance under an employer’s conditions.",
        "zh": "真实测评前，按邀请与提供方说明核对具体测试、设备、时限、计算器或纸笔政策、无障碍调整及支持联系。不能假定本地练习规则适用于正式测评。这里的回答只留当前页面内存，公开分享不含答案或数量。结果不预测录用、不验证岗位适任，也不认证雇主条件下的表现。"
      }
    ]
  }
];
export const reasoning18LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Which reasoning skills can I practise here?",
      "zh": "这里可以练哪些推理方法？"
    },
    "answer": {
      "en": "The eighteen original questions cover passage-supported decisions, numerical operations and constrained logical patterns. Each area has six questions, full explanations and its own complete guide. This is a learning bank rather than an official ability measurement.",
      "zh": "十八道原创题覆盖依短文作判断、数量运算与限定条件的逻辑规律。每领域六题，均有完整解析和独立完整指南。这是学习题本，不是正式能力测量。"
    }
  },
  {
    "question": {
      "en": "Does Cannot say mean a statement is false?",
      "zh": "Cannot say就是陈述错误吗？"
    },
    "answer": {
      "en": "No. False requires a contradiction with the supplied passage. Cannot say means the passage does not determine the claim. A plausible claim can remain undetermined; outside assumptions should not decide it. The later four-choice passage tasks instead ask for the one supported conclusion or action.",
      "zh": "不是。False要求与所给短文矛盾，Cannot say表示短文不能确定该陈述。合理的说法也可能无法确定，不能靠外部假设决定。后面的四选一阅读题改为选择唯一被支持的结论或行动。"
    }
  },
  {
    "question": {
      "en": "Is this practice adaptive like some provider assessments?",
      "zh": "本练习会像某些提供方测评那样自适应吗？"
    },
    "answer": {
      "en": "No. Both modes use the same fixed eighteen questions. Difficulty does not change in response to your choices. Provider product names cover different versions; check your exact invitation rather than inferring its selection algorithm from this practice.",
      "zh": "不会。两种模式均使用相同固定十八题，难度不随选择变化。提供方名称涵盖不同版本，应核对实际邀请，不从本练习推断其选题算法。"
    }
  },
  {
    "question": {
      "en": "Can I begin without a consent gate?",
      "zh": "可以不经过同意关卡直接开始吗？"
    },
    "answer": {
      "en": "Yes. Timed mode is initially selected; you may choose untimed study first. Start test then opens question one immediately. There is no required agreement or activity-counting checkbox. Each later part has an explicit start so its clock does not run while you read between parts.",
      "zh": "可以。默认选中计时模式，也可先选不计时学习，然后点击开始测试直接进入第一题。没有必选同意或使用计数复选框。后续每部分需明确开始，避免段间阅读时计时。"
    }
  },
  {
    "question": {
      "en": "What happens when a section expires?",
      "zh": "一部分到时会怎样？"
    },
    "answer": {
      "en": "The current part closes, preserves recorded choices and counts remaining blanks as unanswered. You cannot reopen it. The next part waits for your start. An active clock continues in a background tab; it is not a pause feature.",
      "zh": "当前部分关闭，保留已记录选项，其余空白计未答，不能重开。下一部分等待你开始。活动计时在后台标签页继续，不提供暂停。"
    }
  },
  {
    "question": {
      "en": "Can the smallest raw score diagnose a weak ability?",
      "zh": "最低原始正确数能诊断能力弱项吗？"
    },
    "answer": {
      "en": "No. Six-question parts differ in content, difficulty, option count and timing and have not been equated. Use the explanations to locate specific reasoning errors. The page gives raw correct, wrong and unanswered counts, not an ability ranking or a diagnostic profile.",
      "zh": "不能。六题段在内容、难度、选项数和时限上有差异，未经等值。应借解析定位具体推理错误。本页提供正确、错误与未答原始计数，不生成能力排名或诊断画像。"
    }
  },
  {
    "question": {
      "en": "Are the Chinese questions translated from English?",
      "zh": "中文界面会翻译题干吗？"
    },
    "answer": {
      "en": "No. The same English stems and answer options appear in both interfaces. Navigation, explanations and complete guides are bilingual. This preserves the authored tasks; it does not establish equivalence between English-language proficiency or provider tests.",
      "zh": "不会。两种界面均展示同一英文题干与选项，导航、解析和完整指南为双语。这样保留原编写任务，不证明英语熟练程度等值，也不证明与提供方测试等值。"
    }
  },
  {
    "question": {
      "en": "Does repeating this bank prove I will pass my assessment?",
      "zh": "反复做对能证明正式测评会通过吗？"
    },
    "answer": {
      "en": "No. Recognition of fixed questions, changed conditions and learning can all affect repeated counts. Practise applying a method to fresh tasks, then follow the provider’s own preparation. This bank supplies no pass probability, selection prediction or hiring guarantee.",
      "zh": "不能。固定题目的识别、条件变化与学习均会影响重测计数。应练习把方法用于新任务，再按提供方说明准备。本题本不提供通过概率、录用预测或招聘保证。"
    }
  }
];

export const reasoning18LandingReferences = [
  { title: { en: "SHL candidate practice: interactive and multiple-choice formats", zh: "SHL候选人练习：交互式与选择题形式" }, url: "https://www.shlglobal.cn/en/shldirect/en/practice-tests/" },
  { title: { en: "Korn Ferry current candidate guide and practice areas", zh: "Korn Ferry当前候选人指南与练习领域" }, url: "https://www.kornferry.com/careers/candidates/candidate-guide-assessments" },
];
