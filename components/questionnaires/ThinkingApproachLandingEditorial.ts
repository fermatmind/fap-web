import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Entry context; original scenarios and source-bound reports remain unchanged. */
export const thinkingApproachLandingSections: QuestionnaireSection[] = [
  {
    "id": "thinking-six-entrances",
    "title": {
      "zh": "六种思考入口分别指什么？同一任务可以有不同起点",
      "en": "What do the six thinking approaches mean? Different starts for the same task"
    },
    "paragraphs": [
      {
        "zh": "语句定框关注先命名、概括或写出一句说明；规则拆解关注先列条件、步骤关系与例外。准备一个展览入口时，前者可先说清访客可以做什么，后者可先核对进入与离开的条件。清楚的句子可能遗漏流程，完整的条件表也可能让人看不懂说明；两者是不同起点，都需要后续核对。",
        "en": "Verbal Framing starts with naming, summarising or writing an explanation. Rule Mapping starts with conditions, dependencies and exceptions. For an exhibition entrance, one might clarify what a visitor can do; the other might check entry and exit conditions. A clear sentence can omit a process, while a condition map can leave the explanation unclear. Both are starting points that require further checking."
      },
      {
        "zh": "声音节律关注声音、停顿、重音与先后；实作试探关注试摆、拼接或可撤回的小样。前者可帮助设想提示的节奏，但现场未必适合声音；后者可暴露纸上设想忽略的问题，但小样未必代表真实尺寸或完整条件。本次选得较多，不证明听觉、音乐、运动或动手能力更高。",
        "en": "Sound Sequencing concerns sound, pauses, emphasis and order. Hands-on Trial concerns trial arrangements, connections or reversible small versions. Sound may help imagine the timing of a cue, while being unsuitable for the setting. A small version can expose overlooked issues without representing full size or conditions. Choosing either more often establishes no auditory, musical, motor or practical ability advantage."
      },
      {
        "zh": "对话核对关注询问、复述与比较理解；环境线索关注光线、材质、场地和变化痕迹。问同伴怎么看，可以发现解释差异，但共识也可能共同遗漏事实；观察现场能补充条件，却仍需要检查推断。六种入口可以在一个任务中先后使用，本卷比较第一步，没有为其排出普遍有效性的等级。",
        "en": "Dialogue Testing concerns questions, restatement and comparing interpretations. Environmental Noticing concerns light, materials, location and traces of change. A conversation may reveal different interpretations while sharing an overlooked fact; inspecting the setting adds conditions without confirming every inference. The six can occur in sequence within one task. This quiz compares first steps, without ranking their general effectiveness."
      }
    ]
  },
  {
    "id": "thinking-count-example",
    "title": {
      "zh": "18次选择怎样计数？12次曝光与六项总和的区别",
      "en": "How are eighteen choices counted? Twelve exposures versus the sum of six counts"
    },
    "paragraphs": [
      {
        "zh": "每题提供四种起点，每次只给选中的入口加1，未选项不加也不扣；没有反向题。六种入口在整卷中各出现12次，各在A、B、C、D位置出现3次。完成后六项计数合计一定是18，每项范围0—12。均衡曝光说明安排了相同出现次数，不证明题目等难、统计独立或本题本已经完成效度验证。",
        "en": "Each item offers four starting points and gives one count only to the chosen approach, without subtracting from unchosen options or reversing items. Each approach appears twelve times overall and three times at each of positions A, B, C and D. The six counts sum to eighteen, with each between zero and twelve. Equal exposure does not establish equal difficulty, statistical independence or validation of this form."
      },
      {
        "zh": "例如六项按本页顺序为12、3、0、3、0、0，总和18，语句定框为本次唯一最高项。12表示它出现的12次都被选中，不是语言能力满分；0表示没有在这批选项中被优先选择，不是缺少某种智能。即使把6次除以12写成50%，也只是曝光内的选择比例，不是50%聪明、相似度或人群百分位。",
        "en": "For counts of12,3,0,3,0,0 in this page’s order, the sum is eighteen and Verbal Framing is the sole maximum. Twelve means selected at each of its twelve appearances, not full verbal ability. Zero means not prioritized among these options, not an absent intelligence. Dividing six choices by twelve to obtain fifty percent would describe selection per exposure, not intelligence, similarity or a population percentile."
      }
    ]
  },
  {
    "id": "thinking-tie-reading",
    "title": {
      "zh": "并列、近分与低次数怎样读？全部最高项都有全文",
      "en": "How should ties, close counts and low counts be read? Every maximum gets its guide"
    },
    "paragraphs": [
      {
        "zh": "全选A时六项各为3，系统呈现全部六份指南，不按名单顺序挑一个，也不指定主型与副型。六项同分只说明计数相同；它可以来自固定选项位置，因此不能认证六种能力均衡。公开指南始终可读，无需反复作答来解锁某一种结果。",
        "en": "Choosing A throughout gives three counts to each approach and all six guides, without a list-order winner or a primary and secondary type. Equal counts mean equal counts; a fixed response position can produce them, so they certify no balanced set of abilities. The public guides remain readable without repeated attempts to unlock one result."
      },
      {
        "zh": "最高为5、另一个为4时，本版保留实际计数，不把近分改成同分，也不宣称1次差异有显著性。可以同时阅读相邻入口，对照最近一次具体任务：为什么先选这一步，换一个任务会不会改变？低次数的做法也可能是重要的第二步，或因为本题给出的替代项更合意而少选。",
        "en": "When one count is five and another four, this edition preserves that difference without merging close counts or treating one choice as statistically meaningful. Compare nearby approaches against a recent task: why start there, and would another task change that? A less-chosen approach may be an important second step or simply appear beside an alternative you preferred."
      }
    ]
  },
  {
    "id": "thinking-theory-measurement",
    "title": {
      "zh": "多元智能理论、自报与能力测量，为什么要分开",
      "en": "Why distinguish multiple-intelligences theory, self-report and ability measurement?"
    },
    "paragraphs": [
      {
        "zh": "Gardner资源中心区分喜欢做什么、对什么感兴趣与完成相应信息处理的能力；他还提醒，自我描述需要与其他信息核对。[1] 他在2022年的文章中讨论了短问卷的局限，并把在多种活动里持续观察表现与单次自报区别开来。[2] 这些材料提供概念背景，不代表Gardner创作、认可或验证了本站六种入口。",
        "en": "Gardner’s resource center distinguishes preferences and interests from relevant processing capacities and advises checking self-description against other information.[1] His2022article discusses limits of short questionnaires and distinguishes observing performance across activities from self-report.[2] These sources provide conceptual background, not authorship, endorsement or validation of our six approaches."
      },
      {
        "zh": "本页18题没有标准答案、任务完成质量或速度的实测，也没有考察采用不同方法之后的学习结果。六类是本站为解释情境选择而写的编辑隐喻，与Gardner八领域、通用认知能力、IQ或某个商业量表不是同一测量。题本尚未建立自身信度、效度、常模或中英文测量等价性；可复算的计数只证明加法规则透明。",
        "en": "These eighteen items measure neither right-answer task performance, execution quality nor speed, and do not compare learning outcomes after different methods. The six editorial metaphors explain scenario choices; they are not Gardner’s eight domains, general cognitive ability, IQ or a commercial scale. Form-specific reliability, validity, norms and English–Chinese measurement equivalence are not established. Reproducible counts demonstrate transparent addition only."
      }
    ]
  },
  {
    "id": "thinking-learning-evidence",
    "title": {
      "zh": "喜欢一种起点，能否据此决定教学方法？",
      "en": "Does preferring a starting point determine the best teaching method?"
    },
    "paragraphs": [
      {
        "zh": "Pashler等（2008）指出，检验“按学习风格匹配教学更有效”，需要比较不同偏好者在不同教学方法下、面对同一结果测验时的交互作用；该综述未发现足以支持普遍采用这种匹配的证据。[3] 这不是说人没有偏好或能力差异，而是“愿意选什么”与“怎样教实际学得更好”需要不同证据。",
        "en": "Pashler et al.(2008) explain that validating instruction matched to learning styles requires an interaction: learners with different preferences doing better under different methods on a common outcome test. Their review found inadequate evidence for general adoption of such matching.[3] This does not deny preferences or ability differences. What someone chooses and which instruction improves learning require different evidence."
      },
      {
        "zh": "所以声音节律较高不意味着只能听讲，实作试探较高也不意味着不适合阅读。可以按内容安排例子、说明、练习与反馈，再看实际理解和完成情况；本卷没有比较这些教学组合。不要据次数给学生固定分组、削减学习机会、决定专业或把一个团队角色永久分给某人。",
        "en": "A higher Sound Sequencing count therefore does not require audio-only teaching, and more Hands-on Trial choices do not imply that reading is unsuitable. Examples, explanations, practice and feedback can be chosen for the content, followed by checking actual understanding and performance. This quiz does not compare those instructional combinations. Counts should not fix student groups, restrict opportunities, select majors or permanently assign team roles."
      }
    ]
  },
  {
    "id": "thinking-optional-task-review",
    "title": {
      "zh": "一次可选的任务回顾：先做什么，之后还需要什么",
      "en": "An optional task review: what to start with and what is still needed"
    },
    "paragraphs": [
      {
        "zh": "用一个低风险的小任务作例子，例如给临时物品架写归还提示。先选自己愿意试的入口，再补一项不同的信息：写一句提示后，请同伴复述；列了归类条件后，拿少量物品试摆；想了声音提示后，检查是否会打扰现场。记录安排是否更清楚、哪个假设没有成立，而不只寻找支持结果标签的证据。",
        "en": "Take a low-stakes task such as making a return cue for a temporary shelf. Begin with an approach you want to try, then add another source of information: ask someone to restate a written cue, try a few objects against grouping conditions, or check whether a sound would disturb the setting. Record whether the arrangement became clearer and which assumption failed, rather than looking only for confirmation of a label."
      },
      {
        "zh": "比较时保留任务目的、时间、材料、表达方式与他人参与的条件。不能实际发声或不方便实作，也不需要通过测试证明缺少能力；本题只要求设想。重测可看哪些具体选择和条件改变，不把次数差值当认知成长、教学效果或性格变化，也不从结果推算MBTI、EQ、IQ或职业适配。",
        "en": "Retain the task’s purpose, time, materials, communication format and others’ involvement when comparing approaches. Being unable to produce sound or make an object does not establish a missing ability; these questions ask only for imagined choices. A retake can identify changed responses and conditions, without treating count differences as cognitive growth, instructional effects or personality change, or converting them into MBTI, EQ, IQ or career fit."
      }
    ]
  }
];

export const thinkingApproachLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "六种入口与Gardner八种智能一一对应吗？",
      "en": "Do these six approaches map directly onto Gardner’s eight intelligences?"
    },
    "answer": {
      "zh": "没有一一换算。本站六类是原创任务起点隐喻；相近词语不证明测量相同能力，Gardner资源也不代表对本题本的认可。[1][2]",
      "en": "No. These six are original metaphors for task starts. Similar words establish no measurement equivalence, and Gardner’s resources do not endorse this form.[1][2]"
    }
  },
  {
    "question": {
      "zh": "一个入口出现12次，选中6次算50%智能吗？",
      "en": "Does choosing an approach six of twelve times mean fifty-percent intelligence?"
    },
    "answer": {
      "zh": "不是。12是选项出现次数，6/12仅为本题组曝光内选择比例，不是能力、匹配率或人群百分位。六项实际计数合计18。",
      "en": "No. Twelve is exposure count; six divided by twelve describes choices within this bank, not ability, matching accuracy or a population percentile. All six counts sum to eighteen."
    }
  },
  {
    "question": {
      "zh": "全选A为什么得到六份完整结果？",
      "en": "Why does choosing A throughout show six complete results?"
    },
    "answer": {
      "zh": "每种入口在A位置各出现3次，所以各得3次并列最高。全部保留，不按顺序破同分，也不据此认证六种能力均衡。",
      "en": "Each approach appears at position A three times, giving six tied counts of three. Every guide is retained without an order-based winner or a claim of balanced abilities."
    }
  },
  {
    "question": {
      "zh": "最高5次、另一项4次，需要把它们合并吗？",
      "en": "Should counts of five and four be merged?"
    },
    "answer": {
      "zh": "本版不合并，也没有经验证的显著差异阈值。保留计数，可将相近入口一起联系具体任务理解，不据1次差异判断谁更强。",
      "en": "This edition does not merge them and has no validated meaningful-difference threshold. Keep the counts and compare nearby approaches in actual tasks, without interpreting one extra choice as greater ability."
    }
  },
  {
    "question": {
      "zh": "声音或实作次数较高，是否只适合听讲或做中学？",
      "en": "Do more sound or practical choices mean I should learn only that way?"
    },
    "answer": {
      "zh": "不能据此限定。选择偏好没有比较不同教学方法的实际效果；按类型匹配教学需要对应实验，不能由本次计数推出。[3]",
      "en": "No such restriction follows. Choices do not compare outcomes under different instruction. Matching teaching to a type requires suitable experimental evidence that these counts do not provide.[3]"
    }
  },
  {
    "question": {
      "zh": "0次是不是没有这种思考能力？",
      "en": "Does a zero count mean I lack that ability?"
    },
    "answer": {
      "zh": "不是。它只说明这批四选一里没有先选该入口；它可能是你的第二步，或本题其他选项更合意。没有客观能力测量支持缺陷判断。",
      "en": "No. It means that approach was not selected first among these four-option items. It may be a second step, or another option may have fit better. No performance measure supports an ability-deficit inference."
    }
  },
  {
    "question": {
      "zh": "需要真的发声、做东西或让他人配合吗？",
      "en": "Must I produce sounds, make objects or involve someone else?"
    },
    "answer": {
      "zh": "不需要。题目只要求设想普通情境并选第一步，不收作品、声音或私人故事。现实活动条件与可及性也不能从计数推断。",
      "en": "No. Imagine ordinary situations and select a first step; no work sample, sound or private story is collected. Counts do not establish real-world access or activity conditions."
    }
  },
  {
    "question": {
      "zh": "开始会不会再弹出同意或付费解锁？",
      "en": "Does Start add another agreement or a paid result unlock?"
    },
    "answer": {
      "zh": "不会。开始直接进入18题；题目、六份指南及全部最高并列免费，无需注册或邮箱。临时保存须主动开启，也可以直接结束。",
      "en": "No. Start opens eighteen items directly. Questions, all six guides and every highest tie are free without signup or email. Temporary saving is opt-in, and you may finish here."
    }
  }
];
